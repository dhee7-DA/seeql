// Diagnose the 3 gen-expected failures: run each solution, print the real error.
import { db } from "../src/lib/db";
import { LESSONS } from "../src/lib/curriculum/lessons";
import { ALL_KEYWORD_BANK_PROBLEMS } from "../src/lib/curriculum/keyword-banks";

async function main() {
  const targets = new Set(["l68-p5", "l72-p5", "kb-ck-p06"]);
  for (const L of LESSONS) {
    for (const p of L.problems) {
      if (!targets.has(p.id)) continue;
      console.log("===", p.id, "| mutating:", !!p.mutating);
      console.log(p.solution.slice(0, 500));
      try {
        const r = (await db.$queryRawUnsafe(p.solution)) as unknown[];
        console.log("rows:", Array.isArray(r) ? r.length : "n/a");
      } catch (e) {
        console.log("ERR:", e instanceof Error ? e.message.slice(0, 500) : String(e));
      }
    }
  }
  for (const p of ALL_KEYWORD_BANK_PROBLEMS) {
    if (p.id !== "kb-ck-p06") continue;
    console.log("=== kb-ck-p06 | mutating:", !!p.mutating);
    console.log(p.solution.slice(0, 500));
    try {
      const r = (await db.$queryRawUnsafe(p.solution)) as unknown[];
      console.log("rows:", Array.isArray(r) ? r.length : "n/a");
    } catch (e) {
      console.log("ERR:", e instanceof Error ? e.message.slice(0, 500) : String(e));
    }
  }
  await db.$disconnect();
}
main();
