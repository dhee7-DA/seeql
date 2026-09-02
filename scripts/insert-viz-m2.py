#!/usr/bin/env python3
"""Task 19: insert 8 new join-module figure blocks into lessons 09-16.
Each insertion asserts its anchor occurs exactly once, so a drift fails loudly."""
import sys

BASE = "/home/z/my-project/src/lib/curriculum/lessons/"

def block(fig: str) -> str:
    return f'    {{ kind: "diagram", figure: "{fig}" }},\n'

def insert_before(s: str, anchor: str, fig: str) -> str:
    assert s.count(anchor) == 1, f"anchor not unique for {fig}: {s.count(anchor)}"
    return s.replace(anchor, block(fig) + anchor)

def insert_after_block_close(s: str, marker: str, fig: str) -> str:
    """Insert after the bullets block that contains `marker` closes (at `],\n    },`)."""
    assert s.count(marker) == 1, f"marker not unique for {fig}: {s.count(marker)}"
    i = s.index(marker)
    j = s.index("      ],\n    },\n", i) + len("      ],\n    },\n")
    return s[:j] + block(fig) + s[j:]

def insert_before_mcqs(s: str, fig: str) -> str:
    anchor = "  ],\n  mcqs: ["
    assert s.count(anchor) == 1, f"mcqs anchor not unique for {fig}"
    return s.replace(anchor, block(fig) + anchor)

def main() -> None:
    # L09 — after the "Read the query" steps, before "Two details worth noticing"
    p = BASE + "lesson-09.ts"
    s = open(p).read()
    open(p, "w").write(insert_before(s, '    { kind: "h", text: "Two details worth noticing" },\n', "j9-direction"))

    # L10 — after the three-things bullets (illustrates "rows multiply"), before j2-inner-match
    p = BASE + "lesson-10.ts"
    s = open(p).read()
    open(p, "w").write(insert_before(s, '    { kind: "diagram", figure: "j2-inner-match" },\n', "j10-multiply"))

    # L11 — after the full-chain code, before "Habits for chains"
    p = BASE + "lesson-11.ts"
    s = open(p).read()
    open(p, "w").write(insert_before(s, '    { kind: "h", text: "Habits for chains" },\n', "j11-fanmap"))

    # L12 — after the closing tip, end of blocks
    p = BASE + "lesson-12.ts"
    s = open(p).read()
    open(p, "w").write(insert_before_mcqs(s, "j12-gap-anatomy"))

    # L13 — after the "pre-filtered list" code, before j13-three-spellings
    p = BASE + "lesson-13.ts"
    s = open(p).read()
    open(p, "w").write(insert_before(s, '    { kind: "diagram", figure: "j13-three-spellings" },\n', "j13-subquery-flow"))

    # L14 — after "The numbers on this data" bullets, end of blocks
    p = BASE + "lesson-14.ts"
    s = open(p).read()
    open(p, "w").write(insert_before_mcqs(s, "j14-mirror"))

    # L15 — right after the COUNT trap bullets, before the sqlite dialect block
    p = BASE + "lesson-15.ts"
    s = open(p).read()
    open(p, "w").write(insert_after_block_close(
        s, 'Aggregate the right side\'s id, always.",', "j15-ghost-row"))

    # L16 — after the pre-flight checklist bullets, before the mysql dialect block
    p = BASE + "lesson-16.ts"
    s = open(p).read()
    open(p, "w").write(insert_after_block_close(
        s, "`COUNT(column)`, not `COUNT(*)`, when zeros are possible.\",", "j16-preflight"))

    print("inserted 8 figure blocks OK")

if __name__ == "__main__":
    sys.exit(main())
