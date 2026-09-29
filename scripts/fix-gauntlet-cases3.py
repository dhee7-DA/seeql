#!/usr/bin/env python3
"""Round-3 fixes — final case-audit pass."""
import pathlib

BASE = pathlib.Path("/home/z/my-project/src/lib/curriculum/gauntlet")

PATCHES = {
    "m01-cases-hard-a.ts": [
        # cs-2094: drop the duplicated literal 2 (slot 4 IS the 2)
        ('template: "SELECT region, COUNT(*) AS customers FROM customers GROUP BY {1} {2} COUNT(*) {3} {4} 2 ORDER BY customers DESC, region;",',
         'template: "SELECT region, COUNT(*) AS customers FROM customers GROUP BY {1} {2} COUNT(*) {3} {4} ORDER BY customers DESC, region;",'),
        # cs-2102: chained-comparison decoys — use syntax breakers only
        ('distractors: ["OR", "\'2024-08-01\'", "LIMIT", "<"],',
         'distractors: ["HAVING", "LIMIT", "COUNT", "SUM(*)"],'),
        # cs-2105: remove leftover duplicate slot
        ('      { answer: "LIMIT", kind: "keyword", label: "the cap clause", why: "The slate shows three rows — the cap applies after the ascending sort." },\n      { answer: "3", kind: "number", label: "the slate size", noVerify: true, why: "Three rows for the value shelf — the buyer\'s standing ask." },\n      { answer: "3", kind: "number", label: "the slate size", noVerify: true, why: "Three rows for the value shelf." },',
         '      { answer: "LIMIT", kind: "keyword", label: "the cap clause", why: "The slate shows three rows — the cap applies after the ascending sort." },\n      { answer: "3", kind: "number", label: "the slate size", noVerify: true, why: "Three rows for the value shelf — the buyer\'s standing ask." },'),
    ],
    "m01-cases-hard-b.ts": [
        # cs-2120: 'AND' chains into an always-true boolean — error decoy instead
        ('distractors: ["SUM(price)", "ROUND(MAX(price), 2)", "stock", "<", "WHERE", "AND"],',
         'distractors: ["SUM(price)", "ROUND(MAX(price), 2)", "stock", "<", "WHERE", "MIN"],'),
    ],
}

for fname, pairs in PATCHES.items():
    p = BASE / fname
    text = p.read_text()
    for old, new in pairs:
        if old not in text:
            print(f"MISS  {fname}: {old[:70]!r}")
        else:
            text = text.replace(old, new, 1)
    p.write_text(text)
    print(f"done  {fname}")
