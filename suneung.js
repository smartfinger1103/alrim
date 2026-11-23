/* 수능 도우미 (track: 'suneung' 학생 화면에만 보여요): D-day · 매일 과제 · 과목별 공부 시간 · 독해 타이머 · 모의고사 성적 · 듣기 속도 */
/* 독해 캡처 문제 풀기 (모든 학생·선생님 미리보기): 지문 그림 → 답 고르기 → 맞으면 다음, 틀리면 해설과 오답 이유. 시간은 조용히 재요 */
(() => {
  const C = ['①', '②', '③', '④', '⑤'], WHY = ['단어를 몰라서', '해석이 안 돼서', '선지가 헷갈려서', '시간이 부족해서'];
  const el = (t, css, txt) => { const e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };
  const img = (p) => { const im = el('img', 'max-width:100%;border-radius:8px;background:#fff;border:1px solid #ddd'); im.alt = '지문'; im.onerror = () => { if (im.dataset.raw) return; im.dataset.raw = 1; im.src = 'https://raw.githubusercontent.com/smartfinger1103/alrim/main/' + p + '?t=' + Date.now(); }; im.src = /^data:|^https?:/.test(p) ? p : new URL(p, location.href).href; return im; };
  const imgs = (q) => { const w = el('div', 'display:flex;flex-direction:column;gap:6px'); (Array.isArray(q) ? q : [q]).forEach(p => w.append(img(p))); return w; };
  const B = 'font:inherit;border-radius:12px;border:1.5px solid #4f46e5;background:#fff;color:#111;cursor:pointer;';
  window.alrimOpenRd = (it) => { const Q = (it.rd || []).filter(x => x && x.q); if (!Q.length) return;
    const ov = el('div', 'position:fixed;inset:0;z-index:10045;background:rgba(15,23,42,.92);overflow:auto;padding:10px'), bx = el('div', 'max-width:760px;margin:0 auto;background:#fff;color:#111;border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:10px'); ov.append(bx); document.body.append(ov);
    const log = []; let i = 0, t0 = Date.now();
    const close = () => ov.remove();
    const head = (t) => { const h = el('div', 'display:flex;justify-content:space-between;align-items:center;gap:8px'); const x = el('button', B + 'padding:6px 12px', '닫기 ✕'); x.type = 'button'; x.onclick = close; h.append(el('b', 'font-size:1.1rem', t), x); return h; };
    const next = () => { i++; t0 = Date.now(); i < Q.length ? ask() : end(); };
    const ask = () => { bx.textContent = ''; const q = Q[i]; bx.append(head('📖 ' + (i + 1) + ' / ' + Q.length + (q.lab ? ' · ' + q.lab : '')), imgs(q.q));
      if (q.sub) bx.append(el('div', 'font-weight:700;color:#4f46e5', q.sub));
      const row = el('div', 'display:grid;grid-template-columns:repeat(5,1fr);gap:6px;position:sticky;bottom:0;background:#fff;padding:6px 0');
      C.forEach((c, k) => { const b = el('button', B + 'padding:12px 0;font-size:1.4rem', c); b.type = 'button'; b.onclick = () => { const s = (Date.now() - t0) / 1000, ok = !q.a || k + 1 === +q.a;
          if (ok) { b.style.background = '#15803d'; b.style.color = '#fff'; log.push({ s, ok: true, pick: k + 1, lab: q.lab }); setTimeout(next, 400); } else wrong(q, k + 1, s); }; row.append(b); }); bx.append(row); ov.scrollTop = 0; };
    const wrong = (q, pick, s) => { bx.textContent = ''; bx.append(head('❌ ' + (q.lab || (i + 1) + '번') + ' 오답 풀이'));
      bx.append(el('div', 'font-size:1.15rem;font-weight:700', '내 답 ' + C[pick - 1] + '  →  정답 ' + C[q.a - 1]));
      const step = (n, t) => el('div', 'font-weight:700;color:#4f46e5;margin-top:4px', n + ' ' + t);
      if (q.key) { bx.append(step('①', '🔑 정답으로 가는 핵심 문장')); bx.append(el('div', 'padding:12px 14px;border-left:5px solid #f59e0b;background:#fffbeb;border-radius:8px;font-size:1.05rem;line-height:1.6;white-space:pre-line', q.key)); }
      if (q.why) { bx.append(step(q.key ? '②' : '①', '👩‍🏫 선생님 풀이')); bx.append(el('div', 'padding:12px 14px;background:#eef2ff;border-radius:8px;line-height:1.7;white-space:pre-line', q.why)); }
      if (q.ex) bx.append(step('📄', '해설지'), img(q.ex));
      if (!q.key && !q.why && !q.ex) bx.append(el('p', 'color:#666;margin:0', '해설이 아직 없어요. 지문을 다시 읽고, 정답의 근거 문장을 찾아 보세요.'));
      const d = el('details'); d.append(el('summary', 'cursor:pointer;font-weight:600', '지문 다시 보기'), imgs(q.q)); bx.append(d);
      bx.append(el('b', null, '왜 틀렸나요? (고르면 다음 지문으로 넘어가요)')); const row = el('div', 'display:flex;flex-wrap:wrap;gap:6px');
      WHY.forEach(w => { const b = el('button', B + 'padding:10px 12px', w); b.type = 'button'; b.onclick = () => { log.push({ s, ok: false, pick, why: w, lab: q.lab }); next(); }; row.append(b); }); bx.append(row); ov.scrollTop = 0; };
    const end = () => { bx.textContent = ''; const ok = log.filter(x => x.ok).length, mm = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
      bx.append(head('📖 독해 결과'), el('div', 'font-size:2.2rem;text-align:center;font-weight:700', ok + ' / ' + log.length));
      log.forEach((x, k) => bx.append(el('div', 'padding:8px 10px;border:1px solid #ddd;border-radius:10px;color:' + (x.ok ? '#15803d' : '#dc2626'), (Q[k].lab || (k + 1) + '번') + ' ' + (x.ok ? '⭕' : '❌ ' + x.why) + ' · ' + mm(x.s))));
      try { localStorage.setItem('alrim:rdres:' + it.id, JSON.stringify({ at: Date.now(), ok, n: log.length, log })); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('alrim:rddone', { detail: { id: it.id, log } })); } catch (e) {} };
    ask(); };
  window.alrimRdRes = (id) => { try { return JSON.parse(localStorage.getItem('alrim:rdres:' + id) || 'null'); } catch (e) { return null; } };
})();
(() => {
'use strict';
const app = window.alrimSync; if (!app) return;
const TEACH = location.pathname.endsWith('/teacher.html');   /* 선생님 앱: 미리보기 위에 학생 화면과 같은 카드를 보여 줘요 */
const SUBJ = ['영어', '국어', '수학', '통합과학', '통합사회'], WHY = ['단어를 몰라서', '해석이 안 돼서', '선지가 헷갈려서', '시간이 부족해서'];
const pad = n => String(n).padStart(2, '0');
const ymd = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const fmt = s => { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + '시간 ' : '') + m + '분' + (h ? '' : ' ' + pad(s % 60) + '초'); };
const mmss = s => Math.floor(s / 60) + ':' + pad(Math.floor(s % 60));
const el = (t, css, txt) => { const e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };
const btn = (txt, on, css) => { const b = el('button', 'font:inherit;padding:8px 12px;border-radius:10px;border:1.5px solid var(--accent,#4f46e5);background:transparent;color:var(--ink,#111);cursor:pointer;' + (css || ''), txt); b.type = 'button'; b.onclick = on; return b; };
let me = null, LS = {}, card = null, sig = '';
const key = () => 'alrim:sn:' + (me ? me.name : '') + (TEACH ? ':teacher' : '');
const load = () => { try { LS = JSON.parse(localStorage.getItem(key()) || '{}'); } catch (e) { LS = {}; } LS.daily = LS.daily || {}; LS.time = LS.time || {}; LS.read = LS.read || []; LS.wwrong = LS.wwrong || {}; LS.wdone = LS.wdone || {}; LS.ldone = LS.ldone || {}; };
const save = () => { try { localStorage.setItem(key(), JSON.stringify(LS)); } catch (e) {} };
function student() { try { const s = app.snapshot(), d = JSON.parse(s.data); if (TEACH) { const c = document.getElementById('cls'); return d.students.find(x => x.name === (c && c.value)) || null; } return d.students.find(x => x.name === s.fixed) || d.students[0]; } catch (e) { return null; } }

/* ---- 공부 시간 ---- */
/* 과목 공부 시간: 누르면 시작 → 오른쪽 아래 버튼 한 번 = 멈춤/계속, 꾹 = 끝(그때 기록) */
const runSec = () => { const R = LS.run; if (!R) return 0; return Math.min(4 * 3600, (R.acc || 0) + (R.t ? (Date.now() - R.t) / 1000 : 0)); };
function stopRun() { const R = LS.run; if (!R) return; const d = ymd(new Date(R.t0 || R.t || Date.now())); LS.time[d] = LS.time[d] || {}; LS.time[d][R.s] = (LS.time[d][R.s] || 0) + runSec(); LS.run = null; save(); }
function pauseRun() { const R = LS.run; if (!R) return; if (R.ready) { R.ready = false; R.t0 = R.t = Date.now(); R.acc = 0; save(); return; } if (R.t) { R.acc = (R.acc || 0) + (Date.now() - R.t) / 1000; R.t = null; } else R.t = Date.now(); save(); }
const dayTot = (d, s) => ((LS.time[d] || {})[s] || 0);
let fb = null;
function runFloat() {
  if (TEACH) return; const R = LS.run;
  if (!R) { if (fb) { fb.remove(); fb = null; } return; }
  if (!fb) { fb = el('div', 'position:fixed;right:16px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:10030;display:flex;flex-direction:column;align-items:center;gap:4px;user-select:none;-webkit-user-select:none;touch-action:none');
    const b = el('button', 'width:72px;height:72px;border-radius:50%;border:none;font-size:30px;color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.3);cursor:pointer;-webkit-touch-callout:none'); b.type = 'button'; b.id = 'snRunBtn';
    const cap = el('small', 'background:rgba(255,255,255,.95);border-radius:8px;padding:2px 8px;font-weight:700;font-size:.78rem;color:#333;box-shadow:0 2px 6px rgba(0,0,0,.15);text-align:center;line-height:1.3'); cap.id = 'snRunCap';
    let timer = null, long = false;
    const down = (e) => { e.preventDefault(); long = false; b.style.transform = 'scale(.92)'; timer = setTimeout(() => { long = true; b.style.transform = ''; const R0 = LS.run, s = R0 && R0.s, rec = R0 && !R0.ready && runSec() > 0; if (R0 && R0.ready) LS.run = null; else stopRun(); save(); runFloat(); render(); if (s) toast(rec ? s + ' 공부 시간을 기록했어요' : s + ' 취소했어요'); }, 800); };
    const up = (e) => { e.preventDefault(); b.style.transform = ''; if (timer) { clearTimeout(timer); timer = null; } if (!long && LS.run) { pauseRun(); runFloat(); render(); } };
    const cancel = () => { b.style.transform = ''; if (timer) { clearTimeout(timer); timer = null; } };
    b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', cancel); b.addEventListener('pointercancel', cancel); b.addEventListener('contextmenu', e => e.preventDefault());
    fb.append(b, cap); document.body.append(fb); }
  const b = document.getElementById('snRunBtn'), cap = document.getElementById('snRunCap'), on = !!R.t;
  if (R.ready) { b.textContent = '▶'; b.style.background = '#15803d'; b.setAttribute('aria-label', R.s + ' 시작'); cap.textContent = R.s + ' · 눌러서 시작'; return; }
  b.textContent = on ? '⏸' : '▶'; b.style.background = on ? '#4f46e5' : '#f59e0b'; b.setAttribute('aria-label', R.s + (on ? ' 멈춤' : ' 계속') + ' (꾹 누르면 끝)');
  cap.textContent = R.s + (on ? ' 공부 중' : ' 멈춤') + ' · 꾹 누르면 끝';
}
function toast(t) { const d = el('div', 'position:fixed;left:50%;bottom:calc(170px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:10031;background:#15803d;color:#fff;padding:10px 16px;border-radius:12px;font-weight:700;box-shadow:0 6px 18px rgba(0,0,0,.25)', '✅ ' + t); document.body.append(d); setTimeout(() => d.remove(), 2200); }
function weekTot() { let t = 0; for (let i = 0; i < 7; i++) { const d = ymd(new Date(Date.now() - i * 864e5)); SUBJ.forEach(s => t += dayTot(d, s)); } return t; }

/* ---- 매일 단어 · 매일 듣기 ---- */
const dayDiff = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);
const wk = w => w[0].toLowerCase() + '|' + w[1];
function wPlan(today) { const B = me.wbook; if (!B || !(B.days || []).length || !B.start) return null; const n = dayDiff(B.start, today); if (n < 0) return null;
  const from = Math.max(1, B.from || 1), to = Math.min(B.days.length, B.to || B.days.length), k = from + n, over = k > to, day = over ? { n: '', w: [] } : B.days[k - 1];
  const have = new Set(day.w.map(wk)), rev = Object.values(LS.wwrong).filter(x => x.last < today && !have.has(wk([x.en, x.ko]))).map(x => [x.en, x.ko]);
  return { day, rev, all: day.w.concat(rev), over, pool: [].concat(...B.days.map(x => x.w)) }; }
