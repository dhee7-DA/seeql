import { Database } from "bun:sqlite";
const db = new Database("/home/z/my-project/db/custom.db", { readonly: true });
const q = (s: string) => { try { return db.query(s).all(); } catch (e) { return "ERR: " + (e as Error).message; } };
const show = (label: string, sql: string) => { console.log("### " + label); console.log(JSON.stringify(q(sql))); console.log(); };

// ---- figure probes ----
show("per-account delivered counts (asc)", `SELECT c.id, c.name, COUNT(o.id) FILTER (WHERE o.status='delivered') AS delivered FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY delivered ASC LIMIT 8`);
show("per-account shipped counts (asc)", `SELECT c.id, c.name, COUNT(o.id) FILTER (WHERE o.status='shipped') AS shipped FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY shipped ASC LIMIT 6`);
show("per-product line counts (asc)", `SELECT p.id, p.name, COUNT(oi.id) AS lines, SUM(oi.quantity) AS units, ROUND(COALESCE(SUM(oi.unit_price*oi.quantity),0),2) AS revenue FROM products p LEFT JOIN order_items oi ON oi.product_id=p.id GROUP BY p.id ORDER BY lines ASC LIMIT 6`);
show("category census (temu x2)", `SELECT p.category, COUNT(DISTINCT o.id) FILTER (WHERE o.status='delivered') AS landed_carts, COUNT(*) AS lines, SUM(oi.quantity) AS units, ROUND(SUM(oi.unit_price*oi.quantity),2) AS revenue FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN orders o ON o.id=oi.order_id GROUP BY p.category ORDER BY revenue DESC`);
show("months avg basket > platform mean", `SELECT m.month, m.checkouts, ROUND(m.revenue/m.checkouts,2) AS avg_basket FROM (SELECT STRFTIME('%Y-%m',created_at) AS month, COUNT(*) AS checkouts, SUM(total) AS revenue FROM orders GROUP BY month) AS m WHERE m.revenue/m.checkouts > (SELECT AVG(total) FROM orders) ORDER BY avg_basket DESC`);
show("flash months >=9", `SELECT STRFTIME('%Y-%m',created_at) AS month, COUNT(*) AS checkouts, ROUND(SUM(total),2) AS revenue FROM orders GROUP BY month HAVING COUNT(*) >= 9 ORDER BY revenue DESC`);
show("gett unpaid per region", `SELECT c.region, COUNT(*) AS unpaid_bills, ROUND(SUM(i.amount_cents)/100.0,2) AS exposure FROM invoices i JOIN customers c ON c.id=i.customer_id LEFT JOIN payments p ON p.invoice_id=i.id WHERE p.id IS NULL GROUP BY c.region ORDER BY exposure DESC`);
show("gett settlement clock", `SELECT COUNT(*) AS settled_bills, ROUND(AVG(days_to_pay),1) AS avg_days, MIN(days_to_pay) AS fastest, MAX(days_to_pay) AS slowest FROM (SELECT i.id, JULIANDAY(MIN(p.paid_on))-JULIANDAY(i.issued_on) AS days_to_pay FROM invoices i JOIN payments p ON p.invoice_id=i.id WHERE i.status='paid' GROUP BY i.id)`);
show("gett rails census", `SELECT COUNT(*) AS legs, COUNT(*) FILTER (WHERE method='card') AS card_legs, ROUND(SUM(amount_cents) FILTER (WHERE method='card')/100.0,2) AS card_total, ROUND(SUM(amount_cents)/100.0,2) AS total_money FROM payments`);
show("gett rank board", `WITH folded AS (SELECT c.name AS account, COUNT(*) AS rides, ROUND(SUM(o.total),2) AS billed FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.name) SELECT RANK() OVER (ORDER BY rides DESC) AS rung, account, rides, billed FROM folded ORDER BY rides DESC, rung LIMIT 8`);
show("month avg baskets top", `SELECT STRFTIME('%Y-%m',created_at) AS month, COUNT(*) AS checkouts, ROUND(AVG(total),2) AS avg_basket FROM orders GROUP BY month ORDER BY avg_basket DESC LIMIT 6`);

db.close();
