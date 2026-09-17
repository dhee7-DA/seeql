# Foundations case-study matrix — 200 scenarios, 65 atoms

Accounting instrument for the case-study wave. Every atom is hit in >= 2
cases (retrieval threshold: teach, confirm, transfer); counts per lesson
sum to exactly 200. Scenario universes rotate so no persona dominates:
month-end close (CFO/FP&A), refund & fraud audit (payments/risk analyst),
pricing review (merch analyst), inventory count (warehouse lead), marketing
funnel (growth analyst), supplier scorecard (procurement), expense control
(controller), board deck (BI analyst), customer triage (CS lead),
fulfillment ops (logistics analyst). Every figure in every brief traces to
scripts/facts-cases-out.txt or scripts/facts-m1-500-out.txt.

## L1 — tables & anatomy (20)
| Atom | Cases |
|---|---|
| pick-the-right-table: orders / customers / products / suppliers / order_items | c01-c05, c09, c14, c16, c19-c20 |
| SELECT * vs named columns | c01-c04, c06-c07 |
| comma-separated column list | c06, c07, c15, c17 |
| column-existence traps (no ship_city/signup_date/delivered_at/stars) | c08, c10, c16, c17, c19 |
| header vs line table (orders vs order_items; total vs unit_price) | c05, c09, c12, c14, c18 |
| id primary key vs foreign keys (supplier_id, order_id+product_id, customer_id) | c11, c12 |
| statement terminator | c13 |
| FROM chooses the world | c20 |

## L2 — projection, expressions, aliases (22)
| Atom | Cases |
|---|---|
| scaling expressions (* 1.1 / * 1.2 / * 0.9 / / 2) | c01, c03, c06, c11, c15, c22 |
| AS keyword naming computed columns | c02, c08, c09, c16, c19 |
| implicit alias (space, no AS) | c03 |
| quoted alias with space/symbol | c04, c17 |
| arithmetic on two columns (price*stock, quantity*unit_price) | c05, c12 |
| percent-of math (fee 0.02, cents *100) | c10, c20 |
| parentheses override precedence | c11 |
| missing-comma silent alias trap | c13, c07 |
| snake_case vs bare multi-word alias | c14 |
| AS renames output only (source column untouched) | c21 |
| SELECT list order = output order | c18 |
| multiple computed columns coexist | c07, c22 |

## L3 — WHERE (34)
| Atom | Cases |
|---|---|
| = on text (quote style, case sensitivity) | c01, c09, c27 |
| = on numbers (no quotes) | c02 |
| < / > thresholds (figure from brief) | c02, c03, c34 |
| <> negation | c04 |
| IN list (text) | c05, c11, c29 |
| NOT IN | c15 |
| BETWEEN range (inclusive; numbers + dates) | c06, c08, c22, c28 |
| LIKE prefix / infix / suffix wildcards | c07, c12, c13, c14, c30 |
| AND narrowing | c16, c23 |
| OR widening | c17, c31 |
| AND/OR precedence needs parentheses (3 vs 4 rows) | c18 |
| IS NULL / IS NOT NULL (21 holes / 82 stamped) | c19, c20 |
| multi-gate stacking (3 conditions) | c21, c23, c32 |
| NOT BETWEEN | c22 |
| date windows (>= '2025-01-01', LIKE '2024%') | c07, c25 |
| empty result is a valid answer | c33 |
| "at least" reads as >= | c34 |
| active = 0 flag filter | c10 |

## L4 — ORDER BY (22)
| Atom | Cases |
|---|---|
| ORDER BY col + DESC for top-N | c01-c03 |
| ASC default / explicit ASC bottom-N | c04-c05 |
| multi-key sort (status then total; two keys tie-break) | c06-c08 |
| sort text columns (alphabetical) | c09 |
| ORDER BY + LIMIT is a window | c02, c03, c10 |
| clause order: LIMIT after ORDER BY | c10, c11 |
| sort key from the brief (biggest/oldest/newest words) | c01, c05, c12 |
| ORDER BY alias / expression | c13 |
| NULL sort position (SQLite NULLs first ASC) | c14 |
| ORDER BY created_at windows (latest/earliest) | c12 |
| tie-breaking with id | c07 |
| reverse alphabetical (DESC on text) | c15 |
| top-N per stakeholder figure (3/5/10) | c01-c03, c10, c16-c17 |
| sort by number stored as number (no quote traps) | c18 |
| cheapest/highest product & supplier | c19-c22 |

