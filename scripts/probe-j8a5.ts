/// <reference types="bun-types" />
// probe-j8a5 — bank hygiene: fill every M2 case (exemplars + j1a/j1b/j1c +
// j2a/j2b/j2c + j3a/j3b/j3c + j4a), normalize whitespace, verify the 8 new
// j4a fills are pairwise distinct in-file AND distinct vs all 75 prior fills;
// also report id coverage, deck/topic/universe invariants, JOIN/SELECT counts.
import type { CaseStudy } from "../src/lib/curriculum/cases/types";
import { casesExemplarsM2 } from "../src/lib/curriculum/cases/m2/exemplars-m2";
import { casesJ1a } from "../src/lib/curriculum/cases/m2/cases-j1a";
import { casesJ1b } from "../src/lib/curriculum/cases/m2/cases-j1b";
import { casesJ1c } from "../src/lib/curriculum/cases/m2/cases-j1c";
import { casesJ2a } from "../src/lib/curriculum/cases/m2/cases-j2a";
import { casesJ2b } from "../src/lib/curriculum/cases/m2/cases-j2b";
import { casesJ2c } from "../src/lib/curriculum/cases/m2/cases-j2c";
import { casesJ3a } from "../src/lib/curriculum/cases/m2/cases-j3a";
import { casesJ3b } from "../src/lib/curriculum/cases/m2/cases-j3b";
import { casesJ3c } from "../src/lib/curriculum/cases/m2/cases-j3c";
import { casesJ4a } from "../src/lib/curriculum/cases/m2/cases-j4a";

function fill(t: string, v: Record<number, string>): string {
  return t.replace(/\{(\d+)\}/g, (_, n) => v[Number(n)] ?? `{${n}}`);
}
function norm(sql: string): string {
  return sql.replace(/\s+/g, " ").trim().replace(/;$/, "").toLowerCase();
}

const prior: CaseStudy[] = [
  ...casesExemplarsM2, ...casesJ1a, ...casesJ1b, ...casesJ1c,
  ...casesJ2a, ...casesJ2b, ...casesJ2c, ...casesJ3a, ...casesJ3b, ...casesJ3c,
];
const mine = casesJ4a;

const priorNorms = new Map<string, string>();
for (const c of prior) {
  const f = fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])));
  priorNorms.set(norm(f), c.id);
}
console.log(`prior M2 fills: ${prior.length} (distinct normalized: ${priorNorms.size})`);

let collisions = 0;
const inFile = new Map<string, string>();
for (const c of mine) {
  const f = fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])));
  const n = norm(f);
  if (priorNorms.has(n)) { console.log(`COLLISION ${c.id} == ${priorNorms.get(n)}`); collisions++; }
  if (inFile.has(n)) { console.log(`IN-FILE COLLISION ${c.id} == ${inFile.get(n)}`); collisions++; }
  inFile.set(n, c.id);
  const joins = (f.match(/\bJOIN\b/gi) ?? []).length;
  const selects = (f.match(/\bSELECT\b/gi) ?? []).length;
  const noVerify = c.slots.filter(s => s.noVerify).length;
  console.log(`${c.id} deck=${c.deck} topic=${c.topic} universe=${c.universe} slots=${c.slots.length} distractors=${c.distractors.length} joins=${joins} selects=${selects} noVerify=${noVerify} tables=${(f.match(/\bFROM\b|\bJOIN\b/gi) ?? []).length}`);
}
const ids = mine.map(c => c.id);
console.log(`ids: ${ids.join(",")}`);
console.log(`universes distinct in-file: ${new Set(mine.map(c => c.universe)).size}`);
console.log(`collisions: ${collisions}`);
