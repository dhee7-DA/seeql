// Figure census: map every lesson -> figures used; compare with registry + union.
import * as fs from "node:fs";
import * as path from "node:path";

const LESSONS_DIR = "/home/z/my-project/src/lib/curriculum/lessons";
const files = fs.readdirSync(LESSONS_DIR).filter((f) => f.startsWith("lesson-") && f.endsWith(".ts")).sort((a, b) => {
  const na = parseInt(a.match(/lesson-(\d+)/)![1], 10);
  const nb = parseInt(b.match(/lesson-(\d+)/)![1], 10);
  return na - nb;
});

const usage = new Map<string, string[]>(); // figureId -> lesson numbers
const lessonFigCount: { n: number; title: string; figs: string[] }[] = [];

for (const f of files) {
  const src = fs.readFileSync(path.join(LESSONS_DIR, f), "utf8");
  const n = parseInt(f.match(/lesson-(\d+)/)![1], 10);
  const titleMatch = src.match(/title:\s*"([^"]+)"/);
  const figs = [...src.matchAll(/figure:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
  for (const fig of figs) {
    if (!usage.has(fig)) usage.set(fig, []);
    usage.get(fig)!.push(String(n));
  }
  lessonFigCount.push({ n, title: titleMatch ? titleMatch[1] : "?", figs });
}

// Registry entries from diagrams.tsx + figures3d.tsx + every diagrams-m*.tsx
const learnDir = "/home/z/my-project/src/components/learn";
const regFiles = [`${learnDir}/diagrams.tsx`, `${learnDir}/figures3d.tsx`].concat(
  fs.readdirSync(learnDir).filter((f) => /^diagrams-.+\.tsx$/.test(f)).map((f) => `${learnDir}/${f}`),
);
const registry = new Set<string>();
for (const rf of regFiles) {
  const src = fs.readFileSync(rf, "utf8");
  for (const m of src.matchAll(/"([a-z0-9-]+)":\s*[A-Z][A-Za-z0-9]*,/g)) registry.add(m[1]);
}

// FigureId union from types.ts
const typesSrc = fs.readFileSync("/home/z/my-project/src/lib/curriculum/types.ts", "utf8");
const union = new Set<string>();
for (const m of typesSrc.matchAll(/^\s+\| "([a-z0-9-]+)"/gm)) union.add(m[1]);

console.log(`lessons: ${files.length}`);
console.log(`FigureId union: ${union.size}`);
console.log(`registry entries: ${registry.size}`);
console.log(`distinct figures used in lessons: ${usage.size}`);

const unusedUnion = [...union].filter((id) => !usage.has(id));
const usedNotInRegistry = [...usage.keys()].filter((id) => !registry.has(id));
const registryNotUsed = [...registry].filter((id) => !usage.has(id));
const usedNotInUnion = [...usage.keys()].filter((id) => !union.has(id));
console.log(`\n-- in union but never used (${unusedUnion.length}): ${unusedUnion.join(", ")}`);
console.log(`-- used but missing from registry (${usedNotInRegistry.length}): ${usedNotInRegistry.join(", ")}`);
console.log(`-- in registry but never used (${registryNotUsed.length}): ${registryNotUsed.join(", ")}`);
console.log(`-- used but not in union (${usedNotInUnion.length}): ${usedNotInUnion.join(", ")}`);

// per-lesson table grouped in tens
console.log("\n-- per-lesson figure counts --");
for (const l of lessonFigCount) {
  console.log(`L${String(l.n).padStart(2, "0")} figs=${l.figs.length}  ${l.title}  [${l.figs.join(", ")}]`);
}
