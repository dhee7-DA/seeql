import type { ProbRowX } from "./l64-util";

// Lesson 73 — The firehose: a million rows, honestly measured. 14 problems.
// Facts (scripts/scale-probe.ts, re-verified post-reset): 1,010,317 rows ·
// 10,310 NULL-user · 9,901 bots (ids 9000+) · 990,106 known users ·
// 43,926 drifted (space) timestamps · 91,847 trailing-space pages ·
// 402 dirty-money strings ('12,500' / 'n/a' / '3,140.50' / '—') · numeric
// money 1,482,453,292 cents · 10,311 duplicate groups · 10,317 excess rows ·
// 10 raw action spellings → 5 canonical (202,062 each; page_view 202,069).
// EQP solutions are graded with ordered: true (engine text, stable per build).

export const ROWS: ProbRowX[] = [
  ["Count the firehose", "First number of the module: count **every row** in events_scale — output `n`. One honest sweep of 1,010,317 rows; remember its cost, because lesson 74 buys some of it back.", ["COUNT(*) with no WHERE — the full census.", "Shape: SELECT COUNT(*) AS n FROM events_scale;"], "easy",
    "SELECT COUNT(*) AS n\nFROM events_scale;",
    [["where", "No filter — the ask is every row, dirt included."], ["distinct", "COUNT(DISTINCT id) equals COUNT(*) here (id is the PK) — but the plain count is the honest sweep this module measures against."]], false],
  ["The plan for a filter", "Read the plan BEFORE timing anything: **EXPLAIN QUERY PLAN** for `SELECT COUNT(*) FROM events_scale WHERE user_id = 4321`. One step, a full sweep — no tree serves user_id yet. This verdict is the baseline lesson 74 flips.", ["EXPLAIN QUERY PLAN is a read-only prefix.", "Shape: EXPLAIN QUERY PLAN SELECT COUNT(*) FROM events_scale WHERE user_id = 4321;"], "easy",
    "EXPLAIN QUERY PLAN\nSELECT COUNT(*) FROM events_scale\nWHERE user_id = 4321;",
    [["explain\\s+analyze", "Plans, not timings — EXPLAIN QUERY PLAN never executes."], ["create\\s+index", "Not yet — this lesson documents the disease. Indexing is lesson 74's move."]], true],
  ["Anonymous at scale", "How many rows arrived with **no user at all** — `user_id IS NULL`? Output `n`. Ten thousand anonymous events that every equality filter silently skips.", ["IS NULL is the only test that sees NULL.", "Shape: SELECT COUNT(*) AS n FROM events_scale WHERE user_id IS NULL;"], "easy",
    "SELECT COUNT(*) AS n\nFROM events_scale\nWHERE user_id IS NULL;",
    [["=\\s*null", "= NULL matches nothing in SQL — three-valued logic makes every comparison with NULL unknown. IS NULL is the sight."], ["coalesce", "COALESCE would re-write history — count the gap first."]], false],
  ["The bot column", "Bot orphans carry ids 9000 and up: count rows where `user_id >= 9000` — output `n`. Segmenting the log starts with knowing each segment's size.", ["One comparison, one count.", "Shape: SELECT COUNT(*) AS n FROM events_scale WHERE user_id >= 9000;"], "easy",
    "SELECT COUNT(*) AS n\nFROM events_scale\nWHERE user_id >= 9000;",
    [["between", "There's no upper bound — the bot range is open-ended by design."], ["is\\s+not\\s+null\\s+and", "NULL rows fail >= anyway; adding IS NOT NULL is dead weight, not a bug."]], false],
  ["The humans", "The known-user segment: rows with `user_id < 9000` — output `n`. NULL rows fail the comparison automatically, so humans + anonymous + bots must reconcile to the full count.", ["NULL fails < 9000 — exactly the segment boundary you want.", "Shape: SELECT COUNT(*) AS n FROM events_scale WHERE user_id < 9000;"], "easy",
    "SELECT COUNT(*) AS n\nFROM events_scale\nWHERE user_id < 9000;",
    [["<=\\s*9000", "The bot class STARTS at 9000 — <= 9000 would sweep one bot into the humans."], ["user_id\\s+is\\s+not\\s+null\\s+and", "Redundant — NULL already fails every < comparison. The one predicate is the whole segment."]], false],
  ["The spelling census", "Group by the RAW `action` column — output `action`, `n`, busiest first (tiebreak action). Ten rows: five verbs wearing ten costumes. This IS the dirt, made visible.", ["GROUP BY action, ORDER BY n DESC, action.", "Shape: SELECT action, COUNT(*) AS n FROM events_scale GROUP BY action ORDER BY n DESC, action;"], "medium",
    "SELECT action, COUNT(*) AS n\nFROM events_scale\nGROUP BY action\nORDER BY n DESC, action;",
    [["lower", "Not yet — this problem documents the RAW spellings; canonicalizing is the next problem's move."], ["trim", "Same — the raw census is the before picture."]], true],
  ["Canonical actions", "Fold the costumes: group by `LOWER(TRIM(action))` — output `action` (the canonical form), `n`, alphabetical. Five rows, five verbs, the log's true shape.", ["Group by the EXPRESSION; alias it action.", "Shape: SELECT LOWER(TRIM(action)) AS action, COUNT(*) AS n FROM events_scale GROUP BY action ORDER BY action;"], "medium",
    "SELECT LOWER(TRIM(action)) AS action, COUNT(*) AS n\nFROM events_scale\nGROUP BY action\nORDER BY action;",
    [["group\\s+by\\s+action\\s*$", "Grouping by the bare column reproduces the 10-row costume census — wrap it: LOWER(TRIM(action))."], ["order\\s+by\\s+n\\s+desc", "Alphabetical this time — a stable vocabulary, not a ranking."]], true],
  ["Drifted timestamps", "Count rows whose `event_ts` contains a **space** instead of the T separator — `LIKE '% %'`. Output `n`. Each drifted row is a parse bomb waiting for a downstream importer.", ["The ISO separator is 'T'; a space means the format drifted.", "Shape: SELECT COUNT(*) AS n FROM events_scale WHERE event_ts LIKE '% %';"], "medium",
    "SELECT COUNT(*) AS n\nFROM events_scale\nWHERE event_ts LIKE '% %';",
    [["substr\\s*\\(\\s*event_ts\\s*,\\s*11", "Position-picking works but hardcodes the layout — LIKE '% %' states the actual defect: a space where T belongs."], ["time%", "The drift is in the SEPARATOR, not the clock — check the whole string."]], false],
  ["Whitespace pages", "Count rows whose `page` arrived **padded** — `page LIKE '% '` (trailing space). Output `n`. 91,847 rows that literal equality can never match to their own page.", ["LIKE '% ' ends with a space before the quote.", "Shape: SELECT COUNT(*) AS n FROM events_scale WHERE page LIKE '% ';"], "medium",
    "SELECT COUNT(*) AS n\nFROM events_scale\nWHERE page LIKE '% ';",
    [["trim\\s*\\(\\s*page\\s*\\)\\s*!=\\s*page", "Works — but LIKE '% ' counts the defect directly and reads as what it is."], ["like\\s+'\\s*%'", "That's a LEADING space pattern — this feed pads the tail. '% ' with the space first."]], false],
  ["Broken money", "Count rows whose `amount_cents` landed as one of the four dirty strings — `IN ('12,500', 'n/a', '3,140.50', '—')`. Output `n`. Small number, huge downstream cost.", ["One IN list, four exact strings.", "Shape: SELECT COUNT(*) AS n FROM events_scale WHERE amount_cents IN ('12,500', 'n/a', '3,140.50', '—');"], "easy",
    "SELECT COUNT(*) AS n\nFROM events_scale\nWHERE amount_cents IN ('12,500', 'n/a', '3,140.50', '—');",
    [["glob", "GLOB '[0-9]*' finds the NUMERIC rows — this problem counts the dirty strings themselves."], ["typeof", "Everything in a TEXT column is typeof 'text' — the dirt is in the VALUES, not the storage class."]], false],
  ["The honest money", "Sum the amounts that CAN be summed: `SUM(CAST(amount_cents AS INTEGER))` over rows where `amount_cents GLOB '[0-9]*'` — output `cents`. The declared trust boundary: cast only what's numeric, and the 402 dirty rows stay visibly outside.", ["GLOB filters, CAST converts, SUM adds — three steps, one line each.", "Shape: SELECT SUM(CAST(amount_cents AS INTEGER)) AS cents FROM events_scale WHERE amount_cents GLOB '[0-9]*';"], "hard",
    "SELECT SUM(CAST(amount_cents AS INTEGER)) AS cents\nFROM events_scale\nWHERE amount_cents GLOB '[0-9]*';",
    [["sum\\s*\\(\\s*amount_cents\\s*\\)", "SUM on the raw TEXT column does string-adjacent coercion — 'n/a' becomes 0 in disguise and the total silently lies."], ["glob\\s+'\\[0-9\\]\\\\*'", "Escape carefully — the GLOB pattern is [0-9]* inside quotes, no backslash."]], false],
  ["Duplicate groups", "Count the **duplicate fingerprints**: group by event_ts, user_id, action, page, amount_cents, keep groups of 2+, wrap in an outer COUNT — output `n`. 10,311 stories of the same event arriving twice (or eight times).", ["Inner: GROUP BY all five business columns HAVING COUNT(*) > 1. Outer: COUNT(*).", "Shape: SELECT COUNT(*) AS n FROM (SELECT event_ts, user_id, action, page, amount_cents FROM events_scale GROUP BY event_ts, user_id, action, page, amount_cents HAVING COUNT(*) > 1);"], "hard",
    "SELECT COUNT(*) AS n\nFROM (\n  SELECT event_ts, user_id, action, page, amount_cents\n  FROM events_scale\n  GROUP BY event_ts, user_id, action, page, amount_cents\n  HAVING COUNT(*) > 1\n);",
    [["having\\s+count\\s*\\(\\s*\\*\\s*\\)\\s*>\\s*0", "> 0 lists every fingerprint — the census wants REPEATS: COUNT(*) > 1."], ["count\\s*\\(\\s*distinct", "DISTINCT counts the distinct fingerprints (happy ones included) — the HAVING census isolates the repeated ones."]], false],
  ["Excess rows", "How many rows would the fingerprint dedupe remove? `SUM(cnt) - COUNT(*)` over the per-fingerprint groups — output `n`. The delete list's length before lesson 75 writes a single DELETE.", ["Inner: GROUP BY the five columns returning COUNT(*) c. Outer: SUM(c) - COUNT(*).", "Shape: SELECT SUM(c) - COUNT(*) AS n FROM (SELECT COUNT(*) AS c FROM events_scale GROUP BY event_ts, user_id, action, page, amount_cents);"], "hard",
    "SELECT SUM(c) - COUNT(*) AS n\nFROM (\n  SELECT COUNT(*) AS c\n  FROM events_scale\n  GROUP BY event_ts, user_id, action, page, amount_cents\n);",
    [["having", "No HAVING — every group contributes (c - 1) excess, including the singletons that contribute zero. SUM(c) - COUNT(*) over ALL groups is the honest total."], ["count\\s*\\(\\s*distinct", "COUNT(DISTINCT fingerprint) is the CLEAN count — the excess is total minus it, which is exactly what this query computes in one pass."]], false],
  ["The plan for a sort", "One last plan: **EXPLAIN QUERY PLAN** for `SELECT id, event_ts FROM events_scale ORDER BY event_ts DESC LIMIT 5`. Two steps — the sweep, and USE TEMP B-TREE FOR ORDER BY: sorting a million rows to hand back five. Lesson 74 makes this disappear.", ["EXPLAIN prefix; read BOTH detail rows.", "Shape: EXPLAIN QUERY PLAN SELECT id, event_ts FROM events_scale ORDER BY event_ts DESC LIMIT 5;"], "medium",
    "EXPLAIN QUERY PLAN\nSELECT id, event_ts FROM events_scale\nORDER BY event_ts DESC\nLIMIT 5;",
    [["explain\\s+analyze", "Plans, not timings."], ["using\\s+index", "No index on event_ts exists — expect the temp b-tree, that's the point."]], true],
];
