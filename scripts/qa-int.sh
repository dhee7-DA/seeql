#!/usr/bin/env bash
# One-shot live QA for 3D #7 — INTERSECT in space (den-3d-intersect).
# Opens lesson-19 in the learn app, verifies the scene's three HUD phases
# (trays -> match pass -> moral), screenshots the ribbons + moral, tests
# replay + orbit, then stops the server. ONE bash call.
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

echo "== enter learn -> module 3 -> lesson 19 =="
agent-browser eval "(() => { const el=document.querySelector('button.btn-glow'); el?.click(); return el?'in':'nobtn'; })()" >/dev/null
agent-browser wait 2500 >/dev/null 2>&1
agent-browser eval "(() => { const el=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Set Operations & CASE')); el?.click(); return el?'m3':'no'; })()" >/dev/null
agent-browser wait 1500 >/dev/null 2>&1
agent-browser eval "(() => { const el=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('19INTERSECT')); el?.click(); return el?'l19':'no'; })()" >/dev/null
agent-browser wait 2000 >/dev/null 2>&1
agent-browser eval "(() => { const svg=[...document.querySelectorAll('div[role=img]')].find(d=>(d.getAttribute('aria-label')||'').startsWith('Interactive 3D scene: 15 delivered-order')); svg?.scrollIntoView({block:'center'}); return svg?'scene-found':'no-scene'; })()"

echo "== scene boot: canvas + phase 0 HUD =="
agent-browser wait 800 >/dev/null 2>&1
agent-browser eval "JSON.stringify({canvases:document.querySelectorAll('canvas').length, hud:[...document.querySelectorAll('div')].filter(d=>d.children.length===0&&d.textContent.includes('bars placed')).map(d=>d.textContent)[0] ?? null})"

echo "== poll phases: catch the ribbons mid-pass =="
for i in $(seq 1 14); do
  sleep 0.8
  r=$(agent-browser eval "(() => { const h=[...document.querySelectorAll('div')].filter(d=>d.children.length===0).map(d=>d.textContent).join('|'); if(h.includes('asks the other arm')) return 'RIBBONS'; if(h.includes('distinct by definition')) return 'MORAL'; return 'wait'; })()" 2>/dev/null)
  echo "t=$i $r"
  [ "$r" = '"RIBBONS"' ] && { agent-browser screenshot scripts/qa-int-ribbons.png >/dev/null 2>&1; break; }
done
for i in $(seq 1 12); do
  sleep 1.2
  r=$(agent-browser eval "(() => { const h=[...document.querySelectorAll('div')].filter(d=>d.children.length===0).map(d=>d.textContent).join('|'); return h.includes('distinct by definition') ? 'MORAL' : 'wait'; })()" 2>/dev/null)
  [ "$r" = '"MORAL"' ] && break
done
agent-browser screenshot scripts/qa-int-1.png >/dev/null 2>&1

echo "== moral state: slab text + panel + podium =="
agent-browser eval "(() => { const wrap=[...document.querySelectorAll('div[role=img]')].find(d=>(d.getAttribute('aria-label')||'').startsWith('Interactive 3D scene: 15 delivered-order')); const hud=[...document.querySelectorAll('div')].map(d=>d.textContent).find(t=>t&&t.includes('distinct by definition')); const btn=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('replay INTERSECT')); return JSON.stringify({moralHud:!!hud,replayBtn:!!btn,canvas:wrap?!!wrap.querySelector('canvas'):false}); })()"

echo "== replay: HUD returns to trays =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('replay INTERSECT')); b?.click(); return 'replayed'; })()" >/dev/null
agent-browser wait 1500 >/dev/null 2>&1
agent-browser eval "(() => { const h=[...document.querySelectorAll('div')].filter(d=>d.children.length===0&&d.textContent.includes('bars placed')).map(d=>d.textContent)[0]; return h? 'phase0-restored:'+h : 'no-phase0'; })()"

echo "== orbit drag then let it finish for the moral shot =="
agent-browser mouse move 640 300 >/dev/null 2>&1
agent-browser mouse down left >/dev/null 2>&1
agent-browser mouse move 820 260 >/dev/null 2>&1
agent-browser mouse up left >/dev/null 2>&1
agent-browser wait 2500 >/dev/null 2>&1
agent-browser screenshot scripts/qa-int-orbit.png >/dev/null 2>&1
for i in $(seq 1 10); do
  sleep 1.5
  r=$(agent-browser eval "(() => { const h=[...document.querySelectorAll('div')].map(d=>d.textContent).find(t=>t&&t.includes('distinct by definition')); return h?'MORAL':'wait'; })()" 2>/dev/null)
  [ "$r" = '"MORAL"' ] && break
done
agent-browser screenshot scripts/qa-int-2.png >/dev/null 2>&1

echo "== lesson renders the lead-in paragraph + census =="
agent-browser eval "(() => { const p=[...document.querySelectorAll('p')].find(x=>x.textContent.includes('The same INTERSECT, in space')); return p?'lead-in-found':'no-lead-in'; })()"

echo "== final page errors =="
agent-browser errors
echo "== done =="
