import type { ProbRowX } from "./l64-util";

// Lesson 77 — Types, casts & NULLs across engines. 12 problems.
// Facts (scripts/l76-probe.ts): 1/2 = 0 · 7/2 = 3 · 1.0/2 = 0.5 · 1/0 =
// NULL · CAST('129.90') = 129 · CAST('12,500') = 12 · CAST('abc') = 0 ·
// NULL || 'x' = NULL · IFNULL(NULL,'x') = 'x' · NULLs sort FIRST ASC ·
// COUNT(*) 103 vs COUNT(shipped_at) 82 · shipped_at = shipped_at keeps 82.

export const ROWS: ProbRowX[] = [
  ["Integer division, proven", "BigQuery and Postgres both return 0 for 1/2. Prove SQLite agrees: output `a` = 1/2 and `b` = 7/2 — one row, both integers truncated.", ["One SELECT, two integer divisions.", "Shape: SELECT 1/2 AS a, 7/2 AS b;"], "easy",
    "SELECT 1/2 AS a, 7/2 AS b;",
    [["1\\.0", "Not yet — this problem prices the INTEGER spelling; the REAL fix is next."], ["round", "No rounding — integer division truncates toward zero."]], true],
  ["The REAL fix", "The portable correction: output `a` = 1.0/2 and `b` = typeof(1.0/2) — one row proving the REAL operand changes everything.", ["Make one operand REAL.", "Shape: SELECT 1.0/2 AS a, typeof(1.0/2) AS b;"], "easy",
    "SELECT 1.0/2 AS a, typeof(1.0/2) AS b;",
    [["cast", "CAST(1 AS REAL)/2 works — but the 1.0 literal is the spelling the brief asks for."], ["1/2", "That's the integer division again — the decimal point is the fix."]], true],
  ["Division by zero, quietly", "Postgres errors; SQLite shrugs. Output `a` = 1/0 — one row, and read what the engine hands back.", ["One expression, no guard — see the behavior.", "Shape: SELECT 1/0 AS a;"], "easy",
    "SELECT 1/0 AS a;",
    [["ifnull", "No rescue — this problem documents the raw behavior first."], ["1/1", "Divide by zero, literally — that's the probe."]], true],
  ["CAST truncates", "CAST('129.90' AS INTEGER) — output `v`. SQLite prefix-parses and truncates: no error, no rounding.", ["One CAST, one row.", "Shape: SELECT CAST('129.90' AS INTEGER) AS v;"], "easy",
    "SELECT CAST('129.90' AS INTEGER) AS v;",
    [["130", "No rounding — CAST to INTEGER truncates the decimal part."], ["real", "The ask is the INTEGER cast — the truncation IS the lesson."]], true],
  ["CAST stops at the comma", "The thousands-separator landmine: output `v` = CAST('12,500' AS INTEGER). Read it twice — this is why guard-then-cast is one move.", ["One CAST, one row, a surprise.", "Shape: SELECT CAST('12,500' AS INTEGER) AS v;"], "easy",
    "SELECT CAST('12,500' AS INTEGER) AS v;",
    [["replace", "REPLACE('12,500', ',', '') would give 12500 — but the brief prices the RAW cast's behavior first."], ["12500", "That's what a human reads — the engine stops at the comma."]], true],
  ["The silent zero", "BigQuery's SAFE_CAST('abc' AS INT64) → NULL; Postgres errors; SQLite outputs `v` = CAST('abc' AS INTEGER) — see what you get.", ["One CAST of pure text.", "Shape: SELECT CAST('abc' AS INTEGER) AS v;"], "easy",
    "SELECT CAST('abc' AS INTEGER) AS v;",
    [["null", "SAFE_CAST's behavior — SQLite's plain CAST does something else. Run it."], ["glob", "The guard is the NEXT move — this problem prices the bare cast."]], true],
  ["The NULL that eats the concat", "Oracle says '' IS NULL; SQLite says NULL || 'x' is NULL. Output `eaten` = NULL || 'x' — one row, and check what survives.", ["One concatenation with a NULL operand.", "Shape: SELECT NULL || 'x' AS eaten;"], "easy",
    "SELECT NULL || 'x' AS eaten;",
    [["'x'", "NULL propagates — the operator never sees a string to append to."], ["coalesce", "The rescue is the next problem — document the raw behavior first."]], true],
  ["The explicit rescue", "The portable spelling of 'treat missing as empty': output `rescued` = IFNULL(NULL || 'x', 'fallback') and `plain` = IFNULL(NULL, -1) — one row, both substitutions visible.", ["Two IFNULL calls, one row.", "Shape: SELECT IFNULL(NULL || 'x', 'fallback') AS rescued, IFNULL(NULL, -1) AS plain;"], "easy",
    "SELECT IFNULL(NULL || 'x', 'fallback') AS rescued, IFNULL(NULL, -1) AS plain;",
    [["coalesce", "COALESCE works identically here — IFNULL is the two-argument dialect spelling."], ["nvl", "NVL is Oracle's — not this engine."]], true],
  ["typeof tells the truth", "The firehose's type census: output `storage`, `n` = typeof(amount_cents) and its count over events_scale, grouped — one row proving the whole column is TEXT.", ["GROUP BY the typeof expression.", "Shape: SELECT typeof(amount_cents) AS storage, COUNT(*) AS n FROM events_scale GROUP BY storage;"], "medium",
    "SELECT typeof(amount_cents) AS storage, COUNT(*) AS n\nFROM events_scale\nGROUP BY storage\nORDER BY n DESC;",
    [["distinct", "DISTINCT lists the values — the ask is the per-type census with counts."], ["json_type", "That's the webhook probe — amount_cents is a plain column."]], true],
  ["NULLs sort first here", "Postgres defaults NULLs LAST ascending; SQLite first. Output `shipped_at` for the three smallest — `ORDER BY shipped_at LIMIT 3` — and see which rows lead.", ["Three rows, ascending, NULLs included.", "Shape: SELECT shipped_at FROM orders ORDER BY shipped_at LIMIT 3;"], "medium",
    "SELECT shipped_at FROM orders\nORDER BY shipped_at\nLIMIT 3;",
    [["is\\s+not\\s+null", "No filter — the point is WHERE the NULLs land in the sort."], ["desc", "Ascending — the NULL placement differs by direction too, but the ask is ASC."]], true],
  ["COUNT(*) vs COUNT(col)", "The universal contrast, on real data: output `all_rows` = COUNT(*), `with_ship` = COUNT(shipped_at) from orders — one row, 21 rows of difference visible.", ["Two aggregates, no GROUP BY.", "Shape: SELECT COUNT(*) AS all_rows, COUNT(shipped_at) AS with_ship FROM orders;"], "easy",
    "SELECT COUNT(*) AS all_rows, COUNT(shipped_at) AS with_ship\nFROM orders;",
    [["distinct", "No DISTINCT — the contrast is rows vs non-NULL values."], ["where", "No filter — both counts in one row, gap included."]], false],
  ["The self-comparison detector", "The three-valued proof: count rows where `shipped_at = shipped_at` is TRUE — output `n`. The tautology sees only non-NULL values.", ["COUNT with the self-equality predicate.", "Shape: SELECT COUNT(*) AS n FROM orders WHERE shipped_at = shipped_at;"], "medium",
    "SELECT COUNT(*) AS n\nFROM orders\nWHERE shipped_at = shipped_at;",
    [["is", "IS TRUE works in Postgres; the bare self-comparison is the three-valued demo here."], ["not", "NOT flips it to zero rows — the ask keeps the non-NULL side."]], false],
];
