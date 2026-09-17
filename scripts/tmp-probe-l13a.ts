// temp probe for l13a — delete after use
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log("== " + label);
  for (const r of q(sql) as any[]) console.log(JSON.stringify(r));
};

// 1. never-shipped list, region-sorted (cs-435)
show("1 never-shipped list", `SELECT c.name, c.city, c.region, c.active FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL ORDER BY c.region, c.name`);
// 2. two-count 6/0 (cs-447)
show("2 two-count", `SELECT COUNT(*) AS accounts, COUNT(o.id) AS shipped_bookings FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL`);
// 3. never-delivered count (cs-437)
show("3 never-delivered", `SELECT COUNT(*) AS forgotten FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' WHERE o.id IS NULL`);
// 4. never-pended count + list w/ emails (cs-438, cs-445)
show("4a never-pended count", `SELECT COUNT(*) AS quiet FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL`);
show("4b never-pended list", `SELECT c.name, c.email FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL ORDER BY c.name`);
// 5. never-cancelled list (cs-439)
show("5 never-cancelled", `SELECT c.name, c.city FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled' WHERE o.id IS NULL ORDER BY c.name`);
// 6. region rollup (cs-441)
show("6 region rollup", `SELECT c.region, COUNT(*) AS quiet_accounts FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL GROUP BY c.region ORDER BY quiet_accounts DESC, c.region`);
// 7. dormant never-shipped (cs-442)
show("7 dormant never-shipped", `SELECT c.name, c.city, c.email FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL AND c.active = 0 ORDER BY c.name`);
// 8. stock>250 hole vendors + 200/150/210 variants (cs-436)
show("8 stock>250 holes", `SELECT s.name, s.region FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.stock > 250 WHERE p.id IS NULL ORDER BY s.name`);
show("8b stock>200 holes", `SELECT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.stock > 200 WHERE p.id IS NULL`);
show("8c stock>150 holes", `SELECT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.stock > 150 WHERE p.id IS NULL`);
show("8d stock>210 holes", `SELECT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.stock > 210 WHERE p.id IS NULL`);
// 9. price>150 hole vendors + 100/200 variants (cs-443)
show("9 price>150 holes", `SELECT s.name, s.rating FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.price > 150 WHERE p.id IS NULL ORDER BY s.rating DESC`);
show("9b price>100 holes", `SELECT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.price > 100 WHERE p.id IS NULL`);
show("9c price>200 holes", `SELECT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.price > 200 WHERE p.id IS NULL`);
// 10. stock<95 holes + 45/150 variants (cs-444)
show("10 stock<95 holes", `SELECT s.name, s.region FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.stock < 95 WHERE p.id IS NULL ORDER BY s.name`);
show("10b stock<45 holes", `SELECT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.stock < 45 WHERE p.id IS NULL`);
show("10c stock<150 holes", `SELECT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.stock < 150 WHERE p.id IS NULL`);
// 11. rating>4.0 product holes + 4.5/3.9 variants (cs-440)
show("11 rating>4.0 holes", `SELECT p.name, p.category FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id AND s.rating > 4.0 WHERE s.id IS NULL ORDER BY p.name`);
show("11b rating>4.5 holes", `SELECT p.name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id AND s.rating > 4.5 WHERE s.id IS NULL`);
show("11c rating>3.9 holes", `SELECT p.name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id AND s.rating > 3.9 WHERE s.id IS NULL`);
// 12. Apparel hole vendors + Accessories/Audio variants (cs-446)
show("12 apparel holes", `SELECT s.name, s.rating FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.category = 'Apparel' WHERE p.id IS NULL ORDER BY s.rating DESC`);
show("12b accessories holes", `SELECT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.category = 'Accessories' WHERE p.id IS NULL`);
show("12c audio holes", `SELECT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.category = 'Audio' WHERE p.id IS NULL`);
// 13. line-grain stalled lines + split (cs-448)
show("13 stalled lines", `SELECT COUNT(*) AS stalled_lines FROM order_items oi LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'shipped' WHERE o.id IS NULL`);
show("13b pending lines", `SELECT COUNT(*) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.status = 'pending'`);
show("13c cancelled lines", `SELECT COUNT(*) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.status = 'cancelled'`);
show("13d delivered lines", `SELECT COUNT(*) FROM order_items oi LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'delivered' WHERE o.id IS NULL`);
// 14. zeros sweeps (cs-449, cs-450)
show("14a orphans", `SELECT COUNT(*) FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE c.id IS NULL`);
show("14b never-ordered", `SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`);
show("14c never-sold products", `SELECT COUNT(*) FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL`);
db.close();
