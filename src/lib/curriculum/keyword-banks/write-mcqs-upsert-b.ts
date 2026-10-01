// Keyword Mastery bank MCQs — UPSERT (ON CONFLICT), part B (18 of 40).
// Aspects: edge cases / predict-the-output / judgment calls.
import type { Mcq } from "../types";

export const upsertMcqsB: Mcq[] = [
  // ---------- edge cases ----------
  {
    id: "kb-us-q23", difficulty: "hard",
    prompt: "The price-drop guard runs twice: first with 79.99 (stored: 89.99), then with 99.99. Second run's changes and stored price?",
    choices: [
      "changes = 1, price 99.99",
      "changes = 0, price stays 79.99 — the guard WHERE excluded.price < price rejects the pricier proposal",
      "changes = 1, price stays 79.99",
      "An error — the guard fails",
    ],
    answer: 1,
    why: "The engine receipt: the pricier upsert collides, the DO UPDATE's WHERE evaluates 99.99 < 79.99 → false, the update arm is skipped, changes = 0, stored price untouched at 79.99. A guard-rejected upsert is a successful statement that did nothing — distinguishable from a plain skip only by reading the count in context.",
  },
  {
    id: "kb-us-q24", difficulty: "hard",
    prompt: "Edge: `INSERT OR REPLACE` vs `ON CONFLICT (id) DO UPDATE` on row 1 — which preserves the columns you didn't list?",
    choices: [
      "Both preserve them",
      "Only DO UPDATE — OR REPLACE deletes the old row entirely; unlisted columns fall back to DEFAULTs (stock 120 → 0)",
      "Only OR REPLACE",
      "Neither — both wipe unlisted columns",
    ],
    answer: 1,
    why: "DO UPDATE merges into the existing row: unlisted columns keep their values by construction. OR REPLACE is delete + fresh insert: unlisted columns take DEFAULTs (the probe's stock = 0 receipt). The rule of thumb: REPLACE for wholesale re-registration, DO UPDATE for surgical merges — and never confuse the two on tables with meaningful defaults.",
  },
  {
    id: "kb-us-q25", difficulty: "medium",
    prompt: "Edge: upserting against a table whose target column has NO unique constraint at all (hypothetical products without PK). The clause…",
    choices: [
      "Works, treating every insert as fresh",
      "Has nothing to arbitrate — any ON CONFLICT (col) errors since no PK/UNIQUE covers col; the table can't host upserts on that target",
      "Creates the constraint automatically",
      "Falls back to OR IGNORE",
    ],
    answer: 1,
    why: "Upsert is constraint-driven: without uniqueness on the target there IS no conflict to catch, and SQLite refuses the statement. The design consequence: upsert-ability is a schema property. Tables that need 'add or refresh' semantics must carry the unique index that defines 'same row' — the clause can't invent identity.",
  },
  {
    id: "kb-us-q26", difficulty: "hard",
    prompt: "Edge: a sync job upserts the full 16-product catalog every hour with DO UPDATE SET stock = excluded.stock, price = excluded.price. A manual correction (analyst fixed a price to 59.99) is…",
    choices: [
      "Preserved — manual edits always win",
      "Overwritten at the next sync run — last-writer-wins, and the sync is always last",
      "Merged by the engine",
      "Synced to the average of both",
    ],
    answer: 1,
    why: "Full-overwrite upserts make the source authoritative: the analyst's 59.99 (K1's neighbor correction) evaporates on the next hourly pass. Fixes: guard the arm (WHERE excluded.updated_at > updated_at), sync only changed rows, or route manual edits into the source system. Upsert design IS conflict-resolution policy — choose it deliberately.",
  },
  {
    id: "kb-us-q27", difficulty: "medium",
    prompt: "Edge: `INSERT INTO orders (id, customer_id, status, total, created_at) VALUES (104, 1, 'pending', 42.00, '2026-01-15') ON CONFLICT (id) DO NOTHING` runs on the seed, then a plain insert WITHOUT id. The plain insert's id?",
    choices: ["104 — freed by DO NOTHING", "105 — AUTOINCREMENT moved past 104 the moment the upsert ATTEMPTED it… actually: 105 only if the first consumed the id; on DO NOTHING the sqlite_sequence stays at 103, so the plain insert takes 104", "103", "Random"],
    answer: 1,
    why: "Subtle AUTOINTEREMENT semantics: DO NOTHING rolls back the row AND the sequence bump (the insert never persisted), so sqlite_sequence remains 103 and the next plain insert takes 104. Had the upsert SUCCEEDED (or OR REPLACE fired), the watermark would sit at 104 and the plain insert would take 105. Watermarks move only with persisted rows.",
  },
  {
    id: "kb-us-q28", difficulty: "medium",
    prompt: "Edge: the same upsert statement runs twice in a row (`stock = stock + excluded.stock`, batch of +25 on K1). Final stock?",
    choices: ["145", "170 — the accumulation compounds per run", "120", "95"],
    answer: 1,
    why: "Run 1: 120 + 25 = 145. Run 2: 145 + 25 = 170. Accumulating upserts are NOT idempotent — a retried delivery double-counts. Idempotent replay needs either an absolute SET (stock = excluded.stock), a dedupe key on the batch (idempotency tokens), or a transaction guard around the whole feed. The overwrite-vs-accumulate choice is an operations decision, not just SQL style.",
  },
  {
    id: "kb-us-q29", difficulty: "hard",
    prompt: "Edge: two sessions upsert the same NEW id concurrently (both see it absent). With ON CONFLICT (id) DO UPDATE SET stock = excluded.stock, stock 10 each…",
    choices: [
      "Both insert — the row ends with two entries",
      "One inserts (stock 10); the other's conflict fires and its DO UPDATE overwrites stock to its own 10 — final: one row, stock 10, no error",
      "The second errors with UNIQUE constraint failed",
      "SQLite deadlocks",
    ],
    answer: 1,
    why: "This is the upsert's raison d'être: the engine serializes on the constraint. Session A inserts; session B's insert collides, and its DO UPDATE arm rewrites the row (stock = 10 again). Final state: one row, no error, no duplicate — the race the check-then-insert pattern loses. (With DO NOTHING, B simply skips.)",
  },

  // ---------- predict-the-output ----------
  {
    id: "kb-us-q30", difficulty: "easy",
    prompt: "K1 (id 1) holds stock 120. The canonical restock upsert adds excluded.stock = 25. Changes and final stock?",
    choices: ["1 change; 145", "2 changes; 145", "1 change; 120", "0 changes; 145"],
    answer: 0,
    why: "The engine receipt — changes = 1, stock 145 (120 + 25). One statement, one counted write, whether the arm was insert or update: upserts always report at most 1 change per row (per batch row). The 145 is the course's flagship receipt; commit it to memory as the shape of accumulation.",
  },
  {
    id: "kb-us-q31", difficulty: "easy",
    prompt: "`INSERT OR IGNORE INTO suppliers (id, name, region, rating) VALUES (6, 'Andes Copy', 'LATAM', 4.0);` on the seed. Changes?",
    choices: ["1", "0 — supplier 6 exists; the ignore arm swallows the collision", "7", "Error"],
    answer: 1,
    why: "Andes Naturals SA already occupies id 6, OR IGNORE converts the would-be UNIQUE error into a no-op: changes = 0, exit clean. The 'Copy' name never lands. This is the load-job idiom for 'insert only what's missing' — cheap, idempotent, and silent, which is both its power and its audit risk. The upsert clause's OR-family ancestors still behave exactly this way — legacy spellings, modern care.",
  },
  {
    id: "kb-us-q32", difficulty: "hard",
    prompt: "The mixed 3-row upsert: ids 900 and 901 are fresh, id 1 collides, all carry `ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock`. Changes — and K1's stock (start 120, batch offers 5)?",
    choices: ["3 changes; 125", "2 changes; 125", "3 changes; 120", "1 change; 125"],
    answer: 0,
    why: "Two fresh inserts + one armed update = 3 changes; K1 lands at 120 + 5 = 125 (engine receipt). The batch demonstrates the clause's per-row branching in one statement: insert-insert-update with no aborts. Predict-the-output on upserts = census (who exists) + arithmetic (which arm, what math).",
  },
  {
    id: "kb-us-q33", difficulty: "medium",
    prompt: "`INSERT OR REPLACE INTO products (id, name, category, price, supplier_id) VALUES (1, 'K1 (2026)', 'Electronics', 99.99, 1);` — predict the FULL row after.",
    choices: [
      "(1, 'K1 (2026)', 'Electronics', 99.99, stock 120, 1)",
      "(1, 'K1 (2026)', 'Electronics', 99.99, stock 0, 1) — stock reset to DEFAULT by the fresh row",
      "(1, 'K1 (2026)', 'Electronics', 99.99, stock NULL, 1)",
      "Two rows now exist",
    ],
    answer: 1,
    why: "The engine receipt is unambiguous: the old row (stock 120) is deleted and the replacement carries stock = 0 (the column's DEFAULT) — name and price from the proposal, nothing carried over. OR REPLACE's per-column amnesia, visualized. Any column you don't re-supply resets; that's the clause's contract. That is the upsert clause's per-row arbitration at work: insert path, update arm, or error.",
  },
  {
    id: "kb-us-q34", difficulty: "medium",
    prompt: "Supplier 6's rating is 4.0. The guarded upsert offers 4.4 with `DO UPDATE SET rating = excluded.rating WHERE excluded.rating > rating`. Changes and final rating?",
    choices: ["1 change; 4.4", "0 changes; 4.0", "1 change; 4.0", "Error: WHERE not allowed in DO UPDATE"],
    answer: 0,
    why: "The guard reads 4.4 > 4.0 → true, the update fires: changes = 1, rating 4.4. Flip the proposal to 3.9 and the same statement reports 0 with 4.0 standing — the guard makes the upsert a one-way ratchet (ratings only climb). WHERE-guarded arms are how business rules ('never lower a rating', 'never raise a price') live inside the statement.",
  },
  {
    id: "kb-us-q35", difficulty: "hard",
    prompt: "A daily feed upserts 500 rows; 20 collide. With DO UPDATE accumulating stock, and the feed accidentally running twice tonight — which figure is corrupted?",
    choices: [
      "Only the 480 fresh rows",
      "The 20 colliding rows — their stock accumulated twice (the fresh 480 re-inserted cleanly as the same rows… on the second run they COLLIDE and accumulate too — all 500 are wrong)",
      "None — upserts are idempotent",
      "Only the feed's log",
    ],
    answer: 1,
    why: "Second run: the 20 original colliders collide again (+stock twice total), AND the 480 that inserted yesterday now collide too — all 500 accumulate a second time. Accumulating upserts make replay disasters out of reruns. Absolute SETs (stock = excluded.stock) or batch-level dedupe keys are the cure; 'it ran twice' is the standard incident report this MCQ predicts. The upsert clause's target must sit on a real constraint — the schema decides what can arbitrate.",
  },

  // ---------- judgment calls ----------
  {
    id: "kb-us-q36", difficulty: "medium",
    prompt: "Judgment: which scenario genuinely warrants `INSERT OR REPLACE`?",
    choices: [
      "Hourly stock accumulation from a warehouse feed",
      "Re-registering a configuration/cache row wholesale, where the new payload fully defines the row and carrying old columns would be a bug",
      "Merging a customer's changed email",
      "Price-drop-guarded catalog refresh",
    ],
    answer: 1,
    why: "OR REPLACE fits when the incoming row IS the truth — complete, self-contained, and old columns are stale by definition (config rows, cache entries). Everywhere partial (stock adds, email merges, guarded refreshes) needs DO UPDATE's precision. The clause choice encodes 'whole-row truth' vs 'column-level merge' — a real design decision, not syntax preference. Upsert thinking — propose full, arm surgically — is what keeps this pattern honest.",
  },
  {
    id: "kb-us-q37", difficulty: "hard",
    prompt: "The warehouse feed sends stock DELTAS (+25 units) with no snapshot. Which design handles a LOST feed file (yesterday's never applied) arriving today?",
    choices: [
      "Accumulating upsert — deltas commute, order never matters, total is correct regardless of arrival order",
      "Deltas can't be made safe — switch the feed to full snapshots and upsert with absolute SET",
      "Delete the product row and re-insert",
      "Apply the delta twice to compensate",
    ],
    answer: 0,
    why: "Accumulation's superpower: addition is commutative and replay-safe IF each delta applies exactly once. A lost-then-found file applies once — final stock = 120 + 25 + whatever else, correct in any order. The danger is DUPLICATE application (retries), which needs batch dedupe keys, not different arithmetic. Deltas + idempotency keys = correct inventory; snapshots are the alternative when keys are impossible. The upsert clause's OR-family ancestors still behave exactly this way — legacy spellings, modern care.",
  },
  {
    id: "kb-us-q38", difficulty: "medium",
    prompt: "Judgment: the seed db has NO unique constraint beyond PKs. The team wants to upsert customers by EMAIL. First move?",
    choices: [
      "Upsert on (email) anyway — SQLite will cope",
      "Add a UNIQUE index on customers(email) FIRST (after verifying no duplicates exist) — the constraint is what makes the upsert meaningful",
      "Upsert on id and match emails in app code",
      "Switch to MERGE",
    ],
    answer: 1,
    why: "The upsert target must sit on a real constraint: `CREATE UNIQUE INDEX idx_customers_email ON customers(email)` — after a duplicate audit, since the index build FAILS if dupes exist (the constraint defining 'same customer' is a data-modeling decision). Only then does ON CONFLICT (email) become legal. Upsert design starts at the schema, not the statement.",
  },
  {
    id: "kb-us-q39", difficulty: "hard",
    prompt: "Which upsert is IDEMPOTENT — safe under arbitrary re-runs without corrupting the seed?",
    choices: [
      "`DO UPDATE SET stock = stock + excluded.stock` (accumulate)",
      "`DO UPDATE SET stock = excluded.stock` (absolute overwrite from a full snapshot feed)",
      "`DO UPDATE SET price = price * 1.1` (compound)",
      "`DO UPDATE SET created_at = datetime('now')`",
    ],
    answer: 1,
    why: "Absolute SET reaches the same row state on every replay — the definition of idempotent. Accumulate and compound drift per run (145 → 170 → …); the timestamp churn writes noise. Snapshot-based sync upserts are the gold standard for retry safety: run once or five times, the catalog reads identically.",
  },
  {
    id: "kb-us-q40", difficulty: "hard",
    prompt: "Final judgment: the team's new import framework upserts EVERYTHING with `INSERT OR REPLACE` because 'it always works'. The sharpest objection?",
    choices: [
      "OR REPLACE is slower",
      "It silently resets any column the payload omits (stock 120 → 0 receipt), churns rowids, and turns partial payloads into data loss — DO UPDATE with explicit columns is the honest default",
      "OR REPLACE isn't valid on big tables",
      "There is no objection — it's the standard",
    ],
    answer: 2,
    why: "'Always works' = 'always overwrites': the K1 receipt (unlisted stock zeroed) is the whole objection in one receipt. Frameworks defaulting to REPLACE corrupt any table where payloads are partial and defaults aren't the truth. The objection isn't aesthetic — it's the difference between merge semantics and demolition semantics. That is the upsert clause's per-row arbitration at work: insert path, update arm, or error.",
  },
];
