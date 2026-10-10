#!/usr/bin/env bash
# One-shot live QA for the step-scrubber batch (den-scrub). Verifies:
#   1. landing showcase — reel cycles to the INNER JOIN hero and its tiers
#      AUTOPLAY (step 0 -> 2 without interaction)
#   2. lesson-10 — j2-inner-match manual stepping (Next reveals the gate tier,
#      Back unmounts it, captions update)
#   3. lesson-12 — j4-left-join (3 dots) + j12-where-vs-on (4 dots) steppers,
#      3D canvas regression, j12 stepped to the final tier (Next disabled)
# then screenshots and stops the server. ONE bash call (sandbox reaps servers).
#
# Navigation ground truth: module toggles match /Joins & Relationships/;
# lesson buttons are glued ids like "10INNER JOIN mechanics"; the showcase reel
# starts on the WHERE figure — poll for INNER JOIN instead of assuming t0.
set -u
cd /home/z/my-project

bun run dev > /dev/null 2>&1 &
DEV_PID=$!
cleanup() { kill $DEV_PID 2>/dev/null; }
trap cleanup EXIT

for i in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || true)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "== server: $code after ${i}s =="
[ "$code" = "200" ] || { echo "server never came up"; exit 1; }

stepper_info() {
  local pre="$1"
  agent-browser eval "(() => { const svg=[...document.querySelectorAll('svg')].find(s=>(s.getAttribute('aria-label')||'').startsWith('${pre}')); if(!svg) return 'nosvg'; const wrap=svg.closest('div'); const dots=[...wrap.querySelectorAll('button')].filter(b=>/Go to step/.test(b.getAttribute('aria-label')||'')); const cur=[...wrap.querySelectorAll('button[aria-current=\"true\"]')][0]; const idx=cur?dots.indexOf(cur):0; const next=[...wrap.querySelectorAll('button')].find(b=>b.textContent.trim()==='Next'); const cap=wrap.querySelector('span.truncate'); return JSON.stringify({dots:dots.length,step:idx,hasNext:!!next,cap:cap?cap.textContent.slice(0,45):null}); })()"
}

stepper_click() {
  local pre="$1" btn="$2"
  agent-browser eval "(() => { const svg=[...document.querySelectorAll('svg')].find(s=>(s.getAttribute('aria-label')||'').startsWith('${pre}')); const wrap=svg.closest('div'); [...wrap.querySelectorAll('button')].find(b=>b.textContent.trim()==='${btn}')?.click(); return 'clicked ${btn}'; })()" >/dev/null
}

agent-browser close >/dev/null 2>&1
sleep 1

echo "== landing showcase: autoplay (poll for the INNER JOIN hero) =="
agent-browser open "http://localhost:3000" >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1
for i in $(seq 1 20); do
  r=$(agent-browser eval "(() => { const svg=[...document.querySelectorAll('svg')].find(s=>(s.getAttribute('aria-label')||'').startsWith('INNER JOIN keeps')); return svg?'found':'no'; })()" 2>/dev/null)
  [ "$r" = '"found"' ] && break
  sleep 1
done
echo "reel reached inner-join after ${i}s polls"
stepper_info "INNER JOIN keeps" | sed 's/^/t0 /'
sleep 2
stepper_info "INNER JOIN keeps" | sed 's/^/t2s-autoplay /'

