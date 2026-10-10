#!/bin/bash
# Task 81 E2E v2 — single-call server boot + real-click flow via snapshot refs
cd /home/z/my-project

# 1) Boot dev server
rm -f /tmp/dev81.log
(setsid nohup bun run dev > /tmp/dev81.log 2>&1 &)
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

# 4) Real-click the Module 12 card via snapshot ref
CARD_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'LeetCode SQL 50+ MODULE 12[^"]*" \[expanded=false, ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
if [ -z "$CARD_REF" ]; then
  # card may already be expanded — look for the section list instead
  echo "card already expanded or not found; probing DOM"
else
  echo "clicking module card ref @$CARD_REF"
  agent-browser click "@$CARD_REF" 2>&1 | head -2
fi
sleep 3

# 5) Probe: are the sections visible now? Dump course-map area buttons near SQL 50+
agent-browser eval "(() => { const t = document.body.innerText; const has = { agg: t.includes('Aggregation & Reporting'), win2: t.includes('Window Functions II'), joins: t.includes('Joins & Relationships') }; const btns = [...document.querySelectorAll('button')].filter(b => /Aggregation & Reporting|Window Functions II|Joins & Relationships/.test(b.textContent||'')).length; return JSON.stringify({ has, matchingButtons: btns }); })()"

# 6) Dump all buttons containing 'Reporting' or section-ish text for diagnosis
agent-browser eval "(() => { const btns = [...document.querySelectorAll('button,a')].filter(b => /Reporting|Window Functions|Relationships|Non-Equi|Pivots|Dates & Times/.test(b.textContent||'')); return JSON.stringify(btns.slice(0,8).map(b => ({ tag: b.tagName, text: (b.textContent||'').trim().slice(0,60) }))); })()"

echo "--- phase 2 ---"

# 7) Try to click the Aggregation & Reporting entry (real click via ref)
SEC_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Aggregation & Reporting[^"]*"\[ref=e[0-9]*\|Aggregation & Reporting[^"]*" \[[^]]*ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
echo "section ref: ${SEC_REF:-none}"
if [ -n "$SEC_REF" ]; then
  agent-browser click "@$SEC_REF" 2>&1 | head -2
  sleep 3
fi

# 8) Assert study prose after section click
agent-browser eval "(() => { const t = document.body.innerText; return JSON.stringify({ 'extra-agg intro': t.includes('Reporting is aggregation with an audience'), 'argmax para': t.includes('The argmax family deserves its own habit'), 'path why': t.includes('tie-proof argmax'), studyToggles: [...document.querySelectorAll('button')].filter(b => /study guide/i.test(b.textContent||'')).length }); })()"

echo "E2E PHASE-2 DONE"
