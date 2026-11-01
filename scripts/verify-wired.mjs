import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, { alias: { "@": "/home/z/my-project/src/" } });
const { LESSONS, MODULES } = await jiti.import("@/lib/curriculum/lessons");
const { buildExam } = await jiti.import("@/lib/curriculum/exams");
const total = LESSONS.reduce((a, l) => a + l.mcqs.length, 0);
console.log("total mcqs now:", total, "(was 951)");
for (const n of [1, 2, 8, 35]) {
  const L = LESSONS.find((l) => l.num === n);
  console.log(`lesson-${n}: ${L.mcqs.length} mcqs`);
}
// unique id check across everything
const ids = new Set(); let dup = 0;
for (const L of LESSONS) for (const q of L.mcqs) { if (ids.has(q.id)) dup++; ids.add(q.id); }
console.log("duplicate mcq ids:", dup);
// exams still build
const ex = buildExam("foundations", 0);
console.log("foundations exam still builds:", ex.questions.length, "questions");
