#!/bin/bash
# QA sweep: walk lessons + overview + capstone at a given viewport.
# Usage: bash scripts/qa-sweep.sh 1440 900
set -e
W=${1:-1440}; H=${2:-900}
cd /home/z/my-project
agent-browser set viewport $W $H >/dev/null
agent-browser wait 600 >/dev/null

click_nav() {  # $1 = index (0..20) among aside nav buttons
  agent-browser eval "(() => { const b = document.querySelectorAll('aside nav button, aside .overflow-x-auto button'); if (b[$1]) { b[$1].click(); return 'ok'; } return 'missing'; })()" >/dev/null
  agent-browser wait 1300 >/dev/null
}

echo "=== viewport ${W}x${H} ==="
for i in 0 1 2 3 4 5 6 7; do
  click_nav $i
  echo "--- lesson $((i+1)) ---"
  agent-browser eval "$(cat scripts/qa-svg-check.js)" 2>/dev/null | tail -1
done
echo "--- overview ---"
agent-browser eval "(() => { const b=document.querySelectorAll('header button, main button'); for (const x of b) if ((x.textContent||'').includes('SQL Foundations')) { x.click(); return 'ok'; } return 'no'; })()" >/dev/null
agent-browser wait 1200 >/dev/null
agent-browser eval "$(cat scripts/qa-svg-check.js)" 2>/dev/null | tail -1
echo "--- capstone case (index 20) ---"
click_nav 20
agent-browser eval "$(cat scripts/qa-svg-check.js)" 2>/dev/null | tail -1
echo "=== console errors ==="
agent-browser errors 2>&1 | tail -4
