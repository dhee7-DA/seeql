#!/bin/bash
# lc-round23-redo E2E — Domains list with NINE pack cards, Energy & Grid Ops
# detail (header, chip, badges, sections), a solved query problem (chip moves
# to 1/180), an MCQ open with 4 options.
cd /home/z/my-project

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:3100/#learn" >/dev/null
sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()" >/dev/null
sleep 1

echo "== open LC board -> Domains tab =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => (x.textContent||'').includes('LeetCode Big Board')); if (!b) return 'no sidebar'; b.click(); return 'ok'; })()"
sleep 3
agent-browser eval "(() => { const pills=[...document.querySelectorAll('main button')].filter(x => /^domains/i.test((x.textContent||'').trim())); const b=pills[pills.length-1]; if (!b) return 'no pill'; b.click(); return 'ok'; })()"
sleep 2

echo "== pack list (9 cards + 9 zero chips expected) =="
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Domain packs/.test(x.textContent||'')); const cards=[...document.querySelectorAll('main button')].filter(x => /Energy & Grid Ops/.test(x.textContent||'')); const zeroChips=[...document.querySelectorAll('main span')].filter(x => /^0\/180$/.test((x.textContent||'').trim())).length; return JSON.stringify({ header: !!h, gridCard: cards.length, zeroChips }); })()"
agent-browser eval "(() => { const c=[...document.querySelectorAll('main button')].find(x => /Energy & Grid Ops/.test(x.textContent||'')); c && c.scrollIntoView({block:'center'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots/r23-domains-grid.png

echo "== open Energy & Grid Ops detail =="
agent-browser eval "(() => { const cards=[...document.querySelectorAll('main button')].filter(x => /Energy & Grid Ops/.test(x.textContent||'')); if (!cards.length) return 'no card'; cards[0].click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Energy & Grid Ops/.test(x.textContent||'')); const chip=[...document.querySelectorAll('main span')].find(x => /^0\/180$/.test((x.textContent||'').trim())); const back=[...document.querySelectorAll('main button')].find(x => /all domains/i.test((x.textContent||''))); const cos=[...document.querySelectorAll('main p')].filter(x => /Cascadia Power|Columbia Rim Energy/.test(x.textContent||'')).length; const sections=['Query problems','Knowledge checks','Case studies'].map(s => document.body.innerText.includes(s)); const bands=['WARM-UP','FOREMAN','BLACKOUT'].map(s => document.body.innerText.toUpperCase().includes(s)); return JSON.stringify({ header: !!h, chip: chip ? chip.textContent.trim() : 'none', backBtn: !!back, fictionalCos: cos, sections, bands }); })()"
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Energy & Grid Ops/.test(x.textContent||'')); h && h.scrollIntoView({block:'start'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots/r23-grid-detail.png

echo "== solve q01 (restored count) =="
agent-browser eval "(() => { const rows=[...document.querySelectorAll('main button, main a, main [role=button]')].filter(x => /Restored count/.test(x.textContent||'')); if (!rows.length) return 'no row'; rows[0].click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const ta=document.querySelector('textarea, [placeholder*=SELECT], .cm-content'); return ta ? 'editor present' : document.body.innerText.slice(0,200); })()"
agent-browser eval "(() => { const btns=[...document.querySelectorAll('main button')]; const run=btns.find(x => /run|submit/i.test(x.textContent||'')); if (!run) return 'no run btn'; run.click(); return 'clicked'; })()"
sleep 2
agent-browser eval "(() => { const t=document.body.innerText; const verdict=/PASS|correct/i.test(t); const chip=[...document.querySelectorAll('main span')].find(x => /^1\/180$/.test((x.textContent||'').trim())); return JSON.stringify({ verdict, chip: chip ? chip.textContent.trim() : 'none' }); })()"
agent-browser screenshot /home/z/my-project/scripts/shots/r23-grid-solved.png

echo "== open an MCQ =="
agent-browser eval "(() => { const pills=[...document.querySelectorAll('main button')].filter(x => /knowledge|mcq/i.test(x.textContent||'')); const b=pills[0]; if (!b) return 'no pill'; b.click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const t=document.body.innerText; const opts=[...document.querySelectorAll('main button')].filter(x => /restored|rows|·/.test(x.textContent||'')).length; return JSON.stringify({ hasCode: !!document.querySelector('code'), optCount: opts }); })()"
agent-browser screenshot /home/z/my-project/scripts/shots/r23-grid-mcq.png
