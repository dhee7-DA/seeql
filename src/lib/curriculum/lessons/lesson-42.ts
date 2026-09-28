import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson42: Lesson = {
  id: "lesson-42",
  num: 42,
  title: "UPDATE — changing rows in place",
  blurb: "SET assignments, the WHERE discipline, expressions that read their own old value, CASE branching inside SET and UPDATE … FROM — with RETURNING showing the after-state",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "Rows don't sit still. Stock arrives and drains, prices get marked up, a pending order ships. **UPDATE** rewrites existing rows in place — same ids, same row count, new values. It's also the most quietly dangerous statement you'll use daily: reading is reversible (run it again), but an update over the wrong rows must be undone, not re-read. Sandboxed as always here — in production the discipline below is the safety net.",
    },
    { kind: "diagram", figure: "w2-update-sweep" },
    { kind: "h", text: "SET is an assignment list" },
    {
      kind: "bullets",
      items: [
        "`UPDATE table SET col = expr, col2 = expr2 WHERE …` — every listed assignment applies to **every row the WHERE keeps**; rows the WHERE drops are untouched.",
        "The right side is an expression evaluated against the row's **current** values: `stock = stock + 30` reads the old stock and writes the new one — no two-statement dance needed.",
        "`RETURNING …` echoes the rows after the change; without it you get only the affected count — which is itself a useful check: *I meant to touch 2 rows and the engine says 16* is a one-second save.",
      ],
    },
    {
      kind: "code",
      caption: "Restock by expression — the old value feeds the new one",
      sql: `UPDATE products SET stock = stock + 30
WHERE id = 1
RETURNING id, stock;   -- Mechanical Keyboard K1: 120 → 150`,
    },
    { kind: "h", text: "Branch on data — CASE inside SET" },
    {
      kind: "code",
      caption: "One scan, two fates: thin shelves get the delivery",
      sql: `UPDATE products
SET stock = stock + CASE WHEN stock < 50 THEN 40 ELSE 0 END
WHERE stock < 50
RETURNING id, stock;   -- Studio Desktop Mic 45 → 85 · Smart Watch S 40 → 80`,
    },
    {
      kind: "bullets",
      items: [
        "Lesson 23's CASE now sits on the write side: each row takes its own branch, so one statement replaces a hand-run list of per-product updates.",
        "The `ELSE 0` guard is what makes this safe to widen later — a future row that slips past the WHERE adds nothing instead of NULL-poisoning its stock.",
      ],
    },
    { kind: "h", text: "UPDATE … FROM — targets from another table" },
    {
      kind: "code",
      caption: "Align EU supplier prices by their rating factor — a join that writes",
      sql: `UPDATE products
SET price = ROUND(price * s.factor, 2)
FROM (SELECT id AS sid, rating / 5.0 AS factor
      FROM suppliers WHERE region = 'EU') AS s
WHERE supplier_id = s.sid
RETURNING id, price;   -- 5 products re-priced: K1 82.79, Studio Mic 114.24, …`,
    },
    {
      kind: "bullets",
      items: [
        "The FROM clause works like the FROM you know — subquery, join and all — and the WHERE links each target row to its source row. It's lesson 11's join mechanics wearing a write hat.",
        "SQLite has had this spelling since 3.33. Older code rolls it by hand: a correlated subquery in SET (`SET price = ROUND(price * (SELECT rating …), 2)`) — lesson 26's shape, slower but portable.",
      ],
    },
    {
      kind: "warn",
      text: "Run the SELECT before the UPDATE: `SELECT id, stock FROM products WHERE stock < 50` shows exactly the rows the WHERE will keep. Ten seconds of reading beats ten minutes of restoring — and production has no rollback button unless you opened a transaction first (lesson 44).",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "PostgreSQL's `UPDATE … FROM` takes the same shape — SET stays assignment-style and the FROM carries joins. MySQL instead joins in the UPDATE header: `UPDATE products p JOIN suppliers s ON … SET p.price = …`.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite accepts both self-referencing assignments and UPDATE … FROM (3.33+), plus RETURNING on every write — the exact toolkit this lesson runs.",
    },
  ],
  mcqs: [
    {
      id: "l42-q1",
      prompt: "`UPDATE products SET stock = 0` — no WHERE. What happens?",
      choices: [
        "An error — WHERE is required",
        "Nothing — without WHERE the engine waits",
        "Every row's stock becomes 0",
        "Only the first row changes",
      ],
      answer: 2,
      why: "UPDATE applies its SET to every row the WHERE keeps — no WHERE means every row. This is the single most expensive typo in SQL; run the SELECT first, or rely on a transaction to undo it.",
      notes: [
        { choice: 0, why: "Legally valid, deliberately — the standard assumes you sometimes do mean all rows. The guard is procedural: SELECT first, transaction around it." },
      ],
    },
    {
      id: "l42-q2",
      prompt: "In `SET stock = stock + 30`, which value does the right-hand `stock` read?",
      choices: [
        "The new value — updates happen left to right",
        "The old value — assignments evaluate against the row's current state",
        "The average stock — expressions see the whole table",
        "It's an error — a column can't reference itself",
      ],
      answer: 1,
      why: "All right-hand expressions are evaluated against the row as it was before the update, then the results are written. Self-reference is the standard increment/decrement pattern, not a bug.",
      notes: [
        { choice: 0, why: "There's no left-to-right cascade — SET is one atomic snapshot per row, which is why swapping two columns needs a temp variable in some engines but `SET a = b, b = a` works in SQLite." },
      ],
    },
    {
      id: "l42-q3",
      prompt: "After `UPDATE products SET price = 10 WHERE stock = 0 RETURNING price;` — RETURNING shows…",
      choices: [
        "The prices as they were before",
        "The prices after the update",
        "An error — RETURNING can't be used on UPDATE",
        "Only the count of changed rows",
      ],
      answer: 1,
      why: "RETURNING computes its expressions after the change, so you see the new state — 10 for every row the WHERE kept. It's the write-side twin of a SELECT, including expressions and aliases.",
      notes: [
        { choice: 3, why: "The affected count arrives even without RETURNING — RETURNING is for the rows themselves. Both together are the post-flight checklist." },
      ],
    },
    {
      id: "l42-q4",
      prompt: "What does `UPDATE … FROM (SELECT …) s WHERE …` add over a plain UPDATE?",
      choices: [
        "Faster writes — SQLite reorders the table",
        "The ability to compute each row's new value from other tables, joined per row",
        "It makes the update transactional",
        "It bypasses the WHERE clause",
      ],
      answer: 1,
      why: "FROM supplies per-row companion data — a rating, a lookup, an aggregate from a derived table — that the SET expression can reference. The write is still one statement and still obeys its WHERE.",
      notes: [
        { choice: 2, why: "Transactions come from BEGIN/COMMIT (lesson 44), never from a clause inside one statement. FROM only adds data to reason with." },
      ],
    },
    {
      id: "l42-q5",
      prompt: "The engine reports *3 rows affected* for an UPDATE you expected to touch 1 row. What's the most likely cause?",
      choices: [
        "The WHERE matched 3 rows — its condition is wider than you think",
        "SQLite repeats updates on retry",
        "RETURNING inflated the count",
        "The SET listed 3 columns",
      ],
      answer: 0,
      why: "The affected count is exactly the number of rows the WHERE kept. Three instead of one means the condition matched neighbors too — id vs name vs a range boundary are the usual suspects.",
      notes: [
        { choice: 3, why: "Three assignments on one row still count as one affected row — the count is rows, not column changes." },
      ],
    },
    {
      id: "l42-q6",
      prompt: "`UPDATE orders SET status = 'shipped', shipped_at = '2026-01-06' WHERE status = 'pending'` — how does one statement carry two changes?",
      choices: [
        "SET accepts one assignment; the second needs a second statement",
        "Assignments comma-separate — both apply to every row the WHERE selects",
        "The last assignment wins, shipped_at is ignored",
        "Two assignments require two WHERE clauses",
      ],
      answer: 1,
      why: "SET is a comma-separated list of column = expression pairs, and every matched row gets ALL of them in one pass — status and shipped_at change together, which is exactly what a shipment event means. One statement, one consistent after-state.",
      notes: [
        { choice: 0, why: "One assignment per statement would make status/date pairs drift apart mid-flight — the comma list exists precisely so related fields move atomically." },
      ],
    },
    {
      id: "l42-q7",
      prompt: "After `UPDATE products SET price = ROUND(price * 1.05, 2)` — why is ROUND part of the expression instead of a separate step?",
      choices: [
        "SQLite refuses arithmetic on REAL columns",
        "Floating-point math leaves artifacts like 41.989500000000004 — ROUND snaps money to 2 decimals as the value is written",
        "ROUND makes the UPDATE faster",
        "ROUND is required syntax after any multiplication",
      ],
      answer: 1,
      why: "39.99 × 1.05 evaluates to 41.9895… in binary floating point. Rounding inside the SET means every written price lands at exactly 2 decimals — the after-state is clean money, and RETURNING shows 41.99, not the artifact.",
      notes: [
        { choice: 2, why: "ROUND costs a function call per row — negligible. The reason is correctness of stored values, not speed." },
      ],
    },
    {
      id: "l42-q8",
      prompt: "`UPDATE orders SET shipped_at = NULL WHERE status = 'cancelled'` — what lands in shipped_at?",
      choices: [
        "The four-letter string 'NULL'",
        "An error — UPDATE can't write NULL",
        "Bare NULL — the missing marker, unquoted",
        "The current timestamp",
      ],
      answer: 2,
      why: "NULL is written exactly like it's read: bare, no quotes. Quoted 'NULL' is a four-character string that then pollutes every IS NULL check and COALESCE chain downstream — the same trap as lesson 4's quoted-NULL insert.",
      notes: [
        { choice: 0, why: "The string 'NULL' is truthy, sortable, and 4 characters long — nothing about it is missing. Only the bare keyword is the marker." },
      ],
    },
    {
      id: "l42-q9",
      prompt: "`UPDATE products SET stock = 0` runs on the 16-product table. What does the affected count report?",
      choices: [
        "0 — no rows were deleted",
        "1 — an UPDATE is one statement",
        "16 — every row the WHERE matched (no WHERE means all)",
        "Only rows whose stock actually changed value",
      ],
      answer: 2,
      why: "The counter follows the WHERE: no WHERE, all 16 rows matched, changes = 16. SQLite counts matched-and-written rows — it doesn't diff old versus new values to decide what 'counts'. That's why a table-wide no-op guard (ELSE 0) still reports a full sweep.",
      notes: [
        { choice: 3, why: "Value-diffing would be a nice courtesy but isn't the contract — the engine reports the sweep width, and your WHERE is what keeps the sweep honest." },
      ],
    },
    {
      id: "l42-q10",
      prompt: "Two products sit at stock 300 and stock 40. After `UPDATE products SET stock = stock + 30`, what are their stocks?",
      choices: [
        "Both 330 — the expression computed once from the first row",
        "330 and 70 — the expression evaluates per row against each row's own old value",
        "30 and 30 — SET replaced the values",
        "Both 70 — rows share one buffer",
      ],
      answer: 1,
      why: "The right-hand `stock` reads the current row's own value: 300 + 30 for one, 40 + 30 for the other. UPDATE is a per-row sweep, each row independently reading its old state and writing its new — that's what makes stock = stock + delta the universal inventory move.",
      notes: [
        { choice: 0, why: "There's no single shared evaluation — the SET expression is the row's own recipe. Shared constants go in literals; per-row values come from column names." },
      ],
    },
    {
      id: "l42-q11",
      prompt: "`UPDATE orders SET status = 'cancelled' WHERE customer_id IN (SELECT id FROM customers WHERE active = 0)` — how wide is this sweep?",
      choices: [
        "All 103 orders — the subquery is decorative",
        "0 — IN can't be used in UPDATE",
        "6 — the orders of the two inactive customers (Dmitri's 2, Keiko's 4)",
        "16 — one per customer",
      ],
      answer: 2,
      why: "The subquery freezes to {4, 11} first, then the sweep matches exactly their orders: Dmitri Volkov's 2 and Keiko Sato's 4 — six rows cancelled. It's the anti-join lesson's set logic, now driving a write, and the affected count is how you verify the width before trusting it.",
      notes: [
        { choice: 1, why: "IN subqueries work in any WHERE — reads, UPDATEs, DELETEs alike. The write verbs get the full filtering toolkit." },
      ],
    },
    {
      id: "l42-q12",
      prompt: "A colleague ran an UPDATE and now the products table shows 18 rows where there were 16. What actually happened?",
      choices: [
        "UPDATE can insert rows when the WHERE is wide enough",
        "Nothing about UPDATE changed the count — two INSERTs must have run too",
        "SQLite auto-inserts on overflow",
        "The count is wrong; UPDATE never touches row counts",
      ],
      answer: 1,
      why: "UPDATE rewrites values in place — row count and ids are structurally untouchable by it. If the count moved, an INSERT (or two) also ran. That separation of powers is the write verbs' whole design: each verb owns exactly one kind of change.",
      notes: [
        { choice: 3, why: "UPDATE does touch rows — their VALUES. The count of ROWS is what it can't change; INSERT adds and DELETE removes, always." },
      ],
    },
    {
      id: "l42-q13",
      prompt: "In `UPDATE products SET price = ROUND(price * s.factor, 2) FROM (SELECT id, 1.1 AS factor …) s WHERE supplier_id = s.id` — when does the derived table compute?",
      choices: [
        "Once per updated row, like a correlated subquery",
        "Once, before the sweep — it freezes into a temp list the WHERE then matches against",
        "After all rows are updated",
        "Only if the optimizer fails",
      ],
      answer: 1,
      why: "The FROM derived table evaluates exactly once — a frozen companion list of (id, factor) pairs. The sweep then pairs each candidate row against that list. That's the two-stage discipline from Module 4 wearing a write statement: stage one computes, stage two applies.",
      notes: [
        { choice: 0, why: "Correlation would re-run the subquery per row — the derived table form is precisely the NON-correlated spelling, evaluated once. That's its whole efficiency argument." },
      ],
    },
    {
      id: "l42-q14",
      prompt: "What glues the derived table to the rows being updated in `UPDATE products SET … FROM (…) s WHERE …`?",
      choices: [
        "Nothing — every product pairs with every derived row",
        "The WHERE linking the tables' keys — e.g. `supplier_id = s.sid` — without it the pairing goes cartesian",
        "The SET clause does the joining",
        "Column order — first derived column matches the first target row",
      ],
      answer: 1,
      why: "UPDATE … FROM has no ON clause — the join lives in the WHERE. One equality between the target's key and the derived table's key turns the cartesian soup into one match per row; forget it and every candidate pairs with every companion row (lesson 14's fan-out, now writing values).",
      notes: [
        { choice: 0, why: "Cartesian pairing is exactly the BUG this shape produces when the WHERE is missing — prices churn once per pair instead of once per row. The key equality is the fix." },
      ],
    },
    {
      id: "l42-q15",
      prompt: "`UPDATE … FROM (SELECT …) s WHERE …` is SQLite (and PostgreSQL/SQL Server) flavor. What's the standard-SQL spelling for the same job?",
      choices: [
        "A correlated subquery inside SET — `SET price = ROUND(price * (SELECT factor FROM rates r WHERE r.supplier_id = products.supplier_id), 2)`",
        "UPDATE … JOIN — the universal form",
        "MERGE — always available in SQLite",
        "There is none — portability means doing it in app code",
      ],
      answer: 0,
      why: "The portable spelling puts a correlated subquery in the SET expression: it reads the companion table per row, keyed on the outer row's own columns. Same result, different engine budget — and a great dialect-watch example of one job wearing three syntactic coats.",
      notes: [
        { choice: 1, why: "UPDATE … JOIN is MySQL's flavor — the third coat on the same job, and just as non-portable. Standard SQL has only the subquery spelling." },
      ],
    },
    {
      id: "l42-q16",
      prompt: "`UPDATE products SET stock = 0 WHERE stock < 0 OR stock IS NULL` runs on a table where no stock is negative and none are NULL. The engine reports…",
      choices: [
        "An error — the predicate is unsatisfiable",
        "0 rows affected — a successful statement that matched nothing",
        "All rows — OR widens any predicate to everything",
        "A warning and no execution",
      ],
      answer: 1,
      why: "A zero-match UPDATE is a SUCCESS with an affected count of 0 — the quiet twin of the full-table rewrite. Pre-counting with the same WHERE (SELECT COUNT …) is how you tell 'correctly matched nothing' from 'my WHERE is nonsense' before the write runs.",
      notes: [
        { choice: 2, why: "OR widens only across its OPERANDS — 'stock < 0 OR stock IS NULL' is still a concrete filter. Widening to all-rows is what a tautology does, not OR by itself." },
      ],
    },
    {
      id: "l42-q17",
      prompt: "Two UPDATEs run in sequence: (1) `SET price = 20 WHERE category = 'Fitness'` (1 row), (2) `SET price = price * 1.1 WHERE price = 20`. Why can statement 2 hit MORE rows than the Fitness shelf?",
      choices: [
        "It can't — the second statement sees the original data",
        "Because statement 1 already wrote 20 into those rows — writes compose through the data, so any OTHER product already priced 20 joins the match set too",
        "Because SQLite caches the first statement's WHERE",
        "Because 1.1 multiplies the match count",
      ],
      answer: 1,
      why: "Each UPDATE reads the CURRENT table state: after statement 1, every Fitness row is priced 20 — and any product that ALREADY sat at 20 matches statement 2's WHERE too. Sequenced writes interact through the data; that's the whole reason the course runs them one at a time in a sandbox.",
      notes: [
        { choice: 0, why: "The opposite — the second statement sees exactly what the first wrote. Ignoring that is how batch scripts double-apply discounts." },
      ],
    },
  ],
  problems: [
    {
      id: "l42-p1",
      title: "K1 restock",
      brief: "Thirty keyboards landed for the **Mechanical Keyboard K1** (product **id 1**). Raise its stock from 120 to 150 **by expression** — no hardcoding the result — and echo `id`, `stock`.",
      hints: [
        "The right side of an assignment can read the column it's writing.",
        "Shape: UPDATE products SET stock = stock + 30 WHERE id = 1 RETURNING id, stock;",
      ],
      difficulty: "easy",
      solution: "UPDATE products SET stock = stock + 30\nWHERE id = 1\nRETURNING id, stock;",
      mistakes: [
        { test: "set stock = 150", message: "Hardcoding 150 works today and breaks the next time the shelf starts at a different level — write the delta: stock = stock + 30." },
        { test: "stock = stock - 30|stock - 30 where", message: "Wrong direction — the delivery ADDS thirty units; subtraction is what a shipment out would do." },
        { test: "where name", message: "Filtering by name matches text exactly and is slower to reason about than the stable id — the brief names product id 1; key on it." },
      ],
      mutating: true,
      expected: EXPECTED["l42-p1"],
    },
    {
      id: "l42-p2",
      title: "The Wearables price hike",
      brief: "A 10% markup goes live on the whole **Wearables** category (2 products: Fitness Band X2, Smart Watch S). Write the update so prices are **rounded to 2 decimals**, and echo `id`, `name`, `price`.",
      hints: [
        "Multiply by 1.1 and wrap the expression in ROUND(…, 2) — money columns never keep stray thirds.",
        "Shape: UPDATE products SET price = ROUND(price * 1.1, 2) WHERE category = 'Wearables' RETURNING id, name, price;",
      ],
      difficulty: "medium",
      solution: "UPDATE products\nSET price = ROUND(price * 1.1, 2)\nWHERE category = 'Wearables'\nRETURNING id, name, price;",
      mistakes: [
        { test: "price = price \\* 1\\.1(?!,)", message: "No rounding — 79 × 1.1 lands at 86.90000000000001 in floating point. Money gets ROUND(expr, 2), always." },
        { test: "\\*\\s*0\\.9|\\*\\s*1\\.01\\b", message: "Wrong factor — a 10% markup multiplies by 1.10. Times 0.9 is a discount; 1.01 is one percent." },
        { test: "category = 'electronics'|category = 'audio'", message: "Wrong shelf — the brief targets Wearables, the two-product category with Fitness Band X2 and Smart Watch S." },
      ],
      mutating: true,
      expected: EXPECTED["l42-p2"],
    },
    {
      id: "l42-p3",
      title: "Thin shelves get first delivery",
      brief: "The delivery rule: every product with **stock below 50** receives **40 more units** — in one statement, using CASE inside SET so the logic lives in the SQL. Echo `id`, `stock` (expect the Studio Desktop Mic at 45 → 85 and Smart Watch S at 40 → 80).",
      hints: [
        "CASE WHEN stock < 50 THEN 40 ELSE 0 END inside the assignment; keep a WHERE so untouched rows aren't scanned for nothing.",
        "Shape: UPDATE products SET stock = stock + CASE WHEN stock < 50 THEN 40 ELSE 0 END WHERE stock < 50 RETURNING id, stock;",
      ],
      difficulty: "medium",
      solution: "UPDATE products\nSET stock = stock + CASE WHEN stock < 50 THEN 40 ELSE 0 END\nWHERE stock < 50\nRETURNING id, stock;",
      mistakes: [
        { test: "case when stock < 100", message: "Wrong threshold — the brief says below 50. At < 100 the Webcam (70) and Headset (60) would wrongly take a delivery too." },
        { test: "end returning|else 0 end returning", message: "The CASE landed but the WHERE disappeared — without it every row is a candidate, and while the ELSE 0 guard keeps numbers right, the affected count (16) will scream that you did a table-wide pass." },
        { test: "when stock = 50|when stock <= 50", message: "Boundary drift — the rule is *below* 50, strictly. On today's data no product sits exactly at 50, but the query you ship should still say what the ticket said." },
      ],
      mutating: true,
      expected: EXPECTED["l42-p3"],
    },
    {
      id: "l42-p4",
      title: "EU supplier price alignment",
      brief: "Purchasing policy: every product's price should track its supplier's quality. For products of **EU suppliers only**, set `price = ROUND(price * rating / 5.0, 2)` — pull the rating through **UPDATE … FROM**. Echo `id`, `price` (5 rows: two Nordic Gadgets / Alpine Audio ratings at work).",
      hints: [
        "FROM holds a derived table producing (sid, factor); the WHERE glues each product to its supplier row.",
        "Shape: UPDATE products SET price = ROUND(price * s.factor, 2) FROM (SELECT id AS sid, rating / 5.0 AS factor FROM suppliers WHERE region = 'EU') AS s WHERE supplier_id = s.sid RETURNING id, price;",
      ],
      difficulty: "hard",
      solution: "UPDATE products\nSET price = ROUND(price * s.factor, 2)\nFROM (SELECT id AS sid, rating / 5.0 AS factor\n      FROM suppliers WHERE region = 'EU') AS s\nWHERE supplier_id = s.sid\nRETURNING id, price;",
      mistakes: [
        { test: "\\)\\s*returning", message: "The derived table is there but the link is missing — without WHERE supplier_id = s.sid every product row pairs with every EU supplier row and prices churn five times over." },
        { test: "products\\.id\\s*=\\s*s\\.sid", message: "Joining on the wrong key — the derived table's sid is a SUPPLIER id, so the match is products.supplier_id = s.sid, not products.id." },
        { test: "where region = 'apac'|where region = 'us'", message: "Wrong region — the policy names EU suppliers (Nordic Gadgets AB 4.6 and Alpine Audio GmbH 4.8), which reaches exactly 5 products." },
      ],
      mutating: true,
      expected: EXPECTED["l42-p4"],
    },
    {
      id: "l42-p5",
      title: "The Ring Light markup",
      brief: "The 14-inch **Ring Light** (product **id 8**, 39.99) gets a **5% markup**. Write it as `ROUND(price * 1.05, 2)` — money stays money — and echo `name`, `price`.",
      hints: [
        "Key on id 8, not the name — names are for humans, ids are for queries.",
        "Shape: UPDATE products SET price = ROUND(price * 1.05, 2) WHERE id = 8 RETURNING name, price;",
      ],
      difficulty: "easy",
      solution: "UPDATE products\nSET price = ROUND(price * 1.05, 2)\nWHERE id = 8\nRETURNING name, price;",
      mistakes: [
        { test: "price\\s*\\*\\s*1\\.05(?!,\\s*2\\s*\\))", message: "Missing ROUND — 39.99 × 1.05 lands at 41.9895… in floating point, and the grader's expected price is the clean 41.99. Wrap the arithmetic in ROUND(expr, 2)." },
        { test: "0\\.95|\\*\\s*5\\b", message: "Wrong arithmetic — a 5% markup multiplies by 1.05. Times 0.95 is a discount; times 5 is a quintuple." },
        { test: "where\\s+name", message: "The name has a quote in it — Ring Light 14\" — which makes it fragile match text. Product id 8 is the stable key." },
      ],
      mutating: true,
      expected: EXPECTED["l42-p5"],
    },
    {
      id: "l42-p6",
      title: "Fleet shipment day",
      brief: "The courier arrives: every **pending** order ships today (**2026-01-06**). Move all of them in one statement — `status` to **'shipped'**, `shipped_at` to the date — echoing `id` for each. Fourteen orders should answer.",
      hints: [
        "Two comma-separated assignments; one WHERE that names the status to move.",
        "Shape: UPDATE orders SET status = 'shipped', shipped_at = '2026-01-06' WHERE status = 'pending' RETURNING id;",
      ],
      difficulty: "medium",
      solution: "UPDATE orders\nSET status = 'shipped',\n    shipped_at = '2026-01-06'\nWHERE status = 'pending'\nRETURNING id;",
      mistakes: [
        { test: "set\\s+status\\s*=\\s*'shipped'\\s*;", message: "The sweep ran but shipped_at never moved — a shipped order without a ship date is exactly the hole lesson 4's COALESCE was papering over. Assign both fields in the comma list." },
        { test: "status\\s*=\\s*'pending'\\s*;|set\\s+status\\s*=\\s*'pending'", message: "Backwards — pending is the BEFORE state. The SET writes the new value ('shipped'); the WHERE selects the old one." },
        { test: "where\\s+shipped_at\\s+is\\s+null", message: "Too wide — cancelled orders also have NULL shipped_at, and they must not 'ship'. The pending status is the courier's actual manifest." },
      ],
      mutating: true,
      expected: EXPECTED["l42-p6"],
    },
    {
      id: "l42-p7",
      title: "Freeze the dormant accounts",
      brief: "Risk policy: every order belonging to an **inactive** customer moves to **'cancelled'**. Use `WHERE customer_id IN (SELECT …)` over the customers table — six orders should feel it. Echo `id`.",
      hints: [
        "The subquery freezes first: SELECT id FROM customers WHERE active = 0 → {4, 11}.",
        "Shape: UPDATE orders SET status = 'cancelled' WHERE customer_id IN (SELECT id FROM customers WHERE active = 0) RETURNING id;",
      ],
      difficulty: "medium",
      solution: "UPDATE orders\nSET status = 'cancelled'\nWHERE customer_id IN (SELECT id FROM customers WHERE active = 0)\nRETURNING id;",
      mistakes: [
        { test: "active\\s*=\\s*1", message: "Inverted flag — active customers are the living business; the freeze targets active = 0, Dmitri Volkov and Keiko Sato." },
        { test: "\\bjoin\\b", message: "UPDATE takes no JOIN — the subquery in the WHERE is how a write reaches across tables. Same set logic as the lesson-13 anti-join, now as a filter." },
        { test: "\\bdelete\\b", message: "The ticket freezes, not purges — cancelled is the storefront's own soft-delete status (lesson 43's whole story). DELETE would hit the FK fence anyway." },
      ],
      mutating: true,
      expected: EXPECTED["l42-p7"],
    },
    {
      id: "l42-p8",
      title: "Measure the sweep before it runs",
      brief: "Before the fleet shipment (problem 6), a careful operator previews its width with a read: count the orders whose status is **'pending'** as `n`. The number that comes back is the affected count the UPDATE will report.",
      hints: [
        "A plain SELECT COUNT(*) with the same WHERE the UPDATE will use — that symmetry IS the read-before-write discipline.",
        "Shape: SELECT COUNT(*) AS n FROM orders WHERE status = 'pending';",
      ],
      difficulty: "easy",
      solution: "SELECT COUNT(*) AS n\nFROM orders\nWHERE status = 'pending';",
      mistakes: [
        { test: "status\\s*=\\s*'shipped'", message: "That counts yesterday's shipments (30) — the preview must mirror the UPDATE's exact WHERE: status = 'pending', the rows about to move." },
        { test: "update\\s+orders", message: "The preview is a read — SELECT only. Running the write to 'see what happens' is the anti-pattern this lesson exists to retire." },
        { test: "sum\\s*\\(\\s*total", message: "Width, not value — the count of rows (14), not their dollar sum. The affected count is row-based." },
      ],
      expected: EXPECTED["l42-p8"],
    },
  ],
  takeaway: "UPDATE = assignments over a filtered scan: expressions read the row's old values, CASE branches per row, UPDATE … FROM pulls companion data from other tables — and the affected count is your first line of defense.",
};
