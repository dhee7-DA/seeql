import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson16: Lesson = {
  id: "lesson-16",
  num: 16,
  title: "Capstone: join pitfalls & power moves",
  blurb: "The fan-out trap that inflates sums 3×, and the aggregate-first fix used in production",
  minutes: 15,
  blocks: [
    {
      kind: "p",
      text: "The store's true revenue — summing `orders.total` directly — is **34,833.28**. Now someone \"helpfully\" joins orders to order_items to enrich each order with its lines, and sums the same `o.total` column. The result: **103,244.55** — almost exactly 3× too much. No error, no warning. Just a number confidently wrong in a dashboard someone will present on Friday.",
    },
    { kind: "diagram", figure: "j7-fanout" },
    { kind: "h", text: "What just happened" },
    {
      kind: "bullets",
      items: [
        "Lesson 10's row multiplication in its most expensive costume: the store's 103 orders spread across **251 order lines**, so joining `orders` to `order_items` replicates each order row once per line.",
        "Each order's `total` rides along 2–4 times — and `SUM` dutifully adds every copy.",
        "`DISTINCT` won't save you: two orders can legitimately share a total.",
      ],
    },
    { kind: "h", text: "The fix: aggregate before you join" },
    {
      kind: "bullets",
      items: [
        "`GROUP BY o.id` makes each **order** a bucket, so the SUM inside the bucket adds only that order's own line amounts — no foreign totals sneak in.",
        "The join is still there, but each bucket now mixes exactly one order row with its own items.",
        "Need it as input to further joins? Wrap it in a subquery (lesson 13's move): the derived table has one row per order, and any join against it can't inflate anything.",
      ],
    },
    {
      kind: "code",
      caption: "Aggregate first, join second — one row per order, no inflation",
      sql: `SELECT o.id,
       o.total,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS items_revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id
ORDER BY o.id
LIMIT 10;`,
    },
    { kind: "h", text: "Pre-flight checklist" },
    {
      kind: "bullets",
      items: [
        "**Keys** — is every hop's `ON` using real keys?",
        "**Multiplication** — could any hop duplicate rows? If you're summing, did you aggregate the many side first?",
        "**Unmatched rows** — do you need them? LEFT JOIN, with right-side conditions in `ON`.",
        "**GROUP BY** — group by the id, display the name.",
        "**Zeros** — `COUNT(column)`, not `COUNT(*)`, when zeros are possible.",
      ],
    },
  ],
  mcqs: [
    {
      id: "l16-q1",
      prompt: "SUM(o.total) over `orders JOIN order_items` returns 103,244.55 instead of 34,833.28. Why?",
      choices: [
        "The join rounded the numbers",
        "Each order's total is duplicated once per matching order line before SUM runs",
        "order_items contains extra hidden rows",
        "SUM cannot handle joined columns",
      ],
      answer: 1,
      why: "251 item rows carry copies of their order's total, so every total is counted ~2–4×. The multiplication happens at join time; SUM just tells the truth about the rows it receives.",
    },
    {
      id: "l16-q2",
      prompt: "What is the standard fix for summing a one-side column across a one-to-many join?",
      choices: [
        "Add DISTINCT to the SUM",
        "Aggregate the many side per key first (GROUP BY the key), then join the one-side columns",
        "Use COUNT instead of SUM",
        "Remove the join and guess",
      ],
      answer: 1,
      why: "Collapsing the many side to one row per key (order) means each order total appears exactly once. DISTINCT fails when two orders share a value — which happens in real data.",
    },
    {
      id: "l16-q3",
      prompt: "In the capstone query, what does GROUP BY o.id guarantee?",
      choices: [
        "Results are sorted by order id",
        "Each bucket contains exactly one order row plus that order's own items — SUMs stay local",
        "Only orders with items are returned",
        "The join is skipped for single-item orders",
      ],
      answer: 1,
      why: "Grouping by the order id scopes every aggregate to that order's own lines. (Sorting still needs ORDER BY; filtering needs HAVING or WHERE.)",
    },
    {
      id: "l16-q4",
      prompt: "A LEFT JOIN report on orders-per-customer must count zeros correctly. Which do you trust?",
      choices: [
        "COUNT(*) — it counts every row",
        "COUNT(o.id) — it ignores the NULL-filled rows of customers without orders",
        "SUM(o.id)",
        "They always agree, so either",
      ],
      answer: 1,
      why: "COUNT(*) counts the ghost NULL row as 1; COUNT(o.id) skips NULLs and reports 0. On this dataset they coincide, but the first real zero breaks COUNT(*).",
    },
  ],
  problems: [
    {
      id: "l16-p1",
      title: "Ground truth",
      brief: "First, establish the number everything gets compared to: total revenue straight from `orders`, no joins. Output: `revenue` (alias ROUND(SUM(total),2) exactly). One table, one row.",
      hint: "SELECT ROUND(SUM(total), 2) AS revenue FROM orders — nothing else.",
      difficulty: "easy",
      solution: "SELECT ROUND(SUM(total), 2) AS revenue FROM orders;",
      expected: EXPECTED["l16-p1"],
    },
    {
      id: "l16-p2",
      title: "Commit the crime",
      brief: "Now reproduce the inflated number: sum `o.total` after joining orders to order_items. Output: `inflated` (alias exactly). One row — stare at it. This is what an unguarded join does to a SUM.",
      hint: "JOIN order_items oi ON oi.order_id = o.id, then ROUND(SUM(o.total), 2) AS inflated. No GROUP BY.",
      difficulty: "medium",
      solution:
        "SELECT ROUND(SUM(o.total), 2) AS inflated\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id;",
      expected: EXPECTED["l16-p2"],
    },
    {
      id: "l16-p3",
      title: "The honest reconciliation",
      brief: "Per order: the stored total next to the revenue rebuildable from its lines. Output: `id` (order id), `total`, `items_revenue` (alias exactly) — the first 10 orders by id. GROUP BY the order id so the SUM stays inside each order's own lines.",
      hint: "JOIN + GROUP BY o.id; SELECT o.id, o.total, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS items_revenue; ORDER BY o.id LIMIT 10.",
      difficulty: "hard",
      solution:
        "SELECT o.id,\n       o.total,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS items_revenue\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nGROUP BY o.id\nORDER BY o.id\nLIMIT 10;",
      expected: EXPECTED["l16-p3"],
      ordered: true,
    },
    {
      id: "l16-p4",
      title: "The trusted leaderboard",
      brief: "The finale: top 5 customers by **line-item** revenue (quantity × unit_price), the measure that can't be inflated. Output: `name`, `revenue` (alias exactly), biggest first. Three tables, correct aggregation, one clean answer.",
      hint: "Join customers → orders → order_items, GROUP BY c.id, SUM the item amounts, ORDER BY revenue DESC LIMIT 5.",
      difficulty: "hard",
      solution:
        "SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM customers c\nJOIN orders o      ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nGROUP BY c.id\nORDER BY revenue DESC\nLIMIT 5;",
      expected: EXPECTED["l16-p4"],
      ordered: true,
    },
  ],
};
