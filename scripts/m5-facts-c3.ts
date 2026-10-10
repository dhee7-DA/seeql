/// <reference types="bun-types" />
// m5-c3 probe tool — read-only COPY of db/custom.db, self-deleting.
// Every figure used in cases-w3.ts must trace to this output (or to
// scripts/m5-facts-r3.out, which is re-verified here where reused).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5c3.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- re-verify core r3 receipts reused by w3 ----
show("supplier rating rank + ties", "SELECT name, rating, RANK() OVER (ORDER BY rating DESC) rk FROM suppliers ORDER BY rk");
show("supplier rating tie census", "SELECT rating, COUNT(*) n FROM suppliers GROUP BY rating HAVING n > 1");
show("ntile4 orders spans", "SELECT tile, COUNT(*) n, MIN(t) mn, MAX(t) mx FROM (SELECT total t, NTILE(4) OVER (ORDER BY total DESC) tile FROM orders) GROUP BY tile ORDER BY tile");
show("spend league top3 + bottom", "SELECT name, spend, rk FROM (SELECT c.name name, ROUND(SUM(o.total),2) spend, RANK() OVER (ORDER BY SUM(o.total) DESC) rk FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id) WHERE rk IN (1,2,16) ORDER BY rk");
show("month spend ranked top3+bottom", "SELECT mon, spend, rk FROM (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend, RANK() OVER (ORDER BY SUM(total) DESC) rk FROM orders GROUP BY mon) WHERE rk IN (1,2,3,14) ORDER BY rk");
show("region spend winners", "SELECT region, name, ROUND(spend,2) s, rk FROM (SELECT c.region region, c.name name, SUM(o.total) spend, RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) rk FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id) WHERE rk = 1 ORDER BY region");
show("region spend rk2", "SELECT region, name, ROUND(spend,2) s FROM (SELECT c.region region, c.name name, SUM(o.total) spend, RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) rk FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id) WHERE rk = 2 ORDER BY spend DESC");
show("ntile2 EU spenders tile2", "SELECT name, ROUND(spend,2) s, tile FROM (SELECT c.name name, SUM(o.total) spend, NTILE(2) OVER (ORDER BY SUM(o.total) DESC) tile FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU' GROUP BY c.id) WHERE tile = 2 ORDER BY spend DESC");
show("top-2 orders per region", "SELECT region, id, ROUND(total,2) total, rn FROM (SELECT c.region region, o.id id, o.total total, ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY o.total DESC, o.id) rn FROM orders o JOIN customers c ON c.id = o.customer_id) WHERE rn <= 2 ORDER BY region, rn");
show("invoice top3", "SELECT id, number, amount_cents/100.0 amount, RANK() OVER (ORDER BY amount_cents DESC) rk FROM invoices ORDER BY rk, id LIMIT 3");
show("ledger account nets ranked", "SELECT account, ROUND(SUM(debit_cents-credit_cents)/100.0,2) net, RANK() OVER (ORDER BY ABS(SUM(debit_cents-credit_cents)) DESC) rk FROM ledger_entries GROUP BY account ORDER BY rk");
show("customers oldest 3", "SELECT name, created_at, RANK() OVER (ORDER BY created_at ASC) rk FROM customers ORDER BY rk LIMIT 3");
show("pending top2", "SELECT id, total, RANK() OVER (ORDER BY total DESC) rk FROM orders WHERE status = 'pending' ORDER BY rk LIMIT 2");
show("cheapest 5 orders", "SELECT id, total, ROW_NUMBER() OVER (ORDER BY total ASC) rn FROM orders ORDER BY rn LIMIT 5");
show("supplier product counts", "SELECT s.name, COUNT(p.id) n, RANK() OVER (ORDER BY COUNT(p.id) DESC) rk, DENSE_RANK() OVER (ORDER BY COUNT(p.id) DESC) drk FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY rk, s.name");
show("order-count ladder compact", "SELECT n, COUNT(*) ties FROM (SELECT COUNT(*) n FROM orders GROUP BY customer_id) GROUP BY n ORDER BY n DESC");
show("invoice count ladder", "SELECT c.name, COUNT(*) n, RANK() OVER (ORDER BY COUNT(*) DESC) rk, DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) drk FROM invoices i JOIN customers c ON c.id = i.customer_id GROUP BY c.id ORDER BY rk, c.name");
show("ntile4 products price spans", "SELECT tile, COUNT(*) n, MIN(price) mn, MAX(price) mx FROM (SELECT price, NTILE(4) OVER (ORDER BY price DESC) tile FROM products) GROUP BY tile ORDER BY tile");
show("ntile4 stock spans", "SELECT tile, COUNT(*) n, MIN(stock) mn, MAX(stock) mx FROM (SELECT stock, NTILE(4) OVER (ORDER BY stock DESC) tile FROM products) GROUP BY tile ORDER BY tile");
show("ntile4 expense months", "SELECT mon, ROUND(s/100.0,2) spend, NTILE(4) OVER (ORDER BY SUM(amount_cents) DESC) tile FROM expenses GROUP BY strftime('%Y-%m', spent_on) ORDER BY tile, spend DESC");
show("ntile3 expense months census", "SELECT tile, COUNT(*) n FROM (SELECT SUM(amount_cents) s, NTILE(3) OVER (ORDER BY SUM(amount_cents) DESC) tile FROM expenses GROUP BY strftime('%Y-%m', spent_on)) GROUP BY tile ORDER BY tile");
show("months > 3000", "SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend FROM orders GROUP BY mon HAVING SUM(total) > 3000 ORDER BY spend DESC");
show("months > 2400 count", "SELECT COUNT(*) n FROM (SELECT SUM(total) s FROM orders GROUP BY strftime('%Y-%m', created_at)) WHERE s > 2400");
show("day buckets > 3000", "SELECT COUNT(*) n, MAX(d) mx FROM (SELECT strftime('%Y-%m-%d', created_at) d, SUM(total) s FROM orders GROUP BY d) WHERE s > 3000");
show("year buckets > 3000", "SELECT strftime('%Y', created_at) y, ROUND(SUM(total),2) spend FROM orders GROUP BY y HAVING SUM(total) > 3000 ORDER BY spend DESC");
show("spend league >= 1000", "SELECT c.name, ROUND(SUM(o.total),2) spend, RANK() OVER (ORDER BY SUM(o.total) DESC) rk FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id HAVING SUM(o.total) >= 1000 ORDER BY rk");
show("spend league >= 500 count", "SELECT COUNT(*) n FROM (SELECT SUM(total) s FROM orders GROUP BY customer_id) WHERE s >= 500");
show("max order per customer >= 1000", "SELECT c.name, ROUND(MAX(o.total),2) mx FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id HAVING MAX(o.total) >= 1000 ORDER BY mx DESC");
show("top product per supplier", "SELECT supplier, name, price FROM (SELECT s.name AS supplier, p.name, p.price, RANK() OVER (PARTITION BY p.supplier_id ORDER BY p.price DESC) rk FROM products p JOIN suppliers s ON s.id = p.supplier_id) WHERE rk = 1 ORDER BY price DESC");
show("top-2 products per category count", "SELECT COUNT(*) n FROM (SELECT ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC, name) rn FROM products) WHERE rn <= 2");
show("stock <= 100 list", "SELECT name, stock, ROW_NUMBER() OVER (ORDER BY stock ASC) rn FROM products WHERE stock <= 100 ORDER BY rn");
show("stock <= 150 / <= 60 counts", "SELECT SUM(stock <= 150) a, SUM(stock <= 60) b FROM products");

