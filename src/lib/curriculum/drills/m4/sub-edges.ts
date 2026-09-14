// Drill set — Subquery edge cases (Module 4, secondary, 40 questions).
// Engine-verified receipts (db/custom.db, scripts/m4-facts.ts P01–P56):
// NOT IN over nullable shipped_at (21 NULL rows, P10) collapses to 0 of 16
// customers (P09); the IS NOT NULL-guarded form springs back to 12 (P07/P11).
// NOT IN empty list → all 16 customers, IN empty set → 0 (P12/P13). NOT IN
// cancelled (7 orders / 4 customers: Alice Chen, Emma Wilson, Keiko Sato,
// Maya Patel, P03–P06) → 12; pending = 14 orders / 8 customers (P08) → NOT
// IN pending → 8. Scalar over a multi-row set silently takes the FIRST row
// (pending's first customer_id = 16, P14); uncorrelated scalar in SELECT
// stamps 1 distinct value on all 16 rows (P15). Scalar over an empty set is
// NULL and NULL propagates: total > (NULL bar) → 0 of 103; per-customer
// cancelled-MAX stamps NULL on 12 of 16 rows; MAX-of-nothing prints NULL
// (never 0, never an error). CTE shadowing: WITH customers AS (SELECT 'ghost
// row' …) → ghost wins inside the statement (P45); real 16 return after.
// EXISTS shipped → 10 customers, NOT EXISTS → 6 (P18/P20); impossible inner
// (1=0): EXISTS → 0, NOT EXISTS → 16 (P21/P22); SELECT 1/*NULL inside EXISTS
// identical → 10 (P23); customer 2: 2 orders, 0 shipped → EXISTS FALSE
// (P31). One-row crowds degenerate: solo-order customers (2, P29) contribute
// 0 stellar (P30) because own avg = the row itself; total >= MAX(total) → 1
// (all 103 totals distinct). HAVING scalar: 3 categories above the 71.78
// catalog avg (Wearables 139.50 / Audio 109.66 / Video 84.50, P16); 6 is the
// above-avg PRODUCT count (P02). Probes this set (readonly bun:sqlite):
// NOT IN (1, NULL) → 0 of 16; inner-alias shadow of outer alias → 0 of 16;
// scalar 2 columns → "sub-select returns 2 columns - expected 1"; stray
// correlated ref → "no such column: oops.id"; self-referencing CTE →
// "circular reference: customers".
// Probes: scripts/m4-facts.ts.

import type { DrillQ } from "../types";

const KW = "Subquery edge cases";

