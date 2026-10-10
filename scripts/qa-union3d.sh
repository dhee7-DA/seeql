#!/usr/bin/env bash
# One-shot live QA for 3D #6 — UNION in space (lesson-17). Correct navigation:
# module toggle "3 Set Operations & CASE" -> lesson button "17 UNION...".
set -u
cd /home/z/my-project
bun run dev > /dev/null 2>&1 &
DEV_PID=$!
cleanup() { kill $DEV_PID 2>/dev/null; }
trap cleanup EXIT
for i in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || true)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "== server $code =="
agent-browser close >/dev/null 2>&1
agent-browser open http://localhost:3000 >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser wait 1200 >/dev/null 2>&1
agent-browser storage local clear >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
agent-browser eval "(() => { const el=document.querySelector('button.btn-glow'); el?.click(); return 'in'; })()" >/dev/null
agent-browser wait 2500 >/dev/null 2>&1

echo "== open module 3 (Set Operations & CASE) =="
agent-browser eval "(() => { const t=[...document.querySelectorAll('aside button')].find(x=>/Set Operations & CASE/.test(x.textContent||'')); t?.click(); return t?'mod3':'nomod'; })()"
agent-browser wait 1200 >/dev/null 2>&1
echo "== click lesson 17 =="
agent-browser eval "(() => { const aside=document.querySelector('aside'); const b=[...(aside?.querySelectorAll('button')||[])].find(x=>/UNION & UNION ALL/.test(x.textContent||'')); b?.click(); return b?'l17':'nolesson'; })()"
agent-browser wait 2800 >/dev/null 2>&1
echo "== content check =="
agent-browser eval "(() => { const main=document.querySelector('main'); const h1=main?.querySelector('h1')?.textContent; const canvases=document.querySelectorAll('main canvas').length; const lead=!!main?.textContent?.includes('The same stack, in space'); return JSON.stringify({h1, canvases, lead}); })()"

echo "== scroll to scene, mid-stack (t≈2.6s) =="
agent-browser eval "(() => { const c=document.querySelector('main canvas'); c?.scrollIntoView({behavior:'instant',block:'center'}); return 'scrolled'; })()" >/dev/null
agent-browser wait 2600 >/dev/null 2>&1
agent-browser screenshot /home/z/my-project/scripts/qa-union-stack.png >/dev/null 2>&1
agent-browser eval "(() => { const h=[...document.querySelectorAll('div')].map(x=>x.textContent||'').find(t=>/rows stacked — UNION ALL/.test(t)); return h?h.slice(-70):'no hud'; })()"

echo "== sweep phase (t≈6s) =="
agent-browser wait 3400 >/dev/null 2>&1
agent-browser screenshot /home/z/my-project/scripts/qa-union-sweep.png >/dev/null 2>&1
agent-browser eval "(() => { const h=[...document.querySelectorAll('div')].map(x=>x.textContent||'').find(t=>/dedupe pass compares entire rows/.test(t)); return h?h.slice(-80):'not yet'; })()"

echo "== moral phase (t≈9.5s) =="
agent-browser wait 3500 >/dev/null 2>&1
agent-browser screenshot /home/z/my-project/scripts/qa-union-moral.png >/dev/null 2>&1
agent-browser eval "(() => { const h=[...document.querySelectorAll('div')].map(x=>x.textContent||'').find(t=>/22 rows in/.test(t)); const r=[...document.querySelectorAll('div')].map(x=>x.textContent||'').find(t=>/22 stacked/.test(t)); return 'hud:'+(h?'yes':'no')+' slab:'+(r?'yes':'no'); })()"

echo "== replay =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/replay UNION/.test(x.textContent||'')); b?.click(); return b?'replayed':'nobtn'; })()"
agent-browser wait 1600 >/dev/null 2>&1
agent-browser eval "(() => { const h=[...document.querySelectorAll('div')].map(x=>x.textContent||'').find(t=>/rows stacked — UNION ALL/.test(t)); return h?'hud back to stack':'hud stuck'; })()"

echo "== page errors =="
agent-browser errors
echo "== QA END =="
