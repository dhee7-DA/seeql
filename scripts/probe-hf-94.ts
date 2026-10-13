// TEMP probe for task 94-hellofresh — read-only verification, delete after use.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-hf-94.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function run(sql: string): { ok: true; rows: unknown[][] } | { ok: false; error: string } {
  try {
    const res = db.query(sql).all() as Record<string, unknown>[];
    if (res.length === 0) return { ok: true, rows: [] };
    const cols = Object.keys(res[0]);
    return { ok: true, rows: res.map((r) => cols.map((c) => r[c])) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
function norm(c: unknown): string {
  if (c === null) return "NULL";
  if (typeof c === "number") return String(c);
  if (c instanceof Uint8Array) return "<blob>";
  return String(c);
}
const canon = (rows: unknown[][]) => JSON.stringify(rows.map((r) => r.map(norm)));

function fill(t: string, v: Record<number, string>): string {
  return t.replace(/\{(\d+)\}/g, (_, n) => v[Number(n)] ?? `{${n}}`);
}

// ---- schema ----
for (const t of ["customers", "suppliers", "products", "orders", "order_items", "invoices", "payments", "expenses", "ledger_entries"]) {
  const info = db.query(`PRAGMA table_info(${t})`).all() as { name: string; type: string }[];
  console.log(`SCHEMA ${t}: ${info.map((i) => i.name).join(", ")}`);
}

// ---- case 3 (j7 supplier rollup) ----
const c3t = `SELECT s.name AS partner,\n       ROUND(SUM({1}), 2) AS partner_revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = {2}\nJOIN order_items oi ON oi.product_id = p.{3}\nGROUP BY s.name\nORDER BY partner_revenue {4}`;
const c3slots = ["oi.unit_price * oi.quantity", "s.id", "id", "DESC"];
const c3distractors = ["oi.quantity", "oi.unit_price", "p.id", "supplier_id", "price", "ASC"];
verify("C3", c3t, c3slots, c3distractors);

// ---- case 4 (s7 region demand pivot) ----
const c4t = `SELECT c.region AS market,\n       COUNT(*) AS placed,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS delivered,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS queued,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS skip_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {2}\nHAVING COUNT(*) >= {3}\nORDER BY placed {4}`;
const c4slots = ["'delivered'", "c.region", "19", "DESC"];
const c4distractors = ["'shipped'", "'pending'", "'cancelled'", "c.city", "2", "37", "45", "ASC"];
verify("C4", c4t, c4slots, c4distractors);

// ---- case 5 (t7 settlement gap watcher) ----
const c5t = `WITH settled AS (\n  SELECT c.name AS subscriber,\n         p.paid_on AS paid_on,\n         LAG(p.paid_on) OVER (PARTITION BY {1} ORDER BY p.paid_on) AS prev_paid\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n  JOIN customers c ON c.id = i.customer_id\n)\nSELECT subscriber,\n       paid_on,\n       prev_paid,\n       CAST(JULIANDAY(paid_on) - JULIANDAY({2}) AS INTEGER) AS gap_days\nFROM settled\nWHERE gap_days >= {3}\nORDER BY gap_days {4}`;
const c5slots = ["c.name", "prev_paid", "112", "DESC"];
const c5distractors = ["i.id", "c.region", "p.method", "paid_on", "subscriber", "110", "113", "154", "ASC"];
verify("C5", c5t, c5slots, c5distractors);

// ---- case 6 (x2 one-pass renewal census) ----
const c6t = `SELECT i.status,\n       COUNT(*) AS statements,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS dollars,\n       COUNT(*) FILTER (WHERE {1}) AS settled_rows,\n       ROUND(SUM(i.amount_cents) FILTER (WHERE i.status = 'paid') / {2}, 2) AS paid_dollars\nFROM invoices i\nGROUP BY i.status\nHAVING SUM(i.amount_cents) / 100.0 >= {3}\nORDER BY dollars DESC`;
const c6slots = ["i.status = 'paid'", "100.0", "925"];
const c6distractors = ["i.status = 'open'", "1 = 1", "i.paid_on IS NOT NULL", "100", "1000", "19609", "66443", "92500"];
verify("C6", c6t, c6slots, c6distractors);

function verify(tag: string, t: string, slots: string[], distractors: string[]) {
  const correct = fill(t, Object.fromEntries(slots.map((s, i) => [i + 1, s])));
  const res = run(correct);
  console.log(`\n== ${tag} correct: ${res.ok ? `${res.rows.length} rows` : `ERROR ${res.error}`}`);
  if (res.ok) console.log(canon(res.rows).slice(0, 900));
  const n = slots.length;
  const used = new Set<number>();
  for (const m of t.matchAll(/\{(\d+)\}/g)) used.add(Number(m[1]));
  console.log(`${tag} markers: ${[...used].sort().join(",")} slots: ${n}`);
  for (const d of distractors) {
    for (let i = 0; i < n; i++) {
      if (d === slots[i]) continue;
      const v: Record<number, string> = {};
      for (let j = 0; j < n; j++) v[j + 1] = slots[j];
      v[i + 1] = d;
      const p = run(fill(t, v));
      let verdict: string;
      if (!p.ok) verdict = "ERROR(ok)";
      else if (res.ok && canon(p.rows) === canon(res.rows)) verdict = "!!SAME!!";
      else verdict = `diff(${p.rows.length}r)`;
      if (verdict !== "ERROR(ok)" || true) console.log(`${tag} d="${d}" slot${i + 1}: ${verdict}`);
    }
  }
}

// ---- settlement gap distribution (case 5 number-slot hunting) ----
console.log("\n== settlement gaps per subscriber (all) ==");
const gaps = run(`WITH settled AS (
  SELECT c.name AS subscriber, p.paid_on AS paid_on,
         LAG(p.paid_on) OVER (PARTITION BY c.name ORDER BY p.paid_on) AS prev_paid
  FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON c.id = i.customer_id
) SELECT subscriber, paid_on, prev_paid, CAST(JULIANDAY(paid_on) - JULIANDAY(prev_paid) AS INTEGER) AS gap_days FROM settled`);
if (gaps.ok) for (const r of gaps.rows) console.log(r.map(norm).join(" | "));
const gapVals = run(`WITH settled AS (
  SELECT JULIANDAY(p.paid_on) - JULIANDAY(LAG(p.paid_on) OVER (PARTITION BY i.customer_id ORDER BY p.paid_on)) AS g
  FROM payments p JOIN invoices i ON i.id = p.invoice_id
) SELECT g, COUNT(*) FROM settled GROUP BY g ORDER BY g`);
if (gapVals.ok) console.log("gap histogram: " + gapVals.rows.map((r) => `${norm(r[0])}x${norm(r[1])}`).join(", "));

// ---- extra figures for prose ----
const figs: Array<[string, string]> = [
  ["method avg", `SELECT method, COUNT(*), ROUND(SUM(amount_cents)/100.0, 2), ROUND(AVG(amount_cents)/100.0, 2) FROM payments GROUP BY method`],
  ["expense avg", `SELECT category, COUNT(*), ROUND(SUM(amount)/100.0, 2), ROUND(AVG(amount)/100.0, 2) FROM expenses GROUP BY category ORDER BY 3 DESC`],
  ["market AOV of AOVs", `SELECT ROUND(AVG(t.aov), 2) FROM (SELECT c.region, ROUND(AVG(o.total), 2) AS aov FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region) t`],
  ["supplier rollup", `SELECT s.name, ROUND(SUM(oi.unit_price * oi.quantity), 2) FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id GROUP BY s.name ORDER BY 2 DESC`],
  ["region status pivot", `SELECT c.region, SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END), SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END), ROUND(100.0*SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END)/COUNT(*),1) FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY COUNT(*) DESC`],
  ["invoice census", `SELECT i.status, COUNT(*), ROUND(SUM(i.amount_cents)/100.0,2) FROM invoices i GROUP BY i.status ORDER BY 3 DESC`],
  ["ledger", `SELECT account, entries, debits, credits, net FROM (SELECT account, COUNT(*) entries, SUM(debit) debits, SUM(credit) credits FROM ledger_entries GROUP BY account)`],
];
for (const [label, sql] of figs) {
  const r = run(sql);
  console.log(`\nFIG ${label}: ${r.ok ? "" : "ERROR " + r.error}`);
  if (r.ok) for (const row of r.rows) console.log("  " + row.map(norm).join(" | "));
}

db.close();
rmSync(COPY, { force: true });
