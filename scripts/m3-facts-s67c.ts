// Boundary + gap-fill facts for s6–s8 authoring (distractor safety + missing figures).
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.m3w67.db");
const db = new Database("scripts/.m3w67.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  try { console.log(`${label}: ${JSON.stringify(q(sql))}`); }
  catch (e) { console.log(`${label}: ERROR ${e instanceof Error ? e.message : e}`); }
};

// --- exact value lists for boundary safety ---
show("A supplier ratings", "SELECT id, name, region, rating FROM suppliers ORDER BY id");
show("A product prices", "SELECT id, name, category, price FROM products ORDER BY id");
show("A order total boundaries", "SELECT COUNT(*) AS eq500 FROM orders WHERE total = 500");
show("A order total eq100", "SELECT COUNT(*) AS n FROM orders WHERE total = 100");
show("A order total eq1000", "SELECT COUNT(*) AS n FROM orders WHERE total = 1000");
show("A order total eq400", "SELECT COUNT(*) AS n FROM orders WHERE total = 400");
show("A order min max total", "SELECT MIN(total) AS mn, MAX(total) AS mx FROM orders");
show("A product eq50/100/200", "SELECT SUM(CASE WHEN price = 50 THEN 1 ELSE 0 END) AS p50, SUM(CASE WHEN price = 100 THEN 1 ELSE 0 END) AS p100, SUM(CASE WHEN price = 200 THEN 1 ELSE 0 END) AS p200 FROM products");
show("A expense eq100000", "SELECT COUNT(*) AS n FROM expenses WHERE amount_cents = 100000");
show("A supplier eq45", "SELECT COUNT(*) AS n FROM suppliers WHERE rating = 4.5");

