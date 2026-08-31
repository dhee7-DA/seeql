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
    },
  ],
  problems: [
    {
      id: "l13-p1",
      title: "Still waiting on the doorstep",
      brief: "Customers who have **never** had an order delivered. Output: `name`, ordered by name. This is the exact query from the lesson text — expect a short list.",
      hint: "LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered', then WHERE o.id IS NULL.",
      difficulty: "easy",
      solution:
        "SELECT c.name\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status = 'delivered'\nWHERE o.id IS NULL\nORDER BY c.name;",
      expected: EXPECTED["l13-p1"],
      ordered: true,
    },
    {
      id: "l13-p2",
      title: "Nothing in transit",
      brief: "Customers who have never had an order in 'shipped' status. Output: `name`, ordered by name. One word changes from the previous problem — and the result grows.",
      hint: "Same shape as before with o.status = 'shipped'.",
      difficulty: "easy",
      solution:
        "SELECT c.name\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status = 'shipped'\nWHERE o.id IS NULL\nORDER BY c.name;",
      expected: EXPECTED["l13-p2"],
      ordered: true,
    },
    {
      id: "l13-p3",
      title: "The spotless record",
      brief: "Customers who have never had an order **cancelled**. Output: `name`, ordered by name. Same single-hop pattern; think about which status completes the condition.",
      hint: "LEFT JOIN with o.status = 'cancelled' inside ON, WHERE o.id IS NULL, ORDER BY c.name.",
      difficulty: "medium",
      solution:
        "SELECT c.name\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status = 'cancelled'\nWHERE o.id IS NULL\nORDER BY c.name;",
      expected: EXPECTED["l13-p3"],
      ordered: true,
    },
    {
      id: "l13-p4",
      title: "No pending business",
      brief: "Products that appear in **no pending order** — nothing about them is currently waiting. This spans two hops, so filter first: a subquery collects every product_id that occurs in a pending order, then anti-join against it. Output: `name`, ordered by name.",
      hint: "LEFT JOIN (SELECT DISTINCT oi.product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'pending') pend ON pend.product_id = p.id WHERE pend.product_id IS NULL.",
      difficulty: "hard",
      solution:
        "SELECT p.name\nFROM products p\nLEFT JOIN (\n  SELECT DISTINCT oi.product_id\n  FROM order_items oi\n  JOIN orders o ON o.id = oi.order_id\n  WHERE o.status = 'pending'\n) pend ON pend.product_id = p.id\nWHERE pend.product_id IS NULL\nORDER BY p.name;",
      expected: EXPECTED["l13-p4"],
      ordered: true,
    },
  ],
};
