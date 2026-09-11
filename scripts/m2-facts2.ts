import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
const COPY = "scripts/.m2f2.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const Q: Record<string, string> = {
  inv_paid_multi: `SELECT COUNT(*) AS n FROM (SELECT invoice_id FROM payments GROUP BY invoice_id HAVING COUNT(*) > 1)`,
  payments_per_invoice: `SELECT COUNT(*) AS n_invoices, SUM(CASE WHEN n>=1 THEN 1 ELSE 0 END) AS with_payment FROM (SELECT invoice_id, COUNT(*) AS n FROM payments GROUP BY invoice_id)`,
  invoices_no_payment: `SELECT COUNT(*) AS n FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL`,
  supplier_product_counts: `SELECT s.name, COUNT(p.id) AS n FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY n DESC, s.name`,
  pending_per_customer_top: `SELECT c.name, COUNT(o.id) AS pend FROM customers c JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' GROUP BY c.id ORDER BY pend DESC, c.name LIMIT 5`,
  cust_exactly_one_order: `SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) = 1)`,
  order_max_items: `SELECT o.id, o.total, COUNT(oi.id) AS lines, ROUND(SUM(oi.quantity*oi.unit_price),2) AS items_value FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id ORDER BY lines DESC, o.id LIMIT 3`,
  eu_pair_sample: `SELECT c1.name AS a, c2.name AS b FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id WHERE c1.region = 'EU' ORDER BY a LIMIT 6`,
  eu_raw_vs_items: `SELECT (SELECT ROUND(SUM(total),2) FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='EU') AS raw_orders_sum, (SELECT ROUND(SUM(oi.quantity*oi.unit_price),2) FROM order_items oi JOIN orders o ON o.id=oi.order_id JOIN customers c ON c.id=o.customer_id WHERE c.region='EU') AS items_sum`,
  alice_items: `SELECT COUNT(*) AS n, ROUND(SUM(oi.quantity*oi.unit_price),2) AS v FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen'`,
  alice_raw: `SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS s FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen'`,
  cities_list: `SELECT city, COUNT(*) AS n FROM customers GROUP BY city HAVING n > 1`,
  latam_customers: `SELECT name, city FROM customers WHERE region = 'LATAM'`,
  us_customers: `SELECT name, city FROM customers WHERE region = 'US' ORDER BY name`,
  shipped_null_count: `SELECT COUNT(*) AS n FROM orders WHERE shipped_at IS NULL`,
  one_item_orders_sample: `SELECT o.id, o.total FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id HAVING COUNT(oi.id) = 1 ORDER BY o.id LIMIT 4`,
  sold_via_chain: `SELECT COUNT(DISTINCT oi.product_id) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU'`,
  products_per_region_sold: `SELECT c.region, COUNT(DISTINCT oi.product_id) AS distinct_products FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id GROUP BY c.region`,
  sup_region_products: `SELECT s.region, COUNT(*) AS n FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.region ORDER BY n DESC`,
  cat_suppliers: `SELECT category, COUNT(DISTINCT supplier_id) AS sups, COUNT(*) AS products FROM products GROUP BY category ORDER BY products DESC`,
  pending_eu: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU' AND o.status = 'pending'`,
  void_invoice: `SELECT i.number, c.name, i.amount_cents FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'void'`,
};
for (const [name, sql] of Object.entries(Q)) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`== ${name} ==`);
    for (const r of rows.slice(0, 10)) console.log("  ", JSON.stringify(r));
  } catch (e) { console.log(`== ${name} == ERROR: ${(e as Error).message}`); }
}
rmSync(COPY);
