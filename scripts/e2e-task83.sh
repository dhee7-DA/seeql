#!/bin/bash
# Task 83 E2E — single-call server boot + browser checks for batch-3 study guides (premium waves 1+2)
cd /home/z/my-project

# 1) Boot dev server
rm -f /tmp/dev83.log
(setsid nohup bun run dev > /tmp/dev83.log 2>&1 &)
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

# 5) Count study toggles at card level; if 0, drill into a premium section row first
TOGGLES=$(agent-browser eval "(() => JSON.stringify({ studyToggles: [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')).length }))()")
echo "card-level: $TOGGLES"
if echo "$TOGGLES" | tr -d '\\' | grep -q '"studyToggles":0'; then
  SEC_REF=""
  for attempt in 1 2 3; do
    sleep 2
    SEC_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Premium Warmups[^"]*" \[[^]]*ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
    [ -n "$SEC_REF" ] && break
  done
  if [ -n "$SEC_REF" ]; then
    echo "drilling into Premium Warmups row @$SEC_REF"
    agent-browser click "@$SEC_REF" 2>&1 | head -1
  else
    echo "ref extraction failed after retries — DOM-click fallback"
    agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Premium Warmups/.test(x.textContent||'') && /0\/6/.test(x.textContent||'')); if (b) { b.click(); return 'dom-clicked'; } return 'row-not-found'; })()"
  fi
  sleep 3
fi

# 6) Count toggles in the section view (was 35; +12 = 47) and map headers to toggle indices by document order
agent-browser eval "(() => { const tgl = [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')); const findFor = (title) => { const hs = [...document.querySelectorAll('h1,h2,h3,h4')].filter(x => (x.textContent||'').includes(title)); if (!hs.length) return -1; return tgl.findIndex(b => hs[0].compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); }; return JSON.stringify({ total: tgl.length, warmups: findFor('Premium Warmups'), hopper: findFor('Premium Hopper') }); })()"

echo "--- prose assertions ---"

# 7) Open Premium Warmups toggle (first study toggle AFTER its header in document order) and assert batch-3 prose
agent-browser eval "(() => { const tgl = [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')); const hs = [...document.querySelectorAll('h1,h2,h3,h4')].filter(x => (x.textContent||'').includes('Premium Warmups')); if (!hs.length) return 'warmups header not found'; const idx = tgl.findIndex(b => hs[0].compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); if (idx < 0) return 'warmups toggle not found'; tgl[idx].click(); return 'clicked warmups @' + idx; })()"
sleep 2
agent-browser eval "(() => { const t = document.body.innerText; return JSON.stringify({ 'warmups intro': t.includes('Rates open the premium tier'), 'unit-audit why': t.includes('The unit audit'), 'cross-join why': t.includes('The honest CROSS JOIN'), 'sync-log why': t.includes('An append-only log') }); })()"

# 8) Open Premium Hopper & Champions toggle and assert batch-3 prose
agent-browser eval "(() => { const tgl = [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')); const hs = [...document.querySelectorAll('h1,h2,h3,h4')].filter(x => (x.textContent||'').includes('Premium Hopper')); if (!hs.length) return 'hopper header not found'; const idx = tgl.findIndex(b => hs[0].compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); if (idx < 0) return 'hopper toggle not found'; tgl[idx].click(); return 'clicked hopper @' + idx; })()"
sleep 2
agent-browser eval "(() => { const t = document.body.innerText; return JSON.stringify({ 'hopper intro': t.includes('Spine-first reporting'), 'month-axis why': t.includes('The month axis is data'), 'bucket-contract why': t.includes('The bucket key is the contract'), 'unpivot why': t.includes('Unpivot before counting') }); })()"

# 9) Desktop screenshot
agent-browser screenshot /home/z/my-project/download/study-batch3-desktop.png

# 10) Mobile 390x844 overflow check
agent-browser set viewport 390 844
sleep 2
agent-browser eval "(() => JSON.stringify({ overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, w: document.documentElement.clientWidth }))()"
agent-browser screenshot /home/z/my-project/download/study-batch3-mobile.png

echo "E2E TASK83 DONE"
