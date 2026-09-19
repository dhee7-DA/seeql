"use client";

// RowFunnel — "where did the rows go?"
//
// The single most confusing thing about SQL is that clauses act on different
// row sets. This figure makes it visible with REAL numbers: it re-runs the
// query with clauses progressively stripped (FROM only → +WHERE → +GROUP BY →
// +HAVING), each wrapped in COUNT(*), and draws the shrinking row population
// as a lesson-style strip of dot-fields.
//
// All counts come from the live sample DB — no guessing, no animation tricks.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DotField, fade, drawIn } from "@/components/learn/diagrams-kit";
import { buildStagePlan, type ClauseKind } from "@/lib/sql-clauses";
import type { ExecResponse } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

type Accent = "zinc" | "rose" | "teal" | "orange" | "emerald";

const STAGE_TITLE: Record<string, string> = {
  from: "FROM",
  where: "WHERE",
  group: "GROUP BY",
  having: "HAVING",
};

const PANEL: Record<Accent, string> = {
  zinc: "fill-zinc-900 stroke-zinc-800",
  rose: "fill-rose-500/5 stroke-rose-400/40",
  teal: "fill-teal-500/5 stroke-teal-400/40",
  orange: "fill-orange-500/5 stroke-orange-400/40",
  emerald: "fill-emerald-400/10 stroke-emerald-400/50",
};

const TITLE_CLS: Record<Accent, string> = {
  zinc: "fill-zinc-100",
  rose: "fill-rose-300",
  teal: "fill-teal-300",
  orange: "fill-orange-300",
  emerald: "fill-emerald-300",
};

const NUM_CLS: Record<Accent, string> = {
  zinc: "fill-zinc-200",
  rose: "fill-rose-200",
  teal: "fill-teal-200",
  orange: "fill-orange-200",
  emerald: "fill-emerald-400",
};

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

const STAGE_W = 96;
const STAGE_H = 66;
const GAP = 32;
const PAD_X = 14;

