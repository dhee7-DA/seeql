/** Ground-truth inventory of the current curriculum state. */
import { MODULES, LESSONS } from "../src/lib/curriculum/lessons/index";
import type { FigureId } from "../src/lib/curriculum/types";

let totalMcq = 0;
let totalProb = 0;
const figs = new Set<FigureId>();
const caseStudies: string[] = [];

console.log("=== SEEQL CURRICULUM INVENTORY (ground truth from source) ===\n");

for (const m of MODULES) {
  const mcq = m.lessons.reduce((n, l) => n + l.mcqs.length, 0);
  const prob = m.lessons.reduce((n, l) => n + l.problems.length, 0);
  const lessonFigs = m.lessons.flatMap((l) =>
    l.blocks.flatMap((b) => (b.kind === "diagram" ? [b.figure] : [])),
  );
  lessonFigs.forEach((f) => figs.add(f));
  const cases = m.lessons.filter((l) => /case study/i.test(l.title));
  cases.forEach((c) => caseStudies.push(`${c.id}: ${c.title}`));
  const caseProbs = cases.reduce((n, l) => n + l.problems.length, 0);
  totalMcq += mcq;
  totalProb += prob;
  console.log(
    `M${m.num} ${m.title}  [${m.level}]`,
    `\n   lessons: ${m.lessons.length}  (case studies: ${cases.length})`,
    `\n   MCQs: ${mcq}   problems: ${prob}   (case-study problems: ${caseProbs})`,
    `\n   lesson list: ${m.lessons.map((l) => `${l.num}.${l.title.slice(0, 34)}`).join(" | ")}`,
    `\n`,
  );
}

// Difficulty split across all problems
const diff = { easy: 0, medium: 0, hard: 0 } as Record<string, number>;
for (const l of LESSONS) for (const p of l.problems) diff[p.difficulty] = (diff[p.difficulty] ?? 0) + 1;

console.log("=== TOTALS ===");
console.log(`modules:      ${MODULES.length}`);
console.log(`lessons:      ${LESSONS.length} (incl. ${caseStudies.length} case-study capstones)`);
console.log(`MCQs:         ${totalMcq}`);
console.log(`problems:     ${totalProb}  (easy ${diff.easy} / medium ${diff.medium} / hard ${diff.hard})`);
console.log(`figures:      ${figs.size} unique registered diagram ids used`);
console.log(`case studies: ${caseStudies.length}`);
caseStudies.forEach((c) => console.log(`  - ${c}`));

// feature inventory quick flags
console.log("\n=== APP FEATURES (from source flags) ===");
const mutating = LESSONS.reduce((n, l) => n + l.problems.filter((p) => p.mutating).length, 0);
const coached = LESSONS.reduce((n, l) => n + l.problems.filter((p) => p.mistakes && p.mistakes.length > 0).length, 0);
const hinted = LESSONS.reduce((n, l) => n + l.problems.filter((p) => p.hints || p.hint).length, 0);
console.log(`mutating (sandboxed write) problems: ${mutating}`);
console.log(`problems with mistake-coach rules:   ${coached}`);
console.log(`problems with 2-level hints:         ${hinted}`);
