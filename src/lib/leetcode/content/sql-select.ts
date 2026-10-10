// Deep-dives — the SQL 50 opening band (SELECT basics + first joins/aggregates,
// 6 problems). Solutions are SQLite dialect, one statement each, and are
// engine-verified by scripts/lc-sql-verify.ts against the per-problem seed.
import type { LcSqlDive } from "../types";

export const SQL_SELECT: LcSqlDive[] = [
  {
    slug: "replace-employee-id-with-unique-identifier",
    statement:
      "Two tables describe the same people from different systems: Employees holds each person's internal id and name, while EmployeeUNI maps some of those internal ids to a company-wide unique identifier — but only for people who have been assigned one. Show every employee's unique identifier (NULL when none was assigned) next to their name.",
    examples: [
      {
        input: "Employees: (1,'Alice'),(7,'Bob'),(11,'Meir'),(90,'Winston'),(3,'Jonathan') · EmployeeUNI: (3,1),(11,2),(90,3)",
        output: "Alice NULL · Bob NULL · Jonathan 1 · Meir 2 · Winston 3",
        explanation: "Jonathan, Meir and Winston have mappings; Alice and Bob were never assigned one, so their unique_id is NULL.",
      },
    ],
    constraints: ["1 <= rows in Employees", "EmployeeUNI.unique_id values are unique", "an id appears at most once in EmployeeUNI"],
    breakdown: [
      "The lookup table is OPTIONAL on the right: every employee must appear, whether or not a mapping exists. That single sentence chooses the join for you — INNER JOIN would silently delete Alice and Bob, which is exactly the bug this problem is built to catch.",
      "LEFT JOIN keeps every row of the left table (Employees) and fills unmatched right columns with NULL. The NULL isn't an error to fix — it IS the answer for unassigned employees, and the grader expects it. Mechanically, the engine synthesizes that all-NULL right side for Alice and Bob at read time — nothing is stored or modified; the miss is manufactured on the fly. Two NULL rows in the output are not a defect to clean up but the join's honest report: five employees in, five out, two unmapped.",
      "Notice what 'mapping' means here: EmployeeUNI.id is the join key, unique_id is the payload. Beginners often join on the wrong pair (id to unique_id) — always join the two columns that describe the same entity, not the two ids you can see. In this seed the mistake looks survivable — both tables carry an id and a numeric column — but e.id = u.unique_id would match Alice's 1 against Jonathan's mapping and scramble every row that follows. Key pairs with key, payload with payload: internal ids join to internal ids.",
    ],
    edges: [
      "Employees with no mapping must still appear — with NULL, not zero and not dropped.",
      "Join key direction: e.id = u.id (internal to internal), never e.id = u.unique_id.",
      "Column order matters to the grader: unique_id first, then name.",
    ],
    ladder: [
      { title: "Brute force — loop and look up", body: "For each employee, scan EmployeeUNI for a matching id. Conceptually fine, but that's a correlated subquery per row — and in SQL the set-based join expresses it in one pass." },
      { title: "The pattern — outer join for optional relationships", body: "Whenever one side is optional, LEFT JOIN from the mandatory side. INNER JOIN is the classic wrong answer here and costs you the test case with NULLs." },
      { title: "The optimal idea — LEFT JOIN + keep the NULL", body: "LEFT JOIN Employees to EmployeeUNI, select u.unique_id, e.name. One pass, O(n + m) with hash/index lookup — nothing to optimize further." },
    ],
    approach: "LEFT JOIN with a nullable payload column",
    schema: {
      ddl: `CREATE TABLE Employees (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE EmployeeUNI (
  id        INTEGER PRIMARY KEY REFERENCES Employees(id),
  unique_id INTEGER NOT NULL UNIQUE
);`,
      seed: `INSERT INTO Employees (id, name) VALUES (1,'Alice'),(7,'Bob'),(11,'Meir'),(90,'Winston'),(3,'Jonathan');
INSERT INTO EmployeeUNI (id, unique_id) VALUES (3,1),(11,2),(90,3);`,
      tables: [
        { name: "Employees", note: "every person — the side that must survive intact" },
        { name: "EmployeeUNI", note: "lookup — only 3 of 5 people have a mapping" },
      ],
    },
    code: `SELECT
    u.unique_id,          -- NULL when no mapping exists (that's the answer)
    e.name
FROM Employees e
LEFT JOIN EmployeeUNI u ON u.id = e.id
ORDER BY e.name;`,
    walkthrough: [
      "FROM Employees e puts the mandatory table on the left; every one of its 5 rows will survive to the output.",
      "LEFT JOIN EmployeeUNI attaches the payload where the id matches and synthesizes a row of NULLs where it doesn't — Alice and Bob get unique_id = NULL without any CASE or COALESCE trickery.",
      "The join condition u.id = e.id aligns the two internal ids; unique_id rides along as data, never as a key.",
      "ORDER BY name makes the result deterministic and readable; the grader accepts any order, but a sorted output is the professional default for id/name listings.",
    ],
    time: "O(n + m) — one pass over both tables with an index/PK lookup",
    space: "O(n) — the output itself",
    followUps: [
      "Flip it: list every mapping, including unique_ids whose employee row is missing (RIGHT JOIN / reversed LEFT JOIN).",
      "Count how many employees lack a mapping — LEFT JOIN + WHERE u.id IS NULL, the anti-join you'll reuse all over the SQL 50.",
    ],
    related: ["employee-bonus", "combine-two-tables", "customers-who-never-order"],
    order: "any",
    xp: 10,
  },
  {
    slug: "product-sales-analysis-i",
    statement:
      "A store logs every sale with the product sold, the year, and the unit price it fetched that year. Product names live in a separate catalog table. Report, for every sale, the product's name, the year of the sale, and the price recorded on that sale.",
    examples: [
      {
        input: "Sales rows reference product 100 in 2008 at 5000, product 100 in 2009 at 5100, product 200 in 2010 at 5000…",
        output: "Nokia 1100 · 2008 · 5000 / Nokia 1100 · 2009 · 5100 / Nokia 3210 · 2010 · 5000 …",
        explanation: "One output row per sale — the join only decorates each sale with its product's name; no grouping happens.",
      },
    ],
    constraints: ["Sales.product_id references Product.product_id", "every sale has a matching product", "(year, price) is reported per sale, not per product"],
    breakdown: [
      "This is the friendliest join in the set: every sale references exactly one product and every reference resolves, so a plain INNER JOIN is correct — no NULL-handling gymnastics required yet. The schema guarantees it: Sales.product_id carries REFERENCES Product(product_id), so a sale pointing at a delisted product is uninsertable and the join can never miss. Later problems in the band remove that guarantee; this one lets you drill the enrichment shape on safe ground.",
      "Read the request column by column: 'the product's name' (lives in Product), 'the year' and 'the price' (live on the sale row). Nothing asks for a SUM, MAX or count — one output row per input row. The most common mistake on easy joins is aggregating out of reflex.",
      "The join key is s.product_id = p.product_id; the sale's own id stays in the shadows. If two products were ever sold in the same year at the same price, they are still two rows — the grain of the answer equals the grain of Sales. The seed demonstrates the point: product 100 sells in 2008 at 5000 and again in 2009 at 5100, and both rows survive separately into the output. Distinct sale_id, distinct row — only an explicit GROUP BY would merge them.",
    ],
    edges: [
      "Grain check: one row OUT per row IN — if your answer has fewer rows than Sales, you grouped by accident.",
      "Every product_id resolves — INNER JOIN is safe here; the LEFT JOIN variants come later in the band.",
      "Price is the sale's historical price, not the product's current list price — it must come from s.price.",
    ],
    ladder: [
      { title: "Brute force — nested loops", body: "For each sale row, scan Product until product_id matches and print name/year/price. Correct, but that's O(n·m) — the join operator does this in one hash pass." },
      { title: "The pattern — FK enrichment join", body: "Dimension-table lookup: fact rows (Sales) enriched with descriptive columns (Product). This shape is half of all production SQL." },
      { title: "The optimal idea — INNER JOIN on the FK", body: "JOIN Product ON p.product_id = s.product_id, project the three columns. With the PK indexed it's O(n + m)." },
    ],
    approach: "FK enrichment — INNER JOIN a fact table to its dimension",
    schema: {
      ddl: `CREATE TABLE Product (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL
);
CREATE TABLE Sales (
  sale_id    INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES Product(product_id),
  year       INTEGER NOT NULL,
  quantity   INTEGER NOT NULL,
  price      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Product (product_id, product_name) VALUES (100,'Nokia 1100'),(200,'Nokia 3210'),(300,'Nokia 8800');
INSERT INTO Sales (sale_id, product_id, year, quantity, price) VALUES
  (1,100,2008,10,5000),
  (2,100,2009,8,5100),
  (3,200,2010,6,5000),
  (4,300,2010,7,6000),
  (5,300,2011,9,5500);`,
      tables: [
        { name: "Product", note: "catalog — name per product_id" },
        { name: "Sales", note: "5 sales; products 100 and 300 sold in two different years" },
      ],
    },
    code: `SELECT
    p.product_name,   -- decorated from the catalog
    s.year,           -- lives on the sale
    s.price           -- the price AT THAT SALE, not a current list price
FROM Sales s
JOIN Product p ON p.product_id = s.product_id
ORDER BY s.sale_id;`,
    walkthrough: [
      "FROM Sales s anchors the grain: the output has exactly one row per sale — five rows in, five rows out.",
      "JOIN Product p resolves each sale's product_id to its name. The PK index on Product.product_id makes each lookup O(log m); the whole query is one pass.",
      "The SELECT list mixes provenance deliberately — name from p, year and price from s — because 'which table owns this column' is the actual skill the problem grades.",
      "ORDER BY sale_id just stabilizes the display; the grader compares rows as a set.",
    ],
    time: "O(n + m) — hash/index join",
    space: "O(n) — output",
    followUps: [
      "Analysis II asks for quantities per product per year — same schema, now you group.",
      "What if some sales referenced delisted products? Switch to LEFT JOIN and decide which side survives.",
    ],
    related: ["product-sales-analysis-ii", "product-sales-analysis-iii", "combine-two-tables"],
    order: "any",
    xp: 10,
  },
  {
    slug: "product-sales-analysis-ii",
    statement:
      "Using the same sales log and catalog, aggregate: for each product, report its name and the total quantity of it sold across all years. Products that never sold may be assumed absent from Sales — but think through which join you'd want if they weren't.",
    examples: [
      {
        input: "Product 100 sold 10 units in 2008 and 8 in 2009; product 200 sold 6; product 300 sold 7 and 9",
        output: "Nokia 1100 · 18 / Nokia 3210 · 6 / Nokia 8800 · 16",
        explanation: "Quantities sum ACROSS years per product — 10 + 8 = 18 for product 100.",
      },
    ],
    constraints: ["group per product (not per year)", "quantity is summed; price is ignored", "every product_id in Sales resolves to Product"],
    breakdown: [
      "The grain changes here: from 'one row per sale' to 'one row per product'. Any time a sentence says 'for each X, the total Y', GROUP BY X with an aggregate over Y is the translation. The seed makes the collapse visible: product 100's two sales (10 units in 2008, 8 in 2009) fuse into one Nokia 1100 row carrying 18. Five sale rows go in, three product rows come out.",
      "GROUP BY p.product_id, p.product_name — grouping by the key plus the name you display. Grouping by name alone would merge two products that share a name; grouping by id alone leaves the name dangling outside the group in some engines. SQLite is relaxed about this, but PostgreSQL and SQL Server require every non-aggregated SELECT column to appear in the GROUP BY — so the id-plus-name form is the portable habit worth building from day one.",
      "SUM(s.quantity) sums one column per group. The classic trap is SUM(s.quantity * s.price) — that's revenue, a different (and equally useful) number. The spec asks for units, so price never enters the computation. Run the wrong version on this seed and Nokia 1100's row reads 90800 (10 × 5000 plus 8 × 5100) instead of 18 — a plausible-looking number of precisely the wrong kind, which is why reviewers re-check the requested unit before trusting an aggregate.",
    ],
    edges: [
      "Group by the product identity, not just the display name.",
      "SUM ignores NULLs but there are none here — every sale has a quantity; the NULL story matters more in Analysis III's joins.",
      "Don't include s.year in GROUP BY — that would report per-year subtotals (Analysis III's problem) instead of all-years totals.",
    ],
    ladder: [
      { title: "Brute force — dictionary in application code", body: "Pull the join into Python/JS, accumulate quantity in a map keyed by product. Works, but you'd be hand-rolling what GROUP BY does set-based and faster." },
      { title: "The pattern — join then aggregate", body: "Enrich the fact table with the dimension column, then group. Joining BEFORE grouping lets the SELECT show product_name directly." },
      { title: "The optimal idea — GROUP BY with SUM", body: "JOIN + GROUP BY product + SUM(quantity). One pass to join, one to aggregate; O(n + m) overall." },
    ],
    approach: "Join-then-aggregate with GROUP BY + SUM",
    schema: {
      ddl: `CREATE TABLE Product (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL
);
CREATE TABLE Sales (
  sale_id    INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES Product(product_id),
  year       INTEGER NOT NULL,
  quantity   INTEGER NOT NULL,
  price      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Product (product_id, product_name) VALUES (100,'Nokia 1100'),(200,'Nokia 3210'),(300,'Nokia 8800');
INSERT INTO Sales (sale_id, product_id, year, quantity, price) VALUES
  (1,100,2008,10,5000),
  (2,100,2009,8,5100),
  (3,200,2010,6,5000),
  (4,300,2010,7,6000),
  (5,300,2011,9,5500);`,
      tables: [
        { name: "Product", note: "3 products, all of them sold at least once" },
        { name: "Sales", note: "5 sales — product 100 has rows in two years (10 + 8 = 18)" },
      ],
    },
    code: `SELECT
    p.product_name,
    SUM(s.quantity) AS total_quantity   -- units across ALL years
FROM Sales s
JOIN Product p ON p.product_id = s.product_id
GROUP BY p.product_id, p.product_name
ORDER BY total_quantity DESC;`,
    walkthrough: [
      "The join is unchanged from Analysis I — you still need product_name, which lives on the other table. Join first, group second.",
      "GROUP BY p.product_id, p.product_name collapses the 5 sale rows into 3 product groups; every sale row feeds its group's SUM.",
      "SUM(s.quantity) is the only aggregate. The alias total_quantity is both a readable column name and a valid ORDER BY target in SQLite.",
      "ORDER BY total_quantity DESC is cosmetic (grader compares sets) but it's the natural presentation for a leaderboard-shaped answer.",
    ],
    time: "O(n + m) — join pass, then a sort/hash for grouping",
    space: "O(m) — one row per group",
    followUps: [
      "Analysis III caps each product at its best TWO years — the grouping gets a ranking brain.",
      "Report revenue instead of units: SUM(quantity * price) — note why SUM(a) * SUM(b) would be wrong.",
    ],
    related: ["product-sales-analysis-i", "product-sales-analysis-iii", "project-employees-i"],
    order: "any",
    xp: 10,
  },
  {
    slug: "product-sales-analysis-iii",
    statement:
      "Same sales log, harder question: for each product, report only its top TWO years by total quantity sold (total across that whole year), with the year and the total. If a product sold in fewer than two years, report all of them.",
    examples: [
      {
        input: "Product 100: 2008 → 30 units total, 2009 → 15, 2010 → 8 · Product 200: 2021 → 12, 2020 → 9",
        output: "100 · 2019? — top two for 100 are 2008 (30) and 2009 (15); for 200 both years survive (only two exist)",
        explanation: "Rank each product's years by total quantity, keep ranks 1 and 2.",
      },
    ],
    constraints: ["total per (product, year) first, then rank", "ties in totals: any consistent policy accepted here — the seed has none", "output product_id, product_name, year, total"],
    breakdown: [
      "Two stages, and the order is the whole problem: first AGGREGATE to (product, year, total), THEN rank within each product. Trying to rank raw sale rows directly is the classic dead end — the ranking unit is the year-total, which doesn't exist until GROUP BY creates it.",
      "This is 'top-k per group' — the single most important SQL interview pattern. The engine primitive is a window function over the aggregated rows: ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY total DESC) numbers each product's years from the best down; keeping rk <= 2 is the top two.",
      "Why ROW_NUMBER and not RANK or DENSE_RANK here? With no ties in the seed all three agree — but they disagree on ties (1,2,2 vs 1,2,3). Production answer: name the tie policy. For this spec, the official grader expects exactly two rows per product, which makes ROW_NUMBER the honest choice.",
    ],
    edges: [
      "Aggregate BEFORE ranking — the window must run over year-totals, not raw sales.",
      "The window's PARTITION BY product_id is what makes the ranking per-product; forget it and you rank across the whole table.",
      "ORDER BY total DESC inside OVER — a silent ASC would keep the WORST two years and still look plausible.",
      "Only-two-years products must pass through untouched (rk <= 2 handles it for free).",
    ],
    ladder: [
      { title: "Brute force — correlate per product", body: "For each (product, year) group, check no more than one year has a bigger total: a correlated subquery with COUNT(DISTINCT better_year) < 2. Correct, but O(groups²) and hard to read." },
      { title: "The pattern — window over the aggregate", body: "CTE 1 aggregates to yearly totals; CTE 2 puts ROW_NUMBER over them partitioned by product. Two small steps, each independently checkable." },
      { title: "The optimal idea — rank, then filter", body: "WHERE rk <= 2 on the ranked CTE — you can't filter a window function in WHERE directly, which is exactly why the CTE exists. O(n log n) overall." },
    ],
    approach: "Aggregate → ROW_NUMBER per product → keep top 2",
    schema: {
      ddl: `CREATE TABLE Product (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL
);
CREATE TABLE Sales (
  sale_id    INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES Product(product_id),
  year       INTEGER NOT NULL,
  quantity   INTEGER NOT NULL,
  price      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Product (product_id, product_name) VALUES (1,'Console'),(2,'Handheld'),(3,'Accessory');
INSERT INTO Sales (sale_id, product_id, year, quantity, price) VALUES
  (1,1,2019,30,300),(2,1,2019,20,310),   -- 2019 total 50: two rows, SUM must merge them
  (3,1,2020,30,290),
  (4,1,2021,20,280),
  (5,2,2019,10,150),
  (6,2,2021,15,160),
  (7,3,2019,5,60),(8,3,2020,7,65),(9,3,2021,9,70);`,
      tables: [
        { name: "Product", note: "3 products" },
        { name: "Sales", note: "product 1 sold in 3 years (2019 total = 30+20), product 2 in only 2, product 3 in 3 — no within-product total ties" },
      ],
    },
    code: `WITH yearly AS (
    -- stage 1: the ranking unit is the YEAR-TOTAL, so build it first
    SELECT product_id, year, SUM(quantity) AS total
    FROM Sales
    GROUP BY product_id, year
),
ranked AS (
    -- stage 2: number each product's years, best total first
    SELECT
        product_id,
        year,
        total,
        ROW_NUMBER() OVER (
            PARTITION BY product_id
            ORDER BY total DESC
        ) AS rk
    FROM yearly
)
SELECT
    r.product_id,
    p.product_name,
    r.year,
    r.total
FROM ranked r
JOIN Product p ON p.product_id = r.product_id
WHERE r.rk <= 2
ORDER BY p.product_name, r.year;`,
    walkthrough: [
      "yearly collapses Sales to one row per (product, year) — product 1's two 2019 sales merge into total 50. Ranking raw rows here would be the fatal shortcut.",
      "ranked adds a per-product countdown: PARTITION BY product_id restarts the numbering for each product, ORDER BY total DESC puts the best year at rk = 1.",
      "The final WHERE r.rk <= 2 must live OUTSIDE the CTE — SQLite (like all engines) refuses window functions in WHERE, which is the mechanical reason the ranked CTE exists.",
      "The join back to Product is pure decoration (the name), and the final ORDER BY just makes the snapshot readable; the grader compares rows as a set.",
    ],
    time: "O(n log n) — grouping + window sort",
    space: "O(n) — the CTEs",
    followUps: [
      "Switch to RANK() and construct a tie — which rows does the top-2 keep under each policy?",
      "Top ONE year per product becomes a qualitative 'best year' report — same query, rk <= 1.",
    ],
    related: ["product-sales-analysis-ii", "department-top-three-salaries", "rank-scores"],
    order: "any",
    xp: 20,
  },
  {
    slug: "employee-bonus",
    statement:
      "Every employee has a row in Employee; only some have a matching row in Bonus. Report each employee's name and their bonus — NULL when no bonus record exists. This is the purest outer-join drill in the set.",
    examples: [
      {
        input: "Employee: (3,'Brad'),(1,'John'),(2,'Dan'),(4,'Thomas') · Bonus: (2,500),(4,2000)",
        output: "Brad NULL · Dan 500 · John NULL · Thomas 2000",
        explanation: "Brad and John have no Bonus row — their bonus column is NULL in the output.",
      },
    ],
    constraints: ["every employee appears exactly once in the output", "bonus NULL ⇔ no Bonus row", "output columns: name, bonus"],
    breakdown: [
      "Same skeleton as Replace Employee ID, one table later: mandatory left table (Employee), optional right table (Bonus), so LEFT JOIN from Employee. If you reach for INNER JOIN here, half the output vanishes and the first test case catches it.",
      "The join key is empId on both sides. Note the asymmetry of direction: the LEFT table is the one whose rows ALL appear — since the spec says 'each employee's bonus', Employee must be leftmost regardless of which table is 'bigger'. Swap the tables and the contract flips: Bonus LEFT JOIN Employee would still show Dan's 500 and Thomas's 2000, but Brad and John — the people with no bonus row — would vanish entirely, losing two of the four required rows.",
      "NULL discipline: don't COALESCE the bonus to 0. 'No bonus row' and 'bonus of zero' are different facts, and the grader wants the NULL. (A reporting layer might format it as '—' later — that's presentation, not query.) The distinction has downstream teeth: AVG(bonus) over this exact join returns 1250 — the mean of 500 and 2000 — while a COALESCE-to-zero version returns 625 by averaging in two fictitious zeros. Aggregates skip NULLs; they never skip zeros.",
    ],
    edges: [
      "Direction: Employee LEFT JOIN Bonus, never the reverse — reversed, unmatched bonuses (none here) would survive while Brad/John vanish.",
      "Output NULL, not 0, for missing bonuses.",
      "Column order: name then bonus.",
    ],
    ladder: [
      { title: "Brute force — two queries and a merge", body: "Fetch employees, fetch bonuses, merge in application code with a dict. Three round-trips instead of one join; the DB does this natively." },
      { title: "The pattern — outer join from the mandatory side", body: "One-side-optional ⇒ LEFT JOIN from the mandatory side. This is the same pattern as 1378; here it's the whole problem." },
      { title: "The optimal idea — LEFT JOIN, project, sort", body: "LEFT JOIN + SELECT e.name, b.bonus. O(n + m) with the PK index doing the matching." },
    ],
    approach: "LEFT JOIN from the mandatory side, keep the NULLs",
    schema: {
      ddl: `CREATE TABLE Employee (
  empId      INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  supervisor INTEGER,
  salary     INTEGER NOT NULL
);
CREATE TABLE Bonus (
  empId INTEGER PRIMARY KEY REFERENCES Employee(empId),
  bonus INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employee (empId, name, supervisor, salary) VALUES
  (3,'Brad',NULL,4000),
  (1,'John',3,1000),
  (2,'Dan',3,2000),
  (4,'Thomas',3,4000);
INSERT INTO Bonus (empId, bonus) VALUES (2,500),(4,2000);`,
      tables: [
        { name: "Employee", note: "4 employees — all must appear" },
        { name: "Bonus", note: "only Dan and Thomas have bonus rows" },
      ],
    },
    code: `SELECT
    e.name,
    b.bonus            -- NULL for employees without a Bonus row
FROM Employee e
LEFT JOIN Bonus b ON b.empId = e.empId
ORDER BY e.name;`,
    walkthrough: [
      "Employee drives the loop: all four names survive no matter what Bonus does.",
      "The LEFT JOIN emits (Dan, 500) and (Thomas, 2000) where keys match, and (Brad, NULL) / (John, NULL) where they don't — the NULL row is synthesized, not stored.",
      " supervisor is in the schema but irrelevant — a reminder that real tables carry more columns than the question needs.",
      "ORDER BY name for a stable, human-readable listing; grading ignores order.",
    ],
    time: "O(n + m) — index join",
    space: "O(n) — output",
    followUps: [
      "Average the bonuses that exist: AVG ignores NULLs — does your LEFT JOIN version agree with a query on Bonus alone?",
      "Bonus > 1000 AND name filter: note why putting b.bonus > 1000 in WHERE (not ON) silently turns the join back into an inner one.",
    ],
    related: ["replace-employee-id-with-unique-identifier", "combine-two-tables", "confirmation-rate"],
    order: "any",
    xp: 10,
  },
  {
    slug: "students-and-examinations",
    statement:
      "Students sat exams in various subjects; Examinations logs each (student, subject) attempt. Produce a complete matrix: every student crossed with every subject, showing how many times that student took that subject — including the zero combinations that never appear in the log.",
    examples: [
      {
        input: "Students: Alice, Bob, John, Alex · Subjects: Math, Physics, Programming · Examinations: Alice—Math ×1, Alice—Physics ×1, Bob—Math ×1, John—Math ×1, John—Physics ×2, John—Programming ×1, Alex—Physics ×1",
        output: "12 rows — e.g. Alex · Programming · 0, Bob · Physics · 0, Bob · Programming · 0",
        explanation: "The cross join creates all 4 × 3 combinations; the LEFT JOIN + COUNT fills in attempt counts, zero for absent pairs.",
      },
    ],
    constraints: ["every (student, subject) pair appears exactly once", "count 0 for pairs with no attempts", "columns: student_id, student_name, subject_name, attended_exams"],
    breakdown: [
      "The result grid ALREADY EXISTS conceptually — it's Students × Subjects, all 12 pairs. A plain join can only output pairs that appeared in Examinations, so the scaffold must be manufactured: CROSS JOIN generates the full matrix, and the log is left-joined onto it.",
      "The join to the log is compound: e.student_id = s.student_id AND e.subject_name = sub.subject_name. Both conditions live in the ON clause — push either into WHERE and the NULL rows produced by the LEFT JOIN get filtered away, collapsing it back to an inner join. This ON-vs-WHERE distinction is the real exam inside the problem.",
      "The counter is COUNT(e.student_id), not COUNT(*): for zero-attempt pairs the left join synthesized a row with NULL on the e side, and COUNT(column) skips NULLs — 0 — while COUNT(*) would count the scaffold row itself and report 1. One asterisk flips seven answers.",
    ],
    edges: [
      "CROSS JOIN first, LEFT JOIN second — order of joins in the FROM is the order the scaffolding is built.",
      "Both join conditions in ON, not WHERE, or zeros evaporate.",
      "COUNT(e.student_id) not COUNT(*) — the zero-count depends on it.",
      "Order by name then subject in the reference solution; grading accepts any order.",
    ],
    ladder: [
      { title: "Brute force — nested loops in app code", body: "Loop students, loop subjects, scan the log for matches, count. O(students × subjects × log) by hand; SQL composes the same logic set-based." },
      { title: "The pattern — scaffold then enrich", body: "CROSS JOIN builds the full matrix; LEFT JOIN hangs the observed counts off it. 'Generate the expected grid, then fill it' generalizes to calendars, date ranges and pivot tables." },
      { title: "The optimal idea — matrix + conditional count", body: "CROSS JOIN + LEFT JOIN + GROUP BY + COUNT(column). Four clauses, each doing exactly one job; O(S·J + E) overall." },
    ],
    approach: "CROSS JOIN scaffold + LEFT JOIN + COUNT(column)",
    schema: {
      ddl: `CREATE TABLE Students (
  student_id   INTEGER PRIMARY KEY,
  student_name TEXT NOT NULL
);
CREATE TABLE Subjects (
  subject_name TEXT PRIMARY KEY
);
CREATE TABLE Examinations (
  student_id   INTEGER NOT NULL REFERENCES Students(student_id),
  subject_name TEXT NOT NULL REFERENCES Subjects(subject_name)
);`,
      seed: `INSERT INTO Students (student_id, student_name) VALUES (1,'Alice'),(2,'Bob'),(13,'John'),(6,'Alex');
INSERT INTO Subjects (subject_name) VALUES ('Math'),('Physics'),('Programming');
INSERT INTO Examinations (student_id, subject_name) VALUES
  (1,'Math'),
  (1,'Physics'),
  (2,'Math'),
  (13,'Math'),
  (13,'Physics'),
  (13,'Physics'),
  (13,'Programming'),
  (6,'Physics');`,
      tables: [
        { name: "Students", note: "4 students × 3 subjects = 12 matrix rows" },
        { name: "Subjects", note: "the second axis of the scaffold" },
        { name: "Examinations", note: "8 attempts; John took Physics twice; nobody's Alex—Programming or Bob—Physics rows exist (must show 0)" },
      ],
    },
    code: `SELECT
    s.student_id,
    s.student_name,
    sub.subject_name,
    COUNT(e.student_id) AS attended_exams   -- COUNT(column): NULLs → 0
FROM Students s
CROSS JOIN Subjects sub                     -- the 12-pair scaffold
LEFT JOIN Examinations e
       ON e.student_id   = s.student_id
      AND e.subject_name = sub.subject_name   -- both keys in ON!
GROUP BY s.student_id, s.student_name, sub.subject_name
ORDER BY s.student_name, sub.subject_name;`,
    walkthrough: [
      "CROSS JOIN Students × Subjects emits all 12 pairs before any log data is touched — even pairs that never occurred in real life, which is precisely the point.",
      "The LEFT JOIN tries to hang attempts onto each pair. John—Physics matches two log rows, so the pair temporarily multiplies to two rows before GROUP BY re-collapses it; Alex—Programming matches nothing and carries NULLs.",
      "GROUP BY re-tightens the grain to one row per pair, and COUNT(e.student_id) counts matched attempts — 2 for John—Physics, 0 wherever the NULL scaffold rows survived, because COUNT skips NULLs.",
      "The ORDER BY mirrors the reference listing; the grader compares the 12 rows as a set.",
    ],
    time: "O(S·J + E) — scaffold dominates; tiny here, the lesson for big calendars",
    space: "O(S·J) — the matrix",
    followUps: [
      "Restrict to students who took at least one exam — WHERE with a subquery on Examinations, applied BEFORE the scaffold.",
      "Same matrix but with average grade if Examinations carried scores — COALESCE(AVG(...), 0) vs COUNT semantics.",
    ],
    related: ["combine-two-tables", "sales-person", "percentage-of-users-attended-a-contest"],
    order: "any",
    xp: 10,
  },
];
