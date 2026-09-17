// j9-b probe round 4 — pre-flight the FULL audit matrix for the planned
// cs-309..cs-316 before authoring cases-j5b.ts:
//   1. correct fill executes + number figures present,
//   2. EVERY distractor in EVERY slot is consequential (mirrors case-audit.ts),
//   3. filled SQL + titles distinct vs ALL prior M2 fills (j1a..j4c, j5a, exemplars-m2).
// Run from PROJECT ROOT: bun scripts/probe-j9b4.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
import type { CaseStudy } from "../src/lib/curriculum/cases/types";

const COPY = "scripts/.tmp-j9b.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const fill = (t: string, v: Record<number, string>) =>
  t.replace(/\{(\d+)\}/g, (_, n) => v[Number(n)] ?? `{${n}}`);
const cell = (c: unknown) => (c === null ? "NULL" : String(c));
const canon = (rows: Record<string, unknown>[]) =>
  JSON.stringify(rows.map((r) => Object.keys(r).map((k) => cell(r[k]))));
const run = (sql: string) => {
  try {
    return { ok: true as const, rows: db.query(sql).all() as Record<string, unknown>[] };
  } catch (e) {
    return { ok: false as const, err: e instanceof Error ? e.message : String(e) };
  }
};

// ---- prior M2 cases for dedupe ----
const prior: { id: string; title: string; sql: string }[] = [];
for (const f of [
  "exemplars-m2", "cases-j1a", "cases-j1b", "cases-j1c",
  "cases-j2a", "cases-j2b", "cases-j2c",
  "cases-j3a", "cases-j3b", "cases-j3c",
  "cases-j4a", "cases-j4b", "cases-j4c", "cases-j5a",
]) {
  const mod = await import(`../src/lib/curriculum/cases/m2/${f}`);
  const arr = Object.values(mod).find((v) => Array.isArray(v)) as CaseStudy[];
  for (const c of arr)
    prior.push({
      id: c.id,
      title: c.title,
      sql: norm(fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])))),
    });
  console.log(`prior ${f}: ${arr.length} cases`);
}
console.log(`prior total: ${prior.length} fills\n`);

// ---- planned cs-309..316 ----
interface Plan {
  id: string; title: string; template: string;
  slots: { answer: string; kind: "number" | "keyword"; noVerify?: boolean }[];
  distractors: string[];
}

