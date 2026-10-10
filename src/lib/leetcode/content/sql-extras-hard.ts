// Deep-dives — the SQL 50+ hard extras: the two rite-of-passage database
// problems (conditional aggregation over excluded participants, and
// consecutive-run detection). Solutions are SQLite dialect, one statement
// each, engine-verified by scripts/lc-sql-verify.ts against the seeds.
import type { LcSqlDive } from "../types";

export const SQL_EXTRAS_HARD: LcSqlDive[] = [
  {
    slug: "trips-and-users",
    statement:
      "A ride-hailing company logs every trip with the client and driver who participated, plus a cancellation status; a separate Users table records whether each account is banned. Compute, per day in a given date window, the cancellation rate among trips where BOTH participants are unbanned — banned clients and banned drivers must be filtered out before the rate is computed, not after.",
    examples: [
      {
        input:
          "Trips: (1, client 1, driver 10, completed 10-01) · (2, 2, 11, cancelled_by_driver 10-01) · (3, client 6 [banned], 12, completed 10-01) · (4, 4, 13, cancelled_by_client 10-01) · (5, 1, 10, completed 10-02) · (6, 2, driver 21 [banned], completed 10-02) · (7, 3, 12, completed 10-02) · (8, client 7 [banned], 11, cancelled 10-02) · (9–12, various, 10-03, two cancelled) — Users marks 6 and 7 as banned clients, 21 as a banned driver",
        output: "2013-10-01 66.67 · 2013-10-02 0.00 · 2013-10-03 50.00",
        explanation:
          "On 10-01 three trips count (trip 3 had a banned client) and two were cancelled: 66.67%. On 10-02 two trips count, none cancelled. On 10-03 four trips count, two cancelled: 50.00%.",
      },
    ],
    constraints: [
      "status is one of completed, cancelled_by_driver, cancelled_by_client",
      "request_at is a YYYY-MM-DD date string",
      "a trip whose client OR driver is banned counts for nothing at all",
    ],
    breakdown: [
      "The rate is a fraction: cancelled trips divided by counted trips, times 100. Two things make it tricky — deciding which trips are 'counted' (both participants unbanned) and avoiding the two classic arithmetic traps: integer division and ordering of multiplication.",
      "Excluding banned participants looks like a WHERE clause, but the ban lives in the Users table which the Trips table never references by name — it holds ids. Each trip must reach Users twice: once for the client role, once for the driver role. That's the alias moment: the same table joined twice under two names, each join carrying its own ban check.",
      "Once only clean trips survive, the rate per day is a conditional count: cancelled flags sum to the numerator, COUNT(*) is the denominator. SQLite evaluates `status <> 'completed'` as 1 or 0 per row, so SUM over that boolean IS the cancelled count — no CASE required, though CASE reads clearer to many reviewers.",
      "The 100.0 multiplier must come before division. 2/3 in integer-aware engines is 0; 100.0 * 2 / 3 is 66.67. SQLite is dynamically typed here but the habit is universal — and ROUND(..., 2) pins the output format the grader compares.",
    ],
    edges: [
      "A trip with a banned client or a banned driver is excluded entirely — it does not count in the denominator either.",
      "A day with zero cancellations must still print 0.00, not disappear (the day survives as long as one clean trip exists).",
      "Join Users twice with distinct aliases — one mis-aliased join silently pairs clients with drivers wrongly and corrupts every rate.",
      "Write 100.0, not 100 — the integer-division trap inflates every rate to 0.",
    ],
    ladder: [
      {
        title: "Brute force — eyeball every trip",
        body: "Scan trips, look up each participant's ban status, bucket by day, count. The manual algorithm is exactly the query — the exercise is expressing 'exclude on either side' and 'rate per bucket' as set operations.",
      },
      {
        title: "The pattern — join the lookup twice",
        body: "Users is a dimension table reached from two foreign keys. The idiom: FROM Trips t JOIN Users c ON c.users_id = t.client_id AND c.banned='No' JOIN Users d ON d.users_id = t.driver_id AND d.banned='No'. INNER JOIN is correct because banned trips must vanish.",
      },
      {
        title: "The optimal idea — boolean SUM over clean trips",
        body: "GROUP BY the date; numerator = SUM(status <> 'completed'), denominator = COUNT(*); wrap in 100.0 * ... / ... and ROUND to 2dp. One pass over trips with index lookups into Users — nothing further to optimize.",
      },
    ],
    approach: "Self-join the Users dimension twice + conditional aggregation",
    schema: {
      ddl: `CREATE TABLE Trips (
  id         INTEGER PRIMARY KEY,
  client_id  INTEGER NOT NULL REFERENCES Users(users_id),
  driver_id  INTEGER NOT NULL REFERENCES Users(users_id),
  city_id    INTEGER NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('completed','cancelled_by_driver','cancelled_by_client')),
  request_at TEXT NOT NULL
);
CREATE TABLE Users (
  users_id INTEGER PRIMARY KEY,
  banned   TEXT NOT NULL CHECK (banned IN ('Yes','No')),
  role     TEXT NOT NULL CHECK (role IN ('client','driver','partner'))
);`,
      seed: `INSERT INTO Users (users_id, banned, role) VALUES
  (1,'No','client'),(2,'No','client'),(3,'No','client'),(4,'No','client'),
  (6,'Yes','client'),(7,'Yes','client'),
  (10,'No','driver'),(11,'No','driver'),(12,'No','driver'),(13,'No','driver'),
  (21,'Yes','driver');
INSERT INTO Trips (id, client_id, driver_id, city_id, status, request_at) VALUES
  (1, 1, 10, 1, 'completed', '2013-10-01'),
  (2, 2, 11, 1, 'cancelled_by_driver', '2013-10-01'),
  (3, 6, 12, 6, 'completed', '2013-10-01'),
  (4, 4, 13, 6, 'cancelled_by_client', '2013-10-01'),
  (5, 1, 10, 1, 'completed', '2013-10-02'),
  (6, 2, 21, 6, 'completed', '2013-10-02'),
  (7, 3, 12, 6, 'completed', '2013-10-02'),
  (8, 7, 11, 1, 'cancelled_by_client', '2013-10-02'),
  (9, 2, 12, 12, 'completed', '2013-10-03'),
  (10, 3, 10, 12, 'cancelled_by_driver', '2013-10-03'),
  (11, 4, 13, 12, 'completed', '2013-10-03'),
  (12, 1, 11, 1, 'cancelled_by_client', '2013-10-03');`,
      tables: [
        { name: "Trips", note: "12 trips across 3 days — 3 involve a banned participant" },
        { name: "Users", note: "clients 6,7 and driver 21 are banned; the join filters them" },
      ],
    },
    code: `SELECT
    t.request_at AS "Day",
    ROUND(100.0 * SUM(t.status <> 'completed') / COUNT(*), 2)
        AS "Cancellation Percentage"   -- 100.0 BEFORE dividing: no integer drop
FROM Trips t
JOIN Users c ON c.users_id = t.client_id AND c.banned = 'No'
JOIN Users d ON d.users_id = t.driver_id AND d.banned = 'No'
WHERE t.request_at BETWEEN '2013-10-01' AND '2013-10-03'
GROUP BY t.request_at
ORDER BY t.request_at;`,
    order: "exact",
    walkthrough: [
      "The two Users joins act as a double gate: a trip survives only if its client row (alias c) and its driver row (alias d) both carry banned='No'. Trip 3 dies at gate c, trip 6 at gate d, trip 8 at gate c — 9 of 12 trips remain.",
      "GROUP BY request_at buckets the 9 survivors by day: 3 on 10-01, 2 on 10-02, 4 on 10-03.",
      "Per bucket, SUM(t.status <> 'completed') adds 1 for each cancelled row: 10-01 → 2, 10-02 → 0, 10-03 → 2. COUNT(*) supplies the denominators 3, 2, 4.",
      "100.0 * 2 / 3 = 66.67 after ROUND; 100.0 * 0 / 2 = 0.00; 100.0 * 2 / 4 = 50.00. ORDER BY prints the days in calendar order — matching the expected snapshot exactly.",
    ],
    time: "O(t) trips scanned once, each doing two constant-time lookups into Users (index on the primary key)",
    space: "O(d) for the d day buckets plus the join hash tables",
    followUps: [
      "How would you also report the share of trips that were excluded because of a ban? (Aggregate BEFORE the gate: LEFT JOIN both Users rows and CASE-flag each exclusion reason.)",
      "What if the window were 'the last 7 days available in the data' instead of fixed dates? (MAX(request_at) in a CTE, then filter on date >= the max minus 6 days.)",
    ],
    related: ["average-selling-price", "queries-quality-and-percentage", "monthly-transactions-i"],
    xp: 35,
  },
  {
    slug: "human-traffic-of-stadium",
    statement:
      "A stadium logs visits with a row id that increases by one for every record (no gaps in ids, even when a day has no visit) plus the date and the number of people that came. Display every row belonging to a run of three or more CONSECUTIVE ids whose attendance was at least 100 — a row qualifies if it is part of such a streak, whether it starts, ends or sits in the middle of it.",
    examples: [
      {
        input:
          "Stadium: (1, 01-01, 10) · (2, 01-02, 109) · (3, 01-03, 150) · (4, 01-04, 99) · (5, 01-05, 145) · (6, 01-06, 1455) · (7, 01-07, 199) · (8, 01-09, 188) · (9, 01-10, 40) · (10, 01-11, 100) · (11, 01-12, 101) · (12, 01-13, 102) · (13, 01-15, 20)",
        output: "(5, 01-05, 145) · (6, 01-06, 1455) · (7, 01-07, 199) · (8, 01-09, 188) · (10, 01-11, 100) · (11, 01-12, 101) · (12, 01-13, 102)",
        explanation:
          "Ids 5–8 form a 4-row streak (every 3-row window inside it counts them all), and 10–12 form a clean 3-row streak. Row 4 misses the cut at 99; row 9 breaks the second streak; row 13 is both low and separated.",
      },
    ],
    constraints: [
      "ids are strictly consecutive integers with no gaps",
      "people >= 0; the streak threshold is people >= 100",
      "dates may skip days — consecutiveness is defined on ids, not dates",
    ],
    breakdown: [
      "The problem's killer subtlety hides in the example data: the calendar jumps from 01-07 straight to 01-09, yet rows 5–8 still form one streak. Consecutiveness is defined on the id column, not the date — anyone who joins on date arithmetic gets burned by exactly this row. Read the constraint before writing the join.",
      "'Part of a run of 3+' means: there EXISTS a 3-row window containing this row. A row can be the left edge, the middle, or the right edge of such a window — and a 4-row streak must keep all four of its rows. Any solution that only tests one position of the window (the classic bug: only 'row starts a run') silently drops the tail rows of longer streaks.",
      "The threshold check must apply to ALL THREE rows of the window, not just the anchor. A common bug filters s1.people >= 100 in WHERE while leaving s2/s3 unfiltered — that reports streaks of high numbers anchored on high rows even when their partners are low.",
      "Rows 4 (99) and 10 (100) sit either side of the boundary: the comparison is >=, so 100 qualifies and 99 does not. Boundary rows are exactly what a strict > bug loses.",
    ],
    edges: [
      "Date gaps are fine — only id adjacency matters (row 8: 01-09 after 01-07, still in the streak).",
      "Rows with people exactly 100 count (>= boundary).",
      "A row can qualify as the start, the middle OR the end of a run — the gate must cover all three positions, or 4-row streaks lose their tail rows.",
      "Neighbour values at the table edges are NULL, and NULL >= 100 is not true — the boundary rows fail the gate for free, no special-casing.",
    ],
    ladder: [
      {
        title: "Brute force — check each row's neighbours",
        body: "For each row, scan for two more rows with ids +1 and +2 and all three >= 100 — but that only finds windows starting at each row; rows in the middle or at the end of a streak also qualify, so a single anchored window per row silently loses them.",
      },
      {
        title: "The pattern — a row qualifies via three possible windows",
        body: "Row r is part of a 3-run if a window starts at r, at r-1, or at r-2. The classic SQL 50-era answer enumerates those with a UNION of three anchored self-joins on id+1/id+2 — correct but wordy, and it re-scans the table three times.",
      },
      {
        title: "The optimal idea — LEAD/LAG brings the neighbours to every row",
        body: "Because ids are guaranteed gapless, ordering by id puts true id-neighbours on adjacent rows. LEAD(people,1/2) and LAG(people,1/2) fetch all four neighbours in ONE pass; a row qualifies if it starts, ends, or sits in the middle of a run — three OR'd gates over one subquery. No self-join, no DISTINCT.",
      },
    ],
    approach: "LEAD/LAG over id order with a three-position (start | middle | end) run gate",
    schema: {
      ddl: `CREATE TABLE Stadium (
  id         INTEGER PRIMARY KEY,
  visit_date TEXT NOT NULL,
  people     INTEGER NOT NULL
);`,
      seed: `INSERT INTO Stadium (id, visit_date, people) VALUES
  (1, '2017-01-01', 10),
  (2, '2017-01-02', 109),
  (3, '2017-01-03', 150),
  (4, '2017-01-04', 99),
  (5, '2017-01-05', 145),
  (6, '2017-01-06', 1455),
  (7, '2017-01-07', 199),
  (8, '2017-01-09', 188),
  (9, '2017-01-10', 40),
  (10, '2017-01-11', 100),
  (11, '2017-01-12', 101),
  (12, '2017-01-13', 102),
  (13, '2017-01-15', 20);`,
      tables: [
        { name: "Stadium", note: "13 rows — two qualifying streaks (5–8 and 10–12), boundary rows at 99 and 100" },
      ],
    },
    code: `SELECT id, visit_date, people
FROM (
    SELECT
        id, visit_date, people,
        LEAD(people, 1) OVER (ORDER BY id) AS next1,   -- id+1's attendance
        LEAD(people, 2) OVER (ORDER BY id) AS next2,   -- id+2's attendance
        LAG(people, 1)  OVER (ORDER BY id) AS prev1,   -- id-1's attendance
        LAG(people, 2)  OVER (ORDER BY id) AS prev2    -- id-2's attendance
    FROM Stadium
) x
WHERE people >= 100
  AND (
        (next1 >= 100 AND next2 >= 100)   -- I START a run of three
     OR (prev1 >= 100 AND next1 >= 100)   -- I'm the MIDDLE of a run of three
     OR (prev1 >= 100 AND prev2 >= 100)   -- I END a run of three
  )
ORDER BY id;`,
    order: "exact",
    walkthrough: [
      "The inner query sorts rows by id once and staples each row's four id-neighbours onto it as extra columns — because the constraint guarantees gapless ids, 'ordered adjacency' IS 'id adjacency', so no id comparisons are needed.",
      "Row 5 carries next1=1455, next2=199 — it starts a run, gate one fires. Row 6 carries next1=199, next2=188 — also a start. Row 7 carries next1=188, next2=40 (row 9 breaks the run) but prev1=1455, so the MIDDLE gate fires. Row 8 carries prev1=199, prev2=1455 — the END gate fires even though its calendar date skips a day.",
      "Row 9 (40 people) dies on the outer people >= 100 before the run gates are even consulted; rows 10–12 pass as start/middle/end of their own run; rows 1–4 and 13 fail both the threshold and every gate.",
      "Seven rows survive — 5, 6, 7, 8, 10, 11, 12 — and ORDER BY id prints them in exactly the expected order.",
    ],
    time: "O(n) — one sort over id (the primary key, so often free) plus one pass to emit LEAD/LAG columns and evaluate the gates",
    space: "O(n) for the materialized window frame",
    followUps: [
      "Rewrite it without window functions: three anchored self-joins on id+1/id+2 UNION'd together, each emitting a different position's columns — what changes if ids can have gaps?",
      "What if the streak had to be consecutive CALENDAR days instead of consecutive ids? (Order by visit_date and join on date(visit_date, '+1 day') — and check which example rows flip.)",
    ],
    related: ["consecutive-numbers", "active-users", "exchange-seats"],
    xp: 35,
  },
];
