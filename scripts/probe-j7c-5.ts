/// <reference types="bun-types" />
import { Database } from "bun:sqlite";
const db = new Database("scripts/.tmp-j7c.db", { readonly: true });
function q(label: string, sql: string) {
  try { console.log(`\n== ${label} ==`); console.log(JSON.stringify(db.query(sql).all())); }
  catch (e) { console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : String(e)}`); }
}
for (const st of ["pending", "shipped", "delivered", "cancelled"]) {
  q(`products never on a ${st} ticket`,
    `SELECT COUNT(*) n, GROUP_CONCAT(p.name) names FROM (
     SELECT p.id, p.name FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id AND o.status = '${st}'
     GROUP BY p.id HAVING COUNT(o.id) = 0) x JOIN products p ON p.id = x.id`);
}
q("pending lines per product (context top)",
  `SELECT p.name, COUNT(*) lines FROM orders o JOIN order_items oi ON oi.order_id=o.id
   JOIN products p ON p.id=oi.product_id WHERE o.status='pending' GROUP BY p.id ORDER BY lines DESC`);
q("pending book value", `SELECT COUNT(*) n, ROUND(SUM(total),2) v FROM orders WHERE status='pending'`);
q("shipped lines per product (context top)",
  `SELECT p.name, COUNT(*) lines FROM orders o JOIN order_items oi ON oi.order_id=o.id
   JOIN products p ON p.id=oi.product_id WHERE o.status='shipped' GROUP BY p.id ORDER BY lines DESC LIMIT 6`);
db.close(); console.log("\ndone");
