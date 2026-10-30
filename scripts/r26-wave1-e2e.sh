#!/bin/bash
# Wave 1 figures E2E — verify the 15 new L58-L64 figures render on /figure-audit
cd /home/z/my-project

# fresh standalone server on :3100 (build output already copied)
pkill -f "standalone/server" 2>/dev/null; sleep 1
rm -f scripts/r26-wave1.log
(setsid nohup node .next/standalone/server.js > scripts/r26-wave1.log 2>&1 & env PORT=3100 HOSTNAME=127.0.0.1 node .next/standalone/server.js > scripts/r26-wave1.log 2>&1 &)
sleep 2
# the env-less attempt may have grabbed default port; ensure 3100 is live
if ! curl -s -o /dev/null http://127.0.0.1:3100; then
  pkill -f "standalone/server" 2>/dev/null; sleep 1
  (setsid nohup env PORT=3100 HOSTNAME=127.0.0.1 node .next/standalone/server.js > scripts/r26-wave1.log 2>&1 &)
fi
for i in $(seq 1 60); do
  sleep 1
  curl -s -o /dev/null http://127.0.0.1:3100 && break
done
echo "server: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3100)"

agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1280 900

shoot () {
  local name="$1"; local ids="$2"
  agent-browser open "http://127.0.0.1:3100/figure-audit?ids=$ids" >/dev/null
  sleep 4
  # count MISSING boxes — must be 0
  local missing=$(agent-browser eval "document.querySelectorAll('[data-missing]').length" 2>/dev/null | tr -d '"')
  local mounted=$(agent-browser eval "document.querySelectorAll('[data-fig]').length" 2>/dev/null | tr -d '"')
  echo "$name: mounted=$mounted missing=$missing"
  agent-browser screenshot "scripts/shots/r26-$name.png" >/dev/null
  # scroll to bottom for lazy second half, second shot
  agent-browser eval "window.scrollTo(0, document.body.scrollHeight)" >/dev/null
  sleep 2
  agent-browser screenshot "scripts/shots/r26-$name-b.png" >/dev/null
}

shoot wave1a "l58-eval-order,l58-four-shapes,l58-group-rank,l59-three-ranks,l59-topn-per-group"
shoot wave1b "l60-lag-lead-edges,l60-mom-bridge,l61-rows-vs-range,l61-frame-zoo,l62-ntile-quartiles"
shoot wave1c "l62-share-of-total,l63-pattern-map,l63-dedupe-rn,l64-plan-tree,l64-seek-vs-scan"

echo "done"
