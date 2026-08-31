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
  ],
  takeaway: "LEFT JOIN keeps every left row and NULL-fills the right side when no match exists — and conditions on the right table belong in ON when the unmatched rows must survive, because in WHERE they silently collapse the LEFT JOIN back into an INNER JOIN.",
};
