// Task 95 probe #2 — refined checks only. Deleted after use.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const rows = (sql: string): unknown[][] => {
  try {
    const res = db.query(sql).all() as Record<string, unknown>[];
    if (res.length === 0) return [[]];
    const cols = Object.keys(res[0]);
    return res.map((r) => cols.map((c) => r[c]));
  } catch (e) {
    return [["ERR", e instanceof Error ? e.message : String(e)]];
  }
};
const show = (label: string, sql: string) => {
  console.log(`\n=== ${label} ===`);
  for (const r of rows(sql)) console.log(JSON.stringify(r));
};
const canon = (sql: string) => JSON.stringify(rows(sql));
const diffCheck = (label: string, correct: string, probe: string) => {
  const a = canon(correct);
  const b = canon(probe);
  console.log(`${b === a ? "!! SAME" : "ok diff"} — ${label}`);
};

// ---- j5 final design: category census, gate 1, window 2025-02 ----
const j5 = (w: string, gate: string, dir: string, polarity: string) => `
SELECT p.category AS category,
       COUNT(*) AS dark_skus,
       ROUND(SUM(p.price), 2) AS dark_list_value
FROM products p
LEFT JOIN (order_items oi JOIN orders o ON o.id = oi.order_id
           AND SUBSTR(o.created_at, 1, 7) = '${w}') ON oi.product_id = p.id
WHERE oi.id IS ${polarity}
GROUP BY p.category
HAVING COUNT(*) >= ${gate}
ORDER BY dark_list_value ${dir};`;
const j5ok = j5("2025-02", "1", "DESC", "NULL");
show("j5 correct", j5ok);
diffCheck("j5 ASC", j5ok, j5("2025-02", "1", "ASC", "NULL"));
diffCheck("j5 polarity IS NOT NULL", j5ok, j5("2025-02", "1", "DESC", "NOT NULL"));
diffCheck("j5 IS NOT NULL in dir slot", j5ok, j5("2025-02", "1", "IS NOT NULL", "NULL"));
diffCheck("j5 window 2025-01", j5ok, j5("2025-01", "1", "DESC", "NULL"));
diffCheck("j5 window 2024-12", j5ok, j5("2024-12", "1", "DESC", "NULL"));
diffCheck("j5 window bogus", j5ok, j5("2025-13", "1", "DESC", "NULL"));
diffCheck("j5 gate 2", j5ok, j5("2025-02", "2", "DESC", "NULL"));
diffCheck("j5 gate 3", j5ok, j5("2025-02", "3", "DESC", "NULL"));
diffCheck("j5 polarity INNER", j5ok, j5("2025-02", "1", "DESC", "INNER"));
diffCheck("j5 window->dir slot ASC", j5ok, j5("2025-02", "1", "ASC", "NULL"));

// ---- q6 final: distractor candidates for the fold key ----
const q6 = (agg: string, grp: string, jk: string, dir: string) => `
WITH folds AS (
  SELECT c.region AS region, c.name AS workspace, SUM(o.total) AS storage_value
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY ${grp}
),
peaks AS (
  SELECT region, ${agg}(storage_value) AS peak_value
  FROM folds
  GROUP BY region
)
SELECT f.region AS region, f.workspace AS workspace, ROUND(f.storage_value, 2) AS storage_value
FROM folds f
JOIN peaks p ON p.region = f.region AND p.peak_value = ${jk}
ORDER BY f.storage_value ${dir};`;
const q6ok = q6("MAX", "c.id", "f.storage_value", "DESC");
show("q6 correct", q6ok);
diffCheck("q6 grp c.region", q6ok, q6("MAX", "c.region", "f.storage_value", "DESC"));
diffCheck("q6 grp o.id", q6ok, q6("MAX", "o.id", "f.storage_value", "DESC"));
diffCheck("q6 grp 1 (ordinal)", q6ok, q6("MAX", "1", "f.storage_value", "DESC"));
diffCheck("q6 grp c.city", q6ok, q6("MAX", "c.city", "f.storage_value", "DESC"));
diffCheck("q6 LEAD agg", q6ok, q6("LEAD", "c.id", "f.storage_value", "DESC"));

// ---- t7 extra: LEAD in the OVER-order slot (expect error) ----
show("t7 LEAD in order slot", `
WITH spine AS (
  SELECT SUBSTR(created_at, 1, 7) AS month, COUNT(*) AS periods, SUM(total) AS billed
  FROM orders GROUP BY month
)
SELECT month, periods, ROUND(billed, 2) AS billed_value,
       ROUND(billed - LAG(billed) OVER (ORDER BY LEAD), 2) AS mom_delta
FROM spine WHERE month >= '2024-07' ORDER BY month;`);

// ---- x2 final distractor set for gate slot ----
const x2 = (st: string, denom: string, gate: string, dir: string) => `
SELECT c.region AS region,
       COUNT(*) AS seat_periods,
       COUNT(*) FILTER (WHERE o.status = '${st}') AS awaiting_provision,
       COUNT(*) FILTER (WHERE o.status = 'delivered') AS active,
       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = 'delivered') / ${denom}, 1) AS utilization_pct
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.region
HAVING COUNT(*) >= ${gate}
ORDER BY seat_periods ${dir};`;
const x2ok = x2("pending", "COUNT(*)", "19", "DESC");
show("x2 correct", x2ok);
diffCheck("x2 gate 2", x2ok, x2("pending", "COUNT(*)", "2", "DESC"));
diffCheck("x2 gate 37", x2ok, x2("pending", "COUNT(*)", "37", "DESC"));
diffCheck("x2 gate COUNT-filter expr", x2ok, x2("pending", "COUNT(*)", "COUNT(*) FILTER (WHERE o.status = 'delivered')", "DESC"));
diffCheck("x2 denom 24", x2ok, x2("pending", "24", "19", "DESC"));

db.close();
console.log("\nprobe2 done");
