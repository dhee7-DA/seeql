// M5 R7 probe — engine-verified receipts for the case wave cs-1461…cs-1500
// (w7 type & cast ×22 + w8 toolkit capstone ×18).
// Run: bun scripts/m5-facts-r7.ts — read-only COPY of db/custom.db (.m5c-r7.db),
// removed on exit. Every numeric claim in cases-r7.ts must trace to this output.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const TMP = ".m5c-r7.db";
rmSync(TMP, { force: true });
copyFileSync("db/custom.db", TMP);
const db = new Database(TMP, { readonly: true });

console.log("SQLite", (db.prepare("SELECT sqlite_version() AS v").get() as any).v);

const q = (label: string, sql: string, max = 30) => {
  console.log(`\n## ${label}\n   ${sql.replace(/\s+/g, " ")}`);
  try {
    const rows = db.prepare(sql).all() as Record<string, unknown>[];
    const shown = rows.slice(0, max).map(r => Object.values(r).map(v =>
      v === null ? "NULL" : String(v)
    ).join(" | "));
    console.log(`   (${rows.length} rows)`);
    shown.forEach(s => console.log("   " + s));
    if (rows.length > max) console.log(`   … +${rows.length - max} more`);
  } catch (e) {
    console.log("   ERROR: " + (e as Error).message);
  }
};
const err = (label: string, sql: string) => q("ERR·" + label, sql);

// ===== w7: typeof / diagnose =====
q("R01 status census", `SELECT status, COUNT(*) n, ROUND(SUM(total),2) sum_total FROM orders GROUP BY status ORDER BY n DESC`);
q("R02 typeof ledger cols", `SELECT typeof(debit_cents) d, typeof(credit_cents) c, typeof(account) a, typeof(memo) m, typeof(entry_date) e FROM ledger_entries LIMIT 1`);
q("R03 ledger debit rows", `SELECT COUNT(*) n, SUM(debit_cents) s FROM ledger_entries WHERE debit_cents > 0`);
q("R04 typeof(active) + sums", `SELECT typeof(active) cls, SUM(active) live, SUM(1 - active) dead, AVG(active) avg_flag, COUNT(*) n FROM customers`);
q("R05 EU actives", `SELECT COUNT(*) n, SUM(active) live FROM customers WHERE region = 'EU'`);
q("R06 typeof big order row", `SELECT id, typeof(status) status_cls, typeof(total) total_cls, strftime('%Y-%m', created_at) mon, status FROM orders WHERE total = (SELECT MAX(total) FROM orders)`);
q("R07 refunded vs pending filters", `SELECT COUNT(*) FILTER (WHERE status = 'refunded') ref, COUNT(*) FILTER (WHERE status = 'pending') pend FROM orders WHERE status IN ('refunded','pending')`);
q("R08 typeof aggregates", `SELECT typeof(SUM(total)) s, typeof(COUNT(*)) c, typeof(AVG(total)) a, typeof(SUM(debit_cents)) sd FROM orders, ledger_entries LIMIT 1`);
q("R09 refunded distinct customers", `SELECT COUNT(*) n, COUNT(DISTINCT customer_id) custs, ROUND(SUM(total),2) value FROM orders WHERE status = 'refunded'`);

// ===== w7: truncate vs round =====
q("R10 product price sums", `SELECT SUM(CAST(price AS INTEGER)) floor_sum, ROUND(SUM(price),2) raw_sum, SUM(ROUND(price)) round_sum, COUNT(*) n FROM products`);
q("R11 price valuation (inventory clip)", `SELECT SUM(CAST(price AS INTEGER) * stock) floor_val, ROUND(SUM(price * stock),2) true_val, COUNT(*) n FROM products WHERE stock > 0`);
q("R12 opex AVG cents trio", `SELECT AVG(debit_cents) raw_avg, CAST(AVG(debit_cents) AS INTEGER) floor_avg, ROUND(AVG(debit_cents)) round_avg, COUNT(*) n FROM ledger_entries WHERE account = 'operating_expenses'`);
q("R13 supplier ratings", `SELECT id, name, rating, CAST(rating AS INTEGER) floor_r, ROUND(rating) round_r FROM suppliers ORDER BY rating DESC`);
q("R14 AVG(price) trio", `SELECT AVG(price) raw, CAST(AVG(price) AS INTEGER) floor_a, ROUND(AVG(price)) round_a FROM products`);
q("R15 price >= thresholds", `SELECT SUM(price >= 100) p100, SUM(price >= 150) p150, SUM(price >= 50) p50, SUM(price >= 200) p200 FROM products`);
q("R16 active avg trio", `SELECT AVG(active) raw, CAST(AVG(active) AS INTEGER) fl, ROUND(AVG(active)) rd, typeof(CAST(AVG(active) AS INTEGER)) tc, typeof(ROUND(AVG(active))) tr FROM customers`);
q("R17 ship-lag avg trio", `SELECT AVG(julianday(shipped_at) - julianday(created_at)) raw, CAST(AVG(julianday(shipped_at) - julianday(created_at)) AS INTEGER) fl, ROUND(AVG(julianday(shipped_at) - julianday(created_at))) rd FROM orders WHERE shipped_at IS NOT NULL`);

