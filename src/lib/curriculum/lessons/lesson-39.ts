import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson39: Lesson = {
  id: "lesson-39",
  num: 39,
  title: "Case study — the ops calendar",
  blurb: "Module 5's toolkit under one brief: month buckets, a running revenue line, shipping speed and order rhythm",
  minutes: 17,
  blocks: [
    {
      kind: "p",
      text: "Operations wants the calendar view: *'How do orders distribute across months? Where does cumulative revenue stand each month? How fast do we actually ship? What's the rhythm between one order and the next — and how do our 103 orders split into spend quartiles?'* Every one of those is Module 5: dates sliced into sortable buckets, window functions that measure each row against its neighbors, and the scalar toolkit doing the date math.",
    },
    {
      kind: "bullets",
      items: [
        "**14 month buckets** — '%Y-%m' turns timestamps into sortable keys; counts swing between 6 and 9 with February 2024 and September 2024 tied at the top.",
        "**The running line** — monthly revenue (3,731.97 in January) accumulating to the store's full 34,833.28 by the final bucket.",
        "**Shipping speed** — 2.98 days average over the 82 shipped orders; the 21 unshipped rows exit silently because julianday(NULL) is NULL and AVG skips NULLs.",
        "**Order rhythm** — LAG puts each of Alice's orders next to its predecessor: NULL first, then gaps of 20, 29, 5, 9, 13 days…",
        "**Quartiles** — NTILE(4) deals 103 orders into 26/26/26/25; the priciest quarter is bucket 4.",
      ],
    },
    { kind: "diagram", figure: "l39-ops-calendar" },
    {
      kind: "warn",
      text: "Window over aggregate, in one line, is where typo bugs breed: `SUM(SUM(total)) OVER (…)`. It works — the inner SUM is the GROUP BY aggregate, the outer SUM is the window — but the readable form stages the monthly sums first, then windows over the stage. Same numbers, reviewable SQL.",
    },
    {
      kind: "tip",
      text: "Every window needs an explicit ORDER BY to be meaningful — and a deterministic tie-breaker (id, or the bucket key) so each row's 'previous' and 'next' are stable across runs.",
    },
  ],
  mcqs: [
    {
      id: "l39-q1",
      prompt: "Why bucket months as `strftime('%Y-%m', …)` instead of the month number alone?",
      choices: [
        "Month numbers can't be grouped",
        "'%Y-%m' keeps year AND zero-padded month — 14 sortable, unique buckets instead of 12 numbers that merge Jan-2024 with Jan-2025",
        "It renders faster",
        "%m is the only valid format code",
      ],
      answer: 1,
      why: "The store runs Jan 2024 → Feb 2025: fourteen distinct year-months. A bare month number would collapse 2024-01's 8 orders into the same bucket as 2025-01's 6 — wrong totals, and '01' vs '10' would even sort wrong unpadded.",
      notes: [
        { choice: 2, why: "Readability is a side effect — the correctness story is uniqueness across years and lexicographic sortability. '%Y-%m' delivers both in one key." },
      ],
    },
    {
      id: "l39-q2",
      prompt: "Monthly revenue then a running total — why stage the monthly sums in a derived table before applying the window?",
      choices: [
        "Windows can't reference SUM at all",
        "Staging separates the two aggregations: GROUP BY computes one row per month, the window then accumulates those 14 rows — readable and debuggable",
        "The derived table caches results for speed",
        "ORDER BY is illegal on grouped queries",
      ],
      answer: 1,
      why: "The compact `SUM(SUM(total)) OVER (…)` runs the group aggregate inside the window function — legal but dense. `SUM(rev) OVER (…)` over a staged table says exactly what it means: accumulate the monthly revenue.",
      notes: [
        { choice: 0, why: "They can — the nested form proves it. The staging is about the human reading it next quarter, not about what the engine permits." },
      ],
    },
    {
      id: "l39-q3",
      prompt: "Alice's first order shows gap_days = NULL in the LAG report. What does that NULL mean, and what's the honest way to display it?",
      choices: [
        "A bug — LAG should return 0 at the start",
        "'No previous order exists' — leave it NULL, or COALESCE it to a label; zero would fabricate a same-day repeat",
        "An error — the query must filter it out",
        "It means the gap is unknown but probably small",
      ],
      answer: 1,
      why: "LAG's first row has nothing behind it: NULL is the truthful answer. Substituting 0 would invent a 0-day gap — a fake data point in a rhythm report. Display can dress it up ('—' or 'first order'); the data stays NULL.",
      notes: [
        { choice: 2, why: "Filtering the NULL row would silently drop Alice's first order from the calendar — the row itself is real even when its gap isn't computable." },
      ],
    },
    {
      id: "l39-q4",
      prompt: "`NTILE(4) OVER (ORDER BY total)` splits 103 orders 26/26/26/25. Which bucket holds the priciest orders?",
      choices: [
        "Bucket 1 — NTILE ranks high-to-low",
        "Bucket 4 — the ordering is ascending, so the last tile collects the top spenders",
        "They're spread evenly by design",
        "Whichever bucket the largest order lands in — it's random",
      ],
      answer: 1,
      why: "ORDER BY total ASC deals cheapest-first, so tiles fill upward: bucket 1 is the budget quartile and bucket 4 — the final 25 rows — is the premium one. Flip the ordering and the quartiles mirror.",
      notes: [
        { choice: 0, why: "That would be ORDER BY total DESC. NTILE follows whatever order you give it — the brief's quartile cut must state its direction." },
      ],
    },
  ],
  problems: [
    {
      id: "l39-p1",
      title: "Months on the board",
      brief: "Order counts by month: `mon` (like '2024-01') and `n` — all **14 buckets**, calendar order.",
      hints: [
        "Slice created_at into a sortable year-month key, bucket on it, count, sort by the key.",
        "Shape: SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon ORDER BY mon;",
      ],
      difficulty: "easy",
      solution: "SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n\nFROM orders\nGROUP BY mon\nORDER BY mon;",
      mistakes: [
        { test: "'%m'\\s*\\)|'%M'", message: "A bare month number merges Jan-2024 with Jan-2025 — the '%Y-%m' key is what keeps 14 buckets unique and sortable." },
        { test: "\\border\\s+by\\s+n\\b", message: "Count order answers 'which month is busiest' — the calendar view sorts by the month key itself." },
        { test: "\\bdistinct\\b", message: "No dedupe — every order must land in exactly one bucket; DISTINCT would be discarding real orders." },
      ],
      expected: EXPECTED["l39-p1"],
      ordered: true,
    },
    {
      id: "l39-p2",
      title: "Revenue momentum",
      brief: "The running line: per month, `mon`, `revenue` (2 decimals) and `running` (2 decimals) — the cumulative revenue through that month. Stage the monthly sums, then window over the stage. 14 rows, calendar order.",
      hints: [
        "Inner query: GROUP BY month, SUM(total). Outer: SUM(rev) OVER (ORDER BY mon) builds the accumulation.",
        "Shape: SELECT mon, ROUND(rev, 2) AS revenue, ROUND(SUM(rev) OVER (ORDER BY mon), 2) AS running FROM (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon) ORDER BY mon;",
      ],
      difficulty: "hard",
      solution: "SELECT mon, ROUND(rev, 2) AS revenue,\n  ROUND(SUM(rev) OVER (ORDER BY mon), 2) AS running\nFROM (\n  SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev\n  FROM orders\n  GROUP BY mon\n)\nORDER BY mon;",
      mistakes: [
        { test: "\\bsum\\s*\\(\\s*total\\s*\\)\\s+as\\s+running", message: "SUM(total) without OVER is the plain monthly total — the running line needs the window: SUM(rev) OVER (ORDER BY mon)." },
        { test: "over\\s*\\(\\s*partition\\s+by", message: "PARTITION BY would restart the accumulation every partition — the running total is one continuous line across all 14 months." },
        { test: "\\bgroup\\s+by\\b[^;]*over|over[\\s\\S]*\\bgroup\\s+by\\s+mon\\s*\\)\\s*$", message: "Mixing GROUP BY and the window in one level works but hides both aggregations — stage the months first, then accumulate; that's the deliverable's shape." },
      ],
      expected: EXPECTED["l39-p2"],
      ordered: true,
    },
    {
      id: "l39-p3",
      title: "Shipping speed",
      brief: "How fast do we ship? One row: `avg_ship_days` (2 decimals) and `shipped_orders` — the mean of julianday(shipped_at) − julianday(created_at) over the orders that actually shipped.",
      hints: [
        "Date arithmetic is julianday subtraction; the guard `shipped_at IS NOT NULL` makes the intent explicit even though AVG skips NULLs anyway.",
        "Shape: SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) AS avg_ship_days, COUNT(*) AS shipped_orders FROM orders WHERE shipped_at IS NOT NULL;",
      ],
      difficulty: "easy",
      solution: "SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) AS avg_ship_days,\n  COUNT(*) AS shipped_orders\nFROM orders\nWHERE shipped_at IS NOT NULL;",
      mistakes: [
        { test: "\\bcreated_at\\s*-\\s*shipped_at\\b|created_at\\)\\s*-\\s*julianday\\s*\\(\\s*shipped", message: "Reversed subtraction — ship date minus order date gives positive days; backwards yields negatives and a nonsense average." },
        { test: "shipped_orders\\s+from\\s+orders\\s*;", message: "COUNT(*) counts all 103 — the denominator is the 82 rows that actually have a ship date. Keep the IS NOT NULL guard inside the FROM...WHERE." },
        { test: "\\bwhere\\s+status", message: "Status is a proxy, not the fact — shipped_at's presence IS the shipping record. A cancelled order can carry a ship scan; a pending one can't." },
      ],
      expected: EXPECTED["l39-p3"],
    },
    {
      id: "l39-p4",
      title: "Alice's rhythm",
      brief: "The gap between Alice Chen's (customer_id 1) consecutive orders: `order_date` and `gap_days` — NULL for the first order, whole days after. Calendar order.",
      hints: [
        "LAG(julianday(created_at)) fetches the previous order's day-number; subtract and cast to integer days. Order by created_at (with id as tie-breaker).",
        "Shape: SELECT strftime('%Y-%m-%d', created_at) AS order_date, CAST(julianday(created_at) - LAG(julianday(created_at)) OVER (ORDER BY created_at, id) AS INTEGER) AS gap_days FROM orders WHERE customer_id = 1 ORDER BY created_at, id;",
      ],
      difficulty: "hard",
      solution: "SELECT strftime('%Y-%m-%d', created_at) AS order_date,\n  CAST(julianday(created_at) - LAG(julianday(created_at)) OVER (ORDER BY created_at, id) AS INTEGER) AS gap_days\nFROM orders\nWHERE customer_id = 1\nORDER BY created_at, id;",
      mistakes: [
        { test: "\\blead\\s*\\(", message: "LEAD measures to the NEXT order — the rhythm line is backwards vs. the ask. LAG pairs each order with its predecessor." },
        { test: "gap_days\\s*=\\s*0|coalesce\\s*\\(\\s*[\\s\\S]*gap[\\s\\S]*,\\s*0", message: "Coercing the first NULL gap to 0 fabricates a same-day repeat. The NULL IS the 'first order' signal — leave it honest." },
        { test: "\\bwhere\\s+name\\s*=\\s*'alice", message: "The filter keys on customer_id = 1 — joining customers for a name would work, but the brief pinned the id for you." },
      ],
      expected: EXPECTED["l39-p4"],
      ordered: true,
    },
    {
      id: "l39-p5",
      title: "Spend quartiles",
      brief: "Split the 103 orders into four tiles by total: output `ntile` (1–4) and `orders_in_tile`. Expect 26/26/26/25.",
      hints: [
        "NTILE(4) OVER (ORDER BY total) labels every row; the outer query counts labels.",
        "Shape: SELECT ntile, COUNT(*) AS orders_in_tile FROM (SELECT NTILE(4) OVER (ORDER BY total) AS ntile FROM orders) GROUP BY ntile ORDER BY ntile;",
      ],
      difficulty: "medium",
      solution: "SELECT ntile, COUNT(*) AS orders_in_tile\nFROM (\n  SELECT NTILE(4) OVER (ORDER BY total) AS ntile\n  FROM orders\n)\nGROUP BY ntile\nORDER BY ntile;",
      mistakes: [
        { test: "\\blimit\\s+26\\b", message: "LIMIT chops 26 rows off the top — it labels nothing. NTILE is the dealer that marks every row's tile." },
        { test: "ntile\\s*\\(\\s*103", message: "NTILE(103) makes 103 tiles of one row — the argument is the NUMBER OF TILES (4), not the row count." },
        { test: "\\bwhere\\s+ntile", message: "The tile label doesn't exist until the window runs — filter it outside, in the wrapping query (same staging rule as ROW_NUMBER)." },
      ],
      expected: EXPECTED["l39-p5"],
      ordered: true,
    },
  ],
  takeaway: "The calendar brief is pure Module 5: '%Y-%m' builds sortable buckets, staged sums + OVER build the running line, julianday does the date math, LAG measures rhythm, NTILE splits the distribution.",
};
