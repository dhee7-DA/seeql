import { Database } from "bun:sqlite";
const db = new Database("/home/z/my-project/db/custom.db", { readonly: true });

function fill(template: string, values: Record<number, string>): string {
  return template.replace(/\{(\d+)\}/g, (_, n) => values[Number(n)] ?? `{${n}}`);
}
function normalizeCell(c: unknown): string {
  if (c === null) return "NULL";
  if (typeof c === "number") return Number.isInteger(c) ? String(c) : String(c);
  if (c instanceof Uint8Array) return "<blob>";
  return String(c);
}
function canonRows(rows: unknown[][]): string {
  return JSON.stringify(rows.map((r) => r.map(normalizeCell)));
}
function runSql(sql: string): { ok: true; rows: unknown[][] } | { ok: false; error: string } {
  try {
    const res = db.query(sql).all() as Record<string, unknown>[];
    if (res.length === 0) return { ok: true, rows: [] };
    const cols = Object.keys(res[0]);
    return { ok: true, rows: res.map((r) => cols.map((c) => r[c])) };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : String(e) }; }
}
function valueInResults(answer: string, rows: unknown[][]): boolean {
  const a = answer.trim(); const aNum = Number(a);
  for (const row of rows) for (const cell of row) {
    const s = normalizeCell(cell);
    if (s === a) return true;
    if (!Number.isNaN(aNum) && a !== "" && Number(s) === aNum) return true;
  }
  return false;
}

interface CaseDef { id: string; template: string; slots: { answer: string; kind: string; noVerify?: boolean }[]; distractors: string[]; }

const CASES: CaseDef[] = [
  {
    id: "cs-temu-3 (t4/funnel/easy) flash-event months",
    template: `SELECT STRFTIME({1}, created_at) AS month,
       COUNT(*) AS checkouts,
       ROUND(SUM(total), 2) AS revenue
FROM orders
GROUP BY month
HAVING COUNT(*) {2} {3}
ORDER BY revenue {4};`,
    slots: [{ answer: "'%Y-%m'", kind: "keyword" }, { answer: ">=", kind: "keyword" }, { answer: "9", kind: "number" }, { answer: "DESC", kind: "keyword" }],
    distractors: ["'%m'", ">", "8", "ASC"],
  },
  {
    id: "cs-temu-4 (j4/catalog/medium) thin-conversion board",
    template: `SELECT c.name AS account,
       c.region,
       COUNT(o.id) AS landed_carts,
       COALESCE(ROUND(SUM(o.total), 2), 0) AS landed_value
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = {1}
GROUP BY c.name
HAVING COUNT(o.id) <= {2}
ORDER BY landed_value {3};`,
    slots: [{ answer: "'delivered'", kind: "keyword" }, { answer: "1", kind: "number" }, { answer: "ASC", kind: "keyword" }],
    distractors: ["'shipped'", "'pending'", "0", "DESC"],
  },
  {
    id: "cs-temu-5 (x2/growth/medium) category one-pass census",
    template: `SELECT p.category,
       COUNT(DISTINCT o.id) FILTER (WHERE o.status = {1}) AS landed_carts,
       COUNT(*) AS lines,
       SUM(oi.quantity) AS units,
       ROUND(SUM(oi.unit_price * oi.quantity), 2) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
GROUP BY p.category
ORDER BY revenue {2}
LIMIT {3};`,
    slots: [{ answer: "'delivered'", kind: "keyword" }, { answer: "DESC", kind: "keyword" }, { answer: "3", kind: "number", noVerify: true }],
    distractors: ["'shipped'", "'pending'", "ASC", "2"],
  },
  {
    id: "cs-temu-6 (q5/pricing/hard) rich-basket months",
    template: `SELECT m.month,
       m.checkouts,
       ROUND(m.revenue / m.checkouts, {3}) AS avg_basket
FROM (
  SELECT STRFTIME('%Y-%m', created_at) AS month,
         COUNT(*) AS checkouts,
         SUM(total) AS revenue
  FROM orders
  GROUP BY month
) AS m
WHERE m.revenue / m.checkouts {1} (SELECT {2}(total) FROM orders)
ORDER BY avg_basket DESC;`,
    slots: [{ answer: ">", kind: "keyword" }, { answer: "AVG", kind: "keyword" }, { answer: "2", kind: "number", noVerify: true }],
    distractors: ["<", "MAX", "COUNT", "0"],
  },
  {
    id: "cs-gett-3 (j5/month-close/medium) unsettled-bill worklist",
    template: `SELECT c.region,
       COUNT(*) AS unpaid_bills,
       ROUND(SUM(i.amount_cents) / {1}, 2) AS exposure
FROM invoices i
JOIN customers c ON c.id = i.customer_id
{2} payments p ON p.invoice_id = i.id
WHERE {3}
GROUP BY c.region
ORDER BY exposure {4};`,
    slots: [{ answer: "100.0", kind: "number", noVerify: true }, { answer: "LEFT JOIN", kind: "keyword" }, { answer: "p.id IS NULL", kind: "keyword" }, { answer: "DESC", kind: "keyword" }],
    distractors: ["INNER JOIN", "p.id IS NOT NULL", "1000", "ASC"],
  },
  {
    id: "cs-gett-4 (t3/month-close/easy) settlement clock",
    template: `SELECT COUNT(*) AS settled_bills,
       ROUND(AVG(days_to_pay), {3}) AS avg_days,
       MIN(days_to_pay) AS fastest,
       MAX(days_to_pay) AS slowest
FROM (
  SELECT i.id,
         JULIANDAY({1}(p.paid_on)) - JULIANDAY(i.issued_on) AS days_to_pay
  FROM invoices i
  JOIN payments p ON p.invoice_id = i.id
  WHERE i.status = {2}
  GROUP BY i.id
);`,
    slots: [{ answer: "MIN", kind: "keyword" }, { answer: "'paid'", kind: "keyword" }, { answer: "1", kind: "number", noVerify: true }],
    distractors: ["MAX", "'void'", "0", "AVG"],
  },
  {
    id: "cs-gett-5 (x2/supplier/easy) settlement rails census",
    template: `SELECT COUNT(*) AS legs,
       COUNT(*) FILTER (WHERE method = {1}) AS card_legs,
       ROUND(SUM(amount_cents) FILTER (WHERE method = 'card') / {2}, 2) AS card_total,
       ROUND(SUM(amount_cents) / 100.0, 2) AS total_money
FROM payments;`,
    slots: [{ answer: "'card'", kind: "keyword" }, { answer: "100.0", kind: "number", noVerify: true }],
    distractors: ["'wire'", "1000", "amount_cents", "invoice_id"],
  },
  {
    id: "cs-gett-6 (t5/growth/hard) corporate-account leaderboard",
    template: `WITH folded AS (
  SELECT c.name AS account,
         COUNT(*) AS rides,
         ROUND(SUM(o.total), 2) AS billed
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY c.name
)
SELECT {1}() OVER (ORDER BY rides {2}) AS rung,
       account,
       rides,
       billed
FROM folded
ORDER BY rides DESC, billed DESC
LIMIT {3};`,
    slots: [{ answer: "RANK", kind: "keyword" }, { answer: "DESC", kind: "keyword" }, { answer: "10", kind: "number", noVerify: true }],
    distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "9"],
  },
];

