// M5 FACTS PROBE — Scalar & Window Toolkit receipts (db/custom.db, readonly copy).
// Every drill/case/theory claim below cites one of these labeled outputs.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5f.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 20) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const shown = rows.slice(0, max).map(r => Object.values(r).map(v =>
      v === null ? "NULL" : typeof v === "number" ? (Number.isInteger(v) ? String(v) : String(v)) : String(v)
    ).join(" | "));
    console.log(`\n[${label}]  (${rows.length} rows)`);
    shown.forEach(s => console.log("  " + s));
    if (rows.length > max) console.log(`  … +${rows.length - max} more`);
  } catch (e) {
    console.log(`\n[${label}]  ERROR: ${e instanceof Error ? e.message : e}`);
  }
}

function e(label: string, sql: string) {
  try {
    db.query(sql).all();
    console.log(`\n[ERR ${label}]  no error`);
  } catch (err) {
    console.log(`\n[ERR ${label}]  ${err instanceof Error ? err.message : err}`);
  }
}

// ================= TEXT & TYPE TOOLKIT (L29) =================
q("T01 upper-region census", `SELECT UPPER(region) u, COUNT(*) n FROM customers GROUP BY UPPER(region) ORDER BY n DESC`);
q("T02 length(name) census", `SELECT MIN(LENGTH(name)) lo, MAX(LENGTH(name)) hi, ROUND(AVG(LENGTH(name)),2) avg FROM customers`);
q("T03 length distribution", `SELECT LENGTH(name) len, COUNT(*) n FROM customers GROUP BY len ORDER BY len`);
q("T04 names with space", `SELECT COUNT(*) n FROM customers WHERE INSTR(name, ' ') > 0`);
q("T05 last-name extraction", `SELECT SUBSTR(name, INSTR(name,' ')+1) last FROM customers ORDER BY last LIMIT 8`);
q("T06 email domains", `SELECT SUBSTR(email, INSTR(email,'@')+1) domain, COUNT(*) n FROM customers GROUP BY domain ORDER BY n DESC`);
q("T07 emails with one @", `SELECT COUNT(*) n FROM customers WHERE (LENGTH(email) - REPLACE(email, '@', '')) = 1`);
q("T08 product name heads", `SELECT SUBSTR(name, 1, 4) head, name FROM products ORDER BY id LIMIT 8`);
q("T09 typeof census", `SELECT typeof(id) a, typeof(name) b, typeof(region) c, typeof(active) d, typeof(created_at) e FROM customers LIMIT 1`);
q("T10 typeof orders", `SELECT typeof(id) a, typeof(total) b, typeof(status) c, typeof(created_at) d FROM orders LIMIT 1`);
q("T11 cast price to int (truncate?)", `SELECT price, CAST(price AS INTEGER) cut FROM products WHERE id IN (1,2,3) `);
q("T12 cast text junk", `SELECT CAST('42' AS INTEGER) n1, CAST('abc' AS INTEGER) n2, CAST('3.9' AS INTEGER) n3, CAST('' AS INTEGER) n4`);
q("T13 concat pipes", `SELECT name || ' — ' || city AS tag FROM customers ORDER BY id LIMIT 5`);
q("T14 concat with number", `SELECT name || ' #' || id AS tag FROM customers LIMIT 3`);
q("T15 null concat poisons", `SELECT name || ' / ' || shipped_at FROM orders WHERE shipped_at IS NULL LIMIT 2`);
q("T16 replace demo", `SELECT REPLACE('2024-03-15', '-', '/') d`);
q("T17 replace null", `SELECT REPLACE(NULL, '-', '/') d`);
q("T18 trim demo", `SELECT '[' || TRIM('  padded  ') || ']' t, LENGTH('  padded  ') raw, LENGTH(TRIM('  padded  ')) cut`);
q("T19 instr basics", `SELECT INSTR('alice@shop.io','@') hit, INSTR('no-at-here','@') miss, INSTR('aaa','a') first`);
q("T20 lower/upper roundtrip", `SELECT LOWER('MixEd') l, UPPER('MixEd') u, LENGTH(UPPER(name)) - LENGTH(LOWER(name)) diff FROM customers LIMIT 3`);
q("T21 printf money", `SELECT PRINTF('%.2f', total) money FROM orders ORDER BY total DESC LIMIT 3`);
q("T22 printf pad", `SELECT PRINTF('%04d', id) padded FROM orders LIMIT 3`);
q("T23 substr out of range", `SELECT SUBSTR('hello', 10, 3) far, SUBSTR('hello', -3) tail, SUBSTR('hello', 0, 2) zero`);
q("T24 length(null)", `SELECT LENGTH(NULL) ln, UPPER(NULL) un, INSTR(NULL,'a') inn`);
q("T25 shortest/longest names", `SELECT name, LENGTH(name) len FROM customers ORDER BY len DESC, name LIMIT 3`);
q("T26 email length extremes", `SELECT email, LENGTH(email) len FROM customers ORDER BY len DESC LIMIT 3`);

