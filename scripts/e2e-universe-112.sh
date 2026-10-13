#!/bin/bash
# Task 93+94 E2E: wall stat (112 kits), new-domain spot checks, expanded kit
# tab volume, mock round presence, mobile overflow. Single flow, long sleeps.
cd /home/z/my-project
agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 10
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return 'skipped'; })()" >/dev/null
sleep 3
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /company screens/i.test(x.textContent||'')); if (b) { b.click(); return 'company-screens'; } return 'missing'; })()" >/dev/null
sleep 4
WALL=$(agent-browser eval "(() => { const t = document.querySelector('main')?.innerText||''; const m = t.match(/(\d+) of (\d+) kits live/); return m ? m[1] + '/' + m[2] : 'NOT FOUND'; })()" | tr -d '"\\')
echo "WALL: $WALL kits live"
# New wave-7 companies visible on the wall (DOM census)
agent-browser eval "(() => { const txt = [...document.querySelectorAll('main button')].map(b => (b.textContent||'').trim()); const names = ['Zalando','Chewy','Sephora','inDrive','BlaBlaCar','Yassir','Discord','Bumble','Duolingo','Nubank','Chime','Ramp','Wolt','Blinkit','Zepto','Trip.com','Hilton','Trainline','UBS','ING','ICICI Bank','Dropbox','Zendesk','Canva']; const hit = names.filter(n => txt.some(t => t.split('\n')[0] === n)); return 'WAVE7 ' + hit.length + '/24: ' + hit.join('|'); })()" | tr -d '"\\'
# Open a 3x-expanded wave-6 kit (Target) and count tabs
agent-browser eval "(() => { const b = [...document.querySelectorAll('main button')].find(x => (x.textContent||'').trim().startsWith('Target')); if (b) { b.click(); return 'target-open'; } return 'missing'; })()" >/dev/null
sleep 4
agent-browser eval "(() => { const tabs = [...document.querySelectorAll('[role=tablist] button')].map(b => (b.textContent||'').trim()); return 'TARGET-TABS ' + tabs.length + ' [' + tabs.join(',') + ']'; })()" | tr -d '"\\'
agent-browser eval "(() => { const tabs=[...document.querySelectorAll('[role=tablist] button')]; const t=tabs.find(x=>/mock round/i.test(x.textContent||'')); if(t) t.click(); return 'ok'; })()" >/dev/null
sleep 2
agent-browser eval "(() => { const m = document.querySelector('main'); const start = [...m.querySelectorAll('button')].some(b => /start/i.test(b.textContent||'')); return 'MOCK-ROUND start-btn=' + start; })()" | tr -d '"\\'
agent-browser close --all 2>/dev/null || true
agent-browser set viewport 390 844
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 10
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()" >/dev/null
sleep 2
agent-browser eval "(() => { const el = [...document.querySelectorAll('button')].find(e => /Company screens/i.test(e.textContent)); if (el) el.click(); return 'ok'; })()" >/dev/null
sleep 4
agent-browser eval "(() => { const d = document.documentElement; return 'MOBILE overflowX=' + d.scrollWidth + ' vs viewport 390 -> ' + (d.scrollWidth <= 391 ? 'CLEAN' : 'OVERFLOW ' + d.scrollWidth); })()" | tr -d '"\\'
agent-browser close --all 2>/dev/null || true
echo "E2E DONE"
