// Figure metadata — derived from the curriculum itself (the single source of
// truth). Scans every module's lesson blocks for diagram figures and records
// where each one is taught, so any UI (lesson chrome, library, lightbox) can
// label a figure with its real course context without hardcoding a mapping.
// Kept out of diagrams.tsx on purpose: that file is imported by the landing
// showcase and must not drag the whole curriculum into the landing bundle.

import type { FigureId } from "./types";
import { LESSONS, MODULES } from "./lessons";

export interface FigureMeta {
  figure: FigureId;
  moduleNum: number;
  moduleId: string;
  moduleTitle: string;
  /** Stable lesson id, e.g. "lesson-03". */
  lessonId: string;
  lessonNum: number;
  lessonTitle: string;
}

function scan(): FigureMeta[] {
  const seen = new Map<FigureId, FigureMeta>();
  for (const m of MODULES) {
    for (const l of m.lessons) {
      for (const b of l.blocks) {
        if (b.kind === "diagram" && !seen.has(b.figure)) {
          seen.set(b.figure, {
            figure: b.figure,
            moduleNum: m.num,
            moduleId: m.id,
            moduleTitle: m.title,
            lessonId: l.id,
            lessonNum: l.num,
            lessonTitle: l.title,
          });
        }
      }
    }
  }
  return [...seen.values()];
}

/** Every diagram actually taught in the course, in module → lesson order. */
export const FIGURE_META: FigureMeta[] = scan();

const BY_ID = new Map(FIGURE_META.map((f) => [f.figure, f]));

export function figureMetaOf(id: FigureId): FigureMeta | undefined {
  return BY_ID.get(id);
}

/** All lessons a figure appears in (rarely more than one). */
export function lessonsUsingFigure(id: FigureId) {
  return LESSONS.filter((l) => l.blocks.some((b) => b.kind === "diagram" && b.figure === id));
}

const UPPERCASE = new Set(["fk", "pk", "sql", "cte", "vs", "null", "ai"]);

/** "j12-where-vs-on" → "WHERE vs ON" · "l7-groupby" → "GROUPBY" — readable
 *  card titles derived straight from the stable figure ids. */
export function prettyFigureLabel(id: FigureId): string {
  const tail = id.includes("-") ? id.slice(id.indexOf("-") + 1) : id;
  return tail
    .split("-")
    .map((w) => (UPPERCASE.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/** Context chip text, e.g. "M2 · L10". */
export function figureChip(meta: FigureMeta): string {
  return `M${meta.moduleNum} · L${meta.lessonNum}`;
}
