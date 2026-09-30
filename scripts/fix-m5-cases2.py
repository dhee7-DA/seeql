#!/usr/bin/env python3
# M5 case fix round 2 — structural patches:
#  - third slots for 2-slot cases (audit requires 3..7)
#  - dedupe duplicate slot answers
#  - fix {1}_RANK template bug (fills "RANK_RANK") -> slot carries full name
#  - cs-2532 missing {3} marker in template
#  - cs-2549 missing {3} marker
# Every patch asserts its anchor is found exactly once.
import pathlib, sys

ROOT = pathlib.Path("src/lib/curriculum/gauntlet")

def patch(fname, old, new, cid):
    p = ROOT / fname
    t = p.read_text()
    if new in t:
        print(f"skip {cid} (already applied)")
        return
    n = t.count(old)
    if n != 1:
        print(f"FAIL {cid}: anchor found {n}x in {fname}")
        sys.exit(1)
    p.write_text(t.replace(old, new))
    print(f"ok {cid}")

# ---------- easy tier ----------
patch("m05-cases-easy-a.ts",
  'template: "SELECT id, status, COUNT(*) OVER (PARTITION BY {1}) AS status_rows FROM orders ORDER BY id LIMIT {2};",\n    slots: [\n      { answer: "status", kind: "keyword", label: "the cohort key",',
  'template: "SELECT id, status, {3}(*) OVER (PARTITION BY {1}) AS status_rows FROM orders ORDER BY id LIMIT {2};",\n    slots: [\n      { answer: "status", kind: "keyword", label: "the cohort key",',
  "cs-2475 template")
patch("m05-cases-easy-a.ts",
  '      { answer: "4", kind: "number", label: "the row budget", why: "Four rows cover four distinct tickets. LIMIT 8 doubles the sample the reviewer must read — a different page.", noVerify: true },\n    ],\n    distractors: ["customer_id", "region", "8"],',
  '      { answer: "4", kind: "number", label: "the row budget", why: "Four rows cover four distinct tickets. LIMIT 8 doubles the sample the reviewer must read — a different page.", noVerify: true },\n      { answer: "COUNT", kind: "keyword", label: "the counter", why: "COUNT(*) counts cohort membership. SUM(*) and AVG(*) are parse errors — star aggregation belongs to counting alone." },\n    ],\n    distractors: ["customer_id", "region", "8", "SUM", "AVG"],',
  "cs-2475 slot3")

patch("m05-cases-easy-a.ts",
  'template: "SELECT name, ROW_NUMBER() OVER (ORDER BY name {1}) AS pos FROM customers ORDER BY pos LIMIT {2};",\n    slots: [\n      { answer: "ASC", kind: "keyword", label: "the alphabet walk",',
  'template: "SELECT name, {3}() OVER (ORDER BY name {1}) AS pos FROM customers ORDER BY pos LIMIT {2};",\n    slots: [\n      { answer: "ASC", kind: "keyword", label: "the alphabet walk",',
  "cs-2477 template")
patch("m05-cases-easy-a.ts",
  '      { answer: "3", kind: "number", label: "the preview size", why: "Three names preview the numbering. LIMIT 6 shows twice the rows the spec asked for.", noVerify: true },\n    ],\n    distractors: ["DESC", "6", "email"],',
  '      { answer: "3", kind: "number", label: "the preview size", why: "Three names preview the numbering. LIMIT 6 shows twice the rows the spec asked for.", noVerify: true },\n      { answer: "ROW_NUMBER", kind: "keyword", label: "the numberer", why: "ROW_NUMBER hands out 1..16 with no ties and no gaps. LAG would shift names down one row; FIRST_VALUE would stamp Alice on every row." },\n    ],\n    distractors: ["DESC", "6", "email", "LAG", "FIRST_VALUE"],',
  "cs-2477 slot3")