// ---- NEW: payments full rank (fraud ties) ----
show("payments full rank top8", "SELECT id, invoice_id, amount_cents/100.0 amount, method, RANK() OVER (ORDER BY amount_cents DESC) rk, DENSE_RANK() OVER (ORDER BY amount_cents DESC) drk, ROW_NUMBER() OVER (ORDER BY amount_cents DESC, id) rn FROM payments ORDER BY rk, id LIMIT 8");
show("payments tie census", "SELECT amount_cents, COUNT(*) n FROM payments GROUP BY amount_cents HAVING n > 1");

// ---- NEW: cancelled orders + per-customer counts ----
show("cancelled full ladder", "SELECT id, ROUND(total,2) total, customer_id, RANK() OVER (ORDER BY total DESC) rk FROM orders WHERE status = 'cancelled' ORDER BY rk, id");
show("cancelled totals tie check", "SELECT total, COUNT(*) n FROM orders WHERE status = 'cancelled' GROUP BY total HAVING n > 1");
show("cancelled per-customer counts", "SELECT c.name, COUNT(*) cn, RANK() OVER (ORDER BY COUNT(*) DESC) rk, DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) drk, ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC, c.name) rn FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' GROUP BY c.id ORDER BY rk, c.name");

// ---- NEW: expense amounts full (Rent tie block + what follows) ----
show("expense amounts DESC top10", "SELECT id, category, vendor, amount_cents/100.0 amount, RANK() OVER (ORDER BY amount_cents DESC) rk, DENSE_RANK() OVER (ORDER BY amount_cents DESC) drk, ROW_NUMBER() OVER (ORDER BY amount_cents DESC, id) rn FROM expenses ORDER BY rk, id LIMIT 10");
show("expense amount tie census", "SELECT amount_cents, COUNT(*) n FROM expenses GROUP BY amount_cents HAVING n > 1 ORDER BY amount_cents DESC");
show("expenses >= 45000 rows", "SELECT COUNT(*) n FROM expenses WHERE amount_cents >= 45000");
show("expenses rank 2..7 via CTE", "SELECT id, category, amount_cents/100.0 amount, rk FROM (SELECT id, category, amount_cents, RANK() OVER (ORDER BY amount_cents DESC) rk FROM expenses) WHERE rk BETWEEN 2 AND 7 ORDER BY rk, id");

