// Compact survey of case-study lessons: blocks, mcq prompts, problem titles.
import { MODULES } from "../src/lib/curriculum/lessons/index";
import { fillsFor } from "../src/lib/curriculum/fills";

const NUMS = [37, 38, 39, 40, 50, 51];
const all = MODULES.flatMap((m) => m.lessons);
for (const n of NUMS) {
  const l = all.find((x) => x.num === n)!;
  console.log(`\n########## l${n} — ${l.title} (min ${l.minutes}) ##########`);
  console.log(`blurb: ${l.blurb}`);
  for (const b of l.blocks) {
    if (b.kind === "p") console.log(`  [p] ${b.text.slice(0, 130)}`);
    else if (b.kind === "h") console.log(`  [h] ${b.text}`);
    else if (b.kind === "bullets") console.log(`  [bullets] ${b.items.length} items: ${b.items[0].slice(0, 90)}`);
    else if (b.kind === "steps") console.log(`  [steps] ${b.items.length} items: ${b.items[0].slice(0, 90)}`);
    else if (b.kind === "code") console.log(`  [code] ${b.sql.slice(0, 90).replace(/\n/g, " | ")}`);
    else if (b.kind === "table") console.log(`  [table] ${b.rows.length} rows (${b.headers.join("/")})`);
    else if (b.kind === "diagram") console.log(`  [fig] ${b.figure}`);
    else console.log(`  [${b.kind}] ${b.text.slice(0, 110)}`);
  }
  for (const q of l.mcqs) console.log(`  MCQ ${q.id}: ${q.prompt.slice(0, 110)}`);
  for (const f of fillsFor(l.num)) console.log(`  FILL ${f.id}: ${f.brief.slice(0, 100)} | T: ${f.template.slice(0, 90).replace(/\n/g, " ")}`);
  for (const p of l.problems) console.log(`  PROB ${p.id} (${p.difficulty}): ${p.title} — ${p.brief.slice(0, 100)}`);
  console.log(`  TAKEAWAY: ${(l.takeaway ?? "").slice(0, 120)}`);
}
