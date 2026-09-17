"use client";

// Schema panel — the whole storefront in plain sight, grouped the way the
// business thinks: "Sales flow" (who buys, what they owe, what comes back)
// and "Ops & catalog" (who supplies, ships, and works here). Above the
// cards sits a live SVG map: every arrow is a real foreign key, dashes
// flow along it, data packets ride the curves, and tables your query
// touches glow with a ⚡ pulse. Click any table — map or card — or column
// token and it drops into the editor at your caret.

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { tableEmoji } from "@/components/landing/sandbox-graphics";

export interface SandboxColumn {
  name: string;
  type: string;
  pk: boolean;
  fk: string | null;
}

export interface SandboxTable {
  name: string;
  rows: number;
  cols?: SandboxColumn[];
}

const GROUPS: Array<{ id: string; label: string; tables: string[] }> = [
  {
    id: "sales",
    label: "🛒 Sales flow",
    tables: ["customers", "orders", "order_items", "payments", "refunds"],
  },
  {
    id: "ops",
    label: "🧰 Ops & catalog",
    tables: ["suppliers", "products", "shipments", "employees", "acquisitions"],
  },
];

// ── Live ER map ────────────────────────────────────────────────────────
// Hand-laid node coordinates (viewBox 660×196, node 124×42). Edges flow
// parent → child; `cross` edges point at a table in the other group.

interface MapNode {
  table: string;
  x: number;
  y: number;
}

interface MapEdge {
  from: string;
  to: string;
  label?: string;
  d: string;
  labelAt: [number, number];
  cross?: { label: string; target: string };
}

const NODE_W = 124;
const NODE_H = 42;

const MAPS: Record<string, { nodes: MapNode[]; edges: MapEdge[] }> = {
  sales: {
    nodes: [
      { table: "customers", x: 12, y: 77 },
      { table: "orders", x: 192, y: 77 },
      { table: "order_items", x: 388, y: 8 },
      { table: "refunds", x: 388, y: 77 },
      { table: "payments", x: 388, y: 146 },
    ],
    edges: [
      { from: "customers", to: "orders", label: "customer_id", d: "M 136 98 C 162 98, 166 98, 192 98", labelAt: [164, 90] },
      { from: "orders", to: "order_items", label: "order_id", d: "M 316 98 C 352 98, 352 29, 388 29", labelAt: [352, 58] },
      { from: "orders", to: "refunds", label: "order_id", d: "M 316 98 C 344 98, 360 98, 388 98", labelAt: [352, 90] },
      { from: "orders", to: "payments", label: "order_id", d: "M 316 98 C 352 98, 352 167, 388 167", labelAt: [352, 129] },
      { from: "order_items", to: "order_items", d: "M 512 29 C 552 29, 552 16, 586 16", labelAt: [549, 44], cross: { label: "products 📦", target: "products" } },
      { from: "refunds", to: "refunds", d: "M 512 98 C 552 98, 552 98, 586 98", labelAt: [549, 113], cross: { label: "employees 🧑‍💼", target: "employees" } },
    ],
  },
  ops: {
    nodes: [
      { table: "suppliers", x: 12, y: 77 },
      { table: "products", x: 192, y: 77 },
      { table: "shipments", x: 388, y: 8 },
      { table: "employees", x: 388, y: 77 },
      { table: "acquisitions", x: 388, y: 146 },
    ],
    edges: [
      { from: "suppliers", to: "products", label: "supplier_id", d: "M 136 98 C 162 98, 166 98, 192 98", labelAt: [164, 90] },
      { from: "employees", to: "employees", label: "manager_id", d: "M 452 75 C 452 44, 506 44, 506 73", labelAt: [479, 45] },
      { from: "shipments", to: "shipments", d: "M 512 29 C 552 29, 552 16, 586 16", labelAt: [549, 44], cross: { label: "orders 🧾", target: "orders" } },
      { from: "acquisitions", to: "acquisitions", d: "M 512 167 C 552 167, 552 180, 586 180", labelAt: [549, 158], cross: { label: "customers 👥", target: "customers" } },
    ],
  },
};

