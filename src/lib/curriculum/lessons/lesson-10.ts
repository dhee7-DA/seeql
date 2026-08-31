import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson10: Lesson = {
  id: "lesson-10",
  num: 10,
  title: "INNER JOIN mechanics",
  blurb: "What the database actually pairs up, what gets dropped, and why rows can multiply",
  minutes: 13,
  blocks: [
    {
      kind: "p",
      text: "An `INNER JOIN` is a strict gatekeeper: a pair of rows (one from each side) only makes it into the result if the `ON` condition is true for that pair. Rows on either side with **no partner are silently dropped** — no error, no warning.",
    },
    { kind: "h", text: "Three things to internalize" },
    {
      kind: "bullets",
      items: [
        "**The drop is silent.** Unmatched rows just never appear — the single most common source of wrong numbers in real analytics, so watch it happen deliberately at least once.",
        "**Rows multiply.** One left row matching three right rows appears three times — once per match. A product sold in 7 different orders contributes 7 rows after joining `order_items` to `products`. Usually exactly what you want (each sale is a fact) — and dangerous the moment you aggregate (lesson 16 is devoted to that trap).",
        "**Aliases stop being decoration.** Both tables tend to own columns called `id`, `name`, `created_at` — an unqualified column is ambiguous and SQLite refuses the query. Alias every table (`orders o`, `customers c`), qualify every column: six extra characters for queries that never lie about their sources.",
      ],
    },
    { kind: "diagram", figure: "j2-inner-match" },
    {
      kind: "code",
      caption: "Aliases + qualification + a filter on the joined side",
      sql: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'EU'
ORDER BY o.total DESC;`,
    },
    {
      kind: "warn",
      text: "If you ever see `column name is ambiguous`, an unqualified column exists in both tables. Don't fix it by deleting columns — fix it by qualifying: `o.id`, `c.name`.",
    },
  ],
  mcqs: [
    {
      id: "l10-q1",
      prompt: "A left row finds three matching right rows. How often does it appear in the INNER JOIN result?",
      choices: ["Once, with the first match", "Three times, once per match", "Zero times — multiple matches are an error", "Once, with the three matches merged into a list"],
      answer: 1,
      why: "Joins output one row per matching pair. Three matches means three output rows — the fundamental reason joined tables can be bigger than either input.",
    },
    {
      id: "l10-q2",
      prompt: "What happens to left rows with no match under an INNER JOIN?",
      choices: [
        "They appear with NULL-filled right columns",
        "They cause an error",
        "They are silently dropped",
        "They appear at the end of the result",
      ],
      answer: 2,
      why: "INNER JOIN keeps only pairs where ON is true — unmatched rows vanish without a warning. LEFT JOIN (next lessons) is the tool when you need them kept.",
    },
    {
      id: "l10-q3",
      prompt: "Why qualify columns as o.id and c.name instead of writing bare id and name?",
      choices: [
        "It makes queries run faster",
        "Both tables contain id and name — unqualified names would be ambiguous",
        "SQLite only accepts qualified columns",
        "It is required when using aliases",
      ],
      answer: 1,
      why: "If a column name exists in more than one joined table, a bare reference is ambiguous and the query errors out. Qualifying states your intent and prevents silent mistakes.",
    },
    {
      id: "l10-q4",
      prompt: "Writing JOIN customers c (without INNER) gives you…",
      choices: [
        "A syntax error — INNER is mandatory",
        "A LEFT JOIN",
        "An INNER JOIN — the keyword is optional",
        "A CROSS JOIN",
      ],
      answer: 2,
      why: "JOIN alone means INNER JOIN in SQLite, PostgreSQL, MySQL and most engines. Writing INNER explicitly is fine too — it's a style choice.",
    },
  ],
  problems: [
    {
      id: "l10-p1",
      title: "The big tickets",
      brief: "Orders over 500, largest first, with the buyer's name. Output: `id` (order id), `name`, `total`. Use aliases for both tables.",
      hint: "WHERE o.total > 500, ORDER BY o.total DESC.",
      difficulty: "easy",
      solution:
        "SELECT o.id, c.name, o.total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total > 500\nORDER BY o.total DESC;",
      expected: EXPECTED["l10-p1"],
      ordered: true,
    },
    {
      id: "l10-p2",
      title: "Line by line",
      brief: "The first 15 order lines (by item `id`) with the product they refer to. Output: `id` (the order_items id), `name` (product name), `quantity`. Feel the multiplication: popular products appear again and again.",
      hint: "FROM order_items oi JOIN products p ON p.id = oi.product_id, ORDER BY oi.id, LIMIT 15.",
      difficulty: "easy",
      solution:
        "SELECT oi.id, p.name, oi.quantity\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nORDER BY oi.id\nLIMIT 15;",
      expected: EXPECTED["l10-p2"],
      ordered: true,
    },
    {
      id: "l10-p3",
      title: "Premium gear, verified sources",
      brief: "Products priced above 100 with their supplier's name and rating. Output: `name` (product), `price`, `supplier`, `rating`, ordered by price descending.",
      hint: "Join products to suppliers; WHERE p.price > 100; ORDER BY p.price DESC.",
      difficulty: "medium",
      solution:
        "SELECT p.name, p.price, s.name AS supplier, s.rating\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE p.price > 100\nORDER BY p.price DESC;",
      expected: EXPECTED["l10-p3"],
      ordered: true,
    },
    {
      id: "l10-p4",
      title: "The APAC book of business",
      brief: "The first 20 orders (by order `id`) placed by customers in the APAC region. Output: `id` (order id), `name` (customer), `status`. The filter lives on the joined table — that's the point of this one.",
      hint: "WHERE c.region = 'APAC', ORDER BY o.id, LIMIT 20.",
      difficulty: "medium",
      solution:
        "SELECT o.id, c.name, o.status\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE c.region = 'APAC'\nORDER BY o.id\nLIMIT 20;",
      expected: EXPECTED["l10-p4"],
      ordered: true,
    },
  ],
};
