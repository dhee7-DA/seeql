// Deep-dives — the SQL 50 "Advanced Select" band (compound selects, month
// bucketing, conditional aggregation; 4 problems). Solutions are SQLite
// dialect, one statement each, verified against the per-problem seed.
import type { LcSqlDive } from "../types";

export const SQL_ADVANCED: LcSqlDive[] = [
  {
    slug: "movie-rating",
    statement:
      "A streaming service keeps Movies, Users, and one MovieRating row per (user, movie) rating, stamped with the date it was submitted. Answer two unrelated questions with a single output column named results, holding exactly two rows: the name of the user who rated the most movies in February 2020 (ties go to the lexicographically smaller name), and the title of the movie with the highest average rating in February 2020 (ties go to the lexicographically smaller title), comparing averages rounded to two decimals.",
    examples: [
      {
        input: "Users: Daniel, Monica, Maria, James · Movies: Avatar, Frozen II, Heat, Alien, Roma · February 2020 ratings: Monica→Avatar 4, Maria→Avatar 2, Monica→Frozen II 3, Maria→Frozen II 4, Daniel→Heat 5, James→Heat 2",
        output: "Maria · Frozen II",
        explanation: "Monica and Maria tie at 2 February ratings — Maria is lexicographically smaller ('Ma' < 'Mo'). Frozen II and Heat tie at a 3.50 average — Frozen II is the smaller title.",
      },
      {
        input: "Same seed, month filter dropped (the classic wrong run)",
        output: "Daniel · Roma",
        explanation: "Daniel has 5 all-time ratings and Roma averages 5.00 from a single January rating — both win only when February is forgotten, which is exactly what the seed is built to catch.",
      },
    ],
    constraints: [
      "both halves filter rating created_at to February 2020",
      "ties break to the lexicographically smaller name/title",
      "one output column (results), two rows: user name first, movie title second",
    ],
    breakdown: [
      "Two unrelated questions share one output, and that is the whole problem shape: a UNION ALL of two complete, self-contained queries. Each half answers one question end to end — filter to February 2020, aggregate per user (or per movie), order by the metric with its tie-break key, keep one row. The grader wants a single two-row column named results, which is precisely what stacking two one-row queries produces.",
      "The SQLite wrinkle is grammatical: in a compound select, ORDER BY and LIMIT may appear only after the LAST operand and then apply to the whole union — an ORDER BY before UNION ALL is a syntax error, and a trailing one would sort both answers together. The fix is structural: wrap each half in parentheses as a subquery in FROM, where per-half ORDER BY + LIMIT are legal again, and union the two one-row results with no outer ORDER BY. 'Two questions, one answer' almost always needs this wrapping in SQLite.",
      "Tie discipline lives in the ORDER BY: metric descending, then name ascending. The secondary ascending key is what turns 'lexicographically smaller' from an afterthought into a deterministic rule — without it the engine's tie order is unspecified. Round the average inside the sort key (ROUND(AVG(rating), 2)) so floating-point noise can never split an exact tie between 3.5 and 3.5000001.",
    ],
    edges: [
      "Compound-select grammar: per-half ORDER BY/LIMIT is a syntax error, and a trailing ORDER BY sorts the WHOLE union — wrap each half in a FROM subquery instead.",
      "GROUP BY the id plus the display name (u.user_id, u.name / m.movie_id, m.title) — name-only grouping would merge two users (or movies) that share a name.",
      "UNION ALL, not UNION: the two answers are independent; plain UNION would silently collapse them if a user's name ever equalled a movie title.",
      "Movies with no February ratings form no group at all — and forgetting the month filter lets January-only Roma (avg 5.00) steal the second row on this seed.",
    ],
    ladder: [
      { title: "Brute force — two round-trips", body: "Run the user query and the movie query separately and stitch the two rows in application code. Works, but that's two network trips for what is grammatically one statement, and the app now owns the ordering and tie rules." },
      { title: "The pattern — two questions, one answer", body: "UNION ALL stacks two complete, independent queries into one result. Whenever an output combines rows answering DIFFERENT questions (top rater + top movie, totals + outliers), think compound select before you think clever join." },
      { title: "The optimal idea — wrap each half, LIMIT 1 inside", body: "Per-half ORDER BY + LIMIT must hide inside FROM subqueries in SQLite; union the two one-row results with no outer ORDER BY. Group-and-sort per half is O(n log n) — nothing beats it for an exact top-1." },
    ],
    approach: "UNION ALL of two subquery-wrapped top-1 queries",
    schema: {
      ddl: `CREATE TABLE Movies (
  movie_id INTEGER PRIMARY KEY,
  title    TEXT NOT NULL
);
CREATE TABLE Users (
  user_id INTEGER PRIMARY KEY,
  name    TEXT NOT NULL
);
CREATE TABLE MovieRating (
  movie_id   INTEGER NOT NULL REFERENCES Movies(movie_id),
  user_id    INTEGER NOT NULL REFERENCES Users(user_id),
  rating     INTEGER NOT NULL,
  created_at TEXT NOT NULL
);`,
      seed: `INSERT INTO Movies (movie_id, title) VALUES (1,'Avatar'),(2,'Frozen II'),(3,'Heat'),(4,'Alien'),(5,'Roma');
INSERT INTO Users (user_id, name) VALUES (1,'Daniel'),(2,'Monica'),(3,'Maria'),(4,'James');
INSERT INTO MovieRating (movie_id, user_id, rating, created_at) VALUES
  (1,1,3,'2020-01-12'),
  (1,2,4,'2020-02-11'),
  (1,3,2,'2020-02-12'),
  (2,1,5,'2020-01-25'),
  (2,2,3,'2020-02-05'),
  (2,3,4,'2020-02-18'),
  (3,1,5,'2020-02-02'),
  (3,2,4,'2020-03-14'),
  (3,4,2,'2020-02-27'),
  (4,1,4,'2020-03-03'),
  (4,4,1,'2020-03-21'),
  (5,1,5,'2020-01-30');   -- Roma: January only, avg 5.00 — baits a forgotten month filter`,
      tables: [
        { name: "Movies", note: "5 movies; Roma exists to bait the date filter, Alien has no February ratings" },
        { name: "Users", note: "4 raters — Monica and Maria are engineered to tie at 2 February ratings" },
        { name: "MovieRating", note: "12 ratings across Jan/Feb/Mar 2020; Frozen II and Heat tie at 3.50 in February" },
      ],
    },
    code: `SELECT results FROM (              -- half 1: most active February 2020 rater
    SELECT u.name AS results, COUNT(*) AS ratings
    FROM MovieRating mr
    JOIN Users u ON u.user_id = mr.user_id
    WHERE strftime('%Y-%m', mr.created_at) = '2020-02'
    GROUP BY u.user_id, u.name
    ORDER BY ratings DESC, results   -- tie → lexicographically smaller name
    LIMIT 1
)                                   -- per-half ORDER BY/LIMIT is ONLY legal inside
UNION ALL                           -- a FROM subquery; a bare compound select would
SELECT results FROM (               -- take one ORDER BY after its last operand
    SELECT m.title AS results, ROUND(AVG(mr.rating), 2) AS avg_rating
    FROM MovieRating mr
    JOIN Movies m ON m.movie_id = mr.movie_id
    WHERE strftime('%Y-%m', mr.created_at) = '2020-02'
    GROUP BY m.movie_id, m.title
    ORDER BY avg_rating DESC, results  -- tie → lexicographically smaller title
    LIMIT 1
);`,
    walkthrough: [
      "Half one filters MovieRating to strftime('%Y-%m', created_at) = '2020-02', groups by user and counts: Monica 2, Maria 2, Daniel 1, James 1. ORDER BY ratings DESC, results puts the tied pair first with Maria ahead of Monica ('Ma' < 'Mo'), and LIMIT 1 keeps Maria.",
      "Half two runs the same skeleton over movies: in February Avatar averages 3.00, Frozen II 3.50 and Heat 3.50. The rounded average sorts descending, the ascending title breaks the 3.50 tie toward Frozen II, and LIMIT 1 keeps it.",
      "Each half hides its ORDER BY + LIMIT inside a FROM subquery — legal there, a syntax error between UNION ALL operands. The outer statement is just SELECT results FROM (one row) UNION ALL SELECT results FROM (one row), producing the two-row results column with no outer ORDER BY: re-sorting two unrelated answers would mean nothing.",
      "The seed is rigged to punish shortcuts: drop the month filter and half one crowns Daniel (5 all-time ratings) while half two crowns Roma (a January-only 5.00 average) — both wrong, both reachable only by forgetting the WHERE.",
    ],
    time: "O(n log n) per half — one grouping pass, then a sort to pick the top 1",
    space: "O(u + m) — one row per user group and per movie group",
    followUps: [
      "Return each half's top TWO instead of top one — the wrapping pattern holds and LIMIT 2 does the rest; note that a compound-level ORDER BY still cannot express per-half top-k.",
      "Rework each half with window functions: RANK() OVER (ORDER BY ratings DESC, name) filtered to rank 1 — and notice the behavioral difference: a tie then returns BOTH tied rows instead of exactly one.",
    ],
    related: ["list-the-products-ordered-in-a-period", "queries-quality-and-percentage", "not-boring-movies"],
    order: "any",
    xp: 20,
  },
  {
    slug: "list-the-products-ordered-in-a-period",
    statement:
      "An online store keeps a Products catalog and an Orders log of (product, order_date, quantity) — a product can be ordered many times in a month. Report every product whose orders in February 2020 total at least 100 units, showing the product name and its February total (columns product_name and quantity), sorted by product name.",
    examples: [
      {
        input: "February orders: Leetcode Book 45 + 60, Python Crash Course 15, LC Sticker Pack 40 + 60, LC Hoodie 30 + 29 · off-month orders: Book 20 (Jan), Python 120 (Jan), Hoodie 150 (Mar)",
        output: "LC Sticker Pack · 100 · Leetcode Book · 105",
        explanation: "February buckets only: the book's two sub-100 orders sum past the bar, the stickers land exactly on it (>= keeps them), Python's big January haul and the hoodie's March rush don't count.",
      },
    ],
    constraints: [
      "the 100-unit threshold applies to the FEBRUARY total per product",
      "sum every matching order — no single seed order reaches 100 alone",
      "output product_name, quantity, ordered by product_name",
    ],
    breakdown: [
      "Three clauses do three different jobs, and confusing them is the whole exam. The month is a ROW filter — it decides which orders exist — so strftime('%Y-%m', order_date) = '2020-02' belongs in WHERE, applied before any grouping. The 100-unit bar is a GROUP filter — it decides which buckets survive — so it belongs in HAVING; SQLite rejects SUM(o.quantity) >= 100 in WHERE because the aggregate doesn't exist there yet.",
      "The grain changes once, from orders to products: GROUP BY p.product_id, p.product_name collapses each product's February orders into one bucket and SUM adds the quantities. The seed is built so no single order reaches 100 — the book's 45 and 60 only qualify once summed — the standard way this problem catches a MAX(quantity) >= 100 reflex.",
      "One production note worth carrying: strftime() wraps the column in a function, so an index on order_date cannot serve the filter (it isn't sargable). A high-volume table would use a half-open range — order_date >= '2020-02-01' AND order_date < '2020-03-01' — which selects the same rows but lets the index do the work. Same answers, different physics.",
    ],
    edges: [
      "Filter the month in WHERE, before grouping — testing strftime in HAVING technically runs but scans every month first and teaches the wrong clause placement.",
      "The threshold compares the SUM, so it needs HAVING — SUM(o.quantity) >= 100 in WHERE is rejected.",
      "Boundary: a product at exactly 100 units qualifies (>=, not >) — the seed parks one there on purpose.",
      "Group by product_id plus the name; two products can share a name.",
    ],
    ladder: [
      { title: "Brute force — tally in application code", body: "Pull February's orders, accumulate a per-product map, threshold it, sort it. A hand-rolled GROUP BY + HAVING — fine as a sketch, wrong as a ship." },
      { title: "The pattern — WHERE filters rows, HAVING filters groups", body: "The month filter shrinks rows (WHERE); the 100-unit bar shrinks buckets (HAVING). Clause placement is the actual skill this problem drills — WHERE for row predicates, HAVING for aggregates." },
      { title: "The optimal idea — one grouped pass", body: "JOIN for the name, WHERE for the month, GROUP BY the product, HAVING on the SUM, ORDER BY for the spec. One scan, one hash group, one small sort." },
    ],
    approach: "WHERE month filter → GROUP BY → HAVING threshold",
    schema: {
      ddl: `CREATE TABLE Products (
  product_id       INTEGER PRIMARY KEY,
  product_name     TEXT NOT NULL,
  product_category TEXT NOT NULL
);
CREATE TABLE Orders (
  product_id INTEGER NOT NULL REFERENCES Products(product_id),
  order_date TEXT NOT NULL,
  quantity   INTEGER NOT NULL
);`,
      seed: `INSERT INTO Products (product_id, product_name, product_category) VALUES
  (1,'Leetcode Book','Book'),
  (2,'Python Crash Course','Book'),
  (3,'LC Sticker Pack','Merch'),
  (4,'LC Hoodie','Merch');
INSERT INTO Orders (product_id, order_date, quantity) VALUES
  (1,'2020-01-20',20),    -- January noise for the qualifying product
  (1,'2020-02-03',45),    -- Feb 45 + 60 = 105 from two sub-100 orders
  (1,'2020-02-14',60),
  (2,'2020-01-08',120),   -- trap: huge January total, wrong month
  (2,'2020-02-22',15),
  (3,'2020-02-09',40),    -- trap: exactly 100 in February (boundary)
  (3,'2020-02-19',60),
  (4,'2020-02-11',30),    -- Feb 30 + 29 = 59, under the bar
  (4,'2020-02-25',29),
  (4,'2020-03-01',150);   -- trap: huge March total, wrong month`,
      tables: [
        { name: "Products", note: "4 products across Book/Merch" },
        { name: "Orders", note: "10 orders: two sub-100 halves that sum past 100, an exactly-100 pair, a 120-unit January decoy and a 150-unit March decoy" },
      ],
    },
    code: `SELECT
    p.product_name,
    SUM(o.quantity) AS quantity        -- February units only (WHERE already ran)
FROM Orders o
JOIN Products p ON p.product_id = o.product_id
WHERE strftime('%Y-%m', o.order_date) = '2020-02'   -- row filter: pick the month
GROUP BY p.product_id, p.product_name               -- one bucket per product
HAVING SUM(o.quantity) >= 100                       -- group filter: aggregates
ORDER BY p.product_name;                            -- live here, not in WHERE`,
    walkthrough: [
      "WHERE first: strftime buckets each order into '2020-02' or not — the book's 20 January units, Python's 120 January units and the hoodie's 150 March units never reach the buckets at all.",
      "GROUP BY p.product_id, p.product_name then collapses February into per-product buckets: the book 45 + 60 = 105, stickers 40 + 60 = 100, Python 15, hoodie 59.",
      "HAVING SUM(o.quantity) >= 100 is the gate: 105 and the exactly-100 sticker pack pass (>= includes the boundary); 15 and 59 drop.",
      "The final ORDER BY product_name is the required presentation; the grader compares the two surviving rows as a set.",
    ],
    time: "O(n log n) — scan, hash-group, threshold, sort the survivors",
    space: "O(p) — one bucket per product",
    followUps: [
      "Every month of 2020 at once: GROUP BY product_id, strftime('%Y-%m', order_date) and keep each (product, month) bucket that crosses 100 — note the threshold moves from HAVING on one month to a per-bucket gate.",
      "Swap the strftime predicate for the sargable range order_date >= '2020-02-01' AND order_date < '2020-03-01', and explain why only the second shape can use an index on order_date.",
    ],
    related: ["movie-rating", "group-sold-products-by-the-date", "immediate-food-delivery-i"],
    order: "any",
    xp: 10,
  },
  {
    slug: "immediate-food-delivery-i",
    statement:
      "A food-delivery platform logs each order with the day it was placed (order_date) and the day the customer preferred (customer_pref_delivery_date); an order is immediate when the two dates match. Compute the percentage of ALL orders that were immediate, rounded to two decimals, as one number in a column named immediate_percentage.",
    examples: [
      {
        input: "Six orders over four customers: C1 planned then immediate, C2 immediate, C3 immediate, C4 immediate then planned",
        output: "66.67",
        explanation: "4 of 6 orders have order_date = customer_pref_delivery_date → 100 * 4/6 = 66.67. Every row counts; the first-order-only variant (#1174) would answer 75.0 on this seed.",
      },
      {
        input: "Same seed restricted to each customer's FIRST order only (#1174's question)",
        output: "75.0",
        explanation: "Three of the four first orders were immediate — a different question over the same rows yields a different number; knowing which one is asked is half the problem.",
      },
    ],
    constraints: [
      "every Delivery row counts — no first-order restriction in this variant",
      "immediate ⇔ order_date = customer_pref_delivery_date",
      "round the percentage to two decimals",
    ],
    breakdown: [
      "This is a whole-table ratio, so there is no GROUP BY and no join: the denominator is every row of Delivery. Read the spec twice to confirm — this variant counts ALL orders, while the first-order-only variant is a separate problem (#1174) that returns a different number on the same data. Here the query is one aggregate over one table.",
      "The core idiom is boolean arithmetic: SQLite stores true as 1 and false as 0, so order_date = customer_pref_delivery_date is a per-row 0/1 flag, and AVG(flag) is exactly 'the share of rows where the flag is 1'. Multiply by 100.0 for a percentage and ROUND at the very end. The portable spelling is AVG(CASE WHEN ... THEN 1 ELSE 0 END) — same plan, runs in any engine.",
      "Mind the arithmetic traps. SUM(flag) / COUNT(*) is integer division in SQLite — it floors toward 0 or 1, never 0.66 — so anchor the math with 100.0 or use AVG. And scale before rounding: ROUND(share, 2) * 100 turns 0.6667 into 67.0, while ROUND(100.0 * share, 2) gives the required 66.67.",
    ],
    edges: [
      "No GROUP BY: this variant counts ALL orders — #1174's first-order-only variant gives 75.0 on this seed vs 66.67; know which is asked.",
      "AVG/SUM of a boolean: SQLite treats true as 1 — other engines need CASE WHEN or an explicit CAST.",
      "Integer-division trap: SUM(flag)/COUNT(*) floors — force the 100.0 multiplier or use AVG.",
      "Round AFTER scaling to percent: ROUND(frac, 2) * 100 gives 67.0, not 66.67.",
    ],
    ladder: [
      { title: "Brute force — count in the app", body: "SELECT both date columns, loop, count equalities, divide. Ships the whole table over the wire to compute one scalar the engine could return alone." },
      { title: "The pattern — boolean as a number", body: "A comparison IS a value: 1 when true, 0 when false. SUM(flag) counts matches; AVG(flag) gives the share — conditional aggregation, the backbone of dashboard SQL." },
      { title: "The optimal idea — AVG of the flag, ROUND at the edges", body: "ROUND(100.0 * AVG(predicate), 2) in a single pass: O(n) time, O(1) space, portable via CASE WHEN. Scale to percent before rounding, never after." },
    ],
    approach: "Conditional aggregation — AVG of a boolean flag",
    schema: {
      ddl: `CREATE TABLE Delivery (
  delivery_id                 INTEGER PRIMARY KEY,
  customer_id                 INTEGER NOT NULL,
  order_date                  TEXT NOT NULL,
  customer_pref_delivery_date TEXT NOT NULL
);`,
      seed: `INSERT INTO Delivery (delivery_id, customer_id, order_date, customer_pref_delivery_date) VALUES
  (1,1,'2019-08-01','2019-08-02'),   -- planned; customer 1's FIRST order
  (2,1,'2019-08-11','2019-08-11'),   -- immediate
  (3,2,'2019-08-02','2019-08-02'),   -- immediate; first order
  (4,3,'2019-08-24','2019-08-24'),   -- immediate; first order
  (5,4,'2019-08-21','2019-08-21'),   -- immediate; first order
  (6,4,'2019-08-30','2019-08-31');   -- planned`,
      tables: [
        { name: "Delivery", note: "6 orders, 4 customers — C1 and C4 ordered twice, so the first-order-only variant (#1174) yields 75.0 where this variant yields 66.67" },
      ],
    },
    code: `SELECT
    ROUND(
        100.0 * AVG(order_date = customer_pref_delivery_date),  -- boolean = 1/0 → share immediate
        2
    ) AS immediate_percentage
FROM Delivery;   -- no GROUP BY: every order is in the denominator`,
    walkthrough: [
      "FROM Delivery with no GROUP BY: all six rows form one group, so the denominator is 6.",
      "Inside AVG, each row's predicate evaluates to 1 or 0: orders 2, 3, 4 and 5 are immediate (1); orders 1 and 6 are planned (0). AVG returns 4/6 ≈ 0.6667 — a share, not a count.",
      "100.0 * share becomes 66.67 after ROUND(..., 2). The 100.0 is load-bearing: 100 * SUM(flag) / COUNT(*) would be integer arithmetic and floor to garbage.",
      "Sanity-check the variant: customers 1 and 4 placed two orders each and all six rows count here; restricting to first orders (the #1174 shape) would answer 75.0 — different question, different number, same seed.",
    ],
    time: "O(n) — a single scan",
    space: "O(1) — one aggregate",
    followUps: [
      "The first-order-only variant — each customer's MIN(order_date) row only — is #1174; on this seed it answers 75.0 instead of 66.67.",
      "Break the percentage down by month: GROUP BY strftime('%Y-%m', order_date) with the same AVG(flag) trick.",
    ],
    related: ["immediate-food-delivery-ii", "queries-quality-and-percentage", "number-of-employees-who-met-the-target"],
    order: "any",
    xp: 10,
  },
  {
    slug: "number-of-employees-who-met-the-target",
    statement:
      "Employees(employee_id, hours) logs how many hours each person worked this period, and the task fixes a target of 6 hours. Report one number, met_target: the count of employees whose hours are at least the target. The spec is deliberately tiny — the value is in the two spellings of a conditional count, filter-then-count versus summing a 0/1 flag, and in when each generalizes.",
    examples: [
      {
        input: "Employees hours: (1,3), (2,7), (3,6), (4,5), (5,9), (6,6) · target = 6",
        output: "4",
        explanation: "Employees 2, 3, 5 and 6 meet the bar — the two who worked exactly 6 hours count because 'met' means at least; with > the answer would wrongly be 2.",
      },
    ],
    constraints: [
      "1 <= rows in Employees, hours >= 0",
      "the target is a task parameter — hard-code 6 (the sandbox has no variables)",
      "output: one row, one column met_target",
    ],
    breakdown: [
      "The spec is one predicate over one table, and SQL offers two spellings. Filter-then-count: SELECT COUNT(*) FROM Employees WHERE hours >= 6 — keep the rows that met it, count them. Aggregate-a-flag: SUM(hours >= 6) — keep every row, but let each contribute 1 or 0. Same single scan, same answer; they differ in what they generalize to.",
      "The boolean-SUM form wins the moment you need more than one number from the table: SUM(hours >= 6), SUM(hours > 6) and SUM(hours < 6) in one SELECT share a single pass, and AVG(hours >= 6) turns the count into a share — the exact idiom immediate-food-delivery-i uses for its percentage. Learning to see a comparison as an aggregatable 0/1 value is the point of this exercise; the count itself is trivial.",
      "The one real decision is the boundary. 'Met the target' means at least, so hours >= 6 — employees who worked exactly 6 hours count. WHERE hours > 6 is the classic one-character bug, and the seed carries two employees sitting exactly on 6 so it fires. Note also the parameter handling: the sandbox statement has no variables, so the target is hard-coded as a literal and flagged with a comment.",
    ],
    edges: [
      "Boundary: exactly target hours counts (>=, not >) — the seed has two employees on exactly 6.",
      "SUM(flag) is NULL only when the table has zero rows; the constraint guarantees at least one.",
      "No GROUP BY: the whole table is one group, so the answer is one row even when zero employees qualify (0, not 'no rows').",
      "SQLite booleans are integers; other engines need CASE WHEN or CAST — know your dialect before shipping the idiom.",
    ],
    ladder: [
      { title: "Brute force — loop and count", body: "Read every row, increment a counter when hours >= 6. One integer of output for one table of transfer — the query should absorb the loop." },
      { title: "The pattern — filter-then-count", body: "SELECT COUNT(*) FROM Employees WHERE hours >= 6 — the standard shape for 'how many rows satisfy P'. One predicate, one aggregate, done." },
      { title: "The optimal idea — SUM the boolean instead", body: "SUM(hours >= 6) counts the same rows without a WHERE, so several flags — met, exceeded, missed — can share one scan in a single SELECT. Same cost, more answers per pass." },
    ],
    approach: "Boolean-SUM aggregation (alternative: COUNT(*) after WHERE)",
    schema: {
      ddl: `CREATE TABLE Employees (
  employee_id INTEGER PRIMARY KEY,
  hours       INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employees (employee_id, hours) VALUES
  (1,3),   -- well below
  (2,7),
  (3,6),   -- trap: exactly at target — counts under >=
  (4,5),   -- one hour short
  (5,9),
  (6,6);   -- trap: boundary again`,
      tables: [
        { name: "Employees", note: "6 employees; two sit exactly on the target of 6 (>= keeps both), one is a single hour short" },
      ],
    },
    code: `SELECT
    SUM(hours >= 6) AS met_target   -- target = 6 hard-coded; each row yields 1 (met) or 0
FROM Employees;                     -- COUNT(*) ... WHERE hours >= 6 is the equivalent`,
    walkthrough: [
      "One table, no join, no GROUP BY — the whole table is one group and the output is one row.",
      "For each employee the expression hours >= 6 evaluates to 1 or 0: employees 2, 3, 5 and 6 contribute 1 (hours 7, 6, 9, 6); employees 1 and 4 contribute 0 (3 and 5). SUM adds the flags to 4.",
      "The commented alternative — COUNT(*) WHERE hours >= 6 — produces the same 4 by filtering first; keep both in your toolkit and reach for SUM(flag) when several conditional counts must share one scan.",
      "Boundary check: employees 3 and 6 worked exactly 6 hours and both count — switching to > would return 2 and fail the case the seed was engineered for.",
    ],
    time: "O(n) — one scan",
    space: "O(1)",
    followUps: [
      "Compute met, exceeded and missed in one pass: SUM(hours >= 6), SUM(hours > 6) and SUM(hours < 6) — three conditional counts, one scan.",
      "Generalize the flag to bands: SUM(CASE WHEN hours >= 10 THEN 1 ELSE 0 END) for an overtime count, or AVG of the same flag for a share — the immediate-food-delivery-i pattern.",
    ],
    related: ["immediate-food-delivery-i", "classes-more-than-5-students"],
    order: "any",
    xp: 10,
  },
];
