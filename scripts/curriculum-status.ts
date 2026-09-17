// Curriculum completeness snapshot: lessons, MCQs, problems, case studies per module
import { MODULES } from "../src/lib/curriculum/lessons/index";

let tL = 0, tQ = 0, tP = 0, tC = 0, tMin = 0;
const rows: string[] = [];

for (const m of MODULES) {
  const lessons = m.lessons;
  const n = lessons.length;
  let q = 0, p = 0, c = 0, min = 0;
  for (const l of lessons) {
    q += l.mcqs?.length ?? 0;
    p += l.problems?.length ?? 0;
    min += l.minutes ?? 0;
    if (/case study/i.test(l.title)) c += 1;
  }
  tL += n; tQ += q; tP += p; tC += c; tMin += min;
  rows.push(
    `M${m.num}  ${m.title.padEnd(30)} ${m.level.padEnd(12)} lessons=${String(n).padStart(2)}  mcqs=${String(q).padStart(3)}  problems=${String(p).padStart(3)}  caseStudies=${c}  min=${min}`
  );
}

console.log(rows.join("\n"));
console.log("-".repeat(110));
console.log(
  `TOTAL: modules=${MODULES.length}  lessons=${tL}  mcqs=${tQ}  problems=${tP}  caseStudies=${tC}  readingTime=${tMin} min`
);

console.log("\n=== FULL TOPIC MAP ===");
for (const m of MODULES) {
  console.log(`M${m.num} ${m.title} [${m.level}]`);
  for (const l of m.lessons) {
    const tag = /case study/i.test(l.title) ? " ★" : "";
    console.log(`   ${String(l.num).padStart(2)}. ${l.title}${tag}`);
  }
}
