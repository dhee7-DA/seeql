#!/bin/bash
# E2E — Company Interview Universe wave-5 sweep: 64/64 kits live (8 domains x 8).
# Checks: wall stats, 8/8 full-kit cards per domain + 0 in-build, deep-walk of a
# new wave-5 kit through all 6 tabs, RichText rendering (bold/color/mono chips
# present, no literal ** markers leaking), mobile 390x844 overflow.
cd /home/z/my-project

agent-browser close --all 2>/dev/null || true
PORT=3000
(bun run dev > /tmp/dev-64.log 2>&1 &)
for i in $(seq 1 90); do curl -s -o /dev/null http://localhost:$PORT && break; sleep 1; done
echo "dev server up (curl $(curl -s -o /dev/null -w '%{http_code}' http://localhost:$PORT))"

agent-browser set viewport 1440 900
agent-browser open "http://localhost:$PORT/#learn" >/dev/null
sleep 6
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()" >/dev/null
sleep 1

clickByText () {
  agent-browser eval "(() => { const re = /$1/i; const n = $2 || 0; const b = [...document.querySelectorAll('button')].filter(x => re.test(x.textContent||''))[n]; if (b) { b.click(); return 'clicked: ' + (b.textContent||'').replace(/\s+/g,' ').slice(0,50); } return 'NOT FOUND'; })()" | tr -d '\\'
}

clickByText "Company screens" 0 >/dev/null; sleep 2
HDR=$(agent-browser eval "(() => (document.querySelector('main')?.innerText||'').slice(0,500))()" | tr -d '\\')
echo "$HDR" | grep -q "Company Interview Universe" && echo "PASS: universe header" || { echo "FAIL: universe header"; echo "$HDR"; }
echo "wall stat line: $(echo "$HDR" | grep -o '[0-9]* full kits' | head -1) ($(echo "$HDR" | grep -o '[0-9]* companies' | head -1))"

# every domain: 8/8 full kits, 0 in-build
DOMAINS=("E-commerce & Marketplace" "Ride-hailing & Mobility" "Streaming & Social" "Fintech & Payments" "Food & Quick-commerce" "Travel & Hospitality" "Banking & Capital Markets" "SaaS & Enterprise")
for D in "${DOMAINS[@]}"; do
  clickByText "Company screens" 0 >/dev/null; sleep 1.2
  clickByText "$D" 0 >/dev/null; sleep 1.2
  SNAP=$(agent-browser eval "(() => (document.querySelector('main')?.innerText||''))()" | tr -d '\\')
  FULL=$(echo "$SNAP" | grep -c "full kit")
  BUILD=$(echo "$SNAP" | grep -c "in build")
  echo "$D -> full-kit cards: $FULL, in-build: $BUILD $([ "$FULL" -ge 8 ] && [ "$BUILD" -eq 0 ] && echo PASS || echo CHECK)"
done
echo "---"

# deep-walk a NEW wave-5 kit (Wise, fintech) through all six tabs
clickByText "Company screens" 0 >/dev/null; sleep 1.2
clickByText "Fintech" 0 >/dev/null; sleep 1.2
echo "Wise: $(clickByText "Wise" 0)"; sleep 1.5
for T in "The brief" "Master plan" "Theory" "MCQs" "Case studies" "Problems"; do
  TAB_REF=$(agent-browser snapshot 2>/dev/null | grep -o "$T[^\"]*\" \[ref=e[0-9]*" | grep -o 'e[0-9]*$' | head -1)
  agent-browser click "@$TAB_REF" >/dev/null 2>&1; sleep 1
  SZ=$(agent-browser eval "(() => (document.querySelector('main')?.innerText||'').length)()" | tr -d '"\\')
  printf "%s:%s " "$T" "$SZ"
done
echo " <- Wise tab sizes"

# RichText rendering audit on the brief tab (Wise): strong/em/code present, no literal ** leak
TAB_REF=$(agent-browser snapshot 2>/dev/null | grep -o "The brief[^\"]*\" \[ref=e[0-9]*" | grep -o 'e[0-9]*$' | head -1)
agent-browser click "@$TAB_REF" >/dev/null 2>&1; sleep 1
RT=$(agent-browser eval "(() => { const m=document.querySelector('main'); const strong=m.querySelectorAll('strong').length; const code=m.querySelectorAll('code').length; const em=m.querySelectorAll('em').length; const leak=(m.innerText.match(/\\*\\*|\\{[a-z]+:/g)||[]).length; return 'strong:'+strong+' code:'+code+' em:'+em+' marker-leaks:'+leak; })()" | tr -d '"\\')
echo "RichText render (Wise brief tab): $RT"
echo "$RT" | grep -q "marker-leaks:0" && echo "PASS: no literal markers leak" || echo "CHECK: marker leak"
echo "$RT" | grep -vE "strong:0|code:0" | grep -q "strong:[1-9]" && echo "PASS: bold/color spans render" || echo "CHECK: no strong spans"

# second new kit sanity (Datadog, saas) — opens and has full tabs
clickByText "Company screens" 0 >/dev/null; sleep 1.2
clickByText "SaaS" 0 >/dev/null; sleep 1.2
echo "Datadog: $(clickByText "Datadog" 0)"; sleep 1.5
DD=$(agent-browser eval "(() => (document.querySelector('main')?.innerText||'').slice(0,200))()" | tr -d '\\')
echo "$DD" | grep -q "Datadog" && echo "PASS: datadog kit opens" || echo "FAIL: datadog"

# mobile overflow
agent-browser close --all 2>/dev/null || true
agent-browser set viewport 390 844
agent-browser open "http://localhost:$PORT/#learn" >/dev/null; sleep 6
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()" >/dev/null
agent-browser eval "(() => { const els=[...document.querySelectorAll('button')]; const el=els.find(e=>/Company screens/i.test(e.textContent)); if(el) el.click(); return 'ok'; })()" >/dev/null; sleep 2
OVF=$(agent-browser eval "(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)()" | tr -d '"\\')
echo "mobile overflowX: $OVF $([ "$OVF" = "0" ] && echo PASS || echo CHECK)"
agent-browser screenshot download/companies-final-64.png >/dev/null 2>&1
echo "E2E COMPLETE"
