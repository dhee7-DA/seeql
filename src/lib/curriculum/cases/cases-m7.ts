// Case batch M7 — Data Modification (lessons 41–44, 50), cs-1976…cs-1980.
// Write-verb cases in the chip-rebuild format: the rebuilt statement is
// graded chip-by-chip (no execution — the sandbox would roll it back
// anyway), so every number slot is noVerify flavor and every keyword
// decoy changes the outcome. Figures anchored to the live db where cited
// (suppliers 1-6, invoice INV-2024-018 unpaid at 87300, product prices).
import type { CaseStudy } from "./types";

export const casesM7: CaseStudy[] = [
  {
    id: "cs-1976",
    tier: "easy",
    topic: "w1",
    universe: "catalog",
    title: "The new SKU",
    brief:
      "From: Warehouse lead. Re: catalog intake.\n\nWe're adding a desk lamp to the lineup — supplier is Alpine Audio GmbH (supplier_id 5), launch price 59.99, 40 units on the shelf. Write the INSERT that creates the row. Remember the column-list contract: name and category are NOT NULL with no defaults.",
    ask: "Insert the new product row with name, category, price 59.99, stock 40, supplier 5.",
    template: `INSERT INTO products (name, category, price, stock, supplier_id)
VALUES ({1}, {2}, {3}, 40, {4});`,
    slots: [
      {
        answer: "'Desk Lamp Pro'",
        kind: "keyword",
        label: "the product name",
        why: "The name is a string literal — quoted, and non-null: products.name is NOT NULL, so NULL here would bounce off the constraint the lesson-41 way.",
      },
      {
        answer: "'Video'",
        kind: "keyword",
        label: "the category",
        why: "category is a free TEXT column, but the catalog's integrity lives in convention: the value must match the existing set (Accessories, Apparel, Audio, Electronics, Fitness, Video, Wearables) or every group-by report grows a phantom bucket.",
      },
      {
        answer: "59.99",
        kind: "number",
        noVerify: true,
        label: "the launch price",
        why: "REAL prices take a decimal point — and SQLite wants a real dot, not the European comma: 59,99 is two values to the parser and a syntax error to the engine.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the supplier id",
        why: "The foreign key is the supplier's id — 5 is Alpine Audio GmbH on the live roster. This is the column the REFERENCES contract will check.",
      },
    ],
    distractors: ["'Furniture'", "NULL", "59,99"],
    walkthrough:
      "The column list names exactly five columns and the VALUES row feeds exactly five — the contract holds. 'Desk Lamp Pro' and 'Video' are quoted strings; 59.99 and 40 and 5 are bare numbers; NULL would violate NOT NULL on name and 59,99 would never parse. In the sandbox this INSERT runs for real inside the rollback transaction — the row exists just long enough to verify, then the storefront forgets it. On a live system the next commit makes it permanent, which is why the category spelling matters before, not after.",
  },
  {
    id: "cs-1977",
    tier: "medium",
    topic: "w2",
    universe: "pricing",
    title: "The ten percent raise",
    brief:
      "From: Pricing. Re: supplier cost pass-through.\n\nAudio is getting a 10% price increase — every Audio product, nothing else. Write the UPDATE. Two hazards: the expression must read the row's own current price, and the WHERE clause is the only thing standing between a scoped raise and repricing the entire catalog.",
    ask: "Raise every Audio product's price by 10%, touching no other rows.",
    template: `UPDATE products
SET {1} = price * {2}
WHERE {3} = 'Audio';`,
    slots: [
      {
        answer: "price",
        kind: "keyword",
        label: "the column being raised",
        why: "The left side names the column to change. price = price * 1.1 reads the row's own value and writes the raised one back — self-referencing expressions are the UPDATE lesson's whole trick.",
      },
      {
        answer: "1.1",
        kind: "number",
        noVerify: true,
        label: "the raise multiplier",
        why: "+10% multiplies by 1.1. The famous wrong answers: 0.1 (a 90% markdown) and 1.10 is fine but 1,10 is a syntax error. And 100.0 vs 100.0? — REAL math keeps the cents honest here.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the scoping column",
        why: "The filter is on category — the column that actually labels product lines. A WHERE on a column that doesn't exist is an error; a WHERE on the WRONG column is a silent mis-scoped raise.",
      },
    ],
    distractors: ["total", "0.9", "status"],
    walkthrough:
      "SET price = price * 1.1 with WHERE category = 'Audio' — three chips and the raise is scoped, correct, and reversible only by doing the inverse UPDATE (0.909090…, and now you see why backups matter). Drop the WHERE and the engine reprices all sixteen products without a word of warning: UPDATE's blast radius is exactly its WHERE. The sandbox rolls this back after grading — production never would.",
  },
  {
    id: "cs-1978",
    tier: "medium",
    topic: "w3",
    universe: "expense",
    title: "The dust purge",
    brief:
      "From: Controller. Re: expense hygiene.\n\nCard-test debris keeps landing in expenses — sub-$10.00 rows (under 1000 cents) that are test charges, not spend. Delete them. Finance rule: every destructive statement gets a SELECT COUNT with the same WHERE first, so the purge report can say exactly how many rows went.",
    ask: "Delete every expense row under 1000 cents — scoped, with the pre-count in the walkthrough.",
    template: `DELETE FROM {1}
WHERE {2} < {3};`,
    slots: [
      {
        answer: "expenses",
        kind: "keyword",
        label: "the table being purged",
        why: "The debris lives in expenses — the ledger with no foreign-key children, so DELETE rows freely (invoices would be the wrong ledger, and products has order_items pointing at it).",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the amount column",
        why: "The books store cents in amount_cents — there is no 'total' column on expenses. The WHERE names the column the threshold applies to.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the dust threshold",
        why: "1000 cents = $10.00. The threshold is inclusive-exclusive by the comparison: < 1000 spares exactly-1000 rows — state the boundary in the purge report.",
      },
    ],
    distractors: ["invoices", "SUM(amount_cents)", "orders"],
    walkthrough:
      "DELETE FROM expenses WHERE amount_cents < 1000 — the same three-part shape as the pre-flight SELECT COUNT(*) FROM expenses WHERE amount_cents < 1000 that finance demands first. The WHERE is what separates a purge from an unplug: bare DELETE FROM expenses removes all 36 rows. And the aggregate decoy is the lesson-43 boundary: aggregates can't sit in WHERE — row-by-row is the only scope DELETE understands.",
  },
  {
    id: "cs-1979",
    tier: "hard",
    topic: "w4",
    universe: "month-close",
    title: "The void that must be atomic",
    brief:
      "From: AR clerk. Re: invoice INV-2024-018.\n\nThat invoice (87300 cents) will never be paid — void it, and log the void in payments as a zero-trail so the books show why. Two writes, one fact: they must land together or not at all. If the process dies between them, the books lie. Wrap it in a transaction and commit only when both are done.",
    ask: "Void the invoice and insert the audit payment row inside ONE transaction that commits.",
    template: `BEGIN;
UPDATE invoices SET status = 'void'
WHERE {1} = 'INV-2024-018';
INSERT INTO payments (invoice_id, paid_on, amount_cents, method)
VALUES (18, '2025-03-05', 87300, {2});
{3};`,
    slots: [
      {
        answer: "number",
        kind: "keyword",
        label: "the invoice lookup column",
        why: "Invoices are found by their business key — the number TEXT column. The id (18) is what payments references; the WHERE hunts by the human-readable key.",
      },
      {
        answer: "'card'",
        kind: "keyword",
        label: "the method marker",
        why: "payments.method is TEXT — 'card' or 'wire' on the live ledger. The void-trail row uses the same vocabulary so reconciliation queries don't grow a fourth bucket.",
      },
      {
        answer: "COMMIT",
        kind: "keyword",
        label: "the point of no return",
        why: "COMMIT makes both writes permanent together. ROLLBACK would dissolve BOTH — the void and the audit trail — leaving the books exactly as they were. All of it, or none of it: that's the lesson-44 bubble.",
      },
    ],
    distractors: ["ROLLBACK", "id", "'INV-2024-018'"],
    walkthrough:
      "BEGIN opens the bubble; the UPDATE voids INV-2024-018 by number; the INSERT writes the 87300-cent trail keyed to invoice 18; COMMIT seals both. Crash before COMMIT? The engine unwinds everything — no voided invoice without a trail, no trail without a void. This is the exact mechanism this course's own sandbox uses against your graded writes: BEGIN, do the work, verify, always ROLLBACK. The transaction is why the course can let you fire UPDATEs at a real database and still promise the storefront survives.",
  },
  {
    id: "cs-1980",
    tier: "hard",
    topic: "wcap",
    universe: "inventory",
    title: "The restock ticket",
    brief:
      "From: Ops. Re: Shenzhen Electro delivery.\n\nThe APAC shipment landed: 50 new units for EVERY product we buy from supplier 2 — one statement, not sixteen. We want the touched rows back with their new stock levels in the same breath, to paste into the ops log. RETURNING is the receipt printer.",
    ask: "Restock all of supplier 2's products by 50 units and RETURN id, name, and the new stock.",
    template: `UPDATE products
SET stock = stock + {1}
WHERE {2} = {3}
RETURNING {4};`,
    slots: [
      {
        answer: "50",
        kind: "number",
        noVerify: true,
        label: "the restock quantity",
        why: "stock = stock + 50 reads each row's own level and adds the delivery. The self-reading expression is what makes one statement cover sixteen different starting stocks.",
      },
      {
        answer: "supplier_id",
        kind: "keyword",
        label: "the scoping column",
        why: "The relationship column is supplier_id — products point at their supplier by id. 'product_id' doesn't exist on products (it lives on order_items); scoping by name would need a subquery and miss the point.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the supplier's id",
        why: "Supplier 2 is Shenzhen Electro on the live roster — the id, not the name: the column stores ids. Numbers are unquoted; '2' as text would still match in SQLite's loose comparison but it's the wrong habit.",
      },
      {
        answer: "id, name, stock",
        kind: "keyword",
        label: "the receipt columns",
        why: "RETURNING takes a select list: id, name, stock — the touched row's key, identity and new level in one breath. The ops log gets its paste without a follow-up SELECT.",
      },
    ],
    distractors: ["product_id", "'Shenzhen Electro'", "*"],
    walkthrough:
      "One UPDATE, one WHERE on supplier_id = 2, one RETURNING id, name, stock — sixteen rows updated and sixteen receipts printed in the same statement. The write-verb capstone in miniature: a self-reading expression scopes the math, the WHERE scopes the blast radius, RETURNING scopes the confirmation. The sandbox executes this inside the always-rollback transaction, so the stock levels you see in the receipt are real, verified, and then unwound.",
  },
];