let allGood = true;
for (const c of CASES) {
  console.log("==== " + c.id);
  const values: Record<number, string> = {};
  c.slots.forEach((s, i) => (values[i + 1] = s.answer));
  const filled = fill(c.template, values);
  const res = runSql(filled);
  if (!res.ok) { console.log("  CORRECT FILL ERRORS: " + res.error); allGood = false; continue; }
  console.log("  correct rows (" + res.rows.length + "): " + canonRows(res.rows).slice(0, 340));
  c.slots.forEach((s, i) => {
    if (s.kind === "number" && !s.noVerify) {
      const ok = valueInResults(s.answer, res.rows);
      console.log(`  number slot ${i + 1} (${s.answer}) in cells: ${ok}`);
      if (!ok) allGood = false;
    }
  });
  for (const d of c.distractors) {
    for (let i = 0; i < c.slots.length; i++) {
      const vals: Record<number, string> = {};
      for (let j = 0; j < c.slots.length; j++) vals[j + 1] = c.slots[j].answer;
      vals[i + 1] = d;
      const probe = fill(c.template, vals);
      const pres = runSql(probe);
      let verdict: string;
      if (!pres.ok) verdict = "err(different)";
      else if (canonRows(pres.rows) === canonRows(res.rows)) verdict = "*** SAME — AMBIGUOUS ***";
      else verdict = "different";
      if (verdict.includes("SAME")) allGood = false;
      console.log(`    d="${d}" slot ${i + 1}: ${verdict}`);
    }
  }
}
console.log(allGood ? "\nALL CONSEQUENCE CHECKS CLEAN" : "\nPROBLEMS FOUND");
db.close();
