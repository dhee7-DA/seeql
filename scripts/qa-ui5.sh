#!/usr/bin/env bash
# UI-kit round QA: tools.ts registry drives sidebar + ToolRail, shell swept
# onto ui/kit primitives (Panel/Chip/Btn/ToolRow/ProgressBar/SectionLabel),
# switch-based ViewBody with a 0.2s entrance, global pointer cursor +
# keyboard focus ring. SeeQ section + placeable buddy must be untouched.
set -u
cd /home/z/my-project
BASE=http://localhost:3000
OUT=/home/z/my-project/scripts
STAMP=$(date +%s)

agent-browser open "$BASE/#learn?fresh=ui5-$STAMP" || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1
agent-browser set viewport 1280 900
sleep 1

echo "=== 1. shell structure: registry-driven sidebar (17 rows) + hero chips + bar"
agent-browser eval "
(() => {
  const rows = Array.from(document.querySelectorAll('aside nav button[aria-current]')).length;
  const sidebarBtns = Array.from(document.querySelectorAll('aside button')).length;
  const chips = Array.from(document.querySelectorAll('main span')).filter((s) => /^(Rank|Total XP|Streak|Badges)/.test(s.textContent)).length;
  const bar = !!document.querySelector('main .bar-shimmer');
  const cta = Array.from(document.querySelectorAll('main button')).find((b) => /Start learning|Continue — lesson/.test(b.textContent));
  return JSON.stringify({
    toolRowsWithAria: sidebarBtns > 0,
    sidebarBtns,
    overviewActive: !!document.querySelector('aside button[aria-current=\"page\"]'),
    chips: chips >= 4,
    progressBar: bar,
    primaryCta: !!cta,
    ctaCursor: cta ? getComputedStyle(cta).cursor : null,
  });
})()
"

echo "=== 2. registry nav: click 'Data explorer' row -> view swaps + active follows"
agent-browser eval "
(() => {
  const row = Array.from(document.querySelectorAll('aside button')).find((b) => b.textContent.includes('Data explorer'));
  row.click();
  return 'clicked data explorer';
})()
"
sleep 0.8
agent-browser eval "
(() => {
  const active = document.querySelector('aside button[aria-current=\"page\"]');
  const mainText = document.querySelector('main').textContent.slice(0, 400);
  const heroGone = !document.querySelector('main h1');
  const entered = (() => {
    const wrap = document.querySelector('main > div:nth-of-type(2)');
    return wrap ? (wrap.style.opacity !== '' || wrap.style.transform !== '') : false;
  })();
  return JSON.stringify({
    activeLabel: active ? active.textContent.slice(0, 30) : null,
    heroGone,
    explorerWords: /table|column|row/i.test(mainText),
    entranceAnimated: entered,
  });
})()
"

echo "=== 3. affordances: pointer cursor + keyboard focus ring on a raw row"
agent-browser eval "
(() => {
  const row = Array.from(document.querySelectorAll('aside button')).find((b) => b.textContent.includes('Keyword drills'));
  return JSON.stringify({ rowCursor: getComputedStyle(row).cursor });
})()
"
agent-browser eval "document.activeElement && document.activeElement.blur && document.activeElement.blur(); 'blurred'"
agent-browser press Tab
agent-browser press Tab
agent-browser eval "
(() => {
  const el = document.activeElement;
  const cs = getComputedStyle(el);
  return JSON.stringify({ focused: el.tagName + ':' + (el.textContent || '').slice(0, 16), outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor });
})()
"

