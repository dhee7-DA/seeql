#!/usr/bin/env python3
# M5 case fix round 3 — decoy-consequence and marker-alignment fixes from the
# audit's cross-product: SQLite total() alias, float-cast coincidences,
# ROUND no-ops at >=2dp on 2dp values, GROUP BY natural-order no-ops,
# positional ORDER BY no-ops, constant-label coincidences, cs-2516 marker
# order, and correct-fill SQL bugs (cs-2520 paren, cs-2536/2537 aliases).
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

# cs-2486: drop "total" decoy (SQLite total() alias of SUM)
patch("m05-cases-easy-a.ts",
  'distractors: ["AVG", "COUNT", "3", "total"],',
  'distractors: ["AVG", "COUNT", "3", "quantity", "region"],',
  "cs-2486")

# cs-2493: drop REAL (float exactly 57654.0 -> same cell); NUM errors
patch("m05-cases-easy-b.ts",
  'distractors: ["10", "1000", "5", "REAL", "TEXT"],',
  'distractors: ["10", "1000", "5", "TEXT", "NUM"],',
  "cs-2493")

# cs-2495: correct fill orders by count DESC so constant/positional ORDER BY
# decoys stop being no-ops; slot3 answer becomes "n DESC"
patch("m05-cases-easy-b.ts",
  'template: "SELECT strftime({1}, created_at) AS m, COUNT(*) AS n, COUNT(*) OVER () AS stamped FROM orders GROUP BY {2} ORDER BY {3};",',
  'template: "SELECT strftime({1}, created_at) AS m, COUNT(*) AS n, COUNT(*) OVER () AS stamped FROM orders GROUP BY {2} ORDER BY {3};",',
  "cs-2495 tnoop")
patch("m05-cases-easy-b.ts",
  '      { answer: "m ASC", kind: "keyword", label: "the walk order", why: "ORDER BY m ASC walks the calendar forward. ORDER BY n sorts by count and scrambles the timeline; DESC walks it backwards." },',
  '      { answer: "n DESC", kind: "keyword", label: "the heavy-first census", why: "Sorting by the count column, descending, leads with the heaviest months. ORDER BY m would walk the calendar instead — a different contract." },',
  "cs-2495 slot3")
patch("m05-cases-easy-b.ts",
  '    distractors: ["\'%Y\'", "\'%m\'", "\'%d\'", "created_at", "n", "DESC"],',
  '    distractors: ["\'%Y\'", "\'%m\'", "\'%d\'", "created_at", "m ASC", "strftime"],',
  "cs-2495 distractors")

# cs-2502: group-key decoys coincide (single uniform domain) -> erroring /
# multi-group keys only
patch("m05-cases-easy-b.ts",
  '    distractors: ["\'m\'", "\'e\'", "\'0\'", "\'2\'", "email", "INSTR"],',
  '    distractors: ["email", "INSTR", "city", "name"],',
  "cs-2502")

# cs-2503: CEIL/FLOOR exist in the audit engine\'s build -> coincident; use
# erroring / value-changing decoys
patch("m05-cases-easy-b.ts",
  '    distractors: ["ABS", "CEIL", "FLOOR", "2.5", "GROUP BY", "WHERE"],',
  '    distractors: ["ABS", "TRIM", "2.5", "GROUP BY", "WHERE"],',
  "cs-2503")

# cs-2507: ROUND-places decoys >= 2 are no-ops on 2dp values
patch("m05-cases-medium-a.ts",
  '    distractors: ["ASC", "2", "5", "0", "1"],',
  '    distractors: ["ASC", "2", "0"],',
  "cs-2507")

# cs-2511: positional ORDER BY 0/4 no-ops; ROUND 4dp no-op on 2dp deltas
patch("m05-cases-medium-a.ts",
  '    distractors: ["LEAD", "created_at", "0", "4"],',
  '    distractors: ["LEAD", "created_at", "rev", "0", "1"],',
  "cs-2511")

# cs-2513: partition-by-constant coincides on the WHERE-filtered pool
patch("m05-cases-medium-a.ts",
  '    distractors: ["customer_id", "\'shipped\'", "region", "ASC"],',
  '    distractors: ["customer_id", "region", "ASC", "id"],',
  "cs-2513")

