// Deep-dives — the SQL 50+ expansion: pivots & hierarchies (3 problems).
// Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_MORE_PIVOTS: LcSqlDive[] = [
  {
    slug: "reformat-department-table",
    statement:
      "Department stores revenue one month per row: (id, revenue, month) where month is 'jan'…'dec'. Reformat it so each department is ONE row with twelve columns — jan_revenue through dec_revenue — and NULL for any month the department has no data.",
    examples: [
      {
        input: "(1,8000,'jan'),(2,9000,'jan'),(3,10000,'feb'),(1,7000,'feb'),(1,6000,'mar')",
        output: "id 1 → 8000,7000,6000,NULL,… · id 2 → 9000,NULL,… · id 3 → NULL,10000,NULL,…",
        explanation: "Three rows become three wide rows; missing months are NULL, never zero.",
      },
    ],
    constraints: ["month values are lowercase three-letter names", "one row per department", "absent months must be NULL, not 0"],
    breakdown: [
      "This is a pivot, and SQLite has no PIVOT keyword — the manual move is MAX(CASE WHEN month = 'x' THEN revenue END) repeated once per output column. Each CASE is a per-group value extractor: it keeps the revenue of matching rows and NULLs the rest, and MAX ignores the NULLs, leaving exactly the month's number.",
      "Why MAX and not SUM? Each (id, month) pair appears once, so the bucket holds one real value and eleven NULLs — MAX picks the real value, SUM would also work but implies addition that never happens. MAX expresses 'the value', which is what you mean.",
      "Absent months must be NULL: SUM(CASE … END) with no ELSE returns NULL when every row in the group misses, which is the required behavior. Writing ELSE 0 would be the exact wrong instinct here — zeros claim 'we earned nothing', NULLs claim 'no data', and finance reports care about the difference.",
    ],
    edges: [
      "No ELSE in the CASE — the NULL fallback IS the requirement.",
      "Twelve extractor columns; one typo in a month literal silently yields an all-NULL column.",
      "GROUP BY id only — the month lives inside the CASEs, not the key.",
    ],
    ladder: [
      { title: "Brute force — self-joins per month", body: "Join twelve aliases of the table on id, each filtered to one month. Works, explodes combinatorially, and is unreadable — the classic pre-CASE pivot." },
      { title: "The pattern — conditional extractor per column", body: "MAX(CASE WHEN month='jan' THEN revenue END) AS jan_revenue, ×12, GROUP BY id. One scan builds the whole wide row." },
      { title: "The optimal idea — NULL-preserving extraction", body: "O(n) regardless of column count. The same shape (with SUM for additive metrics) pivots any long table wide in any SQL dialect." },
    ],
    approach: "Twelve MAX(CASE) extractors + GROUP BY id",
    schema: {
      ddl: `CREATE TABLE Department (
  id      INTEGER NOT NULL,
  revenue INTEGER NOT NULL,
  month   TEXT NOT NULL
);`,
      seed: `INSERT INTO Department (id, revenue, month) VALUES
  (1,8000,'jan'),(2,9000,'jan'),(3,10000,'feb'),(1,7000,'feb'),(1,6000,'mar');`,
      tables: [{ name: "Department", note: "5 rows — dept 1 spans 3 months, dept 3 only feb" }],
    },
    code: `SELECT
    id,
    SUM(CASE WHEN month = 'jan' THEN revenue END) AS jan_revenue,
    SUM(CASE WHEN month = 'feb' THEN revenue END) AS feb_revenue,
    SUM(CASE WHEN month = 'mar' THEN revenue END) AS mar_revenue,
    SUM(CASE WHEN month = 'apr' THEN revenue END) AS apr_revenue,
    SUM(CASE WHEN month = 'may' THEN revenue END) AS may_revenue,
    SUM(CASE WHEN month = 'jun' THEN revenue END) AS jun_revenue,
    SUM(CASE WHEN month = 'jul' THEN revenue END) AS jul_revenue,
    SUM(CASE WHEN month = 'aug' THEN revenue END) AS aug_revenue,
    SUM(CASE WHEN month = 'sep' THEN revenue END) AS sep_revenue,
    SUM(CASE WHEN month = 'oct' THEN revenue END) AS oct_revenue,
    SUM(CASE WHEN month = 'nov' THEN revenue END) AS nov_revenue,
    SUM(CASE WHEN month = 'dec' THEN revenue END) AS dec_revenue
FROM Department
GROUP BY id
ORDER BY id;`,
    walkthrough: [
      "Each id forms one bucket holding its raw monthly rows: id 1 has jan/feb/mar, id 2 just jan, id 3 just feb.",
      "Inside bucket 1, the jan-CASE keeps 8000 (feb/mar rows → NULL) and SUM returns 8000; the apr-CASE sees only NULLs and returns NULL — exactly the 'no data' output required.",
      "Buckets 2 and 3 likewise fill their single real month and NULL the other eleven. Twelve extractors, one scan, ORDER BY id.",
    ],
    time: "O(n) — one scan over the long table",
    space: "O(d) — one wide row per department",
    followUps: [
      "Two departments earned in the SAME month twice (data error) — MAX hides it, SUM would add it. Which is the right guard?",
      "Dynamic months can't be pivoted without building SQL strings — why is wide output inherently schema-bound?",
    ],
    related: ["rearrange-products-table", "monthly-transactions-i"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "rearrange-products-table",
    statement:
      "Products stores each product's price at up to three stores as three optional columns: store1, store2, store3 (NULL where absent). Reshape it into one row per (product, store) pair that actually has a price, with the store as data.",
    examples: [
      {
        input: "(0, 95, 100, 105) · (1, 70, NULL, 80) · (2, NULL, 110, NULL)",
        output: "(0,store1,95),(0,store2,100),(0,store3,105),(1,store1,70),(1,store3,80),(2,store2,110)",
        explanation: "The NULL prices vanish — only real (product, store, price) facts survive the reshape.",
      },
    ],
    constraints: ["at most one of the three stores may be NULL per product — here at least one price exists", "output columns: product_id, store, price"],
    breakdown: [
      "This is the unpivot (long ↔ wide reshape in reverse). The relational answer is UNION ALL over three single-column projections: 'store1 prices' SELECTed with a literal 'store1' as data, then store2, then store3. The column NAME becomes a VALUE — that's the entire conceptual move.",
      "WHERE storeX IS NOT NULL on each branch is what kills the gaps: a NULL price is 'not sold here', and the output format wants only facts. (The spec guarantees at least one price per product, so no product disappears entirely — with weaker guarantees you'd check.)",
      "UNION ALL, not UNION: the three branches are disjoint by construction (different store literals), so dedup would be wasted work — and if two branches ever legitimately produced identical rows, silently merging them would corrupt the count. The seed pins the arithmetic: 3 products × 3 stores = 9 slots, 3 of them NULL, so the reshape must emit exactly 6 rows — a deduping UNION happens to agree here but has nothing to fall back on if slots ever held equal prices.",
    ],
    edges: [
      "The store label is a literal string in each branch — the pivot's inverse trick.",
      "Filter NULLs per branch; NULL prices must not become rows.",
      "UNION ALL for speed and honesty — branches are disjoint by design.",
    ],
    ladder: [
      { title: "Brute force — three queries glued in code", body: "Run three SELECTs, append results in the app. One round-trip (UNION ALL) replaces three, and the database optimizes across branches." },
      { title: "The pattern — per-column projection + literal label", body: "SELECT product_id, 'store1', store1 WHERE NOT NULL, UNION ALL ×3. Each branch is a 5-line sentence." },
      { title: "The optimal idea — long-format facts", body: "O(n) single pass per branch. Any future store4 is one more branch — the shape scales linearly with columns, which is also its ceiling: true dynamic pivots need JSON or metadata-driven SQL." },
    ],
    approach: "Three guarded projections UNION ALL, labels as literals",
    schema: {
      ddl: `CREATE TABLE Products (
  product_id INTEGER NOT NULL,
  store1     INTEGER,
  store2     INTEGER,
  store3     INTEGER
);`,
      seed: `INSERT INTO Products (product_id, store1, store2, store3) VALUES
  (0,95,100,105),(1,70,NULL,80),(2,NULL,110,NULL);`,
      tables: [{ name: "Products", note: "3 products; 6 real (product, store) facts" }],
    },
    code: `SELECT product_id, 'store1' AS store, store1 AS price
FROM Products WHERE store1 IS NOT NULL
UNION ALL
SELECT product_id, 'store2' AS store, store2 AS price
FROM Products WHERE store2 IS NOT NULL
UNION ALL
SELECT product_id, 'store3' AS store, store3 AS price
FROM Products WHERE store3 IS NOT NULL
ORDER BY product_id, store;`,
    walkthrough: [
      "Branch 1 emits store1 facts: (0,95) and (1,70) — product 2's NULL store1 is filtered.",
      "Branch 2 emits (0,100) and (2,110); branch 3 emits (0,105) and (1,80). Six rows total — the NULL slots never become rows.",
      "The literal 'store1'/'store2'/'store3' is the reshaped column name now living as data. UNION ALL glues the branches; ORDER BY product_id, store orders each product's stores alphabetically.",
    ],
    time: "O(n) — three linear scans",
    space: "O(f) — one row per non-null fact",
    followUps: [
      "Invert your own answer: pivot this long output back to wide with MAX(CASE) — round trip complete.",
      "Twenty stores: when do you stop adding branches and redesign the schema as (product_id, store, price) long format forever?",
    ],
    related: ["reformat-department-table", "npv-queries"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "all-people-report-to-the-given-manager",
    statement:
      "Employees holds (employee_id, employee_name, manager_id); employee 1 is the head, and their manager_id is NULL. Report every employee who reports to the head directly OR indirectly, along with how many levels down they sit (direct reports are distance 1).",
    examples: [
      {
        input: "Nadia(1) → Omar(2), Priya(3) · Omar → Quentin(4), Rania(5) · Quentin → Sami(6) · Priya → Tara(7) · (8 'Umar' reports to id 9, which doesn't exist)",
        output: "Omar 1 · Priya 1 · Quentin 2 · Rania 2 · Tara 2 · Sami 3",
        explanation: "Distance counts the hops to the head. Umar's dangling reference to a non-existent manager leaves him outside the tree.",
      },
    ],
    constraints: ["the tree is rooted at employee_id 1 with manager_id NULL", "manager references may dangle (a manager id with no row)", "output columns: employee_id, employee_name, distance, ordered by distance then id"],
    breakdown: [
      "Reporting chains are unbounded — org charts are trees, and SQL's plain joins can't walk 'any depth' without knowing it in advance. A recursive CTE is the tool: an anchor (the head's direct reports) UNIONed with a step (everyone whose manager is already in the set), executed until nothing new appears.",
      "The distance column is the recursion's depth gauge: the anchor seeds 1, and each step adds one to the distance of the row it extends from. Carry depth in the recursive set and every level labels itself — no post-hoc counting needed. The seed reads like a depth ruler: Omar and Priya get 1 from the anchor, Quentin and Rania inherit 1 + 1 = 2, and Sami rides Quentin's 2 up to 3 — three hops, three self-labeled levels, zero bookkeeping afterwards.",
      "Termination is structural: each step only extends rows with a manager matching an existing member, and manager chains point UP the tree, so the frontier shrinks to nothing. A dangling manager id (Umar → 9) simply never matches anyone in the set and drops out silently — the recursion needs no special case.",
    ],
    edges: [
      "UNION ALL inside the CTE is safe here (a tree has no cycles); with cyclic data you'd need UNION + cycle guards.",
      "Distance starts at 1 for DIRECT reports — the head itself is not in the output.",
      "Dangling manager ids drop out naturally; no explicit existence check required.",
    ],
    ladder: [
      { title: "Brute force — join once, twice, …", body: "Self-join for level 1, join again for level 2… you'd write one query per depth. Any 'to the bottom' requirement breaks immediately." },
      { title: "The pattern — recursive CTE: anchor + step", body: "Anchor selects the head's direct reports; the step joins Employees to the CTE on manager_id = emp_id. SQLite executes the step repeatedly on the growing set." },
      { title: "The optimal idea — frontier walk with depth", body: "Each employee is visited exactly once (tree edges), so O(n). Distance rides along as a carried column — the recursion counts itself." },
    ],
    approach: "Recursive CTE — anchor at direct reports, step down the tree",
    schema: {
      ddl: `CREATE TABLE Employees (
  employee_id   INTEGER PRIMARY KEY,
  employee_name TEXT NOT NULL,
  manager_id    INTEGER
);`,
      seed: `INSERT INTO Employees (employee_id, employee_name, manager_id) VALUES
  (1,'Nadia',NULL),(2,'Omar',1),(3,'Priya',1),(4,'Quentin',2),
  (5,'Rania',2),(6,'Sami',4),(7,'Tara',3),(8,'Umar',9);`,
      tables: [{ name: "Employees", note: "8 people; head = 1 (Nadia); id 9 doesn't exist" }],
    },
    code: `WITH RECURSIVE sub (emp_id, emp_name, dist) AS (
    SELECT employee_id, employee_name, 1
    FROM Employees
    WHERE manager_id = 1                      -- anchor: direct reports
    UNION ALL
    SELECT e.employee_id, e.employee_name, s.dist + 1
    FROM Employees e
    JOIN sub s ON e.manager_id = s.emp_id     -- step: reports of reports
)
SELECT
    emp_id   AS employee_id,
    emp_name AS employee_name,
    dist     AS distance
FROM sub
ORDER BY dist, emp_id;`,
    walkthrough: [
      "Anchor: Omar (2) and Priya (3) — the two rows whose manager is 1 — enter the set at distance 1.",
      "Step round 1: whoever reports to members of the set joins next — Quentin (→2), Rania (→2), Tara (→3) at distance 2.",
      "Step round 2: Sami reports to Quentin → distance 3. Round 3 finds nothing new; the frontier is empty and the recursion stops.",
      "Umar reports to 9, which never enters the set — his row never matches the join and he's excluded. Output ordered shallow-to-deep, then by id.",
    ],
    time: "O(n) — each employee enters the set exactly once",
    space: "O(n) — the recursive set + output",
    followUps: [
      "Add reports_count: how many people (direct + indirect) report TO each of the head's direct reports?",
      "Break the cycle: insert one employee whose manager chain loops back — what does UNION ALL do? How would UNION + a visited check save it?",
    ],
    related: ["game-play-analysis-v", "npv-queries"],
    order: "exact",
    xp: 20,
  },
];
