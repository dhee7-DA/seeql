/// <reference types="bun-types" />
/** Wave-4 second-round probes (cs-1051–1100) — receipts U01…, tee'd to m4-cases-w4-out2.txt */
import { Database } from "bun:sqlite";

const db = new Database("db/custom.db", { readonly: true });
let n = 0;
function probe(label: string, sql: string) {
  n++;
  const id = `U${String(n).padStart(2, "0")}`;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const summary = rows.slice(0, 40).map((r) => JSON.stringify(r)).join(" | ");
    console.log(`${id} ${label} [${rows.length} rows] ${summary}${rows.length > 40 ? " …" : ""}`);
  } catch (e) {
    console.log(`${id} ${label} ERROR ${e instanceof Error ? e.message : String(e)}`);
  }
}

// cs-1051: big-invoice club + distractor figures
probe("U01 distinct customers invoice > 200000", "SELECT COUNT(DISTINCT customer_id) c FROM invoices WHERE amount_cents > 200000");
probe("U02 distinct customers invoice > 50000", "SELECT COUNT(DISTINCT customer_id) c FROM invoices WHERE amount_cents > 50000");
probe("U03 invoices > 150000", "SELECT COUNT(*) c FROM invoices WHERE amount_cents > 150000");
probe("U04 paid-invoice distinct customers", "SELECT COUNT(DISTINCT customer_id) c FROM invoices WHERE status='paid'");
probe("U05 open-invoice distinct customers", "SELECT COUNT(DISTINCT customer_id) c FROM invoices WHERE status='open'");

// cs-1054: orders of paid-invoice customers
probe("U06 orders of paid-invoice customers", "SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT customer_id FROM invoices WHERE status='paid')");
probe("U07 orders of open-invoice customers", "SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT customer_id FROM invoices WHERE status='open')");
probe("U08 orders of void-invoice customer", "SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT customer_id FROM invoices WHERE status='void')");

// cs-1055: products bought in qty>=3
probe("U09 distinct products with qty>=3 line", "SELECT COUNT(DISTINCT product_id) c FROM order_items WHERE quantity >= 3");
probe("U10 distinct products with qty=1 line", "SELECT COUNT(DISTINCT product_id) c FROM order_items WHERE quantity = 1");
probe("U11 products with qty>=2", "SELECT COUNT(DISTINCT product_id) c FROM order_items WHERE quantity >= 2");
probe("U12 items qty=2 count", "SELECT COUNT(*) c FROM order_items WHERE quantity = 2");

// cs-1057: invoices above avg
probe("U13 invoices > avg invoice", "SELECT COUNT(*) c FROM invoices WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices)");
probe("U14 invoices < avg", "SELECT COUNT(*) c FROM invoices WHERE amount_cents < (SELECT AVG(amount_cents) FROM invoices)");
probe("U15 invoices = avg-check", "SELECT COUNT(*) c FROM invoices WHERE amount_cents = (SELECT AVG(amount_cents) FROM invoices)");

// cs-1058: expenses above avg
probe("U16 expenses > avg", "SELECT COUNT(*) c FROM expenses WHERE amount_cents > (SELECT AVG(amount_cents) FROM expenses)");
probe("U17 expenses < avg", "SELECT COUNT(*) c FROM expenses WHERE amount_cents < (SELECT AVG(amount_cents) FROM expenses)");
probe("U18 expenses > 70000", "SELECT COUNT(*) c FROM expenses WHERE amount_cents > 70000");
probe("U19 expenses > 120000", "SELECT COUNT(*) c FROM expenses WHERE amount_cents > 120000");

// cs-1059: lag above avg
probe("U20 lag distribution", "SELECT CAST(julianday(shipped_at)-julianday(created_at) AS INT) lag, COUNT(*) c FROM orders WHERE shipped_at IS NOT NULL GROUP BY lag ORDER BY lag");
probe("U21 orders with lag > avg-lag", "SELECT COUNT(*) c FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at)-julianday(created_at) > (SELECT AVG(julianday(shipped_at)-julianday(created_at)) FROM orders WHERE shipped_at IS NOT NULL)");
probe("U22 orders lag >= 3", "SELECT COUNT(*) c FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at)-julianday(created_at) >= 3");

