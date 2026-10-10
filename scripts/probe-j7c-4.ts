/// <reference types="bun-types" />
import { Database } from "bun:sqlite";
const db = new Database("scripts/.tmp-j7c.db", { readonly: true });
function q(label: string, sql: string) {
  try { console.log(`\n== ${label} ==`); console.log(JSON.stringify(db.query(sql).all())); }
  catch (e) { console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : String(e)}`); }
}
q("products with zero ACTIVE-customer lines (chip check)",
  `SELECT p.name FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id AND c.active = 1
   GROUP BY p.id HAVING COUNT(c.id) = 0 ORDER BY p.name`);
q("churned =2 product (name)",
  `SELECT p.name, COUNT(c.id) n FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id AND c.active = 0
   GROUP BY p.id HAVING COUNT(c.id) = 2`);
q("FILL names: products never bought by email arrivals",
  `SELECT p.name FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id
   LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'email'
   GROUP BY p.id HAVING COUNT(a.id) = 0 ORDER BY p.name`);
q("email pair union products",
  `SELECT COUNT(DISTINCT p.id) n FROM customers c
   JOIN acquisitions a ON a.customer_id = c.id AND a.channel='email'
   JOIN orders o ON o.customer_id=c.id JOIN order_items oi ON oi.order_id=o.id
   JOIN products p ON p.id=oi.product_id`);
q("min refund amount", `SELECT MIN(amount) mn, MAX(amount) mx FROM refunds`);
q("Yoga Mat line summary", `SELECT COUNT(*) lines, SUM(CASE WHEN c.region='US' THEN 1 ELSE 0 END) us
   FROM order_items oi JOIN orders o ON o.id=oi.order_id JOIN customers c ON c.id=o.customer_id
   JOIN products p ON p.id=oi.product_id WHERE p.name='Yoga Mat Eco 6mm'`);
q("acquisition spend total", `SELECT ROUND(SUM(spend),2) FROM acquisitions`);
db.close(); console.log("\ndone");
