#!/usr/bin/env bash
# Debug 3: clean profile, full module list, open lesson-17.
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
echo "== ALL module toggles (unfiltered) =="
agent-browser eval "(() => { const bs=[...document.querySelectorAll('aside button')].map(x=>x.textContent.trim().replace(/\s+/g,' ')); return bs.filter(t=>/min/.test(t)).join(' § '); })()"
echo "== find module containing UNION lesson =="
agent-browser eval "(() => { const bs=[...document.querySelectorAll('aside button')].filter(x=>/min/.test(x.textContent)); const hit=bs.find(x=>/UNION & UNION ALL/.test(x.textContent)); if(hit) return 'lesson already visible'; return bs.length+' toggles'; })()"
echo "== expand every collapsed module then find lesson 17 =="
agent-browser eval "(() => { const bs=[...document.querySelectorAll('aside button')].filter(x=>/min/.test(x.textContent)); bs.forEach(x=>x.click()); return 'clicked '+bs.length; })()" >/dev/null
agent-browser wait 1500 >/dev/null 2>&1
agent-browser eval "(() => { const aside=document.querySelector('aside'); const b=[...(aside?.querySelectorAll('button')||[])].find(x=>x.textContent.trim().startsWith('17')); b?.click(); return b?'lesson17 clicked':'no 17'; })()"
agent-browser wait 3000 >/dev/null 2>&1
echo "== main content check =="
agent-browser eval "(() => { const main=document.querySelector('main'); const h1=main?.querySelector('h1')?.textContent; const canvases=document.querySelectorAll('main canvas').length; const lead=!!main?.textContent?.includes('The same stack, in space'); return JSON.stringify({h1, canvases, lead}); })()"
agent-browser screenshot /home/z/my-project/scripts/qa-union-debug3.png >/dev/null 2>&1
echo "== errors =="
agent-browser errors
echo "== END =="
