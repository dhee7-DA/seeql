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
    { kind: "diagram", figure: "j10-cartesian" },
    {
      kind: "bullets",
      items: [
        "**The drop is silent.** Unmatched rows just never appear — the single most common source of wrong numbers in real analytics, so watch it happen deliberately at least once.",
        "**Rows multiply.** One left row matching three right rows appears three times — once per match. A product sold in 7 different orders contributes 7 rows after joining `order_items` to `products`. Usually exactly what you want (each sale is a fact) — and dangerous the moment you aggregate (lesson 16 is devoted to that trap).",
        "**Aliases stop being decoration.** Both tables tend to own columns called `id`, `name`, `created_at` — an unqualified column is ambiguous and SQLite refuses the query. Alias every table (`orders o`, `customers c`), qualify every column: six extra characters for queries that never lie about their sources.",
      ],
    },
    { kind: "diagram", figure: "j10-multiply" },
    { kind: "diagram", figure: "j2-join-space-3d" },
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
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite happily runs `orders o JOIN customers c` with no ON at all — a condition-less JOIN degenerates into a cartesian product (MySQL behaves the same). PostgreSQL refuses to parse it; when you truly want every pairing, say so deliberately with CROSS JOIN (or ON TRUE).",
    },
  ],
  mcqs: [
    {
      id: "l10-q1",
      prompt: "A left row finds three matching right rows. How often does it appear in the INNER JOIN result?",
      choices: ["Once, with the first match", "Three times, once per match", "Zero times — multiple matches are an error", "Once, with the three matches merged into a list"],
      answer: 1,
      why: "Joins output one row per matching pair. Three matches means three output rows — the fundamental reason joined tables can be bigger than either input.",
      notes: [
        { choice: 0, why: "Nothing in a join picks a \"first\" match — every matching pair emits its own row, so the left row surfaces once per match, identical each time." },
      ],
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
      notes: [
        { choice: 0, why: "NULL-filling is LEFT JOIN's preservation trick — INNER JOIN has no such mechanism: unmatched rows simply never enter the result." },
      ],
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
      notes: [
        { choice: 0, why: "Qualification is a correctness feature, not a speed one — with id and name in both tables, a bare reference is ambiguous and the engine refuses to guess." },
      ],
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
      notes: [
        { choice: 0, why: "INNER is optional padding — bare JOIN parses as an INNER JOIN in SQLite, PostgreSQL and MySQL alike; spelling it out is pure style." },
      ],
    },
    {
      id: "l10-q5",
      prompt: "`SELECT * FROM order_items oi JOIN orders o ON oi.order_id = o.id` — how many rows?",
      choices: [
        "103 — one per order",
        "251 — one per line",
        "16 — one per product",
        "4016 — every line paired with every product",
      ],
      answer: 1,
      why: "Each line belongs to exactly one order, and every order_id finds its order — one output row per LINE: 251. On a many-to-one hop the row count survives; only the columns widen.",
      notes: [
        { choice: 0, why: "103 counts DISTINCT orders — the 251 lines ride on them, and each line keeps its own output row (251 lines spread over 103 orders)." },
        { choice: 3, why: "A blow-up like that needs a missing or wrong ON — with the real foreign key in the match rule, each line pairs with exactly one order." },
      ],
    },
    {
      id: "l10-q6",
      prompt: "A teammate writes `FROM orders o JOIN customers c ON o.id = c.id` and gets a plausible-looking result. What did they actually join on?",
      choices: [
        "The right key — both tables call it id",
        "Nothing — SQLite refuses the query outright",
        "Accidental id collisions: order 1 paired with customer 1, order 2 with customer 2 … 16 rows of wrong pairings",
        "The foreign key, just written in reverse",
      ],
      answer: 2,
      why: "Both tables number their rows from 1, so o.id = c.id matches wherever the counters collide — orders 1–16 hit customers 1–16 (16 rows), orders 17+ match nothing. Every pairing is semantically wrong: an order's buyer is o.customer_id, not whichever id happens to equal it.",
      notes: [
        { choice: 0, why: "Sharing a column NAME doesn't make it the same column — orders.id and customers.id are independent counters. The only real thread to customers is orders.customer_id." },
      ],
    },
    {
      id: "l10-q7",
      prompt: "`SELECT name, price FROM products p JOIN suppliers s ON s.id = p.supplier_id` — spot the bug.",
      choices: [
        "price must be qualified too, or the query fails",
        "Nothing — it runs and shows product names",
        "name is ambiguous — products and suppliers both have one",
        "The ON clause is written backwards",
      ],
      answer: 2,
      why: "Both joined tables carry a name column, so the bare reference has two candidates and SQLite errors with \"ambiguous column name\". Qualify it: p.name for the product (s.name for the supplier).",
      notes: [
        { choice: 0, why: "price exists in only one of the two tables, so the bare reference resolves fine — ambiguity only bites when the column name exists in more than one joined table." },
      ],
    },
    {
      id: "l10-q8",
      prompt: "orders ⋈ customers considers 103 × 16 = 1648 pairs — yet the proper join returns 103 rows. Why never 1648?",
      choices: [
        "ON discards every pair where the match rule is false, before anything is output",
        "SQLite caps join results at the left table's size",
        "1648 is what LEFT JOIN would return; INNER is smaller by design",
        "The engine keeps the first match per order and drops the rest",
      ],
      answer: 0,
      why: "The join considers all pairs, then ON tests each one: only pairs where c.id = o.customer_id survive — and each order has exactly one such customer. 1648 is what you get by deleting the ON entirely, not a step INNER JOIN quietly skips.",
      notes: [
        { choice: 3, why: "Nothing picks a \"first\" match — every pair satisfying ON emits its own row. Each order satisfies it exactly once, which is why the result is 103 rows, not 1648." },
      ],
    },
  ],
  problems: [
    {
      id: "l10-p1",
      title: "The big tickets",
      brief: "Orders over 500, largest first, with the buyer's name. Output: `id` (order id), `name`, `total`. Use aliases for both tables.",
      hints: [
        "Join customers on for the name, keep the orders above 500 in WHERE, then sort the survivors biggest-first.",
        "Shape: SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.total > <amount> ORDER BY o.total DESC;",
      ],
      difficulty: "easy",
      solution:
        "SELECT o.id, c.name, o.total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total > 500\nORDER BY o.total DESC;",
      mistakes: [
        { test: "\\border\\s+by\\s+o\\.total\\b(?!\\s+desc\\b)", message: "\"Largest first\" needs DESC — a bare or ASC ORDER BY o.total puts the smallest ticket on top." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The brief grades row order — append ORDER BY o.total DESC so the big tickets lead." },
        { test: "\\bfrom\\s+orders\\b(?![^;]*\\bjoin\\b)", message: "The buyer's name lives in customers — join it via orders.customer_id, otherwise c.name has no source." },
      ],
      expected: EXPECTED["l10-p1"],
      ordered: true,
    },
    {
      id: "l10-p2",
      title: "Line by line",
      brief: "The first 15 order lines (by item `id`) with the product they refer to. Output: `id` (the order_items id), `name` (product name), `quantity`. Feel the multiplication: popular products appear again and again.",
      hints: [
        "order_items holds only the product's id — join products through product_id to fetch each line's name alongside it.",
        "Shape: SELECT oi.id, p.name, oi.quantity FROM order_items oi JOIN products p ON p.id = oi.product_id ORDER BY oi.id LIMIT <n>;",
      ],
      difficulty: "easy",
      solution:
        "SELECT oi.id, p.name, oi.quantity\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nORDER BY oi.id\nLIMIT 15;",
      mistakes: [
        { test: "\\bjoin\\s+products\\b(?![^;]*\\bon\\b)", message: "Without ON, every one of the 248 lines pairs with all 16 products — the match rule `ON p.id = oi.product_id` is what picks each line's actual product." },
        { test: "\\bon\\s+(?:p\\.id\\s*=\\s*oi\\.id\\b|oi\\.id\\s*=\\s*p\\.id\\b)", message: "A line's id and a product's id are different keys — the foreign key is order_items.product_id → products.id." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "\"First 15 by item id\" needs ORDER BY oi.id before the LIMIT 15 cap." },
      ],
      expected: EXPECTED["l10-p2"],
      ordered: true,
    },
    {
      id: "l10-p3",
      title: "Premium gear, verified sources",
      brief: "Products priced above 100 with their supplier's name and rating. Output: `name` (product), `price`, `supplier`, `rating`, ordered by price descending.",
      hints: [
        "One join brings both supplier facts along — alias their name column to the exact header, keep the price filter on the product side, sort most expensive first.",
        "Shape: SELECT p.name, p.price, s.name AS supplier, s.rating FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE p.price > <amount> ORDER BY p.price DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT p.name, p.price, s.name AS supplier, s.rating\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE p.price > 100\nORDER BY p.price DESC;",
      mistakes: [
        { test: "\\bs\\.name\\b(?!\\s+as\\s+supplier\\b)", message: "The supplier's name must be headed `supplier` — alias it: s.name AS supplier (otherwise the header reads \"name\" and collides with the product's)." },
        { test: "^select\\b(?![^;]*\\bs\\.rating\\b)", message: "The brief wants the supplier's rating too — add s.rating to the SELECT list." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "Priced descending is part of the ask — append ORDER BY p.price DESC." },
      ],
      expected: EXPECTED["l10-p3"],
      ordered: true,
    },
    {
      id: "l10-p4",
      title: "The APAC book of business",
      brief: "The first 20 orders (by order `id`) placed by customers in the APAC region. Output: `id` (order id), `name` (customer), `status`. The filter lives on the joined table — that's the point of this one.",
      hints: [
        "The filter column lives on the joined side — region belongs to customers, so WHERE c.region = 'APAC' after the join, then take the first 20 by order id.",
        "Shape: SELECT o.id, c.name, o.status FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = <region> ORDER BY o.id LIMIT <n>;",
      ],
      difficulty: "medium",
      solution:
        "SELECT o.id, c.name, o.status\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE c.region = 'APAC'\nORDER BY o.id\nLIMIT 20;",
      mistakes: [
        { test: "region\\s*=\\s*'(?!apac')[^']*'", message: "This book of business is APAC-only — the region filter should read c.region = 'APAC'." },
        { test: "\\bjoin\\s+customers\\b(?![^;]*\\bon\\b)", message: "A JOIN with no ON pairs every order with every customer — the match rule `ON c.id = o.customer_id` selects each order's actual buyer." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "\"First 20 by order id\" needs ORDER BY o.id before the LIMIT 20 cap." },
      ],
      expected: EXPECTED["l10-p4"],
      ordered: true,
    },
    {
      id: "l10-p5",
      title: "The fanout census",
      brief: "One row, one number: how many rows does the join of orders to order_items produce? Output: a single column headed `rows` (alias COUNT(*) exactly), a single row. Feel the multiplication on purpose — 251 is the whole point.",
      hints: [
        "The census IS the row count — COUNT(*) over the join, no WHERE, no GROUP BY. Alias the aggregate to the exact header the brief asks for.",
        "Shape: SELECT COUNT(*) AS rows FROM orders o JOIN order_items oi ON oi.order_id = o.id;",
      ],
      difficulty: "medium",
      solution:
        "SELECT COUNT(*) AS rows\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id;",
      mistakes: [
        { test: "\\bfrom\\s+orders\\b(?![^;]*\\bjoin\\b)", message: "Counting orders alone gives 103 — the census counts PAIRS, so order_items has to join in via oi.order_id = o.id." },
        { test: "\\bon\\s+(?:o\\.id\\s*=\\s*oi\\.id\\b|oi\\.id\\s*=\\s*o\\.id\\b)", message: "That pairs the two tables' primary keys against each other — the foreign key is order_items.order_id → orders.id." },
        { test: "count\\(\\s*\\*\\s*\\)(?![^;]*\\bas\\s+rows\\b)", message: "The output column must be headed `rows` — alias it: COUNT(*) AS rows." },
      ],
      expected: EXPECTED["l10-p5"],
    },
    {
      id: "l10-p6",
      title: "Big lines, named",
      brief: "The heavy hitters: every line with quantity >= 3 — 89 of them, and the store never ships more than 3 units — with product name and `line_total` = ROUND(quantity * unit_price, 2). Output: `id` (order_items id), `name`, `line_total`; biggest line_total first, ties broken by item id; first 10.",
      hints: [
        "The line's value is computed per row — multiply the two order_items columns inside ROUND(…, 2), alias it, and let ORDER BY … DESC plus LIMIT pick the top 10.",
        "Shape: SELECT oi.id, p.name, ROUND(oi.quantity * oi.unit_price, 2) AS line_total FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.quantity >= <n> ORDER BY line_total DESC, oi.id LIMIT <n>;",
      ],
      difficulty: "hard",
      solution:
        "SELECT oi.id, p.name, ROUND(oi.quantity * oi.unit_price, 2) AS line_total\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nWHERE oi.quantity >= 3\nORDER BY line_total DESC, oi.id ASC\nLIMIT 10;",
      mistakes: [
        { test: "\\bquantity\\s*>\\s*3\\b", message: "The threshold is >= 3, not strictly greater — a bare > drops every 3-unit line, and all 89 heavy lines are exactly 3 units." },
        { test: "\\border\\s+by\\b[^;]*\\bline_total\\b(?!\\s+desc\\b)", message: "\"Biggest first\" needs DESC on line_total — a bare or ASC sort leads with the cheapest heavy line." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The top-10 needs a deliberate order — append ORDER BY line_total DESC, oi.id LIMIT 10." },
      ],
      expected: EXPECTED["l10-p6"],
      ordered: true,
    },
    {
      id: "l10-p7",
      title: "Shelf value",
      brief: "How much money sits on the shelf? For every product, `shelf_value` = ROUND(price * stock, 2), with the supplier's name alongside. Output: `name`, `supplier`, `shelf_value`; biggest value first, ties by product name; first 12.",
      hints: [
        "price and stock already live together in products — the join's only job is the supplier's name. Compute the value as an aliased expression and sort it biggest-first.",
        "Shape: SELECT p.name, s.name AS supplier, ROUND(p.price * p.stock, 2) AS shelf_value FROM products p JOIN suppliers s ON s.id = p.supplier_id ORDER BY shelf_value DESC, p.name LIMIT <n>;",
      ],
      difficulty: "hard",
      solution:
        "SELECT p.name, s.name AS supplier, ROUND(p.price * p.stock, 2) AS shelf_value\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nORDER BY shelf_value DESC, p.name ASC\nLIMIT 12;",
      mistakes: [
        { test: "\\bs\\.name\\b(?!\\s+as\\s+supplier\\b)", message: "The supplier's name must be headed `supplier` — alias it: s.name AS supplier (otherwise the header reads \"name\" and collides with the product's)." },
        { test: "\\bfrom\\s+products\\b(?![^;]*\\bjoin\\b)", message: "The supplier's name lives in suppliers — join it via products.supplier_id, otherwise s.name has no source." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "Shelf value is graded biggest-first — append ORDER BY shelf_value DESC, p.name LIMIT 12." },
      ],
      expected: EXPECTED["l10-p7"],
      ordered: true,
    },
    {
      id: "l10-p8",
      title: "Distinct orderers",
      brief: "The census counted 251 joined rows — but how many distinct orders do those lines actually belong to? One row per order id, no duplicates: output `id` (alias oi.order_id exactly), ordered by id. Watch the fanout collapse back to 103.",
      hints: [
        "The same order id repeats once per line — DISTINCT keeps a single copy of each repeated value, collapsing the 251 lines to one row per order.",
        "Shape: SELECT DISTINCT oi.order_id AS id FROM order_items oi ORDER BY <col>;",
      ],
      difficulty: "medium",
      solution:
        "SELECT DISTINCT oi.order_id AS id\nFROM order_items oi\nORDER BY id;",
      mistakes: [
        { test: "^select\\b(?![^;]*\\bdistinct\\b)(?=[^;]*\\border_id\\b)", message: "Without DISTINCT the 251 lines keep their duplicates — the ask is one row per order, and DISTINCT is what collapses the repeats." },
        { test: "^select\\b(?:(?!\\bfrom\\b)[^;])*\\border_id\\b(?!\\s+as\\s+id\\b)", message: "The output column must be headed `id` — alias it: oi.order_id AS id." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The ids are graded in ascending order — append ORDER BY id." },
      ],
      expected: EXPECTED["l10-p8"],
      ordered: true,
    },
  ],
  takeaway: "INNER JOIN keeps exactly the pairs where ON is true — unmatched rows vanish silently, one left row repeats once per match, and both tables owning id and name make alias-and-qualify non-negotiable.",
};
