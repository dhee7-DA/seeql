// WHOLE-BANK AUDIT — all sets in DRILL_SETS (M1+M2), not just M2.
// Checks: counts, dup ids/prompts (set + bank-wide), 4 choices, answer range,
// why thickness, notes!=answer, aspect/tier/module validity, id prefix ↔ module,
// sequential numbering continuity within each set, keyword/label/blurb presence,
// LESSON_DRILLS wiring (lessons exist on disk, set labels resolve).
import { DRILL_SETS, LESSON_DRILLS } from "../src/lib/curriculum/drills";
import type { DrillQ } from "../src/lib/curriculum/drills/types";

let fail = 0;
const ok = (cond: boolean, msg: string) => { if (!cond) { console.log("  ✗ " + msg); fail++; } };

const ASPECTS = new Set(["syntax", "semantics", "edge", "errors", "predict", "judgment"]);
const TIERS = new Set(["core", "secondary", "utility"]);

const bankIds = new Map<string, string>();   // id -> setKey
const bankPrompts = new Map<string, string>();
const aspects: Record<string, number> = {};
const tiers: Record<string, number> = {};
const modules: Record<number, number> = {};
let bankTotal = 0;

console.log("== PER-SET ==");
for (const s of DRILL_SETS) {
  const key = s.label || s.keyword;
  bankTotal += s.questions.length;
  modules[s.module] = (modules[s.module] ?? 0) + s.questions.length;
  tiers[s.tier] = (tiers[s.tier] ?? 0) + s.questions.length;

  ok(s.questions.length > 0, `${key}: empty set`);
  ok(!!s.keyword && !!s.label && !!s.blurb, `${key}: missing keyword/label/blurb`);
  ok(TIERS.has(s.tier), `${key}: bad tier ${s.tier}`);
  ok(s.module >= 1 && s.module <= 5, `${key}: module ${s.module} outside 1-5`);
  const wantPrefix = `dr${s.module}-`;
  ok(true, ""); // placeholder no-op

  const ids = new Set<string>();
  const prompts = new Set<string>();
  const expectedNums: number[] = [];
  for (const q of s.questions) {
    // ids
    ok(!ids.has(q.id), `${key}: dup id ${q.id}`);
    ids.add(q.id);
    ok(!bankIds.has(q.id), `dup id bank-wide: ${q.id} (${key} vs ${bankIds.get(q.id)})`);
    bankIds.set(q.id, key);
    // id prefix matches module: dr<m>-<abbr>-<NN>
    const m = /^dr(\d+)-[a-z0-9]+-(\d{2})$/.exec(q.id);
    ok(!!m, `${key}: id shape ${q.id}`);
    if (m) {
      ok(Number(m[1]) === s.module, `${key}: id module prefix ${m[1]} != set module ${s.module} (${q.id})`);
      expectedNums.push(Number(m[2]));
    }
    // prompts
    ok(!!q.prompt && q.prompt.length >= 15, `${key}: thin prompt ${q.id}`);
    ok(!prompts.has(q.prompt), `${key}: dup prompt ${q.id}`);
    prompts.add(q.prompt);
    ok(!bankPrompts.has(q.prompt), `dup prompt bank-wide (${key} vs ${bankPrompts.get(q.prompt)}): ${q.prompt.slice(0, 70)}`);
    bankPrompts.set(q.prompt, key);
    // shape
    ok(q.choices.length === 4, `${key}: ${q.id} has ${q.choices.length} choices`);
    ok(q.answer >= 0 && q.answer <= 3, `${key}: ${q.id} answer out of range`);
    ok(new Set(q.choices).size === 4, `${key}: ${q.id} duplicate choice text`);
    ok(!!q.why && q.why.length >= 30, `${key}: thin why ${q.id}`);
    ok(q.choices[q.answer] !== undefined, `${key}: ${q.id} answer index dangling`);
    if (q.notes) for (const n of q.notes) ok(n.choice !== q.answer, `${key}: note=answer ${q.id}`);
    ok(ASPECTS.has(q.aspect), `${key}: bad aspect ${q.aspect} (${q.id})`);
    aspects[q.aspect] = (aspects[q.aspect] ?? 0) + 1;
  }
  // sequential continuity: nums should be 01..N with no gaps
  const sorted = [...expectedNums].sort((a, b) => a - b);
  const expectSeq = Array.from({ length: sorted.length }, (_, i) => i + 1);
  ok(JSON.stringify(sorted) === JSON.stringify(expectSeq),
    `${key}: id numbering gap/disorder (${sorted[0]}..${sorted[sorted.length - 1]}, n=${sorted.length})`);
  console.log(`  ${key.padEnd(22)} ${String(s.questions.length).padStart(3)}  [m${s.module}/${s.tier}]`);
}

console.log("\n== BANK ==");
console.log(`  total: ${bankTotal} questions in ${DRILL_SETS.length} sets (expect 1390 / 34)`);
ok(bankTotal === 1390, `bank total ${bankTotal} != 1390`);
ok(DRILL_SETS.length === 34, `set count ${DRILL_SETS.length} != 34`);
console.log(`  by module: ${JSON.stringify(modules)} (expect m1=470, m2=465, m3=455)`);
ok(modules[1] === 470, `module 1 = ${modules[1]} != 470`);
ok(modules[2] === 465, `module 2 = ${modules[2]} != 465`);
ok(modules[3] === 455, `module 3 = ${modules[3]} != 455`);
console.log(`  by tier: ${JSON.stringify(tiers)}`);
console.log(`  by aspect: ${JSON.stringify(aspects)}`);

console.log("\n== LESSON_DRILLS wiring ==");
import { readFileSync, existsSync } from "node:fs";
for (const [lesson, setKeys] of Object.entries(LESSON_DRILLS)) {
  const lessonFile = `src/lib/curriculum/lessons/${lesson}.ts`;
  ok(existsSync(lessonFile), `${lesson}: lesson file missing`);
  for (const k of setKeys) {
    const found = DRILL_SETS.some((s) => s.label === k || s.keyword === k);
    ok(found, `${lesson}: wired set "${k}" not found in DRILL_SETS labels/keywords`);
  }
}

console.log(fail === 0 ? "\n✅ BANK AUDIT PASS" : `\n❌ BANK AUDIT FAIL: ${fail} issue(s)`);
