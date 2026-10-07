// Deep-dives — the SQL 50+ expansion, batch 4: engagement & reporting
// (5 problems: daily activity windows, report→removal funnels, CTR ratio
// reports, row-vs-group averages, argmax with tiebreakers). SQLite dialect,
// one statement each, engine-verified against the per-problem seed.
import type { LcSqlDive } from "../types";

export const SQL_MORE3_ENGAGEMENT: LcSqlDive[] = [
  {
    slug: "user-activity-for-the-past-30-days-i",
    statement:
      "The Activity table logs one row per user session: who did what, between startDate and endDate. For each calendar day that has at least one session starting inside the 30-day window ending 2019-07-27 (the window starts 2019-06-28), report the day, the number of distinct users active on it, and the number of sessions run on it — a user can run two sessions on the same day. Order the report by day.",
    examples: [
      {
        input: "Annabelle: sessions starting 2019-06-28, 2019-07-05 and 2019-07-27 (this one ends 2019-07-29) · Sally: two sessions starting 2019-07-05 · Khaled: 2019-06-27 → 2019-06-29 · Jonathan: 2019-08-01",
        output: "2019-06-28 · 1 · 1 / 2019-07-05 · 2 · 3 / 2019-07-27 · 1 · 1",
        explanation: "Khaled's session starts one day before the window and is excluded even though it ends inside it; Annabelle's 27th session counts on the 27th although it ends after the window; on 07-05 Sally's two sessions make 3 sessions but only 2 distinct users.",
      },
    ],
    constraints: [
      "the window is startDate in [2019-06-28, 2019-07-27], inclusive on both ends; endDate never filters",
      "one Activity row is one session; a user may run several sessions on the same day",
      "output columns: day, active_users, total_sessions — one row per day that has at least one in-window session, ascending by day",
    ],
    breakdown: [
      "The report's grain is the calendar day, and the day a session belongs to is its START date: a session begins on the day it starts, while endDate is only bookkeeping for how long it ran. That is why the window predicate filters startDate alone and the GROUP BY groups startDate — Annabelle's session starting 2019-07-27 and ending 2019-07-29 happened on the 27th and must be counted there, even though its endDate spills past the window. Filtering on any other date (or on both) quietly moves sessions to the wrong days or drops them.",
      "The window arithmetic is the boundary trap: 30 days ending 2019-07-27 inclusive means startDate in [2019-06-28, 2019-07-27], closed on both ends — BETWEEN is exactly right for pure dates with no time component. Khaled's session starts 2019-06-27, one day before the window, even though it ENDS inside it; a filter phrased as 'the session overlaps the window' (endDate >= 2019-06-28) would wrongly admit him. The half-open habit from interval reports — [start, end+1) — is the same window written differently, and mixing the two conventions is how one-day errors creep in; here the statement pins both ends explicitly.",
      "The two counts answer different questions and only coincide when no user repeats within a day. On 2019-07-05, Annabelle runs one session and Sally runs two: COUNT(*) tallies all 3 SESSIONS, while COUNT(DISTINCT username) collapses Sally's repeat to report 2 USERS — the statement counts a user once per day no matter how many sessions they ran. Days with no session produce no group at all, so they are absent from the report rather than printed as zeros.",
    ],
    edges: [
      "endDate never filters: Annabelle's 2019-07-27 session runs to the 29th and still counts on the 27th — the day grain is the start date.",
      "Khaled's session starts 2019-06-27 and ends inside the window — an overlaps-window predicate (endDate >= '2019-06-28') would wrongly include him.",
      "2019-07-05: COUNT(DISTINCT username) = 2 but COUNT(*) = 3 — Sally's same-day repeat is exactly where the two counts diverge.",
      "The window is closed on both ends: BETWEEN '2019-06-28' AND '2019-07-27' includes sessions starting on either boundary day.",
    ],
    ladder: [
      { title: "Brute force — bucket in application code", body: "Pull every session, bucket rows by startDate in the application, build a per-day set of usernames plus a per-day counter, and sort the days yourself. The database already ships GROUP BY and COUNT(DISTINCT …) for exactly this." },
      { title: "The pattern — filter, group, count twice", body: "WHERE startDate BETWEEN the window ends → GROUP BY startDate → COUNT(DISTINCT username) beside COUNT(*). One statement, one scan, both questions answered per group." },
      { title: "The optimal idea — let the aggregates disagree", body: "The counts only diverge on repeat users — keeping DISTINCT on the user count and plain * on the session count is what encodes 'users once, sessions always'. O(n) over the log plus per-group distinct sets." },
    ],
    approach: "Window filter on startDate → GROUP BY day → COUNT(DISTINCT username) beside COUNT(*)",
    schema: {
      ddl: `CREATE TABLE Activity (
  username   TEXT NOT NULL,
  activity   TEXT NOT NULL,
  startDate  TEXT NOT NULL,
  endDate    TEXT NOT NULL
);`,
      seed: `INSERT INTO Activity (username, activity, startDate, endDate) VALUES
  ('Annabelle','Browsing','2019-06-28','2019-06-28'),
  ('Annabelle','Messaging','2019-07-05','2019-07-05'),
  ('Annabelle','Browsing','2019-07-27','2019-07-29'),
  ('Sally','Browsing','2019-07-05','2019-07-05'),
  ('Sally','Messaging','2019-07-05','2019-07-07'),
  ('Khaled','Browsing','2019-06-27','2019-06-29'),
  ('Jonathan','Browsing','2019-08-01','2019-08-01');`,
      tables: [{ name: "Activity", note: "7 sessions; 5 start inside the window — Sally doubles up on 2019-07-05, Khaled's session ends inside the window but starts 2019-06-27" }],
    },
    code: `SELECT
    startDate AS day,
    COUNT(DISTINCT username) AS active_users,   -- Sally's same-day repeat collapses to one user
    COUNT(*)                 AS total_sessions  -- every session tallies, repeats included
FROM Activity
WHERE startDate BETWEEN '2019-06-28' AND '2019-07-27'  -- closed both ends; startDate only, never endDate
GROUP BY startDate
ORDER BY day;`,
    walkthrough: [
      "The WHERE keeps the 5 sessions starting in [2019-06-28, 2019-07-27]: all three of Annabelle's (including the 07-27 one whose endDate spills to the 29th) plus Sally's two 07-05 rows; Khaled (starts 06-27) and Jonathan (08-01) are gone.",
      "GROUP BY startDate forms three groups: 06-28 {Annabelle}, 07-05 {Annabelle, Sally, Sally}, 07-27 {Annabelle}.",
      "Per group: 06-28 → 1 user, 1 session; 07-05 → 2 distinct users (Sally's repeat collapses) but 3 sessions; 07-27 → 1 user, 1 session — printed ascending by day.",
    ],
    time: "O(n) — one filtered scan plus per-group distinct sets",
    space: "O(d × u) — the distinct-username sets behind the d reported days",
    followUps: [
      "Report all 30 days including zero-activity ones — what does the calendar-dimension CTE need to look like for the LEFT JOIN to keep empty days?",
      "Split active users by activity type (browsing vs messaging) — which key changes in the GROUP BY, and does COUNT(DISTINCT) survive it?",
    ],
    related: ["user-activity-for-the-past-30-days-ii", "movie-rating", "active-users"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "reported-posts-ii",
    statement:
      "Actions logs one row per user action on a post — views, likes and reports — and Removal logs the posts that were eventually taken down, one row each. For every day that has at least one report, compute the daily removal rate: the posts reported on that day that were removed (their id appears anywhere in Removal, whatever the removal date) divided by the posts reported that day, times 100. Average those per-day rates across the days — each day counting once — and round to 2 decimals.",
    examples: [
      {
        input: "2019-07-01: posts 1 (reported twice) and 2 reported — 1 and 2 later removed · 2019-07-02: posts 3, 4, 5 reported — only 4 later removed · 2019-07-03: posts 6, 7 reported — none removed · 2019-07-04: views only",
        output: "44.44",
        explanation: "Per-day rates: 100, 33.33, 0 → average 44.44. The views-only day sits out, and pooling 3 removed of 7 reported would give 42.86 — a different report.",
      },
    ],
    constraints: [
      "a post counts as removed once its id appears in Removal, whatever the removal date",
      "each day's denominator is the DISTINCT posts reported that day; days with no reports do not enter the average",
      "output: one row, one column average_removal_rate — the per-day rates averaged and rounded to 2 decimals",
    ],
    breakdown: [
      "This report is a two-stage funnel: stage one is reporting (Actions rows with action = 'report'), stage two is removal (a post_id appearing in Removal). The denominator lives entirely in Actions — the Removal table must not touch it — while the numerator is the same population graded by membership in Removal. That asymmetry (a join for the numerator, Actions alone for the denominator) is the whole architecture: collapse Actions to one row per (day, post) first, then attach Removal to mark which of those posts were eventually taken down.",
      "Two grain traps guard the counts. Post 1 is reported by two different users on 2019-07-01 — that is ONE reported post, so the (day, post) DISTINCT must precede any counting; counting report ROWS would double the denominator and dilute the day's rate. And 2019-07-04 has views but no reports: filtering to report rows before grouping is what keeps that day out of per_day — averaging a 0% or 0/0 row for it would drag the honest average down.",
      "The averaging order is the teaching point: this problem averages the per-day RATES — (100 + 33.33 + 0) / 3 = 44.44 — not the pooled ratio of 3 removed of 7 reported = 42.86. Average-of-ratios weights each day equally no matter how many posts it contributed; ratio-of-sums lets a heavy day dominate. The statement pins the per-day-first definition, and the CTE computing one rate per day is what enforces it. The *100.0 promotion goes before the division — 1*100/3 in integer arithmetic is 0 or 33 depending on order, and ROUND(…, 2) cannot recover what integer division already truncated.",
    ],
    edges: [
      "Post 1 has two report rows on 2019-07-01 — the (day, post) DISTINCT makes it one reported post, not two.",
      "2019-07-04 logs views only: it never enters per_day, so the average covers three days, not four — a 0/0 or 0% day would corrupt it.",
      "All three removals are dated after the report days — membership in Removal decides, not the removal date.",
      "*100.0 goes before the division: 1*100/3 is integer arithmetic; ROUND(…, 2) comes last and cannot recover a truncated quotient.",
    ],
    ladder: [
      { title: "Brute force — two lists per day", body: "For each report day, query the reported posts, query the removed ones, intersect, divide, and average the rates in application code — a query per day." },
      { title: "The pattern — (day, post) grain, then grade", body: "DISTINCT (day, post) over report rows builds the denominator grain; LEFT JOIN Removal marks the removed ones; GROUP BY day yields reported and removed counts per day." },
      { title: "The optimal idea — average the per-day rates", body: "AVG(removed * 100.0 / reported) over the per-day CTE with a final ROUND(…, 2): one scan of Actions plus one probe per reported post into Removal, O(a + r)." },
    ],
    approach: "Distinct (day, post) report grain → Removal-graded per-day counts → AVG of per-day rates, ROUND 2",
    schema: {
      ddl: `CREATE TABLE Actions (
  post_id     INTEGER NOT NULL,
  user_id     INTEGER NOT NULL,
  action      TEXT NOT NULL,
  action_date TEXT NOT NULL,
  extra       TEXT
);
CREATE TABLE Removal (
  post_id     INTEGER PRIMARY KEY,
  remove_date TEXT NOT NULL
);`,
      seed: `INSERT INTO Actions (post_id, user_id, action, action_date, extra) VALUES
  (1, 11, 'view',   '2019-07-01', NULL),
  (1, 12, 'report', '2019-07-01', 'spam'),
  (1, 13, 'report', '2019-07-01', 'spam'),
  (2, 14, 'report', '2019-07-01', 'racism'),
  (3, 15, 'view',   '2019-07-02', NULL),
  (3, 16, 'report', '2019-07-02', 'spam'),
  (4, 17, 'report', '2019-07-02', 'spam'),
  (5, 18, 'report', '2019-07-02', 'racism'),
  (6, 19, 'view',   '2019-07-03', NULL),
  (6, 20, 'report', '2019-07-03', 'spam'),
  (7, 21, 'report', '2019-07-03', 'spam'),
  (4, 17, 'like',   '2019-07-02', NULL),
  (8, 22, 'view',   '2019-07-04', NULL),
  (9, 23, 'view',   '2019-07-04', NULL);
INSERT INTO Removal (post_id, remove_date) VALUES
  (1, '2019-07-10'),
  (2, '2019-07-11'),
  (4, '2019-07-15');`,
      tables: [
        { name: "Actions", note: "14 rows over 4 days — 8 report rows; post 1 is reported twice on 07-01; 07-04 logs views only (no reports)" },
        { name: "Removal", note: "3 removals, all dated after the report days — membership, not timing, grades the numerator" },
      ],
    },
    code: `WITH reported AS (                    -- stage 1: the (day, post) report grain
    SELECT DISTINCT action_date AS day, post_id
    FROM Actions
    WHERE action = 'report'
),
per_day AS (                          -- stage 2: grade each reported post by Removal
    SELECT
        rp.day,
        COUNT(*)         AS reported,  -- denominator: every (day, post) pair
        COUNT(r.post_id) AS removed    -- numerator: NULL-extended rows don't count
    FROM reported rp
    LEFT JOIN Removal r ON r.post_id = rp.post_id
    GROUP BY rp.day
)
SELECT
    ROUND(AVG(removed * 100.0 / reported), 2) AS average_removal_rate  -- *100.0 before the division
FROM per_day;`,
    walkthrough: [
      "The reported CTE collapses Actions to distinct (day, post) pairs over report rows: 07-01 → {post 1 (twice reported), post 2}, 07-02 → {3, 4, 5}, 07-03 → {6, 7}; 07-04's views never qualify, so it forms no pair.",
      "LEFT JOIN Removal grades each pair: posts 1, 2 and 4 match (removed 2019-07-10, 07-11, 07-15 — all after the fact, membership is enough); posts 3, 5, 6, 7 stay NULL. Per-day counts: (reported 2, removed 2), (3, 1), (2, 0) → rates 100, 33.33…, 0.",
      "AVG over the three per-day rates = (100 + 33.333… + 0) / 3 = 44.444… → ROUND(…, 2) = 44.44 — one row: average_removal_rate = 44.44.",
    ],
    time: "O(a + r) — one scan of Actions, one probe per reported post into Removal",
    space: "O(d × p) — the distinct (day, post) pairs held across the CTEs",
    followUps: [
      "Report the pooled ratio instead (removed posts over reported posts) — on which seed mix do the two definitions drift furthest apart?",
      "Weight each day by its report volume — what one change to the AVG turns average-of-ratios into ratio-of-sums?",
    ],
    related: ["reported-posts", "queries-quality-and-percentage", "confirmation-rate"],
    order: "any",
    xp: 20,
  },
  {
    slug: "ads-performance",
    statement:
      "Ads holds one row per advertisement with its lifetime views and clicks. The click-through rate (CTR) of an ad is its clicks expressed as a percentage of its views, rounded to 2 decimals. Rank the ads by CTR, best first — ads with identical CTRs are ordered by ascending ad_id — and report each ad's id with its rate. An ad with zero views has no rate: leave it out of the ranking.",
    examples: [
      {
        input: "ad 3: 250 views / 50 clicks · ad 4: 250 views / 50 clicks · ad 2: 400 views / 50 clicks · ad 5: 0 views / 0 clicks",
        output: "3 · 20.0 / 4 · 20.0 / 2 · 12.5",
        explanation: "Ads 3 and 4 tie at 20.0 and print in ascending id; ad 2's 12.5 follows; ad 5 has zero views — no rate, no row.",
      },
    ],
    constraints: [
      "ctr = clicks × 100 ÷ views per ad, rounded to 2 decimals",
      "ads with zero views have no rate and are excluded from the ranking",
      "output columns: ad_id, ctr — ordered by ctr descending, ties by ascending ad_id",
    ],
    breakdown: [
      "No grouping is needed: CTR is a per-row ratio, so the query is a projection plus a filter plus a sort — all the difficulty is arithmetic discipline. The rate is clicks per HUNDRED views, so the multiplier is 100; the division must be REAL; the rounding happens last, at the display boundary. Keeping those three steps in the right order is the entire problem.",
      "The multiplication by 100.0 is the load-bearing dot: with every operand INTEGER, 50*100/400 evaluates 5000/400 = 12 — the .5 is truncated before ROUND ever sees it — while 50*100.0/400 = 12.5 survives to be rounded. The zero-views row is the second arithmetic hazard: clicks*100.0/0 is undefined, and engines disagree about what happens — SQLite quietly yields NULL, MySQL and Postgres raise an error. NULLIF(views, 0) is the portable guard that turns a zero-view division into an explicit NULL; this report excludes zero-view ads outright with WHERE views > 0 (an ad nobody saw has no rate to rank), and the guard stays in the code as a portability habit for the day the WHERE changes and the row is kept.",
      "The sort contract is ORDER BY ctr DESC, ad_id — and both keys are load-bearing. Ads 3 and 4 post identical views and clicks, so their rounded rates tie at 20.0 and the ascending ad_id is the only thing making the output deterministic. Subtler: the sort binds to the ROUNDED alias — two ads whose raw ratios are 12.014 and 12.011 both print 12.01 and tie — so ordering by the raw expression instead of the printed value can produce a different order than the contract. Sort what you print.",
    ],
    edges: [
      "50*100/400 is 12 in integer arithmetic — the *100.0 promotion must precede the division; ROUND(…, 2) formats last.",
      "Ad 5 has zero views and is dropped by WHERE views > 0; NULLIF(views, 0) stays in the projection as the portable guard (SQLite divides by zero to NULL quietly, other engines error).",
      "Ads 3 and 4 tie at 20.0 — the ORDER BY ad_id tiebreak is part of the contract, not decoration.",
      "The sort binds to the rounded alias: raw ratios that round to the same 2dp value tie, and ad_id decides.",
    ],
    ladder: [
      { title: "Brute force — compute rates in code", body: "SELECT all ads, compute clicks*100/views in the application with float division, sort by the result, and format the decimals yourself." },
      { title: "The pattern — promote, guard, round", body: "clicks * 100.0 / views inside ROUND(…, 2), per row; the zero-views case handled explicitly — drop with WHERE views > 0, or keep via NULLIF(views, 0) → NULL." },
      { title: "The optimal idea — sort the printed value", body: "ORDER BY ctr DESC, ad_id ranks the ROUNDED rate and makes ties deterministic. O(n log n) for the sort — everything else is O(n)." },
    ],
    approach: "Per-row REAL ratio with a zero-view guard → ROUND 2 → ORDER BY ctr DESC, ad_id",
    schema: {
      ddl: `CREATE TABLE Ads (
  ad_id       INTEGER PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  views       INTEGER NOT NULL,
  clicks      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Ads (ad_id, campaign_id, views, clicks) VALUES
  (1, 10, 900, 90),
  (2, 10, 400, 50),
  (3, 11, 250, 50),
  (4, 11, 250, 50),
  (5, 12, 0, 0),
  (6, 12, 1000, 115),
  (7, 13, 333, 40);`,
      tables: [{ name: "Ads", note: "7 ads — ad 5 has zero views (the drop candidate); ads 3 and 4 are an exact CTR tie" }],
    },
    code: `SELECT
    ad_id,
    ROUND(clicks * 100.0 / NULLIF(views, 0), 2) AS ctr  -- *100.0 first; NULLIF = portable x/0 guard
FROM Ads
WHERE views > 0               -- zero-view ads have no rate to rank (the guard above stays as a habit)
ORDER BY ctr DESC, ad_id;     -- ties (ads 3 & 4) break by ascending id`,
    walkthrough: [
      "WHERE views > 0 drops ad 5 (0 views); six ads survive.",
      "Ratios with *100.0 before the division: ad 3 → 50×100.0/250 = 20.0; ad 4 → 20.0; ad 2 → 50×100.0/400 = 12.5; ad 7 → 40×100.0/333 = 12.01 (12.012… rounded); ad 6 → 115×100.0/1000 = 11.5; ad 1 → 90×100.0/900 = 10.0.",
      "ORDER BY ctr DESC, ad_id: 3 and 4 tie at 20.0 and print in id order, then 2 (12.5), 7 (12.01), 6 (11.5), 1 (10.0).",
    ],
    time: "O(n log n) — the final sort by ctr",
    space: "O(n) — one output row per ranked ad",
    followUps: [
      "Keep the zero-view ad with a NULL ctr — where must NULLIF(views, 0) sit for that, and where does the NULL sort under DESC?",
      "Add campaign-level CTR alongside the per-ad rows — what does the GROUP BY shape look like, and can per-ad and per-campaign rows share one statement?",
    ],
    related: ["average-selling-price", "queries-quality-and-percentage", "immediate-food-delivery-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "active-businesses",
    statement:
      "Events records, for every business and every event type it participates in, how many occurrences it logged. A business counts as active in an event type when its occurrences EXCEED the average occurrences across all businesses for THAT event type. Report the business_id and event_type of every active pair, ordered by business_id then event_type.",
    examples: [
      {
        input: "reviews: b1 10, b2 4, b3 8, b4 2 (average 6) · ads: b1 11, b2 5, b3 2, b4 6 (average 6)",
        output: "1 ads · 1 reviews · 3 reviews",
        explanation: "b1 clears both bars; b3 clears reviews (8 > 6) but not ads (2 < 6); b4 lands exactly ON the ads average — 6 is not greater than 6, so b4-ads is out.",
      },
    ],
    constraints: [
      "active means occurrences strictly greater than the average occurrences for THAT event type, computed across all businesses",
      "the answer's unit is the (business_id, event_type) pair; a business may be active in one type and not another",
      "output columns: business_id, event_type — ordered by business_id then event_type",
    ],
    breakdown: [
      "The comparison is row-versus-its-group: every Events row must be measured against the mean of its OWN event type — a per-row value against a per-group aggregate. GROUP BY cannot express this: once rows collapse into one group row, there is no individual occurrences value left to compare — mixing an aggregate and a bare column in one SELECT needs a window or a subquery. AVG(occurrences) OVER (PARTITION BY event_type) computes the group fact while KEEPING every row: each row carries its type's average alongside its own count.",
      "The CTE wrap is structural, not style: SQL computes window functions AFTER the WHERE clause, so AVG() OVER (…) is illegal inside WHERE — the inner query stamps the averages, and the outer WHERE compares stamped value against stamped average. (Filtering on ROW_NUMBER argmaxes has the same two-layer shape.) The ladder alternative predates windows: a correlated subquery — WHERE occurrences > (SELECT AVG(occurrences) FROM Events e2 WHERE e2.event_type = e.event_type) — expresses the same math, re-scanning the row's type once per row where the window partitions once and moves on.",
      "'Exceed' is strict: business 4 logs 6 ads against an ads average of exactly 6.0 and does NOT qualify — a >= comparison would wrongly promote it, and equal-to-average rows are the standard boundary bug. The partition key is the other trap: PARTITION BY event_type, not business_id — the yardstick is the type's mean across businesses, and the correlated-subquery variant carries the same duty in its inner WHERE. The unit of the answer is the (business_id, event_type) pair: business 3 clears the reviews bar and misses the ads bar, and both verdicts are correct at once.",
    ],
    edges: [
      "Strict exceed: business 4 posts exactly the ads average (6 vs 6.0) and is not active — >= is the boundary bug.",
      "PARTITION BY event_type, not business_id: each type's mean is its own yardstick.",
      "AVG() OVER (…) cannot sit inside WHERE — windows are computed after WHERE; the CTE wrap is structural.",
      "The answer's unit is the (business, type) pair: business 3 is active in reviews and inactive in ads — both judged independently.",
    ],
    ladder: [
      { title: "Brute force — average per type, then probe", body: "One query computes each type's average; the application walks every row and compares it to its type's average. Two passes, and the logic lives outside the database." },
      { title: "The pattern — window average in a CTE", body: "AVG(occurrences) OVER (PARTITION BY event_type) stamps every row with its type's mean; the outer WHERE occurrences > type_avg filters the stamped rows." },
      { title: "The optimal idea — partition once, compare outside", body: "The window computes both partitions in one pass; the correlated-subquery alternative is identical math with a per-row re-scan. Either way the comparison is strict (>) and the output ordered by (business_id, event_type)." },
    ],
    approach: "Window AVG per event_type stamped in a CTE → outer WHERE occurrences > type_avg",
    schema: {
      ddl: `CREATE TABLE Events (
  business_id INTEGER NOT NULL,
  event_type  TEXT NOT NULL,
  occurrences INTEGER NOT NULL
);`,
      seed: `INSERT INTO Events (business_id, event_type, occurrences) VALUES
  (1, 'reviews', 10),
  (2, 'reviews', 4),
  (3, 'reviews', 8),
  (4, 'reviews', 2),
  (1, 'ads', 11),
  (2, 'ads', 5),
  (3, 'ads', 2),
  (4, 'ads', 6);`,
      tables: [{ name: "Events", note: "8 rows, 2 event types × 4 businesses — business 1 tops both types, business 3 is mixed, business 4 sits exactly on the ads average" }],
    },
    code: `WITH flagged AS (
    SELECT
        business_id,
        event_type,
        occurrences,
        AVG(occurrences) OVER (PARTITION BY event_type) AS type_avg  -- per-type mean, rows kept whole
    FROM Events
)
SELECT business_id, event_type
FROM flagged
WHERE occurrences > type_avg            -- strict exceed: equal-to-average is NOT active
ORDER BY business_id, event_type;`,
    walkthrough: [
      "The window partitions by event_type and stamps every reviews row with 6.0 — (10+4+8+2)/4 — and every ads row with 6.0 — (11+5+2+6)/4 — the same number by seed design, computed independently per partition.",
      "WHERE occurrences > type_avg keeps (1, reviews) 10 > 6, (3, reviews) 8 > 6 and (1, ads) 11 > 6 — and rejects (4, ads) because 6 > 6.0 is false, plus every below-average row.",
      "ORDER BY business_id, event_type prints (1, 'ads'), (1, 'reviews'), (3, 'reviews').",
    ],
    time: "O(n log n) — the window's per-partition sort plus the final ordering",
    space: "O(n) — the stamped CTE holding one average per row",
    followUps: [
      "Return every (business, type) pair with its type average and an active flag — which SELECT list change turns the filter into a report?",
      "Rank businesses within each event type by occurrences — how does RANK() OVER (PARTITION BY …) compose with the average you already compute?",
    ],
    related: ["find-the-team-size", "project-employees-iii", "average-selling-price"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "highest-grade-for-each-student",
    statement:
      "Enrollments lists one row per student per course with the grade they earned. For each student, report the course in which they scored their highest grade — and if several courses share that top grade, report the one with the smallest course_id. Every student appears exactly once, ordered by student_id.",
    examples: [
      {
        input: "student 1: course 7 → 85, course 12 → 91 · student 2: course 3 → 78, course 9 → 78, course 5 → 61 · student 3: course 4 → 66",
        output: "1 · 12 · 91 / 2 · 3 · 78 / 3 · 4 · 66",
        explanation: "Student 1's best is 91 on course 12; student 2's top grade 78 is tied on courses 3 and 9 and the smaller id wins; student 3 has a single row.",
      },
    ],
    constraints: [
      "one row per student: the highest grade, or on a tie the smallest course_id holding it",
      "every student in Enrollments appears exactly once, including single-course students",
      "output columns: student_id, course_id, grade — ordered by student_id",
    ],
    breakdown: [
      "The report is an argmax: per student, the maximum grade AND the course it was earned on — the identity of the winning row, not just the winning value. GROUP BY student_id with MAX(grade) returns the number but strands the course: a bare GROUP BY cannot tell WHICH course_id the maximum belongs to (SQLite's bare-column rule would hand back some arbitrary row's course). The window form keeps every row, sorts each student's rows, and lets rank 1 name the winner.",
      "The tie policy is written INTO the window order: RANK() OVER (PARTITION BY student_id ORDER BY grade DESC, course_id ASC). Under that composite key, student 2's two 78s are not peers — course 3 sorts ahead of course 9 — so exactly one row per partition holds rank 1, and the WHERE rnk = 1 filter (outside the CTE: window results cannot appear in WHERE) is deterministic. Drop course_id from the order and RANK() = 1 instead keeps every course tied at the top — the right tool for a 'report all top rows' variant, and the reason RANK (peers share a rank) rather than ROW_NUMBER is the honest choice to name here.",
      "The pre-window alternative is the correlated MAX join: keep the rows whose grade equals their student's MAX(grade). It re-admits ALL top-grade ties — the grain pops back to one row per tied course — so the smallest-course-id rule must be re-implemented with GROUP BY student_id and MIN(course_id): two aggregation passes where one window sort does the work. Note too how the seed is shaped: grades and course ids are uncorrelated (student 1's best 91 sits on his larger course id, 12, with 85 on course 7) — any shortcut that sorts or scans by course_id first reads the answer backwards.",
    ],
    edges: [
      "Student 2's exact tie (78 on courses 3 and 9): the composite window order breaks it — without course_id ASC the pick is engine-arbitrary.",
      "Under ORDER BY grade DESC, course_id ASC the two 78s are NOT peers: one rank-1 row. With a grade-only order, RANK() = 1 keeps BOTH tied courses.",
      "Student 1's best grade sits on his larger course id (91 on course 12, 85 on course 7) — grades and course ids are uncorrelated.",
      "WHERE rnk = 1 lives outside the CTE — a window column cannot be referenced in the same query level's WHERE.",
    ],
    ladder: [
      { title: "Brute force — top row per student in code", body: "GROUP BY student_id for MAX(grade), then a second query per student to find which course held it — N+1 queries, or a fragile bet on bare columns." },
      { title: "The pattern — rank the partition", body: "RANK() OVER (PARTITION BY student_id ORDER BY grade DESC, course_id ASC) writes the tie policy into the sort; rnk = 1 outside the CTE lifts the winners." },
      { title: "The optimal idea — argmax as a sort contract", body: "One sort per partition replaces the MAX probe plus MIN(course_id) repair of the correlated-join alternative. O(n log n) total, deterministic ties, one row per student." },
    ],
    approach: "RANK() with the tie policy in the window order → rnk = 1 outside the CTE",
    schema: {
      ddl: `CREATE TABLE Enrollments (
  student_id INTEGER NOT NULL,
  course_id  INTEGER NOT NULL,
  grade      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Enrollments (student_id, course_id, grade) VALUES
  (1, 12, 91),
  (1, 7, 85),
  (2, 3, 78),
  (2, 9, 78),
  (2, 5, 61),
  (3, 4, 66);`,
      tables: [{ name: "Enrollments", note: "6 rows, 3 students — student 2 ties 78 on courses 3 and 9; student 1's best grade sits on his larger course id" }],
    },
    code: `WITH ranked AS (
    SELECT
        student_id,
        course_id,
        grade,
        RANK() OVER (
            PARTITION BY student_id
            ORDER BY grade DESC, course_id ASC   -- the tie policy lives in the sort
        ) AS rnk
    FROM Enrollments
)
SELECT student_id, course_id, grade
FROM ranked
WHERE rnk = 1               -- one winner per student; ties already broken by course_id
ORDER BY student_id;`,
    walkthrough: [
      "ranked stamps each partition in (grade DESC, course_id ASC) order: student 1 → c12/91 rank 1, c7/85 rank 2; student 2 → c3/78 rank 1, c9/78 rank 2 (not peers — the course breaks the tie), c5/61 rank 3; student 3 → c4/66 rank 1.",
      "WHERE rnk = 1 keeps exactly one row per student: (1, 12, 91), (2, 3, 78), (3, 4, 66) — the tie fell to course 3 because course_id ASC was written into the window order.",
      "ORDER BY student_id prints 1, 2, 3 in that order — the contract's sort.",
    ],
    time: "O(n log n) — one sort per student partition",
    space: "O(n) — the ranked CTE",
    followUps: [
      "Report ALL courses tied at a student's top grade — which single token of the window order changes, and why does RANK() = 1 then keep both?",
      "Add the second-highest grade per student — why does DENSE_RANK (not ROW_NUMBER) matter once grades tie?",
    ],
    related: ["project-employees-iii", "movie-rating", "find-the-team-size"],
    order: "exact",
    xp: 20,
  },
];
