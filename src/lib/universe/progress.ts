"use client";

// Universe progress store — the 208-company layer's own ledger, persisted
// under "seeql.universe.v1". The curriculum store (useProgress) stays the
// single source of truth for XP / streaks / badges / spaced repetition, so
// every universe write MIRRORS into it through the same idempotent actions:
//
//   • mock screens & mastery quizzes bank completion XP via awardXp
//     (the timed run itself stays XP-free — you against the clock first)
//   • every mock MCQ answer feeds the shared 1d→3d→7d→14d review ladder
//     under a "umcq:<kitId>:<mcqId>" card, so misses resurface in the
//     Weak-spots deck exactly like lesson questions do
//   • theory self-marks enroll "uthr:<kitId>:<theoryId>" cards and pay a
//     one-time XP tier (nailed > shaky) per question
//
// What lives ONLY here: mock run history (score reports), per-domain
// mastery-quiz records, theory marks, and the targeted company.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useProgress } from "@/lib/curriculum/progress";
import { XP, dayKey } from "@/lib/curriculum/gamification";

export type TheoryMark = 0 | 0.5 | 1;

export interface UniverseMock {
  /** "mock-<ts>" — also the idempotence key for the completion XP. */
  id: string;
  ts: number;
  /** Companies drawn from — length 1 is a per-kit screen, more is omni. */
  kitIds: string[];
  /** Report headline, e.g. "Amazon screen" / "Omni round · 5 companies". */
  label: string;
  mcqScore: number;
  mcqTotal: number;
  /** Self-marked theory points (max theoryTotal). */
  theoryScore: number;
  theoryTotal: number;
  /** Overall 0..100 — (mcqScore + theoryScore) / (mcqTotal + theoryTotal). */
  pct: number;
  durationSec: number;
}

/** Per-domain mastery quiz ledger. */
export interface DomainQuizRecord {
  attempts: number;
  bestPct: number;
  lastPct: number;
  lastTs: number;
}

/** One completed interview-sim loop (the 4-stage onsite simulation).
 *  Scoring: screening 6 points + coding 2 (1 per passed problem) +
 *  case 1 (self-mark) + theory 2 (half-credit allowed) = 11 points. */
export interface InterviewRun {
  /** "ivw-<ts>" — also the idempotence key for the completion XP. */
  id: string;
  ts: number;
  /** Companies drawn from — length 1 is a company loop, more is a loop day. */
  kitIds: string[];
  /** Report headline, e.g. "Amazon loop" / "Loop day · 5 companies". */
  label: string;
  screen: { ok: number; n: number };
  /** Coding problems passed on submit (parked = fail). */
  coding: { ok: number; n: number };
  /** Self-marked case debrief (0 | 0.5 | 1). */
  caseMark: number;
  theory: { score: number; total: number };
  /** Overall 0..100 — points earned / 11. */
  pct: number;
  durationSec: number;
}

export interface UniverseState {
  /** `u:<kitId>:<mcqId>` → every mock-screen MCQ answer (screen accuracy). */
  mockMcq: Record<string, { correct: boolean; firstTry: boolean; ts: number }>;
  /** `u:<kitId>:<theoryId>` → best self-mark across visits. */
  theoryMarks: Record<string, { best: TheoryMark; ts: number }>;
  /** Completed mock screens, newest first (cap 40 — reports, not a ledger). */
  mocks: UniverseMock[];
  /** Completed interview-sim loops, newest first (cap 20 — debriefs). */
  interviews: InterviewRun[];
  domainQuiz: Record<string, DomainQuizRecord>;
  /** The targeted company id (seeql targeting / readiness track), or null. */
  target: string | null;
  targetSince: number | null;

  /** One mock-screen MCQ answer: records accuracy + feeds the SR ladder. */
  recordMockMcq: (kitId: string, mcqId: string, correct: boolean) => void;
  /** A theory self-mark from a mock screen or the theory reader. */
  recordTheory: (kitId: string, theoryId: string, mark: TheoryMark) => void;
  /** Bank a completed mock: history + completion XP (idempotent per run).
   *  Returns the XP actually banked (0 on a re-bank) so the report can show
   *  an honest number. */
  saveMock: (m: Omit<UniverseMock, "id" | "ts">) => number;
  /** Bank a completed interview-sim loop: history + completion XP (idempotent
   *  per run). Returns the XP actually banked (0 on a re-bank). */
  saveInterview: (m: Omit<InterviewRun, "id" | "ts">) => number;
  /** Bank a domain mastery quiz attempt: record + daily completion XP. */
  recordDomainQuiz: (domainId: string, pct: number) => void;
  setTarget: (id: string | null) => void;
  resetAll: () => void;
}

/** All mock/screen MCQ answers for one kit, merged from both ledgers
 *  (kit-tab answers live in useProgress.mcqAttempts under the bare mcq id,
 *  mock-screen answers live here under u:<kit>:<id>). */
