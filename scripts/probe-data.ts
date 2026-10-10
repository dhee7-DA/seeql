// Probe the sample database so curriculum content matches real values.
// Run: cd /home/z/my-project && bun scripts/probe-data.ts
import { db } from "../src/lib/db";
import { ensureDatabase } from "../src/lib/sample-db";

async function main() {
  await ensureDatabase();

  const norm = (v: unknown): unknown =>
    typeof v === "bigint" ? Number(v) : v;
  const dump = (label: string, rows: Array<Record<string, unknown>>) =>
    console.log(`\n${label}:`, JSON.stringify(rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, norm(v)])))));

  const q = async (sql: string, label: string) => {
    const r = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(sql);
    dump(label, r);
  };

  const counts = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `SELECT 'customers' t, COUNT(*) n FROM customers UNION ALL SELECT 'products', COUNT(*) FROM products
     UNION ALL SELECT 'orders', COUNT(*) n FROM orders UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
     UNION ALL SELECT 'reviews', COUNT(*) FROM reviews`,
  );
  dump("ROW COUNTS", counts);


  await q(`SELECT COUNT(*) total, SUM(CASE WHEN email IS NULL THEN 1 ELSE 0 END) null_email,
    SUM(CASE WHEN is_active=1 THEN 1 ELSE 0 END) active FROM customers`, "customers summary");
  await q(`SELECT country, COUNT(*) n FROM customers GROUP BY country ORDER BY n DESC`, "countries");
  await q(`SELECT city FROM customers WHERE LOWER(TRIM(city)) LIKE '%new%' OR LOWER(TRIM(city)) LIKE '%york%' GROUP BY city`, "new york variants");
  await q(`SELECT loyalty_tier, COUNT(*) n FROM customers GROUP BY loyalty_tier ORDER BY n DESC`, "loyalty tiers");
  await q(`SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY n DESC LIMIT 15`, "categories");
  await q(`SELECT status, payment_method, COUNT(*) n FROM orders GROUP BY status, payment_method ORDER BY n DESC LIMIT 12`, "status x payment");
  await q(`SELECT MIN(price) minp, MAX(price) maxp, SUM(CASE WHEN price IS NULL THEN 1 ELSE 0 END) nullp,
    SUM(CASE WHEN price = 0 THEN 1 ELSE 0 END) zerop FROM products`, "price range");
  await q(`SELECT product_name FROM products WHERE product_name LIKE 'Wireless%' LIMIT 5`, "wireless products");
  await q(`SELECT product_name FROM products WHERE product_name LIKE '%Pro%' LIMIT 8`, "pro products");
  await q(`SELECT COUNT(*) n FROM orders WHERE total_amount IS NULL`, "null totals");
  await q(`SELECT COUNT(DISTINCT customer_id) n FROM orders`, "distinct customers in orders");
  await q(`SELECT ROUND(SUM(total_amount),2) rev FROM orders`, "total revenue");
  await q(`SELECT ROUND(AVG(price),2) avgp FROM products`, "avg product price");
  await q(`SELECT full_name, lifetime_value FROM customers WHERE lifetime_value IS NOT NULL ORDER BY lifetime_value DESC, id LIMIT 5`, "top LTV");
  await q(`SELECT order_date FROM orders ORDER BY order_date DESC LIMIT 5`, "newest order dates");
  await q(`SELECT COUNT(*) n FROM customers WHERE city IS NULL`, "null cities");
  await q(`SELECT payment_method, COUNT(*) n FROM orders GROUP BY payment_method ORDER BY n DESC`, "payment methods");
  await q(`SELECT MIN(stock_quantity) mins, MAX(stock_quantity) maxs, SUM(CASE WHEN stock_quantity < 10 THEN 1 ELSE 0 END) low FROM products`, "stock range");
  await q(`SELECT COUNT(*) n FROM products WHERE price IS NULL OR price = 0`, "price gaps");
  await q(`SELECT loyalty_tier, COUNT(*) n FROM customers GROUP BY loyalty_tier HAVING COUNT(*) > 2 ORDER BY n DESC`, "tiers with >2");
  await q(`SELECT city, COUNT(*) n FROM customers GROUP BY city HAVING COUNT(*) > 2 ORDER BY n DESC LIMIT 8`, "cities with >2");
  await q(`SELECT payment_method, COUNT(*) n, ROUND(AVG(total_amount),2) avg_total FROM orders GROUP BY payment_method HAVING COUNT(*) >= 10`, "payment avg (>=10)");
  await q(`SELECT id, order_date FROM orders WHERE order_date IS NOT NULL ORDER BY order_date DESC, id DESC LIMIT 3`, "top3 newest orders");
  await q(`SELECT id, customer_id FROM orders ORDER BY id LIMIT 5 OFFSET 5`, "orders 6-10");
  await q(`SELECT DISTINCT country FROM customers ORDER BY country`, "distinct countries");

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
