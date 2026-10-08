// Deep-dives — LeetCode Premium batch II: the finals (6 problems, 2 Medium / 4 Hard). Engine-verified by scripts/lc-sql-verify.ts.
// Re-authored from the canonical premium tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM2_FINALS: LcSqlDive[] = [
  {
    slug: "hopper-company-queries-i",
    statement:
      "A ride-share platform tracks its drivers and their rides across three tables. Drivers(driver_id, join_date) records when each driver joined. Rides(ride_id, user_id, requested_date, accepted_date) logs every requested ride — accepted_date is NULL when a request was never taken — and AcceptedRides(ride_id, driver_id, ride_distance, ride_duration) attaches the accepting driver and the trip metrics to each accepted ride. A driver is WORKING in a month when their join_date is on or before the FIRST day of that month; a driver who joined 2020-10-15 is not working in October but is working in November. For October and November of 2020, report one row per month with columns month (the month number, 10 or 11) and working_drivers, ordered by month.",
    examples: [
      {
        input: "driver 3 joined exactly on 2020-10-01 · driver 4 joined 2020-10-15",
        output: "October counts driver 3 and not driver 4",
        explanation:
          "The rule is on or before the month's first day. 2020-10-01 satisfies October's boundary exactly; a mid-month join waits for the next month to count.",
      },
      {
        input: "driver 5 joined 2020-11-01 · driver 6 joined 2020-12-05",
        output: "November counts driver 5; no reported month counts driver 6",
        explanation:
          "November's boundary 2020-11-01 admits driver 5 on equality. Driver 6 joined after December's first day too, so their first working month is January 2021 — outside this report.",
      },
    ],
    constraints: [
      "working in a month means join_date <= that month's first day — an inclusive boundary, not a 'joined during the month' test",
      "report exactly months 10 and 11 of 2020, one row per month, even if a month has no working drivers at all",
      "columns month, working_drivers; ordered by month ascending",
    ],
    breakdown: [
      "The month axis is data, so build it as data. A two-row CTE — WITH months AS (VALUES (10), (11)) — turns the report's periods into rows the query can join against, and driving FROM that spine guarantees one output row per reported month even if the driver side comes back empty. The join is then LEFT: each month keeps its row and collects whichever drivers satisfy the working rule, and COUNT(d.driver_id) — counting the joined column, never * — turns an unmatched month into 0 rather than 1. This spine-plus-LEFT-JOIN skeleton is the reusable shape behind every 'one row per period' report.",
      "The working rule is a comparison against a date boundary, not a membership test on the join month. printf('2020-%02d-01', m.month) builds the boundary string — '2020-10-01' for October — and ISO-8601 dates compare correctly as plain strings, so join_date <= boundary is a chronological test. Equality is the inclusive half of the rule: driver 3's join_date of exactly 2020-10-01 satisfies October's boundary, while driver 4's 2020-10-15 fails it even though both joined during October. One driver, two months, two different answers — that asymmetry is the seed's central trap.",
      "The tempting shortcut — GROUP BY the join month with strftime('%Y-%m', join_date) — answers a different question: it counts drivers who JOINED during each month, so October would read 2 (drivers 3 and 4) instead of 3. It also invents rows for September and December, months the report never asked about, and drops any month with no joiners entirely. The report's months must come from the spine, and its population must come from the boundary comparison — two different jobs that a single GROUP BY conflates.",
    ],
    edges: [
      "The equality boundary: driver 3 joined exactly 2020-10-01 and October counts him — 'on or before' is inclusive, and a strict < implementation loses him.",
      "Driver 4 joined 2020-10-15: excluded from October, included in November. Join-month membership and the working rule disagree for every mid-month joiner — the rule watches the boundary date, not the calendar month of the join.",
      "COUNT(d.driver_id), not COUNT(*): on a LEFT JOIN spine, a month with no working drivers has one null-extended row, which COUNT(*) would report as 1 and the driver-column count reports as 0.",
      "A December joiner (driver 6, 2020-12-05) matches no reported month — and December 2020 would not count him either, because 2020-12-05 is after December's first day; his first working month is January 2021.",
    ],
    ladder: [
      { title: "Brute force — one query per month", body: "Filter with WHERE join_date <= '2020-10-01', count, repeat for November, stitch the rows in application code. Works for two months, hides the boundary rule inside literals, and does not scale to twelve." },
      { title: "The pattern — a months spine LEFT JOINed to Drivers", body: "VALUES (10), (11) builds the axis; the LEFT JOIN carries the boundary condition; COUNT of the driver column aggregates per month." },
      { title: "The optimal idea — periods as rows", body: "O(m x d) for m months and d drivers. The transferable rule: period-keyed reports want the periods as an input relation, not a GROUP BY over event dates — grouping can only see months that have data, while a spine can see months that must read zero." },
    ],
    approach: "A (10, 11) months spine LEFT JOINed to Drivers on join_date <= printf month-start, COUNT(driver_id) per month",
    schema: {
      ddl: `CREATE TABLE Drivers (
  driver_id INTEGER PRIMARY KEY,
  join_date TEXT NOT NULL  -- 'YYYY-MM-DD'
);
CREATE TABLE Rides (
  ride_id        INTEGER PRIMARY KEY,
  user_id        INTEGER NOT NULL,
  requested_date TEXT NOT NULL,
  accepted_date  TEXT      -- NULL = the request was never taken
);
CREATE TABLE AcceptedRides (
  ride_id       INTEGER PRIMARY KEY REFERENCES Rides(ride_id),
  driver_id     INTEGER NOT NULL,
  ride_distance INTEGER NOT NULL,  -- km
  ride_duration INTEGER NOT NULL   -- minutes
);`,
      seed: `-- driver 6 (2020-12-05) joins after both reported months: never working here
INSERT INTO Drivers (driver_id, join_date) VALUES
  (1, '2020-09-01'),
  (2, '2020-09-20'),
  (3, '2020-10-01'),  -- joined ON October's first day: working in October
  (4, '2020-10-15'),  -- mid-October: NOT working in October, working in November
  (5, '2020-11-01'),  -- joined ON November's first day: working in November
  (6, '2020-12-05');
-- ride 11 (2020-10-20) was never accepted: no metrics row for it
INSERT INTO Rides (ride_id, user_id, requested_date, accepted_date) VALUES
  (1, 11, '2020-10-02', '2020-10-02'),
  (2, 12, '2020-10-05', '2020-10-06'),
  (3, 13, '2020-10-10', '2020-10-10'),
  (4, 14, '2020-10-31', '2020-11-01'),  -- straddler: requested Oct, accepted Nov
  (5, 11, '2020-11-02', '2020-11-02'),
  (6, 12, '2020-11-05', '2020-11-06'),
  (7, 13, '2020-11-10', '2020-11-10'),
  (8, 14, '2020-11-21', '2020-11-21'),
  (9, 15, '2020-11-22', '2020-11-22'),
  (10, 16, '2020-11-25', '2020-11-25'),
  (11, 17, '2020-10-20', NULL);
INSERT INTO AcceptedRides (ride_id, driver_id, ride_distance, ride_duration) VALUES
  (1, 1, 20, 30),
  (2, 2, 12, 18),
  (3, 1, 40, 60),
  (4, 4, 5, 7),
  (5, 1, 33, 45),
  (6, 2, 8, 11),
  (7, 3, 25, 35),
  (8, 1, 16, 20),
  (9, 4, 6, 9),
  (10, 2, 50, 70);`,
      tables: [
        { name: "Drivers", note: "6 drivers joining September-December 2020 — drivers 3 and 5 land exactly on a month's first day, driver 4 joins mid-October, driver 6 lands after both reported months" },
        { name: "Rides", note: "11 requests in October-November 2020 — ride 4 straddles the month edge (requested 10-31, accepted 11-01) and ride 11 was never accepted" },
        { name: "AcceptedRides", note: "10 accepted rides with driver, distance and duration — driver 5 completed none, driver 6 has none to complete" },
      ],
    },
    code: `WITH months(month) AS (VALUES (10), (11))
SELECT
    m.month,
    COUNT(d.driver_id) AS working_drivers  -- counts MATCHED drivers only: empty month -> 0
FROM months m
LEFT JOIN Drivers d
       ON d.join_date <= printf('2020-%02d-01', m.month)  -- on or before the month's FIRST day
GROUP BY m.month
ORDER BY m.month;`,
    walkthrough: [
      "The spine holds months 10 and 11. October's boundary string is '2020-10-01': drivers 1 ('2020-09-01'), 2 ('2020-09-20') and 3 (exactly '2020-10-01') satisfy it, while driver 4 ('2020-10-15') misses it by fourteen days.",
      "November's boundary is '2020-11-01': drivers 1 through 4 all joined on or before it and driver 5 lands exactly on the day — five matched drivers, with driver 6 ('2020-12-05') matching neither month.",
      "COUNT(d.driver_id) totals the matched rows per month: October 3, November 5 — output rows (10, 3) and (11, 5), in month order.",
    ],
    time: "O(m x d) — each reported month probes the driver table once",
    space: "O(m) — one row per reported month",
    followUps: [
      "Parts II and III grow on this exact schema: what share of the working drivers actually completed a ride each month, and what distance and duration did the requested rides average? Predict which table each part needs before peeking.",
      "Extend the spine to all twelve months of 2020 with a WITH RECURSIVE month generator — which months would read 0 under the same rule, and what does the query already guarantee about a driverless month?",
    ],
    related: ["user-activity-for-the-past-30-days-i", "game-play-analysis-iv", "the-latest-login-in-2020"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "hopper-company-queries-ii",
    statement:
      "This dive reuses the Hopper schema: Drivers(driver_id, join_date), Rides(ride_id, user_id, requested_date, accepted_date — NULL when never taken) and AcceptedRides(ride_id, driver_id, ride_distance, ride_duration). A driver is WORKING in a month when their join_date is on or before that month's first day — the same rule as part I. For October and November of 2020, report the percentage of working drivers who completed at least one ride ACCEPTED in that month: a ride belongs to the month its acceptance happened (Rides.accepted_date), whatever the request date was. Output columns month and percentage, the share rounded to 2 decimals, ordered by month.",
    examples: [
      {
        input: "October has 3 working drivers (1, 2, 3); the rides accepted in October were driven by 1 and 2 — driver 1 twice, driver 3 idle",
        output: "10 · 66.67",
        explanation:
          "Two of three working drivers accepted at least one ride: 100.0 * 2 / 3 = 66.666... rounds to 66.67. Driver 3 stays in the denominator despite the empty month.",
      },
      {
        input: "November has 5 working drivers; the drivers of rides accepted in November are 1, 2, 3 and 4 — driver 5 joined on the 1st but never completed a ride",
        output: "11 · 80.0",
        explanation:
          "4 of 5 is exactly 80.0. Ride 4 was requested 2020-10-31 but accepted 2020-11-01 by driver 4 — it counts toward November's numerator, not October's.",
      },
    ],
    constraints: [
      "the denominator is part I's working population — drivers with join_date on or before the month's first day",
      "the numerator is the DISTINCT drivers with at least one ride whose accepted_date falls in that month; a driver with several rides counts once",
      "percentage = 100 * numerator / denominator rounded to 2 decimals; columns month, percentage; ordered by month",
    ],
    breakdown: [
      "Two populations, two grains, one ratio. The denominator is part I's spine query verbatim: months LEFT JOINed to Drivers under the on-or-before boundary, COUNT of the matched driver column — October 3, November 5. The numerator lives at a different grain: DISTINCT drivers in the month's acceptances, and acceptances only become countable after AcceptedRides joins Rides, because the acceptance DATE lives on Rides, not on AcceptedRides. COUNT(DISTINCT ar.driver_id) is the right counter — driver 1 accepted two of October's three rides and must weigh once.",
      "The final division carries the batch's favorite traps at once. Float promotion first: 100.0 * 2 / 3 must be floating point before ROUND sees it, or a bare 2/3 collapses to 0. Then coverage: the accepted CTE aggregates per month, so a month with zero acceptances produces NO row at all — the outer LEFT JOIN keeps the month and COALESCE(a.drivers, 0) feeds a clean 0 into the division instead of NULL-poisoning it. Both guards are one token each, and either omission breaks a report that looks correct on the happy path.",
      "Bucketing discipline decides the answer. Ride 4 was requested 2020-10-31 and accepted 2020-11-01 by driver 4: the acceptance rule puts driver 4 in NOVEMBER's numerator. Bucketing by request date instead would pull him into October — October's numerator becomes {1, 2, 4} and the percentage a perfect 100.0, masking the idle driver 3 the seed planted. The two dates mark different events; part III will bucket by the OTHER one, and the same rows will move the other way.",
    ],
    edges: [
      "Ride 4 (requested 2020-10-31, accepted 2020-11-01) belongs to NOVEMBER's numerator — a request-date bucketing inflates October to 100.0 and is exactly the wrong answer the seed is built to catch.",
      "COUNT(DISTINCT ar.driver_id), not COUNT(*): November's accepted rides are 7 rows but only 4 distinct drivers — raw row counts would report 140.0, a percentage over 100.",
      "Denominator integrity: driver 3 works in October but accepted nothing, and driver 5 works in November with no completed rides at all — they depress the rate but must stay in the denominator; the percentage is measured against the working pool.",
      "A month with zero acceptances has no row in the accepted CTE: LEFT JOIN + COALESCE(a.drivers, 0) is what would print 0.0 instead of NULL — and a month with zero WORKING drivers would need NULLIF(w.drivers, 0) to avoid a NULL ratio.",
    ],
    ladder: [
      { title: "Brute force — two queries and a calculator", body: "Count working drivers per month, list distinct accepted drivers per month, divide in a spreadsheet. Three manual steps repeated for every month the report covers." },
      { title: "The pattern — two CTEs, one ratio", body: "working (the part I spine) and accepted (distinct drivers per acceptance month) joined on month, divided with float promotion and rounded." },
      { title: "The optimal idea — keep each population at its own grain", body: "O(m x d + a). Durable rule: a ratio of populations is computed per population FIRST (each CTE answers its own question and is testable alone) and combined LAST — never by pushing one population's condition into the other's join, which double-counts or starves the denominator." },
    ],
    approach: "Part I's working spine LEFT JOINed to a COUNT(DISTINCT accepted-driver) per acceptance month, promoted to float and rounded to 2",
    schema: {
      ddl: `CREATE TABLE Drivers (
  driver_id INTEGER PRIMARY KEY,
  join_date TEXT NOT NULL  -- 'YYYY-MM-DD'
);
CREATE TABLE Rides (
  ride_id        INTEGER PRIMARY KEY,
  user_id        INTEGER NOT NULL,
  requested_date TEXT NOT NULL,
  accepted_date  TEXT      -- NULL = the request was never taken
);
CREATE TABLE AcceptedRides (
  ride_id       INTEGER PRIMARY KEY REFERENCES Rides(ride_id),
  driver_id     INTEGER NOT NULL,
  ride_distance INTEGER NOT NULL,  -- km
  ride_duration INTEGER NOT NULL   -- minutes
);`,
      seed: `-- drivers 1-3 are working in October, drivers 1-5 in November (join_date <= month start)
INSERT INTO Drivers (driver_id, join_date) VALUES
  (1, '2020-09-01'),
  (2, '2020-09-20'),
  (3, '2020-10-01'),
  (4, '2020-10-15'),
  (5, '2020-11-01'),
  (6, '2020-12-05');
-- accepted_date splits October rides (1-3) from November rides (4-10); ride 4 straddles
INSERT INTO Rides (ride_id, user_id, requested_date, accepted_date) VALUES
  (1, 11, '2020-10-02', '2020-10-02'),
  (2, 12, '2020-10-05', '2020-10-06'),
  (3, 13, '2020-10-10', '2020-10-10'),
  (4, 14, '2020-10-31', '2020-11-01'),
  (5, 11, '2020-11-02', '2020-11-02'),
  (6, 12, '2020-11-05', '2020-11-06'),
  (7, 13, '2020-11-10', '2020-11-10'),
  (8, 14, '2020-11-21', '2020-11-21'),
  (9, 15, '2020-11-22', '2020-11-22'),
  (10, 16, '2020-11-25', '2020-11-25'),
  (11, 17, '2020-10-20', NULL);
INSERT INTO AcceptedRides (ride_id, driver_id, ride_distance, ride_duration) VALUES
  (1, 1, 20, 30),
  (2, 2, 12, 18),
  (3, 1, 40, 60),
  (4, 4, 5, 7),
  (5, 1, 33, 45),
  (6, 2, 8, 11),
  (7, 3, 25, 35),
  (8, 1, 16, 20),
  (9, 4, 6, 9),
  (10, 2, 50, 70);`,
      tables: [
        { name: "Drivers", note: "6 drivers — 3 working in October (1, 2, 3) and 5 in November (1-5); drivers 3 and 5 join exactly on a month boundary" },
        { name: "Rides", note: "11 requests Oct-Nov 2020 — accepted_date separates October rides (1-3) from November rides (4-10); ride 4 straddles, ride 11 was never accepted" },
        { name: "AcceptedRides", note: "10 accepted rides — November's 7 acceptances were driven by only 4 distinct drivers, and driver 5 never appears" },
      ],
    },
    code: `WITH months(month) AS (VALUES (10), (11)),
working AS (
    SELECT
        m.month,
        COUNT(d.driver_id) AS drivers           -- denominator: part I's working rule
    FROM months m
    LEFT JOIN Drivers d
           ON d.join_date <= printf('2020-%02d-01', m.month)
    GROUP BY m.month
),
accepted AS (
    SELECT
        CAST(strftime('%m', r.accepted_date) AS INTEGER) AS month,
        COUNT(DISTINCT ar.driver_id) AS drivers -- numerator: DISTINCT drivers, not rides
    FROM AcceptedRides ar
    JOIN Rides r ON r.ride_id = ar.ride_id      -- the acceptance DATE lives on Rides
    GROUP BY month
)
SELECT
    w.month,
    ROUND(100.0 * COALESCE(a.drivers, 0) / w.drivers, 2) AS percentage
FROM working w
LEFT JOIN accepted a ON a.month = w.month       -- a month with no acceptances still reports
ORDER BY w.month;`,
    walkthrough: [
      "working replicates part I exactly: October 3 (drivers 1-3), November 5 (drivers 1-5).",
      "accepted buckets by accepted_date: October's acceptances are rides 1-3, driven by 1, 2 and 1 — DISTINCT collapses driver 1's pair to one; November's are rides 4-10, driven by 4, 1, 2, 3, 1, 4, 2 — seven rows, four distinct drivers. Ride 4's acceptance on 2020-11-01 is what pulls driver 4 into November.",
      "The ratio: October 100.0 * 2 / 3 = 66.666... -> 66.67; November 100.0 * 4 / 5 = 80.0. Rows (10, 66.67) and (11, 80.0), in month order — with driver 3 (working October, idle) and driver 5 (working November, no completed rides) holding both months below 100.",
    ],
    time: "O(m x d + a) — the spine pass plus one scan of the accepted rides",
    space: "O(m + a) — one row per month plus the accepted-ride scan",
    followUps: [
      "Guard the denominator with NULLIF(w.drivers, 0): what does the unguarded query print for a month with no working drivers (SQLite yields NULL, not an error), and which behavior should a dashboard show?",
      "Add the complementary column — the percentage of working drivers whose rides were REQUESTED that month — and watch October's two numbers disagree (66.67 against the request-bucketed 100.0) because ride 4 straddles the boundary.",
    ],
    related: ["percentage-of-users-attended-a-contest", "queries-quality-and-percentage", "average-selling-price"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "hopper-company-queries-iii",
    statement:
      "Same Hopper schema, third question. Drivers(driver_id, join_date), Rides(ride_id, user_id, requested_date, accepted_date — NULL when never taken) and AcceptedRides(ride_id, driver_id, ride_distance, ride_duration). Report, for every month that has rides requested in it, the average distance and duration of the rides REQUESTED in that month — the bucket is requested_date, NOT accepted_date: a ride requested 2020-10-31 and accepted 2020-11-01 belongs to October. Only accepted rides carry metrics, because distance and duration are recorded on AcceptedRides. Output columns month (the month number), average_ride_distance, average_ride_duration — both averages rounded to 2 decimals — ordered by month.",
    examples: [
      {
        input: "ride 4: requested 2020-10-31, accepted 2020-11-01, 5 km / 7 min",
        output: "it feeds OCTOBER's averages",
        explanation:
          "The report buckets by the request. The November 1 acceptance is irrelevant here — it was the deciding date in part II, and that contrast is the point of running both reports on one seed.",
      },
      {
        input: "October's metric-carrying rides: 20, 12, 40, 5 km over 30, 18, 60, 7 min · ride 11 (requested 2020-10-20) was never accepted",
        output: "10 · 19.25 · 28.75",
        explanation:
          "Four rides average: 77/4 km and 115/4 min. The never-accepted request contributes nothing — there is no distance to average.",
      },
    ],
    constraints: [
      "a ride's month is the month of requested_date; acceptance dates never affect the bucketing",
      "averages run over rides that have AcceptedRides metrics; a requested-but-never-accepted ride has nothing to average and is excluded",
      "columns month, average_ride_distance, average_ride_duration, both averages rounded to 2 decimals, ordered by month; every month with at least one metric-carrying requested ride appears",
    ],
    breakdown: [
      "Bucketing is the whole problem. strftime('%m', requested_date) reads the request's month ('10', '11'), CAST to INTEGER for a clean numeric axis, and GROUP BY that expression aggregates everything else away. The seed plants ride 4 on the boundary — requested 2020-10-31, accepted 2020-11-01 — and the contract pulls it into October: four metric-carrying rides (1, 2, 3, 4) form October's group and six (5-10) form November's. One ride moved by one day; a wrong bucket is invisible in the shape of the output and visible only in the numbers.",
      "The join to AcceptedRides is required — distance and duration live there — and it does a second job for free: ride 11, requested 2020-10-20 but never accepted, has no AcceptedRides row, so the inner join drops it before averaging. That is the honest semantics, not a convenience: a ride without an acceptance has no distance to contribute, and counting it in the denominator would dilute October's average with a fabricated zero. When the population and the measure live on different tables, the join that brings the measure also defines the population — decide deliberately whether that is the population the report promises.",
      "AVG over INTEGER columns already returns a float in SQLite, so the integer-division trap of COUNT ratios does not apply here — but the repeating decimal does. November's durations sum to 190 over 6 rides, 31.666..., and only ROUND(..., 2) turns it into 31.67. October is exact (77/4 = 19.25 and 115/4 = 28.75) and November's distance is exact too (138/6 = 23.0), so the seed shows both faces of rounding: insurance on the clean months, necessity on the messy one.",
    ],
    edges: [
      "Ride 4 is October's, not November's: requested 2020-10-31, accepted 2020-11-01. Bucketing by accepted_date instead would give October (20+12+40)/3 = 24.0 km and 36.0 min with November absorbing the 5 km / 7 min ride — a wrong report that still looks plausible.",
      "Ride 11 (requested 2020-10-20, never accepted) drops out through the inner join — no metrics exist to average. A 'every requested ride' version would need a LEFT JOIN and a COALESCE story for NULL distances, which no honest average supports.",
      "November's duration average is 190/6 = 31.666...: without ROUND the output prints a repeating tail, and the grader's 4dp normalizer would compare 31.6667 where the report promises 31.67.",
      "Months come from the data: a December ride would ADD a month-12 row rather than being filtered out. If the report must pin exactly October and November, drive it from a months spine like part I and decide what an empty month should print.",
    ],
    ladder: [
      { title: "Brute force — one query per month", body: "WHERE requested_date BETWEEN '2020-10-01' AND '2020-10-31', AVG by hand, repeat for November. Two queries per report, forever." },
      { title: "The pattern — bucket by expression, AVG both measures", body: "CAST(strftime('%m', requested_date) AS INTEGER) as the grouping key over Rides JOIN AcceptedRides, with ROUND(AVG(...), 2) per measure." },
      { title: "The optimal idea — name the event that owns the bucket", body: "O(a) for a accepted rides. Durable rule: when a row carries two dates, every report must DECLARE which date defines its period — the request here, the acceptance in part II — and a boundary row in the seed is the unit test for that declaration." },
    ],
    approach: "Group the Rides-to-AcceptedRides join by CAST(strftime('%m', requested_date) AS INTEGER), AVG each metric, ROUND to 2",
    schema: {
      ddl: `CREATE TABLE Drivers (
  driver_id INTEGER PRIMARY KEY,
  join_date TEXT NOT NULL  -- 'YYYY-MM-DD'
);
CREATE TABLE Rides (
  ride_id        INTEGER PRIMARY KEY,
  user_id        INTEGER NOT NULL,
  requested_date TEXT NOT NULL,
  accepted_date  TEXT      -- NULL = the request was never taken
);
CREATE TABLE AcceptedRides (
  ride_id       INTEGER PRIMARY KEY REFERENCES Rides(ride_id),
  driver_id     INTEGER NOT NULL,
  ride_distance INTEGER NOT NULL,  -- km
  ride_duration INTEGER NOT NULL   -- minutes
);`,
      seed: `-- drivers power parts I and II; this report is about the RIDES' months
INSERT INTO Drivers (driver_id, join_date) VALUES
  (1, '2020-09-01'),
  (2, '2020-09-20'),
  (3, '2020-10-01'),
  (4, '2020-10-15'),
  (5, '2020-11-01'),
  (6, '2020-12-05');
-- October holds rides 1-4 plus never-accepted ride 11; November holds rides 5-10
INSERT INTO Rides (ride_id, user_id, requested_date, accepted_date) VALUES
  (1, 11, '2020-10-02', '2020-10-02'),
  (2, 12, '2020-10-05', '2020-10-06'),
  (3, 13, '2020-10-10', '2020-10-10'),
  (4, 14, '2020-10-31', '2020-11-01'),
  (5, 11, '2020-11-02', '2020-11-02'),
  (6, 12, '2020-11-05', '2020-11-06'),
  (7, 13, '2020-11-10', '2020-11-10'),
  (8, 14, '2020-11-21', '2020-11-21'),
  (9, 15, '2020-11-22', '2020-11-22'),
  (10, 16, '2020-11-25', '2020-11-25'),
  (11, 17, '2020-10-20', NULL);
INSERT INTO AcceptedRides (ride_id, driver_id, ride_distance, ride_duration) VALUES
  (1, 1, 20, 30),
  (2, 2, 12, 18),
  (3, 1, 40, 60),
  (4, 4, 5, 7),   -- straddler: metrics count for OCTOBER via requested_date
  (5, 1, 33, 45),
  (6, 2, 8, 11),
  (7, 3, 25, 35),
  (8, 1, 16, 20),
  (9, 4, 6, 9),
  (10, 2, 50, 70);`,
      tables: [
        { name: "Drivers", note: "6 drivers, September-December 2020 joins — the working-rule population of parts I and II; not needed for this report" },
        { name: "Rides", note: "11 requests — October holds 5 (rides 1-4 plus never-accepted ride 11), November holds 6 (rides 5-10); ride 4 straddles the boundary" },
        { name: "AcceptedRides", note: "10 metric rows — ride 4's metrics (5 km / 7 min) land in OCTOBER's averages via its request date" },
      ],
    },
    code: `SELECT
    CAST(strftime('%m', r.requested_date) AS INTEGER) AS month,
    ROUND(AVG(ar.ride_distance), 2) AS average_ride_distance,
    ROUND(AVG(ar.ride_duration), 2) AS average_ride_duration
FROM Rides r
JOIN AcceptedRides ar ON ar.ride_id = r.ride_id  -- metrics live here; never-accepted rides drop out
GROUP BY month                                   -- bucket = the REQUEST month
ORDER BY month;`,
    walkthrough: [
      "Ten rides survive the join — all but ride 11, which was never accepted and carries no metrics. Bucketing by request month: October collects rides 1-4 (the straddler included), November collects rides 5-10.",
      "October's distances are 20, 12, 40, 5 (sum 77) over 4 rides -> 19.25; durations 30, 18, 60, 7 (sum 115) -> 28.75.",
      "November's distances 33, 8, 25, 16, 6, 50 sum to 138 over 6 -> 23.0; durations 45, 11, 35, 20, 9, 70 sum to 190 over 6 = 31.666... -> ROUND prints 31.67. Rows: (10, 19.25, 28.75) then (11, 23.0, 31.67).",
    ],
    time: "O(a) — one grouped pass over the accepted rides joined to their requests",
    space: "O(m) — one group per month",
    followUps: [
      "Run the same query bucketed by accepted_date and diff the two reports — which months move, and how much does one boundary ride shift an average built on four?",
      "Add a months spine so every month of Q4 prints (0 or NULL when empty) — and decide which of the two an operations dashboard should show for a month with requests but no acceptances.",
    ],
    related: ["average-selling-price", "total-sales-amount-by-year", "top-travellers"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "find-the-subtasks-that-did-not-execute",
    statement:
      "A batch runner splits each job into a fixed number of numbered subtasks. TaskFamily(task_id, subtasks_count) defines the jobs — family 1 has 3 subtasks, family 2 has 2, family 4 has 4 — and a family's subtask ids run 1 through subtasks_count. ExecutedSubtasks(task_id, subtask_id) records the subtasks that actually ran. Report every (task_id, subtask_id) the family defines that has NO execution record: the subtasks that did not execute. Output columns task_id, subtask_id, ordered by task_id then subtask_id.",
    examples: [
      {
        input: "family 4 defines subtasks 1-4; its execution log holds 1, 2 and 4",
        output: "(4 · 3)",
        explanation:
          "Subtask 3 is inside the family's range but has no log row — the seed's single gap, and the whole output.",
      },
      {
        input: "family 1 defines 1-3 and logged all three · family 2 defines 1-2 and logged both",
        output: "(no rows from either)",
        explanation:
          "A complete log produces nothing. 'Complete' is judged per family, against that family's own count — not against the largest count anywhere in the table.",
      },
    ],
    constraints: [
      "a subtask id is real only within 1..subtasks_count of ITS family — ids beyond a family's count are not subtasks and must never be reported",
      "a pair is reported iff it is in range and missing from ExecutedSubtasks; executed pairs never appear",
      "every subtasks_count >= 1; columns task_id, subtask_id; ordered by task_id then subtask_id",
    ],
    breakdown: [
      "The answer does not exist in the data — it is the difference between a definition and an event log, and the definition side is a COUNT, not rows. The grid of 'everything that should have run' must be generated: WITH RECURSIVE seeds one row per family at subtask 1 and climbs by one, and the climb's termination test must read THAT family's subtasks_count. That reading forces the recursive step to JOIN TaskFamily back on task_id, so the family's own bound travels with the recursion. Generation is the only way to ask for rows the log never wrote.",
      "The recursion's shape is worth stating precisely. The anchor SELECT task_id, 1 FROM TaskFamily emits the first subtask of every family. The recursive member increments and is guarded by WHERE g.subtask_id < t.subtasks_count against the re-joined family row — family 2 stops after 2, family 4 walks to 4. On the seed the grid holds 3 + 2 + 4 = 9 pairs. A tempting shortcut bounds the counter by (SELECT MAX(subtasks_count) FROM TaskFamily) — one global 4 — which fabricates pairs 1-4 for EVERY family and turns gap detection into fiction.",
      "Missing is an anti-join. NOT EXISTS with a two-column correlated probe — same task_id AND same subtask_id — is the safest of the three classic shapes: it has no NULL semantics to reason about, unlike NOT IN (which returns zero rows the moment the subquery yields one NULL), and no row-multiplication risk, unlike a LEFT JOIN IS NULL shape over a log that could hold a duplicated row. Eight of the nine generated pairs find a log row; the probe misses exactly once.",
    ],
    edges: [
      "The global-max trap: bounding the recursion at MAX(subtasks_count) = 4 fabricates (1, 4), (2, 3) and (2, 4) — three phantom gaps the anti-join would dutifully report. The recursive step must re-join TaskFamily and test each family's OWN count.",
      "NOT IN is one NULL away from an empty report: a single NULL in the log subquery (possible the day the columns lose their NOT NULL) turns NOT IN into never-true. NOT EXISTS is NULL-proof.",
      "Stray log rows past a family's count — say a buggy (2, 7) — are inert: the grid never emits 7 for family 2, so the stray row can neither create a false gap nor suppress one. Range discipline cuts both ways.",
      "A family with subtasks_count = 0 would still emit its anchor pair (task, 1) — the constraint rules such rows out; the defensive fix is filtering the anchor to WHERE subtasks_count >= 1.",
    ],
    ladder: [
      { title: "Brute force — loop in application code", body: "Read the families, loop 1..count per family, membership-test the log set per pair, collect the misses. The engine generates and probes in one statement." },
      { title: "The pattern — recursive grid + anti-join", body: "WITH RECURSIVE bounded per family through a re-join to TaskFamily, then NOT EXISTS on the (task_id, subtask_id) pair." },
      { title: "The optimal idea — materialize the dense index you wish existed", body: "O(g) generation for g = sum of counts, O(g) hash probes. The shape generalizes to missing dates, missing sequence numbers, missing seats — anywhere a sparse log must be audited against a dense definition." },
    ],
    approach: "WITH RECURSIVE generates 1..subtasks_count per family (bounded by a re-join to TaskFamily), then NOT EXISTS finds the gaps",
    schema: {
      ddl: `CREATE TABLE TaskFamily (
  task_id        INTEGER PRIMARY KEY,
  subtasks_count INTEGER NOT NULL CHECK (subtasks_count >= 1)
);
CREATE TABLE ExecutedSubtasks (
  task_id    INTEGER NOT NULL,
  subtask_id INTEGER NOT NULL
);`,
      seed: `INSERT INTO TaskFamily (task_id, subtasks_count) VALUES
  (1, 3),
  (2, 2),
  (4, 4);
INSERT INTO ExecutedSubtasks (task_id, subtask_id) VALUES
  (1, 1), (1, 2), (1, 3),  -- family 1: complete
  (2, 1), (2, 2),          -- family 2: complete
  -- family 4 logged 1, 2 and 4: subtask 3 never executed
  (4, 1), (4, 2), (4, 4);`,
      tables: [
        { name: "TaskFamily", note: "3 families with counts 3, 2 and 4 — the counts differ on purpose, so a global bound would fabricate" },
        { name: "ExecutedSubtasks", note: "8 log rows: families 1 and 2 complete, family 4 missing exactly subtask 3" },
      ],
    },
    code: `WITH RECURSIVE grid(task_id, subtask_id) AS (
    SELECT task_id, 1                            -- anchor: first subtask of every family
    FROM TaskFamily
    UNION ALL
    SELECT g.task_id, g.subtask_id + 1
    FROM grid g
    JOIN TaskFamily t ON t.task_id = g.task_id   -- re-join: the bound is THIS family's count
    WHERE g.subtask_id < t.subtasks_count        -- stop at that count, not a global max
)
SELECT
    g.task_id,
    g.subtask_id
FROM grid g
WHERE NOT EXISTS (                               -- anti-join: no log row for this pair
    SELECT 1
    FROM ExecutedSubtasks e
    WHERE e.task_id = g.task_id
      AND e.subtask_id = g.subtask_id
)
ORDER BY g.task_id, g.subtask_id;`,
    walkthrough: [
      "The anchor emits (1, 1), (2, 1) and (4, 1). Each recursive step re-joins TaskFamily to read its own bound: family 1 climbs 1 -> 2 -> 3 and stops, family 2 stops after 1 -> 2, family 4 walks to 4 — nine generated pairs, 3 + 2 + 4.",
      "NOT EXISTS probes the log per pair: family 1's three pairs all hit rows, family 2's two pairs hit, and family 4's probes hit on 1, 2 and 4.",
      "Exactly one probe misses — (4, 3) — so the output is a single row. A global-max bound would have added phantom rows (1, 4), (2, 3) and (2, 4) here; the re-join is what keeps the report honest.",
    ],
    time: "O(g) to generate g = sum of subtasks_count pairs, plus O(g) hash probes against the log",
    space: "O(g) — the generated grid",
    followUps: [
      "Render one row per family with its missing ids as a comma-joined string (GROUP_CONCAT over a LEFT JOIN from TaskFamily) — what do complete families print, and how do you keep them on the report?",
      "Swap the domain: a billing ledger with one EXPECTED invoice per month and sparse ACTUAL rows — where does the same generate-then-anti-join shape find the missing months, and what replaces subtasks_count as the bound?",
    ],
    related: ["students-and-examinations", "total-sales-amount-by-year", "count-salary-categories"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "grand-slam-titles",
    statement:
      "A tennis archive stores its champions in a wide table. Players(player_id, name) lists the tour's players. Championships(season, wimbledon, fr_open, us_open, au_open) holds one row per season, and each of the four tournament columns holds the player_id of that season's champion — a player may hold several titles per season and across seasons. Count each player's total titles across all four tournaments and every recorded season, and report player_id, name, grand_slams_count for every player with at least one title, ordered by grand_slams_count descending, then player_id ascending.",
    examples: [
      {
        input: "player 1 holds Wimbledon in 2018 and again in 2019",
        output: "1 · Moreau · 2",
        explanation:
          "Two seasons, one column, two titles: the count is per TITLE, and repeated wins in the same tournament must each count.",
      },
      {
        input: "the champion columns hold (1, 2, 3, 2) for 2018 and (1, 3, 4, 5) for 2019",
        output: "players 1, 2, 3 tie at 2 titles (printed 1, 2, 3 in id order), then 4 and 5 at 1",
        explanation:
          "The unpivot yields eight title rows from two season rows; the tie at 2 is broken deterministically by player_id.",
      },
    ],
    constraints: [
      "a title is one (season, tournament) win — the same player winning the same tournament in different seasons holds two titles",
      "players with zero titles are excluded from the report (the seed contains none)",
      "columns player_id, name, grand_slams_count; ordered by grand_slams_count DESC, then player_id ASC",
    ],
    breakdown: [
      "The titles are pivoted four-wide, and counting wants one row per title — so unpivot first. A four-way UNION ALL over Championships projects each champion column in turn: SELECT wimbledon AS player_id, then fr_open, us_open and au_open in later branches. Two season rows become eight title rows. Each projection reads its own column independently, so a player who appears twice on ONE row (player 2 holds Roland Garros and the Australian Open of 2018) still yields two rows — the columns never interfere with each other.",
      "UNION ALL is load-bearing; UNION would be a silent bug. The four projections are disjoint by construction — each reads a different column of the same rows — so deduplication has nothing legitimate to remove, but it would collapse a player's REPEATED wins across rows: player 1's Wimbledon ids (1 and 1) from 2018 and 2019 project to two identical rows that UNION would fuse into one, dropping his count from 2 to 1. UNION deduplicates tuples; titles are events, and two events that coincide in value are still two events. Any unpivot-then-count over event data must stay UNION ALL.",
      "The report is then ordinary aggregation: JOIN Players for the name (an inner join, which is exactly the zero-title exclusion the contract states — a player absent from every champion column has no unpivoted row to join), GROUP BY identity with the name riding along, COUNT(*) per player. ORDER BY grand_slams_count DESC, player_id ASC turns the three-way tie at 2 into a deterministic 1, 2, 3 and the pair at 1 into 4, 5. The tiebreaker is not cosmetic: without it the engine's sort order would decide who prints first.",
    ],
    edges: [
      "UNION instead of UNION ALL drops player 1's repeat Wimbledon to one row: his count falls 2 -> 1 and the leaderboard reorders — the classic silent corruption of an event count.",
      "Zero-title players are excluded by the inner join (and the seed has none); including them is a different contract — LEFT JOIN Players against the aggregated titles and COALESCE the count to 0.",
      "Player 2's two 2018 titles sit on the SAME championships row (fr_open and au_open): the unpivot still yields two rows because each projection reads its own column — wide tables hide per-category repeats that the tall shape exposes.",
      "GROUP BY p.player_id, p.name, not name alone: two players sharing a name would merge under a name-only key — group by identity, display the label.",
    ],
    ladder: [
      { title: "Brute force — four arrays in application code", body: "Read both season rows, walk the wimbledon, fr, us and au lists, tally a map, sort by count. Fine for 8 titles; the same code dies at 60 seasons." },
      { title: "The pattern — 4-way UNION ALL, then GROUP BY", body: "Unpivot the champion columns into one player_id column, join the names, COUNT(*), order with an explicit tiebreaker." },
      { title: "The optimal idea — unpivot before you aggregate", body: "O(4s) for s seasons — one pass per column. Durable rule: one-column-per-category layouts (medals, months, tournament columns) are unreadable to GROUP BY until they are unpivoted into a tall event log; reshape once, and every aggregation becomes ordinary." },
    ],
    approach: "Four-way UNION ALL unpivot of the champion columns into title rows, JOIN Players, GROUP BY player, COUNT ordered by count DESC then player_id",
    schema: {
      ddl: `CREATE TABLE Players (
  player_id INTEGER PRIMARY KEY,
  name      TEXT NOT NULL
);
CREATE TABLE Championships (
  season    INTEGER PRIMARY KEY,
  wimbledon INTEGER NOT NULL,
  fr_open   INTEGER NOT NULL,
  us_open   INTEGER NOT NULL,
  au_open   INTEGER NOT NULL
);`,
      seed: `INSERT INTO Players (player_id, name) VALUES
  (1, 'Moreau'),
  (2, 'Lindqvist'),
  (3, 'Tanaka'),
  (4, 'Okafor'),
  (5, 'Duarte');
INSERT INTO Championships (season, wimbledon, fr_open, us_open, au_open) VALUES
  (2018, 1, 2, 3, 2),  -- Lindqvist holds Roland Garros AND the Australian Open this season
  (2019, 1, 3, 4, 5);`,
      tables: [
        { name: "Players", note: "5 players — every one of them holds at least one title, so the exclusion rule never bites here" },
        { name: "Championships", note: "2 seasons, 8 title slots — Moreau repeats Wimbledon across seasons, Lindqvist doubles up within 2018, and the 2-title tier ties three ways" },
      ],
    },
    code: `WITH titles AS (
    SELECT wimbledon AS player_id FROM Championships
    UNION ALL                                -- ALL: repeated wins are separate events
    SELECT fr_open  AS player_id FROM Championships
    UNION ALL
    SELECT us_open  AS player_id FROM Championships
    UNION ALL
    SELECT au_open  AS player_id FROM Championships
)
SELECT
    p.player_id,
    p.name,
    COUNT(*) AS grand_slams_count
FROM titles t
JOIN Players p ON p.player_id = t.player_id  -- inner join: zero-title players drop out
GROUP BY p.player_id, p.name
ORDER BY grand_slams_count DESC, p.player_id ASC;`,
    walkthrough: [
      "The unpivot turns two season rows into eight title rows: (1), (2), (3), (2) from 2018 and (1), (3), (4), (5) from 2019 — player 2's double on the 2018 row survives as two rows.",
      "COUNT(*) per player: player 1 -> 2 (Wimbledon twice), player 2 -> 2 (Roland Garros plus Australian Open), player 3 -> 2 (US Open 2018, Roland Garros 2019), players 4 and 5 -> 1 each.",
      "The join attaches names; ORDER BY count DESC then id prints the tie at 2 as 1 Moreau, 2 Lindqvist, 3 Tanaka, then 4 Okafor and 5 Duarte at 1 — five rows in a fully deterministic order.",
    ],
    time: "O(4s) for s seasons — one scan per champion column",
    space: "O(4s) — the unpivoted title rows",
    followUps: [
      "Include zero-title players at 0 — LEFT JOIN Players against the aggregated titles with COALESCE — then decide whether a 0 should sort before or after every real count.",
      "Split the count per tournament — four conditional SUMs over the unpivoted rows keyed by a tournament label the unpivot can carry — and check which player dominates which slam.",
    ],
    related: ["friend-requests-ii-who-has-the-most-friends", "count-salary-categories", "percentage-of-users-attended-a-contest"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-interview-candidates",
    statement:
      "A recruiting team scans a contest medal table for interview candidates. Users(user_id, mail, name) lists the participants; Contests(contest_id, gold_medal, silver_medal, bronze_medal) holds one row per contest, each medal column holding the user_id of that medal's winner. A user is a candidate when ANY of the following holds: they won gold in three or more consecutive contests (consecutive means adjacent in contest_id order); their career collection spans all three medal types — gold, silver and bronze, in any contests, in any order; or they won gold in two consecutive contests. Report the candidates' user_id, ordered ascending.",
    examples: [
      {
        input: "user 2 took gold in contests 191, 192, 193 and 194 — four in a row",
        output: "2",
        explanation:
          "A run of four consecutive golds clears the three-in-a-row bar (and the two-in-a-row bar with room to spare).",
      },
      {
        input: "user 3: gold 190, silvers 191-193, bronze 195 · user 4: golds 195 and 196, silver 190, bronze 194",
        output: "3 and 4 both qualify",
        explanation:
          "User 3 spans all three medal types across their career; user 4's adjacent golds form a two-run — and user 4's career silver and bronze quietly make him a trifecta candidate too.",
      },
    ],
    constraints: [
      "consecutiveness is adjacency in contest_id ORDER — not id arithmetic, which breaks if contest ids ever have gaps",
      "the three conditions are ORed: one is enough; conditions may overlap, and a user qualifying twice still prints once",
      "one column user_id, ordered ascending",
    ],
    breakdown: [
      "Both rule families read the same tall table, so unpivot first: a three-way UNION ALL over Contests projects (contest_id, user_id, medal) with medal in ('gold', 'silver', 'bronze'). Seven contest rows become twenty-one medal rows. Carrying contest_id through the unpivot matters — the streak rule needs the contest ORDER, which the medal type alone cannot supply. One CTE now feeds both rules: filtered to gold it powers the streak analysis, and grouped by user it powers the trifecta count.",
      "Consecutive golds are gaps-and-islands over contest order. Number every gold row by contest order globally — ROW_NUMBER() OVER (ORDER BY contest_id) — then renumber within each user — ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY contest_id). On an unbroken run the two numbers climb in lockstep, so their DIFFERENCE is constant; a break jumps it. GROUP BY user and difference with HAVING COUNT(*) >= 2 keeps every user holding a run of two or longer — which also subsumes the three-in-a-row rule, since any run of three contains a run of two. The spec lists both streak rules, the OR collapses to the pair, and writing it that way is fine.",
      "The trifecta is one grouped predicate: HAVING COUNT(DISTINCT medal) = 3 — exactly the three types, order-free. The two qualifying sets then merge with UNION (deduplication, not UNION ALL): user 4 qualifies TWICE over on this seed — a streak pair AND a career gold-silver-bronze — and must print once. Finally join back to Users: the medal columns hold user_ids that should exist as users, and the join guarantees the report names real participants. ORDER BY user_id finishes the contract.",
    ],
    edges: [
      "User 4 qualifies via two rules at once (golds 195-196, plus career silver 190 and bronze 194): the UNION between the sets is load-bearing — UNION ALL would print user 4 twice and fail the check.",
      "Consecutive means adjacent in contest_id ORDER: the row-number shape survives gapped contest ids, while contest_id arithmetic (next id = id + 1) would call contests 190 and 195 'consecutive' the day a contest is cancelled. The seed's gapless ids agree by luck.",
      "Silver-and-bronze careers never qualify alone: users 5, 6 and 8 stack silvers and bronzes (Walter holds three bronzes and a silver) but COUNT(DISTINCT medal) tops out at 2 — the trifecta needs all three types, and the streak rules need GOLD specifically.",
      "User 3's medals never co-occur on one row (gold 190, silvers 191-193, bronze 195): the trifecta is a CAREER property across rows — checking within a contest row would miss it entirely.",
    ],
    ladder: [
      { title: "Brute force — per-user scans in code", body: "Extract each user's gold contests, sort, scan for adjacent pairs; separately tally their medal types. Two hand-rolled passes per user that two GROUP BYs replace." },
      { title: "The pattern — unpivot, islands, trifecta, union", body: "One medal CTE; row-number differences detect the gold runs; COUNT(DISTINCT medal) = 3 finds the collectors; the sets merge and join back to Users." },
      { title: "The optimal idea — compute each rule as its own set", body: "O(m log m) for m medal rows — two window sorts dominate. Durable rule: an OR of structural conditions is clearest as one CTE per condition, each independently testable, merged at the end — the union IS the OR." },
    ],
    approach: "Unpivot medals tall, ROW_NUMBER islands for consecutive golds (run >= 2), COUNT(DISTINCT medal) = 3 for the trifecta, UNION the sets, join Users",
    schema: {
      ddl: `CREATE TABLE Users (
  user_id INTEGER PRIMARY KEY,
  mail    TEXT NOT NULL,
  name    TEXT NOT NULL
);
CREATE TABLE Contests (
  contest_id   INTEGER PRIMARY KEY,
  gold_medal   INTEGER NOT NULL,
  silver_medal INTEGER NOT NULL,
  bronze_medal INTEGER NOT NULL
);`,
      seed: `INSERT INTO Users (user_id, mail, name) VALUES
  (1, 'amy@relay.dev', 'Amy'),
  (2, 'sama@relay.dev', 'Sama'),
  (3, 'roy@relay.dev', 'Roy'),
  (4, 'john@relay.dev', 'John'),
  (5, 'ann@relay.dev', 'Ann'),
  (6, 'walter@relay.dev', 'Walter'),
  (7, 'richard@relay.dev', 'Richard'),
  (8, 'marie@relay.dev', 'Marie');
INSERT INTO Contests (contest_id, gold_medal, silver_medal, bronze_medal) VALUES
  (190, 3, 4, 7),
  (191, 2, 3, 6),  -- Sama's gold run starts here
  (192, 2, 3, 6),
  (193, 2, 3, 5),
  (194, 2, 5, 4),
  (195, 4, 5, 3),  -- John's back-to-back golds; Roy's bronze completes his trifecta
  (196, 4, 8, 1);`,
      tables: [
        { name: "Users", note: "8 participants — exactly three are candidates (2, 3, 4); user 4 qualifies under two rules at once" },
        { name: "Contests", note: "7 contests, ids 190-196 — Sama holds four consecutive golds, Roy collects all three medal types, John pairs golds in 195-196" },
      ],
    },
    code: `WITH medals AS (
    SELECT contest_id, gold_medal   AS user_id, 'gold'   AS medal FROM Contests
    UNION ALL
    SELECT contest_id, silver_medal AS user_id, 'silver' AS medal FROM Contests
    UNION ALL
    SELECT contest_id, bronze_medal AS user_id, 'bronze' AS medal FROM Contests
),
streak_users AS (
    SELECT DISTINCT user_id
    FROM (
        SELECT
            user_id,
            ROW_NUMBER() OVER (ORDER BY contest_id)                      AS rn_global,
            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY contest_id) AS rn_user
        FROM medals
        WHERE medal = 'gold'                 -- the streak rules are gold-only
    )
    GROUP BY user_id, rn_global - rn_user    -- constant while a run is unbroken
    HAVING COUNT(*) >= 2                     -- a run of 2+ (covers the 3+ rule too)
),
trifecta_users AS (
    SELECT user_id
    FROM medals
    GROUP BY user_id
    HAVING COUNT(DISTINCT medal) = 3         -- gold AND silver AND bronze, career-wide
)
SELECT u.user_id
FROM Users u
JOIN (
    SELECT user_id FROM streak_users
    UNION                                    -- user 4 hits both rules: print once
    SELECT user_id FROM trifecta_users
) q ON q.user_id = u.user_id
ORDER BY u.user_id;`,
    walkthrough: [
      "The unpivot turns 7 contests into 21 medal rows; the 7 gold rows, in contest order, carry users 3, 2, 2, 2, 2, 4, 4.",
      "Streak numbering: user 2's four golds get global numbers 2-5 and user numbers 1-4 — the difference stays 1, one island of four. User 4's golds get 6-7 and 1-2 — difference 5, an island of two. User 3's lone gold is an island of one. HAVING COUNT(*) >= 2 keeps users 2 and 4.",
      "The trifecta group-by finds two users with three distinct medal types: user 3 (gold 190, silvers 191-193, bronze 195) and user 4 (golds 195-196, silver 190, bronze 194).",
      "The union merges {2, 4} with {3, 4} into {2, 3, 4} — deduplicating user 4 — and the join to Users prints 2, 3, 4 in ascending order.",
    ],
    time: "O(m log m) for m medal rows — the two window sorts dominate",
    space: "O(m) — the unpivoted medal table",
    followUps: [
      "Replace the bare OR with a report of WHY each candidate qualifies — one row per (user, rule) pair via a rule label carried through each CTE — and decide how a two-rule candidate like user 4 should be counted per rule.",
      "Generalize the streak to 'gold in 2 of any 3 consecutive contests' — where does the islands shape break, and what window-frame or self-join takes over?",
    ],
    related: ["consecutive-available-seats", "active-users", "customers-who-bought-a-and-b-not-c"],
    order: "exact",
    xp: 20,
  },
];
