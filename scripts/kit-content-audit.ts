// Content audit across all 208 company kits — counts MCQs, theory, cases, problems per kit.
import { COMPANY_KITS } from "../src/lib/companies/registry";

const ids = Object.keys(COMPANY_KITS);
let totMcq = 0, totTheory = 0, totCases = 0, totProb = 0, totTopics = 0;
let minMcq = 999, maxMcq = 0, minTh = 999, maxTh = 0, minCases = 999, maxCases = 0;
const rows: { id: string; mcq: number; theory: number; cases: number; probs: number }[] = [];

for (const id of ids) {
  const kit = COMPANY_KITS[id];
  if (!kit) continue;
  const mcq = kit.mcqs?.length ?? 0;
  const theory = kit.theory?.length ?? 0;
  const cases = kit.cases?.length ?? 0;
  const probs = kit.problems?.length ?? 0;
  const topics = kit.topics?.length ?? 0;
  rows.push({ id: kit.id, mcq, theory, cases, probs });
  totMcq += mcq; totTheory += theory; totCases += cases; totProb += probs; totTopics += topics;
  if (mcq < minMcq) minMcq = mcq; if (mcq > maxMcq) maxMcq = mcq;
  if (theory < minTh) minTh = theory; if (theory > maxTh) maxTh = theory;
  if (cases < minCases) minCases = cases; if (cases > maxCases) maxCases = cases;
}

const diff = { easy: 0, medium: 0, hard: 0 } as Record<string, number>;
for (const id of ids) {
  const kit = COMPANY_KITS[id];
  kit?.mcqs?.forEach((m: any) => { if (diff[m.difficulty] !== undefined) diff[m.difficulty]++; });
}

const sorted = [...rows].sort((a, b) => (b.mcq + b.theory) - (a.mcq + a.theory));
console.log(`kits=${rows.length}`);
console.log(`MCQs: total=${totMcq} per-kit min=${minMcq} max=${maxMcq} avg=${(totMcq / rows.length).toFixed(1)}`);
console.log(`Theory QA: total=${totTheory} per-kit min=${minTh} max=${maxTh} avg=${(totTheory / rows.length).toFixed(1)}`);
console.log(`Case studies: total=${totCases} per-kit min=${minCases} max=${maxCases} avg=${(totCases / rows.length).toFixed(1)}`);
console.log(`Curated problems: total=${totProb} per-kit avg=${(totProb / rows.length).toFixed(1)}`);
console.log(`Topic families: total=${totTopics} avg=${(totTopics / rows.length).toFixed(1)}`);
console.log(`Difficulty mix: ${JSON.stringify(diff)}`);
console.log(`Total practice items (MCQ+theory+cases): ${totMcq + totTheory + totCases}`);
console.log(`--- richest 5 ---`);
sorted.slice(0, 5).forEach(r => console.log(`${r.id}: mcq=${r.mcq} theory=${r.theory} cases=${r.cases} probs=${r.probs}`));
console.log(`--- thinnest 5 ---`);
sorted.slice(-5).forEach(r => console.log(`${r.id}: mcq=${r.mcq} theory=${r.theory} cases=${r.cases} probs=${r.probs}`));

// Distribution histogram by MCQ count
const buckets: Record<number, number> = {};
rows.forEach(r => { buckets[r.mcq] = (buckets[r.mcq] ?? 0) + 1; });
console.log(`--- MCQ-depth distribution (mcq-count: #kits) ---`);
Object.keys(buckets).map(Number).sort((a, b) => a - b).forEach(k => console.log(`${k} MCQs: ${buckets[k]} kits`));
const full = rows.filter(r => r.mcq >= 30).length;
const thin = rows.filter(r => r.mcq <= 12).length;
console.log(`Fully extended (30 MCQ): ${full} kits; baseline/thin (≤12 MCQ): ${thin} kits; mid: ${rows.length - full - thin}`);
