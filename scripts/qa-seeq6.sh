#!/usr/bin/env bash
# Round-6 QA: SeeQ on the MAIN page.
#  1) Landing: global buddy (single instance), header SeeQ mini-bot + nav link,
#     #seeq section (stage, live hero, 6 move chips), chip click PLAYS the hero
#     (egg body morph) and reverts to idle.
#  2) Workshop CTA deep-links #learn?view=seeq -> SeeQ view renders; the buddy
#     instance survives the mode switch with the SAME parked spot (no remount).
#  3) Learn: single buddy, header nav still opens the workshop.
#  4) Playground: buddy present there too.
#  5) Console errors + screenshots (desktop landing top/section, learn view, mobile).
set -u
cd /home/z/my-project
BASE=http://localhost:3000
OUT=/home/z/my-project/scripts
STAMP=$(date +%s)

agent-browser set viewport 1280 900
agent-browser open "$BASE/?fresh=seeq6-$STAMP" || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1
sleep 1

echo "=== 1. landing structure: buddy x1, nav btn, section, stage, hero, chips"
agent-browser eval "
(() => JSON.stringify({
  buddy: !!document.querySelector('[data-seeq=\"1\"]'),
  buddyCount: document.querySelectorAll('[data-seeq=\"1\"]').length,
  navBtn: !!document.querySelector('[data-seeq-nav=\"1\"]'),
  navLink: [...document.querySelectorAll('nav button')].some(b => b.textContent.trim() === 'SeeQ'),
  section: !!document.querySelector('#seeq'),
  stage: !!document.querySelector('[data-seeq-stage=\"1\"]'),
  hero: !!document.querySelector('[data-seeq-hero=\"1\"]'),
  chips: document.querySelectorAll('[data-seeq-chip]').length,
  credit: document.querySelector('#seeq')?.textContent.includes('Jérémy Perret') ?? false,
}))()
"

echo "=== 2. hero PLAYS: egg chip morphs the body path, then idle revert"
agent-browser eval "
(() => {
  const svg = document.querySelector('[data-seeq-hero] svg');
  window.__d0 = svg.querySelector('path').getAttribute('d').slice(0, 60);
  document.querySelector('[data-seeq-chip=\"egg\"]').click();
  return 'clicked:' + window.__d0;
})()
"
sleep 1.8
agent-browser eval "
(() => {
  const svg = document.querySelector('[data-seeq-hero] svg');
  window.__d1 = svg.querySelector('path').getAttribute('d').slice(0, 60);
  return JSON.stringify({ idle: window.__d0, egg: window.__d1, morphed: window.__d0 !== window.__d1 });
})()
"
sleep 4
agent-browser eval "
(() => {
  const svg = document.querySelector('[data-seeq-hero] svg');
  const d2 = svg.querySelector('path').getAttribute('d').slice(0, 60);
  return JSON.stringify({ revertedToIdle: d2 === window.__d0, back: d2 });
})()
"

echo "=== 3. buddy spot before the mode switch"
agent-browser eval "
(() => {
  const el = document.querySelector('[data-seeq=\"1\"]');
  window.__spot = el.getAttribute('style');
  return 'spot:' + window.__spot;
})()
"

echo "=== 4. workshop CTA deep-links to #learn?view=seeq, buddy survives"
agent-browser eval "
(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Dress him up')); if (!b) return 'CTA-MISSING'; b.click(); return 'CTA-CLICKED'; })()
"
sleep 2.5
agent-browser eval "
(() => JSON.stringify({
  hash: window.location.hash,
  seeqView: !!document.querySelector('[data-seeq-view=\"1\"]'),
  buddyStill: !!document.querySelector('[data-seeq=\"1\"]'),
  buddyCount: document.querySelectorAll('[data-seeq=\"1\"]').length,
  sameSpot: document.querySelector('[data-seeq=\"1\"]').getAttribute('style') === window.__spot,
  learnHeader: !!document.querySelector('[data-seeq-nav=\"1\"]'),
}))()
"

echo "=== 5. learn root: single buddy + header nav opens the workshop"
agent-browser open "$BASE/#learn?fresh=seeq6b-$STAMP"
agent-browser wait --load networkidle
sleep 1
agent-browser eval "
(() => {
  document.querySelector('[data-seeq-nav=\"1\"]').click();
  return 'nav-clicked';
})()
"
sleep 1.2
agent-browser eval "
(() => JSON.stringify({
  seeqView: !!document.querySelector('[data-seeq-view=\"1\"]'),
  buddy: !!document.querySelector('[data-seeq=\"1\"]'),
  tiles: document.querySelectorAll('[data-seeq-tile]').length,
}))()
"

echo "=== 6. playground: buddy present"
agent-browser open "$BASE/#playground?fresh=seeq6c-$STAMP"
agent-browser wait --load networkidle
sleep 1
agent-browser eval "
(() => JSON.stringify({ buddy: !!document.querySelector('[data-seeq=\"1\"]'), count: document.querySelectorAll('[data-seeq=\"1\"]').length }))()
"

echo "=== 7. console errors"
agent-browser errors

echo "=== 8. screenshots"
agent-browser open "$BASE/?fresh=seeq6-shot-$STAMP"
agent-browser wait --load networkidle
sleep 1.2
agent-browser screenshot "$OUT/qa-seeq6-landing-top.png"
agent-browser eval "document.getElementById('seeq').scrollIntoView(); 'scrolled'"
sleep 1.2
agent-browser screenshot "$OUT/qa-seeq6-landing-seeq.png"
agent-browser open "$BASE/#learn?view=seeq&f=seeq6-shot2-$STAMP"
agent-browser wait --load networkidle
sleep 1.5
agent-browser screenshot "$OUT/qa-seeq6-learn-seeq.png"
agent-browser set viewport 390 844
agent-browser open "$BASE/?fresh=seeq6-m-$STAMP"
agent-browser wait --load networkidle
sleep 1.2
agent-browser screenshot "$OUT/qa-seeq6-mobile.png"
agent-browser set viewport 1280 900
echo "DONE"
