import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson11: Lesson = {
  id: "lesson-11",
  num: 11,
  title: "Three-table chains",
  blurb: "Following foreign keys two and three hops: items → orders → customers, items → products",
  minutes: 14,
  blocks: [
    {
      kind: "p",
      text: "The storefront's most valuable question — *which customer bought which product?* — spans four tables. `order_items` knows the product and the order; `orders` knows the customer; `customers` and `products` know the names. No single table can answer it, but a chain of joins walks it in one query: each `JOIN … ON` adds exactly one link, each with its own match rule.",
    },
    { kind: "diagram", figure: "j3-chain" },
    {
      kind: "code",
      caption: "The full chain — read FROM downward, one hop at a time",
      sql: `SELECT oi.id, c.name AS customer, p.name AS product
FROM order_items oi
JOIN orders o     ON o.id = oi.order_id
JOIN customers c  ON c.id = o.customer_id
JOIN products p   ON p.id = oi.product_id
ORDER BY oi.id
LIMIT 5;`,
    },
    { kind: "h", text: "Habits for chains" },
    {
      kind: "bullets",
      items: [
        "**Build them hop by hop.** Get one join returning sane rows, **then** add the next join and check again — a wrong `ON` in the middle of a four-table chain is much harder to spot than in a fresh two-table query.",
        "**Let the foreign keys write the `ON` for you.** `order_items.order_id` joins to `orders.id`, `orders.customer_id` joins to `customers.id` — the column names practically write the clauses.",
        "**Join order doesn't change the result.** For inner joins the optimizer rearranges freely; what matters for humans is readability — chains read best when each `ON` sits right under its `JOIN` line.",
      ],
    },
    {
      kind: "tip",
      text: "The Playground's Pipeline tab shows the FROM/JOIN stages of your query as an execution timeline — a quick sanity check that the chain you *meant* is the chain you *wrote*.",
    },
  ],
  mcqs: [
    {
      id: "l11-q1",
      prompt: "In the chain query, which ON clause connects order_items to products?",
      choices: [
        "ON c.id = o.customer_id",
        "ON o.id = oi.order_id",
        "ON p.id = oi.product_id",
        "It happens automatically via orders",
      ],
      answer: 2,
      why: "order_items carries product_id directly, so the link to products is ON p.id = oi.product_id — it does not route through orders at all.",
    },
    {
      id: "l11-q2",
      prompt: "For INNER JOINs, what happens if you list the joins in a different order?",
      choices: [
        "The query errors out",
        "The logical result is the same — the optimizer reorders freely",
        "Rows come back in a different order, changing the result",
        "Only the first two joins run",
      ],
      answer: 1,
      why: "Inner joins are commutative in their logical result; the engine picks any execution order. Row order of the *output* is still undefined unless you ORDER BY.",
    },
    {
      id: "l11-q3",
      prompt: "order_items has 251 rows and every row matches. After joining orders AND customers (both 1:1 hops), how many rows?",
      choices: ["16", "103", "251", "251 × 103 × 16"],
      answer: 2,
      why: "Both hops are many-to-one: each item belongs to exactly one order, each order to exactly one customer. The row count is unchanged — 251 — only the columns grow.",
    },
    {
      id: "l11-q4",
      prompt: "What is the safest workflow for writing a 4-table chain?",
      choices: [
        "Write all joins at once, then debug the error",
        "Start from one table and add one JOIN at a time, checking results between hops",
        "Use SELECT * everywhere to avoid naming columns",
        "Put every condition into the first ON clause",
      ],
      answer: 1,
      why: "Incremental construction catches wrong ON clauses while they're still cheap to find. Each hop should return sane rows before the next one is added.",
    },
  ],
  problems: [
    {
      id: "l11-p1",
      title: "Who bought what",
      brief: "The first 15 order lines (by item id) with buyer and product. Output: `id` (order_items id), `customer` (alias the customer's name exactly), `product` (alias the product name exactly). Four tables, three joins, one list.",
      hint: "Chain order_items → orders → customers, and order_items → products. Alias names AS customer and AS product.",
      difficulty: "medium",
      solution:
        "SELECT oi.id, c.name AS customer, p.name AS product\nFROM order_items oi\nJOIN orders o    ON o.id = oi.order_id\nJOIN customers c ON c.id = o.customer_id\nJOIN products p  ON p.id = oi.product_id\nORDER BY oi.id\nLIMIT 15;",
      expected: EXPECTED["l11-p1"],
      ordered: true,
    },
    {
      id: "l11-p2",
      title: "The wearable trail",
      brief: "Every order line involving a Wearables product, in item-id order. Output: `id` (order_items id), `customer` (buyer's name), `product`. This is the l11-p1 chain plus one WHERE.",
      hint: "Same chain as before, filtered with WHERE p.category = 'Wearables'.",
      difficulty: "medium",
      solution:
        "SELECT oi.id, c.name AS customer, p.name AS product\nFROM order_items oi\nJOIN orders o    ON o.id = oi.order_id\nJOIN customers c ON c.id = o.customer_id\nJOIN products p  ON p.id = oi.product_id\nWHERE p.category = 'Wearables'\nORDER BY oi.id;",
      expected: EXPECTED["l11-p2"],
      ordered: true,
    },
    {
      id: "l11-p3",
      title: "Delivered audio, line by line",
      brief: "Order lines for **Audio** products inside **delivered** orders. Output: `id` (order_items id), `order_id` (alias the order id exactly), `product`. Two filters, three joins — the filters can reference any table in the chain.",
      hint: "WHERE o.status = 'delivered' AND p.category = 'Audio'. Alias o.id AS order_id.",
      difficulty: "medium",
      solution:
        "SELECT oi.id, o.id AS order_id, p.name AS product\nFROM order_items oi\nJOIN orders o   ON o.id = oi.order_id\nJOIN products p ON p.id = oi.product_id\nWHERE o.status = 'delivered'\n  AND p.category = 'Audio'\nORDER BY oi.id;",
      expected: EXPECTED["l11-p3"],
      ordered: true,
    },
    {
      id: "l11-p4",
      title: "The full receipt",
      brief: "Order 88 is one of the store's biggest baskets. Print its receipt: every line with product name, quantity and unit price. Output: `name` (product), `quantity`, `unit_price`, ordered by order_items id. No customers needed — just two hops.",
      hint: "FROM order_items oi JOIN products p … WHERE oi.order_id = 88. Order by oi.id.",
      difficulty: "hard",
      solution:
        "SELECT p.name, oi.quantity, oi.unit_price\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nWHERE oi.order_id = 88\nORDER BY oi.id;",
      expected: EXPECTED["l11-p4"],
      ordered: true,
    },
  ],
};
