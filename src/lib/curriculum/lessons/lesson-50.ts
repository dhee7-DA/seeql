import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson50: Lesson = {
  id: "lesson-50",
  num: 50,
  title: "Case study — the data-fix ticket",
  blurb: "Module 7's write toolkit under one incident: assess the damage, insert the missing product, repair the price feed, purge the test lines and reconcile stock — all sandboxed",
  minutes: 15,
  blocks: [
    {
      kind: "p",
      text: "Tuesday, 08:14. The overnight importer had a bad night: it skipped one new product, wrote **wrong prices** into the Wearables category from a stale feed, and its retry loop logged a batch of **test orders as cancelled** — their line items still cluttering the tables. The ticket lands in your queue with five line items and one rule: *read before you write, write before you report.* Every step below runs sandboxed — execute with confidence, the store resets after each run.",
    },
    {
      kind: "table",
      headers: ["The ticket line", "The verb"],
      rows: [
        ["Assess the damage: order census by status", "SELECT (read first, always)"],
        ["Add the missing Streaming Mic Arm", "INSERT + RETURNING"],
        ["Repair the Wearables price feed", "UPDATE with CASE"],
        ["Purge the cancelled orders' line items", "DELETE via subquery"],
        ["Reconcile the mouse stock from the feed", "UPSERT with excluded"],
      ],
      caption: "One incident, all four write verbs — plus the read that proves you understood the problem before touching anything",
    },
    { kind: "diagram", figure: "d50-fix-ticket" },
    {
      kind: "tip",
      text: "Incident discipline is the real syllabus here: the census (task 1) is not filler — it's how you'll KNOW the fix worked. The numbers it prints (52 delivered, 30 shipped, 14 pending, 7 cancelled) are the 'before' picture; the write steps change it on purpose. In production you'd re-run the census after committing, inside one transaction.",
    },
    {
      kind: "p",
      text: "The debrief: a data-fix ticket is where the write verbs meet professional paranoia. Every mutation in this brief ran inside a transaction that could be rolled back — and that is not a testing convenience, it is the production pattern: BEGIN, preview with the SELECT twin of the WHERE, apply the UPDATE or UPSERT, verify changes() against the expected count, then COMMIT or ROLLBACK on any surprise. The ticket's subtle lesson is ordering: fix the child rows before the parents change their keys, stage the dedupe before the FK gets enforced, and never let a DELETE see data your SELECT hasn't previewed. Speed is nothing here; the audit trail is everything — a fix that can't show its work is a rumor, not a repair.",
    },
  ],
  mcqs: [
    {
      id: "l50-q1",
      prompt: "Why does the ticket start with a read (the census) instead of jumping straight to the fixes?",
      choices: [
        "Reads are faster than writes",
        "You need the 'before' picture — scope the damage and have a baseline to verify the fixes against",
        "SQLite refuses writes before a SELECT",
        "The census generates the fix SQL automatically",
      ],
      answer: 1,
      why: "Write discipline begins with a SELECT: the census sizes the damage (7 cancelled orders, their line items) and becomes the verification baseline. Fix-first-by-accident is how incidents grow a second incident.",
      notes: [
        { choice: 2, why: "Nothing stops a write-first session — that's exactly the danger. The read-first rule is professional habit, not engine law." },
      ],
    },
    {
      id: "l50-q2",
      prompt: "Purging the cancelled orders' line items (task 4) — why delete the ITEMS and leave the orders for a later ticket?",
      choices: [
        "order_items rows are smaller, so deleting them is faster",
        "The FK fence: order_items references orders — the child rows can go anytime, the parent orders can't while children exist",
        "Cancelled orders must never be deleted by policy AND structure — items first is the only single-statement move",
        "It doesn't matter — both tables delete the same",
      ],
      answer: 2,
      why: "Lesson 43's fence, live: order_items is a leaf (nothing references it), so its rows delete freely. Deleting the orders themselves would fail while 12 line items still point at them — children before parents.",
      notes: [
        { choice: 3, why: "Try `DELETE FROM orders WHERE status = 'cancelled'` in the sandbox and read the error — FOREIGN KEY constraint failed. The fence decides the order of operations." },
      ],
    },
    {
      id: "l50-q3",
      prompt: "Task 3 must set Fitness Band X2 to 84.00 and Smart Watch S to 209.99 — different values, one statement. Which shape is right?",
      choices: [
        "Two UPDATE statements — CASE can't assign different values",
        "CASE inside SET: SET price = CASE name WHEN 'Fitness Band X2' THEN 84.0 WHEN 'Smart Watch S' THEN 209.99 END",
        "One UPDATE with price = 84.0, then trust the engine",
        "INSERT the two prices as new rows",
      ],
      answer: 1,
      why: "Lesson 42's CASE-in-SET: each row takes its own branch of the same assignment. One statement, one scan, per-row values — and a WHERE pinning it to the Wearables category.",
      notes: [
        { choice: 0, why: "Two statements work but double the blast radius — if the second fails you've half-fixed the feed. One statement is one unit of reasoning (and in production, one transaction by default)." },
      ],
    },
    {
      id: "l50-q4",
      prompt: "Task 5's UPSERT uses `SET stock = stock + excluded.stock`. What does the run land on if the feed payload says 40 and the shelf currently holds 300?",
      choices: [
        "40 — excluded replaces the shelf",
        "300 — the collision means ignore",
        "340 — old stock plus the payload's delta",
        "An error — you can't mix both sides",
      ],
      answer: 2,
      why: "That's the feed-replay contract from lesson 44: bare `stock` reads the existing row (300), `excluded.stock` is the candidate payload (40), the sum 340 lands. The two names are the whole vocabulary of upsert arithmetic.",
      notes: [
        { choice: 0, why: "Replacement is `SET stock = excluded.stock` — a different contract. This ticket's reconciliation ADDS the feed delta, it doesn't trust it wholesale." },
      ],
    },
  ],
  problems: [
    {
      id: "l50-p1",
      title: "Assess the damage",
      brief: "The census, verbatim: per order status, `COUNT(*) AS n` and `ROUND(SUM(total), 2) AS value`, most common first. Four rows — this is the baseline every later step answers to.",
      hints: [
        "GROUP BY status, ORDER BY the count descending — the read that earns the right to write.",
        "Shape: SELECT status, COUNT(*) AS n, ROUND(SUM(total), 2) AS value FROM orders GROUP BY status ORDER BY n DESC;",
      ],
      difficulty: "easy",
      solution: "SELECT status,\n       COUNT(*) AS n,\n       ROUND(SUM(total), 2) AS value\nFROM orders\nGROUP BY status\nORDER BY n DESC;",
      mistakes: [
        { test: "order by n asc|order by value desc", message: "The census reads most-common-first — n DESC. The 'before' picture is a fixed artifact; keep its shape so the after-picture compares cleanly." },
        { test: "\\bsum\\(n\\)|sum\\(count", message: "Aggregate once — n is already the count; SUM of counts is a different (and wrong) census. status, COUNT(*), SUM(total): three expressions, one group each." },
        { test: "\\bwhere\\b.*'cancelled'", message: "No filter yet — the census covers ALL four statuses; the cancelled slice matters because you can see it next to the healthy 82." },
      ],
      expected: EXPECTED["l50-p1"],
      ordered: true,
    },
    {
      id: "l50-p2",
      title: "Insert the missing product",
      brief: "The skipped launch: **Streaming Mic Arm**, category **Audio**, price **29.99**, stock **75**, supplier **5** (Alpine Audio). Insert it and echo `id`, `name` — the engine assigns the id.",
      hints: [
        "Every column except id, exactly like lesson 41's contract; RETURNING echoes the new row.",
        "Shape: INSERT INTO products (name, category, price, stock, supplier_id) VALUES ('Streaming Mic Arm', 'Audio', 29.99, 75, 5) RETURNING id, name;",
      ],
      difficulty: "easy",
      solution: "INSERT INTO products (name, category, price, stock, supplier_id)\nVALUES ('Streaming Mic Arm', 'Audio', 29.99, 75, 5)\nRETURNING id, name;",
      mistakes: [
        { test: "\\(id\\s*,|,\\s*id\\s*,", message: "Let the engine pick the id — the INTEGER PRIMARY KEY assigns 17 as max+1. Claiming ids by hand is how import scripts collide." },
        { test: "supplier_id\\s*,\\s*1\\s*\\)|,\\s*1\\s*\\)\\s*returning", message: "Wrong supplier — the arm ships from Alpine Audio GmbH, supplier 5 (the EU's 4.8-rated shop)." },
        { test: "category\\s*,\\s*'.*arm'|'accessories'|'electronics'", message: "The arm is Audio hardware — it belongs beside the headsets and mics, the 3-product / 315-stock category." },
      ],
      mutating: true,
      expected: EXPECTED["l50-p2"],
    },
    {
      id: "l50-p3",
      title: "Repair the Wearables feed",
      brief: "The stale feed underpriced the category. Set **Fitness Band X2 → 84.00** and **Smart Watch S → 209.99** in ONE statement — CASE inside SET, scoped to `category = 'Wearables'`. Echo `id`, `price`.",
      hints: [
        "SET price = CASE name WHEN … THEN … WHEN … THEN … END WHERE category = 'Wearables'.",
        "Shape: UPDATE products SET price = CASE name WHEN 'Fitness Band X2' THEN 84.0 WHEN 'Smart Watch S' THEN 209.99 END WHERE category = 'Wearables' RETURNING id, price;",
      ],
      difficulty: "medium",
      solution: "UPDATE products\nSET price = CASE name\n              WHEN 'Fitness Band X2' THEN 84.0\n              WHEN 'Smart Watch S'   THEN 209.99\n            END\nWHERE category = 'Wearables'\nRETURNING id, price;",
      mistakes: [
        { test: "when 'fitness band x2' then 79|then 86\\.9|\\* 1\\.1", message: "Those are the OLD prices (or the old hike's result) — the ticket restores the feed's intended 84.00 / 209.99, not the pre-incident state." },
        { test: "where name", message: "Filter by the category — `WHERE category = 'Wearables'` — and let CASE pick the per-row price. Filtering by name twice doubles the statement for nothing." },
        { test: "else price end", message: "A harmless ELSE here, but the guard lives in the WHERE: only Wearables rows are candidates, and both are named in the CASE. Missing WHENs would NULL them — that's the lesson-23 trap." },
      ],
      mutating: true,
      expected: EXPECTED["l50-p3"],
    },
    {
      id: "l50-p4",
      title: "Purge the test line items",
      brief: "Clear every **order_items** row whose order is cancelled — no RETURNING this time; the affected count (12) is the deliverable. The orders themselves stay parked for finance.",
      hints: [
        "The child-table delete from lesson 43, verbatim minus the RETURNING.",
        "Shape: DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status = 'cancelled');",
      ],
      difficulty: "medium",
      solution: "DELETE FROM order_items\nWHERE order_id IN (SELECT id FROM orders WHERE status = 'cancelled');",
      mistakes: [
        { test: "delete from orders", message: "The fence again — 12 line items still reference those orders; the parent delete fails until the children go. This ticket clears the children only." },
        { test: "\\bjoin\\b", message: "DELETE takes no JOIN — the cross-table scope rides on WHERE order_id IN (SELECT …). Same filter, legal grammar." },
        { test: "\\bupdate\\b", message: "The ticket says purge, not re-flag — these 12 lines are importer junk; UPDATE would leave them rotting in place." },
      ],
      mutating: true,
      expected: EXPECTED["l50-p4"],
    },
    {
      id: "l50-p5",
      title: "Reconcile the mouse stock",
      brief: "The warehouse counter says the feed is behind: apply today's delta for product **2 (Wireless Mouse M3)** as an upsert — payload `(2, 'Wireless Mouse M3', 'Electronics', 34.5, stock 40, supplier 2)`, and on conflict **add** the payload's stock to the shelf. Echo `id`, `stock` (expect 340).",
      hints: [
        "ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock — the lesson-44 delta contract.",
        "Shape: INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (2, …, 40, 2) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock RETURNING id, stock;",
      ],
      difficulty: "hard",
      solution: "INSERT INTO products (id, name, category, price, stock, supplier_id)\nVALUES (2, 'Wireless Mouse M3', 'Electronics', 34.5, 40, 2)\nON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock\nRETURNING id, stock;",
      mistakes: [
        { test: "set stock = excluded\\.stock(?!\\s*\\+)", message: "Replacement would DROP the shelf to 40 — reconciliation adds the delta: 300 + 40 = 340. Bare stock reads the old row, excluded reads the payload." },
        { test: "do nothing", message: "DO NOTHING discards today's count — the feed's 40 units are real stock that must land, and the collision means merge, not skip." },
        { test: "values \\( 17 ,|values \\( 99 ,", message: "Don't dodge the collision with a fresh id — product 2 exists and that's the point: the upsert branch must fire, not a new row." },
      ],
      mutating: true,
      expected: EXPECTED["l50-p5"],
    },
  ],
  takeaway: "An incident runs read → insert → update → delete → upsert in that order — baseline first, children before parents, deltas merged not trusted — and every write here was real, verified, and rolled back, which is the sandbox's whole gift.",
  deep: [
    {
      kind: "mind",
      text: "A case study is **requirements engineering in miniature**: the brief arrives in stakeholder language and your job is to translate it into the write verbs under transactional discipline — INSERT, UPDATE, UPSERT and the staged DELETE — preview before every write, reconcile changes() after, roll back on any surprise. The professional habit this trains: before any SQL, restate each ask as a shape (\"that's a filter\", \"that's a fold at month grain\", \"that's a preservation problem\") and name the grain of the promised output. Most wrong answers in real analyst work are not syntax errors; they are right answers to a slightly different question — the translation step is where they die. Work the brief top to bottom, reconcile every number you can against another (count vs sum, detail vs summary), and treat any mismatch as a finding, not a nuisance.",
    },
    {
      kind: "edge",
      items: [
        { c: "The ask behind the ask", r: "\"How many customers do we have?\" often means \"how many can we market to\" — the active flag, the region filter, the dedupe. Ask which population the stakeholder means; the SQL is easy once the noun is exact." },
        { c: "Empty results are findings", r: "A brief that expects holes may find none (this seed's anti-joins return zero rows). Report \"checked, none found\" with the query attached — silence in the result set is evidence too." },
        { c: "Grain mixing in one report", r: "Customer counts beside order sums in one table: stage each grain in its own CTE and join on the shared dimension. One query, two grains, no fan-out — the case studies quietly drill this every time." },
        { c: "The reproducibility test", r: "Hard-code the as-of date, avoid date('now'), and keep every number re-derivable from the seed. A founder-facing snapshot that can't be re-run and matched is a screenshot, not a report." },
      ],
    },  ],
};
