// Keyword Mastery bank MCQs — INSERT (10). Prose-tagged by the census
// (sql side is empty for MCQs), so every prompt/why carries the keyword
// wording. Six-aspect variety: syntax / semantics / edge cases / errors /
// predict-the-output / judgment calls. Figures verified by
// scripts/m7-facts.ts + m7-facts2.ts on fresh copies of the seed db.
import type { Mcq } from "../types";

export const insertMcqs: Mcq[] = [
  {
    id: "kb-wi-q01", difficulty: "easy",
    prompt: "Which INSERT adds a new supplier exactly as the schema wants it?",
    choices: [
      "`INSERT INTO suppliers (name, region, rating) VALUES ('Future Goods', 'APAC', 3.5);`",
      "`INSERT suppliers SET name = 'Future Goods';`",
      "`ADD ROW TO suppliers ('Future Goods', 'APAC', 3.5);`",
      "`INSERT INTO suppliers VALUES ('Future Goods');`",
    ],
    answer: 0,
    why: "INSERT names the table, lists the columns being supplied, then pairs each row of VALUES with them. The id is left out on purpose — SQLite assigns 7, the next free id. The other three aren't SQLite grammar: MySQL's INSERT SET dialect, a fantasy ADD ROW, and a VALUES list that doesn't match the three NOT NULL columns (id is optional, but name/region/rating all must appear).",
    notes: [{ choice: 3, why: "Omitting the column list means VALUES must cover every column in table order — suppliers has 4 columns (id included), so a 1-value row fails the count." }],
  },
  {
    id: "kb-wi-q02", difficulty: "easy",
    prompt: "`INSERT INTO products (name, category, price, supplier_id) VALUES ('Echo Pad', 'Electronics', 19.99, 1)` — what stock does the new row carry?",
    choices: ["NULL — it was never supplied", "0 — the column's DEFAULT", "The statement errors", "-1, a sentinel for unset"],
    answer: 1,
    why: "stock is declared `INTEGER NOT NULL DEFAULT 0`, so an INSERT that skips it gets 0. The engine receipt: the probe row landed with stock 0 and id 17. DEFAULTs are the schema filling in the blanks you didn't — reading the DDL before writing rows is the habit that prevents surprises.",
    notes: [{ choice: 0, why: "DEFAULT 0 means the row is never NULL — the default fires precisely so the NOT NULL can't be violated." }],
  },
  {
    id: "kb-wi-q03", difficulty: "easy",
    prompt: "You INSERT into customers without naming an id. How does SQLite pick one?",
    choices: [
      "Random id from the free pool",
      "max(id) + 1 — one past the current highest",
      "Id 1, reusing the lowest slot",
      "It errors — id is mandatory",
    ],
    answer: 1,
    why: "customers.id is INTEGER PRIMARY KEY (an alias for the rowid), so a missing id takes the next free one: 16 customers exist, max id 16, so the probe insert landed as id 17. On a table where you earlier inserted an explicit id 500, the next automatic id would be 501 — the engine counts from the peak, not the count.",
    notes: [{ choice: 2, why: "Rowids are never reused while the table still remembers higher watermarks — a fresh row would collide with existing customers, not fill a gap." }],
  },
  {
    id: "kb-wi-q04", difficulty: "medium",
    prompt: "Why do careful INSERTs spell the column list even when it's optional?",
    choices: [
      "It makes the statement run faster",
      "So the VALUES only bind positionally to the columns you named — schema changes and column reorders can't silently corrupt the row",
      "SQLite requires the list since 3.35",
      "It disables constraint checking for the row",
    ],
    answer: 1,
    why: "`INSERT INTO products VALUES (...)` binds values to table order; if a column is added or reordered, the same statement quietly writes data into the wrong columns. Naming columns (`name, category, price, supplier_id`) makes the statement self-documenting and reorder-proof. No speed difference, no constraint change — it's correctness insurance.",
  },
  {
    id: "kb-wi-q05", difficulty: "medium",
    prompt: "This two-row INSERT hits a UNIQUE violation on the second row. What lands in the table?",
    choices: [
      "Row 1 only — the statement stops at the error",
      "Both rows — SQLite keeps what it could",
      "Nothing — a multi-row VALUES INSERT is one atomic statement",
      "Row 2 only — the engine retries it",
    ],
    answer: 2,
    why: "One statement is one unit of work: the engine receipt shows a 2-row products INSERT with a colliding id on row 2 failing entirely — changes 0, nothing persisted. Statement atomicity is the reason a batch load either lands whole or not at all, and it's the smallest unit the transaction model builds on.",
    notes: [{ choice: 0, why: "That's MySQL's default with non-transactional engines — SQLite rolls the whole statement back, including the row that would have fit." }],
  },
  {
    id: "kb-wi-q06", difficulty: "medium",
    prompt: "Which statement copies every Fitness product as a new restock row — without retyping values?",
    choices: [
      "`INSERT INTO products (name, category, price, stock, supplier_id) SELECT name || ' (restock)', category, price, stock, supplier_id FROM products WHERE category = 'Fitness';`",
      "`COPY products TO products WHERE category = 'Fitness';`",
      "`INSERT products SELECT * FROM products WHERE category = 'Fitness';` (as-is)",
      "`INSERT INTO products (name) VALUES (SELECT name FROM products WHERE category = 'Fitness');`",
    ],
    answer: 0,
    why: "INSERT … SELECT feeds existing rows straight in: the probe copied the lone Fitness product into id 17 as 'Yoga Mat Eco 6mm (restock)'. The column lists line up one-to-one, and the id column is omitted so fresh ids are assigned. Choice 3 would collide on ids (a copy keeps the same id); choice 4 supplies one column from a multi-column source.",
  },
  {
    id: "kb-wi-q07", difficulty: "hard",
    prompt: "`INSERT INTO products (name, price, supplier_id) VALUES ('NoCat', 9.99, 1)` — what happens, exactly?",
    choices: [
      "The row lands with category = NULL",
      "The row lands with category = '' (empty string)",
      "Error: NOT NULL constraint failed: products.category",
      "The row lands and category is auto-filled from the most common value",
    ],
    answer: 2,
    why: "category is declared NOT NULL with no DEFAULT, so omitting it is a constraint failure, not a NULL write: the engine receipt is literally `NOT NULL constraint failed: products.category`. The fix is to supply a value or give the column a DEFAULT. Predict-the-output habit: read the DDL's NOT NULL / DEFAULT pairs before you write.",
    notes: [{ choice: 1, why: "Empty string is a value — a very different thing from missing. SQLite distinguishes them sharply; only DEFAULT (or NULL on a nullable column) fills an unlisted column." }],
  },
  {
    id: "kb-wi-q08", difficulty: "medium",
    prompt: "Seed db has 103 orders. `INSERT INTO orders (customer_id, status, total, created_at) VALUES (1, 'pending', 88.50, '2026-01-15')` — the new order's id is…",
    choices: ["1", "17", "103", "104"],
    answer: 3,
    why: "orders.id is AUTOINCREMENT with the watermark at 103 (the highest id ever used), so the next row takes 104 — the probe's RETURNING id confirmed exactly that. The count (103) and the next id (104) coincide here, but only because the seed never deleted an order; after deletes, the next id keeps climbing past the peak.",
    notes: [{ choice: 2, why: "103 is the current max — the new row gets one past it, not the max itself. Ids are identities, not counts." }],
  },
  {
    id: "kb-wi-q09", difficulty: "hard",
    prompt: "You need three new rows where one is a duplicate of an existing id, and the other two must land regardless. What's the honest design?",
    choices: [
      "One 3-row INSERT — atomicity handles it",
      "Two separate INSERTs for the good rows, and let the bad one fail in the same statement",
      "Three separate statements (or ON CONFLICT DO NOTHING), so a single collision can't veto the batch",
      "Wrap the INSERT in WHERE to filter duplicates first",
    ],
    answer: 2,
    why: "Statement atomicity is all-or-nothing per statement: one colliding row vetoes the whole multi-row INSERT. If the good rows must land independently of the bad one, they need their own statements — or ON CONFLICT DO NOTHING to absorb collisions deliberately. Judgment call: decide the unit of failure BEFORE the load, not after it.",
    notes: [{ choice: 0, why: "Atomic means the batch fails together — the opposite of what the requirement asks." }],
  },
  {
    id: "kb-wi-q10", difficulty: "easy",
    prompt: "Which INSERT would the seed db reject outright?",
    choices: [
      "`INSERT INTO customers (name, email, city, region, active, created_at) VALUES ('New Person', 'np@example.com', 'Berlin', 'EU', 1, '2026-01-05');`",
      "`INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'Clone K1', 'Electronics', 89.99, 10, 1);`",
      "`INSERT INTO suppliers (name, region, rating) VALUES ('Andes Copy', 'LATAM', 4.0);`",
      "`INSERT INTO orders (customer_id, status, total, created_at) VALUES (1, 'pending', 42.00, '2026-01-06');`",
    ],
    answer: 1,
    why: "products.id 1 already exists — Mechanical Keyboard K1 lives there — so the PRIMARY KEY rejects the clone: `UNIQUE constraint failed: products.id`. The other three insert fresh rows into free id space (customer 17, supplier 7, order 104). INSERT failures are almost always identity collisions or NOT NULL gaps; both are visible in the DDL plus a max(id) check.",
  },
];
