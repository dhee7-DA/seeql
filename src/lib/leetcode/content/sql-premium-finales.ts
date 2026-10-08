// Deep-dives — LeetCode Premium batch I: the hard finales (7 problems, all Hard / 35 xp). Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM_FINALES: LcSqlDive[] = [
  {
    slug: "trips-and-users",
    statement:
      "A ride-hailing platform logs every trip in Rides — who rode, who drove, in which city, how it ended ('completed', 'cancelled_by_driver' or 'cancelled_by_client') and on which request day — and keeps every account in People with a banned flag and a role. Compute the daily cancellation rate over the rides whose rider AND driver are both unbanned: for each request day, divide the number of in-scope rides that ended in either cancellation kind by the total number of in-scope rides that day, rounded to 2 decimals. Rides touching a banned participant vanish from both sides of the fraction. Every date in the report window has at least one in-scope ride, so no empty-day fill is needed. Output columns: request_day, cancellation_rate, ordered by request_day ascending.",
    examples: [
      {
        input:
          "2024-10-01: ride 1 (Ada → Dex) completed · ride 2 (Bram → Elin) cancelled_by_driver · ride 3 (Cleo, banned rider → Dex) cancelled_by_client",
        output: "(2024-10-01, 0.5)",
        explanation:
          "Cleo's ride is out of scope on BOTH sides of the fraction — the day's population is rides 1-2, of which ride 2 cancelled: 1/2 = 0.5. Keeping her would fake 1/3.",
      },
      {
        input:
          "2024-10-02: ride 4 completed · ride 5 (Bram → Fenn, banned driver) cancelled_by_client · ride 6 cancelled_by_driver · ride 7 completed",
        output: "(2024-10-02, 0.33)",
        explanation:
          "Fenn's ban removes ride 5 entirely; the remaining three rides hold one cancellation → ROUND(1/3, 2) = 0.33 — and integer 1/3 would have evaluated to 0 without the real-track division.",
      },
    ],
    constraints: [
      "a ride is in scope only when its rider AND its driver are both unbanned — a banned participant removes the ride from numerator and denominator alike",
      "cancelled means either cancellation kind: 'cancelled_by_driver' or 'cancelled_by_client'; 'completed' is the only in-scope success state",
      "every date in the report window has at least one in-scope ride (no empty-day zero-fill required); output columns: request_day, cancellation_rate, ordered by request_day ascending, rate rounded to 2 decimals",
    ],
    breakdown: [
      "The report's population is defined by a two-sided rule, and a two-sided rule needs two joins. A ride is in scope only when its rider is unbanned AND its driver is unbanned, so Rides is joined to People twice — once on rider_id, once on driver_id — with each alias carrying its own banned = 'No' directly in the ON clause. Filtering one side only silently corrupts the fraction: ride 3 (rider Cleo, banned) and ride 5 (driver Fenn, banned) must vanish from the denominator as well as the numerator, because the metric is the cancellation experience of rides among clean accounts. The seed is built so every half-fix is visible: keep the banned rider and 10-01's rate reads 1/3 instead of 1/2; keep the banned driver and 10-02's reads 1/4 instead of 1/3.",
      "With the population fixed, the rate is a one-pass conditional aggregation. SUM(CASE WHEN status IN ('cancelled_by_driver', 'cancelled_by_client') THEN 1 ELSE 0 END) counts each day's cancelled in-scope rides, COUNT(*) counts the day's total, and GROUP BY request_at collapses the calendar — numerator and denominator come from the same scan of the same rows. Naming both cancellation kinds explicitly beats a status != 'completed' shortcut: 'completed' is the only non-cancelled state today, but spelling the pair out keeps the query honest the day a third terminal status appears. The GROUP BY needs no date surgery either — request_at already carries day granularity, so the raw string groups cleanly.",
      "Two arithmetic landmines sit between a correct plan and a correct number. SQLite divides integers as integers — cancelled / total with both sides INTEGER turns 1/3 into 0 — so the numerator is pushed onto the real track with * 1.0 before the division. The contract's two decimals are applied exactly once, at the outermost level: ROUND(..., 2) turns 0.3333… into 0.33 and leaves 0.5 and 0.0 untouched. And the report window needs no zero-fill: every date in the window holds at least one in-scope ride on this seed — the statement's premise says so — because a day whose only rides involve banned users would legitimately be absent from a rate about clean rides.",
    ],
    edges: [
      "The banned filter must live on BOTH joins — ride 3 (banned rider Cleo) and ride 5 (banned driver Fenn) leave the denominator too, not just the numerator; a one-sided filter inflates the rate.",
      "Integer division: SUM(CASE ...) * 1.0 / COUNT(*) — plain 1/3 in SQLite is 0, and every rate in the report would collapse to 0.0 or 1.0.",
      "Both cancellation kinds count as cancelled — status IN ('cancelled_by_driver', 'cancelled_by_client'); a status != 'completed' shortcut works today but changes meaning the day a third non-completed status appears.",
      "No zero-division guard is needed on this seed — every report-window day has at least one in-scope ride by premise; a NULLIF guard would mask a genuinely empty day instead of surfacing it.",
    ],
    ladder: [
      {
        title: "Brute force — three passes by hand",
        body: "Pull the day list, then per day run two counts (all unbanned rides, cancelled unbanned rides) and divide in host code. Works, but it is N+1 queries, and the banned-on-both-sides rule lives in application memory instead of the data.",
      },
      {
        title: "The pattern — two People aliases, filter in the ON",
        body: "Join People once per endpoint with banned = 'No' in each ON clause, GROUP BY request_at, and let conditional aggregation produce numerator and denominator from the same filtered pass.",
      },
      {
        title: "The optimal idea — one statement, one scan",
        body: "Filtered two-alias join → GROUP BY day → SUM(CASE)/COUNT(*) on a real-track division with a single outer ROUND. O(R) — one pass over rides plus two primary-key lookups per ride.",
      },
    ],
    approach:
      "Two People aliases filter both endpoints (banned = 'No' in each ON), then GROUP BY day with SUM(CASE cancelled) * 1.0 / COUNT(*) and one outer ROUND(..., 2)",
    schema: {
      ddl: `CREATE TABLE People (
  person_id INTEGER PRIMARY KEY,
  banned    TEXT NOT NULL CHECK (banned IN ('Yes', 'No')),
  role      TEXT NOT NULL CHECK (role IN ('rider', 'driver', 'partner'))
);
CREATE TABLE Rides (
  ride_id    INTEGER PRIMARY KEY,
  rider_id   INTEGER NOT NULL,
  driver_id  INTEGER NOT NULL,
  city_id    INTEGER NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('completed', 'cancelled_by_driver', 'cancelled_by_client')),
  request_at TEXT NOT NULL
);`,
      seed: `INSERT INTO People (person_id, banned, role) VALUES
  (1, 'No',  'rider'),    -- Ada, active rider
  (2, 'No',  'rider'),    -- Bram, active rider
  (3, 'Yes', 'rider'),    -- Cleo, BANNED rider
  (4, 'No',  'driver'),   -- Dex, active driver
  (5, 'No',  'driver'),   -- Elin, active driver
  (6, 'Yes', 'driver'),   -- Fenn, BANNED driver
  -- Gus: a partner, neither rider nor driver — never appears in Rides
  (7, 'No',  'partner');
INSERT INTO Rides (ride_id, rider_id, driver_id, city_id, status, request_at) VALUES
  (1, 1, 4, 31, 'completed',           '2024-10-01'),
  (2, 2, 5, 31, 'cancelled_by_driver', '2024-10-01'),
  (3, 3, 4, 31, 'cancelled_by_client', '2024-10-01'),  -- banned rider Cleo: excluded from BOTH sides
  (4, 1, 5, 42, 'completed',           '2024-10-02'),
  (5, 2, 6, 42, 'cancelled_by_client', '2024-10-02'),  -- banned driver Fenn: excluded from BOTH sides
  (6, 1, 4, 42, 'cancelled_by_driver', '2024-10-02'),
  (7, 2, 5, 42, 'completed',           '2024-10-02'),
  (8, 2, 4, 17, 'completed',           '2024-10-03'),
  (9, 1, 5, 17, 'completed',           '2024-10-03'),
  (10, 3, 6, 17, 'completed',          '2024-10-03');`,
      tables: [
        {
          name: "People",
          note: "7 accounts — riders Ada/Bram/Cleo(banned), drivers Dex/Elin/Fenn(banned), partner Gus who never books",
        },
        {
          name: "Rides",
          note: "10 rides across 2024-10-01..03; ride 3 has a banned rider, ride 5 a banned driver, ride 10 both banned — all three must vanish from numerator AND denominator",
        },
      ],
    },
    code: `WITH unbanned AS (
    SELECT
        r.request_at,
        r.status
    FROM Rides r
    JOIN People rd ON rd.person_id = r.rider_id   -- alias 1: the rider's side
                  AND rd.banned = 'No'            -- a banned rider kills the ride
    JOIN People dr ON dr.person_id = r.driver_id  -- alias 2: the driver's side
                  AND dr.banned = 'No'            -- a banned driver kills it too
)
SELECT
    request_at AS request_day,
    ROUND(
        SUM(CASE WHEN status IN ('cancelled_by_driver', 'cancelled_by_client')
                 THEN 1 ELSE 0 END) * 1.0 / COUNT(*),
        2
    ) AS cancellation_rate                        -- * 1.0 forces real division (1/3 = 0 otherwise!)
FROM unbanned
GROUP BY request_at
ORDER BY request_at ASC;`,
    walkthrough: [
      "The two People joins filter first: ride 3 (Cleo, banned rider), ride 5 (Fenn, banned driver) and ride 10 (both banned) never reach unbanned — 10-01 carries rides 1-2, 10-02 carries rides 4, 6, 7, and 10-03 carries rides 8-9.",
      "GROUP BY request_at then scores each day from the survivors: 10-01 → 1 cancelled of 2 → 1.0/2 = 0.5; 10-02 → ride 6 cancelled of 3 → 1.0/3 = 0.33; 10-03 → 0 of 2 → 0.0.",
      "ROUND(..., 2) stamps two decimals and ORDER BY request_at ASC hands back the report in calendar order: (2024-10-01, 0.5), (2024-10-02, 0.33), (2024-10-03, 0.0).",
    ],
    time: "O(R) — one scan of Rides with two primary-key lookups per row into People, then a group per distinct day",
    space: "O(D) — one aggregated row per distinct request day",
    followUps: [
      "Split the rate by city — add city_id to the GROUP BY and watch 2024-10-02 decompose; the banned filter must stay at join level, never move into the aggregate.",
      "Report the completed share alongside the cancellation rate — a second conditional SUM over the same groups, no extra scan.",
    ],
    related: ["user-purchase-platform", "transactions-per-visit-histogram", "count-salary-categories"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "median-employee-salary",
    statement:
      "EmployeePay stacks payroll rows for several companies — each row one (company, salary) pair. Report each company's MEDIAN salary the way statisticians count employees: with an odd head-count, the single middle salary; with an even head-count, BOTH middle salaries, printed as rows — do not average them. Duplicate salaries are legitimate rows and occupy their own positions. Output columns: company, salary, ordered by company ascending, then salary ascending.",
    examples: [
      {
        input: "company A holds salaries 12000, 18000, 18000, 25000, 40000 (5 rows — odd)",
        output: "('A', 18000)",
        explanation:
          "Five rows sort to one middle — the 3rd — which is 18000; the duplicated 18000 changes nothing because the row-based median counts positions, not distinct values.",
      },
      {
        input: "company B holds salaries 22000, 26000, 30000, 34000 (4 rows — even)",
        output: "('B', 26000) ('B', 30000)",
        explanation:
          "Both middle salaries are reported as two rows; averaging them to 28000 answers a different question — and for company C (15000, 41000) it would name a salary nobody earns.",
      },
    ],
    constraints: [
      "odd head-count → exactly one median row per company; even head-count → exactly two, both middle rows verbatim",
      "duplicate salaries are legitimate rows — the median works on row positions, never on DISTINCT values",
      "output columns: company, salary, ordered by company ascending then salary ascending",
    ],
    breakdown: [
      "The defining mistake is reaching for AVG. Averaging the two middle salaries answers the numeric-median convention, but this report asks for employees: with an even head-count the answer is the two middle ROWS, printed verbatim — 26000 and 30000 for company B, and for company C a 28000 average would name a salary nobody earns. So the task is row selection, not arithmetic: per company, pick the row or rows occupying the middle position. Position-talk is the tell that window functions, not aggregates, are the right tool. The seed's company C — just 15000 and 41000 — makes the averaging bug impossible to miss, since its 'average' matches nobody.",
      "The selection key is a two-sided rank coincidence. Two ROW_NUMBER windows over the same PARTITION BY company — one ascending, one descending — stamp every salary with rn_asc and rn_desc, and COUNT(*) OVER (PARTITION BY company) carries the company size n alongside. A row is a median exactly when BOTH ranks fall in the integer window [n/2, n/2 + 1]: for odd n the two rankings meet only at the exact middle (company A, n = 5: only rn_asc 3 with rn_desc 3 survives), while for even n the two central rows each satisfy one of the two combinations (company B, n = 4: rn_asc 2 with rn_desc 3, and rn_asc 3 with rn_desc 2). One predicate covers both parities — no CASE on n % 2, no branch, no second query.",
      "Duplicates are the stress test, and company A's pair of 18000s is planted for it. Tied salaries are indistinguishable to ORDER BY, so SQLite may assign their ascending ranks 2 and 3 in either physical order — but the survivor set is stable, because whichever row takes rn_asc 2 gets rn_desc 3 (in range) and its twin gets rn_desc 4 (out): exactly one 18000 row prints either way. Tied rows project identical salaries, so the OUTPUT is deterministic even where the engine's internal tie-break is not — a rare case where row-number nondeterminism is provably harmless. The closing ORDER BY company, salary then presents the survivors in the contract's order.",
    ],
    edges: [
      "AVG of the two middles is the wrong output shape — the contract wants rows: B reports 26000 AND 30000; C reports 15000 AND 41000, neither of which any average would produce.",
      "The [n/2, n/2+1] double-window test covers both parities — odd n keeps only the exact middle, even n keeps exactly the two central rows; no CASE on evenness required.",
      "SQLite integer division is load-bearing: n/2 must stay INTEGER (5/2 = 2, 4/2 = 2) — writing n/2.0 shifts the interval and breaks the odd case.",
      "Do NOT rank DISTINCT salaries — company A's duplicated 18000 would compress every position and misplace the middle; rank rows, and let tied rows project identical values.",
    ],
    ladder: [
      {
        title: "Brute force — per company, by hand",
        body: "Pull each company's sorted salaries into the host language and index the middle by hand, branching on odd/even. Correct, but one query per company and the parity branch lives in code.",
      },
      {
        title: "The pattern — rank from both directions",
        body: "Two ROW_NUMBER windows (ascending and descending) plus COUNT(*) OVER (PARTITION BY company) put position and size on every row — the median becomes a WHERE clause, not a procedure.",
      },
      {
        title: "The optimal idea — one two-sided interval test",
        body: "One ranked CTE and one predicate: rn_asc AND rn_desc both within [n/2, n/2+1] selects the middle row (odd) or both central rows (even) in a single pass. O(n log n) for the window sorts.",
      },
    ],
    approach:
      "ROW_NUMBER ascending + descending + COUNT(*) OVER (PARTITION BY company); a salary is a median when both ranks fall in [n/2, n/2 + 1]",
    schema: {
      ddl: `CREATE TABLE EmployeePay (
  emp_row_id INTEGER PRIMARY KEY,
  company    TEXT NOT NULL,
  salary     INTEGER NOT NULL CHECK (salary > 0)
);`,
      seed: `INSERT INTO EmployeePay (emp_row_id, company, salary) VALUES
  (1, 'A', 12000),
  (2, 'A', 18000),  -- duplicate of row 3: the tie the row-based median must survive
  (3, 'A', 18000),
  (4, 'A', 25000),
  (5, 'A', 40000),
  (6, 'B', 22000),
  (7, 'B', 26000),
  (8, 'B', 30000),
  (9, 'B', 34000),
  (10, 'C', 15000),
  (11, 'C', 41000);`,
      tables: [
        {
          name: "EmployeePay",
          note: "11 rows — company A: 5 salaries (odd → one median, including a duplicated 18000), B: 4 (even → two middles), C: 2 (even → both rows)",
        },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        company,
        salary,
        ROW_NUMBER() OVER (PARTITION BY company ORDER BY salary ASC)  AS rn_asc,
        ROW_NUMBER() OVER (PARTITION BY company ORDER BY salary DESC) AS rn_desc,
        COUNT(*)     OVER (PARTITION BY company)                      AS n
    FROM EmployeePay
)
SELECT company, salary
FROM ranked
WHERE rn_asc  BETWEEN n / 2 AND n / 2 + 1   -- SQLite integer division: 5/2 = 2, 4/2 = 2
  AND rn_desc BETWEEN n / 2 AND n / 2 + 1   -- both ranks in the middle window → median row(s)
ORDER BY company ASC, salary ASC;`,
    walkthrough: [
      "ranked stamps each row with its position from both directions and its company's size: A's rows carry n = 5 (ranks 1..5 up, 5..1 down), B's n = 4, C's n = 2.",
      "The interval test [n/2, n/2+1] = [2, 3] keeps exactly one 18000 in A (its duplicate lands on rn_desc 4 and drops); in B it keeps rn_asc 2/3 with rn_desc 3/2 — 26000 and 30000; in C ([1, 2]) both 15000 and 41000 survive.",
      "The outer SELECT projects company, salary and orders them: ('A', 18000), ('B', 26000), ('B', 30000), ('C', 15000), ('C', 41000).",
    ],
    time: "O(n log n) — two sorted window passes and one partition count over n payroll rows",
    space: "O(n) — the ranked CTE carries every row's two ranks and its company size",
    followUps: [
      "Add the averaged numeric median alongside the rows: a sibling CTE running AVG over the same rn filter — and note where the two conventions disagree (every even company here).",
      "Rank companies by their median salary: a third DENSE_RANK window over the final rows turns the report into a league table.",
    ],
    related: ["second-highest-salary", "department-highest-salary", "rank-scores"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "find-the-median",
    statement:
      "NumStream is an unordered pile of numbers — one val per row, duplicates allowed, insertion order meaningless. Compute the GLOBAL median of the whole stream with the classic numeric convention: with an odd count, the single middle value; with an even count, the AVERAGE of the two middle values. Output column: median (rounded to 4 decimals), exactly one row.",
    examples: [
      {
        input: "stream values as inserted: 9, 2, 6, 3, 6, 4 — six numbers",
        output: "(5)",
        explanation:
          "Sorted: 2, 3, 4, 6, 6, 9 — the middle pair is 4 and 6 (positions 3 and 4), and the numeric median is their average, 5. The duplicate 6 and the shuffled insertion order change nothing: only the sort matters.",
      },
      {
        input: "the same stream with one more row, val 8 — seven numbers",
        output: "(6)",
        explanation:
          "Sorted: 2, 3, 4, 6, 6, 8, 9 — odd count, one middle at position 4: 6. No averaging happens; the parity behavior is baked into the position arithmetic.",
      },
    ],
    constraints: [
      "the median is over the ENTIRE stream — no grouping, no partitioning",
      "odd count → the middle value verbatim; even count → the mean of the two middle values",
      "output column: median, one single row, rounded to 4 decimals",
    ],
    breakdown: [
      "ORDER BY val LIMIT 1 OFFSET n/2 is the reflex, and it is brittle in two ways at once. With an even count the median is TWO rows, so a LIMIT 1 grab returns one of the middles and silently skips the averaging; the offset arithmetic also branches on parity (0-indexed n/2 for odd, n/2 − 1 for even), and every branch is a chance to be off by one. Worse, the count must be fetched first — a second query or a host-side round trip — so the 'simple' version is really two queries and a conditional. Brittleness that only shows up on even-sized streams is the worst kind: it passes every odd-sized smoke test.",
      "The window-function shape does the whole job in one statement. ROW_NUMBER() OVER (ORDER BY val) numbers every row after the sort, and COUNT(*) OVER () carries the stream size onto every row with it. The middle positions then fall out of integer arithmetic that needs no parity branch: positions (n + 1)/2 and n/2 + 1 — for odd n both expressions land on the same row (n = 5: 3 and 3), for even n they bracket the central pair (n = 6: 3 and 4). SQLite's integer division is the feature here, not a hazard: 5/2 = 2, so n/2 + 1 = 3 hits the exact middle of a five-row stream.",
      "Selecting the middle row(s) and averaging collapses the parity branch into arithmetic. AVG over a one-row set is that row verbatim — the odd case — and AVG over the two-row set is the numeric median — the even case. This seed sorts to 2, 3, 4, 6, 6, 9: positions 3 and 4 hold 4 and 6, and AVG returns exactly 5.0, so ROUND(..., 4) changes nothing and the single output row is (5). The duplicate 6 rides through untouched, because ROW_NUMBER numbers rows rather than distinct values — position 4 holds a 6 no matter which physical 6 lands there.",
    ],
    edges: [
      "AVG over the middle CTE, not over the stream — AVG(val) without the rn filter returns 5.0 here only by luck of symmetric seed data; shift one value and the unfiltered average drifts far from the median.",
      "The two-position IN list ((n+1)/2, n/2+1) needs no even/odd CASE — odd n collapses both expressions onto one row; being off by one shifts the answer on every even stream.",
      "ROW_NUMBER over duplicate values is tie-arbitrary, but tied rows hold the same val: the two 6s occupy positions 4 and 5 in either order, and position 4 is a 6 either way — the averaged result is deterministic.",
      "No result-level ORDER BY — the output is a single row, graded order-insensitively; a trailing ORDER BY would only invite tie-order debates.",
    ],
    ladder: [
      {
        title: "Brute force — count, then offset",
        body: "SELECT COUNT(*), then ORDER BY val LIMIT 1 OFFSET (n-1)/2, then a second LIMIT 2 OFFSET n/2-1 if even — three queries and a parity branch in host code.",
      },
      {
        title: "The pattern — position and size on every row",
        body: "One pass: ROW_NUMBER and COUNT(*) OVER () stamp every row with its position and the stream size; the middle becomes a filterable predicate instead of procedural offset math.",
      },
      {
        title: "The optimal idea — filter to the middle, let AVG branch",
        body: "rn IN ((n+1)/2, n/2+1) selects the 1-2 middle rows and AVG collapses odd and even into one arithmetic step; ROUND seals the contract. O(n log n) for the single sort.",
      },
    ],
    approach:
      "ROW_NUMBER + COUNT(*) OVER () rank the stream; rn IN ((n+1)/2, n/2+1) grabs the middle row(s); AVG over them answers odd and even without branching",
    schema: {
      ddl: `CREATE TABLE NumStream (
  n_id INTEGER PRIMARY KEY,
  val  REAL NOT NULL
);`,
      seed: `INSERT INTO NumStream (n_id, val) VALUES
  (1, 9),   -- insertion order deliberately shuffled
  (2, 2),
  (3, 6),   -- duplicate of row 4's value
  (4, 3),
  (5, 6),
  (6, 4);`,
      tables: [
        {
          name: "NumStream",
          note: "6 values inserted shuffled (9, 2, 6, 3, 6, 4) with a duplicated 6 — sorted 2, 3, 4, 6, 6, 9 → median (4+6)/2 = 5",
        },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        val,
        ROW_NUMBER() OVER (ORDER BY val ASC) AS rn,  -- position after the sort (duplicates numbered, not deduped)
        COUNT(*)     OVER ()                         AS n    -- the whole stream's size, on every row
    FROM NumStream
),
middle AS (
    SELECT val
    FROM ranked
    WHERE rn IN ((n + 1) / 2, n / 2 + 1)   -- odd n: both hit the same middle; even n: the central pair
)
SELECT ROUND(AVG(val), 4) AS median        -- AVG over 1 row = that row; over 2 rows = their mean
FROM middle;`,
    walkthrough: [
      "ranked numbers the stream after sorting: 2→1, 3→2, 4→3, 6→4, 6→5, 9→6, all under n = 6 — the insertion order (9, 2, 6, 3, 6, 4) is gone the moment the window sorts.",
      "middle keeps rn IN (3, 4): the rows holding 4 and 6 — with an odd n the IN list would name the same position twice and keep one row.",
      "AVG over (4, 6) = 5.0, ROUND(..., 4) leaves it untouched, and the statement returns the single row (5).",
    ],
    time: "O(n log n) — the single ORDER BY val inside the window; the filter and average are linear",
    space: "O(n) — the ranked copy of the stream",
    followUps: [
      "Compute a weighted median where each val carries a frequency column — the rank test becomes a cumulative-sum test against COUNT(*)/2.",
      "Report the median per inserted batch (say, every ten rows) by adding a batch key to the PARTITION — the same two-position trick, scoped.",
    ],
    related: ["second-highest-salary", "rank-scores"],
    order: "any",
    xp: 35,
  },
  {
    slug: "find-the-quiet-students-in-all-exams",
    statement:
      "Students lists the class roster; ExamRecords logs (exam_id, student_id, score) for every exam session a student sat. A student is QUIET when they sat at least one exam and, in EVERY exam they sat, their score was neither that session's highest nor its lowest — a score that TIES the session's best or worst still counts as hitting that extreme. Students who never sat an exam are not quiet; they are simply absent. Output columns: student_id, student_name, ordered by student_id ascending.",
    examples: [
      {
        input: "exam 101 scores: Jonas 100, Noa 88, Ivy 75, Kira 55",
        output: "Noa 88 and Ivy 75 pass exam 101's test; Jonas (max) and Kira (min) fail it",
        explanation:
          "A session with a strict middle: 88 and 75 are neither 100 nor 55, so both students survive this exam's check; the extremes are flagged wherever they occur.",
      },
      {
        input: "exam 103 scores: Jonas 90, Mina 90, Kira 66",
        output: "all three flagged",
        explanation:
          "Jonas and Mina TIE the max — a tie still counts as top — and Kira is the min; nobody in this session is strictly between, so it contributes an exclusion for everyone it touched.",
      },
    ],
    constraints: [
      "quiet = sat at least one exam AND no sat exam has the student's score equal to that exam's MIN or MAX (ties at either end count as hitting the extreme)",
      "students with zero exam rows fail the 'took at least one' requirement and are excluded",
      "output columns: student_id, student_name, ordered by student_id ascending",
    ],
    breakdown: [
      "The trap is quantifier scope: 'clean in exam 102' and 'clean in EVERY exam' are different claims, and only the second is the rule. Mina is the walking counterexample — her 78 in exam 102 sits strictly between that session's 70 and 89, so any check that stops at the first clean exam would pass her, while her 90 in exam 103 ties that session's max and the tie still counts as top. The correct logic aggregates violations across all of a student's exams: quiet means zero exams flagged AND at least one exam sat.",
      "Two anti-patterns fail around the extremes themselves. Computing each student's personal MIN and MAX tests nothing — the fence posts belong to the SESSION, so they must be computed per exam_id and joined back onto the student's rows. And a violation-count alone inverts the other requirement: Lars, who sat nothing, racks up zero violations, yet he must be excluded — the 'took at least one exam' clause is a positive EXISTS, not the mere absence of a violation.",
      "The clean shape pairs two EXISTS predicates with opposite polarity. EXISTS over the student's exam rows enforces participation; NOT EXISTS over rows whose score equals their exam's MIN or MAX enforces the universal 'in no exam' — SQLite probes the correlated subquery per student, while the bounds CTE keeps MIN/MAX computed once per session instead of once per row. Equality against the bounds is deliberately inclusive: score = hi OR score = lo flags ties, which is why exam 103's two 90s flag both Jonas and Mina — a shared record is still the record.",
    ],
    edges: [
      "Aggregate the violation, not the absence — one clean exam proves nothing (Mina's 78 in 102); the student must survive EVERY session they sat.",
      "Extremes belong to the session, not the student — MIN/MAX must be computed per exam_id and joined back; comparing against personal bests is a different (wrong) question.",
      "Ties at either end count as hitting the extreme — exam 103's two 90s flag BOTH Jonas and Mina; a strict > max test would wrongly spare them.",
      "Lars sat nothing and is excluded — 'quiet' requires at least one exam; a pure violation-count would score him zero violations and wrongly include him.",
    ],
    ladder: [
      {
        title: "Brute force — per student, in the host",
        body: "Pull each student's exam scores, fetch each session's min/max, scan for any extreme hit, and special-case the students with no rows. N+1 probes, quantifier logic in the app.",
      },
      {
        title: "The pattern — session bounds, joined back",
        body: "Compute per-exam bounds once (GROUP BY exam_id), join them onto ExamRecords, and let a NOT EXISTS over bound-equal rows express 'in NO exam'.",
      },
      {
        title: "The optimal idea — two EXISTS with opposite polarity",
        body: "A positive EXISTS enforces participation and a NOT EXISTS over fence-post hits enforces the universal, both over a pre-aggregated bounds CTE. O(E + S·k) with k = exams per student.",
      },
    ],
    approach:
      "Per-exam MIN/MAX bounds CTE + positive EXISTS (sat at least one exam) + NOT EXISTS over bound-equal rows (no extreme anywhere, ties included)",
    schema: {
      ddl: `CREATE TABLE Students (
  student_id   INTEGER PRIMARY KEY,
  student_name TEXT NOT NULL
);
CREATE TABLE ExamRecords (
  exam_id    INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  score      INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  PRIMARY KEY (exam_id, student_id)
);`,
      seed: `INSERT INTO Students (student_id, student_name) VALUES
  (1, 'Ivy'),    -- will survive: strictly between in every exam she sat
  (2, 'Jonas'),  -- top of exam 101 (and tied top of 103): excluded
  (3, 'Kira'),   -- bottom of every exam she sat: excluded
  (4, 'Lars'),   -- NO exam rows: excluded by the participation clause
  (5, 'Mina'),   -- clean in 102, but TIES the max in 103: excluded
  (6, 'Noa');    -- one exam, strictly between: survives
INSERT INTO ExamRecords (exam_id, student_id, score) VALUES
  (101, 2, 100),  -- Jonas: max of 101
  (101, 6, 88),   -- Noa: strictly between
  (101, 1, 75),   -- Ivy: strictly between
  (101, 3, 55),   -- Kira: min of 101
  (102, 2, 89),   -- Jonas: max of 102 (quiet here, but already flagged in 101)
  (102, 1, 84),   -- Ivy: strictly between
  (102, 5, 78),   -- Mina: strictly between — her CLEAN exam
  (102, 3, 70),   -- Kira: min of 102
  (103, 2, 90),   -- Jonas: TIED max of 103
  (103, 5, 90),   -- Mina: TIED max of 103 — the tie that disqualifies her
  (103, 3, 66);   -- Kira: min of 103`,
      tables: [
        {
          name: "Students",
          note: "6 students — Ivy and Noa will survive; Jonas/Kira/Mina hit extremes, Lars never sits an exam",
        },
        {
          name: "ExamRecords",
          note: "11 rows across exams 101-103; exam 103 has a TIED max (Jonas 90, Mina 90) — both count as top",
        },
      ],
    },
    code: `WITH exam_bounds AS (
    SELECT
        exam_id,
        MIN(score) AS lo,   -- the session's floor
        MAX(score) AS hi    -- the session's ceiling
    FROM ExamRecords
    GROUP BY exam_id
)
SELECT s.student_id, s.student_name
FROM Students s
WHERE EXISTS (                                   -- positive: they actually sat something
          SELECT 1
          FROM ExamRecords x
          WHERE x.student_id = s.student_id
      )
  AND NOT EXISTS (                               -- negative: NO exam caught them on a fence post
          SELECT 1
          FROM ExamRecords x
          JOIN exam_bounds b ON b.exam_id = x.exam_id
          WHERE x.student_id = s.student_id
            AND (x.score = b.hi OR x.score = b.lo)  -- ties at either end count as the extreme
      )
ORDER BY s.student_id ASC;`,
    walkthrough: [
      "exam_bounds computes each session's fence posts: 101 → [55, 100], 102 → [70, 89], 103 → [66, 90] — computed once per exam, not per student-row.",
      "The NOT EXISTS probe walks each student's exam rows against those bounds: Ivy's 75 and 84 hit no fence post; Mina's 78 is clean but her 90 equals 103's hi — one violation anywhere disqualifies; Kira sits on three lows, Jonas on three highs (one a tie).",
      "The positive EXISTS keeps students with at least one exam row: Lars drops; the survivors ordered by id are (1, 'Ivy') and (6, 'Noa') — Noa's single clean 88 in 101 suffices.",
    ],
    time: "O(E + S·k) — E to build the per-exam bounds, then each of the S students probes their own k exam rows twice",
    space: "O(E) — the bounds CTE",
    followUps: [
      "Soften the rule to 'no exam where the score is the UNIQUE extreme' — swap equality for a rank test and watch exam 103's tie pair come back into the quiet set.",
      "Report each quiet student's closest call: MIN across their exams of LEAST(score − lo, hi − score) turns the verdict into a margin.",
    ],
    related: ["highest-grade-for-each-student", "project-employees-iii", "find-the-team-size"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "students-report-by-geography",
    statement:
      "Students holds the program's roster — every row a student name tagged with the continent of their campus ('America', 'Asia' or 'Europe'). Render the roster as the registrar's fixed grid: exactly two output rows, where row one carries each continent's alphabetically 1st and 2nd students and row two carries its 3rd and 4th, each into that continent's column pair — a continent with no student at a depth leaves those cells NULL. With four Americans, two Asians and two Europeans seeded, all eight names land in the grid and none is dropped. Output columns exactly: America_1, America_2, Asia_1, Asia_2, Europe_1, Europe_2, ordered by America_1 ascending.",
    examples: [
      {
        input: "America as inserted: Denton, Alana, Corazon, Beatrix · Asia: Hari, Chen · Europe: Boris, Anke",
        output: "row 1: ('Alana','Beatrix','Chen','Hari','Anke','Boris')",
        explanation:
          "Insertion order is irrelevant: each continent's names are ranked alphabetically INSIDE the window (Alana beats Beatrix beats Corazon beats Denton), then packed two per row.",
      },
      {
        input: "row two of the grid",
        output: "('Corazon','Denton',NULL,NULL,NULL,NULL)",
        explanation:
          "America fills both depth slots of row two; Asia and Europe have no 3rd or 4th student, so their four cells stay NULL — the grid's shape is fixed, the data just fills what it can.",
      },
    ],
    constraints: [
      "the grid always renders exactly two rows — depth slots 1-2 and 3-4 — regardless of how deep each continent's roster runs",
      "ranking is alphabetical WITHIN each continent, computed on that continent's own rows",
      "output columns exactly: America_1, America_2, Asia_1, Asia_2, Europe_1, Europe_2, ordered by America_1 ascending",
    ],
    breakdown: [
      "A pivot is a rotation of the grain: many rows per continent in, one cell per (continent, slot) out. The naive shape for 'one row per rank, three continents' is three ranked derived tables stitched on rank — a FULL OUTER JOIN in disguise, and the fragile version: SQLite lacked FULL OUTER JOIN before 3.39, a chain of LEFT JOINs anchors the grid to whichever continent leads, and a shorter continent slides out of alignment unless every join condition also guards the rank. The stitch also multiplies — three sorts, two joins, and a fourth variant when a continent is empty.",
      "The clean shape collapses the stitch into one GROUP BY. ROW_NUMBER() OVER (PARTITION BY continent ORDER BY name) ranks each continent's names alphabetically; folding the rank with (rn + 1) / 2 packs ranks 1-2 into grid row 1 and ranks 3-4 into grid row 2, and GROUP BY that pair index does the packing. Inside each group, MAX(CASE WHEN continent = 'America' AND rn % 2 = 1 THEN name END) extracts the odd-rank American into America_1 and its rn % 2 = 0 sibling into America_2 — MAX is not doing math here, it is the 'pick the only non-NULL value' idiom, since each CASE matches at most one row per group.",
      "The seed's 4-2-2 shape is the proof the packing is lossless. America's four names fill both slots of both rows, Asia and Europe fill row one completely and leave row two's cells NULL — eight names in, eight cells claimed, nothing dropped and nothing duplicated. ORDER BY America_1 (Alana, then Corazon) both satisfies the contract and happens to walk the rows in natural grid order, because America is the only continent deep enough to occupy every row. Note what the GROUP BY buys over the join stitch: the grid's row count is driven by the deepest continent, and continents that end early report NULLs instead of vanishing.",
    ],
    edges: [
      "GROUP BY the pair index (rn + 1) / 2, not raw rn — grouping by rn would emit one row per rank (four here) with every column pair half-NULL.",
      "MAX over CASE is a picker, not a calculator — each CASE matches at most one row per group, so MAX returns that value; if a CASE could match two rows, the packing itself would be wrong.",
      "SQLite's integer division makes (rn + 1) / 2 the pair index: ranks 1, 2 → 1 and ranks 3, 4 → 2 — a floating 1.5-style computation would shred the pairing.",
      "NULL cells are part of the contract — Asia and Europe have no 3rd/4th students, and the grid reports their absence as NULLs rather than bending the two-row shape.",
    ],
    ladder: [
      {
        title: "Brute force — three tables, stitched",
        body: "Three ranked subqueries (one per continent) FULL-OUTER-JOINed on rank — emulated with LEFT JOINs plus a UNION leg in older SQLite. Three sorts, two joins, and misalignment bugs wherever a continent runs short.",
      },
      {
        title: "The pattern — one ranking, conditional MAX",
        body: "One ranked CTE partitions all continents at once; the pivot becomes a GROUP BY with one conditional MAX per output column.",
      },
      {
        title: "The optimal idea — pack ranks into pairs",
        body: "Group by the pair index (rn+1)/2: six MAX(CASE) columns per group, two rows out, NULLs where a continent runs dry. O(n log n) — one window sort.",
      },
    ],
    approach:
      "ROW_NUMBER per continent → pair ranks via (rn + 1) / 2 → GROUP BY pair with six MAX(CASE continent, parity) columns",
    schema: {
      ddl: `CREATE TABLE Students (
  name      TEXT NOT NULL PRIMARY KEY,
  continent TEXT NOT NULL CHECK (continent IN ('America', 'Asia', 'Europe'))
);`,
      seed: `INSERT INTO Students (name, continent) VALUES
  ('Denton',  'America'),  -- insert order shuffled on purpose
  ('Alana',   'America'),
  ('Corazon', 'America'),
  ('Beatrix', 'America'),
  ('Hari',    'Asia'),
  ('Chen',    'Asia'),
  ('Boris',   'Europe'),
  ('Anke',    'Europe');`,
      tables: [
        {
          name: "Students",
          note: "8 names — 4 Americans (Alana, Beatrix, Corazon, Denton), 2 Asians (Chen, Hari), 2 Europeans (Anke, Boris), inserted in shuffled order",
        },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        name,
        continent,
        ROW_NUMBER() OVER (PARTITION BY continent ORDER BY name ASC) AS rn  -- alphabetical WITHIN each continent
    FROM Students
)
SELECT
    MAX(CASE WHEN continent = 'America' AND rn % 2 = 1 THEN name END) AS America_1,
    MAX(CASE WHEN continent = 'America' AND rn % 2 = 0 THEN name END) AS America_2,
    MAX(CASE WHEN continent = 'Asia'    AND rn % 2 = 1 THEN name END) AS Asia_1,
    MAX(CASE WHEN continent = 'Asia'    AND rn % 2 = 0 THEN name END) AS Asia_2,
    MAX(CASE WHEN continent = 'Europe'  AND rn % 2 = 1 THEN name END) AS Europe_1,
    MAX(CASE WHEN continent = 'Europe'  AND rn % 2 = 0 THEN name END) AS Europe_2
FROM ranked
GROUP BY (rn + 1) / 2        -- ranks 1-2 pack into grid row 1, ranks 3-4 into row 2
ORDER BY America_1 ASC;`,
    walkthrough: [
      "ranked sorts inside each continent: America → Alana 1, Beatrix 2, Corazon 3, Denton 4; Asia → Chen 1, Hari 2; Europe → Anke 1, Boris 2 — the shuffled insert order never shows.",
      "The pair index (rn + 1)/2 groups ranks {1, 2} and {3, 4}: group 1 yields (Alana, Beatrix, Chen, Hari, Anke, Boris) — each CASE grabs its continent's odd/even rank; group 2 yields (Corazon, Denton, NULL, NULL, NULL, NULL).",
      "ORDER BY America_1 stamps the final order: the Alana row, then the Corazon row — two rows, six fixed columns, all eight names present.",
    ],
    time: "O(n log n) — one window sort over the roster; the pair grouping rides on it",
    space: "O(n) — the ranked copy of the roster",
    followUps: [
      "Make the grid depth dynamic: drive the pair count from MAX(rn)/2 so a deeper continent yields more rows without rewriting the select list.",
      "Add a coverage audit: COUNT(CASE ...) per grid row reports how many names each continent contributed to that row.",
    ],
    related: ["reformat-department-table", "sales-by-day-of-the-week", "rearrange-products-table"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "merge-overlapping-events-in-the-same-hall",
    statement:
      "HallEvents logs event bookings: each row pins an event to a hall with its start_day and end_day (inclusive, 'YYYY-MM-DD'). Two events belong to the same booking block when their day-intervals overlap or even touch — the second starts on or before the day after the first ends. Per hall, merge every chain of overlapping-or-touching events into one block and report the block's span: the earliest start and the latest end among its events. Output columns: hall_id, block_start, block_end, ordered by hall_id ascending, then block_start ascending.",
    examples: [
      {
        input: "hall 1: 03-03→03-08, then 03-06→03-07 (nested inside the first), then 03-09→03-12 (starts the day after 03-08)",
        output: "(1, '2025-03-03', '2025-03-12')",
        explanation:
          "One chain: 03-06 overlaps 03-03..08, and 03-09 touches it (09 = 08 + 1) — touching counts, so all three merge into a single 03-03..03-12 block.",
      },
      {
        input: "hall 2: 03-02→03-04, then 03-11→03-13 and 03-12→03-15",
        output: "(2, '2025-03-02', '2025-03-04') and (2, '2025-03-11', '2025-03-15')",
        explanation:
          "03-11 starts seven days after 03-04 — a real gap, so hall 2 splits into two blocks; the later pair overlaps (12 ≤ 13) and merges.",
      },
    ],
    constraints: [
      "intervals merge when they overlap OR touch: a block continues while the next start_day is on or before the current reach + 1 day",
      "merging is per hall — events in different halls never interact, even on identical dates",
      "output columns: hall_id, block_start, block_end, ordered by hall_id then block_start, both ascending",
    ],
    breakdown: [
      "Merging interval chains is gaps-and-islands, and the date version has a seductive shortcut worth refusing: julianday(start_day) minus ROW_NUMBER() per hall is 'constant within an island' only when consecutive events start on consecutive days. This seed breaks that assumption on purpose — hall 1's second event starts 03-06, three days after the first — yet the two still belong together, because the FIRST event's long interval reaches over the start-day gap. The reach, not the starts, is what chains events: the honest island boundary is 'this event begins after everything before it has finished, plus one grace day'.",
      "The correct primitive is a running reach. Sort each hall's events by start_day and carry MAX(end_day) over the rows strictly before the current one — the ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING frame is exactly 'everything booked before me'; call it prev_end. A new island starts when prev_end IS NULL (the hall's first event) or when julianday(start_day) > julianday(prev_end) + 1 (a genuine gap — a start exactly one day past the reach is a touch, and touches merge). A running SUM of those flags turns them into block numbers, and the frames must be ROWS rather than the default RANGE so each row sees a precise prefix instead of a tie-inclusive peer group.",
      "With block numbers stamped, the merge itself is the cheapest kind of aggregation: GROUP BY hall_id, block_no and take MIN(start_day), MAX(end_day). MAX — not 'the last event's end' — is what makes nested bookings behave: hall 1's reach is carried by the first event's 03-08, and the nested 03-06→03-07 neither extends nor truncates it. The +1 grace day is the touching rule as data: hall 1's 03-09 start sits exactly one day past the 03-08 reach, so 1 > 1 is false and the chain holds, while a 03-10 start would read 2 > 1 and split the block. And hall 4's scrambled insert order — events 8, 9, 10 land in the file backwards relative to their starts — is the proof that only the ORDER BY inside the windows matters; the table's physical order is irrelevant.",
    ],
    edges: [
      "The julianday − ROW_NUMBER island trick fails on overlapping intervals — hall 1's 03-06 start inside a 03-03..08 event breaks the consecutive-day assumption; the running reach is the general tool.",
      "Frames must be ROWS: UNBOUNDED PRECEDING AND 1 PRECEDING for the reach (strictly earlier events) and UNBOUNDED PRECEDING AND CURRENT ROW for the flag count — the default RANGE frame would drag tie peers into the prefix.",
      "Touching counts as merging: a start of reach + 1 stays in the block (hall 1's 03-09; hall 4's 03-14 after a 03-13 reach); the split only fires strictly beyond +1.",
      "MAX(end_day), not the last row's end — hall 1's block end is carried by the FIRST event's 03-08; grouping on last-row values would truncate the block.",
    ],
    ladder: [
      {
        title: "Brute force — a cursor per hall",
        body: "Sort a hall's events, walk them keeping a current block, extend its end when the next event overlaps or touches, flush on gaps — a host-language loop per hall, one pass each.",
      },
      {
        title: "The pattern — express the walk as windows",
        body: "A running MAX reach over a ROWS prefix detects where blocks break, and a running SUM of the break flags numbers the islands — the cursor becomes two window passes.",
      },
      {
        title: "The optimal idea — three windows, one GROUP BY",
        body: "prev_end → flag → block_no → MIN/MAX per island, all in one statement over any number of halls. O(n log n) for the sort.",
      },
    ],
    approach:
      "Running MAX(end_day) over a ROWS prefix marks gap-starts (start > reach + 1); a running SUM numbers the islands; GROUP BY hall, island gives MIN(start)/MAX(end)",
    schema: {
      ddl: `CREATE TABLE HallEvents (
  event_id  INTEGER PRIMARY KEY,
  hall_id   INTEGER NOT NULL,
  start_day TEXT NOT NULL,
  end_day   TEXT NOT NULL CHECK (end_day >= start_day)
);`,
      seed: `INSERT INTO HallEvents (event_id, hall_id, start_day, end_day) VALUES
  (1, 1, '2025-03-03', '2025-03-08'),  -- hall 1: the long reach
  (2, 1, '2025-03-06', '2025-03-07'),  -- hall 1: NESTED — starts 3 days after event 1
  (3, 1, '2025-03-09', '2025-03-12'),  -- hall 1: TOUCHES event 1's reach (09 = 08 + 1)
  (4, 2, '2025-03-02', '2025-03-04'),  -- hall 2: its own block
  (5, 2, '2025-03-11', '2025-03-13'),  -- hall 2: 7-day gap after 03-04 → new block
  (6, 2, '2025-03-12', '2025-03-15'),  -- hall 2: overlaps event 5
  (7, 3, '2025-03-20', '2025-03-21'),  -- hall 3: a lone event, one block by itself
  (8, 4, '2025-03-14', '2025-03-16'),  -- hall 4: inserted FIRST but starts LAST
  (9, 4, '2025-03-11', '2025-03-13'),  -- hall 4: touches event 8 (14 = 13 + 1)
  (10, 4, '2025-03-07', '2025-03-12'); -- hall 4: overlaps event 9 — file order fully scrambled`,
      tables: [
        {
          name: "HallEvents",
          note: "10 events, 4 halls — hall 1 chains into one block (nested + touching), hall 2 splits (a 7-day gap), hall 3 is a lone event, hall 4's rows are inserted scrambled",
        },
      ],
    },
    code: `WITH ordered AS (
    SELECT
        hall_id,
        event_id,
        start_day,
        end_day,
        MAX(end_day) OVER (           -- the furthest reach of everything booked BEFORE me
            PARTITION BY hall_id
            ORDER BY start_day, event_id
            ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
        ) AS prev_end
    FROM HallEvents
),
flagged AS (
    SELECT
        hall_id, event_id, start_day, end_day,
        CASE
            WHEN prev_end IS NULL THEN 1                        -- first event of the hall
            WHEN julianday(start_day) > julianday(prev_end) + 1 THEN 1  -- a real gap (a touch = reach + 1 stays)
            ELSE 0
        END AS new_block
    FROM ordered
),
marked AS (
    SELECT
        hall_id, start_day, end_day,
        SUM(new_block) OVER (        -- running count of block-starts = the island number
            PARTITION BY hall_id
            ORDER BY start_day, event_id
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS block_no
    FROM flagged
)
SELECT
    hall_id,
    MIN(start_day) AS block_start,
    MAX(end_day)   AS block_end   -- MAX, not last-row end: nested events ride the reach
FROM marked
GROUP BY hall_id, block_no
ORDER BY hall_id ASC, block_start ASC;`,
    walkthrough: [
      "ordered computes each hall's prev_end: hall 1 → event 1 sees NULL, event 2 sees 03-08, event 3 sees 03-08 (the nested 03-07 never lowers the reach); hall 4's scrambled rows sort to 03-07, 03-11, 03-14 with reaches NULL, 03-12, 03-13.",
      "flagged marks new islands: only hall 2's 03-11 (seven days past 03-04) and each hall's first event fire; the running SUM numbers hall 2's rows 1, 2, 2 and hall 4's rows 1, 1, 1.",
      "GROUP BY hall, block_no collapses the chains: (1, 03-03, 03-12), (2, 03-02, 03-04), (2, 03-11, 03-15), (3, 03-20, 03-21), (4, 03-07, 03-16) — five blocks from ten events.",
    ],
    time: "O(n log n) — the per-hall window sort dominates; flags, running sums and the final GROUP BY are linear passes",
    space: "O(n) — the annotated events across the three CTEs",
    followUps: [
      "Switch the boundary to strict overlap (drop the +1) and predict which blocks split: hall 1's 03-09 and hall 4's 03-14 peel off — re-run and check.",
      "Count each block's contributing events with COUNT(*) in the final GROUP BY — a block-size column turns the schedule into a consolidation report.",
    ],
    related: ["report-contiguous-dates", "biggest-window-between-events", "last-person-to-fit-in-the-elevator"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "employee-task-duration-and-concurrent-tasks",
    statement:
      "JobTasks logs work items on a shared timeline: each task belongs to an employee and runs from start_time to end_time ('YYYY-MM-DD HH:MM:SS'). A task's own duration is its wall-clock span in whole minutes. Its ACTUAL duration adds the price of contention: the number of tasks running CONCURRENTLY at the instant the task starts — counted GLOBALLY across all employees, with both bounds inclusive, so a task that ends exactly at another's start still counts as running at that instant. Concurrency is sampled at each task's own start_time (the task itself always counts, so the sample is never 0). Output columns: task_id, actual_duration, ordered by task_id ascending.",
    examples: [
      {
        input: "task 3 starts 09:30:00; running at that instant: task 1 (09:00→09:40), task 2 (09:20→10:00), task 3 itself",
        output: "task 3: own 20 minutes + 3 concurrent = 23",
        explanation:
          "Task 4 starts 09:35, after the sample, so it does not count — the anchor is strictly the task's own start_time.",
      },
      {
        input: "task 6 starts 10:00:00, the exact end_time of task 2",
        output: "task 6: own 45 minutes + 3 concurrent = 48",
        explanation:
          "The end-instant is inclusive: task 2 (end 10:00:00) still counts as running at 10:00:00, alongside task 4 and task 6 itself — the boundary collision is stated, not avoided.",
      },
    ],
    constraints: [
      "own duration = ROUND((julianday(end_time) − julianday(start_time)) × 24 × 60) whole minutes",
      "concurrency is sampled at the task's start_time, counted globally across employees, with start_time <= sample <= end_time on every counted task (both bounds inclusive; the task itself always counts)",
      "output columns: task_id, actual_duration, ordered by task_id ascending",
    ],
    breakdown: [
      "The statement declares its own model, and reading it precisely is most of the problem: true max concurrency inside an interval is an event-sweep (every start +1, every end −1, track the running total's peak), which is awkward to express in one pass — so this re-author pins the definition to something one statement computes exactly: concurrency is SAMPLED at each task's start_time. A count at an instant is a well-defined function; a maximum over an interval is not. The sample is self-inclusive — the task itself satisfies its own containment test — which conveniently gives the metric a floor of 1: a task sharing its morning with nobody still carries its own weight.",
      "The containment test is a self-join against a fixed instant: count tasks x with x.start_time <= t.start_time AND x.end_time >= t.start_time. Both bounds are inclusive BY CONTRACT — the >= on the end side is what keeps task 2, ending exactly at 10:00:00, inside task 6's 10:00:00 sample; flip it to > and boundary collisions silently vanish from the bill. The count is also deliberately GLOBAL: employees 7, 8 and 9 interleave across the same morning, and the contention price ignores org charts — adding x.employee_id = t.employee_id to the predicate would let tasks 2, 4 and 6 stop charging each other. Timestamps in 'YYYY-MM-DD HH:MM:SS' compare correctly as plain text — lexicographic is chronological for this fixed format — so the predicate needs no casts.",
      "The two halves of the metric need different arithmetic, and each hides a small trap. Own duration must scale fractional DAYS: julianday differences are day-shaped, so (end − start) × 24 × 60 converts to minutes and ROUND plus CAST seals the integer — task 4's 09:35→11:15 span is 0.0694… days, exactly 100 minutes. The actual duration is then a plain integer sum of own minutes and the sampled count, joined back on task_id and ordered: (1,41), (2,42), (3,23), (4,104), (5,41), (6,48). The loudest fact in that list is 104 = 100 + 4 — the long task absorbs the whole 09:35 pileup at its own start instant.",
    ],
    edges: [
      "Inclusive both ends is the contract — x.end_time >= t.start_time keeps a task that ends exactly at the sample instant in the count (task 2 at task 6's 10:00:00 start); >= vs > is the difference between 3 and 2.",
      "Sampling at the start is a stated simplification of the true max-concurrency sweep — task 4's real peak (4 tasks at 09:35) IS its start sample here, but a timeline whose pileup peaks mid-task would diverge; know which model you are grading.",
      "Concurrency is global across employees — the predicate must NOT filter x.employee_id = t.employee_id; three employees share this morning's timeline.",
      "Own duration is (julianday(end) − julianday(start)) × 24 × 60, then ROUND and CAST — forgetting the ×24×60 reports fractional DAYS (0.028) instead of minutes (40).",
    ],
    ladder: [
      {
        title: "Brute force — nested loops in the host",
        body: "For each task, loop every task, test containment against the start instant, and add the tick count to a duration computed in application code. Two nested loops, units math scattered across the boundary.",
      },
      {
        title: "The pattern — a correlated containment count",
        body: "One correlated scalar subquery per task computes the sampled concurrency; the julianday pipeline computes own minutes in the same statement.",
      },
      {
        title: "The optimal idea — two small CTEs, one integer sum",
        body: "Own minutes in one CTE, sampled load in another, joined on task_id: the containment counting stays a self-join on the instant and the metric reads as a plain sum. O(n²) worst case on the probe.",
      },
    ],
    approach:
      "Self-join containment count sampled at each task's start (both bounds inclusive, global across employees) + julianday minutes, summed per task",
    schema: {
      ddl: `CREATE TABLE JobTasks (
  task_id     INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  start_time  TEXT NOT NULL,
  end_time    TEXT NOT NULL CHECK (end_time >= start_time)
);`,
      seed: `INSERT INTO JobTasks (task_id, employee_id, start_time, end_time) VALUES
  (1, 7, '2025-06-12 09:00:00', '2025-06-12 09:40:00'),
  (2, 8, '2025-06-12 09:20:00', '2025-06-12 10:00:00'),  -- ends EXACTLY when task 6 starts
  (3, 7, '2025-06-12 09:30:00', '2025-06-12 09:50:00'),
  (4, 9, '2025-06-12 09:35:00', '2025-06-12 11:15:00'),  -- starts under the 3-task pileup, runs 100 min
  (5, 7, '2025-06-12 11:30:00', '2025-06-12 12:10:00'),  -- alone: task 4 ended 11:15
  (6, 8, '2025-06-12 10:00:00', '2025-06-12 10:45:00');  -- boundary collision with task 2's end`,
      tables: [
        {
          name: "JobTasks",
          note: "6 tasks on 2025-06-12 across employees 7-9 — a 4-task pileup at 09:35, a boundary collision at 10:00 (task 2 ends exactly when task 6 starts), and a quiet late task",
        },
      ],
    },
    code: `WITH own AS (
    SELECT
        task_id,
        CAST(ROUND((julianday(end_time) - julianday(start_time)) * 24 * 60) AS INTEGER) AS own_minutes
    FROM JobTasks
),
sampled AS (
    SELECT
        t.task_id,
        (SELECT COUNT(*)
         FROM JobTasks x
         WHERE x.start_time <= t.start_time    -- inclusive: a task starting exactly now counts
           AND x.end_time   >= t.start_time    -- inclusive: a task ending EXACTLY now still counts
        ) AS concurrent_at_start               -- global across employees — no employee filter here
    FROM JobTasks t
)
SELECT
    o.task_id,
    o.own_minutes + s.concurrent_at_start AS actual_duration
FROM own o
JOIN sampled s ON s.task_id = o.task_id
ORDER BY o.task_id ASC;`,
    walkthrough: [
      "own minutes per task: 40, 40, 20, 100, 40, 45 — task 4's 09:35→11:15 is the 100-minute monster; julianday does the calendar math, ×1440 the units.",
      "The correlated COUNT samples each start: 09:00 → 1 (itself), 09:20 → 2 (+task 1), 09:30 → 3 (+task 2), 09:35 → 4 (+tasks 1-3), 10:00 → 3 (task 2 by the inclusive end, task 4, task 6), 11:30 → 1 (task 4 ended 11:15).",
      "Summing and ordering: (1,41), (2,42), (3,23), (4,104), (5,41), (6,48) — task 5 pays only its own weight because nothing overlaps its late-morning window.",
    ],
    time: "O(n²) worst case — each task's start probes every interval; the own-minutes and final join passes are linear",
    space: "O(n) — the own-minutes and sampled-load CTEs, one row per task",
    followUps: [
      "Replace the sampled count with the true peak: build the event-sweep (starts +1, ends −1, running SUM, peak within each task's window) and compare — the two models diverge on a timeline whose pileup peaks mid-task.",
      "Charge concurrency per employee instead of globally — add the employee equality to the containment predicate and watch task 4's load fall from 4 to 1.",
    ],
    related: ["last-person-to-fit-in-the-elevator", "biggest-window-between-events", "create-a-session-bar-chart"],
    order: "exact",
    xp: 35,
  },
];
