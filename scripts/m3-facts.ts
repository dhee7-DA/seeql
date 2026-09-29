// M3 pass fact probe — engine receipts for the Set Operations & CASE keyword
// banks and the Module-3 gauntlet (UNION/UNION ALL, INTERSECT, EXCEPT, set
// chains, CASE WHEN, CASE pivots). Run: npx tsx scripts/m3-facts.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}
async function one(sql: string): Promise<Record<string, unknown>> {
  const rows = await q(sql);
  return rows[0] ?? {};
}
const n = (v: unknown) => Math.round(Number(v) * 100) / 100;

async function main() {
  const counts = await resetDatabase();
  console.log("seeded:", counts, "\n");

  console.log("== table columns ==");
  console.log("customers:", await q(`SELECT name FROM pragma_table_info('customers')`));
  console.log("suppliers:", await q(`SELECT name FROM pragma_table_info('suppliers')`));
  console.log("products:", await q(`SELECT name FROM pragma_table_info('products')`));
  console.log("orders:", await q(`SELECT name FROM pragma_table_info('orders')`));
  console.log("order_items:", await q(`SELECT name FROM pragma_table_info('order_items')`));

  console.log("\n== base distributions ==");
  console.log("customer regions:", await q(`SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY region`));
  console.log("supplier regions:", await q(`SELECT region, COUNT(*) n FROM suppliers GROUP BY region ORDER BY region`));
  console.log("order statuses:", await q(`SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY status`));
  console.log("product categories:", await q(`SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY category`));
  console.log("customers:", await q(`SELECT id, name, region, city, email FROM customers ORDER BY id`));
  console.log("suppliers:", await q(`SELECT * FROM suppliers ORDER BY id`));
  console.log("products:", await q(`SELECT id, name, category, price FROM products ORDER BY id`));

  console.log("\n== UNION / UNION ALL basics ==");
  console.log("names customers U suppliers (UNION):", await q(`SELECT name FROM customers UNION SELECT name FROM suppliers ORDER BY name`));
  console.log("count UNION:", await one(`SELECT COUNT(*) n FROM (SELECT name FROM customers UNION SELECT name FROM suppliers)`));
  console.log("count UNION ALL:", await one(`SELECT COUNT(*) n FROM (SELECT name FROM customers UNION ALL SELECT name FROM suppliers)`));
  console.log("name overlap customers∩suppliers:", await q(`SELECT name FROM customers INTERSECT SELECT name FROM suppliers`));
  console.log("status∪region rows:", await q(`SELECT status FROM orders UNION SELECT region FROM customers ORDER BY 1`));
  console.log("status∪region count:", await one(`SELECT COUNT(*) n FROM (SELECT status FROM orders UNION SELECT region FROM customers)`));
  console.log("status∪region ALL count:", await one(`SELECT COUNT(*) n FROM (SELECT status FROM orders UNION ALL SELECT region FROM customers)`));
  console.log("status∩region:", await one(`SELECT COUNT(*) n FROM (SELECT status FROM orders INTERSECT SELECT region FROM customers)`));
  console.log("labeled stack arms (union all with labels):", await q(`SELECT name, 'customer' AS kind FROM customers UNION ALL SELECT name, 'supplier' FROM suppliers ORDER BY kind, name LIMIT 30`));
  console.log("region rollup across tables:", await q(`SELECT region, COUNT(*) n FROM (SELECT region FROM customers UNION ALL SELECT region FROM suppliers) GROUP BY region ORDER BY region`));
  console.log("dedupe delta name:", await one(`SELECT (SELECT COUNT(*) FROM (SELECT name FROM customers UNION ALL SELECT name FROM suppliers)) - (SELECT COUNT(*) FROM (SELECT name FROM customers UNION SELECT name FROM suppliers)) delta`));

  console.log("\n== INTERSECT facts ==");
  console.log("regions in both customers&suppliers:", await q(`SELECT region FROM customers INTERSECT SELECT region FROM suppliers ORDER BY region`));
  console.log("regions only customers (EXCEPT):", await q(`SELECT region FROM customers EXCEPT SELECT region FROM suppliers ORDER BY region`));
  console.log("regions only suppliers (EXCEPT):", await q(`SELECT region FROM suppliers EXCEPT SELECT region FROM customers ORDER BY region`));
  console.log("categories with products:", await q(`SELECT DISTINCT category FROM products ORDER BY 1`));
  console.log("categories actually ordered:", await q(`SELECT DISTINCT p.category FROM order_items oi INNER JOIN products p ON oi.product_id = p.id ORDER BY 1`));
  console.log("categories ordered∩catalog:", await one(`SELECT COUNT(*) n FROM (SELECT DISTINCT category FROM products INTERSECT SELECT DISTINCT p.category FROM order_items oi INNER JOIN products p ON oi.product_id = p.id)`));
  console.log("prices shared product.price vs line unit_price:", await one(`SELECT COUNT(*) n FROM (SELECT DISTINCT price FROM products INTERSECT SELECT DISTINCT unit_price FROM order_items)`));
  console.log("customers with delivered ∩ customers with pending:", await one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders WHERE status='delivered' INTERSECT SELECT customer_id FROM orders WHERE status='pending')`));
  console.log("customers delivered count:", await one(`SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE status='delivered'`));
  console.log("customers pending count:", await one(`SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE status='pending'`));
  console.log("customers cancelled count:", await one(`SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE status='cancelled'`));
  console.log("customers shipped count:", await one(`SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE status='shipped'`));
  console.log("cities customers:", await q(`SELECT DISTINCT city FROM customers ORDER BY 1`));
  console.log("customer cities ∩ supplier names:", await q(`SELECT city FROM customers INTERSECT SELECT name FROM suppliers ORDER BY 1`));
  console.log("ratings suppliers:", await q(`SELECT rating FROM suppliers ORDER BY rating`));
  console.log("prices products:", await q(`SELECT price FROM products ORDER BY price`));

  console.log("\n== EXCEPT facts ==");
  console.log("products never ordered (names):", await q(`SELECT name FROM products EXCEPT SELECT p.name FROM order_items oi INNER JOIN products p ON oi.product_id = p.id ORDER BY 1`));
  console.log("products never ordered count:", await one(`SELECT COUNT(*) n FROM (SELECT id FROM products EXCEPT SELECT product_id FROM order_items)`));
  console.log("products ordered count:", await one(`SELECT COUNT(*) n FROM (SELECT DISTINCT product_id FROM order_items)`));
  console.log("suppliers of ordered products:", await q(`SELECT s.name FROM products p INNER JOIN order_items oi ON oi.product_id = p.id INNER JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY s.name`));
  console.log("suppliers untouched count:", await one(`SELECT COUNT(*) n FROM (SELECT id FROM suppliers EXCEPT SELECT p.supplier_id FROM order_items oi INNER JOIN products p ON oi.product_id = p.id)`));
  console.log("non-EU customers (EXCEPT):", await q(`SELECT name FROM customers WHERE region <> 'EU' ORDER BY name`));
  console.log("EU customers:", await q(`SELECT name FROM customers WHERE region='EU' ORDER BY name`));
  console.log("emails: customers except those with orders?", await one(`SELECT COUNT(*) n FROM (SELECT email FROM customers EXCEPT SELECT c.email FROM orders o INNER JOIN customers c ON o.customer_id=c.id)`));

  console.log("\n== CASE WHEN facts ==");
  console.log("price buckets <50 / 50-99.99 / >=100:", await q(`SELECT CASE WHEN price < 50 THEN 'budget' WHEN price < 100 THEN 'mid' ELSE 'premium' END AS band, COUNT(*) n FROM products GROUP BY band ORDER BY band`));
  console.log("order size buckets small<100 / 100-499 / large>=500:", await q(`SELECT CASE WHEN total < 100 THEN 'small' WHEN total < 500 THEN 'medium' ELSE 'large' END AS size, COUNT(*) n FROM orders GROUP BY size ORDER BY size`));
  console.log("status->open/closed CASE:", await q(`SELECT CASE WHEN status IN ('pending','shipped') THEN 'open' ELSE 'closed' END AS bucket, COUNT(*) n FROM orders GROUP BY bucket ORDER BY bucket`));
  console.log("region CASE pivot (delivered/shipped/pending/cancelled cols):", await q(`SELECT c.region, SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) delivered, SUM(CASE WHEN o.status='shipped' THEN 1 ELSE 0 END) shipped, SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) pending, SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) cancelled FROM orders o INNER JOIN customers c ON o.customer_id = c.id GROUP BY c.region ORDER BY c.region`));
  console.log("CASE no ELSE on EU/non-EU (NULL bucket appears?):", await q(`SELECT CASE WHEN region='EU' THEN 'home' END AS market, COUNT(*) n FROM customers GROUP BY market ORDER BY market`));
  console.log("CASE in ORDER BY (pending first):", await q(`SELECT id, status FROM orders ORDER BY CASE WHEN status='pending' THEN 0 ELSE 1 END, id LIMIT 16`));
  console.log("revenue by band via CASE:", await q(`SELECT CASE WHEN o.status='cancelled' THEN 'lost' WHEN o.status='pending' THEN 'at risk' ELSE 'banked' END AS bucket, ROUND(SUM(o.total),2) revenue, COUNT(*) n FROM orders o GROUP BY bucket ORDER BY revenue DESC`));
  console.log("customer CASE tier by spend:", await q(`SELECT c.name, ROUND(COALESCE(SUM(o.total),0),2) spend, CASE WHEN COALESCE(SUM(o.total),0) >= 3000 THEN 'whale' WHEN COALESCE(SUM(o.total),0) >= 1500 THEN 'regular' ELSE 'occasional' END tier FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY spend DESC`));

  console.log("\n== set chains / misc ==");
  console.log("delivered EU ∪ shipped EU count:", await one(`SELECT COUNT(*) n FROM (SELECT o.id FROM orders o INNER JOIN customers c ON o.customer_id=c.id WHERE c.region='EU' AND o.status='delivered' UNION SELECT o.id FROM orders o INNER JOIN customers c ON o.customer_id=c.id WHERE c.region='EU' AND o.status='shipped')`));
  console.log("delivered EU count:", await one(`SELECT COUNT(*) n FROM orders o INNER JOIN customers c ON o.customer_id=c.id WHERE c.region='EU' AND o.status='delivered'`));
  console.log("shipped EU count:", await one(`SELECT COUNT(*) n FROM orders o INNER JOIN customers c ON o.customer_id=c.id WHERE c.region='EU' AND o.status='shipped'`));
  console.log("delivered∩shipped EU (overlap=0?):", await one(`SELECT COUNT(*) n FROM (SELECT o.id FROM orders o INNER JOIN customers c ON o.customer_id=c.id WHERE c.region='EU' AND o.status='delivered' INTERSECT SELECT o.id FROM orders o INNER JOIN customers c ON o.customer_id=c.id WHERE c.region='EU' AND o.status='shipped')`));
  console.log("top5 price products:", await q(`SELECT name, price FROM products ORDER BY price DESC LIMIT 5`));
  console.log("bottom5:", await q(`SELECT name, price FROM products ORDER BY price ASC LIMIT 5`));
  console.log("US customers:", await q(`SELECT name FROM customers WHERE region='US' ORDER BY name`));
  console.log("customer∩product names:", await one(`SELECT COUNT(*) n FROM (SELECT name FROM customers INTERSECT SELECT name FROM products)`));
  console.log("customer∩supplier∩product names:", await q(`SELECT name FROM customers INTERSECT SELECT name FROM suppliers INTERSECT SELECT name FROM products`));
  console.log("emails domains:", await q(`SELECT substr(email, instr(email,'@')+1) dom, COUNT(*) n FROM customers GROUP BY dom ORDER BY n DESC`));

  console.log("\n== union column alignment (predict-output ammo) ==");
  console.log("misaligned union 1 col vs 2:", await q(`SELECT name FROM customers UNION SELECT name, region FROM suppliers LIMIT 3`).catch((e) => String(e).slice(0, 160)));
  console.log("status-region aligned union sample rows:", await q(`SELECT status AS val, 'status' AS src, COUNT(*) n FROM orders GROUP BY status UNION ALL SELECT region, 'region', COUNT(*) FROM customers GROUP BY region ORDER BY src, val`));
  console.log("pending totals for decoys:", await q(`SELECT total FROM orders WHERE status='pending' ORDER BY total`));
  console.log("cancelled totals:", await q(`SELECT total FROM orders WHERE status='cancelled' ORDER BY total`));
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
