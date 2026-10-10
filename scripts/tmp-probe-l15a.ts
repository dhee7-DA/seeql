import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (s: string) => {
  console.log("--", s.slice(0, 90));
  try {
    console.log(JSON.stringify(db.query(s).all()));
  } catch (e) {
    console.log("ERROR:", e instanceof Error ? e.message : String(e));
  }
  console.log();
};

// 1. delivered revenue by category (cs-516)
q(`SELECT p.category, ROUND(SUM(oi.quantity*oi.unit_price),2) v, COUNT(*) lc FROM order_items oi JOIN orders o ON oi.order_id=o.id JOIN products p ON oi.product_id=p.id WHERE o.status='delivered' GROUP BY p.category ORDER BY v DESC`);
// 2. shipped revenue by category (walkthrough contrast)
q(`SELECT p.category, ROUND(SUM(oi.quantity*oi.unit_price),2) v FROM order_items oi JOIN orders o ON oi.order_id=o.id JOIN products p ON oi.product_id=p.id WHERE o.status='shipped' GROUP BY p.category ORDER BY v DESC`);
// 3. cancelled line-grain per product (cs-517)
q(`SELECT p.name, ROUND(SUM(oi.quantity*oi.unit_price),2) v, COUNT(o.id) lc FROM order_items oi JOIN products p ON oi.product_id=p.id LEFT JOIN orders o ON oi.order_id=o.id AND o.status='cancelled' GROUP BY p.name ORDER BY v DESC`);
// 4. lines/bookings/spend per account (cs-513)
q(`SELECT c.name, COUNT(*) lc, COUNT(DISTINCT o.id) ob, ROUND(SUM(oi.quantity*oi.unit_price),2) sp FROM order_items oi JOIN orders o ON oi.order_id=o.id JOIN customers c ON o.customer_id=c.id GROUP BY c.name ORDER BY lc DESC`);
// 5. per-product lines/revenue/units, all 16 (cs-508/cs-515)
q(`SELECT p.name, COUNT(*) lc, ROUND(SUM(oi.quantity*oi.unit_price),2) rev, SUM(oi.quantity) u FROM order_items oi JOIN products p ON oi.product_id=p.id GROUP BY p.name ORDER BY rev DESC`);
// 6. status revenue sanity
q(`SELECT o.status, ROUND(SUM(o.total),2) v, COUNT(*) n FROM orders o JOIN customers c ON o.customer_id=c.id GROUP BY o.status ORDER BY v DESC`);
// 7. supplier chain sanity
q(`SELECT s.name, ROUND(SUM(oi.quantity*oi.unit_price),2) rev, COUNT(*) lc, SUM(oi.quantity) u FROM order_items oi JOIN products p ON oi.product_id=p.id JOIN suppliers s ON p.supplier_id=s.id GROUP BY s.name ORDER BY rev DESC`);
// 8. category line grain sanity
q(`SELECT p.category, ROUND(SUM(oi.quantity*oi.unit_price),2) rev, COUNT(*) lc, SUM(oi.quantity) u FROM order_items oi JOIN products p ON oi.product_id=p.id GROUP BY p.category ORDER BY rev DESC`);
// 9. spend leaderboard top5
q(`SELECT c.name, ROUND(SUM(o.total),2) sp, COUNT(*) n FROM orders o JOIN customers c ON o.customer_id=c.id GROUP BY c.name HAVING COUNT(*) >= 5 ORDER BY sp DESC`);
// 10. pending per account LEFT JOIN ghost sheet (cs-514)
q(`SELECT c.name, COUNT(*) sr, COUNT(o.id) ot, COALESCE(ROUND(SUM(o.total),2),0) sp FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='pending' GROUP BY c.name ORDER BY sp DESC, c.name`);
// 11. cancelled per account (cs-504/cs-507)
q(`SELECT c.name, ROUND(SUM(o.total),2) sp, COUNT(*) n FROM orders o JOIN customers c ON o.customer_id=c.id WHERE o.status='cancelled' GROUP BY c.name ORDER BY sp DESC`);
q(`SELECT c.name, COALESCE(ROUND(SUM(o.total),2),0) sp, COUNT(o.id) t FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='cancelled' GROUP BY c.name ORDER BY sp DESC, c.name`);
// 12. pending per account (cs-512)
q(`SELECT c.name, ROUND(SUM(o.total),2) sp, COUNT(*) n FROM orders o JOIN customers c ON o.customer_id=c.id WHERE o.status='pending' GROUP BY c.name HAVING ROUND(SUM(o.total),2) >= 1088.44 ORDER BY sp DESC`);
// engine probes
q(`SELECT c.name, COUNT(*) n FROM orders o JOIN customers c ON o.customer_id=c.id GROUP BY c.name HAVING COUNT(*) >= o.id LIMIT 2`);
q(`SELECT c.name FROM orders o JOIN customers c ON o.customer_id=c.id GROUP BY c.name HAVING COUNT(*) >= p.category LIMIT 2`);
q(`SELECT c.name FROM orders o JOIN customers c ON SUM(o.total) = c.id LIMIT 1`);
q(`SELECT MAX(NULL, 0) AS m`);
q(`SELECT ROUND(NULL, 0) AS r`);
q(`SELECT c.name FROM customers c ORDER BY c.name LIMIT SUM(1)`);
q(`SELECT c.name, COUNT(*) n FROM orders o JOIN customers c ON o.customer_id=c.id GROUP BY c.name ORDER BY c.name LIMIT 2`);
