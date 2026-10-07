// Deep-dives — the SQL 50+ expansion, batch 4: streaks, gaps & recency
// (LC 1205, 1709, 1127, 1225, 1369 — re-authored, 5 problems). Engine-verified
// by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_MORE3_STREAKS: LcSqlDive[] = [
  {
    slug: "monthly-transactions-ii",
    statement:
      "Transactions records every payment attempt with its country, state and amount; Chargebacks lists transactions that were later reversed, together with the date the reversal happened. Build a monthly report per country with four metrics: approved_count and approved_amount from transactions whose state is approved, bucketed by the TRANSACTION date — and chargeback_count and chargeback_amount, bucketed by the CHARGEBACK date. A month/country row appears if either stream has activity for it. Order the report by month, then country.",
    examples: [
      {
        input:
          "Transactions: US approved 1000 on 2020-05-15 · US declined 300 on 2020-05-20 · DE approved 500 on 2020-05-18 · Chargebacks: the declined 300 transaction on 2020-05-25",
        output: "(2020-05,DE,1,500,0,0) · (2020-05,US,1,1000,1,300)",
        explanation:
          "US's May chargeback belongs to a DECLINED transaction — reversals ignore state — and is bucketed by 2020-05-25, the charge date, not the sale date.",
      },
      {
        input:
          "transaction 1 (US, approved 1000 on 2020-05-15) is charged back on 2020-06-01; DE has no June approvals but its declined 700 transaction is charged back on 2020-06-20",
        output: "(2020-06,DE,0,0,1,700) · (2020-06,US,1,2000,1,1000)",
        explanation:
          "Both June rows carry chargeback activity bucketed by the reversal date — id 1 reports in June even though its sale was approved in May — and DE's June row exists only because of the chargeback stream.",
      },
    ],
    constraints: [
      "approved metrics bucket by the transaction date; chargeback metrics bucket by the chargeback date — never the transaction date",
      "the chargeback stream ignores state: approved and declined transactions can both be reversed",
      "a month/country row appears if either stream has activity, with 0 on the missing side; order by trans_month then country",
    ],
    breakdown: [
      "The report fuses two event streams that share dimensions but disagree on the date grain: approvals are booked when the payment happens, chargebacks when the reversal happens. The tempting shortcut — aggregate each stream separately and stack the results — breaks the shape: UNION-ing two already-grouped branches yields one row per stream, so a month/country active in both shows up twice with zeros filling its gaps. The fix is to push the aggregation AFTER the union: normalize both streams into one tall list of (month, country, amount, side) rows, then GROUP BY exactly once. Reconciling two shaped outputs is painful; aggregating one unified grain is easy.",
      "The trap is the join-back: a chargeback row only knows trans_id and charge_date, so country and amount must come from re-joining Transactions — and the month is SUBSTR(charge_date, 1, 7), NOT the original transaction's month. Transaction 1 in the seed is approved in 2020-05 but charged back in 2020-06: it correctly feeds US's May approved_amount AND US's June chargeback_amount. The chargeback branch also must not filter on state — a declined transaction can still be reversed (seed id 2), and reversals of declined money are just as real to the ledger.",
      "Why UNION ALL rather than a join: a month/country key can exist in either stream alone — DE has no June approvals, yet its June row must appear because of a chargeback — which is precisely the full-outer-join shape. SQLite has no FULL OUTER JOIN, so emulating it means LEFT JOIN in both directions plus an unmatched-orphans branch across two different date grains; messy and easy to get subtly wrong. Flagging each stream's rows (1/0) and re-aggregating collapses the whole thing into a plain GROUP BY: SUM(approved_flag) is the count, a CASE gathers the amount on the matching side, and zeros fall out naturally wherever a stream is absent.",
    ],
    edges: [
      "Bucket chargebacks by charge_date — SUBSTR(charge_date, 1, 7) — even though country and amount come from the transaction row; using trans_date would silently move every reversal back to the sale month.",
      "The chargeback branch has no state filter — declined transactions get reversed too (seed id 2); WHERE state = 'approved' belongs only to the first branch.",
      "Aggregate AFTER the UNION ALL — pre-grouping each branch first would emit two rows per active month/country with zeros on the opposite side instead of one merged row.",
      "DE's 2020-06 row exists only via chargebacks — a key present in one stream still appears with 0 on the approved side; that is the full-outer shape the re-aggregation gives for free.",
    ],
    ladder: [
      { title: "Brute force — aggregate then stitch", body: "GROUP BY month/country over the approvals, again over the chargebacks, then stitch with a full-outer emulation: LEFT JOIN both ways plus the unmatched-orphans branch, COALESCE-ing zeros into the metrics. Correct, but four passes and merge logic that grows with every added metric." },
      { title: "The pattern — union the streams raw", body: "UNION ALL the two streams as unaggregated flagged rows — (month, country, amount, approved?, charged-back?) — re-joining Transactions to recover country and amount for the chargeback side, each bucketed on its own date column." },
      { title: "The optimal idea — one GROUP BY over a unified grain", body: "With both streams in one tall rowset, a single GROUP BY computes all four metrics: SUM of the flag is the count, a CASE picks up the amount. O(n log n) for the grouping sort, and a third stream is just one more SELECT in the union." },
    ],
    approach: "UNION ALL the approved and chargeback streams as flagged rows (chargebacks bucketed by charge_date), then one GROUP BY month/country",
    schema: {
      ddl: `CREATE TABLE Transactions (
  id         INTEGER PRIMARY KEY,
  country    TEXT NOT NULL,
  state      TEXT NOT NULL CHECK (state IN ('approved','declined')),
  amount     INTEGER NOT NULL,
  trans_date TEXT NOT NULL
);
CREATE TABLE Chargebacks (
  trans_id    INTEGER NOT NULL,
  charge_date TEXT NOT NULL,
  PRIMARY KEY (trans_id, charge_date)
);`,
      seed: `INSERT INTO Transactions (id, country, state, amount, trans_date) VALUES
  (1,'US','approved',1000,'2020-05-15'),
  (2,'US','declined',300,'2020-05-20'),
  (3,'US','approved',2000,'2020-06-10'),
  (4,'DE','approved',500,'2020-05-18'),
  (5,'DE','declined',700,'2020-06-01'),
  (6,'US','approved',400,'2020-07-01');
INSERT INTO Chargebacks (trans_id, charge_date) VALUES
  (1,'2020-06-01'),  -- approved in May, reversed in June: two different months
  (2,'2020-05-25'),  -- a DECLINED transaction reversed: this stream ignores state
  -- id 5 hands DE a June row although DE has no June approvals
  (5,'2020-06-20');`,
      tables: [
        { name: "Transactions", note: "6 payment attempts across US/DE, May–July 2020 — approved and declined mixed" },
        { name: "Chargebacks", note: "3 reversals — id 1 approved-in-May/reversed-in-June (the month trap), id 2 a declined transaction (the state trap), id 5 creates a chargeback-only month/country" },
      ],
    },
    code: `WITH streams AS (
    SELECT
        SUBSTR(trans_date, 1, 7) AS trans_month,  -- approvals bucket by the TRANSACTION month
        country,
        amount,
        1 AS approved_flag,
        0 AS chargeback_flag
    FROM Transactions
    WHERE state = 'approved'                      -- state filter lives ONLY here
    UNION ALL
    SELECT
        SUBSTR(c.charge_date, 1, 7),              -- the trap: reversals bucket by the CHARGE month
        t.country,
        t.amount,
        0,
        1
    FROM Chargebacks c
    JOIN Transactions t ON t.id = c.trans_id      -- chargebacks carry no country/amount of their own
)
SELECT
    trans_month,
    country,
    SUM(approved_flag)                                      AS approved_count,
    SUM(CASE approved_flag WHEN 1 THEN amount ELSE 0 END)   AS approved_amount,
    SUM(chargeback_flag)                                    AS chargeback_count,
    SUM(CASE chargeback_flag WHEN 1 THEN amount ELSE 0 END) AS chargeback_amount
FROM streams
GROUP BY trans_month, country      -- one grouping over the unified streams
ORDER BY trans_month, country;`,
    walkthrough: [
      "The approved branch streams four rows: (2020-05,US,1000,1,0), (2020-06,US,2000,1,0), (2020-05,DE,500,1,0), (2020-07,US,400,1,0) — declined ids 2 and 5 never enter this side.",
      "The chargeback branch re-joins Transactions and buckets by charge date: id 1 → (2020-06,US,1000,0,1) — JUNE, not the May sale — id 2 → (2020-05,US,300,0,1) despite being declined, id 5 → (2020-06,DE,700,0,1).",
      "One GROUP BY merges the seven flagged rows by (month, country): DE-05 (1,500,0,0), US-05 (1,1000,1,300), DE-06 (0,0,1,700), US-06 (1,2000,1,1000), US-07 (1,400,0,0) — ordered by month then country.",
    ],
    time: "O(n log n) — one union scan plus the GROUP BY sort over the combined streams",
    space: "O(n) — the unified stream, one row per event before aggregation",
    followUps: [
      "Add a net_amount column defined as approved_amount minus chargeback_amount, and argue whether reversals of declined money (seed id 2) belong in it.",
      "Rewrite the report with each branch pre-aggregated and stitched via two LEFT JOINs plus an orphans branch (the full-outer emulation) — count the passes and compare against the single GROUP BY.",
    ],
    related: ["monthly-transactions-i", "product-price-at-a-given-date", "user-activity-for-the-past-30-days-ii"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "biggest-window-between-events",
    statement:
      "UserVisits logs one row per visit with the user id and the visit date. For each user, find their biggest window between events: the longest stretch of days between two CONSECUTIVE visits. Report the user id, the window_start_date (the visit that opens the gap) and the window size in whole days. When two gaps tie for the longest, report the one with the earliest window_start_date — exactly one row per user. Users with a single visit have no consecutive pair and are left out. Order by user id.",
    examples: [
      {
        input: "user 1 visits on 2023-01-01, 2023-01-02 and 2023-02-10",
        output: "(1,'2023-01-02',39)",
        explanation: "The gap between 01-02 and 02-10 spans 39 days — far longer than the 1-day gap between the January visits — and the window opens at the visit BEFORE the silence.",
      },
      {
        input: "user 2 visits on 2023-03-01, 2023-03-09 and 2023-03-17",
        output: "(2,'2023-03-01',8)",
        explanation: "Both gaps are 8 days; the tie resolves to the earlier window_start_date, so exactly one row comes back.",
      },
    ],
    constraints: [
      "a window is the day distance between two CONSECUTIVE visits of the same user, opening at the earlier visit",
      "ties on the biggest window resolve to the earliest window_start_date — one row per user, never two",
      "users with fewer than two visits are excluded; output ordered by user_id",
    ],
    breakdown: [
      "A gap lives between PAIRS of adjacent visits, and pairs do not exist in the table — every row only knows its own date. LEAD(visit_date) OVER (PARTITION BY user_id ORDER BY visit_date) manufactures the pair: for each visit it fetches the next visit's date within the same user's timeline. The gap is then ordinary arithmetic on the pair — julianday(next) minus julianday(visit) — because SQLite has no DATEDIFF; julianday converts a 'YYYY-MM-DD' string into a Julian day number and the subtraction yields days. CAST to INTEGER keeps window_size an exact whole number for date-only strings.",
      "LEAD's tail is a built-in edge: the last visit of every user has no next row, so LEAD returns NULL and the gap is undefined. Filtering next_date IS NOT NULL drops exactly those tails — and a user with a single visit loses their only row, which is why they disappear from the answer entirely rather than reporting a zero window. That is the honest reading of 'window between consecutive visits': with no pair, there is no window.",
      "Picking each user's biggest gap is argmax again, but with a tie policy that must yield ONE row: the earliest window_start. ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY window_size DESC, window_start_date ASC) sorts biggest-first and breaks ties toward the earlier start; rn = 1 keeps exactly one row per user. RANK would be wrong here in a quiet way: user 2's seed has TWO 8-day gaps, and RANK would award both rank 1 and emit two rows — breaking the one-row contract and leaving ORDER BY user_id non-deterministic. The rule of thumb: keep every tie with RANK, keep exactly one with ROW_NUMBER and the tiebreaker moved INTO the window's ORDER BY.",
    ],
    edges: [
      "The last visit per user has no LEAD — NULL next_date is filtered, and single-visit user 3 vanishes because their only row IS the tail.",
      "User 2's two 8-day gaps tie — ROW_NUMBER with window_start_date ASC in the window keeps the earliest start (03-01); RANK would have emitted both rows.",
      "julianday() is SQLite's date arithmetic — there is no DATEDIFF; CAST(... AS INTEGER) turns the midnight-anchored Julian difference into exact whole days.",
      "window_start_date is the EARLIER visit of the pair — the window opens where the user went quiet, not where they returned.",
    ],
    ladder: [
      { title: "Brute force — self-join the pairs", body: "For each visit, self-join the next visit of the same user (or NOT EXISTS 'no visit strictly between them') to enumerate consecutive pairs, compute the day diff, then pick the max per user with an early-start tiebreak. Three passes and careful adjacency reasoning." },
      { title: "The pattern — LEAD makes the pairs", body: "One window pass attaches next_date to every row; the gap falls out as julianday arithmetic on that pair. This is the canonical gap-maker: partition by user, order by date, look one row ahead." },
      { title: "The optimal idea — rank the gaps, keep one", body: "ROW_NUMBER over (gap DESC, start ASC) per user answers 'biggest, then earliest' inside the same sort, and rn = 1 finishes. O(n log n) for the per-user sorts, no self-join, no max-peeling." },
    ],
    approach: "LEAD(visit_date) per user makes consecutive pairs, julianday diff is the gap, ROW_NUMBER (gap DESC, start ASC) = 1 keeps the earliest biggest",
    schema: {
      ddl: `CREATE TABLE UserVisits (
  user_id    INTEGER NOT NULL,
  visit_date TEXT NOT NULL,
  PRIMARY KEY (user_id, visit_date)
);`,
      seed: `INSERT INTO UserVisits (user_id, visit_date) VALUES
  (1,'2023-01-01'),(1,'2023-01-02'),(1,'2023-02-10'),
  (2,'2023-03-01'),(2,'2023-03-09'),(2,'2023-03-17'),
  (3,'2023-04-01');`,
      tables: [
        { name: "UserVisits", note: "7 visits for 3 users — user 1 has a clear 39-day gap; user 2 has TWO equal 8-day gaps (the tie trap); user 3 has a single visit and is dropped" },
      ],
    },
    code: `WITH gaps AS (
    SELECT
        user_id,
        visit_date,
        LEAD(visit_date) OVER (
            PARTITION BY user_id
            ORDER BY visit_date
        ) AS next_date              -- NULL on each user's last visit
    FROM UserVisits
),
spans AS (
    SELECT
        user_id,
        visit_date AS window_start_date,
        CAST(julianday(next_date) - julianday(visit_date) AS INTEGER) AS window_size
    FROM gaps
    WHERE next_date IS NOT NULL     -- the tail has no pair → no window (single-visit users vanish)
),
best AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY user_id
            ORDER BY window_size DESC, window_start_date ASC
        ) AS rn                     -- biggest gap first; tie → earliest start, exactly one row
    FROM spans
)
SELECT user_id, window_start_date, window_size
FROM best
WHERE rn = 1
ORDER BY user_id;`,
    walkthrough: [
      "gaps pairs each visit with the next: user 1 → 01-01→01-02 and 01-02→02-10; user 2 → 03-01→03-09 and 03-09→03-17; user 3's 04-01 gets a NULL next_date and is filtered — no consecutive pair, no window.",
      "spans sizes the windows: user 1 has gaps of 1 day and 39 days; user 2 has two 8-day windows, starting 03-01 and 03-09.",
      "best ranks biggest-first with the earliest-start tiebreak: user 1 keeps (01-02, 39); user 2's tie resolves to (03-01, 8) — one row per user, ordered by user id.",
    ],
    time: "O(n log n) — one ordered pass for LEAD plus the per-user ranking sort",
    space: "O(n) — the paired and ranked rows",
    followUps: [
      "Report EVERY user's longest gap, with single-visit users showing NULL window columns — keep the tail rows and let the size be NULL instead of filtering.",
      "Find the biggest gap calendar-wide across all users combined — how does dropping the PARTITION change what 'consecutive' means?",
    ],
    related: ["active-users", "game-play-analysis-v", "the-latest-login-in-2020"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "user-purchase-platform",
    statement:
      "Purchases logs every purchase with the user, the date, the amount and the platform it was made on: mobile or desktop. A user is a mobile-only streaker if there are 7 CONSECUTIVE calendar days on which they purchased on mobile and spent nothing on desktop. Report the percentage of the platform's total spend that comes from those users — their ALL-TIME spend across both platforms, not just the streak — rounded to 2 decimals. Return a single percentage.",
    examples: [
      {
        input: "user 1 buys on mobile every day 2023-01-01 through 2023-01-07 (10.0 a day) and once on desktop 2023-01-20 (30.0)",
        output: "user 1 qualifies",
        explanation: "Seven straight mobile-only days clear the bar; the later desktop purchase sits outside the streak and does not break it — but it does count toward the user's total spend.",
      },
      {
        input: "user 4 buys on mobile 2023-04-01 through 2023-04-08 except a 20.0 desktop purchase on 2023-04-05",
        output: "user 4 does not qualify",
        explanation: "The desktop day fails the mobile-only test and splits the run into 4 + 3 days — one desktop row kills the streak.",
      },
    ],
    constraints: [
      "a mobile-only day is one where the user spent on mobile and spent nothing on desktop",
      "streaks run on calendar-consecutive days; a user qualifies if ANY run reaches 7 days",
      "output: single percentage — qualifying users' all-time spend × 100 ÷ all users' spend, rounded to 2 decimals",
    ],
    breakdown: [
      "This is a streak problem wearing a finance costume: the hard part is finding 7 consecutive mobile-only days, and the money is an epilogue. First normalize the grain — a user can buy twice in one day, once per platform — so GROUP BY (user_id, purchase_date) with two conditional SUMs builds one row per user-day carrying mobile_spend and desktop_spend. A day is mobile-only exactly when mobile_spend > 0 AND desktop_spend = 0; 'absent' and 'zero' collapse into the same test once the day has been aggregated.",
      "Run detection is the gaps-and-islands anchor: number each user's mobile-only days 1..k by date, then subtract the row number from the day index. On an unbroken run the calendar and the counter advance in lockstep, so day-index minus rn stays CONSTANT across the run; GROUP BY (user_id, anchor) then counts each run's length. CAST(julianday(purchase_date) AS INTEGER) supplies the day index — julianday of a date-only string anchors at midnight and truncating drops the .5, so consecutive days differ by exactly 1; there is no DATEDIFF in SQLite, julianday arithmetic is the tool. The user qualifies the moment ANY run reaches the bar — run_len >= 7, never = 7, because a 10-day run contains a 7-day run inside it.",
      "The percentage flips the grain one last time: qualified is a SET of user ids, but money lives on the purchase rows — so re-attach the flag with a LEFT JOIN back to Purchases and aggregate with a CASE. SUM(CASE WHEN matched THEN spend ELSE 0 END) × 100.0 ÷ SUM(spend) is the share; multiplying by 100.0 (a REAL) forces float division before ROUND(..., 2) trims the result. Note what is NOT asked: a ratio of USERS would count qualifiers over the user list — here every cent counts equally, which is why the join-back happens on purchases, not on distinct users.",
    ],
    edges: [
      "User 4 has eight straight mobile days but a desktop purchase on day 5 — that day fails desktop_spend = 0 and splits the run into 4 + 3; a single desktop row kills the streak.",
      "User 2's six-day run sits exactly one day short — the boundary is run_len >= 7, and user 1's seed streak is EXACTLY 7, so an off-by-one flips the whole answer.",
      "The percentage uses the qualifiers' ALL-TIME spend — user 1's 30.0 desktop purchase on 01-20 still counts toward their total; filtering it out would understate the share.",
      "Multiply by 100.0 BEFORE dividing so the arithmetic is float, then ROUND(..., 2) — integer division would floor the share before rounding.",
    ],
    ladder: [
      { title: "Brute force — probe every window", body: "For each (user, day), self-join to confirm the next six dates exist AND none of the seven days carries a desktop purchase. A 7-way join per candidate day — correct but combinatorial and brutal to debug." },
      { title: "The pattern — islands via day-index minus row number", body: "Aggregate to user-day grain, keep the mobile-only days, anchor each run with CAST(julianday(date) AS INTEGER) − ROW_NUMBER(), and COUNT(*) per anchor for run lengths — the same lockstep trick as any streak problem." },
      { title: "The optimal idea — any run ≥ 7, then join the money back", body: "EXISTS run_len >= 7 defines the qualifying set once; a LEFT JOIN back to Purchases computes the spend share in a single aggregation. O(n log n) for the per-user ordering, one pass over the money." },
    ],
    approach: "Aggregate to user-day, anchor mobile-only runs by day-index − ROW_NUMBER, qualify users with any run ≥ 7, then qualifiers' spend × 100 / total spend",
    schema: {
      ddl: `CREATE TABLE Purchases (
  user_id       INTEGER NOT NULL,
  purchase_date TEXT NOT NULL,
  spend         REAL NOT NULL,
  source        TEXT NOT NULL CHECK (source IN ('mobile','desktop')),
  PRIMARY KEY (user_id, purchase_date, source)
);`,
      seed: `INSERT INTO Purchases (user_id, purchase_date, spend, source) VALUES
  (1,'2023-01-01',10.0,'mobile'),(1,'2023-01-02',10.0,'mobile'),
  (1,'2023-01-03',10.0,'mobile'),(1,'2023-01-04',10.0,'mobile'),
  (1,'2023-01-05',10.0,'mobile'),(1,'2023-01-06',10.0,'mobile'),
  (1,'2023-01-07',10.0,'mobile'),
  (1,'2023-01-20',30.0,'desktop'),   -- outside the streak, but counts in user 1's total
  (2,'2023-02-01',10.0,'mobile'),(2,'2023-02-02',10.0,'mobile'),
  (2,'2023-02-03',10.0,'mobile'),(2,'2023-02-04',10.0,'mobile'),
  (2,'2023-02-05',10.0,'mobile'),(2,'2023-02-06',10.0,'mobile'),  -- six days: one short!
  (3,'2023-03-01',100.0,'desktop'),(3,'2023-03-02',120.0,'desktop'),
  (4,'2023-04-01',10.0,'mobile'),(4,'2023-04-02',10.0,'mobile'),
  (4,'2023-04-03',10.0,'mobile'),(4,'2023-04-04',10.0,'mobile'),
  (4,'2023-04-05',10.0,'mobile'),(4,'2023-04-05',20.0,'desktop'), -- breaks the run: 4 + 3
  (4,'2023-04-06',10.0,'mobile'),(4,'2023-04-07',10.0,'mobile'),
  (4,'2023-04-08',10.0,'mobile');`,
      tables: [
        { name: "Purchases", note: "25 purchase rows for 4 users — user 1: an exact 7-day mobile streak plus a later desktop buy; user 2: 6 days (just misses); user 3: desktop-only; user 4: 8 mobile days broken mid-run by a desktop purchase on 04-05" },
      ],
    },
    code: `WITH daily AS (                 -- one row per user per day, spend split by platform
    SELECT
        user_id,
        purchase_date,
        SUM(CASE WHEN source = 'mobile'  THEN spend ELSE 0 END) AS mobile_spend,
        SUM(CASE WHEN source = 'desktop' THEN spend ELSE 0 END) AS desktop_spend
    FROM Purchases
    GROUP BY user_id, purchase_date
),
mobile_days AS (                -- a mobile-only day: mobile money moved, desktop did not
    SELECT user_id, purchase_date
    FROM daily
    WHERE mobile_spend > 0 AND desktop_spend = 0
),
grp AS (                        -- gaps-and-islands: constant key across a consecutive run
    SELECT
        user_id,
        CAST(julianday(purchase_date) AS INTEGER)
            - ROW_NUMBER() OVER (
                  PARTITION BY user_id
                  ORDER BY purchase_date
              ) AS grp
    FROM mobile_days
),
runs AS (
    SELECT user_id, grp, COUNT(*) AS run_len
    FROM grp
    GROUP BY user_id, grp
),
qualified AS (
    SELECT DISTINCT user_id     -- >= 7: a longer run CONTAINS a 7-day run
    FROM runs
    WHERE run_len >= 7
)
SELECT
    ROUND(
        SUM(CASE WHEN q.user_id IS NOT NULL THEN p.spend ELSE 0 END) * 100.0
        / SUM(p.spend),
        2
    ) AS percentage
FROM Purchases p
LEFT JOIN qualified q ON q.user_id = p.user_id;   -- single row → no ORDER BY needed`,
    walkthrough: [
      "daily collapses the 25 purchase rows to 24 user-days (user 4's 04-05 holds both platforms): user 1's 01-01…01-07 all read mobile 10.0 / desktop 0.0; user 4's 04-05 reads mobile 10.0 / desktop 20.0 and fails the mobile-only test.",
      "Anchors: user 1's seven days map to one grp key → run of 7 → qualified; user 2's six days → run of 6, one short; user 4 splits into runs of 4 (04-01…04) and 3 (04-06…08); user 3 has no mobile days at all.",
      "qualified = {1}; joining back to Purchases: user 1's spend is 70.0 mobile + 30.0 desktop = 100.0 of a 480.0 total → 100.0 × 100.0 ÷ 480.0 = 20.833… → ROUND 2 → 20.83.",
    ],
    time: "O(n log n) — the user-day grouping and the per-user run ordering dominate",
    space: "O(n) — the daily, anchored and run rowsets",
    followUps: [
      "Report the qualifying streaks themselves (user, start, end, length) instead of the money — MIN and MAX of purchase_date inside the runs GROUP BY.",
      "Also compute the USERS ratio (qualifiers ÷ all users) beside the spend ratio, and explain when the two numbers diverge.",
    ],
    related: ["active-users", "game-play-analysis-v", "immediate-food-delivery-ii"],
    order: "any",
    xp: 35,
  },
  {
    slug: "report-contiguous-dates",
    statement:
      "Failed holds one row per day on which at least one submission failed, with the submitted_date and the state (this log only records outright failures, so every row is 'failed'). Group the failed days into contiguous periods: maximal runs of calendar-consecutive dates. Report each period's period_start and period_end, ordered by period start. Single-day runs are periods too — their start and end are the same date.",
    examples: [
      {
        input: "failed days: 2023-01-01, 2023-01-02, 2023-01-03, 2023-01-08, 2023-01-09, 2023-01-15",
        output: "(2023-01-01,2023-01-03) · (2023-01-08,2023-01-09) · (2023-01-15,2023-01-15)",
        explanation: "The 4-day hole after 01-03 and the 5-day hole after 01-09 split the log into three periods; the lone 01-15 is still a period of length one.",
      },
      {
        input: "if 2023-01-04 were also a failed day",
        output: "the first period becomes (2023-01-01,2023-01-04)",
        explanation: "Consecutive days extend the run — one extra date, same group — which is exactly what the anchor arithmetic detects.",
      },
    ],
    constraints: [
      "periods are maximal runs of calendar-consecutive failed days; a hole of one or more days starts a new period",
      "one row per day in the log — the sequence being grouped is strictly one row per failed day",
      "output columns: period_start, period_end, ordered by period_start",
    ],
    breakdown: [
      "Sorting the dates shows the pattern immediately — runs of back-to-back days separated by holes — but GROUP BY alone cannot see runs: aggregation sees an unordered bag. The gaps-and-islands trick restores sequence: number the days 1..k in date order with ROW_NUMBER, and compute grp = day_index − row_number. On a consecutive run the calendar index and the counter climb together, so every day of a run lands on the SAME grp value; the first day after a hole jumps the index by more than 1 and starts a new key. One arithmetic column turns 'detect runs' into 'GROUP BY grp'.",
      "Concretely, CAST(julianday(submitted_date) AS INTEGER) is the day index — julianday of a date-only string anchors at midnight and truncating drops the .5, so consecutive days differ by exactly 1. ROW_NUMBER is deliberately chosen over RANK: RANK assigns equal numbers to tied rows and skips the positions beneath them, which would wreck the lockstep the moment two rows shared a date. This log guarantees one row per failed day via its primary key, but the honest recipe is still to dedupe first — SELECT DISTINCT submitted_date — so the sequence being numbered is strictly one-per-day even if the guarantee ever changes.",
      "Collapsing is then trivial: GROUP BY grp with MIN(submitted_date) as period_start and MAX(submitted_date) as period_end — the earliest and latest day sharing an anchor. A run of length 1 (the seed's 2023-01-15) survives as its own group with start equal to end; no special case, no run-length filter. The LEAD alternative exists — mark a day as a period terminator when the next date is not d+1, then pair terminators with their period starts — but it needs two windowed passes plus stitching, while the anchor needs one arithmetic column and one GROUP BY.",
    ],
    edges: [
      "grp = day-index − ROW_NUMBER: both sides move by exactly 1 per consecutive day, so runs collapse to one key — a single missed day shifts the index and starts a fresh key.",
      "ROW_NUMBER, not RANK — tied dates would repeat a number and desynchronize the lockstep; the DISTINCT keeps the sequence strictly one row per day.",
      "2023-01-15 is a run of one: it forms its own period with start = end — no filtering on run length.",
      "This is a simple GROUP BY query, so ORDER BY period_start may use the output alias — ordinal positions (ORDER BY 1) are only forced for compound SELECTs in this sandbox.",
    ],
    ladder: [
      { title: "Brute force — walk the sorted list", body: "Sort the dates in application code (or a cursor), start a new period whenever the previous date is not d−1, and emit MIN/MAX per walk. Works, but it is procedural — SQL cannot even express 'the previous row' without a window, so the logic leaks out of the query." },
      { title: "The pattern — the islands anchor", body: "ROW_NUMBER over the deduped dates, subtract from the julianday day index, GROUP BY the anchor with MIN/MAX. One pass to number, one to collapse." },
      { title: "The optimal idea — the anchor IS the period id", body: "No LAG, no start/end flags, no second window: one arithmetic key and one GROUP BY. Adding 'days failed per period' is one more aggregate on the same grouping. O(n log n) for the date sort." },
    ],
    approach: "grp = julianday day-index − ROW_NUMBER collapses consecutive runs into one key; GROUP BY grp with MIN/MAX dates",
    schema: {
      ddl: `CREATE TABLE Failed (
  submitted_date TEXT PRIMARY KEY,   -- one row per failed day (the re-authored log)
  state          TEXT NOT NULL CHECK (state = 'failed')
);`,
      seed: `INSERT INTO Failed (submitted_date, state) VALUES
  ('2023-01-01','failed'),('2023-01-02','failed'),('2023-01-03','failed'),
  ('2023-01-08','failed'),('2023-01-09','failed'),
  ('2023-01-15','failed');`,
      tables: [
        { name: "Failed", note: "6 failed days — a run of 3 (01-01…01-03), a run of 2 (01-08…01-09) and a SINGLE day (01-15); the multi-day holes keep the runs apart" },
      ],
    },
    code: `WITH days AS (
    SELECT DISTINCT submitted_date   -- one row per day: the lockstep needs it (defensive under the PK)
    FROM Failed
),
grp AS (
    SELECT
        submitted_date,
        CAST(julianday(submitted_date) AS INTEGER)
            - ROW_NUMBER() OVER (ORDER BY submitted_date) AS grp
                                       -- constant across a consecutive run
    FROM days
)
SELECT
    MIN(submitted_date) AS period_start,
    MAX(submitted_date) AS period_end
FROM grp
GROUP BY grp
ORDER BY period_start;                 -- simple GROUP BY query → the output alias is fine`,
    walkthrough: [
      "days keeps the six failed dates; ROW_NUMBER numbers them 1–6 by date while the truncated julianday index climbs 1-2-3, jumps over the hole to 08-09, then jumps again to 15 — grp stays constant inside each run and changes exactly at the holes.",
      "Run 1 (01-01…01-03) shares one grp key, run 2 (01-08…01-09) a second, the lone 01-15 a third — three groups, one per period, with no length-based special case.",
      "GROUP BY grp collapses each to its MIN/MAX: (2023-01-01, 2023-01-03), (2023-01-08, 2023-01-09), (2023-01-15, 2023-01-15) — ordered by period_start.",
    ],
    time: "O(n log n) — the date ordering that drives the numbering and the final sort",
    space: "O(n) — the deduped days and one row per period",
    followUps: [
      "Count how many days failed in each period (COUNT(*)) and rank the periods by length — one extra aggregate on the same GROUP BY.",
      "Re-solve with LEAD: mark a day as a period END when the next date is not d+1, then join the ends to the starts that precede them — compare the pass count against the anchor.",
    ],
    related: ["active-users", "immediate-food-delivery-ii", "last-person-to-fit-in-the-elevator"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "second-most-recent-activity",
    statement:
      "UserActivity logs user sessions: an activity name together with the date the session started and the date it ended. For each user, report their SECOND most recent activity — the session whose startDate is beaten by exactly one later-starting session. Users with only one activity are excluded. Mind the ties: two sessions sharing a startDate occupy two recency slots, so a user whose two most recent sessions started the same day has no second most recent at all. Output username, activity, startDate and endDate, ordered by username then most recent first.",
    examples: [
      {
        input: "Bob: Login starts 2020-03-01 · Browse starts 2020-02-20",
        output: "('Bob','Browse','2020-02-20','2020-02-21')",
        explanation: "Login is the most recent, so Browse — beaten by exactly one later-starting session — is Bob's second most recent activity.",
      },
      {
        input: "Alice: Landing Page and Checkout both start 2020-02-10 · Sign Up starts 2020-01-28",
        output: "Alice is excluded",
        explanation: "The two tied sessions occupy recency slots 1 and 2, pushing Sign Up to slot 3 — no session is beaten by exactly one later starter, so Alice has no second most recent activity.",
      },
    ],
    constraints: [
      "the second most recent session is the one with exactly one strictly-later startDate — RANK() = 2 per user",
      "sessions tied on startDate share a rank and consume the positions beneath them; such users may have no rank 2",
      "users with a single activity are excluded; output username, activity, startDate, endDate ordered by username then startDate DESC",
    ],
    breakdown: [
      "'Second most recent' is a per-group ordinal question, and LIMIT-per-group does not exist in SQL — there is no ORDER BY startDate DESC LIMIT 1 OFFSET 1 'per username'. Window functions make the ordinal explicit: RANK() OVER (PARTITION BY username ORDER BY startDate DESC) tags every session with its recency position inside the user's timeline, and WHERE rnk = 2 keeps exactly the second ones. This is the same rank-once-filter-later shape as any top-k-per-group question, with k = 2 and a partition instead of a global sort.",
      "The function choice IS the problem. RANK counts ROWS ahead: a session at rank 2 has exactly one row strictly more recent, while two sessions tied on startDate share rank 1 and push the next distinct date down to rank 3. DENSE_RANK counts LEVELS instead — tied sessions would form one recency level and the next date would sit at dense rank 2, resurrecting users that RANK drops. The seed stages the contrast: Alice's two most recent sessions both start 2020-02-10, so her Sign Up session lands at rank 3 and Alice vanishes — under DENSE_RANK she would have appeared. Pick the function that matches the contract, not the one that returns more rows.",
      "The single-activity user needs no code at all: Cara's only session is rank 1, rank 2 simply does not exist in her partition, and the rnk = 2 filter drops her for free — the same mechanism that catches Alice. That is the quiet advantage of ranking over max-peeling tricks: exclusion rules become properties of the rank sequence rather than extra CASE branches. One CTE, one window, one filter — and ORDER BY username, startDate DESC finishes a fully deterministic presentation.",
    ],
    edges: [
      "RANK, not DENSE_RANK — Alice's tied pair share rank 1 and her next session is rank 3, so no rank-2 row exists for her; DENSE_RANK would have returned it.",
      "Cara's single session is rank 1 only — the rnk = 2 filter excludes her without a COUNT or HAVING in sight.",
      "Ties share the rank value but consume the positions beneath — 'second most recent' means one ROW strictly ahead, not one distinct DATE ahead; the seed's tie pair makes the difference visible.",
      "ORDER BY username, startDate DESC is fully deterministic here because every surviving row is unique within its user — a tie AT rank 2 would have needed an extra sort key.",
    ],
    ladder: [
      { title: "Brute force — peel the max", body: "Per user, drop their most recent startDate (a correlated MAX or a NOT EXISTS probe), then repeat for the remainder — max-peeling, twice, plus a hand-rolled count of more-recent rows to detect the tie case. Correct but three scans per user." },
      { title: "The pattern — rank the timeline", body: "RANK() OVER (PARTITION BY username ORDER BY startDate DESC) in a CTE; rnk = 2 is the answer set. Ties and single-activity exclusions fall out of the rank arithmetic on their own." },
      { title: "The optimal idea — rank once, ask anything", body: "The ranked CTE answers rnk = 2 today and 'third most recent' or 'most recent N' tomorrow by changing one literal. O(n log n) for the per-user sorts, no per-row rescans, no repeated max-peeling." },
    ],
    approach: "RANK() OVER (PARTITION BY username ORDER BY startDate DESC), keep rank 2 — single-activity users have no rank 2 to keep",
    schema: {
      ddl: `CREATE TABLE UserActivity (
  id        INTEGER PRIMARY KEY,
  username  TEXT NOT NULL,
  activity  TEXT NOT NULL,
  startDate TEXT NOT NULL,
  endDate   TEXT NOT NULL
);`,
      seed: `INSERT INTO UserActivity (id, username, activity, startDate, endDate) VALUES
  (1,'Alice','Landing Page','2020-02-10','2020-02-11'),
  (2,'Alice','Checkout','2020-02-10','2020-02-12'),  -- ties with row 1: the two most recent share a start
  (3,'Alice','Sign Up','2020-01-28','2020-01-28'),
  (4,'Bob','Login','2020-03-01','2020-03-01'),
  (5,'Bob','Browse','2020-02-20','2020-02-21'),
  (6,'Cara','Sign In','2020-03-05','2020-03-05');`,
      tables: [
        { name: "UserActivity", note: "6 sessions for 3 users — Alice's two most recent TIE on startDate so her third session falls to rank 3 (dropped); Bob has 2 (returns his second); Cara has 1 (dropped)" },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        username,
        activity,
        startDate,
        endDate,
        RANK() OVER (
            PARTITION BY username
            ORDER BY startDate DESC
        ) AS rnk    -- ties share a rank value AND consume the positions beneath
    FROM UserActivity
)
SELECT username, activity, startDate, endDate
FROM ranked
WHERE rnk = 2       -- second most recent; single-activity users have no rank 2
ORDER BY username, startDate DESC;`,
    walkthrough: [
      "ranked orders each user's sessions DESC by startDate: Alice — Checkout and Landing Page tie at rank 1 (both 2020-02-10) while Sign Up lands at rank 3; Bob — Login 1, Browse 2; Cara — Sign In 1.",
      "WHERE rnk = 2: Alice has no rank-2 row — her tie pair consumed slots 1 and 2 — and Cara never gets past rank 1; only Bob's Browse qualifies.",
      "Output is exactly ('Bob','Browse','2020-02-20','2020-02-21') — under DENSE_RANK Alice's Sign Up would have surfaced at dense rank 2; the RANK choice is the contract.",
    ],
    time: "O(n log n) — one partitioned sort by startDate",
    space: "O(n) — the ranked rowset",
    followUps: [
      "Return each user's MOST recent activity alongside their second — the same CTE filtered to rnk IN (1, 2), and note which users contribute how many rows.",
      "Switch the contract to DENSE_RANK ('one distinct DATE ahead = second level') and predict which users reappear before running it.",
    ],
    related: ["rank-scores", "department-top-three-salaries", "the-latest-login-in-2020"],
    order: "exact",
    xp: 35,
  },
];
