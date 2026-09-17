/// <reference types="bun-types" />
// m5-c-r2 probe tool — read-only COPY of db/custom.db, self-deleting.
// Every figure used in cases-r2.ts (w2 date buckets, cs-1246..1288) must trace to this output.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5c-r2.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- cancelled (refund-audit universe) ----
show("cancelled per month", "SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders WHERE status = 'cancelled' GROUP BY mon ORDER BY mon");
show("cancelled total", "SELECT COUNT(*) n FROM orders WHERE status = 'cancelled'");
show("cancelled 2025", "SELECT COUNT(*) n FROM orders WHERE status = 'cancelled' AND created_at >= '2025-01-01'");
show("cancelled on 2025-01-01", "SELECT COUNT(*) n FROM orders WHERE status = 'cancelled' AND created_at >= '2025-01-01' AND created_at < '2025-01-02'");
show("cancelled detail", "SELECT id, created_at, total FROM orders WHERE status = 'cancelled' ORDER BY id");

// ---- region x month (growth hard) ----
show("region spend 2024-01", "SELECT c.region, COUNT(*) n, ROUND(SUM(o.total), 2) spend FROM orders o JOIN customers c ON c.id = o.customer_id WHERE strftime('%Y-%m', o.created_at) = '2024-01' GROUP BY c.region ORDER BY spend DESC");
show("orders per region overall", "SELECT c.region, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY n DESC");

// ---- weekday spend ladder (pricing hard) ----
show("weekday spend ladder", "SELECT strftime('%w', created_at) dow, COUNT(*) n, ROUND(SUM(total), 2) spend FROM orders GROUP BY dow ORDER BY spend DESC");
show("friday only", "SELECT strftime('%w', created_at) dow, COUNT(*) n, ROUND(SUM(total), 2) spend FROM orders WHERE strftime('%w', created_at) = '5' GROUP BY dow");
show("thursday only", "SELECT strftime('%w', created_at) dow, COUNT(*) n, ROUND(SUM(total), 2) spend FROM orders WHERE strftime('%w', created_at) = '4' GROUP BY dow");
show("saturday only", "SELECT strftime('%w', created_at) dow, COUNT(*) n, ROUND(SUM(total), 2) spend FROM orders WHERE strftime('%w', created_at) = '6' GROUP BY dow");
show("%W bucket census top", "SELECT strftime('%W', created_at) wk, COUNT(*) n FROM orders GROUP BY wk ORDER BY n DESC LIMIT 3");

// ---- order_items x orders x products (catalog) ----
show("category items 2024-01", "SELECT p.category, COUNT(*) n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE strftime('%Y-%m', o.created_at) = '2024-01' GROUP BY p.category ORDER BY n DESC");
show("category items 2025", "SELECT p.category, COUNT(*) n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE strftime('%Y', o.created_at) = '2025' GROUP BY p.category ORDER BY n DESC");
show("category items 2025 sum qty", "SELECT p.category, COUNT(*) n, SUM(oi.quantity) units FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE strftime('%Y', o.created_at) = '2025' GROUP BY p.category ORDER BY n DESC");

// ---- supplier joins ----
show("orders per supplier", "SELECT s.id, s.name, COUNT(DISTINCT o.id) n_orders, COUNT(*) n_rows FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY s.id");
show("supplier1 by month", "SELECT strftime('%Y-%m', o.created_at) mon, COUNT(DISTINCT o.id) n FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Nordic Gadgets AB' GROUP BY mon ORDER BY mon");
show("supplier1 2024-03", "SELECT strftime('%Y-%m', o.created_at) mon, COUNT(DISTINCT o.id) n FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Nordic Gadgets AB' AND strftime('%Y-%m', o.created_at) = '2024-03' GROUP BY mon");
show("supplier1 2024-03 count(*) fanout", "SELECT COUNT(*) n FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Nordic Gadgets AB' AND strftime('%Y-%m', o.created_at) = '2024-03'");
show("supplier avg ship lag", "SELECT s.name, COUNT(*) n, ROUND(AVG(julianday(o.shipped_at) - julianday(o.created_at)), 2) lag FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE o.shipped_at IS NOT NULL GROUP BY s.id ORDER BY lag DESC");
show("supplier min lag", "SELECT s.name, ROUND(MIN(julianday(o.shipped_at) - julianday(o.created_at)), 2) lag FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE o.shipped_at IS NOT NULL GROUP BY s.id ORDER BY lag DESC LIMIT 1");

