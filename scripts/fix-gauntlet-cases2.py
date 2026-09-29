#!/usr/bin/env python3
"""Round-2 fixes for the M1 gauntlet case audit."""
import pathlib

BASE = pathlib.Path("/home/z/my-project/src/lib/curriculum/gauntlet")

PATCHES = {
    "m01-cases-medium-a.ts": [
        # cs-2072: positional GROUP BY 1 coincides; AND errors everywhere
        ('distractors: ["SUM(price)", "WHERE", "<", "1", "name"],',
         'distractors: ["SUM(price)", "WHERE", "<", "AND", "name"],'),
    ],
    "m01-cases-hard-a.ts": [
        # cs-2094: consistent 4-slot template
        ('template: "SELECT region, COUNT(*) AS customers FROM customers GROUP BY {1} {2} COUNT(*) {3} {4} ORDER BY customers DESC, region;",',
         'template: "SELECT region, COUNT(*) AS customers FROM customers GROUP BY {1} {2} COUNT(*) {3} {4} 2 ORDER BY customers DESC, region;",'),
        ('''      { answer: "region", kind: "keyword", label: "the bucket key", why: "Territories form the buckets; the bare SELECT column matches the grouping." },
      { answer: "HAVING", kind: "keyword", label: "the group gate", why: "The count exists only per bucket — HAVING is the gate that sees it." },
      { answer: "COUNT(*)", kind: "keyword", label: "the gated measure", why: "The gate re-tests the printed measure: COUNT(*) >= 2 keeps real territories." },
      { answer: ">=", kind: "keyword", label: "the comparison", why: "'2 or more' includes exactly 2 — US survives with its pair." },''',
         '''      { answer: "region", kind: "keyword", label: "the bucket key", why: "Territories form the buckets; the bare SELECT column matches the grouping." },
      { answer: "HAVING", kind: "keyword", label: "the group gate", why: "The count exists only per bucket — HAVING is the gate that sees it." },
      { answer: ">=", kind: "keyword", label: "the comparison", why: "'2 or more' includes exactly 2 — US survives with its pair." },
      { answer: "2", kind: "number", label: "the market floor", why: "The two-customer rule; the value 2 shows up among the bucket counts too." },'''),
        ('distractors: ["SUM(id)", "city", "WHERE", ">", "5"],',
         'distractors: ["SUM(id)", "city", "WHERE", "5"],'),
        # cs-2102: 2024 window (Q2 range is empty on the seed)
        ('brief: "The collections queue for review covers pending orders placed in Q2 2024 — April first through June thirtieth. Id, total and created_at, in id order. Half-open bounds, both ends.",',
         'brief: "The collections queue for review covers pending orders placed during 2024 — from January first up to but excluding January first of next year. Id, total and created_at, in id order. Half-open bounds, both ends, so no boundary ticket is ever double-counted.",'),
        ('ask: "List pending orders created from 2024-04-01 up to but excluding 2024-07-01, by id.",',
         'ask: "List pending orders created from 2024-01-01 up to but excluding 2025-01-01, by id.",'),
        ("{ answer: \"'2024-04-01'\", kind: \"keyword\", label: \"the quarter start\", why: \"The ISO lower bound; string comparison rides the date format.\" },",
         "{ answer: \"'2024-01-01'\", kind: \"keyword\", label: \"the year start\", why: \"The ISO lower bound; string comparison rides the YYYY-MM-DD format lexicographically.\" },"),
        ("{ answer: \"'2024-07-01'\", kind: \"keyword\", label: \"the exclusive end\", why: \"Next quarter's start as the exclusive cap: no double-counted boundary rows, ever.\" },",
         "{ answer: \"'2025-01-01'\", kind: \"keyword\", label: \"the exclusive end\", why: \"Next year's start as the exclusive cap — no double-counted boundary rows, ever.\" },"),
        ('distractors: ["OR", ">=", "<", "\'2024-08-01\'", "AND"],',
         'distractors: ["OR", "\'2024-08-01\'", "LIMIT", "<"],'),
        # cs-2105: literal tie-breaker, no dup, 5 slots
        ('template: "SELECT category, {1} AS floor_price FROM products GROUP BY {2} ORDER BY floor_price {3}, {4} {5} {6};",',
         'template: "SELECT category, {1} AS floor_price FROM products GROUP BY {2} ORDER BY floor_price {3}, category {4} {5};",'),
        ('''      { answer: "ROUND(MIN(price), 2)", kind: "keyword", label: "the floor measure", why: "Each category's cheapest product, rounded — MIN, the mirror of the prestige board." },
      { answer: "category", kind: "keyword", label: "the bucket key", why: "One bucket per category — seven in all on the seed catalog." },
      { answer: "ASC", kind: "keyword", label: "the direction", why: "'Most accessible first' is ascending on the floor." },
      { answer: "category", kind: "keyword", label: "the tie-breaker", why: "Equal floors resolve alphabetically, so the value slate never reshuffles between runs." },
      { answer: "LIMIT", kind: "keyword", label: "the cap clause", why: "The slate shows three rows — the cap applies after the ascending sort." },''',
         '''      { answer: "ROUND(MIN(price), 2)", kind: "keyword", label: "the floor measure", why: "Each category's cheapest product, rounded — MIN, the mirror of the prestige board." },
      { answer: "category", kind: "keyword", label: "the bucket key", why: "One bucket per category — seven in all on the seed catalog." },
      { answer: "ASC", kind: "keyword", label: "the direction", why: "'Most accessible first' is ascending on the floor, with the alphabetical tie-breaker in the template." },
      { answer: "LIMIT", kind: "keyword", label: "the cap clause", why: "The slate shows three rows — the cap applies after the ascending sort." },
      { answer: "3", kind: "number", label: "the slate size", noVerify: true, why: "Three rows for the value shelf — the buyer's standing ask." },'''),
        ('distractors: ["ROUND(MAX(price), 2)", "DESC", "stock", "WHERE", "7"],',
         'distractors: ["ROUND(MAX(price), 2)", "DESC", "stock", "WHERE", "7"],'),
    ],
    "m01-cases-hard-b.ts": [
        # cs-2106: past-end page — all decoys must error
        ('distractors: ["SUM(id)", "HAVING", "WHERE", "100", "COUNT"],',
         'distractors: ["HAVING", "WHERE", "COUNT", "AND", "SUM(*)"],'),
        # cs-2120: threshold decoys hide behind the cap — error decoys instead
        ('distractors: ["SUM(price)", "ROUND(MAX(price), 2)", "stock", "<", "1", "WHERE"],',
         'distractors: ["SUM(price)", "ROUND(MAX(price), 2)", "stock", "<", "WHERE", "AND"],'),
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
