// Task 18 facts — verifies every hardcoded number that will appear in the
// Data Explorer table facts + any UI copy. SELECT-only; never resets the db.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}

async function main() {
  console.log("== row counts ==");
  console.log(await q(`SELECT (SELECT COUNT(*) FROM customers) customers, (SELECT COUNT(*) FROM suppliers) suppliers, (SELECT COUNT(*) FROM products) products, (SELECT COUNT(*) FROM orders) orders, (SELECT COUNT(*) FROM order_items) order_items`));

  console.log("== customers: region / active ==");
  console.log(await q(`SELECT region, COUNT(*) n, SUM(active) active_n FROM customers GROUP BY region ORDER BY region`));
  console.log(await q(`SELECT COUNT(*) AS with_order FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`));

  console.log("== suppliers: region / rating ==");
  console.log(await q(`SELECT region, COUNT(*) n FROM suppliers GROUP BY region ORDER BY region`));
  console.log(await q(`SELECT ROUND(MIN(rating),2) min_r, ROUND(MAX(rating),2) max_r, ROUND(AVG(rating),2) avg_r FROM suppliers`));

  console.log("== products: categories / price / stock ==");
  console.log(await q(`SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY n DESC, category`));
  console.log(await q(`SELECT COUNT(*) n, ROUND(MIN(price),2) min_p, ROUND(MAX(price),2) max_p, SUM(stock) stock_total, SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) out_of_stock FROM products`));
  console.log(await q(`SELECT COUNT(DISTINCT supplier_id) suppliers_used FROM products`));

  console.log("== orders: status / shipped / totals ==");
  console.log(await q(`SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY n DESC`));
  console.log(await q(`SELECT COUNT(*) unshipped, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) pending_null, SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) cancelled_null FROM orders WHERE shipped_at IS NULL`));
  console.log(await q(`SELECT COUNT(*) n, ROUND(MIN(total),2) min_t, ROUND(MAX(total),2) max_t, ROUND(AVG(total),2) avg_t FROM orders`));
  console.log(await q(`SELECT COUNT(DISTINCT customer_id) buyers, COUNT(DISTINCT strftime('%Y-%m', created_at)) months FROM orders`));

  console.log("== order_items: qty / lines ==");
  console.log(await q(`SELECT COUNT(*) n, MIN(quantity) min_q, MAX(quantity) max_q, ROUND(AVG(quantity),2) avg_q, COUNT(DISTINCT order_id) orders, COUNT(DISTINCT product_id) products FROM order_items`));
  console.log(await q(`SELECT COUNT(*) big_lines FROM order_items WHERE quantity * unit_price > 200`));
  console.log(await q(`SELECT MAX(id) max_id, MIN(id) min_id FROM order_items`));
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect();
    process.exit(1);
  });