// ===== w7: coercion / parse =====
q("R18 memo year prefix cast", `SELECT CAST(SUBSTR(memo, 1, 4) AS INTEGER) yr, typeof(CAST(SUBSTR(memo, 1, 4) AS INTEGER)) cls, typeof(SUBSTR(memo, 1, 4)) raw_cls FROM ledger_entries LIMIT 1`);
q("R19 opex 2024 entries", `SELECT COUNT(*) n, SUM(debit_cents) cents, ROUND(SUM(debit_cents)/100.0,2) usd FROM ledger_entries WHERE account = 'operating_expenses' AND CAST(SUBSTR(memo, 1, 4) AS INTEGER) = 2024`);
q("R20 signup year cohorts", `SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) yr, COUNT(*) n FROM customers GROUP BY yr ORDER BY yr`);
q("R21 junk literals row", `SELECT CAST('42abc' AS INTEGER) a, CAST('abc42' AS INTEGER) b, CAST('1e3' AS INTEGER) c, CAST('0x1A' AS INTEGER) d, '1e3' + 0 e, typeof('1e3' + 0) f`);
q("R22 portal payload on rating 3.9", `SELECT CAST('4.6' AS INTEGER) cut, '3.9' + 0 kept, typeof('3.9' + 0) cls, rating FROM suppliers WHERE id = 3`);
q("R23 region + 0", `SELECT MAX(region + 0) region_num, typeof(rating) rating_cls, COUNT(*) n FROM suppliers WHERE region = 'APAC'`);

// ===== w7: division / NULL =====
q("R24 product stocks", `SELECT id, name, stock, stock / 2 cases, stock % 2 loose, typeof(stock / 2) cls, stock / 2.0 exact FROM products ORDER BY id`);
q("R25 refund share trio", `SELECT COUNT(*) ref, ROUND(100.0 * COUNT(*) / 103, 1) share, typeof(100.0 * COUNT(*) / 103) cls, ROUND(100 * COUNT(*) / 103, 1) trap, typeof(100 * COUNT(*) / 103) trap_cls FROM orders WHERE status = 'refunded'`);
q("R26 order_items units", `SELECT SUM(quantity) total_units, COUNT(DISTINCT order_id) orders, SUM(quantity) / COUNT(DISTINCT order_id) floor_po, ROUND(SUM(quantity) * 1.0 / COUNT(DISTINCT order_id), 2) exact_po, AVG(quantity) avg_q FROM order_items`);
q("R27 products never ordered", `SELECT COUNT(*) lonely FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id)`);
q("R28 div by zero", `SELECT SUM(quantity) / 0 dz, 1 / 0 dzz, typeof(1 / 0) cls FROM order_items LIMIT 1`);

// ===== w7: error distractors =====
err("R29 postgres cast", `SELECT total::INTEGER FROM orders LIMIT 1`);
err("R30 C-style cast", `SELECT INTEGER(total) FROM orders LIMIT 1`);
err("R31 cast missing AS", `SELECT CAST(total) FROM orders LIMIT 1`);
err("R32 typeof arity", `SELECT typeof(total, status) FROM orders LIMIT 1`);
err("R33 typo fn", `SELECT typeif(status) FROM orders LIMIT 1`);
err("R34 bare LAG", `SELECT LAG(id) FROM orders LIMIT 1`);
err("R35 NTILE(0)", `SELECT NTILE(0) OVER (ORDER BY total) FROM orders LIMIT 1`);

