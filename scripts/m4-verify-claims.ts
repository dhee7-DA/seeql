// Verify specific MCQ claims for M4 banks. Run: npx tsx scripts/m4-verify-claims.ts
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
  console.log("orders with >=1 Electronics line:", await one(`SELECT COUNT(*) n FROM orders o WHERE EXISTS (SELECT 1 FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE oi.order_id = o.id AND p.category = 'Electronics')`));
  console.log("orders with >=1 Audio line:", await one(`SELECT COUNT(*) n FROM orders o WHERE EXISTS (SELECT 1 FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE oi.order_id = o.id AND p.category = 'Audio')`));
  console.log("orders with >=1 Accessories line:", await one(`SELECT COUNT(*) n FROM orders o WHERE EXISTS (SELECT 1 FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE oi.order_id = o.id AND p.category = 'Accessories')`));
  console.log("orders ONLY Accessories (have items + no non-Access):", await one(`SELECT COUNT(*) n FROM orders o WHERE EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id) AND NOT EXISTS (SELECT 1 FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE oi.order_id = o.id AND p.category <> 'Accessories')`));
  console.log("customers pending >= half lifetime:", await one(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending' GROUP BY o.customer_id HAVING SUM(o.total) >= (SELECT SUM(o2.total) FROM orders o2 WHERE o2.customer_id = c.id) / 2.0)`));
  console.log("customers pending > 0 with any pending:", await one(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='pending')`));
  console.log("pending total per customer list (holders):", await q(`SELECT c.name, ROUND(SUM(CASE WHEN o.status='pending' THEN o.total ELSE 0 END),2) pend, ROUND(SUM(o.total),2) life FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY pend DESC`));
  console.log("customers whose pending > 500 total:", await one(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending' GROUP BY o.customer_id HAVING SUM(o.total) > 500)`));
  console.log("shipped∩pending customers:", await one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders WHERE status='shipped' INTERSECT SELECT customer_id FROM orders WHERE status='pending')`));
  console.log("shipped∪pending customers:", await one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders WHERE status='shipped' UNION SELECT customer_id FROM orders WHERE status='pending')`));
  console.log("customers w/o cancelled:", await one(`SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='cancelled')`));
  console.log("distinct customers with above-avg order:", await one(`SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE total > (SELECT AVG(total) FROM orders)`));
  console.log("pending orders of EU customers:", await one(`SELECT COUNT(*) n FROM orders WHERE status='pending' AND customer_id IN (SELECT id FROM customers WHERE region='EU')`));
  console.log("pending of US:", await one(`SELECT COUNT(*) n FROM orders WHERE status='pending' AND customer_id IN (SELECT id FROM customers WHERE region='US')`));
  console.log("pending of APAC:", await one(`SELECT COUNT(*) n FROM orders WHERE status='pending' AND customer_id IN (SELECT id FROM customers WHERE region='APAC')`));
  console.log("pending of LATAM:", await one(`SELECT COUNT(*) n FROM orders WHERE status='pending' AND customer_id IN (SELECT id FROM customers WHERE region='LATAM')`));
  console.log("Chloe orders above own avg:", await one(`SELECT COUNT(*) n FROM orders o WHERE o.customer_id = 3 AND o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = 3)`));
  console.log("orders 42-above-avg distinct customers check:", await q(`SELECT c.name, COUNT(*) n FROM orders o INNER JOIN customers c ON c.id=o.customer_id WHERE o.total > (SELECT AVG(total) FROM orders) GROUP BY c.id ORDER BY n DESC`));
  console.log("customer active values:", await q(`SELECT active, COUNT(*) n FROM customers GROUP BY active`));
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
