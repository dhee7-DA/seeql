#!/bin/bash
# Company Universe screenshots — universe wall + Amazon kit (brief + master plan)
cd /home/z/my-project
agent-browser close --all 2>/dev/null || true
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()" >/dev/null
CO_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Company screens[^"]*" \[ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
agent-browser click "@$CO_REF" >/dev/null 2>&1; sleep 2
agent-browser screenshot /home/z/my-project/download/companies-universe.png >/dev/null 2>&1
EC_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'E-commerce[^"]*" \[ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
agent-browser click "@$EC_REF" >/dev/null 2>&1; sleep 2
AMZ_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Amazon[^"]*" \[ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
agent-browser click "@$AMZ_REF" >/dev/null 2>&1; sleep 2
agent-browser screenshot /home/z/my-project/download/companies-amazon-brief.png >/dev/null 2>&1
# frame the brief prose (capped-containment scroll probe)
agent-browser eval "(() => { const el = [...document.querySelectorAll('main p,main div,main li')].find(x => (x.textContent||'').includes('decentralized') && x.textContent.length < 1500); if (el) el.scrollIntoView({block:'center'}); return el ? 'framed' : 'miss'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/download/companies-amazon-brief.png >/dev/null 2>&1
PLAN_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Master plan[^"]*" \[ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
agent-browser click "@$PLAN_REF" >/dev/null 2>&1; sleep 1.5
agent-browser eval "(() => { const el = [...document.querySelectorAll('main p,main div,main li')].find(x => (x.textContent||'').includes('grain check') && x.textContent.length < 1500); if (el) el.scrollIntoView({block:'center'}); return el ? 'framed' : 'miss'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/download/companies-amazon-plan.png >/dev/null 2>&1
agent-browser close --all 2>/dev/null || true
echo "shots done"
