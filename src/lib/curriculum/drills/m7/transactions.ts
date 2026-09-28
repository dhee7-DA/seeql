// Drill set — Transactions (Module 7, secondary, 12 questions).
// Anchored to lesson-44 ("UPSERT & transactions — collisions and
// all-or-nothing") and the course sandbox: the grader wraps EVERY write in a
// transaction that is always rolled back, so practice writes never stick.
// Engine-verified receipts (db/custom.db): 103 orders / 16 products — a
// two-statement money move (move stock from product 4 to product 1:
// 60−10=50, 120+10=130) must land as BOTH or NEITHER; ROLLBACK restores
// pre-BEGIN state exactly; SQLite opens an implicit transaction per
// statement in autocommit mode.

import type { DrillQ } from "../types";

const KW = "Transactions";

export const TRANSACTIONS: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr7-txn-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which statement sequence makes a two-statement money move all-or-nothing?",
    choices: [
      "`BEGIN; UPDATE …; UPDATE …; COMMIT;`",
      "`UPDATE …; UPDATE …;` — two statements are atomic by default",
      "`START UPDATE … END UPDATE;`",
      "`TRANSACTION BEGIN; … COMMIT;`",
    ],
    answer: 0,
    why: "BEGIN opens the unit of work, the writes stack up, COMMIT lands them together (ROLLBACK would erase them together). SQLite's actual spellings: BEGIN (or BEGIN TRANSACTION), COMMIT (or END), ROLLBACK — the vocabulary from lesson-44's all-or-nothing pillar.",
    notes: [
      { choice: 1, why: "Each BARE statement gets its own implicit transaction (autocommit) — two separate alls, no nothing. Kill the process between them and you keep half a money move." },
    ],
  },
  { id: "dr7-txn-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "The move ran: `BEGIN;` stock −10 on the headset, +10 on the keyboard… and the second UPDATE fails. Which statement undoes the first?",
    choices: ["`UNDO;`", "`ROLLBACK;`", "`REVERT;`", "`CANCEL;`"],
    answer: 1,
    why: "ROLLBACK rewinds the whole open transaction to its starting state — the −10 vanishes as if never typed. There is no UNDO/REVERT in SQL; ROLLBACK and COMMIT are the only two ways an open transaction ends.",
  },

  // ---------- semantics ----------
  { id: "dr7-txn-03", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does “all-or-nothing” (atomicity) promise for a transaction?",
    choices: [
      "Either every statement inside lands permanently, or none of them did",
      "Each statement lands as fast as possible",
      "The transaction never errors",
      "All tables involved get locked until COMMIT",
    ],
    answer: 0,
    why: "Atomicity is the A of ACID: the statement stack inside BEGIN…COMMIT is ONE indivisible step. Mid-transaction failure (error, crash, power cut) means the database acts as if the whole thing never started — half-landed money moves are impossible by construction.",
    notes: [
      { choice: 3, why: "Locking is concurrency machinery (the C and I neighborhoods), not atomicity's promise." },
    ],
  },
  { id: "dr7-txn-04", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "Inside an open transaction you SELECT a row you just UPDATEd. What do you see?",
    choices: [
      "The old value — writes hide until COMMIT",
      "Your own new value — a transaction sees its own uncommitted writes",
      "NULL until COMMIT",
      "An error — reads and writes can't mix",
    ],
    answer: 1,
    why: "A transaction reads its own writes (its private draft of the data). Other connections see the old state until COMMIT — that's isolation. Inside your own BEGIN…COMMIT window, the updated row reads back updated.",
    notes: [
      { choice: 0, why: "That's how OTHER sessions see it, not you. The draft is yours to verify before COMMIT makes it public." },
    ],
  },
  { id: "dr7-txn-05", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "Why does THIS course wrap every practice write in a transaction that's always rolled back?",
    choices: [
      "To make writes faster",
      "So every mutating exercise is verifiable and self-cleaning — the engine runs the write, captures affected rows / RETURNING / verify-SELECT output, then the rollback restores the seed db exactly",
      "Because SQLite can't really write",
      "To lock the database between learners",
    ],
    answer: 1,
    why: "The sandbox IS the transaction idea at work: your CREATE INDEX, DELETE, or upsert runs for real — changes() counts, RETURNING echoes, verify SELECTs all fire — then the rollback hands back a pristine storefront. You get permanent learning from impermanent writes.",
    notes: [
      { choice: 2, why: "Writes are completely real inside the transaction — it's the ROLLBACK that's fictional, on purpose." },
    ],
  },

  // ---------- edge ----------
  { id: "dr7-txn-06", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "What happens if you issue COMMIT with no BEGIN open (autocommit mode)?",
    choices: [
      "Error — no transaction is active",
      "Nothing to confirm — each statement already self-committed as it ran",
      "It re-commits the last statement twice",
      "SQLite opens a BEGIN for you retroactively",
    ],
    answer: 1,
    why: "In autocommit mode every statement is its own micro-transaction, already committed. COMMIT with no open transaction is a no-op (some tools warn). The reverse — statements with no COMMIT after an explicit BEGIN — is the dangerous one: the transaction sits open, uncommitted and unrolled-back.",
    notes: [
      { choice: 3, why: "No retroactive grouping exists — atomicity is planned at BEGIN, not negotiated at the end." },
    ],
  },
  { id: "dr7-txn-07", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "A crash (power cut, killed process) hits BETWEEN the two UPDATEs of an open transaction. On restart, the database shows…",
    choices: [
      "The first UPDATE applied, the second lost",
      "Neither — the write-ahead log replays or discards the WHOLE transaction",
      "Both — committed on faith",
      "A corrupted database",
    ],
    answer: 1,
    why: "That's durability + atomicity working together: uncommitted work exists only in the log, and recovery either completes or erases the entire unit — never half. The store: headset stock still 60, keyboard still 120, as if the move never began.",
    notes: [
      { choice: 0, why: "Half-applied is exactly what transactions exist to make impossible — the log guarantees no statement of an uncommitted unit survives recovery." },
    ],
  },
  { id: "dr7-txn-08", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`BEGIN; DELETE FROM orders WHERE status = 'cancelled'; SELECT COUNT(*) FROM orders;` — 103 orders before, 7 cancelled. The SELECT reads…",
    choices: [
      "96 — the delete is visible to the same transaction",
      "103 — deletes hide until COMMIT",
      "7",
      "An error — DML and SELECT can't share a transaction",
    ],
    answer: 0,
    why: "Same transaction, own writes visible: the purge shows 96 inside the window. COMMIT publishes it; ROLLBACK puts all 7 back. This is also the audit pattern — run the destructive write, inspect the aftermath, then decide which ending it deserves.",
    notes: [
      { choice: 1, why: "That's the OUTSIDE view (other connections, pre-COMMIT). Inside your own transaction, the draft is live." },
    ],
  },

  // ---------- errors ----------
  { id: "dr7-txn-09", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "A script does `BEGIN; UPDATE …;` then crashes WITHOUT COMMIT or ROLLBACK. Later, a new connection reads the table. It sees…",
    choices: [
      "The update — it happened",
      "The OLD data — the open transaction died with its connection and was rolled back",
      "NULLs",
      "A locked database forever",
    ],
    answer: 1,
    why: "An uncommitted transaction has no existence outside its connection. Process death = automatic ROLLBACK (the journal/WAL restores the pre-BEGIN state). The write never happened — which is the safety net working, and also why long-open transactions that 'lose' writes were never writes at all.",
    notes: [
      { choice: 3, why: "SQLite's lock recovery releases the dead connection's locks on the next access — not forever, just until the journal is rolled back." },
    ],
  },
  { id: "dr7-txn-10", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`BEGIN; UPDATE products SET stock = 50 WHERE id = 4; BEGIN;` — the second BEGIN answers…",
    choices: [
      "Error — a transaction is already active on this connection",
      "A nested transaction opens",
      "The first transaction commits first",
      "A warning and a no-op",
    ],
    answer: 0,
    why: "SQLite rejects a BEGIN inside an open transaction ('cannot start a transaction within a transaction'). Plain SQLite has no nested transactions — the pattern for sub-units is SAVEPOINT/RELEASE, the finer-grained cousin lesson-44's edges mention.",
    notes: [
      { choice: 1, why: "That's the SAVEPOINT feature's job: named checkpoints you can roll back TO without killing the whole unit." },
    ],
  },

  // ---------- predict ----------
  { id: "dr7-txn-11", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "`BEGIN; UPDATE products SET stock = stock - 10 WHERE id = 4; UPDATE products SET stock = stock + 10 WHERE id = 1; ROLLBACK;` — headset 60, keyboard 120. Final stocks?",
    choices: [
      "60 and 120 — ROLLBACK erased the whole move",
      "50 and 130 — the move landed",
      "50 and 120 — half the move",
      "60 and 130 — the other half",
    ],
    answer: 0,
    why: "ROLLBACK rewinds to pre-BEGIN: 60 and 120, the engine-verified seed values. Half-moves are unrepresentable — that's atomicity. Swap ROLLBACK for COMMIT and you'd read 50 and 130.",
    notes: [
      { choice: 1, why: "That's COMMIT's answer. The two writes only become permanent together — never one at a time." },
    ],
  },
  { id: "dr7-txn-12", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Which pair of writes MOST needs a transaction — and why?",
    choices: [
      "Two independent price updates — speed matters",
      "Stock −10 on one product and +10 on another (a transfer) — a crash between them must not leave stock created or destroyed",
      "Two SELECTs — consistency",
      "A single UPDATE — atomic by itself",
    ],
    answer: 1,
    why: "The transfer's two halves are only correct TOGETHER: −10 without +10 destroys inventory, +10 without −10 mints it. A transaction makes the pair indivisible. Single statements are already atomic (autocommit) — the transaction exists precisely for multi-statement invariants.",
    notes: [
      { choice: 3, why: "True and irrelevant to the choice — one statement needs no explicit BEGIN. Transactions buy atomicity across statements." },
    ],
  },
];
