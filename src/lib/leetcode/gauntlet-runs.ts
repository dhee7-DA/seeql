"use client";

// Boss Gauntlet run ledger — the run report used to live in component state
// only ("gauntlet runs session-only"), so a reload erased every trace of a
// run: score, clock, tier — all gone. Stored locally under
// seeql-gauntlet-runs-v1 (the seeql- prefix rides lib/port.ts backups).
//
// Hydration-safe: the server snapshot is the empty list, and the client
// snapshot is a cached parsed array that only changes on real writes, so
// useSyncExternalStore never thrashes (same pattern as golf-custom.ts).

export interface GauntletRunRecord {
  id: string;
  ts: number;
  /** correct picks in the run */
  score: number;
  /** rounds dealt (BOSS.length at run time, recorded per run) */
  total: number;
  /** wall-clock duration of the whole run, seconds */
  sec: number;
  /** tier name if the score cleared one ("Gold — perfect run" …), else null */
  tier: string | null;
}

const STORE_KEY = "seeql-gauntlet-runs-v1";
export const GAUNTLET_RUNS_MAX = 20;

type Listener = () => void;
const listeners = new Set<Listener>();

let cache: GauntletRunRecord[] | null = null;
let cacheRaw: string | null = null;

/** Stable ref for the empty state — read() must never hand out fresh arrays. */
const EMPTY: GauntletRunRecord[] = [];

function read(): GauntletRunRecord[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw === null) return EMPTY;
    if (cache !== null && raw === cacheRaw) return cache;
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return EMPTY;
    const runs = arr.filter(
      (r): r is GauntletRunRecord =>
        !!r && typeof r === "object" &&
        typeof (r as GauntletRunRecord).ts === "number" &&
        typeof (r as GauntletRunRecord).score === "number" &&
        typeof (r as GauntletRunRecord).total === "number" &&
        typeof (r as GauntletRunRecord).sec === "number",
    );
    cache = runs;
    cacheRaw = raw;
    return runs;
  } catch {
    return EMPTY;
  }
}

/** Prepend a finished run, cap the ledger, persist, notify subscribers. */
export function saveGauntletRun(record: GauntletRunRecord): void {
  const next = [record, ...read()].slice(0, GAUNTLET_RUNS_MAX);
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    // quota / private mode — best-effort; the run already paid its XP through
    // the honest one-time tier keys, the ledger must never break a report
  }
  cache = next;
  cacheRaw = JSON.stringify(next); // the written array IS the cached snapshot — stable ref
  listeners.forEach((l) => l());
}

export function getGauntletRunsSnapshot(): GauntletRunRecord[] {
  return read();
}

export function subscribeGauntletRuns(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Server snapshot for useSyncExternalStore — always empty, stable ref. */
export const GAUNTLET_RUNS_SERVER_SNAPSHOT: GauntletRunRecord[] = [];

/** Best score across the ledger (0 when empty). */
export function bestGauntletScore(runs: GauntletRunRecord[]): number {
  return runs.reduce((b, r) => Math.max(b, r.score), 0);
}

/** "Oct 30 · 14:32" — compact, history-row grade (runTime in lib/runs.ts is
 *  a relative "2m ago" grade, wrong for runs you read days later). */
export function gauntletRunDay(ts: number): string {
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${MON[d.getMonth()]} ${d.getDate()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
