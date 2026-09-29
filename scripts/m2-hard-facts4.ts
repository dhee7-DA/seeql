import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
async function q(sql: string): Promise<Array<Record<string, unknown>>> { return db.$queryRawUnsafe(sql); }
async function main() {
  await resetDatabase();
  const P = async (label: string, sql: string) => {
    try { console.log(`== ${label} ==\n${JSON.stringify(await q(sql), (_, v) => typeof v === "bigint" ? Number(v) : v)}`); }
    catch (e) { console.log(`== ${label} == ERROR: ${e instanceof Error ? e.message.slice(0, 140) : e}`); }
  };
  await P("products in pending orders", `SELECT COUNT(DISTINCT p.id) AS n FROM products p LEFT JOIN order_items oi ON oi.product_id=p.id LEFT JOIN orders o ON o.id=oi.order_id AND o.status='pending' WHERE o.id IS NOT NULL`);
  await P("products in shipped orders", `SELECT COUNT(DISTINCT p.id) AS n FROM products p LEFT JOIN order_items oi ON oi.product_id=p.id LEFT JOIN orders o ON o.id=oi.order_id AND o.status='shipped' WHERE o.id IS NOT NULL`);
  await P("products in cancelled orders", `SELECT COUNT(DISTINCT p.id) AS n FROM products p LEFT JOIN order_items oi ON oi.product_id=p.id LEFT JOIN orders o ON o.id=oi.order_id AND o.status='cancelled' WHERE o.id IS NOT NULL`);
  await P("same-region same-year signup pairs", `SELECT COUNT(*) AS n FROM customers a JOIN customers b ON a.id<b.id AND strftime('%Y',a.created_at)=strftime('%Y',b.created_at) WHERE a.region=b.region`);
  await P("same-status same-year order pairs", `SELECT COUNT(*) AS n FROM orders a JOIN orders b ON a.customer_id=b.customer_id AND a.id<b.id AND strftime('%Y',a.created_at)=strftime('%Y',b.created_at) WHERE a.status=b.status`);
  await P("order2 receipt detail", `SELECT p.name, oi.quantity, oi.unit_price FROM order_items oi JOIN orders o ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id WHERE o.id=2`);
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
