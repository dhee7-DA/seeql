// M5-W8 probe — engine-verified receipts for the w8 toolkit-capstone case wave
// (cs-1461…cs-1500). Run: bun scripts/m5-facts-w8.ts — works on a read-only COPY
// of db/custom.db and removes .m5w8.db on exit. Every numeric claim in
// src/lib/curriculum/cases/cases-w8.ts must trace to this output or to the
// committed .out sheets (m5-facts-r4.out, m5-facts-r6.out, m5-facts-d9.ts).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const TMP = ".m5w8.db";
rmSync(TMP, { force: true });
copyFileSync("db/custom.db", TMP);
const db = new Database(TMP, { readonly: true });

console.log("SQLite", (db.prepare("SELECT sqlite_version() AS v").get() as any).v);

const q = (label: string, sql: string) => {
  console.log(`\n## ${label}\n   ${sql.replace(/\s+/g, " ")}`);
  try {
    const rows = db.prepare(sql).all();
    console.log("   " + JSON.stringify(rows));
  } catch (e) {
    console.log("   ERROR: " + (e as Error).message);
  }
};
const err = (label: string, sql: string) => q("ERR·" + label, sql);

// ---------- unshipped exposure (fraud / refund-audit) ----------
q("unshipped status census", `SELECT status, COUNT(*) n, ROUND(SUM(total),2) pot FROM orders WHERE shipped_at IS NULL GROUP BY status ORDER BY n DESC`);
q("unshipped pot grand", `SELECT COUNT(*) n, ROUND(SUM(total),2) pot FROM orders WHERE shipped_at IS NULL`);
q("oldest unshipped", `SELECT MIN(created_at) oldest, COUNT(*) n FROM orders WHERE shipped_at IS NULL`);
q("unshipped before 2024-03", `SELECT COUNT(*) n FROM orders WHERE shipped_at IS NULL AND created_at < '2024-03-01'`);

// ---------- invoices (catalog text buckets) ----------
q("invoice number prefix buckets", `SELECT SUBSTR(number,1,8) k, COUNT(*) n FROM invoices GROUP BY k ORDER BY k`);
q("invoice year via CAST substr", `SELECT CAST(SUBSTR(number,5,4) AS INTEGER) yr, COUNT(*) n FROM invoices GROUP BY yr ORDER BY yr`);
q("invoice amount census (dollars)", `SELECT COUNT(*) n, ROUND(MIN(amount_cents)/100.0,2) lo, ROUND(MAX(amount_cents)/100.0,2) hi, ROUND(SUM(amount_cents)/100.0,2) total FROM invoices`);
q("invoice top by amount", `SELECT number, ROUND(amount_cents/100.0,2) amt FROM invoices ORDER BY amount_cents DESC LIMIT 1`);

// ---------- product name lengths (catalog text) ----------
q("product name length census", `SELECT name, LENGTH(name) len FROM products ORDER BY len DESC LIMIT 3`);
q("product name length min", `SELECT MIN(LENGTH(name)) mn, MAX(LENGTH(name)) mx FROM products`);
q("names 15+ chars", `SELECT COUNT(*) n FROM products WHERE LENGTH(name) >= 15`);
q("names 13+ chars", `SELECT COUNT(*) n FROM products WHERE LENGTH(name) >= 13`);

// ---------- SQL-shape legality checks (used by case templates) ----------
q("single-row aggregate + window mix", `SELECT COUNT(*) n, MAX(total) OVER () biggest FROM orders WHERE status='cancelled'`);
q("HAVING on SELECT alias (exposure)", `SELECT c.name, ROUND(SUM(o.total),2) AS exposure\nFROM orders o JOIN customers c ON c.id = o.customer_id\nWHERE o.status IN ('pending','cancelled')\nGROUP BY c.id\nHAVING exposure = 1615.29`);
err("WHERE on alias of aggregate", `SELECT c.name, SUM(o.total) AS exposure\nFROM orders o JOIN customers c ON c.id = o.customer_id\nWHERE o.status IN ('pending','cancelled')\nGROUP BY c.id\nHAVING 1=1 AND exposure IS NOT NULL AND 0=1 OR exposure IS NULL`);
err("WHERE alias aggregates (plain)", `SELECT customer_id, SUM(total) AS exposure FROM orders WHERE exposure > 1000 GROUP BY customer_id`);
q("pending crowd paint 1dp top", `SELECT id, ROUND(100.0*total / SUM(total) OVER (),1) AS share FROM orders WHERE status='pending' ORDER BY share DESC LIMIT 1`);
q("pending crowd paint 2dp top", `SELECT id, ROUND(100.0*total / SUM(total) OVER (),2) AS share FROM orders WHERE status='pending' ORDER BY share DESC LIMIT 1`);
q("exposure ladder full", `WITH e AS (SELECT c.name name, ROUND(SUM(o.total),2) exposure FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status IN ('pending','cancelled') GROUP BY c.id) SELECT name, exposure, RANK() OVER (ORDER BY exposure DESC) rk FROM e ORDER BY rk`);
q("exposure customer count + pot", `SELECT COUNT(DISTINCT customer_id) custs, ROUND(SUM(total),2) pot FROM orders WHERE status IN ('pending','cancelled')`);

// ---------- region funnel ----------
q("region funnel (orders, rev, share 1dp, rank)", `SELECT c.region, COUNT(*) n, ROUND(SUM(o.total),2) rev,\n ROUND(100.0*SUM(o.total)/SUM(SUM(o.total)) OVER (),1) pct,\n RANK() OVER (ORDER BY SUM(o.total) DESC) rk\nFROM orders o JOIN customers c ON c.id = o.customer_id\nGROUP BY c.region ORDER BY rev DESC`);

