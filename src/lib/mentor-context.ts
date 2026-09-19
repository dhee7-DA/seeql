"use client";

// Mentor context — a tiny global bulletin board where graded surfaces drop
// their last failure, so the AI Mentor opens already pointed at the learner's
// actual problem instead of making them re-explain it.
//
// Writers: practice-kit.execSql (any hard SQL error in the practice lab),
// problem-runner.run (lesson problems that graded wrong or errored).
// Reader: mentor-chat.tsx.

import { create } from "zustand";

export interface MentorFailure {
  /** The learner's SQL, verbatim (trimmed). */
  sql: string;
  /** The database's error string, if the run failed hard. */
  error: string | null;
  /** Human note from the grader, e.g. "right columns, wrong row count". */
  note: string | null;
  /** Where the failure came from, e.g. "Interview · Rung 2" or "Lesson 8". */
  source: string;
  /** Wall-clock stamp so the mentor card can say "just now". */
  at: number;
}

interface MentorContextState {
  failure: MentorFailure | null;
  reportFailure: (f: MentorFailure) => void;
  clearFailure: () => void;
}

export const useMentorContext = create<MentorContextState>((set) => ({
  failure: null,
  reportFailure: (f) => set({ failure: f }),
  clearFailure: () => set({ failure: null }),
}));

/** Fire-and-forget helper for graded surfaces — never throws, never blocks. */
export function reportMentorFailure(f: Omit<MentorFailure, "at">) {
  try {
    useMentorContext.getState().reportFailure({ ...f, at: Date.now() });
  } catch {
    /* mentor context is best-effort */
  }
}
