#!/bin/bash
# Theme QA sweep v2 — self-contained: boots the dev server, opens lesson 1
# Case Files, cycles all 8 themes (trigger via real CLI click, menu item
# via eval click), screenshots each on the chip/template view.
set -u
cd /home/z/my-project

bun run dev >> dev.log 2>&1 &
DEV_PID=$!
trap 'kill $DEV_PID 2>/dev/null' EXIT

echo "== waiting for server =="
ok=""
for i in $(seq 1 90); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/ 2>/dev/null)
  if [ "$code" = "200" ]; then ok=yes; break; fi
  sleep 1
done
if [ -z "$ok" ]; then echo "SERVER NEVER CAME UP"; exit 1; fi
echo "server ready"

agent-browser open http://localhost:3000/ || exit 1
agent-browser wait --load networkidle
agent-browser wait 1200

echo "== navigate =="
agent-browser find role button click --name "Start learning"
agent-browser wait 2000
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/^1\s*Databases, tables/.test((x.textContent||'').trim())); if(!b) return 'lesson btn NOT FOUND'; b.click(); return 'lesson1 clicked'; })()"
agent-browser wait 1800
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/Case Files/.test(x.textContent||'')); if(!b) return 'case tab NOT FOUND'; b.click(); return b.textContent.trim().slice(0,30); })()"
agent-browser wait 1200
agent-browser scroll down 420
agent-browser wait 400

declare -A NAME=(
  [onyx]="Onyx & Gold"
  [noir-rose]="Noir & Rose"
  [plum-haze]="Plum Haze"
  [ember]="Ember"
  [cream-plum]="Cream & Plum"
  [blush]="Blush"
  [sage]="Sage"
  [lavender-fog]="Lavender Fog"
)
ORDER="onyx noir-rose plum-haze ember cream-plum blush sage lavender-fog"

for id in $ORDER; do
  echo "== theme: $id =="
  agent-browser find first "button[aria-label^='Change theme']" click
  agent-browser wait 600
  agent-browser eval "(() => { const m=[...document.querySelectorAll('[role=menuitem]')].find(x=>x.textContent.includes('${NAME[$id]}')); if(!m) return 'menuitem NOT FOUND'; m.click(); return 'ok'; })()"
  agent-browser wait 900
  agent-browser eval "document.documentElement.className"
  agent-browser eval "(() => { const el=[...document.querySelectorAll('span')].find(x=>/case file/i.test(x.textContent)&&x.className.includes('sky')); const body=getComputedStyle(document.body); return JSON.stringify({badge: el?getComputedStyle(el).color:'n/a', canvas: body.backgroundColor}); })()"
  agent-browser screenshot "/home/z/my-project/scripts/qa-th-$id.png"
done

echo "DONE"
