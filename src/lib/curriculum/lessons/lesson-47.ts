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
    {
      id: "l47-q6",
      prompt: "`INSERT INTO pending_orders (id, customer_id, total) VALUES (200, 3, 50)` — what does SQLite do?",
      choices: [
        "Inserts into orders through the view",
        "Refuses it — views are read-only names for queries; only INSTEAD OF triggers can make one writable",
        "Inserts into pending_orders itself — views hold rows",
        "Creates a pending_orders table automatically",
      ],
      answer: 1,
      why: "A view has no storage to receive a row — it's a saved SELECT, and SQLite refuses INSERT/UPDATE/DELETE against it outright. PostgreSQL can auto-forward simple views and SQLite can be taught with INSTEAD OF triggers, but a plain view is a lens, not a table.",
      notes: [
        { choice: 0, why: "Forwarding would need the engine to guess the mapping — SQLite keeps views strictly read-only rather than guess. Writes go to the base table, which then shows through the lens." },
      ],
    },
    {
      id: "l47-q7",
      prompt: "`DROP VIEW pending_orders` runs. What's left behind?",
      choices: [
        "The 14 pending orders — untouched, only the saved name is gone",
        "Nothing — the orders were deleted with the view",
        "An empty pending_orders table",
        "The view minus its WHERE clause",
      ],
      answer: 0,
      why: "DROP VIEW removes the definition from sqlite_master and nothing else — the base tables never notice. The 14 pending orders remain exactly where they were; re-CREATE the view later and they're all visible again through the fresh lens.",
      notes: [
        { choice: 1, why: "Views hold no rows — there's nothing to delete. That's also why dropping one is instant and reversible, unlike dropping a table." },
      ],
    },
    {
      id: "l47-q8",
      prompt: "`CREATE VIEW top_products AS SELECT p.name AS product, SUM(oi.quantity) AS units …` — a SELECT from top_products shows which column names?",
      choices: [
        "name and the aggregate's default name",
        "product and units — the definition's aliases become the view's columns",
        "top_products's own columns, defined separately",
        "Whatever the caller aliases them to",
      ],
      answer: 1,
      why: "The view's column list IS the definition's output list, aliases included. That's the contract callers code against — name them deliberately, because renaming the alias later is a breaking change for every consumer of the view.",
      notes: [
        { choice: 3, why: "Callers can re-alias OUTWARD (SELECT units AS sold FROM top_products), but the view's own column names are fixed by its definition, not per-query." },
      ],
    },
    {
      id: "l47-q9",
      prompt: "The eu_customers view filters `region = 'EU'`. A caller runs `SELECT * FROM eu_customers WHERE city = 'Berlin'`. Which filters actually apply?",
      choices: [
        "Only city — the view's WHERE is baked in and separate",
        "Both — the caller's WHERE composes with the definition's, one combined query at execution time",
        "Only region — caller filters on views are ignored",
        "Neither — views ignore WHERE entirely",
      ],
      answer: 1,
      why: "Querying a view means running its definition with your extra conditions folded in — the engine merges the two WHEREs into one plan over the base table. Filters push through the lens; that composability is exactly why views stay fast and useful as layers.",
      notes: [
        { choice: 0, why: "Separate execution would mean computing all 8 EU customers then filtering — even engines that did it that way would produce the same ANSWER, just wastefully. The merge makes it one scan." },
      ],
    },
    {
      id: "l47-q10",
      prompt: "big_categories is defined FROM category_revenue (itself a view). At execution time, what does SQLite actually run?",
      choices: [
        "A special nested-view operator",
        "The inlined stack — big_categories's definition with category_revenue's definition expanded inside it, down to the base tables",
        "category_revenue only; big_categories's extra filters wait",
        "Two separate queries whose results are joined in the app",
      ],
      answer: 1,
      why: "Views stack by inlining: each reference to a view is textually replaced by its definition, recursively, until the engine holds one query over real tables. There's no runtime 'view machinery' — just a deeper derived table than you typed.",
      notes: [
        { choice: 2, why: "Nothing waits — the whole stack resolves in one planning pass. (The sandbox caveat from problem 3 is different: it's about objects EXISTING, not about how they execute.)" },
      ],
    },
    {
      id: "l47-q11",
      prompt: "`DROP TABLE orders` runs while the pending_orders view still exists. What is the state?",
      choices: [
        "The view is dropped too — dependents cascade",
        "The view's row survives in sqlite_master, but every query against it now fails — a dangling lens",
        "SQLite recreates an empty orders table to satisfy the view",
        "The drop is refused while any view exists",
      ],
      answer: 1,
      why: "SQLite doesn't track dependents on the drop path: the view's definition survives with a reference to a table that's gone, and the failure surfaces at query time ('no such table: orders'). Schema hygiene tools actually search sqlite_master for exactly this dangling state.",
      notes: [
        { choice: 0, why: "Cascading drops exist in other engines' dialects — SQLite refuses to guess how far destruction should travel. You drop dependents first, deliberately." },
      ],
    },
    {
      id: "l47-q12",
      prompt: "Why can't you `CREATE VIEW orders AS SELECT …` — the exact name of an existing table?",
      choices: [
        "Views must end in _view",
        "Views and tables share one namespace in sqlite_master — the name is taken",
        "You can, as long as the query differs",
        "SQLite allows it and the view shadows the table",
      ],
      answer: 1,
      why: "One catalog, one namespace: sqlite_master records tables, views, indexes and triggers by name, and names must be unique per schema. `orders` is taken the moment the table exists — which is also why DROP TABLE orders can never accidentally eat a view.",
      notes: [
        { choice: 3, why: "Shadowing would make every existing query silently change meaning — the most dangerous feature imaginable. Names resolve to exactly one object, always." },
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
        { test: "insert into pending_orders", message: "Views are read-only names for queries — SQLite refuses INSERT INTO a view outright (only INSTEAD OF triggers can make one writable, which is other-lesson territory). The task is CREATE the view, then the verify SELECT reads it." },
        { test: "status = 'shipped'|status = 'cancelled'", message: "Wrong status — the brief names the pending shelf: 14 orders waiting to ship." },
      ],
      mutating: true,
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
      mutating: true,
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
      mutating: true,
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
      mutating: true,
      expected: EXPECTED["l47-p4"],
    },
    {
      id: "l47-p5",
      title: "The active-customers lens",
      brief: "Most dashboards only ever want live accounts. Create **active_customers**: `id`, `name`, `city` from customers where `active = 1`. The verify counts rows through the view — expect 14.",
      hints: [
        "A view is CREATE VIEW name AS SELECT … — bake the active = 1 filter into the definition.",
        "Shape: CREATE VIEW active_customers AS SELECT id, name, city FROM customers WHERE active = 1; then SELECT COUNT(*) AS n FROM active_customers;",
      ],
      difficulty: "easy",
      solution: "CREATE VIEW active_customers AS\nSELECT id, name, city\nFROM customers\nWHERE active = 1;",
      verify: "SELECT COUNT(*) AS n FROM active_customers;",
      mistakes: [
        { test: "active\\s*=\\s*0", message: "Inverted flag — the lens shows LIVE accounts (14). active = 0 would be the two dormant accounts, a very different dashboard." },
        { test: "insert\\s+into\\s+active_customers", message: "Views are read-only — SQLite refuses INSERT INTO a view. The dashboard reads the lens; writes go to customers." },
        { test: "materialized", message: "SQLite has no materialized views — a plain CREATE VIEW recomputes per use, which is what keeps the 14 always-current." },
      ],
      mutating: true,
      expected: EXPECTED["l47-p5"],
    },
    {
      id: "l47-p6",
      title: "The budget shelf",
      brief: "Merchandising tracks the under-20 aisle. Create **budget_catalog**: `name`, `price` from products where `price < 20`. The verify counts rows through the view — two products answer.",
      hints: [
        "Same shape as every view: the filter lives in the definition so every caller inherits it.",
        "Shape: CREATE VIEW budget_catalog AS SELECT name, price FROM products WHERE price < 20; then SELECT COUNT(*) AS n FROM budget_catalog;",
      ],
      difficulty: "easy",
      solution: "CREATE VIEW budget_catalog AS\nSELECT name, price\nFROM products\nWHERE price < 20;",
      verify: "SELECT COUNT(*) AS n FROM budget_catalog;",
      mistakes: [
        { test: "price\\s*<=\\s*20", message: "Boundary drift — the aisle is UNDER 20, strictly. At <= 20 a 20.00 product would sneak into the budget shelf." },
        { test: "category\\s*=\\s*'accessories'", message: "The criterion is price, not category — the two budget products sit in different aisles already. Don't add filters the brief didn't ask for." },
        { test: "select\\s+\\*", message: "The view's shape is its contract — name and price only. SELECT * would drag stock and supplier into every future consumer's result." },
      ],
      mutating: true,
      expected: EXPECTED["l47-p6"],
    },
    {
      id: "l47-p7",
      title: "Order counts, saved once",
      brief: "The per-customer order count has been rewritten all quarter. Save it: **customer_order_counts** with `c.name AS customer` and `COUNT(o.id) AS orders`, customers LEFT JOIN orders so inactive accounts still appear, grouped by customer. The verify counts its rows — all 16.",
      hints: [
        "LEFT JOIN from customers keeps zero-order customers on the list; GROUP BY c.id collapses each customer to one row.",
        "Shape: CREATE VIEW customer_order_counts AS SELECT c.name AS customer, COUNT(o.id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id; then SELECT COUNT(*) AS n FROM customer_order_counts;",
      ],
      difficulty: "medium",
      solution: "CREATE VIEW customer_order_counts AS\nSELECT c.name AS customer,\n       COUNT(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id;",
      verify: "SELECT COUNT(*) AS n FROM customer_order_counts;",
      mistakes: [
        { test: "(?<!left\\s)join\\s+orders", message: "An inner join (plain JOIN counts) drops any customer with zero orders — the view must list all 16, so customers is the LEFT side and orders the preserved-against side." },
        { test: "count\\s*\\(\\s*\\*\\s*\\)", message: "COUNT(*) counts the join's rows — a zero-order customer would show 1 (the ghost row). COUNT(o.id) counts real matches and reads 0 for them." },
        { test: "group\\s+by\\s+c\\.name", message: "Group by the id, not the name — two customers named alike would merge their histories. Ids are the identity; names are display." },
      ],
      mutating: true,
      expected: EXPECTED["l47-p7"],
    },
    {
      id: "l47-p8",
      title: "The pushdown, proved on the seed",
      brief: "Prove what the eu_customers lens + a caller filter computes: count customers where `region = 'EU'` **and** `active = 1` as `n` — the merged query the engine actually runs when a caller asks the view for active EU accounts. Seven answers.",
      hints: [
        "One SELECT, two conditions in one WHERE — the same single scan the pushdown produces.",
        "Shape: SELECT COUNT(*) AS n FROM customers WHERE region = 'EU' AND active = 1;",
      ],
      difficulty: "medium",
      solution: "SELECT COUNT(*) AS n\nFROM customers\nWHERE region = 'EU' AND active = 1;",
      mistakes: [
        { test: "region\\s*=\\s*'(apac|us|latam)'", message: "Wrong lens — eu_customers is the EU view; the merged filter keeps region = 'EU' and adds active = 1, landing on 7 of the 8." },
        { test: "\\bor\\b", message: "OR would widen to almost everyone — the caller's filter NARROWS the lens: EU AND active. Conjunction, not union." },
        { test: "from\\s+customers\\s+where\\s+active\\s*=\\s*1\\s*;", message: "Half the filter — without region = 'EU' the count is 14 active storewide, not the 7 the lens-plus-filter computes." },
      ],
      expected: EXPECTED["l47-p8"],
    },
  ],
  takeaway: "A view is a named query the engine re-runs per use — filters compose through it, views stack by inlining, changing it is DROP + CREATE, and its convenience is vertical: one definition, many readers, zero free speed.",
};
