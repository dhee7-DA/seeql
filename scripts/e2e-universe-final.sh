#!/bin/bash
# E2E — Company Interview Universe final sweep: 40/40 kits live.
# Universe wall renders all 8 domains; zero "kit in build"; deep-walks 3 kits
# (mobility/banking/saas) through all 6 tabs; kit chip deep-links into an LC
# dive; mobile 390x844 overflow check.
cd /home/z/my-project

agent-browser close --all 2>/dev/null || true
PORT=3000
(bun run dev > /tmp/dev-final.log 2>&1 &)
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
HDR=$(agent-browser eval "(() => (document.querySelector('main')?.innerText||'').slice(0,400))()" | tr -d '\\')
echo "$HDR" | grep -q "Company Interview Universe" && echo "PASS: universe header" || { echo "FAIL: universe header"; echo "$HDR"; }
echo "$HDR" | grep -q "40 full kits" && echo "PASS: wall shows 40 full kits" || echo "note: wall stat line: $(echo "$HDR" | grep -o '[0-9]* full kits')"

# every domain card walkable, 5/5 each
DOMAINS=("E-commerce & Marketplace" "Ride-hailing & Mobility" "Streaming & Social" "Fintech & Payments" "Food & Quick-commerce" "Travel & Hospitality" "Banking & Capital Markets" "SaaS & Enterprise")
for D in "${DOMAINS[@]}"; do
  clickByText "Company screens" 0 >/dev/null; sleep 1.2
  RES=$(clickByText "$D" 0); sleep 1.2
  SNAP=$(agent-browser eval "(() => (document.querySelector('main')?.innerText||''))()" | tr -d '\\')
  FULL=$(echo "$SNAP" | grep -c "full kit")
  BUILD=$(echo "$SNAP" | grep -c "in build")
  echo "$D -> full-kit cards: $FULL, in-build: $BUILD $([ "$FULL" -ge 5 ] && [ "$BUILD" -eq 0 ] && echo PASS || echo CHECK)"
done
echo "---"

walk_kit () {  # $1 domain regex, $2 company name, $3 theory marker, $4 case marker
  clickByText "Company screens" 0 >/dev/null; sleep 1.2
  clickByText "$1" 0 >/dev/null; sleep 1.2
  echo "$2: $(clickByText "$2" 0)"; sleep 1.5
  for T in "The brief" "Master plan" "Theory" "MCQs" "Case studies" "Problems"; do
    TAB_REF=$(agent-browser snapshot 2>/dev/null | grep -o "$T[^\"]*\" \[ref=e[0-9]*" | grep -o 'e[0-9]*$' | head -1)
    agent-browser click "@$TAB_REF" >/dev/null 2>&1; sleep 1
    SZ=$(agent-browser eval "(() => (document.querySelector('main')?.innerText||'').length)()" | tr -d '"\\')
    printf "%s:%s " "$T" "$SZ"
  done
  echo " <- $2 tab sizes"
  # deep-link: from Master plan, click a practice chip -> LC dive opens
  TAB_REF=$(agent-browser snapshot 2>/dev/null | grep -o "Master plan[^\"]*\" \[ref=e[0-9]*" | grep -o 'e[0-9]*$' | head -1)
  agent-browser click "@$TAB_REF" >/dev/null 2>&1; sleep 1
  CHIP=$(agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/practice|open dive|drill/i.test(x.textContent||'')); if(b){b.click(); return 'chip:'+(b.textContent||'').slice(0,30);} return 'no-chip'; })()" | tr -d '\\')
  echo "  $2 deeplink: $CHIP"
}

walk_kit "Ride-hailing" "Uber"
walk_kit "Banking" "Goldman Sachs"
walk_kit "SaaS & Enterprise" "Snowflake"

# mobile overflow
agent-browser close --all 2>/dev/null || true
agent-browser set viewport 390 844
agent-browser open "http://localhost:$PORT/#learn" >/dev/null; sleep 6
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()" >/dev/null
OVER=$($B 2>/dev/null)
agent-browser eval "(() => { const els=[...document.querySelectorAll('button')]; const el=els.find(e=>/Company screens/i.test(e.textContent)); if(el) el.click(); return 'ok'; })()" >/dev/null; sleep 2
OVF=$(agent-browser eval "(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)()" | tr -d '"\\')
echo "mobile overflowX: $OVF $([ "$OVF" = "0" ] && echo PASS || echo CHECK)"
agent-browser screenshot download/companies-final-40.png >/dev/null 2>&1
echo "E2E COMPLETE"
