// Task 41 — compact authoring helper for the Module 10 (Window Functions
// Masterclass) case batches. Tuple rows expand into full CaseStudy objects
// with sequential ids (cs-1676…cs-1975). Topics n1–n6 audit as single-table,
// single-SELECT window cases (no JOIN, no subqueries).

import type { CaseStudy, CaseSlot, CaseTier } from "./types";

type SlotT = [answer: string, kind: "number" | "keyword", label: string, why: string];

export type M10CaseRow = [
  tier: CaseTier,
  universe: string,
  title: string,
  brief: string,
  ask: string,
  template: string,
  slots: SlotT[],
  distractors: string[],
  walkthrough: string,
];

export function m10Cases(topic: string, startId: number, rows: M10CaseRow[]): CaseStudy[] {
  return rows.map((r, i): CaseStudy => ({
    id: `cs-${startId + i}`,
    tier: r[0],
    topic,
    universe: r[1],
    title: r[2],
    brief: r[3],
    ask: r[4],
    template: r[5],
    slots: r[6].map(([answer, kind, label, why]): CaseSlot => ({ answer, kind, label, why })),
    distractors: r[7],
    walkthrough: r[8],
  }));
}
