#!/usr/bin/env bash
# Debug: what does lesson-17 look like after navigation?
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
agent-browser wait 1500 >/dev/null 2>&1
agent-browser eval "(() => { const el=document.querySelector('button.btn-glow'); el?.click(); return 'in'; })()" >/dev/null
agent-browser wait 2200 >/dev/null 2>&1
echo "== sidebar module buttons =="
agent-browser eval "(() => { return [...document.querySelectorAll('aside button')].map(x=>x.textContent.trim().replace(/\n/g,' | ')).filter(t=>/·/.test(t)).slice(0,10).join(' § '); })()"
echo "== click module 3 =="
agent-browser eval "(() => { const t=[...document.querySelectorAll('aside button')].find(x=>/3 ·/.test(x.textContent||'')); const before=t?.textContent.slice(0,40); t?.click(); return before||'nomod'; })()"
agent-browser wait 1200 >/dev/null 2>&1
echo "== lesson buttons visible in module 3 =="
agent-browser eval "(() => { const aside=document.querySelector('aside'); const btns=[...(aside?.querySelectorAll('button')||[])].map(x=>x.textContent.trim().replace(/\n/g,' ')).filter(t=>/^17|UNION/.test(t)); return btns.join(' § ')||'none'; })()"
echo "== click lesson 17 =="
agent-browser eval "(() => { const aside=document.querySelector('aside'); const b=[...(aside?.querySelectorAll('button')||[])].find(x=>x.textContent.trim().startsWith('17')); b?.click(); return b?'clicked':'nobtn'; })()"
agent-browser wait 3000 >/dev/null 2>&1
echo "== main content check =="
agent-browser eval "(() => { const main=document.querySelector('main'); const h1=main?.querySelector('h1')?.textContent; const canvases=document.querySelectorAll('main canvas').length; const figs=main?.querySelectorAll('figure').length; const deep=!!main?.textContent?.includes('The same stack, in space'); return JSON.stringify({h1, canvases, figs, deep}); })()"
agent-browser screenshot /home/z/my-project/scripts/qa-union-debug.png >/dev/null 2>&1
echo "== errors =="
agent-browser errors
echo "== END =="
