// Full content listing across all topics: modules → lessons → per-lesson counts,
// plus the practice-layer banks (drills, golf, predicts, interview, studio).
import { MODULES } from "../src/lib/curriculum/lessons/index";
import { fillsFor } from "../src/lib/curriculum/fills/index";
import { DRILL_SETS } from "../src/lib/curriculum/drills/index";
import { GOLF_HOLES } from "../src/lib/curriculum/golf";
import { PREDICTS } from "../src/lib/curriculum/predicts";
import { INTERVIEW_RUNGS } from "../src/lib/curriculum/interview";
import { STUDIO_ITEMS } from "../src/lib/curriculum/schema-drills";

const isCaseStudy = (n: number) => [35, 36, 37, 38, 39, 40, 50, 51].includes(n);

let totMcq = 0, totFill = 0, totProb = 0, totMin = 0;

for (const m of MODULES) {
  const mcq = m.lessons.reduce((a, l) => a + (l.mcqs?.length ?? 0), 0);
  const fil = m.lessons.reduce((a, l) => a + fillsFor(l.num).length, 0);
  const prob = m.lessons.reduce((a, l) => a + (l.problems?.length ?? 0), 0);
  const min = m.lessons.reduce((a, l) => a + (l.minutes ?? 0), 0);
  totMcq += mcq; totFill += fil; totProb += prob; totMin += min;
  console.log(`\n== Module ${m.num} · ${m.title}  [${m.level}] — ${m.lessons.length} lessons, ~${min} min, ${mcq} mcq / ${fil} fills / ${prob} problems`);
  for (const l of m.lessons) {
    const cs = isCaseStudy(l.num) ? "  ◆ CASE STUDY" : "";
    const deep = l.deep?.length ? ` · deep-dive(${l.deep.length})` : "";
    console.log(
      `   L${String(l.num).padStart(2, "0")}  ${l.title}` +
      `  — ${l.minutes} min · ${l.mcqs?.length ?? 0} mcq · ${fillsFor(l.num).length} fills · ${l.problems?.length ?? 0} problems${deep}${cs}`,
    );
  }
}

console.log(`\n== Drill Yard — ${DRILL_SETS.length} keyword sets, ${DRILL_SETS.reduce((a, s) => a + s.questions.length, 0)} questions`);
let prevMod = 0;
for (const s of DRILL_SETS) {
  if (s.module !== prevMod) { console.log(`   -- Module ${s.module} --`); prevMod = s.module; }
  console.log(`   [${s.tier}] ${s.label} — ${s.questions.length}q`);
}

console.log(`\n== Other practice banks`);
console.log(`   Golf holes:            ${GOLF_HOLES.length}`);
for (const h of GOLF_HOLES) console.log(`     • ${h.id ?? ""} ${h.title ?? h.name ?? ""}`);
console.log(`   Predict-the-output:    ${PREDICTS.length}`);
console.log(`   Interview rungs:       ${INTERVIEW_RUNGS.length}`);
console.log(`   Schema studio items:   ${STUDIO_ITEMS.length}`);

console.log(`\n== TOTALS`);
console.log(`   lessons: ${MODULES.reduce((a, m) => a + m.lessons.length, 0)} · minutes: ${totMin}`);
console.log(`   mcqs ${totMcq} · fills ${totFill} · problems ${totProb} · drills ${DRILL_SETS.reduce((a, s) => a + s.questions.length, 0)}`);
