// Boss Level III follow-up verifier — apply every FU_SPECS mutation, run the
// mutated SQL against the dive's own seed, and check it (a) runs and
// (b) produces an output DISTINCT from the base solution — the two
// properties the gauntlet requires.
// Run: bun scripts/lc-boss3-fu-verify.ts
import { db } from "../src/lib/db";
import { SQL_BOSS3_A } from "../src/lib/leetcode/content/sql-boss3-a";
import { SQL_BOSS3_B } from "../src/lib/leetcode/content/sql-boss3-b";
import { FU_SPECS } from "../src/lib/leetcode/followup-specs";
import { applyFuSpec } from "../src/lib/leetcode/followups";

const S = (v: unknown) => (typeof v === "bigint" ? Number(v) : v);

async function runInSeed(
  dive: (typeof SQL_BOSS3_A)[number],
  sql: string,
): Promise<string[][] | null> {
  let captured: Array<Record<string, unknown>> | null = null;
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
      captured = await tx.$queryRawUnsafe(sql);
      throw new Error("__rollback__");
    });
  } catch (e) {
    if (!(e as Error).message.includes("__rollback__")) return null;
  }
  if (!captured) return null;
  return (captured as Array<Record<string, unknown>>).map((r) =>
    Object.values(r).map((c) => String(S(c))),
  );
}

async function main() {
  let bad = 0;
  for (const dive of [...SQL_BOSS3_A, ...SQL_BOSS3_B]) {
    const specs = FU_SPECS[dive.slug] ?? [];
    console.log(`\n=== ${dive.slug} (${specs.length} pushes) ===`);
    const truth = await runInSeed(dive, dive.code);
    if (!truth) {
      console.log("  BASE SOLUTION FAILED — aborting slug");
      bad++;
      continue;
    }
    const truthKey = JSON.stringify(truth);
    for (const spec of specs) {
      const sql = applyFuSpec(dive, spec);
      if (!sql) {
        console.log(`  ${spec.kind}: MUTATION PRODUCED NULL`);
        bad++;
        continue;
      }
      const rows = await runInSeed(dive, sql);
      if (!rows) {
        console.log(`  ${spec.kind}: RUN ERROR`);
        bad++;
        continue;
      }
      const distinct = JSON.stringify(rows) !== truthKey;
      console.log(`  ${spec.kind}${spec.param ? `(${spec.param})` : ""}: ${rows.length} rows ${distinct ? "distinct ✓" : "SAME AS BASE ✗"}`);
      if (!distinct) bad++;
    }
  }
  console.log(bad ? `\nFAIL — ${bad} problem(s)` : "\nALL BOSS3 FOLLOW-UPS VERIFIED");
  await db.$disconnect();
  process.exit(bad ? 1 : 0);
}
void main();
