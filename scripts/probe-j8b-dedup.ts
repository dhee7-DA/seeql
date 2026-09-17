/// <reference types="bun-types" />
// probe-j8b-dedup.ts — fills pairwise-distinct check: new cases-j4b vs ALL
// prior M2 files (exemplars + j1a..j3c). Run from PROJECT ROOT with bun.
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
import { casesJ4b } from "../src/lib/curriculum/cases/m2/cases-j4b";

function fill(template: string, values: Record<number, string>): string {
  return template.replace(/\{(\d+)\}/g, (_, n) => values[Number(n)] ?? `{${n}}`);
}
function norm(sql: string): string {
  return sql.replace(/\s+/g, " ").trim().toLowerCase();
}

const prior: Array<[string, CaseStudy[]]> = [
  ["exemplars-m2", casesExemplarsM2],
  ["j1a", casesJ1a],
  ["j1b", casesJ1b],
  ["j1c", casesJ1c],
  ["j2a", casesJ2a],
  ["j2b", casesJ2b],
  ["j2c", casesJ2c],
  ["j3a", casesJ3a],
  ["j3b", casesJ3b],
  ["j3c", casesJ3c],
];

const priorFills = new Map<string, string>();
let priorCount = 0;
for (const [name, arr] of prior) {
  for (const c of arr) {
    const f = fill(
      c.template,
      Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])),
    );
    priorFills.set(c.id, norm(f));
    priorCount++;
  }
}
console.log(`prior M2 fills: ${priorCount}`);

// in-file distinctness + vs-prior
const mine = new Map<string, string>();
let collisions = 0;
for (const c of casesJ4b) {
  const f = fill(
    c.template,
    Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])),
  );
  const n = norm(f);
  if ([...mine.values()].includes(n)) {
    console.log(`IN-FILE COLLISION: ${c.id}`);
    collisions++;
  }
  mine.set(c.id, n);
  for (const [pid, pf] of priorFills) {
    if (pf === n) {
      console.log(`CROSS COLLISION: ${c.id} == ${pid}`);
      collisions++;
    }
  }
}
console.log(`j4b cases: ${casesJ4b.length}, collisions: ${collisions}`);
console.log(`ids: ${casesJ4b.map((c) => c.id).join(",")}`);
const decks = new Set(casesJ4b.map((c) => c.deck));
const topics = new Set(casesJ4b.map((c) => c.topic));
const universes = casesJ4b.map((c) => c.universe);
console.log(`decks: ${[...decks].join(",")} topics: ${[...topics].join(",")}`);
console.log(`universes distinct in-file: ${new Set(universes).size === universes.length} (${universes.join(",")})`);
const noVerify = casesJ4b.map((c) => c.slots.filter((s) => s.noVerify).length);
console.log(`noVerify per case: ${noVerify.join(",")}`);
const joins = casesJ4b.map((c) => {
  const f = fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])));
  return (f.match(/\bJOIN\b/gi) ?? []).length;
});
console.log(`JOINs per fill: ${joins.join(",")}`);
const selects = casesJ4b.map((c) => {
  const f = fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])));
  return (f.match(/\bSELECT\b/gi) ?? []).length;
});
console.log(`SELECTs per fill: ${selects.join(",")}`);
