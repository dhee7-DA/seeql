#!/bin/bash
# Repro: "nothing opens under Practice lab" — three suspects:
#   A) desktop, tour seen/skipped — do lab rows switch views at all?
#   B) tour OPEN (first visit) — does the overlay eat lab-row clicks?
#   C) mobile 390x844 — view switches but page never scrolls to top?
cd /home/z/my-project

rm -f scripts/dev-repro.log
(setsid nohup bun run dev > scripts/dev-repro.log 2>&1 &)
for i in $(seq 1 90); do sleep 1; curl -s -o /dev/null http://localhost:3000 && break; done
echo "server: $(curl -s -o /dev/null -w '%{http_code}')"

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 5

# hook console errors
agent-browser eval "(() => { window.__errs = []; window.addEventListener('error', e => window.__errs.push(String(e.message))); return 'hooked'; })()" >/dev/null

echo "=== A) desktop, tour skipped: click every lab row, record what opens ==="
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) { b.click(); return 'skipped'; } return 'no tour'; })()"
sleep 1
agent-browser eval "(() => { const lab = document.querySelector('[data-tour=\\\"lab\\\"]'); const rows = [...(lab?.querySelectorAll('button')||[])]; const before = document.querySelector('h1,h2')?.textContent; window.__lab = rows.map(r => r.textContent.split('.')[0].slice(0,30)); return JSON.stringify({rows: window.__lab.length, before}); })()" | tr -d '\\'
echo ""
for i in 6 7; do  # row 6 = Interview prep, row 7 = Company screens (1-based in lab group)
  agent-browser eval "(() => { const lab = document.querySelector('[data-tour=\\\"lab\\\"]'); const rows = [...(lab?.querySelectorAll('button')||[])]; rows[$i-1]?.click(); return 'clicked ' + (rows[$i-1]?.textContent||'').slice(0,24); })()" | tr -d '\\'
  sleep 1.5
  agent-browser eval "(() => JSON.stringify({ h: [...document.querySelectorAll('h1,h2')].slice(0,2).map(h => h.textContent.slice(0,40)), errs: window.__errs.length }))()" | tr -d '\\'
  echo ""
done

echo "=== B) tour OPEN: does the overlay eat a lab-row click? ==="
agent-browser eval "(() => { localStorage.clear(); return 'cleared'; })()"
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 4
# walk tour forward until the lab step is spotlighted (data-tour-overlay present + lab in hole)
for i in $(seq 1 8); do
  ST=$(agent-browser eval "(() => { const ov = document.querySelector('[data-tour-overlay=\\\"1\\\"]'); if (!ov) return 'closed'; const card = ov.querySelector('[role=dialog]'); return (card?.textContent||'').slice(0,60); })()" | tr -d '\\')
  echo "tour state: $ST"
  case "$ST" in *practice\ lab*|*Practice*) break;; closed) break;; esac
  agent-browser eval "(() => { const b = [...document.querySelectorAll('[data-tour-next]')][0]; if (b) { b.click(); return 'next'; } return 'no-next'; })()" >/dev/null
  sleep 0.8
done
# NOW click a lab row underneath the overlay
agent-browser eval "(() => { const lab = document.querySelector('[data-tour=\\\"lab\\\"]'); const row = [...(lab?.querySelectorAll('button')||[])][6]; if (!row) return 'no row'; row.click(); return 'clicked ' + row.textContent.slice(0,24); })()" | tr -d '\\'
sleep 1.5
agent-browser eval "(() => JSON.stringify({ overlayStill: !!document.querySelector('[data-tour-overlay=\\\"1\\\"]'), h: [...document.querySelectorAll('h1,h2')].slice(0,2).map(h => h.textContent.slice(0,40)) }))()" | tr -d '\\'
echo ""

echo "=== C) mobile 390x844: tap lab row -> does the page scroll to the new view? ==="
agent-browser eval "(() => { localStorage.setItem('seeql.tour.v1','done'); return 'tour marked seen'; })()"
agent-browser set viewport 390 844
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 4
agent-browser eval "(() => { const lab = document.querySelector('[data-tour=\\\"lab\\\"]'); if (!lab) return 'no lab'; lab.scrollIntoView({block:'center'}); return 'scrolled to lab, scrollY=' + Math.round(window.scrollY); })()" | tr -d '\\'
echo ""
agent-browser eval "(() => { const lab = document.querySelector('[data-tour=\\\"lab\\\"]'); const row = [...(lab?.querySelectorAll('button')||[])][6]; row.click(); return 'tapped ' + row.textContent.slice(0,24); })()" | tr -d '\\'
sleep 1.5
agent-browser eval "(() => JSON.stringify({ scrollYAfter: Math.round(window.scrollY), docH: document.body.scrollHeight, viewTop: !!([...document.querySelectorAll('h1,h2')].find(h => /Company Interview Universe/.test(h.textContent||''))), errs: (window.__errs||[]).length }))()" | tr -d '\\'
echo ""
agent-browser screenshot /home/z/my-project/download/repro-mobile-after-tap.png
echo "done"