export const SUB_EDGES: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr4-edg-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Your NOT IN over `SELECT shipped_at FROM orders` keeps returning 0 of 16 customers. Which rewrite is the guarded form that survives the 21 NULLs?",
    choices: [
      "`SELECT COUNT(*) FROM customers WHERE id NOT IN SELECT shipped_at FROM orders WHERE shipped_at IS NOT NULL`",
      "`SELECT COUNT(*) FROM customers WHERE id NOT IN (SELECT IFNULL(shipped_at, id) FROM orders)`",
      "`SELECT COUNT(*) FROM customers WHERE id NOT IN (SELECT shipped_at FROM orders WHERE shipped_at IS NOT NULL)`",
      "`SELECT COUNT(*) FROM customers WHERE id NOT IN (SELECT shipped_at FROM orders)`",
    ],
    answer: 2,
    why: "The guard drops the 21 NULLs before the list is built, so every id finally gets a definite answer — verified: the raw form returns 0 customers, the guarded form 12.",
    notes: [
      { choice: 3, why: "The raw list carries 21 NULLs: one NULL makes every NOT IN verdict unknown, and WHERE keeps none of the 16 customers." },
      { choice: 1, why: "IFNULL swaps each NULL for that order's own id — you exclude the unshipped orders' owners instead of testing shipped_at values." },
    ],
  },
  { id: "dr4-edg-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which statement is written correctly for a one-off ghost-table probe against a table literally named customers?",
    choices: [
      "`WITH customers AS (SELECT 'ghost row' AS name) SELECT name FROM customers;`",
      "`SELECT WITH customers AS (SELECT 'ghost row' AS name) name FROM customers;`",
      "`WITH customers (SELECT 'ghost row' AS name) SELECT name FROM customers;`",
      "`WITH customers AS SELECT 'ghost row' AS name SELECT name FROM customers;`",
    ],
    answer: 0,
    why: "WITH opens the statement, each CTE is `name AS (subquery)`, and the main SELECT follows the last one — the other three put WITH in the wrong place or unwrap the body.",
    notes: [
      { choice: 3, why: "The CTE body must be parenthesized; unparenthesized, the parser sees a second bare SELECT and stops with a syntax error." },
    ],
  },
  { id: "dr4-edg-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which line legally pins the storewide average order (338.19) next to every customer name?",
    choices: [
      "`SELECT name, SELECT AVG(total) FROM orders FROM customers;`",
      "`SELECT name, (SELECT AVG(total) FROM orders) AS store_avg FROM customers;`",
      "`SELECT name, (AVG(SELECT total FROM orders)) AS store_avg FROM customers;`",
      "`SELECT name, AVG(total) AS store_avg FROM customers, orders;`",
    ],
    answer: 1,
    why: "A scalar subquery is just an expression: wrap it in parentheses and it may sit anywhere a value can, including the SELECT list — one storewide 338.19 stamped next to every name.",
    notes: [
      { choice: 3, why: "It parses, but it cross joins 16 × 103 rows and repeats every name 103 times — legal shape, wrong result." },
    ],
  },
  { id: "dr4-edg-04", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "The outer query is `SELECT c.name FROM customers c WHERE EXISTS (…)` hunting pending orders. Which inner body correlates correctly?",
    choices: [
      "`SELECT 1 FROM orders WHERE id = customer_id`",
      "`SELECT 1 FROM orders o WHERE customer_id = customers.id`",
      "`SELECT 1 FROM orders o WHERE o.customer_id = orders.id`",
      "`SELECT 1 FROM orders o WHERE o.customer_id = c.id`",
    ],
    answer: 3,
    why: "The inner query needs the outer row: qualify the outer side with the outer alias c. `o.customer_id = c.id` pairs each order with the customer being tested.",
    notes: [
      { choice: 0, why: "Bare `id` and `customer_id` both resolve to the INNER orders table — you compare each order's id with its own customer_id and never touch the outer row." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr4-edg-05", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "The inner list holds 82 timestamps and 21 NULLs. Why does `id NOT IN (SELECT shipped_at FROM orders)` return zero of the 16 customers?",
    choices: [
      "SQLite aborts the statement the moment NOT IN meets a NULL in the list",
      "The NULL entries are dropped from the list first, leaving timestamps that no id matches",
      "For every non-matching id the NULL entry makes the whole NOT IN verdict unknown, and WHERE keeps only TRUE — so 0 rows survive",
      "NOT IN is rewritten as a join; the 21 NULL rows fail the join and take their customers with them",
    ],
    answer: 2,
    why: "x NOT IN (a list containing NULL) can never be TRUE: a match gives FALSE, a non-match gives NULL because of the NULL entry. WHERE keeps only TRUE — verified: 0 of 16 customers.",
    notes: [
      { choice: 1, why: "No such drop happens. The NULL entries stay in the list and poison every non-matching comparison." },
    ],
  },
  { id: "dr4-edg-06", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "NOT IN over the NULL-bearing shipped_at list collapses to 0, yet the NOT EXISTS rewrite honestly reports 6 customers. Why is EXISTS immune?",
    choices: [
      "EXISTS returns TRUE when the inner query produces any row — it never compares a value against the NULLs",
      "EXISTS rewrites each NULL to FALSE before comparing",
      "EXISTS is evaluated once up front, before the NULLs enter the list",
      "EXISTS quietly appends AND shipped_at IS NOT NULL to the inner WHERE",
    ],
    answer: 0,
    why: "EXISTS only asks 'did the inner query return any row' — it never compares an outer value against shipped_at, so the 21 NULLs never enter play. Receipts: the shipped-EXISTS finds 10 customers, NOT EXISTS 6.",
    notes: [
      { choice: 3, why: "EXISTS adds no implicit filter; the inner WHERE you write is the whole story." },
    ],
  },
  { id: "dr4-edg-07", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "The inner subquery matches nothing at all. What do `id IN (…)` and `id NOT IN (…)` return across the 16 customers?",
    choices: [
      "Both return all 16 — an empty list filters nothing",
      "IN → 0 customers; NOT IN → all 16",
      "IN → all 16; NOT IN → 0",
      "Both return 0 — with nothing inside, every comparison fails",
    ],
    answer: 1,
    why: "An empty list has no NULL trap: x IN (empty) is FALSE for every row, so NOT IN flips to TRUE for everyone — verified 0 versus all 16.",
    notes: [
      { choice: 3, why: "Empty is not NULL-carrying: with zero entries there is nothing to poison, and NOT IN passes all 16." },
    ],
  },
  { id: "dr4-edg-08", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`SELECT name, (SELECT MAX(total) FROM orders) FROM customers;` runs without complaint. What exactly comes back?",
    choices: [
      "16 rows, each showing that customer's own biggest order",
      "1 row carrying the storewide max",
      "An error — scalar subqueries are not allowed in the SELECT list",
      "16 rows, all carrying the same single value — the storewide max 1088.44",
    ],
    answer: 3,
    why: "The subquery references nothing from the outer row, so SQLite computes it once and stamps the same constant (here 1088.44) on every row — verified: 16 rows out, 1 distinct value.",
    notes: [
      { choice: 0, why: "Per-row values need correlation: `(SELECT MAX(total) FROM orders o WHERE o.customer_id = customers.id)`." },
    ],
  },
  { id: "dr4-edg-09", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`SELECT name FROM customers WHERE id = (SELECT customer_id FROM orders WHERE status = 'pending');` — the inner scan hits 14 rows. What does SQLite do?",
    choices: [
      "SQLite raises an error — the subquery returns 14 rows where a scalar is expected",
      "No error — SQLite silently compares against the first pending row's customer_id (16), so exactly one customer comes back",
      "No error — SQLite treats it like IN and returns all 8 pending customers",
      "No error — SQLite picks a different pending customer on each run",
    ],
    answer: 1,
    why: "SQLite expects one value from a scalar subquery and takes the FIRST row of many without any warning — verified: it grabs customer_id 16, so exactly one customer matches.",
    notes: [
      { choice: 2, why: "Multi-row tolerance is IN's job; `=` is a scalar comparison and gets one row whether you meant it or not." },
    ],
  },
  { id: "dr4-edg-10", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`WITH customers AS (SELECT 'ghost row' AS name) SELECT name FROM customers;` — which rows does the engine actually read?",
    choices: [
      "The real table — CTE names cannot collide with table names, so the WITH is ignored",
      "Both — 17 rows: the ghost row plus the 16 real customers",
      "The CTE only — 1 row reading 'ghost row'; all 16 real customers are hidden for this statement",
      "An error — 'circular reference: customers'",
    ],
    answer: 2,
    why: "A CTE with the same name as a real table shadows it for the whole statement — verified: the query returns exactly the ghost's 1 row, and the 16 real customers are unreachable.",
    notes: [
      { choice: 3, why: "'circular reference: customers' is a different bug — it fires when the CTE body itself selects FROM customers, not when a later query reads the shadowed name." },
    ],
  },
  { id: "dr4-edg-11", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "A correlated subquery runs once per outer row, but this time the inner WHERE matches nothing for every customer. What do you get?",
    choices: [
      "EXISTS → FALSE and the scalar → NULL; an empty inner result is a normal answer, not a failure",
      "An error — a correlated subquery must return at least one row per outer row",
      "The engine skips that outer row and never evaluates it",
      "EXISTS → NULL and the scalar → 0",
    ],
    answer: 0,
    why: "An empty inner result is a legitimate answer: EXISTS evaluates to FALSE and a scalar evaluates to NULL, per outer row — verified: with an impossible inner filter, NOT EXISTS still kept all 16 customers.",
    notes: [
      { choice: 1, why: "No minimum-row rule exists; emptiness just makes the test false (EXISTS) or the value NULL (scalar)." },
    ],
  },
  { id: "dr4-edg-12", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`WITH bar AS (SELECT 338.19 AS cut) SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM bar WHERE bar.cut > 0);` — how many customers come back, and why?",
    choices: [
      "0 — the subquery never references c, so nothing can match",
      "1 — only the first customer gets tested against bar",
      "It varies per customer — the test is correlated, after all",
      "16 — the one-row inner table matches every outer row; the correlated test degenerates to a constant TRUE",
    ],
    answer: 3,
    why: "`bar` always yields exactly one row with cut = 338.19 > 0, so EXISTS is TRUE for each of the 16 outer rows — a one-row inner table turns the correlated test into a constant.",
    notes: [
      { choice: 0, why: "EXISTS does not need correlation; uncorrelated, it simply asks whether the inner query returns anything at all — here, always yes." },
    ],
  },

  // ---------- edge ----------
  { id: "dr4-edg-13", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "How many of the 16 customers survive `WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled')` on db/custom.db?",
    choices: ["4", "12", "16", "0"],
    answer: 1,
    why: "The 7 cancelled orders belong to 4 distinct customers (Alice Chen, Emma Wilson, Keiko Sato, Maya Patel); 16 − 4 = 12, matching the verified count.",
    notes: [
      { choice: 3, why: "No collapse here — orders.customer_id is never NULL, so the list is clean and NOT IN behaves like plain subtraction." },
    ],
  },
  { id: "dr4-edg-14", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Literal-list edition: how many of the 16 customers survive `WHERE id NOT IN (1, NULL)`?",
    choices: ["15", "16", "0", "12"],
    answer: 2,
    why: "Customer 1 is excluded by the match; for everyone else the NULL entry makes the NOT IN verdict unknown — so the verified answer is 0, not 15.",
    notes: [
      { choice: 0, why: "The match only kills customer 1; the NULL kills the other 15 by keeping every verdict unknown." },
    ],
  },
  { id: "dr4-edg-15", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`SELECT COUNT(*) FROM orders WHERE shipped_at IN (SELECT shipped_at FROM orders);` — the inner list carries one entry per order: 82 timestamps and 21 NULLs. Count?",
    choices: ["82", "75", "0", "21"],
    answer: 0,
    why: "IN is TRUE on any match: all 82 rows with a real timestamp find their value in the list, while the 21 NULL rows evaluate to NULL and drop out — verified.",
    notes: [
      { choice: 1, why: "75 is the count of DISTINCT timestamps; IN matches per row, so the 7 duplicated timestamps still count their rows." },
    ],
  },
  { id: "dr4-edg-16", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`SELECT COUNT(*) FROM orders WHERE total > (SELECT AVG(total) FROM orders WHERE status = 'nope');` — no order has that status. Predict the count.",
    choices: [
      "103 — a NULL bar cannot exclude anyone",
      "0",
      "52 — the delivered band sneaks under",
      "Error — AVG over an empty set has no result",
    ],
    answer: 1,
    why: "Verified: the scalar over zero rows is NULL, total > NULL is unknown for all 103 orders, and the count is 0 — an absent bar excludes everything, not nothing.",
    notes: [
      { choice: 2, why: "52 counts the delivered orders — a different filter entirely. Here no row can beat an unknown bar." },
    ],
  },
  { id: "dr4-edg-17", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`SELECT name, (SELECT MAX(total) FROM orders WHERE customer_id = c.id AND status = 'cancelled') FROM customers c;` — how many of the 16 rows show NULL?",
    choices: ["4", "7", "12", "16"],
    answer: 2,
    why: "Only the cancelled club — Alice Chen, Emma Wilson, Keiko Sato, Maya Patel — gets a number; the other 12 customers' inner scans are empty, and MAX over nothing is NULL (verified 12).",
    notes: [
      { choice: 0, why: "4 is how many rows show a VALUE; the question counts the NULL stamps." },
    ],
  },
  { id: "dr4-edg-18", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "The inner query is forced empty with `WHERE 1 = 0` and stays uncorrelated. Over the 16 customers, what do the EXISTS and NOT EXISTS forms return?",
    choices: [
      "EXISTS → 16, NOT EXISTS → 0 — rows must exist somewhere",
      "Both → 0 — an empty inner set fails every test",
      "Error — an existence test needs at least one inner row",
      "EXISTS → 0 customers, NOT EXISTS → all 16",
    ],
    answer: 3,
    why: "Verified pair: 0 and 16. 'Does any row exist?' is simply FALSE against an empty set, and its negation is TRUE for every outer row.",
    notes: [
      { choice: 1, why: "No rows exist, so EXISTS is false — and NOT of false is true, which is exactly why NOT EXISTS keeps everyone." },
    ],
  },
  { id: "dr4-edg-19", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Verified on this db: `EXISTS (SELECT 1 …)`, `EXISTS (SELECT * …)` and `EXISTS (SELECT NULL …)` over the shipped-order hunt. How do the customer counts differ?",
    choices: [
      "They don't — all three return the same 10 customers",
      "1 → 10, * → 10, NULL → 0 — NULL exists nowhere",
      "1 → 10, * → 30 — one per matching row, NULL → error",
      "Only SELECT 1 parses; * and NULL fail with syntax errors",
    ],
    answer: 0,
    why: "EXISTS throws the select list away and answers only 'did a row come back' — verified: 10, 10, 10 across all three spellings.",
    notes: [
      { choice: 2, why: "EXISTS never counts rows and never reads the list; SELECT NULL still produces a row, which is all EXISTS asks for." },
    ],
  },
  { id: "dr4-edg-20", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`SELECT COUNT(*) FROM customers c WHERE EXISTS (SELECT 1 FROM customers c WHERE c.id = 99);` — both scopes use the alias c. Count?",
    choices: [
      "16 — the inner c.id reads each outer customer's id",
      "0 — the inner c shadows the outer one, and c.id = 99 matches nobody",
      "1 — exactly customer 99",
      "Error — the alias c is declared twice",
    ],
    answer: 1,
    why: "The innermost name wins: inside the subquery, c is the inner customers, so the 'correlation' compares the inner table to itself — verified count 0.",
    notes: [
      { choice: 0, why: "The outer c is unreachable under its own name once the inner query reuses it — correlate with a distinct alias." },
    ],
  },
  { id: "dr4-edg-21", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Statement 1: `WITH customers AS (SELECT 'ghost row' AS name) SELECT COUNT(*) FROM customers;` Statement 2, run right after: `SELECT COUNT(*) FROM customers;` — what do the two counts read?",
    choices: [
      "1 then 1 — the shadow outlives the statement",
      "16 then 16 — a WITH cannot hide a real table",
      "1 then 16 — the shadow ends with the statement that declares it",
      "17 then 16 — the ghost is appended to the table",
    ],
    answer: 2,
    why: "A CTE shadows the table only inside its own statement — verified: the ghost query returns 1, and the next statement sees the real 16 again.",
    notes: [
      { choice: 0, why: "A CTE is not a temp table; its scope is exactly one statement." },
    ],
  },
  { id: "dr4-edg-22", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`SELECT COUNT(*) FROM orders WHERE total >= (SELECT MAX(total) FROM orders);` — how many of the 103 orders pass the bar?",
    choices: ["1", "103", "65", "0"],
    answer: 0,
    why: "The scalar is always exactly one value (the max, 1088.44); only the top order reaches its own bar — all 103 totals are distinct, so the verified count is 1.",
    notes: [
      { choice: 2, why: "65 counts orders of 200 or more — a different bar. Here the bar sits at the very top of the data." },
    ],
  },
  { id: "dr4-edg-23", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "2 of the 16 customers own exactly one order each. In the correlated hunt for stellar orders (`total > customer's own average`), how many stellar orders do those two contribute?",
    choices: [
      "2 — a lone order always beats its own average",
      "0 — with one order, AVG equals that order's total, so the strict > is never true",
      "1 — only the larger of the two lone orders qualifies",
      "14 — they fall back to the storewide average",
    ],
    answer: 1,
    why: "Verified: the 2 solo-order customers contribute 0 stellar orders — a one-row crowd makes own-avg degenerate to the row itself.",
    notes: [
      { choice: 0, why: "Equality is not greater-than; the degenerate average pins the bar exactly at the row." },
    ],
  },
  { id: "dr4-edg-24", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Customer 2 owns 2 orders and neither one is shipped. For that customer, what does `EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')` return?",
    choices: [
      "TRUE — the customer owns orders, so something exists",
      "NULL — the shipped comparison never becomes true for them",
      "Error — EXISTS cannot handle a customer with zero shipped rows",
      "FALSE — 2 inner rows checked, 0 shipped, so no row exists",
    ],
    answer: 3,
    why: "Verified: customer 2 has 2 orders and 0 shipped rows, so the existence test short-circuits to FALSE — the extra AND decides, not the ownership.",
    notes: [
      { choice: 0, why: "EXISTing orders are not EXISTing shipped orders; every inner row must still pass the full WHERE." },
    ],
  },
  { id: "dr4-edg-25", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'pending');` — pending spans 14 orders by 8 distinct customers. How many of the 16 customers come back?",
    choices: ["8", "14", "16", "6"],
    answer: 0,
    why: "NOT IN compares against CUSTOMERS, not orders: 16 − 8 = 8 customers have no pending order at all — receipt arithmetic on the verified 14/8 split.",
    notes: [
      { choice: 1, why: "14 is the pending ORDER count; the list holds customer ids, of which there are 8 distinct." },
    ],
  },
  { id: "dr4-edg-26", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`SELECT (SELECT MAX(total) FROM orders WHERE status = 'nope') AS ghost, COUNT(*) FROM customers;` — what comes back?",
    choices: [
      "ghost = 338.19, count = 16 — empty input averages to the storewide mean",
      "ghost = 0, count = 16 — MAX of nothing is zero",
      "ghost = NULL, count = 16 — the scalar over an empty set is NULL",
      "Error — MAX requires at least one row",
    ],
    answer: 2,
    why: "Verified: the scalar scans zero rows, yields NULL, and the statement still returns its single row — aggregates over nothing are NULL, never an error and never 0.",
    notes: [
      { choice: 1, why: "Only COUNT returns 0 on empty input; MAX, AVG and SUM return NULL." },
    ],
  },

  // ---------- errors ----------
  { id: "dr4-edg-27", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT (SELECT id, name FROM customers LIMIT 1) AS s;` — what does SQLite answer?",
    choices: [
      "The id of the first customer — extra columns are ignored",
      "'sub-select returns 2 columns - expected 1'",
      "'more than one row returned by a subquery used as an expression'",
      "'no such column: name'",
    ],
    answer: 1,
    why: "Verified message: a scalar subquery must be one column WIDE. The LIMIT 1 already pins the row count — width is the loud failure here.",
    notes: [
      { choice: 2, why: "That is PostgreSQL's row-count error; SQLite is famously silent when a scalar takes the first of many rows." },
    ],
  },
  { id: "dr4-edg-28", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders WHERE oops.id = 1);` — read the error.",
    choices: [
      "'ambiguous column name: id'",
      "'circular reference: oops'",
      "No error — oops.id resolves to NULL and filters everyone out",
      "'no such column: oops.id'",
    ],
    answer: 3,
    why: "Verified message: nothing named oops exists in the inner scope (orders) or the outer scope (customers c) — the reference points at nothing.",
    notes: [
      { choice: 0, why: "Ambiguity needs the name to exist in BOTH scopes; here it exists in neither." },
    ],
  },
  { id: "dr4-edg-29", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`WITH customers AS (SELECT * FROM customers) SELECT COUNT(*) FROM customers;` — what does SQLite say?",
    choices: [
      "'circular reference: customers'",
      "It runs against the real table and prints 16",
      "It runs against the empty CTE and prints 0",
      "'table customers has no column named name'",
    ],
    answer: 0,
    why: "Verified message: without RECURSIVE, a CTE body may not mention its own name — the shadow already hides the real table inside the body, so the name only ever sees itself.",
    notes: [
      { choice: 1, why: "Shadowing starts with the NEXT reference, not inside the body being defined — that is exactly why the body's customers is circular." },
    ],
  },
  { id: "dr4-edg-30", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "Three of these run silently with surprising results; one RAISES an error. Which one errors?",
    choices: [
      "`WHERE id = (SELECT customer_id FROM orders WHERE status = 'pending')` — 14 rows inside",
      "`WHERE id NOT IN (SELECT shipped_at FROM orders)` — 21 NULLs inside",
      "`SELECT (SELECT id, name FROM customers) FROM customers;` — 2 columns inside",
      "`WHERE EXISTS (SELECT NULL FROM orders)` — NULL as the select list",
    ],
    answer: 2,
    why: "Width is the only loud failure — 'sub-select returns 2 columns - expected 1' (verified). The 14-row scalar, the NULL-bearing NOT IN and the NULL-in-EXISTS all run silently.",
    notes: [
      { choice: 0, why: "SQLite takes the first row and moves on — the classic silent trap this set keeps circling." },
    ],
  },

  // ---------- predict ----------
  { id: "dr4-edg-31", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "On db/custom.db: `SELECT COUNT(*) FROM customers WHERE id NOT IN (SELECT shipped_at FROM orders);` — 21 of those shipped_at values are NULL. Predict the count.",
    choices: ["0", "12", "16", "21"],
    answer: 0,
    why: "Verified: the single NULL poisons the whole list, every id's NOT IN is unknown, and 0 of the 16 customers survive.",
    notes: [
      { choice: 2, why: "16 would need a NULL-free list; even one NULL anywhere in the list zeroes the result." },
    ],
  },
  { id: "dr4-edg-32", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Same hunt, guarded: `… id NOT IN (SELECT shipped_at FROM orders WHERE shipped_at IS NOT NULL)`. Predict the count on db/custom.db.",
    choices: ["0", "12", "16", "4"],
    answer: 1,
    why: "Verified: with the NULLs filtered inside the subquery, the comparison finally gets to answer — 12 customers come back instead of the collapsed 0.",
    notes: [
      { choice: 2, why: "The guard fixes the poison, not the matches; the list is still non-empty, so not every customer automatically passes." },
    ],
  },
  { id: "dr4-edg-33", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "`SELECT category, AVG(price) AS ap FROM products GROUP BY category HAVING ap > (SELECT AVG(price) FROM products);` — storewide avg price is 71.78. How many categories survive?",
    choices: [
      "0 — HAVING cannot compare against a subquery",
      "6 — every above-average product drags its category along",
      "3 — Wearables (139.50), Audio (109.66), Video (84.50)",
      "1 — only Wearables clears 71.78",
    ],
    answer: 2,
    why: "Verified: the scalar gives one bar for every group, and exactly 3 categories beat 71.78 — a scalar subquery in HAVING is perfectly legal.",
    notes: [
      { choice: 1, why: "6 counts above-average PRODUCTS, not categories — HAVING filters the grouped rows, one verdict per category." },
    ],
  },
  { id: "dr4-edg-34", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "`SELECT COUNT(*) AS rows_out, COUNT(DISTINCT (SELECT AVG(total) FROM orders)) AS distinct_stamp FROM customers;` — predict both numbers (storewide avg = 338.19).",
    choices: [
      "16 and 16 — the stamp recomputes per customer",
      "1 and 1 — the scalar collapses the query to one row",
      "16 and 0 — the stamp comes back NULL",
      "16 and 1 — one storewide value stamped on every row",
    ],
    answer: 3,
    why: "Verified: 16 rows out, 1 distinct stamp. The subquery mentions no outer column, so SQLite computes 338.19 once and copies it onto all 16 rows.",
    notes: [
      { choice: 0, why: "Per-row stamps need correlation, e.g. `WHERE o.customer_id = c.id` inside the scalar." },
    ],
  },
  { id: "dr4-edg-35", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "On db/custom.db: `WITH customers AS (SELECT 'ghost row' AS name) SELECT COUNT(*) FROM customers;` — predict the count.",
    choices: ["1", "16", "17", "0"],
    answer: 0,
    why: "Verified: the CTE named customers shadows the real 16-row table for this statement — the query counts the ghost's single row.",
    notes: [
      { choice: 1, why: "Shadowing REPLACES the table for the statement; it does not merge 1 ghost with 16 real rows." },
    ],
  },
  { id: "dr4-edg-36", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "EXISTS finds 10 customers with a shipped order. Predict the NOT EXISTS twin — customers with no shipped order — on db/custom.db.",
    choices: [
      "0 — NOT EXISTS collapses just like NOT IN",
      "6",
      "16",
      "10 — it mirrors EXISTS exactly",
    ],
    answer: 1,
    why: "Verified: 10 customers have a shipped order and 6 do not — row-existence logic stays NULL-proof where the NOT IN rewrite of the same question would collapse to 0.",
    notes: [
      { choice: 0, why: "The collapse belongs to value-comparison NOT IN; NOT EXISTS never compares against the NULL-bearing values." },
    ],
  },

  // ---------- judgment ----------
  { id: "dr4-edg-37", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "You must write 'customers with no matching inner row' and the inner column might contain NULLs. Which form do you reach for by default?",
    choices: [
      "NOT IN — shortest to write and SQLite optimizes it fine",
      "NOT IN plus DISTINCT on the inner column — DISTINCT strips the NULLs",
      "NOT EXISTS (or LEFT JOIN … IS NULL) — existence logic is immune to the NULL collapse",
      "NOT IN, plus an `outer_col = NULL` OR-branch to catch the stragglers",
    ],
    answer: 2,
    why: "On this db the NOT IN form over a NULL-bearing column returned 0 while NOT EXISTS returned its honest 6 — existence tests never compare against the poison values.",
    notes: [
      { choice: 1, why: "DISTINCT dedups values but keeps ONE NULL entry — the collapse survives dedup untouched." },
    ],
  },
  { id: "dr4-edg-38", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "When is `SELECT name, (SELECT MAX(total) FROM orders) FROM customers` the right tool rather than a silent bug?",
    choices: [
      "Never — scalar subqueries only belong in WHERE comparisons",
      "Only when the outer table has exactly one row",
      "Whenever you need speed — the engine optimizes the stamp better than a JOIN",
      "When you truly want one storewide constant repeated on every row; correlate when each row needs its own value",
    ],
    answer: 3,
    why: "Verified behavior: the uncorrelated scalar stamps one value on all 16 rows — exactly right for a storewide figure like 338.19, exactly wrong when each row needed its own number.",
    notes: [
      { choice: 2, why: "Performance is not the issue — the stamp is cheap; the risk is semantic, writing one value where per-row values were meant." },
    ],
  },
  { id: "dr4-edg-39", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Your `= (SELECT customer_id FROM orders WHERE …)` can legitimately match several rows tomorrow. What is the responsible hardening?",
    choices: [
      "Nothing — SQLite always uses the last row, which is at least deterministic",
      "Cast the subquery result to TEXT so multi-row answers cannot overflow the comparison",
      "Add DISTINCT to the subquery — that collapses any inner result to one row",
      "Make one-row-ness explicit: LIMIT 1 with a deterministic ORDER BY, or switch to IN or an aggregate like MAX",
    ],
    answer: 3,
    why: "The silent first-row grab depends on scan order — undocumented and unstable (verified: it silently picked customer_id 16). Make the single value explicit or use a set operator.",
    notes: [
      { choice: 2, why: "DISTINCT removes duplicate VALUES, not rows — 8 distinct pending-customer ids stay 8 rows." },
    ],
  },
  { id: "dr4-edg-40", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A teammate's report names its CTE `customers` and silently returns 1 row where 16 were expected. What rule do you propose?",
    choices: [
      "Allow it, but add DISTINCT to the outer query so the lost rows come back",
      "Allow it in read-only reports only — writes can never be shadowed",
      "Name CTEs in ALL CAPS so the engine prefers the real table",
      "Ban CTE and alias names that collide with real tables — the shadow is legal and silent, so only naming discipline catches it",
    ],
    answer: 3,
    why: "Verified: the ghost CTE replaced the real table and the engine never warned — 1 row instead of 16. There is no flag to flip; the fix is human.",
    notes: [
      { choice: 0, why: "DISTINCT cannot restore rows that never entered the query — the real customers were shadowed away before any dedup ran." },
    ],
  },
];