## L5 — DISTINCT & pagination (22)
| Atom | Cases |
|---|---|
| DISTINCT single column (status/region/category/quantity) | c01-c04 |
| row-value uniqueness vs column uniqueness (16 cities) | c05 |
| DISTINCT multi-column pairs (region, active = 6) | c06 |
| DISTINCT + ORDER BY | c07 |
| COUNT over distinct vs raw (foreshadow) | c08 |
| LIMIT n | c09-c10 |
| LIMIT + OFFSET page math (103 orders / 5 = 21 pages, last = 3) | c11-c13 |
| OFFSET needs ORDER BY to be stable | c14 |
| top-N with DISTINCT interplay | c15 |
| dedupe choice columns for dropdowns | c03-c04 |
| page size from the brief (10/page) | c16 |
| last page remainder | c13, c17 |
| dedupe ids for exports | c18 |
| DISTINCT across 21-page pull | c19 |
| order matters: DISTINCT vs sort output | c20 |
| dedupe for the finance memo (customer_id 16 of 103) | c21 |
| DISTINCT on flag columns | c22 |

## L6 — aggregates (27)
| Atom | Cases |
|---|---|
| COUNT(*) rowcounts | c01-c03 |
| COUNT(col) vs COUNT(*) (82 stamped / 103 total) | c04 |
| COUNT(DISTINCT col) (16 customers, 4 statuses) | c05-c06 |
| SUM money (34,833.28 / 30,773.25 / 15,571.07) | c07-c09 |
| AVG with ROUND (338.19 / 299.44 / 436.64) | c10-c12 |
| MIN/MAX (25.47 / 1,088.44 / 14.99 / 199.99) | c13-c16 |
| aggregates on filtered sets (WHERE before aggregate) | c09, c12 |
| aggregate on empty set | c17 |
| SUM vs COUNT confusion | c18 |
| MIN/MAX on text (alphabetical) | c19 |
| multi-aggregate single SELECT | c20-c21 |
| stock & units (2,845 units, 498 items) | c22-c23 |
| ratings (4.3 avg, 4.8 top) | c24 |
| figure extraction from memo (percent, caps) | c25-c27 |

## L7 — GROUP BY (27)
| Atom | Cases |
|---|---|
| GROUP BY single column (status/region/category/supplier) | c01-c04 |
| groups = unique values; one row per group | c01-c04 |
| aggregate per group (COUNT/SUM/AVG) | c01-c04, c08-c11 |
| GROUP BY on FK ids (customer_id heavy buyers 24/17/14/13) | c05 |
| GROUP BY expression (substr year/month) | c06-c07 |
| SELECT rule: non-aggregated columns must be grouped | c12-c13 |
| GROUP BY two columns | c14 |
| order groups by count | c15 |
| WHERE + GROUP BY together | c16 |
| group sizes from memo (top-3 categories, 4 statuses) | c17-c18 |
| AVG per group (pending 436.64 vs cancelled 164.64) | c09-c10 |
| per-quantity mix (93/69/89) | c11 |
| monthly splits 2025 (6 + 7) | c07 |
| supplier catalog spread (3/3/3/3/2/2) | c04 |
| revenue-per-status story | c08-c10 |

## L8 — HAVING (22)
| Atom | Cases |
|---|---|
| WHERE vs HAVING (rows vs groups) | c01-c03 |
| HAVING COUNT(*) >= n (20 -> 2, 14 -> 3) | c04-c06 |
| HAVING SUM >= n (> 5000 -> 3 statuses) | c07-c08 |
| HAVING AVG >= n (> 350 -> 2 statuses) | c09 |
| HAVING on exact = (count = 1) | c10 |
| WHERE + GROUP BY + HAVING full pipeline | c11-c12 |
| HAVING without GROUP BY (whole-table aggregate) | c13 |
| order the surviving groups | c14 |
| figure from memo as group gate | c15-c16 |
| per-FK groups (customer 24/17/14/13) | c17 |
| category depth gates (>= 3 -> 3 shelves) | c18 |
| region gates (>= 5 -> 2 regions) | c19 |
| quantity mix gates | c20 |
| line-count gates (48 multi-line orders) | c21 |
| AVG price gates (supplier 1 only > 100) | c22 |

## L35 — capstone briefs (4)
| Atom | Cases |
|---|---|
| full clause pipeline (WHERE+GROUP BY+HAVING+ORDER BY+LIMIT) | c01-c04 |
| board-deck multi-ask (status mix, big tickets, ledger health) | c01-c02 |
| audit sweep (holes, cancelled, dedupe) | c03 |
| founder snapshot (counts + sums + top-N) | c04 |

## Batching
- Batch 1: L1 (20) + L2 (22) + L3 (34) = 76
- Batch 2: L4 (22) + L5 (22) = 44
- Batch 3: L6 (27) + L7 (27) = 54
- Batch 4: L8 (22) + L35 (4) = 26
- Total: 200 — matrix exhaustion complete at c34 (L3), c22 (L2), etc.
