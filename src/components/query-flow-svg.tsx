"use client";

// QueryFlowSvg — the lesson-diagram aesthetic applied to the playground.
// A compact, hand-drawn SVG strip of the logical execution order: FROM with
// a real dot-field of source rows, WHERE/HAVING as dashed gates, GROUP BY
// folding, and an emerald OUT node carrying the actual result count.
// Built from the same drawing kit the curriculum figures use, so the
// playground and the lessons speak one visual language.

import { motion } from "framer-motion";
import { DotField, fade, drawIn } from "@/components/learn/diagrams-kit";
import type { QueryPlan } from "@/lib/sql-types";
import type { ClauseKind } from "@/lib/sql-clauses";

type Accent = "zinc" | "violet" | "emerald" | "amber" | "rose" | "teal" | "orange" | "lime";

interface FlowNode {
  key: string;
  title: string;
  note?: string;
  /** real row count for the FROM source (renders a mini dot-field) */
  dots?: number;
  /** WHERE/HAVING — rendered as a dashed filter gate */
  gate?: boolean;
  /** the emerald result node */
  out?: boolean;
  accent: Accent;
}

// Literal class strings so Tailwind can see every variant.
const PANEL: Record<Accent, string> = {
  zinc: "fill-zinc-900 stroke-zinc-800",
  violet: "fill-violet-500/5 stroke-violet-400/40",
  emerald: "fill-emerald-400/10 stroke-emerald-400/50",
  amber: "fill-amber-500/5 stroke-amber-400/40",
  rose: "fill-rose-500/5 stroke-rose-400/40",
  teal: "fill-teal-500/5 stroke-teal-400/40",
  orange: "fill-orange-500/5 stroke-orange-400/40",
  lime: "fill-lime-500/5 stroke-lime-400/40",
};

const TITLE_CLS: Record<Accent, string> = {
  zinc: "fill-zinc-100",
  violet: "fill-violet-300",
  emerald: "fill-emerald-300",
  amber: "fill-amber-300",
  rose: "fill-rose-300",
  teal: "fill-teal-300",
  orange: "fill-orange-300",
  lime: "fill-lime-300",
};

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

const NODE_W = 124;
const NODE_H = 52;
const ROW_GAP = 34;
const PER_ROW = 4;
const XS = [10, 175, 340, 505];

