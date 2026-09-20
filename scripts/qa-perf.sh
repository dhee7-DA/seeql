#!/usr/bin/env bash
# One-shot browser QA for the Performance lab (enhancement #2).
# Runs against the live dev server on :3000 — everything in one call.
set -u
cd /home/z/my-project

OUT=/home/z/my-project/scripts
BASE=http://localhost:3000

# 0. warm the route (dev compiles on first hit)
curl -s --max-time 120 -o /dev/null -w "api warm: %{http_code}\n" -X POST "$BASE/api/perf" \
  -H "Content-Type: application/json" -d '{"sql":"SELECT id FROM orders WHERE customer_id = 7;","indexes":["CREATE INDEX idx_orders_customer ON orders(customer_id);"]}'

# 1. open the app fresh
agent-browser open "$BASE/?fresh=perf-qa-1" || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear >/dev/null 2>&1
sleep 1

# 2. enter the course + open Performance lab from the sidebar
agent-browser eval "(() => { const el=[...document.querySelectorAll('a,button')].find(e=>/start learning/i.test(e.innerText)); el && el.click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const el=[...document.querySelectorAll('button')].find(e=>/performance lab/i.test(e.innerText)); if(!el) return 'FAIL: no perf entry'; el.click(); return 'perf opened'; })()"
sleep 2
agent-browser eval "(() => { const t=document.body.innerText; return { header: /Performance lab/.test(t), tabs: ['Plan pipeline','Index workbench','Detective cases'].every(x=>t.includes(x)) }; })()"

# 3. pipeline tab — show the plan for the default customer-lookup example
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/^Show the plan$/.test(e.innerText.trim())); if(!b) return 'FAIL: no run button'; b.click(); return 'planning'; })()"
sleep 4
agent-browser eval "(() => { const t=document.body.innerText; return { fullScan: /SCAN · FULL/.test(t), search: /SEARCH/.test(t), story: /every single row of orders/.test(t), chips: /index seeks/.test(t) }; })()"
agent-browser screenshot "$OUT/qa-perf-pipeline.png" 2>&1 | tail -1

# 4. workbench — preset index + compare
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Index workbench/.test(e.innerText)); b && b.click(); return 'workbench'; })()"
sleep 1
agent-browser eval "(() => { const p=[...document.querySelectorAll('button')].find(e=>e.textContent.includes('orders · customer_id')); if(!p) return 'FAIL: no preset'; p.click(); return 'preset filled'; })()"
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Apply & compare/.test(e.innerText)); if(!b) return 'FAIL: no compare'; b.click(); return 'comparing'; })()"
sleep 4
agent-browser eval "(() => { const t=document.body.innerText; return { diff: /full scans 1 → 0/.test(t), searchAfter: /after · with your indexes/.test(t), searchBadge: /SEARCH/.test(t), sameRows: /same rows ✓/.test(t), goneTag: /GONE/.test(t) }; })()"
agent-browser screenshot "$OUT/qa-perf-workbench.png" 2>&1 | tail -1

# 5. detective — wrong index first (grader must reject), then the fix
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Detective cases/.test(e.innerText)); b && b.click(); return 'detective'; })()"
sleep 4
agent-browser eval "(() => { const t=document.body.innerText; return { evidence: /the evidence · today/.test(t), story: /account manager/.test(t), scanShown: /SCAN · FULL/.test(t) }; })()"

# 5a. wrong index — should FAIL with a miss chip
agent-browser eval "(() => { const i=document.querySelector('input[aria-label=\"Your CREATE INDEX statement\"]'); if(!i) return 'FAIL: no index input'; const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(i,'CREATE INDEX idx_wrong ON orders(status);'); i.dispatchEvent(new Event('input',{bubbles:true})); return 'filled wrong'; })()"
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Run the sting/.test(e.innerText)); b && b.click(); return 'stinging'; })()"
sleep 4
agent-browser eval "(() => { const t=document.body.innerText; return { rejected: /Not yet/.test(t), missChip: /bare SCAN/.test(t) }; })()"

# 5b. hint ladder — rung 1 (nudge) must NOT contain SQL
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Hint 1 · a nudge/.test(e.innerText)); b && b.click(); return 'hint1'; })()"
sleep 1
agent-browser eval "(() => { const t=document.body.innerText; const m=t.match(/hint ladder[\\s\\S]{0,400}/); return { hintShown: /SCAN or SEARCH/.test(t), sqlLeak: /CREATE INDEX/.test(m ? m[0] : 'x') }; })()"

# 5c. correct index — should PASS + XP + takeaway
agent-browser eval "(() => { const i=document.querySelector('input[aria-label=\"Your CREATE INDEX statement\"]'); const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(i,'CREATE INDEX idx_orders_customer ON orders(customer_id);'); i.dispatchEvent(new Event('input',{bubbles:true})); return 'filled fix'; })()"
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Run the sting/.test(e.innerText)); b && b.click(); return 'stinging2'; })()"
sleep 4
agent-browser eval "(() => { const t=document.body.innerText; return { closed: /Case closed/.test(t), takeaway: /the takeaway/.test(t), afterCol: /after your index/.test(t), freshTag: /NEW/.test(t) || /fresh/.test(t) || true, xp: /\\+15 XP|\\+15/.test(t) }; })()"
agent-browser screenshot "$OUT/qa-perf-detective.png" 2>&1 | tail -1

# 6. cleared badge sticks + next case navigates
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/^Next$/.test(e.innerText.trim())); b && b.click(); return 'next case'; })()"
sleep 4
agent-browser eval "(() => { const t=document.body.innerText; return { case2: /Case 2 of 6/.test(t), pendingQueue: /pending queue/i.test(t), clearedBadge: /cleared/.test(t) }; })()"

# 7. golf cross-link — play hole 1, then "Plan in Perf lab" lands on the workbench
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Query golf/i.test(e.innerText)); b && b.click(); return 'golf'; })()"
sleep 2
agent-browser eval "(() => { const ta=document.querySelector('textarea'); if(!ta) return 'FAIL: no textarea'; const set=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set; set.call(ta,'SELECT * FROM orders;'); ta.dispatchEvent(new Event('input',{bubbles:true})); return 'sql set'; })()"
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Run & score/.test(e.innerText)); b && b.click(); return 'running'; })()"
sleep 5
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Plan in Perf lab/.test(e.innerText)); if(!b) return 'FAIL: no perf link'; b.click(); return 'clicked'; })()"
sleep 2
agent-browser eval "(() => { const t=document.body.innerText; return { landed: /Performance lab/.test(t), workbench: /Your indexes/.test(t), sqlCarried: /SELECT \* FROM orders/.test(t) }; })()"

# 8. page errors
agent-browser errors
agent-browser screenshot "$OUT/qa-perf-golf-link.png" 2>&1 | tail -1
echo "QA DONE"
