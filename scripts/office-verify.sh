#!/bin/bash
# Verification round for the Query Sorting Office figure.
set -u
CHROME=/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome
FIG="file:///home/z/my-project/public/cf/query-office.html"
OUT=/home/z/my-project/scripts/office-shots
PROF="$OUT/.shared-profile"
mkdir -p "$OUT"; rm -rf "$PROF"
shot () { # name url budget scale
  local name="$1" url="$2" budget="${3:-3000}" sc="${4:-2}"
  local DSF=""; [ "$sc" = "2" ] && DSF="--force-device-scale-factor=2"
  timeout 90 "$CHROME" --headless=new --hide-scrollbars --user-data-dir="$PROF" \
    $DSF --window-size=900,900 --virtual-time-budget=$budget \
    --screenshot="$OUT/$name.png" "$url" >/dev/null 2>&1
  echo "$name: $(stat -c%s "$OUT/$name.png" 2>/dev/null || echo MISSING)"
}
shot idle        "$FIG" 2500 2
shot done        "$FIG?tray=1" 3000 2
shot xray-filter "$FIG?xray=1&phase=filter&t=0.6" 3000 2
shot err         "$FIG?err=1" 2500 2
echo "static done"
