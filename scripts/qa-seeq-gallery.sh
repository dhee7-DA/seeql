#!/usr/bin/env bash
# One-shot browser QA for the "Meet SeeQ" mascot gallery (seeq-gallery.tsx)
# plus regression checks on the corner buddy after the engine refactor.
# Runs against the LIVE :3000 dev server (no private server, no lock games):
# the user's preview stays up the whole time.
set -u
cd /home/z/my-project

BASE=http://localhost:3000
OUT=/home/z/my-project/scripts

for i in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE" --max-time 5)
  [ "$code" = "200" ] && break
  sleep 2
done
echo "server: $(curl -s -o /dev/null -w '%{http_code}' "$BASE")"

# 1. open learn view (cache-busted)
agent-browser open "$BASE/#learn?fresh=gallery-$(date +%s)" || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1
agent-browser set viewport 1280 800
sleep 3

echo "=== 2. gallery structure: 22 tiles, every sprite has a body"
agent-browser eval "
(() => {
  const g = document.querySelector('[data-seeq-gallery]');
  if (!g) return JSON.stringify({ gallery: false });
  const tiles = g.querySelectorAll('[data-seeq-tile]');
  const sprites = g.querySelectorAll('[data-seeq-sprite]');
  let empty = 0;
  sprites.forEach((s) => {
    const p = s.querySelector('svg path[d^=\"M\"]');
    if (!p || p.getAttribute('d').length < 40) empty++;
  });
  const shapes = g.querySelectorAll('[data-seeq-tile^=\"shape-\"]').length;
  const exprs = g.querySelectorAll('[data-seeq-tile^=\"expr-\"]').length;
  const colours = g.querySelectorAll('[data-seeq-tile^=\"colour-\"]').length;
  const labels = Array.from(g.querySelectorAll('p.font-mono')).map((p) => p.textContent);
  return JSON.stringify({ gallery: true, tiles: tiles.length, sprites: sprites.length, emptyBody: empty, shapes, exprs, colours, labels });
})()
"

echo "=== 3. scroll gallery into view + liveness (sprite body morphs)"
agent-browser eval "document.querySelector('[data-seeq-gallery]').scrollIntoView({ block: 'start' }); 'scrolled'"
sleep 1
D1=$(agent-browser eval "document.querySelector('[data-seeq-tile^=\"shape-pebble\"] [data-seeq-sprite] svg path[d^=\"M\"]').getAttribute('d').slice(30, 90)" | tr -d '"')
sleep 0.7
D2=$(agent-browser eval "document.querySelector('[data-seeq-tile^=\"shape-pebble\"] [data-seeq-sprite] svg path[d^=\"M\"]').getAttribute('d').slice(30, 90)" | tr -d '"')
[ -n "$D1" ] && [ "$D1" != "$D2" ] && echo "sprite morphing: yes" || echo "sprite morphing: NO (D1=$D1 D2=$D2)"

echo "=== 4. shapes actually differ (circle vs pebble vs tall body paths)"
agent-browser eval "
(() => {
  const grab = (tile) => document.querySelector('[data-seeq-tile=\"' + tile + '\"] [data-seeq-sprite] svg path[d^=\"M\"]').getAttribute('d');
  const circle = grab('shape-circle'), pebble = grab('shape-pebble'), tall = grab('shape-tall');
  return JSON.stringify({ circleVsPebble: circle !== pebble, circleVsTall: circle !== tall });
})()
"
agent-browser screenshot "$OUT/qa-gallery-desktop.png"

echo "=== 5. poke an expression tile -> excited cut"
agent-browser eval "document.querySelector('[data-seeq-tile=\"expr-sad\"]').click(); 'clicked'"
sleep 0.4
agent-browser eval "
(() => {
  const s = document.querySelector('[data-seeq-tile=\"expr-sad\"] [data-seeq-sprite]');
  return JSON.stringify({ spriteExpr: s.getAttribute('data-seeq-sprite') });
})()
"

