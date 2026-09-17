/// <reference types="bun-types" />
// m5-c2 probe tool — w2 date-bucket wave (cs-1240..1276). Read-only COPY of
// db/custom.db, self-deleting (.m5c2.db removed at end). Every figure used in
// cases-w2.ts must trace to this output. Run: bun scripts/m5-facts-c2.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5c2.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- A. expenses per-month + per-year staging ----
show("A1 expenses per month census", "SELECT strftime('%Y-%m', spent_on) mon, COUNT(*) n, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses GROUP BY mon ORDER BY mon");
show("A2 expenses per month by spend DESC", "SELECT strftime('%Y-%m', spent_on) mon, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses GROUP BY mon ORDER BY spend DESC LIMIT 3");
show("A3 ads per year", "SELECT strftime('%Y', spent_on) yr, COUNT(*) n, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses WHERE category = 'Ads' GROUP BY yr ORDER BY yr");
show("A4 ads per month", "SELECT strftime('%Y-%m', spent_on) mon, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses WHERE category = 'Ads' GROUP BY mon ORDER BY mon");
show("A5 tools per year", "SELECT strftime('%Y', spent_on) yr, COUNT(*) n, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses WHERE category = 'Tools' GROUP BY yr ORDER BY yr");
show("A6 expenses total", "SELECT COUNT(*) n, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses");

// ---- B. ledger per-month staging ----
show("B1 ledger per month census", "SELECT strftime('%Y-%m', entry_date) mon, COUNT(*) entries, ROUND(SUM(debit_cents - credit_cents)/100.0, 2) net FROM ledger_entries GROUP BY mon ORDER BY mon");
show("B2 ledger opening month 2024-01", "SELECT strftime('%Y-%m', entry_date) mon, COUNT(*) entries, ROUND(SUM(debit_cents - credit_cents)/100.0, 2) net FROM ledger_entries GROUP BY mon HAVING mon = '2024-01'");
show("B3 ledger closing month per account", "SELECT account, COUNT(*) entries, ROUND(SUM(debit_cents - credit_cents)/100.0, 2) net FROM ledger_entries WHERE strftime('%Y-%m', entry_date) = '2025-02' GROUP BY account ORDER BY net DESC");
show("B4 ledger months from 2024-08", "SELECT COUNT(DISTINCT strftime('%Y-%m', entry_date)) months FROM ledger_entries WHERE entry_date >= '2024-08-01'");
show("B5 ledger busiest by entries", "SELECT strftime('%Y-%m', entry_date) mon, COUNT(*) entries FROM ledger_entries GROUP BY mon ORDER BY entries DESC LIMIT 3");
show("B6 ledger opex per month", "SELECT strftime('%Y-%m', entry_date) mon, ROUND(SUM(debit_cents - credit_cents)/100.0, 2) net FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mon ORDER BY net DESC LIMIT 2");

// ---- C. lag distribution + durable quirks ----
show("C1 lag day census", "SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS days, COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL GROUP BY days ORDER BY days");
show("C2 julianday quirks", "SELECT julianday('2024-01-01') j1, julianday('2024-01') j2, strftime('%y-%m', created_at) ym, strftime('%M', created_at) mm, strftime('%H', created_at) hh, strftime('%s', created_at) ss FROM orders LIMIT 1");
show("C3 avg lag fleet", "SELECT COUNT(*) n, ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) lag FROM orders WHERE shipped_at IS NOT NULL");

// ---- D. quarter slicing ----
show("D1 Q1 2024 orders", "SELECT COUNT(*) orders, ROUND(SUM(total), 2) spend FROM orders WHERE strftime('%Y-%m', created_at) BETWEEN '2024-01' AND '2024-03'");
show("D2 Q1 2024 via SUBSTR", "SELECT COUNT(*) orders FROM orders WHERE SUBSTR(created_at, 6, 2) IN ('01','02','03') AND strftime('%Y', created_at) = '2024'");
show("D3 Nordic Q4 2024", "SELECT COUNT(DISTINCT o.id) orders FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Nordic Gadgets AB' AND strftime('%Y-%m', o.created_at) BETWEEN '2024-10' AND '2024-12'");
show("D4 Nordic Nov-Dec 2024", "SELECT COUNT(DISTINCT o.id) orders FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Nordic Gadgets AB' AND strftime('%Y-%m', o.created_at) BETWEEN '2024-11' AND '2024-12'");
show("D5 Midwest Q1 2024", "SELECT COUNT(DISTINCT o.id) orders FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Midwest Hardware Co' AND strftime('%Y-%m', o.created_at) BETWEEN '2024-01' AND '2024-03'");
show("D6 Midwest Feb-Mar 2024", "SELECT COUNT(DISTINCT o.id) orders FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Midwest Hardware Co' AND strftime('%Y-%m', o.created_at) BETWEEN '2024-02' AND '2024-03'");
show("D7 H1 2024 signups", "SELECT COUNT(*) n FROM customers WHERE strftime('%Y-%m', created_at) BETWEEN '2024-01' AND '2024-06'");
show("D8 Feb-Jun 2024 signups", "SELECT COUNT(*) n FROM customers WHERE strftime('%Y-%m', created_at) BETWEEN '2024-02' AND '2024-06'");