// cs-1060: products above avg price
probe("U23 avg product price", "SELECT ROUND(AVG(price),2) a FROM products");
probe("U24 products > avg price", "SELECT COUNT(*) c FROM products WHERE price > (SELECT AVG(price) FROM products)");
probe("U25 products > 100 names", "SELECT name, price FROM products WHERE price > 100 ORDER BY price DESC");
probe("U26 products > 150", "SELECT COUNT(*) c, GROUP_CONCAT(name) FROM products WHERE price > 150");
probe("U27 suppliers of >150 products", "SELECT COUNT(DISTINCT supplier_id) c FROM products WHERE price > 150");
probe("U28 products < avg price", "SELECT COUNT(*) c FROM products WHERE price < (SELECT AVG(price) FROM products)");

// cs-1062: void invoice customer
probe("U29 void invoice customer name", "SELECT c.name, c.id FROM customers c WHERE c.id = (SELECT customer_id FROM invoices WHERE status='void')");
probe("U30 customers with open invoice", "SELECT COUNT(*) c FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status='open')");
probe("U31 customers with paid invoice", "SELECT COUNT(*) c FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status='paid')");

// cs-1063: products w/o big line
probe("U32 products in >300 lines", "SELECT COUNT(DISTINCT product_id) c FROM order_items WHERE quantity*unit_price > 300");
probe("U33 products NOT in >300 lines", "SELECT COUNT(*) c FROM products WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = products.id AND oi.quantity*oi.unit_price > 300)");
probe("U34 products in >500 lines", "SELECT COUNT(DISTINCT product_id) c FROM order_items WHERE quantity*unit_price > 500");
probe("U35 products NOT in >500 lines", "SELECT COUNT(*) c FROM products WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = products.id AND oi.quantity*oi.unit_price > 500)");

// cs-1064: customers with an 800+ order
probe("U36 customers with 800+ order", "SELECT COUNT(DISTINCT customer_id) c FROM orders WHERE total > 800");
probe("U37 customers with 800+ order names", "SELECT DISTINCT c.name FROM customers c JOIN orders o ON o.customer_id=c.id WHERE o.total > 800");
probe("U38 customers with 500+ order", "SELECT COUNT(DISTINCT customer_id) c FROM orders WHERE total > 500");
probe("U39 800+ order count", "SELECT COUNT(*) c FROM orders WHERE total > 800");

// cs-1067: orders w/o items
probe("U40 orders without items", "SELECT COUNT(*) c FROM orders o WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id)");
probe("U41 void invoice payments", "SELECT COUNT(*) c FROM payments p WHERE p.invoice_id = (SELECT id FROM invoices WHERE status='void')");
probe("U42 open invoices with a payment", "SELECT COUNT(*) c FROM invoices i WHERE i.status='open' AND EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)");

// cs-1068: per-customer avg order vs store avg
probe("U43 per-customer avg order", "SELECT c.name, ROUND(AVG(o.total),2) a, COUNT(*) n FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY a DESC");
probe("U44 customers avg-order > store avg (nested-avg)", "SELECT COUNT(*) c FROM customers c WHERE (SELECT AVG(total) FROM orders o WHERE o.customer_id = c.id) > (SELECT AVG(total) FROM orders)");
probe("U45 customers avg-order > 300", "SELECT COUNT(*) c FROM customers c WHERE (SELECT AVG(total) FROM orders o WHERE o.customer_id = c.id) > 300");
probe("U46 customers avg-order > 350", "SELECT COUNT(*) c FROM customers c WHERE (SELECT AVG(total) FROM orders o WHERE o.customer_id = c.id) > 350");

// cs-1069: invoices above own-customer avg
probe("U47 invoices > own-customer avg", "SELECT COUNT(*) c FROM invoices i WHERE i.amount_cents > (SELECT AVG(amount_cents) FROM invoices WHERE customer_id = i.customer_id)");
probe("U48 invoices < own-customer avg", "SELECT COUNT(*) c FROM invoices i WHERE i.amount_cents < (SELECT AVG(amount_cents) FROM invoices WHERE customer_id = i.customer_id)");
probe("U49 invoices = own-customer avg", "SELECT COUNT(*) c FROM invoices i WHERE i.amount_cents = (SELECT AVG(amount_cents) FROM invoices WHERE customer_id = i.customer_id)");

