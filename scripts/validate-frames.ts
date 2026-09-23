// Validates the window-frame playground engine (src/lib/frames.ts) against
// SQLite's real window-function output across a broad spec matrix:
// ROWS / RANGE / GROUPS × bounds × EXCLUDE × order column/direction ×
// partition × aggregates + FIRST/LAST_VALUE + default-frame mode.
//
// Alignment strategy: each built statement is run against the live sandbox DB
// and the engine is fed SQLITE'S OWN returned row order (for ROWS units,
// membership is positional — feeding the engine's own order is what makes the
// playground highlights provably identical to what SQLite used). The expected
// aggregate over the engine's membership must equal window_value for EVERY
// returned row.
//
// Run: bunx tsx scripts/validate-frames.ts

import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
import {
  DEFAULT_FRAME_CONFIG,
  aggregateOver,
  buildSql,
  frameMembers,
  type BoundKind,
  type ExcludeMode,
  type FrameConfig,
  type FrameFn,
  type FrameRow,
  type FrameUnit,
} from "../src/lib/frames";

interface Combo {
  start: BoundKind;
  startN: number;
  end: BoundKind;
  endN: number;
}

const BOUND_COMBOS: Combo[] = [
  { start: "unbounded-preceding", startN: 1, end: "current-row", endN: 1 },
  { start: "unbounded-preceding", startN: 1, end: "n-following", endN: 1 },
  { start: "unbounded-preceding", startN: 1, end: "n-following", endN: 2 },
  { start: "unbounded-preceding", startN: 1, end: "unbounded-following", endN: 1 },
  { start: "n-preceding", startN: 1, end: "current-row", endN: 1 },
  { start: "n-preceding", startN: 1, end: "n-following", endN: 1 },
  { start: "n-preceding", startN: 1, end: "n-following", endN: 2 },
  { start: "n-preceding", startN: 1, end: "unbounded-following", endN: 1 },
  { start: "n-preceding", startN: 2, end: "current-row", endN: 1 },
  { start: "n-preceding", startN: 2, end: "n-following", endN: 1 },
  { start: "n-preceding", startN: 2, end: "n-following", endN: 2 },
  { start: "n-preceding", startN: 2, end: "unbounded-following", endN: 1 },
  { start: "current-row", startN: 1, end: "current-row", endN: 1 },
  { start: "current-row", startN: 1, end: "n-following", endN: 1 },
  { start: "current-row", startN: 1, end: "n-following", endN: 2 },
  { start: "current-row", startN: 1, end: "unbounded-following", endN: 1 },
];

const UNITS: FrameUnit[] = ["rows", "range", "groups"];
const EXCLUDES: ExcludeMode[] = ["no-others", "current-row", "group", "ties"];
const ORDERS: Array<Pick<FrameConfig, "orderCol" | "dir">> = [
  { orderCol: "day", dir: "asc" },
  { orderCol: "sales", dir: "desc" },
];

function cfgOf(patch: Partial<FrameConfig>): FrameConfig {
  return { ...DEFAULT_FRAME_CONFIG, ...patch };
}

async function runOne(cfg: FrameConfig): Promise<{ rows: FrameRow[]; w: Map<number, number | null> }> {
  const raw = (await db.$queryRawUnsafe(buildSql(cfg))) as Array<Record<string, unknown>>;
  const rows: FrameRow[] = [];
  const w = new Map<number, number | null>();
  for (const r of raw) {
    const row: FrameRow = {
      day: Number(r.day),
      region: String(r.region),
      sales: Number(r.sales),
    };
    rows.push(row);
    const val = r.window_value;
    w.set(row.day, val === null || val === undefined ? null : Number(val));
  }
  return { rows, w };
}

function closeEnough(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return a === b;
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
}

let checks = 0;
let fails = 0;

