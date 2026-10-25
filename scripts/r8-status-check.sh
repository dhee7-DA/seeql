#!/bin/bash
# Round 8 status spot-check — reuses r8-e2e.sh proven selectors
cd /home/z/my-project
AB="agent-browser"
$AB close --all >/dev/null 2>&1
$AB set viewport 1440 900
$AB open "http://localhost:3000/#learn" >/dev/null
sleep 5
$AB eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()" >/dev/null
sleep 1

echo "== open LC board =="
$AB eval "(() => { const b=[...document.querySelectorAll('button')].find(x => (x.textContent||'').includes('LeetCode Big Board')); if (!b) return 'no sidebar'; b.click(); return 'ok'; })()"
sleep 3

echo "== [1] Predict streak chip + mode pills =="
$AB eval "(() => { const chips=[...document.querySelectorAll('main button')].filter(x => /^predict/i.test((x.textContent||'').trim())); chips[chips.length-1] && chips[chips.length-1].click(); return 'ok'; })()"
sleep 2
$AB eval "(() => { const chip=[...document.querySelectorAll('span')].find(x => /read · streak/.test(x.textContent||'')); const pills=[...document.querySelectorAll('main button')].filter(x => /^(Drills|Boss Gauntlet)$/.test((x.textContent||'').trim())).map(p => p.textContent.trim()); return JSON.stringify({ chip: chip ? chip.textContent.trim() : 'none', pills }); })()"

echo "== [2] Gauntlet briefing =="
$AB eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => (x.textContent||'').trim() === 'Boss Gauntlet'); if (!b) return 'no pill'; b.click(); return 'ok'; })()"
sleep 2
$AB eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Boss Gauntlet/.test(x.textContent||'')); const fmt=[...document.querySelectorAll('span,div')].find(x => /18 rounds · 75s each/.test(x.textContent||'') && (x.textContent||'').length < 60); const start=[...document.querySelectorAll('main button')].find(x => /start the gauntlet/i.test(x.textContent||'')); return JSON.stringify({ briefing: !!h, format: fmt ? fmt.textContent : 'none', startBtn: !!start }); })()"

echo "== [3] Company track bands (Amazon) =="
$AB eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => (x.textContent||'').trim() === 'Companies' && x.closest('main')); if (!b) return 'no tab'; b.click(); return 'ok'; })()"
sleep 2
$AB eval "(() => { const row=[...document.querySelectorAll('main button')].find(x => /SQL track|Open track|SQL · \d+ in set/.test(x.textContent||'') && /Amazon|Google|Meta/.test(x.textContent||'')); if (!row) return 'no track row'; row.click(); return 'opened'; })()"
sleep 2
$AB eval "(() => { const bands=[...document.querySelectorAll('main h3')].filter(x => /^(warm-up|core screens|the wall)$/.test((x.textContent||'').trim())).map(b => b.textContent.trim()); return JSON.stringify({ bands }); })()"

$AB screenshot scripts/shots/r8-status-confirm.png >/dev/null 2>&1
$AB close --all >/dev/null 2>&1
echo "SPOT-CHECK DONE"
