/// <reference types="bun-types" />
/** Probe pass 2 for batch j2c — distractor cross-checks + remaining prose figures. */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j2c.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(sql: string, label = ""): any[] {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`\n== ${label || sql.slice(0, 90)}`);
    console.log(JSON.stringify(rows, (_, v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v)));
    return rows;
  } catch (e) {
    console.log(`\n== ${label || sql.slice(0, 90)}\nERROR: ${e instanceof Error ? e.message : e}`);
    return [];
  }
}

// cs-243 / cs-248 distractor: ON o.customer_id = o.id
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN shipments s ON o.customer_id = o.id
   WHERE s.id IS NULL`, "cs-243 trap: ON o.customer_id=o.id + s.id IS NULL");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON o.customer_id = o.id
   GROUP BY o.id HAVING COUNT(p.id) = 0`, "cs-248 trap: ON o.customer_id=o.id + HAVING 0");

// cs-250 distractor o.total in ON
q(`SELECT COUNT(*) n FROM shipments s
   LEFT JOIN orders o ON o.total = s.order_id
   WHERE s.delivered_at IS NOT NULL AND o.status = 'shipped'`, "cs-250 trap: ON o.total=s.order_id");

// cs-249 figures: order totals for the double-refunded trio + SUM fan-out check
q(`SELECT o.id, o.total, c.name FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.id IN (6,55,86)`,
  "cs-249 trio totals");
q(`SELECT o.id, ROUND(SUM(r.amount),2) refunded, ROUND(SUM(o.total),2) fanned_total, ROUND(MIN(o.total),2) ticket
   FROM orders o LEFT JOIN refunds r ON r.order_id = o.id
   WHERE o.id IN (6,55,86) GROUP BY o.id ORDER BY o.id`, "cs-249 SUM(r.amount) vs SUM(o.total) fan-out");
q(`SELECT o.id, r.id, r.amount, r.reason FROM refunds r WHERE r.order_id IN (6,55,86) ORDER BY o.id, r.id`,
  "cs-249 trio refund rows");

// refund-audit alternates (context for choosing)
q(`SELECT o.id, o.status, r.amount, r.reason FROM refunds r JOIN orders o ON o.id = r.order_id
   WHERE o.status IN ('cancelled','pending')`, "refunds on cancelled/pending orders");
q(`SELECT COUNT(*) n FROM orders o LEFT JOIN refunds r ON r.order_id = o.id
   WHERE o.status = 'cancelled' AND r.id IS NULL`, "cancelled orders with no refund");
q(`SELECT COUNT(*) n FROM refunds r JOIN orders o ON o.id = r.order_id
   LEFT JOIN shipments s ON s.order_id = o.id
   WHERE r.reason = 'damaged' AND (s.id IS NULL OR s.delivered_at IS NULL)`, "damaged refunds w/o confirmed delivery");

// acquisitions channel mix (cs-247 prose + distractors)
q(`SELECT channel, COUNT(*) n, ROUND(SUM(spend),2) total FROM acquisitions GROUP BY channel ORDER BY channel`,
  "acquisition channel mix");
q(`SELECT a.id, a.customer_id, c.name, a.channel, a.spend FROM acquisitions a
   JOIN customers c ON c.id = a.customer_id ORDER BY a.id`, "acquisition rows with ids");

// cs-248 exposure sum + biggest ticket
q(`SELECT ROUND(SUM(o.total),2) exposure, COUNT(*) n, MAX(o.total) biggest FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   GROUP BY o.id HAVING COUNT(p.id) = 0`, "cs-248 per-row (sanity)");
q(`SELECT ROUND(SUM(total),2) exposure FROM orders WHERE id IN (1,5,7,19,21,42,47,50,51,74,75,83,90,94,95)`,
  "cs-248 never-paid exposure total");

// cs-243 trap rows really differ? show head of the s.id=o.id variant
q(`SELECT o.id, c.name, o.status FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN shipments s ON s.id = o.id
   WHERE s.id IS NULL ORDER BY o.id LIMIT 6`, "cs-243 trap rows head (should be ids 83..)");

// cs-244 context: statuses of the 15 no-payment orders vs the 2 pending-only
q(`SELECT p.id, p.order_id, p.amount, p.method, p.status, o.status FROM payments p
   JOIN orders o ON o.id = p.order_id WHERE p.status = 'pending' ORDER BY p.id`, "all pending payments w/ order status");

// cs-245: DHL in-transit detail + biggest open ticket overall
q(`SELECT s.id, s.carrier, s.cost, o.total, c.name FROM shipments s
   LEFT JOIN orders o ON o.id = s.order_id
   JOIN customers c ON c.id = o.customer_id
   WHERE s.delivered_at IS NULL ORDER BY s.cost DESC LIMIT 5`, "cs-245 top in-transit legs w/ buyer");

// cs-246: cross-region edge context
q(`SELECT e.name, e.region, m.name AS boss, m.region AS boss_region FROM employees e
   LEFT JOIN employees m ON e.manager_id = m.id WHERE e.region <> m.region OR m.id IS NULL`,
  "cs-246 cross-region + root rows");

// cs-247: spends of the referral four + totals
q(`SELECT c.name, a.spend FROM acquisitions a JOIN customers c ON c.id = a.customer_id
   WHERE a.channel = 'referral' ORDER BY a.spend DESC`, "cs-247 referral four");

// cs-250: DQ rows with buyer names for prose
q(`SELECT s.id, s.carrier, o.id AS order_id, c.name, o.total FROM shipments s
   LEFT JOIN orders o ON o.id = s.order_id
   JOIN customers c ON c.id = o.customer_id
   WHERE s.delivered_at IS NOT NULL AND o.status = 'shipped' ORDER BY s.id`, "cs-250 DQ rows with buyers");

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe copy deleted.");
