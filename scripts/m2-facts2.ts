// M2 pass fact probe round 2 — anti-joins that actually bite on this seed,
// LEFT JOIN NULL-padding demos, invoices x payments outer-join demos.
// Run: npx tsx scripts/m2-facts2.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}
async function one(sql: string): Promise<Record<string, unknown>> {
  const rows = await q(sql);
  return rows[0] ?? {};
}

async function main() {
  await resetDatabase();

  console.log("== LEFT JOIN with compound ON (pending) ==");
  console.log("rows:", await one(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'`));
  console.log("NULL-padded customers:", await q(`SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL ORDER BY c.name`));
  console.log("grouped per customer:", await q(`SELECT c.name, COUNT(o.id) pending_n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' GROUP BY c.id ORDER BY pending_n DESC, c.name LIMIT 5`));

  console.log("\n== anti-joins that bite ==");
  console.log("no PENDING orders:", await q(`SELECT c.name, c.region FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL ORDER BY c.name`));
  console.log("no DELIVERED orders:", await q(`SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' WHERE o.id IS NULL ORDER BY c.name`));
  console.log("no SHIPPED orders:", await q(`SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL ORDER BY c.name`));
  console.log("never ordered Audio:", await q(`SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id LEFT JOIN order_items oi ON oi.order_id = o.id LEFT JOIN products p ON p.id = oi.product_id AND p.category = 'Audio' WHERE p.id IS NULL GROUP BY c.id ORDER BY c.name`));
  console.log("no CANCELLED orders:", await one(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled' WHERE o.id IS NULL`));

  console.log("\n== invoices x payments ==");
  console.log("invoice left join payment rows:", await one(`SELECT COUNT(*) n FROM invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id`));
  console.log("unpaid invoices:", await q(`SELECT i.number, i.status, i.amount_cents FROM invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id WHERE pay.id IS NULL ORDER BY i.number`));
  console.log("right join payments<-invoices:", await one(`SELECT COUNT(*) n FROM payments pay RIGHT JOIN invoices i ON pay.invoice_id = i.id`));
  console.log("right join unmatched:", await one(`SELECT COUNT(*) n FROM payments pay RIGHT JOIN invoices i ON pay.invoice_id = i.id WHERE pay.id IS NULL`));
  console.log("full outer rows:", await one(`SELECT COUNT(*) n FROM invoices i FULL OUTER JOIN payments pay ON pay.invoice_id = i.id`));
  console.log("full outer unmatched:", await q(`SELECT i.number AS inv, pay.id AS pay_id FROM invoices i FULL OUTER JOIN payments pay ON pay.invoice_id = i.id WHERE i.id IS NULL OR pay.id IS NULL`));
  console.log("payments with no invoice? (orphan):", await one(`SELECT COUNT(*) n FROM payments pay LEFT JOIN invoices i ON i.id = pay.invoice_id WHERE i.id IS NULL`));
  console.log("paid invoices count:", await one(`SELECT COUNT(DISTINCT invoice_id) n FROM payments`));
  console.log("invoice statuses:", await q(`SELECT status, COUNT(*) n FROM invoices GROUP BY status ORDER BY status`));

  console.log("\n== category revenue (3-table) ==");
  console.log(await q(`SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price),2) rev, COUNT(*) line_items FROM order_items oi INNER JOIN products p ON p.id = oi.product_id GROUP BY p.category ORDER BY rev DESC`));
  console.log("customer spend top5:", await q(`SELECT c.name, ROUND(SUM(o.total),2) spend FROM customers c INNER JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY spend DESC LIMIT 5`));
  console.log("product units sold top5:", await q(`SELECT p.name, SUM(oi.quantity) units FROM order_items oi INNER JOIN products p ON p.id = oi.product_id GROUP BY p.id ORDER BY units DESC LIMIT 5`));

  console.log("\n== join direction sanity ==");
  console.log("customers LEFT JOIN orders = 103, INNER = 103, customers count = 16:");
  console.log(await one(`SELECT (SELECT COUNT(*) FROM customers) c16, (SELECT COUNT(*) FROM customers c INNER JOIN orders o ON o.customer_id = c.id) inner_n, (SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id) left_n`));
  // orders LEFT JOIN items: every order has items? min items per order
  console.log("orders without items:", await one(`SELECT COUNT(*) n FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id WHERE oi.id IS NULL`));
  console.log("min/max items per order:", await one(`SELECT MIN(n) mn, MAX(n) mx FROM (SELECT COUNT(*) n FROM order_items GROUP BY order_id)`));

  console.log("\n== cross join materials ==");
  console.log("expenses x products:", await one(`SELECT COUNT(*) n FROM expenses e CROSS JOIN products p`));
  console.log("same-category pairs sample:", await q(`SELECT a.name an, b.name bn, a.category FROM products a CROSS JOIN products b WHERE a.category = b.category AND a.id < b.id ORDER BY a.category, a.name LIMIT 6`));
  console.log("categories list:", await q(`SELECT DISTINCT category FROM products ORDER BY category`));

  console.log("\n== supplier joins ==");
  console.log("supplier product counts:", await q(`SELECT s.name, COUNT(p.id) n FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY n DESC, s.name`));
  console.log("supplier revenue:", await q(`SELECT s.name, ROUND(SUM(oi.quantity * oi.unit_price),2) rev FROM suppliers s INNER JOIN products p ON p.supplier_id = s.id INNER JOIN order_items oi ON oi.product_id = p.id GROUP BY s.id ORDER BY rev DESC`));

  console.log("\n== misc ==");
  console.log("distinct cities:", await q(`SELECT DISTINCT city FROM customers ORDER BY city`));
  console.log("Alice Chen orders:", await one(`SELECT COUNT(*) n FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE c.name = 'Alice Chen'`));
  console.log("Alice spend:", await one(`SELECT ROUND(SUM(o.total),2) v FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE c.name = 'Alice Chen'`));
  console.log("pending EU:", await one(`SELECT COUNT(*) n FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE c.region = 'EU' AND o.status = 'pending'`));
  console.log("delivered by region:", await q(`SELECT c.region, COUNT(*) n FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE o.status = 'delivered' GROUP BY c.region ORDER BY n DESC`));
  console.log("null shipped per region (left join style):", await q(`SELECT c.region, COUNT(o.id) unshipped FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.shipped_at IS NULL WHERE o.id IS NOT NULL GROUP BY c.region ORDER BY unshipped DESC`));
}

main().catch((e) => { console.error(e); process.exit(1); });
