"use client";

// Custom golf holes — the challenge creator's persistence layer. Stored
// locally under seeql.golf-custom.v1; each hole is a real GolfHole (rides
// the same live-graded play card, same XP ledger keys `golf:<id>`) with
// starColumns=1 (learner-designed holes bill SELECT * as one stroke) and
// ordered=false (row order free — matching rows is the whole grade).
//
// Hydration-safe: the server snapshot is the empty list, and the client
// snapshot is a cached parsed array that only changes on real mutations,
// so useSyncExternalStore never thrashes.

import type { GolfHole } from "./golf";

const STORE_KEY = "seeql.golf-custom.v1";

export interface CustomHole extends GolfHole {
  createdAt: number;
}

type Listener = () => void;
const listeners = new Set<Listener>();

let cache: CustomHole[] | null = null;
let cacheRaw: string | null = null;

/** Stable ref for the empty state — read() must never hand out fresh arrays. */
const EMPTY: CustomHole[] = [];

function read(): CustomHole[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw === null) return EMPTY;
    if (cache !== null && raw === cacheRaw) return cache;
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return EMPTY;
    const holes = arr.filter(
      (h): h is CustomHole =>
        !!h && typeof h === "object" &&
        typeof (h as CustomHole).id === "string" &&
        typeof (h as CustomHole).starter === "string" &&
        typeof (h as CustomHole).par === "string",
    );
    cache = holes;
    cacheRaw = raw;
    return holes;
  } catch {
    return EMPTY;
  }
}

function write(holes: CustomHole[]): void {
  const json = JSON.stringify(holes);
  try {
    window.localStorage.setItem(STORE_KEY, json);
  } catch {
    /* private mode — in-memory only */
  }
  cache = holes;
  cacheRaw = json; // the written array IS the cached snapshot — stable ref
  listeners.forEach((l) => l());
}

export function listCustomHoles(): CustomHole[] {
  return read();
}

export function getCustomHolesSnapshot(): CustomHole[] {
  return read();
}

export function subscribeCustomHoles(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Server snapshot for useSyncExternalStore — always empty, stable ref. */
export const CUSTOM_HOLES_SERVER_SNAPSHOT: CustomHole[] = [];

/** Next free custom id, e.g. "c3". */
export function nextCustomId(holes: CustomHole[]): string {
  let max = 0;
  for (const h of holes) {
    const m = /^c(\d+)$/.exec(h.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `c${max + 1}`;
}

export function addCustomHole(input: {
  target: string;
  starter: string;
  par: string;
  skill: string;
  title: string;
}): CustomHole {
  const holes = read();
  const hole: CustomHole = {
    id: nextCustomId(holes),
    title: input.title,
    target: input.target,
    starter: input.starter,
    par: input.par,
    ordered: false,
    starColumns: 1,
    lesson: "You designed this hole — the par is whatever leanest shape you had in mind when you built it.",
    skill: input.skill || "custom",
    createdAt: Date.now(),
  };
  write([...holes, hole]);
  return hole;
}

export function removeCustomHole(id: string): void {
  write(read().filter((h) => h.id !== id));
}
