#!/usr/bin/env bash
# One-shot live QA for the Plan-tab upgrade (den-plan-explain). Starts the dev
# server, boots the playground (default sample auto-runs), walks the Plan tab
# across four queries (join+agg, ORDER BY sort, IN-subquery tree, correlated
# subquery), verifies chips/costs/row-estimates/insights, screenshots, then
# stops the server. ONE bash call so the sandbox cannot reap the server.
#
# Hard-won session notes:
# - programmatic el.click() does NOT switch Radix Tabs here — snapshot the tab
#   and click its ref (agent-browser click eNN)
# - innerText reflects CSS text-transform: the insights heading reads UPPERCASE,
#   so insight checks must be case-insensitive
# - after a stale session, agent-browser may serve an empty page: close, sleep,
#   re-open before diagnosing anything else
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

open_plantab() {
  # wait for the Plan tab to exist, then click it via snapshot ref
  for i in $(seq 1 20); do
    ref=$(agent-browser snapshot 2>/dev/null | grep -o 'tab "Plan[^"]*" \[selected, ref=e[0-9]*\]\|tab "Plan[^"]*" \[ref=e[0-9]*\]' | head -1 | grep -o 'ref=e[0-9]*' | cut -d= -f2)
    [ -n "$ref" ] && break
    sleep 1
  done
  [ -n "$ref" ] || { echo "no plan tab"; return 1; }
  agent-browser click "$ref" >/dev/null 2>&1
  agent-browser wait 1000 >/dev/null 2>&1
  return 0
}

run_sql() {
  agent-browser eval "(() => { const ta=document.querySelector('textarea[aria-label=\"SQL query editor\"]'); if(!ta) return 'nota'; const set=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set; set.call(ta, $1); ta.dispatchEvent(new Event('input',{bubbles:true})); return 'set'; })()" >/dev/null
  agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Run'); b?.click(); return 'ran'; })()" >/dev/null
  agent-browser wait 2500 >/dev/null 2>&1
}

agent-browser close >/dev/null 2>&1
sleep 1
agent-browser open "http://localhost:3000/#playground" >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser wait 5000 >/dev/null 2>&1

echo "== page errors after boot =="
agent-browser errors

echo "== query 1: default sample (join + group by + having + order by) =="
open_plantab
agent-browser eval "(() => { const t=document.body.innerText; return JSON.stringify({strip:t.includes(\"SQLite's plan\"),scan:/\\d+ full scan/.test(t),lookup:/\\d+ index lookup/.test(t),sort:/\\d+ sort step/.test(t),oN:t.includes('O(n)'),o1:t.includes('O(1)'),oNlogN:t.includes('O(n log n)'),rows103:t.includes('~103 rows'),pk:t.includes('PK LOOKUP'),fs:t.includes('FULL SCAN'),bt:t.includes('TEMP B-TREE'),ins:/what the engine is telling you/i.test(t),nl:/nested-loop join, tuned/i.test(t),gs:/grouping by sorting/i.test(t),legend:t.includes('Top row = the outer loop')}); })()"
agent-browser screenshot scripts/qa-plan-1.png >/dev/null 2>&1

echo "== query 2: pure ORDER BY sort =="
run_sql "'SELECT * FROM orders ORDER BY total DESC;'"
open_plantab
agent-browser eval "(() => { const t=document.body.innerText; return JSON.stringify({btree:t.includes('TEMP B-TREE'),forOB:t.includes('FOR ORDER BY'),oNlogN:t.includes('O(n log n)'),sortIns:/everything is collected, then sorted/i.test(t),fsIns:/full table scan/i.test(t),chip:/1 full scan/.test(t),rows:t.includes('~103 rows')}); })()"
agent-browser screenshot scripts/qa-plan-2.png >/dev/null 2>&1

echo "== query 3: IN-subquery — tree nesting under LIST SUBQUERY =="
run_sql "'SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > 800);'"
open_plantab
agent-browser eval "(() => { const t=document.body.innerText; const elbow=[...document.querySelectorAll('div')].some(d=>typeof d.className==='string' && d.className.includes('border-l-2') && d.className.includes('border-zinc-800')); return JSON.stringify({listSub:t.includes('LIST SUBQUERY'),pk:t.includes('PK LOOKUP'),o1:t.includes('O(1)'),elbow,nl:/nested-loop join, tuned/i.test(t),childScan:t.includes('~103 rows')}); })()"
agent-browser screenshot scripts/qa-plan-3.png >/dev/null 2>&1

echo "== query 4: correlated scalar subquery — per-row warning =="
run_sql "'SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n FROM customers c;'"
open_plantab
agent-browser eval "(() => { const t=document.body.innerText; return JSON.stringify({corr:t.includes('CORRELATED SCALAR SUBQUERY'),perRow:/per-row subquery/i.test(t),mult:t.includes('cost multiplies'),scan:t.includes('~16 rows')}); })()"
agent-browser screenshot scripts/qa-plan-4.png >/dev/null 2>&1

echo "== final page errors =="
agent-browser errors

echo "== done =="
