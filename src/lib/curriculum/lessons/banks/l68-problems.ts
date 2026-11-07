// Lesson 68 — OLAP grammar problems: rollups, drill-downs, pivots, ratios.

export const ROWS: import("./l64-util").ProbRowX[] = [
  ["The quarter rollup", "Net dollars per quarter across the whole window — five rows (2024 Q1–Q4, 2025 Q1), calendar order. The board's first number.", ["Join dim_date; GROUP BY year, quarter; ORDER BY year, quarter.", "Money leaves as ROUND(SUM(net_cents)/100.0, 2)."], "easy",
    `SELECT dd.year, dd.quarter,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
GROUP BY dd.year, dd.quarter
ORDER BY dd.year, dd.quarter;`,
    [["order\\s+by.*desc", "Calendar order — rollups read as time, not as rankings."], ["month", "Quarters, not months — the rollup's whole point is fewer, fatter rows."]], true],
  ["Drill into Q1", "The follow-up question every board asks: WHICH month? Net dollars per month of 2024-Q1 — three rows, month order. The drill-down is the same query with one more dimension column.", ["Add month to the GROUP BY; filter year = 2024 AND quarter = 1.", "month is the spine's 'YYYY-MM' text — sorts naturally."], "easy",
    `SELECT dd.month, dd.month_name,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
WHERE dd.year = 2024 AND dd.quarter = 1
GROUP BY dd.month, dd.month_name
ORDER BY dd.month;`,
    [["quarter\\s+in\\s*\\(1", "The spine has year AND quarter — one equality each beats arithmetic on the month string."], ["order\\s+by.*desc", "Calendar order: the drill reads as time."]], true],
  ["The pivot", "Departments as columns: net dollars per department per quarter of 2024 — four rows, four CASE-sums, quarters down the side. SQLite has no PIVOT keyword; CASE is the pivot.", ["SUM(CASE WHEN dd.quarter = 1 THEN f.net_cents END) … ×4, grouped by year+department.", "ROUND each column; COALESCE not needed — SUM skips the NULLs."], "hard",
    `SELECT dd.year, d.department,
       ROUND(SUM(CASE WHEN dd.quarter = 1 THEN f.net_cents END) / 100.0, 2) AS q1,
       ROUND(SUM(CASE WHEN dd.quarter = 2 THEN f.net_cents END) / 100.0, 2) AS q2,
       ROUND(SUM(CASE WHEN dd.quarter = 3 THEN f.net_cents END) / 100.0, 2) AS q3,
       ROUND(SUM(CASE WHEN dd.quarter = 4 THEN f.net_cents END) / 100.0, 2) AS q4
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
WHERE dd.year = 2024
GROUP BY dd.year, d.department
ORDER BY d.department;`,
    [["else\\s+0", "Unneeded — SUM ignores NULL, so absent quarters read NULL (honest) instead of 0 (invented)."], ["pivot", "There is no PIVOT in SQLite — the CASE ladder IS the pivot here."]], true],
  ["Share of company", "Ratio-to-parent at the top: each department's share of total net — two rows, one decimal. The parent is the whole fact.", ["Window over the grouped set: SUM(SUM(net)) OVER () — empty OVER is the company.", "share = department net × 100.0 / company net, rounded to 1."], "medium",
    `SELECT d.department,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars,
       ROUND(SUM(f.net_cents) * 100.0 / SUM(SUM(f.net_cents)) OVER (), 1) AS share_pct
FROM fact_sales f
JOIN dim_product d ON d.product_key = f.product_key
GROUP BY d.department
ORDER BY net_dollars DESC;`,
    [["over\\s*\\(\\s*partition", "PARTITION BY department makes the parent equal the child — 100% everywhere. The company needs the empty OVER ( )."], ["avg\\(", "A ratio of sums, not an average of ratios — compute on the additive base."]], true],
  ["Share of quarter", "One level deeper: each department-quarter's share of ITS quarter — eight rows. The parent moves to the partition: same query, new OVER clause.", ["SUM(SUM(net)) OVER (PARTITION BY year, quarter) is the quarter's total.", "Filter to 2024; order quarter then department."], "medium",
    `SELECT dd.quarter, d.department,
       ROUND(SUM(f.net_cents) * 100.0
             / SUM(SUM(f.net_cents)) OVER (PARTITION BY dd.quarter), 1) AS share_of_quarter_pct
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
WHERE dd.year = 2024
GROUP BY dd.quarter, d.department
ORDER BY dd.quarter, d.department;`,
    [["over\\s*\\(\\s*\\)", "The empty OVER shares against the company — the parent here is the QUARTER."], ["where.*department", "No department filter — both departments' shares must sum to 100 per quarter."]], true],
  ["Top product per quarter", "The champion drill: each 2024 quarter's biggest product by net — product name, quarter, net. Five windows deep but only one layered SELECT.", ["Inner layer: quarter × product net + ROW_NUMBER partitioned by quarter ordered by net DESC; outer: rn = 1.", "Join dim_product for the name in the outer SELECT — or carry it through."], "hard",
    `SELECT quarter, product_name,
       ROUND(net_cents / 100.0, 2) AS net_dollars
FROM (
  SELECT dd.quarter, d.name AS product_name,
         SUM(f.net_cents) AS net_cents,
         ROW_NUMBER() OVER (PARTITION BY dd.quarter ORDER BY SUM(f.net_cents) DESC) AS rn
  FROM fact_sales f
  JOIN dim_date dd ON dd.date_key = f.date_key
  JOIN dim_product d ON d.product_key = f.product_key
  WHERE dd.year = 2024
  GROUP BY dd.quarter, d.product_key, d.name
)
WHERE rn = 1
ORDER BY quarter;`,
    [["order.*limit\\s+1", "LIMIT 1 per query is ONE champion overall — the per-quarter champion needs ROW_NUMBER, then rn = 1."], ["max\\(net", "MAX gives the VALUE, not the row that owns it — the window picks the winner row."]], true],
  ["Concentration by year", "The board's governance question: the top buyer's share of each year's net. Two rows — is any year owned by one account? (Layered: buyer grid → rank → year total → top row.)", ["Three layers: per (year, buyer) net; rank within year; SUM(net) OVER (PARTITION BY year) as the total; outer keeps rank = 1.", "Share to one decimal."], "hard",
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
    [["sum\\(sum\\(f\\.net_cents\\)\\)\\s+over", "The outer window can't see the fact's columns — it works on the layered (grouped) rows: SUM(net_dollars) OVER (…)."], ["where\\s+rn\\s*=\\s*1.*over", "Filtering rn = 1 BEFORE computing the window would leave one row per year — share 100%. The total layer must see all buyers."]], true],
  ["The month trend", "Net dollars per month, 14 rows, with the month-over-month delta beside each — LAG on the grouped set. The trend is the grammar's time move.", ["Inner: monthly net; outer: LAG(net_dollars) and the delta in dollars.", "First month's delta is NULL — honest, not zero."], "medium",
    `SELECT month, net_dollars,
       ROUND(net_dollars - LAG(net_dollars) OVER (ORDER BY month), 2) AS mom_delta
FROM (
  SELECT dd.month, SUM(f.net_cents) / 100.0 AS net_dollars
  FROM fact_sales f
  JOIN dim_date dd ON dd.date_key = f.date_key
  GROUP BY dd.month
)
ORDER BY month;`,
    [["lag.*over\\s*\\(\\s*\\)", "LAG needs the time ORDER — OVER (ORDER BY month); the empty frame has no sequence."], ["percent", "Dollars first — the brief asks the delta in dollars; percentage is next lesson's ratio grammar."]], true],
  ["Weekend economics", "The spine's flag at work: net dollars and line counts for weekend vs weekday — two rows, zero date math in the query.", ["GROUP BY dd.is_weekend; the flag is 0/1.", "Label with CASE for readability — weekday/weekend."], "easy",
    `SELECT CASE dd.is_weekend WHEN 1 THEN 'weekend' ELSE 'weekday' END AS day_class,
       COUNT(*) AS lines,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
GROUP BY dd.is_weekend
ORDER BY net_dollars DESC;`,
    [["strftime\\('%w'", "Re-deriving weekday is the pre-spine habit — is_weekend already answers."], ["where\\s+is_weekend", "Both classes, one query — the comparison IS the answer."]], true],
  ["The mix trend", "Department share of monthly net — 28 rows (14 months × 2 departments), month then department. The mix's drift IS the trend: Tech's share wobbling month to month.", ["Group to month × department; share partitioned by month; order month, department.", "Share to one decimal."], "hard",
    `SELECT dd.month, d.department,
       ROUND(SUM(f.net_cents) * 100.0
             / SUM(SUM(f.net_cents)) OVER (PARTITION BY dd.month), 1) AS share_of_month_pct
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
GROUP BY dd.month, d.department
ORDER BY dd.month, d.department;`,
    [["partition\\s+by\\s+dd\\.month,\\s*d\\.department", "The parent is the MONTH — partitioning by both makes every share 100%."],
     ["avg\\(", "Ratio of sums, computed on the grouped set — an average of per-line ratios overweights tiny lines."]], true],
  ["The Pareto census", "How concentrated is the catalog? Rank products by net (all of them), carry the running total and each rank's cumulative share — the Pareto ladder, biggest product first.", ["Inner: per-product net + RANK; middle: SUM(net) OVER (ORDER BY net DESC) running and ÷ grand total.", "Grand total: SUM over the grouped set with empty OVER — or a cross join to a totals row."], "hard",
    `SELECT name, net_dollars, rk,
       ROUND(running * 100.0 / grand, 1) AS cumulative_share_pct
FROM (
  SELECT *, SUM(net_dollars) OVER (ORDER BY net_dollars DESC) AS running,
         SUM(net_dollars) OVER () AS grand
  FROM (
    SELECT d.name, SUM(f.net_cents) / 100.0 AS net_dollars,
           ROW_NUMBER() OVER (ORDER BY SUM(f.net_cents) DESC) AS rk
    FROM fact_sales f
    JOIN dim_product d ON d.product_key = f.product_key
    GROUP BY d.product_key, d.name
  )
)
ORDER BY rk;`,
    [["order\\s+by.*asc", "Pareto reads biggest first — the running total must follow net DESC to mean 'top-N share'."], ["running.*partition", "No partition — the ladder runs across ALL products; partitioning would restart it per group."]], false],
  ["Rank within department", "Every product ranked by net INSIDE its department — the drill-down with ordering: department, rank, name, net. Ties share a rank (RANK, not ROW_NUMBER).", ["RANK() OVER (PARTITION BY department ORDER BY SUM(net) DESC) on the grouped set.", "Order the output department, rank, name."], "medium",
    `SELECT d.department,
       RANK() OVER (PARTITION BY d.department ORDER BY SUM(f.net_cents) DESC) AS rk,
       d.name,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_product d ON d.product_key = f.product_key
GROUP BY d.department, d.product_key, d.name
ORDER BY d.department, rk, d.name;`,
    [["row_number", "ROW_NUMBER breaks ties arbitrarily — the brief says ties share a rank: RANK."], ["order\\s+by\\s+net\\s+desc\\s*$", "Within-department ranks: order the OUTPUT by department then rank."]], true],
  ["The UNION rollup", "Monthly net for Tech PLUS a company-total row appended — one result set, two granularities. GROUPING SETS doesn't exist in SQLite; UNION ALL is the rollup.", ["Two SELECTs: monthly Tech lines, then a single total row with month = 'ALL'; UNION ALL stacks them.", "Order: month ascending, the ALL row last (or first — declare it)."], "medium",
    `SELECT dd.month, ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
WHERE d.department = 'Tech'
GROUP BY dd.month
UNION ALL
SELECT 'ALL', ROUND(SUM(f.net_cents) / 100.0, 2)
FROM fact_sales f;`,
    [["union\\s+(all)?\\s*$|union\\s+select", "UNION ALL keeps both granularities — a plain UNION would dedupe (harmless here, but the ALL states intent)."], ["rollup", "SQLite has no ROLLUP/GROUPING SETS — stacked UNION ALL is the grammar."]], true],
  ["Three-month smoothing", "The 3-month moving average of monthly net — the trend under the noise. Rows BETWEEN 1 PRECEDING AND CURRENT ROW over the monthly set.", ["AVG(net_dollars) OVER (ORDER BY month ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)? — no: the brief says THREE months, so 2 PRECEDING.", "Round to 2; the first two rows average fewer months (the frame shrinks honestly)."], "medium",
    `SELECT month, net_dollars,
       ROUND(AVG(net_dollars) OVER (
         ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3
FROM (
  SELECT dd.month, SUM(f.net_cents) / 100.0 AS net_dollars
  FROM fact_sales f
  JOIN dim_date dd ON dd.date_key = f.date_key
  GROUP BY dd.month
)
ORDER BY month;`,
    [["rows\\s+between\\s+1", "One preceding = a 2-month window; three months needs 2 PRECEDING."], ["range", "RANGE counts VALUES (ties move the frame) — monthly keys are unique but ROWS states the intent."]], true],
  ["The slice", "One dimension value, everything else wide: Tech's October 2024 — lines, net, share of that month. The slice is a WHERE clause away from the rollup.", ["Filter department + month; the share joins back to the month's total via a window or a scalar subquery.", "Scalar subquery keeps it one level: month total as (SELECT … FROM … WHERE month = '2024-10')."], "medium",
    `SELECT COUNT(*) AS lines,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars,
       ROUND(SUM(f.net_cents) * 100.0 /
         (SELECT SUM(net_cents) FROM fact_sales f2
          JOIN dim_date dd2 ON dd2.date_key = f2.date_key
          WHERE dd2.month = '2024-10'), 1) AS share_of_month_pct
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
WHERE d.department = 'Tech' AND dd.month = '2024-10';`,
    [["group\\s+by", "One slice, one row — no grouping."], ["share.*100", "The denominator is October's WHOLE month, both departments — the scalar subquery is the parent."]]],
  ["The grammar, all moves", "One query, three moves: net per department-quarter with each department's rank inside its quarter AND the quarter's total beside it — rollup (total), drill-down (department), ranking (RANK) in one SELECT.", ["GROUP BY quarter, department; RANK() OVER (PARTITION BY quarter ORDER BY SUM DESC); SUM(SUM()) OVER (PARTITION BY quarter).", "2024 only; order quarter, rank."], "hard",
    `SELECT dd.quarter, d.department,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars,
       RANK() OVER (PARTITION BY dd.quarter ORDER BY SUM(f.net_cents) DESC) AS rk,
       ROUND(SUM(SUM(f.net_cents)) OVER (PARTITION BY dd.quarter) / 100.0, 2) AS quarter_net
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
WHERE dd.year = 2024
GROUP BY dd.quarter, d.department
ORDER BY dd.quarter, rk;`,
    [["partition\\s+by.*department\\s+order", "The rank competes INSIDE the quarter — partition by quarter only, order by the sum."], ["join.*totals", "No self-join needed — the window rides the same grouped scan."]], true],
];
