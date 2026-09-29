// M2 fact probe round 3b — compact TSV dumps for authoring.
// Run: npx tsx scripts/m2-facts3b.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q(sql: string): Promise<void> {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const header = rows.length ? Object.keys(rows[0]).join("\t") : "(empty)";
  console.log(header);
  for (const r of rows) console.log(Object.values(r).map((v) => String(v)).join("\t"));
}

async function main() {
  await resetDatabase();
  console.log("== customers ==");
  await q(`SELECT id, name, city, region, active FROM customers ORDER BY id`);
  console.log("\n== products ==");
  await q(`SELECT id, name, category, price, supplier_id FROM products ORDER BY id`);
  console.log("\n== invoices (n_payments) ==");
  await q(`SELECT id, number, status, amount_cents/100.0 amount, (SELECT COUNT(*) FROM payments p WHERE p.invoice_id = i.id) np FROM invoices i ORDER BY id`);
  console.log("\n== remaining ==");
  console.log("never Fitness:", (await db.$queryRawUnsafe(`SELECT GROUP_CONCAT(name, ' | ') v FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id INNER JOIN products p ON p.id = oi.product_id WHERE o.customer_id = c.id AND p.category = 'Fitness')`) as Array<Record<string, unknown>>)[0].v);
  await q(`SELECT (SELECT COUNT(*) FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id INNER JOIN products p ON p.id = oi.product_id WHERE o.customer_id = c.id AND p.category = 'Apparel')) never_apparel, (SELECT COUNT(*) FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id INNER JOIN products p ON p.id = oi.product_id WHERE o.customer_id = c.id AND p.category = 'Video')) never_video, (SELECT COUNT(*) FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id INNER JOIN products p ON p.id = oi.product_id WHERE o.customer_id = c.id AND p.category = 'Fitness')) never_fitness`);
  console.log("-- items-per-order dist (n, orders):");
  await q(`SELECT n, COUNT(*) orders FROM (SELECT COUNT(*) n FROM order_items GROUP BY order_id) GROUP BY n ORDER BY n`);
  console.log("-- orders-per-customer dist (n, customers):");
  await q(`SELECT n, COUNT(*) customers FROM (SELECT COUNT(*) n FROM orders GROUP BY customer_id) GROUP BY n ORDER BY n`);
  console.log("-- EU/APAC/US/LATAM rosters:");
  await q(`SELECT region, GROUP_CONCAT(name, ' | ') roster FROM customers GROUP BY region ORDER BY region`);
  console.log("-- suppliers:");
  await q(`SELECT id, name, region, rating FROM suppliers ORDER BY id`);
  console.log("-- supplier regions:");
  await q(`SELECT region, GROUP_CONCAT(name, ' | ') names FROM suppliers GROUP BY region ORDER BY region`);
  console.log("-- cust-supplier region match pairs:");
  await q(`SELECT c.name customer, s.name supplier FROM customers c INNER JOIN suppliers s ON c.region = s.region ORDER BY c.name, s.name`);
  console.log("-- pending orders by customer:");
  await q(`SELECT customer_id, COUNT(*) n FROM orders WHERE status = 'pending' GROUP BY customer_id ORDER BY customer_id`);
  console.log("-- EU unshipped ids:");
  await q(`SELECT GROUP_CONCAT(o.id) ids FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU' AND o.shipped_at IS NULL`);
  console.log("-- region spend:");
  await q(`SELECT c.region, COUNT(*) orders, ROUND(SUM(o.total),2) spend FROM orders o INNER JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY spend DESC`);
  console.log("-- EU delivered revenue:");
  await q(`SELECT ROUND(SUM(o.total),2) v FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU' AND o.status = 'delivered'`);
  console.log("-- order 1 / order 6 items:");
  await q(`SELECT oi.order_id, p.name, oi.quantity, oi.unit_price FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE oi.order_id IN (1, 6) ORDER BY oi.order_id, oi.id`);
  console.log("-- payment methods:");
  await q(`SELECT method, COUNT(*) n FROM payments GROUP BY method ORDER BY n DESC`);
  console.log("-- expense categories:");
  await q(`SELECT category, COUNT(*) n FROM expenses GROUP BY category ORDER BY category`);
  console.log("-- APAC same-region pairs (10):");
  await q(`SELECT a.name an, b.name bn FROM customers a INNER JOIN customers b ON a.region = b.region AND a.id < b.id WHERE a.region = 'APAC' ORDER BY a.id, b.id`);
  console.log("-- US pair:");
  await q(`SELECT a.name an, b.name bn FROM customers a INNER JOIN customers b ON a.region = b.region AND a.id < b.id WHERE a.region = 'US'`);
  console.log("-- no-cancelled roster (12):");
  await q(`SELECT GROUP_CONCAT(c.name, ' | ') v FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled' WHERE o.id IS NULL`);
}

main().catch((e) => { console.error(e); process.exit(1); });