patch("m05-cases-easy-a.ts",
  'template: "SELECT name, price, RANK() OVER (ORDER BY price {1}) AS rk FROM products ORDER BY rk LIMIT {2};",\n    slots: [\n      { answer: "DESC", kind: "keyword", label: "the expensive walk",',
  'template: "SELECT name, price, {3}() OVER (ORDER BY price {1}) AS rk FROM products ORDER BY rk LIMIT {2};",\n    slots: [\n      { answer: "DESC", kind: "keyword", label: "the expensive walk",',
  "cs-2478 template")
patch("m05-cases-easy-a.ts",
  '      { answer: "3", kind: "number", label: "the podium size", why: "Three rungs per the brief. A limit of 4 promotes the fourth product onto a podium that only fits three.", noVerify: true },\n    ],\n    distractors: ["ASC", "4", "AVG"],',
  '      { answer: "3", kind: "number", label: "the podium size", why: "Three rungs per the brief. A limit of 4 promotes the fourth product onto a podium that only fits three.", noVerify: true },\n      { answer: "RANK", kind: "keyword", label: "the rung printer", why: "RANK numbers by the window order. LAG would shift prices down one row; FIRST_VALUE would stamp 199.99 everywhere; NTILE with empty parens errors." },\n    ],\n    distractors: ["ASC", "4", "AVG", "LAG", "FIRST_VALUE", "NTILE"],',
  "cs-2478 slot3")

patch("m05-cases-easy-a.ts",
  'template: "SELECT name, price, {1}_RANK() OVER (ORDER BY price DESC) AS drk FROM products ORDER BY drk LIMIT {2};",\n    slots: [\n      { answer: "DENSE", kind: "keyword", label: "the no-gap ranker", why: "DENSE_RANK never skips after ties. ROW_RANK is not a function — the parse dies instead of silently swapping the semantics." },',
  'template: "SELECT name, price, {1}() OVER (ORDER BY price {2}) AS drk FROM products ORDER BY drk LIMIT {3};",\n    slots: [\n      { answer: "DENSE_RANK", kind: "keyword", label: "the no-gap ranker", why: "DENSE_RANK never skips after ties. NTILE with empty parens errors; LAG shifts prices down a row; PERCENT_RANK prints 0-based shares where rungs belong." },',
  "cs-2479 template")
patch("m05-cases-easy-a.ts",
  '      { answer: "3", kind: "number", label: "the ladder depth", why: "Three rungs per the brief. LIMIT 2 truncates the podium below the spec.", noVerify: true },\n    ],\n    distractors: ["ROW", "2", "PERCENT"],',
  '      { answer: "DESC", kind: "keyword", label: "the expensive walk", why: "DESC leads with 199.99. ASC ranks the 32-dollar mat first — the bargain ladder." },\n      { answer: "3", kind: "number", label: "the ladder depth", why: "Three rungs per the brief. LIMIT 2 truncates the podium below the spec.", noVerify: true },\n    ],\n    distractors: ["NTILE", "LAG", "PERCENT_RANK", "ASC", "2"],',
  "cs-2479 slots")

patch("m05-cases-easy-a.ts",
  'template: "SELECT id, total, {1}(total) OVER (ORDER BY created_at, id) AS prev_total FROM orders ORDER BY created_at, id LIMIT {2};",\n    slots: [\n      { answer: "LAG", kind: "keyword", label: "the look-back",',
  'template: "SELECT id, total, {1}(total, {3}) OVER (ORDER BY created_at, id) AS prev_total FROM orders ORDER BY created_at, id LIMIT {2};",\n    slots: [\n      { answer: "LAG", kind: "keyword", label: "the look-back",',
  "cs-2482 template")
