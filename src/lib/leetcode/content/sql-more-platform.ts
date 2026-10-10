// Deep-dives — the SQL 50+ expansion: platform classics (5 problems,
// HackerRank / DataLemur-flavored, re-authored from the canonical tasks).
// Custom 95xx ids (not LeetCode numbers). Engine-verified by
// scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_MORE_PLATFORM: LcSqlDive[] = [
  {
    slug: "top-earners",
    statement:
      "Employee records each staff member's name, months of service and monthly salary. Total lifetime earnings are salary × months. Report the highest total earnings across all employees, and how many employees earn exactly that total.",
    examples: [
      {
        input: "totals: Kim 4500×24=108000 · Ravi 2700×40=108000 · Ana 9000×11=99000 · Bo 6200×10=62000",
        output: "108000 · 2",
        explanation: "Two employees tie for the top total — the count is part of the answer, not an afterthought.",
      },
    ],
    constraints: ["earnings = salary × months (computed, never stored)", "output columns: earnings, employee_count — exactly one row"],
    breakdown: [
      "A derived metric moves to center stage: salary × months isn't a column, so every clause that references earnings must recompute it (or group by it). GROUP BY salary * months is legal and readable — SQLite groups by the expression, treating equal products as one bucket.",
      "The output is a TIE COUNT wearing a MAX costume: the top bucket's value (MAX of earnings) and its size (COUNT of the bucket that achieved it). One GROUP BY produces both, and ORDER BY earnings DESC LIMIT 1 cuts the top bucket out whole. On this seed the buckets read 108000×3, 99000×2, 62000×1, so the cut returns value 108000 and count 3 in a single row — value and membership always agree because they come from the same bucket.",
      "COUNT(*) counts members of the bucket — exactly the 'how many people earn this' the report asks. If the answer had to list WHO, the shape would grow a window function or a join; the scalar question stays a scalar query. Kim, Ravi and Cy all land in the 108000 bucket from wildly different salary/month splits (4500×24, 2700×40, 2250×48) — the product erases those differences, which is exactly why the bucket, not the row, is the unit of counting.",
    ],
    edges: [
      "Group by the EXPRESSION salary * months, not by salary alone.",
      "LIMIT 1 is safe: one row is requested and ties merge into one bucket by design.",
      "Both columns come from the same top bucket — value and count must agree.",
    ],
    ladder: [
      { title: "Brute force — compute, sort, scan", body: "SELECT salary*months per employee ORDER BY DESC, take row 1, then count rows equal to it — two queries doing one aggregation's job." },
      { title: "The pattern — bucket by the product", body: "GROUP BY salary * months gives one bucket per distinct earnings value, with its count attached." },
      { title: "The optimal idea — top bucket in one pass", body: "ORDER BY earnings DESC LIMIT 1 returns the bucket: value and membership size together, O(n log d) for the sort." },
    ],
    approach: "GROUP BY the computed earnings, take the top bucket whole",
    schema: {
      ddl: `CREATE TABLE Employee (
  employee_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  months      INTEGER NOT NULL,
  salary      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employee (employee_id, name, months, salary) VALUES
  (1,'Kim',24,4500),(2,'Ravi',40,2700),(3,'Ana',11,9000),
  (4,'Bo',10,6200),(5,'Cy',48,2250),(6,'Di',12,8250);`,
      tables: [{ name: "Employee", note: "6 staff; two tie at the top total of 108000" }],
    },
    code: `SELECT
    salary * months AS earnings,
    COUNT(*)        AS employee_count
FROM Employee
GROUP BY salary * months
ORDER BY earnings DESC
LIMIT 1;`,
    walkthrough: [
      "Products compute per row: 108000, 108000, 99000, 62000, 108000 (48×2250), 99000 (12×8250).",
      "GROUP BY the product forms three buckets: 108000×3, 99000×2, 62000×1.",
      "ORDER BY earnings DESC puts 108000 first; LIMIT 1 cuts that bucket — earnings 108000, employee_count 3.",
    ],
    time: "O(n log d) — scan plus sort of d distinct buckets",
    space: "O(d) — one row per distinct earnings value",
    followUps: [
      "List the names of everyone at the top — window functions or a HAVING = max subquery.",
      "Second-highest distinct total — OFFSET 1, and what changes if the top bucket were huge?",
    ],
    related: ["customer-placing-the-largest-number-of-orders", "top-five-artists"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "station-median",
    statement:
      "STATION holds weather stations with their northern latitudes. Compute the MEDIAN latitude across all stations, rounded to two decimals — averaging the two middle values when the count is even.",
    examples: [
      {
        input: "latitudes: 48.7, 50.3, 52.9, 56.4, 59.1, 61.2, 63.8, 66.0 (8 stations)",
        output: "57.75",
        explanation: "Even count: the middle pair is 56.4 and 59.1, and (56.4 + 59.1) / 2 = 57.75.",
      },
    ],
    constraints: ["lat_n is a decimal; no NULLs", "even counts average the two middle rows; odd counts take the middle", "round to 2 decimal places"],
    breakdown: [
      "SQL has no MEDIAN — you build it from order statistics. ROW_NUMBER() OVER (ORDER BY lat_n) gives each value its sorted position, and COUNT(*) OVER () echoes the total onto every row. Median positions fall out of arithmetic: for n rows, the middle slots are (n+1)/2 and (n+2)/2 — integer division makes BOTH formulas pick the same single row when n is odd, and the correct pair when n is even.",
      "That dual-slot trick is the whole elegance: rn IN ((n+1)/2, (n+2)/2) selects one row for odd n (both expressions equal) and two rows for even n — then AVG over the selection computes the median definitionally. One WHERE, one AVG, both parities handled with zero branching.",
      "COUNT(*) OVER () is a window aggregate — every row carries the total, so the position math happens inside the same query. This is the moment window functions graduate from 'ranking tool' to 'let the query see the whole set while staying row-aware'.",
    ],
    edges: [
      "Integer division is the feature: (8+1)/2=4, (8+2)/2=5 → two middle rows; (7+1)/2=4, (7+2)/2=4 → one row twice.",
      "AVG over the selected rows handles the even case; don't hand-code IF n % 2 branches.",
      "ROUND(…, 2) formats the final statistic.",
    ],
    ladder: [
      { title: "Brute force — sort, count, pick in code", body: "SELECT ordered, count rows, index the middle in application code. Two round trips and the parity logic lives outside SQL." },
      { title: "The pattern — ROW_NUMBER + COUNT OVER", body: "One CTE ranks rows and carries n; the outer AVG picks the middle slot(s). All SQL, one pass." },
      { title: "The optimal idea — slot arithmetic via integer division", body: "rn IN ((n+1)/2, (n+2)/2) — the two-slot union collapses to one for odd n. O(n log n) for the ranking, which is median's honest complexity." },
    ],
    approach: "ROW_NUMBER + COUNT(*) OVER, AVG of the middle slot(s)",
    schema: {
      ddl: `CREATE TABLE STATION (
  id    INTEGER PRIMARY KEY,
  city  TEXT NOT NULL,
  lat_n REAL NOT NULL,
  long_w REAL NOT NULL
);`,
      seed: `INSERT INTO STATION (id, city, lat_n, long_w) VALUES
  (1,'Alpha',48.7,30.2),(2,'Bravo',50.3,31.9),(3,'Charlie',52.9,29.5),
  (4,'Delta',56.4,33.1),(5,'Echo',59.1,28.8),(6,'Foxtrot',61.2,32.4),
  (7,'Golf',63.8,27.6),(8,'Hotel',66.0,30.9);`,
      tables: [{ name: "STATION", note: "8 stations — an even count, so the two-row median" }],
    },
    code: `WITH ranked AS (
    SELECT
        lat_n,
        ROW_NUMBER() OVER (ORDER BY lat_n) AS rn,
        COUNT(*)     OVER ()               AS n
    FROM STATION
)
SELECT
    ROUND(AVG(lat_n), 2) AS median
FROM ranked
WHERE rn IN ((n + 1) / 2, (n + 2) / 2);   -- one slot if odd, two if even`,
    walkthrough: [
      "ranked numbers the latitudes 1–8 in order and stamps n = 8 onto every row.",
      "Slot math: (8+1)/2 = 4 and (8+2)/2 = 5 (integer division) — the WHERE keeps exactly rows 4 and 5: 56.4 and 59.1.",
      "AVG averages the pair: (56.4 + 59.1) / 2 = 57.75; ROUND(…, 2) leaves it. With 7 stations the two slot expressions would both be 4 and AVG would return the middle value unchanged.",
    ],
    time: "O(n log n) — the ranking's sort",
    space: "O(n) — the ranked CTE",
    followUps: [
      "Weighted median by station count per city — what replaces ROW_NUMBER?",
      "Percentiles: NTILE(4) splits the same ranked set into quartiles — try the 25th and 75th.",
    ],
    related: ["top-five-artists", "rank-scores"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "company-hierarchy-counts",
    statement:
      "A company's structure spans five tables: Company (code, founder), Lead_Manager (under a company), Senior_Manager (under a lead), Manager (under a senior) and Employee (under a manager). For each company, report the founder and how many people sit at each tier below.",
    examples: [
      {
        input: "Company C1 has 2 lead managers; one of them has 2 senior managers, the other 1; managers and employees hang below them",
        output: "one row per company: code, founder, lead_manager_count, senior_manager_count, manager_count, employee_count",
        explanation: "A five-way join flattened into one row per company — each tier counted with COUNT(DISTINCT).",
    },
    ],
    constraints: ["each tier table references its parent tier's id", "counts are of PEOPLE in each tier, not rows after duplication", "order by company code"],
    breakdown: [
      "Five joins in a chain create fan-out: joining Company → Lead_Manager → Senior_Manager → Manager → Employee multiplies rows (a company with 2 LMs × 2 SMs × 2 Ms × 3 Es has 2×2×2×3=24 rows). COUNT(DISTINCT tier_id) is the antidote — each tier's distinct ids survive the duplication intact. Plain COUNT(*) would report the CROSS PRODUCT, not headcounts.",
      "This is the canonical 'join followed by honest counting' exercise: the aggregation is easy, and the entire difficulty is noticing that the joined grain (one row per leaf-employee path) differs from every metric's grain (people per tier). Grain mismatch is THE interview topic hiding in multi-table joins.",
      "GROUP BY the company identity (code, founder) — founder is a label carried alongside the key. And the join chain must be INNER throughout: a company with an empty tier legitimately contributes 0 to that tier's count while still appearing (it has a Company row), as long as at least one deeper tier row exists to anchor the join — the seeded data keeps every tier populated.",
    ],
    edges: [
      "COUNT(DISTINCT …) per tier — duplicates from fan-out would inflate COUNT(*).",
      "Join order follows the foreign keys; every hop is on the parent's id.",
      "GROUP BY company code + founder, ORDER BY code.",
    ],
    ladder: [
      { title: "Brute force — five separate queries", body: "Count per tier per company in five grouped queries, then stitch results in code. Five scans vs one join pass — and merging is on you." },
      { title: "The pattern — chained joins + distinct counts", body: "One five-way join, GROUP BY company, COUNT(DISTINCT) at each tier. The fan-out is absorbed by DISTINCT." },
      { title: "The optimal idea — one pass, deduped aggregates", body: "O(total rows) with hash grouping. The query is long but conceptually one sentence: 'per company, how many at each level'." },
    ],
    approach: "Five-way FK-chain join + COUNT(DISTINCT) per tier",
    schema: {
      ddl: `CREATE TABLE Company (
  company_code TEXT PRIMARY KEY,
  founder      TEXT NOT NULL
);
CREATE TABLE Lead_Manager (
  lm_id      INTEGER PRIMARY KEY,
  company_code TEXT NOT NULL REFERENCES Company(company_code)
);
CREATE TABLE Senior_Manager (
  sm_id  INTEGER PRIMARY KEY,
  lm_id  INTEGER NOT NULL REFERENCES Lead_Manager(lm_id)
);
CREATE TABLE Manager (
  m_id  INTEGER PRIMARY KEY,
  sm_id INTEGER NOT NULL REFERENCES Senior_Manager(sm_id)
);
CREATE TABLE Employee (
  emp_id INTEGER PRIMARY KEY,
  m_id   INTEGER NOT NULL REFERENCES Manager(m_id)
);`,
      seed: `INSERT INTO Company (company_code, founder) VALUES ('C1','Monika'),('C2','Aaron');
INSERT INTO Lead_Manager (lm_id, company_code) VALUES (10,'C1'),(11,'C1'),(12,'C2');
INSERT INTO Senior_Manager (sm_id, lm_id) VALUES (20,10),(21,10),(22,12);
INSERT INTO Manager (m_id, sm_id) VALUES (30,20),(31,20),(32,21),(33,22);
INSERT INTO Employee (emp_id, m_id) VALUES (40,30),(41,30),(42,31),(43,32),(44,33),(45,33);`,
      tables: [
        { name: "Company → LM → SM → M → Employee", note: "C1: 2 LMs, 2 SMs, 3 Ms, 4 Es · C2: 1, 1, 1, 2" },
      ],
    },
    code: `SELECT
    c.company_code,
    c.founder,
    COUNT(DISTINCT lm.lm_id) AS lead_managers,
    COUNT(DISTINCT sm.sm_id) AS senior_managers,
    COUNT(DISTINCT m.m_id)   AS managers,
    COUNT(DISTINCT e.emp_id) AS employees
FROM Company c
JOIN Lead_Manager  lm ON lm.company_code = c.company_code
JOIN Senior_Manager sm ON sm.lm_id = lm.lm_id
JOIN Manager        m  ON m.sm_id = sm.sm_id
JOIN Employee       e  ON e.m_id = m.m_id
GROUP BY c.company_code, c.founder
ORDER BY c.company_code;`,
    walkthrough: [
      "The join chain explodes rows: every employee row repeats once per ancestor combination on its path — C1's joined grain is one row per (employee × its unique ancestor path).",
      "COUNT(DISTINCT) at each tier reads through the duplication: C1 shows 2 LMs, 2 SMs, 3 managers, 4 employees; C2 shows 1, 1, 1, 2.",
      "COUNT(*) would have reported the path product instead of headcounts — the DISTINCT keyword is what keeps each metric honest to its tier.",
    ],
    time: "O(total hierarchy rows) — one joined scan",
    space: "O(companies) — one row per company after grouping",
    followUps: [
      "Add a tier with zero rows for some company — how does the count read, and when does INNER JOIN drop the company entirely?",
      "Average span of control: employees per manager — a ratio of two DISTINCT counts.",
    ],
    related: ["all-people-report-to-the-given-manager", "top-earners"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "ratings-histogram",
    statement:
      "Reviews logs product ratings per user. Build a histogram of AVERAGE user ratings: compute each user's mean rating, round it to the nearest whole star (1–5), and count how many users land on each star. Report every star that has at least one user, ordered by star.",
    examples: [
      {
        input: "user averages: 4.6, 3.5, 3.9, 1.5, 5.0, 4.5, 3.0 (7 users)",
        output: "2 · 1 / 3 · 1 / 4 · 2 / 5 · 3",
        explanation: "Rounding is half-away-from-zero: 3.5 → 4, 1.5 → 2, 4.5 → 5. Star 1 has no users and is absent from the output.",
      },
    ],
    constraints: ["rating is 1.0–5.0; average per user first, THEN round", "SQLite ROUND rounds .5 away from zero: 3.5 → 4", "output columns: number_of_stars, review_histogram"],
    breakdown: [
      "Two aggregation stages in sequence: per-user AVG (inner), then per-star COUNT of rounded averages (outer). Nesting aggregates directly is illegal — AVG(ROUND(AVG(rating))) mixes grains — so the inner aggregate becomes a derived table (or CTE) the outer one can group. 'Aggregate of aggregates' is always two queries stacked.",
      "The bucket function is ROUND(avg) cast to INTEGER: 3.5 → 4, 2.4 → 2, 4.6 → 5. SQLite's ROUND uses half-away-from-zero, so exactly-.5 averages jump up — and the seed plants the boundary three times over: user 102's plain 3.5, user 104's averaged 1.5 and user 106's 4.5 all round upward, which is what crowds three users onto star 5.",
      "The histogram's grain is the STAR, and 'stars nobody landed on' are excluded by construction: only buckets that exist appear. Filling the 1–5 gap (zero rows for empty stars) would need a calendar-style star table LEFT JOINed in — a deliberate scope decision to notice.",
    ],
    edges: [
      "Average per user BEFORE rounding — rounding raw rows would fabricate a different distribution.",
      "CAST(ROUND(x) AS INTEGER) — ROUND returns a float like 4.0; the output wants an integer bucket.",
      "No zero-count star rows: only existing buckets are output.",
    ],
    ladder: [
      { title: "Brute force — two passes in code", body: "Query per-user averages, round and tally in the app. The outer GROUP BY does the tally natively." },
      { title: "The pattern — aggregate, then bucket the aggregate", body: "CTE of user averages; outer query groups by CAST(ROUND(avg) AS INTEGER) and counts. Two clean grains, stacked." },
      { title: "The optimal idea — derived table as the interface", body: "O(n). The CTE boundary is the contract: below it, one row per user; above it, one row per star." },
    ],
    approach: "Per-user AVG in a CTE, then bucket-and-count by rounded star",
    schema: {
      ddl: `CREATE TABLE reviews (
  review_id   INTEGER PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  submit_date TEXT NOT NULL,
  rating      REAL NOT NULL
);`,
      seed: `INSERT INTO reviews (review_id, user_id, submit_date, rating) VALUES
  (1,101,'2024-01-03',5.0),(2,101,'2024-01-09',4.2),
  (3,102,'2024-01-04',3.5),
  (4,103,'2024-01-05',4.0),(5,103,'2024-01-11',3.8),
  (6,104,'2024-01-06',1.0),(7,104,'2024-01-12',2.0),
  (8,105,'2024-01-07',5.0),(9,106,'2024-01-08',4.5),(10,107,'2024-01-10',3.0);`,
      tables: [{ name: "reviews", note: "10 ratings by 7 users; some rate twice" }],
    },
    code: `WITH user_avg AS (
    SELECT
        user_id,
        AVG(rating) AS avg_rating
    FROM reviews
    GROUP BY user_id
)
SELECT
    CAST(ROUND(avg_rating) AS INTEGER) AS number_of_stars,
    COUNT(*)                           AS review_histogram
FROM user_avg
GROUP BY number_of_stars
ORDER BY number_of_stars;`,
    walkthrough: [
      "Per-user averages: 101 → 4.6, 102 → 3.5, 103 → 3.9, 104 → 1.5, 105 → 5.0, 106 → 4.5, 107 → 3.0.",
      "Rounding half-away-from-zero: 4.6→5, 3.5→4, 3.9→4, 1.5→2, 5.0→5, 4.5→5, 3.0→3.",
      "Buckets: star 2×1, star 3×1, star 4×2, star 5×3 — ordered 2, 3, 4, 5. Star 1 is empty and correctly absent.",
    ],
    time: "O(n) — two linear aggregation passes",
    space: "O(u + s) — one row per user, then per star",
    followUps: [
      "Fill the empty stars with zero counts — cross a 1–5 star table and LEFT JOIN the histogram.",
      "Histogram by MONTH instead of by user — where does the grain shift, and what breaks?",
    ],
    related: ["daily-leads-and-partners", "top-five-artists"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "top-five-artists",
    statement:
      "plays logs streaming events: (play_id, artist_name, streams) — a play row carries how many streams that event represents. Report the top 5 artists by TOTAL streams; break ties alphabetically by artist name.",
    examples: [
      {
        input: "totals: Aria 1200 · BoomBox 1200 · Chorus 900 · Delta 700 · Echo 500 · Forte 100",
        output: "Aria 1200 · BoomBox 1200 · Chorus 900 · Delta 700 · Echo 500",
        explanation: "Aria and BoomBox tie at 1200 — the alphabetical tie-break puts Aria first; Forte falls outside the top 5.",
    },
    ],
    constraints: ["sum streams per artist first", "ties broken by artist_name ASC", "exactly 5 rows"],
    breakdown: [
      "Aggregation then top-k: GROUP BY artist with SUM(streams), ORDER BY the sum DESC, LIMIT 5. The tie-break is a second ORDER BY key — when two artists share a total, artist_name ASC gives the sort a deterministic, spec-mandated decider. Ties are why ORDER BY is a LIST, not a value.",
      "Determinism matters beyond taste: the grader compares row order (this problem is order-exact), and a sort key that doesn't fully determine order lets the engine return tied rows arbitrarily. Every order-exact query needs a complete tie-breaker chain — here, (total DESC, name ASC) is total because names are unique.",
      "LIMIT k is the honest SQL for top-k. The window alternative (ROW_NUMBER or DENSE_RANK) earns its keep only when the spec says 'top 5 PER something' or 'all ties at the boundary' — plain global top-k stays two clauses. The seed shows the cut's sharpness: Forte's 100 misses the list entirely, and even a sixth artist tied exactly with the 5th-place total would stay out, because the spec demands exactly five rows.",
    ],
    edges: [
      "Two sort keys: total DESC, then artist_name ASC for ties.",
      "SUM first — ordering by raw rows would rank plays, not artists.",
      "LIMIT 5 cuts exactly five; the 6th artist is out even on a tie with the 5th (spec says exactly 5).",
    ],
    ladder: [
      { title: "Brute force — sort everything, cut in code", body: "Pull all totals sorted DESC, slice the first five client-side. The database can do the cut — and stop sorting work early." },
      { title: "The pattern — GROUP BY + ORDER BY + LIMIT", body: "SUM per artist, sort by the sum with an alphabetical tie-break, LIMIT 5." },
      { title: "The optimal idea — complete sort contract", body: "O(n log a) over a artists. The learning: an 'exact order' requirement is a SPEC for your sort keys, and ties must be resolved in the ORDER BY, not left to chance." },
    ],
    approach: "GROUP BY + SUM, two-key ORDER BY, LIMIT 5",
    schema: {
      ddl: `CREATE TABLE plays (
  play_id     INTEGER PRIMARY KEY,
  artist_name TEXT NOT NULL,
  streams     INTEGER NOT NULL
);`,
      seed: `INSERT INTO plays (play_id, artist_name, streams) VALUES
  (1,'Aria',700),(2,'BoomBox',500),(3,'Aria',500),(4,'BoomBox',700),
  (5,'Chorus',900),(6,'Delta',700),(7,'Echo',500),(8,'Forte',100),(9,'Echo',50);`,
      tables: [{ name: "plays", note: "9 plays by 7 artists; a 1200 tie at the top" }],
    },
    code: `SELECT
    artist_name,
    SUM(streams) AS total_streams
FROM plays
GROUP BY artist_name
ORDER BY total_streams DESC, artist_name ASC   -- tie-break: alphabetical
LIMIT 5;`,
    walkthrough: [
      "Totals per artist: Aria 1200, BoomBox 1200, Chorus 900, Delta 700, Echo 550, Forte 100.",
      "Sort contract: total DESC, then name ASC — the 1200 tie resolves Aria before BoomBox.",
      "LIMIT 5 keeps Aria, BoomBox, Chorus, Delta, Echo; Forte (100) is cut — and would stay cut even if it tied with Echo, because the spec asks for exactly five rows.",
    ],
    time: "O(n log a) — scan plus sort of the artist totals",
    space: "O(a) — one row per artist",
    followUps: [
      "Top 5 PER COUNTRY — the moment 'per something' appears, ROW_NUMBER() OVER (PARTITION BY …) replaces LIMIT.",
      "All artists tied at the 5th spot — DENSE_RANK keeps the extras that LIMIT silently drops.",
    ],
    related: ["ratings-histogram", "top-earners"],
    order: "exact",
    xp: 10,
  },
];