// cs-1070: products avg line > price
probe("U50 per-product avg line total", "SELECT p.name, p.price, ROUND(AVG(oi.quantity*oi.unit_price),2) a FROM products p JOIN order_items oi ON oi.product_id=p.id GROUP BY p.id ORDER BY a DESC LIMIT 20");
probe("U51 products avg-line > price", "SELECT COUNT(*) c FROM products p WHERE (SELECT AVG(quantity*unit_price) FROM order_items WHERE product_id = p.id) > p.price");
probe("U52 products avg-line < price", "SELECT COUNT(*) c FROM products p WHERE (SELECT AVG(quantity*unit_price) FROM order_items WHERE product_id = p.id) < p.price");

// cs-1071: expenses above category avg
probe("U53 per-category avg expense", "SELECT category, ROUND(AVG(amount_cents),2) a, COUNT(*) c FROM expenses GROUP BY category");
probe("U54 expenses > own-category avg", "SELECT COUNT(*) c FROM expenses e WHERE amount_cents > (SELECT AVG(amount_cents) FROM expenses WHERE category = e.category)");
probe("U55 expenses > own-vendor avg", "SELECT COUNT(*) c FROM expenses e WHERE amount_cents > (SELECT AVG(amount_cents) FROM expenses WHERE vendor = e.vendor)");
probe("U56 Rent rows", "SELECT COUNT(*) c, SUM(CASE WHEN amount_cents > 120000 THEN 1 ELSE 0 END) above FROM expenses WHERE category='Rent'");

// cs-1072: products above category price avg
probe("U57 per-category avg price", "SELECT category, ROUND(AVG(price),2) a FROM products GROUP BY category");
probe("U58 products > own-category avg price", "SELECT COUNT(*) c FROM products p WHERE price > (SELECT AVG(price) FROM products WHERE category = p.category)");
probe("U59 products > own-supplier avg price", "SELECT COUNT(*) c FROM products p WHERE price > (SELECT AVG(price) FROM products WHERE supplier_id = p.supplier_id)");
probe("U60 products > own-supplier avg stock", "SELECT COUNT(*) c FROM products p WHERE stock > (SELECT AVG(stock) FROM products WHERE supplier_id = p.supplier_id)");

// cs-1073: pending >= 3 per customer
probe("U61 per-customer pending counts", "SELECT c.name, COUNT(*) n FROM customers c JOIN orders o ON o.customer_id=c.id WHERE o.status='pending' GROUP BY c.id ORDER BY n DESC");
probe("U62 customers pending >= 3", "SELECT COUNT(*) c FROM customers c WHERE (SELECT COUNT(*) FROM orders WHERE customer_id = c.id AND status='pending') >= 3");
probe("U63 customers pending > 3", "SELECT COUNT(*) c FROM customers c WHERE (SELECT COUNT(*) FROM orders WHERE customer_id = c.id AND status='pending') > 3");
probe("U64 customers cancelled >= 2", "SELECT COUNT(*) c FROM customers c WHERE (SELECT COUNT(*) FROM orders WHERE customer_id = c.id AND status='cancelled') >= 2");
probe("U65 per-customer cancelled counts", "SELECT c.name, COUNT(*) n FROM customers c JOIN orders o ON o.customer_id=c.id WHERE o.status='cancelled' GROUP BY c.id ORDER BY n DESC");

// cs-1075: fully-paid strict
probe("U66 fully paid strict >", "SELECT COUNT(*) c FROM invoices i JOIN (SELECT invoice_id, SUM(amount_cents) s FROM payments GROUP BY invoice_id) p ON p.invoice_id=i.id WHERE p.s > i.amount_cents");
probe("U67 fully paid exact =", "SELECT COUNT(*) c FROM invoices i JOIN (SELECT invoice_id, SUM(amount_cents) s FROM payments GROUP BY invoice_id) p ON p.invoice_id=i.id WHERE p.s = i.amount_cents");
probe("U68 fully paid >= sum dollars", "SELECT ROUND(SUM(i.amount_cents)/100.0,2) dollars FROM invoices i JOIN (SELECT invoice_id, SUM(amount_cents) s FROM payments GROUP BY invoice_id) p ON p.invoice_id=i.id WHERE p.s >= i.amount_cents");
probe("U69 underpaid (< amount)", "SELECT COUNT(*) c FROM invoices i JOIN (SELECT invoice_id, SUM(amount_cents) s FROM payments GROUP BY invoice_id) p ON p.invoice_id=i.id WHERE p.s < i.amount_cents");

