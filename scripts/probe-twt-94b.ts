import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";
copyFileSync("db/custom.db", "/tmp/probe-twt2.db");
const db = new Database("/tmp/probe-twt2.db", { readonly: true });
const q = (s: string) => { try { return JSON.stringify(db.query(s).all()); } catch (e) { return "ERR: " + (e as Error).message; } };
// t4: literal / number landing in ORDER slot {4}
console.log("t1", q(`SELECT STRFTIME('%Y-%m', o.created_at) AS month, COUNT(*) AS tweets FROM orders o GROUP BY month HAVING COUNT(*) >= 8 ORDER BY month 'void'`));
console.log("t2", q(`SELECT STRFTIME('%Y-%m', o.created_at) AS month, COUNT(*) AS tweets FROM orders o GROUP BY month HAVING COUNT(*) >= 8 ORDER BY month 9`));
// s7: literal / number in ORDER slot {4}
console.log("s1", q(`SELECT c.region, SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS withdrawn, COUNT(*) AS total_tweets FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region HAVING COUNT(*) >= 19 ORDER BY withdrawn 'pending', total_tweets DESC`));
console.log("s2", q(`SELECT c.region, SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS withdrawn, COUNT(*) AS total_tweets FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region HAVING COUNT(*) >= 19 ORDER BY withdrawn 20, total_tweets DESC`));
// s7: gate 2 admits LATAM?
console.log("s3", q(`SELECT c.region, COUNT(*) AS total_tweets FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region HAVING COUNT(*) >= 2`));
// j7: number in ORDER slot {3}
console.log("j1", q(`SELECT s.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS partner_revenue FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id GROUP BY s.name ORDER BY partner_revenue 2`));
// x3: aggregates / literals in ORDER slot {4}
console.log("x1", q(`SELECT status, COUNT(*) AS campaigns, ROUND(SUM(amount_cents) / 100.0, 2) AS billed_usd FROM invoices GROUP BY status UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2) FROM invoices ORDER BY billed_usd MAX(amount_cents)`));
console.log("x2", q(`SELECT status, COUNT(*) AS campaigns, ROUND(SUM(amount_cents) / 100.0, 2) AS billed_usd FROM invoices GROUP BY status UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2) FROM invoices ORDER BY billed_usd 'GRAND TOTAL'`));
console.log("x3", q(`SELECT status, COUNT(*) AS campaigns, ROUND(SUM(amount_cents) / 100.0, 2) AS billed_usd FROM invoices GROUP BY status UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2) FROM invoices ORDER BY billed_usd amount_cents`));
// x3: 'GRAND TOTAL' into label slot {2} only changes label?
console.log("x4", q(`SELECT status, COUNT(*) AS campaigns FROM invoices GROUP BY status UNION ALL SELECT 'GRAND TOTAL', COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2) FROM invoices`));
db.close();
