import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson09: Lesson = {
  id: "lesson-09",
  num: 9,
  title: "Two tables, one answer",
  blurb: "Why the data lives apart — and how JOIN reunites it at query time",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "The order amount lives in `orders`. The customer's name lives in `customers`. No table holds both — and that is deliberate: copying the name into every order would waste space and go stale the moment a customer renames.",
    },
    { kind: "h", text: "The three pieces" },
    {
      kind: "bullets",
      items: [
        "**One fact, one table.** Each fact lives in exactly one place; everything else is a lookup. That principle is called normalization.",
        "**Foreign keys connect tables.** `orders.customer_id` stores a number that points at `customers.id` — the thread you pull to reunite the data.",
        "**JOIN reunites them at query time.** For each row here, the database finds the matching row over there and carries its columns alongside. Internalize that and every join query reads like plain English.",
      ],
    },
    {
      kind: "code",
      caption: "Your first join",
      sql: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
LIMIT 5;`,
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "PostgreSQL (and MySQL and SQLite) also accept `JOIN … USING (col)` when both sides share a column name — it pairs the columns and outputs the shared one only once. In this schema every foreign key carries its own name (customer_id, supplier_id, order_id), so you'll spell each match out with ON.",
    },
    { kind: "diagram", figure: "j1-fk-lookup" },
    { kind: "h", text: "Read the query" },
    {
      kind: "steps",
      items: [
        "`FROM orders o` — the starting table, nicknamed `o`.",
        "`JOIN customers c` — bring in the second table, nicknamed `c`.",
        "`ON c.id = o.customer_id` — the **match rule**: of every possible pair of rows, the pair survives only when this is true.",
        "`SELECT o.id, c.name, o.total` — after matching, columns can come from either side.",
      ],
    },
    { kind: "h", text: "Two details worth noticing" },
    {
      kind: "bullets",
      items: [
        "We dropped the word `INNER` — `JOIN` alone means `INNER JOIN` in every major database.",
        "Every column is prefixed with its nickname: `id` and `name` exist in **both** tables, so a bare `name` would be ambiguous and the database refuses to guess. Qualifying every column is a small price for queries that never lie about where data comes from.",
      ],
    },
    {
      kind: "tip",
      text: "Open the Playground's **Relationships** tab after running any join — it draws the tables and the connecting edges the parser found, which is the fastest way to check you joined what you meant to join.",
    },
  ],
  mcqs: [
    {
      id: "l9-q1",
      prompt: "What does the ON clause in a JOIN do?",
      choices: [
        "Chooses which columns appear in the result",
        "Defines the match rule that pairs rows from the two tables",
        "Sorts the combined rows",
        "Filters out NULL values",
      ],
      answer: 1,
      why: "ON is the pairing rule: for every combination of rows from the two tables, only pairs where the ON condition is true survive. Column selection is SELECT's job, sorting is ORDER BY's job.",
      notes: [
        { choice: 0, why: "If ON picked columns, a join could never widen a row — the result carries columns from both tables precisely because ON's only job is deciding which PAIRS survive." },
      ],
    },
    {
      id: "l9-q2",
      prompt: "`SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id` returns…",
      choices: [
        "One row per order, with the customer's name attached",
        "One row per customer, with all their orders merged into a list",
        "All 103 × 16 possible order/customer combinations",
        "Only customers who have placed orders — the orders themselves are hidden",
      ],
      answer: 0,
      why: "Each order row pairs with exactly one customer row (customer_id points at one id), so you get one output row per order — 103 rows here — now carrying the customer's name.",
      notes: [
        { choice: 1, why: "SQL results are always flat — folding each customer's orders into a list needs GROUP BY; a bare join just repeats the customer's columns next to each of their orders." },
      ],
    },
    {
      id: "l9-q3",
      prompt: "In `FROM orders o JOIN customers c`, which table is the \"left\" table?",
      choices: [
        "customers, because it is joined in later",
        "orders, because it appears in FROM",
        "Whichever has more rows",
        "SQL has no concept of left and right tables",
      ],
      answer: 1,
      why: "The table in FROM is the left side; each JOIN adds a right side. Left/right matters from the next lesson on — LEFT JOIN keeps every left row even without a match.",
      notes: [
        { choice: 0, why: "Left and right are positions in the query text — whatever FROM names is the left side, no matter how many tables join in afterwards." },
      ],
    },
    {
      id: "l9-q4",
      prompt: "Why doesn't the store just copy the customer's name into every order row?",
      choices: [
        "Names are too long to store",
        "The name would be duplicated and could go stale if the customer renames",
        "SQLite cannot store text in two tables",
        "It would make queries slower to write",
      ],
      answer: 1,
      why: "Storing the name once in customers means one place to update. That principle — one fact, one table, linked by keys — is called normalization, and joins are how you read it back.",
      notes: [
        { choice: 3, why: "The extra JOIN is trivial to write — the real cost of copying names into orders is integrity: every rename would need to chase down duplicated copies, and one would be missed." },
      ],
    },
  ],
  problems: [
    {
      id: "l9-p1",
      title: "Orders with names",
      brief: "Return the first 12 orders (by `id`) with the customer's name alongside. Output columns: `id` (the order id), `name` (the customer), `total`. This is the lookup that started the lesson.",
      hints: [
        "Both facts you need live on opposite sides of a foreign key — join customers onto orders through customer_id, then order by order id and cap at 12.",
        "Shape: SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.id LIMIT <n>;",
      ],
      difficulty: "easy",
      solution:
        "SELECT o.id, c.name, o.total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY o.id\nLIMIT 12;",
      mistakes: [
        { test: "\\bjoin\\s+customers\\b(?![^;]*\\bon\\b)", message: "A JOIN with no ON pairs every order with every customer (103 × 16 rows) — the match rule `ON c.id = o.customer_id` is what selects the right pairing." },
        { test: "\\bon\\s+(?:c\\.id\\s*=\\s*o\\.id\\b|o\\.id\\s*=\\s*c\\.id\\b)", message: "You've paired the two primary keys against each other — customers.id and orders.id are unrelated. The thread is the foreign key: orders.customer_id → customers.id." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "\"First 12\" needs a deliberate order — append ORDER BY o.id LIMIT 12 so the cap starts from the smallest order id." },
      ],
      expected: EXPECTED["l9-p1"],
      ordered: true,
    },
    {
      id: "l9-p2",
      title: "The sourced catalog",
      brief: "Every product with its supplier's name. Output: `name` (product), `supplier` (supplier's name — alias it exactly), ordered by product name. Only the first 10 rows.",
      hints: [
        "Products only carry the supplier's id — join suppliers through it, and alias their name column to the exact header the brief asks for.",
        "Shape: SELECT p.name, s.name AS supplier FROM products p JOIN suppliers s ON s.id = p.supplier_id ORDER BY p.name LIMIT <n>;",
      ],
      difficulty: "easy",
      solution:
        "SELECT p.name, s.name AS supplier\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nORDER BY p.name\nLIMIT 10;",
      mistakes: [
        { test: "\\bs\\.name\\b(?!\\s+as\\s+supplier\\b)", message: "The output column must be headed `supplier` — alias it exactly: s.name AS supplier (both tables have a name, so the header would otherwise read \"name\")." },
        { test: "\\bon\\s+(?:p\\.id\\s*=\\s*s\\.id\\b|s\\.id\\s*=\\s*p\\.id\\b)", message: "That matches the two tables' primary keys against each other — unrelated ids. The foreign key is products.supplier_id → suppliers.id." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The catalog is graded in product-name order — append ORDER BY p.name LIMIT 10." },
      ],
      expected: EXPECTED["l9-p2"],
      ordered: true,
    },
    {
      id: "l9-p3",
      title: "Berlin buyers",
      brief: "Our Berlin customers deserve a local campaign. List the **delivered** orders placed by customers who live in Berlin: output `id` (order id), `name`, ordered by order id. The city lives in `customers`, the status in `orders` — one join away.",
      hints: [
        "Two independent filters on two different tables: the city lives in customers, the order status in orders — both go in WHERE (safe here because INNER JOIN drops nothing you'd want to keep).",
        "Shape: SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.city = <city> AND o.status = <status> ORDER BY o.id;",
      ],
      difficulty: "medium",
      solution:
        "SELECT o.id, c.name\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE c.city = 'Berlin'\n  AND o.status = 'delivered'\nORDER BY o.id;",
      mistakes: [
        { test: "city\\s*=\\s*'(?!berlin')[^']*'", message: "The campaign targets Berlin — the city filter should read c.city = 'Berlin'." },
        { test: "status\\s*=\\s*'(?!delivered')[^']*'", message: "Only delivered orders make this list — the status filter should read o.status = 'delivered'." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The brief asks for the orders in id order — append ORDER BY o.id." },
      ],
      expected: EXPECTED["l9-p3"],
      ordered: true,
    },
    {
      id: "l9-p4",
      title: "The European supply line",
      brief: "Which products come from EU-based suppliers? Output `name` (product), `supplier`, `price`, ordered by price descending (most expensive first). Filtering on a joined table's column is exactly like filtering your own.",
      hints: [
        "Same products ↔ suppliers join as the catalog problem, but now the filter lands on the joined table: WHERE s.region = 'EU', then sort most expensive first.",
        "Shape: SELECT p.name, s.name AS supplier, p.price FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.region = <region> ORDER BY p.price DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT p.name, s.name AS supplier, p.price\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE s.region = 'EU'\nORDER BY p.price DESC;",
      mistakes: [
        { test: "region\\s*=\\s*'(?!eu')[^']*'", message: "This shelf is EU-only — the region filter should read s.region = 'EU'." },
        { test: "\\border\\s+by\\s+(?:p\\.)?price\\b(?!\\s+desc\\b)", message: "\"Most expensive first\" needs the DESC direction — a bare or ASC ORDER BY puts the cheapest product on top." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The supply line is graded in price order — append ORDER BY p.price DESC." },
      ],
      expected: EXPECTED["l9-p4"],
      ordered: true,
    },
  ],
  takeaway: "Tables split facts apart on purpose: foreign keys store the thread, and JOIN … ON reunites it at query time — one output row for every pair of rows that satisfies the match rule, carrying columns from both sides.",
};
