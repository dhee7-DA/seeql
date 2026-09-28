// Task 41 — facts probe for the Window Functions Masterclass authoring wave.
// One read-only pass over the seed db; output saved to scripts/facts-m10.txt
// and cited by lesson prose / problem briefs / case briefs.
import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const q = async (sql: string): Promise<Array<Record<string, unknown>>> =>
  (await p.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;

(async () => {
  const out: string[] = [];
  const safe = (r: Record<string, unknown>) =>
    JSON.stringify(r, (_k, v) => (typeof v === "bigint" ? Number(v) : v));
  const push = (label: string, rows: Array<Record<string, unknown>>) => {
    out.push(`\n## ${label}`);
    for (const r of rows) out.push(safe(r));
  };

  const probes: Array<[string, string]> = [
    ["customers by region", `SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY region`],
    ["customers active", `SELECT active, COUNT(*) n FROM customers GROUP BY active`],
    ["customers created_at years", `SELECT SUBSTR(created_at,1,4) y, COUNT(*) n FROM customers GROUP BY y`],
    ["customers list", `SELECT id, name, region, active, created_at FROM customers ORDER BY id`],
    ["orders by status", `SELECT status, COUNT(*) n, ROUND(SUM(total),2) amt FROM orders GROUP BY status ORDER BY n DESC`],
    ["orders date range", `SELECT MIN(created_at) lo, MAX(created_at) hi, COUNT(DISTINCT SUBSTR(created_at,1,7)) months FROM orders`],
    ["orders per month", `SELECT SUBSTR(created_at,1,7) m, COUNT(*) n, ROUND(SUM(total),2) amt FROM orders GROUP BY m ORDER BY m`],
    ["orders per customer top", `SELECT customer_id, COUNT(*) n, ROUND(SUM(total),2) spend FROM orders GROUP BY customer_id ORDER BY spend DESC LIMIT 8`],
    ["orders ties on total", `SELECT total, COUNT(*) c FROM orders GROUP BY total HAVING c > 1 ORDER BY c DESC, total DESC LIMIT 10`],
    ["statuses per month", `SELECT SUBSTR(created_at,1,7) m, status, COUNT(*) n FROM orders GROUP BY m, status ORDER BY m LIMIT 60`],
    ["products by category", `SELECT category, COUNT(*) n, ROUND(AVG(price),2) avgp FROM products GROUP BY category ORDER BY category`],
    ["products list", `SELECT id, name, category, price, stock, supplier_id FROM products ORDER BY id`],
    ["products by supplier", `SELECT supplier_id, COUNT(*) n FROM products GROUP BY supplier_id ORDER BY supplier_id`],
    ["suppliers", `SELECT * FROM suppliers ORDER BY id`],
    ["order_items qty stats", `SELECT quantity, COUNT(*) n FROM order_items GROUP BY quantity ORDER BY quantity`],
    ["items per order dist", `SELECT n_items, COUNT(*) c FROM (SELECT order_id, COUNT(*) n_items FROM order_items GROUP BY order_id) GROUP BY n_items ORDER BY n_items`],
    ["revenue by category", `SELECT p.category, ROUND(SUM(oi.quantity*oi.unit_price),2) rev FROM order_items oi JOIN products p ON p.id=oi.product_id GROUP BY p.category ORDER BY rev DESC`],
    ["unit price ties", `SELECT unit_price, COUNT(*) c FROM order_items GROUP BY unit_price HAVING c>1 ORDER BY c DESC LIMIT 8`],
    ["products never ordered", `SELECT COUNT(*) n FROM products WHERE id NOT IN (SELECT product_id FROM order_items)`],
    ["customers no orders", `SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)`],
    ["same-day orders", `SELECT created_at, COUNT(*) c FROM orders GROUP BY created_at HAVING c>1 ORDER BY c DESC LIMIT 8`],
    ["distinct day count", `SELECT COUNT(DISTINCT SUBSTR(created_at,1,10)) d FROM orders`],
    ["city list", `SELECT city, COUNT(*) n FROM customers GROUP BY city ORDER BY n DESC, city`],
    ["daily orders sample", `SELECT SUBSTR(created_at,1,10) d, COUNT(*) n, ROUND(SUM(total),2) amt FROM orders GROUP BY d ORDER BY d LIMIT 40`],
  ];

  for (const [label, sql] of probes) {
    try {
      push(label, await q(sql));
    } catch (e) {
      out.push(`\n## ${label}\nERROR: ${(e as Error).message}`);
    }
  }

  writeFileSync("scripts/facts-m10.txt", out.join("\n") + "\n");
  console.log("facts written:", out.length, "lines");
  await p.$disconnect();
})();
