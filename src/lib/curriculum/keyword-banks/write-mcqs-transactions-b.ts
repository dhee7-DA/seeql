// Keyword Mastery bank MCQs — Transactions, part B (15 of 35). Aspects:
// edge cases / predict-the-output / judgment calls.
import type { Mcq } from "../types";

export const transactionMcqsB: Mcq[] = [
  // ---------- edge cases ----------
  {
    id: "kb-tr-q21", difficulty: "hard",
    prompt: "Edge: process killed mid-transaction (after UPDATE 1 of the stock move, before COMMIT). On restart, the database shows…",
    choices: [
      "UPDATE 1 applied, UPDATE 2 lost",
      "Neither — the journal/WAL replays the rollback; the pre-BEGIN state is recovered exactly",
      "Both — crash commits automatically",
      "A corrupt database",
    ],
    answer: 1,
    why: "Crash recovery is the transaction's crown jewel: the unfinished unit never existed from the reader's perspective. The engine's journal (or WAL) holds enough to undo the partial work on next open. The stock move's guarantee — 50 and 130 together or 60 and 120 together — survives even the machine's death mid-flight.",
  },
  {
    id: "kb-tr-q22", difficulty: "medium",
    prompt: "Edge: autocommit script — purge items (statement 1), purge orders (statement 2). Crash after 1. The state is…",
    choices: [
      "Clean — nothing happened",
      "Half-purged: items gone, orders alive — each statement was its own transaction, so no engine will repair the gap",
      "Both purged",
      "Corrupt database",
    ],
    answer: 1,
    why: "Autocommit committed statement 1 durably before the crash; statement 2 never ran. The referential damage (orphaned orders pointing at nothing… here, orders whose items vanished) persists until a human or script repairs it. One BEGIN around both statements converts this from 'when will it crash' to 'never halves'. The transaction's boundary is the lesson: inside the unit, rollback undoes; outside it, commit endures.",
  },
  {
    id: "kb-tr-q23", difficulty: "hard",
    prompt: "Edge: a transaction holds BEGIN … UPDATE … [30 seconds of app-side HTTP calls] … COMMIT. The sharpest operational cost?",
    choices: [
      "The HTTP calls get slower",
      "The write lock is held for the whole window — every other writer blocks or times out ('database is locked'); keep units short, move I/O outside",
      "The rollback log fills the disk",
      "COMMIT becomes impossible after I/O",
    ],
    answer: 1,
    why: "The transaction's lock lives from first write to COMMIT: 30 seconds of network latency taxes every concurrent writer in the app. Discipline: compute/read/fetch OUTSIDE the unit; inside goes only decide-and-write. The unit of work should be seconds of CPU, not round trips of network.",
  },
  {
    id: "kb-tr-q24", difficulty: "medium",
    prompt: "Edge: inside one transaction, statement 2 fails (constraint error) but statements 1 and 3 were fine. With the standard wrapper behavior (rollback on exception), what lands?",
    choices: [
      "Statements 1 and 3",
      "Nothing — the error aborts the whole unit; per-statement triage is impossible inside one all-or-nothing transaction",
      "Statement 3 only",
      "Everything — errors don't affect transactions",
    ],
    answer: 1,
    why: "All-or-nothing has no per-statement veto: the failed statement poisons the unit, and the wrapper's rollback erases 1 and 3 with it. If MOSTLY-independent steps must survive individually bad ones, that's N small transactions (per-row statements) or savepoint-per-step choreography — an explicit design decision, not an accident.",
  },
  {
    id: "kb-tr-q25", difficulty: "hard",
    prompt: "Edge: reader queries the storefront WHILE the stock-move transaction is open (WAL mode). What does the reader see?",
    choices: [
      "Half the move — stock left product 4, not yet at product 1",
      "The pre-transaction snapshot — 60 and 120; uncommitted work is invisible, and WAL lets readers proceed during the write",
      "An error — the db is locked",
      "The post-commit state early",
    ],
    answer: 1,
    why: "Isolation's reader promise: no dirty reads. WAL readers see the last COMMITTED snapshot (60/120) while the writer works on its private view. The half-transfer never becomes visible to anyone — that's atomicity (all-or-nothing) working with isolation (invisibility until commit). The two properties together are why the money-move story holds under concurrency.",
  },
  {
    id: "kb-tr-q26", difficulty: "medium",
    prompt: "Edge: two quick transactions both sell the LAST unit: T1 reads stock 1 → writes 0; T2 reads stock 1 → writes 0, both commit. What happened?",
    choices: [
      "Impossible — SQLite prevents it",
      "A lost update IF the reads escaped the transactions; with the read inside the unit (and SQLite's single-writer serialization), T2's read sees T1's committed 0 and can refuse the sale",
      "Stock becomes -2",
      "One transaction is discarded",
    ],
    answer: 1,
    why: "The read-must-be-inside rule from the semantics bank, visualized: readers outside the unit both saw 1 and both wrote 0 — one sale lost, oversold inventory. With the decision inside the unit, the second writer's read (serialized after T1's commit) sees 0 and the app refuses. Concurrency correctness = transaction boundary covering the decision's inputs.",
  },

  // ---------- predict-the-output ----------
  {
    id: "kb-tr-q27", difficulty: "easy",
    prompt: "BEGIN; UPDATE products SET stock = stock - 10 WHERE id = 4; UPDATE products SET stock = stock + 10 WHERE id = 1; COMMIT; — starting stocks 60/120. What do readers see AFTER COMMIT?",
    choices: [
      "50 and 130 — both together, exactly once",
      "50 and 120 (half-applied)",
      "60 and 130 (half-applied)",
      "60 and 120 (nothing applied)",
    ],
    answer: 0,
    why: "The flagship receipt: after COMMIT the move is fully visible — 50/130; after ROLLBACK (or crash) it's 60/120. No reader ever sees 50/120. The transaction converts two writes into ONE event — that's the whole keyword in one line of arithmetic.",
  },
  {
    id: "kb-tr-q28", difficulty: "medium",
    prompt: "BEGIN; UPDATE orders SET status = 'cancelled' WHERE status = 'pending'; ROLLBACK; — then SELECT COUNT(*) FROM orders WHERE status = 'cancelled'. The count?",
    choices: ["21 (7 + 14)", "7", "14", "0"],
    answer: 1,
    why: "The sweep touched 14 pending orders, but ROLLBACK erased the unit: cancelled stays at its original 7 (ids 7, 21, 50 … 95). Predict-the-output inside transactions = track the unit's fate FIRST (commit? rollback?), then the arithmetic. The rolled-back write never happened as far as any reader is concerned.",
  },
  {
    id: "kb-tr-q29", difficulty: "medium",
    prompt: "BEGIN; DELETE FROM order_items WHERE order_id = 7; DELETE FROM orders WHERE id = 7; COMMIT; — order 7 carries 1 item. What's the post-commit state?",
    choices: [
      "1 item gone, order 7 gone — the full cascade, atomically",
      "Item gone, order alive",
      "Order gone, item alive",
      "Nothing — DELETEs need their own transactions",
    ],
    answer: 0,
    why: "Both deletes land together: the child (1 item) and the parent (order 7) leave in one commit — no orphan window ever existed. This is the transaction doing what the schema's missing FK-cascade would have done, manually. The pre-counts (1 item, 1 order) + one unit = a referentially sound purge.",
  },
  {
    id: "kb-tr-q30", difficulty: "hard",
    prompt: "SAVEPOINT sp; UPDATE products SET price = 89.99 WHERE id = 1; SAVEPOINT sp2; UPDATE products SET stock = 0 WHERE id = 1; ROLLBACK TO sp2; COMMIT; — K1's final row?",
    choices: [
      "price 89.99, stock 0 — both writes committed",
      "price 89.99, stock UNCHANGED (120) — ROLLBACK TO sp2 erased only the stock write; the price write survived the commit",
      "Neither write applied",
      "Error — nested savepoints are illegal",
    ],
    answer: 1,
    why: "ROLLBACK TO sp2 rewinds only to the sp2 mark: the stock zeroing vanishes, the earlier price write remains in the unit, and COMMIT lands it. Receipt logic: price 89.99 (written before sp2), stock 120 (write after sp2, rolled back). Savepoints = surgical rewind INSIDE the atomic unit — the price survived, the stock didn't.",
  },
  {
    id: "kb-tr-q31", difficulty: "medium",
    prompt: "One autocommitted statement: `UPDATE products SET stock = stock + CASE id WHEN 4 THEN -10 WHEN 1 THEN +10 END WHERE id IN (1, 4)` (stocks 60/120). A crash DURING the statement — before its implicit commit — leaves…",
    choices: [
      "50 and 130 (statement-level atomicity: the whole statement rolls back, so actually 60 and 120)",
      "50 and 120",
      "Undefined",
      "60 and 130",
    ],
    answer: 0,
    why: "Careful reading: statement atomicity means the crash rolls back the ENTIRE statement — stocks stay 60/120, never 50/120. The single-statement CASE transfer gets all-or-nothing for free (one implicit transaction). When your two-statement move fits in one UPDATE, the transaction is already built in — that's the quiet superpower the CASE-in-SET idiom exploits.",
  },

  // ---------- judgment calls ----------
  {
    id: "kb-tr-q32", difficulty: "hard",
    prompt: "Judgment: which does NOT belong inside the same transaction as the stock deduction?",
    choices: [
      "The stock deduction UPDATE itself",
      "The verify SELECT confirming stock ≥ 0",
      "Sending the customer a confirmation EMAIL",
      "The order-status UPDATE",
    ],
    answer: 2,
    why: "The unit of work = the database state change and its guards (write, verify, related writes). Email is an external side effect: it can't roll back, and holding the transaction open for SMTP taxes every writer. Production pattern: commit the unit, then emit the message — with an outbox row (inserted IN the transaction) as the reliable bridge.",
  },
  {
    id: "kb-tr-q33", difficulty: "medium",
    prompt: "Judgment: a single-statement absolute update (`SET stock = 55 WHERE id = 4`). Explicit BEGIN…COMMIT around it — worth it?",
    choices: [
      "Never — single statements are already atomic",
      "Marginal — autocommit already makes the statement atomic; the explicit unit only pays when you'll READ the count/echo and decide (commit vs rollback) before landing it",
      "Always — more transactions are better",
      "Only on writes over 1000 rows",
    ],
    answer: 1,
    why: "Atomicity is free per statement; what the explicit unit buys is the DECISION WINDOW (verify the echo/count, then commit). If nobody reads anything before the commit, the wrapper is ceremony. Match the machinery to the decision: no decision → autocommit; reviewable write → explicit unit.",
  },
  {
    id: "kb-tr-q34", difficulty: "hard",
    prompt: "Judgment: the migration adds a column, backfills 251 order_items rows, creates an index. The professional packaging on SQLite?",
    choices: [
      "Three autocommitted steps — migrations can't be atomic",
      "One transaction (SQLite DDL is transactional): BEGIN, ALTER, backfill batched, CREATE INDEX, verify counts, COMMIT — or everything reverts",
      "One transaction per row",
      "No transaction — DDL is instant anyway",
    ],
    answer: 1,
    why: "SQLite's transactional DDL makes migrations true units of work: a half-migrated schema (column added, backfill incomplete) is exactly the state all-or-nothing exists to prevent. Batch the backfill to keep the write window sane, verify the census inside the unit, commit once. The half-applied migration is the operational bug this packaging eliminates.",
  },
  {
    id: "kb-tr-q35", difficulty: "hard",
    prompt: "Final judgment: the deepest reason transactions matter to a SQL analyst (not just a DBA) is…",
    choices: [
      "They make queries faster",
      "They define the unit of correctness: every multi-step business rule (transfer, purge, migration) is only as true as its transaction boundary — knowing where the wall goes is data modeling",
      "They replace backups",
      "They're required for RETURNING",
    ],
    answer: 1,
    why: "Analysts write multi-statement logic constantly (stage, reconcile, land) and every such script is a transaction-shaped question: which steps must succeed TOGETHER for the business claim to hold? Drawing that boundary — and knowing autocommit quietly draws it per statement — is the difference between scripts that are usually right and units that are all-or-nothing right.",
  },
];
