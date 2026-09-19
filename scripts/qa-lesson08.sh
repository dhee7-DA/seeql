#!/usr/bin/env bash
# One-shot browser QA for lesson-08 3D figure (l8-bins-space-3d).
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

# 3. click lesson-08 (ref extracted fresh for this page load)
REF=$(agent-browser snapshot -i -c 2>/dev/null | grep '08 GROUP BY' | grep -o 'ref=e[0-9]*' | head -1 | cut -d= -f2)
echo "lesson-08 ref: ${REF:-MISSING}"
[ -n "${REF:-}" ] || exit 1
agent-browser click "@$REF"
sleep 3

# 3b. course page: click the lesson-08 row inside Module 1
REF2=$(agent-browser snapshot -i -c 2>/dev/null | grep 'GROUP BY & HAVING' | grep -o 'ref=e[0-9]*' | head -1 | cut -d= -f2)
echo "lesson-08 row ref: ${REF2:-MISSING}"
if [ -n "${REF2:-}" ]; then
  agent-browser click "@$REF2"
  sleep 3
fi

# 4. wait for the WebGL canvas of the 3D host
agent-browser wait --fn "document.querySelectorAll('canvas').length >= 1" --timeout 30000
echo "canvases: $(agent-browser eval "document.querySelectorAll('canvas').length" 2>/dev/null)"

# 5. scroll the figure into view so the auto-replay fires, let phases play
agent-browser eval "document.querySelector('canvas')?.closest('div[role=\"img\"]')?.scrollIntoView({block:'center'}); 'scrolled'"
sleep 16

# 6. capture evidence
agent-browser screenshot /tmp/qa-l08-1.png
agent-browser eval "
  (() => {
    const hud = [...document.querySelectorAll('div')].find(d => d.className.includes && String(d.className).includes('text-zinc-300') && /bucket|HAVING|rows/.test(d.textContent || ''));
    const fig = document.querySelector('figure figcaption');
    return JSON.stringify({
      figcaption: fig ? fig.textContent.slice(0, 90) : null,
      ariaSnippet: (document.querySelector('div[role=\"img\"]')?.getAttribute('aria-label') || '').slice(0, 80),
    });
  })()
"
echo "--- page errors ---"
agent-browser errors
echo "--- done ---"
