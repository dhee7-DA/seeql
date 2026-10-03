#!/usr/bin/env python3
# M5 case fix round 1 — add noVerify: true to every number-kind slot line in
# the gm5 case bank (their figures are LIMIT/threshold/places constants, not
# result-cell values). Line-based: gm5 slots are single-line objects.
import pathlib

ROOT = pathlib.Path("src/lib/curriculum/gauntlet")
FILES = [f"m05-cases-{t}-{h}.ts" for t in ("easy", "medium", "hard") for h in ("a", "b")]

total = 0
for fname in FILES:
    path = ROOT / fname
    lines = path.read_text().split("\n")
    n = 0
    for i, line in enumerate(lines):
        if 'kind: "number"' in line and "noVerify" not in line and line.strip().startswith("{ answer:"):
            assert line.rstrip().endswith("},") or line.rstrip().endswith("}"), f"{fname}:{i+1} unexpected shape: {line}"
            lines[i] = line.rstrip()[:-1].rstrip() + ", noVerify: true },"
            n += 1
    if n:
        path.write_text("\n".join(lines))
    print(f"{fname}: {n} number slots marked noVerify")
    total += n
print("total:", total)
