// Drill set — WITH RECURSIVE (Module 4, secondary, 40 questions).
// Engine-verified receipts (db/custom.db): counter anchor `SELECT 1` UNION ALL
// step `n+1 WHERE n < 5` → group_concat "1,2,3,4,5" (P46); `WHERE n < 10` →
// 10 rows; powers-of-2 step `n*2 WHERE n < 1000` → 11 rows ending 1024 (512
// passes and emits 1024 — test-with-then-emit overshoot); customer id ladder
// MIN..MAX → 16 rows (ids 1..16 contiguous); date ladder date(min(created_at))
// +1 day → 424 rows (2024-01-01 .. 2025-02-27, leap year) vs 84 distinct order
// dates → 340 orderless days; RECURSIVE keyword accepted on a non-recursive
// CTE (WITH RECURSIVE p AS (SELECT 1) → 42 — probe-verified); zero-row anchor
// → 0 rows; outer WHERE filters the finished CTE only (1..10 → 5 odd rows);
// outer LIMIT runs after aggregation (group_concat returns the full 1..10
// despite LIMIT 3); LIMIT inside the CTE body stops the queue (LIMIT 5 →
// 1,2,3,4,5). Error receipts (probed): second RECURSIVE mid-list →
// near "b": syntax error; two references to the recursive table in the step →
// "multiple references to recursive table: t"; recursive table hidden in a
// step subquery → "circular reference: t"; anchor wider than the column list
// → "table t has 2 values for 1 columns"; step without FROM → "no such
// column: n". Missing termination loops forever — SQLite has no default depth
// cap. Storefront has NO self-referencing FK (customers→orders is a plain
// hierarchy) — most storefront questions do NOT need recursion. Plain-CTE EQP
// context: single reference streams CO-ROUTINE (P41), twice-referenced
// MATERIALIZE (P48).
// Probes: scripts/m4-facts.ts + 3 inline readonly probes (counters, ladders,
// error messages).

import type { DrillQ } from "../types";

const KW = "WITH RECURSIVE";

