// M6 wave-1 probe round 2 — fixed C4 (quantity) + extra x1/x2 shapes for case variety.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.m6w1-facts.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as unknown[][];
    console.log(`\n## ${label}\n${sql.replace(/\s+/g, " ").slice(0, 118)}\n  → ${JSON.stringify(rows.slice(0, 20))}${rows.length > 20 ? ` …(${rows.length} rows)` : ""}`);
  } catch (e) {
    console.log(`✗ ${label} :: ${sql.replace(/\s+/g, " ").slice(0, 90)}\n  ERROR: ${(e as Error).message}`);
  }
}

// ---- C4 fixed
q("C4f category revenue + TOTAL", "SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS rev FROM order_items oi JOIN products p ON p.id=oi.product_id GROUP BY p.category UNION ALL SELECT 'TOTAL', ROUND(SUM(quantity * unit_price), 2) FROM order_items");

// ---- extra x1 shapes
q("D1 supplier product shelves", "SELECT s.name, COUNT(*) AS n, GROUP_CONCAT(p.name ORDER BY p.name) AS shelf FROM products p JOIN suppliers s ON s.id=p.supplier_id GROUP BY s.id ORDER BY s.name");
q("D2 supplier folds by region", "SELECT s.region, COUNT(*), GROUP_CONCAT(s.name ORDER BY s.name) FROM suppliers s GROUP BY s.region ORDER BY s.region");
q("D3 fold distinct months per customer", "SELECT c.name, COUNT(DISTINCT strftime('%Y-%m', o.created_at)) AS active_months, GROUP_CONCAT(DISTINCT strftime('%Y-%m', o.created_at)) FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY active_months DESC, c.name LIMIT 6");
q("D4 fold sep arrow per category", "SELECT category, GROUP_CONCAT(name, ' → ' ORDER BY price DESC) FROM products GROUP BY category ORDER BY category LIMIT 4");
q("D5 fold + price band labels", "SELECT CASE WHEN price >= 100 THEN 'premium' ELSE 'budget' END AS band, GROUP_CONCAT(name ORDER BY name) FROM products GROUP BY band");
q("D6 city folds", "SELECT c.city, COUNT(*), GROUP_CONCAT(c.name ORDER BY c.name) FROM customers c GROUP BY c.city HAVING COUNT(*) >= 2 ORDER BY c.city");
q("D7 longest fold: fold per category lens", "SELECT category, LENGTH(GROUP_CONCAT(name ORDER BY name)) AS len, COUNT(*) FROM products GROUP BY category ORDER BY len DESC");
q("D8 INSTR probe on category fold", "SELECT category, INSTR(GROUP_CONCAT(name ORDER BY name), 'Yoga') AS pos FROM products GROUP BY category HAVING pos > 0");
q("D9 payment method folds per customer", "SELECT c.name, GROUP_CONCAT(DISTINCT p.method ORDER BY p.method) AS rails FROM customers c JOIN payments p ON p.customer_id=c.id GROUP BY c.id ORDER BY c.name LIMIT 8");
q("D10 order month fold per region", "SELECT c.region, GROUP_CONCAT(DISTINCT strftime('%Y-%m', o.created_at) ORDER BY 1) AS months FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY c.region");
q("D11 double fold: names + emails", "SELECT c.region, GROUP_CONCAT(c.name ORDER BY c.name), GROUP_CONCAT(c.email ORDER BY c.name) FROM customers c WHERE c.region='US' GROUP BY c.region");
q("D12 fold with NULL skip (expenses note?)", "SELECT strftime('%Y', spent_on) AS y, GROUP_CONCAT(CAST(amount_cents/100 AS TEXT) ORDER BY spent_on) FROM expenses GROUP BY y ORDER BY y");

// ---- extra x2 shapes
q("E1 per-region member census + active split", "SELECT region, COUNT(*) AS members, SUM(active) FILTER (WHERE active=1) AS active_n FROM customers GROUP BY region ORDER BY region");
q("E2 invoice aging one-pass", "SELECT COUNT(*) FILTER (WHERE due_on < '2024-06-01') AS overdue_old, COUNT(*) FILTER (WHERE due_on >= '2024-06-01') AS due_later, COUNT(*) AS all_inv FROM invoices WHERE status='open'");
q("E3 orders per weekday FILTER big", "SELECT strftime('%w', created_at) AS dow, COUNT(*) AS all_rows, COUNT(*) FILTER (WHERE total >= 250) AS big FROM orders GROUP BY dow ORDER BY dow");
q("E4 payments per quarter FILTER", "SELECT (CAST(strftime('%m', paid_on) AS INT) + 2) / 3 AS qtr, COUNT(*) AS n, ROUND(SUM(amount_cents) FILTER (WHERE method='card')/100.0, 2) AS card_amt FROM payments GROUP BY qtr ORDER BY qtr");
q("E5 two-census comparison", "SELECT COUNT(*) FILTER (WHERE status='paid') AS paid_n, COUNT(*) FILTER (WHERE status='open') AS open_n, COUNT(*) FILTER (WHERE status='void') AS void_n, ROUND(SUM(amount_cents) FILTER (WHERE status='open')/100.0, 2) AS open_amt FROM invoices");
q("E6 region grid on invoices", "SELECT c.region, COUNT(*) FILTER (WHERE i.status='paid') AS paid_n, COUNT(*) FILTER (WHERE i.status='open') AS open_n, COUNT(*) FILTER (WHERE i.status='void') AS void_n FROM invoices i JOIN customers c ON c.id=i.customer_id GROUP BY c.region ORDER BY c.region");
q("E7 customer-facing big-order census", "SELECT c.name, COUNT(*) AS orders, COUNT(*) FILTER (WHERE o.total >= 300) AS big_orders FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY big_orders DESC, orders DESC, c.name LIMIT 8");
q("E8 expenses census by month big", "SELECT strftime('%Y-%m', spent_on) AS m, COUNT(*) AS n, COUNT(*) FILTER (WHERE amount_cents >= 100000) AS big FROM expenses GROUP BY m ORDER BY big DESC, m LIMIT 6");

db.close();
console.log("\nDONE");
