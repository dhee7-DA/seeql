"use client";

// Single MCQ card: choose, check, learn. XP is awarded once per question
// (idempotent ledger keys), with a first-try bonus tracked by the store.
// Finish matches the app's material layer: sheen on the raised card,
// accent-lit selection state, animated verdict panel, glowing check CTA.

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, CheckCircle2, X } from "lucide-react";
import { useProgress } from "@/lib/curriculum/progress";
import { XP } from "@/lib/curriculum/gamification";
import type { Mcq } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";
import { celebrate } from "./celebrate";

export function McqCard({ mcq, onAnswered }: { mcq: Mcq; onAnswered?: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const awardRef = useRef(false);

  const correct = checked && picked === mcq.answer;

  function check() {
    if (picked === null || awardRef.current) return;
    awardRef.current = true;
    setChecked(true);
    const store = useProgress.getState();
    const isFirst = store.recordMcqCheck(mcq.id, picked === mcq.answer);
    if (picked === mcq.answer) {
      store.awardXp(`mcq:${mcq.id}`, XP.mcq);
      if (isFirst) store.awardXp(`mcqfirst:${mcq.id}`, XP.mcqFirstBonus);
      celebrate({
        kind: "xp",
        title: `+${XP.mcq + (isFirst ? XP.mcqFirstBonus : 0)} XP`,
        sub: isFirst ? "Correct on the first try — bonus included" : "Correct",
      });
    }
    onAnswered?.(picked === mcq.answer);
  }

  return (
    <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
      <p className="text-sm font-medium leading-relaxed text-zinc-100">{mcq.prompt}</p>
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
                    ? "border-emerald-400 bg-emerald-400 text-[#052e1c]"
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
              <span className="font-mono text-xs leading-relaxed">{choice}</span>
            </button>
          );
        })}
      </div>
      {checked && (
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
              {mcq.why}
              {!correct && picked !== null && (() => {
                const note = mcq.notes?.find((n) => n.choice === picked);
                return note ? (
                  <span className="mt-1.5 block border-t border-amber-400/20 pt-1.5">
                    <span className="font-medium text-amber-300">About your pick: </span>
                    {note.why}
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
            "btn-glow mt-4 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[#052e1c] transition-colors hover:bg-emerald-300",
            picked === null && "cursor-not-allowed opacity-40",
          )}
        >
          Check answer
        </button>
      )}
    </div>
  );
}