function SchemaMap({
  groupId,
  tables,
  active,
  focus,
  onInsert,
}: {
  groupId: string;
  tables: SandboxTable[];
  active: Set<string>;
  focus: Set<string>;
  onInsert: (token: string) => void;
}) {
  const id = useId();
  const map = MAPS[groupId];
  const rowsOf = (t: string) => tables.find((x) => x.name === t)?.rows;

  const markers = (
    <defs>
      <marker id={`${id}-z`} markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
        <path d="M0,0 L7,3.5 L0,7 Z" fill="#71717a" />
      </marker>
      <marker id={`${id}-s`} markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
        <path d="M0,0 L7,3.5 L0,7 Z" fill="#7dd3fc" />
      </marker>
      <marker id={`${id}-e`} markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
        <path d="M0,0 L7,3.5 L0,7 Z" fill="#6ee7b7" />
      </marker>
    </defs>
  );

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950/70">
      <p className="border-b border-zinc-800/60 px-3 py-1.5 font-mono text-[10px] text-zinc-600">
        live map — arrows are real foreign keys ✦ tables your query touches glow ⚡
      </p>
      <svg
        viewBox="0 0 660 196"
        className="h-auto w-full"
        role="img"
        aria-label={`relationship map of the ${groupId} tables`}
      >
        {markers}

        {/* edges under the nodes */}
        {map.edges.map((e, i) => {
          const crossActive = e.cross ? active.has(e.from) && active.has(e.cross.target) : false;
          const isActive = e.cross ? crossActive : active.has(e.from) && active.has(e.to);
          const isEdgeFocus = !e.cross && focus.has(e.from) && focus.has(e.to);
          const stroke = e.cross
            ? crossActive
              ? "rgb(52 211 153 / 0.9)"
              : "rgb(82 82 91 / 0.9)"
            : isActive
              ? "rgb(56 189 248 / 0.85)"
              : "rgb(113 113 122 / 0.65)";
          const headId = e.cross
            ? crossActive
              ? `${id}-e`
              : `${id}-z`
            : isActive
              ? `${id}-s`
              : `${id}-z`;
          const packetFill = e.cross
            ? crossActive
              ? "#6ee7b7"
              : "#71717a"
            : isActive
              ? "#7dd3fc"
              : "#a1a1aa";
          return (
            <g key={`${e.from}-${e.to}-${i}`}>
              <path
                d={e.d}
                fill="none"
                stroke={stroke}
                strokeWidth={isEdgeFocus ? 2.6 : isActive ? 1.8 : 1.3}
                strokeDasharray={e.cross ? "3 5" : "5 5"}
                strokeLinecap="round"
                markerEnd={`url(#${headId})`}
                className="flow-dash"
              />
              <circle r={2.6} fill={packetFill}>
                <animateMotion dur="2.2s" begin={`${-0.7 * (i % 3)}s`} repeatCount="indefinite" path={e.d} />
              </circle>
              {e.label && (
                <text
                  x={e.labelAt[0]}
                  y={e.labelAt[1]}
                  textAnchor="middle"
                  fontSize="8.5"
                  className="font-mono"
                  fill={isActive ? "#7dd3fc" : "#71717a"}
                  stroke="#09090b"
                  strokeWidth={5}
                  paintOrder="stroke"
                >
                  {e.label}
                </text>
              )}
              {e.cross && (
                <text
                  x={e.labelAt[0]}
                  y={e.labelAt[1]}
                  textAnchor="middle"
                  fontSize="9.5"
                  className="font-mono"
                  fill={isActive ? "#6ee7b7" : "#a1a1aa"}
                  stroke="#09090b"
                  strokeWidth={5}
                  paintOrder="stroke"
                >
                  → {e.cross.label}
                </text>
              )}
            </g>
          );
        })}

        {/* nodes */}
        {map.nodes.map((n) => {
          const isActive = active.has(n.table);
          const isFocus = focus.has(n.table);
          const rows = rowsOf(n.table);
          return (
            <g
              key={n.table}
              onClick={() => onInsert(n.table)}
              className="cursor-pointer"
              style={
                isActive
                  ? { filter: `drop-shadow(0 0 ${isFocus ? 11 : 7}px rgb(52 211 153 / ${isFocus ? 0.65 : 0.4}))` }
                  : isFocus
                    ? { filter: "drop-shadow(0 0 7px rgb(56 189 248 / 0.45))" }
                    : undefined
              }
            >
              <title>{`insert ${n.table} at your cursor`}</title>
              <rect
                x={n.x}
                y={n.y}
                width={NODE_W}
                height={NODE_H}
                rx={10}
                fill="#0a0a0c"
                stroke={
                  isActive
                    ? "rgb(52 211 153 / 0.75)"
                    : isFocus
                      ? "rgb(56 189 248 / 0.8)"
                      : "rgb(63 63 70)"
                }
                strokeWidth={isFocus ? 2.4 : isActive || isFocus ? 1.6 : 1}
              />
              <text x={n.x + 10} y={n.y + 28} fontSize="15">
                {tableEmoji(n.table)}
              </text>
              <text
                x={n.x + 32}
                y={n.y + 25}
                fontSize="11.5"
                className="font-mono"
                fill={isActive ? "#a7f3d0" : isFocus ? "#bae6fd" : "#e4e4e7"}
              >
                {n.table}
              </text>
              {rows !== undefined && (
                <text
                  x={n.x + NODE_W - 8}
                  y={n.y + 37}
                  fontSize="8.5"
                  textAnchor="end"
                  className="font-mono"
                  fill="#52525b"
                >
                  {rows.toLocaleString()} rows
                </text>
              )}
              {isActive && (
                <circle
                  cx={n.x + NODE_W - 10}
                  cy={n.y + 10}
                  r={3}
                  fill="#34d399"
                  className="pulse-soft"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
              )}
              {!isActive && isFocus && (
                <circle
                  cx={n.x + NODE_W - 10}
                  cy={n.y + 10}
                  r={3}
                  fill="#38bdf8"
                  className="pulse-soft"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function SchemaPanel({
  tables,
  onInsert,
  activeTables = [],
  focusTables = [],
  compact = false,
}: {
  tables: SandboxTable[];
  onInsert: (token: string) => void;
  /** Tables touched by the current query — they glow in the map and cards. */
  activeTables?: string[];
  /** Tables under the clause focus (hover/caret) — sky pulse on the map. */
  focusTables?: string[];
  /** Focus mode — tighter labels, 2-col cards for a narrow side column. */
  compact?: boolean;
}) {
  const [groupId, setGroupId] = useState(GROUPS[0].id);
  const active = new Set(activeTables);
  const focus = new Set(focusTables);
  const group = GROUPS.find((g) => g.id === groupId) ?? GROUPS[0];
  const cards = group.tables
    .map((name) => tables.find((t) => t.name === name))
    .filter((t): t is SandboxTable => t !== undefined);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[11px] text-zinc-500">
          {compact
            ? "the schema — click a table or column to insert it"
            : "the schema — click any table or column to drop it into your query"}
        </p>
        <div className="flex gap-1" role="tablist" aria-label="schema groups">
          {GROUPS.map((g) => {
            const selected = g.id === groupId;
            const hiddenActive = g.tables.filter((t) => active.has(t)).length;
            return (
              <button
                key={g.id}
                role="tab"
                aria-selected={selected}
                onClick={() => setGroupId(g.id)}
                title={
                  !selected && hiddenActive > 0
                    ? `your query touches ${hiddenActive} table${hiddenActive > 1 ? "s" : ""} on this tab`
                    : undefined
                }
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  selected
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                {g.label}
                {!selected && hiddenActive > 0 && (
                  <span
                    aria-hidden
                    title="tables your query touches live on this tab"
                    className="ml-1.5 inline-flex items-center rounded-full bg-emerald-400/15 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300"
                  >
                    ⚡{hiddenActive}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <SchemaMap groupId={groupId} tables={tables} active={active} focus={focus} onInsert={onInsert} />
      {group.tables.every((t) => !active.has(t)) && active.size > 0 && (
        <p className="mt-1.5 font-mono text-[10px] text-zinc-600">
          ⚡ this query reads no tables here — its tables glow on the other tab
        </p>
      )}

      <div className={cn("mt-3 grid gap-2", compact ? "grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-5")}>
        {cards.map((t) => {
          const isActive = active.has(t.name);
          const isFocus = focus.has(t.name);
          return (
            <motion.div
              key={`${groupId}-${t.name}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className={cn(
                "rounded-lg border p-2.5",
                isActive
                  ? "border-emerald-400/50 bg-emerald-500/5"
                  : isFocus
                    ? "border-sky-400/50 bg-sky-500/5"
                    : "border-zinc-800 bg-zinc-950/80",
                isFocus && "ring-1 ring-sky-400/50",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <button
                  onClick={() => onInsert(t.name)}
                  title="insert table name at cursor"
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold transition-colors hover:text-emerald-300"
                >
                  <span aria-hidden className="text-[13px]">
                    {tableEmoji(t.name)}
                  </span>
                  <span className={isActive ? "text-emerald-200" : "text-zinc-100"}>{t.name}</span>
                </button>
                <span className="flex items-center gap-1">
                  <span className="tnum font-mono text-[10px] text-zinc-600">
                    {t.rows.toLocaleString()}
                  </span>
                  {isActive && (
                    <span aria-hidden className="emoji-bob text-[11px]" title="this table is in your query">
                      ⚡
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-2 flex flex-col items-start gap-1">
                {(t.cols ?? []).map((c) => (
                  <button
                    key={c.name}
                    onClick={() => onInsert(c.name)}
                    title={c.fk ? `→ ${c.fk}` : c.pk ? "primary key" : c.type}
                    className="group inline-flex max-w-full items-center gap-1 rounded px-1 py-0.5 font-mono text-[11px] transition-colors hover:bg-emerald-400/10"
                  >
                    <span className="truncate text-zinc-300 group-hover:text-emerald-200">
                      {c.name}
                    </span>
                    {c.pk && <KeyRound className="h-2.5 w-2.5 shrink-0 text-amber-300/80" />}
                    {c.fk && (
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-sky-300/70">
                        <Link2 className="h-2.5 w-2.5" />
                        <span className="text-[10px]">{c.fk.split(".")[0]}</span>
                      </span>
                    )}
                  </button>
                ))}
                {(!t.cols || t.cols.length === 0) && (
                  <span className="font-mono text-[10px] text-zinc-600">loading…</span>
                )}
              </div>
            </motion.div>
          );
        })}
        {cards.length === 0 && (
          <p className="col-span-full py-4 text-center font-mono text-[11px] text-zinc-600">
            🗃️ meeting the tables… run any query and they appear here
          </p>
        )}
      </div>
    </div>
  );
}
