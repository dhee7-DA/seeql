// Verify every boss follow-up spec: apply the mutation, run the mutated SQL
// against the dive's seed, and report row counts (a mutant that errors or
// returns nothing would make the gauntlet push ungradeable).
// Run: bunx tsx scripts/lc-boss-fu-verify.ts
import { db } from "../src/lib/db";
import { SQL_BOSS_A } from "../src/lib/leetcode/content/sql-boss-a";
import { SQL_BOSS_B } from "../src/lib/leetcode/content/sql-boss-b";
import { FU_SPECS } from "../src/lib/leetcode/followup-specs";
import { applyFuSpec } from "../src/lib/leetcode/followups";

async function main() {
  for (const dive of [...SQL_BOSS_A, ...SQL_BOSS_B]) {
    const specs = FU_SPECS[dive.slug] ?? [];
    console.log(`\n=== ${dive.slug} (${specs.length} pushes) ===`);
    for (const spec of specs) {
      const sql = applyFuSpec(dive, spec);
      if (!sql) {
        console.log(`  ${spec.kind}: MUTATION PRODUCED NULL`);
        continue;
      }
      let n = -1;
      try {
        await db.$transaction(async (tx: {
          $executeRawUnsafe: (s: string) => Promise<unknown>;
          $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>>;
        }) => {
          const clean = (s: string) =>
            s.split("\n").map((l) => l.replace(/--.*$/, "")).join("\n");
          for (const stmt of clean(dive.schema.ddl).split(/;\s*\n/))
            if (stmt.trim()) await tx.$executeRawUnsafe(stmt.trim() + ";");
          for (const stmt of clean(dive.schema.seed).split(/;\s*\n/))
            if (stmt.trim()) await tx.$executeRawUnsafe(stmt.trim() + ";");
          n = ((await tx.$queryRawUnsafe(sql)) as unknown[]).length;
          throw new Error("__rollback__");
        });
      } catch (e) {
        if (!(e as Error).message.includes("__rollback__")) {
          console.log(`  ${spec.kind}: RUN ERROR ${(e as Error).message.slice(0, 120)}`);
          continue;
        }
      }
      console.log(`  ${spec.kind}: ${n} rows`);
    }
  }
  await db.$disconnect();
}
void main();
