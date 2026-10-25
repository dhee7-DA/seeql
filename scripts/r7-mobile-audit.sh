#!/bin/bash
# Round-7 mobile audit v2 — 390x844, click the mobile ToolRail (short labels).
cd /home/z/my-project

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 390 844
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()" >/dev/null
sleep 1

ox () { agent-browser eval 'JSON.stringify({ox: document.documentElement.scrollWidth - document.documentElement.clientWidth})'; }

click_tool () {
  agent-browser eval "(() => { const b=[...document.querySelectorAll('button,a')].find(x => (x.textContent||'').trim().startsWith('$1')); if (!b) return 'NOT FOUND: $1'; b.click(); return 'clicked: $1'; })()"
  sleep 2
}

echo "== overview =="; ox

for T in "Readiness" "Pipeline" "Report" "LC" "Sheet"; do
  echo "== $T =="
  click_tool "$T"
  ox
done

echo "== LC: companies tab =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Companies' && x.closest('main')); if (!b) return 'not found'; b.click(); return 'ok'; })()"
sleep 2; ox

echo "== LC: amazon track =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => x.textContent.includes('Amazon') && /\d+\/\d+ SQL/.test(x.textContent)); if (!b) return 'not found'; b.click(); return 'ok'; })()"
sleep 2; ox

echo "== LC: timed sql =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => x.textContent.includes('Timed SQL')); if (!b) return 'not found'; b.click(); return 'ok'; })()"
sleep 2; ox

echo "== LC: boss detail =="
agent-browser eval "(() => { const t=[...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Problems' && x.closest('main')); if (t) t.click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => x.textContent.includes('Peak Concurrent Attendance')); if (!b) return 'not found'; b.click(); return 'ok'; })()"
sleep 3; ox
agent-browser screenshot /home/z/my-project/scripts/shots/r7-mobile-boss.png

echo "== report sheet shot =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button,a')].find(x => (x.textContent||'').trim().startsWith('Report')); if (b) b.click(); return 'ok'; })()"
sleep 2
agent-browser screenshot /home/z/my-project/scripts/shots/r7-mobile-report.png

echo "AUDIT DONE"
agent-browser close --all 2>/dev/null || true
