"use client";

// Entity-relationship diagram of the sample database.
// HTML table cards are positioned on a fixed canvas; relationship edges are
// drawn in an SVG layer underneath using simple bezier curves.

import { useEffect, useState } from "react";
import { KeyRound, Link2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SCHEMA_CANVAS,
  SCHEMA_LAYOUT,
  SCHEMA_RELATIONSHIPS,
  SCHEMA_TABLES,
} from "@/lib/schema-meta";
import { cn } from "@/lib/utils";

const CARD_W = 190;
const ROW_H = 22;
const HEAD_H = 34;

function rowY(table: string, column: string): number {
  const pos = SCHEMA_LAYOUT[table];
  const table_ = SCHEMA_TABLES.find((t) => t.name === table);
  const idx = table_?.columns.findIndex((c) => c.name === column) ?? 0;
  if (!pos) return 0;
  return pos.y + HEAD_H + idx * ROW_H + ROW_H / 2;
}

export function SchemaView({
  onPickTable,
}: {
  /** Called when the user clicks a table — loads a helper query. Optional. */
  onPickTable?: (table: string) => void;
}) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      const data = (await res.json()) as { ok: boolean; counts?: Record<string, number> };
      if (data.ok && data.counts) setCounts(data.counts);
    } catch {
      // stats unavailable — cards just show no counts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const isRelated = (table: string): boolean => {
    if (!hovered || hovered === table) return true;
    if (hovered === table) return true;
    return SCHEMA_RELATIONSHIPS.some(
      (r) =>
        (r.from.table === hovered && r.to.table === table) ||
        (r.to.table === hovered && r.from.table === table),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs text-zinc-500">
          The sample database — five related tables. Hover a table to highlight its
          relationships.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchCounts}
          className="ml-auto h-7 gap-1.5 px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh counts
        </Button>
      </div>

      <div className="thin-scrollbar overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
        <div
          className="relative"
          style={{ width: SCHEMA_CANVAS.width, height: SCHEMA_CANVAS.height, minWidth: "100%" }}
        >
          {/* edges */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0"
            width={SCHEMA_CANVAS.width}
            height={SCHEMA_CANVAS.height}
          >
            {SCHEMA_RELATIONSHIPS.map((rel) => {
              const fromPos = SCHEMA_LAYOUT[rel.from.table];
              const toPos = SCHEMA_LAYOUT[rel.to.table];
              if (!fromPos || !toPos) return null;
              const x1 = fromPos.x + CARD_W;
              const y1 = rowY(rel.from.table, rel.from.column);
              const x2 = toPos.x;
              const y2 = rowY(rel.to.table, rel.to.column);
              const mid = (x1 + x2) / 2;
              const active =
                hovered === rel.from.table || hovered === rel.to.table;
              return (
                <g key={`${rel.from.table}.${rel.from.column}-${rel.to.table}.${rel.to.column}`}>
                  <path
                    d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    strokeWidth={active ? 2.2 : 1.4}
                    stroke={active ? "var(--color-emerald-400)" : "var(--color-zinc-600)"}
                    strokeDasharray={active ? undefined : "4 3"}
                    opacity={active ? 1 : 0.7}
                  />
                  <circle cx={x1} cy={y1} r={3} fill="var(--color-teal-500)" opacity={0.9} />
                  <circle
                    cx={x2}
                    cy={y2}
                    r={3}
                    fill="var(--color-zinc-500)"
                    stroke={active ? "var(--color-emerald-400)" : "var(--color-zinc-600)"}
                  />
                  <text
                    x={mid}
                    y={(y1 + y2) / 2 - 8}
                    textAnchor="middle"
                    className="fill-zinc-500 font-mono"
                    fontSize="10"
                  >
                    {rel.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* table cards */}
          {SCHEMA_TABLES.map((table) => {
            const pos = SCHEMA_LAYOUT[table.name];
            if (!pos) return null;
            const count = counts?.[table.name];
            const dimmed = !isRelated(table.name);
            return (
              <div
                key={table.name}
                onMouseEnter={() => setHovered(table.name)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onPickTable?.(table.name)}
                className={cn(
                  "absolute rounded-xl border bg-zinc-900/95 shadow-lg transition-opacity",
                  hovered === table.name
                    ? "border-emerald-400/50 shadow-emerald-400/10"
                    : "border-zinc-700/80",
                  dimmed && "opacity-35",
                  onPickTable && "cursor-pointer",
                )}
                style={{ left: pos.x, top: pos.y, width: CARD_W }}
                role={onPickTable ? "button" : undefined}
              >
                {/* header */}
                <div className="flex items-center justify-between gap-1 border-b border-zinc-700/70 px-2.5 py-1.5">
                  <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-100">
                    <Link2 className="h-3 w-3 text-emerald-400" />
                    {table.name}
                  </span>
                  {count !== undefined && (
                    <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                      {count}
                    </span>
                  )}
                </div>
                {/* columns */}
                <ul>
                  {table.columns.map((col) => (
                    <li
                      key={col.name}
                      className="flex items-center justify-between gap-1 px-2.5 font-mono text-[11px]"
                      style={{ height: ROW_H }}
                    >
                      <span className="flex min-w-0 items-center gap-1">
                        {col.pk && <KeyRound className="h-2.5 w-2.5 shrink-0 text-amber-400" />}
                        {col.fk && <KeyRound className="h-2.5 w-2.5 shrink-0 text-zinc-500" />}
                        <span
                          className={cn(
                            "truncate",
                            col.pk ? "font-semibold text-amber-300" : "text-zinc-300",
                          )}
                        >
                          {col.name}
                        </span>
                      </span>
                      <span className="shrink-0 text-[9px] tracking-wide text-zinc-600 uppercase">
                        {col.type.slice(0, 3)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-zinc-600">
        Read it as sentences: one <span className="font-mono text-zinc-400">customer</span> places
        many <span className="font-mono text-zinc-400">orders</span>; each{" "}
        <span className="font-mono text-zinc-400">order</span> holds several{" "}
        <span className="font-mono text-zinc-400">order_items</span>; each{" "}
        <span className="font-mono text-zinc-400">order_item</span> points at one{" "}
        <span className="font-mono text-zinc-400">product</span> made by one{" "}
        <span className="font-mono text-zinc-400">supplier</span>.
      </p>
    </div>
  );
}
