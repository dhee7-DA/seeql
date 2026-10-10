// M6 wave-1 probe round 3 — distractor waterline checks + walkthrough facts.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.m6w1-facts.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as unknown[][];
    console.log(`\n## ${label}\n  → ${JSON.stringify(rows.slice(0, 30))}${rows.length > 30 ? ` …(${rows.length} rows)` : ""}`);
  } catch (e) {
    console.log(`✗ ${label}\n  ERROR: ${(e as Error).message}`);
  }
}

// 1511/1516-prep: product prices + supplier ratings
q("P1 product prices", "SELECT id, name, category, price FROM products ORDER BY price DESC");
q("P2 supplier ratings", "SELECT id, name, region, rating FROM suppliers ORDER BY rating DESC");

// 1529 expense band distractor safety
q("X1 expenses >=150000", "SELECT COUNT(*) FROM expenses WHERE amount_cents >= 150000");
q("X2 expenses 50000..99999", "SELECT COUNT(*) FROM expenses WHERE amount_cents BETWEEN 50000 AND 99999");
q("X3 expenses 30000..99999", "SELECT COUNT(*) FROM expenses WHERE amount_cents BETWEEN 30000 AND 99999");
q("X4 expenses >=300000", "SELECT COUNT(*) FROM expenses WHERE amount_cents >= 300000");

// 1530/1533 month/member waterlines
q("Y1 distinct months total>=100", "SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) FROM orders WHERE total >= 100");
q("Y2 distinct months total>=400", "SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) FROM orders WHERE total >= 400");
q("Y3 distinct members total<100", "SELECT COUNT(DISTINCT customer_id) FROM orders WHERE total < 100");
q("Y4 distinct members total<25", "SELECT COUNT(DISTINCT customer_id) FROM orders WHERE total < 25");

// 1525 invoice amounts per region (all statuses)
q("Z1 invoiced amt per region", "SELECT c.region, COUNT(*) AS n, ROUND(SUM(i.amount_cents)/100.0, 2) AS amt FROM invoices i JOIN customers c ON c.id=i.customer_id GROUP BY c.region ORDER BY c.region");

// 1527 threshold-200 big-order counts
q("W1 big-order census >=200", "SELECT c.name, COUNT(*) AS orders, COUNT(*) FILTER (WHERE o.total >= 200) AS big200 FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY big200 DESC, orders DESC, c.name LIMIT 6");

// 1548 category shelf values
q("V1 SUM(price) per category", "SELECT category, COUNT(*) AS items, ROUND(SUM(price), 2) AS shelf_value FROM products GROUP BY category ORDER BY shelf_value DESC");
q("V2 SUM(price) all", "SELECT ROUND(SUM(price), 2) FROM products");

// 1549 payments since 2024-10-01
q("U1 payments since 2024-10-01", "SELECT COUNT(*), ROUND(SUM(amount_cents)/100.0, 2) FROM payments WHERE paid_on >= '2024-10-01'");
q("U2 payments since 2025-01-01", "SELECT COUNT(*), ROUND(SUM(amount_cents)/100.0, 2) FROM payments WHERE paid_on >= '2025-01-01'");

// 1550 per-supplier revenue
q("T1 supplier revenue", "SELECT s.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS rev FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN suppliers s ON s.id=p.supplier_id GROUP BY s.id ORDER BY rev DESC");

// 1510 Alice/Emma active months re-verify + order counts
q("S1 alice orders+months", "SELECT c.name, COUNT(*) AS orders, COUNT(DISTINCT strftime('%Y-%m', o.created_at)) AS months FROM customers c JOIN orders o ON o.customer_id=c.id WHERE c.name IN ('Alice Chen','Emma Wilson') GROUP BY c.id");

// 1546 lane gate waterline
q("R1 lanes >=6000", "SELECT status, ROUND(SUM(total),2) AS rev, COUNT(*) AS n FROM orders GROUP BY status HAVING SUM(total) >= 6000 ORDER BY rev");
q("R2 lanes >=7000", "SELECT status, ROUND(SUM(total),2) AS rev FROM orders GROUP BY status HAVING SUM(total) >= 7000");

// 1506 HAVING gate distractor waterline
q("Q1 region sizes", "SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC");

db.close();
console.log("\nDONE");
