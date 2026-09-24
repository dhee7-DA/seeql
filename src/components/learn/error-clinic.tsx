"use client";

// Error clinic — deliberate debugging practice. Seven items throw the
// REAL SQLite message; five are silent bugs that ran and returned a
// confidently wrong answer. Diagnose, get coached, then see the fix.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bug, CheckCircle2, ChevronLeft, ChevronRight, Stethoscope, X } from "lucide-react";
import { Icon3D } from "./ui/icon3d";
import { useProgress } from "@/lib/curriculum/progress";
import { CLINICS, CLINIC_XP, type ClinicItem } from "@/lib/curriculum/errors";
import { cn } from "@/lib/utils";
import { awardPracticeXp, recordPracticeAttempt } from "./practice-kit";
import { looksLikeSql, SqlNodes } from "./sql-code";
import { RichNodes } from "./rich";

function ClinicCard({ item }: { item: ClinicItem }) {
  const banked = useProgress((s) => s.xpEvents[`clinic:${item.id}`] !== undefined);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = checked && picked === item.answer;

  function check() {
    if (picked === null || checked) return;
    setChecked(true);
    const ok = picked === item.answer;
    recordPracticeAttempt(item.skill, `clinic:${item.id}`, ok);
    if (ok) awardPracticeXp(`clinic:${item.id}`, CLINIC_XP, "Diagnosed the bug correctly");
  }

  function reset() {
    setPicked(null);
    setChecked(false);
  }

  return (
    <div className="space-y-4">
      {/* the patient */}
      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            {item.id.toUpperCase()}
          </span>
          {item.kind === "error" ? (
            <span className="rounded-full border border-rose-400/40 bg-rose-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-rose-300">
              the engine refused
            </span>
          ) : (
            <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300">
              silent bug — it ran
            </span>
          )}
          {banked && (
            <span className="ml-auto text-[11px] text-zinc-600">solved before — replay, no extra XP</span>
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.brief}</p>

        <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-3 font-mono text-[13px] leading-6 text-zinc-200">
          <SqlNodes text={item.sql} />
        </div>

        {item.kind === "error" ? (
          <div className="mt-3 rounded-md border border-rose-400/30 bg-rose-400/[0.06] px-3.5 py-2.5 font-mono text-xs text-rose-200">
            <span className="text-[10px] uppercase tracking-wider text-rose-400/80">error: </span>
            {item.message}
          </div>
        ) : (
          <div className="mt-3 rounded-md border border-amber-400/30 bg-amber-400/[0.06] px-3.5 py-2.5 font-mono text-xs text-amber-200">
            <span className="text-[10px] uppercase tracking-wider text-amber-400/80">what ran: </span>
            {item.receipt}
          </div>
        )}
      </div>

      {/* diagnosis choices */}
      <div className="grid gap-2">
        {item.choices.map((choice, i) => {
          const isPicked = picked === i;
          const isAnswer = i === item.answer;
          return (
            <button
              key={i}
              onClick={() => !checked && setPicked(i)}
              disabled={checked}
              className={cn(
                "flex items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-all duration-150 active:scale-[0.995]",
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
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium",
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
              <span className="text-xs leading-relaxed text-zinc-300">{choice}</span>
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
            <Stethoscope className="mr-1.5 inline h-3.5 w-3.5" />
            Confirm diagnosis
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="flex-1 space-y-2.5"
          >
            <div
              className={cn(
                "rounded-md border px-3.5 py-3 text-xs leading-relaxed",
                correct ? "border-emerald-400/30 bg-emerald-400/[0.06]" : "border-amber-400/30 bg-amber-400/[0.06]",
              )}
            >
              <span className={cn("font-semibold", correct ? "text-emerald-300" : "text-amber-300")}>
                {correct ? "Correct diagnosis. " : "Not quite. "}
              </span>
              <span className="text-zinc-300">{item.why}</span>
            </div>
            <div className="rounded-md border border-sky-400/30 bg-sky-400/[0.05] px-3.5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-sky-300/80">the fix</p>
              <div className="mt-1.5 font-mono text-[12px] leading-6 text-zinc-200">
                <SqlNodes text={item.fixedSql} />
              </div>
            </div>
          </motion.div>
        )}
        {checked && (
          <button
            onClick={reset}
            className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
          >
            Re-diagnose
          </button>
        )}
      </div>
    </div>
  );
}

export function ErrorClinic() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const [idx, setIdx] = useState(0);
  const item = CLINICS[idx];
  const solved = useMemo(
    () => CLINICS.reduce((n, c) => n + (xpEvents[`clinic:${c.id}`] !== undefined ? 1 : 0), 0),
    [xpEvents],
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <Bug className="h-3.5 w-3.5" /> {CLINICS.length} CASES · 7 LOUD ERRORS · 5 SILENT BUGS
      </p>
      <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="shield" size={40} />The error clinic</h1>
      <p className="mt-3 text-[15px] leading-7 text-zinc-400">
        Real engine messages, real silent wrong answers — read the symptom, name the disease. The silent ones are
        the dangerous kind: valid SQL, zero errors, wrong truth. {CLINIC_XP} XP per first diagnosis.
      </p>

      <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-300">Bugs diagnosed</span>
          <span className="tnum text-zinc-500">{solved} / {CLINICS.length}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${(solved / CLINICS.length) * 100}%` }} />
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
          Case {idx + 1} of {CLINICS.length}
        </span>
        <button
          onClick={() => setIdx((i) => Math.min(CLINICS.length - 1, i + 1))}
          disabled={idx >= CLINICS.length - 1}
          className={cn(
            "flex items-center gap-1 rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-900",
            idx >= CLINICS.length - 1 && "cursor-not-allowed opacity-40",
          )}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4">
        <ClinicCard key={item.id} item={item} />
      </div>

      {idx < CLINICS.length - 1 && (
        <button
          onClick={() => setIdx(idx + 1)}
          className="btn-quiet mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-800 px-4 py-2.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
        >
          Next case <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
