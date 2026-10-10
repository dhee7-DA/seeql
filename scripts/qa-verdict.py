#!/usr/bin/env python3
"""Definitive QA sweep verdict: runs both viewports, parses raw output."""
import subprocess, json, re

for w, h in [(1440, 900), (390, 844)]:
    out = subprocess.run(
        ["bash", "scripts/qa-sweep.sh", str(w), str(h)],
        capture_output=True, text=True, cwd="/home/z/my-project",
    ).stdout
    pages = []
    for line in out.splitlines():
        # agent-browser prints a JSON-stringified JSON — unwrap once
        m = re.search(r"\{.*\}", line)
        if not m or "hOverflowPx" not in line:
            continue
        raw = m.group(0).replace('\\"', '"')
        try:
            pages.append(json.loads(raw))
        except Exception:
            pass
    bad = [p for p in pages if p["oob"] or p["overlaps"] or p["hOverflowPx"]]
    print(f"{w}x{h}: {len(pages)-len(bad)}/{len(pages)} pages fully clean")
    for p in bad:
        print("  FINDING:", p["path"], "oob:", p["oob"][:2], "overlaps:", p["overlaps"], "hOv:", p["hOverflowPx"])
