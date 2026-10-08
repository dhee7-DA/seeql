// Deep-dives — LeetCode Premium batch V, file 5 of 6: year-over-year growth,
// spend segments, final prices, driver scores and skill gates (1 Hard, 4 Medium). Engine-verified by scripts/tmp-69b5-check.ts.
// Re-authored from the canonical premium tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM5_MARKET: LcSqlDive[] = [
  {
    slug: "year-on-year-growth-rate",
    statement:
      "AnnualSales records one row per product-year that has sales: (sales_id, product_id, year, revenue). A product's history can skip years entirely, and at most one row exists per (product, year). For every product and year where a prior year's row EXISTS, report product_id, year, revenue, prior_revenue, growth_pct — ordered by product_id ascending, then year ascending. The prior is the product's LATEST available year before the reported one — its previous row in that product's own year order — which is not the same thing as year-minus-one when years are missing from the middle of a history. growth_pct is ROUND(100.0 * (revenue - prior_revenue) / prior_revenue, 2). The first year observed for each product is absent from the report: it has no prior.",
    examples: [
      {
        input: "product 3 records revenue 90 in 2021 and 130 in 2023 — no 2022 row exists at all",
        output: "2023 · 130 · 90 · 44.44",
        explanation:
          "The prior is the latest AVAILABLE year: 2023 computes against 2021's 90 (100.0 * 40 / 90 = 44.44), and the hole where 2022 would have been never appears in the output.",
      },
      {
        input: "product 2 records 250 in 2021 and 190 in 2022",
        output: "2022 · 190 · 250 · -24.0",
        explanation:
          "Revenue fell by 60 on a base of 250, so the percentage is negative; 2021 itself is absent because it is the product's first observed year and has no prior.",
      },
    ],
    constraints: [
      "one row per (product, year) that has a prior available year; the first observed year of each product never appears in the output",
      "prior_revenue is the revenue of the latest year BEFORE the reported one that has a row — the previous entry in the product's own year order — not year-minus-one arithmetic, which would drop gap-year rows",
      "columns product_id, year, revenue, prior_revenue, growth_pct — ordered by product_id, then year — with growth_pct = ROUND(100.0 * (revenue - prior_revenue) / prior_revenue, 2)",
    ],
    breakdown: [
      "Year-over-year growth is a comparison between a row and its predecessor, and SQL expresses 'predecessor' with LAG. LAG(revenue) OVER (PARTITION BY product_id ORDER BY year) walks each product's timeline in year order and hands every row the revenue of the row that came before it, with NULL for the timeline's first row. That NULL is not an anomaly to patch over — it IS the answer to 'does this year have a prior?', and the report simply excludes rows whose prior is missing. A GROUP BY cannot help here, because the output keeps every row and adds context beside it rather than collapsing rows into one.",
      "The word 'prior' is where the difficulty hides, because two definitions look interchangeable and are not. Under the latest-available definition, a product's 2023 row compares against its 2021 row whenever 2022 was never recorded — the previous entry in that product's own timeline, however far back it sits. Under the year-minus-one definition, that same 2023 row has no prior at all and vanishes from the report. This task states the former, and LAG implements it by construction: a self-join on t2.year = t1.year - 1 would silently shrink the output exactly and only on gap-year rows, which is the one case this seed exists to expose.",
      "The arithmetic carries a precision trap that is easy to write and hard to spot. In SQLite, dividing INTEGER by INTEGER truncates, so (revenue - prior_revenue) / prior_revenue collapses to a whole number before any percentage exists — 55 / 145 is 0, not 0.379. Writing the 100.0 multiplier FIRST forces real arithmetic: 100.0 * 55 = 5500.0, and 5500.0 / 145 keeps its fraction, which ROUND then pins to two decimals. The rounding itself is a reporting contract — 37.9310... percent and 37.93 are the same quantity, but only the latter is the money-grade figure the column promises.",
    ],
    edges: [
      "The gap year is the planted trap: product 3 has rows for 2021 (90) and 2023 (130) and nothing for 2022, and LAG still pairs the 2023 row with 90 — the report shows (3, 2023, 130, 90, 44.44). A self-join on year minus one would drop that row entirely and ship three rows where four are correct.",
      "First-year exclusion runs on the LAG output: WHERE prior_revenue IS NOT NULL removes 2021 for products 1, 2 and 3. A filter on year > 2021 hardcodes a global start year that breaks the moment any product begins its history later than the table's earliest.",
      "Integer division is live on this seed: written as (revenue - prior_revenue) / prior_revenue * 100.0, product 1's 2023 row computes 55 / 145 = 0 and reports 0.0 — the 100.0 multiplier must precede the division (or the operands must be cast) for 37.93 to survive.",
      "Negative growth must keep its sign: product 2's 2022 row reports -24.0, and ROUND preserves it — wrapping the difference in ABS(), or assuming declines sort below flat in some absolute-ordered view, misreads a shrinking product as improving.",
    ],
    ladder: [
      { title: "Brute force — walk each timeline by hand", body: "Pull each product's rows, sort by year in application code, subtract the previous available revenue and print the percentage. It works, but it re-implements a window the engine ships natively, and it hides the definition of 'prior' inside a loop nobody reviews." },
      { title: "The pattern — LAG over the product's own years", body: "LAG(revenue) OVER (PARTITION BY product_id ORDER BY year) computes the prior per row in one pass; the NULL-prior first rows are filtered afterwards and the percentage is rounded in the SELECT." },
      { title: "The optimal idea — 'prior' is a row fact, not a date fact", body: "O(n log n). The durable rule: when a report says 'the previous one', decide whether that means the previous CALENDAR unit (a year-minus-one join) or the previous OBSERVED row (LAG) — the two differ exactly on gaps, and LAG matches the latest-available wording." },
    ],
    approach: "LAG(revenue) OVER (PARTITION BY product_id ORDER BY year), NULL-prior first rows filtered after the window, growth rounded to 2 decimals",
    schema: {
      ddl: `CREATE TABLE AnnualSales (
  sales_id   INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  year       INTEGER NOT NULL,
  revenue    INTEGER NOT NULL,
  UNIQUE (product_id, year)
);`,
      seed: `INSERT INTO AnnualSales (sales_id, product_id, year, revenue) VALUES
  (1, 1, 2021, 100),  -- product 1 first observed year: drops from the report
  (2, 1, 2022, 145),  -- growth vs 2021: 45.0
  (3, 1, 2023, 200),  -- growth vs 2022: 37.93 (ROUND bites here)
  (4, 2, 2021, 250),  -- product 2 first observed year
  (5, 2, 2022, 190),  -- declining: growth -24.0
  (6, 3, 2021, 90),   -- product 3 first observed year
  -- 2022 is MISSING for product 3: the 2023 row computes against 2021
  (7, 3, 2023, 130);`,
      tables: [
        { name: "AnnualSales", note: "7 rows over 3 products — product 1 grows two years running, product 2 declines, product 3 skips 2022 entirely" },
      ],
    },
    code: `WITH yoy AS (
    SELECT
        product_id,
        year,
        revenue,
        LAG(revenue) OVER (
            PARTITION BY product_id
            ORDER BY year
        ) AS prior_revenue          -- previous OBSERVED year, gaps and all
    FROM AnnualSales
)
SELECT
    product_id,
    year,
    revenue,
    prior_revenue,
    ROUND(100.0 * (revenue - prior_revenue) / prior_revenue, 2) AS growth_pct
FROM yoy
WHERE prior_revenue IS NOT NULL    -- drop each product's first observed year
ORDER BY product_id, year;`,
    walkthrough: [
      "LAG partitions seven rows into three product timelines and pairs each row with the previous OBSERVED year's revenue: product 1 runs 100 → 145 → 200, product 2 runs 250 → 190, and product 3's 2023 row pairs with 2021's 90 even though 2022 never happened.",
      "The three timeline-first rows carry NULL priors and are removed by WHERE prior_revenue IS NOT NULL; the four survivors compute ROUND(100.0 * (revenue - prior) / prior, 2) as 45.0, 37.93, -24.0 and 44.44.",
      "ORDER BY product_id, year ships (1, 2022, 145, 100, 45.0), (1, 2023, 200, 145, 37.93), (2, 2022, 190, 250, -24.0), (3, 2023, 130, 90, 44.44) — the gap-year row present, all three first years absent.",
    ],
    time: "O(n log n) — one partitioned sort feeding LAG",
    space: "O(n) — the windowed rows held until the final filter",
    followUps: [
      "Add a calendar_gap column showing year minus the prior year's value — which window expression supplies the prior YEAR (not the prior revenue), and how would you flag rows whose prior is not literally the year before?",
      "Join a product dimension for display names — why must that join happen outside the windowed query, and what changes if the LAG partition runs over the already-joined row set?",
    ],
    related: ["customers-with-strictly-increasing-purchases", "products-with-three-or-more-orders-in-two-consecutive-years", "rolling-average-steps"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "customer-purchasing-behavior-analysis",
    statement:
      "CustomerOrder logs one row per completed order: (order_id, customer_id, order_date, amount). Segment each customer by LIFETIME spend — the total of all their order amounts: 'big' when the total is at least 1000, 'regular' when it is at least 300, 'occasional' otherwise. Both thresholds are inclusive, and a lifetime total of 299 is occasional. Customers with no orders cannot appear — the report is built from order rows alone. Output columns customer_id, segment, total_spent, order_count, ordered by customer_id ascending.",
    examples: [
      {
        input: "customer 501 ordered 600 once and 400 later",
        output: "501 · big · 1000 · 2",
        explanation:
          "The lifetime total is exactly 1000 and the threshold is inclusive: 'big', not 'regular'.",
      },
      {
        input: "customer 502 ordered 150 and then 149",
        output: "502 · occasional · 299 · 2",
        explanation:
          "Neither order is large on its own and the total sits one unit under the 300 line — occasional. A WHERE amount >= 300 would delete both rows and lose the customer entirely.",
      },
    ],
    constraints: [
      "segment thresholds are inclusive: total >= 1000 is 'big', total >= 300 is 'regular', anything under 300 is 'occasional' — a lifetime total of exactly 299 is occasional",
      "one row per customer that has at least one order; customers with no orders are absent by construction",
      "columns customer_id, segment, total_spent, order_count — ordered by customer_id ascending",
    ],
    breakdown: [
      "The segment is a property of a SUM, and that ordering is the whole design constraint: no aggregate exists until a group has been formed, so the classification cannot be decided row by row. The engine shape is one GROUP BY customer_id whose SELECT computes the lifetime total once and reads it three ways — as the segment's CASE input, as total_spent, and (via the same grouping) as the source of order_count. A CASE whose WHEN arms test SUM(amount) runs after the aggregate is available, because SELECT expressions are evaluated per group. That is why the segment lives in the SELECT or HAVING layer and can never live in WHERE.",
      "The thresholds are inclusive on both lines, and the CASE's top-to-bottom evaluation is what keeps the buckets disjoint. Customer 504's lifetime 2500 is 'big' only because the >= 1000 arm is tested first — swap the arms and 2500 satisfies >= 300 first, the CASE stops at the first true arm, and the biggest spender in the seed is mislabeled 'regular'. The boundary rows are equally deliberate: 501 totals exactly 1000 (big, not regular), 503 totals exactly 300 (regular, not occasional), and 502 totals exactly 299 — one unit short, occasional. Strict > comparisons demote 501 and 503 while changing nothing else, the quietest possible failure.",
      "The WHERE-versus-HAVING trap deserves seed-row specifics because its failure mode is disappearance, not an error. A WHERE amount >= 300 filters individual order rows before grouping: customer 502's rows (150 and 149) are both deleted, so 502 forms no group and vanishes from the report instead of appearing as 'occasional'; customer 505's five 70-amount orders are deleted too, erasing a 'regular' customer. HAVING filters groups after aggregation and is where an aggregate condition belongs. Customers with no orders are absent by construction — GROUP BY forms groups only from rows that exist — so surfacing them would require a customer dimension table and a LEFT JOIN that this single-table schema does not have.",
    ],
    edges: [
      "The 1000 boundary: customer 501's 600 + 400 totals exactly 1000 and must read 'big' — a > 1000 comparison demotes them to 'regular' with every other row unchanged, the quietest possible failure.",
      "The 300 boundary has teeth on both sides: 503's single 300 order is 'regular' while 502's 150 + 149 = 299 is 'occasional' — one unit of spend splits the segments, and >= is what keeps 503 on the right side.",
      "Customer 504 is big on ONE order (2500, order_count 1): segmenting on order count, on average order value, or on MAX(amount) alone misreads the spend profile — the rule keys on lifetime SUM, and 505's five 70s (350, 'regular', order_count 5) show many small orders buying a different segment than one huge one.",
      "WHERE amount >= 300 deletes 502's rows (150, 149) and all five of 505's 70s — both customers vanish instead of reporting 'occasional' and 'regular'; segment logic belongs after SUM, in the CASE or in HAVING.",
    ],
    ladder: [
      { title: "Brute force — bucket in application code", body: "Sum each customer's amounts into a map, then bucket the totals with an if-chain. Correct but manual, and it scatters the thresholds outside the query where no reviewer can see them against the data." },
      { title: "The pattern — GROUP BY plus a CASE over the SUM", body: "One grouped pass computes total_spent and order_count per customer; a CASE reading SUM(amount) assigns the segment with inclusive arms tested high-to-low." },
      { title: "The optimal idea — aggregate-first classification", body: "O(n). The durable rule: when a label is a function of an aggregate, it can only be computed after grouping — CASE in the SELECT or a condition in HAVING — and arm order encodes the bucket boundaries, so the highest threshold goes first." },
    ],
    approach: "GROUP BY customer with a CASE over SUM(amount), inclusive thresholds tested high-to-low",
    schema: {
      ddl: `CREATE TABLE CustomerOrder (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date  TEXT NOT NULL,  -- 'YYYY-MM-DD'
  amount      INTEGER NOT NULL
);`,
      seed: `INSERT INTO CustomerOrder (order_id, customer_id, order_date, amount) VALUES
  (1, 501, '2024-01-15', 600),
  (2, 501, '2024-03-02', 400),   -- lifetime 1000 exactly: big by the >= 1000 boundary
  (3, 502, '2024-01-20', 150),
  (4, 502, '2024-02-18', 149),   -- lifetime 299: occasional, one under the 300 line
  (5, 503, '2024-02-10', 300),   -- lifetime 300 exactly: regular by the >= 300 boundary
  (6, 504, '2024-01-05', 2500),  -- one huge order: big with order_count 1
  (7, 505, '2024-02-01', 70),
  (8, 505, '2024-02-14', 70),
  (9, 505, '2024-03-03', 70),
  (10, 505, '2024-03-27', 70),
  -- five small orders: regular, lifetime 350
  (11, 505, '2024-04-25', 70);`,
      tables: [
        { name: "CustomerOrder", note: "11 orders over 5 customers — lifetime totals 1000, 299, 300, 2500 and 350 straddle both thresholds" },
      ],
    },
    code: `SELECT
    customer_id,
    CASE
        WHEN SUM(amount) >= 1000 THEN 'big'        -- inclusive: exactly 1000 is big
        WHEN SUM(amount) >= 300  THEN 'regular'    -- tested second: 2500 never lands here
        ELSE 'occasional'                          -- everything under 300
    END AS segment,
    SUM(amount) AS total_spent,
    COUNT(*)    AS order_count
FROM CustomerOrder
GROUP BY customer_id
ORDER BY customer_id;`,
    walkthrough: [
      "GROUP BY customer_id forms five groups whose lifetime sums are 1000 (501), 299 (502), 300 (503), 2500 (504) and 350 (505), with order counts 2, 2, 1, 1 and 5.",
      "The CASE reads each total top-to-bottom: 1000 meets >= 1000 (big), 299 falls through both arms (occasional), 300 passes >= 300 (regular), 2500 meets >= 1000 first (big), 350 passes >= 300 (regular).",
      "ORDER BY customer_id ships (501, big, 1000, 2), (502, occasional, 299, 2), (503, regular, 300, 1), (504, big, 2500, 1), (505, regular, 350, 5) — the three boundary customers landing exactly as the thresholds dictate.",
    ],
    time: "O(n) — one grouped pass over the order rows",
    space: "O(c) — one row per customer with orders",
    followUps: [
      "Insert a 'vip' tier at 5000 and above — where does the new WHEN arm go, and what does customer 504 (2500) become if the arms are ordered low-to-high instead?",
      "Report zero-order customers as 'inactive' given a Customer dimension table — which join keeps them, what does SUM(amount) compute for an empty customer, and why does COALESCE belong beside it?",
    ],
    related: ["count-salary-categories", "the-category-of-each-member-in-the-store", "market-analysis-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "calculate-product-final-price",
    statement:
      "Product lists each item with its list price: (product_id, base_price). PriceRule lists percentage discounts that MAY apply to a product: (rule_id, product_id, discount_pct), where discount_pct is an integer between 0 and 50. A product can carry several rules, but discounts never stack: the final price applies the SINGLE LARGEST discount the product holds and nothing else. Report product_id, base_price, final_price — ordered by product_id ascending — where final_price is ROUND(base_price * (100 - max_discount) / 100.0, 2), and max_discount is the largest percentage among the product's rules, or 0 when the product has no rules at all (it then sells at base price).",
    examples: [
      {
        input: "product 101 lists at 400 and carries rules of 10 and 25 percent",
        output: "101 · 400 · 300.0",
        explanation:
          "The single largest discount (25) applies: 400 * 75 / 100 = 300. Stacking or summing both rules would wrongly price it at 260.",
      },
      {
        input: "product 103 lists at 550 and has no rules at all",
        output: "103 · 550 · 550.0",
        explanation:
          "No rules means max_discount 0: the LEFT JOIN keeps the product row and it sells at base price — an inner join would erase it silently.",
      },
    ],
    constraints: [
      "discounts never stack: only the product's single largest rule applies — rules of 10 and 25 mean 25, not 35 and not compounded percentages",
      "every product in Product appears exactly once — a product with no rules sells at base price, with max_discount treated as 0",
      "columns product_id, base_price, final_price — ordered by product_id ascending — with final_price = ROUND(base_price * (100 - max_discount) / 100.0, 2)",
    ],
    breakdown: [
      "The two tables sit at different grains — one row per product, many rows per product on the rule side — so the report is a join plus a grouped reduction. The join must be LEFT from Product: product 103 has no rule rows, and an inner join would erase it without any error, a silent subtraction rather than a crash. GROUP BY p.product_id, p.base_price then collapses each product's matched rule rows to one line, and MAX(r.discount_pct) reads the largest discount the product holds. The output grain — one row per product — is settled by the join direction and the grouping before any price arithmetic happens.",
      "The no-stack rule is a business fact, not a SQL detail: rules are alternatives, and the customer gets the single best one. MAX(discount_pct) is therefore the entire discount computation — not SUM, and not compounding the percentages. The seed makes the difference arithmetic-visible: product 101 holds 10 and 25, and stacking (or adding to 35) prices it at 260, while the largest-only rule prices it at 400 * 75 / 100 = 300. Whenever a spec says 'the best one applies', the aggregate is MAX and the wrong answers are sums and products.",
      "NULL arithmetic is where the no-rule product breaks naive formulas. For product 103 the LEFT JOIN produces a row with NULLs on the rule side, MAX over that empty match set is NULL, and 100 - NULL is NULL — so final_price would print NULL without a guard. COALESCE(MAX(r.discount_pct), 0) folds two cases into one: no rules (NULL becomes 0) and a rule of exactly 0 percent (already 0), both meaning 'sell at base'. The divisor is the other silent killer — SQLite truncates integer / integer, so 999 * 50 / 100 evaluates to 499 and the .50 vanishes before ROUND ever runs; dividing by 100.0 keeps the fraction.",
    ],
    edges: [
      "Product 101's two rules (10, 25) punish stacking: the correct output is 300.0 from the single 25 rule, while compounding (1 - 0.10) * (1 - 0.25) yields 270 and summing to 35 percent yields 260 — both are the planted wrong queries.",
      "Product 102's rule of exactly 0 percent must leave it in the report at 800.0: a HAVING MAX(discount_pct) > 0 or an inner-join formulation reclassifies 'no discount' as 'no rule' and silently drops a sellable product.",
      "Product 103 has no rule rows at all: without COALESCE(MAX(...), 0) the join's NULL poisons 100 - NULL and final_price prints NULL — the LEFT JOIN keeps the row, only the COALESCE prices it.",
      "Product 104's 999 at 50 percent is the rounding case: 999 * 50 / 100.0 = 499.5 with ROUND pinning two decimals, but the same expression divided by 100 truncates to 499 in SQLite's integer division — the .50 is exactly the half the wrong divisor eats.",
    ],
    ladder: [
      { title: "Brute force — scan each product's rules", body: "For each product, walk its rule rows, remember the largest percentage, apply it to the base price and remember products with no rules. Three bookkeeping duties the engine expresses as one LEFT JOIN, one MAX and one COALESCE." },
      { title: "The pattern — LEFT JOIN, group, MAX, guard the NULL", body: "LEFT JOIN PriceRule onto Product, GROUP BY the product, MAX(discount_pct) picks the winning rule, and COALESCE(..., 0) prices the no-rule product at base." },
      { title: "The optimal idea — the aggregate encodes the business rule", body: "O(p + r). The durable rules: join direction decides WHO appears (LEFT keeps the rule-less product), the aggregate decides WHAT applies (MAX, never SUM), and COALESCE folds 'no rules' into the same arithmetic as 'zero discount'." },
    ],
    approach: "LEFT JOIN rules onto products, GROUP BY product, COALESCE(MAX(discount_pct), 0) as the single largest discount",
    schema: {
      ddl: `CREATE TABLE Product (
  product_id INTEGER PRIMARY KEY,
  base_price INTEGER NOT NULL
);
CREATE TABLE PriceRule (
  rule_id      INTEGER PRIMARY KEY,
  product_id   INTEGER NOT NULL REFERENCES Product(product_id),
  discount_pct INTEGER NOT NULL CHECK (discount_pct BETWEEN 0 AND 50)
);`,
      seed: `INSERT INTO Product (product_id, base_price) VALUES
  (101, 400),  -- two rules: 10 and 25 — the 25 wins
  (102, 800),  -- a single 0 pct rule: sells at base
  -- no rules at all for 103: the LEFT JOIN keeps it at base
  -- 104's single 50 pct rule turns 999 into 499.5
  (103, 550),
  (104, 999);
INSERT INTO PriceRule (rule_id, product_id, discount_pct) VALUES
  (1, 101, 10),  -- the losing discount
  (2, 101, 25),  -- the winning discount: 400 at 25 pct = 300.0
  (3, 102, 0),   -- zero pct: matched, but changes nothing
  -- 999 at 50 pct: 499.5 (integer division would print 499)
  (4, 104, 50);`,
      tables: [
        { name: "Product", note: "4 products at base prices 400, 800, 550, 999 — 103 has no rules at all" },
        { name: "PriceRule", note: "4 rules — 101 carries two (10, 25), 102 carries a 0, 104 carries a single 50" },
      ],
    },
    code: `SELECT
    p.product_id,
    p.base_price,
    ROUND(
        p.base_price * (100 - COALESCE(MAX(r.discount_pct), 0)) / 100.0,
        2
    ) AS final_price               -- the single LARGEST discount, 0 when none
FROM Product p
LEFT JOIN PriceRule r
  ON r.product_id = p.product_id
GROUP BY p.product_id, p.base_price
ORDER BY p.product_id;`,
    walkthrough: [
      "The LEFT JOIN threads all four products through: 101 matches two rules (10, 25), 102 and 104 match one each (0 and 50), and 103 matches nothing, keeping its row with NULLs on the rule side.",
      "GROUP BY product collapses 101's two rows; MAX reads 25, 0, NULL and 50, and COALESCE turns the NULL into 0 — effective discounts 25, 0, 0, 50 on bases 400, 800, 550, 999.",
      "The priced rows ship ordered by product_id: (101, 400, 300.0), (102, 800, 800.0), (103, 550, 550.0), (104, 999, 499.5) — the stacked 270 for 101 and a NULL for 103 being the two planted failures.",
    ],
    time: "O(p + r) — one scan each of products and rules, hashed on the key",
    space: "O(p) — one group per product",
    followUps: [
      "Report the winning rule_id beside final_price — how do you fetch the ROW that wins the MAX (a join-back on the max discount, or ROW_NUMBER = 1), and what happens when two rules tie at the same percentage?",
      "Let discounts stack up to a hard 50 percent cap — which aggregation replaces MAX, and why does the cap turn a single aggregate into a two-step computation?",
    ],
    related: ["product-price-at-a-given-date", "npv-queries", "the-number-of-users-that-are-eligible-for-discount"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-top-performing-driver",
    statement:
      "DeliveryRun logs one row per completed delivery: (run_id, driver_id, on_time), where on_time is 1 when the run landed on schedule and 0 when it did not. Among drivers with AT LEAST 5 completed runs, find the driver with the highest on-time rate — the share of their runs that were on time. Output one row: driver_id, total_runs, on_time_rate, where on_time_rate is ROUND(100.0 * SUM(on_time) / COUNT(*), 2). Order by on_time_rate descending, then driver_id ascending, and keep the single top row. The seed guarantees a unique best rate among qualifying drivers, so the top row is unambiguous; on a genuine tie at the top, the report's policy would be to surface every tied driver instead of one.",
    examples: [
      {
        input: "driver 9 completed 5 runs, all 5 on time",
        output: "9 · 5 · 100.0",
        explanation:
          "Five runs clear the gate and a perfect rate tops the qualifying field — the single reported row.",
      },
      {
        input: "driver 4 completed 3 runs, all 3 on time",
        output: "(absent — under the 5-run gate)",
        explanation:
          "The rate is 100.0, but three completed runs is a sample too small to qualify; the gate excludes the driver rather than downscaling the rate.",
      },
    ],
    constraints: [
      "only drivers with at least 5 completed runs qualify — a perfect rate on a smaller sample is excluded, not downgraded",
      "on_time_rate is ROUND(100.0 * SUM(on_time) / COUNT(*), 2) — the on-time SHARE of the driver's runs, not the raw on-time count",
      "one output row: driver_id, total_runs, on_time_rate — ordered by on_time_rate descending then driver_id ascending, limited to the top row; this seed's best rate is unique, so the row is deterministic",
    ],
    breakdown: [
      "The metric is a ratio of two aggregates over the same group, which is why on_time being 0-or-1 matters: SUM(on_time) counts the runs that landed on schedule and COUNT(*) counts every completed run, and one divided by the other is the on-time share. The 100.0 multiplier sits before the division for the usual integer-division reason — SUM and COUNT both return integers, and SUM / COUNT alone would truncate the fraction away before any percentage exists. ROUND pins the rate to two decimals so the report prints one money-grade number per driver. AVG(on_time) * 100.0 is an equivalent formulation, since the mean of a 0/1 flag is the share of ones.",
      "The gate is an aggregate condition — 'at least 5 completed runs' is a fact about a GROUP, not about any single row — so it belongs in HAVING, where COUNT(*) is legal; a WHERE cannot see COUNT(*) because WHERE runs before groups exist. The gate is not bureaucracy: driver 4 is three-for-three, a perfect 100.0 that the report must nonetheless exclude, because a rate on three runs is noise that happens to look like perfection. Drop the HAVING and this seed turns actively hostile: drivers 4 and 9 tie at 100.0, and the ORDER BY's driver_id ASC tiebreaker then crowns driver 4 — the wrong winner with the smaller sample.",
      "The argmax is ORDER BY on_time_rate DESC, driver_id ASC LIMIT 1, and the tie policy is part of the contract rather than an afterthought. This seed guarantees a unique top rate among qualifying drivers — 9's 100.0 against 12's 80.0 — so LIMIT 1 is deterministic and reports exactly one row. On a genuine tie the policy is to report every tied driver, which LIMIT 1 cannot express: the tie-safe form is RANK() OVER (ORDER BY on_time_rate DESC) = 1 or a join on the rate equal to its own maximum. Choosing LIMIT 1 means choosing to lean on the seed's uniqueness, and the secondary driver_id key keeps the ORDER itself deterministic either way.",
    ],
    edges: [
      "The gate bites on a perfect small sample: driver 4 is 3-for-3 (100.0) and vanishes under HAVING COUNT(*) >= 5 — without it, (4, 3, 100.0) outranks (9, 5, 100.0) on the id tiebreak and the report crowns the 3-run driver.",
      "Rate, not count: driver 9 leads on SUM(on_time) (5) and on rate (100.0) here, but the ranked column is the ratio — a driver with more on-time runs off a larger denominator (6 of 8, a 75.0 rate) would win a count ranking and lose the rate ranking the task grades.",
      "The top rate is unique among qualifiers (100.0 versus 80.0), so LIMIT 1 ships exactly one row; a tie would need RANK() = 1 to honour the report-both policy, and LIMIT 1 alone would pick one of them arbitrarily.",
      "on_time is 0-or-1 with no NULLs, so COUNT(*) counts attempts and SUM(on_time) counts successes; COUNT(on_time) happens to equal COUNT(*) today, but a schema that recorded late runs as NULL would make the two disagree and the rate silently wrong.",
    ],
    ladder: [
      { title: "Brute force — tally per driver", body: "Count each driver's runs and on-time runs in a spreadsheet, drop anyone under 5 runs, compute rates and read the maximum. The engine does all four steps in one grouped pass with a HAVING." },
      { title: "The pattern — grouped rate, aggregate gate, ordered top-1", body: "GROUP BY driver_id computes total_runs and the rate; HAVING COUNT(*) >= 5 applies the sample gate; ORDER BY rate DESC, driver_id ASC with LIMIT 1 selects the winner." },
      { title: "The optimal idea — gates live in HAVING, argmax needs a tie policy", body: "O(n). The durable rules: an aggregate condition is a HAVING (WHERE cannot see groups), and ORDER BY ... LIMIT 1 as an argmax always states what a tie would do — here, the seed's unique top rate buys the simple form." },
    ],
    approach: "GROUP BY driver, HAVING COUNT(*) >= 5, ORDER BY on-time rate DESC then driver_id, LIMIT 1",
    schema: {
      ddl: `CREATE TABLE DeliveryRun (
  run_id    INTEGER PRIMARY KEY,
  driver_id INTEGER NOT NULL,
  on_time   INTEGER NOT NULL CHECK (on_time IN (0, 1))
);`,
      seed: `INSERT INTO DeliveryRun (run_id, driver_id, on_time) VALUES
  (1, 9, 1),
  (2, 9, 1),
  (3, 9, 1),
  (4, 9, 1),
  (5, 9, 1),    -- driver 9: five of five on time (rate 100.0)
  (6, 12, 1),
  (7, 12, 1),
  (8, 12, 1),
  (9, 12, 1),
  (10, 12, 0),  -- driver 12: four of five (rate 80.0, near miss)
  (11, 4, 1),
  (12, 4, 1),
  -- driver 4: three of three (rate 100.0, but under the gate)
  (13, 4, 1);`,
      tables: [
        { name: "DeliveryRun", note: "13 runs over 3 drivers — driver 9 is 5-for-5, driver 12 is 4-for-5, driver 4 is 3-for-3 and gate-excluded" },
      ],
    },
    code: `SELECT
    driver_id,
    COUNT(*) AS total_runs,
    ROUND(100.0 * SUM(on_time) / COUNT(*), 2) AS on_time_rate
FROM DeliveryRun
GROUP BY driver_id
HAVING COUNT(*) >= 5              -- the gate: small perfect samples do not qualify
ORDER BY on_time_rate DESC, driver_id ASC
-- the seed's unique top rate keeps this single-row LIMIT deterministic
LIMIT 1;`,
    walkthrough: [
      "GROUP BY driver_id forms three groups: driver 9 with 5 runs and 5 on-time, driver 12 with 5 runs and 4 on-time, driver 4 with 3 runs and 3 on-time.",
      "HAVING COUNT(*) >= 5 removes driver 4 despite its perfect rate; the surviving rates are ROUND(100.0 * 5 / 5, 2) = 100.0 for driver 9 and ROUND(100.0 * 4 / 5, 2) = 80.0 for driver 12.",
      "ORDER BY on_time_rate DESC, driver_id ASC puts (9, 5, 100.0) first and LIMIT 1 ships it alone — driver 12's near-miss row and the gate-excluded driver 4 never surface.",
    ],
    time: "O(n) — one grouped pass over the runs",
    space: "O(d) — one group per driver",
    followUps: [
      "Report every qualifying driver with their rate and a qualified flag — where does the gate live if it must annotate rather than filter, and what does driver 4's row show for on_time_rate?",
      "Make the gate size and the tie policy parameters — how does RANK() (or DENSE_RANK()) replace LIMIT 1, and what do the two functions disagree about when two drivers tie at the top?",
    ],
    related: ["tournament-winners", "queries-quality-and-percentage", "hopper-company-queries-ii"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-candidates-for-data-scientist-position-ii",
    statement:
      "Applicant stores one row per applicant skill: (applicant_id, skill, years) — exactly one row per (applicant, skill). A data-science hiring rule says an applicant QUALIFIES only if they hold MORE than 2 years of experience in AT LEAST TWO of these three skills: 'python', 'sql', 'tableau' (exact lowercase names). Every other skill is invisible to the rule, no matter how many years it carries. Report the single column applicant_id, ordered by applicant_id ascending, listing every applicant who qualifies.",
    examples: [
      {
        input: "applicant 601 holds python for 4 years and sql for 3 years",
        output: "601",
        explanation:
          "Two named skills, each strictly over 2 years — the applicant qualifies on the count, and no third skill is needed.",
      },
      {
        input: "applicant 605 holds python for 3 years and sql for 2 years",
        output: "(no row)",
        explanation:
          "The sql row sits at exactly 2 years and fails the strict > 2 bar, leaving one qualifying skill — one short of the required two.",
      },
    ],
    constraints: [
      "only 'python', 'sql' and 'tableau' (lowercase, exact) count toward the rule — any other skill is ignored regardless of its years",
      "the years bar is strict: MORE than 2 years per skill; exactly 2 years counts as nothing",
      "output is the single column applicant_id, ordered ascending; an applicant qualifies with two or more counting skills",
    ],
    breakdown: [
      "The rule counts SKILLS, and the query shape falls out of that noun: rows must be narrowed to the counted universe before any counting happens, groups form per applicant, and the group size decides the verdict. WHERE skill IN ('python', 'sql', 'tableau') AND years > 2 is the row filter — it deletes everything the rule cannot see — and HAVING COUNT(*) >= 2 is the group filter demanding two or more survivors. The two filters are not interchangeable: WHERE decides which ROWS may be counted, HAVING decides which GROUPS qualify. Reading the query aloud in that order is the fastest way to check it matches the rule.",
      "The IN-list is load-bearing, not cosmetic. Applicant 603 carries sql for 3 years and r for 5 — the deepest experience in the seed — and without the skill filter both rows reach the group, COUNT hits 2, and 603 wrongly qualifies on a skill the rule has never heard of. The years bar is equally strict and equally per-row: 604's sql row sits at exactly 2 years and counts as nothing, so 604 qualifies on python and tableau alone. Applicant 605 — python at 3, sql at exactly 2 — holds only ONE counting skill and stays out; under a >= 2 misreading its sql row would count and 605 would cross the line, which is why the seed pairs 601 (sql 3, in) against 605 (sql 2, out) on the same skill set.",
      "COUNT(*) is safe here only because the schema promises one row per (applicant, skill): after the WHERE filter, each surviving row IS one qualifying skill. If the table could hold duplicate (applicant, skill) rows — reassessments, retaken checks — the same query would double-count a skill and COUNT(DISTINCT skill) would become the correct form. The output needs only applicant_id, so no join, no window and no second pass is required: this is a filter-shape problem, and its whole difficulty is deciding what gets counted. Skill names match exactly as stored — lowercase literals — because SQLite string comparison is case-sensitive by default.",
    ],
    edges: [
      "The > 2 boundary bites both ways: 605's sql at exactly 2 does not count (605 out with one qualifying skill) while 606's sql and tableau at exactly 3 both do (606 in) — a >= 2 misreading promotes 605 into the output.",
      "The IN-list punishes the missing filter: 603's r row (5 years, the seed's largest experience) must be invisible — without skill IN (...), 603 counts two rows and wrongly qualifies on a skill the rule does not recognise.",
      "The count threshold: HAVING COUNT(*) >= 2 keeps 601 (python and sql) and rejects 605 (python only, after the years filter); writing > 2 instead demands three skills and wrongly drops 601 and 606.",
      "602's tableau row at 1 year must die at the WHERE stage — if it reaches the group, 602 counts two rows and qualifies; the years bar is per-row, not a per-applicant maximum.",
    ],
    ladder: [
      { title: "Brute force — scan each applicant's skills", body: "For each applicant, walk their skill rows, tally the named skills with over two years and keep anyone reaching two. The engine expresses the tally as a filtered GROUP BY with a HAVING." },
      { title: "The pattern — row filter, group filter", body: "WHERE skill IN ('python', 'sql', 'tableau') AND years > 2 prunes rows to the counted universe; GROUP BY applicant_id and HAVING COUNT(*) >= 2 promote the applicants with two or more survivors." },
      { title: "The optimal idea — decide what counts, then count it", body: "O(n). The durable rule: eligibility-by-qualifying-rows is WHERE (which rows are countable) plus HAVING (how many are needed) — and every relaxation of either filter changes the verdict of some concrete applicant." },
    ],
    approach: "WHERE skill IN (three named) AND years > 2, GROUP BY applicant, HAVING COUNT(*) >= 2",
    schema: {
      ddl: `CREATE TABLE Applicant (
  applicant_id INTEGER NOT NULL,
  skill        TEXT NOT NULL,
  years        INTEGER NOT NULL,
  PRIMARY KEY (applicant_id, skill)
);`,
      seed: `INSERT INTO Applicant (applicant_id, skill, years) VALUES
  (601, 'python', 4),
  (601, 'sql', 3),      -- both over two: 601 qualifies
  (602, 'python', 3),
  (602, 'tableau', 1),  -- one year: fails the strict > 2 bar
  (603, 'sql', 3),
  (603, 'r', 5),        -- r is not one of the three counted skills
  (604, 'python', 5),
  (604, 'sql', 2),      -- exactly two: does not count
  (604, 'tableau', 4),  -- 604 rides in on python plus tableau
  (605, 'python', 3),
  (605, 'sql', 2),      -- exactly two again: 605 stays out (601 vs 605 contrast)
  (606, 'sql', 3),
  -- boundary years on both: 606 qualifies
  (606, 'tableau', 3);`,
      tables: [
        { name: "Applicant", note: "13 rows over 6 applicants — one row per (applicant, skill); r at 5 years is the seed's largest experience and counts for nothing" },
      ],
    },
    code: `SELECT applicant_id
FROM Applicant
WHERE skill IN ('python', 'sql', 'tableau')  -- only the three named skills count
  AND years > 2                              -- strictly more than two, per skill
GROUP BY applicant_id
HAVING COUNT(*) >= 2                         -- at least two qualifying skills
ORDER BY applicant_id;`,
    walkthrough: [
      "WHERE keeps only rows for the three named skills with years > 2: 601 keeps both rows, 602 keeps python (tableau's 1 year dies), 603 keeps sql (r dies), 604 keeps python and tableau (sql's exactly-2 dies), 605 keeps python (sql's exactly-2 dies), 606 keeps both.",
      "GROUP BY applicant_id and HAVING COUNT(*) >= 2 keep the applicants holding two surviving rows — 601, 604, 606 — and drop 602, 603 and 605 at one surviving row each.",
      "ORDER BY applicant_id ships the single column as three rows: 601, 604, 606 — the boundary pair 601/605 split by one year of sql.",
    ],
    time: "O(n) — one filtered scan grouped by applicant",
    space: "O(a) — one group per applicant",
    followUps: [
      "Emit every applicant with their qualifying-skill count, rejected applicants included — why does the filtered GROUP BY hide 605, and which shape (a conditional SUM over a plain GROUP BY) surfaces the ones with zero or one?",
      "Drive the skill list from a JobRequirement table instead of literals — how does the IN-list become a join, and where must the years filter live relative to that join?",
    ],
    related: ["find-candidates-for-data-scientist-position", "find-interview-candidates", "accepted-candidates-from-the-interviews"],
    order: "exact",
    xp: 20,
  },
];
