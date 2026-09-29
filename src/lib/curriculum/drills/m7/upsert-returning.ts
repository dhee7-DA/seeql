// Drill set — UPSERT & RETURNING (Module 7, secondary, 15 questions).
// Engine-verified receipts (db/custom.db, scripts/thin-facts2.ts): product 1
// 'Mechanical Keyboard K1' price 89.99 stock 120; product 3 'USB-C Hub
// 7-in-1' price 49.00 stock 85; product 4 stock 60; 16 products, max id 16;
// suppliers 5 = Alpine Audio GmbH (2 products), 6 = Andes Naturals SA (2).
// Semantics probed on live db inside the course sandbox: INSERT … ON
// CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock on product 1
// with +25 → stock 145; ON CONFLICT DO NOTHING on an existing id → 0 rows
// affected, no error; fresh id 17 upsert inserts normally. RETURNING on a
// 2-row VALUES insert echoes exactly 2 rows; RETURNING * shows the
// after-state (supplied + engine-assigned + DEFAULT-filled columns).

import type { DrillQ } from "../types";

const KW = "UPSERT & RETURNING";

export const UPSERT_RETURNING: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr7-ur-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which statement adds 25 to K1's shelf count whether or not product id 1 already exists?",
    choices: [
      "`INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'Mechanical Keyboard K1', 'Electronics', 89.99, 25, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock;`",
      "`INSERT INTO products VALUES (1, …) ON CONFLICT (id) SET stock = stock + 25;`",
      "`UPDATE products SET stock = stock + 25 WHERE id = 1 OR INSERT …`",
      "`INSERT OR ADD INTO products …`",
    ],
    answer: 0,
    why: "The full upsert spell: attempt the INSERT, and on a key collision DO UPDATE — where `excluded` is the row you TRIED to insert (stock 25) and the bare `stock` reads the EXISTING row (120). Engine receipt: 120 + 25 = 145 on the live db.",
    notes: [
      { choice: 1, why: "DO UPDATE needs the UPDATE keyword — `ON CONFLICT (id) SET` isn't grammar. And `stock + 25` hardcodes the delta instead of reading excluded." },
    ],
  },
  { id: "dr7-ur-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "In `ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock`, what is `excluded`?",
    choices: [
      "The row that failed the constraint — the values you tried to insert",
      "The existing row, before the update",
      "A deleted twin of the row",
      "A keyword that removes the row instead",
    ],
    answer: 0,
    why: "`excluded` IS the rejected insert attempt, exposed as a one-row table: the values that would have landed. The bare column name reads the existing row. That two-name vocabulary — `stock` = current, `excluded.stock` = attempted — is the entire upsert trick.",
    notes: [
      { choice: 1, why: "That's the bare name's job. Swapping them silently adds the CURRENT stock to itself instead of the delta." },
    ],
  },
  { id: "dr7-ur-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which write echoes back what landed, in the same statement?",
    choices: [
      "`INSERT INTO customers (name, email, city, region) VALUES ('Ivy Chen', 'ivy@example.com', 'Austin', 'US') SHOW id;`",
      "`INSERT INTO customers (name, email, city, region) VALUES ('Ivy Chen', 'ivy@example.com', 'Austin', 'US') RETURNING id, name;`",
      "`INSERT … THEN SELECT id FROM customers;`",
      "`INSERT … OUTPUT id;`",
    ],
    answer: 1,
    why: "RETURNING (SQLite 3.35+) makes any write answer back: `RETURNING id, name` echoes the engine-assigned id 17 plus the name — graded exactly like a SELECT. SHOW/OUTPUT aren't SQLite; a trailing SELECT is a second statement, not part of the write.",
    notes: [
      { choice: 3, why: "OUTPUT is SQL Server's spelling — the dialect map: Postgres and SQLite say RETURNING, MySQL has neither (LAST_INSERT_ID() instead)." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr7-ur-04", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`INSERT INTO products (id, …) VALUES (1, …) ON CONFLICT (id) DO NOTHING;` — product 1 exists. What happens?",
    choices: [
      "Error — duplicate id",
      "0 rows affected, no error — the statement stands down",
      "The existing row is deleted",
      "A second product 1 is created",
    ],
    answer: 1,
    why: "DO NOTHING is the polite collision: the insert is attempted, the key conflict is caught, and the engine walks away — changes() reports 0, error none. Feed-replay safety: running the same import twice lands the first copy and quietly skips the replay.",
    notes: [
      { choice: 0, why: "That's the BARE insert — without the ON CONFLICT clause, a duplicate id errors with 'UNIQUE constraint failed'." },
    ],
  },
  { id: "dr7-ur-05", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does `ON CONFLICT (id)` — the parenthesized target — actually name?",
    choices: [
      "The table's PRIMARY KEY or a UNIQUE column whose collision you're catching",
      "Any column you plan to update",
      "The column to exclude from the insert",
      "The row id to delete on conflict",
    ],
    answer: 0,
    why: "The target must be the conflict's KEY: products.id (PRIMARY KEY) here, or any UNIQUE-indexed column. The conflict fires when THAT key collides — targeting a plain non-unique column is a syntax-level rejection ('ON CONFLICT clause does not match…' or an unknown-target error).",
    notes: [
      { choice: 2, why: "Different concept — `excluded` names the attempted row; the parenthesized target names the key being tested." },
    ],
  },
  { id: "dr7-ur-06", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does RETURNING report for a multi-row insert of 2 products?",
    choices: [
      "One summary row with the count 2",
      "Two rows — one per written row, with that row's after-state columns",
      "Nothing — RETURNING works only on single-row writes",
      "The entire products table",
    ],
    answer: 1,
    why: "RETURNING is per-row: a two-product VALUES insert echoes two rows, each carrying the columns you asked for (id 17 and 18 engine-assigned). A multi-row insert isn't one opaque event — RETURNING makes each landed row visible, exactly the receipts the cs-1976 walkthrough promises.",
    notes: [
      { choice: 0, why: "That's the changes() count's job. RETURNING shows ROWS, the count shows NUMBERS — both scale with the VALUES list." },
    ],
  },

  // ---------- edge ----------
  { id: "dr7-ur-07", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "An upsert targets id 1 with stock 25 (existing row: 120). A teammate writes `SET stock = excluded.stock + excluded.stock`. What lands?",
    choices: [
      "50 — excluded.stock reads the attempted row on both sides (25 + 25)",
      "145 — the intended 120 + 25",
      "240 — the existing stock added to itself",
      "NULL — excluded is out of scope in arithmetic",
    ],
    answer: 0,
    why: "Both references resolve to the EXCLUDED row: 25 + 25 = 50, clobbering the real shelf count of 120 with a phantom 50. The bare/excluded distinction isn't pedantry — mixing them up writes wrong inventory. Intended spell: `stock = stock + excluded.stock` → 145.",
    notes: [
      { choice: 2, why: "That would be `stock + stock` — bare on both sides. Two excluded references never touch the existing row." },
    ],
  },
  { id: "dr7-ur-08", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`INSERT OR REPLACE INTO products (id, name, price) VALUES (1, 'K1 v2', 99.99);` — the old spelling. What's the sharp edge?",
    choices: [
      "It deletes the existing row and inserts a fresh one — unlisted columns (category, stock 120, supplier_id) fall to NULL/defaults",
      "It updates just the listed columns, keeping the rest",
      "It refuses when other columns have NOT NULL",
      "It's identical to ON CONFLICT DO UPDATE",
    ],
    answer: 0,
    why: "REPLACE is DELETE + INSERT, not UPDATE: the whole old row (stock 120, its category, its supplier link) is GONE, and the new row carries only what you listed. If category is NOT NULL without default, the replace errors — half the time. DO UPDATE keeps the untouched columns; that's why the modern spelling wins.",
    notes: [
      { choice: 1, why: "That's DO UPDATE's behavior — the very reason UPSERT was added in 3.24. OR REPLACE predates it and is the blunter instrument." },
    ],
  },
  { id: "dr7-ur-09", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "An upsert with a fresh id (17, unused — max is 16) hits `ON CONFLICT (id) DO UPDATE …`. What runs?",
    choices: [
      "The DO UPDATE branch — upserts always update",
      "The plain INSERT — no collision, so the conflict clause never fires",
      "Nothing — ON CONFLICT suppresses new rows",
      "An error — id 17 must exist first",
    ],
    answer: 1,
    why: "The conflict clause is a contingency, not a plan: with no collision on id 17, the row inserts normally and DO UPDATE never runs. Upsert = try to insert; the update branch exists only for the day the key actually collides (engine receipt: fresh-id upserts land as plain inserts).",
    notes: [
      { choice: 0, why: "Upserts don't prefer updating — they PREFER inserting. The name describes the fallback, not the goal." },
    ],
  },
  { id: "dr7-ur-10", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`INSERT … ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock WHERE excluded.price > 100;` — the guard. What does the WHERE decide?",
    choices: [
      "Which rows the SELECT returns",
      "Per-collision: only collisions whose ATTEMPTED row passes the test get updated; others stand down",
      "Whether the insert errors",
      "Which columns are excluded",
    ],
    answer: 1,
    why: "DO UPDATE may carry its own WHERE, evaluated per collision against `excluded` (the attempted row) and the existing row. A cheap keyboard restock attempt (price 89.99 ≤ 100) stands down; a flagship attempt (199.99 > 100) applies the delta. Conditional upserts — the guard is the fine print.",
    notes: [
      { choice: 0, why: "No SELECT here — the WHERE guards the UPDATE branch. Pair it with RETURNING and stood-down collisions simply echo nothing." },
    ],
  },

  // ---------- errors ----------
  { id: "dr7-ur-11", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`INSERT INTO products (id, name) VALUES (1, 'K1') ON CONFLICT (stock) DO NOTHING;` — reading the error, why does it fail?",
    choices: [
      "stock isn't the PRIMARY KEY or a UNIQUE column — it can't be a conflict target",
      "The id 1 collision can't be caught",
      "DO NOTHING needs a WHERE",
      "products is full",
    ],
    answer: 0,
    why: "Conflict targets must name a key that can DETECT collision: the PRIMARY KEY or a UNIQUE column. stock is a plain INTEGER column — duplicates in stock are ordinary data (two products can share 85) — so the engine rejects the target instead of silently watching for a conflict that can never uniquely fire.",
    notes: [
      { choice: 1, why: "It CAN be caught — just target (id). The target must match the colliding key, not whichever column you fancy." },
    ],
  },
  { id: "dr7-ur-12", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "A feed-replay import runs the same upsert twice; the second run's `RETURNING id` echoes id 1 again with the UPDATED stock. What does that tell you about RETURNING on DO UPDATE?",
    choices: [
      "RETURNING shows only inserted rows — the echo means it re-inserted",
      "RETURNING reports rows the statement WROTE, including updated ones — the echo proves the update branch ran",
      "RETURNING is broken on upserts",
      "The second run did nothing",
    ],
    answer: 1,
    why: "RETURNING's contract is 'rows this statement wrote' — inserts, updates, deletes alike. On a collision-with-update it echoes the after-state (stock 145), on DO NOTHING it echoes nothing (0 rows written). The echo is your per-row audit trail for which branch actually fired.",
    notes: [
      { choice: 3, why: "DO NOTHING is the only silent branch — DO UPDATE writes and therefore echoes. Silence vs echo is how you tell the two apart in logs." },
    ],
  },

  // ---------- predict ----------
  { id: "dr7-ur-13", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Storefront receipt: K1 (id 1) has stock 120. The upsert `… VALUES (1, 'Mechanical Keyboard K1', 'Electronics', 89.99, 25, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock` runs. What's K1's stock and what does RETURNING id, stock echo?",
    choices: [
      "145; one row: id 1, stock 145",
      "25; one row: id 1, stock 25",
      "120; no rows",
      "95; one row: id 1, stock 95",
    ],
    answer: 0,
    why: "excluded.stock is the attempted 25; bare stock is the existing 120; 120 + 25 = 145 — the engine-verified receipt. RETURNING echoes the written row's after-state: id 1, stock 145, exactly one row.",
    notes: [
      { choice: 1, why: "That's `stock = excluded.stock` — overwrite instead of accumulate. The delta vocabulary (bare + excluded) is the whole trick." },
      { choice: 3, why: "95 would be `stock − excluded.stock` — a refund-shaped bug. Sign and side both matter." },
    ],
  },
  { id: "dr7-ur-14", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "`INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (17, 'Webcam 4K', 'Video', 79.99, 10, 2) ON CONFLICT (id) DO NOTHING RETURNING id;` — ids run 1–16. What echoes back?",
    choices: [
      "One row: id 17 — a fresh insert, echoed",
      "No rows — DO NOTHING suppressed it",
      "id 1 through 16 — the whole table",
      "An error — 17 is out of range",
    ],
    answer: 0,
    why: "No collision exists (max id 16), so the row INSERTS normally and RETURNING echoes the engine-assigned id 17. DO NOTHING only fires on conflict; a clean insert is a written row and RETURNING reports every written row.",
    notes: [
      { choice: 1, why: "Suppression happens only when the key actually collides. With 16 rows present, 17 is virgin territory." },
    ],
  },
  { id: "dr7-ur-15", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "An import feed may contain the same product row twice. Where does the UPSERT belong — and where does it NOT belong?",
    choices: [
      "On the import path (feed replay safety) — and NOT as a lazy substitute for deciding whether a mismatched row is an error or an update",
      "Everywhere — upserts make all writes safe",
      "Nowhere — DELETE then INSERT is always better",
      "Only on small tables",
    ],
    answer: 0,
    why: "UPSERT is the right tool where replays are EXPECTED (idempotent imports, counters like stock + excluded.stock). It's the wrong tool when a collision means something UNEXPECTED — silently updating can bury data-quality bugs (a changed price, a mistyped id) that an error would surface. Judgment: make replays quiet; make surprises loud.",
    notes: [
      { choice: 1, why: "Idempotence is a property you want on specific paths — blanket upserts turn real collisions (wrong key, bad join) into silent overwrites." },
    ],
  },
];
