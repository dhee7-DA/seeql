"use client";

// Figure chrome for lessons — wraps the bare diagram with real course context
// (module · lesson chip + readable label derived from the figure id) and a
// Replay control. Figures animate once on scroll-into-view; replay remounts
// the diagram so a learner can watch the mechanics again at any time.

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { FigureId } from "@/lib/curriculum/types";
import { figureChip, figureMetaOf, prettyFigureLabel } from "@/lib/curriculum/figure-meta";
import { FigureBare } from "./diagrams";

export function FigureFrame({ id }: { id: FigureId }) {
  const [tick, setTick] = useState(0);
  const meta = figureMetaOf(id);
  const label = prettyFigureLabel(id);

  return (
    <figure id={`fig-${id}`} className="my-5 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            {meta ? figureChip(meta) : "diagram"}
          </span>
          <span className="truncate text-xs font-medium text-zinc-200">{label}</span>
        </div>
        <button
          onClick={() => setTick((t) => t + 1)}
          aria-label={`Replay the ${label} animation`}
          className="inline-flex shrink-0 items-center gap-1 rounded border border-zinc-800 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
        >
          <RotateCcw className="h-3 w-3" />
          replay
        </button>
      </div>
      {/* key remount restarts the framer-motion entrance when replay is hit */}
      <div className="p-3" key={tick}>
        <FigureBare id={id} />
      </div>
      <figcaption className="border-t border-zinc-800 px-3 py-2 text-[11px] text-zinc-500">
        Animated diagram — real numbers from the storefront database.
        {meta?.lessonTitle ? ` Taught in lesson ${meta.lessonNum}, “${meta.lessonTitle}”.` : ""}
      </figcaption>
    </figure>
  );
}
