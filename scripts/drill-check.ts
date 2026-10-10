// Drill bank integrity check — mirrors deck-check.ts for the MCQ drill bank.
// Verifies: total count, unique ids, unique prompt+choice signatures, answer
// index bounds, choice counts, note validity, aspect + tier distribution,
// per-set counts. Exit 1 on any structural violation.
// Run: bun scripts/drill-check.ts

import { DRILL_SETS } from "../src/lib/curriculum/drills";
import type { DrillAspect } from "../src/lib/curriculum/drills/types";

let total = 0;
let dupIds = 0, dupSigs = 0, badAnswer = 0, badChoices = 0, badNotes = 0, badModule = 0;
const ids = new Map<string, string>();
const sigs = new Map<string, string>();
const perAspect = new Map<string, number>();
const perTier = new Map<string, number>();
const perSet: Array<[string, number]> = [];

for (const s of DRILL_SETS) {
  perSet.push([`${s.label} [${s.tier}]`, s.questions.length]);
  for (const q of s.questions) {
    total++;
    perAspect.set(q.aspect, (perAspect.get(q.aspect) ?? 0) + 1);
    perTier.set(q.tier, (perTier.get(q.tier) ?? 0) + 1);
    if (!q.id.startsWith(`dr${s.module}-`)) {
      console.log(`  BAD ID PREFIX: ${q.id} in module ${s.module} set ${s.keyword}`);
      badModule++;
    }
    if (ids.has(q.id)) {
      console.log(`  DUP ID: ${q.id} (${ids.get(q.id)} vs ${s.keyword})`);
      dupIds++;
    }
    ids.set(q.id, s.keyword);
    const sig = q.prompt + "\u0000" + q.choices.join("\u0001");
    if (sigs.has(sig)) {
      console.log(`  DUP PROMPT+CHOICES: ${q.id} == ${sigs.get(sig)}`);
      dupSigs++;
    }
    sigs.set(sig, q.id);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length) {
      console.log(`  BAD ANSWER IDX: ${q.id}`);
      badAnswer++;
    }
    if (q.choices.length < 3) {
      console.log(`  TOO FEW CHOICES: ${q.id} (${q.choices.length})`);
      badChoices++;
    }
    for (const n of q.notes ?? []) {
      if (!Number.isInteger(n.choice) || n.choice < 0 || n.choice >= q.choices.length || n.choice === q.answer) {
        console.log(`  BAD NOTE REF: ${q.id} -> choice ${n.choice}`);
        badNotes++;
      }
    }
  }
}

console.log(`drills: ${total} questions | dup ids: ${dupIds} | dup prompt+choices: ${dupSigs} | bad answers: ${badAnswer} | bad choice counts: ${badChoices} | bad notes: ${badNotes} | bad id prefixes: ${badModule}`);
console.log(`tiers: ${JSON.stringify(Object.fromEntries(perTier))}`);
console.log(`aspects: ${JSON.stringify(Object.fromEntries(perAspect))}`);
for (const [k, n] of perSet) console.log(`  ${k}: ${n}`);
process.exit(dupIds || dupSigs || badAnswer || badChoices || badNotes || badModule ? 1 : 0);
