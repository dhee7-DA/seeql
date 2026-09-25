"use client";

// Blitz mode — ninety seconds of rapid retrieval across the whole course.
//
// The rules, stated once and enforced honestly:
//   · the round clock runs 90s and NEVER stops (reading feedback costs time
//     — that trade is the whole game)
//   · each question allows 25s; a timeout is a miss, nothing more
//   · points: 100 per correct + up to 50 speed bonus (linear over the first
//     12.5s), multiplied by the combo — ×2 at 3 straight, ×3 at 6 straight
//   · a miss resets the combo and costs NOTHING (no XP is ever deducted)
//   · every question pays +2 XP the first time you beat it (idempotent
//     ledger, same economy as the mixed quiz); a finished round banks
//     +10 XP once per day
//   · blitz answers deliberately do NOT touch mcqAttempts or the review
//     schedule — rapid-fire guesses must not cost first-try bonuses later
//     or schedule noisy reviews; the personal-best chase lives here
//
// SeeQ follows the round through the blitz channel in seeq-mood.ts: focused
// at the start, louder as the combo climbs, stung on a miss, triumphant at
// a record — and the idle tip/flourish calendars stand down while live.
//
// State shape (the React-compiler lint rules leave exactly one honest
// split): the round's mutable truth — deadlines, deck cursor, score
// accumulators — lives in ONE ref that only timer/event callbacks touch;
// what the RENDER shows (current question, points, streak, both clocks)
// is mirrored into state by those same callbacks, and the 100ms tick
// refreshes the two clock faces. No ref.current is ever read during
// render; effects contain only interval updaters, event subscriptions
// and cleanup — the shapes this repo's lint rules allow.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Keyboard, RefreshCcw, Shield, Timer, Trophy, Zap } from "lucide-react";
import { Icon3D } from "./ui/icon3d";
import { LESSONS } from "@/lib/curriculum/lessons";
import { useProgress } from "@/lib/curriculum/progress";
import { dayKey } from "@/lib/curriculum/gamification";
import type { Mcq } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";
import { RichNodes } from "./rich";
import { looksLikeSql, SqlNodes } from "./sql-code";
import { celebrate } from "./celebrate";
import { seeqBlitz } from "./seeq-mood";

const ROUND_MS = 90_000;
const QUESTION_MS = 25_000;
const BASE_POINTS = 100;
const SPEED_MAX = 50;
const SPEED_WINDOW_MS = 12_500;
const NEXT_DELAY_CORRECT = 900;
const NEXT_DELAY_WRONG = 2400;
const NEXT_DELAY_TIMEOUT = 1700;
const XP_PER_FIRST = 2;
const XP_ROUND_DAY = 10;
const HISTORY_KEY = "seeql.blitz.v1";
const HISTORY_MAX = 8;

interface BlitzRound {
  /** points */
  p: number;
  /** correct answers */
  c: number;
  /** questions faced */
  n: number;
  /** best streak in the round */
  s: number;
  /** finished-at timestamp */
  at: number;
  /** XP banked by this round (question firsts + the once-a-day round bonus) */
  xp: number;
}

interface BlitzStore {
  best: number;
  bestAt: number;
  rounds: BlitzRound[];
}

const EMPTY_STORE: BlitzStore = { best: 0, bestAt: 0, rounds: [] };

function isRound(r: unknown): r is BlitzRound {
  const o = r as Partial<BlitzRound> | null;
  return typeof o?.p === "number" && typeof o?.c === "number" && typeof o?.n === "number" && typeof o?.at === "number";
}

function loadStore(): BlitzStore {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return EMPTY_STORE;
    const parsed = JSON.parse(raw) as Partial<BlitzStore> | null;
    if (parsed && typeof parsed.best === "number" && Array.isArray(parsed.rounds)) {
      return {
        best: parsed.best,
        bestAt: typeof parsed.bestAt === "number" ? parsed.bestAt : 0,
        rounds: parsed.rounds.filter(isRound),
      };
    }
  } catch {
    /* private mode / server render — fall through */
  }
  return EMPTY_STORE;
}

