// Print the `blocks` arrays of M2 lessons 11-16 (teaching content only).
import { LESSONS } from "../src/lib/curriculum/lessons/index";

for (const id of ["lesson-11","lesson-12","lesson-13","lesson-14","lesson-15","lesson-16"]) {
  const l = LESSONS.find((x) => x.id === id)!;
  console.log(`\n############ ${l.id} · ${l.title} ############`);
  for (const b of l.blocks) {
    if (b.kind === "p") console.log(`P: ${b.text}`);
    else if (b.kind === "h") console.log(`\n## H: ${b.text}`);
    else if (b.kind === "bullets") b.items.forEach((i) => console.log(`  • ${i}`));
    else if (b.kind === "steps") b.items.forEach((i, n) => console.log(`  ${n + 1}. ${i}`));
    else if (b.kind === "code") console.log(`CODE${b.runnable ? "*" : ""} [${b.caption ?? ""}]\n${b.sql}`);
    else if (b.kind === "tip") console.log(`TIP: ${b.text}`);
    else if (b.kind === "warn") console.log(`WARN: ${b.text}`);
    else if (b.kind === "dialect") console.log(`DIALECT(${b.db}): ${b.text}`);
    else if (b.kind === "diagram") console.log(`FIG: ${b.figure}`);
    else if (b.kind === "table") { console.log(`TABLE: ${b.headers.join(" | ")}`); b.rows.forEach((r) => console.log(`   ${r.join(" | ")}`)); }
  }
}
