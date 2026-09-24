"use client";

// SeeQ mood bus — the reserved wiring from the mascot build ("reaction states
// ready to be wired into drills/clinic/golf events via moodRef pattern").
//
// One-way feed: any surface calls seeqReact(kind) at the moment something
// happens (a graded run fails, a problem is solved, a drill round finishes
// clean, the daily puzzle lands). The buddy subscribes and plays a bloub
// state + a one-line speech bubble. Emitters stay dumb — no React, no state,
// one import — and the buddy owns all presentation and pacing.
//
// Cooldowns live HERE so a burst of failing runs can never jitter the bot:
// each kind fires at most once per its window, and later events inside the
// window are simply dropped (the learner is already mid-loop; nothing of
// value is lost by staying quiet).

export type SeeqMoodKind = "win" | "fail" | "streak" | "puzzle";

export interface SeeqMoodEvent {
  kind: SeeqMoodKind;
  /** 1 = quiet nod, 2 = real celebration, 3 = full flourish (puzzle-grade). */
  intensity: 1 | 2 | 3;
  /** Monotonic id — the buddy uses it to ignore replays of the same event. */
  nonce: number;
  ts: number;
}

let version = 0;
let current: SeeqMoodEvent | null = null;
const lastAt: Partial<Record<SeeqMoodKind, number>> = {};

const COOLDOWN_MS: Record<SeeqMoodKind, number> = {
  win: 6000,
  fail: 9000,
  streak: 20000,
  puzzle: 45_000,
};

const listeners = new Set<() => void>();

/**
 * Report an app event to the buddy. Returns false when the event was
 * dropped by the kind's cooldown window — callers never need to check.
 */
export function seeqReact(kind: SeeqMoodKind, intensity: 1 | 2 | 3 = 1): boolean {
  const now = Date.now();
  if (now - (lastAt[kind] ?? 0) < COOLDOWN_MS[kind]) return false;
  lastAt[kind] = now;
  version += 1;
  current = { kind, intensity, nonce: version, ts: now };
  listeners.forEach((l) => l());
  return true;
}

export function subscribeMood(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Latest event (stable reference between events — safe for shallow compares). */
export function getMood(): SeeqMoodEvent | null {
  return current;
}
