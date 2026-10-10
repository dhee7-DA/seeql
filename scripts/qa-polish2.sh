#!/usr/bin/env bash
# One-shot live QA for playground polish round 2 (den-playground-2).
# Verifies: QueryFlowSvg OUT dot-field bookend, RowFunnel "folds → N" label,
# SchemaView query-touch glow ("in query" badges + count bars + caption),
# SampleGallery amber JOIN nodes in the mini schematics. ONE bash call.
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

open_tab() {
  for i in $(seq 1 20); do
    ref=$(agent-browser snapshot 2>/dev/null | grep -o "tab \"$1[^\"]*\" \[selected, ref=e[0-9]*\]\|tab \"$1[^\"]*\" \[ref=e[0-9]*\]" | head -1 | grep -o 'ref=e[0-9]*' | cut -d= -f2)
    [ -n "$ref" ] && break
    sleep 1
  done
  [ -n "$ref" ] || { echo "no $1 tab"; return 1; }
  agent-browser click "$ref" >/dev/null 2>&1
  agent-browser wait 1200 >/dev/null 2>&1
  return 0
}

agent-browser close >/dev/null 2>&1
sleep 1
agent-browser open "http://localhost:3000/#playground" >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser wait 5000 >/dev/null 2>&1

echo "== page errors after boot =="
agent-browser errors

echo "== QueryFlowSvg: OUT dot-field bookend =="
open_tab "Pipeline"
agent-browser eval "(() => { const svg=document.querySelector('svg[aria-label^=\"Query flow\"]'); if(!svg) return 'no-flow'; const texts=[...svg.querySelectorAll('text')].map(t=>t.textContent||''); const rowTexts=texts.filter(t=>/rows$/.test(t)); const emerald=[...svg.querySelectorAll('text.fill-emerald-300\\\\/90')].map(t=>t.textContent); const dots=svg.querySelectorAll('circle').length; return JSON.stringify({rowTexts, emeraldOut:emerald, circles:dots}); })()"

echo "== RowFunnel: fold label + stage clicks =="
agent-browser eval "(() => { const svg=document.querySelector('svg[aria-label^=\"Row funnel\"]'); if(!svg) return 'no-funnel'; const texts=[...svg.querySelectorAll('text')].map(t=>t.textContent||''); const fold=texts.find(t=>t.startsWith('folds →')); const minus=texts.filter(t=>/^−/.test(t)); return JSON.stringify({fold: fold ?? null, stillDrops: minus}); })()"
agent-browser screenshot scripts/qa-pol2-pipeline.png >/dev/null 2>&1

echo "== SchemaView: query-touch glow =="
open_tab "Schema"
agent-browser eval "(() => { const t=document.body.innerText; const badges=[...document.querySelectorAll('span')].filter(s=>s.textContent.trim().toUpperCase()==='IN QUERY').length; const bars=document.querySelectorAll('div.h-\\\\[3px\\\\]').length; return JSON.stringify({caption:/this query reads \\d of 5 tables/.test(t), badges, bars}); })()"
agent-browser screenshot scripts/qa-pol2-schema.png >/dev/null 2>&1

echo "== SampleGallery: amber JOIN nodes in the schematics =="
agent-browser eval "(() => { const btn=document.querySelector('button[aria-label=\"Load a sample query\"]'); btn?.click(); return btn?'open':'nobtn'; })()" >/dev/null
agent-browser wait 900 >/dev/null 2>&1
agent-browser eval "(() => { const amber=[...document.querySelectorAll('svg rect')].filter(r=>(r.getAttribute('class')||'').includes('fill-amber-500')).length; const cards=[...document.querySelectorAll('button')].filter(b=>b.querySelector('svg') && b.textContent.includes('revenue') || b.querySelector('svg') && b.textContent.length>40).length; return JSON.stringify({amberJoinNodes: amber, sampleCards: cards}); })()"
agent-browser screenshot scripts/qa-pol2-gallery.png >/dev/null 2>&1

echo "== final page errors =="
agent-browser errors
echo "== done =="
