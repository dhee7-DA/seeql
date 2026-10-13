// Census: which sections have study guides, which don't.
import { SQL50_SECTIONS, DATAFIN_SECTIONS } from "../src/lib/leetcode/sections";

const all = [...SQL50_SECTIONS, ...DATAFIN_SECTIONS];
const withStudy = all.filter((s: any) => s.study);
const without = all.filter((s: any) => !s.study);

console.log(`total sections: ${all.length}`);
console.log(`with study: ${withStudy.length}`);
console.log(`without study: ${without.length}`);
console.log("\n--- WITHOUT STUDY ---");
for (const s of without) {
  console.log(`${s.id}  |  ${s.title}  |  ${s.slugs.length} problems`);
}
console.log("\n--- WITH STUDY (for reference) ---");
for (const s of withStudy) {
  console.log(`${s.id}  |  ${s.title}`);
}
