/// <reference types="bun-types" />
// m5-c3 probe tool — read-only COPY of db/custom.db, self-deleting.
// Every figure used in cases-w3.ts must trace to this output, or to the
// committed receipts (scripts/m5-facts-r3.out, scripts/m5-facts-c3.out, the
// engine-verified header block of src/lib/curriculum/drills/m5/window-rank.ts).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w3.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- P01 status rank blocks (ORDER BY status ASC over all 103 orders) ----
show("status rank blocks", `SELECT status, COUNT(*) n, MIN(rk) start_rk, MAX(rk) end_rk
FROM (SELECT status, RANK() OVER (ORDER BY status) rk FROM orders) GROUP BY status ORDER BY start_rk`);
show("status dense blocks", `SELECT status, MIN(drk) drk FROM
(SELECT status, DENSE_RANK() OVER (ORDER BY status) drk FROM orders) GROUP BY status ORDER BY drk`);

// ---- P02 month order-count ladder (ties) ----
show("month count ladder", `SELECT n, COUNT(*) months, MIN(rk) rk, MIN(drk) drk FROM
(SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n,
        RANK() OVER (ORDER BY COUNT(*) DESC) rk, DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) drk
 FROM orders GROUP BY mon) GROUP BY n ORDER BY n DESC`);
show("months at rk 1 and 3", `SELECT mon, n, rk FROM
(SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n, RANK() OVER (ORDER BY COUNT(*) DESC) rk
 FROM orders GROUP BY mon) WHERE rk IN (1, 3) ORDER BY rk, mon`);

// ---- P03 expense amount ladder blocks (DESC) ----
show("expense amount blocks top8", `SELECT amount_cents, COUNT(*) n, MIN(rk) rk, MIN(drk) drk FROM
(SELECT amount_cents, RANK() OVER (ORDER BY amount_cents DESC) rk,
        DENSE_RANK() OVER (ORDER BY amount_cents DESC) drk FROM expenses)
GROUP BY amount_cents ORDER BY amount_cents DESC LIMIT 8`);
show("cheapest expense", `SELECT id, category, vendor, amount_cents FROM
(SELECT id, category, vendor, amount_cents, RANK() OVER (ORDER BY amount_cents ASC) rk FROM expenses)
WHERE rk = 1`);

// ---- P04 payments league ----
show("payments rank top8", `SELECT id, invoice_id, amount_cents/100.0 amount, method,
RANK() OVER (ORDER BY amount_cents DESC) rk FROM payments ORDER BY rk, id LIMIT 8`);
show("payments tie census", `SELECT amount_cents, COUNT(*) n FROM payments
GROUP BY amount_cents HAVING n > 1 ORDER BY amount_cents DESC`);

// ---- P05 order_items quantity rank blocks (ASC) ----
show("quantity rank blocks", `SELECT quantity, COUNT(*) n, MIN(rk) start_rk, MIN(drk) drk FROM
(SELECT quantity, RANK() OVER (ORDER BY quantity) rk, DENSE_RANK() OVER (ORDER BY quantity) drk
 FROM order_items) GROUP BY quantity ORDER BY quantity`);

// ---- P06 PERCENT_RANK / CUME_DIST on the spend league ----
show("percent+cd spend league", `SELECT name, ROUND(spend,2) spend, ROUND(pct,4) pct, ROUND(cd,4) cd FROM
(SELECT c.name name, SUM(o.total) spend,
        PERCENT_RANK() OVER (ORDER BY SUM(o.total) DESC) pct,
        CUME_DIST() OVER (ORDER BY SUM(o.total) DESC) cd
 FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
WHERE name IN ('Alice Chen','Emma Wilson','Dmitri Volkov','Olivia Brown') ORDER BY pct`);

// ---- P07 ledger account nets ranked plain DESC ----
show("ledger nets ranked desc", `SELECT account, ROUND(SUM(debit_cents-credit_cents)/100.0,2) net,
RANK() OVER (ORDER BY SUM(debit_cents-credit_cents) DESC) rk
FROM ledger_entries GROUP BY account ORDER BY rk`);
show("ledger rows per account", `SELECT account, COUNT(*) n FROM ledger_entries GROUP BY account`);

// ---- P08 NTILE(4) over the 14 order months by spend ----
show("ntile4 month spend census", `SELECT tile, COUNT(*) n, ROUND(MIN(s),2) cut FROM
(SELECT strftime('%Y-%m', created_at) mon, SUM(total) s,
        NTILE(4) OVER (ORDER BY SUM(total) DESC) tile FROM orders GROUP BY mon)
GROUP BY tile ORDER BY tile`);
show("ntile4 month spend tile1", `SELECT mon, ROUND(s,2) spend, tile FROM
(SELECT strftime('%Y-%m', created_at) mon, SUM(total) s,
        NTILE(4) OVER (ORDER BY SUM(total) DESC) tile FROM orders GROUP BY mon)
WHERE tile = 1 ORDER BY s DESC`);

