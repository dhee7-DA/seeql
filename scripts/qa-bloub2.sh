#!/usr/bin/env bash
# Follow-up QA: tip window timing, scoped Reset, gaze before/after sampling.
set -u
cd /home/z/my-project
BASE=http://localhost:3000
OUT=/home/z/my-project/scripts
STAMP=$(date +%s)

agent-browser open "$BASE/#learn?fresh=bloub2-$STAMP" || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1
agent-browser set viewport 1280 900

echo "=== A. gaze follow: sample eye matrix, aim right, sample again"
agent-browser eval "
(() => {
  const svg = document.querySelector('[data-seeq-gallery] button svg');
  const eye = svg && svg.querySelector('mask path[transform]');
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 1250, clientY: 200, bubbles: true }));
  return JSON.stringify({ right: eye ? eye.getAttribute('transform').match(/,-?[\d.]+,-?[\d.]+\)$/)?.[0] : null });
})()
"
sleep 1.6
agent-browser eval "
(() => {
  const eye = document.querySelector('[data-seeq-gallery] button svg mask path[transform]');
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 30, clientY: 800, bubbles: true }));
  return JSON.stringify({ afterRight: eye.getAttribute('transform').match(/,-?[\d.]+,-?[\d.]+\)$/)?.[0] });
})()
"
sleep 1.6
agent-browser eval "
(() => {
  const eye = document.querySelector('[data-seeq-gallery] button svg mask path[transform]');
  return JSON.stringify({ afterLeft: eye.getAttribute('transform').match(/,-?[\d.]+,-?[\d.]+\)$/)?.[0] });
})()
"

echo "=== B. first tip + notify pastille inside the 8.2s hold window"
sleep 2
agent-browser eval "
(() => {
  const b = document.querySelector('[data-seeq-bubble]');
  const notif = document.querySelector('[data-seeq] svg circle[fill=\"#2496e8\"]');
  return JSON.stringify({ tipVisible: !!b, text: b ? b.textContent.trim().slice(0, 50) : null, notifyPastille: !!notif });
})()
"

echo "=== C. scoped Reset inside the gallery"
agent-browser eval "
(() => {
  const g = document.querySelector('[data-seeq-gallery]');
  for (const b of g.querySelectorAll('button')) {
    if (b.textContent.includes('Reset')) { b.click(); return 'gallery reset clicked'; }
  }
  return 'no reset in gallery';
})()
"
sleep 1
agent-browser eval "
(() => {
  const saved = JSON.parse(localStorage.getItem('seeql.buddy.skin.v2') || '{}');
  return JSON.stringify({
    saved,
    buddyInk: document.querySelector('[data-seeq] svg rect')?.getAttribute('fill'),
    heroInk: document.querySelector('[data-seeq-gallery] button svg rect')?.getAttribute('fill'),
  });
})()
"

echo "=== D. console errors"
agent-browser errors
echo "=== done"
