import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson57: Lesson = {
  id: "lesson-57",
  num: 57,
  title: "Windows III — percentiles & outliers",
  blurb: "The advanced window tier: CUME_DIST standings, the LAST_VALUE frame trap, manual standard deviation, and z-scored anomaly hunting on the books",
  minutes: 16,
  blocks: [
    {
      kind: "p",
      text: "Two lessons' worth of windows taught the **walk** (running totals, LAG). This one teaches the **gaze** — windows that measure a row against its whole population. Where does this invoice sit, percentagewise? Is August's expense spike *actually* weird, or just a loud month? These are distribution questions, and SQL answers them with three new tools: `CUME_DIST` for standings, explicit frames for sliding statistics, and — because SQLite ships no `STDDEV` — the standard deviation built by hand from aggregates you already know.",
    },
    { kind: "h", text: "Standings: CUME_DIST" },
    {
      kind: "code",
      caption: "Every invoice's cumulative share of the distribution",
      sql: `SELECT number,
       ROUND(amount_cents / 100.0, 2) AS amount,
       ROUND(CUME_DIST() OVER (ORDER BY amount_cents), 3) AS cd
FROM invoices
WHERE status != 'void'
ORDER BY amount_cents DESC
LIMIT 4;
-- INV-2025-025  6148.0  cd 1.000   ← top of 27 invoices
-- INV-2024-019  5614.0  cd 0.963
-- INV-2025-024  4937.0  cd 0.926
-- INV-2024-022  4459.0  cd 0.889`,
    },
    {
      kind: "bullets",
      items: [
        "`CUME_DIST()` = 'what fraction of the rows sits at or below me?' — always ending at 1.0. Top-decile invoices are the rows with `cd > 0.9`: on this store, exactly three (Alice's $6,148, Alice's $5,614, Emma's $4,937).",
        "Its cousin `PERCENT_RANK()` ranks from 0.0 (bottom row) to 1.0 (top row) as `(rank−1)/(n−1)` — position among peers, not share of mass. Use CUME_DIST for 'top X%' questions, PERCENT_RANK for 'where in the lineup'.",
        "Note what's NOT here: a WHERE on amount. Percentiles need the WHOLE distribution computed first — the window sees all 27 rows, and the outer query sorts/clips. Filtering inside would lie about the standings.",
      ],
    },
    { kind: "h", text: "The LAST_VALUE trap (a rite of passage)" },
    {
      kind: "code",
      caption: "The frame strikes again — the single most-common window bug",
      sql: `SELECT mon, spend,
  FIRST_VALUE(spend) OVER w AS biggest_so_far,   -- works by luck of ordering
  LAST_VALUE(spend)  OVER w AS biggest           -- ⚠️ returns… spend itself?!
FROM monthly_expenses
WINDOW w AS (ORDER BY mon);
-- default frame = RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
-- LAST_VALUE therefore stops at the CURRENT row — it's just… spend.`,
    },
    {
      kind: "bullets",
      items: [
        "FIRST_VALUE works by accident: the first value of 'everything up to me' is the global first. LAST_VALUE stops at the CURRENT row — the last value of a frame that ends at you is *you*.",
        "The fix is an explicit frame: `WINDOW w AS (ORDER BY mon ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)` — then LAST_VALUE sees the whole partition. (Lesson 53's RANGE-vs-ROWS discussion, now with teeth.)",
        "Better yet, don't play frame games for maxima: `MAX(spend) OVER (ORDER BY mon)` is a running max — aggregate semantics, no trap. LAST_VALUE is for when the value IS a position, not an aggregate.",
      ],
    },
    { kind: "h", text: "The standard deviation, by hand" },
    {
      kind: "p",
      text: "SQLite ships no `STDDEV` — and this engine doesn't even ship `SQRT`. Both are buildable, and building them is the most satisfying five lines in the course. Step one is algebra: the **variance** is two averages — `AVG(x²) − AVG(x)²`. Step two is lesson 49: a `WITH RECURSIVE` Newton's-method square root, iterating `g ← (g + var/g)/2` until it stops moving. On the store's 14 monthly expense totals that yields **mean $1,815.43, SD $423.12** — and that one number turns 'August looks big' into 'August is 3.3 standard deviations above the mean', which is a fact you can defend.",
    },
    {
      kind: "code",
      caption: "Monthly expenses: mean, variance, and a hand-built square root",
      sql: `WITH monthly AS (
  SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend
  FROM expenses GROUP BY mon
),
stats AS (
  SELECT AVG(spend) AS a,
         AVG(spend*spend) - AVG(spend)*AVG(spend) AS var
  FROM monthly
),
newton(n, g) AS (
  SELECT 0, (SELECT var FROM stats) / 2.0 + 0.5
  UNION ALL
  SELECT n + 1, (g + (SELECT var FROM stats) / g) / 2.0
  FROM newton WHERE n < 30
)
SELECT ROUND((SELECT a FROM stats) / 100.0, 2) AS avg_spend,
       ROUND((SELECT g FROM newton WHERE n = 30) / 100.0, 2) AS sd_spend;
-- 1815.43 · 423.12   ← 30 Newton steps: quadratic convergence, machine precision`,
    },
    {
      kind: "bullets",
      items: [
        "This is the **population** SD (divide by n). The sample SD divides by n−1; with 14 months the difference is ~4%. State which you're using — finance people ask.",
        "The variance identity works because variance is just 'the average of the squares minus the square of the average' — one pass of AVG, no extensions. The recursive sqrt then refines a guess by averaging it with var/g — each step DOUBLES the correct digits, so 30 iterations is overkill by a mile.",
        "Test your own math library: square the answer. `g*g` must land within rounding of `var` — the recursive CTE's termination condition if you want it adaptive instead of a fixed 30.",
      ],
    },
    { kind: "h", text: "Z-scores: how weird is weird?" },
    {
      kind: "code",
      caption: "Each month's spend, measured in standard deviations from the mean",
      sql: `/* …monthly + stats + newton CTEs from above… */
SELECT mon, ROUND(spend / 100.0, 2) AS spend,
       ROUND((spend - (SELECT a FROM stats))
                   / (SELECT g FROM newton WHERE n = 30), 2) AS z
FROM monthly
ORDER BY z DESC;
-- 2024-08: 3210.0 · z 3.3    ← the trade show, wearing a number`,
    },
    { kind: "diagram", figure: "fin6-frame-slide" },
    {
      kind: "bullets",
      items: [
        "Under roughly-normal data, |z| ≥ 2 flags ~5% of months and |z| ≥ 3 flags ~0.1%. August's **z = 3.30** isn't a judgement call anymore — it's a statistical event. (The memo confirms: the trade show.)",
        "Fixed thresholds ('$3,000 is suspicious') rot as the business grows. Z-scores scale themselves: the threshold is always 'this many spreads from typical'.",
        "Layering again — now three deep: monthly totals → stats (needs ALL months finished) → newton (needs the variance) → the z table. Each CTE is one job; lesson 28's top-down chain doing statistics.",
      ],
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "Newer SQLite builds compiled with math functions offer SQRT and STDDEV_POP directly — but this store's engine has neither, and the hand-rolled pair (variance identity + recursive Newton) runs on every engine back to 3.8.3. Portable beats built-in.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres has the full stats suite: STDDEV_POP, PERCENTILE_CONT (real medians!), and window frames over RANGE WITH INTERVAL — plus ordered-set aggregates finance loves.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL 8 ships STDDEV_POP/STDDEV_SAMP and CUME_DIST natively. The z-score layering pattern ports unchanged — swap the hand-rolled SD for the built-in.",
    },
    {
      kind: "tip",
      text: "Distribution thinking in three moves: CUME_DIST for standings, hand-rolled SD for spread, z-scores for outliers. The same three moves power fraud alerts, spend-anomaly reports and QA charts — and the frame trap you just dodged will save you at 3am someday.",
    },
  ],
  mcqs: [
    {
      id: "l57-q1",
      prompt: "What does CUME_DIST() return for the very TOP row of an ORDER BY amount ranking?",
      choices: ["0.0", "0.5", "1.0 — the whole distribution sits at or below it", "The row's count"],
      answer: 2,
      why: "CUME_DIST is 'share of rows at or below me' — the maximum row has everything below it: 1.0. That's why top-decile filters read `cd > 0.9`, never `cd = 1`.",
      notes: [
        { choice: 0, why: "That's PERCENT_RANK's floor, not CUME_DIST's. The two functions bracket the ranking world from opposite ends." },
      ],
    },
    {
      id: "l57-q2",
      prompt: "27 non-void invoices. Which rows have CUME_DIST > 0.9?",
      choices: [
        "The bottom three amounts",
        "The top three amounts — $6,148, $5,614, $4,937 — the top ~10% of the distribution",
        "Exactly 2.7 rows — the function rounds",
        "All 27 — everyone is above 0.9 of someone",
      ],
      answer: 1,
      why: "0.9 × 27 = 24.3, so three rows clear the bar. Alice appears twice in her own top decile — concentration worth knowing when you chase 'big customers'.",
      notes: [
        { choice: 2, why: "No rounding — cd takes discrete values at each rank tie-group; the count above 0.9 is a plain integer, here 3." },
      ],
    },
    {
      id: "l57-q3",
      prompt: "`LAST_VALUE(spend) OVER (ORDER BY mon)` returns… spend itself, on every row. Why?",
      choices: [
        "LAST_VALUE is broken in SQLite",
        "The default frame ends at CURRENT ROW — and the last value of a window ending at you is you",
        "spend is sorted descending",
        "It needs PARTITION BY to work",
      ],
      answer: 1,
      why: "The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. LAST_VALUE looks at the frame's END — which is the current row. The fix: extend the frame with UNBOUNDED FOLLOWING (or just use MAX() OVER).",
      notes: [
        { choice: 3, why: "PARTITION BY changes WHICH rows compete, not how far the frame reaches. The trap is the frame, every time." },
      ],
    },
    {
      id: "l57-q4",
      prompt: "Why does `MAX(spend) OVER (ORDER BY mon)` dodge the LAST_VALUE trap entirely?",
      choices: [
        "MAX ignores frames by law",
        "Aggregates operate over the frame's contents — a running MAX over 'everything so far' is meaningful at every row, no peeking at frame edges required",
        "It sorts internally",
        "It only works on integers",
      ],
      answer: 1,
      why: "VALUE functions (FIRST/LAST_VALUE, LAG) read positions; aggregates read contents. 'Max of everything up to here' is well-defined under the default frame — no UNBOUNDED FOLLOWING needed.",
      notes: [
        { choice: 0, why: "MAX very much respects its frame — a 2-PRECEDING frame gives a sliding max. It dodges the trap because 'so far' frames suit it, not because it ignores them." },
      ],
    },
    {
      id: "l57-q5",
      prompt: "The variance is `AVG(x²) − AVG(x)²` — and then SD = its square root. What does the recursive newton CTE contribute?",
      choices: [
        "It computes the variance faster",
        "The engine ships no SQRT — newton iterates g ← (g + var/g)/2, each step doubling the correct digits until the square root exists",
        "It converts cents to dollars",
        "It replaces the AVGs entirely",
      ],
      answer: 1,
      why: "Lesson 49's WITH RECURSIVE as a math library: guess, refine by averaging the guess with var/guess, repeat. Quadratic convergence means ~30 steps is machine precision — built, not installed.",
      notes: [
        { choice: 0, why: "The variance is already one pass of two AVGs — newton exists purely because the SQUARE ROOT of it is missing from this engine." },
      ],
    },
    {
      id: "l57-q6",
      prompt: "The store's monthly expenses: mean $1,815.43, population SD $423.12. August totals $3,210.00. Its z-score is…",
      choices: ["1.52", "3.30", "0.57", "423.12"],
      answer: 1,
      why: "(3210 − 1815.43) / 423.12 = 3.30. August sits three-plus spreads above typical — under normal-ish data that's a once-in-three-hundred-months event. Hence: not weather, but the trade show.",
      notes: [
        { choice: 0, why: "1.52 is (3210 − mean)/SD with the SD doubled — a sample-SD mix-up changes flags. Pick your SD convention and keep it consistent." },
      ],
    },
    {
      id: "l57-q7",
      prompt: "Why flag outliers at |z| ≥ 2 instead of a fixed '$3,000/month is suspicious'?",
      choices: [
        "z-scores run faster",
        "Fixed thresholds rot as the business grows — z-scores self-scale, so 'unusual' always means 'spreads from typical', next year included",
        "SQL can't compare to constants",
        "z-scores handle NULLs better",
      ],
      answer: 1,
      why: "When revenue doubles, $3,000 stops being weird and starts being a Tuesday. The z threshold tracks the data's own center and spread — the alert stays calibrated with zero maintenance.",
      notes: [
        { choice: 3, why: "NULLs are a real aggregation concern, but orthogonal here — the win is the SELF-SCALING threshold, not NULL handling." },
      ],
    },
    {
      id: "l57-q8",
      prompt: "Why do the mean and SD live in their own subquery, cross-joined onto the monthly detail?",
      choices: [
        "Style — it reads nicer",
        "They need ALL months finished before any row can be scored — and you can't nest an aggregate-of-aggregates in one SELECT level",
        "SQLite requires cross joins for math",
        "To avoid dividing by zero",
      ],
      answer: 1,
      why: "The z of August needs the mean OF ALL MONTHS including August. One SELECT can't aggregate and then reference that aggregate per-row — stage the stats, then join them onto every row. Layering, the course's oldest law.",
      notes: [
        { choice: 1, why: "The cross join is deliberate: every month row pairs with the SAME single stats row — a scalar broadcast, not a key match." },
      ],
    },
    {
      id: "l57-q9",
      prompt: "CUME_DIST vs PERCENT_RANK — which question does each answer?",
      choices: [
        "They're aliases",
        "CUME_DIST: 'what share of rows sits at or below me?' (mass, ends at 1.0). PERCENT_RANK: 'where am I in the lineup?' (position, 0.0 to 1.0)",
        "CUME_DIST is for numbers, PERCENT_RANK for text",
        "PERCENT_RANK includes ties, CUME_DIST breaks them",
      ],
      answer: 1,
      why: "Mass vs position. For 'top 10% of invoices' use CUME_DIST (> 0.9); for 'is this invoice in the top half of the lineup' either works — but they disagree whenever ties or small n appear.",
      notes: [
        { choice: 3, why: "Both handle ties — CUME_DIST gives tied rows the SAME (bottom of their tie-group) value; PERCENT_RANK averages their ranks. Tie POLICY differs; tie SUPPORT doesn't." },
      ],
    },
    {
      id: "l57-q10",
      prompt: "The spend>1.5×ma3 heuristic flags only August. Why can a heuristic like this and a z-score disagree?",
      choices: [
        "They can't — both use the whole history",
        "The ma3 heuristic is LOCAL (compares against the trailing three months); the z-score is GLOBAL (compares against all 14) — a slow Ramp of normal-looking increases fools the local one, a one-off spike in an already-wild history fools the global one",
        "Heuristics use medians, z-scores use means",
        "They only disagree on the first month",
      ],
      answer: 1,
      why: "Local vs global context. Production anomaly systems run BOTH: a drift detector (trend) and a deviation detector (z) — because 'slowly creeping' and 'suddenly spiking' are different failures with different alarms.",
      notes: [
        { choice: 0, why: "ma3 uses a 3-row window; the z uses 14 months — different memories produce different verdicts, which is the feature." },
      ],
    },
    {
      id: "l57-q11",
      prompt: "Why does the top-decile invoice query avoid `WHERE amount > <a dollar figure>`?",
      choices: [
        "WHERE can't compare amounts",
        "A hardcoded cutoff IS the top decile only until data changes — CUME_DIST computes the decile FROM the data, so 'top 10%' stays true as invoices come and go",
        "Dollar figures need quotes",
        "WHERE runs after windows",
      ],
      answer: 1,
      why: "Same self-scaling philosophy as the z-score: express the threshold as a property of the distribution, not a magic number. (And technically: window results filter in an OUTER query — WHERE on cd would need the layering anyway.)",
      notes: [
        { choice: 3, why: "Inverted — WHERE runs BEFORE windows in the pipeline, which is exactly why the cd filter must live in an outer SELECT. Both reasons point the same way: layer it." },
      ],
    },
  ],
  problems: [
    {
      id: "l57-p1",
      title: "The leaderboard",
      brief: "Non-void invoices ranked by mass: `number`, `amount` (dollars), `cd` = ROUND(CUME_DIST() OVER (ORDER BY amount_cents), 3), biggest amounts first. Top of the list: cd 1.0 at $6,148.00.",
      hints: [
        "CUME_DIST over the full distribution (all 27 rows), then sort and clip in the outer query — the window must see everyone before anyone is judged.",
        "Shape: SELECT number, ROUND(amount_cents/100.0, 2) AS amount, ROUND(CUME_DIST() OVER (ORDER BY amount_cents), 3) AS cd FROM invoices WHERE status != 'void' ORDER BY amount_cents DESC, number;",
      ],
      difficulty: "medium",
      solution:
        "SELECT number,\n  ROUND(amount_cents / 100.0, 2) AS amount,\n  ROUND(CUME_DIST() OVER (ORDER BY amount_cents), 3) AS cd\nFROM invoices\nWHERE status != 'void'\nORDER BY amount_cents DESC, number;",
      mistakes: [
        { test: "where[^;]*cd\\s*>|having[^;]*cd", message: "WHERE/HAVING run before (or clash with) the window — the distribution must be complete before standings mean anything; filter cd in an outer layer if clipping is wanted." },
        { test: "percent_rank\\s*\\(", message: "PERCENT_RANK scores POSITION (0 at the bottom row) — the leaderboard wants share-of-mass: CUME_DIST, ending at 1.0." },
        { test: "order\\s+by\\s+amount\\s+asc", message: "Ascending buries the leaders at the bottom — the brief reads top-down: ORDER BY amount DESC." },
      ],
      expected: EXPECTED["l57-p1"],
      ordered: true,
    },
    {
      id: "l57-p2",
      title: "Each customer's biggest bill",
      brief: "Per customer, their single largest non-void invoice: `name`, `number`, `amount` (dollars), biggest first. Eleven rows — RANK() per partition, keep rank 1.",
      hints: [
        "PARTITION BY the customer, ORDER BY amount DESC inside the window, keep rn = 1 in an outer layer.",
        "Shape: SELECT name, number, amount FROM (SELECT c.name, i.number, ROUND(i.amount_cents/100.0,2) AS amount, RANK() OVER (PARTITION BY i.customer_id ORDER BY i.amount_cents DESC) AS rn FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status != 'void') t WHERE rn = 1 ORDER BY amount DESC, name;",
      ],
      difficulty: "hard",
      solution:
        "SELECT name, number, amount\nFROM (\n  SELECT c.name, i.number,\n    ROUND(i.amount_cents / 100.0, 2) AS amount,\n    RANK() OVER (\n      PARTITION BY i.customer_id\n      ORDER BY i.amount_cents DESC\n    ) AS rn\n  FROM invoices i\n  JOIN customers c ON c.id = i.customer_id\n  WHERE i.status != 'void'\n) t\nWHERE rn = 1\nORDER BY amount DESC, name;",
      mistakes: [
        { test: "\\bmax\\s*\\(\\s*amount_cents\\s*\\)[^;]*group\\s+by", message: "MAX alone loses the invoice NUMBER — the window keeps the whole row while ranking; GROUP BY would strand the identity columns." },
        { test: "row_number\\s*\\(\\s*\\)[^;]*rn\\s*=\\s*1", message: "ROW_NUMBER picks arbitrarily on ties; RANK keeps both co-champions — the honest choice for 'biggest bill'. (No ties exist here, but the habit matters.)" },
        { test: "where\\s+rn\\s*=\\s*1[^;]*from\\s+invoices", message: "The rank filter must sit OUTSIDE the window's SELECT — filtering rn inside the same level is a chicken-and-egg error." },
      ],
      expected: EXPECTED["l57-p2"],
      ordered: true,
    },
    {
      id: "l57-p3",
      title: "Mean and spread",
      brief: "Monthly expense totals, summarized: one row, `avg_spend` and `sd_spend` — the SD built as variance (AVG(x²) − AVG(x)²) followed by a recursive-Newton square root (30 steps). Expect 1815.43 and 423.12.",
      hints: [
        "Four CTEs: monthly totals → stats (the variance identity) → newton (lesson 49's sqrt: g ← (g + var/g)/2, seeded at var/2 + 0.5) → read g at n = 30.",
        "Shape: WITH monthly AS (…), stats AS (SELECT AVG(spend) AS a, AVG(spend*spend) - AVG(spend)*AVG(spend) AS var FROM monthly), newton(n, g) AS (SELECT 0, (SELECT var FROM stats)/2.0 + 0.5 UNION ALL SELECT n+1, (g + (SELECT var FROM stats)/g)/2.0 FROM newton WHERE n < 30) SELECT ROUND((SELECT a FROM stats)/100.0, 2) AS avg_spend, ROUND((SELECT g FROM newton WHERE n = 30)/100.0, 2) AS sd_spend;",
      ],
      difficulty: "hard",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend\n  FROM expenses\n  GROUP BY mon\n),\nstats AS (\n  SELECT AVG(spend) AS a,\n    AVG(spend * spend) - AVG(spend) * AVG(spend) AS var\n  FROM monthly\n),\nnewton(n, g) AS (\n  SELECT 0, (SELECT var FROM stats) / 2.0 + 0.5\n  UNION ALL\n  SELECT n + 1, (g + (SELECT var FROM stats) / g) / 2.0\n  FROM newton WHERE n < 30\n)\nSELECT ROUND((SELECT a FROM stats) / 100.0, 2) AS avg_spend,\n  ROUND((SELECT g FROM newton WHERE n = 30) / 100.0, 2) AS sd_spend;",
      mistakes: [
        { test: "stddev|\\bsqrt\\s*\\(", message: "This engine ships neither — variance via the two-averages identity, then the square root via the recursive Newton CTE. Build the math, don't import it." },
        { test: "\\bfrom\\s+expenses\\s*;", message: "Aggregating raw expense ROWS averages per-VENDOR line items, not monthly totals — stage the GROUP BY month first, then summarize the 14 totals." },
        { test: "where\\s+n\\s*<\\s*30[^;]*and", message: "The fixed 30 iterations need no adaptive termination — the recursive member's WHERE guards the counter alone; bolting a tolerance onto it risks stopping mid-descent." },
      ],
      expected: EXPECTED["l57-p3"],
    },
    {
      id: "l57-p4",
      title: "The z-table",
      brief: "Every month, scored: `mon`, `spend` (dollars), `z` = ROUND((spend − mean)/sd, 2) with the SD from the newton CTE, loudest first. Fourteen rows; August towers at 3.3.",
      hints: [
        "The full CTE stack — monthly, stats, newton — then the z math as scalar subqueries against the single-row stats and newton results.",
        "Shape: WITH monthly AS (…), stats AS (…), newton AS (…) SELECT mon, ROUND(spend/100.0, 2) AS spend, ROUND((spend - (SELECT a FROM stats)) / (SELECT g FROM newton WHERE n = 30), 2) AS z FROM monthly ORDER BY z DESC, mon;",
      ],
      difficulty: "hard",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend\n  FROM expenses\n  GROUP BY mon\n),\nstats AS (\n  SELECT AVG(spend) AS a,\n    AVG(spend * spend) - AVG(spend) * AVG(spend) AS var\n  FROM monthly\n),\nnewton(n, g) AS (\n  SELECT 0, (SELECT var FROM stats) / 2.0 + 0.5\n  UNION ALL\n  SELECT n + 1, (g + (SELECT var FROM stats) / g) / 2.0\n  FROM newton WHERE n < 30\n)\nSELECT mon,\n  ROUND(spend / 100.0, 2) AS spend,\n  ROUND((spend - (SELECT a FROM stats))\n    / (SELECT g FROM newton WHERE n = 30), 2) AS z\nFROM monthly\nORDER BY z DESC, mon;",
      mistakes: [
        { test: "\\bround\\s*\\(\\s*avg_spend|round\\s*\\(.*100\\.0\\s*,\\s*2\\s*\\)\\s*as\\s+a", message: "Round ONLY the display columns — the stats feeding the z math must stay full-precision, or August's score drifts." },
        { test: "join\\s+stats\\s+on|join\\s+newton\\s+on", message: "stats and newton are single-ROW results with nothing to key on — read them as scalar subqueries; joining them to monthly would need a fake key and duplicate rows." },
        { test: "order\\s+by\\s+spend\\s+desc", message: "Spend order ≠ z order when months differ from the mean in both directions — the brief ranks by the SCORE: ORDER BY z DESC." },
      ],
      expected: EXPECTED["l57-p4"],
      ordered: true,
    },
    {
      id: "l57-p5",
      title: "The alarm list",
      brief: "Keep only genuinely unusual months: `mon`, `spend`, `z` where ABS(z) ≥ 2, loudest first. One row — name the culprit month.",
      hints: [
        "The l57-p4 stack, wrapped once, filtered on the finished z. ABS(z) catches spend ANOMALIES in both directions — crashes matter as much as spikes.",
        "Shape: SELECT mon, spend, z FROM (…l57-p4 query…) WHERE ABS(z) >= 2 ORDER BY z DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT mon, spend, z\nFROM (\n  WITH monthly AS (\n    SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend\n    FROM expenses\n    GROUP BY mon\n  ),\n  stats AS (\n    SELECT AVG(spend) AS a,\n      AVG(spend * spend) - AVG(spend) * AVG(spend) AS var\n    FROM monthly\n  ),\n  newton(n, g) AS (\n    SELECT 0, (SELECT var FROM stats) / 2.0 + 0.5\n    UNION ALL\n    SELECT n + 1, (g + (SELECT var FROM stats) / g) / 2.0\n    FROM newton WHERE n < 30\n  )\n  SELECT mon,\n    ROUND(spend / 100.0, 2) AS spend,\n    ROUND((spend - (SELECT a FROM stats))\n      / (SELECT g FROM newton WHERE n = 30), 2) AS z\n  FROM monthly\n)\nWHERE ABS(z) >= 2\nORDER BY z DESC;",
      mistakes: [
        { test: "z\\s*>\\s*2", message: "Spikes only — ABS(z) ≥ 2 also guards against suspicious LULLS (a dead month is as alarming as a loud one). Here it happens to catch the same single month." },
        { test: "where\\s+spend\\s*>\\s*3000", message: "That's the rot-prone magic number — the brief's bar is statistical: two spreads from typical, wherever typical sits." },
      ],
      expected: EXPECTED["l57-p5"],
      ordered: true,
    },
    {
      id: "l57-p6",
      title: "The local detector",
      brief: "Different memory, different verdict: flag months where spend > 1.5 × its trailing 3-month average (ma3 = AVG OVER 2 PRECEDING + current). Output `mon`, `spend` (dollars), `ma3` (dollars) for flagged rows only. August — but via a totally different mechanism than the z-score.",
      hints: [
        "Frame the ma3 in one SELECT (a window CAN sit on the same level as its own inputs), wrap, then filter spend > 1.5 * ma3 outside.",
        "Shape: SELECT mon, spend, ma3 FROM (SELECT mon, ROUND(spend/100.0,2) AS spend, ROUND(AVG(spend) OVER (ORDER BY mon ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)/100.0, 2) AS ma3 FROM (monthly totals)) WHERE spend > 1.5 * ma3 ORDER BY mon;",
      ],
      difficulty: "hard",
      solution:
        "SELECT mon, spend, ma3\nFROM (\n  SELECT mon,\n    ROUND(spend / 100.0, 2) AS spend,\n    ROUND(AVG(spend) OVER (\n      ORDER BY mon\n      ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n    ) / 100.0, 2) AS ma3\n  FROM (\n    SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend\n    FROM expenses\n    GROUP BY mon\n  )\n)\nWHERE spend > 1.5 * ma3\nORDER BY mon;",
      mistakes: [
        { test: "unbounded\\s+preceding", message: "Running-average memory again — the detector must compare against the TRAILING THREE months, or old history dilutes the alarm." },
        { test: "where\\s+spend\\s*>\\s*1\\.5\\s*\\*\\s*avg\\s*\\(", message: "Can't filter on a window in the same level that computes it — wrap the windowed SELECT, filter the finished ma3 outside." },
        { test: "z\\b|stddev|sqrt", message: "Wrong detector — this one is the LOCAL heuristic (1.5× the trailing average), no mean/SD machinery. Different tool, same culprit month." },
      ],
      expected: EXPECTED["l57-p6"],
      ordered: true,
    },
  ],
  takeaway: "CUME_DIST for standings, the two-averages identity for spread, z-scores for outliers — and an explicit frame whenever LAST_VALUE enters the room.",
  deep: [
    {
      kind: "mind",
      text: "The advanced window tier answers **\"where do I stand in the distribution?\"** — not ranked 1..n, but positioned on a 0-to-1 curve. CUME_DIST gives the share of rows at-or-below you (denominator: n, the whole stage); PERCENT_RANK gives (rank−1)/(n−1), the cheapest row sitting at exactly 0. From the curve, statistics fall out: the median is the 0.5 crossing, quartiles are the 0.25/0.75 crossings, and a z-score — (x − mean) / stddev — turns \"August looks big\" into \"August is 3.3 sigma out\", a sentence a risk committee can act on. The tier's habit of mind: raw rank is for leaderboards, distribution position is for \"is this NORMAL?\" — and the second question is where finance lives.",
    },
    {
      kind: "engine",
      title: "you run SELECT id, total, ROUND(100.0 * CUME_DIST() OVER (ORDER BY total), 1) AS pctile FROM orders",
      steps: [
        "**Order the stage** — the curve needs the sort spec: totals ascending. Ties share one curve point (peers included — at-or-below counts them together).",
        "**Curve math** — CUME_DIST = rows at-or-below ÷ n. The maximum row hits exactly 1.0; the minimum sits at (count of its ties) ÷ n — ABOVE zero, unlike PERCENT_RANK's 0.0 floor.",
        "**The crossings** — WHERE the curve crosses 0.5 is the median of the 103 totals (from the row just past halfway); 0.25/0.75 crossings give quartiles without NTILE's equal-count forcing.",
        "**Z-scores** — AVG and a hand-rolled stddev (the sqrt of AVG(x²) − mean²) as window columns, then (total − mean) / stddev per row. |z| > 3 is the outlier flag the lesson hunts for.",
      ],
    },
    {
      kind: "myth",
      myth: "\"CUME_DIST and PERCENT_RANK are the same curve shifted a little — pick either.\"",
      truth: "They answer different questions with different denominators: CUME_DIST = **at-or-below share (÷ n)**, starts above 0, hits exactly 1; PERCENT_RANK = **rank fraction (÷ n−1)**, starts at exactly 0, tops out below 1. Median-hunting via \"the 0.5 crossing\" gives different rows on the two curves — the choice is a definition, not a preference.",
    },
    {
      kind: "edge",
      items: [
        { c: "Ties on the curve", r: "Equal totals share ONE CUME_DIST value — peers included by definition. If your report splits tied rows into different percentiles, you've joined ROW_NUMBER to a curve that didn't ask for it." },
        { c: "stddev by hand", r: "SQLite has no STDDEV built-in: the E[x²] − E[x]² identity computes population stddev in two window aggregates. Sample stddev (n−1) needs the correction factor — decide which your report promises." },
        { c: "Small-stage sigma", r: "With 4 rows, \"3 sigma\" is nearly unreachable — the curves are too coarse. Distribution flags need stage sizes; state n next to every z-score or the threshold is theater." },
        { c: "Skewed distributions", r: "Z-scores assume roughly symmetric shapes: revenue is usually right-skewed, so \"3 sigma\" fires differently on totals vs log(totals). The flag is a sentence opener, not a verdict." },
      ],
    },  ],
};
