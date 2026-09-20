#!/usr/bin/env bash
# Browser QA for the SeeQ mascot as an exact bloub clone (seeq-buddy.tsx +
# seeq-gallery.tsx + src/components/bloub/*). Runs against the live :3000 dev
# server — the same thing the user sees in the preview.
set -u
cd /home/z/my-project
BASE=http://localhost:3000
OUT=/home/z/my-project/scripts
STAMP=$(date +%s)

agent-browser open "$BASE/#learn?fresh=bloub-$STAMP" || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1
agent-browser set viewport 1280 900
sleep 3

echo "=== 1. gallery rendered: 14 states + 8 shapes + 16 expressions + 12 colours + hero"
agent-browser eval "
(() => {
  const g = document.querySelector('[data-seeq-gallery]');
  if (!g) return JSON.stringify({ gallery: false });
  const tiles = (p) => g.querySelectorAll('[data-seeq-tile^=\"' + p + '-\"]').length;
  return JSON.stringify({
    gallery: true,
    stateTiles: tiles('state'),
    shapeTiles: tiles('shape'),
    exprTiles: tiles('expr'),
    colourTiles: tiles('colour'),
    svgCount: g.querySelectorAll('svg').length,
    playBtn: !!g.querySelector('[data-seeq-play]'),
  });
})()
"

echo "=== 2. clone signature: ink body + hole-punched eyes + NO mouth"
agent-browser eval "
(() => {
  const svg = document.querySelector('[data-seeq-gallery] svg');
  const body = svg ? svg.querySelector('path[d^=\"M\"]') : null;
  const rect = svg ? svg.querySelector('rect') : null;
  const mask = svg ? svg.querySelector('mask') : null;
  const eyePaths = mask ? mask.querySelectorAll('path[transform]') : null;
  const stroked = svg ? svg.querySelectorAll('path[stroke], ellipse, circle[stroke]').length : -1;
  return JSON.stringify({
    bodyPresent: !!body,
    bodyFill: body ? body.getAttribute('fill') : null,
    inkRect: rect ? rect.getAttribute('fill') : null,
    eyeHoles: eyePaths ? eyePaths.length : 0,
    mouthEvidence: stroked,
  });
})()
"

echo "=== 3. hero liveness: body path morphs over time"
D1=$(agent-browser eval "document.querySelector('[data-seeq-gallery] button svg path[d^=\"M\"]').getAttribute('d').slice(0,50)" | tr -d '"')
sleep 1.2
D2=$(agent-browser eval "document.querySelector('[data-seeq-gallery] button svg path[d^=\"M\"]').getAttribute('d').slice(0,50)" | tr -d '"')
[ "$D1" != "$D2" ] && echo "hero morphing: yes" || echo "hero morphing: NO ($D1)"

echo "=== 4. hero gaze follows pointer (eye matrix translation in mask)"
agent-browser eval "
(() => {
  const svg = document.querySelector('[data-seeq-gallery] button svg');
  const eye = svg.querySelector('mask path[transform]');
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 700, bubbles: true }));
  return JSON.stringify({ before: eye.getAttribute('transform').slice(0, 60) });
})()
"
sleep 1.5
agent-browser eval "
(() => {
  const svg = document.querySelector('[data-seeq-gallery] button svg');
  const eye = svg.querySelector('mask path[transform]');
  return JSON.stringify({ after: eye.getAttribute('transform').slice(0, 60) });
})()
"

echo "=== 5. play the film: sequence driver starts (Stop appears)"
agent-browser eval "document.querySelector('[data-seeq-play]').click(); 'playing'"
sleep 1.5
agent-browser eval "
(() => JSON.stringify({ stopVisible: !!document.querySelector('[data-seeq-stop]'), thinkingDots: document.querySelectorAll('[data-seeq-gallery] button svg circle').length > 0 }))()
"
agent-browser screenshot "$OUT/qa-bloub-film.png"
agent-browser eval "document.querySelector('[data-seeq-stop]') && document.querySelector('[data-seeq-stop]').click(); 'stopped'"
sleep 1

echo "=== 6. buddy mounted on the exact bloub engine"
agent-browser eval "
(() => {
  const root = document.querySelector('[data-seeq]');
  const svg = root ? root.querySelector('svg') : null;
  const rect = svg ? svg.querySelector('rect') : null;
  const mask = svg ? svg.querySelector('mask') : null;
  const eyes = mask ? mask.querySelectorAll('path[transform]') : null;
  const paper = root ? root.querySelector('button span') : null;
  return JSON.stringify({
    mounted: !!root,
    ink: rect ? rect.getAttribute('fill') : null,
    eyeHoles: eyes ? eyes.length : 0,
    paperDisc: paper ? getComputedStyle(paper).backgroundColor : null,
    mouthEvidence: svg ? svg.querySelectorAll('path[stroke], ellipse').length : -1,
  });
})()
"

