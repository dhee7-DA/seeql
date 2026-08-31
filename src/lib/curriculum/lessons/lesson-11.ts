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
      kind: "dialect",
      db: "mysql",
      text: "MySQL's manual documents that the comma operator binds more weakly than JOIN: in `FROM t1, t2 JOIN t3 ON (t1.a = t3.a)` the ON clause can't see t1 and the query fails with \"Unknown column\". Mixing the old comma style with modern JOINs is fragile everywhere — in chains, one explicit JOIN … ON per hop.",
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
      notes: [
        { choice: 3, why: "Nothing joins automatically — every hop needs its own explicit ON, and this one works only because order_items carries product_id itself, skipping orders entirely." },
      ],
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
      notes: [
        { choice: 2, why: "Listing joins in another order never sorts anything — output row order is undefined until you ORDER BY, whichever way the joins are written." },
      ],
    },
    {
      id: "l11-q3",
      prompt: "order_items has 251 rows and every row matches. After joining orders AND customers (both 1:1 hops), how many rows?",
      choices: ["16", "103", "251", "251 × 103 × 16"],
      answer: 2,
      why: "Both hops are many-to-one: each item belongs to exactly one order, each order to exactly one customer. The row count is unchanged — 251 — only the columns grow.",
      notes: [
        { choice: 3, why: "Multiplication needs one row matching MANY on the other side — these hops are many-to-one (each item has exactly one order, each order one customer), so nothing multiplies." },
      ],
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
      notes: [
        { choice: 0, why: "A broken four-table blob hides one bad ON among four — adding one hop at a time pins each mistake to the join you just wrote." },
      ],
    },
  ],
  problems: [
    {
      id: "l11-p1",
      title: "Who bought what",
      brief: "The first 15 order lines (by item id) with buyer and product. Output: `id` (order_items id), `customer` (alias the customer's name exactly), `product` (alias the product name exactly). Four tables, three joins, one list.",
      hints: [
        "Walk the foreign keys one hop per JOIN: items → orders → customers for the buyer, items → products for the product — then alias both name columns to the exact headers.",
        "Shape: SELECT oi.id, c.name AS customer, p.name AS product FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id JOIN products p ON p.id = oi.product_id ORDER BY oi.id LIMIT <n>;",
      ],
      difficulty: "medium",
      solution:
        "SELECT oi.id, c.name AS customer, p.name AS product\nFROM order_items oi\nJOIN orders o    ON o.id = oi.order_id\nJOIN customers c ON c.id = o.customer_id\nJOIN products p  ON p.id = oi.product_id\nORDER BY oi.id\nLIMIT 15;",
      mistakes: [
        { test: "\\bjoin\\s+orders\\b(?![^;]*\\bjoin\\s+customers\\b)", message: "The buyer's name lives one more hop away — orders.customer_id → customers.id; without that JOIN, c.name has no source." },
        { test: "\\b(?:c|p)\\.name\\b(?!\\s+as\\s+(?:customer|product)\\b)", message: "Both output names need their exact headers — c.name AS customer and p.name AS product (bare, both would be headed \"name\")." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "\"First 15 by item id\" needs ORDER BY oi.id before the LIMIT 15 cap." },
      ],
      expected: EXPECTED["l11-p1"],
      ordered: true,
    },
    {
      id: "l11-p2",
      title: "The wearable trail",
      brief: "Every order line involving a Wearables product, in item-id order. Output: `id` (order_items id), `customer` (buyer's name), `product`. This is the l11-p1 chain plus one WHERE.",
      hints: [
        "It's the previous chain plus one filter — the category lives on the products side, so WHERE p.category = 'Wearables' joins the other conditions in WHERE.",
        "Shape: SELECT oi.id, c.name AS customer, p.name AS product FROM order_items oi JOIN orders o ON … JOIN customers c ON … JOIN products p ON … WHERE p.category = <category> ORDER BY oi.id;",
      ],
      difficulty: "medium",
      solution:
        "SELECT oi.id, c.name AS customer, p.name AS product\nFROM order_items oi\nJOIN orders o    ON o.id = oi.order_id\nJOIN customers c ON c.id = o.customer_id\nJOIN products p  ON p.id = oi.product_id\nWHERE p.category = 'Wearables'\nORDER BY oi.id;",
      mistakes: [
        { test: "category\\s*=\\s*'(?!wearables')[^']*'", message: "This trail follows Wearables only — the category filter should read p.category = 'Wearables'." },
        { test: "^(?!.*\\bcategory\\b).*$", message: "No category filter anywhere — filtering product names with LIKE would miss most Wearables lines; test the category itself: p.category = 'Wearables'." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The trail is graded in item-id order — append ORDER BY oi.id." },
      ],
      expected: EXPECTED["l11-p2"],
      ordered: true,
    },
    {
      id: "l11-p3",
      title: "Delivered audio, line by line",
      brief: "Order lines for **Audio** products inside **delivered** orders. Output: `id` (order_items id), `order_id` (alias the order id exactly), `product`. Two filters, three joins — the filters can reference any table in the chain.",
      hints: [
        "Only three tables are needed — no buyer column was asked for. Two filters on two different joined tables: status on orders, category on products.",
        "Shape: SELECT oi.id, o.id AS order_id, p.name AS product FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE o.status = <status> AND p.category = <category> ORDER BY oi.id;",
      ],
      difficulty: "medium",
      solution:
        "SELECT oi.id, o.id AS order_id, p.name AS product\nFROM order_items oi\nJOIN orders o   ON o.id = oi.order_id\nJOIN products p ON p.id = oi.product_id\nWHERE o.status = 'delivered'\n  AND p.category = 'Audio'\nORDER BY oi.id;",
      mistakes: [
        { test: "status\\s*=\\s*'(?!delivered')[^']*'|category\\s*=\\s*'(?!audio')[^']*'", message: "Both filters are pinned by the brief — delivered orders and Audio products. Check the two literals against the exact words 'delivered' and 'Audio'." },
        { test: "^select\\b(?=[^;]*\\bo\\.id\\b)(?![^;]*\\bo\\.id\\s+as\\s+order_id\\b)", message: "The order-id column must be headed `order_id` — alias it: o.id AS order_id (o.id and oi.id would otherwise both claim the header \"id\")." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The lines are graded in item-id order — append ORDER BY oi.id." },
      ],
      expected: EXPECTED["l11-p3"],
      ordered: true,
    },
    {
      id: "l11-p4",
      title: "The full receipt",
      brief: "Order 88 is one of the store's biggest baskets. Print its receipt: every line with product name, quantity and unit price. Output: `name` (product), `quantity`, `unit_price`, ordered by order_items id. No customers needed — just two hops.",
      hints: [
        "One join is enough — order_items already carries quantity and unit_price; products contributes only the name. Filter the receipt to order 88.",
        "Shape: SELECT p.name, oi.quantity, oi.unit_price FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = <order_id> ORDER BY oi.id;",
      ],
      difficulty: "hard",
      solution:
        "SELECT p.name, oi.quantity, oi.unit_price\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nWHERE oi.order_id = 88\nORDER BY oi.id;",
      mistakes: [
        { test: "^(?!.*\\bjoin\\b).*$", message: "The product name lives in products — order_items stores only the id, so one JOIN ON p.id = oi.product_id is needed to name each line." },
        { test: "\\border_id\\s*=\\s*(?!88\\b)\\d+", message: "This receipt is for order 88 specifically — the filter should read oi.order_id = 88." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "Receipt lines print in item-id order — append ORDER BY oi.id." },
      ],
      expected: EXPECTED["l11-p4"],
      ordered: true,
    },
  ],
  takeaway: "A chain is just foreign keys read aloud — one JOIN … ON per hop, built and sanity-checked one join at a time, with many-to-one hops leaving the row count untouched.",
};
