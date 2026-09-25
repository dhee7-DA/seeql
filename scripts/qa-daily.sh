#!/bin/bash
# QA — Daily puzzle calendar v5 (final)
# Browser-local today = 2026-09-22 → dp-19; backlog 09-21 → dp-12.
# All innerText checks lowercase; day→puzzle mapping from scripts/today-puzzle.ts.
set -e
BASE="http://localhost:3000"
SESS="${1:-dq-$(date +%s)}"
OUT="/home/z/my-project/scripts/qa-daily"
mkdir -p "$OUT"

# poll-click the Run & solve button (target prefetch can take a moment)
runbtn() {
  for i in $(seq 1 12); do
    r=$(agent-browser --session ${SESS} eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Run & solve') && !x.disabled); if(b){b.click(); return 'ran';} return 'wait'; })()" 2>/dev/null)
    [ "$r" = "\"ran\"" ] && { echo ran; return 0; }
    sleep 1
  done
  echo NEVER-ENABLED; return 1
}

echo "== 1. fresh session → learn → Daily puzzle =="
agent-browser --session "$SESS" open "$BASE/#learn?fresh=${SESS}" >/dev/null
agent-browser --session "$SESS" wait --load networkidle >/dev/null
sleep 2.5
agent-browser --session "$SESS" eval "(() => { const t=[...document.querySelectorAll('button,a')].find(el=>el.textContent && el.textContent.includes('Daily puzzle')); if(t){t.click(); return 'clicked';} return 'NOT FOUND'; })()"
sleep 1.5
agent-browser --session "$SESS" eval "(() => {
  const L=(s)=>document.body.innerText.toLowerCase().includes(s);
  return JSON.stringify({
    h1: L('daily puzzle'), strip: L('day puzzle streak'), freeze: L('freeze tokens'),
    month: L('september 2026'), rotation: L('in rotation'),
    chip: document.body.innerText.match(/DP-\d+/)?.[0],
    today: /\btoday\b/i.test(document.body.innerText),
    freshStreak: document.body.innerText.match(/(\d+)\s*\n?\s*day puzzle streak/i)?.[1],
  });
})()"

echo "== 2. hints =="
agent-browser --session "$SESS" eval "(() => { const h=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Hint 1'); return h ? (h.click(),'ok') : 'no btn'; })()"
sleep 0.4
agent-browser --session "$SESS" eval "(() => document.body.innerText.includes('correlated subquery does it in one table') ? 'HINT1 OK' : 'HINT1 MISSING')()"
agent-browser --session "$SESS" eval "(() => { const h=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Hint 2'); return h ? (h.click(),'ok') : 'no btn'; })()"
sleep 0.4
agent-browser --session "$SESS" eval "(() => document.body.innerText.includes('Repeat the correlated subquery') ? 'HINT2 OK' : 'HINT2 MISSING')()"

echo "== 3. solve TODAY first-run (clean bonus) =="
agent-browser --session "$SESS" eval "(() => {
  const ta=document.querySelector('textarea');
  const s=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
  const sql=['SELECT p.name, p.category, p.stock,','       ROUND((SELECT AVG(p2.stock) FROM products p2 WHERE p2.category = p.category), 2) AS cat_avg','FROM products p','WHERE p.stock < (SELECT AVG(p2.stock) FROM products p2 WHERE p2.category = p.category)','ORDER BY p.stock - (SELECT AVG(p2.stock) FROM products p2 WHERE p2.category = p.category)'].join('\\n');
  s.call(ta,sql);
  ta.dispatchEvent(new Event('input',{bubbles:true}));
  return 'typed';
})()"
sleep 0.6
runbtn
sleep 2.5
agent-browser --session "$SESS" eval "(() => {
  const L=(s)=>document.body.innerText.toLowerCase().includes(s);
  return JSON.stringify({
    verdict: L(\"today's puzzle — done\"), advanced: L('streak advances'),
    xp25: L('+25 xp'), clean5: L('+5 xp'),
    grids: L('your rows') && L('the target'), lesson: L('why it matters'),
    cellSolved: [...document.querySelectorAll('button')].some(b=>b.getAttribute('aria-label')==='2026-09-22 — solved'),
  });
})()"
agent-browser --session "$SESS" set viewport 1280 900 >/dev/null
sleep 0.5
agent-browser --session "$SESS" screenshot "$OUT/daily-solved.png" >/dev/null

