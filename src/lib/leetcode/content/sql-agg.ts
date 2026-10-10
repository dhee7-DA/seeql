// Deep-dives — the SQL 50 "Basic Aggregation" band (8 problems: weighted
// averages, percentage idioms, self-join timing, HAVING thresholds and
// zero-safe LEFT JOIN rates). Solutions are SQLite dialect, one statement
// each, and are engine-verified against the per-problem seed.
import type { LcSqlDive } from "../types";

export const SQL_AGG: LcSqlDive[] = [
  {
    slug: "not-boring-movies",
    statement:
      "A cinema table lists movies with an id, a description and a rating. Report the odd-numbered movies whose description is not 'boring', ordered from highest to lowest rating — and when two movies share a rating, break the tie by ascending id. The ordering is part of the specification, not a presentation nicety.",
    examples: [
      {
        input: "Cinema: (1,'War','great 3D',8.9),(2,'Science','fiction',8.5),(3,'irish','boring',6.2),(4,'Ice song','Fantacy',8.6),(5,'House card','Interesting',9.1)",
        output: "5 · House card · Interesting · 9.1 → 1 · War · great 3D · 8.9",
        explanation: "Ids 2 and 4 are even, id 3 is 'boring' — three rows are filtered away and the two survivors are ranked by rating descending.",
      },
      {
        input: "Cinema: (6,'Chase','Thrilling',9.5),(7,'Tax filing','boring',9.9),(1,'War','great 3D',8.9),(9,'Road trip','Comedy',8.9)",
        output: "1 · War · great 3D · 8.9 → 9 · Road trip · Comedy · 8.9",
        explanation: "'Chase' has the top rating but an even id; 'Tax filing' is odd but boring — both excluded. The two 8.9 survivors tie, so id ascending (1 before 9) fixes their order.",
      },
    ],
    constraints: [
      "odd means id % 2 = 1 — state it that way rather than != 0",
      "'boring' is lowercase in the data, and SQLite TEXT comparison is case-sensitive by default",
      "output order is graded: rating DESC, id ASC when ratings tie",
    ],
    breakdown: [
      "Strip the sentence to two predicates and one sort: keep rows whose id is odd, drop rows whose description is exactly 'boring', then rank the survivors by rating. Nothing aggregates — this is pure filtering, and its real subject is that ORDER BY is part of the spec, not decoration. When a problem says 'return the rows in X order', the order IS the answer.",
      "The two predicates compose with AND inside a single WHERE — no subquery, no CASE, no join. The one genuine design decision is determinism: ratings can collide, so a second sort key (id ASC) makes the output reproducible run after run, which is exactly what an exact-order grader needs.",
      "The classic misstep is treating the tie as someone else's problem: ORDER BY rating alone leaves the two 8.9 movies in engine-dependent order, and an exact-order comparison marks it wrong. The second classic is writing the parity filter as id % 2 != 0 — true for the positive ids here, but '= 1' states intent and survives negative ids.",
    ],
    edges: [
      "Even-id movies with top ratings (seed: 'Chase', 9.5) and boring odd-id ones ('Tax filing', 9.9) each fail exactly one predicate — a query that ORs the filters or drops one keeps them and looks half-plausible.",
      "Rating ties: two survivors sit at 8.9, so ORDER BY rating DESC, id ASC is required for deterministic output.",
      "Case sensitivity: SQLite compares TEXT case-sensitively by default, so 'Boring' would survive != 'boring'. The data is lowercase — know that you are relying on it.",
      "Filter before sorting, always: WHERE runs first anyway, but a mental model of 'select the survivors, then rank them' keeps the two stages from blurring.",
    ],
    ladder: [
      { title: "Brute force — scan and sort in app code", body: "Pull every Cinema row, filter by parity and description in the host language, sort by rating. It works, but it ships the whole table over the wire and re-implements WHERE and ORDER BY by hand." },
      { title: "The pattern — filter with predicates, sort with intent", body: "WHERE handles both predicates in one pass; ORDER BY states the ranking the spec demands. Determinism is a design input: add the tiebreaker the moment two rows can tie." },
      { title: "The optimal idea — single-pass filter + sort", body: "SELECT … WHERE id % 2 = 1 AND description != 'boring' ORDER BY rating DESC, id ASC. O(n log n) for the sort, which is already optimal for ordered output." },
    ],
    approach: "Predicate filter + deterministic ORDER BY",
    schema: {
      ddl: `CREATE TABLE Cinema (
  id          INTEGER PRIMARY KEY,
  movie       TEXT NOT NULL,
  description TEXT NOT NULL,
  rating      REAL NOT NULL
);`,
      seed: `INSERT INTO Cinema (id, movie, description, rating) VALUES
  (1,'War','great 3D',8.9),
  (2,'Science','fiction',8.5),
  (3,'irish','boring',6.2),
  (4,'Ice song','Fantacy',8.6),
  (5,'House card','Interesting',9.1),
  (6,'Chase','Thrilling',9.5),    -- trap: top rating but even id → excluded
  (7,'Tax filing','boring',9.9),  -- trap: odd id but boring → excluded
  (9,'Road trip','Comedy',8.9);   -- ties id 1 at 8.9 → id ASC must break it`,
      tables: [
        { name: "Cinema", note: "8 movies — two fail exactly one filter each; a rating tie at 8.9 exercises the tiebreaker" },
      ],
    },
    code: `SELECT
    c.id,
    c.movie,
    c.description,
    c.rating
FROM Cinema c
WHERE c.id % 2 = 1               -- odd-numbered rows only
  AND c.description != 'boring'  -- case-sensitive compare; the data is lowercase
ORDER BY
    c.rating DESC,               -- graded: the spec's ranking
    c.id ASC;                    -- deterministic tiebreak on equal ratings`,
    walkthrough: [
      "WHERE evaluates both predicates on every row before anything is sorted: ids 2, 4 and 6 fail the parity test while ids 3 and 7 fail the description test. Eight rows in, three survive — filtering first keeps the sort cheap and the logic linear.",
      "The two trap rows each pass exactly one predicate: 'Chase' (9.5, even) and 'Tax filing' (9.9, boring). If either shows up in your output, one conjunct is missing — the classic silent failure when filters get ORed by mistake.",
      "ORDER BY rating DESC does the real work; id ASC exists purely for the 8.9 tie between ids 1 and 9. With order graded exactly, a missing tiebreaker is a coin flip the grader eventually loses for you.",
      "No aggregation, no joins: the SELECT projects the full row and the statement is one pass plus a sort. This is the band's reminder that ORDER BY is sometimes the answer, not cosmetics.",
    ],
    time: "O(n log n) — one filter pass plus the ordering sort",
    space: "O(k) — the surviving rows",
    followUps: [
      "Make the exclusion case-insensitive — LOWER(description) != 'boring' — and note how wrapping a column in a function disqualifies a plain index on it.",
      "Return the same list but paginated: ROW_NUMBER() OVER (ORDER BY rating DESC, id) as a rank, then filter rank between two bounds — same WHERE, new window layer.",
    ],
    related: ["movie-rating", "top-travellers", "list-the-products-ordered-in-a-period"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "average-selling-price",
    statement:
      "Prices holds price periods per product (start_date, end_date, price) and UnitsSold logs purchases with dates and unit counts. For each product, report the average selling price: total revenue divided by total units, counting only purchases that fall inside a matching price period and weighting each period by how many units actually moved at that price. Round to two decimals.",
    examples: [
      {
        input: "Prices: (1,'2019-02-17','2019-02-28',5),(1,'2019-03-01','2019-03-22',20),(2,'2019-02-01','2019-02-20',15),(2,'2019-02-21','2019-03-31',30) · UnitsSold: (1,'2019-02-25',100),(1,'2019-03-01',15),(2,'2019-02-10',200),(2,'2019-03-10',30),(2,'2019-03-24',20)",
        output: "1 · 6.96 → 2 · 18.0",
        explanation: "Product 1: (100×5 + 15×20) / 115 = 800/115 = 6.96. Product 2: (200×15 + 30×30 + 20×30) / 250 = 4500/250 = 18.0 — unit-weighted, not a plain AVG of prices.",
      },
      {
        input: "Product 3's price rows cover January (7) and March (14) with a February gap · UnitsSold: (3,'2019-01-31',10),(3,'2019-02-10',5),(3,'2019-03-05',10)",
        output: "3 · 10.5",
        explanation: "The Jan 31 purchase lands on its period's last day (inclusive) and Mar 5 matches March's row; the Feb 10 sale matches NO period and contributes nothing: (10×7 + 10×14)/20 = 10.5.",
      },
    ],
    constraints: [
      "a purchase counts only if its purchase_date falls inside a price period for the same product — both bounds inclusive",
      "several purchases can share a product and period; each contributes its own units",
      "every in-period purchase matches exactly one Prices row (periods do not overlap in this data)",
    ],
    breakdown: [
      "The ask is a weighted average: total revenue divided by total units, per product. The word 'average' is the bait — AVG(price) averages the price rows equally and ignores how many units moved at each price, so a period that sold 200 units and one that sold 1 would count the same.",
      "The weighting falls out of the join naturally: match each purchase to the price row whose period contains it, multiply price × units on every matched pair, then SUM the numerators and the denominators separately. SUM(price*units)/SUM(units) is the weighted-mean formula written in two aggregates.",
      "Two missteps dominate. First, AVG(price*units) or SUM(price*units)/COUNT(*) — both divide by row counts, not unit counts. Second, forgetting that in SQLite INTEGER / INTEGER truncates: 800/115 is 6, not 6.96. Promote the numerator with 1.0 (or CAST) before the division.",
    ],
    edges: [
      "Boundary dates are inclusive: the seed's 2019-03-01 purchase matches the period starting that day, and 2019-01-31 matches its period's last day — BETWEEN encodes both.",
      "The gap sale: product 3's 2019-02-10 purchase matches no period. An INNER JOIN drops it silently, which is correct here; a LEFT JOIN would buy you NULLs and no benefit.",
      "Integer division: SUM(price*units)/SUM(units) is 800/115 = 6 in SQLite. The 1.0 multiplier must wrap the numerator before the division.",
      "Date strings in ISO 'YYYY-MM-DD' form compare correctly as text in SQLite — that is the only reason BETWEEN works without CAST.",
    ],
    ladder: [
      { title: "Brute force — loop purchases, look up periods", body: "For each purchase, scan Prices for the covering period, accumulate revenue and units per product in a map, divide at the end. Correct — and a hand-rolled join plus GROUP BY." },
      { title: "The pattern — join to the covering period, then aggregate", body: "The join condition is a range predicate (BETWEEN the period bounds), not just key equality. Join first so every matched pair carries price and units on one row; grouping afterwards is trivial." },
      { title: "The optimal idea — weighted SUM over SUM with a float cast", body: "ROUND(1.0 * SUM(price*units) / SUM(units), 2) grouped by product: numerator and denominator accumulate in the same pass, and the 1.0 defeats integer division. O(p + u) with a hash join." },
    ],
    approach: "Range join + weighted SUM/SUM with a float cast",
    schema: {
      ddl: `CREATE TABLE Prices (
  product_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date   TEXT NOT NULL,
  price      INTEGER NOT NULL,
  PRIMARY KEY (product_id, start_date)
);
CREATE TABLE UnitsSold (
  product_id    INTEGER NOT NULL,
  purchase_date TEXT NOT NULL,
  units         INTEGER NOT NULL
);`,
      seed: `INSERT INTO Prices (product_id, start_date, end_date, price) VALUES
  (1,'2019-02-17','2019-02-28',5),
  (1,'2019-03-01','2019-03-22',20),
  (2,'2019-02-01','2019-02-20',15),
  (2,'2019-02-21','2019-03-31',30),
  (3,'2019-01-01','2019-01-31',7),
  (3,'2019-03-01','2019-03-31',14);  -- February is a gap for product 3
INSERT INTO UnitsSold (product_id, purchase_date, units) VALUES
  (1,'2019-02-25',100),
  (1,'2019-03-01',15),   -- boundary: first day of the March period
  (2,'2019-02-10',200),
  (2,'2019-03-10',30),
  (2,'2019-03-24',20),
  (3,'2019-01-31',10),   -- boundary: last day of the January period
  (3,'2019-02-10',5),    -- trap: inside the gap → matches no period
  (3,'2019-03-05',10);`,
      tables: [
        { name: "Prices", note: "6 price periods over 3 products — product 3 skips February" },
        { name: "UnitsSold", note: "8 purchases: two land on period boundaries, one sits in the gap and must vanish" },
      ],
    },
    code: `SELECT
    p.product_id,
    ROUND(
        1.0 * SUM(p.price * u.units) / SUM(u.units),  -- 1.0 BEFORE '/': SQLite integer division truncates
        2
    ) AS average_price
FROM Prices p
JOIN UnitsSold u
  ON u.product_id = p.product_id
 AND u.purchase_date BETWEEN p.start_date AND p.end_date  -- both bounds inclusive
GROUP BY p.product_id
ORDER BY p.product_id;`,
    walkthrough: [
      "The join condition is a range, not an equality: u.purchase_date BETWEEN p.start_date AND p.end_date attaches each purchase to its covering price row. Both bounds are inclusive, so the two boundary purchases (Mar 1 and Jan 31) match exactly one period each.",
      "Product 3's February purchase matches nothing and the INNER JOIN drops it — correct by spec: units that were never priced must not enter either side of the ratio. Five of the eight purchases match a period; product 3 keeps only two of its three.",
      "GROUP BY p.product_id collapses the matched pairs; SUM(price*units) accumulates revenue (product 1: 500 + 300 = 800) and SUM(units) accumulates volume (115), so the division is the unit-weighted mean — 6.96, not the 12.5 a plain AVG(price) would report.",
      "The 1.0 multiplier is not style: 800/115 in SQLite integer math is 6. Promote the numerator to REAL first, then ROUND(...,2) lands on 6.96; product 3's 210/20 would print 10 instead of 10.5 without it.",
    ],
    time: "O(p + u) — one range/hash join pass, then grouping",
    space: "O(g) — one row per product group",
    followUps: [
      "Report what AVG(price) would give instead, per product, and explain in one sentence why it differs from the unit-weighted answer.",
      "Handle overlapping price periods: the BETWEEN join would double-count a purchase; write a query that detects the overlap before any arithmetic.",
    ],
    related: ["product-sales-analysis-ii", "immediate-food-delivery-i", "top-travellers"],
    order: "any",
    xp: 10,
  },
  {
    slug: "project-employees-i",
    statement:
      "Project maps employees to projects and Employee carries each person's experience in years. For every project, report the average experience of its assigned employees, rounded to two decimals.",
    examples: [
      {
        input: "Project: (1,1),(1,2),(1,3),(2,1),(2,4) · Employee experience: 1→3, 2→2, 3→1, 4→2",
        output: "1 · 2.0 → 2 · 2.5",
        explanation: "Project 1 averages 3, 2 and 1 → 2.0; project 2 averages 3 and 2 → 2.5.",
      },
      {
        input: "Project: (3,5),(3,6),(3,7),(4,8) · Employee experience: 5→1, 6→2, 7→2, 8→4 (and employee 9 with 5 years, on the bench)",
        output: "3 · 1.67 → 4 · 4.0",
        explanation: "5/3 = 1.6667 needs the ROUND to 1.67; project 4's single member makes its average just 4.0. Employee 9 has no assignment and must not create a row.",
      },
    ],
    constraints: [
      "each (project_id, employee_id) assignment appears at most once",
      "experience_years is a positive integer",
      "output one row per project; a project with a single employee is legal",
    ],
    breakdown: [
      "'Average experience per project' is GROUP BY project_id with AVG over the experience column — the whole problem in one clause pair. Its teaching value is join discipline: experience lives on Employee, assignments live on Project, so the aggregate must run over the JOINED rows.",
      "Join first, then group: the join multiplies nothing because employee_id is a key on the Employee side, so grouping by project_id after the join counts each assignment exactly once. ROUND(...,2) applies to the already-averaged value — rounding inputs before averaging would poison the result.",
      "The reflex to avoid is aggregation without the join (AVG over nothing to average) or over the wrong grain — grouping by employee fragments the average into per-person numbers that happen to look like an answer. Concretely: grouping by employee_id would emit employee 1's own experience as a tidy 3.0 row, indistinguishable at a glance from a real per-project average. Right numbers, wrong grain — the most dangerous failure mode in reporting SQL.",
    ],
    edges: [
      "The bench employee (Ivy, 5 years, no assignments) never enters the pipeline — her Employee row matches no Project row and contributes nothing.",
      "Rounding happens on the average: 5/3 = 1.6667 → 1.67. AVG already returns a float in SQLite; SUM(...)/COUNT(*) would integer-truncate to 1.",
      "A one-member project is a legal group — the average over a singleton is just the value, no special casing.",
      "Do not drag employee_id into the GROUP BY — that reports each person's own experience and multiplies the output rows.",
    ],
    ladder: [
      { title: "Brute force — per-project scans", body: "For each project id, collect its employees from Project, look up each experience in Employee, average. Three loops where the engine needs one join and one GROUP BY." },
      { title: "The pattern — join then GROUP BY the answer's grain", body: "The output grain is 'one row per project', so GROUP BY project_id after joining Employee for the experience column. AVG over the joined rows is the plain mean the spec wants." },
      { title: "The optimal idea — AVG + ROUND at the boundary", body: "SELECT project_id, ROUND(AVG(experience_years), 2): AVG returns a float natively, so no cast gymnastics — round once, after aggregating. O(assignments + employees)." },
    ],
    approach: "Join-then-group with AVG + ROUND",
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
  (1,1),(1,2),(1,3),
  (2,1),(2,4),
  (3,5),(3,6),(3,7),   -- experiences 1,2,2 → 5/3 needs ROUND
  (4,8);               -- a single-member project
INSERT INTO Employee (employee_id, name, experience_years) VALUES
  (1,'Khaled',3),
  (2,'Ali',2),
  (3,'John',1),
  (4,'Doe',2),
  (5,'Mia',1),
  (6,'Noah',2),
  (7,'Zoe',2),
  (8,'Raj',4),
  (9,'Ivy',5);         -- on the bench: no assignments, must not appear`,
      tables: [
        { name: "Project", note: "9 assignments over 4 projects — project 3's 1,2,2 make the average need rounding" },
        { name: "Employee", note: "9 people; Ivy (5y) is unassigned and must not create a row" },
      ],
    },
    code: `SELECT
    p.project_id,
    ROUND(AVG(e.experience_years), 2) AS average_years  -- AVG yields a float natively
FROM Project p
JOIN Employee e ON e.employee_id = p.employee_id
GROUP BY p.project_id
ORDER BY p.project_id;`,
    walkthrough: [
      "JOIN Employee e resolves each assignment's employee_id to an experience value; the join multiplies nothing because employee_id is the Employee primary key. Nine assignments in, nine joined rows out.",
      "GROUP BY p.project_id collapses those rows to the answer's grain — one row per project — and AVG averages each group: (3+2+1)/3 = 2.0, (3+2)/2 = 2.5, (1+2+2)/3 = 1.6667, 4/1 = 4.0.",
      "ROUND(...,2) applies after the aggregate: 1.6667 becomes 1.67. Note the idiom — AVG handles the float conversion; the SUM/COUNT spelling of the same idea would need its own 1.0 cast.",
      "The bench employee is the quiet lesson: Employee is the wrong table to anchor on if this pattern ever grows a LEFT JOIN (say, keep projects with no staff). Habit: the table whose grain the answer repeats — here Project — drives the FROM, and the other table is a lookup.",
    ],
    time: "O(a + e) — join assignments to employees, then group",
    space: "O(#projects)",
    followUps: [
      "Show each employee's own experience next to their project's average — AVG(...) OVER (PARTITION BY project_id) after the join, no GROUP BY.",
      "Rank projects by average experience and keep the top one — MAX over the aggregate you just built, which means the aggregate must become a CTE first.",
    ],
    related: ["the-number-of-employees-which-report-to-each-employee", "product-sales-analysis-ii", "average-selling-price"],
    order: "any",
    xp: 10,
  },
  {
    slug: "percentage-of-users-attended-a-contest",
    statement:
      "Users lists registered users and Register logs which users entered which contests. For each contest, report the percentage of ALL registered users that participated in it, rounded to two decimals, with the most popular contest first and contest_id breaking ties.",
    examples: [
      {
        input: "Users: ids 6, 2, 8, 5, 4, 9, 1 (7 users) · Register: 215→{6,2,8}, 363→{6,2,5,8}, 800→{4,9,1}",
        output: "215 · 42.86 → 363 · 57.14 → 800 · 42.86",
        explanation: "3/7 and 4/7 are never clean decimals — 100.0 × 3/7 = 42.857 rounds to 42.86. With 7 users every percentage is non-integer: exactly where integer division would collapse 42.86 to 42.",
      },
      {
        input: "Register: 900→{6} · 999→{1,2,4,5,6,8,9} (everyone)",
        output: "999 · 100.0 → 900 · 14.29",
        explanation: "A contest all seven users entered reports 100.0 and sorts first; 1/7 = 14.2857 → 14.29. Percentage DESC leads and contest_id ASC breaks ties (215 before 800 above).",
      },
    ],
    constraints: [
      "(contest_id, user_id) is unique — a user registers at most once per contest",
      "every registered user_id exists in Users",
      "the denominator is ALL users, not the contest's registrants",
    ],
    breakdown: [
      "For each contest: registered users ÷ ALL users × 100. The denominator is the entire Users table — a constant — while the numerator is a per-group COUNT. That split (aggregate per group vs scalar over the whole table) is the actual skill being tested.",
      "GROUP BY contest_id gives COUNT(*) per contest; a scalar subquery (SELECT COUNT(*) FROM Users) supplies the constant denominator once for every row. Mixing group aggregates with a table-level scalar is bread-and-butter SQL — no join is needed to carry the total around.",
      "The classic misstep is integer division: 100 * COUNT(*) / total computes 300/7 = 42 in SQLite and every output lands on a plausible-looking whole number. The second is using the count of REGISTERED users as the denominator — that computes share-within-contest, a different statistic.",
    ],
    edges: [
      "The division trap in numbers: 100 * 3 / 7 = 42, while 100.0 * 3 / 7 = 42.857 → 42.86. The '.0' is the entire fix.",
      "Denominator is total Users (7 here), not registrations — every percentage in this seed is non-integer by design, so a whole-number output is the tell that the cast was lost.",
      "A contest everyone joined (999) reports exactly 100.0 and must sort first; ties at 42.86 order by contest_id ASC.",
      "Scalar subquery vs CROSS JOIN against a one-row totals CTE: same result, same plan shape at this size — the subquery is the idiomatic read.",
    ],
    ladder: [
      { title: "Brute force — count contests, then divide by hand", body: "One query for per-contest counts, another for total users, divide in application code. Two round-trips, and you have moved a division the engine does for free." },
      { title: "The pattern — per-group COUNT + scalar subquery denominator", body: "GROUP BY contest_id for the numerator; (SELECT COUNT(*) FROM Users) folds a constant into every row's division. Per-group aggregates plus a whole-table scalar is a reusable shape." },
      { title: "The optimal idea — 100.0 * COUNT(*) / total, rounded", body: "The .0 in 100.0 promotes the whole division to floating point before SQLite's integer division can truncate it. O(rows) grouping plus one count of Users." },
    ],
    approach: "Per-group COUNT with a scalar-subquery denominator and float division",
    schema: {
      ddl: `CREATE TABLE Users (
  user_id   INTEGER PRIMARY KEY,
  user_name TEXT NOT NULL
);
CREATE TABLE Register (
  contest_id INTEGER NOT NULL,
  user_id    INTEGER NOT NULL REFERENCES Users(user_id),
  PRIMARY KEY (contest_id, user_id)
);`,
      seed: `INSERT INTO Users (user_id, user_name) VALUES
  (6,'Alice'),(2,'Bob'),(8,'Alex'),(5,'Donald'),(4,'Joe'),(9,'Elvis'),(1,'Anna');
INSERT INTO Register (contest_id, user_id) VALUES
  (215,6),(215,2),(215,8),          -- 3 of 7 → 42.86
  (363,6),(363,2),(363,5),(363,8),  -- 4 of 7 → 57.14
  (800,4),(800,9),(800,1),          -- 3 of 7 → ties 215 at 42.86
  (900,6),                          -- 1 of 7 → 14.29
  (999,1),(999,2),(999,4),(999,5),(999,6),(999,8),(999,9);  -- all 7 → 100.0`,
      tables: [
        { name: "Users", note: "7 users — the constant denominator" },
        { name: "Register", note: "18 registrations over 5 contests; 999 has everyone (100.0), 900 has one (14.29), 215 and 800 tie at 42.86" },
      ],
    },
    code: `SELECT
    r.contest_id,
    ROUND(
        100.0 * COUNT(*) / (SELECT COUNT(*) FROM Users),  -- 100.0 forces float division
        2
    ) AS percentage
FROM Register r
GROUP BY r.contest_id
ORDER BY
    percentage DESC,   -- most popular first
    r.contest_id ASC;  -- deterministic tie order`,
    walkthrough: [
      "GROUP BY r.contest_id buckets the 18 registrations into five groups; COUNT(*) per group is the numerator: 3, 4, 3, 1 and 7.",
      "The denominator never varies, so the scalar subquery (SELECT COUNT(*) FROM Users) evaluates once to 7 and divides every group. No join, no window — just a constant that the planner folds in.",
      "100.0 * COUNT(*) promotes the arithmetic to floating point BEFORE the division: 300.0/7 = 42.857 → 42.86. Delete the '.0' and SQLite computes 300/7 = 42 — a whole number that still looks like a percentage.",
      "ORDER BY percentage DESC puts the full-house contest 999 (100.0) on top and contest_id ASC settles the 42.86 tie between 215 and 800. The grader compares sets here, but a deterministic sort is the habit worth keeping.",
    ],
    time: "O(r + t) — group the registrations, one count over Users",
    space: "O(#contests)",
    followUps: [
      "Flip the statistic: for each user, the percentage of existing contests they entered — same idiom, different GROUP BY and denominator.",
      "Swap the scalar subquery for a CROSS JOIN against a one-row totals CTE and compare readability; then try COUNT over a filtered registration set and reason about which denominator stays honest.",
    ],
    related: ["students-and-examinations", "queries-quality-and-percentage", "confirmation-rate"],
    order: "any",
    xp: 10,
  },
  {
    slug: "queries-quality-and-percentage",
    statement:
      "A search log stores one row per result: the query it belonged to (query_name), the result's position, and a quality rating. Per query_name, report quality — the average of each row's rating divided by its position — and poor_query_percentage, the share of that query's rows rated below 3. Both rounded to two decimals.",
    examples: [
      {
        input: "Dog rows: (position 1, rating 5), (2, 1), (2, 4)",
        output: "Dog · quality 2.5 · poor 33.33",
        explanation: "Per-row ratios 5/1, 1/2, 4/2 average to (5.0 + 0.5 + 2.0)/3 = 2.5; exactly one row has rating < 3, so 1/3 of Dog's rows are poor → 33.33.",
      },
      {
        input: "Bird rows: (3,1),(4,1),(5,2) · Cat rows: (6,3),(6,3)",
        output: "Bird · 0.33 · 100.0 → Cat · 0.5 · 0.0",
        explanation: "Bird's ratios 0.333, 0.25 and 0.4 average to 0.328 → 0.33, and ALL its rows are poor (100.0). Cat's two rows are identical 3/6 = 0.5 with nothing poor. Integer division would report Bird's quality as 0.0 — every per-row ratio would truncate.",
      },
    ],
    constraints: [
      "position and rating are positive integers (rating 1–5) — no zero division, but integer division lurks",
      "query_name repeats across rows; the group is defined by it",
      "quality averages the per-row ratios — it is NOT SUM(rating)/SUM(position)",
    ],
    breakdown: [
      "Two statistics per query_name: quality (average of per-row rating/position ratios) and poor_query_percentage (share of rows with rating < 3). Both are plain group aggregates — the difficulty lives entirely in the arithmetic idioms. The seed's three groups exercise every corner of the spec: Dog averages three distinct ratios, Bird turns out 100% poor, and Cat's two identical rows make its average trivially 0.5 with nothing flagged.",
      "The boolean idiom: (rating < 3) evaluates to 1 or 0 per row, so SUM(rating < 3) counts poor rows and the same expression inside AVG gives their fraction directly. SUM(CASE WHEN … THEN 1 ELSE 0 END) is the same computation with more ceremony — know both, write the short one.",
      "The misstep is per-row integer division: AVG(rating/position) truncates 1/2 to 0 BEFORE averaging, so every sub-1 ratio collapses and quality comes out far too low. Cast per row — 1.0 * rating / position — because AVG(1.0*rating)/AVG(position) is a ratio of averages, a different (wrong) number.",
    ],
    edges: [
      "Per-row vs post-hoc cast: without 1.0 inside the AVG, Dog reports 2.33 ((5+0+2)/3) and Bird reports 0.0 — plausible-looking, quietly wrong.",
      "SUM(rating < 3) counts the 1s; COUNT(CASE WHEN rating < 3 THEN 1 END) is the longhand equivalent, and COUNT(*) is the right denominator because every row is a sample.",
      "All-poor groups exist: Bird is 100.0 poor. Do not let a mental model of 'some poor rows' break on a group where it is all of them.",
      "If a dirty feed ever ships NULL query_name rows, GROUP BY lumps them into one NULL group — decide deliberately whether that bucket belongs in the report.",
    ],
    ladder: [
      { title: "Brute force — bucket rows, compute two stats", body: "Group rows by query_name in the host language, loop each bucket for the ratio average and the poor count. A perfect re-derivation of what GROUP BY plus two aggregates do natively in one scan." },
      { title: "The pattern — two aggregates over one group", body: "Quality is AVG over per-row ratios; poor percentage is a conditional count over the same groups. One GROUP BY, two independent aggregates — no second pass, no second query." },
      { title: "The optimal idea — float the division, count with booleans", body: "AVG(1.0 * rating / position) keeps each ratio real; SUM(rating < 3) / COUNT(*) counts the poor share using SQLite's boolean-as-integer convention. One scan, O(n)." },
    ],
    approach: "One-pass dual aggregate — float AVG of ratios + boolean SUM",
    schema: {
      ddl: `CREATE TABLE Queries (
  query_name TEXT NOT NULL,
  result     TEXT NOT NULL,
  position   INTEGER NOT NULL,
  rating     INTEGER NOT NULL
);`,
      seed: `INSERT INTO Queries (query_name, result, position, rating) VALUES
  ('Dog','Golden',1,5),
  ('Dog','Poodle',2,1),   -- 1/2: integer division would zero this ratio
  ('Dog','Husky',2,4),
  ('Cat','Siamese',6,3),
  ('Cat','Persian',6,3),  -- identical 3/6 ratios → quality exactly 0.5
  ('Bird','Crow',3,1),
  ('Bird','Owl',4,1),
  ('Bird','Finch',5,2);   -- all three poor → 100.0`,
      tables: [
        { name: "Queries", note: "8 rows over 3 query names — Dog carries the 1/2 ratio bait, Bird is all-poor with sub-1 ratios" },
      ],
    },
    code: `SELECT
    q.query_name,
    ROUND(AVG(1.0 * q.rating / q.position), 2) AS quality,  -- 1.0: float division PER ROW, before averaging
    ROUND(
        100.0 * SUM(q.rating < 3) / COUNT(*),               -- boolean SUM counts the 1s
        2
    ) AS poor_query_percentage
FROM Queries q
GROUP BY q.query_name
ORDER BY q.query_name;`,
    walkthrough: [
      "One GROUP BY, two independent aggregates. Per name, AVG(1.0 * rating / position) averages the per-row ratios — Dog: (5.0 + 0.5 + 2.0)/3 = 2.5 — while SUM(rating < 3) counts the rows below the bar: Dog has one, so 1/3 of its rows are poor → 33.33.",
      "The 1.0 sits inside the AVG and is load-bearing: without it 1/2 truncates to 0 per row, Dog lands at 2.33 and Bird — whose ratios are 1/3, 1/4, 2/5 — collapses to 0.0. Casting after the average is too late; the damage is per row.",
      "SUM(rating < 3) rides SQLite's boolean-as-integer convention: each comparison yields 1 or 0, and SUM counts the 1s. COUNT(*) is the denominator because every row is a sample — even for Cat, where zero poor rows give an honest 0.0.",
      "Bird is the ceiling case: every row poor → 100.0, quality 0.33 after rounding 0.3278. The same two aggregates cover a group that is entirely poor and a group that is entirely clean — no special-casing anywhere.",
    ],
    time: "O(q) — single scan, two aggregates per group",
    space: "O(#query_names)",
    followUps: [
      "Recompute quality as SUM(rating)/SUM(position) and compare on the seed — totals-of-ratios vs ratio-of-totals are different statistics; know which one the spec names.",
      "Add an excellent_query_percentage with the same boolean idiom (rating/position >= 3) and check that Dog's three buckets sum to 100.",
    ],
    related: ["percentage-of-users-attended-a-contest", "triangle-judgement", "immediate-food-delivery-i"],
    order: "any",
    xp: 10,
  },
  {
    slug: "average-time-of-process-per-machine",
    statement:
      "Activity logs a 'start' and an 'end' row for every process run on every machine, each carrying a fractional-second timestamp. For each machine, report the average process duration — end minus start, averaged over that machine's processes — rounded to three decimals.",
    examples: [
      {
        input: "Machine 0: process 0 start 0.712 → end 1.520; process 1 start 3.140 → end 4.120",
        output: "0 · 0.894",
        explanation: "Durations 0.808 and 0.980 average to 1.788/2 = 0.894 — the self-join pairs each start with its end on (machine_id, process_id).",
      },
      {
        input: "Machine 1: three processes with durations 1.000, 0.990, 0.412 · Machine 3: one process, start 2.000 → end 2.750",
        output: "1 · 0.801 → 3 · 0.75",
        explanation: "Machine 1: 2.402/3 = 0.8007 → 0.801 at three decimals; a single-process machine averages to its only duration. ROUND(...,3) — the spec's precision — is applied after averaging.",
      },
    ],
    constraints: [
      "each (machine_id, process_id) has exactly one 'start' and one 'end' row",
      "end timestamps are strictly greater than start timestamps",
      "machines have differing process counts — averages over groups of size 1..n",
    ],
    breakdown: [
      "Each process is SPLIT across two rows of one table — a 'start' and an 'end' — and the answer needs their difference. Any time a fact is spread over two rows, the fix is a self-join: treat the table as two copies, one playing the start role, one the end role.",
      "The pairing key is (machine_id, process_id), and the roles are pinned by two extra ON conditions: s.activity_type = 'start' and e.activity_type = 'end'. Because each process has exactly one of each, every start row matches exactly one end row — no row multiplication, so AVG over the differences is safe.",
      "The tempting shortcut is aggregating first — MAX(timestamp) − MIN(timestamp) per (machine, process) — and it even works here because there are exactly two rows per process. But it silently assumes two rows; the self-join states the semantics and survives a third activity type (say 'pause') without changing shape.",
    ],
    edges: [
      "Both role conditions live in ON, not WHERE — identical plan on this inner join, but the discipline matters the moment this becomes an outer join hunting processes missing an end.",
      "Exactly one start and one end per (machine_id, process_id) guarantees one matched row per start; a duplicated end would silently double that process's weight in the average.",
      "ROUND to 3 decimals AFTER averaging: machine 1's 0.8007 prints 0.801; rounding each duration first would drift off the expected values.",
      "REAL arithmetic wobbles (1.52 − 0.712 = 0.8080000000000002) — ROUND at the end absorbs the noise, and floats should never be compared for exact equality mid-query.",
    ],
    ladder: [
      { title: "Brute force — two dictionaries", body: "Walk the table once into starts[(machine, process)] and ends[(machine, process)], then walk the keys and average the differences. It works — and it is a self-join with extra steps and no set semantics." },
      { title: "The pattern — self-join to reunite split facts", body: "Copy the table: s holds 'start' rows, e holds 'end' rows; join on (machine_id, process_id) with both type conditions in ON. The pair is whole again on a single row, so ordinary AVG applies." },
      { title: "The optimal idea — AVG of end − start, grouped by machine", body: "GROUP BY s.machine_id with ROUND(AVG(e.timestamp − s.timestamp), 3). Each start matches exactly one end, so no multiplication; one hash join and one grouping pass, O(n)." },
    ],
    approach: "Role-pinned self-join + AVG of durations",
    schema: {
      ddl: `CREATE TABLE Activity (
  machine_id    INTEGER NOT NULL,
  process_id    INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  timestamp     REAL NOT NULL,
  PRIMARY KEY (machine_id, process_id, activity_type)
);`,
      seed: `INSERT INTO Activity (machine_id, process_id, activity_type, timestamp) VALUES
  (0,0,'start',0.712),(0,0,'end',1.520),   -- 0.808
  (0,1,'start',3.140),(0,1,'end',4.120),   -- 0.980
  (0,2,'start',7.000),(0,2,'end',11.500),  -- 4.500: stretches machine 0's average
  (1,0,'start',0.550),(1,0,'end',1.550),   -- 1.000
  (1,1,'start',0.430),(1,1,'end',1.420),   -- 0.990
  (1,2,'start',4.100),(1,2,'end',4.512),   -- 0.412
  (2,0,'start',11.00),(2,0,'end',11.99),   -- 0.990
  (3,0,'start',2.000),(3,0,'end',2.750);   -- 0.750: a one-process machine`,
      tables: [
        { name: "Activity", note: "16 rows, 7 processes over 4 machines — machine 0 mixes sub-second and 4.5s durations; machine 3 has a single process" },
      ],
    },
    code: `SELECT
    s.machine_id,
    ROUND(AVG(e.timestamp - s.timestamp), 3) AS average_time  -- official wants 3 decimals
FROM Activity s                                   -- the START half of every pair
JOIN Activity e
  ON e.machine_id    = s.machine_id               -- same machine…
 AND e.process_id    = s.process_id               -- …same process…
 AND s.activity_type = 'start'
 AND e.activity_type = 'end'                     -- …roles pinned in ON
GROUP BY s.machine_id
ORDER BY s.machine_id;`,
    walkthrough: [
      "FROM Activity s JOIN Activity e splits the log into two role-playing copies: s contributes the 'start' rows, e the 'end' rows. The join keys (machine_id, process_id) reunite each process's halves onto one row.",
      "Both role conditions live in ON: s.activity_type = 'start' AND e.activity_type = 'end'. Drop either and every start row pairs with every row on the other side — the average quietly swallows a factor of two.",
      "Because each (machine_id, process_id) has exactly one start and one end, the join is one-to-one: 7 matched pairs, no multiplication. e.timestamp − s.timestamp is the duration, and AVG per machine is the mean — machine 0: (0.808 + 0.980 + 4.500)/3 = 2.096.",
      "ROUND(...,3) comes after the averaging, per the spec: machine 1's 2.402/3 = 0.8007 prints 0.801. The one-process machine (3) averages to its only duration, 0.75 — groups of size one need no special case.",
    ],
    time: "O(n) — hash join on (machine_id, process_id), then one group per machine",
    space: "O(#machines)",
    followUps: [
      "Hunt incomplete logs: LEFT JOIN the start side and WHERE e.timestamp IS NULL lists processes that never ended — the anti-join again.",
      "Compute per-process durations in a CTE first, then average — compare readability and the query plan against the single-pass self-join.",
    ],
    related: ["average-selling-price", "top-travellers", "capital-gain-loss"],
    order: "any",
    xp: 10,
  },
  {
    slug: "managers-with-at-least-5-direct-reports",
    statement:
      "Employee rows carry an id, a name and a nullable managerId pointing at the employee's direct manager. Report the names of managers with at least five direct reports.",
    examples: [
      {
        input: "John (101) manages 102–106 (5 reports) · Kate (200) manages 201–204 (4 reports)",
        output: "John",
        explanation: "Five direct reports clears the >= 5 bar; Kate's four miss it — the boundary is inclusive, so exactly 5 qualifies.",
      },
      {
        input: "Sam (300) manages 301–306 (6 reports) · three top-of-tree employees have managerId NULL",
        output: "John → Sam",
        explanation: "Direct means one level only — nobody further down counts. NULL managerIds would form one phantom group under GROUP BY if not filtered explicitly.",
      },
    ],
    constraints: [
      "managerId is NULL for top-of-tree employees",
      "only DIRECT reports count — one level, no recursion",
      "'at least five' means >= 5: exactly five qualifies",
    ],
    breakdown: [
      "Count each manager's direct reports, keep the counts that reach 5, then fetch names. The count lives naturally on the managerId column: GROUP BY managerId turns each distinct manager value into a group whose COUNT(*) is exactly the number of rows pointing at it.",
      "The reusable shape is aggregate-then-join-back: the aggregate on the FK produces qualifying manager ids; a join back to Employee decorates them with the name. You cannot select a manager's name alongside COUNT(*) without either grouping the name too or doing exactly this join afterwards.",
      "Missteps: filtering with WHERE count >= 5 — WHERE runs before groups exist and cannot see aggregates, which is why HAVING exists; counting with a self-join but grouping only by name (two managers named 'John' would merge); and letting the NULL managerId bucket ride along unexamined.",
    ],
    edges: [
      "The boundary is inclusive: 5 reports qualifies, 4 does not — the seed's Kate at exactly 4 is the negative test.",
      "NULL managerIds form one group under GROUP BY; the explicit IS NOT NULL keeps the CTE honest — and NULL never matches any id at the join-back anyway, which is your safety net if the filter is forgotten.",
      "Direct reports only: no recursion. Someone two levels down contributes zero to their grandmanager's count.",
      "Grouping by managerId alone (then joining back for the name) decouples the aggregate from the payload; grouping by (id, name) directly also works but couples them.",
    ],
    ladder: [
      { title: "Brute force — count per manager in app code", body: "Load everyone, build a map manager → direct-report count, filter counts >= 5, print names. It is the loop-shaped, non-set version of a GROUP BY." },
      { title: "The pattern — aggregate on the FK, join back for payload", body: "GROUP BY managerId with COUNT(*) and HAVING >= 5 yields qualifying manager ids; a join back to Employee adds names. Aggregation and display stay decoupled." },
      { title: "The optimal idea — HAVING filters what WHERE cannot see", body: "WHERE managerId IS NOT NULL prunes noise pre-grouping; HAVING COUNT(*) >= 5 filters the groups themselves. One grouping pass plus an indexed join back: O(n)." },
    ],
    approach: "GROUP BY FK + HAVING threshold, join back for names",
    schema: {
      ddl: `CREATE TABLE Employee (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  department TEXT,
  managerId  INTEGER
);`,
      seed: `INSERT INTO Employee (id, name, department, managerId) VALUES
  (101,'John','A',NULL),
  (102,'Dan','A',101),
  (103,'James','A',101),
  (104,'Amy','A',101),
  (105,'Anne','A',101),
  (106,'Ron','B',101),      -- John: 5 direct reports → qualifies
  (200,'Kate','B',NULL),
  (201,'Pete','B',200),
  (202,'Quinn','B',200),
  (203,'Rose','B',200),
  (204,'Sara','B',200),     -- Kate: exactly 4 → the boundary that must NOT qualify
  (300,'Sam','C',NULL),
  (301,'Tina','C',300),
  (302,'Umar','C',300),
  (303,'Vera','C',300),
  (304,'Wade','C',300),
  (305,'Xena','C',300),
  (306,'Yusuf','C',300);    -- Sam: 6 → qualifies`,
      tables: [
        { name: "Employee", note: "18 employees — John has 5 reports (in), Kate 4 (boundary out), Sam 6 (in); three top-of-tree NULL managerIds" },
      ],
    },
    code: `WITH reports AS (
    -- one row per manager id that clears the bar
    SELECT managerId, COUNT(*) AS report_count
    FROM Employee
    WHERE managerId IS NOT NULL  -- top-of-tree NULLs would form one phantom group
    GROUP BY managerId
    HAVING COUNT(*) >= 5         -- HAVING filters GROUPS; WHERE can't see aggregates
)
SELECT e.name
FROM reports r
JOIN Employee e ON e.id = r.managerId  -- join back for the payload (the name)
ORDER BY e.name;`,
    walkthrough: [
      "managerId IS NOT NULL prunes the three top-of-tree bosses before grouping — otherwise GROUP BY managerId buckets all NULLs into one phantom group (harmless at three, dangerous at five or more, and always noise).",
      "GROUP BY managerId turns the remaining rows into one group per manager value, and COUNT(*) inside such a group is by construction the number of employees pointing at that manager. HAVING COUNT(*) >= 5 keeps John's 5 and Sam's 6 and drops Kate's 4 — the inclusive boundary doing its job.",
      "The join back to Employee on e.id = r.managerId is pure payload retrieval: the aggregate knows the manager's id, the name lives on the row. As a safety net, NULL could never survive this join anyway — NULL equals nothing, not even NULL.",
      "WHERE cannot do this filtering: it runs before groups exist and cannot see COUNT(*). 'Aggregate, then join for names' is the shape to reuse whenever the answer's grain differs from the payload's table.",
    ],
    time: "O(e) — one grouping pass plus an indexed join back",
    space: "O(#managers)",
    followUps: [
      "Find the complement: employees who manage nobody — LEFT JOIN the other direction plus IS NULL, the anti-join you already know.",
      "Make the threshold a report parameter and note that HAVING is the only clause that can express it — then try the self-join spelling (GROUP BY e1.id, e1.name HAVING COUNT(*)) and compare.",
    ],
    related: ["the-number-of-employees-which-report-to-each-employee", "project-employees-i", "top-travellers"],
    order: "any",
    xp: 20,
  },
  {
    slug: "confirmation-rate",
    statement:
      "Signups registers users; Confirmations logs each user's confirmation attempts as 'confirmed' or 'timeout'. For every signup, report the confirmation rate — the fraction of that user's attempts that were confirmed, rounded to two decimals — reporting 0.00 for users who never attempted one.",
    examples: [
      {
        input: "User 7: three attempts, all 'confirmed' · User 2: one 'confirmed', one 'timeout'",
        output: "2 · 0.5 → 7 · 1.0",
        explanation: "AVG(action = 'confirmed') treats each row as 1 or 0: user 7 averages to 1 → 1.0, user 2 to 0.5.",
      },
      {
        input: "User 6 signed up but has NO Confirmations rows · User 10: one 'confirmed', two 'timeout'",
        output: "6 · 0.0 → 10 · 0.33",
        explanation: "With no rows to average, the LEFT JOIN's NULLs make AVG return NULL — COALESCE turns that into 0.00, the rate the spec demands. User 10's 1/3 rounds to 0.33.",
      },
    ],
    constraints: [
      "action is 'confirmed' or 'timeout'",
      "a user may attempt zero or more times — zero is the graded case",
      "every user_id in Confirmations appears in Signups; the reverse is not true",
    ],
    breakdown: [
      "The confirmation rate is the fraction of a user's attempts that succeeded — an AVG over a boolean. The hidden half of the spec is the zero case: a user with no attempts has no average, and the expected answer is 0.00, not NULL and not absence.",
      "LEFT JOIN from Signups guarantees every user forms a group even with zero confirmation rows; inside the group, (c.action = 'confirmed') is 1 or 0 per attempt, so AVG gives the fraction directly. COALESCE then maps the no-rows NULL to 0.0 — one function and the edge case is handled by construction instead of a UNION.",
      "The misstep is INNER JOIN: users with zero attempts simply vanish and the spec's first promise fails. The subtler one is COALESCE in the wrong place — the NULL lives at the group level (AVG over nothing), so it must be caught around the result, not smuggled into the per-row expression.",
    ],
    edges: [
      "Zero-attempt users (seed: user 6) are the graded edge: LEFT JOIN + COALESCE(..., 0.0) → 0.0; an INNER JOIN loses the row, a bare AVG shows NULL.",
      "The boolean AVG: (action = 'confirmed') is 1/0, so AVG over {1, 0, 0} is 0.333 → 0.33 at two decimals. No CASE needed.",
      "The rate is a fraction (0.0–1.0), NOT a percentage — no ×100; the spec's 0.00/0.50/1.00 scale is the tell.",
      "ROUND(NULL, 2) is still NULL, so the COALESCE must sit where it can see that NULL — outside the ROUND (or around the AVG) both work; inside the per-row expression does nothing.",
    ],
    ladder: [
      { title: "Brute force — rate each user from a map", body: "Fetch signups, fetch confirmations, bucket attempts by user, compute confirmed/total with an explicit zero special-case in code. Every piece exists in SQL as a join, an AVG and a COALESCE." },
      { title: "The pattern — LEFT JOIN + boolean AVG", body: "LEFT JOIN keeps zero-attempt users in play; AVG(action = 'confirmed') reduces each user's attempts to a fraction. The join choice IS the edge-case strategy." },
      { title: "The optimal idea — COALESCE the group-level NULL", body: "A user with no rows averages NULL, so COALESCE(ROUND(AVG(...), 2), 0.0) closes the gap the LEFT JOIN opens: no rows ⇒ NULL ⇒ 0.00. One pass over Confirmations with PK lookups, O(s + c)." },
    ],
    approach: "LEFT JOIN + boolean AVG + COALESCE zero-fill",
    schema: {
      ddl: `CREATE TABLE Signups (
  user_id INTEGER PRIMARY KEY,
  time    TEXT NOT NULL
);
CREATE TABLE Confirmations (
  user_id    INTEGER NOT NULL REFERENCES Signups(user_id),
  time_stamp TEXT NOT NULL,
  action     TEXT NOT NULL,
  PRIMARY KEY (user_id, time_stamp)
);`,
      seed: `INSERT INTO Signups (user_id, time) VALUES
  (3,'2020-03-21 10:16:13'),
  (7,'2020-01-04 13:57:59'),
  (2,'2020-07-29 23:09:44'),
  (6,'2020-12-09 10:39:37'),   -- zero attempts → must report 0.00, not NULL
  (10,'2020-05-15 09:00:00'),
  (11,'2020-08-01 09:00:00');
INSERT INTO Confirmations (user_id, time_stamp, action) VALUES
  (3,'2021-01-06 03:30:46','timeout'),
  (3,'2021-07-14 14:00:00','timeout'),        -- user 3: 0 of 2 → 0.0
  (7,'2021-06-12 15:32:54','confirmed'),
  (7,'2021-06-13 12:39:51','confirmed'),
  (7,'2021-06-21 11:21:31','confirmed'),      -- user 7: 3 of 3 → 1.0
  (2,'2021-01-22 08:33:12','confirmed'),
  (2,'2021-01-22 08:33:13','timeout'),        -- user 2: 1 of 2 → 0.5
  (10,'2021-02-01 10:00:00','confirmed'),
  (10,'2021-02-01 10:05:00','timeout'),
  (10,'2021-02-01 10:09:00','timeout'),       -- user 10: 1 of 3 → 0.33
  (11,'2021-09-01 10:00:00','confirmed'),
  (11,'2021-09-01 10:01:00','confirmed'),
  (11,'2021-09-01 10:02:00','confirmed'),
  (11,'2021-09-01 10:03:00','timeout');       -- user 11: 3 of 4 → 0.75`,
      tables: [
        { name: "Signups", note: "6 signups — user 6 has no confirmation rows at all" },
        { name: "Confirmations", note: "14 attempts: 1.0, 0.5, 0.0, 0.33 and 0.75 rates all represented" },
      ],
    },
    code: `SELECT
    s.user_id,
    COALESCE(
        ROUND(AVG(c.action = 'confirmed'), 2),  -- boolean AVG → fraction confirmed
        0.0                                     -- zero-attempt users: 0.00, not NULL
    ) AS confirmation_rate
FROM Signups s
LEFT JOIN Confirmations c ON c.user_id = s.user_id  -- LEFT: signups without attempts survive
GROUP BY s.user_id
ORDER BY s.user_id;`,
    walkthrough: [
      "FROM Signups s LEFT JOIN Confirmations c guarantees one group per signup even when the right side is empty: user 6 contributes a group whose c.action is all NULL. The join direction IS the edge-case strategy — an INNER JOIN would erase user 6 and fail the spec's first promise.",
      "Inside each group, (c.action = 'confirmed') evaluates to 1 or 0 per attempt, so AVG gives the confirmed fraction directly: user 7 → 1.0, user 2 → 0.5, user 10 → 1/3. No CASE, no division, no separate count.",
      "For user 6 there is nothing to average: AVG over NULLs returns NULL and ROUND keeps it NULL. COALESCE sits outside precisely to catch that — the spec demands 0.00 for never-attempted users, and one function converts 'no data' into 'definitely zero'.",
      "ROUND(...,2) lands the rest: user 10's 0.3333 prints 0.33, user 11's 3/4 prints 0.75. Note the scale — these are fractions (0.0–1.0), not percentages; multiplying by 100 is the most common self-inflicted bug on this problem.",
    ],
    time: "O(s + c) — one outer pass, one indexed join, one grouping pass",
    space: "O(#users)",
    followUps: [
      "Count users whose first-ever attempt succeeded — MIN(time_stamp) per user, then check that attempt's action: a two-step aggregate over the same join.",
      "Flip the direction: list every confirmation attempt including any whose user never signed up — which join shows orphans, and which silently drops them?",
    ],
    related: ["students-and-examinations", "percentage-of-users-attended-a-contest", "top-travellers"],
    order: "any",
    xp: 20,
  },
];
