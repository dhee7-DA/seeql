// One-off census: MCQs, fills, drills, problems across the live banks.
// (The standalone mcqs/mcqs-0X.ts files are stale pre-rebuild duplicates —
// zero importers, ids colliding with lesson-inline MCQs — and are excluded
// from the type-checked program via tsconfig.)
import { MODULES } from "../src/lib/curriculum/lessons/index";
import { allFills, fillsFor } from "../src/lib/curriculum/fills/index";
import { DRILL_SETS } from "../src/lib/curriculum/drills/index";

// 1. In-lesson MCQs (inline in each lesson file)
let inlineMcqs = 0;
for (const m of MODULES) for (const l of m.lessons) inlineMcqs += l.mcqs?.length ?? 0;

// 2. Standalone per-lesson MCQ banks (mcqs/mcqs-0X.ts) — stale orphans,
// counted as zero.
const bankMcqs = 0;

// 3. Fill-in-the-blank
const fills = allFills();
let fillLessons = 0;
for (let n = 1; n <= 57; n++) if (fillsFor(n).length > 0) fillLessons++;

// 4. Drill-yard keyword drills
let drills = 0;
for (const s of DRILL_SETS) drills += s.questions.length;

// 5. Problems + cases
let problems = 0;
for (const m of MODULES) for (const l of m.lessons) problems += l.problems?.length ?? 0;

console.log(`inline lesson MCQs:        ${inlineMcqs}`);
console.log(`bank MCQs (mcqs/0X):       ${bankMcqs}`);
console.log(`fills (fill-in-the-blank): ${fills.length} across ${fillLessons} lessons`);
console.log(`drill-yard DrillQ:         ${drills}`);
console.log(`hands-on problems:         ${problems}`);
