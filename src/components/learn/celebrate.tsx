"use client";

// Celebration layer — flat, quiet, no confetti. A module-level event bus so
// any component can fire a toast without prop drilling; CelebrationHost
// renders a small stack of solid cards in the bottom-right corner.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon3D, type Icon3DName } from "./ui/icon3d";

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

  const tone: Record<ToastKind, { bar: string; chip: string; Icon: typeof Zap; icon3d?: Icon3DName }> = {
    xp: { bar: "border-l-emerald-400", chip: "bg-emerald-400/15 text-emerald-300", Icon: Zap },
    badge: { bar: "border-l-amber-400", chip: "bg-amber-400/15 text-amber-300", Icon: Zap, icon3d: "trophy" },
    level: { bar: "border-l-teal-400", chip: "bg-teal-400/15 text-teal-300", Icon: Zap, icon3d: "rocket" },
    info: { bar: "border-l-zinc-500", chip: "bg-zinc-400/15 text-zinc-300", Icon: Info },
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[280px] flex-col gap-2" aria-live="polite">
      <AnimatePresence>
        {stack.map((t) => {
          const { bar, chip, Icon, icon3d } = tone[t.kind];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className={cn(
                "sheen flex items-start gap-2.5 rounded-md border border-zinc-800 border-l-2 bg-zinc-950 py-2.5 pl-3 pr-3.5",
                bar,
              )}
            >
              <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md", chip)}>
                {icon3d ? <Icon3D name={icon3d} size={22} anim="bob" /> : <Icon className="h-3.5 w-3.5" />}
              </span>
              <span className="min-w-0">
                <p className="text-sm font-medium leading-snug text-zinc-100">{t.title}</p>
                {t.sub && <p className="mt-0.5 text-xs leading-snug text-zinc-500">{t.sub}</p>}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
