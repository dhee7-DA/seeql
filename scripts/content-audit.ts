import { LESSONS } from "../src/lib/curriculum/lessons";
const byModule = new Map<number, { p: number; m: number; figs: number; dial: number }>();
for (const l of LESSONS) {
  const k = l.module;
  const cur = byModule.get(k) ?? { p: 0, m: 0, figs: 0, dial: 0 };
  cur.p += l.problems.length;
  cur.m += l.mcqs.length;
  cur.figs += l.blocks.filter((b) => b.kind === "diagram").length;
  cur.dial += l.blocks.filter((b) => b.kind === "dialect").length;
  byModule.set(k, cur);
  console.log(
    `L${String(l.id).padStart(2, "0")} M${l.module} ${l.title.slice(0, 38).padEnd(38)} probs=${String(l.problems.length).padStart(2)} mcqs=${String(l.mcqs.length).padStart(2)} figs=${l.blocks.filter((b) => b.kind === "diagram").length} dialect=${l.blocks.filter((b) => b.kind === "dialect").length}`
  );
}
console.log("\n=== per module ===");
for (const [m, v] of byModule) console.log(`M${m}: probs=${v.p} mcqs=${v.m} figs=${v.figs} dialect=${v.dial}`);
const tp = LESSONS.reduce((a, l) => a + l.problems.length, 0);
const tm = LESSONS.reduce((a, l) => a + l.mcqs.length, 0);
console.log(`TOTAL probs=${tp} mcqs=${tm}`);
