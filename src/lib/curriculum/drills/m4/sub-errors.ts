// Drill set — Subquery errors (Module 4, secondary, 40 questions).
// Scope: reading and fixing subquery/CTE failures on db/custom.db — the
// one-level aggregate compare and its staged fix; CTE chain punctuation;
// ghost column names from un-aliased stages; scalar silent bugs; WHERE vs
// HAVING placement; runs-and-lies diagnosis.
// Engine-verified receipts (db/custom.db, scripts/m4-facts-out.txt):
// WHERE SUM(o.total) > AVG(o.total) in one SELECT → hard prepare error
// "misuse of aggregate function AVG()"; the HAVING twin (own AVG) runs and
// LIES: 14/16 customers (P55; true iff 2+ orders — 2 solo-order customers,
// P29). Scalar multi-row runs silently taking the FIRST row: stamp query →
// 16 rows, 1 distinct stamp (P14/P15); active-compare → 14 (probe). Two
// bars: storewide avg ORDER 338.19 (P26/P50) vs avg CUSTOMER lifetime spend
// 2177.08 (P38/P50); min/max lifetime 444.80/7262.35 (P38); >338.19 → 16
// (P52), >2177.08 → 5 (P44 over_2000 twin; spends bracketed in P34).
// Un-aliased expression stages expose expression-text names: "SUM(total)"
// (probe) and literally "1" (P39). CTE shadowing a real table → ghost row
// (P45). Empty-set edges: IN → 0 (P12), NOT IN → 16 (P13), EXISTS probe → 0,
// NOT EXISTS → 16 (P21/P22). Recursive counter 1..5 (P46).
// Error strings probed THIS session (2 inline readonly batches): missing
// comma between CTE bodies → near "b": syntax error; stacked WITH → near
// "WITH": syntax error; semicolon mid-chain and inside a body → near ";":
// syntax error; two columns in an IN list → near ",": syntax error; IN
// subquery of width 2 → "sub-select returns 2 columns - expected 1";
// duplicate CTE name → "duplicate WITH table name: d"; outer-only column →
// "no such column: spend"; qualifying with a never-written stage alias →
// "no such column: d.spend" (alias written: 4 rows over 3000, probe);
// derived-stage alias referenced from an inner subquery FROM → "no such
// table: d" (the twice-referenced CTE is the legal form, P44/P48); typo'd
// correlation column → "no such column: customers_id"; bare customer_id in
// a step binds INNER (vacuous true, storewide avg 338.19) → silently 0 rows.
// Corrections vs briefing, probe-verified on this engine: an alias-LESS
// derived stage PARSES (no near-")" error — failure surfaces only when a
// qualifier or missing column is referenced); a missing RECURSIVE keyword
// does NOT error (the counter returns 1,2,3,4,5 without it); a CTE defined
// but never referenced is legal (returns 7); sibling CTEs may forward-
// reference each other.
// Probes: scripts/m4-facts.ts + 2 inline readonly probe batches (error
// strings, bar counts, legality checks).

import type { DrillQ } from "../types";

const KW = "Subquery errors";