// ---- P09/P10 per-customer top-order staging extras ----
show("rn=2 per customer", `SELECT COUNT(*) n, ROUND(MAX(total),2) mx FROM
(SELECT customer_id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) rn
 FROM orders) WHERE rn = 2`);
show("rn=1 ASC (biggest per-customer minimum)", `SELECT COUNT(*) n, ROUND(MAX(total),2) mx FROM
(SELECT customer_id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total ASC, id) rn
 FROM orders) WHERE rn = 1`);
show("rn<=3 per customer", `SELECT COUNT(*) n, MAX(rn) mx FROM
(SELECT customer_id, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) rn
 FROM orders) WHERE rn <= 3`);
show("rn<=3 per region", `SELECT COUNT(*) n FROM
(SELECT c.region region, ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) rn
 FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id) WHERE rn <= 3`);

// ---- P11/P12 region-name ranker blocks on customers ----
show("region-name ranker blocks", `SELECT region, COUNT(*) n, MIN(rk) rk_lo, MAX(rk) rk_hi,
MIN(drk) drk_lo, MAX(drk) drk_hi, MIN(rn) rn_lo, MAX(rn) rn_hi FROM
(SELECT region, RANK() OVER (ORDER BY region) rk, DENSE_RANK() OVER (ORDER BY region) drk,
        ROW_NUMBER() OVER (ORDER BY region) rn FROM customers) GROUP BY region ORDER BY region`);
show("EU roster at rk 6", `SELECT name, rk, drk FROM
(SELECT name, region, RANK() OVER (ORDER BY region) rk, DENSE_RANK() OVER (ORDER BY region) drk
 FROM customers) WHERE region = 'EU' AND rk = 6 ORDER BY name`);

// ---- P13 cancelled ladder ----
show("cancelled ladder", `SELECT id, ROUND(total,2) total, customer_id,
RANK() OVER (ORDER BY total DESC) rk FROM orders WHERE status = 'cancelled' ORDER BY rk, id`);
show("cancelled totals tie check", `SELECT total, COUNT(*) n FROM orders
WHERE status = 'cancelled' GROUP BY total HAVING n > 1`);
show("max total per status", `SELECT status, ROUND(MAX(total),2) mx FROM orders GROUP BY status`);

// ---- P14 NTILE(3) over the 16 spenders ----
show("ntile3 spenders census", `SELECT tile, COUNT(*) n FROM
(SELECT SUM(o.total) s, NTILE(3) OVER (ORDER BY SUM(o.total) DESC) tile
 FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id) GROUP BY tile ORDER BY tile`);
show("ntile3 spenders wave1", `SELECT c.name name, ROUND(SUM(o.total),2) spend,
NTILE(3) OVER (ORDER BY SUM(o.total) DESC) wave
FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY wave, spend DESC LIMIT 6`);

// ---- P15 order_items unit_price tie pairs ----
show("unit_price tie pairs", `SELECT unit_price, COUNT(*) n, MIN(rk) rk, MIN(drk) drk FROM
(SELECT unit_price, RANK() OVER (ORDER BY unit_price DESC) rk,
        DENSE_RANK() OVER (ORDER BY unit_price DESC) drk FROM order_items)
GROUP BY unit_price HAVING n > 1 ORDER BY unit_price DESC`);
show("unit_price pair rows at 41.38", `SELECT id, order_id, unit_price, rk, twins FROM
(SELECT id, order_id, unit_price, RANK() OVER (ORDER BY unit_price DESC) rk,
        COUNT(*) OVER (PARTITION BY unit_price) twins FROM order_items)
WHERE unit_price = 41.38 ORDER BY id`);

// ---- P16 stock/price threshold counts ----
show("stock >= 100 count", `SELECT COUNT(*) n FROM products WHERE stock >= 100`);
show("price >= 42.5 dual rank", `SELECT name, price,
RANK() OVER (ORDER BY price DESC) overall,
RANK() OVER (PARTITION BY category ORDER BY price DESC) shelf
FROM products WHERE price >= 42.5 ORDER BY overall`);

// ---- P17 NTILE(2) suppliers by rating ----
show("ntile2 suppliers", `SELECT name, rating, NTILE(2) OVER (ORDER BY rating DESC) half
FROM suppliers ORDER BY half, rating DESC`);

// ---- P18 mechanics checks ----
show("group-by alias ok", `SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) n
FROM orders GROUP BY mon ORDER BY mon LIMIT 2`);
show("upper-name vs numeric compare", `SELECT COUNT(*) n FROM
(SELECT UPPER(name) AS chars FROM customers) WHERE chars = 12`);
show("products columns", `SELECT name FROM pragma_table_info('products')`);
show("biggest single-date expense", `SELECT spent_on, SUM(amount_cents)/100.0 s FROM expenses
GROUP BY spent_on ORDER BY s DESC LIMIT 2`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
