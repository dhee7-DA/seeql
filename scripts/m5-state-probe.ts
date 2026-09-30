import { overPartitionBank, rowNumberBank, ntileBank, firstLastValueBank, percentRankBank, runningTotalsBank, textFunctionsBank, castTypesBank, mathRoundingBank } from "../src/lib/curriculum/keyword-banks/window-banks";
import { m05Mcqs } from "../src/lib/curriculum/gauntlet/m05-mcqs";

const banks: Record<string, { mcqs: number; cases: number; problems: number }> = {
  OVER: { mcqs: overPartitionBank.mcqs.length, cases: overPartitionBank.cases.length, problems: overPartitionBank.problems.length },
  RN: { mcqs: rowNumberBank.mcqs.length, cases: rowNumberBank.cases.length, problems: rowNumberBank.problems.length },
  NT: { mcqs: ntileBank.mcqs.length, cases: ntileBank.cases.length, problems: ntileBank.problems.length },
  FV: { mcqs: firstLastValueBank.mcqs.length, cases: firstLastValueBank.cases.length, problems: firstLastValueBank.problems.length },
  PR: { mcqs: percentRankBank.mcqs.length, cases: percentRankBank.cases.length, problems: percentRankBank.problems.length },
  RT: { mcqs: runningTotalsBank.mcqs.length, cases: runningTotalsBank.cases.length, problems: runningTotalsBank.problems.length },
  TX: { mcqs: textFunctionsBank.mcqs.length, cases: textFunctionsBank.cases.length, problems: textFunctionsBank.problems.length },
  CT: { mcqs: castTypesBank.mcqs.length, cases: castTypesBank.cases.length, problems: castTypesBank.problems.length },
  MR: { mcqs: mathRoundingBank.mcqs.length, cases: mathRoundingBank.cases.length, problems: mathRoundingBank.problems.length },
};
for (const [k, v] of Object.entries(banks)) console.log(k.padEnd(4), JSON.stringify(v));
console.log("m05 gauntlet MCQs:", m05Mcqs.length);
const tiers = m05Mcqs.reduce<Record<string, number>>((a, q) => { const d = String(q.difficulty); a[d] = (a[d] ?? 0) + 1; return a; }, {});
console.log("m05 tiers:", JSON.stringify(tiers));
const ids = m05Mcqs.map(q => q.id);
console.log("m05 id range:", ids[0], "..", ids[ids.length - 1], "unique:", new Set(ids).size === ids.length);