# cs-2516: slot order must match marker numbers ({1} places, {2} frame, {3} order)
patch("m05-cases-medium-a.ts",
  '    slots: [\n      { answer: "FOLLOWING", kind: "keyword", label: "the far frame edge", why: "UNBOUNDED FOLLOWING stretches LAST_VALUE to the partition\'s end. CURRENT ROW stops the frame at each row — latest collapses to the row\'s own total." },\n      { answer: "c.name", kind: "keyword", label: "the directory order", why: "ORDER BY c.name alphabetizes. f.op would sort by opening total — same rows, a different page." },\n      { answer: "2", kind: "number", label: "the cent places", why: "Two places print money exactly: 125.88. Zero places round to 126; one place prints 125.9.", noVerify: true },\n    ],',
  '    slots: [\n      { answer: "2", kind: "number", label: "the cent places", why: "Two places print money exactly: 125.88. Zero places round to 126; one place prints 125.9.", noVerify: true },\n      { answer: "FOLLOWING", kind: "keyword", label: "the far frame edge", why: "UNBOUNDED FOLLOWING stretches LAST_VALUE to the partition\'s end. CURRENT ROW stops the frame at each row — latest collapses to the row\'s own total." },\n      { answer: "c.name", kind: "keyword", label: "the directory order", why: "ORDER BY c.name alphabetizes. f.op would sort by opening total — same rows, a different page." },\n    ],',
  "cs-2516 slots")

# cs-2517: f.cl as ROUND places coerces to a huge precision -> no-op
patch("m05-cases-medium-a.ts",
  '    distractors: [">", "=", "f.cl", "ASC", "0", "1"],',
  '    distractors: [">", "=", "ASC", "0", "1"],',
  "cs-2517")

# cs-2520: missing closing paren on the ROUND(...OVER(...)) wrapper
patch("m05-cases-medium-a.ts",
  'template: "SELECT id, total, ROUND({1}(total) OVER (ORDER BY created_at, id ROWS BETWEEN {2} PRECEDING AND 1 {3}) AS trio FROM orders ORDER BY created_at, id LIMIT 5;",',
  'template: "SELECT id, total, ROUND({1}(total) OVER (ORDER BY created_at, id ROWS BETWEEN {2} PRECEDING AND 1 {3})) AS trio FROM orders ORDER BY created_at, id LIMIT 5;",',
  "cs-2520 paren")

# cs-2522: slot3 was ROUND-places (no-op on whole-day gaps) -> customer filter
patch("m05-cases-medium-b.ts",
  'template: "SELECT id, created_at, ROUND(julianday(created_at) - julianday({1}(created_at) OVER (ORDER BY {2})), {3}) AS gap_days FROM orders WHERE customer_id = 1 ORDER BY created_at, id LIMIT 4;",\n    slots: [\n      { answer: "LAG", kind: "keyword", label: "the look-back", why: "LAG(created_at) reads the previous order\'s date. LEAD reads the next — every gap flips negative; the cadence report runs backwards." },\n      { answer: "created_at, id", kind: "keyword", label: "the walk key", why: "The calendar walk with an id tiebreak. ORDER BY id alone walks ledger order — Alice\'s ids interleave dates, so every gap changes." },\n      { answer: "1", kind: "number", label: "the day precision", why: "One decimal: 20.0 prints 20. julianday differences on midnight stamps are whole days, so the rounding choice must not fake precision.", noVerify: true },\n    ],\n    distractors: ["LEAD", "id", "shipped_at", "2", "3"],',
  'template: "SELECT id, created_at, ROUND(julianday(created_at) - julianday({1}(created_at) OVER (ORDER BY {2})), 1) AS gap_days FROM orders WHERE customer_id = {3} ORDER BY created_at, id LIMIT 4;",\n    slots: [\n      { answer: "LAG", kind: "keyword", label: "the look-back", why: "LAG(created_at) reads the previous order\'s date. LEAD reads the next — every gap flips negative; the cadence report runs backwards." },\n      { answer: "created_at, id", kind: "keyword", label: "the walk key", why: "The calendar walk with an id tiebreak. ORDER BY id alone walks ledger order — Alice\'s ids interleave dates, so every gap changes." },\n      { answer: "1", kind: "number", label: "the walked account", why: "Customer 1\'s cadence per the brief. Customer 2 has a single gap; customer 3 a different rhythm entirely.", noVerify: true },\n    ],\n    distractors: ["LEAD", "id", "shipped_at", "2", "3"],',
  "cs-2522 slot3")