// ---- cohorts (funnel) ----
show("cohort buyers", "SELECT strftime('%Y-%m', c.created_at) cohort, COUNT(DISTINCT c.id) signups, COUNT(DISTINCT o.customer_id) buyers, COUNT(DISTINCT o.id) orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY cohort ORDER BY cohort");
show("cohort buyers INNER", "SELECT strftime('%Y-%m', c.created_at) cohort, COUNT(DISTINCT c.id) signups FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY cohort ORDER BY cohort");
show("2023-11 cohort fanout", "SELECT COUNT(c.id) n_fan, COUNT(DISTINCT c.id) n_cust, COUNT(DISTINCT o.id) n_ord FROM customers c JOIN orders o ON o.customer_id = c.id WHERE strftime('%Y-%m', c.created_at) = '2023-11'");
show("H1 2024 signups", "SELECT COUNT(*) n FROM customers WHERE strftime('%Y-%m', created_at) BETWEEN '2024-01' AND '2024-06'");
show("H1 2024 distinct regions", "SELECT COUNT(DISTINCT region) n FROM customers WHERE strftime('%Y-%m', created_at) BETWEEN '2024-01' AND '2024-06'");
show("H1 2024 with july", "SELECT COUNT(*) n FROM customers WHERE strftime('%Y-%m', created_at) BETWEEN '2024-01' AND '2024-07'");

// ---- invoices ----
show("invoice due-month census", "SELECT strftime('%Y-%m', due_on) mon, COUNT(*) n FROM invoices GROUP BY mon ORDER BY mon");
show("invoice issue %m census", "SELECT strftime('%m', issued_on) m, COUNT(*) n FROM invoices GROUP BY m ORDER BY m");
show("terms exactly 30", "SELECT COUNT(*) n FROM invoices WHERE julianday(due_on) - julianday(issued_on) = 30");
show("terms via +30 days", "SELECT COUNT(*) n FROM invoices WHERE due_on = date(issued_on, '+30 days')");
show("terms via +29 days", "SELECT COUNT(*) n FROM invoices WHERE due_on = date(issued_on, '+29 days')");
show("terms via +1 month", "SELECT COUNT(*) n FROM invoices WHERE due_on = date(issued_on, '+1 month')");
show("due 2024-03 count", "SELECT COUNT(*) n FROM invoices WHERE strftime('%Y-%m', due_on) = '2024-03'");
show("max due weekday chase", "SELECT MAX(due_on) mx, strftime('%w', MAX(due_on)) dow, date(MAX(due_on), 'weekday 1') chase, date(MAX(due_on), 'weekday 0') sun, date(MAX(due_on), 'weekday 2') tue, MIN(due_on) mn FROM invoices");
show("invoice status census", "SELECT status, COUNT(*) n FROM invoices GROUP BY status");

// ---- ledger (month-close hard) ----
show("ledger shape", "SELECT COUNT(*) n, MIN(entry_date) mn, MAX(entry_date) mx, COUNT(DISTINCT strftime('%Y-%m', entry_date)) buckets FROM ledger_entries");
show("ledger account census", "SELECT account, COUNT(*) n, ROUND(SUM(debit_cents - credit_cents)/100.0, 2) net FROM ledger_entries GROUP BY account");
show("opex monthly nets top", "SELECT strftime('%Y-%m', entry_date) mon, ROUND(SUM(debit_cents - credit_cents)/100.0, 2) net FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mon ORDER BY net DESC LIMIT 1");
show("cash monthly nets top", "SELECT strftime('%Y-%m', entry_date) mon, ROUND(SUM(debit_cents - credit_cents)/100.0, 2) net FROM ledger_entries WHERE account = 'cash' GROUP BY mon ORDER BY net DESC LIMIT 1");
show("opex bare col trap", "SELECT strftime('%Y-%m', entry_date) mon, debit_cents - credit_cents AS net FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mon ORDER BY mon LIMIT 3");

// ---- expenses ----
show("tools 2024", "SELECT ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses WHERE category = 'Tools' AND strftime('%Y', spent_on) = '2024'");
show("tools 2025", "SELECT ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses WHERE category = 'Tools' AND strftime('%Y', spent_on) = '2025'");
show("tools max row", "SELECT ROUND(MAX(amount_cents)/100.0, 2) mx FROM expenses WHERE category = 'Tools'");
show("travel months", "SELECT strftime('%Y-%m', spent_on) mon, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses WHERE category = 'Travel' GROUP BY mon ORDER BY spend DESC");
show("tools months", "SELECT strftime('%Y-%m', spent_on) mon, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses WHERE category = 'Tools' GROUP BY mon ORDER BY spend DESC");
show("aug itemized", "SELECT category, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses WHERE strftime('%Y-%m', spent_on) = '2024-08' GROUP BY category ORDER BY spend DESC");
show("sep itemized", "SELECT category, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses WHERE strftime('%Y-%m', spent_on) = '2024-09' GROUP BY category ORDER BY spend DESC");

