#!/bin/bash
# Task 81 E2E: study guides for the 17 expansion sections.
# Single call: server boot + all server-dependent browser steps (background procs are reaped between calls).
cd /home/z/my-project

PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "PASS: $1"; }
bad()  { FAIL=$((FAIL+1)); echo "FAIL: $1"; }

echo "=== boot dev server ==="
(setsid bun run dev > /tmp/dev81.log 2>&1 &)
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

# skip tour if present (JS click; overlay blocks ref clicks)
SKIP=$(agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/skip tour/i.test(x.textContent||'')); if(b){b.click(); return 'skipped';} return 'none'; })()" 2>/dev/null)
echo "tour: $SKIP"
sleep 1

echo "=== open Module 12 band ==="
MOD=$(agent-browser eval "(() => { const t=[...document.querySelectorAll('button,div,a')].filter(x=>x.children.length<8 && /module\s*12/i.test(x.textContent||'')); const el=t[t.length-1]; if(el){el.click(); return 'clicked: '+(el.textContent||'').slice(0,60);} return 'not-found'; })()" 2>/dev/null)
echo "module: $MOD"
sleep 2

echo "=== count study toggles on band view (expect 36) ==="
CNT=$(agent-browser eval "(() => { const n=[...document.querySelectorAll('button')].filter(b=>/study guide — start here/i.test(b.textContent||'')).length; return String(n); })()" 2>/dev/null)
echo "toggles: $CNT"
[ "$CNT" = "36" ] && ok "36 study toggles render (19 old + 17 new)" || bad "expected 36 toggles, got $CNT"

echo "=== open the Streaks & Recency study guide ==="
OPEN=$(agent-browser eval "(() => { const btns=[...document.querySelectorAll('button')].filter(b=>/study guide — start here/i.test(b.textContent||'')); for(const b of btns){ const sec=b.closest('div[class]'); let scope=b.parentElement; let hit=null; let up=b; for(let i=0;i<6 && up;i++){ if(/streaks & recency/i.test(up.textContent||'')) { hit=up; break; } up=up.parentElement; } if(hit){ b.click(); return 'toggled streaks'; } } return 'section-not-found'; })()" 2>/dev/null)
echo "toggle: $OPEN"
sleep 1
STREAK=$(agent-browser eval "(() => { const all=[...document.querySelectorAll('div')]; const panel=all.find(d=>d.className&&String(d.className).includes&&String(d.className).indexOf('amber-400/[0.03]')>=0&&/time-shaped sql starts by fixing the grain/i.test(d.textContent||'')); if(panel){ const path=/the suggested path/i.test(panel.textContent||''); const why=/chargebacks keyed by charge_date/i.test(panel.textContent||''); const items=panel.querySelectorAll('ol > li').length; return 'intro+path='+path+' why='+why+' items='+items; } return 'panel-not-found'; })()" 2>/dev/null)
echo "streaks panel: $STREAK"
echo "$STREAK" | rg -q "intro\+path=true why=true items=5" && ok "Streaks & Recency guide: intro + suggested path + 5 whys render" || bad "Streaks panel assertion: $STREAK"

echo "=== open the Joins & Relationships (extra-joins) guide ==="
OPEN2=$(agent-browser eval "(() => { const btns=[...document.querySelectorAll('button')].filter(b=>/study guide — start here/i.test(b.textContent||'')); for(const b of btns){ let up=b; let hit=null; for(let i=0;i<6 && up;i++){ if(/joins & relationships/i.test(up.textContent||'')) { hit=up; break; } up=up.parentElement; } if(hit){ b.click(); return 'toggled extra-joins'; } } return 'section-not-found'; })()" 2>/dev/null)
echo "toggle: $OPEN2"
sleep 1
EJ=$(agent-browser eval "(() => { const els=[...document.querySelectorAll('div')]; const panel=els.find(d=>/beyond the core band, joins stop being/i.test(d.textContent||'') && /the suggested path/i.test(d.textContent||'')); if(panel){ const why=/ifnull\(npv, 0\)/i.test(panel.textContent||''); const items=panel.querySelectorAll('ol > li').length; return 'rendered why='+why+' items='+items; } return 'panel-not-found'; })()" 2>/dev/null)
echo "extra-joins panel: $EJ"
echo "$EJ" | rg -q "rendered why=true items=4" && ok "extra-joins guide: intro + 4 whys render (SqlProse survives IFNULL text)" || bad "extra-joins assertion: $EJ"

echo "=== screenshot desktop ==="
agent-browser screenshot /home/z/my-project/download/study-expansion-desktop.png >/dev/null 2>&1 && ok "desktop screenshot" || bad "desktop screenshot"

echo "=== mobile 390x844 ==="
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
OV=$(agent-browser eval "(() => { const d=document.documentElement; return 'scrollWidth='+d.scrollWidth+' clientWidth='+d.clientWidth; })()" 2>/dev/null)
echo "overflow: $OV"
SW=$(echo "$OV" | rg -o "scrollWidth=(\d+)" -r '$1'); CW=$(echo "$OV" | rg -o "clientWidth=(\d+)" -r '$1')
if [ -n "$SW" ] && [ -n "$CW" ] && [ "$SW" -le "$CW" ]; then ok "mobile overflowX = 0 ($SW <= $CW)"; else bad "mobile overflow: $OV"; fi
agent-browser screenshot /home/z/my-project/download/study-expansion-mobile.png >/dev/null 2>&1 && ok "mobile screenshot" || bad "mobile screenshot"

echo ""
echo "RESULT: $PASS passed, $FAIL failed"
[ "$FAIL" = "0" ]
