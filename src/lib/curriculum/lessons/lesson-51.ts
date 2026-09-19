import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson51: Lesson = {
  id: "lesson-51",
  num: 51,
  title: "Case study — building the reporting layer",
  blurb: "Module 8's toolkit under one brief: save the month report as a view, audit the quietest month off a recursive spine, stage a targets table with teeth, index the calendar filter — then inventory everything the schema gained",
  minutes: 15,
  blocks: [
    {
      kind: "p",
      text: "Monday standup, and the analytics requests land in a batch: *the monthly revenue report keeps getting rewritten from scratch*, nobody can name the worst month on record, the planning team wants a **targets** table they can upsert into next sprint, and the dashboard's month filter is slow. Five tasks, one theme — everything you built in this module is schema work, and every statement runs sandboxed: the view, the table, the index all vanish on rollback, but the grader sees them exactly as production would.",
    },
    {
      kind: "table",
      headers: ["The request", "The verb"],
      rows: [
        ["Save the monthly report as month_revenue", "CREATE VIEW"],
        ["Name the worst month on record", "WITH RECURSIVE + LEFT JOIN"],
        ["Stage the planning table month_targets", "CREATE TABLE + constraints"],
        ["Speed up the calendar filter", "CREATE INDEX"],
        ["Inventory what the schema gained", "SELECT from sqlite_master"],
      ],
      caption: "One brief, the full reporting-layer toolkit — read the schema, extend it, prove it exists",
    },
    { kind: "diagram", figure: "d51-reporting-layer" },
    {
      kind: "tip",
      text: "The order here is the analytics-engineer's habit: build the VIEW first so every later task can reference one definition of 'monthly revenue'; audit with a READ before promising targets; add the INDEX for the filter you know the dashboard runs. In production each statement would live in a checked-in migration file — the sandbox's rollback is the rehearsal, the migration is the opening night.",
    },
  ],
  mcqs: [
    {
      id: "l51-q1",
      prompt: "Next month, three more orders land. What does `SELECT * FROM month_revenue` show afterward?",
      choices: [
        "The same 14 rows — views snapshot their result at creation",
        "A fresh 14th month updated, but old months frozen",
        "The new months appear with real numbers — the view re-runs its definition on every use",
        "An error — the view must be re-created to see new data",
      ],
      answer: 2,
      why: "A view stores the QUERY, not the rows. Every SELECT from month_revenue re-executes the stored definition against the current orders, so new orders show up in new (or existing) month buckets automatically. No refresh step exists because there's nothing stored to refresh.",
      notes: [
        { choice: 0, why: "That's a materialized view — PostgreSQL's trick, SQLite has no such object. Plain views recompute per query; nothing is snapshotted." },
        { choice: 3, why: "Re-creating is only needed when the DEFINITION changes — new columns, new filters. Data changes flow through on their own." },
      ],
    },
    {
      id: "l51-q2",
      prompt: "Why does the worst-month audit drive the JOIN from the recursive spine (`FROM months LEFT JOIN orders …`) instead of starting from orders?",
      choices: [
        "It's faster — recursive CTEs must be the first table",
        "Starting from orders would multiply revenue by the spine length",
        "The spine guarantees every month appears even with zero orders, so a future empty month shows 0 instead of vanishing",
        "SQLite requires LEFT JOINs to start from CTEs",
      ],
      answer: 2,
      why: "LEFT JOIN from the spine keeps all 14 rows no matter what the right side holds — the zero-gap guarantee that makes reports stable across quiet periods. Join from orders and the report's shape depends on which months happen to have data.",
      notes: [
        { choice: 1, why: "No multiplication here — each order matches at most one spine month, so the join can't fan out. The spine's job is completeness, not arithmetic." },
        { choice: 3, why: "SQLite has no such rule — CTEs join like any table. The direction is about which side must survive, a logic choice, not an engine mandate." },
      ],
    },
    {
      id: "l51-q3",
      prompt: "The planning team will `INSERT … ON CONFLICT DO UPDATE` into month_targets every sprint. Why does the PRIMARY KEY on `month` matter?",
      choices: [
        "It makes SELECTs against the table faster only",
        "It defines the collision target — the upsert's ON CONFLICT(month) fires because month is unique, guaranteeing one row per month",
        "PRIMARY KEYs are required on every table by SQLite",
        "It prevents the CHECK constraint from firing",
      ],
      answer: 1,
      why: "An upsert needs a uniqueness contract to collide against: month as PRIMARY KEY makes 'one row per month' structural, so the planning team's replay-safe writes have a defined DO UPDATE path. Lesson 44's fork only exists where a unique constraint lives.",
      notes: [
        { choice: 0, why: "A PK does create an index that can speed lookups — but the upsert question is about uniqueness, the constraint, not the performance side effect." },
        { choice: 2, why: "SQLite happily creates tables without a PK (every rowid table has an implicit rowid). The PK here is a design decision with an upsert payoff." },
      ],
    },
    {
      id: "l51-q4",
      prompt: "After building the view, the table and the index, what does `sqlite_master` hold for them?",
      choices: [
        "One row each, typed 'view', 'table' and 'index' — the catalog of every object the schema owns",
        "Nothing — sandbox objects are invisible to sqlite_master",
        "Only the table — views and indexes live in separate catalogs",
        "Three rows all typed 'table' — sqlite_master doesn't distinguish object kinds",
      ],
      answer: 0,
      why: "sqlite_master is the schema's inventory: every CREATE lands one row with its type — view, table or index — and its name. The closing audit task reads exactly those rows, which is also how tools like the Data Explorer and migration checkers enumerate a schema.",
      notes: [
        { choice: 1, why: "The sandbox rolls back the TRANSACTION, not the visibility — inside the run, sqlite_master sees the objects like anything else would. That's precisely what makes the verify queries work." },
        { choice: 2, why: "One catalog rules them all — sqlite_master lists tables, views, indexes and triggers together, distinguished by the type column." },
      ],
    },
  ],
  problems: [
    {
      id: "l51-p1",
      title: "The month report, named at last",
      brief: "Create **month_revenue**: per month (`strftime('%Y-%m', created_at)`), output `month`, `revenue` as `ROUND(SUM(total), 2)` and `orders` as `COUNT(*)`, one row per month, 14 in all. Verify that the view exists with `SELECT COUNT(*) AS n FROM month_revenue`.",
      hints: [
        "GROUP BY the strftime expression (its alias works in SQLite) — orders only, no join needed, so total can't fan out.",
        "Shape: CREATE VIEW month_revenue AS SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue, COUNT(*) AS orders FROM orders GROUP BY month;",
      ],
      difficulty: "medium",
      solution: "CREATE VIEW month_revenue AS\nSELECT strftime('%Y-%m', created_at) AS month,\n       ROUND(SUM(total), 2) AS revenue,\n       COUNT(*) AS orders\nFROM orders\nGROUP BY month;",
      verify: "SELECT COUNT(*) AS n FROM month_revenue;",
      mistakes: [
        { test: "join\\s+order_items", message: "No join — revenue per month reads orders.total directly. Pulling in order_items multiplies each order by its line count (the lesson-15 ghost) and inflates every month." },
        { test: "sum\\s*\\(\\s*quantity", message: "quantity × unit_price is line-item math; the month report is order-level: SUM(total) over orders. Different grain, different table." },
        { test: "materialized", message: "SQLite has no materialized views — a plain CREATE VIEW recomputes per use, which is exactly what the dashboard wants: always-current numbers." },
      ],
      mutating: true,
      expected: EXPECTED["l51-p1"],
    },
    {
      id: "l51-p2",
      title: "Name the worst month",
      brief: "Standup wants the exact number: drive the **14-month recursive spine** (seed `'2024-01'`, guard `m < 14`) with a LEFT JOIN to orders on the month prefix, and output the single quietest month — `month` and `revenue` as `ROUND(COALESCE(SUM(o.total), 0), 2)`, ordered ascending, `LIMIT 1`.",
      hints: [
        "Reuse lesson 49's spine exactly; aggregate with SUM over the joined orders and GROUP BY the spine label.",
        "Shape: WITH RECURSIVE months(m, label) AS (SELECT 1, '2024-01' UNION ALL SELECT m + 1, substr(printf('%04d-%02d', 2024 + (m) / 12, (m) % 12 + 1), 1, 7) FROM months WHERE m < 14) SELECT months.label AS month, ROUND(COALESCE(SUM(o.total), 0), 2) AS revenue FROM months LEFT JOIN orders o ON substr(o.created_at, 1, 7) = months.label GROUP BY months.label ORDER BY revenue ASC LIMIT 1;",
      ],
      difficulty: "hard",
      solution: "WITH RECURSIVE months(m, label) AS (\n  SELECT 1, '2024-01'\n  UNION ALL\n  SELECT m + 1,\n         substr(printf('%04d-%02d', 2024 + (m) / 12, (m) % 12 + 1), 1, 7)\n  FROM months WHERE m < 14\n)\nSELECT months.label AS month,\n       ROUND(COALESCE(SUM(o.total), 0), 2) AS revenue\nFROM months\nLEFT JOIN orders o ON substr(o.created_at, 1, 7) = months.label\nGROUP BY months.label\nORDER BY revenue ASC, months.label ASC\nLIMIT 1;",
      ordered: true,
      mistakes: [
        { test: "inner\\s+join|join\\s+orders(?!\\s+o)", message: "A plain inner join would still work today (all 14 months have orders) but the spine-driven LEFT JOIN is the contract — the day an empty month arrives, the report must show it, not lose it." },
        { test: "order\\s+by\\s+revenue\\s+desc", message: "Descending finds the BEST month (Audio-heavy 2024-01 at 3,731.97). Standup asked for the worst — ascending, and July 2024's 1,193.86 surfaces." },
        { test: "limit\\s+7|limit\\s+14\\s*;", message: "The brief wants ONE row — LIMIT 1 after the ascending sort. Listing all fourteen rows makes the analyst do the looking." },
      ],
      expected: EXPECTED["l51-p2"],
    },
    {
      id: "l51-p3",
      title: "The targets staging table",
      brief: "Planning needs **month_targets**: `month` TEXT **PRIMARY KEY**, `target` REAL **NOT NULL** with a **CHECK (target >= 0)**. Negative targets must be structurally impossible — the engine, not the intern, enforces it. Verify with `SELECT name FROM pragma_table_info('month_targets')`.",
      hints: [
        "Two columns, two promises: month is the upsert target (unique), target carries NOT NULL plus its CHECK.",
        "Shape: CREATE TABLE month_targets (month TEXT PRIMARY KEY, target REAL NOT NULL CHECK (target >= 0));",
      ],
      difficulty: "easy",
      solution: "CREATE TABLE month_targets (\n  month  TEXT PRIMARY KEY,\n  target REAL NOT NULL CHECK (target >= 0)\n);",
      verify: "SELECT name FROM pragma_table_info('month_targets');",
      mistakes: [
        { test: "target\\s+real\\s*,", message: "The target column lost its promises — without NOT NULL and CHECK, a NULL or -500 target lands silently. Constraints are the whole point of this task." },
        { test: "check\\s*\\(\\s*target\\s*>\\s*0\\s*\\)", message: "Boundary drift — the brief allows zero (a month can legitimately have no target): target >= 0. Strict > would reject the honest zero." },
        { test: "month\\s+integer", message: "The key holds month LABELS like '2024-01' — text, not numbers. TEXT PRIMARY KEY matches the spine's output and the view's month column." },
      ],
      mutating: true,
      expected: EXPECTED["l51-p3"],
    },
    {
      id: "l51-p4",
      title: "Index the calendar filter",
      brief: "The dashboard always filters by month: create **idx_orders_created** on **orders(created_at)** so `WHERE created_at LIKE '2024-%'`-style filters and the month buckets stop scanning. Verify the index is registered in sqlite_master.",
      hints: [
        "One statement: CREATE INDEX name ON table(column); — the column is the one the filters use.",
        "Shape: CREATE INDEX idx_orders_created ON orders(created_at);",
      ],
      difficulty: "easy",
      solution: "CREATE INDEX idx_orders_created ON orders(created_at);",
      verify: "SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_orders_created';",
      mistakes: [
        { test: "unique\\s+index", message: "UNIQUE would cap one order per created_at value — same-second orders are perfectly legal. The brief wants lookup speed, not a constraint." },
        { test: "on\\s+month_revenue", message: "Indexes attach to TABLES — month_revenue is a view, and the sandbox resets between runs so it doesn't exist here anyway. Index the orders column the filters touch." },
        { test: "create\\s+table", message: "The dashboard needs a sorted lookup, not another table — CREATE INDEX builds the B-tree over orders.created_at in one statement." },
      ],
      mutating: true,
      expected: EXPECTED["l51-p4"],
    },
    {
      id: "l51-p5",
      title: "Inventory the schema you stand on",
      brief: "Close the ticket like a professional: list every object the **storefront schema** owns — `type` and `name` from **sqlite_master**, excluding SQLite's internal objects (`name NOT LIKE 'sqlite_%'`), ordered by type then name. Five rows: the five tables your six reading modules have lived in.",
      hints: [
        "sqlite_master carries one row per object with its type — exclude the sqlite_% internals and let ORDER BY type, name sort the inventory.",
        "Shape: SELECT type, name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name;",
      ],
      difficulty: "medium",
      solution: "SELECT type, name\nFROM sqlite_master\nWHERE name NOT LIKE 'sqlite_%'\nORDER BY type, name;",
      ordered: true,
      mistakes: [
        { test: "type\\s*=\\s*'view'|month_revenue|month_targets", message: "Those objects live in the other problems' runs — the sandbox resets between problems, so this inventory reads the STOREFRONT's own catalog: five tables, no views yet. (In production, after the migration, they'd be here.)" },
        { test: "name\\s*=\\s*'orders'", message: "That returns one row — the brief wants the full inventory. Drop the name filter and keep only the sqlite_% exclusion." },
        { test: "select\\s+\\*", message: "The catalog row is wide (sql definitions included) — the brief asks for exactly type and name, the two columns the audit checklist needs." },
      ],
      expected: EXPECTED["l51-p5"],
    },
  ],
  takeaway: "A reporting layer is built, not wished for: the view names the query once, the recursive spine keeps reports honest across empty months, constraints make bad staging rows impossible, the index buys the dashboard's filter — and sqlite_master is how you prove the layer exists.",
};