# cs-2523: customer_id tiebreak coincides on the up-tick count
patch("m05-cases-medium-b.ts",
  '    distractors: ["customer_id", "shipped_at", "<", "="],',
  '    distractors: ["shipped_at", "<", "="],',
  "cs-2523")

# cs-2524: constant tiebreaks 50/200 are positional no-ops
patch("m05-cases-medium-b.ts",
  '    distractors: ["LEAD", "status", "<", "=", "50", "200"],',
  '    distractors: ["LEAD", "status", "<", "="],',
  "cs-2524")

# cs-2525/2526: direction flips change MEMBERSHIP, not the COUNT — remove ASC
patch("m05-cases-medium-b.ts",
  '    distractors: ["ASC", ">=", "0.2", "0.3", "PERCENT_RANK"],',
  '    distractors: [">=", "0.2", "0.3", "PERCENT_RANK"],',
  "cs-2525")
patch("m05-cases-medium-b.ts",
  '    distractors: ["ASC", "<", "<=", "0.8"],',
  '    distractors: ["<", "<=", "0.8"],',
  "cs-2526")

# cs-2527: gm5 grammar needs OVER() — add the stamp column + slot
patch("m05-cases-medium-b.ts",
  'template: "SELECT number, amount_cents, CAST(amount_cents AS {1}) / {2} AS share FROM invoices ORDER BY id LIMIT {3};",\n    slots: [\n      { answer: "REAL", kind: "keyword", label: "the real cast", why: "CAST AS REAL makes the division fractional: 69428.5714. INTEGER is the trap the case teaches — the same division truncates to 69428." },\n      { answer: "7", kind: "number", label: "the divisor", why: "Seven per the brief. 5 divides 486000 evenly (97200) and hides nothing; 3 divides it exactly too — only a non-divisor exposes the truncation.", noVerify: true },\n      { answer: "3", kind: "number", label: "the invoice preview", why: "Three rows per the brief. LIMIT 5 ships two extra invoices.", noVerify: true },\n    ],\n    distractors: ["INTEGER", "TEXT", "5", "4"],',
  'template: "SELECT number, amount_cents, CAST(amount_cents AS {1}) / {2} AS share, COUNT(*) {4} () AS stamped FROM invoices ORDER BY id LIMIT {3};",\n    slots: [\n      { answer: "REAL", kind: "keyword", label: "the real cast", why: "CAST AS REAL makes the division fractional: 69428.5714. INTEGER is the trap the case teaches — the same division truncates to 69428." },\n      { answer: "7", kind: "number", label: "the divisor", why: "Seven per the brief. 5 divides 486000 evenly (97200) and hides nothing; 3 divides it exactly too — only a non-divisor exposes the truncation.", noVerify: true },\n      { answer: "3", kind: "number", label: "the invoice preview", why: "Three rows per the brief. LIMIT 5 ships two extra invoices.", noVerify: true },\n      { answer: "OVER", kind: "keyword", label: "the stamp clause", why: "OVER () makes the companion count a window stamp — this module\'s signature. GROUP BY in the slot is a parse error." },\n    ],\n    distractors: ["INTEGER", "TEXT", "5", "4", "GROUP BY", "WHERE"],',
  "cs-2527 stamp")

# cs-2532: "id" fills to the answer itself (created_at, id)
patch("m05-cases-medium-b.ts",
  '    distractors: ["GROUP", "WHERE", "id", "total", "shipped_at"],',
  '    distractors: ["GROUP", "WHERE", "total", "shipped_at"],',
  "cs-2532")

# cs-2534: ORDER BY 5 is positional over crank (all 1s) -> no-op
patch("m05-cases-hard-a.ts",
  '    distractors: ["ASC", "5", "total", "customer_id"],',
  '    distractors: ["ASC", "total", "customer_id"],',
  "cs-2534")

