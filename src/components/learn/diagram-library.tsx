"use client";

// Diagram library — every animated diagram taught in the course, in one
// grid. Search across figure/lesson/module wording, filter by module, and
// open any figure full-size (replay + a jump into its lesson). The visual
// layer becomes a first-class revision tool instead of page decoration.

import { useMemo, useState } from "react";
import { Maximize2, Search, Shapes, X } from "lucide-react";
import type { FigureId } from "@/lib/curriculum/types";
import { MODULES } from "@/lib/curriculum/lessons";
import { FIGURE_META, figureChip, prettyFigureLabel } from "@/lib/curriculum/figure-meta";
import { FigureBare } from "./diagrams";
import { FigureLightbox } from "./figure-lightbox";
import { cn } from "@/lib/utils";

export function DiagramLibrary({ onOpenLesson }: { onOpenLesson: (lessonId: string) => void }) {
  const [query, setQuery] = useState("");
  const [moduleNum, setModuleNum] = useState<number | null>(null);
  const [open, setOpen] = useState<FigureId | null>(null);

  // figures per module for the filter chips
  const counts = useMemo(() => {
    const c = new Map<number, number>();
    for (const f of FIGURE_META) c.set(f.moduleNum, (c.get(f.moduleNum) ?? 0) + 1);
    return c;
  }, []);
  const taughtModules = useMemo(() => MODULES.filter((m) => (counts.get(m.num) ?? 0) > 0), [counts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FIGURE_META.filter((f) => {
      if (moduleNum !== null && f.moduleNum !== moduleNum) return false;
      if (!q) return true;
      const hay = `${f.figure} ${prettyFigureLabel(f.figure)} ${f.lessonTitle} ${f.moduleTitle} m${f.moduleNum} l${f.lessonNum}`.toLowerCase();
      return q.split(/\s+/).every((t) => hay.includes(t));
    });
  }, [query, moduleNum]);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-2.5">
        <Shapes className="h-5 w-5 text-emerald-400" />
        <span className="font-mono text-xs text-zinc-500">DIAGRAM LIBRARY · {FIGURE_META.length} ANIMATED</span>
      </div>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
        The course, drawn
      </h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-7 text-zinc-400">
        Every moving diagram from every lesson on one wall — the WHERE gate, the GROUP BY buckets, the join
        matches, the window frames. Search it before an assessment, replay a mechanism until it sticks, then
        jump straight back into the lesson that teaches it.
      </p>

      {/* controls */}
      <div className="mt-5 flex flex-col gap-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search diagrams, lessons, modules…"
            aria-label="Search the diagram library"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-8 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-400/40 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-zinc-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="thin-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setModuleNum(null)}
            aria-pressed={moduleNum === null}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs transition-colors",
              moduleNum === null
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
            )}
          >
            All · {FIGURE_META.length}
          </button>
          {taughtModules.map((m) => (
            <button
              key={m.id}
              onClick={() => setModuleNum(m.num)}
              aria-pressed={moduleNum === m.num}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                moduleNum === m.num
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
              )}
            >
              {m.num} · {m.title} · {counts.get(m.num)}
            </button>
          ))}
        </div>
      </div>

      {/* results */}
      <p className="tnum mt-4 font-mono text-[11px] text-zinc-600" aria-live="polite">
        {filtered.length === FIGURE_META.length
          ? `${FIGURE_META.length} diagrams · all modules`
          : `${filtered.length} of ${FIGURE_META.length} diagrams`}
      </p>

      {filtered.length === 0 ? (
        <div className="sheen mt-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-10 text-center">
          <p className="text-sm text-zinc-300">Nothing drawn that way.</p>
          <p className="mt-1 text-xs text-zinc-500">Try “join”, “group”, “window” — or clear the filters.</p>
          <button
            onClick={() => {
              setQuery("");
              setModuleNum(null);
            }}
            className="mt-3 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            // div-based card, not <button>: some figures (L8WhereHaving,
            // S8Capstone steppers) contain real <button> controls — nesting
            // them in a <button> is invalid DOM. The inert preview keeps the
            // stepper controls out of the tab order; the card itself opens.
            <div
              key={f.figure}
              role="button"
              tabIndex={0}
              onClick={() => setOpen(f.figure)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(f.figure);
                }
              }}
              aria-label={`Open the ${prettyFigureLabel(f.figure)} diagram from lesson ${f.lessonNum}`}
              className="group sheen cursor-pointer overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-left transition-colors hover:border-emerald-400/40 focus-visible:border-emerald-400/60 focus-visible:outline-none"
            >
              {/* thumbnail — top-cropped full-width render of the real figure */}
              <div className="cv-auto relative h-[136px] overflow-hidden border-b border-zinc-800/70 p-2">
                <div className="pointer-events-none" inert>
                  <FigureBare id={f.figure} />
                </div>
                <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded border border-zinc-800 bg-zinc-950/80 text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100">
                  <Maximize2 className="h-3 w-3" />
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="truncate text-xs font-medium text-zinc-200">{prettyFigureLabel(f.figure)}</span>
                <span className="tnum shrink-0 font-mono text-[10px] text-zinc-500">{figureChip(f)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <FigureLightbox
        id={open}
        onClose={() => setOpen(null)}
        onOpenLesson={(lessonId) => {
          setOpen(null);
          onOpenLesson(lessonId);
        }}
      />
    </div>
  );
}
