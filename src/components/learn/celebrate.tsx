"use client";

// Celebration layer — flat, quiet, no confetti. A module-level event bus so
// any component can fire a toast without prop drilling; CelebrationHost
// renders a small stack of solid cards in the bottom-right corner.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ToastKind = "xp" | "badge" | "level" | "info";

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  sub?: string;
}

type Listener = (t: Toast) => void;
const listeners = new Set<Listener>();
let seq = 0;

export function celebrate(t: Omit<Toast, "id">) {
  const toast: Toast = { ...t, id: ++seq };
  listeners.forEach((l) => l(toast));
}

export function CelebrationHost() {
  const [stack, setStack] = useState<Toast[]>([]);

  useEffect(() => {
    const fn: Listener = (t) => {
      setStack((s) => [...s.slice(-2), t]);
      window.setTimeout(() => {
        setStack((s) => s.filter((x) => x.id !== t.id));
      }, 3200);
    };
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  const tone: Record<ToastKind, string> = {
    xp: "border-l-emerald-400",
    badge: "border-l-amber-400",
    level: "border-l-teal-400",
    info: "border-l-zinc-500",
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[280px] flex-col gap-2" aria-live="polite">
      <AnimatePresence>
        {stack.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className={cn(
              "rounded-md border border-zinc-800 border-l-2 bg-zinc-950 px-3.5 py-2.5",
              tone[t.kind],
            )}
          >
            <p className="text-sm font-medium text-zinc-100">{t.title}</p>
            {t.sub && <p className="mt-0.5 text-xs leading-snug text-zinc-500">{t.sub}</p>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
