// Ground-truth receipts for the JOIN + aggregates drill set (dr2-ja-*).
// Run: bun scripts/m2-facts-ja.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2fb.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const QUERIES: Record<string, string> = {
  // --- per-customer order report (full distribution) ---
  ja_per_customer_full: `SELECT c.name, c.region, COUNT(*) AS n, ROUND(SUM(o.total),2) AS spend, ROUND(AVG(o.total),2) AS avg_t FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY n DESC`,
  ja_cust_gt15: `SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) > 15)`,
  ja_cust_ge10: `SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 10)`,
  ja_cust_one_order: `SELECT c.name FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id HAVING COUNT(*) = 1 ORDER BY c.name`,
  // --- region reports ---
  ja_region_report: `SELECT c.region, COUNT(*) AS orders_n, COUNT(DISTINCT c.id) AS cust_n, ROUND(SUM(o.total),2) AS revenue, ROUND(AVG(o.total),2) AS avg_total FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY revenue DESC`,
  ja_region_gt20: `SELECT COUNT(*) AS n FROM (SELECT c.region FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region HAVING COUNT(*) > 20)`,
  ja_region_sum_gt10k: `SELECT c.region, ROUND(SUM(o.total),2) AS s FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region HAVING SUM(o.total) > 10000`,
  ja_pending_per_region: `SELECT c.region, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'pending' GROUP BY c.region ORDER BY n DESC`,
  ja_pending_ge2_cust: `SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders WHERE status = 'pending' GROUP BY customer_id HAVING COUNT(*) >= 2)`,
  // --- fan-out / inflation ---
  ja_sum_raw: `SELECT ROUND(SUM(total),2) AS s, COUNT(*) AS n FROM orders`,
  ja_sum_after_items: `SELECT ROUND(SUM(o.total),2) AS s, COUNT(*) AS rows_n, COUNT(DISTINCT o.id) AS orders_n FROM orders o JOIN order_items oi ON oi.order_id = o.id`,
  ja_alice_fanout: `SELECT COUNT(*) AS rows_n, COUNT(DISTINCT o.id) AS orders_n, ROUND(SUM(o.total),2) AS sum_t, ROUND(AVG(o.total),2) AS avg_t FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen'`,
  ja_alice_raw: `SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS s, ROUND(AVG(total),2) AS a FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen'`,
  // --- lines-per-order grain ---
  ja_lines_dist: `SELECT n, COUNT(*) AS orders_n FROM (SELECT order_id, COUNT(*) AS n FROM order_items GROUP BY order_id) GROUP BY n ORDER BY n`,
  ja_groups_by_oid: `SELECT COUNT(*) AS n FROM (SELECT o.id FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id)`,
  ja_orders_with_4: `SELECT COUNT(*) AS n FROM (SELECT order_id FROM order_items GROUP BY order_id HAVING COUNT(*) = 4)`,
  // --- segments / misc groups ---
  ja_active_split: `SELECT c.active, COUNT(*) AS orders_n, COUNT(DISTINCT c.id) AS cust_n, ROUND(SUM(o.total),2) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.active ORDER BY c.active`,
  ja_null_checks: `SELECT (SELECT COUNT(*) FROM customers WHERE region IS NULL) AS null_region, (SELECT COUNT(*) FROM customers WHERE active IS NULL) AS null_active, (SELECT COUNT(DISTINCT city) FROM customers) AS cities, (SELECT COUNT(DISTINCT region) FROM customers) AS regions`,
  ja_city_top: `SELECT c.city, COUNT(*) AS orders_n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.city ORDER BY orders_n DESC LIMIT 4`,
  // --- derived-table pre-aggregation ---
  ja_derived_rows: `SELECT COUNT(*) AS n FROM customers c JOIN (SELECT customer_id, COUNT(*) AS order_n, SUM(total) AS spend FROM orders GROUP BY customer_id) t ON t.customer_id = c.id`,
  ja_derived_top: `SELECT c.name, t.order_n, ROUND(t.spend,2) AS spend FROM customers c JOIN (SELECT customer_id, COUNT(*) AS order_n, SUM(total) AS spend FROM orders GROUP BY customer_id) t ON t.customer_id = c.id ORDER BY t.order_n DESC LIMIT 3`,
  // --- error shapes (confirm the message) ---
  ja_err_alias_where: `SELECT c.region, COUNT(*) AS order_n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE order_n > 10 GROUP BY c.region`,
  ja_err_agg_in_where: `SELECT c.region FROM orders o JOIN customers c ON c.id = o.customer_id WHERE COUNT(*) > 5 GROUP BY c.region`,
  ja_err_group_oregion: `SELECT COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY o.region`,
  ja_err_ambiguous_group: `SELECT COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY id`,
  ja_no_groupby: `SELECT c.region, COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id`,
  ja_empty_set_agg: `SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS s, ROUND(AVG(total),2) AS a FROM orders WHERE status = 'nope'`,
  ja_alias_ok_clauses: `SELECT c.region AS r, COUNT(*) AS order_n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY r HAVING order_n > 0 ORDER BY order_n DESC`,
  // --- re-verify shared receipts ---
  ja_top_units: `SELECT p.name, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id ORDER BY units DESC LIMIT 3`,
  ja_customer_top_spend: `SELECT c.name, COUNT(*) AS n, ROUND(SUM(o.total),2) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY spend DESC LIMIT 3`,
};

for (const [name, sql] of Object.entries(QUERIES)) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`== ${name} ==`);
    for (const r of rows.slice(0, 20)) console.log("  ", JSON.stringify(r));
    if (rows.length > 20) console.log(`   ... ${rows.length} rows`);
  } catch (e) {
    console.log(`== ${name} == ERROR: ${(e as Error).message}`);
  }
}
rmSync(COPY);
