"use client";

// Full-screen viewer for a single course diagram — used by the diagram
// library and the lesson-end recap strip. Shows the figure at full width
// with its real course context, a replay control, and (when a opener is
// wired) a jump into the lesson that teaches it.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, RotateCcw, X } from "lucide-react";
import type { FigureId } from "@/lib/curriculum/types";
import { figureChip, figureMetaOf, prettyFigureLabel } from "@/lib/curriculum/figure-meta";
import { FigureBare } from "./diagrams";

export function FigureLightbox({
  id,
  onClose,
  onOpenLesson,
}: {
  id: FigureId | null;
  onClose: () => void;
  /** When provided, the footer offers a jump into the lesson that teaches this figure. */
  onOpenLesson?: (lessonId: string) => void;
}) {
  return (
    <AnimatePresence>
      {id !== null && (
        // keyed by figure id: opening a different diagram remounts the panel,
        // which naturally resets the replay counter (no state-sync effect)
        <LightboxPanel key={id} id={id} onClose={onClose} onOpenLesson={onOpenLesson} />
      )}
    </AnimatePresence>
  );
}

function LightboxPanel({
  id,
  onClose,
  onOpenLesson,
}: {
  id: FigureId;
  onClose: () => void;
  onOpenLesson?: (lessonId: string) => void;
}) {
  const [tick, setTick] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  const meta = figureMetaOf(id);
  const label = prettyFigureLabel(id);

  // Esc to close + focus the close button + body scroll lock while open
  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${label} diagram`}
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="sheen thin-scrollbar max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        {/* window chrome */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-950/95 px-4 py-2.5 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
              {meta ? figureChip(meta) : "diagram"}
            </span>
            <span className="truncate text-xs font-medium text-zinc-100">{label}</span>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close diagram viewer"
            className="rounded border border-zinc-800 p-1.5 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* key remount restarts the framer-motion entrance when replay is hit */}
        <div className="p-4" key={tick}>
          <FigureBare id={id} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3">
          <p className="min-w-0 text-xs leading-5 text-zinc-500">
            {meta ? (
              <>
                <span className="text-zinc-300">Module {meta.moduleNum} · {meta.moduleTitle}</span> — lesson {meta.lessonNum},{" "}
                <span className="text-zinc-300">“{meta.lessonTitle}”</span>
              </>
            ) : (
              "Course diagram — real numbers from the storefront database."
            )}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setTick((t) => t + 1)}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Replay
            </button>
            {meta && onOpenLesson && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLesson(meta.lessonId);
                }}
                className="btn-glow inline-flex items-center gap-1.5 rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-medium text-[#052e1c] transition-colors hover:bg-emerald-300"
              >
                Open lesson {meta.lessonNum}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
