/// <reference types="bun-types" />
/** M5 wave-1 fact probes — t1 text / t2 coalesce / t3 dates / t4 buckets.
 *  Every figure used in cs-1201…cs-1250 must carry a receipt here. */
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
let n = 0;
const q = (label: string, sql: string) => {
  n++;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const cells = rows.map((r) => Object.values(r).map((v) => (v === null ? "NULL" : typeof v === "number" ? (Number.isInteger(v) ? v : Number(v.toFixed(6))) : v)).join(" | "));
    console.log(`T${String(n).padStart(2, "0")} ${label}`);
    console.log(`   ${cells.slice(0, 24).join("  ;;  ") || "(0 rows)"}`);
  } catch (e) {
    console.log(`T${String(n).padStart(2, "0")} ${label} ERROR: ${e instanceof Error ? e.message : e}`);
  }
};

// ---------- base truth ----------
q("customers all", `SELECT id, name, email, city, region, active, created_at FROM customers ORDER BY id`);
q("products all", `SELECT id, name, category, price, stock, supplier_id FROM products ORDER BY id`);
q("suppliers all", `SELECT id, name, region, rating FROM suppliers ORDER BY id`);
q("status census", `SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY n DESC`);
q("orders date span", `SELECT MIN(created_at), MAX(created_at), COUNT(*) FROM orders`);
q("customers date span", `SELECT MIN(created_at), MAX(created_at), COUNT(*) FROM customers`);
q("shipped_at NULL census", `SELECT status, COUNT(*) FROM orders WHERE shipped_at IS NULL GROUP BY status`);
q("shipped_at present census", `SELECT status, COUNT(*) FROM orders WHERE shipped_at IS NOT NULL GROUP BY status`);

// ---------- t1: text & type ----------
q("name length spread", `SELECT LENGTH(name) len, COUNT(*) n FROM customers GROUP BY len ORDER BY len`);
q("longest names", `SELECT name, LENGTH(name) FROM customers ORDER BY LENGTH(name) DESC, name LIMIT 5`);
q("shortest names", `SELECT name, LENGTH(name) FROM customers ORDER BY LENGTH(name), name LIMIT 5`);
q("email domain census", `SELECT SUBSTR(email, INSTR(email, '@') + 1) AS dom, COUNT(*) n FROM customers GROUP BY dom ORDER BY n DESC`);
q("city length spread", `SELECT city, LENGTH(city) FROM customers ORDER BY LENGTH(city) DESC, city`);
q("upper city distinct", `SELECT DISTINCT UPPER(city) u FROM customers ORDER BY u`);
q("product name lengths", `SELECT name, LENGTH(name) FROM products ORDER BY LENGTH(name) DESC LIMIT 6`);
q("product name shortest", `SELECT name, LENGTH(name) FROM products ORDER BY LENGTH(name) LIMIT 4`);
q("product name length avg", `SELECT ROUND(AVG(LENGTH(name)), 2) FROM products`);
q("status upper census", `SELECT UPPER(status) u, COUNT(*) FROM orders GROUP BY u ORDER BY 2 DESC`);
q("region lower", `SELECT DISTINCT LOWER(region) FROM customers ORDER BY 1`);
q("cast price int distinct", `SELECT DISTINCT CAST(price AS INTEGER) FROM products ORDER BY 1`);
q("name first initial census", `SELECT SUBSTR(name, 1, 1) ini, COUNT(*) n FROM customers GROUP BY ini ORDER BY n DESC, ini`);
q("name space position", `SELECT name, INSTR(name, ' ') FROM customers ORDER BY id LIMIT 8`);
q("lastname extract", `SELECT name, SUBSTR(name, INSTR(name, ' ') + 1) last FROM customers ORDER BY last LIMIT 10`);
q("city 3-char code", `SELECT UPPER(SUBSTR(city, 1, 3)) code, COUNT(*) n FROM customers GROUP BY code ORDER BY n DESC, code`);
q("email before-at length", `SELECT ROUND(AVG(INSTR(email, '@') - 1), 2) FROM customers`);
q("product names with space", `SELECT COUNT(*) FROM products WHERE INSTR(name, ' ') > 0`);
q("product single-word names", `SELECT name FROM products WHERE INSTR(name, ' ') = 0`);
q("replace region label", `SELECT DISTINCT REPLACE(region, '_', ' ') FROM customers`);
q("trim probe padded", `SELECT COUNT(*) FROM customers WHERE name != TRIM(name)`);
q("stock cast text len", `SELECT name, LENGTH(CAST(stock AS TEXT)) FROM products ORDER BY stock DESC LIMIT 5`);
q("supplier name lengths", `SELECT name, LENGTH(name), rating FROM suppliers ORDER BY LENGTH(name) DESC`);
q("cities census", `SELECT city, COUNT(*) n FROM customers GROUP BY city ORDER BY n DESC, city`);
q("longest product name", `SELECT name FROM products ORDER BY LENGTH(name) DESC, name LIMIT 1`);

