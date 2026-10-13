#!/bin/bash
# Company Universe E2E — single-call server boot + browser click-through:
# sidebar → Company screens → domain → Amazon kit → all 6 tabs → problem deep-link into LC → mobile overflow.
cd /home/z/my-project

# 1) Boot dev server
rm -f scripts/dev-co.log
(setsid nohup bun run dev > scripts/dev-co.log 2>&1 &)
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

# 4) Open the Company screens tool from the sidebar (desktop) or rail (mobile chip)
CO_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Company screens[^"]*" \[ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
echo "companies tool @$CO_REF"
agent-browser click "@$CO_REF" 2>&1 | head -1
sleep 2
agent-browser eval "(() => JSON.stringify({ domainCards: [...document.querySelectorAll('button')].filter(b => /kits$/.test((b.textContent||'').trim()) && /E-commerce/.test(b.textContent||'')).length, header: !!([...document.querySelectorAll('h2')].find(h => /Company Interview Universe/.test(h.textContent||''))) }))()" | tr -d '\\'

# 5) Open the E-commerce domain card
EC_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'E-commerce[^"]*" \[ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
echo "ecommerce domain @$EC_REF"
agent-browser click "@$EC_REF" 2>&1 | head -1
sleep 2
agent-browser eval "(() => JSON.stringify({ companyCards: [...document.querySelectorAll('button')].filter(b => /in build|full kit/.test(b.textContent||'')).map(b => (b.textContent||'').slice(0,24)) }))()" | tr -d '\\'

# 6) Open the Amazon kit
AMZ_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Amazon[^"]*" \[ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
echo "amazon card @$AMZ_REF"
agent-browser click "@$AMZ_REF" 2>&1 | head -1
sleep 2

# 7) Walk all six tabs and verify each renders real kit content
for T in "The brief" "Master plan" "Theory" "MCQs" "Case studies" "Problems"; do
  TAB_REF=$(agent-browser snapshot 2>/dev/null | grep -o "$T[^\"]*\" \[ref=e[0-9]*" | grep -o 'e[0-9]*$' | head -1)
  agent-browser click "@$TAB_REF" >/dev/null 2>&1
  sleep 1.5
  echo "tab [$T]: $(agent-browser eval "(() => JSON.stringify({ text: (document.querySelector('main')?.innerText||'').length }))()" | tr -d '\\')"
  if [ "$T" = "The brief" ]; then
    echo "brief spot-check: $(agent-browser eval "(() => JSON.stringify({ brief: (document.body.innerText.match(/decentralized/)||[]).length, dayInLife: (document.body.innerText.match(/stakeholder work/)||[]).length, kpi: (document.body.innerText.match(/GMV/)||[]).length }))()" | tr -d '\\')"
  fi
done

# 9) Deep-link: Master plan → first practice chip opens the LC dive
PLAN_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Master plan[^"]*" \[ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
agent-browser click "@$PLAN_REF" >/dev/null 2>&1
sleep 1.5
CHIP_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Combine Two Tables[^"]*" \[ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
echo "practice chip @$CHIP_REF"
# DOM-level click (a sticky header rect can cover the chip's raw click point)
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Combine Two Tables/.test(x.textContent||'')); if (b) { b.click(); return 'clicked'; } return 'missing'; })()"
sleep 2.5
agent-browser eval "(() => JSON.stringify({ lcOpen: (document.body.innerText.match(/Combine Two Tables/)||[]).length > 0, dive: (document.body.innerText.match(/breakdown|approach|Optimal/i)||[]).length }))()" | tr -d '\\'

# 10) Mobile viewport overflow check
agent-browser set-viewport 390 844 2>/dev/null || agent-browser eval "window.resizeTo(390,844)" >/dev/null
sleep 1
agent-browser eval "(() => JSON.stringify({ overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth }))()" | tr -d '\\'
agent-browser close --all 2>/dev/null || true
echo "E2E done"
