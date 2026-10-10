// Ground-truth facts batch 3 — for the l39/l40/l50/l51 case-study upgrades.
// Every number cited in new MCQ prompts / problem briefs / whys comes from here.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q(label: string, sql: string) {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  console.log(`\n## ${label}`);
  console.log(
    JSON.stringify(
      rows,
      (_k, v) => (typeof v === "bigint" ? Number(v) : typeof v === "number" ? Math.round(v * 100) / 100 : v),
    ),
  );
}

async function main() {
  await resetDatabase();

  // ---- l39 — windows -------------------------------------------------------
  await q("l39: monthly counts+rev", `SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n, ROUND(SUM(total),2) AS rev FROM orders GROUP BY mon ORDER BY mon`);
  await q("l39: greatest-per-group via ROW_NUMBER", `WITH ranked AS (SELECT c.name, o.total, ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.total DESC, o.id) AS rn FROM orders o JOIN customers c ON c.id = o.customer_id) SELECT name, ROUND(total,2) AS total FROM ranked WHERE rn = 1 ORDER BY total DESC LIMIT 6`);
  await q("l39: per-customer total ties?", `SELECT customer_id, ROUND(total,2) AS t, COUNT(*) AS c FROM orders GROUP BY customer_id, total HAVING c > 1`);
  await q("l39: MoM delta", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon) SELECT mon, ROUND(rev,2) AS rev, ROUND(rev - LAG(rev) OVER (ORDER BY mon),2) AS delta FROM m ORDER BY mon`);
  await q("l39: weekday histogram (%w)", `SELECT strftime('%w', created_at) AS wd, COUNT(*) AS n FROM orders GROUP BY wd ORDER BY wd`);
  await q("l39: 2-month moving avg", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon) SELECT mon, ROUND(AVG(rev) OVER (ORDER BY mon ROWS BETWEEN 1 PRECEDING AND CURRENT ROW),2) AS ma FROM m ORDER BY mon`);
  await q("l39: store span days", `SELECT CAST(MAX(julianday(created_at)) - MIN(julianday(created_at)) AS INTEGER) AS span_days, MIN(created_at) AS first, MAX(created_at) AS last FROM orders`);
  await q("l39: top totals with RANK/DENSE_RANK", `SELECT id, ROUND(total,2) AS total, RANK() OVER (ORDER BY total DESC) AS r, DENSE_RANK() OVER (ORDER BY total DESC) AS dr FROM orders ORDER BY total DESC, id LIMIT 6`);

  // ---- l40 — clinic --------------------------------------------------------
  await q("l40: pipeline revenue census (FILTER)", `SELECT ROUND(SUM(total) FILTER (WHERE status='delivered'),2) AS delivered_rev, ROUND(SUM(total) FILTER (WHERE status IN ('pending','shipped')),2) AS open_rev, ROUND(SUM(total) FILTER (WHERE status='cancelled'),2) AS cancelled_rev, ROUND(SUM(total),2) AS all_rev FROM orders`);
  await q("l40: per-supplier catalog string '; '", `SELECT s.name, GROUP_CONCAT(p.name, '; ') AS catalog FROM suppliers s JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY s.name`);
  await q("l40: per-category census with FILTER", `SELECT category, COUNT(*) AS n, COUNT(*) FILTER (WHERE price >= 100) AS premium, COUNT(*) FILTER (WHERE price < 50) AS budget FROM products GROUP BY category ORDER BY category`);
  await q("l40: regions pipe-fold via subquery", `SELECT GROUP_CONCAT(region, ' | ') AS g FROM (SELECT DISTINCT region FROM suppliers ORDER BY region)`);
  await q("l40: stock census FILTER", `SELECT COUNT(*) FILTER (WHERE stock >= 100) AS deep, COUNT(*) FILTER (WHERE stock < 50) AS thin, COUNT(*) AS all_products FROM products`);
  await q("l40: category revenue plain", `SELECT p.category AS category, ROUND(SUM(oi.quantity * oi.unit_price),2) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category ORDER BY revenue DESC`);

  // ---- l50 — writes --------------------------------------------------------
  await q("l50: supplier 6 products", `SELECT id, name, price, stock FROM products WHERE supplier_id = 6 ORDER BY id`);
  await q("l50: top-3 bestsellers", `SELECT p.id, p.name, p.stock, SUM(oi.quantity) AS sold FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id ORDER BY sold DESC, p.id LIMIT 3`);
  await q("l50: max ids", `SELECT (SELECT MAX(id) FROM orders) AS max_order, (SELECT MAX(id) FROM products) AS max_product, (SELECT MAX(id) FROM order_items) AS max_item`);
  await q("l50: electronics rows", `SELECT id, name, ROUND(price,2) AS price, stock FROM products WHERE category = 'Electronics' ORDER BY id`);
  await q("l50: customers 1 and 16", `SELECT id, name, country FROM customers WHERE id IN (1, 7, 16)`);
  await q("l50: order created_at sample", `SELECT created_at FROM orders ORDER BY id DESC LIMIT 3`);
  await q("l50: alice spend + orders", `SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS v FROM orders WHERE customer_id = 1`);

  // ---- l51 — schema --------------------------------------------------------
  await q("l51: delivered-only month count", `SELECT COUNT(*) AS n FROM (SELECT strftime('%Y-%m', created_at) AS mon FROM orders WHERE status = 'delivered' GROUP BY mon)`);
  await q("l51: delivered month buckets", `SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS rev, COUNT(*) AS n FROM orders WHERE status = 'delivered' GROUP BY mon ORDER BY mon LIMIT 4`);
  await q("l51: two worst months", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon) SELECT mon, ROUND(rev,2) AS rev FROM m ORDER BY rev ASC, mon ASC LIMIT 2`);
  await q("l51: order_items count + product count", `SELECT (SELECT COUNT(*) FROM order_items) AS items, (SELECT COUNT(*) FROM suppliers) AS suppliers`);
  await q("l51: existing indexes", `SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%'`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
