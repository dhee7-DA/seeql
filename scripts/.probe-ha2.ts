/// Probe pass 2 for cs-270..279 — revised drafts only.
import { Database } from "bun:sqlite";
const db = new Database("scripts/.probe-ha2.db", { readonly: true });
type Slot = { answer: string; kind: "number" | "keyword"; noVerify?: boolean };
type Draft = { id: string; template: string; slots: Slot[]; distractors: string[] };
const drafts: Draft[] = [
  {
    id: "cs-270",
    template: `SELECT name, price
FROM products
WHERE category {1} ('Audio', 'Accessories')
  AND price BETWEEN {2} AND {3}
  AND {4} name {5} '%Mini%'
ORDER BY price DESC;`,
    slots: [
      { answer: "IN", kind: "keyword" },
      { answer: "40", kind: "number", noVerify: true },
      { answer: "200", kind: "number", noVerify: true },
      { answer: "NOT", kind: "keyword" },
      { answer: "LIKE", kind: "keyword" },
    ],
    distractors: ["OR", ">", "IS", "120", "60"],
  },
  {
    id: "cs-271",
    template: `SELECT customer_id, {1}(*) AS orders, ROUND({2}(total), 2) AS limbo_value
FROM orders
{3} BY customer_id
{4} COUNT(shipped_at) {5} COUNT(*)
ORDER BY limbo_value {6};`,
    slots: [
      { answer: "COUNT", kind: "keyword" },
      { answer: "SUM", kind: "keyword" },
      { answer: "GROUP", kind: "keyword" },
      { answer: "HAVING", kind: "keyword" },
      { answer: "<", kind: "keyword" },
      { answer: "DESC", kind: "keyword" },
    ],
    distractors: ["WHERE", "AVG", "ASC", "ORDER", ">", "="],
  },
  {
    id: "cs-272",
    template: `SELECT id, total
FROM orders
{1} status = {2}
ORDER BY total {3}, id
LIMIT 3 {4} {5};`,
    slots: [
      { answer: "WHERE", kind: "keyword" },
      { answer: "'cancelled'", kind: "keyword" },
      { answer: "DESC", kind: "keyword" },
      { answer: "OFFSET", kind: "keyword" },
      { answer: "3", kind: "number", noVerify: true },
    ],
    distractors: ["HAVING", "'shipped'", "ASC", "LIMIT", "2", "5"],
  },
  {
    id: "cs-275",
    template: `SELECT strftime('%Y-%m', {1}) AS month, {2}(*) AS signups
FROM customers
GROUP BY {3}
{4} COUNT(*) >= {5}
ORDER BY month;`,
    slots: [
      { answer: "created_at", kind: "keyword" },
      { answer: "COUNT", kind: "keyword" },
      { answer: "month", kind: "keyword" },
      { answer: "HAVING", kind: "keyword" },
      { answer: "2", kind: "number" },
    ],
    distractors: ["shipped_at", "SUM", "WHERE", "3", "id"],
  },
  {
    id: "cs-276",
    template: `SELECT supplier_id, {1}(*) AS skus, {2}(stock) AS shelf_floor
FROM products
GROUP BY supplier_id
{3} MIN(stock) >= {4}
ORDER BY shelf_floor {5};`,
    slots: [
      { answer: "COUNT", kind: "keyword" },
      { answer: "MIN", kind: "keyword" },
      { answer: "HAVING", kind: "keyword" },
      { answer: "60", kind: "number" },
      { answer: "DESC", kind: "keyword" },
    ],
    distractors: ["MAX", "AVG", "WHERE", "ASC", "40"],
  },
  {
    id: "cs-277",
    template: `SELECT category, ROUND({1}(amount_cents) / 100.0, 2) AS spend
FROM expenses
WHERE spent_on {2} {3}
GROUP BY category
{4} SUM(amount_cents) >= {5}
ORDER BY spend {6}
LIMIT {7};`,
    slots: [
      { answer: "SUM", kind: "keyword" },
      { answer: "LIKE", kind: "keyword" },
      { answer: "'2025-%'", kind: "keyword" },
      { answer: "HAVING", kind: "keyword" },
      { answer: "30000", kind: "number", noVerify: true },
      { answer: "DESC", kind: "keyword" },
      { answer: "2", kind: "number", noVerify: true },
    ],
    distractors: ["COUNT", "=", "'2024-%'", "WHERE", "ASC", "5"],
  },
  {
    id: "cs-278",
    template: `SELECT strftime('%Y-%m', created_at) AS month,
       {1}(*) AS placed,
       COUNT(shipped_at) AS shipped
FROM orders
{2} BY {3}
ORDER BY {4} {5}, month
LIMIT 2;`,
    slots: [
      { answer: "COUNT", kind: "keyword" },
      { answer: "GROUP", kind: "keyword" },
      { answer: "month", kind: "keyword" },
      { answer: "shipped", kind: "keyword" },
      { answer: "DESC", kind: "keyword" },
    ],
    distractors: ["SUM", "WHERE", "created_at", "placed", "ASC"],
  },
  {
    id: "cs-279",
    template: `SELECT customer_id, COUNT(*) AS flags, ROUND({1}(total), 2) AS exposure
FROM orders
{2} total > {3}
GROUP BY customer_id
{4} COUNT(*) >= {5}
ORDER BY exposure DESC;`,
    slots: [
      { answer: "SUM", kind: "keyword" },
      { answer: "WHERE", kind: "keyword" },
      { answer: "400", kind: "number", noVerify: true },
      { answer: "HAVING", kind: "keyword" },
      { answer: "2", kind: "number" },
    ],
    distractors: ["COUNT", "AVG", "600", "ORDER", "3"],
  },
];
const norm = (c: unknown) => (c === null ? "NULL" : String(c));
const canon = (rows: unknown[][]) => JSON.stringify(rows.map((r) => r.map(norm)));
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
const fill = (t: string, v: Record<number, string>) => t.replace(/\{(\d+)\}/g, (_, n) => v[Number(n)] ?? `{${n}}`);
for (const d of drafts) {
  const answers = d.slots.map((s) => s.answer);
  if (new Set(answers).size !== answers.length) console.log(`${d.id} !! DUPLICATE SLOT ANSWERS`);
  if (d.slots.some((s) => d.distractors.includes(s.answer))) console.log(`${d.id} !! distractor equals a slot answer`);
  const used = new Set([...d.template.matchAll(/\{(\d+)\}/g)].map((m) => Number(m[1])));
  if (used.size !== d.slots.length || [...used].some((k, i) => !used.has(i + 1))) console.log(`${d.id} !! marker/slot mismatch: ${[...used].join(",")} vs ${d.slots.length} slots`);
  const correct = fill(d.template, Object.fromEntries(d.slots.map((s, i) => [i + 1, s.answer])));
  const res = run(correct);
  if (!res.ok) {
    console.log(`${d.id} !! CORRECT FILL FAILS: ${res.error}`);
    continue;
  }
  console.log(`\n===== ${d.id} (${res.rows.length} rows):\n${correct}\n${JSON.stringify(res.rows)}`);
  d.slots.forEach((s, i) => {
    if (s.kind === "number" && !s.noVerify) {
      const aNum = Number(s.answer.trim());
      const hit = res.rows.some((row) => row.some((cell) => Number(norm(cell)) === aNum));
      if (!hit) console.log(`${d.id} !! number slot ${i + 1} "${s.answer}" NOT in result cells`);
    }
  });
  let amb = 0;
  for (const dist of d.distractors) {
    for (let i = 0; i < d.slots.length; i++) {
      if (dist === d.slots[i].answer) continue;
      const v: Record<number, string> = {};
      d.slots.forEach((s, j) => (v[j + 1] = s.answer));
      v[i + 1] = dist;
      const p = run(fill(d.template, v));
      if (!p.ok) continue;
      if (canon(p.rows) === canon(res.rows)) { console.log(`${d.id} !! AMBIGUOUS: "${dist}" in slot ${i + 1} (${d.slots[i].answer})`); amb++; }
    }
  }
  console.log(`${d.id} matrix done, ambiguous=${amb}`);
}
// extra figure checks for walkthroughs
console.log("\ncancelled asc rows 4-6:", JSON.stringify(db.query("SELECT id,total FROM orders WHERE status='cancelled' ORDER BY total ASC, id LIMIT 3 OFFSET 3").all()));
console.log("cust5+1+3 large totals>400:", JSON.stringify(db.query("SELECT customer_id, COUNT(*) n, ROUND(SUM(total),2) v FROM orders WHERE total>400 AND customer_id IN (1,5) GROUP BY customer_id").all()));
console.log("fraud600:", JSON.stringify(db.query("SELECT customer_id, COUNT(*) flags FROM orders WHERE total>600 GROUP BY customer_id HAVING COUNT(*)>=2").all()));
db.close();
