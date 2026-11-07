#!/bin/bash
# Boot the standalone server, wait for 200, then exec the given command.
cd /home/z/my-project
setsid nohup env PORT=3000 node .next/standalone/server.js > /tmp/server.log 2>&1 < /dev/null &
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:3000/ 2>/dev/null)
  if [ "$code" = "200" ]; then break; fi
  sleep 0.5
done
echo "server: $code"
exec "$@"