// cs-1076: customers with >= 10 orders
probe("U70 per-customer order counts all", "SELECT c.name, COUNT(*) n FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY n DESC");
probe("U71 customers >= 10 orders", "SELECT COUNT(*) c FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 10)");
probe("U72 customers > 5 orders", "SELECT COUNT(*) c FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) > 5)");
probe("U73 customers >= 15 orders", "SELECT COUNT(*) c FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 15)");

// cs-1077: category totals bars
probe("U74 categories > 200000", "SELECT COUNT(*) c FROM (SELECT category, SUM(amount_cents) s FROM expenses GROUP BY category) WHERE s > 200000");
probe("U75 categories > 100000", "SELECT COUNT(*) c FROM (SELECT category, SUM(amount_cents) s FROM expenses GROUP BY category) WHERE s > 100000");
probe("U76 categories > 300000", "SELECT COUNT(*) c FROM (SELECT category, SUM(amount_cents) s FROM expenses GROUP BY category) WHERE s > 300000");

// cs-1078: busy days
probe("U77 distinct order dates", "SELECT COUNT(DISTINCT date(created_at)) c FROM orders");
probe("U78 days with >= 2 orders", "SELECT COUNT(*) c FROM (SELECT date(created_at) d, COUNT(*) n FROM orders GROUP BY date(created_at) HAVING COUNT(*) >= 2)");
probe("U79 days with >= 3 orders", "SELECT COUNT(*) c FROM (SELECT date(created_at) d, COUNT(*) n FROM orders GROUP BY date(created_at) HAVING COUNT(*) >= 3)");
probe("U80 days with exactly 3", "SELECT COUNT(*) c FROM (SELECT date(created_at) d, COUNT(*) n FROM orders GROUP BY date(created_at) HAVING COUNT(*) = 3)");

// cs-1079: suppliers with >= 3 products
probe("U81 per-supplier product counts", "SELECT s.name, COUNT(*) n FROM suppliers s JOIN products p ON p.supplier_id=s.id GROUP BY s.id ORDER BY n DESC");
probe("U82 suppliers >= 3 products", "SELECT COUNT(*) c FROM (SELECT supplier_id FROM products GROUP BY supplier_id HAVING COUNT(*) >= 3)");
probe("U83 suppliers >= 2 products", "SELECT COUNT(*) c FROM (SELECT supplier_id FROM products GROUP BY supplier_id HAVING COUNT(*) >= 2)");
probe("U84 suppliers > 3 products", "SELECT COUNT(*) c FROM (SELECT supplier_id FROM products GROUP BY supplier_id HAVING COUNT(*) > 3)");

// cs-1084: ledger account nets
probe("U85 ledger per-account net", "SELECT account, SUM(debit_cents)/100.0 dr, SUM(credit_cents)/100.0 cr FROM ledger_entries GROUP BY account ORDER BY account");
probe("U86 accounts dr > cr", "SELECT COUNT(*) c FROM (SELECT account, SUM(debit_cents) dr, SUM(credit_cents) cr FROM ledger_entries GROUP BY account) WHERE dr > cr");
probe("U87 accounts cr > dr", "SELECT COUNT(*) c FROM (SELECT account, SUM(debit_cents) dr, SUM(credit_cents) cr FROM ledger_entries GROUP BY account) WHERE cr > dr");
probe("U88 AR net", "SELECT (SUM(debit_cents)-SUM(credit_cents))/100.0 net FROM ledger_entries WHERE account='accounts_receivable'");

// q7 month ladder
probe("U89 month ladder 2024", "WITH RECURSIVE m(x) AS (SELECT date('2024-01-01') UNION ALL SELECT date(x,'+1 month') FROM m WHERE x < date('2025-01-01')) SELECT COUNT(*) c FROM m");
probe("U90 month ladder +2mo", "WITH RECURSIVE m(x) AS (SELECT date('2024-01-01') UNION ALL SELECT date(x,'+2 month') FROM m WHERE x < date('2025-01-01')) SELECT COUNT(*) c FROM m");
probe("U91 week ladder 2024", "WITH RECURSIVE m(x) AS (SELECT date('2024-01-01') UNION ALL SELECT date(x,'+7 day') FROM m WHERE x < date('2025-01-01')) SELECT COUNT(*) c FROM m");

