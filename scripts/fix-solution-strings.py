#!/usr/bin/env python3
"""Join multi-line string literals in lesson solution fields with \n escapes."""
import sys

def fix(path: str) -> int:
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    out = []
    joined = 0
    in_str = False
    buf = ""
    for line in lines:
        if in_str:
            buf += "\\n" + line.rstrip("\n")
            if line.rstrip("\n").endswith('",'):
                out.append(buf + "\n")
                in_str = False
                joined += 1
            continue
        stripped = line.rstrip("\n")
        # a solution line that opens a string but doesn't close it
        if stripped.lstrip().startswith('solution: "') and not (
            stripped.endswith('",') or stripped.endswith('";')
        ):
            in_str = True
            buf = stripped
            continue
        out.append(line)
    if in_str:
        out.append(buf + "\n")  # unterminated at EOF — shouldn't happen
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(out)
    return joined

for p in sys.argv[1:]:
    n = fix(p)
    print(f"{p}: joined {n} multi-line string(s)")
