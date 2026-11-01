import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, { alias: { "@": "/home/z/my-project/src/" } });
const { LESSONS } = await jiti.import("@/lib/curriculum/lessons");
const l9 = LESSONS.find((l) => l.id === "lesson-09");
const q2 = l9.mcqs.find((q) => q.id === "l9-q2");
const q5 = l9.mcqs.find((q) => q.id === "l9-q5");
console.log("l9-q2:", q2.prompt.slice(0, 90));
console.log("l9-q5:", q5.prompt.slice(0, 90));
console.log("identical:", q2.prompt === q5.prompt, "| choices same:", JSON.stringify(q2.choices) === JSON.stringify(q5.choices));
console.log("q2 answer:", q2.choices[q2.answer], "\nq5 answer:", q5.choices[q5.answer]);
// sample the short-prompt MCQs
for (const L of LESSONS) for (const q of L.mcqs) {
  const n = q.prompt.trim().split(/\s+/).length;
  if (n < 5 && ["l29-q3","l30-q5","l59-q1","l61-q46","l62-q14","l63-q5","l64-q23"].includes(q.id)) {
    console.log(`\n${q.id} (${n} words): "${q.prompt}" → choices: ${JSON.stringify(q.choices.slice(0,2))}`);
  }
}
