#!/usr/bin/env bash
# Debug 2: full module list, then open lesson-17 via its true module.
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
echo "== ALL sidebar module toggles =="
agent-browser eval "(() => { return [...document.querySelectorAll('aside button')].map(x=>x.textContent.trim().replace(/\s+/g,' ')).filter(t=>/min ·/.test(t)).join(' § '); })()"
echo "== END =="
