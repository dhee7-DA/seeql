#!/bin/bash
# Focused repro: drive a loop to the debrief and capture page errors verbatim.
cd /home/z/my-project
LOG=/tmp/ivw-repro.log
: > $LOG

agent-browser close --all >/dev/null 2>&1 || true
agent-browser open "http://localhost:3000/#learn" >>$LOG 2>&1
sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()" >>$LOG 2>&1

agent-browser eval "(() => { const b = [...document.querySelectorAll('button,a')].find(x => /Interview sim/.test(x.textContent||'')); if (b) { b.click(); return 'nav'; } return 'missing'; })()" >>$LOG 2>&1
sleep 1.5

agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Run the Amazon loop/.test(x.getAttribute('aria-label')||'')); if (b) { b.click(); return 'started'; } return 'missing'; })()" >>$LOG 2>&1
sleep 2

# 6 screening picks
for i in 1 2 3 4 5 6; do
  agent-browser eval "(() => { const t = [...document.querySelectorAll('main button')].filter(b => b.querySelector('span.font-mono')); if (t.length) { t[0].click(); return 'picked'; } return 'none'; })()" >>$LOG 2>&1
  sleep 1.4
done

# park 2 coding problems
for i in 1 2; do
  agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Park it/.test(x.textContent||'')); if (b) { b.click(); return 'parked'; } return 'none'; })()" >>$LOG 2>&1
  sleep 1.6
done

# case: send to panel, mark 1, continue
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Send it to the panel/.test(x.textContent||'')); if (b) { b.click(); return 'sent'; } return 'none'; })()" >>$LOG 2>&1
sleep 1.2
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /I had it \\(1\\)/.test(x.textContent||'')); if (b) { b.click(); return 'marked'; } return 'none'; })()" >>$LOG 2>&1
sleep 0.8
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => x.className.includes('primary') && /Theory close/.test(x.textContent||'')); if (b) { b.click(); return 'next'; } return JSON.stringify([...document.querySelectorAll('button')].map(b=>(b.textContent||'').slice(0,20)).slice(0,12)); })()" >>$LOG 2>&1
sleep 1.5

# theory x2: reveal, mark, next
for i in 1 2; do
  agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Reveal model answer/.test(x.textContent||'')); if (b) { b.click(); return 'revealed'; } return 'none'; })()" >>$LOG 2>&1
  sleep 0.8
  agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /Nailed it \\(1\\)/.test(x.textContent||'')); if (b) { b.click(); return 'marked'; } return 'none'; })()" >>$LOG 2>&1
  sleep 0.6
  agent-browser eval "(() => { const bs = [...document.querySelectorAll('button')].filter(x => /Next question|See the debrief/.test(x.textContent||'')); if (bs.length) { bs[bs.length-1].click(); return 'advanced'; } return 'none'; })()" >>$LOG 2>&1
  sleep 1.6
done

echo "=== phase: $(agent-browser eval "(() => JSON.stringify({ wrap: (document.body.innerText.match(/Panel wrap-up/)||[]).length, err: !!([...document.querySelectorAll('h2')].find(h => /Application error/.test(h.textContent||''))), head: (document.querySelector('main')?.innerText||'').slice(0,120) }))()" | tr -d '\\')" | tee -a $LOG

echo "=== ERRORS ===" | tee -a $LOG
agent-browser errors 2>&1 | head -40 | tee -a $LOG
echo "=== CONSOLE ===" | tee -a $LOG
agent-browser console 2>&1 | head -40 | tee -a $LOG
cat $LOG
