// probe-j8c3.ts — remaining j4 candidates: self-join team ledger, hub cross-product,
// channel demand, pricing board + leftover distractor checks (readonly copy).
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j8c.db", { readonly: true });

function q(title: string, sql: string) {
  console.log(`\n## ${title}`);
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    if (rows.length === 0) { console.log("(0 rows)"); return; }
    const slim = rows.map((r) => Object.values(r).map((v) => typeof v === "number" ? Math.round(v * 100) / 100 : v));
    console.log(`(${rows.length} rows) ${JSON.stringify(slim)}`);
  } catch (e) {
    console.log(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ============ cs-296 people-ops: team claim ledger through the org chart ============
const F296 = (agg1: string, agg2: string, key: string, j4: string) => `
SELECT m.name, COUNT(e.id) AS directs, ${agg1}(r.id) AS team_claims, ROUND(${agg2}(r.amount), 2) AS exposure
FROM employees m
LEFT JOIN employees e ON ${key} = m.id
${j4} JOIN refunds r ON r.processed_by = e.id
GROUP BY m.id
ORDER BY exposure DESC`;
q("296 FILL (COUNT, SUM, e.manager_id, LEFT)", F296("COUNT", "SUM", "e.manager_id", "LEFT"));
q("296 agg1=SUM", F296("SUM", "SUM", "e.manager_id", "LEFT"));
q("296 agg2=COUNT", F296("COUNT", "COUNT", "e.manager_id", "LEFT"));
q("296 key=e.id", F296("COUNT", "SUM", "e.id", "LEFT"));
q("296 key=m.id", F296("COUNT", "SUM", "m.id", "LEFT"));
q("296 j4=INNER", F296("COUNT", "SUM", "e.manager_id", "INNER"));
q("296 j4=CROSS", F296("COUNT", "SUM", "e.manager_id", "CROSS"));
q("296 both INNER (j3 also INNER? combine check)", `
SELECT m.name, COUNT(e.id) AS directs, COUNT(r.id) AS team_claims, ROUND(SUM(r.amount), 2) AS exposure
FROM employees m
INNER JOIN employees e ON e.manager_id = m.id
INNER JOIN refunds r ON r.processed_by = e.id
GROUP BY m.id ORDER BY exposure DESC`);

// ============ cs-297 month-close: hub cross-product checks ============
q("297 context: orders with settled payments AND refunds", `
SELECT o.id, c.name, o.total,
  (SELECT COUNT(*) FROM payments p WHERE p.order_id=o.id AND p.status='settled') sp,
  (SELECT COUNT(*) FROM refunds r WHERE r.order_id=o.id) rc
FROM orders o JOIN customers c ON c.id=o.customer_id
WHERE EXISTS (SELECT 1 FROM payments p WHERE p.order_id=o.id AND p.status='settled')
  AND EXISTS (SELECT 1 FROM refunds r WHERE r.order_id=o.id)
ORDER BY o.id`);
const F297 = (d1: string, d2: string, key: string, rk: string) => `
SELECT c.name, COUNT(${d1} p.id) AS settlements, COUNT(${d2} r.id) AS claims, ROUND(SUM(r.amount), 2) AS claimed
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON ${key} = o.id AND p.status = 'settled'
LEFT JOIN refunds r ON ${rk} = o.id
GROUP BY c.id
ORDER BY settlements DESC, claims DESC`;
q("297 FILL (DISTINCT, DISTINCT, p.order_id, r.order_id)", F297("DISTINCT", "DISTINCT", "p.order_id", "r.order_id"));
q("297 d1=ALL", F297("ALL", "DISTINCT", "p.order_id", "r.order_id"));
q("297 d2=ALL", F297("DISTINCT", "ALL", "p.order_id", "r.order_id"));
q("297 key=p.id", F297("DISTINCT", "DISTINCT", "p.id", "r.order_id"));
q("297 rk=r.id", F297("DISTINCT", "DISTINCT", "p.order_id", "r.id"));
q("297 key=o.id (self-compare)", F297("DISTINCT", "DISTINCT", "o.id", "r.order_id"));
q("297 top Alice rows detail", `
SELECT c.name, COUNT(DISTINCT p.id) s, COUNT(p.id) s_all, COUNT(DISTINCT r.id) cl, COUNT(r.id) cl_all
FROM customers c LEFT JOIN orders o ON o.customer_id=c.id
LEFT JOIN payments p ON p.order_id=o.id AND p.status='settled'
LEFT JOIN refunds r ON r.order_id=o.id
WHERE c.name IN ('Alice Chen','Bruno Silva') GROUP BY c.id`);

// ============ cs-299 growth: demand per acquisition channel ============
const F299 = (k1: string, k2: string, k3: string, grp: string) => `
SELECT a.channel, COUNT(DISTINCT o.id) AS tickets, COUNT(oi.id) AS lines
FROM acquisitions a
JOIN customers c ON ${k1} = c.id
JOIN orders o ON ${k2} = c.id
JOIN order_items oi ON ${k3} = o.id
GROUP BY ${grp}
ORDER BY tickets DESC`;
q("299 FILL (a.customer_id, o.customer_id, oi.order_id, a.channel)", F299("a.customer_id", "o.customer_id", "oi.order_id", "a.channel"));
q("299 k1=a.id", F299("a.id", "o.customer_id", "oi.order_id", "a.channel"));
q("299 k2=o.id", F299("a.customer_id", "o.id", "oi.order_id", "a.channel"));
q("299 k2=a.id", F299("a.customer_id", "a.id", "oi.order_id", "a.channel"));
q("299 k3=oi.id", F299("a.customer_id", "o.customer_id", "oi.id", "a.channel"));
q("299 k3=oi.product_id", F299("a.customer_id", "o.customer_id", "oi.product_id", "a.channel"));
q("299 grp=c.region", F299("a.customer_id", "o.customer_id", "oi.order_id", "c.region"));
q("299 grp=c.name", F299("a.customer_id", "o.customer_id", "oi.order_id", "c.name"));
q("299 context: cross-group totals", `
SELECT COUNT(DISTINCT o.id) real_tickets, (SELECT COUNT(*) FROM order_items) real_lines FROM acquisitions a JOIN customers c ON a.customer_id=c.id JOIN orders o ON o.customer_id=c.id`);
q("299 context: Alice orders/lines share", `
SELECT (SELECT COUNT(*) FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.name='Alice Chen') a_orders,
       (SELECT COUNT(*) FROM order_items oi JOIN orders o ON o.id=oi.order_id JOIN customers c ON c.id=o.customer_id WHERE c.name='Alice Chen') a_lines`);

// ============ cs-300 pricing: charged vs list per region (delivered) ============
const F300 = (sum: string, k: string, st: string, grp: string) => `
SELECT c.region, ROUND(SUM(${sum} * oi.quantity), 2) AS charged, ROUND(SUM(p.price * oi.quantity), 2) AS list_value
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
JOIN products p ON ${k} = oi.product_id
WHERE o.status = ${st}
GROUP BY ${grp}
ORDER BY charged DESC`;
q("300 FILL (oi.unit_price, p.id, 'delivered', c.region)", F300("oi.unit_price", "p.id", "'delivered'", "c.region"));
q("300 sum=p.price", F300("p.price", "p.id", "'delivered'", "c.region"));
q("300 sum=o.total", F300("o.total", "p.id", "'delivered'", "c.region"));
q("300 k=oi.id", F300("oi.unit_price", "oi.id", "'delivered'", "c.region"));
q("300 k=o.id", F300("oi.unit_price", "o.id", "'delivered'", "c.region"));
q("300 k=c.id", F300("oi.unit_price", "c.id", "'delivered'", "c.region"));
q("300 st='shipped'", F300("oi.unit_price", "p.id", "'shipped'", "c.region"));
q("300 st='cancelled'", F300("oi.unit_price", "p.id", "'cancelled'", "c.region"));
q("300 grp=p.category", F300("oi.unit_price", "p.id", "'delivered'", "p.category"));
q("300 grp=c.city", F300("oi.unit_price", "p.id", "'delivered'", "c.city"));

// ============ leftover distractor checks ============
q("293 k2=r.order_id", `
SELECT c.region, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS claimed
FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON r.order_id = o.customer_id
GROUP BY c.region ORDER BY claimed DESC`);
q("298 {1}=c.name", `
SELECT c.name, o.total, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM orders o JOIN customers c ON c.name = o.customer_id JOIN refunds r ON r.order_id = o.id
GROUP BY o.id HAVING COUNT(r.id) >= 2 ORDER BY refunded DESC`);
q("298 {1}=o.id", `
SELECT c.name, o.total, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM orders o JOIN customers c ON o.id = o.customer_id JOIN refunds r ON r.order_id = o.id
GROUP BY o.id HAVING COUNT(r.id) >= 2 ORDER BY refunded DESC`);
q("295 {2}=s.id", `
SELECT s.name, COUNT(oi.id) AS lines
FROM suppliers s
JOIN products p ON s.id = p.supplier_id
JOIN order_items oi ON s.id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN shipments sh ON sh.order_id = o.id
WHERE p.category = 'Audio' GROUP BY s.name ORDER BY lines DESC`);
q("295 {3}=oi.id", `
SELECT s.name, COUNT(oi.id) AS lines
FROM suppliers s
JOIN products p ON s.id = p.supplier_id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN shipments sh ON oi.id = o.id
WHERE p.category = 'Audio' GROUP BY s.name ORDER BY lines DESC`);
q("295 cat='Video'", `
SELECT s.name, COUNT(oi.id) AS lines
FROM suppliers s
JOIN products p ON s.id = p.supplier_id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN shipments sh ON sh.order_id = o.id
WHERE p.category = 'Video' GROUP BY s.name ORDER BY lines DESC`);
q("292 status='refunded'? (nonsense value check)", `
SELECT a.channel, COUNT(p.id) AS settlements, ROUND(SUM(p.amount), 2) AS settled
FROM payments p JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id
JOIN acquisitions a ON a.customer_id=c.id
WHERE p.status='refunded' GROUP BY a.channel`);

db.close();
console.log("\nDONE probe-j8c3");
