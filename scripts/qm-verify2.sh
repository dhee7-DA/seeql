#!/bin/bash
# Verification round — serial shots, one shared profile (per the colourfigures verify checklist).
set -u
CHROME=/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome
FIG="file:///home/z/my-project/public/cf/query-machine.html"
OUT=/home/z/my-project/scripts/qm-shots
PROF="$OUT/.shared-profile"
mkdir -p "$OUT"; rm -rf "$PROF"
shot () { # name url budget [w h]
  local name="$1" url="$2" budget="${3:-3000}" w="${4:-900}" h="${5:-900}"
  timeout 55 "$CHROME" --headless=new --hide-scrollbars --user-data-dir="$PROF" \
    --force-device-scale-factor=2 --window-size=$w,$h --virtual-time-budget=$budget \
    --screenshot="$OUT/$name.png" "$url" >/dev/null 2>&1
  echo "$name: $(stat -c%s "$OUT/$name.png" 2>/dev/null || echo MISSING)"
}
shot run-filter  "$FIG?run=1" 4200
shot run-group   "$FIG?run=1" 7500
shot done        "$FIG?tray=1" 3000
shot xray-filter "$FIG?xray=1&phase=filter&t=0.6" 3000
shot err         "$FIG?err=1" 2500
echo "all shots done"
