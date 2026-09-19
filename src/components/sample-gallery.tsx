"use client";

// SampleGallery — replaces the plain sample dropdown with picture cards.
//
// Every card carries a mini flow-diagram schematic of its query (the same
// visual language as the lessons and the flow strip: dashed gates, fold
// nodes, emerald OUT), so you pick a query by its PICTURE, not its text.
// The schematic is derived live from the SQL via the clause scanner.

import { useMemo, useState } from "react";
import { ChevronDown, LayoutTemplate } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { findClauses, type ClauseKind } from "@/lib/sql-clauses";
import { SAMPLE_QUERIES } from "@/lib/samples";
import { cn } from "@/lib/utils";

// ---- mini schematic -------------------------------------------------------

interface MiniNode {
  kind: ClauseKind | "out" | "cte" | "setop" | "join";
  x: number;
  w: number;
}

const NODE_STYLE: Record<string, { cls: string; dash?: string }> = {
  cte: { cls: "fill-violet-400/10 stroke-violet-400/50" },
  from: { cls: "fill-zinc-800/80 stroke-zinc-600" },
  join: { cls: "fill-amber-400/10 stroke-amber-400/50" },
  where: { cls: "fill-rose-500/5 stroke-rose-400/50", dash: "3 2.5" },
  group: { cls: "fill-teal-500/10 stroke-teal-400/50" },
  having: { cls: "fill-orange-500/5 stroke-orange-400/50", dash: "3 2.5" },
  setop: { cls: "fill-zinc-700/50 stroke-zinc-500", dash: "2 2" },
  out: { cls: "fill-emerald-400/15 stroke-emerald-400/60" },
};

/**
 * Tiny left-to-right schematic of the query's shape. 150×44 viewBox;
 * nodes spaced evenly, arrows between them. For set operations two
 * sources converge on the OUT pill.
 */
function MiniFlow({ sql }: { sql: string }) {
  const { nodes, setop } = useMemo(() => {
    const { spans, supported } = findClauses(sql);
    const present = new Set(spans.map((s) => s.kind));
    const kinds: Array<MiniNode["kind"]> = [];
    if (present.has("with")) kinds.push("cte");
    kinds.push("from");
    if (/\bjoin\b/i.test(sql)) kinds.push("join");
    if (present.has("where")) kinds.push("where");
    if (present.has("group")) kinds.push("group");
    if (present.has("having")) kinds.push("having");
    if (!supported) kinds.push("setop");
    kinds.push("out");

    // layout — 150 wide, 12 padding each side
    const usable = 150 - 24;
    const gap = 10;
    const totalGap = gap * (kinds.length - 1);
    const nodeW = Math.min(30, Math.max(14, (usable - totalGap) / kinds.length));
    let x = 12;
    const laid = kinds.map((kind) => {
      const node: MiniNode = { kind, x, w: nodeW };
      x += nodeW + gap;
      return node;
    });
    return { nodes: laid, setop: !supported };
  }, [sql]);

  const H = 44;
  const cy = H / 2 - 2;

  return (
    <svg viewBox={`0 0 150 ${H}`} className="w-full" aria-hidden role="presentation">
      {nodes.map((n, i) => {
        const style = NODE_STYLE[n.kind];
        const h = n.kind === "out" ? 14 : 16;
        const y = cy - h / 2;
        const prev = nodes[i - 1];
        return (
          <g key={`${n.kind}-${i}`}>
            {prev && (
              <line
                x1={prev.x + prev.w}
                y1={cy}
                x2={n.x}
                y2={cy}
                className="stroke-zinc-600"
                strokeWidth={1.2}
                strokeLinecap="round"
              />
            )}
            {n.kind === "setop" ? (
              // two merging sources instead of a box
              <>
                <path
                  d={`M ${n.x - 2} ${cy - 8} Q ${n.x + 4} ${cy - 8} ${n.x + 5} ${cy}`}
                  className="stroke-zinc-600"
                  strokeWidth={1.2}
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d={`M ${n.x - 2} ${cy + 8} Q ${n.x + 4} ${cy + 8} ${n.x + 5} ${cy}`}
                  className="stroke-zinc-600"
                  strokeWidth={1.2}
                  fill="none"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <rect
                x={n.x}
                y={y}
                width={n.w}
                height={h}
                rx={n.kind === "out" ? 7 : 4}
                strokeWidth={1.1}
                strokeDasharray={style.dash}
                className={style.cls}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ---- gallery --------------------------------------------------------------

const CHIP_LABEL: Partial<Record<ClauseKind, string>> = {
  with: "CTE",
  where: "WHERE",
  group: "GROUP BY",
  having: "HAVING",
  order: "ORDER BY",
  limit: "LIMIT",
};

const CHIP_CLS: Partial<Record<ClauseKind, string>> = {
  with: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  where: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  group: "border-teal-400/30 bg-teal-400/10 text-teal-300",
  having: "border-orange-400/30 bg-orange-400/10 text-orange-300",
  order: "border-zinc-700 bg-zinc-800/60 text-zinc-400",
  limit: "border-zinc-700 bg-zinc-800/60 text-zinc-400",
};

export function SampleGallery({
  currentId,
  onPick,
}: {
  currentId: string;
  onPick: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = SAMPLE_QUERIES.find((s) => s.id === currentId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Load a sample query"
        className={cn(
          "inline-flex h-9 items-center justify-between gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-xs text-zinc-200 transition-colors hover:bg-zinc-800",
          "w-[150px] sm:w-[190px]",
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <LayoutTemplate className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <span className="truncate">{current ? current.name : "Sample queries"}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[560px] border-zinc-800 bg-zinc-950 p-2">
        <p className="px-1.5 pb-1.5 pt-0.5 font-mono text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
          Pick a query by its picture
        </p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {SAMPLE_QUERIES.map((s) => {
            const chips = chipsFor(s.sql);
            return (
              <button
                key={s.id}
                onClick={() => {
                  onPick(s.id);
                  setOpen(false);
                }}
                className={cn(
                  "group rounded-lg border p-2 text-left transition-colors",
                  s.id === currentId
                    ? "border-emerald-400/40 bg-emerald-400/5"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900",
                )}
              >
                <MiniFlow sql={s.sql} />
                <p className="mt-1 truncate text-xs font-medium text-zinc-200">{s.name}</p>
                <p className="truncate text-[10px] leading-relaxed text-zinc-500">{s.description}</p>
                <span className="mt-1 flex flex-wrap gap-1">
                  {chips.map((c) => (
                    <span
                      key={c.label}
                      className={cn("rounded-full border px-1.5 py-px font-mono text-[9px] font-medium", c.cls)}
                    >
                      {c.label}
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** clause chips for a sample — tiny helper so the card stays terse */
function chipsFor(sql: string): Array<{ label: string; cls: string }> {
  const { spans } = findClauses(sql);
  const out: Array<{ label: string; cls: string }> = [];
  for (const kind of ["with", "where", "group", "having"] as ClauseKind[]) {
    if (spans.some((s) => s.kind === kind)) {
      out.push({ label: CHIP_LABEL[kind] ?? kind, cls: CHIP_CLS[kind] ?? "" });
    }
  }
  if (/\bjoin\b/i.test(sql)) out.push({ label: "JOIN", cls: "border-amber-400/30 bg-amber-400/10 text-amber-300" });
  if (/\bUNION\b/i.test(sql)) out.push({ label: "UNION", cls: "border-zinc-700 bg-zinc-800/60 text-zinc-400" });
  return out;
}
