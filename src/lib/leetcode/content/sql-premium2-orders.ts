// Deep-dives — LeetCode Premium batch II: orders & stores (6 problems, 4 Medium / 2 Easy). Engine-verified by scripts/lc-sql-verify.ts.
// Re-authored from the canonical premium tasks: own tables, own names,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM2_ORDERS: LcSqlDive[] = [
  {
    slug: "calculate-salaries",
    statement:
      "Salaries holds one row per employee: company_id, employee_id, employee_name and their gross salary. Each company's tax rate is set by the company's MAXIMUM salary — the highest earner decides the rate for EVERYONE in that company: a company maximum below 30000 pays 0%, a maximum from 30000 up to (but excluding) 40000 pays 24%, and a maximum of 40000 or more pays 49%. Report company_id, employee_id, employee_name and salary — where salary is the NET amount, computed as ROUND(salary * (1 - rate), 0) — ordered by company_id ascending, then employee_id ascending.",
    examples: [
      {
        input: "company 2's highest salary is 36000, so the whole company pays 24% · Nadia's gross is 31020",
        output: "Nadia · 23575",
        explanation:
          "31020 * (1 - 0.24) = 23575.2 — the product is evaluated at full precision and rounded exactly once, landing on 23575.",
      },
      {
        input: "company 1's highest salary is 29950 — fifty below the first bracket",
        output: "every company-1 employee keeps their full salary",
        explanation:
          "The brackets read the company MAX, not the individual salary, so a maximum of 29950 holds the entire company at 0% — Jules' 25400 nets to 25400.",
      },
    ],
    constraints: [
      "the rate is chosen by the company's MAXIMUM salary: below 30000 → 0%; from 30000 up to 40000 → 24%; 40000 or above → 49% — one rate per company, applied to all of its employees",
      "net = ROUND(salary * (1 - rate), 0): multiply at full precision, round once at the very end",
      "columns company_id, employee_id, employee_name, salary (the net value) — ordered by company_id, then employee_id",
    ],
    breakdown: [
      "The tax rate is a property of a GROUP, but it must be applied to every ROW of that group — that mismatch is what makes the problem interesting. An employee's own salary never chooses their rate: Marco's 18400 sits below every bracket, yet company 2's maximum of 36000 drags him into the 24% band. So the query needs the group's maximum available on each row, and a window aggregate is the direct answer: MAX(salary) OVER (PARTITION BY company_id) repeats each company's ceiling on every one of its rows, with no self-join and no grouped detour.",
      "The CASE maps the ceiling to a rate, and the half-open brackets deserve care. The first WHEN fires below 30000 and the second below 40000 — because CASE branches are checked in order, the second branch only ever sees maxima of 30000 or more, which is exactly the [30000, 40000) band the specification describes. Writing WHEN max < 40000 after WHEN max < 30000 encodes the lower bound implicitly: there is no need to repeat 30000 in the second condition, and the ELSE carries everything at 40000 and beyond — the 49% band, dormant on this seed.",
      "Rounding is a once-only event at the very end. The expression computes salary * (1 - rate) in full precision — Nadia's 31020 * 0.76 = 23575.2 — and only then does ROUND land on 23575. Rounding earlier, or rounding the rate itself, compounds error through the multiplication; and because 0.24 is not exactly representable in binary floating point, the one-round-at-the-end discipline keeps the answer identical to a decimal-calculated expectation. The final CAST to INTEGER is cosmetic: ROUND always returns a REAL, and the report wants a tidy number.",
    ],
    edges: [
      "Company 1 maxes at 29950 — fifty under the first bracket — so its whole payroll nets at 0%. A maximum of 30000 would flip the entire company to 24%: the boundary belongs to the group's maximum, and one unit of currency swings every employee at once.",
      "Marco earns 18400 — below every threshold — yet pays 24% because company 2's ceiling is 36000. The rate is inherited from the PARTITION, never chosen by the row's own salary.",
      "Nadia's 31020 * 0.76 = 23575.2 rounds once at the end to 23575; multiplying by (1 - 0.24) rather than computing salary - salary * 0.24 as two figures keeps a single rounding event in the pipeline.",
      "The 49% branch never fires on this seed because no company reaches 40000, but the CASE must still carry it — an ELSE-less CASE would return NULL nets for any future 40000-plus company.",
    ],
    ladder: [
      { title: "Brute force — a rate table per company", body: "GROUP BY company to look up each maximum, then walk the employees row by row applying the bracket by hand. Two passes and a mental join — the window does it in one." },
      { title: "The pattern — window ceiling, CASE rate", body: "MAX(salary) OVER (PARTITION BY company_id) paints the company ceiling onto every row; a CASE converts the ceiling to a rate; the outer expression nets and rounds once." },
      { title: "The optimal idea — group facts belong on rows", body: "One scan, O(n). The transferable rule: when a group-level fact gates a row-level output, lift the aggregate with a window instead of a join-back — the GROUP BY + join alternative is what the follow-up asks you to weigh." },
    ],
    approach: "Window MAX per company, CASE to a rate, net = CAST(ROUND(salary * (1 - rate), 0) AS INTEGER)",
    schema: {
      ddl: `CREATE TABLE Salaries (
  company_id    INTEGER NOT NULL,
  employee_id   INTEGER NOT NULL,
  employee_name TEXT NOT NULL,
  salary        INTEGER NOT NULL
);`,
      seed: `INSERT INTO Salaries (company_id, employee_id, employee_name, salary) VALUES
  (1, 1, 'Iris', 29950),   -- company 1 tops out at 29950: under the first bracket
  (1, 2, 'Jules', 25400),
  (1, 3, 'Kofi', 27800),
  (2, 4, 'Lena', 36000),   -- company 2 tops out at 36000: the 24% band
  (2, 5, 'Marco', 18400),  -- below every threshold, yet pays 24%
  (2, 6, 'Nadia', 31020);`,
      tables: [
        { name: "Salaries", note: "6 employees across 2 companies — company 1 maxes at 29950 (0%), company 2 at 36000 (24%)" },
      ],
    },
    code: `SELECT
    company_id,
    employee_id,
    employee_name,
    CAST(ROUND(
        salary * (1 - CASE
                          WHEN MAX(salary) OVER (PARTITION BY company_id) < 30000 THEN 0      -- company max under 30000: 0%
                          WHEN MAX(salary) OVER (PARTITION BY company_id) < 40000 THEN 0.24   -- [30000, 40000): 24%
                          ELSE 0.49                                                           -- 40000 and up: 49%
                      END),
        0) AS INTEGER) AS salary  -- full-precision product, ONE rounding at the end
FROM Salaries
ORDER BY company_id, employee_id;`,
    walkthrough: [
      "The window scan fixes each company's ceiling in one pass: company 1 → 29950, company 2 → 36000. Those two numbers alone choose every rate in the report.",
      "The CASE maps them: 29950 < 30000 → 0%, and 36000 < 40000 (with the 30000 floor implied by branch order) → 24%. All three company-1 rows inherit 0%; all three company-2 rows inherit 24% — including Marco's 18400.",
      "Netting: Iris 29950, Jules 25400 and Kofi 27800 pass through unchanged; Lena 36000 → 27360 and Marco 18400 → 13984 are exact products; Nadia's 31020 * 0.76 = 23575.2 rounds once to 23575. Ordered by company, then employee.",
    ],
    time: "O(n) — one windowed pass (a sort per partition under the hood)",
    space: "O(p) — per-partition state for the windowed maximum",
    followUps: [
      "Add a tax_paid column (gross minus net) and rank employees within each company by it — a second window function over the same partition?",
      "Rewrite with a GROUP BY CTE joined back to Salaries instead of the window — when does the join-back plan better, and does its output change if two employees tie at the company maximum?",
    ],
    related: ["department-highest-salary", "average-selling-price", "top-travellers"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "the-most-recent-orders-for-each-product",
    statement:
      "Products lists a catalogue (product_id, product_name); Orders logs purchases (order_id, product_id, order_date). For each product, find its most recent order placed in February 2020 ONLY — orders dated outside that month are out of scope, and a product with no February-2020 order is left out entirely. When two of a product's February orders share the latest date, the larger order_id wins. Output columns product_name, product_id, order_id, order_date, ordered by product_name ascending, then product_id ascending.",
    examples: [
      {
        input: "Desk Lamp's February 2020 orders: order 14 on 2020-02-14 · order 16 on 2020-02-14",
        output: "Desk Lamp · 2 · 16 · 2020-02-14",
        explanation:
          "Both orders share the latest date, so the tiebreak falls to order_id: 16 beats 14 and reports alone.",
      },
      {
        input: "Bookend's newest order overall is order 21 on 2020-03-05",
        output: "Bookend · 1 · 15 · 2020-02-29",
        explanation:
          "The month filter runs FIRST: order 21 is out of scope, so the most recent in-window order — order 15, on leap day itself — is the answer.",
      },
    ],
    constraints: [
      "the candidate window is February 2020 inclusive (2020-02-01 through 2020-02-29 — a leap month); anything dated outside it is invisible to the ranking",
      "one row per product that HAS a February-2020 order: its latest order_date, ties broken by the larger order_id",
      "columns product_name, product_id, order_id, order_date — ordered by product_name, then product_id",
    ],
    breakdown: [
      "Two stages must run in a strict order: scope, then argmax. Filter the orders to the February 2020 range first and every later decision happens inside a clean candidate set; rank first and the window happily crowns March orders — Bookend's newest order overall is its March 5 purchase, and a naive latest-per-product query would report it, answering a question nobody asked. The WHERE between two TEXT dates works because 'YYYY-MM-DD' strings sort chronologically: BETWEEN '2020-02-01' AND '2020-02-29' is an inclusive, human-auditable month gate.",
      "Per-product latest is an argmax, and ROW_NUMBER is its deterministic form: PARTITION BY product_id, ORDER BY order_date DESC, order_id DESC, keep row 1. The composite sort is the whole trick — order_date DESC finds the newest day, and order_id DESC converts a date tie (Desk Lamp's orders 14 and 16, both 2020-02-14) into a total order instead of a coin flip. The classic alternative, MAX(order_date) joined back, returns EVERY order on the max date and would print Desk Lamp twice; ROW_NUMBER bakes the tiebreaker into the ranking itself.",
      "The inner join to Products does double duty: it carries product_name into the report and it gates the output — a product with no February rows simply never appears, because there is nothing to join. Driving from the filtered orders (not from Products) makes the exclusion free: Pen Set's January and March orders were already discarded by the CTE, so its name never enters the pipeline. A LEFT JOIN from Products would need an extra WHERE to drop it — the inner join states the contract directly.",
    ],
    edges: [
      "Bookend's most recent order overall (order 21, 2020-03-05) is outside the window — filtering AFTER ranking hands the slot to March; the range filter must precede the argmax.",
      "Desk Lamp ties on 2020-02-14 with orders 14 and 16: the order_id DESC tiebreak keeps exactly one row (16) instead of emitting both.",
      "Pen Set orders only in January and March: no February group survives, so the product is absent from the output — not NULL, not zero.",
      "2020 is a leap year, so the window legitimately ends on 2020-02-29 — Bookend's winner sits exactly on that boundary day; a hardcoded non-leap '28' upper bound would silently drop it.",
    ],
    ladder: [
      { title: "Brute force — eyeball the month", body: "Print every order, scan the February ones per product and pick the newest by hand. Fine for nine rows; hopeless for a million-order log." },
      { title: "The pattern — range-filter, then ROW_NUMBER", body: "BETWEEN the month's bounds to scope candidates, ROW_NUMBER() OVER (PARTITION BY product ORDER BY date DESC, id DESC), keep rn = 1." },
      { title: "The optimal idea — scope first, tiebreak inside the rank", body: "O(o log o) for the window sort. Two durable rules: a temporal scope is a WHERE on the candidate set, never an afterthought; and argmax with ties needs a TOTAL order — put the tiebreaker in the window's ORDER BY, not in hope." },
    ],
    approach: "Range-filter to Feb 2020, ROW_NUMBER per product on (order_date DESC, order_id DESC), keep rn = 1",
    schema: {
      ddl: `CREATE TABLE Products (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL
);
CREATE TABLE Orders (
  order_id   INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES Products(product_id),
  order_date TEXT NOT NULL  -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Products (product_id, product_name) VALUES
  (1, 'Bookend'), (2, 'Desk Lamp'), (3, 'Notebook'), (4, 'Pen Set');
INSERT INTO Orders (order_id, product_id, order_date) VALUES
  (9, 2, '2020-02-02'),
  (11, 1, '2020-02-10'),
  (14, 2, '2020-02-14'),  -- ties order 16 on the same date
  (16, 2, '2020-02-14'),  -- larger id wins the tie
  (15, 1, '2020-02-29'),  -- leap day itself: inside the window
  (17, 3, '2020-02-20'),
  (18, 4, '2020-01-20'),  -- Pen Set: January only...
  (21, 1, '2020-03-05'),  -- Bookend's newest OVERALL: outside the window
  -- ...and March: Pen Set never orders in February at all
  (22, 4, '2020-03-01');`,
      tables: [
        { name: "Products", note: "4 catalogue items — Pen Set will not qualify" },
        { name: "Orders", note: "9 orders, 6 inside February 2020 — a date tie on 2020-02-14 (orders 14 and 16)" },
      ],
    },
    code: `WITH feb AS (
    SELECT o.product_id, o.order_id, o.order_date
    FROM Orders o
    WHERE o.order_date BETWEEN '2020-02-01' AND '2020-02-29'  -- leap-month window, inclusive
),
ranked AS (
    SELECT
        p.product_name,
        f.product_id,
        f.order_id,
        f.order_date,
        ROW_NUMBER() OVER (
            PARTITION BY f.product_id
            ORDER BY f.order_date DESC, f.order_id DESC  -- newest day; id breaks date ties
        ) AS rn
    FROM feb f
    JOIN Products p ON p.product_id = f.product_id  -- inner join: no Feb rows, no product
)
SELECT product_name, product_id, order_id, order_date
FROM ranked
WHERE rn = 1  -- each product's single in-window winner
ORDER BY product_name, product_id;`,
    walkthrough: [
      "feb keeps 6 of 9 orders: Bookend's 11 and 15, Desk Lamp's 9, 14 and 16, Notebook's 17. Bookend's 2020-03-05 order and both of Pen Set's out-of-month orders die at the WHERE.",
      "The window ranks each product's survivors newest-first: Bookend → 15 (2020-02-29 over 2020-02-10); Desk Lamp → 16 (tied on the date with 14, larger id wins); Notebook → 17.",
      "rn = 1 keeps three rows; ORDER BY name assembles the report: Bookend · 1 · 15 · 2020-02-29, then Desk Lamp · 2 · 16 · 2020-02-14, then Notebook · 3 · 17 · 2020-02-20. Pen Set appears nowhere.",
    ],
    time: "O(o log o) — the window sort over the filtered orders",
    space: "O(o) — the filtered set plus one ranked row per order",
    followUps: [
      "Report each product's February order COUNT beside its latest order — one extra window aggregate over the same partition?",
      "Parameterize the month: derive the inclusive bounds from a target date with date arithmetic instead of typing '2020-02-29' — how do you compute a month's last day in SQLite?",
    ],
    related: ["the-most-recent-three-orders", "product-sales-analysis-i", "the-latest-login-in-2020"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "warehouse-manager",
    statement:
      "Products lists each item's dimensions (product_id, product_name, width, length, height) and Warehouse records storage: each row (name, product_id, units) says how many units of one product sit in one warehouse — and one product can be stored in several warehouses. A warehouse's volume is the total space its contents occupy: SUM(units * width * length * height) over all of its storage rows. Report columns name and volume, ordered by name ascending.",
    examples: [
      {
        input: "Lakeside stores 10 Tin Crates (2 x 3 x 4) and 5 Oak Barrels (3 x 3 x 3)",
        output: "Lakeside · 375",
        explanation:
          "Each storage row multiplies units by the product's cube before any summing: 10 * 24 + 5 * 27 = 375.",
      },
      {
        input: "the Tin Crate also sits in Hilltop, 4 units",
        output: "Hilltop counts it independently: 4 * 24 = 96",
        explanation:
          "The join re-reads the dimensions once per storage location; Lakeside's count never interferes with Hilltop's.",
      },
    ],
    constraints: [
      "a product's unit volume is width * length * height; a warehouse's volume is SUM(units * unit volume) over ALL of its storage rows",
      "a product may appear in several warehouses — each (warehouse, product) storage row contributes separately",
      "columns name, volume — ordered by name ascending",
    ],
    breakdown: [
      "The grain of the multiplication is the STORAGE ROW — not the product and not the warehouse. Width, length and height live on Products; units lives on Warehouse; only a joined row (one warehouse's stock of one product) has all four numbers at once. The volume expression units * width * length * height is therefore a per-joined-row computation: 10 units of Tin Crate is 240 cubic units here, 4 units of the same crate elsewhere is 96 there, and SUM only enters after the join has materialized every such row.",
      "This ordering — join, multiply, then sum — is the trap. Aggregating the wrong side first cannot work: collapsing Products to one volume-per-product row throws away which warehouse the units belong to, and summing Warehouse.units alone loses the cubes entirely. Even the plausible SUM(units) * SUM(cube) per warehouse is wrong: it would multiply Lakeside's 15 total units by 51 — the sum of both cubes — instead of weighting each product by its own cube. The weighted sum must happen at the row where units and dimensions meet.",
      "GROUP BY w.name folds the joined rows per warehouse, and ORDER BY name keeps the report deterministic — names are unique on this seed, but the tiebreaker habit costs nothing. Every cube dimension here is an integer, so each unit cube (24, 27, 20) and every total is exact. No rounding, no float drift: the report reads like arithmetic done by hand.",
    ],
    edges: [
      "Tin Crate sits in TWO warehouses: after the join its cube (24) travels with each storage row — Lakeside's 10 units and Hilltop's 4 units are weighted independently; a Products-side pre-aggregate would compute 24 once and lose the units entirely.",
      "SUM must follow the join, never precede it: SUM(units) * SUM(cube) per warehouse would report Lakeside as 15 * 51 = 765 instead of 240 + 135 = 375 — weighting each cube by the WRONG total.",
      "Integer cube dims keep this seed exact; with REAL dimensions the totals inherit float rounding — and cube products grow fast (a 50 x 50 x 50 crate is 125000 per unit), so narrow 32-bit engines can overflow on units * cube where SQLite's 64-bit INTEGER sails through.",
      "GROUP BY w.name alone is safe because warehouse names are unique here; if the schema ever allowed duplicate names, they would merge into one row — grouping by a warehouse id (carrying the name along for display) is the future-proof form.",
    ],
    ladder: [
      { title: "Brute force — a spreadsheet per warehouse", body: "Look up each product's cube, multiply by units, add up per warehouse by hand. One schema change and the sheet is stale." },
      { title: "The pattern — join, weight, fold", body: "JOIN Warehouse to Products, multiply units by the cube on each joined row, GROUP BY warehouse, SUM the weighted rows." },
      { title: "The optimal idea — aggregate where the factors meet", body: "O(w + p). Weighted totals must be computed at the grain where every factor lives on one row; any aggregation before the join destroys the pairing the multiplication needs." },
    ],
    approach: "Join storage rows to dimensions, weight each row (units x cube), GROUP BY warehouse, SUM",
    schema: {
      ddl: `CREATE TABLE Products (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  width        INTEGER NOT NULL,
  length       INTEGER NOT NULL,
  height       INTEGER NOT NULL
);
CREATE TABLE Warehouse (
  name       TEXT NOT NULL,
  product_id INTEGER NOT NULL REFERENCES Products(product_id),
  units      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Products (product_id, product_name, width, length, height) VALUES
  (1, 'Tin Crate', 2, 3, 4),    -- cube 24 per unit
  (2, 'Oak Barrel', 3, 3, 3),   -- cube 27 per unit
  (3, 'Book Box', 2, 2, 5);     -- cube 20 per unit
INSERT INTO Warehouse (name, product_id, units) VALUES
  ('Lakeside', 1, 10),   -- 10 * 24 = 240
  ('Lakeside', 2, 5),    -- 5 * 27 = 135
  ('Hilltop', 1, 4),     -- Tin Crate again: two warehouses share the product
  ('Hilltop', 3, 7),
  ('Dockside', 2, 2);`,
      tables: [
        { name: "Products", note: "3 items with integer cube dims — 24, 27 and 20 per unit" },
        { name: "Warehouse", note: "5 storage rows across 3 warehouses — Tin Crate sits in both Lakeside and Hilltop" },
      ],
    },
    code: `SELECT
    w.name,
    SUM(w.units * p.width * p.length * p.height) AS volume  -- weight each storage row, then fold
FROM Warehouse w
JOIN Products p ON p.product_id = w.product_id  -- dims meet units HERE, per storage row
GROUP BY w.name
ORDER BY w.name;`,
    walkthrough: [
      "The join materializes 5 storage rows with cubes attached: Lakeside gets (1, 24/unit) and (2, 27/unit); Hilltop gets (1, 24/unit) and (3, 20/unit); Dockside gets (2, 27/unit).",
      "Each row weights: Lakeside 10 * 24 = 240 and 5 * 27 = 135; Hilltop 4 * 24 = 96 and 7 * 20 = 140; Dockside 2 * 27 = 54.",
      "GROUP BY name folds three groups: Dockside 54, Hilltop 96 + 140 = 236, Lakeside 240 + 135 = 375 — printed in name order.",
    ],
    time: "O(w + p) — one join pass over the storage rows",
    space: "O(u) — one group per warehouse",
    followUps: [
      "Report each warehouse's single largest storage row and the product behind it — a window MAX ranked per warehouse?",
      "Include products stored NOWHERE (LEFT JOIN from Products) — should they report 0 units or be dropped, and which join states that choice?",
    ],
    related: ["products-worth-over-invoices", "product-sales-analysis-ii", "product-sales-analysis-iii"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "find-the-missing-ids",
    statement:
      "Customers holds registered accounts (customer_id, customer_name); ids were issued sequentially from 1 upward, but deletions left holes in the sequence. Find every id in the range 1 through MAX(customer_id) that was never issued. Output one column, ids, ordered ascending — every missing id exactly once, including runs of consecutive gaps.",
    examples: [
      {
        input: "the smallest customers hold ids 1, 2, 4 — 3 was never issued",
        output: "3",
        explanation:
          "The ladder runs 1 through the max; rung 3 joins to no customer and survives the anti-join.",
      },
      {
        input: "ids 8 and 12 exist while 9, 10 and 11 do not",
        output: "9 · 10 · 11",
        explanation:
          "A three-wide hole prints three rows: the recursion walks every rung between the survivors, and each rung is emitted exactly once.",
      },
    ],
    constraints: [
      "the ladder spans 1 through MAX(customer_id) — derive the upper bound from the data, never hardcode it; ids beyond the max are out of scope",
      "one column ids, ordered ascending; each missing id appears exactly once even inside a run of consecutive gaps",
      "ids that exist (here 1, 2, 4, 6, 7, 8, 12) never appear in the output",
    ],
    breakdown: [
      "The output is made of data that does not exist — no GROUP BY over Customers can enumerate absences. The engine must be handed the complete candidate space first: every integer from 1 up to the table's maximum. That is exactly what WITH RECURSIVE builds: a seed row (SELECT 1) plus a step (SELECT id + 1 FROM seq) whose WHERE keeps producing while id stays under the bound. Twelve seed-fed steps later the CTE holds the full ladder 1 through 12 — a table of every id that COULD exist.",
      "The bound is a scalar subquery — (SELECT MAX(customer_id) FROM Customers) — evaluated inside the recursive step, so the ladder stretches with the data: register customer 40 and the chain walks to 40 without touching the SQL. The mechanics also explain the no-duplicate guarantee. SQLite fires the recursive step once per queued row, and each id here has exactly one producer (its predecessor), so the chain 1 → 2 → … → 12 is a single lineage — UNION ALL is safe by construction, and a deduplicating UNION would only bill a sort for nothing.",
      "With the complete ladder on one side and Customers on the other, absence-finding is an anti-join: LEFT JOIN Customers ON customer_id = id keeps all 12 rungs, and WHERE c.customer_id IS NULL keeps only the rungs nobody occupies — 3, 5, 9, 10, 11. Direction is the classic mistake: driving the join from Customers would reproduce the customer list and find nothing missing. NOT IN (SELECT customer_id FROM Customers) reads shorter but carries a NULL landmine — one NULL in the subquery erases the entire result — while the IS NULL anti-join is NULL-proof by shape.",
    ],
    edges: [
      "The upper bound is MAX(customer_id) = 12, not a constant: the recursive step's subquery keeps the ladder data-driven, so a newly issued id 40 automatically extends the search.",
      "The 9-10-11 run is the dedup probe: three consecutive rungs each fail the join and each prints once — the single-lineage recursion cannot repeat a rung, so no DISTINCT is needed.",
      "The LADDER must drive the join: FROM seq LEFT JOIN Customers keeps all 12 rungs before the filter; FROM Customers LEFT JOIN seq would start from the 7 survivors and report nothing.",
      "NOT IN (SELECT customer_id ...) happens to work here because customer_id is a PRIMARY KEY and cannot be NULL — but the same query over a nullable column would return zero rows the moment one NULL appeared; the IS NULL anti-join has no such failure mode.",
    ],
    ladder: [
      { title: "Brute force — diff two lists by hand", body: "SELECT all ids and subtract them mentally from 1 through 12. Works once; rots instantly as the max grows." },
      { title: "The pattern — recursive ladder + anti-join", body: "WITH RECURSIVE generates 1 through MAX, a LEFT JOIN to Customers keeps every rung, and IS NULL keeps the holes." },
      { title: "The optimal idea — enumerate the universe, then subtract", body: "O(m) rungs plus a hash join. When the answer is absence, build the complete universe first (a recursive CTE here; a numbers table or generate_series in engines without recursion), then subtract what exists." },
    ],
    approach: "WITH RECURSIVE ladder 1..MAX(customer_id), LEFT JOIN to Customers, keep the IS NULL rungs",
    schema: {
      ddl: `CREATE TABLE Customers (
  customer_id   INTEGER PRIMARY KEY,
  customer_name TEXT NOT NULL
);`,
      seed: `INSERT INTO Customers (customer_id, customer_name) VALUES
  (1, 'Ada'),
  (2, 'Bo'),
  (4, 'Cy'),      -- 3 never issued
  (6, 'Dee'),     -- 5 never issued
  (7, 'Eli'),
  (8, 'Fay'),
  -- the run 9-10-11 is entirely absent
  (12, 'Gus');`,
      tables: [
        { name: "Customers", note: "7 customers — ids 1, 2, 4, 6, 7, 8, 12; a three-wide hole at 9-10-11" },
      ],
    },
    code: `WITH RECURSIVE seq(id) AS (
    SELECT 1                                       -- the ladder's first rung
    UNION ALL
    SELECT id + 1                                  -- one producer per rung: no repeats by construction
    FROM seq
    WHERE id < (SELECT MAX(customer_id) FROM Customers)  -- data-driven ceiling: 12 here
)
SELECT s.id AS ids
FROM seq s
LEFT JOIN Customers c ON c.customer_id = s.id  -- keep ALL rungs, mark the occupied ones
WHERE c.customer_id IS NULL                    -- anti-join: the rungs nobody owns
ORDER BY s.id;`,
    walkthrough: [
      "The CTE seeds 1 and steps while id < 12: rungs 1 through 12, each produced once by its predecessor — 11 recursive steps from one seed row.",
      "The LEFT JOIN marks 7 rungs as occupied (1, 2, 4, 6, 7, 8, 12); the other 5 keep NULL customer ids: 3, 5, 9, 10, 11 — the whole 9-10-11 run included.",
      "IS NULL keeps those 5 and ORDER BY sorts them: 3, 5, 9, 10, 11 — every hole between 1 and the max, exactly once each.",
    ],
    time: "O(m + c) — m ladder rungs joined against c customers",
    space: "O(m) — the generated ladder",
    followUps: [
      "Summarize each gap as a start and a length — the 9-10-11 hole as start 9, length 3 — using LAG over the EXISTING ids instead of the full ladder?",
      "Port to a warehouse engine without WITH RECURSIVE: generate_series, a static numbers table, or a digits cross-join — which scales to a maximum in the billions?",
    ],
    related: ["report-contiguous-dates", "students-and-examinations", "customers-who-bought-a-and-b-not-c"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "count-apples-and-oranges",
    statement:
      "Boxes and Chests track a fruit inventory. Chests holds one row per chest (chest_id, apples, oranges) whose counts are CHEST-LEVEL: they already include every box stored inside that chest. Boxes holds one row per box (box_id, apples, oranges, chest_id); chest_id NULL marks a box that stands alone — it belongs to no chest and nobody else has counted it. Compute the grand totals as one row with apple_count and orange_count covering all chests plus all standalone boxes — chest contents counted exactly once, and Boxes rows that carry a chest_id must be EXCLUDED (they are already inside their chest's own numbers).",
    examples: [
      {
        input: "chest 1 reports 100 apples / 60 oranges; its inner boxes are ALSO logged as Boxes rows 11 (20/8) and 13 (30/15)",
        output: "chest 1 contributes 100 apples — not 150",
        explanation:
          "Rows 11 and 13 are already folded into chest 1's own numbers; summing them again would inflate apples by 50.",
      },
      {
        input: "boxes 10 (12 apples / 5 oranges) and 12 (6/4) carry chest_id NULL",
        output: "18 apples and 9 oranges from standalone boxes",
        explanation:
          "Only NULL-chest boxes are an independent stock — they are the only Boxes rows that join the total.",
      },
    ],
    constraints: [
      "Chests rows are chest-level totals that already contain their inner boxes — Boxes rows with a chest_id must NOT be summed again",
      "standalone boxes are Boxes rows with chest_id IS NULL; they are the only Boxes rows that count",
      "exactly one output row: apple_count, orange_count — the totals over both stocks",
    ],
    breakdown: [
      "Two tables, two grains, and an overlap between them. A Chests row is a summary: chest 1's 100/60 already contains whatever sits inside it. A Boxes row with chest_id NULL is a leaf: nobody else has counted box 10's twelve apples. The inventory therefore has exactly two legitimate sources — every Chests row, plus the Boxes rows that no chest claims — and the whole problem is refusing to count anything else.",
      "That is why a JOIN is the wrong instrument here: the tables do not complement each other, they OVERLAP. Joining Boxes to Chests on chest_id and summing chest.apples per box row counts chest 1's 100 once per inner box (twice — rows 11 and 13), while a plain Chests + Boxes grand total double counts the same 50 apples the other way. UNION ALL is the honest shape: stack two same-shaped SELECTs — all of Chests, plus Boxes WHERE chest_id IS NULL — and let one SUM fold the stack.",
      "The filter belongs INSIDE the Boxes branch, not at the top: chest rows must survive untouched, so WHERE chest_id IS NULL can only be stated where it applies. The two branches are disjoint by construction — a chest-level row and a standalone-box row cannot be the same fact — which makes UNION ALL both correct and free; a deduplicating UNION would spend a sort proving a disjointness the shape already guarantees. And SUM over an empty stack returns NULL rather than 0, so a warehouse with no stock at all would print NULL/NULL unless COALESCE guards the outer aggregation.",
    ],
    edges: [
      "The seeded double count: chest 1's inner boxes (rows 11 and 13 — 50 apples, 23 oranges) ALSO live in Boxes; a naive Chests + Boxes sum reports 208 apples instead of 158.",
      "A join-driven inventory fails twice: chest 1's 100 apples would count once per inner box row, and chest 2 — which holds no logged Boxes rows — would vanish from an inner join entirely.",
      "The per-branch WHERE is load-bearing: the Chests branch must keep every row it has, so the chest_id IS NULL filter can only live inside the Boxes branch — each SELECT carries its own scope.",
      "Delete every row and SUM's NULL result prints NULL/NULL — COALESCE(SUM(...), 0) turns the empty warehouse into a well-formed 0/0 report.",
    ],
    ladder: [
      { title: "Brute force — two lists and a calculator", body: "Copy Chests, copy the unclaimed Boxes, add by hand — and hope nobody adds chest 1's boxes twice. The difficulty is arithmetic discipline, not insight." },
      { title: "The pattern — UNION ALL two stocks, SUM once", body: "One branch reads Chests wholesale; the other reads Boxes WHERE chest_id IS NULL; the outer SELECT sums both columns over the stack." },
      { title: "The optimal idea — model the overlap, do not join it", body: "O(b + c). When two sources overlap, the correct inventory is a stated union of non-overlapping slices — derive the slices from ownership (chest_id IS NULL), never from a join that re-multiplies the summary." },
    ],
    approach: "UNION ALL of Chests plus NULL-chest Boxes rows, one SUM over the stack",
    schema: {
      ddl: `CREATE TABLE Boxes (
  box_id   INTEGER PRIMARY KEY,
  apples   INTEGER NOT NULL,
  oranges  INTEGER NOT NULL,
  chest_id INTEGER          -- NULL: the box stands alone
);
CREATE TABLE Chests (
  chest_id INTEGER PRIMARY KEY,
  apples   INTEGER NOT NULL,
  oranges  INTEGER NOT NULL
);`,
      seed: `INSERT INTO Chests (chest_id, apples, oranges) VALUES
  (1, 100, 60),   -- chest-level totals: rows 11 and 13 below are already inside these numbers
  (2, 40, 90);    -- holds no logged Boxes rows
INSERT INTO Boxes (box_id, apples, oranges, chest_id) VALUES
  (10, 12, 5, NULL),
  (11, 20, 8, 1),   -- inside chest 1: exclude (already counted there)
  (12, 6, 4, NULL),
  (13, 30, 15, 1);`,
      tables: [
        { name: "Boxes", note: "4 boxes — rows 11 and 13 sit inside chest 1 and are already in its totals; rows 10 and 12 stand alone" },
        { name: "Chests", note: "2 chests — chest 1 at 100/60, chest 2 at 40/90 (no Boxes rows reference chest 2)" },
      ],
    },
    code: `WITH stock AS (
    SELECT apples, oranges FROM Chests                        -- chest-level totals, inner boxes already inside
    UNION ALL
    SELECT apples, oranges FROM Boxes WHERE chest_id IS NULL  -- standalone boxes: the only independent stock
)
SELECT
    SUM(apples)  AS apple_count,
    SUM(oranges) AS orange_count
FROM stock
ORDER BY apple_count;  -- single-row report: the ORDER BY keeps the exact contract explicit`,
    walkthrough: [
      "Branch one reads Chests: (100, 60) and (40, 90). Branch two reads Boxes WHERE chest_id IS NULL: (12, 5) and (6, 4) — rows 11 and 13 exist but are excluded, their contents already inside chest 1.",
      "The stack holds four rows: 100/60, 40/90, 12/5, 6/4.",
      "SUM folds once: apples 100 + 40 + 12 + 6 = 158, oranges 60 + 90 + 5 + 4 = 159 — one row (158, 159). The excluded inner boxes would have pushed a naive sum to 208 apples.",
    ],
    time: "O(b + c) — one scan per stock",
    space: "O(b + c) — the stacked rows before folding",
    followUps: [
      "Split the report by source — how many apples came from chests versus standalone boxes — by adding a source label to each branch and GROUP BY it?",
      "Add a box whose chest_id points at a missing chest: should a foreign key block it at write time, or should the report carry an orphan bucket — and which query shape would surface it?",
    ],
    related: ["apples-and-oranges", "group-sold-products-by-the-date", "monthly-transactions-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "products-price-for-each-store",
    statement:
      "Products stores each item's price per store in one wide row: product_id, store1, store2, store3 — a NULL means that store does not carry the item. Reshape the table to long form: one row per NON-NULL price as (product_id, store, price), where store is the literal string 'store1', 'store2' or 'store3' naming the column the price came from. NULL prices produce no row at all. Output columns product_id, store, price, ordered by product_id ascending, then store ascending.",
    examples: [
      {
        input: "product 1: store1 130 · store2 160 · store3 185",
        output: "three rows — (1, store1, 130) · (1, store2, 160) · (1, store3, 185)",
        explanation:
          "Each non-NULL column becomes one long row, tagged with a literal naming the column it came from.",
      },
      {
        input: "product 2: store1 NULL · store2 210 · store3 NULL",
        output: "one row — (2, store2, 210)",
        explanation:
          "NULL prices carry no fact, so their rows are dropped — never emitted with a NULL price.",
      },
    ],
    constraints: [
      "one output row per non-NULL (product_id, store) pair — at most three per product, fewer when NULLs intervene",
      "the store value is the literal 'store1' / 'store2' / 'store3' produced by the query, not data read from the table",
      "columns product_id, store, price — ordered by product_id, then store (lexicographic: store1 < store2 < store3)",
    ],
    breakdown: [
      "Wide to long is a reshape, not an aggregation: nothing is grouped and nothing is joined — each price column simply becomes a labeled stack of rows. The long format is the shape analytical tools want: one fact per row, the column's NAME promoted into DATA. That promotion is the query's creative act — SELECT 'store1' AS store, store1 AS price pairs a constant literal with the column it describes, so the output row says 'this 130 came from store1' without any metadata lookup.",
      "Three branches, three literals: one SELECT per store column, glued by UNION ALL. Each branch is trivially readable — product_id, its literal, its column, and a WHERE dropping NULLs — and the stacking is free because the branches are disjoint by construction: a row in the store1 branch and a row in the store2 branch are different facts about the same product. There is nothing to dedupe; a deduplicating UNION would sort the whole stack just to prove a disjointness the shape already guarantees.",
      "The NULL filter is per branch: product 2's store1 is NULL, so the store1 branch's WHERE silently skips it — without the filter, the output would grow a (2, store1, NULL) row asserting a price nobody set. The classic alternative is the CASE unpivot: CROSS JOIN a three-row store list against Products and pick each price with CASE WHEN n = 1 THEN store1 ... — one scan instead of three, at the cost of denser expressions plus the same IS NOT NULL filter at the end. On three columns either reads fine; the UNION ALL form wins on transparency, the CASE form wins on scalability as columns grow.",
    ],
    edges: [
      "Product 2's store1 is NULL: the branch filter drops it — a missing WHERE would emit (2, store1, NULL), a row the long format must not contain.",
      "The store labels are literals owned by each branch: swap branch two's literal to 'store1' and the 210 would be silently mislabeled — no error, just a lie.",
      "ORDER BY product_id, store sorts store as TEXT: store1 < store2 < store3 holds while the suffixes are single digits — a future store10 would sort before store2 and scramble the contract.",
      "Three scans of UNION ALL versus one scan of the CASE unpivot is a real trade: same rows, same order — pick per readability until the column count makes the CASE form the only sane one.",
    ],
    ladder: [
      { title: "Brute force — read the row, type the rows", body: "For each product, write out its price lines by hand. Three stores is manageable; thirty is not." },
      { title: "The pattern — one branch per column, UNION ALL", body: "Three SELECTs each pair a literal with its column and drop NULLs; stack them, then ORDER BY product_id, store." },
      { title: "The optimal idea — promote names to data", body: "O(3n). Reshaping wide to long means turning column names into row values — literals in UNION branches, or a CASE unpivot over a store list — and filtering NULLs where they arise." },
    ],
    approach: "Three single-column SELECTs with store literals, UNION ALL, per-branch NULL filter, ORDER BY product_id then store",
    schema: {
      ddl: `CREATE TABLE Products (
  product_id INTEGER PRIMARY KEY,
  store1     INTEGER,        -- NULL: that store does not carry the item
  store2     INTEGER,
  store3     INTEGER
);`,
      seed: `INSERT INTO Products (product_id, store1, store2, store3) VALUES
  (1, 130, 160, 185),
  (2, NULL, 210, NULL),   -- only store2 carries it
  -- only store1 carries this one
  (3, 140, NULL, NULL);`,
      tables: [
        { name: "Products", note: "3 items in wide form — product 2 lists only store2, product 3 only store1" },
      ],
    },
    code: `SELECT product_id, 'store1' AS store, store1 AS price FROM Products WHERE store1 IS NOT NULL
UNION ALL
SELECT product_id, 'store2' AS store, store2 AS price FROM Products WHERE store2 IS NOT NULL
UNION ALL
SELECT product_id, 'store3' AS store, store3 AS price FROM Products WHERE store3 IS NOT NULL
ORDER BY product_id, store;  -- lexicographic store order: store1 < store2 < store3`,
    walkthrough: [
      "The store1 branch yields (1, 130) and (3, 140) — product 2's NULL dies at the WHERE before it can become a row.",
      "The store2 branch yields (1, 160) and (2, 210); the store3 branch yields (1, 185) alone. Five rows stacked, none carrying NULL.",
      "ORDER BY product_id, store assembles the contract order: (1, store1, 130), (1, store2, 160), (1, store3, 185), (2, store2, 210), (3, store1, 140).",
    ],
    time: "O(3n) — one pass per store column",
    space: "O(k) — one output row per non-NULL price",
    followUps: [
      "Add a store4 column: how does each shape absorb it — a fourth UNION branch versus one more CASE arm — and which edit is less error-prone?",
      "Reverse the reshape: from a long (product_id, store, price) table, rebuild the wide Products with conditional aggregation — MAX(CASE WHEN store = 'store1' THEN price END) per product?",
    ],
    related: ["reformat-department-table", "product-price-at-a-given-date", "product-sales-analysis-ii"],
    order: "exact",
    xp: 10,
  },
];
