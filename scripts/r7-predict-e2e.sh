#!/bin/bash
# Round-7 fixup E2E — Boss Level III wired into the Predict drill pool
# (expected chip: "310 verified drills" — was 304 before boss3 append).
cd /home/z/my-project

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()" >/dev/null
sleep 1

echo "== open LC board =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => (x.textContent||'').includes('LeetCode Big Board')); if (!b) return 'no sidebar'; b.click(); return 'ok'; })()"
sleep 3

echo "== Predict tab: pool chip =="
agent-browser eval "(() => { const chips=[...document.querySelectorAll('main button')].filter(x => /^predict/i.test((x.textContent||'').trim())); const b=chips[chips.length-1]; if (!b) return 'no predict tab'; b.click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const chip=[...document.querySelectorAll('*')].find(x => /verified drills/.test(x.textContent||'') && (x.textContent||'').length < 60); const more=[...document.querySelectorAll('p')].find(x => /^\+ \d+ more/.test((x.textContent||'').trim())); return JSON.stringify({ pool: chip ? chip.textContent.match(/\d+ verified drills/)?.[0] : 'none', more: more ? more.textContent.trim() : 'none' }); })()"

echo "== start a drill: candidates render =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => /start a drill/i.test(x.textContent||'')); if (!b) return 'no start'; b.click(); return 'ok'; })()"
sleep 3
agent-browser eval "(() => { const cands=[...document.querySelectorAll('main button')].filter(x => /^(A|B|C|D)$/.test((x.textContent||'').trim())); const title=[...document.querySelectorAll('main h3,h2')].map(x=>x.textContent).filter(Boolean).slice(0,3); return JSON.stringify({ candidates: cands.length, titles: title }); })()"

agent-browser screenshot /home/z/my-project/scripts/shots/r7-predict-310.png

echo "E2E DONE"
agent-browser close --all 2>/dev/null || true