# cs-2536: window can\'t see the SELECT alias m -> hardcode the expression;
# slots become direction / rung / reading order
patch("m05-cases-hard-a.ts",
  'template: "SELECT m, id, total FROM (SELECT strftime(\'%Y-%m\', created_at) AS m, id, total, ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY total {2}) AS rn FROM orders) WHERE rn = {3} ORDER BY m;",\n    slots: [\n      { answer: "m", kind: "keyword", label: "the month bucket", why: "PARTITION BY m restarts the ladder per month. created_at would partition per timestamp — rn 1 nearly everywhere, ~99 rows." },\n      { answer: "DESC", kind: "keyword", label: "the ceiling walk", why: "DESC puts each month\'s biggest at rung one. ASC marks each month\'s smallest ticket — the floor board." },\n      { answer: "1", kind: "number", label: "the crown rung", why: "rn = 1 keeps monthly ceilings. rn = 2 ships each month\'s runner-up — fourteen different tickets.", noVerify: true },\n    ],\n    distractors: ["created_at", "ASC", "2"],',
  'template: "SELECT m, id, total FROM (SELECT strftime(\'%Y-%m\', created_at) AS m, id, total, ROW_NUMBER() OVER (PARTITION BY strftime(\'%Y-%m\', created_at) ORDER BY total {1}) AS rn FROM orders) WHERE rn = {2} ORDER BY m {3};",\n    slots: [\n      { answer: "DESC", kind: "keyword", label: "the ceiling walk", why: "DESC puts each month\'s biggest at rung one. ASC marks each month\'s smallest ticket — the floor board." },\n      { answer: "1", kind: "number", label: "the crown rung", why: "rn = 1 keeps monthly ceilings. rn = 2 ships each month\'s runner-up — fourteen different tickets.", noVerify: true },\n      { answer: "ASC", kind: "keyword", label: "the calendar read", why: "ORDER BY m ASC walks the crowns January forward. DESC starts at the walk\'s end — the same board, backwards." },\n    ],\n    distractors: ["created_at", "ASC", "2", "DESC"],',
  "cs-2536 redesign")

# cs-2537: outer ORDER BY references id the stage never exposes
patch("m05-cases-hard-a.ts",
  'WHERE rt {2} {3} ORDER BY created_at, id LIMIT 1;",\n    slots: [\n      { answer: "OVER", kind: "keyword", label: "the window call",',
  'WHERE rt {2} {3} ORDER BY created_at LIMIT 1;",\n    slots: [\n      { answer: "OVER", kind: "keyword", label: "the window call",',
  "cs-2537 order")

# cs-2539: direction flips change membership, not the band-count census
patch("m05-cases-hard-a.ts",
  '    distractors: ["ASC", "ROW_NUMBER", "RANK", "\'q1\'", "\'T1\'"],',
  '    distractors: ["ROW_NUMBER", "RANK", "\'q1\'", "\'T1\'"],',
  "cs-2539")

# cs-2546: constant tiebreaks are positional no-ops
patch("m05-cases-hard-a.ts",
  '    distractors: ["GROUP BY", "5", "1", "total"],',
  '    distractors: ["GROUP BY", "total"],',
  "cs-2546")

# cs-2549: scale DESC coincides on census counts; constant ORDER BY no-op
patch("m05-cases-hard-b.ts",
  '    distractors: ["DESC", ">=", "\'x2\'", "MIN", "n"],',
  '    distractors: [">=", "MIN", "n"],',
  "cs-2549")

# cs-2553: constant labels/order-by coincide; erroring + reorder decoys only
patch("m05-cases-hard-b.ts",
  '    distractors: ["\'rise\'", "n", "DESC", "TRUE", "FALSE"],',
  '    distractors: ["SUM", "AVG", "n", "DESC"],',
  "cs-2553")

# cs-2554: TRUE binds to 1 in SQLite -> customer 1; drop boolean decoys
patch("m05-cases-hard-b.ts",
  '    distractors: ["2", "3", "NULL", "TRUE", "FALSE"],',
  '    distractors: ["2", "3", "NULL"],',
  "cs-2554")

