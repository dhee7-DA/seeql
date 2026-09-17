#!/bin/bash
# Solve-flow spot check on the new default theme (Onyx & Gold):
# solve l1-c01 (SELECT * FROM products) via scoped DOM clicks,
# verify the verdict panel + XP toast, screenshot the solved state.
set -u
cd /home/z/my-project

bun run dev >> dev.log 2>&1 &
DEV_PID=$!
trap 'kill $DEV_PID 2>/dev/null' EXIT

for i in $(seq 1 90); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/ 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "server ready"

agent-browser open http://localhost:3000/ || exit 1
agent-browser wait --load networkidle
agent-browser wait 1200
agent-browser find role button click --name "Start learning"
agent-browser wait 2000
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/^1\s*Databases, tables/.test((x.textContent||'').trim())); b && b.click(); return 'nav'; })()"
agent-browser wait 1800
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/Case Files/.test(x.textContent||'')); b && b.click(); return 'tab'; })()"
agent-browser wait 1200

echo "== ensure Onyx =="
agent-browser find first "button[aria-label^='Change theme']" click
agent-browser wait 600
agent-browser eval "(() => { const m=[...document.querySelectorAll('[role=menuitem]')].find(x=>x.textContent.includes('Onyx & Gold')); m && m.click(); return 'ok'; })()"
agent-browser wait 800

echo "== solve l1-c01: SELECT * FROM products (one tick per chip) =="
agent-browser eval "(() => {
  const c=[...document.querySelectorAll('button')].filter(b=>b.className.includes('rounded-full')&&b.className.includes('font-mono')&&b.offsetParent!==null).find(x=>x.textContent.trim()==='SELECT');
  if(!c) return 'chip SELECT NOT FOUND'; c.click(); return 'placed SELECT';
})()"
agent-browser wait 250
agent-browser eval "(() => {
  const c=[...document.querySelectorAll('button')].filter(b=>b.className.includes('rounded-full')&&b.className.includes('font-mono')&&b.offsetParent!==null).find(x=>x.textContent.trim()==='*');
  if(!c) return 'chip * NOT FOUND'; c.click(); return 'placed *';
})()"
agent-browser wait 250
agent-browser eval "(() => {
  const c=[...document.querySelectorAll('button')].filter(b=>b.className.includes('rounded-full')&&b.className.includes('font-mono')&&b.offsetParent!==null).find(x=>x.textContent.trim()==='FROM');
  if(!c) return 'chip FROM NOT FOUND'; c.click(); return 'placed FROM';
})()"
agent-browser wait 250
agent-browser eval "(() => {
  const c=[...document.querySelectorAll('button')].filter(b=>b.className.includes('rounded-full')&&b.className.includes('font-mono')&&b.offsetParent!==null).find(x=>x.textContent.trim()==='products');
  if(!c) return 'chip products NOT FOUND'; c.click(); return 'placed products';
})()"
agent-browser wait 500
agent-browser scroll down 500
agent-browser wait 400
agent-browser screenshot /home/z/my-project/scripts/qa-solve-placed.png
agent-browser eval "(() => {
  const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='Check answer'&&x.offsetParent!==null);
  if(!b) return 'check btn NOT FOUND'; b.click(); return 'checked';
})()"
agent-browser wait 1500
agent-browser scroll down 150
agent-browser wait 400
agent-browser eval "(() => {
  const body=document.body.innerText;
  return JSON.stringify({
    verdict: /Rebuilt correctly/i.test(body) ? 'correct-verdict-shown' : 'NO VERDICT',
    xp: (body.match(/\+\d+ XP[^\\n]*/)||[])[0] || 'no xp text',
  });
})()"
agent-browser screenshot /home/z/my-project/scripts/qa-solve-solved-onyx.png
echo "DONE"
