#!/bin/bash
# Task 82 E2E: study guides for the 12 premium wave 1-2 sections.
# Single call: server boot + all server-dependent browser steps.
cd /home/z/my-project

PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "PASS: $1"; }
bad()  { FAIL=$((FAIL+1)); echo "FAIL: $1"; }

echo "=== boot dev server ==="
(setsid bun run dev > /tmp/dev82.log 2>&1 &)
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

echo "=== expand Module 12 card, open the band ==="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').trim().replace(/\s+/g,'')==='12LeetCodeSQL50+0/347'); if(!b) return 'nf'; b.click(); return 'expanded'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const rows=[...document.querySelectorAll('button')].filter(x=>/premium time windows/i.test(x.textContent||'') && (x.textContent||'').length<60); if(!rows.length) return 'no-rows'; rows[0].click(); return 'clicked premium-time row'; })()" >/dev/null 2>&1
sleep 2

echo "=== count study toggles on band view (expect 48) ==="
CNT=$(agent-browser eval "(() => { const n=[...document.querySelectorAll('button')].filter(b=>/study guide/i.test(b.textContent||'')).length; return String(n); })()" 2>/dev/null)
echo "toggles: $CNT"
[ "$CNT" = "48" ] && ok "48 study toggles render (36 + 12 new)" || bad "expected 48 toggles, got $CNT"

# NOTE: agent-browser eval wraps JSON in quotes with escaped inner quotes (\"path\":true),
# so rg patterns use the escaped form.
PT_OK=$(echo "$PT" | rg -qc 'path\\":true' && echo yes || echo no)

echo "=== open the Premium Time Windows study guide ==="
OPEN=$(agent-browser eval "(() => { const btns=[...document.querySelectorAll('button')].filter(b=>/study guide/i.test(b.textContent||'')); for(const b of btns){ let up=b.parentElement; for(let i=0;i<10&&up;i++){ if(/premium time windows/i.test(up.textContent||'') && !(up.textContent||'').match(/hard finales|streaks|users & dates/i)){ b.click(); return 'toggled premium-time'; } up=up.parentElement; } } return 'nf'; })()" 2>/dev/null)
echo "toggle: $OPEN"
sleep 1
PT=$(agent-browser eval "(() => { const t=document.body.textContent||''; const i=t.indexOf('Interval logic is the premium tier'); if(i<0) return 'no-intro'; const seg=t.slice(i, i+5200); const checks={ path:/the suggested path/i.test(seg), overlap:/closed-interval test/i.test(seg), why7:/0 < julianday/i.test(seg), whyExpand:/recursive CTE walks each shipment/i.test(seg), whyTemp:/earliest date of the peak/i.test(seg), whyCall:/the join finds the people/i.test(seg) }; const n=seg.split('the suggested path').length-1; let items=0; const m=seg.slice(seg.indexOf('the suggested path')); return JSON.stringify(checks); })()" 2>/dev/null)
echo "premium-time panel: $PT"
echo "$PT" | rg -q 'path\\":true' && echo "$PT" | rg -q 'why7\\":true' && echo "$PT" | rg -q 'whyExpand\\":true' && echo "$PT" | rg -q 'whyCall\\":true' && ok "Premium Time Windows guide: intro + whys render" || bad "premium-time assertion: $PT"

echo "=== open the Premium Hopper & Champions study guide ==="
OPEN2=$(agent-browser eval "(() => { const btns=[...document.querySelectorAll('button')].filter(b=>/study guide/i.test(b.textContent||'')); for(const b of btns){ let up=b.parentElement; for(let i=0;i<10&&up;i++){ if(/hopper & champions/i.test(up.textContent||'') && !(up.textContent||'').match(/market analytics|orders & inventory/i)){ b.click(); return 'toggled premium2-finals'; } up=up.parentElement; } } return 'nf'; })()" 2>/dev/null)
echo "toggle: $OPEN2"
sleep 1
HF=$(agent-browser eval "(() => { const t=document.body.textContent||''; const i=t.indexOf('The Hopper trilogy teaches spine-first reporting'); if(i<0) return 'no-intro'; const seg=t.slice(i, i+5200); return JSON.stringify({ whySpine:/zero-driver months survive/i.test(seg), whyUnpivot:/wide data never groups well/i.test(seg), whyCand:/each rule gets its own leg/i.test(seg) }); })()" 2>/dev/null)
echo "hopper panel: $HF"
echo "$HF" | rg -q 'whySpine\\":true' && echo "$HF" | rg -q 'whyUnpivot\\":true' && echo "$HF" | rg -q 'whyCand\\":true' && ok "Hopper & Champions guide: intro + whys render" || bad "hopper assertion: $HF"

echo "=== screenshot desktop ==="
agent-browser set viewport 1440 900 >/dev/null 2>&1; sleep 1
agent-browser screenshot /home/z/my-project/download/study-premium-desktop.png >/dev/null 2>&1 && ok "desktop screenshot" || bad "desktop screenshot"

echo "=== mobile 390x844 ==="
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
OV=$(agent-browser eval "(() => { const d=document.documentElement; return 'scrollWidth='+d.scrollWidth+' clientWidth='+d.clientWidth; })()" 2>/dev/null)
echo "overflow: $OV"
SW=$(echo "$OV" | rg -o "scrollWidth=(\d+)" -r '$1'); CW=$(echo "$OV" | rg -o "clientWidth=(\d+)" -r '$1')
if [ -n "$SW" ] && [ -n "$CW" ] && [ "$SW" -le "$CW" ]; then ok "mobile overflowX = 0 ($SW <= $CW)"; else bad "mobile overflow: $OV"; fi
agent-browser screenshot /home/z/my-project/download/study-premium-mobile.png >/dev/null 2>&1 && ok "mobile screenshot" || bad "mobile screenshot"

echo ""
echo "RESULT: $PASS passed, $FAIL failed"
[ "$FAIL" = "0" ]