export const CTE_RECURSIVE: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr4-rec-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which query is a correct WITH RECURSIVE counter that produces 1 through 5?",
    choices: [
      "`WITH RECURSIVE cnt(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM cnt WHERE n < 5) SELECT group_concat(n) FROM cnt`",
      "`WITH cnt(n) AS (SELECT 1 RECURSIVE SELECT n+1 FROM cnt WHERE n < 5) SELECT group_concat(n) FROM cnt`",
      "`WITH RECURSIVE cnt(n) AS (SELECT 1; SELECT n+1 FROM cnt WHERE n < 5) SELECT group_concat(n) FROM cnt`",
      "`WITH RECURSIVE (n) cnt AS (SELECT 1 UNION ALL SELECT n+1 FROM cnt WHERE n < 5) SELECT group_concat(n) FROM cnt`",
    ],
    answer: 0,
    why: "RECURSIVE sits immediately after WITH; the CTE body is an anchor SELECT (no self-reference) UNION ALL a recursive SELECT that reads cnt once and carries the WHERE that stops it. The other options misplace the keyword, split the body with a semicolon, or invert the column list.",
    notes: [
      { choice: 2, why: "A semicolon ends the statement. The body of one CTE is a single compound SELECT — its members are joined by UNION ALL, never by `;`." },
    ],
  },
  { id: "dr4-rec-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "In `WITH RECURSIVE a AS (SELECT 1), ladder(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM ladder WHERE n < 3) SELECT * FROM a, ladder`, what does RECURSIVE apply to?",
    choices: [
      "Only `a` — the first CTE after the keyword; `ladder` may not self-reference",
      "The whole WITH list — every CTE declared there is permitted to self-reference; only `ladder` actually does",
      "Nothing until a CTE body actually contains a self-reference — it is pure decoration here",
      "Only the last CTE — recursion is always granted to the final entry of the list",
    ],
    answer: 1,
    why: "RECURSIVE is a property of the WITH clause, not of any single CTE: writing it once lets every CTE in that list reference itself. `a` simply never uses the privilege. Dropping the keyword would break `ladder` even though `a` is not recursive.",
    notes: [
      { choice: 0, why: "Common misread — the flag is not positional. It covers `a` and `ladder` alike; `a` just has no step that points back at it." },
    ],
  },
  { id: "dr4-rec-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Inside a recursive CTE body, how are the anchor part and the recursive step joined?",
    choices: [
      "With a comma — `SELECT 1, SELECT n+1 FROM cnt` — the way column lists work",
      "With a JOIN — `SELECT 1 JOIN SELECT n+1 FROM cnt` — the step joins the anchor's rows",
      "With a compound operator — `SELECT 1 UNION ALL SELECT n+1 FROM cnt WHERE n < 5` — anchor stacked on step",
      "No joiner is needed — the step follows the anchor as a second top-level statement",
    ],
    answer: 2,
    why: "The body of a recursive CTE is a compound SELECT: the anchor (which must not reference the CTE) UNION ALL the step (which must). JOIN, comma, and statement-splitting are all parse errors — only UNION or UNION ALL connect the two members.",
    notes: [
      { choice: 1, why: "JOIN joins tables inside a FROM clause, not two standalone SELECTs. Between SELECT members the grammar allows only the compound operators." },
    ],
  },
  { id: "dr4-rec-04", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Where do you declare the output columns of a recursive CTE named `cnt` with one column `n`?",
    choices: [
      "`WITH RECURSIVE cnt AS (n) (SELECT …)` — columns in parens after AS",
      "`WITH RECURSIVE (n) cnt AS (SELECT …)` — columns before the name",
      "Columns cannot be named on a recursive CTE — alias them inside the anchor only",
      "`WITH RECURSIVE cnt(n) AS (SELECT …)` — name, then optional column list, then AS",
    ],
    answer: 3,
    why: "The syntax is `cte-name (column-list) AS (body)` — exactly as with any CTE; RECURSIVE changes nothing. `cnt(n)` pins the row shape, and every row the step emits must supply exactly one value for that one column.",
    notes: [
      { choice: 2, why: "Naming columns on the CTE is optional but fully supported — and it is the cleanest way to pin the shape the recursive step must match." },
    ],
  },
  { id: "dr4-rec-05", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "A teammate writes the header as `WITH recursive ladder(n) AS (SELECT 1 UNION ALL …)`. Does SQLite run it as a recursive CTE?",
    choices: [
      "Yes — keywords are case-insensitive; `recursive` behaves exactly like RECURSIVE",
      "No — only uppercase RECURSIVE enables self-reference",
      "It runs, but SQLite silently demotes it to a plain (non-recursive) CTE",
      "It needs backticks — lowercase SQL keywords must be quoted",
    ],
    answer: 0,
    why: "SQL keywords are matched case-insensitively, so `WITH recursive` turns on recursion exactly like `WITH RECURSIVE`. The self-reference in the step is what makes the CTE recursive; the spelling of the keyword is irrelevant.",
    notes: [
      { choice: 2, why: "There is no demotion. If the keyword is present (any case) and a member references the CTE, you get full recursive evaluation." },
    ],
  },
  { id: "dr4-rec-06", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which body makes `cnt` genuinely recursive — a clean anchor feeding a step that reads the CTE?",
    choices: [
      "`(SELECT n FROM cnt UNION ALL SELECT 1)` — the anchor reads the CTE, the step is a constant",
      "`(SELECT 1 UNION ALL SELECT n+1 FROM cnt WHERE n < 5)` — the anchor is self-reference-free, the step reads cnt",
      "`(SELECT 1 UNION ALL SELECT 2)` — both members are constants, but the header says RECURSIVE",
      "`(SELECT n+1 FROM cnt WHERE n < 5 UNION ALL SELECT 1)` — step first, anchor second",
    ],
    answer: 1,
    why: "Exactly one member references the CTE, and it follows a clean anchor. The anchor seeds the queue with 1; each later round reads the previous batch through `cnt`. An anchor that itself reads cnt is circular; a body with no self-reference never recurses at all.",
    notes: [
      { choice: 3, why: "Member order matters: the first member is the seed and the self-referencing member is the step. Reversed, the step has nothing to read on round one." },
    ],
  },
  { id: "dr4-rec-07", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "For `WITH RECURSIVE cnt(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM cnt WHERE n < 5)`, where does the final aggregation go?",
    choices: [
      "Inside the body, after the step: `… WHERE n < 5 GROUP BY n` — the CTE aggregates itself",
      "In the WITH header — `WITH RECURSIVE cnt(n) GROUP BY n AS (…)`",
      "On the main statement after the body — `… ) SELECT group_concat(n) FROM cnt`",
      "Nowhere — a recursive CTE returns its rows already aggregated",
    ],
    answer: 2,
    why: "The WITH clause only declares the CTE; the statement that consumes it carries its own SELECT list, WHERE, GROUP BY, ORDER BY and LIMIT. The body's job is to produce rows — read cnt like a table afterwards and aggregate in the outer SELECT.",
    notes: [
      { choice: 0, why: "Appending GROUP BY to the step changes the recursive member's shape. Keep the step a plain row producer and aggregate outside." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr4-rec-08", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "In a recursive CTE, how many times does the anchor member execute per statement?",
    choices: [
      "Once per outer result row — like a correlated subquery",
      "Once per round of the recursion, right before each step execution",
      "Zero — the anchor is optimized away whenever a step exists",
      "Exactly once — its rows are the seed batch that the first round of the step reads",
    ],
    answer: 3,
    why: "The anchor runs a single time to seed the queue. The step then runs repeatedly against whatever the previous round enqueued. It is never re-run per outer row — the whole CTE is built once, and only then does the outer SELECT read the finished result.",
    notes: [
      { choice: 0, why: "That is correlated-scalar behavior, not CTE behavior. A recursive CTE is materialized once per statement, not once per outer row." },
    ],
  },
  { id: "dr4-rec-09", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "On round three of a counter recursion, which rows does `FROM cnt` in the step hand over?",
    choices: [
      "Only the rows the previous round produced — the queue's current batch, not everything so far",
      "Every row produced so far, from the anchor through round two",
      "The final complete result, read back as it will be returned",
      "A random batch — SQLite samples cnt nondeterministically each round",
    ],
    answer: 0,
    why: "SQLite runs the recursion as a queue: the anchor enqueues its rows, and each execution of the step consumes exactly the batch the previous iteration enqueued, appending its own output for the next round. It never rescans the accumulated result.",
    notes: [
      { choice: 1, why: "Reading 'everything so far' is the self-JOIN mental model. The step is fed one batch at a time — which is why a step without a stop condition never runs out of input." },
    ],
  },
  { id: "dr4-rec-10", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "Counter: anchor `SELECT 1`, step `SELECT n+1 FROM cnt WHERE n < 5`. Why does the result hold 5 rows, not 4?",
    choices: [
      "Because WHERE n < 5 filters the finished 6-row sequence down to 5",
      "Because queued values 1..4 each pass the test and emit 2..5, while 5 fails and spawns nothing — 1,2,3,4,5 in total",
      "Because the anchor counts as row 0, so n reaches 5 on the fifth round",
      "Because SQLite rounds the row count up to the anchor's column count",
    ],
    answer: 1,
    why: "The step's WHERE is applied per queued row before emission, not to the final output. Rows 1,2,3,4 survive the test and emit 2,3,4,5; when 5 is dequeued it fails n < 5 and produces nothing — the queue drains and recursion ends with values 1 through 5.",
    notes: [
      { choice: 0, why: "That confuses the step's filter with an outer one. Inside the step it is a termination test: the row that fails still appears in the output (5 was already emitted by 4) — it just spawns no successor." },
    ],
  },
  { id: "dr4-rec-11", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "The counter also works with plain `UNION` between anchor and step. What does UNION change?",
    choices: [
      "Nothing — UNION and UNION ALL are aliases inside CTE bodies",
      "It reverses the order: the step runs before the anchor",
      "UNION dedups each new row against everything already produced and stops when a round adds nothing new; UNION ALL keeps every row and iterates purely off the queue",
      "It caps the recursion at one round — a second round is a syntax error",
    ],
    answer: 2,
    why: "Both operators are legal between the members. UNION ALL streams and is the cheap default; UNION maintains a set — an already-produced row is discarded instead of enqueued, so cyclic data that keeps repeating values terminates naturally, at the cost of the dedup work.",
    notes: [
      { choice: 0, why: "The difference is invisible on a strict counter (no repeats) but decisive on cyclic data. Choosing UNION ALL there means the recursion never runs out of new rows." },
    ],
  },
  { id: "dr4-rec-12", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM t WHERE n < 10) SELECT count(*) FROM t WHERE n % 2 = 1` — what does the outer WHERE do?",
    choices: [
      "Stops the recursion early, once the odd values run out",
      "Is pushed into the step, so the even rows are never generated",
      "Is illegal — a recursive CTE's consumer may not filter it",
      "Filters the finished result only: the counter still runs its full 1..10 course, then 5 odd rows are counted",
    ],
    answer: 3,
    why: "Termination lives inside the step (`WHERE n < 10`). The outer WHERE runs after the CTE is complete, over its 10 rows, keeping 1,3,5,7,9 → count 5. Outer filters never feed back into the queue — only the step's own WHERE can stop generation.",
    notes: [
      { choice: 1, why: "Predicate pushdown does not reach into a recursive CTE's queue. The even rows are generated and then discarded — the step's WHERE is the only brake." },
    ],
  },
  { id: "dr4-rec-13", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`WITH RECURSIVE p AS (SELECT 1 AS x) SELECT x+41 FROM p` — the CTE never references itself. What happens?",
    choices: [
      "It runs fine and returns 42 — RECURSIVE merely permits self-reference, it does not require one",
      "Parse error — RECURSIVE demands an actual self-reference in the body",
      "It runs, but returns an empty result because no step ever fired",
      "It runs only if a LIMIT is present, as a safety requirement",
    ],
    answer: 0,
    why: "Verified on db/custom.db: the query returns 42. RECURSIVE switches on the ability to self-reference for the whole WITH list; a CTE that never uses it is just a plain CTE wearing a scary keyword. SQLite does not require a recursive member to exist.",
    notes: [
      { choice: 1, why: "There is no such check. The keyword is permissive grammar — judgment-wise you still should not write it (see the judgment questions), but the engine accepts it." },
    ],
  },
  { id: "dr4-rec-14", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "A date ladder anchored at `date(MIN(created_at))` and stepped `+1 day` until `date(MAX(created_at))` over orders yields how many rows — and what do they represent?",
    choices: [
      "84 rows — one per day that actually carries an order",
      "424 rows — every calendar day from 2024-01-01 through 2025-02-27, orderless days included",
      "103 rows — one per order",
      "424 rows, but the 340 orderless days come out NULL",
    ],
    answer: 1,
    why: "The ladder is generated from dates, not from orders: anchor 2024-01-01, step +1 day, stop past 2025-02-27 → 424 rows (366 leap-year days + 58 more). Only 84 of those days have any order — the ladder's value is precisely the 340 empty days a plain GROUP BY over orders would never show.",
    notes: [
      { choice: 0, why: "That is `SELECT DISTINCT date(created_at)` behavior. Recursion enumerates the RANGE; joining orders back onto it is what exposes the gaps." },
    ],
  },
  { id: "dr4-rec-15", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "While the recursion is still running, what does the name `cnt` mean inside the step's FROM clause?",
    choices: [
      "The final result set, computed lazily and re-read each round",
      "The underlying orders table — cnt is an alias SQLite resolves to the anchor's source",
      "The batch of rows produced by the previous round, waiting in the queue to be consumed",
      "An empty placeholder — cnt only takes on contents after the recursion finishes",
    ],
    answer: 2,
    why: "During evaluation cnt is the queue: the anchor filled it, each round drains that batch through the step and re-enqueues the step's output. The final result is whatever accumulated — the step never reads the accumulation, only the live frontier of the walk.",
    notes: [
      { choice: 0, why: "There is no lazy self-reading of the final result — that would be a true circular definition. The queue discipline is what makes the recursion well-defined." },
    ],
  },
  { id: "dr4-rec-16", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "Which of these is a real built-in way for a recursive CTE to stop?",
    choices: [
      "A default depth cap of 100 rounds, after which SQLite errors",
      "The outer statement's LIMIT — it interrupts the queue mid-drain",
      "A timeout — SQLite aborts recursion after one second by default",
      "The step yielding zero rows for a whole round — or a LIMIT written inside the CTE body",
    ],
    answer: 3,
    why: "Recursion ends when the queue starves: a round's step emits nothing new. A LIMIT inside the CTE body also stops it — verified: `… FROM t WHERE n < 100 LIMIT 5` returns exactly 1,2,3,4,5. There is no default depth cap and no timeout; an outer LIMIT only trims output.",
    notes: [
      { choice: 1, why: "The outer LIMIT applies after the CTE is fully materialized (see the edge question on group_concat). Only a LIMIT inside the body can halt the queue." },
    ],
  },
  { id: "dr4-rec-17", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "Anchor `SELECT 1`, step `SELECT n+2 FROM cnt WHERE n < 10`. What does the CTE produce?",
    choices: [
      "1,3,5,7,9,11 — six rows; 9 still passes `n < 10` and emits 11, which then fails and stops",
      "1,3,5,7,9 — five rows; 9 is the last value allowed to appear",
      "1,2,3,…,10 — the WHERE clamps the stride back to 1",
      "Nothing — a step may only add 1 per round",
    ],
    answer: 0,
    why: "The step emits n+2 for every queued row that passes the WHERE. 1,3,5,7,9 all pass, so the last emission is 9+2=11; 11 fails the test and the queue drains — the same overshoot the powers-of-two ladder shows (512 < 1000 still emits 1024).",
    notes: [
      { choice: 1, why: "Classic off-by-one: the WHERE tests the SOURCE row before emission, so the first failing source (11) is itself a value that was already emitted. Test-then-emit produces the overshoot." },
    ],
  },

  // ---------- edge ----------
  { id: "dr4-rec-18", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Counter with anchor `SELECT 1` and step `SELECT n+1 FROM t` — the WHERE is forgotten. What does SQLite do?",
    choices: [
      "Caps the recursion at a default depth of 1000 and returns the rows up to it",
      "Loops forever — every round hands a bigger n to the next, the queue never starves, and the query never returns",
      "Refuses to run — a recursive member without WHERE is a syntax error",
      "Stops automatically when n overflows the 32-bit integer range",
    ],
    answer: 1,
    why: "Termination is entirely the author's job, via the step's WHERE or a body LIMIT. With no stop, each round produces a fresh row, so the queue can never empty; SQLite has no default depth cap — the statement just keeps running until you kill it or memory runs out.",
    notes: [
      { choice: 2, why: "The WHERE is optional grammar, not a requirement. That is exactly why runaway recursion is a runtime hazard rather than a caught mistake." },
    ],
  },
  { id: "dr4-rec-19", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`WITH RECURSIVE t(n) AS (SELECT 1 AS n WHERE 0 UNION ALL SELECT n+1 FROM t WHERE n < 5) SELECT count(*) FROM t` returns what?",
    choices: [
      "5 — the step ignores a dead anchor and starts from its own WHERE",
      "1 — the anchor contributes one NULL row",
      "0 — the anchor seeds nothing, so the step's first round reads an empty queue and never fires",
      "An error — the anchor of a recursive CTE must return at least one row",
    ],
    answer: 2,
    why: "Verified: count 0. The anchor is the seed; `WHERE 0` makes it produce no rows, the first round of the step reads an empty queue and emits nothing, and recursion ends before it began. A recursive CTE is allowed to be simply empty.",
    notes: [
      { choice: 1, why: "A no-row SELECT produces zero rows, not one NULL row — aggregates invent rows, plain SELECTs do not." },
    ],
  },
  { id: "dr4-rec-20", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Same counter, but the step's filter becomes `WHERE n <= 5`. How many rows, and what is the last value?",
    choices: [
      "5 rows, last value 5 — same as `n < 5`",
      "4 rows, last value 5 — the equality drops the anchor",
      "Infinite — `<=` has no stopping point",
      "6 rows, last value 6 — 5 passes the test and emits 6 before anything fails",
    ],
    answer: 3,
    why: "The WHERE is a test on the queued source row, not on the output. 1..5 all pass `n <= 5`, each emitting n+1, so 6 is produced; 6 then fails and stops. One comparison operator shifts the whole window: `n < 5` → 1..5, `n <= 5` → 1..6.",
    notes: [
      { choice: 0, why: "The tempting one. The value 5 is never 'rejected from the output' — it was already emitted by 4. The filter only decides who spawns a successor." },
    ],
  },
  { id: "dr4-rec-21", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Anchor `SELECT 1`, step `SELECT n+1 FROM t WHERE n < 1`. What comes back?",
    choices: [
      "Exactly one row, n = 1 — the anchor survives; 1 fails the step's test, so no successor is ever emitted",
      "Zero rows — a step that emits nothing voids the anchor too",
      "An infinite loop — 1 keeps regenerating 1 forever",
      "An error — the step's WHERE must admit at least one row",
    ],
    answer: 0,
    why: "The anchor is unconditional: 1 lands in the queue. The step then tests 1 against n < 1, fails, and emits nothing — the recursion is over after one round. The result is the seed alone, the cleanest demonstration that the anchor and the step's filter are independent.",
    notes: [
      { choice: 1, why: "The step cannot retroactively cancel the anchor. Whatever the seed produced is already part of the result." },
    ],
  },
  { id: "dr4-rec-22", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Anchor `SELECT 0`, step `SELECT n+1 FROM t WHERE n < 5`. What sequence comes out?",
    choices: [
      "1,2,3,4,5 — the anchor row is skipped when it is zero",
      "0,1,2,3,4,5 — six rows; the zero seed joins the emissions, and 5 fails the test",
      "0,1,2,3,4 — five rows; zero-based counters stop one early",
      "5,4,3,2,1,0 — the step counts down from the seed",
    ],
    answer: 1,
    why: "0 is an ordinary queued row: it passes n < 5 and emits 1, then 1 emits 2, and so on — sources 0,1,2,3,4 all pass, each emitting its successor, so 5 appears while 5 itself fails and stops. Six rows: the seed plus the five emissions.",
    notes: [
      { choice: 2, why: "The five-row intuition comes from seed 1. With seed 0 there are five passing sources (0..4) plus the seed itself — the arithmetic shifts with the seed." },
    ],
  },
  { id: "dr4-rec-23", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM t WHERE n < 10) SELECT group_concat(n) FROM t LIMIT 3` returns what?",
    choices: [
      "The string `1,2,3` — LIMIT interrupts the queue after three rows",
      "An error — LIMIT may not follow a recursive CTE",
      "The full string `1,2,3,4,5,6,7,8,9,10` in one row — group_concat folds the finished CTE, then LIMIT trims rows (there is only one)",
      "Three identical rows, each the full concat",
    ],
    answer: 2,
    why: "Verified: the full 1..10 concat. The CTE materializes completely before the outer SELECT runs; group_concat folds all ten rows into one, and the outer LIMIT then applies to that single-row result. An outer LIMIT is not a recursion brake — only a LIMIT inside the body is.",
    notes: [
      { choice: 0, why: "That is body-LIMIT behavior (`… FROM t WHERE n < 100 LIMIT 5` stops at 1..5). At the outer level the queue has already drained." },
    ],
  },

  // ---------- errors ----------
  { id: "dr4-rec-24", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "What does SQLite make of `WITH RECURSIVE a AS (SELECT 1), RECURSIVE b AS (SELECT 2) SELECT * FROM a, b`?",
    choices: [
      "It runs — RECURSIVE is harmlessly re-asserted for b",
      "It runs, but only a exists — b is silently dropped",
      "'circular reference: b' — the second keyword confuses the dependency tracker",
      "'near \"b\": syntax error' — RECURSIVE is written once, immediately after WITH, never mid-list",
    ],
    answer: 3,
    why: "Verified: the parser trips on the token after the stray keyword and reports near \"b\": syntax error. The WITH grammar is `WITH [RECURSIVE] name[(cols)] AS (…) [, name[(cols)] AS (…)]*` — the keyword belongs to the clause, not to individual CTEs.",
    notes: [
      { choice: 0, why: "There is exactly one optional RECURSIVE slot, right after WITH. After a comma the parser expects a CTE name — RECURSIVE there is garbage, and the error surfaces at the next token." },
    ],
  },
  { id: "dr4-rec-25", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "The step reads the CTE twice: `WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT a.n + b.n FROM t a, t b WHERE a.n < 5) SELECT max(n) FROM t`. What error?",
    choices: [
      "'multiple references to recursive table: t' — the step may read the recursive CTE exactly once",
      "'no such column: n' — the aliases a and b hide the column",
      "It runs and returns 10 — the two references multiply the rounds",
      "'table t has 2 values for 1 columns' — the step's arity is wrong",
    ],
    answer: 0,
    why: "Verified: multiple references to recursive table: t. A recursive step may reference the recursive table once and only once in its FROM — two references would need rounds that have not happened yet, so SQLite rejects the shape outright rather than guessing an order.",
    notes: [
      { choice: 2, why: "n plus n from two independent streams is not even defined mid-recursion — there is no pair of 'current' rows to join. The single-reference rule is what keeps each round computable." },
    ],
  },
  { id: "dr4-rec-26", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`WITH RECURSIVE t(n) AS (SELECT 1, 2 UNION ALL SELECT n+1 FROM t WHERE n < 3) SELECT * FROM t` fails how?",
    choices: [
      "'SELECTs to the left and right of UNION do not have the same number of result columns'",
      "'table t has 2 values for 1 columns' — the anchor's width must match the declared column list",
      "It runs — the extra anchor column is dropped to fit (n)",
      "'circular reference: t' — width drift reads as a cycle",
    ],
    answer: 1,
    why: "Verified: table t has 2 values for 1 columns. The declared column list (n) fixes the row width, and the anchor supplied two values. Every member of a recursive body must agree with the declared arity — the same positional rule as any compound, checked against the header.",
    notes: [
      { choice: 0, why: "That is the plain-compound message from the UNION drills. Here the mismatch is between the anchor and the CTE's declared columns, so SQLite words it against the table." },
    ],
  },
  { id: "dr4-rec-27", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "The step hides its self-reference in a subquery: `WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM (SELECT n FROM t) WHERE n < 5) SELECT count(*) FROM t`. Result?",
    choices: [
      "It runs — the subquery is flattened and behaves like a direct reference",
      "'no such column: n' — the inner SELECT cannot see t",
      "'circular reference: t' — the recursive table must appear directly in the step's FROM, never inside a subquery",
      "'multiple references to recursive table: t' — the subquery counts as a second reference",
    ],
    answer: 2,
    why: "Verified: circular reference: t. SQLite requires the recursive table exactly once, directly in the recursive member's FROM clause — burying it in a subquery is a different, also-fatal shape, and it earns the circular-reference diagnosis.",
    notes: [
      { choice: 3, why: "Two visible references earn 'multiple references to recursive table: t'. A hidden reference inside a subquery earns 'circular reference: t' — related shapes, distinct verified messages." },
    ],
  },

  // ---------- predict ----------
  { id: "dr4-rec-28", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Counter `WITH RECURSIVE cnt(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM cnt WHERE n < 5) SELECT group_concat(n) FROM cnt` — output?",
    choices: [
      "`1,2,3,4` — the row that fails the test is excluded from the result",
      "`2,3,4,5` — the anchor is not part of a recursive CTE's output",
      "`1,2,3,4,5,6` — the step emits one row past the limit",
      "`1,2,3,4,5` — anchor 1 plus emissions from the passing rows 1..4",
    ],
    answer: 3,
    why: "Verified on db/custom.db: 1,2,3,4,5. The anchor contributes 1; queued rows 1,2,3,4 pass n < 5 and emit 2,3,4,5; the dequeued 5 fails and emits nothing. Seed plus four emissions, concatenated in queue order.",
    notes: [
      { choice: 0, why: "The failing row 5 was already emitted by 4 — rejection removes it from the QUEUE (no successor), not from the result." },
    ],
  },
  { id: "dr4-rec-29", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Change the stop to `WHERE n < 10` and select `count(*)` instead. What is the count?",
    choices: [
      "10 — the anchor 1 plus emissions from the passing rows 1..9",
      "9 — only the rows that passed the WHERE are kept",
      "11 — the count includes the first failing row",
      "It never finishes — `n < 10` with step +1 cannot terminate",
    ],
    answer: 0,
    why: "Verified: count 10, values 1 through 10. Rows 1..9 pass the step's test and each emit their successor (the last emission being 9+1=10); the dequeued 10 fails and stops the recursion. Seed (1) plus nine emissions = 10 rows.",
    notes: [
      { choice: 1, why: "The step's WHERE does not filter the output — it filters which queued rows spawn successors. Every emitted value lands in the result." },
    ],
  },
  { id: "dr4-rec-30", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "`WITH RECURSIVE d(day) AS (SELECT date(MIN(created_at)) FROM orders UNION ALL SELECT date(day, '+1 day') FROM d WHERE day < (SELECT date(MAX(created_at)) FROM orders)) SELECT count(*) FROM d`?",
    choices: [
      "84 — the number of days that carry at least one order",
      "424 — every day from 2024-01-01 through 2025-02-27 inclusive",
      "103 — one row per order",
      "423 — the anchor day and the last step overlap",
    ],
    answer: 1,
    why: "Verified: 424 rows, 2024-01-01 through 2025-02-27. The anchor seeds the min date; each queued day below the max emits the next day; the final day emits nothing. 2024 is a leap year, so the span is 366 + 58 = 424 calendar days.",
    notes: [
      { choice: 0, why: "84 is the distinct order-date count. The ladder enumerates the range, not the data — that is the whole point of laddering over a table." },
    ],
  },
  { id: "dr4-rec-31", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Ladder over ids: `WITH RECURSIVE i(id) AS (SELECT MIN(id) FROM customers UNION ALL SELECT id+1 FROM i WHERE id < (SELECT MAX(id) FROM customers)) SELECT count(*) FROM i`?",
    choices: [
      "15 — MAX(id) itself is excluded, ladder-style",
      "17 — the ladder overshoots MAX by one, as the counter did",
      "16 — ids 1..16 are contiguous, so the +1 walk lands on every customer id exactly once",
      "103 — the ladder follows the orders table instead",
    ],
    answer: 2,
    why: "Verified: 16 rows, ids 1 through 16. customers holds ids 1..16 with no gaps, so stepping +1 from MIN to MAX hits each id once; the id equal to MAX fails the test and stops the walk. Had an id been missing, the ladder would still emit every integer in the span — it counts numbers, not rows.",
    notes: [
      { choice: 1, why: "Overshoot happens when the last PASSING value emits past the bound. Here MAX itself is the first failure, so the walk ends exactly at 16." },
    ],
  },
  { id: "dr4-rec-32", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Anchor `SELECT 1`, step `SELECT n*2 FROM t WHERE n < 1000`. How many rows, and what is the last value?",
    choices: [
      "10 rows, last 512 — the first power of two at or above 1000 is excluded",
      "9 rows, last 256 — the test rejects 512 outright",
      "1000 rows — the doubling fills the range",
      "11 rows, last 1024 — 512 still passes `n < 1000` and emits 1024, which fails and stops",
    ],
    answer: 3,
    why: "Verified on db/custom.db: 11 rows ending 1024. The WHERE tests each queued source before emission, so 512 (< 1000) emits 512×2 = 1024; 1024 then fails the test and the queue drains. The first failing source is always already in the output.",
    notes: [
      { choice: 0, why: "The off-by-one trap. 'Last value under the bound' would require testing the EMITTED value (`WHERE n*2 < 1000`), not the source." },
    ],
  },
  { id: "dr4-rec-33", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Join the 424-day created_at ladder to orders on `date(created_at) = day` and count the ladder days with no matching order. How many?",
    choices: [
      "340 — 424 calendar days minus the 84 distinct order dates",
      "84 — the days that have orders",
      "103 — the orders spread over the missing days",
      "0 — every calendar day in the span has at least one order",
    ],
    answer: 0,
    why: "Verified inputs: the ladder spans 424 days (2024-01-01..2025-02-27) and orders carry 84 distinct dates. A LEFT JOIN from ladder to orders counting NULL matches leaves 424 − 84 = 340 orderless days — exactly the gap analysis the ladder exists for.",
    notes: [
      { choice: 1, why: "That counts the days WITH orders. The question asks for the complement, which only exists because the ladder fills the calendar." },
    ],
  },

  // ---------- judgment ----------
  { id: "dr4-rec-34", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "'List every customer who has placed at least one order.' A teammate reaches for WITH RECURSIVE. Correct call?",
    choices: [
      "Yes — recursion is the modern way to express any cross-table lookup",
      "No — customers→orders is a plain one-level parent-child link with no self-referencing FK in this schema; a join or EXISTS answers it directly",
      "Only if the orders table exceeds 100 rows — recursion beats joins past that size",
      "Yes, but only with UNION ALL between the members",
    ],
    answer: 1,
    why: "The storefront has no self-referencing foreign key: an order points at a customer, period — there is no chain of unknown depth to walk. `EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)` or a DISTINCT join finishes in one pass; recursion would add machinery and zero insight.",
    notes: [
      { choice: 0, why: "Recursion earns its keep on graphs and trees — org charts, bills of materials, transitive closures. 'Two tables related by a FK' is just a join." },
    ],
  },
  { id: "dr4-rec-35", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Which of these tasks genuinely calls for a recursive CTE?",
    choices: [
      "Top 5 orders by total, with customer names attached",
      "Revenue per region across customers and orders",
      "Every component in a bill of materials, where each part may contain sub-parts of unknown depth",
      "Distinct order statuses in the orders table",
    ],
    answer: 2,
    why: "A BOM is a true self-referencing graph: parts contain parts contain parts, depth unknown at write time. Recursion walks it level by level until a round adds nothing. The other three are one-pass jobs — ORDER BY/LIMIT, a GROUP BY join, DISTINCT — with no self-reference anywhere.",
    notes: [
      { choice: 0, why: "A fixed top-N is derived-table work. Reaching for RECURSIVE there hides a simple sort behind a queue." },
    ],
  },
  { id: "dr4-rec-36", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "customers → orders → invoices → payments: a chain of KNOWN depth, four tables. Recursion or joins?",
    choices: [
      "Recursion — any multi-table walk is 'recursive' by definition",
      "Recursion with UNION, to keep the four levels from duplicating rows",
      "Either — SQLite optimizes both into the identical plan",
      "Plain joins — the depth is fixed and known, so three JOINs state it directly; recursion buys nothing",
    ],
    answer: 3,
    why: "Recursion is for unknown depth. Here the depth is a compile-time fact: customers JOIN orders JOIN invoices JOIN payments is one readable statement the planner optimizes normally, with no queue. A recursive walk over a fixed chain is ceremony with a runtime cost.",
    notes: [
      { choice: 2, why: "Nothing merges the two. The recursive plan materializes a queue and iterates; the join plan searches indexes. Same rows out, very different machinery." },
    ],
  },
  { id: "dr4-rec-37", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "You are writing a 1..1000 number generator as a recursive CTE. Which compound operator between the members?",
    choices: [
      "UNION ALL — a strict counter never repeats a value, so per-row dedup is pure overhead",
      "UNION — always, because dedup also protects against runaway recursion",
      "Neither — recursive bodies must use a JOIN between members",
      "UNION for the first 500, UNION ALL after — SQLite mixes operators per round",
    ],
    answer: 0,
    why: "UNION makes the engine test every candidate row against everything already produced — worthwhile when rows can cycle, wasted when the step is strictly monotonic. For a counter, UNION ALL streams each round straight into the queue with no set maintenance.",
    notes: [
      { choice: 1, why: "Dedup does not make a non-repeating step terminate any sooner — the WHERE stops it. UNION is a semantic tool for cyclic data, not a safety net." },
    ],
  },
  { id: "dr4-rec-38", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "SQLite accepts `WITH RECURSIVE` on a CTE that never references itself (verified: `WITH RECURSIVE p AS (SELECT 1) …` runs and returns 42). Should you write it there?",
    choices: [
      "Yes — flagging every CTE RECURSIVE future-proofs it in case it grows a step",
      "No — it is legal but misleading: readers hunt for a self-reference that does not exist; write plain WITH",
      "No — it changes the plan to a queue even without a step, so it is slower",
      "Yes — RECURSIVE CTEs are always materialized, which beats CO-ROUTINE streaming",
    ],
    answer: 1,
    why: "The engine does not care — the keyword only grants the ability to self-reference — but code is read by people. A RECURSIVE header with no recursive member is a false signal, the same class of noise as an unused import. Keep RECURSIVE for bodies that actually walk.",
    notes: [
      { choice: 2, why: "No queue appears for a step-less CTE. Whether a plain CTE materializes or streams follows its reference count — twice-referenced shows MATERIALIZE in EXPLAIN QUERY PLAN, single-reference streams as CO-ROUTINE — not the RECURSIVE keyword." },
    ],
  },
  { id: "dr4-rec-39", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "You need a calendar-day ladder to audit order coverage. Why reach for WITH RECURSIVE rather than a built-in?",
    choices: [
      "No reason — SQLite ships a built-in days() table generator",
      "Because recursive CTEs are the only way to touch the orders table at all",
      "Because stock SQLite has no generate_series — a recursive CTE is the idiomatic way to synthesize a number or date sequence",
      "Because recursive CTEs run outside the transaction, so ladders are free",
    ],
    answer: 2,
    why: "Vanilla SQLite — the engine behind db/custom.db — has no sequence generator in core; generate_series is an extension, not a given. A counter CTE (anchor, +1-day step, WHERE past the max) is the standard idiom, verified here: 424 days from 2024-01-01 to 2025-02-27.",
    notes: [
      { choice: 0, why: "There is no such built-in in the core engine. If a build ships the series extension you would prefer it — but do not count on it being loaded." },
    ],
  },
  { id: "dr4-rec-40", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Which storefront question is the ONE here that a recursive CTE genuinely serves best?",
    choices: [
      "Which customers have more than one pending order?",
      "Top 3 orders by total, with customer names",
      "Customers who have no invoice at all",
      "How many consecutive-day order streaks of 3+ days exist, counting orderless calendar days correctly?",
    ],
    answer: 3,
    why: "Streak analysis needs the full calendar — including the 340 orderless days inside the 424-day span — to decide where a streak breaks, so a date ladder joined to distinct order dates is the natural tool. The others are single-pass GROUP BY / ORDER BY+LIMIT / NOT EXISTS jobs (pending: 14 orders across 8 customers).",
    notes: [
      { choice: 0, why: "GROUP BY customer_id HAVING count(*) > 1 over pending orders answers it — no walk, no queue, no calendar." },
    ],
  },
];
