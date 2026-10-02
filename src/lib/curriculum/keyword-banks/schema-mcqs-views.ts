// M8 schema-bank MCQs — Views (kb-vw-q01..q14). Receipts from
// scripts/m8-facts*.ts: active_customers / region_counts / eu probes,
// wire_payments 11 rows, paid_invoice_totals top-5 cents.
import type { Mcq } from "../types";

const m = (v: Omit<Mcq, "why"> & { why: string }): Mcq => v;

export const schemaMcqsViews: Mcq[] = [
  m({
    id: "kb-vw-q01", difficulty: "easy",
    prompt: "What is a view, exactly?",
    choices: [
      "A stored SELECT — a named query the engine re-runs when you read the view",
      "A copy of the data, snapshotted at CREATE VIEW time",
      "A faster kind of table — rows are pre-indexed",
      "A backup file the database writes to disk",
    ],
    answer: 0,
    why: "CREATE VIEW stores the query text in sqlite_master (type = 'view'), not rows. Every read of the view re-runs that SELECT against the live tables — a view is a saved question, and the answer is always fresh.",
    notes: [{ choice: 1, why: "That is CREATE TABLE … AS SELECT — a real table with real rows. A view stores no data at all." }],
  }),
  m({
    id: "kb-vw-q02", difficulty: "easy",
    prompt: "`CREATE VIEW active_customers AS SELECT id, name, region FROM customers WHERE active = 1;` then a new customer is inserted with active = 1. What does SELECT COUNT(*) FROM active_customers return?",
    choices: [
      "One more than before — the view re-runs over the live table",
      "The same as before — views freeze their row set",
      "Zero — existing views must be rebuilt to see new data",
      "An error — the view's cache is stale",
    ],
    answer: 0,
    why: "The probe's view counted the seed's 14 active customers because the SELECT runs on every read. CREATE VIEW defines a lens, not a photograph: insert an active customer and the count moves the moment you query again.",
    notes: [{ choice: 1, why: "Freezing is what a CTAS backup does — the view is the opposite by design." }],
  }),
  m({
    id: "kb-vw-q03", difficulty: "easy",
    prompt: "Which grammar creates a view correctly?",
    choices: [
      "CREATE VIEW active_customers AS SELECT id, name FROM customers WHERE active = 1;",
      "CREATE VIEW active_customers (SELECT id, name FROM customers);",
      "MAKE VIEW active_customers AS SELECT …",
      "CREATE TABLE active_customers AS VIEW SELECT …",
    ],
    answer: 0,
    why: "CREATE VIEW name AS SELECT — the probe's spellings all matched it, and the AS carries the stored query. The column-list variant (`CREATE VIEW region_counts (region, n) AS SELECT …`) renames the output columns; the AS itself is not optional.",
  }),
  m({
    id: "kb-vw-q04", difficulty: "easy",
    prompt: "`INSERT INTO active_customers (id, name) VALUES (99, 'x')` fails with…",
    choices: [
      "cannot modify active_customers because it is a view",
      "table active_customers already exists",
      "foreign key constraint failed",
      "Nothing — the insert lands in the view",
    ],
    answer: 0,
    why: "The probe's verbatim receipt: `cannot modify v1 because it is a view` — INSERT, UPDATE and DELETE all bounce the same way. CREATE VIEW builds a read window; the base table is where writes belong. (The error text is engine-raw; the app sandbox surfaces its own wrapper, but the rule is the same.)",
    notes: [{ choice: 3, why: "Even simple single-table views are read-only in SQLite — there is no updatable-view sugar here." }],
  }),
  m({
    id: "kb-vw-q05", difficulty: "easy",
    prompt: "Where does a query see a view's definition?",
    choices: [
      "SELECT sql FROM sqlite_master WHERE type = 'view' AND name = 'active_customers'",
      "SELECT * FROM active_customers — the definition rides along as a column",
      "EXPLAIN VIEW active_customers",
      "Views hide their definition by design",
    ],
    answer: 0,
    why: "The probe listed active_customers in sqlite_master with type = 'view' and read its stored SELECT from the sql column — same catalog that holds CREATE TABLE text. Views are first-class schema objects; their definitions are public.",
  }),
  m({
    id: "kb-vw-q06", difficulty: "medium",
    prompt: "The finance team queries 'wire payments' weekly. Why is `CREATE VIEW wire_payments AS SELECT paid_on, amount_cents FROM payments WHERE method = 'wire'` a good move?",
    choices: [
      "The filter logic is written once and every reader gets exactly the same 11-row slice",
      "The view runs faster than the same WHERE on payments",
      "The view prevents anyone from inserting payments now",
      "The view doubles as a backup of the wire rows",
    ],
    answer: 0,
    why: "The probe's wire_payments read 11 rows — the seed's wire count — and any future payment with method 'wire' joins the slice automatically. CREATE VIEW centralizes the definition: one WHERE to audit, every report consistent, zero copies to drift.",
    notes: [{ choice: 1, why: "Views add a name-resolution step; they are about consistency, not speed. Indexes are the speed tool." }],
  }),
  m({
    id: "kb-vw-q07", difficulty: "medium",
    prompt: "`CREATE VIEW region_counts (region, n) AS SELECT region, COUNT(*) FROM customers GROUP BY region;` — what does SELECT * FROM region_counts return?",
    choices: [
      "Four rows named region and n: APAC 5, EU 8, LATAM 1, US 2",
      "Four rows named region and COUNT(*)",
      "One row with four comma-joined regions",
      "An error — view column lists must match the SELECT aliases",
    ],
    answer: 0,
    why: "The probe's CREATE VIEW with a column list renamed the outputs: (region, n) — and the GROUP BY produced the seed's four region counts (APAC 5, EU 8, LATAM 1, US 2). CREATE VIEW column lists are the polite way to hand reports stable names even when the inner query is rewritten later.",
    notes: [{ choice: 3, why: "The list must match by POSITION and count, not by name — no alias inside is needed." }],
  }),
  m({
    id: "kb-vw-q08", difficulty: "medium",
    prompt: "`CREATE VIEW eu AS SELECT * FROM active_customers WHERE region = 'EU';` — a view over a view. What does SELECT COUNT(*) FROM eu return on the seed?",
    choices: [
      "8 — the inner filter (active) and the outer filter (EU) both apply",
      "5 — only the outer filter applies to the raw table",
      "13 — the filters stack additively",
      "An error — SQLite disallows views over views",
    ],
    answer: 0,
    why: "The probe built exactly this stack and read 8: every EU customer is active, and the view-over-view composition re-runs both SELECTs at read time. CREATE VIEW composes like functions — layers are free and each adds its WHERE.",
    notes: [{ choice: 2, why: "Filters multiply scope, they never add: active (14) ∩ EU (8) = 8." }],
  }),
  m({
    id: "kb-vw-q09", difficulty: "medium",
    prompt: "`DROP VIEW eu;` runs twice. What does the second run do?",
    choices: [
      "Errors — no such view: eu",
      "Succeeds silently as a no-op",
      "Drops the base customers table too",
      "Recreates the view empty",
    ],
    answer: 0,
    why: "The probe's second DROP VIEW failed with the verbatim `no such view: eu` — the first drop removed the catalog entry, and dropping is not idempotent by default. DROP VIEW IF EXISTS is the re-runnable spelling, mirroring IF NOT EXISTS on the create side.",
    notes: [{ choice: 1, why: "That is DROP VIEW IF EXISTS — without the clause the engine raises, which is often what you WANT in migrations so missing objects are loud." }],
  }),
  m({
    id: "kb-vw-q10", difficulty: "medium",
    prompt: "`CREATE VIEW dup AS SELECT 1 AS x;` runs, then `CREATE VIEW dup AS SELECT 2 AS x;`. What happens?",
    choices: [
      "The second errors — view names share the one namespace with tables",
      "The second replaces the first",
      "Both coexist — views get their own namespace",
      "The second is created as dup_1",
    ],
    answer: 0,
    why: "The probe's second CREATE VIEW failed exactly like a duplicate CREATE TABLE — one namespace for tables AND views (sqlite_master lists both). CREATE VIEW cannot silently shadow a table name; that collision would make every bare FROM ambiguous.",
  }),
  m({
    id: "kb-vw-q11", difficulty: "medium",
    prompt: "The monthly close needs revenue per month per region — a three-table join. Why define it once as a view?",
    choices: [
      "The join logic is owned in one place; every analyst's query saves the join by selecting FROM the view",
      "The view pre-computes the join and stores it forever",
      "The view makes the join write-protected",
      "Views are required before any GROUP BY can run",
    ],
    answer: 0,
    why: "This is the reporting-layer pattern from lesson 47: the probe's paid_invoice_totals view (SUM by customer over invoices) is one audited definition, and every consumer just SELECTs from it. CREATE VIEW turns 'the query everyone must get right' into a named object the engine re-runs.",
    notes: [{ choice: 1, why: "Nothing is stored — each read still does the join. The win is single-source-of-truth, not precomputation." }],
  }),
  m({
    id: "kb-vw-q12", difficulty: "hard",
    prompt: "`ALTER TABLE payments RENAME TO remittances;` after the wire_payments view exists. What happens to the view?",
    choices: [
      "It survives — SQLite rewrites its stored definition to read FROM \"remittances\"",
      "It breaks — the view still says payments and now errors",
      "It is dropped automatically with the rename",
      "It duplicates itself against the new table",
    ],
    answer: 0,
    why: "The probe renamed suppliers to vendors2 and the stored view DDL literally rewrote itself to `FROM \"vendors2\"` — the view kept counting all 6 suppliers. CREATE VIEW definitions are living text that SQLite maintains across renames, which is why the reporting layer survives schema evolution.",
    notes: [{ choice: 1, why: "Postgres breaks views on rename; SQLite rewrites them — the receipt shows the new table name inside the stored sql." }],
  }),
  m({
    id: "kb-vw-q13", difficulty: "hard",
    prompt: "A stakeholder asks for 'paid revenue per customer, biggest first'. The team ships `CREATE VIEW paid_invoice_totals AS SELECT customer_id, SUM(amount_cents) AS cents FROM invoices WHERE status = 'paid' GROUP BY customer_id;` — what does SELECT * FROM paid_invoice_totals ORDER BY cents DESC LIMIT 1 show?",
    choices: [
      "customer 1 with 2048100 cents",
      "customer 13 with 1154200 cents",
      "21 rows — one per paid invoice",
      "customer 1 with 20481.00 — views convert cents to dollars",
    ],
    answer: 0,
    why: "The probe ran exactly this and the top row read customer_id 1, cents 2048100 — the view holds RAW cents (no unit conversion happens in a view), one row per paying customer. CREATE VIEW + GROUP BY composes: the aggregation re-runs on every read over current invoices.",
    notes: [{ choice: 2, why: "GROUP BY customer_id collapses to one row per customer — 15 payers, not 21 paid invoices." }],
  }),
  m({
    id: "kb-vw-q14", difficulty: "hard",
    prompt: "When is a plain `CREATE TABLE … AS SELECT` the better tool than CREATE VIEW for a monthly-close snapshot?",
    choices: [
      "When the close must freeze figures — a CTAS table copies rows; a view would keep tracking edits",
      "When the query is a single-table filter",
      "When the result has more than 100 rows",
      "Never — views are strictly better for reporting",
    ],
    answer: 0,
    why: "The CTAS probe built a real 7-row backup whose numbers never move; the view probes re-ran live every time. Month-end close is exactly the freeze-figures case: CREATE TABLE AS SELECT pins the past, CREATE VIEW stays the living question. The probe even showed CTAS carries no constraints — snapshots trade contracts for stillness.",
    notes: [{ choice: 3, why: "Views answer 'as of right now' — a close that must reconcile against fixed figures needs stored rows." }],
  }),
];

export const schemaMcqsAlter: Mcq[] = [
  m({
    id: "kb-ad-q01", difficulty: "medium",
    prompt: "A teammate runs `ALTER TABLE suppliers ADD CONSTRAINT ck CHECK (rating > 0);` on this engine. What comes back?",
    choices: [
      "An error — SQLite cannot ADD CONSTRAINT; the CHECK must live in CREATE TABLE or a rebuild",
      "Success — the check now guards future updates",
      "Success but the check is ignored",
      "A warning, then success",
    ],
    answer: 0,
    why: "The probe's ALTER ADD CONSTRAINT failed outright — SQLite's ALTER TABLE adds/renames/drops COLUMNS and renames tables, but constraint surgery is not on the menu. The rating guard would need a table rebuild (new CREATE TABLE with the CHECK, copy rows, rename) — which is why the storefront's CREATE TABLE statements front-load every constraint.",
    notes: [{ choice: 1, why: "That is the PostgreSQL-style mental model; SQLite's ALTER is a much smaller toolbox." }],
  }),
];
