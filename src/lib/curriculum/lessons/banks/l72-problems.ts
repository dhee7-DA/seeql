// Lesson 72 — the metrics mart: from star to one-pager, gated.
// Mart numbers: 8 grid cells (2024 Q×dept), margin Tech 14227.42/Lifestyle 1263.24,
// top-buyer shares 21.8% (2024) / 31.1% (2025).

export const ROWS: import("./l64-util").ProbRowX[] = [
  ["The mart's grain", "A mart is a fact about facts: one row per quarter × department, 2024. Build the grid with its share of quarter — eight rows, the one-pager's core.", ["Aggregate the star (two joins), then window the share over the quarter partition.", "Columns: year, quarter, department, net_dollars, share_of_quarter_pct."], "hard",
    `SELECT dd.year, dd.quarter, d.department,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars,
       ROUND(SUM(f.net_cents) * 100.0
             / SUM(SUM(f.net_cents)) OVER (PARTITION BY dd.quarter), 1) AS share_of_quarter_pct
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
WHERE dd.year = 2024
GROUP BY dd.year, dd.quarter, d.department
ORDER BY dd.year, dd.quarter, net_dollars DESC;`,
    [["over\\s*\\(\\s*\\)", "The parent is the QUARTER — an empty OVER shares against the company and breaks the 100% contract."],
     ["order.*share", "The grid reads calendar-first: quarter, then biggest department — not ranked by share."]], true],
  ["Make it a table", "Marts materialize: CREATE TABLE mart_department_quarter holding the 2024 grid (with the share column). Verify: 8 rows.", ["CREATE TABLE … AS SELECT — the lesson-68 grid, materialized.", "The window computes on the grouped set before the CREATE lands."], "hard",
    `CREATE TABLE mart_department_quarter AS
SELECT dd.year, dd.quarter, d.department,
       SUM(f.net_cents) AS net_cents,
       ROUND(SUM(f.net_cents) * 100.0
             / SUM(SUM(f.net_cents)) OVER (PARTITION BY dd.quarter), 1) AS share_of_quarter_pct
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
WHERE dd.year = 2024
GROUP BY dd.year, dd.quarter, d.department;`,
    [["round.*net_cents\\s*,", "Keep the mart's measure in CENTS (integer, additive); dollars are a display concern at read time."],
     ["drop\\s+table", "The sandbox rolls back — no drops needed; the build is atomic."]], false,
    `SELECT COUNT(*) AS mart_rows FROM mart_department_quarter;`, true],
  ["The gate: grain", "Quality gate 1 — the mart's own grain receipt: mart rows (8) must equal distinct quarter×department pairs (8). One row, both counts.", ["COUNT(*) and COUNT(DISTINCT year || '-' || quarter || '-' || department) on the mart build — inline, not from the sandboxed table.", "Equality is the gate."], "medium",
    `SELECT
  (SELECT COUNT(*) FROM (
     SELECT dd.year, dd.quarter, d.department FROM fact_sales f
     JOIN dim_date dd ON dd.date_key = f.date_key
     JOIN dim_product d ON d.product_key = f.product_key
     WHERE dd.year = 2024
     GROUP BY dd.year, dd.quarter, d.department)) AS mart_rows,
  (SELECT COUNT(DISTINCT dd.year || '-' || dd.quarter || '-' || d.department)
     FROM fact_sales f
     JOIN dim_date dd ON dd.date_key = f.date_key
     JOIN dim_product d ON d.product_key = f.product_key
     WHERE dd.year = 2024) AS distinct_cells;`,
    [["distinct\\s+quarter\\s*$", "The cell key is the CONJUNCTION — quarter alone collapses both departments."],
     ["8\\s*=\\s*8", "Compute both sides — hardcoding the gate defeats the gate."]]],
  ["The gate: reconciliation", "Quality gate 2 — the mart must reconcile to the star: the mart's total net (2024) equals the fact's 2024 net. One row, two sums, equal.", ["SUM over the grouped 2024 grid vs SUM over the fact filtered to 2024 — the same money, two paths.", "Money stays integer cents in the comparison."], "medium",
    `SELECT
  (SELECT SUM(net_cents) FROM (
     SELECT dd.quarter, d.department, SUM(f.net_cents) AS net_cents
     FROM fact_sales f
     JOIN dim_date dd ON dd.date_key = f.date_key
     JOIN dim_product d ON d.product_key = f.product_key
     WHERE dd.year = 2024
     GROUP BY dd.quarter, d.department)) AS mart_total_cents,
  (SELECT SUM(net_cents) FROM fact_sales fs
     JOIN dim_date dd2 ON dd2.date_key = fs.date_key
     WHERE dd2.year = 2024) AS fact_total_cents;`,
    [["sum.*share", "The reconciliation is on the MEASURE (cents), never on the share column."],
     ["round", "Compare raw cents — rounding before comparing can manufacture a fake mismatch."]]],
  ["The gate: shares", "Quality gate 3 — every quarter's shares sum to 100 (±0.1 rounding slack). Return per-quarter sums and the count of violations.", ["SUM(share) OVER (PARTITION BY quarter) on the grid build; violations = |sum − 100| > 0.1.", "Rounding slack is honest; structural drift is not."], "hard",
    `SELECT COUNT(*) AS broken_quarters
FROM (
  SELECT quarter, SUM(share) AS share_sum
  FROM (
    SELECT dd.quarter AS quarter,
           ROUND(SUM(f.net_cents) * 100.0
                 / SUM(SUM(f.net_cents)) OVER (PARTITION BY dd.quarter), 1) AS share
    FROM fact_sales f
    JOIN dim_date dd ON dd.date_key = f.date_key
    JOIN dim_product d ON d.product_key = f.product_key
    WHERE dd.year = 2024
    GROUP BY dd.quarter, d.department
  )
  GROUP BY quarter
)
WHERE ABS(share_sum - 100) > 0.1;`,
    [["share_sum\\s*=\\s*100", "Exact equality fails on rounding — the gate allows ±0.1; state the slack."],
     ["over\\s*\\(\\s*\\)", "The check is per QUARTER — the partition must match the share's parent."]]],
  ["Margin joins the mart", "The one-pager's second measure: margin (net − quantity × unit cost) beside net, per department, all-time. The dim's cost column earns its keep.", ["Aggregate net and margin in the same GROUP BY — both ride the fact×dim scan.", "ROUND each to dollars."], "medium",
    `SELECT d.department,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars,
       ROUND(SUM(f.net_cents - f.quantity * d.unit_cost_cents) / 100.0, 2) AS margin_dollars
FROM fact_sales f
JOIN dim_product d ON d.product_key = f.product_key
GROUP BY d.department
ORDER BY margin_dollars DESC;`,
    [["gross", "Margin prices NET (post-promo) against cost — gross overstates profit by the promo amount."],
     ["sum\\(d\\.unit_cost_cents\\)", "Cost multiplies each line's quantity first — the dim attribute is per-unit."]], true],
  ["Refund-adjusted", "The honest bottom line: net minus refunds per department — the mart's third measure, two facts, one dim, aggregate-then-join.", ["Sales CTE, refunds CTE, LEFT join, net − refunds as the adjusted column.", "Refunds default to 0 where a department had none."], "hard",
    `WITH sales AS (
  SELECT d.department, SUM(f.net_cents) AS net_cents
  FROM fact_sales f JOIN dim_product d ON d.product_key = f.product_key
  GROUP BY d.department
),
refunds AS (
  SELECT d.department, SUM(r.refund_cents) AS refund_cents
  FROM fact_returns r JOIN dim_product d ON d.product_key = r.product_key
  GROUP BY d.department
)
SELECT s.department,
       ROUND((s.net_cents - COALESCE(r.refund_cents, 0)) / 100.0, 2) AS adjusted_net_dollars
FROM sales s
LEFT JOIN refunds r ON r.department = s.department
ORDER BY adjusted_net_dollars DESC;`,
    [["sum\\(f\\.net_cents\\s*-\\s*r\\.refund", "Subtracting across a fact-fact join fans out — adjust the AGGREGATES."],
     ["coalesce.*net", "COALESCE guards the REFUND side — sales is the driver."]], true],
  ["The board sentence", "One row: 2024's best quarter (by net), its net dollars, and that quarter's top department. The executive summary as a SELECT.", ["Subquery for the best quarter (ORDER BY SUM DESC LIMIT 1); the department via the grid's rank — or two scalars.", "Keep it one row: scalar subqueries over the grouped grid."], "hard",
    `SELECT
  (SELECT dd.quarter FROM fact_sales f
     JOIN dim_date dd ON dd.date_key = f.date_key
     WHERE dd.year = 2024
     GROUP BY dd.quarter ORDER BY SUM(f.net_cents) DESC LIMIT 1) AS best_quarter,
  (SELECT ROUND(SUM(f.net_cents) / 100.0, 2) FROM fact_sales f
     JOIN dim_date dd ON dd.date_key = f.date_key
     WHERE dd.year = 2024
     GROUP BY dd.quarter ORDER BY SUM(f.net_cents) DESC LIMIT 1) AS best_quarter_net,
  (SELECT d.department FROM fact_sales f
     JOIN dim_date dd ON dd.date_key = f.date_key
     JOIN dim_product d ON d.product_key = f.product_key
     WHERE dd.year = 2024
     GROUP BY dd.quarter, d.department ORDER BY SUM(f.net_cents) DESC LIMIT 1) AS top_department;`,
    [["group.*best", "Three scalars, one row — no outer grouping."],
     ["max\\(", "MAX finds the value; the ORDER-LIMIT pattern finds the ROW that owns it."]]],
  ["Honest zeros on the calendar", "The mart must not skip silence: months with zero RETURNS. Drive the 14-month spine with a LEFT JOIN to the aggregated refunds — count the zero months.", ["Spine months LEFT JOIN refunds-by-month; count months whose refund IS NULL.", "The spine's completeness (lesson 66) is what makes zeros visible."], "medium",
    `SELECT COUNT(*) AS zero_return_months
FROM (
  SELECT DISTINCT dd.month
  FROM dim_date dd
  WHERE dd.month BETWEEN '2024-01' AND '2025-02'
) m
LEFT JOIN (
  SELECT dd.month, SUM(r.refund_cents) AS refund_cents
  FROM fact_returns r
  JOIN dim_date dd ON dd.date_key = r.date_key
  GROUP BY dd.month
) r ON r.month = m.month
WHERE r.month IS NULL;`,
    [["having\\s+sum.*=\\s*0", "HAVING sees only months WITH returns — the zeros live in the LEFT JOIN's NULL side."],
     ["join\\s+fact_returns\\s+directly", "Join the spine to the AGGREGATE — a raw fact join multiplies months."]]],
  ["Concentration, gated", "The governance line on the one-pager: top buyer's share per year (two rows). The lesson-68 layered pattern, now the mart's risk column.", ["Three layers: buyer grid → year total → rank-1 rows.", "Share to one decimal; both years appear."], "hard",
    `SELECT year, net_dollars,
       ROUND(net_dollars * 100.0 / year_total, 1) AS top_buyer_share_pct
FROM (
  SELECT *, SUM(net_dollars) OVER (PARTITION BY year) AS year_total
  FROM (
    SELECT dd.year, SUM(f.net_cents) / 100.0 AS net_dollars,
           ROW_NUMBER() OVER (PARTITION BY dd.year ORDER BY SUM(f.net_cents) DESC) AS rn
    FROM fact_sales f
    JOIN dim_date dd ON dd.date_key = f.date_key
    GROUP BY dd.year, f.customer_key
  )
)
WHERE rn = 1
ORDER BY year;`,
    [["where\\s+rn\\s*=\\s*1.*over", "The year total must see ALL buyers — the rank filter waits for the outer layer."],
     ["customer_id", "Group by customer_key (the frozen version) — buyer identity rides the surrogate."]], true],
  ["The load receipt", "The mart's provenance: source lines (239), fact lines (239), cancelled lines excluded (10), mart cells (8). One row — the whole chain, counted.", ["Four scalar subqueries: order_items total, fact count, cancelled lines, the 2024 grid count.", "Each number audits the previous stage's rule."], "medium",
    `SELECT
  (SELECT COUNT(*) FROM order_items) AS source_lines,
  (SELECT COUNT(*) FROM fact_sales) AS fact_lines,
  (SELECT COUNT(*) FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE o.status = 'cancelled') AS cancelled_dropped,
  (SELECT COUNT(*) FROM (
     SELECT dd.quarter, d.department FROM fact_sales f
     JOIN dim_date dd ON dd.date_key = f.date_key
     JOIN dim_product d ON d.product_key = f.product_key
     WHERE dd.year = 2024
     GROUP BY dd.quarter, d.department)) AS mart_cells;`,
    [["join\\s+orders", "The cancelled audit is the ONE place the mart's lineage reaches back to operations — by design."],
     ["distinct", "Each count is a plain count over its stage."]]],
  ["The rebuild proof", "Idempotence at the mart: build the 2024 grid twice in one row — two identical SUMs of net. Same star in, same mart out.", ["Two scalar subqueries running the same grouped SUM.", "Determinism is the mart's license to be materialized."], "easy",
    `SELECT
  (SELECT SUM(net_cents) FROM (
     SELECT dd.quarter, d.department, SUM(f.net_cents) AS net_cents
     FROM fact_sales f JOIN dim_date dd ON dd.date_key = f.date_key
     JOIN dim_product d ON d.product_key = f.product_key
     WHERE dd.year = 2024
     GROUP BY dd.quarter, d.department)) AS build_one,
  (SELECT SUM(net_cents) FROM (
     SELECT dd.quarter, d.department, SUM(f.net_cents) AS net_cents
     FROM fact_sales f JOIN dim_date dd ON dd.date_key = f.date_key
     JOIN dim_product d ON d.product_key = f.product_key
     WHERE dd.year = 2024
     GROUP BY dd.quarter, d.department)) AS build_two;`,
    [["random|now", "Any nondeterminism breaks the proof — the star's loads are deterministic."],
     ["distinct", "The grid's SUM is plain aggregation — no dedupe involved."]]],
  ["The handoff", "The mart's consumer reads it blind: from the 2024 grid (inline), return quarter, department and net DOLLARS for Q4 only, ordered by net DESC — the dashboard's WHERE, applied at read time.", ["The grouped grid, filtered to quarter = 4, rounded at display.", "Dollars conversion happens ONCE, at read."], "easy",
    `SELECT dd.quarter, d.department,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
WHERE dd.year = 2024 AND dd.quarter = 4
GROUP BY dd.quarter, d.department
ORDER BY net_dollars DESC;`,
    [["year", "The mart is already 2024-scoped — the consumer filters the mart's grain (quarter), not the source's year."],
     ["group.*year", "Grouping by year inside a year-scoped mart is dead weight."]], true],
  ["The one-pager, assembled", "Everything on one row per department: net, margin, refunds, adjusted net, 2024 share of company. The capstone SELECT — four measures, two facts, one dim.", ["Sales CTE (net + margin), refunds CTE, LEFT join, company share from an empty-OVER window on the sales CTE.", "Share to one decimal; refund default 0."], "hard",
    `WITH sales AS (
  SELECT d.department,
         SUM(f.net_cents) AS net_cents,
         SUM(f.net_cents - f.quantity * d.unit_cost_cents) AS margin_cents
  FROM fact_sales f JOIN dim_product d ON d.product_key = f.product_key
  GROUP BY d.department
),
refunds AS (
  SELECT d.department, SUM(r.refund_cents) AS refund_cents
  FROM fact_returns r JOIN dim_product d ON d.product_key = r.product_key
  GROUP BY d.department
)
SELECT s.department,
       ROUND(s.net_cents / 100.0, 2) AS net_dollars,
       ROUND(s.margin_cents / 100.0, 2) AS margin_dollars,
       ROUND(COALESCE(r.refund_cents, 0) / 100.0, 2) AS refund_dollars,
       ROUND((s.net_cents - COALESCE(r.refund_cents, 0)) / 100.0, 2) AS adjusted_net_dollars,
       ROUND(s.net_cents * 100.0 / SUM(s.net_cents) OVER (), 1) AS share_of_company_pct
FROM sales s
LEFT JOIN refunds r ON r.department = s.department
ORDER BY s.net_cents DESC;`,
    [["partition\\s+by\\s+department", "The company share's parent is the COMPANY — the empty OVER ( )."],
     ["fact_sales.*join.*fact_returns", "The two facts meet at the AGGREGATES — never at the rows."]], true],
];