// ================= DATES & BUCKETS (L30) =================
q("D01 created_at range", `SELECT MIN(created_at) lo, MAX(created_at) hi FROM orders`);
q("D02 created_at samples", `SELECT id, created_at, shipped_at FROM orders LIMIT 3`);
q("D03 year buckets", `SELECT strftime('%Y', created_at) y, COUNT(*) n FROM orders GROUP BY y ORDER BY y`);
q("D04 month buckets full", `SELECT strftime('%Y-%m', created_at) m, COUNT(*) n, ROUND(SUM(total),2) spend FROM orders GROUP BY m ORDER BY m`);
q("D05 start-of-month alias", `SELECT DATE(created_at, 'start of month') m, COUNT(*) n FROM orders GROUP BY m ORDER BY m LIMIT 4`);
q("D06 weekday census (%w)", `SELECT strftime('%w', created_at) dow, COUNT(*) n FROM orders GROUP BY dow ORDER BY dow`);
q("D07 ship lag days", `SELECT ROUND(AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)), 2) avg_days, MIN(JULIANDAY(shipped_at) - JULIANDAY(created_at)) lo, MAX(JULIANDAY(shipped_at) - JULIANDAY(created_at)) hi FROM orders WHERE shipped_at IS NOT NULL`);
q("D08 shipped null census", `SELECT COUNT(*) n FROM orders WHERE shipped_at IS NULL`);
q("D09 date arithmetic", `SELECT id, DATE(created_at, '+7 days') plus7 FROM orders LIMIT 3`);
q("D10 month name via strftime", `SELECT strftime('%m', created_at) mm, COUNT(*) n FROM orders WHERE strftime('%Y', created_at)='2024' GROUP BY mm ORDER BY mm`);
q("D11 day-of-month census", `SELECT CAST(strftime('%d', created_at) AS INT) dom, COUNT(*) n FROM orders GROUP BY dom ORDER BY n DESC LIMIT 5`);
q("D12 expenses date range", `SELECT MIN(spent_on) lo, MAX(spent_on) hi FROM expenses`);
q("D13 expense month buckets", `SELECT strftime('%Y-%m', spent_on) m, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses GROUP BY m ORDER BY m`);
q("D14 expense categories", `SELECT category, COUNT(*) n, ROUND(SUM(amount_cents)/100.0,2) total FROM expenses GROUP BY category ORDER BY total DESC`);
q("D15 invoice issue months", `SELECT strftime('%Y-%m', issued_on) m, COUNT(*) n FROM invoices GROUP BY m ORDER BY m`);
q("D16 due vs issued gap", `SELECT COUNT(*) n, ROUND(AVG(JULIANDAY(due_on)-JULIANDAY(issued_on)),1) avg_gap FROM invoices`);
q("D17 bucket count via substr", `SELECT SUBSTR(created_at, 1, 7) m, COUNT(*) n FROM orders GROUP BY m ORDER BY m LIMIT 3`);
q("D18 datediff alias floor", `SELECT CAST(JULIANDAY('2024-03-20') - JULIANDAY('2024-03-15') AS INT) days`);

