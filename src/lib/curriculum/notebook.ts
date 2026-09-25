"use client";

// Query notebook — saved queries with margin notes, persisted locally
// under seeql.notebook.v1. One seeded starter so the tool is never empty;
// deletions of the seed are respected (the seed is only written when the
// store key doesn't exist at all).
//
// Hydration-safe: server snapshot = the seed list (stable ref); client
// snapshot is a cached parsed array that changes reference only on real
// mutations, so useSyncExternalStore stays quiet.

const STORE_KEY = "seeql.notebook.v1";

export interface NoteEntry {
  id: string;
  title: string;
  sql: string;
  note: string;
  ts: number;
}

type Listener = () => void;
const listeners = new Set<Listener>();

export const SEED_ENTRY: NoteEntry = {
  id: "seed-1",
  title: "Late orders, with a note to self",
  sql:
    "SELECT o.id, o.ordered_at, c.name\n" +
    "FROM orders o JOIN customers c ON c.id = o.customer_id\n" +
    "WHERE o.ordered_at >= '2024-06-01'\n" +
    "ORDER BY o.ordered_at DESC\n" +
    "LIMIT 10;",
  note:
    "Pattern worth remembering: filter on the orders table first, then join for the human-readable name — and alias the tables so the SELECT list stays readable.",
  ts: 0,
};

const SEED: NoteEntry[] = [SEED_ENTRY];

let cache: NoteEntry[] | null = null;
let cacheRaw: string | null = null;

function read(): NoteEntry[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw === null) return SEED; // first visit — no key yet
    if (cache !== null && raw === cacheRaw) return cache;
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return SEED;
    const entries = arr.filter(
      (e): e is NoteEntry =>
        !!e && typeof e === "object" &&
        typeof (e as NoteEntry).id === "string" &&
        typeof (e as NoteEntry).sql === "string",
    );
    cache = entries;
    cacheRaw = raw;
    return entries;
  } catch {
    return SEED;
  }
}

function write(entries: NoteEntry[]): void {
  const json = JSON.stringify(entries);
  try {
    window.localStorage.setItem(STORE_KEY, json);
  } catch {
    /* private mode — in-memory only */
  }
  cache = entries;
  cacheRaw = json; // the written array IS the cached snapshot — stable ref
  listeners.forEach((l) => l());
}

export function listNotes(): NoteEntry[] {
  return read();
}

export function subscribeNotes(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Stable empty-array alternative if a caller prefers no seed on the server. */
export const NOTES_SERVER_SNAPSHOT: NoteEntry[] = SEED;

export function addNote(input: { title: string; sql: string; note: string }): NoteEntry {
  const entry: NoteEntry = {
    id: `n${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
    title: input.title.trim() || "Untitled query",
    sql: input.sql,
    note: input.note,
    ts: Date.now(),
  };
  write([entry, ...read()]);
  return entry;
}

export function updateNote(id: string, patch: Partial<Pick<NoteEntry, "title" | "sql" | "note">>): void {
  write(read().map((e) => (e.id === id ? { ...e, ...patch, ts: Date.now() } : e)));
}

export function removeNote(id: string): void {
  write(read().filter((e) => e.id !== id));
}