echo "=== 6. tap a colour -> buddy re-skins + persists + tile rings active"
agent-browser eval "document.querySelector('[data-seeq-tile=\"colour-grape\"]').click(); 'clicked'"
sleep 0.5
agent-browser eval "
(() => {
  const stop = document.querySelector('[data-seeq] svg radialGradient stop');
  const tile = document.querySelector('[data-seeq-tile=\"colour-grape\"]');
  const emerald = document.querySelector('[data-seeq-tile=\"colour-emerald\"]');
  return JSON.stringify({
    savedTheme: localStorage.getItem('seeql.buddy.theme'),
    buddyFirstStop: stop ? stop.getAttribute('stopColor') : null,
    grapeActive: tile.getAttribute('data-seeq-active'),
    emeraldActive: emerald.getAttribute('data-seeq-active'),
    grapePressed: tile.getAttribute('aria-pressed'),
  });
})()
"
agent-browser screenshot "$OUT/qa-gallery-grape.png"

echo "=== 7. reset theme to emerald"
agent-browser eval "document.querySelector('[data-seeq-tile=\"colour-emerald\"]').click(); 'clicked'"
sleep 0.5
agent-browser eval "
(() => JSON.stringify({
  savedTheme: localStorage.getItem('seeql.buddy.theme'),
  buddyFirstStop: document.querySelector('[data-seeq] svg radialGradient stop').getAttribute('stopColor'),
}))()
"

echo "=== 8. buddy regression: mounted, tip, gaze, collapse, re-expand"
agent-browser eval "window.scrollTo(0, 0); 'top'"
sleep 1
agent-browser eval "
(() => {
  const root = document.querySelector('[data-seeq]');
  return JSON.stringify({
    mounted: !!root,
    fixed: root ? getComputedStyle(root).position : null,
    bodyPathLen: (root.querySelector('svg path[d^=\"M\"]') || { getAttribute: () => '' }).getAttribute('d').length,
  });
})()
"
sleep 3
agent-browser eval "
(() => {
  const b = document.querySelector('[data-seeq-bubble]');
  return JSON.stringify({ tipVisible: !!b, text: b ? b.textContent.trim().slice(0, 70) : null });
})()
"
agent-browser screenshot "$OUT/qa-gallery-buddy.png"
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
  return JSON.stringify({
    openLabelPresent: !!btn,
    chipSize: btn ? btn.getBoundingClientRect().width : 0,
    persisted: localStorage.getItem('seeql.buddy.collapsed'),
  });
})()
"
agent-browser eval "
(() => {
  const btn = document.querySelector('button[aria-label=\"Open SeeQ study buddy\"]');
  if (!btn) return 'no-open-btn';
  btn.click(); return 're-expanded';
})()
"
sleep 1
agent-browser eval "
(() => {
  const btn = document.querySelector('button[aria-label=\"SeeQ study buddy\"]');
  return JSON.stringify({ mainLabelBack: !!btn, persisted: localStorage.getItem('seeql.buddy.collapsed') });
})()
"

echo "=== 9. mobile 390x844"
agent-browser set viewport 390 844
sleep 1.5
agent-browser eval "
(() => {
  const g = document.querySelector('[data-seeq-gallery]');
  const tiles = g ? g.querySelectorAll('[data-seeq-tile]').length : 0;
  const buddy = document.querySelector('[data-seeq]');
  const br = buddy ? buddy.getBoundingClientRect() : null;
  return JSON.stringify({
    gallery: !!g,
    tiles,
    gridCols: g ? getComputedStyle(g.querySelector('.grid')).gridTemplateColumns.split(' ').length : 0,
    buddyVisible: !!buddy && br.bottom <= window.innerHeight && br.left >= 0,
  });
})()
"
agent-browser eval "document.querySelector('[data-seeq-gallery]').scrollIntoView({ block: 'start' }); 'scrolled'"
sleep 1
agent-browser screenshot "$OUT/qa-gallery-mobile.png"

echo "=== 10. page errors"
agent-browser errors
echo "=== done"
