// Keyword Mastery bank MCQs — RETURNING, part B (22 of 44). Aspects: edge
// cases / predict-the-output / judgment calls. Engine receipts verified.
import type { Mcq } from "../types";

export const returningMcqsB: Mcq[] = [
  // ---------- edge cases ----------
  {
    id: "kb-re-q23", difficulty: "hard",
    prompt: "Edge: insert a customer omitting `active` (DEFAULT 1). What does `RETURNING active` echo?",
    choices: [
      "NULL — it wasn't supplied",
      "1 — the echo shows the STORED value, default applied",
      "0",
      "An error — defaulted columns can't echo",
    ],
    answer: 1,
    why: "The echo mirrors the landed row: the probe's insert-without-active echoed (id 17, active 1). RETURNING is the ground truth of what the row BECAME — defaults, assigned ids, coerced types all included. It's the cheapest schema-teaching tool: write a row, echo *, read what the engine actually kept. The RETURNING clause is the write's own receipt printer — this pattern is one of its core jobs.",
  },
  {
    id: "kb-re-q24", difficulty: "medium",
    prompt: "Edge: `DELETE FROM orders WHERE status = 'returned' RETURNING id;` — no 'returned' orders exist. The client sees…",
    choices: [
      "An error",
      "A success with an EMPTY result set — zero rows echoed, changes = 0",
      "NULL rows",
      "All 103 orders",
    ],
    answer: 1,
    why: "Writes with nothing to write succeed vacuously: empty echo, count 0. The app-side discipline: distinguish 'empty because nothing matched' from 'empty because a guard skipped' by checking the count alongside the echo. Both are changes = 0; only the surrounding intent knows which is right.",
  },
  {
    id: "kb-re-q25", difficulty: "hard",
    prompt: "Edge: the Audio sweep echoes 3 rows. Another client inserts a new Audio product BETWEEN your UPDATE and your app reading the echo. Your echo contains…",
    choices: [
      "4 rows — the echo re-runs the query",
      "Exactly your 3 rows — the echo was materialized inside the write statement, immune to later writers",
      "0 rows",
      "The new product only",
    ],
    answer: 1,
    why: "RETURNING is not a follow-up SELECT: the echoed rows are produced by the write itself, before any other statement runs. Concurrency can't inflate or deflate it. That isolation is precisely why the echo is trustworthy for audit trails while a SELECT-after-write can read OTHER writers' rows. The RETURNING clause collapses the follow-up query into the write itself.",
  },
  {
    id: "kb-re-q26", difficulty: "medium",
    prompt: "Edge: `INSERT INTO orders (…) VALUES (1, 'pending', 88.50, '2026-01-15'), (2, 'delivered', 42.00, '2026-01-16') RETURNING *;` — the echo's column ORDER follows…",
    choices: [
      "Alphabetical",
      "The order listed in RETURNING * = the table's declared column order (id, customer_id, status, total, created_at)",
      "The VALUES order",
      "Random",
    ],
    answer: 1,
    why: "RETURNING * expands to the table's declared column order — same rule as SELECT *. The probe echoed (id, customer_id, status, total, created_at)-shaped rows. Column ORDER is cosmetic for named access but matters for positional consumers (drivers reading by index) — one more reason to prefer named access in app code. That is the RETURNING clause doing its quietest, most valuable work.",
  },
  {
    id: "kb-re-q27", difficulty: "hard",
    prompt: "Edge: an OR REPLACE upsert (`INSERT OR REPLACE … RETURNING id, stock`) fires on existing id 1 where the payload omits stock. The echo shows stock as…",
    choices: [
      "The old 120 — REPLACE preserves it",
      "0 — the DEFAULT of the fresh replacement row; the echo reports what landed",
      "NULL",
      "The echo is empty",
    ],
    answer: 1,
    why: "OR REPLACE deleted and re-inserted; the fresh row's stock is DEFAULT 0, and the echo faithfully reports 0. The RETURNING clause is the honest witness that makes REPLACE's amnesia visible — echo * before adopting OR REPLACE in any pipeline and the zeroed columns announce themselves.",
  },
  {
    id: "kb-re-q28", difficulty: "medium",
    prompt: "Edge: 500-row import with RETURNING id — 20 rows collide and DO NOTHING absorbs them. The echo contains…",
    choices: [
      "500 rows",
      "480 rows — only the landed inserts echo; the absorbed 20 are absent",
      "20 rows — only the skipped ones",
      "0 rows",
    ],
    answer: 1,
    why: "One echo row per CHANGED row: 480 inserts echo, 20 skips don't. The count (500 attempted) vs echo (480 landed) delta IS the dedupe report — no separate query needed. Apps comparing attempted-to-echoed counts get skip auditing for free.",
  },
  {
    id: "kb-re-q29", difficulty: "hard",
    prompt: "Edge: within ONE transaction: UPDATE A … RETURNING x, then INSERT B using that echoed x. If the INSERT fails and the transaction ROLLBACKs, the echoed x was…",
    choices: [
      "Already committed — echoes persist",
      "Part of the uncommitted write — rolled back too; the echo was real only inside the transaction's window",
      "Cached forever",
      "Converted to NULL",
    ],
    answer: 1,
    why: "The echo is produced by the uncommitted write: on ROLLBACK, both the UPDATE and its echoed values vanish. Chaining echoes across statements inside one transaction is exactly the right pattern (ids for child rows) — and the transaction is what makes the chain atomic. Echoes are not side channels that escape the transaction's fate. The RETURNING clause speaks SELECT's projection language over the changed rows.",
  },

  // ---------- predict-the-output ----------
  {
    id: "kb-re-q30", difficulty: "easy",
    prompt: "`INSERT INTO orders (customer_id, status, total, created_at) VALUES (1, 'pending', 88.50, '2026-01-15'), (2, 'delivered', 42.00, '2026-01-16') RETURNING id, total;` — the echo?",
    choices: [
      "(104, 88.5) and (105, 42) — next two ids after the seed's 103",
      "(1, 88.5) and (2, 42)",
      "(103, 88.5) only",
      "Empty",
    ],
    answer: 0,
    why: "The engine receipt: ids 104 and 105 — AUTOINCREMENT climbs past the 103 watermark — with the supplied totals. Predict-the-output for insert echoes = next-ids arithmetic plus the supplied/defaulted columns. Both rows echoed because both rows landed.",
  },
  {
    id: "kb-re-q31", difficulty: "easy",
    prompt: "`DELETE FROM orders WHERE status = 'cancelled' RETURNING id;` — echo count and content?",
    choices: [
      "7 rows: ids 7, 21, 50, 51, 82, 83, 95",
      "96 rows: the survivors",
      "1 row: the count",
      "Empty",
    ],
    answer: 0,
    why: "Seven cancelled orders leave, and the echo lists exactly those ids — the engine receipt verbatim. The echo is the purge's manifest: attach it to the ops log and the deletion is documented row-by-row, atomically. (Cross-check: 103 − 7 = 96 survive.)",
  },
  {
    id: "kb-re-q32", difficulty: "medium",
    prompt: "`UPDATE products SET price = price * 1.1 WHERE category = 'Audio' RETURNING id, ROUND(price, 2) AS new_price;` — echo?",
    choices: [
      "3 rows: (4, 164.99), (5, 130.9), (6, 65.99)",
      "16 rows: whole catalog",
      "1 row: the average",
      "3 rows with the OLD prices",
    ],
    answer: 0,
    why: "Three Audio rows, after-images with the rounded new prices — the engine receipt verbatim (the AS alias names the expression). The echo proves both the scope (3 rows) and the arithmetic (new prices) in one artifact. This is the predict-the-output gold standard: census + expression + image-timing.",
  },
  {
    id: "kb-re-q33", difficulty: "medium",
    prompt: "`INSERT INTO customers (name, email, city, region, active, created_at) VALUES ('Echo Person', 'echo@x.io', 'Echo City', 'APAC', 1, '2026-01-15') RETURNING id, active;` — echo?",
    choices: [
      "(17, 1) — next customer id, supplied active",
      "(1, 1)",
      "(16, 1)",
      "(17, NULL)",
    ],
    answer: 0,
    why: "The seed's customer watermark is 16, so the engine assigns 17 — the probe receipt is exactly (17, 1). Insert echoes teach id arithmetic: next id = max watermark + 1, whether or not you supplied the id column.",
  },
  {
    id: "kb-re-q34", difficulty: "hard",
    prompt: "`INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'K1', 'Electronics', 89.99, 30, 1) ON CONFLICT (id) DO UPDATE SET stock = excluded.stock RETURNING id, stock;` — echo?",
    choices: [
      "(1, 30) — the update arm fired; stock overwrote to the proposal",
      "(1, 150) — accumulated 120 + 30",
      "(17, 30) — inserted as new",
      "Empty — the guard skipped",
    ],
    answer: 0,
    why: "The arm that fires supplies the echo: DO UPDATE SET stock = excluded.stock is the OVERWRITE spelling, so K1 lands at 30 — engine receipt (1, 30), changes = 1. (The accumulate spelling, stock + excluded.stock, would have echoed 150.) The echo disambiguates which arithmetic ran — read it like a test assertion.",
  },
  {
    id: "kb-re-q35", difficulty: "medium",
    prompt: "`INSERT INTO products (name, category, price, supplier_id) VALUES ('Echo Pad', 'Electronics', 19.99, 1) RETURNING *;` — how many columns, and what stock?",
    choices: [
      "6 columns (id, name, category, price, stock, supplier_id); stock 0 — the DEFAULT, revealed by the echo",
      "4 columns — only what was supplied; stock absent",
      "6 columns; stock NULL",
      "1 column",
    ],
    answer: 0,
    why: "RETURNING * expands to the full row: the probe echoed 6 columns with stock 0 — the DEFAULT 0 the engine applied to the unlisted column. The echo includes assigned id (17-shape) and defaulted stock. Predict-the-output rule: the echo shows the ROW, not the STATEMENT — defaults and all. The RETURNING clause makes the write self-documenting — mutation and evidence in one statement.",
  },
  {
    id: "kb-re-q36", difficulty: "medium",
    prompt: "Sweep + echo: `UPDATE orders SET status = 'delivered' WHERE status = 'pending' RETURNING id;` — echo row count?",
    choices: ["103", "14", "7", "52"],
    answer: 1,
    why: "The pending bucket holds 14 orders; all 14 flip and all 14 echo their ids. The echo count equals the affected count equals the census bucket — three views of one number. When they diverge (they can't, here), suspect a race or a misread clause.",
  },

  // ---------- judgment calls ----------
  {
    id: "kb-re-q37", difficulty: "medium",
    prompt: "Judgment: an order pipeline inserts the order, then its items referencing the order id. The RETURNING-driven design is…",
    choices: [
      "Generate ids in the app (max+1) and skip RETURNING",
      "`INSERT INTO orders … RETURNING id;` → use the echoed id in the items' INSERT — capture and child-write in one clean chain (ideally inside one transaction)",
      "Insert items first, order later",
      "Use UPDATE to attach items",
    ],
    answer: 1,
    why: "The echoed id is the parent key the children need: capture it atomically (no max(id) race), then write the items — the whole chain inside one transaction so a failure leaves neither a parentless child nor a childless parent. This is the single most common production use of the RETURNING clause: generated-key plumbing.",
  },
  {
    id: "kb-re-q38", difficulty: "hard",
    prompt: "Judgment: when is a follow-up SELECT (inside the same transaction) still PREFERABLE to RETURNING?",
    choices: [
      "Never — RETURNING always wins",
      "When you need aggregated/ordered/joined views of the changed rows — RETURNING can't GROUP BY, ORDER BY, or join; the app consumes the echo and queries it (Postgres adds the data-modifying-CTE option; SQLite does not)",
      "When the table is small",
      "When using SQLite",
    ],
    answer: 1,
    why: "The echo is a raw projection: no ordering, no aggregation, no joins. The application consumes the echoed rows and queries them like any result set (summarize the 14 swept orders, rank them, join to customers). Postgres adds the WITH-write CTE form; SQLite does not — app-side handling is the portable answer. RETURNING for capture; the app for analytics on the write's blast radius. The RETURNING clause is the write's own receipt printer — this pattern is one of its core jobs.",
  },
  {
    id: "kb-re-q39", difficulty: "medium",
    prompt: "Judgment: the team logs every write with its echo. Which RETURNING * use is a DATA RISK rather than good hygiene?",
    choices: [
      "Echoing ids of an order insert",
      "Echoing * of a customers table with PII into a shared run log — the echo copies personal data into a second system with its own retention problem",
      "Echoing counts of a purge",
      "Echoing ids of a delete",
    ],
    answer: 1,
    why: "Echoes are result sets — they land in logs, terminals, dashboards. RETURNING * on PII tables replicates that data wherever the echo flows (log aggregation, screenshots, support tickets). Hygiene rule: echo the ids and non-sensitive columns; keep * for tables without personal data. The clause is convenient — convenience spreads data. The RETURNING clause collapses the follow-up query into the write itself.",
  },
  {
    id: "kb-re-q40", difficulty: "hard",
    prompt: "Judgment: a sweep must be reversible until sign-off. Where does RETURNING fit in the reversible design?",
    choices: [
      "Nowhere — echoes prevent rollbacks",
      "Inside the transaction: BEGIN → sweep with RETURNING (echo = the review artifact) → sign-off reads the echo → COMMIT (or ROLLBACK, echo and all, vanishing)",
      "Only after COMMIT",
      "RETURNING replaces the transaction",
    ],
    answer: 1,
    why: "The echo is the transaction's preview receipt: the reviewer sees exactly which 14 orders changed before COMMIT blesses it — and ROLLBACK erases the write AND its echo together. Echo-before-commit is the two-person rule made mechanical: no commit without a reviewed echo. That is the RETURNING clause doing its quietest, most valuable work.",
  },
  {
    id: "kb-re-q41", difficulty: "medium",
    prompt: "Judgment: which figure belongs in the run log for a RETURNING sweep?",
    choices: [
      "The echo's row count only",
      "Both the affected count and the echoed ids — count proves scope, ids prove identity",
      "The statement's text only",
      "Nothing — logs are for errors",
    ],
    answer: 1,
    why: "Count (14) and ids (1, 5, 12 … 97) answer different audit questions: 'how many' and 'which ones'. The count catches too-wide filters; the ids enable later forensics (join the survivors, reconcile downstream). One line, both artifacts — the complete receipt costs nothing extra since RETURNING already produced it. The RETURNING clause speaks SELECT's projection language over the changed rows.",
  },
  {
    id: "kb-re-q42", difficulty: "hard",
    prompt: "Final judgment: what is the RETURNING clause's deepest contribution to write-heavy applications?",
    choices: [
      "Shorter SQL",
      "It collapses the write-then-read round trip into one atomic statement — generated keys, audit trails, and skip-detection become race-free by construction",
      "Better error messages",
      "Automatic backups",
    ],
    answer: 2,
    why: "Before RETURNING: write, then read (racy), or generate ids in the app (fragile), or skip auditing (reckless). After: one statement produces the mutation AND its evidence, inside the transaction's atomicity. Every pattern in this bank — key capture, purge manifests, skip auditing, echo-reviewed commits — is that single idea applied.",
  },
];
