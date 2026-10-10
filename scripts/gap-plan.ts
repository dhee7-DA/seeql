// Gap plan: enumerate every lesson, count diagram blocks, and for the
// diagram-less case-study lessons dump the problem set + verified EXPECTED
// result rows so the new figures can be designed against real data.
import { MODULES } from "../src/lib/curriculum/lessons/index";
import { EXPECTED } from "../src/lib/curriculum/expected";

const rows: string[] = [];
let withFig = 0, withoutFig = 0, totalFigs = 0;

for (const m of MODULES) {
  for (const l of m.lessons) {
    const blocks = l.blocks ?? [];
    const figs = blocks.filter((b: { kind: string }) => b.kind === "diagram");
    totalFigs += figs.length;
    if (figs.length > 0) withFig += 1;
    else withoutFig += 1;
    rows.push(
      `M${m.num} L${String(l.num).padStart(2)} figs=${figs.length} ${l.title}`
    );
  }
}
console.log("== ALL LESSONS ==");
console.log(rows.join("\n"));
console.log(
  `\nlessons=${withFig + withoutFig}  withFig=${withFig}  diagramLess=${withoutFig}  diagramBlocksTotal=${totalFigs}`
);

console.log("\n== DIAGRAM-LESS CASE LESSONS: problem sets + verified EXPECTED ==");
for (const m of MODULES) {
  for (const l of m.lessons) {
    const blocks = l.blocks ?? [];
    const figs = blocks.filter((b: { kind: string }) => b.kind === "diagram");
    if (figs.length > 0) continue;
    console.log(`\n### M${m.num} L${l.num} — ${l.title}`);
    console.log(`blurb: ${l.blurb}`);
    for (const p of l.problems ?? []) {
      console.log(`  ${p.id} [${p.difficulty}] ${p.title}`);
      console.log(`    brief: ${p.brief.replace(/\*\*/g, "").slice(0, 110)}`);
      const exp = (EXPECTED as Record<string, { columns: string[]; rows: unknown[][] }>)[p.id];
      if (exp) {
        console.log(`    columns: ${exp.columns.join(", ")}`);
        const shown = exp.rows.slice(0, 8);
        for (const r of shown) console.log(`      ${JSON.stringify(r)}`);
        if (exp.rows.length > 8) console.log(`      … +${exp.rows.length - 8} more rows (total ${exp.rows.length})`);
      } else {
        console.log(`    EXPECTED: — (single-value or missing)`);
      }
    }
    console.log(`  takeaway: ${(l.takeaway ?? "").slice(0, 160)}`);
  }
}
