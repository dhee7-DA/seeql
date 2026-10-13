// Task 95 probe part 2 — labeled reruns of case 4 order-bys, case 5, case 6 (correct cents columns). DELETED AFTER USE.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe95b.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function run(label: string, sql: string) {
  try {
    const res = db.query(sql).all() as Record<string, unknown>[];
    const rows = res.map((r) => Object.values(r).map((c) => String(c)).join("|"));
    console.log(`[${label}] OK rows=${rows.length}`);
    for (const r of rows.slice(0, 16)) console.log("   ", r);
  } catch (e) {
    console.log(`[${label}] ERR:`, e instanceof Error ? e.message : e);
  }
}

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
const CORRECT4 = JSON.stringify(db.query(c4).all());
console.log("correct4 hash:", CORRECT4.length);
run("c4 order-by revenue", c4.replace("ORDER BY month_key;", "ORDER BY revenue;"));
run("c4 order-by delta", c4.replace("ORDER BY month_key;", "ORDER BY delta;"));
run("c4 order-by bookings", c4.replace("ORDER BY month_key;", "ORDER BY bookings;"));
run("c4 order-by prior_revenue", c4.replace("ORDER BY month_key;", "ORDER BY prior_revenue;"));
run("c4 order-by 0", c4.replace("ORDER BY month_key;", "ORDER BY 0;"));
run("c4 order-by LEAD", c4.replace("{2}(revenue) OVER (ORDER BY month_key) AS prior_revenue", "LEAD(revenue) OVER (ORDER BY month_key) AS prior_revenue"));

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
const CORRECT5 = JSON.stringify(db.query(c5).all());
console.log("correct5:", CORRECT5);
run("c5 gate 2", c5.replace(">= 19", ">= 2"));
run("c5 gate 20", c5.replace(">= 19", ">= 20"));
run("c5 gate 37", c5.replace(">= 19", ">= 37"));
run("c5 gate 45", c5.replace(">= 19", ">= 45"));
run("c5 gate region", c5.replace(">= 19", ">= region"));
run("c5 AVG fold", c5.replace("SUM(o.total), 2) AS value", "AVG(o.total), 2) AS value"));
run("c5 join o.id", c5.replace("c.id = o.customer_id", "c.id = o.id"));
run("c5 join =2", c5.replace("c.id = o.customer_id", "c.id = 2"));
run("c5 join o.region", c5.replace("c.id = o.customer_id", "c.id = o.region"));
run("c5 label total", c5.replace("SELECT 'TOTAL',", "SELECT 'total',"));
run("c5 label AVG", c5.replace("SELECT 'TOTAL',", "SELECT 'AVG',"));
run("c5 label region", c5.replace("SELECT 'TOTAL',", "SELECT 'region',"));
run("c5 SUM in gate", c5.replace(">= 19", ">= SUM"));
run("c5 SUM label", c5.replace("SELECT 'TOTAL',", "SELECT 'SUM',"));

// ---- CASE 6 (q6): settlement coverage census (correct cents columns)
const c6 = `WITH paid AS (
  SELECT i.id,
         i.status,
         i.amount_cents,
         COALESCE(SUM(p.amount_cents), 0) AS paid_cents
  FROM invoices i
  LEFT JOIN payments p ON p.invoice_id = i.id
  GROUP BY i.id
)
SELECT CASE
         WHEN paid_cents = 0 THEN 'none'
         WHEN paid_cents < amount_cents THEN 'partial'
         ELSE 'settled'
       END AS coverage,
       COUNT(*) AS bills,
       SUM(amount_cents) AS billed_cents,
       SUM(CASE WHEN paid_cents < amount_cents THEN paid_cents ELSE 0 END) AS paid_on_open
FROM paid
GROUP BY coverage
ORDER BY bills DESC;`;
const CORRECT6 = JSON.stringify(db.query(c6).all());
console.log("correct6:", CORRECT6);
run("c6 join p.id", c6.replace("p.invoice_id = i.id", "p.id = i.id"));
run("c6 join p.customer_id", c6.replace("p.invoice_id = i.id", "p.customer_id = i.id"));
run("c6 join p.amount_cents=i.id", c6.replace("p.invoice_id = i.id", "p.amount_cents = i.id"));
run("c6 ASC", c6.replace("ORDER BY bills DESC", "ORDER BY bills ASC"));
run("c6 threshold 1", c6.replace("WHEN paid_cents = 0 THEN 'none'", "WHEN paid_cents = 1 THEN 'none'"));
run("c6 paid_on_open=id", c6.replace("THEN paid_cents ELSE 0 END) AS paid_on_open", "THEN id ELSE 0 END) AS paid_on_open"));
run("c6 paid_on_open=1", c6.replace("THEN paid_cents ELSE 0 END) AS paid_on_open", "THEN 1 ELSE 0 END) AS paid_on_open"));
run("c6 paid_on_open=SUM", c6.replace("THEN paid_cents ELSE 0 END) AS paid_on_open", "THEN SUM ELSE 0 END) AS paid_on_open"));
run("c6 paid_on_open=open", c6.replace("THEN paid_cents ELSE 0 END) AS paid_on_open", "THEN open ELSE 0 END) AS paid_on_open"));
run("c6 paid_on_open=ASC", c6.replace("THEN paid_cents ELSE 0 END) AS paid_on_open", "THEN ASC ELSE 0 END) AS paid_on_open"));
run("c6 threshold ASC", c6.replace("WHEN paid_cents = 0 THEN 'none'", "WHEN paid_cents = ASC THEN 'none'"));
run("c6 no COALESCE", c6.replace("COALESCE(SUM(p.amount_cents), 0) AS paid_cents", "SUM(p.amount_cents) AS paid_cents"));
run("c6 id in gate slot", c6.replace("p.invoice_id = i.id", "p.id_invoice = i.id"));
// extra prose figures
run("detail rows", `WITH paid AS (
  SELECT i.id, i.status, i.amount_cents, COALESCE(SUM(p.amount_cents), 0) AS paid_cents
  FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id
  GROUP BY i.id)
SELECT id, status, amount_cents, paid_cents FROM paid
WHERE status = 'open' OR paid_cents <> amount_cents OR status = 'void'
ORDER BY id;`);
run("open bills detail", `WITH paid AS (
  SELECT i.id, i.status, i.amount_cents, COALESCE(SUM(p.amount_cents), 0) AS paid_cents
  FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id
  GROUP BY i.id)
SELECT id, amount_cents, paid_cents FROM paid WHERE status = 'open' ORDER BY id;`);
run("avg latency network", "SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) FROM orders WHERE shipped_at IS NOT NULL");
run("market count check", "SELECT c.region, COUNT(*) FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.shipped_at IS NOT NULL GROUP BY c.region ORDER BY COUNT(*) DESC");

db.close();
rmSync(COPY, { force: true });
console.log("PROBE2 DONE");
