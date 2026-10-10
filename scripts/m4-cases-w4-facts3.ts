/// <reference types="bun-types" />
/** Wave-4 third-round probes — distractor consequences + remaining figures. tee → m4-cases-w4-out3.txt */
import { Database } from "bun:sqlite";

const db = new Database("db/custom.db", { readonly: true });
let n = 115;
function probe(label: string, sql: string) {
  n++;
  const id = `U${n}`;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const summary = rows.slice(0, 40).map((r) => JSON.stringify(r)).join(" | ");
    console.log(`${id} ${label} [${rows.length} rows] ${summary}${rows.length > 40 ? " …" : ""}`);
  } catch (e) {
    console.log(`${id} ${label} ERROR ${e instanceof Error ? e.message : String(e)}`);
  }
}

// cs-1054 distractor id
probe("U116 orders customer_id IN paid-invoice IDS", "SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT id FROM invoices WHERE status='paid')");
// cs-1055 distractor id
probe("U117 products id IN big-line order ids", "SELECT COUNT(*) c FROM products WHERE id IN (SELECT id FROM order_items WHERE quantity*unit_price > 300)");
// cs-1063 distractor product_id*unit_price
probe("U118 products with product_id*unit_price > 300 line", "SELECT COUNT(*) c FROM products p WHERE EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id AND oi.product_id * oi.unit_price > 300)");
// cs-1065 supplier names
probe("U119 smart watch supplier", "SELECT p.name, s.name sup, s.region FROM products p JOIN suppliers s ON s.id=p.supplier_id WHERE p.price > 150");
probe("U120 suppliers of >100 products", "SELECT COUNT(DISTINCT supplier_id) c FROM products WHERE price > 100");
probe("U121 suppliers with product > 100 via EXISTS", "SELECT COUNT(*) c FROM suppliers s WHERE EXISTS (SELECT 1 FROM products p WHERE p.supplier_id = s.id AND p.price > 100)");
// cs-1068 MIN distractor
probe("U122 customers whose MIN order > 350", "SELECT COUNT(*) c FROM customers c WHERE (SELECT MIN(total) FROM orders o WHERE o.customer_id = c.id) > 350");
// cs-1072 category-stock fold
probe("U123 stock > own-category avg", "SELECT COUNT(*) c FROM products p WHERE stock > (SELECT AVG(stock) FROM products WHERE category = p.category)");
probe("U124 stock > own-supplier min", "SELECT COUNT(*) c FROM products p WHERE stock > (SELECT MIN(stock) FROM products WHERE supplier_id = p.supplier_id)");
// cs-1075 MAX distractor
probe("U125 invoices whose MAX payment >= amount", "SELECT COUNT(*) c FROM invoices i WHERE (SELECT MAX(amount_cents) FROM payments p WHERE p.invoice_id = i.id) >= i.amount_cents");
probe("U126 invoices whose MAX payment < amount", "SELECT COUNT(*) c FROM invoices i WHERE (SELECT MAX(amount_cents) FROM payments p WHERE p.invoice_id = i.id) < i.amount_cents");
// cs-1077 inner-agg distractors
probe("U127 months AVG > 200000", "SELECT COUNT(*) c FROM (SELECT strftime('%Y-%m', spent_on) m, AVG(amount_cents) s FROM expenses GROUP BY m) WHERE s > 200000");
probe("U128 months MAX(amount) > 200000", "SELECT COUNT(*) c FROM (SELECT strftime('%Y-%m', spent_on) m, MAX(amount_cents) s FROM expenses GROUP BY m) WHERE s > 200000");
// cs-1083 inner-agg distractors
probe("U129 vendors AVG > 200000", "SELECT COUNT(*) c FROM (SELECT vendor, AVG(amount_cents) s FROM expenses GROUP BY vendor) WHERE s > 200000");
probe("U130 vendors MAX > 200000", "SELECT COUNT(*) c FROM (SELECT vendor, MAX(amount_cents) s FROM expenses GROUP BY vendor) WHERE s > 200000");
// cs-1084 MAX/MIN distractors
probe("U131 accounts MAX debit > credits", "SELECT COUNT(*) c FROM (SELECT account, MAX(debit_cents) dr, SUM(credit_cents) cr FROM ledger_entries GROUP BY account) WHERE dr > cr");
probe("U132 accounts MIN debit > credits", "SELECT COUNT(*) c FROM (SELECT account, MIN(debit_cents) dr, SUM(credit_cents) cr FROM ledger_entries GROUP BY account) WHERE dr > cr");
// cs-1085 countdown 40 stride -2 variants
probe("U133 c40s2 floor3", "WITH RECURSIVE t(n) AS (SELECT 40 UNION ALL SELECT n-2 FROM t WHERE n > 3) SELECT COUNT(*) c FROM t");
probe("U134 c40s2 floor4", "WITH RECURSIVE t(n) AS (SELECT 40 UNION ALL SELECT n-2 FROM t WHERE n > 4) SELECT COUNT(*) c FROM t");
probe("U135 c40s2 floor7", "WITH RECURSIVE t(n) AS (SELECT 40 UNION ALL SELECT n-2 FROM t WHERE n > 7) SELECT COUNT(*) c FROM t");
probe("U136 c40s2 floor12", "WITH RECURSIVE t(n) AS (SELECT 40 UNION ALL SELECT n-2 FROM t WHERE n > 12) SELECT COUNT(*) c FROM t");
probe("U137 c40s2 seed12", "WITH RECURSIVE t(n) AS (SELECT 12 UNION ALL SELECT n-2 FROM t WHERE n > 1) SELECT COUNT(*) c FROM t");
// cs-1086 payments ladder +7
probe("U138 payments ladder +7 day", "WITH RECURSIVE d(x) AS (SELECT date((SELECT MIN(paid_on) FROM payments)) UNION ALL SELECT date(x,'+7 day') FROM d WHERE x < (SELECT MAX(paid_on) FROM payments)) SELECT COUNT(*) c FROM d");
// cs-1087 doubling variants
probe("U139 doubling n*3 <1000", "WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n*3 FROM t WHERE n < 1000) SELECT COUNT(*) c, MAX(n) mx FROM t");
probe("U140 doubling n+2 <1000", "WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n+2 FROM t WHERE n < 1000) SELECT COUNT(*) c FROM t");
probe("U141 doubling <500", "WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n*2 FROM t WHERE n < 500) SELECT COUNT(*) c FROM t");
probe("U142 doubling <2000", "WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n*2 FROM t WHERE n < 2000) SELECT COUNT(*) c FROM t");
// cs-1088 fib variants
probe("U143 fib b<50", "WITH RECURSIVE f(a,b) AS (SELECT 1,1 UNION ALL SELECT b,a+b FROM f WHERE b < 50) SELECT COUNT(*) c FROM f");
probe("U144 fib b<500", "WITH RECURSIVE f(a,b) AS (SELECT 1,1 UNION ALL SELECT b,a+b FROM f WHERE b < 500) SELECT COUNT(*) c FROM f");
probe("U145 fib stride a,a+b", "WITH RECURSIVE f(a,b) AS (SELECT 1,1 UNION ALL SELECT a,a+b FROM f WHERE b < 100) SELECT COUNT(*) c FROM f");
probe("U146 fib stride b,b+1", "WITH RECURSIVE f(a,b) AS (SELECT 1,1 UNION ALL SELECT b,b+1 FROM f WHERE b < 100) SELECT COUNT(*) c FROM f");
// cs-1090 halving variants
probe("U147 halve 1000 floor1", "WITH RECURSIVE t(n) AS (SELECT 1000 UNION ALL SELECT n/2 FROM t WHERE n > 1) SELECT COUNT(*) c, MAX(n) mx FROM t");
probe("U148 halve floor0", "WITH RECURSIVE t(n) AS (SELECT 1000 UNION ALL SELECT n/2 FROM t WHERE n > 0) SELECT COUNT(*) c FROM t");
probe("U149 halve floor3", "WITH RECURSIVE t(n) AS (SELECT 1000 UNION ALL SELECT n/2 FROM t WHERE n > 3) SELECT COUNT(*) c FROM t");
probe("U150 halve seed2000", "WITH RECURSIVE t(n) AS (SELECT 2000 UNION ALL SELECT n/2 FROM t WHERE n > 1) SELECT COUNT(*) c FROM t");
// cs-1092 countdown 100 stride -5
probe("U151 c100s5 floor5", "WITH RECURSIVE t(n) AS (SELECT 100 UNION ALL SELECT n-5 FROM t WHERE n > 5) SELECT COUNT(*) c FROM t");
probe("U152 c100s5 floor4", "WITH RECURSIVE t(n) AS (SELECT 100 UNION ALL SELECT n-5 FROM t WHERE n > 4) SELECT COUNT(*) c FROM t");
probe("U153 c100s5 floor6", "WITH RECURSIVE t(n) AS (SELECT 100 UNION ALL SELECT n-5 FROM t WHERE n > 6) SELECT COUNT(*) c FROM t");
probe("U154 c100s5 floor20", "WITH RECURSIVE t(n) AS (SELECT 100 UNION ALL SELECT n-5 FROM t WHERE n > 20) SELECT COUNT(*) c FROM t");
probe("U155 c100s5 seed50", "WITH RECURSIVE t(n) AS (SELECT 50 UNION ALL SELECT n-5 FROM t WHERE n > 5) SELECT COUNT(*) c FROM t");
// cs-1093 VIP invoice clubs
probe("U156 chloe invoice", "SELECT id, customer_id, amount_cents, status FROM invoices WHERE customer_id = 3");
probe("U157 invoices > 300000", "SELECT COUNT(*) c FROM invoices WHERE amount_cents > 300000");
probe("U158 customers invoice > 300000", "SELECT COUNT(DISTINCT customer_id) c FROM invoices WHERE amount_cents > 300000");
probe("U159 invoices > 500000", "SELECT COUNT(*) c FROM invoices WHERE amount_cents > 500000");
probe("U160 customers invoice > 500000", "SELECT COUNT(DISTINCT customer_id) c FROM invoices WHERE amount_cents > 500000");
probe("U161 vip5 invoice > 200000", "SELECT COUNT(*) c FROM customers WHERE id IN (1,3,5,7,13) AND id IN (SELECT customer_id FROM invoices WHERE amount_cents > 200000)");
probe("U162 vip via having 260000", "SELECT COUNT(*) c FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > 260000)");
probe("U163 vip via having 400000", "SELECT COUNT(*) c FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > 400000)");
// cs-1094 open drawer
probe("U164 max open invoice", "SELECT MAX(amount_cents)/100.0 d FROM invoices WHERE status='open'");
probe("U165 paid sum dollars", "SELECT ROUND(SUM(amount_cents)/100.0,2) d FROM invoices WHERE status='paid'");
// cs-1095 cash/sales nets + max debit
probe("U166 cash net", "SELECT (SUM(debit_cents)-SUM(credit_cents))/100.0 net FROM ledger_entries WHERE account='cash'");
probe("U167 sales net", "SELECT (SUM(debit_cents)-SUM(credit_cents))/100.0 net FROM ledger_entries WHERE account='sales_revenue'");
probe("U168 opex net", "SELECT (SUM(debit_cents)-SUM(credit_cents))/100.0 net FROM ledger_entries WHERE account='operating_expenses'");
probe("U169 max debit per account", "SELECT account, MAX(debit_cents)/100.0 mx FROM ledger_entries GROUP BY account");
// cs-1096 avg/min month
probe("U170 avg month spend", "SELECT ROUND(AVG(s)/100.0,2) FROM (SELECT SUM(amount_cents) s FROM expenses GROUP BY strftime('%Y-%m', spent_on))");
probe("U171 min month spend", "SELECT ROUND(MIN(s)/100.0,2) FROM (SELECT SUM(amount_cents) s FROM expenses GROUP BY strftime('%Y-%m', spent_on))");
probe("U172 month count", "SELECT COUNT(*) c FROM (SELECT DISTINCT strftime('%Y-%m', spent_on) FROM expenses)");
probe("U173 months by vendor fold", "SELECT COUNT(*) c FROM (SELECT strftime('%Y-%m', category) m, SUM(amount_cents) s FROM expenses GROUP BY m)");
// cs-1097 smart watch stock + id bar
probe("U174 smart watch stock", "SELECT stock FROM products WHERE id = 13");
probe("U175 stock of id>100 products", "SELECT SUM(stock) s FROM products WHERE id > 100");
probe("U176 stock of price>150", "SELECT SUM(stock) s FROM products WHERE price > 150");
// cs-1098 distractor folds
probe("U177 per-customer cancelled revenue", "SELECT c.name, ROUND(SUM(o.total),2) s FROM customers c JOIN orders o ON o.customer_id=c.id WHERE o.status='cancelled' GROUP BY c.id ORDER BY s DESC");
probe("U178 customers cancelled-rev > 500", "SELECT COUNT(*) c FROM (SELECT customer_id, SUM(total) s FROM orders WHERE status='cancelled' GROUP BY customer_id) WHERE s > 500");
probe("U179 customers max-pending > 500", "SELECT COUNT(*) c FROM (SELECT customer_id, MAX(total) s FROM orders WHERE status='pending' GROUP BY customer_id) WHERE s > 500");
probe("U180 customers min-pending > 500", "SELECT COUNT(*) c FROM (SELECT customer_id, MIN(total) s FROM orders WHERE status='pending' GROUP BY customer_id) WHERE s > 500");
// cs-1099 variants
probe("U181 shipped share", "SELECT ROUND(100.0*(SELECT SUM(total) FROM orders WHERE status='shipped')/(SELECT SUM(total) FROM orders),1) pct");
probe("U182 delivered share", "SELECT ROUND(100.0*(SELECT SUM(total) FROM orders WHERE status='delivered')/(SELECT SUM(total) FROM orders),1) pct");
probe("U183 max pending share", "SELECT ROUND(100.0*(SELECT MAX(total) FROM orders WHERE status='pending')/(SELECT SUM(total) FROM orders),1) pct");
probe("U184 pending share 2dp", "SELECT ROUND(100.0*(SELECT SUM(total) FROM orders WHERE status='pending')/(SELECT SUM(total) FROM orders),2) pct");
probe("U185 pending share 0dp", "SELECT ROUND(100.0*(SELECT SUM(total) FROM orders WHERE status='pending')/(SELECT SUM(total) FROM orders),0) pct");
// cs-1053 heavy-vendor verify
probe("U186 expenses vendor IN >100000 vendors", "SELECT COUNT(*) c FROM expenses WHERE vendor IN (SELECT vendor FROM expenses WHERE amount_cents > 100000)");
probe("U187 expenses vendor IN >150000 vendors", "SELECT COUNT(*) c FROM expenses WHERE vendor IN (SELECT vendor FROM expenses WHERE amount_cents > 150000)");
probe("U188 max per vendor", "SELECT vendor, MAX(amount_cents)/100.0 mx FROM expenses GROUP BY vendor");
// cs-1082 rollup verify
probe("U189 regions >= 8", "SELECT COUNT(*) c FROM (SELECT region, COUNT(*) n FROM customers GROUP BY region) WHERE n >= 8");
probe("U190 regions by city", "SELECT COUNT(*) c FROM (SELECT city, COUNT(*) n FROM customers GROUP BY city) WHERE n >= 5");
// cs-1056 min order total
probe("U191 min order total", "SELECT MIN(total) mn FROM orders");
probe("U192 orders < MIN-check", "SELECT COUNT(*) c FROM orders WHERE total < (SELECT MIN(total) FROM orders)");
// cs-1057 inner MIN/MAX
probe("U193 invoices > MIN", "SELECT COUNT(*) c FROM invoices WHERE amount_cents > (SELECT MIN(amount_cents) FROM invoices)");
probe("U194 invoices > MAX", "SELECT COUNT(*) c FROM invoices WHERE amount_cents > (SELECT MAX(amount_cents) FROM invoices)");
// cs-1058 inner MIN/SUM
probe("U195 expenses > MIN", "SELECT COUNT(*) c FROM expenses WHERE amount_cents > (SELECT MIN(amount_cents) FROM expenses)");
probe("U196 expenses > SUM", "SELECT COUNT(*) c FROM expenses WHERE amount_cents > (SELECT SUM(amount_cents) FROM expenses)");
probe("U197 expenses < MIN", "SELECT COUNT(*) c FROM expenses WHERE amount_cents < (SELECT MIN(amount_cents) FROM expenses)");
// cs-1059 inner MAX/SUM
probe("U198 lag > MAX-lag", "SELECT COUNT(*) c FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at)-julianday(created_at) > (SELECT MAX(julianday(shipped_at)-julianday(created_at)) FROM orders WHERE shipped_at IS NOT NULL)");
probe("U199 lag > SUM-lag", "SELECT COUNT(*) c FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at)-julianday(created_at) > (SELECT SUM(julianday(shipped_at)-julianday(created_at)) FROM orders WHERE shipped_at IS NOT NULL)");
probe("U200 lag < avg", "SELECT COUNT(*) c FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at)-julianday(created_at) < (SELECT AVG(julianday(shipped_at)-julianday(created_at)) FROM orders WHERE shipped_at IS NOT NULL)");
// cs-1060 inner MIN
probe("U201 products > MIN price", "SELECT COUNT(*) c FROM products WHERE price > (SELECT MIN(price) FROM products)");
// cs-1064 status-fold
probe("U202 customers with status>800 orders", "SELECT COUNT(*) c FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status > 800)");
// cs-1067 paid-with-payment
probe("U203 invoices paid AND have payment", "SELECT COUNT(*) c FROM invoices i WHERE i.status='paid' AND EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)");
// cs-1080 big invoices bars
probe("U204 invoices > 400000", "SELECT COUNT(*) c FROM invoices WHERE amount_cents > 400000");
probe("U205 invoices > 600000", "SELECT COUNT(*) c FROM invoices WHERE amount_cents > 600000");
probe("U206 invoices > 500000 exact", "SELECT COUNT(*) c FROM invoices WHERE amount_cents > 500000");

db.close();
console.log(`done: ${n - 115} probes`);
