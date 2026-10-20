#!/bin/bash
# Verification round for the Query Machine figure — parallel shots, per-shot timeout.
set -u
CHROME=/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome
FIG="file:///home/z/my-project/public/cf/query-machine.html"
OUT=/home/z/my-project/scripts/qm-shots
mkdir -p "$OUT"
shot () {
  local name="$1" url="$2" budget="${3:-3000}" w="${4:-900}" h="${5:-900}"
  (
    timeout 60 "$CHROME" --headless=new --hide-scrollbars --user-data-dir="$OUT/.p-$name" \
      --force-device-scale-factor=2 --window-size=$w,$h --virtual-time-budget=$budget \
      --screenshot="$OUT/$name.png" "$url" >/dev/null 2>&1
    echo "shot $name: $(stat -c%s "$OUT/$name.png" 2>/dev/null || echo MISSING)"
  ) &
}
shot idle        "$FIG" 2500
shot run-filter  "$FIG?run=1" 4200
shot run-group   "$FIG?run=1" 7500
shot done        "$FIG?tray=1" 3000
wait
shot xray-filter "$FIG?xray=1&phase=filter&t=0.6" 3000 &
shot err         "$FIG?err=1" 2500 &
shot crop-tray   "$FIG?tray=1" 3000 520 560 &
wait
echo "--- DOM error check ---"
timeout 60 "$CHROME" --headless=new --user-data-dir="$OUT/.p-dom" --virtual-time-budget=3500 \
  --dump-dom "$FIG?run=1" 2>/dev/null > "$OUT/dom.html"
grep -o 'data-errors="[^"]*"' "$OUT/dom.html" | head -3
echo "NaN count: $(grep -o 'NaN' "$OUT/dom.html" | wc -l)"
