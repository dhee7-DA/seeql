// M1 (Foundations) per-lesson census: topics, prose words, callouts, practice counts.
import { MODULES } from "../src/lib/curriculum/lessons";
import { fillsFor } from "../src/lib/curriculum/fills";

const m1 = MODULES.find((m) => m.num === 1)!;
let words = (s: string) => s.split(/\s+/).filter(Boolean).length;

console.log(`MODULE 1 — "${m1.title}" (level: ${m1.level}) — ${m1.lessons.length} lessons\n`);
for (const l of m1.lessons) {
  let prose = 0, callouts = 0, diagrams = 0, tables = 0, code = 0, bullets = 0;
  for (const b of l.blocks) {
    if (b.kind === "p" || b.kind === "h") prose += words(b.text);
    else if (b.kind === "tip" || b.kind === "warn" || b.kind === "dialect") { callouts++; prose += words(b.text); }
    else if (b.kind === "diagram") diagrams++;
    else if (b.kind === "table") tables++;
    else if (b.kind === "code") code++;
    else if (b.kind === "bullets" || b.kind === "steps") { bullets++; prose += b.items.join(" ").split(/\s+/).filter(Boolean).length; }
  }
  const stars = l.problems.filter((p) => p.difficulty === "hard").length;
  console.log(
    `L${String(l.num).padStart(2)} ${l.title.slice(0, 42).padEnd(42)} ${l.minutes}min | prose ${String(prose).padStart(3)}w | blocks ${String(l.blocks.length).padStart(2)} (co ${callouts} dg ${diagrams} tb ${tables} code ${code} li ${bullets}) | MCQ ${String(l.mcqs.length).padStart(2)} | fills ${fillsFor(l.num).length} | probs ${String(l.problems.length).padStart(2)} (hard ${stars.length})`
  );
}
