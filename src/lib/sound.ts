"use client";

// Sound design — a tiny WebAudio synth. Zero asset files: every cue is
// synthesized on the fly from oscillators, so there is nothing to download,
// nothing to cache and nothing that can 404.
//
// Opt-in and OFF by default: the persisted flag lives under seeql.sound.v1
// and nothing below ever plays until the learner flips the header toggle.
// The store is hydration-safe — the module default is "off" and localStorage
// is only read lazily on the client after mount, so SSR HTML and the first
// client render always agree.
//
// Sounds ride the SeeQ mood bus (win/fail/streak/puzzle, already cooldown-
// paced) and the blitz channel (hot streaks / miss / PB — the game itself
// rate-limits those), plus direct celebrate() hooks for xp/badge/level
// toasts. Surfaces never call playCue directly for graded outcomes; they
// emit mood events and this module decides what (if anything) sounds.

import { subscribeMood, subscribeBlitz, getMood, getBlitz, type SeeqMoodKind, type SeeqBlitzPhase } from "@/components/learn/seeq-mood";

export type SoundCue =
  | "correct"   // bright two-note chime — a graded attempt lands
  | "wrong"     // soft low thud — a graded attempt misses
  | "streak"    // quick rising run — a streak milestone lights up
  | "fanfare"   // four-note flourish + fifth stack — daily puzzle solved
  | "xp"        // tiny blip — XP toast
  | "badge"     // bell — badge unlocked
  | "levelup"   // longer arpeggio — level up
  | "record";   // two-note punch — a personal best

const STORE_KEY = "seeql.sound.v1";

let enabled = false;
let loaded = false;
const listeners = new Set<() => void>();

function load(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    enabled = window.localStorage.getItem(STORE_KEY) === "1";
  } catch {
    /* private mode — stay off */
  }
}

export function isSoundOn(): boolean {
  load();
  return enabled;
}

export function setSoundOn(on: boolean): void {
  load();
  enabled = on;
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(STORE_KEY, on ? "1" : "0");
  } catch {
    /* private mode — in-memory only */
  }
  listeners.forEach((l) => l());
}

export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ---- synth ---------------------------------------------------------------

interface Note {
  /** oscillator base frequency in Hz */
  f: number;
  /** start offset from cue start, seconds */
  at: number;
  /** note length, seconds */
  d: number;
  type?: OscillatorType;
  /** note peak gain (0–1) */
  g?: number;
  /** optional ending frequency for glides */
  slideTo?: number;
}

const CUES: Record<SoundCue, Note[]> = {
  correct: [
    { f: 659.25, at: 0, d: 0.09, type: "triangle", g: 0.18 },
    { f: 987.77, at: 0.085, d: 0.16, type: "triangle", g: 0.16 },
  ],
  wrong: [{ f: 165, at: 0, d: 0.2, type: "sine", g: 0.22, slideTo: 98 }],
  streak: [
    { f: 440, at: 0, d: 0.07, type: "triangle", g: 0.14 },
    { f: 554.37, at: 0.06, d: 0.07, type: "triangle", g: 0.15 },
    { f: 659.25, at: 0.12, d: 0.12, type: "triangle", g: 0.17 },
  ],
  fanfare: [
    { f: 440, at: 0, d: 0.11, type: "triangle", g: 0.15 },
    { f: 554.37, at: 0.1, d: 0.11, type: "triangle", g: 0.15 },
    { f: 659.25, at: 0.2, d: 0.11, type: "triangle", g: 0.16 },
    { f: 880, at: 0.3, d: 0.3, type: "triangle", g: 0.18 },
    { f: 1318.5, at: 0.3, d: 0.3, type: "sine", g: 0.08 },
  ],
  xp: [{ f: 1318.5, at: 0, d: 0.07, type: "sine", g: 0.12 }],
  badge: [
    { f: 880, at: 0, d: 0.5, type: "sine", g: 0.16 },
    { f: 1760, at: 0, d: 0.35, type: "sine", g: 0.06 },
  ],
  levelup: [
    { f: 523.25, at: 0, d: 0.1, type: "triangle", g: 0.15 },
    { f: 659.25, at: 0.09, d: 0.1, type: "triangle", g: 0.15 },
    { f: 783.99, at: 0.18, d: 0.1, type: "triangle", g: 0.16 },
    { f: 1046.5, at: 0.27, d: 0.22, type: "triangle", g: 0.18 },
  ],
  record: [
    { f: 440, at: 0, d: 0.1, type: "square", g: 0.08 },
    { f: 880, at: 0.1, d: 0.2, type: "square", g: 0.09 },
  ],
};

let ctx: AudioContext | null = null;

function audioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

/** Play one synthesized cue right now. No-op when sound is off or the
 *  context can't start — silence must never throw. */
export function playCue(cue: SoundCue): void {
  if (!isSoundOn()) return;
  try {
    const ac = audioCtx();
    if (!ac) return;
    const t0 = ac.currentTime + 0.01;
    const master = ac.createGain();
    master.gain.value = 0.9;
    master.connect(ac.destination);
    const notes = CUES[cue];
    const tailMs = Math.max(...notes.map((n) => (n.at + n.d) * 1000));
    for (const n of notes) {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = n.type ?? "triangle";
      const start = t0 + n.at;
      const end = start + n.d;
      osc.frequency.setValueAtTime(n.f, start);
      if (n.slideTo) osc.frequency.exponentialRampToValueAtTime(n.slideTo, end);
      const peak = n.g ?? 0.15;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(end + 0.05);
    }
    window.setTimeout(() => master.disconnect(), tailMs + 150);
  } catch {
    /* audio unavailable — stay silent */
  }
}

// ---- buses ---------------------------------------------------------------
// Wired once per client session: mood events and blitz events translate
// straight into cues. Both buses are already cooldown/rate limited upstream.

const MOOD_CUE: Record<SeeqMoodKind, SoundCue> = {
  win: "correct",
  fail: "wrong",
  streak: "streak",
  puzzle: "fanfare",
};

const BLITZ_CUE: Partial<Record<SeeqBlitzPhase, SoundCue>> = {
  hot3: "streak",
  hot6: "streak",
  miss: "wrong",
  record: "record",
};

if (typeof window !== "undefined") {
  subscribeMood(() => {
    const e = getMood();
    if (e) playCue(MOOD_CUE[e.kind]);
  });
  subscribeBlitz(() => {
    const e = getBlitz();
    const cue = e ? BLITZ_CUE[e.phase] : undefined;
    if (cue) playCue(cue);
  });
}
