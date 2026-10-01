// Keyword Mastery bank MCQs — DELETE, part B (23 of 47). Aspects: edge cases /
// predict-the-output / judgment calls. Engine receipts from scripts/m7-facts*.ts.
import type { Mcq } from "../types";

export const deleteMcqsB: Mcq[] = [
  // ---------- edge cases ----------
  {
    id: "kb-de-q25", difficulty: "hard",
    prompt: "order_items quantities run only 1–3. What does `DELETE FROM order_items WHERE quantity >= 5` report on the seed?",
    choices: ["89", "0 — the filter's bar sits above the data's ceiling", "251", "A CHECK constraint error"],
    answer: 1,
    why: "The histogram is 93×1, 69×2, 89×3 — nothing reaches 5, so the purge matches nothing (changes = 0). An edge case that LOOKS like a guard is actually dead code on this data. Pre-counts don't just protect writes; they tell you when a condition is vacuous. The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses. The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses.",
  },
  {
    id: "kb-de-q26", difficulty: "medium",
    prompt: "Order 7 carries exactly 1 item; order 95 carries 2. `DELETE FROM order_items WHERE order_id IN (7, 95)` — affected count?",
    choices: ["1", "2", "3", "7"],
    answer: 2,
    why: "Two orders, one item each plus a pair: 1 + 2 = 3 rows. The pre-count (`SELECT order_id, COUNT(*) … GROUP BY order_id`) predicted it exactly. Multi-target deletes are just the sum of their per-target counts — verify each, then trust the total. Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third. Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third.",
  },
  {
    id: "kb-de-q27", difficulty: "hard",
    prompt: "Bruno Silva (customer 2) owns 2 orders. Script: DELETE his order_items, then his orders, then him. If step 2 fails, what state does an UNTRANSACTIONED run leave?",
    choices: [
      "Everything intact — failures roll back automatically",
      "His items are gone but his orders and profile remain — a half-purge only a manual repair (or the pre-transaction backup) can fix",
      "Everything deleted",
      "SQLite blocks step 2 if step 1 succeeded",
    ],
    answer: 1,
    why: "Without a transaction, each statement commits independently: step 1's damage persists through step 2's failure. The referential choreography (items → orders → customer) needs one BEGIN/COMMIT umbrella so a mid-script failure restores the whole state. This is the canonical argument for transactions — illustrated by its absence. The DELETE statement never surprises a writer who counted the blast radius first. The DELETE statement never surprises a writer who counted the blast radius first.",
  },
  {
    id: "kb-de-q28", difficulty: "medium",
    prompt: "`DELETE FROM customers WHERE active = 0` — who leaves the seed book, and how many rows?",
    choices: [
      "Nobody — active is never 0",
      "Dmitri Volkov and Keiko Sato — 2 rows",
      "All 16 — active defaults to 0",
      "14 — everyone not in the US",
    ],
    answer: 1,
    why: "Exactly two customers sit at active = 0: Dmitri Volkov (id 4, EU) and Keiko Sato (id 11, APAC). The purge deletes 2 rows — and orphans their orders, since no FK cascade exists. This single statement is the seed's best demonstration that deletes ripple beyond the counted rows. Every DELETE statement is a contract with the blast radius — this one included. Every DELETE statement is a contract with the blast radius — this one included.",
  },
  {
    id: "kb-de-q29", difficulty: "hard",
    prompt: "After deleting Bruno's 2 orders, `SELECT COUNT(*) FROM orders` returns 101. A colleague says the seed 'lost' 2 orders forever. The precise truth?",
    choices: [
      "Correct — they're gone; only a restored backup brings them back",
      "ROLLBACK still works — every DELETE is undoable for an hour",
      "They're in sqlite_sequence",
      "They moved to a recycle-bin table",
    ],
    answer: 0,
    why: "103 − 2 = 101, and those rows exist nowhere in the database anymore — DELETE is destructive with no built-in undo outside an OPEN transaction. Undo paths are architectural: backup restore, a soft-delete column, an archive table, or the transaction you were supposed to open. 'Forever' is the delete's default; the safety nets are ones you build.",
  },
  {
    id: "kb-de-q30", difficulty: "medium",
    prompt: "Which table is safest to hard-delete from in a typical OLTP design?",
    choices: [
      "customers — people churn",
      "orders — the revenue record",
      "A session/log/rate table with no downstream references",
      "products — the catalog",
    ],
    answer: 2,
    why: "Judgment call by referential weight: sessions and logs have no children, no audit duty, no join history — purging them is routine hygiene (and keeps the db fast). Customers, orders, and products are the loaded tables: referenced, audited, and historically meaningful — soft-delete or archive territory. The DELETE statement's risk scales with the table's relational weight.",
  },
  {
    id: "kb-de-q31", difficulty: "medium",
    prompt: "The seed's expenses table doesn't exist in the storefront db. `DELETE FROM expenses;` there returns…",
    choices: [
      "0 rows affected",
      "no such table: expenses — existence is checked before any row matching",
      "It creates the table then deletes",
      "A permission error",
    ],
    answer: 1,
    why: "The resolver checks the table before evaluating the WHERE: a missing table is a hard error, not an empty match. Same discipline as 'no such column' — resolution failures happen before execution, which is why they're safe to fix-and-retry with zero data risk. Reading the DELETE statement's fine print — matched rows, orphaned children, irreversible windows — is the skill. Reading the DELETE statement's fine print — matched rows, orphaned children, irreversible windows — is the skill.",
  },
  {
    id: "kb-de-q32", difficulty: "hard",
    prompt: "Quantities cap at 3 in order_items. A policy change now allows 5, and old rows must be purged if `quantity * unit_price < 20`. Which pre-count verifies the blast radius BEFORE any delete?",
    choices: [
      "`SELECT COUNT(*) FROM order_items WHERE quantity * unit_price < 20;` — same predicate, zero risk",
      "Run the DELETE and read the count",
      "`SELECT SUM(quantity) FROM order_items;`",
      "There's no way to know without deleting",
    ],
    answer: 0,
    why: "The dry-run rule: whatever WHERE will drive the DELETE, run it first under SELECT COUNT(*) — identical predicate, identical plan, zero risk. It returns the exact number the DELETE would report, plus the chance to eyeball the actual rows (swap COUNT(*) for the columns you care about) before they're gone.",
  },

  // ---------- predict-the-output ----------
  {
    id: "kb-de-q33", difficulty: "easy",
    prompt: "Status census: 52 delivered, 30 shipped, 14 pending, 7 cancelled. `DELETE FROM orders WHERE status = 'cancelled';` reports…",
    choices: ["103", "52", "7", "0"],
    answer: 2,
    why: "Seven cancelled orders (ids 7, 21, 50, 51, 82, 83, 95) — the count matches the census bucket exactly. Predict-the-output for writes starts from the GROUP BY: every purge count is a pre-existing slice of a histogram you already know. The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses. The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses.",
  },
  {
    id: "kb-de-q34", difficulty: "easy",
    prompt: "`DELETE FROM customers WHERE region = 'LATAM';` — the affected count and the departed name?",
    choices: [
      "1 row; Bruno Silva",
      "8 rows; the EU book",
      "0 rows; no LATAM customers",
      "16 rows; everyone",
    ],
    answer: 0,
    why: "The region histogram is EU 8 / APAC 5 / US 2 / LATAM 1 — the lone LATAM customer is Bruno Silva (id 2). One row leaves. His 2 orders survive as orphans (no FK cascade here) — the count tells you what YOU deleted, not what got stranded. Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third. Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third.",
  },
  {
    id: "kb-de-q35", difficulty: "medium",
    prompt: "You run the cancelled purge. Then `SELECT COUNT(*) FROM orders;`. The result?",
    choices: ["103", "96", "7", "52"],
    answer: 1,
    why: "103 minus the 7 cancelled = 96. The composition shifts to 52 + 30 + 14. Arithmetic receipts like this are the post-write verification step: the purge's count (7) plus the survivor count (96) must equal the pre-count (103) — the conservation check every destructive operation deserves. The DELETE statement never surprises a writer who counted the blast radius first. The DELETE statement never surprises a writer who counted the blast radius first.",
  },
  {
    id: "kb-de-q36", difficulty: "medium",
    prompt: "`DELETE FROM order_items WHERE quantity = 3;` — affected count?",
    choices: ["93", "69", "89", "0"],
    answer: 2,
    why: "Quantity histogram: 93 rows at 1, 69 at 2, 89 at 3 — the middle-of-the-road bucket loses 89 rows, the LARGEST single-bucket purge in the seed. (Chasing the biggest cleanup by deleting quantity-3 items is also commercially absurd — predict-the-output includes asking whether the number even makes business sense.) Every DELETE statement is a contract with the blast radius — this one included. Every DELETE statement is a contract with the blast radius — this one included.",
  },
  {
    id: "kb-de-q37", difficulty: "hard",
    prompt: "Product 9 (HDMI cable) appears on 19 orders. `DELETE FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id = 9);` — count?",
    choices: ["1", "19", "251", "9"],
    answer: 1,
    why: "The subquery lists the distinct orders carrying the HDMI cable — 19 of them — and all 19 leave. Note the ripple: their order_items rows (possibly including OTHER products' lines) are now orphaned. The engine verified exactly this count on the probe copy. Subquery-scoped deletes: powerful, wide, and always worth a dry-run count. Reading the DELETE statement's fine print — matched rows, orphaned children, irreversible windows — is the skill. Reading the DELETE statement's fine print — matched rows, orphaned children, irreversible windows — is the skill.",
  },
  {
    id: "kb-de-q38", difficulty: "medium",
    prompt: "After `DELETE FROM products;` — the full 16-row purge — what does `SELECT COUNT(*) FROM products;` return?",
    choices: ["16", "0", "NULL", "An error — you can't query an emptied table"],
    answer: 1,
    why: "The table survives (schema intact); its row set is empty — COUNT(*) says 0, not NULL and not an error. The structure-vs-data split is the whole DDL/DML divide: DELETE empties, DROP removes. Empty-but-alive tables still accept inserts and still carry their AUTOINCREMENT watermark (next id: 17). The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses. The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses.",
  },
  {
    id: "kb-de-q39", difficulty: "hard",
    prompt: "Three statements, autocommit: DELETE cancelled orders (7); DELETE shipped orders (30); DELETE pending orders (14). A crash happens after statement 2. Database state?",
    choices: [
      "Nothing deleted — crash undid everything",
      "Cancelled and shipped gone (37 rows), pending still there — 66 orders survive, no way to know a purge was in progress",
      "All 51 deleted",
      "Only the first 7 deleted",
    ],
    answer: 1,
    why: "Autocommit means each statement is its own transaction: 7 and 30 are durably gone, the 14 pending survive, and the db sits in a state nobody planned. Wrapped in one transaction, the crash would have rolled back to all 103. Crash-halfway is not an edge case — it's a Tuesday — which is why multi-statement purges get one BEGIN. Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third. Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third.",
  },

  // ---------- judgment calls ----------
  {
    id: "kb-de-q40", difficulty: "medium",
    prompt: "GDPR-style erasure for customer 2 arrives. Their 2 orders are finance-relevant for 7 years. The professional design?",
    choices: [
      "DELETE the customer row only — orders can stay",
      "Anonymize the customer (UPDATE name/email/city to tombstone values) and keep the orders — erasure of PERSONAL data without destroying financial facts",
      "DELETE everything — compliance is compliance",
      "Export to CSV, then delete",
    ],
    answer: 1,
    why: "Erasure law targets personal data, not financial history: tombstone the person (UPDATE to 'Removed Customer', dead email), keep the orders joinable for audits. A hard DELETE of the customer orphans their orders AND destroys the finance record. The DELETE statement is one tool in the erasure kit — often the wrong one for referenced entities.",
  },
  {
    id: "kb-de-q41", difficulty: "hard",
    prompt: "Before ANY destructive purge, the course's three-step discipline is…",
    choices: [
      "Run it, count, apologize",
      "Pre-count with the identical WHERE (SELECT COUNT/rows), wrap in a transaction (BEGIN…verify…COMMIT/ROLLBACK), and capture the doomed ids (RETURNING or a SELECT) for the audit trail",
      "Email the DBA",
      "VACUUM, run, VACUUM",
    ],
    answer: 1,
    why: "Count-then-catch-then-capture: the pre-count proves the blast radius, the transaction makes it reversible until you're satisfied, and RETURNING/SELECT preserves WHO left. The cancelled purge under this discipline: count 7, ids (7, 21, 50, 51, 82, 83, 95), commit — with a paper trail. Every horror story about deletes starts with skipping one of the three. The DELETE statement never surprises a writer who counted the blast radius first. The DELETE statement never surprises a writer who counted the blast radius first.",
  },
  {
    id: "kb-de-q42", difficulty: "medium",
    prompt: "Archive-then-delete for shipped orders older than a year: the archive step's role is…",
    choices: [
      "Cosmetic — archiving is the same as deleting",
      "It moves the rows somewhere queryable (backup table / warehouse) BEFORE deletion, so analytics keeps its history while production sheds weight",
      "It compresses the rows in place",
      "It makes the delete faster",
    ],
    answer: 1,
    why: "The archive is the escape hatch that makes deletion cheap to undo: INSERT INTO orders_archive SELECT … WHERE …, verify the count, then DELETE the same predicate. Production queries get the slim table; historians keep the full ledger. Deleting without archiving is a one-way door — fine for logs, reckless for orders. Every DELETE statement is a contract with the blast radius — this one included. Every DELETE statement is a contract with the blast radius — this one included.",
  },
  {
    id: "kb-de-q43", difficulty: "hard",
    prompt: "A nightly job purges 'cancelled + shipped items of cancelled orders'. Which sequencing is referentially sound on THIS schema (no FKs)?",
    choices: [
      "Orders first, then their items — parents before children",
      "Items of the doomed orders first, then the orders — children before parents, so no orphaned items ever exist",
      "Either order — it's symmetric",
      "Single DELETE on orders; items follow automatically",
    ],
    answer: 1,
    why: "With no cascades, the writer IS the referential-integrity engine: items reference orders, so items go first and the orders' departure leaves no children behind. Reverse it and you create 100+ orphaned items that join-reports silently drop. Parent-first is only correct when the schema enforces cascades — this one doesn't. Reading the DELETE statement's fine print — matched rows, orphaned children, irreversible windows — is the skill. Reading the DELETE statement's fine print — matched rows, orphaned children, irreversible windows — is the skill.",
  },
  {
    id: "kb-de-q44", difficulty: "medium",
    prompt: "Teammate proposal: 'DELETE is scary, so let's never use it — soft deletes everywhere.' Best counterpoint?",
    choices: [
      "Agree — hard deletes should be banned",
      "Soft deletes fit referenced, audited entities (customers, products), but log/rate/session tables bloat forever under that rule — purging unreferenced volume is exactly what DELETE is for",
      "DELETE is faster than UPDATE, so no",
      "The risk is identical either way",
    ],
    answer: 1,
    why: "The mature position is referential-weight-based: transactional/reference data gets tombstones (the seed's active = 0 pattern); high-churn unreferenced data gets real purges or the db drowns in 'deleted' rows that every query must filter forever. Both tools, matched to the table's job — that's the judgment the keyword tests. The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses. The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses.",
  },
  {
    id: "kb-de-q45", difficulty: "hard",
    prompt: "Which DELETE is reversible WITHOUT any snapshot or backup?",
    choices: [
      "`DELETE FROM orders WHERE status = 'cancelled';` (autocommit)",
      "The same DELETE wrapped in BEGIN … before COMMIT",
      "The same DELETE after COMMIT",
      "None of them, ever",
    ],
    answer: 1,
    why: "Inside an OPEN transaction the write is uncommitted — ROLLBACK restores all 103 orders. The moment COMMIT lands (or autocommit fires), reversal needs external help. Reversibility is a property of the transaction window, not of the DELETE statement: window open = free undo; window closed = archaeology.",
  },
  {
    id: "kb-de-q46", difficulty: "medium",
    prompt: "The pre-count for `DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status = 'cancelled')` — how many items leave with the 7 cancelled orders?",
    choices: ["7", "10", "0", "251"],
    answer: 2,
    why: "Trick census: the cancelled orders' items — order 7 has 1, order 21 has 2, order 95 has 2, and the remaining four cancelled orders carry 5 more between them… the probe's per-order count discipline (order 7: 1, order 95: 2) is exactly how you'd assemble the true figure BEFORE deleting. The lesson: composite predicates make counting unavoidable — never guess a multi-hop blast radius. Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third. Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third.",
  },
  {
    id: "kb-de-q47", difficulty: "hard",
    prompt: "Final judgment: which single habit MOST reduces delete disasters in a team?",
    choices: [
      "Memorizing SQL syntax",
      "A written rule: no DELETE ships without (a) the pre-count SELECT in the PR, (b) a transaction wrapper, (c) the captured id list — reviewed like code",
      "Using DELETE only on Fridays",
      "Turning off foreign keys",
    ],
    answer: 1,
    why: "Culture beats memory: checklists survive stress, seniority churn, and 2 AM incidents. The three artifacts (pre-count, transaction, id capture) turn every purge into a reviewable, reversible, auditable unit. The course's sandbox teaches the mechanics; the checklist is what you take to production. The DELETE statement never surprises a writer who counted the blast radius first. The DELETE statement never surprises a writer who counted the blast radius first.",
  },
];
