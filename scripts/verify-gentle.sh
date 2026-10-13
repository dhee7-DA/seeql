#!/bin/bash
# Gentle single-flow check: wall stat, fintech domain DOM census (8 cards),
# open Wise via startsWith, six tabs, mobile overflow. Long sleeps, no spam.
cd /home/z/my-project
agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 8
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return 'skipped'; })()"
sleep 3
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /company screens/i.test(x.textContent||'')); if (b) { b.click(); return 'company-screens'; } return 'missing'; })()"
sleep 4
WALL=$(agent-browser eval "(() => { const t = document.querySelector('main')?.innerText||''; const kits = t.match(/(\d+) full kits/); const comps = t.match(/(\d+) companies/); return (kits?kits[1]+' full kits':'?') + ' / ' + (comps?comps[1]+' companies':'?'); })()" | tr -d '"\\')
echo "WALL: $WALL"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /fintech/i.test(x.textContent||'')); if (b) { b.click(); return 'fintech'; } return 'missing'; })()"
sleep 4
agent-browser eval "(() => { const names = ['Stripe','PayPal','Visa','Revolut','Block (Square)','Adyen','Wise','Robinhood']; const txt = [...document.querySelectorAll('main button')].map(b => (b.textContent||'').trim()); const hit = names.filter(n => txt.some(t => t.split('\n')[0] === n)); return 'CARDS ' + hit.length + '/8: ' + hit.join('|'); })()" | tr -d '"\\'
agent-browser eval "(() => { const b = [...document.querySelectorAll('main button')].find(x => (x.textContent||'').trim().startsWith('Wise')); if (b) { b.click(); return 'wise-open'; } return 'missing'; })()"
sleep 4
agent-browser eval "(() => { const h = document.querySelector('main h2')?.textContent||''; const tabs = [...document.querySelectorAll('[role=tablist] button')].map(b => (b.textContent||'').trim()); return 'KIT ' + h + ' tabs=' + tabs.length + ' [' + tabs.join(',') + ']'; })()" | tr -d '"\\'
agent-browser eval "(() => { const tabs=[...document.querySelectorAll('[role=tablist] button')]; const t=tabs.find(x=>/brief/i.test(x.textContent||'')); if(t) t.click(); return 'ok'; })()" >/dev/null
sleep 2
agent-browser eval "(() => { const m = document.querySelector('main'); return 'RENDER strong=' + m.querySelectorAll('strong').length + ' code=' + m.querySelectorAll('code').length + ' em=' + m.querySelectorAll('em').length + ' leaks=' + ((m.innerText.match(/\*\*|\{[a-z]+:/g)||[]).length); })()" | tr -d '"\\'
agent-browser close --all 2>/dev/null || true
agent-browser set viewport 390 844
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 8
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()" >/dev/null
sleep 2
agent-browser eval "(() => { const el = [...document.querySelectorAll('button')].find(e => /Company screens/i.test(e.textContent)); if (el) el.click(); return 'ok'; })()" >/dev/null
sleep 3
echo "MOBILE overflowX: $(agent-browser eval "(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)()" | tr -d '"\\')"
agent-browser screenshot download/companies-final-64.png >/dev/null 2>&1
echo DONE
