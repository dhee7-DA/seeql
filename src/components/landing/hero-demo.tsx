"use client";

// Hero demo — a looping, self-contained query walkthrough. Flat window
// chrome, clause-by-clause highlighting, pipeline chips with real counts
// (statuses of 103 orders, HAVING n > 10 keeps 3). No glow, no gradient.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STEPS = ["FROM", "GROUP BY", "HAVING", "SELECT"] as const;

const LINES = [
  { key: "SELECT", text: "SELECT status, COUNT(*) AS n" },
  { key: "FROM", text: "FROM orders" },
  { key: "GROUP BY", text: "GROUP BY status" },
  { key: "HAVING", text: "HAVING COUNT(*) > 10;" },
] as const;

const PIPELINE: Array<{ stage: string; note: string; count: string }> = [
  { stage: "FROM orders", note: "103 rows", count: "103" },
  { stage: "GROUP BY status", note: "4 buckets", count: "4" },
  { stage: "HAVING n > 10", note: "cancelled struck (7)", count: "3" },
  { stage: "SELECT status, n", note: "2 columns out", count: "3" },
];

const RESULT: Array<[string, string]> = [
  ["delivered", "52"],
  ["shipped", "30"],
  ["pending", "14"],
];

export function HeroDemo() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setStep((s) => (s + 1) % (STEPS.length + 1)), 1700);
    return () => window.clearInterval(t);
  }, []);

  const active = STEPS[Math.min(step, STEPS.length - 1)];
  const showResult = step >= STEPS.length - 1;

  return (
    <div className="sheen w-full max-w-[540px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full border border-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full border border-zinc-700" />
        </div>
        <span className="font-mono text-[11px] text-zinc-500">seeql — sandbox</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
          <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-emerald-400" /> live
        </span>
      </div>

      <div className="p-4">
        {/* SQL with clause highlighting */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 font-mono text-[12.5px] leading-6">
          {LINES.map((l) => {
            const on = active === l.key && !showResult;
            return (
              <div key={l.key} className={cn("flex gap-3 rounded px-1.5 transition-colors", on && "bg-emerald-400/10")}>
                <span className={cn("w-[72px] shrink-0", on ? "text-emerald-300" : "text-zinc-500")}>{l.key}</span>
                <span className="text-zinc-200">{l.text.replace(/^(SELECT|FROM|GROUP BY|HAVING)\s*/, "")}</span>
              </div>
            );
          })}
        </div>

        {/* pipeline chips */}
        <div className="mt-3 flex min-h-[30px] flex-wrap gap-1.5">
          {PIPELINE.map((p, i) =>
            step >= i ? (
              <motion.span
                key={p.stage}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 font-mono text-[11px] text-zinc-300"
              >
                {p.stage}
                <span className="text-emerald-300">{p.note}</span>
              </motion.span>
            ) : null,
          )}
        </div>

        {/* result */}
        <div className="mt-3 overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-zinc-900">
                <th className="px-3 py-2 font-medium text-zinc-400">status</th>
                <th className="px-3 py-2 text-right font-medium text-zinc-400">n</th>
              </tr>
            </thead>
            <tbody>
              {showResult ? (
                RESULT.map(([s, n]) => (
                  <tr key={s} className="border-t border-zinc-900">
                    <td className="px-3 py-1.5 text-emerald-300">{s}</td>
                    <td className="tnum px-3 py-1.5 text-right text-zinc-300">{n}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-zinc-900">
                  <td colSpan={2} className="px-3 py-2.5 text-center text-[11px] text-zinc-600">
                    running…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