echo "=== 7. tip appears + notify pastille (blue dot) pops"
sleep 4
agent-browser eval "
(() => {
  const b = document.querySelector('[data-seeq-bubble]');
  const notif = document.querySelector('[data-seeq] svg circle[fill=\"#2496e8\"]');
  return JSON.stringify({ tipVisible: !!b, text: b ? b.textContent.trim().slice(0, 60) : null, notifyPastille: !!notif });
})()
"
agent-browser screenshot "$OUT/qa-bloub-bubble.png"

echo "=== 8. colour tile re-dresses buddy AND hero live"
agent-browser eval "
(() => {
  document.querySelector('[data-seeq-tile=\"colour-violet\"]').click();
  return 'clicked violet';
})()
"
sleep 1
agent-browser eval "
(() => {
  const buddyInk = document.querySelector('[data-seeq] svg rect')?.getAttribute('fill');
  const heroInk = document.querySelector('[data-seeq-gallery] button svg rect')?.getAttribute('fill');
  const saved = JSON.parse(localStorage.getItem('seeql.buddy.skin.v2') || '{}');
  return JSON.stringify({ buddyInk, heroInk, savedColor: saved.color });
})()
"
agent-browser screenshot "$OUT/qa-bloub-violet.png"

echo "=== 9. expression + shape tiles persist"
agent-browser eval "
(() => {
  document.querySelector('[data-seeq-tile=\"expr-heureux\"]').click();
  document.querySelector('[data-seeq-tile=\"shape-triangle\"]').click();
  return 'clicked happy + triangle';
})()
"
sleep 1
agent-browser eval "
(() => {
  const saved = JSON.parse(localStorage.getItem('seeql.buddy.skin.v2') || '{}');
  const activeCount = document.querySelectorAll('[data-seeq-active=\"1\"]').length;
  return JSON.stringify({ savedExpr: saved.expression, savedShape: saved.shape, activeTiles: activeCount });
})()
"

echo "=== 10. reset back to the replica defaults"
agent-browser eval "
(() => {
  const btns = document.querySelectorAll('button');
  for (const b of btns) { if (b.textContent.includes('Reset')) { b.click(); break; } }
  return 'reset';
})()
"
sleep 1
agent-browser eval "
(() => {
  const saved = JSON.parse(localStorage.getItem('seeql.buddy.skin.v2') || '{}');
  return JSON.stringify({ saved, buddyInk: document.querySelector('[data-seeq] svg rect')?.getAttribute('fill') });
})()
"

echo "=== 11. poke + collapse + re-expand"
agent-browser eval "document.querySelector('button[aria-label=\"SeeQ study buddy\"]').click(); 'poked'"
sleep 1
agent-browser eval "
(() => {
  const b = document.querySelector('[data-seeq-bubble]');
  return JSON.stringify({ praise: b ? b.textContent.trim().slice(0, 40) : null });
})()
"
agent-browser eval "document.querySelector('button[aria-label=\"Collapse SeeQ\"]').click(); 'collapsing'"
sleep 1
agent-browser eval "
(() => {
  const open = document.querySelector('button[aria-label=\"Open SeeQ study buddy\"]');
  return JSON.stringify({
    chipSize: open ? Math.round(open.getBoundingClientRect().width) : 0,
    bubbleGone: !document.querySelector('[data-seeq-bubble]'),
    persisted: localStorage.getItem('seeql.buddy.collapsed'),
  });
})()
"
agent-browser eval "document.querySelector('button[aria-label=\"Open SeeQ study buddy\"]').click(); 'reopening'"
sleep 1
agent-browser eval "
(() => JSON.stringify({ backToFull: !!document.querySelector('button[aria-label=\"SeeQ study buddy\"]'), persisted: localStorage.getItem('seeql.buddy.collapsed') }))()
"

echo "=== 12. gallery on mobile viewport"
agent-browser set viewport 390 844
sleep 1.5
agent-browser eval "
(() => {
  const g = document.querySelector('[data-seeq-gallery]');
  const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  return JSON.stringify({ present: !!g, hOverflowPx: overflow });
})()
"
agent-browser screenshot "$OUT/qa-bloub-mobile.png"

echo "=== 13. page errors"
agent-browser errors
echo "=== done"
