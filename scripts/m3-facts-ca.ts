// M3 CASE + aggregates drill-author probes (task m3-w1c) — every number used
// in case-aggregate.ts is verified here on a throwaway copy of db/custom.db.
// Run: bun scripts/m3-facts-ca.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fca.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const err = (sql: string) => {
  try { db.prepare(sql).all(); return "NO ERROR"; }
  catch (e) { return String(e).slice(0, 110); }
};

console.log("== CA: COUNT/SUM TWIN IDIOMS (ca-02, 08, 18, 35) ==");
console.log("SUM no-ELSE pending:", one(`SELECT SUM(CASE WHEN status='pending' THEN 1 END) AS sum_noelse FROM orders`));
console.log("SUM ELSE 0 pending:", one(`SELECT SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS sum_else0 FROM orders`));
console.log("COUNT no-ELSE pending:", one(`SELECT COUNT(CASE WHEN status='pending' THEN 1 END) AS count_noelse FROM orders`));
console.log("COUNT ELSE 0 pending:", one(`SELECT COUNT(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS count_else0 FROM orders`));
console.log("bare boolean COUNT(status='pending'):", one(`SELECT COUNT(status = 'pending') AS n FROM orders`));
console.log("bare boolean SUM(status='pending'):", one(`SELECT SUM(status = 'pending') AS n FROM orders`));

console.log("\n== CA: EMPTY-MATCH ARMS (ca-17) ==");
console.log("nope status: SUM no-ELSE vs ELSE 0:", one(`SELECT SUM(CASE WHEN status='nope' THEN 1 END) AS noelse, SUM(CASE WHEN status='nope' THEN 1 ELSE 0 END) AS else0 FROM orders`));

console.log("\n== CA: SLOPPY ARM ELSE 2 (ca-19) ==");
console.log("SUM(CASE pending THEN 1 ELSE 2 END):", one(`SELECT SUM(CASE WHEN status='pending' THEN 1 ELSE 2 END) AS v FROM orders`));
console.log("cross-check 14 + 89*2:", one(`SELECT SUM(status='pending') + 2*SUM(status != 'pending') AS expect FROM orders`));

console.log("\n== CA: HAVING ON PIVOT ARM (ca-20, 43) ==");
console.log("HAVING pending arm = 0:", one(`SELECT c.region, SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) AS pending FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region HAVING SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) = 0`));
console.log("HAVING pending arm > 0 count:", one(`SELECT COUNT(*) AS n FROM (SELECT c.region FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region HAVING SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) > 0)`));

console.log("\n== CA: CENTS CONVERSION (ca-21) ==");
console.log("open invoice cents raw:", one(`SELECT SUM(CASE WHEN status='open' THEN amount_cents END) AS raw_cents, ROUND(SUM(CASE WHEN status='open' THEN amount_cents END)/100.0, 2) AS dollars FROM invoices`));
console.log("paid invoice pivot line:", one(`SELECT COUNT(*) AS n, ROUND(SUM(CASE WHEN status='paid' THEN amount_cents END)/100.0, 2) AS dollars FROM invoices WHERE status='paid'`));
console.log("paid via conditional arm (no WHERE):", one(`SELECT SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END) AS n, ROUND(SUM(CASE WHEN status='paid' THEN amount_cents END)/100.0, 2) AS dollars FROM invoices`));

console.log("\n== CA: FLOAT FUZZ WITHOUT ROUND (ca-22) ==");
console.log("EU pending money raw vs rounded:", one(`SELECT SUM(CASE WHEN o.status='pending' THEN o.total ELSE 0 END) AS raw, ROUND(SUM(CASE WHEN o.status='pending' THEN o.total ELSE 0 END),2) AS rounded FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='EU'`));

console.log("\n== CA: FAN-OUT INFLATION (ca-32, 48) ==");
console.log("delivered money at orders grain:", one(`SELECT ROUND(SUM(CASE WHEN o.status='delivered' THEN o.total ELSE 0 END),2) AS money FROM orders o`));
console.log("delivered money after invoices fan-out:", one(`SELECT ROUND(SUM(CASE WHEN o.status='delivered' THEN o.total ELSE 0 END),2) AS money, COUNT(*) AS rows FROM orders o JOIN invoices i ON i.customer_id = o.customer_id`));
console.log("orders grain rows for same query:", one(`SELECT COUNT(*) AS n FROM orders o`));

console.log("\n== CA: INVERTED IDIOM (ca-26) ==");
console.log("CASE wraps COUNT, no GROUP BY:", one(`SELECT CASE WHEN status='pending' THEN COUNT(*) ELSE 0 END AS v FROM orders`));

console.log("\n== CA: ERROR MESSAGES (ca-27, 28, 30) ==");
console.log("missing END inside SUM:", err(`SELECT SUM(CASE WHEN status='pending' THEN 1 ELSE 0) FROM orders`));
console.log("comma instead of THEN:", err(`SELECT SUM(CASE WHEN status='pending', 1 ELSE 0 END) FROM orders`));
console.log("aggregate in WHERE:", err(`SELECT c.region FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region WHERE SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) = 0`));
console.log("same filter in HAVING works:", one(`SELECT c.region FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region HAVING SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) = 0`));

console.log("\n== CA: MISSING GROUP BY (ca-29) ==");
console.log("pivot without GROUP BY:", one(`SELECT c.region, SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) AS pending FROM orders o JOIN customers c ON c.id=o.customer_id`));

