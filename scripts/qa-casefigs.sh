#!/usr/bin/env bash
# One-shot browser QA for the case-study figures (caselesson-figs-1).
# Navigates the SPA grid into L35 / L36 / L39 / L51 and verifies the new
# figures render, reusing the qa-lesson44.sh navigation laws:
#   - course GRID rows, never the covered sidebar bottom
#   - re-snapshot then click the LAST matching ref immediately
set -u
cd /home/z/my-project
BASE=http://localhost:3000

agent-browser open "$BASE/#learn" || exit 1
agent-browser wait --load networkidle > /dev/null 2>&1
agent-browser errors --clear > /dev/null 2>&1
agent-browser eval "window.scrollTo(0,0); 'top'" > /dev/null
sleep 2

enter_lesson () { # $1 = module grep, $2 = lesson grep, $3 = label
  echo "=== $3 ==="
  for attempt in 1 2 3; do
    COUNT=$(agent-browser snapshot -i -c 2>/dev/null | grep -c "$2" || true)
    if [ "${COUNT:-0}" -lt 1 ]; then
      MREF=$(agent-browser snapshot -i -c 2>/dev/null | grep "$1" | grep -o 'ref=e[0-9]*' | head -1 | cut -d= -f2)
      [ -n "${MREF:-}" ] && agent-browser click "@$MREF" > /dev/null 2>&1
      sleep 2
    else
      break
    fi
  done
  LREF=$(agent-browser snapshot -i -c 2>/dev/null | grep "$2" | grep -o 'ref=e[0-9]*' | tail -1 | cut -d= -f2)
  echo "lesson ref: ${LREF:-MISSING}"
  [ -n "${LREF:-}" ] && agent-browser click "@$LREF" > /dev/null 2>&1
  sleep 3
  agent-browser eval "(() => { const svgs=[...document.querySelectorAll('figure svg')].length; const caps=[...document.querySelectorAll('figcaption')].map(f=>f.textContent.slice(0,44)); return JSON.stringify({svgs, caps}); })()" 2>/dev/null | tail -1
  ERRS=$(agent-browser errors 2>/dev/null | grep -c "Error" || true)
  echo "page errors: ${ERRS:-0}"
  agent-browser errors --clear > /dev/null 2>&1
}

enter_lesson "MODULE 1" "analyst's first week" "L35 (3 figures expected)"
enter_lesson "MODULE 2" "still buying" "L36 (1 figure expected)"
enter_lesson "MODULE 5" "ops calendar" "L39 (1 figure expected)"
enter_lesson "MODULE 8" "reporting layer" "L51 (1 figure expected)"
echo "=== done ==="
