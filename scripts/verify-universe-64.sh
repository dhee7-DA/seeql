#!/bin/bash
# DOM-first verification: 64 companies across 8 domains, per-domain card census
# via button-text matching (innerTex greps undercount — worklog quirk note),
# DOM-predicate kit opens (Wise + Datadog), mobile overflow recheck.
cd /home/z/my-project
PORT=3000

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:$PORT/#learn" >/dev/null; sleep 5
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()" >/dev/null; sleep 1

domClick () {  # $1 = JS regex source for button text
  agent-browser eval "(() => { const re = /$1/i; const b = [...document.querySelectorAll('button')].find(x => re.test((x.textContent||'').trim())); if (b) { b.click(); return 'ok'; } return 'NOT FOUND'; })()" | tr -d '"\\'
}

domClick "Company screens"; sleep 2
UNI=$(agent-browser eval "(() => (document.querySelector('main')?.innerText||'').slice(0,300))()" | tr -d '"\\')
echo "wall: $(echo "$UNI" | grep -o '[0-9]* full kits' | head -1) / $(echo "$UNI" | grep -o '[0-9]* companies' | head -1)"

check_domain () {  # $1 domain regex, $2 comma-separated company names
  domClick "Company screens"; sleep 1.2
  domClick "$1"; sleep 1.5
  RES=$(agent-browser eval "(() => { const names = \"$2\".split(','); const txt = [...document.querySelectorAll('main button')].map(b => (b.textContent||'').trim()); const found = names.filter(n => txt.some(t => t === n || t.startsWith(n))); return found.length + '/8'; })()" | tr -d '"\\')
  echo "$1: cards found $RES $([ "$RES" = "8/8" ] && echo PASS || echo CHECK)"
}

check_domain "E-commerce & Marketplace" "Amazon,Flipkart,Alibaba,Shopify,eBay,Walmart,Etsy,Myntra"
check_domain "Ride-hailing" "Uber,Lyft,Ola,Bolt,Grab,DiDi,Careem,Lime"
check_domain "Streaming & Social" "Netflix,Spotify,YouTube,Meta,TikTok,Reddit,Pinterest,LinkedIn"
check_domain "Fintech" "Stripe,PayPal,Visa,Revolut,Block,Adyen,Wise,Robinhood"
check_domain "Food & Quick-commerce" "DoorDash,Swiggy,Zomato,Instacart,Deliveroo,Grubhub,Just Eat,Domino"
check_domain "Travel & Hospitality" "Airbnb,Booking,Expedia,OYO,MakeMyTrip,Agoda,Marriott,RyanAir"
check_domain "Banking" "Goldman,JPMorgan,Capital One,Wells Fargo,HSBC,American Express,Citi,Barclays"
check_domain "SaaS" "Salesforce,Slack,Zoom,Atlassian,Snowflake,HubSpot,Datadog,Twilio"
echo "---"

# open two wave-5 kits via exact-text DOM predicate
open_kit () {
  domClick "Company screens"; sleep 1.2
  domClick "$1"; sleep 1.2
  RES=$(agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent||'').trim() === '$2'); if (b) { b.click(); return 'opened'; } return 'NOT FOUND'; })()" | tr -d '"\\')
  sleep 1.5
  HDR=$(agent-browser eval "(() => (document.querySelector('main h2')?.textContent||''))()" | tr -d '"\\')
  TABS=$(agent-browser eval "(() => [...document.querySelectorAll('[role=tablist] button')].length)()" | tr -d '"\\')
  echo "$2: $RES (h2='$HDR', tabs=$TABS)"
}
open_kit "Fintech" "Wise"
open_kit "SaaS" "Datadog"
echo "---"

# mobile overflow, fresh session
agent-browser close --all 2>/dev/null || true
agent-browser set viewport 390 844
agent-browser open "http://localhost:$PORT/#learn" >/dev/null; sleep 6
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()" >/dev/null; sleep 1
agent-browser eval "(() => { const el = [...document.querySelectorAll('button')].find(e => /Company screens/i.test(e.textContent)); if (el) el.click(); return 'ok'; })()" >/dev/null; sleep 2
OVF=$(agent-browser eval "(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)()" | tr -d '"\\')
echo "mobile overflowX: $OVF $([ "$OVF" = "0" ] && echo PASS || echo CHECK)"
agent-browser screenshot download/companies-final-64.png >/dev/null 2>&1
echo "VERIFY COMPLETE"
