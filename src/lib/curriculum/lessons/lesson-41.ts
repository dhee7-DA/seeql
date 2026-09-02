import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson41: Lesson = {
  id: "lesson-41",
  num: 41,
  title: "INSERT — adding rows",
  blurb: "The first write: the column-list contract, multi-row inserts, INSERT INTO … SELECT and RETURNING — every write this course runs is sandboxed, so you can experiment freely",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "Six modules of reading, and not one row has changed. That ends here. The storefront has to grow — a new customer signs up, two gadgets arrive from Shenzhen, an order opens — and **INSERT** is how SQL adds rows. Writing feels different from reading: a bad SELECT wastes a moment, a bad INSERT changes the table. That's why every write you run in this course is **sandboxed** — the statement really executes, the grader sees its full effect, and then the whole change is rolled back. You get production behavior with a safety net.",
    },
    { kind: "diagram", figure: "w1-insert-map" },
    { kind: "h", text: "The two-part contract" },
    {
      kind: "bullets",
      items: [
        "`INSERT INTO table (columns…) VALUES (values…)` — the **column list** and the **value list** bind positionally: first value goes into first column, second into second, and so on.",
        "The contract is why column order doesn't matter — `INSERT INTO products (stock, name, …)` works exactly like naming stock last, as long as the values follow the same order.",
        "**Omitted columns are not errors.** Each column missing from the list receives its `DEFAULT`, or NULL when it has none — `shipped_at` left out of an orders insert is simply NULL, which is what a not-yet-shipped order wants.",
        "Several rows in one statement: `VALUES (…), (…), (…)` — either all of them land or none do. It's one statement, one unit of work.",
      ],
    },
    {
      kind: "code",
      caption: "A new customer — and RETURNING echoes what landed",
      sql: `INSERT INTO customers (name, email, city, region, active, created_at)
VALUES ('Tara Singh', 'tara.singh@example.com', 'Mumbai', 'APAC', 1, '2026-01-05')
RETURNING id, name;   -- id 17: chosen by the engine, not by you`,
    },
    {
      kind: "bullets",
      items: [
        "No `id` in the list — `customers.id` is an `INTEGER PRIMARY KEY`, SQLite's rowid alias: omit it and the engine assigns **max(id) + 1**, which is 17 here. Name the column explicitly and you're claiming the number yourself — useful for imports, dangerous when you guess wrong.",
        "`RETURNING …` (SQLite 3.35+) makes a write answer back: the rows it inserted, updated or deleted, computed **after** the change. A write that returns rows grades exactly like a SELECT.",
      ],
    },
    { kind: "h", text: "INSERT INTO … SELECT — rows from a query" },
    {
      kind: "code",
      caption: "Clone every Apparel product into a clearance shelf — one statement, no literals",
      sql: `INSERT INTO products (name, category, price, stock, supplier_id)
SELECT name || ' (Clearance)', category, 9.99, 0, supplier_id
FROM products
WHERE category = 'Apparel'
RETURNING id, name;   -- 2 rows: the two apparel items, re-priced`,
    },
    {
      kind: "bullets",
      items: [
        "The value list is replaced by a SELECT whose columns map onto the same column list — the insert lands exactly as many rows as the SELECT returns: zero SELECT rows means zero inserts, silently.",
        "Expressions are welcome in the SELECT list: `name || ' (Clearance)'` builds each new name on the fly, the way Module 5 built display strings.",
      ],
    },
    {
      kind: "warn",
      text: "Always write the column list. `INSERT INTO products VALUES (…)` binds values to columns by the table's *current* definition — add one column next month and every old insert silently shifts its meaning. The explicit list turns a silent shift into a loud column-count error, which is what you want.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL has no `RETURNING` — after an insert you ask for `LAST_INSERT_ID()` in a separate statement. Multi-row `VALUES (…), (…)` and `INSERT INTO … SELECT` work the same way.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "PostgreSQL's INSERT matches SQLite shape for shape here — column list, multi-row VALUES, INSERT INTO … SELECT, and RETURNING (which Postgres has had for far longer).",
    },
    {
      kind: "tip",
      text: "In this course the grader rolls every write back — so after solving, press Run again with a plain `SELECT` to see the pre-insert state return. In production that reset needs a transaction (lesson 44) or a real commit.",
    },
  ],
  mcqs: [
    {
      id: "l41-q1",
      prompt: "`INSERT INTO products (name, price) VALUES ('Pen', 2.5, 7)` — what happens?",
      choices: [
        "It inserts with stock NULL",
        "The third value is discarded",
        "An error — 2 values listed for 3 supplied",
        "It inserts 3 rows",
      ],
      answer: 2,
      why: "The column list and the VALUES list must have the same length — two columns can't receive three values, and SQLite refuses the statement. The lists bind positionally, so length and order both matter.",
      notes: [
        { choice: 0, why: "Omitted *columns* get defaults — but that's about the column list, not about extra values. An extra VALUE has nowhere to go and is an error." },
      ],
    },
    {
      id: "l41-q2",
      prompt: "An orders insert names only `(customer_id, status, total, created_at)`. What does `shipped_at` hold afterward?",
      choices: [
        "The current date — engines fill timestamps",
        "NULL — no DEFAULT exists on that column",
        "An error — every column must be listed",
        "Zero, as an empty date",
      ],
      answer: 1,
      why: "shipped_at has no DEFAULT clause in the schema, so an omitted insert leaves it NULL — which is exactly right for an order that hasn't shipped. Columns with DEFAULTs get their default instead.",
      notes: [
        { choice: 2, why: "Only the columns with no default and no NULL allowance force your hand. shipped_at is nullable by design — that's what the lesson-1 schema table meant by `shipped_at TEXT` (no NOT NULL)." },
      ],
    },
    {
      id: "l41-q3",
      prompt: "The orders table holds ids 1–103. `INSERT INTO orders (customer_id, status, total, created_at) VALUES (3, 'pending', 0, '2026-01-05')` — what id does the new row get?",
      choices: ["1 — ids restart", "103 — ids are reused", "104 — max(id) + 1", "NULL — id was omitted"],
      answer: 2,
      why: "INTEGER PRIMARY KEY is a rowid alias: omit it and SQLite assigns max(id) + 1. With 103 orders the next id is 104. Ids are never reused, and the assignment is the engine's job precisely so two writers can't collide.",
      notes: [
        { choice: 3, why: "The column is NOT NULL by construction — a rowid alias can never be NULL. Omit it and you get the next number, not a hole." },
      ],
    },
    {
      id: "l41-q4",
      prompt: "`INSERT INTO products (…) SELECT … FROM products WHERE category = 'Apparel'` — how many rows land if the SELECT returns 2 rows?",
      choices: ["Always 1 — one statement, one row", "2 — one per SELECT row", "0 — INSERT … SELECT is invalid", "Depends on a LIMIT default"],
      answer: 1,
      why: "INSERT INTO … SELECT inserts exactly the rows the SELECT produces — here the two apparel products become two new rows. A SELECT returning zero rows inserts zero rows, without error.",
      notes: [
        { choice: 0, why: "That's plain INSERT with a literal VALUES list — one statement, one row. The SELECT form is a small pipeline, and its output row count is the insert count." },
      ],
    },
    {
      id: "l41-q5",
      prompt: "Why prefer `INSERT INTO products (name, price, stock) VALUES (…)` over `INSERT INTO products VALUES (…)`?",
      choices: [
        "It runs faster — fewer columns to bind",
        "The explicit list survives schema changes; the bare form silently shifts values onto the wrong columns",
        "The bare form is invalid SQL",
        "No difference — both are identical contracts",
      ],
      answer: 1,
      why: "The bare form binds by the table's current column order. When someone adds a column next month, old bare-form inserts shift meanings quietly — the explicit list turns that into a loud column-count error instead of corrupt data.",
      notes: [
        { choice: 3, why: "They're the same contract only until the table definition changes — which is exactly the moment the distinction stops being cosmetic." },
      ],
    },
  ],
  problems: [
    {
      id: "l41-p1",
      title: "Tara signs up",
      brief: "A new customer signs up on **2026-01-05**: **Tara Singh**, email **tara.singh@example.com**, city **Mumbai**, region **APAC**, active. Insert her and let the engine pick the id — echo back `id` and `name` with RETURNING.",
      hints: [
        "Name every column except id — the INTEGER PRIMARY KEY assigns itself as max(id) + 1.",
        "Shape: INSERT INTO customers (name, email, city, region, active, created_at) VALUES (…) RETURNING id, name;",
      ],
      difficulty: "easy",
      solution: "INSERT INTO customers (name, email, city, region, active, created_at)\nVALUES ('Tara Singh', 'tara.singh@example.com', 'Mumbai', 'APAC', 1, '2026-01-05')\nRETURNING id, name;",
      mistakes: [
        { test: "into customers values", message: "You dropped the column list — it binds by the table's current column order and breaks the moment the schema moves. Name the columns explicitly." },
        { test: "'(us|latam|eu)'", message: "Wrong region — the brief says APAC; Mumbai sits in the APAC region like Farid, Grace, Hiro and Maya." },
        { test: "values\\s*\\(\\s*17\\s*,", message: "Don't claim id 17 yourself — omit the id column and let the INTEGER PRIMARY KEY assign max(id) + 1. Guessing ids is how imports collide." },
      ],
      expected: EXPECTED["l41-p1"],
    },
    {
      id: "l41-p2",
      title: "Two gadgets arrive",
      brief: "A Shenzhen delivery lands: **USB-C Dock Duo** (Electronics, 39.99, stock 60, supplier 2) and **HDMI Cable 3m** (Accessories, 9.99, stock 200, supplier 2). Insert **both in one statement**, echoing `id` and `name`.",
      hints: [
        "Multi-row VALUES: one INSERT, two value groups separated by a comma.",
        "Shape: INSERT INTO products (name, category, price, stock, supplier_id) VALUES (…), (…) RETURNING id, name;",
      ],
      difficulty: "easy",
      solution: "INSERT INTO products (name, category, price, stock, supplier_id)\nVALUES ('USB-C Dock Duo', 'Electronics', 39.99, 60, 2),\n       ('HDMI Cable 3m', 'Accessories', 9.99, 200, 2)\nRETURNING id, name;",
      mistakes: [
        { test: "insert into products values", message: "Missing column list again — the products table has six columns and you're naming five values per row; the bare form can't even parse, and wouldn't survive a schema change anyway." },
        { test: "\\bid\\s*,", message: "Listing id claims the numbers yourself — omit it and the engine hands out 17 and 18 automatically as max(id) + 1." },
        { test: "supplier_id\\s*=\\s*1\\b|,\\s*1\\s*\\)", message: "Check the supplier — the brief says supplier 2 (Shenzhen Electro). The trailing 1 would wire both products to Nordic Gadgets." },
      ],
      expected: EXPECTED["l41-p2"],
    },
    {
      id: "l41-p3",
      title: "The clearance shelf",
      brief: "Marketing wants a clearance mirror of the catalog: for **every Apparel product**, insert a new row named `<original name> (Clearance)` priced **9.99** with **0 stock**, keeping the category and supplier. One INSERT INTO … SELECT, echoing `id` and `name`.",
      hints: [
        "The VALUES list becomes a SELECT — its expressions build each row; keep the same column list on the INSERT side.",
        "Shape: INSERT INTO products (name, category, price, stock, supplier_id) SELECT name || ' (Clearance)', category, 9.99, 0, supplier_id FROM products WHERE category = 'Apparel' RETURNING id, name;",
      ],
      difficulty: "medium",
      solution: "INSERT INTO products (name, category, price, stock, supplier_id)\nSELECT name || ' (Clearance)', category, 9.99, 0, supplier_id\nFROM products\nWHERE category = 'Apparel'\nRETURNING id, name;",
      mistakes: [
        { test: "\\bvalues\\b", message: "INSERT … SELECT has no VALUES keyword — the SELECT itself supplies the rows. Mixing both is a syntax error." },
        { test: "\\bjoin\\b", message: "No join needed — name, category and supplier_id all live on products. One table, one scan." },
        { test: "'apparel \\( clearance \\)'", message: "The suffix belongs to the product NAME, not the category: name || ' (Clearance)' builds 'Running Socks 3-pack (Clearance)'. Category stays 'Apparel'." },
      ],
      expected: EXPECTED["l41-p3"],
    },
    {
      id: "l41-p4",
      title: "An order opens",
      brief: "Customer 3 (**Chloe Dubois**) starts an order on **2026-01-05**: status **pending**, total **0** (nothing rung up yet), and `shipped_at` must be **explicitly NULL**. Insert it and echo `id`, `status`, `shipped_at`.",
      hints: [
        "Five columns on the insert side; NULL is spelled out as a literal in the VALUES list.",
        "Shape: INSERT INTO orders (customer_id, status, total, created_at, shipped_at) VALUES (3, 'pending', 0, '2026-01-05', NULL) RETURNING id, status, shipped_at;",
      ],
      difficulty: "medium",
      solution: "INSERT INTO orders (customer_id, status, total, created_at, shipped_at)\nVALUES (3, 'pending', 0, '2026-01-05', NULL)\nRETURNING id, status, shipped_at;",
      mistakes: [
        { test: "'(delivered|shipped|cancelled)'", message: "Wrong status — a just-opened order is 'pending'; the other three describe later stages of its life." },
        { test: "\\( customer_id , status , total , created_at \\)", message: "You dropped shipped_at from the column list. Omitting it would also store NULL — but the brief asks for the explicit NULL so the intent survives any future DEFAULT being added." },
        { test: "'null'", message: "Quoted 'NULL' is the four-letter string, not the value. Bare NULL — no quotes — is the missing marker." },
      ],
      expected: EXPECTED["l41-p4"],
    },
  ],
  takeaway: "INSERT is a contract: an explicit column list bound to values positionally — omitted columns take their DEFAULT, INTEGER PRIMARY KEY assigns itself, and RETURNING makes the write show its work.",
};
