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
    {
      id: "l41-q6",
      prompt: "The two-product gadgets insert runs with `RETURNING id, name`. How many rows come back?",
      choices: [
        "1 — writes answer with a single summary row",
        "2 — one echo per landed row",
        "0 — writes don't return rows",
        "16 — the whole table afterward",
      ],
      answer: 1,
      why: "RETURNING reports one row per row the statement wrote — two inserted products, two echoes with their engine-assigned ids 17 and 18. A multi-row insert isn't one opaque event; RETURNING makes each landed row visible.",
      notes: [
        { choice: 0, why: "There is no summary-row protocol — the result set is just the requested columns of every written row, in landing order." },
      ],
    },
    {
      id: "l41-q7",
      prompt: "An import script writes `INSERT INTO customers (id, name, email, city, region, active, created_at) VALUES (200, 'Bulk Co', …)`. What happens?",
      choices: [
        "Refused — only the engine may assign ids",
        "It lands as id 200 — claiming an id is legal, just risky",
        "It lands as id 17 — the engine overrides the supplied id",
        "It lands with id NULL until an UPDATE sets it",
      ],
      answer: 1,
      why: "Naming the id claims it: if 200 is free, the row lands there exactly as written. The risk is arithmetic — the next omitted-id insert continues from max(id) + 1, now 201 — and collisions when two importers claim the same number. Claiming is a tool, not an error.",
      notes: [
        { choice: 2, why: "The engine only assigns when you OMIT the column. Supply it and your number wins — SQLite treats your value as data, not a suggestion." },
      ],
    },
    {
      id: "l41-q8",
      prompt: "`INSERT INTO products (…) SELECT … FROM products WHERE category = 'Archived'` — and no product is archived. Result?",
      choices: [
        "An error — inserts require at least one row",
        "One empty placeholder row lands",
        "Zero rows land, no error — the statement did exactly what the SELECT told it",
        "The last inserted row is repeated",
      ],
      answer: 2,
      why: "INSERT … SELECT lands exactly the SELECT's output — zero rows means zero inserts, quietly. That's a feature: idempotent feeds can run daily, inserting nothing new without ceremony. The affected-row count (0) is the receipt.",
      notes: [
        { choice: 0, why: "Nothing in SQL requires an insert to be non-empty — the VALUES form always has rows, but the SELECT form simply mirrors whatever the query produced." },
      ],
    },
    {
      id: "l41-q9",
      prompt: "Tara's insert succeeds. A second INSERT arrives with the same email, `tara.singh@example.com`, but a different id. What does the engine do?",
      choices: [
        "Refuses it — emails are unique by default",
        "Refuses it — the row differs only in id, which isn't enough",
        "Lands it — the schema never declared UNIQUE on email, so the engine enforces nothing",
        "Lands it and NULLs the first row's email",
      ],
      answer: 2,
      why: "The storefront's CREATE TABLE never promised email uniqueness — this schema's only constraints are NOT NULL and the FK fences. Duplicate emails land silently. Lesson 45's UNIQUE and lesson 48's CREATE UNIQUE INDEX are how the promise gets made structural.",
      notes: [
        { choice: 0, why: "No such default exists — uniqueness is opt-in per column. Engines enforce the contract as written, never the contract you assumed." },
      ],
    },
    {
      id: "l41-q10",
      prompt: "A three-row VALUES insert completes. What does the affected-row count report?",
      choices: ["1 — one statement", "3 — one per landed row", "0 — inserts don't count", "16 — the table's new size"],
      answer: 1,
      why: "The count is rows, not statements: three VALUES groups land three rows, changes = 3. That count is what the grader compares first on change-graded problems, and what a production feed checks to know the shipment actually landed.",
      notes: [
        { choice: 0, why: "One statement, but the counter's unit is rows — RETURNING shows them, changes counts them. Both scale with the VALUES list." },
      ],
    },
    {
      id: "l41-q11",
      prompt: "`VALUES ('Desk Mat XL', 19.99 * 2)` — what does the engine store in price?",
      choices: [
        "The literal text '19.99 * 2'",
        "19.99 — expressions are truncated to their first term",
        "39.98 — the expression is computed, then stored",
        "NULL — arithmetic isn't allowed in VALUES",
      ],
      answer: 2,
      why: "VALUES accepts any expression, not just literals — the arithmetic runs once per row and the computed result lands. The same freedom builds names with ||, dates with date(…), or prices from CASE logic, exactly like the SELECT expressions from Module 5.",
      notes: [
        { choice: 0, why: "VALUES is an expression list, not a text field — the engine computes 19.99 * 2 before storing. Only the INSERT … SELECT form pulls values from other tables; everything scalar computes right here." },
      ],
    },
    {
      id: "l41-q12",
      prompt: "What does `RETURNING *` give you that `RETURNING id` doesn't?",
      choices: [
        "The rows other customers inserted at the same moment",
        "Every column of the landed rows — defaults filled, engine-assigned id included",
        "The statement's affected count instead of rows",
        "The table's schema definition",
      ],
      answer: 1,
      why: "RETURNING * echoes the complete after-state of each written row: your supplied columns, the engine-assigned id, and every omitted column's DEFAULT applied. It's the cheapest audit trail a write can carry — the row exactly as it now exists.",
      notes: [
        { choice: 0, why: "RETURNING is scoped to the rows YOUR statement wrote — other connections' work never appears in your echo." },
      ],
    },
    {
      id: "l41-q13",
      prompt: "An INSERT carries `RETURNING id, name` but the write is rejected by a NOT NULL constraint. What does RETURNING echo?",
      choices: [
        "The attempted values anyway — echoes fire before constraints",
        "Nothing — the statement wrote no rows, so there is nothing to return",
        "An empty string per column",
        "The constraint's error text as a row",
      ],
      answer: 1,
      why: "RETURNING's contract is rows the statement WROTE. A rejected insert wrote zero rows — the echo is empty and the error is raised. The receipt printer only prints what actually landed; constraints fire before any row exists to echo.",
      notes: [
        { choice: 0, why: "No pre-echo exists — RETURNING reads the after-state of written rows. Nothing written, nothing echoed." },
      ],
    },
    {
      id: "l41-q14",
      prompt: "Which statement both archives the 7 cancelled orders to a side table AND echoes what moved — in one statement each?",
      choices: [
        "`INSERT INTO cancelled_orders SELECT * FROM orders WHERE status = 'cancelled' RETURNING id;` then `DELETE FROM orders WHERE status = 'cancelled';`",
        "`DELETE FROM orders WHERE status = 'cancelled' SAVE id;`",
        "`MOVE orders TO cancelled_orders WHERE status = 'cancelled' RETURNING id;`",
        "`SELECT * FROM orders WHERE status = 'cancelled' INTO cancelled_orders;`",
      ],
      answer: 0,
      why: "Two writes, each with its own receipt: the INSERT … SELECT carries RETURNING for the archived rows, the DELETE follows (its own RETURNING could echo the removals). SQL has no MOVE — archive-and-purge is spelled as two statements, ideally inside one transaction.",
      notes: [
        { choice: 2, why: "MOVE isn't SQL — the archive is an INSERT … SELECT plus a DELETE. Wrapping both in BEGIN…COMMIT makes the pair all-or-nothing." },
      ],
    },
    {
      id: "l41-q15",
      prompt: "A multi-row insert writes 2 rows; the second violates a UNIQUE constraint. What does the client see?",
      choices: [
        "One row echoed (the first) and a warning",
        "Both rows rolled back — the statement fails atomically, nothing echoes",
        "The first row committed, the second dropped",
        "Both rows inserted with a constraint flag",
      ],
      answer: 1,
      why: "A statement is atomic: one bad VALUES row fails the WHOLE insert — no partial landing, no echo. The engine-verified pattern from the drills: multi-row writes are all-or-nothing, which is why RETURNING's echo only ever shows fully committed rows.",
      notes: [
        { choice: 2, why: "Partial applies need the rows split into separate statements (or INSERT OR IGNORE, which skips bad rows on purpose) — a single INSERT never half-lands." },
      ],
    },
    {
      id: "l41-q16",
      prompt: "`INSERT INTO products … RETURNING id` echoes id 17. A colleague calls that \"the next id forever.\" What's the honest correction?",
      choices: [
        "Correct — ids are monotonic and gapless",
        "It's the next unused rowid — after a DELETE of the max row, that id can be reused; gaps can appear",
        "It's random",
        "It's the row count plus one",
      ],
      answer: 1,
      why: "The engine assigns max(rowid) + 1 among UNUSED ids — delete the highest row and its id becomes eligible again, so sequences can reuse and gap. The engine-verified roster: 16 products, so a fresh insert echoes 17 — but that's the current maximum, not a promise.",
      notes: [
        { choice: 0, why: "Monotonic-and-gapless is SEQUENCE behavior in other engines — SQLite's rowid assignment is next-unused, which reuses after max-row deletes." },
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
      mutating: true,
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
        { test: "\\(id\\s*,|,\\s*id\\s*,", message: "Listing id claims the numbers yourself — omit it and the engine hands out 17 and 18 automatically as max(id) + 1." },
        { test: "supplier_id\\s*=\\s*1\\b|,\\s*1\\s*\\)", message: "Check the supplier — the brief says supplier 2 (Shenzhen Electro). The trailing 1 would wire both products to Nordic Gadgets." },
      ],
      mutating: true,
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
      mutating: true,
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
      mutating: true,
      expected: EXPECTED["l41-p4"],
    },
    {
      id: "l41-p5",
      title: "A supplier joins the roster",
      brief: "Procurement onboards a new vendor: **Shenzhen Nano Works**, region **APAC**, rating **4.2**. Insert it (the suppliers table has no dates to fake) and echo `id` and `name` with RETURNING.",
      hints: [
        "Three columns matter — name, region, rating. The id assigns itself as max(id) + 1.",
        "Shape: INSERT INTO suppliers (name, region, rating) VALUES ('Shenzhen Nano Works', 'APAC', 4.2) RETURNING id, name;",
      ],
      difficulty: "easy",
      solution: "INSERT INTO suppliers (name, region, rating)\nVALUES ('Shenzhen Nano Works', 'APAC', 4.2)\nRETURNING id, name;",
      mistakes: [
        { test: "insert into suppliers values", message: "Bare-form insert binds by the table's column order — name every column explicitly so the contract survives future schema edits." },
        { test: "values \\(\\s*7\\s*,", message: "Don't claim id 7 yourself — six suppliers exist, so omitting the id column gets you 7 the engine-sanctioned way." },
        { test: "'(us|eu|latam)'", message: "Wrong region — the vendor name says Shenzhen, and Shenzhen sits in APAC beside Shenzhen Electro." },
      ],
      mutating: true,
      expected: EXPECTED["l41-p5"],
    },
    {
      id: "l41-p6",
      title: "Win-back campaign orders",
      brief: "Marketing opens a **pending**, zero-total order dated **2026-01-06** for every **inactive** customer, using one INSERT INTO … SELECT over the customers table. Echo `customer_id` with RETURNING — both inactive customers should surface.",
      hints: [
        "The VALUES list becomes a SELECT: filter customers WHERE active = 0, and select the literals plus each id.",
        "Shape: INSERT INTO orders (customer_id, status, total, created_at) SELECT id, 'pending', 0, '2026-01-06' FROM customers WHERE active = 0 RETURNING customer_id;",
      ],
      difficulty: "medium",
      solution: "INSERT INTO orders (customer_id, status, total, created_at)\nSELECT id, 'pending', 0, '2026-01-06'\nFROM customers\nWHERE active = 0\nRETURNING customer_id;",
      mistakes: [
        { test: "where\\s+active\\s*=\\s*1", message: "Inverted flag — active = 0 finds the two dormant accounts (Dmitri Volkov, Keiko Sato). The win-back targets people NOT buying." },
        { test: "\\bvalues\\b", message: "INSERT … SELECT has no VALUES keyword — the SELECT supplies the rows. You can't hard-code two customers when the criterion should find them." },
        { test: "returning\\s+id\\s*;|returning\\s+\\*\\s*;", message: "The echo the brief wants is customer_id — RETURNING id would show the new orders' own ids (104, 105), useful but not the campaign's join key." },
      ],
      mutating: true,
      expected: EXPECTED["l41-p6"],
    },
    {
      id: "l41-p7",
      title: "The desk-mat bundle price",
      brief: "Merchandising lists **Desk Mat XL** (Accessories) priced at **twice 19.99** — write the VALUES entry as the expression `19.99 * 2` so the math is auditable — stock **80**, supplier **4** (Midwest Hardware Co). Echo `name` and `price`.",
      hints: [
        "Expressions are welcome in VALUES — the engine computes 19.99 * 2 before landing the row.",
        "Shape: INSERT INTO products (name, category, price, stock, supplier_id) VALUES ('Desk Mat XL', 'Accessories', 19.99 * 2, 80, 4) RETURNING name, price;",
      ],
      difficulty: "easy",
      solution: "INSERT INTO products (name, category, price, stock, supplier_id)\nVALUES ('Desk Mat XL', 'Accessories', 19.99 * 2, 80, 4)\nRETURNING name, price;",
      mistakes: [
        { test: "39\\.98(?!,)", message: "Pre-computing in your head hides the arithmetic — the brief wants the expression `19.99 * 2` in the VALUES list so the audit trail shows where the price came from." },
        { test: "supplier_id\\s*,\\s*2\\s*\\)", message: "Wrong supplier — Midwest Hardware Co is supplier 4; supplier 2 is Shenzhen Electro, a different shelf entirely." },
        { test: "'electronics'|'fitness'|'wearables'", message: "Wrong category — desk mats are Accessories, the same shelf as the 3,294.29-revenue bin, not Electronics." },
      ],
      mutating: true,
      expected: EXPECTED["l41-p7"],
    },
    {
      id: "l41-p8",
      title: "Preview the ids before the write",
      brief: "Read-before-write discipline: in one SELECT, report `next_customer_id` and `next_order_id` — each as `MAX(id) + 1` pulled with a scalar subquery. Today the answers are 17 and 104; the write in problem 1 will consume exactly these.",
      hints: [
        "Two scalar subqueries in the SELECT list, no FROM needed on the outer query.",
        "Shape: SELECT (SELECT MAX(id) + 1 FROM customers) AS next_customer_id, (SELECT MAX(id) + 1 FROM orders) AS next_order_id;",
      ],
      difficulty: "easy",
      solution: "SELECT (SELECT MAX(id) + 1 FROM customers) AS next_customer_id,\n       (SELECT MAX(id) + 1 FROM orders) AS next_order_id;",
      mistakes: [
        { test: "count\\s*\\(\\s*\\*\\s*\\)\\s*\\+\\s*1", message: "COUNT + 1 guesses the next id — holes in the id sequence (deleted rows) make MAX(id) + 1 the only honest arithmetic. Here they agree, but only MAX survives a table with gaps." },
        { test: "from\\s+customers\\s+order", message: "No need to fetch rows and eyeball — the scalar subquery computes MAX(id) + 1 inline, one value per table, no FROM on the outer SELECT required." },
        { test: "\\b104\\b(?!,)", message: "Hard-coding 104 bakes today's answer into the query — derive it with MAX(id) + 1 so tomorrow's run gets 105 on its own." },
      ],
      expected: EXPECTED["l41-p8"],
    },
  ],
  takeaway: "INSERT is a contract: an explicit column list bound to values positionally — omitted columns take their DEFAULT, INTEGER PRIMARY KEY assigns itself, and RETURNING makes the write show its work.",
  deep: [
    {
      kind: "mind",
      text: "INSERT is a **column-list contract**: you name the columns you're providing, bind values positionally, and every column you OMIT takes its own default — which is NULL unless the schema says otherwise. The contract reading matters more than the syntax: `INSERT INTO orders (customer_id, status, total, created_at)` is a promise \"I am supplying exactly these four\"; the engine verifies types and constraints against the promise, and id — the INTEGER PRIMARY KEY — assigns itself. RETURNING (SQLite 3.35+) closes the loop: the write shows its work, handing back the generated ids and defaults so the app doesn't guess. Every mass-import bug story starts with someone trusting positional VALUES without the explicit column list.",
    },
    {
      kind: "engine",
      title: "you run INSERT INTO products (name, category, price, stock, supplier_id) VALUES ('Widget', 'tools', 19.99, 5, 2) RETURNING id, stock",
      steps: [
        "**Parse & bind** — the column list (5 names) must match the VALUES tuple (5 values); a mismatch is an immediate error, before any constraint fires.",
        "**Default fill** — omitted columns (id) take defaults: INTEGER PRIMARY KEY allocates max(rowid)+1; NOT NULL columns without defaults would reject the row here.",
        "**Constraint pass** — CHECKs, NOT NULLs, and the FK supplier_id → suppliers(id) are verified; a bad supplier_id aborts the statement atomically.",
        "**RETURNING** — the engine streams back the stored row (post-defaults): id 17, stock 5. Read-before-you-believe, now built into the write.",
      ],
    },
    {
      kind: "myth",
      myth: "\"INSERT INTO orders VALUES (…) without a column list is fine — it's shorter.\"",
      truth: "The bare form binds positionally against the **table's current column order** — one ALTER TABLE or a schema drift later, silently wrong columns get filled. The explicit list is not verbosity; it's the version-proof form.",
    },
    {
      kind: "edge",
      items: [
        { c: "Omitting a NOT NULL column", r: "Reject: the default is NULL and the constraint refuses. The error names the column — read it, don't shotgun a value in." },
        { c: "Multi-row VALUES", r: "INSERT … VALUES (…), (…) is one statement, one transaction, one constraint pass per row — and it fails ATOMICALLY here (this course runs it rolled back). Partial imports can't leak." },
        { c: "INSERT … SELECT", r: "The VALUES tuple can be a whole SELECT — copying rows is still the same contract. Fan-out applies: the SELECT's grain is what lands in the table." },
        { c: "Explicit id collisions", r: "Force id = 5 twice and the second INSERT hits the PK constraint. Also: explicit rowids above the auto-counter shift future auto-allocation — know the interaction before hand-seeding ids." },
      ],
    },  ],
};
