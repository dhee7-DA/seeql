#!/bin/bash
# Figure audit sweep: screenshot figures solo via /figure-audit (tall viewport so whileInView fires).
# Usage: bash scripts/audit-sweep.sh <outprefix> <id1> <id2> ...
OUT=/home/z/my-project/scripts/shots/audit-sweep
mkdir -p "$OUT"
agent-browser set viewport 1440 1200 >/dev/null 2>&1
for id in "$@"; do
  agent-browser open "http://localhost:3000/figure-audit?ids=$id" >/dev/null 2>&1
  agent-browser wait --load networkidle >/dev/null 2>&1
  agent-browser wait 700 >/dev/null 2>&1
  agent-browser screenshot "$OUT/$id.png" >/dev/null 2>&1
  echo "shot $id"
done
echo done
