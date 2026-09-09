// Verify every number used in Module 1 DRILL-bank MCQs against the live engine.
// Run: bun scripts/m1-drill-facts.ts
import { execSync } from "node:child_process";

const QUERIES: Record<string, string> = {
  // --- aggregates ---
  count_variants: `SELECT COUNT(*) AS all_rows, COUNT(shipped_at) AS non_null, COUNT(DISTINCT status) AS d_status, COUNT(DISTINCT region) AS d_region FROM orders`,
  // NOTE: region is on customers; fix below if this errors
  count_distincts: `SELECT COUNT(DISTINCT status) AS d_status FROM orders`,
  count_distinct_region: `SELECT COUNT(DISTINCT region) AS d_region FROM customers`,
  count_distinct_city: `SELECT COUNT(DISTINCT city) AS d_city FROM customers`,
  count_distinct_cust: `SELECT COUNT(DISTINCT customer_id) AS d_cust FROM orders`,
  sum_avg_orders: `SELECT ROUND(SUM(total),2) AS sum_t, ROUND(AVG(total),2) AS avg_t FROM orders`,
  price_stats: `SELECT MIN(price) AS min_p, MAX(price) AS max_p, ROUND(AVG(price),2) AS avg_p, ROUND(SUM(price),2) AS sum_p FROM products`,
  item_price_stats: `SELECT MIN(unit_price) AS min_u, MAX(unit_price) AS max_u, ROUND(AVG(quantity),2) AS avg_q, SUM(quantity) AS units FROM order_items`,
  stock_stats: `SELECT MIN(stock) AS min_s, MAX(stock) AS max_s, ROUND(AVG(stock),1) AS avg_s, SUM(stock) AS total_units FROM products`,
  empty_set_twins: `SELECT COUNT(*) AS c, SUM(total) AS s, AVG(total) AS a, MIN(total) AS mn, MAX(total) AS mx FROM orders WHERE 1 = 0`,
  rating_nulls: `SELECT COUNT(*) AS n, SUM(CASE WHEN rating IS NULL THEN 1 ELSE 0 END) AS null_r, ROUND(AVG(rating),2) AS avg_r FROM suppliers`,
  per_status_sum: `SELECT status, ROUND(SUM(total),2) AS rev, COUNT(*) AS n FROM orders GROUP BY status ORDER BY rev DESC`,
  // --- top-N / ORDER BY / LIMIT ---
  top3_orders: `SELECT id, customer_id, ROUND(total,2) AS t FROM orders ORDER BY total DESC LIMIT 3`,
  top_total: `SELECT COUNT(*) AS n FROM orders WHERE total = (SELECT MAX(total) FROM orders)`,
  second_highest: `SELECT id, ROUND(total,2) AS t FROM orders ORDER BY total DESC LIMIT 1 OFFSET 1`,
  alpha_status_first: `SELECT id, status FROM orders ORDER BY status, id LIMIT 2`,
  status_total_desc_first: `SELECT status, ROUND(total,2) AS t, id FROM orders ORDER BY status ASC, total DESC LIMIT 1`,
  nulls_first: `SELECT id, status FROM orders ORDER BY shipped_at ASC, id LIMIT 1`,
  total_ties: `SELECT COUNT(*) AS tie_groups FROM (SELECT total FROM orders GROUP BY total HAVING COUNT(*) > 1)`,
  limit_neg: `SELECT COUNT(*) AS n FROM (SELECT id FROM orders ORDER BY id LIMIT -1)`,
  limit_offset_beyond: `SELECT COUNT(*) AS n FROM (SELECT id FROM orders ORDER BY id LIMIT 5 OFFSET 103)`,
  suppliers_limit10: `SELECT COUNT(*) AS n FROM (SELECT * FROM suppliers ORDER BY id LIMIT 10)`,
  // --- WHERE / LIKE / IN / BETWEEN ---
  eq_case_sensitive: `SELECT COUNT(*) AS n FROM orders WHERE status = 'DELIVERED'`,
  like_pct_all: `SELECT COUNT(*) AS n FROM products WHERE name LIKE '%'`,
  orders_between_50_100: `SELECT COUNT(*) AS n FROM orders WHERE total BETWEEN 50 AND 100`,
  not_delivered: `SELECT COUNT(*) AS n FROM orders WHERE NOT status = 'delivered'`,
  a_names: `SELECT COUNT(*) AS n FROM customers WHERE name LIKE 'A%'`,
  product_names: `SELECT name FROM products ORDER BY name`,
  customer_names: `SELECT name FROM customers ORDER BY name LIMIT 16`,
  status_in_two: `SELECT COUNT(*) AS n FROM orders WHERE status IN ('delivered', 'shipped')`,
  // --- GROUP BY / HAVING ---
  region_groups: `SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC`,
  cust_ge10: `SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 10)`,
  status_having14: `SELECT COUNT(*) AS n FROM (SELECT status FROM orders GROUP BY status HAVING COUNT(*) >= 14)`,
  having_global_over: `SELECT COUNT(*) AS n FROM (SELECT COUNT(*) AS c FROM orders HAVING COUNT(*) > 50)`,
  having_global_under: `SELECT COUNT(*) AS n FROM (SELECT COUNT(*) AS c FROM orders HAVING COUNT(*) > 200)`,
  groups_when_where_false: `SELECT COUNT(*) AS n FROM (SELECT status FROM orders WHERE 1 = 0 GROUP BY status)`,
  groupby_alias_ok: `SELECT status AS s, COUNT(*) AS n FROM orders GROUP BY s`,
  avg_per_status: `SELECT status, ROUND(AVG(total),2) AS a FROM orders GROUP BY status ORDER BY a DESC`,
  // --- top spenders ---
  top_spenders: `SELECT c.name, COUNT(*) AS n, ROUND(SUM(o.total),2) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name ORDER BY spend DESC LIMIT 3`,
  // --- expression / literal oddities ---
  expr_math: `SELECT 2 + 3 * 4 AS x, 10 / 4 AS int_div, 10.0 / 4 AS float_div`,
  literal_row: `SELECT 'hello' AS greeting, 1 + 1 AS two`,
  nullif_demo: `SELECT NULLIF('a', 'a') AS same, NULLIF(5, 7) AS diff`,
  coalesce_chain: `SELECT COALESCE(NULL, NULL, 'x') AS c, IFNULL(NULL, 0) AS ifn`,
  // --- NULL specifics ---
  null_eq_null: `SELECT COUNT(*) AS n FROM orders WHERE shipped_at = NULL`,
  null_status_breakdown: `SELECT status, COUNT(*) AS n FROM orders WHERE shipped_at IS NULL GROUP BY status`,
  not_in_null_trap: `SELECT COUNT(*) AS n FROM orders WHERE shipped_at NOT IN (SELECT shipped_at FROM orders WHERE status = 'pending')`,
  sup_col_count: `SELECT * FROM suppliers LIMIT 1`,
  ord_col_count: `SELECT * FROM orders LIMIT 1`,
  cust_col_count: `SELECT * FROM customers LIMIT 1`,
  prod_col_count: `SELECT * FROM products LIMIT 1`,
  item_col_count: `SELECT * FROM order_items LIMIT 1`,
};

for (const [name, sql] of Object.entries(QUERIES)) {
  const out = execSync(
    `curl -s -m 20 -X POST http://localhost:3000/api/query -H "Content-Type: application/json" -d '${JSON.stringify({ sql }).replace(/'/g, "'\\''")}'`,
    { encoding: "utf8" },
  );
  try {
    const j = JSON.parse(out);
    console.log(`== ${name} ==`);
    if (j.ok) {
      console.log("  cols:", JSON.stringify(j.columns));
      for (const r of j.rows) console.log("  ", JSON.stringify(r));
    } else {
      console.log("  ERROR:", j.error);
    }
  } catch {
    console.log(`== ${name} == RAW:`, out.slice(0, 200));
  }
}