patch("m05-cases-easy-a.ts",
  '      { answer: "3", kind: "number", label: "the walk preview", why: "Three rows preview the walk. LIMIT 6 doubles the sample.", noVerify: true },\n    ],\n    distractors: ["LEAD", "FIRST_VALUE", "6"],',
  '      { answer: "3", kind: "number", label: "the walk preview", why: "Three rows preview the walk. LIMIT 6 doubles the sample.", noVerify: true },\n      { answer: "1", kind: "number", label: "the look-back distance", why: "One row back is the immediate predecessor. 2 fetches the ticket before last; 0 reads the row itself — prev becomes own total.", noVerify: true },\n    ],\n    distractors: ["LEAD", "FIRST_VALUE", "6", "2", "0"],',
  "cs-2482 slot3")

patch("m05-cases-easy-a.ts",
  'template: "SELECT id, total, {1}(total) OVER (ORDER BY created_at, id) AS next_total FROM orders ORDER BY created_at, id LIMIT {2};",\n    slots: [\n      { answer: "LEAD", kind: "keyword", label: "the look-ahead",',
  'template: "SELECT id, total, {1}(total, {3}) OVER (ORDER BY created_at, id) AS next_total FROM orders ORDER BY created_at, id LIMIT {2};",\n    slots: [\n      { answer: "LEAD", kind: "keyword", label: "the look-ahead",',
  "cs-2483 template")
patch("m05-cases-easy-a.ts",
  '      { answer: "3", kind: "number", label: "the walk preview", why: "Three rows per the brief. LIMIT 5 ships extra walk rows.", noVerify: true },\n    ],\n    distractors: ["LAG", "LAST_VALUE", "5"],',
  '      { answer: "3", kind: "number", label: "the walk preview", why: "Three rows per the brief. LIMIT 5 ships extra walk rows.", noVerify: true },\n      { answer: "1", kind: "number", label: "the look-ahead distance", why: "One row ahead is the immediate successor. 2 peeks two tickets out; 0 reads the row itself — next becomes own total.", noVerify: true },\n    ],\n    distractors: ["LAG", "LAST_VALUE", "5", "2", "0"],',
  "cs-2483 slot3")

patch("m05-cases-easy-a.ts",
  'template: "SELECT id, total, {1}_VALUE(total) OVER (ORDER BY created_at, id) AS opening FROM orders ORDER BY created_at, id LIMIT {2};",\n    slots: [\n      { answer: "FIRST", kind: "keyword", label: "the head reader",',
  'template: "SELECT id, total, {1}_VALUE({3}) OVER (ORDER BY created_at, id) AS opening FROM orders ORDER BY created_at, id LIMIT {2};",\n    slots: [\n      { answer: "FIRST", kind: "keyword", label: "the head reader",',
  "cs-2484 template")
patch("m05-cases-easy-a.ts",
  '      { answer: "3", kind: "number", label: "the preview size", why: "Three rows show the constant stamp. LIMIT 8 ships extra rows.", noVerify: true },\n    ],\n    distractors: ["LAST", "ROW_NUMBER", "8"],',
  '      { answer: "3", kind: "number", label: "the preview size", why: "Three rows show the constant stamp. LIMIT 8 ships extra rows.", noVerify: true },\n      { answer: "total", kind: "keyword", label: "the read column", why: "The opener\'s total is the anchor: 752.96. FIRST_VALUE(id) would stamp the id 6; created_at the date — different constants." },\n    ],\n    distractors: ["LAST", "ROW_NUMBER", "8", "id", "created_at"],',
  "cs-2484 slot3")

patch("m05-cases-easy-a.ts",
  'template: "SELECT id, total, LAST_VALUE(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED {1}) AS latest FROM orders ORDER BY created_at, id LIMIT {2};",\n    slots: [\n      { answer: "FOLLOWING", kind: "keyword", label: "the far frame edge",',
  'template: "SELECT id, total, LAST_VALUE({3}) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED {1}) AS latest FROM orders ORDER BY created_at, id LIMIT {2};",\n    slots: [\n      { answer: "FOLLOWING", kind: "keyword", label: "the far frame edge",',
  "cs-2485 template")
