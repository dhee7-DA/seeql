/// <reference types="bun-types" />
/** Probe: NULL census + candidate figures for t5 wave-5 rewrites. */
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });

const q = (sql: string) => {
  try {
    return JSON.stringify(db.query(sql).all());
  } catch (e) {
    return "ERR: " + (e instanceof Error ? e.message : String(e));
  }
};

console.log("== NULL census ==");
for (const [t, cols] of [
  ["customers", ["name", "email", "city", "region", "active", "created_at"]],
  ["orders", ["customer_id", "status", "total", "created_at"]],
  ["products", ["name", "category", "price", "stock", "supplier_id"]],
  ["suppliers", ["name", "region", "rating"]],
  ["order_items", ["order_id", "product_id", "quantity", "unit_price"]],
] as [string, string[]][]) {
  const sel = cols.map((c) => `SUM(CASE WHEN ${c} IS NULL THEN 1 ELSE 0 END) AS ${c}_nulls`).join(", ");
  console.log(t, q(`SELECT COUNT(*) n, ${sel} FROM ${t}`));
}

console.log("\n== created_at format check ==");
console.log("sample:", q("SELECT created_at FROM orders LIMIT 3"));
console.log("date-clean orders:", q("SELECT COUNT(*) n FROM orders WHERE DATE(created_at) = created_at"));
console.log("date-clean customers:", q("SELECT COUNT(*) n FROM customers WHERE DATE(created_at) = created_at"));
console.log("date-clean products-name-clean:", q("SELECT COUNT(*) n FROM products WHERE TRIM(name) = name"));

console.log("\n== candidate figures (t2 rewrites) ==");
console.log("cancelled census:", q("SELECT COUNT(*) n FROM orders WHERE NULLIF(status, 'cancelled') IS NULL"));
console.log("pending census:", q("SELECT COUNT(*) n FROM orders WHERE NULLIF(status, 'pending') IS NULL"));
console.log("qty=1 lines:", q("SELECT COUNT(*) n FROM order_items WHERE NULLIF(quantity, '1') IS NULL"));
console.log("qty=2 lines:", q("SELECT COUNT(*) n FROM order_items WHERE NULLIF(quantity, '2') IS NULL"));
console.log("qty min/max:", q("SELECT MIN(quantity) a, MAX(quantity) b FROM order_items"));
console.log("qty=0 lines (honest zero):", q("SELECT COUNT(*) n FROM order_items WHERE NULLIF(quantity, 0) IS NULL"));
console.log("unit_price min:", q("SELECT MIN(unit_price) a FROM order_items"));
console.log("pending > 100:", q("SELECT COUNT(*) n FROM orders WHERE COALESCE(total, 0) > 100 AND status = 'pending'"));
console.log("pending > 300:", q("SELECT COUNT(*) n FROM orders WHERE COALESCE(total, 0) > 300 AND status = 'pending'"));
console.log("pending < 100:", q("SELECT COUNT(*) n FROM orders WHERE COALESCE(total, 0) < 100 AND status = 'pending'"));
console.log("orders > 800:", q("SELECT COUNT(*) n FROM orders WHERE COALESCE(total, 0) > 800"));
console.log("orders > 700:", q("SELECT COUNT(*) n FROM orders WHERE COALESCE(total, 0) > 700"));
console.log("orders < 800:", q("SELECT COUNT(*) n FROM orders WHERE COALESCE(total, 0) < 800"));
console.log("item pot vs total mismatches:", q(`SELECT COUNT(*) n FROM (
  SELECT o.id, o.total, COALESCE(i.pot, 0) AS pot FROM orders o
  LEFT JOIN (SELECT order_id, SUM(quantity * unit_price) AS pot FROM order_items GROUP BY order_id) i ON i.order_id = o.id
) WHERE ROUND(pot, 2) != ROUND(total, 2)`));
console.log("mismatches (raw float):", q(`SELECT COUNT(*) n FROM (
  SELECT o.id, o.total, COALESCE(i.pot, 0) AS pot FROM orders o
  LEFT JOIN (SELECT order_id, SUM(quantity * unit_price) AS pot FROM order_items GROUP BY order_id) i ON i.order_id = o.id
) WHERE pot != total`));
console.log("2025 orders:", q("SELECT COUNT(*) n FROM orders WHERE IFNULL(created_at, '1900-01-01') >= '2025-01-01'"));
console.log("2024 orders:", q("SELECT COUNT(*) n FROM orders WHERE IFNULL(created_at, '1900-01-01') < '2025-01-01'"));
console.log("single-line orders pot:", q(`SELECT SUM(o.total) pot, COUNT(*) n FROM orders o WHERE o.id IN (
  SELECT order_id FROM order_items GROUP BY order_id HAVING COUNT(*) = 1)`));
