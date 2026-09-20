#!/usr/bin/env bash
# One-shot browser QA for SeeQ, the corner-buddy mascot (seeq-buddy.tsx).
# Everything runs inside a single call — the sandbox reaps background
# processes when the Bash tool call ends, so the dev server is private (3102).
set -u
cd /home/z/my-project

PORT=3102
BASE=http://localhost:$PORT
OUT=/home/z/my-project/scripts

# 1. private dev server
rm -f /home/z/my-project/.next/dev/lock
setsid bash -c "exec bunx next dev -p $PORT >> /home/z/my-project/scripts/tmp/qa-dev-seeq.log 2>&1" < /dev/null > /dev/null 2>&1 &
for i in $(seq 1 45); do
  sleep 2
  curl -s -o /dev/null "$BASE" && break
done
echo "server: $(curl -s -o /dev/null -w '%{http_code}' "$BASE")"

# 2. open learn view (cache-busted)
agent-browser open "$BASE/#learn?fresh=seeq-$(date +%s)" || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1
agent-browser set viewport 1280 800
sleep 2

echo "=== 3. SeeQ mounted"
agent-browser eval "
(() => {
  const root = document.querySelector('[data-seeq]');
  const btn = document.querySelector('button[aria-label=\"SeeQ study buddy\"]');
  const svg = root ? root.querySelector('svg') : null;
  const d = svg && svg.querySelector('path[d^=\"M\"]');
  return JSON.stringify({
    mounted: !!root,
    fixed: root ? getComputedStyle(root).position : null,
    z: root ? getComputedStyle(root).zIndex : null,
    buttonPresent: !!btn,
    bodyPathLen: d ? d.getAttribute('d').length : 0,
    rect: root ? JSON.stringify(root.getBoundingClientRect().toJSON()).slice(0, 120) : null,
  });
})()
"

echo "=== 4. engine liveness: body path morphs over time"
D1=$(agent-browser eval "document.querySelector('[data-seeq] svg path[d^=\"M\"]').getAttribute('d').slice(0, 60)" | tr -d '"')
sleep 1
D2=$(agent-browser eval "document.querySelector('[data-seeq] svg path[d^=\"M\"]').getAttribute('d').slice(0, 60)" | tr -d '"')
[ "$D1" != "$D2" ] && echo "morphing: yes" || echo "morphing: NO (D1=$D1 D2=$D2)"

echo "=== 5. first coach tip appears"
sleep 4
agent-browser eval "
(() => {
  const b = document.querySelector('[data-seeq-bubble]');
  return JSON.stringify({ tipVisible: !!b, text: b ? b.textContent.trim().slice(0, 80) : null });
})()
"
agent-browser screenshot "$OUT/qa-seeq-bubble.png"

echo "=== 6. gaze follows pointer (eye capsule matrix translation)"
agent-browser eval "
(() => {
  const eyes = document.querySelectorAll('[data-seeq] svg path[transform]');
  const t = eyes[0] ? eyes[0].getAttribute('transform') : null;
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 1200, clientY: 300, bubbles: true }));
  return JSON.stringify({ eyeCount: eyes.length, before: t });
})()
"
sleep 1.5
agent-browser eval "
(() => {
  const eyes = document.querySelectorAll('[data-seeq] svg path[transform]');
  return JSON.stringify({ after: eyes[0] ? eyes[0].getAttribute('transform') : null });
})()
"

echo "=== 7. poke: click the buddy"
agent-browser eval "
(() => {
  const btn = document.querySelector('button[aria-label=\"SeeQ study buddy\"]');
  btn.click(); return 'clicked';
})()
"
sleep 1
agent-browser eval "
(() => {
  const b = document.querySelector('[data-seeq-bubble]');
  const btn = document.querySelector('button[aria-label=\"SeeQ study buddy\"]');
  return JSON.stringify({ praise: b ? b.textContent.trim().slice(0, 60) : null, expanded: btn.getAttribute('aria-expanded') });
})()
"
agent-browser screenshot "$OUT/qa-seeq-poke.png"

echo "=== 8. collapse"
agent-browser eval "
(() => {
  const c = document.querySelector('button[aria-label=\"Collapse SeeQ\"]');
  if (!c) return 'no-collapse-btn';
  c.click(); return 'collapsed';
})()
"
sleep 1
agent-browser eval "
(() => {
  const btn = document.querySelector('button[aria-label=\"Open SeeQ study buddy\"]');
  const bubble = document.querySelector('[data-seeq-bubble]');
  const saved = localStorage.getItem('seeql.buddy.collapsed');
  const size = btn ? btn.getBoundingClientRect().width : 0;
  return JSON.stringify({ openLabelPresent: !!btn, ariaExpanded: btn ? btn.getAttribute('aria-expanded') : null, bubbleGone: !bubble, chipSize: size, persisted: saved });
})()
"
agent-browser screenshot "$OUT/qa-seeq-collapsed.png"

echo "=== 9. re-expand"
agent-browser eval "
(() => {
  const btn = document.querySelector('button[aria-label=\"Open SeeQ study buddy\"]');
  if (!btn) return 'no-open-btn';
  btn.click(); return 'clicked';
})()
"
sleep 1
agent-browser eval "
(() => {
  const btn = document.querySelector('button[aria-label=\"SeeQ study buddy\"]');
  return JSON.stringify({ mainLabelBack: !!btn, ariaExpanded: btn ? btn.getAttribute('aria-expanded') : null, persisted: localStorage.getItem('seeql.buddy.collapsed') });
})()
"

echo "=== 10. page errors"
agent-browser errors
echo "=== done"
