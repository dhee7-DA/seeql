// Keyword Mastery bank MCQs — Transactions, part A (20 of 35). Aspects:
// syntax / semantics / errors. Prose tag ("transaction", "atomic",
// "all-or-nothing") present in every prompt or why. Receipts from drills m7 +
// scripts/m7-facts*.ts (two-statement stock move: 60−10=50 / 120+10=130).
import type { Mcq } from "../types";

export const transactionMcqsA: Mcq[] = [
  // ---------- syntax ----------
  {
    id: "kb-tr-q01", difficulty: "easy",
    prompt: "Which statement sequence makes a two-statement money move all-or-nothing?",
    choices: [
      "`BEGIN; UPDATE …; UPDATE …; COMMIT;`",
      "`UPDATE …; UPDATE …;` — two statements are atomic by default",
      "`START UPDATE … END UPDATE;`",
      "`TRANSACTION BEGIN; … COMMIT;`",
    ],
    answer: 0,
    why: "BEGIN opens the unit of work, the writes stack up, COMMIT lands them together (ROLLBACK would erase them together). SQLite's spellings: BEGIN (or BEGIN TRANSACTION), COMMIT (or END), ROLLBACK. The stock-move receipt — product 4 down 10, product 1 up 10, both or neither — is the course's flagship transaction.",
    notes: [{ choice: 1, why: "Each bare statement gets its own implicit transaction (autocommit) — two separate alls, no nothing. Kill the process between them and you keep half a money move." }],
  },
  {
    id: "kb-tr-q02", difficulty: "easy",
    prompt: "Which keyword pair is ALSO valid SQLite for ending a transaction?",
    choices: [
      "END works for COMMIT; ROLLBACK has no alias",
      "ABORT for ROLLBACK and FINISH for COMMIT",
      "SAVE for COMMIT",
      "Transactions always end with CLOSE",
    ],
    answer: 0,
    why: "SQLite accepts COMMIT and its synonym END (`END;` commits an open transaction). ROLLBACK spells rollback — ABORT is a conflict-resolution keyword, not a transaction verb. Small vocabulary, sharp meanings: BEGIN opens, COMMIT/END lands, ROLLBACK erases.",
  },
  {
    id: "kb-tr-q03", difficulty: "medium",
    prompt: "In autocommit mode (no explicit BEGIN), what is the transactional fate of ONE UPDATE statement?",
    choices: [
      "It runs outside any transaction",
      "It is its own transaction — SQLite wraps every statement in an implicit one, committing on success",
      "It stays open until COMMIT",
      "It batches with the next statement",
    ],
    answer: 1,
    why: "Autocommit means every statement is atomic BY ITSELF: the engine opens an implicit transaction, applies the write, commits. That's why a single multi-row UPDATE or a 3-row INSERT either lands wholly or not at all (the statement-atomicity receipts) — the transaction machinery is already there, just per-statement. Explicit BEGIN extends the wall across statements.",
  },
  {
    id: "kb-tr-q04", difficulty: "medium",
    prompt: "What does SAVEPOINT add inside a transaction?",
    choices: [
      "A second COMMIT",
      "A named mid-point you can ROLLBACK TO without discarding the whole transaction — `SAVEPOINT sp1; … ROLLBACK TO sp1;` keeps earlier work",
      "A backup file",
      "Extra durability for one statement",
    ],
    answer: 1,
    why: "Savepoints are nested bookmarks: work before the savepoint survives ROLLBACK TO, work after it vanishes; RELEASE sp1 folds the savepoint's work into the transaction. Use case: a multi-step import where a bad STEP 3 rewinds to the step-2 mark instead of binning steps 1–2. The transaction stays open; only the marked slice rewinds.",
  },
  {
    id: "kb-tr-q05", difficulty: "easy",
    prompt: "Which statement about transaction syntax is TRUE in SQLite?",
    choices: [
      "BEGIN … COMMIT pairs can nest freely",
      "BEGIN inside an open transaction errors ('cannot start a transaction within a transaction') — nesting is savepoint territory",
      "COMMIT can run mid-transaction for checkpoints",
      "ROLLBACK needs a savepoint name",
    ],
    answer: 1,
    why: "One explicit transaction at a time per connection: a second BEGIN is an error. Hierarchical rewind is what SAVEPOINT/RELEASE provide — nested commit-points INSIDE the one transaction. The course sandbox demonstrates the constraint from the other side: it holds the transaction, so raw BEGIN inside it fails.",
  },
  {
    id: "kb-tr-q06", difficulty: "medium",
    prompt: "In application code (e.g. an ORM's interactive transaction), where should the ROLLBACK happen?",
    choices: [
      "Manually after every statement",
      "Automatically on any thrown error — the wrapper rolls back the unit and re-raises; your code writes only the happy path inside the callback",
      "Only on Fridays",
      "Never — errors leave transactions open for inspection",
    ],
    answer: 1,
    why: "The interactive-transaction pattern: the driver opens the unit, your callback runs the statements, an exception triggers the automatic ROLLBACK, success triggers COMMIT. Manual rollback calls are for bespoke flows (savepoints, partial retries). The discipline: the transaction's fate is decided in exactly one place — the wrapper's success/error path.",
  },

  // ---------- semantics ----------
  {
    id: "kb-tr-q07", difficulty: "easy",
    prompt: "What does 'all-or-nothing' guarantee for the two-UPDATE stock move?",
    choices: [
      "Both updates run fast",
      "Every reader sees both changes or neither — no intermediate half-transfer state can commit",
      "Each update runs in its own transaction",
      "The second update retries automatically",
    ],
    answer: 1,
    why: "The transaction is the unit of visibility and durability: product 4 at 50 and product 1 at 130 appear together, after COMMIT. A crash after UPDATE 1 leaves NOTHING applied (rollback on recovery) — the half-transfer that plagues autocommitted pairs can't exist inside the unit. Atomicity is the property; all-or-nothing is its plain-English name.",
  },
  {
    id: "kb-tr-q08", difficulty: "medium",
    prompt: "ROLLBACK fires after `BEGIN; UPDATE products SET stock = 55 WHERE id = 4; UPDATE products SET price = 39.99 WHERE id = 4;`. Product 4's row is…",
    choices: [
      "Stock 55, price 39.99",
      "Exactly as before BEGIN — both writes erased",
      "Stock 55, old price",
      "Deleted",
    ],
    answer: 1,
    why: "ROLLBACK restores the pre-BEGIN state exactly: the receipt discipline (the course sandbox proves it — every write practice run leaves the seed pristine because the wrapper rolls back). No partial application, no residue. That's the transaction's promise: the unit either lands whole (COMMIT) or never existed (ROLLBACK).",
  },
  {
    id: "kb-tr-q09", difficulty: "medium",
    prompt: "Why is a two-statement transfer WITHOUT a transaction a durability risk even if both statements 'usually succeed'?",
    choices: [
      "SQL gets slower without transactions",
      "A crash, disconnect, or error between statement 1 and 2 commits a half-transfer — stock left the source and never arrived; the database is consistent per-statement but wrong per-business",
      "The second statement is ignored",
      "ROLLBACK happens automatically at disconnect",
    ],
    answer: 1,
    why: "Autocommit makes statement 1 permanent the instant it lands. Failure modes between statements are mundane: process kill, network drop, a typo'd statement 2 erroring. The business invariant ('units moved, not vanished') spans BOTH statements — only one transaction spans both. Per-statement atomicity ≠ per-business correctness.",
  },
  {
    id: "kb-tr-q10", difficulty: "medium",
    prompt: "What does COMMIT promise, beyond making changes visible?",
    choices: [
      "Durability — the changes survive crashes; SQLite's journal/WAL makes the committed state recoverable",
      "That the changes were correct",
      "That other transactions will see them in the same order",
      "A speed boost",
    ],
    answer: 0,
    why: "COMMIT's contract is durability: once it returns, the unit of work persists across process death and power loss (the write-ahead log replays it on recovery). Correctness was YOUR job — the transaction guarantees mechanics, not business truth. Visibility ordering and isolation nuances live one level up (isolation levels), but 'committed = survives' is universal.",
  },
  {
    id: "kb-tr-q11", difficulty: "hard",
    prompt: "Inside an open transaction, an UPDATE's RETURNING echoes 14 rows. The transaction then ROLLBACKs. What does a client holding that echo actually have?",
    choices: [
      "14 committed rows worth of truth",
      "Values from an uncommitted write — rolled back too; the echo described a state that now never existed",
      "A cache that outlives the rollback",
      "An error record",
    ],
    answer: 1,
    why: "Echoes are outputs of the uncommitted unit: ROLLBACK erases the write AND its result. This is why echo-reviewed commits work — the reviewer reads the echo BEFORE COMMIT, knowing it's a preview, not history. Clients must treat in-transaction echoes as provisional; only post-COMMIT echoes are facts.",
  },
  {
    id: "kb-tr-q12", difficulty: "medium",
    prompt: "SQLite's concurrency model inside a write transaction: what happens when writer B BEGINs while writer A holds a write transaction?",
    choices: [
      "Both write simultaneously — last field wins",
      "B waits (busy) or errors immediately depending on busy_timeout — SQLite allows ONE writer at a time; readers proceed under WAL",
      "A is rolled back",
      "B reads A's uncommitted rows",
    ],
    answer: 1,
    why: "Single-writer: A's write transaction locks the database for writes; B blocks ('database is locked' after busy_timeout, if set) until A commits or rolls back. WAL mode keeps readers reading during the write. Sizing transactions small is therefore a latency strategy for the whole app — long write transactions tax every other writer.",
  },
  {
    id: "kb-tr-q13", difficulty: "hard",
    prompt: "Which statement about DDL inside transactions is TRUE for SQLite?",
    choices: [
      "CREATE TABLE/INDEX can't run in a transaction",
      "SQLite DDL is transactional — CREATE/ALTER/DROP inside BEGIN…COMMIT roll back cleanly like DML",
      "DDL auto-commits immediately",
      "DDL needs its own connection",
    ],
    answer: 1,
    why: "Unlike many engines, SQLite runs schema changes transactionally: a migration that adds a table, backfills, and reindexes can be one atomic unit — a failure reverts the schema too. (Some PRAGMA toggles and VACUUM are exceptions.) That's why the course can teach 'migration = unit of work' honestly on SQLite.",
  },
  {
    id: "kb-tr-q14", difficulty: "medium",
    prompt: "The course grader wraps EVERY practice write in a transaction that is always rolled back. What property does this give the practice environment?",
    choices: [
      "Faster queries",
      "Perfect isolation: learners can run destructive UPDATEs/DELETEs freely — the seed state is pristine after every run, by construction",
      "It bypasses constraints",
      "It makes writes idempotent",
    ],
    answer: 1,
    why: "The always-rollback sandbox is transactions used as an isolation fence: the write executes for real (constraints fire, counts report, RETURNING echoes), then the rollback erases it. Learners get true engine behavior with zero state damage — the same pattern production uses for dry-run validations inside a transaction.",
  },
  {
    id: "kb-tr-q15", difficulty: "hard",
    prompt: "A unit of work contains: read stock, compute delta, write stock. Why must the READ be inside the transaction too?",
    choices: [
      "Reads are slower outside",
      "The decision (delta) derives from the read — outside the transaction, another writer can change stock between read and write, and your delta applies to a stale value (lost update)",
      "Transactions only matter for reads",
      "It doesn't need to be",
    ],
    answer: 1,
    why: "The unit of work is 'decide AND act': if the read escapes the transaction, the classic lost-update race opens (two writers read 60, both subtract 10, both write 50 — one move vanishes). Inside one transaction (with SQLite's single-writer serialization), read-compute-write is atomic. The transaction's boundary must cover every statement the DECISION depends on.",
  },
  {
    id: "kb-tr-q16", difficulty: "medium",
    prompt: "What does it mean that COMMIT is the transaction's 'point of no return'?",
    choices: [
      "Statements after COMMIT error",
      "Before COMMIT: ROLLBACK restores everything; after COMMIT: reversal needs a compensating transaction (new writes) or a backup — the database itself won't undo it",
      "COMMIT deletes the log",
      "ROLLBACK still works within 30 seconds",
    ],
    answer: 1,
    why: "The transaction window is the free-undo zone; COMMIT closes it. Post-commit 'undo' is forward-writing: an explicit compensating unit (re-adding the stock, re-inserting the rows) — which is why financial systems model reversals as first-class transactions instead of 'un-deleting'. Design reversals before you need them.",
  },

  // ---------- errors ----------
  {
    id: "kb-tr-q17", difficulty: "easy",
    prompt: "`COMMIT;` with no transaction open — SQLite's response?",
    choices: [
      "Commits nothing, silently succeeds",
      "Error: 'cannot commit — no transaction is active'",
      "Begins and commits an empty transaction",
      "Rolls back the session",
    ],
    answer: 1,
    why: "Transaction verbs demand an open transaction: COMMIT and ROLLBACK without BEGIN both error. The error is diagnostic gold — it means your BEGIN/COMMIT pairing drifted (early error path skipped the BEGIN, double-commit in a retry). In wrapper-managed code, trust the wrapper and keep raw verbs out of the callback.",
  },
  {
    id: "kb-tr-q18", difficulty: "medium",
    prompt: "Why does raw `BEGIN;` FAIL inside the course sandbox (and inside ORM interactive transactions generally)?",
    choices: [
      "BEGIN is deprecated",
      "A transaction is ALREADY open — the sandbox holds one; nesting explicit BEGINs errors with 'cannot start a transaction within a transaction'",
      "BEGIN needs admin rights",
      "The db is read-only",
    ],
    answer: 1,
    why: "The sandbox's whole design is 'one transaction, always rolled back' — your statements run inside it. A raw BEGIN asks for a second, and SQLite refuses. The lesson generalizes: inside wrapper-managed units, never hand-roll transaction control; the unit's fate (COMMIT/ROLLBACK) belongs to the wrapper.",
  },
  {
    id: "kb-tr-q19", difficulty: "hard",
    prompt: "A retry wrapper catches 'database is locked' and immediately reruns the transaction. Why can that still fail — and what's the honest retry shape?",
    choices: [
      "Locks never clear — retries are useless",
      "The retry can hit the same contention; honest retries use busy_timeout/wait with bounded attempts and jitter — and the transaction must be REPLAYABLE (same inputs, idempotent writes)",
      "Retries need a new database",
      "The first attempt's writes persist, so retry doubles them",
    ],
    answer: 1,
    why: "If the failed attempt rolled back cleanly (it did — that's the contract), a retry is safe ONLY IF the unit is deterministic/idempotent. Otherwise reruns compound relative writes. Production shape: busy_timeout for the wait, capped attempts with backoff, idempotent units (absolute SETs, upserts with absolute arms), so a replay can't corrupt.",
  },
  {
    id: "kb-tr-q20", difficulty: "medium",
    prompt: "`ROLLBACK TO sp1;` succeeded, then the connection drops before COMMIT. What persisted?",
    choices: [
      "Everything up to sp1",
      "Nothing — the whole transaction (savepoint included) rolls back on disconnect; ROLLBACK TO only rewound WITHIN the open unit",
      "Only the savepoint names",
      "Everything — disconnects auto-commit",
    ],
    answer: 1,
    why: "Savepoints are interior structure, not durability points: release/rollback-to reshuffle work inside the one unit, but the unit's fate still needs COMMIT. Connection death before COMMIT = the engine rolls back the entire unit. Durability begins and ends at COMMIT — savepoints are about mid-flight correction, not persistence. The transaction's boundary is the lesson: inside the unit, rollback undoes; outside it, commit endures.",
  },
];
