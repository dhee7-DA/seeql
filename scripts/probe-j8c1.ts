// probe-j8c1.ts — j4 batch context probes (readonly copy). Run from project ROOT.
// Sections: roster/self-join, collisions reference, Alice multi-touch, settlement
// chain fan-out (payments→orders→customers→acquisitions), claimed-per-region.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j8c.db", { readonly: true });

function q(title: string, sql: string) {
  console.log(`\n## ${title}`);
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    if (rows.length === 0) { console.log("(0 rows)"); return; }
    console.log(JSON.stringify(rows));
  } catch (e) {
    console.log(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ---- roster / org chart -----------------------------------------------------
q("employees roster", `SELECT id, name, role, manager_id, region FROM employees ORDER BY id`);
q("employees per manager (as reports)", `SELECT manager_id, COUNT(*) n, GROUP_CONCAT(name) names FROM employees WHERE manager_id IS NOT NULL GROUP BY manager_id`);

// ---- collisions reference ---------------------------------------------------
q("collision oi.id=o.id", `SELECT COUNT(*) n FROM order_items oi JOIN orders o ON o.id = oi.id`);
q("collision o.id=c.id", `SELECT COUNT(*) n FROM orders o JOIN customers c ON c.id = o.id`);
q("collision oi.id=p.id", `SELECT COUNT(*) n FROM order_items oi JOIN products p ON p.id = oi.id`);
q("collision s.id=o.id", `SELECT COUNT(*) n FROM shipments s JOIN orders o ON o.id = s.id`);
q("collision a.id=c.id", `SELECT COUNT(*) n FROM acquisitions a JOIN customers c ON c.id = a.id`);
q("collision r.id=e.id", `SELECT COUNT(*) n FROM refunds r JOIN employees e ON e.id = r.id`);
q("collision p.id=o.id", `SELECT COUNT(*) n FROM payments p JOIN orders o ON o.id = p.id`);
q("collision r.id=o.id", `SELECT COUNT(*) n FROM refunds r JOIN orders o ON o.id = r.id`);
q("collision p.id=c.id", `SELECT COUNT(*) n FROM payments p JOIN customers c ON c.id = p.id`);
q("table counts", `SELECT (SELECT COUNT(*) FROM customers) c, (SELECT COUNT(*) FROM suppliers) s, (SELECT COUNT(*) FROM products) p, (SELECT COUNT(*) FROM orders) o, (SELECT COUNT(*) FROM order_items) oi, (SELECT COUNT(*) FROM employees) e, (SELECT COUNT(*) FROM payments) pay, (SELECT COUNT(*) FROM refunds) r, (SELECT COUNT(*) FROM shipments) sh, (SELECT COUNT(*) FROM acquisitions) a`);

// ---- Alice multi-touch ------------------------------------------------------
q("Alice acquisitions", `SELECT a.id, a.channel, a.spend, a.acquired_at FROM acquisitions a JOIN customers c ON c.id = a.customer_id WHERE c.name = 'Alice Chen'`);
q("multi-touch customers", `SELECT c.name, COUNT(*) touches, GROUP_CONCAT(a.channel) channels FROM acquisitions a JOIN customers c ON c.id = a.customer_id GROUP BY c.id HAVING COUNT(*) > 1`);
q("Alice orders", `SELECT COUNT(*) n, SUM(o.total) tot FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen'`);
q("Alice settled payments", `SELECT COUNT(*) n, SUM(p.amount) amt FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen' AND p.status = 'settled'`);
q("referrals roster", `SELECT c.name, a.channel, a.spend FROM acquisitions a JOIN customers c ON c.id = a.customer_id ORDER BY a.channel, c.name`);

// ---- settlement chain fan-out (cash cs-292 candidate) -----------------------
q("settled per channel naive COUNT(p.id) + inflated SUM", `
SELECT a.channel,
       COUNT(p.id) AS pay_rows,
       COUNT(DISTINCT p.id) AS distinct_pay,
       ROUND(SUM(p.amount),2) AS sum_naive,
       SUM(a.spend) AS spend_rep
FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id
JOIN acquisitions a ON a.customer_id = c.id
WHERE p.status = 'settled'
GROUP BY a.channel ORDER BY a.channel`);
q("settled totals check: plain", `SELECT COUNT(*) n, ROUND(SUM(p.amount),2) amt FROM payments p WHERE p.status='settled'`);
q("settled through chain WITHOUT acquisitions", `SELECT COUNT(*) n, ROUND(SUM(p.amount),2) amt FROM payments p JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id WHERE p.status='settled'`);
q("Alice settled rows per channel (dup check)", `
SELECT c.name, a.channel, a.id touch_id, COUNT(*) pay_rows, COUNT(DISTINCT p.id) distinct_pay
FROM payments p JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id JOIN acquisitions a ON a.customer_id=c.id
WHERE p.status='settled' AND c.name='Alice Chen' GROUP BY c.name, a.channel, a.id`);

// ---- claimed money per region (receivables cs-293 candidate) ----------------
q("claims per region (correct)", `
SELECT c.region, COUNT(r.id) claims, ROUND(SUM(r.amount),2) claimed
FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
GROUP BY c.region ORDER BY c.region`);
q("claims per region with collision o.id=c.id", `
SELECT c.region, COUNT(r.id) claims, ROUND(SUM(r.amount),2) claimed
FROM refunds r JOIN orders o ON o.id = r.id JOIN customers c ON c.id = o.customer_id
GROUP BY c.region ORDER BY c.region`);
q("claims per region with collision r.id=o.id on second join? (o.id=r.id variant)", `
SELECT c.region, COUNT(r.id) claims, ROUND(SUM(r.amount),2) claimed
FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.id
GROUP BY c.region ORDER BY c.region`);
q("claims with SUM(o.total) (ticket repeated per claim)", `
SELECT c.region, COUNT(r.id) claims, ROUND(SUM(o.total),2) ticket_rep
FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
GROUP BY c.region ORDER BY c.region`);
q("double-refunded orders", `
SELECT o.id, c.name, c.region, o.total, COUNT(r.id) claims, ROUND(SUM(r.amount),2) claimed, GROUP_CONCAT(r.reason) reasons
FROM orders o JOIN customers c ON c.id = o.customer_id JOIN refunds r ON r.order_id = o.id
GROUP BY o.id HAVING COUNT(r.id) >= 2 ORDER BY o.id`);
q("claims totals", `SELECT COUNT(*) n, ROUND(SUM(amount),2) amt, COUNT(DISTINCT order_id) orders FROM refunds`);

db.close();
console.log("\nDONE probe-j8c1");
