// Deep-dives — the SQL 50+ expansion, batch 3: analytics & reporting
// (5 problems: reporting ratios, cohort filters, histograms with empty
// buckets, running totals, anti-joins). SQLite dialect, one statement
// each, engine-verified against the per-problem seed.
import type { LcSqlDive } from "../types";

export const SQL_MORE2_ANALYTICS: LcSqlDive[] = [
  {
    slug: "user-activity-for-the-past-30-days-ii",
    statement:
      "Activity logs one row per user session: who did what, between start_date and end_date. Report the average number of sessions per user for the 30-day window ending 2019-07-27 (start_date between 2019-06-28 and 2019-07-27, inclusive), rounded to 2 decimals.",
    examples: [
      {
        input: "Annabelle: sessions on 2019-07-01 through 2019-07-05 · Sally: 2019-07-10 and 2019-07-20 · Jonathan: 2019-08-01 · Khaled: 2019-01-05",
        output: "1.75",
        explanation: "7 sessions fall inside the window, but the denominator is every user in the log — 4 — including Jonathan and Khaled, whose sessions lie outside it: 7 / 4 = 1.75.",
      },
    ],
    constraints: [
      "the window filters start_date only, between 2019-06-28 and 2019-07-27 inclusive; the activity type is irrelevant",
      "one row of Activity is one session; the denominator is ALL users in the log, even those with no sessions in the window",
      "round the final ratio to 2 decimal places; the output is one row, one column",
    ],
    breakdown: [
      "The report is a ratio of two different grains: sessions (rows inside a filtered window) over users (the whole log, unfiltered). Neither count is a GROUP BY of the other, so the cleanest shape is two scalar subqueries — one SELECT in the numerator, one in the denominator — each answering its own question completely before the division merges them into the single reported number.",
      "The trap lives in the denominator. The window predicate must NOT touch it: Jonathan (logging in August) and Khaled (in January) have zero sessions in the window yet still count as users, because the report asks how many sessions the average LOG user ran — including the ones who went quiet. Filtering the denominator to active users would report 7/2 = 3.5 and double the engagement number; this is the same denominator-discipline question monthly-transactions-i asks about monthly spend.",
      "The multiplication by 1.0 is not decoration. SQLite's / between two INTEGERs truncates toward zero — 7/4 is 1 — and ROUND cannot recover a fraction that division already destroyed. COUNT(*) * 1.0 promotes the numerator to REAL (7.0 / 4 = 1.75), and only then does ROUND(…, 2) format a meaningful number. If the window were empty the numerator would be 0 and the query would honestly report 0.0 — a valid answer row, not an error.",
    ],
    edges: [
      "Denominator scope: COUNT(DISTINCT username) over the WHOLE table — the BETWEEN predicate belongs to the numerator alone.",
      "* 1.0 before dividing: integer division truncates 7/4 to 1, and ROUND(…, 2) cannot restore what the division lost.",
      "BETWEEN here is inclusive on both ends — a session starting exactly on 2019-07-27, the window's last day, counts.",
      "An empty window still yields a row (0.0), not zero rows — the scalar subqueries aggregate, they don't filter.",
    ],
    ladder: [
      { title: "Brute force — two queries and a calculator", body: "Count window sessions in one query, distinct users in another, divide in application code — handling divide-by-zero and float formatting yourself." },
      { title: "The pattern — two scalar subqueries", body: "Put each count in its own parenthesized SELECT inside one outer SELECT. Each grain is expressed exactly where it is used; the outer query only formats the ratio." },
      { title: "The optimal idea — promote, then round", body: "COUNT(*) * 1.0 / COUNT(DISTINCT …) wrapped in ROUND(…, 2): two linear scans, O(n), with the REAL promotion happening before the division that would otherwise truncate." },
    ],
    approach: "Two scalar subqueries — filtered session count over whole-log distinct users — promoted to REAL before ROUND",
    schema: {
      ddl: `CREATE TABLE Activity (
  username   TEXT NOT NULL,
  activity   TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date   TEXT NOT NULL
);`,
      seed: `INSERT INTO Activity (username, activity, start_date, end_date) VALUES
  ('Annabelle','Browsing','2019-07-01','2019-07-01'),
  ('Annabelle','Browsing','2019-07-02','2019-07-02'),
  ('Annabelle','Browsing','2019-07-03','2019-07-03'),
  ('Annabelle','Browsing','2019-07-04','2019-07-04'),
  ('Annabelle','Browsing','2019-07-05','2019-07-05'),
  ('Sally','Browsing','2019-07-10','2019-07-10'),
  ('Sally','Browsing','2019-07-20','2019-07-20'),
  ('Jonathan','Browsing','2019-08-01','2019-08-01'),
  ('Khaled','Browsing','2019-01-05','2019-01-05');`,
      tables: [{ name: "Activity", note: "9 sessions by 4 users; only Annabelle and Sally are active inside the window" }],
    },
    code: `SELECT
    ROUND(
        (SELECT COUNT(*)
         FROM Activity
         WHERE start_date BETWEEN '2019-06-28' AND '2019-07-27') * 1.0
        /
        (SELECT COUNT(DISTINCT username) FROM Activity),
        2
    ) AS average_sessions_per_user;`,
    walkthrough: [
      "Numerator: sessions starting in [2019-06-28, 2019-07-27] — Annabelle's five July days plus Sally's 2019-07-10 and 2019-07-20 = 7. Jonathan's 2019-08-01 and Khaled's 2019-01-05 fall outside.",
      "Denominator: COUNT(DISTINCT username) over the entire log = 4 — Annabelle, Sally, Jonathan, Khaled. No window filter touches this scan.",
      "7 * 1.0 / 4 = 1.75; ROUND(…, 2) leaves it intact — one row: average_sessions_per_user = 1.75.",
    ],
    time: "O(n) — one filtered scan plus one distinct-username scan",
    space: "O(u) — the distinct-username set built for the denominator",
    followUps: [
      "Report the same average for every 30-day window ending at each distinct start_date — at what point do two scalar subqueries stop being the right shape?",
      "Per-user session counts inside the window INCLUDING users with zero sessions — what does the users dimension need to look like for the LEFT JOIN to keep them?",
    ],
    related: ["monthly-transactions-i", "find-total-time-spent-by-each-employee"],
    order: "any",
    xp: 10,
  },
  {
    slug: "customers-who-bought-a-and-b-not-c",
    statement:
      "Customers lists shoppers and Orders logs each purchase as a row naming one product. Report the customers who bought product 'A' AND product 'B' but never bought 'C', in ascending customer_id.",
    examples: [
      {
        input: "Alba: A, A, B · Ben: A, A, B · Chi: A, C · Dot: B, C",
        output: "1 Alba · 2 Ben",
        explanation: "Chi fails the AND (no 'B' order); Dot fails the NOT (she bought 'C'). The A-and-B-but-never-C intersection keeps exactly Alba and Ben.",
      },
    ],
    constraints: [
      "bought 'A' AND 'B' means at least one order of each — order and count do not matter",
      "never 'C' means zero 'C' orders; a customer holding A, B and C is excluded",
      "output columns: customer_id, customer_name, ordered by customer_id",
    ],
    breakdown: [
      "Two filtered self-joins work as an AND-machine: Orders is joined twice under two aliases, a restricted to product 'A' and b restricted to 'B'. A customer row survives only if the 'A' side matched at least one of their orders AND the 'B' side did too — each INNER JOIN is an existence check wearing join syntax, with (customer, product) kept together in the same ON clause.",
      "But every join also FANS OUT: Alba bought 'A' twice (orders 101 and 110), so her single Customers row pairs with both 'A' rows and the join prints her twice. The report's grain is the CUSTOMER, not the order pair, so SELECT DISTINCT collapses the duplicates back to one row per customer. Fan-out against the report's grain is the standard reason DISTINCT rides on top of multi-joins — here it is load-bearing, not cosmetic.",
      "The NOT is a third population — customers holding a 'C' order — removed with a NOT IN subquery. It is safe here only because Orders.customer_id is NOT NULL: one NULL in the subquery's list would turn x NOT IN (…, NULL) into NULL for every non-matching row and silently empty the report — the NULL-poisoning behind employees-whose-manager-left-the-company. The one-pass alternative is conditional aggregation: GROUP BY customer_id HAVING SUM(product_name = 'A') > 0 AND SUM(product_name = 'B') > 0 AND SUM(product_name = 'C') = 0, since booleans sum as 1/0 in SQLite. It reads almost verbatim like the requirement and touches Orders once; the join version probes with per-condition filters that map more directly onto indexes. Both are legitimate — pick one style per team and stay consistent.",
    ],
    edges: [
      "DISTINCT is load-bearing: Alba's two 'A' orders duplicate her row — without it the answer prints Alba twice.",
      "NOT IN NULL-poisoning: safe only because customer_id is NOT NULL; on nullable keys switch to NOT EXISTS.",
      "Two different rejection reasons: Chi fails the AND (no 'B'), Dot fails the NOT (bought 'C') — test data should exercise both filters for different reasons.",
      "Each product filter lives in its alias's ON clause, tying (customer, product) together per join — that is what makes each join read as an existence check.",
    ],
    ladder: [
      { title: "Brute force — three lists and set algebra", body: "Pull buyers of A, buyers of B, buyers of C; intersect the first two and subtract the third in application code. Three round trips, and the set logic lives outside the database." },
      { title: "The pattern — filtered self-joins + NOT IN", body: "Two INNER JOINs through product-filtered aliases perform the AND; a NOT IN subquery performs the NOT; DISTINCT re-collapses the join's fan-out to the customer grain." },
      { title: "The optimal idea — conditional aggregation in one pass", body: "GROUP BY customer_id HAVING SUM(product_name='A')>0 AND SUM(product_name='B')>0 AND SUM(product_name='C')=0 — one scan of Orders, no joins, intent written almost like the spec sentence." },
    ],
    approach: "Two product-filtered joins (the AND) + NOT IN subquery (the NOT), DISTINCT for the fan-out",
    schema: {
      ddl: `CREATE TABLE Customers (
  customer_id   INTEGER PRIMARY KEY,
  customer_name TEXT NOT NULL
);
CREATE TABLE Orders (
  order_id     INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL REFERENCES Customers(customer_id),
  product_name TEXT NOT NULL
);`,
      seed: `INSERT INTO Customers (customer_id, customer_name) VALUES
  (1,'Alba'),(2,'Ben'),(3,'Chi'),(4,'Dot');
INSERT INTO Orders (order_id, customer_id, product_name) VALUES
  (101,1,'A'),(102,1,'B'),(110,1,'A'),(103,2,'A'),(104,2,'A'),
  (105,2,'B'),(106,3,'A'),(107,3,'C'),(108,4,'B'),(109,4,'C');`,
      tables: [
        { name: "Customers", note: "4 shoppers" },
        { name: "Orders", note: "10 purchases; Alba and Ben each hold two 'A' orders" },
      ],
    },
    code: `SELECT DISTINCT                     -- fan-out fix: the grain is the customer
    c.customer_id,
    c.customer_name
FROM Customers c
JOIN Orders a ON a.customer_id = c.customer_id AND a.product_name = 'A'
JOIN Orders b ON b.customer_id = c.customer_id AND b.product_name = 'B'
WHERE c.customer_id NOT IN (        -- safe: customer_id is NOT NULL
    SELECT customer_id FROM Orders WHERE product_name = 'C'
)
ORDER BY c.customer_id;`,
    walkthrough: [
      "Alias a keeps the 'A' rows (101, 110 for Alba; 103, 104 for Ben; 106 for Chi), alias b keeps the 'B' rows (102 for Alba; 105 for Ben; 108 for Dot). Chi has no 'B' and Dot no 'A' — both drop out of the join before the NOT is even evaluated.",
      "NOT IN removes customers holding a 'C' order: {3 Chi, 4 Dot} — already absent, but the guard is what protects against an A+B+C customer.",
      "The join fans Alba and Ben to two rows each (two 'A' orders × one 'B' order); DISTINCT re-collapses them. Output in id order: (1,'Alba'),(2,'Ben').",
    ],
    time: "O(o) — one probe pass per join over the o orders",
    space: "O(c) — one row per qualifying customer",
    followUps: [
      "Rewrite the report with conditional aggregation (HAVING SUM …) — which version would you extend to 'bought A at least twice', and why?",
      "Swap NOT IN for a LEFT JOIN … IS NULL anti-join — where must the product filter sit, and what changes on nullable keys?",
    ],
    related: ["monthly-transactions-i", "bank-account-summary-ii"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "create-a-session-bar-chart",
    statement:
      "Sessions records one row per user session with its duration in minutes. Build a bar chart of session lengths: one row for each 5-minute bin [0-5>, [5-10> and [10-15> — left edge included, right edge excluded — with the number of sessions in it. Every bin must appear exactly once, even when it holds no sessions, ordered from the shortest bin to the longest.",
    examples: [
      {
        input: "durations: 1, 4, 5, 6, 9, 10, 12, 14",
        output: "[0-5> · 2 / [5-10> · 3 / [10-15> · 3",
        explanation: "Duration 5 sits on a seam and belongs to [5-10>, not [0-5> — bins are left-closed and right-open, so boundary values always go up.",
      },
    ],
    constraints: [
      "bins are [0-5>, [5-10>, [10-15>: include the left edge, exclude the right edge",
      "all three bins appear exactly once, in bin order, even with a zero count",
      "output columns: label (the bin string), sessions_count",
    ],
    breakdown: [
      "Plain GROUP BY can only report buckets that exist in the data — group by a CASE bucket of duration and an empty range simply has no row to group. But this report is a CHART: a bar for every bin, including zero-height ones. The standard fix is a dimension table: a CTE built from VALUES enumerates the bins with their bounds, and a LEFT JOIN from bins to sessions guarantees exactly one output row per bin, populated or not.",
      "The join bounds are half-open — s.duration >= b.lo AND s.duration < b.hi — which keeps the bins DISJOINT: duration 5 fails [0-5>'s < 5 and passes [5-10>'s >= 5, so it lands in exactly one bin, and 10 steps up the same way. Closed-on-both-ends intervals would double-count every seam value and silently inflate the chart.",
      "The tally must be COUNT(s.session_id) — counting the MATCHED side. For an empty bin the LEFT JOIN synthesizes one row where every s.* column is NULL; COUNT(*) counts that phantom row as 1, while COUNT(s.session_id) sees NULL and honestly reports 0. Counting a right-hand column of a LEFT JOIN is the generic zero-safe tally. The CASE-WHEN bucketing alternative is shorter, but it structurally cannot emit empty bins — fixing THAT query means bolting on a bin dimension, which lands you right back at this shape.",
    ],
    edges: [
      "Half-open seams: 5 belongs to [5-10> and 10 to [10-15> — >= lo AND < hi keeps every session in exactly one bin.",
      "COUNT(s.session_id), never COUNT(*): an empty bin's phantom NULL row must tally 0, not 1.",
      "Sort by the numeric bound b.lo, not by label — alphabetical order would print [0-5>, [10-15>, [5-10> and garble the chart.",
      "The VALUES CTE names its columns inline — bins(label, lo, hi) — a dimension table with no CREATE TABLE required.",
    ],
    ladder: [
      { title: "Brute force — CASE buckets in code", body: "GROUP BY a CASE WHEN duration < 5 … expression and fill the missing bins in the application. The database returns only the buckets that exist; the chart requirement leaks into code." },
      { title: "The pattern — a bins dimension table", body: "A VALUES CTE lists the three bins; LEFT JOIN sessions on half-open bounds; GROUP BY the bin. Empty bins survive the join as NULL-extended rows." },
      { title: "The optimal idea — count the matched side", body: "COUNT(s.session_id) turns the NULL-extended rows into honest zeros. One scan of sessions against 3 constant bins, O(n) — the empty-bin requirement is satisfied by construction." },
    ],
    approach: "VALUES-CTE dimension table LEFT JOINed on half-open bounds, COUNT of the matched side",
    schema: {
      ddl: `CREATE TABLE Sessions (
  session_id INTEGER PRIMARY KEY,
  duration   INTEGER NOT NULL
);`,
      seed: `INSERT INTO Sessions (session_id, duration) VALUES
  (1,1),(2,4),(3,5),(4,6),(5,9),(6,10),(7,12),(8,14);`,
      tables: [{ name: "Sessions", note: "8 sessions; durations 5 and 10 sit exactly on bin seams" }],
    },
    code: `WITH bins(label, lo, hi) AS (
    VALUES ('[0-5>', 0, 5),
           ('[5-10>', 5, 10),
           ('[10-15>', 10, 15)
)
SELECT
    b.label,
    COUNT(s.session_id) AS sessions_count   -- NULL on empty bins counts as 0
FROM bins b
LEFT JOIN Sessions s
       ON s.duration >= b.lo AND s.duration < b.hi
GROUP BY b.label, b.lo, b.hi
ORDER BY b.lo;`,
    walkthrough: [
      "The join sorts each duration into exactly one bin: 1 and 4 satisfy 0 <= d < 5; 5, 6 and 9 satisfy 5 <= d < 10 (5 failed [0-5>'s < 5); 10, 12 and 14 satisfy 10 <= d < 15 (10 stepped past [5-10>'s < 10).",
      "Per-bin tallies count matched session_ids: [0-5> → 2, [5-10> → 3, [10-15> → 3.",
      "Had no session lasted 10–15 minutes, the LEFT JOIN would still emit that bins row with a NULL session_id and COUNT(s.session_id) would report 0 — all three bars survive either way, and ORDER BY b.lo prints them shortest-first.",
    ],
    time: "O(n) — one scan of sessions against 3 constant bins",
    space: "O(b) — one output row per bin",
    followUps: [
      "Add a fourth bin for sessions of 15 minutes or more — what bound do you give a bin with no upper edge, and does the join stay disjoint?",
      "Show each bin's share of all sessions as a percentage — where does the * 1.0 integer-division trap reappear?",
    ],
    related: ["ratings-histogram", "reported-posts"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "last-person-to-fit-in-the-elevator",
    statement:
      "A queue of people waits for an elevator that holds at most 1000 kg. People board strictly in turn order, and each person steps in only if the running total — everyone aboard, including them — stays within the cap. Report the name of the last person who actually boards.",
    examples: [
      {
        input: "turns 1–5: Ana 200 · Bo 300 · Cy 250 · Di 250 · Ed 400 (cap 1000)",
        output: "Di",
        explanation: "Prefix totals run 200, 500, 750, 1000, 1400 — Di boards with the total exactly at the cap; Ed would push it to 1400 and stays out (as does anyone after him).",
      },
    ],
    constraints: [
      "boarding follows ascending turn; a person boards only if the running total stays at most 1000 kg",
      "a running total of exactly 1000 still boards — the boundary is <=, not <",
      "output: one row, the boarding person's name",
    ],
    breakdown: [
      "The elevator question is a RUNNING-TOTAL question: the person at turn t boards iff weight(1) + … + weight(t) <= 1000. SUM(weight) OVER (ORDER BY turn) computes exactly that prefix sum — the same aggregate as GROUP BY, but scoped to 'everything up to this row' instead of a whole bucket, and without collapsing the rows it measures. This is the window aggregate's graduation moment: from ranking (ROW_NUMBER) to carrying a cumulative fact down the table.",
      "The frame is written explicitly: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. With ORDER BY present, the DEFAULT frame is RANGE to CURRENT ROW, and RANGE treats PEERS — rows equal on the ORDER BY key — as one unit, handing every peer the same total including all of them. Here turn is the PRIMARY KEY, so peers are impossible and both frames agree; real columns (timestamps, duplicated sort keys) do not offer that guarantee, which is why writing the ROWS frame is the habit worth building while the stakes are visible.",
      "Selection rides on a structural fact: weights are positive, so boarders form a PREFIX of the queue — once one person is refused, everyone behind them is refused too. 'The last person to board' is therefore the survivor with the greatest turn: filter WHERE running <= 1000, ORDER BY turn DESC, LIMIT 1. The boundary is the trap — Di lands the total exactly on 1000 and boards (<=, not <). The pre-window alternative is a self-join prefix sum (per turn, SUM of every weight with a smaller-or-equal turn, HAVING the total <= 1000, then take the max turn) — correct, but it re-scans the queue per row where the window sorts once.",
    ],
    edges: [
      "Exactly-at-cap boards: 200+300+250+250 = 1000 — a < predicate would wrongly stop the elevator at Cy.",
      "Explicit ROWS frame vs the default RANGE: peers on the ORDER BY key would merge under RANGE; safe here only because turn is a PRIMARY KEY.",
      "Do not hunt for 'the person whose weight would exceed the cap' — the answer is the last turn whose PREFIX total fits; individual weights never decide alone.",
      "ORDER BY turn DESC LIMIT 1 selects by turn, the boarding key — not by running weight, which could tie.",
    ],
    ladder: [
      { title: "Brute force — re-sum the prefix per person", body: "For each turn, SUM(weight) over all turns up to it (self-join or correlated subquery), keep the fits, take the max turn. Quadratic-style work for a sum a single pass could carry." },
      { title: "The pattern — window running total", body: "SUM(weight) OVER (ORDER BY turn ROWS UNBOUNDED PRECEDING TO CURRENT ROW) stamps each row with its prefix total in one sorted pass." },
      { title: "The optimal idea — filter the prefix, take the tail", body: "WHERE running <= 1000 keeps the boarding prefix; ORDER BY turn DESC LIMIT 1 lifts its last row. O(n log n) for the window's sort, and the prefix property guarantees that row is the answer." },
    ],
    approach: "SUM() OVER (ORDER BY turn) running total → filter <= 1000 → last survivor by turn",
    schema: {
      ddl: `CREATE TABLE QueueQ (
  turn        INTEGER PRIMARY KEY,
  person_name TEXT NOT NULL,
  weight      INTEGER NOT NULL
);`,
      seed: `INSERT INTO QueueQ (turn, person_name, weight) VALUES
  (1,'Ana',200),(2,'Bo',300),(3,'Cy',250),(4,'Di',250),(5,'Ed',400);`,
      tables: [{ name: "QueueQ", note: "5 people in turn order; Di's boarding lands exactly on the 1000 kg cap" }],
    },
    code: `WITH run AS (
    SELECT
        person_name,
        turn,
        SUM(weight) OVER (
            ORDER BY turn
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS running              -- prefix total through this turn
    FROM QueueQ
)
SELECT person_name
FROM run
WHERE running <= 1000             -- exactly-at-cap still boards
ORDER BY turn DESC
LIMIT 1;`,
    walkthrough: [
      "The window walks the queue by turn and stamps prefix totals: Ana 200, Bo 500, Cy 750, Di 1000, Ed 1400.",
      "WHERE running <= 1000 keeps turns 1–4; Ed's 1400 fails — and by the prefix property, every turn after him would fail too.",
      "ORDER BY turn DESC LIMIT 1 takes the greatest surviving turn: 4 → Di, who boards with the elevator exactly at its 1000 kg cap.",
    ],
    time: "O(n log n) — the window's sort by turn",
    space: "O(n) — the running-total CTE",
    followUps: [
      "Report everyone who did NOT board — flip the filter; the prefix property guarantees the refusals form a suffix of the queue.",
      "Give the elevator two trips (it resets to 0 whenever the next person would not fit) — how would you detect the reset and restart the running total?",
    ],
    related: ["find-total-time-spent-by-each-employee", "top-earners"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "sellers-with-no-sales",
    statement:
      "Seller lists the marketplace's sellers and Orders logs each sale with the date it happened. Report, by name and in alphabetical order, the sellers who made NO sales in calendar year 2020.",
    examples: [
      {
        input: "Ada sells 2020-05-30 · Ben sells 2019-10-01 and 2021-02-15 · Cy sells three times across 2020 · Dee never sells",
        output: "Ben · Dee",
        explanation: "Ben's sales straddle 2020 without touching it; Dee has no sales at all — 'no sales in 2020' includes 'no sales ever'.",
      },
    ],
    constraints: [
      "calendar year 2020 means sale_date in [2020-01-01, 2021-01-01) — half-open",
      "sellers with no orders at all still qualify: absence covers them too",
      "output column: seller_name, one row per qualifying seller, alphabetical",
    ],
    breakdown: [
      "'No sales in 2020' is a NEGATIVE predicate, and SQL's native shape for it is the anti-join: keep the sellers whose id does NOT appear among 2020's orders. Step one builds the excluded set — a date-range filter over Orders; step two is NOT IN against it. Notice what the anti-join never does: it does not count, group, or even join Orders to Seller — absence is the entire answer. Dee, who has never sold anything, qualifies for precisely that reason: her id is absent from the 2020 list (and from every other list).",
      "The year range must be HALF-OPEN: sale_date >= '2020-01-01' AND sale_date < '2021-01-01'. The tempting BETWEEN '2020-01-01' AND '2020-12-31' silently loses the last day's remainder — '2020-12-31 09:30' sorts after '2020-12-31' as a string, so it fails BETWEEN — and the query breaks the day the column grows a time component. YEAR(sale_date) = 2020 is correct but non-sargable: wrapping the column in a function forfeits any index on sale_date. The half-open range stays correct across type changes and lets the engine seek — the same windowing habit as the-latest-login-in-2020.",
      "NOT IN is safe here for a structural reason: Orders.seller_id is NOT NULL, so the subquery can never emit the NULL that poisons the comparison (x NOT IN (1, NULL) is never TRUE — it evaluates to NULL and the row is filtered out). On nullable keys the standing replacements are NOT EXISTS or LEFT JOIN … IS NULL, and the LEFT JOIN variant carries its own trap: the date range must live in the ON clause. Moved to WHERE, it tests the NULL placeholder row of non-matching sellers — and drops Dee, the exact seller this report exists to find.",
    ],
    edges: [
      "BETWEEN '2020-01-01' AND '2020-12-31' excludes '2020-12-31 09:30' — the half-open range ending at 2021-01-01 is the correct year.",
      "Dee has zero orders ever and still qualifies — 'no sales in 2020' includes 'no sales at all'.",
      "NOT IN NULL-poisoning: safe only because seller_id is NOT NULL; on nullable keys reach for NOT EXISTS.",
      "LEFT JOIN anti-join variant: the date filter belongs in ON, not WHERE — in WHERE it would test the NULL placeholder and drop Dee.",
    ],
    ladder: [
      { title: "Brute force — per-seller probe", body: "For each seller, run a query counting 2020 orders and keep the zeros. One query per seller; the database can do one grouped pass instead." },
      { title: "The pattern — NOT IN over the 2020 set", body: "SELECT seller_id FROM Orders WHERE date-in-2020 builds the excluded set; the outer NOT IN keeps everyone absent from it." },
      { title: "The optimal idea — anti-join on a half-open range", body: "One sargable range scan of Orders plus one pass over Seller. The LEFT JOIN + IS NULL form is the equivalent when keys can be NULL." },
    ],
    approach: "NOT IN anti-join over a half-open 2020 date range",
    schema: {
      ddl: `CREATE TABLE Seller (
  seller_id   INTEGER PRIMARY KEY,
  seller_name TEXT NOT NULL
);
CREATE TABLE Orders (
  order_id  INTEGER PRIMARY KEY,
  sale_date TEXT NOT NULL,
  seller_id INTEGER NOT NULL REFERENCES Seller(seller_id)
);`,
      seed: `INSERT INTO Seller (seller_id, seller_name) VALUES
  (1,'Ada'),(2,'Ben'),(3,'Cy'),(4,'Dee');
INSERT INTO Orders (order_id, sale_date, seller_id) VALUES
  (11,'2020-05-30',1),(12,'2019-10-01',2),(13,'2021-02-15',2),
  (14,'2020-08-02',3),(15,'2020-12-31',3),(16,'2020-01-01',3);`,
      tables: [
        { name: "Seller", note: "4 sellers; Dee has no orders at all" },
        { name: "Orders", note: "6 sales; Ben's two straddle 2020 without touching it" },
      ],
    },
    code: `SELECT s.seller_name
FROM Seller s
WHERE s.seller_id NOT IN (        -- safe: seller_id is NOT NULL
    SELECT seller_id
    FROM Orders
    WHERE sale_date >= '2020-01-01'
      AND sale_date <  '2021-01-01'   -- half-open year, sargable
)
ORDER BY s.seller_name;`,
    walkthrough: [
      "The subquery scans Orders for 2020 rows: order 11 (2020-05-30, seller 1) plus orders 14, 15 and 16 (all 2020, seller 3) — the excluded set is {1 Ada, 3 Cy}. Ben's orders are 2019 and 2021; Dee has none.",
      "NOT IN keeps Seller rows whose id is absent from that set: 2 Ben and 4 Dee — Dee qualifies purely by absence, having never sold.",
      "ORDER BY seller_name prints Ben, Dee — alphabetical, matching the spec's sort.",
    ],
    time: "O(s + o) — one range scan of Orders, one pass over Seller",
    space: "O(k) — the excluded-seller set",
    followUps: [
      "Report each seller's inactive YEARS as rows (a calendar dimension crossed with sellers) — how does the negative predicate become an enumeration problem?",
      "Swap NOT IN for NOT EXISTS and compare the plans on a large Orders table — when does the correlated probe win?",
    ],
    related: ["the-latest-login-in-2020", "monthly-transactions-i"],
    order: "exact",
    xp: 20,
  },
];
