// Ground-truth receipts for the Module 2 self-join drill set (dr2-sj-*).
// Run: bun scripts/m2-facts-sj.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2fc.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const QUERIES: Record<string, string> = {
  // --- the guard trio + mirror/self variants (confirming known receipts) ---
  sj_guard_lt: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id`,
  sj_no_guard: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region`,
  sj_guard_lte: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id <= c2.id`,
  sj_guard_neq: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id <> c2.id`,
  sj_self_pairs: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.id = c2.id`,
  sj_region_sizes: `SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC`,
  sj_pair_math: `SELECT region, COUNT(*)*(COUNT(*)-1)/2 AS pairs FROM customers GROUP BY region ORDER BY pairs DESC`,
  // --- per-region cuts ---
  sj_eu_guarded: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id WHERE c1.region = 'EU'`,
  sj_eu_no_guard: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region WHERE c1.region = 'EU'`,
  sj_eu_neq: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id <> c2.id WHERE c1.region = 'EU'`,
  sj_apac_guarded: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id WHERE c1.region = 'APAC'`,
  sj_us_guarded: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id WHERE c1.region = 'US'`,
  sj_latam_guarded: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id WHERE c1.region = 'LATAM'`,
  // --- city / name / id-only variants ---
  sj_city_guarded: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.city = c2.city AND c1.id < c2.id`,
  sj_city_and_region: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.city = c2.city AND c1.region = c2.region AND c1.id < c2.id`,
  sj_name_guard: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.name < c2.name`,
  sj_dup_names: `SELECT COUNT(*) AS n FROM (SELECT name FROM customers GROUP BY name HAVING COUNT(*) > 1)`,
  sj_id_only_guard: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.id < c2.id`,
  sj_cross_self: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2`,
  sj_adjacent_ids: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c2.id = c1.id + 1`,
  sj_adjacent_region_diff: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c2.id = c1.id + 1 WHERE c1.region <> c2.region`,
  // --- canonical query samples ---
  sj_canonical_head: `SELECT c1.name AS pair_a, c2.name AS pair_b, c1.region FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id ORDER BY c1.region, pair_a LIMIT 6`,
  sj_canonical_count: `SELECT COUNT(*) AS n FROM (SELECT c1.name AS pair_a, c2.name AS pair_b, c1.region FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id ORDER BY c1.region, pair_a)`,
  sj_us_names: `SELECT name, city FROM customers WHERE region = 'US' ORDER BY name`,
  sj_latam_names: `SELECT name, city FROM customers WHERE region = 'LATAM'`,
  // --- error-message probes (try/catch below prints the real text) ---
};

const ERRORS: Record<string, string> = {
  sj_err_ambiguous_region: `SELECT COUNT(*) AS n FROM customers JOIN customers ON region = region`,
  sj_err_table_name_after_alias: `SELECT customers.name FROM customers c1 JOIN customers c2 ON c1.region = c2.region`,
  sj_err_unknown_alias: `SELECT c3.name FROM customers c1 JOIN customers c2 ON c1.region = c2.region`,
  sj_err_same_table_no_alias_ok: `SELECT COUNT(*) AS n FROM customers JOIN customers ON customers.id = customers.id`,
};

for (const [name, sql] of Object.entries(QUERIES)) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`== ${name} ==`);
    for (const r of rows.slice(0, 10)) console.log("  ", JSON.stringify(r));
    if (rows.length > 10) console.log(`   ... ${rows.length} rows`);
  } catch (e) {
    console.log(`== ${name} == ERROR: ${(e as Error).message}`);
  }
}

for (const [name, sql] of Object.entries(ERRORS)) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`== ${name} == OK rows=${rows.length}`);
  } catch (e) {
    console.log(`== ${name} == ERROR: ${(e as Error).message}`);
  }
}

rmSync(COPY);