// ---- E. cancelled exposure + shipped_at NULL checks ----
show("E1 cancelled exposure by month", "SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) exposure, COUNT(*) n FROM orders WHERE status = 'cancelled' GROUP BY mon ORDER BY exposure DESC");
show("E2 cancelled merged %m exposure", "SELECT strftime('%m', created_at) m, ROUND(SUM(total), 2) exposure, COUNT(*) n FROM orders WHERE status = 'cancelled' GROUP BY m ORDER BY exposure DESC");
show("E3 cancelled shipped_at null check", "SELECT COUNT(*) n, COUNT(shipped_at) has_ship FROM orders WHERE status = 'cancelled'");
show("E4 cancelled 2025 detail", "SELECT id, date(created_at) day, total FROM orders WHERE status = 'cancelled' AND strftime('%Y', created_at) = '2025' ORDER BY id");
show("E5 unshipped by month", "SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders WHERE shipped_at IS NULL GROUP BY mon ORDER BY mon");
show("E6 unshipped via supplier join", "SELECT COUNT(*) rows_joined, COUNT(DISTINCT s.id) suppliers FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE o.shipped_at IS NULL");

// ---- F. invoice terms ----
show("F1 terms 30 by status", "SELECT status, COUNT(*) n FROM invoices WHERE julianday(due_on) - julianday(issued_on) = 30 GROUP BY status");
show("F2 plus-30-days by status", "SELECT status, COUNT(*) n FROM invoices WHERE due_on = date(issued_on, '+30 days') GROUP BY status");
show("F3 plus-1-month terms-30 paid", "SELECT COUNT(*) n FROM invoices WHERE due_on = date(issued_on, '+1 month') AND julianday(due_on) - julianday(issued_on) = 30 AND status = 'paid'");
show("F4 plus-1-month paid any", "SELECT COUNT(*) n FROM invoices WHERE due_on = date(issued_on, '+1 month') AND status = 'paid'");
show("F5 terms census", "SELECT julianday(due_on) - julianday(issued_on) terms, COUNT(*) n FROM invoices GROUP BY terms ORDER BY n DESC");

// ---- G. bucket quirks ----
show("G1 orders merged %m census", "SELECT strftime('%m', created_at) m, COUNT(*) n FROM orders GROUP BY m ORDER BY m");
show("G2 customers %d census", "SELECT strftime('%d', created_at) d, COUNT(*) n FROM customers GROUP BY d ORDER BY n DESC LIMIT 4");
show("G3 orders day-of-month '5'", "SELECT COUNT(*) n, ROUND(SUM(total), 2) spend FROM orders WHERE strftime('%d', created_at) = '5'");
show("G4 max created_at in merged 02", "SELECT MAX(created_at) mx, MIN(created_at) mn, COUNT(*) n FROM orders WHERE strftime('%m', created_at) = '02'");
show("G5 orders %d max", "SELECT strftime('%d', created_at) d, COUNT(*) n FROM orders GROUP BY d ORDER BY n DESC LIMIT 2");
show("G6 %W top recheck", "SELECT strftime('%W', created_at) wk, COUNT(*) n FROM orders GROUP BY wk ORDER BY n DESC LIMIT 2");

// ---- H. region month slices ----
show("H1 region 2024-09", "SELECT c.region, COUNT(*) n, ROUND(SUM(o.total), 2) spend FROM orders o JOIN customers c ON c.id = o.customer_id WHERE strftime('%Y-%m', o.created_at) = '2024-09' GROUP BY c.region ORDER BY spend DESC");
show("H2 region 2024-02", "SELECT c.region, COUNT(*) n, ROUND(SUM(o.total), 2) spend FROM orders o JOIN customers c ON c.id = o.customer_id WHERE strftime('%Y-%m', o.created_at) = '2024-02' GROUP BY c.region ORDER BY spend DESC");
show("H3 region 2024-01 merged 01", "SELECT c.region, COUNT(*) n, ROUND(SUM(o.total), 2) spend FROM orders o JOIN customers c ON c.id = o.customer_id WHERE strftime('%m', o.created_at) = '01' GROUP BY c.region ORDER BY spend DESC");

// ---- I. quarter category items ----
show("I1 Q4 2024 items top", "SELECT p.category, COUNT(*) items FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE strftime('%Y', o.created_at) = '2024' AND SUBSTR(o.created_at, 6, 2) IN ('10','11','12') GROUP BY p.category ORDER BY items DESC LIMIT 3");
show("I2 Q3 2024 items top", "SELECT p.category, COUNT(*) items FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE strftime('%Y', o.created_at) = '2024' AND SUBSTR(o.created_at, 6, 2) IN ('07','08','09') GROUP BY p.category ORDER BY items DESC LIMIT 3");
show("I3 Q4 2024 item total", "SELECT COUNT(*) items FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE strftime('%Y', o.created_at) = '2024' AND SUBSTR(o.created_at, 6, 2) IN ('10','11','12')");

// ---- J. re-verifiable anchors ----
show("J1 AOV 2024-01", "SELECT strftime('%Y-%m', created_at) mon, ROUND(AVG(total), 2) aov, COUNT(*) n FROM orders GROUP BY mon HAVING mon = '2024-01'");
show("J2 dow buckets over 6000", "SELECT strftime('%w', created_at) dow, COUNT(*) n, ROUND(SUM(total), 2) spend FROM orders GROUP BY dow HAVING spend > 6000 ORDER BY spend DESC");
show("J3 lag top month recheck", "SELECT strftime('%Y-%m', created_at) mon, COUNT(shipped_at) n, ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) lag FROM orders WHERE shipped_at IS NOT NULL GROUP BY mon ORDER BY lag DESC LIMIT 2");
show("J4 year census recheck", "SELECT strftime('%Y', created_at) yr, COUNT(*) n, ROUND(SUM(total), 2) spend FROM orders GROUP BY yr ORDER BY yr");
show("J5 cohort 2023-11 orders", "SELECT strftime('%Y-%m', c.created_at) cohort, COUNT(o.id) orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY cohort HAVING cohort = '2023-11'");

rmSync(COPY, { force: true });
console.log("\n(copy removed)");
