#!/usr/bin/env bash
# Round-3 follow-up: buddy gaze in a CLEAN window (no notify/tip state —
# notify suspends following by design), monotonic tx asserted.
set -u
cd /home/z/my-project
BASE=http://localhost:3000
STAMP=$(date +%s)

agent-browser open "$BASE/#learn?fresh=seeq3b-$STAMP" || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1
agent-browser set viewport 1280 900

# Park the pointer, then WAIT OUT the first tip window (2.6s delay + 8.2s hold)
# so the buddy sits in idle with baseFace — the only state that follows.
agent-browser eval "
(() => {
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 640, clientY: 450, bubbles: true }));
  return 'pointer parked at centre';
})()
"
echo "--- waiting out the first tip window (12s) ..."
sleep 12
agent-browser eval "
(() => {
  const notif = document.querySelector('[data-seeq] svg circle[fill=\"#2496e8\"]');
  const b = document.querySelector('[data-seeq-bubble]');
  return JSON.stringify({ cleanWindow: !notif && !b, bubble: !!b, notif: !!notif });
})()
"

echo "=== gaze: rest -> top-right (1.6s) -> bottom-left (1.6s), reads AFTER settle"
agent-browser eval "
(() => {
  const eye = document.querySelector('[data-seeq=\"1\"] svg mask path[transform]');
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 1250, clientY: 90, bubbles: true }));
  return 'dispatched top-right';
})()
"
sleep 1.6
agent-browser eval "
(() => {
  const eye = document.querySelector('[data-seeq=\"1\"] svg mask path[transform]');
  window.__g = eye.getAttribute('transform');
  return JSON.stringify({ aimRightUp: window.__g.match(/,-?[\d.]+,-?[\d.]+\)$/)?.[0] });
})()
"
agent-browser eval "
(() => {
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 50, clientY: 860, bubbles: true }));
  return 'dispatched bottom-left';
})()
"
sleep 1.6
agent-browser eval "
(() => {
  const eye = document.querySelector('[data-seeq=\"1\"] svg mask path[transform]');
  const right = parseFloat((window.__g.match(/,-?[\d.]+,-?[\d.]+\)$/)?.[0] || ',0').split(',')[1]);
  const left = parseFloat((eye.getAttribute('transform').match(/,-?[\d.]+,-?[\d.]+\)$/)?.[0] || ',0').split(',')[1]);
  return JSON.stringify({ aimLeftDown: eye.getAttribute('transform').match(/,-?[\d.]+,-?[\d.]+\)$/)?.[0], txRight: right, txLeft: left, delta: Math.round((right - left) * 10) / 10, monotonic: right > left });
})()
"
echo "=== done"
