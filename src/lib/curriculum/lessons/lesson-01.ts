import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson01: Lesson = {
  id: "lesson-01",
  num: 1,
  title: "Databases, tables & your storefront",
  blurb: "What SQL works with: rows, columns, keys and the sample business you'll analyze",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "Every skill in this course runs on one small but realistic business: an online store selling keyboards, headsets and gear. Its data lives in a **relational database** — a set of tables that reference each other. Every `SELECT` you will ever write is just a question asked to rows and columns, so start with a precise picture of what a table is.",
    },
    { kind: "h", text: "What a table actually is" },
    {
      kind: "bullets",
      items: [
        "**A table is a grid.** Each **column** is one attribute with a fixed type — `name` is text, `price` is a number, `active` is a 0/1 flag.",
        "**Each row is one real thing** — one customer, one product, one order.",
        "**Rows have no order.** A table is a *set* — nothing is \"the third row\" unless a query says so. If you want order, you must request it (that's lesson 5). This is the biggest mindset shift for spreadsheet users.",
      ],
    },
    { kind: "diagram", figure: "l1-anatomy" },
    {
      kind: "dialect",
      db: "postgres",
      text: "PostgreSQL and MySQL reject a number inserted into a TEXT column; SQLite's dynamic typing quietly accepts it. Every query in this course runs on SQLite — so correctness has to come from your SQL, not from the schema guarding you.",
    },
    { kind: "h", text: "The two glues: primary & foreign keys" },
    {
      kind: "bullets",
      items: [
        "**Primary key (`id`)** — uniquely identifies a row: no duplicates, never empty.",
        "**Foreign key** — a column that points at another table's primary key. In our store, `orders.customer_id` holds the `id` of the customer who placed the order.",
        "**Store a number, look up the rest.** Instead of copying the customer's address into every order, we keep a small id and resolve it when needed — the idea the whole of Module 2 is built on.",
      ],
    },
    {
      kind: "table",
      caption: "Your sandbox — the storefront schema",
      headers: ["Table", "One row is…", "Key columns"],
      rows: [
        ["customers", "a person who signed up", "id (PK)"],
        ["suppliers", "a company we buy from", "id (PK)"],
        ["products", "an item we sell", "id (PK), supplier_id → suppliers"],
        ["orders", "one purchase event", "id (PK), customer_id → customers"],
        ["order_items", "one product line inside an order", "id (PK), order_id → orders, product_id → products"],
      ],
    },
    { kind: "diagram", figure: "l1-schema-map" },
    {
      kind: "dialect",
      db: "mysql",
      text: "The 0/1 `active` flag is SQLite's boolean. PostgreSQL has a native BOOLEAN accepting `TRUE`/`FALSE`, and MySQL's BOOL is an alias for TINYINT(1) — comparisons like `active = 1` work in all three engines.",
    },
    {
      kind: "p",
      text: "Notice the grain: an order for a keyboard **and** a mouse is one row in `orders` plus two rows in `order_items` — the finest grain in the schema. Real shops model data exactly this way, so everything you practice here transfers directly to production work.",
    },
    {
      kind: "tip",
      text: "You can always inspect the live schema in the Playground's **Schema** tab. The database is real SQLite — every query in this course actually executes against it.",
    },
  ],
  mcqs: [
    {
      id: "l1-q1",
      prompt: "What does a primary key guarantee?",
      choices: [
        "The column is always sorted ascending",
        "Each row can be uniquely identified — no duplicates, no NULLs",
        "The column is a number",
        "The column references another table",
      ],
      answer: 1,
      why: "A primary key uniquely identifies each row: values are unique and never NULL. It doesn't have to be numeric, and sorting is a separate concern entirely.",
      notes: [
        { choice: 2, why: "Ids are *often* numbers, but that's convention, not a guarantee — a PK promises uniqueness and no NULLs, nothing about the type." },
      ],
    },
    {
      id: "l1-q2",
      prompt: "`orders.customer_id` is best described as…",
      choices: [
        "A primary key of orders",
        "A foreign key pointing at customers.id",
        "A duplicate of the customer's name",
        "An index defined on customers",
      ],
      answer: 1,
      why: "customer_id lives in orders but identifies a customer — that's the definition of a foreign key: a column that references another table's primary key.",
      notes: [
        { choice: 0, why: "orders already has its own PK (`id`) — customer_id repeats across many orders, which is exactly what a primary key must never do." },
      ],
    },
    {
      id: "l1-q3",
      prompt: "An order contains a keyboard and a mouse. How is that stored?",
      choices: [
        "One row in orders, two rows in order_items",
        "Two rows in orders",
        "One row in orders with two product columns",
        "A single order_items row with both products",
      ],
      answer: 0,
      why: "orders holds the purchase event once; order_items holds one row per product line. That's why order_items is the finest grain of the schema.",
      notes: [
        { choice: 2, why: "That's the spreadsheet instinct — hard-coding one column per product breaks the moment an order has three items; the line-item table scales to any basket." },
      ],
    },
    {
      id: "l1-q4",
      prompt: "Without an ORDER BY clause, in what order do you get rows?",
      choices: [
        "Insert order, always",
        "Alphabetical by the first column",
        "Undefined — a table is an unordered set",
        "By primary key ascending",
      ],
      answer: 2,
      why: "SQL guarantees no order without ORDER BY. SQLite often returns rows in insertion or id order, but relying on that is a classic bug — any engine, any version, may differ.",
      notes: [
        { choice: 0, why: "SQLite often *looks* like it returns insertion order — precisely why this bug survives testing. The guarantee simply doesn't exist." },
      ],
    },
    {
      id: "l1-q5",
      prompt: "Which column in `order_items` points at the product being sold?",
      choices: [
        "order_id",
        "product_id",
        "quantity",
        "unit_price",
      ],
      answer: 1,
      why: "order_items carries two foreign keys: order_id (which order) and product_id (which product). quantity and unit_price are facts about the line itself, not pointers.",
      notes: [
        { choice: 0, why: "order_id points at the *order*, not the product — each line carries two foreign keys, one per neighbor." },
      ],
    },
    {
      id: "l1-q6",
      prompt: "How many rows does the `orders` table hold in this store right now?",
      choices: ["16", "103", "251", "It changes on every page load"],
      answer: 1,
      why: "103 orders — a fixed, deterministic seed. The 251 figure belongs to order_items (order lines), and 16 to customers/products.",
      notes: [
        { choice: 2, why: "That's the order_items count — one order usually spawns several line rows, so the line table (251) is bigger than orders (103)." },
      ],
    },
    {
      id: "l1-q7",
      prompt: "One row in `order_items` represents…",
      choices: [
        "one entire order",
        "one product line inside one order",
        "one customer",
        "one day of sales",
      ],
      answer: 1,
      why: "It's the finest grain of the schema: if one order contains three different products, that's one orders row and three order_items rows.",
      notes: [
        { choice: 0, why: "The order itself lives as a single orders row — order_items zooms into its *contents*, one product line per row." },
      ],
    },
    {
      id: "l1-q8",
      prompt: "Why store the customer's name once in `customers` instead of inside every order row?",
      choices: [
        "Names are secret and must be isolated",
        "Each fact lives in exactly one place, linked by keys — no duplication, no stale copies",
        "SQLite cannot store text in two tables",
        "It makes the orders table smaller to scan, always",
      ],
      answer: 1,
      why: "That's normalization: one fact, one table. Joins (Module 2) read the structure back together at query time.",
      notes: [
        { choice: 3, why: "The win is correctness, not scan speed: one fact in one place can never go stale. Query performance depends on the join you write, not on this layout." },
      ],
    },
    {
      id: "l1-q9",
      prompt: "`suppliers.rating` holds values like 4.6 and 3.9. What kind of column is it?",
      choices: ["Text", "Integer", "Decimal number (REAL)", "A 0/1 flag"],
      answer: 2,
      why: "Ratings have fractional parts, so they're stored as REAL. Integers would round 4.6 to 5 and distort the data.",
      notes: [
        { choice: 1, why: "An INTEGER column can't hold the fraction — 4.6 would become 4 or 5. Faithful decimals need REAL (or a DECIMAL type in Postgres/MySQL)." },
      ],
    },
    {
      id: "l1-q10",
      prompt: "You need to know how many keyboards are currently in stock. Which table do you query?",
      choices: ["orders", "order_items", "products", "suppliers"],
      answer: 2,
      why: "Stock is an attribute of a product, so it lives in products.stock. Orders tell you what sold, not what's on the shelf.",
      notes: [
        { choice: 1, why: "order_items records what *sold* — what's on the shelf is an attribute of the product itself: products.stock." },
      ],
    },
    {
      id: "l1-q11",
      prompt: "`customers.active` contains 1 or 0. What is this column best described as?",
      choices: [
        "A foreign key",
        "A flag — a boolean expressed as an integer",
        "A primary key",
        "A rating",
      ],
      answer: 1,
      why: "0/1 flags are the classic way to store true/false. SQLite has no separate BOOLEAN type, so integers carry the meaning.",
      notes: [
        { choice: 0, why: "A foreign key points at another table's row — 1/0 references nothing. It's a boolean flag wearing an integer costume." },
      ],
    },
    {
      id: "l1-q12",
      prompt: "Some rows in `orders` have `shipped_at` empty (NULL). What does that mean?",
      choices: [
        "The order shipped on an unknown date",
        "The order has not shipped (yet) — the value genuinely doesn't exist",
        "The order was deleted",
        "A database error occurred",
      ],
      answer: 1,
      why: "NULL means 'no value here'. For this store it marks pending and cancelled orders — real holes in the data you'll learn to query in lesson 4.",
      notes: [
        { choice: 0, why: "'Unknown when' and 'not yet' are different facts. Here a NULL shipped_at means the order hasn't shipped — it's pending or cancelled." },
      ],
    },
  ],
  problems: [
    {
      id: "l1-p1",
      title: "Meet the suppliers",
      brief: "Return every column of every row in the `suppliers` table. No filtering, no sorting — just look at what's there.",
      hints: [
        "The star in `SELECT *` means \"all columns\" — you don't name any columns at all.",
        "Shape: SELECT * FROM <table>;",
      ],
      difficulty: "easy",
      solution: "SELECT * FROM suppliers;",
      mistakes: [
        { test: "\\bselect\\s+\\*\\s+(?!from\\b)[a-z]", message: "After SELECT * comes FROM — the table goes in its own clause: `SELECT * FROM suppliers;`." },
      ],
      expected: EXPECTED["l1-p1"],
    },
    {
      id: "l1-p2",
      title: "Browse the catalog",
      brief: "Show all columns of `products`, but only the first 8 rows.",
      hints: [
        "`LIMIT <n>` at the very end of the query caps how many rows come back.",
        "Shape: SELECT * FROM products LIMIT <n>;",
      ],
      difficulty: "easy",
      solution: "SELECT * FROM products LIMIT 8;",
      mistakes: [
        { test: "\\btop\\s+\\d+", message: "`TOP <n>` is SQL Server syntax — SQLite, PostgreSQL and MySQL all cap rows with `LIMIT <n>` at the end of the query." },
      ],
      expected: EXPECTED["l1-p2"],
    },
    {
      id: "l1-p3",
      title: "A taste of projection",
      brief: "From `customers`, return only `name` and `city` — the first 10 rows. Listing specific columns instead of `*` is called projection, and it's how every report starts.",
      hints: [
        "Projection = naming exactly the columns you want, comma-separated, right after SELECT.",
        "Shape: SELECT name, city FROM customers LIMIT <n>;",
      ],
      difficulty: "medium",
      solution: "SELECT name, city FROM customers LIMIT 10;",
      mistakes: [
        { test: "\\bselect\\s+\\*", message: "The star returns every column — the brief asks for a projection: name exactly `name` and `city`." },
      ],
      expected: EXPECTED["l1-p3"],
    },
    {
      id: "l1-p4",
      title: "The supplier register",
      brief: "From `suppliers`, return `name` and `rating` for every supplier — a first look at who we buy from.",
      hints: [
        "Two columns from suppliers — the table has only six rows, so no LIMIT is needed.",
        "Shape: SELECT name, rating FROM suppliers;",
      ],
      difficulty: "easy",
      solution: "SELECT name, rating FROM suppliers;",
      mistakes: [
        { test: "\\bselect\\s+\\*", message: "Projection again, not the star: the register wants only `name` and `rating`." },
      ],
      expected: EXPECTED["l1-p4"],
    },
    {
      id: "l1-p5",
      title: "Signup ledger",
      brief: "Return the `id` and `created_at` (signup date) of the first 8 customers. Dates are stored as text like '2023-11-02' — you'll filter on them in lesson 3.",
      hints: [
        "Dates here are plain TEXT — select them like any other column.",
        "Shape: SELECT id, created_at FROM customers LIMIT <n>;",
      ],
      difficulty: "easy",
      solution: "SELECT id, created_at FROM customers LIMIT 8;",
      mistakes: [
        { test: "\\bselect\\s+\\*", message: "Only two columns are asked for: `id` and `created_at` — not the whole customer record." },
      ],
      expected: EXPECTED["l1-p5"],
    },
    {
      id: "l1-p6",
      title: "Inventory at a glance",
      brief: "Return `name` and `stock` for every product. Scan the list by eye: the widest and narrowest shelves will jump out (you'll make the database find them in lesson 7).",
      hints: [
        "Two columns, all rows — no LIMIT, no filtering, no functions.",
        "Shape: SELECT name, stock FROM products;",
      ],
      difficulty: "easy",
      solution: "SELECT name, stock FROM products;",
      mistakes: [
        { test: "\\b(max|min|count)\\s*\\(", message: "Aggregates like MAX/MIN/COUNT collapse rows into one summary — the brief wants every product listed as-is. Finding extremes arrives in lesson 7." },
      ],
      expected: EXPECTED["l1-p6"],
    },
    {
      id: "l1-p7",
      title: "Meet the finest grain",
      brief: "Look at the first 5 rows of `order_items` — every column. Notice the two foreign keys (order_id, product_id) and the line facts (quantity, unit_price).",
      hints: [
        "Five rows, all columns, no conditions — pure observation.",
        "Shape: SELECT * FROM order_items LIMIT <n>;",
      ],
      difficulty: "easy",
      solution: "SELECT * FROM order_items LIMIT 5;",
      mistakes: [
        { test: "\\bjoin\\b", message: "No join needed — order_items is a single table. Its two foreign keys (order_id, product_id) are just plain columns you can SELECT." },
      ],
      expected: EXPECTED["l1-p7"],
    },
    {
      id: "l1-p8",
      title: "Who we buy from, where",
      brief: "Return `name` and `region` for all suppliers. Six rows — including regions you'll later compare against customer regions.",
      hints: [
        "Projection again — every supplier belongs in the register, so nothing is filtered.",
        "Shape: SELECT name, region FROM suppliers;",
      ],
      difficulty: "easy",
      solution: "SELECT name, region FROM suppliers;",
      mistakes: [
        { test: "\\bwhere\\b", message: "The brief asks for *every* supplier — a WHERE clause would silently drop rows from the register." },
      ],
      expected: EXPECTED["l1-p8"],
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "A table is a **ledger, not a screen**. A spreadsheet saves what you last looked at; a database saves what is *true*. Nothing in `orders` remembers which row you typed first, which one you colored yellow, or what order you scrolled them — it only stores facts. That austerity is the feature: every query re-derives the answer from the facts, so two people running the same query always get the same business reality.",
    },
    {
      kind: "engine",
      title: "you run SELECT * FROM orders",
      steps: [
        "**Parse** — the text is checked against SQL grammar; a typo here fails before the database is even touched.",
        "**Plan** — the engine decides *how* to read the table. `EXPLAIN QUERY PLAN` prints the decision: for this query it says `SCAN orders` — read every row.",
        "**Scan** — each row is materialized in turn. SQLite actually stores a hidden `rowid` per row — the closest thing to a physical row number, and the reason small tables *appear* ordered.",
        "**Ship** — surviving rows stream back to you in packets; the tool you use (this app, a CLI, a dashboard) renders them.",
      ],
    },
    { kind: "diagram", figure: "v1-grain-zoom" },
    {
      kind: "h",
      text: "Why grain is the first analytics decision",
    },
    {
      kind: "p",
      text: "Every number you will ever report has a grain hiding inside it. The average line in `order_items` is **138.78** — but nobody spends 138.78 on a *line*; they spend it across a *basket*. Sum line values and you get revenue: **34,833.28** across 251 lines. Now sum `orders.total` instead — different table, different grain — and you get **34,833.28** again. That agreement is not luck; it is the schema's promise that every line belongs to exactly one order. When two grains reconcile, your model is sound; when they don't, someone sold outside the ledger. Analysts who can't state the grain of their query produce numbers that *look* right and reconcile with nothing. Ask \"what is one row of my output?\" before you write SELECT, not after the CFO asks you.",
    },
    {
      kind: "myth",
      myth: "\"A table is basically a spreadsheet — rows stay where I put them, so row 3 is always row 3.\"",
      truth: "A table is an unordered **set**. Without `ORDER BY`, SQL promises zero row order. SQLite often *shows* insertion order because of how its storage works — which is exactly why this bug ships to production and explodes on a different engine or a bigger table.",
    },
    {
      kind: "myth",
      myth: "\"Copying the customer's name into every order row is faster — why look it up?\"",
      truth: "That duplication is how data **rots**: a customer renames, and 103 order rows still carry the old one. Keys + one fact in one place means a fact can never go stale. Joins (Module 2) reassemble the picture at query time — that trade is the whole relational idea.",
    },
    {
      kind: "edge",
      items: [
        { c: "SELECT * FROM nosuchtable;", r: "Error: `no such table`. The parse and plan stages happen before any row is read — wrong names fail fast and cheap." },
        { c: "SELECT * FROM orders;" , r: "Returns all 103 rows and every column — fine for looking, wasteful for reports. `SELECT *` in production code breaks the moment the schema grows a column." },
        { c: "SELECT rowid FROM customers LIMIT 3;", r: "SQLite exposes the hidden `rowid` — proof that storage has a physical idea of position that SQL's *logical* model deliberately hides from you." },
        { c: "SELECT COUNT(*) FROM order_items;", r: "**251** — the line table outgrows `orders` (103) because one order = one row *per product*. Grain, visible in a single number." },
      ],
    },
    {
      kind: "tip",
      text: "Open the Playground's **Schema** tab and read the five tables' grain aloud: one row of `customers` is one person; one row of `order_items` is one product line. Saying the grain out loud before writing a query is the cheapest debugging habit you will ever learn.",
    },
  ],
  takeaway: "A table is an unordered grid of typed rows; primary and foreign keys glue tables together — and every SELECT you'll ever write is just a question asked over that structure.",
};
