"use client";

// Explain-back — the reverse skill. Read the SQL, say what it does in
// plain English, and get graded against concept groups: synonym sets a
// working analyst might naturally use. Core concepts must all appear;
// bonus concepts are shown but never gate the XP. The grader shows its
// work — exactly which concepts it looked for.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Circle, MessagesSquare, RotateCcw } from "lucide-react";
import { useProgress } from "@/lib/curriculum/progress";
import { EXPLAINS, EXPLAIN_XP, type ConceptGroup, type ExplainItem } from "@/lib/curriculum/explains";
import { cn } from "@/lib/utils";
import { awardPracticeXp, recordPracticeAttempt } from "./practice-kit";
import { SqlNodes } from "./sql-code";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9%. ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function conceptHit(text: string, g: ConceptGroup): boolean {
  const hay = normalize(text);
  const haySquashed = hay.replace(/ /g, "");
  return g.any.some((needle) => {
    const n = normalize(needle);
    if (hay.includes(n)) return true;
    // also allow the squashed form for multiword needles ("per city")
    return n.replace(/ /g, "").length > 3 && haySquashed.includes(n.replace(/ /g, ""));
  });
}

function ExplainCard({ item }: { item: ExplainItem }) {
  const banked = useProgress((s) => s.xpEvents[`explain:${item.id}`] !== undefined);
  const [text, setText] = useState("");
  const [graded, setGraded] = useState(false);

  const coreHits = useMemo(() => item.core.map((g) => conceptHit(text, g)), [text, item]);
  const bonusHits = useMemo(() => (item.bonus ?? []).map((g) => conceptHit(text, g)), [text, item]);
  const coreCount = coreHits.filter(Boolean).length;
  const allCore = coreCount === item.core.length;

  function grade() {
    if (graded || text.trim().length < 10) return;
    setGraded(true);
    if (allCore) {
      recordPracticeAttempt(item.skill, `explain:${item.id}`, true);
      awardPracticeXp(`explain:${item.id}`, EXPLAIN_XP, "Explained the query like an analyst");
    } else {
      recordPracticeAttempt(item.skill, `explain:${item.id}`, false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            {item.id.toUpperCase()}
          </span>
          {banked && <span className="ml-auto text-[11px] text-zinc-600">explained before — replay, no extra XP</span>}
        </div>
        <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-3 font-mono text-[13px] leading-6 text-zinc-200">
          <SqlNodes text={item.sql} />
        </div>
        <p className="mt-2.5 text-[11px] text-zinc-500">
          Say what this does — to a stakeholder, in plain English. What goes in, what happens, what comes out.
        </p>
      </div>

      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={graded}
          rows={4}
          aria-label="Your plain-English explanation"
          placeholder="This query takes…"
          className="w-full resize-y rounded-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-3 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-400/50 focus:outline-none disabled:opacity-60"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!graded ? (
            <button
              onClick={grade}
              disabled={text.trim().length < 10}
              className={cn(
                "btn-glow rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[#052e1c] transition-colors hover:bg-emerald-300",
                text.trim().length < 10 && "cursor-not-allowed opacity-40",
              )}
            >
              Grade my explanation
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setGraded(false);
                  setText("");
                }}
                className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
              >
                <RotateCcw className="h-3 w-3" /> Explain again
              </button>
              <span className="text-[11px] text-zinc-600">
                grader: {coreCount}/{item.core.length} core concepts
              </span>
            </>
          )}
        </div>

        {graded && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="mt-3.5 space-y-3"
          >
            <div
              className={cn(
                "rounded-md border px-3.5 py-3 text-xs leading-relaxed",
                allCore ? "border-emerald-400/40 bg-emerald-400/10" : "border-amber-400/30 bg-amber-400/[0.06]",
              )}
            >
              <span className={cn("font-semibold", allCore ? "text-emerald-300" : "text-amber-300")}>
                {allCore
                  ? "Covered — every core concept is in there. "
                  : `Core concepts: ${coreCount}/${item.core.length}. `}
              </span>
              <span className="text-zinc-300">
                {allCore
                  ? "An analyst reading your explanation would know exactly what this query does and returns."
                  : "Work the missing ones into the explanation — each chip below names what a complete answer mentions."}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {item.core.map((g, i) => (
                <span
                  key={g.name}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]",
                    coreHits[i]
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                      : "border-rose-400/40 bg-rose-400/10 text-rose-200",
                  )}
                >
                  {coreHits[i] ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                  {g.name}
                </span>
              ))}
              {(item.bonus ?? []).map((g, i) => (
                <span
                  key={g.name}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]",
                    bonusHits[i]
                      ? "border-sky-400/40 bg-sky-400/10 text-sky-200"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-500",
                  )}
                >
                  {bonusHits[i] ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                  {g.name}
                </span>
              ))}
            </div>

            <div className="rounded-md border border-violet-400/25 bg-violet-400/[0.05] px-3.5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-violet-300/80">a model explanation</p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">{item.model}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function ExplainBack() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const [idx, setIdx] = useState(0);
  const item = EXPLAINS[idx];
  const done = useMemo(
    () => EXPLAINS.reduce((n, e) => n + (xpEvents[`explain:${e.id}`] !== undefined ? 1 : 0), 0),
    [xpEvents],
  );

  return (
    <div className="bg-ambient mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <MessagesSquare className="h-3.5 w-3.5" /> {EXPLAINS.length} QUERIES · WRITE IT BACKWARDS
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Explain back</h1>
      <p className="mt-3 text-[15px] leading-7 text-zinc-400">
        Writing SQL proves you can build; explaining it proves you understand. Read each query and say what it
        does in plain English — the grader checks for the concepts a complete answer mentions, and shows its
        work either way.
      </p>

      <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-300">Explained</span>
          <span className="tnum text-zinc-500">{done} / {EXPLAINS.length}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${(done / EXPLAINS.length) * 100}%` }} />
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
          Query {idx + 1} of {EXPLAINS.length}
        </span>
        <button
          onClick={() => setIdx((i) => Math.min(EXPLAINS.length - 1, i + 1))}
          disabled={idx >= EXPLAINS.length - 1}
          className={cn(
            "flex items-center gap-1 rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-900",
            idx >= EXPLAINS.length - 1 && "cursor-not-allowed opacity-40",
          )}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4">
        <ExplainCard key={item.id} item={item} />
      </div>

      {idx < EXPLAINS.length - 1 && (
        <button
          onClick={() => setIdx(idx + 1)}
          className="btn-quiet mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-800 px-4 py-2.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
        >
          Next query <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
