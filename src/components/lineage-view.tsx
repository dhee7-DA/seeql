"use client";

// Column lineage map: answers "where does each output column come from?".
// Left = source tables, right = output columns; bezier edges are drawn per
// (source → output) reference, colored by source table. Computed columns
// that mix several tables fan in from each of them. Everything is derived
// client-side from the parse plan — no extra API call.

import { useMemo, useState } from "react";
import { Info, Route } from "lucide-react";
import type { QueryPlan } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

const TABLE_COLORS = [
  { edge: "#34d399", chip: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  { edge: "#2dd4bf", chip: "border-teal-400/40 bg-teal-400/10 text-teal-300" },
  { edge: "#a78bfa", chip: "border-violet-400/40 bg-violet-400/10 text-violet-300" },
  { edge: "#fbbf24", chip: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  { edge: "#fb7185", chip: "border-rose-400/40 bg-rose-400/10 text-rose-300" },
  { edge: "#60a5fa", chip: "border-blue-400/40 bg-blue-400/10 text-blue-300" },
];

const NODE_W = 210;
const ROW_H = 54;
const PAD_TOP = 10;
const CANVAS_W = 760;
const LEFT_X = 12;
const RIGHT_X = CANVAS_W - NODE_W - 12;

interface Edge {
  fromTable: string;
  toColumn: number;
  color: string;
  star: boolean;
}

export function LineageView({ plan }: { plan: QueryPlan }) {
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [hoverTable, setHoverTable] = useState<string | null>(null);

  const model = useMemo(() => {
    // Top-level SELECT items only — subquery internals are their own story.
    const columns = plan.columns.filter((c) => (c.depth ?? 0) === 0);
    const tableIds = plan.tables.filter((t) => t.depth === 0).map((t) => t.id);

    const colorOf = new Map<string, (typeof TABLE_COLORS)[number]>();
    tableIds.forEach((id, i) => colorOf.set(id, TABLE_COLORS[i % TABLE_COLORS.length]));

    const edges: Edge[] = [];
    columns.forEach((c, ci) => {
      const sources =
        c.sourceTables && c.sourceTables.length > 0
          ? c.sourceTables
          : c.table
            ? [c.table]
            : [];
      for (const src of sources) {
        edges.push({
          fromTable: src,
          toColumn: ci,
          color: colorOf.get(src)?.edge ?? "#71717a",
          star: c.isStar,
        });
      }
    });

    const usedTables = tableIds.filter((id) => edges.some((e) => e.fromTable === id));
    // Tables used in FROM/JOIN/WHERE but never in the SELECT list.
    const filterOnly = tableIds.filter(
      (id) => !usedTables.includes(id) && !columns.some((c) => c.isStar),
    );

    const displayName = (id: string) => {
      const t = plan.tables.find((x) => x.id === id);
      if (!t) return id;
      return t.alias ? `${t.name} ${t.alias}` : t.name;
    };

    const height = PAD_TOP * 2 + Math.max(usedTables.length, columns.length, 1) * ROW_H;
    return { columns, usedTables, filterOnly, edges, colorOf, displayName, height };
  }, [plan]);

  if (plan.statementType !== "SELECT") {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/5 p-4 text-sm text-amber-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <p>
          Column lineage is a SELECT-story — this {plan.statementType} statement has no output
          columns to trace.
        </p>
      </div>
    );
  }

  if (model.columns.length === 0) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
        <p>No output columns were found in the SELECT list.</p>
      </div>
    );
  }

  const colY = (i: number) => PAD_TOP + i * ROW_H + ROW_H / 2;
  const tblY = (i: number) => PAD_TOP + i * ROW_H + ROW_H / 2;

  const edgeActive = (e: Edge) =>
    hoverCol === e.toColumn || (hoverTable !== null && e.fromTable === hoverTable);
  const somethingHovered = hoverCol !== null || hoverTable !== null;

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
        <Route className="h-3.5 w-3.5 text-emerald-500" />
        Column lineage — where each output column comes from
      </h3>

      <div className="thin-scrollbar overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
        <div className="relative" style={{ width: CANVAS_W, height: model.height }}>
          {/* edges */}
          <svg className="absolute inset-0" width={CANVAS_W} height={model.height}>
            {model.edges.map((e, i) => {
              const ti = model.usedTables.indexOf(e.fromTable);
              if (ti < 0) return null;
              const y1 = tblY(ti);
              const y2 = colY(e.toColumn);
              const dx = (RIGHT_X - LEFT_X - NODE_W) * 0.5;
              return (
                <path
                  key={i}
                  d={`M ${LEFT_X + NODE_W} ${y1} C ${LEFT_X + NODE_W + dx} ${y1}, ${RIGHT_X - dx} ${y2}, ${RIGHT_X} ${y2}`}
                  fill="none"
                  stroke={e.color}
                  strokeWidth={edgeActive(e) ? 3 : 1.5}
                  strokeDasharray={e.star ? "5 4" : undefined}
                  opacity={somethingHovered && !edgeActive(e) ? 0.12 : 0.65}
                  className="transition-all duration-150"
                />
              );
            })}
          </svg>

          {/* source tables */}
          {model.usedTables.map((id, ti) => {
            const tone = model.colorOf.get(id);
            const dim = somethingHovered && hoverTable !== id && !model.edges.some((e) => e.fromTable === id && e.toColumn === hoverCol);
            return (
              <button
                key={id}
                type="button"
                onMouseEnter={() => setHoverTable(id)}
                onMouseLeave={() => setHoverTable(null)}
                className={cn(
                  "absolute flex flex-col items-start rounded-lg border bg-zinc-900 px-3 py-1.5 text-left transition-all duration-150",
                  tone?.chip ?? "border-zinc-700 text-zinc-300",
                  dim && "opacity-30",
                )}
                style={{ left: LEFT_X, top: PAD_TOP + ti * ROW_H, width: NODE_W }}
              >
                <span className="w-full truncate font-mono text-xs font-bold">
                  {model.displayName(id)}
                </span>
                <span className="text-[9px] tracking-wide uppercase opacity-70">
                  source · {model.edges.filter((e) => e.fromTable === id).length} col
                  {model.edges.filter((e) => e.fromTable === id).length === 1 ? "" : "s"}
                </span>
              </button>
            );
          })}

          {/* output columns */}
          {model.columns.map((c, ci) => {
            const myEdges = model.edges.filter((e) => e.toColumn === ci);
            const dim = somethingHovered && hoverCol !== ci && !myEdges.some((e) => e.fromTable === hoverTable);
            const multi = new Set(myEdges.map((e) => e.fromTable)).size > 1;
            const label = c.alias ?? c.text;
            return (
              <button
                key={`${c.text}-${ci}`}
                type="button"
                onMouseEnter={() => setHoverCol(ci)}
                onMouseLeave={() => setHoverCol(null)}
                className={cn(
                  "absolute flex flex-col items-start rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-left transition-all duration-150 hover:border-zinc-500",
                  dim && "opacity-30",
                )}
                style={{ left: RIGHT_X, top: PAD_TOP + ci * ROW_H, width: NODE_W }}
              >
                <span className="flex w-full items-center gap-1.5">
                  <span className="truncate font-mono text-xs font-bold text-zinc-100">
                    {label}
                  </span>
                  {c.isStar && (
                    <span className="shrink-0 rounded bg-zinc-800 px-1 text-[9px] text-zinc-400">*</span>
                  )}
                  {c.aggregation && (
                    <span className="shrink-0 rounded bg-violet-400/15 px-1 text-[9px] font-bold text-violet-300">
                      {c.aggregation}
                    </span>
                  )}
                  {multi && (
                    <span
                      className="ml-auto shrink-0 rounded bg-amber-400/15 px-1 text-[9px] font-bold text-amber-300"
                      title="This expression mixes columns from several tables"
                    >
                      computed
                    </span>
                  )}
                </span>
                <span className="w-full truncate font-mono text-[9px] text-zinc-500" title={c.text}>
                  {c.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-600">
        <span>
          Hover a table or column to trace its flow · dashed edge ={" "}
          <span className="font-mono">*</span> (all columns)
        </span>
        {model.filterOnly.length > 0 && (
          <span className="text-zinc-500">
            Filtered but never selected:{" "}
            {model.filterOnly.map((id) => model.displayName(id)).join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}
