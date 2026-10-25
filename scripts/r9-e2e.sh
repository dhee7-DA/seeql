#!/bin/bash
# Round-9 E2E — Domains tab: pack page, bands, a solved query problem, an MCQ pick.
cd /home/z/my-project

# fresh server (dev build may be stale in memory after the rebuild)
pkill -f "standalone/server.js" 2>/dev/null
sleep 1
setsid nohup bun run dev > /dev/null 2>&1 < /dev/null &
for i in $(seq 1 30); do
  sleep 1
  curl -s -o /dev/null --max-time 2 http://localhost:3000/ && break
done
curl -s -o /dev/null -w "root:%{http_code}\n" http://localhost:3000/ || exit 1

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()" >/dev/null
sleep 1

echo "== open LC board → Domains tab =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x => (x.textContent||'').includes('LeetCode Big Board')); if (!b) return 'no sidebar'; b.click(); return 'ok'; })()"
sleep 3
agent-browser eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => /^domains/i.test((x.textContent||'').trim())); if (!b) return 'no pill'; b.click(); return 'ok'; })()"
sleep 2

echo "== pack header =="
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Retail & RFM/.test(x.textContent||'')); const chip=[...document.querySelectorAll('main span')].find(x => /^0\/180$/.test((x.textContent||'').trim())); const cos=[...document.querySelectorAll('main p')].filter(x => /Northwind Goods|Kartly/.test(x.textContent||'')).length; return JSON.stringify({ header: !!h, chip: chip ? chip.textContent.trim() : 'none', fictionalCos: cos }); })()"

echo "== three sections + band pills =="
agent-browser eval "(() => { const t=document.body.innerText; const secs=['Query problems','Knowledge checks','Case studies'].map(s => t.includes(s)); const pills=[...document.querySelectorAll('main button')].filter(x => /^(warm-up|core screens|the wall) · \d+$/.test((x.textContent||'').trim())).length; return JSON.stringify({ sections: secs, bandPills: pills }); })()"
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Retail & RFM/.test(x.textContent||'')); h && h.scrollIntoView({block:'start'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots/r9-domains-pack.png

echo "== open + solve query problem q01 =="
agent-browser eval "(() => { const cards=[...document.querySelectorAll('main button')].filter(x => /Delivered order count/.test(x.textContent||'')); if (!cards.length) return 'no card'; cards[0].click(); return 'opened'; })()"
sleep 1
agent-browser eval "(() => { const ta=document.querySelector('main textarea'); if (!ta) return 'no editor'; const setter=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set; setter.call(ta, \"SELECT COUNT(*) AS delivered_orders FROM orders WHERE status = 'delivered';\"); ta.dispatchEvent(new Event('input',{bubbles:true})); return 'typed'; })()"
sleep 1
agent-browser eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => /run & check/i.test(x.textContent||'')); if (!b) return 'no btn'; b.click(); return 'clicked'; })()"
sleep 4
agent-browser eval "(() => { const v=[...document.querySelectorAll('main span')].find(x => /Correct — your result matches/i.test(x.textContent||'')); const chip=[...document.querySelectorAll('main span')].find(x => /^1\/180$/.test((x.textContent||'').trim())); return JSON.stringify({ verdict: v ? 'PASS' : 'none', chip: chip ? chip.textContent.trim() : 'unchanged' }); })()"

echo "== MCQ: open first Easy knowledge check and pick =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => /Knowledge checks/i.test(x.textContent||'')); b && b.scrollIntoView({block:'start'}); return 'ok'; })()" >/dev/null
agent-browser eval "(() => { const cards=[...document.querySelectorAll('main button')].filter(x => /What does this query return\?/.test(x.textContent||'')); if (!cards.length) return 'no mcq'; cards[0].click(); return 'opened'; })()"
sleep 1
agent-browser eval "(() => { const code=[...document.querySelectorAll('main pre')].length; const opts=[...document.querySelectorAll('main button')].filter(x => /^[ABCD]$/.test((x.querySelector('span')||{}).textContent||'')).length; return JSON.stringify({ codeBlocks: code, optionBtns: opts }); })()"
agent-browser eval "(() => { const opts=[...document.querySelectorAll('main button')].filter(x => /^[ABCD]$/.test((x.querySelector('span')||{textContent:''}).textContent||'')); if (!opts.length) return 'no opts'; opts[0].click(); return 'picked A'; })()"
sleep 2
agent-browser eval "(() => { const ok=[...document.querySelectorAll('main p')].filter(x => /NTILE|delivered|Audio|Baskets|discount/i.test(x.textContent||'')).length; const marked=[...document.querySelectorAll('main button')].filter(x => x.className.includes('emerald')).length; return JSON.stringify({ explainShown: ok > 0, highlighted: marked }); })()"
agent-browser screenshot /home/z/my-project/scripts/shots/r9-domains-mcq.png

echo "E2E DONE"
agent-browser close --all 2>/dev/null || true
