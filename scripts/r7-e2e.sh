#!/bin/bash
# Round-7 desktop E2E — verify the new surfaces render and screenshot them.
cd /home/z/my-project

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()" >/dev/null
sleep 1

echo "== sidebar has Progress report =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => (x.textContent||'').includes('Progress report')); return b ? 'FOUND in sidebar' : 'MISSING'; })()"

echo "== open Progress report =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => (x.textContent||'').includes('Progress report')); if (!b) return 'no'; b.click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const t=[...document.querySelectorAll('h2')].find(x => (x.textContent||'').includes('SeeQL — Progress Report')); const rows=[...document.querySelectorAll('tbody tr')].length; return JSON.stringify({ sheet: !!t, moduleRows: rows }); })()"
agent-browser eval "(() => { const p=[...document.querySelectorAll('p,div')].find(x => (x.textContent||'').trim().startsWith('What’s next') || (x.textContent||'').trim().startsWith('What's next')); if (p && p.scrollIntoView) p.scrollIntoView({block:'start'}); return 'scrolled'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots/r7-report.png

echo "== LC board: boss3 band + counts =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => (x.textContent||'').includes('LeetCode Big Board')); if (!b) return 'no sidebar'; b.click(); return 'ok'; })()"
sleep 3
agent-browser eval "(() => { const t=[...document.querySelectorAll('h2,h3,div,span,p')].filter(x => (x.textContent||'').includes('Boss Level III')); const chip=[...document.querySelectorAll('*')].find(x => /6\d\d total/.test(x.textContent||'') && (x.textContent||'').length < 80); return JSON.stringify({ boss3: t.length > 0, chip: chip ? chip.textContent.slice(0,60) : 'none' }); })()"

echo "== Companies tab: search + counts =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Companies' && x.closest('main')); if (!b) return 'no tab'; b.click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const input=document.querySelector('input[placeholder*=\"Search companies\"]'); const counts=[...document.querySelectorAll('main span')].filter(x => /SQL · \d+ in set/.test(x.textContent||'')).length; return JSON.stringify({ search: !!input, countRows: counts }); })()"
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => (x.textContent||'').includes('Company index')); if (h && h.scrollIntoView) h.scrollIntoView({block:'start'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots/r7-companies.png

echo "E2E DONE"
agent-browser close --all 2>/dev/null || true
