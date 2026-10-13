#!/bin/bash
# One-shot E2E: boots the dev server, runs the browser flow while it's up,
# then tears down. Immune to background-process reaping.
cd /home/z/my-project
pkill -f "next-server" 2>/dev/null; pkill -f "next dev" 2>/dev/null; sleep 2
(setsid nohup bun run dev > /tmp/dev-e2e.log 2>&1 < /dev/null &)
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ --max-time 5 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 2
done
echo "SERVER: $code"

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 12
agent-browser eval "(() => { const skip = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (skip) skip.click(); const cs = [...document.querySelectorAll('button')].find(x => /company screens/i.test(x.textContent||'')); if (cs) cs.click(); return 'nav-ok'; })()" >/dev/null
sleep 6
agent-browser eval "(() => { const m = document.querySelector('main'); if (!m) return 'NO-MAIN'; const t = m.innerText; const wall = (t.match(/(\d+) of (\d+) kits live/)||[]).slice(1).join('/'); const txt = [...m.querySelectorAll('button')].map(b => (b.textContent||'').trim()); const names = ['Zalando','Chewy','Sephora','inDrive','BlaBlaCar','Yassir','Discord','Bumble','Duolingo','Nubank','Chime','Ramp','Wolt','Blinkit','Zepto','Trip.com','Hilton','Trainline','UBS','ING','ICICI Bank','Dropbox','Zendesk','Canva']; const hit = names.filter(n => txt.some(x => x.split('\n')[0] === n)); const doms = (t.match(/14\/14/g)||[]).length; const tgt = txt.find(x => x.startsWith('Target')); if (tgt) { const b=[...m.querySelectorAll('button')].find(x=>(x.textContent||'').trim().startsWith('Target')); if (b) b.click(); } return 'WALL=' + wall + ' WAVE7=' + hit.length + '/24 DOMS=' + doms + ' TARGET-CLICKED=' + (tgt?'yes':'no'); })()" | tr -d '"\\'
sleep 5
agent-browser eval "(() => { const m = document.querySelector('main'); if (!m) return 'NO-MAIN-2'; const tabs = [...document.querySelectorAll('[role=tablist] button')].map(b => (b.textContent||'').trim()); return 'TARGET-TABS=' + tabs.length + ' [' + tabs.join(',') + ']'; })()" | tr -d '"\\'
agent-browser eval "(() => { const tabs=[...document.querySelectorAll('[role=tablist] button')]; const t=tabs.find(x=>/mock round/i.test(x.textContent||'')); if(t) t.click(); return 'ok'; })()" >/dev/null
sleep 2
agent-browser eval "(() => { const m = document.querySelector('main'); if (!m) return 'NO-MAIN-3'; const start = [...m.querySelectorAll('button')].some(b => /start the round|start round|start/i.test(b.textContent||'')); return 'MOCK-ROUND start=' + start; })()" | tr -d '"\\'
agent-browser close --all 2>/dev/null || true
agent-browser set viewport 390 844
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 10
agent-browser eval "(() => { const skip = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (skip) skip.click(); const cs = [...document.querySelectorAll('button')].find(x => /company screens/i.test(x.textContent||'')); if (cs) cs.click(); return 'ok'; })()" >/dev/null
sleep 4
agent-browser eval "(() => { const d = document.documentElement; return 'MOBILE scrollWidth=' + d.scrollWidth + ' -> ' + (d.scrollWidth <= 391 ? 'CLEAN' : 'OVERFLOW'); })()" | tr -d '"\\'
agent-browser close --all 2>/dev/null || true
echo "E2E DONE"
