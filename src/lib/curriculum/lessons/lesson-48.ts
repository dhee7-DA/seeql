import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson48: Lesson = {
  id: "lesson-48",
  num: 48,
  title: "Indexes & EXPLAIN QUERY PLAN",
  blurb: "How SQLite actually finds rows — SCAN vs SEARCH, creating indexes (plain, composite, UNIQUE), reading the plan the engine prints, and what every index quietly charges your writes",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "103 orders make every query instant. 103 million make `WHERE customer_id = 1` a career problem: without help, SQLite **scans** — reads every row, tests the condition, discards the misses. An **index** is the help: a sorted lookup structure on one or more columns that turns the full sweep into a targeted descent. This lesson gives you two superpowers that go together: building indexes, and reading **EXPLAIN QUERY PLAN** — the engine's own account of how it will run your query.",
    },
    { kind: "diagram", figure: "d4-index-lookup" },
    { kind: "h", text: "Read the plan before you build" },
    {
      kind: "code",
      caption: "Ask the engine how it runs a query — prefix any SELECT",
      sql: `EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE customer_id = 1;
-- SCAN orders   ← every row read, tested, mostly discarded`,
    },
    {
      kind: "bullets",
      items: [
        "The plan is rows of plain text: **SCAN t** means a full table sweep; **SEARCH t USING INDEX i (col=?)** means an index descent — the second is what you pay indexes for.",
        "It's a read: EXPLAIN runs anywhere SELECTs run — including right here, where it's graded like any query.",
      ],
    },
    { kind: "h", text: "CREATE INDEX — build the shortcut" },
    {
      kind: "code",
      caption: "One statement; the plan changes immediately",
      sql: `CREATE INDEX idx_orders_customer ON orders(customer_id);

EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE customer_id = 1;
-- SEARCH orders USING INDEX idx_orders_customer (customer_id=?)`,
    },
    {
      kind: "bullets",
      items: [
        "An index is a sorted copy of the key columns plus a row pointer, kept in a B-tree and **maintained on every write** — INSERT, UPDATE, DELETE all now touch it. That's the price: reads get a shortcut, writes pay rent forever.",
        "**Composite** indexes sort by column list: `CREATE INDEX idx_items_op ON order_items(order_id, product_id)` serves filters on `order_id` and on `(order_id, product_id)` — but NOT on `product_id` alone (the **leftmost-prefix** rule: a phone book sorted by surname is no help for finding by first name).",
        "**CREATE UNIQUE INDEX** — the constraint from lesson 45 as a standalone statement: the index enforces uniqueness on the spot. `CREATE UNIQUE INDEX idx_customers_email ON customers(email)` succeeds here because all 16 emails are distinct — a single duplicate would reject the whole statement.",
      ],
    },
    { kind: "diagram", figure: "d48-index-space-3d" },
    {
      kind: "warn",
      text: "Don't index everything. Every index taxes every write, and there are already several in play (each PRIMARY KEY and UNIQUE constraint is one). Index the columns you FILTER and JOIN on in hot queries — customer_id, created_at, status — not the columns you merely SELECT. On a 16-row table it's all theater; the habit is what transfers.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Same CREATE INDEX shape, more exotic species: partial indexes (`WHERE …` on the index itself), GIN for JSON and full text, and `EXPLAIN ANALYZE` which actually runs the query and reports real row counts per step.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL spells it the same (`CREATE INDEX … ON t(col)`) and shows plans through `EXPLAIN` / `EXPLAIN ANALYZE` with a different vocabulary — `type: ref` is roughly SQLite's SEARCH, `type: ALL` is the full scan.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite picks one index per table access, uses indexes for ORDER BY when they match the sort, and prints `SCAN t USING COVERING INDEX i` when the index alone can answer the query without touching the table. `ANALYZE` (run once) collects statistics that make its choices smarter.",
    },
    {
      kind: "tip",
      text: "The workflow is a loop: run EXPLAIN QUERY PLAN → spot a SCAN on a hot filter → CREATE INDEX → run EXPLAIN again and read SEARCH. Two statements and one look — no benchmarking rig required, and it works identically on day one and on ten million rows.",
    },
  ],
  mcqs: [
    {
      id: "l48-q1",
      prompt: "What is a database index, structurally?",
      choices: [
        "A copy of the whole table, compressed",
        "A sorted lookup structure over the key columns plus row pointers, kept current on every write",
        "A cache of recent query results",
        "A second copy of the data used for backups",
      ],
      answer: 1,
      why: "An index keeps the chosen columns sorted in a B-tree with pointers back to rows — that's why a lookup can jump instead of sweeping, and why every INSERT/UPDATE/DELETE must also maintain it. It's structure, not a snapshot or a cache.",
      notes: [
        { choice: 2, why: "Result caches live above the engine. The index works for ANY query matching its columns — including ones never run before — because it's built on the data, not on past queries." },
      ],
    },
    {
      id: "l48-q2",
      prompt: "EXPLAIN QUERY PLAN prints `SCAN orders`. What will the engine physically do?",
      choices: [
        "Read every row of orders and test the WHERE against each",
        "Use a hidden system index",
        "Read only the first matching row",
        "Nothing — SCAN means the query is invalid",
      ],
      answer: 0,
      why: "SCAN is the full-table sweep: every row read, every row tested. It's perfectly fine on 103 rows — the lesson's point is spotting it on hot queries over big tables and deciding whether an index is worth it.",
      notes: [
        { choice: 2, why: "That's LIMIT's story, not the scan's — the sweep stops early only when LIMIT lets it. Without LIMIT, every row is read." },
      ],
    },
    {
      id: "l48-q3",
      prompt: "An index exists on `order_items(order_id, product_id)`. Which filter can use it directly?",
      choices: [
        "WHERE product_id = 7",
        "WHERE order_id = 42",
        "Both equally",
        "Neither — only single-column indexes are used",
      ],
      answer: 1,
      why: "Leftmost prefix: a composite index is sorted by order_id first, so filtering on order_id (or order_id + product_id) is a clean descent. Filtering on product_id alone can't use the sort order — the second column only matters within equal firsts.",
      notes: [
        { choice: 2, why: "The phone-book test: sorted by surname then first name, you find 'Smith, John' instantly but 'John, anyone' requires reading the book. Column ORDER in the definition is the whole design decision." },
      ],
    },
    {
      id: "l48-q4",
      prompt: "You add five indexes to a table that absorbs 5,000 writes per minute. What changes?",
      choices: [
        "Reads only — writes are unaffected",
        "Every write now maintains all five structures — write cost multiplies",
        "Nothing until the table exceeds 1M rows",
        "Writes speed up too — more paths in",
      ],
      answer: 1,
      why: "Indexes aren't free posters on the wall: each INSERT/UPDATE/DELETE must update every index on the touched columns. Heavy-write tables want few, surgical indexes; hot read paths justify each one via EXPLAIN.",
      notes: [
        { choice: 2, why: "The tax starts immediately — it's just invisible on small data. The reason 'index everything' feels free in dev and dies in production is exactly this per-write maintenance." },
      ],
    },
    {
      id: "l48-q5",
      prompt: "`CREATE UNIQUE INDEX idx_customers_email ON customers(email);` — the table holds 16 rows with two sharing an email. Result?",
      choices: [
        "The index builds and flags the duplicates",
        "The statement fails — a UNIQUE index refuses to be built over duplicate values",
        "The second duplicate is deleted",
        "It builds; only future inserts are checked",
      ],
      answer: 1,
      why: "UNIQUE is enforced at build time: the statement errors with the duplicate values named. The same rule then guards every future INSERT and UPDATE — it's lesson 45's UNIQUE constraint, added after the fact.",
      notes: [
        { choice: 3, why: "Future writes are checked too — but only if the build succeeded. Existing violations must be cleaned first; the index is the contract, not a report." },
      ],
    },
    {
      id: "l48-q6",
      prompt: "You may index exactly one customers column: `status`-like `active` (2 values) or `email` (16 distinct values in 16 rows). Which is the better candidate, and why?",
      choices: [
        "active — booleans are cheap to store",
        "email — high selectivity means the index descends to a handful of rows; an index on 2 values still leaves half the table per lookup",
        "Neither — indexes only help large tables",
        "Both are identical — any index beats no index",
      ],
      answer: 1,
      why: "Index usefulness tracks selectivity: email's 16 distinct values across 16 rows means a lookup lands on one row immediately. active splits the table into 14/2 — even indexed, an active = 1 probe still reads 14 rows. Index columns that discriminate, not columns that partition.",
      notes: [
        { choice: 0, why: "Storage cost is the wrong axis — the question is how finely the index discriminates. A 2-value index is a fork; email is a phone book." },
      ],
    },
    {
      id: "l48-q7",
      prompt: "`SELECT * FROM customers WHERE id = 7` needs no CREATE INDEX. Why?",
      choices: [
        "Small tables are always fast",
        "INTEGER PRIMARY KEY IS the rowid — the table itself is organized as the lookup structure, so id lookups descend it for free",
        "The query optimizer rewrites it to a scan",
        "SQLite indexes every column by default",
      ],
      answer: 1,
      why: "A rowid table IS a b-tree keyed on rowid, and INTEGER PRIMARY KEY is an alias for it — no separate structure, no extra write cost, the fastest lookup SQLite has. This is why the storefront's every relationship lookup (customer_id = 1 on orders) is the index candidate, while customers.id already is one.",
      notes: [
        { choice: 2, why: "The optimizer can't turn a scan into a descent that the schema doesn't offer — the descent exists here because the PK declares it, not because the query asked." },
      ],
    },
    {
      id: "l48-q8",
      prompt: "In EXPLAIN QUERY PLAN's output, what do the `id` and `parent` columns describe?",
      choices: [
        "Row ids of the result set",
        "The plan's tree structure — each step's node id and its parent step, so loops and subqueries nest visibly",
        "The table's primary key being scanned",
        "Nothing — they're legacy padding",
      ],
      answer: 1,
      why: "EQP reports a TREE of steps: subqueries, joins and materializations each get a node whose parent links it to the step that consumes it. The `detail` text is the headline per node; id/parent tell you how the nodes nest — which loop runs inside which.",
      notes: [
        { choice: 2, why: "The numbers describe the PLAN's shape, not the data — a plan for a two-table join shows the inner loop as the child of the outer one." },
      ],
    },
    {
      id: "l48-q9",
      prompt: "After `CREATE INDEX idx_orders_cust_total ON orders(customer_id, total)`, what does `SELECT customer_id, total FROM orders WHERE customer_id = 1` show in the plan?",
      choices: [
        "SCAN orders — aggregates need the table",
        "SEARCH orders USING COVERING INDEX idx_orders_cust_total — both requested columns live IN the index, so the table is never touched",
        "An error — two columns can't share one index",
        "SEARCH USING INDEX only if total is also indexed alone",
      ],
      answer: 1,
      why: "When the index alone can answer the SELECT list and the filter — customer_id and total are both in it — the plan reads USING COVERING INDEX and the table b-tree is never visited. Covering is the index jackpot: the lookup becomes pure index descent.",
      notes: [
        { choice: 0, why: "The table only matters for columns OUTSIDE the index. Ask for name instead of total and the plan falls back to SEARCH … then table fetches per row." },
      ],
    },
    {
      id: "l48-q10",
      prompt: "Constraint at creation (`email TEXT UNIQUE` in CREATE TABLE) versus `CREATE UNIQUE INDEX` later — what actually differs?",
      choices: [
        "The constraint is stronger",
        "The index is stronger",
        "Nothing in enforcement — both maintain the same unique index; the difference is WHEN you can declare it (in the contract vs. anytime after)",
        "UNIQUE INDEX allows one duplicate",
      ],
      answer: 2,
      why: "SQLite implements a UNIQUE column constraint by building a unique index — identical enforcement, identical error, identical write cost. The late CREATE UNIQUE INDEX exists because contracts evolve: lesson 45's schema didn't promise email uniqueness, and this lesson makes it structural without a rebuild.",
      notes: [
        { choice: 0, why: "One enforcement machinery, two declaration moments. Which spelling you use is about migration timing, not about strength." },
      ],
    },
    {
      id: "l48-q11",
      prompt: "`CREATE INDEX idx_orders_status ON orders(status)` runs. Now `EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'shipped'` reads…",
      choices: [
        "SCAN orders — nothing changed for existing queries",
        "SEARCH orders USING INDEX idx_orders_status (status=?) — the descent the index was built for",
        "SCAN idx_orders_status",
        "An error — the query predates the index",
      ],
      answer: 1,
      why: "The planner re-plans every query fresh: with an index on the filtered column, the same WHERE that scanned 103 rows now SEARCHes — descends the index to the 30 shipped orders and fetches only those. Plans change when the schema does; that's the whole return on the index.",
      notes: [
        { choice: 2, why: "You SEARCH the table USING the index — the index isn't the scanned object; it's the map the table search follows." },
      ],
    },
    {
      id: "l48-q12",
      prompt: "Five indexes cover a table that absorbs constant writes. Beyond slower writes, what does the database FILE pay?",
      choices: [
        "Nothing — indexes are free structures in memory",
        "Each index is its own b-tree on disk — more indexes, a larger file, more pages to maintain per write",
        "The file shrinks — indexes compress data",
        "Only the WAL grows, temporarily",
      ],
      answer: 1,
      why: "Every index is a real, persistent b-tree with its own pages: insert a row and each index finds a slot, possibly splitting pages, in its own subtree. Disk footprint grows with every index and every write touches each one — the 'index the hot filters' rule is a disk-and-write budget, not a style guide.",
      notes: [
        { choice: 3, why: "WAL churn is real but secondary — the standing cost is the per-index b-tree maintenance on every write, forever." },
      ],
    },
  ],
  problems: [
    {
      id: "l48-p1",
      title: "Read the un-indexed plan",
      brief: "Run **EXPLAIN QUERY PLAN** for `SELECT * FROM orders WHERE customer_id = 1`. Read the `detail` column — one row, and it says the engine will sweep the whole table.",
      hints: [
        "EXPLAIN QUERY PLAN is a prefix — the statement stays a normal read.",
        "Shape: EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 1;",
      ],
      difficulty: "easy",
      solution: "EXPLAIN QUERY PLAN\nSELECT * FROM orders WHERE customer_id = 1;",
      mistakes: [
        { test: "explain analyze", message: "EXPLAIN ANALYZE is the other engines' spelling (and actually runs the query) — SQLite wants EXPLAIN QUERY PLAN here." },
        { test: "^select(?!.*explain)", message: "That runs the query and returns orders — useful, but the task is the PLAN: prefix it with EXPLAIN QUERY PLAN and read the detail column instead." },
      ],
      expected: EXPECTED["l48-p1"],
      ordered: true,
    },
    {
      id: "l48-p2",
      title: "Index the status lookups",
      brief: "Reports filter orders by status constantly. Create **idx_orders_status** on **orders(status)** — a plain index. The verify query looks the index up in sqlite_master.",
      hints: [
        "CREATE INDEX name ON table(column); — one statement.",
        "Shape: CREATE INDEX idx_orders_status ON orders(status);",
      ],
      difficulty: "easy",
      solution: "CREATE INDEX idx_orders_status ON orders(status);",
      verify: "SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'orders' AND name = 'idx_orders_status';",
      mistakes: [
        { test: "create unique index idx_orders_status", message: "UNIQUE would cap each status at ONE order — 52 delivered orders alone would reject it. The brief wants a plain index." },
        { test: "on orders \\( \\* \\)|on orders \\( id \\)", message: "The index column is the one you FILTER by: status. Indexing * or the PK re-creates structures that already exist." },
        { test: "\\bdrop\\b", message: "DROP removes an index — the task builds one. CREATE INDEX is the verb here." },
      ],
      mutating: true,
      expected: EXPECTED["l48-p2"],
    },
    {
      id: "l48-p3",
      title: "The composite for line lookups",
      brief: "The app's hottest query joins order_items by order and then by product. Build the **composite** index **idx_items_order_product** on **order_items(order_id, product_id)** — column order matters. Verify reads the index's column order through pragma_index_info: expect `order_id` then `product_id`.",
      hints: [
        "List both columns inside ON (…), in the stated order; the verify walks the index's columns by seqno.",
        "Shape: CREATE INDEX idx_items_order_product ON order_items(order_id, product_id);",
      ],
      difficulty: "medium",
      solution: "CREATE INDEX idx_items_order_product ON order_items(order_id, product_id);",
      verify: "SELECT name FROM pragma_index_info('idx_items_order_product') ORDER BY seqno;",
      ordered: true,
      mistakes: [
        { test: "\\(\\s*product_id\\s*,\\s*order_id\\s*\\)", message: "Reversed — order_id must be the leftmost column. The composite serves order-only filters (the hot path) and order+product pairs; flipped, the hot filter loses its index." },
        { test: "on order_items \\( order_id \\)", message: "One column short — the composite carries BOTH: (order_id, product_id). The leftmost-prefix rule needs the pair in one index to serve the combined filter." },
        { test: "unique index idx_items_order_product", message: "UNIQUE would forbid two lines sharing (order, product) — legal today by the importer's design, but a constraint the brief never asked for. Plain index." },
      ],
      mutating: true,
      expected: EXPECTED["l48-p3"],
    },
    {
      id: "l48-p4",
      title: "Enforce email uniqueness",
      brief: "Marketing swears emails are unique. Make it structural: **CREATE UNIQUE INDEX idx_customers_email ON customers(email)** — it builds only because all 16 are distinct. Verify finds the index.",
      hints: [
        "UNIQUE goes between CREATE and INDEX; the rest reads like any index.",
        "Shape: CREATE UNIQUE INDEX idx_customers_email ON customers(email);",
      ],
      difficulty: "medium",
      solution: "CREATE UNIQUE INDEX idx_customers_email ON customers(email);",
      verify: "SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'customers' AND name = 'idx_customers_email';",
      mistakes: [
        { test: "^create index idx_customers_email", message: "Missing UNIQUE — a plain index would speed lookups but allow a duplicate email tomorrow. The brief makes uniqueness structural." },
        { test: "on customers \\( name \\)", message: "Wrong column — the promise is about EMAILS; names repeat freely in the wild." },
      ],
      mutating: true,
      expected: EXPECTED["l48-p4"],
    },
    {
      id: "l48-p5",
      title: "Read the status plan, pre-index",
      brief: "Before building idx_orders_status (problem 2), read the current state: **EXPLAIN QUERY PLAN** for `SELECT * FROM orders WHERE status = 'shipped'`. One row back — the detail column says the engine will sweep all 103 orders.",
      hints: [
        "Same prefix as problem 1 — EXPLAIN QUERY PLAN stays a plain read.",
        "Shape: EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'shipped';",
      ],
      difficulty: "easy",
      solution: "EXPLAIN QUERY PLAN\nSELECT * FROM orders WHERE status = 'shipped';",
      mistakes: [
        { test: "explain\\s+analyze", message: "EXPLAIN ANALYZE is the other engines' (and SQLite's execution-measuring) spelling — this course reads the PLAN: EXPLAIN QUERY PLAN." },
        { test: "^select(?!.*explain)", message: "That runs the query and ships 30 orders — useful data, wrong question. Prefix with EXPLAIN QUERY PLAN and read the detail column." },
        { test: "using\\s+index", message: "Expect the opposite — no index on status exists yet, so the plan says SCAN orders. The SEARCH spelling arrives only after problem 2's index." },
      ],
      expected: EXPECTED["l48-p5"],
      ordered: true,
    },
    {
      id: "l48-p6",
      title: "Index the line lookups by product",
      brief: "The product page fetches every line for one product. Create **idx_items_product** on **order_items(product_id)**, then the verify counts that table's indexes in sqlite_master — 1 after your CREATE (order_items starts with none).",
      hints: [
        "One statement: CREATE INDEX name ON table(column); — the column is product_id.",
        "Shape: CREATE INDEX idx_items_product ON order_items(product_id); then SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'index' AND tbl_name = 'order_items';",
      ],
      difficulty: "easy",
      solution: "CREATE INDEX idx_items_product ON order_items(product_id);",
      verify: "SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'index' AND tbl_name = 'order_items';",
      mistakes: [
        { test: "unique\\s+index\\s+idx_items_product", message: "UNIQUE would forbid two lines selling the same product in the same order — legal today. The brief wants lookup speed, plain index." },
        { test: "on\\s+products\\s*\\(", message: "Wrong table — the lookup runs over order_items (the 251 lines), filtered by product_id. Indexing products would help product lookups, not line lookups." },
        { test: "\\bdrop\\b", message: "The task builds an index — DROP removes one. CREATE INDEX is the verb; sqlite_master verifies it landed." },
      ],
      mutating: true,
      expected: EXPECTED["l48-p6"],
    },
    {
      id: "l48-p7",
      title: "The composite for the ops dashboard",
      brief: "The ops dashboard always filters orders by customer AND status. Build the composite: **idx_orders_customer_status** on **orders(customer_id, status)** — customer_id leftmost. Verify the index's name exists in sqlite_master.",
      hints: [
        "Column order matters: the leftmost column serves the most queries — customer_id goes first.",
        "Shape: CREATE INDEX idx_orders_customer_status ON orders(customer_id, status); then SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_orders_customer_status';",
      ],
      difficulty: "medium",
      solution: "CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);",
      verify: "SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_orders_customer_status';",
      mistakes: [
        { test: "\\(\\s*status\\s*,\\s*customer_id\\s*\\)", message: "Reversed — the phone-book rule wants the most-filtered column leftmost. (status, customer_id) serves status-only filters; the dashboard's hot path is customer-first." },
        { test: "on\\s+orders\\s*\\(\\s*customer_id\\s*\\)", message: "One column short — the composite carries BOTH (customer_id, status) so the combined filter is one descent. The single-column index already exists conceptually as the PK pattern." },
        { test: "create\\s+unique\\s+index\\s+idx_orders_customer_status", message: "UNIQUE would cap each customer at ONE order per status — Alice's 24 orders say no. Plain composite index." },
      ],
      mutating: true,
      expected: EXPECTED["l48-p7"],
    },
    {
      id: "l48-p8",
      title: "Prove the UNIQUE index will hold",
      brief: "Before running `CREATE UNIQUE INDEX idx_customers_email` in production, prove the data can pass: count the duplicate-email GROUPS — subquery grouping customers by `email` with `HAVING COUNT(*) > 1`, outer `SELECT COUNT(*) AS n`. Zero means the unique build will succeed.",
      hints: [
        "The inner query lists emails that appear more than once; the outer counts those groups.",
        "Shape: SELECT COUNT(*) AS n FROM (SELECT email FROM customers GROUP BY email HAVING COUNT(*) > 1);",
      ],
      difficulty: "medium",
      solution: "SELECT COUNT(*) AS n\nFROM (\n  SELECT email\n  FROM customers\n  GROUP BY email\n  HAVING COUNT(*) > 1\n);",
      mistakes: [
        { test: "having\\s+count\\s*\\(\\s*\\*\\s*\\)\\s*>\\s*0", message: "> 0 flags every email that exists — 16 groups. Duplicates are COUNT(*) > 1: emails shared by two or more customers." },
        { test: "create\\s+unique\\s+index", message: "The proof is a read — the read-before-write discipline again: run the duplicate census FIRST, and only a zero answer earns the CREATE UNIQUE INDEX." },
        { test: "distinct", message: "SELECT DISTINCT dedupes silently — you'd never see whether duplicates existed. GROUP BY + HAVING is the census that reports them." },
      ],
      expected: EXPECTED["l48-p8"],
    },
  ],
  takeaway: "EXPLAIN QUERY PLAN is the engine's confession — SCAN means sweep, SEARCH USING INDEX means descent — and CREATE INDEX (plain, composite by leftmost prefix, UNIQUE as a constraint) is how you buy the descent, paid for on every future write.",
  deep: [
    {
      kind: "mind",
      text: "An index is a **paid-for shortcut**: a second, sorted structure (b-tree) over chosen columns that turns full-table sweeps into targeted descents — bought with extra storage and a tax on every write. This seed's secret is that it starts with ZERO secondary indexes yet is not slow at 103 rows: the rowid/INTEGER PRIMARY KEY is already a free b-tree, so id lookups SEARCH while status lookups SCAN. EXPLAIN QUERY PLAN is how you stop guessing and start reading: the detail column names the access method per step — SCAN (sweep) versus SEARCH (descent) — plus temp b-trees for sorts and \"USING COVERING INDEX\" when the index alone can answer. The module-11 discipline starts here: measure → design → verify, with EQP as the contract between you and the planner.",
    },
    {
      kind: "engine",
      title: "you run EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'shipped'",
      steps: [
        "**Plan, not rows** — EQP returns the planner's intended step list; nothing executes. It's the map, not the trip.",
        "**Read the verb** — \"SCAN orders\" = every row tested (103 here). \"SEARCH orders USING INDEX idx\" = b-tree descent to the qualifying range. The verb IS the verdict.",
        "**The counter-proof** — EQP the same query with WHERE id = 42: \"SEARCH … USING INTEGER PRIMARY KEY (rowid=?)\" — the free index you never had to build.",
        "**CREATE INDEX idx_orders_status** — rerun EQP: the SCAN became \"SEARCH … USING INDEX\". Same rows back, different path — and every future INSERT to orders now maintains that extra tree. That's the whole trade, visible in three queries.",
      ],
    },
    {
      kind: "myth",
      myth: "\"Add an index on every column you might filter — speed is free.\"",
      truth: "Each index is **storage plus a per-write maintenance tax**, and the planner can only use ONE index per table access in most plans — five single-column indexes on orders don't compose into a five-column filter; a composite can. Index design is choosing bets, not buying insurance on everything.",
    },
    {
      kind: "edge",
      items: [
        { c: "Functions on the column", r: "WHERE SUBSTR(created_at,1,7) = '2024-06' can't use an index on created_at — the function hides the raw value. Rewrite as a range: >= '2024-06-01' AND < '2024-07-01' (module 11's rewrite drill)." },
        { c: "Low-selectivity columns", r: "An index on status (4 distinct values over 103 rows) may still be ignored: reading half the table via the index is slower than sweeping. Selectivity is the planner's math, not your intuition's." },
        { c: "Leading-wildcard LIKE", r: "LIKE '%a%' cannot descend any b-tree (it doesn't know the prefix). 'a%' CAN use an index on that column — the leading wildcard is the boundary." },
        { c: "The plan changed", r: "EQP output differs after ANALYZE, data growth, or version upgrades — plans are decisions, not laws. Re-read EQP when volumes shift by orders of magnitude." },
      ],
    },  ],
};
