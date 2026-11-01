import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, { alias: { "@": "/home/z/my-project/src/" } });
const { LESSONS } = await jiti.import("@/lib/curriculum/lessons");
const out = [];
let total = 0, missing = 0;
for (const l of LESSONS.filter(l => l.num >= 58 && l.num <= 63)) {
  const miss = l.problems.filter(p => !p.mistakes || p.mistakes.length === 0);
  total += l.problems.length; missing += miss.length;
  console.log(`lesson-${l.num}: ${l.problems.length} problems, ${miss.length} without mistakes`);
  for (const p of miss) out.push({ lesson: l.num, id: p.id, title: p.title, difficulty: p.difficulty, solution: p.solution });
}
console.log(`TOTAL ${total}, MISSING ${missing}`);
const fs = await import("fs");
fs.writeFileSync("/tmp/m10-needing.json", JSON.stringify(out, null, 1));
console.log("wrote /tmp/m10-needing.json");
