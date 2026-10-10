// Count figure registry entries per module + lesson coverage.
import { FIGURES_M1X } from "../src/components/learn/diagrams-m1x";
import { FIGURES_M2 } from "../src/components/learn/diagrams-m2";
import { FIGURES_M3 } from "../src/components/learn/diagrams-m3";
import { FIGURES_M4 } from "../src/components/learn/diagrams-m4";
import { FIGURES_M5 } from "../src/components/learn/diagrams-m5";
import { FIGURES_M6 } from "../src/components/learn/diagrams-m6";
import { FIGURES_M7 } from "../src/components/learn/diagrams-m7";
import { FIGURES_M8 } from "../src/components/learn/diagrams-m8";
import { FIGURES_M9 } from "../src/components/learn/diagrams-m9";

const maps: Array<[string, Record<string, unknown>]> = [
  ["M1x", FIGURES_M1X], ["M2", FIGURES_M2], ["M3", FIGURES_M3], ["M4", FIGURES_M4],
  ["M5", FIGURES_M5], ["M6", FIGURES_M6], ["M7", FIGURES_M7], ["M8", FIGURES_M8], ["M9", FIGURES_M9],
];
let total = 0;
for (const [name, m] of maps) {
  const keys = Object.keys(m);
  total += keys.length;
  console.log(`${name}: ${keys.length}`);
}
// inline entries in diagrams.tsx FIGURES (33 literal keys listed after the spreads)
const inline = 33;
console.log(`inline(diagrams.tsx): ${inline}`);
console.log(`TOTAL registry: ${total + inline}`);

// Lesson coverage: which lessons reference a figure and which don't
import { LESSONS } from "../src/lib/curriculum/lessons";
const withF = LESSONS.filter(l => l.blocks.some((b: { kind: string }) => b.kind === "diagram"));
const withoutF = LESSONS.filter(l => !l.blocks.some((b: { kind: string }) => b.kind === "diagram"));
console.log(`\nlessons total: ${LESSONS.length}, with diagram: ${withF.length}, without: ${withoutF.length}`);
const byMod = new Map<number, { w: number; wo: number; ids: string[] }>();
for (const l of LESSONS) {
  const has = l.blocks.some((b: { kind: string }) => b.kind === "diagram");
  const e = byMod.get(l.module) ?? { w: 0, wo: 0, ids: [] };
  has ? e.w++ : e.wo++;
  if (!has) e.ids.push(String(l.id).padStart(2, "0"));
  byMod.set(l.module, e);
}
for (const [m, e] of [...byMod.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`module ${m}: with=${e.w} without=${e.wo}${e.wo ? "  missing: " + e.ids.join(",") : ""}`);
}
