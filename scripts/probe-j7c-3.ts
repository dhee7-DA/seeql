/// <reference types="bun-types" />
import { Database } from "bun:sqlite";
const db = new Database("scripts/.tmp-j7c.db", { readonly: true });
function q(label: string, sql: string) {
  try { console.log(`\n== ${label} ==`); console.log(JSON.stringify(db.query(sql).all())); }
  catch (e) { console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : String(e)}`); }
}
q("FILL: products never bought by US customers",
  `SELECT p.name, p.category, COUNT(c.id) AS us_lines
   FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id AND c.region = 'US'
   GROUP BY p.id HAVING COUNT(c.id) = 0 ORDER BY p.name`);
q("FILL alt: products never bought by LATAM customers",
  `SELECT p.name FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id AND c.region = 'LATAM'
   GROUP BY p.id HAVING COUNT(c.id) = 0 ORDER BY p.name`);
q("Emma Wilson basket", `SELECT p.name FROM customers c JOIN orders o ON o.customer_id=c.id
   JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id
   WHERE c.name='Emma Wilson' GROUP BY p.id ORDER BY p.name`);
q("Jamal Wright basket", `SELECT p.name FROM customers c JOIN orders o ON o.customer_id=c.id
   JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id
   WHERE c.name='Jamal Wright' GROUP BY p.id ORDER BY p.name`);
q("line counts by region", `SELECT c.region, COUNT(*) lines FROM order_items oi
   JOIN orders o ON o.id=oi.order_id JOIN customers c ON c.id=o.customer_id GROUP BY c.region`);
q("US orders count", `SELECT COUNT(*) n, COUNT(DISTINCT o.customer_id) buyers FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='US'`);
q("Smart Watch S US lines?", `SELECT COUNT(*) n FROM order_items oi JOIN orders o ON o.id=oi.order_id
   JOIN customers c ON c.id=o.customer_id JOIN products p ON p.id=oi.product_id
   WHERE c.region='US' AND p.name='Smart Watch S'`);
db.close(); console.log("\ndone");