const wLv = w => { const x = LS.wwrong[wk(w)]; return x ? Math.min(3, x.n) : 0; }, LVC = ['inherit', '#1E5BD8', '#C62828', '#7B2FBE'], LVT = ['', '1번 틀린 단어', '2번 틀린 단어', '3번 이상 틀린 단어'];
function sheet(title) { const ov = el('div', 'position:fixed;inset:0;z-index:10040;background:rgba(15,23,42,.6);overflow:auto;padding:14px'), bx = el('div', 'max-width:560px;margin:0 auto;background:var(--panel,#fff);color:var(--ink,#111);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:10px');
  const h = el('div', 'display:flex;justify-content:space-between;align-items:center;gap:8px'); h.append(el('b', 'font-size:1.2rem', title), btn('닫기 ✕', () => { ov.remove(); render(); })); bx.append(h); const body = el('div', 'display:flex;flex-direction:column;gap:8px'); bx.append(body); ov.append(bx); document.body.append(ov); return { ov, body }; }
function say(t) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = .9; speechSynthesis.speak(u); } catch (e) {} }
/* 하루 흐름: 단어 공부(전체 넘겨보기) → 테스트(채점은 끝나고) → 틀린 단어만 다시 공부 → 틀린 단어 다시 테스트 … */
const parts = ko => { const out = []; let cur = '', dep = 0; for (const ch of String(ko)) { if ('([<'.includes(ch)) dep++; if (')]>'.includes(ch)) dep = Math.max(0, dep - 1); if ((ch === ',' || ch === ';') && !dep) { if (cur.trim()) out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
function wSt(today, P) { LS.wst = LS.wst || {}; let s = LS.wst[today]; if (!s) { s = LS.wst[today] = { round: 0, list: P.all.map(wk), seen: [], res: null }; save(); } return s; }
const wByKey = (P) => { const m = {}; P.all.concat(P.pool).forEach(w => m[wk(w)] = w); return m; };
function wStudy(P, today) { const st = wSt(today, P), M = wByKey(P), list = st.list.map(k => M[k]).filter(Boolean); if (!list.length) return;
  const S = sheet('📖 ' + (st.round ? '틀린 단어 다시 공부' : (P.day.n || '단어') + ' 공부')); let i = Math.min(list.length - 1, Math.max(0, list.findIndex(w => !st.seen.includes(wk(w))))), show = false;
  const draw = () => { S.body.textContent = ''; const w = list[i], lv = wLv(w), n = new Set(st.seen.filter(k => st.list.includes(k))).size;
    if (!st.seen.includes(wk(w))) { st.seen.push(wk(w)); save(); }
    const seenN = new Set(st.seen.filter(k => st.list.includes(k))).size;
    S.body.append(el('div', 'display:flex;justify-content:space-between;color:var(--muted,#666);font-size:.9rem', ''), el('small', 'color:var(--muted,#666)', (i + 1) + ' / ' + list.length + ' · 본 단어 ' + seenN + ' / ' + list.length));
    const bar = el('div', 'height:6px;border-radius:3px;background:var(--soft,#e5e7eb);overflow:hidden'); bar.append(el('i', 'display:block;height:100%;background:var(--accent,#4f46e5);width:' + (seenN / list.length * 100) + '%')); S.body.append(bar);
    const cd = el('div', 'border:2px solid var(--line,#ddd);border-radius:18px;padding:22px 14px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center');
    cd.append(el('div', 'font-family:var(--font-display,inherit);font-size:2.2rem;color:' + LVC[lv], w[0]), btn('🔊 발음 듣기', () => say(w[0])));
    const ko = el('div', 'font-size:1.25rem;line-height:1.6;' + (show ? '' : 'color:transparent;background:var(--soft,#e5e7eb);border-radius:10px;padding:4px 14px;cursor:pointer'), show ? parts(w[1]).map((m, k) => (parts(w[1]).length > 1 ? (k + 1) + '. ' : '') + m).join('\n') : '눌러서 뜻 보기');
    ko.style.whiteSpace = 'pre-line'; if (!show) { ko.style.color = 'var(--muted,#666)'; ko.onclick = () => { show = true; draw(); }; } cd.append(ko);
    if (lv) cd.append(el('small', 'font-weight:700;color:' + LVC[lv], LVT[lv])); S.body.append(cd);
    const nav = el('div', 'display:grid;grid-template-columns:1fr 1fr;gap:8px');
    const pv = btn('◀ 이전', () => { i--; show = false; draw(); }, 'padding:12px'); pv.disabled = i === 0;
    const last = i === list.length - 1, all = seenN >= list.length;
    const nx = btn(last ? (all ? '✅ 다 봤어요 · 테스트 보기' : '처음으로') : '다음 ▶', () => { if (!last) { i++; show = false; draw(); return; } if (all) { S.ov.remove(); wTest(P, today); } else { i = list.findIndex(x => !st.seen.includes(wk(x))); show = false; draw(); } }, 'padding:12px;' + (last && all ? 'background:var(--accent,#4f46e5);color:#fff;font-weight:700' : ''));
    nav.append(pv, nx); S.body.append(nav); };
  draw(); }
function wReady(today, P) { const st = wSt(today, P); return st.list.every(k => st.seen.includes(k)); }
function wTest(P, today) { const st = wSt(today, P), M = wByKey(P);
  if (!wReady(today, P)) { const S = sheet('✏️ 테스트'); S.body.append(el('div', 'font-size:1.3rem;font-weight:700;color:#dc2626;text-align:center;padding:20px 0', '학습이 끝나지 않았어요'), el('p', 'text-align:center;margin:0', '단어 공부에서 ' + (st.round ? '틀린 단어를' : '전체 단어를') + ' 끝까지 넘겨 본 다음에 테스트를 볼 수 있어요. (' + st.list.filter(k => st.seen.includes(k)).length + ' / ' + st.list.length + ' 봤어요)'), btn('📖 단어 공부하러 가기', () => { S.ov.remove(); wStudy(P, today); }, 'background:var(--accent,#4f46e5);color:#fff;font-weight:700;padding:12px')); return; }
  const S = sheet('✏️ ' + (st.round ? '틀린 단어 다시 테스트' : (P.day.n || '단어') + ' 테스트')); const sh = a => a.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const qs = sh(st.list.map(k => M[k]).filter(Boolean)), allParts = [...new Set([].concat(...P.pool.map(x => parts(x[1]))))], rec = []; let i = 0;
  if (P.pool.length < 4) { S.body.append(el('p', null, '단어가 4개보다 적어서 테스트를 만들 수 없어요.')); return; }
  const ask = () => { S.body.textContent = ''; if (i >= qs.length) return end(); const w = qs[i], mine = parts(w[1]), mode = mine.length === 1 ? 'one' : mine.length <= 3 ? 'all' : 'not';
    const fake = sh(allParts.filter(x => !mine.includes(x) && !mine.some(m => m.includes(x) || x.includes(m))));
    const opts = sh(mode === 'one' ? [mine[0]].concat(fake.slice(0, 3)) : mode === 'all' ? mine.concat(fake.slice(0, 6 - mine.length)) : mine.concat([fake[0]]));
    S.body.append(el('small', 'color:var(--muted,#666)', (i + 1) + ' / ' + qs.length), el('div', 'font-family:var(--font-display,inherit);font-size:2.1rem;text-align:center;padding:10px 0', w[0]), btn('🔊 발음 듣기', () => say(w[0])),
      el('b', 'text-align:center;font-size:1.05rem;color:' + (mode === 'not' ? '#dc2626' : 'var(--accent,#4f46e5)'), mode === 'one' ? '맞는 뜻을 고르세요' : mode === 'all' ? '뜻이 ' + mine.length + '개예요. 모두 고르세요' : '뜻이 ' + mine.length + '개예요. 뜻이 아닌 것 하나를 고르세요'));
    const sel = new Set();
    const done = () => { rec.push({ w, mode, mine, opts, fake: mode === 'not' ? fake[0] : null, sel: [...sel] }); i++; ask(); };   /* 채점은 끝나고 보여 줘요 */
    opts.forEach(o => { const b = btn(o, () => { if (mode === 'all') { if (sel.has(o)) { sel.delete(o); b.style.background = 'transparent'; b.style.fontWeight = ''; b.style.boxShadow = ''; b.textContent = o; } else { sel.add(o); b.style.background = '#c7d2fe'; b.style.fontWeight = '700'; b.style.boxShadow = 'inset 0 0 0 2px #4f46e5'; b.textContent = '✔ ' + o; } const cf = S.body.querySelector('#snOk'); cf.disabled = !sel.size; cf.textContent = '다음 (' + sel.size + '개 고름)'; } else { sel.add(o); done(); } }, 'text-align:left;padding:12px;font-size:1rem'); S.body.append(b); });
    if (mode === 'all') { const cf = btn('다음 (0개 고름)', done, 'background:var(--accent,#4f46e5);color:#fff;font-weight:700;padding:12px'); cf.id = 'snOk'; cf.disabled = true; S.body.append(cf); } };
  const isOk = r => r.mode === 'all' ? r.sel.length === r.mine.length && r.mine.every(m => r.sel.includes(m)) : r.mode === 'not' ? r.sel[0] === r.fake : r.sel[0] === r.mine[0];
  const end = () => { const wrong = rec.filter(r => !isOk(r)).map(r => r.w), wset = new Set(wrong.map(wk));
    if (!st.round) { /* 첫 테스트 결과만 기록하고, 틀린 단어는 다음 날로 넘겨요 */
      qs.forEach(w => { const k = wk(w), x = LS.wwrong[k]; if (wset.has(k)) LS.wwrong[k] = { en: w[0], ko: w[1], n: (x ? x.n : 0) + 1, last: today }; else if (x && x.last < today) delete LS.wwrong[k]; });
      LS.wdone[today] = { t: qs.length, w: wrong.length }; }
    st.res = { t: qs.length, w: wrong.length, round: st.round }; st.round++; st.list = wrong.map(wk); st.seen = []; save();
    S.body.append(el('div', 'font-family:var(--font-display,inherit);font-size:2.4rem;text-align:center', (qs.length - wrong.length) + ' / ' + qs.length));
    if (!wrong.length) { S.body.append(el('b', 'color:#15803d;text-align:center;font-size:1.1rem', '모두 맞았어요! 🎉 오늘 단어 끝!')); return; }
    S.body.append(el('b', 'color:#dc2626', '틀린 단어 ' + wrong.length + '개 · 어떤 뜻 때문에 틀렸는지 보세요'));
    const lg = el('div', 'display:flex;flex-wrap:wrap;gap:10px;font-size:.82rem;color:var(--muted,#666)'); lg.innerHTML = '<span><b style="background:#dcfce7;color:#166534;padding:1px 6px;border-radius:5px">맞게 고른 뜻</b></span><span><b style="background:#fef08a;color:#854d0e;padding:1px 6px;border-radius:5px">빠뜨린 뜻</b></span><span><b style="background:#fee2e2;color:#991b1b;padding:1px 6px;border-radius:5px;text-decoration:line-through">잘못 고른 것</b></span>'; S.body.append(lg);
    rec.filter(r => !isOk(r)).forEach(r => { const c = el('div', 'border:1.5px solid #fca5a5;border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:6px');
      c.append(el('b', 'font-size:1.15rem;color:' + LVC[wLv(r.w)], r.w[0] + (r.mode === 'not' ? '  (뜻이 아닌 것 고르기)' : r.mode === 'all' ? '  (뜻 모두 고르기)' : '')));
      const row = el('div', 'display:flex;flex-wrap:wrap;gap:6px');
      r.opts.forEach(o => { const real = r.mine.includes(o), picked = r.sel.includes(o); let css = 'padding:4px 10px;border-radius:8px;border:1px solid var(--line,#ddd);font-size:.95rem;', tip = '';
        if (r.mode === 'not') { if (o === r.fake) { css += picked ? 'background:#dcfce7;color:#166534;font-weight:700' : 'background:#fef08a;color:#854d0e;font-weight:700'; tip = ' ← 이게 뜻이 아니에요'; } else if (picked) { css += 'background:#fee2e2;color:#991b1b;font-weight:700'; tip = ' ← 이것도 뜻이에요'; } }
        else if (real && picked) css += 'background:#dcfce7;color:#166534;font-weight:700';
        else if (real && !picked) { css += 'background:#fef08a;color:#854d0e;font-weight:700'; tip = ' ← 빠뜨린 뜻'; }
        else if (!real && picked) { css += 'background:#fee2e2;color:#991b1b;font-weight:700'; tip = ' ← 뜻이 아니에요'; }
        else css += 'color:var(--muted,#888)';
        const sp = el('span', css); const ot = el('span', (!real && picked && r.mode !== 'not') ? 'text-decoration:line-through' : '', o); sp.append(ot); if (tip) sp.append(document.createTextNode(tip)); row.append(sp); });
      c.append(row, el('small', 'color:var(--muted,#666)', '정답 뜻: ' + r.w[1])); S.body.append(c); });
    S.body.append(btn('📖 틀린 단어 ' + wrong.length + '개 다시 공부하기', () => { S.ov.remove(); wStudy(P, today); }, 'background:var(--accent,#4f46e5);color:#fff;font-weight:700;padding:12px'),
      el('small', 'color:var(--muted,#666);text-align:center', '틀린 단어를 다 넘겨 보면 틀린 단어만 다시 테스트할 수 있어요.')); };
  ask(); }
let RB = null, RBid = '';
function rbLoad(id) { if (RBid === id) return; RBid = id; RB = null; fetch(new URL('data/reading/' + id + '.json', location.href).href + '?_=' + Date.now()).then(r => r.json()).then(j => { RB = j; render(); }).catch(() => { RB = { err: 1 }; render(); }); }
function rPlan(today) { const B = me.rbook; if (!B || !B.id || !B.start) return null; rbLoad(B.id); const n = dayDiff(B.start, today); if (n < 0) return null;
  if (!RB) return { wait: 1 }; if (RB.err || !RB.ps) return { err: 1 };
  const per = Math.max(1, B.per || 7), s = Math.max(1, B.from || 1) - 1 + n * per, ps = RB.ps.slice(s, s + per);
  const rd = [].concat(...ps.map(p => p.qs.map(q => ({ q: p.img, a: q.a, lab: p.r + '회 ' + q.n + '번', sub: p.qs.length > 1 ? q.n + '번 문제' : '' }))));
  return { ps, rd, over: !ps.length, first: s + 1, last: s + ps.length, total: RB.ps.length }; }
function lPlan(today) { const B = me.lbook; if (!B || !B.id || !B.start) return null; const n = dayDiff(B.start, today); if (n < 0) return null; const unit = (B.from || 1) + n; return { unit, over: unit > (B.to || 24) }; }
let lCtx = null;
function lOpen(unit, only, today) { if (!window.alrimListen) return; lCtx = { unit, only, today };
  window.alrimListen(only ? { id: 'sn-lr-' + today, subject: '듣기', task: '틀린 문제 다시 듣기', listen: { sets: [{ test: unit, only }] } } : { id: 'sn-l-' + today, subject: '듣기', task: '듣기 ' + unit + '회', listen: { test: unit } }); }
window.addEventListener('alrim:rddone', e => { if (!me || !e.detail || !e.detail.log || !e.detail.log.length) return; LS.read.push({ d: ymd(), log: e.detail.log.map(x => ({ s: x.s, ok: x.ok, why: x.why })) }); LS.read = LS.read.slice(-200); save(); render(); });
window.addEventListener('alrim:lsdone', e => { if (!lCtx || !me) return; const d = e.detail || {};
  if (lCtx.only) { const x = LS.ldone[lCtx.today]; if (x) x.retry = (d.total - d.wrong.length) + '/' + d.total; }
  else LS.ldone[lCtx.today] = { unit: lCtx.unit, total: d.total, wrong: (d.wrong || []).map(w => w.n), retry: '' };
  save(); lCtx = null; setTimeout(render, 300); });

function sec(title) { const d = el('details', 'border-top:1px solid var(--line,#ddd);padding:10px 0 2px'); d.open = LS['open:' + title] !== false; const sm = el('summary', 'cursor:pointer;font-weight:700;font-size:1.02rem', title); d.append(sm); d.addEventListener('toggle', () => { LS['open:' + title] = d.open; save(); }); const body = el('div', 'display:flex;flex-direction:column;gap:8px;padding:8px 0'); d.append(body); return [d, body]; }

function render() {
  if (!card) return; card.textContent = ''; const today = sday(); lastDay = today;
  /* D-day */
  const dd = me.dday || '2027-11-18', left = Math.ceil((new Date(dd + 'T00:00:00') - new Date(today + 'T00:00:00')) / 864e5);
  const top = el('div', 'display:flex;align-items:baseline;gap:10px;flex-wrap:wrap');
  top.append(el('b', 'font-family:var(--font-display,inherit);font-size:1.7rem;color:var(--accent,#4f46e5)', '🎯 수능 ' + (left > 0 ? 'D-' + left : left === 0 ? 'D-DAY' : 'D+' + (-left))), el('span', 'color:var(--muted,#666);font-size:.9rem', dd.replace(/-/g, '.') + ' · 이번 주 공부 ' + fmt(weekTot())));
  if (TEACH) card.append(el('small', 'color:var(--muted,#666);font-weight:600', '👀 ' + me.name + ' 학생 화면에 보이는 수능 도우미 (미리보기 · 여기서 누른 기록은 학생에게 안 넘어가요)'));
  card.append(top);
  /* 매일 단어 */
  { const P = wPlan(today); if (P) { const [d, b] = sec('📘 단어 공부'); const done = LS.wdone[today];
      b.append(el('b', 'font-size:1.05rem', (me.wbook.title ? me.wbook.title + ' · ' : '') + (P.over ? '범위를 모두 끝냈어요 🎉' : P.day.n + ' · ' + P.day.w.length + '개')));
      if (P.rev.length) b.append(el('div', 'color:#1E5BD8;font-weight:600;font-size:.92rem', '어제까지 틀린 단어 ' + P.rev.length + '개가 오늘 단어에 같이 나와요'));
      if (P.all.length) { const st = wSt(today, P), seenN = st.list.filter(k => st.seen.includes(k)).length, ready = seenN >= st.list.length, fin = st.round > 0 && !st.list.length;
        if (done) b.append(el('div', 'font-weight:700;color:' + (done.w ? '#dc2626' : '#15803d'), (done.w ? '오늘 첫 테스트 ' : '✅ 오늘 테스트 ') + (done.t - done.w) + ' / ' + done.t + (done.w ? ' · 틀린 ' + done.w + '개는 내일 다시 나와요' : ' · 만점!')));
        if (fin) b.append(el('div', 'color:#15803d;font-weight:700', done && done.w ? '✅ 틀린 단어까지 다시 테스트해서 다 맞았어요. 오늘 단어 끝!' : '✅ 오늘 단어 끝!'));
        else { b.append(el('div', 'font-size:.92rem;color:' + (st.round ? '#dc2626' : 'var(--muted,#666)') + ';font-weight:600', (st.round ? '틀린 단어 ' + st.list.length + '개 · ' : '') + '단어 공부 ' + seenN + ' / ' + st.list.length + ' 봤어요' + (ready ? ' · 이제 테스트를 볼 수 있어요' : '')));
          const row = el('div', 'display:flex;flex-wrap:wrap;gap:6px'); row.append(btn(st.round ? '📖 틀린 단어 다시 공부' : '📖 단어 공부', () => wStudy(P, today), ready ? '' : 'background:var(--accent,#4f46e5);color:#fff;font-weight:700'), btn(st.round ? '✏️ 틀린 단어 다시 테스트' : '✏️ 테스트 보기', () => wTest(P, today), ready ? 'background:var(--accent,#4f46e5);color:#fff;font-weight:700' : 'opacity:.6')); b.append(row); } }
      b.append(el('small', 'color:var(--muted,#666)', '매일 아침 6시에 새 Day가 자동으로 나와요. 단어를 끝까지 넘겨 본 뒤 테스트를 봐요. 점수는 테스트가 끝나야 보여요. 첫 테스트에서 틀린 단어는 다음 날 파란색으로 다시 나와요.')); card.append(d); } }
  /* 매일 듣기 */
  { const P = lPlan(today), [d, b] = sec('🎧 듣기 연습'); if (!P) b.append(el('div', 'color:var(--muted,#666)', '듣기 책이 정해지면 날마다 1회씩 여기에 떠요.')); if (P) { const done = LS.ldone[today];
      b.append(el('b', 'font-size:1.05rem', P.over ? '범위를 모두 끝냈어요 🎉' : '오늘은 ' + P.unit + '회 (매일 아침 6시에 다음 회로)'));
      if (!P.over) { if (!done || done.unit !== P.unit) b.append(btn('▶ ' + P.unit + '회 풀기 (다 풀면 바로 채점)', () => lOpen(P.unit, null, today), 'background:var(--accent,#4f46e5);color:#fff;font-weight:700'));
        else { b.append(el('div', 'font-weight:700', '채점: ' + (done.total - done.wrong.length) + ' / ' + done.total));
          if (done.wrong.length && !done.retry) b.append(el('div', 'color:#dc2626;font-weight:600', '틀린 ' + done.wrong.join(', ') + '번을 다시 듣고 풀어야 오늘 듣기가 끝나요.'), btn('🔁 틀린 ' + done.wrong.length + '문제 다시 듣고 풀기', () => lOpen(P.unit, done.wrong, today), 'background:#dc2626;border-color:#dc2626;color:#fff;font-weight:700'));
          else b.append(el('div', 'color:#15803d;font-weight:700', done.wrong.length ? '✅ 틀린 문제까지 다시 풀었어요 (' + done.retry + ')' : '✅ 다 맞았어요!'));
          if (done.wrong.length && done.retry) b.append(btn('틀린 문제 한 번 더 듣기', () => lOpen(P.unit, done.wrong, today))); } }
      }
    let cur = 1; try { cur = parseFloat(localStorage.getItem('alrim:rate')) || 1; } catch (e) {} const sp = el('div', 'display:flex;flex-wrap:wrap;gap:6px;align-items:center'); sp.append(el('small', 'color:var(--muted,#666);font-weight:600', '듣기 속도'));
    [0.8, 1, 1.2, 1.5].forEach(r => sp.append(btn(r + '배', () => { try { localStorage.setItem('alrim:rate', r); } catch (e) {} render(); }, 'padding:5px 10px;' + (r === cur ? 'background:var(--accent,#4f46e5);color:#fff;font-weight:700' : ''))));
    b.append(sp); card.append(d); }
  /* 독해 타이머 */
  { const [d, b] = sec('📖 독해'); const R = LS.rd, RP = rPlan(today);
    if (RP && RP.wait) b.append(el('div', 'color:var(--muted,#666)', '오늘 독해를 불러오는 중…'));
    else if (RP && RP.err) b.append(el('div', 'color:#dc2626', '독해 문제집을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.'));
    else if (RP && RP.over) b.append(el('b', null, '독해 문제집을 모두 끝냈어요 🎉'));
    else if (RP) { const id = 'sn-rd-' + today, rr = window.alrimRdRes && window.alrimRdRes(id), p0 = RP.ps[0], p1 = RP.ps[RP.ps.length - 1];
      b.append(el('b', 'font-size:1.05rem', '오늘 ' + RP.ps.length + '지문 · ' + p0.r + '회 ' + p0.qs[0].n + '번 ~ ' + p1.r + '회 ' + p1.qs[p1.qs.length - 1].n + '번'));
      if (rr) b.append(el('div', 'font-weight:700;color:' + (rr.ok === rr.n ? '#15803d' : '#dc2626'), (rr.ok === rr.n ? '✅ ' : '') + '오늘 결과 ' + rr.ok + ' / ' + rr.n));
      b.append(btn(rr ? '📖 다시 풀기' : '▶ 오늘 독해 풀기', () => window.alrimOpenRd({ id, rd: RP.rd }), 'background:var(--accent,#4f46e5);color:#fff;font-weight:700'));
      b.append(el('small', 'color:var(--muted,#666)', '문제를 풀고 답을 고르면 맞으면 다음으로, 틀리면 정답과 지문을 다시 보여 줘요. (' + RP.last + ' / ' + RP.total + '지문)')); }
    if (RP) {} else if (!R) { b.append(btn('▶ 독해 시작', () => { LS.rd = { n: 1, t: Date.now(), log: [] }; save(); render(); }, 'background:var(--accent,#4f46e5);color:#fff;font-weight:700')); }
    else if (R.ask) { b.append(el('b', null, R.n + '번 지문 · 왜 틀렸나요?')); const row = el('div', 'display:flex;flex-wrap:wrap;gap:6px'); WHY.forEach(w => row.append(btn(w, () => { R.log.push({ s: R.ask, ok: false, why: w }); R.ask = 0; R.n++; R.t = Date.now(); save(); render(); }))); b.append(row); }
    else { const t = el('div', 'font-family:var(--font-display,inherit);font-size:2rem'); t.id = 'snRead'; b.append(el('b', null, R.n + '번 지문'), t);
      const row = el('div', 'display:flex;flex-wrap:wrap;gap:6px'); const lap = () => (Date.now() - R.t) / 1000;
      row.append(btn('⭕ 맞음 · 다음 지문', () => { R.log.push({ s: lap(), ok: true }); R.n++; R.t = Date.now(); save(); render(); }), btn('❌ 틀림', () => { R.ask = lap(); save(); render(); }),
        btn('끝내기', () => { if (R.log.length) LS.read.push({ d: today, log: R.log }); LS.read = LS.read.slice(-200); LS.rd = null; save(); render(); }));
      b.append(row); }
    const recent = LS.read.filter(x => x.d >= ymd(new Date(Date.now() - 30 * 864e5))), all = [].concat(...recent.map(x => x.log));
    if (all.length) { const avg = all.reduce((a, x) => a + x.s, 0) / all.length, wrong = all.filter(x => !x.ok), cnt = {}; wrong.forEach(x => cnt[x.why] = (cnt[x.why] || 0) + 1);
      b.append(el('div', 'font-size:.92rem', '최근 30일: ' + all.length + '지문 · 평균 ' + mmss(avg) + ' · 정답률 ' + Math.round((all.length - wrong.length) / all.length * 100) + '%'));
      const mx = Math.max(1, ...Object.values(cnt)); WHY.forEach(w => { const n = cnt[w] || 0; const r = el('div', 'display:grid;grid-template-columns:8.5em 1fr 2em;gap:6px;align-items:center;font-size:.86rem'); const bar = el('div', 'height:10px;border-radius:5px;background:var(--soft,#eef);overflow:hidden'); bar.append(el('i', 'display:block;height:100%;background:#dc2626;width:' + (n / mx * 100) + '%')); r.append(el('span', null, w), bar, el('b', null, n)); b.append(r); });
      const topWhy = Object.entries(cnt).sort((a, c) => c[1] - a[1])[0]; if (topWhy) b.append(el('small', 'color:var(--muted,#666)', '가장 많은 이유: ' + topWhy[0] + ({ '단어를 몰라서': ' → 지문 단어 정리와 단어 암기를 늘려요.', '해석이 안 돼서': ' → 구문 분석(문장연습)을 더 해요.', '선지가 헷갈려서': ' → 선지의 근거 문장을 지문에서 찾아 표시해요.', '시간이 부족해서': ' → 쉬운 유형부터 풀고, 지문당 1:40을 지켜요.' })[topWhy[0]])); }
    card.append(d); }
  /* 매일 과제 */
  const daily = (me.daily || []).filter(Boolean);
  if (daily.length) { const [d, b] = sec('✅ 오늘의 매일 과제'); const done = LS.daily[today] || {};
    let streak = 0; for (let i = 1; i < 400; i++) { const k = ymd(new Date(Date.now() - i * 864e5)), v = LS.daily[k] || {}; if (daily.every(t => v[t])) streak++; else break; }
    const all = daily.every(t => done[t]); if (all) streak++;
    daily.forEach(t => { const l = el('label', 'display:flex;gap:10px;align-items:center;padding:8px 10px;border:1px solid var(--line,#ddd);border-radius:10px;cursor:pointer;' + (done[t] ? 'opacity:.6;text-decoration:line-through' : '')); const c = el('input', 'width:20px;height:20px'); c.type = 'checkbox'; c.checked = !!done[t];
      c.onchange = () => { LS.daily[today] = Object.assign({}, LS.daily[today], { [t]: c.checked }); save(); render(); }; l.append(c, el('span', null, t)); b.append(l); });
    b.append(el('small', 'color:var(--muted,#666)', (all ? '오늘 매일 과제를 다 했어요! ' : daily.filter(t => !done[t]).length + '개 남았어요. ') + (streak ? '🔥 연속 ' + streak + '일' : ''))); card.append(d); }
  /* 모의고사 */
  const mocks = (me.mocks || []).slice().sort((a, c) => (a.date || '').localeCompare(c.date || ''));
  if (mocks.length) { const [d, b] = sec('📊 모의고사 성적'); const cols = [['kor', '국어'], ['math', '수학'], ['eng', '영어'], ['t1', '통합사회'], ['t2', '통합과학']];
    const tb = el('table', 'width:100%;border-collapse:collapse;font-size:.88rem;text-align:center'); const hr = el('tr'); ['시험', ...cols.map(c => c[1])].forEach(h => hr.append(el('th', 'padding:4px;border-bottom:2px solid var(--line,#ddd)', h))); tb.append(hr);
    mocks.forEach(m => { const r = el('tr'); r.append(el('td', 'padding:4px;text-align:left;border-bottom:1px solid var(--line,#ddd)', (m.name || '') + ' ' + (m.date || '').slice(5).replace('-', '/'))); cols.forEach(c => r.append(el('td', 'padding:4px;border-bottom:1px solid var(--line,#ddd);' + (c[0] === 'eng' ? 'font-weight:700;color:var(--accent,#4f46e5)' : ''), m[c[0]] ? m[c[0]] + '등급' : '-'))); tb.append(r); });
    b.append(tb); const pts = mocks.filter(m => +m.eng);
    if (pts.length > 1) { const W = 300, H = 110, x = i => 24 + i * (W - 40) / (pts.length - 1), y = g => 12 + (g - 1) * (H - 30) / 8; const ns = 'http://www.w3.org/2000/svg', sv = document.createElementNS(ns, 'svg'); sv.setAttribute('viewBox', '0 0 ' + W + ' ' + H); sv.style.cssText = 'width:100%;max-width:420px';
      const mk = (t, a) => { const e = document.createElementNS(ns, t); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); sv.append(e); return e; };
      [1, 3, 5, 7, 9].forEach(g => { mk('line', { x1: 20, x2: W - 8, y1: y(g), y2: y(g), stroke: '#ccc', 'stroke-width': .5 }); mk('text', { x: 2, y: y(g) + 3, 'font-size': 8, fill: '#888' }).textContent = g; });
      mk('polyline', { points: pts.map((m, i) => x(i) + ',' + y(+m.eng)).join(' '), fill: 'none', stroke: '#4f46e5', 'stroke-width': 2 });
      pts.forEach((m, i) => { mk('circle', { cx: x(i), cy: y(+m.eng), r: 3.5, fill: '#4f46e5' }); mk('text', { x: x(i), y: H - 4, 'font-size': 8, 'text-anchor': 'middle', fill: '#666' }).textContent = (m.date || '').slice(5).replace('-', '/'); });
      b.append(el('small', 'color:var(--muted,#666)', '영어 등급 추이 (위로 갈수록 좋은 등급)'), sv); }
    card.append(d); }
  /* 공부 시간 */
  { const [d, b] = sec('⏱ 과목별 공부 시간'); const row = el('div', 'display:flex;flex-wrap:wrap;gap:6px');
    SUBJ.forEach(s => { const on = LS.run && LS.run.s === s; const x = btn((on ? '⏺ ' : '▶ ') + s, () => { if (on) return; if (LS.run && !LS.run.ready) stopRun(); LS.run = { s, ready: true, t: null, acc: 0 }; LS['open:⏱ 과목별 공부 시간'] = false; save(); render(); runFloat(); window.scrollTo({ top: 0, behavior: 'smooth' }); }, on ? 'background:var(--accent,#4f46e5);color:#fff;font-weight:700' : ''); row.append(x); });
    b.append(row); const live = el('div', 'font-weight:700'); live.id = 'snLive'; b.append(live);
    const tb = el('div', 'display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px'); let tot = 0;
    SUBJ.forEach(s => { const v = dayTot(today, s); tot += v; const c = el('div', 'padding:6px 8px;border-radius:8px;background:var(--soft,#eef);font-size:.88rem'); c.append(el('b', 'display:block', s), el('span', null, fmt(v))); c.dataset.s = s; tb.append(c); });
    b.append(tb, el('small', 'color:var(--muted,#666)', '과목을 누르면 오른쪽 아래에 ▶ 버튼이 생겨요. ▶ 시작 → 한 번 누르면 멈춤·계속 → 꾹 누르면 끝나고 그때 기록돼요. 오늘 합계 ' + fmt(tot))); card.append(d); }
  tick();
}
/* 하루는 아침 6시에 바뀌어요: 6시 전에는 어제 과제가 그대로 보여요 */
const sday = () => ymd(new Date(Date.now() - 6 * 36e5)); let lastDay = '';
function tick() {
  if (card && lastDay && sday() !== lastDay) { render(); return; }
  if (!card) return; const lv = document.getElementById('snLive'); if (lv) lv.textContent = LS.run ? '⏺ ' + LS.run.s + (LS.run.ready ? ' · 오른쪽 아래 ▶를 누르면 시작' : LS.run.t ? ' 공부 중' : ' 멈춤') + ' · 오른쪽 아래 버튼: 누르면 멈춤/계속, 꾹 누르면 끝' : ''; runFloat();
  const rd = document.getElementById('snRead'); if (rd && LS.rd && !LS.rd.ask) { const s = (Date.now() - LS.rd.t) / 1000; rd.textContent = mmss(s); rd.style.color = s > 100 ? '#dc2626' : 'inherit'; }
  if (LS.run && runSec() >= 4 * 3600) { stopRun(); render(); }
}
function sync() {
  const st = student(), view = TEACH ? (document.querySelector('#teacherView aside.preview .canvas-box') || document.getElementById('hcPanel')) : document.getElementById('studentView'); if (!view) return;
  if (card && st && me && st.name !== me.name) { card.remove(); card = null; }
  if (!st || st.track !== 'suneung') { if (card) { card.remove(); card = null; } return; }
  const s2 = JSON.stringify([st.name, st.dday, st.daily, st.mocks, st.lbook, st.rbook, st.wbook && [st.wbook.title, st.wbook.from, st.wbook.to, st.wbook.start, (st.wbook.days || []).length]]);
  if (!card) { me = st; load(); card = el('section', 'background:var(--panel,#fff);border:2px solid var(--accent,#4f46e5);border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:6px'); card.id = 'snCard';
    if (TEACH) { card.style.marginBottom = '10px'; view.before(card); } else { const anchor = document.getElementById('sWTime') || view.querySelector('header'); if (anchor && anchor.parentNode === view) anchor.after(card); else view.prepend(card); } sig = s2; render(); }
  else if (s2 !== sig) { me = st; sig = s2; render(); }
}
setTimeout(sync, 300); setInterval(sync, 3000); setInterval(tick, 1000);
})();
