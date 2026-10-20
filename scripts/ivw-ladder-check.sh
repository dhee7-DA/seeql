#!/bin/bash
# Ladder integration check: mini loop in the live session, then read the ladder tab.
cd /home/z/my-project
E="agent-browser eval"

# quick loop: 6 picks (first choice)
for i in 1 2 3 4 5 6; do
  $E "(() => { const t = [...document.querySelectorAll('main button')].filter(b => b.querySelector('span.font-mono')); if (t.length) { t[0].click(); return 'p'; } return 'x'; })()" >/dev/null
  sleep 1.3
done
# park 2
for i in 1 2; do
  $E "(() => { const b = [...document.querySelectorAll('button')].find(x => /Park it/.test(x.textContent||'')); if (b) { b.click(); return 'k'; } return 'x'; })()" >/dev/null
  sleep 1.5
done
# case: reveal + mark 0 + continue
$E "(() => { const b = [...document.querySelectorAll('button')].find(x => /Send it to the panel/.test(x.textContent||'')); if (b) b.click(); return 's'; })()" >/dev/null
sleep 1.2
$E "(() => { const b = [...document.querySelectorAll('button')].find(x => /Missed it \\(0\\)/.test(x.textContent||'')); if (b) b.click(); return 'm'; })()" >/dev/null
sleep 0.8
$E "(() => { const b = [...document.querySelectorAll('button')].find(x => x.className.includes('primary') && /Theory close/.test(x.textContent||'')); if (b) b.click(); return 'n'; })()" >/dev/null
sleep 1.5
# theory x2: reveal + missed + next
for i in 1 2; do
  $E "(() => { const b = [...document.querySelectorAll('button')].find(x => /Reveal model answer/.test(x.textContent||'')); if (b) b.click(); return 'r'; })()" >/dev/null
  sleep 0.8
  $E "(() => { const b = [...document.querySelectorAll('button')].find(x => /Missed it \\(0\\)/.test(x.textContent||'')); if (b) b.click(); return 'm'; })()" >/dev/null
  sleep 0.6
  $E "(() => { const bs = [...document.querySelectorAll('button')].filter(x => /Next question|See the debrief/.test(x.textContent||'')); if (bs.length) { bs[bs.length-1].click(); return 'a'; } return 'x'; })()" >/dev/null
  sleep 1.5
done

echo "debrief: $($E "(() => (document.body.innerText.match(/Panel wrap-up/)||['-'])[0])()" | tr -d '\\')"
# back to lobby, then review deck → ladder
$E "(() => { const b = [...document.querySelectorAll('button')].find(x => /Back to the lobby/.test(x.textContent||'')); if (b) b.click(); return 'l'; })()" >/dev/null
sleep 1.5
$E "(() => { const b = [...document.querySelectorAll('button,a')].find(x => /Review deck/.test(x.textContent||'')); if (b) b.click(); return 'r'; })()" >/dev/null
sleep 2
$E "(() => { const b = [...document.querySelectorAll('button')].find(x => /Scheduled \(ladder\)/.test(x.textContent||'')); if (b) b.click(); return 't'; })()" >/dev/null
sleep 1.5
$E "(() => JSON.stringify({ stats: (document.querySelector('main')?.innerText||'').slice(0, 340) }))()" | tr -d '\\'
echo
# the persisted ledger keys
$E "(() => JSON.stringify({ ladder: Object.keys(JSON.parse(localStorage.getItem('seeql.progress-v1')||localStorage.getItem('seeql-learn-v1')||'{}').state?.reviewSchedule || {}).filter(k => /^(ulc|umcq|uthr)/.test(k)).slice(0, 8) }))()" | tr -d '\\'
echo
$E "(() => { const keys = Object.keys(localStorage); return JSON.stringify(keys.filter(k => /seeql|universe|progress/i.test(k))); })()" | tr -d '\\'
echo