function describe(cfg: FrameConfig, day: number, expected: number | null, actual: number | null): string {
  return [
    `FAIL ${cfg.fn} partition=${cfg.partition} ORDER BY ${cfg.orderCol} ${cfg.dir}`,
    `     ${cfg.frameMode === "default" ? "(default frame)" : `${cfg.unit} BETWEEN ${cfg.start}(${cfg.startN}) AND ${cfg.end}(${cfg.endN})${cfg.exclude !== "no-others" ? ` ${cfg.exclude}` : ""}`}`,
    `     day=${day} expected=${expected} actual=${actual}`,
  ].join("\n");
}

async function checkConfig(cfg: FrameConfig): Promise<void> {
  const { rows, w } = await runOne(cfg);
  if (rows.length !== 12) {
    fails++;
    console.error(`FAIL ${cfg.fn} ... returned ${rows.length} rows, expected 12`);
    return;
  }
  for (let i = 0; i < rows.length; i++) {
    const members = frameMembers(rows, i, cfg);
    const expected = aggregateOver(members, rows, cfg.fn);
    const actual = w.has(rows[i].day) ? (w.get(rows[i].day) as number | null) : undefined;
    checks++;
    if (actual === undefined || !closeEnough(expected, actual)) {
      fails++;
      console.error(describe(cfg, rows[i].day, expected, actual ?? null));
      if (fails > 20) throw new Error("too many failures");
    }
  }
}

async function main() {
  await resetDatabase();
  console.log("sandbox reseeded — validating frame engine against SQLite\n");

  // 1. Aggregates over the full custom-frame matrix (sum/count/avg).
  for (const unit of UNITS) {
    for (const combo of BOUND_COMBOS) {
      for (const exclude of EXCLUDES) {
        for (const order of ORDERS) {
          for (const partition of [false, true]) {
            for (const fn of ["sum", "count", "avg"] as FrameFn[]) {
              await checkConfig(
                cfgOf({ fn, unit, ...combo, exclude, ...order, partition, frameMode: "custom" }),
              );
            }
          }
        }
      }
    }
  }
  console.log(`custom-frame matrix (sum/count/avg): ${checks} checks so far, ${fails} failures`);

  // 2. MIN / MAX on every 5th combo, all units + excludes.
  let k = 0;
  for (const unit of UNITS) {
    for (const combo of BOUND_COMBOS) {
      for (const exclude of EXCLUDES) {
        k++;
        if (k % 5 !== 0) continue;
        for (const fn of ["min", "max"] as FrameFn[]) {
          await checkConfig(
            cfgOf({ fn, unit, ...combo, exclude, orderCol: "sales", dir: "asc", partition: true, frameMode: "custom" }),
          );
        }
      }
    }
  }

  // 3. FIRST/LAST_VALUE on ROWS frames (positional, fully deterministic),
  //    EXCLUDE NO OTHERS + TIES, both partitions.
  for (const combo of BOUND_COMBOS) {
    for (const exclude of ["no-others", "ties"] as ExcludeMode[]) {
      for (const fn of ["first", "last"] as FrameFn[]) {
        await checkConfig(
          cfgOf({ fn, unit: "rows", ...combo, exclude, orderCol: "day", dir: "asc", partition: false, frameMode: "custom" }),
          );
        await checkConfig(
          cfgOf({ fn, unit: "rows", ...combo, exclude, orderCol: "sales", dir: "desc", partition: true, frameMode: "custom" }),
        );
      }
    }
  }

  // 4. Default frame mode (omitted clause) — no EXCLUDE applies.
  for (const order of ORDERS) {
    for (const partition of [false, true]) {
      for (const fn of ["sum", "avg", "last"] as FrameFn[]) {
        await checkConfig(cfgOf({ fn, ...order, partition, frameMode: "default" }));
      }
    }
  }

  console.log(`\nTOTAL: ${checks} row-level checks, ${fails} failures`);
  if (fails > 0) process.exit(1);
  console.log("ALL FRAME CHECKS PASSED — engine membership == SQLite window output");
  process.exit(0);
}

main().catch((e) => {
  console.error("VALIDATION ERROR", e);
  process.exit(1);
});
