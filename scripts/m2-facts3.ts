// M2 fact probe round 3 — table dumps for case-file authoring + remaining figures.
// Run: npx tsx scripts/m2-facts3.ts
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

  console.log("== customers (id, name, city, region, active) ==");
  console.log(await q(`SELECT id, name, city, region, active FROM customers ORDER BY id`));

  console.log("\n== products (id, name, category, price, supplier_id) ==");
  console.log(await q(`SELECT id, name, category, price, supplier_id FROM products ORDER BY id`));

  console.log("\n== invoices ==");
  console.log(await q(`SELECT i.id, i.number, i.status, i.amount_cents, (SELECT COUNT(*) FROM payments p WHERE p.invoice_id = i.id) n_payments FROM invoices i ORDER BY i.id`));

  console.log("\n== remaining figures ==");
  console.log("never ordered Fitness (NOT EXISTS):", await q(`SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id INNER JOIN products p ON p.id = oi.product_id WHERE o.customer_id = c.id AND p.category = 'Fitness') ORDER BY c.name`));
  console.log("never ordered Apparel:", await one(`SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id INNER JOIN products p ON p.id = oi.product_id WHERE o.customer_id = c.id AND p.category = 'Apparel')`));
  console.log("never ordered Video:", await one(`SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id INNER JOIN products p ON p.id = oi.product_id WHERE o.customer_id = c.id AND p.category = 'Video')`));
  console.log("items-per-order distribution:", await q(`SELECT n, COUNT(*) orders FROM (SELECT COUNT(*) n FROM order_items GROUP BY order_id) GROUP BY n ORDER BY n`));
  console.log("orders per customer distribution:", await q(`SELECT n, COUNT(*) customers FROM (SELECT COUNT(*) n FROM orders GROUP BY customer_id) GROUP BY n ORDER BY n`));
  console.log("EU customers:", await q(`SELECT name FROM customers WHERE region = 'EU' ORDER BY name`));
  console.log("APAC customers:", await q(`SELECT name FROM customers WHERE region = 'APAC' ORDER BY name`));
  console.log("US customers:", await q(`SELECT name FROM customers WHERE region = 'US' ORDER BY name`));
  console.log("LATAM customers:", await q(`SELECT name FROM customers WHERE region = 'LATAM' ORDER BY name`));
  console.log("suppliers:", await q(`SELECT id, name, region, rating FROM suppliers ORDER BY id`));
  console.log("same-region EU pair sample (first 6 by id):", await q(`SELECT a.name an, b.name bn FROM customers a INNER JOIN customers b ON a.region = b.region AND a.id < b.id WHERE a.region = 'EU' ORDER BY a.id, b.id LIMIT 6`));
  console.log("US pair:", await q(`SELECT a.name an, b.name bn FROM customers a INNER JOIN customers b ON a.region = b.region AND a.id < b.id WHERE a.region = 'US'`));
  console.log("pending orders by customer id:", await q(`SELECT customer_id, COUNT(*) n FROM orders WHERE status = 'pending' GROUP BY customer_id ORDER BY customer_id`));
  console.log("IN-join same region as a supplier:", await q(`SELECT DISTINCT c.name, s.name supplier FROM customers c INNER JOIN suppliers s ON c.region = s.region ORDER BY c.name, s.name`));
  console.log("regions of suppliers:", await q(`SELECT DISTINCT region FROM suppliers ORDER BY region`));
  console.log("distinct customer regions:", await q(`SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY n DESC`));
  console.log("unshipped orders EU ids:", await q(`SELECT o.id FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU' AND o.shipped_at IS NULL ORDER BY o.id`));
  console.log("chained: EU delivered revenue:", await one(`SELECT ROUND(SUM(o.total),2) v FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU' AND o.status = 'delivered'`));
  console.log("APAC spend:", await one(`SELECT ROUND(SUM(o.total),2) v FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE c.region = 'APAC'`));
  console.log("EU spend:", await one(`SELECT ROUND(SUM(o.total),2) v FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU'`));
  console.log("US spend:", await one(`SELECT ROUND(SUM(o.total),2) v FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE c.region = 'US'`));
  console.log("LATAM spend:", await one(`SELECT ROUND(SUM(o.total),2) v FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE c.region = 'LATAM'`));
  console.log("order 1 items:", await q(`SELECT oi.id, p.name, oi.quantity, oi.unit_price FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE oi.order_id = 1 ORDER BY oi.id`));
  console.log("order 6 items:", await q(`SELECT oi.id, p.name, oi.quantity, oi.unit_price FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE oi.order_id = 6 ORDER BY oi.id`));
  console.log("cross join payments x methods sanity:", await q(`SELECT method, COUNT(*) n FROM payments GROUP BY method ORDER BY n DESC`));
  console.log("expense categories:", await q(`SELECT category, COUNT(*) n FROM expenses GROUP BY category ORDER BY category`));
}

main().catch((e) => { console.error(e); process.exit(1); });
