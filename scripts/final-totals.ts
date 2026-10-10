import { LESSONS } from "../src/lib/curriculum/lessons";
import { fillsFor } from "../src/lib/curriculum/fills";
let mcq = 0, fill = 0, prob = 0;
for (const l of LESSONS) { mcq += l.mcqs.length; fill += fillsFor(l.num).length; prob += l.problems.length; }
console.log(`lessons=${LESSONS.length} mcq=${mcq} fills=${fill} quiz=${mcq + fill} problems=${prob}`);
const cases = [35, 36, 37, 38, 39, 40, 50, 51];
for (const n of cases) {
  const l = LESSONS.find((x) => x.num === n)!;
  console.log(`l${n}: mcq=${l.mcqs.length} fills=${fillsFor(n).length} probs=${l.problems.length}`);
}
