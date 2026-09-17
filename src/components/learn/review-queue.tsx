"use client";

// ReviewQueue — the tracker's memory turned into a study plan. Every quiz
// question answered wrong on its first try lives here until it's answered
// right on a later visit (recordMcqRetry clears it). Grouped by lesson so
// "retry" opens exactly the right place in the course.

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { LESSONS } from "@/lib/curriculum/lessons";
import { useProgress } from "@/lib/curriculum/progress";
import { cn } from "@/lib/utils";
import { Wiggle } from "./flutter";

interface WeakLesson {
  lessonId: string;
  num: number;
  title: string;
  missed: string[];
  shaky: number;
}

const MCQ_ID_RE = /^l(\d+)-q(\d+)$/;

function lessonFor(mcqId: string) {
  const m = MCQ_ID_RE.exec(mcqId);
  if (!m) return null;
  const num = Number(m[1]);
  const lesson = LESSONS.find((l) => l.num === num);
  return lesson ? { num, lesson } : null;
}

export function ReviewQueue({ onOpenLesson }: { onOpenLesson: (id: string) => void }) {
  const mcqAttempts = useProgress((s) => s.mcqAttempts);

  const weak = useMemo<WeakLesson[]>(() => {
    const byLesson = new Map<number, WeakLesson>();
    for (const [id, a] of Object.entries(mcqAttempts)) {
      const ref = lessonFor(id);
      if (!ref) continue;
      const slot = (() => {
        const existing = byLesson.get(ref.num);
        if (existing) return existing;
        const fresh: WeakLesson = {
          lessonId: ref.lesson.id,
          num: ref.num,
          title: ref.lesson.title,
          missed: [],
          shaky: 0,
        };
        byLesson.set(ref.num, fresh);
        return fresh;
      })();
      if (!a.correct) slot.missed.push(id);
      else if (!a.firstTry) slot.shaky += 1;
    }
    return [...byLesson.values()]
      .filter((w) => w.missed.length > 0 || w.shaky > 0)
      .sort((a, b) => b.missed.length - a.missed.length || a.num - b.num);
  }, [mcqAttempts]);

  const totalPending = weak.reduce((n, w) => n + w.missed.length, 0);
  const totalShaky = weak.reduce((n, w) => n + w.shaky, 0);

  return (
    <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="flex items-center gap-1.5 font-display text-sm font-semibold text-zinc-100">
          <Brain className="h-4 w-4 text-violet-300" />
          Review queue
        </h3>
        <p className="tnum text-[11px] text-zinc-500">
          {totalPending > 0 ? (
            <>
              <span className="font-mono text-violet-300">{totalPending}</span> to win back
            </>
          ) : (
            "all clear"
          )}
        </p>
      </div>

      {weak.length === 0 ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-md border border-zinc-800 bg-zinc-900/40 px-3.5 py-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <p className="text-xs leading-relaxed text-zinc-400">
            Nothing pending — every quiz question you have met is answered right. Open a{" "}
            <span className="text-zinc-200">Mixed quiz</span> from the toolbox to meet new ones.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {weak.map((w, i) => (
            <motion.div
              key={w.lessonId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 320, damping: 28 }}
              className={cn(
                "flex items-center gap-2.5 rounded-md border px-3 py-2.5",
                w.missed.length > 0
                  ? "border-violet-400/30 bg-violet-400/[0.05]"
                  : "border-zinc-800 bg-zinc-900/40",
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 font-mono text-[10px] font-bold text-zinc-300">
                {String(w.num).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-200">{w.title}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-zinc-500">
                  {w.missed.length > 0 && (
                    <>
                      {w.missed.length} question{w.missed.length === 1 ? "" : "s"} missed
                    </>
                  )}
                  {w.missed.length > 0 && w.shaky > 0 && " · "}
                  {w.shaky > 0 && (
                    <span className="inline-flex items-center gap-0.5">
                      <Sparkles className="h-2.5 w-2.5" /> {w.shaky} shaky but passed
                    </span>
                  )}
                </p>
              </div>
              {w.missed.length > 0 && (
                <Wiggle strength={0.6}>
                  <button
                    onClick={() => onOpenLesson(w.lessonId)}
                    className="flex items-center gap-1 rounded-md border border-violet-400/40 bg-violet-400/10 px-2.5 py-1.5 text-[11px] font-medium text-violet-200 transition-colors hover:bg-violet-400/20"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Retry
                  </button>
                </Wiggle>
              )}
            </motion.div>
          ))}
          <p className="pt-1 text-[10px] leading-relaxed text-zinc-600">
            questions you missed wait here until you answer them right on another visit — retrying one clears it
          </p>
        </div>
      )}
    </div>
  );
}
