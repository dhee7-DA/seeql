"use client";

// Single MCQ card: choose, check, learn. XP is awarded once per question
// (idempotent ledger keys), with a first-try bonus tracked by the store.
// Finish matches the app's material layer: sheen on the raised card,
// accent-lit selection state, animated verdict panel, glowing check CTA.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, CheckCircle2, X } from "lucide-react";
import { useProgress } from "@/lib/curriculum/progress";
import { XP } from "@/lib/curriculum/gamification";
import type { Mcq } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";
import { RichNodes } from "./rich";
import { looksLikeSql, SqlNodes } from "./sql-code";
import { celebrate } from "./celebrate";

export function McqCard({
  mcq,
  index,
  reviewMode = false,
  examMode = false,
  ladderKey,
  onAnswered,
}: {
  mcq: Mcq;
  /** Optional 1-based question number (quiz pages render "Q3" tags). */
  index?: number;
  /** Review deck: zero XP, the first Check records recall/miss on the card. */
  reviewMode?: boolean;
  /** Exam mode: zero XP, feedback withheld until submit, misses still feed
   *  the review deck. */
  examMode?: boolean;
  /** Spaced-repetition ladder resurfacing: zero XP, zero ledger writes — the
   *  answer only advances (or resets) the ladder card named by this key. */
  ladderKey?: string;
  onAnswered?: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [flutter, setFlutter] = useState<{ gained: number; seq: number } | null>(null);
  const awardRef = useRef(false);

  // the flutter chip is transient — retire it 1.7s after it lands
  useEffect(() => {
    if (!flutter) return;
    const t = window.setTimeout(() => setFlutter(null), 1700);
    return () => window.clearTimeout(t);
  }, [flutter]);

  const correct = checked && picked === mcq.answer;

  function check() {
    if (picked === null || awardRef.current) return;
    awardRef.current = true;
    setChecked(true);
    const store = useProgress.getState();
    const ok = picked === mcq.answer;

    // Exam mode: the answer is recorded (misses still feed the review deck)
    // but XP and feedback are sealed until the results phase.
    if (examMode) {
      store.recordMcqCheck(mcq.id, ok);
      if (!ok) store.recordMiss(mcq.id);
      onAnswered?.(ok);
      return;
    }

    // Ladder resurfacing (review deck "Scheduled" tab): the card's own ladder
    // advances — corrects move 1d→3d→7d→14d, misses come back tomorrow. No
    // XP, no accuracy writes: the original attempt already banked those.
    if (ladderKey) {
      useProgress.getState().scheduleReview(ladderKey, ok);
      onAnswered?.(ok);
      return;
    }

    // Review mode: retention, not farming — zero XP, the Leitner card moves.
    if (reviewMode) {
      if (ok) store.recordRecall(mcq.id);
      else store.recordMiss(mcq.id);
      onAnswered?.(ok);
      return;
    }

    const isFirst = store.recordMcqCheck(mcq.id, ok);
    // spaced repetition: every answer schedules the card's return —
    // 1d/3d/7d/14d ladder after corrects, back to tomorrow after a miss
    store.scheduleReview(`mcq:${mcq.id}`, ok);
    if (ok) {
      // XP truth comes from the ledger: awardXp returns whether it paid.
      // Repeats never pay twice, so "gained" is honest — the chip and
      // toast can never claim XP the ledger didn't bank.
      const paidMcq = store.awardXp(`mcq:${mcq.id}`, XP.mcq);
      const paidFirst = isFirst ? store.awardXp(`mcqfirst:${mcq.id}`, XP.mcqFirstBonus) : false;
      const gained = (paidMcq ? XP.mcq : 0) + (paidFirst ? XP.mcqFirstBonus : 0);
      setFlutter({ gained, seq: Date.now() });
      celebrate({
        kind: "xp",
        title: gained > 0 ? `+${gained} XP` : "Correct",
        sub: gained > 0
          ? isFirst ? "Correct on the first try — bonus included" : "Correct"
          : "XP already banked for this one",
      });
    }
    onAnswered?.(ok);
  }

  return (
    <div className="sheen relative rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
      {index !== undefined && (
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
          Q{index}
        </p>
      )}
      <p className="text-sm font-medium leading-relaxed text-zinc-100"><RichNodes text={mcq.prompt} /></p>
      <div className="mt-3.5 grid gap-2">
        {mcq.choices.map((choice, i) => {
          const isPicked = picked === i;
          const isAnswer = i === mcq.answer;
          return (
            <button
              key={i}
              onClick={() => !checked && setPicked(i)}
              disabled={checked}
              className={cn(
                "group flex items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-all duration-150 active:scale-[0.995]",
                checked
                  ? isAnswer
                    ? "border-emerald-400/70 bg-emerald-400/10 text-zinc-100"
                    : isPicked
                      ? "border-rose-400/70 bg-rose-400/10 text-zinc-300"
                      : "border-zinc-800/70 bg-zinc-950 text-zinc-600"
                  : isPicked
                    ? "border-emerald-400/50 bg-emerald-400/[0.07] text-zinc-100"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium transition-colors",
                  checked && isAnswer
                    ? "border-emerald-400 bg-emerald-400 text-[var(--brand-ink)]"
                    : checked && isPicked
                      ? "border-rose-400 bg-rose-400 text-zinc-950"
                      : isPicked
                        ? "border-emerald-400/70 text-emerald-300"
                        : "border-zinc-700 text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-300",
                )}
              >
                {checked && isAnswer ? (
                  <Check className="h-3 w-3" />
                ) : checked && isPicked ? (
                  <X className="h-3 w-3" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className={cn("text-xs leading-relaxed", looksLikeSql(choice) ? "font-mono text-zinc-200" : "text-zinc-300")}>
                {looksLikeSql(choice) ? <SqlNodes text={choice} /> : <RichNodes text={choice} />}
              </span>
            </button>
          );
        })}
      </div>
      {checked && examMode && (
        <p className="mt-3.5 flex items-center gap-1.5 text-xs text-zinc-500">
          <X className="h-3 w-3" /> Answer locked — feedback comes when you submit.
        </p>
      )}
      {checked && !examMode && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className={cn(
            "mt-3.5 rounded-md border px-3.5 py-3 text-xs leading-relaxed",
            correct ? "border-emerald-400/30 bg-emerald-400/[0.06] text-zinc-300" : "border-amber-400/30 bg-amber-400/[0.06] text-zinc-300",
          )}
        >
          <span className="flex items-start gap-2">
            {correct ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
            )}
              <span>
                <span className={cn("font-semibold", correct ? "text-emerald-300" : "text-amber-300")}>
                  {correct ? "Correct. " : "Not quite. "}
                </span>
                <RichNodes text={mcq.why} />
                {!correct && picked !== null && (() => {
                  const note = mcq.notes?.find((n) => n.choice === picked);
                  return note ? (
                    <span className="mt-1.5 block border-t border-amber-400/20 pt-1.5">
                      <span className="font-medium text-amber-300">About your pick: </span>
                      <RichNodes text={note.why} />
                    </span>
                  ) : null;
                })()}
              </span>
          </span>
        </motion.div>
      )}
      {!checked && (
        <button
          onClick={check}
          disabled={picked === null}
          className={cn(
            "btn-glow mt-4 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
            picked === null && "cursor-not-allowed opacity-40",
          )}
        >
          {examMode ? "Lock in answer" : "Check answer"}
        </button>
      )}
      {flutter && (
        <motion.span
          key={flutter.seq}
          initial={{ opacity: 0, y: 10, scale: 0.7, rotate: -6 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [10, 0, -6, -18],
            scale: [0.7, 1.08, 1, 0.96],
            rotate: [-6, 2, -1, 3],
          }}
          transition={{ duration: 1.6, times: [0, 0.18, 0.75, 1], ease: "easeOut" }}
          className={cn(
            "pointer-events-none absolute bottom-5 right-5 z-10 rounded-full border px-3 py-1 font-mono text-xs font-semibold shadow-lg",
            flutter.gained > 0
              ? "border-emerald-300/60 bg-emerald-400/15 text-emerald-200 shadow-emerald-400/20"
              : "border-zinc-600 bg-zinc-800/90 text-zinc-400",
          )}
        >
          {flutter.gained > 0 ? `+${flutter.gained} XP` : "already banked"}
        </motion.span>
      )}
    </div>
  );
}
