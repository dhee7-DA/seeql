/// Read-only probe for Task 95 (nubank 3x expansion). Deleted after use.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });

function rows(sql: string) {
  try {
    return db.query(sql).all();
  } catch (e) {
    return [{ ERROR: e instanceof Error ? e.message : String(e) }];
  }
}
function show(tag: string, sql: string) {
  console.log(`\n== ${tag}`);
  for (const r of rows(sql)) console.log(JSON.stringify(r));
}

// ---------- cs-nubank-3 (t3): first-leg settlement clock, paid book ----------
const C3 = (julianday: string, status: string, grain: string, gate: string) => `WITH clock AS (
  SELECT p.invoice_id,
         CAST(MIN(${julianday}(p.paid_on) - JULIANDAY(i.issued_on)) AS INTEGER) AS days
  FROM payments p
  JOIN invoices i ON i.id = p.invoice_id
  WHERE i.status = ${status}
  GROUP BY ${grain}
)
SELECT invoice_id, days
FROM clock
WHERE days >= ${gate}
ORDER BY days DESC, invoice_id;`;
show("C3 correct", C3("JULIANDAY", "'paid'", "p.invoice_id", "84"));
show("C3 clock distribution (paid)", `WITH clock AS (
  SELECT p.invoice_id, CAST(MIN(JULIANDAY(p.paid_on) - JULIANDAY(i.issued_on)) AS INTEGER) AS days
  FROM payments p JOIN invoices i ON i.id = p.invoice_id
  WHERE i.status = 'paid' GROUP BY p.invoice_id)
SELECT days, COUNT(*) AS cycles FROM clock GROUP BY days ORDER BY days;`);
show("C3 board", `WITH clock AS (
  SELECT p.invoice_id, CAST(MIN(JULIANDAY(p.paid_on) - JULIANDAY(i.issued_on)) AS INTEGER) AS days
  FROM payments p JOIN invoices i ON i.id = p.invoice_id
  WHERE i.status = 'paid' GROUP BY p.invoice_id)
SELECT COUNT(*) AS cycles, ROUND(AVG(days),1) AS avg_clock, MIN(days) AS fastest, MAX(days) AS slowest FROM clock;`);

// ---------- cs-nubank-4 (q6): regional growth board ----------
const C4 = (distinctKw: string, aggKw: string, groupKey: string, gate: string, dir: string) => `WITH regions AS (
  SELECT c.region,
         COUNT(*) AS auths,
         COUNT(${distinctKw} o.customer_id) AS holders,
         ROUND(SUM(o.total), 2) AS revenue,
         ROUND(${aggKw}(o.total), 2) AS aov
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY ${groupKey}
)
SELECT region, auths, holders, revenue, aov
FROM regions
WHERE revenue >= ${gate}
ORDER BY revenue ${dir}, region;`;
show("C4 correct", C4("DISTINCT", "AVG", "c.region", "7286.16", "DESC"));
show("C4 all regions (no gate)", C4("DISTINCT", "AVG", "c.region", "0", "DESC"));

// ---------- cs-nubank-5 (x3): opex stack with TOTAL row ----------
const C5 = (aggKw: string, gate: string, total: string, dir: string) => `SELECT category,
       COUNT(*) AS lines,
       ROUND(${aggKw}(amount_cents) / 100.0, 2) AS usd
FROM expenses
GROUP BY category
HAVING COUNT(*) >= ${gate}
UNION ALL
SELECT ${total},
       COUNT(*),
       ROUND(SUM(amount_cents) / 100.0, 2)
FROM expenses
ORDER BY usd ${dir};`;
show("C5 correct", C5("SUM", "5", "'TOTAL'", "DESC"));

// ---------- cs-nubank-6 (t2): open-book gap board ----------
const C6 = (fill: string, joinKw: string, status: string, gate: string) => `SELECT i.id,
       ROUND(i.amount_cents / 100.0, 2) AS billed_usd,
       ROUND(COALESCE(SUM(p.amount_cents), ${fill}) / 100.0, 2) AS settled_usd,
       ROUND((i.amount_cents - COALESCE(SUM(p.amount_cents), 0)) / 100.0, 2) AS gap_usd
FROM invoices i
  ${joinKw} JOIN payments p ON p.invoice_id = i.id
WHERE i.status = ${status}
GROUP BY i.id
HAVING gap_usd >= ${gate}
ORDER BY gap_usd DESC;`;
show("C6 correct", C6("0", "LEFT", "'open'", "2148"));
show("C6 open gaps uncut", C6("0", "LEFT", "'open'", "0"));
show("C6 open ids check", `SELECT id, amount_cents, status FROM invoices WHERE status='open' ORDER BY amount_cents DESC;`);

// ---------- ambiguity matrix ----------
const cases: Record<string, { t: (v: string[]) => string; correct: string[]; distractors: string[] }> = {
  C3: {
    t: (v) => C3(v[0], v[1], v[2], v[3]),
    correct: ["JULIANDAY", "'paid'", "p.invoice_id", "84"],
    distractors: ["DATE", "STRFTIME", "'open'", "'void'", "13", "28.4", "2.98", "60", "p.paid_on", "p.method"],
  },
  C4: {
    t: (v) => C4(v[0], v[1], v[2], v[3], v[4]),
    correct: ["DISTINCT", "AVG", "c.region", "7286.16", "DESC"],
    distractors: ["ALL", "SUM", "c.city", "o.status", "852.44", "11605.45", "34833.28", "338.19"],
  },
  C5: {
    t: (v) => C5(v[0], v[1], v[2], v[3]),
    correct: ["SUM", "5", "'TOTAL'", "DESC"],
    distractors: ["3", "14", "6", "BOOK", "COUNT", "AVG", "ASC"],
  },
  C6: {
    t: (v) => C6(v[0], v[1], v[2], v[3]),
    correct: ["0", "LEFT", "'open'", "2148"],
    distractors: ["INNER", "RIGHT", "CROSS", "1", "NULL", "873", "1295", "2794", "3562", "4937", "'paid'", "'void'"],
  },
};
const key = (r: Record<string, unknown>[]) => JSON.stringify(r);
for (const [name, c] of Object.entries(cases)) {
  const base = rows(c.t(c.correct));
  console.log(`\n### AMBIGUITY ${name} (baseline ${base.length} rows)`);
  for (const d of c.distractors) {
    for (let i = 0; i < c.correct.length; i++) {
      if (d === c.correct[i]) continue;
      const v = [...c.correct];
      v[i] = d;
      const r = rows(c.t(v));
      if (!(r.length === 1 && "ERROR" in r[0]) && key(r) === key(base)) {
        console.log(`  AMBIGUOUS: "${d}" in slot ${i + 1} reproduces the correct fill`);
      }
    }
  }
  console.log("  (no output above = every distractor errors or differs)");
}

// ---------- extra figures for prose ----------
show("card/wire averages", `SELECT method, COUNT(*), ROUND(SUM(amount_cents)/100.0/ COUNT(*), 2) FROM payments GROUP BY method;`);
show("expense lines stats", `SELECT category, COUNT(*), ROUND(SUM(amount_cents)/100.0,2), ROUND(MAX(amount_cents)/100.0,2) FROM expenses GROUP BY category;`);
show("share of book above 2000", `SELECT ROUND(100.0 * SUM(CASE WHEN s >= 2000 THEN s ELSE 0 END) / SUM(s), 1) FROM (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id);`);
db.close();
