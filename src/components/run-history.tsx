"use client";

// RunHistory — the ledger of every successful Run, plus the A/B diff.
//
// Pick any two runs as A and B and the popover shows two teachable diffs:
//   1. the QUERY diff — line-level, what you changed
//   2. the RESULT diff — which rows appeared, which disappeared
// together they close the loop "edit → consequence" that SQL learning
// hinges on. Clicking a run's body loads it back into the editor and runs it.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  Eraser,
  History,
  Minus,
  Plus,
  Table2,
  Timer,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QueryRace } from "@/components/query-race";
import { diffHeadline, diffLines, diffRowSets } from "@/lib/run-diff";
import { runTime, type RunSnapshot } from "@/lib/runs";
import type { CellValue } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

const STMT_TONE: Record<string, string> = {
  SELECT: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  WITH: "border-violet-400/30 bg-violet-400/10 text-violet-300",
};

function StmtChip({ type }: { type: string }) {
  return (
    <span
      className={cn(
        "rounded-full border px-1.5 py-px font-mono text-[9px] font-bold",
        STMT_TONE[type] ?? "border-zinc-700 bg-zinc-800/60 text-zinc-300",
      )}
    >
      {type}
    </span>
  );
}

function MiniDiffTable({
  tone,
  columns,
  rows,
  cap = 8,
}: {
  tone: "add" | "del";
  columns: string[];
  rows: CellValue[][];
  cap?: number;
}) {
  const shown = rows.slice(0, cap);
  // SQLite SUMs come back as raw floats (2075.4700000000003) — round for display
  const fmt = (v: CellValue) =>
    typeof v === "number" && !Number.isInteger(v) ? String(Math.round(v * 100) / 100) : String(v);
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800">
      <table className="w-full border-collapse font-mono text-[11px]">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/80">
            <th className="w-6 px-1.5 py-1" />
            {columns.map((c) => (
              <th key={c} className="px-2 py-1 text-left font-semibold text-zinc-400">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row, ri) => (
            <tr
              key={ri}
              className={cn(
                "border-b border-zinc-800/60 last:border-0",
                tone === "add" ? "bg-emerald-400/[0.07]" : "bg-rose-400/[0.07]",
              )}
            >
              <td className="px-1.5 py-1">
                {tone === "add" ? (
                  <Plus className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Minus className="h-3 w-3 text-rose-400" />
                )}
              </td>
              {row.map((v, ci) => (
                <td key={ci} className="max-w-[140px] truncate px-2 py-1 text-zinc-300">
                  {fmt(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > cap && (
        <p className="bg-zinc-900/80 px-2 py-1 text-[10px] text-zinc-500">
          +{rows.length - cap} more row{rows.length - cap === 1 ? "" : "s"} {tone === "add" ? "appeared" : "disappeared"}
        </p>
      )}
    </div>
  );
}

export function RunHistory({
  runs,
  onLoadRun,
  onClear,
}: {
  runs: RunSnapshot[];
  /** load a run's SQL back into the editor + run it */
  onLoadRun: (sql: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);

  const runA = runs.find((r) => r.id === a) ?? null;
  const runB = runs.find((r) => r.id === b) ?? null;
  const comparing = runA !== null && runB !== null;

  const pick = (side: "a" | "b", id: string) => {
    if (side === "a") {
      setA((prev) => (prev === id ? null : id));
      if (b === id) setB(null);
    } else {
      setB((prev) => (prev === id ? null : id));
      if (a === id) setA(null);
    }
  };

  const lineDiff = useMemo(
    () => (comparing ? diffLines(runA!.sql, runB!.sql) : []),
    [comparing, runA, runB],
  );
  const rowDiff = useMemo(
    () =>
      comparing && runA!.statementType !== "WRITE"
        ? diffRowSets(runA!.columns, runA!.rows, runA!.rowCount, runB!.columns, runB!.rows, runB!.rowCount)
        : null,
    [comparing, runA, runB],
  );
  const changedLines = lineDiff.filter((l) => l.type !== "same").length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          aria-label="Run history and diff"
        >
          <History className="h-3.5 w-3.5" />
          History
          {runs.length > 0 && (
            <span className="rounded-full bg-zinc-800 px-1.5 text-[10px] text-zinc-400">
              {runs.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(680px,calc(100vw-2rem))] border-zinc-800 bg-zinc-950/98 p-0"
      >
        <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
          <History className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-200">Run ledger</span>
          {comparing ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 font-mono text-[10px] text-sky-300">
              A ↔ B
            </span>
          ) : (
            <span className="hidden text-[10px] text-zinc-600 sm:block">
              click A then B on two runs to diff them
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            {comparing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setA(b);
                    setB(a);
                  }}
                  className="h-6 gap-1 px-1.5 text-[10px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  aria-label="Swap A and B"
                >
                  <ArrowRightLeft className="h-3 w-3" />
                  swap
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setA(null);
                    setB(null);
                  }}
                  className="h-6 gap-1 px-1.5 text-[10px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  <X className="h-3 w-3" />
                  exit diff
                </Button>
              </>
            )}
            {runs.length > 0 && !comparing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-6 gap-1 px-1.5 text-[10px] text-zinc-500 hover:bg-zinc-800 hover:text-rose-300"
                aria-label="Clear the run ledger"
              >
                <Eraser className="h-3 w-3" />
                clear
              </Button>
            )}
          </div>
        </div>

        {runs.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-zinc-500">
            Run a query and every snapshot lands here — ready to be diffed against the next one.
          </p>
        ) : comparing ? (
          <div className="thin-scrollbar max-h-[62vh] space-y-3 overflow-y-auto p-3">
            {/* query diff */}
            <div>
              <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
                <span className="text-zinc-300">The query</span>
                <span className="font-mono text-[10px] font-normal text-zinc-600 normal-case">
                  {changedLines} changed line{changedLines === 1 ? "" : "s"}
                </span>
              </p>
              <div className="overflow-hidden rounded-lg border border-zinc-800 font-mono text-[11px] leading-relaxed">
                {lineDiff.map((l, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2 px-2 py-px",
                      l.type === "add" && "bg-emerald-400/10 text-emerald-200",
                      l.type === "del" && "bg-rose-400/10 text-rose-200",
                      l.type === "same" && "text-zinc-500",
                    )}
                  >
                    <span className="w-2 shrink-0 select-none">
                      {l.type === "add" ? "+" : l.type === "del" ? "−" : " "}
                    </span>
                    <span className="whitespace-pre-wrap">{l.text || " "}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* result diff */}
            {rowDiff && (
              <div>
                <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
                  <Table2 className="h-3 w-3" />
                  <span className="text-zinc-300">The rows</span>
                  <span className="font-mono text-[10px] font-normal text-zinc-600 normal-case">
                    A {rowDiff.countA} → B {rowDiff.countB}
                  </span>
                </p>
                <p className="mb-2 text-[11px] leading-relaxed text-zinc-400">{diffHeadline(rowDiff)}</p>
                {!rowDiff.sameShape ? (
                  <div className="flex flex-wrap gap-1.5">
                    {rowDiff.colAdded.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                        <Plus className="h-2.5 w-2.5" /> {c}
                      </span>
                    ))}
                    {rowDiff.colRemoved.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 font-mono text-[10px] text-rose-300">
                        <Minus className="h-2.5 w-2.5" /> {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rowDiff.added.length > 0 && (
                      <MiniDiffTable tone="add" columns={runB!.columns} rows={rowDiff.added} />
                    )}
                    {rowDiff.removed.length > 0 && (
                      <MiniDiffTable tone="del" columns={runA!.columns} rows={rowDiff.removed} />
                    )}
                    {rowDiff.added.length === 0 && rowDiff.removed.length === 0 && (
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-[11px] text-zinc-500">
                        Every row matched exactly — same shape, same values.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* the cost — live race between the two picks (read queries only) */}
            {runA!.statementType !== "WRITE" && runB!.statementType !== "WRITE" && (
              <QueryRace runA={runA!} runB={runB!} />
            )}
          </div>
        ) : (
          <div className="thin-scrollbar max-h-[62vh] overflow-y-auto p-2">
            {runs.map((run) => {
              const isA = a === run.id;
              const isB = b === run.id;
              return (
                <motion.div
                  key={run.id}
                  layout
                  className={cn(
                    "group mb-1 flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors",
                    isA && "border-sky-400/50 bg-sky-400/5",
                    isB && "border-fuchsia-400/50 bg-fuchsia-400/5",
                    !isA && !isB && "border-transparent hover:border-zinc-800 hover:bg-zinc-900/60",
                  )}
                >
                  <div className="flex shrink-0 gap-1">
                    {(["a", "b"] as const).map((side) => {
                      const active = side === "a" ? isA : isB;
                      return (
                        <button
                          key={side}
                          onClick={() => pick(side, run.id)}
                          aria-pressed={active}
                          aria-label={`Pick as ${side.toUpperCase()}`}
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded border font-mono text-[10px] font-bold uppercase transition-colors",
                            active
                              ? side === "a"
                                ? "border-sky-400/60 bg-sky-400/15 text-sky-300"
                                : "border-fuchsia-400/60 bg-fuchsia-400/15 text-fuchsia-300"
                              : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300",
                          )}
                        >
                          {side}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      onLoadRun(run.sql);
                      setOpen(false);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    title="Load this run into the editor"
                  >
                    <span className="w-14 shrink-0 font-mono text-[10px] text-zinc-600">{runTime(run.ts)}</span>
                    <StmtChip type={run.statementType} />
                    <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-300">
                      {run.sql.split("\n").find((l) => l.trim() && !l.trim().startsWith("--")) ?? run.sql}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] text-zinc-600">
                      <span className="font-mono">{run.rowCount} rows</span>
                      <span className="inline-flex items-center gap-0.5 font-mono">
                        <Timer className="h-2.5 w-2.5" />
                        {run.durationMs}
                      </span>
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
