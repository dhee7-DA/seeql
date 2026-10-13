#!/bin/bash
# Batch B E2E v3 — eval-driven navigation with kit-header assertions.
cd /home/z/my-project

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 6
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()" >/dev/null
sleep 1

clickByText () {  # $1 = JS regex source, $2 = optional nth (default 0)
  agent-browser eval "(() => { const re = /$1/i; const n = $2 || 0; const b = [...document.querySelectorAll('button')].filter(x => re.test(x.textContent||''))[n]; if (b) { b.click(); return 'clicked: ' + (b.textContent||'').slice(0,40); } return 'NOT FOUND'; })()" | tr -d '\\'
}

for CO in Flipkart Alibaba Shopify eBay; do
  clickByText "Company screens" 0 >/dev/null   # universe (from anywhere)
  sleep 1.5
  clickByText "E-commerce & Marketplace" 0 >/dev/null  # domain card
  sleep 1.5
  echo "--- $CO: $(clickByText "$CO" 0)"     # company card on domain page
  sleep 2
  HDR=$(agent-browser eval "(() => { const h = [...document.querySelectorAll('h1,h2,h3')].find(x => (x.textContent||'').trim() === '$CO'); return h ? 'kit header OK' : 'KIT HEADER MISSING'; })()" | tr -d '"\\')
  SIZES=""
  for T in "The brief" "Master plan" "Theory" "MCQs" "Case studies" "Problems"; do
    TAB_REF=$(agent-browser snapshot 2>/dev/null | grep -o "$T[^\"]*\" \[ref=e[0-9]*" | grep -o 'e[0-9]*$' | head -1)
    agent-browser click "@$TAB_REF" >/dev/null 2>&1
    sleep 1.2
    SZ=$(agent-browser eval "(() => (document.querySelector('main')?.innerText||'').length)()" | tr -d '"\\')
    SIZES="$SIZES$SZ "
  done
  echo "    $HDR | tabs: $SIZES"
  if [ "$CO" = "Shopify" ]; then agent-browser screenshot /home/z/my-project/download/companies-shopify-kit.png 2>/dev/null | head -1; fi
done

# deep-link: Shopify -> Master plan -> topic chip -> LC dive
echo "--- deeplink: $(clickByText "Shopify" 0)"
sleep 2
clickByText "Master plan" 0 >/dev/null
sleep 1.5
echo "chip: $(clickByText "Email Engagement Funnel" 0)"
sleep 2.5
echo "deeplink check: $(agent-browser eval "(() => JSON.stringify({ diveMarkers: (document.body.innerText.match(/Approach|Show answer|Run query/gi)||[]).length }))()" | tr -d '\\')"
agent-browser screenshot /home/z/my-project/download/companies-deeplink-dive.png 2>/dev/null | head -1