// ---------- t2: coalesce / NULLs ----------
q("orders never shipped count", `SELECT COUNT(*) FROM orders WHERE shipped_at IS NULL`);
q("never-shipped by status", `SELECT status, COUNT(*) n FROM orders WHERE shipped_at IS NULL GROUP BY status ORDER BY n DESC`);
q("customers without orders", `SELECT COUNT(*) c FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`);
q("customers-without-orders names", `SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`);
q("coalesce zero-fill spend", `SELECT c.name, COALESCE(SUM(o.total), 0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY spend LIMIT 6`);
q("zero-spend members", `SELECT COUNT(*) FROM (SELECT c.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COALESCE(SUM(o.total), 0) = 0)`);
q("ifnull shipped flag census", `SELECT SUM(CASE WHEN shipped_at IS NULL THEN 1 ELSE 0 END) never, SUM(CASE WHEN shipped_at IS NOT NULL THEN 1 ELSE 0 END) ever FROM orders`);
q("nullif zero orders", `SELECT COUNT(*) FROM orders WHERE NULLIF(total, 0) IS NULL`);
q("nullif totals zero count", `SELECT SUM(CASE WHEN total = 0 THEN 1 ELSE 0 END) FROM orders`);
q("min order total", `SELECT MIN(total), ROUND(AVG(total), 2) FROM orders`);
q("distinct totals zero or neg", `SELECT COUNT(*) FROM orders WHERE total <= 0`);
q("inactive customers", `SELECT COUNT(*) FROM customers WHERE active = 0`);
q("zero-stock products", `SELECT name, stock FROM products WHERE stock = 0`);
q("products never ordered", `SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL`);
q("coalesce ship-or-pending label", `SELECT COALESCE(shipped_at, 'not shipped') lab, COUNT(*) FROM orders GROUP BY lab ORDER BY 2 DESC LIMIT 6`);
q("customers per city zero-fill", `SELECT COUNT(*) FROM customers WHERE city = 'Portland'`);

// ---------- t3: dates ----------
q("ship lag avg days", `SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) FROM orders WHERE shipped_at IS NOT NULL`);
q("ship lag min max", `SELECT ROUND(MIN(julianday(shipped_at) - julianday(created_at)), 2), ROUND(MAX(julianday(shipped_at) - julianday(created_at)), 2) FROM orders WHERE shipped_at IS NOT NULL`);
q("same-day ships", `SELECT COUNT(*) FROM orders WHERE julianday(shipped_at) - julianday(created_at) < 1 AND shipped_at IS NOT NULL`);
q("lag over 5 days", `SELECT COUNT(*) FROM orders WHERE julianday(shipped_at) - julianday(created_at) > 5`);
q("weekday census of order days", `SELECT strftime('%w', created_at) wd, COUNT(*) n FROM orders GROUP BY wd ORDER BY n DESC`);
q("Sunday orders (w=0)", `SELECT COUNT(*) FROM orders WHERE strftime('%w', created_at) = '0'`);
q("weekend orders", `SELECT COUNT(*) FROM orders WHERE strftime('%w', created_at) IN ('0', '6')`);
q("date-only distinct days", `SELECT COUNT(DISTINCT DATE(created_at)) FROM orders`);
q("signup day-of-month spread", `SELECT CAST(strftime('%d', created_at) AS INTEGER) d, COUNT(*) FROM customers GROUP BY d ORDER BY d`);
q("signup month census", `SELECT strftime('%Y-%m', created_at) mo, COUNT(*) FROM customers GROUP BY mo ORDER BY mo`);
q("orders in Jan 2024", `SELECT COUNT(*) FROM orders WHERE DATE(created_at) BETWEEN '2024-01-01' AND '2024-01-31'`);
q("invoice due span", `SELECT MIN(due_on), MAX(due_on), COUNT(*) FROM invoices`);
q("payments span", `SELECT MIN(paid_on), MAX(paid_on), COUNT(*) FROM payments`);
q("orders on 2024-01-15", `SELECT COUNT(*) FROM orders WHERE DATE(created_at) = '2024-01-15'`);
q("shipped-at same-as-created count", `SELECT COUNT(*) FROM orders WHERE DATE(shipped_at) = DATE(created_at) AND shipped_at IS NOT NULL`);
q("customers created 2023", `SELECT COUNT(*) FROM customers WHERE created_at < '2024-01-01'`);
q("newest customers", `SELECT name, created_at FROM customers ORDER BY created_at DESC LIMIT 4`);

// ---------- t4: month buckets ----------
q("order month buckets", `SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo ORDER BY mo`);
q("bucket count", `SELECT COUNT(*) FROM (SELECT DISTINCT strftime('%Y-%m', created_at) FROM orders)`);
q("revenue per month", `SELECT strftime('%Y-%m', created_at) mo, ROUND(SUM(total), 2) rev FROM orders GROUP BY mo ORDER BY rev DESC LIMIT 6`);
q("orders 2024-02 detail", `SELECT COUNT(*), ROUND(SUM(total), 2) FROM orders WHERE strftime('%Y-%m', created_at) = '2024-02'`);
q("month-by-status delivered rev", `SELECT strftime('%Y-%m', created_at) mo, ROUND(SUM(total), 2) FROM orders WHERE status = 'delivered' GROUP BY mo ORDER BY mo LIMIT 6`);
q("invoice issue months", `SELECT COUNT(*) FROM (SELECT DISTINCT strftime('%Y-%m', issued_on) FROM invoices)`);
q("payment months", `SELECT COUNT(*) FROM (SELECT DISTINCT strftime('%Y-%m', paid_on) FROM payments)`);
q("expenses months", `SELECT COUNT(*) FROM (SELECT DISTINCT strftime('%Y-%m', spent_on) FROM expenses)`);
q("signup quarters", `SELECT (CAST(strftime('%m', created_at) AS INTEGER) + 2) / 3 q, COUNT(*) FROM customers GROUP BY q ORDER BY q`);
q("month bucket 2024-01 rev", `SELECT ROUND(SUM(total), 2) FROM orders WHERE strftime('%Y-%m', created_at) = '2024-01'`);
q("busiest month", `SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo ORDER BY n DESC, mo LIMIT 3`);
q("quietest months", `SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo ORDER BY n, mo LIMIT 4`);
db.close();
