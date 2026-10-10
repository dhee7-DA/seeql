import { mcqsWfA } from "../src/lib/curriculum/windows/mcqs-a";
import { mcqsWfB } from "../src/lib/curriculum/windows/mcqs-b";
const all = [...mcqsWfA, ...mcqsWfB];
const ids = new Set<string>();
const prompts = new Set<string>();
let errs = 0;
for (const q of all) {
  if (ids.has(q.id)) { console.log("dup id", q.id); errs++; }
  ids.add(q.id);
  const p = q.prompt.replace(/\s+/g, " ").trim().toLowerCase();
  if (prompts.has(p)) { console.log("dup prompt", q.id, p.slice(0, 60)); errs++; }
  prompts.add(p);
  if (q.choices.length !== 4) { console.log("choices!=4", q.id); errs++; }
  if (q.answer < 0 || q.answer > 3) { console.log("answer range", q.id); errs++; }
  if (!q.why || q.why.length < 20) { console.log("thin why", q.id); errs++; }
  if (!q.difficulty) { console.log("no difficulty", q.id); errs++; }
}
console.log(`total: ${all.length}, ids ${ids.size}, errs ${errs}`);
process.exit(errs ? 1 : 0);
