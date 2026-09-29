// Drill set — Indexes & EXPLAIN (Module 11, secondary, 18 questions).
// Engine-verified receipts (db/custom.db, scripts/m11-facts.ts): the whole
// schema carries ZERO secondary indexes (every PK is a rowid alias, so
// sqlite_master holds no index rows beyond the auto PK machinery). EQP
// receipts: `WHERE status = 'shipped'` → "SCAN orders"; `WHERE id = 42` →
// "SEARCH orders USING INTEGER PRIMARY KEY (rowid=?)"; `WHERE name LIKE
// '%a%'` → "SCAN customers"; GROUP BY status → "SCAN orders" + "USE TEMP
// B-TREE FOR GROUP BY". Selectivity: 4 statuses (cancelled 7 / delivered 52
// / pending 14 / shipped 30), 16 customers; customer 1 = 24 orders totaling
// $7,262.35; July 2024 = 8 orders; name prefix 'A%' = 1 customer vs
// contains '%a%' = 14; top totals 1088.44 / 945.21 / 845.92.

import type { DrillQ } from "../types";

const KW = "Indexes & EXPLAIN";

export const INDEXES_EXPLAIN: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr11-ix-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which statement builds the index the status filter keeps begging for?",
    choices: [
      "`CREATE INDEX idx_orders_status ON orders (status);`",
      "`CREATE INDEX orders (status);`",
      "`ADD INDEX idx_orders_status TO orders (status);`",
      "`MAKE INDEX ON orders.status;`",
    ],
    answer: 0,
    why: "`CREATE INDEX <name> ON <table> (<columns>)` — name it, anchor it to its table, list the indexed columns. After this runs, `WHERE status = 'shipped'` flips from SCAN orders to SEARCH … USING INDEX in EXPLAIN QUERY PLAN.",
    notes: [
      { choice: 2, why: "ADD INDEX is MySQL/Postgres ALTER syntax, not SQLite's standalone CREATE." },
    ],
  },
  { id: "dr11-ix-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "How do you ask SQLite to print the plan it intends to run?",
    choices: [
      "`EXPLAIN QUERY PLAN SELECT … ;`",
      "`SHOW PLAN FOR SELECT …;`",
      "`SELECT PLAN(SELECT …);`",
      "`DEBUG SELECT …;`",
    ],
    answer: 0,
    why: "EXPLAIN QUERY PLAN prefixes any statement and returns the plan as rows (the plan-as-contract from lesson-64): SCAN means read everything, SEARCH means use a key/index, USE TEMP B-TREE means an extra sort/spill. No statement executes — plans are read, not run.",
  },

  // ---------- semantics ----------
  { id: "dr11-ix-03", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "The storefront schema carries ZERO secondary indexes. Why do `WHERE id = 42` lookups still read 'SEARCH … USING INTEGER PRIMARY KEY (rowid=?)'?",
    choices: [
      "SQLite lies in EXPLAIN when no index exists",
      "The INTEGER PRIMARY KEY IS the rowid — the row's physical address; equality on it is a direct b-tree descent, no secondary index needed",
      "PRIMARY KEY creates a hidden secondary index automatically",
      "id = 42 scans so fast it looks like a search",
    ],
    answer: 1,
    why: "The lesson's opening hook: every PK here is a rowid alias, so the table IS the index for id lookups — SEARCH (rowid=?) means a direct descent, the fastest shape SQLite has. Secondary indexes are for NON-id columns: status, customer_id, created_at — all of which SCAN today.",
    notes: [
      { choice: 2, why: "No hidden extras — sqlite_master shows no index rows. The PK's power comes from BEING the table's storage order, not from a side structure." },
    ],
  },
  { id: "dr11-ix-04", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does 'SCAN orders' in the plan actually promise?",
    choices: [
      "The engine reads the whole table row by row — O(n) in the table's rows",
      "The engine uses an index",
      "The table is corrupted",
      "The query returns no rows",
    ],
    answer: 0,
    why: "SCAN = full read: every one of the 103 orders gets examined to find the 30 shipped ones. Fine at 103 rows, expensive at 10 million. SEARCH is the plan's way of saying a key structure jumps to the matches — the SCAN/SEARCH dichotomy is the first thing to read in any plan.",
    notes: [
      { choice: 1, why: "That's SEARCH's line, with the index named. SCAN never names an index — it isn't using one." },
    ],
  },
  { id: "dr11-ix-05", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "Why does `CREATE INDEX … ON orders (customer_id, created_at)` serve `WHERE customer_id = 1 AND created_at LIKE '2024-07%'` better than two single-column indexes?",
    choices: [
      "It doesn't — two single indexes are always equivalent",
      "One composite index can serve both predicates in leftmost-prefix order (customer_id, then created_at within that customer) — one SEARCH instead of two probes merged",
      "Composite indexes store the data twice as compactly",
      "Because LIKE can only use indexes when it's second",
    ],
    answer: 1,
    why: "The composite is ordered customer_id THEN created_at: filter customer 1 (24 orders) and the created_at prefix narrows WITHIN that slice — one descent finds July's 8 orders for customer 1. Two separate indexes each match millions-ish of rows independently and must be merged. One well-ordered composite beats two singles that team up badly.",
    notes: [
      { choice: 3, why: "Backwards — LIKE only helps from the index's FIRST column (prefix-anchored patterns). Column order within the index is the design decision." },
    ],
  },

  // ---------- edge ----------
  { id: "dr11-ix-06", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Index on (customer_id, created_at). Which query can use it — and which CANNOT skip a scan?",
    choices: [
      "`WHERE created_at > '2024-06-01'` uses it; `WHERE customer_id = 1` can't",
      "`WHERE customer_id = 1` uses it; `WHERE created_at > '2024-06-01'` alone can't (leftmost prefix: the second column is only reachable THROUGH the first)",
      "Both use it fully",
      "Neither — indexes need three columns",
    ],
    answer: 1,
    why: "The leftmost-prefix rule: the index is sorted by customer_id, then created_at WITHIN each customer. Filtering created_at alone has no ordering to exploit — the engine scans. Customer 1's 24 orders via the index: one SEARCH. A date-only report on this index: full scan.",
    notes: [
      { choice: 0, why: "Exactly inverted — prefix means LEFT first. The second column is a suburb of the first; you can't drive there directly." },
    ],
  },
  { id: "dr11-ix-07", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`WHERE name LIKE '%a%'` plans as SCAN customers (14 of 16 match). `WHERE name LIKE 'A%'` with an index on name would plan as SEARCH. What separates them?",
    choices: [
      "Case sensitivity",
      "A LEADING wildcard can't use the index's sorted order — the match can start anywhere; a prefix pattern ('A%', 1 customer) walks straight to the A-range",
      "The % character is banned in indexed queries",
      "'%a%' is faster because it matches more",
    ],
    answer: 1,
    why: "An index is a sorted structure; 'A%' is a RANGE (everything from 'A' to 'B-') so the engine can descend. '%a%' has no known starting point — the sorted order is useless and the plan says SCAN. The engine-verified selectivity (1 vs 14) also shows why: low-selectivity predicates don't deserve indexes anyway.",
    notes: [
      { choice: 3, why: "Matching MORE is the problem, not the speed — an index on a predicate that keeps 14/16 rows would still be read end-to-end, just slower." },
    ],
  },
  { id: "dr11-ix-08", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`USE TEMP B-TREE FOR GROUP BY` appears in the plan for `SELECT status, COUNT(*) FROM orders GROUP BY status`. What is SQLite telling you?",
    choices: [
      "The rows must be sorted into status order in a temporary structure before grouping — an index on status would eliminate the temp b-tree",
      "The query failed",
      "A persistent index is being created",
      "The results are wrong until you add ORDER BY",
    ],
    answer: 0,
    why: "GROUP BY needs like-rows adjacent; with no index on status, the engine sorts 103 rows into a temp b-tree first. CREATE INDEX idx ON orders(status) hands the engine pre-sorted order — the temp line disappears and the plan becomes a straight index walk. Same answer, fewer moving parts.",
    notes: [
      { choice: 3, why: "GROUP BY output is already grouped correctly — the temp b-tree is about WORK, not correctness. ORDER BY status would reuse the same sort for free." },
    ],
  },
  { id: "dr11-ix-09", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "An index on orders(total) exists. `ORDER BY total DESC LIMIT 3` (the top: 1088.44, 945.21, 845.92) can…",
    choices: [
      "Walk the index BACKWARD from its largest entry — no sort at all",
      "Only use the index for ASC; DESC forces a full sort",
      "Use the index only with an explicit DESC index",
      "Ignore the index — LIMIT breaks index use",
    ],
    answer: 0,
    why: "A b-tree is readable in both directions: the engine steps backward from the biggest total and stops after 3 — the plan shows the index, no temp sort. LIMIT + matching index order = the cheapest top-N shape there is (the m11 lesson's sort-serving receipt).",
    notes: [
      { choice: 2, why: "DESC indexes exist for multi-column mixes (ASC here, DESC there), but a single-column index serves either direction by walking it the right way." },
    ],
  },

  // ---------- errors ----------
  { id: "dr11-ix-10", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "You add `CREATE INDEX idx_cust ON orders (customer_id);` then EXPLAIN a customer filter — still 'SCAN orders'. Most likely reason?",
    choices: [
      "EXPLAIN QUERY PLAN ignores indexes",
      "The planner judged the index not worth it — on tiny tables (or low-selectivity predicates) a scan is cheaper than the index dance; the planner costs both and picks",
      "The index name must match the WHERE column",
      "Indexes need ANALYZE to exist at all",
    ],
    answer: 1,
    why: "The planner is an economist, not an obey-er: at 103 rows, scanning can beat a b-tree probe + row fetches. That's the lesson's plan-as-contract reading — the plan shows the DECISION, and small-data SCANs are correct decisions, not bugs. (Run ANALYZE and the statistics sharpen; the principle stands.)",
    notes: [
      { choice: 2, why: "Index names are labels, not bindings — the planner chooses structures by usefulness, never by name." },
    ],
  },
  { id: "dr11-ix-11", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "A colleague indexes EVERY column 'to be safe'. What's the sharpest cost to name?",
    choices: [
      "SELECTs slow down",
      "Every INSERT/UPDATE/DELETE must maintain each index — 16-product inserts become 16-structure updates; write-heavy paths pay forever",
      "Tables can only have one index",
      "Disk is free — no real cost",
    ],
    answer: 1,
    why: "Indexes are pre-sorted copies that every write must keep sorted. The lesson's write-cost receipt: bulk-loading into an unindexed table, then indexing at the end, is dramatically faster than indexing first. Reads get faster; writes pay each time. 'Safe' everywhere = slow where it hurts.",
    notes: [
      { choice: 0, why: "Reads mostly keep or GAIN speed — the bill lands on the write side and the disk side." },
    ],
  },
  { id: "dr11-ix-12", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "Reading the plan: `SEARCH o USING INDEX idx_cust (customer_id=?)` then `SCAN orders` on the SAME query. What does the second line mean for a JOIN plan?",
    choices: [
      "The query is broken",
      "The join loop: for each order found via the index, the OTHER table (orders, from the outer position) is scanned — the loop's inner side has no useful index; add one on its join column to flip it to SEARCH",
      "A second index was ignored",
      "Two queries ran",
    ],
    answer: 1,
    why: "EXPLAIN QUERY PLAN prints one line PER TABLE PER LOOP. The m11 receipt `SELECT o.id FROM orders o JOIN order_items oi ON oi.order_id = o.id`: whichever side probes by index is SEARCH; whichever side feeds linearly is SCAN. The join-loop flip — index the inner table's join column — is the single highest-leverage plan change in OLTP reads.",
    notes: [
      { choice: 2, why: "No ignoring happens — the second line is a DIFFERENT table's role in the same loop, not a rejected index." },
    ],
  },

  // ---------- predict ----------
  { id: "dr11-ix-13", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Storefront receipt (zero indexes): `EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'shipped';`. The plan reads…",
    choices: [
      "\"SCAN orders\"",
      "\"SEARCH orders USING INTEGER PRIMARY KEY (rowid=?)\"",
      "\"USE TEMP B-TREE FOR status\"",
      "\"SEARCH orders USING INDEX idx_status\"",
    ],
    answer: 0,
    why: "status has no index (the whole schema carries zero secondary indexes — sqlite_master verified), so the only route is the full read: SCAN orders. It finds the 30 shipped among 103 — correct, and at this scale even reasonable.",
    notes: [
      { choice: 1, why: "That line belongs to `WHERE id = 42` — equality on the rowid alias. status is an ordinary column with no structure behind it." },
    ],
  },
  { id: "dr11-ix-14", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Storefront receipt: `EXPLAIN QUERY PLAN SELECT * FROM orders WHERE id = 42;`. The plan reads…",
    choices: [
      "\"SCAN orders\"",
      "\"SEARCH orders USING INTEGER PRIMARY KEY (rowid=?)\"",
      "\"SCAN orders USING INDEX\"",
      "\"USE TEMP B-TREE FOR id\"",
    ],
    answer: 1,
    why: "id is the INTEGER PRIMARY KEY = rowid: equality lookups descend the table's own b-tree straight to the row. The engine-verified line names exactly that — SEARCH … (rowid=?). One row found, zero wasted reads: the fastest lookup shape in SQLite.",
    notes: [
      { choice: 0, why: "A SCAN here would mean the rowid machinery was bypassed — never happens for bare id equality." },
    ],
  },
  { id: "dr11-ix-15", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "After `CREATE INDEX idx_total ON orders (total)`, the plan for `SELECT id, total FROM orders ORDER BY total LIMIT 3` shows…",
    choices: [
      "SEARCH orders USING INDEX idx_total — no temp b-tree, the index walks in order and stops at 3",
      "SCAN orders + USE TEMP B-TREE FOR ORDER BY",
      "Nothing — plans can't be taken after DDL",
      "SEARCH orders USING INTEGER PRIMARY KEY",
    ],
    answer: 0,
    why: "The index IS the sort: walking idx_total from the smallest total serves ORDER BY total with zero sorting, and LIMIT stops the walk after 3 rows. Covering bonus: id and total both live in the index (rowid aliasing), so the table is never touched. The sort line vanishes — that's sort-serving.",
    notes: [
      { choice: 1, why: "That's the BEFORE picture — the temp b-tree line is what the index eliminates. Compare both plans and the win is one line." },
    ],
  },

  // ---------- judgment ----------
  { id: "dr11-ix-16", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Which predicate on this storefront is the WORST candidate for an index — and why?",
    choices: [
      "customer_id — 16 distinct values over 103 orders",
      "status — 4 values; the best case (delivered) still matches 52 of 103 rows, so an index would be read end-to-end anyway",
      "created_at — 84 distinct days",
      "id — already the rowid",
    ],
    answer: 1,
    why: "Selectivity is the judgment dial: an index pays when it DISCRIMINATES (id: 1 row; name prefix 'A%': 1 of 16). status tops out at 30/103 shipped — even the best status keeps ~29% of the table, close enough to a scan that the planner may skip the index entirely. Low-cardinality columns earn indexes only in combination (status, created_at).",
    notes: [
      { choice: 3, why: "Wasteful but for a different reason — id needs no index because it IS the table's address. The status column actively misleads the planner at these ratios." },
    ],
  },
  { id: "dr11-ix-17", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A report runs hourly: top-5 orders by total, filtered to July 2024 (8 of 103 orders). Design the best single index.",
    choices: [
      "Index on (total) alone",
      "Index on (created_at, total) — the date prefix jumps to July's slice, and within it totals are pre-sorted for the top-5 walk",
      "Index on (total, created_at)",
      "No index — 103 rows is too small to bother",
    ],
    answer: 1,
    why: "Column order follows the query: equality/prefix filter FIRST (created_at), sort/aggregation SECOND (total). (created_at, total) turns the report into one index walk; (total, created_at) sorts everything by total first and then must filter — backwards for this shape. The lesson's composite-ordering rule: filters left, sorters right.",
    notes: [
      { choice: 3, why: "Size is the wrong dial — the pattern matters. The same query at 10M orders with the right index is one walk; with none, a full scan + sort, hourly." },
    ],
  },
  { id: "dr11-ix-18", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "When is the honest answer 'don't add the index'?",
    choices: [
      "Never — indexes are always net positive",
      "When writes dominate, the table is tiny, or the predicate is low-selectivity — the maintenance cost and planner shrug outweigh read wins",
      "Only on tables with PRIMARY KEYs",
      "When the query uses LIMIT",
    ],
    answer: 1,
    why: "The lesson's workflow ends in judgment, not reflex: measure the real query (EXPLAIN QUERY PLAN), weigh read wins against write/disk costs, and let the planner's decision inform yours. A 103-row lookup table or a status column at 29% selectivity is FASTER unindexed — the discipline is knowing when SCAN is already the right answer.",
    notes: [
      { choice: 3, why: "LIMIT is usually a reason TO index (top-N walks stop early) — the opposite of this answer." },
    ],
  },
];
