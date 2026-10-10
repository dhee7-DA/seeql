#!/bin/bash
# Task 83 screenshot pass — frame the opened Premium Warmups study panel
cd /home/z/my-project

rm -f /tmp/dev83.log
(setsid nohup bun run dev > /tmp/dev83.log 2>&1 &)
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

SEC_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Premium Warmups[^"]*" \[[^]]*ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
if [ -n "$SEC_REF" ]; then
  agent-browser click "@$SEC_REF" >/dev/null 2>&1
  sleep 3
fi

# open the Premium Warmups study toggle (first after header, document order)
agent-browser eval "(() => { const tgl = [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')); const hs = [...document.querySelectorAll('h1,h2,h3,h4')].filter(x => (x.textContent||'').includes('Premium Warmups')); if (!hs.length) return 'no header'; const idx = tgl.findIndex(b => hs[0].compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); if (idx < 0) return 'no toggle'; tgl[idx].click(); return 'opened @' + idx; })()"
sleep 2

# scroll the study intro prose into view
agent-browser eval "(() => { const p = [...document.querySelectorAll('p,div,li')].find(x => (x.textContent||'').includes('Rates open the premium tier') && (x.textContent||'').length < 600); if (p && p.scrollIntoView) { p.scrollIntoView({ block: 'center' }); return 'scrolled'; } return 'no prose node'; })()"
sleep 1
agent-browser screenshot /home/z/my-project/download/study-batch3-desktop.png

agent-browser set viewport 390 844
sleep 2
agent-browser eval "(() => { const p = [...document.querySelectorAll('p,div,li')].find(x => (x.textContent||'').includes('Rates open the premium tier') && (x.textContent||'').length < 600); if (p && p.scrollIntoView) { p.scrollIntoView({ block: 'center' }); return 'scrolled'; } return 'no prose node'; })()"
sleep 1
agent-browser eval "(() => JSON.stringify({ overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth }))()"
agent-browser screenshot /home/z/my-project/download/study-batch3-mobile.png

echo "SHOTS DONE"
