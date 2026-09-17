"use client";

// Flow view: explains HOW a query transforms rows. Three linked probes:
//   1. Query funnel — live row counts at every pipeline stage
//   2. Filter breakdown — what each WHERE condition does on its own
//   3. Join inspector — fan-out / shrink per join with unmatched rows
// Counts come from /api/funnel, which rebuilds the AST and runs
// cumulative COUNT(*) probes against the sample database.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Filter,
  GitMerge,
  Info,
  Loader2,
  TrendingDown,
  TrendingUp,
  Waypoints,
} from "lucide-react";
import type { FunnelResponse } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

const STAGE_BAR: Record<string, string> = {
  from: "bg-zinc-500",
  where: "bg-amber-500",
  group: "bg-violet-500",
  having: "bg-rose-500",
  distinct: "bg-teal-500",
  order: "bg-zinc-600",
  result: "bg-emerald-500",
};

function Bar({
  count,
  max,
  color,
}: {
  count: number | null;
  max: number;
  color: string;
}) {
  const pct = count === null ? 0 : max > 0 ? Math.max((count / max) * 100, count > 0 ? 1.5 : 0) : 0;
  return (
    <div className="h-5 min-w-[6px] flex-1 overflow-hidden rounded-md bg-zinc-800/80">
      <div
        className={cn("h-full rounded-md transition-all duration-500", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function joinTone(multiplier: number | null): { chip: string; text: string } {
  if (multiplier === null) return { chip: "border-zinc-700 bg-zinc-800 text-zinc-400", text: "count unavailable" };
  if (multiplier > 1.05)
    return { chip: "border-rose-400/30 bg-rose-400/10 text-rose-300", text: "fan-out — one row here matches several on the other side" };
  if (multiplier < 0.95)
    return { chip: "border-amber-400/30 bg-amber-400/10 text-amber-300", text: "shrink — some rows found no match and dropped out" };
  return { chip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", text: "roughly one-to-one" };
}

export function FlowView({
  sql,
  dialect,
  runKey,
}: {
  sql: string;
  dialect: string;
  /** Bumped every time the user runs a query — triggers a fresh probe. */
  runKey: number;
}) {
  const [data, setData] = useState<FunnelResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Probe only when a query RUNS (runKey bumps) — not on every keystroke.
  // sql/dialect are read through refs so typing never triggers probes.
  // (This sync effect is declared first, so refs are fresh when the probe
  // effect below runs on the same render pass.)
  const sqlRef = useRef(sql);
  const dialectRef = useRef(dialect);
  useEffect(() => {
    sqlRef.current = sql;
    dialectRef.current = dialect;
  });

  useEffect(() => {
    let alive = true;
    // setTimeout keeps setState out of the synchronous effect body
    const timer = setTimeout(() => {
      if (!alive) return;
      const text = sqlRef.current.trim();
      if (!text) {
        setData(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      fetch("/api/funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: text, dialect: dialectRef.current }),
      })
        .then((r) => r.json() as Promise<FunnelResponse>)
        .then((json) => {
          if (alive) setData(json);
        })
        .catch(() => {
          if (alive) setData({ ok: false, error: "Could not reach the funnel probes." });
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    }, 0);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [runKey]);

  const maxCount = useMemo(() => {
    if (!data || !data.ok) return 1;
    return Math.max(...data.stages.map((s) => s.count ?? 0), 1);
  }, [data]);

  if (loading && !data) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Probing row counts at every stage…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-500">
        Run a query to see how rows flow through it.
      </div>
    );
  }

  if (!data.ok) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-200">
        <p className="font-semibold">Funnel probes failed</p>
        <pre className="thin-scrollbar mt-2 max-h-24 overflow-auto font-mono text-xs whitespace-pre-wrap text-rose-200/80">
          {data.error}
        </pre>
      </div>
    );
  }

  if (!data.applicable) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/5 p-4 text-sm text-amber-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <p className="font-medium">{data.reason}</p>
            {data.finalRows !== null && (
              <p className="mt-1 text-xs text-zinc-400">
                Final result: <span className="font-mono font-bold text-zinc-200">{data.finalRows}</span> rows.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. query funnel */}
      <section aria-label="Query funnel">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
          <Waypoints className="h-3.5 w-3.5 text-emerald-500" />
          Row funnel — live counts from SQLite
        </h3>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="space-y-2">
            {data.stages.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <div className="w-40 shrink-0 sm:w-52">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-100">{s.label}</span>
                  </div>
                  <p className="truncate text-[10px] text-zinc-600" title={s.detail}>
                    {s.detail}
                  </p>
                </div>
                <Bar count={s.count} max={maxCount} color={STAGE_BAR[s.key] ?? "bg-zinc-500"} />
                <div className="flex w-24 shrink-0 items-baseline justify-end gap-1.5 sm:w-28">
                  <span className="font-mono text-sm font-bold text-zinc-100">
                    {s.count?.toLocaleString() ?? "?"}
                  </span>
                  {s.delta && (
                    <span
                      className={cn(
                        "font-mono text-[10px]",
                        s.delta.startsWith("-")
                          ? "text-rose-400"
                          : s.delta === "±0%"
                            ? "text-zinc-500"
                            : "text-emerald-400",
                      )}
                    >
                      {s.delta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
            Each stage is measured with a real <span className="font-mono">COUNT(*)</span> probe on
            the sample database — this is exactly how many rows survive that step.
          </p>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* 2. filter breakdown */}
        <section aria-label="Filter breakdown">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
            <Filter className="h-3.5 w-3.5 text-amber-400" />
            What each condition does
          </h3>
          {data.filters.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3.5 py-3 text-xs text-zinc-500">
              No WHERE clause in this query.
            </p>
          ) : (
            <div className="space-y-2">
              {data.filters.map((f, i) => (
                <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5">
                  <p className="truncate font-mono text-[11px] text-zinc-300" title={f.text}>
                    <span className="mr-1.5 rounded bg-zinc-800 px-1 text-[9px] text-zinc-500">
                      #{i + 1}
                    </span>
                    {f.text}
                  </p>
                  <div className="mt-1.5 grid grid-cols-[auto_1fr_auto] items-center gap-2">
                    <span className="text-[9px] tracking-wide text-zinc-600 uppercase">alone</span>
                    <Bar count={f.individual} max={maxCount} color="bg-amber-500/70" />
                    <span className="w-12 text-right font-mono text-xs text-zinc-300">
                      {f.individual ?? "?"}
                    </span>
                    <span className="text-[9px] tracking-wide text-zinc-600 uppercase">cumul.</span>
                    <Bar count={f.cumulative} max={maxCount} color="bg-amber-500" />
                    <span className="w-12 text-right font-mono text-xs font-bold text-zinc-100">
                      {f.cumulative ?? "?"}
                    </span>
                  </div>
                </div>
              ))}
              <p className="text-[11px] leading-relaxed text-zinc-600">
                <span className="text-zinc-400">alone</span> = rows passing just this condition ·{" "}
                <span className="text-zinc-400">cumul.</span> = rows passing every condition so far.
              </p>
            </div>
          )}
        </section>

        {/* 3. join inspector */}
        <section aria-label="Join inspector">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
            <GitMerge className="h-3.5 w-3.5 text-teal-400" />
            Join inspector
          </h3>
          {data.joins.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3.5 py-3 text-xs text-zinc-500">
              No joins in this query.
            </p>
          ) : (
            <div className="space-y-2">
              {data.joins.map((j, i) => {
                const tone = joinTone(j.multiplier);
                return (
                  <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5">
                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                      <span className="font-bold text-zinc-100">{j.left}</span>
                      <span className="rounded border border-teal-400/30 bg-teal-400/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-300">
                        {j.type}
                      </span>
                      <span className="font-bold text-zinc-100">{j.right}</span>
                      {j.multiplier !== null && (
                        <span className={cn("ml-auto rounded-full border px-2 py-0.5 text-[10px] font-bold", tone.chip)}>
                          ×{j.multiplier}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate font-mono text-[10px] text-zinc-500" title={j.on}>
                      ON {j.on}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-400">
                      <TrendingDown className="hidden h-3.5 w-3.5" />
                      <span className="font-mono">
                        {j.before ?? "?"} <span className="text-zinc-600">→</span>{" "}
                        <span className="font-bold text-zinc-100">{j.after ?? "?"}</span>
                      </span>
                      <span className="text-[10px] text-zinc-600">rows</span>
                      {j.unmatchedLeft !== null && (
                        <span className="ml-auto rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300">
                          {j.unmatchedLeft} unmatched on the left
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-zinc-600">{tone.text}</p>
                  </div>
                );
              })}
              <p className="text-[11px] leading-relaxed text-zinc-600">
                Watch for <TrendingUp className="inline h-3 w-3 text-rose-400" />{" "}
                <span className="text-rose-300">fan-out</span>: joins can silently multiply rows and
                skew SUM / COUNT aggregates.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
