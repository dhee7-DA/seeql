// Read-only probe for task 95-wolt (3x expansion). Deleted after use.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-wolt95.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function runSql(sql: string): { ok: true; rows: unknown[][] } | { ok: false; error: string } {
  try {
    const res = db.query(sql).all() as Record<string, unknown>[];
    if (res.length === 0) return { ok: true, rows: [] };
    const cols = Object.keys(res[0]);
    return { ok: true, rows: res.map((r) => cols.map((c) => r[c])) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
function fill(template: string, values: Record<number, string>): string {
  return template.replace(/\{(\d+)\}/g, (_, n) => values[Number(n)] ?? `{${n}}`);
}
function normalizeCell(c: unknown): string {
  if (c === null) return "NULL";
  if (typeof c === "number") return String(c);
  if (c instanceof Uint8Array) return "<blob>";
  return String(c);
}
function canonRows(rows: unknown[][]): string {
  return JSON.stringify(rows.map((r) => r.map(normalizeCell)));
}
function show(label: string, res: { ok: true; rows: unknown[][] } | { ok: false; error: string }) {
  if (!res.ok) console.log(`${label}: ERROR ${res.error}`);
  else console.log(`${label}: ${canonRows(res.rows)}`);
}

// ---- schema recon ----------------------------------------------------------
console.log("== schema ==");
for (const t of ["orders", "invoices", "payments", "suppliers"]) {
  const info = db.query(`PRAGMA table_info(${t})`).all() as Record<string, unknown>[];
  console.log(t, info.map((c) => `${c.name}:${c.type}`).join(", "));
}
console.log("samples:", db.query("SELECT created_at, shipped_at FROM orders LIMIT 2").all());
console.log("cents typeof:", db.query("SELECT typeof(amount_cents), amount_cents FROM invoices LIMIT 2").all());
console.log("pay typeof:", db.query("SELECT typeof(amount_cents) FROM payments LIMIT 1").all());

// ---- cs-wolt-3 (s6, settlement coverage classifier) -------------------------
const t3 = `SELECT CASE
         WHEN p.paid_cents IS NULL THEN {1}
         WHEN p.paid_cents >= i.amount_cents THEN 'exact'
         ELSE 'partial'
       END AS coverage,
       COUNT(*) AS statements,
       ROUND(SUM(i.amount_cents) / {2}, 2) AS statement_value
FROM invoices i
LEFT JOIN (
  SELECT invoice_id, SUM(amount_cents) AS paid_cents
  FROM payments
  GROUP BY {3}
) p ON {4}
GROUP BY coverage
ORDER BY statement_value {5}`;
const s3 = ["'no settlement'", "100.0", "invoice_id", "p.invoice_id = i.id", "DESC"];
const d3 = ["'partial'", "i.status", "1000", "amount_cents", "i.id = i.id", "ASC"];
console.log("\n== cs-wolt-3 ==");
const r3 = runSql(fill(t3, Object.fromEntries(s3.map((v, i) => [i + 1, v]))));
show("correct", r3);
for (let i = 0; i < s3.length; i++) {
  for (const d of d3) {
    if (d === s3[i]) continue;
    const vals = Object.fromEntries(s3.map((v, j) => [j + 1, v]));
    vals[i + 1] = d;
    const p = runSql(fill(t3, vals));
    const ambiguous = r3.ok && p.ok && canonRows(p.rows) === canonRows(r3.rows);
    if (p.ok && !ambiguous) console.log(`  OK   slot${i + 1} <- "${d}" (differs)`);
    if (p.ok && ambiguous) console.log(`  !!! AMBIGUOUS slot${i + 1} <- "${d}"`);
    if (!p.ok) console.log(`  ERR  slot${i + 1} <- "${d}" (${p.error.slice(0, 60)})`);
  }
}

// ---- cs-wolt-4 (q2, vendor rating bench) ------------------------------------
const t4 = `SELECT s.name AS vendor,
       s.region AS city_cluster,
       s.rating,
       s.listings,
       (SELECT ROUND({1}, 1) FROM suppliers) AS network_rating
FROM suppliers s
WHERE s.rating > {2}
ORDER BY s.rating {3}`;
const s4 = ["AVG(rating)", "4.3", "DESC"];
const d4 = ["MAX(rating)", "MIN(rating)", "SUM(rating)", "4.5", "3.9", "ASC"];
console.log("\n== cs-wolt-4 ==");
const r4 = runSql(fill(t4, Object.fromEntries(s4.map((v, i) => [i + 1, v]))));
show("correct", r4);
for (let i = 0; i < s4.length; i++) {
  for (const d of d4) {
    if (d === s4[i]) continue;
    const vals = Object.fromEntries(s4.map((v, j) => [j + 1, v]));
    vals[i + 1] = d;
    const p = runSql(fill(t4, vals));
    const ambiguous = r4.ok && p.ok && canonRows(p.rows) === canonRows(r4.rows);
    if (p.ok && !ambiguous) console.log(`  OK   slot${i + 1} <- "${d}" (differs)`);
    if (p.ok && ambiguous) console.log(`  !!! AMBIGUOUS slot${i + 1} <- "${d}"`);
    if (!p.ok) console.log(`  ERR  slot${i + 1} <- "${d}" (${p.error.slice(0, 60)})`);
  }
}

// ---- cs-wolt-5 (t7, demand momentum board) ----------------------------------
const t5 = `WITH monthly AS (
  SELECT STRFTIME({1}, created_at) AS month,
         COUNT(*) AS baskets,
         ROUND(SUM(total), 2) AS revenue
  FROM orders
  GROUP BY month
),
lagged AS (
  SELECT month, baskets, revenue,
         LAG({2}) OVER (ORDER BY month) AS prev_baskets,
         LAG(revenue) OVER (ORDER BY month) AS prev_revenue
  FROM monthly
)
SELECT month,
       baskets,
       revenue,
       prev_baskets,
       {3} AS basket_delta,
       ROUND(revenue - prev_revenue, 2) AS revenue_delta
FROM lagged
ORDER BY {4}`;
const s5 = ["'%Y-%m'", "baskets", "baskets - prev_baskets", "month"];
const d5 = ["%Y-%m", "revenue", "month", "prev_baskets - baskets", "baskets + prev_baskets", "basket_delta"];
console.log("\n== cs-wolt-5 ==");
const r5 = runSql(fill(t5, Object.fromEntries(s5.map((v, i) => [i + 1, v]))));
show("correct", r5);
for (let i = 0; i < s5.length; i++) {
  for (const d of d5) {
    if (d === s5[i]) continue;
    const vals = Object.fromEntries(s5.map((v, j) => [j + 1, v]));
    vals[i + 1] = d;
    const p = runSql(fill(t5, vals));
    const ambiguous = r5.ok && p.ok && canonRows(p.rows) === canonRows(r5.rows);
    if (p.ok && !ambiguous) console.log(`  OK   slot${i + 1} <- "${d}" (differs)`);
    if (p.ok && ambiguous) console.log(`  !!! AMBIGUOUS slot${i + 1} <- "${d}"`);
    if (!p.ok) console.log(`  ERR  slot${i + 1} <- "${d}" (${p.error.slice(0, 60)})`);
  }
}

// ---- cs-wolt-6 (x3, cluster census + network TOTAL) --------------------------
const t6 = `SELECT c.region AS city_cluster,
       COUNT(*) AS baskets,
       ROUND(SUM(o.total), 2) AS basket_value
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.region
HAVING COUNT(*) >= {1}
UNION ALL
SELECT {2},
       COUNT(*),
       ROUND(SUM(total), 2)
FROM orders
ORDER BY basket_value {3}`;
const s6 = ["19", "'TOTAL'", "DESC"];
const d6 = ["20", "2", "45", "city_cluster", "'NETWORK'", "ASC"];
console.log("\n== cs-wolt-6 ==");
const r6 = runSql(fill(t6, Object.fromEntries(s6.map((v, i) => [i + 1, v]))));
show("correct", r6);
for (let i = 0; i < s6.length; i++) {
  for (const d of d6) {
    if (d === s6[i]) continue;
    const vals = Object.fromEntries(s6.map((v, j) => [j + 1, v]));
    vals[i + 1] = d;
    const p = runSql(fill(t6, vals));
    const ambiguous = r6.ok && p.ok && canonRows(p.rows) === canonRows(r6.rows);
    if (p.ok && !ambiguous) console.log(`  OK   slot${i + 1} <- "${d}" (differs)`);
    if (p.ok && ambiguous) console.log(`  !!! AMBIGUOUS slot${i + 1} <- "${d}"`);
    if (!p.ok) console.log(`  ERR  slot${i + 1} <- "${d}" (${p.error.slice(0, 60)})`);
  }
}

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done");
