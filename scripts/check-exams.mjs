import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, { alias: { "@": "/home/z/my-project/src/" } });
const { MODULES } = await jiti.import("@/lib/curriculum/lessons");
const { buildExam, EXAM_MCQS, EXAM_FILLS, EXAM_PASS } = await jiti.import("@/lib/curriculum/exams");
for (const m of MODULES) {
  if (m.lessons.length === 0) { console.log(`${m.id}: (problems band — no exam)`); continue; }
  const ex = buildExam(m.id, 0);
  if (!ex) { console.log(`${m.id}: NULL`); continue; }
  const mcqs = ex.questions.filter((q) => q.kind === "mcq").length;
  const fills = ex.questions.filter((q) => q.kind === "fill").length;
  const total = ex.questions.length;
  console.log(`${m.id}: ${total} questions (${mcqs} mcq + ${fills} fill) — pass mark ${EXAM_PASS} ${total >= 12 ? "OK" : "⚠ BELOW DESIGNED SIZE"}`);
}
