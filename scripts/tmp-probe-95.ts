// Task 95 probe — read-only verification of tripcom 3x case figures + distractor matrix. DELETED AFTER USE.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe95.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function run(sql: string) {
  try {
    const res = db.query(sql).all() as Record<string, unknown>[];
    console.log("SQL OK:", sql.replace(/\s+/g, " ").slice(0, 110));
    if (res.length === 0) console.log("  (0 rows)");
    else {
      const cols = Object.keys(res[0]);
      console.log("  cols:", cols.join(" | "));
      for (const r of res) console.log("  ", cols.map((c) => String(r[c])).join(" | "));
    }
  } catch (e) {
    console.log("SQL ERR:", sql.replace(/\s+/g, " ").slice(0, 110), "->", e instanceof Error ? e.message : e);
  }
}

// ---- schemas
for (const t of ["orders", "invoices", "payments"]) {
  const cols = db.query(`PRAGMA table_info(${t})`).all() as { name: string; type: string }[];
  console.log(`SCHEMA ${t}:`, cols.map((c) => `${c.name}:${c.type}`).join(", "));
}

// ---- CASE 3 (t3): per-market booking-to-travel clock
const c3 = `SELECT c.region,
       COUNT(*) AS journeys_clocked,
       ROUND(AVG(julianday(o.shipped_at) - julianday(o.created_at)), 2) AS avg_days,
       MAX(julianday(o.shipped_at) - julianday(o.created_at)) AS slowest_days
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.shipped_at IS NOT NULL
GROUP BY c.region
HAVING COUNT(*) >= 15
ORDER BY avg_days DESC;`;
run(c3);
// gate variants
for (const g of ["1", "2", "16", "29", "36", "37"]) {
  run(c3.replace(">= 15", `>= ${g}`));
}
// distractor substitutions
run(c3.replace("o.shipped_at) - julianday(o.created_at)), 2", "o.created_at) - julianday(o.created_at)), 2").replace("AVG(julianday(o.shipped_at)", "AVG(julianday(o.created_at)")); // created_at self-diff
run(c3.replace("AVG(julianday(o.shipped_at)", "AVG(julianday(o.status)")); // status NULL
run(c3.replace("c.id = o.customer_id", "c.id = o.id")); // wrong join key
run(c3.replace("c.id = o.customer_id", "c.id = o.shipped_at")); // text=never
run(c3.replace("c.id = o.customer_id", "c.id = o.status"));
run(c3.replace("HAVING COUNT(*) >= 15", "HAVING COUNT(*) >= created_at"));
run(c3.replace("), 2) AS avg_days", "), created_at) AS avg_days"));
run(c3.replace("ORDER BY avg_days DESC", "ORDER BY avg_days ASC"));
run(c3.replace("ORDER BY avg_days DESC", "ORDER BY avg_days status"));
run(c3.replace("), 2) AS avg_days", "), 16) AS avg_days"));
run(c3.replace("), 2) AS avg_days", "), 36) AS avg_days"));
run(c3.replace("ORDER BY avg_days DESC", "ORDER BY avg_days 1"));
run(c3.replace("ORDER BY avg_days DESC", "ORDER BY avg_days 0"));

// ---- CASE 4 (t7): pace walk, gate 7
const c4 = `WITH pace AS (
  SELECT SUBSTR(created_at, 1, 7) AS month_key,
         COUNT(*) AS bookings,
         ROUND(SUM(total), 2) AS revenue
  FROM orders
  GROUP BY month_key
  HAVING COUNT(*) >= 7
)
SELECT month_key,
       bookings,
       revenue,
       LAG(revenue) OVER (ORDER BY month_key) AS prior_revenue,
       ROUND(revenue - LAG(revenue) OVER (ORDER BY month_key), 2) AS delta
FROM pace
ORDER BY month_key;`;
run(c4);
run(c4.replace(">= 7", ">= 6"));
run(c4.replace(">= 7", ">= 8"));
run(c4.replace("{2}(revenue) OVER (ORDER BY month_key) AS prior_revenue", "LEAD(revenue) OVER (ORDER BY month_key) AS prior_revenue"));
run(c4.replace("LAG(revenue) OVER (ORDER BY month_key) AS prior_revenue", "SUM(revenue) OVER (ORDER BY month_key) AS prior_revenue"));
run(c4.replace("LAG(revenue) OVER (ORDER BY month_key) AS prior_revenue", "MAX(revenue) OVER (ORDER BY month_key) AS prior_revenue"));
run(c4.replace("COUNT(*) AS bookings", "SUM(*) AS bookings"));
run(c4.replace("COUNT(*) AS bookings", "MAX(*) AS bookings"));
run(c4.replace("COUNT(*) AS bookings", "revenue(*) AS bookings"));
run(c4.replace("ORDER BY month_key;", "ORDER BY revenue;"));
run(c4.replace("ORDER BY month_key;", "ORDER BY delta;"));
run(c4.replace("ORDER BY month_key;", "ORDER BY bookings;"));
run(c4.replace("ORDER BY month_key;", "ORDER BY prior_revenue;"));
run(c4.replace("ORDER BY month_key;", "ORDER BY 0;"));
// full-window MoM extremes for prose
run(`WITH pace AS (
  SELECT SUBSTR(created_at, 1, 7) AS month_key, ROUND(SUM(total), 2) AS revenue
  FROM orders GROUP BY month_key)
SELECT month_key, revenue, ROUND(revenue - LAG(revenue) OVER (ORDER BY month_key), 2) AS delta
FROM pace ORDER BY month_key;`);

