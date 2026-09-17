"use client";

// Landing showcase — cycles through real lesson diagrams (the exact components
// the lessons render), re-mounting each on switch so its entrance animation
// replays. Auto-advances every few seconds; hovering the panel pauses it.
// The window-chrome dots double as manual selectors.

import { useEffect, useState } from "react";
import { FigureBare } from "@/components/learn/diagrams";
import type { FigureId } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";

const SHOWCASE: Array<{ id: FigureId; label: string; note: string }> = [
  { id: "l3-where-gate", label: "WHERE", note: "103 orders in — 65 survive the gate" },
  { id: "l7-groupby", label: "GROUP BY", note: "103 rows split into 4 status buckets" },
  { id: "j2-inner-match", label: "INNER JOIN", note: "only orders with a customer match survive" },
];

const HOLD_MS = 7000;

export function DiagramShowcase() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => setIdx((i) => (i + 1) % SHOWCASE.length), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [idx, paused]);

  const item = SHOWCASE[idx];

  return (
    <div
      className="sheen w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* window chrome — the dots are the selectors */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          {SHOWCASE.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIdx(i)}
              aria-pressed={i === idx}
              aria-label={`Show the ${s.label} diagram`}
              className={cn(
                "h-2.5 w-2.5 rounded-full border transition-colors",
                i === idx ? "border-emerald-400 bg-emerald-400" : "border-zinc-700 hover:border-zinc-500",
              )}
            />
          ))}
        </div>
        <span className="font-mono text-[11px] text-zinc-500">seeql — lesson diagram</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
          <span className={cn("h-1.5 w-1.5 rounded-full bg-emerald-400", !paused && "pulse-soft")} />
          {paused ? "paused" : "live"}
        </span>
      </div>

      <div className="p-4">
        <div className="rounded-lg border border-zinc-800 p-3">
          {/* key remounts the diagram so the entrance animation replays */}
          <div key={item.id}>
            <FigureBare id={item.id} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs leading-5 text-zinc-400">
            <span className="font-mono text-emerald-300">{item.label}</span> — {item.note}
          </p>
          <p className="tnum font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            {idx + 1} / {SHOWCASE.length}
          </p>
        </div>
      </div>
    </div>
  );
}
