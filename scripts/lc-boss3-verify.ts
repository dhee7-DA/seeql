/**
 * Boss Level III smoke test — run each new dive's solution against its own
 * seed inside a rolled-back transaction and print the graded rows. Hand-check
 * BEFORE regenerating sql-expected.ts.
 * Run: bun scripts/lc-boss3-verify.ts
 */
import { db } from "../src/lib/db";
import { SQL_BOSS3_A } from "../src/lib/leetcode/content/sql-boss3-a";
import { SQL_BOSS3_B } from "../src/lib/leetcode/content/sql-boss3-b";

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

const EXPECTED: Record<string, string[]> = {
  "bom-leaf-demand-explosion": ["Rivet Kit|50", "Wing Skin|10", "Sensor Mount|8", "Wing Spar|6", "Cockpit Glass|2"],
  "min-hops-flight-reachability": ["DEN|1", "PDX|1", "CHI|2", "SFO|2", "JFK|3", "LAX|3"],
  "subtree-budget-rollup": ["Platform|180000|7", "Web|100000|3", "Mobile|55000|2", "Checkout|45000|1", "iOS|40000|1"],
  "mutual-follow-triangles": ["2|3", "3|3", "1|2", "4|2"],
  "referral-generations-pivot": ["1|2|3|3", "10|1|0|0"],
  "effective-equity-ownership": [
    "1|2|63", "2|4|50", "3|4|45", "1|4|43.5",
    "1|3|30", "4|5|20", "2|5|10", "3|2|10",
  ],
};

let bad = 0;
for (const dive of [...SQL_BOSS3_A, ...SQL_BOSS3_B]) {
  const rows = await runInSeed(dive, dive.code);
  const got = rows?.map((r) => r.join("|")) ?? [];
  const want = EXPECTED[dive.slug] ?? [];
  const ok = got.length === want.length && got.every((g, i) => g === want[i]);
  console.log(`\n=== ${dive.slug} — ${ok ? "MATCH" : "MISMATCH"} (${got.length} rows) ===`);
  if (!ok) {
    bad++;
    console.log("  want:", JSON.stringify(want));
    console.log("  got: ", JSON.stringify(got));
  } else {
    console.log("  " + got.join(" · "));
  }
}
process.exit(bad ? 1 : 0);
