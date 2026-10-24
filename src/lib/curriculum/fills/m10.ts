// Fill drills for Module 10 — Window Functions Masterclass (lessons 58-63).
// Same contract as m01: completed SQL must run on the seed storefront db
// (scripts/fill-audit.ts enforces), answers appear in chips verbatim,
// chips 4-6 distinct, per-slot notes coach the tempting wrong chip.
import type { Fill } from "../types";

export const FILLS_BY_LESSON: Record<number, Fill[]> = {
  // Lesson 58 — Windows IV: OVER from first principles
  58: [
    {
      id: "l58-f1",
      prompt:
        "Every order next to its slice of store revenue: fill the denominator so `pct` divides by the grand total of ALL orders — computed as a window, with no GROUP BY anywhere.",
      template:
        "SELECT id, total,\n  ROUND(100.0 * total / ({1}), 2) AS pct\nFROM orders\nORDER BY id;",
      chips: [
        "SUM(total) OVER ()",
        "SUM(total)",
        "SUM(total) OVER (ORDER BY id)",
        "TOTAL(*)",
        "SUM(total) GROUP BY id",
      ],
      answers: ["SUM(total) OVER ()"],
      why: "The empty OVER () makes SUM a window over the whole row set, so every row sees the same grand total — that's the denominator a share-of-total needs. Bare SUM(total) would be a grouped aggregate and error without GROUP BY.",
      notes: [
        {
          slot: 1,
          why: "SUM(total) OVER (ORDER BY id) is a RUNNING total — the denominator would grow row by row and the early percentages would balloon. The empty parens are the whole point: no partition, no order, one stage.",
        },
      ],
    },
    {
      id: "l58-f2",
      prompt:
        "The account-statement view: each customer's order total accumulates in chronological order, and the snowball RESTARTS for the next customer. Fill the over-clause.",
      template:
        "SELECT customer_id, created_at, total,\n  ROUND(SUM(total) OVER ({1} ORDER BY created_at, id), 2) AS run\nFROM orders\nORDER BY customer_id, created_at, id;",
      chips: [
        "PARTITION BY customer_id",
        "GROUP BY customer_id",
        "PARTITION BY created_at",
        "PARTITION BY total",
        "ORDER BY customer_id",
      ],
      answers: ["PARTITION BY customer_id"],
      why: "PARTITION BY customer_id gives every customer their own stage; the ORDER BY inside OVER then runs the snowball within the stage and it resets at each new customer. GROUP BY would collapse 103 orders into 16 rows — the opposite of a statement walk.",
      notes: [
        {
          slot: 1,
          why: "PARTITION BY created_at gives every distinct date its own stage — the sum would restart every day. The restart must follow the customer.",
        },
      ],
    },
    {
      id: "l58-f3",
      prompt:
        "Stamp each order with the size of its status group — delivered rows show 52, shipped 30, pending 14, cancelled 7. Fill the window aggregate.",
      template:
        "SELECT id, status,\n  {1} OVER (PARTITION BY status) AS status_count\nFROM orders\nORDER BY id;",
      chips: ["COUNT(*)", "SUM(total)", "COUNT(DISTINCT status)", "ROW_NUMBER()", "COUNT(id) OVER"],
      answers: ["COUNT(*)"],
      why: "COUNT(*) counts the rows in each status stage — exactly the group size, stamped onto every member row. The window version of GROUP BY + COUNT, without collapsing anything.",
      notes: [
        {
          slot: 1,
          why: "ROW_NUMBER() numbers rows 1..52 within the stage — it counts nothing. You need the stage's row count, not a sequence.",
        },
      ],
    },
  ],

  // Lesson 59 — Windows V: the ranking playbook
  59: [
    {
      id: "l59-f1",
      prompt:
        "Top three orders per customer: the CTE already numbers every order inside its customer stage. Fill the outer WHERE that keeps only the podium.",
      template:
        "WITH n AS (\n  SELECT customer_id, id, total,\n    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) AS rn\n  FROM orders\n)\nSELECT customer_id, id, total FROM n\nWHERE {1}\nORDER BY customer_id, rn;",
      chips: ["rn <= 3", "rn < 3", "rn = 3", "ROW_NUMBER() <= 3", "rn >= 3"],
      answers: ["rn <= 3"],
      why: "Window functions can't appear in WHERE — number in the CTE, filter outside. rn <= 3 keeps ranks 1, 2 and 3: the top-three-per-group playbook in its canonical shape.",
      notes: [
        { slot: 1, why: "rn < 3 keeps only ranks 1 and 2 — the bronze order leaks out of the podium. Three spots need three rank values: <= 3." },
      ],
    },
    {
      id: "l59-f2",
      prompt:
        "Dedupe to the LATEST order per customer: the CTE numbers each customer's orders newest first. Fill the WHERE that keeps one row per customer.",
      template:
        "WITH n AS (\n  SELECT customer_id, id, created_at,\n    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) AS rn\n  FROM orders\n)\nSELECT customer_id, id, created_at FROM n\nWHERE {1}\nORDER BY customer_id;",
      chips: ["rn = 1", "rn = 0", "rn > 1", "MIN(rn)", "rn = COUNT(*)"],
      answers: ["rn = 1"],
      why: "Newest first means rank 1 IS the latest order — rn = 1 keeps exactly one row per customer. This dedupe-by-rank pattern replaces the fragile GROUP BY + MAX(created_at) join.",
      notes: [
        { slot: 1, why: "ROW_NUMBER starts at 1, never 0 — rn = 0 filters everything out and returns an empty set." },
      ],
    },
    {
      id: "l59-f3",
      prompt:
        "Rank the four statuses by order count, biggest first — with the tie contract that SKIPS shared ranks (two tied rows leave a hole after them). Fill the function.",
      template:
        "SELECT status, COUNT(*) AS n,\n  {1}() OVER (ORDER BY COUNT(*) DESC) AS rk\nFROM orders\nGROUP BY status\nORDER BY rk;",
      chips: ["RANK", "DENSE_RANK", "ROW_NUMBER", "NTILE", "LAG"],
      answers: ["RANK"],
      why: "RANK is the skip-a-rank contract: tied rows share a rank and the next rank jumps. DENSE_RANK never skips; ROW_NUMBER breaks ties arbitrarily — a different promise per function.",
      notes: [
        {
          slot: 1,
          why: "DENSE_RANK is the no-gaps tie contract — ties share a rank and the next distinct value gets the very next integer. The ask here explicitly wants the hole, which is RANK.",
        },
      ],
    },
  ],

  // Lesson 60 — Windows VI: LAG & LEAD mastery
  60: [
    {
      id: "l60-f1",
      prompt:
        "Month-over-month revenue delta: the CTE `m` folds orders into one revenue row per month. Fill the window call that pairs each month with the PREVIOUS month's revenue, in month order.",
      template:
        "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month, ROUND(SUM(total), 2) AS revenue\n  FROM orders GROUP BY month\n)\nSELECT month, revenue,\n  ROUND(revenue - ({1}), 2) AS delta\nFROM m ORDER BY month;",
      chips: [
        "LAG(revenue) OVER (ORDER BY month)",
        "LEAD(revenue) OVER (ORDER BY month)",
        "LAG(revenue)",
        "LAG(revenue) OVER (ORDER BY month DESC)",
        "FIRST_VALUE(revenue) OVER (ORDER BY month)",
      ],
      answers: ["LAG(revenue) OVER (ORDER BY month)"],
      why: "LAG peeks one row BACK in the ordered window — previous month's revenue on the current row, so revenue - that is the delta. Without OVER(ORDER BY month) there is no 'previous' — a window needs its order.",
      notes: [
        {
          slot: 1,
          why: "LEAD looks FORWARD — revenue - next-month revenue gives a delta with the sign flipped. The ask is this month minus last month, which is LAG.",
        },
      ],
    },
    {
      id: "l60-f2",
      prompt:
        "For every order, show the customer's PREVIOUS order date on the same row — the gap-to-next-purchase input. Fill the window call (two arguments: the column and the offset).",
      template:
        "SELECT customer_id, created_at,\n  {1} OVER (PARTITION BY customer_id ORDER BY created_at, id) AS prev_at\nFROM orders\nORDER BY customer_id, created_at, id;",
      chips: [
        "LAG(created_at, 1)",
        "LEAD(created_at, 1)",
        "LAG(created_at, 2)",
        "FIRST_VALUE(created_at)",
        "LAG(id, 1)",
      ],
      answers: ["LAG(created_at, 1)"],
      why: "LAG(created_at, 1) = one row back within the customer's chronological stage: the previous order date. The second argument is the offset — 1 means the immediately previous row.",
      notes: [
        {
          slot: 1,
          why: "An offset of 2 skips a row — that's the date from TWO orders ago, not the previous one. Gap-to-next-purchase needs the neighbor.",
        },
      ],
    },
    {
      id: "l60-f3",
      prompt:
        "Each order carries the previous order's total — and the FIRST order must show 0 instead of NULL. Fill the three-argument window call.",
      template:
        "SELECT id, total,\n  {1} OVER (ORDER BY created_at, id) AS prev_total\nFROM orders\nORDER BY id;",
      chips: [
        "LAG(total, 1, 0)",
        "LAG(total)",
        "LEAD(total, 1, 0)",
        "LAG(total, 0, 1)",
        "COALESCE(LAG(total), 0)",
      ],
      answers: ["LAG(total, 1, 0)"],
      why: "LAG's third argument is the default for rows with no previous — the first row gets 0, not NULL. LAG(column, offset, default): all three knobs in one call.",
      notes: [
        {
          slot: 1,
          why: "Two-argument LAG defaults to NULL on the first row — the whole ask was to replace that NULL with 0. The third argument exists exactly for this.",
        },
      ],
    },
  ],

  // Lesson 61 — Windows VII: frames in full
  61: [
    {
      id: "l61-f1",
      prompt:
        "The bank-statement ledger: each order posts separately EVEN when two orders share a date. Fill the explicit frame that pins row-by-row accumulation.",
      template:
        "SELECT id, created_at, total,\n  ROUND(SUM(total) OVER (ORDER BY created_at, id\n    {1}), 2) AS run\nFROM orders\nORDER BY created_at, id;",
      chips: [
        "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW",
        "ROWS UNBOUNDED PRECEDING",
        "ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING",
      ],
      answers: ["ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW"],
      why: "ROWS frames count physical rows, so same-date orders post one at a time; the default RANGE folds value-ties into one frame and posts them together. Statement semantics need ROWS.",
      notes: [
        {
          slot: 1,
          why: "RANGE compares VALUES — all orders sharing created_at join the frame and sum together. The ledger must post row by row, so the frame unit is ROWS.",
        },
      ],
    },
    {
      id: "l61-f2",
      prompt:
        "The 7-order rolling revenue: each row sums itself plus the six orders behind it (chronological rn). Fill the frame.",
      template:
        "WITH n AS (\n  SELECT id, created_at, total,\n    ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn\n  FROM orders\n)\nSELECT rn, created_at,\n  ROUND(SUM(total) OVER (ORDER BY rn\n    {1}), 2) AS roll7\nFROM n ORDER BY rn;",
      chips: [
        "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW",
        "ROWS BETWEEN 7 PRECEDING AND CURRENT ROW",
        "ROWS BETWEEN 6 PRECEDING AND 1 FOLLOWING",
        "ROWS BETWEEN CURRENT ROW AND 6 FOLLOWING",
        "ROWS BETWEEN 6 FOLLOWING AND CURRENT ROW",
      ],
      answers: ["ROWS BETWEEN 6 PRECEDING AND CURRENT ROW"],
      why: "This row + six back = seven rows: 6 PRECEDING through CURRENT ROW. Off-by-one is the classic frame bug — the current row is always part of its own window.",
      notes: [
        {
          slot: 1,
          why: "7 PRECEDING reaches EIGHT rows back including current — that's a 7-before window, not a 7-wide one. Count the whole span: six behind plus the current row.",
        },
      ],
    },
    {
      id: "l61-f3",
      prompt:
        "The LAST_VALUE trap, defused: each order should show its customer's LATEST order total so far — which needs a frame that reaches the END of the stage. Fill it.",
      template:
        "SELECT customer_id, created_at, total,\n  LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id\n    {1}) AS latest_so_far\nFROM orders\nORDER BY customer_id, created_at, id;",
      chips: [
        "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING",
        "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING",
        "ROWS UNBOUNDED FOLLOWING",
      ],
      answers: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING"],
      why: "The default frame ends at CURRENT ROW, where LAST_VALUE is just... the current row — the trap. Stretching the frame to UNBOUNDED FOLLOWING lets LAST_VALUE actually see the stage's end.",
      notes: [
        {
          slot: 1,
          why: "Ending at CURRENT ROW makes LAST_VALUE(total) equal total — the function can never look past the frame edge. The trap IS the default frame; widen it to UNBOUNDED FOLLOWING.",
        },
      ],
    },
  ],

  // Lesson 62 — Windows VIII: tiles, shares & relative standing
  62: [
    {
      id: "l62-f1",
      prompt:
        "Deal the 103 orders into four revenue buckets by total, roughly equal in count: fill the distribution function (its argument is the tile count).",
      template:
        "SELECT id, total,\n  {1} OVER (ORDER BY total, id) AS quartile\nFROM orders\nORDER BY id;",
      chips: ["NTILE(4)", "QUARTILE(4)", "NTILE(4.0)", "ROUND(4)", "NTILE"],
      answers: ["NTILE(4)"],
      why: "NTILE(4) deals the ordered rows into four near-equal buckets — the SQL quartile. There is no QUARTILE function in SQL; the tile count is NTILE's argument.",
      notes: [
        { slot: 1, why: "NTILE takes its tile count in parentheses and NTILE without an argument is a syntax error — the function is NTILE(n), and n = 4 gives quartiles." },
      ],
    },
    {
      id: "l62-f2",
      prompt:
        "Relative standing by revenue: each order's percentile rank — (rank - 1) / (rows - 1) — as a 0..1 fraction. Fill the distribution window function.",
      template:
        "SELECT id, total,\n  ROUND({1}() OVER (ORDER BY total, id), 4) AS pctile\nFROM orders\nORDER BY id;",
      chips: ["PERCENT_RANK", "CUME_DIST", "RANK", "PERCENTILE_RANK", "NTILE"],
      answers: ["PERCENT_RANK"],
      why: "PERCENT_RANK is the (rank − 1)/(rows − 1) contract: the cheapest row scores 0.0, the richest approaches 1.0. CUME_DIST is the other curve — fraction of rows at or below — a different promise.",
      notes: [
        { slot: 1, why: "CUME_DIST counts the share of rows at or BELOW the current one (its peers included) — it starts above 0 and can hit exactly 1. PERCENT_RANK starts at 0 for the first row." },
      ],
    },
    {
      id: "l62-f3",
      prompt:
        "Concentration read: for each order, the fraction of orders with total at or below this one — peers INCLUDED (values tie together). Fill the function.",
      template:
        "SELECT id, total,\n  ROUND({1}() OVER (ORDER BY total), 4) AS cum\nFROM orders\nORDER BY id;",
      chips: ["CUME_DIST", "PERCENT_RANK", "ROW_NUMBER", "CUM_DIST", "PERCENTILE_CONT"],
      answers: ["CUME_DIST"],
      why: "CUME_DIST is the ≤-share with peers included — its denominator is the row count, and equal totals share one value. That peers-included behavior is exactly what distribution reads want.",
      notes: [
        { slot: 1, why: "PERCENT_RANK divides by (rows − 1) and gives the cheapest row 0 — a rank-based curve. The at-or-below share including peers is CUME_DIST." },
      ],
    },
  ],

  // Lesson 63 — Windows IX: the pattern library
  63: [
    {
      id: "l63-f1",
      prompt:
        "Gaps-and-islands, step one — flag a session start: with each order's previous order date in `prev_at`, mark rows whose purchase day is NOT consecutive with the previous one. Fill the test.",
      template:
        "WITH s AS (\n  SELECT created_at,\n    LAG(created_at) OVER (ORDER BY created_at) AS prev_at\n  FROM (SELECT DISTINCT created_at FROM orders)\n)\nSELECT created_at,\n  CASE WHEN {1} THEN 1 ELSE 0 END AS is_gap_start\nFROM s\nORDER BY created_at;",
      chips: [
        "julianday(created_at) - julianday(prev_at) > 1",
        "julianday(created_at) - julianday(prev_at) >= 1",
        "created_at != prev_at",
        "julianday(prev_at) - julianday(created_at) > 1",
        "prev_at IS NULL",
      ],
      answers: ["julianday(created_at) - julianday(prev_at) > 1"],
      why: "Consecutive days differ by exactly 1 in julianday terms — a gap means strictly MORE than one day. Every distinct-date chain starts with this test; the 1-flags then become island boundaries.",
      notes: [
        { slot: 1, why: ">= 1 flags EVERY day — consecutive days differ by exactly 1, so the test must be strictly greater than 1 to mean 'a real gap'." },
      ],
    },
    {
      id: "l63-f2",
      prompt:
        "Islands, step two — the group id: with rows numbered by id (`rn`), fill the classic expression that yields ONE constant per status run. Subtract within-partition numbering from global numbering.",
      template:
        "WITH s AS (\n  SELECT id, status,\n    ROW_NUMBER() OVER (ORDER BY id) AS rn\n  FROM orders\n)\nSELECT id, status,\n  {1} AS grp\nFROM s\nORDER BY id;",
      chips: [
        "rn - ROW_NUMBER() OVER (PARTITION BY status ORDER BY id)",
        "ROW_NUMBER() OVER (PARTITION BY status ORDER BY id) - rn",
        "rn - rn",
        "rn % 2",
        "COUNT(*) OVER (PARTITION BY status)",
      ],
      answers: ["rn - ROW_NUMBER() OVER (PARTITION BY status ORDER BY id)"],
      why: "Global position minus position-within-run is constant for the whole run — the trick that turns streaks into groupable ids. Sign matters: the partition counter grows slower, so global minus local stays flat inside an island.",
      notes: [
        { slot: 1, why: "Flipping the subtraction gives a constant per run too — but NEGATIVE and different per status, which breaks grouping. The canonical form is rn minus the partition counter." },
      ],
    },
    {
      id: "l63-f3",
      prompt:
        "Year-over-year revenue growth: fill the window call that puts LAST YEAR's same-month revenue on each row (partition by year, order by month inside it).",
      template:
        "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 4) AS year, SUBSTR(created_at, 1, 7) AS month,\n    SUM(total) AS revenue\n  FROM orders GROUP BY year, month\n)\nSELECT year, month, revenue,\n  ({1}) AS prev_year_rev\nFROM m\nORDER BY month;",
      chips: [
        "LAG(revenue) OVER (PARTITION BY year ORDER BY month)",
        "LAG(revenue) OVER (ORDER BY month)",
        "LEAD(revenue) OVER (PARTITION BY year ORDER BY month)",
        "LAG(revenue, 12)",
        "SUM(revenue) OVER (PARTITION BY year)",
      ],
      answers: ["LAG(revenue) OVER (PARTITION BY year ORDER BY month)"],
      why: "Each year is its own stage and months run inside it — LAG hands each row its stage-previous value. With one year of seed data every first-month row shows NULL, which is the honest 'no prior year' answer.",
      notes: [
        { slot: 1, why: "ORDER BY month without the partition chains ALL months into one sequence — December would peek at last month, not last year. The partition is what makes 'previous' mean previous YEAR." },
      ],
    },
  ],
};
