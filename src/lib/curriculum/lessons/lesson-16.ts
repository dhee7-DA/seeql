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
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite's bare-column rule is why `SELECT o.id, o.total … GROUP BY o.id` runs at all: for columns outside GROUP BY, SQLite picks a value from an arbitrary row in the bucket — safe here because every row in an order-bucket carries the same order row. Aim it at a per-item column and you'd silently surface one arbitrary item.",
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
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL's ONLY_FULL_GROUP_BY accepts `SELECT o.id, o.total … GROUP BY o.id` — o.total depends on the primary key. Group by `o.customer_id` instead and it rejects the query outright: with many orders per customer, no single total could be the right one to show.",
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
      notes: [
        { choice: 2, why: "order_items has no hidden rows — its 248 lines are all visible; the inflation comes from each order's total being copied onto every one of its lines." },
      ],
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
      notes: [
        { choice: 0, why: "DISTINCT dedupes by value, not by order — two different orders that legitimately share a total would collapse to one copy and corrupt the sum in a subtler way." },
      ],
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
      notes: [
        { choice: 0, why: "GROUP BY buckets, it doesn't sort — SQLite often *displays* grouped rows in key order by implementation accident, which is exactly the illusion that breaks in other engines." },
      ],
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
      notes: [
        { choice: 0, why: "\"It counts every row\" is precisely the bug — the NULL-filled ghost row of a zero-order customer is a row, so COUNT(*) reports an order that never happened." },
      ],
    },
  ],
  problems: [
    {
      id: "l16-p1",
      title: "Ground truth",
      brief: "First, establish the number everything gets compared to: total revenue straight from `orders`, no joins. Output: `revenue` (alias ROUND(SUM(total),2) exactly). One table, one row.",
      hints: [
        "One table, one aggregate, zero joins — the baseline number every joined result gets judged against.",
        "Shape: SELECT ROUND(SUM(total), 2) AS revenue FROM <table>;",
      ],
      difficulty: "easy",
      solution: "SELECT ROUND(SUM(total), 2) AS revenue FROM orders;",
      mistakes: [
        { test: "\\bjoin\\b", message: "Ground truth needs no join — a straight SUM over orders is the baseline, and joins are exactly what inflates the number in the next problem." },
        { test: "\\b(avg|count|min|max)\\s*\\(", message: "Revenue is a total: ROUND(SUM(total), 2) — COUNT tallies rows and AVG would average them." },
        { test: "\\border_items\\b", message: "order_items is the next problem's territory — this baseline is the stored orders.total summed over all 103 orders." },
      ],
      expected: EXPECTED["l16-p1"],
    },
    {
      id: "l16-p2",
      title: "Commit the crime",
      brief: "Now reproduce the inflated number: sum `o.total` after joining orders to order_items. Output: `inflated` (alias exactly). One row — stare at it. This is what an unguarded join does to a SUM.",
      hints: [
        "Reproduce the crime exactly: join the many side on, then sum the one-side column over every replicated row — one grand total, no GROUP BY.",
        "Shape: SELECT ROUND(SUM(o.total), 2) AS inflated FROM orders o JOIN order_items oi ON …;",
      ],
      difficulty: "medium",
      solution:
        "SELECT ROUND(SUM(o.total), 2) AS inflated\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id;",
      mistakes: [
        { test: "\\bgroup\\s+by\\b", message: "The crime is one grand total — GROUP BY would carve the inflation into per-order buckets and hide the 3× lesson." },
        { test: "sum\\s*\\(\\s*oi\\.|quantity\\s*\\*\\s*unit_price", message: "quantity × unit_price is the honest measure — the crime is summing the *replicated* o.total, which is only wrong because the join copied it onto every line." },
        { test: "^(?!.*\\bjoin\\b).*$", message: "The inflation only exists across the join — FROM orders o JOIN order_items oi ON oi.order_id = o.id replicates each order's total once per line." },
      ],
      expected: EXPECTED["l16-p2"],
    },
    {
      id: "l16-p3",
      title: "The honest reconciliation",
      brief: "Per order: the stored total next to the revenue rebuildable from its lines. Output: `id` (order id), `total`, `items_revenue` (alias exactly) — the first 10 orders by id. GROUP BY the order id so the SUM stays inside each order's own lines.",
      hints: [
        "Make each order its own bucket so the line-item SUM stays inside that order's lines, then show the stored total beside the rebuilt one.",
        "Shape: SELECT o.id, o.total, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS items_revenue FROM orders o JOIN order_items oi ON … GROUP BY o.id ORDER BY o.id LIMIT <n>;",
      ],
      difficulty: "hard",
      solution:
        "SELECT o.id,\n       o.total,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS items_revenue\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nGROUP BY o.id\nORDER BY o.id\nLIMIT 10;",
      mistakes: [
        { test: "^(?=.*\\bsum\\s*\\()(?!.*\\bgroup\\s+by\\b).*$", message: "o.total is a bare column beside an aggregate — GROUP BY o.id is what keeps the SUM inside each order's own lines instead of bleeding across the whole join." },
        { test: "sum\\s*\\(\\s*o\\.total", message: "SUM(o.total) here just re-creates the inflated number per bucket — the rebuildable figure comes from the lines: SUM(oi.quantity * oi.unit_price)." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The brief wants the first ten orders by id — append ORDER BY o.id LIMIT 10." },
      ],
      expected: EXPECTED["l16-p3"],
      ordered: true,
    },
    {
      id: "l16-p4",
      title: "The trusted leaderboard",
      brief: "The finale: top 5 customers by **line-item** revenue (quantity × unit_price), the measure that can't be inflated. Output: `name`, `revenue` (alias exactly), biggest first. Three tables, correct aggregation, one clean answer.",
      hints: [
        "The measure that can't inflate: sum line amounts, bucket per customer across the three-table chain, then cap the leaderboard at five.",
        "Shape: SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM customers c JOIN orders o ON … JOIN order_items oi ON … GROUP BY c.id ORDER BY revenue DESC LIMIT <n>;",
      ],
      difficulty: "hard",
      solution:
        "SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM customers c\nJOIN orders o      ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nGROUP BY c.id\nORDER BY revenue DESC\nLIMIT 5;",
      mistakes: [
        { test: "sum\\s*\\(\\s*o\\.total", message: "That's the l16-p2 crime again — after this join, every orders.total rides along once per line item. SUM(oi.quantity * oi.unit_price) is the measure that can't inflate." },
        { test: "^(?=.*\\bsum\\s*\\()(?!.*\\bgroup\\s+by\\b).*$", message: "c.name sits bare next to the SUM — GROUP BY c.id makes each customer a bucket before the leaderboard is ranked." },
        { test: "^(?!.*\\blimit\\b).*$", message: "The brief wants the top 5 — ORDER BY revenue DESC does the ranking, LIMIT 5 cuts the list." },
      ],
      expected: EXPECTED["l16-p4"],
      ordered: true,
    },
  ],
  takeaway: "A one-to-many join replicates the one side's values, so aggregate the many side per key before summing one-side columns — and run the pre-flight checklist (keys, multiplication, unmatched rows, GROUP BY id, COUNT(column)) before any joined aggregate ships.",
};
