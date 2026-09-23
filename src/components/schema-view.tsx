"use client";

// Entity-relationship diagram of the sample database.
// HTML table cards are positioned on a fixed canvas; relationship edges are
// drawn in an SVG layer underneath using simple bezier curves.

import { useEffect, useState } from "react";
import { KeyRound, Link2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORLDS, getWorld } from "@/lib/worlds-meta";
import { cn } from "@/lib/utils";

const CARD_W = 190;
const ROW_H = 22;
const HEAD_H = 34;

function rowY(world: ReturnType<typeof getWorld>, table: string, column: string): number {
  const pos = world.layout[table];
  const table_ = world.tables.find((t) => t.name === table);
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
  const [worldId, setWorldId] = useState("storefront");
  const world = getWorld(worldId);

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
    return world.relationships.some(
      (r) =>
        (r.from.table === hovered && r.to.table === table) ||
        (r.to.table === hovered && r.from.table === table),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="tablist"
          aria-label="Data worlds"
        >
          {WORLDS.map((w) => (
            <button
              key={w.id}
              role="tab"
              aria-selected={w.id === worldId}
              onClick={() => {
                setWorldId(w.id);
                setHovered(null);
              }}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                w.id === worldId
                  ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
              )}
            >
              {w.name}
            </button>
          ))}
        </div>
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

      <p className="px-1 text-xs text-zinc-500">
        <span className="font-medium text-zinc-400">{world.name}</span>
        {" \u00b7 "}
        {world.tagline}
      </p>

      {/* key + edge legend — decode the card and edge vocabulary at a glance */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[10px] text-zinc-500">
        <span className="inline-flex items-center gap-1">
          <KeyRound className="h-2.5 w-2.5 text-amber-400" /> primary key
        </span>
        <span className="inline-flex items-center gap-1">
          <KeyRound className="h-2.5 w-2.5 text-zinc-500" /> foreign key
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="18" height="6" aria-hidden>
            <line x1="0" y1="3" x2="18" y2="3" stroke="var(--color-zinc-500)" strokeWidth="1.4" strokeDasharray="4 3" />
          </svg>
          relationship (1 → many)
        </span>
        {counts !== null && (
          <span className="ml-auto font-mono text-zinc-600">
            {world.tables
              .reduce((a, t) => a + (counts[t.name] ?? 0), 0)
              .toLocaleString()}{' '}
            rows live
          </span>
        )}
      </div>

      <div className="thin-scrollbar overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
        <div
          className="relative"
          style={{ width: world.canvas.width, height: world.canvas.height, minWidth: "100%" }}
        >
          {/* edges */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0"
            width={world.canvas.width}
            height={world.canvas.height}
          >
            {world.relationships.map((rel) => {
              const fromPos = world.layout[rel.from.table];
              const toPos = world.layout[rel.to.table];
              if (!fromPos || !toPos) return null;
              const x1 = fromPos.x + CARD_W;
              const y1 = rowY(world, rel.from.table, rel.from.column);
              const x2 = toPos.x;
              const y2 = rowY(world, rel.to.table, rel.to.column);
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
          {world.tables.map((table) => {
            const pos = world.layout[table.name];
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

      <p className="text-[11px] leading-relaxed text-zinc-600">{world.story}</p>
    </div>
  );
}
