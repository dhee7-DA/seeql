// Fill drills for Module 8 — Schema, Views & Beyond (lessons 45-49 + capstone 51).
//
// Module constraint: the audit executes every COMPLETED SQL against the seed
// db, so all completed queries here are read-only (SELECT / WITH RECURSIVE /
// EXPLAIN QUERY PLAN). The DDL this module teaches (CREATE TABLE, ALTER,
// CREATE VIEW, CREATE INDEX) appears in prompts, why-texts and distractor
// chips only — the drills exercise the READ side: sqlite_master and
// pragma_table_info introspection, EXPLAIN QUERY PLAN output, SELECTs against
// the existing tables, and recursive CTEs that generate sequences/spines.
//
// Seed facts verified against the fresh db (scripts/scratch-verify-5h-m08.ts):
// 5 base tables + internal sqlite_sequence; orders has 6 columns (shipped_at
// nullable); products notnull=1 & no default = 4; customers' one DEFAULT is
// active's 1; zero explicit indexes anywhere; EQP prints SCAN orders for the
// customer_id filter and SEARCH … USING INTEGER PRIMARY KEY for rowid
// lookups; pending 14; EU 8 (7 active); Audio revenue 11744.01; 14 month
// buckets 2024-01…2025-02; worst month 2024-07 at 1193.86 (best 2024-01 at
// 3731.97); 90 of 103 orders are 2024-dated.
import type { Fill } from "../types";

