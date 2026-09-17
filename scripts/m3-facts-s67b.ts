// Deep fact probe for Module 3 case batches s6–s8 (CASE WHEN / pivots / set+CASE capstone).
// Every candidate case query is run here; outputs become the receipts used in authoring.
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.m3w67.db");
const db = new Database("scripts/.m3w67.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();

const probes: Array<[string, string]> = [
  // --- invoices / ledger shape ---
  ["invoice status census", "SELECT status, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM invoices GROUP BY status ORDER BY n DESC"],
  ["ledger account census", "SELECT account, COUNT(*) AS n, ROUND(SUM(debit_cents)/100.0,2) AS debits, ROUND(SUM(credit_cents)/100.0,2) AS credits FROM ledger_entries GROUP BY account ORDER BY n DESC"],

  // --- s6: CASE WHEN branch queries ---
  ["s6 status buckets row", "SELECT SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered, SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) AS shipped, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled FROM orders"],
  ["s6 size bands counts", "SELECT CASE WHEN total < 100 THEN 'small' WHEN total < 500 THEN 'mid' ELSE 'large' END AS band, COUNT(*) AS n FROM orders GROUP BY band ORDER BY n DESC"],
  ["s6 price bands products", "SELECT CASE WHEN price < 50 THEN 'budget' WHEN price <= 200 THEN 'standard' ELSE 'premium' END AS band, COUNT(*) AS n FROM products GROUP BY band ORDER BY n DESC"],
  ["s6 status labels", "SELECT status, CASE WHEN status = 'cancelled' THEN 'dead' WHEN status = 'pending' THEN 'waiting' ELSE 'moving' END AS bucket, COUNT(*) AS n FROM orders GROUP BY status, bucket ORDER BY n DESC"],
  ["s6 stock bands", "SELECT CASE WHEN stock = 0 THEN 'out' WHEN stock < 20 THEN 'low' ELSE 'healthy' END AS band, COUNT(*) AS n FROM products GROUP BY band ORDER BY n DESC"],
  ["s6 delivered vs rest", "SELECT CASE WHEN status = 'delivered' THEN 1 ELSE 0 END AS is_done, COUNT(*) AS n FROM orders GROUP BY is_done ORDER BY is_done"],
  ["s6 big orders", "SELECT CASE WHEN total >= 500 THEN 'flag' ELSE 'ok' END AS flag, COUNT(*) AS n, ROUND(SUM(total),2) AS money FROM orders GROUP BY flag"],
  ["s6 invoice band", "SELECT CASE WHEN status = 'paid' THEN 1 ELSE 0 END AS paid, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM invoices GROUP BY paid"],
  ["s6 supplier rating bands", "SELECT CASE WHEN rating >= 4.5 THEN 'star' WHEN rating >= 4 THEN 'solid' ELSE 'watch' END AS band, COUNT(*) AS n FROM suppliers GROUP BY band ORDER BY n DESC"],
  ["s6 expense size bands", "SELECT CASE WHEN amount_cents >= 100000 THEN 'major' WHEN amount_cents >= 20000 THEN 'normal' ELSE 'minor' END AS band, COUNT(*) AS n FROM expenses GROUP BY band ORDER BY n DESC"],
  ["s6 case in order by top5", "SELECT id, status, total FROM orders WHERE status = 'delivered' ORDER BY CASE WHEN total > 400 THEN 0 ELSE 1 END, total DESC LIMIT 5"],
  ["s6 null-ish shipped", "SELECT CASE WHEN shipped_at IS NULL THEN 1 ELSE 0 END AS unshipped, COUNT(*) AS n FROM orders GROUP BY unshipped ORDER BY unshipped"],
  ["s6 first-match band order", "SELECT CASE WHEN total >= 1000 THEN 'A' WHEN total >= 400 THEN 'B' WHEN total >= 100 THEN 'C' ELSE 'D' END AS band, COUNT(*) AS n, ROUND(SUM(total),2) AS money FROM orders GROUP BY band ORDER BY band"],
  ["s6 active flag", "SELECT CASE WHEN active = 1 THEN 'live' ELSE 'churned' END AS state, COUNT(*) AS n FROM customers GROUP BY state"],
  ["s6 cancelled money", "SELECT ROUND(SUM(CASE WHEN status = 'cancelled' THEN total ELSE 0 END),2) AS cancelled_money, ROUND(SUM(total),2) AS all_money FROM orders"],

  // --- s7: pivot matrices ---
  ["s7 status pivot one row", "SELECT COUNT(CASE WHEN status = 'delivered' THEN 1 END) AS delivered, COUNT(CASE WHEN status = 'shipped' THEN 1 END) AS shipped, COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending FROM orders"],
  ["s7 region x status pivot", "SELECT c.region, SUM(CASE WHEN o.status IN ('delivered','shipped') THEN 1 ELSE 0 END) AS done, SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS waiting FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY c.region"],
  ["s7 region money pivot", "SELECT c.region, ROUND(SUM(CASE WHEN o.status = 'delivered' THEN o.total ELSE 0 END),2) AS delivered_money, ROUND(SUM(CASE WHEN o.status = 'cancelled' THEN o.total ELSE 0 END),2) AS lost_money FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY c.region"],
  ["s7 category stock pivot", "SELECT category, SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS out_n, SUM(CASE WHEN stock BETWEEN 1 AND 19 THEN 1 ELSE 0 END) AS low_n, SUM(CASE WHEN stock >= 20 THEN 1 ELSE 0 END) AS healthy_n FROM products GROUP BY category ORDER BY category"],
  ["s7 expense month pivot", "SELECT substr(spent_on,1,7) AS m, ROUND(SUM(CASE WHEN category = 'Rent' THEN amount_cents ELSE 0 END)/100.0,2) AS rent, ROUND(SUM(CASE WHEN category = 'Ads' THEN amount_cents ELSE 0 END)/100.0,2) AS ads FROM expenses GROUP BY m ORDER BY m"],
  ["s7 payment method pivot", "SELECT substr(paid_on,1,7) AS m, ROUND(SUM(CASE WHEN method = 'card' THEN amount_cents ELSE 0 END)/100.0,2) AS card, ROUND(SUM(CASE WHEN method = 'wire' THEN amount_cents ELSE 0 END)/100.0,2) AS wire FROM payments GROUP BY m ORDER BY m"],
  ["s7 invoice status pivot by month", "SELECT substr(issued_on,1,7) AS m, SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_n, SUM(CASE WHEN status <> 'paid' THEN 1 ELSE 0 END) AS open_n FROM invoices GROUP BY m ORDER BY m"],
  ["s7 pivot band x status", "SELECT CASE WHEN total < 100 THEN 'small' WHEN total < 500 THEN 'mid' ELSE 'large' END AS band, SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered, SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled FROM orders GROUP BY band ORDER BY band"],
  ["s7 supplier join pivot", "SELECT s.region, COUNT(p.id) AS products, SUM(CASE WHEN p.stock = 0 THEN 1 ELSE 0 END) AS out_n FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.region ORDER BY s.region"],
  ["s7 items qty bands", "SELECT CASE WHEN quantity >= 3 THEN 'bulk' WHEN quantity = 2 THEN 'pair' ELSE 'single' END AS band, COUNT(*) AS n FROM order_items GROUP BY band ORDER BY n DESC"],
  ["s7 ledger side pivot", "SELECT account, ROUND(SUM(debit_cents)/100.0,2) AS debits, ROUND(SUM(credit_cents)/100.0,2) AS credits FROM ledger_entries GROUP BY account ORDER BY account"],
  ["s7 pivot price bands x category", "SELECT category, SUM(CASE WHEN price < 100 THEN 1 ELSE 0 END) AS under100, SUM(CASE WHEN price >= 100 THEN 1 ELSE 0 END) AS over100 FROM products GROUP BY category ORDER BY category"],

  // --- s8: set op + CASE capstones ---
  ["s8 union labeled money", "SELECT 'orders' AS src, ROUND(SUM(total),2) AS money FROM orders UNION ALL SELECT 'expenses', ROUND(SUM(amount_cents)/100.0,2) FROM expenses"],
  ["s8 case label union", "SELECT CASE WHEN status IN ('delivered','shipped') THEN 'gone' ELSE 'held' END AS bucket, COUNT(*) AS n FROM orders GROUP BY bucket UNION ALL SELECT 'expenses', COUNT(*) FROM expenses"],
  ["s8 union invoices payments", "SELECT 'invoiced' AS src, ROUND(SUM(amount_cents)/100.0,2) AS money FROM invoices UNION ALL SELECT 'paid', ROUND(SUM(amount_cents)/100.0,2) FROM payments"],
  ["s8 except big products", "SELECT id FROM products WHERE price >= 200 EXCEPT SELECT product_id FROM order_items"],
  ["s8 intersect cheap sold", "SELECT id FROM products WHERE price < 100 INTERSECT SELECT product_id FROM order_items"],
  ["s8 union counts stack", "SELECT 'customers' AS what, COUNT(*) AS n FROM customers UNION ALL SELECT 'products', COUNT(*) FROM products UNION ALL SELECT 'orders', COUNT(*) FROM orders UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers"],
  ["s8 case pivot union arms", "SELECT 'storefront' AS src, ROUND(SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END),2) AS good_money FROM orders UNION ALL SELECT 'bills', ROUND(SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END)/100.0,2) FROM invoices"],
  ["s8 region union stack", "SELECT region, COUNT(*) AS n FROM customers WHERE region = 'EU' GROUP BY region UNION ALL SELECT 'products:' || category, COUNT(*) FROM products WHERE category IN ('Audio','Video') GROUP BY category"],
  ["s8 except delivered big", "SELECT id FROM orders WHERE total >= 400 EXCEPT SELECT id FROM orders WHERE status = 'cancelled'"],
  ["s8 intersect pending premium", "SELECT customer_id FROM orders WHERE status = 'pending' INTERSECT SELECT customer_id FROM orders WHERE total >= 400"],
  ["s8 union band rows", "SELECT 'band:' || CASE WHEN price < 50 THEN 'budget' WHEN price <= 200 THEN 'standard' ELSE 'premium' END AS k, COUNT(*) AS n FROM products GROUP BY k UNION ALL SELECT 'cat:' || category, COUNT(*) FROM products WHERE category = 'Audio' GROUP BY category"],
  ["s8 money compare rows", "SELECT 'delivered' AS k, ROUND(SUM(total),2) AS money FROM orders WHERE status = 'delivered' UNION ALL SELECT 'cancelled', ROUND(SUM(total),2) FROM orders WHERE status = 'cancelled' UNION ALL SELECT 'open', ROUND(SUM(total),2) FROM orders WHERE status IN ('pending','shipped')"],
];

for (const [label, sql] of probes) {
  try {
    const rows = q(sql);
    console.log(`\n== ${label} ==`);
    console.log(JSON.stringify(rows));
  } catch (e) {
    console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : e}`);
  }
}
db.close();
