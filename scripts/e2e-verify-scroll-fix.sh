#!/bin/bash
# Verify the scroll-to-top fix: mobile tap on a Practice-lab row must land
# the user at the top of the switched view (scrollY ~0, Universe header in view).
cd /home/z/my-project

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 390 844
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 6
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /skip tour/i.test(x.textContent||'')); if (b) b.click(); return localStorage.getItem('seeql.tour.v1') ? 'tour seen' : 'tour open'; })()"
sleep 1

# scroll down into the sidebar's Practice lab, tap Company screens
agent-browser eval "(() => { const lab = document.querySelector('[data-tour=\\\"lab\\\"]'); if (!lab) return 'no lab'; lab.scrollIntoView({block:'center'}); return 'at lab, scrollY=' + Math.round(window.scrollY); })()" | tr -d '\\'
echo ""
agent-browser eval "(() => { const lab = document.querySelector('[data-tour=\\\"lab\\\"]'); const row = [...(lab?.querySelectorAll('button')||[])][6]; row.click(); return 'tapped: ' + row.textContent.slice(0,26); })()" | tr -d '\\'
sleep 1.5
echo "RESULT:"
agent-browser eval "(() => JSON.stringify({ scrollYAfter: Math.round(window.scrollY), universeHeaderVisible: !!([...document.querySelectorAll('h1,h2')].find(h => /Company Interview Universe/.test(h.textContent||'') && h.getBoundingClientRect().top >= 0 && h.getBoundingClientRect().top < 844)), firstHeading: [...document.querySelectorAll('h1,h2')].map(h => h.textContent).find(t => /Universe/.test(t)) }))()" | tr -d '\\'
echo ""
agent-browser screenshot /home/z/my-project/download/fix-mobile-after-tap.png

# second tap target: a lesson row deep in a module must also land at top
agent-browser eval "(() => { const navs = [...document.querySelectorAll('nav')]; const lessonBtn = navs.map(n => [...n.querySelectorAll('button')]).flat().find(b => /lesson/i.test(b.textContent||'')); return lessonBtn ? 'found lesson row' : 'no lesson row (module collapsed?)'; })()" | tr -d '\\'
echo ""
echo "=== desktop sanity: rail tap still switches views (regression check) ==="
agent-browser set viewport 1440 900
sleep 1
agent-browser eval "(() => { const lab = document.querySelector('[data-tour=\\\"lab\\\"]'); const row = [...(lab?.querySelectorAll('button')||[])][3]; row.click(); return 'clicked: ' + row.textContent.slice(0,24); })()" | tr -d '\\'
sleep 1.5
agent-browser eval "(() => JSON.stringify({ scrollY: Math.round(window.scrollY), h: [...document.querySelectorAll('h1,h2')].slice(0,2).map(x => x.textContent.slice(0,36)) }))()" | tr -d '\\'
echo ""
