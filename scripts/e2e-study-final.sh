#!/bin/bash
# Task 84 E2E: study guides for the final 13 sections (premium5 + free + final).
# Full coverage reached: 73/73 sections. Single call: server boot + browser steps.
cd /home/z/my-project

PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "PASS: $1"; }
bad()  { FAIL=$((FAIL+1)); echo "FAIL: $1"; }

echo "=== boot dev server ==="
(setsid bun run dev > /tmp/dev84.log 2>&1 &)
UP=0
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; break; fi
  sleep 2
done
[ "$UP" = "1" ] && ok "dev server up (GET / 200)" || { bad "dev server did not come up"; exit 1; }

echo "=== browser: fresh session ==="
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open "http://localhost:3000/#learn" >/dev/null 2>&1
sleep 6

agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/skip tour/i.test(x.textContent||'')); if(b){b.click(); return 'skipped';} return 'none'; })()" >/dev/null 2>&1
sleep 1

echo "=== expand Module 12 card, open the band via a final wave row ==="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').trim().replace(/\s+/g,'')==='12LeetCodeSQL50+0/347'); if(!b) return 'nf'; b.click(); return 'expanded'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const rows=[...document.querySelectorAll('button')].filter(x=>/ops & pairs/i.test(x.textContent||'') && (x.textContent||'').length<60); if(!rows.length) return 'no-rows'; rows[0].click(); return 'clicked final-ops row'; })()" >/dev/null 2>&1
sleep 2

echo "=== count study toggles on band view (expect 73 = full coverage: 61 SQL50 + 12 DF) ==="
CNT=$(agent-browser eval "(() => { const n=[...document.querySelectorAll('button')].filter(b=>/study guide/i.test(b.textContent||'')).length; return String(n); })()" 2>/dev/null | tr -d '"')
echo "toggles: $CNT"
[ "$CNT" = "73" ] && ok "73 study toggles render — full study-guide coverage (61 SQL50 + 12 DF)" || bad "expected 73 toggles, got $CNT"

echo "=== open the Final Wave: Ops & Pairs study guide ==="
agent-browser eval "(() => { const btns=[...document.querySelectorAll('button')].filter(b=>/study guide/i.test(b.textContent||'')); for(const b of btns){ let up=b.parentElement; for(let i=0;i<10&&up;i++){ if(/ops & pairs/i.test(up.textContent||'') && !(up.textContent||'').match(/users & habits/i)){ b.click(); return 'toggled final-ops'; } up=up.parentElement; } } return 'nf'; })()" >/dev/null 2>&1
sleep 1
A=$(agent-browser eval "(() => { const t=document.body.textContent||''; const i=t.indexOf('The boarding puzzle is a running sum'); if(i<0) return 'no-intro'; const seg=t.slice(i, i+5200); return JSON.stringify({ whyBus:/the overload stops the queue/i.test(seg), whyZombie:/the session is a row-set/i.test(seg), whySpiral:/both window-built/i.test(seg) }); })()" 2>/dev/null)
echo "final-ops panel: $A"
echo "$A" | rg -q 'whyBus\\\":true' && echo "$A" | rg -q 'whyZombie\\\":true' && echo "$A" | rg -q 'whySpiral\\\":true' && ok "Final Wave: Ops & Pairs guide renders (intro + whys)" || bad "final-ops assertion: $A"

echo "=== open the Free Classics study guide ==="
agent-browser eval "(() => { const btns=[...document.querySelectorAll('button')].filter(b=>/study guide/i.test(b.textContent||'')); for(const b of btns){ let up=b.parentElement; for(let i=0;i<10&&up;i++){ if(/free classics/i.test(up.textContent||'') && !(up.textContent||'').match(/windows|formats|org & recovery|pairs & seasons/i)){ b.click(); return 'toggled free-classics'; } up=up.parentElement; } } return 'nf'; })()" >/dev/null 2>&1
sleep 1
B=$(agent-browser eval "(() => { const t=document.body.textContent||''; const i=t.indexOf('The canonical traps start with NULL semantics'); if(i<0) return 'no-intro'; const seg=t.slice(i, i+5200); return JSON.stringify({ whyRef:/the never-referred/i.test(seg), whyLag:/a four-row streak reports once/i.test(seg), whyOr:/either alone qualifies/i.test(seg) }); })()" 2>/dev/null)
echo "free-classics panel: $B"
echo "$B" | rg -q 'whyRef\\\":true' && echo "$B" | rg -q 'whyLag\\\":true' && echo "$B" | rg -q 'whyOr\\\":true' && ok "Free Classics guide renders (intro + whys)" || bad "free-classics assertion: $B"

echo "=== screenshot desktop ==="
agent-browser set viewport 1440 900 >/dev/null 2>&1; sleep 1
agent-browser screenshot /home/z/my-project/download/study-final-desktop.png >/dev/null 2>&1 && ok "desktop screenshot" || bad "desktop screenshot"

echo "=== mobile 390x844 ==="
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
OV=$(agent-browser eval "(() => { const d=document.documentElement; return 'scrollWidth='+d.scrollWidth+' clientWidth='+d.clientWidth; })()" 2>/dev/null)
echo "overflow: $OV"
SW=$(echo "$OV" | rg -o "scrollWidth=(\d+)" -r '$1'); CW=$(echo "$OV" | rg -o "clientWidth=(\d+)" -r '$1')
if [ -n "$SW" ] && [ -n "$CW" ] && [ "$SW" -le "$CW" ]; then ok "mobile overflowX = 0 ($SW <= $CW)"; else bad "mobile overflow: $OV"; fi
agent-browser screenshot /home/z/my-project/download/study-final-mobile.png >/dev/null 2>&1 && ok "mobile screenshot" || bad "mobile screenshot"

echo ""
echo "RESULT: $PASS passed, $FAIL failed"
[ "$FAIL" = "0" ]
