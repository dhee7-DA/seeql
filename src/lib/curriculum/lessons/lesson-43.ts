import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson43: Lesson = {
  id: "lesson-43",
  num: 43,
  title: "DELETE — removing rows safely",
  blurb: "DELETE FROM with the WHERE discipline, RETURNING as the receipt, the foreign-key fence that blocks parent deletes — and why the storefront's own cancelled status is really a soft delete",
  minutes: 11,
  blocks: [
    {
      kind: "p",
      text: "Some rows have to go: test orders from the importer run, a discontinued product's stray lines, duplicates from a double feed. **DELETE FROM** removes whole rows — never partial values, never columns; the row either stays or vanishes. Of the three write verbs it's the one with the least ceremony and the most regret potential, which is why this lesson spends half its time on the fence that protects you: **foreign keys**.",
    },
    { kind: "diagram", figure: "w3-delete-scope" },
    { kind: "h", text: "The shape — and the receipt" },
    {
      kind: "bullets",
      items: [
        "`DELETE FROM table WHERE …` — the WHERE is a full-power filter, same as SELECT's: subqueries, IN, joins-in-subquery form all work. Rows that pass it are removed entirely.",
        "`RETURNING` hands back the rows as they were **deleted** — the receipt for what left. Without it you get the affected count; with a 12-row expectation, *12* is the whole audit.",
        "No WHERE and the table empties — legal, occasionally intended for scratch tables, catastrophic otherwise. The SELECT-first habit from UPDATE applies double here.",
      ],
    },
    {
      kind: "code",
      caption: "Clear the line items of cancelled orders — 12 lines across 7 orders",
      sql: `DELETE FROM order_items
WHERE order_id IN (SELECT id FROM orders WHERE status = 'cancelled')
RETURNING id;`,
    },
    { kind: "h", text: "The foreign-key fence" },
    {
      kind: "code",
      caption: "Try deleting a parent while children point at it — the engine refuses",
      sql: `DELETE FROM orders WHERE status = 'cancelled';
-- FOREIGN KEY constraint failed — 12 order_items rows still reference
-- these 7 orders. The fence is real: run it and read the error.`,
    },
    {
      kind: "bullets",
      items: [
        "`orders.customer_id REFERENCES customers(id)` — that line in the schema is a promise the engine enforces on every write: no child may point at a missing parent. Deleting the parent while children exist breaks the promise, so the DELETE fails.",
        "The escape is order: **children first, then the parent** — clear the order_items rows for those orders, and only then the orders themselves. Leaf tables (nothing points at them, like order_items) delete freely at any time.",
        "The same fence fired live in the probe: `DELETE FROM customers WHERE id = 1` fails while Alice has orders. It's not bureaucracy — it's the database refusing to manufacture orphaned references.",
      ],
    },
    { kind: "h", text: "Soft delete — the pattern hiding in plain sight" },
    {
      kind: "bullets",
      items: [
        "Look at the storefront: cancelled orders were never DELETEd — they carry a **status**. That's a soft delete: the row stays, a flag marks it dead, reports filter it out. You keep the audit trail and the FK graph stays intact.",
        "Rule of thumb: business objects (orders, customers) get status flags; mechanical rows (import duplicates, scratch lines) get hard DELETEs. The ticket tells you which world you're in.",
      ],
    },
    {
      kind: "warn",
      text: "Outside this sandbox there is no Ctrl+Z: a committed DELETE is gone unless you wrapped it in a transaction (lesson 44) or have backups. Before any real delete: SELECT the same WHERE, count the rows, then swap SELECT for DELETE and compare the affected count.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "PostgreSQL lets you automate the fence: `REFERENCES orders(id) ON DELETE CASCADE` deletes children along with the parent (or ON DELETE SET NULL). Powerful and a little frightening — cascades are how one DELETE empties five tables.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "Raw SQLite ships with foreign-key enforcement OFF per connection (`PRAGMA foreign_keys`); this app turns it ON, so the fence behaves like Postgres and MySQL. Command-line SQLite without the pragma would let the parent delete through — know which mode you're in.",
    },
  ],
  mcqs: [
    {
      id: "l43-q1",
      prompt: "`DELETE FROM orders` — no WHERE. What happens?",
      choices: [
        "An error — WHERE is mandatory on DELETE",
        "Every row is deleted — the table becomes empty",
        "Only rows without children are deleted",
        "Nothing — DELETE waits for a WHERE",
      ],
      answer: 1,
      why: "DELETE removes exactly the rows the WHERE keeps — no WHERE means all of them. The statement is legal by design (emptying a scratch table is a real task), which is why the SELECT-first discipline matters so much here.",
      notes: [
        { choice: 2, why: "The FK fence blocks per-row on children, but with no WHERE the statement fails as a whole the moment the first blocked row is hit — it's not a polite partial cleanup." },
      ],
    },
    {
      id: "l43-q2",
      prompt: "`DELETE FROM orders WHERE status = 'cancelled'` fails with *FOREIGN KEY constraint failed*. Why?",
      choices: [
        "orders is a read-only table",
        "The status value is misspelled",
        "order_items rows still reference those orders — children must go first",
        "DELETE can't use a WHERE with equality",
      ],
      answer: 2,
      why: "The FK fence: every cancelled order still has line items pointing at it. Remove the child rows (order_items) first, then the parents delete cleanly. The error is the database protecting referential integrity, not judging your SQL.",
      notes: [
        { choice: 1, why: "A misspelled status would delete zero rows — no error, just *0 rows affected*. A constraint error always means a relationship was violated." },
      ],
    },
    {
      id: "l43-q3",
      prompt: "You must remove 7 cancelled orders and their 12 line items. What's the right sequence?",
      choices: [
        "DELETE orders first, then order_items — top to bottom",
        "DELETE order_items rows for those orders, then the orders — children before parents",
        "One DELETE with a JOIN across both tables",
        "UPDATE the orders to NULL, then DELETE",
      ],
      answer: 1,
      why: "Children reference parents, so the fence opens from the child side: clear order_items where order_id matches the doomed orders, then delete the orders. DELETE doesn't take a JOIN — the multi-table part rides on a subquery in the WHERE.",
      notes: [
        { choice: 0, why: "Top-to-bottom is exactly backwards — the first statement hits the fence and fails before touching anything (the statement is atomic)." },
      ],
    },
    {
      id: "l43-q4",
      prompt: "The storefront's 'cancelled' orders were never deleted. What is that pattern called, and what's its main benefit?",
      choices: [
        "Soft delete — rows stay with a status flag; history and references survive",
        "Deferred delete — the engine removes them at night",
        "Lazy delete — deleted rows return on the next query",
        "It's just messy data — should have been DELETEd",
      ],
      answer: 0,
      why: "A status column is a soft delete: 'cancelled' rows remain queryable for audits, the FK graph stays intact, and reports filter on status. Hard DELETEs are for rows nobody will ever need again.",
      notes: [
        { choice: 3, why: "For an order system, 'nobody ever needs it again' is almost never true — returns, disputes and 'what happened in Q3' all read history. That's why real shops soft-delete business objects." },
      ],
    },
    {
      id: "l43-q5",
      prompt: "`DELETE FROM order_items WHERE quantity = 3 RETURNING order_id;` returns 9 rows. What does the affected count show without RETURNING?",
      choices: ["0 — nothing was returned", "9", "The number of orders involved", "An error count"],
      answer: 1,
      why: "The affected count and the RETURNING row count are the same number — rows deleted. RETURNING just spells them out; without it you'd see *9 rows affected* and nothing more.",
      notes: [
        { choice: 2, why: "DISTINCT order ids would be fewer than 9 when one order has two such lines — the count counts ROWS, always." },
      ],
    },
  ],
  problems: [
    {
      id: "l43-p1",
      title: "Clear the cancelled lines",
      brief: "The importer's test run left **7 cancelled orders** with **12 line items** among them. Delete every **order_items** row belonging to a cancelled order — one statement, echoing `id`. (The orders themselves stay for now; that's the next ticket.)",
      hints: [
        "The doomed order ids come from a subquery; the DELETE targets the child table.",
        "Shape: DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status = 'cancelled') RETURNING id;",
      ],
      difficulty: "easy",
      solution: "DELETE FROM order_items\nWHERE order_id IN (SELECT id FROM orders WHERE status = 'cancelled')\nRETURNING id;",
      mistakes: [
        { test: "delete from orders", message: "That's the parent table — those deletes hit the FK fence while the 12 line items exist. This ticket asks for the order_items rows first." },
        { test: "order_items\\s+where\\s+status", message: "order_items has no status column — cancellation lives on orders. Reach it through the subquery: order_id IN (SELECT id FROM orders WHERE …)." },
        { test: "\\bjoin\\s+orders", message: "DELETE doesn't take a JOIN — the multi-table filter is the IN (SELECT …) form. Same result, legal spelling." },
      ],
      expected: EXPECTED["l43-p1"],
    },
    {
      id: "l43-p2",
      title: "Stop-sell the 2m HDMI",
      brief: "**HDMI 2.1 Cable 2m** (product **9**) is discontinued — clear its **19 order_items lines** (product_id 9). Echo `order_id` so fulfillment can notify the affected orders.",
      hints: [
        "A plain filtered DELETE on the leaf table — no fence here because nothing references order_items.",
        "Shape: DELETE FROM order_items WHERE product_id = 9 RETURNING order_id;",
      ],
      difficulty: "medium",
      solution: "DELETE FROM order_items\nWHERE product_id = 9\nRETURNING order_id;",
      mistakes: [
        { test: "delete from products", message: "Deleting the product row hits the fence — 16 other products' lines and this one's own 19 lines reference products. The ticket clears the SALES LINES; the catalog row survives (soft-retired like lesson 42's clearance)." },
        { test: "quantity\\s*=|unit_price", message: "Wrong axis — the criterion is which PRODUCT the line sells (product_id = 9), not its quantity or price." },
        { test: "order_id\\s*=\\s*9\\b", message: "Order 9, not product 9 — the brief targets every line SELLING product 9, across whatever orders carry it." },
      ],
      expected: EXPECTED["l43-p2"],
    },
    {
      id: "l43-p3",
      title: "Bulk-line audit",
      brief: "Warehouse QA flags bulk lines: delete every **order_items** row with `quantity >= 3` and echo `id`. Count before you delete — a SELECT with the same WHERE is your pre-flight.",
      hints: [
        "Single-table DELETE with a range condition; run SELECT COUNT(*) with the same WHERE first if you want the number.",
        "Shape: DELETE FROM order_items WHERE quantity >= 3 RETURNING id;",
      ],
      difficulty: "medium",
      solution: "DELETE FROM order_items\nWHERE quantity >= 3\nRETURNING id;",
      mistakes: [
        { test: "quantity\\s*>\\s*3\\b", message: "Strict > drops the threes — the brief says quantity >= 3, boundary included. Boundary operators are the lesson-35 discipline all over again." },
        { test: "quantity\\s*=\\s*3\\b", message: "Equality only catches the 3s — 4-item lines slip through. The flag is quantity >= 3." },
        { test: "\\blimit\\b", message: "DELETE takes no LIMIT in SQLite — the WHERE defines the full scope. (Top-N deletes are a different, more dangerous craft.)" },
      ],
      expected: EXPECTED["l43-p3"],
    },
    {
      id: "l43-p4",
      title: "Un-cancel the cancellations",
      brief: "Good news: the cancelled orders were a payment-processor glitch, not fraud. **Don't delete them — flip them**: set their `status` to **'delivered'**, and fill any missing `shipped_at` with the order's `created_at` (a row's own value feeds the assignment). Echo `id`, `status` — 7 rows.",
      hints: [
        "This is UPDATE with two assignments; COALESCE(shipped_at, created_at) fills only the holes.",
        "Shape: UPDATE orders SET status = 'delivered', shipped_at = COALESCE(shipped_at, created_at) WHERE status = 'cancelled' RETURNING id, status;",
      ],
      difficulty: "hard",
      solution: "UPDATE orders\nSET status = 'delivered',\n    shipped_at = COALESCE(shipped_at, created_at)\nWHERE status = 'cancelled'\nRETURNING id, status;",
      mistakes: [
        { test: "delete from orders", message: "The lesson's whole point — cancelled orders are business history, kept as soft deletes. The fix flips the flag with UPDATE; DELETE would tear a hole in the FK graph." },
        { test: "shipped_at\\s*=\\s*created_at(?![\\s,]*\\))", message: "Careful — plain `shipped_at = created_at` would stamp orders that already have a real ship date. COALESCE(shipped_at, created_at) fills only the NULLs." },
        { test: "status\\s*=\\s*'(shipped|pending)'", message: "The ticket says mark them delivered — shipped would still read as in-transit, pending as open. Match the brief's word." },
      ],
      expected: EXPECTED["l43-p4"],
    },
  ],
  takeaway: "DELETE removes whole rows behind a full-power WHERE, RETURNING is the receipt — and the foreign-key fence means children leave before their parents, which is why real systems soft-delete business objects.",
};
