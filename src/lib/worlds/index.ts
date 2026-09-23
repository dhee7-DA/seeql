// Data worlds — lifecycle (server-only: imports the Prisma client).
// The storefront (sample-db.ts) stays the source of truth for lessons; each
// world is ADDITIVE: its own tables in the same SQLite file, created and
// seeded on demand, never touched by lesson grading.

import { db } from "@/lib/db";
import { buildMedSeed, MED_COLUMNS, MED_DDL, MED_TABLES } from "./med-seed";
import { buildSportSeed, SPORT_COLUMNS, SPORT_DDL, SPORT_TABLES } from "./sport-seed";
import { buildLogiSeed, LOGI_COLUMNS, LOGI_DDL, LOGI_TABLES } from "./logi-seed";

export type WorldId = "med" | "sport" | "logi";

export const WORLD_IDS: WorldId[] = ["med", "sport", "logi"];

export const WORLD_TABLES: Record<WorldId, readonly string[]> = {
  med: MED_TABLES,
  sport: SPORT_TABLES,
  logi: LOGI_TABLES,
};

export const WORLD_DDL: Record<WorldId, string[]> = {
  med: MED_DDL,
  sport: SPORT_DDL,
  logi: LOGI_DDL,
};

const WORLD_COLUMNS: Record<WorldId, Record<string, string[]>> = {
  med: MED_COLUMNS,
  sport: SPORT_COLUMNS,
  logi: LOGI_COLUMNS,
};

// Every world table that exists in the DB (flattened, for reset/stats).
export const ALL_WORLD_TABLES: string[] = WORLD_IDS.flatMap((w) => [...WORLD_TABLES[w]]);

/* ---------------- lifecycle ---------------- */

type SeedRow = { table: string; values: Array<string | number | null> };

const BUILDERS: Record<WorldId, () => { rows: SeedRow[]; counts: Record<string, number> }> = {
  med: buildMedSeed,
  sport: buildSportSeed,
  logi: buildLogiSeed,
};

async function insertRows(world: WorldId) {
  const { rows } = BUILDERS[world]();
  const columns = WORLD_COLUMNS[world];
  const statements: Array<[string, Array<string | number | null>]> = [];
  for (const r of rows) {
    const cols = columns[r.table];
    if (!cols) throw new Error(`world ${world}: no column map for table ${r.table}`);
    statements.push([
      `INSERT INTO ${r.table} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
      r.values,
    ]);
  }
  await db.$transaction(statements.map(([sql, args]) => db.$executeRawUnsafe(sql, ...args)));
}

/** Seed one world's rows if its first table is empty (world tables otherwise
 *  left alone — a learner's playground writes survive a cold start). */
async function ensureWorld(world: WorldId): Promise<void> {
  for (const stmt of WORLD_DDL[world]) await db.$executeRawUnsafe(stmt);
  const first = WORLD_TABLES[world][0];
  const res = (await db.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM ${first}`)) as Array<{
    n: number | bigint;
  }>;
  if (Number(res[0]?.n ?? 0) === 0) await insertRows(world);
}

// Single-flight across routes — Next bundles this module into EACH route
// separately, so the lock must live on globalThis (same rationale as the
// storefront's ensureDatabase in sample-db.ts).
const globalForWorlds = globalThis as unknown as { __seeqlWorldsEnsure?: Promise<void> };

export function ensureWorlds(): Promise<void> {
  if (!globalForWorlds.__seeqlWorldsEnsure) {
    globalForWorlds.__seeqlWorldsEnsure = (async () => {
      for (const w of WORLD_IDS) await ensureWorld(w);
    })().catch((err) => {
      globalForWorlds.__seeqlWorldsEnsure = undefined; // failed — allow retry
      throw err;
    });
  }
  return globalForWorlds.__seeqlWorldsEnsure;
}

/** Drop + recreate + reseed every world. Called by /api/reset. */
export async function resetWorlds(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const w of WORLD_IDS) {
    // children first — FK enforcement is ON
    for (const t of [...WORLD_TABLES[w]]) await db.$executeRawUnsafe(`DROP TABLE IF EXISTS ${t}`);
    for (const stmt of WORLD_DDL[w]) await db.$executeRawUnsafe(stmt);
    await insertRows(w);
    Object.assign(counts, BUILDERS[w]().counts);
  }
  return counts;
}