export function kitMcqAccuracy(
  kitId: string,
  kitMcqIds: string[],
  tabAttempts: Record<string, { correct: boolean }>,
  mockMcq: Record<string, { correct: boolean }>,
): { attempted: number; correct: number } {
  let attempted = 0;
  let correct = 0;
  for (const id of kitMcqIds) {
    const tab = tabAttempts[id];
    const mock = mockMcq[`u:${kitId}:${id}`];
    if (!tab && !mock) continue;
    attempted += 1;
    if (tab?.correct || mock?.correct) correct += 1;
  }
  return { attempted, correct };
}

export const useUniverse = create<UniverseState>()(
  persist(
    (set, get) => ({
      mockMcq: {},
      theoryMarks: {},
      mocks: [],
      interviews: [],
      domainQuiz: {},
      target: null,
      targetSince: null,

      recordMockMcq: (kitId, mcqId, correct) => {
        const key = `u:${kitId}:${mcqId}`;
        const prev = get().mockMcq[key];
        set((s) => ({
          mockMcq: {
            ...s.mockMcq,
            [key]: { correct, firstTry: prev ? prev.firstTry : correct, ts: Date.now() },
          },
        }));
        // shared spaced-repetition ladder — misses come back tomorrow,
        // corrects advance 1d→3d→7d→14d exactly like lesson questions
        useProgress.getState().scheduleReview(`umcq:${kitId}:${mcqId}`, correct);
      },

      recordTheory: (kitId, theoryId, mark) => {
        const key = `u:${kitId}:${theoryId}`;
        const prev = get().theoryMarks[key];
        const best = Math.max(prev?.best ?? 0, mark) as TheoryMark;
        set((s) => ({
          theoryMarks: { ...s.theoryMarks, [key]: { best, ts: Date.now() } },
        }));
        // SR: a nailed answer graduates up the ladder, anything less returns
        useProgress.getState().scheduleReview(`uthr:${kitId}:${theoryId}`, mark === 1);
        // one-time XP tiers — "nailed it" pays once, the half-credit tops up once
        const store = useProgress.getState();
        if (mark === 1) store.awardXp(`uth:${kitId}:${theoryId}`, XP.theory);
        else if (mark === 0.5) store.awardXp(`uthhalf:${kitId}:${theoryId}`, XP.theoryHalf);
      },

      saveMock: (m) => {
        const id = `mock-${Date.now()}`;
        const run: UniverseMock = { ...m, id, ts: Date.now() };
        set((s) => ({ mocks: [run, ...s.mocks].slice(0, 40) }));
        // completion bonus — idempotent per run id, so re-banking is a no-op
        const store = useProgress.getState();
        let banked = 0;
        if (store.awardXp(`mock:${id}`, XP.mock)) banked += XP.mock;
        if (m.pct >= 70 && store.awardXp(`mockstrong:${id}`, XP.mockStrongBonus))
          banked += XP.mockStrongBonus;
        return banked;
      },

      saveInterview: (m) => {
        const id = `ivw-${Date.now()}`;
        const run: InterviewRun = { ...m, id, ts: Date.now() };
        set((s) => ({ interviews: [run, ...s.interviews].slice(0, 20) }));
        // completion bonus — idempotent per run id, same rates as a mock
        const store = useProgress.getState();
        let banked = 0;
        if (store.awardXp(`ivw:${id}`, XP.mock)) banked += XP.mock;
        if (m.pct >= 70 && store.awardXp(`ivwstrong:${id}`, XP.mockStrongBonus))
          banked += XP.mockStrongBonus;
        return banked;
      },

      recordDomainQuiz: (domainId, pct) => {
        const prev = get().domainQuiz[domainId];
        set((s) => ({
          domainQuiz: {
            ...s.domainQuiz,
            [domainId]: {
              attempts: (prev?.attempts ?? 0) + 1,
              bestPct: Math.max(prev?.bestPct ?? 0, pct),
              lastPct: pct,
              lastTs: Date.now(),
            },
          },
        }));
        // one completion XP per domain per day — retakes stay about the recall
        useProgress.getState().awardXp(`udq:${domainId}:${dayKey()}`, XP.domainQuiz);
      },

      setTarget: (id) => {
        if (id === null) {
          set({ target: null, targetSince: null });
          return;
        }
        if (get().target === id) return;
        set({ target: id, targetSince: Date.now() });
      },

      resetAll: () =>
        set({
          mockMcq: {},
          theoryMarks: {},
          mocks: [],
          interviews: [],
          domainQuiz: {},
          target: null,
          targetSince: null,
        }),
    }),
    { name: "seeql.universe.v1" },
  ),
);

/** Kit MCQ ids follow "<slug>-mcq-<n>" — distinguishable from lesson
 *  "l<module>-q<n>" ids, which lets badges count universe answers. */
export const KIT_MCQ_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*-mcq-\d+$/;

export function universeMcqCorrect(
  tabAttempts: Record<string, { correct: boolean }>,
): number {
  let n = 0;
  for (const [id, a] of Object.entries(tabAttempts)) {
    if (a.correct && KIT_MCQ_RE.test(id)) n += 1;
  }
  return n;
}
