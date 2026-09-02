// Full-wiring audit for Task 21: figure orphans across ALL registries,
// duplicate ids, per-lesson counts, XP-eligibility. Run: bun scripts/audit-t21.ts
import { LESSONS, MODULES } from "../src/lib/curriculum/lessons";
import { FIGURES_M4 } from "../src/components/learn/diagrams-m4";
import { FIGURES_M5 } from "../src/components/learn/diagrams-m5";
import { FIGURES_M6 } from "../src/components/learn/diagrams-m6";
import { FIGURES_M2 } from "../src/components/learn/diagrams-m2";
import { FIGURES_M3 } from "../src/components/learn/diagrams-m3";
import { readFileSync } from "node:fs";

// registered figures from every module registry (M1 lives in diagrams.tsx — extract keys)
const diagramsSrc = readFileSync("src/components/learn/diagrams.tsx", "utf8");
const m1Keys = [...diagramsSrc.matchAll(/"([a-z]\d+-[a-z0-9-]+)":/g)].map((m) => m[1]);
const reg = new Set([
  ...m1Keys,
  ...Object.keys(FIGURES_M2 ?? {}),
  ...Object.keys(FIGURES_M3 ?? {}),
  ...Object.keys(FIGURES_M4),
  ...Object.keys(FIGURES_M5),
  ...Object.keys(FIGURES_M6),
]);

const used = new Set<string>();
for (const l of LESSONS) for (const b of l.blocks) if (b.kind === "diagram") used.add(b.figure);

const orphans = [...reg].filter((r) => !used.has(r));
const missing = [...used].filter((u) => !reg.has(u));

const allIds = new Set<string>();
const dupIds = new Set<string>();
for (const l of LESSONS) {
  for (const arr of [l.problems.map((p) => p.id), l.mcqs.map((m) => m.id)]) {
    for (const id of arr) { if (allIds.has(id)) dupIds.add(id); allIds.add(id); }
  }
}

const modOf = new Map<string, number>();
for (const m of MODULES) for (const l of m.lessons) modOf.set(l.id, m.num);

console.log(JSON.stringify({
  registered: reg.size, used: used.size,
  orphans, missing,
  dupIds: [...dupIds], totalIds: allIds.size,
  lessons: LESSONS.length, modules: MODULES.length,
  problems: LESSONS.reduce((a, l) => a + l.problems.length, 0),
  mcqs: LESSONS.reduce((a, l) => a + l.mcqs.length, 0),
  figures: LESSONS.reduce((a, l) => a + l.blocks.filter((b) => b.kind === "diagram").length, 0),
  caseStudies: LESSONS.filter((l) => l.num >= 35).map((l) => ({
    num: l.num, module: modOf.get(l.id), title: l.title,
    problems: l.problems.length, mcqs: l.mcqs.length,
  })),
  moduleSizes: MODULES.map((m) => ({ num: m.num, lessons: m.lessons.length })),
}, null, 1));
