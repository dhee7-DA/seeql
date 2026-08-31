// Throwaway QA: verify mistake regexes compile and never match their own solution.
import { lesson06 } from "../src/lib/curriculum/lessons/lesson-06";
import { lesson07 } from "../src/lib/curriculum/lessons/lesson-07";
import { lesson08 } from "../src/lib/curriculum/lessons/lesson-08";

function normalizeSql(sql: string): string {
  return sql
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*([(),;])\s*/g, "$1 ")
    .trim();
}

let bad = 0;
for (const lesson of [lesson06, lesson07, lesson08]) {
  for (const p of lesson.problems) {
    const norm = normalizeSql(p.solution);
    for (const m of p.mistakes ?? []) {
      try {
        if (new RegExp(m.test, "i").test(norm)) {
          bad++;
          console.log(`HIT ON OWN SOLUTION: ${p.id} rule /${m.test}/`);
        }
      } catch (e) {
        bad++;
        console.log(`INVALID REGEX: ${p.id} /${m.test}/ -> ${e}`);
      }
    }
    if (!p.hints || p.hints.length !== 2) {
      bad++;
      console.log(`BAD HINTS: ${p.id}`);
    }
    if (!p.hints![1].startsWith("Shape: ")) {
      bad++;
      console.log(`SHAPE PREFIX MISSING: ${p.id}`);
    }
  }
  for (const q of lesson.mcqs) {
    if (!q.notes || q.notes.length !== 1) {
      bad++;
      console.log(`BAD NOTES: ${q.id}`);
    }
    const note = q.notes![0];
    if (note.choice === q.answer) {
      bad++;
      console.log(`NOTE POINTS AT CORRECT ANSWER: ${q.id}`);
    }
    if (note.choice < 0 || note.choice >= q.choices.length) {
      bad++;
      console.log(`NOTE OUT OF RANGE: ${q.id} choice ${note.choice}`);
    }
  }
  if (!lesson.takeaway) {
    bad++;
    console.log(`NO TAKEAWAY: ${lesson.id}`);
  }
}
console.log(bad === 0 ? "ALL CHECKS PASSED" : `FAILURES: ${bad}`);
