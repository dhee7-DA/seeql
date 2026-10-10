import { mcqsWfB } from "../src/lib/curriculum/windows/mcqs-b";
const seen = new Map<string, number>();
let dup = "";
for (const q of mcqsWfB) {
  const p = q.prompt.replace(/\s+/g, " ").trim().toLowerCase();
  if (seen.has(p)) dup = `DUP ${seen.get(p)} ${q.id}: ${p}`;
  seen.set(p, 1);
}
console.log(dup || "no dups");
// print ids and exact prompts containing 'disappear'
for (const q of mcqsWfB) if (q.prompt.toLowerCase().includes("disappear")) console.log(q.id, q.prompt.slice(0, 70));
