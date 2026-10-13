#!/bin/bash
# Task 84 screenshot pass — frame the opened Premium Stats & Eligibility study panel
cd /home/z/my-project

rm -f scripts/dev84.log
(setsid nohup bun run dev > scripts/dev84.log 2>&1 &)
for i in $(seq 1 90); do
  sleep 1
  curl -s -o /dev/null http://localhost:3000 && break
done
echo "server: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)"

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1280 900
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()"

CARD_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'LeetCode SQL 50+ MODULE 12[^"]*" \[expanded=false, ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
if [ -n "$CARD_REF" ]; then
  agent-browser click "@$CARD_REF" >/dev/null 2>&1
  sleep 3
fi

SEC_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Premium Stats & Eligibility[^"]*" \[[^]]*ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
if [ -n "$SEC_REF" ]; then
  agent-browser click "@$SEC_REF" >/dev/null 2>&1
  sleep 3
fi

# open the Premium Stats & Eligibility study toggle (first after header, document order)
agent-browser eval "(() => { const tgl = [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')); const hs = [...document.querySelectorAll('h1,h2,h3,h4')].filter(x => (x.textContent||'').includes('Premium Stats & Eligibility')); if (!hs.length) return 'no header'; const idx = tgl.findIndex(b => hs[0].compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); if (idx < 0) return 'no toggle'; tgl[idx].click(); return 'opened @' + idx; })()"
sleep 2

# scroll the study prose into view — intro sentence first, cutoff why as fallback
agent-browser eval "(() => { let p = [...document.querySelectorAll('p,div,li')].find(x => (x.textContent||'').includes('Eligibility is arithmetic that gets judged') && (x.textContent||'').length < 1500); if (!p) p = [...document.querySelectorAll('p,div,li')].find(x => (x.textContent||'').includes('The reverse-cumulative quantile') && (x.textContent||'').length < 900); if (p && p.scrollIntoView) { p.scrollIntoView({ block: 'center' }); return 'scrolled'; } return 'no prose node'; })()"
sleep 1
agent-browser screenshot /home/z/my-project/download/study-batch4-desktop.png

agent-browser set viewport 390 844
sleep 2
agent-browser eval "(() => { let p = [...document.querySelectorAll('p,div,li')].find(x => (x.textContent||'').includes('Eligibility is arithmetic that gets judged') && (x.textContent||'').length < 1500); if (!p) p = [...document.querySelectorAll('p,div,li')].find(x => (x.textContent||'').includes('The reverse-cumulative quantile') && (x.textContent||'').length < 900); if (p && p.scrollIntoView) { p.scrollIntoView({ block: 'center' }); return 'scrolled'; } return 'no prose node'; })()"
sleep 1
agent-browser eval "(() => JSON.stringify({ overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth }))()"
agent-browser screenshot /home/z/my-project/download/study-batch4-mobile.png

echo "SHOTS DONE"
