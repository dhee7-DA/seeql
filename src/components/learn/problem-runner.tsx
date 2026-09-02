"use client";

// Graded practice problem: write SQL, run it against the real database,
// get compared with the reference answer. Order-insensitive by default;
// `ordered` problems require exact row order. Idempotent XP per problem.

import { useRef, useState } from "react";
import { Check, Eye, FlaskConical, Lightbulb, Loader2, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SqlEditor } from "@/components/sql-editor";
import { useProgress } from "@/lib/curriculum/progress";
import { xpForDifficulty } from "@/lib/curriculum/gamification";
import { firstMistake } from "@/lib/curriculum/coach";
import type { Problem } from "@/lib/curriculum/types";
import type { ExecResponse, ExecResult } from "@/lib/sql-types";
import { cn } from "@/lib/utils";
import { ResultGrid } from "./result-grid";
import { celebrate } from "./celebrate";

function round2(v: unknown): unknown {
  return typeof v === "number" ? Math.round(v * 100) / 100 : v;
}

function normRows(rows: unknown[][]): string[] {
  return rows.map((r) => JSON.stringify(r.map(round2)));
}

export function gradeResult(res: ExecResponse, p: Problem): { ok: boolean; reason?: string } {
  if (!res.ok) return { ok: false, reason: res.error };
  const result: ExecResult = res;
  // Write/DDL problems: the affected-row count must match first.
  if (p.expected.changes !== undefined && p.expected.changes !== null) {
    if (result.changes == null) {
      return {
        ok: false,
        reason: "This problem needs a write statement (INSERT / UPDATE / DELETE / CREATE …), but your query ran as a read. Re-check the brief.",
      };
    }
    if (result.changes !== p.expected.changes) {
      return {
        ok: false,
        reason: `Expected ${p.expected.changes} row(s) affected, but your statement touched ${result.changes}. Re-check the WHERE — it may be too wide or too narrow.`,
      };
    }
    if (p.expected.rows.length === 0) return { ok: true };
  }
  const expCols = p.expected.columns.map((c) => c.toLowerCase());
  const gotCols = result.columns.map((c) => c.toLowerCase());
  if (!p.relaxedColumns && expCols.join("|") !== gotCols.join("|")) {
    return {
      ok: false,
      reason: `Column mismatch — expected [${p.expected.columns.join(", ")}] but got [${result.columns.join(", ") || "nothing"}]. Check your SELECT list and aliases.`,
    };
  }
  const expRows = normRows(p.expected.rows);
  const gotRows = normRows(result.rows);
  if (p.ordered) {
    if (expRows.length === gotRows.length && expRows.every((r, i) => r === gotRows[i])) return { ok: true };
    if (expRows.length !== gotRows.length)
      return { ok: false, reason: `Expected ${expRows.length} rows, got ${gotRows.length}.` };
    const firstBad = gotRows.findIndex((r, i) => expRows[i] !== r);
    return {
      ok: false,
      reason: `Right rows, wrong order — row ${firstBad + 1} doesn't match. Check your ORDER BY (directions and tiebreakers).`,
    };
  }
  const a = [...expRows].sort();
  const b = [...gotRows].sort();
  if (a.length === b.length && a.every((r, i) => r === b[i])) return { ok: true };
  if (a.length !== b.length) return { ok: false, reason: `Expected ${a.length} rows, got ${b.length}.` };
  return {
    ok: false,
    reason: "Same shape, different rows. Re-read the brief — a condition may be off.",
  };
}

const HINT_LABELS = ["Nudge", "The shape"] as const;

