// READ-ONLY probe for twitter 3x expansion — deleted after use.
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";
copyFileSync("db/custom.db", "/tmp/probe-twt.db");
const db = new Database("/tmp/probe-twt.db", { readonly: true });
const q = (s: string) => { try { return db.query(s).all(); } catch (e) { return "ERR: " + (e as Error).message; } };
const p = (t: string, s: string) => console.log("\n== " + t + " ==\n" + JSON.stringify(q(s), null, 1));

// ---- A. j7 partner (supplier) revenue board ----
p("A1 full board", `SELECT s.name, s.rating, COUNT(DISTINCT p.id) AS listings, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS partner_revenue FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id GROUP BY s.name ORDER BY partner_revenue DESC`);
p("A2 LIMIT 2", `SELECT s.name, s.rating, COUNT(DISTINCT p.id) AS listings, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS partner_revenue FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id GROUP BY s.name ORDER BY partner_revenue DESC LIMIT 2`);
p("A3 LIMIT 4", `SELECT s.name, s.rating, COUNT(DISTINCT p.id) AS listings, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS partner_revenue FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id GROUP BY s.name ORDER BY partner_revenue DESC LIMIT 4`);
p("A4 COUNT(ALL p.id)", `SELECT s.name, COUNT(ALL p.id) AS listings FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id GROUP BY s.name ORDER BY listings DESC`);
p("A5 SUM(oi.unit_price) Nordic", `SELECT ROUND(SUM(oi.unit_price),2) FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id WHERE s.name='Nordic Gadgets AB'`);
p("A6 SUM(qty*p.price) Nordic", `SELECT ROUND(SUM(oi.quantity * p.price),2) FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id WHERE s.name='Nordic Gadgets AB'`);
p("A7 join on p.id (loop-back)", `SELECT COUNT(*) FROM suppliers s JOIN products p ON p.supplier_id = p.id JOIN order_items oi ON oi.product_id = p.id`);
p("A8 join on s.rating", `SELECT COUNT(*) FROM suppliers s JOIN products p ON p.supplier_id = s.rating JOIN order_items oi ON oi.product_id = p.id`);
p("A9 join on =2", `SELECT COUNT(*) FROM suppliers s JOIN products p ON p.supplier_id = 2 JOIN order_items oi ON oi.product_id = p.id`);
p("A10 join on =4", `SELECT COUNT(*) FROM suppliers s JOIN products p ON p.supplier_id = 4 JOIN order_items oi ON oi.product_id = p.id`);

// ---- B. t4 month calendar ----
p("B1 full months", `SELECT STRFTIME('%Y-%m', o.created_at) AS month, COUNT(*) AS tweets, ROUND(SUM(o.total), 2) AS impressions, SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS withdrawn FROM orders o GROUP BY month ORDER BY month ASC`);
p("B2 gate 9", `SELECT STRFTIME('%Y-%m', o.created_at) AS month, COUNT(*) AS tweets, ROUND(SUM(o.total), 2) AS impressions, SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS withdrawn FROM orders o GROUP BY month HAVING COUNT(*) >= 9 ORDER BY month ASC`);
p("B3 gate 7", `SELECT STRFTIME('%Y-%m', o.created_at) AS month, COUNT(*) AS tweets, ROUND(SUM(o.total), 2) AS impressions, SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS withdrawn FROM orders o GROUP BY month HAVING COUNT(*) >= 7 ORDER BY month ASC`);
p("B4 %m variant", `SELECT STRFTIME('%m', o.created_at) AS month, COUNT(*) FROM orders o GROUP BY month ORDER BY month ASC`);
p("B5 %Y variant", `SELECT STRFTIME('%Y', o.created_at) AS month, COUNT(*) FROM orders o GROUP BY month ORDER BY month ASC`);
p("B6 gate >= 'void' text", `SELECT STRFTIME('%Y-%m', o.created_at) AS month, COUNT(*) AS tweets FROM orders o GROUP BY month HAVING COUNT(*) >= 'void'`);
p("B7 DESC order", `SELECT STRFTIME('%Y-%m', o.created_at) AS month, COUNT(*) FROM orders o GROUP BY month ORDER BY month DESC LIMIT 3`);

