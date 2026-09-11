"use client";

// Drill session persistence — the active round survives navigation.
//
// The Drill Yard unmounts whenever the learner clicks elsewhere (a lesson,
// the schema explorer, the case files) to look something up. Without this
// store the in-progress round — current question, position, score, round
// number — died with the component. Sessions live here, keyed by scope
// ("yard" for the chapter Drill Yard, a lesson id for lesson-scoped
// drills), so both surfaces can hold an independent round. Persisted to
// localStorage under its own key; leaving via sidebar keeps the session,
// explicit abandonment ("← all keywords", "Pick another keyword") drops it.

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DrillSession {
  /** Drill set keyword, e.g. "where" — resolves back to the set on restore. */
  keyword: string;
  /** Question ids in deck order (deck rebuilt from them on restore). */
  deckIds: string[];
  /** Index of the current question within the deck. */
  idx: number;
  /** Correct answers so far in this round. */
  score: number;
  /** 1-based round counter across the chain. */
  roundNum: number;
  /** Intended round size (10, or the full bank after "sweep all"). */
  deckSize: number;
}

interface DrillSessionState {
  sessions: Record<string, DrillSession>;
  put: (scope: string, session: DrillSession) => void;
  drop: (scope: string) => void;
}

export const useDrillSession = create<DrillSessionState>()(
  persist(
    (set) => ({
      sessions: {},
      put: (scope, session) =>
        set((st) => ({ sessions: { ...st.sessions, [scope]: session } })),
      drop: (scope) =>
        set((st) => {
          const sessions = { ...st.sessions };
          delete sessions[scope];
          return { sessions };
        }),
    }),
    { name: "seeql-drill-session-v1" },
  ),
);
