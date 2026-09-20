#!/usr/bin/env bash
# Round-3 QA: backdrop disc removed (buddy + hero), hairline contour on dark,
# cursor-follow gaze re-centred and widened (no fixed left look), regression
# on tiles / poke / collapse. Runs against the live :3000 stack.
set -u
cd /home/z/my-project
BASE=http://localhost:3000
OUT=/home/z/my-project/scripts
STAMP=$(date +%s)

agent-browser open "$BASE/#learn?fresh=seeq3-$STAMP" || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1
agent-browser set viewport 1280 900

echo "=== 1. buddy: disc gone, contour present, eye holes intact"
agent-browser eval "
(() => {
  const root = document.querySelector('[data-seeq=\"1\"]');
  const btn = root && root.querySelector('button');
  const svg = btn && btn.querySelector('svg');
  const rim = svg && svg.querySelector('path[vector-effect=\"non-scaling-stroke\"]');
  return JSON.stringify({
    buddy: !!root,
    discGone: btn ? !btn.querySelector('span') : null,
    rimStroke: rim ? rim.getAttribute('stroke') : null,
    eyeHoles: svg ? svg.querySelectorAll('mask path[transform]').length : 0,
  });
})()
"

echo "=== 2. gallery hero: disc gone, contour present"
agent-browser eval "
(() => {
  const g = document.querySelector('[data-seeq-gallery]');
  const hero = g && g.querySelector('button');
  const svg = hero && hero.querySelector('svg');
  const rim = svg && svg.querySelector('path[vector-effect=\"non-scaling-stroke\"]');
  return JSON.stringify({
    hero: !!hero,
    discGone: hero ? !hero.querySelector('span') : null,
    rimStroke: rim ? rim.getAttribute('stroke') : null,
  });
})()
"

echo "=== 3. gaze: buddy eye tx at rest -> cursor top-right -> cursor bottom-left"
agent-browser eval "
(() => {
  const eye = document.querySelector('[data-seeq=\"1\"] svg mask path[transform]');
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 640, clientY: 450, bubbles: true }));
  return JSON.stringify({ rest: eye ? eye.getAttribute('transform').match(/,-?[\d.]+,-?[\d.]+\)$/)?.[0] : null });
})()
"
sleep 1.2
agent-browser eval "
(() => {
  const eye = document.querySelector('[data-seeq=\"1\"] svg mask path[transform]');
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 1250, clientY: 90, bubbles: true }));
  return JSON.stringify({ aimRightUp: eye ? eye.getAttribute('transform').match(/,-?[\d.]+,-?[\d.]+\)$/)?.[0] : null });
})()
"
sleep 1.2
agent-browser eval "
(() => {
  const eye = document.querySelector('[data-seeq=\"1\"] svg mask path[transform]');
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 50, clientY: 860, bubbles: true }));
  return JSON.stringify({ aimLeftDown: eye ? eye.getAttribute('transform').match(/,-?[\d.]+,-?[\d.]+\)$/)?.[0] : null });
})()
"
sleep 1.2
agent-browser eval "
(() => {
  const eye = document.querySelector('[data-seeq=\"1\"] svg mask path[transform]');
  return JSON.stringify({ settleLeftDown: eye ? eye.getAttribute('transform').match(/,-?[\d.]+,-?[\d.]+\)$/)?.[0] : null });
})()
"

echo "=== 4. hero gaze: top-right vs bottom-left"
agent-browser eval "
(() => {
  const eye = document.querySelector('[data-seeq-gallery] button svg mask path[transform]');
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 1250, clientY: 90, bubbles: true }));
  return JSON.stringify({ aimRightUp: eye ? eye.getAttribute('transform').match(/,-?[\d.]+,-?[\d.]+\)$/)?.[0] : null });
})()
"
sleep 1.2
agent-browser eval "
(() => {
  const eye = document.querySelector('[data-seeq-gallery] button svg mask path[transform]');
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 50, clientY: 860, bubbles: true }));
  return JSON.stringify({ aimLeftDown: eye ? eye.getAttribute('transform').match(/,-?[\d.]+,-?[\d.]+\)$/)?.[0] : null });
})()
"

echo "=== 5. tiles intact: 14 animations / 8 shapes / 16 expressions / 12 colours"
agent-browser eval "
(() => {
  const g = document.querySelector('[data-seeq-gallery]');
  const n = (p) => g.querySelectorAll('[data-seeq-tile^=\"' + p + '\"]').length;
  return JSON.stringify({ states: n('state-'), shapes: n('shape-'), exprs: n('expr-'), colours: n('colour-') });
})()
"

echo "=== 6. poke -> praise bubble"
agent-browser eval "
(() => {
  const btn = document.querySelector('[data-seeq=\"1\"] button');
  btn.click(); return 'poked';
})()
"
sleep 0.6
agent-browser eval "
(() => {
  const b = document.querySelector('[data-seeq-bubble]');
  return JSON.stringify({ bubble: !!b, text: b ? b.textContent.trim().slice(0, 44) : null });
})()
"

echo "=== 7. collapse -> 44px chip -> re-expand"
agent-browser eval "
(() => {
  const c = document.querySelector('[data-seeq=\"1\"] button[aria-label=\"Collapse SeeQ\"]');
  if (!c) return 'no-collapse-btn';
  c.click(); return 'collapsed';
})()
"
sleep 0.8
agent-browser eval "
(() => {
  const btn = document.querySelector('[data-seeq=\"1\"] button[aria-label=\"Open SeeQ study buddy\"]');
  return JSON.stringify({
    chipSize: btn ? Math.round(btn.getBoundingClientRect().width) : 0,
    persisted: localStorage.getItem('seeql.buddy.collapsed'),
  });
})()
"
agent-browser eval "
(() => {
  const btn = document.querySelector('[data-seeq=\"1\"] button[aria-label=\"Open SeeQ study buddy\"]');
  if (!btn) return 'no-chip';
  btn.click(); return 're-expanded';
})()
"
sleep 0.8
agent-browser eval "
(() => {
  const btn = document.querySelector('[data-seeq=\"1\"] button[aria-label=\"SeeQ study buddy\"]');
  return JSON.stringify({ mainLabelBack: !!btn, persisted: localStorage.getItem('seeql.buddy.collapsed') });
})()
"

echo "=== 8. screenshots"
agent-browser eval "window.scrollTo(0, 0); 'top'"
sleep 0.5
agent-browser screenshot "$OUT/qa-seeq3-gallery.png"
agent-browser eval "
(() => {
  const b = document.querySelector('[data-seeq=\"1\"] button[aria-label=\"SeeQ study buddy\"]');
  if (b) b.dispatchEvent(new PointerEvent('pointermove', { clientX: 900, clientY: 300, bubbles: true }));
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 900, clientY: 300, bubbles: true }));
  return 'gaze to mid-right';
})()
"
sleep 1.2
agent-browser screenshot "$OUT/qa-seeq3-buddy.png"
agent-browser set viewport 390 844
sleep 0.8
agent-browser screenshot "$OUT/qa-seeq3-mobile.png"
agent-browser set viewport 1280 900

echo "=== 9. console errors"
agent-browser errors
echo "=== done"
