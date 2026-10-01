// Keyword Mastery bank MCQs — RETURNING, part A (22 of 44). Aspects: syntax /
// semantics / errors. Prose tag ("RETURNING clause", "RETURNING id/rows/the")
// present in every prompt or why. Engine receipts from scripts/m7-facts*.ts.
import type { Mcq } from "../types";

export const returningMcqsA: Mcq[] = [
  // ---------- syntax ----------
  {
    id: "kb-re-q01", difficulty: "easy",
    prompt: "Where does the RETURNING clause sit in a write statement?",
    choices: [
      "Before SET in an UPDATE",
      "At the tail of INSERT / UPDATE / DELETE (or the upsert's DO arm) — after VALUES, SET+WHERE, or WHERE",
      "Inside the VALUES list",
      "It replaces the WHERE",
    ],
    answer: 1,
    why: "RETURNING rides at the end: `INSERT INTO … VALUES (…) RETURNING id;`, `UPDATE … SET … WHERE … RETURNING id, price;`, `DELETE FROM … WHERE … RETURNING id;`. It converts the statement from count-only into a result-set producer. Fixed tail position is what lets the parser know the write is over and the echo begins.",
  },
  {
    id: "kb-re-q02", difficulty: "easy",
    prompt: "Which write statements accept the RETURNING clause in SQLite 3.35+?",
    choices: [
      "INSERT only",
      "INSERT, UPDATE, and DELETE — every DML statement",
      "SELECT too",
      "Only INSERT … ON CONFLICT",
    ],
    answer: 1,
    why: "All three writes echo: the probe verified INSERT … RETURNING (customer id 17), UPDATE … RETURNING (3 Audio rows), DELETE … RETURNING (7 cancelled ids). SELECT needs no echo — it already returns rows. The clause turns 'write + follow-up SELECT' into one atomic statement.",
  },
  {
    id: "kb-re-q03", difficulty: "easy",
    prompt: "What does `RETURNING *` echo after an INSERT?",
    choices: [
      "Only the id",
      "The full inserted row — supplied columns, engine-assigned id, and DEFAULT-filled columns alike",
      "The whole table",
      "An error — * is SELECT-only",
    ],
    answer: 1,
    why: "RETURNING * is the write's mirror of SELECT *: the probe's insert-without-stock echoed (id 902-shape, name, category, price, stock 0, supplier_id) — the DEFAULT 0 visible in the echo. Predict-the-output on RETURNING * means knowing the schema's defaults, because the echo shows what actually LANDED, not what you typed. The RETURNING clause is the write's own receipt printer — this pattern is one of its core jobs.",
  },
  {
    id: "kb-re-q04", difficulty: "medium",
    prompt: "Which RETURNING list is valid?",
    choices: [
      "`RETURNING id, ROUND(price, 2) AS new_price` — columns, expressions, and aliases",
      "`RETURNING * ORDER BY id`",
      "`RETURNING COUNT(*)`",
      "`RETURNING id LIMIT 3`",
    ],
    answer: 0,
    why: "The RETURNING clause speaks SELECT's expression language — columns of the changed rows, functions, aliases (`AS new_price`; the Audio probe echoed new_price 164.99/130.9/65.99). But it has no ORDER BY, LIMIT, or aggregates of its own — it's a per-row echo, not a report. Aggregation over the echo happens in the application (or a wrapped CTE).",
  },
  {
    id: "kb-re-q05", difficulty: "medium",
    prompt: "Newest-engine check: which combination supports the RETURNING clause?",
    choices: [
      "SQLite 3.35+ and PostgreSQL — yes; MySQL 8.0 — no (it offers LAST_INSERT_ID()/workarounds instead)",
      "All three major engines identically",
      "Only MySQL",
      "SQLite added it in 3.24 alongside upsert",
    ],
    answer: 0,
    why: "SQLite grew RETURNING in 3.35 (upsert was 3.24); Postgres has had it for years; MySQL still lacks it in 8.x — its dialect note is exactly the kind of portability fact a write-heavy app must know. The course's dialect blocks flag this: code using RETURNING needs the fallback path on MySQL.",
    notes: [{ choice: 3, why: "3.24 was UPSERT's release. RETURNING arrived eleven releases later — the two clauses have different vintages." }],
  },
  {
    id: "kb-re-q06", difficulty: "medium",
    prompt: "Can an upsert's DO UPDATE arm carry its own RETURNING?",
    choices: [
      "No — RETURNING belongs to SELECT-style statements",
      "Yes — `INSERT … ON CONFLICT (id) DO UPDATE SET stock = excluded.stock RETURNING id, stock;` echoes the updated row",
      "Only DO NOTHING can return",
      "Yes, but only RETURNING *",
    ],
    answer: 1,
    why: "The probe's receipt: the K1 upsert with RETURNING echoed (1, stock 30) — the arm that FIRED supplies the echoed row. Whole-statement semantics: whatever the upsert did (insert arm or update arm), RETURNING reports it. Skipped guards (DO UPDATE … WHERE false) echo nothing for that row — silence means 'not written'.",
  },
  {
    id: "kb-re-q07", difficulty: "hard",
    prompt: "Which statement about RETURNING's evaluation timing is TRUE?",
    choices: [
      "It shows the row's BEFORE-image for UPDATE",
      "For UPDATE it echoes the AFTER-image — the new values; for DELETE it echoes the doomed rows (which only ever have a before-image)",
      "Timing is random",
      "It echoes the values as typed, before constraints",
    ],
    answer: 1,
    why: "UPDATE echoes post-write state: the Audio sweep's RETURNING id, ROUND(price,2) showed 164.99 — the NEW price. DELETE echoes the rows as they leave (the only image they have). INSERT echoes what landed (ids assigned, defaults applied). Read the echo knowing which image each statement projects — 'new values' for UPDATE/INSERT, 'last known' for DELETE.",
    notes: [{ choice: 0, why: "OLD/NEW pseudo-rows are trigger vocabulary. RETURNING gives you the after-image on UPDATE — audit the before-image with a snapshot SELECT first." }],
  },
  {
    id: "kb-re-q08", difficulty: "medium",
    prompt: "A batch job needs the generated ids of 3 inserted orders for follow-up work. The cleanest single-statement form?",
    choices: [
      "INSERT the batch, then SELECT max(id) - 2 … max(id)",
      "`INSERT INTO orders (…) VALUES (…), (…), (…) RETURNING id;` — the echo lists exactly the 3 new ids",
      "INSERT one at a time, checking counts",
      "SELECT id FROM orders WHERE id > (previous max) — after the insert",
    ],
    answer: 1,
    why: "The engine receipt: the 2-order batch echoed (104, 88.5) and (105, 42) — per-row ids, atomically captured. max(id) arithmetic breaks under concurrency (another writer's rows interleave) and needs a second round trip. RETURNING hands the identities of YOUR rows, in one statement, race-free. The RETURNING clause collapses the follow-up query into the write itself.",
  },

  // ---------- semantics ----------
  {
    id: "kb-re-q09", difficulty: "easy",
    prompt: "How many rows does `INSERT … VALUES (row1), (row2) RETURNING id, total;` echo?",
    choices: [
      "1 — the first row",
      "2 — one echo per inserted row",
      "0 — inserts don't echo",
      "All rows in the table",
    ],
    answer: 1,
    why: "The probe's 2-row order insert echoed exactly 2 rows — (104, 88.5), (105, 42). The RETURNING clause is per-changed-row: N rows written, N rows echoed. Multi-row writes therefore produce a genuine result set, ready for the app to consume like any SELECT output.",
  },
  {
    id: "kb-re-q10", difficulty: "medium",
    prompt: "What does the client see from `UPDATE orders SET status = 'shipped' WHERE status = 'pending'` WITHOUT RETURNING?",
    choices: [
      "The 14 updated rows",
      "Just an affected-rows count (14)",
      "Nothing at all",
      "An error",
    ],
    answer: 1,
    why: "Bare writes report counts: 14 here. Append RETURNING id and the same sweep hands over the 14 order ids as they flip. The count is the receipt summary; the echo is the line items. Ops sweeps usually want both — count for the log, ids for the audit trail.",
  },
  {
    id: "kb-re-q11", difficulty: "medium",
    prompt: "`DELETE FROM orders WHERE status = 'cancelled' RETURNING id;` — what exactly does the echo contain?",
    choices: [
      "The surviving orders",
      "The 7 doomed ids (7, 21, 50, 51, 82, 83, 95) — their last-known values, as they leave",
      "A count only",
      "NULLs",
    ],
    answer: 1,
    why: "The engine receipt: 7 rows echoed with exactly those ids, changes = 7. DELETE's echo is the before-image — the only image a deleted row has. This is the audit trail the bare count never gave you: WHO left, captured at the moment of departure, inside the same atomic statement.",
  },
  {
    id: "kb-re-q12", difficulty: "medium",
    prompt: "A guarded upsert (`DO UPDATE SET price = excluded.price WHERE excluded.price < price`) proposes a HIGHER price. What does its RETURNING echo?",
    choices: [
      "The existing row unchanged",
      "Nothing for that row — the guard rejected the write, so there's nothing to echo",
      "The proposed (excluded) values",
      "An error row",
    ],
    answer: 1,
    why: "The echo lists CHANGED rows; a guard-skipped row didn't change, so it's absent — the engine receipt shows the guard-higher case at changes = 0 and an empty echo. Zero rows echoed is meaningful: 'nothing was written'. Compare with DO NOTHING: also silent. Silence is the upsert's 'skipped' signal. That is the RETURNING clause doing its quietest, most valuable work.",
  },
  {
    id: "kb-re-q13", difficulty: "medium",
    prompt: "The RETURNING clause produces what KIND of client artifact?",
    choices: [
      "A boolean",
      "A result set — columns and rows, consumed like SELECT output",
      "A JSON string",
      "A write receipt object with metadata only",
    ],
    answer: 1,
    why: "The clause turns the write into a statement that RETURNS a table: columns from its list, one row per change. The probe's echoes arrive as ordinary (columns, rows) pairs — the app consumes them identically to SELECT results. That's why RETURNING kills follow-up queries: the write already produced the data.",
  },
  {
    id: "kb-re-q14", difficulty: "hard",
    prompt: "Which statement echoes ZERO rows despite succeeding?",
    choices: [
      "`INSERT INTO products (…) VALUES (1, …) ON CONFLICT (id) DO NOTHING;` on existing id 1",
      "`DELETE FROM orders WHERE status = 'cancelled' RETURNING id;`",
      "`UPDATE products SET price = price * 1.1 WHERE category = 'Audio' RETURNING id;`",
      "`INSERT INTO suppliers (name, region, rating) VALUES ('X', 'EU', 4.0) RETURNING id;`",
    ],
    answer: 0,
    why: "DO NOTHING on a collision writes nothing — changes = 0, empty echo (engine receipt). The other three echo 7, 3, and 1 rows respectively. 'Success with an empty echo' is a real state writes can produce — the app that assumes 'success = at least one row echoed' will misread dedupes and skips. The RETURNING clause speaks SELECT's projection language over the changed rows.",
  },
  {
    id: "kb-re-q15", difficulty: "medium",
    prompt: "In `UPDATE products SET price = price * 1.1 WHERE category = 'Audio' RETURNING price;` — the echoed price for the Headset is…",
    choices: [
      "149.99 — the value the row had",
      "164.98900000000003 (or its display form) — the NEW value the write produced",
      "0",
      "The average of all Audio prices",
    ],
    answer: 1,
    why: "UPDATE's echo is the after-image: the multiplied value as stored (floats and all — 149.99 * 1.1 = 164.98900000000003, displayed trimmed to 164.99). The probe receipt echoes exactly the new prices. If you need pre-images, capture them BEFORE the sweep — RETURNING won't replay history. The RETURNING clause makes the write self-documenting — mutation and evidence in one statement.",
  },
  {
    id: "kb-re-q16", difficulty: "hard",
    prompt: "Why does RETURNING + single statement beat INSERT-then-SELECT for capturing generated ids?",
    choices: [
      "It's more readable, that's all",
      "Atomicity: the echo is part of the same statement — no window where another writer's inserts shift max(id), no second round trip, and the ids belong to YOUR rows",
      "SELECT can't read new rows",
      "RETURNING bypasses constraints",
    ],
    answer: 1,
    why: "Two statements = two round trips and a race: between INSERT and SELECT, concurrent writers move max(id), and 'my rows' become guesswork (the probe's 104/105 would be someone else's 106/107 by read time). RETURNING folds capture into the write — the ids in the echo are yours, atomically. Concurrency-correct by construction. The RETURNING clause is the write's own receipt printer — this pattern is one of its core jobs.",
  },
  {
    id: "kb-re-q17", difficulty: "medium",
    prompt: "The clause echoes columns 'of the changed rows'. For an upsert whose INSERT arm fired (fresh id 17), what does RETURNING id, stock show?",
    choices: [
      "Nothing — upserts only echo on the update arm",
      "The freshly inserted row — (17, 10) for a stock-10 proposal",
      "The excluded row",
      "All 16 products",
    ],
    answer: 1,
    why: "The insert arm is a real insert: the echo reports the landed row with its assigned id (17) and stored stock (10). The probe family confirms fresh ids echo normally. The upsert's RETURNING covers BOTH arms uniformly — whichever branch fired supplies the row. Uniform echo is why app code needs no branch for upsert results.",
  },
  {
    id: "kb-re-q18", difficulty: "easy",
    prompt: "Which echo helps MOST when an ops sweep must produce a paper trail of touched rows?",
    choices: [
      "`UPDATE … RETURNING *` — every column of every rewritten row, in the run log",
      "The affected count alone",
      "VACUUM's output",
      "The statement's syntax",
    ],
    answer: 0,
    why: "RETURNING * is the full audit snapshot: the pending-ship sweep echoes 14 complete rows (ids, customers, totals, old timestamps) — everything an auditor needs, captured atomically at write time. Counts go in the headline; the echo is the body of the report. Write-and-document in one statement. The RETURNING clause collapses the follow-up query into the write itself.",
  },

  // ---------- errors ----------
  {
    id: "kb-re-q19", difficulty: "medium",
    prompt: "`SELECT name FROM products RETURNING name;` — verdict?",
    choices: [
      "Works — an identity echo",
      "Syntax error — RETURNING belongs to write statements; SELECT already returns rows",
      "Returns the table twice",
      "Silently ignored",
    ],
    answer: 1,
    why: "The parser rejects RETURNING on SELECT: the clause exists to give WRITES a result set. Reads have their own output machinery. Error-side knowledge matters here because the fix is deletion — just remove the clause — but only if you recognize that a write verb, not RETURNING, was the missing piece.",
  },
  {
    id: "kb-re-q20", difficulty: "hard",
    prompt: "`INSERT INTO products (…) VALUES (…) RETURNING id ORDER BY id DESC;` — what happens in SQLite?",
    choices: [
      "Echoes sorted descending",
      "Syntax error — the RETURNING list takes no ORDER BY (sort the echoed rows in the application)",
      "Sorted ascending by default",
      "ORDER BY is ignored",
    ],
    answer: 1,
    why: "The echo list is a projection, not a query — no ORDER BY, no LIMIT (SQLite errors). Postgres behaves the same. The workaround when order matters: read the echo into the application and sort there (or capture into a real table first, then SELECT with ORDER BY) — SQLite's CTEs cannot host writes, so the data-modifying-CTE trick stays Postgres-only.",
  },
  {
    id: "kb-re-q21", difficulty: "medium",
    prompt: "A team ports write code from Postgres to MySQL 8. The RETURNING clauses…",
    choices: [
      "Work unchanged",
      "Break — MySQL 8 has no RETURNING; the port needs rewrites (LAST_INSERT_ID() for single inserts, or a follow-up SELECT in the same transaction)",
      "Work via a compatibility flag",
      "Become comments",
    ],
    answer: 1,
    why: "Dialect reality: SQLite 3.35+ and Postgres speak RETURNING; MySQL doesn't (its idiom is LAST_INSERT_ID() or SELECT-after-write inside a transaction). Portable write layers isolate echo-capture behind a small interface so the SQLite/Postgres path uses RETURNING and MySQL gets its workaround. The clause is powerful — and a portability boundary. That is the RETURNING clause doing its quietest, most valuable work.",
  },
  {
    id: "kb-re-q22", difficulty: "hard",
    prompt: "Why can't `UPDATE products SET stock = 5 WHERE id = 1 RETURNING stock - 10 AS delta;`-style echoes reference the PRE-update stock?",
    choices: [
      "They can — RETURNING sees both images",
      "The echo evaluates on the AFTER-image only; the old value is gone by echo time (capture it beforehand or compute the delta inside SET)",
      "Arithmetic is banned in RETURNING",
      "Only ids may be echoed",
    ],
    answer: 1,
    why: "The echo projects the rows as they now exist: stock - 10 computes from the NEW stock (5 − 10 = −5), not the old 15. There's no OLD. prefix in RETURNING — before-images require a pre-SELECT (in the same transaction) or encoding the delta in SET (`stock = stock - 10 RETURNING stock` echoes the landed 5). Know which image your expressions ride on. The RETURNING clause speaks SELECT's projection language over the changed rows.",
  },
];
