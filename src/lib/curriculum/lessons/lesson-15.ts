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
  ],
  takeaway: "Join first, collapse second: GROUP BY the primary key and display the name, filter groups with HAVING — and after any LEFT JOIN count the right side's id, because COUNT(*) turns every true zero into one.",
};
