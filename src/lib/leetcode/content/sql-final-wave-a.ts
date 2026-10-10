// Deep-dives — the FINAL WAVE band, part A: users & habits (LC 3793 / 3705 /
// 3716 / 3657 / 3808 / 3832) — the last free Database problems the app had
// not yet wired. Token-usage averages that self-reference the table, peak-
// hour regulars, churn-risk profiles, gaps-and-islands loyalty runs,
// dominant-reaction shares and persistent behavior streaks. Solutions are
// SQLite dialect, one statement each, engine-verified against the
// per-problem seeds.
// Engine lesson baked into 3832: julianday() is a float — a clean 35-minute
// span computes as 34.999999… days (CAST truncates to 34!). All date
// arithmetic there runs on strftime('%s', …) epoch seconds, which stay
// exact integers.
import type { LcSqlDive } from "../types";

export const SQL_FINAL_WAVE_A: LcSqlDive[] = [
  {
    slug: "find-users-with-high-token-usage",
    statement:
      "An AI product logs every prompt a user submits together with the tokens it burned. Build a usage report per user: total prompts submitted and the average tokens per prompt rounded to two decimals. Keep only users with at least three prompts who ALSO fired at least one prompt strictly above their own average. Order by average tokens descending, then user_id ascending.",
    examples: [
      {
        input:
          "prompts: user 1 — 'Write a blog outline' 120, 'Generate SQL query' 80, 'Summarize an article' 200 · user 2 — 'Create resume bullet' 60, 'Improve LinkedIn bio' 70 · user 3 — 'Explain neural networks' 300, 'Generate interview Q&A' 250, 'Write cover letter' 180, 'Optimize Python code' 220 — then the traps: user 4 — 'Summarize a tweet' 100, 'Draft a reply' 100, 'Polish a README' 100 (all equal) · user 5 — 'Translate a doc' 500, 'Refactor a module' 400 (huge but only 2 prompts) · user 6 — 'Draft a sprint plan' 10, 'Review a pull request' 20, 'Outline a launch post' 30",
        output: "user_id 3 · prompt_count 4 · avg_tokens 237.5 / user_id 1 · 3 · 133.33 / user_id 6 · 3 · 20.0",
        explanation:
          "User 3: four prompts, average 237.5, and 300 and 250 both beat it. User 1: three prompts, average 133.33, and the 200-token prompt clears it. User 4 has exactly three prompts but every one EQUALS the 100-token average — 'greater than' fails, so they are out. User 2 and user 5 never reach the three-prompt floor, no matter how expensive their prompts are. User 6 sneaks in on the boundary: exactly three prompts, and 30 > 20.",
      },
    ],
    constraints: [
      "(user_id, prompt) is the primary key — the same text can recur across users but never within one user's history",
      "the average is rounded to 2 decimals for display; the above-average test compares against the RAW average, strictly greater",
      "only users with at least 3 prompts; output user_id, prompt_count, avg_tokens ordered by avg_tokens descending then user_id ascending",
    ],
    breakdown: [
      "Two aggregates per user where the second depends on the first: count and average are plain GROUP BY business, but 'has a prompt above their own average' needs the average pushed BACK against the raw rows — a self-referencing filter a single HAVING cannot see. Compute per-user stats in a CTE, then probe the base table again with EXISTS, correlated on user_id.",
      "The strict comparison is where near-copies of this problem die. User 4 submits three 100-token prompts: prompt_count = 3 passes the minimum, but MAX(tokens) = 100 EQUALS the average = 100, and 100 > 100 is false. 'At least one prompt above average' is an existence test with a strict inequality — all-equal users are the designed exclusion, not an accident.",
      "Rounding is for display only. ROUND can round UP (a raw 10.996 prints 11.00), so comparing tokens against the ROUNDED value can flip a strict > into a false equality at the boundary. Keep avg_raw in the CTE for the EXISTS and apply ROUND exactly once, in the final projection — the reported number and the compared number are deliberately different expressions.",
      "Assembly: GROUP BY user_id into (prompt_count, avg_raw); WHERE prompt_count >= 3 AND EXISTS (SELECT 1 FROM prompts p WHERE p.user_id = s.user_id AND p.tokens > s.avg_raw); project ROUND(avg_raw, 2) AS avg_tokens; ORDER BY avg_tokens DESC, user_id ASC — the official tie order, deterministic even when two users' rounded averages collide.",
    ],
    edges: [
      "Boundary equality: max == average (user 4's three 100s) excludes — the requirement says GREATER than their own average, and equal is not greater.",
      "Count floor is a quota, not a quality bar: user 5's 500-token whopper and 450 average mean nothing at two prompts (official user 2 fails the same way at 65).",
      "Compare against the RAW average, not the rounded alias — ROUND can round up and turn a genuine > into a phantom = at the third decimal.",
      "prompt_count is a bare COUNT(*) — (user_id, prompt) uniqueness makes it duplication-proof; no DISTINCT theater needed.",
    ],
    ladder: [
      {
        title: "Brute force — two queries per user",
        body: "For each user, one query for count + average and a second for 'does any row beat it' — N+1 round trips, with the average floating between queries and every chance the two disagree on rounding.",
      },
      {
        title: "The pattern — aggregate once, probe back",
        body: "A stats CTE (GROUP BY user_id) plus a correlated EXISTS into the base table is the canonical self-referencing filter — the same family as 'employees earning above their department average'. The CTE is the average's single source of truth.",
      },
      {
        title: "The optimal idea — strict EXISTS, round at the edge",
        body: "One CTE, one EXISTS probe per surviving group (index-friendly on the (user_id, prompt) primary key), ROUND only in the projection. Alternative shape: join prompts back and HAVING MAX(tokens) > AVG(tokens) — same verdicts, one more scan.",
      },
    ],
    approach: "CTE per-user stats + EXISTS strictly above own raw average",
    schema: {
      ddl: `CREATE TABLE prompts (
  user_id INTEGER NOT NULL,
  prompt  TEXT NOT NULL,
  tokens  INTEGER NOT NULL,
  PRIMARY KEY (user_id, prompt)
);`,
      seed: `INSERT INTO prompts (user_id, prompt, tokens) VALUES
  (1, 'Write a blog outline',     120),  -- official
  (1, 'Generate SQL query',        80),  -- official
  (1, 'Summarize an article',     200),  -- official: 200 > avg 133.33 → included
  (2, 'Create resume bullet',      60),  -- official: only 2 prompts
  (2, 'Improve LinkedIn bio',      70),  -- official
  (3, 'Explain neural networks',  300),  -- official
  (3, 'Generate interview Q&A',   250),  -- official: 300 and 250 both > avg 237.5
  (3, 'Write cover letter',       180),  -- official
  (3, 'Optimize Python code',     220),  -- official
  (4, 'Summarize a tweet',        100),  -- trap: all-equal user
  (4, 'Draft a reply',            100),  -- trap: max == avg → 'greater than' fails
  (4, 'Polish a README',          100),  -- trap: count = 3 passes, EXISTS does not
  (5, 'Translate a doc',          500),  -- trap: expensive but only 2 prompts
  (5, 'Refactor a module',        400),  -- trap: high average means nothing at count 2
  (6, 'Draft a sprint plan',       10),  -- trap: exactly 3 prompts (boundary IN)
  (6, 'Review a pull request',     20),  -- trap: avg 20
  (6, 'Outline a launch post',     30);  -- trap: 30 > 20 → included`,
      tables: [
        { name: "prompts", note: "17 rows, 6 users — official 9 plus an all-equal user, an expensive 2-prompt user and a boundary 3-prompt user" },
      ],
    },
    code: `WITH stats AS (
    SELECT
        user_id,
        COUNT(*)    AS prompt_count,
        AVG(tokens) AS avg_raw       -- keep the RAW mean for the comparison
    FROM prompts
    GROUP BY user_id
)
SELECT
    s.user_id,
    s.prompt_count,
    ROUND(s.avg_raw, 2) AS avg_tokens  -- rounding is display-only — the test used the raw value
FROM stats s
WHERE s.prompt_count >= 3             -- floor: at least three prompts
  AND EXISTS (SELECT 1                -- at least one OWN prompt strictly above OWN average
              FROM prompts p
              WHERE p.user_id = s.user_id
                AND p.tokens > s.avg_raw)
ORDER BY avg_tokens DESC, s.user_id ASC;`,
    walkthrough: [
      "stats folds the 17 rows into six users: user 1 (3 prompts, avg 133.33…), user 2 (2, 65), user 3 (4, 237.5), user 4 (3, 100), user 5 (2, 450), user 6 (3, 20).",
      "The count gate drops users 2 and 5 — user 5's 500-token prompt and 450 average are exactly the bait the floor exists to ignore; the minimum is a quota, not a quality bar.",
      "The EXISTS gate drops user 4: every prompt equals the 100-token average, so no row satisfies tokens > avg_raw — the strict inequality is the whole trap. User 3 qualifies twice over (300 and 250 above 237.5), user 1 via the 200-token prompt, user 6 on the boundary via 30 > 20.",
      "ROUND dresses the survivor averages — 237.5, 133.33, 20.0 — and the double sort prints user 3, user 1, user 6: avg_tokens descending with user_id as the deterministic tie-break.",
    ],
    time: "O(n) for the GROUP BY plus an index-backed EXISTS probe per surviving user (the (user_id, prompt) primary key serves the correlation)",
    space: "O(u) — one stats row per user",
    followUps: [
      "Rewrite the EXISTS as a joined GROUP BY with HAVING MAX(tokens) > AVG(tokens): which form is cheaper per user, and why do both agree on the all-equal user?",
      "Add a rank column with RANK() OVER (ORDER BY avg_tokens DESC): where do ties land once ROUND collapses near-equal averages, and which users share a rank in a seed built for it?",
    ],
    related: ["queries-quality-and-percentage", "average-selling-price", "classes-more-than-5-students"],
    order: "exact",
    xp: 10,
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
  {
    slug: "find-loyal-customers",
    statement:
      "A transactions log marks every row as a purchase or a refund. A customer is loyal when they made at least three purchases, their first-to-last transaction spans at least 30 days, and refunds make up less than 20% of ALL their transactions. Output the loyal customer ids in ascending order.",
    examples: [
      {
        input:
          "18 official transactions for customers 101–104 — plus traps: 105 (3 purchases, Jan 1 → Jan 31), 106 (Jan 1 → Jan 30), 107 (4 purchases + 1 refund over 60 days), 108 (3 purchases all on 2024-02-01), 109 (10 purchases + 2 refunds across 12 transactions)",
        output: "customer_id: 101 · 104 · 105 · 109",
        explanation:
          "101: 4 purchases, 0 refunds, 46-day span. 104: 1/6 ≈ 16.7% refunds, 74-day span. 105's span is EXACTLY 30 days — the inclusive ≥ keeps it; 106 misses at 29. 107 lands on exactly 1/5 = 20% — not < 20%, out. 108 has 3 purchases but a 0-day span. 109 is the denominator trap: refunds ÷ all = 2/12 ≈ 16.7% (loyal) — refunds ÷ purchases would misread 2/10 = 20% and wrongly drop them.",
      },
    ],
    constraints: [
      "transaction_type is either 'purchase' or 'refund'; transaction_date is a YYYY-MM-DD date",
      "loyal = ≥ 3 purchase transactions AND (max date − min date) ≥ 30 days AND refunds ÷ ALL transactions < 20% (strict)",
      "the 30-day span and the refund-rate denominator count ALL transactions (refunds included); order by customer_id ASC",
    ],
    breakdown: [
      "Three independent criteria per customer, ALL of which must hold: ≥ 3 purchase transactions, a first-to-last span of ≥ 30 days, and refunds under 20% of ALL transactions. None of them is about consecutiveness — 'active for at least 30 days' is a SPAN (max date − min date), exactly as the official walk-through computes it (Jan 5 → Feb 20 = 46 days). Whatever 'gaps and islands' intuition the problem name invites, the facts define span, not streaks.",
      "Each criterion is a per-group aggregate: SUM(transaction_type = 'purchase') counts purchases (SQLite sums booleans as 0/1), MAX(julianday(transaction_date)) − MIN(...) is the span in days, and the refund rate's DENOMINATOR is COUNT(*) — purchases PLUS refunds. The denominator is the stealth trap: refunds/purchases would judge customer 109 as 2/10 = 20% (out) when the truth is 2/12 ≈ 16.7% (in).",
      "Boundary discipline: 'less than 20%' is strict — customer 107's 1/5 = 20.0% exactly is OUT. 'At least 30 days' is inclusive — customer 105's Jan 1 → Jan 31 = 30.0 days exactly is IN, while 106's 29-day span is out. And customer 108's three purchases all land on 2024-02-01: the purchase count (3) clears, but the span is 0 — transactions, not days, are what the first gate counts.",
      "Everything folds into one GROUP BY customer_id with a three-clause HAVING — no joins, no CTEs, no windows. That single pass is also what keeps the three criteria honest: every gate reads the SAME group's rows, so the purchase count, the span and the refund denominator can never drift apart the way three separate correlated subqueries would. julianday() converts the TEXT dates to numbers so subtraction measures days; ORDER BY customer_id ASC finishes the (mandated) job. The seed shows each clause earning its keep — 108 dies on the span gate with a 0-day relationship, 107 on the strict refund gate at exactly 20.0%, and 109 survives precisely because COUNT(*) holds all 12 rows in the denominator.",
    ],
    edges: [
      "The refund rate's denominator is ALL transactions: customer 109 is 2/12 ≈ 16.7% (loyal) — a refunds/purchases misread gives 2/10 = 20% and wrongly drops them.",
      "'Less than 20%' is strict: customer 107 lands on exactly 1/5 = 20.0% and is out despite 4 purchases and a 60-day span.",
      "'At least 30 days' is inclusive: 105 (Jan 1 → Jan 31, exactly 30) is in; 106 (29 days) is out.",
      "Three same-day purchases (customer 108) satisfy the purchase count but give a 0-day span — volume of transactions ≠ length of relationship.",
    ],
    ladder: [
      {
        title: "Brute force — three subqueries per customer",
        body: "Check purchase count, date span and refund share with separate correlated subqueries — three scans of the log per customer, and the denominators drift apart between them.",
      },
      {
        title: "The pattern — one GROUP BY, boolean sums",
        body: "GROUP BY customer_id and compute all three metrics in one pass: SUM(type = 'purchase'), julianday MAX − MIN, SUM(type = 'refund') ÷ COUNT(*). Each metric is a standard aggregate over the same group.",
      },
      {
        title: "The optimal idea — a three-clause HAVING",
        body: "The whole problem is a per-customer predicate, so HAVING carries all three gates (with the strict/inclusive boundaries the facts pin) and ORDER BY customer_id finishes. No joins, no CTE, one scan.",
      },
    ],
    approach: "One GROUP BY + three-clause HAVING (boolean sums + julianday span)",
    schema: {
      ddl: `CREATE TABLE customer_transactions (
  transaction_id   INTEGER PRIMARY KEY,
  customer_id      INTEGER NOT NULL,
  transaction_date TEXT NOT NULL,      -- 'YYYY-MM-DD'
  amount           REAL NOT NULL,
  transaction_type TEXT NOT NULL       -- 'purchase' | 'refund'
);`,
      seed: `INSERT INTO customer_transactions (transaction_id, customer_id, transaction_date, amount, transaction_type) VALUES
  (1,  101, '2024-01-05', 150.00, 'purchase'),   -- official
  (2,  101, '2024-01-15', 200.00, 'purchase'),
  (3,  101, '2024-02-10', 180.00, 'purchase'),
  (4,  101, '2024-02-20', 250.00, 'purchase'),
  (5,  102, '2024-01-10', 100.00, 'purchase'),
  (6,  102, '2024-01-12', 120.00, 'purchase'),
  (7,  102, '2024-01-15', 80.00,  'refund'),
  (8,  102, '2024-01-18', 90.00,  'refund'),
  (9,  102, '2024-02-15', 130.00, 'purchase'),
  (10, 103, '2024-01-01', 500.00, 'purchase'),
  (11, 103, '2024-01-02', 450.00, 'purchase'),
  (12, 103, '2024-01-03', 400.00, 'purchase'),
  (13, 104, '2024-01-01', 200.00, 'purchase'),
  (14, 104, '2024-02-01', 250.00, 'purchase'),
  (15, 104, '2024-02-15', 300.00, 'purchase'),
  (16, 104, '2024-03-01', 350.00, 'purchase'),
  (17, 104, '2024-03-10', 280.00, 'purchase'),
  (18, 104, '2024-03-15', 100.00, 'refund'),
  (19, 105, '2024-01-01', 300.00, 'purchase'),   -- TRAP: span = EXACTLY 30 days -> still loyal
  (20, 105, '2024-01-15', 120.00, 'purchase'),
  (21, 105, '2024-01-31', 90.00,  'purchase'),
  (22, 106, '2024-01-01', 300.00, 'purchase'),   -- TRAP: span 29 days -> misses the bar
  (23, 106, '2024-01-15', 120.00, 'purchase'),
  (24, 106, '2024-01-30', 90.00,  'purchase'),
  (25, 107, '2024-01-01', 200.00, 'purchase'),   -- TRAP: 1 refund / 5 total = EXACTLY 20% -> not < 20%
  (26, 107, '2024-01-20', 150.00, 'purchase'),
  (27, 107, '2024-02-10', 180.00, 'purchase'),
  (28, 107, '2024-03-01', 220.00, 'purchase'),
  (29, 107, '2024-02-15', 100.00, 'refund'),
  (30, 108, '2024-02-01', 50.00,  'purchase'),   -- TRAP: 3 purchases, ONE day -> span 0
  (31, 108, '2024-02-01', 60.00,  'purchase'),
  (32, 108, '2024-02-01', 70.00,  'purchase'),
  (33, 109, '2024-01-01', 60.00,  'purchase'),   -- TRAP: 2 refunds / 12 total = 16.7% (a
  (34, 109, '2024-01-08', 70.00,  'purchase'),   --   refunds/purchases misread says 2/10 = 20%)
  (35, 109, '2024-01-15', 80.00,  'purchase'),
  (36, 109, '2024-01-22', 90.00,  'purchase'),
  (37, 109, '2024-01-29', 100.00, 'purchase'),
  (38, 109, '2024-02-05', 110.00, 'purchase'),
  (39, 109, '2024-02-12', 120.00, 'purchase'),
  (40, 109, '2024-02-19', 130.00, 'purchase'),
  (41, 109, '2024-02-26', 140.00, 'purchase'),
  (42, 109, '2024-03-04', 150.00, 'purchase'),
  (43, 109, '2024-01-10', 40.00,  'refund'),
  (44, 109, '2024-02-08', 40.00,  'refund');`,
      tables: [
        { name: "customer_transactions", note: "44 rows — the official 18 + five trap customers (105–109): 30-day boundary, 29-day miss, exactly-20% rate, same-day burst, denominator flip" },
      ],
    },
    code: `SELECT customer_id
FROM customer_transactions
GROUP BY customer_id
HAVING SUM(transaction_type = 'purchase') >= 3                 -- gate 1: >= 3 purchase ROWS
   AND MAX(julianday(transaction_date))
     - MIN(julianday(transaction_date)) >= 30                  -- gate 2: first-to-last span >= 30 days
   AND SUM(transaction_type = 'refund') * 1.0 / COUNT(*) < 0.2 -- gate 3: refunds / ALL transactions < 20% (strict)
ORDER BY customer_id ASC;                                      -- mandated ascending ids`,
    walkthrough: [
      "The single GROUP BY folds all 44 rows: customer 101 → 4 purchases, 0 refunds, 46-day span; 102 → 3 purchases + 2 refunds over 36 days; 103 → 3 purchases in 2 days; 104 → 5 + 1 over 74 days; and the traps — 105 (3 purchases, 30-day span), 106 (29 days), 107 (1 refund in 5), 108 (3 purchases, one day), 109 (2 refunds in 12).",
      "The purchase gate (≥ 3) alone eliminates nobody in this seed — everyone owns at least three purchases — which is exactly why it's dangerous to eyeball: all the eliminations live in the span and rate gates.",
      "The span gate kills 103 (2 days), 106 (29) and 108 (0); 105's exactly-30 span survives the inclusive ≥. The rate gate kills 102 (2/5 = 40%) and 107 (exactly 20%, not < 20%); 109's correct denominator 2/12 ≈ 16.7% keeps them in — the purchases-only misread (2/10 = 20%) would have wrongly dropped them.",
      "Survivors 101, 104, 105 and 109 print in ascending id order — four customers, three gates, one pass.",
    ],
    time: "O(t) — one grouped pass over t transactions (julianday conversion is O(1) per row)",
    space: "O(c) — one aggregate row per customer",
    followUps: [
      "Redefine loyal as purchases in 3 CONSECUTIVE months — the gaps-and-islands variant; what would the seed need so that span ≠ streak actually changes the answer?",
      "Make the thresholds parameters: rewrite the HAVING so the purchase floor, span and rate cutoff come from a small VALUES spine — and explain why the rate boundary must stay strict.",
    ],
    related: ["user-activity-for-the-past-30-days-i", "the-latest-login-in-2020", "find-churn-risk-customers"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-emotionally-consistent-users",
    statement:
      "Users react to content items with labels such as like, wow, sad or love; each user can react to a given item at most once. Report the users who reacted to at least 5 DIFFERENT content items and whose single most-used reaction accounts for at least 60% of all their reactions — showing the dominant reaction label and its share rounded to 2 decimals, ordered by share descending then user_id ascending.",
    examples: [
      {
        input:
          "reactions: users 1–3 hold the official 15 rows (user 1: four like + one wow · user 2: two like, two wow, one sad · user 3: five love) + TRAPS — user 4 reacts love ×4 (one short of five items) · user 5 reacts six times, four like · user 6 reacts five times, three wow · user 7 reacts seven times, four like · user 8 reacts love ×3 AND Love ×3 (a case split)",
        output: "3 love 1 · 1 like 0.8 · 5 like 0.67 · 6 wow 0.6",
        explanation:
          "User 3's perfect 5/5 = 1 and user 1's official 4/5 = 0.8 lead the table. User 5's 4/6 rounds to 0.67 and clears the bar; user 6's 3/5 sits EXACTLY on 0.6 and survives because the rule is 'at least 60%'. Every trap dies of one cause: user 4 never reaches five items (its ratio would be a perfect 1.0 — irrelevant), user 7's 4/7 ≈ 0.57 falls short, and user 8's split of love ×3 vs Love ×3 caps the max share at 3/6 = 0.5 — case-blind grouping would wrongly see 6/6 love and print a fake 1.00.",
      },
    ],
    constraints: [
      "(user_id, content_id) is the primary key — one reaction per user per content item, so a user's row count IS their distinct content-item count",
      "eligibility: at least 5 reacted content items; consistency: dominant reaction covers at least 60% of all the user's reactions",
      "reaction_ratio is rounded to 2 decimal places for display; output ordered by reaction_ratio DESC, then user_id ASC",
    ],
    breakdown: [
      "What's really asked is a per-user mode (most frequent reaction label) plus two gates: eligibility (at least 5 distinct content items) and consistency (mode share >= 60%). The output needs the mode LABEL and its share together — so the aggregation must keep the label attached to its count, not just produce a bare MAX.",
      "The core mechanism is two-level aggregation. The counts CTE aggregates reactions per (user_id, reaction). A windowed ROW_NUMBER ordered by cnt DESC (reaction ASC to break ties deterministically) ranks each user's labels — built in a CTE and filtered with rk = 1 outside, the standard window-then-filter idiom. A totals subquery sums the counts back up per user; because (user_id, content_id) is the primary key, SUM(cnt) for a user equals the number of distinct content items they reacted to, so one number serves both the eligibility gate and the ratio's denominator.",
      "Why naive fails: MAX(cnt) finds the biggest count but loses which label owns it, so you can't print dominant_reaction without a second self-join on (user_id, cnt) that still needs tie handling. Comparing the ROUNDED ratio to 0.6 is subtly wrong — the facts round for DISPLAY; the 'at least 60%' test runs on the true fraction (this seed avoids the ambiguity, but a 0.596 share rounding to 0.60 would flip if you compared after rounding). And grouping case-blindly (UPPER(reaction), or a case-insensitive collation) merges 'Love' into 'love' — user 8 would print a fake 6/6 = 1.00 instead of the true 3/6 = 0.5.",
      "Assembly: counts → ranked (window) and totals (group-by) in parallel → join them, keep rk = 1 rows, apply total >= 5 and 1.0 * cnt / total >= 0.6 on the UNROUNDED share, and only then ROUND(1.0 * cnt / total, 2) once for output. ORDER BY reaction_ratio DESC, user_id ASC matches the mandated ordering — and ROUND's result is what sorts, which is safe here because rounding is monotonic.",
    ],
    edges: [
      "The 5-item gate is about content items, not reaction types: user 4's four loves would win any ratio contest (1.00) but never reach the gate.",
      "0.6 is inclusive: user 6's 3/5 = 0.60 survives — and the boundary must be tested against the UNROUNDED fraction, with ROUND applied only for display.",
      "Reaction labels compare case-sensitively ('Love' ≠ 'love'): user 8's max share is 3/6 = 0.5 and it's excluded — LOWER() or a CI collation would fabricate a perfect 1.00.",
      "Dominant-label ties are broken alphabetically for determinism ('like' over 'wow' for user 2): the choice is unobservable here because tied users fail the 0.6 bar anyway, but the code must stay deterministic.",
    ],
    ladder: [
      {
        title: "Brute force — tally each user's labels by hand",
        body: "For each user, build a dict of label → count, find the max label, compute its share, check the two gates. The SQL translation needs the label+count pairing done explicitly — a bare MAX(cnt) can't tell you what label owned it.",
      },
      {
        title: "The pattern — rank the label counts, then filter rank 1",
        body: "Aggregate per (user, reaction), rank labels within each user with ROW_NUMBER (cnt DESC, label ASC), and separately SUM the counts per user. Joining rank-1 rows to totals gives dominant label, dominant count and denominator in one flat result.",
      },
      {
        title: "The optimal idea — one scan feeding both the window and the totals",
        body: "The counts CTE is scanned once and feeds two consumers (the windowed ranking and the totals), so the whole query is one aggregation pass plus one hash join. Gates run on the unrounded share; ROUND fires exactly once, in the SELECT list.",
      },
    ],
    approach: "Dominant label via ROW_NUMBER over per-label counts + unrounded-share gates",
    schema: {
      ddl: `CREATE TABLE reactions (
  user_id    INTEGER NOT NULL,
  content_id INTEGER NOT NULL,
  reaction   TEXT NOT NULL,
  PRIMARY KEY (user_id, content_id)
);`,
      seed: `INSERT INTO reactions (user_id, content_id, reaction) VALUES
  (1, 101, 'like'), (1, 102, 'like'), (1, 103, 'like'),   -- official users 1-3
  (1, 104, 'wow'),  (1, 105, 'like'),
  (2, 201, 'like'), (2, 202, 'wow'),  (2, 203, 'sad'),
  (2, 204, 'like'), (2, 205, 'wow'),
  (3, 301, 'love'), (3, 302, 'love'), (3, 303, 'love'),
  (3, 304, 'love'), (3, 305, 'love'),
  (4, 401, 'love'), (4, 402, 'love'),                     -- TRAP: only 4 items
  (4, 403, 'love'), (4, 404, 'love'),                     -- (perfect 1.0 ratio, moot)
  (5, 501, 'like'), (5, 502, 'like'), (5, 503, 'like'),   -- TRAP: 4/6 = 0.67 qualifies
  (5, 504, 'like'), (5, 505, 'wow'),  (5, 506, 'sad'),
  (6, 601, 'wow'),  (6, 602, 'wow'),  (6, 603, 'wow'),    -- TRAP: exactly 3/5 = 0.6
  (6, 604, 'like'), (6, 605, 'sad'),                      -- (>= keeps it)
  (7, 701, 'like'), (7, 702, 'like'), (7, 703, 'like'),   -- TRAP: 4/7 = 0.57 ->
  (7, 704, 'like'), (7, 705, 'wow'),  (7, 706, 'sad'),    -- just below the bar
  (7, 707, 'angry'),
  (8, 801, 'love'), (8, 802, 'love'), (8, 803, 'love'),   -- TRAP: 'love' x3 + 'Love' x3
  (8, 804, 'Love'), (8, 805, 'Love'), (8, 806, 'Love');   -- case-split -> max 3/6 = 0.5`,
      tables: [
        { name: "reactions", note: "34 rows — users 1–3 official; users 4–8 are the gate, boundary, near-miss and case-sensitivity traps" },
      ],
    },
    code: `WITH counts AS (
  -- reactions per (user, label)
  SELECT user_id, reaction, COUNT(*) AS cnt
  FROM reactions
  GROUP BY user_id, reaction
),
ranked AS (
  -- rank each user's labels by frequency; ties fall back to alphabetical
  -- so the pick is deterministic even when the user fails the bar anyway
  SELECT
    user_id,
    reaction,
    cnt,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY cnt DESC, reaction ASC
    ) AS rk
  FROM counts
),
totals AS (
  -- PK (user_id, content_id) means one row per content item:
  -- SUM(cnt) IS the distinct content-item count
  SELECT user_id, SUM(cnt) AS total
  FROM counts
  GROUP BY user_id
)
SELECT
  r.user_id,
  r.reaction AS dominant_reaction,
  ROUND(1.0 * r.cnt / t.total, 2) AS reaction_ratio  -- display-only rounding
FROM ranked r
JOIN totals t
  ON t.user_id = r.user_id
WHERE r.rk = 1                          -- only the dominant label
  AND t.total >= 5                      -- at least 5 different content items
  AND 1.0 * r.cnt / t.total >= 0.6      -- consistency bar, on the TRUE fraction
ORDER BY reaction_ratio DESC, r.user_id ASC;`,
    order: "exact",
    walkthrough: [
      "counts reduces 34 rows to 15 label tallies: user 1 → like 4, wow 1; user 2 → like 2, wow 2, sad 1; user 3 → love 5; user 4 → love 4; user 5 → like 4, wow 1, sad 1; user 6 → wow 3, like 1, sad 1; user 7 → like 4, wow 1, sad 1, angry 1; user 8 → love 3 AND Love 3 as two separate labels.",
      "ranked assigns rk 1 per user: 'like' for users 1, 5 and 7; 'love' for user 3; 'wow' for user 6; 'like' (alphabetical, over 'wow') for user 2; and 'Love' for user 8 — capital 'L' sorts before lowercase 'l' in binary order, though the choice is moot at 0.5.",
      "totals + gates: user 1 → 4/5 = 0.8 ≥ 0.6 ✓; user 2 → 0.4 ✗; user 3 → 1.0 ✓; user 4 → total 4 < 5 ✗ (its 1.0 share never matters); user 5 → 4/6 ≈ 0.6667 ✓; user 6 → 3/5 = 0.60 exactly, and 'at least 60%' keeps it; user 7 → 4/7 ≈ 0.5714 ✗; user 8 → 3/6 = 0.5 ✗.",
      "Four survivors get their display ratio — 1, 0.8, 0.67, 0.6 — and ORDER BY sorts them 3, 1, 5, 6: ratio descending, then user_id. Exactly the documented snapshot.",
    ],
    time: "O(r) — one pass over r reactions for the counts CTE, then linear passes for the window, totals and join",
    space: "O(u · k) for u users holding k distinct labels each",
    followUps: [
      "How would you measure consistency over a user's LAST 5 reactions instead of their lifetime? (Number each reaction per user with ROW_NUMBER over the arrival order and restrict the aggregation to steps > max(step) - 5.)",
      "What if you had to report ALL mode labels when several tie for the dominant count? (Replace the rk = 1 filter with RANK() and keep every row whose count equals MAX(cnt) — then decide which label, if any, 'dominant_reaction' names.)",
    ],
    related: ["find-books-with-polarized-opinions", "percentage-of-users-attended-a-contest", "queries-quality-and-percentage"],
    xp: 20,
  },
  {
    slug: "find-users-with-persistent-behavior-patterns",
    statement:
      "An activity log records which action each user performed on each date; a user may perform several DIFFERENT actions on the same day. A user is behaviorally stable when some streak of at least 5 consecutive calendar days exists in which they performed exactly ONE action per day and it was the same action on every one of those days. Report each stable user once — their longest such streak with its action, length, first date and last date — ordered by streak_length descending, then user_id ascending.",
    examples: [
      {
        input:
          "activity: users 1–3 hold the official 17 rows (user 1: login 01-01→01-05 then logout on 01-06 · user 2: click 01-01→01-04 · user 3: view 01-01→01-07) + TRAPS — user 4 logs in 02-01→02-05 but ALSO clicks on 02-03 · user 5 views 01-29→02-02, straight across the month boundary · user 6 logs in 03-01→03-06 AND views 03-10→03-14 · user 7 scrolls 04-01→04-05",
        output:
          "3 view 7 2024-01-01 2024-01-07 · 6 login 6 2024-03-01 2024-03-06 · 1 login 5 2024-01-01 2024-01-05 · 5 view 5 2024-01-29 2024-02-02 · 7 scroll 5 2024-04-01 2024-04-05",
        explanation:
          "User 3's 7-day view run leads, user 1's official 5-day login run survives (logout lives on its own single-action day), and user 2's 4-day click run misses the minimum. The traps: user 4's login run LOOKS like 5 days but the extra click on 02-03 means that day had two actions — 'exactly one action per day' snaps the run to 2 + 2; user 5's run crosses Jan→Feb unharmed; user 6 has two qualifying streaks and only the maximum (login, 6) is reported; user 7 ties user 5 at 5 and user_id ASC puts 5 before 7.",
      },
    ],
    constraints: [
      "(user_id, action_date, action) is the primary key — the same action can never repeat on one date, so a two-row day means two DIFFERENT actions",
      "stable = at least 5 consecutive calendar days with exactly one action per day and that action identical throughout",
      "report one row per stable user — the maximum-length qualifying sequence; output ordered by streak_length DESC, then user_id ASC",
    ],
    breakdown: [
      "What's really asked is a per-(user, action) run of consecutive CALENDAR days — but with a precondition that's easy to skim past: every day of the run must contain EXACTLY ONE action. The primary key allows a user to hold several different actions on one date, and the definition's 'exactly one action per day' bullet exists precisely to judge those days: a day with two actions can't sit inside any qualifying streak, for any action.",
      "The core mechanism is the classic gaps-and-islands, in two stages. Stage one is a windowed COUNT(*) OVER (PARTITION BY user_id, action_date) that flags multi-action days; those rows drop before islanding, because they can never belong to a streak. Stage two keys each island by day_number − ROW_NUMBER: CAST(strftime('%s', action_date) AS INTEGER) / 86400 turns each date into an exact integer day number, and subtracting the per-(user, action) rank leaves a constant group id exactly while dates advance one day per row — any gap re-bumps the rank and starts a new group.",
      "Why naive fails in three ways. Ignoring the one-action clause and islanding raw rows would report user 4's 02-01→02-05 login as a clean 5-run when the 02-03 click snaps it to 2 + 2. Using julianday() for the day number is a float trap — a real 35-minute span computes as 34.999999… days and CASTs to 34; epoch seconds stay integral. And grouping dates by month or formatting them as strings breaks exactly at month boundaries — user 5's 01-29→02-02 run must survive the Jan→Feb rollover, which pure day-number arithmetic handles silently.",
      "Assembly: one_action_days → streaks (island keys) → runs (MIN/MAX dates and COUNT per island) → best, where ROW_NUMBER per user ordered by streak_length DESC picks the maximum-length sequence (start_date ASC, action ASC as deterministic tiebreaks for a case the facts leave unspecified) → the final SELECT prints the rk = 1 row per user, ORDER BY streak_length DESC, user_id ASC as mandated.",
    ],
    edges: [
      "Exactly-one-action rule: user 4's extra click on 02-03 means that date holds two actions — BOTH of its rows drop, and the login run collapses to 2 + 2, under the 5-day bar.",
      "The PK already forbids the same action twice on one date — the only way a day gets two rows is two different actions, which is exactly what the one-action filter must catch.",
      "Month boundary: user 5's 01-29 → 02-02 run survives because epoch day numbers 19751…19755 are simply adjacent integers — no month-aware logic exists to break.",
      "Multiple qualifying streaks: user 6 keeps only the 6-day login run; if a user's two runs ever TIED at max length, the ROW_NUMBER tiebreak (earlier start_date, then action name) picks one deterministically — this seed avoids that case, as the facts don't specify it.",
    ],
    ladder: [
      {
        title: "Brute force — walk each user's calendar day by day",
        body: "For each user and action, walk dates checking that date + 1 exists with the same action and that the day carries exactly one row. O(rows × run length) and awkward to express in set-based SQL — the classic shape is loops, not queries.",
      },
      {
        title: "The pattern — gaps-and-islands on day numbers",
        body: "Turn each date into an integer day number, subtract the per-(user, action) ROW_NUMBER, and consecutive days share a constant island key. GROUP BY the island to get MIN/MAX dates and COUNT = streak length.",
      },
      {
        title: "The optimal idea — pre-filter impure days, then island on integers",
        body: "A windowed COUNT(*) OVER (PARTITION BY user_id, action_date) drops multi-action days BEFORE islanding (no self-join needed), epoch-second day numbers keep the arithmetic float-free, and ROW_NUMBER per user picks the longest run in one more pass — one sort plus two hash group-bys overall.",
      },
    ],
    approach: "One-action-day pre-filter + gaps-and-islands streaks + per-user max via ROW_NUMBER",
    schema: {
      ddl: `CREATE TABLE activity (
  user_id     INTEGER NOT NULL,
  action_date TEXT NOT NULL,  -- 'YYYY-MM-DD'
  action      TEXT NOT NULL,
  PRIMARY KEY (user_id, action_date, action)
);`,
      seed: `INSERT INTO activity (user_id, action_date, action) VALUES
  (1, '2024-01-01', 'login'), (1, '2024-01-02', 'login'),   -- official users 1-3
  (1, '2024-01-03', 'login'), (1, '2024-01-04', 'login'),
  (1, '2024-01-05', 'login'), (1, '2024-01-06', 'logout'),
  (2, '2024-01-01', 'click'), (2, '2024-01-02', 'click'),   -- official: 4-day run,
  (2, '2024-01-03', 'click'), (2, '2024-01-04', 'click'),   -- one short of 5
  (3, '2024-01-01', 'view'),  (3, '2024-01-02', 'view'),
  (3, '2024-01-03', 'view'),  (3, '2024-01-04', 'view'),
  (3, '2024-01-05', 'view'),  (3, '2024-01-06', 'view'),
  (3, '2024-01-07', 'view'),
  (4, '2024-02-01', 'login'), (4, '2024-02-02', 'login'),   -- TRAP: login 02-01..02-05
  (4, '2024-02-03', 'login'), (4, '2024-02-03', 'click'),   -- but TWO actions on 02-03
  (4, '2024-02-04', 'login'), (4, '2024-02-05', 'login'),   -- -> run snaps to 2 + 2
  (5, '2024-01-29', 'view'),  (5, '2024-01-30', 'view'),    -- TRAP: 5-day run across
  (5, '2024-01-31', 'view'),  (5, '2024-02-01', 'view'),    -- the Jan/Feb boundary
  (5, '2024-02-02', 'view'),
  (6, '2024-03-01', 'login'), (6, '2024-03-02', 'login'),   -- TRAP: two separate
  (6, '2024-03-03', 'login'), (6, '2024-03-04', 'login'),   -- streaks (6-day login,
  (6, '2024-03-05', 'login'), (6, '2024-03-06', 'login'),   -- 5-day view, 3-day gap):
  (6, '2024-03-10', 'view'),  (6, '2024-03-11', 'view'),    -- only the max is reported
  (6, '2024-03-12', 'view'),  (6, '2024-03-13', 'view'),
  (6, '2024-03-14', 'view'),
  (7, '2024-04-01', 'scroll'), (7, '2024-04-02', 'scroll'), -- TRAP: 5-day run tying
  (7, '2024-04-03', 'scroll'), (7, '2024-04-04', 'scroll'), -- user 5's length ->
  (7, '2024-04-05', 'scroll');                              -- user_id ASC breaks the tie`,
      tables: [
        { name: "activity", note: "44 rows — users 1–3 official; users 4–7 are the impure-day, month-boundary, two-streak and ordering-tie traps" },
      ],
    },
    code: `WITH one_action_days AS (
  -- keep only (user, date) days with EXACTLY one action: a day holding two
  -- different actions can never belong to a qualifying streak
  SELECT user_id, action_date, action
  FROM (
    SELECT
      user_id, action_date, action,
      COUNT(*) OVER (PARTITION BY user_id, action_date) AS actions_that_day
    FROM activity
  ) checked
  WHERE actions_that_day = 1
),
streaks AS (
  -- gaps-and-islands: consecutive calendar days of one action share a group id
  SELECT
    user_id,
    action,
    action_date,
    CAST(strftime('%s', action_date) AS INTEGER) / 86400
      - ROW_NUMBER() OVER (
          PARTITION BY user_id, action
          ORDER BY action_date
        ) AS grp  -- day number minus rank: constant while dates step +1 per row
  FROM one_action_days
),
runs AS (
  SELECT
    user_id,
    action,
    MIN(action_date) AS start_date,
    MAX(action_date) AS end_date,
    COUNT(*)         AS streak_length
  FROM streaks
  GROUP BY user_id, action, grp
),
best AS (
  -- one winner per user: the LONGEST run (ties -> earliest start, then name)
  SELECT
    user_id, action, start_date, end_date, streak_length,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY streak_length DESC, start_date ASC, action ASC
    ) AS rk
  FROM runs
  WHERE streak_length >= 5   -- the persistence bar
)
SELECT user_id, action, streak_length, start_date, end_date
FROM best
WHERE rk = 1
ORDER BY streak_length DESC, user_id ASC;`,
    order: "exact",
    walkthrough: [
      "one_action_days filters 44 rows to 42: only user 4's (4, 02-03) carries COUNT 2 — login plus click — so both of its rows drop. Everything else survives, including user 1's logout (its own single-action day) and all of user 6's two runs.",
      "streaks builds island keys: user 1's logins 01-01…01-05 take ranks 1–5 against day numbers 19723–19727, leaving grp = 19722 for all five; the 01-06 logout islands alone under a different (user, action) partition; user 5's 01-29…02-02 spans day numbers 19751–19755 — the month rollover is invisible because the numbers simply increment.",
      "runs collapses islands: user 6's logins form a 6-run (03-01→03-06) and views a 5-run (03-10→03-14), the 03-07…03-09 gap keeping them separate; user 4's surviving logins regroup to a 2-run and a 2-run; user 2's click run tops out at 4.",
      "best keeps runs >= 5 and ROW_NUMBER picks one winner per user: user 6's login 6 beats its view 5. The final print — user 3 (view, 7), user 6 (login, 6), then the three 5-runs by user_id (1, 5, 7) with user 5's end_date showing 2024-02-02 — matches the documented output exactly.",
    ],
    time: "O(n log n) — one window sort per partition (day-purity count, island ranks, per-user max), everything else linear",
    space: "O(n) for the filtered rows, island keys and run table",
    followUps: [
      "How would you tolerate a single missed day inside a streak (runs may have one-day gaps)? (LAG the previous date per (user, action) and start a new island only when the gap exceeds 1 day — date(prev, '+1 day') < current.)",
      "What about alternating daily rituals, like login → purchase → login → purchase? (Pair each day with LEAD(action) OVER the user's date order and treat (action, next_action) tuples as the island key instead of action alone.)",
    ],
    related: ["find-loyal-customers", "active-users", "human-traffic-of-stadium"],
    xp: 35,
  },
];
