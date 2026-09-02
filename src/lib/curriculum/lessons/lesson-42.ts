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
      expected: EXPECTED["l42-p4"],
    },
  ],
  takeaway: "UPDATE = assignments over a filtered scan: expressions read the row's old values, CASE branches per row, UPDATE … FROM pulls companion data from other tables — and the affected count is your first line of defense.",
};
