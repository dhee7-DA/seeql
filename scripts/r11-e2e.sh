#!/bin/bash
# Round-11 E2E — Domains list with THREE pack cards, Fraud & AML detail,
# a solved query problem, an MCQ open. Also dm-sql API smoke for all packs.
cd /home/z/my-project

pkill -f "standalone/server.js" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 1
setsid nohup bun run dev > /tmp/r11-dev.log 2>&1 < /dev/null &
for i in $(seq 1 40); do
  sleep 1
  curl -s -o /dev/null --max-time 2 http://localhost:3000/ && break
done
curl -s -o /dev/null -w "root:%{http_code}\n" http://localhost:3000/ || exit 1

echo "== API smoke: all three packs =="
curl -s -X POST http://localhost:3000/api/dm-sql -H "Content-Type: application/json" \
  -d '{"pack":"fraud-aml","sql":"SELECT COUNT(*) AS settled_p2p FROM p2p WHERE status = '"'"'settled'"'"';"}' \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print('fraud-aml rows:', d['rows'])"
curl -s -X POST http://localhost:3000/api/dm-sql -H "Content-Type: application/json" \
  -d '{"pack":"finance-core","sql":"SELECT COUNT(*) AS posted_txns FROM transactions WHERE status = '"'"'posted'"'"';"}' \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print('finance-core rows:', d['rows'])"
curl -s -X POST http://localhost:3000/api/dm-sql -H "Content-Type: application/json" \
  -d '{"pack":"retail-rfm","sql":"SELECT COUNT(*) AS delivered_orders FROM orders WHERE status = '"'"'delivered'"'"';"}' \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print('retail-rfm rows:', d['rows'])"

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()" >/dev/null
sleep 1

echo "== open LC board -> Domains tab =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => (x.textContent||'').includes('LeetCode Big Board')); if (!b) return 'no sidebar'; b.click(); return 'ok'; })()"
sleep 3
agent-browser eval "(() => { const pills=[...document.querySelectorAll('main button')].filter(x => /^domains/i.test((x.textContent||'').trim())); const b=pills[pills.length-1]; if (!b) return 'no pill'; b.click(); return 'ok'; })()"
sleep 2

echo "== pack list (3 cards expected) =="
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Domain packs/.test(x.textContent||'')); const cards=[...document.querySelectorAll('main button')].filter(x => /Retail & RFM|Finance Core|Fraud & AML/.test(x.textContent||'')); const zeroChips=[...document.querySelectorAll('main span')].filter(x => /^0\/180$/.test((x.textContent||'').trim())).length; return JSON.stringify({ header: !!h, packCards: cards.length, zeroChips }); })()"
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Domain packs/.test(x.textContent||'')); h && h.scrollIntoView({block:'start'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots/r11-domains-list.png

echo "== open Fraud & AML detail =="
agent-browser eval "(() => { const cards=[...document.querySelectorAll('main button')].filter(x => /Fraud & AML/.test(x.textContent||'')); if (!cards.length) return 'no card'; cards[0].click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Fraud & AML/.test(x.textContent||'')); const chip=[...document.querySelectorAll('main span')].find(x => /^0\/180$/.test((x.textContent||'').trim())); const back=[...document.querySelectorAll('main button')].find(x => /all domains/i.test(x.textContent||'')); const cos=[...document.querySelectorAll('main p')].filter(x => /Aegis Risk|Velttrum Pay/.test(x.textContent||'')).length; const sections=['Query problems','Knowledge checks','Case studies'].map(s => document.body.innerText.includes(s)); return JSON.stringify({ header: !!h, chip: chip ? chip.textContent.trim() : 'none', backBtn: !!back, fictionalCos: cos, sections }); })()"
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Fraud & AML/.test(x.textContent||'')); h && h.scrollIntoView({block:'start'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots/r11-domains-fraud.png

echo "== open + solve q01 (Settled transfer count) =="
agent-browser eval "(() => { const cards=[...document.querySelectorAll('main button')].filter(x => /Settled transfer count/.test(x.textContent||'')); if (!cards.length) return 'no card'; cards[0].click(); return 'opened'; })()"
sleep 1
agent-browser eval "(() => { const ta=document.querySelector('main textarea'); if (!ta) return 'no editor'; const setter=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set; setter.call(ta, \"SELECT COUNT(*) AS settled_p2p FROM p2p WHERE status = 'settled';\"); ta.dispatchEvent(new Event('input',{bubbles:true})); return 'typed'; })()"
sleep 1
agent-browser eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => /run & check/i.test(x.textContent||'')); if (!b) return 'no btn'; b.click(); return 'clicked'; })()"
sleep 4
agent-browser eval "(() => { const v=[...document.querySelectorAll('main span')].find(x => /Correct — your result matches/i.test(x.textContent||'')); const chip=[...document.querySelectorAll('main span')].find(x => /^1\/180$/.test((x.textContent||'').trim())); return JSON.stringify({ verdict: v ? 'PASS' : 'none', chip: chip ? chip.textContent.trim() : 'unchanged' }); })()"
agent-browser screenshot /home/z/my-project/scripts/shots/r11-domains-solved.png

echo "== MCQ: open first Easy knowledge check =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => /Knowledge checks/i.test(x.textContent||'')); b && b.scrollIntoView({block:'start'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser eval "(() => { const cards=[...document.querySelectorAll('main button')].filter(x => /What does this query return\?/.test(x.textContent||'')); if (!cards.length) return 'no mcq'; cards[0].click(); return 'opened'; })()"
sleep 1
agent-browser eval "(() => { const code=[...document.querySelectorAll('main pre')].length; const opts=[...document.querySelectorAll('main button')].filter(x => /^[ABCD]$/.test((x.querySelector('span')||{textContent:''}).textContent||'')).length; return JSON.stringify({ codeBlocks: code, optionBtns: opts }); })()"
agent-browser screenshot /home/z/my-project/scripts/shots/r11-domains-mcq.png

echo "E2E DONE"
agent-browser close --all 2>/dev/null || true
