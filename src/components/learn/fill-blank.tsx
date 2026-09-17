"use client";

// Fill-in-the-blank card — rebuild a query by placing option chips into
// numbered slots of a colorized SQL template. First all-correct Check pays
// +8 XP (+4 first-try bonus); a miss enrolls the fill in the review deck.
// In reviewMode the card pays zero XP and the first Check records the
// recall/miss on the Leitner card instead.
//
// Case mode (caseMode): the same slot machinery wearing a scenario memo.
// The card renders the business brief above the ask, pays +12 XP (+6
// first-try bonus) under the `case:` ledger keys, and never enrolls in the
// review deck — cases train translation, not spaced recall.

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Briefcase, CheckCircle2, Lock, RotateCcw, X } from "lucide-react";
import { useProgress } from "@/lib/curriculum/progress";
import { XP, caseDifficulty, starsFor } from "@/lib/curriculum/gamification";
import type { CaseStudy, Fill } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";
import { RichNodes } from "./rich";
import { SqlNodes } from "./sql-code";
import { celebrate } from "./celebrate";

/** Split a template into alternating sql-text / slot-number parts. */
function templateParts(template: string): Array<{ kind: "sql"; text: string } | { kind: "slot"; n: number }> {
  const out: Array<{ kind: "sql"; text: string } | { kind: "slot"; n: number }> = [];
  const re = /\{(\d+)\}/g;
  let last = 0;
  for (const m of template.matchAll(re)) {
    const start = m.index ?? 0;
    if (start > last) out.push({ kind: "sql", text: template.slice(last, start) });
    out.push({ kind: "slot", n: Number(m[1]) });
    last = start + m[0].length;
  }
  if (last < template.length) out.push({ kind: "sql", text: template.slice(last) });
  return out;
}