console.log("\n== CA: TYPE-DISHONEST ARM (ca-31) ==");
console.log("THEN '1' quoted:", one(`SELECT SUM(CASE WHEN status='pending' THEN '1' ELSE 0 END) AS v FROM orders`));

console.log("\n== CA: AVG SHARES (ca-14, 42) ==");
console.log("AVG unshipped share:", one(`SELECT AVG(CASE WHEN shipped_at IS NULL THEN 1.0 ELSE 0 END) AS v FROM orders`));
console.log("AVG pending share:", one(`SELECT AVG(CASE WHEN status='pending' THEN 1.0 ELSE 0 END) AS v FROM orders`));

console.log("\n== CA: MAX/MIN CONDITIONAL (ca-15, 44) ==");
console.log("MAX pending total:", one(`SELECT MAX(CASE WHEN status='pending' THEN total END) AS v FROM orders`));
console.log("MIN pending total:", one(`SELECT MIN(CASE WHEN status='pending' THEN total END) AS v FROM orders`));
console.log("overall MAX total:", one(`SELECT MAX(total) AS v FROM orders`));
console.log("MAX pending with ELSE 0:", one(`SELECT MAX(CASE WHEN status='pending' THEN total ELSE 0 END) AS v FROM orders`));

console.log("\n== CA: DISTINCT CONDITIONAL (ca-16) ==");
console.log("distinct pending customers:", one(`SELECT COUNT(DISTINCT CASE WHEN status='pending' THEN customer_id END) AS v FROM orders`));
console.log("pending orders count for contrast:", one(`SELECT COUNT(*) AS n FROM orders WHERE status='pending'`));

console.log("\n== CA: PIVOT REGIONS (ca-36, 37, 25, 38) ==");
console.log("region x status pivot:", one(`SELECT c.region, SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN o.status='shipped' THEN 1 ELSE 0 END) AS shipped, SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) AS delivered, SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) AS cancelled FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) DESC`));
console.log("LATAM money line:", one(`SELECT c.region, ROUND(SUM(CASE WHEN o.status='pending' THEN o.total ELSE 0 END),2) AS pending_money, ROUND(SUM(CASE WHEN o.status='delivered' THEN o.total ELSE 0 END),2) AS delivered_money FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region HAVING c.region='LATAM'`));
console.log("total pending money:", one(`SELECT ROUND(SUM(CASE WHEN status='pending' THEN total END),2) AS v FROM orders`));

console.log("\n== CA: INVOICE/ PAYMENT PIVOTS (ca-39, 40) ==");
console.log("invoice pivot:", one(`SELECT status, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS dollars FROM invoices GROUP BY status`));
console.log("payments two arms one pass:", one(`SELECT ROUND(SUM(CASE WHEN method='card' THEN amount_cents ELSE 0 END)/100.0, 2) AS card_money, ROUND(SUM(CASE WHEN method='wire' THEN amount_cents ELSE 0 END)/100.0, 2) AS wire_money, SUM(CASE WHEN method='card' THEN 1 ELSE 0 END) AS card_n, SUM(CASE WHEN method='wire' THEN 1 ELSE 0 END) AS wire_n FROM payments`));
console.log("payments grand total:", one(`SELECT ROUND(SUM(amount_cents)/100.0,2) AS v FROM payments`));

console.log("\n== CA: PRODUCT PIVOT ZERO-SELLERS (ca-41) ==");
console.log("times_sold = 0 count:", one(`SELECT COUNT(*) AS n FROM (SELECT SUM(CASE WHEN oi.id IS NULL THEN 0 ELSE 1 END) AS times_sold FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id GROUP BY p.id) WHERE times_sold = 0`));
console.log("top times_sold:", one(`SELECT MAX(times_sold) AS mx FROM (SELECT SUM(CASE WHEN oi.id IS NULL THEN 0 ELSE 1 END) AS times_sold FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id GROUP BY p.id)`));

console.log("\n== CA: TWO-COUNTER (ca-33, 12) ==");
console.log("two-counter row:", one(`SELECT COUNT(*) AS total, SUM(CASE WHEN total >= 150 THEN 1 ELSE 0 END) AS big, SUM(CASE WHEN total < 150 THEN 1 ELSE 0 END) AS small FROM orders`));

console.log("\n== CA: NULL-BOUNDARY HYPOTHETICAL (ca-24) ==");
console.log("arms with NULL total injected (CTE):", one(`WITH x AS (SELECT id, total FROM orders UNION ALL SELECT 999, NULL) SELECT COUNT(*) AS n, SUM(CASE WHEN total >= 150 THEN 1 ELSE 0 END) AS big, SUM(CASE WHEN total < 150 THEN 1 ELSE 0 END) AS small FROM x`));

console.log("\n== CA: CANCELLED MONEY INVISIBLE (ca-23) ==");
console.log("cancelled total money (outside arms):", one(`SELECT ROUND(SUM(total),2) AS v FROM orders WHERE status='cancelled'`));
console.log("delivered+pending money in two-arm pivot:", one(`SELECT ROUND(SUM(CASE WHEN status='pending' THEN total ELSE 0 END) + SUM(CASE WHEN status='delivered' THEN total ELSE 0 END),2) AS armed, ROUND(SUM(total),2) AS all_money FROM orders`));

db.close();
rmSync(COPY);
console.log("\nCA probes done.");
