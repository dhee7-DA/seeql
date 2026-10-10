// One-shot stats: per-lesson fill counts, capstone depth (MCQ/problems/words),
// callout counts — drives the remaining work queue.
import { LESSONS, MODULES } from "../src/lib/curriculum/lessons";
import { fillsFor, allFills } from "../src/lib/curriculum/fills";

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

function lessonWords(blocks: Array<{ kind: string; text?: string; items?: string[]; sql?: string; caption?: string; rows?: string[][]; headers?: string[] }>): number {
  let n = 0;
  for (const b of blocks) {
    if (b.kind === "p" || b.kind === "h") n += words(b.text ?? "");
    else if (b.kind === "bullets" || b.kind === "steps") n += (b.items ?? []).reduce((a, i) => a + words(i), 0);
    else if (b.kind === "code") n += words(b.caption ?? "");
    else if (b.kind === "tip" || b.kind === "warn") n += words(b.text ?? "");
    else if (b.kind === "dialect") n += words(b.text ?? "");
    else if (b.kind === "table") n += (b.rows ?? []).flat().reduce((a: number, c: string) => a + words(String(c)), 0) + (b.headers ?? []).reduce((a, h) => a + words(h), 0);
  }
  return n;
}

function callouts(blocks: Array<{ kind: string }>): number {
  return blocks.filter((b) => b.kind === "tip" || b.kind === "warn" || b.kind === "dialect").length;
}

console.log("== fills per lesson ==");
const counts: Array<[number, number]> = [];
for (const l of LESSONS) {
  const n = fillsFor(l.num).length;
  counts.push([l.num, n]);
}
const bad = counts.filter(([, n]) => n < 4 || n > 6);
console.log(`total ${allFills().length}; per-lesson min ${Math.min(...counts.map(c => c[1]))} max ${Math.max(...counts.map(c => c[1]))}`);
if (bad.length) console.log("out of 4-6 range:", bad.map(([n, c]) => `l${n}=${c}`).join(", "));

console.log("\n== capstones (module-ending case studies) ==");
for (const m of MODULES) {
  const cap = m.lessons[m.lessons.length - 1];
  const w = lessonWords(cap.blocks);
  console.log(`l${cap.num} (${m.id}): mcq=${cap.mcqs.length} problems=${cap.problems.length} proseWords=${w} callouts=${callouts(cap.blocks)}`);
}

console.log("\n== lessons with <3 callouts ==");
const thin = LESSONS.filter((l) => callouts(l.blocks) < 3).map((l) => `l${l.num}(${callouts(l.blocks)})`);
console.log(thin.length ? thin.join(" ") : "none");

console.log("\n== prose-thin lessons (<500 words) ==");
const thinWords = LESSONS.map((l) => ({ n: l.num, w: lessonWords(l.blocks) })).filter((x) => x.w < 500);
console.log(thinWords.map((x) => `l${x.n}=${x.w}`).join(" ") || "none");

console.log("\n== course totals ==");
const totalMcq = LESSONS.reduce((a, l) => a + l.mcqs.length, 0);
const totalProb = LESSONS.reduce((a, l) => a + l.problems.length, 0);
console.log(`lessons=${LESSONS.length} mcq=${totalMcq} fills=${allFills().length} problems=${totalProb} quizTotal=${totalMcq + allFills().length}`);