// ---- orders misc for slot figures ----
show("2025 receipts count+avg", "SELECT COUNT(*) n, ROUND(AVG(total), 2) avg_total, ROUND(SUM(total), 2) spend FROM orders WHERE strftime('%Y', created_at) = '2025'");
show("golden AOV 2024-01", "SELECT strftime('%Y-%m', created_at) mon, ROUND(AVG(total), 2) aov, ROUND(AVG(total), 0) aov0, COUNT(*) n FROM orders WHERE strftime('%Y-%m', created_at) = '2024-01' GROUP BY mon");
show("AOV ladder asc bottom", "SELECT strftime('%Y-%m', created_at) mon, ROUND(AVG(total), 2) aov FROM orders GROUP BY mon ORDER BY aov ASC LIMIT 1");
show("AOV ladder desc top2", "SELECT strftime('%Y-%m', created_at) mon, ROUND(AVG(total), 2) aov FROM orders GROUP BY mon ORDER BY aov DESC LIMIT 2");
show("quiet AOV 2024-07", "SELECT ROUND(AVG(total), 2) aov, ROUND(SUM(total), 2) spend FROM orders WHERE strftime('%Y-%m', created_at) = '2024-07'");
show("quiet AOV 2024-06", "SELECT ROUND(AVG(total), 2) aov FROM orders WHERE strftime('%Y-%m', created_at) = '2024-06'");
show("october count", "SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders WHERE strftime('%Y-%m', created_at) = '2024-10' GROUP BY mon");
show("november count", "SELECT COUNT(*) n FROM orders WHERE strftime('%Y-%m', created_at) = '2024-11'");
show("orders on 2025-01-01", "SELECT COUNT(*) n FROM orders WHERE created_at = '2025-01-01'");
show("orders on 2024-02-01", "SELECT COUNT(*) n FROM orders WHERE created_at = '2024-02-01'");
show("feb like first day", "SELECT COUNT(*) n, MIN(created_at) first_day, MAX(created_at) last_day FROM orders WHERE created_at LIKE '2024-02-%'");
show("jan 2024 like", "SELECT COUNT(*) n FROM orders WHERE created_at LIKE '2024-01-%'");
show(">= 2024-07 orders", "SELECT COUNT(*) n FROM orders WHERE strftime('%Y-%m', created_at) >= '2024-07'");
show("> 2024-07 orders", "SELECT COUNT(*) n FROM orders WHERE strftime('%Y-%m', created_at) > '2024-07'");
show(">= 2024-06 orders", "SELECT COUNT(*) n FROM orders WHERE strftime('%Y-%m', created_at) >= '2024-06'");
show("pre-2025 orders", "SELECT COUNT(*) n FROM orders WHERE created_at < '2025-01-01'");
show("through jan2025", "SELECT COUNT(*) n FROM orders WHERE created_at <= '2025-01-31'");

// ---- ship lag monthly (inventory hard) ----
show("lag by month top", "SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n, ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) lag FROM orders WHERE shipped_at IS NOT NULL GROUP BY mon ORDER BY lag DESC");
show("lag by month bottom", "SELECT strftime('%Y-%m', created_at) mon, ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) lag FROM orders WHERE shipped_at IS NOT NULL GROUP BY mon ORDER BY lag ASC LIMIT 1");

// ---- burst days (fraud hard) ----
show("triple days", "SELECT date(created_at) d, strftime('%w', created_at) dow, COUNT(*) n FROM orders GROUP BY d HAVING n = 3 ORDER BY d");
show("double days count", "SELECT COUNT(*) n FROM (SELECT created_at FROM orders GROUP BY created_at HAVING COUNT(*) = 2)");
show("single-row HAVING sanity", "SELECT COUNT(*) n FROM orders WHERE created_at LIKE '2024-02-%' HAVING n = 9");
show("julianday of rollover", "SELECT julianday('2024-02-30') j, julianday('2024-02-29') j29, printf('%Y-%m', '2024-02-30') pf, printf('2024-02-30') pf2, strftime('%Y-%m', '2024-02-30') sm");

