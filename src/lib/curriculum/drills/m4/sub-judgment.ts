// Drill set — Choosing subqueries (Module 4, secondary, 40 questions).
// The judgment set for M4: which shape when — IN-list vs EXISTS vs JOIN vs
// staged CTE — plus the two-bars reading, the VIP pipeline as named stages,
// breadth-vs-volume, the veterans design, LIMIT-in-stage top-N, and the
// performance receipts. Engine-verified receipts (db/custom.db, scripts/
// m4-facts-out.txt): store total 34833.28 over 103 orders (P49); TWO BARS —
// average ORDER 338.19 vs average CUSTOMER lifetime spend 2177.08 (P50) —
// 34833.28/103 vs 34833.28/16. VIP five over 2177.08: Alice Chen 7262.35,
// Emma Wilson 6640.56, Grace Kim 4574.23, Maya Patel 3644.56, Chloe Dubois
// 2667.93 (P51); the bar sits in the rank5–rank6 gap (2667.93 → 1686.17,
// P34). One-level aggregate compare fails: "misuse of aggregate function
// AVG()"; the runs-and-lies HAVING band-aid (MAX(total) > AVG(total))
// returns 14/16 while the storewide bar is cleared by ALL 16 customers
// (P52, P55). Breadth-vs-volume: every customer owns ≥1 order above the
// 338.19 order bar (P52) but only 14 beat their OWN average — the 2
// solo-order customers (P29) tie themselves and contribute 0 stellar
// orders (P30); 45 stellar orders total (P24), top4 Alice 8 / Emma 8 /
// Maya 8 / Grace 6 (P56). Veterans with all four statuses: Alice Chen,
// Emma Wilson, Maya Patel (P53); naive COUNT(*) = 4 returns exactly the 4
// volume impostors — Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez
// — and misses all three veterans (P54). EXISTS shipped → 10 (P18),
// NOT EXISTS → 6 (P20); EXISTS SELECT 1 / * / NULL identical (P23);
// short-circuit: c2 owns 2 orders, 0 shipped (P31). Over-1000 club = 8
// (P35); CTE read twice over_1000=8 / over_2000=5 (P44); top-3 via
// LIMIT-in-stage: #74 Farid Nasser 1088.44, #43 Chloe Dubois 945.21, #39
// Emma Wilson 845.92 (P37). NOT IN collapse over a NULL-bearing list → 0
// (P09, 21 NULL shipped_at values P10), guarded → 12 (P11); clean NOT IN
// (cancelled: 7 orders, 4 distinct ids, P03–P06) → 12 (P07); IN empty → 0
// vs NOT IN empty → 16 (P12/P13); multi-row scalar silently takes the
// first row (P14); uncorrelated scalar-in-SELECT stamps 1 distinct value
// on 16 rows (P15). EQP: uncorrelated IN = LIST SUBQUERY 1 (P17);
// correlated scalar = per-row CORRELATED SCALAR SUBQUERY + SCAN o2 (P32);
// derived = CO-ROUTINE d streams (P41); twice-referenced CTE = MATERIALIZE
// s (P48). Inner spend stage alone = 16 rows (P33); pushdown same answer
// (P36); outer aggregates the stage: 2177.08 / 444.8 / 7262.35 (P38);
// single-ref CTE ≡ inline, 103 (P47). Probes: scripts/m4-facts.ts.

import type { DrillQ } from "../types";

const KW = "Choosing subqueries";