patch("m05-cases-easy-a.ts",
  '      { answer: "3", kind: "number", label: "the preview size", why: "Three rows demonstrate the constant stamp. LIMIT 6 ships extra rows.", noVerify: true },\n    ],\n    distractors: ["CURRENT ROW", "PRECEDING", "6"],',
  '      { answer: "3", kind: "number", label: "the preview size", why: "Three rows demonstrate the constant stamp. LIMIT 6 ships extra rows.", noVerify: true },\n      { answer: "total", kind: "keyword", label: "the read column", why: "The latest total is the stamp: 585.79. LAST_VALUE(id) would stamp id 97; created_at the closing date — different constants." },\n    ],\n    distractors: ["CURRENT ROW", "PRECEDING", "6", "id", "created_at"],',
  "cs-2485 slot3")

patch("m05-cases-easy-a.ts",
  'template: "SELECT id, total, {1}(total) OVER (ORDER BY created_at, id) AS walk FROM orders ORDER BY created_at, id LIMIT {2};",\n    slots: [\n      { answer: "SUM", kind: "keyword", label: "the accumulator",',
  'template: "SELECT id, total, {1}(total) OVER (ORDER BY created_at, {3}) AS walk FROM orders ORDER BY created_at, id LIMIT {2};",\n    slots: [\n      { answer: "SUM", kind: "keyword", label: "the accumulator",',
  "cs-2486 template")
patch("m05-cases-easy-a.ts",
  '      { answer: "5", kind: "number", label: "the walk length", why: "Five steps show the accumulation shape. LIMIT 3 truncates the walk below the brief.", noVerify: true },\n    ],\n    distractors: ["AVG", "COUNT", "3"],',
  '      { answer: "5", kind: "number", label: "the walk length", why: "Five steps show the accumulation shape. LIMIT 3 truncates the walk below the brief.", noVerify: true },\n      { answer: "id", kind: "keyword", label: "the tiebreak", why: "created_at, id walks same-day tickets in ledger order. created_at, total orders the tie by amount — the walk swaps its second and third steps." },\n    ],\n    distractors: ["AVG", "COUNT", "3", "total"],',
  "cs-2486 slot3")

patch("m05-cases-easy-a.ts",
  'template: "SELECT id, customer_id, COUNT(*) OVER (PARTITION BY {1}) AS cust_orders FROM orders ORDER BY id LIMIT {2};",\n    slots: [\n      { answer: "customer_id", kind: "keyword", label: "the owner key",',
  'template: "SELECT id, customer_id, {3}(*) OVER (PARTITION BY {1}) AS cust_orders FROM orders ORDER BY id LIMIT {2};",\n    slots: [\n      { answer: "customer_id", kind: "keyword", label: "the owner key",',
  "cs-2487 template")
patch("m05-cases-easy-a.ts",
  '      { answer: "4", kind: "number", label: "the row budget", why: "Four rows per the brief. LIMIT 10 ships a longer sample.", noVerify: true },\n    ],\n    distractors: ["status", "id", "10"],',
  '      { answer: "4", kind: "number", label: "the row budget", why: "Four rows per the brief. LIMIT 10 ships a longer sample.", noVerify: true },\n      { answer: "COUNT", kind: "keyword", label: "the tally", why: "COUNT(*) counts the partition\'s rows. SUM(*) and AVG(*) are parse errors — star aggregation belongs to counting alone." },\n    ],\n    distractors: ["status", "id", "10", "SUM", "AVG"],',
  "cs-2487 slot3")

patch("m05-cases-easy-b.ts",
  'template: "SELECT DISTINCT {1}(category, 1, {2}) AS prefix, COUNT(*) OVER () AS stamped FROM products ORDER BY prefix;",\n    slots: [\n      { answer: "SUBSTR", kind: "keyword", label: "the slicer",',
  'template: "SELECT DISTINCT {1}(category, {3}, {2}) AS prefix, COUNT(*) OVER () AS stamped FROM products ORDER BY prefix;",\n    slots: [\n      { answer: "SUBSTR", kind: "keyword", label: "the slicer",',
  "cs-2490 template")