export const FILLS_BY_LESSON: Record<number, Fill[]> = {
  // Lesson 45 — CREATE TABLE: shapes & constraints (drilled read-side: the
  // two introspection mirrors, sqlite_master and pragma_table_info).
  45: [
    {
      id: "l45-f1",
      prompt:
        "Read the orders contract back from the catalog: show the stored creation text plus the object type for the table named orders.",
      template: "SELECT {1}, type\nFROM sqlite_master\nWHERE type = 'table' AND name = {2};",
      chips: ["sql", "name", "dflt_value", "'orders'", "'customers'", "'coupons'"],
      answers: ["sql", "'orders'"],
      why: "sqlite_master's sql column stores the verbatim CREATE TABLE statement — the schema's own source code, six columns from id to shipped_at. The row is typed 'table' and named 'orders', exactly as the catalog filed it.",
      notes: [
        { slot: 1, why: "name gives you the label, not the law — the sql column holds the original CREATE text you can audit." },
        { slot: 2, why: "'customers' is a real object with a real contract, but the brief named orders — match the argument to the table under audit." },
      ],
    },
    {
      id: "l45-f2",
      prompt:
        "Count the products columns that are required AND carry no default — the ones every INSERT must name explicitly.",
      template: "SELECT COUNT(*) AS n\nFROM pragma_table_info('products')\nWHERE {1} = 1 AND {2} IS NULL;",
      chips: ['"notnull"', "pk", "dflt_value", "type", "cid"],
      answers: ['"notnull"', "dflt_value"],
      why: "Four of products' six columns are required with no backfill — name, category, price, supplier_id. stock is required too, but its DEFAULT 0 covers omissions, so dflt_value IS NULL excludes it.",
      notes: [
        { slot: 1, why: "pk flags the rowid identity — products has one (id). The required-column marker is the quoted flag \"notnull\"." },
        { slot: 2, why: "dflt_value is the default-expression column: NULL where the contract promises nothing, the backfill text where it does." },
      ],
    },
    {
      id: "l45-f3",
      prompt:
        "Prove the identity rule mechanically: count orders' primary-key columns through the pragma mirror.",
      template: "SELECT COUNT(*) AS n\nFROM pragma_table_info('orders')\nWHERE {1} = 1;",
      chips: ["pk", '"notnull"', "cid", "dflt_value"],
      answers: ["pk"],
      why: "Exactly one row answers — id, the INTEGER PRIMARY KEY and rowid alias. Every table in this schema declares exactly one identity, and the pragma counts it for you.",
      notes: [
        { slot: 1, why: "\"notnull\" = 1 finds the four required columns on orders — being required is not being the key; the identity flag is pk." },
      ],
    },
    {
      id: "l45-f4",
      prompt:
        "Fix the broken query: a colleague hunting the columns of products ran `SELECT name FROM sqlite_master WHERE type = 'columns' AND name = 'products';` — zero rows, and no error. The catalog types objects table/view/index/trigger; there is no 'columns'. Point the read at the real column-level mirror.",
      template: "SELECT name\nFROM pragma_table_info({1});",
      chips: ["'products'", "'orders'", "'sqlite_master'", "'products '", "products"],
      answers: ["'products'"],
      why: "pragma_table_info is the column mirror: six rows for products, one per column from id to supplier_id, flags included. sqlite_master answers which objects exist; the pragma answers what one table promises.",
      notes: [
        { slot: 1, why: "products (no quotes) reads as a column reference and errors — the pragma's argument is the table name as a string literal." },
        { slot: 1, why: "'orders' introspects fine, but the colleague was auditing products — mirror the table the brief named." },
      ],
    },
    {
      id: "l45-f5",
      prompt:
        "List every column name of the orders contract in declaration order — the shape you've been querying since lesson 2, holes and all.",
      template: "SELECT {1}\nFROM pragma_table_info('orders')\nORDER BY {2};",
      chips: ["name", '"notnull"', "dflt_value", "cid", "pk"],
      answers: ["name", "cid"],
      why: "Six rows in positional order: id, customer_id, status, total, created_at, shipped_at — shipped_at's NULLability is part of the contract too. cid is the column's declaration index; column order is schema.",
      notes: [
        { slot: 1, why: "\"notnull\" filters to the four required columns — this census wants all six." },
        { slot: 2, why: "ORDER BY name sorts alphabetically and buries id behind active; cid restores the order the CREATE statement wrote." },
      ],
    },
  ],

  // Lesson 46 — ALTER & DROP: schema evolution (drilled read-side: the
  // verify loop — count columns, read defaults, check the catalog).
  46: [
    {
      id: "l46-f1",
      prompt:
        "Before any ALTER lands, take the census: count the columns suppliers has today, through the column-level pragma.",
      template: "SELECT COUNT(*) AS n\nFROM {1};",
      chips: ["pragma_table_info('suppliers')", "pragma_table_info('customers')", "suppliers", "sqlite_master"],
      answers: ["pragma_table_info('suppliers')"],
      why: "Four columns — id, name, region, rating. The verify loop is one statement, one count: after ADD COLUMN phone it reads 5, after DROP COLUMN rating it reads 3. Instant catalog checks, no surprises.",
      notes: [
        { slot: 1, why: "FROM suppliers counts the six supplier ROWS — pragma_table_info('suppliers') counts the four columns of the contract." },
      ],
    },
    {
      id: "l46-f2",
      prompt:
        "ADD COLUMN … NOT NULL is only legal with a constant DEFAULT. Show which customers columns already carry a default — name and the default expression side by side.",
      template: "SELECT {1}\nFROM pragma_table_info('customers')\nWHERE {2} IS NOT NULL;",
      chips: ["name", "type", '"notnull"', "dflt_value", "pk"],
      answers: ["name", "dflt_value"],
      why: "One row answers: active, defaulted to 1. That constant-default pairing is precisely what makes ADD COLUMN … NOT NULL legal — every existing row reads the default instantly, no rewrite.",
      notes: [
        { slot: 2, why: "\"notnull\" flags the required columns — the backfill question is about dflt_value, NULL where no default exists." },
        { slot: 1, why: "type shows the declared affinity, not who fills gaps — the brief wants the column NAME next to its default." },
      ],
    },
    {
      id: "l46-f3",
      prompt:
        "Fix the broken migration: `ALTER TABLE customers ADD COLUMN locked INTEGER NOT NULL` dies with `Cannot add a NOT NULL column with default value NULL` — sixteen existing rows would have no legal value. The legal pairing is NOT NULL plus a constant DEFAULT; prove what every row would read back as under the lesson's 'standard' default.",
      template: "SELECT {1} AS tier, COUNT(*) AS n\nFROM customers;",
      chips: ["'standard'", "standard", "'premium'", "NULL", "0"],
      answers: ["'standard'"],
      why: "One row: standard | 16. The constant DEFAULT is what the ALTER backfills — all sixteen existing customers read 'standard' the instant the column exists. That's the pairing the refusal was demanding.",
      notes: [
        { slot: 1, why: "standard unquoted reads as a column reference — no such column; the literal needs quotes." },
        { slot: 1, why: "DEFAULT NULL is exactly what the engine refused — NOT NULL means the gap can never read NULL." },
      ],
    },
    {
      id: "l46-f4",
      prompt:
        "DROP COLUMN refuses columns that something depends on — the PK, an index, a view, a trigger. Introspect which suppliers column the pragma flags as the key.",
      template: "SELECT name\nFROM pragma_table_info('suppliers')\nWHERE {1} = 1;",
      chips: ["pk", '"notnull"', "cid", "dflt_value"],
      answers: ["pk"],
      why: "id answers — the rowid alias is the one column DROP COLUMN would refuse. rating drops cleanly because nothing points at it: no index, no view, no trigger. Dependents, not importance, decide.",
      notes: [
        { slot: 1, why: "Three of the four columns are NOT NULL — being required doesn't protect a column from DROP; being depended on does." },
      ],
    },
    {
      id: "l46-f5",
      prompt:
        "The before/after habit: inventory every storefront object the catalog owns, excluding SQLite's internal bookkeeping rows, sorted by object type then name.",
      template: "SELECT type, name\nFROM sqlite_master\nWHERE name {1} 'sqlite_%'\nORDER BY {2}, name;",
      chips: ["NOT LIKE", "LIKE", "!=", "type", "name", "rowid"],
      answers: ["NOT LIKE", "type"],
      why: "Every storefront object answers, internals excluded — the five base tables today, plus any view or index row past or future. After this module's migrations land, the same read shows those new rows too; the catalog is the change log you can query.",
      notes: [
        { slot: 1, why: "LIKE keeps only the sqlite_% internals — you want the complement: NOT LIKE." },
        { slot: 2, why: "rowid isn't a catalog column — the inventory sorts by type, the column the brief asked to group kinds by." },
      ],
    },
  ],

  // Lesson 47 — Views: saved queries (drilled read-side: the lens as SQL,
  // pushdown composition, catalog listing — no CREATE VIEW in completed SQL).
  47: [
    {
      id: "l47-f1",
      prompt:
        "Inheriting an unfamiliar schema, you check for convenience layers first: list each saved query's name and definition text from the catalog.",
      template: "SELECT {1}, sql\nFROM sqlite_master\nWHERE type = {2};",
      chips: ["name", "sql", "tbl_name", "'view'", "'table'", "'trigger'"],
      answers: ["name", "'view'"],
      why: "sqlite_master's type column separates views from tables and indexes, and each view row's sql column holds the definition the engine re-runs on every use. This is the read that lists a schema's lenses — including ones a sandboxed exercise created.",
      notes: [
        { slot: 2, why: "'table' answers a different question — the base tables; this brief asks for the saved queries." },
        { slot: 1, why: "sql without name skips the label — the view's name IS its API; callers build on what you call it." },
      ],
    },
    {
      id: "l47-f2",
      prompt:
        "The pending_orders view stores nothing but this query — write the definition un-named and count the shelf it would lens.",
      template: "SELECT COUNT(*) AS n\nFROM orders\nWHERE {1} = {2};",
      chips: ["status", "total", "customer_id", "'pending'", "'shipped'", "14"],
      answers: ["status", "'pending'"],
      why: "Nothing was copied at CREATE time — the view is this SELECT wearing a name, recomputed live: 14 orders waiting to ship, every time it's asked.",
      notes: [
        { slot: 2, why: "'shipped' is a different shelf — 30 orders; the brief's lens filters status = 'pending'." },
        { slot: 1, why: "total carries money, not the state machine — the filter column is status." },
      ],
    },
    {
      id: "l47-f3",
      prompt:
        "Prove the pushdown: when a caller filters the eu_customers lens by active accounts, this is the one merged query the engine actually runs — count it.",
      template: "SELECT COUNT(*) AS n\nFROM customers\nWHERE region = {1} AND {2} = 1;",
      chips: ["'EU'", "'APAC'", "'US'", "active", "region", "city"],
      answers: ["'EU'", "active"],
      why: "Seven of the eight EU customers are active — the caller's WHERE composes with the lens's own region filter into one scan over customers. Views are relations, not walls.",
      notes: [
        { slot: 1, why: "'APAC' is a real lens worth having — five customers — but eu_customers is the EU one." },
        { slot: 2, why: "region is the filter the lens already carries; the caller's chip here is active = 1." },
      ],
    },
    {
      id: "l47-f4",
      prompt:
        "Fix the broken query: the dashboard dies with `no such table: pending_orders` — the view's CREATE ran in a sandboxed session and rolled back, so the lens isn't in this schema. The 14 orders still live in the base table; fix the read.",
      template: "SELECT COUNT(*) AS n\nFROM {1}\nWHERE status = 'pending';",
      chips: ["orders", "pending_orders", "customers", "order_items", "sqlite_master"],
      answers: ["orders"],
      why: "A view is a lens, not storage — with the lens absent, the same fourteen rows come from orders plus its WHERE. Re-create the view and the count is identical; the data never depended on the name.",
      notes: [
        { slot: 1, why: "pending_orders is exactly the name that failed — no object by that name exists in this schema until a CREATE VIEW lands in this session." },
        { slot: 1, why: "order_items are the line rows — status is an orders column; the lines don't carry it." },
      ],
    },
    {
      id: "l47-f5",
      prompt:
        "Views stack by inlining — a named lens is just this derived table plus a name. Filter the inlined category-revenue aggregate down to the Audio shelf.",
      template:
        "SELECT category, revenue\nFROM (\n  SELECT p.category AS category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.category\n)\nWHERE {1} = 'Audio';",
      chips: ["category", "revenue", "product", "p.category", "'Audio'"],
      answers: ["category"],
      why: "The outer WHERE rides through the inlined definition and lands on its own column: Audio's revenue, 11744.01 — the same answer a named category_revenue lens would give, because that's all a view is.",
      notes: [
        { slot: 1, why: "p.category is out of scope out here — the derived table exposes plain category, alias included in its own select list." },
        { slot: 1, why: "WHERE revenue = 'Audio' compares money to a shelf name — the filter column is category." },
      ],
    },
  ],

  // Lesson 48 — Indexes & EXPLAIN QUERY PLAN (drilled read-side: EQP reads
  // and catalog censuses — CREATE INDEX stays in prompts/distractors).
  48: [
    {
      id: "l48-f1",
      prompt:
        "Ask the engine how it runs the storefront's hottest filter — every order belonging to customer 1. Prefix the read so the plan, not the rows, comes back.",
      template: "EXPLAIN {1}\nSELECT * FROM orders WHERE {2} = 1;",
      chips: ["QUERY PLAN", "ANALYZE", "PLAN", "customer_id", "id", "status"],
      answers: ["QUERY PLAN", "customer_id"],
      why: "One plan row answers: SCAN orders — every row read, tested, mostly discarded. The fresh schema carries no index on customer_id, so a sweep is the only path the planner has.",
      notes: [
        { slot: 1, why: "EXPLAIN ANALYZE actually runs the query and measures it — this course reads the plan without executing: EXPLAIN QUERY PLAN." },
        { slot: 2, why: "id is the rowid — that lookup already descends the table's own b-tree. The dashboard's hot filter is customer_id, and it's the one that scans." },
      ],
    },
    {
      id: "l48-f2",
      prompt:
        "One customers lookup needs no CREATE INDEX at all. Ask for the plan of fetching customer 7 by its identity and read the descent.",
      template: "EXPLAIN QUERY PLAN\nSELECT * FROM customers WHERE {1} = 7;",
      chips: ["id", "email", "name", "city", "region"],
      answers: ["id"],
      why: "SEARCH customers USING INTEGER PRIMARY KEY (rowid=?) — the INTEGER PRIMARY KEY IS the rowid, so the table itself is organized as the lookup. Every other customers column would read SCAN in this seed.",
      notes: [
        { slot: 1, why: "email tempts because the lesson indexes it — but that UNIQUE INDEX lives in a sandboxed exercise; the fresh schema has no explicit indexes, so email would sweep." },
      ],
    },
    {
      id: "l48-f3",
      prompt:
        "Fix the broken query: a teammate prefixed the status report with bare EXPLAIN and got a wall of low-level bytecode — addr, opcode, p1… — instead of a readable plan. Fix the prefix so the engine prints the human plan tree.",
      template: "EXPLAIN {1}\nSELECT * FROM orders WHERE status = 'shipped';",
      chips: ["QUERY PLAN", "ANALYZE", "PLAN", "VERBOSE", "FORMAT JSON"],
      answers: ["QUERY PLAN"],
      why: "EXPLAIN alone dumps the virtual-machine program; EXPLAIN QUERY PLAN prints the planner's own account — here the single row SCAN orders, since status carries no index in the fresh schema.",
      notes: [
        { slot: 1, why: "ANALYZE executes the query for real timings — a different tool, and not what the report wanted." },
        { slot: 1, why: "EXPLAIN PLAN isn't SQLite's spelling — the middle word is QUERY, then PLAN." },
      ],
    },
    {
      id: "l48-f4",
      prompt:
        "Pre-flight the hot table: count the explicit indexes registered on orders in the catalog — the number you'll be raising when you build one.",
      template: "SELECT COUNT(*) AS n\nFROM sqlite_master\nWHERE type = {1} AND tbl_name = 'orders';",
      chips: ["'index'", "'table'", "'view'", "'trigger'", "'orders'"],
      answers: ["'index'"],
      why: "Zero — orders carries no explicit index in the fresh schema; the only descent available is the rowid PK. Counting what exists before paying for what doesn't is the index-budget habit.",
      notes: [
        { slot: 1, why: "'table' counts the table object itself — one; indexes are separate catalog rows, typed 'index'." },
      ],
    },
    {
      id: "l48-f5",
      prompt:
        "Read the join's plan: ask how the engine pairs every EU customer's orders, region filtered on the customers side.",
      template: "EXPLAIN QUERY PLAN\nSELECT o.id\nFROM {1} o\nJOIN customers c ON o.customer_id = c.id\nWHERE c.region = {2};",
      chips: ["orders", "customers", "order_items", "'EU'", "'APAC'", "'US'"],
      answers: ["orders", "'EU'"],
      why: "Two plan rows: SCAN o sweeps the 103 orders, then SEARCH c USING INTEGER PRIMARY KEY probes each order's customer by rowid. With no indexes beyond the PKs, the sweep is unavoidable — the probe is free.",
      notes: [
        { slot: 1, why: "FROM customers o JOIN … breaks the ON clause — o.customer_id doesn't exist on customers; orders is the driving table." },
        { slot: 2, why: "'APAC' changes the filter, not the plan shape — still a scan plus a PK probe; the brief's region is EU." },
      ],
    },
  ],

  // Lesson 49 — Recursive CTEs: generate & walk (WITH RECURSIVE is
  // SELECT-family — completed queries generate sequences and spines).
  49: [
    {
      id: "l49-f1",
      prompt:
        "Count to ten with the anchor-step-guard: seed the sequence, glue the arms for pure appending, and bound the step so it stops before 11.",
      template: "WITH RECURSIVE seq(n) AS (\n  SELECT 1\n  {1}\n  SELECT n + 1 FROM seq WHERE n {2} 10\n)\nSELECT COUNT(*) AS n, MAX(n) AS top FROM seq;",
      chips: ["UNION ALL", "UNION", "<", "<=", ">", "JOIN"],
      answers: ["UNION ALL", "<"],
      why: "The anchor seeds n = 1 exactly once; UNION ALL appends each batch raw while the guard n < 10 keeps stepping — ten rows, top 10. `<=` would let the step fire on 10 and emit an eleventh.",
      notes: [
        { slot: 2, why: "Off-by-one: the guard tests the CURRENT row, so n <= 10 produces 11 rows ending at 11. The bound must stop the NEXT value." },
        { slot: 1, why: "UNION is legal but pricier — plain UNION dedupes the accumulator every cycle, which a 1..n sequence never needs." },
      ],
    },
    {
      id: "l49-f2",
      prompt:
        "Powers of two up to 64: anchor at the identity power, double in the step, and guard so the last legal power is produced but never stepped past.",
      template: "WITH RECURSIVE t(n) AS (\n  SELECT {1}\n  UNION ALL\n  SELECT n * 2 FROM t WHERE n < {2}\n)\nSELECT COUNT(*) AS n, MAX(n) AS top FROM t;",
      chips: ["1", "2", "64", "128", "32", "0"],
      answers: ["1", "64"],
      why: "Anchor 1 = 2⁰; the doubling step runs while n < 64, so 64 is the last row produced — seven rows total: 1, 2, 4, 8, 16, 32, 64. Anchor seeds once, the guard decides when the queue empties.",
      notes: [
        { slot: 1, why: "Seeding 2 skips the first power — the sequence's identity is 1, and everything else follows from the step." },
        { slot: 2, why: "n < 128 lets 64 double — eight rows, one past the brief. The guard checks the CURRENT row has room to double." },
      ],
    },
    {
      id: "l49-f3",
      prompt:
        "Fix the broken spine: the intern seeded `'2024-12'` and bounded `m < 12` — the report started in February and died in December, twelve rows, no 2025 at all (the step rebuilds each label from m, so the seed's month never sticks). Fix the seed and the bound to cover the storefront's full history.",
      template: "WITH RECURSIVE months(m, label) AS (\n  SELECT 1, {1}\n  UNION ALL\n  SELECT m + 1, substr(printf('%04d-%02d', 2024 + (m) / 12, (m) % 12 + 1), 1, 7)\n  FROM months WHERE m < {2}\n)\nSELECT COUNT(*) AS n, MIN(label) AS first, MAX(label) AS last FROM months;",
      chips: ["'2024-01'", "'2024-12'", "'2023-12'", "12", "14", "24"],
      answers: ["'2024-01'", "14"],
      why: "Seed January 2024, run fourteen months: 2024-01 through 2025-02, fourteen buckets — the storefront's complete history. Twelve stops at December and loses the 2025 tail; the first row proves the seed.",
      notes: [
        { slot: 1, why: "'2023-12' shifts every label a month early — and since the step's printf math is m-driven, a wrong seed month is overwritten on the first cycle anyway." },
        { slot: 2, why: "24 runs the spine into 2026 — empty buckets aren't lies, but the brief asked for the storefront's history: fourteen months." },
      ],
    },
    {
      id: "l49-f4",
      prompt:
        "The zero-gap report: join the fourteen-month spine to orders so every bucket appears even when a month is empty, keyed on the month prefix of created_at.",
      template: "WITH RECURSIVE months(m, label) AS (\n  SELECT 1, '2024-01'\n  UNION ALL\n  SELECT m + 1, substr(printf('%04d-%02d', 2024 + (m) / 12, (m) % 12 + 1), 1, 7)\n  FROM months WHERE m < 14\n)\nSELECT label, COUNT(o.id) AS orders\nFROM months\n{1} JOIN orders o ON substr(o.created_at, 1, {2}) = label\nGROUP BY label;",
      chips: ["LEFT", "INNER", "7", "4", "10", "CROSS"],
      answers: ["LEFT", "7"],
      why: "LEFT from the spine keeps all fourteen buckets — an empty month would read 0 instead of vanishing — and the join key is the seven-character 'YYYY-MM' prefix of created_at. All fourteen months are filled today; the spelling is for the quarter that hasn't happened yet.",
      notes: [
        { slot: 1, why: "INNER keeps only months with orders — the same 14 rows today, silently wrong the first quiet month. The spine exists to be preserved." },
        { slot: 2, why: "Four characters joins on YEAR — every 2024 order matches every 2024 month and the counts explode. The month key is seven characters." },
      ],
    },
    {
      id: "l49-f5",
      prompt:
        "Walk a comma-separated export — the seed carries a trailing comma so the final token is peelable. Supply the step's guard: keep peeling while there's still a comma to peel.",
      template: "WITH RECURSIVE split(status, rest) AS (\n  SELECT '', 'delivered,shipped,pending,cancelled,'\n  UNION ALL\n  SELECT substr(rest, 1, INSTR(rest, ',') - 1),\n         substr(rest, INSTR(rest, ',') + 1)\n  FROM split WHERE {1}\n)\nSELECT COUNT(*) AS n FROM split WHERE status != '';",
      chips: ["rest LIKE '%,%'", "INSTR(rest, ',') = 0", "rest LIKE '%-%'", "status = ''", "rest = ''"],
      answers: ["rest LIKE '%,%'"],
      why: "The step peels the head before each comma; the guard runs while a comma remains. With the trailing comma in the seed, the last token 'cancelled' gets peeled too — four tokens in generation order: delivered, shipped, pending, cancelled.",
      notes: [
        { slot: 1, why: "INSTR(rest, ',') = 0 is inverted — it stops the moment there IS something to peel: zero tokens after the anchor." },
        { slot: 1, why: "status = '' matches only the anchor, whose status is the empty string — the walk peels exactly once and reports one token." },
      ],
    },
  ],

  // Lesson 51 — Capstone: building the reporting layer (synthesis: the
  // view's definition as SQL, the spine-driven worst-month audit, the
  // catalog inventory, the calendar filter's plan).
  51: [
    {
      id: "l51-f1",
      prompt:
        "The month_revenue view's definition, stand-alone: revenue as the money sum, the order count, bucketed by the strftime month key — one row per month.",
      template: "SELECT strftime('%Y-%m', created_at) AS month,\n       ROUND({1}(total), 2) AS revenue,\n       {2}(*) AS orders\nFROM orders\nGROUP BY {3};",
      chips: ["SUM", "COUNT", "AVG", "month", "created_at", "status"],
      answers: ["SUM", "COUNT", "month"],
      why: "Fourteen rows, 2024-01 through 2025-02: SUM(total) at order level (no join, so total can't fan out), COUNT(*) per bucket. This SELECT is the whole view — naming it just gives the query an address.",
      notes: [
        { slot: 1, why: "AVG(total) is a different KPI — the report sums revenue per month, it doesn't average it." },
        { slot: 3, why: "GROUP BY created_at buckets per timestamp instead of per month — the bucket key is the alias month." },
      ],
    },
    {
      id: "l51-f2",
      prompt:
        "Name the worst month on record: drive the fourteen-month spine, keep every bucket with the lens-preserving join, and surface the single quietest month.",
      template: "WITH RECURSIVE months(m, label) AS (\n  SELECT 1, '2024-01'\n  UNION ALL\n  SELECT m + 1, substr(printf('%04d-%02d', 2024 + (m) / 12, (m) % 12 + 1), 1, 7)\n  FROM months WHERE m < 14\n)\nSELECT label AS month, ROUND(COALESCE(SUM(o.total), 0), 2) AS revenue\nFROM months\n{1} JOIN orders o ON substr(o.created_at, 1, 7) = label\nGROUP BY label\nORDER BY revenue {2}\n{3} 1;",
      chips: ["LEFT", "INNER", "ASC", "DESC", "LIMIT", "OFFSET"],
      answers: ["LEFT", "ASC", "LIMIT"],
      why: "The spine-driven LEFT JOIN keeps all fourteen buckets and COALESCE turns an empty month's NULL into 0; ascending plus LIMIT 1 names July 2024 — 1,193.86, the quietest month on record.",
      notes: [
        { slot: 2, why: "DESC crowns the best month — 2024-01's 3,731.97. Standup asked for the worst: ascending." },
        { slot: 3, why: "OFFSET skips rows; the brief wants the first row after the sort — LIMIT 1." },
        { slot: 1, why: "INNER drops an empty month instead of reporting its 0 — the spine's whole job is surviving quiet periods." },
      ],
    },
    {
      id: "l51-f3",
      prompt:
        "Fix the broken inventory: a teammate ran the catalog census as `WHERE type = 'view'` and read zero rows as a bug — but the fresh schema carries no views because every exercise's CREATE VIEW runs sandboxed. The honest pre-migration inventory counts what the storefront actually owns: its tables, internals excluded.",
      template: "SELECT COUNT(*) AS n\nFROM sqlite_master\nWHERE type = {1} AND name {2} 'sqlite_%';",
      chips: ["'table'", "'view'", "'index'", "NOT LIKE", "LIKE", "!="],
      answers: ["'table'", "NOT LIKE"],
      why: "Five base tables, sqlite_% internals excluded — the schema you stand on before any migration lands. After the reporting layer is built, the same read (minus the type filter) shows the view, targets table and index rows too.",
      notes: [
        { slot: 1, why: "'view' is the filter that started the confusion — zero views is the pre-migration truth, not a failure." },
        { slot: 2, why: "LIKE keeps only the internal sqlite_% bookkeeping rows — the storefront's own objects are the complement." },
      ],
    },
    {
      id: "l51-f4",
      prompt:
        "The dashboard's calendar filter, planned: ask the engine how it runs the read that fetches every 2024-dated order, so you know exactly what the exercise's idx_orders_created will buy.",
      template: "EXPLAIN QUERY PLAN\nSELECT *\nFROM orders\nWHERE {1} LIKE {2};",
      chips: ["created_at", "customer_id", "status", "'2024-%'", "%2024%", "'2024'"],
      answers: ["created_at", "'2024-%'"],
      why: "The plan reads SCAN orders — today's 90 of 103 rows are 2024-dated and a sweep is fine, but the index exercise is the purchase order for a SEARCH when the table is millions of rows. Read the plan before and after; that loop is the lesson.",
      notes: [
        { slot: 2, why: "%2024% unquoted is a column reference — no such column; and a leading-% pattern could never use a sorted index anyway." },
        { slot: 1, why: "customer_id is a different dashboard's filter — the calendar one filters created_at." },
      ],
    },
    {
      id: "l51-f5",
      prompt:
        "Sanity-check the reporting grain: count the distinct month keys the storefront's history actually spans — the bucket count every spine and the month_revenue view must agree on.",
      template: "SELECT COUNT(DISTINCT {1}) AS months\nFROM orders;",
      chips: ["strftime('%Y-%m', created_at)", "strftime('%Y', created_at)", "substr(created_at, 1, 4)", "status", "customer_id"],
      answers: ["strftime('%Y-%m', created_at)"],
      why: "Fourteen distinct month labels — 2024-01 through 2025-02 — exactly the fourteen rows the spine generates and month_revenue reports. One definition of 'month', everywhere.",
      notes: [
        { slot: 1, why: "strftime('%Y', created_at) buckets by year — two; the report's grain is the month." },
        { slot: 1, why: "customer_id counts customers, not months — the census is over the calendar key." },
      ],
    },
  ],
};
