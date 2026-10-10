// m3-cases-a1 probe — verifies every figure for cases cs-601..cs-650 (topics s1-s4).
// Run: bun scripts/m3-cases-a1-probe.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3a1.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const rows = (sql: string) => JSON.stringify(db.prepare(sql).all());

try {
  console.log("== TABLE SIZES ==");
  console.log("orders:", one(`SELECT COUNT(*) n FROM orders`));
  console.log("customers:", one(`SELECT COUNT(*) n FROM customers`));
  console.log("suppliers:", one(`SELECT COUNT(*) n FROM suppliers`));
  console.log("products:", one(`SELECT COUNT(*) n FROM products`));
  console.log("order_items:", one(`SELECT COUNT(*) n FROM order_items`));

  console.log("\n== DISTRIBUTIONS ==");
  console.log("orders by status:", rows(`SELECT status, COUNT(*) n, ROUND(SUM(total),2) s FROM orders GROUP BY status ORDER BY status`));
  console.log("customers by region:", rows(`SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY region`));
  console.log("suppliers by region:", rows(`SELECT region, COUNT(*) n FROM suppliers GROUP BY region ORDER BY region`));
  console.log("products by category:", rows(`SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY category`));
  console.log("customers by active:", rows(`SELECT active, COUNT(*) n FROM customers GROUP BY active`));
  console.log("supplier ratings:", rows(`SELECT id, name, region, rating FROM suppliers ORDER BY id`));
  console.log("customers:", rows(`SELECT id, name, city, region, active FROM customers ORDER BY id`));
  console.log("products:", rows(`SELECT id, name, category, price, stock FROM products ORDER BY id`));

  console.log("\n== DISJOINTNESS / OVERLAP CHECKS ==");
  console.log("distinct cities:", one(`SELECT COUNT(DISTINCT city) n FROM customers`));
  console.log("cities ∩ supplier names:", one(`SELECT COUNT(*) n FROM (SELECT city v FROM customers INTERSECT SELECT name FROM suppliers)`));
  console.log("product names ∩ supplier names:", one(`SELECT COUNT(*) n FROM (SELECT name v FROM products INTERSECT SELECT name FROM suppliers)`));
  console.log("product names ∩ customer names:", one(`SELECT COUNT(*) n FROM (SELECT name v FROM products INTERSECT SELECT name FROM customers)`));
  console.log("status ∩ customer regions:", one(`SELECT COUNT(*) n FROM (SELECT status v FROM orders INTERSECT SELECT region FROM customers)`));
  console.log("status ∩ product categories:", one(`SELECT COUNT(*) n FROM (SELECT status v FROM orders INTERSECT SELECT category FROM products)`));
  console.log("category ∩ customer regions:", one(`SELECT COUNT(*) n FROM (SELECT category v FROM products INTERSECT SELECT region FROM customers)`));
  console.log("customer names ∩ supplier names:", one(`SELECT COUNT(*) n FROM (SELECT name v FROM customers INTERSECT SELECT name FROM suppliers)`));
  console.log("orders.id ∩ customers.id:", one(`SELECT COUNT(*) n FROM (SELECT id FROM orders INTERSECT SELECT id FROM customers)`));
  console.log("products all sold:", one(`SELECT COUNT(*) n FROM products WHERE id NOT IN (SELECT product_id FROM order_items)`));
  console.log("distinct product_id in items:", one(`SELECT COUNT(DISTINCT product_id) n FROM order_items`));
  console.log("customers with orders:", one(`SELECT COUNT(DISTINCT customer_id) n FROM orders`));
  console.log("orders.id ∩ products.id:", one(`SELECT COUNT(*) n FROM (SELECT id FROM orders INTERSECT SELECT id FROM products)`));

  console.log("\n== UNION RECEIPTS ==");
  console.log("status ∪ cust regions:", one(`SELECT COUNT(*) n FROM (SELECT status v FROM orders UNION SELECT region FROM customers)`));
  console.log("status ∪ ALL cust regions:", one(`SELECT COUNT(*) n FROM (SELECT status v FROM orders UNION ALL SELECT region FROM customers)`));
  console.log("cities ∪ supplier names:", one(`SELECT COUNT(*) n FROM (SELECT city v FROM customers UNION SELECT name FROM suppliers)`));
  console.log("cities ∪ ALL supplier names:", one(`SELECT COUNT(*) n FROM (SELECT city v FROM customers UNION ALL SELECT name FROM suppliers)`));
  console.log("cust regions ∪ sup regions:", one(`SELECT COUNT(*) n FROM (SELECT region v FROM customers UNION SELECT region FROM suppliers)`));
  console.log("cust regions ∪ALL sup regions:", one(`SELECT COUNT(*) n FROM (SELECT region v FROM customers UNION ALL SELECT region FROM suppliers)`));
  console.log("status ∪ categories:", one(`SELECT COUNT(*) n FROM (SELECT status v FROM orders UNION SELECT category FROM products)`));
  console.log("status ∪ supplier regions:", one(`SELECT COUNT(*) n FROM (SELECT status v FROM orders UNION SELECT region FROM suppliers)`));
  console.log("product names ∪ supplier names:", one(`SELECT COUNT(*) n FROM (SELECT name v FROM products UNION SELECT name FROM suppliers)`));
  console.log("status ∪ ALL status(shipped arm):", one(`SELECT COUNT(*) n FROM (SELECT status v FROM orders UNION ALL SELECT 'shipped' v)`));

  console.log("\n== INTERSECT RECEIPTS ==");
  console.log("order cust ids ∩ customers.id:", one(`SELECT COUNT(*) n FROM (SELECT customer_id v FROM orders INTERSECT SELECT id FROM customers)`));
  console.log("cust regions ∩ sup regions:", one(`SELECT COUNT(*) n FROM (SELECT region v FROM customers INTERSECT SELECT region FROM suppliers)`));
  console.log("status ∩ cust regions:", one(`SELECT COUNT(*) n FROM (SELECT status v FROM orders INTERSECT SELECT region FROM customers)`));
  console.log("product ids ∩ sold ids:", one(`SELECT COUNT(*) n FROM (SELECT id v FROM products INTERSECT SELECT product_id FROM order_items)`));
  console.log("delivered ids ∩ big(>=500):", one(`SELECT COUNT(*) n FROM (SELECT id v FROM orders WHERE status='delivered' INTERSECT SELECT id FROM orders WHERE total >= 500)`));
  console.log("delivered ids ∩ small(<100):", one(`SELECT COUNT(*) n FROM (SELECT id v FROM orders WHERE status='delivered' INTERSECT SELECT id FROM orders WHERE total < 100)`));
  console.log("EU cust ∩ delivered-order cust:", one(`SELECT COUNT(*) n FROM (SELECT id v FROM customers WHERE region='EU' INTERSECT SELECT customer_id FROM orders WHERE status='delivered')`));
  console.log("APAC cust ∩ cancelled cust:", one(`SELECT COUNT(*) n FROM (SELECT id v FROM customers WHERE region='APAC' INTERSECT SELECT customer_id FROM orders WHERE status='cancelled')`));
  console.log("US cust ∩ pending cust:", one(`SELECT COUNT(*) n FROM (SELECT id v FROM customers WHERE region='US' INTERSECT SELECT customer_id FROM orders WHERE status='pending')`));
  console.log("active cust ∩ ordered cust:", one(`SELECT COUNT(*) n FROM (SELECT id v FROM customers WHERE active=1 INTERSECT SELECT customer_id FROM orders)`));
  console.log("cust cities ∩ sup regions:", one(`SELECT COUNT(*) n FROM (SELECT city v FROM customers INTERSECT SELECT region FROM suppliers)`));
  console.log("pending ids ∩ items>1 orders:", one(`SELECT COUNT(*) n FROM (SELECT id v FROM orders WHERE status='pending' INTERSECT SELECT order_id FROM order_items GROUP BY order_id HAVING SUM(quantity) > 1)`));

  console.log("\n== EXCEPT RECEIPTS ==");
  console.log("status ∖ cust regions:", one(`SELECT COUNT(*) n FROM (SELECT status v FROM orders EXCEPT SELECT region FROM customers)`));
  console.log("sup regions ∖ cust regions:", one(`SELECT COUNT(*) n FROM (SELECT region v FROM suppliers EXCEPT SELECT region FROM customers)`));
  console.log("cust regions ∖ sup regions:", one(`SELECT COUNT(*) n FROM (SELECT region v FROM customers EXCEPT SELECT region FROM suppliers)`));
  console.log("product ids ∖ sold ids:", one(`SELECT COUNT(*) n FROM (SELECT id v FROM products EXCEPT SELECT product_id FROM order_items)`));
  console.log("order ids ∖ customer ids:", one(`SELECT COUNT(*) n FROM (SELECT id v FROM orders EXCEPT SELECT id FROM customers)`));
  console.log("customer ids ∖ order cust ids:", one(`SELECT COUNT(*) n FROM (SELECT id v FROM customers EXCEPT SELECT customer_id FROM orders)`));
  console.log("supplier names ∖ customer names:", one(`SELECT COUNT(*) n FROM (SELECT name v FROM suppliers EXCEPT SELECT name FROM customers)`));
  console.log("all order statuses ∖ pending:", one(`SELECT COUNT(*) n FROM (SELECT status v FROM orders EXCEPT SELECT status FROM orders WHERE status='pending')`));
  console.log("big(>=500) ids ∖ delivered ids:", one(`SELECT COUNT(*) n FROM (SELECT id v FROM orders WHERE total >= 500 EXCEPT SELECT id FROM orders WHERE status='delivered')`));
  console.log("cust ids ∖ delivered cust ids:", one(`SELECT COUNT(*) n FROM (SELECT id v FROM customers EXCEPT SELECT customer_id FROM orders WHERE status='delivered')`));
  console.log("cust ids ∖ EU cust ids:", one(`SELECT COUNT(*) n FROM (SELECT id v FROM customers EXCEPT SELECT id FROM customers WHERE region='EU')`));
  console.log("status ∖ {pending,shipped}:", one(`SELECT COUNT(*) n FROM (SELECT status v FROM orders EXCEPT SELECT status FROM orders WHERE status IN ('pending','shipped'))`));
  console.log("sup names ∖ cust cities:", one(`SELECT COUNT(*) n FROM (SELECT name v FROM suppliers EXCEPT SELECT city FROM customers)`));

  console.log("\n== AGGREGATES ==");
  console.log("max/min/avg total:", one(`SELECT MAX(total) mx, MIN(total) mn, ROUND(AVG(total),2) av FROM orders`));
  console.log("pending:", one(`SELECT COUNT(*) n, ROUND(SUM(total),2) s FROM orders WHERE status='pending'`));
  console.log("delivered:", one(`SELECT COUNT(*) n, ROUND(SUM(total),2) s FROM orders WHERE status='delivered'`));
  console.log("cancelled:", one(`SELECT COUNT(*) n, ROUND(SUM(total),2) s FROM orders WHERE status='cancelled'`));
  console.log("shipped:", one(`SELECT COUNT(*) n, ROUND(SUM(total),2) s FROM orders WHERE status='shipped'`));
  console.log("totals >= 500:", one(`SELECT COUNT(*) n FROM orders WHERE total >= 500`));
  console.log("totals < 100:", one(`SELECT COUNT(*) n FROM orders WHERE total < 100`));
  console.log("distinct totals:", one(`SELECT COUNT(DISTINCT total) n FROM orders`));
  console.log("max unit_price items:", one(`SELECT MAX(unit_price) mx, MIN(unit_price) mn FROM order_items`));
  console.log("items qty>=2:", one(`SELECT COUNT(*) n FROM order_items WHERE quantity >= 2`));
  console.log("total qty sold:", one(`SELECT SUM(quantity) n FROM order_items`));
  console.log("shelf value:", one(`SELECT ROUND(SUM(price*stock),2) v FROM products`));
  console.log("max stock:", one(`SELECT MAX(stock) mx, MIN(stock) mn FROM products`));
  console.log("order_items revenue:", one(`SELECT ROUND(SUM(quantity*unit_price),2) v FROM order_items`));
  console.log("avg items per order:", one(`SELECT ROUND(AVG(n),2) v FROM (SELECT COUNT(*) n FROM order_items GROUP BY order_id)`));
  console.log("distinct order_id in items:", one(`SELECT COUNT(DISTINCT order_id) n FROM order_items`));

  console.log("\n== STACKED-REPORT FIGURES (s2) ==");
  console.log("per-status stacked:", rows(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY 2 DESC, 1`));
  console.log("region revenue stacked:", rows(`SELECT 'delivered' v, ROUND(SUM(total),2) n FROM orders WHERE status='delivered' UNION ALL SELECT 'cancelled', ROUND(SUM(total),2) FROM orders WHERE status='cancelled'`));
  console.log("two-arm count stack:", rows(`SELECT 'Orders' v, COUNT(*) n FROM orders UNION ALL SELECT 'Customers', COUNT(*) FROM customers`));
  console.log("three-arm:", rows(`SELECT 'Orders' v, COUNT(*) n FROM orders UNION ALL SELECT 'Products', COUNT(*) FROM products UNION ALL SELECT 'Suppliers', COUNT(*) FROM suppliers`));
  console.log("status vs region arms:", rows(`SELECT status v, COUNT(*) n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM suppliers GROUP BY region ORDER BY 2 DESC, 1 LIMIT 4`));
  console.log("order totals vs cust count:", rows(`SELECT 'order_value' v, ROUND(SUM(total),2) n FROM orders UNION ALL SELECT 'customer_count', COUNT(*) FROM customers`));
  console.log("avg per status:", rows(`SELECT status v, ROUND(AVG(total),2) n FROM orders GROUP BY status UNION ALL SELECT region, ROUND(AVG(total),2) FROM suppliers GROUP BY region`));

  console.log("\n== ORDER-BY / COMPOUND SHAPES ==");
  console.log("top statuses by n desc:", rows(`SELECT v, n FROM (SELECT status v, COUNT(*) n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region) ORDER BY n DESC, v LIMIT 3`));
  console.log("alphabetical union top:", rows(`SELECT v FROM (SELECT status v FROM orders UNION SELECT region FROM customers) ORDER BY v LIMIT 3`));

  console.log("\n== FILTER THRESHOLD FIGURES (for WHERE slots w/ noVerify fallback) ==");
  console.log("totals >= 338.19 mean:", one(`SELECT COUNT(*) n FROM orders WHERE total >= 338.19`));
  console.log("price >= 100 products:", one(`SELECT COUNT(*) n FROM products WHERE price >= 100`));
  console.log("stock >= 50 products:", one(`SELECT COUNT(*) n FROM products WHERE stock >= 50`));
  console.log("rating >= 4.5 suppliers:", one(`SELECT COUNT(*) n FROM suppliers WHERE rating >= 4.5`));
  console.log("EU delivered sum:", one(`SELECT ROUND(SUM(o.total),2) s FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='EU' AND o.status='delivered'`));
  console.log("APAC delivered sum:", one(`SELECT ROUND(SUM(o.total),2) s FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='APAC' AND o.status='delivered'`));
  console.log("US delivered sum:", one(`SELECT ROUND(SUM(o.total),2) s FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='US' AND o.status='delivered'`));
  console.log("LATAM delivered sum:", one(`SELECT ROUND(SUM(o.total),2) s FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='LATAM' AND o.status='delivered'`));
  console.log("delivered EU count:", one(`SELECT COUNT(*) n FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='EU' AND o.status='delivered'`));
  console.log("delivered APAC count:", one(`SELECT COUNT(*) n FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='APAC' AND o.status='delivered'`));
  console.log("delivered US count:", one(`SELECT COUNT(*) n FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='US' AND o.status='delivered'`));
  console.log("delivered LATAM count:", one(`SELECT COUNT(*) n FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='LATAM' AND o.status='delivered'`));
  console.log("cancelled count:", one(`SELECT COUNT(*) n FROM orders WHERE status='cancelled'`));
} finally {
  db.close();
  rmSync(COPY, { force: true });
}
