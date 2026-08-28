"use client";

// Interactive entity diagram: every table/CTE/derived table becomes a card
// listing the columns the query selects from it; JOINs become color-coded
// edges labelled with the join type. Nodes are draggable.

import { useCallback, useMemo, useRef, useState, type PointerEvent } from "react";
import { motion } from "framer-motion";
import type { QueryPlan, TableInfo } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

const VIEW_W = 940;
const VIEW_H = 560;
const NODE_W = 200;
const HEADER_H = 40;
const ROW_H = 22;
const PAD_Y = 10;

const KIND_STYLE: Record<
  TableInfo["kind"],
  { stroke: string; headerFill: string; label: string }
> = {
  table: {
    stroke: "#34d399",
    headerFill: "rgba(52,211,153,0.12)",
    label: "table",
  },
  cte: {
    stroke: "#a78bfa",
    headerFill: "rgba(167,139,250,0.12)",
    label: "CTE",
  },
  subquery: {
    stroke: "#fbbf24",
    headerFill: "rgba(251,191,36,0.12)",
    label: "derived",
  },
};

const JOIN_COLORS: Record<string, string> = {
  "INNER JOIN": "#34d399",
  JOIN: "#34d399",
  "LEFT JOIN": "#fbbf24",
  "LEFT OUTER JOIN": "#fbbf24",
  "RIGHT JOIN": "#fb7185",
  "RIGHT OUTER JOIN": "#fb7185",
  "FULL JOIN": "#a78bfa",
  "FULL OUTER JOIN": "#a78bfa",
  "CROSS JOIN": "#2dd4bf",
  "NATURAL JOIN": "#2dd4bf",
};

function joinColor(type: string): string {
  return JOIN_COLORS[type] ?? "#94a3b8";
}

function nodeHeight(t: TableInfo): number {
  const rows = Math.min(t.columns.length || 1, 5);
  return HEADER_H + PAD_Y * 2 + rows * ROW_H;
}

/** cubic bezier point at t=0.5 */
function bezierMid(p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number]): [number, number] {
  const x = (p0[0] + 3 * p1[0] + 3 * p2[0] + p3[0]) / 8;
  const y = (p0[1] + 3 * p1[1] + 3 * p2[1] + p3[1]) / 8;
  return [x, y];
}

