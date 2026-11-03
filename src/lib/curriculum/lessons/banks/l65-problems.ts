// Lesson 65 — OLAP vs OLTP problems. Every solution runs on the seeded
// storefront + warehouse. Money leaves as dollars via ROUND(x/100.0, 2).

export const ROWS: import("./l64-util").ProbRowX[] = [
  ["Count the day's writes", "OLTP in numbers: the first week of January 2024 produced how many order rows? Count orders created on or before 2024-01-07 — each one was an INSERT plus item INSERTs plus stock UPDATEs.", ["orders carries created_at as TEXT 'YYYY-MM-DD' — a string comparison works.", "COUNT(*) counts rows; no join needed for this one."], "easy",
    `SELECT COUNT(*) AS orders_first_week
FROM orders
WHERE created_at <= '2024-01-07';`,
    [["date\\(created_at\\)", "created_at is already TEXT 'YYYY-MM-DD' — comparing strings is exact; wrapping it in a date function just slows the scan."], ["shipped_at", "Writes happen when the order lands, not when it ships — created_at is the operational timestamp."]]],
  ["Count the quarter's reads", "OLAP in numbers: the board's Q1 2024 question reads every fact line. Return the fact's Q1 2024 row count and net dollars — one aggregate over 239 candidate lines, zero rows written.", ["Join dim_date for the quarter; the fact carries net_cents.", "quarter is INTEGER 1-4 on the date spine; year is INTEGER too."], "easy",
    `SELECT COUNT(*) AS fact_lines,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
WHERE dd.year = 2024 AND dd.quarter = 1;`,
    [["status", "The warehouse has no order status — saleability was decided at load; fact_sales IS the sold set."], ["total", "orders.total is the operational dollars column; the fact's measure is net_cents."]]],
  ["The same sale, two shapes", "Order 5's lines exist twice in this course: once as operational rows, once as fact rows. Count order 5's order_items rows and its fact_sales rows — the two numbers must match; only the shape differs.", ["Both sides count rows for order_id = 5 (order_items) / order_id = 5 (fact_sales).", "One SELECT with two scalar subqueries keeps it side by side."], "easy",
    `SELECT (SELECT COUNT(*) FROM order_items WHERE order_id = 5) AS source_lines,
       (SELECT COUNT(*) FROM fact_sales WHERE order_id = 5) AS fact_lines;`,
    [["join", "Two independent counts don't need a join — scalar subqueries in one SELECT answer side by side."], ["product_key", "The pairing is by order_id on both sides; the product key only renames things."]]],
  ["Normalization vs the wide fact", "The operational side stores one products row (16) referenced many times; the warehouse copies attributes onto dim_product (16) and joins by key. Prove the pointer economics: count orders referencing product 13, and the product's name from the dim — one query, two jobs.", ["A scalar subquery counts the referencing lines; the dim name is a single-row pick.", "product 13 is Smart Watch S in the dim."], "easy",
    `SELECT (SELECT COUNT(*) FROM fact_sales WHERE product_key = 13) AS referencing_lines,
       (SELECT name FROM dim_product WHERE product_key = 13) AS product_name;`,
    [["group\\s+by", "One product, one count — no grouping needed, just two scalar answers."], ["orders", "Count FACT lines (fact_sales), not orders — the warehouse question reads the star."]]],
  ["Where writes and reads diverge", "The operational store answers 'order 12 shipped?'; the warehouse answers 'which quarter owns the most net?'. Ship the read: net dollars per quarter of 2024, biggest quarter first.", ["Join dim_date once; GROUP BY year, quarter; ORDER BY net DESC.", "LIMIT 4 keeps 2025's single quarter out — the brief says 2024."], "medium",
    `SELECT dd.year, dd.quarter,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
WHERE dd.year = 2024
GROUP BY dd.year, dd.quarter
ORDER BY net_dollars DESC;`,
    [["order\\s+by\\s+dd\\.quarter", "Calendar order buries the answer — the brief asks biggest first."], ["sum\\(f\\.quantity\\)", "Net dollars, not units — quantity is a measure but not the money one."]], true],
  ["The write path is chatty", "Prove OLTP's write amplification: for each order created 2024-01-05, count its item lines — one business event, many physical writes. Return order id, status, item lines, biggest line count last.", ["Join orders to order_items for that one day; GROUP BY the order.", "COUNT(*) per order is the write count; ORDER BY writes DESC."], "medium",
    `SELECT o.id, o.status, COUNT(oi.id) AS item_writes
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.created_at = '2024-01-05'
GROUP BY o.id, o.status
ORDER BY item_writes DESC, o.id;`,
    [["count\\(\\*\\)\\s+as\\s+orders", "COUNT(*) per GROUP counts lines per order — that IS the write count; naming it orders misleads."], ["where\\s+oi\\.", "The date lives on orders, not items — filter before the join widens."]], true],
  ["The read path is fat", "One warehouse query, whole-table scans: run the department rollup over the whole fact (both departments, all 14 months) and ALSO return the fact's total row count next to each row — the same scan feeding every cell.", ["A window over the whole fact (SUM without PARTITION) rides the same scan.", "GROUP BY department with SUM(net) and MAX over COUNT(*) won't mix — use a window on the grouped set."], "hard",
    `SELECT d.department,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars,
       ROUND(SUM(SUM(f.net_cents)) OVER () / 100.0, 2) AS company_net_dollars
FROM fact_sales f
JOIN dim_product d ON d.product_key = f.product_key
GROUP BY d.department
ORDER BY net_dollars DESC;`,
    [["sum\\(net_cents\\)\\s+over\\s*\\(\\s*partition", "PARTITION BY department would make the parent equal the child — the company total needs the empty OVER ( )."], ["cross\\s+join", "A cross join of a totals subquery works but scans twice; one window rides the same aggregate pass."]], true],
  ["Transactions vs loads", "The operational side lives transaction-by-transaction; the warehouse loads in batches. Count the fact's distinct sale dates (the load's day buckets) and the fact's row count — 14 months of sales, a handful of load units.", ["COUNT(DISTINCT date_key) for days, COUNT(*) for lines.", "Both answers in one SELECT — scalar aggregates over the same fact."], "medium",
    `SELECT COUNT(DISTINCT date_key) AS sale_days,
       COUNT(*) AS fact_lines
FROM fact_sales;`,
    [["group\\s+by", "Whole-table verdicts — one row, no grouping."], ["order_id", "The load buckets by DATE (date_key), not by order — many orders share a day."]]],
  ["The sellable set", "fact_sales excludes cancelled orders — the warehouse's first business rule. Prove the exclusion arithmetic: source lines (all order_items), cancelled lines, and the fact's 239. Three numbers, one row.", ["Three scalar subqueries: total lines, lines whose order is cancelled, and the fact count.", "COUNT(*) over a join to orders filtered by status."], "medium",
    `SELECT (SELECT COUNT(*) FROM order_items) AS source_lines,
       (SELECT COUNT(*) FROM order_items oi JOIN orders o ON o.id = oi.order_id
         WHERE o.status = 'cancelled') AS cancelled_lines,
       (SELECT COUNT(*) FROM fact_sales) AS fact_lines;`,
    [["left\\s+join", "Every item has its order — INNER semantics; a LEFT join changes nothing but suggests otherwise."], ["shipped", "Cancellation, not shipping, decides saleability — shipped/pending lines are still sales."]]],
  ["The point of it all", "The payoff: one star query the operational schema can't answer cheaply — net dollars per department per quarter with the department's share of its quarter (ratio-to-parent preview). 2024 only, quarters ascending.", ["Two joins (dim_date, dim_product), GROUP BY quarter + department, then a window over the quarter partition.", "Share = child net / SUM(child net) OVER (PARTITION BY quarter)."], "hard",
    `SELECT dd.quarter, d.department,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars,
       ROUND(SUM(f.net_cents) * 100.0
             / SUM(SUM(f.net_cents)) OVER (PARTITION BY dd.quarter), 1) AS share_of_quarter_pct
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
WHERE dd.year = 2024
GROUP BY dd.quarter, d.department
ORDER BY dd.quarter, net_dollars DESC;`,
    [["over\\s*\\(\\s*\\)", "The parent is the QUARTER, not the company — an empty OVER ( ) shares against everything."], ["where.*cancelled", "The fact has no cancelled rows to exclude — that rule ran at load."]], true],
];
