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
    {
      id: "l43-q6",
      prompt: "After `DELETE FROM order_items WHERE quantity = 1`, what does `SELECT COUNT(*) FROM sqlite_master WHERE name = 'order_items'` return?",
      choices: [
        "0 — the table is gone",
        "1 — DELETE empties rows; the table object remains",
        "Depends on how many rows were deleted",
        "1 only if the table was empty beforehand",
      ],
      answer: 1,
      why: "DELETE and DROP answer different questions: DELETE removes rows from inside the object, and the object — its columns, constraints, sqlite_master row — survives, ready to accept inserts again. Only DROP TABLE removes the object itself.",
      notes: [
        { choice: 0, why: "An empty table is still a table — re-SELECT it and you get zero rows with the full column list, not a 'no such table' error." },
      ],
    },
    {
      id: "l43-q7",
      prompt: "What makes `DELETE FROM order_items WHERE product_id = 9 RETURNING order_id` useful in an incident review?",
      choices: [
        "It previews which rows WOULD be deleted without deleting them",
        "It prints the removed rows — the receipt of exactly what left, after the fact",
        "It undoes the delete if you run it twice",
        "It deletes only from the returned orders",
      ],
      answer: 1,
      why: "RETURNING on a delete echoes the rows as they were at the moment of removal — the irrecoverable last look. For an audit trail, that echo IS the log entry: which lines, which orders, gone and documented in one statement.",
      notes: [
        { choice: 0, why: "The preview is the plain SELECT with the same WHERE — run it first. RETURNING fires after the delete; those rows are already gone." },
      ],
    },
    {
      id: "l43-q8",
      prompt: "Which DELETE can never trip the foreign-key fence?",
      choices: [
        "DELETE FROM orders — the storefront's busiest table",
        "DELETE FROM customers — id 1 is everyone's favorite",
        "DELETE FROM order_items — nothing references it, so it's a leaf",
        "DELETE FROM products — it has the FK to suppliers",
      ],
      answer: 2,
      why: "The fence fires when OTHER rows point at the row you're deleting. order_items sits at the bottom of the schema — orders and products point at it, but it points at nothing — so deleting its rows is always legal. Every parent table above it (orders, products, customers) needs its children cleared first.",
      notes: [
        { choice: 0, why: "orders is a parent — its line-item children hold the fence shut (the cancelled seven alone carry 12). Parents inherit their deletability from their children; leaves like order_items delete freely." },
      ],
    },
    {
      id: "l43-q9",
      prompt: "The `DELETE FROM order_items WHERE quantity >= 3` audit clears 89 lines. How many rows does order_items hold afterward?",
      choices: ["89", "251", "162 — 251 minus the 89 removed", "Depends on the engine's mood"],
      answer: 2,
      why: "DELETE is subtractive and complete: 251 lines before, 89 removed, 162 remain. Before/after counts are the cheapest correctness check a bulk delete has — if your math and the engine's row count disagree, stop and investigate.",
      notes: [
        { choice: 1, why: "251 is the before count — the receipt for the after story. The affected count (89) tells you the delta; subtraction tells you the remainder." },
      ],
    },
    {
      id: "l43-q10",
      prompt: "A DBA from MySQL tries `TRUNCATE TABLE order_items` in SQLite. What happens?",
      choices: [
        "It works — TRUNCATE is universal SQL",
        "It works but only on empty tables",
        "Syntax error — SQLite has no TRUNCATE; a bare `DELETE FROM order_items` is the full wipe",
        "It drops the table",
      ],
      answer: 2,
      why: "SQLite's grammar has no TRUNCATE statement — the empty-the-table move is DELETE FROM with no WHERE, all 251 lines gone, table object intact. The MySQL-flavored habit needs translating, which is exactly what the dialect-watch blocks are for.",
      notes: [
        { choice: 3, why: "Dropping is DROP TABLE's job — a different statement with a different outcome (object gone, not just rows)." },
      ],
    },
    {
      id: "l43-q11",
      prompt: "You want to delete just the 10 oldest pending orders. In SQLite, which statement shape does that?",
      choices: [
        "DELETE FROM orders WHERE status = 'pending' ORDER BY created_at LIMIT 10",
        "DELETE FROM orders LIMIT 10 — SQLite knows LIMIT",
        "None directly — SQLite's DELETE takes no LIMIT; you scope with a subquery on the ids",
        "DELETE FIRST 10 FROM orders",
      ],
      answer: 2,
      why: "SQLite's DELETE has no ORDER BY/LIMIT escape hatch — the WHERE defines the entire scope. The disciplined shape is a subquery that computes the ten ids first: WHERE id IN (SELECT id FROM orders WHERE status = 'pending' ORDER BY created_at LIMIT 10). MySQL's DELETE … LIMIT habit doesn't travel.",
      notes: [
        { choice: 0, why: "That's MySQL's spelling (and it's deprecated there too). SQLite refuses the grammar outright — portability trap, not style difference." },
      ],
    },
    {
      id: "l43-q12",
      prompt: "`DELETE FROM products WHERE stock = 0` runs on the storefront. Nothing has zero stock. Result?",
      choices: [
        "An error — deletes must remove something",
        "changes = 0, no error — the statement succeeded by doing nothing",
        "The table is dropped",
        "Every product is deleted — the WHERE is ignored",
      ],
      answer: 1,
      why: "A zero-match delete is a success story: the WHERE was precise, nothing qualified, zero rows changed. That silence is exactly what read-before-write predicts — run the COUNT first and the affected count confirms it. Surprises should come from bugs, never from deletes.",
      notes: [
        { choice: 2, why: "The schema keeps its object and rows — a WHERE that matches nothing touches nothing. Only statements with real matches write real changes." },
      ],
    },
    {
      id: "l43-q13",
      prompt: "What's the cheapest preview (rehearsal) for a bulk DELETE?",
      choices: [
        "Run the DELETE on a copy of the database",
        "Ask a colleague to guess the scope",
        "Run a SELECT COUNT(*) with the exact same WHERE — zero cost, zero risk, and the number is the affected count the DELETE will report",
        "Delete one row first and extrapolate",
      ],
      answer: 2,
      why: "The read-before-write rehearsal is free and instant: the DELETE's WHERE, wrapped in COUNT(*). If the number surprises you, fix the WHERE — not after the rows are gone. Every serious delete script starts life as this SELECT.",
      notes: [
        { choice: 0, why: "A copy is a real safety net for PRODUCTION, but it's expensive and still doesn't tell you the scope. The COUNT tells you the scope in one statement, right here, right now." },
      ],
    },
    {
      id: "l43-q14",
      prompt: "Your preview COUNT said 7 rows, but the DELETE's affected count says 12. What now?",
      choices: [
        "Trust the DELETE — writes are always right",
        "Run it again — the second pass will agree",
        "Stop and investigate — a preview/write mismatch means the WHERE drifted or the data moved between runs; the numbers must agree by construction",
        "Divide by two and report 6",
      ],
      answer: 2,
      why: "Preview and delete share one WHERE, so the numbers are two readings of the same truth — a mismatch is a fire alarm, not a rounding question. Either the WHERE text drifted between copies, or another writer changed the table in between. Investigate before the next write; this discipline is why previews exist.",
      notes: [
        { choice: 1, why: "Running it again deletes MORE rows (whatever made 12 qualify still qualifies) — the opposite of the safe move. The mismatch is information; read it first." },
      ],
    },
    {
      id: "l43-q15",
      prompt: "Why isn't RETURNING alone a sufficient safety net on a bulk DELETE?",
      choices: [
        "RETURNING isn't supported on deletes",
        "It echoes rows only AFTER they're gone — the preview bounds the blast radius BEFORE, which is the part you can still act on",
        "RETURNING shows the surviving rows, not the deleted ones",
        "It requires admin rights",
      ],
      answer: 1,
      why: "RETURNING is the receipt; the preview COUNT is the estimate. Both matter, but only the preview runs while there's still time to fix a too-wide WHERE. The professional order is preview → delete → RETURNING/affected-count reconciliation — each step answers a different question.",
      notes: [
        { choice: 0, why: "SQLite supports RETURNING on DELETE fine (problems 2 and 3 use it) — the gap isn't support, it's timing: after the delete, the only remaining option is the restore." },
      ],
    },
    {
      id: "l43-q16",
      prompt: "A purge deletes by a subquery: `DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status = 'cancelled')`. The subquery returns EMPTY. What happens — and what should have happened first?",
      choices: [
        "Error — IN needs at least one value",
        "0 rows deleted, silently — a SELECT COUNT with the same subquery first would have revealed the empty set before the write",
        "All order_items are deleted",
        "The engine prompts to widen the filter",
      ],
      answer: 1,
      why: "An empty IN list matches nothing: the DELETE succeeds with 0 rows affected. Silent no-ops are their own failure mode — the cancelled count may have been purged already, or the subquery's WHERE is wrong. The pre-count discipline (same subquery, SELECT COUNT) catches both before the write.",
      notes: [
        { choice: 2, why: "IN only shrinks — an empty list can't widen a match. The catastrophic case is the opposite: a subquery that returns MORE ids than you traced." },
      ],
    },
    {
      id: "l43-q17",
      prompt: "You must delete the 7 cancelled orders AND their 12 order_items rows. Which ORDER of deletes keeps the data consistent — and why?",
      choices: [
        "Orders first — delete the parent to cascade the intent",
        "order_items first, then orders — children leave before parents, or the second DELETE hits rows whose parent is already gone (and FKs would have blocked the first)",
        "Either order — SQLite doesn't care",
        "Interleave them row by row",
      ],
      answer: 1,
      why: "Referential integrity runs parent → child: order_items rows POINT at their order, so the children must go first (the l43-p1 shape: DELETE FROM order_items WHERE order_id IN …). With foreign_keys ON, deleting parents first orphans children — the engine blocks it; with FKs off it silently leaves dangling rows. The professional purge is child-first, one transaction, both counts reconciled.",
      notes: [
        { choice: 0, why: "That's the orphaning order — blocked under PRAGMA foreign_keys = ON ('FOREIGN KEY constraint failed') and silently destructive with FKs off." },
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
      mutating: true,
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
      mutating: true,
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
      mutating: true,
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
      mutating: true,
      expected: EXPECTED["l43-p4"],
    },
    {
      id: "l43-p5",
      title: "Preview the audit's width",
      brief: "Before the bulk-line audit (problem 3), preview it: count the **order_items** rows with `quantity >= 3` as `n`. The number you get — 89 — is exactly the affected count the DELETE will report.",
      hints: [
        "The preview is the DELETE's WHERE, verbatim, wrapped in a COUNT.",
        "Shape: SELECT COUNT(*) AS n FROM order_items WHERE quantity >= 3;",
      ],
      difficulty: "easy",
      solution: "SELECT COUNT(*) AS n\nFROM order_items\nWHERE quantity >= 3;",
      mistakes: [
        { test: "quantity\\s*>\\s*3", message: "Strict > misses the threes — the audit (and this preview) uses the same >= boundary, or the two numbers will disagree by exactly the three-quantity lines." },
        { test: "sum\\s*\\(\\s*quantity", message: "Width, not volume — COUNT rows (89), not the sum of their quantities. The affected count the DELETE reports is row-based." },
        { test: "\\bdelete\\b", message: "The preview is a read — SELECT only. Deleting to 'see what happens' is the habit this lesson retires; the count comes first, for free." },
      ],
      expected: EXPECTED["l43-p5"],
    },
    {
      id: "l43-p6",
      title: "The premium-line purge",
      brief: "Finance flags every line item sold at a `unit_price` **above 80** as mis-fed data. Delete them all in one statement — no RETURNING; the graded answer is the **affected count** (86).",
      hints: [
        "A plain DELETE whose WHERE is the price filter — the count is the whole deliverable.",
        "Shape: DELETE FROM order_items WHERE unit_price > 80;",
      ],
      difficulty: "medium",
      solution: "DELETE FROM order_items\nWHERE unit_price > 80;",
      mistakes: [
        { test: "unit_price\\s*>=\\s*80", message: "Boundary drift — the ticket says ABOVE 80, strictly greater. At >= 80 any exactly-80.00 line would be wrongly purged." },
        { test: "quantity\\s*>", message: "Wrong axis — the criterion is the line's unit_price, not how many units the line sells. Quantity >= 3 was the other ticket." },
        { test: "\\bupdate\\b|soft", message: "Finance said delete — these 86 lines are feed corruption, not business history. (Real soft-deletes need a deleted_at column the schema doesn't have.)" },
      ],
      mutating: true,
      expected: EXPECTED["l43-p6"],
    },
    {
      id: "l43-p7",
      title: "The no-op purge",
      brief: "A ticket asks to delete every product with **zero stock**. Run the delete exactly as asked — `DELETE FROM products WHERE stock = 0` — and let the affected count speak. (Read-before-write veterans already know the number.)",
      hints: [
        "The WHERE is given verbatim; the statement's affected count is the graded answer.",
        "Shape: DELETE FROM products WHERE stock = 0;",
      ],
      difficulty: "easy",
      solution: "DELETE FROM products\nWHERE stock = 0;",
      mistakes: [
        { test: "stock\\s*<=\\s*0|stock\\s*<\\s*1", message: "Same sweep, shakier spelling — the ticket said zero, write zero. (Nothing has stock 0 or below, so all spellings report the same 0.)" },
        { test: "\\binsert\\b", message: "The ticket deletes — inserting a zero-stock product to then delete it is circular. Run the DELETE; its count tells the story." },
        { test: "delete\\s+from\\s+(orders|order_items|customers|suppliers)", message: "Wrong table — the zero-stock criterion lives on products. Deleting other tables' rows with a stock predicate isn't even parseable (no such column)." },
      ],
      mutating: true,
      expected: EXPECTED["l43-p7"],
    },
    {
      id: "l43-p8",
      title: "The single-unit sweep",
      brief: "The double-feed dedup rehearsal: **order_items is a leaf** — nothing references it — so it's the one table where a big sweep is always legal. Delete every line with `quantity = 1` and let the affected count (93) be your receipt.",
      hints: [
        "The leaf property means no FK fence can block this delete — no children to clear first.",
        "Shape: DELETE FROM order_items WHERE quantity = 1;",
      ],
      difficulty: "medium",
      solution: "DELETE FROM order_items\nWHERE quantity = 1;",
      mistakes: [
        { test: "quantity\\s*<=\\s*1", message: "<= adds nothing on this data — quantities are positive integers, so quantity = 1 and quantity <= 1 sweep identically (93). Write what the ticket says." },
        { test: "delete\\s+from\\s+orders", message: "orders is a parent — 93 arbitrary lines' worth of parent deletes would trip the fence mid-sweep. The rehearsal deliberately runs on the leaf." },
        { test: "\\blimit\\b", message: "SQLite's DELETE takes no LIMIT — the WHERE is the whole scope. (You'd notice here: 93 lines would have been a very specific LIMIT.)" },
      ],
      mutating: true,
      expected: EXPECTED["l43-p8"],
    },
  ],
  takeaway: "DELETE removes whole rows behind a full-power WHERE, RETURNING is the receipt — and the foreign-key fence means children leave before their parents, which is why real systems soft-delete business objects.",
  deep: [
    {
      kind: "mind",
      text: "DELETE is UPDATE's twin with a harsher failure mode: rows **leave the database**. The WHERE discipline is identical — target first, twin-SELECT, changes()-check — but there is no \"soft\" version of a deletion. The lesson's third idea is the **foreign-key fence**: references FROM other tables make deletion a graph operation, not a row operation. Deleting a customer who holds orders either fails (FK enforcement ON) or orphans 24 order rows (OFF) — both outcomes are data-model statements. The production-grade pattern is not \"delete harder\"; it's the soft-delete flag (active = 0 — the seed already carries 2 such customers) or the staged purge: children first, parents last, one transaction.",
    },
    {
      kind: "engine",
      title: "you run DELETE FROM orders WHERE status = 'cancelled'",
      steps: [
        "**Target pass** — WHERE resolves to the 7 cancelled orders. As with UPDATE: nothing is gone yet, and the SELECT twin of the WHERE previews the victims exactly.",
        "**FK scan** — for each victim the engine checks inbound references (nothing references orders here, so the fence doesn't fire; invoices referenced by payments would).",
        "**Row removal** — victims leave the b-tree; indexes on the table update in the same statement. The rollback sandbox then undoes it all — you saw the count without the loss.",
        "**Count** — changes() = 7. Any surprise in this number IS the incident report; reconcile before committing for real.",
      ],
    },
    {
      kind: "myth",
      myth: "\"DELETE FROM orders clears space immediately.\"",
      truth: "Freed pages typically go to the **freelist for reuse**, not back to the OS (and without VACUUM the file size doesn't shrink). Deleting 90% of a table then querying it can even be SLOWER until repack — deletion is a data operation, not a defrag tool.",
    },
    {
      kind: "edge",
      items: [
        { c: "FK enforcement OFF", r: "SQLite defaults to OFF per connection: the DELETE succeeds and leaves orphaned children silently. This course's lessons show both worlds — in production, decide deliberately and set PRAGMA foreign_keys = ON." },
        { c: "ON DELETE cascade", r: "A schema that declares ON DELETE CASCADE makes parent deletes sweep children automatically. Powerful, invisible, and terrifying in bulk — cascade chains have eaten more data than most hackers." },
        { c: "DELETE with JOIN", r: "Standard SQL deletes from ONE table; multi-table purges stage the victims: DELETE WHERE id IN (SELECT … FROM join). The staged form is also where you preview with SELECT first — same query, verb swapped." },
        { c: "TRUNCATE envy", r: "SQLite has no TRUNCATE; DELETE FROM tbl (no WHERE) is row-by-row. For full resets the course's resetDatabase() simply recreates tables — often the cheaper contract." },
      ],
    },  ],
};