export function JoinsView({ plan }: { plan: QueryPlan }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [hovered, setHovered] = useState<string | null>(null);

  // initial layout: 1 → centered, 2 → side by side, 3+ → hub & spoke ellipse
  const layout = useMemo(() => {
    const result: Record<string, { x: number; y: number }> = {};
    const tables = plan.tables;
    if (tables.length === 0) return result;
    const cx = VIEW_W / 2;
    const cy = VIEW_H / 2;
    const centerY = (t: TableInfo) => cy - nodeHeight(t) / 2;

    if (tables.length === 1) {
      result[tables[0].id] = { x: cx - NODE_W / 2, y: cy - 60 };
      return result;
    }

    if (tables.length === 2) {
      const [a, b] = tables;
      const spread = 265;
      result[a.id] = { x: cx - spread - NODE_W / 2, y: centerY(a) };
      result[b.id] = { x: cx + spread - NODE_W / 2, y: centerY(b) };
      return result;
    }

    const others = tables.slice(1);
    const rX = Math.min(350, 185 + others.length * 40);
    const rY = Math.min(205, 120 + others.length * 22);
    result[tables[0].id] = { x: cx - NODE_W / 2, y: cy - nodeHeight(tables[0]) / 2 };
    others.forEach((t, i) => {
      const angle = (i / others.length) * Math.PI * 2 - Math.PI / 2;
      result[t.id] = {
        x: cx + rX * Math.cos(angle) - NODE_W / 2,
        y: cy + rY * Math.sin(angle) - nodeHeight(t) / 2,
      };
    });
    return result;
  }, [plan.tables]);

  const pos = useCallback(
    (t: TableInfo) => positions[t.id] ?? layout[t.id] ?? { x: VIEW_W / 2, y: VIEW_H / 2 },
    [positions, layout],
  );

  const toSvgCoords = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const scaleX = VIEW_W / rect.width;
    const scaleY = VIEW_H / rect.height;
    return {
      x: Math.min(Math.max((clientX - rect.left) * scaleX, 4), VIEW_W - NODE_W - 4),
      y: Math.min(Math.max((clientY - rect.top) * scaleY, 4), VIEW_H - 60),
    };
  }, []);

  const onPointerDown = (e: PointerEvent<SVGGElement>, t: TableInfo) => {
    const p = toSvgCoords(e.clientX, e.clientY);
    const cur = pos(t);
    dragRef.current = { id: t.id, offsetX: p.x - cur.x, offsetY: p.y - cur.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<SVGGElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const p = toSvgCoords(e.clientX, e.clientY);
    setPositions((prev) => ({
      ...prev,
      [drag.id]: { x: p.x - drag.offsetX, y: p.y - drag.offsetY },
    }));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const edges = plan.joins.map((j, i) => {
    const leftTable = plan.tables.find((t) => t.id === j.left);
    const rightTable = plan.tables.find((t) => t.id === j.right);
    if (!leftTable || !rightTable) return null;
    const lp = pos(leftTable);
    const rp = pos(rightTable);
    const x1 = lp.x + NODE_W / 2;
    const y1 = lp.y + nodeHeight(leftTable) / 2;
    const x2 = rp.x + NODE_W / 2;
    const y2 = rp.y + nodeHeight(rightTable) / 2;
    const dx = (x2 - x1) / 2;
    const c1: [number, number] = [x1 + dx, y1];
    const c2: [number, number] = [x2 - dx, y2];
    const path = `M ${x1} ${y1} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${x2} ${y2}`;
    const [mx, my] = bezierMid([x1, y1], c1, c2, [x2, y2]);
    return { id: i, path, mx, my, join: j, color: joinColor(j.type) };
  });

  const isDimmed = (id: string) =>
    hovered !== null &&
    id !== hovered &&
    !plan.joins.some((j) => (j.left === hovered && j.right === id) || (j.right === hovered && j.left === id));

  if (plan.tables.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
        No tables found in this statement.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-400">
        Drag cards to rearrange. Edges show joins with their type; each card lists the
        columns the query selects from that source.
      </p>
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:22px_22px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full touch-none select-none"
          role="img"
          aria-label="Table relationship diagram"
        >
          {/* edges */}
          {edges.map((e) =>
            e ? (
              <g
                key={e.id}
                opacity={hovered === null || hovered === e.join.left || hovered === e.join.right ? 1 : 0.15}
              >
                <path
                  d={e.path}
                  fill="none"
                  stroke={e.color}
                  strokeWidth={hovered === e.join.left || hovered === e.join.right ? 2.4 : 1.4}
                  strokeDasharray={e.join.type.includes("LEFT") || e.join.type.includes("RIGHT") ? "0" : "0"}
                />
                <g transform={`translate(${e.mx}, ${e.my})`}>
                  <rect
                    x={-e.join.type.length * 3.6 - 8}
                    y={-10}
                    width={e.join.type.length * 7.2 + 16}
                    height={20}
                    rx={10}
                    fill="#18181b"
                    stroke={e.color}
                    strokeWidth={1}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={e.color}
                    fontSize={10}
                    fontFamily="var(--font-geist-mono), monospace"
                    fontWeight={600}
                  >
                    {e.join.type}
                  </text>
                </g>
              </g>
            ) : null,
          )}

          {/* nodes */}
          {plan.tables.map((t, i) => {
            const p = pos(t);
            const style = KIND_STYLE[t.kind];
            const h = nodeHeight(t);
            const cols = t.columns.slice(0, 5);
            const more = t.columns.length - cols.length;
            const dim = isDimmed(t.id);
            return (
              <g
                key={t.id}
                transform={`translate(${p.x}, ${p.y})`}
                style={{ cursor: "grab" }}
                onPointerDown={(e) => onPointerDown(e, t)}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerLeave={endDrag}
                onMouseEnter={() => setHovered(t.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: dim ? 0.35 : 1 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                >
                <rect
                  width={NODE_W}
                  height={h}
                  rx={12}
                  fill="#111113"
                  stroke={style.stroke}
                  strokeWidth={1.2}
                  opacity={0.98}
                />
                {/* header */}
                <path
                  d={`M 0 12 A 12 12 0 0 1 12 0 H ${NODE_W - 12} A 12 12 0 0 1 ${NODE_W} 12 V ${HEADER_H} H 0 Z`}
                  fill={style.headerFill}
                />
                <text
                  x={12}
                  y={19}
                  fill="#f4f4f5"
                  fontSize={13}
                  fontWeight={700}
                  fontFamily="var(--font-geist-mono), monospace"
                >
                  {t.name}
                </text>
                {t.alias && (
                  <text
                    x={NODE_W - 12}
                    y={19}
                    textAnchor="end"
                    fill={style.stroke}
                    fontSize={10}
                    fontFamily="var(--font-geist-mono), monospace"
                  >
                    AS {t.alias}
                  </text>
                )}
                {t.joinType && (
                  <g transform={`translate(0, ${HEADER_H})`}>
                    <rect x={0} y={0} width={NODE_W} height={18} fill="rgba(255,255,255,0.03)" />
                    <text
                      x={12}
                      y={13}
                      fill={joinColor(t.joinType)}
                      fontSize={9.5}
                      fontWeight={600}
                      fontFamily="var(--font-geist-mono), monospace"
                    >
                      {t.joinType}
                    </text>
                    {t.kind !== "table" && (
                      <text
                        x={NODE_W - 12}
                        y={13}
                        textAnchor="end"
                        fill={style.stroke}
                        fontSize={9}
                        fontFamily="var(--font-geist-mono), monospace"
                      >
                        {style.label}
                      </text>
                    )}
                  </g>
                )}
                {/* columns */}
                {cols.length > 0 ? (
                  cols.map((c, ci) => (
                    <g key={ci} transform={`translate(12, ${HEADER_H + (t.joinType ? 18 : 0) + PAD_Y + ci * ROW_H + 8})`}>
                      <circle cx={0} cy={-3} r={2} fill={style.stroke} opacity={0.7} />
                      <text
                        x={9}
                        y={0}
                        fill="#d4d4d8"
                        fontSize={10.5}
                        fontFamily="var(--font-geist-mono), monospace"
                      >
                        {c.length > 26 ? `${c.slice(0, 25)}…` : c}
                      </text>
                    </g>
                  ))
                ) : (
                  <text
                    x={12}
                    y={HEADER_H + (t.joinType ? 18 : 0) + PAD_Y + 8}
                    fill="#52525b"
                    fontSize={10.5}
                    fontStyle="italic"
                    fontFamily="var(--font-geist-mono), monospace"
                  >
                    no columns selected
                  </text>
                )}
                {more > 0 && (
                  <text
                    x={12}
                    y={HEADER_H + (t.joinType ? 18 : 0) + PAD_Y + Math.min(cols.length, 5) * ROW_H + 8}
                    fill="#71717a"
                    fontSize={10}
                    fontFamily="var(--font-geist-mono), monospace"
                  >
                    + {more} more
                  </text>
                )}
                </motion.g>
              </g>
            );
          })}
        </svg>
      </div>
      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-[11px] text-zinc-400">
        {(["table", "cte", "subquery"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-[3px] border"
              style={{ borderColor: KIND_STYLE[k].stroke, background: KIND_STYLE[k].headerFill }}
            />
            {KIND_STYLE[k].label}
          </span>
        ))}
        <span className="ml-auto inline-flex flex-wrap items-center gap-2">
          {["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"].map((jt) => (
            <span key={jt} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 rounded-full" style={{ background: joinColor(jt) }} />
              <span className="font-mono">{jt.replace(" JOIN", "")}</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
