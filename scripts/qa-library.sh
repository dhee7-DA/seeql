#!/usr/bin/env bash
# One-shot browser QA for the Diagram library view (figlib-route-1).
# Everything runs inside a single call because the sandbox reaps
# background processes when the Bash tool call ends.
set -u
cd /home/z/my-project

# 1. private dev server
setsid bash -c 'exec bunx next dev -p 3100 >> /tmp/qa-dev-lib.log 2>&1' < /dev/null > /dev/null 2>&1 &
for i in $(seq 1 40); do
  sleep 2
  curl -s -o /dev/null http://localhost:3100 && break
done
echo "server: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3100)"

# 2. open the learn shell directly (home is a hash-routed landing), clear console
agent-browser open http://localhost:3100/#learn || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1

# 3. click the Diagram library toolbox entry
REF=$(agent-browser snapshot -i -c 2>/dev/null | grep 'Diagram library' | grep -o 'ref=e[0-9]*' | head -1 | cut -d= -f2)
echo "library nav ref: ${REF:-MISSING}"
[ -n "${REF:-}" ] || exit 1
agent-browser click "@$REF"
sleep 4

# 4. verify the library view: counter, module chips, cards
agent-browser eval "
  (() => {
    const body = document.body.innerText || '';
    return JSON.stringify({
      header: body.includes('The course, drawn'),
      counter: (body.match(/\d+ diagrams · all modules/) || ['?'])[0],
      moduleChips: body.includes('2 Joins'),
      has3Dcard: body.includes('Index Space 3D') || body.includes('space 3d') || body.includes('3D scene'),
    });
  })()
"
agent-browser screenshot /tmp/qa-lib-1.png

# 5. search filter: 'join'
agent-browser eval "
  (() => {
    const input = document.querySelector('input[type=\"search\"]');
    if (!input) return 'no-input';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'join');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return 'typed';
  })()
"
sleep 2
agent-browser eval "
  (() => {
    const body = document.body.innerText || '';
    return JSON.stringify({ filtered: (body.match(/\d+ of \d+ diagrams/) || ['?'])[0] });
  })()
"

# 6. clear search, open the 3D index scene card (click card by aria-label)
agent-browser eval "
  (() => {
    const input = document.querySelector('input[type=\"search\"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return 'cleared';
  })()
"
sleep 1
CARDREF=$(agent-browser snapshot -i -c 2>/dev/null | grep -i 'index space' | grep -o 'ref=e[0-9]*' | head -1 | cut -d= -f2)
echo "3d card ref: ${CARDREF:-MISSING}"
if [ -n "${CARDREF:-}" ]; then
  agent-browser click "@$CARDREF"
  sleep 5
  agent-browser eval "JSON.stringify({ canvases: document.querySelectorAll('canvas').length, lightbox: !!document.querySelector('[role=\"dialog\"], .fixed') })"
  sleep 10
  agent-browser screenshot /tmp/qa-lib-3d.png
fi

echo "--- page errors ---"
agent-browser errors
echo "--- done ---"
