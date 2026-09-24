"use client";

// Interview-prep track — the screening classics, live on the storefront.
// Eight rungs from warm-up to boss: write your own SQL, run it against
// the real db, and the grader compares ROWS (multiset — any correct query
// passes). The reference solution unlocks on a pass; hints don't gate.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, ChevronDown, Loader2, Lock, Play, RotateCcw, Trophy } from "lucide-react";
import { Icon3D } from "./ui/icon3d";
import { useProgress } from "@/lib/curriculum/progress";
import { INTERVIEW_RUNGS, INTERVIEW_XP, type InterviewRung } from "@/lib/curriculum/interview";
import type { ExecResponse } from "@/lib/sql-types";
import { cn } from "@/lib/utils";
import { awardPracticeXp, MiniGrid, recordPracticeAttempt, rowsMatch } from "./practice-kit";
import { reportMentorFailure } from "@/lib/mentor-context";
import { SqlEditor } from "../sql-editor";
import { SqlNodes } from "./sql-code";

const DIFF_TONE: Record<string, string> = {
  easy: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  medium: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  hard: "border-rose-400/40 bg-rose-400/10 text-rose-300",
};

function RungCard({ rung, open, onToggle }: { rung: InterviewRung; open: boolean; onToggle: () => void }) {
  const banked = useProgress((s) => s.xpEvents[`interview:${rung.id}`] !== undefined);
  const [sql, setSql] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecResponse | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [solved, setSolved] = useState(banked);
  const [showHint, setShowHint] = useState(false);

  async function run() {
    if (running || !sql.trim()) return;
    setRunning(true);
    const res = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    }).then((r) => r.json() as Promise<ExecResponse>);
    const ok =
      res.ok &&
      rowsMatch(res.rows ?? [], rung.rows, rung.ordered) &&
      (res.columns?.length ?? 0) === rung.columns.length;
    if (!ok) {
      // Land the attempt on the mentor's desk — the AI Mentor chat picks it up.
      reportMentorFailure({
        sql: sql.slice(0, 2000),
        error: res.ok ? null : (res.error ?? null),
        note: res.ok ? "Rows don't match the expected answer for this rung." : null,
        source: `Interview prep · ${rung.title}`,
      });
    }
    setResult(res);
    setPassed(ok);
    setRunning(false);
    if (ok && !solved) {
      setSolved(true);
      recordPracticeAttempt(rung.skill, `interview:${rung.id}`, true);
      const xp = rung.difficulty === "easy" ? INTERVIEW_XP.easy : rung.difficulty === "medium" ? INTERVIEW_XP.medium : INTERVIEW_XP.hard;
      awardPracticeXp(`interview:${rung.id}`, xp, `Interview rung cleared — ${rung.title}`);
    }
  }

  return (
    <div className="sheen overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-zinc-900/60"
      >
        <span
          className={cn(
            "tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-semibold",
            solved ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300" : "border-zinc-700 bg-zinc-900 text-zinc-400",
          )}
        >
          {solved ? <Trophy className="h-3.5 w-3.5" /> : rung.num}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className={cn("truncate text-sm font-medium", solved ? "text-zinc-100" : "text-zinc-200")}>{rung.title}</span>
            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", DIFF_TONE[rung.difficulty])}>
              {rung.difficulty}
            </span>
            <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              {rung.difficulty === "easy" ? INTERVIEW_XP.easy : rung.difficulty === "medium" ? INTERVIEW_XP.medium : INTERVIEW_XP.hard} XP
            </span>
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-zinc-800/70 p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-zinc-300">
            <span className="font-semibold text-zinc-100">The ask: </span>
            {rung.ask}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">{rung.why}</p>

          <div className="mt-3.5 overflow-hidden rounded-md border border-zinc-800">
            <SqlEditor value={sql} onChange={setSql} onVisualize={run} className="min-h-[110px]" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={run}
              disabled={running || !sql.trim()}
              className={cn(
                "btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
                (running || !sql.trim()) && "cursor-not-allowed opacity-40",
              )}
            >
              {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              Run it
            </button>
            <button
              onClick={() => setShowHint((s) => !s)}
              className="btn-quiet rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
            >
              {showHint ? "Hide hint" : "Plan of attack"}
            </button>
            {result && (
              <button
                onClick={() => {
                  setResult(null);
                  setPassed(null);
                }}
                className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
              >
                <RotateCcw className="h-3 w-3" /> Clear run
              </button>
            )}
            <span className="ml-auto text-[11px] text-zinc-600">
              grading: {rung.ordered ? "row order matters" : "any correct query passes"} · {rung.columns.length} columns · {rung.rows.length} rows
            </span>
          </div>

          {showHint && (
            <p className="mt-3 rounded-md border border-sky-400/25 bg-sky-400/[0.05] px-3.5 py-3 text-xs leading-relaxed text-zinc-300">
              <span className="font-semibold text-sky-300">Plan of attack: </span>
              {rung.hint}
            </p>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="mt-3.5 space-y-3"
            >
              {!result.ok ? (
                <div className="rounded-md border border-rose-400/30 bg-rose-400/[0.06] px-3.5 py-3 font-mono text-xs text-rose-200">
                  {result.error}
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "rounded-md border px-3.5 py-3 text-xs leading-relaxed",
                      passed ? "border-emerald-400/40 bg-emerald-400/10" : "border-amber-400/30 bg-amber-400/[0.06]",
                    )}
                  >
                    <span className={cn("font-semibold", passed ? "text-emerald-300" : "text-amber-300")}>
                      {passed ? "Cleared — the truth, however you wrote it. " : "Not the expected rows yet. "}
                    </span>
                    <span className="text-zinc-300">
                      {passed
                        ? banked && !solved
                          ? "Solved before — replay, no extra XP."
                          : "The grader compares result rows, not SQL text: any query that produces this truth passes."
                        : "Compare your grid with the expected one — shape first (column count), then rows."}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">your result</p>
                      <MiniGrid columns={result.columns ?? []} rows={result.rows ?? []} tone={passed ? "good" : "bad"} />
                    </div>
                    <div>
                      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">expected</p>
                      <MiniGrid columns={rung.columns} rows={rung.rows} tone="neutral" />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {(solved || banked) && (
            <div className="mt-4 rounded-md border border-violet-400/25 bg-violet-400/[0.05] px-3.5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-violet-300/80">reference solution</p>
              <div className="mt-1.5 font-mono text-[12px] leading-6 text-zinc-200">
                <SqlNodes text={rung.solution} />
              </div>
            </div>
          )}
          {!solved && !banked && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-600">
              <Lock className="h-3 w-3" /> the reference solution unlocks when your rows match
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function InterviewTrack() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const [openId, setOpenId] = useState<string | null>(INTERVIEW_RUNGS[0].id);
  const cleared = useMemo(
    () => INTERVIEW_RUNGS.reduce((n, r) => n + (xpEvents[`interview:${r.id}`] !== undefined ? 1 : 0), 0),
    [xpEvents],
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <Briefcase className="h-3.5 w-3.5" /> {INTERVIEW_RUNGS.length} RUNGS · WARM-UP → BOSS
      </p>
      <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="rocket" size={40} />Interview prep</h1>
      <p className="mt-3 text-[15px] leading-7 text-zinc-400">
        The classics every screen asks: the scalar lookup, the second-max, per-group extremes, top-N, the
        anti-join and the LAG growth walk — live on the storefront, graded on your rows. Write your own query;
        any that produces the truth passes.
      </p>

      <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-300">Ladder climbed</span>
          <span className="tnum text-zinc-500">{cleared} / {INTERVIEW_RUNGS.length} rungs</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${(cleared / INTERVIEW_RUNGS.length) * 100}%` }} />
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {INTERVIEW_RUNGS.map((rung) => (
          <RungCard
            key={rung.id}
            rung={rung}
            open={openId === rung.id}
            onToggle={() => setOpenId((cur) => (cur === rung.id ? null : rung.id))}
          />
        ))}
      </div>
    </div>
  );
}
