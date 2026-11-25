(() => {
'use strict';
const app = window.alrimSync;
if (!app) return;
const teacher = location.pathname.endsWith('/teacher.html');
const endpoint = 'https://api.github.com/repos/smartfinger1103/alrim/contents/data/homework.json';
const dataUrl = new URL('data/homework.json', location.href);
const roster = { gyumin: '김규민', sua: '조수아', hyena: '유혜나' };
const status = document.createElement('p');
status.className = 'hint';
status.setAttribute('role', 'status');
const decode = value => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g,'')), c => c.charCodeAt(0))));
const encode = value => { let s=''; for(const b of new TextEncoder().encode(JSON.stringify(value))) s+=String.fromCharCode(b); return btoa(s); };
function validate(body) {
  for (const [id,name] of Object.entries(roster)) {
    const s=body.students && body.students[id], d=s && JSON.parse(s.data);
    if (!s) { if (!teacher && location.pathname.split('/').pop().replace('.html','')===id) throw new Error('과제 자료 형식이 맞지 않아요.'); continue; }
    if (!d || s.fixed!==name || !d.students.some(x=>x.name===name)) throw new Error('과제 자료 형식이 맞지 않아요.');
  }
  return body;
}
if (!teacher) {
  const id=location.pathname.split('/').pop().replace('.html','');
  document.getElementById('studentView').append(status);
  let last=JSON.parse(document.getElementById('seed').textContent).updated, busy=false;
  async function refresh() {
    if (busy || document.hidden) return;
    busy=true;
    try {
      let body;
      try {
        const response=await fetch(dataUrl.href+'?t='+Date.now(), {cache:'no-store'});
        if (!response.ok) throw new Error();
        body=validate(await response.json());
      } catch (_) {
        const response=await fetch(endpoint+'?ref=main&t='+Date.now(), {cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
        if (!response.ok) throw new Error();
        body=validate(decode((await response.json()).content));
      }
      const seed=body.students[id];
      if(seed.updated!==last) { app.receive(seed); last=seed.updated; window.alrimBase=seed.updated; }
      status.textContent='최신 과제를 확인했어요. · 1분마다 자동 확인';
    } catch (_) { status.textContent='최신 과제를 불러오지 못했어요. 현재 표시된 과제를 유지하고 다시 연결할게요.'; }
    finally { busy=false; }
  }
  refresh(); setInterval(refresh,60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden) refresh();});
  return;
}
document.title='교사용 알림장';
const panel=document.createElement('section'); panel.className='step';
panel.innerHTML='<h2>학생 링크에 과제 저장</h2><p class="hint">여기서 수정하고 저장하면 학생의 휴대폰 링크에 반영돼요. 게시까지 보통 몇 분 걸릴 수 있어요.</p><details><summary>처음 한 번: GitHub 저장 권한 준비</summary><p>GitHub에서 이 저장소만 선택한 Fine-grained personal access token을 만드세요. Repository access: Only select repositories → alrim, Repository permissions: Contents → Read and write로 설정하세요. 유효 기간이 끝나면 새로 연결하면 됩니다.</p><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub 권한 만들기</a><p class="hint">아래 입력란에 넣으세요. 권한 값은 이 브라우저에 저장되어 다음 접속 때 자동으로 연결돼요. 연결 해제를 누르면 삭제돼요.</p></details><label>GitHub 저장 권한<input id="githubToken" type="password" autocomplete="off" spellcheck="false" placeholder="GitHub에서 만든 권한 값"></label>';
panel.append(status);
const tokenInput=panel.querySelector('#githubToken');
const tokenKey='alrim:github-save-token';
const tokenStatus=document.createElement('p'); tokenStatus.className='hint';
function rememberToken() {
  try {
    const value=tokenInput.value.trim();
    if(value) localStorage.setItem(tokenKey,value); else localStorage.removeItem(tokenKey);
    tokenStatus.textContent=value?'이 브라우저에 저장했어요. 다음 접속 때 자동으로 불러와요.':'GitHub 저장 권한을 입력하면 이 브라우저에 기억해요.';
  } catch (_) { tokenStatus.textContent='브라우저가 저장을 차단했어요. 일반 창에서 저장을 허용해 주세요.'; }
}
try { tokenInput.value=localStorage.getItem(tokenKey)||''; } catch (_) {}
tokenInput.addEventListener('input',rememberToken);
const disconnect=document.createElement('button'); disconnect.type='button'; disconnect.textContent='GitHub 연결 해제';
disconnect.onclick=()=>{tokenInput.value='';rememberToken();tokenInput.focus();};
panel.append(tokenStatus,disconnect); rememberToken();

