// Resets the seed db with the extended ecommerce schema, then verifies that
// every Module-1 era figure is unchanged (additive-only schema extension).
import { resetDatabase, ensureDatabase } from "../src/lib/sample-db";
import { db } from "../src/lib/db";

async function one(sql: string): Promise<string> {
  const res = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  return String(Object.values(res[0] ?? { x: "none" })[0]);
}

const counts = await resetDatabase();
console.log("counts:", JSON.stringify(counts));

// --- M1 invariants (must be UNCHANGED) ---
const m1: Array<[string, string, string]> = [
  ["customers", "SELECT COUNT(*) AS x FROM customers", "16"],
  ["orders", "SELECT COUNT(*) AS x FROM orders", "103"],
  ["order_items", "SELECT COUNT(*) AS x FROM order_items", "251"],
  ["revenue", "SELECT ROUND(SUM(total), 2) AS x FROM orders", "34833.28"],
  ["unshipped", "SELECT COUNT(*) AS x FROM orders WHERE shipped_at IS NULL", "21"],
  ["delivered", "SELECT COUNT(*) AS x FROM orders WHERE status = 'delivered'", "52"],
  ["avg_order", "SELECT ROUND(AVG(total), 2) AS x FROM orders", "338.19"],
  ["limbo_value", "SELECT ROUND(SUM(total), 2) AS x FROM orders WHERE shipped_at IS NULL", "7265.49"],
  ["top_order", "SELECT ROUND(MAX(total), 2) AS x FROM orders", "1088.44"],
  ["alice_orders", "SELECT COUNT(*) AS x FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen'", "24"],
  ["products", "SELECT COUNT(*) AS x FROM products", "16"],
  ["suppliers", "SELECT COUNT(*) AS x FROM suppliers", "6"],
];
let bad = 0;
for (const [name, sql, want] of m1) {
  const got = await one(sql);
  const ok = got === want;
  if (!ok) bad++;
  console.log(`${ok ? "OK  " : "DIFF"} ${name}: ${got}${ok ? "" : ` (want ${want})`}`);
}

// --- new tables: structure + teaching-data sanity ---
const m2: Array<[string, string]> = [
  ["employees", "SELECT COUNT(*) AS x FROM employees"],
  ["payments", "SELECT COUNT(*) AS x FROM payments"],
  ["refunds", "SELECT COUNT(*) AS x FROM refunds"],
  ["shipments", "SELECT COUNT(*) AS x FROM shipments"],
  ["acquisitions", "SELECT COUNT(*) AS x FROM acquisitions"],
  ["unpaid_delivered", "SELECT COUNT(*) AS x FROM orders o LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled' WHERE o.status = 'delivered' AND p.id IS NULL"],
  ["orders_no_payment_row", "SELECT COUNT(*) AS x FROM orders o LEFT JOIN payments p ON p.order_id = o.id WHERE p.id IS NULL"],
  ["split_payment_orders", "SELECT COUNT(*) AS x FROM (SELECT order_id FROM payments GROUP BY order_id HAVING COUNT(*) > 1)"],
  ["refunded_orders", "SELECT COUNT(DISTINCT order_id) AS x FROM refunds"],
  ["in_transit", "SELECT COUNT(*) AS x FROM shipments WHERE delivered_at IS NULL"],
  ["arrived_but_status_shipped", "SELECT COUNT(*) AS x FROM shipments s JOIN orders o ON o.id = s.order_id WHERE s.delivered_at IS NOT NULL AND o.status = 'shipped'"],
  ["organic_customers", "SELECT COUNT(*) AS x FROM customers c LEFT JOIN acquisitions a ON a.customer_id = c.id WHERE a.id IS NULL"],
  ["employees_no_direct_reports", "SELECT COUNT(*) AS x FROM employees e WHERE NOT EXISTS (SELECT 1 FROM employees r WHERE r.manager_id = e.id)"],
];
for (const [name, sql] of m2) {
  console.log(`NEW ${name}: ${await one(sql)}`);
}

// determinism: reset again, hash everything
await resetDatabase();
const h1 = await one("SELECT COUNT(*) || ':' || ROUND(SUM(amount), 2) AS x FROM payments");
await ensureDatabase();
const h2 = await one("SELECT COUNT(*) || ':' || ROUND(SUM(amount), 2) AS x FROM payments");
console.log(`determinism payments: ${h1} vs ${h2} -> ${h1 === h2 ? "STABLE" : "UNSTABLE!"}`);

await db.$disconnect();
process.exit(bad ? 1 : 0);
