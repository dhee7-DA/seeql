"use client";

// Rank-up celebration — flat, quiet, no confetti. When the badge/level
// watcher sees XP cross a rank boundary it raises this card: solid zinc-900
// surface, 1px emerald border, the new rank's name and a one-line
// "next rank in N XP" footer. Auto-dismisses after ~4s; a click dismisses
// early. Motion is the shell's flat scale/fade spring (reduced-motion aware).

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Icon3D } from "./ui/icon3d";

export interface RankUpInfo {
  /** New rank title, e.g. "Analyst I". */
  title: string;
  /** XP still needed for the next rank, or null at the top of the ladder. */
  nextInXp: number | null;
}

const RANK_UP_MS = 4000;

export function RankUpCard({ info, onDismiss }: { info: RankUpInfo | null; onDismiss: () => void }) {
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    if (!info) return;
    const t = setTimeout(onDismiss, RANK_UP_MS);
    return () => clearTimeout(t);
  }, [info, onDismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
      <AnimatePresence>
        {info && (
          <motion.button
            key={info.title}
            type="button"
            onClick={onDismiss}
            aria-label={`Rank up — ${info.title}. Tap to dismiss`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="sheen pointer-events-auto w-full max-w-sm cursor-pointer rounded-lg border border-emerald-400/50 bg-zinc-900 p-4 text-left"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">Rank up</p>
            <div className="mt-2 flex items-center gap-3">
              <Icon3D name="rocket" size={34} anim="bob" />
              <p className="font-display text-xl font-semibold tracking-[-0.02em] text-zinc-50">{info.title}</p>
            </div>
            <p className="mt-3 border-t border-zinc-800 pt-2.5 text-[11px] text-zinc-500">
              {info.nextInXp === null
                ? "Top rank reached — Query Wizard"
                : `Next rank in ${info.nextInXp.toLocaleString()} XP`}
            </p>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
