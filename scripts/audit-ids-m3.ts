// Audit: every mcq/problem id across all lessons must be globally unique,
// every expected.ts key must map to a problem, and counts must add up.
import { LESSONS, MODULES } from "../src/lib/curriculum/lessons";
import { EXPECTED } from "../src/lib/curriculum/expected";

const ids = new Map<string, string>();
let dups = 0;
let mcqCount = 0;
let probCount = 0;

for (const l of LESSONS) {
  for (const m of l.mcqs) {
    mcqCount++;
    if (ids.has(m.id)) {
      console.error(`DUP mcq ${m.id}: ${l.id} vs ${ids.get(m.id)}`);
      dups++;
    }
    ids.set(m.id, l.id);
  }
  for (const p of l.problems) {
    probCount++;
    if (ids.has(p.id)) {
      console.error(`DUP problem ${p.id}: ${l.id} vs ${ids.get(p.id)}`);
      dups++;
    }
    ids.set(p.id, l.id);
    if (!EXPECTED[p.id]) console.error(`MISSING expected for ${p.id}`);
  }
}

const expectedKeys = Object.keys(EXPECTED);
const orphan = expectedKeys.filter((k) => !ids.has(k));

console.log(`lessons: ${LESSONS.length} (modules: ${MODULES.map((m) => m.num).join(", ")})`);
console.log(`mcqs: ${mcqCount} · problems: ${probCount} · unique ids: ${ids.size}`);
console.log(`expected keys: ${expectedKeys.length} · orphans: ${orphan.length}`);
console.log(`duplicates: ${dups}`);
if (dups > 0 || orphan.length > 0) process.exit(1);