// --- s6/s7 gap fills ---
show("B orders >= 600 count", "SELECT COUNT(*) AS n FROM orders WHERE total >= 600");
show("B orders 500-600", "SELECT COUNT(*) AS n FROM orders WHERE total >= 500 AND total < 600");
show("B orders 400-500", "SELECT COUNT(*) AS n FROM orders WHERE total >= 400 AND total < 500");
show("B delivered+shipped money", "SELECT ROUND(SUM(total),2) AS m FROM orders WHERE status IN ('delivered','shipped')");
show("B not-cancelled money", "SELECT ROUND(SUM(total),2) AS m FROM orders WHERE status <> 'cancelled'");
show("B pending band split", "SELECT SUM(CASE WHEN total >= 400 THEN 1 ELSE 0 END) AS big_n, ROUND(SUM(CASE WHEN total >= 400 THEN total ELSE 0 END),2) AS big_money, SUM(CASE WHEN total < 400 THEN 1 ELSE 0 END) AS small_n, ROUND(SUM(CASE WHEN total < 400 THEN total ELSE 0 END),2) AS small_money, COUNT(*) AS all_n, ROUND(SUM(total),2) AS all_money FROM orders WHERE status = 'pending'");
show("B pending 4th", "SELECT id, total FROM orders WHERE status = 'pending' ORDER BY total DESC LIMIT 5");
show("B cancelled >= 400", "SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS m FROM orders WHERE status = 'cancelled' AND total >= 400");
show("B cancelled any big", "SELECT id, total FROM orders WHERE status = 'cancelled' ORDER BY total DESC LIMIT 3");
show("B waiting/unshipped money", "SELECT ROUND(SUM(CASE WHEN shipped_at IS NULL THEN total ELSE 0 END),2) AS waiting_money, ROUND(SUM(CASE WHEN shipped_at IS NOT NULL THEN total ELSE 0 END),2) AS moving_money FROM orders");
show("B delivered per region", "SELECT c.region, SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered, SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS waiting FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY c.region");
show("B qty values", "SELECT quantity, COUNT(*) AS n FROM order_items GROUP BY quantity");
show("B qty band value", "SELECT ROUND(SUM(CASE WHEN quantity >= 3 THEN quantity*unit_price ELSE 0 END),2) AS bulk_v, ROUND(SUM(CASE WHEN quantity = 2 THEN quantity*unit_price ELSE 0 END),2) AS pair_v, ROUND(SUM(CASE WHEN quantity = 1 THEN quantity*unit_price ELSE 0 END),2) AS single_v FROM order_items");
show("B products under100 value", "SELECT CASE WHEN price < 100 THEN 'under' ELSE 'over' END AS band, COUNT(*) AS n, ROUND(SUM(price),2) AS v FROM products GROUP BY band");
show("B active customer orders", "SELECT CASE WHEN c.active = 1 THEN 'live' ELSE 'churned' END AS state, COUNT(*) AS n, ROUND(SUM(o.total),2) AS money FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY state");
show("B invoices by year", "SELECT substr(issued_on,1,4) AS yr, COUNT(*) AS n, ROUND(SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END)/100.0,2) AS paid_money, ROUND(SUM(CASE WHEN status <> 'paid' THEN amount_cents ELSE 0 END)/100.0,2) AS due_money FROM invoices GROUP BY yr");
show("B invoices 2025 detail", "SELECT COUNT(*) AS n, ROUND(SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END)/100.0,2) AS paid_money FROM invoices WHERE issued_on >= '2025-01-01'");
show("B invoice paid-except-open", "SELECT COUNT(*) AS n FROM (SELECT customer_id FROM invoices WHERE status = 'paid' EXCEPT SELECT customer_id FROM invoices WHERE status = 'open')");
show("B invoice paid∩open", "SELECT COUNT(*) AS n FROM (SELECT customer_id FROM invoices WHERE status = 'paid' INTERSECT SELECT customer_id FROM invoices WHERE status = 'open')");
show("B ledger months", "SELECT substr(entry_date,1,7) AS m, ROUND(SUM(CASE WHEN debit_cents > 0 THEN debit_cents ELSE 0 END)/100.0,2) AS debits, ROUND(SUM(CASE WHEN credit_cents > 0 THEN credit_cents ELSE 0 END)/100.0,2) AS credits FROM ledger_entries GROUP BY m ORDER BY m DESC LIMIT 3");
show("B AR sides", "SELECT CASE WHEN debit_cents > 0 THEN 'billed' ELSE 'settled' END AS side, COUNT(*) AS n, ROUND(SUM(debit_cents + credit_cents)/100.0,2) AS flow FROM ledger_entries WHERE account = 'accounts_receivable' GROUP BY side");
show("B AR all", "SELECT COUNT(*) AS n, ROUND(SUM(debit_cents + credit_cents)/100.0,2) AS flow FROM ledger_entries WHERE account = 'accounts_receivable'");
show("B pending∩unshipped customers", "SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders WHERE status = 'pending' INTERSECT SELECT customer_id FROM orders WHERE shipped_at IS NULL)");
show("B pending distinct customers", "SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status = 'pending'");
show("B customers never ordered", "SELECT COUNT(*) AS n FROM (SELECT id FROM customers EXCEPT SELECT customer_id FROM orders)");
show("B products never sold", "SELECT COUNT(*) AS n FROM (SELECT id FROM products EXCEPT SELECT product_id FROM order_items)");
show("B ge100 products sold", "SELECT COUNT(*) AS n FROM (SELECT id FROM products WHERE price >= 100 EXCEPT SELECT product_id FROM order_items)");
show("B ge100 products", "SELECT COUNT(*) AS n, ROUND(SUM(price),2) AS v FROM products WHERE price >= 100");
show("B lt40 products", "SELECT COUNT(*) AS n FROM products WHERE price < 40");
show("B price 50-60", "SELECT COUNT(*) AS n FROM products WHERE price >= 50 AND price < 60");
show("B price 150-200", "SELECT COUNT(*) AS n FROM products WHERE price >= 150 AND price < 200");
show("B expense major/minor money", "SELECT CASE WHEN amount_cents >= 100000 THEN 'major' ELSE 'minor' END AS band, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM expenses GROUP BY band");
show("B expense 2024-06 fixed/variable", "SELECT ROUND(SUM(CASE WHEN category IN ('Rent','Tools') THEN amount_cents ELSE 0 END)/100.0,2) AS fixed, ROUND(SUM(CASE WHEN category IN ('Ads','Travel') THEN amount_cents ELSE 0 END)/100.0,2) AS variable FROM expenses WHERE substr(spent_on,1,7) = '2024-06'");
show("B suppliers by region", "SELECT region, COUNT(*) AS n FROM suppliers GROUP BY region");
show("B star supplier products", "SELECT CASE WHEN s.rating >= 4.5 THEN 'star' ELSE 'crew' END AS tier, COUNT(p.id) AS products, SUM(CASE WHEN p.price >= 100 THEN 1 ELSE 0 END) AS pricey FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id GROUP BY tier");
show("B ads 2024 2025", "SELECT substr(spent_on,1,4) AS yr, ROUND(SUM(CASE WHEN category = 'Ads' THEN amount_cents ELSE 0 END)/100.0,2) AS ads, ROUND(SUM(CASE WHEN category = 'Rent' THEN amount_cents ELSE 0 END)/100.0,2) AS rent FROM expenses GROUP BY yr ORDER BY yr");
show("B pending big400 customers", "SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders WHERE status = 'pending' INTERSECT SELECT customer_id FROM orders WHERE total >= 400)");
show("B orders by month head", "SELECT substr(created_at,1,7) AS m, COUNT(*) AS n FROM orders GROUP BY m ORDER BY m LIMIT 4");
show("B band pending by band", "SELECT CASE WHEN total < 100 THEN 'small' WHEN total < 500 THEN 'mid' ELSE 'large' END AS band, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered FROM orders GROUP BY band ORDER BY band");
show("B band pending >0", "SELECT CASE WHEN total < 100 THEN 'small' WHEN total < 500 THEN 'mid' ELSE 'large' END AS band, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered FROM orders GROUP BY band HAVING pending > 0 ORDER BY band");
show("B region cancel pivot", "SELECT c.region, SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS waiting, SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY waiting DESC");
show("B audio price", "SELECT name, price FROM products WHERE category IN ('Audio','Video')");
show("B delivered-only top order check", "SELECT id, total FROM orders WHERE status = 'delivered' ORDER BY CASE WHEN total > 400 THEN 0 ELSE 1 END, total DESC LIMIT 5");
show("B payments 2025 since", "SELECT substr(paid_on,1,7) AS m, ROUND(SUM(CASE WHEN method = 'card' THEN amount_cents ELSE 0 END)/100.0,2) AS card, ROUND(SUM(CASE WHEN method = 'wire' THEN amount_cents ELSE 0 END)/100.0,2) AS wire FROM payments WHERE substr(paid_on,1,7) >= '2025-01' GROUP BY m ORDER BY m");
db.close();
