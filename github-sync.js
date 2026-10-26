(() => {
'use strict';
const app = window.alrimSync;
if (!app) return;
const teacher = location.pathname.endsWith('/teacher.html');
const endpoint = 'https://api.github.com/repos/smartfinger1103/alrim/contents/data/homework.json';
const dataUrl = new URL('data/homework.json', location.href);
const roster = { gyumin: '김규민', sua: '조수아' };
const status = document.createElement('p');
status.className = 'hint';
status.setAttribute('role', 'status');
const decode = value => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g,'')), c => c.charCodeAt(0))));
const encode = value => { let s=''; for(const b of new TextEncoder().encode(JSON.stringify(value))) s+=String.fromCharCode(b); return btoa(s); };
function validate(body) {
  for (const [id,name] of Object.entries(roster)) {
    const s=body.students && body.students[id], d=s && JSON.parse(s.data);
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
      const response=await fetch(dataUrl.href+'?t='+Date.now(), {cache:'no-store'});
      if (!response.ok) throw new Error();
      const body=validate(await response.json()), seed=body.students[id];
      if(seed.updated!==last) { app.receive(seed); last=seed.updated; }
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
panel.innerHTML='<h2>학생 링크에 과제 저장</h2><p class="hint">여기서 수정하고 저장하면 두 학생의 휴대폰 링크에 반영돼요. 게시까지 보통 몇 분 걸릴 수 있어요.</p><details><summary>처음 한 번: GitHub 저장 권한 준비</summary><p>GitHub에서 이 저장소만 선택한 Fine-grained personal access token을 만드세요. Repository access: Only select repositories → alrim, Repository permissions: Contents → Read and write로 설정하세요. 유효 기간이 끝나면 새로 연결하면 됩니다.</p><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub 권한 만들기</a><p class="hint">아래 입력란에 넣으세요. 권한 값은 GitHub에 저장할 때만 전송되며 이 탭을 닫으면 사라져요.</p></details><label>GitHub 저장 권한<input id="githubToken" type="password" autocomplete="off" spellcheck="false" placeholder="GitHub에서 만든 권한 값"></label>';
panel.append(status);
document.querySelector('#teacherView .steps').prepend(panel);
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
  const response=await fetch(endpoint+'?ref=main&t='+Date.now(),{cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
  if(!response.ok) throw new Error('과제를 불러오지 못했어요. 잠시 후 새로고침해 주세요.');
  const file=await response.json(); sha=file.sha; return validate(decode(file.content));
}
readRemote().then(body=>{
  const seed=combine(body);
  let draft=null; try {draft=JSON.parse(localStorage.getItem('alrim2:draft'));}catch(_){}
  if(!dirty && !(draft && draft.savedAt>seed.updated)) app.receive(seed);
  ready=true; status.textContent='과제 연결 완료. 수정 후 GitHub 저장 권한을 입력하고 저장하세요.';
}).catch(e=>{status.textContent=e.message;});
publish.onclick=async()=>{
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
  saving=true;publish.disabled=true;status.textContent='학생 과제를 저장하는 중…';
  try {
    const response=await fetch(endpoint,{method:'PUT',headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({message:'교사 앱에서 학생 과제 업데이트',content:encode({version:1,students}),sha,branch:'main'})});
    if(!response.ok) {
      if(response.status===409||response.status===422)throw new Error('다른 곳에서 과제가 바뀌었어요. 작성 내용을 복사해 둔 뒤 새로고침하고 다시 저장해 주세요.');
      if(response.status===401||response.status===403)throw new Error('GitHub 권한을 확인해 주세요. alrim 저장소의 Contents 읽기·쓰기 권한이 필요해요.');
      throw new Error('저장하지 못했어요. 연결을 확인하고 다시 눌러 주세요.');
    }
    const result=await response.json();sha=result.content.sha;dirty=false;
    status.textContent=oldStatus.textContent='GitHub에 저장했어요. 게시가 끝나면 학생 링크에 자동 반영돼요. 보통 몇 분 걸릴 수 있어요.';
  }catch(e){status.textContent=oldStatus.textContent=e.message;}
  finally{saving=false;publish.disabled=false;}
};
})();
