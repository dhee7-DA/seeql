// Sprint day-plan design aid: per-lesson mcq/problem/case/minutes totals.
import { LESSONS } from "../src/lib/curriculum/lessons";
import { CASES, CASE_TOPICS } from "../src/lib/curriculum/cases";
import { DRILL_SETS } from "../src/lib/curriculum/drills";

const casesByLesson = new Map<number, number>();
for (const c of CASES) {
  const ln = CASE_TOPICS.find((t) => t.id === c.topic)?.lessonNum;
  if (ln != null) casesByLesson.set(ln, (casesByLesson.get(ln) ?? 0) + 1);
}

let tm = 0, tq = 0, tc = 0;
console.log("num | id | minutes | mcqs | problems | cases | title");
for (const l of LESSONS) {
  const cases = casesByLesson.get(l.num) ?? 0;
  tm += l.mcqs.length; tq += l.problems.length; tc += cases;
  console.log(`${l.num} | ${l.id} | ${l.minutes} | ${l.mcqs.length} | ${l.problems.length} | ${cases} | ${l.title}`);
}
const drills = DRILL_SETS.reduce((a, s) => a + s.questions.length, 0);
console.log(`\nTOTALS mcqs=${tm} queries=${tq} cases=${tc} drills=${drills} lessons=${LESSONS.length}`);
console.log(`unmapped cases (topic lessonNum=null): ${CASES.length - tc}`);
