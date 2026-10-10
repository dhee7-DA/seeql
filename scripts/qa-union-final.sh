#!/usr/bin/env bash
# Catch the sweep mid-animation + orbit drag check + INNER regression.
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
agent-browser wait 2400 >/dev/null 2>&1
agent-browser eval "(() => { const t=[...document.querySelectorAll('aside button')].find(x=>/Set Operations & CASE/.test(x.textContent||'')); t?.click(); return 'mod3'; })()" >/dev/null
agent-browser wait 1000 >/dev/null 2>&1
agent-browser eval "(() => { const aside=document.querySelector('aside'); const b=[...(aside?.querySelectorAll('button')||[])].find(x=>/UNION & UNION ALL/.test(x.textContent||'')); b?.click(); return 'l17'; })()" >/dev/null
agent-browser wait 2200 >/dev/null 2>&1
agent-browser eval "(() => { const c=document.querySelector('main canvas'); c?.scrollIntoView({behavior:'instant',block:'center'}); return 'scrolled'; })()" >/dev/null

echo "== replay to restart cleanly, then sweep shots =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/replay UNION/.test(x.textContent||'')); b?.click(); return 'replayed'; })()" >/dev/null
agent-browser wait 3600 >/dev/null 2>&1
agent-browser screenshot /home/z/my-project/scripts/qa-union-sweepA.png >/dev/null 2>&1
agent-browser eval "(() => { const h=[...document.querySelectorAll('div')].map(x=>x.textContent||'').find(t=>/dedupe pass compares/.test(t)); return h?'sweep hud':'no'; })()"
agent-browser wait 700 >/dev/null 2>&1
agent-browser screenshot /home/z/my-project/scripts/qa-union-sweepB.png >/dev/null 2>&1

echo "== orbit drag check =="
agent-browser eval "(() => { const c=document.querySelector('main canvas'); const r=c.getBoundingClientRect(); return JSON.stringify({x:r.x,y:r.y,w:r.width,h:r.height}); })()"
agent-browser mouse move 640 300 >/dev/null 2>&1
agent-browser mouse down left >/dev/null 2>&1
agent-browser mouse move 790 260 >/dev/null 2>&1
agent-browser mouse up left >/dev/null 2>&1
agent-browser wait 900 >/dev/null 2>&1
agent-browser screenshot /home/z/my-project/scripts/qa-union-orbit.png >/dev/null 2>&1
echo "orbit shot taken"

echo "== INNER regression via library lightbox =="
agent-browser eval "(() => { const el=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Diagram library')); el?.click(); return 'lib'; })()" >/dev/null
agent-browser wait 2800 >/dev/null 2>&1
agent-browser eval "(() => { const inp=document.querySelector('input[type=search]'); const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(inp,'join space'); inp.dispatchEvent(new Event('input',{bubbles:true})); return 'q'; })()" >/dev/null
agent-browser wait 1200 >/dev/null 2>&1
agent-browser eval "(() => { const card=[...document.querySelectorAll('[role=button]')].find(x=>/Join Space 3d/i.test(x.textContent||'')); card?.click(); return 'card'; })()" >/dev/null
agent-browser wait 7000 >/dev/null 2>&1
agent-browser eval "(() => { const done=[...document.querySelectorAll('div')].map(x=>x.textContent||'').find(t=>/Every order found its customer — 103/.test(t)); return done?'INNER done-state OK':'INNER not done yet'; })()"
agent-browser screenshot /home/z/my-project/scripts/qa-union-inner-reg.png >/dev/null 2>&1

echo "== errors =="
agent-browser errors
echo "== END =="
