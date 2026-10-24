// Verify the audit's empty-expected problems: run each solution on the live
// seeded db (same machinery as gen-expected.ts) and count rows.
// Run: bunx tsx scripts/lc-probe-empty-expected.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
import { LESSONS } from "../src/lib/curriculum/lessons";

const targets = new Set(["l26-p5", "l57-p6", "l59-p11", "l59-p33", "l62-p41"]);

async function main() {
  await resetDatabase();
  for (const lesson of LESSONS) {
    for (const p of lesson.problems) {
      if (!targets.has(p.id)) continue;
      const cols = p.expected.columns?.length ?? 0;
      const rows = p.expected.rows?.length ?? 0;
      let live = "ERR";
      let liveRows: Array<Record<string, unknown>> = [];
      try {
        liveRows = (await db.$queryRawUnsafe(p.solution.replace(/;\s*$/, ""))) as Array<
          Record<string, unknown>
        >;
        live = `${liveRows.length} rows`;
      } catch (e) {
        live = `ERR ${(e as Error).message.slice(0, 90)}`;
      }
      console.log(
        `${p.id} [L${lesson.num}] expected: ${cols} cols / ${rows} rows · live: ${live} · mutating=${!!p.mutating}`,
      );
      if (liveRows.length > 0 && rows === 0) {
        console.log(`   sample live: ${JSON.stringify(liveRows[0]).slice(0, 140)}`);
        console.log(`   solution: ${p.solution.replace(/\s+/g, " ").slice(0, 120)}`);
      }
    }
  }
  await db.$disconnect();
}
void main();
