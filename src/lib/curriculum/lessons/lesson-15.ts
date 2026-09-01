import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson15: Lesson = {
  id: "lesson-15",
  num: 15,
  title: "Joins + aggregates",
  blurb: "GROUP BY across joined tables — and the COUNT trap that hides in every zero",
  minutes: 14,
  blocks: [
    {
      kind: "p",
      text: "Lesson 8 taught you GROUP BY on a single table. Real reporting almost always aggregates **joined** data: spend per customer (totals in `orders`, names in `customers`), revenue per category (amounts in `order_items`, categories in `products`). The recipe is unchanged — **join first, collapse second** — the only new skill is qualifying the group key and the measure.",
    },
    { kind: "h", text: "One quiet detail, loudly" },
    { kind: "diagram", figure: "j15-agg-pipeline" },
    {
      kind: "bullets",
      items: [
        "We `GROUP BY c.id` but display `c.name` — **group by the primary key**. Names can collide (two customers named \"John Smith\" would merge into one group); ids never do.",
        "SQLite is lenient and lets you group by the displayed name; PostgreSQL would demand the id. Write the portable version and your queries survive the day the data grows up.",
      ],
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL's ONLY_FULL_GROUP_BY mode (default since 5.7) rejects bare SELECT columns unrelated to the group key — but it recognizes functional dependence, so `GROUP BY c.id` keeps `c.name` legal because id is the primary key. Grouping by the label while displaying other customer columns is what gets rejected there.",
    },
    { kind: "diagram", figure: "j8-join-aggregate" },
    {
      kind: "code",
      caption: "Spend per customer — join, group, sum",
      sql: `SELECT c.name, ROUND(SUM(o.total), 2) AS spend
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
ORDER BY spend DESC;`,
    },
    { kind: "h", text: "The trap that makes senior engineers lean in" },
    {
      kind: "bullets",
      items: [
        "**`COUNT(*)` counts rows; `COUNT(column)` counts values.**",
        "After a LEFT JOIN, a customer with no orders still contributes a row — with NULL in every order column. `COUNT(*)` counts that ghost row and reports 1 order; `COUNT(o.id)` sees NULL and correctly reports 0.",
        "In this store every customer has ordered, so both return 103 — but the moment your data has a true zero, `COUNT(*)` starts lying by one per empty customer. Aggregate the right side's id, always.",
      ],
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "COUNT(column) skipping NULLs is standard SQL, not a SQLite quirk — PostgreSQL and MySQL behave identically, so the `COUNT(o.id)` habit travels to every engine. Aggregates ignoring NULLs is exactly what lets them report true zeros.",
    },
    {
      kind: "warn",
      text: "Remember lesson 12's rule before you aggregate a LEFT JOIN: right-table filters go in ON, not WHERE. A WHERE on a right column deletes the NULL-filled rows — and with them, all your zeros.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "PostgreSQL can hang a condition directly on an aggregate: `COUNT(o.id) FILTER (WHERE o.status = 'delivered')` — and SQLite 3.30+ supports FILTER too. MySQL doesn't, so spell it `COUNT(CASE WHEN o.status = 'delivered' THEN o.id END)` there.",
    },
  ],
  mcqs: [
    {
      id: "l15-q1",
      prompt: "Why GROUP BY c.id when the query displays c.name?",
      choices: [
        "SQLite forbids grouping by name",
        "Ids are unique — names can collide and silently merge two customers into one group",
        "Grouping by id is faster on every database",
        "It doesn't matter which one you use",
      ],
      answer: 1,
      why: "The id is the identity of the group. Two customers with identical names would collapse into one bucket if you grouped by name; grouping by the primary key keeps them apart.",
      notes: [
        { choice: 2, why: "Performance isn't the point — grouping by id is about identity: names can collide and silently merge two customers into one bucket." },
      ],
    },
    {
      id: "l15-q2",
      prompt: "After `customers LEFT JOIN orders`, what does COUNT(*) report for a customer with zero orders?",
      choices: ["0", "1", "NULL", "The query errors"],
      answer: 1,
      why: "The LEFT JOIN keeps the customer with one NULL-filled order row; COUNT(*) counts rows, so it says 1. COUNT(o.id) would see NULL and say 0.",
      notes: [
        { choice: 0, why: "Zero feels right, but the ghost row is real: the LEFT JOIN hands COUNT(*) one NULL-filled row for that customer, and COUNT(*) counts rows, not orders." },
      ],
    },
    {
      id: "l15-q3",
      prompt: "Which expression correctly counts each customer's orders — including customers with none?",
      choices: [
        "COUNT(*)",
        "COUNT(o.id)",
        "SUM(o.id)",
        "COUNT(DISTINCT c.id)",
      ],
      answer: 1,
      why: "COUNT(o.id) skips NULLs, so unmatched customers count 0. COUNT(*) counts the ghost row; SUM adds ids together; DISTINCT c.id is always 1 per group.",
      notes: [
        { choice: 0, why: "COUNT(*) counts the NULL-filled ghost row too, so the zero-order customer would show 1 — only a right-side column like o.id can see through the NULL." },
      ],
    },
    {
      id: "l15-q4",
      prompt: "In this store, customers LEFT JOIN orders grouped by customer: what do COUNT(*) and COUNT(o.id) report overall?",
      choices: [
        "103 vs 87 — five customers never ordered",
        "Both 103 — every customer has placed at least one order",
        "103 vs 0",
        "16 vs 103",
      ],
      answer: 1,
      why: "All 16 customers appear in orders, so no ghost rows exist and both counts land on 103. The trap is real but dormant here — it wakes up the first time a zero exists.",
      notes: [
        { choice: 0, why: "No one is missing in this seed — all 16 customers have placed orders, so no ghost rows exist and both counts land on the full 103." },
      ],
    },
    {
      id: "l15-q5",
      prompt: "`SELECT c.region, COUNT(*) FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.region` — how many rows?",
      choices: ["1", "4", "16", "103"],
      answer: 1,
      why: "GROUP BY makes one bucket per distinct region — this store has 4 (APAC, EU, LATAM, US). The 103 orders collapse into 4 group rows, each carrying its count.",
      notes: [
        { choice: 2, why: "16 would be one row per customer — that's GROUP BY c.id. The bucket count equals the DISTINCT values of the grouped column." },
      ],
    },
    {
      id: "l15-q6",
      prompt: "You want to exclude single orders under 500 BEFORE averaging per customer. Where does the filter go?",
      choices: [
        "HAVING o.total > 500 — that's what HAVING is for",
        "WHERE o.total > 500 — row filters come before grouping",
        "either — they are equivalent",
        "neither — you need a subquery",
      ],
      answer: 1,
      why: "o.total is a per-ORDER fact, and WHERE filters rows before groups form. HAVING exists for aggregate results (AVG(...), COUNT(*)) that only exist after grouping. Filtering raw rows with HAVING is a category error most engines reject outright.",
      notes: [
        { choice: 0, why: "HAVING evaluates after grouping against group-level values — o.total no longer exists there; only aggregates and grouped columns do." },
      ],
    },
    {
      id: "l15-q7",
      prompt: "Under `customers LEFT JOIN orders`, a customer with zero orders forms one NULL-filled group. What does SUM(o.total) show for that group?",
      choices: ["0 — sums of nothing are zero", "NULL — there was nothing to add", "the grand total — groups share the sum", "an error — SUM needs rows"],
      answer: 1,
      why: "SUM over a group whose only row has total = NULL is NULL, not 0 — the aggregate never sees a number. (COUNT(CASE…) tricks or COALESCE are the fixes; this seed happens to have no such customer, but the mechanism is worth knowing cold.)",
      notes: [
        { choice: 0, why: "NULL is 'unknown', not zero — and SUM refuses to guess. It returns NULL for an all-NULL group; only COUNT(*) counts the row itself." },
      ],
    },
    {
      id: "l15-q8",
      prompt: "Which spelling correctly reports revenue per customer REGION?",
      choices: [
        "SELECT c.region, SUM(o.total) FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region",
        "SELECT c.region, SUM(o.total) FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id",
        "SELECT c.region, SUM(o.total) FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY o.id",
        "SELECT region, SUM(total) FROM orders GROUP BY region",
      ],
      answer: 0,
      why: "The bucket key is the joined column c.region — group by it and sum the order totals inside each bucket. GROUP BY c.id would give per-customer rows (region repeated), GROUP BY o.id one row per order, and orders has no region column at all.",
      notes: [
        { choice: 1, why: "Grouping by the id while displaying the region reports one row per CUSTOMER — 16 rows, regions repeated — not the 4-row regional summary." },
      ],
    },
  ],
  problems: [
    {
      id: "l15-p1",
      title: "The spend leaderboard",
      brief: "Total spend per customer, biggest first. Output: `name`, `spend` (alias ROUND(SUM(o.total),2) exactly). Group by the customer's id — 16 groups.",
      hints: [
        "Join customers to their orders, make each customer a bucket with GROUP BY, and sum the totals inside each bucket.",
        "Shape: SELECT c.name, ROUND(SUM(o.total), 2) AS spend FROM customers c JOIN orders o ON … GROUP BY c.id ORDER BY spend DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.name, ROUND(SUM(o.total), 2) AS spend\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY spend DESC;",
      mistakes: [
        { test: "^(?=.*\\bsum\\s*\\()(?!.*\\bgroup\\s+by\\b).*$", message: "c.name is a bare column sitting next to SUM(o.total) — that pairing needs GROUP BY c.id so the engine knows which rows form each customer's bucket." },
        { test: "^(?!.*\\bcustomers\\b).*$", message: "The leaderboard needs customer *names* — join customers so each customer_id translates into a name, then GROUP BY c.id." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The brief wants biggest first — append ORDER BY spend DESC." },
      ],
      expected: EXPECTED["l15-p1"],
      ordered: true,
    },
    {
      id: "l15-p2",
      title: "Revenue by category",
      brief: "Line-item revenue — quantity × unit_price, summed — per product category. Output: `category`, `revenue` (alias exactly), ordered by revenue descending. The measures live in order_items; the labels in products.",
      hints: [
        "The amount lives in order_items, the label in products — join them, bucket per category, and sum quantity × unit_price.",
        "Shape: SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON … GROUP BY p.category ORDER BY revenue DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nORDER BY revenue DESC;",
      mistakes: [
        { test: "\\bo\\.total\\b", message: "orders.total is the order-level price, not the per-line amount the brief asks for — line-item revenue is built from order_items: SUM(oi.quantity * oi.unit_price)." },
        { test: "^(?=.*\\bsum\\s*\\()(?!.*\\bgroup\\s+by\\b).*$", message: "p.category is a bare column next to an aggregate — GROUP BY p.category makes each category its own bucket." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The brief wants revenue descending — append ORDER BY revenue DESC." },
      ],
      expected: EXPECTED["l15-p2"],
      ordered: true,
    },
    {
      id: "l15-p3",
      title: "The heavy users",
      brief: "Customers with **more than 10** orders. Output: `name`, `orders` (alias COUNT(o.id) exactly), ordered by orders descending. This is HAVING, not WHERE — the condition is about a group, not a row.",
      hints: [
        "Count each customer's orders inside their bucket, then filter the buckets — group-level tests happen in HAVING, after GROUP BY.",
        "Shape: SELECT c.name, COUNT(o.id) AS orders FROM customers c JOIN orders o ON … GROUP BY c.id HAVING COUNT(o.id) > <n> ORDER BY orders DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nHAVING COUNT(o.id) > 10\nORDER BY orders DESC;",
      mistakes: [
        { test: "(where|and)\\s+count\\s*\\(", message: "WHERE runs before groups exist, so it can't see COUNT — the > 10 test is a property of each group: put it in HAVING after GROUP BY c.id." },
        { test: "having\\s+count\\s*\\(\\s*o\\.id\\s*\\)\\s*>=\\s*10", message: "'More than 10' is strict — >= 10 would also keep customers with exactly 10 orders." },
        { test: "^(?=.*\\bcount\\s*\\()(?!.*\\bhaving\\b).*$", message: "Nothing is filtering the groups yet — the brief wants customers with MORE THAN 10 orders: GROUP BY c.id plus HAVING COUNT(o.id) > 10." },
      ],
      expected: EXPECTED["l15-p3"],
      ordered: true,
    },
    {
      id: "l15-p4",
      title: "The supplier scoreboard",
      brief: "Three hops now: which suppliers generate the most line-item revenue? Output: `name` (supplier), `revenue` (alias of ROUND(SUM(oi.quantity * oi.unit_price),2)), ordered by revenue descending. Chain order_items → products → suppliers, then group by the supplier.",
      hints: [
        "Chain the three hops (items → products → suppliers), make each supplier a bucket, and sum the line amounts inside it.",
        "Shape: SELECT s.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON … JOIN suppliers s ON … GROUP BY s.id ORDER BY revenue DESC;",
      ],
      difficulty: "hard",
      solution:
        "SELECT s.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi\nJOIN products p  ON p.id = oi.product_id\nJOIN suppliers s ON s.id = p.supplier_id\nGROUP BY s.id\nORDER BY revenue DESC;",
      mistakes: [
        { test: "^(?!.*\\bsuppliers\\b).*$", message: "The revenue has to land on suppliers — chain order_items → products (via product_id) → suppliers (via supplier_id) before you group." },
        { test: "^(?=.*\\bsum\\s*\\()(?!.*\\bgroup\\s+by\\b).*$", message: "s.name is bare next to the SUM — GROUP BY s.id gives each supplier its own bucket." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The brief wants revenue descending — append ORDER BY revenue DESC." },
      ],
      expected: EXPECTED["l15-p4"],
      ordered: true,
    },
    {
      id: "l15-p5",
      title: "Basket averages",
      brief: "Who runs the biggest baskets? Per customer, average the order totals: output `name`, `avg_order` (alias of ROUND(AVG(o.total), 2)), the top 5 by average, biggest first — ties by name.",
      hints: [
        "Same bucket-per-customer shape as the spend leaderboard, but the measure inside the bucket is AVG, not SUM — and ROUND keeps the leaderboard readable.",
        "Shape: SELECT c.name, ROUND(AVG(o.total), 2) AS avg_order FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY avg_order DESC, c.name LIMIT <n>;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.name, ROUND(AVG(o.total), 2) AS avg_order\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nORDER BY avg_order DESC, c.name\nLIMIT 5;",
      mistakes: [
        { test: "\\border\\s+by\\s+avg_order\\s+asc\\b", message: "\"Biggest first\" needs the DESC direction — a bare or ASC sort crowns the smallest basket." },
        { test: "^select\\b(?:(?!\\bround\\b).)*$", message: "The leaderboard grades avg_order to two decimals — wrap the average: ROUND(AVG(o.total), 2)." },
        { test: "^select\\b(?:(?!\\blimit\\b).)*$", message: "The brief caps the podium at five — append LIMIT 5." },
      ],
      expected: EXPECTED["l15-p5"],
      ordered: true,
    },
    {
      id: "l15-p6",
      title: "Price bands",
      brief: "Map each category's shelf: output `category`, `min_price`, `max_price` (aliases of the ROUNDed MIN/MAX of price), one row per category, alphabetical.",
      hints: [
        "No join needed — everything lives in products. One bucket per category, two aggregates inside: MIN and MAX.",
        "Shape: SELECT category, ROUND(MIN(price), 2) AS min_price, ROUND(MAX(price), 2) AS max_price FROM products GROUP BY category ORDER BY <col>;",
      ],
      difficulty: "medium",
      solution:
        "SELECT category, ROUND(MIN(price), 2) AS min_price, ROUND(MAX(price), 2) AS max_price\nFROM products\nGROUP BY category\nORDER BY category;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bmin\\s*\\().)*$", message: "The band has two ends — add the low end: ROUND(MIN(price), 2) AS min_price." },
        { test: "^select\\b(?:(?!\\bmax\\s*\\().)*$", message: "The band has two ends — add the high end: ROUND(MAX(price), 2) AS max_price." },
        { test: "^(?=.*\\bmin\\s*\\()(?!.*\\bgroup\\s+by\\b).*$", message: "MIN is an aggregate — it needs buckets: GROUP BY category makes one row per category." },
      ],
      expected: EXPECTED["l15-p6"],
      ordered: true,
    },
    {
      id: "l15-p7",
      title: "The premium bracket",
      brief: "Customers whose AVERAGE order tops 400 — quality over quantity. Output: `name`, `avg_order` (alias of ROUND(AVG(o.total), 2)), biggest average first. Six customers qualify.",
      hints: [
        "The filter applies to an aggregate (the average), so it lives in HAVING — WHERE can't see AVG at all.",
        "Shape: SELECT c.name, ROUND(AVG(o.total), 2) AS avg_order FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id HAVING AVG(o.total) > <threshold> ORDER BY avg_order DESC;",
      ],
      difficulty: "hard",
      solution:
        "SELECT c.name, ROUND(AVG(o.total), 2) AS avg_order\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nHAVING AVG(o.total) > 400\nORDER BY avg_order DESC;",
      mistakes: [
        { test: "\\bwhere\\b[^;]*avg\\s*\\(\\s*o\\.total", message: "Aggregates don't exist yet at WHERE time — the average filter belongs in HAVING, evaluated after the buckets form." },
        { test: "^(?=.*\\bavg\\s*\\()(?!.*\\bhaving\\b).*$", message: "Filtering ON the average is HAVING's whole job — add HAVING AVG(o.total) > 400 after GROUP BY." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The brief ranks by average — append ORDER BY avg_order DESC." },
      ],
      expected: EXPECTED["l15-p7"],
      ordered: true,
    },
    {
      id: "l15-p8",
      title: "Stock health by supplier",
      brief: "Which suppliers carry real weight? Per supplier with at least 3 products: output `name`, `products` (alias COUNT(*)), `total_stock` (alias SUM(p.stock)), `avg_price` (alias of ROUND(AVG(p.price), 2)) — ordered by total_stock descending, then name. Four suppliers qualify.",
      hints: [
        "Buckets per supplier (GROUP BY s.id), three aggregates inside, and the at-least-3 bar is a group filter — HAVING COUNT(*) >= 3.",
        "Shape: SELECT s.name, COUNT(*) AS products, SUM(p.stock) AS total_stock, ROUND(AVG(p.price), 2) AS avg_price FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id HAVING COUNT(*) >= <n> ORDER BY total_stock DESC, <col>;",
      ],
      difficulty: "hard",
      solution:
        "SELECT s.name, COUNT(*) AS products, SUM(p.stock) AS total_stock, ROUND(AVG(p.price), 2) AS avg_price\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nGROUP BY s.id\nHAVING COUNT(*) >= 3\nORDER BY total_stock DESC, s.name;",
      mistakes: [
        { test: "^(?=.*\\bcount\\s*\\(\\s*\\*\\s*\\))(?!.*\\bhaving\\b).*$", message: "The brief keeps only suppliers with 3+ products — that's a group-level filter: HAVING COUNT(*) >= 3." },
        { test: "^(?!.*\\bsuppliers\\b).*$", message: "The scoreboard lands on suppliers — join products to suppliers via p.supplier_id before grouping." },
        { test: "\\border\\s+by\\s+total_stock\\s+asc\\b", message: "\"Most weight first\" needs the DESC direction — a bare or ASC sort shows the lightest shelves on top." },
      ],
      expected: EXPECTED["l15-p8"],
      ordered: true,
    },
  ],
  takeaway: "Join first, collapse second: GROUP BY the primary key and display the name, filter groups with HAVING — and after any LEFT JOIN count the right side's id, because COUNT(*) turns every true zero into one.",
};
