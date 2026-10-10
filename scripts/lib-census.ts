// Census: which FigureId union members are NOT covered by FIGURE_META's scan?
// Run: bun scripts/lib-census.ts
import { LESSONS, MODULES } from "../src/lib/curriculum/lessons";
import { caseStudies } from "../src/lib/curriculum/case-studies";
import type { FigureId } from "../src/lib/curriculum/types";

// union members, straight from the type — extracted via the registry instead:
// reuse diagrams registry through a dynamic-ish import is awkward in bun with
// tsx; instead recompute the union from types.ts source text.
import { readFileSync } from "node:fs";
const src = readFileSync(new URL("../src/lib/curriculum/types.ts", import.meta.url), "utf8");
const union = [...src.matchAll(/^\s*\|\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);

const inModules = new Set<FigureId>();
for (const m of MODULES) for (const l of m.lessons) {
  for (const b of l.blocks) if (b.kind === "diagram") inModules.add(b.figure);
  for (const d of l.deep ?? []) if (d.kind === "diagram") inModules.add(d.figure);
}

const inLessons = new Set<FigureId>();
for (const l of LESSONS) for (const b of l.blocks) {
  if (b.kind === "diagram") inLessons.add(b.figure);
}

const inCases = new Set<FigureId>();
for (const cs of caseStudies) {
  const blocks = (cs as unknown as { blocks?: Array<{ kind: string; figure?: string }> }).blocks;
  if (blocks) for (const b of blocks) if (b.kind === "diagram" && b.figure) inCases.add(b.figure as FigureId);
}

console.log("union:", union.length, "| lessons(LESSONS):", inLessons.size, "| modules(MODULES):", inModules.size, "| caseStudies blocks:", inCases.size);
const missing = union.filter((u) => !inModules.has(u as FigureId));
console.log("union minus MODULES-scan:", missing.length, missing);
const missingLessons = union.filter((u) => !inLessons.has(u as FigureId));
console.log("union minus LESSONS-scan:", missingLessons.length, missingLessons);
const csInLessons = [...inCases].filter((c) => inLessons.has(c));
console.log("case figs also in LESSONS:", csInLessons.length);
const csOnly = [...inCases].filter((c) => !inLessons.has(c));
console.log("case figs NOT in LESSONS:", csOnly.length, csOnly);
