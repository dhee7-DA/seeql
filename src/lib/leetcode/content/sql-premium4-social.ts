// Deep-dives — LeetCode Premium batch IV, file 6 of 6: social & commerce
// reporting (Friday spend reports, viewer-to-streamer conversion, topping
// cost analysis, mutual-friend anti-join, email domain rollup). Engine-verified
// by scripts/tmp-68b6-check.ts. Re-authored from the canonical premium tasks:
// own tables, own seeds, original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM4_SOCIAL: LcSqlDive[] = [
  {
    slug: "friday-purchases-i",
    statement:
      "Purchase logs one row per completed purchase: (purchase_id, user_id, item_name, amount, purchase_date), dates stored as 'YYYY-MM-DD' text. The shop's reporting week is anchored on Friday: a week is identified by the Friday it contains, and only Friday purchases count at all. Report weekly spending per item — columns friday_date, item_name, total_spent — one row per (Friday, item) pair, where friday_date is the purchase date itself (each output row's date IS a Friday) and total_spent sums that item's amounts across that Friday. Order by friday_date ascending, then item_name ascending.",
    examples: [
      {
        input: "Kettle is bought on Friday 2024-06-07 for 10.00 and again on Friday 2024-06-14 for 12.00",
        output: "2024-06-07 · Kettle · 10.0 — 2024-06-14 · Kettle · 12.0",
        explanation:
          "The two Fridays are separate buckets, so the same item ships as two rows, never merged into one weekly blob.",
      },
      {
        input: "Mug is bought twice on Friday 2024-06-14 (4.00 and 6.00); a Bowl is bought on Saturday 2024-06-15 for 9.50",
        output: "2024-06-14 · Mug · 10.0 — and nothing at all for the Saturday Bowl",
        explanation:
          "Same-Friday purchases of one item sum into a single row; the Saturday purchase fails the Friday test and never enters a bucket.",
      },
    ],
    constraints: [
      "one row per (purchase_date, item_name) pair among FRIDAY rows; total_spent = SUM(amount) over that pair",
      "friday_date is the purchase's own date — every reported date is a Friday (strftime('%w', d) = '5' on this engine); non-Friday purchases never appear",
      "columns friday_date, item_name, total_spent — ordered by friday_date, then item_name",
    ],
    breakdown: [
      "The week identity here is the Friday itself, and that is a modeling gift. Because the report keeps only Friday rows, grouping by the raw purchase_date already yields one bucket per week — each surviving date IS the week's anchor, so no week-start arithmetic (subtracting weekday offsets, truncating to Sunday or Monday) is needed. Deriving a separate week_start column would add work and add nothing: every bucket holds exactly one distinct date. The task's phrasing — the row IS a Friday — licenses treating the date as the bucket key directly.",
      "The weekday test is where engines disagree, so pin it down. On this engine strftime('%w', d) returns the day of week as TEXT numbered 0 through 6 with Sunday at 0 — Friday is '5', and the comparison is against the one-character string, not the week-of-year %W or any other specifier. Numbering conventions vary across SQL dialects (some anchor Monday at 1, some name the day), which is exactly why the meaning of the literal is asserted in a comment beside the filter. The predicate belongs in WHERE, shrinking the input before GROUP BY ever runs, rather than in a HAVING that filters after grouping has already spent the effort.",
      "The grain is the pair, not either key alone. GROUP BY item_name would merge Kettle's two Friday rows into a single 22.0 line and erase the weekly story; GROUP BY purchase_date alone would fuse Kettle and Mug into one mystery total per Friday. Only the two-key group reproduces the requested report — one row per Friday per item, with SUM(amount) answering the same-Friday doubling of Mug. And because a Friday with no purchases cannot produce a bucket (a group forms only from rows that exist), the report needs no zero-handling: manufacturing such a row would take a calendar spine the task never asks for.",
    ],
    edges: [
      "The Saturday plant: rows (7, 106, 'Kettle', 20.00, '2024-06-08') and (8, 107, 'Bowl', 9.50, '2024-06-15') fall on Saturdays — a query that filters by month alone (or drops the weekday test) ships two extra buckets, (2024-06-08, Kettle, 20.0) and (2024-06-15, Bowl, 9.5), mislabeling Saturdays as friday_date values.",
      "The same-Friday sum: Mug's two rows on 2024-06-14 (4.00 and 6.00) must collapse to one row at 10.0 — reporting raw rows, or grouping without item_name, fails differently (three rows, or one fused 30.0 blob per Friday).",
      "The two-Friday item: Kettle appears on 2024-06-07 AND on 2024-06-14 and must stay two rows (10.0 and 12.0) — a GROUP BY item_name alone prints a single Kettle 22.0 and loses the weekly story.",
      "The impossible empty Friday: no Friday in the seed lacks purchases, and none could appear anyway — a bucket forms only from rows that exist, so a purchase-less Friday would need a manufactured calendar spine; the honest report simply has no row for it.",
    ],
    ladder: [
      { title: "Brute force — eyeball the calendar", body: "Pull every purchase row, look up each date's weekday in application code, throw away non-Fridays, then tally amounts per (date, item) pair in a map. Three manual steps the engine folds into one filtered aggregation." },
      { title: "The pattern — filter, then group", body: "WHERE keeps only rows whose weekday is Friday; GROUP BY purchase_date, item_name with SUM(amount) builds the buckets; the surviving date doubles as the report's friday_date." },
      { title: "The optimal idea — the anchor date is the bucket key", body: "O(n log n). The transferable rule: when a report's time bucket IS a row's own date, skip date-bucketing arithmetic entirely — the filter alone defines the buckets, and the raw date column is already the key." },
    ],
    approach: "WHERE strftime('%w', purchase_date) = '5' keeps Fridays, then GROUP BY purchase_date, item_name with SUM(amount) — the Friday's own date is the week bucket",
    schema: {
      ddl: `CREATE TABLE Purchase (
  purchase_id   INTEGER PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  item_name     TEXT NOT NULL,
  amount        REAL NOT NULL,
  purchase_date TEXT NOT NULL   -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Purchase (purchase_id, user_id, item_name, amount, purchase_date) VALUES
  (1, 101, 'Kettle', 10.00, '2024-06-07'),   -- Friday week 1
  (2, 102, 'Mug', 4.00, '2024-06-07'),       -- Friday week 1
  (3, 103, 'Kettle', 12.00, '2024-06-14'),   -- Kettle again, next Friday
  (4, 102, 'Mug', 4.00, '2024-06-14'),       -- same-Friday double, part 1
  (5, 104, 'Mug', 6.00, '2024-06-14'),       -- same-Friday double, part 2
  (6, 105, 'Bowl', 8.00, '2024-06-21'),      -- Friday week 3
  (7, 106, 'Kettle', 20.00, '2024-06-08'),
  (8, 107, 'Bowl', 9.50, '2024-06-15');`,
      tables: [
        { name: "Purchase", note: "8 purchases: six on three Fridays (2024-06-07, 06-14, 06-21) plus two Saturday rows planted for exclusion" },
      ],
    },
    code: `SELECT
    purchase_date AS friday_date,   -- each surviving date IS a Friday, so it IS the week bucket
    item_name,
    SUM(amount) AS total_spent
FROM Purchase
WHERE strftime('%w', purchase_date) = '5'   -- %w is 0=Sun through 6=Sat, so Friday is the TEXT '5'
GROUP BY purchase_date, item_name
ORDER BY friday_date, item_name;`,
    walkthrough: [
      "The weekday filter first: strftime('%w', …) reads '5' on 2024-06-07, 2024-06-14 and 2024-06-21 but '6' on the Saturday rows 7 and 8 — six purchase rows survive, and the two Saturday rows (Kettle 20.00, Bowl 9.50) are gone before grouping ever runs.",
      "The two-key group collapses the survivors: 2024-06-07 splits into Kettle 10.0 and Mug 4.0; 2024-06-14 splits into Kettle 12.0 and Mug 4.0 + 6.0 = 10.0; 2024-06-21 holds Bowl 8.0 alone.",
      "ORDER BY friday_date, item_name ships five rows — (2024-06-07, Kettle, 10.0), (2024-06-07, Mug, 4.0), (2024-06-14, Kettle, 12.0), (2024-06-14, Mug, 10.0), (2024-06-21, Bowl, 8.0) — with Kettle deliberately appearing twice, once per week.",
    ],
    time: "O(n log n) — one filtered scan feeding one grouped sort",
    space: "O(f × i) — one total per surviving (Friday, item) pair",
    followUps: [
      "Add each item's share of its Friday's spending beside the total — where does the per-day denominator come from (a window over the grouped rows), and how does the (Friday, item) grain survive the share computation?",
      "Re-anchor the weeks to Monday and report Mon–Sun totals for ALL purchases, not just Fridays — which rows change buckets, and what new bucket key must the query derive before grouping?",
    ],
    related: ["monthly-transactions-i", "game-play-analysis-v", "unique-orders-and-customers-per-month"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "friday-purchases-ii",
    statement:
      "The same Purchase table (purchase_id, user_id, item_name, amount, purchase_date) now powers a mix report. For each Friday, report every item's share of that day's spending: columns friday_date, item_name, total_spent (the item's summed amount that Friday) and pct_of_day — the item's total as a percentage of the Friday's item-total sum, rounded to two decimals. Fridays only: non-Friday purchases never enter a bucket. One row per (Friday, item), ordered by friday_date ascending, then total_spent descending, then item_name ascending.",
    examples: [
      {
        input: "On Friday 2024-06-07 the shop sells Umbrella for 30.00 and Anorak for 20.00 — the day's only purchases",
        output: "Umbrella · 30.0 · 60.0 — Anorak · 20.0 · 40.0",
        explanation:
          "The day's item totals sum to 50.0; 100 × 30/50 = 60.0 and 100 × 20/50 = 40.0, and the two rounded shares reconcile to exactly 100.0.",
      },
      {
        input: "On Friday 2024-06-14 Bowl, Plate and Cup sell for 10.00 each (day total 30.0); a Mug sells on Saturday 2024-06-15 for 5.00",
        output: "Bowl · 10.0 · 33.33 — Cup · 10.0 · 33.33 — Plate · 10.0 · 33.33 — the Saturday Mug is not reported",
        explanation:
          "Each exact share is 100 × 10/30 = 33.333…, and ROUND(..., 2) snaps every row to 33.33; the non-Friday purchase is filtered before grouping.",
      },
    ],
    constraints: [
      "one row per (friday_date, item_name) pair among Friday purchases; total_spent = SUM(amount) over the pair",
      "pct_of_day = ROUND(100.0 * total_spent / (that Friday's summed total_spent), 2) — the denominator spans the same Friday's item totals only, computed as a window over the grouped rows",
      "columns friday_date, item_name, total_spent, pct_of_day — ordered by friday_date, then total_spent DESC, then item_name",
    ],
    breakdown: [
      "Two grains share one query, and keeping them apart is the whole exercise. The numerator lives at the (Friday, item) grain — SUM(amount) grouped by date and item — while the denominator lives one level up, at the Friday grain. A window over the GROUPED rows is the honest bridge: the CTE collapses purchases to per-item totals, and SUM(total_spent) OVER (PARTITION BY friday_date) sums those totals back up per day without collapsing the rows. Doing both in one pass over raw purchases would put a single row's amount in the numerator where an item that sold twice that Friday deserves its whole total — the CTE is what makes numerator and denominator share a grain.",
      "The window deliberately has no ORDER BY inside it. A frame without ORDER BY spans the entire partition, so each item's denominator is its whole Friday — exactly the day total the percentage needs. The moment an ORDER BY sneaks in (say, to pre-sort for presentation), the default frame shrinks to a running sum and every denominator after the partition's first row is wrong in a quiet, plausible-looking way. If a running share is ever wanted, it should be a SECOND window beside this one, not a mutation of the denominator.",
      "ROUND is where the arithmetic gets honest about floats. Each row's exact share on the thirds Friday is 100.0 × 10.0 / 30.0 = 33.333…, and ROUND(..., 2) independently snaps each row to 33.33 — so the three published shares sum to 99.99, not 100.0. That residual is a property to state, not a bug to fix: rounding each output from its raw quotient is the only defensible order, because reconciling after rounding (bumping one row to 33.34) is a presentation policy the task did not request. The 60/40 Friday needs no such caveat — both shares are exact after rounding and reconcile to 100.0 — which is precisely why the two Fridays make the contrast visible.",
    ],
    edges: [
      "The Saturday plant: row (7, 207, 'Mug', 5.00, '2024-06-15') is not a Friday — dropping the strftime filter adds an eighth row (2024-06-15, Mug, 5.0, 100.0) that mislabels a Saturday as a friday_date; the filter must survive into the CTE.",
      "Ordering inside the day: on 2024-06-07 Umbrella (30.0) must precede Anorak (20.0) even though Anorak sorts first alphabetically — total_spent DESC outranks item_name — while the 2024-06-14 rows tie on total (all 10.0) and fall to item_name ASC: Bowl, Cup, Plate, engine-fate without the third key.",
      "The thirds Friday: each of Bowl/Cup/Plate rounds to 33.33 and the three published shares total 99.99 — rounding the day's SUM instead, or forcing reconciliation to 100.0, breaks the row-level contract; on a two-share Friday the rounded rows DO reconcile (60.0 + 40.0 = 100.0; 50/50 is the degenerate case), which is exactly the contrast the seed builds.",
      "The single-item Friday: Tray's 2024-06-21 partition holds one row, so the window denominator is its own 15.0 and pct_of_day is 100.0 — and never a division by zero, because a group exists only when rows exist.",
    ],
    ladder: [
      { title: "Brute force — two maps and a divide", body: "Build one map of per-(day, item) totals and another of per-day sums, then divide, multiply by 100 and round in application code. The window expression replaces the second map outright." },
      { title: "The pattern — grouped CTE plus a partition window", body: "A CTE groups Friday purchases to per-item day totals; the share is ROUND(100.0 * total_spent / SUM(total_spent) OVER (PARTITION BY friday_date), 2) computed beside the grouped rows." },
      { title: "The optimal idea — the denominator is a whole-partition window", body: "O(n log n). The transferable rule: a share of a group total is a window over the GROUPED grain with no frame restriction; the tie-break ordering key is part of the output contract, not decoration." },
    ],
    approach: "GROUP BY (friday_date, item_name) totals in a CTE, then ROUND(100.0 * total_spent / SUM(total_spent) OVER (PARTITION BY friday_date), 2)",
    schema: {
      ddl: `CREATE TABLE Purchase (
  purchase_id   INTEGER PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  item_name     TEXT NOT NULL,
  amount        REAL NOT NULL,
  purchase_date TEXT NOT NULL   -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Purchase (purchase_id, user_id, item_name, amount, purchase_date) VALUES
  (1, 201, 'Umbrella', 30.00, '2024-06-07'),   -- 60/40 Friday, big half
  (2, 202, 'Anorak', 20.00, '2024-06-07'),     -- 60/40 Friday, small half
  (3, 203, 'Bowl', 10.00, '2024-06-14'),       -- thirds Friday
  (4, 204, 'Plate', 10.00, '2024-06-14'),      -- thirds Friday
  (5, 205, 'Cup', 10.00, '2024-06-14'),        -- thirds Friday
  (6, 206, 'Tray', 15.00, '2024-06-21'),       -- single-item Friday
  (7, 207, 'Mug', 5.00, '2024-06-15');`,
      tables: [
        { name: "Purchase", note: "7 purchases over three Fridays plus one Saturday plant; the 06-14 Friday splits three ways at 10.00 each" },
      ],
    },
    code: `WITH friday_totals AS (
    SELECT
        purchase_date AS friday_date,
        item_name,
        SUM(amount) AS total_spent
    FROM Purchase
    WHERE strftime('%w', purchase_date) = '5'   -- Fridays only: %w is 0=Sun through 6=Sat
    GROUP BY purchase_date, item_name
)
SELECT
    friday_date,
    item_name,
    total_spent,
    ROUND(
        100.0 * total_spent / SUM(total_spent) OVER (PARTITION BY friday_date),  -- no ORDER BY: whole-day frame
        2
    ) AS pct_of_day
FROM friday_totals
ORDER BY friday_date, total_spent DESC, item_name;`,
    walkthrough: [
      "The CTE groups Friday purchases only: 2024-06-07 yields Umbrella 30.0 and Anorak 20.0; 2024-06-14 yields Bowl, Plate and Cup at 10.0 each; 2024-06-21 yields Tray 15.0 — and the Saturday Mug row (5.00) was filtered away before any grouping.",
      "The window sums each day's item totals as every row's denominator: 50.0 on 2024-06-07, 30.0 on 2024-06-14, 15.0 on 2024-06-21 — each computed inside its own partition, never across days.",
      "Division and rounding produce Umbrella 60.0 / Anorak 40.0 (reconciling to exactly 100.0), three 33.33 rows on 2024-06-14 (a published 99.99), and Tray 100.0 — ORDER BY total_spent DESC, item_name then lines up Umbrella before Anorak and Bowl, Cup, Plate inside the three-way tie.",
    ],
    time: "O(n log n) — one grouped pass plus one partitioned window pass",
    space: "O(g) — one row per (Friday, item) group",
    followUps: [
      "Rank items within each Friday (1 = biggest share) beside the percentage — what does ROW_NUMBER() OVER (PARTITION BY friday_date ORDER BY total_spent DESC, item_name) add, and why does its ORDER BY not shrink the SUM window sitting beside it?",
      "Publish the unrounded share beside the rounded one — which column moves when the seed's amounts stop being round numbers, and how would you reconcile a two-share day whose exact parts are 33.33 and 66.67 after rounding?",
    ],
    related: ["average-selling-price", "queries-quality-and-percentage", "product-sales-analysis-iii"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "viewers-turned-streamers",
    statement:
      "Session logs one row per viewing or broadcasting session: (session_id, user_id, session_type, session_start, session_end), where session_type is 'viewer' or 'streamer' and the timestamps are 'YYYY-MM-DD HH24:MI' text. A user has TURNED STREAMER if at least one of their 'streamer' sessions starts strictly after at least one of their 'viewer' sessions started. Report each turned user as columns user_id, turn_count and first_stream: turn_count counts the 'streamer' sessions that start after the user's FIRST 'viewer' session started, and first_stream is the earliest of those same sessions. Order by user_id; users who never turned do not appear at all.",
    examples: [
      {
        input: "user 301 streams at '2024-06-01 18:00' (before any watch), watches at '2024-06-03 20:00', then streams at '2024-06-05 21:00' and '2024-06-10 19:00'",
        output: "301 · 2 · 2024-06-05 21:00",
        explanation:
          "Only the two post-watch streams count; the 06-01 stream predates the first watch and stays out of both the count and the minimum.",
      },
      {
        input: "user 304 streams at '2024-06-01 18:00', watches at '2024-06-03 20:00', streams again at exactly '2024-06-03 20:00', then at '2024-06-08 22:00'",
        output: "304 · 1 · 2024-06-08 22:00",
        explanation:
          "The stream tied to the minute of the watch is not STRICTLY after it; only the 06-08 stream qualifies.",
      },
    ],
    constraints: [
      "a user turns iff at least one of their 'streamer' sessions starts strictly after at least one of their 'viewer' sessions started — equivalently, after their FIRST viewer start",
      "turn_count and first_stream are computed over the qualifying 'streamer' sessions only (start strictly after the first viewer start), never over all of a user's streams",
      "columns user_id, turn_count, first_stream — ordered by user_id; users with no qualifying stream are absent",
    ],
    breakdown: [
      "The definition collapses to a per-user threshold, and seeing the collapse is the solve. 'A streamer session starting strictly after at least one of their viewer sessions' is equivalent to 'starting strictly after their FIRST viewer session': any viewer start is greater than or equal to the first, so a stream that clears the loose test clears the strict one, and a stream that clears the strict test trivially clears the loose one. One scalar per user — MIN over their viewer starts — therefore drives the entire comparison. Every formulation that scans pairs of sessions is redoing work the minimum already did.",
      "The engine shape follows: an aggregate CTE (first viewer start per user) joined back to the streamer rows under session_start > first_viewer_start, then COUNT and MIN per user over exactly the surviving rows. The comparison must live in the JOIN (or a correlated subquery), not in a HAVING — a single GROUP BY over mixed session types cannot both filter the viewer rows feeding the minimum and the streamer rows being counted without CASE gymnastics that obscure the contract. Counting join survivors is also self-guarding: a user with no viewer rows has no CTE row, and a user whose streams all precede their first watch contributes no surviving rows, so both vanish without a single IS NULL check.",
      "The two aggregates answer different questions and must be computed over the same filtered set. Turn_count is COUNT(*) of the qualifying streamer sessions — never all of a user's streams, which would include the ones streamed before any watch. First_stream is MIN over those same qualifying rows — the earliest stream that postdates the first watch, not the earliest stream overall. Because both aggregates see only join survivors they stay consistent by construction; computing MIN in a separate unfiltered subquery is the classic way the two columns start disagreeing with each other.",
    ],
    edges: [
      "The boundary plant: user 304's streamer session (11) starts at exactly '2024-06-03 20:00' — the same minute as their first watch — and strict > excludes it; a >= comparison reports turn_count 2 and first_stream '2024-06-03 20:00' for user 304.",
      "The pre-watch streams: user 301's session (1) streamed at '2024-06-01 18:00', two days before their first watch — joining on user_id alone counts 3 streams and reports first_stream '2024-06-01 18:00' instead of (2, '2024-06-05 21:00').",
      "The no-watcher streamer: user 303 streams twice (sessions 7 and 8) but has no viewer rows at all — the first_watch CTE forms no group for them, so the inner join drops them; a LEFT JOIN without a WHERE f.first_viewer_start IS NOT NULL guard would resurrect them with turn_count 2.",
      "The direction plant: user 302 watched ('2024-06-04 20:00') AFTER streaming ('2024-06-01 18:00') — the reversed test (a viewer start strictly after a stream start) wrongly admits them, while the honest test finds no qualifying stream and leaves them absent.",
    ],
    ladder: [
      { title: "Brute force — pair scan", body: "For each user, list their watch starts and stream starts; scan every watch-by-stream pair for one stream strictly after any watch; then recount over the qualifying streams. The minimum collapses the pair scan to one comparison per stream." },
      { title: "The pattern — first-watch CTE joined back", body: "MIN(session_start) per viewer user in a CTE; join streamer rows ON user match AND session_start > first_viewer_start; COUNT and MIN per surviving user." },
      { title: "The optimal idea — collapse after-some to after-first", body: "O(n log n). The transferable rule: any-of comparisons against a set reduce to comparisons against the set's MIN (or MAX) once the direction is fixed — compute the scalar once and let the join filter carry the semantics." },
    ],
    approach: "first-watch CTE (MIN per user), join streamer sessions ON session_start > first_viewer_start, then COUNT + MIN per surviving user",
    schema: {
      ddl: `CREATE TABLE Session (
  session_id    INTEGER PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  session_type  TEXT NOT NULL,   -- 'viewer' or 'streamer'
  session_start TEXT NOT NULL,   -- 'YYYY-MM-DD HH24:MI'
  session_end   TEXT NOT NULL
);`,
      seed: `INSERT INTO Session (session_id, user_id, session_type, session_start, session_end) VALUES
  (1, 301, 'streamer', '2024-06-01 18:00', '2024-06-01 19:30'),
  (2, 301, 'viewer', '2024-06-03 20:00', '2024-06-03 21:30'),
  (3, 301, 'streamer', '2024-06-05 21:00', '2024-06-05 22:10'),
  (4, 301, 'streamer', '2024-06-10 19:00', '2024-06-10 20:45'),
  (5, 302, 'streamer', '2024-06-01 18:00', '2024-06-01 19:00'),
  (6, 302, 'viewer', '2024-06-04 20:00', '2024-06-04 21:00'),
  (7, 303, 'streamer', '2024-06-06 21:00', '2024-06-06 22:00'),
  (8, 303, 'streamer', '2024-06-07 20:00', '2024-06-07 21:15'),
  (9, 304, 'streamer', '2024-06-01 18:00', '2024-06-01 19:00'),
  (10, 304, 'viewer', '2024-06-03 20:00', '2024-06-03 20:45'),
  (11, 304, 'streamer', '2024-06-03 20:00', '2024-06-03 21:00'),
  (12, 304, 'streamer', '2024-06-08 22:00', '2024-06-08 23:00');`,
      tables: [
        { name: "Session", note: "12 sessions over 4 users: a clean turner with a pre-watch stream, a reversed-direction watcher, a streamer with no watches ever, and a boundary tie at the minute" },
      ],
    },
    code: `WITH first_watch AS (
    SELECT
        user_id,
        MIN(session_start) AS first_viewer_start   -- one threshold per watcher
    FROM Session
    WHERE session_type = 'viewer'
    GROUP BY user_id
)
SELECT
    s.user_id,
    COUNT(*) AS turn_count,                   -- qualifying streams only, never all streams
    MIN(s.session_start) AS first_stream      -- earliest of THOSE same surviving rows
FROM Session s
JOIN first_watch f
  ON f.user_id = s.user_id
 AND s.session_start > f.first_viewer_start   -- STRICTLY after the first watch: ties are not turns
WHERE s.session_type = 'streamer'
GROUP BY s.user_id
ORDER BY s.user_id;`,
    walkthrough: [
      "The CTE reduces Session to one threshold per watcher: user 301 first watched at '2024-06-03 20:00', user 302 at '2024-06-04 20:00', user 304 at '2024-06-03 20:00' — and user 303 forms no row at all, having only streamer sessions.",
      "The join keeps streamer sessions starting strictly after those thresholds: 301 contributes sessions 3 and 4 (its '2024-06-01 18:00' stream predates the watch), 304 contributes only session 12 (the '2024-06-03 20:00' stream ties its watch and fails strict >), 302's lone stream (session 5) predates its lone watch, and 303 has no threshold to meet.",
      "COUNT and MIN over the survivors ship two rows: (301, 2, '2024-06-05 21:00') and (304, 1, '2024-06-08 22:00') — users 302 and 303 are absent, and 301's count excludes the pre-watch stream.",
    ],
    time: "O(n log n) — one grouped pass for the minima, one filtered join, one grouped pass",
    space: "O(u) — one threshold per user with viewer history",
    followUps: [
      "Include every user at turn_count 0 when they never turned — which spine (a LEFT JOIN from all session users plus COALESCE) keeps the zeros, and what can first_stream possibly show for them?",
      "Report the earliest qualifying stream WITH the watch it turned after — how does the join change from the single first-watch scalar to any earlier watch, and which aggregate keeps the fan-out from double-counting?",
    ],
    related: ["game-play-analysis-iv", "user-activity-for-the-past-30-days-ii", "article-views-i"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "pizza-toppings-cost-analysis",
    statement:
      "Ingredient lists pizza toppings: (ingredient_id, ingredient_name, cost) where cost is stored as TEXT in decimal form (for example '4.00'), because prices arrive as strings from the supplier feed. Report every ingredient whose numeric cost is STRICTLY above the average numeric cost across all ingredients: columns ingredient_name, cost (the original text, untouched), monthly_cost (the cost over a 30-day month, rounded to two decimals) and extra (the 12.5% platform surcharge on that same 30-day figure, also rounded to two decimals). Order by monthly_cost descending, then ingredient_name ascending.",
    examples: [
      {
        input: "Burrata costs '5.00'; the five TEXT costs (5.50, 5.00, 4.00, 3.00 and the space-padded ' 2.50') average exactly 4.00",
        output: "Burrata · 5.00 · 150.0 · 18.75",
        explanation:
          "5.00 is strictly above the 4.00 average; thirty days at 5.00 cost 150.0, and the 12.5% surcharge adds 18.75.",
      },
      {
        input: "Olives cost exactly '4.00' — the average itself; Oregano is stored as ' 2.50' with a leading space",
        output: "(neither appears in the report)",
        explanation:
          "The boundary is strict, so the at-average row is out; the cast still parses Oregano's padded text to 2.5, below average, so it is out too.",
      },
    ],
    constraints: [
      "cost is TEXT; every numeric use must CAST(cost AS REAL) — the average, the comparison and the arithmetic all run on the parsed value",
      "only ingredients STRICTLY above the average qualify (equal-to-average is excluded); monthly_cost assumes a 30-day month; extra is 12.5% of the same 30-day figure — each rounded to 2 decimals from its own raw product",
      "columns ingredient_name, cost, monthly_cost, extra — ordered by monthly_cost DESC, then ingredient_name",
    ],
    breakdown: [
      "The costs are stored as TEXT, so every numeric use passes through CAST(cost AS REAL) — once, in a producing CTE, rather than sprinkled through the query. The cast is also where the seed's quirk is absorbed: Oregano's cost arrives as ' 2.50' with a leading space, and CAST tolerates surrounding whitespace, parsing it to 2.5 — while any string-level equality against '2.50' fails on that very row. Converting once means the average, the filter and the monthly arithmetic all see the same parsed number, and the report still echoes the original '5.50' text untouched in its output column.",
      "The boundary is designed to be exact, which is what makes 'strictly above' load-bearing. The five costs sum to exactly 20.00, so the average is exactly 4.00 — and Olives sits ON the average. A >= filter would publish Olives at monthly 120.0 and extra 15.0, silently inflating the report by one row; the honest filter is cost_num greater than the mean. Floating-point caution is part of the design: every cost here is exactly representable in binary (halves and integers), so the average computes to a clean 4.0 with no epsilon haircuts — choose messier costs and the equality test itself would need a tolerance.",
      "The two derived columns round independently, each from its own raw product. monthly_cost is ROUND(cost_num * 30, 2) for a 30-day month; extra is the 12.5% surcharge on that same 30-day spend, ROUND(cost_num * 30 * 0.125, 2). They must not be chained — computing extra as 12.5% of the ALREADY-ROUNDED monthly figure can drift from the raw-value result, and this seed's Mozzarella shows the boundary honestly: 5.50 × 30 × 0.125 = 20.625, a value binary floats represent exactly, and the engine rounds that exact tie half away from zero to 20.63. The ordering finishes the contract: monthly_cost DESC puts the priciest ingredient first, ingredient_name ASC as the deterministic tie-break.",
    ],
    edges: [
      "The equality plant: Olives ('4.00') sits exactly on the five-cost average of 4.00 — a >= filter ships a third row (Olives · 4.00 · 120.0 · 15.0) that the strict reading excludes.",
      "The text quirk: Oregano is stored as ' 2.50' with a leading space — CAST parses it to 2.5 and leaves it below average, but a string equality against '2.50' fails, and a text-ordered cost column would file it before '3.00' for the wrong reason.",
      "The exact tie in ROUND: Mozzarella's extra is 5.50 × 30 × 0.125 = 20.625 — exactly representable, so ROUND lands on 20.63 (half away from zero) rather than drifting; a chained variant taking 12.5% of the rounded 165.0 happens to agree here, but the raw-product form is the one that survives messier costs.",
      "The ordering: Mozzarella (165.0) outranks Burrata (150.0) by monthly_cost DESC — the ingredient_name ASC second key never fires on this seed but would settle any future tie deterministically.",
    ],
    ladder: [
      { title: "Brute force — pencil the average", body: "Parse each TEXT cost by hand, add the five numbers, divide by five, compare each against the mean, then multiply out the two 30-day figures for the survivors. The engine does the parse once and reuses it." },
      { title: "The pattern — cast CTE, scalar mean", body: "CAST cost to REAL in a CTE; filter cost_num against a scalar AVG over the same CTE; project the two ROUNDed columns from the parsed value." },
      { title: "The optimal idea — convert once, compare strictly, round raw", body: "O(n). The transferable rules: parse at the boundary and reuse the parsed value; an equality test against a computed mean is only trustworthy when the values are float-exact; each displayed figure rounds from its own raw expression, never from another rounded figure." },
    ],
    approach: "CAST cost to REAL once in a CTE, keep cost_num > AVG(cost_num), emit ROUND(cost_num * 30, 2) and ROUND(cost_num * 30 * 0.125, 2)",
    schema: {
      ddl: `CREATE TABLE Ingredient (
  ingredient_id   INTEGER PRIMARY KEY,
  ingredient_name TEXT NOT NULL,
  cost            TEXT NOT NULL   -- decimal stored as TEXT, e.g. '4.00'
);`,
      seed: `INSERT INTO Ingredient (ingredient_id, ingredient_name, cost) VALUES
  (1, 'Mozzarella', '5.50'),   -- above average: the exact-tie rounding row
  (2, 'Burrata', '5.00'),      -- above average
  (3, 'Olives', '4.00'),       -- exactly the average: excluded by strictness
  (4, 'Basil', '3.00'),        -- below
  (5, 'Oregano', ' 2.50');`,
      tables: [
        { name: "Ingredient", note: "5 toppings whose TEXT costs sum to exactly 20.00, pinning the average at 4.00; one cost carries a leading-space quirk" },
      ],
    },
    code: `WITH priced AS (
    SELECT
        ingredient_name,
        cost,                                  -- the original TEXT, echoed untouched
        CAST(cost AS REAL) AS cost_num         -- absorbs quirk text like ' 2.50'
    FROM Ingredient
)
SELECT
    ingredient_name,
    cost,
    ROUND(cost_num * 30, 2) AS monthly_cost,           -- a 30-day month, by convention
    ROUND(cost_num * 30 * 0.125, 2) AS extra           -- the 12.5% surcharge, rounded from its own raw product
FROM priced
WHERE cost_num > (SELECT AVG(cost_num) FROM priced)    -- STRICTLY above: equality is out
ORDER BY monthly_cost DESC, ingredient_name;`,
    walkthrough: [
      "The CTE parses five TEXT costs into 5.5, 5.0, 4.0, 3.0 and 2.5 (Oregano's space-padded ' 2.50' included) — the scalar average lands on exactly 4.0 because every value is float-exact.",
      "The strict filter keeps Mozzarella (5.5 > 4.0) and Burrata (5.0 > 4.0), and drops Olives, whose 4.0 EQUALS the average, along with Basil and Oregano below the line.",
      "The projections round each raw product independently: Mozzarella 5.5 × 30 = 165.0 with a 12.5% extra of 20.625 rounded to 20.63, Burrata 150.0 with 18.75 — two rows, ordered by monthly_cost DESC.",
    ],
    time: "O(n) — one scan to parse and average, one pass to filter and project",
    space: "O(n) — the parsed rows held in the CTE",
    followUps: [
      "Report every ingredient beside its distance from the average cost — how does a window AVG over the parsed rows replace the scalar subquery, and what does the at-average row's distance show?",
      "Re-run the report on a 31-day month — which column changes and which never (qualification depends only on the average), and how would you parameterize the month length without touching the filter?",
    ],
    related: ["product-price-at-a-given-date", "average-selling-price", "monthly-transactions-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "friends-with-no-mutual-friends",
    statement:
      "Friendship stores a social graph: (friendship_id, user1_id, user2_id), one row per friendship with user1_id < user2_id — the relation itself is undirected, so user 7 being friends with 3 is the same fact as 3 being friends with 7. Two friends have a common friend when some THIRD user is friends with both of them; the pair's own friendship does not count. Report every friend pair with ZERO common friends: columns user1_id, user2_id, ordered by user1_id ascending then user2_id ascending.",
    examples: [
      {
        input: "users 2 and 3 are friends (row 102); user 2 also befriends 1, 5 and 6, while user 3 befriends only 4",
        output: "2 · 3",
        explanation:
          "No user is adjacent to both 2 and 3 — {1, 3, 5, 6} and {2, 4} intersect in nothing — so the pair ships despite their friendship.",
      },
      {
        input: "users 2, 5 and 6 form a triangle: rows (104, 2, 5), (105, 5, 6) and (106, 2, 6)",
        output: "(none of the three pairs appears)",
        explanation:
          "Each triangle pair shares the third member as a mutual friend — 6 sees both 2 and 5, 2 sees both 5 and 6, 5 sees both 2 and 6 — and one witness excludes a pair.",
      },
    ],
    constraints: [
      "each friendship is stored once with user1_id < user2_id; adjacency is undirected and every test must traverse both orientations",
      "a common friend is a third user adjacent to BOTH endpoints — the pair's own edge never counts, and endpoints cannot witness themselves (no self-friendships exist)",
      "columns user1_id, user2_id — ordered by user1_id, then user2_id; each stored pair appears at most once",
    ],
    breakdown: [
      "Friendship stores each edge once with user1_id < user2_id, but adjacency is symmetric — user 5 is friends with user 2 through row (104), where 5 sits in the user2_id column. The undirected CTE (UNION ALL of both orientations) turns the stored table into a traversable edge list, and every neighborhood question afterwards reads against it. Building the doubled list once up front keeps the mutual test a plain two-way join; handling orientation inline with OR branches inside the test is where mirrored pairs get missed — pair (5,6)'s mutual (user 2) is adjacent to 5 only via the reversed reading of a stored row.",
      "The anti-join asks the question in its own grammar: keep a stored pair when NO third user is adjacent to both endpoints. NOT EXISTS over a correlated join — one hop from each endpoint, meeting on the same friend key — expresses 'no witness' directly and stops at the first witness for excluded pairs. The endpoints themselves can never be witnesses: a mutual m must be adjacent to both x and y, and m = x would need a self-loop, which the model forbids. That is why the pair's own friendship is not a common friend — adjacency between the pair is what makes them a pair, and commonality is a property of a third row.",
      "The COUNT-shaped alternative — group shared-friend rows per pair and keep zero-count pairs — works, but the doubled edge list makes it lie about magnitudes: on this seed the triangle rows (106) and (105) surface normalized pair (2,5) in the shared list twice (as (2,5) via mutual 6 and as (5,2)), so a naive count reports two mutuals where the truth is one. Deduping fixes the count, but the shape still materializes every witness row before discarding it. NOT EXISTS is immune to the doubling (it stops at one witness) and reads as the English; the stored pairs are already unique under the user1_id < user2_id invariant, so the top level needs no DISTINCT.",
    ],
    edges: [
      "The orientation plant: pair (5,6) (row 105) shares mutual user 2, who is adjacent to 5 only through the REVERSED reading of row (104, 2, 5) — a mutual test that walks only the stored orientation finds no witness and wrongly reports (5,6).",
      "The third-user semantics: pair (2,3) (row 102) are friends with each other, which is adjacency, not commonality — N(2) = {1, 3, 5, 6} and N(3) = {2, 4} intersect in nothing, so the pair ships; treating the pair's own edge as evidence of a shared friend misreads the contract (and no self-loops exist to accidentally satisfy the join).",
      "The doubling plant: rows (106, 2, 6) and (105, 5, 6) put normalized pair (2,5) into the both-orientation shared list twice — a COUNT-based mutual tally without DISTINCT reports 2 where the truth is exactly one (user 6); the EXISTS anti-join is immune.",
      "The leaf pairs: (1,2) survives because user 1's ONLY neighbor is user 2 and no self-loop makes 2 a friend of 2 — dropping leaf users, or requiring both endpoints to have other friends, loses row (101) and row (103) alike.",
    ],
    ladder: [
      { title: "Brute force — intersect friend sets", body: "Pull each stored pair, build both endpoints' friend sets by hand (remembering both orientations), intersect, and keep the pairs whose intersection is empty. The anti-join expresses exactly this per pair." },
      { title: "The pattern — doubled edge list, NOT EXISTS", body: "UNION ALL both orientations into an undirected CTE; keep stored pairs where no two-hop witness (one edge from each endpoint, meeting on the same friend) exists." },
      { title: "The optimal idea — anti-join over counting", body: "The transferable rule: 'no X exists' is an anti-join (NOT EXISTS), not a zero-count GROUP BY — the anti-join stops at the first witness, survives duplicate witnesses without DISTINCT, and keeps the stored-side grain unique by construction." },
    ],
    approach: "UNION BOTH orientations into an undirected CTE; keep stored pairs where NOT EXISTS a third user adjacent to both endpoints",
    schema: {
      ddl: `CREATE TABLE Friendship (
  friendship_id INTEGER PRIMARY KEY,
  user1_id      INTEGER NOT NULL,
  user2_id      INTEGER NOT NULL   -- stored once, user1_id < user2_id
);`,
      seed: `INSERT INTO Friendship (friendship_id, user1_id, user2_id) VALUES
  (101, 1, 2),   -- chain start: user 1 is a leaf
  (102, 2, 3),   -- chain middle
  (103, 3, 4),   -- chain end: user 4 is a leaf
  (104, 2, 5),   -- opens the triangle
  (105, 5, 6),   -- triangle side
  (106, 2, 6);`,
      tables: [
        { name: "Friendship", note: "6 undirected edges over 6 users: a chain 1-2-3-4, a 5-6 pair and the triangle 2-5-6" },
      ],
    },
    code: `WITH undirected AS (
    SELECT user1_id AS a, user2_id AS b FROM Friendship
    UNION ALL
    SELECT user2_id AS a, user1_id AS b   -- the same edge, walked backwards
    FROM Friendship
)
SELECT
    f.user1_id,
    f.user2_id
FROM Friendship f
WHERE NOT EXISTS (
    SELECT 1
    FROM undirected ux
    JOIN undirected uy
      ON uy.a = f.user2_id    -- one hop from the pair's second endpoint
     AND uy.b = ux.b          -- meeting on the same third user
    WHERE ux.a = f.user1_id   -- one hop from the pair's first endpoint
)
ORDER BY f.user1_id, f.user2_id;`,
    walkthrough: [
      "The undirected CTE doubles six stored rows into twelve directed ones — pair (5,6) exists as (5→6) and (6→5), and user 5's neighborhood {2, 6} is fully reachable even though row (104) stores (2, 5).",
      "The anti-join then hunts a witness per stored pair: (2,5) finds user 6 (2→6 and 5→6 both exist), (5,6) finds user 2 (5→2 reversed plus 6→2), (2,6) finds user 5 — all three triangle pairs die on one witness each.",
      "The chain pairs find nothing: (1,2) needs a user adjacent to both 1 and 2 — user 1 has only user 2; (2,3) needs a common name in {1, 3, 5, 6} ∩ {2, 4} = empty; (3,4) similarly — so ORDER BY user1_id, user2_id ships (1,2), (2,3), (3,4).",
    ],
    time: "O(E × d) — each stored pair probes its endpoints' neighbor lists (E edges, d typical degree)",
    space: "O(E) — the doubled edge list",
    followUps: [
      "Count each pair's mutual friends and report the pairs with the most — how does the anti-join invert into an aggregation, and where does DISTINCT (or a fixed orientation) become mandatory on the doubled list?",
      "Suggest friends-of-friends who are NOT yet friends — which part of the same machinery flips from exclusion to the answer, and what new exclusions (existing pairs, self-pairs) must the suggestion query carry?",
    ],
    related: ["leetcodify-similar-friends", "friend-requests-ii-who-has-the-most-friends", "all-the-pairs-with-the-maximum-number-of-common-followers"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-all-unique-email-domains",
    statement:
      "Account stores one row per registered account: (account_id, email). The email domain is everything after the '@' — for 'ana@gmail.com' it is 'gmail.com'. Report the distribution of domains: columns domain and account_count (how many accounts carry that domain), one row per distinct domain, ordered by account_count descending then domain ascending. Letter case in emails is not guaranteed to be consistent, and the grouping must treat 'USER@GMAIL.COM' as gmail.com.",
    examples: [
      {
        input: "accounts 1 and 2 register 'ana@gmail.com' and 'USER@GMAIL.COM'",
        output: "gmail.com · 2",
        explanation:
          "The second email folds to lowercase before extraction, so both registrations land in the same canonical domain.",
      },
      {
        input: "accounts 3, 4 and 5 register 'bo@zai.io', 'cy@outlook.com' and 'di@proton.me' — one account each",
        output: "outlook.com · 1 — proton.me · 1 — zai.io · 1",
        explanation:
          "The three-way count tie falls back to domain ascending, which is what makes the 1-count block deterministic.",
      },
    ],
    constraints: [
      "every email contains exactly one '@'; the domain is everything after it",
      "grouping is case-insensitive: fold emails with LOWER before extracting, so mixed-case registrations land in their canonical domain",
      "columns domain, account_count — ordered by account_count DESC, then domain ASC",
    ],
    breakdown: [
      "The domain is string surgery with one landmark: the '@'. INSTR(email, '@') returns the 1-based position of the first (and, by constraint, only) '@', so the domain starts at that index plus one, and SUBSTR with no length argument runs to the end of the string. The plus-one is the entire bug class — SUBSTR from the raw INSTR position starts AT the '@', producing domains like '@gmail.com' that group cleanly and report confidently wrong counts. Anchoring on INSTR rather than counting characters from the left also keeps the expression correct for local parts of any length.",
      "Case folding is a data-quality decision made before grouping, not a display concern afterwards. The seed's second account registers as 'USER@GMAIL.COM', and text equality is byte-wise — without LOWER the row lands in its own 'GMAIL.COM' group of one while gmail.com's count drops to one, breaking both the count and the alphabetical tie below it. Folding inside the producing CTE means every downstream step (grouping, counting, ordering) sees one canonical domain. The same logic is why the fold cannot live in the ORDER BY: sorting happens after groups have already formed.",
      "The aggregation is the simplest of the batch — one GROUP BY, one COUNT(*) — and the ordering carries the analytics. The count key DESC puts the multi-account provider on top, and the domain key ASC breaks the three-way tie at one deterministically (outlook.com, proton.me, zai.io). The two keys pull in opposite stylistic directions — one is a ranking, the other pure stability — and both are part of the output contract, because a graded report on tied counts is engine-fate without the second key.",
    ],
    edges: [
      "The case plant: account 2 registers 'USER@GMAIL.COM' — skipping LOWER yields a bogus 'GMAIL.COM' group of 1, drops gmail.com to 1, and (byte order) files the uppercase group BEFORE the lowercase tie block, wrong on both counts and order.",
      "The offset plant: INSTR('ana@gmail.com', '@') = 4 — SUBSTR from 4 without the plus-one yields '@gmail.com'; every domain silently grows an '@' and the counts still look plausible.",
      "The tie plant: outlook.com, proton.me and zai.io each count 1 — without domain ASC the 1-count block ships in engine-fate order; with it the block reads outlook.com, proton.me, zai.io.",
      "The one-@ constraint is what licenses INSTR's first-match behavior: a tagged address like 'a+b@c.d' still has one '@', but an escaped or quoted second '@' (excluded by the constraint) would make first-match cut inside the local part instead.",
    ],
    ladder: [
      { title: "Brute force — split and tally", body: "Split each email on the '@' in application code, tally domains in a map, then sort by count descending and name ascending. Two of those steps collapse into one grouped query." },
      { title: "The pattern — INSTR/SUBSTR CTE, group, count", body: "Extract the domain in a producing CTE; GROUP BY domain; COUNT(*); ORDER BY account_count DESC, domain ASC." },
      { title: "The optimal idea — canonicalize before grouping", body: "O(n). The transferable rule: normalization (case folding, trimming) belongs in the producing CTE so every consumer sees one canonical key; positional string functions need their off-by-one asserted, not assumed." },
    ],
    approach: "LOWER(SUBSTR(email, INSTR(email, '@') + 1)) in a CTE, GROUP BY domain, COUNT(*), ORDER BY account_count DESC, domain ASC",
    schema: {
      ddl: `CREATE TABLE Account (
  account_id INTEGER PRIMARY KEY,
  email      TEXT NOT NULL
);`,
      seed: `INSERT INTO Account (account_id, email) VALUES
  (1, 'ana@gmail.com'),
  (2, 'USER@GMAIL.COM'),   -- the case plant: must fold into gmail.com
  (3, 'bo@zai.io'),
  (4, 'cy@outlook.com'),
  (5, 'di@proton.me');`,
      tables: [
        { name: "Account", note: "5 accounts over 4 canonical domains, including one UPPERCASE registration that must fold into gmail.com" },
      ],
    },
    code: `WITH domains AS (
    SELECT
        LOWER(SUBSTR(email, INSTR(email, '@') + 1)) AS domain   -- fold FIRST, then cut after the '@'
    FROM Account
)
SELECT
    domain,
    COUNT(*) AS account_count
FROM domains
GROUP BY domain
ORDER BY account_count DESC, domain ASC;`,
    walkthrough: [
      "The CTE extracts five domains: INSTR finds the '@' at position 4 in 'ana@gmail.com', so SUBSTR from 5 yields 'gmail.com'; account 2 folds to 'user@gmail.com' and joins it; the rest yield 'zai.io', 'outlook.com' and 'proton.me'.",
      "GROUP BY domain produces one group of two and three groups of one: gmail.com 2, and outlook.com, proton.me, zai.io at 1 each.",
      "ORDER BY account_count DESC, domain ASC ships (gmail.com, 2) first, then the alphabetical tie block (outlook.com, 1), (proton.me, 1), (zai.io, 1) — without LOWER, a bogus 'GMAIL.COM' row would have broken this exact sequence.",
    ],
    time: "O(n) — one scan to extract, one grouped pass",
    space: "O(d) — one count per distinct domain",
    followUps: [
      "Report the local part (everything before the '@') beside the domain — what changes in the SUBSTR arguments, and how would you strip a '+tag' from the local part with a second INSTR?",
      "Keep only domains with at least two accounts — where does HAVING sit relative to the fold, and what does the tie contract become when only one group survives?",
    ],
    related: ["fix-names-in-a-table", "find-users-with-valid-e-mails", "patients-with-a-condition"],
    order: "exact",
    xp: 10,
  },
];
