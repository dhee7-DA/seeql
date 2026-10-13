// Task 95 probe — read-only verification of the 4 new discord case designs.
import { Database } from "bun:sqlite";
import { rmSync } from "node:fs";

const COPY = "scripts/.probe95.db";
rmSync(COPY, { force: true });
import { copyFileSync } from "node:fs";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function run(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`\n=== ${label} (${rows.length} rows)`);
    for (const r of rows.slice(0, 40)) console.log(JSON.stringify(r));
  } catch (e) {
    console.log(`\n=== ${label} ERROR: ${e instanceof Error ? e.message : e}`);
  }
}

// ---- cs-discord-3: t7 monthly engagement walk ----
run("monthly raw", `SELECT STRFTIME('%Y-%m', o.created_at) AS month, ROUND(SUM(o.total), 2) AS engagement FROM orders o GROUP BY STRFTIME('%Y-%m', o.created_at) ORDER BY month`);
run("monthly walk LAG", `SELECT w.month, w.engagement, w.mom_delta FROM (SELECT m.month, m.engagement, ROUND(m.engagement - LAG(m.engagement) OVER (ORDER BY m.month), 2) AS mom_delta FROM (SELECT STRFTIME('%Y-%m', o.created_at) AS month, ROUND(SUM(o.total), 2) AS engagement FROM orders o GROUP BY STRFTIME('%Y-%m', o.created_at)) m) w ORDER BY w.mom_delta ASC`);
run("walk gated -853.57", `SELECT w.month, w.engagement, w.mom_delta FROM (SELECT m.month, m.engagement, ROUND(m.engagement - LAG(m.engagement) OVER (ORDER BY m.month), 2) AS mom_delta FROM (SELECT STRFTIME('%Y-%m', o.created_at) AS month, ROUND(SUM(o.total), 2) AS engagement FROM orders o GROUP BY STRFTIME('%Y-%m', o.created_at)) m) w WHERE w.mom_delta <= -853.57 ORDER BY w.mom_delta ASC`);
for (const g of [-800, -1000, 0, -1158.21]) {
  run(`walk gated ${g}`, `SELECT w.month, w.engagement, w.mom_delta FROM (SELECT m.month, m.engagement, ROUND(m.engagement - LAG(m.engagement) OVER (ORDER BY m.month), 2) AS mom_delta FROM (SELECT STRFTIME('%Y-%m', o.created_at) AS month, ROUND(SUM(o.total), 2) AS engagement FROM orders o GROUP BY STRFTIME('%Y-%m', o.created_at)) m) w WHERE w.mom_delta <= ${g} ORDER BY w.mom_delta ASC`);
}
run("walk LEAD variant", `SELECT w.month, w.engagement, w.mom_delta FROM (SELECT m.month, m.engagement, ROUND(m.engagement - LEAD(m.engagement) OVER (ORDER BY m.month), 2) AS mom_delta FROM (SELECT STRFTIME('%Y-%m', o.created_at) AS month, ROUND(SUM(o.total), 2) AS engagement FROM orders o GROUP BY STRFTIME('%Y-%m', o.created_at)) m) w WHERE w.mom_delta <= -853.57 ORDER BY w.mom_delta ASC`);
run("walk SUM-over variant", `SELECT w.month, w.engagement, w.mom_delta FROM (SELECT m.month, m.engagement, ROUND(m.engagement - SUM(m.engagement) OVER (ORDER BY m.month), 2) AS mom_delta FROM (SELECT STRFTIME('%Y-%m', o.created_at) AS month, ROUND(SUM(o.total), 2) AS engagement FROM orders o GROUP BY STRFTIME('%Y-%m', o.created_at)) m) w WHERE w.mom_delta <= -853.57 ORDER BY w.mom_delta ASC`);
run("walk COUNT-over variant", `SELECT w.month, w.engagement, w.mom_delta FROM (SELECT m.month, m.engagement, ROUND(m.engagement - COUNT(m.engagement) OVER (ORDER BY m.month), 2) AS mom_delta FROM (SELECT STRFTIME('%Y-%m', o.created_at) AS month, ROUND(SUM(o.total), 2) AS engagement FROM orders o GROUP BY STRFTIME('%Y-%m', o.created_at)) m) w WHERE w.mom_delta <= -853.57 ORDER BY w.mom_delta ASC`);
run("walk month-format break '%m'", `SELECT w.month, w.engagement, w.mom_delta FROM (SELECT m.month, m.engagement, ROUND(m.engagement - LAG(m.engagement) OVER (ORDER BY m.month), 2) AS mom_delta FROM (SELECT STRFTIME('%m', o.created_at) AS month, ROUND(SUM(o.total), 2) AS engagement FROM orders o GROUP BY STRFTIME('%m', o.created_at)) m) w WHERE w.mom_delta <= -853.57 ORDER BY w.mom_delta ASC`);

