// E2E helper — extracts MCQ answers + problem solutions from the curriculum
// so the browser test can answer correctly without guessing.
// Output: scripts/e2e-answers.json  { byPromptHash: {hash: answer}, lessons: {...}, solutions: {title: sql} }
import { LESSONS } from "../src/lib/curriculum/lessons";
import { writeFileSync } from "fs";

export function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const byPromptHash: Record<string, number> = {};
const lessons: Record<string, { answers: number[]; count: number }> = {};
const solutions: Record<string, string> = {};

for (const l of LESSONS) {
  lessons[l.id] = { answers: l.mcqs.map((m) => m.answer), count: l.mcqs.length };
  for (const m of l.mcqs) {
    byPromptHash[norm(m.prompt).slice(0, 48)] = m.answer;
  }
  for (const p of l.problems) {
    solutions[p.title] = p.solution;
  }
}

writeFileSync(
  new URL("./e2e-answers.json", import.meta.url),
  JSON.stringify({ byPromptHash, lessons, solutions }),
);
console.log("lessons:", LESSONS.length, "| mcqs:", Object.keys(byPromptHash).length, "| problems:", Object.keys(solutions).length);