export function ProblemCard({ problem, index, onSolved }: { problem: Problem; index: number; onSolved?: () => void }) {
  const [sql, setSql] = useState("");
  const [result, setResult] = useState<ExecResult | null>(null);
  const [verdict, setVerdict] = useState<{ ok: boolean; reason?: string } | null>(null);
  const [coachMsg, setCoachMsg] = useState<string | null>(null);
  const [runs, setRuns] = useState(0);
  const [hintLevel, setHintLevel] = useState(0); // 0 = hidden, 1..2 = revealed depth
  const [showSolution, setShowSolution] = useState(false);
  const [running, setRunning] = useState(false);
  const solvedRef = useRef(false);

  // Progressive hints: [0] conceptual nudge, [1] syntax skeleton.
  const hints: readonly string[] = problem.hints ?? (problem.hint ? [problem.hint] : []);

  const solved = useProgress((s) => s.xpEvents[`solve:${problem.id}`] !== undefined);

  async function run() {
    if (running || !sql.trim()) return;
    setRunning(true);
    try {
      const r = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql,
          sandbox: problem.mutating ?? false,
          verify: problem.verify,
        }),
      });
      const data = (await r.json()) as ExecResponse;
      setResult(data as ExecResult);
      const v = gradeResult(data, problem);
      setVerdict(v);
      setCoachMsg(v.ok ? null : firstMistake(sql, problem.mistakes));
      setRuns((n) => n + 1);
      if (v.ok && !solvedRef.current) {
        solvedRef.current = true;
        const store = useProgress.getState();
        const amount = xpForDifficulty(problem.difficulty);
        if (store.awardXp(`solve:${problem.id}`, amount)) {
          celebrate({ kind: "xp", title: `+${amount} XP`, sub: `“${problem.title}” solved` });
        }
        onSolved?.();
      }
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium transition-colors",
            solved ? "bg-emerald-400 text-[#052e1c]" : "border border-zinc-700 text-zinc-400",
          )}>
            {solved ? <Check className="h-3.5 w-3.5" /> : index}
          </span>
          <h4 className="text-sm font-medium text-zinc-100">{problem.title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
            problem.difficulty === "easy"
              ? "border-emerald-400/40 text-emerald-300"
              : problem.difficulty === "medium"
                ? "border-amber-400/40 text-amber-300"
                : "border-rose-400/40 text-rose-300",
          )}>
            <span className={cn(
              "h-1 w-1 rounded-full",
              problem.difficulty === "easy"
                ? "bg-emerald-400"
                : problem.difficulty === "medium"
                  ? "bg-amber-400"
                  : "bg-rose-400",
            )} />
            {problem.difficulty} · {xpForDifficulty(problem.difficulty)} XP
          </span>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed text-zinc-300">{problem.brief}</p>
        {problem.mutating && (
          <p className="mt-2 flex items-center gap-1.5 rounded-md border border-violet-400/30 bg-violet-400/5 px-2.5 py-1.5 text-[11px] leading-relaxed text-zinc-400">
            <FlaskConical className="h-3 w-3 shrink-0 text-violet-300" />
            Sandboxed write — your statement really executes, then the change is rolled back. The storefront stays untouched.
          </p>
        )}

        <div className="mt-3 overflow-hidden rounded-md border border-zinc-800">
          <SqlEditor value={sql} onChange={setSql} onVisualize={run} />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Button
            onClick={run}
            disabled={running || !sql.trim()}
            className="btn-glow h-8 gap-1.5 rounded-md bg-emerald-400 px-4 text-xs font-medium text-[#052e1c] hover:bg-emerald-300"
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run &amp; grade
          </Button>
          {hintLevel < hints.length && (
            <Button
              variant="outline"
              onClick={() => setHintLevel((v) => v + 1)}
              className="h-8 gap-1.5 rounded-md border-zinc-800 bg-transparent px-3 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              {hintLevel === 0 ? "Hint" : hints.length > 1 ? "Another hint" : "Hint"}
            </Button>
          )}
          {(solved || runs >= 3) && !showSolution && (
            <Button
              variant="ghost"
              onClick={() => setShowSolution(true)}
              className="h-8 gap-1.5 rounded-md px-3 text-xs text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
            >
              <Eye className="h-3.5 w-3.5" />
              {solved ? "Reference solution" : "Reveal solution"}
            </Button>
          )}
          {runs > 0 && runs < 3 && !solved && (
            <span className="text-[11px] text-zinc-600">{3 - runs} more runs until the solution unlocks</span>
          )}
        </div>

        {hintLevel > 0 && (
          <div className="mt-2.5 space-y-1.5">
            {hints.slice(0, hintLevel).map((h, hi) => (
              <p key={hi} className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
                <span className="font-medium text-zinc-300">{HINT_LABELS[hi] ?? `Hint ${hi + 1}`} · </span>
                <span className="font-mono">{h}</span>
              </p>
            ))}
          </div>
        )}

        {coachMsg && verdict && !verdict.ok && (
          <div className="mt-2.5 flex items-start gap-2 rounded-md border border-sky-400/40 bg-sky-400/5 px-3 py-2.5 text-xs leading-relaxed text-zinc-300">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-300" />
            <div className="min-w-0">
              <span className="font-semibold text-sky-300">Coach · </span>
              <span>{coachMsg}</span>
            </div>
          </div>
        )}

        {verdict && (
          <div className={cn(
            "mt-3 flex items-start gap-2 rounded-md border px-3 py-2.5 text-xs leading-relaxed",
            verdict.ok ? "border-emerald-400/50 bg-emerald-400/5 text-emerald-200" : "border-rose-400/50 bg-rose-400/5 text-zinc-300",
          )}>
            {verdict.ok ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />}
            <div className="min-w-0">
              {verdict.ok ? (
                <>
                  <span className="font-semibold">Matched — graded correct.</span>{" "}
                  {problem.ordered
                    ? "Columns, values and row order all line up."
                    : "Columns and values line up (row order ignored)."}
                </>
              ) : (
                <span>{verdict.reason}</span>
              )}
            </div>
          </div>
        )}

        {result?.ok && result.rows.length > 0 && (
          <div className="mt-3">
            <ResultGrid data={{ columns: result.columns, rows: result.rows }} maxHeight="max-h-52" />
          </div>
        )}

        {result?.ok && result.rows.length === 0 && result.changes != null && (
          <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs text-zinc-400">
            <span className="font-mono text-emerald-300">{result.changes}</span>
            {" "}
            row{result.changes === 1 ? "" : "s"} affected
            {problem.mutating ? " · change rolled back after grading" : ""}
          </div>
        )}

        {showSolution && (
          <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5">
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Reference solution</p>
            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-emerald-200">{problem.solution}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
