import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
const SRC = "db/custom.db", COPY = ".m4q3.db";
rmSync(COPY, { force: true });
copyFileSync(SRC, COPY);
const db = new Database(COPY, { readonly: true });
const q = (label: string, sql: string) => {
  try { console.log(label + ":", JSON.stringify(db.query(sql).all())); }
  catch (e) { console.log(label + " ERROR:", e instanceof Error ? e.message : String(e)); }
};

// q4 correlated receipts
q("corr_above_own_avg", `SELECT COUNT(*) AS n FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`);
q("corr_below_own_avg", `SELECT COUNT(*) AS n FROM orders o WHERE o.total < (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`);
q("corr_eq_own_avg", `SELECT COUNT(*) AS n FROM orders o WHERE o.total = (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`);
q("corr_above_own_avg_big", `SELECT COUNT(*) AS n FROM orders o WHERE o.total > 2 * (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`);
q("corr_cust_above_own", `SELECT c.name, COUNT(*) AS n FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = c.id) GROUP BY c.id ORDER BY n DESC LIMIT 6`);
q("corr_bruno", `SELECT c.name, COUNT(*) AS n, SUM(o.total) AS spend FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.region = 'LATAM' GROUP BY c.id`);
q("corr_max_per_cust_ge", `SELECT COUNT(*) AS n FROM customers c WHERE (SELECT MAX(o.total) FROM orders o WHERE o.customer_id = c.id) >= 700`);
q("corr_max_per_cust_list", `SELECT c.name, (SELECT MAX(o.total) FROM orders o WHERE o.customer_id = c.id) AS mx FROM customers c ORDER BY mx DESC LIMIT 5`);
q("corr_zero_orders", `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`);
q("corr_above_store_avg", `SELECT COUNT(*) AS n FROM orders o WHERE o.total > (SELECT AVG(total) FROM orders)`);
q("corr_status_mismatch", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled') AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')`);
q("corr_pending_only", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending') AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status IN ('delivered','shipped'))`);

// q5 derived receipts
q("der_mean_orders", `SELECT ROUND(AVG(n),4) AS mean, SUM(n >= 6.4375) AS ge_mean, SUM(n > 10) AS gt10 FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`);
q("der_join_names", `SELECT c.name, per.n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) per JOIN customers c ON c.id = per.customer_id WHERE per.n >= 13 ORDER BY per.n DESC`);
q("der_sum_regions", `SELECT r.region, SUM(r.n) AS total_orders FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) per JOIN customers c ON c.id = per.customer_id JOIN (SELECT region, id FROM customers) r ON r.id = c.id GROUP BY r.region`);
q("der_hav_ge13", `SELECT COUNT(*) AS n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n >= 13`);
q("der_hav_gt13", `SELECT COUNT(*) AS n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n > 13`);
q("der_region_stage", `SELECT region, n FROM (SELECT region, COUNT(*) AS n FROM customers GROUP BY region) WHERE n > 4`);
q("der_region_sum", `SELECT SUM(n) AS orders_in_big_regions FROM (SELECT region, COUNT(*) AS n FROM customers GROUP BY region) WHERE n > 4`);
q("der_status_stage", `SELECT status, n FROM (SELECT status, COUNT(*) AS n FROM orders GROUP BY status) WHERE n >= 30`);
q("der_status_sum", `SELECT SUM(n) AS big_status_orders FROM (SELECT status, COUNT(*) AS n FROM orders GROUP BY status) WHERE n >= 30`);
q("der_top3", `SELECT COUNT(*) AS rows3, ROUND(AVG(n),1) AS avg3, SUM(n) AS sum3 FROM (SELECT n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) ORDER BY n DESC LIMIT 3)`);
q("der_minmax", `SELECT MIN(n) AS mn, MAX(n) AS mx FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`);
q("der_distinct_n", `SELECT COUNT(DISTINCT n) AS dn FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`);
q("der_nested_stage", `SELECT COUNT(*) AS n, ROUND(AVG(n),1) AS a FROM (SELECT n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n >= 13)`);
q("der_inner_limit0", `SELECT COUNT(*) AS c FROM (SELECT customer_id, n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) LIMIT 0)`);
q("der_spend_stage", `SELECT COUNT(*) AS big_spenders FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) WHERE spend > 2000`);
q("der_spend_top", `SELECT c.name, s.spend FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) s JOIN customers c ON c.id = s.customer_id ORDER BY s.spend DESC LIMIT 3`);
q("der_avg_spend", `SELECT ROUND(AVG(spend),2) AS mean_spend FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id)`);

