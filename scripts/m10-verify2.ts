import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
import { LESSONS } from "../src/lib/curriculum/lessons";
import { EXPECTED } from "../src/lib/curriculum/expected";

async function main() {
  await resetDatabase();
  for (const l of LESSONS) {
    if (l.num < 58) continue;
    for (const p of l.problems) {
      if (EXPECTED[p.id]) continue;
      try {
        await db.$queryRawUnsafe(p.solution);
        console.log(`RUNS-WITHOUT-EXPECTED: ${p.id}`);
      } catch (e: unknown) {
        const m = String((e as Error).message);
        const hit = m.match(/Message: `([^`]+)`/);
        console.log(`FAIL ${p.id} :: ${hit ? hit[1] : m.slice(0, 120)}`);
      }
    }
  }
  await db.$disconnect();
}
main();
