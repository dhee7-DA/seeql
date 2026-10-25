#!/bin/bash
# Round-8 E2E — Boss Gauntlet, streak-reward hint, company track bands.
cd /home/z/my-project

# fresh server (the running one may hold the previous build in memory)
pkill -f "standalone/server.js" 2>/dev/null
sleep 1
setsid nohup bun run dev > /dev/null 2>&1 < /dev/null &
for i in $(seq 1 30); do
  sleep 1
  curl -s -o /dev/null --max-time 2 http://localhost:3000/ && break
done
curl -s -o /dev/null -w "root:%{http_code}\n" http://localhost:3000/ || exit 1

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()" >/dev/null
sleep 1

echo "== open LC board → Predict tab =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => (x.textContent||'').includes('LeetCode Big Board')); if (!b) return 'no sidebar'; b.click(); return 'ok'; })()"
sleep 3
agent-browser eval "(() => { const chips=[...document.querySelectorAll('main button')].filter(x => /^predict/i.test((x.textContent||'').trim())); chips[chips.length-1] && chips[chips.length-1].click(); return 'ok'; })()"
sleep 2

echo "== mode pills present =="
agent-browser eval "(() => { const pills=[...document.querySelectorAll('main button')].filter(x => /^(Drills|Boss Gauntlet)$/.test((x.textContent||'').trim())); return JSON.stringify({ pills: pills.map(p => p.textContent.trim()) }); })()"

echo "== streak hint in chip =="
agent-browser eval "(() => { const chip=[...document.querySelectorAll('span')].find(x => /read · streak/.test(x.textContent||'')); return chip ? chip.textContent.trim() : 'none'; })()"

echo "== open Boss Gauntlet briefing =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => (x.textContent||'').trim() === 'Boss Gauntlet'); if (!b) return 'no pill'; b.click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Boss Gauntlet/.test(x.textContent||'')); const chip=[...document.querySelectorAll('span,div')].find(x => /18 rounds · 75s each/.test(x.textContent||'') && (x.textContent||'').length < 60); const tiers=[...document.querySelectorAll('p')].filter(x => /correct · \+/.test(x.textContent||'')).length; return JSON.stringify({ briefing: !!h, format: chip ? chip.textContent : 'none', tierCards: tiers }); })()"
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Boss Gauntlet/.test(x.textContent||'')); h && h.scrollIntoView({block:'start'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots/r8-gauntlet-briefing.png

echo "== start run → round 1 =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => /start the gauntlet/i.test(x.textContent||'')); if (!b) return 'no start'; b.click(); return 'ok'; })()"
sleep 4
agent-browser eval "(() => { const strip=[...document.querySelectorAll('span')].find(x => /round 1\/18/.test(x.textContent||'')); const cands=[...document.querySelectorAll('main button')].filter(x => (x.querySelector('span') && /^(A|B|C|D)$/.test(x.querySelector('span').textContent||''))); const clock=[...document.querySelectorAll('span')].find(x => /^\d+s$/.test((x.textContent||'').trim())); return JSON.stringify({ roundStrip: strip ? strip.textContent.trim() : 'none', candidates: cands.length, clock: clock ? clock.textContent.trim() : 'none' }); })()"

echo "== pick first candidate → verdict + next =="
agent-browser eval "(() => { const cands=[...document.querySelectorAll('main button')].filter(x => (x.querySelector('span') && /^(A|B|C|D)$/.test(x.querySelector('span').textContent||''))); if (!cands.length) return 'no candidates'; cands[0].click(); return 'picked A'; })()"
sleep 2
agent-browser eval "(() => { const next=[...document.querySelectorAll('main button')].find(x => /next round/i.test(x.textContent||'')); const verdict=[...document.querySelectorAll('main p')].find(x => /real output|landed the real table|Time\./.test(x.textContent||'')); return JSON.stringify({ nextBtn: !!next, verdict: verdict ? verdict.textContent.slice(0, 80) : 'none' }); })()"
agent-browser eval "(() => { const p=[...document.querySelectorAll('main p')].find(x => /boss gauntlet/i.test(x.textContent||'')); p && p.scrollIntoView({block:'start'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots/r8-gauntlet-round.png

echo "== company track bands =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => (x.textContent||'').trim() === 'Boss Gauntlet'); b && b.click(); return 'back to drills mode'; })()" >/dev/null
sleep 1
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Companies' && x.closest('main')); if (!b) return 'no tab'; b.click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const row=[...document.querySelectorAll('main button')].find(x => /SQL track|Open track|SQL · \d+ in set/.test(x.textContent||'') && /Amazon|Google|Meta/.test(x.textContent||'')); if (!row) return 'no track row'; row.click(); return 'opened'; })()"
sleep 2
agent-browser eval "(() => { const bands=[...document.querySelectorAll('main h3')].filter(x => /^(warm-up|core screens|the wall)$/.test((x.textContent||'').trim())); const bars=[...document.querySelectorAll('main h3')].filter(x => /^(warm-up|core screens|the wall)$/.test((x.textContent||'').trim())).map(h => h.parentElement && h.parentElement.parentElement ? h.parentElement.parentElement.querySelector('span.tnum, span')?.textContent : ''); return JSON.stringify({ bands: bands.map(b => b.textContent.trim()) }); })()"
agent-browser eval "(() => { const h=[...document.querySelectorAll('main h2')].find(x => /SQL track/.test(x.textContent||'')); h && h.scrollIntoView({block:'start'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots/r8-company-bands.png

echo "E2E DONE"
agent-browser close --all 2>/dev/null || true