export const SUB_JUDGMENT: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr4-jud-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Stage one of the VIP pipeline — each customer's lifetime spend next to their name. Which query actually produces that?",
    choices: [
      "`SELECT name, SUM(total) FROM customers`",
      "`SELECT c.name, SUM(o.total) AS spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id`",
      "`SELECT name, (SELECT SUM(total) FROM orders) AS spend FROM customers`",
      "`SELECT c.name FROM customers c WHERE SUM(o.total) > 2177.08`",
    ],
    answer: 1,
    why: "Per-customer spend needs the order rows pulled in and grouped per customer: JOIN + GROUP BY c.id yields the 16 spend rows (Alice 7262.35 at the top) that every later stage consumes.",
    notes: [
      { choice: 2, why: "That scalar is uncorrelated — it computes the storewide total 34833.28 once and stamps the SAME number on all 16 rows (one distinct stamp). Correlation is what makes a scalar per-customer." },
      { choice: 3, why: "Aggregates cannot live in WHERE — 'misuse of aggregate function'. And o is not even in that FROM." },
    ],
  },
  { id: "dr4-jud-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Stage two needs the per-customer spend list under the name `spends` so the VIP filter can read it. Which spelling creates that named stage?",
    choices: [
      "`WITH spends AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) SELECT * FROM spends WHERE spend > 2177.08`",
      "`WITH spends SELECT customer_id, SUM(total) FROM orders GROUP BY customer_id`",
      "`(SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) AS spends WHERE spend > 2177.08`",
      "`CREATE TEMP STAGE spends AS SELECT customer_id, SUM(total) FROM orders GROUP BY customer_id`",
    ],
    answer: 0,
    why: "WITH binds a name to one complete, runnable SELECT; the outer query then reads `spends` like any table. That named-stage shape is the whole trick behind readable pipelines — spend first, cut second.",
    notes: [
      { choice: 2, why: "A derived table must sit inside a full outer statement — FROM (…) AS spends. A bare parenthesized SELECT followed by AS is not a statement." },
    ],
  },
  { id: "dr4-jud-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "A derived stage sorts and LIMITs to the top-3 orders. You now want only the single biggest. Where can a LIMIT legally live in this two-layer query?",
    choices: [
      "Only the inner SELECT may carry a LIMIT — the outer layer must re-aggregate instead",
      "Only the outer SELECT may carry a LIMIT — LIMIT inside a derived table is illegal",
      "Neither — two LIMITs in one statement always raise a syntax error",
      "Both layers may carry their own LIMIT — the inner carves top-3, the outer trims to 1",
    ],
    answer: 3,
    why: "Every layer of the pipeline is a full SELECT: the inner stage can sort and cut (1088.44, 945.21, 845.92), and `SELECT * FROM (…) LIMIT 1` keeps just order #74. LIMIT-in-stage is legal at every level.",
    notes: [
      { choice: 1, why: "LIMIT inside a derived table is exactly how top-N staging works — the stage is computed with its own cut before the outer query reads it." },
    ],
  },
  // ---------- semantics ----------
  { id: "dr4-jud-04", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "The store's total is 34833.28. One report says the average is 338.19, another says 2177.08 — both ran on the same db the same minute. What actually happened?",
    choices: [
      "One of the queries rounded wrongly",
      "They averaged different units: 338.19 divides 34833.28 by 103 ORDERS; 2177.08 first sums each customer's orders, then divides by 16 CUSTOMERS",
      "2177.08 includes cancelled orders that 338.19 excludes",
      "2177.08 is the median, mislabeled as an average",
    ],
    answer: 1,
    why: "Average of WHAT? 34833.28 / 103 order rows = 338.19; 34833.28 / 16 customer rows = 2177.08. Same dollars, different denominator — and the two bars answer two different business questions.",
    notes: [
      { choice: 2, why: "Both numbers span the full order history; the gap is entirely order-rows vs customer-rows, not status filtering." },
    ],
  },
  { id: "dr4-jud-05", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU')` — what does the subquery hand to the outer query, and when?",
    choices: [
      "A TRUE/FALSE verdict recomputed for every order row",
      "A live pointer that re-runs the region filter once per order",
      "A fixed list of EU ids, built once up front, that each order's customer_id is checked against",
      "The count of EU customers, used as a threshold",
    ],
    answer: 2,
    why: "Uncorrelated IN materializes the id list once — EQP shows it as LIST SUBQUERY 1 — and then the outer scan probes membership row by row. One build, many checks.",
    notes: [
      { choice: 0, why: "Per-row recomputation is the CORRELATED shape, where the subquery references the outer row. This one mentions no outer column, so it runs once." },
    ],
  },
  { id: "dr4-jud-06", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped') vs c.id IN (SELECT customer_id FROM orders WHERE status = 'shipped') — what genuinely differs?",
    choices: [
      "Same customer set — the 10 with shipped orders; but EXISTS stops probing a customer at the first hit, while IN materializes the full id list first",
      "EXISTS returns the matching orders; IN returns the customers",
      "EXISTS double-counts customers with several shipped orders",
      "IN cannot express 'at least one', so it always needs LIMIT 1",
    ],
    answer: 0,
    why: "Both answer 'who has at least one shipped order' — the same 10 names. The mechanics differ: EXISTS is a per-row existence probe that short-circuits (customer 2 owns 2 orders, 0 shipped — two probes, done); IN builds one list, then checks membership.",
    notes: [
      { choice: 1, why: "Neither leaks inner rows — both are membership filters on the outer table. What EXISTS selects (1, *, NULL) is ignored: all three spellings return the same 10." },
    ],
  },
  { id: "dr4-jud-07", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`GROUP BY customer_id HAVING COUNT(*) = 4` returns 4 customers — and not one of them is a true all-four-status veteran. What went wrong?",
    choices: [
      "The HAVING fired wrongly because cancelled orders were included in the count",
      "COUNT(*) counts order ROWS, not distinct statuses — the 4 hits (Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez) each own exactly 4 orders of repeated status, while the real veterans have MORE than 4 orders and never appear",
      "SQLite's COUNT(*) silently caps at 4 per group",
      "The query is fine — those 4 customers really are the veterans",
    ],
    answer: 1,
    why: "Volume is not breadth. Exactly-4-rows catches status repeaters and misses anyone with 5, 6 or 24 orders. The breadth probe is COUNT(DISTINCT status) = 4, which returns exactly Alice Chen, Emma Wilson and Maya Patel.",
    notes: [
      { choice: 3, why: "The four-status veterans are Alice Chen, Emma Wilson and Maya Patel. Isabella, Keiko, Noah and Pedro repeat statuses across their 4 orders — plausible-looking, all wrong." },
    ],
  },
  { id: "dr4-jud-08", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "In the correlated stamp `(SELECT AVG(o.total) FROM orders o WHERE o.customer_id = c.id)`, what comes back for the 2 customers with exactly one order?",
    choices: [
      "NULL — AVG refuses one-row groups",
      "An error — aggregates need at least two rows",
      "That single order's total — an average over one row is the row itself",
      "The storewide 338.19 as a fallback",
    ],
    answer: 2,
    why: "AVG of a single value is that value. This is exactly why the 2 solo-order customers can never beat their own bar: their one order IS their average, so it ties and strict > never fires — they contribute 0 stellar orders.",
    notes: [
      { choice: 0, why: "An EMPTY group (a customer with no orders) yields NULL; a one-row group is a real group with a real average." },
    ],
  },
  { id: "dr4-jud-09", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does `(SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) AS d` contribute to the statement that contains it?",
    choices: [
      "A persistent view saved into the schema for later sessions",
      "An index that speeds up every future query on orders",
      "A filtered copy of the orders table with the big orders removed",
      "A temporary, in-query result — one spend row per customer — that the outer SELECT reads like a table, then discards",
    ],
    answer: 3,
    why: "A derived table is a statement-local stage: 16 spend rows the outer query treats as a relation. EQP shows SQLite streaming it as CO-ROUTINE d — computed as needed, gone when the statement ends.",
    notes: [
      { choice: 0, why: "A view is CREATE VIEW — schema-resident and reusable across statements. A derived table exists only inside the one statement that spells it out." },
    ],
  },
  // ---------- edge ----------
  { id: "dr4-jud-10", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "A nullable staging view lists cancelled-order customer ids — but one row's id reads NULL. `SELECT name FROM customers WHERE id NOT IN (SELECT cid FROM cancelled_stage)` now returns 0 rows. Why?",
    choices: [
      "The view came back empty",
      "One NULL in the list poisons every comparison: `x NOT IN (…, NULL)` can never evaluate to TRUE, so all 16 customers are filtered out",
      "NOT IN cannot read from a view",
      "Only the 4 cancelled customers were excluded, leaving 12",
    ],
    answer: 1,
    why: "For every x, the comparison against the NULL member comes back unknown, and NOT IN needs every member to be provably different — so no row survives. Guard the stage (`WHERE cid IS NOT NULL`) and the intended 12 names return, matching the clean cancelled-list NOT IN.",
    notes: [
      { choice: 3, why: "12 is the GUARDED answer. Unguarded, the single NULL does not exclude one customer — it destroys the truth value of every row's comparison." },
    ],
  },
  { id: "dr4-jud-11", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "The 2 solo-order customers (one order each): how many of their orders clear their OWN average-order bar?",
    choices: [
      "0 — with one order, that order IS the average, so it ties the bar and strict > never fires",
      "1 — a customer's only order always beats their own average",
      "2 — both orders qualify under any bar",
      "All of them — solo customers fall back to the storewide bar",
    ],
    answer: 0,
    why: "Their order equals their own average exactly; above-own-avg demands strictly above. That is why only 14 customers clear their own bar, never 16 — and why the solo pair contribute 0 of the 45 stellar orders.",
    notes: [
      { choice: 1, why: "The average of one order is that order. Equality is a tie, not an excess — and 'stellar' is defined by strict excess." },
    ],
  },
  { id: "dr4-jud-12", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "The cancelled-list subquery matches nothing (an empty set). How many customers survive `WHERE id NOT IN (that empty list)`?",
    choices: [
      "0 — NOT IN over an empty list is an error",
      "4 — the filter inverts into the cancelled cohort",
      "16 — NOT IN an empty list excludes nobody, so every customer passes",
      "12 — the last known count is cached",
    ],
    answer: 2,
    why: "Vacuous truth: 'id is not among {}' holds for every row, so all 16 pass — while plain IN over the same empty list would keep 0. Empty-set behavior flips the operator's meaning; always ask what the inner query returns when it matches nothing.",
    notes: [
      { choice: 0, why: "An empty IN-list is perfectly legal — it filters everything on the IN side and nothing on the NOT IN side." },
    ],
  },
  { id: "dr4-jud-13", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`WHERE total = (SELECT total FROM orders WHERE status = 'pending')` — the pending list holds 14 rows. What does SQLite do with this multi-row scalar?",
    choices: [
      "Raises an error: the scalar subquery returned more than one row",
      "Returns NULL — ambiguous results become NULL",
      "Averages the 14 pending totals",
      "Silently takes the first row's total — no error, no warning",
    ],
    answer: 3,
    why: "A scalar subquery is expected to yield one value; when it yields many, SQLite keeps the first row and moves on. The query runs and means something close to random — the worst kind of bug. Add LIMIT 1 or fix the correlation.",
    notes: [
      { choice: 0, why: "Other engines do raise exactly that error. SQLite's silence is the trap — 'it ran' is not 'it is right'." },
    ],
  },
  // ---------- errors ----------
  { id: "dr4-jud-14", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "A teammate writes `SELECT id, total FROM orders WHERE total > AVG(total)` to list above-average orders. What happens?",
    choices: [
      "It runs — every order above 338.19 comes back",
      "It runs — but returns 0 rows because AVG is empty during WHERE",
      "It fails: 'misuse of aggregate function AVG()' — aggregates can't appear in WHERE",
      "It fails: 'no such column: total'",
    ],
    answer: 2,
    why: "WHERE filters rows before any grouping exists, so an aggregate there is rejected outright. The per-order fix wraps the bar in its own subquery: `WHERE total > (SELECT AVG(total) FROM orders)` — the subquery computes 338.19 first.",
    notes: [
      { choice: 0, why: "Tempting, but the engine won't even plan it. And the HAVING rewrite that does run answers a different question entirely." },
    ],
  },
  { id: "dr4-jud-15", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "The one-level compare errors, so the team tries `GROUP BY customer_id HAVING MAX(total) > AVG(total)`. It runs and returns 14 of 16 customers. Why is that answer still a lie?",
    choices: [
      "HAVING cannot mix MAX and AVG in one expression",
      "The bar silently changed: MAX vs each customer's OWN average answers 'has an above-own-average order' (14/16), while the brief's bar — the storewide 338.19 — is cleared by ALL 16 customers",
      "The subquery returned NULL for 2 customers",
      "An inner JOIN dropped 2 customers before grouping",
    ],
    answer: 1,
    why: "AVG(total) inside the grouped HAVING is each group's OWN average, not the storewide one — the band-aid answers a different question and yields 14 where the storewide bar yields 16 (every customer owns at least one order above 338.19). It runs; it lies.",
    notes: [
      { choice: 0, why: "Mixing aggregates in HAVING is perfectly legal. The failure is semantic — the comparison quietly became own-max vs own-average." },
    ],
  },
  { id: "dr4-jud-16", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "Your staged VIP query returns 5 rows; the stakeholder expected 8 (they remembered 'the over-1000 club'). Best first debugging move?",
    choices: [
      "Run the stages alone: paste the spend stage (16 rows), then apply each bar — 1000 keeps 8, 2177.08 keeps 5 — and show exactly where the counts diverge from the expectation",
      "Inline the CTE into one giant query so there is less to go wrong",
      "Add every column you can find to the outer SELECT until the discrepancy looks explainable",
      "Re-import the database — the numbers must have drifted",
    ],
    answer: 0,
    why: "Each named stage is a complete runnable SELECT: run it, count it, compare to the story (16 spends → 8 over 1000 → 5 over 2177.08). The bug here is a bar mismatch, and staging is what makes that visible in one pass.",
    notes: [
      { choice: 1, why: "Inlining destroys the very seams you debug along. Stages are the stack traces of SQL." },
    ],
  },
  // ---------- predict ----------
  { id: "dr4-jud-17", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "How many rows?\n`SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')`\n(16 customers; shipped orders exist for 10 of them)",
    choices: [
      "16",
      "6",
      "0",
      "10",
    ],
    answer: 3,
    why: "EXISTS keeps customers with at least one shipped order: 10 rows — Alice, Emma, Grace, Hiro, Isabella, Jamal, Liam, Maya, Noah, Pedro. Flip to NOT EXISTS and the other 6 survive.",
    notes: [
      { choice: 1, why: "6 is the NOT EXISTS cohort — zero shipped orders. EXISTS and its negation partition all 16." },
    ],
  },
  { id: "dr4-jud-18", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "How many rows?\n`WITH spends AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) SELECT COUNT(*) FROM spends WHERE spend > 2000`",
    choices: [
      "5",
      "8",
      "16",
      "3",
    ],
    answer: 0,
    why: "The spend stage has 16 rows; > 2000 keeps the five VIPs — Alice 7262.35, Emma 6640.56, Grace 4574.23, Maya 3644.56, Chloe 2667.93. The bar falls in the 2667.93 → 1686.17 gap, so 2000 and 2177.08 slice the same five.",
    notes: [
      { choice: 1, why: "8 is the over-1000 club (down to Farid 1458.97 and Keiko 1098.60). Lower the bar, nearly double the VIP list." },
    ],
  },
  { id: "dr4-jud-19", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Second row of the LIMIT-in-stage result?\n`SELECT id, name, total FROM (SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.total DESC LIMIT 3)`",
    choices: [
      "1088.44",
      "945.21",
      "845.92",
      "7262.35",
    ],
    answer: 1,
    why: "The stage sorts all 103 orders by total DESC and keeps three: #74 Farid Nasser 1088.44, #43 Chloe Dubois 945.21, #39 Emma Wilson 845.92. Second row: 945.21.",
    notes: [
      { choice: 3, why: "7262.35 is Alice's lifetime SUM — a different stage's output. Biggest ORDER is 1088.44; biggest CUSTOMER is 7262.35. Two bars again." },
    ],
  },
  { id: "dr4-jud-20", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "How many rows?\n`SELECT COUNT(*) FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled')`\n(7 cancelled orders belong to 4 distinct customers; the id list is NULL-free)",
    choices: [
      "0",
      "12",
      "16",
      "7",
    ],
    answer: 1,
    why: "The cancelled list holds 4 distinct ids (Alice, Emma, Keiko, Maya) and no NULLs, so no collapse: 16 − 4 = 12 customers have never cancelled. Contrast the shipped_at list, where 21 NULL values zero out the whole NOT IN.",
    notes: [
      { choice: 0, why: "0 requires a NULL in the list. Here the 7 cancelled rows map to 4 clean ids — there is no NULL to poison the comparison." },
    ],
  },
  // ---------- judgment ----------
  { id: "dr4-jud-21", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Brief: 'list the customers with zero shipped orders.' Which shape answers THAT question directly?",
    choices: [
      "`FROM customers c JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'` — pairs each customer with their shipped rows",
      "`WHERE id IN (SELECT customer_id FROM orders WHERE status = 'shipped')`",
      "`WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')`",
      "A scalar subquery returning the storewide count of shipped orders beside each name",
    ],
    answer: 2,
    why: "NOT EXISTS reads as the brief: keep the customer when no shipped row exists — 6 names. The JOIN and the IN both answer the opposite cohort (the 10 WITH shipped orders); the scalar stamps a global number, not a per-customer fact.",
    notes: [
      { choice: 1, why: "IN selects membership, not absence. NOT IN works only with a NULL-guarded list — NOT EXISTS says exactly what you mean with no guard to remember." },
    ],
  },
  { id: "dr4-jud-22", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Your codebase is full of `NOT IN (SELECT …)`. Which house policy is the sharpest?",
    choices: [
      "Ban NOT IN outright — every use is a latent bug",
      "NOT IN is fine on provably NULL-free lists (ids from the parent side); on any nullable column, guard the subquery or switch to NOT EXISTS",
      "Rewrite every NOT IN as a LEFT JOIN … IS NULL for speed",
      "NOT IN and NOT EXISTS are interchangeable — pick whichever reads shorter",
    ],
    answer: 1,
    why: "The 0-row collapse is a NULL-list problem, not an operator problem: a clean id list gives the intended 12; one NULL gives 0. The policy is about knowing your list, not fearing the keyword.",
    notes: [
      { choice: 0, why: "Overkill — the NULL-free cancelled-list NOT IN is correct, readable and safe by construction. Blanket bans push people toward sneakier shapes." },
    ],
  },
  { id: "dr4-jud-23", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A PM asks: 'what's our average sale?' You hold 338.19 (per order) and 2177.08 (per customer), both from the same 34833.28. Best response?",
    choices: [
      "Ask which unit they mean before quoting either — 34833.28 over 103 orders vs over 16 customers are both 'averages', and the choice changes every downstream target",
      "Say 338.19 — orders are the atomic unit, full stop",
      "Say 2177.08 — customer metrics always beat order metrics",
      "Average the two numbers and report 1257.63",
    ],
    answer: 0,
    why: "Average of WHAT? The same store total divides by 103 order rows or 16 customer lifetimes. Neither number is 'the' average until the unit is fixed — and the VIP list (5 names) only exists under the customer bar.",
    notes: [
      { choice: 3, why: "Averaging two averages of different units produces a third number that is neither. Refuse the arithmetic; resolve the question." },
    ],
  },
  { id: "dr4-jud-24", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Why does 2177.08 work as the VIP cut-line in the pipeline `spends → vips`?",
    choices: [
      "It is the largest single order in the store",
      "It is the median customer spend, so exactly half qualify",
      "It is the average customer lifetime spend, and it lands in the gap between rank 5 (Chloe, 2667.93) and rank 6 (Pedro, 1686.17) — so the cut cleanly yields five names",
      "It is the store total divided by the order count",
    ],
    answer: 2,
    why: "The bar is the average of the 16 spends, and the spends cluster: five at 2667.93 and up, then a drop to 1686.17. Any threshold in that gap — 2000 included — selects the same five; 2177.08 is the defensible one because it is computed, not eyeballed.",
    notes: [
      { choice: 0, why: "That is 1088.44, an order total from a different stage. Mixing the two bars is precisely the unit error this set drills." },
    ],
  },
  { id: "dr4-jud-25", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Team styles: `WITH spends AS (…), vips AS (SELECT * FROM spends WHERE spend > 2177.08)` vs one dense nested query. What does the staged version actually buy?",
    choices: [
      "CTEs execute in parallel; nested subqueries cannot",
      "Named stages each answer one question and run alone — spend (16 rows), then the cut (5 rows) — so reviewers can verify each step's count instead of trusting the whole blob",
      "SQLite only optimizes queries that use WITH",
      "Staging lets you skip the GROUP BY",
    ],
    answer: 1,
    why: "Each stage is runnable and nameable: paste the spend stage, get 16; apply the bar, get 5 — Alice, Emma, Grace, Maya, Chloe. The dense version computes the same rows but hides every intermediate count.",
    notes: [
      { choice: 2, why: "At this scale the plans are equivalent — a single-reference CTE matches the inline form row for row (103 either way). Staging buys readability and debuggability, not a different plan." },
    ],
  },
  { id: "dr4-jud-26", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "What makes a CTE chain 'good staging' rather than stage theater?",
    choices: [
      "Maximize the number of stages — more names, more rigor",
      "Collapse everything into one stage to minimize name overhead",
      "Keep every stage to a single line, whatever it costs",
      "Each stage is a complete runnable SELECT with an intention-revealing name, and any stage pasted alone returns a count you can state aloud — spend → 16, over-1000 → 8, VIP → 5",
    ],
    answer: 3,
    why: "The test is independence: run any stage by itself and it must work and mean something. That is what lets a teammate debug by running stages — and what separates a pipeline from a pile of nesting.",
    notes: [
      { choice: 0, why: "Stages earn their names by carrying meaning. 'step1', 'step2', 'tmp' staging just relocates the blob." },
    ],
  },
  { id: "dr4-jud-27", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A staged report returns 5 VIPs; a teammate swears the brief said 8. First move?",
    choices: [
      "Run the stages and compare counts to the brief's unit: 16 spends → 8 over the 1000 bar → 5 over 2177.08; the disagreement is almost always which bar was asked for",
      "Rewrite with correlated subqueries, which are easier to debug",
      "Lower the threshold until the row count matches the expectation",
      "Log a ticket against the database — counts should not drift",
    ],
    answer: 0,
    why: "Expectation mismatches are usually unit mismatches: 'over 1000' is 8 customers, 'above the 2177.08 average' is 5. A staged query lets you demonstrate both in one run — that IS the debugging session.",
    notes: [
      { choice: 2, why: "Bending the bar to hit a number inverts the pipeline: the bar is the requirement, the count is the outcome." },
    ],
  },
  { id: "dr4-jud-28", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Marketing headline: 'Every single one of our 16 customers has an above-average order!' — true on this db. What is the honest footnote?",
    choices: [
      "The storewide bar was computed on a stale snapshot",
      "None — 16/16 is a clean sweep worth publishing",
      "The bar is the ORDER average (338.19) applied to each customer's best order; ask 'above their OWN average' instead and only 14 pass — the 2 solo-order customers tie themselves and can never clear it",
      "It only holds in the EU region; elsewhere it is 9 of 16",
    ],
    answer: 2,
    why: "Breadth vs volume vs unit: 'has an order above the storewide per-order bar' is yes for all 16; 'has an order above their own typical order' is yes for 14 (45 stellar orders total, none from the solo pair). Same words, different question, different count.",
    notes: [
      { choice: 1, why: "Technically true and nearly meaningless — the storewide bar sits below almost every customer's best order by construction. The footnote is the question the headline silently swapped." },
    ],
  },
  { id: "dr4-jud-29", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "The veterans check probes each of the four statuses separately (one EXISTS/count per status) instead of asking COUNT(*) = 4. Why is the four-probe design the honest one?",
    choices: [
      "EXISTS probes are index-only; COUNT must always scan",
      "Four probes test BREADTH — every status present — while COUNT(*) = 4 tests VOLUME: it returns Isabella, Keiko, Noah and Pedro (4 orders each, statuses repeated) and misses Alice, Emma and Maya entirely",
      "SQLite cannot count distinct values inside HAVING",
      "The four probes are the only form that can run uncorrelated",
    ],
    answer: 1,
    why: "Volume is not variety. The four-probe design returns exactly Alice Chen, Emma Wilson and Maya Patel; the bare row count returns four impostors and none of the veterans. COUNT(DISTINCT status) = 4 is the compact spelling of the same breadth test.",
    notes: [
      { choice: 2, why: "COUNT(DISTINCT status) works fine. The bare COUNT(*) bug is a question-design bug, not an engine limitation." },
    ],
  },
  { id: "dr4-jud-30", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "For which brief is a plain JOIN — no subquery — the honest tool?",
    choices: [
      "Which customers have at least one pending order?",
      "Which customers' lifetime spend tops 2177.08?",
      "Which customers have never had a shipped order?",
      "Show every order with its customer's name and region",
    ],
    answer: 3,
    why: "That is per-row widening: pair each of the 103 orders with its customer's attributes. No membership test, no aggregate, no quantifier — wrapping it in IN/EXISTS would silently change the question to 'who has orders' (which here is everyone).",
    notes: [
      { choice: 0, why: "Membership with existence semantics — IN/EXISTS territory (8 distinct customers hold the 14 pending orders). A JOIN answers it only after DISTINCT collapses the pairs." },
    ],
  },
  { id: "dr4-jud-31", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Brief: 'orders from EU customers.' You reach for `customer_id IN (SELECT id FROM customers WHERE region = 'EU')` rather than a JOIN. What is the strongest defense?",
    choices: [
      "The brief is a membership filter — the subquery IS the EU id set, built once (EQP: LIST SUBQUERY 1) and probed per order; a JOIN is equally correct but bolts customer columns onto a query that never uses them",
      "Subqueries are always faster than JOINs in SQLite",
      "JOINs cannot filter by region",
      "IN automatically sorts the output; JOIN does not",
    ],
    answer: 0,
    why: "Shape follows the brief: filter orders by membership in a set. EQP confirms the shape — one list build, then a rowid search per order. When the output needs no customer columns, the IN spelling states that intent.",
    notes: [
      { choice: 1, why: "No general speed crown exists — at this scale both shapes run instantly. The defense is semantic (membership), not a benchmark." },
    ],
  },
  { id: "dr4-jud-32", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "EXPLAIN QUERY PLAN shows LIST SUBQUERY 1 for the IN version, but 'CORRELATED SCALAR SUBQUERY' with 'SCAN o2' for the above-own-avg filter. What is the second plan telling you?",
    choices: [
      "The scalar subquery ran once and was cached for all rows",
      "The plan is corrupt — scalar subqueries never appear in EQP",
      "The inner AVG re-scans o2 once per outer row — per-row execution; correct and fine at 103 rows, but the cost grows as outer × inner, unlike the one-shot list build",
      "SQLite rewrote the correlated subquery into a JOIN",
    ],
    answer: 2,
    why: "Correlation makes the subquery a per-row loop: every order row triggers a fresh SCAN o2 to average that customer's orders — the mechanism behind the 45 stellar rows. The uncorrelated IN is the contrast: LIST SUBQUERY 1, built once.",
    notes: [
      { choice: 0, why: "Caching would break correctness: each row needs ITS customer's average. Only uncorrelated subqueries are shareable." },
    ],
  },
  { id: "dr4-jud-33", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "One CTE `s` (per-customer spend) feeds two counts in the same statement — over_1000 = 8 and over_2000 = 5. Why does EQP show 'MATERIALIZE s'?",
    choices: [
      "MATERIALIZation persists s to disk between sessions",
      "MATERIALIZation only triggers when the CTE lacks an alias",
      "It is a planner defect; rewriting as two derived tables removes it",
      "s is consumed twice, so building it once and scanning it twice beats recomputing the GROUP BY for each reference",
    ],
    answer: 3,
    why: "Referenced once, a CTE streams or inlines; referenced twice, the planner materializes one 16-row spend table and reuses it for both filters. Compute once, read many — that is the materialization contract.",
    notes: [
      { choice: 2, why: "Nothing to fix — two counts from one stage is the point of staging. Two derived tables would rebuild the same GROUP BY twice." },
    ],
  },
  { id: "dr4-jud-34", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "When does a derived table `(SELECT …) AS d` beat a named CTE?",
    choices: [
      "When the stage is referenced three or more times",
      "When the stage must outlive the statement",
      "When the stage contains aggregates — derived tables are required for those",
      "When the stage is used exactly once and the query reads fine top-down — SQLite streams it as a CO-ROUTINE and there is no extra name to track",
    ],
    answer: 3,
    why: "Single-use stage, single location: the derived form keeps the pipeline local (EQP: CO-ROUTINE d). Reach for WITH when a stage needs a name for reuse — read twice, it materializes — or for readability across many stages.",
    notes: [
      { choice: 0, why: "Multi-reference is precisely when you WANT the named CTE — one materialization instead of repeated inline work." },
    ],
  },
  { id: "dr4-jud-35", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Brief: 'our three biggest single orders, with customer names.' Which shape fits?",
    choices: [
      "A correlated scalar that computes each order's rank against every other order",
      "`GROUP BY customer_id` picking MAX(total) per customer",
      "Stage it: inner SELECT joins orders to customers, ORDER BY total DESC, LIMIT 3; the outer SELECT projects id, name, total — the cut is one visible, editable line",
      "Fetch all 103 orders and slice the top three in application code",
    ],
    answer: 2,
    why: "The LIMIT-in-stage makes the business rule (top 3) a literal clause, and the stage returns #74 Farid Nasser 1088.44, #43 Chloe Dubois 945.21, #39 Emma Wilson 845.92 — verified, tweakable, reviewable.",
    notes: [
      { choice: 1, why: "Max-per-customer answers 'each customer's biggest order' — 16 rows. The brief asked for the top 3 overall; the aggregate answer oversizes the list and hides the ranking." },
    ],
  },
  { id: "dr4-jud-36", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Follow-up brief: 'each customer's single biggest order.' Why doesn't the same `ORDER BY total DESC LIMIT 3` idiom carry over?",
    choices: [
      "One global LIMIT trims the whole sorted stage to 3 rows total; 'top 1 per customer' needs a per-group pick — correlated scalar, max-join, or a window function — which a single LIMIT cannot express",
      "LIMIT is illegal inside derived tables, so the idiom never worked",
      "You must UNION 16 copies of the query, one per customer",
      "It carries over fine — adding GROUP BY customer_id makes LIMIT apply per group",
    ],
    answer: 0,
    why: "LIMIT is global to its SELECT; grouping does not localize it. Top-N-per-group is a genuinely different shape — and knowing exactly where the idiom breaks is the judgment this set is teaching.",
    notes: [
      { choice: 3, why: "There is no per-group LIMIT. GROUP BY + LIMIT returns 16 aggregate rows trimmed to 3 arbitrary groups — not each customer's biggest row." },
    ],
  },
  { id: "dr4-jud-37", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "'Customers with at least one delivered order' — IN-list or EXISTS? What is the sharpest ruling?",
    choices: [
      "EXISTS, always — it is faster in every case",
      "IN, always — list builds beat per-row probes universally",
      "Neither — only a JOIN can prove existence",
      "Both express the membership; EXISTS short-circuits per outer row while IN builds the id set once (LIST SUBQUERY) — at 103 orders either is instant, so choose by which reads closer to the brief",
    ],
    answer: 3,
    why: "Semantics first, plan second: both return the same customer set, and the receipts show each shape's cost model — one-shot list build vs per-row probe with early exit. At this scale the decision is readability, not milliseconds.",
    notes: [
      { choice: 0, why: "No unconditional speed rule exists — the plans differ in shape (list build vs probe), and which wins depends on sizes and indexes. 'Always' is the tell of an unearned ruling." },
    ],
  },
  { id: "dr4-jud-38", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "PR review: `SELECT name, (SELECT SUM(total) FROM orders) AS spend FROM customers`. The author says 'it's a subquery, so it's per-customer.' Sharpest critique?",
    choices: [
      "SUM is illegal inside a scalar subquery",
      "Correct as written — subqueries are per-row by nature",
      "The scalar is uncorrelated: it computes the storewide 34833.28 once and stamps the same value on all 16 rows (one distinct 'spend'); add `WHERE customer_id = c.id` to make it per-customer",
      "It must become a CTE or the planner will miscount",
    ],
    answer: 2,
    why: "Per-row behavior comes from CORRELATION, not from subquery-ness. No reference to the outer row means one evaluation, one number, stamped 16 times — the classic misread this receipt nails (16 rows out, 1 distinct stamp).",
    notes: [
      { choice: 1, why: "Only correlated subqueries re-evaluate per row. The uncorrelated form is a constant with extra steps." },
    ],
  },
  { id: "dr4-jud-39", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Which review habit catches staged-query bugs fastest?",
    choices: [
      "Reading only the outer SELECT — that is where output shapes live",
      "Trusting the result because the query executes without error",
      "Renaming stages to s1, s2, s3 to reduce visual noise",
      "Running each stage alone and checking its count against the story — 16 spends, 8 over-1000, 5 over-2000 — before trusting the final rows",
    ],
    answer: 3,
    why: "Stages that can be run alone can be verified alone. Counting each stage against the expected story turns 'looks right' into 'verifies right' — and the runs-and-lies HAVING variant dies at exactly this checkpoint.",
    notes: [
      { choice: 1, why: "That is the lesson of the 14/16 HAVING lie: it runs clean and returns a confident wrong answer. Execution is not verification." },
    ],
  },
  { id: "dr4-jud-40", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Capstone: 'find our VIPs — customers whose lifetime spend puts them in a class of their own — and show what makes them special.' Most defensible first draft?",
    choices: [
      "Two named stages — spend per customer, then cut at the 2177.08 customer-average bar — yielding Alice, Emma, Grace, Maya, Chloe; then a follow-up staged query for each VIP's standout orders",
      "One query: SELECT id, total FROM orders WHERE total > AVG(total)",
      "Rank customers by order COUNT and take the top five",
      "List every order above the 338.19 order bar and hand it over as 'VIP activity'",
    ],
    answer: 0,
    why: "Right unit (the customer bar, not the order bar), named and runnable stages, and an output that carries its own story: five names, each with lifetime spend above an average they helped set. Every alternative trips a receipt from this set.",
    notes: [
      { choice: 3, why: "All 16 customers own at least one order above 338.19 — that list is 'everyone', not VIPs. The order bar cannot separate customers." },
    ],
  },
];
