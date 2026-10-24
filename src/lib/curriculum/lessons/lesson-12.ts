import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson12: Lesson = {
  id: "lesson-12",
  num: 12,
  title: "LEFT JOIN — keep the left side",
  blurb: "When unmatched rows matter more than matches: preserving rows with NULL-filled gaps",
  minutes: 13,
  blocks: [
    {
      kind: "p",
      text: "INNER JOIN has a quiet failure mode: left rows without a partner vanish. Just as often, the unmatched row is the **interesting** one — a customer with no delivered order isn't noise to discard; they're who your support team should call. `LEFT JOIN` keeps **every row of the left table**, filling right-hand columns with `NULL` when no match exists.",
    },
    { kind: "h", text: "The syntax family" },
    {
      kind: "bullets",
      items: [
        "One word changes: `FROM customers c LEFT JOIN orders o ON o.customer_id = c.id` — the table named in `FROM` is the protected side.",
        "`RIGHT JOIN` protects the right side; `FULL OUTER JOIN` protects both (SQLite has supported them since 3.39). In practice LEFT covers almost every real query — you can always flip the tables to make the table you care about the left one.",
      ],
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "RIGHT JOIN and FULL OUTER JOIN are recent arrivals in SQLite — supported only since 3.39 (2022). Older builds and many bundled SQLite libraries still reject them outright, while LEFT JOIN works everywhere — one more reason to flip the tables and stay LEFT.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL understands RIGHT JOIN but has no FULL OUTER JOIN at all — protecting both sides there takes an emulation: a LEFT JOIN arm UNION ALL'd with a reversed LEFT JOIN + IS NULL arm. PostgreSQL has had FULL OUTER JOIN all along, SQLite since 3.39.",
    },
    { kind: "h", text: "The subtle part: WHERE vs ON" },
    { kind: "diagram", figure: "j12-where-vs-on" },
    {
      kind: "bullets",
      items: [
        "Inside `ON`, `o.status = 'delivered'` means *only match delivered orders — otherwise leave the customer unmatched*.",
        "Move it to `WHERE o.status = 'delivered'` and the NULL-filled rows fail that test and get thrown away — **silently turning your LEFT JOIN back into an INNER JOIN**.",
        "**Rule of thumb:** conditions on the *right* table of a LEFT JOIN belong in `ON` when you want unmatched rows preserved.",
      ],
    },
    { kind: "diagram", figure: "j4-left-join" },
    { kind: "diagram", figure: "j12-left-space-3d" },
    {
      kind: "code",
      caption: "Who is still waiting for a delivery?",
      sql: `SELECT c.name, o.id AS order_id, o.status
FROM customers c
LEFT JOIN orders o
       ON o.customer_id = c.id
      AND o.status = 'delivered'
WHERE o.id IS NULL
ORDER BY c.name;`,
    },
    {
      kind: "tip",
      text: "`o.id IS NULL` on the right table's primary key is the reliable signature of \"this left row never matched\" — primary keys are never NULL, so a NULL there can only mean no match. That pattern is big enough to get its own lesson (next up).",
    },
    { kind: "diagram", figure: "j12-gap-anatomy" },
  ],
  mcqs: [
    {
      id: "l12-q1",
      prompt: "In `A LEFT JOIN B`, which rows are guaranteed to survive?",
      choices: [
        "Every row of A, matched or not",
        "Every row of B, matched or not",
        "Every row of both tables",
        "Only the rows of A that match B",
      ],
      answer: 0,
      why: "LEFT JOIN protects its left side: all of A survives, with B's columns NULL-filled where no match exists.",
      notes: [
        { choice: 3, why: "That's INNER JOIN's contract — LEFT JOIN exists precisely to also keep the non-matching A rows, with NULL standing in for every missing B value." },
      ],
    },
    {
      id: "l12-q2",
      prompt: "A customer has no matching order under a LEFT JOIN. What do the order columns contain in their row?",
      choices: [
        "Empty strings",
        "Zeros",
        "NULL",
        "The row is omitted",
      ],
      answer: 2,
      why: "Unmatched left rows are kept with NULL in every right-hand column — that's the mechanism LEFT JOIN uses to preserve them.",
      notes: [
        { choice: 0, why: "An empty string is a real value — it tests equal to '' and participates in joins — so SQL marks the missing side with NULL, the absence of any value." },
      ],
    },
    {
      id: "l12-q3",
      prompt: "When does a LEFT JOIN return exactly the same rows as an INNER JOIN?",
      choices: [
        "When the right table is empty",
        "When every left row finds at least one match",
        "Never — LEFT JOIN always returns more rows",
        "When you also add an ORDER BY",
      ],
      answer: 1,
      why: "If there are no unmatched left rows, there's nothing extra to preserve. In this store, customers LEFT JOIN orders equals the INNER version — all 16 customers have ordered.",
      notes: [
        { choice: 2, why: "LEFT JOIN only adds rows when matches are missing — with every left row matched there is nothing extra to preserve, and the two joins agree row for row." },
      ],
    },
    {
      id: "l12-q4",
      prompt: "In `customers LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'`, why does the status condition sit in ON?",
      choices: [
        "It's just style — WHERE works identically",
        "So customers without delivered orders stay in the result (NULL-filled) instead of being filtered out",
        "Because ON runs faster than WHERE",
        "Because status belongs to customers",
      ],
      answer: 1,
      why: "Inside ON, the condition controls *matching*. In WHERE it controls *survival* — NULL rows would fail o.status = 'delivered' and the LEFT JOIN would collapse into an INNER JOIN.",
      notes: [
        { choice: 0, why: "Placement changes semantics here — WHERE runs on the NULL-filled rows too, they fail the status test and vanish, and the join silently degrades to an INNER JOIN." },
      ],
    },
    {
      id: "l12-q5",
      prompt: "On THIS store's seed: `FROM customers c LEFT JOIN orders o ON o.customer_id = c.id` — how many rows?",
      choices: ["16", "103", "119", "1648"],
      answer: 1,
      why: "LEFT JOIN returns one row per matching pair plus one NULL-filled row per unmatched customer. All 103 orders match, and on this seed every customer has placed at least one order — no gaps to preserve, so the result equals the INNER version: 103 rows.",
      notes: [
        { choice: 0, why: "Customers don't collapse to one row — each appears once per order they placed, LEFT or INNER alike. Preservation only ADDS rows for unmatched customers, and this seed has none." },
        { choice: 2, why: "LEFT JOIN doesn't append spare rows — unmatched left rows are kept in place with NULL-filled columns; here there are none, so nothing is added to 103." },
      ],
    },
    {
      id: "l12-q6",
      prompt: "After `customers LEFT JOIN orders ON … AND o.status = 'shipped'`, adding `WHERE o.id IS NULL` keeps…",
      choices: [
        "Every customer, matched or not",
        "Only the customers who DO have shipped orders",
        "Only the NULL-filled rows — customers with no shipped order at all (6 of them here)",
        "Only the orders that are not shipped",
      ],
      answer: 2,
      why: "o.id is the right table's primary key — never NULL on a matched row. So `o.id IS NULL` is true exactly for the gap rows the LEFT JOIN fabricated: the anti-join. Here that's the 6 customers with zero shipped orders.",
      notes: [
        { choice: 1, why: "Matched rows carry a real order id, so the IS NULL test is false for them — the filter keeps the opposite set, the gaps." },
      ],
    },
    {
      id: "l12-q7",
      prompt: "Matching only shipped orders in ON yields 36 rows (30 matched pairs + 6 gap customers). Move `o.status = 'shipped'` to WHERE — how many rows now?",
      choices: [
        "36 — unchanged",
        "30 — the gaps vanish and the join silently turns INNER",
        "6 — only the gaps remain",
        "46 — gaps plus shipped",
      ],
      answer: 1,
      why: "WHERE runs after the join and sees the NULL-filled rows too — NULL fails the status test, so the 6 gap customers are deleted and the 30 matched pairs remain. That's the WHERE-turns-LEFT-into-INNER collapse.",
      notes: [
        { choice: 2, why: "6 is the anti-join count (the IS NULL spelling) — a status equality in WHERE doesn't select the gaps, it kills them: NULL = 'shipped' is not true." },
      ],
    },
    {
      id: "l12-q8",
      prompt: "`FROM orders o LEFT JOIN customers c ON c.id = o.customer_id` — whose rows are guaranteed to survive?",
      choices: [
        "All 16 customers",
        "All 103 orders",
        "Only orders whose customer exists",
        "All 1648 pairs",
      ],
      answer: 1,
      why: "The protected side is whatever FROM names — here orders. Every order keeps its row even with no matching customer (customer columns NULL-filled). On this seed every order does have a buyer, so no NULLs appear — but the guarantee is about orders, not customers.",
      notes: [
        { choice: 0, why: "customers sits on the RIGHT side — right rows without a partner are dropped, not preserved. Protection follows position: FROM is the left, protected side." },
      ],
    },
  ],
  problems: [
    {
      id: "l12-p1",
      title: "The whole book, gaps and all",
      brief: "Every customer with every order they've placed — as a LEFT JOIN, not an INNER. Output: `name`, `order_id` (alias o.id exactly), `total`, ordered by customer name, then order id. On this store everyone has ordered, so the row count should match the INNER version — but write it defensively anyway.",
      hints: [
        "One word changes from the INNER version — LEFT JOIN protects every customer row. Alias o.id and sort by customer name, then order id.",
        "Shape: SELECT c.name, o.id AS order_id, o.total FROM customers c LEFT JOIN orders o ON o.customer_id = c.id ORDER BY c.name, o.id;",
      ],
      difficulty: "easy",
      solution:
        "SELECT c.name, o.id AS order_id, o.total\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nORDER BY c.name, o.id;",
      mistakes: [
        { test: "\\bright\\s+join\\b", message: "RIGHT JOIN would protect orders, not customers — with the tables written this way, the LEFT side is the one the brief wants preserved." },
        { test: "^select\\b(?=[^;]*\\bo\\.id\\b)(?![^;]*\\bo\\.id\\s+as\\s+order_id\\b)", message: "The order-id column must be headed `order_id` — alias it: o.id AS order_id (o.id and customers.id would otherwise both claim \"id\")." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The brief grades the sort: ORDER BY c.name, o.id — customer name first, then order id within each customer." },
      ],
      expected: EXPECTED["l12-p1"],
      ordered: true,
    },
    {
      id: "l12-p2",
      title: "Nothing has shipped",
      brief: "Customers whose orders have **never** reached 'shipped' status. Output: `name`, ordered by name. The shipped-status condition goes in the ON clause; the no-match test goes in WHERE.",
      hints: [
        "Attach only each customer's shipped orders — the status condition inside ON — then keep the customers where nothing attached with WHERE o.id IS NULL.",
        "Shape: SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = <status> WHERE o.id IS NULL ORDER BY <col>;",
      ],
      difficulty: "easy",
      solution:
        "SELECT c.name\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status = 'shipped'\nWHERE o.id IS NULL\nORDER BY c.name;",
      mistakes: [
        { test: "\\binner join\\b", message: "An INNER JOIN keeps only customers who DO have a shipped order — the opposite of the ask. LEFT JOIN keeps everyone, NULL-filling the ones with no shipped order so your IS NULL test can find them." },
        { test: "\\bleft join\\b[^;]*\\bwhere\\b[^;]*\\bo\\.status\\s*=", message: "The status filter belongs inside ON: in WHERE it deletes the NULL-filled rows before `o.id IS NULL` can find them, and the query returns nothing." },
        { test: "\\bleft join\\b(?![^;]*\\bis\\s+null\\b)", message: "A LEFT JOIN alone still returns every customer, matched or not — the brief's \"never shipped\" test needs the final WHERE o.id IS NULL to keep only the gaps." },
      ],
      expected: EXPECTED["l12-p2"],
      ordered: true,
    },
    {
      id: "l12-p3",
      title: "The clean sheet",
      brief: "Some customers have had an order cancelled; others have a spotless record. List every customer with the ids of their **cancelled** orders — customers with none should still appear, with NULL in the order column. Output: `name`, `cancelled_id` (alias o.id exactly), ordered by name, then id.",
      hints: [
        "A LEFT JOIN with a matching condition: cancelled orders attach, spotless customers stay with NULL — and no IS NULL filter this time, because the gaps themselves are the output.",
        "Shape: SELECT c.name, o.id AS cancelled_id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = <status> ORDER BY c.name, o.id;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.name, o.id AS cancelled_id\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status = 'cancelled'\nORDER BY c.name, o.id;",
      mistakes: [
        { test: "\\bleft join\\b[^;]*\\bwhere\\b[^;]*\\bo\\.status\\s*=", message: "Putting the cancelled filter in WHERE throws away every NULL-filled customer — the spotless ones the brief wants to keep. The status belongs inside ON." },
        { test: "status\\s*=\\s*'(?!cancelled')[^']*'", message: "This sheet tracks cancelled orders — the ON condition should read o.status = 'cancelled'." },
        { test: "\\bwhere\\b[^;]*\\bis\\s+null\\b", message: "Careful — that's the anti-join from the last problem, which keeps ONLY the gaps. Here every customer stays, with their cancelled ids attached: no IS NULL filter." },
      ],
      expected: EXPECTED["l12-p3"],
      ordered: true,
    },
    {
      id: "l12-p4",
      title: "Who is waiting, named",
      brief: "The store has 21 open orders — pending or cancelled, nothing shipped yet. Put customer names on them. Output: `name`, `order_id` (alias o.id exactly), `status`, ordered by customer name, then order id. Here every surviving row does have a match, so an INNER JOIN would give the same rows — but the LEFT form documents intent.",
      hints: [
        "Every survivor here does have a match, so filtering in WHERE is correct this time — keep the pending and cancelled orders with IN, then put names on them.",
        "Shape: SELECT c.name, o.id AS order_id, o.status FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status IN (<statuses>) ORDER BY c.name, o.id;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.name, o.id AS order_id, o.status\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.status IN ('pending', 'cancelled')\nORDER BY c.name, o.id;",
      mistakes: [
        { test: "\\bon\\b(?![^;]*\\bwhere\\b)[^;]*\\bo\\.status\\s+in\\b", message: "Inside ON, the status list decides which orders MATCH — every other order would come back NULL-filled. Here you're filtering matched rows, so the IN belongs in WHERE." },
        { test: "\\bo\\.status\\s*=\\s*'(?:pending|cancelled)'", message: "One status alone is only half the open book — the brief wants both, via o.status IN ('pending', 'cancelled')." },
        { test: "^select\\b(?=[^;]*\\bo\\.id\\b)(?![^;]*\\bo\\.id\\s+as\\s+order_id\\b)", message: "The order-id column must be headed `order_id` — alias it: o.id AS order_id." },
      ],
      expected: EXPECTED["l12-p4"],
      ordered: true,
    },
    {
      id: "l12-p5",
      title: "The audit that found nothing",
      brief: "Run the store's integrity audit: count customers pointing at no order at all (`customer_gaps`) and order lines pointing at no product (`item_gaps`) — two gap counters in ONE row. Output: `customer_gaps`, `item_gaps`. A zero is the finding: it certifies the seed has no orphans.",
      hints: [
        "Each counter is the anti-join pattern wrapped in COUNT(*): LEFT JOIN across the foreign key, keep only the unmatched rows with WHERE … IS NULL — one scalar subquery per counter.",
        "Shape: SELECT (SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON … WHERE o.id IS NULL) AS customer_gaps, (SELECT COUNT(*) FROM order_items oi LEFT JOIN products p ON … WHERE p.id IS NULL) AS item_gaps;",
      ],
      difficulty: "medium",
      solution:
        "SELECT\n  (SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL) AS customer_gaps,\n  (SELECT COUNT(*) FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE p.id IS NULL) AS item_gaps;",
      mistakes: [
        { test: "\\binner\\s+join\\b", message: "An INNER JOIN drops the very rows you're auditing for — it reports 0 even on a dirty database. LEFT JOIN keeps unmatched rows with NULL so the IS NULL test can count them." },
        { test: "\\bleft\\s+join\\b(?![^;]*\\bis\\s+null\\b)", message: "A LEFT JOIN alone counts every customer (16), gaps or not — the `WHERE o.id IS NULL` test is what isolates the unmatched rows before counting." },
        { test: "\\bon\\s+(?:c\\.id\\s*=\\s*o\\.id\\b|o\\.id\\s*=\\s*c\\.id\\b|p\\.id\\s*=\\s*oi\\.id\\b|oi\\.id\\s*=\\s*p\\.id\\b)", message: "That pairs primary keys against each other — audit the real foreign keys: orders.customer_id → customers.id and order_items.product_id → products.id." },
      ],
      expected: EXPECTED["l12-p5"],
    },
    {
      id: "l12-p6",
      title: "The shipped dossier",
      brief: "Every customer with the ids of their **shipped** orders — and the customers with no shipped order still make the list, order_id NULL. The status condition belongs in ON; the gaps are part of the output. Output: `name`, `order_id` (alias o.id exactly), ordered by name, then order id. 36 rows: 30 shipped orders plus 6 NULL-filled names.",
      hints: [
        "Same skeleton as the clean-sheet problem: the status filter rides in ON (matching), not WHERE (survival) — customers with no shipped order stay as NULL rows.",
        "Shape: SELECT c.name, o.id AS order_id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = <status> ORDER BY c.name, o.id;",
      ],
      difficulty: "hard",
      solution:
        "SELECT c.name, o.id AS order_id\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status = 'shipped'\nORDER BY c.name, o.id;",
      mistakes: [
        { test: "\\bleft\\s+join\\b[^;]*\\bwhere\\b[^;]*\\bo\\.status\\s*=", message: "The shipped filter in WHERE deletes every NULL-filled customer — the 6 names the brief wants kept. The status belongs inside ON." },
        { test: "\\binner\\s+join\\b", message: "An INNER JOIN silently drops the customers with no shipped order — exactly the gaps the brief keeps with NULL." },
        { test: "^select\\b(?=[^;]*\\bo\\.id\\b)(?![^;]*\\bo\\.id\\s+as\\s+order_id\\b)", message: "The order-id column must be headed `order_id` — alias it: o.id AS order_id." },
      ],
      expected: EXPECTED["l12-p6"],
      ordered: true,
    },
    {
      id: "l12-p7",
      title: "Pending proof",
      brief: "The pending edition: every customer with the ids of their **pending** orders, gaps kept — customers with nothing pending show NULL. Output: `name`, `order_id` (alias o.id exactly), ordered by name, then order id. 22 rows: 14 pending orders plus 8 names with nothing to chase.",
      hints: [
        "Identical skeleton to the shipped dossier — one literal changes. Status in ON, so the 8 no-pending customers survive as NULL rows.",
        "Shape: SELECT c.name, o.id AS order_id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = <status> ORDER BY c.name, o.id;",
      ],
      difficulty: "hard",
      solution:
        "SELECT c.name, o.id AS order_id\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status = 'pending'\nORDER BY c.name, o.id;",
      mistakes: [
        { test: "\\bleft\\s+join\\b[^;]*\\bwhere\\b[^;]*\\bo\\.status\\s*=", message: "The pending filter in WHERE throws away every NULL-filled customer — the 8 names the brief keeps. The status belongs inside ON." },
        { test: "status\\s*=\\s*'(?!pending')[^']*'", message: "This dossier tracks pending orders — the ON condition should read o.status = 'pending'." },
        { test: "\\bwhere\\b[^;]*\\bis\\s+null\\b", message: "Careful — that's the anti-join, which keeps ONLY the gaps. Here every customer stays, pending ids attached and gaps NULL-filled: no IS NULL filter." },
      ],
      expected: EXPECTED["l12-p7"],
      ordered: true,
    },
    {
      id: "l12-p8",
      title: "Two-key keeping",
      brief: "Every customer with their big-basket orders — totals over 800 — gaps kept: customers with no such order show NULL in both order columns. Output: `name`, `order_id` (alias o.id exactly), `total`, ordered by name, then order id. 16 rows: 4 big orders plus 12 NULL-filled names. The >800 filter is on the right table — ON is where it keeps the gaps alive.",
      hints: [
        "Two matching conditions now: the foreign key AND the total filter, both inside ON — in WHERE the test would delete the 12 gap customers instead of preserving them.",
        "Shape: SELECT c.name, o.id AS order_id, o.total FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.total > <amount> ORDER BY c.name, o.id;",
      ],
      difficulty: "hard",
      solution:
        "SELECT c.name, o.id AS order_id, o.total\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.total > 800\nORDER BY c.name, o.id;",
      mistakes: [
        { test: "\\bleft\\s+join\\b[^;]*\\bwhere\\b[^;]*\\bo\\.total\\s*>", message: "The >800 filter in WHERE deletes every NULL-filled customer — the 12 names the brief keeps. Conditions on the right table belong in ON." },
        { test: "\\bo\\.total\\s*>\\s*(?!800\\b)\\d+", message: "The brief pins the basket size: o.total > 800." },
        { test: "^select\\b(?=[^;]*\\bo\\.id\\b)(?![^;]*\\bo\\.id\\s+as\\s+order_id\\b)", message: "The order-id column must be headed `order_id` — alias it: o.id AS order_id." },
      ],
      expected: EXPECTED["l12-p8"],
      ordered: true,
    },
  ],
  takeaway: "LEFT JOIN keeps every left row and NULL-fills the right side when no match exists — and conditions on the right table belong in ON when the unmatched rows must survive, because in WHERE they silently collapse the LEFT JOIN back into an INNER JOIN.",
  deep: [
    {
      kind: "mind",
      text: "LEFT JOIN is a **preservation contract**: every row of the left table appears, matched or not — unmatched left rows survive with NULL filling every right-table column. The mental flip from INNER: the left table is the *population you are studying*, the right table is *evidence you're attaching*. Flipping the tables flips the study. In this seed orders LEFT JOIN shipments-style checks surface naturally: 21 orders have shipped_at IS NULL, and NULL-shipped rows are exactly the ones an INNER JOIN on a shipment table would have erased. LEFT JOIN turns \"show me the matches\" into \"show me the population, and let absence be visible as NULL.\"",
    },
    {
      kind: "engine",
      title: "you run SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id",
      steps: [
        "**Left pass** — all 16 customers are queued first; they are the contract. RIGHT side rows are only retrieved on demand.",
        "**Match or pad** — each customer either finds its orders (24 for customer 1) or, finding none, emits ONE row with o.* all NULL. Unmatched left rows are never dropped — they are padded.",
        "**Count check** — the result has ≥ 103 rows (one per matching pair) plus one pad row per zero-match customer. In this seed: exactly 103, since every customer has orders — run the LEFT JOIN and the count proves the preservation.",
        "**NULL meaning** — a NULL in o.id now carries information: \"this customer has no orders\". The NULL is the answer, not a defect.",
      ],
    },
    {
      kind: "myth",
      myth: "\"LEFT JOIN is the safe join — I'll use it everywhere and lose nothing.\"",
      truth: "LEFT JOIN trades drop-risk for **NULL-risk**: every right-side column can now be NULL, and any downstream expression (SUM of NULLs, comparisons, counts) must be NULL-aware. INNER drops rows; LEFT drops certainty. Choose per question, not per fear.",
    },
    {
      kind: "edge",
      items: [
        { c: "WHERE on the right table's column", r: "WHERE o.status = 'delivered' silently demotes the LEFT JOIN to INNER: pad rows have NULL status, NULL = 'delivered' is not true, and the preserved customer vanishes. The test belongs in the ON clause." },
        { c: "COUNT(*) vs COUNT(right column)", r: "After a LEFT JOIN, COUNT(*) counts pad rows (a customer with no orders counts as 1) but COUNT(o.id) counts matches only (0). The pair is the honest way to show both population and coverage." },
        { c: "Chained LEFT JOINs", r: "Each hop's preservation is independent; a later INNER JOIN or a WHERE on any right column can retroactively kill earlier pads. Audit the whole chain, not the first hop." },
        { c: "LEFT JOIN where the right side is unique", r: "If the right table's key is unique, LEFT JOIN behaves like a lookup: 103 orders each find ≤ 1 invoice row, fan-out impossible. Preservation still applies; multiplication can't." },
      ],
    },  ],
};
