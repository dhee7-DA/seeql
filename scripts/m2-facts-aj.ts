// Ground-truth receipts for the Anti-join drill set (dr2-aj-*).
// Run: bun scripts/m2-facts-aj.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2fb.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const QUERIES: Record<string, string> = {
  // --- customers without invoices (the honest live demo) ---
  aj_no_invoice_count: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL`,
  aj_no_invoice_who: `SELECT c.name, c.region FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL ORDER BY c.name`,
  aj_not_in_invoices: `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices)`,
  aj_not_exists_invoices: `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id)`,
  aj_with_invoices: `SELECT COUNT(DISTINCT customer_id) AS n FROM invoices`,
  aj_leftjoin_total: `SELECT COUNT(*) AS rows_n, COUNT(i.id) AS matched_n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id`,
  aj_inner_plus_null: `SELECT COUNT(*) AS n FROM customers c JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL`,
  aj_leftkey_null_test: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE c.id IS NULL`,
  aj_having_zero: `SELECT COUNT(*) AS n FROM (SELECT c.id FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id GROUP BY c.id HAVING COUNT(i.id) = 0)`,
  // --- NOT IN / NULL collapse ---
  aj_payments_null_invoice: `SELECT COUNT(*) AS n FROM payments WHERE invoice_id IS NULL`,
  aj_payments_total: `SELECT COUNT(*) AS n, COUNT(DISTINCT invoice_id) AS d FROM payments`,
  aj_not_in_payments: `SELECT COUNT(*) AS n FROM invoices i WHERE i.id NOT IN (SELECT p.invoice_id FROM payments p)`,
  aj_not_in_payments_guarded: `SELECT COUNT(*) AS n FROM invoices i WHERE i.id NOT IN (SELECT p.invoice_id FROM payments p WHERE p.invoice_id IS NOT NULL)`,
  aj_anti_payments: `SELECT COUNT(*) AS n FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL`,
  // --- pending-order variant ---
  aj_no_pending_count: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL`,
  aj_no_pending_who: `SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL ORDER BY c.name`,
  aj_status_in_where: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'pending'`,
  aj_no_pending_not_in: `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'pending')`,
  // --- orphans / empty anti-joins ---
  aj_orphan_orders: `SELECT COUNT(*) AS n FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE c.id IS NULL`,
  aj_products_never_sold: `SELECT COUNT(*) AS n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL`,
  aj_suppliers_no_products: `SELECT COUNT(*) AS n FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id WHERE p.id IS NULL`,
  aj_suppliers_no_products_who: `SELECT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id WHERE p.id IS NULL ORDER BY s.name`,
  // --- double anti-join + nullable detector columns ---
  aj_no_invoice_and_no_pending: `SELECT COUNT(*) AS n FROM (SELECT c.id FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE i.id IS NULL AND o.id IS NULL)`,
  aj_invoice_due_null: `SELECT COUNT(*) AS n FROM invoices WHERE due_on IS NULL`,
  aj_paid_on_null: `SELECT COUNT(*) AS n FROM payments WHERE paid_on IS NULL`,
  // --- error shapes ---
  aj_err_ambiguous_on: `SELECT COUNT(*) FROM customers c LEFT JOIN invoices i ON customer_id = id`,
  aj_err_detector_left: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE c.id IS NULL`,
  // --- customers with paid money (via payments chain) ---
  aj_paid_customers: `SELECT COUNT(DISTINCT i.customer_id) AS n FROM payments p JOIN invoices i ON i.id = p.invoice_id`,
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