const plans: Plan[] = [
  {
    id: "cs-309", title: "Two charges, one ticket",
    template: `SELECT o.id AS ticket, c.name AS buyer, ROUND({1} + p2.amount, 2) AS pair_paid, o.total
FROM payments p1 JOIN payments p2 ON {2} = p2.order_id AND {3}
JOIN orders o ON o.id = p1.order_id
JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;`,
    slots: [
      { answer: "p1.amount", kind: "keyword" },
      { answer: "p1.order_id", kind: "keyword" },
      { answer: "p1.id < p2.id", kind: "keyword" },
    ],
    distractors: ["p2.amount", "p2.order_id", "p1.id", "p1.id <= p2.id", "p1.id <> p2.id"],
  },
  {
    id: "cs-310", title: "The account marketing touched twice",
    template: `SELECT c.name AS account, a1.channel AS first_touch, a1.spend AS first_spend,
       a2.channel AS second_touch, a2.spend AS second_spend, ROUND({1}, 2) AS double_spend
FROM acquisitions a1
JOIN acquisitions a2 ON a1.customer_id = a2.customer_id AND a1.id {2} a2.id
JOIN customers c ON c.id = a1.customer_id
WHERE {3}
ORDER BY c.name;`,
    slots: [
      { answer: "a1.spend + a2.spend", kind: "keyword" },
      { answer: "<", kind: "keyword" },
      { answer: "a1.channel <> a2.channel", kind: "keyword" },
    ],
    distractors: ["<>", "=", ">", "a1.channel = a2.channel", "a1.spend = a2.spend", "a1.id = a2.id"],
  },
  {
    id: "cs-311", title: "The pair-count board",
    template: `SELECT c.name AS account, COUNT(*) AS repeat_pairs, {1} AS first_order, MAX(o2.id) AS latest_order
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND {2}
JOIN customers c ON c.id = o1.customer_id
GROUP BY c.id HAVING COUNT(*) >= {3} ORDER BY repeat_pairs DESC;`,
    slots: [
      { answer: "MIN(o1.id)", kind: "keyword" },
      { answer: "o1.id < o2.id", kind: "keyword" },
      { answer: "100", kind: "number", noVerify: true },
    ],
    distractors: ["MAX(o1.id)", "MIN(o2.id)", "COUNT(o2.id)", "SUM(o1.id)", "o1.id <= o2.id", "o1.id <> o2.id"],
  },
  {
    id: "cs-312", title: "The one-and-done files",
    template: `SELECT c.name AS account, {1} AS only_ticket, ROUND(o1.total, 2) AS ticket_total
FROM orders o1
{2} JOIN orders o2 ON o2.customer_id = o1.customer_id AND {3}
JOIN customers c ON c.id = o1.customer_id
WHERE {4} IS NULL ORDER BY o1.id;`,
    slots: [
      { answer: "o1.id", kind: "keyword" },
      { answer: "LEFT", kind: "keyword" },
      { answer: "o2.id <> o1.id", kind: "keyword" },
      { answer: "o2.id", kind: "keyword" },
    ],
    distractors: ["INNER", "CROSS", "RIGHT", "c.id", "o1.total", "o1.customer_id"],
  },
  {
    id: "cs-313", title: "The tickets the desk paid twice",
    template: `SELECT o.id AS ticket, c.name AS buyer, {1} AS claim_one, r2.amount AS claim_two,
       ROUND({2}, 2) AS pair_paid, o.total
FROM refunds r1 JOIN refunds r2 ON {3} = r2.order_id AND r1.id < r2.id
JOIN orders o ON o.id = r1.order_id
JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;`,
    slots: [
      { answer: "r1.amount", kind: "keyword" },
      { answer: "r1.amount + r2.amount", kind: "keyword" },
      { answer: "r1.order_id", kind: "keyword" },
    ],
    distractors: ["r2.order_id", "r1.id", "r2.amount", "o.total", "r1.id + r2.id", "r2.amount - r1.amount"],
  },
  {
    id: "cs-314", title: "Houses that ship two of our SKUs",
    template: `SELECT s.name AS house, p1.name AS first_item, {1} AS first_price,
       p2.name AS second_item, p2.price AS second_price
FROM products p1 JOIN products p2 ON {2} = p2.supplier_id AND p1.id < p2.id
JOIN suppliers s ON s.id = p1.supplier_id
ORDER BY {3} DESC;`,
    slots: [
      { answer: "p1.price", kind: "keyword" },
      { answer: "p1.supplier_id", kind: "keyword" },
      { answer: "p2.price - p1.price", kind: "keyword" },
    ],
    distractors: ["p2.price", "p1.id", "p2.id", "p1.category", "p1.price - p2.price", "p2.id < p1.id"],
  },
  {
    id: "cs-315", title: "Every rep and the boss they answer to",
    template: `SELECT {1} AS manager, m.role AS manager_role, e.name AS report, e.role AS report_role
FROM employees e JOIN employees m ON {2} = m.id
WHERE e.role = {3} ORDER BY m.id, e.id;`,
    slots: [
      { answer: "m.name", kind: "keyword" },
      { answer: "e.manager_id", kind: "keyword" },
      { answer: "'rep'", kind: "keyword" },
    ],
    distractors: ["e.id", "m.id", "m.manager_id", "'lead'", "'manager'", "e.name"],
  },
  {
    id: "cs-316", title: "Paired exposure on open tickets",
    template: `SELECT c.name AS account, o1.id AS older_ticket, o2.id AS newer_ticket,
       ROUND({1}, 2) AS open_exposure
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND {2}
JOIN customers c ON c.id = o1.customer_id
WHERE o1.status = {3} AND o2.status = o1.status
ORDER BY open_exposure DESC;`,
    slots: [
      { answer: "o1.total + o2.total", kind: "keyword" },
      { answer: "o1.id < o2.id", kind: "keyword" },
      { answer: "'pending'", kind: "keyword" },
    ],
    distractors: ["o1.id <= o2.id", "o1.id <> o2.id", "o2.id < o1.id", "'shipped'", "'delivered'", "COUNT(*)"],
  },
];

// ---- run the audit-equivalent matrix ----
let problems = 0;
for (const p of plans) {
  console.log(`--- ${p.id} ${p.title}`);
  const answers: Record<number, string> = {};
  p.slots.forEach((s, i) => (answers[i + 1] = s.answer));
  const correct = fill(p.template, answers);
  const res = run(correct);
  if (!res.ok) {
    console.log(`  CORRECT FILL FAILS: ${res.err}`);
    problems++;
    continue;
  }
  console.log(`  correct -> ${res.rows.length} rows`);
  if (res.rows.length > 0 && res.rows.length <= 8) console.log(`  ${canon(res.rows)}`);
  // number figures in cells
  p.slots.forEach((s, i) => {
    if (s.kind === "number" && !s.noVerify) {
      const found = res.rows.some((r) =>
        Object.values(r).some((c) => cell(c) === s.answer || Number(c) === Number(s.answer)),
      );
      if (!found) { console.log(`  FIGURE MISSING slot ${i + 1}: ${s.answer}`); problems++; }
    }
  });
  // dedupe vs prior + in-file
  const nsql = norm(correct);
  const dupSql = prior.find((x) => x.sql === nsql);
  if (dupSql) { console.log(`  SQL DUP vs ${dupSql.id}`); problems++; }
  const dupTitle = prior.find((x) => x.title === p.title);
  if (dupTitle) { console.log(`  TITLE DUP vs ${dupTitle.id}`); problems++; }
  // distractor x slot matrix
  for (const d of p.distractors) {
    for (let i = 0; i < p.slots.length; i++) {
      if (d === p.slots[i].answer) continue;
      const v = { ...answers, [i + 1]: d };
      const pr = run(fill(p.template, v));
      if (!pr.ok) continue; // consequential (error) — good
      if (canon(pr.rows) === canon(res.rows)) {
        console.log(`  AMBIG: "${d}" in slot ${i + 1} reproduces correct result`);
        problems++;
      }
    }
  }
}
console.log(`\n==== probe-4 summary: ${problems === 0 ? "ALL CLEAR" : problems + " problem(s)"} ====`);

db.close();
rmSync(COPY, { force: true });
console.log("(probe copy deleted)");
