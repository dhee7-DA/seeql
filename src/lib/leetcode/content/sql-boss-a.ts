// Deep-dives — the BOSS LEVEL band, file A of B (3 problems: 1 Medium,
// 2 Hard). Original problems authored for this app: sweep-line concurrency,
// median emulation without MEDIAN(), and streak islands over a week spine.
// Every solution is engine-verified against its own seed by
// scripts/lc-boss-verify.ts before wiring.
import type { LcSqlDive } from "../types";

export const SQL_BOSS_A: LcSqlDive[] = [
  {
    slug: "peak-concurrent-attendance",
    statement:
      "A co-working space logs every visit as one row in Checkins (visit_id, member_id, entered_at, left_at) — timestamps in 'YYYY-MM-DD HH:MI' text, and left_at is EXCLUSIVE: a member who leaves at 10:00 does not overlap one who enters at 10:00. Find the peak number of simultaneous occupants and the earliest moment at which that peak is reached: one row, columns peak_concurrent (the maximum running occupancy) and since (the entered_at whose arrival completes the peak). left_at is never NULL for completed visits, but the seed plants same-moment arrivals and departures — a departure at time T must be processed BEFORE an arrival at time T.",
    examples: [
      {
        input: "member 7 occupies 09:00–10:00; member 8 enters at 10:00",
        output: "… peak does not include member 7 at 10:00 …",
        explanation:
          "left_at is exclusive, so at 10:00 the departure is applied first and member 8's arrival builds on the reduced count — they never coexist.",
      },
      {
        input: "three members inside at 09:30, two arrivals complete the peak at 11:45",
        output: "5 · '2025-03-03 11:45'",
        explanation:
          "The running count touches 5 for the first time when the second 11:45 arrival is processed — that timestamp is the answer's since, even if the count dips and returns to 5 later.",
      },
    ],
    constraints: [
      "exactly one output row: peak_concurrent, since",
      "at equal timestamps, departures (−1) sort before arrivals (+1) — exclusive left_at",
      "since is the EARLIEST timestamp whose event completes the peak occupancy",
    ],
    breakdown: [
      "Interval overlap is a sweep-line wearing SQL: turn every visit into two events — an arrival (+1 at entered_at) and a departure (−1 at left_at) — stack the events on a timeline, and the occupancy at any moment is the running sum of deltas up to that moment. MAX over the running sum is the peak. The UNION ALL of two thin SELECTs is the standard event-builder; a WHERE left_at IS NOT NULL guards the (rare) open visit whose departure hasn't happened.",
      "The tie rule is where the problem earns its Hard badge: at equal timestamps, −1 must sort before +1, because left_at is exclusive. The sort spec ORDER BY t, d does it silently — d ascending puts −1 before +1 — but only because the delta values happen to sort that way. Swap the semantics (inclusive left_at) and the same expression becomes wrong; the honest form comments the convention at the sort. The seed plants a 10:00 departure against a 10:00 arrival precisely so a naive ORDER BY t alone reports one too many.",
      "The second output column — the earliest moment the peak is REACHED — is a running-sum query with a filter, not a second problem: once ordered AS occ, the rows where occ equals the global MAX are every moment the count touches the peak, and MIN(t) over them is the first. The subtlety is what a row of the ordered set MEANS: it is the state AFTER processing that event, so 'the moment the peak is reached' is the timestamp of the arrival that completed it — exactly the t carried on that row. A dip-and-return to the peak adds later rows to the filtered set; MIN discards them.",
    ],
    edges: [
      "The 10:00 boundary: visit 3 leaves at 10:00 and visit 4 enters at 10:00 — ORDER BY t, d processes the departure first, so they never coexist; ORDER BY t alone makes the arrival win the tie and the peak reads one too high.",
      "A dip below and a fresh boundary: occupancy falls to 3 by 13:30 and never returns to the peak — the occ = MAX filter keeps exactly one row; and the 12:30 swap (visit 2 out, visit 8 in) is a second exclusive boundary the (t, d) ordering handles silently.",
      "An arrival and a departure of the SAME visit can share a timestamp with another visit's events — the sweep counts deltas, not visits, so double-booked moments in the events table are correct by construction.",
      "The occ column is computed with a ROWS frame pinned to UNBOUNDED PRECEDING: the default RANGE frame would fold equal (t, d) rows into one frame step and stamp the same pre-sum on both — with two arrivals at 11:45 the peak moment could vanish entirely.",
    ],
    ladder: [
      { title: "Brute force — pairwise overlap count", body: "For every visit, count visits whose [entered, left) interval contains its entered_at; take the max. O(n²), correct, and the definition the sweep-line proves equivalent." },
      { title: "The pattern — events and a running sum", body: "UNION ALL arrivals and departures into one (t, d) stream; ORDER BY t, d; SUM(d) OVER … UNBOUNDED PRECEDING is the occupancy curve; MAX reads the peak." },
      { title: "The optimal idea — the timeline IS the index", body: "O(n log n) for the sort, O(n) for the sweep. The durable rule: interval concurrency questions become sequence questions the moment you split intervals into signed events — and the tie convention lives in the sort spec, not in commentary." },
    ],
    approach: "UNION ALL signed events, running SUM over (t, d) with an explicit ROWS frame, MAX for the peak, MIN(t) over the peak rows for since",
    schema: {
      ddl: `CREATE TABLE Checkins (
  visit_id   INTEGER PRIMARY KEY,
  member_id  INTEGER NOT NULL,
  entered_at TEXT NOT NULL,
  left_at    TEXT NOT NULL
);`,
      seed: `INSERT INTO Checkins (visit_id, member_id, entered_at, left_at) VALUES
  (1, 11, '2025-03-03 09:00', '2025-03-03 10:30'),
  (2, 12, '2025-03-03 09:15', '2025-03-03 12:30'),
  (3, 13, '2025-03-03 09:30', '2025-03-03 10:00'),  -- leaves exactly when visit 4 enters
  (4, 14, '2025-03-03 10:00', '2025-03-03 12:00'),  -- the exclusive boundary
  (5, 15, '2025-03-03 10:15', '2025-03-03 13:30'),
  (6, 16, '2025-03-03 11:45', '2025-03-03 14:45'),  -- the peak completes here
  (7, 17, '2025-03-03 11:45', '2025-03-03 18:00'),  -- same-moment arrival: peak 5
  (8, 18, '2025-03-03 12:30', '2025-03-03 16:00'),  -- enters exactly as visit 2 leaves
  (9, 19, '2025-03-03 14:10', '2025-03-03 15:00'),
  (10, 20, '2025-03-03 15:30', '2025-03-03 17:00'),
  (11, 21, '2025-03-04 09:00', '2025-03-04 09:40'); -- a quiet second day`,
      tables: [
        { name: "Checkins", note: "11 visits over 2 days — visit 3 departs exactly as visit 4 arrives, two members enter at 11:45 completing the peak of 5, and visit 2 departs exactly as visit 8 arrives" },
      ],
    },
    code: `WITH events AS (
    SELECT entered_at AS t, 1 AS d
    FROM Checkins
    UNION ALL
    SELECT left_at, -1
    FROM Checkins
),
ordered AS (
    SELECT t, d,
        SUM(d) OVER (ORDER BY t, d
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS occ
    FROM events
)
SELECT MAX(occ) AS peak_concurrent,
    (SELECT MIN(t) FROM ordered WHERE occ = (SELECT MAX(occ) FROM ordered)) AS since
FROM ordered;`,
    walkthrough: [
      "The events stream holds 22 rows: 11 arrivals (+1) and 11 departures (−1). Sorting by (t, d) puts every departure ahead of every arrival at the same timestamp — the 10:00 pair reads −1 then +1, so visit 4's arrival lands on a post-departure base of 2, not 3.",
      "The running sum walks the day: 1, 2, 3, back to 2 at the 10:00 swap, 3, 4, then 5 when the second 11:45 arrival lands — the peak, first and only touch. It decays from there: 4 after visit 4 leaves at noon, a hold at 4 through the 12:30 swap (visit 2 out, visit 8 in — −1 before +1), then 3 and below into the evening; the quiet second day never leaves single digits.",
      "The outer SELECT reads the peak (5) while the correlated subquery filters rows whose occ equals it and takes MIN(t) — 11:45, the first completion — shipping the single row (5, '2025-03-03 11:45').",
    ],
    time: "O(n log n) — the event sort dominates; the sweep and the filters are linear",
    space: "O(n) — two event rows per visit in the CTEs",
    followUps: [
      "Report the full occupancy timeline instead of the peak — how does dropping the MAX layer change the output, and why does every departure row now show the post-departure count?",
      "Exclude visits under 30 minutes before sweeping — where does the filter belong, and why does it change the peak if the shortest visit is the one completing it?",
    ],
    related: ["server-utilization-time", "user-activities-within-time-bounds", "find-longest-calls"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "median-order-value-by-region",
    statement:
      "OrderLog (order_id, region, total) records one row per order. The MEDIAN order value per region is: for an odd count, the middle value; for an even count, the average of the two middle values — and SQLite has no MEDIAN function, so you must build it. Report one row per region: columns region and median_value (the median of that region's totals, rounded to 2 decimals), ordered by region ascending. The seed mixes odd-sized and even-sized regions, plants ties at the middle positions, and includes a one-order region whose median is simply its own total.",
    examples: [
      {
        input: "a region with 5 orders, totals 10, 20, 30, 40, 90",
        output: "… 30.0 …",
        explanation:
          "Odd count: position (5+1)/2 = 3 alone is the middle — 30 — and the average over the single selected row is a no-op.",
      },
      {
        input: "a region with 4 orders, totals 10, 20, 30, 95",
        output: "… 25.0 …",
        explanation:
          "Even count: positions (4+1)/2 = 2 and (4+2)/2 = 3 — 20 and 30 — average to 25. One expression covers both parities because the two formulas coincide on odd n.",
      },
    ],
    constraints: [
      "one row per region: region, median_value (ROUND 2), ordered by region ascending",
      "odd count → the middle value; even count → the mean of the two middle values",
      "ties at the middle are values, not rows: the median of (20, 20, 30) is 20",
    ],
    breakdown: [
      "Median without MEDIAN is a position problem: per region, line the totals up in order and keep the middle position(s). ROW_NUMBER() OVER (PARTITION BY region ORDER BY total, order_id) assigns the positions; COUNT(*) OVER (PARTITION BY region) carries each row its region's size n. The two candidate positions are (n+1)/2 and (n+2)/2 with INTEGER division — for odd n both evaluate to the same middle row, for even n they pick the two centers — so the WHERE rn IN (…) filter is parity-agnostic by construction.",
      "The tiebreak inside ORDER BY is load-bearing: two orders sharing the middle total must still receive DISTINCT row numbers, and (total, order_id) makes the assignment deterministic. This matters for honesty even though the median VALUE is tie-blind — a non-deterministic sort could flip which tied row lands at position (n+1)/2, and with a third column in play (say, rounding before averaging) the output could wobble between runs. Determinism is free here; take it.",
      "The final AVG over the selected rows is the parity unifier: one middle row averages to itself; two average to their mean. GROUP BY region then aggregates 2-or-1 rows per region into the reported median, and ROUND(…, 2) cleans the even-count means. The one-order region falls out naturally: n = 1 puts both candidate positions at 1, the row survives, and AVG reads its own total — no special case, which is the whole elegance argument for the two-formula trick.",
    ],
    edges: [
      "The even region (4 orders): positions 2 and 3 average — a query that keeps only (n+1)/2 reports 20 instead of 25 and fails the compare.",
      "A tie sitting ON the middle: the 3-order region's totals are 20, 30, 30 — position 2 holds 30, and the median is 30; a DISTINCT before ranking would not change the value but would corrupt n if sizes were recomputed after.",
      "The one-order region (n = 1): both candidate positions collapse to 1 — the median is that order's total, exactly; forgetting the region entirely (an INNER JOIN shape, a HAVING n > 1) fails the row count.",
      "Integer division is the trick's engine: (n+1)/2 and (n+2)/2 in SQLite divide as integers because n is an INTEGER — write (n+1)/2.0 and the positions become non-integers, the IN-list matches nothing, and every region vanishes.",
    ],
    ladder: [
      { title: "Brute force — self-join on half the counts", body: "Per region, cross the ordered rows with a COUNT filter on both sides: totals ≥ the (n+1)/2-th and ≤ the (n+2)/2-th. Correct, quadratic, and unreadable." },
      { title: "The pattern — rank and take the middle", body: "One CTE: ROW_NUMBER ascending plus COUNT(*) OVER per region; WHERE rn BETWEEN the two integer-divided positions; AVG + ROUND outside." },
      { title: "The optimal idea — one expression, both parities", body: "O(n log n) per the partition sort. The durable rule: (n+1)/2 and (n+2)/2 coincide on odd n and bracket the middle on even n — median emulation is a position filter, never a value filter." },
    ],
    approach: "ROW_NUMBER + COUNT(*) OVER per region, filter rn IN ((n+1)/2, (n+2)/2), AVG and ROUND outside",
    schema: {
      ddl: `CREATE TABLE OrderLog (
  order_id INTEGER PRIMARY KEY,
  region   TEXT NOT NULL,
  total    REAL NOT NULL
);`,
      seed: `INSERT INTO OrderLog (order_id, region, total) VALUES
  (1, 'north', 120.0),
  (2, 'north', 80.0),
  (3, 'north', 150.0),
  (4, 'north', 95.0),
  (5, 'north', 210.0),   -- north: odd n=5, middle 120 -> 120.0
  (6, 'south', 60.0),
  (7, 'south', 45.0),
  (8, 'south', 75.0),
  (9, 'south', 300.0),   -- south: even n=4, middles 60/75 -> 67.5
  (10, 'east', 30.0),
  (11, 'east', 30.0),
  (12, 'east', 45.0),    -- east: tie straddling the middle (30 at pos 2), n=3 -> 30.0
  (13, 'west', 999.0);   -- west: one order -> its own total`,
      tables: [
        { name: "OrderLog", note: "13 orders over 4 regions — north odd-sized, south even-sized, east ties at the middle, west a single order" },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        region,
        total,
        ROW_NUMBER() OVER (PARTITION BY region
            ORDER BY total, order_id) AS rn,
        COUNT(*) OVER (PARTITION BY region) AS n
    FROM OrderLog
)
SELECT
    region,
    ROUND(AVG(total), 2) AS median_value
FROM ranked
WHERE rn IN ((n + 1) / 2, (n + 2) / 2)
GROUP BY region
ORDER BY region ASC;`,
    walkthrough: [
      "The CTE stamps all 13 orders: north's five get ranks 1–5 (80, 95, 120, 150, 210) with n = 5; south's four rank 1–4 (45, 60, 75, 300) with n = 4; east's three rank 1–3 (30, 30, 45) with n = 3; west's single order is rank 1 of 1.",
      "The position filter keeps the middles: north keeps rank 3 only (120); south keeps ranks 2 and 3 (60, 75); east keeps rank 2 (the first of the two tied 30s — the id tiebreak decides which, but the value is 30 either way); west keeps rank 1 (both formulas give 1).",
      "The outer AVG folds per region: (120) → 120.0, (60 + 75)/2 → 67.5, (30) → 30.0, (999) → 999.0 — four rows ordered north, south, east, west.",
    ],
    time: "O(n log n) — the per-region sorts; the filter and fold are linear",
    space: "O(n) — one stamped row per order in the CTE",
    followUps: [
      "Report each region's median AND its mean side by side — why does the mean drift from the median in the region holding the 300 outlier, and which is the honest “typical order“?",
      "Keep only regions whose median exceeds the store-wide median — what layer must the store-wide median live in, and why can't HAVING compute it?",
    ],
    related: ["second-highest-salary-ii", "human-trafic-distance-bands", "portfolio-weights"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "streak-week-bonus-ladder",
    statement:
      "Purchases (purchase_id, customer_id, purchased_on — a date) logs every purchase. A customer is on a STREAK in a given week when they purchased in consecutive calendar weeks; each streak's length is its number of distinct consecutive weeks. A loyalty program pays a one-time bonus per streak: 50 points for a streak of 3–4 weeks, 120 points for 5 or more — nothing shorter. Normalize each purchase to its week's Monday, fold same-customer same-week purchases into one week, and report every customer whose total bonus is positive: columns customer_id, best_streak (their longest streak in weeks) and total_bonus (the sum over their streaks), ordered by total_bonus descending, then customer_id ascending. The seed plants a streak that crosses the year boundary, a customer with two separate streaks, and an exactly-3-week boundary streak.",
    examples: [
      {
        input: "a customer purchases in the weeks of Dec 30 2024 and Jan 6 2025",
        output: "… one 2-week streak across New Year …",
        explanation:
          "Consecutiveness is measured on normalized Monday dates 7 days apart — the calendar year flipping underneath does not break the chain.",
      },
      {
        input: "a customer with streaks of 2 and 3 weeks",
        output: "… best_streak 3 · total_bonus 50 …",
        explanation:
          "Only the 3-week streak earns (50); the 2-week streak earns nothing — but it still counts as a separate island with its own length.",
      },
    ],
    constraints: [
      "one row per customer with total_bonus > 0: customer_id, best_streak, total_bonus",
      "weeks are Monday-normalized; same-week purchases fold to one week before streak logic",
      "bonus ladder per streak: 3–4 weeks → 50, ≥ 5 → 120, else 0; total_bonus sums the customer's streaks",
    ],
    breakdown: [
      "Consecutive WEEKS need a week SPINE, and the honest way to build it is date arithmetic, not the %W week number: strftime('%Y-%W') breaks at every year boundary (week 52 → week 1 reads like a 51-week gap). Normalizing each purchase to its week's Monday — date(purchased_on, '-' || ((strftime('%w') + 6) % 7) || ' days') — makes consecutive weeks exactly 7 days apart in julianday terms, forever, across New Years. The %w weekday is 0 = Sunday, so (w + 6) % 7 shifts to Monday-counting; the modifier string concatenates the computed offset into date().",
      "Islands over the week spine follow the two-sequence trick: per customer, LAG(week_start) reads the previous week, a CASE marks a break when the gap is not exactly 7 days (the first week has no previous and breaks by default via NULL comparison), and a running SUM of the break flags OVER (ORDER BY week_start) assigns each week a stable island id. GROUP BY (customer, island) then folds each island to its streak length — COUNT(*) counts distinct weeks because the spine was deduplicated first.",
      "The bonus ladder is a CASE on the folded lengths, and the customer-level rollup is where the report's two columns diverge: best_streak is MAX(weeks) across islands, total_bonus is SUM of per-island CASE values. A customer with two islands (2-week and 3-week) shows best 3 and bonus 50 — the maximum and the sum answer different questions and neither can be derived from the other. The HAVING total_bonus > 0 gate keeps only paying customers; using WHERE would be impossible (the bonus doesn't exist until after the fold), which is the layering lesson of the whole problem.",
    ],
    edges: [
      "The New Year bridge: Dec 30 2024 (Monday) and Jan 6 2025 (Monday) are exactly 7 apart — the gap test keeps one island; any %W-based scheme reports a 52-week jump and splits the streak.",
      "Two purchases in one week fold BEFORE streaking: the spine CTE groups by (customer, week_start), so a Tuesday-plus-Thursday double is one week — without the fold, a two-purchase week reads as a 2-week streak from one calendar week.",
      "The exactly-3-week streak is the ladder's boundary: 3 earns 50, 2 earns nothing — an off-by-one in the CASE (>= 4) silences the boundary customer entirely.",
      "The two-island customer: gaps split their weeks into islands of 2 and 3 — best_streak reads the 3, total_bonus reads 50, and a query reporting MAX(bonus-per-island) instead of SUM would also read 50 here but is wrong for any customer with TWO paying streaks.",
    ],
    ladder: [
      { title: "Brute force — walk each customer's weeks", body: "Pull each customer's distinct Mondays sorted, walk them counting 7-day runs by hand, apply the ladder per run. The engine expresses the walk as LAG + flag + running sum." },
      { title: "The pattern — normalize, island, fold, ladder", body: "Four CTEs: week spine (dedupe to Mondays), break flags via LAG, island ids via running SUM, then GROUP BY island for lengths; the outer query ladders and rolls up per customer." },
      { title: "The optimal idea — consecutiveness is a gap test on a normalized axis", body: "O(n log n). The durable rule: any “consecutive calendar units“ question dies on a naive week number — normalize to unit starts, then the 7-day (or 1-month) gap test is calendar-proof." },
    ],
    approach: "Monday-normalized week spine → LAG gap flags → running-SUM island ids → per-island lengths → CASE ladder → per-customer MAX + SUM rollup",
    schema: {
      ddl: `CREATE TABLE Purchases (
  purchase_id  INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL,
  purchased_on TEXT NOT NULL
);`,
      seed: `INSERT INTO Purchases (purchase_id, customer_id, purchased_on) VALUES
  -- customer 1: 5 consecutive weeks (2 in one week) -> 120, best 5
  (1, 1, '2025-01-06'), (2, 1, '2025-01-08'), (3, 1, '2025-01-13'),
  (4, 1, '2025-01-20'), (5, 1, '2025-01-27'), (6, 1, '2025-02-03'),
  -- customer 2: 2-week streak, 1-week gap, 3-week streak (boundary) -> 50, best 3
  (7, 2, '2025-01-06'), (8, 2, '2025-01-13'),
  (9, 2, '2025-01-27'), (10, 2, '2025-02-03'), (11, 2, '2025-02-10'),
  -- customer 3: cross-year streak (Dec 30 + Jan 6 + Jan 13) -> 50, best 3
  (12, 3, '2024-12-30'), (13, 3, '2025-01-06'), (14, 3, '2025-01-13'),
  -- customer 4: isolated weeks only -> no bonus, absent
  (15, 4, '2025-01-06'), (16, 4, '2025-01-20'), (17, 4, '2025-02-10');`,
      tables: [
        { name: "Purchases", note: "17 purchases over 4 customers — a double-purchase week, a two-island customer, a New Year bridge, and a no-bonus control" },
      ],
    },
    code: `WITH wk AS (
    SELECT
        customer_id,
        date(purchased_on,
            '-' || ((CAST(strftime('%w', purchased_on) AS INTEGER) + 6) % 7) || ' days'
        ) AS week_start
    FROM Purchases
    GROUP BY customer_id, week_start
),
seq AS (
    SELECT
        customer_id,
        week_start,
        CASE WHEN julianday(week_start)
                  - julianday(LAG(week_start) OVER (
                        PARTITION BY customer_id ORDER BY week_start)) = 7
             THEN 0 ELSE 1 END AS brk
    FROM wk
),
isl AS (
    SELECT customer_id, week_start,
        SUM(brk) OVER (PARTITION BY customer_id
            ORDER BY week_start
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS isl
    FROM seq
),
streaks AS (
    SELECT customer_id, isl, COUNT(*) AS weeks
    FROM isl
    GROUP BY customer_id, isl
)
SELECT
    customer_id,
    MAX(weeks) AS best_streak,
    SUM(CASE WHEN weeks >= 5 THEN 120
             WHEN weeks >= 3 THEN 50
             ELSE 0 END) AS total_bonus
FROM streaks
GROUP BY customer_id
HAVING total_bonus > 0
ORDER BY total_bonus DESC, customer_id ASC;`,
    walkthrough: [
      "The spine folds 17 purchases to 12 customer-weeks: customer 1's double (Jan 6 and 8) collapses to one Monday, and every date normalizes to its week's Monday — Dec 30 2024 and Jan 6 2025 stay distinct Mondays exactly 7 apart.",
      "Islands form per customer: customer 1's five Mondays chain (gap 7 each) into one island of 5; customer 2's Jan 6/13 pair is island 1 (2 weeks), the Jan-27/Feb-03/Feb-10 run is island 2 (3 weeks); customer 3's three Mondays bridge the year into one island of 3; customer 4's three Mondays each break — three islands of 1.",
      "The ladder pays customer 1's 5-week island 120, customer 2's 3-week island 50 (its 2-week island pays nothing), and customer 3's 3-week island 50; customer 4's islands all pay 0 and fall to the HAVING gate. Output: (1, 5, 120), (2, 3, 50), (3, 3, 50) — the tie at bonus 50 broken by id.",
    ],
    time: "O(n log n) — per-customer sorts in the window stages; the folds are linear",
    space: "O(w) — one row per distinct (customer, week) in the spine",
    followUps: [
      "Pay the ladder on the LONGEST streak only, not per streak — which aggregate changes, and how does the two-island customer's payout move?",
      "Report every customer including zero-bonus ones with 0 columns — which layer must change to admit customer 4, and why can't HAVING do it?",
    ],
    related: ["consecutive-available-seats-ii", "find-products-with-three-consecutive-digits", "sessionize-events"],
    order: "exact",
    xp: 35,
  },
];
