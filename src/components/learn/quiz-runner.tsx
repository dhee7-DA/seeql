"use client";

// Quiz mode for a lesson's knowledge check: MCQs in pages of 5 with a mini
// progress bar, per-page score dots, and an end-of-quiz score summary card.
// Pages stay freely navigable — the goal is practice, not a gate.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { McqCard } from "@/components/learn/mcq";
import { celebrate } from "@/components/learn/celebrate";
import { Ring, Rise } from "@/components/learn/fx";
import { mcqPassed, useProgress } from "@/lib/curriculum/progress";
import type { MCQ } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";

const PER_PAGE = 5;

function tierFor(pct: number): { title: string; text: string; tone: string } {
  if (pct >= 90)
    return {
      title: "Mastered",
      text: "Interview-ready on this topic. Move on — the case studies will keep it honest.",
      tone: "text-emerald-300",
    };
  if (pct >= 70)
    return {
      title: "Solid",
      text: "Good grip with a few soft spots. Re-read the missed explanations below and retry them.",
      tone: "text-teal-300",
    };
  if (pct >= 40)
    return {
      title: "Warming up",
      text: "The concepts are landing but need reps. Revisit the theory, then retry the missed ones.",
      tone: "text-amber-300",
    };
  return {
    title: "Keep grinding",
    text: "Every wrong answer taught you something. Work through the theory once more and go again.",
    tone: "text-rose-300",
  };
}

export function QuizRunner({ mcqs }: { mcqs: MCQ[] }) {
  const mcqBest = useProgress((s) => s.mcqBest);
  const [page, setPage] = useState(0);

  const passed = mcqs.filter((m) => mcqPassed(useProgress.getState(), m.id)).length;
  const pages = Math.max(1, Math.ceil(mcqs.length / PER_PAGE));
  const isLast = page === pages - 1;
  const pct = mcqs.length ? Math.round((passed / mcqs.length) * 100) : 0;

  // per-page score map for the page dots
  const pageScore = (pi: number) => {
    const slice = mcqs.slice(pi * PER_PAGE, pi * PER_PAGE + PER_PAGE);
    return slice.filter((m) => mcqBest[m.id] === true).length;
  };

  const slice = mcqs.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const tier = tierFor(pct);

  // celebratory confetti when the full quiz is complete (fires once per mount)
  const complete = passed === mcqs.length;
  const celebratedRef = useRef(false);
  useEffect(() => {
    if (complete && !celebratedRef.current) {
      celebratedRef.current = true;
      celebrate({
        kind: "level",
        title: `Quiz complete — ${mcqs.length}/${mcqs.length}`,
        sub: "Flawless knowledge check",
      });
    }
  }, [complete, mcqs.length]);

  return (
    <div className="space-y-3">
      {/* header: overall progress + pager */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3.5 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Ring pct={mcqs.length ? passed / mcqs.length : 0} size={38} stroke={3.5}>
            <span className="font-mono text-[10px] font-bold text-zinc-200">
              {passed}/{mcqs.length}
            </span>
          </Ring>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-200">
              {pct}% correct so far
            </p>
            <p className="truncate text-[11px] text-zinc-500">
              5 per page · answers save automatically
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: pages }, (_, pi) => {
            const score = pageScore(pi);
            const full = score === Math.min(PER_PAGE, mcqs.length - pi * PER_PAGE);
            return (
              <button
                key={pi}
                type="button"
                onClick={() => setPage(pi)}
                aria-label={`Go to page ${pi + 1}, ${score} correct`}
                className={cn(
                  "flex h-6 items-center gap-1 rounded-full border px-2 font-mono text-[10px] transition-colors",
                  pi === page
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
                    : full
                      ? "border-emerald-400/25 bg-transparent text-emerald-400/80"
                      : "border-zinc-700 bg-transparent text-zinc-500 hover:border-zinc-500",
                )}
              >
                {pi + 1}
                <span className="text-[9px] opacity-80">{score}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* current page */}
      <motion.div
        key={page}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="space-y-3"
      >
        {slice.map((m, i) => (
          <McqCard key={m.id} mcq={m} index={page * PER_PAGE + i + 1} />
        ))}
      </motion.div>

      {/* pager */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="h-8 gap-1.5 border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </Button>
        <span className="mx-auto font-mono text-[11px] text-zinc-500">
          page {page + 1} / {pages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={isLast}
          onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
          className="h-8 gap-1.5 border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          Next
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* end-of-quiz summary on the last page */}
      {isLast && (
        <Rise>
          <div
            className={cn(
              "rounded-xl border p-4",
              complete
                ? "border-emerald-400/30 bg-emerald-400/5"
                : "border-zinc-800 bg-zinc-900/40",
            )}
          >
            <div className="flex items-center gap-3">
              <Ring
                pct={mcqs.length ? passed / mcqs.length : 0}
                size={52}
                stroke={4.5}
                color={pct >= 70 ? "#34d399" : pct >= 40 ? "#fbbf24" : "#fb7185"}
              >
                <span className="font-mono text-xs font-bold text-zinc-100">
                  {pct}%
                </span>
              </Ring>
              <div className="min-w-0">
                <h3
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-bold",
                    tier.tone,
                  )}
                >
                  <ListChecks className="h-4 w-4" />
                  {tier.title} — {passed}/{mcqs.length}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
                  {tier.text}
                </p>
              </div>
            </div>
            {!complete && passed > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-zinc-500">retry pages:</span>
                {Array.from({ length: pages }, (_, pi) =>
                  pageScore(pi) < Math.min(PER_PAGE, mcqs.length - pi * PER_PAGE) ? (
                    <button
                      key={pi}
                      type="button"
                      onClick={() => setPage(pi)}
                      className="rounded-full border border-amber-400/30 bg-amber-400/5 px-2.5 py-0.5 font-mono text-[10px] text-amber-300 transition-colors hover:bg-amber-400/15"
                    >
                      {pi + 1} · {pageScore(pi)}/
                      {Math.min(PER_PAGE, mcqs.length - pi * PER_PAGE)}
                    </button>
                  ) : null,
                )}
              </div>
            )}
          </div>
        </Rise>
      )}
    </div>
  );
}