// q8 caps
probe("U92 VIP ids", "SELECT id, name FROM customers WHERE name IN ('Alice Chen','Emma Wilson','Grace Kim','Maya Patel','Chloe Dubois') ORDER BY id");
probe("U93 VIPs with big invoice", "SELECT COUNT(*) c FROM customers WHERE id IN (SELECT id FROM customers WHERE name IN ('Alice Chen','Emma Wilson','Grace Kim','Maya Patel','Chloe Dubois')) AND id IN (SELECT customer_id FROM invoices WHERE amount_cents > 100000)");
probe("U94 pending share", "SELECT ROUND(100.0*(SELECT SUM(total) FROM orders WHERE status='pending')/(SELECT SUM(total) FROM orders),1) pct");
probe("U95 fully-paid amount sum exact", "SELECT ROUND(SUM(i.amount_cents)/100.0,2) d FROM invoices i WHERE (SELECT COALESCE(SUM(p.amount_cents),0) FROM payments p WHERE p.invoice_id=i.id) >= i.amount_cents");
probe("U96 card total dollars", "SELECT ROUND(SUM(amount_cents)/100.0,2) d, COUNT(*) c FROM payments WHERE method='card'");
probe("U97 wire total dollars", "SELECT ROUND(SUM(amount_cents)/100.0,2) d, COUNT(*) c FROM payments WHERE method='wire'");
probe("U98 card count exact", "SELECT COUNT(*) c FROM payments WHERE method='card'");
probe("U99 stock sum price>100", "SELECT SUM(stock) s FROM products WHERE price > 100");
probe("U100 per-customer pending revenue", "SELECT c.name, ROUND(SUM(o.total),2) s FROM customers c JOIN orders o ON o.customer_id=c.id WHERE o.status='pending' GROUP BY c.id ORDER BY s DESC");
probe("U101 customers pending-rev > 500", "SELECT COUNT(*) c FROM (SELECT customer_id, SUM(total) s FROM orders WHERE status='pending' GROUP BY customer_id) WHERE s > 500");
probe("U102 peak expense month", "SELECT strftime('%Y-%m', spent_on) m, SUM(amount_cents)/100.0 s, COUNT(*) n FROM expenses GROUP BY m ORDER BY s DESC LIMIT 5");
probe("U103 peak month value", "SELECT ROUND(MAX(s)/100.0,2) FROM (SELECT SUM(amount_cents) s FROM expenses GROUP BY strftime('%Y-%m', spent_on))");
probe("U104 months with spend > 2000", "SELECT COUNT(*) c FROM (SELECT strftime('%Y-%m', spent_on) m, SUM(amount_cents) s FROM expenses GROUP BY m) WHERE s > 200000");
probe("U105 months with spend > 1500", "SELECT COUNT(*) c FROM (SELECT strftime('%Y-%m', spent_on) m, SUM(amount_cents) s FROM expenses GROUP BY m) WHERE s > 150000");
probe("U106 avg lifetime > store avg lifetime customers", "SELECT COUNT(*) c FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > (SELECT AVG(total) FROM orders))");
probe("U107 customers 2x avg lifetime", "SELECT COUNT(*) c FROM (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id) WHERE s > 2*(SELECT AVG(total) FROM orders)");
probe("U108 open invoice dollars", "SELECT ROUND(SUM(amount_cents)/100.0,2) d FROM invoices WHERE status='open'");
probe("U109 open invoice count", "SELECT COUNT(*) c FROM invoices WHERE status='open'");
probe("U110 stock > avg stock", "SELECT COUNT(*) c FROM products WHERE stock > (SELECT AVG(stock) FROM products)");
probe("U111 avg stock", "SELECT ROUND(AVG(stock),2) a FROM products");
probe("U112 customers with 2+ invoices", "SELECT COUNT(*) c FROM (SELECT customer_id FROM invoices GROUP BY customer_id HAVING COUNT(*) >= 2)");
probe("U113 per-customer invoice counts", "SELECT customer_id, COUNT(*) n FROM invoices GROUP BY customer_id ORDER BY n DESC");
probe("U114 invoices due 2025", "SELECT COUNT(*) c FROM invoices WHERE due_on >= '2025-01-01'");
probe("U115 customers single invoice", "SELECT COUNT(*) c FROM (SELECT customer_id FROM invoices GROUP BY customer_id HAVING COUNT(*) = 1)");

db.close();
console.log(`done: ${n} probes`);
