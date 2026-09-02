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
    { kind: "diagram", figure: "j9-mental-model" },
    {
      kind: "steps",
      items: [
        "`FROM orders o` — the starting table, nicknamed `o`.",
        "`JOIN customers c` — bring in the second table, nicknamed `c`.",
        "`ON c.id = o.customer_id` — the **match rule**: of every possible pair of rows, the pair survives only when this is true.",
        "`SELECT o.id, c.name, o.total` — after matching, columns can come from either side.",
      ],
    },
    { kind: "diagram", figure: "j9-direction" },
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
    {
      id: "l9-q5",
      prompt: "`SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id` — how many rows come back?",
      choices: [
        "16 — one per customer",
        "103 — one per order",
        "119 — the orders, plus one spare row per customer",
        "1648 — every order paired with every customer",
      ],
      answer: 1,
      why: "customer_id points at exactly one customer, so every order produces exactly one pair: 103 orders in, 103 rows out. A join over a many-to-one hop doesn't multiply rows — it widens them.",
      notes: [
        { choice: 3, why: "1648 (103 × 16) is the cartesian you get with NO ON clause. The match rule keeps only the pairs where the foreign key actually lands on its customer." },
        { choice: 0, why: "Customers don't collapse the result — each one appears once per order they placed, and all 16 have placed at least one. Preservation of left rows is LEFT JOIN's job, not a join's default." },
      ],
    },
    {
      id: "l9-q6",
      prompt: "You move `c.city = 'Berlin'` from WHERE into the ON clause of an INNER JOIN. What changes?",
      choices: [
        "Nothing — the same rows come back",
        "The query now returns fewer rows",
        "An error — filters can't reference joined columns inside ON",
        "Rows with a NULL city start matching",
      ],
      answer: 0,
      why: "For INNER JOIN, ON and WHERE keep exactly the pairs where the predicate is true: ON decides which pairs survive the join, WHERE filters the join's output — same test, same survivors. Placement only starts to matter with LEFT JOIN (lesson 12).",
      notes: [
        { choice: 2, why: "Any column of an already-joined table is legal inside ON — the clause evaluates per pair with both rows' columns in scope, so c.city is perfectly legal there." },
      ],
    },
    {
      id: "l9-q7",
      prompt: "`SELECT name FROM orders o JOIN customers c ON c.id = o.customer_id` — what happens?",
      choices: [
        "It returns the customers' names",
        "It returns the orders' names — the FROM table wins ties",
        "Error: \"ambiguous column name\" — both tables have a name column",
        "It runs, returning NULL for every row",
      ],
      answer: 2,
      why: "orders and customers BOTH carry a column called name, so a bare reference has two candidate sources — and SQLite refuses to guess, erroring with \"ambiguous column name\". The fix is qualifying: c.name (or o.name, if you truly meant the order's).",
      notes: [
        { choice: 1, why: "There is no FROM-table-wins tiebreak — two candidate sources means an error, never a silent pick. Qualifying the column is how you say which one you meant." },
      ],
    },
    {
      id: "l9-q8",
      prompt: "You need each product with its supplier's region. Which query is spelled correctly?",
      choices: [
        "SELECT p.name, s.region FROM products p JOIN suppliers s ON s.id = p.supplier_id;",
        "SELECT p.name, s.region FROM products p JOIN suppliers s ON s.id = p.id;",
        "SELECT p.name, s.region FROM products p JOIN suppliers s ON p.supplier_id = p.id;",
        "SELECT p.name, s.region FROM suppliers s JOIN products p ON s.supplier_id = p.id;",
      ],
      answer: 0,
      why: "The foreign-key thread is products.supplier_id → suppliers.id, so the match rule pairs s.id with p.supplier_id. (Listing the tables in the other FROM/JOIN order would be fine too for an INNER JOIN — the ON keys are what matter.)",
      notes: [
        { choice: 1, why: "s.id = p.id compares the two tables' primary keys against each other — unrelated counters that happen to collide. The thread is the foreign key, not the id." },
        { choice: 3, why: "suppliers has no supplier_id column — that spelling errors out. Flipping which table sits in FROM is legal, but the ON must still pair p.supplier_id with s.id." },
      ],
    },
    {
      id: "l9-q9",
      prompt: "Why can't `orders JOIN customers USING (customer_id)` work on this schema?",
      choices: [
        "USING is PostgreSQL-only",
        "USING requires identically named columns in both tables — customers has `id`, not `customer_id`",
        "USING only works on numeric columns",
        "It can — it's just slower than ON",
      ],
      answer: 1,
      why: "USING(col) is the shorthand for 'match the same-named column on both sides'. Here the pair is orders.customer_id → customers.id: the names differ, so ON is the only spelling.",
      notes: [
        { choice: 3, why: "It isn't shorthand-with-a-discount — it's a syntax error when no shared column name exists. Name your FKs to match if you want USING to be available." },
      ],
    },
    {
      id: "l9-q10",
      prompt: "Every join in this store's schema runs on a single column. When does a join legitimately need TWO columns (a composite key)?",
      choices: [
        "When both tables are large",
        "When one row is identified by a pair — e.g. an order line keyed by (order_id, line_no)",
        "When you join more than two tables",
        "Never — multi-column joins are a myth",
      ],
      answer: 1,
      why: "Some schemas identify rows by a combination — classic line-item tables keyed by order_id + line number. The join condition then lists both pairs in the ON.",
      notes: [
        { choice: 2, why: "A three-table chain is still three single-column hops. Composite keys are about how ONE table identifies its rows, not how many tables you visit." },
      ],
    },
    {
      id: "l9-q11",
      prompt: "orders.customer_id points at customers.id. To widen orders with customer names, which way does the join flow?",
      choices: [
        "customers JOIN orders — parent first",
        "orders JOIN customers — the many side reaches for its parent",
        "Either, but the results differ",
        "Neither — you need a subquery for names",
      ],
      answer: 1,
      why: "The FK lives on the many side. Start from orders and pull each row's parent customer — that's the widening direction, and it never multiplies rows.",
      notes: [
        { choice: 0, why: "customers JOIN orders is also legal SQL — but it's the multiplying direction: each customer fans out once per order. Direction changes which table's rows survive, always." },
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
    {
      id: "l9-p5",
      title: "Sleepy accounts",
      brief: "Marketing wants to wake the dormant accounts. List the **inactive** customers' orders: output `id` (order id), `name`, `active`, ordered by order id. Two of the 16 customers sleep — their 6 orders are your list.",
      hints: [
        "Whether an account is active is a fact about the customer, not the order — join customers on for the flag, then filter on the joined side's column exactly like the city filter earlier.",
        "Shape: SELECT o.id, c.name, c.active FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.active = <value> ORDER BY o.id;",
      ],
      difficulty: "medium",
      solution:
        "SELECT o.id, c.name, c.active\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE c.active = 0\nORDER BY o.id;",
      mistakes: [
        { test: "\\bc\\.active\\s*=\\s*1\\b", message: "The brief targets the sleeping accounts — the flag reads c.active = 0 (0 = inactive, 1 = active)." },
        { test: "\\bfrom\\s+orders\\b(?![^;]*\\bjoin\\b)", message: "The name and the active flag both live in customers — join it via orders.customer_id, otherwise c.name has no source." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The brief grades the list in order-id order — append ORDER BY o.id." },
      ],
      expected: EXPECTED["l9-p5"],
      ordered: true,
    },
    {
      id: "l9-p6",
      title: "The alphabetical ledger",
      brief: "Print the first 20 orders of the ledger: sorted by customer name A→Z, and within the same customer by total, biggest first. Output: `id` (order id), `name`, `total`. Fair warning: the top orderer has 24 orders, so all twenty rows belong to one name.",
      hints: [
        "A multi-key sort takes a comma list in ORDER BY: the customer name ascending decides first, the total descending breaks ties inside each name — only then does LIMIT cap the result.",
        "Shape: SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY c.name <direction>, o.total <direction> LIMIT <n>;",
      ],
      difficulty: "medium",
      solution:
        "SELECT o.id, c.name, o.total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY c.name ASC, o.total DESC\nLIMIT 20;",
      mistakes: [
        { test: "\\border\\s+by\\b[^;]*\\btotal\\b(?!\\s+desc\\b)", message: "\"Biggest first\" needs the DESC direction on the total — a bare or ASC sort puts the cheapest ticket on top inside every name." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The ledger is graded row by row — append ORDER BY c.name, o.total DESC before the LIMIT 20 cap." },
        { test: "\\bjoin\\s+customers\\b(?![^;]*\\bon\\b)", message: "A JOIN with no ON pairs every order with every customer (103 × 16 rows) — the match rule `ON c.id = o.customer_id` picks each order's actual buyer." },
      ],
      expected: EXPECTED["l9-p6"],
      ordered: true,
    },
    {
      id: "l9-p7",
      title: "EU sale tags",
      brief: "15% off everything sourced from EU suppliers. For each EU-sourced product show `name`, `supplier`, `price`, and `sale_price` — computed as ROUND(price * 0.9, 2), aliased exactly — ordered by sale_price descending, ties by product name. Five products make the tag.",
      hints: [
        "The sale price is computed per row: build the expression from the price column, wrap it in ROUND(…, 2) so money keeps two decimals, alias it, and sort on the result.",
        "Shape: SELECT p.name, s.name AS supplier, p.price, ROUND(p.price * <factor>, 2) AS sale_price FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.region = <region> ORDER BY sale_price DESC, p.name;",
      ],
      difficulty: "hard",
      solution:
        "SELECT p.name, s.name AS supplier, p.price, ROUND(p.price * 0.9, 2) AS sale_price\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE s.region = 'EU'\nORDER BY sale_price DESC, p.name ASC;",
      mistakes: [
        { test: "round\\(\\s*p\\.price\\s*\\*\\s*(?!0\\.9\\b)[\\d.]+", message: "A 15% cut means paying 90% of the price — multiply by 0.9 (subtracting 0.15 or multiplying by 1.15 marks the tag wrong)." },
        { test: "region\\s*=\\s*'(?!eu')[^']*'", message: "The sale covers EU-sourced products only — the region filter should read s.region = 'EU'." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "Tags are graded best-deal-first — append ORDER BY sale_price DESC, p.name." },
      ],
      expected: EXPECTED["l9-p7"],
      ordered: true,
    },
    {
      id: "l9-p8",
      title: "From the customers side",
      brief: "The pending-orders list, rewritten from the customer's side: `FROM customers`, joined to orders. Output: `name`, `id` (the order id), ordered by name, then id. For INNER JOINs the table order is readability, not semantics — the 14 rows match either way.",
      hints: [
        "Start the query at customers and join orders through the same foreign key — for an INNER JOIN the result is identical whichever table sits in FROM; write it the way that reads best.",
        "Shape: SELECT c.name, o.id FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = <status> ORDER BY c.name, o.id;",
      ],
      difficulty: "hard",
      solution:
        "SELECT c.name, o.id\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nWHERE o.status = 'pending'\nORDER BY c.name, o.id;",
      mistakes: [
        { test: "\\bjoin\\s+orders\\b(?![^;]*\\bon\\b)", message: "A JOIN with no ON pairs every customer with every order (16 × 103 rows) — the match rule `ON o.customer_id = c.id` selects each customer's actual orders." },
        { test: "status\\s*=\\s*'(?!pending')[^']*'", message: "This list tracks pending orders — the status filter should read o.status = 'pending'." },
        { test: "\\bfrom\\s+orders\\b", message: "This one is written customers-first: start FROM customers c and JOIN orders o — same 14 rows, but the FROM side is the point of the exercise." },
      ],
      expected: EXPECTED["l9-p8"],
      ordered: true,
    },
  ],
  takeaway: "Tables split facts apart on purpose: foreign keys store the thread, and JOIN … ON reunites it at query time — one output row for every pair of rows that satisfies the match rule, carrying columns from both sides.",
};
