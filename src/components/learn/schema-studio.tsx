"use client";

// Schema studio — modeling judgment drills: spot the design smell, pick
// the key, choose the type, match the verb. Ten scenarios, one choice
// each, coached either way. The half of SQL that happens before SELECT.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Network, X } from "lucide-react";
import { useProgress } from "@/lib/curriculum/progress";
import { STUDIO_ITEMS, STUDIO_XP, type StudioItem } from "@/lib/curriculum/schema-drills";
import { cn } from "@/lib/utils";
import { awardPracticeXp, recordPracticeAttempt } from "./practice-kit";
import { RichNodes } from "./rich";

const KIND_TONE: Record<StudioItem["kind"], string> = {
  smell: "border-rose-400/40 bg-rose-400/10 text-rose-300",
  key: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  type: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  verb: "border-violet-400/40 bg-violet-400/10 text-violet-300",
};

function StudioCard({ item }: { item: StudioItem }) {
  const banked = useProgress((s) => s.xpEvents[`studio:${item.id}`] !== undefined);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = checked && picked === item.answer;

  function check() {
    if (picked === null || checked) return;
    setChecked(true);
    const ok = picked === item.answer;
    recordPracticeAttempt(item.skill, `studio:${item.id}`, ok);
    if (ok) awardPracticeXp(`studio:${item.id}`, STUDIO_XP, "Called the design correctly");
  }

  return (
    <div className="space-y-4">
      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", KIND_TONE[item.kind])}>
            {item.kindLabel}
          </span>
          {banked && <span className="ml-auto text-[11px] text-zinc-600">solved before — replay, no extra XP</span>}
        </div>
        <h2 className="mt-2.5 text-base font-semibold text-zinc-50">{item.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          <RichNodes text={item.brief} />
        </p>
      </div>

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
                "flex items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-all duration-150 active:scale-[0.995]",
                checked
                  ? isAnswer
                    ? "border-emerald-400/70 bg-emerald-400/10"
                    : isPicked
                      ? "border-rose-400/70 bg-rose-400/10"
                      : "border-zinc-800/70 bg-zinc-950 opacity-60"
                  : isPicked
                    ? "border-emerald-400/50 bg-emerald-400/[0.07]"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium",
                  checked && isAnswer
                    ? "border-emerald-400 bg-emerald-400 text-[#052e1c]"
                    : checked && isPicked
                      ? "border-rose-400 bg-rose-400 text-zinc-950"
                      : isPicked
                        ? "border-emerald-400/70 text-emerald-300"
                        : "border-zinc-700 text-zinc-500",
                )}
              >
                {checked && isAnswer ? <CheckCircle2 className="h-3 w-3" /> : checked && isPicked ? <X className="h-3 w-3" /> : String.fromCharCode(65 + i)}
              </span>
              <span className="text-xs leading-relaxed text-zinc-300">
                <RichNodes text={choice} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!checked ? (
          <button
            onClick={check}
            disabled={picked === null}
            className={cn(
              "btn-glow rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[#052e1c] transition-colors hover:bg-emerald-300",
              picked === null && "cursor-not-allowed opacity-40",
            )}
          >
            Call the design
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
              {correct ? "Right call. " : "Not this time. "}
            </span>
            <span className="text-zinc-300">{item.why}</span>
          </motion.div>
        )}
        {checked && (
          <button
            onClick={() => {
              setPicked(null);
              setChecked(false);
            }}
            className="btn-quiet rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
          >
            Reconsider
          </button>
        )}
      </div>
    </div>
  );
}

export function SchemaStudio() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const [idx, setIdx] = useState(0);
  const item = STUDIO_ITEMS[idx];
  const solved = useMemo(
    () => STUDIO_ITEMS.reduce((n, d) => n + (xpEvents[`studio:${d.id}`] !== undefined ? 1 : 0), 0),
    [xpEvents],
  );

  return (
    <div className="bg-ambient mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <Network className="h-3.5 w-3.5" /> {STUDIO_ITEMS.length} SCENARIOS · MODELING JUDGMENT
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Schema studio</h1>
      <p className="mt-3 text-[15px] leading-7 text-zinc-400">
        Querying is half the job. The other half is deciding what the tables should look like — keys, normal
        forms, types, and which verb touches which layer. Ten design reviews, one call each.
      </p>

      <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-300">Designs reviewed</span>
          <span className="tnum text-zinc-500">{solved} / {STUDIO_ITEMS.length}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${(solved / STUDIO_ITEMS.length) * 100}%` }} />
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
          Scenario {idx + 1} of {STUDIO_ITEMS.length}
        </span>
        <button
          onClick={() => setIdx((i) => Math.min(STUDIO_ITEMS.length - 1, i + 1))}
          disabled={idx >= STUDIO_ITEMS.length - 1}
          className={cn(
            "flex items-center gap-1 rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-900",
            idx >= STUDIO_ITEMS.length - 1 && "cursor-not-allowed opacity-40",
          )}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4">
        <StudioCard key={item.id} item={item} />
      </div>

      {idx < STUDIO_ITEMS.length - 1 && (
        <button
          onClick={() => setIdx(idx + 1)}
          className="btn-quiet mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-800 px-4 py-2.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
        >
          Next scenario <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
