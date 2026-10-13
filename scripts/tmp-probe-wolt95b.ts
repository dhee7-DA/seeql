import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
const COPY = "scripts/.probe-wolt95b.db";
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
function fill(t: string, v: Record<number, string>): string {
  return t.replace(/\{(\d+)\}/g, (_, n) => v[Number(n)] ?? `{${n}}`);
}
function normalizeCell(c: unknown): string {
  if (c === null) return "NULL";
  if (typeof c === "number") return String(c);
  return String(c);
}
function canonRows(rows: unknown[][]): string {
  return JSON.stringify(rows.map((r) => r.map(normalizeCell)));
}
function matrix(name: string, t: string, s: string[], ds: string[]) {
  const r = runSql(fill(t, Object.fromEntries(s.map((v, i) => [i + 1, v]))));
  console.log(`${name} correct: ${r.ok ? canonRows(r.rows) : "ERROR " + r.error}`);
  let bad = 0;
  for (let i = 0; i < s.length; i++) {
    for (const d of ds) {
      if (d === s[i]) continue;
      const vals = Object.fromEntries(s.map((v, j) => [j + 1, v]));
      vals[i + 1] = d;
      const p = runSql(fill(t, vals));
      const amb = r.ok && p.ok && canonRows(p.rows) === canonRows(r.rows);
      if (p.ok && amb) { console.log(`  !!! AMBIGUOUS slot${i + 1} <- "${d}"`); bad++; }
      if (!p.ok && !r.ok) { console.log(`  ??? both-error slot${i + 1} <- "${d}"`); bad++; }
    }
  }
  console.log(`${name}: ${bad === 0 ? "ALL DISTRACTORS CONSEQUENTIAL" : bad + " PROBLEMS"}`);
}
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
matrix("cs-wolt-3", t3, ["'no settlement'", "100.0", "invoice_id", "p.invoice_id = i.id", "DESC"], ["'partial'", "i.status", "1000", "method", "i.id = i.id", "ASC"]);
const t4 = `SELECT s.name AS vendor,
       s.region AS city_cluster,
       s.rating,
       (SELECT ROUND({1}, 1) FROM suppliers) AS network_rating
FROM suppliers s
WHERE s.rating > {2}
ORDER BY s.rating {3}`;
matrix("cs-wolt-4", t4, ["AVG(rating)", "4.3", "DESC"], ["MAX(rating)", "MIN(rating)", "SUM(rating)", "4.5", "3.9", "ASC"]);
db.close();
rmSync(COPY, { force: true });