// Render-time store access must be deterministic across the server render
// and the hydration render, so reads go through a module cache: the server
// and the first client render both see EMPTY, and commits (round end) keep
// cache and localStorage in lockstep afterwards.
let storeCache: BlitzStore | null = null;

function peekStore(): BlitzStore {
  if (!storeCache) storeCache = loadStore();
  return storeCache;
}

function commitStore(s: BlitzStore) {
  storeCache = s;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(s));
  } catch {
    /* private mode — the wall just won't persist */
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Mcq[] {
  return shuffle(LESSONS.flatMap((l) => l.mcqs));
}

function fmtClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Speed bonus: the full 50 inside the first moments, gone by 12.5s. */
function speedBonus(usedMs: number): number {
  return Math.max(0, Math.round(SPEED_MAX * (1 - usedMs / SPEED_WINDOW_MS)));
}

function comboFor(streak: number): number {
  return streak >= 6 ? 3 : streak >= 3 ? 2 : 1;
}

const emptySubscribe = () => () => {};

interface Feedback {
  correct: boolean;
  timeout: boolean;
  pts: number;
  xp: number;
  pick: number | null;
  answer: number;
}

/** What the live HUD renders — mirrored out of the round ref on every event. */
interface Mirror {
  q: Mcq | null;
  points: number;
  streak: number;
}

export function BlitzMode() {
  // SSR-safe client gate — same shape as the SeeQ buddy.
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const [screen, setScreen] = useState<"intro" | "live" | "done">("intro");
  const [fb, setFb] = useState<Feedback | null>(null);
  const [done, setDone] = useState<{ rec: BlitzRound; isPB: boolean } | null>(null);
  const [mirror, setMirror] = useState<Mirror>({ q: null, points: 0, streak: 0 });
  const [clock, setClock] = useState({ round: ROUND_MS, q: QUESTION_MS });

  // The round's mutable truth — touched exclusively by callbacks below.
  const r = useRef({
    phase: "intro" as "intro" | "live" | "done",
    deck: [] as Mcq[],
    idx: 0,
    points: 0,
    correct: 0,
    missed: 0,
    streak: 0,
    bestStreak: 0,
    roundXp: 0,
    recordBeaten: false,
    answered: false,
    roundEnd: 0,
    qEnd: 0,
    advance: null as number | null,
  });

  const source = useMemo(() => {
    const map = new Map<string, { num: number; title: string }>();
    for (const l of LESSONS) for (const m of l.mcqs) map.set(m.id, { num: l.num, title: l.title });
    return map;
  }, []);

  // Both clock faces derive from the deadline refs — read at callback time,
  // never during render.
  const computeClock = useCallback(() => {
    const t = Date.now();
    return {
      round: Math.max(0, r.current.roundEnd - t),
      q: Math.max(0, r.current.qEnd - t),
    };
  }, []);

  const advance = useCallback(() => {
    const rc = r.current;
    if (rc.advance !== null) {
      window.clearTimeout(rc.advance);
      rc.advance = null;
    }
    if (rc.phase !== "live") return;
    const next = rc.idx + 1;
    if (next >= rc.deck.length) {
      // the whole course inside 90 seconds — deal a fresh shoe and keep going
      rc.deck = buildDeck();
      rc.idx = 0;
    } else {
      rc.idx = next;
    }
    rc.answered = false;
    rc.qEnd = Date.now() + QUESTION_MS;
    setMirror({ q: rc.deck[rc.idx] ?? null, points: rc.points, streak: rc.streak });
    setFb(null);
    setClock(computeClock());
  }, [computeClock]);

  const endRound = useCallback(() => {
    const rc = r.current;
    if (rc.phase !== "live") return;
    rc.phase = "done";
    if (rc.advance !== null) {
      window.clearTimeout(rc.advance);
      rc.advance = null;
    }
    const prev = peekStore();
    const paidDay = useProgress.getState().awardXp(`blitzday:${dayKey()}`, XP_ROUND_DAY);
    const rec: BlitzRound = {
      p: rc.points,
      c: rc.correct,
      n: rc.correct + rc.missed,
      s: rc.bestStreak,
      at: Date.now(),
      xp: rc.roundXp + (paidDay ? XP_ROUND_DAY : 0),
    };
    // the first round ever sets the baseline silently; a REAL record is
    // beating a previous best
    const isPB = prev.best > 0 && rec.p > prev.best;
    commitStore({
      best: Math.max(prev.best, rec.p),
      bestAt: isPB ? rec.at : prev.bestAt,
      rounds: [rec, ...prev.rounds].slice(0, HISTORY_MAX),
    });
    setDone({ rec, isPB });
    setFb(null);
    setScreen("done");
    if (isPB) celebrate({ kind: "xp", title: "New blitz record", sub: `${rec.p} points — the wall remembers.` });
    seeqBlitz("end", rec.s, rec.p);
  }, []);

  const answer = useCallback(
    (pick: number | null) => {
      const rc = r.current;
      if (rc.phase !== "live" || rc.answered) return;
      const mcq = rc.deck[rc.idx];
      if (!mcq) return;
      rc.answered = true;
      const t = Date.now();
      const used = Math.min(QUESTION_MS, Math.max(0, QUESTION_MS - (rc.qEnd - t)));
      const isCorrect = pick !== null && pick === mcq.answer;
      let pts = 0;
      let xp = 0;
      if (isCorrect) {
        rc.streak += 1;
        rc.bestStreak = Math.max(rc.bestStreak, rc.streak);
        pts = (BASE_POINTS + speedBonus(used)) * comboFor(rc.streak);
        rc.points += pts;
        rc.correct += 1;
        if (useProgress.getState().awardXp(`blitzq:${mcq.id}`, XP_PER_FIRST)) {
          xp = XP_PER_FIRST;
          rc.roundXp += xp;
        }
        if (rc.streak % 3 === 0) {
          // milestones first — a fresh personal best (fired once, after)
          // gets the last word in the buddy's feed
          seeqBlitz(rc.streak === 3 ? "hot3" : "hot6", rc.streak, rc.points);
        }
        const st = peekStore();
        if (!rc.recordBeaten && st.best > 0 && rc.points > st.best) {
          rc.recordBeaten = true;
          seeqBlitz("record", rc.streak, rc.points);
        }
      } else {
        // the miss carries the streak that just died — the buddy narrates it
        seeqBlitz("miss", rc.streak, rc.points);
        rc.streak = 0;
        rc.missed += 1;
      }
      setFb({ correct: isCorrect, timeout: pick === null, pts, xp, pick, answer: mcq.answer });
      setMirror({ q: mcq, points: rc.points, streak: rc.streak });
      setClock(computeClock());
      if (rc.advance !== null) window.clearTimeout(rc.advance);
      rc.advance = window.setTimeout(
        advance,
        isCorrect ? NEXT_DELAY_CORRECT : pick === null ? NEXT_DELAY_TIMEOUT : NEXT_DELAY_WRONG,
      );
    },
    [advance, computeClock],
  );

  // The heartbeat: round clock, question timeout, clock faces. Interval
  // updaters are the sanctioned effect shape for ticking state.
  useEffect(() => {
    if (screen !== "live") return;
    const id = window.setInterval(() => {
      const t = Date.now();
      if (r.current.roundEnd - t <= 0) {
        endRound();
        return;
      }
      if (!r.current.answered && r.current.qEnd - t <= 0) answer(null);
      setClock(computeClock());
    }, 100);
    return () => window.clearInterval(id);
  }, [screen, endRound, answer, computeClock]);

  // Keys 1–4 / A–D answer — blitz rewards the fastest honest input.
  useEffect(() => {
    if (screen !== "live") return;
    const onKey = (e: KeyboardEvent) => {
      if (r.current.phase !== "live" || r.current.answered) return;
      const mcq = r.current.deck[r.current.idx];
      if (!mcq) return;
      const k = e.key.toLowerCase();
      const i = /^[1-4]$/.test(k) ? Number(k) - 1 : /^[a-d]$/.test(k) ? k.charCodeAt(0) - 97 : -1;
      if (i >= 0 && i < mcq.choices.length) {
        e.preventDefault();
        answer(i);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, answer]);

  // Leaving mid-round (sidebar nav, unmount) releases the buddy.
  useEffect(
    () => () => {
      if (r.current.advance !== null) window.clearTimeout(r.current.advance);
      if (r.current.phase === "live") seeqBlitz("end", 0, 0);
    },
    [],
  );

  function startRound() {
    const deck = buildDeck();
    r.current = {
      phase: "live",
      deck,
      idx: 0,
      points: 0,
      correct: 0,
      missed: 0,
      streak: 0,
      bestStreak: 0,
      roundXp: 0,
      recordBeaten: false,
      answered: false,
      roundEnd: Date.now() + ROUND_MS,
      qEnd: Date.now() + QUESTION_MS,
      advance: null,
    };
    setMirror({ q: deck[0] ?? null, points: 0, streak: 0 });
    setFb(null);
    setDone(null);
    setScreen("live");
    setClock({ round: ROUND_MS, q: QUESTION_MS });
    seeqBlitz("start", 0, 0);
  }

  if (!mounted) return null;
  const store = peekStore();

  const header = (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Toolbox</p>
      <h1 className="mt-2 flex items-center gap-3 font-display text-2xl font-semibold tracking-tight text-zinc-50"><Icon3D name="bolt" size={34} />Blitz mode</h1>
    </>
  );

  // ---- intro ---------------------------------------------------------------

  if (screen === "intro") {
    return (
      <div className="max-w-3xl">
        {header}
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Ninety seconds, questions from all {LESSONS.length} lessons, one at a time. The clock never
          stops — answer fast, keep the combo, and the points compound.
        </p>

        <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <div className="grid gap-3.5 text-sm leading-relaxed text-zinc-300">
            <p className="flex items-start gap-3">
              <Timer className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <span>
                <span className="font-medium text-zinc-100">90 seconds on the clock, 25 per question.</span>{" "}
                Reading feedback costs time too — the round clock never pauses.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <span>
                <span className="font-medium text-zinc-100">+100 points per correct, up to +50 for speed.</span>{" "}
                Answer inside the first moments of the window to bank the full bonus.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <Flame className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <span>
                <span className="font-medium text-zinc-100">3 straight = ×2. 6 straight = ×3.</span>{" "}
                A miss or a timeout resets the combo — and costs nothing else.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <span>
                <span className="font-medium text-zinc-100">Misses never cost XP.</span> Every question
                pays +2 XP the first time you beat it, and a finished round banks +10 XP once a day.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <Keyboard className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <span>
                <span className="font-medium text-zinc-100">Keys 1–4 answer.</span> Speed is the whole
                game — the mouse is allowed but the keyboard is honest.
              </span>
            </p>
          </div>
        </div>

        {store.best > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="tnum flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 font-mono text-xs text-amber-200">
              <Trophy className="h-3.5 w-3.5" />
              best {store.best.toLocaleString("en-US")} pts
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              {store.rounds.length} round{store.rounds.length === 1 ? "" : "s"} on the wall
            </span>
          </div>
        )}

        <button
          onClick={startRound}
          className="btn-glow mt-5 flex items-center gap-2 rounded-md bg-emerald-400 px-5 py-2.5 text-sm font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
        >
          <Zap className="h-4 w-4" />
          Start the clock
        </button>

        {store.rounds.length > 0 && <RoundHistory rounds={store.rounds} highlightAt={null} />}
      </div>
    );
  }

  // ---- live ----------------------------------------------------------------

  if (screen === "live") {
    const { q: mcq, points, streak } = mirror;
    const mult = comboFor(streak);
    const src = mcq ? source.get(mcq.id) : undefined;
    const clockTone =
      clock.round > 30_000 ? "text-emerald-300" : clock.round > 10_000 ? "text-amber-300" : "text-rose-300";
    return (
      <div className="max-w-3xl">
        {header}

        <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <span className={cn("tnum flex items-center gap-1.5 font-mono text-lg font-semibold", clockTone, clock.round <= 10_000 && "animate-pulse")}>
              <Timer className="h-4 w-4" />
              {fmtClock(clock.round)}
            </span>
            <span className="tnum font-mono text-xs text-zinc-500">
              {mult > 1 ? (
                <span className={cn("mr-2 rounded-full border px-2 py-0.5", mult === 3 ? "border-rose-400/50 bg-rose-400/10 text-rose-300" : "border-amber-400/50 bg-amber-400/10 text-amber-300")}>×{mult}</span>
              ) : null}
              {streak > 0 && (
                <span className="mr-2 inline-flex items-center gap-1 text-amber-300">
                  <Flame className="h-3.5 w-3.5" />
                  {streak} straight
                </span>
              )}
              {streak > 0 && streak < 3 && `${3 - streak} more to ×2`}
              {streak >= 3 && streak < 6 && `${6 - streak} more to ×3`}
              {streak >= 6 && "maxed"}
            </span>
            <span className="tnum font-display text-xl font-semibold text-zinc-50">
              {points.toLocaleString("en-US")}
              <span className="ml-1 font-mono text-[10px] font-normal uppercase tracking-wider text-zinc-500">pts</span>
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className={cn("h-full rounded-full transition-[width] duration-100 ease-linear", clock.round > 30_000 ? "bg-emerald-400" : clock.round > 10_000 ? "bg-amber-400" : "bg-rose-400")}
              style={{ width: `${(clock.round / ROUND_MS) * 100}%` }}
            />
          </div>
          <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-zinc-800/60">
            <div
              className={cn("h-full rounded-full transition-[width] duration-100 ease-linear", clock.q <= 5_000 ? "bg-rose-400" : "bg-amber-400/80")}
              style={{ width: `${(clock.q / QUESTION_MS) * 100}%` }}
            />
          </div>
        </div>

        {mcq && (
          <div className="sheen mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                {src ? `From Lesson ${String(src.num).padStart(2, "0")} · ${src.title}` : "Course question"}
              </p>
              <p className="hidden shrink-0 font-mono text-[10px] text-zinc-600 sm:block">keys 1–4</p>
            </div>
            <p className="mt-2.5 text-sm font-medium leading-relaxed text-zinc-100">
              <RichNodes text={mcq.prompt} />
            </p>
            <div className="mt-3.5 grid gap-2">
              {mcq.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  disabled={!!fb}
                  className={cn(
                    "group flex items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-all duration-150 active:scale-[0.995]",
                    fb
                      ? i === fb.answer
                        ? "border-emerald-400/70 bg-emerald-400/10 text-zinc-100"
                        : i === fb.pick
                          ? "border-rose-400/70 bg-rose-400/10 text-zinc-300"
                          : "border-zinc-800/70 bg-zinc-950 text-zinc-600"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium transition-colors",
                      fb && i === fb.answer
                        ? "border-emerald-400 bg-emerald-400 text-[var(--brand-ink)]"
                        : fb && i === fb.pick
                          ? "border-rose-400 bg-rose-400 text-zinc-950"
                          : "border-zinc-700 text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-300",
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={cn("text-xs leading-relaxed", looksLikeSql(choice) ? "font-mono text-zinc-200" : "text-zinc-300")}>
                    {looksLikeSql(choice) ? <SqlNodes text={choice} /> : <RichNodes text={choice} />}
                  </span>
                </button>
              ))}
            </div>

            {fb && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className={cn(
                    "mt-3.5 rounded-md border px-3.5 py-3 text-xs leading-relaxed",
                    fb.correct ? "border-emerald-400/30 bg-emerald-400/[0.06] text-zinc-300" : "border-amber-400/30 bg-amber-400/[0.06] text-zinc-300",
                  )}
                >
                  <span className={cn("font-semibold", fb.correct ? "text-emerald-300" : "text-amber-300")}>
                    {fb.correct
                      ? `Correct. +${fb.pts} pts${mult > 1 ? ` (×${mult} combo)` : ""}${fb.xp > 0 ? ` · +${fb.xp} XP` : ""}. `
                      : fb.timeout
                        ? "Time. "
                        : "Not quite. "}
                  </span>
                  <RichNodes text={mcq.why} />
                </motion.div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] text-zinc-500">the round clock keeps running — the next one loads itself</p>
                  <button
                    onClick={advance}
                    className="btn-glow flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-400 px-3.5 py-1.5 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
                  >
                    Next now
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // ---- done ----------------------------------------------------------------

  const rec = done?.rec;
  const verdict = !rec
    ? null
    : rec.p === 0
      ? "The clock won this one. The deck will be kinder — probably."
      : rec.n >= 8 && rec.c === rec.n
        ? "Every question faced, every question right. The wall is impressed."
        : rec.c * 2 >= rec.n
          ? "More right than wrong at speed — the fundamentals are holding."
          : "Points on the board. Slower rounds (the Mixed quiz) will shore up the misses.";
  return (
    <div className="max-w-3xl">
      {header}
      {rec && (
        <>
          <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
            {done?.isPB && (
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-0.5 font-mono text-[11px] text-amber-200">
                <Trophy className="h-3.5 w-3.5" />
                new personal best
              </span>
            )}
            <motion.p
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="tnum font-display text-4xl font-semibold tracking-tight text-zinc-50"
            >
              {rec.p.toLocaleString("en-US")}
              <span className="ml-2 align-middle font-mono text-xs font-normal uppercase tracking-wider text-zinc-500">points</span>
            </motion.p>
            {verdict && <p className="mt-2 text-sm leading-relaxed text-zinc-400">{verdict}</p>}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "correct", value: `${rec.c}/${rec.n}` },
                { label: "best streak", value: `${rec.s}` },
                { label: "XP banked", value: `+${rec.xp}` },
                { label: "your best", value: store.best.toLocaleString("en-US") },
              ].map((s) => (
                <div key={s.label} className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                  <p className="tnum font-mono text-sm font-semibold text-zinc-100">{s.value}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={startRound}
              className="btn-glow mt-4 flex items-center gap-2 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Run it back
            </button>
          </div>
          <RoundHistory rounds={store.rounds} highlightAt={rec.at} />
        </>
      )}
    </div>
  );
}

// ---- the wall ---------------------------------------------------------------

function RoundHistory({ rounds, highlightAt }: { rounds: BlitzRound[]; highlightAt: number | null }) {
  if (rounds.length === 0) return null;
  return (
    <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Recent rounds</p>
      <div className="mt-2.5 grid gap-1">
        {rounds.slice(0, 6).map((rd) => (
          <div
            key={rd.at}
            className={cn(
              "tnum flex items-center justify-between gap-3 rounded px-2 py-1.5 font-mono text-xs",
              rd.at === highlightAt ? "bg-emerald-400/[0.07] text-emerald-200" : "text-zinc-400",
            )}
          >
            <span className="shrink-0 text-zinc-500">
              {rd.at === highlightAt
                ? "just now"
                : new Date(rd.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="flex-1 text-right">{rd.p.toLocaleString("en-US")} pts</span>
            <span className="w-14 text-right">
              {rd.c}/{rd.n}
            </span>
            <span className="w-16 text-right text-zinc-500">streak {rd.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
