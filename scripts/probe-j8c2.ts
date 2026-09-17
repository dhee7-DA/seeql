// probe-j8c2.ts — j4 fill/distractor batteries per candidate case (readonly copy).
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

// ============ cs-292 cash: settled board per acquisition channel ============
const F292 = (sum: string, key: string, st: string, grp: string) => `
SELECT a.channel, COUNT(p.id) AS settlements, ROUND(SUM(${sum}), 2) AS settled
FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id
JOIN acquisitions a ON ${key} = c.id
WHERE p.status = ${st}
GROUP BY ${grp}
ORDER BY settled DESC`;
q("292 FILL (p.amount, a.customer_id, 'settled', a.channel)", F292("p.amount", "a.customer_id", "'settled'", "a.channel"));
q("292 sum=o.total", F292("o.total", "a.customer_id", "'settled'", "a.channel"));
q("292 sum=a.spend", F292("a.spend", "a.customer_id", "'settled'", "a.channel"));
q("292 sum=p.id", F292("p.id", "a.customer_id", "'settled'", "a.channel"));
q("292 key=a.id", F292("p.amount", "a.id", "'settled'", "a.channel"));
q("292 key=o.id", F292("p.amount", "o.id", "'settled'", "a.channel"));
q("292 key=p.id", F292("p.amount", "p.id", "'settled'", "a.channel"));
q("292 status='pending'", F292("p.amount", "a.customer_id", "'pending'", "a.channel"));
q("292 status='failed'", F292("p.amount", "a.customer_id", "'failed'", "a.channel"));
q("292 grp=c.region", F292("p.amount", "a.customer_id", "'settled'", "c.region"));
q("292 grp=c.name", F292("p.amount", "a.customer_id", "'settled'", "c.name"));
q("292 context: Noah+Pedro settled", `SELECT c.name, COUNT(*) n, ROUND(SUM(p.amount),2) amt FROM payments p JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id WHERE p.status='settled' AND c.name IN ('Noah Meyer','Pedro Alvarez') GROUP BY c.name`);
q("292 context: distinct settled via chain", `SELECT COUNT(DISTINCT p.id) n, ROUND(SUM(p.amount),2) amt FROM payments p JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id JOIN acquisitions a ON a.customer_id=c.id WHERE p.status='settled'`);
q("292 context: channel honest spend", `SELECT channel, COUNT(*) touches, ROUND(SUM(spend),2) spend FROM acquisitions GROUP BY channel ORDER BY channel`);

// ============ cs-293 receivables: claimed per region ============
const F293 = (sum: string, k1: string, k2: string) => `
SELECT c.region, COUNT(r.id) AS claims, ROUND(SUM(${sum}), 2) AS claimed
FROM refunds r
JOIN orders o ON ${k1} = r.order_id
JOIN customers c ON ${k2} = o.customer_id
GROUP BY c.region
ORDER BY claimed DESC`;
q("293 FILL (r.amount, o.id, c.id)", F293("r.amount", "o.id", "c.id"));
q("293 sum=o.total", F293("o.total", "o.id", "c.id"));
q("293 sum=r.id", F293("r.id", "o.id", "c.id"));
q("293 k1=r.id", F293("r.amount", "r.id", "c.id"));
q("293 k1=c.id", F293("r.amount", "c.id", "c.id"));
q("293 k2=o.id", F293("r.amount", "o.id", "o.id"));
q("293 k2=r.id", F293("r.amount", "o.id", "r.id"));
q("293 k2=p.id (unbound? p not in query — expect error)", F293("r.amount", "o.id", "p.id"));

// ============ cs-298 fraud: double-refunded tickets ============
const F298 = (key: string, grp: string, thr: string) => `
SELECT c.name, o.total, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN refunds r ON ${key} = o.id
GROUP BY ${grp}
HAVING COUNT(r.id) >= ${thr}
ORDER BY refunded DESC`;
q("298 FILL (r.order_id, o.id, 2)", F298("r.order_id", "o.id", "2"));
q("298 key=r.id", F298("r.id", "o.id", "2"));
q("298 key=o.customer_id", F298("o.customer_id", "o.id", "2"));
q("298 grp=c.name", F298("r.order_id", "c.name", "2"));
q("298 grp=c.region", F298("r.order_id", "c.region", "2"));
q("298 thr=1", F298("r.order_id", "o.id", "1"));
q("298 thr=3", F298("r.order_id", "o.id", "3"));
q("298 context: statuses of never-dispatched", `SELECT status, COUNT(*) n FROM orders WHERE id NOT IN (SELECT order_id FROM shipments) GROUP BY status`);
q("298 context: no-payment orders statuses", `SELECT status, COUNT(*) n FROM orders WHERE id NOT IN (SELECT order_id FROM payments) GROUP BY status`);

