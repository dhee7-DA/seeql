/// Wave-4 resumption receipts (V01+): figures needed for cases cs-1075–1100
/// (q5 derived, q6 CTE, q7 recursive, q8 capstone blocks that were never drafted).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function probe(name: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const cells = rows.map((r) => Object.entries(r).map(([k, v]) => `${k}:${v}`).join(" ")).join(" | ");
    console.log(`${name} [${rows.length} rows] ${cells}`);
  } catch (e) {
    console.log(`${name} ERROR ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ---- q5 block (cs-1075–1079) ----
probe("V01 payment stage by method", "SELECT method, COUNT(*) c, SUM(amount_cents) s FROM payments GROUP BY method");
probe("V02 payment stage by invoice fold count", "SELECT COUNT(*) c FROM (SELECT invoice_id FROM payments GROUP BY invoice_id)");
probe("V03 payment stage by id fold count", "SELECT COUNT(*) c FROM (SELECT id FROM payments GROUP BY id)");
probe("V04 invoice stage by status", "SELECT status, COUNT(*) c, SUM(amount_cents) s FROM invoices GROUP BY status");
probe("V05 invoice stage by customer fold count", "SELECT COUNT(*) c FROM (SELECT customer_id FROM invoices GROUP BY customer_id)");
probe("V06 products above own-supplier avg", "SELECT COUNT(*) c FROM products p JOIN (SELECT supplier_id, AVG(price) a FROM products GROUP BY supplier_id) s ON s.supplier_id = p.supplier_id WHERE p.price > s.a");
probe("V07 products above own-category avg", "SELECT COUNT(*) c FROM products p JOIN (SELECT category, AVG(price) a FROM products GROUP BY category) ca ON ca.category = p.category WHERE p.price > ca.a");
probe("V08 expense categories over 400000", "SELECT COUNT(*) c, SUM(s) tot FROM (SELECT category, SUM(amount_cents) s FROM expenses GROUP BY category HAVING SUM(amount_cents) > 400000)");
probe("V09 expense categories over 500000", "SELECT COUNT(*) c FROM (SELECT category, SUM(amount_cents) s FROM expenses GROUP BY category HAVING SUM(amount_cents) > 500000)");
probe("V10 expense categories over 250000", "SELECT COUNT(*) c FROM (SELECT category, SUM(amount_cents) s FROM expenses GROUP BY category HAVING SUM(amount_cents) > 250000)");
probe("V11 avg-order-stage vs store avg (AVG stage)", "SELECT COUNT(*) c FROM (SELECT customer_id, AVG(total) a FROM orders GROUP BY customer_id) s WHERE s.a > (SELECT AVG(total) FROM orders)");
probe("V12 sum-stage vs store avg order (SUM stage distractor)", "SELECT COUNT(*) c FROM (SELECT customer_id, SUM(total) a FROM orders GROUP BY customer_id) s WHERE s.a > (SELECT AVG(total) FROM orders)");
probe("V13 min-stage vs store avg order (MIN stage distractor)", "SELECT COUNT(*) c FROM (SELECT customer_id, MIN(total) a FROM orders GROUP BY customer_id) s WHERE s.a > (SELECT AVG(total) FROM orders)");

// ---- q6 block (cs-1080–1084) ----
probe("V14 order status stage", "SELECT status, COUNT(*) c, ROUND(SUM(total),2) s FROM orders GROUP BY status");
probe("V15 order stage by shipped_at fold count", "SELECT COUNT(*) c, ROUND(MAX(s),2) mx FROM (SELECT shipped_at, SUM(total) s FROM orders GROUP BY shipped_at)");
probe("V16 big invoices over 200000 min/avg", "SELECT MIN(amount_cents) mn, ROUND(AVG(amount_cents),2) a, MAX(amount_cents) mx FROM invoices WHERE amount_cents > 200000");
probe("V17 big invoices over 300000 min/avg", "SELECT MIN(amount_cents) mn, ROUND(AVG(amount_cents),2) a FROM invoices WHERE amount_cents > 300000");
probe("V18 orders of open-invoice customers", "WITH open_accounts AS (SELECT DISTINCT customer_id FROM invoices WHERE status = 'open') SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT customer_id FROM open_accounts)");
probe("V19 orders of paid-invoice customers", "WITH paid_accounts AS (SELECT DISTINCT customer_id FROM invoices WHERE status = 'paid') SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT customer_id FROM paid_accounts)");
probe("V20 orders of void-invoice customer", "WITH void_accounts AS (SELECT DISTINCT customer_id FROM invoices WHERE status = 'void') SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT customer_id FROM void_accounts)");
probe("V21 orders NOT in open set", "WITH open_accounts AS (SELECT DISTINCT customer_id FROM invoices WHERE status = 'open') SELECT COUNT(*) c FROM orders WHERE customer_id NOT IN (SELECT customer_id FROM open_accounts)");
probe("V22 hot expense months over 150000", "WITH months AS (SELECT strftime('%Y-%m', spent_on) m, SUM(amount_cents) spend FROM expenses GROUP BY m) SELECT COUNT(*) c, ROUND(MIN(spend),2) mn, ROUND(MAX(spend),2) mx, ROUND(SUM(spend),2) tot, ROUND(AVG(spend),2) av FROM months WHERE spend > 150000");
probe("V23 VIP invoice count + min + max", "WITH vips AS (SELECT id FROM customers WHERE name IN ('Alice Chen','Emma Wilson','Grace Kim','Maya Patel','Chloe Dubois')), vip_bills AS (SELECT amount_cents FROM invoices WHERE customer_id IN (SELECT id FROM vips)) SELECT COUNT(*) c, MIN(amount_cents) mn, MAX(amount_cents) mx FROM vip_bills");

// ---- q7 block (cs-1085–1092) ----
probe("V24 countdown 10", "WITH RECURSIVE tick(n) AS (SELECT 10 UNION ALL SELECT n-1 FROM tick WHERE n > 1) SELECT COUNT(*) c, SUM(n) s FROM tick");
probe("V25 countdown 10 floor 3", "WITH RECURSIVE tick(n) AS (SELECT 10 UNION ALL SELECT n-1 FROM tick WHERE n > 3) SELECT COUNT(*) c FROM tick");
probe("V26 countdown 10 floor 0", "WITH RECURSIVE tick(n) AS (SELECT 10 UNION ALL SELECT n-1 FROM tick WHERE n > 0) SELECT COUNT(*) c FROM tick");
probe("V27 countdown 40 step1", "WITH RECURSIVE tick(n) AS (SELECT 40 UNION ALL SELECT n-1 FROM tick WHERE n > 1) SELECT COUNT(*) c FROM tick");
probe("V28 countdown 40 step3", "WITH RECURSIVE tick(n) AS (SELECT 40 UNION ALL SELECT n-3 FROM tick WHERE n > 1) SELECT COUNT(*) c, SUM(n) s FROM tick");
probe("V29 countdown 40 step5", "WITH RECURSIVE tick(n) AS (SELECT 40 UNION ALL SELECT n-5 FROM tick WHERE n > 1) SELECT COUNT(*) c, SUM(n) s FROM tick");
probe("V30 countdown 40 s2 floor0", "WITH RECURSIVE tick(n) AS (SELECT 40 UNION ALL SELECT n-2 FROM tick WHERE n > 0) SELECT COUNT(*) c FROM tick");
probe("V31 countdown 40 s2 floor2", "WITH RECURSIVE tick(n) AS (SELECT 40 UNION ALL SELECT n-2 FROM tick WHERE n > 2) SELECT COUNT(*) c FROM tick");
probe("V32 order-date ladder +1 day", "WITH RECURSIVE cal(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) UNION ALL SELECT date(d,'+1 day') FROM cal WHERE d < (SELECT MAX(created_at) FROM orders)) SELECT COUNT(*) c FROM cal");
probe("V33 order-date ladder +2 days", "WITH RECURSIVE cal(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) UNION ALL SELECT date(d,'+2 day') FROM cal WHERE d < (SELECT MAX(created_at) FROM orders)) SELECT COUNT(*) c FROM cal");
probe("V34 order-date ladder +7 days", "WITH RECURSIVE cal(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) UNION ALL SELECT date(d,'+7 day') FROM cal WHERE d < (SELECT MAX(created_at) FROM orders)) SELECT COUNT(*) c FROM cal");
probe("V35 order-date ladder MAX->MIN", "WITH RECURSIVE cal(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) UNION ALL SELECT date(d,'+1 day') FROM cal WHERE d < (SELECT MIN(created_at) FROM orders)) SELECT COUNT(*) c FROM cal");
probe("V36 invoice ids contiguous?", "SELECT MIN(id) mn, MAX(id) mx, COUNT(*) c FROM invoices");
probe("V37 walk 1..40 join invoices", "WITH RECURSIVE walk(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM walk WHERE n < 40) SELECT COUNT(invoice_id) c, SUM(invoice_id) s, MIN(invoice_id) mn, AVG(invoice_id) a FROM walk JOIN invoices ON invoice_id = n");
probe("V38 walk 1..20 join invoices", "WITH RECURSIVE walk(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM walk WHERE n < 20) SELECT COUNT(invoice_id) c FROM walk JOIN invoices ON invoice_id = n");
probe("V39 walk 1..25 join invoices", "WITH RECURSIVE walk(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM walk WHERE n < 25) SELECT COUNT(invoice_id) c FROM walk JOIN invoices ON invoice_id = n");
probe("V40 powers k=4 bound 1000", "WITH RECURSIVE pow(n) AS (SELECT 1 UNION ALL SELECT n*4 FROM pow WHERE n < 1000) SELECT COUNT(*) c, MAX(n) mx FROM pow");
probe("V41 powers k=3 bound 100", "WITH RECURSIVE pow(n) AS (SELECT 1 UNION ALL SELECT n*3 FROM pow WHERE n < 100) SELECT COUNT(*) c, MAX(n) mx FROM pow");
probe("V42 powers k=3 bound 10000", "WITH RECURSIVE pow(n) AS (SELECT 1 UNION ALL SELECT n*3 FROM pow WHERE n < 10000) SELECT COUNT(*) c, MAX(n) mx FROM pow");
probe("V43 halve 1000 floor1 sum", "WITH RECURSIVE half(n) AS (SELECT 1000 UNION ALL SELECT n/2 FROM half WHERE n > 1) SELECT COUNT(*) c, SUM(n) s, MIN(n) mn FROM half");
probe("V44 halve seed 500", "WITH RECURSIVE half(n) AS (SELECT 500 UNION ALL SELECT n/2 FROM half WHERE n > 1) SELECT COUNT(*) c FROM half");
probe("V45 countdown 120 s5 f5", "WITH RECURSIVE tick(n) AS (SELECT 120 UNION ALL SELECT n-5 FROM tick WHERE n > 5) SELECT COUNT(*) c, SUM(n) s FROM tick");
probe("V46 countdown 100 s5 f4", "WITH RECURSIVE tick(n) AS (SELECT 100 UNION ALL SELECT n-5 FROM tick WHERE n > 4) SELECT COUNT(*) c FROM tick");
probe("V47 countdown 100 s5 f20", "WITH RECURSIVE tick(n) AS (SELECT 100 UNION ALL SELECT n-5 FROM tick WHERE n > 20) SELECT COUNT(*) c FROM tick");
probe("V48 countdown 100 s5 f5 sum", "WITH RECURSIVE tick(n) AS (SELECT 100 UNION ALL SELECT n-5 FROM tick WHERE n > 5) SELECT COUNT(*) c, SUM(n) s, MAX(n) mx, MIN(n) mn FROM tick");
probe("V49 payments ladder +1 day", "WITH RECURSIVE d(x) AS (SELECT date((SELECT MIN(paid_on) FROM payments)) UNION ALL SELECT date(x,'+1 day') FROM d WHERE x < (SELECT MAX(paid_on) FROM payments)) SELECT COUNT(*) c FROM d");
probe("V50 payments ladder +30 day", "WITH RECURSIVE d(x) AS (SELECT date((SELECT MIN(paid_on) FROM payments)) UNION ALL SELECT date(x,'+30 day') FROM d WHERE x < (SELECT MAX(paid_on) FROM payments)) SELECT COUNT(*) c FROM d");

// ---- q8 block (cs-1093–1100) ----
probe("V51 shipped-rev over 500 customers", "SELECT COUNT(*) c FROM customers c WHERE (SELECT SUM(total) FROM orders WHERE customer_id = c.id AND status = 'shipped') > 500");
probe("V52 cancelled-rev over 500 customers", "SELECT COUNT(*) c FROM customers c WHERE (SELECT SUM(total) FROM orders WHERE customer_id = c.id AND status = 'cancelled') > 500");
probe("V53 delivered-rev over 500 customers", "SELECT COUNT(*) c FROM customers c WHERE (SELECT SUM(total) FROM orders WHERE customer_id = c.id AND status = 'delivered') > 500");
probe("V54 invoices MIN payment vs amount underpaid", "SELECT COUNT(*) c FROM invoices i WHERE (SELECT MIN(amount_cents) FROM payments WHERE invoice_id = i.id) >= amount_cents");
probe("V55 invoices AVG payment >= amount", "SELECT COUNT(*) c FROM invoices i WHERE (SELECT AVG(amount_cents) FROM payments WHERE invoice_id = i.id) >= amount_cents");
probe("V56 peak order days by status fold", "WITH days AS (SELECT status, COUNT(*) n FROM orders GROUP BY status) SELECT COUNT(*) c FROM days WHERE n = (SELECT MAX(n) FROM days)");
probe("V57 peak order days by customer fold", "WITH days AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) SELECT COUNT(*) c FROM days WHERE n = (SELECT MAX(n) FROM days)");
probe("V58 peak order days strictly under max", "WITH days AS (SELECT created_at, COUNT(*) n FROM orders GROUP BY created_at) SELECT COUNT(*) c FROM days WHERE n < (SELECT MAX(n) FROM days)");
probe("V59 VIP sku coverage bar 300", "SELECT COUNT(DISTINCT product_id) c FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE name IN ('Alice Chen','Emma Wilson','Grace Kim','Maya Patel','Chloe Dubois')) AND total > 300)");
probe("V60 VIP sku coverage bar 100", "SELECT COUNT(DISTINCT product_id) c FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE name IN ('Alice Chen','Emma Wilson','Grace Kim','Maya Patel','Chloe Dubois')) AND total > 100)");
probe("V61 Alice-only sku coverage", "SELECT COUNT(DISTINCT product_id) c FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id = 1)");
probe("V62 Liam order sku coverage", "SELECT COUNT(DISTINCT product_id) c FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id = 12)");
probe("V63 VIP avg lifetime stage check", "SELECT ROUND(AVG(spend),2) a FROM (SELECT customer_id, SUM(total) spend FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE name IN ('Alice Chen','Emma Wilson','Grace Kim','Maya Patel','Chloe Dubois')) GROUP BY customer_id)");
probe("V64 VIP avg via status fold", "SELECT ROUND(AVG(spend),2) a, COUNT(*) c FROM (SELECT status, SUM(total) spend FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE name IN ('Alice Chen','Emma Wilson','Grace Kim','Maya Patel','Chloe Dubois')) GROUP BY status)");
probe("V65 VIP avg via name fold (should error or 1 row)", "SELECT ROUND(AVG(spend),2) a FROM (SELECT customer_id, SUM(total) spend FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE name IN ('Alice Chen','Emma Wilson','Grace Kim','Maya Patel','Chloe Dubois')) GROUP BY id)");
probe("V66 pending share digits 0", "SELECT ROUND(100.0 * (SELECT SUM(total) FROM orders WHERE status = 'pending') / (SELECT SUM(total) FROM orders), 0) s0");
probe("V67 cash net check", "SELECT ROUND((SELECT SUM(debit_cents) FROM ledger_entries WHERE account = 'cash') - (SELECT SUM(credit_cents) FROM ledger_entries WHERE account = 'cash'), 2) n");

db.close();
rmSync(COPY, { force: true });
