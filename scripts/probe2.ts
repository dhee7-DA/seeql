// Follow-up probe: LIKE targets, samples, extra counts for problem design.
import { db } from "../src/lib/db";
import { ensureDatabase } from "../src/lib/sample-db";

const q = async (label: string, sql: string) => {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const slim = rows.map((r) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v])),
  );
  console.log(`## ${label}\n${JSON.stringify(slim.slice(0, 30))}`);
};

async function main() {
  await ensureDatabase();
  await q("email samples", `SELECT email FROM customers WHERE email IS NOT NULL LIMIT 12`);
  await q("name samples", `SELECT full_name FROM customers LIMIT 8`);
  await q("product names", `SELECT product_name, price, category FROM products LIMIT 14`);
  await q("like card payments", `SELECT COUNT(*) n FROM orders WHERE payment_method LIKE '%card%'`);
  await q("like name A%", `SELECT COUNT(*) n FROM customers WHERE full_name LIKE 'A%'`);
  await q("signup 2023", `SELECT COUNT(*) n FROM customers WHERE signup_date LIKE '2023%'`);
  await q("reviews 2024", `SELECT COUNT(*) n FROM reviews WHERE review_date LIKE '2024%'`);
  await q("discount 0..1", `SELECT COUNT(*) n FROM order_items WHERE discount BETWEEN 0 AND 1`);
  await q("orders big", `SELECT COUNT(*) n FROM orders WHERE total_amount > 500`);
  await q("orders 100-500", `SELECT COUNT(*) n FROM orders WHERE total_amount BETWEEN 100 AND 500`);
  await q("cheap products", `SELECT COUNT(*) n FROM products WHERE price < 50`);
  await q("review >=4", `SELECT COUNT(*) n FROM reviews WHERE rating >= 4`);
  await q("title GREAT", `SELECT COUNT(*) n FROM reviews WHERE title LIKE '%GREAT%'`);
  await q("orders shipped city null", `SELECT SUM(shipping_city IS NULL) n FROM orders`);
  await q("order 42 exists", `SELECT COUNT(*) n FROM orders WHERE id = 42`);
  await q("avg delivered", `SELECT ROUND(AVG(total_amount),2) v FROM orders WHERE status='delivered' AND total_amount IS NOT NULL`);
  await q("q1 2025 all", `SELECT COUNT(*) n FROM orders WHERE order_date BETWEEN '2025-01-01' AND '2025-03-31'`);
  await q("active with ltv>1000", `SELECT COUNT(*) n FROM customers WHERE is_active=1 AND lifetime_value > 1000`);
  await q("bronze count lower trim", `SELECT COUNT(*) n FROM customers WHERE LOWER(TRIM(loyalty_tier))='bronze'`);
  await q("items qty null or bad", `SELECT SUM(quantity IS NULL OR quantity <= 0) n FROM order_items`);
  await q("reviews 4-5", `SELECT COUNT(*) n FROM reviews WHERE rating BETWEEN 4 AND 5`);
  await q("order_items unit_price null", `SELECT SUM(unit_price IS NULL) n FROM order_items`);
  await q("orders is_gift 1", `SELECT COUNT(*) n FROM orders WHERE is_gift = 1`);
  await q("products stock<10", `SELECT COUNT(*) n FROM products WHERE stock_quantity < 10`);
  await q("products listed 2024", `SELECT COUNT(*) n FROM products WHERE listed_at LIKE '2024%'`);
}
main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
