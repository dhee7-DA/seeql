import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson55: Lesson = {
  id: "lesson-55",
  num: 55,
  title: "MoM growth — LAG does the trend",
  blurb: "Bucket revenue by month, let LAG fetch last month into this row, and the growth rate falls out — plus the moving average that tames a lumpy line",
  minutes: 15,
  blocks: [
    {
      kind: "p",
      text: "Every dashboard's first card is the same question: *up or down versus last month?* The store's billing history is 13 months deep (2024-02 → 2025-02) — and because invoicing is lumpy (two to four invoices a month), the line whipsaws wildly. That volatility is exactly why this lesson teaches THREE numbers per month: the revenue, the **MoM growth %** (via `LAG`), and the **3-month moving average** (via a window frame). Together they tell the truth that any one of them alone hides.",
    },
    { kind: "h", text: "The bucket, then the peek backwards" },
    {
      kind: "code",
      caption: "Monthly revenue, staged in a CTE — lesson 30's skeleton with a status filter",
      sql: `WITH monthly AS (
  SELECT strftime('%Y-%m', issued_on) AS mon,
         SUM(amount_cents) AS rev
  FROM invoices
  WHERE status != 'void'
  GROUP BY mon
)
SELECT mon, ROUND(rev / 100.0, 2) AS rev,
       ROUND(LAG(rev) OVER (ORDER BY mon) / 100.0, 2) AS prev
FROM monthly
ORDER BY mon;
-- 2024-02: 7003.0 · prev NULL   (nothing before February)
-- 2024-03: 5009.0 · prev 7003.0`,
    },
    {
      kind: "bullets",
      items: [
        "`LAG(rev) OVER (ORDER BY mon)` — *the previous row's value, pulled into this row*. No self-join, no correlated subquery: one function, zero chance of missing a month.",
        "The first month's `prev` is **NULL** — there IS no February-before-February. Every growth calculation downstream must survive that NULL.",
        "The `status != 'void'` filter is doing quiet heroics: July's face total is $3,896.00, but $925.00 of it was voided. One forgotten filter and the trend bends around fake money.",
      ],
    },
    { kind: "diagram", figure: "fin4-mom-bridge" },
    { kind: "h", text: "The growth rate" },
    {
      kind: "code",
      caption: "One more layer: (this − last) / last, as a percent",
      sql: `WITH monthly AS ( /* …as above… */ ),
peeked AS (
  SELECT mon, rev,
         LAG(rev) OVER (ORDER BY mon) AS prev
  FROM monthly
)
SELECT mon,
  ROUND(rev / 100.0, 2) AS rev,
  ROUND(100.0 * (rev - prev) / prev, 1) AS pct
FROM peeked
ORDER BY mon;
-- 2024-03: −28.5   2024-08: +144.9   2025-02: −26.8`,
    },
    {
      kind: "bullets",
      items: [
        "The denominator is `prev` — growth is measured against WHERE YOU WERE, not where you are. Swap it and every percentage silently means something else.",
        "Layer, don't nest: bucket in one CTE, peek in the next, compute in the third. The window needs the aggregates *finished* before it walks rows — staging gives it that, and reads top-down like lesson 28 promised.",
        "February 2024's `pct` is NULL (no prev) — the honest answer to 'growth vs what?'.",
      ],
    },
    {
      kind: "warn",
      text: "Small samples, loud percentages. August's +144.9% is real — but it's two invoices outweighing one. A percentage of a two-invoice month is a headline, not a trend. This is why the moving average exists.",
    },
    { kind: "h", text: "The moving average — the trend under the noise" },
    {
      kind: "code",
      caption: "AVG over a sliding 3-row frame: this month and the two before it",
      sql: `SELECT mon,
  ROUND(rev / 100.0, 2) AS rev,
  ROUND(AVG(rev) OVER (
    ORDER BY mon
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) / 100.0, 2) AS ma3
FROM monthly;
-- 2024-07: rev 2968.0 · ma3 4391.33   ← trough, smoothed
-- 2025-01: rev 11085.0 · ma3 9404.0   ← peak, smoothed`,
    },
    {
      kind: "bullets",
      items: [
        "`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` — an explicit **frame**. Lesson 32's running total used the implicit everything-so-far frame; this one deliberately clips to a 3-row window that *slides*.",
        "The first two months have partial frames (one row, then two) — SQLite averages what exists. Some warehouses prefer NULL until the frame is full; both are defensible, pick and document one.",
        "Read the pair, not either alone: revenue says 'January exploded to $11,085'; ma3 says 'the underlying line crossed $9,400 and is still climbing'. Revenue is the event; the moving average is the story.",
      ],
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "LAG, LEAD and window frames are first-class since SQLite 3.25/3.28 — the store's engine handles all of it, including named windows if the frame gets reused.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Identical vocabulary — plus window-function sugar like LAG(rev, 12) for year-over-year in one hop, and RANGE INTERVAL frames for calendar-anchored windows on true date types.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL 8 matches the syntax. Pre-8, MoM meant a self-join on month keys with a two-month offset — the query this lesson's whole CTE stack replaces.",
    },
    {
      kind: "tip",
      text: "Bucket → peek (LAG) → compute (pct) → smooth (framed AVG). Four layers, each one SELECT, each testable alone. When the board asks 'are we growing?', this stack is the answer — and the void filter is why it's honest.",
    },
  ],
  mcqs: [
    {
      id: "l55-q1",
      prompt: "What does `LAG(rev) OVER (ORDER BY mon)` produce for the FIRST month in the walk?",
      choices: ["0 — the start value", "NULL — there is no previous row", "It repeats the first month's rev", "A syntax error"],
      answer: 1,
      why: "LAG peeks one row back; at the top of the walk there's nothing there. NULL is the honest answer — and the reason every downstream growth calc must be NULL-safe.",
      notes: [
        { choice: 0, why: "A 0 would fabricate −100% growth for February 2024 — worse than no number. LAG(rev, 1, 0) COULD default it, but honest NULLs beat fake zeros in finance." },
      ],
    },
    {
      id: "l55-q2",
      prompt: "Why is revenue bucketed in a CTE before LAG walks it, rather than one flat SELECT?",
      choices: [
        "CTEs run faster than subqueries",
        "The window needs finished monthly rows to walk — staging the GROUP BY first gives it one clean, ordered sequence",
        "LAG can't appear in the same query as SUM",
        "SQLite forbids nesting more than one level",
      ],
      answer: 1,
      why: "Layering: aggregate first (one row per month), then peek, then compute rates. Each layer does one job — and the top-down read is lesson 28's readability bonus.",
      notes: [
        { choice: 2, why: "SQLite actually allows LAG(SUM(x)) OVER (…) in one level — legal, and unreadable. The CTE stack is about clarity and testability, not permission." },
      ],
    },
    {
      id: "l55-q3",
      prompt: "Growth % is `100.0 * (rev - prev) / prev`. What silently changes if the denominator becomes `rev`?",
      choices: [
        "Nothing — algebraically identical",
        "Every percentage shrinks by exactly half",
        "The numbers become 'how much of THIS month was new' — a different, smaller figure that understates swings",
        "Negative months error out",
      ],
      answer: 2,
      why: "(rev − prev)/rev answers 'what share of this month is new money' — always smaller for growth, always distorted for declines. The denominator IS the meaning; growth is measured against where you were.",
      notes: [
        { choice: 0, why: "(7003 − 5009)/5009 = +39.9% but /7003 = +28.5% — same two numbers, different claims. The denominator decides which claim you're making." },
      ],
    },
    {
      id: "l55-q4",
      prompt: "July 2024's face invoices total $3,896.00, but $925.00 of that was VOIDED. What does the missing `status != 'void'` filter do to the July datapoint?",
      choices: [
        "Nothing — void invoices have no amount",
        "Overstates July by $925.00, softening the trough from $2,968.00 to $3,896.00 and warping both neighbors' growth rates",
        "Understates July by $925.00",
        "Removes July from the walk",
      ],
      answer: 1,
      why: "One phantom invoice, three corrupted numbers: July's level, June's decline (−49.6% becomes milder), and August's +144.9% explosion (smaller). Void filtering isn't housekeeping — it's trend integrity.",
      notes: [
        { choice: 3, why: "July still exists — real invoices shipped that month. The filter changes its VALUE, not its presence." },
      ],
    },
    {
      id: "l55-q5",
      prompt: "August 2024 shows +144.9% MoM. What's the statistically honest reading?",
      choices: [
        "The business nearly tripled — raise the forecast",
        "A percentage over a two-invoice month ($2,968 base) — real, but a headline, not a trend; check the moving average",
        "A data error — growth can't exceed 100%",
        "August must have a data entry mistake",
      ],
      answer: 1,
      why: "Small denominators manufacture loud percentages. The ma3 for August is $5,375.33 — up, but nothing like triple. Volatility is the small-n signature; the frame average is the antidote.",
      notes: [
        { choice: 2, why: "Growth can exceed 100% whenever the base is smaller than the gain — July→August nearly did exactly that. Percentages have no ceiling; they have context." },
      ],
    },
    {
      id: "l55-q6",
      prompt: "`AVG(rev) OVER (ORDER BY mon ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` for November 2024 (rev 8297; Sept 5801, Oct 6187) returns…",
      choices: ["8297 — the current month only", "23314 — the frame's raw sum", "6761.67 — the average of the three", "4148 — half"],
      answer: 2,
      why: "The frame gathers this month and the two before it — (5801 + 6187 + 8297)/3 = 6761.67. That's the sliding window doing its one job: three datapoints, one steadier number.",
      notes: [
        { choice: 1, why: "23314 is the frame's SUM, not its AVG — easy to produce, embarrassing to present. The function name still governs inside the frame." },
      ],
    },
    {
      id: "l55-q7",
      prompt: "Why `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` instead of the implicit frame used for running totals in lesson 32?",
      choices: [
        "Implicit frames don't exist in SQLite",
        "The implicit frame is everything-from-the-start — a running total, not a sliding 3-month average; the explicit frame clips the window to exactly three rows",
        "ROWS is faster than RANGE",
        "Moving averages require PARTITION BY",
      ],
      answer: 1,
      why: "Unframed, AVG would average the entire history so far — a to-date figure that barely moves. The 2-PRECEDING clip is what makes it a *moving* average: the window slides, history drops off the back.",
      notes: [
        { choice: 2, why: "Performance is irrelevant at 13 rows. The choice is semantic: what does each row's window CONTAIN." },
      ],
    },
    {
      id: "l55-q8",
      prompt: "Four straight growth months end the series (Oct +6.7, Nov +34.1, Dec +6.4, Jan +25.5), then Feb falls −26.8%. What does the MA3 say about February that the raw number hides?",
      choices: [
        "ma3 for February is the highest in the series (~9342) — the line is still near its peak despite the drop",
        "ma3 turns negative",
        "ma3 equals February's own rev",
        "ma3 can't be computed for the last month",
      ],
      answer: 0,
      why: "(8830 + 11085 + 8112)/3 = 9342.33 — the second-highest frame in the series. One bad month bends the raw line; the frame shows the story barely flinched. Trend ≠ datapoint.",
      notes: [
        { choice: 1, why: "Averages of positive revenues can't go negative — and one month of −26.8% after four strong months doesn't unseat a nine-thousand-dollar baseline." },
      ],
    },
    {
      id: "l55-q9",
      prompt: "Before LAG existed, MoM meant joining the monthly CTE to ITSELF with mon = previous month's mon. What does LAG replace?",
      choices: [
        "The GROUP BY",
        "The self-join — and its two failure modes: months with no predecessor vanish, and a typo'd join key silently duplicates rows",
        "The WHERE clause",
        "The need for monthly buckets",
      ],
      answer: 1,
      why: "The self-join needed a calendar of month keys to survive gaps, and JOIN discipline to avoid fan-out. LAG walks the rows you already have — missing months just produce NULL peeks.",
      notes: [
        { choice: 3, why: "LAG needs the buckets too — it's a window over ROWS. It replaces the pairing mechanism, not the bucketing." },
      ],
    },
    {
      id: "l55-q10",
      prompt: "Which single LAG call fetches 'same month, last year' from a monthly walk?",
      choices: [
        "LAG(rev) OVER (ORDER BY mon) — twelve times",
        "LAG(rev, 12) OVER (ORDER BY mon) — the second argument is the offset in rows",
        "LAG(rev, '1 year') OVER (ORDER BY mon)",
        "LEAD(rev, −12) OVER (ORDER BY mon)",
      ],
      answer: 1,
      why: "LAG's signature is LAG(expr, offset, default). Twelve monthly rows back = one year. (LEAD with a negative offset errors — LEAD only looks forward; use LAG.)",
      notes: [
        { choice: 2, why: "Offsets are ROW counts, not intervals — the window has no idea months are calendar objects. Twelve rows IS the year." },
      ],
    },
    {
      id: "l55-q11",
      prompt: "The pct column is NULL for 2024-02. The dashboard coerces it to 0. Why is that lie dangerous?",
      choices: [
        "It isn't — 0 is the natural start value",
        "February 2024 becomes indistinguishable from a genuinely flat month — and any AVG of pct gets dragged by a fabricated datapoint",
        "NULLs crash charts",
        "0 and NULL sort differently",
      ],
      answer: 1,
      why: "'No growth measured' and 'measured: zero growth' are different facts. Averages and streak logic treat the fake 0 as evidence. NULL survives honestly through the pipeline; 0 forges it.",
      notes: [
        { choice: 3, why: "Sorting is cosmetic. The damage is statistical: a fabricated zero is a datapoint that never happened." },
      ],
    },
  ],
  problems: [
    {
      id: "l55-p1",
      title: "The peek backwards",
      brief: "Monthly revenue (void excluded) with last month beside it: `mon`, `rev`, `prev` — all ROUND(…/100.0, 2). Thirteen rows, chronological; February 2024's prev is NULL.",
      hints: [
        "Stage the monthly GROUP BY in a CTE, then walk it with LAG(rev) OVER (ORDER BY mon). Convert to dollars in the outer SELECT.",
        "Shape: WITH monthly AS (SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents) AS rev FROM invoices WHERE status != 'void' GROUP BY mon) SELECT mon, ROUND(rev/100.0, 2) AS rev, ROUND(LAG(rev) OVER (ORDER BY mon)/100.0, 2) AS prev FROM monthly ORDER BY mon;",
      ],
      difficulty: "medium",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', issued_on) AS mon,\n    SUM(amount_cents) AS rev\n  FROM invoices\n  WHERE status != 'void'\n  GROUP BY mon\n)\nSELECT mon,\n  ROUND(rev / 100.0, 2) AS rev,\n  ROUND(LAG(rev) OVER (ORDER BY mon) / 100.0, 2) AS prev\nFROM monthly\nORDER BY mon;",
      mistakes: [
        { test: "status\\s*=\\s*'paid'|\\bstatus\\b[^;]*'void'", message: "Revenue = every non-void invoice (open included — it's owed). 'paid' shrinks revenue to collections; selecting only void inverts the filter." },
        { test: "lead\\s*\\(", message: "LEAD peeks FORWARD (next month) — the brief wants the month BEHIND: LAG." },
        { test: "order\\s+by\\s+rev|order\\s+by\\s+2\\s+desc", message: "The walk is chronological — ORDER BY mon. Money-sorted months can't show a trend." },
      ],
      expected: EXPECTED["l55-p1"],
      ordered: true,
    },
    {
      id: "l55-p2",
      title: "The growth line",
      brief: "Add the rate: `mon`, `rev`, `prev`, `pct` = ROUND(100.0*(rev−prev)/prev, 1). Chronological; the first month's prev and pct stay NULL. Peak: 2024-08 at +144.9.",
      hints: [
        "Two CTEs: monthly buckets, then the LAG peek — the outer SELECT divides. NULL prev makes NULL pct automatically; no COALESCE wanted.",
        "Shape: WITH monthly AS (…), peeked AS (SELECT mon, rev, LAG(rev) OVER (ORDER BY mon) AS prev FROM monthly) SELECT mon, ROUND(rev/100.0,2) AS rev, ROUND(prev/100.0,2) AS prev, ROUND(100.0*(rev-prev)/prev, 1) AS pct FROM peeked ORDER BY mon;",
      ],
      difficulty: "medium",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', issued_on) AS mon,\n    SUM(amount_cents) AS rev\n  FROM invoices\n  WHERE status != 'void'\n  GROUP BY mon\n),\npeeked AS (\n  SELECT mon, rev,\n    LAG(rev) OVER (ORDER BY mon) AS prev\n  FROM monthly\n)\nSELECT mon,\n  ROUND(rev / 100.0, 2) AS rev,\n  ROUND(prev / 100.0, 2) AS prev,\n  ROUND(100.0 * (rev - prev) / prev, 1) AS pct\nFROM peeked\nORDER BY mon;",
      mistakes: [
        { test: "\\/\\s*rev\\b", message: "Growth divides by PREV — the base you grew FROM. Dividing by rev answers a different (smaller) question." },
        { test: "coalesce\\s*\\(\\s*prev", message: "Coalescing prev to 0 fabricates a −100% February and a divide-by-zero — the honest NULL is the answer for the first month." },
        { test: "\\bround\\s*\\(\\s*rev\\s*\\)", message: "Percentages need the whole formula: 100.0 * (rev − prev) / prev, rounded to 1 decimal." },
      ],
      expected: EXPECTED["l55-p2"],
      ordered: true,
    },
    {
      id: "l55-p3",
      title: "The biggest jump",
      brief: "Which month grew fastest? One row: `mon` and `pct` (1 decimal), biggest pct first with LIMIT 1. The answer involves a two-invoice month.",
      hints: [
        "The l55-p2 stack, then ORDER BY pct DESC LIMIT 1 — NULLs sort last in DESC, so the first month can't win.",
        "Shape: …same CTEs… SELECT mon, ROUND(100.0*(rev-prev)/prev, 1) AS pct FROM peeked ORDER BY pct DESC LIMIT 1;",
      ],
      difficulty: "medium",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', issued_on) AS mon,\n    SUM(amount_cents) AS rev\n  FROM invoices\n  WHERE status != 'void'\n  GROUP BY mon\n),\npeeked AS (\n  SELECT mon, rev,\n    LAG(rev) OVER (ORDER BY mon) AS prev\n  FROM monthly\n)\nSELECT mon,\n  ROUND(100.0 * (rev - prev) / prev, 1) AS pct\nFROM peeked\nORDER BY pct DESC\nLIMIT 1;",
      mistakes: [
        { test: "\\bmax\\s*\\(\\s*pct\\s*\\)", message: "MAX(pct) in the same SELECT as the window mixes levels — order the finished rows and LIMIT 1 instead." },
        { test: "limit\\s+1[^;]*order\\s+by", message: "LIMIT belongs AFTER the ORDER BY — truncating first sorts a single row, giving whichever month arrived first." },
        { test: "order\\s+by\\s+pct\\s+asc", message: "ASC finds the WORST month (July, −49.6) — the brief wants the biggest JUMP: DESC." },
      ],
      expected: EXPECTED["l55-p3"],
      ordered: true,
    },
    {
      id: "l55-p4",
      title: "The smoothed line",
      brief: "Revenue with its 3-month moving average: `mon`, `rev`, `ma3` = ROUND(AVG(rev) OVER (ORDER BY mon ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)/100.0, 2). Chronological; early months average what exists.",
      hints: [
        "One CTE for buckets, one explicit frame for the slider — no peek needed here.",
        "Shape: WITH monthly AS (…) SELECT mon, ROUND(rev/100.0,2) AS rev, ROUND(AVG(rev) OVER (ORDER BY mon ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)/100.0, 2) AS ma3 FROM monthly ORDER BY mon;",
      ],
      difficulty: "hard",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', issued_on) AS mon,\n    SUM(amount_cents) AS rev\n  FROM invoices\n  WHERE status != 'void'\n  GROUP BY mon\n)\nSELECT mon,\n  ROUND(rev / 100.0, 2) AS rev,\n  ROUND(AVG(rev) OVER (\n    ORDER BY mon\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) / 100.0, 2) AS ma3\nFROM monthly\nORDER BY mon;",
      mistakes: [
        { test: "unbounded\\s+preceding", message: "That's the to-date running average (lesson 32) — it never forgets. The brief wants the 3-row slider: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW." },
        { test: "following", message: "2 FOLLOWING peers into the future — months that haven't happened. The frame trails: 2 PRECEDING AND CURRENT ROW." },
        { test: "lag\\s*\\(\\s*rev\\s*,\\s*1\\s*\\).*\\+.*lag", message: "Hand-rolling (rev + LAG1 + LAG2)/3 breaks on the first two months (NULL peeks) — the frame handles short windows natively." },
      ],
      expected: EXPECTED["l55-p4"],
      ordered: true,
    },
    {
      id: "l55-p5",
      title: "The quarterly view",
      brief: "Same revenue, coarser lens: `qtr` like '2024-Q1' (y || '-Q' || CASE month→1..3), `rev` in dollars. Five rows, chronological; note 2024-Q1 only has two months of history.",
      hints: [
        "Build the quarter key from the month slice: CAST(substr(mon, 6, 2) AS INTEGER) maps to 1-3 / 4-6 / 7-9 / 10-12 via CASE.",
        "Shape: SELECT y || '-Q' || (CASE WHEN m <= 3 THEN 1 WHEN m <= 6 THEN 2 WHEN m <= 9 THEN 3 ELSE 4 END) AS qtr, ROUND(SUM(rev)/100.0, 2) AS rev FROM (SELECT mon, SUM(amount_cents) AS rev FROM invoices WHERE status != 'void' GROUP BY mon) with y = substr(mon,1,4), m = CAST(substr(mon,6,2) AS INTEGER) — GROUP BY the key, ORDER BY qtr;",
      ],
      difficulty: "hard",
      solution:
        "SELECT y || '-Q' ||\n  (CASE WHEN m <= 3 THEN 1 WHEN m <= 6 THEN 2\n        WHEN m <= 9 THEN 3 ELSE 4 END) AS qtr,\n  ROUND(SUM(rev) / 100.0, 2) AS rev\nFROM (\n  SELECT substr(mon, 1, 4) AS y,\n    CAST(substr(mon, 6, 2) AS INTEGER) AS m,\n    rev\n  FROM (\n    SELECT strftime('%Y-%m', issued_on) AS mon,\n      SUM(amount_cents) AS rev\n    FROM invoices\n    WHERE status != 'void'\n    GROUP BY mon\n  )\n)\nGROUP BY qtr\nORDER BY qtr;",
      mistakes: [
        { test: "strftime\\s*\\(\\s*'%q", message: "SQLite's strftime has no %q quarter code — compose the key from %Y and a CASE over the month slice." },
        { test: "sum\\s*\\(\\s*amount_cents\\s*\\)\\s+as\\s+rev\\s*\\)[^;]*group\\s+by\\s+mon", message: "Grouping the inner query by mon is right; the OUTER query must group by the quarter key, or every month stays its own row." },
        { test: "status\\s*=\\s*'paid'", message: "Same revenue definition as always — non-void invoiced. Filtering to paid measures collections, a different series." },
      ],
      expected: EXPECTED["l55-p5"],
      ordered: true,
    },
    {
      id: "l55-p6",
      title: "The growth streak",
      brief: "The capstone: how many consecutive months of growth did the store string together at its best? One column `longest_streak`. (Flags + gaps-and-islands — lesson 49's recursive thinking, done with windows.)",
      hints: [
        "Three stages: pct per month → flag grew = (pct > 0) and number the rows two ways (overall rn, and rn within each flag class) → the DIFFERENCE is constant within an island → count per island, take MAX.",
        "Shape: WITH m AS (…monthly+LAG…), f AS (SELECT mon, rev > prev AS grew, ROW_NUMBER() OVER (ORDER BY mon) − ROW_NUMBER() OVER (PARTITION BY rev > prev ORDER BY mon) AS grp FROM m WHERE prev IS NOT NULL) SELECT MAX(n) AS longest_streak FROM (SELECT COUNT(*) AS n FROM f WHERE grew GROUP BY grp);",
      ],
      difficulty: "hard",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', issued_on) AS mon,\n    SUM(amount_cents) AS rev\n  FROM invoices\n  WHERE status != 'void'\n  GROUP BY mon\n),\npeeked AS (\n  SELECT mon, rev,\n    LAG(rev) OVER (ORDER BY mon) AS prev\n  FROM monthly\n),\nflagged AS (\n  SELECT mon,\n    (rev > prev) AS grew,\n    ROW_NUMBER() OVER (ORDER BY mon)\n      - ROW_NUMBER() OVER (\n          PARTITION BY (rev > prev)\n          ORDER BY mon\n        ) AS grp\n  FROM peeked\n  WHERE prev IS NOT NULL\n),\nislands AS (\n  SELECT grp, COUNT(*) AS n\n  FROM flagged\n  WHERE grew\n  GROUP BY grp\n)\nSELECT MAX(n) AS longest_streak\nFROM islands;",
      mistakes: [
        { test: "where\\s+grew[^;]*group\\s+by\\s+grp[^;]*\\bmax\\s*\\(\\s*grp", message: "MAX(grp) counts nothing — the island's LENGTH is COUNT(*) per grp; MAX goes over those counts in the outermost layer." },
        { test: "prev\\s+is\\s+not\\s+null", message: "Right guard — but check placement: the NULL-prev row must be excluded BEFORE flagging, or its (rev > NULL) NULL-poisons the partition." },
        { test: "count\\s*\\(\\s*\\*\\s*\\)\\s+as\\s+longest", message: "That's the number of growth months overall (8), not the longest CONSECUTIVE run — the island grouping is what turns scattered months into streaks." },
      ],
      expected: EXPECTED["l55-p6"],
    },
  ],
  takeaway: "Bucket, peek, compute, smooth — LAG gives every month its history, the frame gives it perspective, and the void filter keeps both honest.",
};
