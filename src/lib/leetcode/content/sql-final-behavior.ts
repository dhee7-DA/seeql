// Deep-dives — the SQL Extras "behavior analytics" band: per-day parity pivots,
// trial→paid conversion, half-year efficiency deltas, peak-hour regulars and
// churn-risk profiles (LC 3220 / 3497 / 3601 / 3705 / 3716). Solutions are
// SQLite dialect, one statement each, engine-verified against the per-problem
// seeds (the negative refunds, boundary timestamps, flat years and claw-back
// upgrades are the traps).
import type { LcSqlDive } from "../types";

export const SQL_FINAL_BEHAVIOR: LcSqlDive[] = [
  {
    slug: "odd-and-even-transactions",
    statement:
      "A payments table stores every transaction with its id, amount and the day it happened. For each day that has transactions, report the sum of that day's odd-amount transactions as odd_sum and of its even-amount transactions as even_sum — when a day has no odd (or no even) transactions, that sum shows 0. Order the days ascending.",
    examples: [
      {
        input:
          "Transactions: (1,150,2024-07-01) · (2,200,2024-07-01) · (3,75,2024-07-01) · (4,300,2024-07-02) · (5,50,2024-07-02) · (6,120,2024-07-03) — traps: (7,45,2024-07-04),(8,65,2024-07-04) an only-odd day · (9,250,2024-07-05),(10,-80,2024-07-05) a negative even refund · (11,-75,2024-07-05) a negative ODD refund",
        output:
          "2024-07-01 · 75 · 350 / 2024-07-02 · 0 · 350 / 2024-07-03 · 0 · 120 / 2024-07-04 · 110 · 0 / 2024-07-05 · -75 · 170",
        explanation:
          "On 07-01 only the 75 is an odd amount — 150 and 200 are even, so odd_sum 75 / even_sum 350 (the official rows pin parity to AMOUNT). 07-04 flips the official shape: only odd amounts exist, so even_sum must print 0, not NULL. On 07-05 the refunds split: -80 is even (negatives keep their parity), -75 is odd — and SQLite's % keeps the dividend's sign (-75 % 2 = -1), so an `= 1` test silently drops it while `<> 0` catches it.",
      },
    ],
    constraints: [
      "transaction_id uniquely identifies each row; every row carries an amount and a transaction_date",
      "a day with no odd (or no even) transactions still gets a row — that sum displays as 0",
      "output columns exactly transaction_date, odd_sum, even_sum, ordered by transaction_date ascending",
    ],
    breakdown: [
      "The exam question hides in one word: WHICH column decides parity? 'Odd and even transactions' reads like transaction ids — but the official example says otherwise. On 2024-07-01 the odd ids are 1 and 3 (150 + 75 = 225), yet the expected odd_sum is 75: exactly the odd AMOUNTS, with the even amounts 150 + 200 = 350 beside them. The example rows are the spec, so parity lives on amount — and 2024-07-02 confirms it (amounts 300 and 50 are both even; odd_sum prints 0 even though id 5 is odd).",
      "The core mechanism is conditional aggregation. SUM(CASE WHEN <parity> THEN amount ELSE 0 END) pivots each day's rows into two parallel totals in one GROUP BY pass — no self-join, no second scan, no UNION of two queries. The ELSE 0 is doing real work: SUM over an empty match set returns NULL, but with ELSE 0 every group's every row contributes something, so a day with no odd amounts prints 0 — which is precisely what the facts demand.",
      "The naive variants fail three different ways. Id-parity flips two of the three official rows. Two separate queries (odd per day, even per day) joined on date lose the days that exist on only one side — 07-02 has no odd rows, so an INNER JOIN drops the day and a LEFT JOIN NULLs the half the facts want as 0. And the natural test `amount % 2 = 1` breaks on refunds: SQLite's remainder keeps the dividend's sign, so -75 % 2 = -1 and the row vanishes from the odd bucket while looking perfectly handled.",
      "Assembly is short: GROUP BY transaction_date builds the day buckets, two guarded CASE sums fill both columns, ORDER BY transaction_date prints calendar order (ISO dates sort lexicographically in chronological order, so the sort is free). Everything interesting — the parity source, the zero-fill, the negative-safe gate — lives in the CASE conditions, not in the query's bones.",
    ],
    edges: [
      "Parity is on AMOUNT, not id: official 07-01 has odd ids 1 and 3 yet expects odd_sum 75 — only the odd amounts (75) qualify, and 150 is an even amount.",
      "Zero-fill is mandatory: 07-02/07-03 print odd_sum 0 and the seed's 07-04 prints even_sum 0 — SUM(CASE…) without ELSE 0 would emit NULL and break the 'display as 0' rule.",
      "Negative amounts: SQLite's % is C-style, so -75 % 2 = -1 — the odd gate must be `<> 0`, never `= 1`, or refund rows drop out of odd_sum.",
      "The facts mandate ordering by transaction_date ascending — ORDER BY is part of the answer, not garnish.",
    ],
    ladder: [
      {
        title: "Brute force — two sums per day, probed separately",
        body: "For each distinct day run two correlated scalar subqueries — SUM(amount) WHERE date = d AND amount % 2 <> 0, and the even twin — then COALESCE each to 0. O(days × rows) rescans, and every empty side needs its own NULL rescue before the query is even correct.",
      },
      {
        title: "The pattern — conditional aggregation",
        body: "GROUP BY day plus SUM(CASE WHEN parity THEN amount ELSE 0 END) twice: one scan builds both totals, the ELSE lands the zero-fill for free. This pivot-in-place shape is the same muscle as monthly-transactions' approved/cancelled splits.",
      },
      {
        title: "The optimal idea — one pass, guarded gates",
        body: "There is nothing left to optimize structurally — single scan, hash grouping, O(n). The remaining craft is defensive: <> 0 for negative odd amounts, ELSE 0 for the zero-fill, and trusting the example over the prose for what 'odd' means.",
      },
    ],
    approach: "Conditional aggregation — two parity CASE sums per day",
    schema: {
      ddl: `CREATE TABLE transactions (
  transaction_id   INTEGER PRIMARY KEY,
  amount           INTEGER NOT NULL,
  transaction_date TEXT NOT NULL
);`,
      seed: `INSERT INTO transactions (transaction_id, amount, transaction_date) VALUES
  (1, 150, '2024-07-01'),
  (2, 200, '2024-07-01'),
  (3, 75,  '2024-07-01'),   -- official: the only odd AMOUNT on 07-01 (150 and 200 are even)
  (4, 300, '2024-07-02'),
  (5, 50,  '2024-07-02'),   -- official: both amounts even → odd_sum prints 0
  (6, 120, '2024-07-03'),   -- official: a lone even transaction
  (7, 45,  '2024-07-04'),   -- trap: an only-odd day —
  (8, 65,  '2024-07-04'),   --   even_sum must print 0, not NULL
  (9, 250, '2024-07-05'),
  (10, -80, '2024-07-05'),  -- trap: refund, negative EVEN amount (parity survives the sign)
  (11, -75, '2024-07-05');  -- trap: refund, negative ODD amount — SQLite % keeps the dividend's sign`,
      tables: [
        { name: "transactions", note: "11 transactions over 5 days — 07-04 is odd-only, 07-05 mixes a refund pair (-80 even, -75 odd)" },
      ],
    },
    code: `SELECT
    transaction_date,
    SUM(CASE WHEN amount % 2 <> 0 THEN amount ELSE 0 END) AS odd_sum,   -- odd AMOUNTS: the example (not the id) defines parity
    SUM(CASE WHEN amount % 2 = 0 THEN amount ELSE 0 END) AS even_sum    -- ELSE 0 is the zero-fill: an empty side prints 0, never NULL
FROM transactions
GROUP BY transaction_date
ORDER BY transaction_date;`,
    walkthrough: [
      "GROUP BY transaction_date carves the 11 rows into five day buckets — 07-01 through 07-05; no other grouping exists in this query.",
      "07-01: the odd gate keeps only amount 75 (150 and 200 are even amounts — the official explanation adds them as 150 + 200 = 350), so the row prints 75 · 350 exactly as the facts show. 07-02 (300, 50) and 07-03 (120) have no odd amounts: their odd CASE sums zeros, printing 0 · 350 and 0 · 120.",
      "07-04 is the mirror image the officials never show: 45 and 65 are both odd → 110 · 0. Without ELSE 0 the even column would read NULL here, failing the spec's 'display as 0'.",
      "07-05 splits the refunds: 250 and -80 are even (170 on the even side), -75 is odd — the `<> 0` gate catches it where `= 1` would drop it (SQLite returns -75 % 2 = -1) — so the day prints -75 · 170, and ORDER BY transaction_date lays out all five days.",
    ],
    time: "O(n) — one scan over n transactions plus an O(d log d) sort of the d day buckets",
    space: "O(d) — one output row per distinct transaction_date",
    followUps: [
      "Add a transaction_count column per day — where does COUNT(*) fit, and why would COUNT(amount) suddenly matter if amounts could be NULL?",
      "Melt the pivot: one row per (day, parity) with a parity label via UNION ALL — compare that shape's ORDER BY and zero-row behavior against the two-column pivot.",
    ],
    related: ["monthly-transactions-i", "queries-quality-and-percentage", "user-activity-for-the-past-30-days-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "analyze-subscription-conversion",
    statement:
      "A subscription app writes one row per user, day and activity type — free_trial, paid or cancelled — carrying the minutes spent that day; the pitch is a 7-day trial after which users either pay or walk. A user counts as converted exactly when their history holds at least one free_trial row and at least one paid row. For every converted user, report their average daily minutes across their free_trial rows (trial_avg_duration) and across their paid rows (paid_avg_duration), each rounded to 2 decimals, ordered by user_id.",
    examples: [
      {
        input:
          "Users 1–4 (official): 1 trial 45/30/60 then paid 75/90/65 · 2 trial 55/25/50 then cancelled 0 · 3 trial 70/60/80 then paid 50/55/85 · 4 trial 40/35, paid 45, cancelled 0 — traps: 5 two trial episodes both ending in a cancel · 6 paid-only, never trialed · 7 trial → cancel → second trial → paid · 8 converts exactly one week after their trial began",
        output:
          "1 · 45.00 · 76.67 / 3 · 70.00 · 63.33 / 4 · 37.50 · 45.00 / 7 · 53.33 · 45.00 / 8 · 40.00 · 80.00",
        explanation:
          "Users 2 and 5 never log paid activity — out. User 6 pays but never trialed — 'converted FROM free trial' needs both ends. User 7's trial average spans BOTH episodes ((20+80+60)/3 = 53.33), and the cancelled rows' zero minutes never dilute it. User 4's cancelled 0-minute row would poison a naive AVG(duration) — (40+35+0)/3 = 25 is not 37.50. User 8's paid row starts exactly 7 days after their trial began: no date rule anywhere rejects boundary conversions.",
      },
    ],
    constraints: [
      "(user_id, activity_date, activity_type) is the unique key — one row per user per type per day",
      "activity_type is free_trial, paid or cancelled; cancelled rows carry activity_duration 0",
      "averages rounded to 2 decimal places; only trial→paid converters appear, ordered by user_id ascending",
    ],
    breakdown: [
      "Two per-user averages over DIFFERENT subsets of the same rows, plus a membership gate — that's the whole problem, and the denominators are where it's won or lost. The trial average divides by the user's free_trial rows only; the paid average by their paid rows only. Cancelled rows (which legally carry 0 minutes) belong to neither denominator, and neither average may see the other type's rows. The gate, meanwhile, is set membership: at least one trial row AND at least one paid row — a 7-day window, a minimum duration, nothing.",
      "Conditional aggregation solves both averages in one GROUP BY. AVG(CASE WHEN activity_type = 'free_trial' THEN activity_duration END) has no ELSE: non-trial rows turn into NULLs, and AVG ignores NULLs, so the aggregate is automatically the trial-subset average. The paid column is its twin. The gate rides in HAVING — SUM(activity_type = 'paid') > 0 AND SUM(activity_type = 'free_trial') > 0 — because SQLite sums booleans as 0/1, each term is just a cheap per-type row count.",
      "The naive failures are instructive. A plain AVG(activity_duration) per user mixes all three types and dilutes with cancelled zeros: user 4's trial figure becomes (40+35+0+45)/4, wrong twice over. Writing SUM(durations of type)/COUNT(*) instead of AVG(CASE) keeps the wrong denominator — COUNT(*) counts rows the numerator never summed. And gating only on 'has paid' (forgetting the trial side) admits user 6, who subscribes without ever trialing and therefore never converted from anything.",
      "Assembly: one scan, GROUP BY user_id, two conditional averages rounded once at the outermost layer, HAVING for the both-types gate, ORDER BY user_id. The two-subqueries-and-join alternative (trial averages joined to paid averages) is logically identical — it just scans the table twice and needs its own NULL handling; the single-pass shape is smaller and harder to get wrong.",
    ],
    edges: [
      "Cancelled rows carry duration 0 but must not dilute anything: user 4's trial average is (40+35)/2 = 37.50 — a plain AVG or a COUNT(*) denominator prints 25.",
      "Paid-only user 6 is not a conversion — HAVING needs BOTH type counts > 0, not just the paid one.",
      "Multiple trial episodes: user 5 (two episodes, both cancelled, never paid) is out; user 7's surviving trial average (20, 80, 60 → 53.33) spans his two episodes' rows.",
      "The 7-day boundary converts fine — user 8's paid activity starts exactly one week after their trial began; no date arithmetic belongs in a correct solution.",
    ],
    ladder: [
      {
        title: "Brute force — probe each user's history twice",
        body: "For every user, two correlated subqueries — AVG(duration) filtered to free_trial, and to paid — plus an EXISTS pair for the gate. Three logical passes per user, and the empty-side NULLs (a user with no paid rows) have to be filtered after the fact anyway.",
      },
      {
        title: "The pattern — conditional aggregation + HAVING gate",
        body: "GROUP BY user_id with two ELSE-less AVG(CASE …) columns computes both subset averages in one scan; SUM(type = 'paid') > 0 AND SUM(type = 'free_trial') > 0 in HAVING is the conversion gate. One grouping, no joins, no NULL rescue.",
      },
      {
        title: "The optimal idea — one pass, round once",
        body: "This shape is already linear and hash-grouped; nothing structural remains. The residual craft is precision discipline: keep AVG raw inside the query, ROUND only in the SELECT list, and never let a 0-minute cancelled row near a denominator.",
      },
    ],
    approach: "Conditional aggregation — AVG(CASE type) per user + both-types HAVING gate",
    schema: {
      ddl: `CREATE TABLE UserActivity (
  user_id           INTEGER NOT NULL,
  activity_date     TEXT NOT NULL,
  activity_type     TEXT NOT NULL CHECK (activity_type IN ('free_trial', 'paid', 'cancelled')),
  activity_duration INTEGER NOT NULL,
  PRIMARY KEY (user_id, activity_date, activity_type)
);`,
      seed: `INSERT INTO UserActivity (user_id, activity_date, activity_type, activity_duration) VALUES
  (1, '2023-01-01', 'free_trial', 45),  -- official rows: users 1-4
  (1, '2023-01-02', 'free_trial', 30),
  (1, '2023-01-05', 'free_trial', 60),
  (1, '2023-01-10', 'paid', 75),
  (1, '2023-01-12', 'paid', 90),
  (1, '2023-01-15', 'paid', 65),
  (2, '2023-02-01', 'free_trial', 55),
  (2, '2023-02-03', 'free_trial', 25),
  (2, '2023-02-07', 'free_trial', 50),
  (2, '2023-02-10', 'cancelled', 0),    -- official: trial then cancel → never converts
  (3, '2023-03-05', 'free_trial', 70),
  (3, '2023-03-06', 'free_trial', 60),
  (3, '2023-03-08', 'free_trial', 80),
  (3, '2023-03-12', 'paid', 50),
  (3, '2023-03-15', 'paid', 55),
  (3, '2023-03-20', 'paid', 85),
  (4, '2023-04-01', 'free_trial', 40),
  (4, '2023-04-03', 'free_trial', 35),
  (4, '2023-04-05', 'paid', 45),
  (4, '2023-04-07', 'cancelled', 0),    -- official: converted THEN cancelled — still a converter
  (5, '2023-05-01', 'free_trial', 30),  -- trap: two trial episodes, both ending in a cancel
  (5, '2023-05-03', 'cancelled', 0),
  (5, '2023-05-05', 'free_trial', 50),
  (5, '2023-05-09', 'cancelled', 0),    -- trial avg would be 40.00, but no paid rows → out
  (6, '2023-04-10', 'paid', 80),        -- trap: subscribes with no trial at all
  (6, '2023-04-12', 'paid', 60),        --   'converted FROM free trial' needs a trial → out
  (7, '2023-07-01', 'free_trial', 20),  -- trap: bail, retry, convert —
  (7, '2023-07-02', 'cancelled', 0),
  (7, '2023-07-05', 'free_trial', 80),  --   trial average spans BOTH episodes
  (7, '2023-07-06', 'free_trial', 60),
  (7, '2023-07-10', 'paid', 40),
  (7, '2023-07-11', 'paid', 50),
  (8, '2023-06-01', 'free_trial', 35),  -- trap: paid starts exactly 7 days after
  (8, '2023-06-02', 'free_trial', 45),  --   trial start — the boundary converts fine
  (8, '2023-06-03', 'free_trial', 40),
  (8, '2023-06-08', 'paid', 70),
  (8, '2023-06-09', 'paid', 90);`,
      tables: [
        { name: "UserActivity", note: "37 rows for 8 users — converters 1/3/4/7/8; users 2 and 5 cancel out, user 6 never trialed" },
      ],
    },
    code: `SELECT
    user_id,
    ROUND(AVG(CASE WHEN activity_type = 'free_trial' THEN activity_duration END), 2)
        AS trial_avg_duration,   -- no ELSE: non-trial rows → NULL, and AVG skips NULLs
    ROUND(AVG(CASE WHEN activity_type = 'paid' THEN activity_duration END), 2)
        AS paid_avg_duration     -- cancelled 0-minute rows never touch either average
FROM UserActivity
GROUP BY user_id
HAVING SUM(activity_type = 'paid') > 0        -- converted means BOTH a paid history...
   AND SUM(activity_type = 'free_trial') > 0  -- ...AND a trial history (user 6 fails here)
ORDER BY user_id;`,
    walkthrough: [
      "GROUP BY user_id folds the 37 rows into 8 buckets. Inside each bucket the two ELSE-less CASEs route rows: user 1's trial CASE sees 45/30/60 → 45.00, the paid CASE sees 75/90/65 → 230/3 → 76.67.",
      "User 4 shows the NULL mechanics: trial 40/35 → 37.50, paid just 45 → 45.00, and the 04-07 cancelled row (0 minutes) becomes NULL inside both CASEs — invisible to AVG. A naive AVG(duration) would have printed (40+35+0+45)/4 = 30.00 for this user's everything.",
      "The HAVING gate then prunes: user 2 and user 5 have paid-count 0 (both cancelled out — user 5 after two trial episodes), user 6 has trial-count 0 (subscribed cold). Three users eliminated on membership, not on averages.",
      "Survivors 1, 3, 4, 7, 8 print in id order: user 7's trial average (20+80+60)/3 = 53.33 spans both episodes, user 8's paid row on 06-08 sits exactly one week after trial start and converts without ceremony — 40.00 · 80.00.",
    ],
    time: "O(n) — one scan of n activity rows with hash grouping by user",
    space: "O(u) — one output row per converted user (8 buckets in flight)",
    followUps: [
      "Add a conversion_days column — days from each user's first free_trial row to their first paid row (MIN + a self-join, or a LEAD over the per-user timeline). Whose seed rows make it NULL?",
      "Report conversion RATE: converters ÷ users-with-a-trial, 2 dp — where does the 100.0 multiplier go, and which user set (2 and 5 vs 6) is the denominator?",
    ],
    related: ["average-selling-price", "user-activity-for-the-past-30-days-ii", "confirmation-rate"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-drivers-with-improved-fuel-efficiency",
    statement:
      "A fleet logs drivers and their trips — each trip stores kilometres driven and litres burned, so its fuel efficiency is km per litre. Split each driver's trips into the January–June half and the July–December half, average the per-trip efficiencies within each half, and keep only drivers who have trips in both halves and whose second-half average is strictly higher. Report both averages and the improvement (second minus first), all rounded to 2 decimals, best improvement first, name ascending on ties.",
    examples: [
      {
        input:
          "Drivers 1–5 (official): Alice 4 trips (H1 120.5/10.2, 200/16.5 · H2 150/11, 180/12.5) · Bob 3 trips (H1 100/9, 250/22 · H2 200/15) · Carol, David, Emma each trips in ONE half only — traps: 6 Frank Moore both halves but WORSE (17.50 → 10.00) · 7 Grace Lee a perfectly flat year (15.00 = 15.00) · 8 Hana Kim 12.00 → 14.10, tying Bob's 2.10 improvement",
        output:
          "2 · Bob Smith · 11.24 · 13.33 · 2.10 / 8 · Hana Kim · 12.00 · 14.10 · 2.10 / 1 · Alice Johnson · 11.97 · 14.02 · 2.05",
        explanation:
          "Bob's improvement is computed from UNROUNDED averages (13.3333… − 11.2374… = 2.0960 → 2.10); differencing the printed figures (13.33 − 11.24 = 2.09) is the classic miss the official output itself refutes. Hana ties Bob at the rounded 2.10, so the name tiebreak fires — Bob Smith before Hana Kim. Frank's −7.50 decline and Grace's 0.00 flatline fail the strictly-better gate; Carol, David and Emma never field both halves.",
        },
    ],
    constraints: [
      "efficiency is per-trip distance_km / fuel_consumed; the halves are January–June and July–December of the trip's year",
      "only drivers with at least one trip in EACH half are scored; improvement = second_half_avg − first_half_avg",
      "all three figures rounded to 2 decimal places; ordered by improvement descending, then driver_name ascending",
    ],
    breakdown: [
      "Two subtleties hide in plain sight. First, the average is over PER-TRIP efficiencies: Alice's first half is (120.5/10.2 + 200.0/16.5)/2 = 11.97, not total-km ÷ total-litres = 320.5/26.7 = 12.00 — trip sizes vary, and the facts' explanation averages the two ratios. Second, the improvement is the rounded difference of UNROUNDED averages: Bob's 13.3333… − 11.2374… = 2.0960 → 2.10, which is why the official output says 2.10 and not the 2.09 you get by subtracting the already-rounded 13.33 − 11.24. Round once, at the end, per column.",
      "The core mechanism is a bucket-tag then self-join-of-aggregates. Tag every trip with its half (the month from SUBSTR(trip_date, 6, 2) compared against 6) and compute its efficiency inline; GROUP BY (driver, half) yields one average per driver per half; joining that little table to itself on driver (f.half = 1, s.half = 2) pairs the two halves — and the both-halves precondition falls out for free, because a driver with no second-half rows has no partner row to join.",
      "The direction gate is where naive solutions leak. 'Drivers whose efficiency improved' means strictly: Grace's flat 15.00 = 15.00 (improvement 0.00) is not improvement, and Frank's 17.50 → 10.00 is a −7.50 regression — both must vanish. Equally lethal: computing improvement but ordering by the raw difference. The facts order by the REPORTED (rounded) improvement and then by name — order by the rounded alias, or Hana's raw 2.09999… would jump ahead of Bob's 2.09596… and the alphabetical tiebreak would never fire.",
      "Assembly: trips → per-trip efficiency + half tag (×1.0 guards the division) → GROUP BY driver, half → self-join the halves → join drivers for names → ROUND each of the three figures once in the SELECT list → ORDER BY the rounded improvement DESC, name ASC. Five clauses, each doing exactly one job, with the interesting logic entirely in the tag and the gate.",
    ],
    edges: [
      "Average of ratios ≠ ratio of totals: Alice's first-half avg is 11.97 (mean of 11.8137 and 12.1212), while 320.5/26.7 = 12.00 — averaging per-trip efficiencies is the spec.",
      "Round once: Bob's improvement is ROUND(13.3333… − 11.2374…) = 2.10; subtracting the rounded prints (13.33 − 11.24 = 2.09) contradicts the official output row.",
      "Strictly better: Grace's flat year (15.00 = 15.00 → 0.00) and Frank's decline (−7.50) both fail `>`; single-half Carol/David/Emma fail the join before any gate.",
      "The order key is the ROUNDED improvement — Hana's raw 2.09999… vs Bob's 2.09596… would invert under raw ordering; rounding first makes a true tie for driver_name to break.",
    ],
    ladder: [
      {
        title: "Brute force — two filtered averages per driver",
        body: "Per driver, two correlated subqueries — AVG(km/fuel) over trips with month ≤ 6 and over month ≥ 7 — plus EXISTS checks that both exist and a computed delta. Four probes per candidate; drivers with one half return NULL averages that then need filtering.",
      },
      {
        title: "The pattern — tag, fold, self-join the halves",
        body: "CASE-tag each trip with its half, GROUP BY (driver, half) for AVG(efficiency), then join the aggregate to itself (half 1 rows against half 2 rows). The inner join IS the both-halves rule — missing halves simply lack a partner row.",
      },
      {
        title: "The optimal idea — gate strictly, round late, order the output",
        body: "One scan to tag, one grouping to fold, one join to pair: O(t log t). The craft is in three disciplines — `>` for improvement, ROUND applied only in SELECT, and ORDER BY aimed at the rounded output column so the documented tiebreak semantics hold.",
      },
    ],
    approach: "Half-tagged trips → per-half AVG → self-join halves + strict improvement gate",
    schema: {
      ddl: `CREATE TABLE drivers (
  driver_id   INTEGER PRIMARY KEY,
  driver_name TEXT NOT NULL
);
CREATE TABLE trips (
  trip_id       INTEGER PRIMARY KEY,
  driver_id     INTEGER NOT NULL REFERENCES drivers(driver_id),
  trip_date     TEXT NOT NULL,
  distance_km   REAL NOT NULL,
  fuel_consumed REAL NOT NULL
);`,
      seed: `INSERT INTO drivers (driver_id, driver_name) VALUES
  (1, 'Alice Johnson'),  -- official rows: drivers 1-5
  (2, 'Bob Smith'),
  (3, 'Carol Davis'),    -- first half only (Mar, May)
  (4, 'David Wilson'),   -- second half only (Jul, Nov)
  (5, 'Emma Brown'),     -- first half only (Feb)
  (6, 'Frank Moore'),    -- trap: both halves but efficiency DECLINED
  (7, 'Grace Lee'),      -- trap: a perfectly flat year — 0.00 improvement
  (8, 'Hana Kim');       -- trap: improvement exactly 2.10, tying Bob's
INSERT INTO trips (trip_id, driver_id, trip_date, distance_km, fuel_consumed) VALUES
  (1,  1, '2023-02-15', 120.5, 10.2),  -- official: Alice H1
  (2,  1, '2023-03-20', 200.0, 16.5),
  (3,  1, '2023-08-10', 150.0, 11.0),  -- Alice H2
  (4,  1, '2023-09-25', 180.0, 12.5),
  (5,  2, '2023-01-10', 100.0, 9.0),   -- official: Bob H1 (avg 11.2374)
  (6,  2, '2023-04-15', 250.0, 22.0),
  (7,  2, '2023-10-05', 200.0, 15.0),  -- Bob H2: 13.3333 — diff 2.0960 → 2.10, not 2.09
  (8,  3, '2023-03-12', 80.0,  8.5),   -- official: Carol, H1 only
  (9,  3, '2023-05-18', 90.0,  9.2),
  (10, 4, '2023-07-22', 160.0, 12.8),  -- official: David, H2 only
  (11, 4, '2023-11-30', 140.0, 11.0),
  (12, 5, '2023-02-28', 110.0, 11.5),  -- official: Emma, H1 only
  (13, 6, '2023-01-15', 160.0, 8.0),   -- trap: Frank H1 (20.0, 15.0 → avg 17.50)
  (14, 6, '2023-03-10', 150.0, 10.0),
  (15, 6, '2023-08-20', 100.0, 10.0),  -- Frank H2: 10.0 → improvement -7.50 → out
  (16, 7, '2023-02-10', 120.0, 10.0),  -- trap: Grace H1 (12.0, 18.0 → avg 15.00)
  (17, 7, '2023-05-05', 180.0, 10.0),
  (18, 7, '2023-09-01', 150.0, 10.0),  -- Grace H2: 15.00 → flat 0.00 → out
  (19, 8, '2023-01-20', 120.0, 10.0),  -- trap: Hana H1 12.00
  (20, 8, '2023-07-15', 141.0, 10.0);  -- Hana H2 14.10 → improvement 2.10, ties Bob`,
      tables: [
        { name: "drivers", note: "8 drivers — the 5 official plus Frank (declined), Grace (flat), Hana (tied improvement)" },
        { name: "trips", note: "20 trips — official 12 plus 8 trap trips; Carol/David/Emma never see both halves" },
      ],
    },
    code: `WITH trip_eff AS (           -- one row per trip: which half, how many km per litre
    SELECT
        driver_id,
        CASE WHEN CAST(SUBSTR(trip_date, 6, 2) AS INTEGER) <= 6 THEN 1 ELSE 2 END AS half,  -- months 01-06 vs 07-12
        distance_km * 1.0 / fuel_consumed AS eff   -- *1.0 guards against integer division
    FROM trips
),
half_avg AS (                -- per-driver average efficiency within each half
    SELECT driver_id, half, AVG(eff) AS avg_eff
    FROM trip_eff
    GROUP BY driver_id, half
)
SELECT
    d.driver_id,
    d.driver_name,
    ROUND(f.avg_eff, 2) AS first_half_avg,
    ROUND(s.avg_eff, 2) AS second_half_avg,
    ROUND(s.avg_eff - f.avg_eff, 2) AS efficiency_improvement  -- round ONCE, after differencing unrounded averages
FROM half_avg f
JOIN half_avg s ON s.driver_id = f.driver_id AND s.half = 2  -- both-halves rule: no 2nd-half row → driver vanishes
JOIN drivers d  ON d.driver_id = f.driver_id
WHERE f.half = 1
  AND s.avg_eff > f.avg_eff        -- strictly improved: ties (Grace) and declines (Frank) are out
ORDER BY efficiency_improvement DESC, driver_name ASC;  -- order the REPORTED (rounded) figure; ties fall to name`,
    walkthrough: [
      "trip_eff stamps all 20 trips: Alice's February run becomes (1, 120.5/10.2 = 11.8137, half 1), her August run (1, 13.6364, half 2); Hana's July trip lands in half 2 at exactly 14.1; Frank's August slump reads 10.0.",
      "half_avg folds to one row per driver per half: Alice (11.9675, 14.0182), Bob (11.2374, 13.3333), Hana (12.0, 14.1), Frank (17.5, 10.0), Grace (15.0, 15.0) — while Carol, David and Emma each produce a single half-row and are left partnerless.",
      "The f×s self-join keeps only drivers with both rows, and s.avg_eff > f.avg_eff evicts Frank (10.0 < 17.5) and Grace (not strictly greater). Five drivers entered scoring; three survive.",
      "Rounding happens once per column in the SELECT: Bob 11.24 · 13.33 · 2.10, Hana 12.00 · 14.10 · 2.10, Alice 11.97 · 14.02 · 2.05. ORDER BY the rounded improvement groups Bob and Hana into a genuine tie that driver_name ASC resolves — Bob Smith first — and Alice's 2.05 trails.",
    ],
    time: "O(t log t) — one pass to tag t trips plus the GROUP BY sort; the two-correlated-subqueries brute force is O(d × t)",
    space: "O(t) — the tagged-trip CTE and its folded half averages",
    followUps: [
      "Switch halves to calendar quarters — does the CASE tag still scale, or do you want a period-boundary lookup CTE? What happens to a trip dated exactly June 30 vs July 1?",
      "Add a rank column: RANK each driver's halves by efficiency and only compare drivers top-3 in BOTH halves — how does the self-join's ON clause change?",
    ],
    related: ["find-students-who-improved", "find-consistently-improving-employees", "average-selling-price"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-golden-hour-customers",
    statement:
      "A restaurant logs every order with a timestamp, an amount, the payment method and an optional 1–5 rating (NULL when the guest skipped rating). A customer is a golden-hour regular when ALL of these hold: at least 3 orders, at least 60% of them timestamped inside the peak windows 11:00–14:00 or 18:00–21:00, at least half of the orders rated, and an average rating over the rated ones of at least 4.0. Report each qualifying customer's total orders, peak-share percentage and rating average (2 dp), highest average first, and when averages tie the higher customer id goes first.",
    examples: [
      {
        input:
          "Customers 101–105 (official): 101 four peak orders, 3 rated (5,4,5) · 102 three orders, two peak (11:30, 12:00; 15:30 off-peak), rated (4,3) · 103 three evening-peak orders all rated (5,4,5) · 104 three off-peak orders (10:00, 09:30, 16:00) · 105 three lunch-peak orders (12:15, 13:00, 11:45) rated (4,5,4) — traps: 106 straddles the lunch edge (11:00:00 in, 14:00:00 sharp in, 14:00:30 out) · 107 exactly 60% peak share AND exactly 4.0 average · 108 exactly 2-of-4 rated · 109 three orders, all ratings NULL · 110 a perfect 5.0 average on only 2 orders",
        output:
          "106 · 5 · 80 · 4.67 / 103 · 3 · 100 · 4.67 / 101 · 4 · 100 · 4.67 / 108 · 4 · 100 · 4.5 / 105 · 3 · 100 · 4.33 / 107 · 5 · 60 · 4.0",
        explanation:
          "The three 4.67 averages tie, so customer_id DESC orders them 106, 103, 101. 107 sits exactly on TWO boundaries — 3-of-5 = 60% peak share and a 4.0 average — and both gates read 'at least', so it qualifies. 108's 2-of-4 rated is exactly the 50% completion floor — in. 109's AVG over all-NULL ratings is NULL and `NULL >= 4.0` is never true — out. 110 has a flawless 5.0 average but only 2 orders — out. Official 102 fails on its 3.5 average, 104 on its 0% peak share.",
      },
    ],
    constraints: [
      "one row per order; order_rating is 1–5 or NULL when unrated; payment_method and order_amount are along for the ride",
      "peak windows are 11:00–14:00 and 18:00–21:00, compared as full 'HH:MM:SS' strings; the peak share counts ALL of a customer's orders",
      "all four gates must hold: ≥ 3 orders, ≥ 60% peak share, ≥ 50% of orders rated, average rating over rated orders ≥ 4.0 (2 dp); ordered by average_rating DESC then customer_id DESC",
    ],
    breakdown: [
      "Four independent gates, every one mandatory, and three different denominators keep them honest. Two gates are ratios against the customer's TOTAL order count — the peak share and the rated share. One gate is an average over the RATED SUBSET only. One is a plain count. Mixing any two denominators (averaging ratings over all orders, or computing the peak share over only rated orders) produces plausible-looking wrong answers — this problem is a denominator discipline drill.",
      "The mechanism is flag-then-fold. Stamp every order row with is_peak — a CASE over SUBSTR(order_timestamp, 12, 8), which slices the 'HH:MM:SS' out of the datetime — and is_rated (rating IS NOT NULL). Then one GROUP BY customer computes COUNT(*) as the universal denominator, SUM of each flag, and AVG(order_rating) — whose NULL-skipping is exactly 'average of rated orders'. No self-joins, no per-gate subqueries: four gates, one grouping.",
      "The naive failures cluster around NULLs and string slicing. SUM(rating)/COUNT(*) counts unrated rows in the denominator — customer 101 becomes (5+4+5)/4 instead of 4.67. Filtering to rated rows BEFORE the grouping silently shrinks COUNT(*) so the share gates overflow (101's peak share reads 4/3). And writing the window bounds as '14:00' lets 14:00:30 slip inside a string BETWEEN — the bounds need full 'HH:MM:SS' precision, where 14:00:00 sharp is lunch but 14:00:30 is the lull.",
      "Assembly: per_order flags CTE → stats CTE with the five aggregates → outer SELECT computes the rounded percentage (100.0 first, or integer division truncates) and rounds the raw average → WHERE enforces the four gates (the NULL average fails its comparison all by itself) → ORDER BY average_rating DESC, customer_id DESC for the documented tiebreak.",
    ],
    edges: [
      "Boundary timestamps: 14:00:00 sharp stays peak (inclusive read of '11:00-14:00') while 14:00:30 does not — compare full 'HH:MM:SS' strings, not 'HH:MM'.",
      "Two at-least boundaries in one seed: 107's 3-of-5 = exactly 60% peak share AND exactly 4.0 average — both gates are ≥, so both include.",
      "Rated-share floor: 108's 2-of-4 = exactly 50% — in; 109's 0-of-3 is out twice over (share gate AND a NULL average that fails `>= 4.0` automatically).",
      "Ties order by customer_id DESC: 106, 103 and 101 all average 4.67, so 106 leads — a plain ASC tiebreak would print the official pair backwards.",
    ],
    ladder: [
      {
        title: "Brute force — four counters per customer",
        body: "Walk each customer's orders in application code: count orders, count peak-timestamp hits, count ratings, sum ratings — then four if-checks against the gates. In SQL that's four correlated subqueries per candidate row, each re-scanning the customer's orders.",
      },
      {
        title: "The pattern — flag and fold",
        body: "CASE-stamp is_peak/is_rated per order, then GROUP BY customer with COUNT(*), SUM(flags) and AVG(rating). Conditional aggregation scales to N gates where one-subquery-per-gate explodes; the flags also make each gate's algebra visible.",
      },
      {
        title: "The optimal idea — one scan, four gates, rounded output",
        body: "Single table scan with computed flags, hash grouping per customer, then a WHERE over the profile — O(n) with an O(c log c) sort for output. The craft lives in the boundaries: string-precision windows, COUNT(*) denominators, AVG's NULL skip and the DESC/DESC tiebreak.",
      },
    ],
    approach: "Flag-per-order CTE + conditional aggregation + four-gate filter",
    schema: {
      ddl: `CREATE TABLE restaurant_orders (
  order_id        INTEGER PRIMARY KEY,
  customer_id     INTEGER NOT NULL,
  order_timestamp TEXT NOT NULL,          -- 'YYYY-MM-DD HH:MM:SS'
  order_amount    REAL NOT NULL,
  payment_method  TEXT NOT NULL,
  order_rating    INTEGER                  -- 1..5, NULL when unrated
);`,
      seed: `INSERT INTO restaurant_orders (order_id, customer_id, order_timestamp, order_amount, payment_method, order_rating) VALUES
  (1,  101, '2024-03-01 12:30:00', 25.50, 'card', 5),   -- official rows: customers 101-105
  (2,  101, '2024-03-02 19:15:00', 32.00, 'app', 4),
  (3,  101, '2024-03-03 13:45:00', 28.75, 'card', 5),
  (4,  101, '2024-03-04 20:30:00', 41.00, 'app', NULL),
  (5,  102, '2024-03-01 11:30:00', 18.50, 'cash', 4),
  (6,  102, '2024-03-02 12:00:00', 22.00, 'card', 3),
  (7,  102, '2024-03-03 15:30:00', 19.75, 'cash', NULL),  -- official: 102's average is only 3.5
  (8,  103, '2024-03-01 19:00:00', 55.00, 'app', 5),
  (9,  103, '2024-03-02 20:45:00', 48.50, 'app', 4),
  (10, 103, '2024-03-03 18:30:00', 62.00, 'card', 5),
  (11, 104, '2024-03-01 10:00:00', 15.00, 'cash', 3),
  (12, 104, '2024-03-02 09:30:00', 18.00, 'cash', 2),
  (13, 104, '2024-03-03 16:00:00', 20.00, 'card', 3),     -- official: 104 never orders in a window
  (14, 105, '2024-03-01 12:15:00', 30.00, 'app', 4),
  (15, 105, '2024-03-02 13:00:00', 35.50, 'app', 5),
  (16, 105, '2024-03-03 11:45:00', 28.00, 'card', 4),
  (17, 106, '2024-03-10 11:00:00', 30.00, 'app', 5),      -- trap: lower lunch edge, sharp
  (18, 106, '2024-03-11 14:00:00', 26.00, 'card', 4),     -- trap: 14:00:00 sharp is STILL lunch
  (19, 106, '2024-03-12 14:00:30', 21.50, 'card', NULL),  -- trap: 30 seconds later — the lull
  (20, 106, '2024-03-13 12:30:00', 33.25, 'app', 5),
  (21, 106, '2024-03-14 18:30:00', 40.00, 'app', NULL),
  (22, 107, '2024-03-01 12:00:00', 19.00, 'cash', 4),     -- trap: exactly 3-of-5 peak = 60%
  (23, 107, '2024-03-02 19:00:00', 24.00, 'app', 4),
  (24, 107, '2024-03-03 20:00:00', 27.50, 'card', 4),     --   and exactly (4+4+4)/3 = 4.0 average
  (25, 107, '2024-03-04 15:00:00', 18.00, 'cash', NULL),
  (26, 107, '2024-03-05 22:00:00', 20.00, 'cash', NULL),
  (27, 108, '2024-03-06 12:15:00', 45.00, 'app', 5),      -- trap: exactly 2-of-4 rated = 50% floor
  (28, 108, '2024-03-07 19:45:00', 52.00, 'card', 4),
  (29, 108, '2024-03-08 13:00:00', 38.00, 'app', NULL),
  (30, 108, '2024-03-09 18:00:00', 47.25, 'app', NULL),
  (31, 109, '2024-03-10 12:00:00', 22.00, 'cash', NULL),  -- trap: all-NULL ratings → NULL average
  (32, 109, '2024-03-11 19:00:00', 31.00, 'card', NULL),
  (33, 109, '2024-03-12 12:30:00', 17.50, 'cash', NULL),
  (34, 110, '2024-03-13 12:00:00', 28.00, 'app', 5),      -- trap: perfect 5.0 average but only
  (35, 110, '2024-03-14 19:30:00', 36.00, 'card', 5);     --   2 orders — the >= 3 gate says no`,
      tables: [
        { name: "restaurant_orders", note: "35 orders for 10 customers — 101–105 official; 106–110 straddle every gate (lunch edge, 60% share, 50% rated, NULL-only, 2-order)" },
      ],
    },
    code: `WITH per_order AS (
    SELECT
        customer_id,
        order_rating,
        CASE WHEN SUBSTR(order_timestamp, 12, 8) BETWEEN '11:00:00' AND '14:00:00'
               OR SUBSTR(order_timestamp, 12, 8) BETWEEN '18:00:00' AND '21:00:00'
             THEN 1 ELSE 0 END AS is_peak,          -- full 'HH:MM:SS' slice: 14:00:00 in, 14:00:30 out
        CASE WHEN order_rating IS NOT NULL THEN 1 ELSE 0 END AS is_rated
    FROM restaurant_orders
),
stats AS (
    SELECT
        customer_id,
        COUNT(*) AS total_orders,          -- the denominator for BOTH share gates
        SUM(is_peak) AS peak_orders,
        SUM(is_rated) AS rated_orders,
        AVG(order_rating) AS avg_rating    -- AVG skips NULLs: average over RATED orders only
    FROM per_order
    GROUP BY customer_id
)
SELECT
    customer_id,
    total_orders,
    ROUND(100.0 * peak_orders / total_orders, 2) AS peak_hour_percentage,  -- 100.0 first: integer division truncates
    ROUND(avg_rating, 2) AS average_rating
FROM stats
WHERE total_orders >= 3                                   -- gate 1: enough orders (kills 110's perfect 5.0)
  AND 100.0 * peak_orders / total_orders >= 60            -- gate 2: at least 60% at rush times (107 lands exactly here)
  AND 100.0 * rated_orders / total_orders >= 50           -- gate 3: at least half rated (108 lands exactly here)
  AND avg_rating >= 4.0                                   -- gate 4: happy — NULL average fails for free (109)
ORDER BY average_rating DESC, customer_id DESC;           -- ties: higher customer id first`,
    walkthrough: [
      "per_order stamps the 35 rows: 101's four orders all flip is_peak (12:30, 19:15, 13:45, 20:30 — three rated); 106's row 18 (14:00:00) stays peak while row 19 (14:00:30) flips off — one second deciding a bucket.",
      "stats folds ten customers: 101 → (4 orders, 4 peak, 3 rated, avg 4.67); 106 → (5, 4, 3, 4.67); 107 → (5, 3, 3, 4.0); 108 → (4, 4, 2, 4.5); 109 → (3, 3, 0, NULL); 110 → (2, 2, 2, 5.0).",
      "The gates prune 102 (official, 3.5 < 4.0), 104 (0% peak), 109 (NULL average — `NULL >= 4.0` is not true — plus 0% rated) and 110 (2 orders < 3, despite the flawless 5.0).",
      "Six survivors print average-first: 106, 103, 101 tie at 4.67 and customer_id DESC orders them; then 108 (4.5), 105 (4.33) and 107 — the double-boundary row that squeaks through both 'at least' gates at exactly 60% and 4.0.",
    ],
    time: "O(n log n) — one scan to flag n orders plus the GROUP BY sort; output sort over c customers",
    space: "O(c) — one stats row per customer",
    followUps: [
      "Return each customer's peak-hour histogram (orders per hour bucket 11–14 / 18–21) alongside the verdict — which extra GROUP BY layer or window does that take?",
      "Parameterize the windows into a PeakHours table and JOIN instead of BETWEEN — what breaks when a window crosses midnight (22:00–01:00)?",
    ],
    related: ["not-boring-movies", "average-time-of-process-per-machine", "movie-rating"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-churn-risk-customers",
    statement:
      "A subscription platform records lifecycle events — start, upgrade, downgrade, cancel — each stamped with the plan and the monthly price in effect after it (cancels carry no plan and price 0). Flag churn-risk users: their latest event is not a cancel, at least one downgrade sits in their history, their current (latest-event) price is strictly below half of the highest price they ever paid, and their first-to-last event span is at least 60 days. Report each at-risk user's current plan and price, the historical max price and the days-as-subscriber span — longest spans first, user id ascending on ties.",
    examples: [
      {
        input:
          "Users 501–506 (official): 501 start premium 29.99 → downgrade standard 19.99 → downgrade basic 9.99 · 502 standard 19.99 → upgrade premium → downgrade basic 9.99 · 503 all upgrades, no downgrade · 504 premium → downgrade → cancel · 505 basic → upgrade standard · 506 premium → downgrade basic after only a 50-day span — traps: 507 spans EXACTLY 60 days (2024-01-01 → 2024-03-01, leap February) · 508 downgrades standard→basic, 9.99 vs max 19.99 = 49.97% of max · 509 downgrades premium→standard (66.6% of max) · 510 one lone start event · 511 downgrades to basic but claws back up to premium",
        output:
          "501 · basic · 9.99 · 29.99 · 79 / 508 · basic · 9.99 · 19.99 · 75 / 502 · basic · 9.99 · 29.99 · 70 / 507 · basic · 9.99 · 29.99 · 60",
        explanation:
          "508 sneaks under the line: 9.99 is 49.97% of 19.99 — a check that rounds to a whole percent would read 50% and wrongly evict them. 507 lands exactly on the 60-day floor, which reads 'at least'. 509 downgraded but premium→standard still keeps 66.6% of max; 511's history ends on an upgrade back to premium, so their CURRENT price equals their max; 510 never downgraded; 504's latest event is the cancel; 506's 50-day span is short.",
      },
    ],
    constraints: [
      "event_type is start, upgrade, downgrade or cancel; cancel rows carry plan_name NULL and monthly_amount 0",
      "current plan/price = the row on the user's LATEST event_date; max_historical_amount = the highest monthly_amount they ever had",
      "days_as_subscriber = last event date − first event date; risk needs active + ≥ 1 downgrade + current < 50% of max + span ≥ 60; ordered days DESC then user_id ASC",
    ],
    breakdown: [
      "A four-gate risk profile where two gates need row-level facts and two need whole-history aggregates. 'Latest event' and 'current price' are properties of ONE row — the newest one. 'Ever downgraded', 'max price ever' and 'first date' are properties of the whole history. Any solution must therefore see the UNFILTERED history for the aggregates while also extracting the newest row — filtering the table to downgrades first (the classic mistake) silently corrupts every aggregate it touches.",
      "The mechanism is two passes over one table, joined. Pass one: a window ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_date DESC, event_id DESC) labels each user's newest row — the event_id tiebreak keeps 'latest' deterministic if two events ever share a date. Pass two: GROUP BY user_id yields MIN(event_date), MAX(event_date), MAX(monthly_amount) and SUM(event_type = 'downgrade') (SQLite sums booleans as 0/1). Join the two on user_id and all four gates collapse into one WHERE line each.",
      "The naive failures are boundary failures. The 50% test must be strict and computed on raw amounts: 9.99 against a 19.99 max is 49.97% — below half by a whisker — while 19.99 against 29.99 (66.6%) is comfortably safe; rounding the ratio to a whole percent flips the first case wrongly. The 60-day floor is inclusive — 2024's leap February means 2024-01-01 → 2024-03-01 is exactly 60 days and stays. And 'current' follows the LAST event, whatever it is: user 511 downgraded once but their newest row is an upgrade back to premium, which resets the price ratio and the risk.",
      "Assembly: ordered CTE (window) → current_state CTE (recency = 1) → history CTE (GROUP BY) → join → four WHERE gates → SELECT with CAST(julianday(last) − julianday(first) AS INTEGER) for the span → ORDER BY days DESC, user_id ASC. julianday does the calendar arithmetic, leap day included; hand-rolled month×30 math would miss 507's exact 60.",
    ],
    edges: [
      "Strict half-line on raw amounts: 9.99 < 0.5 × 19.99 (49.97%) keeps 508, while 19.99 vs 0.5 × 29.99 evicts 509 — never round the percentage before comparing.",
      "Span floor is inclusive: 507's 2024-01-01 → 2024-03-01 is exactly 60 days (leap February) and qualifies; official 506's 50 days does not.",
      "The LAST event governs: 504 is out despite a downgrade and a 75-day span (latest = cancel); 511 is out because the newest row is an upgrade back to max price.",
      "ORDER BY gotcha: the facts mandate user_id ASC on ties, but a BARE user_id in ORDER BY is 'ambiguous column name' once history (h.user_id) joins current_state (c.user_id) — SQLite resolves bare ORDER BY names against source columns even when an output column shares the name; qualify it as c.user_id.",
    ],
    ladder: [
      {
        title: "Brute force — four probes per user",
        body: "Per user, correlated subqueries for the latest event's type/price, a downgrade EXISTS, MAX(monthly_amount) and MIN/MAX dates — five probes per candidate, each re-reading the user's history. Correct, but five scans wearing a trench coat.",
      },
      {
        title: "The pattern — newest-row window + history GROUP BY",
        body: "ROW_NUMBER over (user_id, event_date DESC) picks each user's now; GROUP BY user_id picks their then (min date, max amount, downgrade count). Joining the two summary shapes is the standard 'row-level fact vs group-level fact' reconciliation.",
      },
      {
        title: "The optimal idea — gates after aggregates, spans via julianday",
        body: "Both passes are linear; the craft is ordering — every gate lives AFTER the unfiltered aggregates exist. Then it's boundary hygiene: strict `<` on the price ratio, `>=` on the 60-day floor, julianday for the calendar.",
      },
    ],
    approach: "Latest-row window + whole-history aggregates + four-gate join",
    schema: {
      ddl: `CREATE TABLE subscription_events (
  event_id       INTEGER PRIMARY KEY,
  user_id        INTEGER NOT NULL,
  event_date     TEXT NOT NULL,
  event_type     TEXT NOT NULL CHECK (event_type IN ('start', 'upgrade', 'downgrade', 'cancel')),
  plan_name      TEXT,                       -- NULL exactly when event_type = 'cancel'
  monthly_amount REAL NOT NULL               -- 0.00 for cancels
);`,
      seed: `INSERT INTO subscription_events (event_id, user_id, event_date, event_type, plan_name, monthly_amount) VALUES
  (1,  501, '2024-01-01', 'start',     'premium',  29.99),  -- official rows: users 501-506
  (2,  501, '2024-02-15', 'downgrade', 'standard', 19.99),
  (3,  501, '2024-03-20', 'downgrade', 'basic',    9.99),   -- 501: 79-day span, 33.3% of max → at risk
  (4,  502, '2024-01-05', 'start',     'standard', 19.99),
  (5,  502, '2024-02-10', 'upgrade',   'premium',  29.99),
  (6,  502, '2024-03-15', 'downgrade', 'basic',    9.99),   -- 502: 70-day span → at risk
  (7,  503, '2024-01-10', 'start',     'basic',    9.99),
  (8,  503, '2024-02-20', 'upgrade',   'standard', 19.99),
  (9,  503, '2024-03-25', 'upgrade',   'premium',  29.99),  -- 503: healthy upgrades, no downgrade
  (10, 504, '2024-01-15', 'start',     'premium',  29.99),
  (11, 504, '2024-03-01', 'downgrade', 'standard', 19.99),
  (12, 504, '2024-03-30', 'cancel',    NULL,       0.00),   -- 504: gone — latest event is the cancel
  (13, 505, '2024-02-01', 'start',     'basic',    9.99),
  (14, 505, '2024-02-28', 'upgrade',   'standard', 19.99),  -- 505: no downgrade in history
  (15, 506, '2024-01-20', 'start',     'premium',  29.99),
  (16, 506, '2024-03-10', 'downgrade', 'basic',    9.99),   -- 506: at-risk profile but only a 50-day span
  (17, 507, '2024-01-01', 'start',     'premium',  29.99),  -- trap: span 2024-01-01 → 2024-03-01
  (18, 507, '2024-03-01', 'downgrade', 'basic',    9.99),   --   = EXACTLY 60 days (leap February) → in
  (19, 508, '2024-01-05', 'start',     'standard', 19.99),  -- trap: downgrade standard→basic
  (20, 508, '2024-03-20', 'downgrade', 'basic',    9.99),   --   9.99/19.99 = 49.97% — a hair under half → in
  (21, 509, '2024-01-15', 'start',     'premium',  29.99),  -- trap: downgraded but
  (22, 509, '2024-03-20', 'downgrade', 'standard', 19.99),  --   keeps 66.6% of max → not at risk
  (23, 510, '2024-01-10', 'start',     'standard', 19.99),  -- trap: one lone start — no downgrade, 0-day span
  (24, 511, '2024-01-05', 'start',     'premium',  29.99),  -- trap: downgraded once but
  (25, 511, '2024-02-01', 'downgrade', 'basic',    9.99),
  (26, 511, '2024-03-10', 'upgrade',   'premium',  29.99);  --   clawed back — current = max → not at risk`,
      tables: [
        { name: "subscription_events", note: "26 events for 11 users — 501–506 official; 507–511 pin the 60-day floor, the strict half-of-max line, the no-downgrade and the recovered subscriber" },
      ],
    },
    code: `WITH ordered AS (
    SELECT
        *,
        ROW_NUMBER() OVER (PARTITION BY user_id
                           ORDER BY event_date DESC, event_id DESC) AS recency  -- newest event per user; id breaks date ties
    FROM subscription_events
),
current_state AS (
    SELECT user_id, event_type, plan_name, monthly_amount
    FROM ordered
    WHERE recency = 1                       -- the row that defines the user's NOW
),
history AS (
    SELECT
        user_id,
        MIN(event_date) AS first_date,
        MAX(event_date) AS last_date,
        MAX(monthly_amount) AS max_amount,           -- the highest price they EVER paid
        SUM(event_type = 'downgrade') AS downgrades  -- SQLite sums booleans as 0/1
    FROM subscription_events
    GROUP BY user_id
)
SELECT
    c.user_id,
    c.plan_name AS current_plan,
    c.monthly_amount AS current_monthly_amount,
    h.max_amount AS max_historical_amount,
    CAST(julianday(h.last_date) - julianday(h.first_date) AS INTEGER) AS days_as_subscriber
FROM current_state c
JOIN history h ON h.user_id = c.user_id
WHERE c.event_type <> 'cancel'                -- gate 1: still active (504 out)
  AND h.downgrades >= 1                       -- gate 2: burned at least once (503/505/510 out)
  AND c.monthly_amount < 0.5 * h.max_amount   -- gate 3: STRICT — 9.99 < 9.995 squeaks in, 19.99 vs 14.995 doesn't
  AND julianday(h.last_date) - julianday(h.first_date) >= 60  -- gate 4: 60 exactly counts (507)
ORDER BY days_as_subscriber DESC, c.user_id ASC;  -- bare user_id is AMBIGUOUS here (h also has one) — qualify it`,
    walkthrough: [
      "ordered stamps recency inside each user's stack: 501's 03-20 downgrade-basic becomes its recency-1 row; 504's 03-30 cancel tops its stack; 511's newest row is the 03-10 upgrade — not the 02-01 downgrade that sits mid-history.",
      "history folds each user's whole record: 501 (first 01-01, last 03-20, max 29.99, downgrades 2), 508 (01-05 → 03-20, max 19.99, 1), 507 (01-01 → 03-01, max 29.99, 1), 511 (max 29.99, downgrades 1), 510 (a single row, 0 downgrades).",
      "The gates evict: 504 (latest is cancel), 503/505/510 (no downgrades), 509 (19.99 is not below 0.5 × 29.99), 511 (current back at max price), 506 (50-day span). Survivors: 501, 502, 508, 507 — 508 only because 9.99 < 9.995, 507 only because exactly 60 counts.",
      "The SELECT lays out current plan/price from the recency-1 row, the historical max from history, and the julianday span as an integer: 79, 75, 70, 60 — so ORDER BY days DESC prints 501, 508, 502, 507.",
    ],
    time: "O(n log n) — the window's per-user sort over n events, plus a linear GROUP BY; brute force is O(u × n)",
    space: "O(u) — one current-state row and one history row per user",
    followUps: [
      "Return each at-risk user's latest downgrade DATE too — a second window pick; can current_state and that pick share a single ordered CTE scan?",
      "Let cancelled users re-subscribe: redefine tenure from the LAST start event instead of the first ever — which CTE changes, and does 504 come back to life?",
    ],
    related: ["customers-who-never-order", "the-latest-login-in-2020", "find-covid-recovery-patients"],
    order: "exact",
    xp: 20,
  },
];
