// j7-a probe 4 — final gap-fills for walkthrough figures.
import { Database } from "bun:sqlite";
const db = new Database(".tmp-j7a.db", { readonly: true });
function q(label: string, sql: string) {
  try {
    console.log(`\n== ${label} ==`);
    console.log(JSON.stringify(db.query(sql).all()));
  } catch (e) {
    console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}
// naive 3-hop pending-arm anti (the ∃-broken shape) — distinct count for coaching
q("naive pending-arm anti distinct count", `
SELECT COUNT(DISTINCT c.name) n FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'pending'
WHERE p.id IS NULL`);
// naive 3-hop wrong_item-arm anti distinct count
q("naive wrong_item-arm anti distinct count", `
SELECT COUNT(DISTINCT c.name) n FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN refunds r ON r.order_id = o.id AND r.reason = 'wrong_item'
WHERE r.id IS NULL`);
// customer-level (wrong) split grouping: anti count
q("split grouped by CUSTOMER anti count (the wrong question)", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.customer_id HAVING COUNT(*) > 1) s
ON s.customer_id = c.id WHERE s.customer_id IS NULL`);
// no-shipped six: any refunds among them? (color)
q("six never-shipped: refunds on their tickets", `
SELECT c.name, COUNT(r.id) claims FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN refunds r ON r.order_id = o.id
WHERE c.id IN (2,3,4,6,11,15) GROUP BY c.id ORDER BY claims DESC`);
// pending payers' pending value (color for cs-251)
q("pending value per pending payer", `
SELECT c.name, COUNT(*) n, ROUND(SUM(p.amount),2) v FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN payments p ON p.order_id = o.id AND p.status = 'pending'
GROUP BY c.id ORDER BY v DESC`);
db.close();
