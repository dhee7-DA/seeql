"use client";

// QueryRace — pits two ledger runs against each other, live.
//
// The diff above answers "what changed?"; the race answers "what did it
// cost?". Both queries are re-run right now — median of 3 server-timed
// samples each — and stepped through the stage pipeline, so every number
// comes from the engine, not from the ledger's memories. The verdict line
// closes the teaching loop: same answer, different price.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flag, RefreshCw, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { diffRowSets } from "@/lib/run-diff";
import type { RunSnapshot } from "@/lib/runs";
import type { ExecResponse, ExecResult } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

interface SideStats {
  durationMs: number | null;
  opcodeCount: number | null;
  /** rows entering the pipeline (first stage count = what the engine read) */
  rowsRead: number | null;
  rowsOut: number | null;
  failed: boolean;
}

type Side = "a" | "b";

const SIDE_CHIP: Record<Side, string> = {
  a: "border-sky-400/60 bg-sky-400/15 text-sky-300",
  b: "border-fuchsia-400/60 bg-fuchsia-400/15 text-fuchsia-300",
};
const SIDE_BAR: Record<Side, string> = {
  a: "bg-sky-400/80",
  b: "bg-fuchsia-400/80",
};
const SIDE_NAME: Record<Side, string> = { a: "A", b: "B" };

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((x, y) => x - y);
  return sorted[Math.floor(sorted.length / 2)];
}

const BLANK: SideStats = { durationMs: null, opcodeCount: null, rowsRead: null, rowsOut: null, failed: false };

async function raceSide(sql: string): Promise<SideStats> {
  try {
    const [execs, stagesRes] = await Promise.all([
      Promise.all(
        Array.from({ length: 3 }, () =>
          fetch("/api/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sql }),
          }).then((r) => r.json() as Promise<ExecResponse>),
        ),
      ),
      fetch("/api/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
      }).then(
        (r) =>
          r.json() as Promise<{
            ok: boolean;
            stages?: { label: string; count: number | null }[];
            out?: { count: number | null };
          }>,
      ),
    ]);
    const oks = execs.filter((e): e is ExecResult => e.ok);
    if (oks.length === 0) return { ...BLANK, failed: true };
    return {
      durationMs: median(oks.map((e) => e.durationMs)),
      opcodeCount: oks.find((e) => typeof e.opcodeCount === "number")?.opcodeCount ?? null,
      rowsRead: stagesRes.ok && stagesRes.stages?.length ? (stagesRes.stages[0].count ?? null) : null,
      rowsOut: stagesRes.ok && stagesRes.out ? (stagesRes.out.count ?? null) : null,
      failed: false,
    };
  } catch {
    return { ...BLANK, failed: true };
  }
}

/** cheaper by rows read first (the honest cost), then bytecode ops, then time */
function cheaper(sa: SideStats, sb: SideStats): Side | "tie" | null {
  if (sa.failed || sb.failed) return null;
  if (sa.rowsRead !== null && sb.rowsRead !== null && sa.rowsRead !== sb.rowsRead)
    return sa.rowsRead < sb.rowsRead ? "a" : "b";
  if (sa.opcodeCount !== null && sb.opcodeCount !== null && sa.opcodeCount !== sb.opcodeCount)
    return sa.opcodeCount < sb.opcodeCount ? "a" : "b";
  if (sa.durationMs !== null && sb.durationMs !== null && sa.durationMs !== sb.durationMs)
    return sa.durationMs < sb.durationMs ? "a" : "b";
  return sa.durationMs === null && sb.durationMs === null ? null : "tie";
}

