/// <reference types="bun-types" />
/** Probe round 2: distractor split values + cs-1450 fix. */
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string) => {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    return rows.length <= 6 ? JSON.stringify(rows) : JSON.stringify({ n: rows.length, sample: rows.slice(0, 4) });
  } catch (e) {
    return "ERR: " + (e instanceof Error ? e.message : String(e));
  }
};

console.log("== splits ==");
console.log("qty dist:", q("SELECT quantity, COUNT(*) n FROM order_items GROUP BY quantity"));
console.log("cancelled < 100:", q("SELECT COUNT(*) n FROM orders WHERE COALESCE(total,0) < 100 AND status = 'cancelled'"));
console.log("cancelled > 500:", q("SELECT COUNT(*) n FROM orders WHERE NULLIF(status,'cancelled') IS NULL AND total > 500 AND DATE(created_at) = created_at"));
console.log("cancelled > 300:", q("SELECT COUNT(*) n FROM orders WHERE status = 'cancelled' AND total > 300"));
console.log("cancelled > 800:", q("SELECT COUNT(*) n FROM orders WHERE status = 'cancelled' AND total > 800"));
console.log("cancelled months >300:", q("SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) n FROM orders WHERE status = 'cancelled' AND total > 300"));
console.log("cancelled months >800:", q("SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) n FROM orders WHERE status = 'cancelled' AND total > 800"));
console.log("pending > 300 months:", q("SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) n FROM orders WHERE status = 'pending' AND total > 300"));
console.log("months with shipped:", q("SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) n FROM orders WHERE status = 'shipped'"));
console.log("dec-2024 > 300:", q("SELECT COUNT(*) n FROM orders WHERE strftime('%m', created_at) = '12' AND strftime('%Y', created_at) = '2024' AND total > 300"));
console.log("dec-2024 > 100:", q("SELECT COUNT(*) n FROM orders WHERE strftime('%m', created_at) = '12' AND strftime('%Y', created_at) = '2024' AND total > 100"));
console.log("2025 > 500:", q("SELECT COUNT(*) n FROM orders WHERE strftime('%Y', created_at) = '2025' AND total > 500"));
console.log("2024 delivered:", q("SELECT COUNT(*) n FROM orders WHERE IFNULL(created_at,'1900-01-01') < '2025-01-01' AND status = 'delivered' AND DATE(created_at) = created_at"));
console.log("2024 delivered < jun:", q("SELECT COUNT(*) n FROM orders IFNULL WHERE 1=1").slice(0, 1) === "" ? "" : q("SELECT COUNT(*) n FROM orders WHERE IFNULL(created_at,'1900-01-01') < '2024-06-01' AND status = 'delivered'"));
console.log("pending sum:", q("SELECT ROUND(SUM(total),2) v FROM orders WHERE status = 'pending'"));
console.log("burn pending:", q("SELECT ROUND((SELECT SUM(total) FROM orders WHERE status = 'pending') * 1.0 / (SELECT SUM(total) FROM orders WHERE status = 'delivered'), 3) r"));
console.log("burn cancel/deliv-shipped:", q("SELECT ROUND((SELECT SUM(total) FROM orders WHERE status = 'cancelled') * 1.0 / (SELECT SUM(total) FROM orders WHERE status = 'shipped'), 3) r"));
console.log("orders w/o items:", q("SELECT COUNT(*) n FROM orders o WHERE NOT EXISTS (SELECT 1 FROM order_items i WHERE i.order_id = o.id)"));
console.log("drift pot>0:", q(`SELECT COUNT(*) n FROM (
  SELECT o.id, o.total, o.created_at, COALESCE(IFNULL(i.pot, 0), 0) AS pot FROM orders o
  LEFT JOIN (SELECT order_id, SUM(quantity * unit_price) AS pot FROM order_items GROUP BY order_id) i ON i.order_id = o.id
) WHERE pot != total AND DATE(created_at) = created_at AND pot > 0`));
console.log("drift ROUND-fold:", q(`SELECT COUNT(*) n FROM (
  SELECT o.id, o.total, COALESCE(ROUND(i.pot, 0), 0) AS pot FROM orders o
  LEFT JOIN (SELECT order_id, SUM(quantity * unit_price) AS pot FROM order_items GROUP BY order_id) i ON i.order_id = o.id
) WHERE pot != total`));
console.log("drift >500:", q(`SELECT COUNT(*) n FROM (
  SELECT o.id, o.total, COALESCE(IFNULL(i.pot, 0), 0) AS pot FROM orders o
  LEFT JOIN (SELECT order_id, SUM(quantity * unit_price) AS pot FROM order_items GROUP BY order_id) i ON i.order_id = o.id
) WHERE pot != total AND pot > 500`));
console.log("email len distinct count:", q("SELECT COUNT(DISTINCT LENGTH(email)) n FROM customers WHERE INSTR(email, '@') > 0"));
console.log("gap -180 order total:", q(`SELECT o.total, o.created_at FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY julianday(o.created_at) - julianday(c.created_at) LIMIT 2`));
console.log("min gap >500:", q(`SELECT ROUND(MIN(julianday(o.created_at) - julianday(c.created_at)), 0) d FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.total > 500`));
console.log("gap max all:", q(`SELECT ROUND(MAX(julianday(o.created_at) - julianday(c.created_at)), 0) d FROM orders o JOIN customers c ON c.id = o.customer_id`));
console.log("solo pot round:", q(`SELECT ROUND(SUM(total), 2) v, COUNT(*) n FROM orders WHERE id IN (SELECT order_id FROM order_items GROUP BY order_id HAVING COUNT(*) = 1) AND total > 0`));
console.log("solo pot >500:", q(`SELECT ROUND(SUM(total), 2) v FROM orders WHERE id IN (SELECT order_id FROM order_items GROUP BY order_id HAVING COUNT(*) = 1) AND total > 500`));
console.log("solo 2-line pot:", q(`SELECT ROUND(SUM(total), 2) v FROM orders WHERE id IN (SELECT order_id FROM order_items GROUP BY order_id HAVING COUNT(*) = 2)`));

console.log("\n== cs-1450 fixed ==");
console.log(q(`SELECT mo, rev, run FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev,
         SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run,
         NTILE(4) OVER (ORDER BY SUM(total) ASC) AS q
  FROM (SELECT created_at, total FROM orders)
  GROUP BY mo
) WHERE q = 4`));
console.log("bucket4 runs <15000:", q(`SELECT mo, rev, run FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev,
         SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run,
         NTILE(4) OVER (ORDER BY SUM(total) ASC) AS q
  FROM (SELECT created_at, total FROM orders)
  GROUP BY mo
) WHERE q = 4 AND run < 15000`));
console.log("bucket4 runs <20000:", q(`SELECT mo, rev, run FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev,
         SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run,
         NTILE(4) OVER (ORDER BY SUM(total) ASC) AS q
  FROM (SELECT created_at, total FROM orders)
  GROUP BY mo
) WHERE q = 4 AND run < 20000`));
console.log("bucket1 desc:", q(`SELECT COUNT(*) n FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev,
         SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run,
         NTILE(4) OVER (ORDER BY SUM(total) DESC) AS q
  FROM (SELECT created_at, total FROM orders)
  GROUP BY mo
) WHERE q = 4`));
console.log("run with COUNT fold:", q(`SELECT COUNT(*) n FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev,
         COUNT(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run,
         NTILE(4) OVER (ORDER BY SUM(total) ASC) AS q
  FROM (SELECT created_at, total FROM orders)
  GROUP BY mo
) WHERE q = 4 AND run < 15000`));
