"use client";

// StageInspector — the step-by-step rows behind the row funnel.
//
// Clicking a funnel stage (WHERE gate, GROUP BY fold, …) opens this panel:
// it fetches /api/stages, which re-runs the query stage by stage and returns
// the ACTUAL rows alive at each moment — plus, for filter gates, the rows
// the gate killed (rendered as a ghosted "stopped here" field below).
//
// This is what makes execution order tangible: not "37 rows died at WHERE"
// but *these* 37 rows, right here.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import type { ClauseKind } from "@/lib/sql-clauses";
import type { CellValue } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

type StageKind = ClauseKind | "out";

interface StageData {
  kind: string;
  count: number | null;
  columns: string[] | null;
  rows: CellValue[][] | null;
  killed: { count: number; columns: string[]; rows: CellValue[][] } | null;
}

interface StagesResponse {
  ok: boolean;
  stages?: StageData[];
  out?: { count: number | null; columns: string[] | null; rows: CellValue[][] | null };
  error?: string;
}

const STAGE_TITLE: Record<string, string> = {
  from: "FROM · every row the tables produce",
  where: "WHERE · rows that survived the filter",
  group: "GROUP BY · rows folded into groups",
  having: "HAVING · groups that survived",
  out: "OUT · the final result",
};

const STAGE_ACCENT: Record<string, { text: string; ring: string }> = {
  from: { text: "text-zinc-200", ring: "border-zinc-700/70 bg-zinc-800/50" },
  where: { text: "text-rose-300", ring: "border-rose-400/25 bg-rose-400/10" },
  group: { text: "text-teal-300", ring: "border-teal-400/25 bg-teal-400/10" },
  having: { text: "text-orange-300", ring: "border-orange-400/25 bg-orange-400/10" },
  out: { text: "text-emerald-300", ring: "border-emerald-400/25 bg-emerald-400/10" },
};

const STAGE_STORY: Record<string, (count: number, killed: number | null) => string> = {
  from: (c) => `${c.toLocaleString()} raw rows — everything the JOINs hand over, before any filtering.`,
  where: (c, k) =>
    k !== null
      ? `${c.toLocaleString()} rows survived. ${k.toLocaleString()} row${k === 1 ? " was" : "s were"} stopped at this gate.`
      : `${c.toLocaleString()} rows survived the conditions.`,
  group: (c) => `The matching rows collapse into ${c.toLocaleString()} group${c === 1 ? "" : "s"} — one row per distinct key.`,
  having: (c, k) =>
    k !== null
      ? `${c.toLocaleString()} group${c === 1 ? "" : "s"} kept. ${k.toLocaleString()} group${k === 1 ? " was" : "s were"} stopped at this gate.`
      : `${c.toLocaleString()} group${c === 1 ? "" : "s"} kept.`,
  out: (c) => `${c.toLocaleString()} row${c === 1 ? "" : "s"} come out of the query — after ORDER BY and LIMIT.`,
};

const CHIP_TONES = [
  "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  "border-amber-400/30 bg-amber-400/10 text-amber-300",
  "border-violet-400/30 bg-violet-400/10 text-violet-300",
  "border-teal-400/30 bg-teal-400/10 text-teal-300",
  "border-rose-400/30 bg-rose-400/10 text-rose-300",
  "border-orange-400/30 bg-orange-400/10 text-orange-300",
];

const GHOST_CAP = 6;

