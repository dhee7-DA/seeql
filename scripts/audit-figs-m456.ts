import { LESSONS } from "../src/lib/curriculum/lessons";
import { FIGURES_M4 } from "../src/components/learn/diagrams-m4";
import { FIGURES_M5 } from "../src/components/learn/diagrams-m5";
import { FIGURES_M6 } from "../src/components/learn/diagrams-m6";
import { readFileSync } from "node:fs";

// 1) union members from types.ts
const typesSrc = readFileSync("src/lib/curriculum/types.ts", "utf8");
const union = new Set([...typesSrc.matchAll(/"([a-z]\d+[a-z0-9-]*)"/g)].map((m) => m[1]));
// 2) used by lessons
const used = new Set<string>();
for (const l of LESSONS) for (const b of l.blocks) if (b.kind === "diagram") used.add(b.figure);
// 3) registered
const reg = new Set([...Object.keys(FIGURES_M4), ...Object.keys(FIGURES_M5), ...Object.keys(FIGURES_M6)]);

const missing = [...used].filter((u) => !reg.has(u));
const orphans = [...reg].filter((r) => !used.has(r));
const notInUnion = [...used].filter((u) => !union.has(u));
const problems = LESSONS.filter((l) => l.num >= 25);
const dupIds = new Set<string>(); const allIds = new Set<string>();
for (const l of LESSONS) for (const arr of [l.problems.map((p) => p.id), l.mcqs.map((m) => m.id)]) {
  for (const id of arr) { if (allIds.has(id)) dupIds.add(id); allIds.add(id); }
}
console.log(JSON.stringify({
  unionSize: union.size, usedSize: used.size, regSize: reg.size,
  missingReg: missing, orphans: orphans, notInUnion: notInUnion,
  dupIds: [...dupIds], totalIds: allIds.size,
  newLessons: problems.length,
  newProblems: problems.reduce((a, l) => a + l.problems.length, 0),
  newMcqs: problems.reduce((a, l) => a + l.mcqs.length, 0),
  newFigs: problems.reduce((a, l) => a + l.blocks.filter((b) => b.kind === "diagram").length, 0),
}, null, 1));
