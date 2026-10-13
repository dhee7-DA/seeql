#!/bin/bash
# Locate "Company screens" in the sidebar — boot, open, screenshot the rail + verify the view opens.
cd /home/z/my-project

rm -f scripts/dev-where.log
(setsid nohup bun run dev > scripts/dev-where.log 2>&1 &)
for i in $(seq 1 90); do
  sleep 1
  curl -s -o /dev/null http://localhost:3000 && break
done
echo "server: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)"

agent-browser close --all 2>/dev/null || true
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()" >/dev/null
sleep 1

# 1) Where does the tool sit in the sidebar? Dump the lab rows in DOM order with their index chips.
agent-browser eval "(() => { const lab = document.querySelector('[data-tour=\\\"lab\\\"]'); if (!lab) return 'no lab rail'; const rows = [...lab.querySelectorAll('button')].map(b => (b.textContent||'').replace(/\\s+/g,' ').trim()); return JSON.stringify(rows); })()" | tr -d '\\'
echo ""

# 2) Screenshot the sidebar region (desktop) framing Toolbox + Practice lab
agent-browser eval "(() => { const lab = document.querySelector('[data-tour=\\\"lab\\\"]'); if (lab) { const r = lab.getBoundingClientRect(); window.scrollTo(0,0); lab.scrollIntoView({block:'center'}); } return 'scrolled'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/download/where-company-screens-sidebar.png
echo "shot: sidebar"

# 3) Open the tool and confirm the Universe view renders
CO_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Company screens[^"]*" \[ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
echo "companies tool @$CO_REF"
agent-browser click "@$CO_REF" 2>&1 | head -1
sleep 2
agent-browser eval "(() => JSON.stringify({ header: !!([...document.querySelectorAll('h1,h2')].find(h => /Company Interview Universe/.test(h.textContent||''))), domainCards: [...document.querySelectorAll('button')].filter(b => /kits in build|live kit|full kit/.test(b.textContent||'') || /kits$/.test((b.textContent||'').trim())).length }))()" | tr -d '\\'
echo ""
agent-browser screenshot /home/z/my-project/download/where-company-screens-view.png
echo "shot: view"
