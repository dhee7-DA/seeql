#!/usr/bin/env bash
# One-shot live QA for 3D #8 — EXCEPT in space (den-3d-except).
# Opens lesson-20 in the learn app, verifies the scene's three HUD phases
# (trays -> subtraction -> reverse/moral), screenshots ribbons + reverse,
# tests replay + orbit, then stops the server. ONE bash call.
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

agent-browser close >/dev/null 2>&1
sleep 1
agent-browser open "http://localhost:3000" >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser wait 1500 >/dev/null 2>&1

echo "== enter learn -> module 3 -> lesson 20 =="
agent-browser eval "(() => { const el=document.querySelector('button.btn-glow'); el?.click(); return el?'in':'nobtn'; })()" >/dev/null
agent-browser wait 2500 >/dev/null 2>&1
agent-browser eval "(() => { const el=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Set Operations & CASE')); el?.click(); return el?'m3':'no'; })()" >/dev/null
agent-browser wait 1500 >/dev/null 2>&1
agent-browser eval "(() => { const el=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('20EXCEPT')); el?.click(); return el?'l20':'no'; })()" >/dev/null
agent-browser wait 2000 >/dev/null 2>&1
agent-browser eval "(() => { const svg=[...document.querySelectorAll('div[role=img]')].find(d=>(d.getAttribute('aria-label')||'').includes('rose removal row')); svg?.scrollIntoView({block:'center'}); return svg?'scene-found':'no-scene'; })()"

echo "== scene boot: canvas + phase 0 HUD =="
agent-browser wait 800 >/dev/null 2>&1
agent-browser eval "JSON.stringify({canvases:document.querySelectorAll('canvas').length, hud:[...document.querySelectorAll('div')].filter(d=>d.children.length===0&&d.textContent.includes('bars placed')).map(d=>d.textContent)[0] ?? null})"

echo "== poll phases: catch the removal ribbons mid-pass =="
for i in $(seq 1 14); do
  sleep 0.8
  r=$(agent-browser eval "(() => { const h=[...document.querySelectorAll('div')].filter(d=>d.children.length===0).map(d=>d.textContent).join('|'); if(h.includes('Rose ribbons')) return 'RIBBONS'; if(h.includes('Backwards: 4')) return 'REVERSE'; return 'wait'; })()" 2>/dev/null)
  echo "t=$i $r"
  [ "$r" = '"RIBBONS"' ] && { agent-browser screenshot scripts/qa-exc-ribbons.png >/dev/null 2>&1; break; }
done
for i in $(seq 1 16); do
  sleep 1.2
  r=$(agent-browser eval "(() => { const h=[...document.querySelectorAll('div')].filter(d=>d.children.length===0).map(d=>d.textContent).join('|'); return h.includes('Backwards: 4') ? 'REVERSE' : 'wait'; })()" 2>/dev/null)
  [ "$r" = '"REVERSE"' ] && break
done
agent-browser screenshot scripts/qa-exc-1.png >/dev/null 2>&1

echo "== reverse state: HUD + replay button + survivors wired =="
agent-browser eval "(() => { const wrap=[...document.querySelectorAll('div[role=img]')].find(d=>(d.getAttribute('aria-label')||'').includes('rose removal row')); const hud=[...document.querySelectorAll('div')].map(d=>d.textContent).find(t=>t&&t.includes('Backwards: 4')); const btn=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('replay EXCEPT')); return JSON.stringify({reverseHud:!!hud,replayBtn:!!btn,canvas:wrap?!!wrap.querySelector('canvas'):false}); })()"

echo "== replay: HUD returns to trays =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('replay EXCEPT')); b?.click(); return 'replayed'; })()" >/dev/null
agent-browser wait 1500 >/dev/null 2>&1
agent-browser eval "(() => { const h=[...document.querySelectorAll('div')].filter(d=>d.children.length===0&&d.textContent.includes('bars placed')).map(d=>d.textContent)[0]; return h? 'phase0-restored:'+h : 'no-phase0'; })()"

echo "== orbit drag then let it finish for the reverse shot =="
agent-browser mouse move 640 300 >/dev/null 2>&1
agent-browser mouse down left >/dev/null 2>&1
agent-browser mouse move 820 260 >/dev/null 2>&1
agent-browser mouse up left >/dev/null 2>&1
agent-browser wait 2500 >/dev/null 2>&1
agent-browser screenshot scripts/qa-exc-orbit.png >/dev/null 2>&1
for i in $(seq 1 12); do
  sleep 1.5
  r=$(agent-browser eval "(() => { const h=[...document.querySelectorAll('div')].map(d=>d.textContent).find(t=>t&&t.includes('Backwards: 4')); return h?'REVERSE':'wait'; })()" 2>/dev/null)
  [ "$r" = '"REVERSE"' ] && break
done
agent-browser screenshot scripts/qa-exc-2.png >/dev/null 2>&1

echo "== lesson renders the lead-in paragraph =="
agent-browser eval "(() => { const p=[...document.querySelectorAll('p')].find(x=>x.textContent.includes('The same EXCEPT, in space')); return p?'lead-in-found':'no-lead-in'; })()"

echo "== INNER regression: module 2 -> lesson 10 still has its 3D canvas =="
agent-browser eval "(() => { const el=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Joins & Relationships')); el?.click(); return el?'m2':'no'; })()" >/dev/null
agent-browser wait 1500 >/dev/null 2>&1
agent-browser eval "(() => { const el=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('10INNER JOIN')); el?.click(); return el?'l10':'no'; })()" >/dev/null
agent-browser wait 2500 >/dev/null 2>&1
agent-browser eval "(() => { const wraps=[...document.querySelectorAll('div[role=img]')].filter(d=>(d.getAttribute('aria-label')||'').startsWith('Interactive 3D scene')); return JSON.stringify({l10Canvases:document.querySelectorAll('canvas').length, scenes:wraps.length}); })()"

echo "== final page errors =="
agent-browser errors
echo "== done =="
