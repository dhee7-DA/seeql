#!/bin/bash
# Round-13 E2E — Domains list with FIVE pack cards, Healthcare & Claims detail,
# a solved query problem, an MCQ open.
cd /home/z/my-project

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

echo "== pack list (5 cards expected) =="
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Domain packs/.test(x.textContent||'')); const cards=[...document.querySelectorAll('main button')].filter(x => /Retail & RFM|Finance Core|Fraud & AML|SaaS & Subscriptions|Healthcare & Claims/.test(x.textContent||'')); const zeroChips=[...document.querySelectorAll('main span')].filter(x => /^0\/180$/.test((x.textContent||'').trim())).length; return JSON.stringify({ header: !!h, packCards: cards.length, zeroChips }); })()"
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Domain packs/.test(x.textContent||'')); h && h.scrollIntoView({block:'start'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots/r13-domains-list.png

echo "== open Healthcare & Claims detail =="
agent-browser eval "(() => { const cards=[...document.querySelectorAll('main button')].filter(x => /Healthcare & Claims/.test(x.textContent||'')); if (!cards.length) return 'no card'; cards[0].click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Healthcare & Claims/.test(x.textContent||'')); const chip=[...document.querySelectorAll('main span')].find(x => /^0\/180$/.test((x.textContent||'').trim())); const back=[...document.querySelectorAll('main button')].find(x => /all domains/i.test(x.textContent||'')); const cos=[...document.querySelectorAll('main p')].filter(x => /Meridian Care|Claimsbridge/.test(x.textContent||'')).length; const sections=['Query problems','Knowledge checks','Case studies'].map(s => document.body.innerText.includes(s)); return JSON.stringify({ header: !!h, chip: chip ? chip.textContent.trim() : 'none', backBtn: !!back, fictionalCos: cos, sections }); })()"
agent-browser eval "(() => { const h=[...document.querySelectorAll('h2')].find(x => /Healthcare & Claims/.test(x.textContent||'')); h && h.scrollIntoView({block:'start'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots/r13-domains-hc.png

echo "== open + solve q01 (Paid claim count) =="
agent-browser eval "(() => { const cards=[...document.querySelectorAll('main button')].filter(x => /Paid claim count/.test(x.textContent||'')); if (!cards.length) return 'no card'; cards[0].click(); return 'opened'; })()"
sleep 1
agent-browser eval "(() => { const ta=document.querySelector('main textarea'); if (!ta) return 'no editor'; const setter=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set; setter.call(ta, \"SELECT COUNT(*) AS paid_claims FROM claims WHERE status = 'paid';\"); ta.dispatchEvent(new Event('input',{bubbles:true})); return 'typed'; })()"
sleep 1
agent-browser eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => /run & check/i.test(x.textContent||'')); if (!b) return 'no btn'; b.click(); return 'clicked'; })()"
sleep 4
agent-browser eval "(() => { const v=[...document.querySelectorAll('main span')].find(x => /Correct — your result matches/i.test(x.textContent||'')); const chip=[...document.querySelectorAll('main span')].find(x => /^1\/180$/.test((x.textContent||'').trim())); return JSON.stringify({ verdict: v ? 'PASS' : 'none', chip: chip ? chip.textContent.trim() : 'unchanged' }); })()"
agent-browser screenshot /home/z/my-project/scripts/shots/r13-domains-solved.png

echo "== MCQ: open first Easy knowledge check =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('main button')].find(x => /Knowledge checks/i.test(x.textContent||'')); b && b.scrollIntoView({block:'start'}); return 'ok'; })()" >/dev/null
sleep 1
agent-browser eval "(() => { const cards=[...document.querySelectorAll('main button')].filter(x => /What does this query return\?/.test(x.textContent||'')); if (!cards.length) return 'no mcq'; cards[0].click(); return 'opened'; })()"
sleep 1
agent-browser eval "(() => { const code=[...document.querySelectorAll('main pre')].length; const opts=[...document.querySelectorAll('main button')].filter(x => /^[ABCD]$/.test((x.querySelector('span')||{textContent:''}).textContent||'')).length; return JSON.stringify({ codeBlocks: code, optionBtns: opts }); })()"
agent-browser screenshot /home/z/my-project/scripts/shots/r13-domains-mcq.png

echo "E2E DONE"
agent-browser close --all 2>/dev/null || true
