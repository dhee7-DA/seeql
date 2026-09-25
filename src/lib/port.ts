"use client";

// Progress portability — the whole SeeQL local state as one JSON file.
//
// Every persisted surface matches /^(seeql|sql-visualizer)/: the zustand
// progress store (XP ledger, badges, streaks, review deck), the notebook,
// custom golf holes, blitz history, drill session, mentor chat, buddy skin
// & position, sound flag, theme, module-open state, run history. Instead of
// a hand-maintained allowlist, export enumerates localStorage and keeps the
// matching keys — future stores are backed up automatically. Import writes
// only keys matching the same pattern (a hostile file can't plant arbitrary
// entries), then a reload lets each store rehydrate from its new state.
//
// File shape (version 1):
// { app: "seeql", version: 1, exportedAt: ISO, entries: { key: rawJson } }

import type { ProgressState } from "./curriculum/progress";

export const PORT_VERSION = 1;
/** Everything that belongs to the app matches one of these prefixes. */
const KEY_PATTERN = /^(seeql[-_.a-z0-9]*|sql-visualizer[-_a-z0-9]*)$/i;

export interface Backup {
  app: "seeql";
  version: number;
  exportedAt: string;
  entries: Record<string, string>;
}

export interface BackupSummary {
  keys: number;
  bytes: number;
  xp: number;
  lessonsDone: number;
  badges: number;
  notebook: number;
  holes: number;
}

const prefix = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

function readStore<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Human-facing one-liner about a backup, e.g. "4.2k XP · 12 lessons · 3 badges". */
export function summarizeBackup(backup: Backup): string {
  const progress = readProgressOf(backup);
  const notebook = countEntries(backup, "seeql.notebook.v1");
  const holes = countEntries(backup, "seeql.golf-custom.v1");
  const bits: string[] = [];
  if (progress) {
    bits.push(`${prefix(progress.xp)} XP`);
    bits.push(`${progress.lessonsDone} lessons`);
    bits.push(`${progress.badges} badges`);
  }
  if (notebook > 0) bits.push(`${notebook} notes`);
  if (holes > 0) bits.push(`${holes} holes`);
  return bits.join(" · ") || "empty backup";
}

function readProgressOf(backup: Backup) {
  const raw = backup.entries["sql-visualizer-learn-v1"];
  if (!raw) return null;
  try {
    // zustand persist wraps the state in { state, version }
    const parsed = JSON.parse(raw) as { state?: Partial<ProgressState> } & Partial<ProgressState>;
    const state = (parsed.state ?? parsed) as Partial<ProgressState>;
    return {
      xp: Object.values(state.xpEvents ?? {}).reduce((a, b) => a + b, 0),
      lessonsDone: Object.keys(state.lessonsDone ?? {}).length,
      badges: Object.keys(state.badges ?? {}).length,
    };
  } catch {
    return null;
  }
}

function countEntries(backup: Backup, key: string): number {
  const raw = backup.entries[key];
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length;
    if (parsed && typeof parsed === "object") return Object.keys(parsed).length;
    return 0;
  } catch {
    return 0;
  }
}

/** Snapshot every SeeQL localStorage entry into a backup object. */
export function buildBackup(): Backup {
  const entries: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !KEY_PATTERN.test(key)) continue;
    const value = localStorage.getItem(key);
    if (value === null) continue;
    entries[key] = value;
  }
  return {
    app: "seeql",
    version: PORT_VERSION,
    exportedAt: new Date().toISOString(),
    entries,
  };
}

/** Download the backup as seeql-backup-YYYY-MM-DD.json. */
export function downloadBackup(backup: Backup): void {
  const day = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `seeql-backup-${day}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export class BackupError extends Error {}

/** Parse + validate backup text; throws BackupError with a human message. */
export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError("That file isn't valid JSON.");
  }
  const b = data as Partial<Backup>;
  if (!b || typeof b !== "object" || b.app !== "seeql" || typeof b.entries !== "object" || b.entries === null) {
    throw new BackupError("That file isn't a SeeQL backup.");
  }
  if (b.version !== PORT_VERSION) {
    throw new BackupError(`Unsupported backup version (${String(b.version)}).`);
  }
  const entries = b.entries as Record<string, unknown>;
  for (const key of Object.keys(entries)) {
    if (!KEY_PATTERN.test(key) || typeof entries[key] !== "string") {
      throw new BackupError("The backup contains unexpected keys.");
    }
  }
  return data as Backup;
}

/** Write a parsed backup into localStorage. Returns the key count written. */
export function restoreBackup(backup: Backup): number {
  let count = 0;
  for (const [key, value] of Object.entries(backup.entries)) {
    localStorage.setItem(key, value);
    count++;
  }
  return count;
}

/** Convenience for the import button: parse a File, restore, report. */
export async function importBackupFile(file: File): Promise<{ count: number; summary: string }> {
  const backup = parseBackup(await file.text());
  const summary = summarizeBackup(backup);
  const count = restoreBackup(backup);
  return { count, summary };
}
