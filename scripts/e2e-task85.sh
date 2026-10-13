#!/bin/bash
# Task 85 E2E — single-call server boot + browser checks for batch-5 study guides (final wave, completes 73/73)
cd /home/z/my-project

# 1) Boot dev server
rm -f scripts/dev85.log
(setsid nohup bun run dev > scripts/dev85.log 2>&1 &)
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

# 5) Count study toggles at card level; if 0, drill into a batch-5 section row first
TOGGLES=$(agent-browser eval "(() => JSON.stringify({ studyToggles: [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')).length }))()")
echo "card-level: $TOGGLES"
if echo "$TOGGLES" | tr -d '\\' | grep -q '"studyToggles":0'; then
  SEC_REF=""
  for attempt in 1 2 3; do
    sleep 2
    SEC_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Free Classics[^"]*" \[[^]]*ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
    [ -n "$SEC_REF" ] && break
  done
  if [ -n "$SEC_REF" ]; then
    echo "drilling into Free Classics row @$SEC_REF"
    agent-browser click "@$SEC_REF" 2>&1 | head -1
  else
    echo "ref extraction failed after retries — DOM-click fallback"
    agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Free Classics/.test(x.textContent||'') && /0\/5/.test(x.textContent||'')); if (b) { b.click(); return 'dom-clicked'; } return 'row-not-found'; })()"
  fi
  sleep 3
fi

# 6) Count toggles in the section view (was 59; +14 = 73) and map headers to toggle indices by document order
agent-browser eval "(() => { const tgl = [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')); const findFor = (title) => { const hs = [...document.querySelectorAll('h1,h2,h3,h4')].filter(x => (x.textContent||'').includes(title)); if (!hs.length) return -1; return tgl.findIndex(b => hs[0].compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); }; return JSON.stringify({ total: tgl.length, classics: findFor('Free Classics'), finalOps: findFor('Final Wave: Ops & Pairs') }); })()"

echo "--- prose assertions ---"

# 7) Open Free Classics toggle and assert batch-5 prose
agent-browser eval "(() => { const tgl = [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')); const hs = [...document.querySelectorAll('h1,h2,h3,h4')].filter(x => (x.textContent||'').includes('Free Classics')); if (!hs.length) return 'classics header not found'; const idx = tgl.findIndex(b => hs[0].compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); if (idx < 0) return 'classics toggle not found'; tgl[idx].click(); return 'clicked classics @' + idx; })()"
sleep 2
agent-browser eval "(() => { const t = document.body.innerText; return JSON.stringify({ 'classics intro': t.includes('each one separates two ideas SQL keeps visually similar'), 'nth why': t.includes('The question counts VALUES while the table stores ROWS'), 'referee why': t.includes('three-valued trap'), 'or why': t.includes('keeps a row when EITHER arm is TRUE') }); })()"

# 8) Open Final Wave: Ops & Pairs toggle and assert batch-5 prose
agent-browser eval "(() => { const tgl = [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')); const hs = [...document.querySelectorAll('h1,h2,h3,h4')].filter(x => (x.textContent||'').includes('Final Wave: Ops & Pairs')); if (!hs.length) return 'finalops header not found'; const idx = tgl.findIndex(b => hs[0].compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); if (idx < 0) return 'finalops toggle not found'; tgl[idx].click(); return 'clicked finalops @' + idx; })()"
sleep 2
agent-browser eval "(() => { const t = document.body.innerText; return JSON.stringify({ 'finalops intro': t.includes('Sequences are the closing theme'), 'bus why': t.includes('the LAST fitting turn boards'), 'pairs why': t.includes('6 courses yield 5 pairs never 15'), 'spiral why': t.includes('NOT a period-3 spiral') }); })()"

# 9) Frame the opened Free Classics panel and take desktop screenshot
agent-browser eval "(() => { let p = [...document.querySelectorAll('p,div,li')].find(x => (x.textContent||'').includes('each one separates two ideas SQL keeps visually similar') && (x.textContent||'').length < 1500); if (!p) p = [...document.querySelectorAll('p,div,li')].find(x => (x.textContent||'').includes('The question counts VALUES while the table stores ROWS') && (x.textContent||'').length < 900); if (p && p.scrollIntoView) { p.scrollIntoView({ block: 'center' }); return 'scrolled'; } return 'no prose node'; })()"
sleep 1
agent-browser screenshot /home/z/my-project/download/study-batch5-desktop.png

# 10) Mobile 390x844 overflow check
agent-browser set viewport 390 844
sleep 2
agent-browser eval "(() => { let p = [...document.querySelectorAll('p,div,li')].find(x => (x.textContent||'').includes('each one separates two ideas SQL keeps visually similar') && (x.textContent||'').length < 1500); if (!p) p = [...document.querySelectorAll('p,div,li')].find(x => (x.textContent||'').includes('The question counts VALUES while the table stores ROWS') && (x.textContent||'').length < 900); if (p && p.scrollIntoView) { p.scrollIntoView({ block: 'center' }); return 'scrolled'; } return 'no prose node'; })()"
sleep 1
agent-browser eval "(() => JSON.stringify({ overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, w: document.documentElement.clientWidth }))()"
agent-browser screenshot /home/z/my-project/download/study-batch5-mobile.png

echo "E2E TASK85 DONE"