// ---- distractor consequence spot checks ----
show("1254 order-by julianday(mon) vs DESC", "SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM customers GROUP BY mon ORDER BY julianday(mon) DESC");
show("1254 order-by DESC", "SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM customers GROUP BY mon ORDER BY mon DESC");
show("1250 %W max", "SELECT strftime('%W', created_at) wk, COUNT(*) n FROM orders GROUP BY wk ORDER BY n DESC LIMIT 1");
show("1250 %d max", "SELECT strftime('%d', created_at) d, COUNT(*) n FROM orders GROUP BY d ORDER BY n DESC LIMIT 1");
show("1266 %m refunded shape", "SELECT strftime('%m', created_at) m, COUNT(*) n FROM orders WHERE status = 'cancelled' GROUP BY m ORDER BY m");

// ---- probe round 2: distractor safety ----
show("2025 status census", "SELECT status, COUNT(*) n FROM orders WHERE strftime('%Y', created_at) = '2025' GROUP BY status ORDER BY n DESC");
show("2025 shipped count", "SELECT COUNT(shipped_at) n, MAX(total) mx, ROUND(SUM(total), 2) spend FROM orders WHERE strftime('%Y', created_at) = '2025'");
show("2025 pending count", "SELECT COUNT(*) n FROM orders WHERE strftime('%Y', created_at) = '2025' AND status = 'pending'");
show("midwest by month distinct+fanout", "SELECT strftime('%Y-%m', o.created_at) mon, COUNT(DISTINCT o.id) n_dist, COUNT(*) n_rows FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Midwest Hardware Co' GROUP BY mon ORDER BY mon");
show("2024-01 category units+orders", "SELECT p.category, COUNT(*) n_items, SUM(oi.quantity) units, COUNT(DISTINCT oi.order_id) n_orders FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE strftime('%Y-%m', o.created_at) = '2024-01' GROUP BY p.category ORDER BY n_items DESC");
show("2025 category units", "SELECT p.category, COUNT(*) n_items, SUM(oi.quantity) units FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE strftime('%Y', o.created_at) = '2025' GROUP BY p.category ORDER BY n_items DESC");
try { console.log("SUM(*) error check", JSON.stringify(q("SELECT COUNT(*) n FROM customers WHERE SUM(*)"))); } catch (e) { console.log("SUM(*) error check THROWS:", e instanceof Error ? e.message : String(e)); }
show("GROUP BY count-alias error check", "SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM customers GROUP BY mon");
try { console.log("GROUP BY n alias", JSON.stringify(q("SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM customers GROUP BY n"))); } catch (e) { console.log("GROUP BY n alias THROWS:", e instanceof Error ? e.message : String(e)); }
show("october distinct days", "SELECT COUNT(DISTINCT created_at) d, COUNT(*) n FROM orders WHERE strftime('%Y-%m', created_at) = '2024-10'");
show("expenses %m >3000 shape", "SELECT strftime('%m', spent_on) m, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses GROUP BY m HAVING spend > 3000 ORDER BY m");
show("orders %m >3000 shape", "SELECT strftime('%m', created_at) m, COUNT(*) n, ROUND(SUM(total), 2) spend FROM orders GROUP BY m HAVING spend > 3000 ORDER BY m");
show("travel %m shape", "SELECT strftime('%m', spent_on) m, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses WHERE category = 'Travel' GROUP BY m ORDER BY spend DESC");
show("cancelled %m n=2 shape", "SELECT strftime('%m', created_at) m, COUNT(*) n FROM orders WHERE status = 'cancelled' GROUP BY m HAVING n = 2 ORDER BY m");
show("friday AVG/MAX", "SELECT ROUND(AVG(total), 2) av, ROUND(MAX(total), 2) mx FROM orders WHERE strftime('%w', created_at) = '5'");
show("shipped 2025 count only", "SELECT COUNT(shipped_at) n FROM orders WHERE strftime('%Y', created_at) = '2025'");
show("category items 2024 whole year", "SELECT p.category, COUNT(*) n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE strftime('%Y', o.created_at) = '2024' GROUP BY p.category ORDER BY n DESC");

// ---- probe round 3: distractor collisions ----
show("shipped per month n=2", "SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders WHERE status = 'shipped' GROUP BY mon HAVING n = 2 ORDER BY mon");
show("pending per month n=2", "SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders WHERE status = 'pending' GROUP BY mon HAVING n = 2 ORDER BY mon");
show("shenzhen 2024-09 distinct", "SELECT COUNT(DISTINCT o.id) n FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Shenzhen Electro' AND strftime('%Y-%m', o.created_at) = '2024-09'");
show("alpine lag row", "SELECT s.name, COUNT(*) n, ROUND(AVG(julianday(o.shipped_at) - julianday(o.created_at)), 2) lag FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE o.shipped_at IS NOT NULL GROUP BY s.id ORDER BY lag DESC LIMIT 1");

rmSync(COPY, { force: true });
console.log("\n(copy removed)");