// ===== w7: extra census =====
q("R36 ledger entry_date buckets", `SELECT COUNT(DISTINCT entry_date) dates FROM ledger_entries`);
q("R37 ledger 2024 opex via substr filter", `SELECT COUNT(*) n FROM ledger_entries WHERE account = 'operating_expenses' AND SUBSTR(entry_date, 1, 4) = '2024'`);
q("R38 cash rows", `SELECT COUNT(*) n, SUM(debit_cents) deb, SUM(credit_cents) cred FROM ledger_entries WHERE account = 'cash'`);
q("R39 typeof city/email", `SELECT typeof(city) c, typeof(email) e, typeof(name) n FROM customers LIMIT 1`);
q("R40 whole-price keepers", `SELECT COUNT(*) n FROM products WHERE price = CAST(price AS INTEGER)`);

// ===== w8: month pipelines =====
q("R41 month counts + deltas", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders GROUP BY mon) SELECT mon, n, LAG(n) OVER (ORDER BY mon) prev, n - LAG(n) OVER (ORDER BY mon) delta FROM m ORDER BY mon`);
q("R42 LEAD last month", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon) SELECT mon, LEAD(rev) OVER (ORDER BY mon) next_rev FROM m ORDER BY mon DESC LIMIT 1`);
q("R43 month shares", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon) SELECT mon, ROUND(rev,2) rev, ROUND(100.0 * rev / SUM(rev) OVER (), 1) share FROM m ORDER BY mon`);
q("R44 NTILE(3)/(2) over 14 months", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon) SELECT (SELECT COUNT(*) FROM (SELECT NTILE(3) OVER (ORDER BY mon) t FROM m) GROUP BY t) t3, (SELECT GROUP_CONCAT(n) FROM (SELECT COUNT(*) n FROM (SELECT NTILE(3) OVER (ORDER BY mon) t FROM m) GROUP BY t)) t3n, (SELECT GROUP_CONCAT(n) FROM (SELECT COUNT(*) n FROM (SELECT NTILE(2) OVER (ORDER BY mon) t FROM m) GROUP BY t)) t2n FROM (SELECT 1)`);
q("R45 month avg order full list", `SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n, ROUND(AVG(total),2) avg_order FROM orders GROUP BY mon ORDER BY mon`);
q("R46 month rev ranks", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon) SELECT mon, ROUND(rev,2) rev, RANK() OVER (ORDER BY rev DESC) rk FROM m ORDER BY rk LIMIT 5`);

// ===== w8: rank / NTILE + text labels =====
q("R47 price quartiles DESC", `SELECT name, price, category, NTILE(4) OVER (ORDER BY price DESC) tile, PRINTF('%02d', NTILE(4) OVER (ORDER BY price DESC)) tag, RANK() OVER (ORDER BY price DESC) rk FROM products ORDER BY price DESC`);
q("R48 expense category leaderboard", `SELECT category, ROUND(SUM(amount_cents)/100.0, 2) usd, RANK() OVER (ORDER BY SUM(amount_cents) DESC) rk, DENSE_RANK() OVER (ORDER BY SUM(amount_cents)) drk, COUNT(*) OVER () n FROM expenses GROUP BY category ORDER BY rk`);
q("R49 month-top orders", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, total, ROW_NUMBER() OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY total DESC) rk, RANK() OVER (ORDER BY total DESC) rk_all FROM orders) SELECT mon, ROUND(total,2) total, rk_all, CASE WHEN total >= 1000 THEN 'review' ELSE 'ok' END flag FROM m WHERE rk = 1 ORDER BY rk_all`);
q("R50 month-top tie check (RANK vs ROW_NUMBER per month)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, total, RANK() OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY total DESC) rk FROM orders) SELECT COUNT(*) n FROM m WHERE rk = 1`);
q("R51 customer spend tiers", `WITH s AS (SELECT c.name, c.region, SUM(o.total) spend, SUBSTR(c.email, 1, INSTR(c.email,'@')-1) handle FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id) SELECT name, region, ROUND(spend,2) spend, handle, RANK() OVER (ORDER BY spend DESC) rk, CASE WHEN spend >= 4000 THEN 'whale' WHEN spend >= 1500 THEN 'core' ELSE 'longtail' END tier FROM s ORDER BY rk`);
q("R52 handles distinct", `SELECT COUNT(DISTINCT SUBSTR(email, 1, INSTR(email,'@')-1)) handles, COUNT(*) n FROM customers`);

// ===== w8: ledger / finance running =====
q("R53 opex running via ledger", `WITH e AS (SELECT strftime('%Y-%m', entry_date) mo, SUM(debit_cents) cents FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mo) SELECT mo, ROUND(SUM(cents) OVER (ORDER BY mo)/100.0, 2) running FROM e ORDER BY mo`);
q("R54 opex running via expenses table", `WITH e AS (SELECT strftime('%Y-%m', spent_on) mo, SUM(amount_cents) cents FROM expenses GROUP BY mo) SELECT mo, ROUND(SUM(cents) OVER (ORDER BY mo)/100.0, 2) running FROM e ORDER BY mo`);
q("R55 expenses spent_on distinct + Rent vendor", `SELECT COUNT(DISTINCT spent_on) dates, COUNT(*) n FROM expenses`);
q("R56 Rent rows", `SELECT category, vendor, COUNT(*) n FROM expenses WHERE category = 'Rent' GROUP BY vendor`);
q("R57 rent-only running", `WITH e AS (SELECT strftime('%Y-%m', spent_on) mo, SUM(amount_cents) cents FROM expenses WHERE category = 'Rent' GROUP BY mo) SELECT mo, ROUND(SUM(cents) OVER (ORDER BY mo)/100.0, 2) running FROM e ORDER BY mo`);
q("R58 account nets + rank", `SELECT account, ROUND(SUM(debit_cents - credit_cents)/100.0, 2) net_usd, RANK() OVER (ORDER BY SUM(debit_cents - credit_cents) DESC) rk, typeof(account) cls, COUNT(*) OVER () accounts FROM ledger_entries GROUP BY account ORDER BY net_usd DESC`);
q("R59 ledger balance tail", `WITH r AS (SELECT entry_date, id, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id)/100.0, 2) bal FROM ledger_entries) SELECT * FROM r ORDER BY entry_date DESC, id DESC LIMIT 5`);

// ===== w8: aging / interval =====
q("R60 invoice terms + issue buckets", `WITH i AS (SELECT strftime('%Y-%m', issued_on) mon, CAST(julianday(due_on) - julianday(issued_on) AS INTEGER) terms FROM invoices) SELECT mon, MIN(terms) terms, COUNT(*) invoices, SUM(COUNT(*)) OVER (ORDER BY mon) running FROM i GROUP BY mon ORDER BY mon`);
q("R61 invoice status census", `SELECT status, COUNT(*) n FROM invoices GROUP BY status`);
q("R62 ship-lag census", `SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) lag_days, COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL GROUP BY lag_days ORDER BY lag_days`);
q("R63 month spans", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, CAST(MAX(julianday(created_at)) - MIN(julianday(created_at)) AS INTEGER) span FROM orders GROUP BY mon) SELECT mon, span, LAG(span) OVER (ORDER BY mon) prev FROM m ORDER BY mon`);
q("R64 refunded rows detail", `SELECT id, strftime('%Y-%m', created_at) mon, ROUND(total,2) total, shipped_at IS NULL unshipped, CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) lag_days FROM orders WHERE status = 'refunded' ORDER BY mon`);
q("R65 refunded running line", `WITH r AS (SELECT strftime('%Y-%m', created_at) mon, total FROM orders WHERE status = 'refunded') SELECT mon, ROUND(total,2) total, ROUND(SUM(total) OVER (ORDER BY mon), 2) running FROM r ORDER BY mon, total DESC`);
q("R66 julianday anchors", `SELECT JULIANDAY('2024-01-01') jd, typeof(JULIANDAY('2024-01-01')) cls, JULIANDAY('2024-01') jd_label`);

// ===== w8: misc =====
q("R67 printf month tag", `SELECT PRINTF('%02d', CAST(SUBSTR('2024-01-05', 6, 2) AS INTEGER)) m1, PRINTF('%04d', 14) padded, PRINTF('%.2f', 34833.28) money`);
q("R68 pending crowd class", `SELECT typeof(SUM(total)) cls, COUNT(*) n, ROUND(SUM(total),2) s FROM orders WHERE status = 'pending'`);
q("R69 created_at raw groups", `SELECT COUNT(DISTINCT created_at) days FROM orders`);
q("R70 total>=500 / floor>=500", `SELECT SUM(total >= 500) raw_500, SUM(CAST(total AS INTEGER) >= 500) floor_500, SUM(total > 1000) over_1000 FROM orders`);
q("R71 unshipped mix", `SELECT SUM(status = 'refunded') ref, SUM(status = 'pending') pend, COUNT(*) n FROM orders WHERE shipped_at IS NULL`);

// ===== round 2: cancelled-status universe + distractor safety =====
q("R74 cancelled detail", `SELECT id, strftime('%Y-%m', created_at) mon, ROUND(total,2) total, shipped_at IS NULL unshipped, CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) lag_days FROM orders WHERE status = 'cancelled' ORDER BY mon`);
q("R75 cancelled running line", `WITH r AS (SELECT strftime('%Y-%m', created_at) mon, total FROM orders WHERE status = 'cancelled') SELECT mon, ROUND(total,2) total, ROUND(SUM(total) OVER (ORDER BY mon), 2) running FROM r ORDER BY mon, total DESC`);
q("R76 cancelled census", `SELECT COUNT(*) n, COUNT(DISTINCT customer_id) custs, SUM(id) id_sum, ROUND(SUM(total),2) value FROM orders WHERE status = 'cancelled'`);
q("R77 pending raw sum display", `SELECT SUM(total) raw, ROUND(SUM(total),2) rounded, MAX(total) mx, COUNT(*) n FROM orders WHERE status = 'pending'`);
q("R78 order 74 raw", `SELECT id, created_at, shipped_at, status, total FROM orders WHERE id = 74`);
q("R79 SUM(price) raw display", `SELECT SUM(price) raw, typeof(SUM(price)) cls FROM products`);
q("R80 credit rows", `SELECT SUM(credit_cents > 0) cred_rows, MAX(debit_cents) max_debit FROM ledger_entries`);
q("R81 customers id sum", `SELECT SUM(id) s FROM customers`);
q("R82 raw month deltas display", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon) SELECT mon, rev - LAG(rev) OVER (ORDER BY mon) raw_delta FROM m ORDER BY mon`);
q("R83 status share classes", `SELECT ROUND(100.0 * SUM(status = 'shipped') / 103, 1) shipped_pct, ROUND(100.0 * SUM(status = 'delivered') / 103, 1) delivered_pct, ROUND(100.0 * SUM(status = 'cancelled') / 103, 1) cancelled_pct FROM orders`);
q("R84 cancelled+pending value", `SELECT ROUND(SUM(total),2) v, COUNT(*) n FROM orders WHERE status IN ('cancelled','pending')`);
q("R85 typeof alias in same SELECT", `SELECT ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) AS bal, typeof(bal) cls FROM ledger_entries ORDER BY entry_date DESC, id DESC LIMIT 2`);
q("R86 due-month buckets", `SELECT strftime('%Y-%m', due_on) mon, COUNT(*) n FROM invoices GROUP BY mon ORDER BY mon`);
q("R87 NTILE(4) over 16 products", `SELECT t, COUNT(*) n FROM (SELECT NTILE(4) OVER (ORDER BY price DESC) t FROM products) GROUP BY t ORDER BY t`);
q("R88 monthly invoice due terms raw", `SELECT MIN(julianday(due_on) - julianday(issued_on)) lo, MAX(julianday(due_on) - julianday(issued_on)) hi, typeof(julianday(due_on) - julianday(issued_on)) cls FROM invoices`);
q("R89 opex avg trio display check", `SELECT CAST(AVG(debit_cents) AS INTEGER) a, ROUND(AVG(debit_cents)) b, ROUND(AVG(debit_cents), 1) c FROM ledger_entries WHERE account = 'operating_expenses'`);
q("R90 email handles first5", `SELECT SUBSTR(email, 1, 5) h5, SUBSTR(email, 1, INSTR(email,'@')-1) handle FROM customers ORDER BY id LIMIT 8`);

// ===== verbatim error checks for wave distractors =====
err("R72 aliases not visible in OVER", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon) SELECT NTILE(4) OVER (ORDER BY mon) t FROM m LIMIT 1`);
err("R73 rev unknown in CTE", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) AS rev FROM orders GROUP BY mon) SELECT SUM(rev) OVER (ORDER BY mon) FROM orders LIMIT 1`);

db.close();
rmSync(TMP, { force: true });
console.log("\nDONE m5-facts-r7 (temp db removed)");