{ const dt=document.createElement('details'); const sm=document.createElement('summary'); sm.textContent='⚙ GitHub 저장 연결 (처음 한 번만 설정 · 평소엔 안 열어도 돼요)'; sm.style.cssText='cursor:pointer;font-weight:600'; dt.append(sm); [...panel.childNodes].forEach(n=>{ if(n!==dt) { if(n.tagName==='H2') n.remove(); else dt.append(n); } }); panel.append(dt); }
document.querySelector('#teacherView .steps').append(panel);
const publish=document.getElementById('publish');
publish.textContent='두 학생 과제 저장하기';
document.getElementById('exportOne').hidden=true;
document.getElementById('exportMsg').textContent='학생 파일을 다시 내려받거나 올리지 않아도 돼요. 위 저장 버튼을 사용하세요.';
const oldStatus=document.getElementById('pubStatus');
let sha=null, ready=false, dirty=false, saving=false;
document.getElementById('teacherView').addEventListener('input',e=>{if(e.target.id!=='githubToken') dirty=true;});
function combine(body) {
  const seeds=Object.values(body.students), result={...seeds[0],fixed:'',updated:seeds.map(x=>x.updated).sort().pop()};
  const d={students:[],entries:[],miss:{},notes:[]},words={},notesData={};
  for(const s of seeds) {
    const one=JSON.parse(s.data); d.students.push(...one.students);
    d.entries.push(...one.entries); Object.assign(d.miss,one.miss||{});
    d.notes.push(...(one.notes||[])); Object.assign(words,JSON.parse(s.words||'{}')); Object.assign(notesData,s.notesData||{});
  }
  d.entries=[...new Map(d.entries.map(x=>[x.id,x])).values()];
  return {...result,data:JSON.stringify(d),words:JSON.stringify(words),notesData};
}
async function readRemote() {
  const tk=(document.getElementById('githubToken')||{}).value||'', h={Accept:'application/vnd.github+json'}; if(tk.trim()) h.Authorization='Bearer '+tk.trim();
  try {
    let response=await fetch(endpoint+'?ref=main&t='+Date.now(),{cache:'no-store',headers:h});
    if(!response.ok && h.Authorization) response=await fetch(endpoint+'?ref=main&t='+Date.now(),{cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
    if(!response.ok) throw new Error();
    const file=await response.json(); sha=file.sha; return validate(decode(file.content));
  } catch(_) { /* GitHub 조회 한도(시간당 60번)를 넘으면 게시된 사본에서 읽어요 */
    const response=await fetch(dataUrl.href+'?t='+Date.now(),{cache:'no-store'});
    if(!response.ok) throw new Error('과제를 불러오지 못했어요. 잠시 후 새로고침해 주세요.');
    return validate(await response.json());
  }
}
/* 화면 맨 위 띠: 저장소에 올라가 있는 과제의 날짜를 보여 주고, 한 번에 다시 불러올 수 있어요 */
const bar=document.createElement('div'); bar.id='ghBar'; bar.style.cssText='position:sticky;top:0;z-index:60;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:6px 12px;background:#fffbe6;border-bottom:1.5px solid #e2c044;font-size:.92rem';
const barTx=document.createElement('span'); const barBt=document.createElement('button'); barBt.type='button'; barBt.textContent='🔄 저장소에서 다시 불러오기'; barBt.style.cssText='padding:4px 10px;border-radius:8px;border:1.5px solid #b08900;background:#fff;cursor:pointer;font:inherit';
bar.append(barTx,barBt); document.getElementById('teacherView').prepend(bar);
const kt=iso=>{ try{ const d=new Date(iso); return (d.getMonth()+1)+'/'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }catch(_){ return '?'; } };
function barShow(body,note){ const last=id=>{ try{ const ds=JSON.parse(body.students[id].data).entries.map(e=>e.date).sort(); const t=ds.pop(); return t?(+t.slice(5,7))+'/'+(+t.slice(8,10)):'-'; }catch(_){ return '-'; } };
  barTx.textContent='저장소 과제 · '+Object.entries(roster).map(([id,name])=>name.slice(1)+' 마지막 과제 '+last(id)+' (저장 '+kt(body.students[id].updated)+')').join(' · ')+(note?' · '+note:''); }
let fromPages=false;
async function loadRemote(force){
  const body=await readRemote(), seed=combine(body);
  let draft=null; try {draft=JSON.parse(localStorage.getItem('alrim2:draft'));}catch(_){}
  /* 이 기기에서 고치던 내용(임시저장)은 ① 지금 저장소 내용 위에서 고친 것이거나 ② 저장소 사본이 아직 예전 것일 때(방금 저장했는데 게시가 덜 됨)만 살려요. 그 밖에는 저장소 내용을 불러와요. */
  const v2=draft && draft.v===2 && draft.base;
  const keep=!force && v2 && ((draft.base===seed.updated && draft.savedAt>seed.updated) || draft.base>seed.updated);
  let note='';
  if(keep){ note=draft.base>seed.updated?'⚠ 저장소 사본이 아직 예전 내용이라 이 기기의 최신 내용을 보여 줘요':'이 기기에서 고치던 내용을 이어서 보여 줘요 (아직 안 올림)'; if(draft.base<=seed.updated) window.alrimBase=seed.updated; else window.alrimBase=draft.base; }
  else { if(force){ try{ localStorage.removeItem('alrim2:draft'); }catch(_){} } app.receive(seed); dirty=false; window.alrimBase=seed.updated; note='저장소 내용을 불러왔어요'; }
  /* 이 기기가 전에 본 것보다 예전 내용이 오면(게시가 덜 됨) 알려 주고 30초 뒤 다시 읽어요 */
  try{ const seen=localStorage.getItem('alrim2:seen')||''; if(seed.updated<seen && !keep){ note='⚠ 저장소 사본이 아직 예전 내용이에요. 30초 뒤 자동으로 다시 불러와요'; if(!dirty) setTimeout(()=>{ if(!dirty) loadRemote(false).catch(()=>{}); },30000); } else if(seed.updated>seen) localStorage.setItem('alrim2:seen',seed.updated); }catch(_){}
  barShow(body,note);
  ready=true; status.textContent='과제 연결 완료. 수정 후 GitHub 저장 권한을 입력하고 저장하세요.';
}
loadRemote(false).catch(e=>{status.textContent=e.message; barTx.textContent='⚠ 저장소 과제를 불러오지 못했어요: '+e.message;});
barBt.onclick=()=>{ if(dirty && !confirm('아직 올리지 않은 수정이 있으면 사라져요. 저장소 내용으로 다시 불러올까요?')) return; barBt.disabled=true; barTx.textContent='불러오는 중…'; loadRemote(true).catch(e=>{barTx.textContent='⚠ 불러오지 못했어요: '+e.message;}).finally(()=>{barBt.disabled=false;}); };
async function save(only){
  if(saving)return;
  if(!ready){status.textContent='아직 과제를 불러오지 못했어요. 새로고침해 주세요.';return;}
  const token=document.getElementById('githubToken').value.trim();
  if(!token){status.textContent='처음 한 번 GitHub 저장 권한을 만들어 위 입력란에 넣어 주세요.';document.getElementById('githubToken').focus();return;}
  const snap=app.snapshot(), d=JSON.parse(snap.data), words=JSON.parse(snap.words||'{}'), students={};
  for(const [id,name] of Object.entries(roster)){
    if(!d.students.some(x=>x.name===name)){status.textContent=name+' 학생이 목록에 없어요. 학생을 복원한 후 저장해 주세요.';return;}
    students[id]={...snap,fixed:name,updated:new Date().toISOString(),
      data:JSON.stringify({students:d.students.filter(x=>x.name===name),entries:d.entries.filter(x=>!x.who||x.who===name),miss:{[name]:(d.miss||{})[name]||{}},notes:(d.notes||[]).filter(x=>!x.who||x.who===name)}),
      words:JSON.stringify(Object.fromEntries(Object.entries(words).filter(([key])=>!key||key===name))),
      notesData:(JSON.parse(document.getElementById('seed').textContent).notesData||{})};
  }
  const label=only?roster[only]+' 과제':'두 학생 과제';
  saving=true;publish.disabled=true;status.textContent=oldStatus.textContent=label+'를 저장하는 중…';
  try {
    let out=students;
    if(only){ /* 한 학생만: 저장본을 새로 읽어 그 학생 것만 바꿔 넣어요 */
      const r=await fetch(endpoint+'?ref=main&t='+Date.now(),{cache:'no-store',headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token}});
      if(!r.ok) throw new Error('저장본을 불러오지 못했어요. 잠시 후 다시 눌러 주세요.');
      const file=await r.json(); sha=file.sha; const body=validate(decode(file.content));
      out={...body.students,[only]:students[only]};
    }
    const response=await fetch(endpoint,{method:'PUT',headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({message:'교사 앱에서 '+label+' 업데이트',content:encode({version:1,students:out}),sha,branch:'main'})});
    if(!response.ok) {
      if(response.status===409||response.status===422)throw new Error('다른 곳에서 과제가 바뀌었어요. 작성 내용을 복사해 둔 뒤 새로고침하고 다시 저장해 주세요.');
      if(response.status===401||response.status===403)throw new Error('GitHub 권한을 확인해 주세요. alrim 저장소의 Contents 읽기·쓰기 권한이 필요해요.');
      throw new Error('저장하지 못했어요. 연결을 확인하고 다시 눌러 주세요.');
    }
    const result=await response.json();sha=result.content.sha;if(!only)dirty=false;window.alrimBase=Object.values(out).map(x=>x.updated).sort().pop();try{ localStorage.setItem('alrim2:seen',window.alrimBase); barShow({students:out},'방금 저장했어요'); }catch(_){}
    status.textContent=oldStatus.textContent='✅ '+label+'를 GitHub에 저장했어요. 게시가 끝나면 학생 링크에 자동 반영돼요. 보통 몇 분 걸릴 수 있어요.';
  }catch(e){status.textContent=oldStatus.textContent=e.message;}
  finally{saving=false;publish.disabled=false;}
}
publish.onclick=()=>save(null);
window.alrimSaveOne=async id=>{await save(id);return status.textContent;};
})();

