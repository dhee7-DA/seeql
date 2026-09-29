import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
import { LESSONS } from "../src/lib/curriculum/lessons";
import { EXPECTED } from "../src/lib/curriculum/expected";

async function main() {
  await resetDatabase();
  let ok = 0, bad = 0;
  for (const l of LESSONS) {
    if (l.num < 58) continue;
    for (const p of l.problems) {
      if (EXPECTED[p.id]) { ok++; continue; }
      try {
        await db.$queryRawUnsafe(p.solution);
        console.log(`NO-EXPECTED-BUT-RUNS: ${p.id}`);
      } catch (e) {
        bad++;
        console.log(`FAIL: ${p.id} (${p.title})`);
        console.log("  " + String(e).split("\n").slice(0, 3).join("\n  "));
      }
    }
  }
  console.log("ok", ok, "bad", bad);
  await db.$disconnect();
}
main();
