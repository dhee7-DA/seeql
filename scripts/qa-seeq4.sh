#!/usr/bin/env bash
# Round-4 QA: dedicated SeeQ section from the top header, play-on-click tiles
# + draft/"Set as my buddy" commit, and the grabbable, placeable corner buddy.
set -u
cd /home/z/my-project
BASE=http://localhost:3000
OUT=/home/z/my-project/scripts
STAMP=$(date +%s)

agent-browser open "$BASE/#learn?fresh=seeq4-$STAMP" || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1
agent-browser set viewport 1280 900

echo "=== 1. top header: SeeQ button with a live mini bot"
agent-browser eval "
(() => {
  const b = document.querySelector('[data-seeq-nav=\"1\"]');
  return JSON.stringify({ navBtn: !!b, miniBot: !!(b && b.querySelector('svg')), overview: !!document.querySelector('main') });
})()
"

echo "=== 2. header click -> dedicated SeeQ view replaces overview content"
agent-browser eval "document.querySelector('[data-seeq-nav=\"1\"]').click(); 'clicked'"
sleep 0.8
agent-browser eval "
(() => {
  const v = document.querySelector('[data-seeq-view=\"1\"]');
  return JSON.stringify({
    seeqView: !!v,
    hero: !!(v && v.querySelector('button svg')),
    commitBtn: !!document.querySelector('[data-seeq-commit=\"1\"]'),
    resetBtn: !!document.querySelector('[data-seeq-reset=\"1\"]'),
    courseMapGone: !Array.from(document.querySelectorAll('h2')).some((h) => h.textContent === 'Course map'),
  });
})()
"

echo "=== 3. tile rows: 14 animations / 8 shapes / 16 expressions / 12 colours"
agent-browser eval "
(() => {
  const v = document.querySelector('[data-seeq-view=\"1\"]');
  const n = (p) => v.querySelectorAll('[data-seeq-tile^=\"' + p + '\"]').length;
  return JSON.stringify({ states: n('state-'), shapes: n('shape-'), exprs: n('expr-'), colours: n('colour-') });
})()
"

echo "=== 4. play on click: the clicked tile bot goes LIVE, draft ring moves"
agent-browser eval "
(() => {
  const t = document.querySelector('[data-seeq-tile=\"shape-triangle\"]');
  t.click(); return 'clicked triangle';
})()
"
sleep 0.4
agent-browser eval "
(() => {
  const t = document.querySelector('[data-seeq-tile=\"shape-triangle\"]');
  const bot = t.querySelector('[data-seeq-tilebot]');
  return JSON.stringify({
    active: t.getAttribute('data-seeq-active'),
    tileLiveSvg: !!bot.querySelector('svg'),
    status: document.querySelector('[data-seeq-view] p[aria-live]')?.textContent,
  });
})()
"
sleep 1.6
agent-browser eval "
(() => {
  const t = document.querySelector('[data-seeq-tile=\"shape-triangle\"]');
  return JSON.stringify({ backToFrozen: !!t.querySelector('[data-seeq-tilebot] svg') });
})()
"

echo "=== 5. selection: colour tile -> draft -> commit -> corner buddy re-dresses"
agent-browser eval "
(() => {
  document.querySelector('[data-seeq-tile=\"colour-violet\"]').click();
  return 'clicked violet';
})()
"
sleep 0.4
agent-browser eval "
(() => {
  const c = document.querySelector('[data-seeq-commit=\"1\"]');
  return JSON.stringify({ commitEnabled: !c.disabled, label: c.textContent.trim(), inkBefore: document.querySelector('[data-seeq] svg rect')?.getAttribute('fill') });
})()
"
agent-browser eval "document.querySelector('[data-seeq-commit=\"1\"]').click(); 'committed'"
sleep 0.6
agent-browser eval "
(() => {
  const saved = JSON.parse(localStorage.getItem('seeql.buddy.skin.v2') || '{}');
  return JSON.stringify({
    saved,
    buddyInk: document.querySelector('[data-seeq] svg rect')?.getAttribute('fill'),
    commitDisabledAfter: document.querySelector('[data-seeq-commit=\"1\"]').disabled,
  });
})()
"

echo "=== 6. reset restores ink"
agent-browser eval "document.querySelector('[data-seeq-reset=\"1\"]').click(); 'reset'"
sleep 0.5
agent-browser eval "
(() => JSON.stringify({
  saved: JSON.parse(localStorage.getItem('seeql.buddy.skin.v2') || '{}'),
  buddyInk: document.querySelector('[data-seeq] svg rect')?.getAttribute('fill'),
}))()
"