echo "== enter learn, module 2, lesson 10 =="
agent-browser eval "(() => { const el=document.querySelector('button.btn-glow'); el?.click(); return el?'in':'nobtn'; })()" >/dev/null
agent-browser wait 2500 >/dev/null 2>&1
agent-browser eval "(() => { const el=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Joins & Relationships')); el?.click(); return el?'m2':'no'; })()" >/dev/null
agent-browser wait 1500 >/dev/null 2>&1
agent-browser eval "(() => { const el=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('10INNER JOIN mechanics')); el?.click(); return el?'l10':'no'; })()" >/dev/null
agent-browser wait 2500 >/dev/null 2>&1
agent-browser eval "(() => { const svg=[...document.querySelectorAll('svg')].find(s=>(s.getAttribute('aria-label')||'').startsWith('INNER JOIN keeps')); svg?.scrollIntoView({block:'center'}); return svg?'found':'gone'; })()" >/dev/null
agent-browser wait 800 >/dev/null 2>&1
echo "== j2-inner-match: Next -> final tier -> Back =="
stepper_info "INNER JOIN keeps"
stepper_click "INNER JOIN keeps" "Next"
agent-browser wait 700 >/dev/null 2>&1
stepper_info "INNER JOIN keeps"
agent-browser screenshot scripts/qa-scrub-1.png >/dev/null 2>&1
stepper_click "INNER JOIN keeps" "Back"
agent-browser wait 600 >/dev/null 2>&1
stepper_info "INNER JOIN keeps" | sed 's/^/after-back /'

echo "== lesson 12: two steppers + 3D canvas =="
agent-browser eval "(() => { const el=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('12LEFT JOIN')); el?.click(); return el?'l12':'no'; })()" >/dev/null
agent-browser wait 2500 >/dev/null 2>&1
agent-browser eval "(() => { const s1=[...document.querySelectorAll('svg')].find(s=>(s.getAttribute('aria-label')||'').startsWith('LEFT JOIN carries customers')); const s2=[...document.querySelectorAll('svg')].find(s=>(s.getAttribute('aria-label')||'').startsWith('In ON the region filter keeps')); const f=(s)=>s?[...s.closest('div').querySelectorAll('button')].filter(b=>/Go to step/.test(b.getAttribute('aria-label')||'')).length:0; return JSON.stringify({leftDots:f(s1),whereOnDots:f(s2),canvases:document.querySelectorAll('canvas').length}); })()"
agent-browser eval "(() => { const svg=[...document.querySelectorAll('svg')].find(s=>(s.getAttribute('aria-label')||'').startsWith('In ON the region filter keeps')); svg?.scrollIntoView({block:'center'}); return svg?'found':'gone'; })()" >/dev/null
agent-browser wait 800 >/dev/null 2>&1
echo "== j12-where-vs-on: jump to the final tier =="
agent-browser eval "(() => { const svg=[...document.querySelectorAll('svg')].find(s=>(s.getAttribute('aria-label')||'').startsWith('In ON the region filter keeps')); const wrap=svg.closest('div'); const dots=[...wrap.querySelectorAll('button')].filter(b=>/Go to step/.test(b.getAttribute('aria-label')||'')); const cur=[...wrap.querySelectorAll('button[aria-current=\"true\"]')][0]; const step=cur?dots.indexOf(cur):0; for(let k=step;k<3;k++){[...wrap.querySelectorAll('button')].find(b=>b.textContent.trim()==='Next')?.click();} return 'jumped'; })()" >/dev/null
agent-browser wait 800 >/dev/null 2>&1
agent-browser eval "(() => { const svg=[...document.querySelectorAll('svg')].find(s=>(s.getAttribute('aria-label')||'').startsWith('In ON the region filter keeps')); const wrap=svg.closest('div'); const dots=[...wrap.querySelectorAll('button')].filter(b=>/Go to step/.test(b.getAttribute('aria-label')||'')); const cur=[...wrap.querySelectorAll('button[aria-current=\"true\"]')][0]; const step=cur?dots.indexOf(cur):0; return JSON.stringify({step,onCol:svg.textContent.includes('in ON — shapes the match'),whereCol:svg.textContent.includes('in WHERE — filters rows'),result:svg.textContent.includes('45 rows'),nextDisabled:[...wrap.querySelectorAll('button')].find(b=>b.textContent.trim()==='Next')?.disabled}); })()"
agent-browser screenshot scripts/qa-scrub-2.png >/dev/null 2>&1

echo "== final page errors =="
agent-browser errors
echo "== done =="
