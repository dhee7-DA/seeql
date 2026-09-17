/** s-family audit probes — verify data-truth claims in s8/s11/s12 figures. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.saudit-facts.db");
const db = new Database("scripts/.saudit-facts.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 1500));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// s8: categories in delivered vs pending lists
q("s8 cats delivered", `SELECT COUNT(DISTINCT p.category) n FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE o.status='delivered'`);
q("s8 cats pending", `SELECT COUNT(DISTINCT p.category) n FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE o.status='pending'`);
q("s8 delivered-only cats", `SELECT DISTINCT p.category FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE o.status='delivered' AND p.category NOT IN (SELECT p2.category FROM orders o2 JOIN order_items oi2 ON oi2.order_id = o2.id JOIN products p2 ON p2.id = oi2.product_id WHERE o2.status='pending')`);
q("s8 both-count", `SELECT COUNT(*) n FROM (SELECT DISTINCT p.category FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id WHERE o.status='delivered' INTERSECT SELECT DISTINCT p.category FROM orders o2 JOIN order_items oi2 ON oi2.order_id=o2.id JOIN products p2 ON p2.id=oi2.product_id WHERE o2.status='pending')`);
q("s8 total cats", `SELECT COUNT(DISTINCT category) n FROM products`);

// s11/s3: distinct customers delivered / cancelled / both
q("s11 armA", `SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE status='delivered'`);
q("s11 armB", `SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE status='cancelled'`);
q("s11 both", `SELECT COUNT(*) n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='cancelled')`);

// s12: EXCEPT customers vs shipped
q("s12 shipped subquery NULLs", `SELECT COUNT(*) n FROM orders WHERE status='shipped' AND customer_id IS NULL`);
q("s12 survive", `SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status='shipped' AND customer_id IS NOT NULL)`);
q("s12 survive EXCEPT", `SELECT COUNT(*) n FROM (SELECT id FROM customers EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='shipped')`);
q("s12 struck", `SELECT COUNT(*) n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='shipped')`);

// s5/s13: A union B intersect C ground
q("s13 sqlite (AUB)IC", `SELECT COUNT(*) n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered' UNION SELECT DISTINCT customer_id FROM orders WHERE status='cancelled' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='pending')`);
q("s13 std A U (BIC)", `SELECT COUNT(*) n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered' UNION SELECT DISTINCT customer_id FROM orders WHERE status='cancelled' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='pending')`);

// s1: union all vs union on status
q("s1 all", `SELECT COUNT(*) n FROM (SELECT status FROM orders UNION ALL SELECT status FROM orders)`);
q("s1 distinct", `SELECT COUNT(*) n FROM (SELECT status FROM orders UNION SELECT status FROM orders)`);

db.close();
