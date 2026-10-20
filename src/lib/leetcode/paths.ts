// Guided paths — curated, ordered problem sets with a pace. A path is a
// list of slugs (computed from the registries, never hand-typed counts)
// plus a daily target, so the LeetCode band answers "what do I solve
// TODAY?" without a calendar system: the card shows your pace in days.
//
// Paths pay a one-time completion bonus under `lc-path:<id>` — checked
// and awarded by the Paths tab (idempotent, like every XP key).

import { LC_ALL, lcBySlug } from "./registry";
import { DATAFIN_SLUGS, SQL_ALL_SECTIONS } from "./sections";
import { SQL50 } from "./registry-sql50";
import type { LcRef } from "./types";

export interface LcPath {
  id: string;
  title: string;
  /** one-line pitch under the title */
  kicker: string;
  /** how the path is meant to be eaten */
  blurb: string;
  slugs: string[];
  /** suggested pace — problems per day */
  perDay: number;
  /** one-time completion bonus (XP) */
  bonus: number;
  tone: "emerald" | "sky" | "violet" | "amber";
}

/** Registry row lookup restricted to real problems (guards stale slugs). */
const live = (slugs: string[]) => slugs.filter((s) => lcBySlug(s) !== undefined);

const WINDOW_SECTION_IDS = ["free-windows", "premium2-rankings", "premium4-boards"];

export const LC_PATHS: LcPath[] = [
  {
    id: "sql-50", // the official SQL 50, in the study plan's own order
    title: "The official SQL 50",
    kicker: "the study plan, start to finish",
    blurb:
      "LeetCode's own SQL 50 study list in its intended order — SELECT first, then joins, aggregation, grouping, subqueries, strings, advanced select and the advanced finale. The canonical first lap for every SQL interview.",
    slugs: live(SQL50.map((r) => r[1])),
    perDay: 4,
    bonus: 80,
    tone: "emerald",
  },
  {
    id: "windows-cram",
    title: "Window functions crash course",
    kicker: "the #1 interview topic, concentrated",
    blurb:
      "Rankings, running totals, gaps-and-islands thinking — every window problem in the band across the three dedicated sections. If a screen can ask it about OVER(), it lives here.",
    slugs: live(
      WINDOW_SECTION_IDS.flatMap((id) => SQL_ALL_SECTIONS.find((s) => s.id === id)?.slugs ?? []),
    ),
    perDay: 3,
    bonus: 50,
    tone: "sky",
  },
  {
    id: "datafin",
    title: "Data & Finance sprint",
    kicker: "72 authored problems, 12 domain sections",
    blurb:
      "The original domain band — product analytics, finance core, growth, markets, credit risk, fraud, accounting and the quant desk. Each stop teaches its concept from zero with a primer before the query.",
    slugs: live(DATAFIN_SLUGS),
    perDay: 6,
    bonus: 120,
    tone: "violet",
  },
  {
    id: "cram",
    title: "Two-week interview cram",
    kicker: "one problem per skill section, 73 stops",
    blurb:
      "The breadth lap: the first problem of every skill section in canonical order. Five a day for two weeks and you have touched every family the band teaches — perfect the week before screens.",
    slugs: live(SQL_ALL_SECTIONS.map((s) => s.slugs[0]).filter(Boolean)),
    perDay: 5,
    bonus: 100,
    tone: "amber",
  },
];

/** Problems of a path, in path order (registry metadata joined in). */
export function pathProblems(path: LcPath): LcRef[] {
  return path.slugs
    .map((s) => LC_ALL.find((p) => p.slug === s))
    .filter((p): p is LcRef => p !== undefined);
}

/** Days to finish at the path's pace. */
export const pathDays = (path: LcPath) => Math.ceil(path.slugs.length / path.perDay);
