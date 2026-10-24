// Boss Level verifier — run each boss dive's solution against its own seed
// and print the result set for comparison with the authored expectations.
// Run: bunx tsx scripts/lc-boss-verify.ts
import { db } from "../src/lib/db";
import { SQL_BOSS_A } from "../src/lib/leetcode/content/sql-boss-a";
import { SQL_BOSS_B } from "../src/lib/leetcode/content/sql-boss-b";

const S = (v: unknown) => (typeof v === "bigint" ? Number(v) : v);

async function main() {
  for (const dive of [...SQL_BOSS_A, ...SQL_BOSS_B]) {
    console.log(`\n=== ${dive.slug} ===`);
    const sandbox = db.$transaction.bind(db);
    let captured: Array<Record<string, unknown>> | null = null;
    try {
      await sandbox(async (tx: {
        $executeRawUnsafe: (s: string) => Promise<unknown>;
        $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>>;
      }) => {
        // Prisma allows ONE statement per $executeRawUnsafe — strip line
        // comments, then split on ';' (seeds contain no ';' in literals).
        const clean = (s: string) =>
          s
            .split("\n")
            .map((l) => l.replace(/--.*$/, ""))
            .join("\n");
        for (const stmt of clean(dive.schema.ddl).split(/;\s*\n/)) {
          if (stmt.trim()) await tx.$executeRawUnsafe(stmt.trim() + ";");
        }
        for (const stmt of clean(dive.schema.seed).split(/;\s*\n/)) {
          if (stmt.trim()) await tx.$executeRawUnsafe(stmt.trim() + ";");
        }
        captured = await tx.$queryRawUnsafe(dive.code);
        throw new Error("__rollback__");
      });
    } catch (e) {
      if (!(e as Error).message.includes("__rollback__")) {
        console.log(`SEED/DDL ERROR: ${JSON.stringify(e).slice(0, 400)}`);
        continue;
      }
    }
    if (!captured) {
      console.log("NO ROWS CAPTURED");
      continue;
    }
    const rows = (captured as Array<Record<string, unknown>>).map((r) =>
      Object.values(r).map(S).join(" · "),
    );
    console.log(`rows: ${rows.length}`);
    for (const r of rows) console.log("  " + r);
  }
  await db.$disconnect();
}
void main();
