#!/bin/bash
# Task 84 E2E — single-call server boot + browser checks for batch-4 study guides (premium waves 3+4)
cd /home/z/my-project

# 1) Boot dev server
rm -f scripts/dev84.log
(setsid nohup bun run dev > scripts/dev84.log 2>&1 &)
for i in $(seq 1 90); do
  sleep 1
  curl -s -o /dev/null http://localhost:3000 && break
done
echo "server: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)"

# 2) Fresh browser session
agent-browser close --all 2>/dev/null || true
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 5

# 3) Skip tour if present
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()"

# 4) Expand the LC band module card via real click (only when collapsed)
CARD_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'LeetCode SQL 50+ MODULE 12[^"]*" \[expanded=false, ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
if [ -n "$CARD_REF" ]; then
  echo "expanding module card @$CARD_REF"
  agent-browser click "@$CARD_REF" 2>&1 | head -1
  sleep 3
else
  echo "module card already expanded"
fi

# 5) Count study toggles at card level; if 0, drill into a batch-4 section row first
TOGGLES=$(agent-browser eval "(() => JSON.stringify({ studyToggles: [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')).length }))()")
echo "card-level: $TOGGLES"
if echo "$TOGGLES" | tr -d '\\' | grep -q '"studyToggles":0'; then
  SEC_REF=""
  for attempt in 1 2 3; do
    sleep 2
    SEC_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Premium Stats & Eligibility[^"]*" \[[^]]*ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
    [ -n "$SEC_REF" ] && break
  done
  if [ -n "$SEC_REF" ]; then
    echo "drilling into Premium Stats & Eligibility row @$SEC_REF"
    agent-browser click "@$SEC_REF" 2>&1 | head -1
  else
    echo "ref extraction failed after retries — DOM-click fallback"
    agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Premium Stats & Eligibility/.test(x.textContent||'') && /0\/6/.test(x.textContent||'')); if (b) { b.click(); return 'dom-clicked'; } return 'row-not-found'; })()"
  fi
  sleep 3
fi

# 6) Count toggles in the section view (was 47; +12 = 59) and map headers to toggle indices by document order
agent-browser eval "(() => { const tgl = [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')); const findFor = (title) => { const hs = [...document.querySelectorAll('h1,h2,h3,h4')].filter(x => (x.textContent||'').includes(title)); if (!hs.length) return -1; return tgl.findIndex(b => hs[0].compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); }; return JSON.stringify({ total: tgl.length, stats: findFor('Premium Stats & Eligibility'), streaks: findFor('Premium Consecutive Engines') }); })()"

echo "--- prose assertions ---"

# 7) Open Premium Stats & Eligibility toggle and assert batch-4 prose
agent-browser eval "(() => { const tgl = [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')); const hs = [...document.querySelectorAll('h1,h2,h3,h4')].filter(x => (x.textContent||'').includes('Premium Stats & Eligibility')); if (!hs.length) return 'stats header not found'; const idx = tgl.findIndex(b => hs[0].compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); if (idx < 0) return 'stats toggle not found'; tgl[idx].click(); return 'clicked stats @' + idx; })()"
sleep 2
agent-browser eval "(() => { const t = document.body.innerText; return JSON.stringify({ 'stats intro': t.includes('Eligibility is arithmetic that gets judged after grouping'), 'cutoff why': t.includes('The reverse-cumulative quantile'), 'bucket why': t.includes('Bucketing is arithmetic before grouping'), 'exists why': t.includes('Two existence tests at the account grain') }); })()"

# 8) Open Premium Consecutive Engines toggle and assert batch-4 prose
agent-browser eval "(() => { const tgl = [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')); const hs = [...document.querySelectorAll('h1,h2,h3,h4')].filter(x => (x.textContent||'').includes('Premium Consecutive Engines')); if (!hs.length) return 'streaks header not found'; const idx = tgl.findIndex(b => hs[0].compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); if (idx < 0) return 'streaks toggle not found'; tgl[idx].click(); return 'clicked streaks @' + idx; })()"
sleep 2
agent-browser eval "(() => { const t = document.body.innerText; return JSON.stringify({ 'streaks intro': t.includes('Adjacency is manufactured, never assumed'), 'rising-run why': t.includes('A rising run is a relationship between ADJACENT rows'), 'dedupe why': t.includes('The dedupe is what keeps the numbering honest'), 'unit-cost why': t.includes('The unit cost is a per-type property') }); })()"

# 9) Frame the opened panel and take desktop screenshot
agent-browser eval "(() => { const el = [...document.querySelectorAll('*')].find(x => x.children.length === 0 && /Eligibility is arithmetic/.test(x.textContent||'')); if (el) { el.scrollIntoView({ block: 'start' }); return 'scrolled'; } return 'no target'; })()"
sleep 1
agent-browser screenshot /home/z/my-project/download/study-batch4-desktop.png

# 10) Mobile 390x844 overflow check
agent-browser set viewport 390 844
sleep 2
agent-browser eval "(() => JSON.stringify({ overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, w: document.documentElement.clientWidth }))()"
agent-browser screenshot /home/z/my-project/download/study-batch4-mobile.png

echo "E2E TASK84 DONE"
