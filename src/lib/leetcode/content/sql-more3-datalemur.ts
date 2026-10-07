// Deep-dives — the SQL band expansion batch 4: DataLemur interview sets II
// (5 problems, re-authored from the canonical interview tasks with original
// tables and phrasing). Custom 95xx ids (not LeetCode numbers).
// Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_MORE3_DATALEMUR: LcSqlDive[] = [
  {
    slug: "card-launch-success",
    statement:
      "The card team reviews how each credit card performed month by month. card_applications logs every application with its card_name, apply_date and approved flag (1 = approved, 0 = declined). For each card and each month, compute the approval success rate: approved applications as a percentage of all applications that month, rounded to 2 decimals. Report apply_month as 'YYYY-MM', card_name and success_rate, ordered by apply_month then card_name. Months where a card received no applications produce no row at all.",
    examples: [
      {
        input: "Sapphire in 2024-01: applied on 01-05 (approved), 01-11 (declined), 01-19 (approved), 01-27 (approved)",
        output: "2024-01 · Sapphire · 75.0",
        explanation: "SUM(approved) = 3 of COUNT(*) = 4; 3 * 100.0 / 4 = 75.0. The integer-division bug hides on 'nice' months and shows on 1-in-3 months — see Quartz 2024-03: 33.33, not 33.",
      },
      {
        input: "Quartz has no applications in 2024-02; Sapphire goes 3-for-3 in 2024-02",
        output: "2024-02 · Sapphire · 100.0 — and no row for Quartz at all",
        explanation: "GROUP BY emits only groups that exist: a perfect month is 100.0, an absent card-month is absent — not 0.0.",
      },
    ],
    constraints: [
      "approved is 0/1; the rate is SUM(approved) over COUNT(*) for that card-month",
      "apply_month is the apply_date's 'YYYY-MM' bucket",
      "output columns: apply_month, card_name, success_rate — ordered by apply_month, then card_name",
    ],
    breakdown: [
      "The whole question is a single GROUP BY at the (month, card) grain. strftime('%Y-%m', apply_date) folds each ISO date into its month bucket, and grouping by that bucket plus card_name gives every (month, card) pair its own numerator and denominator. The numerator is SUM(approved): because approved is a 0/1 flag, summing it counts the 1s — the same number COUNT(CASE WHEN approved = 1 THEN 1 END) would produce with more ceremony. COUNT(*) is the denominator deliberately: declined applications belong in the base, so the rate is approvals over applications, not approvals over approvals.",
      "The *100.0 is load-bearing, not formatting. SUM(approved) and COUNT(*) are both INTEGER, and SQLite's / between two INTEGERs is integer division that truncates toward zero — 1 * 100 / 3 is 33, and no ROUND afterwards can recover the lost .33. Multiplying by 100.0 first promotes the expression to REAL, so the division keeps its decimals and ROUND(…, 2) trims rather than fabricates. The promotion must happen before the division: ROUND(SUM(approved) * 100 / COUNT(*), 2) still truncates, because the damage is done inside the integer expression.",
      "Per-group ratio versus global ratio is the analytical point of the exercise. One global rate — 10 approvals over 17 applications, 58.82 here — is a single number that hides the story: Sapphire ran a perfect February while Quartz launched at 2-for-5. GROUP BY computes each group's ratio against ITS OWN denominator, which is what makes the distribution visible. And absence is silent: Quartz has no rows in 2024-02, so GROUP BY emits no group there — the correct answer to 'approval rate for a card nobody applied for' is undefined, not 0; if a report needs those months, a calendar dimension with a LEFT JOIN must supply them.",
    ],
    edges: [
      "*100.0 must precede the division: 1*100/3 is integer division and floors to 33 — the trailing .0 is the entire fix.",
      "A card with zero applications in a month appears NOWHERE: GROUP BY only emits groups that exist — Quartz 2024-02 is absent, which means 'undefined rate', not a zero row.",
      "SUM over a 0/1 flag counts the trues — SUM(approved) ≡ COUNT(CASE WHEN approved = 1 THEN 1 END); the flag spelling is shorter, the CASE spelling is more self-documenting.",
      "A perfect month reads 100.0 and stays REAL — ROUND never turns it into the text '100'; keep the column numeric for downstream sorting.",
    ],
    ladder: [
      { title: "Brute force — one query per card-month", body: "For every (month, card) pair, run COUNT(*) and SUM(approved) over a WHERE range and divide in app code — dozens of round trips, and the list of pairs is only discoverable by scanning the table first." },
      { title: "The pattern — bucket, then aggregate", body: "strftime('%Y-%m', apply_date) builds the month key; GROUP BY the key and card_name produces numerator and denominator for every group in one pass." },
      { title: "The optimal idea — ratio in the same SELECT", body: "Compute SUM(approved) * 100.0 / COUNT(*), ROUND 2, right in the select list — one scan, one hash aggregate, O(n)." },
    ],
    approach: "GROUP BY strftime month + card; ROUND(SUM(approved) * 100.0 / COUNT(*), 2)",
    schema: {
      ddl: `CREATE TABLE card_applications (
  application_id INTEGER PRIMARY KEY,
  card_name      TEXT NOT NULL,
  apply_date     TEXT NOT NULL,
  approved       INTEGER NOT NULL CHECK (approved IN (0, 1))
);`,
      seed: `INSERT INTO card_applications (application_id, card_name, apply_date, approved) VALUES
  (1,'Sapphire','2024-01-05',1),
  (2,'Sapphire','2024-01-11',0),
  (3,'Sapphire','2024-01-19',1),
  (4,'Sapphire','2024-01-27',1),
  (5,'Sapphire','2024-02-03',1),
  (6,'Sapphire','2024-02-14',1),
  (7,'Sapphire','2024-02-22',1),
  (8,'Sapphire','2024-03-02',1),
  (9,'Sapphire','2024-03-15',0),
  (10,'Quartz','2024-01-08',1),
  (11,'Quartz','2024-01-09',0),
  (12,'Quartz','2024-01-21',0),
  (13,'Quartz','2024-01-30',1),
  (14,'Quartz','2024-01-31',0),
  (15,'Quartz','2024-03-06',1),
  (16,'Quartz','2024-03-12',0),
  (17,'Quartz','2024-03-27',0);`,
      tables: [
        { name: "card_applications", note: "17 applications; Sapphire is 3-for-3 in 2024-02, Quartz has zero rows in 2024-02 (absent month) and goes 1-for-3 in 2024-03 (the integer-division bait)" },
      ],
    },
    code: `-- Monthly approval rate per card: approvals over applications, as a %.
SELECT
    strftime('%Y-%m', apply_date)              AS apply_month,
    card_name,
    ROUND(SUM(approved) * 100.0 / COUNT(*), 2) AS success_rate
FROM card_applications
GROUP BY strftime('%Y-%m', apply_date), card_name
ORDER BY apply_month, card_name;`,
    walkthrough: [
      "strftime buckets the 17 applications into (month, card) groups: 2024-01 Sapphire 4 apps / 3 approvals, 2024-01 Quartz 5 / 2, 2024-02 Sapphire 3 / 3, 2024-03 Sapphire 2 / 1, 2024-03 Quartz 3 / 1 — and no 2024-02 Quartz group exists at all.",
      "Ratios: 3 * 100.0 / 4 = 75.0 · 2 * 100.0 / 5 = 40.0 · 3 * 100.0 / 3 = 100.0 · 1 * 100.0 / 2 = 50.0 · 1 * 100.0 / 3 = 33.333… → ROUND → 33.33. With integer math the last one would print 33 — the .0 earns its place.",
      "ORDER BY apply_month, card_name: (2024-01, Quartz, 40.0), (2024-01, Sapphire, 75.0), (2024-02, Sapphire, 100.0), (2024-03, Quartz, 33.33), (2024-03, Sapphire, 50.0) — Quartz is absent from 2024-02 because no group exists.",
    ],
    time: "O(n) — one scan, one hash aggregate over (month, card)",
    space: "O(g) — one row per (month, card) group present in the data",
    followUps: [
      "Show each card's OVERALL approval rate next to its monthly rows — how do you mix group grain and global grain in one result (window SUM or a joined totals CTE)?",
      "A report wants every card-month present, with NULL for months with no applications — sketch the calendar-dimension LEFT JOIN and what COUNT(*) vs COUNT(x) becomes.",
    ],
    related: ["ratings-histogram", "percentage-of-users-attended-a-contest", "daily-leads-and-partners"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "ads-funnel",
    statement:
      "A shopping site logs events: every product view, add-to-cart and purchase lands in events with the user_id, product_id, action ('view', 'cart' or 'purchase') and event_time. For each product, measure two funnel conversions on DISTINCT users: view_to_cart = users who carted ÷ users who viewed, and cart_to_purchase = users who purchased ÷ users who carted, both × 100 and rounded to 2 decimals. Each ratio divides by its own stage's user set. Products with zero views are excluded. Report product_id, view_to_cart and cart_to_purchase, ordered by product_id.",
    examples: [
      {
        input: "product 1: users 10, 11, 12 viewed; users 10, 11 carted; user 10 purchased",
        output: "1 · 66.67 · 50.0",
        explanation: "Distinct users per stage: 3 viewers, 2 carters, 1 buyer. view_to_cart = 2 * 100.0 / 3 = 66.67; cart_to_purchase = 1 * 100.0 / 2 = 50.0.",
      },
      {
        input: "product 3: user 11 viewed and carted; user 14 carted and purchased without ever viewing",
        output: "3 · 200.0 · 50.0",
        explanation: "The cart set isn't a subset of the viewers: 2 cart-users ÷ 1 view-user = 200.0. Per-stage sets are the spec's choice — intersecting stages would need user-level CTEs.",
      },
    ],
    constraints: [
      "rates are measured on DISTINCT users per stage — a user with five views is one viewer",
      "each ratio divides by its own stage's user set (view_to_cart = cart-users ÷ view-users, cart_to_purchase = purchase-users ÷ cart-users)",
      "output columns: product_id, view_to_cart, cart_to_purchase — ordered by product_id; products with zero views are excluded",
    ],
    breakdown: [
      "The one-scan funnel is conditional aggregation: COUNT(DISTINCT CASE WHEN action = 'cart' THEN user_id END) counts the DISTINCT users who carted, in the same GROUP BY product_id pass that counts viewers and buyers. The mechanics make it work: the CASE returns user_id only on matching rows and NULL everywhere else, COUNT ignores NULLs, and DISTINCT collapses a user's repeat actions to one. Three stage counts, one scan, zero joins — the classic alternative (one CTE per stage, joined) is easier to read slowly and identical in result.",
      "Each ratio uses its OWN stage's user set, and that is a decision worth defending. Real event streams are lossy — carts arrive from ad deep-links and session restores — so the cart set is NOT a subset of the view set: user 14 carts and buys product 3 without ever viewing it, pushing view_to_cart to 2 cart-users over 1 view-user = 200.0. The spec chooses per-stage sets because each ratio then answers 'how does this stage convert relative to that stage's audience', consistently per stage. A strict funnel (users who viewed AND carted) is a different question — it needs user-level CTEs intersecting the sets, and it can never exceed 100.",
      "Zero and NULL behave differently, and the difference is the guard rail. COUNT over zero matching rows returns 0 — not NULL — so a product with no carts reads carters = 0. But division by zero in SQLite is not an error: x / 0 yields NULL silently, which is why product 6 (viewed, never carted) shows cart_to_purchase = NULL, and why product 4 (never viewed) must be dropped by WHERE viewers > 0 rather than left to print NULL ratios. COALESCE(ratio, 0.0) is available, but it is a reporting policy, not a fix — a fabricated 0 claims 'nobody converted' when the truth is 'not measurable'.",
    ],
    edges: [
      "COUNT(DISTINCT CASE WHEN action = 'cart' THEN user_id END) is 0 — not NULL — when nothing matches; the CASE hands back NULLs and COUNT skips them.",
      "Per-stage sets can exceed 100: user 14 carts product 3 without viewing it, so view_to_cart = 2 * 100.0 / 1 = 200.0 — a strict funnel would report 100.0 for a different question.",
      "Division by zero is silent in SQLite: product 6's cart_to_purchase is NULL (0 buyers ÷ 0 carters) — choose between NULL and COALESCE(…, 0.0) deliberately.",
      "WHERE viewers > 0 excludes zero-view products (product 4) — without it they surface as NULL-ratio rows instead of disappearing.",
    ],
    ladder: [
      { title: "Brute force — three queries per product", body: "For each product_id, COUNT(DISTINCT user_id) filtered to 'view', then to 'cart', then to 'purchase' — 3N queries for N products, with N itself unknown until you scan." },
      { title: "The pattern — one CTE per stage", body: "views / carts / purchases CTEs each GROUP BY product_id counting distinct users; LEFT JOIN from views so zero-view products fall out; compute the two ratios." },
      { title: "The optimal idea — conditional aggregation, one scan", body: "COUNT(DISTINCT CASE WHEN action = … THEN user_id END) three times in a single GROUP BY product_id; WHERE viewers > 0; O(n), no joins to fan out or drop." },
    ],
    approach: "One GROUP BY product_id with COUNT(DISTINCT CASE …) per stage; WHERE viewers > 0; two REAL ratios",
    schema: {
      ddl: `CREATE TABLE events (
  event_id   INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  action     TEXT NOT NULL CHECK (action IN ('view', 'cart', 'purchase')),
  event_time TEXT NOT NULL
);`,
      seed: `INSERT INTO events (event_id, user_id, product_id, action, event_time) VALUES
  (1,10,1,'view','2024-05-01 09:00:00'),
  (2,10,1,'cart','2024-05-01 09:05:00'),
  (3,10,1,'purchase','2024-05-01 09:10:00'),
  (4,11,1,'view','2024-05-01 10:00:00'),
  (5,11,1,'cart','2024-05-01 10:02:00'),
  (6,12,1,'view','2024-05-01 11:00:00'),
  (7,10,2,'view','2024-05-02 09:00:00'),
  (8,10,2,'cart','2024-05-02 09:03:00'),
  (9,10,2,'purchase','2024-05-02 09:08:00'),
  (10,13,2,'view','2024-05-02 10:00:00'),
  (11,11,3,'view','2024-05-03 09:00:00'),
  (12,11,3,'cart','2024-05-03 09:01:00'),
  (13,14,3,'cart','2024-05-03 10:00:00'),
  (14,14,3,'purchase','2024-05-03 10:05:00'),
  (15,12,4,'cart','2024-05-04 09:00:00'),
  (16,12,4,'purchase','2024-05-04 09:06:00'),
  (17,11,5,'view','2024-05-05 09:00:00'),
  (18,12,5,'view','2024-05-05 09:30:00'),
  (19,12,5,'cart','2024-05-05 09:35:00'),
  (20,13,5,'view','2024-05-05 10:00:00'),
  (21,13,5,'cart','2024-05-05 10:04:00'),
  (22,12,5,'purchase','2024-05-05 11:00:00'),
  (23,13,5,'purchase','2024-05-05 11:30:00'),
  (24,10,6,'view','2024-05-06 09:00:00'),
  (25,11,6,'view','2024-05-06 10:00:00');`,
      tables: [
        { name: "events", note: "25 events across 6 products; user 14 carts and buys product 3 without viewing (200.0 bait), product 4 has no views (excluded), product 6 has views but no carts (NULL ratio)" },
      ],
    },
    code: `-- One-scan funnel: distinct users per stage via conditional aggregation.
WITH funnel AS (
    SELECT
        product_id,
        COUNT(DISTINCT CASE WHEN action = 'view'     THEN user_id END) AS viewers,
        COUNT(DISTINCT CASE WHEN action = 'cart'     THEN user_id END) AS carters,
        COUNT(DISTINCT CASE WHEN action = 'purchase' THEN user_id END) AS buyers
    FROM events
    GROUP BY product_id
)
SELECT
    product_id,
    ROUND(carters * 100.0 / viewers, 2) AS view_to_cart,
    ROUND(buyers * 100.0 / carters, 2)  AS cart_to_purchase
FROM funnel
WHERE viewers > 0                        -- zero-view products are excluded
ORDER BY product_id;`,
    walkthrough: [
      "funnel tallies distinct users per product: P1 = 3 viewers {10, 11, 12} / 2 carters {10, 11} / 1 buyer {10} · P2 = 2 / 1 / 1 · P3 = 1 viewer {11} / 2 carters {11, 14} / 1 buyer {14} · P4 = 0 / 1 / 1 · P5 = 3 / 2 / 2 · P6 = 2 / 0 / 0.",
      "WHERE viewers > 0 drops P4 (never viewed). Ratios: P1 → 66.67 then 50.0 · P2 → 50.0, 100.0 · P3 → 2 * 100.0 / 1 = 200.0 (user 14 carted without viewing) then 50.0 · P5 → 66.67, 100.0 · P6 → 0 * 100.0 / 2 = 0.0 and 0 * 100.0 / 0 = NULL.",
      "ORDER BY product_id: (1, 66.67, 50.0), (2, 50.0, 100.0), (3, 200.0, 50.0), (5, 66.67, 100.0), (6, 0.0, NULL) — P4 absent, P6's second ratio honestly NULL.",
    ],
    time: "O(n) — one scan with a hash aggregate per product",
    space: "O(p) — one row per product",
    followUps: [
      "Strict-funnel rates — users who viewed AND carted, carted AND purchased — what user-level CTEs do you need, and can any ratio exceed 100 then?",
      "Add view_to_purchase: which denominator is defensible, and does it change the zero-view exclusion?",
    ],
    related: ["user-activity-for-the-past-30-days-ii", "queries-quality-and-percentage", "average-selling-price"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "spend-histogram",
    statement:
      "The payments team wants a histogram of customer spend. transactions logs one row per purchase with user_id and spend. Bucket every user by their TOTAL spend across all their transactions: '0-49' for totals under 50, '50-99' for 50 up to (not including) 100, '100-149' for 100 up to 150, and '150+' for 150 and above — a total of exactly 50.00 belongs to '50-99'. Report bucket, the number of users in it, and cumulative_users — the running total of users over buckets ordered cheapest-first — with the rows ordered by the bucket's lower bound.",
    examples: [
      {
        input: "user 102's transactions: 30.00 and 20.00 → total 50.00; user 104's: 49.99 and 50.00 → total 99.99",
        output: "102 → '50-99' · 104 → '50-99'",
        explanation: "50.00 is not < 50, so it belongs UP into '50-99'; 99.99 just clears the same bucket's upper seam at 100.",
      },
      {
        input: "bucket counts come out 2, 4, 2, 2 walking from '0-49' to '150+'",
        output: "0-49 · 2 · 2 / 50-99 · 4 · 6 / 100-149 · 2 · 8 / 150+ · 2 · 10",
        explanation: "cumulative_users is the running sum over the numeric bounds — 10 users total. Sorting the labels alphabetically would start the report at '100-149'.",
      },
    ],
    constraints: [
      "buckets are on each user's TOTAL spend across all their transactions, not per transaction",
      "edges belong UP: '0-49' is total < 50, '50-99' is 50 ≤ total < 100, '100-149' is 100 ≤ total < 150, '150+' is total ≥ 150",
      "output columns: bucket, users, cumulative_users — ordered by the bucket's lower bound (0, 50, 100, 150), not alphabetically",
    ],
    breakdown: [
      "Two grain changes, two layers — SQL's clause order leaves no choice. The bucket depends on SUM(spend) per user, but an aggregate can't be classified in the same SELECT that computes it: rows are classified before GROUP BY's output exists, so the per-user totals must materialize first (totals CTE), and only then can a CASE turn each total into a bucket. The third layer (counts) re-groups the classified rows to COUNT(*) per bucket. Trying to skip a layer is the classic syntax error — HAVING filters groups, it doesn't re-classify rows.",
      "Write the CASE ladder with strict upper bounds in ascending order: total < 50, then < 100, then < 150, ELSE 150+. Each branch reads as 'everything not caught above', which is why exactly-50.00 lands in '50-99' (the first branch is < 50, strict) and exactly-150.00 falls to ELSE. Writing <= in the first branch would strand every boundary user one bucket low — with 50.00 and 150.00 users seeded here, the bug is visible immediately. And keep a numeric lower_bound alongside the label: the label is display, the number is the sort key.",
      "The running total is a window over an aggregate — the aggregate-of-aggregates shape with a window instead of a MAX. The counts CTE is already at bucket grain; SUM(users) OVER (ORDER BY lower_bound) in the layer above adds the cumulative without another GROUP BY, because window functions run after aggregation. With ORDER BY, the default frame is RANGE from UNBOUNDED PRECEDING to CURRENT ROW: peers sharing a sort key would be summed together — harmless here since each lower_bound is unique, but the reason cumulative histograms often want an explicit ROWS frame. The sort key must be the numeric lower_bound: alphabetically, '100-149' sorts before '50-99' — the single most common way to scramble a bucket report.",
    ],
    edges: [
      "ORDER BY bucket is the trap: as TEXT, '100-149' < '150+' < '0-49' < '50-99' — sort by the CASE-derived lower_bound instead.",
      "Boundary users belong UP: 50.00 → '50-99', 150.00 → '150+'; a <= 50 first branch demotes them and shifts every cumulative figure after it.",
      "SUM(users) OVER (ORDER BY lower_bound) is a window over an AGGREGATE — users exists only after the counts CTE has grouped; the window lives one layer above its input.",
      "Default frame with ORDER BY is RANGE … CURRENT ROW: tied keys would share a cumulative value — safe here (lower_bound is unique), worth a ROWS frame when the key can repeat.",
    ],
    ladder: [
      { title: "Brute force — four counting queries", body: "One query per bucket filtering a per-user total subquery by range, then stitch cumulative totals in application code — four scans plus out-of-SQL logic that breaks the moment a bucket is added." },
      { title: "The pattern — three CTEs, three grains", body: "totals (per-user SUM) → buckets (CASE classification) → counts (GROUP BY bucket) — each grain change gets its own named layer." },
      { title: "The optimal idea — window over the aggregate", body: "SUM(users) OVER (ORDER BY lower_bound) computes the cumulative in the same SELECT that reports the counts; O(n) scans plus one small sort over bucket rows." },
    ],
    approach: "Per-user totals → CASE buckets → GROUP BY counts → SUM(users) OVER (ORDER BY lower_bound) as the running total",
    schema: {
      ddl: `CREATE TABLE transactions (
  txn_id  INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  spend   REAL NOT NULL
);`,
      seed: `INSERT INTO transactions (txn_id, user_id, spend) VALUES
  (1,101,20.00),(2,101,12.50),
  (3,102,30.00),(4,102,20.00),
  (5,103,75.25),
  (6,104,49.99),(7,104,50.00),
  (8,105,40.00),(9,105,60.00),
  (10,106,120.00),
  (11,107,70.00),(12,107,80.00),
  (13,108,110.75),(14,108,100.00),
  (15,109,10.00),
  (16,110,25.00),(17,110,40.00);`,
      tables: [
        { name: "transactions", note: "17 purchases by 10 users; user 102 totals exactly 50.00 and user 107 exactly 150.00 (boundary bait), user 104 lands at 99.99 (upper seam)" },
      ],
    },
    code: `-- Histogram of total spend per user, with a cumulative running total.
WITH totals AS (
    SELECT
        user_id,
        SUM(spend) AS total_spend
    FROM transactions
    GROUP BY user_id
),
buckets AS (
    SELECT
        CASE
            WHEN total_spend < 50  THEN 0
            WHEN total_spend < 100 THEN 50
            WHEN total_spend < 150 THEN 100
            ELSE 150
        END AS lower_bound,
        CASE
            WHEN total_spend < 50  THEN '0-49'
            WHEN total_spend < 100 THEN '50-99'
            WHEN total_spend < 150 THEN '100-149'
            ELSE '150+'
        END AS bucket
    FROM totals
),
counts AS (
    SELECT
        lower_bound,
        bucket,
        COUNT(*) AS users
    FROM buckets
    GROUP BY lower_bound, bucket
)
SELECT
    bucket,
    users,
    SUM(users) OVER (ORDER BY lower_bound) AS cumulative_users
FROM counts
ORDER BY lower_bound;                    -- numeric key, NOT the label`,
    walkthrough: [
      "totals: 101 → 32.5, 102 → 50.0, 103 → 75.25, 104 → 99.99, 105 → 100.0, 106 → 120.0, 107 → 150.0, 108 → 210.75, 109 → 10.0, 110 → 65.0.",
      "buckets classify: '0-49' = {101, 109} (2 users) · '50-99' = {102 (exactly 50.00, edge belongs up), 103, 104, 110} (4) · '100-149' = {105 (exactly 100), 106} (2) · '150+' = {107 (exactly 150), 108} (2).",
      "counts plus the running SUM over bounds 0 → 50 → 100 → 150: (0-49, 2, 2), (50-99, 4, 6), (100-149, 2, 8), (150+, 2, 10) — in numeric order; alphabetical label order would have led with '100-149'.",
    ],
    time: "O(n + b log b) — scan transactions, then a tiny sort over bucket rows for the window",
    space: "O(u) — per-user totals plus one row per bucket",
    followUps: [
      "Add cumulative_share = cumulative_users * 100.0 / (all users) — where does the grand total come from without a self-join (window SUM vs a scalar subquery)?",
      "Move the bucket edges into a buckets dimension table and join on ranges — what changes when the edges become configurable data?",
    ],
    related: ["ratings-histogram", "compressed-mode", "queries-quality-and-percentage"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "second-day-confirmation",
    statement:
      "A signup flow sends each user confirmation prompts, and confirmations logs every send with time_sent ('YYYY-MM-DD HH:MM:SS') and action — 'confirmed' when the user completed it, 'timeout' when they let it expire. Measure the second-confirmation rate: among users who have at least TWO confirmed prompts, the percentage whose second confirmation arrived within 1 day (86400 seconds) of their first, rounded to 2 decimals. A timeout is not a confirmation and must never stand in for one. Users with fewer than two confirmations count on neither side. Output one row, one column: success_rate.",
    examples: [
      {
        input: "user 202: confirmed 2024-06-02 10:00:00, TIMEOUT 2024-06-02 10:30:00, confirmed 2024-06-04 10:00:00",
        output: "202 counts as a FAILURE (gap = 2.0 days)",
        explanation: "Filtered to confirmations, first → second is 06-02 10:00 → 06-04 10:00 = 2.0 days > 1. Measuring to the timeout would fake a 30-minute success.",
      },
      {
        input: "user 203 has exactly one confirmed row",
        output: "absent — from numerator AND denominator",
        explanation: "Their rn = 1 row has a NULL LEAD; dropping NULL gaps removes them from both sides, keeping the rate a user-level 3/5 = 60.0.",
      },
    ],
    constraints: [
      "only action = 'confirmed' rows participate; a timeout is not a confirmation and never occupies a window slot",
      "denominator = users with ≥ 2 confirmations; success = second confirmation within 1 day (julianday gap ≤ 1.0) of the first",
      "output: one row, one column success_rate",
    ],
    breakdown: [
      "Filter to 'confirmed' BEFORE the window — this is the problem's whole personality. Window functions rank whatever rows reach them positionally: LEAD(time_sent)'s 'next' means next row in the stream, not next confirmation. Leave the timeouts in and two things break: a timeout can become someone's 'second' (user 202's gap would read 30 minutes to the 10:30 timeout instead of 2 days to the real second confirmation), and the ROW_NUMBER = 1 slot itself can be captured by a timeout (user 205's day opens with one). One WHERE inside the CTE that feeds the window fixes both, because WHERE is evaluated before the SELECT list's window expressions.",
      "The pairing is LEAD and ROW_NUMBER sharing one window spec: PARTITION BY user_id ORDER BY time_sent puts each confirmation's successor on the same row while numbering positions. Keeping rn = 1 keeps exactly the (first, second) pair per user. The subtlety is the single-confirmation user: their rn = 1 row exists, but LEAD is NULL there — no successor exists. That NULL is not noise; filtering gap_days IS NOT NULL removes one-confirmation users from BOTH sides of the fraction, which is exactly the 'at least two confirmations' denominator the spec demands (user 203 vanishes cleanly).",
      "The rate is one aggregate over the surviving pairs: SUM(CASE WHEN gap_days <= 1 THEN 1 ELSE 0 END) counts successes and COUNT(*) counts paired users — a user-level rate, not a share of raw log rows. julianday() converts ISO timestamps to REAL Julian day numbers, so subtraction yields days: 0.25 is six hours, and ≤ 1.0 means within 24 hours (multiply by 86400 if seconds feel more natural). The × 100.0 before dividing is the same integer-division trap as every rate problem, and ROUND(…, 2) finishes it. Hand-run the numbers before trusting the output: here 3 of 5 pairs succeed, 60.0 — and the unfiltered bug would have scored user 202 as a 30-minute success, reporting 80.0.",
    ],
    edges: [
      "Filter to 'confirmed' inside the CTE feeding the window: a timeout in the stream becomes someone's fake 'second confirmation' (202 → a 30-minute gap) or captures rn = 1 outright (205's opening timeout).",
      "LEAD is NULL on a partition's last row — rn = 1 with a NULL gap IS the single-confirmation user; the NULL filter is the ≥ 2-users rule in disguise (203 drops from both sides).",
      "julianday() turns 'YYYY-MM-DD HH:MM:SS' text into REAL days — 2024-06-02 10:00 → 2024-06-04 10:00 is exactly 2.0, which FAILS the ≤ 1.0 test.",
      "COUNT(*) over the paired CTE is the denominator — counting the raw table would dilute the rate with one-confirmation and timeout rows.",
    ],
    ladder: [
      { title: "Brute force — per-user two-row picks", body: "For each user, SELECT the two earliest confirmed time_sents ordered ascending, diff them in app code, then aggregate rates per user — N+1 queries, plus a hand-rolled 'second row' that silently breaks for one-row users." },
      { title: "The pattern — LEAD + ROW_NUMBER on filtered rows", body: "A confirmed CTE (WHERE action = 'confirmed') feeds a paired CTE where LEAD(time_sent) and ROW_NUMBER share PARTITION BY user_id ORDER BY time_sent; keep rn = 1 with a non-NULL gap." },
      { title: "The optimal idea — one aggregation over pairs", body: "SUM(CASE WHEN gap <= 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) over the pairs; O(n log n) for the per-user sort, no self-join, no correlated subquery." },
    ],
    approach: "Filter confirmed → LEAD/ROW_NUMBER per user → keep (first, second) pairs with real gaps → ROUND(successes * 100.0 / pairs, 2)",
    schema: {
      ddl: `CREATE TABLE confirmations (
  confirmation_id INTEGER PRIMARY KEY,
  user_id         INTEGER NOT NULL,
  time_sent       TEXT NOT NULL,
  action          TEXT NOT NULL CHECK (action IN ('confirmed', 'timeout'))
);`,
      seed: `INSERT INTO confirmations (confirmation_id, user_id, time_sent, action) VALUES
  (1,201,'2024-06-01 09:00:00','confirmed'),
  (2,201,'2024-06-01 15:00:00','confirmed'),
  (3,202,'2024-06-02 10:00:00','confirmed'),
  (4,202,'2024-06-02 10:30:00','timeout'),
  (5,202,'2024-06-04 10:00:00','confirmed'),
  (6,203,'2024-06-05 12:00:00','confirmed'),
  (7,204,'2024-06-01 08:00:00','confirmed'),
  (8,204,'2024-06-03 09:00:00','confirmed'),
  (9,205,'2024-06-10 06:00:00','timeout'),
  (10,205,'2024-06-10 07:00:00','confirmed'),
  (11,205,'2024-06-10 08:30:00','confirmed'),
  (12,206,'2024-06-12 09:00:00','confirmed'),
  (13,206,'2024-06-12 10:00:00','confirmed'),
  (14,206,'2024-06-20 09:00:00','confirmed');`,
      tables: [
        { name: "confirmations", note: "14 sends by 6 users; 202's timeout sits between two confirmations (window-slot trap), 205 opens with a timeout, 203 has a single confirmation (excluded both sides)" },
      ],
    },
    code: `-- Second-confirmation rate: % of paired users confirmed again within 1 day.
WITH confirmed AS (
    SELECT user_id, time_sent
    FROM confirmations
    WHERE action = 'confirmed'            -- timeouts never reach the window
),
paired AS (
    SELECT
        user_id,
        ROW_NUMBER() OVER (PARTITION BY user_id
                           ORDER BY time_sent) AS rn,
        julianday(LEAD(time_sent) OVER (PARTITION BY user_id
                                        ORDER BY time_sent))
          - julianday(time_sent)          AS gap_days   -- in days (REAL)
    FROM confirmed
),
first_pairs AS (
    SELECT user_id, gap_days
    FROM paired
    WHERE rn = 1
      AND gap_days IS NOT NULL            -- NULL gap = only one confirmation
)
SELECT
    ROUND(
        SUM(CASE WHEN gap_days <= 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
    ) AS success_rate
FROM first_pairs;`,
    walkthrough: [
      "confirmed keeps: 201 (06-01 09:00, 15:00) · 202 (06-02 10:00, 06-04 10:00 — the 10:30 timeout dropped) · 203 (one row) · 204 (06-01 08:00, 06-03 09:00) · 205 (06-10 07:00, 08:30 — the 06:00 opener dropped) · 206 (06-12 09:00, 10:00, 06-20 09:00).",
      "paired gives gaps: 201 → 0.25 · 202 → 2.0 · 203 → NULL · 204 → 2.041666… · 205 → 0.0625 · 206 → 0.041666…; rn = 1 with a non-NULL gap keeps {201, 202, 204, 205, 206} — 203 exits both sides.",
      "Successes = 201, 205, 206 → 3; pairs = 5; ROUND(3 * 100.0 / 5, 2) = 60.0 — the single row (success_rate = 60.0). The unfiltered bug would have counted 202's 30-minute timeout gap and printed 80.0.",
    ],
    time: "O(n log n) — one sort per user partition",
    space: "O(n) — the windowed stream plus one pair per user",
    followUps: [
      "Median first-to-second gap — SQLite has no MEDIAN; which aggregate-of-aggregates (or LIMIT-offset) trick survives?",
      "Break the rate down by calendar month of the first confirmation — where does the extra GROUP BY sit relative to the window?",
    ],
    related: ["uber-first-transaction", "user-activity-for-the-past-30-days-ii", "average-selling-price"],
    order: "any",
    xp: 20,
  },
  {
    slug: "same-day-sale",
    statement:
      "A marketplace's orders table records every completed order with order_id, user_id, role ('buyer' or 'seller') and order_date ('YYYY-MM-DD'). Find users who sold something on the calendar day of their very first order — where 'first order' means the earliest order_date across ALL of that user's rows, any role. Selling on the debut day itself counts: a user whose first-ever order was as a seller qualifies. Selling later does not. Report each qualifying user's id once, ordered by user_id.",
    examples: [
      {
        input: "301: buyer 03-01, seller 03-01, buyer 03-05 · 302: buyer 03-02, seller 03-08",
        output: "301 — and nothing for 302",
        explanation: "301 sold on their very first calendar day; 302's first sale is six days after their debut, and the date equality rejects it.",
      },
      {
        input: "304: buyer 03-04, then three seller rows dated 03-04 (plus one on 03-09)",
        output: "304 — once",
        explanation: "Three matching day-one seller rows fan the join out to three rows; DISTINCT collapses them back to one user_id.",
      },
    ],
    constraints: [
      "first day = the user's earliest order_date over ALL their rows, buyer or seller",
      "qualify = at least one role = 'seller' order dated exactly on that first day — the debut order itself being a sale counts",
      "output column: user_id, one row per user even with several same-day sales — ordered by user_id",
    ],
    breakdown: [
      "'First day' is a per-user MIN, and per-group extremes live in their own layer: the first_days CTE (MIN(order_date) GROUP BY user_id) computes each user's debut at user grain, then the outer query drops back to row grain to test what happened ON that day. MIN on 'YYYY-MM-DD' text is chronological because the format is fixed-width — lexicographic and calendar order agree, no CAST needed. This summarize-then-join-back shape is the workhorse behind every 'first X' question: aggregate to find the key, re-join to inspect the rows at that key.",
      "The same-day self-match is a join of orders against first_days ON user_id + order_date = first_day + role = 'seller' — literally asking 'does a seller row exist on this user's debut date?'. Nothing forbids the matching seller row from being the debut row itself: user 303's first order IS a sale, and the join happily matches that one row against its own user's first_day. That is the spec's semantics — a seller order EXISTS on the first calendar day — not 'bought first, then sold'. The equality pins the window to one calendar day: user 302's first sale on 03-08, six days after their 03-02 debut, matches nothing.",
      "DISTINCT is grain repair, not decoration. The join is one-to-many: every seller row on the debut date emits another output row, so user 304 — who sold three items on day one — arrives three times (and their 03-09 sale, irrelevant, matches nothing). The question asks for USERS, so the grain must be forced back with DISTINCT (or by switching the join to EXISTS, a semi-join that probes for one match and stops — no fan-out to repair). Whenever a join multiplies rows, name the grain the answer needs and dedupe deliberately; duplicates that happen to collapse are luck, not logic.",
    ],
    edges: [
      "DISTINCT is mandatory: every first-day seller row fans the join out — user 304's three day-one sales would print three times without it.",
      "A user whose debut IS a sale qualifies (303, 305) — the predicate is 'a seller row exists on the first day', not 'bought then sold'.",
      "A later first sale fails the date equality (302: sells 2024-03-08, debut 2024-03-02) — 'eventually a seller' is a different problem.",
      "MIN(order_date) on fixed-width 'YYYY-MM-DD' text sorts chronologically — don't CAST or SUBSTR it into a slower equivalent.",
    ],
    ladder: [
      { title: "Brute force — two queries per user", body: "For each user, query MIN(order_date), then query for seller rows on that date — 2N round trips, and users with no sales need a hand-coded 'not found' path." },
      { title: "The pattern — first-day CTE + same-day join", body: "MIN per user in a CTE; join orders ON user_id AND order_date = first_day AND role = 'seller'; DISTINCT back to user grain." },
      { title: "The optimal idea — semi-join either way", body: "Join + DISTINCT pays a dedupe per multi-sale user; EXISTS probes for the first match and stops — no fan-out, no DISTINCT. Prefer EXISTS for 'at least one', keep the join when you must count or aggregate the matches." },
    ],
    approach: "MIN(order_date) per user → join orders on user + first day + role='seller' → DISTINCT user_id",
    schema: {
      ddl: `CREATE TABLE orders (
  order_id   INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('buyer', 'seller')),
  order_date TEXT NOT NULL
);`,
      seed: `INSERT INTO orders (order_id, user_id, role, order_date) VALUES
  (1,301,'buyer','2024-03-01'),
  (2,301,'seller','2024-03-01'),
  (3,301,'buyer','2024-03-05'),
  (4,302,'buyer','2024-03-02'),
  (5,302,'seller','2024-03-08'),
  (6,303,'seller','2024-03-01'),
  (7,303,'buyer','2024-03-03'),
  (8,304,'buyer','2024-03-04'),
  (9,304,'seller','2024-03-04'),
  (10,304,'seller','2024-03-04'),
  (11,304,'seller','2024-03-04'),
  (12,304,'seller','2024-03-09'),
  (13,305,'seller','2024-03-06'),
  (14,305,'seller','2024-03-11'),
  (15,306,'buyer','2024-03-02'),
  (16,306,'buyer','2024-03-07');`,
      tables: [
        { name: "orders", note: "16 orders by 6 users; 304 sold three items on debut day 2024-03-04 (fan-out bait), 302's first sale is six days late, 303 and 305 debuted AS sellers" },
      ],
    },
    code: `-- Users who sold on the calendar day of their very first order.
WITH first_days AS (
    SELECT
        user_id,
        MIN(order_date) AS first_day     -- debut date, any role
    FROM orders
    GROUP BY user_id
)
SELECT DISTINCT                          -- day-one fan-out: one row per user
    f.user_id AS user_id
FROM first_days f
JOIN orders o
  ON o.user_id    = f.user_id
 AND o.order_date = f.first_day          -- the calendar-day pin
 AND o.role       = 'seller'             -- selling on that day
ORDER BY user_id;`,
    walkthrough: [
      "first_days: 301 → 2024-03-01, 302 → 2024-03-02, 303 → 2024-03-01, 304 → 2024-03-04, 305 → 2024-03-06, 306 → 2024-03-02.",
      "The same-day seller probe: 301 has seller 03-01 ✓ · 302's only sale is 03-08 ✗ · 303's debut IS a sale ✓ · 304 has three seller rows on 03-04 ✓ (the 03-09 sale matches nothing) · 305's debut is a sale ✓ · 306 never sells ✗.",
      "The join emits 1 + 1 + 3 + 1 = 6 rows; DISTINCT folds 304's three into one; ORDER BY user_id → 301, 303, 304, 305.",
    ],
    time: "O(n log n) — one grouping pass plus a join probe per user-day",
    space: "O(u) — one first-day row per user",
    followUps: [
      "Users who BOTH bought and sold on their debut day — why does one EXISTS stop being enough, and how do you intersect two role sets?",
      "Each user's first SELLING day (MIN over seller rows only) — which users have none, and what does a LEFT JOIN to it preserve?",
    ],
    related: ["uber-first-transaction", "linkedin-power-creators", "user-activity-for-the-past-30-days-ii"],
    order: "exact",
    xp: 20,
  },
];
