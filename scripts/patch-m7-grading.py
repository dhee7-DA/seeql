#!/usr/bin/env python3
"""Task 52 pass 6 — normalize mutating problems to echo/changes grading.
- verify with COUNT(*)       -> drop verify (changes-graded)
- verify with plain columns  -> solution gains ` RETURNING <cols>`; verify dropped
- RETURNING already present  -> untouched
"""
import re, sys

FILES = [
    "src/lib/curriculum/keyword-banks/write-problems-insert.ts",
    "src/lib/curriculum/keyword-banks/write-problems-update.ts",
    "src/lib/curriculum/keyword-banks/write-problems-delete.ts",
    "src/lib/curriculum/keyword-banks/write-problems-upsert.ts",
    "src/lib/curriculum/keyword-banks/write-problems-returning-txn.ts",
]

block_re = re.compile(r'  p\(\{\n    id: "(kb-[a-z]+-p\d+)".*?\n  \}\),\n', re.S)
verify_re = re.compile(r'\n    verify: "([^"]+)",')
sol_re = re.compile(r'(    solution: ")([^"]+)(")')

changed = 0
echoed, changes_only = [], []
for path in FILES:
    s = open(path, encoding="utf-8").read()
    out, pos = [], 0
    for m in block_re.finditer(s):
        block = m.group(0)
        pid = m.group(1)
        vm = verify_re.search(block)
        if vm and "RETURNING" not in block:
            verify = vm.group(1)
            cm = re.match(r'SELECT\s+(.+?)\s+FROM\s+', verify, re.I)
            cols = cm.group(1) if cm else ""
            if "COUNT(*)" in cols:
                block = verify_re.sub("", block)
                changes_only.append(pid)
            else:
                cols = re.sub(r'\s+AS\s+\w+', '', cols, flags=re.I)
                cols = re.sub(r'\s+ORDER BY.*$', '', cols, flags=re.I).strip()
                sm = sol_re.search(block)
                sol = sm.group(2).rstrip().rstrip(";")
                block = sol_re.sub(lambda mm: mm.group(1) + sol + " RETURNING " + cols + ";" + mm.group(3), block, count=1)
                block = verify_re.sub("", block)
                echoed.append(pid)
            changed += 1
        out.append(s[pos:m.start()])
        out.append(block)
        pos = m.end()
    out.append(s[pos:])
    open(path, "w", encoding="utf-8").write("".join(out))

print(f"normalized {changed} problems: {len(echoed)} echo, {len(changes_only)} changes-only")
if len(sys.argv) > 1:
    print("echo:", echoed)
    print("changes:", changes_only)