function Metric({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-0.5 font-mono text-[10px] text-zinc-500">{children}</span>;
}

function SideLane({
  side,
  stats,
  maxDuration,
  racing,
  won,
}: {
  side: Side;
  stats: SideStats | null;
  maxDuration: number;
  racing: boolean;
  won: boolean;
}) {
  const dur = stats?.durationMs ?? null;
  const width = dur !== null && maxDuration > 0 ? Math.max(6, (dur / maxDuration) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <motion.span
        animate={
          won
            ? { rotate: [0, -7, 6, -4, 0], scale: [1, 1.22, 1.05, 1], transition: { duration: 0.55, ease: "easeInOut" } }
            : { rotate: 0, scale: 1, transition: { duration: 0.2 } }
        }
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border font-mono text-[10px] font-bold",
          SIDE_CHIP[side],
        )}
      >
        {SIDE_NAME[side]}
      </motion.span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800/80">
        <motion.div
          className={cn("h-full rounded-full", SIDE_BAR[side])}
          initial={{ width: 0 }}
          animate={{ width: racing ? "38%" : `${width}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
        />
      </div>
      <span className="flex shrink-0 items-center gap-2">
        {won && <Flag className="h-3 w-3 shrink-0 text-amber-300" />}
        <Metric>
          <Timer className="h-2.5 w-2.5" />
          {racing ? "…" : dur !== null ? `${dur}ms` : "—"}
        </Metric>
        <Metric>
          <Zap className="h-2.5 w-2.5" />
          {racing ? "…" : stats?.opcodeCount !== null && stats?.opcodeCount !== undefined ? `${stats.opcodeCount} ops` : "—"}
        </Metric>
        <Metric>
          {racing
            ? "…"
            : stats?.rowsRead !== null && stats?.rowsRead !== undefined
              ? `${stats.rowsRead} → ${stats.rowsOut ?? "?"} rows`
              : "—"}
        </Metric>
      </span>
    </div>
  );
}

export function QueryRace({ runA, runB }: { runA: RunSnapshot; runB: RunSnapshot }) {
  const [result, setResult] = useState<{ key: string; a: SideStats; b: SideStats } | null>(null);
  const [raceNo, setRaceNo] = useState(0);

  // key changes on new picks or "race again" → racing is derived (true until
  // the fresh result lands), so no setState ever happens inside the effect
  const pairKey = `${runA.id}|${runB.id}|${raceNo}`;
  const racing = result?.key !== pairKey;

  useEffect(() => {
    let alive = true;
    Promise.all([raceSide(runA.sql), raceSide(runB.sql)]).then(([a, b]) => {
      if (alive) setResult({ key: pairKey, a, b });
    });
    return () => {
      alive = false;
    };
  }, [pairKey, runA.sql, runB.sql]);

  const stats = { a: result?.key === pairKey ? result.a : null, b: result?.key === pairKey ? result.b : null };

  const sameAnswer = useMemo(() => {
    const d = diffRowSets(runA.columns, runA.rows, runA.rowCount, runB.columns, runB.rows, runB.rowCount);
    return d.sameShape && d.added.length === 0 && d.removed.length === 0;
  }, [runA, runB]);

  const winner = stats.a && stats.b ? cheaper(stats.a, stats.b) : null;
  const maxDuration = Math.max(stats.a?.durationMs ?? 0, stats.b?.durationMs ?? 0);

  // verdict copy — same answer ⇒ a cost race; different answers ⇒ say so
  let verdict: string;
  if (!stats.a || !stats.b) {
    verdict = "On your marks…";
  } else if (stats.a.failed || stats.b.failed) {
    verdict = "One of the two queries would not run just now — the race is off.";
  } else if (!sameAnswer) {
    verdict = `Different answers — A returns ${stats.a.rowsOut ?? "?"} row${stats.a.rowsOut === 1 ? "" : "s"}, B returns ${stats.b.rowsOut ?? "?"} row${stats.b.rowsOut === 1 ? "" : "s"}. Same question first, then the race means something.`;
  } else if (winner === null || winner === "tie") {
    verdict = `Dead heat — same ${runA.rowCount} row${runA.rowCount === 1 ? "" : "s"} out, and the cost is a photo finish too.`;
  } else {
    const w = winner === "a" ? stats.a : stats.b;
    const l = winner === "a" ? stats.b : stats.a;
    const lName = SIDE_NAME[winner === "a" ? "b" : "a"];
    // each branch must require inequality — the winning margin may live in a
    // later metric while an earlier one ties (rows tie, ops tie, time decides)
    const cost =
      w.rowsRead !== null && l.rowsRead !== null && w.rowsRead !== l.rowsRead
        ? `reads ${w.rowsRead} rows where ${lName} reads ${l.rowsRead}`
        : w.opcodeCount !== null && l.opcodeCount !== null && w.opcodeCount !== l.opcodeCount
          ? `compiles to ${w.opcodeCount} ops against ${lName}'s ${l.opcodeCount}`
          : `clocks ${w.durationMs}ms against ${lName}'s ${l.durationMs}ms`;
    verdict = `Same ${runA.rowCount} row${runA.rowCount === 1 ? "" : "s"} out — ${SIDE_NAME[winner]} does it for less: ${cost}.`;
  }

  return (
    <div data-race-for={pairKey}>
      <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
        <Flag className="h-3 w-3" />
        <span className="text-zinc-300">The cost</span>
        <span className="font-mono text-[10px] font-normal text-zinc-600 normal-case">
          both re-run live · median of 3
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRaceNo((n) => n + 1)}
          disabled={racing}
          className="ml-auto h-5 gap-1 px-1.5 text-[10px] font-normal normal-case text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
          aria-label="Race the two queries again"
        >
          <RefreshCw className={cn("h-2.5 w-2.5", racing && "animate-spin")} />
          race again
        </Button>
      </p>
      <div className="space-y-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
        <SideLane side="a" stats={stats.a} maxDuration={maxDuration} racing={racing} won={!racing && winner === "a"} />
        <SideLane side="b" stats={stats.b} maxDuration={maxDuration} racing={racing} won={!racing && winner === "b"} />
        <p className="border-t border-zinc-800/80 pt-2 text-[11px] leading-relaxed text-zinc-300">
          <Flag className="mr-1.5 inline h-3 w-3 align-[-2px] text-amber-300" />
          {verdict}
        </p>
      </div>
    </div>
  );
}
