// Cross-deck duplicate check: filled SQL (normalized) + titles across all cases.
// Run: bun scripts/check-dup-s5.ts
import { CASES } from "../src/lib/curriculum/cases/index";

function fill(template: string, values: Record<number, string>): string {
  return template.replace(/\{(\d+)\}/g, (_, n) => values[Number(n)] ?? `{${n}}`);
}
const norm = (s: string) => s.replace(/\s+/g, " ").replace(/\s*;\s*$/, "").trim().toLowerCase();

const bySql = new Map<string, string[]>();
const byTitle = new Map<string, string[]>();
for (const c of CASES) {
  const filled = norm(fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer]))));
  const t = norm(c.title);
  bySql.set(filled, [...(bySql.get(filled) ?? []), c.id]);
  byTitle.set(t, [...(byTitle.get(t) ?? []), c.id]);
}

let dups = 0;
for (const [sql, ids] of bySql) if (ids.length > 1) { dups++; console.log(`DUP SQL: ${ids.join(", ")}\n  ${sql.slice(0, 140)}`); }
for (const [t, ids] of byTitle) if (ids.length > 1) { dups++; console.log(`DUP TITLE: ${ids.join(", ")} — ${t}`); }
console.log(dups === 0 ? `OK: ${CASES.length} cases, 0 duplicate filled SQL, 0 duplicate titles` : `${dups} duplicate groups`);
