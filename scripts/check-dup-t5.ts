/// <reference types="bun-types" />
/** Wave-5 M5 dup check: titles + normalized filled SQL across the whole deck. */
import { CASES } from "../src/lib/curriculum/cases";
import type { CaseStudy } from "../src/lib/curriculum/cases/types";

function fill(template: string, values: Record<number, string>): string {
  return template.replace(/\{(\d+)\}/g, (_, n) => values[Number(n)] ?? `{${n}}`);
}

function normSql(sql: string): string {
  return sql.replace(/\s+/g, " ").replace(/\s*;\s*$/, "").trim().toLowerCase();
}

const byTitle = new Map<string, string[]>();
const bySql = new Map<string, string[]>();
let titleDups = 0;
let sqlDups = 0;

for (const c of CASES as CaseStudy[]) {
  const t = c.title.trim().toLowerCase();
  byTitle.set(t, [...(byTitle.get(t) ?? []), c.id]);
  const values: Record<number, string> = {};
  c.slots.forEach((s, i) => (values[i + 1] = s.answer));
  const sql = normSql(fill(c.template, values));
  bySql.set(sql, [...(bySql.get(sql) ?? []), c.id]);
}

for (const [t, ids] of byTitle) if (ids.length > 1) { titleDups++; console.log(`DUP TITLE "${t}": ${ids.join(", ")}`); }
for (const [s, ids] of bySql) if (ids.length > 1) { sqlDups++; console.log(`DUP SQL: ${ids.join(", ")}\n  ${s.slice(0, 120)}`); }

// Wave-5 M5 range checks: ids sequential cs-1201..1250, topics per plan.
const w1 = (CASES as CaseStudy[]).filter((c) => {
  const n = Number(c.id.slice(3));
  return n >= 1401 && n <= 1450;
});
const nums = w1.map((c) => Number(c.id.slice(3))).sort((a, b) => a - b);
const sequential = nums.every((n, i) => n === 1401 + i);
console.log(`wave-5 M5 range: ${w1.length} cases, sequential=${sequential}`);
const topics: Record<string, number> = {};
for (const c of w1) topics[c.topic] = (topics[c.topic] ?? 0) + 1;
console.log("wave-5 M5 topics:", JSON.stringify(topics));
const tiers: Record<string, number> = {};
for (const c of w1) tiers[c.tier] = (tiers[c.tier] ?? 0) + 1;
console.log("wave-5 M5 tiers:", JSON.stringify(tiers));

console.log(`\ntotal: ${CASES.length} cases, ${titleDups} title dups, ${sqlDups} SQL dups`);
if (titleDups || sqlDups || !sequential || w1.length !== 50) process.exit(1);
