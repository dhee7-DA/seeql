// M6 wave-1 fact probes (x1 GROUP_CONCAT folds / x2 FILTER censuses / x3 UNION-ALL grand-total stacks).
// Readonly copy of db/custom.db — receipts for cases cs-1501–1550.
import { copyFileSync } from "node:fs";
import { Database } from "bun:sqlite";

copyFileSync("db/custom.db", "scripts/.m6w1-facts.db");
const db = new Database("scripts/.m6w1-facts.db", { readonly: true });

let section = "";
function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as unknown[][];
    if (section !== label) {
      section = label;
      console.log(`\n## ${label}`);
    }
    console.log(`${sql.replace(/\s+/g, " ").slice(0, 118)}\n  → ${JSON.stringify(rows.slice(0, 24))}${rows.length > 24 ? ` …(${rows.length} rows)` : ""}`);
  } catch (e) {
    console.log(`✗ ${label} :: ${sql.replace(/\s+/g, " ").slice(0, 90)}\n  ERROR: ${(e as Error).message}`);
  }
}

// ---- schema sanity
q("S0 sqlite version", "SELECT sqlite_version()");
q("S0 tables", "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
q("S0 row counts", "SELECT 'customers', COUNT(*) FROM customers UNION ALL SELECT 'orders', COUNT(*) FROM orders UNION ALL SELECT 'invoices', COUNT(*) FROM invoices UNION ALL SELECT 'payments', COUNT(*) FROM payments UNION ALL SELECT 'expenses', COUNT(*) FROM expenses UNION ALL SELECT 'ledger', COUNT(*) FROM ledger_entries UNION ALL SELECT 'products', COUNT(*) FROM products UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers UNION ALL SELECT 'order_items', COUNT(*) FROM order_items");

// ---- A. GROUP_CONCAT folds (x1)
q("A1 status recital raw", "SELECT GROUP_CONCAT(DISTINCT status) FROM orders");
q("A2 status recital ordered", "SELECT GROUP_CONCAT(status) FROM (SELECT status FROM orders GROUP BY status ORDER BY status)");
q("A3 status recital reverse", "SELECT GROUP_CONCAT(status) FROM (SELECT status FROM orders GROUP BY status ORDER BY status DESC)");
q("A4 supplier shelves pipe", "SELECT GROUP_CONCAT(name, ' | ') FROM (SELECT name FROM suppliers ORDER BY name)");
q("A5 supplier shelves DESC-ordered in-agg", "SELECT GROUP_CONCAT(name, ' | ' ORDER BY name DESC) FROM suppliers");
q("A6 region folds + counts", "SELECT c.region, COUNT(*), GROUP_CONCAT(c.name ORDER BY c.name) FROM customers c GROUP BY c.region ORDER BY c.region");
q("A7 category shopping lists", "SELECT category, COUNT(*), GROUP_CONCAT(name ORDER BY name) FROM products GROUP BY category ORDER BY category");
q("A8 customer product folds (order_items)", "SELECT c.name, COUNT(DISTINCT p.id), GROUP_CONCAT(DISTINCT p.name ORDER BY p.name) FROM customers c JOIN orders o ON o.customer_id=c.id JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id GROUP BY c.id ORDER BY c.name LIMIT 6");
q("A9 fold length probes", "SELECT c.region, LENGTH(GROUP_CONCAT(c.name ORDER BY c.name)) AS fold_len, COUNT(*) FROM customers c GROUP BY c.region ORDER BY fold_len DESC");
q("A10 INSTR inside fold", "SELECT c.region, INSTR(GROUP_CONCAT(c.name ORDER BY c.name), 'Chloe') AS pos, COUNT(*) FROM customers c GROUP BY c.region ORDER BY c.region");
q("A11 fold + HAVING gate", "SELECT c.region, GROUP_CONCAT(c.name ORDER BY c.name) AS roster FROM customers c GROUP BY c.region HAVING COUNT(*) >= 5 ORDER BY c.region");
q("A12 order-id folds per status", "SELECT o.status, COUNT(*), GROUP_CONCAT(o.id ORDER BY o.id) FROM orders o GROUP BY o.status ORDER BY o.status");
q("A13 month folds per year", "SELECT strftime('%Y', created_at) AS y, COUNT(*), GROUP_CONCAT(strftime('%m', created_at) ORDER BY created_at) FROM orders GROUP BY y ORDER BY y");
q("A14 fold sep variants", "SELECT GROUP_CONCAT(name, '; ') FROM (SELECT name FROM suppliers WHERE region IS NOT NULL ORDER BY name)");
q("A15 supplier region col?", "SELECT * FROM suppliers LIMIT 3");
q("A16 folded list CONTAINS gate", "SELECT c.region, COUNT(*) FROM customers c GROUP BY c.region HAVING GROUP_CONCAT(c.name ORDER BY c.name) LIKE '%Hiro%' ORDER BY c.region");
q("A17 invoice status folds per customer", "SELECT c.name, GROUP_CONCAT(i.status ORDER BY i.id) FROM invoices i JOIN customers c ON c.id=i.customer_id GROUP BY c.id ORDER BY c.name LIMIT 8");
q("A18 empty fold behaviour", "SELECT GROUP_CONCAT(name) FROM suppliers WHERE 1=0");

// ---- B. FILTER censuses (x2)
q("B1 one-pass order status census", "SELECT COUNT(*) AS all_rows, COUNT(*) FILTER (WHERE status='shipped') AS shipped, COUNT(*) FILTER (WHERE status='cancelled') AS cancelled, COUNT(*) FILTER (WHERE status='pending') AS pending FROM orders");
q("B2 distinct-member FILTER census", "SELECT COUNT(DISTINCT customer_id) FILTER (WHERE total >= 200) AS big_spenders, COUNT(DISTINCT customer_id) FILTER (WHERE total < 50) AS snackers FROM orders");
q("B3 revenue FILTER by half", "SELECT ROUND(SUM(total) FILTER (WHERE created_at < '2024-07-01'), 2) AS h1, ROUND(SUM(total) FILTER (WHERE created_at >= '2024-07-01'), 2) AS h2, ROUND(SUM(total), 2) AS allin FROM orders");
q("B4 region + FILTER grid", "SELECT c.region, COUNT(*) FILTER (WHERE o.status='shipped') AS shipped, COUNT(*) FILTER (WHERE o.status='cancelled') AS cancelled, COUNT(*) FILTER (WHERE o.status='pending') AS pending, COUNT(*) AS all_rows FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY c.region");
q("B5 invoice census per customer", "SELECT c.name, COUNT(*) FILTER (WHERE i.status='paid') AS paid, COUNT(*) FILTER (WHERE i.status!='paid') AS open FROM invoices i JOIN customers c ON c.id=i.customer_id GROUP BY c.id ORDER BY paid DESC, c.name LIMIT 8");
q("B6 payment rails FILTER sums", "SELECT COUNT(*) FILTER (WHERE method='card') AS card_n, ROUND(SUM(amount_cents) FILTER (WHERE method='card')/100.0, 2) AS card_amt, COUNT(*) FILTER (WHERE method='wire') AS wire_n, ROUND(SUM(amount_cents) FILTER (WHERE method='wire')/100.0, 2) AS wire_amt FROM payments");
q("B7 expense threshold census", "SELECT COUNT(*) FILTER (WHERE amount_cents >= 100000) AS big, COUNT(*) FILTER (WHERE amount_cents BETWEEN 20000 AND 99999) AS mid, COUNT(*) FILTER (WHERE amount_cents < 20000) AS small FROM expenses");
q("B8 order size bands one pass", "SELECT COUNT(*) FILTER (WHERE total >= 300) AS tier_a, COUNT(*) FILTER (WHERE total >= 100 AND total < 300) AS tier_b, COUNT(*) FILTER (WHERE total < 100) AS tier_c FROM orders");
q("B9 FILTER + month grid", "SELECT strftime('%Y-%m', created_at) AS m, COUNT(*) FILTER (WHERE total >= 200) AS big, COUNT(*) AS all_rows FROM orders GROUP BY m ORDER BY m LIMIT 6");
q("B10 FILTER + AVG", "SELECT ROUND(AVG(total) FILTER (WHERE status='shipped'), 2) AS shipped_avg, ROUND(AVG(total) FILTER (WHERE status='cancelled'), 2) AS cancelled_avg, ROUND(AVG(total), 2) AS all_avg FROM orders");
q("B11 FILTER + SUM per region (invoices)", "SELECT c.region, COUNT(*) FILTER (WHERE i.status='open') AS open_n, ROUND(SUM(i.amount_cents) FILTER (WHERE i.status='open')/100.0, 2) AS open_amt FROM invoices i JOIN customers c ON c.id=i.customer_id GROUP BY c.region ORDER BY open_amt DESC");
q("B12 shipped_at null census", "SELECT COUNT(*) FILTER (WHERE shipped_at IS NULL) AS never, COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) AS shipped_ts FROM orders");
q("B13 FILTER on products stock", "SELECT COUNT(*) FILTER (WHERE stock = 0) AS sold_out, COUNT(*) FILTER (WHERE stock BETWEEN 1 AND 20) AS low, COUNT(*) FILTER (WHERE stock > 20) AS healthy FROM products");
q("B14 FILTER distinct months", "SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) FILTER (WHERE total >= 250) AS big_months, COUNT(DISTINCT strftime('%Y-%m', created_at)) AS all_months FROM orders");

// ---- C. UNION ALL grand-total stacks (x3)
q("C1 status revenue + TOTAL", "SELECT status, ROUND(SUM(total), 2) AS rev FROM orders GROUP BY status UNION ALL SELECT 'TOTAL', ROUND(SUM(total), 2) FROM orders");
q("C2 month revenue + TOTAL (sorted)", "SELECT * FROM (SELECT strftime('%Y-%m', created_at) AS m, ROUND(SUM(total), 2) AS rev, 0 AS k FROM orders GROUP BY m UNION ALL SELECT 'TOTAL', ROUND(SUM(total), 2), 1 FROM orders) ORDER BY k, m");
q("C3 region member counts + TOTAL", "SELECT region, COUNT(*) AS members FROM customers GROUP BY region UNION ALL SELECT 'TOTAL', COUNT(*) FROM customers");
q("C4 category revenue + TOTAL", "SELECT p.category, ROUND(SUM(oi.qty * oi.unit_price), 2) AS rev FROM order_items oi JOIN products p ON p.id=oi.product_id GROUP BY p.category UNION ALL SELECT 'TOTAL', ROUND(SUM(qty * unit_price), 2) FROM order_items");
q("C5 payment rails + TOTAL", "SELECT method, ROUND(SUM(amount_cents)/100.0, 2) AS amt FROM payments GROUP BY method UNION ALL SELECT 'TOTAL', ROUND(SUM(amount_cents)/100.0, 2) FROM payments");
q("C6 expense months + TOTAL", "SELECT strftime('%Y-%m', spent_on) AS m, ROUND(SUM(amount_cents)/100.0, 2) AS amt FROM expenses GROUP BY m UNION ALL SELECT 'TOTAL', ROUND(SUM(amount_cents)/100.0, 2) FROM expenses");
q("C7 invoice status + TOTAL (n + amt)", "SELECT status, COUNT(*), ROUND(SUM(amount_cents)/100.0, 2) FROM invoices GROUP BY status UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(amount_cents)/100.0, 2) FROM invoices");
q("C8 shipped vs not + TOTAL", "SELECT CASE WHEN shipped_at IS NULL THEN 'never' ELSE 'shipped' END AS lane, COUNT(*), ROUND(SUM(total), 2) FROM orders GROUP BY lane UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(total), 2) FROM orders");
q("C9 ledger months + TOTAL (cents)", "SELECT strftime('%Y-%m', entry_date) AS m, SUM(debit_cents) FROM ledger_entries GROUP BY m UNION ALL SELECT 'TOTAL', SUM(debit_cents) FROM ledger_entries");
q("C10 region revenue + TOTAL", "SELECT c.region, ROUND(SUM(o.total), 2) AS rev FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region UNION ALL SELECT 'TOTAL', ROUND(SUM(total), 2) FROM orders");

db.close();
console.log("\nDONE");
