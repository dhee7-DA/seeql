#!/bin/bash
# Run the QA sweep for one viewport and print a clean/dirty summary.
set -e
cd /home/z/my-project
OUT=/tmp/sweep-run.txt
bash scripts/qa-sweep.sh "$1" "$2" > "$OUT" 2>&1
total=$(grep -c 'hOverflowPx' "$OUT" || true)
clean=$(grep 'hOverflowPx' "$OUT" | grep -c '"oob":\[\],"overlaps":0' || true)
echo "viewport ${1}x${2}: $clean/$total pages with 0-oob & 0-overlaps"
echo "-- pages with any finding: --"
grep 'hOverflowPx' "$OUT" | grep -v '"oob":\[\],"overlaps":0' | head -4 || echo "(none)"