// ---------- growth: leaderboard LAG + share + tiles ----------
q("leaderboard with LAG prev_spend", `WITH s AS (SELECT c.name name, ROUND(SUM(o.total),2) spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id) SELECT name, spend, LAG(spend) OVER (ORDER BY spend DESC) prev_spend FROM s ORDER BY spend DESC LIMIT 3`);
q("share of grand 1dp top2", `WITH s AS (SELECT c.name name, SUM(o.total) spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id) SELECT name, ROUND(100.0*spend/SUM(spend) OVER (),1) pct FROM s ORDER BY spend DESC LIMIT 2`);
q("customer spend tiles NTILE(4) + tile spend", `WITH s AS (SELECT c.id cid, SUM(o.total) spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), t AS (SELECT spend, NTILE(4) OVER (ORDER BY spend DESC) tile FROM s) SELECT tile, COUNT(*) n, ROUND(SUM(spend),2) tile_spend, ROUND(100.0*SUM(spend)/(SELECT SUM(total) FROM orders),1) pct FROM t GROUP BY tile ORDER BY tile`);

// ---------- fraud: same-day + jumps ----------
q("same-day repeat count (LAG exact)", `WITH w AS (SELECT id, created_at, LAG(created_at) OVER (ORDER BY created_at, id) prev FROM orders) SELECT COUNT(*) n FROM w WHERE prev = created_at`);
q("jump watchlist > 500 (ASC id)", `WITH w AS (SELECT id, total, total - LAG(total) OVER (ORDER BY id) jump FROM orders) SELECT id, ROUND(total,2) total, ROUND(jump,2) jump FROM w WHERE jump > 500 ORDER BY jump DESC`);
q("jump census", `WITH w AS (SELECT total - LAG(total) OVER (ORDER BY id) jump FROM orders) SELECT (SELECT COUNT(*) FROM w WHERE jump > 500) gt500, (SELECT COUNT(*) FROM w WHERE jump > 400) gt400, (SELECT COUNT(*) FROM w WHERE jump > 600) gt600`);
q("cancelled single-row paint", `SELECT COUNT(*) n, ROUND(MAX(total) OVER (),2) biggest FROM orders WHERE status='cancelled'`);

// ---------- supplier ----------
q("supplier NTILE(3) rating bands", `SELECT band, COUNT(*) n, MIN(rating) lo, MAX(rating) hi FROM (SELECT rating, NTILE(3) OVER (ORDER BY rating DESC) band FROM suppliers) GROUP BY band ORDER BY band`);
q("supplier rating gap to leader", `SELECT name, rating, ROUND(rating - MAX(rating) OVER (),1) gap FROM suppliers ORDER BY rating DESC`);
q("supplier product counts ladder", `SELECT s.name name, COUNT(*) n, RANK() OVER (ORDER BY COUNT(*) DESC) rk FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY rk, name`);
q("supplier catalog value + share 1dp", `WITH v AS (SELECT s.name name, ROUND(SUM(p.price),2) value FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id) SELECT name, value, ROUND(100.0*value/SUM(value) OVER (),1) pct, RANK() OVER (ORDER BY value DESC) rk FROM v ORDER BY rk`);

// ---------- inventory ----------
q("stock below average census", `WITH k AS (SELECT name, stock, AVG(stock) OVER () avg_stock FROM products) SELECT COUNT(*) below FROM k WHERE stock < avg_stock`);
q("stock avg paint", `SELECT name, stock, ROUND(AVG(stock) OVER (),1) avg_stock FROM products LIMIT 2`);
q("stock NTILE(4) census", `SELECT tile, COUNT(*) n, MAX(stock) hi FROM (SELECT stock, NTILE(4) OVER (ORDER BY stock DESC) tile FROM products) GROUP BY tile ORDER BY tile`);
q("stock rank top1", `SELECT name, stock, RANK() OVER (ORDER BY stock DESC) rk FROM products ORDER BY rk LIMIT 1`);

// ---------- pricing ----------
q("price ladder running row4", `SELECT name, price, ROUND(SUM(price) OVER (ORDER BY price),2) running FROM products ORDER BY price LIMIT 4`);
q("price ladder grand", `SELECT ROUND(SUM(price),2) total FROM products`);
q("above-mean product count", `WITH k AS (SELECT price, price - AVG(price) OVER () gap FROM products) SELECT COUNT(*) above FROM k WHERE gap > 0`);
q("category census rank+share", `WITH f AS (SELECT category, COUNT(*) n, ROUND(SUM(price),2) value FROM products GROUP BY category) SELECT category, n, value, ROUND(100.0*value/SUM(value) OVER (),1) pct, RANK() OVER (ORDER BY value DESC) rk FROM f ORDER BY rk`);
q("price NTILE(3) census", `SELECT band, COUNT(*) n, MIN(price) lo, MAX(price) hi FROM (SELECT price, NTILE(3) OVER (ORDER BY price DESC) band FROM products) GROUP BY band ORDER BY band`);
q("price NTILE(4) census", `SELECT band, COUNT(*) n, MIN(price) lo, MAX(price) hi FROM (SELECT price, NTILE(4) OVER (ORDER BY price DESC) band FROM products) GROUP BY band ORDER BY band`);

// ---------- funnel: cohorts + signup rhythm ----------
q("cohort (first-order month) + cumulative", `WITH f AS (SELECT customer_id, MIN(created_at) first_order FROM orders GROUP BY customer_id), c AS (SELECT strftime('%Y-%m', first_order) cohort, COUNT(*) n FROM f GROUP BY cohort) SELECT cohort, n, SUM(n) OVER (ORDER BY cohort) cum FROM c ORDER BY cohort`);
q("signup month census (rerun A14)", `SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM customers GROUP BY mon ORDER BY mon`);
q("order-count board top3", `WITH b AS (SELECT c.name name, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id) SELECT name, n, ROUND(100.0*n/SUM(n) OVER (),1) pct, RANK() OVER (ORDER BY n DESC) rk FROM b ORDER BY rk LIMIT 3`);