export function FillCard({
  fill,
  reviewMode = false,
  examMode = false,
  caseMode = false,
  onAnswered,
}: {
  fill: Fill;
  reviewMode?: boolean;
  /** Exam mode: zero XP, feedback withheld until submit. */
  examMode?: boolean;
  /** Scenario case mode: memo header + case XP keys + no review deck. */
  caseMode?: boolean;
  onAnswered?: (correct: boolean) => void;
}) {
  const slots = fill.answers.length;
  const [placed, setPlaced] = useState<Array<string | null>>(() => Array(slots).fill(null));
  const [active, setActive] = useState(0);
  const [checked, setChecked] = useState(false);
  const tries = useRef(0);
  const awardRef = useRef(false);
  const firedRef = useRef(false);

  const correct = checked && placed.every((p, i) => p === fill.answers[i]);
  const done = checked && correct;

  function place(chip: string) {
    if (checked) return;
    const target = placed[active] === null ? active : placed.findIndex((p) => p === null);
    if (target === -1) return;
    const next = [...placed];
    next[target] = chip;
    setPlaced(next);
    const nextEmpty = next.findIndex((p) => p === null);
    setActive(nextEmpty === -1 ? target : nextEmpty);
  }

  function clearSlot(i: number) {
    if (checked) return;
    const next = [...placed];
    next[i] = null;
    setPlaced(next);
    setActive(i);
  }

  function reset() {
    setPlaced(Array(slots).fill(null));
    setActive(0);
    setChecked(false);
  }

  function check() {
    if (placed.some((p) => p === null)) return;
    tries.current += 1;
    setChecked(true);
    const ok = placed.every((p, i) => p === fill.answers[i]);
    const store = useProgress.getState();

    if (examMode) {
      if (!ok) store.recordMiss(fill.id);
      if (!firedRef.current) {
        firedRef.current = true;
        onAnswered?.(ok);
      }
      return;
    }

    if (reviewMode) {
      if (ok) store.recordRecall(fill.id);
      else store.recordMiss(fill.id);
      if (!firedRef.current) {
        firedRef.current = true;
        onAnswered?.(ok);
      }
      return;
    }

    if (ok) {
      if (!awardRef.current) {
        awardRef.current = true;
        const first = tries.current === 1;
        if (caseMode) {
          store.awardXp(`case:${fill.id}`, XP.case);
          if (first) store.awardXp(`casefirst:${fill.id}`, XP.caseFirstBonus);
          celebrate({
            kind: "xp",
            title: `+${XP.case + (first ? XP.caseFirstBonus : 0)} XP`,
            sub: first ? "Case closed on the first pass — bonus included" : "Case closed",
          });
        } else {
          store.awardXp(`fill:${fill.id}`, XP.fill);
          if (first) store.awardXp(`fillfirst:${fill.id}`, XP.fillFirstBonus);
          celebrate({
            kind: "xp",
            title: `+${XP.fill + (first ? XP.fillFirstBonus : 0)} XP`,
            sub: first ? "All slots right on the first try — bonus included" : "Query rebuilt",
          });
        }
      }
    } else if (!caseMode) {
      store.recordMiss(fill.id);
    }
    onAnswered?.(ok);
  }

  const pool = fill.chips.filter((c) => !placed.includes(c));
  const wrongSlots = checked
    ? placed.map((p, i) => (p !== fill.answers[i] ? i : -1)).filter((i) => i >= 0)
    : [];

  const cs = caseMode ? (fill as unknown as CaseStudy) : null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
      {cs && (
        <div className="mb-3.5 rounded-md border border-sky-400/25 bg-sky-400/[0.05] px-3.5 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-300">
              <Briefcase className="h-2.5 w-2.5" /> Case file
            </span>
            <span className="font-mono text-[10px] text-zinc-500">
              {starsFor(caseDifficulty(cs))} {cs.difficulty ?? caseDifficulty(cs)}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-100">{cs.title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
            <RichNodes text={cs.brief} />
          </p>
        </div>
      )}
      <p className="text-sm font-medium leading-relaxed text-zinc-100">
        <RichNodes text={fill.prompt} />
      </p>

      {/* colorized template with slots */}
      <div className="mt-3.5 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-3">
        <pre className="font-mono text-[12.5px] leading-6 text-zinc-300">
          {templateParts(fill.template).map((part, i) =>
            part.kind === "sql" ? (
              <span key={i} className="whitespace-pre-wrap">
                <SqlNodes text={part.text} />
              </span>
            ) : (
              (() => {
                const idx = part.n - 1;
                const chip = placed[idx] ?? null;
                return (
                  <button
                    key={i}
                    onClick={() => (chip !== null ? clearSlot(idx) : setActive(idx))}
                    disabled={checked}
                    className={cn(
                      "mx-0.5 inline-flex items-center gap-1 rounded border px-2 py-0.5 align-baseline font-mono text-[12px] transition-colors",
                      checked
                        ? chip === fill.answers[idx]
                          ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-200"
                          : "border-rose-400/70 bg-rose-400/10 text-rose-200 line-through"
                        : chip !== null
                          ? "border-violet-400/60 bg-violet-400/10 text-violet-200 hover:border-rose-400/60"
                          : active === idx
                            ? "border-dashed border-emerald-400/70 bg-emerald-400/[0.07] text-emerald-300"
                            : "border-dashed border-zinc-600 text-zinc-500 hover:border-zinc-400",
                    )}
                    title={chip !== null && !checked ? "Click to remove" : `Slot ${part.n}`}
                  >
                    {chip !== null ? <SqlNodes text={chip} /> : `${part.n}`}
                  </button>
                );
              })()
            ),
          )}
        </pre>
      </div>

      {/* chip pool */}
      {!checked && (
        <div className="mt-3 flex flex-wrap gap-2">
          {pool.map((chip) => (
            <button
              key={chip}
              onClick={() => place(chip)}
              className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 font-mono text-[11.5px] text-zinc-200 transition-all hover:border-emerald-400/60 hover:bg-emerald-400/[0.08] hover:text-emerald-200 active:scale-95"
            >
              <SqlNodes text={chip} />
            </button>
          ))}
        </div>
      )}

      {/* verdict panels */}
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
                {correct ? "Rebuilt correctly. " : "Not quite. "}
              </span>
              <RichNodes text={fill.why} />
              {!correct && wrongSlots.length > 0 && (
                <span className="mt-2 block space-y-1.5 border-t border-amber-400/20 pt-1.5">
                  {wrongSlots.map((i) => {
                    const note = fill.notes?.find((n) => n.slot === i + 1);
                    return (
                      <span key={i} className="block">
                        <span className="font-medium text-amber-300">Slot {i + 1}:</span>{" "}
                        {note ? <RichNodes text={note.why} /> : <>the right chip is <code className="font-mono text-amber-200">{fill.answers[i]}</code>.</>}
                      </span>
                    );
                  })}
                </span>
              )}
            </span>
          </span>
        </motion.div>
      )}

      {checked && examMode && (
        <p className="mt-3.5 flex items-center gap-1.5 text-xs text-zinc-500">
          <Lock className="h-3 w-3" /> Answer locked — feedback comes when you submit.
        </p>
      )}

      {/* actions */}
      {!checked ? (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={check}
            disabled={placed.some((p) => p === null)}
            className={cn(
              "rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
              placed.some((p) => p === null) && "cursor-not-allowed opacity-40",
            )}
          >
            {examMode ? "Lock in answer" : "Check answer"}
          </button>
          {placed.some((p) => p !== null) && (
            <button
              onClick={reset}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-900"
            >
              <RotateCcw className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      ) : (
        !correct &&
        !reviewMode &&
        !examMode && (
          <div className="mt-4">
            <button
              onClick={reset}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-amber-400/40 px-4 py-2 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-400/10"
            >
              <RotateCcw className="h-3 w-3" /> Try again
            </button>
          </div>
        )
      )}
    </div>
  );
}

/** Scenario case card — FillCard wearing the memo header. */
export function CaseCard({ cs }: { cs: CaseStudy }) {
  return <FillCard fill={{ ...cs, prompt: cs.ask }} caseMode />;
}

/** Compact inline indicator used by the quiz header: e.g. "2 slots". */
export function FillSlotsTag({ fill }: { fill: Fill }) {
  return (
    <span className="tnum shrink-0 rounded-full border border-zinc-700 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
      <X className="mr-0.5 inline h-2.5 w-2.5" />
      {fill.answers.length} slot{fill.answers.length > 1 ? "s" : ""}
    </span>
  );
}
