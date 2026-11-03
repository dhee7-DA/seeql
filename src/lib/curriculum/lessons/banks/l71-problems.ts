// Lesson 71 — conformed dimensions: fact_returns beside fact_sales.
// Verified: 14 returns · refunds 108,311¢ (Tech 98,488 / Lifestyle 9,823) ·
// all keys resolve · returns re-resolve the customer at RETURN date.

export const ROWS: import("./l64-util").ProbRowX[] = [
  ["The returns census", "The second fact lands: count fact_returns rows and the distinct products they touch. 14 rows — every one a provenance link back to a sold line.", ["COUNT(*) and COUNT(DISTINCT product_key).", "No joins — the census reads the fact alone."], "easy",
    `SELECT COUNT(*) AS return_rows,
       COUNT(DISTINCT product_key) AS distinct_products
FROM fact_returns;`,
    [["join", "The census is the fact's own shape — joins come with the analysis."], ["distinct\\s+sales_line_id", "Every return references a DIFFERENT sold line here; product variety is the interesting count."]]],
  ["Refund money", "The refund total in dollars: SUM(refund_cents) guarded the usual way — $1,083.11 left the building.", ["ROUND(SUM(refund_cents) / 100.0, 2).", "refund_cents is per returned UNIT (quantity is 1 on every row here)."], "easy",
    `SELECT ROUND(SUM(refund_cents) / 100.0, 2) AS refund_dollars
FROM fact_returns;`,
    [["sum.*quantity", "Quantity is 1 on every return row — the money sum alone is the answer."], ["net_cents", "That's fact_sales' measure — returns carry refund_cents."]]],
  ["Refunds by department", "The conformed join: returns → dim_product → department. Tech absorbs $984.88 of the refunds; Lifestyle $98.23 — one join, same dim the sales fact uses.", ["JOIN dim_product ON product_key; GROUP BY department.", "Money via ROUND(x/100.0, 2)."], "easy",
    `SELECT d.department,
       ROUND(SUM(r.refund_cents) / 100.0, 2) AS refund_dollars
FROM fact_returns r
JOIN dim_product d ON d.product_key = r.product_key
GROUP BY d.department
ORDER BY refund_dollars DESC;`,
    [["products", "Join the DIMENSION — the operational products table isn't the star's copy."], ["fact_sales", "This question reads ONLY the returns fact — sales come in the next problem."]], true],
  ["Return rate", "Returned lines as a share of sold lines, per department: the rate needs BOTH facts through the SAME dim — conformance in action.", ["Two subqueries per department, or a join of two aggregated sets; rate = returned × 100.0 / sold, one decimal.", "Sold lines per department come from fact_sales × dim_product."], "hard",
    `SELECT d.department,
       ROUND(COUNT(DISTINCT r.sales_line_id) * 100.0
             / (SELECT COUNT(*) FROM fact_sales f2
                JOIN dim_product d2 ON d2.product_key = f2.product_key
                WHERE d2.department = d.department), 1) AS return_rate_pct
FROM fact_returns r
JOIN dim_product d ON d.product_key = r.product_key
GROUP BY d.department
ORDER BY return_rate_pct DESC;`,
    [["count\\(\\*\\)", "Returns reference LINES — COUNT(DISTINCT sales_line_id) is the returned-line count."],
     ["sum", "A rate of LINES, not dollars — summing either fact distorts the ratio."]], true],
  ["Zero orphans", "The conformance contract: every return's keys resolve through the SAME dimensions. Count returns failing to join product, store, customer or date — must be zero.", ["NOT EXISTS probes over the four dims, ORed.", "dim_customer joins on customer_sk — returns carry surrogates too."], "medium",
    `SELECT COUNT(*) AS orphaned_returns
FROM fact_returns r
WHERE NOT EXISTS (SELECT 1 FROM dim_product d WHERE d.product_key = r.product_key)
   OR NOT EXISTS (SELECT 1 FROM dim_store s WHERE s.store_key = r.store_key)
   OR NOT EXISTS (SELECT 1 FROM dim_customer c WHERE c.customer_sk = r.customer_key)
   OR NOT EXISTS (SELECT 1 FROM dim_date dd WHERE dd.date_key = r.date_key);`,
    [["left\\s+join.*is\\s+null.*group", "The LEFT JOIN shape works — four correlated probes keep the verdict one row."],
     ["customer_id", "Surrogates on every fact — customer_id would fan out the movers."]]],
  ["Returns by region", "The as-of twist: a return's region is the customer's region at RETURN date — already resolved into the fact's customer_key. Net the refunds by region, biggest first.", ["JOIN dim_customer ON customer_sk; GROUP BY region.", "The key froze return-time truth — no window logic in the query."], "medium",
    `SELECT c.region,
       ROUND(SUM(r.refund_cents) / 100.0, 2) AS refund_dollars
FROM fact_returns r
JOIN dim_customer c ON c.customer_sk = r.customer_key
GROUP BY c.region
ORDER BY refund_dollars DESC;`,
    [["join.*fact_sales", "No second fact needed — the return's own key carries the as-of region."],
     ["is_current", "Current-region reporting would re-date the return — the surrogate already knows."]], true],
  ["Return lag", "How long between sale and return? Average julianday(return date) − julianday(sale date) over the 14 returns — the fact-to-fact lineage via sales_line_id makes it one join.", ["JOIN fact_sales ON id = sales_line_id for the sale's date_key; both keys map to iso_date through dim_date.", "ROUND(AVG(julianday(rd) − julianday(sd)), 1) days."], "hard",
    `SELECT ROUND(AVG(
         julianday(rd.iso_date) - julianday(sd.iso_date)
       ), 1) AS avg_lag_days
FROM fact_returns r
JOIN fact_sales f ON f.id = r.sales_line_id
JOIN dim_date rd ON rd.date_key = r.date_key
JOIN dim_date sd ON sd.date_key = f.date_key;`,
    [["datediff", "SQLite spells day math in julianday — the dialects module maps the warehouse names."],
     ["r\\.date_key\\s*-\\s*f\\.date_key", "Integer key subtraction is wrong across month boundaries — the spine's iso_date is the honest measure."]]],
  ["Two facts, one grid", "The conformed headline: net dollars AND refund dollars per department, side by side — one query, two facts, one shared dim. The store's margin picture in four columns.", ["LEFT JOIN from the sales side so departments with no returns still appear (honest zeros).", "Aggregate each fact separately, then join on department — never join fact to fact directly."], "hard",
    `WITH sales AS (
  SELECT d.department, SUM(f.net_cents) AS net_cents
  FROM fact_sales f
  JOIN dim_product d ON d.product_key = f.product_key
  GROUP BY d.department
),
refunds AS (
  SELECT d.department, SUM(r.refund_cents) AS refund_cents
  FROM fact_returns r
  JOIN dim_product d ON d.product_key = r.product_key
  GROUP BY d.department
)
SELECT s.department,
       ROUND(s.net_cents / 100.0, 2) AS net_dollars,
       ROUND(COALESCE(r.refund_cents, 0) / 100.0, 2) AS refund_dollars
FROM sales s
LEFT JOIN refunds r ON r.department = s.department
ORDER BY s.net_cents DESC;`,
    [["fact_returns\\s+r\\s+ON\\s+r\\.product_key\\s*=\\s*f\\.product_key", "Joining the RETURNS to sale LINES fans out — each refund repeats once per matching sale of that product. Aggregate each fact first, join the aggregates."],
     ["join\\s+fact_sales\\s+f[,\\s]*fact_returns", "A direct fact-fact join on the shared dim keys is the cardinal sin — 239 × 14 rows of double-counted money."]], true],
  ["Top returned product", "Which product came back most? Product name, return count, refund dollars — the merchandising alarm.", ["GROUP BY product_key + name from the dim; ORDER BY count DESC, refund DESC LIMIT 1.", "The dim supplies the name — one join."], "medium",
    `SELECT d.name,
       COUNT(*) AS returns,
       ROUND(SUM(r.refund_cents) / 100.0, 2) AS refund_dollars
FROM fact_returns r
JOIN dim_product d ON d.product_key = r.product_key
GROUP BY d.product_key, d.name
ORDER BY returns DESC, refund_dollars DESC
LIMIT 1;`,
    [["group\\s+by\\s+d\\.name\\s*$", "Group by the KEY — names can collide; the key can't."],
     ["limit\\s+3", "One alarm — the single most-returned product."]], true],
  ["Returns by store", "The store slice on the second fact: refund dollars per store — dim_store conformed, same as sales.", ["JOIN dim_store ON store_key; GROUP BY name; ORDER BY refund DESC.", "Four rows max — the store dim is small."], "easy",
    `SELECT s.name,
       ROUND(SUM(r.refund_cents) / 100.0, 2) AS refund_dollars
FROM fact_returns r
JOIN dim_store s ON s.store_key = r.store_key
GROUP BY s.name
ORDER BY refund_dollars DESC, s.name;`,
    [["fact_sales", "Returns carry their own store_key — no sales join needed."],
     ["city", "Group by the store's name (or key); city is an attribute for display."]], true],
  ["The lineage check", "Every return descends from a real sold line: count returns whose sales_line_id misses fact_sales. Must be zero — the degenerate bridge holds.", ["NOT EXISTS probe into fact_sales on id = sales_line_id.", "Lineage is fact-to-fact BY ID, never by re-deriving the business key."], "easy",
    `SELECT COUNT(*) AS broken_links
FROM fact_returns r
WHERE NOT EXISTS (SELECT 1 FROM fact_sales f WHERE f.id = r.sales_line_id);`,
    [["order_id", "Lineage is by the fact's own line id — order_id would blur multi-line orders."],
     ["left\\s+join", "One probe, one number — the NOT EXISTS shape keeps it a verdict."]]],
  ["Returns on the spine", "Refunds per month, calendar-ordered — the date spine serves the second fact exactly as it served the first.", ["JOIN dim_date ON date_key; GROUP BY month; ORDER BY month.", "Months with no returns won't appear — honest, unless the brief demands zeros (it doesn't)."], "medium",
    `SELECT dd.month,
       ROUND(SUM(r.refund_cents) / 100.0, 2) AS refund_dollars
FROM fact_returns r
JOIN dim_date dd ON dd.date_key = r.date_key
GROUP BY dd.month
ORDER BY dd.month;`,
    [["strftime", "The spine carries month — one join, no derivation."],
     ["left\\s+join.*dim_date", "The returns fact drives; the spine labels its months — a LEFT join from the spine would show 14 rows of mostly zeros."]], true],
  ["The conformance inventory, honestly", "Same question, clean build: for each of the four dims, check both facts carry its key. Return one row: four 1/0 flags and the count of dims both facts share.", ["Four scalar subqueries: EXISTS(SELECT 1 FROM fact_sales WHERE date_key IS NOT NULL) AND EXISTS over fact_returns — per dim.", "The shared count is the SUM of the flags."], "hard",
    `SELECT
    (SELECT COUNT(*) FROM fact_sales WHERE date_key IS NOT NULL) > 0
      AND (SELECT COUNT(*) FROM fact_returns WHERE date_key IS NOT NULL) > 0 AS date_conformed,
    (SELECT COUNT(*) FROM fact_sales WHERE product_key IS NOT NULL) > 0
      AND (SELECT COUNT(*) FROM fact_returns WHERE product_key IS NOT NULL) > 0 AS product_conformed,
    (SELECT COUNT(*) FROM fact_sales WHERE customer_key IS NOT NULL) > 0
      AND (SELECT COUNT(*) FROM fact_returns WHERE customer_key IS NOT NULL) > 0 AS customer_conformed,
    (SELECT COUNT(*) FROM fact_sales WHERE store_key IS NOT NULL) > 0
      AND (SELECT COUNT(*) FROM fact_returns WHERE store_key IS NOT NULL) > 0 AS store_conformed;`,
    [["count\\(\\*\\)\\s*=\\s*4", "The flags are booleans — 1/0 each; the reader counts them."],
     ["join", "No joins — key presence per fact is the conformance proof."]]],
];
