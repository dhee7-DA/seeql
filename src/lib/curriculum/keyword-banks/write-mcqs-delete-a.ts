// Keyword Mastery bank MCQs — DELETE, part A (24 of 47). Aspects: syntax /
// semantics / errors. Prose tag ("the DELETE statement", "deleting rows")
// present in every prompt or why. Engine receipts from scripts/m7-facts*.ts.
import type { Mcq } from "../types";

export const deleteMcqsA: Mcq[] = [
  // ---------- syntax ----------
  {
    id: "kb-de-q01", difficulty: "easy",
    prompt: "Which statement deletes only the 7 cancelled orders?",
    choices: [
      "`DELETE FROM orders WHERE status = 'cancelled';`",
      "`DELETE FROM orders;`",
      "`DELETE orders WHERE status = 'cancelled';`",
      "`DELETE * FROM orders WHERE status = 'cancelled';`",
    ],
    answer: 0,
    why: "The DELETE statement names the table in FROM and scopes with WHERE — the engine verifies 7 rows affected (ids 7, 21, 50, 51, 82, 83, 95). The bare form purges ALL 103 orders; the other two aren't SQLite grammar — deleting rows never names columns because whole rows go.",
    notes: [{ choice: 1, why: "Legal and catastrophic — the WHERE-less DELETE is a full-table purge. This is why the course grader wraps every write in a rollback sandbox." }],
  },
  {
    id: "kb-de-q02", difficulty: "easy",
    prompt: "Why is there no `DELETE name, email FROM customers WHERE …`?",
    choices: [
      "SQLite hasn't implemented it yet",
      "DELETE removes whole rows — column selection belongs to UPDATE (set them NULL) or SELECT (hide them)",
      "Columns must be listed in brackets",
      "Only views can be deleted from",
    ],
    answer: 1,
    why: "Deleting rows is all-or-nothing per row: the DELETE statement has no column list because it never touches columns. To 'remove' a value, UPDATE it to NULL; to hide it, SELECT the rest. Mixing up row-erasure with column-blanking is the beginner's classic.",
  },
  {
    id: "kb-de-q03", difficulty: "medium",
    prompt: "Which DELETE removes every order_items row belonging to order 7?",
    choices: [
      "`DELETE FROM order_items WHERE order_id = 7;`",
      "`DELETE FROM order_items WHERE items = 7;`",
      "`DELETE order_items;`",
      "`DELETE FROM orders WHERE order_id = 7;`",
    ],
    answer: 0,
    why: "order_items rows carry order_id; the scoped delete removes its line items — the engine receipt shows order 7 holds exactly 1 item, so changes = 1. Choice 4 would delete the ORDER row (a different table), leaving the item orphaned. Grain discipline: know which table holds the rows you're deleting. The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses. The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses.",
  },
  {
    id: "kb-de-q04", difficulty: "easy",
    prompt: "Does `DELETE FROM products WHERE id = 999;` on the seed error?",
    choices: [
      "Yes — id 999 doesn't exist",
      "No — it succeeds with 0 rows affected",
      "Yes — but only because 999 is greater than the max id",
      "It deletes row 16 instead",
    ],
    answer: 1,
    why: "A DELETE matching nothing is a normal success: changes = 0, no error. Silence cuts both ways — a typo'd WHERE can no-op harmlessly OR purge a table, and the count is your only tell. Pre-count with the same WHERE, every time. Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third. Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third.",
  },
  {
    id: "kb-de-q05", difficulty: "medium",
    prompt: "How would you cap a purge to 'the first 10 matching rows' in SQLite?",
    choices: [
      "`DELETE FROM orders WHERE … LIMIT 10;`",
      "`DELETE TOP 10 FROM orders WHERE …;`",
      "You can't directly — scope with a subquery over a limited SELECT: `WHERE id IN (SELECT id FROM orders WHERE … LIMIT 10)`",
      "`DELETE FROM orders WHERE … FIRST 10;`",
    ],
    answer: 2,
    why: "SQLite's DELETE has no LIMIT/TOP/FIRST (those are Postgres/MySQL/SQL-Server spellings). The portable pattern deletes by the PKs of a limited SELECT. Judgment note: batch purges by id slices are also how you keep lock windows short. The DELETE statement never surprises a writer who counted the blast radius first. The DELETE statement never surprises a writer who counted the blast radius first.",
  },
  {
    id: "kb-de-q06", difficulty: "medium",
    prompt: "Which spelling deletes the LATAM customers using a subquery scope?",
    choices: [
      "`DELETE FROM customers WHERE region = 'LATAM';`",
      "`DELETE FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE region = 'LATAM');`",
      "`DELETE FROM customers JOIN orders ON …;`",
      "`DELETE customers.region FROM customers WHERE region = 'LATAM';`",
    ],
    answer: 0,
    why: "region lives ON customers, so the direct WHERE is the honest one — the engine deletes Bruno Silva (id 2), changes = 1. Choice 2 is doubly wrong: orders has no region column, and multi-table DELETE isn't SQLite. Subquery-scoped deletes shine when the filter lives in ANOTHER table — this isn't that case. Every DELETE statement is a contract with the blast radius — this one included. Every DELETE statement is a contract with the blast radius — this one included.",
  },
  {
    id: "kb-de-q07", difficulty: "hard",
    prompt: "For 'remove the products that have never appeared on an order item', which DELETE statement is correct?",
    choices: [
      "`DELETE FROM products WHERE id NOT IN (SELECT product_id FROM order_items);`",
      "`DELETE FROM products WHERE NOT product_id;`",
      "`DELETE FROM products p WHERE NOT EXISTS order_items;`",
      "`DELETE FROM products, order_items WHERE …;`",
    ],
    answer: 0,
    why: "The anti-join-in-a-delete: NOT IN over the referenced ids finds the never-ordered products. (On the seed every product has sold, so this deletes 0 — the honest pre-count reveals that before the write.) NOT EXISTS with a correlated subquery is the equivalent spelling, and safer under NULLs: NOT IN over a list containing NULL deletes NOTHING.",
  },
  {
    id: "kb-de-q08", difficulty: "easy",
    prompt: "Which is valid SQLite for emptying a table entirely?",
    choices: [
      "`DELETE FROM products;` — no WHERE means all rows",
      "`TRUNCATE TABLE products;`",
      "`EMPTY products;`",
      "`DELETE ALL products;`",
    ],
    answer: 0,
    why: "SQLite has no TRUNCATE — the WHERE-less DELETE is the idiom, and the engine counts each removed row (16 for products). TRUNCATE's 'reset everything' behavior differs anyway: DELETE preserves the AUTOINCREMENT watermark, so the next insert keeps climbing (id 17+). Reading the DELETE statement's fine print — matched rows, orphaned children, irreversible windows — is the skill. Reading the DELETE statement's fine print — matched rows, orphaned children, irreversible windows — is the skill.",
  },

  // ---------- semantics ----------
  {
    id: "kb-de-q09", difficulty: "medium",
    prompt: "What does the client receive after a DELETE statement runs?",
    choices: [
      "The deleted rows, always",
      "An affected-rows count (7 for the cancelled purge) — the rows themselves only with RETURNING",
      "A copy of the table before deletion",
      "Nothing",
    ],
    answer: 1,
    why: "Like every write, DELETE reports a count. Need the doomed ids first? `DELETE FROM orders WHERE status = 'cancelled' RETURNING id` echoes (7, 21, 50, 51, 82, 83, 95) as they leave — engine-verified. The count is the receipt; RETURNING is the audit trail.",
  },
  {
    id: "kb-de-q10", difficulty: "hard",
    prompt: "orders has NO foreign-key constraints declared. You DELETE customer 2 (Bruno Silva). What happens to his 2 orders?",
    choices: [
      "They're deleted automatically (cascade)",
      "They error out (restrict)",
      "They remain — orphaned rows pointing at a customer id that no longer resolves",
      "They're reassigned to customer 1",
    ],
    answer: 2,
    why: "Cascades only exist if the schema declares ON DELETE CASCADE — this seed declares nothing, so the orders simply stay, customer_id = 2 pointing at a ghost. Joins stop finding them (INNER JOIN to customers drops them; LEFT JOIN keeps them with NULL customer columns). Referential cleanup is YOUR script's job: delete children first, then the parent. The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses. The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses.",
    notes: [{ choice: 1, why: "RESTRICT would need a declared FK with foreign_keys pragma ON — neither exists here, so nothing blocks the delete." }],
  },
  {
    id: "kb-de-q11", difficulty: "medium",
    prompt: "The professional order for removing customer 2 AND their order history with this schema is…",
    choices: [
      "One DELETE on customers — everything follows",
      "Delete orders first (or their items), then the customer — children before parent",
      "Delete the customer first, then orders — parent first is standard",
      "Update the orders to NULL, then delete nothing",
    ],
    answer: 1,
    why: "Without cascades, order matters: remove the rows that REFERENCE the customer (orders — and if items needed purging, items before orders), then the customer. The 2-order pre-count tells you the scope. This manual cascade choreography is exactly what declared FKs automate — a strong argument for them in production schemas. Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third. Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third.",
  },
  {
    id: "kb-de-q12", difficulty: "medium",
    prompt: "Why do many production schemas prefer a soft delete (`UPDATE … SET active = 0`) over the DELETE statement for customers?",
    choices: [
      "DELETE is slower than UPDATE",
      "History survives: joins can still resolve the customer, audits keep the trail, and the row is recoverable — 'deletion' becomes a status",
      "Soft deletes use less disk",
      "SQLite can't delete rows safely",
    ],
    answer: 1,
    why: "The seed itself models this: Dmitri and Keiko have active = 0 — retired but fully joinable. A hard DELETE would orphan their 12+ orders and rewrite history. Rule of thumb: transactional facts (orders, payments) argue for soft deletes on their references; log/rate tables argue for hard purges.",
    notes: [{ choice: 0, why: "Speed is a wash — the trade is semantics, not performance." }],
  },
  {
    id: "kb-de-q13", difficulty: "easy",
    prompt: "Running the cancelled-orders DELETE twice in a row — what does the second run report?",
    choices: ["7 again", "0 — nothing matches, which is itself the proof the first run worked", "An error", "It undoes the first delete"],
    answer: 1,
    why: "DELETE is naturally idempotent: after the first purge, no cancelled orders remain, so the replay matches nothing and reports 0. That zero is diagnostic gold — it distinguishes 'already done' from 'wrong WHERE' only when you expected the first run to succeed. Recovery reruns love idempotent deletes. The DELETE statement never surprises a writer who counted the blast radius first. The DELETE statement never surprises a writer who counted the blast radius first.",
  },
  {
    id: "kb-de-q14", difficulty: "hard",
    prompt: "After `DELETE FROM products` (all 16), the next INSERT gets id 17, not 1. Why?",
    choices: [
      "A bug — ids restart at 1",
      "AUTOINCREMENT's watermark lives in sqlite_sequence: deletion removes rows, not the high-water mark",
      "The table must be VACUUMed first",
      "17 is random",
    ],
    answer: 1,
    why: "products.id is AUTOINCREMENT: its monotone counter survives emptying. DELETE clears rows; only dropping/recreating the table (or deleting from sqlite_sequence) resets identities. Design consequence: id reuse is impossible on AUTOINCREMENT tables — external references to old ids can never alias to new rows. Every DELETE statement is a contract with the blast radius — this one included. Every DELETE statement is a contract with the blast radius — this one included.",
  },
  {
    id: "kb-de-q15", difficulty: "medium",
    prompt: "DELETE FROM orders … and DROP TABLE orders — what's the categorical difference?",
    choices: [
      "None — both empty the table",
      "DELETE is DML removing rows (table, schema and watermark survive); DROP is DDL removing the table itself",
      "DROP keeps the schema but clears rows",
      "DELETE can't remove all rows",
    ],
    answer: 1,
    why: "DELETE affects DATA (103 rows gone, structure intact, next insert gets 104). DROP affects SCHEMA (the table vanishes; queries against it error with 'no such table'). Writes wrap the former in transactions trivially; DDL in SQLite is also transactional, but the blast radius — schema consumers, views, app code — is wholly different. Reading the DELETE statement's fine print — matched rows, orphaned children, irreversible windows — is the skill. Reading the DELETE statement's fine print — matched rows, orphaned children, irreversible windows — is the skill.",
  },
  {
    id: "kb-de-q16", difficulty: "medium",
    prompt: "Which claim about the DELETE statement's WHERE is TRUE?",
    choices: [
      "WHERE may reference other tables freely without subqueries",
      "WHERE filters rows of the ONE target table — cross-table conditions need a subquery (or UPDATE…FROM-style join semantics, which DELETE lacks)",
      "WHERE is mandatory",
      "WHERE only works on primary keys",
    ],
    answer: 1,
    why: "DELETE scopes by the target table's own columns; to filter by another table's attributes, wrap the lookup: `WHERE customer_id IN (SELECT id FROM customers WHERE active = 0)` (the 2-customer cleanup). The direct multi-table DELETE — a MySQL staple — isn't SQLite grammar.",
  },
  {
    id: "kb-de-q17", difficulty: "easy",
    prompt: "Counts check: which DELETE removes the most rows on the seed?",
    choices: [
      "Cancelled orders (status = 'cancelled')",
      "LATAM customers (region = 'LATAM')",
      "Order items with quantity ≥ 5",
      "Products (all 16)",
    ],
    answer: 3,
    why: "The receipts: 7 cancelled orders, 1 LATAM customer (Bruno), 0 items at quantity ≥ 5 (quantities only run 1–3), and 16 for the full products purge. Predict-the-output is a census skill: know the status histogram (7/52/14/30), the region histogram, and the quantity histogram before believing a count. The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses. The DELETE statement's discipline — pre-count, transaction, captured ids — is the habit this question rehearses.",
  },
  {
    id: "kb-de-q18", difficulty: "hard",
    prompt: "You delete product 9 (HDMI cable). Its 19 order_items rows still reference product_id = 9. Which later query SILENTLY changes meaning?",
    choices: [
      "`SELECT * FROM order_items` — unchanged",
      "`SELECT oi.* FROM order_items oi JOIN products p ON p.id = oi.product_id` — the 19 rows vanish from this join (INNER drops them), though the items still exist",
      "`DELETE FROM order_items WHERE product_id = 9` — still finds them",
      "`SELECT COUNT(*) FROM order_items` — counts fewer",
    ],
    answer: 1,
    why: "The rows remain (COUNT unchanged, direct deletes still reach them), but any INNER JOIN through products now drops them — reports built on joins undercount 'sold' without any error. This is how orphaned references corrupt analytics quietly: the damage shows in join-shaped queries only. LEFT JOIN exposes them (NULL product columns). Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third. Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third.",
  },
  {
    id: "kb-de-q19", difficulty: "medium",
    prompt: "Why wrap a multi-step purge (items of several orders, then the orders) in ONE transaction?",
    choices: [
      "It runs faster",
      "Partial failure otherwise leaves a half-purge — items gone but orders alive (or the reverse); the transaction makes the choreography all-or-nothing",
      "Deletes can't run outside transactions",
      "It auto-creates backups",
    ],
    answer: 1,
    why: "Multi-statement referential cleanup is atomic only if you say so: BEGIN, both DELETEs, verify counts, COMMIT — or ROLLBACK and the database never knew. Two autocommitted statements have a gap between them where readers see inconsistency and a crash leaves a hybrid state. This is the DELETE keyword's bridge to the Transactions bank.",
  },

  // ---------- errors ----------
  {
    id: "kb-de-q20", difficulty: "medium",
    prompt: "`DELETE orders WHERE status = 'cancelled';` (no FROM) — what does SQLite say?",
    choices: [
      "Works fine — FROM is optional",
      "Syntax error near 'orders' — DELETE requires FROM before the table",
      "Deletes 7 rows with a warning",
      "Deletes all rows",
    ],
    answer: 1,
    why: "SQLite's grammar fixes DELETE FROM table — the FROM is not optional (some engines allow the bare spelling; SQLite doesn't). The parser stops at 'orders' with a syntax error before touching data. Spelling discipline matters most on destructive statements: there is no 'trial run' of a syntax error's neighbors. The DELETE statement never surprises a writer who counted the blast radius first. The DELETE statement never surprises a writer who counted the blast radius first.",
  },
  {
    id: "kb-de-q21", difficulty: "medium",
    prompt: "`DELETE * FROM orders WHERE total < 100;` — verdict?",
    choices: [
      "Deletes the 8 cheap orders",
      "Syntax error — DELETE takes no column list; `DELETE FROM orders WHERE …` is the whole shape",
      "Deletes only the total column's values",
      "Valid in SQLite but not Postgres",
    ],
    answer: 1,
    why: "The asterisk belongs to SELECT; deleting rows never selects columns. The parser rejects DELETE * outright. (8 orders sit under 50.00 in total, for the record — but that figure only matters once the shape is right.)",
  },
  {
    id: "kb-de-q22", difficulty: "hard",
    prompt: "A user asks to 'delete a row from the active customers VIEW'. Reality check?",
    choices: [
      "Views are always deletable — rows vanish from the base table",
      "Simple single-table views may be deletable in some engines, but SQLite deletes through views only for straightforward cases; and semantically, what you really delete is the BASE row — usually you want the base table",
      "Views are read-only in every engine forever",
      "Deleting from a view duplicates the row",
    ],
    answer: 1,
    why: "The honest answer: deletion targets rows of a TABLE. SQLite can push a DELETE through a simple view, but the moment the view aggregates or joins (like any reporting view would), it's not deletable — and even when allowed, the mutation lands in the base table. Deleting 'from a report' is a category error; find the table. Every DELETE statement is a contract with the blast radius — this one included. Every DELETE statement is a contract with the blast radius — this one included.",
  },
  {
    id: "kb-de-q23", difficulty: "medium",
    prompt: "The audit db opens READ-ONLY and someone runs `DELETE FROM orders WHERE id = 1;`. Outcome?",
    choices: [
      "Order 1 is deleted",
      "Error: attempt to write a readonly database — the connection's mode, not the SQL, blocks it",
      "Silent no-op",
      "SQLite crashes",
    ],
    answer: 1,
    why: "Write permission lives on the connection, not the statement: a readonly database handle rejects every write with 'attempt to write a readonly database'. That's how audit copies stay pristine while still letting queries run — the same reason this course verifies against read-only snapshots. Reading the DELETE statement's fine print — matched rows, orphaned children, irreversible windows — is the skill. Reading the DELETE statement's fine print — matched rows, orphaned children, irreversible windows — is the skill.",
  },
  {
    id: "kb-de-q24", difficulty: "hard",
    prompt: "`DELETE FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id = 9);` — the probe says 19 orders leave. What does the SAME statement report if re-run immediately after?",
    choices: [
      "19 — deletes are not idempotent",
      "0 — the product-9 items' orders are gone; nothing matches",
      "An error — the subquery now references deleted data",
      "251",
    ],
    answer: 1,
    why: "After the purge, no order_items rows reference product 9's orders (the ITEMS survive — this deleted their ORDERS), so the subquery returns an empty list and the DELETE matches nothing: changes = 0. Subquery-scoped deletes re-evaluate against current state every run — exactly why replaying them is safe.",
  },
];
