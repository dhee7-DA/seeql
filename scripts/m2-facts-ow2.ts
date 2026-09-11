// Follow-up receipts: =NULL behavior value + multi-payment invoice count.
// Run: bun scripts/m2-facts-ow2.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2fc.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const QUERIES: Record<string, string> = {
  ow_eq_null_count: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.status = NULL`,
  ow_eq_null_plain: `SELECT COUNT(*) AS n FROM orders WHERE status = NULL`,
  ow_inv_multi_pay: `SELECT COUNT(*) AS n FROM (SELECT invoice_id FROM payments GROUP BY invoice_id HAVING COUNT(*) > 1)`,
  ow_inv_unpaid: `SELECT COUNT(*) AS n FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL`,
};

for (const [name, sql] of Object.entries(QUERIES)) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`== ${name} ==`, JSON.stringify(rows));
  } catch (e) {
    console.log(`== ${name} == ERROR: ${(e as Error).message}`);
  }
}

rmSync(COPY);
