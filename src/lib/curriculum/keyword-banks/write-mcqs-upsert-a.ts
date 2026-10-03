// Keyword Mastery bank MCQs — UPSERT (ON CONFLICT), part A (22 of 40).
// Aspects: syntax / semantics / errors. Prose tag ("upsert", "ON CONFLICT")
// present in every prompt or why. Engine receipts from scripts/m7-facts*.ts.
import type { Mcq } from "../types";

export const upsertMcqsA: Mcq[] = [
  // ---------- syntax ----------
  {
    id: "kb-us-q01", difficulty: "easy",
    prompt: "Which statement adds 25 to K1's shelf count whether or not product id 1 already exists?",
    choices: [
      "`INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'Mechanical Keyboard K1', 'Electronics', 89.99, 25, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock;`",
      "`INSERT INTO products VALUES (1, …) ON CONFLICT (id) SET stock = stock + 25;`",
      "`UPDATE products SET stock = stock + 25 WHERE id = 1 OR INSERT …`",
      "`INSERT OR ADD INTO products …`",
    ],
    answer: 0,
    why: "The upsert shape: INSERT … ON CONFLICT (target) DO UPDATE SET … — one statement, two behaviors. The engine receipt: K1's 120 + excluded.stock 25 = 145. `excluded.` is the alias for the row that COULDN'T insert; the missing DO in choice 2 and the fantasy INSERT OR ADD make the others non-SQLite.",
  },
  {
    id: "kb-us-q02", difficulty: "easy",
    prompt: "In an upsert's DO UPDATE arm, what does `excluded` refer to?",
    choices: [
      "The existing row, pre-conflict",
      "The row you TRIED to insert — its proposed values, addressable as excluded.column",
      "Rows skipped by the WHERE",
      "A system table of failed inserts",
    ],
    answer: 1,
    why: "excluded is the would-be row: `SET stock = stock + excluded.stock` reads the NEW batch's 25 and adds it to the CURRENT 120. Without the prefix, `stock` means the existing row's column; with it, the incoming proposal. The two aliases side by side are the whole upsert vocabulary.",
    notes: [{ choice: 0, why: "The existing row is addressed by its bare column names (or table.column) — excluded is specifically the rejected proposal." }],
  },
  {
    id: "kb-us-q03", difficulty: "medium",
    prompt: "Which pair are the legacy (pre-3.24) spellings that ON CONFLICT modernized?",
    choices: [
      "`INSERT OR IGNORE` (skip conflicts) and `INSERT OR REPLACE` (overwrite) — both still valid SQLite",
      "`UPSERT INTO` and `MERGE INTO`",
      "`ON DUPLICATE KEY` and `REPLACE INTO` — the SQLite names",
      "There were no earlier spellings",
    ],
    answer: 0,
    why: "The OR-family predates the upsert clause: OR IGNORE turns a conflict into a no-op (changes = 0), OR REPLACE tears down the old row and writes the new one. Both still work — but ON CONFLICT DO NOTHING/DO UPDATE is the precise tool: it can target a SPECIFIC constraint and express update logic, which OR IGNORE/REPLACE cannot.",
    notes: [{ choice: 1, why: "MERGE is the SQL-standard verb (Postgres 15+/SQL Server) — SQLite answers with ON CONFLICT, not MERGE." }],
  },
  {
    id: "kb-us-q04", difficulty: "medium",
    prompt: "Why does the upsert target need to be `ON CONFLICT (id)` — and what breaks with `ON CONFLICT (category)`?",
    choices: [
      "Nothing — any column works",
      "The target must match a PRIMARY KEY or UNIQUE constraint; category has none, so SQLite errors: 'ON CONFLICT clause does not match any PRIMARY KEY or UNIQUE constraint'",
      "Category works but is slower",
      "Only INTEGER columns can be targets",
    ],
    answer: 1,
    why: "Conflict targets are constraint targets: the engine detects collisions via uniqueness, so the clause must name a column (or expression) covered by PK/UNIQUE. The probe's error is verbatim. products carries exactly one such target — id. To upsert on category you'd first create a UNIQUE index on it, which is usually a design smell.",
  },
  {
    id: "kb-us-q05", difficulty: "easy",
    prompt: "Which upsert keeps the existing row untouched on a collision, no matter what?",
    choices: [
      "`ON CONFLICT (id) DO NOTHING`",
      "`ON CONFLICT (id) DO UPDATE SET stock = stock`",
      "`ON CONFLICT (id) DO ROLLBACK`",
      "`ON CONFLICT (id) SKIP ROW`",
    ],
    answer: 0,
    why: "DO NOTHING is the explicit no-op: conflict detected, insert abandoned, changes = 0, no error — the probe verified it. The DO UPDATE SET stock = stock variant also changes nothing but wastes the write and still counts as an update path; DO ROLLBACK and SKIP ROW don't exist. For 'add if missing, never clobber', DO NOTHING is the whole sentence.",
  },
  {
    id: "kb-us-q06", difficulty: "medium",
    prompt: "Where does the ON CONFLICT clause sit in the upsert grammar?",
    choices: [
      "Before VALUES",
      "Immediately after the VALUES (or SELECT) — the tail of the INSERT statement",
      "After a WHERE of its own, at the very end",
      "Anywhere — it's a hint",
    ],
    answer: 1,
    why: "`INSERT INTO … VALUES … ON CONFLICT … DO …` — the clause rides directly on the VALUES it guards. A WHERE after it belongs to the DO UPDATE arm (`DO UPDATE SET … WHERE excluded.price < price`), not to the statement. Fixed positions are why upserts read cleanly despite doing two jobs.",
  },
  {
    id: "kb-us-q07", difficulty: "medium",
    prompt: "A 3-row VALUES batch rides one ON CONFLICT (id) DO UPDATE. What's the semantics per row?",
    choices: [
      "The clause applies only to the first row",
      "Each row independently: fresh ids insert, colliding ids update — per-row resolution inside the one statement",
      "One conflict aborts the whole batch",
      "The engine picks a random row's behavior",
    ],
    answer: 1,
    why: "The engine receipt: rows for ids 900/901 (fresh) inserted, row for id 1 (K1) collided and updated — changes = 3, K1's stock 120 + 5 = 125. The upsert clause is per-row machinery, not per-statement fate. Contrast with the plain multi-row INSERT, where ONE collision vetoes the batch.",
  },
  {
    id: "kb-us-q08", difficulty: "hard",
    prompt: "Which statement upserts the price DOWNWARD only — never raising it?",
    choices: [
      "`INSERT … VALUES (1, 'K1', 'Electronics', 79.99, 0, 1) ON CONFLICT (id) DO UPDATE SET price = excluded.price WHERE excluded.price < price;`",
      "`INSERT … VALUES (…) ON CONFLICT (id) DO UPDATE SET price = MIN(price, excluded.price);`",
      "`INSERT … VALUES (…) ON CONFLICT (id) DO UPDATE SET price = excluded.price;`",
      "`INSERT OR LOWER …`",
    ],
    answer: 0,
    why: "The DO UPDATE arm takes its own WHERE: the write applies only when the incoming 79.99 beats the stored 89.99 — engine-verified (price lands at 79.99; a 99.99 proposal with the same guard is skipped, price stays). Choice 2 is elegant too (MIN works in SQLite), but the WHERE-guard is the canonical idiom — and fails identically when the guard rejects. The upsert clause's OR-family ancestors still behave exactly this way — legacy spellings, modern care.",
  },

  // ---------- semantics ----------
  {
    id: "kb-us-q09", difficulty: "easy",
    prompt: "The word 'upsert' compresses which two behaviors?",
    choices: [
      "UPDATE + SELECT",
      "UPDATE + INSERT — insert if absent, update if present",
      "UPLOAD + INSERT",
      "UPPER + SET",
    ],
    answer: 1,
    why: "One statement, branching on existence: no collision → plain INSERT; collision on the target constraint → the DO UPDATE (or DO NOTHING) arm. The seed's freshest demonstration: id 17 upserts as a plain insert (changes = 1), id 1 upserts as the update arm (stock 120 → 145). It's the atomic answer to 'add or refresh' — no SELECT-first round trip.",
  },
  {
    id: "kb-us-q10", difficulty: "medium",
    prompt: "Why is upserting SAFER than the app-side pattern `SELECT to check, then INSERT or UPDATE`?",
    choices: [
      "It's shorter to type",
      "The check-then-write has a race window (two writers can both see 'absent' and both insert); the upsert is one atomic statement — the constraint arbitrates",
      "Upserts bypass constraints",
      "SELECT can't run on products",
    ],
    answer: 1,
    why: "Check-then-act splits the decision from the write; concurrency drives a truck through that gap. The upsert folds decision + action into a single statement the ENGINE arbitrates via the unique constraint — two racing upserts serialize cleanly (one inserts, one updates). This is the classic TOCTOU bug the ON CONFLICT clause kills.",
  },
  {
    id: "kb-us-q11", difficulty: "medium",
    prompt: "`ON CONFLICT (id) DO UPDATE SET stock = excluded.stock` vs `SET stock = stock + excluded.stock` — the difference?",
    choices: [
      "They're identical",
      "First OVERWRITES the shelf count with the incoming figure; second ACCUMULATES (restock) — 120 becomes 30 vs 145 for a +25 batch",
      "First is invalid syntax",
      "Second only works on TEXT columns",
    ],
    answer: 1,
    why: "Overwrite (sync to source) vs accumulate (add to shelf) — the engine receipts show both: excluded.stock alone lands 30; the sum lands 145. Choosing wrong corrupts inventory either direction (lost restocks or phantom stock). The excluded alias makes both spellings one-token different — read carefully.",
  },
  {
    id: "kb-us-q12", difficulty: "medium",
    prompt: "An upsert with DO NOTHING hits an existing id. What does the client learn?",
    choices: [
      "An error mentioning the constraint",
      "changes = 0, no error — the statement succeeded by choosing to do nothing",
      "changes = 1",
      "The existing row as a result set",
    ],
    answer: 1,
    why: "DO NOTHING converts a would-be error into a counted non-event: the probe's receipt is changes = 0 with a clean exit. Distinguishing 'skipped' from 'wrote' needs the count (or RETURNING, which echoes nothing for skipped rows) — a silent skip is a feature for idempotent loads and a hazard when every row SHOULD have landed.",
  },
  {
    id: "kb-us-q13", difficulty: "hard",
    prompt: "Which upsert behaves IDENTICALLY on a fresh id (17) and differently on id 1?",
    choices: [
      "`ON CONFLICT (id) DO NOTHING` — inserts 17, skips 1",
      "`ON CONFLICT (id) DO UPDATE SET stock = excluded.stock` — inserts 17, overwrites 1's stock",
      "Both behave identically on both",
      "Neither runs on a fresh id",
    ],
    answer: 1,
    why: "The upsert branch is existence-dependent: fresh id 17 never conflicts, so ANY DO arm degenerates to a plain insert (changes = 1). Id 1 exists — DO NOTHING skips, DO UPDATE rewrites. Choice 1 also branches (insert vs skip), so 'identically' is false for it too; only the question's second option updates the existing row.",
  },
  {
    id: "kb-us-q14", difficulty: "medium",
    prompt: "Why does the upsert clause only fire on the DECLARED constraint — and what happens to a row that violates a DIFFERENT uniqueness (say, a made-up unique email) than the one targeted?",
    choices: [
      "It's upserted too — one clause covers all constraints",
      "It errors — ON CONFLICT (id) only arbitrates id collisions; other constraint violations still raise normally",
      "The row is ignored silently",
      "SQLite picks the nearest constraint",
    ],
    answer: 1,
    why: "The target names ONE constraint; any OTHER violation is business as usual — an error. Upsert is precise arbitration, not a general error suppressor. If two constraints can both collide, each needs its own clause consideration (SQLite arbitrates the first conflict hit against the target — others bubble up as errors).",
  },
  {
    id: "kb-us-q15", difficulty: "medium",
    prompt: "The 6-supplier book needs 'add supplier 6 if missing, refresh its rating if present'. The upsert that does BOTH honestly?",
    choices: [
      "`INSERT INTO suppliers (id, name, region, rating) VALUES (6, 'Andes Naturals SA', 'LATAM', 4.4) ON CONFLICT (id) DO UPDATE SET rating = excluded.rating;`",
      "`INSERT OR REPLACE INTO suppliers (id, name, region, rating) VALUES (6, 'Andes Naturals SA', 'LATAM', 4.4);` — same thing, shorter",
      "`UPDATE suppliers SET rating = 4.4 WHERE id = 6;` alone",
      "`INSERT INTO suppliers VALUES (6, …) DO NOTHING;`",
    ],
    answer: 0,
    why: "DO UPDATE SET rating = excluded.rating refreshes exactly the rating column, leaving every other column of the existing row intact. OR REPLACE would delete and reinsert supplier 6 — same visible row here, but a different mechanism with different side effects (rowid churn, wiped columns you forgot to list). The precise upsert names the ONE column that may move.",
  },
  {
    id: "kb-us-q16", difficulty: "hard",
    prompt: "Dmitri's reactivation: `INSERT INTO customers (id, name, email, city, region, active, created_at) VALUES (4, 'Dmitri V.', 'dmitri@volt.io', 'Berlin', 'EU', 1, '2024-02-10') ON CONFLICT (id) DO UPDATE SET active = excluded.active`. On the seed, this…",
    choices: [
      "Inserts a second Dmitri",
      "Reactivates the existing Dmitri (active 0 → 1), changes = 1, one row total",
      "Errors — email is unique",
      "Does nothing — DO UPDATE requires a changed value",
    ],
    answer: 1,
    why: "Customer 4 exists (Dmitri Volkov, active = 0 — one of the seed's two inactive accounts), so the conflict fires and the DO UPDATE arm flips active to 1: engine receipt changes = 1. The upsert read as reactivation logic — the same statement would have REGISTERED him had he been absent. That dual behavior is why upserts own the 'sync member' use case.",
  },

  // ---------- errors ----------
  {
    id: "kb-us-q17", difficulty: "medium",
    prompt: "`INSERT INTO products … ON CONFLICT (id) SET stock = 5;` — what's wrong?",
    choices: [
      "Nothing — DO is optional",
      "Missing DO: the update arm must read DO UPDATE SET — bare ON CONFLICT (id) SET is a syntax error",
      "SET can't assign constants",
      "The conflict target must come last",
    ],
    answer: 1,
    why: "The clause has two arms — DO NOTHING and DO UPDATE SET … — and the DO keyword is grammar, not decoration. Omit it and the parser errors. Compare the working receipt spelling: ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock.",
  },
  {
    id: "kb-us-q18", difficulty: "hard",
    prompt: "In `ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock`, why does the bare `stock` (left of +) mean the EXISTING row's stock?",
    choices: [
      "It doesn't — both sides are excluded",
      "Inside DO UPDATE, unqualified columns resolve to the target table's CURRENT row; excluded.* is the incoming row — the two namespaces can't mix up",
      "SQLite picks whichever is larger",
      "Bare columns are errors inside upserts",
    ],
    answer: 1,
    why: "The upsert arm runs 'inside' the existing row's context: plain names read what's stored, excluded.name reads what was proposed. Mixing them (stock = stock + excluded.stock) is the accumulation idiom precisely because the namespaces are unambiguous. Same-name-same-table is why the alias exists at all.",
  },
  {
    id: "kb-us-q19", difficulty: "medium",
    prompt: "`INSERT OR REPLACE INTO products (id, name, category, price, supplier_id) VALUES (1, 'K1 (2026)', 'Electronics', 99.99, 1)` — the stock column was omitted. What lands?",
    choices: [
      "Stock keeps its old 120",
      "Stock becomes NULL",
      "Stock becomes 0 — OR REPLACE deleted the old row and inserted a fresh one; the new row takes the column's DEFAULT",
      "An error — stock is required",
    ],
    answer: 2,
    why: "The engine receipt is stark: after the OR REPLACE, K1's row reads stock = 0 — the old row (stock 120) was deleted, and the replacement took DEFAULT 0 for the unlisted column. OR REPLACE is row-level demolition, not column-level merge; forgetting one column silently zeroes it. This is the single most expensive upsert-family footgun.",
    notes: [{ choice: 0, why: "That's DO UPDATE's behavior — the whole reason the modern clause exists. OR REPLACE never preserves anything it wasn't handed." }],
  },
  {
    id: "kb-us-q20", difficulty: "medium",
    prompt: "Which statement ERRORS on the seed?",
    choices: [
      "`INSERT OR IGNORE INTO suppliers (id, name, region, rating) VALUES (6, 'Andes Copy', 'LATAM', 4.0);`",
      "`INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'X', 'Electronics', 1, 1, 1) ON CONFLICT (category) DO NOTHING;`",
      "`INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (17, 'New', 'Audio', 59.99, 10, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock;`",
      "`INSERT INTO suppliers (name, region, rating) VALUES ('Probe', 'EU', 4.5);`",
    ],
    answer: 1,
    why: "ON CONFLICT (category) names a column with no PK/UNIQUE constraint — the engine rejects the STATEMENT before any row logic: 'ON CONFLICT clause does not match any PRIMARY KEY or UNIQUE constraint'. The others behave: OR IGNORE no-ops on the id-6 collision (changes = 0), id 17 inserts fresh, and the 3-column supplier insert takes id 7.",
  },
  {
    id: "kb-us-q21", difficulty: "hard",
    prompt: "An upsert import fails with 'NOT NULL constraint failed: products.name' — but only on SOME rows of the batch. What's the truth about which rows landed?",
    choices: [
      "The good rows landed, the bad ones were skipped",
      "Nothing landed — a multi-row INSERT (upsert included) is one statement: any row's constraint failure aborts the entire batch, changes = 0",
      "All rows landed with NULL names",
      "SQLite retries the bad rows",
    ],
    answer: 1,
    why: "Statement atomicity doesn't bend for upserts: the ON CONFLICT arm arbitrates UNIQUE/PK collisions, but a NOT NULL failure on row 3 of 10 kills the statement — zero rows persist. The probe family proved it on a plain multi-row insert; the upsert inherits the same rule. Batch loads that must survive bad rows split into per-row statements.",
  },
  {
    id: "kb-us-q22", difficulty: "medium",
    prompt: "Which claim about `ON CONFLICT (id) DO UPDATE` is FALSE?",
    choices: [
      "It can reference excluded columns in both SET and its own WHERE",
      "It fires once per colliding row",
      "It can update the CONFLICT TARGET itself (SET id = …) to yet another existing id without error",
      "It leaves fresh-id rows to insert normally",
    ],
    answer: 2,
    why: "The DO UPDATE arm still writes through constraint checking: SET id = 5 when row 5 exists re-collides and errors — the upsert arbitrated the FIRST conflict, not every possible one. The other three are the clause's real semantics (excluded namespaces, per-row firing, fresh-id passthrough). Upsert ≠ constraint immunity.",
  },
];
