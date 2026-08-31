import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson13: Lesson = {
  id: "lesson-13",
  num: 13,
  title: "Anti-join: finding the holes",
  blurb: "The LEFT JOIN + IS NULL pattern that answers every 'who never…?' question",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "Analysts are asked negative questions constantly: which customers *never* came back, which products *never* sold, which accounts *never* verified their email. There is no `NOT MATCHED` keyword — you build the answer from three pieces you already own. The combo is called an **anti-join**, one of the most reused patterns in production SQL.",
    },
    { kind: "h", text: "The three pieces" },
    {
      kind: "steps",
      items: [
        "**LEFT JOIN** with the qualifying condition *inside `ON`* — customers without a match survive, NULL-filled (lesson 12).",
        "**`WHERE o.id IS NULL`** — keep only those NULL-filled survivors.",
        "**Why it's airtight:** primary keys are never NULL, so a NULL `o.id` can mean exactly one thing — the customer never matched. Everyone else had real delivered orders with real, non-NULL ids.",
      ],
    },
    { kind: "diagram", figure: "j5-anti-join" },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL has no FULL OUTER JOIN at all — this lesson's toolkit is the standard way to emulate one: a LEFT JOIN arm for the left side, then a second arm that keeps right-side rows via LEFT JOIN + IS NULL, glued together with UNION ALL.",
    },
    { kind: "h", text: "When the test spans two hops" },
    {
      kind: "bullets",
      items: [
        "Products that never appeared in a *pending order* need a hop through items → orders **before** the match — more than one hop, impossible to express in a single `ON` clause.",
        "**Filter first, join second:** build the filtered list in a subquery (a complete SELECT in parentheses), give it a nickname, and LEFT JOIN against that.",
        "The subquery runs first, becomes a tidy virtual table, and your anti-join stays single-hop.",
      ],
    },
    {
      kind: "code",
      caption: "Anti-join against a pre-filtered list",
      sql: `SELECT p.name
FROM products p
LEFT JOIN (
  SELECT DISTINCT oi.product_id
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status = 'pending'
) pend ON pend.product_id = p.id
WHERE pend.product_id IS NULL
ORDER BY p.name;`,
    },
    {
      kind: "warn",
      text: "You may meet `NOT IN (SELECT …)` as an alternative. It has a famous trap: if the subquery returns even one NULL, NOT IN returns *nothing at all*. LEFT JOIN + IS NULL has no such failure mode — prefer it.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "PostgreSQL's planner recognizes the same question spelled as `NOT EXISTS` and labels the step an anti-join in EXPLAIN (e.g. `Hash Anti Join`) — same intent, different costume. The LEFT JOIN + IS NULL shape asks it with pieces you already own.",
    },
  ],
  mcqs: [
    {
      id: "l13-q1",
      prompt: "Why is `WHERE o.id IS NULL` a safe test for \"no match\"?",
      choices: [
        "id is always the first column",
        "Primary keys are never NULL, so a NULL there can only mean the row never matched",
        "NULL means zero, which is the count of matches",
        "It isn't safe — you should check every right-hand column",
      ],
      answer: 1,
      why: "Real matches carry the right table's actual primary key — never NULL. So o.id IS NULL identifies precisely the rows the LEFT JOIN NULL-filled: the non-matches.",
      notes: [
        { choice: 0, why: "Column position is irrelevant — the safety comes from the primary-key guarantee that real matches never carry a NULL id, wherever that column sits in the table." },
      ],
    },
    {
      id: "l13-q2",
      prompt: "In an anti-join, where does the right table's condition (like status = 'shipped') belong?",
      choices: [
        "In WHERE, next to IS NULL",
        "Inside the ON clause",
        "In HAVING",
        "Anti-joins can't filter the right table",
      ],
      answer: 1,
      why: "In ON it shapes the match ('only shipped orders count as a match'). In WHERE it would discard the NULL-filled rows — silently converting the anti-join into an ordinary INNER JOIN and returning nothing.",
      notes: [
        { choice: 0, why: "A right-table filter in WHERE can never be true for NULL-filled rows, so it deletes exactly the unmatched customers the anti-join is trying to keep." },
      ],
    },
    {
      id: "l13-q3",
      prompt: "What does the subquery-in-FROM trick (filter first, join second) buy you?",
      choices: [
        "It makes the database cache the result permanently",
        "Two-hop 'never' questions become a single-hop anti-join against a tidy virtual table",
        "It replaces the need for LEFT JOIN",
        "It avoids ambiguity errors",
      ],
      answer: 1,
      why: "The subquery pre-computes the filtered list; the outer query then does a simple single-hop LEFT JOIN + IS NULL against it. Clean to write, easy to read, no cross-hop ON contortions.",
      notes: [
        { choice: 3, why: "Ambiguity is a column-naming problem solved by qualified references — the subquery here exists to pre-shape a two-hop question into one clean single-hop join." },
      ],
    },
    {
      id: "l13-q4",
      prompt: "Why prefer LEFT JOIN + IS NULL over NOT IN (SELECT …)?",
      choices: [
        "LEFT JOIN is always faster",
        "NOT IN silently returns nothing if the subquery produces a single NULL",
        "NOT IN is not valid SQL",
        "There is no difference — they're identical",
      ],
      answer: 1,
      why: "A single NULL in the subquery makes every NOT IN comparison unknown, so zero rows survive. The LEFT JOIN pattern is immune to that edge case.",
      notes: [
        { choice: 0, why: "Speed isn't the differentiator — the decisive flaw in NOT IN is logical: one NULL in the subquery zeroes out the entire result, no matter how fast it does it." },
      ],
    },
  ],
  problems: [
    {
      id: "l13-p1",
      title: "Still waiting on the doorstep",
      brief: "Customers who have **never** had an order delivered. Output: `name`, ordered by name. This is the exact query from the lesson text — expect a short list.",
      hints: [
        "Keep every customer, attach only their delivered orders, then keep the customers where nothing attached.",
        "Shape: SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = <status> WHERE o.id IS NULL ORDER BY <col>;",
      ],
      difficulty: "easy",
      solution:
        "SELECT c.name\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status = 'delivered'\nWHERE o.id IS NULL\nORDER BY c.name;",
      mistakes: [
        { test: "\\binner join\\b", message: "An INNER JOIN keeps only customers who DO have a delivered order — the opposite of the ask. LEFT JOIN keeps everyone, NULL-filling the customers with no match so your IS NULL test can find them." },
        { test: "\\bleft join\\b[^;]*\\bwhere\\b[^;]*\\bo\\.status\\s*=", message: "The status filter belongs inside the ON clause: in WHERE it deletes the NULL-filled rows before `o.id IS NULL` can find them, and the query returns nothing." },
        { test: "\\bleft join\\b(?![^;]*\\bis\\s+null\\b)", message: "A LEFT JOIN alone still returns every customer, matched or not — the anti-join needs the final `WHERE o.id IS NULL` to keep only the customers with no delivered order." },
      ],
      expected: EXPECTED["l13-p1"],
      ordered: true,
    },
    {
      id: "l13-p2",
      title: "Nothing in transit",
      brief: "Customers who have never had an order in 'shipped' status. Output: `name`, ordered by name. One word changes from the previous problem — and the result grows.",
      hints: [
        "Same anti-join as the last problem — only the status word inside ON changes, and the survivor list grows.",
        "Shape: SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = <status> WHERE o.id IS NULL ORDER BY <col>;",
      ],
      difficulty: "easy",
      solution:
        "SELECT c.name\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status = 'shipped'\nWHERE o.id IS NULL\nORDER BY c.name;",
      mistakes: [
        { test: "\\binner join\\b", message: "An INNER JOIN keeps only customers who DO have a shipped order — the opposite of the ask. LEFT JOIN keeps everyone, NULL-filling the customers with no match so your IS NULL test can find them." },
        { test: "status\\s*=\\s*'delivered'", message: "That's the previous problem's status — this brief is about orders in 'shipped' status, so the ON condition should test o.status = 'shipped'." },
        { test: "\\bleft join\\b[^;]*\\bwhere\\b[^;]*\\bo\\.status\\s*=", message: "The status filter belongs inside the ON clause: in WHERE it deletes the NULL-filled rows before `o.id IS NULL` can find them, and the query returns nothing." },
      ],
      expected: EXPECTED["l13-p2"],
      ordered: true,
    },
    {
      id: "l13-p3",
      title: "The spotless record",
      brief: "Customers who have never had an order **cancelled**. Output: `name`, ordered by name. Same single-hop pattern; think about which status completes the condition.",
      hints: [
        "One more single-hop anti-join: pick the status that means the order was yanked back, and the customers it never happened to survive.",
        "Shape: SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = <status> WHERE o.id IS NULL ORDER BY <col>;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.name\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status = 'cancelled'\nWHERE o.id IS NULL\nORDER BY c.name;",
      mistakes: [
        { test: "\\binner join\\b", message: "An INNER JOIN keeps only customers who DO have a cancelled order — the opposite of the ask. LEFT JOIN keeps everyone, NULL-filling the customers with no match so your IS NULL test can find them." },
        { test: "status\\s*=\\s*'delivered'|status\\s*=\\s*'shipped'", message: "Carry-over status — this brief is about 'cancelled' orders: the customers you keep are those with no cancelled order at all." },
        { test: "\\bleft join\\b[^;]*\\bwhere\\b[^;]*\\bo\\.status\\s*=", message: "The status filter belongs inside the ON clause: in WHERE it deletes the NULL-filled rows before `o.id IS NULL` can find them, and the query returns nothing." },
      ],
      expected: EXPECTED["l13-p3"],
      ordered: true,
    },
    {
      id: "l13-p4",
      title: "No pending business",
      brief: "Products that appear in **no pending order** — nothing about them is currently waiting. This spans two hops, so filter first: a subquery collects every product_id that occurs in a pending order, then anti-join against it. Output: `name`, ordered by name.",
      hints: [
        "Pending lives two hops away (items → orders), so filter first: collect the product_ids that DO appear in a pending order, then anti-join products against that list.",
        "Shape: SELECT p.name FROM products p LEFT JOIN ( SELECT DISTINCT oi.product_id FROM order_items oi JOIN orders o ON … WHERE o.status = <status> ) pend ON pend.product_id = p.id WHERE pend.product_id IS NULL ORDER BY <col>;",
      ],
      difficulty: "hard",
      solution:
        "SELECT p.name\nFROM products p\nLEFT JOIN (\n  SELECT DISTINCT oi.product_id\n  FROM order_items oi\n  JOIN orders o ON o.id = oi.order_id\n  WHERE o.status = 'pending'\n) pend ON pend.product_id = p.id\nWHERE pend.product_id IS NULL\nORDER BY p.name;",
      mistakes: [
        { test: "\\bnot\\s+in\\b", message: "`NOT IN (SELECT …)` returns nothing at all if the subquery yields a single NULL — the LEFT JOIN + IS NULL shape from the lesson has no such failure mode." },
        { test: "^(?!.*\\(\\s*select\\b).*$", message: "The 'never in a pending order' test spans two hops (line items → orders), so one ON clause can't express it — build the pending product_id list in a subquery (filter o.status = 'pending' inside it), then LEFT JOIN + IS NULL against it." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The brief asks for the names ordered alphabetically — append ORDER BY p.name." },
      ],
      expected: EXPECTED["l13-p4"],
      ordered: true,
    },
  ],
  takeaway: "An anti-join is three pieces — LEFT JOIN, the qualifying condition inside ON, and WHERE right-id IS NULL — and when the test spans two hops, pre-filter into a subquery rather than trusting NOT IN around NULLs.",
};
