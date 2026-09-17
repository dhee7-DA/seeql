"use client";

// Hero query-flow figure — the lesson-diagram aesthetic, live. Draws the
// logical execution flow of the query the visitor actually ran as a compact
// SVG: real animated arrows (Link/Pipe from diagrams-kit), dot-field rows
// inside table panels, dashed "gate" panels for filters, an emerald OUT node,
// and a circuit-route arrow when the pipeline wraps to a second line.
// Same drawing kit as the curriculum figures, so everything stays cohesive.

import { motion } from "framer-motion";
import { Link, Panel, Pipe, Label, DotField, fade } from "@/components/learn/diagrams-kit";
import type { QueryPlan } from "@/lib/sql-types";

export interface FlowNode {
  kind: "table" | "step" | "out";
  label: string;
  detail: string;
}

/* ---------------- flow builders (shared by hero + playground) ---------------- */

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Logical-execution flow parsed from the query that ran:
 * WITH/FROM/JOINs -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER -> LIMIT -> OUT.
 */
export function flowFromPlan(plan: QueryPlan, sql: string, rows: number): FlowNode[] {
  const nodes: FlowNode[] = [];
  if (plan.ctes.length > 0) {
    nodes.push({ kind: "step", label: "WITH", detail: plan.ctes.map((c) => c.name).join(", ") });
  }
  const base = plan.tables.find((t) => t.kind === "table" && t.joinType === null) ?? plan.tables[0];
  const fromName =
    base?.name ?? sql.match(/\bFROM\s+([A-Za-z_][A-Za-z0-9_]*)/i)?.[1] ?? "?";
  nodes.push({ kind: "table", label: "FROM", detail: fromName });
  for (const t of plan.tables) {
    if (t === base) continue;
    if (t.joinType === null && t.kind === "cte") continue; // CTE refs already shown by WITH
    nodes.push({ kind: "table", label: t.joinType ?? "JOIN", detail: t.name });
  }
  if (plan.where.length > 0) {
    nodes.push({ kind: "step", label: "WHERE", detail: plural(plan.where.length, "condition") });
  }
  if (plan.groupBy.length > 0) {
    nodes.push({ kind: "step", label: "GROUP BY", detail: plural(plan.groupBy.length, "key") });
  }
  if (plan.having.length > 0) {
    nodes.push({ kind: "step", label: "HAVING", detail: plural(plan.having.length, "gate") });
  }
  if (plan.distinct) nodes.push({ kind: "step", label: "DISTINCT", detail: "dedupe" });
  nodes.push({
    kind: "step",
    label: "SELECT",
    detail: plan.columns.some((c) => c.isStar) ? "all columns" : plural(plan.columns.length, "column"),
  });
  if (plan.orderBy.length > 0) {
    const o = plan.orderBy[0];
    nodes.push({ kind: "step", label: "ORDER BY", detail: `${o.text}${o.direction ? ` ${o.direction}` : ""}`.slice(0, 24) });
  }
  if (plan.limit !== null) nodes.push({ kind: "step", label: "LIMIT", detail: String(plan.limit) });
  nodes.push({ kind: "out", label: "OUT", detail: plural(rows, "row") });
  return nodes;
}

/** Keyword readback from regex — fallback when the parser can't handle a query. */
function pipelineChips(sql: string): string[] {
  const chips: string[] = [];
  const from = sql.match(/\bFROM\s+([A-Za-z_][A-Za-z0-9_]*)/i);
  chips.push(from ? `FROM ${from[1]}` : "FROM");
  const joins = sql.match(/\b(?:INNER\s+|LEFT\s+|RIGHT\s+|FULL\s+|CROSS\s+)?JOIN\b/gi);
  if (joins) chips.push(joins.length === 1 ? "JOIN" : `JOIN ×${joins.length}`);
  if (/\bWHERE\b/i.test(sql)) chips.push("WHERE");
  if (/\bGROUP\s+BY\b/i.test(sql)) chips.push("GROUP BY");
  if (/\bHAVING\b/i.test(sql)) chips.push("HAVING");
  chips.push("SELECT");
  if (/\bORDER\s+BY\b/i.test(sql)) chips.push("ORDER BY");
  if (/\bLIMIT\b/i.test(sql)) chips.push("LIMIT");
  return chips;
}

/** Fallback when the parser cannot handle a query — keyword chips from regex. */
export function fallbackFlow(sql: string, rows: number): FlowNode[] {
  return [
    ...pipelineChips(sql).map((label) => ({ kind: "step" as const, label, detail: "" })),
    { kind: "out" as const, label: "OUT", detail: plural(rows, "row") },
  ];
}

/* ---------------- layout ---------------- */

const PAD = 14;
const VIEW_W = 640;
const RIGHT = VIEW_W - PAD;
const NODE_H = 34;
const ROW_H = 52;

const trunc = (s: string, n = 16) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function nodeLines(n: FlowNode): { top: string | null; main: string } {
  if (n.detail) return { top: n.label, main: trunc(n.detail) };
  return { top: null, main: n.label };
}

function nodeWidth(n: FlowNode): number {
  const { top, main } = nodeLines(n);
  const w = Math.max(main.length * 7.0 + 18, top ? top.length * 4.7 + 12 : 0);
  return Math.max(46, Math.ceil(w) + (n.kind === "table" ? 20 : 0));
}

interface Placed {
  node: FlowNode;
  x: number;
  y: number;
  w: number;
}

type ArrowSpec =
  | { kind: "straight"; x1: number; y1: number; x2: number; y2: number; emerald?: boolean }
  | { kind: "route"; pts: Array<[number, number]> }
  | null;

