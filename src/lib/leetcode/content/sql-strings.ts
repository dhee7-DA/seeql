// Deep-dives — the SQL 50 "Advanced String Functions" band (6 problems:
// self-joins, window-assisted filters, conditional aggregation, outer-join
// null discipline, anti-joins). Solutions are SQLite dialect, one statement
// each, verified engine-side against the per-problem seed.
import type { LcSqlDive } from "../types";

export const SQL_STRINGS: LcSqlDive[] = [
  {
    slug: "the-number-of-employees-which-report-to-each-employee",
    statement:
      "Employees tracks a small org chart: each row carries a person's id, name, direct manager (reports_to — NULL at the top of the chain) and age. For every employee who has at least one direct report, report their id and name, how many people report to them, and those reports' average age rounded to the nearest integer. One row per manager, ordered by employee_id.",
    examples: [
      {
        input: "Employees: (9,'Hercy',NULL,43),(6,'Alice',9,41),(4,'Bob',9,36),(2,'Winston',NULL,37)",
        output: "9 · Hercy · 2 · 39",
        explanation: "Alice (41) and Bob (36) report to Hercy: 2 reports, average age (41+36)/2 = 38.5 → 39. Winston has no reports, so he appears nowhere.",
      },
      {
        input: "Add (5,'David',6,27),(3,'Eve',6,28),(1,'Zoe',2,25)",
        output: "2 · Winston · 1 · 25 · / 6 · Alice · 2 · 28 · / 9 · Hercy · 2 · 39",
        explanation: "Alice becomes a manager too (David and Eve, average 27.5 → 28) while still counting as one of Hercy's reports; a single report makes Winston a manager.",
      },
    ],
    constraints: [
      "reports_to points to an existing employee_id, or is NULL at the top of the chain",
      "only employees with at least one direct report appear in the output",
      "columns: employee_id, name, reports_count, average_age — age rounded to the nearest integer",
    ],
    breakdown: [
      "Two roles, one table: every row can wear a REPORT hat (alias r) or a MANAGER hat (alias m). The join r.reports_to = m.employee_id turns each report row into a (report, manager) pair — it materializes the edges of the org chart. Managers with no reports find no partner and drop out of an inner join, which is correct: the spec only asks about employees who have reports.",
      "The grouping unit is the MANAGER: GROUP BY m.employee_id (plus m.name for display) collapses each manager's report rows into one output row. COUNT(*) counts the reports; AVG(r.age) averages the REPORTS' ages — not the manager's. Swapping r.age for m.age is the quiet killer: m.age is constant within a group, so the 'average' would silently equal the manager's own age and still look plausible.",
      "Rounding is part of the spec, not presentation: ROUND(AVG(r.age), 0) snaps 38.5 to 39 and 27.5 to 28 (SQLite rounds halfway away from zero). SQLite returns the result as a float like 39.0 — the same number, compared numerically. The official output is pinned to employee_id order, so ORDER BY m.employee_id even though grading itself compares rows as a set.",
    ],
    edges: [
      "Direct reports only: David and Eve must not inflate Hercy's count, even though their manager Alice reports to Hercy.",
      "AVG(r.age) over the reports, never m.age — one wrong alias produces a confident-looking wrong column.",
      "ROUND(..., 0) is required: 38.5 must ship as 39, not 38.5.",
      "A manager with exactly one report still needs a row — COUNT of 1, no rounding drama.",
    ],
    ladder: [
      { title: "Brute force — correlate per employee", body: "For each employee, scan the table for rows whose reports_to points at them, count them and average their ages: a correlated subquery per row, O(n²), and the rounding logic dangles outside the query." },
      { title: "The pattern — self-join, one table in two hats", body: "Alias the same table twice (r and m) and join report side to manager side. The join materializes every (report, manager) edge once; grouping by the manager side finishes the aggregation." },
      { title: "The optimal idea — join, group, round", body: "JOIN Employees r to Employees m ON m.employee_id = r.reports_to, GROUP BY the manager, COUNT(*) and ROUND(AVG(r.age), 0). One hash-join pass plus one grouping pass." },
    ],
    approach: "Self-join Employees to itself, GROUP BY manager",
    schema: {
      ddl: `CREATE TABLE Employees (
  employee_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  reports_to  INTEGER REFERENCES Employees(employee_id),
  age         INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employees (employee_id, name, reports_to, age) VALUES
  (9,'Hercy',NULL,43),
  (6,'Alice',9,41),
  (4,'Bob',9,36),
  (2,'Winston',NULL,37),
  (5,'David',6,27),   -- trap: Alice becomes a manager too (chain, not a flat chart)
  (3,'Eve',6,28),     -- Alice's average: (27+28)/2 = 27.5 → ROUND → 28
  (1,'Zoe',2,25);     -- trap: exactly ONE report makes Winston a manager`,
      tables: [
        { name: "Employees", note: "7 rows; Hercy and Winston manage, Alice manages AND reports, David/Eve/Zoe are pure reporters" },
      ],
    },
    code: `SELECT
    m.employee_id,                          -- the manager: the grouping unit
    m.name,
    COUNT(*) AS reports_count,              -- one row per DIRECT report
    ROUND(AVG(r.age), 0) AS average_age     -- reporters' ages, not the manager's
FROM Employees r                            -- r wears the REPORT hat
JOIN Employees m                            -- m wears the MANAGER hat
  ON m.employee_id = r.reports_to
GROUP BY m.employee_id, m.name
ORDER BY m.employee_id;`,
    walkthrough: [
      "The self-join pairs every report row with its manager's row: Alice→Hercy, Bob→Hercy, David→Alice, Eve→Alice, Zoe→Winston. Hercy and Winston have no reports_to value, so as REPORTS they never enter; as MANAGERS they anchor groups.",
      "GROUP BY m.employee_id, m.name collapses the five pairs into three manager groups. COUNT(*) counts rows per group: Hercy 2, Alice 2, Winston 1 — and the count is direct reports only, because David and Eve pair with Alice, never with Hercy.",
      "AVG(r.age) runs over the reports in each group: Hercy's (41+36)/2 = 38.5, Alice's 27.5, Winston's 25. ROUND(..., 0) snaps them to 39, 28 and 25 — check that the 38.5 case rounds up, which is the boundary the grader tests.",
      "ORDER BY m.employee_id prints 2 Winston, 6 Alice, 9 Hercy — the official presentation. Grading compares the three rows as a set, but a fixed order keeps snapshots diffable.",
    ],
    time: "O(n) — one hash join plus one grouping pass over the pairs",
    space: "O(n) — the join pairs, then one row per manager",
    followUps: [
      "Include managers with ZERO direct reports as reports_count 0 — flip the self-join to LEFT JOIN and decide which alias goes on the left.",
      "Count reports two levels down the chain (join the self-join to itself), or take it infinitely deep with a recursive CTE over the org chart.",
    ],
    related: ["employees-earning-more-than-their-managers", "top-travellers", "capital-gain-loss"],
    order: "any",
    xp: 10,
  },
  {
    slug: "primary-department-for-each-employee",
    statement:
      "An employee can belong to several departments, one row per membership, and primary_flag marks 'the' primary department — but only when there IS a choice. Employees who belong to exactly one department carry no flag ('N'), yet that lone department is still their primary. Report each employee's id together with the department_id of their primary department.",
    examples: [
      {
        input: "Employee: (1,1,'N'),(2,1,'Y'),(1,2,'Y'),(2,2,'N'),(3,3,'N'),(4,4,'N')",
        output: "1 · 2 · / 2 · 1 · / 3 · 3 · / 4 · 4",
        explanation: "Employees 1 and 2 hold two departments each, so the 'Y' row wins. Employees 3 and 4 hold exactly one department flagged 'N' — it is still their primary and must appear.",
      },
    ],
    constraints: [
      "each employee has at least one department row",
      "multi-department employees have exactly one primary_flag = 'Y'; single-department employees may be flagged 'N'",
      "output: employee_id and the primary department_id, one row per employee",
    ],
    breakdown: [
      "The spec is two rules stapled together: for multi-department employees the primary is where the flag says 'Y'; for single-department employees the primary is wherever they are, even though the flag reads 'N'. Any query that handles only one of the two rules loses rows — filtering WHERE primary_flag = 'Y' alone deletes every lone-department employee, which is exactly the bug the seed is built to catch.",
      "The missing fact is 'how many departments does this employee hold?' — a per-employee aggregate that must ride alongside each row without collapsing them. That is precisely what COUNT(*) OVER (PARTITION BY employee_id) computes: the same count stamped onto every row of that employee, no GROUP BY, no row loss.",
      "With dept_count in hand, the filter reads like the spec: keep the row if primary_flag = 'Y' OR dept_count = 1. The classic alternative is a UNION — flag rows on one branch, GROUP BY + HAVING COUNT(*) = 1 on the other — which is correct but scans the table twice and puts the two rules in two places to keep in sync.",
    ],
    edges: [
      "Single-department employees flagged 'N' must still appear — the OR dept_count = 1 clause is load-bearing.",
      "Exactly one 'Y' per multi-department employee (guaranteed by the data), so the filter never emits two rows for one person.",
      "COUNT(*) OVER (...) — a plain COUNT aggregate would collapse the very rows you are trying to filter.",
      "Grading compares sets; ORDER BY employee_id is for stable, readable snapshots.",
    ],
    ladder: [
      { title: "Brute force — two queries and a UNION", body: "Branch 1: rows with primary_flag = 'Y'. Branch 2: employees whose only row is their department, via GROUP BY employee_id HAVING COUNT(*) = 1. Correct, but Employee is scanned twice and dedup semantics of UNION are one more thing to get right." },
      { title: "The pattern — window functions carry group facts", body: "COUNT(*) OVER (PARTITION BY employee_id) attaches a group-level number to every row while keeping all rows alive — the 'aggregate without collapsing' move that unlocks row-level filters on group facts." },
      { title: "The optimal idea — compute the count, then OR the rules", body: "One pass computes dept_count; the WHERE keeps flag rows and lone rows alike. O(n) with a hash partition, one scan, one filter." },
    ],
    approach: "Window COUNT per employee + two-rule OR filter",
    schema: {
      ddl: `CREATE TABLE Employee (
  employee_id   INTEGER NOT NULL,
  department_id INTEGER NOT NULL,
  primary_flag  TEXT NOT NULL CHECK (primary_flag IN ('Y','N')),
  PRIMARY KEY (employee_id, department_id)
);`,
      seed: `INSERT INTO Employee (employee_id, department_id, primary_flag) VALUES
  (1,1,'N'),(2,1,'Y'),(1,2,'Y'),(2,2,'N'),  -- official: 1 and 2 hold two departments each
  (3,3,'N'),                                -- trap: lone department flagged 'N' → still primary
  (4,4,'N'),                                -- same trap, different id
  (5,5,'N'),                                -- engineered: another single-department employee
  (6,5,'Y'),(6,6,'N'),                      -- engineered: 'Y' on the LOWER department id
  (7,7,'N'),(7,8,'N'),(7,9,'Y');            -- engineered: three departments, 'Y' last`,
      tables: [
        { name: "Employee", note: "10 membership rows; 3, 4 and 5 are single-department employees whose 'N' flag must not disqualify them" },
      ],
    },
    code: `WITH flagged AS (
    SELECT
        employee_id,
        department_id,
        primary_flag,
        COUNT(*) OVER (PARTITION BY employee_id) AS dept_count  -- group fact, rows intact
    FROM Employee
)
SELECT employee_id, department_id
FROM flagged
WHERE primary_flag = 'Y'   -- multi-department: exactly one flag says so
   OR dept_count = 1       -- single-department: the only row wins, even flagged 'N'
ORDER BY employee_id;`,
    walkthrough: [
      "flagged re-emits all 10 membership rows unchanged, adding dept_count: 2 for employees 1 and 2, 1 for employees 3, 4 and 5, 2 for employee 6, and 3 for employee 7 — the count travels with the row instead of grouping it away.",
      "The WHERE applies the two rules in one breath: (1,2,'Y') survives via the flag while (1,1,'N') dies; (2,1,'Y') survives; employee 3's lone (3,3,'N') survives via dept_count = 1 — delete that OR clause and three employees vanish.",
      "Engineered rows stress the flag's position, not its existence: employee 6 keeps (6,5) because the 'Y' sits on the lower id, and employee 7's three-department partition resolves to (7,9) from the flag alone.",
      "The result is one row per employee — 1→2, 2→1, 3→3, 4→4, 5→5, 6→5, 7→9 — printed in employee_id order; the grader compares the seven rows as a set.",
    ],
    time: "O(n) — one pass to window-count, one to filter",
    space: "O(n) — the windowed copy of the table",
    followUps: [
      "Return every (employee, department) membership with an is_primary boolean instead of filtering — same window, plus a CASE.",
      "Rewrite with GROUP BY + MAX(CASE WHEN primary_flag = 'Y' THEN department_id END) and a HAVING COUNT(*) = 1 fallback — which version survives a hypothetical double-'Y' data bug more gracefully?",
    ],
    related: ["the-number-of-employees-which-report-to-each-employee", "customers-who-never-order", "top-travellers"],
    order: "any",
    xp: 10,
  },
  {
    slug: "triangle-judgement",
    statement:
      "Triangle holds the three side lengths of one candidate triangle per row. Using the triangle inequality — each side must be strictly shorter than the sum of the other two — label every row 'Yes' if its sides can form a triangle and 'No' otherwise, echoing the sides themselves.",
    examples: [
      {
        input: "Triangle: (13,15,30),(10,20,15),(5,5,10),(3,4,5)",
        output: "13 15 30 No · 10 20 15 Yes · 5 5 10 No · 3 4 5 Yes",
        explanation: "13+15=28 fails to beat 30 → No. 5+5=10 exactly EQUALS the third side — degenerate, still 'No' because the inequality is strict. 10+15>20 and 3+4>5 hold.",
      },
    ],
    constraints: [
      "side lengths are positive integers",
      "one judgement per row: the literal strings 'Yes' or 'No', in a column aliased triangle",
      "x, y, z are echoed in their original column order",
    ],
    breakdown: [
      "The triangle inequality has three clauses — x+y>z, x+z>y, y+z>x — because any of the three sides could be the oversized one. AND them together: a single failed comparison condemns the row. Row (13,15,30) shows why one or two checks aren't enough: 13+30>15 and 15+30>13 both hold, and only the third comparison catches the impostor.",
      "Sorting the sides (a <= b <= c) reduces the test to a+b>c, but SQL has no cheap 'sort three columns' — you'd hand-roll LEAST/GREATEST gymnastics that are harder to read than three explicit comparisons. Write all three and let the boolean do the work; the engine evaluates them in nanoseconds.",
      "Strictly greater is the whole trap: (5,5,10) satisfies 5+5 >= 10 yet forms a flat line, not a triangle. Reaching for >= passes most tests and fails exactly the boundary rows — the classic off-by-an-equals-sign. And note CASE here is an expression computed per row, not a flow-control statement: no grouping, one output row per input row.",
    ],
    edges: [
      "Degenerate case x+y = z is 'No' — the inequality is strict, >= is the bug.",
      "All THREE pair sums are required; checking one or two lets invalid rows through.",
      "Output the exact strings 'Yes'/'No' — 'yes', 1/0 or TRUE all miss the spec.",
      "No aggregation: CASE is an expression, so the row count in equals the row count out.",
    ],
    ladder: [
      { title: "Brute force — try every ordering", body: "Sort the three sides in application code, then check shortest+middle > longest. Works, but you ship every row to the app and hand-roll logic SQL expresses in one expression." },
      { title: "The pattern — boolean logic inside CASE", body: "CASE WHEN <predicate> THEN ... ELSE ... END is SQL's per-row classifier. The predicate here is three ANDed pair-sum comparisons covering every ordering at once." },
      { title: "The optimal idea — one expression, no setup", body: "CASE WHEN x+y>z AND x+z>y AND y+z>x THEN 'Yes' ELSE 'No' END. O(n) row-by-row, no sorting, no subqueries — nothing left to tune." },
    ],
    approach: "CASE over the three pair-sum inequalities",
    schema: {
      ddl: `CREATE TABLE Triangle (
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  z INTEGER NOT NULL
);`,
      seed: `INSERT INTO Triangle (x, y, z) VALUES
  (13,15,30),
  (10,20,15),
  (5,5,10),   -- trap: degenerate — 5+5 = 10 exactly, so 'No' (>= would be wrong)
  (3,4,5),    -- the classic right triangle: 'Yes'
  (1,1,1);    -- equilateral: 'Yes'`,
      tables: [
        { name: "Triangle", note: "5 candidate rows; (5,5,10) is the boundary test between > and >=" },
      ],
    },
    code: `SELECT
    x, y, z,
    CASE
        WHEN x + y > z   -- every side must beat the sum of the other two
         AND x + z > y
         AND y + z > x
        THEN 'Yes'
        ELSE 'No'
    END AS triangle
FROM Triangle;`,
    walkthrough: [
      "Row (13,15,30): 13+15=28 > 30 is false — the AND chain short-circuits to 'No' even though the other two comparisons hold. One failed inequality is enough, which is why all three must be present in the first place.",
      "Row (5,5,10) is the engineered boundary: 5+5=10, and 10 > 10 is false. A solution written with >= marks it 'Yes' and fails the exact test this seed plants.",
      "Rows (10,20,15), (3,4,5) and (1,1,1) pass all three comparisons — scalene, right-angled and equilateral — and come back 'Yes'. Note the checks are order-agnostic: 10,20,15 has the oversized side in the middle and is still caught.",
      "The SELECT list is per-row: x, y, z pass through untouched, and the CASE expression produces the fourth column, aliased triangle. Five rows in, five rows out.",
    ],
    time: "O(n) — three comparisons per row",
    space: "O(1) auxiliary — the output itself is O(n)",
    followUps: [
      "Classify valid triangles as equilateral / isosceles / scalene — chained WHEN branches, and the order of the branches becomes part of the logic.",
      "Filter instead of label: keep only valid triangles in a WHERE — same predicate, but decide whether degenerate rows are dropped or reported.",
    ],
    related: ["capital-gain-loss", "queries-quality-and-percentage", "primary-department-for-each-employee"],
    order: "any",
    xp: 10,
  },
  {
    slug: "capital-gain-loss",
    statement:
      "Stocks is a trade log: each row names a stock, says whether the trade was a 'Buy' or a 'Sell', and records the price of that trade. For every stock, compute the capital gain or loss — total received on sells minus total paid on buys — and report it as capital_gain_loss, negative when the position lost money.",
    examples: [
      {
        input: "Stocks for Corona: Buy 10 · Sell 1010 · Buy 1000 · Sell 500 · Buy 1000 · Sell 10000",
        output: "Corona · 9500",
        explanation: "Sells total 1010 + 500 + 10000 = 11510; buys total 10 + 1000 + 1000 = 2010; 11510 − 2010 = 9500 — sells sign plus, buys sign minus, all inside one SUM.",
      },
    ],
    constraints: [
      "operation is 'Buy' or 'Sell'; every 'Sell' of a stock has a preceding 'Buy'",
      "output: stock_name, capital_gain_loss (negative = loss)",
      "one row per stock that appears in the log",
    ],
    breakdown: [
      "Capital gain per stock is total sold minus total bought. Two natural translations: two SUMs (sells summed, buys summed) subtracted in an outer SELECT, or one SUM over a per-row signed value. The signed-CASE idiom — SUM(CASE WHEN operation = 'Sell' THEN price ELSE -price END) — folds both directions into a single pass and a single aggregate.",
      "The ELSE branch is the engine: buys arrive as −price, sells as +price, so the SUM nets the position directly. The failure modes are instructive: omit the ELSE and every buy becomes NULL, which SUM silently skips — you'd report gross sales as 'gain'. Write ELSE 0 and buys contribute nothing, same wrong answer. The minus sign in ELSE -price is the entire computation.",
      "GROUP BY stock_name is the whole skeleton, and it keeps even awkward stocks in the picture: a stock whose sells exactly cancel its buys forms a group and reports 0, and a buy-only stock (no sells yet) reports its cost as a negative number — the arithmetic is honest even when the position is still open.",
    ],
    edges: [
      "ELSE -price is load-bearing: missing ELSE or ELSE 0 both turn the query into gross-sells-instead-of-gain.",
      "A stock that nets to exactly 0 still appears, with 0 — groups exist for every stock_name present in the log.",
      "A buy-only stock shows its unrealized cost as a negative total; no special-casing.",
      "Alias the output column exactly capital_gain_loss.",
    ],
    ladder: [
      { title: "Brute force — two aggregates and a subtraction", body: "Aggregate sells per stock in one query, buys per stock in another, join them on stock_name and subtract. Three passes and a join — and the join itself needs outer-join care for buy-only stocks." },
      { title: "The pattern — conditional aggregation", body: "Put a CASE inside the aggregate so each row arrives at SUM already signed: +price for sells, −price for buys. One scan, one group key, no second query." },
      { title: "The optimal idea — SUM of a signed expression", body: "SELECT stock_name, SUM(CASE WHEN operation = 'Sell' THEN price ELSE -price END) ... GROUP BY stock_name. Single pass, O(n), the netting falls out of the arithmetic." },
    ],
    approach: "Signed-CASE aggregation — SUM of +price / −price",
    schema: {
      ddl: `CREATE TABLE Stocks (
  stock_name TEXT NOT NULL,
  operation  TEXT NOT NULL CHECK (operation IN ('Buy','Sell')),
  price      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Stocks (stock_name, operation, price) VALUES
  ('Leetcode','Buy',1000),
  ('Corona','Buy',10),
  ('Leetcode','Sell',9000),
  ('Handbag','Buy',30000),
  ('Corona','Sell',1010),
  ('Corona','Buy',1000),
  ('Corona','Sell',500),
  ('Corona','Buy',1000),
  ('Corona','Sell',10000),
  ('Handbag','Sell',7000),
  ('Zeroed','Buy',100),    -- trap: sells exactly cancel buys → 0, group still appears
  ('Zeroed','Sell',100),
  ('LongHaul','Buy',50);   -- trap: buy-only position → -50 (unrealized cost)`,
      tables: [
        { name: "Stocks", note: "3 official stocks (Corona +9500, Handbag −23000, Leetcode +8000) plus the Zeroed and LongHaul edge cases" },
      ],
    },
    code: `SELECT
    stock_name,
    SUM(
        CASE WHEN operation = 'Sell' THEN price   -- sells add
             ELSE -price                          -- buys subtract (ELSE is load-bearing)
        END
    ) AS capital_gain_loss
FROM Stocks
GROUP BY stock_name
ORDER BY stock_name;`,
    walkthrough: [
      "Corona's six trades sign up as −10, +1010, −1000, +500, −1000, +10000; the group's SUM nets them to 9500 (sells 11510 minus buys 2010). Handbag nets +7000 − 30000 = −23000 — the negative sign IS the loss, no extra column needed.",
      "Zeroed's two rows cancel to exactly 0. GROUP BY still forms the group and the row still ships — a HAVING SUM <> 0 filter would be a different (wrong) spec. LongHaul has no Sell rows at all; its single −50 is the honest cost of an open position.",
      "Delete the ELSE branch and re-run mentally: every Buy row becomes NULL, SUM skips NULLs, and Corona's net jumps to 11510 — gross sales. That's how a one-word omission rewrites the answer.",
      "ORDER BY stock_name stabilizes the five-row listing (Corona, Handbag, Leetcode, LongHaul, Zeroed); grading compares the rows as a set.",
    ],
    time: "O(n) — one scan, one aggregate per group",
    space: "O(m) — one row per distinct stock",
    followUps: [
      "Report only fully closed positions — add a HAVING that compares buy and sell counts per stock.",
      "Running realized gain per trade date within each stock — move the signed CASE inside a window SUM ordered by date.",
    ],
    related: ["queries-quality-and-percentage", "average-selling-price", "triangle-judgement"],
    order: "any",
    xp: 10,
  },
  {
    slug: "top-travellers",
    statement:
      "Users lists riders; Rides logs each trip a user took and how far it went. Report every user's name and their total travelled distance — riders who never took a trip count 0, not NULL — sorted by distance descending, ties broken by name ascending.",
    examples: [
      {
        input: "Users: (1,'Alice'),(4,'Donald'),(5,'Zack'),(6,'Ann') · Rides: (1,1,120),(2,5,250),(3,5,250),(4,6,500)",
        output: "Ann 500 · Zack 500 · Alice 120 · Donald 0",
        explanation: "Zack's two 250s sum to 500, tying Ann — name ASC breaks the tie. Donald never rode: LEFT JOIN hands him an all-NULL row, and COALESCE(SUM(...), 0) turns his NULL total into 0.",
      },
    ],
    constraints: [
      "every user appears exactly once in the output",
      "travelled_distance is 0 for users with no rides",
      "ordering: travelled_distance DESC, then name ASC",
    ],
    breakdown: [
      "'Every user' makes Users the mandatory left table and Rides optional — LEFT JOIN, then GROUP BY the user and SUM the distance. The join is one-to-many: Alice's single 120-km trip and Alex's two trips (222 + 899) both fan out before GROUP BY re-collapses them to one row per user.",
      "The trap is an aggregate over an all-NULL group. Donald's left-joined row carries r.distance = NULL, and SUM over a group with no non-NULL values returns NULL — not 0. COUNT(column) self-heals (NULLs are skipped, the count bottoms out at 0); SUM does not. COALESCE(SUM(r.distance), 0) — or IFNULL, its SQLite alias — converts the empty total into the 0 the spec demands.",
      "Group by u.id, u.name, not name alone: id is the identity and names can collide, while the name is just the display payload. The ORDER BY needs both keys — travelled_distance DESC for the ranking, u.name ASC as the tiebreak that makes the ordering deterministic when two riders cover the same ground.",
    ],
    edges: [
      "Zero-ride users must show 0, not NULL — the COALESCE is not decoration.",
      "SUM over an empty/all-NULL group is NULL; COUNT(column) would have been 0 — know which aggregates self-heal.",
      "Ties break by name ASC: 'Ann 500' sorts before 'Zack 500'.",
      "Group by id + name; grouping by name alone would merge two users who share a name.",
    ],
    ladder: [
      { title: "Brute force — aggregate then attach", body: "GROUP BY user_id over Rides first, then LEFT JOIN the totals back onto Users and patch the misses with COALESCE. Works, but splits one query into two conceptual steps and tempts an INNER JOIN that erases Donald." },
      { title: "The pattern — join, group, patch the NULL total", body: "Optional one-to-many: LEFT JOIN from Users, GROUP BY the user, SUM the many side — with the all-NULL-group caveat handled explicitly, because SUM is the aggregate that does not self-heal." },
      { title: "The optimal idea — LEFT JOIN + COALESCE(SUM, 0)", body: "LEFT JOIN Rides ON user_id, GROUP BY u.id, u.name, COALESCE(SUM(r.distance), 0), and the two-key ORDER BY. One join pass, one grouping pass." },
    ],
    approach: "LEFT JOIN + COALESCE(SUM(...), 0)",
    schema: {
      ddl: `CREATE TABLE Users (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE Rides (
  id       INTEGER PRIMARY KEY,
  user_id  INTEGER NOT NULL REFERENCES Users(id),
  distance INTEGER NOT NULL
);`,
      seed: `INSERT INTO Users (id, name) VALUES
  (1,'Alice'),(2,'Bob'),(3,'Alex'),(4,'Donald'),(7,'Lee'),(13,'Jonathan'),(19,'Elvis'),
  (5,'Zack'),(6,'Ann');
INSERT INTO Rides (id, user_id, distance) VALUES
  (1,1,120),(2,2,317),(3,3,222),(4,7,103),(5,13,312),(6,7,321),
  (7,13,120),(8,19,70),(9,7,124),(10,3,899),(11,19,190),
  (12,5,250),(13,5,250),(14,6,500);  -- traps: Zack ties Ann at 500, name ASC decides`,
      tables: [
        { name: "Users", note: "9 users; Donald has no rides at all and must still appear with 0" },
        { name: "Rides", note: "14 trips; Alex spans two rows (222 + 899 = 1121), Zack's two 250s tie Ann's single 500" },
      ],
    },
    code: `SELECT
    u.name,
    COALESCE(SUM(r.distance), 0) AS travelled_distance  -- all-NULL group → SUM is NULL → force 0
FROM Users u
LEFT JOIN Rides r ON r.user_id = u.id         -- users with no rides keep their row
GROUP BY u.id, u.name
ORDER BY travelled_distance DESC, u.name ASC;  -- both keys: distance, then the name tiebreak`,
    walkthrough: [
      "The LEFT JOIN fans Users out against Rides: Alex matches two rows, Lee three, Zack two — and Donald matches nothing, so his row survives with NULLs filling in for distance.",
      "GROUP BY u.id, u.name re-tightens to one row per user while SUM(r.distance) totals each group: Alex 1121, Lee 548, Ann 500, Zack 500, Jonathan 432, Bob 317, Elvis 260, Alice 120 — and Donald's group holds a single NULL distance.",
      "SUM over Donald's all-NULL group yields NULL; COALESCE swaps in 0. Drop the COALESCE and the output still looks fine on the rich riders — until the zero-ride user arrives with a NULL the grader rejects.",
      "The two-key ORDER BY produces Alex 1121, Lee 548, Ann 500, Zack 500, Jonathan 432, Bob 317, Elvis 260, Alice 120, Donald 0 — note Ann before Zack at the 500 tie, and both ORDER BY keys kept exactly as the spec words them.",
    ],
    time: "O(n + m) — one join pass, one grouping pass",
    space: "O(n) — one row per user",
    followUps: [
      "Report ride counts alongside distance: COUNT(r.id) per user — notice it already returns 0 for Donald without COALESCE.",
      "Keep only the top 3 travellers with LIMIT — then engineer a tie at the boundary and ask which user deserves to be cut.",
    ],
    related: ["customers-who-never-order", "sales-person", "the-number-of-employees-which-report-to-each-employee"],
    order: "any",
    xp: 10,
  },
  {
    slug: "market-analysis-i",
    statement:
      "Users carries each user's signup date (plus a favorite brand this query won't need); Orders logs purchases with a buyer_id and an order_date. Report the user_id and join_date of users who joined during 2018 and had made no purchase before 2019 as a buyer — users who never ordered at all, and users whose first order came later, both qualify.",
    examples: [
      {
        input: "Users: (1,'2018-01-23'),(2,'2018-02-09'),(3,'2019-01-01'),(4,'2018-10-30') · Orders (order_date, buyer_id): ('2018-03-01',2),('2019-06-12',4)",
        output: "1 · 2018-01-23 · / 4 · 2018-10-30",
        explanation: "User 2 joined in 2018 but bought before 2019 → out. User 4's orders are all 2019 → in. User 3 joined too late; user 1 never ordered → in.",
      },
    ],
    constraints: [
      "join_date and order_date are ISO-8601 dates (TEXT in SQLite, so string comparison is calendar-correct)",
      "only buyer_id matters here — selling never disqualifies a user",
      "output: user_id, join_date",
    ],
    breakdown: [
      "Two conditions, two different homes. The user-side condition — joined in 2018 — filters the LEFT table, so it belongs in WHERE. The order-side condition — ordered before 2019 — filters the RIGHT table of an outer join, so it belongs in the ON clause. Park the order date in WHERE and the bug is silent: rows synthesized for order-free users carry NULL order dates, fail the predicate, and the LEFT JOIN degrades into an INNER JOIN — every user you most wanted to keep vanishes.",
      "With the date filter in ON, the LEFT JOIN attaches matching pre-2019 orders where they exist and a single all-NULL row where they don't. WHERE o.order_id IS NULL then keeps only the all-NULL rows — users with no qualifying order. That's the anti-join: an outer join read backwards through its NULLs, the declarative way to say 'and there is no such row'.",
      "Note what the ON-clause date does NOT do: it doesn't erase a user's later orders from the table — it just refuses them as evidence of pre-2019 buying. A 2018 joiner whose entire purchase history is 2019-or-later still has no qualifying order and stays in. And because ISO-8601 dates sort as strings, o.order_date < '2019-01-01' does real calendar work with plain text comparison.",
    ],
    edges: [
      "The Orders date filter must live in ON, never WHERE — in WHERE it kills the NULL rows and the whole answer with them.",
      "A 2018 joiner with 2019-only purchases is included: 'no order before 2019' says nothing about later orders.",
      "Test the anti-join on a NOT NULL right-side column (o.order_id IS NULL); testing o.order_date IS NULL works here but is a habit that breaks on nullable columns.",
      "2018 boundaries: join_date >= '2018-01-01' AND join_date < '2019-01-01' — SQLite has no YEAR() function; string range or strftime('%Y', ...) both work.",
    ],
    ladder: [
      { title: "Brute force — NOT IN over the early buyers", body: "SELECT from 2018 joiners WHERE user_id NOT IN (SELECT buyer_id FROM Orders WHERE order_date < '2019-01-01'). Correct on clean data, but NOT IN has a NULL three-valued-logic collapse if buyer_id can ever be NULL, and the two date windows sit far apart." },
      { title: "The pattern — anti-join via LEFT JOIN ... IS NULL", body: "LEFT JOIN the right table WITH its filter inside the ON clause, then keep rows whose right side is NULL. The ON-vs-WHERE placement is the entire trick: WHERE would destroy the synthesized NULL rows the pattern lives on." },
      { title: "The optimal idea — outer join backwards", body: "LEFT JOIN Orders ON buyer AND order_date < '2019-01-01', WHERE the 2018 join window holds AND o.order_id IS NULL. O(n + m), one pass over each table." },
    ],
    approach: "Anti-join — LEFT JOIN with the right-side filter in ON",
    schema: {
      ddl: `CREATE TABLE Users (
  user_id        INTEGER PRIMARY KEY,
  join_date      TEXT NOT NULL,
  favorite_brand TEXT NOT NULL
);
CREATE TABLE Orders (
  order_id   INTEGER PRIMARY KEY,
  order_date TEXT NOT NULL,
  item_id    INTEGER NOT NULL,
  buyer_id   INTEGER NOT NULL REFERENCES Users(user_id),
  seller_id  INTEGER NOT NULL REFERENCES Users(user_id),
  item_price INTEGER NOT NULL
);`,
      seed: `INSERT INTO Users (user_id, join_date, favorite_brand) VALUES
  (1,'2018-01-23','Lenovo'),   -- 2018 joiner, never ordered → in
  (2,'2018-02-09','Samsung'),  -- trap: 2018 joiner WITH a 2018 order → out
  (3,'2019-01-01','LG'),       -- joined too late → out
  (4,'2018-10-30','Huawei'),   -- orders only in 2019 → in
  (5,'2018-11-05','Asus'),     -- 2018 joiner, no orders → in
  (6,'2017-12-31','Xiaomi');   -- trap: bought in 2018 but joined in 2017 → out
INSERT INTO Orders (order_id, order_date, item_id, buyer_id, seller_id, item_price) VALUES
  (1,'2018-03-01',4,2,3,600),   -- user 2's pre-2019 order (excludes them)
  (2,'2019-06-12',3,4,5,1000),  -- user 4: a 2019 order does NOT exclude
  (3,'2019-08-01',2,4,1,500),
  (4,'2018-07-15',1,6,2,1200),  -- user 6's 2018 order — moot, they joined too early
  (5,'2019-09-09',4,1,2,700);   -- trap: user 1's 2019 order doesn't exclude them either`,
      tables: [
        { name: "Users", note: "6 users — every exclusion reason represented: late joiner, early joiner, and early buyer" },
        { name: "Orders", note: "5 orders; the two 2018 orders disqualify users 2 and (mootly) 6, the 2019 ones disqualify nobody" },
      ],
    },
    code: `SELECT
    u.user_id,
    u.join_date
FROM Users u
LEFT JOIN Orders o
       ON o.buyer_id = u.user_id
      AND o.order_date < '2019-01-01'  -- right-side filter lives in ON, never WHERE
WHERE u.join_date >= '2018-01-01'
  AND u.join_date <  '2019-01-01'      -- joined in 2018 (left-side filter → WHERE)
  AND o.order_id IS NULL               -- anti-join: no pre-2019 order attached
ORDER BY u.user_id;`,
    walkthrough: [
      "Walk the join per user. User 2 matches order 1 (2018-03-01 < 2019) inside the ON clause, so real rows attach — the IS NULL test rejects them. Users 1, 4 and 5 match nothing qualifying: their join rows are synthesized all-NULL, which is exactly what IS NULL selects.",
      "The WHERE clause handles the left side: users 3 (joined 2019-01-01, fails the < '2019-01-01' bound) and 6 (joined 2017) are cut before the NULL logic even matters. User 6 is the sneaky one — they DID order in 2018, but the join-date window already excludes them.",
      "Now the classic bug, demonstrated by user 1: move o.order_date < '2019-01-01' from ON into WHERE and user 1's synthesized row (order_date NULL) fails the predicate — the anti-join quietly becomes an inner join and user 1, the never-ordered user the problem exists for, disappears.",
      "Survivors: user 1 (no orders at all), user 4 (bought only in 2019), user 5 (no orders). Output 1, 4, 5 with their join dates, ordered by user_id; grading compares the three rows as a set.",
    ],
    time: "O(n + m) — one pass over Users, one over Orders",
    space: "O(n) — the joined pairs, then the surviving rows",
    followUps: [
      "The live LeetCode variant counts each 2018 joiner's 2019 orders as a buyer, including zero — keep the date filter in ON and swap the IS NULL test for COUNT(o.order_id).",
      "Rewrite the anti-join with NOT EXISTS and a correlated subquery — compare readability, and note which version is immune to NULLs in buyer_id.",
    ],
    related: ["customers-who-never-order", "sales-person", "average-selling-price"],
    order: "any",
    xp: 20,
  },
];
