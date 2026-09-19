#!/usr/bin/env bash
# One-shot browser QA for the AI Mentor (enhancement #1 of the next wave).
# Everything runs inside a single call — the sandbox reaps background
# processes when the Bash tool call ends, so the dev server is private (3101).
set -u
cd /home/z/my-project

PORT=3101
BASE=http://localhost:$PORT
OUT=/home/z/my-project/scripts

# 1. private dev server
setsid bash -c "exec bunx next dev -p $PORT >> /home/z/my-project/scripts/tmp/qa-dev-mentor.log 2>&1" < /dev/null > /dev/null 2>&1 &
for i in $(seq 1 45); do
  sleep 2
  curl -s -o /dev/null "$BASE" && break
done
echo "server: $(curl -s -o /dev/null -w '%{http_code}' "$BASE")"

# 2. API smoke — grounding + tier check happen server-side; here we verify wiring
SMOKE=$(curl -s --max-time 90 -X POST "$BASE/api/mentor" -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"In one sentence: which table links customers to their invoices?"}],"context":{"hintLevel":null}}')
echo "smoke: $(echo "$SMOKE" | head -c 300)"

# 3. browser — open learn view
agent-browser open "$BASE/#learn" || exit 1
agent-browser wait --load networkidle
agent-browser errors --clear > /dev/null 2>&1
sleep 2

echo "=== 4. open AI Mentor from the sidebar"
agent-browser eval "
(() => {
  const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('AI Mentor'));
  if (!b) return 'btn-missing';
  b.click(); return 'ok';
})()
"
sleep 1
agent-browser eval "
(() => {
  const ta = document.querySelector('main textarea');
  const greeting = [...document.querySelectorAll('main p')].some(p => p.textContent.includes('SQL mentor'));
  return JSON.stringify({ inputPresent: !!ta, greetingPresent: greeting });
})()
"

echo "=== 5. round-trip: ask a schema question"
agent-browser eval "
(() => {
  const ta = document.querySelector('main textarea');
  if (!ta) return 'no-input';
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  setter.call(ta, 'In one sentence: which table links customers to their invoices?');
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  return 'typed';
})()
"
agent-browser eval "
(() => {
  const send = [...document.querySelectorAll('main button')].find(b => b.textContent.trim() === 'Send');
  if (!send) return 'no-send';
  send.click(); return 'sent';
})()
"
REPLY="none"
for i in $(seq 1 30); do
  sleep 3
  REPLY=$(agent-browser eval "
(() => {
  const bubbles = [...document.querySelectorAll('main .rounded-bl-sm')];
  const last = bubbles[bubbles.length - 1];
  return last ? last.textContent.slice(0, 200) : 'none';
})()
" 2>/dev/null | tr -d '"')
  if [ "$REPLY" != "none" ] && [ ${#REPLY} -gt 40 ]; then break; fi
done
echo "reply: $REPLY"
agent-browser screenshot "$OUT/qa-mentor-chat.png"

echo "=== 6. context attach: failing interview run"
agent-browser eval "
(() => {
  const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Interview prep'));
  if (!b) return 'btn-missing';
  b.click(); return 'ok';
})()
"
sleep 1
agent-browser eval "
(() => {
  const hdr = [...document.querySelectorAll('button[aria-expanded=false]')][0];
  if (!hdr) return 'no-collapsed-rung';
  hdr.click(); return 'expanded';
})()
"
sleep 1
agent-browser eval "
(() => {
  const ta = document.querySelector('main textarea');
  if (!ta) return 'no-editor';
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  setter.call(ta, 'SELECT nope FROM customers');
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  return 'typed';
})()
"
agent-browser eval "
(() => {
  const run = [...document.querySelectorAll('main button')].find(b => b.textContent.includes('Run it'));
  if (!run) return 'no-run';
  run.click(); return 'ran';
})()
"
sleep 3

echo "=== 7. mentor sees the failure"
agent-browser eval "
(() => {
  const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('AI Mentor'));
  if (!b) return 'btn-missing';
  b.click(); return 'ok';
})()
"
sleep 1
agent-browser eval "
(() => {
  const card = [...document.querySelectorAll('main pre')].map(p => p.textContent).find(t => t && t.includes('nope'));
  const chip = [...document.querySelectorAll('main p')].some(p => p.textContent.includes('Interview prep'));
  const err = [...document.querySelectorAll('main p')].some(p => /no such column/i.test(p.textContent));
  return JSON.stringify({ sqlAttached: !!card, sourceChip: chip, errorShown: err });
})()
"
agent-browser screenshot "$OUT/qa-mentor-context.png"

echo "=== 8. tiered hint via rung-1 button"
agent-browser eval "
(() => {
  const b = [...document.querySelectorAll('main button')].find(x => x.textContent.includes('1 · Nudge'));
  if (!b) return 'no-nudge-btn';
  b.click(); return 'clicked';
})()
"
NUDGE="none"
for i in $(seq 1 30); do
  sleep 3
  NUDGE=$(agent-browser eval "
(() => {
  const bubbles = [...document.querySelectorAll('main .rounded-bl-sm')];
  const last = bubbles[bubbles.length - 1];
  return last ? last.textContent.slice(0, 220) : 'none';
})()
" 2>/dev/null | tr -d '"')
  if [ "$NUDGE" != "none" ] && [ ${#NUDGE} -gt 40 ]; then break; fi
done
echo "nudge: $NUDGE"
agent-browser screenshot "$OUT/qa-mentor-hint.png"

echo "=== 9. page errors"
agent-browser errors
echo "=== done"