// ---------- expense ----------
q("expense monthly running (rerun)", `WITH e AS (SELECT strftime('%Y-%m', spent_on) mon, SUM(amount_cents) spent FROM expenses GROUP BY mon) SELECT mon, ROUND(SUM(spent) OVER (ORDER BY mon)/100.0,2) running FROM e ORDER BY mon`);
q("expense MoM delta line", `WITH e AS (SELECT strftime('%Y-%m', spent_on) mon, SUM(amount_cents)/100.0 spent FROM expenses GROUP BY mon), d AS (SELECT mon, ROUND(spent,2) spend, ROUND(spent - LAG(spent) OVER (ORDER BY mon),2) delta FROM e) SELECT mon, spend, delta FROM d ORDER BY mon`);
q("expense spike row", `WITH e AS (SELECT strftime('%Y-%m', spent_on) mon, SUM(amount_cents)/100.0 spent FROM expenses GROUP BY mon), d AS (SELECT mon, ROUND(spent,2) spend, ROUND(spent - LAG(spent) OVER (ORDER BY mon),2) delta FROM e) SELECT * FROM d WHERE mon='2024-08'`);
q("expense deltas > 200 count", `WITH e AS (SELECT strftime('%Y-%m', spent_on) mon, SUM(amount_cents)/100.0 spent FROM expenses GROUP BY mon), d AS (SELECT mon, ROUND(spent,2) spend, ROUND(spent - LAG(spent) OVER (ORDER BY mon),2) delta FROM e) SELECT COUNT(*) n FROM d WHERE delta > 200`);
q("travel vendor walk", `SELECT id, spent_on, amount_cents/100.0 amt, ROUND(amount_cents/100.0 - LAG(amount_cents)/100.0 OVER (ORDER BY spent_on),2) delta FROM expenses WHERE category='Travel' ORDER BY spent_on`);
q("expense category census", `SELECT category, COUNT(*) n, ROUND(SUM(amount_cents)/100.0,2) total FROM expenses GROUP BY category ORDER BY total DESC`);
q("expense rows 2024-08 detail", `SELECT category, vendor, amount_cents/100.0 amt FROM expenses WHERE strftime('%Y-%m', spent_on)='2024-08' ORDER BY amount_cents DESC`);

