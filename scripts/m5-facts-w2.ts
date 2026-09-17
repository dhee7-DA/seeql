/// <reference types="bun-types" />
// m5-c2 probe tool — read-only COPY of db/custom.db, self-deleting.
// Every figure used in cases-w2.ts (w2 date buckets, cs-1241..1278) must trace
// to this output, scripts/m5-facts-r2.out, or scripts/m5-facts-r4.out.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w2.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};
const attempt = (label: string, sql: string) => {
  try { console.log(`${label} OK`, JSON.stringify(q(sql))); }
  catch (e) { console.log(`${label} THROWS:`, e instanceof Error ? e.message : String(e)); }
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- quarter buckets (cs-1263 orders, cs-1277 expenses, cs-1255 customers) ----
show("orders per quarter (yr,q)", "SELECT strftime('%Y', created_at) yr, ((CAST(strftime('%m', created_at) AS INTEGER) + 2) / 3) q, COUNT(*) n, ROUND(SUM(total), 2) spend FROM orders GROUP BY yr, q ORDER BY yr, q");
show("orders quarter ladder top", "SELECT ((CAST(strftime('%m', created_at) AS INTEGER) + 2) / 3) q, strftime('%Y', created_at) yr, ROUND(SUM(total), 2) spend FROM orders GROUP BY yr, q ORDER BY spend DESC LIMIT 2");
show("expenses per quarter", "SELECT strftime('%Y', spent_on) yr, ((CAST(strftime('%m', spent_on) AS INTEGER) + 2) / 3) q, ROUND(SUM(amount_cents)/100.0, 2) burn FROM expenses GROUP BY yr, q ORDER BY yr, q");
show("expenses quarter top", "SELECT ((CAST(strftime('%m', spent_on) AS INTEGER) + 2) / 3) q, strftime('%Y', spent_on) yr, ROUND(SUM(amount_cents)/100.0, 2) burn FROM expenses GROUP BY yr, q ORDER BY burn DESC LIMIT 1");
show("customers per quarter", "SELECT strftime('%Y', created_at) yr, ((CAST(strftime('%m', created_at) AS INTEGER) + 2) / 3) q, COUNT(*) signups FROM customers GROUP BY yr, q ORDER BY yr, q");
show("customers %Y fill q", "SELECT ((CAST(strftime('%Y', created_at) AS INTEGER) + 2) / 3) q, strftime('%Y', created_at) yr, COUNT(*) signups FROM customers GROUP BY yr, q HAVING signups = 4");
attempt("orders %Y fill q", "SELECT ((CAST(strftime('%Y', created_at) AS INTEGER) + 2) / 3) q, strftime('%Y', created_at) yr, ROUND(SUM(total), 2) spend FROM orders GROUP BY yr, q ORDER BY spend DESC LIMIT 1");
attempt("expenses %Y fill q", "SELECT ((CAST(strftime('%Y', spent_on) AS INTEGER) + 2) / 3) q, strftime('%Y', spent_on) yr, ROUND(SUM(amount_cents)/100.0, 2) burn FROM expenses GROUP BY yr, q ORDER BY burn DESC LIMIT 1");

// ---- %m merged census (cs-1241/1248/1258 traps) ----
show("orders %m census full", "SELECT strftime('%m', created_at) m, COUNT(*) n FROM orders GROUP BY m ORDER BY m");
show("orders %m HAVING 8", "SELECT strftime('%m', created_at) m, COUNT(*) n FROM orders GROUP BY m HAVING n = 8 ORDER BY m");
show("cancelled %m census with lost", "SELECT strftime('%m', created_at) m, COUNT(*) n, ROUND(SUM(total), 2) lost FROM orders WHERE status = 'cancelled' GROUP BY m ORDER BY m");
show("expenses %m >2000 merged", "SELECT strftime('%m', spent_on) m, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses GROUP BY m HAVING spend > 2000 ORDER BY m");
show("orders %m AOV top2", "SELECT strftime('%m', created_at) m, ROUND(AVG(total), 2) aov FROM orders GROUP BY m ORDER BY aov DESC LIMIT 2");

// ---- %y and %H traps (cs-1268, cs-1269) ----
show("%y NULL grouping", "SELECT strftime('%y', created_at) y, COUNT(*) n FROM orders GROUP BY y");
show("%H distinct count", "SELECT COUNT(DISTINCT strftime('%H', created_at)) hh, MIN(strftime('%H', created_at)) mn FROM orders");

// ---- %W week buckets + %d day-of-month census (cs-1278) ----
show("%W full census", "SELECT strftime('%W', created_at) wk, COUNT(*) n FROM orders GROUP BY wk ORDER BY wk");
show("%W HAVING 6", "SELECT strftime('%W', created_at) wk, COUNT(*) n FROM orders GROUP BY wk HAVING n = 6 ORDER BY wk");
show("%d full census", "SELECT strftime('%d', created_at) d, COUNT(*) n FROM orders GROUP BY d ORDER BY d");
show("%d HAVING 6", "SELECT strftime('%d', created_at) d, COUNT(*) n FROM orders GROUP BY d HAVING n = 6 ORDER BY d");
show("%j HAVING 6", "SELECT strftime('%j', created_at) j, COUNT(*) n FROM orders GROUP BY j HAVING n = 6 ORDER BY j");

// ---- buyers per month (cs-1275) ----
show("buyers per month", "SELECT strftime('%Y-%m', created_at) mon, COUNT(DISTINCT customer_id) buyers, COUNT(*) n FROM orders GROUP BY mon ORDER BY mon");
show("buyers per %m", "SELECT strftime('%m', created_at) m, COUNT(DISTINCT customer_id) buyers FROM orders GROUP BY m ORDER BY m");

// ---- date edges (cs-1254 window) ----
show("feb window half-open", "SELECT COUNT(*) n, MIN(created_at) first_day, MAX(created_at) last_day FROM orders WHERE created_at >= '2024-02-01' AND created_at < '2024-03-01'");
show("feb 05 count", "SELECT COUNT(*) n FROM orders WHERE created_at >= '2024-02-01' AND created_at < '2024-02-05'");
show("feb window from 02-06", "SELECT COUNT(*) n FROM orders WHERE created_at >= '2024-02-06' AND created_at < '2024-03-01'");
show("jan-only window", "SELECT COUNT(*) n FROM orders WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'");
show("feb+mar window", "SELECT COUNT(*) n FROM orders WHERE created_at >= '2024-02-01' AND created_at < '2024-04-01'");
attempt("window start-of-year variant", "SELECT COUNT(*) n FROM orders WHERE created_at >= '2024-02-01' AND created_at < date('2024-02-01', 'start of year', '+1 month')");
attempt("window weekday variant", "SELECT COUNT(*) n FROM orders WHERE created_at >= '2024-02-01' AND created_at < date('2024-02-01', 'weekday 1')");
attempt("window +2months variant", "SELECT COUNT(*) n FROM orders WHERE created_at >= '2024-02-01' AND created_at < date('2024-02-01', 'start of month', '+2 months')");
attempt("numeric bound trap", "SELECT COUNT(*) n FROM orders WHERE created_at >= 9 AND created_at < '2024-03-01'");

// ---- burst days detail (cs-1249, cs-1259) ----
show("2024-05-12 detail", "SELECT id, total, status FROM orders WHERE created_at = '2024-05-12' ORDER BY id");
show("2024-10-13 detail", "SELECT id, total, status FROM orders WHERE created_at = '2024-10-13' ORDER BY id");
show("2024-05-19 count", "SELECT COUNT(*) n FROM orders WHERE created_at LIKE '2024-05-19'");

// ---- cancelled aging (cs-1272) ----
show("julianday audit date", "SELECT julianday('2025-03-01') j");
show("cancelled ages", "SELECT id, created_at, CAST(julianday('2025-03-01') - julianday(created_at) AS INTEGER) age FROM orders WHERE status = 'cancelled' ORDER BY age DESC");
attempt("date() age variant", "SELECT id, CAST(julianday('2025-03-01') - date(created_at) AS INTEGER) age FROM orders WHERE status = 'cancelled' ORDER BY age DESC LIMIT 2");

// ---- month-end snap (cs-1264) ----
attempt("snap 2024-02-11", "SELECT date('2024-02-11', 'start of month') a, date('2024-02-11', 'start of month', '+1 month', '-1 day') e");
attempt("snap from 02-29", "SELECT date('2024-02-29', 'start of month') a, date('2024-02-29', 'start of month', '+1 month', '-1 day') e");
attempt("snap +2months end", "SELECT date('2024-02-11', '+2 months') a, date('2024-02-11', '+2 months', '+1 month', '-1 day') e");
attempt("snap start-of-year", "SELECT date('2024-02-11', 'start of year') a, date('2024-02-11', 'start of month', '+1 month', 'start of year') e");
attempt("snap weekday 1", "SELECT date('2024-02-11', 'weekday 1') a, date('2024-02-11', 'weekday 1', '+1 month', '-1 day') e");
attempt("snap 2024-02-30 rollover", "SELECT date('2024-02-30', 'start of month') a, date('2024-02-30', 'start of month', '+1 month', '-1 day') e");
attempt("snap NULL literal", "SELECT date('start of year', 'start of month') a");

// ---- monthly maxima/minima (cs-1273) ----
show("monthly max ladder", "SELECT strftime('%Y-%m', created_at) mon, MAX(total) mx FROM orders GROUP BY mon ORDER BY mx DESC");
show("monthly max bottom", "SELECT strftime('%Y-%m', created_at) mon, MAX(total) mx FROM orders GROUP BY mon ORDER BY mx ASC LIMIT 1");
show("monthly min top", "SELECT strftime('%Y-%m', created_at) mon, MIN(total) mn FROM orders GROUP BY mon ORDER BY mn DESC LIMIT 1");
show("day bucket max", "SELECT strftime('%d', created_at) d, MAX(total) mx FROM orders GROUP BY d ORDER BY mx DESC LIMIT 1");

// ---- shipped-by-month census (cs-1274) ----
show("shipped orders by shipped month", "SELECT strftime('%Y-%m', shipped_at) mon, COUNT(*) n FROM orders WHERE status = 'shipped' GROUP BY mon ORDER BY mon");
show("shipped orders by created month", "SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders WHERE status = 'shipped' GROUP BY mon ORDER BY mon");

// ---- opex ledger monthly nets (cs-1271) ----
show("opex monthly nets full", "SELECT strftime('%Y-%m', entry_date) mon, ROUND(SUM(debit_cents - credit_cents)/100.0, 2) net FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mon ORDER BY mon");

// ---- supplier monthly distinct (cs-1246, cs-1276) ----
show("nordic months full", "SELECT strftime('%Y-%m', o.created_at) mon, COUNT(DISTINCT o.id) n FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Nordic Gadgets AB' GROUP BY mon ORDER BY mon");
show("shenzhen months full", "SELECT strftime('%Y-%m', o.created_at) mon, COUNT(DISTINCT o.id) n FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Shenzhen Electro' GROUP BY mon ORDER BY mon");
show("shenzhen HAVING 6", "SELECT strftime('%Y-%m', o.created_at) mon, COUNT(DISTINCT o.id) n FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Shenzhen Electro' GROUP BY mon HAVING n = 6 ORDER BY mon");
show("midwest 2025-02 row", "SELECT strftime('%Y-%m', o.created_at) mon, COUNT(*) rows_pulled, COUNT(DISTINCT o.id) orders FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE p.supplier_id = 4 GROUP BY mon HAVING mon = '2025-02'");
attempt("midwest count(o.id) fill", "SELECT strftime('%Y-%m', o.created_at) mon, COUNT(*) rows_pulled, COUNT(o.id) orders FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE p.supplier_id = 4 GROUP BY mon HAVING orders = 5 ORDER BY mon");

// ---- signup day/edge checks (cs-1245) ----
show("customers per day dupes", "SELECT strftime('%Y-%m-%d', created_at) d, COUNT(*) n FROM customers GROUP BY d HAVING n > 1");
show("customers %d census", "SELECT strftime('%Y-%m-%d', created_at) d, COUNT(*) n FROM customers GROUP BY d ORDER BY n DESC LIMIT 3");

// ---- misc confirmations ----
show("cash monthly nets full top3", "SELECT strftime('%Y-%m', entry_date) mon, ROUND(SUM(debit_cents - credit_cents)/100.0, 2) net FROM ledger_entries WHERE account = 'cash' GROUP BY mon ORDER BY net DESC LIMIT 3");
show("2025 shipped status rows", "SELECT COUNT(*) n FROM orders WHERE status = 'shipped' AND strftime('%Y', created_at) = '2025'");
show("2024-11 days vs orders", "SELECT COUNT(DISTINCT created_at) days, COUNT(*) n FROM orders WHERE strftime('%Y-%m', created_at) = '2024-11'");
show("october days vs orders", "SELECT COUNT(DISTINCT created_at) days, COUNT(*) n FROM orders WHERE strftime('%Y-%m', created_at) = '2024-10'");
show("cancelled 2025 row", "SELECT id, created_at, total FROM orders WHERE status = 'cancelled' AND strftime('%Y', created_at) = '2025'");
show("weekday ladder", "SELECT strftime('%w', created_at) dow, COUNT(*) n, ROUND(SUM(total), 2) spend FROM orders GROUP BY dow ORDER BY spend DESC");
show("AOV ladder top3", "SELECT strftime('%Y-%m', created_at) mon, ROUND(AVG(total), 2) aov FROM orders GROUP BY mon ORDER BY aov DESC LIMIT 3");
show("AOV ladder bottom", "SELECT strftime('%Y-%m', created_at) mon, ROUND(AVG(total), 2) aov FROM orders GROUP BY mon ORDER BY aov ASC LIMIT 2");
show("max order detail", "SELECT id, customer_id, status, total, created_at FROM orders WHERE total = 1088.44");
show("min order detail", "SELECT id, status, total, created_at FROM orders WHERE total = 25.47");
attempt("julianday bare-number trap", "SELECT julianday('2024') j");
attempt("HAVING n = COUNT(*) always-true probe", "SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders GROUP BY mon HAVING n = COUNT(*)");

rmSync(COPY, { force: true });
console.log("\n(copy removed)");
