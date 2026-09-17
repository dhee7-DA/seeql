// Census: M1 MCQ ids + counts + difficulty spread, to lock bank id ranges.
import { LESSONS } from "../src/lib/curriculum/lessons";

const m1 = LESSONS.filter((l) => [1, 2, 3, 4, 5, 6, 7, 8, 35].includes(l.num));
let total = 0;
for (const l of m1) {
  const nums = l.mcqs.map((m) => Number(m.id.match(/-q(\d+)$/)?.[1] ?? NaN));
  const max = Math.max(...nums);
  const gaps: string[] = [];
  for (let i = 1; i <= max; i++) if (!nums.includes(i)) gaps.push(String(i));
  const diff = { easy: 0, medium: 0, hard: 0, unauthored: 0 } as Record<string, number>;
  for (const m of l.mcqs) diff[m.difficulty ?? "unauthored"]++;
  total += l.mcqs.length;
  console.log(
    `${l.id}  count=${l.mcqs.length}  maxQ=${max}  gaps=[${gaps.join(",")}]  diff=${JSON.stringify(diff)}`,
  );
}
console.log("M1 total:", total);
