// Build a zustand-persist localStorage payload where Day 1 (lessons 1-3) is
// fully complete — lesson XP, all MCQs correct, all problems + cases solved.
// Printed as a single JSON string for agent-browser storage injection.
import { lessonById, casesForLessonNum } from "../src/lib/curriculum/roadmap";

const xp: Record<string, number> = {};
const mcq: Record<string, { correct: boolean; firstTry: boolean }> = {};
for (const num of [1, 2, 3]) {
  const l = lessonById(`lesson-${String(num).padStart(2, "0")}`)!;
  xp[`lesson:${l.id}`] = 50;
  for (const m of l.mcqs) mcq[m.id] = { correct: true, firstTry: true };
  for (const p of l.problems) xp[`solve:${p.id}`] = 10;
  for (const c of casesForLessonNum(num)) xp[`case:${c.id}`] = 10;
}
// a wrong answer somewhere, to prove the ledger tolerates noise
mcq["noise"] = { correct: false, firstTry: false };

const payload = {
  state: {
    xpEvents: xp,
    xpByDay: {},
    dailyGoal: 60,
    badges: {},
    mcqAttempts: mcq,
    lessonsDone: {},
    skillAttempts: {},
    reviewSchedule: {},
    review: {},
    reviewCorrect: 0,
    reviewWrong: 0,
    exams: {},
    mcqBest: {},
    questDone: {},
    puzzleDone: {},
    backlogDone: {},
    freezes: 1,
  },
  version: 0,
};
process.stdout.write(JSON.stringify(payload));
