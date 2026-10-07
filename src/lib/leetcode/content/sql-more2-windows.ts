// Deep-dives — the SQL 50+ expansion, batch 3: window-function essentials
// (4 problems). Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_MORE2_WINDOWS: LcSqlDive[] = [
  {
    slug: "find-the-team-size",
    statement:
      "Employee stores every staff member together with the id of the team they belong to. Report each employee's id and team id alongside the size of their team — one row per employee, in employee-id order.",
    examples: [
      {
        input: "Employee: (1,T1),(2,T1),(3,T1),(4,T2),(5,T2),(6,T3)",
        output: "(1,T1,3) (2,T1,3) (3,T1,3) (4,T2,2) (5,T2,2) (6,T3,1)",
        explanation: "Team 1 has three members, team 2 two, team 3 one — yet all six employees keep their own row.",
      },
      {
        input: "employee 6, the only member of team 3",
        output: "(6,T3,1)",
        explanation: "A singleton team reports a size of 1; the employee's row survives instead of being collapsed away.",
      },
    ],
    constraints: [
      "employee_id is unique; every employee belongs to exactly one team",
      "the roster must not collapse — the output has one row per employee",
      "output columns: employee_id, team_id, team_size, in employee-id order",
    ],
    breakdown: [
      "This is the hello-world of window aggregates: COUNT(*) OVER (PARTITION BY team_id). The OVER clause changes what COUNT means — instead of collapsing the table into one row per team, it walks the rows one at a time and, for each row, counts all rows that share its team_id. The rows never merge; the count just rides along as a new column.",
      "Contrast with GROUP BY, the reflex answer: GROUP BY team_id would shrink six employees to three team rows — the roster itself is gone, and employee ids would have to be smuggled back with a join. The window version needs no join, no subquery, no second pass: one scan computes the count per partition while every base row stays intact.",
      "Mechanically, PARTITION BY team_id slices the rows into groups the way GROUP BY would, but the aggregate is evaluated per row against its slice. This is the first rung of a whole ladder — RANK, SUM OVER, moving averages all inherit this shape — and the mental model to keep: 'for each row, look at its group, but stay on the row'.",
    ],
    edges: [
      "GROUP BY team_id shrinks the roster to one row per team — the entire point here is per-row counts, so OVER is the tool.",
      "PARTITION BY team_id, not employee_id — partitioning by the wrong key makes every count a pointless 1.",
      "Singleton teams correctly report 1 — COUNT(*) counts the rows in the partition, and a one-row partition counts one.",
      "ORDER BY employee_id keeps the roster stable and the output deterministic for the exact-order grader.",
    ],
    ladder: [
      { title: "Brute force — ask again per row", body: "A correlated subquery: SELECT (SELECT COUNT(*) FROM Employee e2 WHERE e2.team_id = e.team_id) — correct, but it rescans the table once per employee: O(n²) in the worst case." },
      { title: "The pattern — aggregate, then join back", body: "GROUP BY team_id into team sizes, then join Employee to the counts to recover the roster. Two passes plus join machinery — the classic pre-window shape." },
      { title: "The optimal idea — count in place", body: "COUNT(*) OVER (PARTITION BY team_id) does the grouping and the report in one pass: per-partition counting with zero row loss. O(n) for the count itself." },
    ],
    approach: "COUNT(*) OVER (PARTITION BY team_id) — per-row team sizes without collapsing",
    schema: {
      ddl: `CREATE TABLE Employee (
  employee_id INTEGER PRIMARY KEY,
  team_id     INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employee (employee_id, team_id) VALUES
  (1,1),(2,1),(3,1),(4,2),(5,2),(6,3);`,
      tables: [{ name: "Employee", note: "6 staff across 3 teams — sizes 3, 2, 1 (a singleton included)" }],
    },
    code: `SELECT
    employee_id,
    team_id,
    COUNT(*) OVER (PARTITION BY team_id) AS team_size  -- rows sharing this team
FROM Employee
ORDER BY employee_id;`,
    walkthrough: [
      "PARTITION BY team_id slices the six rows: team 1 = {1,2,3}, team 2 = {4,5}, team 3 = {6}.",
      "COUNT(*) is evaluated per row against its slice — every team-1 row sees 3, both team-2 rows see 2, employee 6 sees 1.",
      "Rows pass through unchanged — six in, six out, each now carrying team_size — and ORDER BY employee_id fixes the presentation order.",
    ],
    time: "O(n log n) — the final ORDER BY dominates; the partitioned count itself is a linear pass",
    space: "O(n) — every row survives, now carrying team_size",
    followUps: [
      "Keep only teams of two or more — windows can't appear in WHERE, so wrap the query in a subquery and filter on team_size outside.",
      "Show each team's size next to the company headcount — COUNT(*) OVER () (no PARTITION) stamps the total on every row, two window grains in one SELECT.",
    ],
    related: ["rank-scores", "game-play-analysis-v"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "project-employees-iii",
    statement:
      "Project assigns employees to projects, and Employee records each employee's years of experience. For every project, report the employee(s) with the LEAST experience — if several employees tie on the minimum, include them all.",
    examples: [
      {
        input: "Project 1 → Andres (3y), Vicky (2y), Sam (1y) · Project 2 → Bob (2y), Kit (5y)",
        output: "(1,Sam) · (2,Bob)",
        explanation: "Each project's minimum is 1 and 2 years — Sam and Bob are their own project's least experienced, even though Vicky shares Bob's 2 years in a different project.",
      },
      {
        input: "if Kit also had 2 years on project 2",
        output: "(2,Bob) · (2,Kit) — both rows",
        explanation: "A tie on the minimum is part of the answer: RANK hands both employees rank 1, while ROW_NUMBER would keep one and silently drop the other.",
      },
    ],
    constraints: [
      "the minimum is per project, never global",
      "ties on the minimum all appear — one row per tied employee",
      "output columns: project_id, employee_id, name, ordered by project then employee",
    ],
    breakdown: [
      "This is a per-group argmin: MIN(experience_years) per project yields the VALUE, but the question asks WHO — the whole row(s) matching each group's minimum, ties included. Every SQL dialect needs a trick for this, and the two canonical tricks are the pre-window one (a correlated NOT EXISTS — 'keep employees no one on the project beats') and the window one (RANK).",
      "RANK() OVER (PARTITION BY project_id ORDER BY experience_years ASC) sorts each project's employees by experience and numbers them, with ties sharing a rank. WHERE rnk = 1 keeps the least experienced per project — all of them if the minimum is tied. That tie behavior is exactly why RANK and not ROW_NUMBER: ROW_NUMBER breaks ties arbitrarily and would keep one tied employee at random, a silent wrong answer. The seed plants the subtlety — Vicky and Bob both have 2 years, but in DIFFERENT projects, so each still leads its own partition.",
      "The window shape also wins on generality: the pre-window NOT EXISTS reads 'no one has less experience' and answers only the argmin question — asking next for the top 2 means new logic. With RANK, 'top k' is the same query with rnk <= k, and DENSE_RANK is one keyword away when the tie semantics change. Ranking once and filtering on the rank is the reusable pattern.",
    ],
    edges: [
      "RANK, not ROW_NUMBER — a tie on the minimum must produce multiple rank-1 rows, not one arbitrary survivor.",
      "MIN() alone returns the value, not the person — recovering names from the min needs an extra join and still has to handle ties explicitly.",
      "Join BEFORE ranking: experience lives in Employee, so the window must run over the joined rows, not over Project alone.",
      "ORDER BY project_id, employee_id — with ties possible, the full sort key chain is what makes the output deterministic.",
    ],
    ladder: [
      { title: "Brute force — the pre-window argmin", body: "For each joined row, NOT EXISTS (SELECT 1 FROM Project p2 JOIN Employee e2 … WHERE p2.project_id = p.project_id AND e2.experience_years < e.experience_years) — 'nobody on this project is greener'. Correct, but it re-probes the project for every row." },
      { title: "The pattern — rank within the partition", body: "RANK() OVER (PARTITION BY project_id ORDER BY experience_years ASC) in a CTE, then WHERE rnk = 1. One sort per project replaces the per-row probing." },
      { title: "The optimal idea — rank once, filter the rank", body: "The rank is computed a single time and answers every 'who is at position k' question: rnk = 1 today, rnk <= 3 tomorrow. O(n log n) for the partition sorts, no correlated rescans." },
    ],
    approach: "RANK() OVER (PARTITION BY project_id ORDER BY experience_years), keep rank 1",
    schema: {
      ddl: `CREATE TABLE Project (
  project_id  INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  PRIMARY KEY (project_id, employee_id)
);
CREATE TABLE Employee (
  employee_id      INTEGER PRIMARY KEY,
  name             TEXT NOT NULL,
  experience_years INTEGER NOT NULL
);`,
      seed: `INSERT INTO Project (project_id, employee_id) VALUES
  (1,1),(1,2),(1,3),(2,4),(2,5);
INSERT INTO Employee (employee_id, name, experience_years) VALUES
  (1,'Andres',3),(2,'Vicky',2),(3,'Sam',1),(4,'Bob',2),(5,'Kit',5);`,
      tables: [
        { name: "Project", note: "5 assignments — project 1 has 3 employees, project 2 has 2" },
        { name: "Employee", note: "Vicky and Bob both have 2 years — but in different projects, so no tie fires" },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        p.project_id,
        e.employee_id,
        e.name,
        RANK() OVER (
            PARTITION BY p.project_id
            ORDER BY e.experience_years ASC
        ) AS rnk                      -- 1 = least experienced; ties share rank 1
    FROM Project p
    JOIN Employee e ON e.employee_id = p.employee_id
)
SELECT project_id, employee_id, name
FROM ranked
WHERE rnk = 1
ORDER BY project_id, employee_id;`,
    walkthrough: [
      "The join attaches experience to every assignment: project 1 → Andres 3, Vicky 2, Sam 1; project 2 → Bob 2, Kit 5.",
      "RANK orders each partition by experience ASC: project 1 ranks Sam 1, Vicky 2, Andres 3; project 2 ranks Bob 1, Kit 5 — Bob's 2 years top his partition even though Vicky matches them elsewhere.",
      "WHERE rnk = 1 keeps exactly (1, Sam) and (2, Bob); had a second employee hit the minimum inside one project, RANK would have awarded two rank-1 rows and both would appear.",
    ],
    time: "O(n log n) — one join plus a sort per project partition",
    space: "O(n) — the ranked join result",
    followUps: [
      "Most experienced per project — flip ASC to DESC; then check what 'top 2 least experienced' returns under RANK versus DENSE_RANK when ties straddle the cut.",
      "Rewrite the pre-window way — NOT EXISTS ('no one on this project has less experience') — and compare readability, cost, and how hard 'top 2' becomes.",
    ],
    related: ["department-top-three-salaries", "rank-scores"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "product-price-at-a-given-date",
    statement:
      "Products is a price-change log: each row says a product's price became new_price on change_date. Report every product's price on 2019-08-16 — the most recent change on or before that date — or the default price 10 for products with no change by then.",
    examples: [
      {
        input: "P1: 5 on 08-01, 6 on 08-15, 7 on 09-01 · P2: 7 on 08-14, 8 on 08-20 (all 2019)",
        output: "(1,6) · (2,7)",
        explanation: "On 08-16 the latest change that has happened is 08-15 → price 6 for P1; P2's 08-20 change is still in the future, so its price is 7.",
      },
      {
        input: "P3's only change lands on 08-17 — one day after the snapshot date",
        output: "(3,10)",
        explanation: "No change on or before 2019-08-16 means the product has no price yet — it falls back to the default 10.",
      },
    ],
    constraints: [
      "the snapshot date 2019-08-16 is fixed — changes strictly after it do not exist yet",
      "products with no change on or before the date report the default price 10",
      "output columns: product_id, price, ordered by product_id",
    ],
    breakdown: [
      "A price 'as of a date' is a point-in-time snapshot: first filter the log to change_date <= '2019-08-16', THEN find the latest change per product. The order is everything — WHERE runs before the window is computed, so future changes never enter the ranking. Skip the filter and p1's 2019-09-01 row would win a change_date DESC ranking and report tomorrow's price.",
      "ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY change_date DESC) numbers each product's surviving history newest-first, and rn = 1 is the latest change. (The composite PRIMARY KEY makes change_date unique per product, so ties are impossible here — RANK would agree — but ROW_NUMBER is the honest tool for 'the latest row'.) Note also why the date filter itself is sound: ISO 'YYYY-MM-DD' strings compare lexicographically, and for this format lexicographic order IS calendar order.",
      "The default-price branch: a product absent from the filtered history (p3's only change is dated 08-17) still must appear, priced at 10. UNION ALL appends a second query that finds exactly those products — product_id NOT IN the set of products with a change on or before the date. NOT IN is safe here because product_id is NOT NULL, so the inner subquery cannot return a NULL that would silently turn every comparison into UNKNOWN; with a nullable column, NOT IN is a famous landmine.",
    ],
    edges: [
      "Filter change_date <= '2019-08-16' BEFORE the window — future rows would otherwise rank first under DESC and leak prices from after the snapshot.",
      "ISO date strings compare correctly with <=; any other date format breaks the snapshot boundary silently.",
      "NOT IN is only safe because product_id is NOT NULL — one NULL in the inner subquery would make the predicate false for every row and empty the branch.",
      "UNION ALL, not UNION — the branches are disjoint by construction, and dedup would only cost a sort; a compound SELECT also orders by output position (ORDER BY 1).",
    ],
    ladder: [
      { title: "Brute force — three passes", body: "Per product, find MAX(change_date) ≤ the date, join back to fetch that row's price, and run a separate pass for products with no prior change — then stitch the two results in code." },
      { title: "The pattern — filter, then ROW_NUMBER", body: "One CTE filters the log to the as-of date and ranks each product's history newest-first; rn = 1 is the snapshot price." },
      { title: "The optimal idea — snapshot + default as two disjoint branches", body: "The rn = 1 rows and the no-history products partition the answer exactly, so UNION ALL glues them with no overlap check. Every product appears once: real price or default 10." },
    ],
    approach: "Pre-filter to the snapshot date, ROW_NUMBER per product DESC, UNION ALL a default-price branch",
    schema: {
      ddl: `CREATE TABLE Products (
  product_id  INTEGER NOT NULL,
  new_price   INTEGER NOT NULL,
  change_date TEXT NOT NULL,
  PRIMARY KEY (product_id, change_date)
);`,
      seed: `INSERT INTO Products (product_id, new_price, change_date) VALUES
  (1,5,'2019-08-01'),(1,6,'2019-08-15'),(1,7,'2019-09-01'),
  (2,7,'2019-08-14'),(2,8,'2019-08-20'),
  (3,9,'2019-08-17');`,
      tables: [
        { name: "Products", note: "6 change rows for 3 products; changes on 08-17, 08-20, 09-01 are all after the 08-16 snapshot" },
      ],
    },
    code: `WITH latest AS (
    SELECT
        product_id,
        new_price,
        ROW_NUMBER() OVER (
            PARTITION BY product_id
            ORDER BY change_date DESC
        ) AS rn                       -- newest surviving change first
    FROM Products
    WHERE change_date <= '2019-08-16' -- filter BEFORE ranking: future rows must not compete
)
SELECT product_id, new_price AS price
FROM latest
WHERE rn = 1
UNION ALL
SELECT DISTINCT product_id, 10 AS price          -- default price for no history
FROM Products
WHERE product_id NOT IN (
    SELECT product_id FROM Products WHERE change_date <= '2019-08-16'
)
ORDER BY 1;                           -- ordinal: compound SELECT orders by output column 1`,
    walkthrough: [
      "The filter keeps p1's 08-01 and 08-15 rows and p2's 08-14 row — p1's 09-01, p2's 08-20, and p3's 08-17 changes are all still in the future on 08-16.",
      "ROW_NUMBER ranks each surviving history DESC: p1's 08-15 (price 6) takes rn 1, p2's 08-14 (price 7) takes rn 1 — WHERE rn = 1 outputs (1,6) and (2,7). The 09-01 row never got to compete.",
      "p3 has no row in the filtered set, so the NOT IN branch picks it up and the UNION ALL adds (3,10) — final rows (1,6),(2,7),(3,10) in product-id order.",
    ],
    time: "O(n log n) — one filtered scan plus the per-product ranking sort",
    space: "O(n) — the filtered history plus one output row per product",
    followUps: [
      "Parameterize the snapshot date — the same query should answer any :date, changing only the two WHERE literals.",
      "Replay the full price history — for every day, each product's effective price: a window over the ordered changes, or the classic greatest-lower-bound self-join.",
    ],
    related: ["immediate-food-delivery-ii", "the-latest-login-in-2020"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "active-users",
    statement:
      "Accounts lists the users and Logins records every sign-in with its date. Find the users who were active on at least 5 CONSECUTIVE calendar days — multiple logins on the same day count once — and report their id and name.",
    examples: [
      {
        input: "Alice: 2023-01-01 through 2023-01-07, every day",
        output: "(1,'Alice')",
        explanation: "Seven straight days clears the 5-day bar with room to spare.",
      },
      {
        input: "Cara: 02-01, 02-02, 02-03, 02-04, 02-05, 02-05 again, 02-20",
        output: "(7,'Cara')",
        explanation: "The duplicate 02-05 login counts once — five distinct consecutive days; the 02-20 outlier is its own one-day streak.",
      },
    ],
    constraints: [
      "consecutive means calendar-consecutive — a single missed day splits the streak",
      "duplicate logins on the same date count as one day",
      "output columns: id, name, ordered by id",
    ],
    breakdown: [
      "Streak detection needs rows in date order, and GROUP BY is blind to sequence — aggregation sees bags, not orderings. Window functions restore the timeline: number each user's distinct login days 1..k by date with ROW_NUMBER() OVER (PARTITION BY id ORDER BY login_date). On a truly consecutive run, the row number and the calendar advance in lockstep — and that lockstep is the whole trick.",
      "The anchor: DATE(login_date, '-' || (rn - 1) || ' days') shifts every date back by its position minus one. For consecutive dates the shifted values COLLAPSE to one constant — 01-01 minus 0, 01-02 minus 1, 01-03 minus 2 all land on 01-01. Every row of one streak therefore shares the same anchor string, so GROUP BY (id, anchor) turns streak-counting into ordinary counting: COUNT(*) per anchor is the streak's length.",
      "DISTINCT comes first, and it is not cosmetic: a duplicate same-day login (Cara's second 02-05) gets its own row number while the date does not advance, so the date-minus-row_number arithmetic desynchronizes and the anchor changes mid-streak — one stray row would split a real streak into fragments. Deduplicating to one row per (id, date) makes the arithmetic honest before the windows ever run.",
    ],
    edges: [
      "DISTINCT (id, login_date) BEFORE numbering — a duplicate same-day login would break the rn-versus-date lockstep and split the streak.",
      "The anchor is built by string concatenation: '-' || (rn - 1) || ' days' is a DATE() modifier, not arithmetic on the date itself.",
      "Outlier days (Cara's 02-20) form their own one-row anchor group — harmless, they just never reach 5.",
      "Bob proves the negative case: 01-05 after 01-03 is a gap — one missed day, so his longest run is 3, not 9 total logins.",
    ],
    ladder: [
      { title: "Brute force — exist-check every window", body: "For each (user, date), self-join to verify d+1, d+2, d+3 and d+4 all exist as login dates. Correct, but a 4-way self-join per candidate day — combinatorial and unreadable." },
      { title: "The pattern — LAG gaps-and-islands", body: "LAG(login_date) OVER (PARTITION BY id ORDER BY login_date) diffs each day from the previous; diff = 1 continues an island, a bigger gap starts a new one; then count island sizes. The classic gaps-and-islands shape." },
      { title: "The optimal idea — date minus row_number = anchor", body: "Shifting each date back by (rn − 1) days maps every island to a single constant key, so streak counting becomes one GROUP BY — no LAG, no island-start flag, no running SUM. O(n log n) for the per-user ordering." },
    ],
    approach: "Dedupe to one row per (id, day), then GROUP BY (id, login_date − ROW_NUMBER days) — the streak anchor",
    schema: {
      ddl: `CREATE TABLE Accounts (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE Logins (
  login_id   INTEGER PRIMARY KEY,
  id         INTEGER NOT NULL REFERENCES Accounts(id),
  login_date TEXT NOT NULL
);`,
      seed: `INSERT INTO Accounts (id, name) VALUES (1,'Alice'),(2,'Bob'),(7,'Cara');
INSERT INTO Logins (login_id, id, login_date) VALUES
  (1,1,'2023-01-01'),(2,1,'2023-01-02'),(3,1,'2023-01-03'),
  (4,1,'2023-01-04'),(5,1,'2023-01-05'),(6,1,'2023-01-06'),(7,1,'2023-01-07'),
  (8,2,'2023-01-01'),(9,2,'2023-01-02'),(10,2,'2023-01-03'),(11,2,'2023-01-05'),
  (12,2,'2023-01-06'),(13,2,'2023-01-08'),(14,2,'2023-01-10'),(15,2,'2023-01-11'),
  (16,7,'2023-02-01'),(17,7,'2023-02-02'),(18,7,'2023-02-03'),
  (19,7,'2023-02-04'),(20,7,'2023-02-05'),(21,7,'2023-02-05'),(22,7,'2023-02-20');`,
      tables: [
        { name: "Accounts", note: "3 users" },
        { name: "Logins", note: "22 sign-ins — Alice 7 straight days; Bob max run 3 (NOT active); Cara has a DUPLICATE 02-05 row and a 02-20 outlier" },
      ],
    },
    code: `WITH days AS (                    -- one row per user per day
    SELECT DISTINCT id, login_date
    FROM Logins
),
grp AS (
    SELECT
        id,
        login_date,
        DATE(login_date, '-' || (ROW_NUMBER() OVER (
            PARTITION BY id ORDER BY login_date
        ) - 1) || ' days') AS anchor -- constant across a consecutive run
    FROM days
),
streaks AS (
    SELECT id, anchor, COUNT(*) AS n -- rows sharing an anchor = streak length
    FROM grp
    GROUP BY id, anchor
)
SELECT a.id, a.name
FROM streaks s
JOIN Accounts a ON a.id = s.id
WHERE s.n >= 5
ORDER BY a.id;`,
    walkthrough: [
      "days dedupes to one row per user-day: Alice 01-01…01-07 (rn 1–7), Bob 01-01,02,03,05,06,08,10,11 (rn 1–8), Cara 02-01…02-05 once each plus 02-20 (rn 1–6) — the duplicate 02-05 collapsed.",
      "Anchors: Alice's seven dates shifted back by 0…6 days all land on 2023-01-01 — one 7-row group. Cara's 02-01…02-05 land on 2023-02-01 (5 rows); 02-20 anchors alone. Bob's run breaks at the 01-05 gap: anchors 01-01 (n=3), 01-02, 01-03, 01-04 — max group 3.",
      "streaks counts per anchor and the WHERE keeps n >= 5: Alice (7) and Cara (5) qualify, Bob (3) does not — joined to Accounts for names, ordered by id: (1,'Alice'),(7,'Cara').",
    ],
    time: "O(n log n) — the dedupe plus the per-user ordering that drives the anchors",
    space: "O(n) — the deduped days and one row per streak",
    followUps: [
      "Report each qualifying streak's start and end date alongside the user — MIN(login_date) and MAX(login_date) inside the streaks GROUP BY.",
      "Re-solve with LAG: diff each day from the previous, then flag island starts and sum them — compare the two shapes for readability and cost.",
    ],
    related: ["game-play-analysis-v", "find-total-time-spent-by-each-employee"],
    order: "exact",
    xp: 20,
  },
];
