import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson44: Lesson = {
  id: "lesson-44",
  num: 44,
  title: "UPSERT & transactions — collisions and all-or-nothing",
  blurb: "ON CONFLICT DO NOTHING / DO UPDATE with the excluded row, the old INSERT OR IGNORE / OR REPLACE spellings and their sharp edge, plus the transaction idea that powers this course's sandbox",
  minutes: 13,
  blocks: [
    {
      kind: "p",
      text: "Feeds replay. Users double-click. Imports run twice by accident. So real write paths can't assume the row is missing — they must answer: *what if it's already there?* SQL's answer is the **upsert**: try to insert, and if the key collides, either stand down or update in the same breath. Paired with that is the other pillar of safe writing: the **transaction**, the all-or-nothing wrapper that turns a stack of statements into one indivisible step — and which this course's grader quietly wraps around every write you run.",
    },
    { kind: "diagram", figure: "w4-upsert-fork" },
    { kind: "h", text: "ON CONFLICT — the polite collision" },
    {
      kind: "bullets",
      items: [
        "`INSERT INTO … VALUES (…) ON CONFLICT (id) DO NOTHING` — the insert is attempted; if a row with that id (or UNIQUE value) exists, the statement stands down and touches nothing: 0 rows affected, no error.",
        "`ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock` — a collision becomes an update. The special name `excluded` is **the row you tried to insert**; the bare column names read the **existing** row. That one vocabulary is the whole trick.",
        "The conflict target `(id)` must name the PRIMARY KEY or a UNIQUE column — it's the key whose collision you're catching. The DO UPDATE can carry its own `WHERE` guard, evaluated per collision.",
      ],
    },
    {
      kind: "code",
      caption: "Feed replay: K1's daily stock delta lands whether or not the row exists",
      sql: `INSERT INTO products (id, name, category, price, stock, supplier_id)
VALUES (1, 'Mechanical Keyboard K1', 'Electronics', 89.99, 25, 1)
ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock
RETURNING id, stock;   -- 120 + 25 = 145 — the existing row won, excluded added`,
    },
    { kind: "h", text: "The old spellings — and their sharp edge" },
    {
      kind: "bullets",
      items: [
        "`INSERT OR IGNORE INTO …` — DO NOTHING without naming a target: *any* constraint violation (PK, NOT NULL, CHECK) is quietly swallowed. Convenient; occasionally hides real problems.",
        "`INSERT OR REPLACE INTO …` — the sharp one: on collision SQLite **deletes the old row and inserts yours**. Columns you didn't supply fall back to their defaults — not to the old row's values. The probe made it live: replacing product 1 without naming stock reset stock to 0.",
        "Prefer `ON CONFLICT` with an explicit target: it says which collision you mean, and DO UPDATE can preserve untouched columns instead of vaporizing them.",
      ],
    },
    {
      kind: "code",
      caption: "OR REPLACE, watched closely — unspecified columns don't survive",
      sql: `INSERT OR REPLACE INTO products (id, name, category, price, supplier_id)
VALUES (1, 'Mechanical Keyboard K1 (2026)', 'Electronics', 99.99, 1)
RETURNING id, name, stock;   -- stock: 0 — the old 120 went with the deleted row`,
    },
    { kind: "h", text: "Transactions — all of it or none of it" },
    {
      kind: "bullets",
      items: [
        "`BEGIN;` … `COMMIT;` wraps statements into one unit: every write lands together, or (on any failure or explicit `ROLLBACK;`) none of it does. The classic is the money transfer — debit one account, credit another; a crash between the two must not strand the money.",
        "This course's sandbox **is** a transaction: each graded write runs inside BEGIN … ROLLBACK — that's why the storefront wakes up unchanged after every run. Same engine, same durability rules, just no commit at the end.",
        "Transactions also make multi-step deletions safe — lesson 43's children-then-parents dance is one indivisible unit inside a transaction instead of two hopeful statements.",
      ],
    },
    {
      kind: "code",
      caption: "The shape (multi-statement — read it here; the editor runs one statement at a time)",
      sql: `BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 7;
UPDATE accounts SET balance = balance + 100 WHERE id = 9;
COMMIT;   -- both happened, or (on error / ROLLBACK) neither`,
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "`INSERT … ON CONFLICT (id) DO NOTHING / DO UPDATE` is PostgreSQL syntax that SQLite adopted wholesale — including the `excluded` alias. MySQL spells it `INSERT … ON DUPLICATE KEY UPDATE col = col + VALUES(col)` (or the blunter `REPLACE INTO`).",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite honors full transactions with BEGIN/COMMIT/ROLLBACK and SAVEPOINT for nested checkpoints — one writer at a time, which is why short transactions are a SQLite virtue.",
    },
    {
      kind: "warn",
      text: "OR REPLACE wipes what you didn't list — defaults replace old values silently. If a code review shows INSERT OR REPLACE on a table with more columns than the statement names, ask hard questions; ON CONFLICT DO UPDATE SET col = excluded.col names its intentions column by column.",
    },
  ],
  mcqs: [
    {
      id: "l44-q1",
      prompt: "`INSERT … ON CONFLICT (id) DO NOTHING` runs on a table that already holds that id. Result?",
      choices: [
        "An error — PRIMARY KEY must be unique",
        "The old row is deleted and the new one inserted",
        "Nothing happens — 0 rows affected, no error",
        "The new row is inserted with a new id",
      ],
      answer: 2,
      why: "DO NOTHING is the stand-down order: the collision is caught, the existing row stays untouched, and the statement completes successfully with 0 rows affected. That's what makes feeds safely re-runnable.",
      notes: [
        { choice: 0, why: "That's the result WITHOUT the ON CONFLICT clause — the plain INSERT would indeed fail. The whole point of the clause is to catch that error before it happens." },
      ],
    },
    {
      id: "l44-q2",
      prompt: "In `ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock`, what is `excluded.stock`?",
      choices: [
        "The existing row's stock",
        "The stock value from the row you tried to insert",
        "Zero — excluded rows don't have values",
        "The average of old and new",
      ],
      answer: 1,
      why: "`excluded` names the candidate row that lost the collision — your VALUES. Bare `stock` is the existing row. The pairing lets one statement do read-modify-write atomically: here old stock plus the new delta.",
      notes: [
        { choice: 0, why: "That's the bare name — `stock` alone reads the row already in the table. The excluded prefix is specifically the would-be insert." },
      ],
    },
    {
      id: "l44-q3",
      prompt: "`INSERT OR REPLACE INTO products (id, name, price) VALUES (1, 'K1', 99.99)` on a row that had stock 120. What's stock afterward?",
      choices: [
        "120 — REPLACE keeps untouched columns",
        "0 — the old row was deleted; the new one takes the column's DEFAULT",
        "NULL — unspecified columns become NULL",
        "An error — all columns must be listed",
      ],
      answer: 1,
      why: "OR REPLACE deletes the old row and inserts your new one; stock wasn't supplied, so the new row takes the schema's DEFAULT — 0 for products.stock. That silent reset is why ON CONFLICT DO UPDATE is the careful choice.",
      notes: [
        { choice: 2, why: "Unspecified columns go to their DEFAULT, which for stock is 0 — a NOT NULL column without a default would make the REPLACE fail outright instead." },
      ],
    },
    {
      id: "l44-q4",
      prompt: "`ON CONFLICT (id) DO UPDATE SET price = excluded.price WHERE excluded.price < price` — what does the trailing WHERE do?",
      choices: [
        "Filters which rows the INSERT scans",
        "Guards the update: the collision only updates when the new price is actually lower",
        "Nothing — WHERE is invalid inside ON CONFLICT",
        "Re-checks the PRIMARY KEY",
      ],
      answer: 1,
      why: "DO UPDATE can carry its own WHERE — evaluated per collision against existing vs excluded values. Here a higher or equal price leaves the row untouched; only a genuinely cheaper candidate overwrites. Upsert with a condition, no second statement needed.",
      notes: [
        { choice: 0, why: "The INSERT's own rows come from VALUES or SELECT — that scan is long done by conflict time. This WHERE lives entirely in the collision branch." },
      ],
    },
    {
      id: "l44-q5",
      prompt: "Inside `BEGIN;` you run two UPDATEs and then `ROLLBACK;`. What does the table look like?",
      choices: [
        "Both updates applied — ROLLBACK only undoes errors",
        "The first update applied, the second rolled back",
        "Neither applied — the transaction's changes are undone as a unit",
        "The table is deleted",
      ],
      answer: 2,
      why: "A transaction is all-or-nothing: ROLLBACK rewinds every change since BEGIN — both updates, in order, gone. COMMIT would have made both permanent together. That atomicity is what makes multi-step writes safe.",
      notes: [
        { choice: 1, why: "There are no half-transactions — the unit is the whole BEGIN…end span. Partial application is exactly what transactions exist to prevent." },
      ],
    },
  ],
  problems: [
    {
      id: "l44-p1",
      title: "The replay-safe feed",
      brief: "The nightly feed pushes product **1 (Mechanical Keyboard K1, Electronics, 89.99, stock 25, supplier 1)** — but it must never crash or duplicate when the row already exists. Write the insert with **ON CONFLICT (id) DO NOTHING**. Expected: 0 rows affected.",
      hints: [
        "Plain INSERT plus the ON CONFLICT clause; no RETURNING needed — the count is the answer.",
        "Shape: INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, …) ON CONFLICT (id) DO NOTHING;",
      ],
      difficulty: "easy",
      solution: "INSERT INTO products (id, name, category, price, stock, supplier_id)\nVALUES (1, 'Mechanical Keyboard K1', 'Electronics', 89.99, 25, 1)\nON CONFLICT (id) DO NOTHING;",
      mistakes: [
        { test: "\\bor\\s+replace\\b", message: "REPLACE would DELETE the K1 row and reinsert it — stock falls back to 0. DO NOTHING leaves the real row standing." },
        { test: "do update", message: "DO UPDATE would add a phantom stock row's worth of changes on every replay — the feed asked to stand down on collisions, not to modify." },
        { test: "values \\( 2 ,|values \\( 17 ,|values \\( 99 ,", message: "Don't dodge the collision by inventing a new id — the feed's contract is row 1 specifically; the clause handles the conflict, not a different key." },
      ],
      expected: EXPECTED["l44-p1"],
    },
    {
      id: "l44-p2",
      title: "The daily stock delta",
      brief: "Same feed, richer contract: product 1's payload is (id 1, 'Mechanical Keyboard K1', Electronics, 89.99, **stock 25**, supplier 1) — and on collision the stock payload must be **added** to the shelf. Upsert with **excluded.stock** and echo `id`, `stock` (expect 145).",
      hints: [
        "DO UPDATE SET stock = stock + excluded.stock — bare name reads the old row, excluded reads the payload.",
        "Shape: INSERT INTO products (…) VALUES (1, …, 25, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock RETURNING id, stock;",
      ],
      difficulty: "medium",
      solution: "INSERT INTO products (id, name, category, price, stock, supplier_id)\nVALUES (1, 'Mechanical Keyboard K1', 'Electronics', 89.99, 25, 1)\nON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock\nRETURNING id, stock;",
      mistakes: [
        { test: "set stock = excluded\\.stock(?!\\s*\\+)", message: "That OVERWRITES the shelf with 25 — the delta contract adds: stock = stock + excluded.stock lands at 145, not 25." },
        { test: "set stock = stock \\+ 25\\b", message: "Hardcoding the payload defeats the feed — the 25 must come from excluded.stock, the row you tried to insert. Tomorrow's delta is a different number." },
        { test: "do nothing", message: "DO NOTHING skips the delivery — the contract says collisions still merge the stock payload in." },
      ],
      expected: EXPECTED["l44-p2"],
    },
    {
      id: "l44-p3",
      title: "Never raise, only match",
      brief: "Pricing guardrail: try to insert product 1 at price **79.99** (other fields: 'Mechanical Keyboard K1', Electronics, stock 0, supplier 1) — but on collision, adopt the cheaper price **only if the candidate is strictly lower**. Echo `id`, `price` (expect 79.99).",
      hints: [
        "DO UPDATE SET price = excluded.price WHERE excluded.price < price — the guard compares candidate against current.",
        "Shape: INSERT INTO products (…) VALUES (1, …, 79.99, 0, 1) ON CONFLICT (id) DO UPDATE SET price = excluded.price WHERE excluded.price < price RETURNING id, price;",
      ],
      difficulty: "medium",
      solution: "INSERT INTO products (id, name, category, price, stock, supplier_id)\nVALUES (1, 'Mechanical Keyboard K1', 'Electronics', 79.99, 0, 1)\nON CONFLICT (id) DO UPDATE SET price = excluded.price\nWHERE excluded.price < price\nRETURNING id, price;",
      mistakes: [
        { test: "where excluded\\.price > price|where price < excluded\\.price", message: "Inverted guard — that adopts only HIGHER prices, a markup machine. The rule is: cheaper candidate wins, `excluded.price < price`." },
        { test: "do nothing", message: "DO NOTHING can't adopt the lower price — the update branch is what rewrites it, guarded by the WHERE." },
        { test: "where stock|set stock", message: "The guard is about PRICE here — stock is a bystander column; don't couple the price policy to the payload's stock." },
      ],
      expected: EXPECTED["l44-p3"],
    },
    {
      id: "l44-p4",
      title: "Watch OR REPLACE bite",
      brief: "The 2026 refresh ships as **INSERT OR REPLACE**: `id 1, 'Mechanical Keyboard K1 (2026)', Electronics, price 99.99, supplier 1` — note what's missing. Run it and echo `id`, `name`, `stock` — then read the stock number carefully: the deleted row's 120 does not survive.",
      hints: [
        "OR REPLACE = delete old row + insert yours. Unspecified columns take the schema DEFAULT.",
        "Shape: INSERT OR REPLACE INTO products (id, name, category, price, supplier_id) VALUES (…) RETURNING id, name, stock;",
      ],
      difficulty: "hard",
      solution: "INSERT OR REPLACE INTO products (id, name, category, price, supplier_id)\nVALUES (1, 'Mechanical Keyboard K1 (2026)', 'Electronics', 99.99, 1)\nRETURNING id, name, stock;",
      mistakes: [
        { test: "on conflict", message: "That's the modern spelling — but this ticket exists to demonstrate the legacy REPLACE path: old row deleted, defaults backfilled. Write INSERT OR REPLACE and look at the stock column's fate." },
        { test: ",\\s*stock\\s*,|stock\\s*=", message: "Listing stock dodges the lesson — the payload deliberately omits it so you can watch REPLACE fall back to DEFAULT 0 instead of the old 120." },
        { test: "'mechanical keyboard k1'(?! \\( 2026 \\))", message: "The refreshed name carries the (2026) suffix — the expected row is the new identity, not the old name." },
      ],
      expected: EXPECTED["l44-p4"],
    },
  ],
  takeaway: "Upsert is insert with a collision plan — DO NOTHING, or DO UPDATE where bare columns read the old row and excluded reads the candidate; transactions wrap it all in all-or-nothing, which is exactly the promise this course's sandbox makes on every run.",
};
