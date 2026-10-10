// Truth probe for the lesson-12 LEFT JOIN 3D scene (j12-left-space-3d).
// Every number rendered in the scene must come from this run.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (s: string) => db.query(s).all();
const one = (s: string) => db.query(s).get() as Record<string, unknown>;

console.log("== base counts ==");
console.log("customers:", one(`SELECT COUNT(*) n FROM customers`));
console.log("orders:", one(`SELECT COUNT(*) n FROM orders`));
console.log("orders by status:", q(`SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY n DESC`));

console.log("== LEFT JOIN base (no status filter) ==");
console.log("total rows:", one(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id`));
console.log("gap rows (o.id IS NULL):", one(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`));

console.log("== shipped arm: LEFT JOIN ... AND o.status='shipped' ==");
console.log("total:", one(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'`));
console.log("matched:", one(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NOT NULL`));
console.log("gaps:", one(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL`));
console.log("gap customer names:", q(`SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL ORDER BY c.name`));

console.log("== per-customer shipped counts (all 16) ==");
console.log(q(`SELECT c.id, c.name, COUNT(o.id) FILTER (WHERE o.status='shipped') shipped, COUNT(o.id) orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY c.name`));

console.log("== WHERE collapse check (shipped in WHERE) ==");
console.log("rows:", one(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.status = 'shipped'`));

console.log("== other arms (for fact consistency with lesson claims) ==");
console.log("pending arm total/matched/gaps:",
  one(`SELECT COUNT(*) total, SUM(o.id IS NOT NULL) matched, SUM(o.id IS NULL) gaps FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status='pending'`));
console.log("cancelled arm:",
  one(`SELECT COUNT(*) total, SUM(o.id IS NOT NULL) matched, SUM(o.id IS NULL) gaps FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status='cancelled'`));
console.log("big-basket arm (>800):",
  one(`SELECT COUNT(*) total, SUM(o.id IS NOT NULL) matched, SUM(o.id IS NULL) gaps FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.total > 800`));
console.log("anti-join audit:",
  one(`SELECT (SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL) customer_gaps,
              (SELECT COUNT(*) FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE p.id IS NULL) item_gaps`));
db.close();
