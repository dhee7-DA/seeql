import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson47: Lesson = {
  id: "lesson-47",
  num: 47,
  title: "Views — saved queries",
  blurb: "CREATE VIEW names a query so joins and filters stop being retyped; WHERE pushes through it, views stack on views, and the materialization truth for all three engines",
  minutes: 11,
  blocks: [
    {
      kind: "p",
      text: "By now you've written the category-revenue join more than once, and you'll write it again next sprint. **CREATE VIEW** saves a SELECT under a name, and from then on the name *is* a queryable table — one that runs its defining query every time you touch it. Views are how a schema grows convenience layers: analysts query `category_revenue` without knowing the join, while the definition lives in exactly one place.",
    },
    { kind: "diagram", figure: "d3-view-lens" },
    { kind: "h", text: "A view stores the query — not the rows" },
    {
      kind: "code",
      caption: "Name a filter once, query it forever",
      sql: `CREATE VIEW pending_orders AS
SELECT id, customer_id, total
FROM orders
WHERE status = 'pending';

SELECT COUNT(*) AS n FROM pending_orders;   -- 14 — recomputed live`,
    },
    {
      kind: "bullets",
      items: [
        "Nothing is copied at CREATE time — `sqlite_master` stores the definition text. Every SELECT against the view **re-runs** that definition against today's data.",
        "That's the contract's upside and downside in one: views are always current (no stale cache), and they cost exactly what their query costs each time they're used.",
        "The view is a real relation to the engine: you can filter it, join it, aggregate it — `SELECT region … FROM active_customers WHERE region = 'EU'` composes like any table.",
      ],
    },
    { kind: "h", text: "Filters push through; views stack" },
    {
      kind: "code",
      caption: "An aggregate view — the join lives in exactly one place now",
      sql: `CREATE VIEW category_revenue AS
SELECT p.category AS category,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
GROUP BY p.category;

SELECT revenue FROM category_revenue WHERE category = 'Audio';   -- 11744.01`,
    },
    {
      kind: "bullets",
      items: [
        "Your outer `WHERE category = 'Audio'` is applied **through** the view — the engine composes both queries before optimizing, so the filter rides down into the scan instead of computing all seven categories and discarding six.",
        "Views can reference other views — a `big_categories` view on top of `category_revenue` is legal and common. Each layer is one more inlined SELECT; three layers is plenty before readability inverts.",
        "Changing a view has no ALTER in SQLite: `DROP VIEW name;` then `CREATE VIEW …` again (or `CREATE VIEW IF NOT EXISTS` in scripts that must be re-runnable).",
      ],
    },
    {
      kind: "warn",
      text: "A view hides complexity but never deletes it — selecting from `category_revenue` still executes its join and GROUP BY every time. Build views on views with intent, and when a 'view' starts being queried hot paths, that's lesson 48's cue to look at EXPLAIN and indexes.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres adds **materialized views**: `CREATE MATERIALIZED VIEW …` stores the rows and refreshes on demand (`REFRESH MATERIALIZED VIEW name`) — a cache with a refresh button, at the price of staleness.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL has ordinary views (same CREATE VIEW … AS spelling) but no materialized views — the common workaround is a summary table maintained by triggers or a scheduled refresh job.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite views are plain (non-materialized) like MySQL's — definition in sqlite_master, recomputed per use, `DROP VIEW` to retire. The probe made it live: a view created inside a transaction was queryable immediately and vanished on rollback.",
    },
    {
      kind: "tip",
      text: "Name views for what they MEAN, not what they JOIN: `pending_orders` beats `orders_v2_pending_2024`. The view is the schema's vocabulary — the next analyst will build on your names, so make them load-bearing.",
    },
  ],
  mcqs: [
    {
      id: "l47-q1",
      prompt: "You INSERT new orders, then SELECT from the `pending_orders` view. What does the view show?",
      choices: [
        "The count from when the view was created",
        "The live count — the view re-runs its defining query on every use",
        "An error — views need a refresh first",
        "Only the orders that existed at creation",
      ],
      answer: 1,
      why: "A view stores its definition, not a snapshot: every reference recomputes the query against current data. New pending orders appear on the very next SELECT — no refresh, no staleness.",
      notes: [
        { choice: 2, why: "That's materialized-view behavior (Postgres has it; SQLite and MySQL don't). Plain views have nothing to refresh — they're queries wearing a name." },
      ],
    },
    {
      id: "l47-q2",
      prompt: "`SELECT revenue FROM category_revenue WHERE category = 'Audio'` — how does the outer WHERE interact with the view?",
      choices: [
        "It computes all categories then discards the rest, always",
        "It composes with the view's query — the filter is applied through it by the optimizer",
        "Views ignore outer WHERE clauses",
        "It rewrites the view permanently",
      ],
      answer: 1,
      why: "The engine inlines the view's definition and optimizes the combined query — the category filter rides down into the join. Composition is the whole point: the view is a relation, not a wall.",
      notes: [
        { choice: 0, why: "Even a naive engine would only waste a few rows here — but SQLite genuinely composes before planning, and the mental model 'views compose like subqueries' is the portable one (lesson 27's derived tables, named)." },
      ],
    },
    {
      id: "l47-q3",
      prompt: "Can a view be defined over another view?",
      choices: [
        "No — views must select from base tables",
        "Yes — each view's definition inlines the ones it references",
        "Yes, but only one level deep",
        "Only with materialized views",
      ],
      answer: 1,
      why: "A view is just a named SELECT, and SELECTs can read any relation — including other views. Each layer inlines at query time; deep stacks get hard to debug, but nothing in the engine stops them.",
      notes: [
        { choice: 3, why: "Materialization is about storing rows, not about stacking. Plain views stack freely — the warning is about readability, not permission." },
      ],
    },
    {
      id: "l47-q4",
      prompt: "The `category_revenue` view's definition changes. What's SQLite's move?",
      choices: [
        "ALTER VIEW category_revenue AS …",
        "DROP VIEW category_revenue; then CREATE VIEW … again",
        "Views can never be changed",
        "UPDATE sqlite_master SET sql = …",
      ],
      answer: 1,
      why: "SQLite has no ALTER VIEW — retire and recreate: DROP VIEW, then CREATE VIEW with the new definition. (Postgres has CREATE OR REPLACE VIEW; hand-editing sqlite_master is not a supported path anywhere.)",
      notes: [
        { choice: 0, why: "ALTER VIEW exists in some engines for some changes — but not in SQLite. The DROP-and-CREATE pair is the portable, always-works spelling here." },
      ],
    },
    {
      id: "l47-q5",
      prompt: "Why does a view NOT make slow queries fast?",
      choices: [
        "Views have a query budget",
        "The view's full definition executes on every use — naming a query never reduces its cost",
        "Views only optimize joins",
        "It does — views are always cached",
      ],
      answer: 1,
      why: "A view is a name for a query, not a shortcut past it: the join, GROUP BY and filters run each time. Convenience is vertical (one definition, many readers) — speed comes from lesson 48's tools: indexes and reading the plan.",
      notes: [
        { choice: 3, why: "Only materialized views cache rows (and then they're stale until refreshed). SQLite's plain views compute from scratch — every single time." },
      ],
    },
  ],
  problems: [
    {
      id: "l47-p1",
      title: "Name the pending shelf",
      brief: "Create **pending_orders**: a view of `id`, `customer_id`, `total` from orders where status = **'pending'**. The verify query counts rows through the view — expect 14.",
      hints: [
        "CREATE VIEW name AS SELECT … — the AS introduces the definition.",
        "Shape: CREATE VIEW pending_orders AS SELECT id, customer_id, total FROM orders WHERE status = 'pending';",
      ],
      difficulty: "easy",
      solution: "CREATE VIEW pending_orders AS\nSELECT id, customer_id, total\nFROM orders\nWHERE status = 'pending';",
      verify: "SELECT COUNT(*) AS n FROM pending_orders;",
      mistakes: [
        { test: "materialized", message: "SQLite has no materialized views — a plain CREATE VIEW recomputes on every use, which is exactly what this task needs." },
        { test: "insert into pending_orders", message: "This lesson's views are read-only names for queries — first CREATE the view, then the verify SELECT reads it. (SQLite views over one table are technically insertable, but that's not this task.)" },
        { test: "status = 'shipped'|status = 'cancelled'", message: "Wrong status — the brief names the pending shelf: 14 orders waiting to ship." },
      ],
      expected: EXPECTED["l47-p1"],
    },
    {
      id: "l47-p2",
      title: "Category revenue, named at last",
      brief: "Create **category_revenue**: per product category, `ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue` — the join from order_items to products. The verify query asks for the **Audio** row: expect 11744.01.",
      hints: [
        "The definition is lesson 15's join-aggregate, verbatim, under a name; GROUP BY p.category.",
        "Shape: CREATE VIEW category_revenue AS SELECT p.category AS category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category;",
      ],
      difficulty: "medium",
      solution: "CREATE VIEW category_revenue AS\nSELECT p.category AS category,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category;",
      verify: "SELECT revenue FROM category_revenue WHERE category = 'Audio';",
      mistakes: [
        { test: "sum \\( o\\.total \\)|sum \\( orders\\.total \\)", message: "That's the fanout sum — joining orders to order_items multiplies each order's total by its line count (lesson 15's ghost row). Revenue lives on the LINES: quantity * unit_price." },
        { test: "group by oi\\.product_id|group by p\\.id", message: "Grouping by id yields one row per PRODUCT (16 rows) — the view is per CATEGORY: GROUP BY p.category, 7 rows." },
        { test: "\\bcount\\(", message: "Revenue is a money sum, not a row count — SUM over quantity * unit_price, rounded to 2." },
      ],
      expected: EXPECTED["l47-p2"],
    },
    {
      id: "l47-p3",
      title: "The big-shelf view",
      brief: "Create **big_categories**: categories whose revenue exceeds **3000** — built as its own aggregate view (same join as the last task, with a `HAVING` on the rounded revenue), so it stands alone in the sandbox. Verify expects 5 rows.",
      hints: [
        "Aggregate then filter groups: the view's own GROUP BY plus HAVING ROUND(SUM(oi.quantity * oi.unit_price), 2) > 3000.",
        "Shape: CREATE VIEW big_categories AS SELECT p.category AS category, ROUND(SUM(…), 2) AS revenue FROM order_items oi JOIN products p ON … GROUP BY p.category HAVING revenue > 3000;",
      ],
      difficulty: "medium",
      solution: "CREATE VIEW big_categories AS\nSELECT p.category AS category,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nHAVING revenue > 3000;",
      verify: "SELECT COUNT(*) AS n FROM big_categories;",
      mistakes: [
        { test: "from category_revenue", message: "Standalone, please — the sandbox resets between runs, so a view referencing yesterday's view hits 'no such table'. Inline the aggregate into this view's own definition." },
        { test: "where revenue > 3000", message: "WHERE filters ROWS before grouping — the revenue figure only exists after the GROUP BY. Filtering groups is HAVING's job (lesson 8's gate, second story)." },
        { test: "> 5000|> 10000", message: "Threshold drift — above 3000 keeps the top five shelves (Audio, Wearables, Video, Electronics, Accessories); higher cutoffs start dropping real categories." },
      ],
      expected: EXPECTED["l47-p3"],
    },
    {
      id: "l47-p4",
      title: "A view you can filter through",
      brief: "Create **eu_customers**: `id`, `name`, `city`, `active` for region **'EU'** — no active filter baked in. Then the verify query applies its own: `WHERE active = 1` through the view — expect 7. The point: filters compose with views.",
      hints: [
        "The view carries only the region filter; the caller adds active = 1 on top.",
        "Shape: CREATE VIEW eu_customers AS SELECT id, name, city, active FROM customers WHERE region = 'EU';",
      ],
      difficulty: "hard",
      solution: "CREATE VIEW eu_customers AS\nSELECT id, name, city, active\nFROM customers\nWHERE region = 'EU';",
      verify: "SELECT COUNT(*) AS n FROM eu_customers WHERE active = 1;",
      mistakes: [
        { test: "and active = 1|where region = 'eu' and active", message: "Don't bake active = 1 into the view — the brief leaves it out so callers can choose. The verify query adds its own active filter through the view." },
        { test: "'(apac|us|latam)'", message: "Wrong region — the view is the EU lens: 8 customers, 7 of them active." },
        { test: "select \\* from customers", message: "SELECT * drags in email, region and created_at — the view's shape is part of its contract: four named columns, region filtered out." },
      ],
      expected: EXPECTED["l47-p4"],
    },
  ],
  takeaway: "A view is a named query the engine re-runs per use — filters compose through it, views stack by inlining, changing it is DROP + CREATE, and its convenience is vertical: one definition, many readers, zero free speed.",
};
