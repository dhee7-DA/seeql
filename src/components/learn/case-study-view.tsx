"use client";

// Case-study renderer: business narrative → numbered auto-checked query
// parts → debrief card.

import { motion } from "framer-motion";
import { BadgeCheck, BookOpenCheck } from "lucide-react";
import { PopIn } from "@/components/learn/fx";
import { ProblemRunner } from "@/components/learn/problem-runner";
import { useProgress } from "@/lib/curriculum/progress";
import type { CaseStudy } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";

export function CaseStudyView({
  caseStudy,
  onTryInPlayground,
  xpAmount,
}: {
  caseStudy: CaseStudy;
  onTryInPlayground: (sql: string) => void;
  /** XP per solved part — case studies use the flat case-part rate */
  xpAmount?: number;
}) {
  const solved = useProgress((s) => s.solved);
  const doneCount = caseStudy.parts.filter((p) => solved[p.id] === true).length;
  const allDone = doneCount === caseStudy.parts.length;

  return (
    <div className="space-y-5">
      {/* scenario */}
      <div className="rounded-xl border border-violet-400/25 bg-violet-400/5 p-4">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="h-4 w-4 text-violet-300" />
          <h2 className="text-sm font-semibold text-zinc-100">The situation</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          {caseStudy.scenario}
        </p>
      </div>

      {/* parts */}
      <div className="space-y-4">
        {caseStudy.parts.map((part) => (
          <ProblemRunner
            key={part.id}
            problem={part}
            onTryInPlayground={onTryInPlayground}
            xpAmount={xpAmount}
            xpLabel="case study part"
          />
        ))}
      </div>

      {/* debrief */}
      <motion.div
        animate={
          allDone
            ? { scale: [1, 1.012, 1], boxShadow: "0 0 0px rgba(52,211,153,0)" }
            : { scale: 1 }
        }
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={cn(
          "rounded-xl border p-4 transition-opacity",
          allDone
            ? "border-emerald-400/30 bg-emerald-400/5"
            : "border-zinc-800 bg-zinc-900/40 opacity-70",
        )}
      >
        <div className="flex items-center gap-2">
          {allDone ? (
            <PopIn>
              <BadgeCheck className="h-4 w-4 text-emerald-400" />
            </PopIn>
          ) : (
            <BadgeCheck className="h-4 w-4 text-zinc-500" />
          )}
          <h2 className="text-sm font-semibold text-zinc-100">
            Debrief
            {allDone && (
              <span className="ml-2 text-xs font-normal text-emerald-300">
                all {caseStudy.parts.length} checks passed — well worked
              </span>
            )}
          </h2>
          {!allDone && (
            <span className="ml-auto font-mono text-[11px] text-zinc-500">
              {doneCount}/{caseStudy.parts.length} solved
            </span>
          )}
        </div>
        <ul className="mt-2.5 space-y-1.5">
          {caseStudy.debrief.map((d, i) => (
            <li
              key={i}
              className="flex gap-2 text-xs leading-relaxed text-zinc-400"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
              {d}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