function clip(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** Plain-English caption under the strip — the lesson-figure voice. */
const CAPTION_PHRASE: Record<string, string> = {
  with: "materialize the CTEs",
  from: "load the source rows",
  join: "attach matching rows",
  where: "drop rows that don't qualify",
  group: "fold into buckets",
  having: "keep qualifying buckets",
  select: "project the output columns",
  top: "sort and trim",
  out: "result",
};

/** which clause each flow node corresponds to — the text ↔ diagram bridge */
function nodeClause(node: FlowNode, plan: QueryPlan): ClauseKind | null {
  switch (node.key) {
    case "with": return "with";
    case "from":
    case "join": return "from";
    case "where": return "where";
    case "group": return "group";
    case "having": return "having";
    case "select": return "select";
    case "top": return plan.orderBy.length > 0 ? "order" : "limit";
    default: return null;
  }
}

export function QueryFlowSvg({
  plan,
  resultRows,
  tableCounts,
  activeKinds,
  onKindHover,
  onKindClick,
}: {
  plan: QueryPlan;
  /** actual rows the run produced — powers the OUT node */
  resultRows?: number;
  /** live row counts per table (/api/stats) — powers the FROM dot-field */
  tableCounts?: Record<string, number> | null;
  /** clause kinds to glow (the editor caret is inside them) */
  activeKinds?: ClauseKind[] | null;
  /** hovering a node → highlight its SQL in the editor */
  onKindHover?: (kind: ClauseKind | null) => void;
  /** clicking a node → pin the highlight in the editor */
  onKindClick?: (kind: ClauseKind) => void;
}) {
  const nodes: FlowNode[] = [];

  if (plan.ctes.length > 0) {
    nodes.push({
      key: "with",
      title: "WITH",
      note: clip(plan.ctes.map((c) => c.name).join(", "), 17),
      accent: "violet",
    });
  }

  const main = plan.tables[0];
  const mainName = main ? main.alias ?? main.name : "table";
  const mainCount = main ? tableCounts?.[main.name] : undefined;
  nodes.push({
    key: "from",
    title: clip(`FROM ${mainName}`, 13),
    dots: mainCount,
    accent: "zinc",
  });

  if (plan.joins.length > 0) {
    nodes.push({
      key: "join",
      title: "JOIN",
      note:
        plan.joins.length === 1
          ? clip(`${plan.joins[0].type.toLowerCase()} …`, 17)
          : plural(plan.joins.length, "join"),
      accent: "amber",
    });
  }

  if (plan.where.length > 0) {
    nodes.push({
      key: "where",
      title: "WHERE",
      note: plural(plan.where.length, "condition"),
      gate: true,
      accent: "rose",
    });
  }

  if (plan.groupBy.length > 0) {
    nodes.push({
      key: "group",
      title: "GROUP BY",
      note: clip(`by ${plan.groupBy.join(", ")}`, 17),
      accent: "teal",
    });
  }

  if (plan.having.length > 0) {
    nodes.push({
      key: "having",
      title: "HAVING",
      note: clip(plan.having.join(" "), 17),
      gate: true,
      accent: "orange",
    });
  }

  nodes.push({
    key: "select",
    title: "SELECT",
    note: plan.distinct
      ? `distinct · ${plural(plan.columns.length, "col")}`
      : plural(plan.columns.length, "column"),
    accent: "lime",
  });

  const hasLimit = plan.limit !== null || plan.offset !== null;
  if (plan.orderBy.length > 0 || hasLimit) {
    const orderBit = plan.orderBy[0]
      ? clip(`${plan.orderBy[0].text}${plan.orderBy[0].direction ? ` ${plan.orderBy[0].direction}` : ""}`, 12)
      : null;
    const limitBit = plan.limit !== null ? `top ${plan.limit}` : null;
    nodes.push({
      key: "top",
      title: plan.orderBy.length > 0 ? "ORDER BY" : "LIMIT",
      note: [orderBit, limitBit].filter(Boolean).join(" · ") || undefined,
      accent: "zinc",
    });
  }

  const rowsLabel = resultRows === undefined ? "result" : plural(resultRows, "row");
  nodes.push({ key: "out", title: "OUT", note: rowsLabel, out: true, accent: "emerald" });

  // chunk into rows of PER_ROW
  const rows: FlowNode[][] = [];
  for (let i = 0; i < nodes.length; i += PER_ROW) rows.push(nodes.slice(i, i + PER_ROW));
  const rowY = (r: number) => 14 + r * (NODE_H + ROW_GAP);
  const H = rows.length * NODE_H + (rows.length - 1) * ROW_GAP + 28;

  const caption = nodes.map((n) => CAPTION_PHRASE[n.key] ?? n.title.toLowerCase()).join(" → ");

  return (
    <figure className="sheen rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
      <svg
        viewBox={`0 0 640 ${H}`}
        className="w-full"
        role="img"
        aria-label="Query flow — the order SQLite actually runs this query"
        onMouseLeave={() => onKindHover?.(null)}
      >
        {rows.map((row, r) => {
          const y = rowY(r);
          const cy = y + NODE_H / 2;
          return (
            <g key={r}>
              {row.map((node, i) => {
                const x = XS[i];
                const isFrom = node.key === "from";
                const kind = nodeClause(node, plan);
                const lit =
                  !!kind &&
                  !!activeKinds &&
                  (activeKinds.includes(kind) ||
                    (kind === "order" && activeKinds.includes("limit")) ||
                    (kind === "limit" && activeKinds.includes("order")));
                return (
                  <motion.g
                    key={node.key}
                    {...fade(i * 0.07 + r * 0.1)}
                    className={kind ? "cursor-pointer" : undefined}
                    onMouseEnter={kind ? () => onKindHover?.(kind) : undefined}
                    onMouseLeave={kind ? () => onKindHover?.(null) : undefined}
                    onClick={kind ? () => onKindClick?.(kind) : undefined}
                  >
                    {lit && (
                      <rect
                        x={x - 3}
                        y={y - 3}
                        width={NODE_W + 6}
                        height={NODE_H + 6}
                        rx={10}
                        fill="none"
                        strokeWidth={1.5}
                        className="stroke-emerald-400/80"
                      />
                    )}
                    <rect
                      x={x}
                      y={y}
                      width={NODE_W}
                      height={NODE_H}
                      rx={8}
                      strokeWidth={lit ? 1.5 : 1}
                      className={lit ? "fill-emerald-400/10 stroke-emerald-400/60" : PANEL[node.accent]}
                      strokeDasharray={node.gate ? "5 4" : undefined}
                    />
                    <text
                      x={x + 10}
                      y={y + 17}
                      fontSize={11}
                      fontWeight={600}
                      fontFamily={MONO}
                      className={node.out ? TITLE_CLS.emerald : TITLE_CLS[node.accent]}
                    >
                      {node.title}
                    </text>
                    {isFrom && node.dots !== undefined ? (
                      <>
                        <DotField
                          n={Math.min(node.dots, 20)}
                          cols={10}
                          x0={x + 12}
                          y0={y + 30}
                          gap={11}
                          r={3}
                        />
                        <text x={x + NODE_W - 8} y={y + 44} textAnchor="end" fontSize={9} fontFamily={MONO} className="fill-zinc-500">
                          {node.dots.toLocaleString()} rows
                        </text>
                      </>
                    ) : (
                      <text
                        x={x + 10}
                        y={y + 36}
                        fontSize={9.5}
                        fontFamily={MONO}
                        className={node.out ? "fill-emerald-300/90" : "fill-zinc-500"}
                        fontWeight={node.out ? 700 : 400}
                      >
                        {node.note ?? (isFrom ? "rows flow in" : "")}
                      </text>
                    )}
                  </motion.g>
                );
              })}

              {/* straight arrows within the row */}
              {row.slice(0, -1).map((node, i) => (
                <motion.path
                  key={`a-${node.key}`}
                  {...drawIn(i * 0.07 + r * 0.1 + 0.15)}
                  d={`M ${XS[i] + NODE_W + 2} ${cy} L ${XS[i + 1] - 7} ${cy}`}
                  className="stroke-zinc-600"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  fill="none"
                />
              ))}
              {row.slice(0, -1).map((node, i) => (
                <motion.g
                  key={`h-${node.key}`}
                  {...fade(i * 0.07 + r * 0.1 + 0.5)}
                  className="stroke-zinc-600"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  fill="none"
                >
                  <line x1={XS[i + 1] - 2} y1={cy} x2={XS[i + 1] - 7} y2={cy - 3.2} />
                  <line x1={XS[i + 1] - 2} y1={cy} x2={XS[i + 1] - 7} y2={cy + 3.2} />
                </motion.g>
              ))}

              {/* circuit-route wrap arrow into the next row */}
              {r < rows.length - 1 && (
                <WrapArrow
                  fromX={XS[row.length - 1] + NODE_W / 2}
                  fromY={y + NODE_H}
                  toX={XS[0] + NODE_W / 2}
                  toY={rowY(r + 1)}
                  midY={y + NODE_H + ROW_GAP / 2}
                />
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1.5 px-1 font-mono text-[11px] leading-relaxed text-zinc-500">
        {caption}
      </figcaption>
    </figure>
  );
}

/** Down → across → down into the TOP of the next row's first node (rounded
 * pipe). Both vertical legs stay inside the viewBox — the previous left-edge
 * entry routed at x = toX − 14 = −6 and was clipped off-canvas. */
function WrapArrow({
  fromX,
  fromY,
  toX,
  toY,
  midY,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  midY: number;
}) {
  const d = [
    `M ${fromX} ${fromY}`,
    `L ${fromX} ${midY - 8} Q ${fromX} ${midY}, ${fromX - 8} ${midY}`,
    `L ${toX + 8} ${midY} Q ${toX} ${midY}, ${toX} ${midY + 8}`,
    `L ${toX} ${toY - 6}`,
  ].join(" ");
  return (
    <g>
      <motion.path
        {...drawIn(0.35)}
        d={d}
        className="stroke-zinc-600"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      <motion.g {...fade(0.75)} className="stroke-zinc-600" strokeWidth={1.5} strokeLinecap="round" fill="none">
        <line x1={toX} y1={toY - 1} x2={toX - 3.2} y2={toY - 6} />
        <line x1={toX} y1={toY - 1} x2={toX + 3.2} y2={toY - 6} />
      </motion.g>
    </g>
  );
}
