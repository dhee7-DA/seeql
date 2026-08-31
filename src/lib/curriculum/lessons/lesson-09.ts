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
    },
  ],
  problems: [
    {
      id: "l9-p1",
      title: "Orders with names",
      brief: "Return the first 12 orders (by `id`) with the customer's name alongside. Output columns: `id` (the order id), `name` (the customer), `total`. This is the lookup that started the lesson.",
      hint: "FROM orders o JOIN customers c ON c.id = o.customer_id, then ORDER BY o.id and LIMIT 12.",
      difficulty: "easy",
      solution:
        "SELECT o.id, c.name, o.total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY o.id\nLIMIT 12;",
      expected: EXPECTED["l9-p1"],
      ordered: true,
    },
    {
      id: "l9-p2",
      title: "The sourced catalog",
      brief: "Every product with its supplier's name. Output: `name` (product), `supplier` (supplier's name — alias it exactly), ordered by product name. Only the first 10 rows.",
      hint: "Join products to suppliers on supplier_id. Alias the supplier's name column AS supplier.",
      difficulty: "easy",
      solution:
        "SELECT p.name, s.name AS supplier\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nORDER BY p.name\nLIMIT 10;",
      expected: EXPECTED["l9-p2"],
      ordered: true,
    },
    {
      id: "l9-p3",
      title: "Berlin buyers",
      brief: "Our Berlin customers deserve a local campaign. List the **delivered** orders placed by customers who live in Berlin: output `id` (order id), `name`, ordered by order id. The city lives in `customers`, the status in `orders` — one join away.",
      hint: "Filter with WHERE c.city = 'Berlin' AND o.status = 'delivered', ORDER BY o.id.",
      difficulty: "medium",
      solution:
        "SELECT o.id, c.name\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE c.city = 'Berlin'\n  AND o.status = 'delivered'\nORDER BY o.id;",
      expected: EXPECTED["l9-p3"],
      ordered: true,
    },
    {
      id: "l9-p4",
      title: "The European supply line",
      brief: "Which products come from EU-based suppliers? Output `name` (product), `supplier`, `price`, ordered by price descending (most expensive first). Filtering on a joined table's column is exactly like filtering your own.",
      hint: "Join products to suppliers, then WHERE s.region = 'EU' and ORDER BY price DESC.",
      difficulty: "medium",
      solution:
        "SELECT p.name, s.name AS supplier, p.price\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE s.region = 'EU'\nORDER BY p.price DESC;",
      expected: EXPECTED["l9-p4"],
      ordered: true,
    },
  ],
};