console.log("two-line orders n:", q(`SELECT COUNT(*) n FROM orders o WHERE o.id IN (
  SELECT order_id FROM order_items GROUP BY order_id HAVING COUNT(*) = 2)`));
console.log("months with pending:", q("SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) n FROM orders WHERE COALESCE(status, 'x') = 'pending'"));
console.log("months with cancelled:", q("SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) n FROM orders WHERE COALESCE(status, 'x') = 'cancelled'"));
console.log("months all orders:", q("SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) n FROM orders"));
console.log("months not-cancelled:", q("SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) n FROM orders WHERE status NOT IN ('cancelled')"));
console.log("months not-pending:", q("SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) n FROM orders WHERE status NOT IN ('pending')"));
console.log("months not-shipped:", q("SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) n FROM orders WHERE status NOT IN ('shipped')"));

console.log("\n== candidate figures (t3 rewrites) ==");
console.log("order span days:", q("SELECT ROUND(julianday(MAX(created_at)) - julianday(MIN(created_at)), 0) d FROM orders"));
console.log("order span +DATE guard:", q("SELECT ROUND(julianday(MAX(created_at)) - julianday(MIN(created_at)), 0) d FROM orders WHERE DATE(created_at) = created_at"));
console.log("customer span days:", q("SELECT ROUND(julianday(MAX(created_at)) - julianday(MIN(created_at)), 0) d FROM customers"));
console.log("2025 order footprint:", q("SELECT ROUND(julianday(MAX(created_at)) - julianday(MIN(created_at)), 0) d, MIN(created_at) a, MAX(created_at) b FROM orders WHERE strftime('%Y', created_at) = '2025'"));
console.log("dec-2024 orders:", q("SELECT COUNT(*) n FROM orders WHERE strftime('%m', created_at) = '12' AND strftime('%Y', created_at) = '2024'"));
console.log("nov-2024 orders:", q("SELECT COUNT(*) n FROM orders WHERE strftime('%m', created_at) = '11' AND strftime('%Y', created_at) = '2024'"));
console.log("2025 shipped:", q("SELECT COUNT(*) n FROM orders WHERE strftime('%Y', created_at) = '2025' AND status = 'shipped'"));
console.log("2025 pending:", q("SELECT COUNT(*) n FROM orders WHERE strftime('%Y', created_at) = '2025' AND status = 'pending'"));
console.log("2025 delivered:", q("SELECT COUNT(*) n FROM orders WHERE strftime('%Y', created_at) = '2025' AND status = 'delivered'"));
console.log("cancelled span days:", q("SELECT ROUND(julianday(MAX(created_at)) - julianday(MIN(created_at)), 0) d FROM orders WHERE IFNULL(status, 'x') = 'cancelled'"));
console.log("cancelled span raw:", q("SELECT MIN(created_at) a, MAX(created_at) b FROM orders WHERE status = 'cancelled'"));
console.log("shipped span days:", q("SELECT ROUND(julianday(MAX(created_at)) - julianday(MIN(created_at)), 0) d FROM orders WHERE IFNULL(status, 'x') = 'shipped'"));
console.log("ISO weeks %W:", q("SELECT COUNT(DISTINCT strftime('%W', created_at)) n FROM orders WHERE DATE(created_at) = created_at"));
console.log("midweek signups:", q("SELECT COUNT(*) n FROM customers WHERE strftime('%w', created_at) IN ('2','3','4') AND DATE(created_at) = created_at"));
console.log("signup-to-order fastest:", q(`SELECT ROUND(MIN(julianday(o.created_at) - julianday(c.created_at)), 0) d FROM orders o JOIN customers c ON c.id = o.customer_id`));
console.log("signup-to-order slowest:", q(`SELECT ROUND(MAX(julianday(o.created_at) - julianday(c.created_at)), 0) d FROM orders o JOIN customers c ON c.id = o.customer_id`));