echo "=== 7. placeable: drag the buddy 200px right / 80px up -> persists, no poke"
agent-browser eval "
(() => {
  const btn = document.querySelector('[data-seeq=\"1\"] button');
  const b = btn.getBoundingClientRect();
  const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
  const opts = { bubbles: true, pointerId: 1, pointerType: 'mouse', isPrimary: true };
  btn.dispatchEvent(new PointerEvent('pointerdown', { ...opts, clientX: cx, clientY: cy, button: 0 }));
  window.dispatchEvent(new PointerEvent('pointermove', { ...opts, clientX: cx + 100, clientY: cy - 40 }));
  window.dispatchEvent(new PointerEvent('pointermove', { ...opts, clientX: cx + 200, clientY: cy - 80 }));
  window.dispatchEvent(new PointerEvent('pointerup', { ...opts, clientX: cx + 200, clientY: cy - 80 }));
  return 'dragged from ' + Math.round(b.left) + ',' + Math.round(b.top);
})()
"
sleep 0.6
agent-browser eval "
(() => {
  const w = document.querySelector('[data-seeq=\"1\"]');
  return JSON.stringify({
    saved: JSON.parse(localStorage.getItem('seeql.buddy.pos.v1') || 'null'),
    styleLeft: w.style.left,
    styleTop: w.style.top,
    bubbleAfterDrag: !!document.querySelector('[data-seeq-bubble]'),
  });
})()
"

echo "=== 8. clicks after a drag: first is consumed by the drag guard, second pokes"
agent-browser eval "document.querySelector('[data-seeq=\"1\"] button').click(); 'first click (consumed)'
"
sleep 0.4
agent-browser eval "document.querySelector('[data-seeq=\"1\"] button').click(); 'second click'
"
sleep 0.5
agent-browser eval "
(() => {
  const b = document.querySelector('[data-seeq-bubble]');
  return JSON.stringify({ bubble: !!b, text: b ? b.textContent.trim().slice(0, 40) : null });
})()
"

echo "=== 9. bubble flips sides when parked right of centre"
agent-browser eval "
(() => {
  const btn = document.querySelector('[data-seeq=\"1\"] button');
  const b = btn.getBoundingClientRect();
  const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
  const opts = { bubbles: true, pointerId: 1, pointerType: 'mouse', isPrimary: true };
  btn.dispatchEvent(new PointerEvent('pointerdown', { ...opts, clientX: cx, clientY: cy, button: 0 }));
  window.dispatchEvent(new PointerEvent('pointermove', { ...opts, clientX: 1200, clientY: cy }));
  window.dispatchEvent(new PointerEvent('pointerup', { ...opts, clientX: 1200, clientY: cy }));
  return 'dragged to right side';
})()
"
sleep 0.8
agent-browser eval "document.querySelector('[data-seeq=\"1\"] button').click(); 'drag-end click'
"
sleep 0.3
agent-browser eval "document.querySelector('[data-seeq=\"1\"] button').click(); 'poked right side'
"
sleep 0.5
agent-browser eval "
(() => {
  const b = document.querySelector('[data-seeq-bubble]');
  return JSON.stringify({ bubble: !!b, flippedLeft: b ? b.className.includes('right-full') : null });
})()
"

echo "=== 10. reload: the parked spot survives"
agent-browser open "$BASE/#learn?fresh=seeq4b-$STAMP" > /dev/null || exit 1
agent-browser wait --load networkidle
sleep 1
agent-browser eval "
(() => {
  const w = document.querySelector('[data-seeq=\"1\"]');
  return JSON.stringify({
    saved: JSON.parse(localStorage.getItem('seeql.buddy.pos.v1') || 'null'),
    styleLeft: w.style.left,
    styleTop: w.style.top,
  });
})()
"

echo "=== 11. screenshots"
agent-browser eval "window.scrollTo(0, 0); 'top'"
sleep 0.5
agent-browser screenshot "$OUT/qa-seeq4-view.png"
agent-browser set viewport 390 844
sleep 0.8
agent-browser screenshot "$OUT/qa-seeq4-mobile.png"
agent-browser set viewport 1280 900

echo "=== 12. console errors"
agent-browser errors
echo "=== done"
