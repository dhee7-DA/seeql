#!/bin/bash
# Ensure the standalone SeeQL server is up; start it detached if not.
# Usage: bash scripts/ensure-server.sh  (prints status, exits 0 if 200)
cd /home/z/my-project
if curl -s -o /dev/null --max-time 2 http://localhost:3000/; then
  echo "server: already up"
  exit 0
fi
setsid nohup bun run dev > /dev/null 2>&1 < /dev/null &
for i in $(seq 1 45); do
  sleep 1
  if curl -s -o /dev/null --max-time 2 http://localhost:3000/; then
    echo "server: up after ${i}s"
    exit 0
  fi
done
echo "server: FAILED to start"
exit 1