// ---------- ops calendar / month-close ----------
q("running revenue line last row (rerun)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon), r AS (SELECT mon, ROUND(SUM(rev) OVER (ORDER BY mon),2) running FROM m) SELECT * FROM r ORDER BY mon DESC LIMIT 2`);
q("NTILE(4) over 14 buckets (rerun)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon) SELECT band, COUNT(*) n FROM (SELECT NTILE(4) OVER (ORDER BY mon) band FROM m) GROUP BY band ORDER BY band`);
q("full-ledger running tail (rerun)", `WITH r AS (SELECT entry_date, id, ROUND(SUM(debit_cents-credit_cents) OVER (ORDER BY entry_date, id)/100.0,2) bal FROM ledger_entries) SELECT * FROM r ORDER BY entry_date DESC, id DESC LIMIT 4`);
q("ledger id-79 row", `WITH r AS (SELECT entry_date, id, ROUND(SUM(debit_cents-credit_cents) OVER (ORDER BY entry_date, id)/100.0,2) bal FROM ledger_entries) SELECT * FROM r WHERE id=79`);
q("opex running Jan-May (rerun)", `WITH e AS (SELECT strftime('%Y-%m', entry_date) mon, SUM(debit_cents) spent FROM ledger_entries WHERE account='operating_expenses' GROUP BY mon) SELECT mon, ROUND(SUM(spent) OVER (ORDER BY mon)/100.0,2) running FROM e ORDER BY mon LIMIT 5`);
q("ledger account census", `SELECT account, COUNT(*) n FROM ledger_entries GROUP BY account ORDER BY n DESC`);
q("ledger AR debit total", `SELECT ROUND(SUM(debit_cents)/100.0,2) deb, COUNT(*) n FROM ledger_entries WHERE account='accounts_receivable' AND debit_cents > 0`);

// ---------- text polish ----------
q("printf pad order ids", `SELECT PRINTF('%04d', id) padded, total FROM orders ORDER BY total DESC LIMIT 1`);
q("alice handle (rerun)", `SELECT SUBSTR(email,1,INSTR(email,'@')-1) handle, LENGTH(email) len FROM customers WHERE id=1`);

// ---------- exact-shape checks for planned case fills ----------
q("product name lengths ranked DESC", `SELECT name, LENGTH(name) len, RANK() OVER (ORDER BY LENGTH(name) DESC) rk FROM products ORDER BY rk, name`);
q("FIRST_VALUE opener on expense stage", `WITH e AS (SELECT strftime('%Y-%m', spent_on) mon, SUM(amount_cents) spent FROM expenses GROUP BY mon) SELECT ROUND(FIRST_VALUE(spent) OVER (ORDER BY mon)/100.0,2) opener FROM e ORDER BY mon LIMIT 1`);
q("unshipped split rows (HAVING OR)", `SELECT status, COUNT(*) n, ROUND(SUM(SUM(total)) OVER (), 2) unshipped_pot FROM orders WHERE shipped_at IS NULL GROUP BY status HAVING COUNT(*) = 7 OR COUNT(*) = 14`);
q("thin-stock running line", `SELECT name, stock, ROUND(SUM(stock) OVER (ORDER BY stock ASC), 2) thin_run FROM products WHERE stock <= 70 ORDER BY stock`);
q("signup final bucket", `SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n, SUM(COUNT(*)) OVER () roster FROM customers GROUP BY mon HAVING mon = '2024-07'`);
q("shipped rows at cancelled flag prices", `SELECT COUNT(*) n FROM orders WHERE status='shipped' AND total IN (397.99, 206.19)`);
q("expense category fold paint", `SELECT category, COUNT(*) n, ROUND(SUM(amount_cents)/100.0, 2) total, SUM(COUNT(*)) OVER () receipts FROM expenses GROUP BY category HAVING total = 16800`);
q("price-pool of above-mean products", `WITH g AS (SELECT price, ROUND(price - AVG(price) OVER (), 2) gap FROM products) SELECT COUNT(*) above, ROUND(MAX(gap),2) biggest_gap, ROUND(SUM(price),2) price_pool FROM g WHERE gap > 0`);
q("nordic value vs stock ranks", `WITH v AS (SELECT s.name name, ROUND(SUM(p.price),2) value, SUM(p.stock) units FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), r AS (SELECT name, value, units, RANK() OVER (ORDER BY value DESC) vrk, RANK() OVER (ORDER BY units ASC) srk FROM v) SELECT * FROM r WHERE name = 'Nordic Gadgets AB'`);
q("invoice top share 1dp", `SELECT number, ROUND(amount_cents/100.0, 2) amt, ROUND(100.0 * amount_cents / SUM(amount_cents) OVER (), 1) share FROM invoices WHERE amount_cents = (SELECT MAX(amount_cents) FROM invoices)`);
q("invoice prefix bucket row", `SELECT SUBSTR(number, 1, 8) prefix, COUNT(*) n, SUM(COUNT(*)) OVER () all_invoices FROM invoices GROUP BY prefix HAVING prefix LIKE 'INV-2025%'`);

// ---------- verbatim errors for distractor whys ----------
err("NTILE(0) in template shape", `SELECT NTILE(0) OVER (ORDER BY total) band FROM orders LIMIT 1`);
err("LAG no OVER", `SELECT LAG(total) FROM orders LIMIT 1`);
err("window in WHERE", `SELECT id FROM orders WHERE RANK() OVER (ORDER BY total) = 1`);
err("alias of window in WHERE", `SELECT id, RANK() OVER (ORDER BY total) rk FROM orders WHERE rk = 1`);
err("no such column outside stage", `SELECT SUM(rev) OVER (ORDER BY mon) FROM orders`);
err("ORDER before PARTITION", `SELECT SUM(total) OVER (ORDER BY id PARTITION BY customer_id) FROM orders LIMIT 1`);
err("strftime bad code", `SELECT strftime('%K', created_at) FROM orders LIMIT 1`);

// ---------- wave-authoring confirmations (cs-1461…cs-1500) ----------
// cs-1461 ops-calendar landing
q("calendar landing fill", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon), r AS (SELECT mon, rev, SUM(rev) OVER (ORDER BY mon) AS running FROM m) SELECT mon, ROUND(rev,2) rev, ROUND(running,2) running FROM r WHERE mon = '2025-02' AND running = 34833.28`);
// cs-1462 unshipped fold paint variants
q("unshipped fold MAX paint", `SELECT status, COUNT(*) n, ROUND(SUM(SUM(total)) OVER (),2) unshipped_pot FROM orders WHERE shipped_at IS NULL GROUP BY status HAVING COUNT(*) = 7 OR COUNT(*) = 14`);
q("unshipped fold AVG paint", `SELECT status, COUNT(*) n, ROUND(AVG(SUM(total)) OVER (),2) p FROM orders WHERE shipped_at IS NULL GROUP BY status HAVING COUNT(*) = 7 OR COUNT(*) = 14`);
// cs-1463 cheap ladder rung + AVG variant
q("cheap ladder AVG rung at yoga mat", `WITH ladder AS (SELECT name, price, AVG(price) OVER (ORDER BY price, id) AS running FROM products) SELECT name, ROUND(running,4) running FROM ladder WHERE name = 'Yoga Mat Eco 6mm'`);
q("cheap ladder smart watch rung", `WITH ladder AS (SELECT name, price, SUM(price) OVER (ORDER BY price, id) AS running FROM products) SELECT name, ROUND(running,2) running FROM ladder WHERE name = 'Smart Watch S'`);
// cs-1464 supplier value league rank + LAG
q("supplier value league rank+lag", `WITH v AS (SELECT s.name name, ROUND(SUM(p.price),2) value FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), l AS (SELECT name, value, RANK() OVER (ORDER BY value DESC) rk, LAG(value) OVER (ORDER BY value DESC) prev FROM v) SELECT name, value, rk, prev FROM l ORDER BY rk`);
// cs-1465 region mix fill (rerun) + EU cross
q("region mix APAC row", `WITH f AS (SELECT c.region region, COUNT(*) n, ROUND(SUM(o.total),2) rev FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region), x AS (SELECT region, n, rev, ROUND(100.0*rev/SUM(rev) OVER (),1) pct, RANK() OVER (ORDER BY rev DESC) rk FROM f) SELECT region, n, rev, pct, rk FROM x WHERE region = 'APAC' AND rev = 11605.45 AND pct = 33.3`);
// cs-1467 above-own-mean fill
q("above-own-mean fill", `WITH s AS (SELECT c.name name, ROUND(SUM(o.total),2) spend, ROUND(AVG(SUM(o.total)) OVER (),2) mean FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), k AS (SELECT name, spend, spend - mean AS headroom FROM s WHERE spend > mean) SELECT COUNT(*) above, ROUND(MAX(headroom),2) top_headroom FROM k HAVING COUNT(*) = 5`);
// cs-1468 thin-stock tail variants
q("thin-stock tail fill", `WITH tail AS (SELECT name, stock, SUM(stock) OVER (ORDER BY stock, id) AS running FROM products WHERE stock <= 70) SELECT name, stock, running FROM tail WHERE name = 'Noise-Canceling Headset' AND running = 145`);
q("thin-stock tail avg rung", `WITH tail AS (SELECT name, stock, AVG(stock) OVER (ORDER BY stock, id) AS running FROM products WHERE stock <= 70) SELECT name, ROUND(running,4) running FROM tail WHERE name = 'Noise-Canceling Headset'`);
// cs-1469 invoice year split variants
q("invoice year split fill", `WITH years AS (SELECT CAST(SUBSTR(number, 5, 4) AS INTEGER) AS yr FROM invoices), y AS (SELECT yr, COUNT(*) AS n, SUM(COUNT(*)) OVER () AS stack FROM years GROUP BY yr) SELECT yr, n, stack FROM y WHERE yr = 2025 AND stack = 28`);
q("invoice year substr start 6", `SELECT CAST(SUBSTR(number, 6, 4) AS INTEGER) yr, COUNT(*) n FROM invoices GROUP BY yr`);
q("invoice year substr start 23", `SELECT CAST(SUBSTR(number, 23, 4) AS INTEGER) yr, COUNT(*) n FROM invoices GROUP BY yr`);
// cs-1470 ledger zero + MAX paint
q("ledger zero fill", `WITH r AS (SELECT entry_date, id, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) AS bal FROM ledger_entries) SELECT id, entry_date, bal FROM r WHERE id = 80 AND bal = 0`);
q("ledger MAX paint at id 80", `WITH r AS (SELECT entry_date, id, ROUND(MAX(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) AS bal FROM ledger_entries) SELECT id, bal FROM r WHERE id = 80`);
// cs-1471 burn anchor variants
q("burn anchor fill", `WITH e AS (SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spent FROM expenses GROUP BY mon), a AS (SELECT mon, spent, FIRST_VALUE(spent) OVER (ORDER BY mon) AS anchor FROM e) SELECT mon, spent/100.0 spend, anchor/100.0 anchor FROM a WHERE mon = '2025-02' AND anchor/100.0 = 1719`);
q("burn anchor LAST_VALUE variant", `WITH e AS (SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spent FROM expenses GROUP BY mon), a AS (SELECT mon, spent, LAST_VALUE(spent) OVER (ORDER BY mon) AS anchor FROM e) SELECT mon, anchor/100.0 anchor FROM a WHERE mon = '2025-02'`);
// cs-1472 jump watchlist fill + variants
q("jump watchlist fill", `WITH w AS (SELECT id, total, total - LAG(total) OVER (ORDER BY id) AS jump FROM orders), k AS (SELECT id, ROUND(total,2) total, ROUND(jump,2) jump, RANK() OVER (ORDER BY jump DESC) rk FROM w WHERE jump > 500) SELECT id, total, jump, rk FROM k WHERE rk = 1 AND jump = 770.45`);
q("jump watchlist rk2", `WITH w AS (SELECT id, total, total - LAG(total) OVER (ORDER BY id) AS jump FROM orders), k AS (SELECT id, ROUND(jump,2) jump, RANK() OVER (ORDER BY jump DESC) rk FROM w WHERE jump > 500) SELECT id, jump, rk FROM k WHERE rk = 2`);
q("jump > 852.44 count", `WITH w AS (SELECT total - LAG(total) OVER (ORDER BY id) AS jump FROM orders) SELECT COUNT(*) n FROM w WHERE jump > 852.44`);
// cs-1473 calendar tiles band spends
q("calendar tiles ASC band spends", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon), t AS (SELECT mon, rev, NTILE(4) OVER (ORDER BY mon ASC) AS band FROM m) SELECT band, ROUND(SUM(rev),2) band_spend FROM t GROUP BY band ORDER BY band`);
q("calendar tiles DESC band spends", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon), t AS (SELECT mon, rev, NTILE(4) OVER (ORDER BY mon DESC) AS band FROM m) SELECT band, ROUND(SUM(rev),2) band_spend FROM t GROUP BY band ORDER BY band`);
// cs-1474 leaderboard runner-up fill
q("leaderboard runner-up fill", `WITH s AS (SELECT c.name name, ROUND(SUM(o.total),2) spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), l AS (SELECT name, spend, RANK() OVER (ORDER BY spend DESC) rk, LAG(spend) OVER (ORDER BY spend DESC) prev FROM s) SELECT name, spend, rk, prev FROM l WHERE name = 'Emma Wilson' AND prev = 7262.35 AND rk = 2`);
// cs-1475 pending queue silences
q("pending queue gap ladder", `WITH q AS (SELECT id, strftime('%Y-%m-%d', created_at) d, CAST(julianday(created_at) - LAG(julianday(created_at)) OVER (ORDER BY created_at, id) AS INTEGER) gap FROM orders WHERE status = 'pending') SELECT id, d, gap FROM q ORDER BY d, id`);
q("shipped queue max gap", `WITH q AS (SELECT CAST(julianday(created_at) - LAG(julianday(created_at)) OVER (ORDER BY created_at, id) AS INTEGER) gap FROM orders WHERE status = 'shipped') SELECT MAX(gap) max_gap FROM q`);
// cs-1476 price tiles fill
q("price tiles fill", `WITH t AS (SELECT price, NTILE(4) OVER (ORDER BY price DESC) AS band FROM products), s AS (SELECT band, ROUND(SUM(price),2) tile_price, ROUND(100.0*SUM(price)/SUM(SUM(price)) OVER (),1) pct FROM t GROUP BY band) SELECT band, tile_price, pct FROM s WHERE band = 1 AND tile_price = 597.98 AND pct = 52.1`);
// cs-1477 same-day twins under total tie-breaker
q("twins id-order fill", `WITH w AS (SELECT id, created_at, LAG(created_at) OVER (ORDER BY created_at, id) AS prev FROM orders), k AS (SELECT id, created_at, prev FROM w WHERE created_at = prev) SELECT COUNT(*) twins, MAX(id) last_twin FROM k HAVING COUNT(*) = 19`);
q("twins total-order variant", `WITH w AS (SELECT id, created_at, LAG(created_at) OVER (ORDER BY created_at, total) AS prev FROM orders), k AS (SELECT id, created_at, prev FROM w WHERE created_at = prev) SELECT COUNT(*) twins, MAX(id) last_twin FROM k`);
// cs-1478 account nets fill + MAX paint
q("account nets fill", `WITH nets AS (SELECT account, ROUND(SUM(debit_cents - credit_cents) / 100.0, 2) AS net FROM ledger_entries GROUP BY account), p AS (SELECT account, net, ROUND(SUM(net) OVER (), 2) AS books FROM nets) SELECT account, net, books FROM p WHERE account = 'sales_revenue' AND net = -86052 AND books = 0`);
q("account nets MAX paint books", `WITH nets AS (SELECT account, ROUND(SUM(debit_cents - credit_cents) / 100.0, 2) AS net FROM ledger_entries GROUP BY account), p AS (SELECT account, net, ROUND(MAX(net) OVER (), 2) AS books FROM nets) SELECT account, books FROM p WHERE account = 'sales_revenue'`);
// cs-1479 rating gap fill
q("rating gap fill", `WITH g AS (SELECT name, rating, ROUND(rating - MAX(rating) OVER (), 1) AS gap FROM suppliers) SELECT name, rating, gap FROM g WHERE name = 'Pacific Textiles' AND gap = -0.9`);
// cs-1480 prefix fold fill
q("prefix fold fill", `WITH p AS (SELECT SUBSTR(number, 1, 8) AS prefix, COUNT(*) AS n, SUM(COUNT(*)) OVER () AS stack FROM invoices GROUP BY prefix) SELECT prefix, n, stack FROM p WHERE prefix = 'INV-2025' AND n = 5 AND stack = 28`);
// cs-1481 cohort staircase fill + MAX paint
q("cohort staircase fill", `WITH f AS (SELECT customer_id, MIN(created_at) AS first_order FROM orders GROUP BY customer_id), c AS (SELECT strftime('%Y-%m', first_order) AS cohort, COUNT(*) AS n FROM f GROUP BY cohort), s AS (SELECT cohort, n, SUM(n) OVER (ORDER BY cohort) AS cum FROM c) SELECT cohort, n, cum FROM s WHERE cohort = '2025-01' AND cum = 16`);
q("cohort staircase MAX paint", `WITH f AS (SELECT customer_id, MIN(created_at) AS first_order FROM orders GROUP BY customer_id), c AS (SELECT strftime('%Y-%m', first_order) AS cohort, COUNT(*) AS n FROM f GROUP BY cohort), s AS (SELECT cohort, n, MAX(n) OVER (ORDER BY cohort) AS cum FROM c) SELECT cohort, cum FROM s WHERE cohort = '2025-01'`);
// cs-1482 stock bands variants
q("stock bands DESC fill", `WITH t AS (SELECT name, stock, NTILE(4) OVER (ORDER BY stock DESC) AS band FROM products) SELECT band, COUNT(*) n, MAX(stock) hi FROM t GROUP BY band HAVING band = 2 AND hi = 220`);
q("stock bands ASC band2 hi", `WITH t AS (SELECT stock, NTILE(4) OVER (ORDER BY stock ASC) AS band FROM products) SELECT band, MAX(stock) hi FROM t GROUP BY band ORDER BY band`);
// cs-1483 spend tiles fill + MAX paint
q("spend tiles fill", `WITH s AS (SELECT c.id cid, SUM(o.total) spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), t AS (SELECT spend, NTILE(4) OVER (ORDER BY spend DESC) AS band FROM s), x AS (SELECT band, COUNT(*) n, ROUND(SUM(spend),2) tile_spend, ROUND(100.0*SUM(spend)/SUM(SUM(spend)) OVER (),1) pct FROM t GROUP BY band) SELECT band, n, tile_spend, pct FROM x WHERE band = 1 AND pct = 63.5`);
q("spend tiles MAX paint pct", `WITH s AS (SELECT c.id cid, SUM(o.total) spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), t AS (SELECT spend, NTILE(4) OVER (ORDER BY spend DESC) AS band FROM s), x AS (SELECT band, ROUND(100.0*SUM(spend)/MAX(SUM(spend)) OVER (),1) pct FROM t GROUP BY band) SELECT band, pct FROM x WHERE band = 1`);
// cs-1484 one-line close variants
q("one-line close fill", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02' AND running = 34833.28`);
q("one-line close COUNT painter", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02'`);
q("one-line close ROUND painter", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(ROUND(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02'`);
err("one-line close alias inside OVER", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(SUM(total)) OVER (ORDER BY mon), 2) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02'`);
err("one-line close ORDER BY COUNT", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(SUM(total)) OVER (ORDER BY COUNT), 2) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02'`);
// cs-1485 rent fold COUNT paint
q("rent fold COUNT paint", `WITH f AS (SELECT category, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS total, COUNT(COUNT(*)) OVER () AS receipts FROM expenses GROUP BY category) SELECT category, n, total, receipts FROM f WHERE category = 'Rent' AND total = 16800`);
// cs-1486 exposure rank + pot
q("exposure rank+pot fill", `WITH e AS (SELECT c.name name, ROUND(SUM(o.total),2) exposure FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status IN ('pending','cancelled') GROUP BY c.id), p AS (SELECT name, exposure, RANK() OVER (ORDER BY exposure DESC) rk, SUM(exposure) OVER () AS pot FROM e) SELECT name, exposure, rk, ROUND(pot,2) pot FROM p WHERE name = 'Farid Nasser' AND rk = 4 AND pot = 7265.49`);
q("exposure MAX paint", `WITH e AS (SELECT c.name name, ROUND(SUM(o.total),2) exposure FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status IN ('pending','cancelled') GROUP BY c.id), p AS (SELECT name, MAX(exposure) OVER () AS pot FROM e) SELECT name, pot FROM p WHERE name = 'Farid Nasser'`);
// cs-1487 below-mean gaps
q("below-mean gap extremes", `WITH k AS (SELECT name, stock, ROUND(AVG(stock) OVER (), 1) AS avg_stock FROM products), f AS (SELECT name, stock, avg_stock, ROUND(stock - avg_stock, 1) AS gap FROM k WHERE stock < avg_stock) SELECT COUNT(*) below, MIN(gap) worst, MAX(gap) shallowest FROM f`);
q("below-mean fill", `WITH k AS (SELECT name, stock, ROUND(AVG(stock) OVER (), 1) AS avg_stock FROM products), f AS (SELECT name, stock, avg_stock, ROUND(stock - avg_stock, 1) AS gap FROM k WHERE stock < avg_stock) SELECT COUNT(*) below, MIN(gap) worst FROM f HAVING COUNT(*) = 9 AND MIN(gap) = -137.8`);
// cs-1488 biggest step down + LEAD variant
q("step down fill", `WITH w AS (SELECT id, total, total - LAG(total) OVER (ORDER BY id) AS jump FROM orders), k AS (SELECT id, ROUND(total,2) total, ROUND(jump,2) jump FROM w) SELECT id, total, jump FROM k WHERE jump = -814.8 AND id = 75`);
q("step down LEAD variant", `WITH w AS (SELECT id, total, total - LEAD(total) OVER (ORDER BY id) AS jump FROM orders), k AS (SELECT id, ROUND(jump,2) jump FROM w) SELECT COUNT(*) n FROM k WHERE jump = -814.8`);
// cs-1489 dual crown variants
q("dual crown fill", `WITH v AS (SELECT s.name name, ROUND(SUM(p.price),2) value, SUM(p.stock) units FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), r AS (SELECT name, value, units, RANK() OVER (ORDER BY value DESC) vrk, RANK() OVER (ORDER BY units ASC) srk FROM v) SELECT name, value, units, vrk, srk FROM r WHERE name = 'Nordic Gadgets AB' AND value = 418.98 AND srk = 1`);
q("dual crown DESC srk", `WITH v AS (SELECT s.name name, SUM(p.stock) units FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), r AS (SELECT name, units, RANK() OVER (ORDER BY units DESC) srk FROM v) SELECT name, srk FROM r WHERE name = 'Nordic Gadgets AB'`);
err("dual crown string in OVER ORDER BY", `WITH v AS (SELECT s.name name, SUM(p.stock) units FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), r AS (SELECT name, units, RANK() OVER (ORDER BY units 'Alpine Audio GmbH') srk FROM v) SELECT name, srk FROM r`);
// cs-1490 billing calendar running
q("billing monthly running", `WITH m AS (SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents)/100.0 AS billed FROM invoices GROUP BY mon), r AS (SELECT mon, billed, SUM(billed) OVER (ORDER BY mon) AS running FROM m) SELECT mon, ROUND(billed,2) billed, ROUND(running,2) running FROM r ORDER BY mon`);
q("billing AVG running at 2025-02", `WITH m AS (SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents)/100.0 AS billed FROM invoices GROUP BY mon), r AS (SELECT mon, billed, AVG(billed) OVER (ORDER BY mon) AS running FROM m) SELECT mon, ROUND(running,2) running FROM r WHERE mon = '2025-02'`);
// cs-1491 opex spike share
q("opex spike share fill", `WITH e AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents)/100.0 AS spend FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mon), p AS (SELECT mon, spend, ROUND(100.0*spend/SUM(spend) OVER (),1) pct FROM e) SELECT mon, ROUND(spend,2) spend, pct FROM p WHERE mon = '2024-08' AND spend = 3210 AND pct = 12.6`);
q("opex spike sales_revenue variant", `WITH e AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents)/100.0 AS spend FROM ledger_entries WHERE account = 'sales_revenue' GROUP BY mon) SELECT mon, spend FROM e WHERE mon = '2024-08'`);
q("opex spike MAX paint pct", `WITH e AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents)/100.0 AS spend FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mon), p AS (SELECT mon, spend, ROUND(100.0*spend/MAX(spend) OVER (),1) pct FROM e) SELECT mon, pct FROM p WHERE mon = '2024-08'`);
// cs-1492 modal ship day fill + variants
q("modal ship day fill", `WITH d AS (SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS days, COUNT(*) AS n, SUM(COUNT(*)) OVER () AS shipped_total FROM orders WHERE shipped_at IS NOT NULL GROUP BY days) SELECT days, n, shipped_total FROM d WHERE days = 3 AND n = 30`);
q("modal ship day MAX paint", `WITH d AS (SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS days, COUNT(*) AS n, MAX(COUNT(*)) OVER () AS shipped_total FROM orders WHERE shipped_at IS NOT NULL GROUP BY days) SELECT days, n, shipped_total FROM d WHERE days = 3 AND n = 30`);
q("modal ship day constant WHERE", `WITH d AS (SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS days, COUNT(*) AS n, SUM(COUNT(*)) OVER () AS shipped_total FROM orders WHERE 25 GROUP BY days) SELECT days, n, shipped_total FROM d WHERE days = 3 AND n = 30`);
// cs-1493 activity board fill
q("activity board fill", `WITH b AS (SELECT c.name name, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), x AS (SELECT name, n, ROUND(100.0*n/SUM(n) OVER (),1) pct, RANK() OVER (ORDER BY n DESC) rk FROM b) SELECT name, n, pct, rk FROM x WHERE name = 'Grace Kim' AND n = 14 AND pct = 13.6`);
// cs-1494 year split fill + paints
q("year split fill", `WITH y AS (SELECT strftime('%Y', created_at) AS yr, COUNT(*) AS n, SUM(total) AS spend FROM orders GROUP BY yr), p AS (SELECT yr, n, ROUND(spend,2) spend, ROUND(100.0*spend/SUM(spend) OVER (),1) pct, COUNT(n) OVER () AS buckets FROM y) SELECT yr, n, spend, pct, buckets FROM p WHERE yr = '2025' AND spend = 4060.03`);
q("year split MAX paint pct", `WITH y AS (SELECT strftime('%Y', created_at) AS yr, COUNT(*) AS n, SUM(total) AS spend FROM orders GROUP BY yr), p AS (SELECT yr, ROUND(100.0*spend/MAX(spend) OVER (),1) pct FROM y) SELECT yr, pct FROM p WHERE yr = '2025'`);
// cs-1495 waiting pile fill (SUM(COUNT(*)) — alias n is invisible to the window arg)
q("waiting pile fill", `WITH c AS (SELECT status, COUNT(*) AS n, SUM(shipped_at IS NULL) AS waiting, SUM(COUNT(*)) OVER () AS fleet FROM orders GROUP BY status) SELECT status, n, waiting, fleet FROM c WHERE status = 'pending' AND waiting = 14 AND fleet = 103`);
q("waiting pile MAX paint", `WITH c AS (SELECT status, COUNT(*) AS n, SUM(shipped_at IS NULL) AS waiting, MAX(COUNT(*)) OVER () AS fleet FROM orders GROUP BY status) SELECT status, n, waiting, fleet FROM c WHERE status = 'pending' AND waiting = 14`);
// cs-1499 unshipped aging walk
q("unshipped aging walk", `WITH u AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders WHERE shipped_at IS NULL GROUP BY mon), r AS (SELECT mon, n, SUM(n) OVER (ORDER BY mon) AS aging FROM u) SELECT mon, n, aging FROM r ORDER BY mon`);
q("unshipped aging COUNT painter", `WITH u AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders WHERE shipped_at IS NULL GROUP BY mon), r AS (SELECT mon, n, COUNT(n) OVER (ORDER BY mon) AS aging FROM u) SELECT mon, aging FROM r WHERE mon = '2024-11'`);
q("unshipped aging all-orders variant", `WITH u AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders WHERE 14 GROUP BY mon), r AS (SELECT mon, n, SUM(n) OVER (ORDER BY mon) AS aging FROM u) SELECT mon, n, aging FROM r WHERE mon = '2024-11'`);
q("unshipped aging 2024-10 rung", `WITH u AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders WHERE shipped_at IS NULL GROUP BY mon), r AS (SELECT mon, n, SUM(n) OVER (ORDER BY mon) AS aging FROM u) SELECT mon, n, aging FROM r WHERE mon = '2024-10'`);
q("shipped aging at 2024-11", `WITH u AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders WHERE shipped_at IS NOT NULL GROUP BY mon), r AS (SELECT mon, n, SUM(n) OVER (ORDER BY mon) AS aging FROM u) SELECT mon, n, aging FROM r WHERE mon = '2024-11'`);
// cs-1496 mean-gap fill + MAX variant
q("mean-gap fill", `WITH g AS (SELECT name, price, ROUND(price - AVG(price) OVER (), 2) AS gap FROM products) SELECT name, price, gap FROM g WHERE gap = 128.21 AND price = 199.99`);
q("mean-gap MAX variant", `WITH g AS (SELECT name, price, ROUND(price - MAX(price) OVER (), 2) AS gap FROM products) SELECT COUNT(*) n FROM g WHERE gap = 128.21`);
q("mean-gap 71.78 pin", `WITH g AS (SELECT name, price, ROUND(price - AVG(price) OVER (), 2) AS gap FROM products) SELECT COUNT(*) n FROM g WHERE gap = 71.78`);
// cs-1497 invoice year walk fill
q("invoice year walk fill", `WITH y AS (SELECT CAST(SUBSTR(number, 5, 4) AS INTEGER) AS yr FROM invoices), f AS (SELECT yr, COUNT(*) AS n, SUM(COUNT(*)) OVER (ORDER BY yr) AS running, SUM(COUNT(*)) OVER () AS stack FROM y GROUP BY yr) SELECT yr, n, running, stack FROM f WHERE yr = 2025 AND n = 5`);
q("invoice year walk COUNT paint", `WITH y AS (SELECT CAST(SUBSTR(number, 5, 4) AS INTEGER) AS yr FROM invoices), f AS (SELECT yr, COUNT(*) AS n, COUNT(COUNT(*)) OVER (ORDER BY yr) AS running FROM y GROUP BY yr) SELECT yr, n, running FROM f WHERE yr = 2025`);
// cs-1498 rating bands fill + variants
q("rating bands fill", `WITH b AS (SELECT rating, NTILE(3) OVER (ORDER BY rating DESC) AS band FROM suppliers) SELECT band, COUNT(*) AS n, MIN(rating) AS lo, MAX(rating) AS hi FROM b GROUP BY band HAVING band = 1 AND MIN(rating) = 4.6 AND COUNT(*) = 2`);
q("rating bands band3", `WITH b AS (SELECT rating, NTILE(3) OVER (ORDER BY rating DESC) AS band FROM suppliers) SELECT band, MIN(rating) lo FROM b GROUP BY band ORDER BY band`);
// cs-1499 pending silence fill + shipped variant
q("pending silence fill", `WITH q AS (SELECT id, created_at, CAST(julianday(created_at) - LAG(julianday(created_at)) OVER (ORDER BY created_at, id) AS INTEGER) AS gap FROM orders WHERE status = 'pending') SELECT id, created_at, gap FROM q WHERE gap = 90 AND id = 74`);
q("pending gap 43 census", `WITH q AS (SELECT id, CAST(julianday(created_at) - LAG(julianday(created_at)) OVER (ORDER BY created_at, id) AS INTEGER) AS gap FROM orders WHERE status = 'pending') SELECT COUNT(*) n FROM q WHERE gap = 43`);
// cs-1500 region wall openers fill + variants
q("region wall fill", `WITH w AS (SELECT c.name name, c.region region, o.total, LAG(o.total) OVER (PARTITION BY c.region ORDER BY o.created_at, o.id) AS prev FROM orders o JOIN customers c ON c.id = o.customer_id) SELECT region, name, ROUND(total,2) total, ROUND(prev,2) prev FROM w WHERE region = 'US' AND total = 725.34 AND prev IS NULL`);
q("region wall US not-null variant", `WITH w AS (SELECT c.name name, c.region region, o.total, LAG(o.total) OVER (PARTITION BY c.region ORDER BY o.created_at, o.id) AS prev FROM orders o JOIN customers c ON c.id = o.customer_id) SELECT COUNT(*) n FROM w WHERE region = 'US' AND total = 725.34 AND prev IS NOT NULL`);

db.close();
rmSync(TMP, { force: true });
console.log("\n(done — temp db removed)");