# cs-2558: the rank skip shows at row 10; LIMIT must reach PAST it
patch("m05-cases-hard-b.ts",
  'ORDER BY rk, customer_id LIMIT {3};",\n    slots: [\n      { answer: "RANK", kind: "keyword", label: "the gap-keeping ranker", why: "RANK stamps 6,6,6,6 on the count-4 tie and jumps to 10. DENSE_RANK would stamp 7 next — a different seventh row; ROW_NUMBER numbers straight through the tie." },\n      { answer: "DESC", kind: "keyword", label: "the big-first ladder", why: "DESC ranks the heaviest book first. ASC crowns the single-order accounts — the ladder inverted." },\n      { answer: "7", kind: "number", label: "the ladder depth", why: "Seven rows reach PAST the tie so the skip is visible: the seventh row reads rank 10, not 7. LIMIT 5 would hide the jump entirely.", noVerify: true },\n    ],\n    distractors: ["DENSE_RANK", "ROW_NUMBER", "PERCENT_RANK", "ASC", "5"],',
  'ORDER BY rk, customer_id LIMIT {3};",\n    slots: [\n      { answer: "RANK", kind: "keyword", label: "the gap-keeping ranker", why: "RANK stamps 6,6,6,6 on the count-4 tie and jumps to 10 at the count-3 level. DENSE_RANK stamps 7 there; ROW_NUMBER would have numbered straight through." },\n      { answer: "DESC", kind: "keyword", label: "the big-first ladder", why: "DESC ranks the heaviest book first. ASC crowns the single-order accounts — the ladder inverted." },\n      { answer: "11", kind: "number", label: "the ladder depth", why: "Eleven rows span the four-way tie AND the skip: row 10 reads rank 10 under RANK, 7 under DENSE_RANK — the bill the tie pays. LIMIT 5 hides the jump entirely.", noVerify: true },\n    ],\n    distractors: ["DENSE_RANK", "ROW_NUMBER", "PERCENT_RANK", "ASC", "5"],',
  "cs-2558 limit11")

# cs-2561: the grouped census ranks DISTINCT levels — all rankers agree there;
# swap in the fractional and erroring decoys, fix the walkthrough claims
patch("m05-cases-hard-b.ts",
  '      { answer: "RANK", kind: "keyword", label: "the level ranker", why: "RANK() ranks the count levels 9, 8, 7, 6 to 1, 3, 7, 12. DENSE_RANK would print 1, 2, 3, 4 — the skipped rungs are the whole lesson." },',
  '      { answer: "RANK", kind: "keyword", label: "the level ranker", why: "RANK() ranks the four distinct count levels 1 through 4. PERCENT_RANK would print 0-based shares where rungs belong; MIN and AVG with empty parens are argument errors." },', 
  "cs-2561 why")
patch("m05-cases-hard-b.ts",
  '    distractors: ["DENSE_RANK", "ROW_NUMBER", "n", "c", "ASC"],',
  '    distractors: ["PERCENT_RANK", "MIN", "AVG", "n", "ASC"],',
  "cs-2561 distractors")
patch("m05-cases-hard-b.ts",
  '    walkthrough: "The inner spine counts orders per month (9, 8, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7); the middle stage groups by count level — 9 appears twice, 8 four times, 7 five times, 6 twice — and ranks the levels: RANK gives 1, 3, 7, 12 because the populations (2, 4, 5, 2) occupy rungs the skip rule vacates. The DENSE decoy prints 1, 2, 3, 4 — no gaps, a different rank philosophy in every cell. The ROW decoy numbers the four levels straight through. The n and c decoys re-sort by count or population — same rows, different contracts the order-aware grader distinguishes. The ASC decoy crowns the leanest level. Double aggregation — GROUP BY month, then GROUP BY count — is the histogram pattern: the second fold turns a timeline into a distribution, and ranking the distribution is what makes it comparable across storefronts.",',
  '    walkthrough: "The inner spine counts orders per month (9, 8, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7); the middle stage groups by count level — 9 appears twice, 8 four times, 7 five times, 6 twice — and the window ranks the four distinct LEVELS 1 through 4. A design note the audit forced into the open: ranking grouped levels ranks DISTINCT values, so RANK, DENSE_RANK and ROW_NUMBER all agree here — the tie gap lives in the per-customer ladder (cs-2558), not in this census, which is why neither appears as a decoy. The PERCENT_RANK decoy prints 0-based shares where rungs belong; MIN and AVG die on argument count. The n and c decoys re-sort by count or population — same rows, different contracts the order-aware grader distinguishes. The ASC decoy crowns the leanest level. Double aggregation — GROUP BY month, then GROUP BY count — is the histogram pattern: the second fold turns a timeline into a distribution.",',
  "cs-2561 walkthrough")

print("round-3 complete")
