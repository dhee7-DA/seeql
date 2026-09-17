// Run ledger — every successful playground Run is snapshotted so runs can be
// compared later ("what did changing HAVING actually do to my rows?").
//
// Storage is localStorage (same spirit as the XP ledger): nothing leaves the
// browser, and the playground's own promise — "nothing is stored" server-side
// — stays true. Rows are capped so 30 snapshots never threaten the ~5MB quota.

import type { CellValue } from "@/lib/sql-types";

export interface RunSnapshot {
  id: string;
  ts: number;
  sql: string;
  statementType: string;
  durationMs: number;
  /** full column list of the result */
  columns: string[];
  /** result rows, capped at RUN_ROW_CAP for storage */
  rows: CellValue[][];
  /** how many rows the run really returned (may exceed rows.length) */
  rowCount: number;
  /** compiled bytecode op count from EXPLAIN — the query's weight (optional:
   *  snapshots written before this field existed simply lack it) */
  opcodeCount?: number | null;
}

const RUNS_KEY = "sql-visualizer-runs";
export const RUNS_MAX = 30;
export const RUN_ROW_CAP = 200;

export function loadRuns(): RunSnapshot[] {
  try {
    const raw = window.localStorage.getItem(RUNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // defensive shape check — a bad write must never crash the playground
    return parsed.filter(
      (r): r is RunSnapshot =>
        !!r &&
        typeof r === "object" &&
        typeof (r as RunSnapshot).id === "string" &&
        typeof (r as RunSnapshot).sql === "string" &&
        Array.isArray((r as RunSnapshot).columns),
    );
  } catch {
    return [];
  }
}

export function saveRuns(runs: RunSnapshot[]) {
  try {
    window.localStorage.setItem(RUNS_KEY, JSON.stringify(runs.slice(0, RUNS_MAX)));
  } catch {
    // quota exceeded / storage unavailable — the ledger is best-effort
  }
}

export function snapshotRun(
  sql: string,
  exec: {
    statementType: string;
    durationMs: number;
    columns: string[];
    rows: CellValue[][];
    rowCount: number;
    opcodeCount?: number | null;
  },
): RunSnapshot {
  return {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now(),
    sql,
    statementType: exec.statementType,
    durationMs: exec.durationMs,
    columns: exec.columns,
    rows: exec.rows.slice(0, RUN_ROW_CAP),
    rowCount: exec.rowCount,
    opcodeCount: exec.opcodeCount ?? null,
  };
}

/** "just now" / "2m ago" / "14:32:05" — compact, ledger-grade */
export function runTime(ts: number): string {
  const delta = Date.now() - ts;
  if (delta < 45_000) return "just now";
  if (delta < 3_600_000) return `${Math.round(delta / 60_000)}m ago`;
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
