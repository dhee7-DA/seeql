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
    { kind: "h", text: "The subtle part: WHERE vs ON" },
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
    },
  ],
  problems: [
    {
      id: "l12-p1",
      title: "The whole book, gaps and all",
      brief: "Every customer with every order they've placed — as a LEFT JOIN, not an INNER. Output: `name`, `order_id` (alias o.id exactly), `total`, ordered by customer name, then order id. On this store everyone has ordered, so the row count should match the INNER version — but write it defensively anyway.",
      hint: "FROM customers c LEFT JOIN orders o ON o.customer_id = c.id, ORDER BY c.name, o.id.",
      difficulty: "easy",
      solution:
        "SELECT c.name, o.id AS order_id, o.total\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nORDER BY c.name, o.id;",
      expected: EXPECTED["l12-p1"],
      ordered: true,
    },
    {
      id: "l12-p2",
      title: "Nothing has shipped",
      brief: "Customers whose orders have **never** reached 'shipped' status. Output: `name`, ordered by name. The shipped-status condition goes in the ON clause; the no-match test goes in WHERE.",
      hint: "LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped', then WHERE o.id IS NULL.",
      difficulty: "easy",
      solution:
        "SELECT c.name\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status = 'shipped'\nWHERE o.id IS NULL\nORDER BY c.name;",
      expected: EXPECTED["l12-p2"],
      ordered: true,
    },
    {
      id: "l12-p3",
      title: "The clean sheet",
      brief: "Some customers have had an order cancelled; others have a spotless record. List every customer with the ids of their **cancelled** orders — customers with none should still appear, with NULL in the order column. Output: `name`, `cancelled_id` (alias o.id exactly), ordered by name, then id.",
      hint: "LEFT JOIN with o.status = 'cancelled' inside the ON. Alias o.id AS cancelled_id.",
      difficulty: "medium",
      solution:
        "SELECT c.name, o.id AS cancelled_id\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status = 'cancelled'\nORDER BY c.name, o.id;",
      expected: EXPECTED["l12-p3"],
      ordered: true,
    },
    {
      id: "l12-p4",
      title: "Who is waiting, named",
      brief: "The store has 21 open orders — pending or cancelled, nothing shipped yet. Put customer names on them. Output: `name`, `order_id` (alias o.id exactly), `status`, ordered by customer name, then order id. Here every surviving row does have a match, so an INNER JOIN would give the same rows — but the LEFT form documents intent.",
      hint: "LEFT JOIN orders o ON o.customer_id = c.id, then WHERE o.status IN ('pending', 'cancelled').",
      difficulty: "medium",
      solution:
        "SELECT c.name, o.id AS order_id, o.status\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.status IN ('pending', 'cancelled')\nORDER BY c.name, o.id;",
      expected: EXPECTED["l12-p4"],
      ordered: true,
    },
  ],
};
