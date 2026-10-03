#!/usr/bin/env bash
# Browser QA for the LeetCode Big 300 view (Task 55).
# Hub → filters → deep-dive detail → reveal gates → mark-solved XP →
# company index → mobile overflow → console errors.
set -u
cd /home/z/my-project

OUT=/home/z/my-project/scripts
BASE=http://localhost:3000

# 1. open fresh — clear progress storage explicitly, then reload clean
agent-browser open "$BASE/?fresh=lc-qa-5" || exit 1
agent-browser wait --load networkidle
agent-browser eval "(() => { localStorage.clear(); return 'cleared'; })()"
agent-browser open "$BASE/?fresh=lc-qa-5b"
agent-browser wait --load networkidle
agent-browser errors --clear >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/skip tour/i.test(e.innerText)); b && b.click(); return b ? 'tour skipped' : 'no tour'; })()"

# 2. enter the course + open the LeetCode view from the sidebar
agent-browser eval "(() => { const el=[...document.querySelectorAll('a,button')].find(e=>/start learning/i.test(e.innerText)); el && el.click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const el=[...document.querySelectorAll('button')].find(e=>/leetcode big 300/i.test(e.innerText)); if(!el) return 'FAIL: no lc entry'; el.click(); return 'lc opened'; })()"
sleep 2
agent-browser eval "(() => { const t=document.body.innerText; return { header: /The Big 300/.test(t), strip: /0 solved/.test(t) && /38 deep-dives/.test(t) && /300 total/.test(t), topics: /Arrays & Hashing/.test(t) && /Sliding Window/.test(t) && /SQL/.test(t), sqlRow: /Combine Two Tables/.test(t) }; })()"

# 3. deep-dives only filter + search Two Sum → open detail
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/deep-dives only/i.test(e.innerText)); b && b.click(); return 'filter on'; })()"
agent-browser eval "(() => { const i=document.querySelector('input[aria-label=\"Search problems\"]'); const s=new Event('input',{bubbles:true}); const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(i,'two sum'); i.dispatchEvent(s); return 'typed'; })()"
sleep 1
agent-browser eval "(() => { const row=[...document.querySelectorAll('button')].find(e=>[...e.querySelectorAll('span')].some(s=>s.textContent==='Two Sum')); if(!row) return 'FAIL: no two-sum row'; row.click(); return 'opened'; })()"
sleep 1
agent-browser eval "(() => { const t=document.body.innerText; return { problem: /The problem/i.test(t), statement: /hash map|target/.test(t), solvedBtn: /Mark solved/.test(t), gated: /Reveal the breakdown/.test(t) && /Reveal the ladder/.test(t) && /Reveal the Python/.test(t) }; })()"
agent-browser screenshot "$OUT/qa-lc-detail-gated.png" 2>&1 | tail -1

# 4. reveal gates → solution + code + verified complexity
agent-browser eval "(() => { for (const label of [/Reveal the breakdown/,/Reveal the ladder/,/Reveal the Python/]) { const b=[...document.querySelectorAll('button')].find(e=>label.test(e.innerText)); b && b.click(); } return 'revealed'; })()"
sleep 1
agent-browser eval "(() => { const t=document.body.innerText; return { ladder: /Brute force/.test(t) && /The optimal idea/.test(t), traps: /Traps & edges/i.test(t), code: /def twoSum/.test(t) && /seen = {}/.test(t), time: /time/.test(t) && /O\\(n\\)/.test(t), followUps: /Interview follow-ups/i.test(t) }; })()"
agent-browser screenshot "$OUT/qa-lc-detail-open.png" 2>&1 | tail -1

# 5. mark solved → XP toast + header flip
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Mark solved/.test(e.innerText)); if(!b) return 'FAIL: no mark button'; b.click(); return 'marked'; })()"
sleep 1
agent-browser eval "(() => { const t=document.body.innerText; return { toast: /\\+10 XP/.test(t), solvedChip: /Solved · 10 XP/.test(t) }; })()"

# 6. back → solved count advanced; company index → pick Amazon
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/All problems/.test(e.innerText)); b && b.click(); return 'back'; })()"
sleep 1
agent-browser eval "(() => { const t=document.body.innerText; return { solved1: /1 solved/.test(t) }; })()"
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Companies/.test(e.innerText)); b && b.click(); return 'companies'; })()"
sleep 1
agent-browser eval "(() => { const t=document.body.innerText; return { ranked: /Amazon/.test(t) && /in set/.test(t), note: /Community-sourced/.test(t) }; })()"
agent-browser screenshot "$OUT/qa-lc-companies.png" 2>&1 | tail -1
agent-browser eval "(() => { const row=[...document.querySelectorAll('button')].find(e=>/asks .*Two Sum/.test(e.innerText)); if(!row) return 'FAIL: no amazon row'; row.click(); return 'filtered'; })()"
sleep 1
agent-browser eval "(() => { const s=document.querySelector('select[aria-label=\"Filter by company\"]'); const rows=[...document.querySelectorAll('section')].length; return { companyFilter: s && s.value === 'Amazon', groups: rows }; })()"

# 7. mobile 390x844 overflow
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/skip tour/i.test(e.innerText)); b && b.click(); return b ? 'tour skipped' : 'no tour'; })()"
agent-browser eval "(() => { document.querySelector('select[aria-label=\"Filter by company\"]').value='All'; document.querySelector('select[aria-label=\"Filter by company\"]').dispatchEvent(new Event('change',{bubbles:true})); return 'reset'; })()"
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/^All$|deep-dives only/i.test(e.innerText)); return 'ok'; })()" >/dev/null
agent-browser eval "window.localStorage.setItem('seeql.lc-qa','1'); 'ok'" >/dev/null
agent-browser set viewport 390 844
sleep 1
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/leetcode big 300/i.test(e.innerText)); return 'rail ok'; })()"
agent-browser eval "(() => { const d=document.documentElement; return { overflowX: d.scrollWidth - d.clientWidth <= 1, w: d.clientWidth }; })()"
agent-browser screenshot "$OUT/qa-lc-mobile.png" 2>&1 | tail -1
agent-browser set viewport 1280 900

# 8. console errors
agent-browser errors 2>&1 | tail -3
echo "=== LC QA DONE ==="
