#!/usr/bin/env bash
# One-shot browser QA for the redesigned course-overview menu
# (hero continue + compact course-map cards).
# Runs inside a single call — the sandbox reaps background processes when the Bash tool call ends.
set -u
cd /home/z/my-project

BASE=http://localhost:3000
OUT=/home/z/my-project/scripts

echo "=== 1. open learn view"
agent-browser open "$BASE/#learn" || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1
sleep 2
agent-browser eval "window.scrollTo(0,0); 'top'" > /dev/null

echo "=== 2. above-the-fold assertions (1440x900)"
agent-browser eval "
(() => {
  const hero = [...document.querySelectorAll('h1')].find(h => h.textContent === 'The SeeQL course');
  const cont = [...document.querySelectorAll('button')].find(b => /Continue — lesson|Start learning/.test(b.textContent));
  const map = [...document.querySelectorAll('h2')].find(h => h.textContent === 'Course map');
  const heroY = hero ? Math.round(hero.getBoundingClientRect().top) : -1;
  const contY = cont ? Math.round(cont.getBoundingClientRect().top) : -1;
  const mapY = map ? Math.round(map.getBoundingClientRect().top) : -1;
  return JSON.stringify({ heroY, contY, mapY, fold: 900,
    heroAbove: heroY >= 0 && heroY < 900, contAbove: contY >= 0 && contY < 900, mapAbove: mapY >= 0 && mapY < 900 });
})()
"

echo "=== 3. module card count + page height"
agent-browser eval "
(() => {
  const cards = [...document.querySelectorAll('button[aria-expanded]')].filter(b => /Module \d+ ·/.test(b.textContent));
  return JSON.stringify({ moduleCards: cards.length,
    mainScrollH: Math.round(document.querySelector('main').scrollHeight) });
})()
"
agent-browser screenshot "$OUT/qa-menu-desktop.png"

echo "=== 4. expand Module 1 via eval, open its first lesson"
agent-browser eval "
(() => {
  const card = [...document.querySelectorAll('button[aria-expanded]')].find(b => /Module 1 \u00b7/.test(b.textContent));
  if (!card) return 'card-missing';
  card.click();
  return 'expanded:' + card.getAttribute('aria-expanded');
})()
"
sleep 1
agent-browser eval "
(() => {
  const card = [...document.querySelectorAll('button[aria-expanded=true]')].find(b => /Module 1 \u00b7/.test(b.textContent));
  if (!card) return 'card-not-open';
  const body = card.parentElement.querySelector('div[class*=border-t]');
  const rows = body ? [...body.querySelectorAll('button')] : [];
  if (!rows.length) return 'rows-missing';
  rows[0].click();
  return 'clicked:' + rows[0].textContent.trim().slice(0, 40);
})()
"
sleep 2
agent-browser eval "
(() => {
  const h = document.querySelector('main h1, main h2');
  return JSON.stringify({ viewAfterClick: h ? h.textContent.slice(0, 60) : 'none' });
})()
"
agent-browser screenshot "$OUT/qa-menu-lesson.png"

echo "=== 5. back to overview via toolbox"
agent-browser eval "
(() => {
  const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Course overview'));
  if (!b) return 'btn-missing';
  b.click(); return 'ok';
})()
"
sleep 1

echo "=== 6. mobile viewport 390x844"
agent-browser eval "window.scrollTo(0,0); 'top'" > /dev/null
agent-browser set-viewport 390 844 2>/dev/null || agent-browser resize 390 844 2>/dev/null || echo "(viewport cmd unavailable — CSS media query will still apply at this size only if resize worked)"
sleep 1
agent-browser eval "window.scrollTo(0,0); 'top'" > /dev/null
agent-browser screenshot "$OUT/qa-menu-mobile.png"
agent-browser eval "
(() => {
  const cont = [...document.querySelectorAll('button')].find(b => /Continue — lesson|Start learning/.test(b.textContent));
  const rail = document.querySelector('nav[aria-label=\"Quick tools\"]');
  const railHidden = rail ? getComputedStyle(rail).display === 'none' : 'absent';
  const mainTop = document.querySelector('main').getBoundingClientRect().top;
  const asideTop = document.querySelector('aside').getBoundingClientRect().top;
  return JSON.stringify({ contVisibleMobile: !!cont && cont.getBoundingClientRect().top < 844,
    contY: cont ? Math.round(cont.getBoundingClientRect().top) : -1,
    railPresent: !!rail, railHidden, mainFirst: mainTop < asideTop });
})()
"

echo "=== 6b. tool rail navigation works (mobile)"
agent-browser eval "
(() => {
  const rail = document.querySelector('nav[aria-label=\"Quick tools\"]');
  if (!rail) return 'rail-missing';
  const golf = [...rail.querySelectorAll('button')].find(b => b.textContent.includes('Golf'));
  if (!golf) return 'golf-chip-missing';
  golf.click(); return 'ok';
})()
"
sleep 2
agent-browser eval "
(() => {
  const h = document.querySelector('main h1, main h2');
  return JSON.stringify({ viewAfterGolf: h ? h.textContent.slice(0, 50) : 'none' });
})()
"

echo "=== 7. page errors"
agent-browser errors
echo "=== done"
