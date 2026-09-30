#!/usr/bin/env python3
# M5 case fix round 4 — final five:
#  - cs-2558: customer_id INSIDE the window order made every row unique, so
#    RANK never tied. Tiebreak moves to the outer ORDER BY only; LIMIT 11
#    then spans the tie (rows 6-9) and the skip (row 10 = rk 10 vs dense 7).
#  - cs-2493: SQLite accepts any type name in CAST (NUM == INTEGER affinity).
#  - cs-2511 / cs-2514 / cs-2516: positional ORDER BY 0/1 and
#    column-as-precision ROUNDs are no-ops; swap for erroring/value decoys.
import pathlib, sys

ROOT = pathlib.Path("src/lib/curriculum/gauntlet")

def patch(fname, old, new, cid):
    p = ROOT / fname
    t = p.read_text()
    if new in t:
        print(f"skip {cid}")
        return
    n = t.count(old)
    if n != 1:
        print(f"FAIL {cid}: anchor {n}x in {fname}")
        sys.exit(1)
    p.write_text(t.replace(old, new))
    print(f"ok {cid}")

patch("m05-cases-easy-b.ts",
  'distractors: ["10", "1000", "5", "TEXT", "NUM"],',
  'distractors: ["10", "1000", "5", "TEXT", "WHERE"],',
  "cs-2493")

patch("m05-cases-medium-a.ts",
  'distractors: ["LEAD", "created_at", "rev", "0", "1"],',
  'distractors: ["LEAD", "created_at", "rev"],',
  "cs-2511")

patch("m05-cases-medium-a.ts",
  '    distractors: ["0", "1", "LAST", "f.ft", "region"],',
  '    distractors: ["0", "LAST", "region", "email"],',
  "cs-2514")

patch("m05-cases-medium-a.ts",
  '    distractors: ["CURRENT ROW", "PRECEDING", "f.op", "region", "0", "1"],',
  '    distractors: ["CURRENT ROW", "PRECEDING", "region", "0"],',
  "cs-2516")

patch("m05-cases-hard-b.ts",
  'template: "SELECT rk, customer_id, n FROM (SELECT customer_id, n, {1}() OVER (ORDER BY n {2}, customer_id) AS rk FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)) ORDER BY rk, customer_id LIMIT {3};",',
  'template: "SELECT rk, customer_id, n FROM (SELECT customer_id, n, {1}() OVER (ORDER BY n {2}) AS rk FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)) ORDER BY rk, customer_id LIMIT {3};",',
  "cs-2558 window")
patch("m05-cases-hard-b.ts",
  '    walkthrough: "The stage counts orders per customer; RANK over descending counts stamps 1 (24), 2 (17), 3 (14), 4 (13), 5 (5), then the count-4 tie takes 6,6,6,6 and the next rank lands on 10 — the three skipped rungs are the tie\'s bill. LIMIT 7 exists precisely to show the tenth rung. The DENSE decoy keeps the first six rows identical but prints 7 where RANK prints 10 — the cell the audit catches. The ROW decoy numbers rows straight through: the tie gets 6,7,8,9 and row seven reads 10 as a row number — different semantics, different cells at the tie. The PERCENT decoy prints 0-based fractions instead of rungs. The ASC decoy crowns the lightest books. The depth decoy (LIMIT 5) hides the tie\'s bill entirely — a shorter ladder that proves nothing. Ties are where rankers earn their keep, and this book finally has them.",',
  '    walkthrough: "The stage counts orders per customer; RANK over descending counts stamps 1 (24), 2 (17), 3 (14), 4 (13), 5 (5), then the count-4 tie takes 6,6,6,6 and the next rank lands on 10 — the three skipped rungs are the tie\'s bill. LIMIT 11 spans both the tie and the skip. The tiebreak lives in the OUTER sort (rk, customer_id) on purpose: put customer_id inside the window\'s ORDER BY and every row becomes unique — RANK never ties, and the three rankers collapse into one. The DENSE decoy prints 7 where RANK prints 10 at row ten — the cell the audit catches. The ROW_NUMBER decoy numbers rows straight through: identical at row ten (10 happens to be both the rung and the position), then row eleven splits them — 10 versus 11. The PERCENT_RANK decoy prints 0-based fractions instead of rungs. The ASC decoy crowns the lightest books. The depth decoy (LIMIT 5) hides the tie\'s bill entirely. Ties are where rankers earn their keep, and this book finally has them.",',
  "cs-2558 walkthrough")

print("round-4 complete")
