// Coverage report — per-module content audit for the "what's next" decision.
import { MODULES } from "../src/lib/curriculum/lessons";
import { CASES } from "../src/lib/curriculum/cases";

interface Counts {
  lessons: number;
  mcqs: number;
  problems: number;
  runBlocks: number;
  diagrams: number;
}

function walkBlocks(lesson: any): any[] {
  const blocks: any[] = [];
  for (const s of lesson.sections ?? []) {
    for (const b of s.blocks ?? []) blocks.push(b);
  }
  return blocks;
}

const rows: Array<[string, Counts]> = [];
let totalMcq = 0;
let totalProb = 0;

for (const m of MODULES) {
  const c: Counts = { lessons: m.lessons.length, mcqs: 0, problems: 0, runBlocks: 0, diagrams: 0 };
  for (const l of m.lessons) {
    for (const b of walkBlocks(l)) {
      if (b.type === "mcq") c.mcqs++;
      if (b.type === "problem") c.problems++;
      if (b.type === "run" || b.kind === "run") c.runBlocks++;
      if (b.type === "diagram") c.diagrams++;
    }
    // lesson-level quiz/practice arrays (alternate shapes)
    for (const q of l.mcqs ?? []) c.mcqs++;
    for (const p of l.problems ?? []) c.problems++;
  }
  totalMcq += c.mcqs;
  totalProb += c.problems;
  rows.push([`${m.num}. ${m.title}`, c]);
}

console.log("MODULE".padEnd(28), "LESS", "MCQ", "PROB", "DIAG");
for (const [name, c] of rows) {
  console.log(name.padEnd(28), String(c.lessons).padStart(4), String(c.mcqs).padStart(4), String(c.problems).padStart(5), String(c.diagrams).padStart(5));
}
console.log("-".repeat(54));
console.log("TOTALS".padEnd(28), String(rows.reduce((s, r) => s + r[1].lessons, 0)).padStart(4), String(totalMcq).padStart(4), String(totalProb).padStart(5), String(rows.reduce((s, r) => s + r[1].diagrams, 0)).padStart(5));

console.log("\nCASE FILES:", CASES.length, "— topics:", [...new Set(CASES.map((c: any) => c.topic))].sort().join(","));

// Case topic labels — map l1..l8 to lesson titles of module 1
const m1 = MODULES[0];
console.log("\nMODULE 1 LESSONS (case topic mapping):");
m1.lessons.forEach((l: any, i: number) => console.log(`  l${i + 1}:`, l.title));
