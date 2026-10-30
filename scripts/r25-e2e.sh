#!/bin/bash
# lc-round25 E2E — the two standing follow-ups:
#   1. Boss Gauntlet run history PERSISTS across reloads (seeded 3-run ledger
#      -> briefing shows "run history · 3 runs · best 15/18" -> reload -> still there)
#   2. Domain Mastery pack cards show the per-bank progress breakdown
#      (retail: 2q+1m+1case(2 steps) -> "4/180" chip + emerald "2/60 · 1/60 · 1/60";
#       the 2-step case must count ONCE — the r24 double-count bug in reverse)
cd /home/z/my-project

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:3100/#learn" >/dev/null
sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()" >/dev/null
sleep 1

echo "== seed: 3 gauntlet runs + dm xpEvents (2q/1m/1case-with-2-steps retail, 1q grid) =="
agent-browser eval "(() => { const runs = [ { id: 'run-seed-3', ts: Date.now() - 3600e3, score: 15, total: 18, sec: 812, tier: 'Silver clear' }, { id: 'run-seed-2', ts: Date.now() - 86400e3, score: 12, total: 18, sec: 940, tier: 'Bronze clear' }, { id: 'run-seed-1', ts: Date.now() - 2*86400e3, score: 9, total: 18, sec: 1024, tier: null } ]; localStorage.setItem('seeql-gauntlet-runs-v1', JSON.stringify(runs)); const xp = { 'dm:retail-rfm:q:q01': 15, 'dm:retail-rfm:q:q02': 15, 'dm:retail-rfm:m:m01': 10, 'dm:retail-rfm:c:c01:1': 8, 'dm:retail-rfm:c:c01:2': 8, 'dm:energy-grid-ops:q:q01': 20 }; localStorage.setItem('sql-visualizer-learn-v1', JSON.stringify({ state: { xpEvents: xp }, version: 0 })); return 'seeded'; })()"
agent-browser eval "location.reload(); 'reloading'" >/dev/null
sleep 4
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()" >/dev/null
sleep 1

echo "== open LC board -> Predict tab -> Boss Gauntlet section =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => (x.textContent||'').includes('LeetCode Big Board')); if (!b) return 'no sidebar'; b.click(); return 'ok'; })()"
sleep 3
agent-browser eval "(() => { const chips=[...document.querySelectorAll('main button')].filter(x => /^predict/i.test((x.textContent||'').trim())); const b=chips[chips.length-1]; if (!b) return 'no predict tab'; b.click(); return 'ok'; })()"
sleep 3
echo "-- flip the mode pill to Boss Gauntlet --"
agent-browser eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => /Boss Gauntlet/.test(x.textContent||'')); if (!b) return 'no mode pill'; b.click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Boss Gauntlet/.test(x.textContent||'')); if (!h) return 'no gauntlet heading'; h.scrollIntoView({block:'center'}); return 'found'; })()"
sleep 1
echo "== history renders from the persisted ledger =="
agent-browser eval "(() => { const t=document.body.innerText; const m=t.match(/run history · (\d+) runs? · best (\d+)\/18/i); const silver=[...document.querySelectorAll('main span')].filter(x => /Silver clear/.test(x.textContent||'')).length; const bronze=[...document.querySelectorAll('main span')].filter(x => /Bronze clear/.test(x.textContent||'')).length; const noTier=[...document.querySelectorAll('main span')].filter(x => /^no tier$/.test((x.textContent||'').trim())).length; return JSON.stringify({ summary: m ? m[0] : null, silver, bronze, noTier }); })()"
agent-browser screenshot /home/z/my-project/scripts/shots/r25-gauntlet-history.png

echo "== THE POINT: reload — history must survive =="
agent-browser eval "location.reload(); 'reloading'" >/dev/null
sleep 4
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()" >/dev/null
sleep 1
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => (x.textContent||'').includes('LeetCode Big Board')); if (!b) return 'no sidebar'; b.click(); return 'ok'; })()"
sleep 3
agent-browser eval "(() => { const chips=[...document.querySelectorAll('main button')].filter(x => /^predict/i.test((x.textContent||'').trim())); const b=chips[chips.length-1]; if (!b) return 'no predict tab'; b.click(); return 'ok'; })()"
sleep 3
agent-browser eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => /Boss Gauntlet/.test(x.textContent||'')); if (!b) return 'no mode pill'; b.click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const t=document.body.innerText; const m=t.match(/run history · (\d+) runs? · best (\d+)\/18/i); const silver=[...document.querySelectorAll('main span')].filter(x => /Silver clear/.test(x.textContent||'')).length; return JSON.stringify({ survivesReload: !!m, summary: m ? m[0] : null, silverRowAfterReload: silver }); })()"

echo "== domains: per-bank breakdown on the pack cards =="
agent-browser eval "(() => { const pills=[...document.querySelectorAll('main button')].filter(x => /^domains/i.test((x.textContent||'').trim())); const b=pills[pills.length-1]; if (!b) return 'no pill'; b.click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const card=[...document.querySelectorAll('main button')].find(x => /Retail & RFM/.test(x.textContent||'')); if (!card) return 'no retail card'; const chip=[...card.querySelectorAll('span')].map(s=>s.textContent.trim()).find(t=>/\/180$/.test(t)); const q=[...card.querySelectorAll('span')].find(s=>/^2\/60 queries$/.test((s.textContent||'').trim())); const m=[...card.querySelectorAll('span')].find(s=>/^1\/60 MCQs$/.test((s.textContent||'').trim())); const c=[...card.querySelectorAll('span')].find(s=>/^1\/60 cases$/.test((s.textContent||'').trim())); return JSON.stringify({ chip, queries: q ? q.textContent.trim() : null, queriesEmerald: q ? q.className.includes('emerald') : false, mcqs: m ? m.textContent.trim() : null, cases: c ? c.textContent.trim() : null }); })()"
agent-browser eval "(() => { const card=[...document.querySelectorAll('main button')].find(x => /Energy & Grid Ops/.test(x.textContent||'')); if (!card) return 'no grid card'; const chip=[...card.querySelectorAll('span')].map(s=>s.textContent.trim()).find(t=>/\/180$/.test(t)); const q=[...card.querySelectorAll('span')].find(s=>/^1\/60 queries$/.test((s.textContent||'').trim())); return JSON.stringify({ chip, queries: q ? q.textContent.trim() : null }); })()"
agent-browser eval "(() => { const c=[...document.querySelectorAll('main button')].find(x => /Retail & RFM/.test(x.textContent||'')); c && c.scrollIntoView({block:'center'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots/r25-pack-breakdown.png
