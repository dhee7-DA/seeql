// Follow-up probes for M4-d4 — nailing the surprising behaviors from round 1.
// Run: bun scripts/m4-facts-d4b.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m4d4.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const QUERIES: Record<string, string> = {
  // --- CTE forward-reference semantics on SQLite 3.53 (round-1 surprise) ---
  fwd1: `WITH b AS (SELECT * FROM a), a AS (SELECT 1 AS x) SELECT * FROM b`,
  fwd2_real_cols: `WITH b AS (SELECT customer_id FROM reallater), reallater AS (SELECT id AS customer_id FROM customers) SELECT COUNT(*) AS n FROM b`,
  fwd3_undefined: `WITH a AS (SELECT * FROM b) SELECT * FROM a`,
  fwd4_circular: `WITH a AS (SELECT * FROM b), b AS (SELECT * FROM a) SELECT * FROM a`,
  fwd5_later_order: `WITH z AS (SELECT 9 AS x), y AS (SELECT x+1 AS x FROM z) SELECT * FROM y`,

  // --- CTE scope exposes only the select list; alias typos ---
  cte_err_region_not_in_list: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) SELECT region FROM per`,
  cte_err_alias_typo_where: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) SELECT customer_id FROM per WHERE cnt > 4`,
  cte_in_derived: `SELECT COUNT(*) AS n FROM (WITH per AS (SELECT 1 AS x) SELECT x FROM per)`,
  cte_main_sees_all: `WITH a AS (SELECT 1 AS x), b AS (SELECT 2 AS y) SELECT (SELECT x FROM a) AS ax, (SELECT y FROM b) AS by`,

  // --- recursive boundary details ---
  rec_seq_values: `WITH RECURSIVE seq(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM seq WHERE x < 5) SELECT GROUP_CONCAT(x) AS vals FROM seq`,
  rec_down_values: `WITH RECURSIVE d(x) AS (SELECT 3 UNION ALL SELECT x-1 FROM d WHERE x > 0) SELECT GROUP_CONCAT(x) AS vals FROM d`,
  rec_double_values: `WITH RECURSIVE d(x) AS (SELECT 1 UNION ALL SELECT x*2 FROM d WHERE x < 50) SELECT GROUP_CONCAT(x) AS vals FROM d`,
  rec_guard_zero_passes: `WITH RECURSIVE d(x) AS (SELECT 0 UNION ALL SELECT x+1 FROM d WHERE x < 0) SELECT COUNT(*) AS n FROM d`,

  // --- subquery extra receipts ---
  sq_in_orderers: `SELECT COUNT(*) AS n FROM customers WHERE id IN (SELECT customer_id FROM orders)`,
  sq_not_in_orderers: `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)`,
  sq_above_store_avg: `SELECT COUNT(*) AS n FROM orders WHERE total > (SELECT AVG(total) FROM orders)`,
  sq_store_avg: `SELECT AVG(total) AS avg_total FROM orders`,
  sq_max_total: `SELECT MAX(total) AS mx FROM orders`,
  sq_eq_max: `SELECT COUNT(*) AS n FROM orders WHERE total = (SELECT MAX(total) FROM orders)`,
  sq_uncorr_once: `SELECT COUNT(*) AS rows_n, MIN(s) AS mn, MAX(s) AS mx FROM (SELECT (SELECT COUNT(*) FROM orders) AS s FROM customers)`,
  sq_derived_scope_id: `SELECT name FROM (SELECT customer_id FROM orders) WHERE id > 3`,
  sq_corr_inner_ok: `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')`,
  sq_in_scalar_list: `SELECT COUNT(*) AS n FROM customers WHERE region IN ('EU', 'APAC')`,
  sq_not_in_two_nulls: `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT NULL)`,
  sq_scalar_paren_count: `SELECT (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS pend`,

  // --- multi-row scalar with ORDER BY DESC flips the silent pick ---
  sq_multirow_desc: `SELECT COUNT(*) AS n FROM customers WHERE region = (SELECT region FROM customers ORDER BY id DESC LIMIT 2)`,
  sq_multirow_desc_val: `SELECT (SELECT region FROM customers ORDER BY id DESC LIMIT 2) AS first_val`,
  sq_id_desc_first: `SELECT id FROM customers ORDER BY id DESC LIMIT 1`,
  sq_id_asc_first: `SELECT id FROM customers ORDER BY id LIMIT 1`,
};

let fails = 0;
for (const [name, sql] of Object.entries(QUERIES)) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`== ${name} ==`);
    for (const r of rows.slice(0, 20)) console.log("  ", JSON.stringify(r));
  } catch (e) {
    console.log(`== ${name} == ERROR: ${(e as Error).message}`);
    fails++;
  }
}
console.log(`\n(${Object.keys(QUERIES).length} probes, ${fails} errored)`);
rmSync(COPY);
