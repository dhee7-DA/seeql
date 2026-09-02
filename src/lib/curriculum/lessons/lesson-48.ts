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
      expected: EXPECTED["l48-p4"],
    },
  ],
  takeaway: "EXPLAIN QUERY PLAN is the engine's confession — SCAN means sweep, SEARCH USING INDEX means descent — and CREATE INDEX (plain, composite by leftmost prefix, UNIQUE as a constraint) is how you buy the descent, paid for on every future write.",
};
