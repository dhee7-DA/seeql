// Ground-truth receipts for the Module 2 ON-vs-WHERE drill set (dr2-ow-*).
// Run: bun scripts/m2-facts-ow.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2fc.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const QUERIES: Record<string, string> = {
  // --- INNER JOIN: the two placements are equivalent ---
  ow_inner_pending_where: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'pending'`,
  ow_inner_pending_on: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id AND o.status = 'pending'`,
  ow_active_count: `SELECT COUNT(*) AS n FROM customers WHERE active = 1`,
  ow_inner_active_where: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.active = 1`,
  ow_inner_active_on: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id AND c.active = 1`,
  // --- canonical demo: LEFT JOIN, pending in ON vs WHERE ---
  ow_left_pending_on: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'`,
  ow_left_pending_on_matched: `SELECT COUNT(*) AS rows_n, COUNT(o.id) AS matched, COUNT(c.id) AS cust_matched FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'`,
  ow_left_pending_on_nulls: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL`,
  ow_left_pending_where: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'pending'`,
  ow_left_pending_or_keep: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.status = 'pending' OR o.id IS NULL`,
  ow_pending_customers: `SELECT COUNT(DISTINCT o.customer_id) AS n FROM orders o WHERE o.status = 'pending'`,
  ow_pending_customer_names: `SELECT c.name, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'pending' GROUP BY c.id ORDER BY c.name`,
  ow_alice_pending: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen' AND o.status = 'pending'`,
  // --- unshipped variant (shipped_at IS NULL in ON) ---
  ow_left_unshipped_on: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.shipped_at IS NULL`,
  ow_left_unshipped_on_nulls: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.shipped_at IS NULL WHERE o.id IS NULL`,
  ow_unshipped_customers: `SELECT COUNT(DISTINCT o.customer_id) AS n FROM orders o WHERE o.shipped_at IS NULL`,
  // --- predicate on the LEFT table: same in either spot for matching, but ON keeps NULL rows ---
  ow_left_eu_on: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND c.region = 'EU'`,
  ow_left_eu_where: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE c.region = 'EU'`,
  ow_left_eu_on_nulls: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND c.region = 'EU' WHERE o.id IS NULL`,
  ow_left_eu_pending_on: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE c.region = 'EU'`,
  ow_eu_pending_customers: `SELECT COUNT(DISTINCT o.customer_id) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'pending' AND c.region = 'EU'`,
  ow_left_eu_pending_keep: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE c.region = 'EU' AND (o.status = 'pending' OR o.id IS NULL)`,
  // --- LATAM edge: Bruno's orders and statuses ---
  ow_bruno_orders: `SELECT o.id, o.status, o.shipped_at IS NULL AS unshipped FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Bruno Silva' ORDER BY o.id`,
  ow_left_latam_pending: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE c.region = 'LATAM'`,
  // --- sentinel quality: real NULLs in status? id? ---
  ow_status_real_nulls: `SELECT COUNT(*) AS n FROM orders WHERE status IS NULL`,
  ow_id_real_nulls: `SELECT COUNT(*) AS n FROM orders WHERE id IS NULL`,
  ow_shipped_real_nulls: `SELECT COUNT(*) AS n FROM orders WHERE shipped_at IS NULL`,
  // --- anti-joins ---
  ow_anti_plain: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`,
  ow_anti_pending: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL`,
  ow_anti_invoice_names: `SELECT c.name FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL ORDER BY c.name`,
  ow_invoices_left: `SELECT COUNT(*) AS rows_n, COUNT(i.id) AS matched FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id`,
  ow_invoices_no_pay: `SELECT COUNT(*) AS n, COUNT(p.id) AS paid_rows FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id`,
  // --- aggregates over NULL-filled rows ---
  ow_left_sum_total: `SELECT ROUND(SUM(o.total),2) AS s, COUNT(*) AS rows_n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id`,
  // --- error probes (try/catch prints real text) ---
};

const ERRORS: Record<string, string> = {
  ow_err_ambiguous_id: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE id IS NULL`,
  ow_err_eq_null: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = NULL`,
  ow_err_and_where: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND WHERE o.status = 'pending'`,
};

for (const [name, sql] of Object.entries(QUERIES)) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`== ${name} ==`);
    for (const r of rows.slice(0, 12)) console.log("  ", JSON.stringify(r));
    if (rows.length > 12) console.log(`   ... ${rows.length} rows`);
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