// ============ cs-294 expense: buyer-region spend on EU-made goods ============
const F294 = (sum: string, arm: string, grp: string, k3: string) => `
SELECT c.region, ROUND(SUM(${sum}), 2) AS spend
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON ${k3} = p.supplier_id
WHERE s.region = ${arm}
GROUP BY ${grp}
ORDER BY spend DESC`;
q("294 FILL (oi.unit_price*oi.quantity, 'EU', c.region, s.id)", F294("oi.unit_price * oi.quantity", "'EU'", "c.region", "s.id"));
q("294 sum=p.price*oi.quantity", F294("p.price * oi.quantity", "'EU'", "c.region", "s.id"));
q("294 sum=o.total*oi.quantity", F294("o.total * oi.quantity", "'EU'", "c.region", "s.id"));
q("294 sum=oi.unit_price", F294("oi.unit_price", "'EU'", "c.region", "s.id"));
q("294 arm='APAC'", F294("oi.unit_price * oi.quantity", "'APAC'", "c.region", "s.id"));
q("294 arm='US'", F294("oi.unit_price * oi.quantity", "'US'", "c.region", "s.id"));
q("294 arm='LATAM'", F294("oi.unit_price * oi.quantity", "'LATAM'", "c.region", "s.id"));
q("294 grp=p.category", F294("oi.unit_price * oi.quantity", "'EU'", "p.category", "s.id"));
q("294 grp=s.region", F294("oi.unit_price * oi.quantity", "'EU'", "s.region", "s.id"));
q("294 grp=c.city", F294("oi.unit_price * oi.quantity", "'EU'", "c.city", "s.id"));
q("294 k3=p.id", F294("oi.unit_price * oi.quantity", "'EU'", "c.region", "p.id"));
q("294 k3=oi.id", F294("oi.unit_price * oi.quantity", "'EU'", "c.region", "oi.id"));
q("294 k3=o.id", F294("oi.unit_price * oi.quantity", "'EU'", "c.region", "o.id"));
q("294 all-status per region (no arm) context", `
SELECT c.region, ROUND(SUM(oi.unit_price*oi.quantity),2) charged, ROUND(SUM(p.price*oi.quantity),2) listv
FROM order_items oi JOIN orders o ON o.id=oi.order_id JOIN customers c ON c.id=o.customer_id JOIN products p ON p.id=oi.product_id
GROUP BY c.region ORDER BY charged DESC`);

// ============ cs-295 logistics: Audio lines per maker (dimension-first 5-table) ============
const F295 = (k1: string, k2: string, k3: string, cat: string) => `
SELECT s.name, COUNT(oi.id) AS lines
FROM suppliers s
JOIN products p ON ${k1} = p.supplier_id
JOIN order_items oi ON ${k2} = p.id
JOIN orders o ON o.id = oi.order_id
JOIN shipments sh ON ${k3} = o.id
WHERE p.category = ${cat}
GROUP BY s.name
ORDER BY lines DESC`;
q("295 FILL (s.id, oi.product_id, sh.order_id, 'Audio')", F295("s.id", "oi.product_id", "sh.order_id", "'Audio'"));
q("295 k1=p.id", F295("p.id", "oi.product_id", "sh.order_id", "'Audio'"));
q("295 k2=oi.id", F295("s.id", "oi.id", "sh.order_id", "'Audio'"));
q("295 k3=sh.id", F295("s.id", "oi.product_id", "sh.id", "'Audio'"));
q("295 cat='Electronics'", F295("s.id", "oi.product_id", "sh.order_id", "'Electronics'"));
q("295 cat='Accessories'", F295("s.id", "oi.product_id", "sh.order_id", "'Accessories'"));
q("295 cat='Wearables'", F295("s.id", "oi.product_id", "sh.order_id", "'Wearables'"));
q("295 cat='Apparel'", F295("s.id", "oi.product_id", "sh.order_id", "'Apparel'"));
q("295 cat='Fitness'", F295("s.id", "oi.product_id", "sh.order_id", "'Fitness'"));
q("295 categories list", `SELECT category, COUNT(*) products FROM products GROUP BY category`);
q("295 context: Audio lines ALL vs shipped", `
SELECT
 (SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE p.category='Audio') all_lines,
 (SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN orders o ON o.id=oi.order_id JOIN shipments sh ON sh.order_id=o.id WHERE p.category='Audio') shipped_lines,
 (SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN orders o ON o.id=oi.order_id WHERE p.category='Audio' AND o.status='cancelled') cancelled_lines`);

db.close();
console.log("\nDONE probe-j8c2");
