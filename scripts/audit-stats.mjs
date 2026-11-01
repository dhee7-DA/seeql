import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, { alias: { "@": "/home/z/my-project/src/" } });
const { LESSONS, MODULES } = await jiti.import("@/lib/curriculum/lessons");
const words = (s) => String(s ?? "").split(/\s+/).filter(Boolean).length;
const blockW = (blocks) => (blocks ?? []).reduce((a, b) => {
  if (b.text) a += words(b.text);
  if (b.myth) a += words(b.myth); if (b.truth) a += words(b.truth);
  if (b.items) a += b.items.reduce((x, i) => x + words(i), 0);
  if (b.steps) a += b.steps.reduce((x, i) => x + words(i), 0);
  if (b.rows) a += b.rows.flat().reduce((x, c) => x + words(c), 0);
  return a;
}, 0);
let totalW = 0, totalMcq = 0, totalProb = 0, noMistakes = 0;
const perMod = {};
for (const M of MODULES) {
  if (!M.lessons.length) continue;
  let w = 0, q = 0, p = 0;
  for (const L of M.lessons) {
    const lw = blockW(L.blocks) + blockW(L.deep);
    w += lw; q += L.mcqs.length; p += L.problems.length;
    totalW += lw; totalMcq += L.mcqs.length; totalProb += L.problems.length;
    noMistakes += L.problems.filter((pr) => !pr.mistakes?.length).length;
  }
  perMod[M.num] = `${M.title}: ${w}w / ${q}q / ${p}p`;
}
for (const [n, s] of Object.entries(perMod)) console.log(`M${n} ${s}`);
console.log(`TOTAL: ${totalW} theory words | ${totalMcq} mcqs | ${totalProb} problems | problems without mistake-coaching: ${noMistakes}`);
// duplicate titles check
const t = LESSONS.map((l) => l.title);
console.log("duplicate titles:", t.length - new Set(t).size);
