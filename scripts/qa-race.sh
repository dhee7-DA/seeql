#!/usr/bin/env bash
# One-shot live QA for the RunHistory + QueryRace mount (den-ledger-race).
# Boots #playground (default sample auto-runs -> ledger entry), runs a second
# query, opens the History popover, picks A/B, verifies the two diffs + the
# live race, screenshots, stops the server. ONE bash call so the sandbox
# cannot reap the server between steps.
#
# Session notes (hard-won):
# - Radix Popover/Tabs ignore programmatic el.click() on the TRIGGER — snapshot
#   + agent-browser click <ref> works. Plain buttons inside (Run, A/B picks,
#   exit diff) accept el.click() fine.
# - the History trigger appears in snapshots as button "Run history and diff"
#   with OTHER attributes before the ref: grep pattern must be [^]]*ref=eNN
# - aria-expanded on the trigger can be stale in snapshots — verify with
#   getAttribute after clicking, toggle again if needed
# - innerText reflects CSS text-transform — all copy checks case-insensitive
# - A/B pick buttons only exist in the LIST view; when comparing, use
#   "exit diff" first to re-pick
set -u
cd /home/z/my-project

bun run dev > /dev/null 2>&1 &
DEV_PID=$!
cleanup() { kill $DEV_PID 2>/dev/null; }
trap cleanup EXIT

for i in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || true)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "== server: $code after ${i}s =="
[ "$code" = "200" ] || { echo "server never came up"; exit 1; }

run_sql() {
  agent-browser eval "(() => { const ta=document.querySelector('textarea[aria-label=\"SQL query editor\"]'); if(!ta) return 'nota'; const set=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set; set.call(ta, $1); ta.dispatchEvent(new Event('input',{bubbles:true})); return 'set'; })()" >/dev/null
  agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Run'); b?.click(); return 'ran'; })()" >/dev/null
  agent-browser wait 2500 >/dev/null 2>&1
}

open_history() {
  agent-browser eval "(() => { const b=document.querySelector('button[aria-label=\"Run history and diff\"]'); if(!b) return 'nobtn'; return b.getAttribute('aria-expanded'); })()"
  agent-browser eval "(() => { const b=document.querySelector('button[aria-label=\"Run history and diff\"]'); if(!b || b.getAttribute('aria-expanded')!=='true') { b?.click(); } return 'toggled'; })()" >/dev/null
  agent-browser wait 1000 >/dev/null 2>&1
}

agent-browser close >/dev/null 2>&1
sleep 1
agent-browser open "http://localhost:3000/#playground" >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser wait 5000 >/dev/null 2>&1

echo "== page errors after boot =="
agent-browser errors

echo "== ledger after boot (default sample auto-ran) =="
open_history
agent-browser eval "(() => { const t=document.body.innerText; return JSON.stringify({ledger:/run ledger/i.test(t),rows:/\\d+ rows/.test(t),select:t.includes('SELECT'),justNow:t.includes('just now'),hint:/click A then B/i.test(t)}); })()"
agent-browser screenshot scripts/qa-race-1.png >/dev/null 2>&1

echo "== run a second, different query =="
run_sql "'SELECT c.name, COUNT(*) AS n, ROUND(SUM(o.total),2) AS spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.name HAVING COUNT(*) > 5 ORDER BY spend DESC;'"
open_history
agent-browser eval "(() => { const t=document.body.innerText; const n=[...document.querySelectorAll('div')].filter(d=>typeof d.className==='string'&&d.className.includes('group')).length; return JSON.stringify({ledger:/run ledger/i.test(t),spend:t.includes('spend'),runRows:n}); })()"

echo "== pick A then B -> diff view + live race =="
agent-browser eval "(() => { const a=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='Pick as A'); a?.click(); const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='Pick as B'); b?.click(); return 'picked'; })()" >/dev/null
agent-browser wait 4500 >/dev/null 2>&1
agent-browser eval "(() => { const t=document.body.innerText; return JSON.stringify({ab:/A ↔ B/.test(t),queryDiff:/the query/i.test(t),changed:/\\d+ changed lines?/.test(t),rowsDiff:/the rows/i.test(t),cost:/the cost/i.test(t),median:/median of 3/i.test(t),ms:/\\d+ms/.test(t),ops:/\\d+ ops/.test(t),lane:/\\d+ → \\d+ rows/.test(t),verdict:/same \\d+ rows? out|different answers|dead heat/i.test(t)}); })()"
agent-browser screenshot scripts/qa-race-2.png >/dev/null 2>&1

echo "== exit diff, run a third query, re-pick for a real diff =="
agent-browser eval "(() => { const x=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('exit diff')); x?.click(); return 'exited'; })()" >/dev/null
agent-browser wait 400 >/dev/null 2>&1
open_history
agent-browser eval "(() => { const x=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('exit diff')); x?.click(); return 'exited2'; })()" >/dev/null
agent-browser wait 400 >/dev/null 2>&1
agent-browser eval "(() => { const as=[...document.querySelectorAll('button[aria-label=\"Pick as A\"]')]; const bs=[...document.querySelectorAll('button[aria-label=\"Pick as B\"]')]; as[0]?.click(); bs[1]?.click(); return 'picked '+as.length; })()" >/dev/null
agent-browser wait 4500 >/dev/null 2>&1
agent-browser eval "(() => { const t=document.body.innerText; return JSON.stringify({changedNot0:/[1-9]\\d* changed lines?/.test(t),shape:/shape changed|columns differ/.test(t),colChips:/[+-] \\w+/.test(t),verdict:/same \\d+ rows? out|different answers/i.test(t)}); })()"
agent-browser screenshot scripts/qa-race-3.png >/dev/null 2>&1

echo "== final page errors =="
agent-browser errors

echo "== done =="