export const SUB_ERRORS: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr4-err-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Two chained stages, one missing comma: `WITH big AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) top AS (SELECT * FROM big WHERE spend > 3000) SELECT * FROM top` dies at prepare. Which one-character fix?",
    choices: [
      "Add a semicolon after the first body: `… GROUP BY customer_id); top AS (…`",
      "Add a comma after the first body: `… GROUP BY customer_id), top AS (…`",
      "Repeat the WITH: `WITH big AS (…) WITH top AS (…) SELECT …`",
      "Alias the second body: `top AS (…) t SELECT * FROM t`",
    ],
    answer: 1,
    why: "The WITH list is comma-separated, one name per link. Without the comma the parser meets `top` right after the closing paren and stops: near \"top\": syntax error (probe-verified). One comma chains the two stages.",
    notes: [
      { choice: 2, why: "A second WITH restarts the clause — near \"WITH\": syntax error (probe-verified). Chaining happens inside ONE WITH via commas between bodies." },
    ],
  },
  { id: "dr4-err-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "A student 'ends' the CTE with a semicolon: `WITH big AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id); SELECT * FROM big`. What happens?",
    choices: [
      "Prepare fails: near \";\": syntax error — a WITH must be followed by its main SELECT, not a semicolon",
      "Runs — the semicolon just separates the CTE from the main SELECT",
      "Runs — but `big` is invisible to the main SELECT, so it fails later with no such table: big",
      "Prepare fails: no such table: big",
    ],
    answer: 0,
    why: "Probe-verified exact string: near \";\": syntax error. The semicolon arrives while the parser still expects the main SELECT of the WITH statement. Semicolons end whole statements; a WITH clause owns the SELECT that follows it.",
    notes: [
      { choice: 3, why: "Tempting, but the failure is purely grammatical and earlier — the parser never gets far enough to look up the name `big`." },
    ],
  },
  { id: "dr4-err-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Two WITH clauses are stacked back-to-back: `WITH big AS (SELECT 1 AS x) WITH top AS (SELECT 2 AS x) SELECT * FROM top`. Which diagnosis is right?",
    choices: [
      "Legal — the second WITH extends the first",
      "Legal — the second WITH shadows the first",
      "Prepare fails: near \"WITH\": syntax error — one statement carries one WITH clause",
      "Runs, but only `top` exists — `big` is silently dropped",
    ],
    answer: 2,
    why: "A WITH clause prefixes exactly one statement. After the first parenthesized body the parser accepts a comma, another body name, or the main SELECT — a second WITH keyword is a parse error: near \"WITH\": syntax error (probe-verified). Chain stages with commas inside the single WITH.",
    notes: [
      { choice: 0, why: "Chaining is real, but it is spelled with commas between bodies (`WITH a AS (…), b AS (…) SELECT …`), never with a repeated WITH keyword." },
    ],
  },
  { id: "dr4-err-04", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "This WHERE tries to match two columns against one list: `SELECT name FROM customers WHERE region, active IN ('EU', 1)`. What does SQLite say?",
    choices: [
      "Runs — the IN tests both columns pairwise",
      "Runs — but only `region` is tested; `active` is ignored",
      "Prepare fails: no such column: active",
      "Prepare fails: near \",\": syntax error — IN takes ONE expression on its left",
    ],
    answer: 3,
    why: "IN is a single-expression operator: `<expr> IN (<list>)`. After `region` the comma is junk to the parser → near \",\": syntax error (probe-verified). Two conditions need two predicates joined by AND, or SQLite row-values: `(region, active) IN (VALUES ('EU', 1))`.",
    notes: [
      { choice: 0, why: "Pairwise matching needs row-value syntax on BOTH sides — `(a, b) IN ((1, 2), (3, 4))` — and still exactly one comma-free expression on the left of IN." },
    ],
  },
  { id: "dr4-err-05", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "`SELECT name FROM customers WHERE id IN (SELECT customer_id, total FROM orders)` fails at prepare. Why is this shape rejected while a one-column IN-subquery passes?",
    choices: [
      "Because the subquery must be correlated to sit inside IN",
      "Because IN compares ONE value against the list — sub-select returns 2 columns - expected 1",
      "Because aggregates in the subquery are illegal",
      "Because the subquery is missing ORDER BY",
    ],
    answer: 1,
    why: "The IN operand's WIDTH is checked at prepare time: the inner SELECT must return exactly one column. Two columns → the engine's exact words: sub-select returns 2 columns - expected 1 (probe-verified). Project only the key you are matching: `SELECT customer_id FROM orders`.",
    notes: [
      { choice: 2, why: "Aggregates are fine inside IN subqueries (`IN (SELECT customer_id FROM orders GROUP BY customer_id)`) — width, not content, is what failed here." },
    ],
  },
  { id: "dr4-err-06", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Inside a CTE body: `WITH a AS (SELECT 1 AS x; SELECT 2 AS x) SELECT * FROM a`. Where does this break?",
    choices: [
      "Runs — the body returns the second SELECT's rows",
      "Runs — the two SELECTs are unioned inside the body",
      "Prepare fails: near \";\": syntax error — a body is ONE SELECT",
      "Prepare fails: duplicate WITH table name: a",
    ],
    answer: 2,
    why: "A CTE body holds a single SELECT (it may itself contain compound arms, but never a statement separator). The parser meets the semicolon before the closing paren → near \";\": syntax error (probe-verified). Two steps need two comma-separated bodies.",
    notes: [
      { choice: 3, why: "`duplicate WITH table name` is the error for defining the SAME name twice (`WITH a AS (…), a AS (…) SELECT …`) — a different failure in a different spot." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr4-err-07", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`WITH unused AS (SELECT 42 AS x) SELECT 7 AS y` — the CTE is never referenced. What does SQLite actually do?",
    choices: [
      "Runs and returns one row, y = 7 — an unreferenced CTE is legal, just dead weight",
      "Prepare fails: CTE defined but never used",
      "Runs and returns 42 — the unused CTE's result leaks out",
      "Runs, printing a warning about the unreferenced CTE",
    ],
    answer: 0,
    why: "Probe-verified: the query returns exactly y = 7. Defining a CTE you never read is NOT an error — the parser accepts it and the engine never materializes it. The cost is human: readers hunt for a reference that does not exist.",
    notes: [
      { choice: 1, why: "SQLite checks shapes and names it must RESOLVE; an unused definition resolves nothing, so nothing can fail. Legal-but-dead is the diagnosis." },
    ],
  },
  { id: "dr4-err-08", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`SELECT name, (SELECT region FROM customers) AS stamp FROM customers` runs with no error. What does the output look like on db/custom.db?",
    choices: [
      "16 rows, each stamp differing by row — the subquery re-runs per outer row",
      "An error: the scalar subquery returns 16 rows",
      "16 rows, ALL stamps identical — the scalar took the first row the inner scan produced",
      "One row — the scalar subquery collapses the outer query to its first row",
    ],
    answer: 2,
    why: "A scalar position accepts one value; given 16 rows SQLite silently takes the FIRST and never complains. Probe-verified: 16 rows out, exactly 1 distinct stamp (P15). Every row carries a copy of the first customer's region.",
    notes: [
      { choice: 0, why: "Per-row variation requires correlation to the outer row. This subquery has no outer reference — every 're-run' would be identical anyway, and SQLite does not even bother re-running it." },
    ],
  },
  { id: "dr4-err-09", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "You want customers whose lifetime spend beats 3000 and wrote: `SELECT c.name FROM customers c JOIN orders o ON o.customer_id = c.id WHERE SUM(o.total) > 3000 GROUP BY c.id`. Which clause does that comparison belong in?",
    choices: [
      "WHERE — just wrap the SUM in parentheses and it works",
      "ORDER BY — aggregates sort results, they never filter them",
      "It cannot be expressed in one SELECT at all",
      "HAVING — the test is over an aggregate of a GROUP, so it must run after grouping",
    ],
    answer: 3,
    why: "WHERE filters individual rows BEFORE groups exist, so it has no SUM to test — aggregates are illegal there. The per-customer total only exists after GROUP BY, and HAVING is exactly the post-group filter: `GROUP BY c.id HAVING SUM(o.total) > 3000`.",
    notes: [
      { choice: 0, why: "Parentheses change nothing — the ban covers aggregates in WHERE whatever the punctuation (prepare fails with misuse of aggregate function AVG() on the twin query, probe-verified)." },
    ],
  },
  { id: "dr4-err-10", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`WITH customers AS (SELECT 'ghost row' AS name) SELECT name FROM customers` — no typo, no alias collision in the WITH list. What comes back?",
    choices: [
      "One row: 'ghost row' — the CTE name shadows the real table for this whole statement",
      "The 16 real customer names — the real table beats the CTE",
      "Prepare fails: duplicate table name: customers",
      "One row: 'ghost row' followed by the 16 real names",
    ],
    answer: 0,
    why: "Names defined in the WITH clause win over same-named real tables for the entire statement (probe-verified on db/custom.db: exactly 'ghost row', P45). The shadow is silent — nothing warns you that `customers` no longer means customers here.",
    notes: [
      { choice: 2, why: "The clash that IS an error is two CTEs claiming one name (`duplicate WITH table name: d`, probe-verified). CTE-vs-real-table is legal and quietly takes over." },
    ],
  },

  // ---------- edge ----------
  { id: "dr4-err-11", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`SELECT COUNT(*) AS n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'void')` — 'void' matches no order status. What is n?",
    choices: [
      "0 — an empty IN list matches nobody",
      "16 — an empty list is treated as 'match everything'",
      "Prepare fails — the subquery returns no rows",
      "NULL — COUNT turns NULL over an empty match set",
    ],
    answer: 0,
    why: "Probe receipts (P12/P13): the empty IN returns 0 while the NOT IN twin returns 16 — an empty list is simply 'nothing matches'. No error, and no NULL poison on the IN side; the dangerous twin is NOT IN over a column that can hold NULLs.",
    notes: [
      { choice: 2, why: "Empty results are ordinary values for set predicates — only shape problems (like a 2-column SELECT inside IN) are rejected at prepare." },
    ],
  },
  { id: "dr4-err-12", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'void')` — no 'void' orders exist. What is n?",
    choices: [
      "0 — NOT EXISTS fails when the subquery finds nothing",
      "16 — for every customer the inner probe finds nothing, so NOT EXISTS is true",
      "NULL — NOT EXISTS over an empty set is unknown",
      "It depends on which customers have orders at all",
    ],
    answer: 1,
    why: "EXISTS asks 'did the probe find anything?' — with a status no row has, the probe is empty for all 16 customers, so NOT EXISTS is true for all (probe receipts P21/P22: EXISTS → 0, NOT EXISTS → 16). Unlike NOT IN, NOT EXISTS is immune to NULLs.",
    notes: [
      { choice: 3, why: "Everyone passes because the inner filter is impossible, not because of their order history. Swap the status to 'delivered' and only customers with no delivered order remain." },
    ],
  },
  { id: "dr4-err-13", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "The RECURSIVE keyword is deleted: `WITH cnt(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM cnt WHERE n < 5) SELECT group_concat(n) FROM cnt`. On this engine, what happens?",
    choices: [
      "Prepare fails: circular reference: cnt",
      "Prepare fails: recursive query requires the RECURSIVE keyword",
      "Runs but stops after the anchor — one row",
      "Runs and returns 1,2,3,4,5 — the self-reference alone marks it recursive here",
    ],
    answer: 3,
    why: "Probe-verified on this SQLite build: the counter runs identically without the keyword and returns 1,2,3,4,5. A self-referencing CTE is treated as recursive whether or not RECURSIVE is spelled — keep writing the keyword anyway for readability and older engines.",
    notes: [
      { choice: 0, why: "The `circular reference` failure belongs to different surgery — hiding the recursive table inside a step subquery (sibling cte-recursive receipt) — not to a missing keyword." },
    ],
  },
  { id: "dr4-err-14", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`WITH a AS (SELECT * FROM b), b AS (SELECT 1 AS x) SELECT * FROM a` — `a` reads `b` before `b` is defined. What happens on this engine?",
    choices: [
      "Prepare fails: no such table: b",
      "Prepare fails: near \"b\": syntax error",
      "Runs — but `a` sees an empty `b` and returns nothing",
      "Runs and returns x = 1 — sibling CTEs resolve as one scope, order does not matter",
    ],
    answer: 3,
    why: "Probe-verified: returns one row, x = 1. All names in one WITH clause are resolved together as a single scope, so a body may reference a sibling defined 'later' — evaluation starts at the main SELECT. Still, define-before-use reads better.",
    notes: [
      { choice: 0, why: "`no such table` is for names genuinely out of scope — e.g. a derived-stage alias referenced from an inner subquery's FROM (probe: no such table: d), not an in-scope sibling." },
    ],
  },

  // ---------- errors ----------
  { id: "dr4-err-15", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT c.name FROM customers c JOIN orders o ON o.customer_id = c.id WHERE SUM(o.total) > AVG(o.total)` fails at prepare. Which error does SQLite actually print?",
    choices: [
      "aggregate functions are not allowed in WHERE",
      "misuse of aggregate function SUM()",
      "misuse of aggregate function AVG()",
      "wrong number of arguments to function SUM()",
    ],
    answer: 2,
    why: "Probe-verified exact string: misuse of aggregate function AVG(). Even though SUM() appears first in the expression, the resolver names AVG() — quote the error you SAW, not the one you predicted, or your later search for it comes up empty.",
    notes: [
      { choice: 1, why: "Both aggregates are equally illegal here; which one the message names depends on the engine's resolution order. This engine names AVG() — matching the message verbatim is how you find it again." },
    ],
  },
  { id: "dr4-err-16", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "Why is `WHERE SUM(o.total) > AVG(o.total)` rejected while the same compare in `HAVING SUM(o.total) > AVG(o.total)` prepares without complaint?",
    choices: [
      "WHERE cannot contain arithmetic; HAVING can",
      "WHERE runs per-row before any grouping exists — the aggregates have nothing to eat yet; HAVING runs per-group",
      "AVG() requires GROUP BY in any clause, and WHERE has none",
      "It is an alias problem — both clauses work once tables are aliased",
    ],
    answer: 1,
    why: "Clause order is semantic, not cosmetic: WHERE picks the rows that will form groups, so row-collapsing aggregates have no input yet. HAVING fires after GROUP BY, when each group's SUM and AVG exist. The failure is prepare-time — zero rows are ever scanned.",
    notes: [
      { choice: 2, why: "AVG over a whole table needs no GROUP BY (`SELECT AVG(total) FROM orders` works fine). The WHERE ban is about filter-before-group ordering, not a missing GROUP BY." },
    ],
  },
  { id: "dr4-err-17", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "A student tries to legalize it by adding grouping: `… WHERE SUM(o.total) > AVG(o.total) GROUP BY c.id`. What happens on this engine?",
    choices: [
      "Now legal — GROUP BY finally gives the aggregates their groups",
      "Legal but returns garbage — one row per group with NULL sums",
      "Still rejected — the aggregate ban in WHERE is positional and survives any GROUP BY",
      "Only legal if GROUP BY is written before WHERE in the text",
    ],
    answer: 2,
    why: "WHERE is evaluated before grouping no matter where you type it; the prepare-time aggregate check does not care that a GROUP BY exists elsewhere in the statement. The compare must move to HAVING or be staged in a subquery — adding clauses cannot legalize it.",
    notes: [
      { choice: 3, why: "Text order (WHERE … GROUP BY …) is fixed grammar anyway. Even in the correct order, WHERE must stay aggregate-free — clause arrangement is not the loophole." },
    ],
  },
  { id: "dr4-err-18", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`… GROUP BY c.id HAVING SUM(o.total) > AVG(o.total)` runs silently and returns 14 of 16 customers. What comparison did you actually write?",
    choices: [
      "Each customer's total vs the storewide average ORDER total (338.19)",
      "Each customer's total vs the average CUSTOMER lifetime spend (2177.08)",
      "Each customer's total vs 0 — AVG is NULL without its own GROUP BY",
      "Each customer's total vs THEIR OWN average order — always true once a customer has 2+ orders",
    ],
    answer: 3,
    why: "Inside HAVING both aggregates are per-group: SUM vs the AVG of the same rows. SUM > AVG holds whenever the group has two or more orders (single orders tie). Two solo-order customers fail (P29); the other 14 sail through (P55) — a plausible list answering a question nobody asked.",
    notes: [
      { choice: 0, why: "The 338.19 bar would pass ALL 16 — the smallest lifetime spend is 444.80 (P38). The 14-row signature points at the own-average trap, not the storewide one." },
    ],
  },
  { id: "dr4-err-19", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "Staged fix, step 1: which rewrite makes the 'lifetime spend over 3000' filter legal by computing the total in a stage and comparing outside?",
    choices: [
      "`SELECT name FROM customers WHERE SUM(total) > 3000 GROUP BY id`",
      "`SELECT name FROM customers HAVING SUM(total) > 3000`",
      "`SELECT name FROM customers WHERE total > 3000 ORDER BY total`",
      "`SELECT c.name FROM customers c JOIN (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) d ON d.customer_id = c.id WHERE spend > 3000`",
    ],
    answer: 3,
    why: "Grouping happens inside the derived stage; by the time the outer WHERE runs, `spend` is a plain column and plain comparisons are legal. Probe-verified: with the alias written, this returns the 4 customers over 3000 (Alice, Emma, Grace, Maya per P34).",
    notes: [
      { choice: 0, why: "The same WHERE-aggregate error, just shorter. Moving text around cannot help — the aggregate must be computed where grouping has already happened." },
    ],
  },
  { id: "dr4-err-20", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "Step 2: you want the customers above the average CUSTOMER lifetime spend (2177.08). Which staged compare returns the right 5?",
    choices: [
      "`… WHERE spend > (SELECT AVG(total) FROM orders)`",
      "`… WHERE spend > 338.19`",
      "`WITH d AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) SELECT COUNT(*) FROM d WHERE spend > (SELECT AVG(spend) FROM d)`",
      "`… GROUP BY c.id HAVING SUM(o.total) > AVG(o.total)`",
    ],
    answer: 2,
    why: "The bar must be an average OF SUMS: AVG(spend) over the customer stage is 2177.08 (P50), and five customers clear it (P44's twice-referenced CTE pattern). Averaging raw orders gives 338.19 — the per-ORDER bar — which every customer clears (min lifetime 444.80).",
    notes: [
      { choice: 0, why: "Close shape, wrong bar: AVG(total) over orders is 338.19, so this returns 16, not 5. One word — spend vs total — separates the two averages." },
    ],
  },
  { id: "dr4-err-21", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT COUNT(*) FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) d WHERE spend > (SELECT AVG(spend) FROM d)` — the alias d is right there, yet prepare fails. With what?",
    choices: [
      "ambiguous column name: spend",
      "no such column: d.spend",
      "no such table: d — a derived stage's alias is not addressable in an inner subquery's FROM",
      "circular reference: d",
    ],
    answer: 2,
    why: "Probe-verified exact string: no such table: d. A WHERE-clause subquery can see outer COLUMNS, but an outer derived table cannot be named in an inner FROM. Give the stage a real name with a CTE — `WITH d AS (…) … (SELECT AVG(spend) FROM d)` — and the self-reference works (P44/P48).",
    notes: [
      { choice: 1, why: "`no such column: d.spend` is the cousin error for COLUMN references through an alias you never wrote. Here you DID write the alias — the table itself is what the inner FROM cannot see." },
    ],
  },
  { id: "dr4-err-22", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT name FROM customers WHERE spend > (SELECT AVG(total) FROM orders)` fails. Exact error and reason?",
    choices: [
      "no such column: spend — `spend` exists in no row source of this statement",
      "misuse of aggregate function AVG() — the scalar subquery is the offender",
      "near \">\": syntax error — comparisons need parentheses around subqueries",
      "ambiguous column name: spend",
    ],
    answer: 0,
    why: "Probe-verified: no such column: spend. Nothing in this query computes spend — the customers row being filtered has no such column, and subqueries do not lend columns upward. Compute it first (derived stage or CTE), then compare.",
    notes: [
      { choice: 1, why: "The AVG(total) inside the scalar subquery is perfectly legal — it aggregates that subquery's own rows. The failure is the outer reference to a column nobody produced." },
    ],
  },
  { id: "dr4-err-23", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`… FROM customers c JOIN (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) ON d.customer_id = c.id WHERE spend > 3000` — what does SQLite report?",
    choices: [
      "ambiguous column name: customer_id",
      "no such column: d.spend — you qualified with `d` but never wrote the alias after the closing paren",
      "near \"ON\": syntax error",
      "no such table: d — the inner FROM cannot see the join",
    ],
    answer: 1,
    why: "Probe-verified exact string: no such column: d.spend. SQLite happily parses the alias-less stage, but `d` was never bound, so the qualified reference has nothing to resolve. Write the alias — `…) d ON d.customer_id = c.id` — and the same query returns the 4 customers over 3000 (probe-verified).",
    notes: [
      { choice: 2, why: "The grammar is fine without an alias; the failure only surfaces when you USE a table qualifier that was never introduced. Silence until referenced is what makes this one sneaky." },
    ],
  },
  { id: "dr4-err-24", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`WITH d AS (SELECT customer_id, SUM(total) FROM orders GROUP BY customer_id) SELECT spend FROM d` fails. What IS the second column of d actually named?",
    choices: [
      "`spend` — SQLite infers the name from how the outer query uses it",
      "`total` — the argument name carries through the aggregate",
      "It has no name at all — outer references are impossible until aliased",
      "Literally `SUM(total)` — an un-aliased expression column is named by its expression text",
    ],
    answer: 3,
    why: "Probe-verified: the stage exposes `customer_id` and literally `SUM(total)` (P39 shows the same rule naming a bare literal `1`). `spend` resolves to nothing → no such column: spend. Alias at birth — `SUM(total) AS spend` — and the outer query can speak normally.",
    notes: [
      { choice: 2, why: "The column does have a name — the expression text — you simply cannot guess your way to it. The fix is an AS inside the stage, not a naming ritual outside." },
    ],
  },
  { id: "dr4-err-25", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "A stage was written `SELECT customer_id, 1 FROM orders GROUP BY customer_id` and the outer query references `flag`. What does the engine say?",
    choices: [
      "no such column: flag — the literal column is literally named `1` (probe receipt P39)",
      "near \"1\": syntax error — bare literals cannot be selected",
      "It runs — literals automatically take the alias `flag`",
      "It runs with a warning that a column has no name",
    ],
    answer: 0,
    why: "Un-aliased expression columns are named by their expression text, so this stage's second column is named `1` (P39: the probe came back keyed exactly `\"1\"`). Any other spelling — including `flag` — is a different, unknown name. Fix: `SELECT customer_id, 1 AS flag FROM …`.",
    notes: [
      { choice: 1, why: "Literals select fine (`SELECT 1 FROM orders` is 103 rows of 1s). It is the missing AS that makes the name unusable, not the literal itself." },
    ],
  },
  { id: "dr4-err-26", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT COUNT(*) FROM customers c WHERE (SELECT AVG(total) FROM orders WHERE customer_id = customer_id) > 3000` runs and returns 0. Why 0?",
    choices: [
      "The subquery errored internally and returned NULL for every row",
      "The bare `customer_id` binds to the INNER orders table — the filter is always true, so the 'correlated' avg is the storewide 338.19, which clears 3000 for nobody",
      "All customers' own averages are below 3000 — correct answer, badly written",
      "COUNT skips rows where a subquery returns multiple values",
    ],
    answer: 1,
    why: "Scope rule: an unqualified name resolves to the INNERMOST table that has it — orders, not the outer alias c. So `customer_id = customer_id` compares orders to itself (always true) and the avg is the storewide 338.19 (P26). Probe-verified: 0 rows. The intended predicate was `o.customer_id = c.id`.",
    notes: [
      { choice: 2, why: "A correct correlated version would also return 0 at a 3000 bar (sampled own averages peak at 533.59, P27) — but for the right reason. Same number, different query; the difference matters the moment the bar moves." },
    ],
  },
  { id: "dr4-err-27", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "Fixing the vacuous-correlation trap: which version is TRULY correlated — each customer measured against their own order history?",
    choices: [
      "`(SELECT AVG(o.total) FROM orders o WHERE o.customer_id = c.id)`",
      "`(SELECT AVG(total) FROM orders WHERE customer_id = customer_id)` — as-is, it is fine",
      "`(SELECT AVG(total) FROM orders)` — drop the WHERE, less noise",
      "`(SELECT AVG(total) FROM orders WHERE c.customer_id = id)`",
    ],
    answer: 0,
    why: "Correlation needs an explicit outer alias on one side: `o.customer_id = c.id`. The inner scan then keeps only that customer's orders and the avg is their own (P27: c1 302.60, c2 426.22, c3 533.59 …). Without the qualifier the name binds inner and the filter is vacuous.",
    notes: [
      { choice: 3, why: "Backwards: `c.customer_id` does not exist — customers' key is `id` — so this dies with no such column instead of lying. A louder failure, still the wrong query." },
    ],
  },
  { id: "dr4-err-28", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT name FROM customers c WHERE (SELECT COUNT(*) FROM orders WHERE customers_id = c.id) > 5` — one letter off in the inner column name. Exact failure?",
    choices: [
      "Runs — SQLite fuzzy-matches customers_id to customer_id",
      "Prepare fails: no such column: customers_id",
      "Prepare fails: ambiguous column name: customers_id",
      "Runs — the bad predicate is dropped and all orders count",
    ],
    answer: 1,
    why: "Probe-verified exact string: no such column: customers_id. Name resolution is exact — no fuzzy matching, no nearest-column fallback. The alias side (`c.id`) resolved fine; the typo'd side found no home. The message names the offender verbatim: read the column name in the error first.",
    notes: [
      { choice: 3, why: "SQLite resolves each name or fails; it never silently drops a predicate. A filter that looks ignored is actually the vacuous-true trap — which needs no typo at all." },
    ],
  },
  { id: "dr4-err-29", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "Comparing a column to a multi-row scalar: `… WHERE active = (SELECT active FROM customers)` — the inner SELECT returns 16 rows. On this engine, what happens?",
    choices: [
      "Prepare fails: scalar subquery returned more than one row",
      "Prepare fails: sub-select returns 2 columns - expected 1",
      "Prepare fails: misuse of aggregate function",
      "It runs, silently comparing against the FIRST inner row — probe: 14 of 16 customers matched it",
    ],
    answer: 3,
    why: "WIDTH is checked for IN (sub-select returns 2 columns - expected 1), but row COUNT is not checked in scalar position: a multi-row scalar silently takes the first row (P14). Probe-verified: the active-compare returns 14. The worst kind of bug — it ships without a whisper.",
    notes: [
      { choice: 1, why: "That error is real but belongs to IN over a two-column SELECT — a width check, not a row-count check. Scalars of ANY row count prepare without complaint." },
    ],
  },
  { id: "dr4-err-30", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "Two HAVING variants both 'work': A: `HAVING SUM(o.total) > AVG(o.total)` — B: `HAVING SUM(o.total) > (SELECT AVG(total) FROM orders)`. Which row counts do they return on db/custom.db?",
    choices: [
      "A: 5 — B: 14",
      "A: 16 — B: 5",
      "A: 0 — B: 0",
      "A: 14 — B: 16",
    ],
    answer: 3,
    why: "A compares each customer's total to their own average ORDER — true for anyone with 2+ orders → 14 (P55, probe). B compares to the storewide average ORDER, 338.19, which every lifetime total clears (min 444.80) → 16 (probe-verified). Neither answers 'above average customer spend' (2177.08 → 5); both lies look plausible.",
    notes: [
      { choice: 0, why: "5 is the RIGHT answer to the intended question — and neither variant computes it. The correct bar is AVG(spend) over the customer stage, a CTE re-referenced twice." },
    ],
  },
  { id: "dr4-err-31", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`WITH d AS (SELECT 1 AS x), d AS (SELECT 2 AS x) SELECT * FROM d` — which stage wins? Or does it even reach execution?",
    choices: [
      "Prepare fails: duplicate WITH table name: d",
      "Runs — the second `d` shadows the first, returns 2",
      "Runs — the first `d` wins, returns 1",
      "Prepare fails: near \",\": syntax error",
    ],
    answer: 0,
    why: "Probe-verified exact string: duplicate WITH table name: d. Unlike a CTE shadowing a REAL table (which silently wins, P45), two CTEs claiming one name is a hard prepare error. Rename the second stage (`… , top AS (…)`) and chain on with commas.",
    notes: [
      { choice: 1, why: "Shadowing only happens against real tables. Inside the WITH list itself, a name collision is rejected outright — the one shadow-adjacent case SQLite refuses to guess on." },
    ],
  },
  { id: "dr4-err-32", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "Code review finds `WITH a AS (SELECT * FROM b), b AS (SELECT 1 AS x) SELECT * FROM a` and your teammate calls it a bug. Is it?",
    choices: [
      "No — probe-verified it returns x = 1: sibling CTEs resolve as one scope, definition order does not matter",
      "Yes — it fails with no such table: b at prepare time",
      "Yes — it silently returns nothing because `b` is empty at definition time",
      "No — it returns x = 2, because `b` is re-evaluated after its definition completes",
    ],
    answer: 0,
    why: "Probe-verified: the query runs and returns 1. All names inside one WITH clause are resolved together before execution, so a body may reference a sibling defined 'later'. Legal — though define-before-use is kinder to readers. Surprising is not the same as broken.",
    notes: [
      { choice: 1, why: "Reserve `no such table` for names truly outside the statement — like a derived-stage alias referenced from an inner subquery's FROM (probe: no such table: d)." },
    ],
  },

  // ---------- predict ----------
  { id: "dr4-err-33", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict on db/custom.db: `SELECT COUNT(*) AS n FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) WHERE spend > (SELECT AVG(total) FROM orders)`",
    choices: [
      "5 — the VIPs above average customer spend",
      "8 — the over-1000 club",
      "16 — every lifetime total clears the per-ORDER average of 338.19 (smallest is 444.80)",
      "0 — the two averages cancel out",
    ],
    answer: 2,
    why: "AVG(total) over orders is 338.19 (P26/P50) and the smallest customer lifetime spend is 444.80 (P38), so all 16 customers clear the bar — probe-verified 16 (P52). A correct-looking query answering the WRONG bar: the two-averages trap in the wild.",
    notes: [
      { choice: 0, why: "5 is the count above 2177.08 — the average of customer SUMS. This query's bar averages raw orders, a different number with a plausible-looking result." },
    ],
  },
  { id: "dr4-err-34", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `WITH d AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) SELECT COUNT(*) AS n FROM d WHERE spend > (SELECT AVG(spend) FROM d)`",
    choices: [
      "5 — the customers above the 2177.08 average of customer totals",
      "16 — the same count as the per-order bar",
      "0 — a CTE cannot be referenced from inside a scalar subquery",
      "8 — the over-1000 club again",
    ],
    answer: 0,
    why: "AVG(spend) over the stage is the average CUSTOMER lifetime spend, 2177.08 (P50). Above it: 7262.35, 6640.56, 4574.23, 3644.56, 2667.93 — five (P34; P44's twin bar over_2000 = 5). The twice-referenced CTE is exactly the P44/P48 materialize-and-scan pattern.",
    notes: [
      { choice: 2, why: "CTEs CAN be re-referenced from scalar subqueries — that is precisely why this is a CTE and not an aliased derived stage, which dies with no such table: d (probe-verified)." },
    ],
  },
  { id: "dr4-err-35", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT c.name FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING SUM(o.total) > AVG(o.total)` — how many rows come back?",
    choices: [
      "2 — only the solo-order customers fail the tie",
      "5 — the above-average-customer VIPs",
      "16 — every customer has at least one order",
      "14 — everyone with 2+ orders; the 2 solo-order customers tie instead",
    ],
    answer: 3,
    why: "Within a group AVG is SUM divided by order count, so SUM > AVG holds exactly when the count is 2 or more. Two customers have a single order (P29), tie SUM = AVG, and fail the strict >. Probe-verified: 14 names (P55) — no error, just the wrong question answered confidently.",
    notes: [
      { choice: 1, why: "5 requires the 2177.08 bar of average customer spend. The own-average compare cannot produce it, no matter how the rows are grouped." },
    ],
  },

  // ---------- judgment ----------
  { id: "dr4-err-36", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Your staging query failed fast with `misuse of aggregate function AVG()` while a teammate's HAVING version shipped and returned 14 plausible-looking rows. Which do you prefer, and why?",
    choices: [
      "The HAVING version — errors frighten users, and 14 rows is close enough to 16",
      "The failing version — a prepare-time error stops the bug today; the silent 14 ships a wrong answer with a straight face",
      "Neither — wrap everything in try/catch and log the anomaly instead",
      "The HAVING version — fewer lines of code wins",
    ],
    answer: 1,
    why: "A hard failure is a teacher with a precise message — misuse of aggregate function AVG() points at the offending clause. A lie that ships returns confident, plausible numbers (14 of 16) that nobody re-checks. Prefer the engine catching you at prepare over the user catching you in production.",
    notes: [
      { choice: 0, why: "14 vs 16 is not 'close' — it is the wrong QUESTION. The list answers 'has 2+ orders', not 'above average', and no diff of the two lists reveals which is meant." },
    ],
  },
  { id: "dr4-err-37", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "When is comparing against a multi-row scalar subquery acceptable — `WHERE x = (SELECT y FROM t …)` with many inner rows?",
    choices: [
      "Always — SQLite's first-row rule is deterministic",
      "Only when the inner query can return NULLs — those compare safely",
      "Only when you make the one-row intent explicit — `ORDER BY … LIMIT 1` — so the chosen row is part of the contract",
      "Never — rewrite every scalar subquery as EXISTS",
    ],
    answer: 2,
    why: "Silent first-row (P14/P15: 16 rows stamped with one value) is only acceptable when 'first' MEANS something. Adding ORDER BY + LIMIT 1 turns an accident into a declaration the next reader can verify — and makes scan-order luck irrelevant.",
    notes: [
      { choice: 0, why: "Deterministic is not the same as intended: which row is 'first' is an implementation detail that can shift with the query plan, indexes, or engine version." },
    ],
  },
  { id: "dr4-err-38", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Code review finds `WITH unused AS (SELECT 42 AS x) SELECT 7 AS y` — legal, returns 7. What is the right call?",
    choices: [
      "Ship it — SQLite does not even materialize the unused CTE",
      "Delete the dead stage before shipping — legal is not the same as harmless to readers",
      "Keep it, but add a comment saying it is unused",
      "Keep it — future queries may want to reference it",
    ],
    answer: 1,
    why: "An unreferenced CTE costs nothing at runtime (probe-verified: runs fine) but taxes every reader who traces where `unused` is consumed. Dead stages also rot — the next editor 'fixes' the main query against a stage nobody uses. Delete it, or wire it in.",
    notes: [
      { choice: 0, why: "Runtime-free, review-expensive. The audit that fails is the human one, not the engine's — and dead code never announces itself as dead." },
    ],
  },
  { id: "dr4-err-39", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A CTE named `customers` shadows the real table for one statement and returns 'ghost row' (P45). What is the sane team policy?",
    choices: [
      "Fine occasionally — shadowing is scoped to the statement",
      "Fine as long as the CTE is defined before it is used",
      "Ban shadowing real table names — rename the CTE (customers_over_1000) so every reader knows which rows they are looking at",
      "Ban CTEs entirely and use derived tables instead",
    ],
    answer: 2,
    why: "The shadow is silent and statement-wide: nothing marks that `customers` means something else here (probe-verified ghost row). Names are documentation — `customers_over_1000` says what it is, and the real table keeps its meaning everywhere else.",
    notes: [
      { choice: 0, why: "Scoped is exactly the problem — the scope is the whole statement, including every join and subquery inside it. Legal, quiet, and one refactor away from a wrong join." },
    ],
  },
  { id: "dr4-err-40", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "The WHERE-aggregate error forces a rewrite. Before choosing HAVING vs derived-stage vs CTE, which decision actually determines whether the fix is CORRECT?",
    choices: [
      "Which syntax is shortest — fewer moving parts, fewer errors",
      "Which average you MEAN: per-order 338.19 vs per-customer 2177.08 — the staged fix must preserve the intended bar, not just compile",
      "Whether to use HAVING — it is always the right clause for anything aggregate-shaped",
      "Whether the database has an index on orders.customer_id",
    ],
    answer: 1,
    why: "The error tells you the SHAPE is wrong, not the question. Both bars compile after staging and both return plausible counts (16 vs 5) — so decide 'average of orders or average of customers?' first, then pick the shape (CTE + AVG(spend) → 5). A fix that compiles but moves the bar is a lie with better grammar.",
    notes: [
      { choice: 2, why: "HAVING is right only when the bar is per-group (the customer's own average). For a stage-wide bar like 2177.08, the scalar subquery belongs in WHERE over the staged column." },
    ],
  },
];
