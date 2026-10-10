/// <reference types="bun-types" />
/** Wave-2 dup check: titles + normalized filled SQL across the whole deck. */
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

// topic + tier + id sanity for wave 2
const wave2 = (CASES as CaseStudy[]).filter((c) => {
  const n = Number(c.id.slice(3));
  return n >= 951 && n <= 1000;
});
const topics: Record<string, number> = {};
const tiers: Record<string, number> = {};
for (const c of wave2) {
  topics[c.topic] = (topics[c.topic] ?? 0) + 1;
  tiers[c.tier] = (tiers[c.tier] ?? 0) + 1;
}
console.log(`wave2: ${wave2.length} cases, topics ${JSON.stringify(topics)}, tiers ${JSON.stringify(tiers)}`);
const ids = wave2.map((c) => Number(c.id.slice(3)));
const sequential = ids.every((v, i) => v === 951 + i);
console.log(`ids sequential 951..1000: ${sequential}`);
console.log(`deck: ${CASES.length} cases, title dups ${titleDups}, filled-SQL dups ${sqlDups}`);
process.exit(titleDups || sqlDups || !sequential || wave2.length !== 50 ? 1 : 0);