/** Compact lesson-grade grid — chips for low-cardinality text, right-aligned numerics. */
function MiniGrid({
  columns,
  rows,
  ghost = false,
}: {
  columns: string[];
  rows: CellValue[][];
  ghost?: boolean;
}) {
  const chipCols = useMemo(() => {
    const map = new Map<number, Map<string, string>>();
    for (let ci = 0; ci < columns.length; ci++) {
      const distinct = new Set<string>();
      let ok = true;
      for (const row of rows) {
        const v = row[ci];
        if (v === null) continue;
        if (typeof v !== "string") { ok = false; break; }
        distinct.add(v);
        if (distinct.size > 6) { ok = false; break; }
      }
      if (ok && distinct.size > 1 && distinct.size <= 6) {
        const tones = new Map<string, string>();
        [...distinct].sort().forEach((v, i) => tones.set(v, CHIP_TONES[i % CHIP_TONES.length]));
        map.set(ci, tones);
      }
    }
    return map;
  }, [columns, rows]);

  const numericCols = useMemo(() => {
    const set = new Set<number>();
    for (let ci = 0; ci < columns.length; ci++) {
      let num = 0;
      let total = 0;
      for (const row of rows.slice(0, 50)) {
        const v = row[ci];
        if (v !== null) {
          total++;
          if (typeof v === "number") num++;
        }
      }
      if (total > 0 && num / total >= 0.8) set.add(ci);
    }
    return set;
  }, [columns, rows]);

  return (
    <div className={cn("thin-scrollbar max-h-56 overflow-auto rounded-lg", ghost ? "border border-dashed border-rose-400/25" : "border border-zinc-800")}>
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 z-10">
          <tr className={ghost ? "bg-rose-950/60 backdrop-blur" : "bg-zinc-900/95 backdrop-blur"}>
            {columns.map((c) => (
              <th
                key={c}
                scope="col"
                className="border-b border-zinc-800/80 px-2.5 py-1.5 font-mono text-[11px] font-semibold whitespace-nowrap text-zinc-300"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ghost ? "opacity-60 hover:opacity-100" : "hover:bg-zinc-800/40"}>
              {row.map((cell, ci) => {
                const tones = chipCols.get(ci);
                return (
                  <td
                    key={ci}
                    className={cn(
                      "max-w-[220px] truncate border-b border-zinc-800/40 px-2.5 py-1 font-mono text-[11px]",
                      cell === null && "italic text-zinc-600",
                      cell !== null && numericCols.has(ci) && "text-right text-teal-300",
                      cell !== null && !numericCols.has(ci) && "text-zinc-300",
                    )}
                  >
                    {cell === null ? (
                      "NULL"
                    ) : tones && typeof cell === "string" && tones.has(cell) ? (
                      <span className={cn("inline-flex rounded-full border px-1.5 py-px text-[10px] font-medium", tones.get(cell))}>
                        {cell}
                      </span>
                    ) : (
                      String(cell)
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-4 text-center text-[11px] text-zinc-500">
                nothing here
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function StageInspector({
  sql,
  dataVersion,
  kind,
  onClose,
}: {
  sql: string;
  /** bumped when the sample DB is reset — rows are re-fetched */
  dataVersion?: number;
  kind: StageKind;
  onClose: () => void;
}) {
  const [data, setData] = useState<{ sql: string; res: StagesResponse } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    })
      .then((r) => r.json() as Promise<StagesResponse>)
      .then((res) => {
        if (!cancelled) setData({ sql, res });
      })
      .catch(() => {
        if (!cancelled) setData({ sql, res: { ok: false, error: "Could not reach the server." } });
      });
    return () => {
      cancelled = true;
    };
  }, [sql, dataVersion, kind]);

  const loading = data?.sql !== sql;
  const stage = useMemo<StageData | null>(() => {
    if (loading || !data?.res.ok || !data.res.stages) return null;
    if (kind === "out") {
      const o = data.res.out;
      if (!o) return null;
      return { kind: "out", count: o.count, columns: o.columns, rows: o.rows, killed: null };
    }
    return data.res.stages.find((s) => s.kind === kind) ?? null;
  }, [data, kind, loading]);

  const accent = STAGE_ACCENT[kind] ?? STAGE_ACCENT.from;
  const killed = stage?.killed ?? null;

  return (
    <motion.figure
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="sheen rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
      aria-label={`Step inspector — rows at ${kind}`}
    >
      <div className="flex items-center justify-between gap-2 px-1 pb-1">
        <figcaption className={cn("font-mono text-[10px] font-semibold tracking-widest uppercase", accent.text)}>
          {STAGE_TITLE[kind] ?? kind}
        </figcaption>
        <button
          onClick={onClose}
          aria-label="Close row inspector"
          className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {loading && (
        <div className="flex h-24 items-center justify-center gap-2 text-xs text-zinc-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          collecting the rows at this stage…
        </div>
      )}

      {!loading && (!data?.res.ok || !stage) && (
        <p className="px-1 py-2 text-[11px] text-zinc-500">
          {data?.res.error === "unsupported"
            ? "The rows at this stage can't be inspected for this query shape (set operations, subqueries in FROM…). Counts in the funnel still work."
            : (data?.res.error ?? "This stage has no rows to show.")}
        </p>
      )}

      {!loading && data?.res.ok && stage && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold", accent.ring, accent.text)}>
              {stage.count?.toLocaleString() ?? "?"} row{stage.count === 1 ? "" : "s"}
            </span>
            <span className="text-[11px] leading-relaxed text-zinc-500">
              {STAGE_STORY[kind]?.(stage.count ?? 0, killed?.count ?? null) ?? ""}
            </span>
          </div>

          {stage.columns && stage.rows ? (
            <MiniGrid columns={stage.columns} rows={stage.rows} />
          ) : (
            <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-[11px] text-zinc-500">
              Rows can't be listed for this stage shape (subquery in FROM, or a table the schema
              doesn't know) — the count above is still live.
            </p>
          )}
          {stage.rows && stage.rows.length >= 60 && (
            <p className="px-1 text-[10px] text-zinc-600">showing the first 60 rows</p>
          )}

          {killed && killed.count > 0 && killed.columns && (
            <div className="rounded-lg border border-dashed border-rose-400/30 bg-rose-500/5 p-2">
              <p className="flex items-center gap-1.5 px-0.5 pb-1.5 font-mono text-[10px] font-semibold tracking-widest text-rose-300/90 uppercase">
                <X className="h-3 w-3" />
                stopped here — {killed.count.toLocaleString()} row{killed.count === 1 ? "" : "s"} didn&apos;t make it
              </p>
              <MiniGrid columns={killed.columns} rows={killed.rows.slice(0, GHOST_CAP)} ghost />
              {killed.count > killed.rows.length && (
                <p className="px-1 pt-1 text-[10px] text-rose-300/60">
                  + {killed.count - Math.min(killed.rows.length, GHOST_CAP)} more not shown
                </p>
              )}
            </div>
          )}
          {killed && killed.count === 0 && (
            <p className="px-1 text-[11px] text-zinc-600">
              Nothing was filtered away here — every row made it through this gate.
            </p>
          )}
        </div>
      )}
    </motion.figure>
  );
}
