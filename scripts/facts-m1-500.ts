// Ground-truth probe for the Foundations MCQ expansion (126 -> 500).
// Prints the real numbers in the seeded storefront db so every new MCQ can
// cite true values. Run: cd /home/z/my-project && bun scripts/facts-m1-500.ts
import { db } from "../src/lib/db";
import { ensureDatabase } from "../src/lib/sample-db";

const q = async (label: string, sql: string) => {
  try {
    const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
    const slim = rows.map((r) =>
      Object.fromEntries(
        Object.entries(r).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v]),
      ),
    );
    console.log(`\n## ${label}`);
    console.log(JSON.stringify(slim.slice(0, 60)));
    if (rows.length > 60) console.log(`… ${rows.length} rows total`);
  } catch (e) {
    console.log(`\n## ${label}\nERROR: ${(e as Error).message}`);
  }
};

async function main() {
  await ensureDatabase();

  await q("tables", `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY name`);

  await q("customers overview", `SELECT COUNT(*) n, SUM(active=1) active, SUM(active=0) inactive, MIN(created_at) min_created, MAX(created_at) max_created FROM customers`);
  await q("region dist", `SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY n DESC, region`);
  await q("city dist", `SELECT city, COUNT(*) n FROM customers GROUP BY city ORDER BY n DESC, city`);
  await q("active x region", `SELECT region, active, COUNT(*) n FROM customers GROUP BY region, active ORDER BY region, active`);
  await q("customer rows", `SELECT id, name, city, region, active, created_at FROM customers ORDER BY id`);

  await q("suppliers rows", `SELECT * FROM suppliers ORDER BY id`);

  await q("products overview", `SELECT COUNT(*) n, MIN(price) min_p, MAX(price) max_p, ROUND(AVG(price),2) avg_p, SUM(stock=0) zero_stock, SUM(stock<10) stock_lt10, MIN(stock) min_s, MAX(stock) max_s, SUM(price>100) price_gt100 FROM products`);
  await q("category dist", `SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY n DESC, category`);
  await q("top priced", `SELECT id, name, price FROM products ORDER BY price DESC LIMIT 6`);
  await q("product rows", `SELECT id, name, category, price, stock, supplier_id FROM products ORDER BY id`);

  await q("orders overview", `SELECT COUNT(*) n, MIN(created_at) min_d, MAX(created_at) max_d, ROUND(AVG(total),2) avg_t, MIN(total) min_t, MAX(total) max_t, ROUND(SUM(total),2) sum_t FROM orders`);
  await q("status dist", `SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY n DESC, status`);
  await q("status rollup", `SELECT status, COUNT(*) n, ROUND(SUM(total),2) sum_t, ROUND(AVG(total),2) avg_t, MIN(total) min_t, MAX(total) max_t FROM orders GROUP BY status ORDER BY status`);
  await q("orders per customer dist", `SELECT n, COUNT(*) custs FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) GROUP BY n ORDER BY n`);
  await q("top totals", `SELECT id, customer_id, status, total, created_at FROM orders ORDER BY total DESC LIMIT 6`);
  await q("orders 2024", `SELECT COUNT(*) n FROM orders WHERE created_at LIKE '2024%'`);
  await q("orders 2025", `SELECT COUNT(*) n FROM orders WHERE created_at LIKE '2025%'`);
  await q("total lt 50", `SELECT COUNT(*) n FROM orders WHERE total < 50`);
  await q("total 50-200", `SELECT COUNT(*) n FROM orders WHERE total BETWEEN 50 AND 200`);
  await q("total gt 200", `SELECT COUNT(*) n FROM orders WHERE total > 200`);

  await q("items overview", `SELECT COUNT(*) n, MIN(quantity) min_q, MAX(quantity) max_q, ROUND(AVG(quantity),2) avg_q, SUM(quantity>=3) qty_ge3, MIN(unit_price) min_up, MAX(unit_price) max_up FROM order_items`);
  await q("qty dist", `SELECT quantity, COUNT(*) n FROM order_items GROUP BY quantity ORDER BY quantity`);
  await q("lines per order dist", `SELECT n, COUNT(*) orders FROM (SELECT order_id, COUNT(*) n FROM order_items GROUP BY order_id) GROUP BY n ORDER BY n`);
  await q("top products by lines", `SELECT product_id, COUNT(*) n FROM order_items GROUP BY product_id ORDER BY n DESC LIMIT 6`);

  await q("cust without orders", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id)`);
  await q("products never ordered", `SELECT COUNT(*) n FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id=p.id)`);
  await q("revenue by category", `SELECT p.category, ROUND(SUM(oi.quantity*oi.unit_price),2) rev FROM order_items oi JOIN products p ON p.id=oi.product_id GROUP BY p.category ORDER BY rev DESC`);
  await q("orders by region", `SELECT c.region, COUNT(*) n FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY n DESC`);
  await q("gmail users", `SELECT COUNT(*) n FROM customers WHERE email LIKE '%@gmail.com'`);
  await q("count variants on orders", `SELECT COUNT(*) n_all, COUNT(total) n_total, COUNT(customer_id) n_cust, COUNT(DISTINCT customer_id) n_dist_cust, ROUND(AVG(total),2) avg_all FROM orders`);
  await q("shipped avg vs delivered avg", `SELECT status, ROUND(AVG(total),2) avg_t FROM orders WHERE status IN ('shipped','delivered') GROUP BY status`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
