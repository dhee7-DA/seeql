// Sweep every FuKind mutation against each Boss II dive: run the mutant in
// the dive's seed and report (run ok, distinct from truth). Feeds the final
// FU_SPECS choice for the gauntlet.
// Run: bun scripts/lc-boss2-mut-sweep.ts
import { db } from "../src/lib/db";
import { SQL_BOSS2_A } from "../src/lib/leetcode/content/sql-boss2-a";
import { SQL_BOSS2_B } from "../src/lib/leetcode/content/sql-boss2-b";
import { applyFuSpec } from "../src/lib/leetcode/followups";
import type { FuKind } from "../src/lib/leetcode/followups";

const S = (v: unknown) => (typeof v === "bigint" ? Number(v) : v);

const KINDS: Array<FuKind> = [
  "order-flip", "agg-swap", "where-not", "having", "having-add",
  "top-n", "min-max", "limit-add", "limit-grow", "cte-wrap", "distinct-drop", "rank-swap",
];

async function runInSeed(dive: (typeof SQL_BOSS2_A)[number], sql: string): Promise<string[][] | null> {
  let captured: Array<Record<string, unknown>> | null = null;
  try {
    await db.$transaction(async (tx: {
      $executeRawUnsafe: (s: string) => Promise<unknown>;
      $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>>;
    }) => {
      const clean = (s: string) => s.split("\n").map((l) => l.replace(/--.*$/, "")).join("\n");
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
  return (captured as Array<Record<string, unknown>>).map((r) => Object.values(r).map((c) => String(S(c))));
}

async function main() {
  for (const dive of [...SQL_BOSS2_A, ...SQL_BOSS2_B]) {
    const truth = await runInSeed(dive, dive.code);
    if (!truth) { console.log(`\n=== ${dive.slug}: BASE FAILED`); continue; }
    const truthKey = JSON.stringify(truth);
    console.log(`\n=== ${dive.slug} (truth ${truth.length} rows) ===`);
    for (const kind of KINDS) {
      for (const param of [undefined, "min", "max", "2", "-2", "3", "drop", "add"]) {
        const spec = { kind, param } as { kind: FuKind; param?: string };
        const sql = applyFuSpec(dive, spec);
        if (!sql) continue;
        const rows = await runInSeed(dive, sql);
        if (!rows) { console.log(`  ${kind}(${param}): RUN ERROR`); continue; }
        const distinct = JSON.stringify(rows) !== truthKey;
        console.log(`  ${kind}(${param ?? "-"}): ${rows.length} rows ${distinct ? "DISTINCT ✓" : "same"}`);
      }
    }
  }
  await db.$disconnect();
}
void main();
