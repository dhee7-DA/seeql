// One-off census: MCQs, fills, drills, problems, cases across all banks.
import { MODULES } from "../src/lib/curriculum/lessons/index";
import { allFills, fillsFor } from "../src/lib/curriculum/fills/index";
import * as mcqBank01 from "../src/lib/curriculum/mcqs/mcqs-01";
import * as mcqBank02 from "../src/lib/curriculum/mcqs/mcqs-02";
import * as mcqBank03 from "../src/lib/curriculum/mcqs/mcqs-03";
import * as mcqBank04 from "../src/lib/curriculum/mcqs/mcqs-04";
import * as mcqBank05 from "../src/lib/curriculum/mcqs/mcqs-05";
import * as mcqBank06 from "../src/lib/curriculum/mcqs/mcqs-06";
import * as mcqBank07 from "../src/lib/curriculum/mcqs/mcqs-07";
import * as mcqBank08 from "../src/lib/curriculum/mcqs/mcqs-08";
import { DRILL_SETS } from "../src/lib/curriculum/drills/index";

// 1. In-lesson MCQs (inline in each lesson file)
let inlineMcqs = 0;
for (const m of MODULES) for (const l of m.lessons) inlineMcqs += l.mcqs?.length ?? 0;

// 2. Standalone per-lesson MCQ banks (mcqs/mcqs-0X.ts)
const banks: Array<Record<string, unknown[]>> = [
  (mcqBank01 as any).MCQS_BY_LESSON ?? (mcqBank01 as any).mcqsByLesson ?? [],
  (mcqBank02 as any).MCQS_BY_LESSON ?? (mcqBank02 as any).mcqsByLesson ?? [],
  (mcqBank03 as any).MCQS_BY_LESSON ?? (mcqBank03 as any).mcqsByLesson ?? [],
  (mcqBank04 as any).MCQS_BY_LESSON ?? (mcqBank04 as any).mcqsByLesson ?? [],
  (mcqBank05 as any).MCQS_BY_LESSON ?? (mcqBank05 as any).mcqsByLesson ?? [],
  (mcqBank06 as any).MCQS_BY_LESSON ?? (mcqBank06 as any).mcqsByLesson ?? [],
  (mcqBank07 as any).MCQS_BY_LESSON ?? (mcqBank07 as any).mcqsByLesson ?? [],
  (mcqBank08 as any).MCQS_BY_LESSON ?? (mcqBank08 as any).mcqsByLesson ?? [],
];
console.log("bank export keys (file 1):", Object.keys(mcqBank01));

let bankMcqs = 0;
for (const b of banks) {
  for (const arr of Object.values(b)) bankMcqs += Array.isArray(arr) ? arr.length : 0;
}

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
