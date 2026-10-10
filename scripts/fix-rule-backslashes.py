#!/usr/bin/env python3
"""Double lone backslashes inside mistake-rule test strings (leaves \\ pairs intact)."""
import re
import sys

LONE = re.compile(r"(?<!\\)\\(?!\\)")

for path in sys.argv[1:]:
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    n = 0
    out = []
    for line in lines:
        if '{ test: "' in line:
            new = LONE.sub(r"\\\\", line)
            if new != line:
                n += 1
            out.append(new)
        else:
            out.append(line)
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(out)
    print(f"{path}: fixed {n} rule line(s)")