patch("m05-cases-easy-b.ts",
  '      { answer: "3", kind: "number", label: "the slice length", why: "Three characters per the brief. Two letters merge shelves (Ap covers Apparel), five keep near-full names — different prefixes either way.", noVerify: true },\n    ],\n    distractors: ["REPLACE", "TRIM", "UPPER", "2", "5"],',
  '      { answer: "3", kind: "number", label: "the slice length", why: "Three characters per the brief. Two letters merge shelves (Ap covers Apparel), five keep near-full names — different prefixes either way.", noVerify: true },\n      { answer: "1", kind: "number", label: "the start position", why: "SQLite slices 1-based from the first character. Offset 2 drops the leading letter (cc, pp); offset 0 behaves off-grid and returns shifted text.", noVerify: true },\n    ],\n    distractors: ["REPLACE", "TRIM", "UPPER", "2", "5", "0"],',
  "cs-2490 slot3")

patch("m05-cases-easy-b.ts",
  'template: "SELECT id, total, CAST(total * {1} AS INTEGER) AS cents, COUNT(*) OVER () AS stamped FROM orders ORDER BY id LIMIT {2};",\n    slots: [\n      { answer: "100", kind: "number", label: "the cents multiplier",',
  'template: "SELECT id, total, CAST(total * {1} AS {3}) AS cents, COUNT(*) OVER () AS stamped FROM orders ORDER BY id LIMIT {2};",\n    slots: [\n      { answer: "100", kind: "number", label: "the cents multiplier",',
  "cs-2493 template")
patch("m05-cases-easy-b.ts",
  '      { answer: "3", kind: "number", label: "the ledger preview", why: "Three rows per the brief. LIMIT 5 ships extra rows.", noVerify: true },\n    ],\n    distractors: ["10", "1000", "5"],',
  '      { answer: "3", kind: "number", label: "the ledger preview", why: "Three rows per the brief. LIMIT 5 ships extra rows.", noVerify: true },\n      { answer: "INTEGER", kind: "keyword", label: "the target type", why: "INTEGER truncates the multiplied float to a clean cent count. REAL keeps the binary dust (57654.0000000002) and TEXT stringifies it — both visibly different cells." },\n    ],\n    distractors: ["10", "1000", "5", "REAL", "TEXT"],',
  "cs-2493 slot3")

patch("m05-cases-easy-b.ts",
  'template: "SELECT {1}(AVG(total), {2}) AS avg_total, COUNT(*) OVER () AS stamped FROM orders;",\n    slots: [\n      { answer: "ROUND", kind: "keyword", label: "the presenter",',
  'template: "SELECT {1}(AVG({3}), {2}) AS avg_total, COUNT(*) OVER () AS stamped FROM orders;",\n    slots: [\n      { answer: "ROUND", kind: "keyword", label: "the presenter",',
  "cs-2494 template")
patch("m05-cases-easy-b.ts",
  '      { answer: "2", kind: "number", label: "the decimal places", why: "Two places print cents: 338.19. Zero places print 338 — a different figure; one place prints 338.2, also different.", noVerify: true },\n    ],\n    distractors: ["0", "1", "ABS", "CAST"],',
  '      { answer: "2", kind: "number", label: "the decimal places", why: "Two places print cents: 338.19. Zero places print 338 — a different figure; one place prints 338.2, also different.", noVerify: true },\n      { answer: "total", kind: "keyword", label: "the averaged column", why: "AVG(total) means the mean ticket. AVG(id) would average ledger positions (~52) — a real number that answers nothing about money." },\n    ],\n    distractors: ["0", "1", "ABS", "CAST", "id", "customer_id"],',
  "cs-2494 slot3")

patch("m05-cases-easy-b.ts",
  "GROUP BY {2} ORDER BY {3};",
  "GROUP BY {2} ORDER BY {3};",
  "cs-2495 noop-check")

print("round-2a complete")
