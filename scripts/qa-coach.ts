// Mechanical QA for the top-notch content conversion:
//  - every problem has hints[2] (+ legacy hint gone) and a takeaway exists
//  - mistake rules NEVER match the problem's own reference solution
//  - mistake rules compile as regexes
//  - MCQ notes point at a wrong, in-range choice
//  - dialect blocks carry a valid db pill
// Run: bun scripts/qa-coach.ts

import { LESSONS } from "../src/lib/curriculum/lessons";
import { normalizeSql } from "../src/lib/curriculum/coach";

let issues = 0;
const fail = (msg: string) => { console.log("  ✗ " + msg); issues++; };

const DBS = new Set(["postgres", "mysql", "sqlite"]);

for (const l of LESSONS) {
  const problems = l.problems.length;
  const withHints = l.problems.filter((p) => p.hints?.length === 2).length;
  const legacyHint = l.problems.filter((p) => p.hint !== undefined).length;
  const mistakeRules = l.problems.reduce((n, p) => n + (p.mistakes?.length ?? 0), 0);
  const notes = l.mcqs.filter((m) => m.notes?.length).length;
  const dialects = l.blocks.filter((b) => b.kind === "dialect").length;

  console.log(
    `${l.id}: problems=${problems} hints=${withHints}/${problems} rules=${mistakeRules} notes=${notes}/${l.mcqs.length} dialect=${dialects} takeaway=${l.takeaway ? 1 : 0}`,
  );

  if (withHints !== problems) fail(`${l.id}: ${problems - withHints} problems missing hints[2]`);
  if (legacyHint) fail(`${l.id}: ${legacyHint} problems still use legacy hint`);
  if (!l.takeaway) fail(`${l.id}: missing takeaway`);
  if (notes !== l.mcqs.length) fail(`${l.id}: ${l.mcqs.length - notes} MCQs missing notes`);

  for (const p of l.problems) {
    const norm = normalizeSql(p.solution);
    for (const m of p.mistakes ?? []) {
      try {
        if (new RegExp(m.test, "i").test(norm)) {
          fail(`${p.id}: mistake rule /${m.test}/ matches its own reference solution!`);
        }
      } catch (e) {
        fail(`${p.id}: mistake rule /${m.test}/ does not compile: ${e}`);
      }
    }
  }
  for (const m of l.mcqs) {
    for (const n of m.notes ?? []) {
      if (n.choice === m.answer) fail(`${m.id}: note targets the CORRECT choice ${n.choice}`);
      if (n.choice < 0 || n.choice >= m.choices.length) fail(`${m.id}: note choice ${n.choice} out of range`);
    }
  }
  for (const b of l.blocks) {
    if (b.kind === "dialect" && !DBS.has(b.db)) fail(`${l.id}: dialect block bad db "${b.db}"`);
  }
}

console.log(issues === 0 ? "\nALL CHECKS PASSED" : `\n${issues} ISSUE(S) FOUND`);
process.exit(issues === 0 ? 0 : 1);