echo "=== 4. back to overview via Course overview row, open a lesson from the CTA"
agent-browser eval "
(() => {
  const row = Array.from(document.querySelectorAll('aside button')).find((b) => b.textContent.includes('Course overview'));
  row.click();
  return 'back to overview';
})()
"
sleep 0.8
agent-browser eval "
(() => {
  const cta = Array.from(document.querySelectorAll('main button')).find((b) => /Start learning|Continue — lesson/.test(b.textContent));
  if (!cta) return JSON.stringify({ cta: false });
  cta.click();
  return JSON.stringify({ cta: true, clicked: true });
})()
"
sleep 1
agent-browser eval "
(() => {
  const heroGone = !Array.from(document.querySelectorAll('main h1')).some((h) => h.textContent === 'The SeeQL course');
  const lessonBits = document.querySelectorAll('main pre, main code').length;
  return JSON.stringify({ heroGone, lessonContent: lessonBits > 0 });
})()
"

echo "=== 5. SeeQ section from the header still intact (tiles, commit, reset)"
agent-browser eval "document.querySelector('[data-seeq-nav=\"1\"]').click(); 'nav seeq'"
sleep 0.8
agent-browser eval "
(() => {
  const v = document.querySelector('[data-seeq-view=\"1\"]');
  const n = (p) => v.querySelectorAll('[data-seeq-tile^=\"' + p + '\"]').length;
  return JSON.stringify({
    view: !!v,
    states: n('state-'), shapes: n('shape-'), exprs: n('expr-'), colours: n('colour-'),
    commit: !!document.querySelector('[data-seeq-commit=\"1\"]'),
    reset: !!document.querySelector('[data-seeq-reset=\"1\"]'),
  });
})()
"

echo "=== 6. placeable buddy: drag 200/-80 persists (SeeQ view active)"
agent-browser eval "
(() => {
  const btn = document.querySelector('[data-seeq=\"1\"] button');
  const b = btn.getBoundingClientRect();
  const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
  const opts = { bubbles: true, pointerId: 1, pointerType: 'mouse', isPrimary: true };
  btn.dispatchEvent(new PointerEvent('pointerdown', { ...opts, clientX: cx, clientY: cy, button: 0 }));
  window.dispatchEvent(new PointerEvent('pointermove', { ...opts, clientX: cx + 120, clientY: cy - 50 }));
  window.dispatchEvent(new PointerEvent('pointermove', { ...opts, clientX: cx + 200, clientY: cy - 80 }));
  window.dispatchEvent(new PointerEvent('pointerup', { ...opts, clientX: cx + 200, clientY: cy - 80 }));
  return 'dragged';
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
  });
})()
"

echo "=== 7. screenshots: seeq view (desktop) then overview + mobile rail"
agent-browser screenshot "$OUT/qa-ui5-seeq.png"
agent-browser eval "
(() => { const r = Array.from(document.querySelectorAll('aside button')).find((b) => b.textContent.includes('Course overview')); r.click(); return 'overview'; })()
"
sleep 0.9
agent-browser screenshot "$OUT/qa-ui5-overview.png"
agent-browser set viewport 390 844
sleep 0.7
agent-browser eval "
(() => {
  const rail = document.querySelector('nav[aria-label=\"Quick tools\"]');
  const pills = rail ? rail.querySelectorAll('button').length : 0;
  const labels = rail ? Array.from(rail.querySelectorAll('button')).slice(0, 5).map((b) => b.textContent.trim()) : [];
  return JSON.stringify({ railPills: pills, firstLabels: labels });
})()
"
agent-browser eval "
(() => {
  const m = Array.from(document.querySelectorAll('nav[aria-label=\"Quick tools\"] button')).find((b) => b.textContent.trim() === 'Mentor');
  m.click();
  return 'rail mentor clicked';
})()
"
sleep 0.9
agent-browser eval "
(() => {
  const active = document.querySelector('nav[aria-label=\"Quick tools\"] button[aria-current=\"page\"]');
  const chatish = /mentor|hint|ask|tier/i.test(document.querySelector('main').textContent.slice(0, 300));
  return JSON.stringify({ activePill: active ? active.textContent.trim() : null, mentorWords: chatish });
})()
"
agent-browser screenshot "$OUT/qa-ui5-mobile.png"

echo "=== 8. console errors"
agent-browser errors
echo "--- done ui5 ---"
