#!/usr/bin/env bash
# One-shot browser QA for lesson-32 3D figure (t32-running-space-3d).
# Everything runs inside a single call because the sandbox reaps
# background processes when the Bash tool call ends.
set -u
cd /home/z/my-project

# 1. private dev server
setsid bash -c 'exec bunx next dev -p 3100 >> /tmp/qa-dev.log 2>&1' < /dev/null > /dev/null 2>&1 &
for i in $(seq 1 40); do
  sleep 2
  curl -s -o /dev/null http://localhost:3100 && break
done
echo "server: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3100)"

# 2. open home, clear console
agent-browser open http://localhost:3100 || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1

# 3. click lesson-32 on home, then its row on the course page
REF=$(agent-browser snapshot -i -c 2>/dev/null | grep '32 Windows II' | grep -o 'ref=e[0-9]*' | head -1 | cut -d= -f2)
echo "lesson-32 ref: ${REF:-MISSING}"
[ -n "${REF:-}" ] || exit 1
agent-browser click "@$REF"
sleep 3
# expand Module 5 in the course grid — the sidebar nav shares the label, so
# click every 'Scalar & Window Toolkit' match until the lesson row shows up
for MREF in $(agent-browser snapshot -i -c 2>/dev/null | grep 'Scalar & Window Toolkit' | grep -o 'ref=e[0-9]*' | cut -d= -f2); do
  if agent-browser snapshot -i -c 2>/dev/null | grep -q 'Windows II'; then break; fi
  echo "trying module ref: $MREF"
  agent-browser click "@$MREF" || true
  sleep 2
done
REF2=$(agent-browser snapshot -i -c 2>/dev/null | grep 'Windows II' | grep -o 'ref=e[0-9]*' | head -1 | cut -d= -f2)
echo "lesson-32 row ref: ${REF2:-MISSING}"
if [ -n "${REF2:-}" ]; then
  agent-browser click "@$REF2"
  sleep 3
fi

# 4. wait for the WebGL canvas of the 3D host
agent-browser wait --fn "document.querySelectorAll('canvas').length >= 1" --timeout 30000
echo "canvases: $(agent-browser eval "document.querySelectorAll('canvas').length" 2>/dev/null)"

# 5. scroll the figure into view, let the sweep play out (~8s) + slab
agent-browser eval "document.querySelector('canvas')?.closest('div[role=\"img\"]')?.scrollIntoView({block:'center'}); 'scrolled'"
sleep 14
agent-browser screenshot /tmp/qa-l32-1.png
agent-browser eval "
  (() => {
    const aria = document.querySelector('div[role=\"img\"]')?.getAttribute('aria-label') || '';
    return JSON.stringify({ ariaSnippet: aria.slice(0, 80) });
  })()
"
echo "--- page errors ---"
agent-browser errors
echo "--- done ---"