// ---- C. s7 lifecycle x cohort pivot ----
p("C1 full pivot", `SELECT c.region, SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS timeline_delivered, SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS cascading, SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS queued, SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS withdrawn, COUNT(*) AS total_tweets FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region HAVING COUNT(*) >= 19 ORDER BY withdrawn DESC, timeline_delivered DESC`);
p("C2 gate 20", `SELECT c.region, COUNT(*) AS total_tweets FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region HAVING COUNT(*) >= 20 ORDER BY total_tweets DESC`);
p("C3 gate 18", `SELECT c.region, COUNT(*) AS total_tweets FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region HAVING COUNT(*) >= 18 ORDER BY total_tweets DESC`);
p("C4 void arm", `SELECT c.region, SUM(CASE WHEN o.status = 'void' THEN 1 ELSE 0 END) AS x FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region`);
p("C5 pending-as-withdrawn arm", `SELECT c.region, SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS w FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY w DESC`);
p("C6 ASC order", `SELECT c.region, SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS withdrawn, COUNT(*) AS total_tweets FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region HAVING COUNT(*) >= 19 ORDER BY withdrawn ASC, total_tweets DESC`);
p("C7 gate text", `SELECT c.region, COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region HAVING COUNT(*) >= 'pending'`);

// ---- D. x3 ads billing stack ----
p("D1 full stack DESC", `SELECT status, COUNT(*) AS campaigns, ROUND(SUM(amount_cents) / 100.0, 2) AS billed_usd FROM invoices GROUP BY status UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2) FROM invoices ORDER BY billed_usd DESC`);
p("D2 integer /100", `SELECT status, COUNT(*) AS campaigns, ROUND(SUM(amount_cents) / 100, 2) AS billed_usd FROM invoices GROUP BY status UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(amount_cents) / 100, 2) FROM invoices ORDER BY billed_usd DESC`);
p("D3 GRAND TOTAL label", `SELECT status, COUNT(*) AS campaigns FROM invoices GROUP BY status UNION ALL SELECT 'GRAND TOTAL', COUNT(*) FROM invoices`);
p("D4 bare TOTAL column?", `SELECT TOTAL FROM invoices LIMIT 1`);
p("D5 AVG in total arm", `SELECT 'TOTAL', COUNT(*), ROUND(AVG(amount_cents) / 100.0, 2) FROM invoices`);
p("D6 COUNT in total arm", `SELECT 'TOTAL', COUNT(*), ROUND(COUNT(amount_cents) / 100.0, 2) FROM invoices`);
p("D7 MAX in total arm", `SELECT 'TOTAL', COUNT(*), ROUND(MAX(amount_cents) / 100.0, 2) FROM invoices`);
p("D8 max amount_cents", `SELECT MAX(amount_cents) FROM invoices`);
p("D9 group by amount_cents count", `SELECT COUNT(*) FROM (SELECT amount_cents FROM invoices GROUP BY amount_cents)`);
p("D10 bare col in total arm", `SELECT 'TOTAL', COUNT(*), ROUND(amount_cents / 100.0, 2) FROM invoices LIMIT 2`);
p("D11 ASC stack", `SELECT status, COUNT(*) AS campaigns, ROUND(SUM(amount_cents) / 100.0, 2) AS billed_usd FROM invoices GROUP BY status UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2) FROM invoices ORDER BY billed_usd ASC`);
p("D12 group by AVG", `SELECT COUNT(*) FROM (SELECT AVG(amount_cents) a FROM invoices GROUP BY amount_cents)`);
p("D13 AVG by status", `SELECT status, ROUND(AVG(amount_cents)/100.0,2) FROM invoices GROUP BY status`);

// ---- E. extra mcq figures ----
p("E1 above-bar count", `SELECT COUNT(*) FROM orders WHERE total > (SELECT AVG(total) FROM orders)`);
p("E2 status census", `SELECT status, COUNT(*) FROM orders GROUP BY status`);
p("E3 pending+cancelled unstamped", `SELECT COUNT(*) FROM orders WHERE shipped_at IS NULL`);
p("E4 cohort orders", `SELECT c.region, COUNT(*) n FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY n DESC`);
p("E5 fan-out per cohort", `SELECT c.region, COUNT(*) ev, COUNT(DISTINCT o.id) tw, ROUND(COUNT(*)*1.0/COUNT(DISTINCT o.id),2) ratio FROM order_items e JOIN orders o ON o.id=e.order_id JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY ev DESC`);
db.close();
