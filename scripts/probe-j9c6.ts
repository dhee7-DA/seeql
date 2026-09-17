// j9-c probe round 6 — pre-flight the FULL audit matrix for the planned
// cs-317..cs-325 before authoring cases-j5c.ts:
//   1. correct fill executes + number figures present,
//   2. EVERY distractor in EVERY slot is consequential (mirrors case-audit.ts),
//   3. filled SQL + titles distinct vs ALL prior M2 fills (j1a..j5b, exemplars-m2).
// Run from PROJECT ROOT: bun scripts/probe-j9c6.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
import type { CaseStudy } from "../src/lib/curriculum/cases/types";

const COPY = "scripts/.tmp-j9c.db";
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
  "cases-j4a", "cases-j4b", "cases-j4c", "cases-j5a", "cases-j5b",
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

// ---- planned cs-317..325 ----
interface Plan {
  id: string; title: string; template: string;
  slots: { answer: string; kind: "number" | "keyword"; noVerify?: boolean }[];
  distractors: string[];
}

const plans: Plan[] = [
  {
    id: "cs-317", title: "The regional rating duel",
    template: `SELECT s1.name AS house_a, s1.rating AS rating_a, s2.name AS house_b, s2.rating AS rating_b,
       ROUND({1}, 1) AS edge
FROM suppliers s1 JOIN suppliers s2 ON {2} AND {3}
ORDER BY edge DESC, s1.id;`,
    slots: [
      { answer: "s2.rating - s1.rating", kind: "keyword" },
      { answer: "s1.region = s2.region", kind: "keyword" },
      { answer: "s1.id < s2.id", kind: "keyword" },
    ],
    distractors: ["s1.rating - s2.rating", "s2.rating + s1.rating", "s1.region = s1.rating",
      "s1.id <= s2.id", "s1.id <> s2.id", "s1.id = s2.id"],
  },
  {
    id: "cs-318", title: "Three seats up the line",
    template: `SELECT e.name AS report, e.role AS report_role, m.name AS manager, g.name AS grand_manager
FROM employees e
JOIN employees m ON {1}
JOIN employees g ON {2}
WHERE {3}
ORDER BY e.id;`,
    slots: [
      { answer: "m.id = e.manager_id", kind: "keyword" },
      { answer: "g.id = m.manager_id", kind: "keyword" },
      { answer: "e.role = 'rep'", kind: "keyword" },
    ],
    distractors: ["m.id = e.id", "m.manager_id = e.id", "g.id = e.manager_id",
      "g.id = m.id", "m.role = 'rep'", "e.role <> 'rep'"],
  },
  {
    id: "cs-319", title: "Teammates under one lead",
    template: `SELECT e1.name AS teammate_a, e1.region AS region_a, e2.name AS teammate_b, e2.region AS region_b,
       m.name AS team_lead
FROM employees e1
JOIN employees e2 ON {1} AND {2}
JOIN employees m ON {3}
ORDER BY e1.id;`,
    slots: [
      { answer: "e1.manager_id = e2.manager_id", kind: "keyword" },
      { answer: "e1.id < e2.id", kind: "keyword" },
      { answer: "m.id = e1.manager_id", kind: "keyword" },
    ],
    distractors: ["e1.id = e2.id", "e1.manager_id = e2.id", "e1.id <= e2.id",
      "e1.id <> e2.id", "m.id = e1.id", "m.manager_id = e1.id"],
  },
  {
    id: "cs-320", title: "The unbeaten tickets",
    template: `SELECT c.name AS account, o1.id AS ticket, ROUND(o1.total, 2) AS ticket_total
FROM orders o1
JOIN customers c ON c.id = o1.customer_id
LEFT JOIN orders o2 ON {1} AND {2}
WHERE {3}
ORDER BY o1.total DESC;`,
    slots: [
      { answer: "o2.customer_id = o1.customer_id", kind: "keyword" },
      { answer: "o2.total > o1.total", kind: "keyword" },
      { answer: "o2.id IS NULL", kind: "keyword" },
    ],
    distractors: ["o2.customer_id = o1.id", "o2.total >= o1.total", "o2.total < o1.total",
      "o2.id > o1.id", "o2.id IS NOT NULL", "o1.id IS NULL"],
  },
  {
    id: "cs-321", title: "The pairing leaderboard",
    template: `SELECT c1.name AS account_a, c2.name AS account_b, c1.region AS region, COUNT(*) AS pairings
FROM customers c1
JOIN customers c2 ON {1} AND {2}
JOIN orders o1 ON {3}
JOIN orders o2 ON o2.customer_id = c2.id
GROUP BY c1.id, c2.id
ORDER BY pairings DESC
LIMIT 4;`,
    slots: [
      { answer: "c1.region = c2.region", kind: "keyword" },
      { answer: "c1.id < c2.id", kind: "keyword" },
      { answer: "o1.customer_id = c1.id", kind: "keyword" },
    ],
    distractors: ["c1.region <> c2.region", "c1.id = c2.id", "c1.id <> c2.id",
      "c1.id > c2.id", "o1.id = c1.id", "o1.customer_id = c2.id"],
  },
  {
    id: "cs-322", title: "The stock deficit ladder",
    template: `SELECT p1.name AS item_a, p2.name AS item_b, p1.category AS shelf, {1} AS units_behind
FROM products p1 JOIN products p2 ON {2} AND {3}
ORDER BY units_behind DESC;`,
    slots: [
      { answer: "p2.stock - p1.stock", kind: "keyword" },
      { answer: "p1.category = p2.category", kind: "keyword" },
      { answer: "p1.id < p2.id", kind: "keyword" },
    ],
    distractors: ["p1.stock - p2.stock", "p2.stock + p1.stock", "ABS(p2.stock - p1.stock)",
      "p1.supplier_id = p2.supplier_id", "p1.id <= p2.id", "p1.id <> p2.id"],
  },
  {
    id: "cs-323", title: "The two-sided book",
    template: `SELECT c.name AS account, o1.id AS settled_ticket, ROUND(o1.total, 2) AS settled,
       o2.id AS open_ticket, ROUND(o2.total, 2) AS open_amt,
       ROUND({1}, 2) AS book
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND {2}
JOIN customers c ON c.id = o1.customer_id
WHERE {3} AND ROUND(o1.total + o2.total, 2) >= {4}
ORDER BY book DESC;`,
    slots: [
      { answer: "o1.total + o2.total", kind: "keyword" },
      { answer: "o1.id < o2.id", kind: "keyword" },
      { answer: "o1.status = 'delivered' AND o2.status = 'pending'", kind: "keyword" },
      { answer: "1000", kind: "number", noVerify: true },
    ],
    distractors: ["o2.total - o1.total", "o1.total", "o2.id < o1.id", "o1.id <> o2.id",
      "o1.status = 'shipped' AND o2.status = 'pending'", "900"],
  },
  {
    id: "cs-324", title: "Buyers who switch rails",
    template: `SELECT c.name AS buyer, COUNT(*) AS mixed_pairs
FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id
JOIN payments p2 ON {1}
JOIN orders o2 ON o2.id = p2.order_id
JOIN customers c ON c.id = o1.customer_id
WHERE {2} AND {3}
GROUP BY c.id
ORDER BY mixed_pairs DESC, c.name;`,
    slots: [
      { answer: "p1.id < p2.id", kind: "keyword" },
      { answer: "o1.customer_id = o2.customer_id", kind: "keyword" },
      { answer: "p1.method <> p2.method", kind: "keyword" },
    ],
    distractors: ["p1.id <> p2.id", "p1.order_id = p2.order_id", "o1.id = o2.id",
      "o1.id = o2.customer_id", "p1.method = p2.method", "p1.amount <> p2.amount"],
  },
  {
    id: "cs-325", title: "Twins across the shelves",
    template: `SELECT p1.name AS twin_a, p1.category AS shelf_a, p2.name AS twin_b, p2.category AS shelf_b,
       ROUND({1}, 2) AS gap
FROM products p1 JOIN products p2 ON p1.id < p2.id AND {2}
WHERE ABS(p2.price - p1.price) <= {3}
ORDER BY gap;`,
    slots: [
      { answer: "ABS(p2.price - p1.price)", kind: "keyword" },
      { answer: "p1.category <> p2.category", kind: "keyword" },
      { answer: "5", kind: "number", noVerify: true },
    ],
    distractors: ["p1.category = p2.category", "p1.supplier_id = p2.supplier_id", "p1.name",
      "p2.name", "p1.category", "p2.category"],
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
console.log(`\n==== probe-6 summary: ${problems === 0 ? "ALL CLEAR" : problems + " problem(s)"} ====`);

db.close();
rmSync(COPY, { force: true });
console.log("(probe copy deleted)");