// ================= WINDOWS I — RANK (L31) =================
q("W01 spend leaderboard", `SELECT c.name, ROUND(SUM(o.total),2) spend, RANK() OVER (ORDER BY SUM(o.total) DESC) rk FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY rk`);
q("W02 tie census on spend", `SELECT spend, COUNT(*) tied FROM (SELECT ROUND(SUM(total),2) spend FROM orders GROUP BY customer_id) GROUP BY spend HAVING COUNT(*)>1 ORDER BY spend DESC`);
q("W03 rank vs dense_rank", `SELECT RANK() OVER (ORDER BY spend DESC) rk, DENSE_RANK() OVER (ORDER BY spend DESC) drk, spend FROM (SELECT c.id, SUM(o.total) spend FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id) ORDER BY rk`);
q("W04 row_number top5", `SELECT ROW_NUMBER() OVER (ORDER BY SUM(total) DESC) rn, ROUND(SUM(total),2) spend FROM orders GROUP BY customer_id ORDER BY rn LIMIT 5`);
q("W05 region-partitioned rank", `SELECT c.name, c.region, RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) rk FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY c.region, rk`);
q("W06 dense_rank region APAC", `SELECT c.name, DENSE_RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) drk FROM customers c JOIN orders o ON o.customer_id=c.id WHERE c.region='APAC' GROUP BY c.id ORDER BY drk`);
q("W07 top-1 order per customer", `WITH ranked AS (SELECT c.name, o.id oid, o.total, ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.total DESC, o.id) rn FROM orders o JOIN customers c ON c.id=o.customer_id) SELECT name, oid, total FROM ranked WHERE rn=1 ORDER BY total DESC LIMIT 5`);
q("W08 ntile4 spend", `SELECT name, ROUND(spend,2), NTILE(4) OVER (ORDER BY spend DESC) quart FROM (SELECT c.name, SUM(o.total) spend FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id) ORDER BY quart, spend DESC`);
q("W09 rank all-tied ntile", `SELECT NTILE(4) OVER (ORDER BY region) q, region, COUNT(*) n FROM customers GROUP BY q, region ORDER BY q, region`);
q("W10 rank no order-by", `SELECT RANK() OVER () all_one, COUNT(*) n FROM orders`);
q("W11 percent_rank 16", `SELECT c.name, ROUND(SUM(o.total),2) spend, ROUND(PERCENT_RANK() OVER (ORDER BY SUM(o.total) DESC), 4) pr, ROUND(CUME_DIST() OVER (ORDER BY SUM(o.total) DESC), 4) cd FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY pr LIMIT 4`);
q("W12 row_number product price", `SELECT name, price, ROW_NUMBER() OVER (ORDER BY price DESC, id) rn FROM products ORDER BY rn LIMIT 5`);
q("W13 price tie census", `SELECT price, COUNT(*) n FROM products GROUP BY price HAVING n > 1 ORDER BY price DESC`);
q("W14 rank stock", `SELECT name, stock, RANK() OVER (ORDER BY stock DESC) rk FROM products ORDER BY rk LIMIT 6`);

