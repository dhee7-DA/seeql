// Gauntlet session persistence — mirrors drill-session.ts: a zustand+persist
// store keyed by scope (`gauntlet:<moduleNum>`), so a half-finished gauntlet
// round survives navigation and reloads. Backed up for free by lib/port.ts
// (seeql- prefix).
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GauntletSurface = "mcqs" | "cases" | "problems";

export interface GauntletSession {
  moduleId: string;
  surface: GauntletSurface;
  difficulty: "easy" | "medium" | "hard" | "all";
  deckIds: string[];
  idx: number;
  roundNum: number;
  deckSize: number;
}

interface GauntletSessionState {
  sessions: Record<string, GauntletSession>;
  put: (scope: string, session: GauntletSession) => void;
  drop: (scope: string) => void;
}

export const useGauntletSession = create<GauntletSessionState>()(
  persist(
    (set) => ({
      sessions: {},
      put: (scope, session) =>
        set((s) => ({ sessions: { ...s.sessions, [scope]: session } })),
      drop: (scope) =>
        set((s) => {
          const next = { ...s.sessions };
          delete next[scope];
          return { sessions: next };
        }),
    }),
    { name: "seeql-gauntlet-v1" },
  ),
);

export function gauntletScope(moduleNum: number | string): string {
  return `gauntlet:${moduleNum}`;
}