// q6 CTE basics receipts
q("cte_vip", `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) SELECT COUNT(*) AS vips FROM per WHERE n >= 20`);
q("cte_ge5", `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) SELECT COUNT(*) AS n5 FROM per WHERE n >= 5`);
q("cte_regions", `WITH by_region AS (SELECT region, COUNT(*) AS n FROM customers GROUP BY region) SELECT COUNT(*) AS big FROM by_region WHERE n > 4`);
q("cte_two", `WITH eu AS (SELECT id FROM customers WHERE region = 'EU'), apac AS (SELECT id FROM customers WHERE region = 'APAC') SELECT (SELECT COUNT(*) FROM eu) AS eu_n, (SELECT COUNT(*) FROM apac) AS apac_n`);
q("cte_status_stage", `WITH st AS (SELECT status, COUNT(*) AS n FROM orders GROUP BY status) SELECT * FROM st WHERE n < 10`);
q("cte_select_list", `WITH per AS (SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id) SELECT COUNT(*) FROM per WHERE n > 3`);
q("cte_select_list2", `WITH per AS (SELECT customer_id, COUNT(*) AS cnt FROM orders GROUP BY customer_id) SELECT COUNT(*) FROM per WHERE cnt > 3`);
q("cte_reuse", `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) SELECT (SELECT COUNT(*) FROM per WHERE n >= 10) AS heavy, (SELECT COUNT(*) FROM per WHERE n < 10) AS light FROM per LIMIT 1`);

// q7 CTE chains receipts
q("chain3", `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id), big AS (SELECT customer_id, n FROM per WHERE n >= 13) SELECT COUNT(*) AS n FROM big JOIN customers c ON c.id = big.customer_id WHERE c.region = 'EU'`);
q("chain3_all", `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id), big AS (SELECT customer_id, n FROM per WHERE n >= 13) SELECT c.name, big.n FROM big JOIN customers c ON c.id = big.customer_id ORDER BY big.n DESC`);
q("chain_spend_region", `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id), big AS (SELECT customer_id, s FROM spend WHERE s > 2000) SELECT c.region, COUNT(*) AS n FROM big JOIN customers c ON c.id = big.customer_id GROUP BY c.region`);
q("chain_pending", `WITH hold AS (SELECT customer_id FROM orders WHERE status = 'pending'), cold AS (SELECT customer_id, COUNT(*) AS pn FROM hold GROUP BY customer_id) SELECT COUNT(*) AS n FROM cold WHERE pn >= 2`);
q("chain_pending_list", `WITH hold AS (SELECT customer_id FROM orders WHERE status = 'pending'), cold AS (SELECT customer_id, COUNT(*) AS pn FROM hold GROUP BY customer_id) SELECT c.name, cold.pn FROM cold JOIN customers c ON c.id = cold.customer_id ORDER BY cold.pn DESC LIMIT 4`);
q("chain_cancel_region", `WITH gone AS (SELECT customer_id FROM orders WHERE status = 'cancelled'), reg AS (SELECT c.region, COUNT(*) AS n FROM gone JOIN customers c ON c.id = gone.customer_id GROUP BY c.region) SELECT * FROM reg ORDER BY n DESC`);
q("chain_avg_of_avg", `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) SELECT ROUND(AVG(n),4) AS m FROM per`);

// q8 capstone receipts
q("cap_all4", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='delivered') AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='shipped') AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='pending') AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='cancelled')`);
q("cap_all4_names", `SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='delivered') AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='shipped') AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='pending') AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='cancelled')`);
q("cap_vip_orders", `SELECT COUNT(*) AS n FROM orders WHERE customer_id = (SELECT id FROM customers WHERE name = 'Alice Chen')`);
q("cap_vip_spend", `SELECT SUM(total) AS s FROM orders WHERE customer_id = (SELECT id FROM customers WHERE name = 'Alice Chen')`);
q("cap_ge700", `SELECT COUNT(*) AS n FROM orders WHERE total >= 700`);
q("cap_ge700_custs", `SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE total >= 700`);
q("cap_mean_spend", `WITH s AS (SELECT customer_id, SUM(total) AS sp FROM orders GROUP BY customer_id) SELECT ROUND(AVG(sp),2) AS m, SUM(sp > (SELECT AVG(sp) FROM s)) AS above FROM s`);
q("cap_uncorr_in_with", `WITH eu AS (SELECT id FROM customers WHERE region = 'EU') SELECT COUNT(*) AS n FROM orders WHERE customer_id IN (SELECT id FROM eu)`);
q("cap_uncorr_not_in", `WITH eu AS (SELECT id FROM customers WHERE region = 'EU') SELECT COUNT(*) AS n FROM orders WHERE customer_id NOT IN (SELECT id FROM eu)`);
q("cap_scalar_vs_in", `SELECT (SELECT COUNT(*) FROM customers WHERE region='EU') AS eu_list, (SELECT COUNT(*) FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region='EU')) AS eu_orders`);

db.close();
rmSync(COPY, { force: true });
console.log("(m4-facts-q3 done)");
