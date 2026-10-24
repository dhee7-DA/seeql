"use client";

// Predict-the-output — mental execution practice. The query is shown with
// its tables; the learner freezes the grid they think the engine returns
// BEFORE running anything. Four grids, one true, three engineered from
// real misconceptions — every pick is coached either way.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Eye, RotateCcw, X } from "lucide-react";
import { Icon3D } from "./ui/icon3d";
import { useProgress } from "@/lib/curriculum/progress";
import { PREDICTS, PREDICTS_XP, type PredictItem } from "@/lib/curriculum/predicts";
import { cn } from "@/lib/utils";
import { awardPracticeXp, MiniGrid, recordPracticeAttempt } from "./practice-kit";
import { SqlNodes } from "./sql-code";

function PredictCard({ item }: { item: PredictItem }) {
  const banked = useProgress((s) => s.xpEvents[`predict:${item.id}`] !== undefined);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const correct = checked && picked === item.answer;

  function check() {
    if (picked === null || checked) return;
    setChecked(true);
    const ok = picked === item.answer;
    recordPracticeAttempt(item.skill, `predict:${item.id}`, ok);
    if (ok) awardPracticeXp(`predict:${item.id}`, PREDICTS_XP, "Predicted the output correctly");
  }

  function reset() {
    setPicked(null);
    setChecked(false);
  }

  return (
    <div className="space-y-4">
      {/* the query */}
      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            {item.id.toUpperCase()}
          </span>
          <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            lesson {String(item.lessonNum).padStart(2, "0")} technique
          </span>
          <span className="text-[10px] uppercase tracking-wider text-zinc-600">
            tables: {item.tables.join(", ")}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.blurb}</p>
        <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-3 font-mono text-[13px] leading-6 text-zinc-200">
          <SqlNodes text={item.sql} />
        </div>
        <p className="mt-2.5 text-[11px] text-zinc-500">
          Don&apos;t run it. Freeze the grid you expect — then check. (Peek at the tables in the Data explorer if
          you need the grain.)
        </p>
      </div>

      {/* the four futures */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {item.choices.map((choice, i) => {
          const isPicked = picked === i;
          const isAnswer = i === item.answer;
          const verdict = checked ? (isAnswer ? "good" : isPicked ? "bad" : "dim") : isPicked ? "armed" : "idle";
          return (
            <button
              key={i}
              onClick={() => !checked && setPicked(i)}
              disabled={checked}
              aria-label={`Result option ${String.fromCharCode(65 + i)}`}
              className={cn(
                "rounded-lg border p-3 text-left transition-all duration-150 active:scale-[0.995]",
                verdict === "good" && "border-emerald-400/70 bg-emerald-400/[0.07]",
                verdict === "bad" && "border-rose-400/70 bg-rose-400/[0.07]",
                verdict === "dim" && "border-zinc-800/60 bg-zinc-950 opacity-50",
                verdict === "armed" && "border-emerald-400/60 bg-emerald-400/[0.05]",
                verdict === "idle" && "border-zinc-800 bg-zinc-950 hover:border-zinc-600",
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-medium",
                    checked && isAnswer
                      ? "border-emerald-400 bg-emerald-400 text-[var(--brand-ink)]"
                      : checked && isPicked
                        ? "border-rose-400 bg-rose-400 text-zinc-950"
                        : isPicked
                          ? "border-emerald-400/70 text-emerald-300"
                          : "border-zinc-700 text-zinc-500",
                  )}
                >
                  {checked && isAnswer ? <CheckCircle2 className="h-3 w-3" /> : checked && isPicked ? <X className="h-3 w-3" /> : String.fromCharCode(65 + i)}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">
                  {choice.rows.length} row{choice.rows.length === 1 ? "" : "s"} × {choice.columns.length} col
                  {choice.columns.length === 1 ? "" : "s"}
                </span>
              </div>
              <MiniGrid columns={choice.columns} rows={choice.rows} tone={checked ? (isAnswer ? "good" : isPicked ? "bad" : "neutral") : "neutral"} />
            </button>
          );
        })}
      </div>

      {/* actions */}
      <div className="flex flex-wrap items-center gap-2">
        {!checked ? (
          <button
            onClick={check}
            disabled={picked === null}
            className={cn(
              "btn-glow rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
              picked === null && "cursor-not-allowed opacity-40",
            )}
          >
            Freeze this output
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className={cn(
              "flex-1 rounded-md border px-3.5 py-3 text-xs leading-relaxed",
              correct ? "border-emerald-400/30 bg-emerald-400/[0.06]" : "border-amber-400/30 bg-amber-400/[0.06]",
            )}
          >
            <span className={cn("font-semibold", correct ? "text-emerald-300" : "text-amber-300")}>
              {correct ? "Exactly what the engine returns. " : "Not the grid the engine returns. "}
            </span>
            <span className="text-zinc-300">{item.choices[item.answer].why}</span>
          </motion.div>
        )}
        {checked && (
          <button
            onClick={reset}
            className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
          >
            <RotateCcw className="h-3 w-3" /> Re-freeze
          </button>
        )}
        {banked && !checked && (
          <span className="ml-auto text-[11px] text-zinc-600">solved before — replay, no extra XP</span>
        )}
      </div>
    </div>
  );
}

export function PredictView() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const [idx, setIdx] = useState(0);
  const item = PREDICTS[idx];
  const solved = useMemo(
    () => PREDICTS.reduce((n, p) => n + (xpEvents[`predict:${p.id}`] !== undefined ? 1 : 0), 0),
    [xpEvents],
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <Eye className="h-3.5 w-3.5" /> {PREDICTS.length} CHALLENGES · MENTAL EXECUTION
      </p>
      <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="eye" size={40} />Predict the grid</h1>
      <p className="mt-3 text-[15px] leading-7 text-zinc-400">
        Read the query, freeze the grid you expect — before the engine runs. The wrong options are the mistakes
        everyone actually makes: the = NULL myth, fanout counting, forgotten filters. Prediction first, run second:
        that&apos;s the interview skill. {PREDICTS_XP} XP per first solve.
      </p>

      <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-300">Frozen correctly</span>
          <span className="tnum text-zinc-500">{solved} / {PREDICTS.length}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${(solved / PREDICTS.length) * 100}%` }} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className={cn(
            "flex items-center gap-1 rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-900",
            idx === 0 && "cursor-not-allowed opacity-40",
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        <span className="tnum text-[11px] uppercase tracking-wider text-zinc-600">
          Challenge {idx + 1} of {PREDICTS.length}
        </span>
        <button
          onClick={() => setIdx((i) => Math.min(PREDICTS.length - 1, i + 1))}
          disabled={idx >= PREDICTS.length - 1}
          className={cn(
            "flex items-center gap-1 rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-900",
            idx >= PREDICTS.length - 1 && "cursor-not-allowed opacity-40",
          )}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4">
        <PredictCard key={item.id} item={item} />
      </div>

      {idx < PREDICTS.length - 1 && (
        <button
          onClick={() => setIdx(idx + 1)}
          className="btn-quiet mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-800 px-4 py-2.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
        >
          Next challenge <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
