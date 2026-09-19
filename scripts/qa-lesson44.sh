#!/usr/bin/env bash
# One-shot browser QA for lesson-44 3D figure (w44-atomic-space-3d).
# Everything runs inside a single call because the sandbox reaps
# background processes when the Bash tool call ends.
#
# Navigation notes (hard-won):
#   - #learn lands on the course grid; the left sidebar lists modules too,
#     but its bottom rows sit under a covering panel (div.shrink-0.border-t)
#     and clicks there are rejected — so we always use the course GRID.
#   - '44 UPSERT' matches twice once Module 7 is expanded: sidebar row first,
#     grid row last — take the LAST ref.
#   - The browser profile persists between runs, so Module 7 may already be
#     expanded; only toggle the card when the grid row is missing.
set -u
cd /home/z/my-project

# 1. private dev server
setsid bash -c 'exec bunx next dev -p 3101 >> /home/z/my-project/scripts/tmp/qa-dev-44.log 2>&1' < /dev/null > /dev/null 2>&1 &
for i in $(seq 1 40); do
  sleep 2
  curl -s -o /dev/null http://localhost:3101 && break
done
echo "server: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3101)"

# 2. straight into the learn view; clear console
agent-browser open "http://localhost:3101/#learn" || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1
agent-browser eval "window.scrollTo(0,0); 'top'" > /dev/null
sleep 2

# 3. enter lesson-44 through the course grid, verifying every step
entered=0
for attempt in 1 2 3; do
  COUNT=$(agent-browser snapshot -i -c 2>/dev/null | grep -c '44 UPSERT' || true)
  if [ "${COUNT:-0}" -lt 2 ]; then
    MREF=$(agent-browser snapshot -i -c 2>/dev/null | grep 'MODULE 7' | grep -o 'ref=e[0-9]*' | head -1 | cut -d= -f2)
    echo "attempt $attempt: expanding module card ${MREF:-MISSING}"
    [ -n "${MREF:-}" ] && agent-browser click "@$MREF" || true
    sleep 2
  fi
  REF=$(agent-browser snapshot -i -c 2>/dev/null | grep '44 UPSERT' | tail -1 | grep -o 'ref=e[0-9]*' | cut -d= -f2)
  if [ -n "${REF:-}" ]; then
    echo "attempt $attempt: clicking grid row $REF"
    agent-browser click "@$REF" || true
    sleep 3
    if agent-browser wait --fn "document.querySelectorAll('canvas').length >= 1" --timeout 8000; then
      entered=1
      break
    fi
  fi
  agent-browser eval "window.scrollTo(0,0); 'top'" > /dev/null
done
echo "entered lesson: $entered"
[ "$entered" = "1" ] || exit 1
echo "canvases: $(agent-browser eval "document.querySelectorAll('canvas').length" 2>/dev/null)"

# 4. scroll the figure into view; catch act 1 mid-flight, then the done state
agent-browser eval "document.querySelector('canvas')?.closest('div[role=\"img\"]')?.scrollIntoView({block:'center'}); 'scrolled'"
sleep 4
agent-browser screenshot /home/z/my-project/scripts/qa-l44-act1.png
sleep 12
agent-browser screenshot /home/z/my-project/scripts/qa-l44-done.png
agent-browser eval "
  (() => {
    const aria = document.querySelector('div[role=\"img\"]')?.getAttribute('aria-label') || '';
    const body = document.body.innerText || '';
    return JSON.stringify({
      ariaSnippet: aria.slice(0, 70),
      hudDone: body.includes('nothing stranded'),
      chipRestored: body.includes('1000.00 · restored'),
      canvasCount: document.querySelectorAll('canvas').length,
    });
  })()
"
echo "--- page errors ---"
agent-browser errors
echo "--- done ---"
