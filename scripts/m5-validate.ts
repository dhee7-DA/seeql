/// <reference types="bun-types" />
/**
 * M5 drill validator — mechanical checks for one candidate set file.
 * Usage: bun scripts/m5-validate.ts src/lib/curriculum/drills/m5/<file>.ts <expectedCount>
 * Checks: count, id format dr5-<abbr>-NN sequential 01..N no gaps/dups,
 * keyword consistency, 4 choices / no dup choice text / answer 0..3,
 * why >= 30, notes on non-answers only (why >= 15), aspect validity +
 * histogram, tier validity, prompt uniqueness in-file AND bank-wide
 * (against every set already in DRILL_SETS plus any other dr5 files passed
 * as extra args after the expected count).
 */
import type { DrillQ, DrillAspect, DrillTier } from "../src/lib/curriculum/drills/types";

const args = process.argv.slice(2);
const file = args[0];
const expected = Number(args[1]);
if (!file || !expected) {
  console.error("usage: bun scripts/m5-validate.ts <file.ts> <expectedCount> [extraFiles...]");
  process.exit(2);
}
const extraFiles = args.slice(2);

let fail = 0;
const ok = (cond: boolean, msg: string) => { if (!cond) { fail++; console.log("  FAIL " + msg); } };

const ASPECTS: DrillAspect[] = ["syntax", "semantics", "edge", "errors", "predict", "judgment"];
const TIERS: DrillTier[] = ["core", "secondary", "utility"];

// load candidate
const mod = await import(`../${file}`);
const entry = Object.entries(mod).find(([, v]) => Array.isArray(v));
if (!entry) { console.error(`FAIL: no exported array in ${file}`); process.exit(1); }
const qs = entry[1] as DrillQ[];

// load bank-wide prompts: registered sets + other candidate files
const bankPrompts = new Set<string>();
const bankIds = new Set<string>();
const idx = await import("../src/lib/curriculum/drills/index");
for (const s of idx.DRILL_SETS as Array<{ questions: DrillQ[] }>) {
  for (const q of s.questions) { bankPrompts.add(q.prompt.trim()); bankIds.add(q.id); }
}
for (const f of extraFiles) {
  try {
    const m = await import(`../${f}`);
    const arr = Object.values(m).find((v) => Array.isArray(v)) as DrillQ[] | undefined;
    if (arr) for (const q of arr) { bankPrompts.add(q.prompt.trim()); bankIds.add(q.id); }
  } catch { /* optional */ }
}

console.log(`Validating ${file} — expect ${expected}, found ${qs.length}`);
ok(qs.length === expected, `count ${qs.length} != ${expected}`);

const aspects: Record<string, number> = {};
const seenPrompts = new Set<string>();
const idRe = /^dr5-([a-z]+)-(\d{2,})$/;
let abbr = "";
for (const q of qs) {
  const m = idRe.exec(q.id);
  ok(!!m, `${q.id}: id must match dr5-<abbr>-NN`);
  if (m) {
    if (!abbr) abbr = m[1];
    ok(m[1] === abbr, `${q.id}: abbreviation drift (${m[1]} vs ${abbr})`);
    const num = Number(m[2]);
    ok(num >= 1 && num <= qs.length, `${q.id}: number ${num} outside 1..${qs.length}`);
  }
  ok(!bankIds.has(q.id), `${q.id}: id already exists in the bank`);
  ok(!!q.keyword && q.keyword.length > 0, `${q.id}: missing keyword`);
  ok(TIERS.includes(q.tier), `${q.id}: bad tier ${q.tier}`);
  ok(ASPECTS.includes(q.aspect), `${q.id}: bad aspect ${q.aspect}`);
  if (ASPECTS.includes(q.aspect)) aspects[q.aspect] = (aspects[q.aspect] ?? 0) + 1;
  ok(Array.isArray(q.choices) && q.choices.length === 4, `${q.id}: needs exactly 4 choices`);
  ok(new Set(q.choices).size === 4, `${q.id}: duplicate choice text`);
  ok(q.answer >= 0 && q.answer <= 3, `${q.id}: answer out of range`);
  ok(!!q.why && q.why.length >= 30, `${q.id}: thin why (${q.why?.length ?? 0})`);
  if (q.notes) for (const n of q.notes) {
    ok(n.choice !== q.answer, `${q.id}: note targets the answer`);
    ok(!!n.why && n.why.length >= 15, `${q.id}: thin note why`);
    ok(n.choice >= 0 && n.choice <= 3, `${q.id}: note choice out of range`);
  }
  const p = q.prompt.trim();
  ok(p.length >= 15, `${q.id}: thin prompt (${p.length})`);
  ok(!seenPrompts.has(p), `${q.id}: duplicate prompt in-file`);
  ok(!bankPrompts.has(p), `${q.id}: prompt already exists bank-wide`);
  seenPrompts.add(p);
}

// sequential numbering 01..N no gaps
const nums = qs.map(q => Number(idRe.exec(q.id)?.[2])).sort((a, b) => a - b);
const expectSeq = Array.from({ length: qs.length }, (_, i) => i + 1);
ok(JSON.stringify(nums) === JSON.stringify(expectSeq), `id numbering gap/disorder: ${nums.join(",")}`);

console.log(`  aspects: ${JSON.stringify(aspects)}`);
console.log(fail === 0 ? "✅ VALID" : `❌ ${fail} issue(s)`);
process.exit(fail === 0 ? 0 : 1);