function layout(flow: FlowNode[]) {
  const placed: Placed[] = [];
  const arrows: ArrowSpec[] = [];
  let x = PAD;
  let y = PAD;
  flow.forEach((node, i) => {
    const w = nodeWidth(node);
    if (i > 0 && x + w > RIGHT) {
      // wrap — circuit route out of the previous node, down into this one's top edge
      const prev = placed[i - 1];
      const startX = Math.min(prev.x + prev.w + 4, VIEW_W - 4);
      const midY = prev.y + NODE_H + 9;
      arrows.push({
        kind: "route",
        pts: [
          [startX, prev.y + NODE_H / 2],
          [startX, midY],
          [x + w / 2, midY],
          [x + w / 2, y - 7],
        ],
      });
      y += ROW_H;
      x = PAD;
    } else if (i > 0) {
      const prev = placed[i - 1];
      arrows.push({
        kind: "straight",
        x1: prev.x + prev.w + 3.5,
        y1: prev.y + NODE_H / 2,
        x2: x - 3.5,
        y2: y + NODE_H / 2,
        emerald: node.kind === "out",
      });
    }
    placed.push({ node, x, y, w });
    x += w + 16;
  });
  return { placed, arrows, height: y + NODE_H + PAD };
}

/* ---------------- plain-english caption (the "explanation callout") ---------------- */

const PHRASES: Array<[RegExp, (n: FlowNode) => string]> = [
  [/^WITH$/, (n) => `stages ${n.detail}`],
  [/^(FROM)$/, (n) => `from ${n.detail}`],
  [/JOIN$/, (n) => `merged with ${n.detail}`],
  [/^WHERE$/, () => "keeps only what passes the gate"],
  [/^HAVING$/, () => "filters the surviving groups"],
  [/^GROUP BY$/, (n) => (n.detail === "1 key" ? "folds into one row per key" : `folds into one row per ${n.detail}`)],
  [/^DISTINCT$/, () => "removes duplicates"],
  [/^SELECT$/, (n) => `projects ${n.detail}`],
  [/^ORDER BY$/, (n) => `sorts by ${n.detail}`],
  [/^LIMIT$/, (n) => `first ${n.detail} rows`],
];

export function flowCaption(nodes: FlowNode[]): string {
  const parts: string[] = [];
  for (const n of nodes) {
    if (n.kind === "out") continue;
    const hit = PHRASES.find(([re]) => re.test(n.label));
    if (hit) parts.push(hit[1](n));
    else if (n.detail) parts.push(`${n.label.toLowerCase()} ${n.detail}`);
    else parts.push(n.label.toLowerCase());
  }
  const s = parts.join(" → ");
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

/* ---------------- figure ---------------- */

export function QueryFlowSvg({ flow, tick }: { flow: FlowNode[]; tick: number }) {
  if (flow.length === 0) return null;
  const { placed, arrows, height } = layout(flow);
  return (
    <svg
      key={tick}
      viewBox={`0 0 ${VIEW_W} ${height}`}
      className="w-full"
      role="img"
      aria-label="Logical execution flow of the query that ran"
    >
      {arrows.map((a, i) =>
        a === null ? null : a.kind === "straight" ? (
          <Link
            key={`a-${tick}-${i}`}
            x1={a.x1}
            y1={a.y1}
            x2={a.x2}
            y2={a.y2}
            cls={a.emerald ? "stroke-emerald-400/50" : "stroke-zinc-600"}
            delay={i * 0.07 + 0.12}
          />
        ) : (
          <Pipe
            key={`a-${tick}-${i}`}
            pts={a.pts}
            cls="stroke-zinc-600"
            r={9}
            arrowAng={Math.PI / 2}
            delay={i * 0.07 + 0.12}
          />
        ),
      )}
      {placed.map((p, i) => {
        const { top, main } = nodeLines(p.node);
        const gate = p.node.kind === "step" && (p.node.label === "WHERE" || p.node.label === "HAVING");
        const out = p.node.kind === "out";
        const panelCls = out
          ? "fill-emerald-400/10 stroke-emerald-400/50"
          : p.node.kind === "table"
            ? "fill-zinc-900 stroke-zinc-700"
            : "fill-zinc-900/80 stroke-zinc-800";
        return (
          <MotionGroup key={`n-${tick}-${i}`} delay={i * 0.07}>
            <Panel x={p.x} y={p.y} w={p.w} h={NODE_H} cls={panelCls} dash={gate ? "3 2.5" : undefined} />
            {top && (
              <Label x={p.x + 9} y={p.y + 12.5} cls={out ? "fill-emerald-300/70" : "fill-zinc-500"} size={7.5}>
                {top}
              </Label>
            )}
            <Label
              x={p.x + 9}
              y={p.y + (top ? 26.5 : NODE_H / 2 + 4)}
              cls={out ? "fill-emerald-200" : p.node.kind === "table" ? "fill-zinc-100" : "fill-zinc-300"}
              size={11}
            >
              {main}
            </Label>
            {p.node.kind === "table" && (
              <DotField n={8} cols={4} x0={p.x + p.w - 26} y0={p.y + 11} gap={5.5} r={1.7} />
            )}
          </MotionGroup>
        );
      })}
    </svg>
  );
}

/** fade-in wrapper — kit's fade() preset spread onto a motion.g. */
function MotionGroup({ children, delay }: { children: React.ReactNode; delay: number }) {
  return <motion.g {...fade(delay)}>{children}</motion.g>;
}