console.log("\n== candidate figures (t4 rewrites) ==");
console.log("quiet month:", q(`SELECT mo, pot FROM (SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS pot FROM orders WHERE DATE(created_at) = created_at GROUP BY mo) ORDER BY pot ASC LIMIT 1`));
console.log("quiet month no-guard:", q(`SELECT mo, pot FROM (SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS pot FROM orders GROUP BY mo) ORDER BY pot ASC LIMIT 1`));
console.log("loud month:", q(`SELECT mo, pot FROM (SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS pot FROM orders GROUP BY mo) ORDER BY pot DESC LIMIT 1`));
console.log("burn ratio:", q(`SELECT ROUND((SELECT SUM(total) FROM orders WHERE status = 'cancelled') * 1.0 / (SELECT SUM(total) FROM orders WHERE status = 'delivered'), 3) r FROM orders WHERE EXISTS (SELECT 1 FROM orders WHERE DATE(created_at) = created_at)`));
console.log("burn ratio raw:", q(`SELECT (SELECT SUM(total) FROM orders WHERE status = 'cancelled') c, (SELECT SUM(total) FROM orders WHERE status = 'delivered') d`));
console.log("cancelled months:", q("SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) n FROM orders WHERE status = 'cancelled'"));
console.log("active book:", q(`SELECT ROUND(SUM(total), 2) v FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE active = 1 AND DATE(created_at) = created_at) AND total > 0`));
console.log("active=0 book:", q(`SELECT ROUND(SUM(total), 2) v FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE active = 0) `));
console.log("active book >500:", q(`SELECT ROUND(SUM(total), 2) v FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE active = 1) AND total > 500`));
console.log("consonant-led:", q("SELECT COUNT(*) n FROM customers WHERE SUBSTR(name, 1, 1) NOT IN ('A','E','I','O','U') AND TRIM(city) = city AND DATE(created_at) = created_at AND active > 0"));
console.log("consonant-led no-active:", q("SELECT COUNT(*) n FROM customers WHERE SUBSTR(name, 1, 1) NOT IN ('A','E','I','O','U')"));
console.log("distinct lower emails:", q("SELECT COUNT(DISTINCT LOWER(email)) n FROM customers WHERE INSTR(email, '@') > 0"));
console.log("distinct upper emails:", q("SELECT COUNT(DISTINCT UPPER(email)) n FROM customers"));
console.log("dash-stripped:", q("SELECT COUNT(*) n FROM products WHERE REPLACE(name, '-', '') != name AND TRIM(name) = name AND stock > 0"));
console.log("longest email len:", q("SELECT MAX(LENGTH(email)) n FROM customers WHERE TRIM(email) = email AND DATE(created_at) = created_at AND active > 0"));
console.log("surname-caps:", q("SELECT COUNT(*) n FROM customers WHERE SUBSTR(SUBSTR(name, INSTR(name, ' ') + 1), 1, 1) = UPPER(SUBSTR(SUBSTR(name, INSTR(name, ' ') + 1), 1, 1)) AND LENGTH(name) > 0"));
console.log("capstone cs-1450 filled:", q(`SELECT mo, rev, run FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev,
         SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run,
         NTILE(4) OVER (ORDER BY SUM(total) ASC) AS q
  FROM (SELECT strftime('%Y-%m', created_at) AS mo, total FROM orders)
  GROUP BY mo
) WHERE q = 4 AND run < 15000`));
