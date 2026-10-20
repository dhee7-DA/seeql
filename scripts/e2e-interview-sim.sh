#!/bin/bash
# Interview sim E2E — boot-safe (server expected up): sidebar → Interview sim →
# intro asserts → Amazon loop → 6 screening answers → park both coding problems →
# case reveal + self-mark → 2 theory reveals + marks → debrief asserts →
# lobby history row → mobile overflow check.
cd /home/z/my-project

agent-browser close --all 2>/dev/null || true
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()"

# 1) Open the Interview sim from the sidebar
SIM_REF=$(agent-browser snapshot 2>/dev/null | grep -o 'Interview sim[^"]*" \[ref=e[0-9]*' | grep -o 'e[0-9]*$' | head -1)
echo "sim tool @$SIM_REF"
agent-browser click "@$SIM_REF" 2>&1 | head -1
sleep 2
echo "intro: $(agent-browser eval "(() => JSON.stringify({ h1: !!([...document.querySelectorAll('h1')].find(h => /Interview sim/.test(h.textContent||''))), stages: ['Screening','Live coding','Case round','Theory close'].every(s => (document.body.innerText||'').includes(s)), picker: !!([...document.querySelectorAll('input')].find(i => /Name the company/.test(i.placeholder||''))), loopDay: (document.body.innerText.match(/Loop day/)||[]).length }))()" | tr -d '\\')"
agent-browser screenshot scripts/shots/ivw-intro.png 2>/dev/null | head -1

# 2) Start the Amazon loop
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Run the Amazon loop/.test(x.getAttribute('aria-label')||'')); if (b) { b.click(); return 'started'; } return 'missing'; })()"
sleep 2
echo "run: $(agent-browser eval "(() => JSON.stringify({ screening: (document.body.innerText.match(/Screening/)||[]).length, clock: (document.body.innerText.match(/\\d:\\d\\d/)||[]).length > 0, q: (document.body.innerText.match(/question 1 of 6/)||[]).length }))()" | tr -d '\\')"
agent-browser screenshot scripts/shots/ivw-run-screen.png 2>/dev/null | head -1

# 3) Answer all 6 screening questions — click the first choice each time
for i in 1 2 3 4 5 6; do
  agent-browser eval "(() => { const btns = [...document.querySelectorAll('button')].filter(b => /^([A-F])\\\\s/.test((b.textContent||'').trim()) && b.closest('.sheen') === null); const t = [...document.querySelectorAll('main button, main div button')].filter(b => b.querySelector('span.font-mono')); if (t.length) { t[0].click(); return 'picked'; } return 'none'; })()" >/dev/null
  sleep 1.6
done
echo "after screen: $(agent-browser eval "(() => JSON.stringify({ coding: (document.body.innerText.match(/Live coding/)||[]).length, problem: (document.body.innerText.match(/problem 1 of 2/)||[]).length, park: !!([...document.querySelectorAll('button')].find(b => /Park it/.test(b.textContent||''))) }))()" | tr -d '\\')"
agent-browser screenshot scripts/shots/ivw-run-coding.png 2>/dev/null | head -1

# 4) Park both coding problems
for i in 1 2; do
  agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Park it/.test(x.textContent||'')); if (b) { b.click(); return 'parked'; } return 'none'; })()" >/dev/null
  sleep 1.8
done
echo "case: $(agent-browser eval "(() => JSON.stringify({ caseStage: (document.body.innerText.match(/Case round/)||[]).length, memo: (document.body.innerText.match(/memo/)||[]).length }))()" | tr -d '\\')"

# 5) Send to the panel, self-mark 1, continue
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Send it to the panel/.test(x.textContent||'')); if (b) { b.click(); return 'sent'; } return 'none'; })()"
sleep 1.5
echo "case reveal: $(agent-browser eval "(() => JSON.stringify({ walkthrough: (document.body.innerText.match(/panel.s walkthrough/)||[]).length > 0, query: (document.body.innerText.match(/query they wanted/)||[]).length > 0 }))()" | tr -d '\\')"
agent-browser screenshot scripts/shots/ivw-run-case.png 2>/dev/null | head -1
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /I had it \\(1\\)/.test(x.textContent||'')); if (b) { b.click(); return 'marked'; } return 'none'; })()"
sleep 1
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Theory close/.test(x.textContent||'') && /ml-auto|primary/.test(x.className||'')); if (b) { b.click(); return 'next'; } return 'none'; })()"
sleep 1.5

# 6) Theory close: reveal + mark both questions
for i in 1 2; do
  agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Reveal model answer/.test(x.textContent||'')); if (b) { b.click(); return 'revealed'; } return 'none'; })()"
  sleep 1
  agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Nailed it \\(1\\)/.test(x.textContent||'')); if (b) { b.click(); return 'marked'; } return 'none'; })()"
  sleep 0.8
  agent-browser eval "(() => { const bs = [...document.querySelectorAll('button')].filter(x => /Next question|See the debrief/.test(x.textContent||'')); if (bs.length) { bs[bs.length-1].click(); return 'next'; } return 'none'; })()"
  sleep 1.5
done

# 7) Debrief asserts
echo "debrief: $(agent-browser eval "(() => JSON.stringify({ wrap: (document.body.innerText.match(/Panel wrap-up/)||[]).length > 0, stages: (document.body.innerText.match(/Stage by stage/)||[]).length > 0, refs: (document.body.innerText.match(/reference solutions/)||[]).length > 0, leaks: (document.body.innerText.match(/ones that leaked/)||[]).length > 0 }))()" | tr -d '\\')"
agent-browser screenshot scripts/shots/ivw-debrief.png 2>/dev/null | head -1

# 8) Back to the lobby — history row present
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Back to the lobby/.test(x.textContent||'')); if (b) { b.click(); return 'lobby'; } return 'none'; })()"
sleep 1.5
echo "lobby: $(agent-browser eval "(() => JSON.stringify({ history: (document.body.innerText.match(/Recent debriefs/)||[]).length > 0, loopLabel: (document.body.innerText.match(/Amazon loop/)||[]).length > 0 }))()" | tr -d '\\')"

# 9) Mobile overflow check on the run screen
agent-browser set-viewport 390 844 2>/dev/null || true
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Run the Amazon loop/.test(x.getAttribute('aria-label')||'')); if (b) b.click(); return 'ok'; })()" >/dev/null
sleep 2
echo "mobile overflow px: $(agent-browser eval "(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)()" | tr -d '\\')"
agent-browser screenshot scripts/shots/ivw-mobile.png 2>/dev/null | head -1

agent-browser close --all 2>/dev/null || true
echo "E2E done"