function clip(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export function RowFunnel({
  sql,
  dataVersion,
  finalRows,
  selected,
  onSelectStage,
}: {
  sql: string;
  /** bumped when the sample DB is reset — counts are recomputed even for identical SQL */
  dataVersion?: number;
  /** exec-derived fallback for the OUT count when the final count query is unavailable */
  finalRows?: number;
  /** stage currently opened in the step inspector (ring highlight) */
  selected?: string | null;
  /** click a stage → inspect the actual rows alive at that moment */
  onSelectStage?: (kind: ClauseKind | "out") => void;
}) {
  // stage shapes are pure text surgery — derive them, no state needed
  const plan = useMemo(() => buildStagePlan(sql), [sql]);
  // fetched counts, tagged with the sql they belong to
  const [fetched, setFetched] = useState<{ sql: string; counts: number[] | null } | null>(null);
  const [failedSql, setFailedSql] = useState<string | null>(null);

  useEffect(() => {
    if (!plan) return;
    let cancelled = false;
    // stages + the OUT node — the full query wrapped in COUNT(*), so the
    // figure is fully live and immune to the results payload cap
    const queries = [...plan.stages.map((s) => s.sql), plan.final];
    Promise.all(
      queries.map((q) =>
        fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql: q }),
        })
          .then((r) => r.json() as Promise<ExecResponse>)
          .then((j) => (j.ok && j.rows.length > 0 ? Number(j.rows[0][0]) : Number.NaN)),
      ),
    ).then((counts) => {
      if (cancelled) return;
      if (counts.some((c) => Number.isNaN(c))) {
        setFailedSql(sql); // one stage refused to run — hide the figure
        return;
      }
      setFetched({ sql, counts });
    });
    return () => {
      cancelled = true;
    };
  }, [plan, sql, dataVersion]);

  if (!plan || failedSql === sql) return null;

  const kinds: Array<ClauseKind | "out"> = [...plan.stages.map((s) => s.kind), "out"];
  const loading = fetched?.sql !== sql;
  const countAt = (i: number): number | null => {
    if (loading || !fetched?.counts) return null;
    const v = fetched.counts[i];
    if (v === undefined) return i === kinds.length - 1 ? finalRows ?? null : null;
    return v;
  };
  const nodes = kinds.map((kind, i) => ({ kind, count: countAt(i) }));
  const W = Math.max(nodes.length * STAGE_W + (nodes.length - 1) * GAP + PAD_X * 2, 420);
  const cy = 10 + STAGE_H / 2;
  const maxCount = Math.max(...nodes.map((n) => n.count ?? 0), 1);

  const dotsFor = (count: number | null) =>
    count === null ? 0 : Math.max(count > 0 ? 1 : 0, Math.round((count / maxCount) * 24));

  const accentOf = (kind: ClauseKind | "out"): Accent =>
    kind === "out" ? "emerald" : kind === "where" ? "rose" : kind === "group" ? "teal" : kind === "having" ? "orange" : "zinc";

  // plain-english caption — the lesson-figure voice
  const caption = (() => {
    const parts: string[] = [];
    const fromCount = nodes[0]?.count;
    if (fromCount !== null && fromCount !== undefined) {
      parts.push(
        nodes.length > 2
          ? `${fromCount.toLocaleString()} rows leave the tables`
          : `${fromCount.toLocaleString()} rows — no filters at all`,
      );
    }
    for (const s of nodes.slice(1, -1)) {
      if (s.kind === "where") parts.push(`${s.count} survive WHERE`);
      if (s.kind === "group") parts.push(`GROUP BY folds them into ${s.count} buckets`);
      if (s.kind === "having") parts.push(`HAVING keeps ${s.count}`);
    }
    const out = nodes[nodes.length - 1];
    parts.push(`${(out?.count ?? 0).toLocaleString()} row${out?.count === 1 ? "" : "s"} out`);
    return parts.join(" → ");
  })();

  return (
    <figure className="sheen rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="flex items-center justify-between px-1 pb-1">
        <figcaption className="font-mono text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
          Where did the rows go?
        </figcaption>
        {loading && (
          <span className="font-mono text-[10px] text-zinc-600">counting rows…</span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${W} ${STAGE_H + 22}`}
        className="w-full"
        role="img"
        aria-label="Row funnel — how many rows survive each clause"
        key={sql}
      >
        {nodes.map((node, i) => {
          const x = PAD_X + i * (STAGE_W + GAP);
          const accent = accentOf(node.kind);
          const isOut = node.kind === "out";
          const isGate = node.kind === "where" || node.kind === "having";
          const dots = dotsFor(node.count);
          const prev = nodes[i - 1];
          const dropped =
            prev && prev.count !== null && node.count !== null ? prev.count - node.count : null;
          const isSelected = selected === node.kind;
          const clickable = Boolean(onSelectStage);
          return (
            <motion.g
              key={`${node.kind}-${i}`}
              {...fade(i * 0.09)}
              onClick={clickable ? () => onSelectStage?.(node.kind) : undefined}
              className={clickable ? "cursor-pointer" : undefined}
              role={clickable ? "button" : undefined}
              aria-label={clickable ? `Inspect rows at ${isOut ? "OUT" : STAGE_TITLE[node.kind]}` : undefined}
              tabIndex={clickable ? 0 : undefined}
              onKeyDown={
                clickable
                  ? (ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        onSelectStage?.(node.kind);
                      }
                    }
                  : undefined
              }
            >
              <title>{clickable ? `Click to see the rows at ${isOut ? "OUT" : STAGE_TITLE[node.kind]}` : undefined}</title>
              <rect
                x={x}
                y={10}
                width={STAGE_W}
                height={STAGE_H}
                rx={9}
                strokeWidth={1}
                className={cn(PANEL[accent], clickable && "transition-[filter] hover:brightness-125")}
                strokeDasharray={isGate ? "5 4" : undefined}
              />
              {isSelected && (
                <rect
                  x={x - 3}
                  y={7}
                  width={STAGE_W + 6}
                  height={STAGE_H + 6}
                  rx={11}
                  fill="none"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  className={isOut ? "stroke-emerald-400" : "stroke-zinc-300/70"}
                />
              )}
              <text
                x={x + 9}
                y={26}
                fontSize={10}
                fontWeight={600}
                fontFamily={MONO}
                className={TITLE_CLS[accent]}
              >
                {isOut ? "OUT" : STAGE_TITLE[node.kind]}
              </text>
              {/* proportional dot-field — the shrinking population */}
              {dots > 0 ? (
                <DotField n={dots} cols={12} x0={x + 10} y0={33} gap={6.5} r={2.2} />
              ) : (
                <text x={x + 10} y={41} fontSize={9} fontFamily={MONO} className="fill-zinc-500 italic">
                  {node.count === 0 ? "nothing left" : ""}
                </text>
              )}
              <text
                x={x + STAGE_W - 8}
                y={STAGE_H + 2}
                textAnchor="end"
                fontSize={isOut ? 14 : 12}
                fontWeight={700}
                fontFamily={MONO}
                className={NUM_CLS[accent]}
              >
                {node.count === null ? "…" : node.count.toLocaleString()}
              </text>

              {/* connector + delta */}
              {i > 0 && (
                <>
                  <motion.path
                    {...drawIn(i * 0.09 + 0.12)}
                    d={`M ${x - GAP + 3} ${cy} L ${x - 8} ${cy}`}
                    className="stroke-zinc-600"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    fill="none"
                  />
                  <motion.g
                    {...fade(i * 0.09 + 0.4)}
                    className="stroke-zinc-600"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    fill="none"
                  >
                    <line x1={x - 3} y1={cy} x2={x - 8} y2={cy - 3.2} />
                    <line x1={x - 3} y1={cy} x2={x - 8} y2={cy + 3.2} />
                  </motion.g>
                  {dropped !== null && dropped > 0 && (
                    <>
                      <motion.text
                        {...fade(i * 0.09 + 0.55)}
                        x={x - GAP / 2}
                        y={cy + 12}
                        textAnchor="middle"
                        fontSize={8.5}
                        fontFamily={MONO}
                        className={isOut ? "fill-zinc-500" : "fill-rose-400/80"}
                      >
                        {isOut ? "" : `−${dropped}`}
                      </motion.text>
                      {/* share of the previous stage the gate removed */}
                      {!isOut && prev.count !== null && prev.count > 0 && (
                        <motion.text
                          {...fade(i * 0.09 + 0.65)}
                          x={x - GAP / 2}
                          y={cy + 21}
                          textAnchor="middle"
                          fontSize={7.5}
                          fontFamily={MONO}
                          className="fill-zinc-600"
                        >
                          {`−${Math.round((dropped / prev.count) * 100)}%`}
                        </motion.text>
                      )}
                    </>
                  )}
                </>
              )}
            </motion.g>
          );
        })}
      </svg>
      <p className="mt-1 px-1 font-mono text-[11px] leading-relaxed text-zinc-500">
        {clip(caption, 150)}
        {onSelectStage && (
          <span className="text-zinc-600"> · click a stage to see its rows</span>
        )}
      </p>
    </figure>
  );
}
