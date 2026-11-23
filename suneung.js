/* 수능 도우미 (track: 'suneung' 학생 화면에만 보여요): D-day · 매일 과제 · 과목별 공부 시간 · 독해 타이머 · 모의고사 성적 · 듣기 속도 */
(() => {
'use strict';
const app = window.alrimSync; if (!app || location.pathname.endsWith('/teacher.html')) return;
const SUBJ = ['영어', '국어', '수학', '탐구', '한국사'], WHY = ['단어를 몰라서', '해석이 안 돼서', '선지가 헷갈려서', '시간이 부족해서'];
const pad = n => String(n).padStart(2, '0');
const ymd = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const fmt = s => { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + '시간 ' : '') + m + '분' + (h ? '' : ' ' + pad(s % 60) + '초'); };
const mmss = s => Math.floor(s / 60) + ':' + pad(Math.floor(s % 60));
const el = (t, css, txt) => { const e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };
const btn = (txt, on, css) => { const b = el('button', 'font:inherit;padding:8px 12px;border-radius:10px;border:1.5px solid var(--accent,#4f46e5);background:transparent;color:var(--ink,#111);cursor:pointer;' + (css || ''), txt); b.type = 'button'; b.onclick = on; return b; };
let me = null, LS = {}, card = null, sig = '';
const key = () => 'alrim:sn:' + (me ? me.name : '');
const load = () => { try { LS = JSON.parse(localStorage.getItem(key()) || '{}'); } catch (e) { LS = {}; } LS.daily = LS.daily || {}; LS.time = LS.time || {}; LS.read = LS.read || []; };
const save = () => { try { localStorage.setItem(key(), JSON.stringify(LS)); } catch (e) {} };
function student() { try { const s = app.snapshot(), d = JSON.parse(s.data); return d.students.find(x => x.name === s.fixed) || d.students[0]; } catch (e) { return null; } }

/* ---- 공부 시간 ---- */
const runSec = () => LS.run ? Math.min(4 * 3600, (Date.now() - LS.run.t) / 1000) : 0;
function stopRun() { if (!LS.run) return; const d = ymd(new Date(LS.run.t)); LS.time[d] = LS.time[d] || {}; LS.time[d][LS.run.s] = (LS.time[d][LS.run.s] || 0) + runSec(); LS.run = null; save(); }
const dayTot = (d, s) => ((LS.time[d] || {})[s] || 0) + (LS.run && LS.run.s === s && ymd(new Date(LS.run.t)) === d ? runSec() : 0);
function weekTot() { let t = 0; for (let i = 0; i < 7; i++) { const d = ymd(new Date(Date.now() - i * 864e5)); SUBJ.forEach(s => t += dayTot(d, s)); } return t; }

function sec(title) { const d = el('details', 'border-top:1px solid var(--line,#ddd);padding:10px 0 2px'); d.open = LS['open:' + title] !== false; const sm = el('summary', 'cursor:pointer;font-weight:700;font-size:1.02rem', title); d.append(sm); d.addEventListener('toggle', () => { LS['open:' + title] = d.open; save(); }); const body = el('div', 'display:flex;flex-direction:column;gap:8px;padding:8px 0'); d.append(body); return [d, body]; }

function render() {
  if (!card) return; card.textContent = ''; const today = ymd();
  /* D-day */
  const dd = me.dday || '2027-11-18', left = Math.ceil((new Date(dd + 'T00:00:00') - new Date(today + 'T00:00:00')) / 864e5);
  const top = el('div', 'display:flex;align-items:baseline;gap:10px;flex-wrap:wrap');
  top.append(el('b', 'font-family:var(--font-display,inherit);font-size:1.7rem;color:var(--accent,#4f46e5)', '🎯 수능 ' + (left > 0 ? 'D-' + left : left === 0 ? 'D-DAY' : 'D+' + (-left))), el('span', 'color:var(--muted,#666);font-size:.9rem', dd.replace(/-/g, '.') + ' · 이번 주 공부 ' + fmt(weekTot())));
  card.append(top);
  /* 매일 과제 */
  const daily = (me.daily || []).filter(Boolean);
  if (daily.length) { const [d, b] = sec('✅ 오늘의 매일 과제'); const done = LS.daily[today] || {};
    let streak = 0; for (let i = 1; i < 400; i++) { const k = ymd(new Date(Date.now() - i * 864e5)), v = LS.daily[k] || {}; if (daily.every(t => v[t])) streak++; else break; }
    const all = daily.every(t => done[t]); if (all) streak++;
    daily.forEach(t => { const l = el('label', 'display:flex;gap:10px;align-items:center;padding:8px 10px;border:1px solid var(--line,#ddd);border-radius:10px;cursor:pointer;' + (done[t] ? 'opacity:.6;text-decoration:line-through' : '')); const c = el('input', 'width:20px;height:20px'); c.type = 'checkbox'; c.checked = !!done[t];
      c.onchange = () => { LS.daily[today] = Object.assign({}, LS.daily[today], { [t]: c.checked }); save(); render(); }; l.append(c, el('span', null, t)); b.append(l); });
    b.append(el('small', 'color:var(--muted,#666)', (all ? '오늘 매일 과제를 다 했어요! ' : daily.filter(t => !done[t]).length + '개 남았어요. ') + (streak ? '🔥 연속 ' + streak + '일' : ''))); card.append(d); }
  /* 공부 시간 */
  { const [d, b] = sec('⏱ 과목별 공부 시간'); const row = el('div', 'display:flex;flex-wrap:wrap;gap:6px');
    SUBJ.forEach(s => { const on = LS.run && LS.run.s === s; const x = btn((on ? '⏸ ' : '▶ ') + s, () => { const was = on; stopRun(); if (!was) { LS.run = { s, t: Date.now() }; save(); } render(); }, on ? 'background:var(--accent,#4f46e5);color:#fff;font-weight:700' : ''); row.append(x); });
    b.append(row); const live = el('div', 'font-weight:700'); live.id = 'snLive'; b.append(live);
    const tb = el('div', 'display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px'); let tot = 0;
    SUBJ.forEach(s => { const v = dayTot(today, s); tot += v; const c = el('div', 'padding:6px 8px;border-radius:8px;background:var(--soft,#eef);font-size:.88rem'); c.append(el('b', 'display:block', s), el('span', null, fmt(v))); c.dataset.s = s; tb.append(c); });
    b.append(tb, el('small', 'color:var(--muted,#666)', '과목을 누르면 시간이 흘러요. 다시 누르면 멈춰요. 오늘 합계 ' + fmt(tot))); card.append(d); }
  /* 독해 타이머 */
  { const [d, b] = sec('📖 독해 타이머 · 오답 이유'); const R = LS.rd;
    if (!R) { b.append(btn('▶ 독해 시작 (지문마다 시간 재기)', () => { LS.rd = { n: 1, t: Date.now(), log: [] }; save(); render(); }, 'background:var(--accent,#4f46e5);color:#fff;font-weight:700')); }
    else if (R.ask) { b.append(el('b', null, R.n + '번 지문 · 왜 틀렸나요?')); const row = el('div', 'display:flex;flex-wrap:wrap;gap:6px'); WHY.forEach(w => row.append(btn(w, () => { R.log.push({ s: R.ask, ok: false, why: w }); R.ask = 0; R.n++; R.t = Date.now(); save(); render(); }))); b.append(row); }
    else { const t = el('div', 'font-family:var(--font-display,inherit);font-size:2rem'); t.id = 'snRead'; b.append(el('b', null, R.n + '번 지문 푸는 중 (목표 1:40)'), t);
      const row = el('div', 'display:flex;flex-wrap:wrap;gap:6px'); const lap = () => (Date.now() - R.t) / 1000;
      row.append(btn('⭕ 맞음 · 다음 지문', () => { R.log.push({ s: lap(), ok: true }); R.n++; R.t = Date.now(); save(); render(); }), btn('❌ 틀림', () => { R.ask = lap(); save(); render(); }),
        btn('끝내기', () => { if (R.log.length) LS.read.push({ d: today, log: R.log }); LS.read = LS.read.slice(-200); LS.rd = null; save(); render(); }));
      b.append(row, el('small', 'color:var(--muted,#666)', '지문을 다 풀고 채점한 뒤 맞음/틀림을 눌러도 돼요. 지금까지 ' + R.log.length + '지문')); }
    const recent = LS.read.filter(x => x.d >= ymd(new Date(Date.now() - 30 * 864e5))), all = [].concat(...recent.map(x => x.log));
    if (all.length) { const avg = all.reduce((a, x) => a + x.s, 0) / all.length, wrong = all.filter(x => !x.ok), cnt = {}; wrong.forEach(x => cnt[x.why] = (cnt[x.why] || 0) + 1);
      b.append(el('div', 'font-size:.92rem', '최근 30일: ' + all.length + '지문 · 평균 ' + mmss(avg) + ' · 정답률 ' + Math.round((all.length - wrong.length) / all.length * 100) + '%'));
      const mx = Math.max(1, ...Object.values(cnt)); WHY.forEach(w => { const n = cnt[w] || 0; const r = el('div', 'display:grid;grid-template-columns:8.5em 1fr 2em;gap:6px;align-items:center;font-size:.86rem'); const bar = el('div', 'height:10px;border-radius:5px;background:var(--soft,#eef);overflow:hidden'); bar.append(el('i', 'display:block;height:100%;background:#dc2626;width:' + (n / mx * 100) + '%')); r.append(el('span', null, w), bar, el('b', null, n)); b.append(r); });
      const topWhy = Object.entries(cnt).sort((a, c) => c[1] - a[1])[0]; if (topWhy) b.append(el('small', 'color:var(--muted,#666)', '가장 많은 이유: ' + topWhy[0] + ({ '단어를 몰라서': ' → 지문 단어 정리와 단어 암기를 늘려요.', '해석이 안 돼서': ' → 구문 분석(문장연습)을 더 해요.', '선지가 헷갈려서': ' → 선지의 근거 문장을 지문에서 찾아 표시해요.', '시간이 부족해서': ' → 쉬운 유형부터 풀고, 지문당 1:40을 지켜요.' })[topWhy[0]])); }
    card.append(d); }
  /* 모의고사 */
  const mocks = (me.mocks || []).slice().sort((a, c) => (a.date || '').localeCompare(c.date || ''));
  if (mocks.length) { const [d, b] = sec('📊 모의고사 성적'); const cols = [['kor', '국어'], ['math', '수학'], ['eng', '영어'], ['t1', '탐구1'], ['t2', '탐구2']];
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
  /* 듣기 속도 */
  { const [d, b] = sec('🎧 듣기 속도'); let cur = 1; try { cur = parseFloat(localStorage.getItem('alrim:rate')) || 1; } catch (e) {} const row = el('div', 'display:flex;flex-wrap:wrap;gap:6px');
    [0.8, 1, 1.2, 1.5].forEach(r => row.append(btn(r + '배', () => { try { localStorage.setItem('alrim:rate', r); } catch (e) {} render(); }, r === cur ? 'background:var(--accent,#4f46e5);color:#fff;font-weight:700' : '')));
    b.append(row, el('small', 'color:var(--muted,#666)', '듣기 과제 음원에 적용돼요. 1.2배로 연습하면 실전이 느리게 들려요.')); card.append(d); }
  tick();
}
function tick() {
  if (!card) return; const lv = document.getElementById('snLive'); if (lv) lv.textContent = LS.run ? '⏱ ' + LS.run.s + ' 공부 중 · ' + fmt(runSec()) : '';
  const rd = document.getElementById('snRead'); if (rd && LS.rd && !LS.rd.ask) { const s = (Date.now() - LS.rd.t) / 1000; rd.textContent = mmss(s); rd.style.color = s > 100 ? '#dc2626' : 'inherit'; }
  if (LS.run && runSec() >= 4 * 3600) { stopRun(); render(); }
}
function sync() {
  const st = student(), view = document.getElementById('studentView'); if (!view) return;
  if (!st || st.track !== 'suneung') { if (card) { card.remove(); card = null; } return; }
  const s2 = JSON.stringify([st.name, st.dday, st.daily, st.mocks]);
  if (!card) { me = st; load(); card = el('section', 'background:var(--panel,#fff);border:2px solid var(--accent,#4f46e5);border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:6px'); card.id = 'snCard';
    const anchor = document.getElementById('sWTime') || view.querySelector('header'); if (anchor && anchor.parentNode === view) anchor.after(card); else view.prepend(card); sig = s2; render(); }
  else if (s2 !== sig) { me = st; sig = s2; render(); }
}
setTimeout(sync, 300); setInterval(sync, 3000); setInterval(tick, 1000);
})();
