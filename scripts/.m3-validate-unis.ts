// Throwaway validator for m3-w1a (union.ts + intersect.ts). DELETE after run.
import { UNION_DRILL } from "../src/lib/curriculum/drills/m3/union";
import { INTERSECT_DRILL } from "../src/lib/curriculum/drills/m3/intersect";
import { INNER_JOIN } from "../src/lib/curriculum/drills/m2/inner-join";
import { SET_PRECEDENCE } from "../src/lib/curriculum/drills/m3/set-precedence";
import { EXCEPT_DRILL } from "../src/lib/curriculum/drills/m3/except";
import type { DrillQ, DrillAspect } from "../src/lib/curriculum/drills/types";

let failures = 0;
const fail = (msg: string) => { failures++; console.log("FAIL:", msg); };

function validateSet(
  name: string,
  set: DrillQ[],
  expectedCount: number,
  prefix: string,
  kw: string,
  aspectQuotas: Partial<Record<DrillAspect, number>>,
) {
  if (set.length !== expectedCount) fail(`${name}: count ${set.length} != ${expectedCount}`);
  set.forEach((q, i) => {
    const wantId = `${prefix}-${String(i + 1).padStart(2, "0")}`;
    if (q.id !== wantId) fail(`${name}[${i}]: id ${q.id} != ${wantId} (must be sequential zero-padded)`);
    if (q.keyword !== kw) fail(`${q.id}: keyword '${q.keyword}' != '${kw}'`);
    if (q.tier !== "core") fail(`${q.id}: tier '${q.tier}' != 'core'`);
    if (q.choices.length !== 4) fail(`${q.id}: ${q.choices.length} choices`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) fail(`${q.id}: answer ${q.answer} out of range`);
    if (q.why.length < 30) fail(`${q.id}: why only ${q.why.length} chars`);
    for (const n of q.notes ?? []) {
      if (n.choice === q.answer) fail(`${q.id}: note points at answer ${q.answer}`);
      if (n.choice < 0 || n.choice > 3) fail(`${q.id}: note choice ${n.choice} out of range`);
      if (!n.why || n.why.length < 15) fail(`${q.id}: note why too thin`);
    }
    const dupChoice = new Set(q.choices);
    if (dupChoice.size !== 4) fail(`${q.id}: duplicate choice text`);
    if (q.prompt.length < 25) fail(`${q.id}: suspiciously short prompt`);
  });
  const ids = new Set(set.map(q => q.id));
  if (ids.size !== set.length) fail(`${name}: duplicate ids`);
  const prompts = new Set(set.map(q => q.prompt));
  if (prompts.size !== set.length) fail(`${name}: duplicate prompts within set (${set.length - prompts.size})`);
  // aspect quotas
  const counts: Record<string, number> = {};
  for (const q of set) counts[q.aspect] = (counts[q.aspect] ?? 0) + 1;
  for (const [a, n] of Object.entries(aspectQuotas)) {
    if ((counts[a] ?? 0) !== n) fail(`${name}: aspect ${a} = ${counts[a] ?? 0}, expected ${n}`);
  }
  console.log(`${name}: ${set.length} Qs, aspects`, JSON.stringify(counts));
  return new Set(set.map(q => q.prompt));
}

const unP = validateSet("UNION_DRILL", UNION_DRILL, 55, "dr3-un", "UNION & UNION ALL",
  { syntax: 8, semantics: 11, edge: 11, errors: 7, predict: 12, judgment: 6 });
const isP = validateSet("INTERSECT_DRILL", INTERSECT_DRILL, 45, "dr3-is", "INTERSECT",
  { syntax: 6, semantics: 9, edge: 9, errors: 6, predict: 10, judgment: 5 });

// cross-set exact prompt/id collisions vs the rest of the bank
const others: Array<[string, DrillQ[]]> = [
  ["inner-join", INNER_JOIN], ["set-precedence", SET_PRECEDENCE], ["except", EXCEPT_DRILL],
];
const otherIds = new Set<string>();
const otherPrompts = new Set<string>();
for (const [nm, qs] of others) {
  for (const q of qs) {
    if (otherIds.has(q.id)) fail(`cross-set dup id ${q.id} (${nm})`);
    otherIds.add(q.id);
    if (otherPrompts.has(q.prompt)) fail(`cross-set dup prompt in ${nm}: ${q.prompt.slice(0, 60)}`);
    otherPrompts.add(q.prompt);
  }
}
for (const q of UNION_DRILL) {
  if (otherIds.has(q.id)) fail(`id collision ${q.id}`);
  if (otherPrompts.has(q.prompt)) fail(`UNION prompt collides: ${q.prompt.slice(0, 60)}`);
}
for (const q of INTERSECT_DRILL) {
  if (otherIds.has(q.id)) fail(`id collision ${q.id}`);
  if (otherPrompts.has(q.prompt)) fail(`INTERSECT prompt collides: ${q.prompt.slice(0, 60)}`);
}
const allP = new Set([...unP, ...isP]);
if (allP.size !== 100) fail(`union.ts vs intersect.ts prompt overlap (${allP.size}/100)`);

console.log(failures === 0 ? "✅ ALL VALIDATION PASS" : `❌ ${failures} failures`);
if (failures > 0) process.exit(1);