// ---- CASE 5 (x3): grand-total stack, gate 19
const c5 = `SELECT c.region AS market,
       COUNT(*) AS bookings,
       ROUND(SUM(o.total), 2) AS value
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.region
HAVING COUNT(*) >= 19
UNION ALL
SELECT 'TOTAL',
       COUNT(*),
       ROUND(SUM(total), 2)
FROM orders;`;
run(c5);
for (const g of ["2", "18", "20", "37", "45", "region"]) run(c5.replace(">= 19", `>= ${g}`));
run(c5.replace("SUM(o.total), 2) AS value", "AVG(o.total), 2) AS value"));
run(c5.replace("c.id = o.customer_id", "c.id = o.id"));
run(c5.replace("c.id = o.customer_id", "c.id = 2"));
run(c5.replace("c.id = o.customer_id", "c.id = o.region"));
run(c5.replace("c.id = o.customer_id", "c.id = AVG(o.total)"));
run(c5.replace("SELECT 'TOTAL',", "SELECT 'total',"));
run(c5.replace("SELECT 'TOTAL',", "SELECT 'AVG',"));
run(c5.replace("SELECT 'TOTAL',", "SELECT 'region',"));

// ---- CASE 6 (q6): settlement coverage census
const c6 = `WITH paid AS (
  SELECT i.id,
         i.status,
         i.amount,
         COALESCE(SUM(p.amount), 0) AS paid_cents
  FROM invoices i
  LEFT JOIN payments p ON p.invoice_id = i.id
  GROUP BY i.id
)
SELECT CASE
         WHEN paid_cents = 0 THEN 'none'
         WHEN paid_cents < amount THEN 'partial'
         ELSE 'settled'
       END AS coverage,
       COUNT(*) AS bills,
       SUM(amount) AS billed_cents,
       SUM(CASE WHEN paid_cents < amount THEN paid_cents ELSE 0 END) AS paid_on_open
FROM paid
GROUP BY coverage
ORDER BY bills DESC;`;
run(c6);
run(c6.replace("p.invoice_id = i.id", "p.id = i.id"));
run(c6.replace("p.invoice_id = i.id", "p.customer_id = i.id"));
run(c6.replace("p.invoice_id = i.id", "p.amount = i.id"));
run(c6.replace("ORDER BY bills DESC", "ORDER BY bills ASC"));
run(c6.replace("WHEN paid_cents = 0 THEN 'none'", "WHEN paid_cents = 1 THEN 'none'"));
run(c6.replace("THEN paid_cents ELSE 0 END) AS paid_on_open", "THEN id ELSE 0 END) AS paid_on_open"));
run(c6.replace("THEN paid_cents ELSE 0 END) AS paid_on_open", "THEN 1 ELSE 0 END) AS paid_on_open"));
run(c6.replace("THEN paid_cents ELSE 0 END) AS paid_on_open", "THEN SUM ELSE 0 END) AS paid_on_open"));
run(c6.replace("THEN paid_cents ELSE 0 END) AS paid_on_open", "THEN open ELSE 0 END) AS paid_on_open"));
run(c6.replace("WHEN paid_cents = 0 THEN 'none'", "WHEN paid_cents = ASC THEN 'none'"));
run(c6.replace("p.invoice_id = i.id", "p.ASC = i.id"));
run(c6.replace("COALESCE(SUM(p.amount), 0) AS paid_cents\n  FROM invoices i", "SUM(p.amount) AS paid_cents\n  FROM invoices i"));
// detail rows for prose
run(`WITH paid AS (
  SELECT i.id, i.status, i.amount, COALESCE(SUM(p.amount), 0) AS paid_cents
  FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id
  GROUP BY i.id)
SELECT id, status, amount, paid_cents FROM paid
WHERE status = 'open' OR paid_cents <> amount OR status = 'void'
ORDER BY id;`);
// payments fan-out check
run("SELECT COUNT(*) FROM payments");
run("SELECT i.status, COUNT(*), SUM(i.amount) FROM invoices i GROUP BY i.status");
run("SELECT COUNT(*), SUM(amount) FROM payments WHERE invoice_id = 25");

db.close();
rmSync(COPY, { force: true });
console.log("PROBE DONE");