// ---- cs-discord-4: j7 bot-partner board ----
run("partner board full", `SELECT s.name AS partner, s.rating, COUNT(DISTINCT o.customer_id) AS members, SUM(oi.quantity) AS events, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS engagement FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id GROUP BY s.id ORDER BY engagement DESC`);
run("partner board gated 4765.63", `SELECT s.name AS partner, s.rating, COUNT(DISTINCT o.customer_id) AS members, SUM(oi.quantity) AS events, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS engagement FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id GROUP BY s.id HAVING ROUND(SUM(oi.quantity * oi.unit_price), 2) >= 4765.63 ORDER BY engagement DESC`);
for (const g of [3613.25, 9294.93, 11130.25, 5000, 3049.07]) {
  run(`partner gated ${g}`, `SELECT s.name AS partner, s.rating, COUNT(DISTINCT o.customer_id) AS members, SUM(oi.quantity) AS events, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS engagement FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id GROUP BY s.id HAVING ROUND(SUM(oi.quantity * oi.unit_price), 2) >= ${g} ORDER BY engagement DESC`);
}
run("partner wrong join o.customer_id", `SELECT s.name AS partner, s.rating, COUNT(DISTINCT o.customer_id) AS members, SUM(oi.quantity) AS events, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS engagement FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = o.customer_id GROUP BY s.id ORDER BY engagement DESC`);
run("partner wrong join s.id", `SELECT s.name AS partner, s.rating, COUNT(DISTINCT o.customer_id) AS members, SUM(oi.quantity) AS events, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS engagement FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = s.id GROUP BY s.id ORDER BY engagement DESC`);

// ---- cs-discord-5: s6 SKU tier census ----
run("tier census edge 100", `SELECT CASE WHEN p.price >= 100 THEN 'flagship' WHEN p.price >= 50 THEN 'core' ELSE 'perk' END AS tier, COUNT(DISTINCT p.id) AS skus, SUM(oi.quantity) AS events FROM products p JOIN order_items oi ON oi.product_id = p.id GROUP BY tier ORDER BY events DESC`);
for (const g of [150, 200]) {
  run(`tier census edge ${g}`, `SELECT CASE WHEN p.price >= ${g} THEN 'flagship' WHEN p.price >= 50 THEN 'core' ELSE 'perk' END AS tier, COUNT(DISTINCT p.id) AS skus, SUM(oi.quantity) AS events FROM products p JOIN order_items oi ON oi.product_id = p.id GROUP BY tier ORDER BY events DESC`);
}
for (const f of [130, 100, 131, 269, 65]) {
  run(`tier floor ${f}`, `SELECT CASE WHEN p.price >= 100 THEN 'flagship' WHEN p.price >= 50 THEN 'core' ELSE 'perk' END AS tier, COUNT(DISTINCT p.id) AS skus, SUM(oi.quantity) AS events FROM products p JOIN order_items oi ON oi.product_id = p.id GROUP BY tier HAVING SUM(oi.quantity) >= ${f} ORDER BY events DESC`);
}
run("tier ELSE 'core' collision", `SELECT CASE WHEN p.price >= 100 THEN 'flagship' WHEN p.price >= 50 THEN 'core' ELSE 'core' END AS tier, COUNT(DISTINCT p.id) AS skus, SUM(oi.quantity) AS events FROM products p JOIN order_items oi ON oi.product_id = p.id GROUP BY tier ORDER BY events DESC`);
run("tier ELSE 'flagship' collision", `SELECT CASE WHEN p.price >= 100 THEN 'flagship' WHEN p.price >= 50 THEN 'core' ELSE 'flagship' END AS tier, COUNT(DISTINCT p.id) AS skus, SUM(oi.quantity) AS events FROM products p JOIN order_items oi ON oi.product_id = p.id GROUP BY tier ORDER BY events DESC`);
run("tier wrong join p.supplier_id", `SELECT CASE WHEN p.price >= 100 THEN 'flagship' WHEN p.price >= 50 THEN 'core' ELSE 'perk' END AS tier, COUNT(DISTINCT p.id) AS skus, SUM(oi.quantity) AS events FROM products p JOIN order_items oi ON oi.product_id = p.supplier_id GROUP BY tier ORDER BY events DESC`);

// ---- cs-discord-6: q2 billing outlier screen ----
run("invoice avg cents", `SELECT ROUND(AVG(amount_cents) / 100.0, 2) AS book_avg_usd, COUNT(*) AS n FROM invoices`);
run("outliers above avg", `SELECT i.id AS invoice, i.status, ROUND(i.amount_cents / 100.0, 2) AS billed_usd, COUNT(*) OVER () AS qualifiers, (SELECT ROUND(AVG(amount_cents) / 100.0, 2) FROM invoices) AS book_avg_usd FROM invoices i WHERE i.amount_cents / 100.0 > 31.06 ORDER BY billed_usd DESC`);
for (const b of [30, 35, 61.48, 8.73, 869.77, 28, 31.05]) {
  run(`outliers bar ${b}`, `SELECT i.id AS invoice, i.status, ROUND(i.amount_cents / 100.0, 2) AS billed_usd, COUNT(*) OVER () AS qualifiers, (SELECT ROUND(AVG(amount_cents) / 100.0, 2) FROM invoices) AS book_avg_usd FROM invoices i WHERE i.amount_cents / 100.0 > ${b} ORDER BY billed_usd DESC`);
}
run("invoice amount census", `SELECT MIN(amount_cents), MAX(amount_cents), SUM(amount_cents) FROM invoices`);

// ---- extras for metrics/theory/mcqs ----
run("order_items unit_price vs product price", `SELECT COUNT(*) AS n, SUM(CASE WHEN ROUND(oi.unit_price,2) = ROUND(p.price,2) THEN 1 ELSE 0 END) AS match FROM order_items oi JOIN products p ON p.id = oi.product_id`);
run("total events", `SELECT SUM(quantity) FROM order_items`);
run("voice-completed share math", `SELECT 100.0*52/103`);
run("member sessions census", `SELECT customer_id, COUNT(*) AS sessions FROM orders GROUP BY customer_id ORDER BY sessions DESC`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done");
