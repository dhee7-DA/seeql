import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson24: Lesson = {
  id: "lesson-24",
  num: 24,
  title: "Capstone: one report, three patterns",
  blurb: "Segment with CASE, stack a TOTAL row, run an EXCEPT audit — the module's whole toolkit in three queries",
  minutes: 15,
  blocks: [
    {
      kind: "p",
      text: "Everything in this module now clicks together. One business report, three moves: **CASE** segments customers by spend, **UNION ALL** pins a TOTAL row under a ledger, and **EXCEPT** audits categories. Every number below is real and re-verified against the store.",
    },
    { kind: "diagram", figure: "s8-capstone" },
    { kind: "h", text: "Pattern 1 — segment, then count" },
    {
      kind: "code",
      caption: "Spend tiers: aggregate per customer FIRST, classify SECOND",
      sql: `SELECT tier, COUNT(*) AS customers FROM (
  SELECT CASE WHEN SUM(o.total) >= 3000 THEN 'high'
              WHEN SUM(o.total) >= 1000 THEN 'mid'
              ELSE 'low'
         END AS tier
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
GROUP BY tier
ORDER BY customers DESC, tier;    -- low 8 · high 4 · mid 4`,
    },
    {
      kind: "bullets",
      items: [
        "The **two-stage shape** matters: an inner query aggregates per customer (`GROUP BY c.id`), then the outer query groups the tiers. You cannot CASE *and* tier in one flat GROUP BY — aggregates cannot nest.",
        "The tiers are honest: **high** is Alice 7,262.35 (24 orders), Emma 6,640.56, Grace 4,574.23, Maya 3,644.56 — exactly the 4 customers ≥ 3,000. **mid** holds Chloe, Pedro, Farid and Keiko; the other **8** — down to Olivia's 444.80 — ride low.",
        "This is lesson 7's GROUP BY, lesson 22's CASE, and lesson 17's \"stack-then-summarize\" FROM-wrap — three lessons, one query.",
      ],
    },
    { kind: "diagram", figure: "s16-two-stage" },
    { kind: "h", text: "Pattern 2 — stack a TOTAL row under the ledger" },
    {
      kind: "code",
      caption: "Delivered-revenue ledger with a pinned TOTAL",
      sql: `SELECT month, orders, revenue FROM (
  SELECT substr(created_at, 1, 7) AS month,
         COUNT(*) AS orders,
         ROUND(SUM(total), 2) AS revenue
  FROM orders
  WHERE status = 'delivered'
  GROUP BY month
  ORDER BY month DESC
  LIMIT 3
)
UNION ALL
SELECT 'TOTAL', COUNT(*), ROUND(SUM(total), 2)
FROM orders
WHERE status = 'delivered'
ORDER BY month;   -- 2024-12 · 2025-01 · 2025-02 · TOTAL`,
    },
    {
      kind: "bullets",
      items: [
        "The detail arm is a wrapped group-by (its own `ORDER BY … LIMIT` — legal inside FROM, impossible as a bare arm). The TOTAL arm is a flat aggregate. `UNION ALL` stacks them: 4 rows, 1,103.13 + 724.11 + 707.35 under a **TOTAL of 52 delivered orders and 15,571.07**.",
        "`UNION ALL`, not `UNION` — a TOTAL row never duplicates a month row, but the dedupe pass would still burn a sort. And if a TOTAL row *did* coincide with a detail row, `UNION` would silently delete it.",
        "Sorting a mixed pile ('2025-02' vs 'TOTAL') is string sorting — 'T' > '2' pins TOTAL last here by luck. Make it deterministic with `ORDER BY CASE WHEN month = 'TOTAL' THEN 1 ELSE 0 END, month`.",
      ],
    },
    { kind: "h", text: "Pattern 3 — EXCEPT as a data audit" },
    {
      kind: "code",
      caption: "Categories with delivered revenue but zero pending revenue",
      sql: `SELECT p.category
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.status = 'delivered'
GROUP BY p.category
EXCEPT
SELECT p.category
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.status = 'pending'
GROUP BY p.category
ORDER BY category;    -- exactly one row: Apparel`,
    },
    {
      kind: "bullets",
      items: [
        "Six of seven categories carry both delivered and pending revenue; **Apparel** alone is delivered-only — nothing in that category is stuck in a queue. One operator turns that into an auditable row.",
        "**Fan-out, one last time**: joining `order_items` multiplies order rows by their items (34,833.28 of true revenue became 103,244.55 in lesson 16). Here it is safe *only* because each arm groups by category before the EXCEPT compares them — compare categories, never raw sums across a fan-out.",
        "The arms compare **entire rows** — both select exactly `category`. Projecting extra columns in one arm would silently shrink or break the overlap.",
      ],
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "All three patterns run as-written on **SQLite, Postgres and MySQL 8.0.31+**; the EXCEPT audit is the only line item MySQL versions before **8.0.31** cannot say (use `LEFT JOIN … IS NULL` there).",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "The TOTAL-row stack is the classic pre-window-function report. Engines can now do it with `GROUPING SETS`/`ROLLUP` (Postgres, MySQL 8) — but the UNION ALL ledger is the version you will actually write from memory.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "`substr` is the SQLite/Postgres spelling; MySQL documents the function as `SUBSTRING` (and accepts `SUBSTR` as a synonym) — one of the few functions in this module with a dialect name.",
    },
    {
      kind: "tip",
      text: "Notice what the capstone did NOT need: subqueries in WHERE, loops, application code. Segment, stack, audit — three composable patterns cover most reports analysts are asked for. That is the floor, not the ceiling.",
    },
  ],
  mcqs: [
    {
      id: "l24-q1",
      prompt: "Why does the tier query wrap the per-customer aggregation in a FROM subquery instead of tiering directly in one GROUP BY?",
      choices: [
        "Subqueries run faster than single-level GROUP BY",
        "Aggregates cannot nest — you must SUM per customer first, then classify and count the resulting tiers",
        "SQLite forbids CASE in the same SELECT as an aggregate",
        "The outer query needs UNION ALL",
      ],
      answer: 1,
      why: "Tiering depends on SUM(o.total), which only exists after grouping per customer. Two stages, wrapped: aggregate → classify → count. The result: high 4, mid 4, low 8.",
      notes: [
        { choice: 0, why: "Performance isn't the point — the flat version doesn't even run: SUM(o.total) is still being computed when the outer count would need it. The two-stage wrap is a correctness requirement." },
      ],
    },
    {
      id: "l24-q2",
      prompt: "In the TOTAL-row ledger, why UNION ALL rather than UNION?",
      choices: [
        "UNION cannot stack aggregates",
        "UNION ALL skips the dedupe pass, and a TOTAL row that coincided with a detail row would be silently deleted by UNION",
        "UNION sorts alphabetically and would break the month order",
        "No reason — they are identical here",
      ],
      answer: 1,
      why: "The append must be unconditional. UNION's dedupe pass costs a sort and — in the pathological case where TOTAL equals a detail row — removes the very row you added.",
      notes: [
        { choice: 2, why: "Neither operator sorts — order comes only from the final ORDER BY. The real difference is UNION's dedupe pass: it burns a sort and can delete a TOTAL row that coincided with a detail row." },
      ],
    },
    {
      id: "l24-q3",
      prompt: "The EXCEPT audit returns exactly one category. Which, and why is it interesting?",
      choices: [
        "Audio — it has the highest revenue",
        "Fitness — lowest delivered revenue",
        "Apparel — it has delivered revenue but no pending revenue: nothing stuck in the queue",
        "Electronics — it is the only category without cancellations",
      ],
      answer: 2,
      why: "Six categories appear in both the delivered and pending revenue lists; only Apparel is delivered-only. EXCEPT surfaces it as a clean audit row.",
      notes: [
        { choice: 0, why: "Audio carries plenty of delivered revenue but pending revenue too, so the EXCEPT drops it — the audit surfaces the category with a *missing* status, not the biggest one." },
      ],
    },
    {
      id: "l24-q4",
      prompt: "Why is joining order_items in the EXCEPT arms safe here, when lesson 16 called the same join a fan-out trap?",
      choices: [
        "It is never safe — the query is wrong",
        "Because each arm groups by category before the set operation compares them; no SUM crosses the fan-out ungrouped",
        "Because order_items has fewer rows than orders",
        "Because EXCEPT removes duplicated items",
      ],
      answer: 1,
      why: "The trap is aggregating across the fan-out (SUM(o.total) → 103,244.55). Grouping by category per arm keeps every aggregate scoped — 34,833.28 stays true.",
      notes: [
        { choice: 3, why: "EXCEPT's dedupe is beside the point — it dedupes result rows, not the underlying join. Safety comes from each arm grouping by category before the set operation compares them." },
      ],
    },
  ],
  problems: [
    {
      id: "l24-p1",
      title: "Spend tiers",
      brief: "Classify every customer by total spend: `high` ≥ 3000, `mid` ≥ 1000, else `low`. Output: `tier`, `customers` (count) — ordered by count descending, then tier. Three rows.",
      hints: [
        "Aggregate per customer FIRST (inner query with GROUP BY c.id), classify each spend total with CASE second, then count the tiers outside — aggregates cannot nest.",
        "Shape: SELECT tier, COUNT(*) AS customers FROM (SELECT CASE WHEN SUM(o.total) >= <threshold> THEN '<label>' … ELSE '<default>' END AS tier FROM customers c JOIN orders o ON <join> GROUP BY c.id) GROUP BY tier ORDER BY customers DESC, tier;",
      ],
      difficulty: "medium",
      solution:
        "SELECT tier, COUNT(*) AS customers FROM (\n  SELECT CASE WHEN SUM(o.total) >= 3000 THEN 'high'\n              WHEN SUM(o.total) >= 1000 THEN 'mid'\n              ELSE 'low' END AS tier\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id\n  GROUP BY c.id\n)\nGROUP BY tier\nORDER BY customers DESC, tier;",
      mistakes: [
        { test: "^(?:(?!group by).)*group by(?:(?!group by).)*$", message: "Tiering needs two stages: an inner query that aggregates spend per customer (GROUP BY c.id), then an outer GROUP BY tier — one flat GROUP BY cannot classify an aggregate it is still computing." },
        { test: "\\bcase\\b(?![^;]*\\bend\\b)", message: "The tiering CASE must close with END before the subquery does — an unterminated CASE is a syntax error." },
        { test: "\\border\\s+by\\s+customers\\b(?![^;]*\\bdesc\\b)", message: "The brief orders by count DESCENDING (biggest tier first) — add DESC after customers." },
      ],
      expected: EXPECTED["l24-p1"],
      ordered: true,
    },
    {
      id: "l24-p2",
      title: "Ledger with a TOTAL",
      brief: "Delivered revenue per month (`month`, `orders`, `revenue`) for the 3 most recent months, then a `'TOTAL'` row stacked underneath via UNION ALL. Output ordered by `month` — the TOTAL row sorts last alphabetically.",
      hints: [
        "Build the 3-month ledger as a wrapped group-by (its own ORDER BY … LIMIT is legal inside FROM), then UNION ALL a flat 'TOTAL' aggregate — one ORDER BY at the very end.",
        "Shape: SELECT month, orders, revenue FROM (SELECT substr(created_at, 1, 7) AS month, COUNT(*) AS orders, ROUND(SUM(total), 2) AS revenue FROM orders WHERE <filter> GROUP BY month ORDER BY month DESC LIMIT 3) UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(total), 2) FROM orders WHERE <filter> ORDER BY month;",
      ],
      difficulty: "hard",
      solution:
        "SELECT month, orders, revenue FROM (\n  SELECT substr(created_at, 1, 7) AS month,\n         COUNT(*) AS orders,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  WHERE status = 'delivered'\n  GROUP BY month\n  ORDER BY month DESC\n  LIMIT 3\n)\nUNION ALL\nSELECT 'TOTAL', COUNT(*), ROUND(SUM(total), 2)\nFROM orders\nWHERE status = 'delivered'\nORDER BY month;",
      mistakes: [
        { test: "^(?![^;]*\\bdelivered\\b[^;]*\\bdelivered\\b)", message: "Both arms must filter WHERE status = 'delivered' — the detail arm for the months, the TOTAL arm for the grand totals. One unfiltered arm inflates its numbers with all 103 orders." },
        { test: "order by[^;)]*\\bunion\\b", message: "The inner ORDER BY … LIMIT only works wrapped in a FROM subquery — a bare UNION arm cannot carry one. Close the subquery with ) before UNION ALL and sort the final result once, at the very end." },
        { test: "\\bgroup\\s+by\\s+created_at\\b", message: "GROUP BY created_at buckets per timestamp — the ledger is per month: group by substr(created_at, 1, 7)." },
      ],
      expected: EXPECTED["l24-p2"],
      ordered: true,
    },
    {
      id: "l24-p3",
      title: "The delivered-only category",
      brief: "Categories with delivered-order revenue but **no** pending-order revenue — both arms built from orders ⋈ order_items ⋈ products, grouped by category. Output one column `category`.",
      hints: [
        "Two three-table arms identical except for the status filter — delivered in the first, pending in the second — each grouped by category, subtracted with EXCEPT.",
        "Shape: SELECT p.category FROM orders o JOIN order_items oi ON <join> JOIN products p ON <join> WHERE o.status = '<status-a>' GROUP BY p.category EXCEPT SELECT p.category FROM … WHERE o.status = '<status-b>' GROUP BY p.category ORDER BY category;",
      ],
      difficulty: "hard",
      solution:
        "SELECT p.category\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE o.status = 'delivered'\nGROUP BY p.category\nEXCEPT\nSELECT p.category\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE o.status = 'pending'\nGROUP BY p.category\nORDER BY category;",
      mistakes: [
        { test: "\\bunion\\b", message: "UNION merges the two category lists — the audit wants the subtraction: categories with delivered revenue that never appear with pending revenue. That operator is EXCEPT." },
        { test: "^(?![^;]*\\bnot\\s+in\\b)(?![^;]*\\bnot\\s+exists\\b)(?![^;]*\\bleft\\s+join\\b)select\\b(?:(?!\\bexcept\\b).)*$", message: "The audit needs two arms — delivered categories EXCEPT pending categories — so a category survives only if it has delivered revenue and no pending revenue at all." },
        { test: "^(?![^;]*'pending')", message: "The subtracting arm must filter status = 'pending' — auditing against any other status (or forgetting the filter) answers a different question." },
      ],
      expected: EXPECTED["l24-p3"],
      ordered: true,
    },
    {
      id: "l24-p4",
      title: "The order book",
      brief: "Bucket every order with CASE — delivered/shipped → `BIG`, pending → `OPEN`, else `LOST` — reporting `bucket`, `orders`, `revenue` per bucket, then stack a `'TOTAL'` row with UNION ALL. Output ordered by `bucket`.",
      hints: [
        "Same two-stage shape as the ledger: a wrapped bucketing group-by (the CASE labels each order, then GROUP BY bucket), stacked with a flat TOTAL aggregate via UNION ALL.",
        "Shape: SELECT bucket, orders, revenue FROM (SELECT CASE WHEN <cond> THEN '<label>' … ELSE '<default>' END AS bucket, COUNT(*) AS orders, ROUND(SUM(total), 2) AS revenue FROM orders GROUP BY bucket) UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(total), 2) FROM orders ORDER BY bucket;",
      ],
      difficulty: "hard",
      solution:
        "SELECT bucket, orders, revenue FROM (\n  SELECT CASE WHEN status IN ('delivered', 'shipped') THEN 'BIG'\n              WHEN status = 'pending' THEN 'OPEN'\n              ELSE 'LOST' END AS bucket,\n         COUNT(*) AS orders,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY bucket\n)\nUNION ALL\nSELECT 'TOTAL', COUNT(*), ROUND(SUM(total), 2)\nFROM orders\nORDER BY bucket;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bunion\\b).)*$", message: "The brief stacks a 'TOTAL' row under the buckets — a second flat aggregate ('TOTAL', COUNT(*), ROUND(SUM(total), 2)) joined with UNION ALL." },
        { test: "^(?=[^;]*'big')(?![^;]*'shipped')(?![^;]*'cancelled')", message: "BIG covers delivered AND shipped — 82 orders. Bucket them with IN ('delivered', 'shipped'), or an ELSE that catches both." },
        { test: "^(?=[^;]*\\bcount\\s*\\()(?![^;]*\\bgroup by\\b)", message: "COUNT(*) without GROUP BY collapses everything into one row — label each order with the CASE first, then GROUP BY bucket." },
      ],
      expected: EXPECTED["l24-p4"],
      ordered: true,
    },
  ],
  takeaway: "Segment with CASE over an inner aggregation, stack a TOTAL with UNION ALL, audit with EXCEPT — three composable patterns that cover most reports analysts are asked for.",
};