echo "== 4. persistence across reload =="
agent-browser --session "$SESS" open "$BASE/#learn?fresh=${SESS}b" >/dev/null
agent-browser --session "$SESS" wait --load networkidle >/dev/null
sleep 2.5
agent-browser --session "$SESS" eval "(() => { const t=[...document.querySelectorAll('button,a')].find(el=>el.textContent && el.textContent.includes('Daily puzzle')); if(t){t.click(); return 'reopened';} return 'NOT FOUND'; })()"
sleep 1.5
agent-browser --session "$SESS" eval "(() => {
  const L=(s)=>document.body.innerText.toLowerCase().includes(s);
  return JSON.stringify({ solvedCard: L('solved · 2026-09-22'), streak: document.body.innerText.match(/(\d+)\s*\n?\s*day puzzle streak/i)?.[1] });
})()"

echo "== 5. backlog 09-21 (dp-12): wrong then right =="
agent-browser --session "$SESS" eval "(() => {
  const c=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='2026-09-21 — unsolved');
  return c ? (c.click(),'picked') : 'NO CELL';
})()"
sleep 1.2
agent-browser --session "$SESS" eval "(() => document.body.innerText.match(/DP-\d+/)?.[0] || 'no chip')()"
agent-browser --session "$SESS" eval "(() => {
  const ta=document.querySelector('textarea');
  const s=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
  s.call(ta,'SELECT name FROM customers');
  ta.dispatchEvent(new Event('input',{bubbles:true}));
  return 'wrong typed';
})()"
sleep 0.6
runbtn
sleep 2.2
agent-browser --session "$SESS" eval "(() => document.body.innerText.toLowerCase().includes('not the target rows') ? 'WRONG VERDICT OK' : 'MISSING')()"
agent-browser --session "$SESS" eval "(() => {
  const ta=document.querySelector('textarea');
  const s=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
  const sql=['SELECT c.name, c.region','FROM customers c','WHERE c.id NOT IN (SELECT customer_id FROM invoices)','ORDER BY c.name'].join('\\n');
  s.call(ta,sql);
  ta.dispatchEvent(new Event('input',{bubbles:true}));
  return 'dp-12 typed';
})()"
sleep 0.6
runbtn
sleep 2.5
agent-browser --session "$SESS" eval "(() => {
  const L=(s)=>document.body.innerText.toLowerCase().includes(s);
  return JSON.stringify({
    cleared: L('backlog cleared'), xp15: L('+15 xp'),
    noStreakNote: L(\"streak only moves on today's puzzle\"),
    grids: L('your rows') && L('the target'),
    d21solved: [...document.querySelectorAll('button')].some(b=>b.getAttribute('aria-label')==='2026-09-21 — solved'),
  });
})()"
agent-browser --session "$SESS" screenshot "$OUT/daily-desktop.png" >/dev/null

echo "== 6. nav + seals + future =="
agent-browser --session "$SESS" eval "(() => { document.querySelector('button[aria-label=\"Previous month\"]')?.click(); return 'prev'; })()"
sleep 0.8
agent-browser --session "$SESS" eval "(() => { document.querySelector('button[aria-label=\"Previous month\"]')?.click(); return 'prev2'; })()"
sleep 0.8
agent-browser --session "$SESS" eval "(() => {
  const sealed=[...document.querySelectorAll('button')].filter(b=>(b.getAttribute('aria-label')||'').includes('sealed'));
  if(!sealed.length) return 'NO SEALED CELLS';
  sealed[0].click(); return 'picked '+sealed[0].getAttribute('aria-label');
})()"
sleep 0.8
agent-browser --session "$SESS" eval "(() => document.body.innerText.toLowerCase().includes('only the current and previous month stay open') ? 'SEAL PANEL OK' : 'SEAL MISSING')()"
agent-browser --session "$SESS" eval "(() => { document.querySelector('button[aria-label=\"Next month\"]')?.click(); document.querySelector('button[aria-label=\"Next month\"]')?.click(); return 'back'; })()"
sleep 0.8
agent-browser --session "$SESS" eval "(() => {
  const c=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='2026-09-30 — locked');
  return c ? 'future disabled='+c.disabled : 'NO CELL';
})()"

echo "== 7. mobile =="
agent-browser --session "$SESS" set viewport 390 844 >/dev/null
sleep 0.8
agent-browser --session "$SESS" eval "(() => 'rail Daily chips: ' + [...document.querySelectorAll('button,a')].filter(el=>el.textContent.trim()==='Daily').length)()"
agent-browser --session "$SESS" screenshot "$OUT/daily-mobile.png" >/dev/null

echo "== 8. console errors =="
agent-browser --session "$SESS" errors || true

echo "QA DONE"
