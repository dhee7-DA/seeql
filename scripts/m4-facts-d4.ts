// Ground-truth receipts for the M4-d4 drill sets (dr4-cc-* CTE chains &
// recursion, dr4-se-* subquery edge cases). Run: bun scripts/m4-facts-d4.ts
// Read-only COPY of db/custom.db (never touches the live file).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m4d4.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const QUERIES: Record<string, string> = {
  // ---------- baseline census (re-confirm fact sheet) ----------
  base_counts: `SELECT (SELECT COUNT(*) FROM customers) AS customers, (SELECT COUNT(*) FROM orders) AS orders, (SELECT COUNT(*) FROM products) AS products, (SELECT COUNT(*) FROM suppliers) AS suppliers`,
  base_cust_nulls: `SELECT COUNT(*) AS nulls, COUNT(DISTINCT customer_id) AS distincts FROM orders`,
  base_regions: `SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC, region`,
  base_status: `SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC`,
  base_hist: `SELECT n, COUNT(*) AS customers FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) GROUP BY n ORDER BY n`,
  base_mean: `SELECT AVG(cnt) AS mean, SUM(cnt > 6.4375) AS above_mean, SUM(cnt < 5) AS below5, SUM(cnt >= 20) AS ge20 FROM (SELECT COUNT(*) AS cnt FROM orders GROUP BY customer_id)`,
  base_top3: `SELECT COUNT(*) AS n, AVG(cnt) AS avg3 FROM (SELECT COUNT(*) AS cnt FROM orders GROUP BY customer_id ORDER BY cnt DESC LIMIT 3)`,
  base_top_names: `SELECT c.name, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY n DESC LIMIT 3`,
  base_cancelled: `SELECT SUM(has_c) AS ge1, SUM(NOT has_c) AS zero FROM (SELECT customer_id, MAX(status='cancelled') AS has_c FROM orders GROUP BY customer_id)`,
  base_not_exists_cancelled: `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')`,
  base_delivered: `SELECT SUM(has_d) AS exists_delivered, SUM(NOT has_d) AS not_exists_delivered FROM (SELECT customer_id, MAX(status='delivered') AS has_d FROM orders GROUP BY customer_id)`,
  base_liam: `SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')`,
  base_zero_pending: `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')`,

  // ---------- CTE receipts ----------
  cte_per_stats: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) SELECT COUNT(*) AS customers_n, MAX(n) AS max_n, SUM(n) AS sum_orders FROM per`,
  cte_vip20: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id), vip AS (SELECT customer_id FROM per WHERE n >= 20) SELECT COUNT(*) AS n FROM vip`,
  cte_vip_name: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id), vip AS (SELECT customer_id FROM per WHERE n >= 20) SELECT c.name FROM vip JOIN customers c ON c.id = vip.customer_id`,
  cte_middle_reuse_heavy: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id), heavy AS (SELECT n FROM per WHERE n >= 4), light AS (SELECT n FROM per WHERE n < 5) SELECT (SELECT COUNT(*) FROM heavy) AS heavy_n, (SELECT COUNT(*) FROM light) AS light_n, (SELECT COUNT(*) FROM per) AS per_n`,
  cte_regions_gt4: `WITH r AS (SELECT region, COUNT(*) AS n FROM customers GROUP BY region) SELECT COUNT(*) AS n FROM r WHERE n > 4`,
  cte_derived_equiv: `SELECT COUNT(*) AS n FROM (SELECT region, COUNT(*) AS n FROM customers GROUP BY region) WHERE n > 4`,
  cte_ge5: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) SELECT COUNT(*) AS n FROM per WHERE n >= 5`,
  cte_top3_avg: `WITH top3 AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id ORDER BY n DESC LIMIT 3) SELECT COUNT(*) AS n, AVG(n) AS avg_n, SUM(n) AS sum_n FROM top3`,
  cte_eu: `WITH eu AS (SELECT id FROM customers WHERE region = 'EU') SELECT COUNT(*) AS n FROM eu`,
  cte_two_laters: `WITH eu AS (SELECT id FROM customers WHERE region = 'EU'), apac AS (SELECT id FROM customers WHERE region = 'APAC') SELECT (SELECT COUNT(*) FROM eu) AS eu_n, (SELECT COUNT(*) FROM apac) AS apac_n`,
  cte_shadow: `WITH customers AS (SELECT 1 AS id) SELECT COUNT(*) AS n FROM customers`,
  cte_chain3: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id), frequent AS (SELECT customer_id FROM per WHERE n >= 4) SELECT COUNT(*) AS n FROM frequent`,
  cte_recursive_count: `WITH RECURSIVE seq(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM seq WHERE x < 5) SELECT COUNT(*) AS n, MAX(x) AS mx, SUM(x) AS total FROM seq`,
  cte_recursive_sum10: `WITH RECURSIVE seq(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM seq WHERE x < 10) SELECT COUNT(*) AS n, SUM(x) AS total FROM seq`,
  cte_recursive_no_kw: `WITH seq(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM seq WHERE x < 5) SELECT COUNT(*) AS n FROM seq`,
  cte_recursive_union_dedup: `WITH RECURSIVE seq(x) AS (SELECT 1 UNION SELECT x+1 FROM seq WHERE x < 5) SELECT COUNT(*) AS n FROM seq`,
  cte_recursive_double: `WITH RECURSIVE d(x) AS (SELECT 1 UNION ALL SELECT x*2 FROM d WHERE x < 50) SELECT COUNT(*) AS n, SUM(x) AS total FROM d`,
  cte_recursive_down: `WITH RECURSIVE d(x) AS (SELECT 3 UNION ALL SELECT x-1 FROM d WHERE x > 0) SELECT COUNT(*) AS n, MAX(x) AS mx, MIN(x) AS mn FROM d`,
  cte_recursive_harmless_kw: `WITH RECURSIVE t AS (SELECT 1 AS x) SELECT COUNT(*) AS n FROM t`,

  // ---------- CTE error texts (verbatim) ----------
  cte_err_forward: `WITH b AS (SELECT * FROM a), a AS (SELECT 1 AS x) SELECT * FROM b`,
  cte_err_dup_name: `WITH a AS (SELECT 1 AS x), a AS (SELECT 2 AS y) SELECT * FROM a`,
  cte_err_missing_comma: `WITH a AS (SELECT 1 AS x) b AS (SELECT 2 AS y) SELECT * FROM b`,
  cte_err_typo_final: `WITH per AS (SELECT 1 AS x) SELECT * FROM per2`,
  cte_err_inner_col: `WITH a AS (SELECT 1 AS x), b AS (SELECT * FROM a WHERE z = 1) SELECT * FROM b`,
  cte_err_stray_with: `WITH a AS (SELECT 1), WITH b AS (SELECT 2) SELECT * FROM b`,

  // ---------- subquery edge receipts ----------
  sq_empty_eq: `SELECT COUNT(*) AS n FROM customers WHERE region = (SELECT region FROM customers WHERE 1 = 0)`,
  sq_empty_in: `SELECT COUNT(*) AS n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE 1 = 0)`,
  sq_empty_not_in: `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE 1 = 0)`,
  sq_empty_exists: `SELECT COUNT(*) AS n FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE 1 = 0)`,
  sq_empty_not_exists: `SELECT COUNT(*) AS n FROM customers WHERE NOT EXISTS (SELECT 1 FROM orders WHERE 1 = 0)`,
  sq_not_in_null_list: `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT 7 UNION ALL SELECT NULL)`,
  sq_in_null_list: `SELECT COUNT(*) AS n FROM customers WHERE id IN (SELECT 7 UNION ALL SELECT NULL)`,
  sq_not_in_live_nulls: `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT shipped_at FROM orders WHERE status = 'pending')`,
  sq_eq_null_scalar: `SELECT COUNT(*) AS n FROM customers WHERE region = (SELECT NULL)`,
  sq_multirow_scalar: `SELECT COUNT(*) AS n FROM customers WHERE region = (SELECT region FROM customers ORDER BY id LIMIT 2)`,
  sq_multirow_first_val: `SELECT (SELECT region FROM customers ORDER BY id LIMIT 2) AS first_val`,
  sq_multirow_sel_list: `SELECT (SELECT region FROM customers) AS r`,
  sq_scalar_count_vs_sum: `SELECT (SELECT COUNT(*) FROM orders WHERE status = 'nope') AS c, (SELECT SUM(total) FROM orders WHERE status = 'nope') AS s`,
  sq_scalar_sum_cancelled_per_cust: `SELECT SUM(s = 0) AS zero_rows, SUM(s IS NULL) AS null_rows, SUM(s > 0) AS pos_rows FROM (SELECT (SELECT SUM(o.total) FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled') AS s FROM customers c)`,
  sq_scalar_count_per_cust: `SELECT SUM(s = 0) AS zero_rows, SUM(s > 0) AS pos_rows FROM (SELECT (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled') AS s FROM customers c)`,
  sq_corr_select_list: `SELECT COUNT(*) AS rows_n, SUM(n) AS sum_orders, MAX(n) AS max_n FROM (SELECT (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n FROM customers c)`,
  sq_above_own_avg: `SELECT COUNT(*) AS n FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`,
  sq_top3_in: `SELECT COUNT(*) AS n FROM customers WHERE id IN (SELECT customer_id FROM orders GROUP BY customer_id ORDER BY COUNT(*) DESC LIMIT 3)`,
  sq_top3_in_names: `SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders GROUP BY customer_id ORDER BY COUNT(*) DESC LIMIT 3) ORDER BY name`,
  sq_corr_exists_empty_match: `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')`,

  // ---------- subquery error texts (verbatim) ----------
  sq_err_outer_col_derived: `SELECT name FROM (SELECT customer_id FROM orders)`,
  sq_err_inner_col: `SELECT id FROM customers WHERE id IN (SELECT nope FROM orders)`,
  sq_err_agg_in_where: `SELECT id FROM orders WHERE total > AVG(total)`,
  sq_err_two_cols: `SELECT id FROM customers WHERE id = (SELECT id, region FROM customers LIMIT 1)`,
  sq_err_typo_table: `SELECT id FROM customers WHERE id IN (SELECT customer_id FROM ords)`,
  sq_err_alias_in_where: `SELECT customer_id AS n FROM orders WHERE n > 4`,
  sq_err_corr_typo: `SELECT name FROM customers c WHERE c.nmae = 'x'`,
  sq_err_missing_in_parens: `SELECT id FROM customers WHERE id IN SELECT customer_id FROM orders`,
  sq_err_unclosed: `SELECT id FROM customers WHERE id IN (SELECT customer_id FROM orders`,
};

let fails = 0;
for (const [name, sql] of Object.entries(QUERIES)) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`== ${name} ==`);
    for (const r of rows.slice(0, 20)) console.log("  ", JSON.stringify(r));
    if (rows.length > 20) console.log(`   ... ${rows.length} rows`);
  } catch (e) {
    console.log(`== ${name} == ERROR: ${(e as Error).message}`);
    fails++;
  }
}
console.log(`\n(${Object.keys(QUERIES).length} probes, ${fails} errored — error-text probes are EXPECTED to error)`);
rmSync(COPY);
