// Thin-spot patch probe round 2 — remaining facts for drill sets + final problem designs.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  await resetDatabase();
  const q = async (sql: string) => (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const one = async (sql: string) => (await q(sql))[0];
  const dump = (label: string, rows: Record<string, unknown> | Array<Record<string, unknown>>) => {
    console.log(label, JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : v)));
  };

  console.log("== LADDER REDESIGN ==");
  dump("price min/max:", await one(`SELECT ROUND(MIN(price),2) AS lo, ROUND(MAX(price),2) AS hi FROM products`));
  dump("expense bands 40k/80k:", await q(`
    WITH bands(lo, hi, label) AS (VALUES (0, 40000, 'petty'), (40000, 80000, 'modest'), (80000, 999999999, 'major'))
    SELECT b.label, COUNT(*) AS n FROM expenses e JOIN bands b ON e.amount_cents >= b.lo AND e.amount_cents < b.hi GROUP BY b.label ORDER BY MIN(b.lo)`));
  dump("products ladder 30/60/120:", await q(`
    WITH bands(lo, hi, label) AS (VALUES (0, 30, 'entry'), (30, 60, 'core'), (60, 120, 'pro'), (120, 99999, 'elite'))
    SELECT b.label, COUNT(*) AS n FROM products p JOIN bands b ON p.price >= b.lo AND p.price < b.hi GROUP BY b.label ORDER BY MIN(b.lo)`));

  console.log("\n== M6 OUTER-JOIN DRILL FACTS ==");
  dump("RIGHT JOIN orders->customers all (rows):", await one(`SELECT COUNT(*) AS n FROM orders o RIGHT JOIN customers c ON c.id = o.customer_id`));
  dump("RIGHT JOIN cancelled probe:", await one(`SELECT COUNT(*) AS n FROM orders o RIGHT JOIN customers c ON c.id = o.customer_id AND o.status = 'cancelled'`));
  dump("FULL OUTER cancelled:", await one(`SELECT COUNT(*) AS n FROM orders o FULL OUTER JOIN customers c ON c.id = o.customer_id AND o.status = 'cancelled'`));
  dump("customers with no orders:", await one(`SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`));
  dump("never-ordered products:", await one(`SELECT COUNT(*) AS n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL`));
  dump("never-ordered product names:", await q(`SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL ORDER BY p.name`));
  dump("RIGHT JOIN products->order_items:", await one(`SELECT COUNT(*) AS n FROM order_items oi RIGHT JOIN products p ON p.id = oi.product_id`));
  dump("suppliers with no products:", await one(`SELECT COUNT(*) AS n FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id WHERE p.id IS NULL`));
  dump("FULL OUTER orders/customers plain:", await one(`SELECT COUNT(*) AS n FROM orders o FULL OUTER JOIN customers c ON c.id = o.customer_id`));

  console.log("\n== M7 WRITE DRILL FACTS ==");
  dump("cancelled orders:", await one(`SELECT COUNT(*) AS n FROM orders WHERE status = 'cancelled'`));
  dump("status counts:", await q(`SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY status`));
  dump("category counts:", await q(`SELECT category, COUNT(*) AS n FROM products GROUP BY category ORDER BY category`));
  dump("active customers:", await one(`SELECT SUM(active) AS on_n, COUNT(*) AS all_n, SUM(1-active) AS off_n FROM customers`));
  dump("avg product price:", await one(`SELECT ROUND(AVG(price),2) AS a FROM products`));
  dump("audio products:", await one(`SELECT COUNT(*) AS n, ROUND(AVG(price),2) AS avg_p FROM products WHERE category = 'Audio'`));
  dump("zero-stock products:", await one(`SELECT COUNT(*) AS n FROM products WHERE stock = 0`));
  dump("min stock row:", await q(`SELECT id, name, stock FROM products ORDER BY stock LIMIT 3`));
  dump("pending orders:", await one(`SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'`));
  dump("expenses 2024 petty (>=22000 min):", await one(`SELECT COUNT(*) AS n FROM expenses WHERE amount_cents < 40000`));
  dump("unpaid invoices:", await one(`SELECT status, COUNT(*) AS n FROM invoices GROUP BY status`));
  dump("regions:", await q(`SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC`));

  console.log("\n== UPSERT PREDICT FACTS ==");
  // hypothetical: upsert product 1 stock +25 -> 145; DO NOTHING changes 0
  dump("product 4 stock:", await one(`SELECT stock FROM products WHERE id = 4`));
  dump("product 3 price:", await one(`SELECT price FROM products WHERE id = 3`));
  dump("products per supplier 5/6:", await q(`SELECT supplier_id, COUNT(*) AS n FROM products WHERE supplier_id IN (5,6) GROUP BY supplier_id`));

  console.log("\n== M8 SCHEMA DRILL FACTS ==");
  dump("sqlite_master types:", await q(`SELECT type, COUNT(*) AS n FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' GROUP BY type`));
  dump("product columns:", await q(`SELECT name, type, \"notnull\" AS nn FROM pragma_table_info('products')`));
  dump("max lengths:", await one(`SELECT MAX(LENGTH(name)) AS name_len, MAX(LENGTH(category)) AS cat_len FROM products`));
  dump("distinct regions for CHECK:", await q(`SELECT DISTINCT region FROM customers ORDER BY region`));

  console.log("\n== M11 INDEX/EXPLAIN DRILL FACTS ==");
  dump("eqp full scan orders:", await q(`EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'shipped'`));
  dump("eqp pk search:", await q(`EXPLAIN QUERY PLAN SELECT * FROM orders WHERE id = 42`));
  dump("eqp like leading %:", await q(`EXPLAIN QUERY PLAN SELECT id FROM customers WHERE name LIKE '%a%'`));
  dump("eqp group by:", await q(`EXPLAIN QUERY PLAN SELECT status, COUNT(*) FROM orders GROUP BY status`));

  console.log("\n== N4 CASE EXTRA FACTS ==");
  dump("cust 2 orders:", await q(`SELECT id, total, created_at FROM orders WHERE customer_id = 2 ORDER BY created_at, id`));
  dump("2024-01 orders:", await q(`SELECT id, customer_id, ROUND(total,2) AS total, created_at FROM orders WHERE created_at LIKE '2024-01%' ORDER BY created_at, id`));
  dump("2024-12 orders:", await q(`SELECT id, customer_id, ROUND(total,2) AS total, created_at FROM orders WHERE created_at LIKE '2024-12%' ORDER BY created_at, id`));
  dump("min total order:", await q(`SELECT id, customer_id, ROUND(total,2) AS total FROM orders ORDER BY total, id LIMIT 2`));
  dump("max total order:", await q(`SELECT id, customer_id, ROUND(total,2) AS total FROM orders ORDER BY total DESC, id LIMIT 2`));

  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
