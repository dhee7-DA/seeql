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
    {
      kind: "bullets",
      items: [
        "We `GROUP BY c.id` but display `c.name` — **group by the primary key**. Names can collide (two customers named \"John Smith\" would merge into one group); ids never do.",
        "SQLite is lenient and lets you group by the displayed name; PostgreSQL would demand the id. Write the portable version and your queries survive the day the data grows up.",
      ],
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
      kind: "warn",
      text: "Remember lesson 12's rule before you aggregate a LEFT JOIN: right-table filters go in ON, not WHERE. A WHERE on a right column deletes the NULL-filled rows — and with them, all your zeros.",
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
    },
    {
      id: "l15-q2",
      prompt: "After `customers LEFT JOIN orders`, what does COUNT(*) report for a customer with zero orders?",
      choices: ["0", "1", "NULL", "The query errors"],
      answer: 1,
      why: "The LEFT JOIN keeps the customer with one NULL-filled order row; COUNT(*) counts rows, so it says 1. COUNT(o.id) would see NULL and say 0.",
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
    },
  ],
  problems: [
    {
      id: "l15-p1",
      title: "The spend leaderboard",
      brief: "Total spend per customer, biggest first. Output: `name`, `spend` (alias ROUND(SUM(o.total),2) exactly). Group by the customer's id — 16 groups.",
      hint: "JOIN, GROUP BY c.id, ROUND(SUM(o.total), 2) AS spend, ORDER BY spend DESC.",
      difficulty: "medium",
      solution:
        "SELECT c.name, ROUND(SUM(o.total), 2) AS spend\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY spend DESC;",
      expected: EXPECTED["l15-p1"],
      ordered: true,
    },
    {
      id: "l15-p2",
      title: "Revenue by category",
      brief: "Line-item revenue — quantity × unit_price, summed — per product category. Output: `category`, `revenue` (alias exactly), ordered by revenue descending. The measures live in order_items; the labels in products.",
      hint: "JOIN order_items oi to products p, then ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue GROUP BY p.category.",
      difficulty: "medium",
      solution:
        "SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nORDER BY revenue DESC;",
      expected: EXPECTED["l15-p2"],
      ordered: true,
    },
    {
      id: "l15-p3",
      title: "The heavy users",
      brief: "Customers with **more than 10** orders. Output: `name`, `orders` (alias COUNT(o.id) exactly), ordered by orders descending. This is HAVING, not WHERE — the condition is about a group, not a row.",
      hint: "GROUP BY c.id HAVING COUNT(o.id) > 10 ORDER BY orders DESC.",
      difficulty: "medium",
      solution:
        "SELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nHAVING COUNT(o.id) > 10\nORDER BY orders DESC;",
      expected: EXPECTED["l15-p3"],
      ordered: true,
    },
    {
      id: "l15-p4",
      title: "The supplier scoreboard",
      brief: "Three hops now: which suppliers generate the most line-item revenue? Output: `name` (supplier), `revenue` (alias of ROUND(SUM(oi.quantity * oi.unit_price),2)), ordered by revenue descending. Chain order_items → products → suppliers, then group by the supplier.",
      hint: "GROUP BY s.id after joining both hops; ORDER BY revenue DESC.",
      difficulty: "hard",
      solution:
        "SELECT s.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi\nJOIN products p  ON p.id = oi.product_id\nJOIN suppliers s ON s.id = p.supplier_id\nGROUP BY s.id\nORDER BY revenue DESC;",
      expected: EXPECTED["l15-p4"],
      ordered: true,
    },
  ],
};
