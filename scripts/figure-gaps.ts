// Identify diagram-less lessons + registry/reference mismatches.
import { LESSONS } from "../src/lib/curriculum/lessons";
import { FIGURES_M1X } from "../src/components/learn/diagrams-m1x";
import { FIGURES_M2 } from "../src/components/learn/diagrams-m2";
import { FIGURES_M3 } from "../src/components/learn/diagrams-m3";
import { FIGURES_M4 } from "../src/components/learn/diagrams-m4";
import { FIGURES_M5 } from "../src/components/learn/diagrams-m5";
import { FIGURES_M6 } from "../src/components/learn/diagrams-m6";
import { FIGURES_M7 } from "../src/components/learn/diagrams-m7";
import { FIGURES_M8 } from "../src/components/learn/diagrams-m8";
import { FIGURES_M9 } from "../src/components/learn/diagrams-m9";

const registry = new Set<string>([
  ...Object.keys(FIGURES_M1X), ...Object.keys(FIGURES_M2), ...Object.keys(FIGURES_M3),
  ...Object.keys(FIGURES_M4), ...Object.keys(FIGURES_M5), ...Object.keys(FIGURES_M6),
  ...Object.keys(FIGURES_M7), ...Object.keys(FIGURES_M8), ...Object.keys(FIGURES_M9),
  // 33 inline keys from diagrams.tsx FIGURES literal
  "l1-anatomy","l2-projection","l3-where-gate","l3-null-logic","l4-sort-limit","l5-distinct",
  "l6-aggregate","l7-groupby","l8-where-having","j1-fk-lookup","j2-inner-match","j3-chain",
  "j4-left-join","j5-anti-join","j6-self-join","j7-fanout","j8-join-aggregate","s1-union",
  "s2-stack-labels","s3-intersect","s4-except","s5-precedence","s6-case-switch","s7-case-agg",
  "s8-capstone","l1-schema-map","l2-expr-math","l3-like-match","l4-null-spread","l5-multikey-sort",
  "l6-distinct-mech","l7-count-star",
]);

const referenced = new Set<string>();
const holes: Array<{ id: number; title: string; mod: unknown; blocks: number }> = [];
for (const l of LESSONS as Array<Record<string, unknown>>) {
  const blocks = (l.blocks ?? []) as Array<{ kind: string; figure?: string }>;
  const figs = blocks.filter(b => b.kind === "diagram");
  figs.forEach(b => referenced.add(b.figure!));
  if (figs.length === 0) holes.push({ id: l.id as number, title: l.title as string, mod: l.module ?? l.mod ?? l.moduleId, blocks: blocks.length });
}
console.log("DIAGRAM-LESS LESSONS:");
holes.forEach(h => console.log(`  lesson ${h.id} — "${h.title}" (module field: ${h.mod}, ${h.blocks} blocks)`));
console.log(`\nreferenced unique: ${referenced.size}, registry: ${registry.size}`);
const orphanReg = [...registry].filter(k => !referenced.has(k));
const missingReg = [...referenced].filter(k => !registry.has(k));
console.log("registry entries never referenced:", orphanReg.length ? orphanReg.join(", ") : "none");
console.log("references with NO registry entry (runtime bug):", missingReg.length ? missingReg.join(", ") : "none");
