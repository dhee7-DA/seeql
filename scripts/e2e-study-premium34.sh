#!/bin/bash
# Task 83 E2E: study guides for the 12 premium wave 3-4 sections.
# Single call: server boot + all server-dependent browser steps.
cd /home/z/my-project

PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "PASS: $1"; }
bad()  { FAIL=$((FAIL+1)); echo "FAIL: $1"; }

echo "=== boot dev server ==="
(setsid bun run dev > /tmp/dev83.log 2>&1 &)
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

echo "=== expand Module 12 card, open the band via a premium3 row ==="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').trim().replace(/\s+/g,'')==='12LeetCodeSQL50+0/347'); if(!b) return 'nf'; b.click(); return 'expanded'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const rows=[...document.querySelectorAll('button')].filter(x=>/contests & boards/i.test(x.textContent||'') && (x.textContent||'').length<60); if(!rows.length) return 'no-rows'; rows[0].click(); return 'clicked premium3-arena row'; })()" >/dev/null 2>&1
sleep 2

echo "=== count study toggles on band view (expect 60) ==="
CNT=$(agent-browser eval "(() => { const n=[...document.querySelectorAll('button')].filter(b=>/study guide/i.test(b.textContent||'')).length; return String(n); })()" 2>/dev/null | tr -d '"')
echo "toggles: $CNT"
[ "$CNT" = "60" ] && ok "60 study toggles render (48 + 12 new)" || bad "expected 60 toggles, got $CNT"

echo "=== open the Premium Contests & Boards study guide ==="
agent-browser eval "(() => { const btns=[...document.querySelectorAll('button')].filter(b=>/study guide/i.test(b.textContent||'')); for(const b of btns){ let up=b.parentElement; for(let i=0;i<10&&up;i++){ if(/contests & boards/i.test(up.textContent||'') && !(up.textContent||'').match(/stats & eligibility|hard streaks|hopper/i)){ b.click(); return 'toggled premium3-arena'; } up=up.parentElement; } } return 'nf'; })()" >/dev/null 2>&1
sleep 1
A=$(agent-browser eval "(() => { const t=document.body.textContent||''; const i=t.indexOf('Assignment questions pair every rider'); if(i<0) return 'no-intro'; const seg=t.slice(i, i+5200); return JSON.stringify({ whyBus:/LEFT JOIN spine counts zero-boarding/i.test(seg), whyIsland:/constant inside a run/i.test(seg), whyPct:/100.0 × that \/ field/i.test(seg) }); })()" 2>/dev/null)
echo "arena panel: $A"
echo "$A" | rg -q 'whyBus\\\":true' && echo "$A" | rg -q 'whyIsland\\\":true' && echo "$A" | rg -q 'whyPct\\\":true' && ok "Contests & Boards guide renders (intro + whys)" || bad "arena assertion: $A"

echo "=== open the Premium Boards & Percentiles study guide ==="
agent-browser eval "(() => { const btns=[...document.querySelectorAll('button')].filter(b=>/study guide/i.test(b.textContent||'')); for(const b of btns){ let up=b.parentElement; for(let i=0;i<10&&up;i++){ if(/boards & percentiles/i.test(up.textContent||'') && !(up.textContent||'').match(/contests & boards|social & weekly/i)){ b.click(); return 'toggled premium4-boards'; } up=up.parentElement; } } return 'nf'; })()" >/dev/null 2>&1
sleep 1
B=$(agent-browser eval "(() => { const t=document.body.textContent||''; const i=t.indexOf('Leaderboard machinery starts with argmax-over-groups'); if(i<0) return 'no-intro'; const seg=t.slice(i, i+5200); return JSON.stringify({ whyMean:/naive deception/i.test(seg), whyRank:/three wineries can legitimately/i.test(seg), whyPr:/one window call/i.test(seg) }); })()" 2>/dev/null)
echo "boards panel: $B"
echo "$B" | rg -q 'whyMean\\\":true' && echo "$B" | rg -q 'whyRank\\\":true' && echo "$B" | rg -q 'whyPr\\\":true' && ok "Boards & Percentiles guide renders (intro + whys)" || bad "boards assertion: $B"

echo "=== screenshot desktop ==="
agent-browser set viewport 1440 900 >/dev/null 2>&1; sleep 1
agent-browser screenshot /home/z/my-project/download/study-premium34-desktop.png >/dev/null 2>&1 && ok "desktop screenshot" || bad "desktop screenshot"

echo "=== mobile 390x844 ==="
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
OV=$(agent-browser eval "(() => { const d=document.documentElement; return 'scrollWidth='+d.scrollWidth+' clientWidth='+d.clientWidth; })()" 2>/dev/null)
echo "overflow: $OV"
SW=$(echo "$OV" | rg -o "scrollWidth=(\d+)" -r '$1'); CW=$(echo "$OV" | rg -o "clientWidth=(\d+)" -r '$1')
if [ -n "$SW" ] && [ -n "$CW" ] && [ "$SW" -le "$CW" ]; then ok "mobile overflowX = 0 ($SW <= $CW)"; else bad "mobile overflow: $OV"; fi
agent-browser screenshot /home/z/my-project/download/study-premium34-mobile.png >/dev/null 2>&1 && ok "mobile screenshot" || bad "mobile screenshot"

echo ""
echo "RESULT: $PASS passed, $FAIL failed"
[ "$FAIL" = "0" ]
