#!/usr/bin/env bash
# Focused probe: does the scheduled tip ever appear? Stepped checks over 14s.
set -u
cd /home/z/my-project
BASE=http://localhost:3000
STAMP=$(date +%s)

agent-browser open "$BASE/#learn?fresh=tip-$STAMP" > /dev/null || exit 1
agent-browser wait --load networkidle > /dev/null
agent-browser set viewport 1280 900 > /dev/null

for t in 2 4 6 8 11 14; do
  sleep $t > /dev/null 2>&1 || sleep 1
  R=$(agent-browser eval "
(() => {
  const b = document.querySelector('[data-seeq-bubble]');
  const btn = document.querySelector('button[aria-label=\"SeeQ study buddy\"]');
  const notif = document.querySelector('[data-seeq] svg circle[fill=\"#2496e8\"]');
  return JSON.stringify({ t: '$t', mounted: !!btn, expanded: btn ? btn.getAttribute('aria-expanded') : null, tip: !!b, text: b ? b.textContent.trim().slice(0, 40) : null, notif: !!notif, collapsedSaved: localStorage.getItem('seeql.buddy.collapsed') });
})()
")
  echo "$R"
done
