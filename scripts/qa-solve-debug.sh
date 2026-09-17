#!/bin/bash
# Debug the solve flow — dump slot/chip state before and after check.
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

agent-browser open http://localhost:3000/ || exit 1
agent-browser wait --load networkidle
agent-browser wait 1200
agent-browser find role button click --name "Start learning"
agent-browser wait 2000
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/^1\s*Databases, tables/.test((x.textContent||'').trim())); b && b.click(); return 'nav'; })()"
agent-browser wait 1800
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/Case Files/.test(x.textContent||'')); b && b.click(); return 'tab'; })()"
agent-browser wait 1200

echo "== chip button census =="
agent-browser eval "(() => {
  const chips=[...document.querySelectorAll('button')].filter(b=>b.className.includes('rounded-full')&&b.className.includes('font-mono'));
  return JSON.stringify({count: chips.length, first8: chips.slice(0,8).map(c=>c.textContent.trim())});
})()"

echo "== place chips =="
agent-browser eval "(() => {
  const chips=[...document.querySelectorAll('button')].filter(b=>b.className.includes('rounded-full')&&b.className.includes('font-mono'));
  const pick=(t)=>{ const c=chips.find(x=>x.textContent.trim()===t&&x.offsetParent!==null); if(!c) return 'MISSING '+t; c.click(); return 'ok'; };
  return JSON.stringify([pick('SELECT'),pick('*'),pick('FROM'),pick('products')]);
})()"
agent-browser wait 600

echo "== slot state after placement =="
agent-browser eval "(() => {
  const slots=[...document.querySelectorAll('button[title]')].filter(b=>/^Slot \\d/.test(b.title));
  return JSON.stringify(slots.slice(0,6).map(s=>({t:s.title, txt:s.textContent.trim().slice(0,20)})));
})()"

echo "== click check =="
agent-browser eval "(() => {
  const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='Check answer'&&x.offsetParent!==null);
  if(!b) return 'check NOT FOUND'; b.click(); return 'clicked';
})()"
agent-browser wait 1800

echo "== card 1 text after check =="
agent-browser eval "(() => {
  const body=document.body.innerText;
  return JSON.stringify({
    rebuilt: /Rebuilt correctly/i.test(body),
    notquite: /Not quite/i.test(body),
    slotcoaching: /Slot \\d/.test(body),
    toast: (body.match(/\\+\\d+ XP[^\\n]{0,40}/g)||[]).slice(0,3),
  });
})()"
echo "DONE"
