#!/usr/bin/env bash
# Browser QA for the SQL 50 sandbox flow (Task 56).
# Hub counts → SQL detail (schema + practice) → wrong answer → correct answer
# with XP → write problem flow → hub reflects solve → mobile → console.
set -u
cd /home/z/my-project

BASE=http://localhost:3000

# 1. fresh session — clear progress, skip tour
agent-browser open "$BASE/?fresh=lcsql-qa-1" || exit 1
agent-browser wait --load networkidle
agent-browser eval "(() => { localStorage.clear(); return 'cleared'; })()"
agent-browser open "$BASE/?fresh=lcsql-qa-2"
agent-browser wait --load networkidle
agent-browser errors --clear >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/skip tour/i.test(e.innerText)); b && b.click(); return b ? 'tour skipped' : 'no tour'; })()"

# 2. enter course + open LeetCode view
agent-browser eval "(() => { const el=[...document.querySelectorAll('a,button')].find(e=>/start learning/i.test(e.innerText)); el && el.click(); return 'ok'; })()"
sleep 2
agent-browser eval "(() => { const el=[...document.querySelectorAll('button')].find(e=>/leetcode big 300/i.test(e.innerText)); if(!el) return 'FAIL: no lc entry'; el.click(); return 'lc opened'; })()"
sleep 2
echo "--- hub state ---"
agent-browser eval "(() => { const t=document.body.innerText; return { strip: /0 solved/.test(t) && /88 deep-dives/.test(t) && /300 total/.test(t), sqlGroup: /SQL/.test(t), sqlRow: /Combine Two Tables/.test(t) }; })()"

# 3. open Combine Two Tables detail (SQL problem)
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Combine Two Tables/i.test(e.innerText)); if(!b) return 'FAIL: no row'; b.click(); return 'opened'; })()"
sleep 1
echo "--- sql detail structure ---"
agent-browser eval "(() => { const t=document.body.innerText; return { problem: /Combine Two Tables/.test(t), schema: /your SQLite sandbox/i.test(t), ddl: /CREATE TABLE Person/.test(t), practice: /write your query/i.test(t), runCheck: /Run & check/i.test(t), sqlReveal: /Reveal the SQL solution/i.test(t), noPyReveal: !/Reveal the Python solution/i.test(t) }; })()"

# 4. wrong answer → fail banner
agent-browser eval "(() => { const ta=document.querySelector('textarea'); if(!ta) return 'FAIL: no textarea'; const set=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set; set.call(ta,'SELECT firstName FROM Person'); ta.dispatchEvent(new Event('input',{bubbles:true})); return 'typed'; })()"
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Run & check/i.test(e.innerText)); b.click(); return 'checking'; })()"
sleep 2
agent-browser eval "(() => { const t=document.body.innerText; return { failShown: /Not quite/i.test(t) || /expected/i.test(t), rows: /row/i.test(t) }; })()"

# 5. correct answer → pass + XP
agent-browser eval "(() => { const ta=document.querySelector('textarea'); const set=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set; set.call(ta,'SELECT p.firstName, p.lastName, a.city, a.state FROM Person p LEFT JOIN Address a ON a.personId = p.personId'); ta.dispatchEvent(new Event('input',{bubbles:true})); return 'typed'; })()"
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Run & check/i.test(e.innerText)); b.click(); return 'checking'; })()"
sleep 2
echo "--- pass state ---"
agent-browser eval "(() => { const t=document.body.innerText; return { pass: /Correct — your result matches/i.test(t), xpToast: /\+10 XP/i.test(t) || /solved in the sandbox/i.test(t), solvedChip: /Solved · 10 XP/i.test(t) }; })()"

# 6. back to hub — counts update
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/All problems/i.test(e.innerText)); b.click(); return 'back'; })()"
sleep 1
agent-browser eval "(() => { const t=document.body.innerText; return { hubSolved: /1 solved/.test(t) }; })()"

# 7. write problem — delete-duplicate-emails
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Delete Duplicate Emails/i.test(e.innerText)); if(!b) return 'FAIL: no row'; b.click(); return 'opened'; })()"
sleep 1
agent-browser eval "(() => { const ta=document.querySelector('textarea'); const set=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set; set.call(ta,'DELETE FROM Person WHERE id NOT IN (SELECT MIN(id) FROM Person GROUP BY email)'); ta.dispatchEvent(new Event('input',{bubbles:true})); return 'typed'; })()"
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(e=>/Run & check/i.test(e.innerText)); b.click(); return 'checking'; })()"
sleep 2
echo "--- write problem ---"
agent-browser eval "(() => { const t=document.body.innerText; return { pass: /Correct — your result matches/i.test(t), affected: /rows affected/i.test(t), solved: /Solved · 10 XP/i.test(t) }; })()"

# 8. mobile overflow
agent-browser set viewport 390 844 2>/dev/null || agent-browser eval "(() => { return 'viewport-skip'; })()"
sleep 1
agent-browser eval "(() => ({ docW: document.documentElement.scrollWidth, winW: window.innerWidth, overflow: document.documentElement.scrollWidth > window.innerWidth }))()"

# 9. console errors
agent-browser errors
