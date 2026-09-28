// Roadmap gate-math verification — synthetic progress, no browser needed.
// Verifies: data integrity (every roadmap item resolves), sprintStats
// census, fresh-profile gating, full-day completion advancing the gate,
// exam + drills item logic, and the day summaries.
import {
  ROADMAP,
  currentDayIndex,
  dayComplete,
  dayMinutes,
  daySummary,
  itemDone,
  lessonById,
  lessonDone,
  moduleById,
  casesForLessonNum,
  sprintCleared,
  sprintStats,
  type ProgSlice,
} from "../src/lib/curriculum/roadmap";
import { CASES } from "../src/lib/curriculum/cases";

let fails = 0;
function ok(cond: boolean, label: string) {
  if (!cond) {
    fails++;
    console.log(`FAIL — ${label}`);
  } else {
    console.log(`ok — ${label}`);
  }
}

// ---- 1. data integrity: every item resolves -----------------------------
let unresolved = 0;
for (const d of ROADMAP) {
  for (const item of d.items) {
    if (item.kind === "lesson" && !lessonById(item.lessonId)) unresolved++;
    if (item.kind === "exam" && !moduleById(item.moduleId)) unresolved++;
  }
}
ok(unresolved === 0, `all roadmap items resolve (${ROADMAP.length} days)`);
ok(ROADMAP.length === 31, "exactly 31 days");
const allLessons = ROADMAP.flatMap((d) => d.items).filter((i) => i.kind === "lesson");
ok(allLessons.length === 64, `64 lesson items on the plan (${allLessons.length})`);
const seen = new Set(allLessons.map((i) => (i.kind === "lesson" ? i.lessonId : "")));
ok(seen.size === 64, "no lesson repeated across days");

// ---- 2. census ------------------------------------------------------------
const s = sprintStats();
console.log(`stats: days=${s.days} lessons=${s.lessons} mcqs=${s.mcqs} queries=${s.queries} exams=${s.exams} fills=${s.fills} caseFiles=${s.caseFiles} drills=${s.drills} minutes=${s.minutes} (~${Math.round(s.minutes / 60)}h)`);
ok(s.days === 31 && s.lessons === 64 && s.mcqs === 943 && s.queries === 755, "census lessons/mcqs/queries");
ok(s.exams === 11 && s.caseFiles === CASES.length && s.drills === 2695, "census exams/cases/drills");
ok(s.minutes > 0, `plan minutes ${s.minutes}`);

// ---- 3. fresh profile -----------------------------------------------------
const empty: ProgSlice = { xpEvents: {}, mcqAttempts: {}, exams: {} };
ok(currentDayIndex(empty) === 0, "fresh profile lands on Day 1");
ok(!dayComplete(ROADMAP[0], empty), "day 1 not complete on fresh profile");
ok(!sprintCleared(empty), "sprint not cleared on fresh profile");
ok(dayLocked0(empty, 1), "day 2 locked on fresh profile");

function dayLocked0(prog: ProgSlice, idx: number): boolean {
  // local re-impl to avoid importing dayLocked (kept in module for UI)
  return idx > currentDayIndex(prog);
}

// ---- 4. complete Day 1 synthetically --------------------------------------
function progForLessons(nums: number[]): ProgSlice {
  const xp: Record<string, number> = {};
  const mcq: Record<string, { correct: boolean; firstTry: boolean }> = {};
  for (const num of nums) {
    const l = lessonById(`lesson-${String(num).padStart(2, "0")}`)!;
    xp[`lesson:${l.id}`] = 50;
    for (const m of l.mcqs) mcq[m.id] = { correct: true, firstTry: true };
    for (const p of l.problems) xp[`solve:${p.id}`] = 10;
    for (const c of casesForLessonNum(num)) xp[`case:${c.id}`] = 10;
  }
  return { xpEvents: xp, mcqAttempts: mcq, exams: {} };
}

const day1 = progForLessons([1, 2, 3]);
ok(dayComplete(ROADMAP[0], day1), "day 1 completes with all its work done");
ok(currentDayIndex(day1) === 1, "gate advances to Day 2 after Day 1");
// but day 2 needs its own work
ok(!dayComplete(ROADMAP[1], day1), "day 2 still incomplete");
// partial day 1 (missing cases) must NOT pass
const xpOnly: ProgSlice = {
  xpEvents: { ...day1.xpEvents },
  mcqAttempts: day1.mcqAttempts,
  exams: {},
};
{
  const l1 = lessonById("lesson-01")!;
  const stripped = { ...xpOnly.xpEvents };
  for (const c of casesForLessonNum(1)) delete stripped[`case:${c.id}`];
  ok(!lessonDone(l1, { xpEvents: stripped, mcqAttempts: xpOnly.mcqAttempts, exams: {} }), "lesson with unsolved cases is not done");
}

// ---- 5. exam + drills items ------------------------------------------------
ok(!itemDone({ kind: "exam", moduleId: "foundations" }, empty), "exam item not done without a pass");
ok(
  itemDone({ kind: "exam", moduleId: "foundations" }, { xpEvents: {}, mcqAttempts: {}, exams: { foundations: { attempts: 1, best: 12, total: 12, passedAt: 1 } } }),
  "exam item done after a pass",
);
ok(!itemDone({ kind: "drills" }, empty), "drills item not done on empty ledger");
ok(!itemDone({ kind: "drills" }, day1), "drills item not done even with lessons done");

// ---- 6. day summaries -------------------------------------------------------
const d3 = daySummary(ROADMAP[2]);
console.log(`day 3: ${d3.lessons} lessons · ${d3.mcqs} quiz · ${d3.queries} queries · ${d3.cases} cases · ${d3.exams} exam`);
ok(d3.lessons === 3 && d3.exams === 1 && d3.cases > 0, "day 3 summary (3 lessons + exam)");
const d29 = daySummary(ROADMAP[28]);
ok(d29.exams === 1 && d29.lessons === 0, "day 29 is the exam-only day");
const d30 = daySummary(ROADMAP[29]);
ok(d30.lessons === 1 && d30.exams === 1, "day 30 is the performance lesson + module exam");
const d31 = daySummary(ROADMAP[30]);
ok(d31.drills && d31.lessons === 0, "day 31 is the drills clearing house");
console.log(`day minutes: 1=${dayMinutes(ROADMAP[0])} 23=${dayMinutes(ROADMAP[22])} 30=${dayMinutes(ROADMAP[29])} 31=${dayMinutes(ROADMAP[30])}`);

console.log(fails === 0 ? "\nALL GATE CHECKS PASS" : `\n${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);