// ================= WINDOWS II — OFFSETS (L32) =================
q("O01 lag first-null", `SELECT id, total, LAG(total) OVER (ORDER BY id) prev FROM orders ORDER BY id LIMIT 4`);
q("O02 lead last-null", `SELECT id, total, LEAD(total) OVER (ORDER BY id) nxt FROM orders ORDER BY id DESC LIMIT 3`);
q("O03 lag null census", `SELECT COUNT(*) n FROM (SELECT LAG(total) OVER (ORDER BY id) p FROM orders) WHERE p IS NULL`);
q("O04 lag with default", `SELECT id, LAG(total, 1, 0) OVER (ORDER BY id) prev FROM orders ORDER BY id LIMIT 3`);
q("O05 lag 2 rows", `SELECT id, LAG(total, 2) OVER (ORDER BY id) prev2 FROM orders ORDER BY id LIMIT 4`);
q("O06 per-customer lag", `SELECT customer_id, id, total, LAG(total) OVER (PARTITION BY customer_id ORDER BY id) prev FROM orders ORDER BY customer_id, id LIMIT 8`);
q("O07 per-customer lag null census", `SELECT COUNT(*) n FROM (SELECT LAG(total) OVER (PARTITION BY customer_id ORDER BY id) p FROM orders) WHERE p IS NULL`);
q("O08 month spend + MoM", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) spend FROM orders GROUP BY mo) SELECT mo, ROUND(spend,2) spend, ROUND(LAG(spend) OVER (ORDER BY mo),2) prev FROM m ORDER BY mo`);
q("O09 MoM delta", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) spend FROM orders GROUP BY mo) SELECT mo, ROUND(spend - LAG(spend) OVER (ORDER BY mo), 2) delta FROM m ORDER BY mo`);
q("O10 MoM pct", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) spend FROM orders GROUP BY mo) SELECT mo, ROUND(100.0*(spend - LAG(spend) OVER (ORDER BY mo)) / LAG(spend) OVER (ORDER BY mo), 1) pct FROM m ORDER BY mo`);
q("O11 lag ignores null values?", `SELECT id, shipped_at, LAG(shipped_at) OVER (ORDER BY id) prev_ship FROM orders ORDER BY id LIMIT 8`);
q("O12 lead region walk", `SELECT name, region, LEAD(name) OVER (ORDER BY id) next_cust FROM customers ORDER BY id LIMIT 5`);

// ================= WINDOWS II — FRAMES / RUNNING (L32) =================
q("F01 grand totals", `SELECT ROUND(SUM(total),2) grand, COUNT(*) n, ROUND(AVG(total),2) mean, MIN(total) lo, MAX(total) hi FROM orders`);
q("F02 running total by id", `SELECT id, ROUND(SUM(total) OVER (ORDER BY id), 2) run FROM orders ORDER BY id LIMIT 6`);
q("F03 running total final", `SELECT id, ROUND(SUM(total) OVER (ORDER BY id), 2) run FROM orders ORDER BY id DESC LIMIT 2`);
q("F04 count over all", `SELECT COUNT(*) OVER () n FROM orders LIMIT 1`);
q("F05 avg over partition region", `SELECT c.region, ROUND(AVG(o.total) OVER (PARTITION BY c.region), 2) region_avg, o.total FROM orders o JOIN customers c ON c.id=o.customer_id ORDER BY o.id LIMIT 6`);
q("F06 region avg dedup", `SELECT DISTINCT region, ROUND(AVG(o.total) OVER (PARTITION BY region),2) avg FROM orders o JOIN customers c ON c.id=o.customer_id ORDER BY avg DESC`);
q("F07 sum over partition cust", `SELECT customer_id, ROUND(SUM(total) OVER (PARTITION BY customer_id),2) cust_total, total FROM orders ORDER BY customer_id, id LIMIT 6`);
q("F08 rows between 1 prec", `SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) mv2 FROM orders ORDER BY id LIMIT 5`);
q("F09 moving avg 3", `SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) mv3 FROM orders ORDER BY id LIMIT 5`);
q("F10 everything before", `SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 2) avg_before FROM orders ORDER BY id LIMIT 4`);
q("F11 sum unbounded following", `SELECT id, ROUND(SUM(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING), 2) rest FROM orders ORDER BY id LIMIT 3`);
q("F12 frame default with order", `SELECT id, ROUND(SUM(total) OVER (ORDER BY id RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) run FROM orders ORDER BY id LIMIT 3`);
q("F13 ledger running balance", `SELECT entry_date, account, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) balance FROM ledger_entries ORDER BY entry_date, id LIMIT 6`);
q("F14 ledger final balance", `SELECT entry_date, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) balance FROM ledger_entries ORDER BY entry_date DESC, id DESC LIMIT 2`);
q("F15 empty window", `SELECT id, COUNT(*) OVER () n FROM orders WHERE 1=0`);
q("F16 window over group by", `SELECT customer_id, COUNT(*) n, RANK() OVER (ORDER BY COUNT(*) DESC) rk FROM orders GROUP BY customer_id ORDER BY rk LIMIT 4`);
q("F17 window no order-by sum", `SELECT id, ROUND(SUM(total) OVER (), 2) grand FROM orders LIMIT 2`);

// ================= ERRORS & SYNTAX EDGES =================
e("E01 window in WHERE", `SELECT id FROM orders WHERE RANK() OVER (ORDER BY total) = 1`);
e("E02 window in HAVING", `SELECT customer_id FROM orders GROUP BY customer_id HAVING RANK() OVER (ORDER BY COUNT(*)) = 1`);
e("E03 missing OVER", `SELECT RANK() FROM orders`);
e("E04 over empty parens rank", `SELECT RANK() OVER () FROM orders LIMIT 2`);
e("E05 typo window fn", `SELECT RAN() OVER (ORDER BY id) FROM orders LIMIT 1`);
e("E06 window fn in SET-less UPDATE", `SELECT id, ROW_NUMBER() OVER () rn FROM orders ORDER BY rn LIMIT 2`);
e("E07 lag negative offset", `SELECT LAG(total, -1) OVER (ORDER BY id) FROM orders LIMIT 2`);
e("E08 lag 0 offset", `SELECT LAG(total, 0) OVER (ORDER BY id) FROM orders LIMIT 2`);
e("E09 frame mixed direction", `SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN 2 FOLLOWING AND 1 PRECEDING) FROM orders LIMIT 1`);
e("E10 ntile zero", `SELECT NTILE(0) OVER (ORDER BY id) FROM orders LIMIT 1`);
e("E11 ntile fractional", `SELECT NTILE(2.5) OVER (ORDER BY id) FROM orders LIMIT 1`);
e("E12 dense rank no order", `SELECT DENSE_RANK() OVER () FROM orders LIMIT 2`);
e("E13 window around subquery", `SELECT (SELECT MAX(total) FROM orders) m, RANK() OVER (ORDER BY total) rk FROM orders LIMIT 2`);

db.close();
rmSync(COPY, { force: true });
console.log("\nDONE m5-facts");
