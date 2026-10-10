#!/bin/bash
# Task 82 E2E — single-call server boot + browser checks for batch-2 study guides
cd /home/z/my-project

# 1) Boot dev server
rm -f /tmp/dev82.log
(setsid nohup bun run dev > /tmp/dev82.log 2>&1 &)
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

# 5) Count study toggles across the view (was 25; +10 = 35)
agent-browser eval "(() => JSON.stringify({ studyToggles: [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')).length }))()"

# 6) Open platform-classics toggle (index 13) and assert prose
agent-browser eval "(() => { const tgl = [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')); if (tgl.length < 14) return 'toggle count ' + tgl.length; tgl[13].click(); return 'clicked 13'; })()"
sleep 2
agent-browser eval "(() => { const t = document.body.innerText; return JSON.stringify({ 'pc intro': t.includes('This section collects the famous non-LeetCode staples'), 'median para': t.includes('Order statistics and stacked grains'), 'dual-slot': t.includes('dual-slot trick'), 'path fan-out': t.includes('The fan-out audit') }); })()"

# 7) Open streaks toggle (index 19) and assert prose
agent-browser eval "(() => { const tgl = [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')); tgl[19].click(); return 'clicked 19'; })()"
sleep 2
agent-browser eval "(() => { const t = document.body.innerText; return JSON.stringify({ 'streaks intro': t.includes('Streak and gap questions share one truth'), 'LEAD para': t.includes('LEAD manufactures pairs'), 'rank-vs-dense': t.includes('the RANK-vs-DENSE_RANK choice IS the problem'), 'path fuse': t.includes('Fuse streams that disagree on date grain') }); })()"

# 8) Desktop screenshot
agent-browser screenshot /home/z/my-project/download/study-batch2-desktop.png

# 9) Mobile 390x844 overflow check
agent-browser set viewport 390 844
sleep 2
agent-browser eval "(() => JSON.stringify({ overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, w: document.documentElement.clientWidth }))()"
agent-browser screenshot /home/z/my-project/download/study-batch2-mobile.png

echo "E2E TASK82 DONE"
