/// <reference types="bun-types" />
/** M6 wave-3 probe round 2 — remaining figures for x6/x7 drafting. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.m6w3-facts2.db");
const db = new Database("scripts/.m6w3-facts2.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 1100));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// P1: product prices
q("P1 prices", `SELECT name, price, category FROM products ORDER BY price`);
// P2: same-cat cheaper pairs by category
q("P2 samecat-cheaper", `SELECT a.category, COUNT(*) AS pairs FROM products a JOIN products b ON a.price < b.price AND a.category = b.category GROUP BY a.category`);
// P3: latency band alternates
q("P3 band 0-7", `SELECT COUNT(*) AS n FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND julianday(b.created_at) - julianday(a.created_at) BETWEEN 0 AND 7`);
q("P3 band 0-60", `SELECT COUNT(*) AS n FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND julianday(b.created_at) - julianday(a.created_at) BETWEEN 0 AND 60`);
// P4: invoice-after-order with raw created_at (no date())
q("P4 raw-createdat", `SELECT COUNT(*) AS n FROM orders o JOIN invoices i ON i.customer_id = o.customer_id AND i.issued_on >= o.created_at`);
// P5: per-region best weighted (x6 h case)
q("P5 best-region", `SELECT s.region, MAX(p.price * s.rating) AS best FROM products p CROSS JOIN suppliers s GROUP BY s.region ORDER BY best DESC`);
q("P5b best-region-plus", `SELECT s.region, MAX(p.price + s.rating) AS best FROM products p CROSS JOIN suppliers s GROUP BY s.region ORDER BY best DESC`);
// P6: per-customer nearest-pair counts (x7)
q("P6 nearest by customer", `SELECT c.name, COUNT(*) AS adj FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.created_at < b.created_at WHERE NOT EXISTS (SELECT 1 FROM orders m WHERE m.customer_id = a.customer_id AND m.created_at > a.created_at AND m.created_at < b.created_at) JOIN customers c ON c.id = a.customer_id GROUP BY a.customer_id ORDER BY adj DESC, c.name LIMIT 5`);
// P7: cheaper products count (x6 1601 alternates)
q("P7 price>100", `SELECT COUNT(*) AS n FROM products WHERE price > 100`);
q("P7b price>200", `SELECT COUNT(*) AS n FROM products WHERE price > 200`);
// P8: Alice vs Emma pair-count ranks (x7 per-customer)
q("P8 pair ranks", `SELECT c.name, COUNT(*) AS pairs FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.created_at < b.created_at JOIN customers c ON c.id = a.customer_id GROUP BY a.customer_id ORDER BY pairs DESC LIMIT 3`);
// P9: same-customer pair counts for lane-scoped variant (delivered only)
q("P9 delivered pairs", `SELECT COUNT(*) AS n FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.created_at < b.created_at AND a.status = 'delivered' AND b.status = 'delivered'`);
// P10: cheapest-dearest per category (dearest cat)
q("P10 gap by cat", `SELECT a.category, ROUND(MAX(b.price - a.price), 2) AS max_gap FROM products a JOIN products b ON a.price < b.price AND a.category = b.category GROUP BY a.category ORDER BY max_gap DESC LIMIT 3`);
// P11: cross month x lane cells (14 x 4)
q("P11 month-lane", `SELECT COUNT(*) AS cells FROM (SELECT DISTINCT strftime('%Y-%m', created_at) AS mo FROM orders) m CROSS JOIN (SELECT DISTINCT status FROM orders) l`);
// P12: cross product x month grid
q("P12 product-month", `SELECT COUNT(*) AS cells FROM products p CROSS JOIN (SELECT DISTINCT strftime('%Y-%m', created_at) AS mo FROM orders) m`);

db.close();