// ---- NEW: biggest order per month (14 rows) ----
show("biggest order per month", "SELECT mon, id, ROUND(total,2) total, rn FROM (SELECT strftime('%Y-%m', created_at) mon, id, total, ROW_NUMBER() OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY total DESC, id) rn FROM orders) WHERE rn = 1 ORDER BY total DESC");

// ---- NEW: biggest line item per product (16 rows) + quantity-distractor check ----
show("biggest line per product", "SELECT name, id, ROUND(line,2) line, rn FROM (SELECT p.name name, oi.id id, oi.quantity * oi.unit_price line, ROW_NUMBER() OVER (PARTITION BY oi.product_id ORDER BY oi.quantity * oi.unit_price DESC) rn FROM order_items oi JOIN products p ON p.id = oi.product_id) WHERE rn = 1 ORDER BY line DESC");
show("distractor check: biggest-quantity pick per product", "SELECT name, id, rn FROM (SELECT p.name name, oi.id id, ROW_NUMBER() OVER (PARTITION BY oi.product_id ORDER BY oi.quantity DESC, oi.id) rn FROM order_items oi JOIN products p ON p.id = oi.product_id) WHERE rn = 1 ORDER BY id");
// compare pick sets directly
show("line-pick vs quantity-pick diff count", `
WITH a AS (SELECT oi.product_id pid, oi.id id FROM order_items oi
           JOIN (SELECT product_id, MAX(quantity * unit_price) mx FROM order_items GROUP BY product_id) m
           ON m.product_id = oi.product_id AND m.mx = oi.quantity * oi.unit_price),
     b AS (SELECT oi.product_id pid, MIN(oi.id) id FROM order_items oi
           JOIN (SELECT product_id, MAX(quantity) mx FROM order_items GROUP BY product_id) m
           ON m.product_id = oi.product_id AND m.mx = oi.quantity
           GROUP BY oi.product_id)
SELECT (SELECT COUNT(*) FROM a) a_n, (SELECT COUNT(*) FROM b) b_n,
       (SELECT COUNT(*) FROM a JOIN b ON a.pid = b.pid AND a.id = b.id) both
`);

// ---- NEW: top-2-per-customer reconciliation counts ----
show("rn<=2 per customer count", "SELECT COUNT(*) n FROM (SELECT ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) rn FROM orders) WHERE rn <= 2");
show("rn<=1 per customer count", "SELECT COUNT(*) n FROM (SELECT ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) rn FROM orders) WHERE rn <= 1");
show("rn<=2 per status count", "SELECT COUNT(*) n FROM (SELECT ROW_NUMBER() OVER (PARTITION BY status ORDER BY total DESC, id) rn FROM orders) WHERE rn <= 2");

// ---- NEW: global vs per-category price rank, price >= 42.5 ----
show("global vs cat rank >= 42.5", "SELECT name, category, price, RANK() OVER (ORDER BY price DESC) overall, RANK() OVER (PARTITION BY category ORDER BY price DESC) cat_rk FROM products WHERE price >= 42.5 ORDER BY overall");
show("price >= 39.99 / >= 50 counts", "SELECT SUM(price >= 39.99) a, SUM(price >= 50) b FROM products");
show("partition-by-price tautology count", "SELECT COUNT(*) n FROM products WHERE price >= price");

// ---- verbatim error re-verification (w3-relevant) ----
const errs: Array<[string, string]> = [
  ["NTILE(0)", "SELECT NTILE(0) OVER (ORDER BY total) t FROM orders LIMIT 1"],
  ["alias inside OVER", "SELECT total AS t, RANK() OVER (ORDER BY t) rk FROM orders LIMIT 1"],
  ["bare RANK()", "SELECT RANK() FROM orders LIMIT 1"],
  ["NTILE in window ORDER BY", "SELECT RANK() OVER (ORDER BY NTILE(2) OVER (ORDER BY total)) rk FROM orders LIMIT 1"],
];
for (const [label, sql] of errs) {
  try {
    db.query(sql).all();
    console.log(`ERRPROBE ${label}: no error`);
  } catch (e) {
    console.log(`ERRPROBE ${label}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
