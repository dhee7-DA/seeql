"use client";

// Query playback — the "watch your data move" strip. Every successful run
// renders the query's life as a row of stage frames: real sampled rows ride
// through as identity chips (the API picks name/city/status columns per
// stage, buckets show their key + size), hollow dots fall away as rows are
// filtered, WHERE survivors carry a ✓, animated SVG arrows carry the
// measured deltas, and the result frame pops confetti. Replay + speed
// controls re-run the animation; hovering a frame (or moving the caret in
// the editor) glows the matching clause everywhere.

import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ClauseId } from "@/components/sql-editor";
import {
  ConfettiBurst,
  FlowArrow,
  PopEmoji,
  tableEmoji,
} from "@/components/landing/sandbox-graphics";

interface Stage {
  id: "base" | "where" | "group" | "having";
  rows: number;
}

interface SandboxSource {
  name: string;
  rows: number;
}

export interface SampleRows {
  columns: string[];
  rows: unknown[][];
}

export type StageSamples = Partial<Record<Stage["id"], SampleRows>>;

interface PlaybackProps {
  stages: Stage[];
  sources: SandboxSource[];
  columns: string[];
  rowCount: number;
  durationMs?: number;
  /** Increments per successful run — remounts the strip so it replays. */
  runId: number;
  samples?: StageSamples;
  /** First rows of the result — the result frame's cast. */
  resultRows?: unknown[][];
  /** Clause focused from outside (hover elsewhere / caret in editor). */
  focusClause?: ClauseId | null;
  /** Hovering a frame announces the clause upward. */
  onFocusClause?: (clause: ClauseId | null) => void;
  /** Focus mode — tighter frames, sampled-row casts hidden except the result. */
  compact?: boolean;
}

const MAX_DOTS = 36;
const MAX_LOST = 12;
const SPEEDS = [0.5, 1, 2] as const;

const STAGE_META: Record<
  Stage["id"],
  { label: string; suffix: string; emoji: string; hint: string }
> = {
  base: {
    label: "FROM + JOINs",
    suffix: "rows matched",
    emoji: "📦",
    hint: "every row your FROM + JOINs line up — nothing filtered yet, this is the raw pool",
  },
  where: {
    label: "WHERE",
    suffix: "rows survive",
    emoji: "🔍",
    hint: "rows that pass your condition stay; the hollow dots fell out right here",
  },
  group: {
    label: "GROUP BY",
    suffix: "buckets",
    emoji: "🗂️",
    hint: "surviving rows are folded into buckets — one per unique key, so the count collapses",
  },
  having: {
    label: "HAVING",
    suffix: "buckets pass",
    emoji: "🚦",
    hint: "a group-level filter — whole buckets are kept or dropped by their COUNT/SUM",
  },
};

const RESULT_HINT = "what SQLite hands back — the final rows, columns and numbers";

const CLAUSE_OF_STAGE: Record<Stage["id"], ClauseId> = {
  base: "base",
  where: "where",
  group: "group",
  having: "having",
};

function fmt(v: unknown): string {
  if (v === null) return "NULL";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.?0+$/, "");
  return String(v);
}

/**
 * The cast — real sampled rows as identity chips. `knownSet` marks rows that
 * already appeared at the previous stage (the ✓ survivors).
 */
function RowCast({
  sample,
  tone,
  f,
  knownSet,
}: {
  sample?: SampleRows;
  tone: "zinc" | "sky" | "emerald";
  f: number;
  knownSet?: Set<string>;
}) {
  if (!sample || sample.rows.length === 0) return null;
  const shown = sample.rows.slice(0, 3);
  // Bucket samples (GROUP BY keys + COUNT) read "key × size".
  const isBucket = sample.columns[sample.columns.length - 1] === "bucket_rows";
  const chipCls =
    tone === "emerald"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100/90"
      : tone === "sky"
        ? "border-sky-400/30 bg-sky-400/10 text-sky-100/90"
        : "border-zinc-700/70 bg-zinc-900/80 text-zinc-300";
  return (
    <div className="mt-1.5 flex flex-col gap-1">
      {shown.map((r, i) => {
        const key = JSON.stringify(r);
        const survived = knownSet?.has(key) ?? false;
        const label = isBucket
          ? `${fmt(r[0])} × ${fmt(r[r.length - 1])}`
          : r.slice(0, 3).map(fmt).join(" · ");
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -7 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (0.35 + i * 0.09) * f, duration: 0.25 * f }}
            className={cn(
              "flex items-center gap-1 truncate rounded border px-1.5 py-0.5 font-mono text-[10px] leading-4",
              chipCls,
            )}
            title={sample.columns.map((c, j) => `${c}: ${fmt(r[j])}`).join(" · ")}
          >
            {survived && (
              <span aria-hidden className="shrink-0 text-emerald-300" title="this row made it through">
                ✓
              </span>
            )}
            <span className="truncate">{label}</span>
          </motion.div>
        );
      })}
      {sample.rows.length > 3 && (
        <span className="font-mono text-[9px] text-zinc-600">
          +{sample.rows.length - 3} more sampled
        </span>
      )}
    </div>
  );
}

function DotField({
  count,
  prev,
  tone = "zinc",
  f,
}: {
  count: number;
  prev?: number;
  tone?: "zinc" | "emerald";
  f: number;
}) {
  const dots = Math.max(1, Math.min(count, MAX_DOTS));
  const prevDots = prev !== undefined ? Math.max(1, Math.min(prev, MAX_DOTS)) : dots;
  const lost = Math.max(0, Math.min(prevDots - dots, MAX_LOST));
  return (
    <div className="flex min-h-8 flex-wrap content-center gap-[3px] overflow-hidden">
      {Array.from({ length: lost }, (_, i) => (
        <motion.span
          key={`lost-${i}`}
          initial={{ opacity: 0.8, y: 0 }}
          animate={{ opacity: 0.16, y: 6 }}
          transition={{ delay: 0.32 * f + i * 0.03 * f, duration: 0.5 * f }}
          className="h-[5px] w-[5px] rounded-[1px] border border-zinc-600"
        />
      ))}
      {Array.from({ length: dots }, (_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 * f + i * 0.012 * f, duration: 0.18 * f }}
          className={
            tone === "emerald"
              ? "h-[5px] w-[5px] rounded-[1px] bg-emerald-400/80"
              : "h-[5px] w-[5px] rounded-[1px] bg-zinc-500"
          }
        />
      ))}
    </div>
  );
}

function Frame({
  id,
  label,
  emoji,
  count,
  suffix,
  children,
  accent = false,
  index,
  prev,
  f,
  focused,
  onHover,
  hint,
  compact = false,
}: {
  id: ClauseId;
  label: string;
  emoji: string;
  count?: string;
  suffix?: string;
  children?: React.ReactNode;
  accent?: boolean;
  index: number;
  prev?: number;
  f: number;
  focused: boolean;
  onHover?: (clause: ClauseId | null) => void;
  /** Plain-words explanation of this stage — tooltip always, subtitle when focused. */
  hint?: string;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.16 * f, duration: 0.3 * f }}
      onMouseEnter={() => onHover?.(id)}
      onMouseLeave={() => onHover?.(null)}
      title={hint}
      className={cn(
        "relative min-w-[130px] flex-1 rounded-lg border transition-shadow",
        compact ? "p-2" : "p-2.5",
        accent ? "border-emerald-400/40 bg-emerald-400/5" : "border-zinc-800 bg-zinc-950",
        focused && (accent ? "ring-1 ring-emerald-300/70" : "ring-1 ring-sky-400/70"),
      )}
    >
      {accent && <ConfettiBurst f={f} />}
      <div className="flex items-center justify-between gap-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
        <PopEmoji
          emoji={emoji}
          delay={index * 0.16 * f + 0.2 * f}
          className={accent ? "text-sm emoji-bob" : "text-sm"}
        />
      </div>
      {/* the teaching layer — surfaces when the stage is focused (hover/caret) */}
      {focused && hint && (
        <p
          className={cn(
            "mt-1 font-mono text-[9px] leading-3.5",
            accent ? "text-emerald-300/80" : "text-sky-300/80",
          )}
        >
          {hint}
        </p>
      )}
      {children}
      {count !== undefined && (
        <p className="mt-1 flex items-baseline gap-1.5">
          <span
            className={cn(
              "tnum font-display font-semibold",
              compact ? "text-sm" : "text-lg",
              accent ? "text-emerald-300" : "text-zinc-100",
            )}
          >
            {count}
          </span>
          {suffix && (
            <span className="text-[10px] text-zinc-600">
              {count === "0" ? "nothing left 🫙" : suffix}
            </span>
          )}
        </p>
      )}
    </motion.div>
  );
}

export function QueryPlayback({
  stages,
  sources,
  columns,
  rowCount,
  durationMs,
  runId,
  samples,
  resultRows,
  focusClause,
  onFocusClause,
  compact = false,
}: PlaybackProps) {
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [replayKey, setReplayKey] = useState(0);
  const f = 1 / speed;

  const byId = new Map(stages.map((s) => [s.id, s]));
  const base = byId.get("base");
  const where = byId.get("where");
  const group = byId.get("group");
  const having = byId.get("having");

  // WHERE survivors: base rows seen at the previous stage (same shape).
  const survivorSet =
    samples?.base && samples.where && samples.base.columns.join() === samples.where.columns.join()
      ? new Set(samples.base.rows.map((r) => JSON.stringify(r)))
      : undefined;

  const delta = (a?: Stage, b?: Stage) =>
    a && b && a.rows !== b.rows ? `−${(a.rows - b.rows).toLocaleString()}` : undefined;

  let i = 0;
  const frames: ReactNode[] = [];

  // sources + joined pool
  frames.push(
    <Frame
      key="base"
      id="base"
      index={i}
      f={f}
      focused={focusClause === "base"}
      onHover={onFocusClause}
      label={base ? STAGE_META.base.label : "reads from"}
      emoji="📦"
      count={base ? base.rows.toLocaleString() : undefined}
      suffix={base ? STAGE_META.base.suffix : undefined}
      hint={STAGE_META.base.hint}
      compact={compact}
    >
      <div className="mt-1 flex flex-wrap gap-1">
        {sources.length > 0 ? (
          sources.map((s) => (
            <span
              key={s.name}
              className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900/70 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
            >
              <span aria-hidden>{tableEmoji(s.name)}</span>
              {s.name} <span className="tnum text-zinc-600">{s.rows.toLocaleString()}</span>
            </span>
          ))
        ) : (
          <span className="font-mono text-[10px] text-zinc-600">🗃️ your tables</span>
        )}
      </div>
      {base && (
        <div className="mt-1.5">
          <DotField count={base.rows} f={f} />
        </div>
      )}
      {!compact && <RowCast sample={samples?.base} tone="zinc" f={f} />}
    </Frame>,
  );
  i += 1;

  const stageFrames: Array<{ s: Stage; deltaFrom?: Stage }> = [];
  if (where) stageFrames.push({ s: where, deltaFrom: base });
  if (group) stageFrames.push({ s: group, deltaFrom: where ?? base });
  if (having) stageFrames.push({ s: having, deltaFrom: group });

  for (const { s, deltaFrom } of stageFrames) {
    const meta = STAGE_META[s.id];
    frames.push(
      <FlowArrow
        key={`a-${s.id}`}
        delta={delta(deltaFrom, s)}
        index={i}
        f={f}
        tone={s.id === "having" ? "emerald" : "zinc"}
      />,
    );
    frames.push(
      <Frame
        key={s.id}
        id={CLAUSE_OF_STAGE[s.id]}
        index={i}
        f={f}
        focused={focusClause === CLAUSE_OF_STAGE[s.id]}
        onHover={onFocusClause}
        label={meta.label}
        emoji={meta.emoji}
        count={s.rows.toLocaleString()}
        suffix={meta.suffix}
        prev={deltaFrom?.rows}
        hint={meta.hint}
        compact={compact}
      >
        <div className="mt-1.5">
          <DotField
            count={s.rows}
            prev={deltaFrom?.rows}
            tone={s.id === "having" ? "emerald" : "zinc"}
            f={f}
          />
        </div>
        {!compact && (
          <RowCast
            sample={samples?.[s.id]}
            tone={s.id === "having" ? "emerald" : s.id === "group" ? "sky" : "zinc"}
            f={f}
            knownSet={s.id === "where" ? survivorSet : undefined}
          />
        )}
      </Frame>,
    );
    i += 1;
  }

  // result frame — the celebration
  frames.push(
    <FlowArrow
      key="a-result"
      delta={durationMs !== undefined ? `${durationMs} ms` : undefined}
      tone="emerald"
      index={i}
      f={f}
    />,
  );
  frames.push(
    <Frame
      key="result"
      id="result"
      index={i}
      f={f}
      focused={focusClause === "result"}
      onHover={onFocusClause}
      label="result"
      emoji="🎉"
      count={rowCount.toLocaleString()}
      suffix="rows"
      accent
      hint={RESULT_HINT}
    >
      {resultRows && resultRows.length > 0 && (
        <RowCast
          sample={{ columns, rows: resultRows.slice(0, 4) }}
          tone="emerald"
          f={f}
        />
      )}
      <div className="mt-1 flex flex-wrap gap-1">
        {columns.slice(0, 4).map((c) => (
          <span
            key={c}
            className="rounded border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-200/90"
          >
            {c}
          </span>
        ))}
        {columns.length > 4 && (
          <span className="rounded border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-200/70">
            +{columns.length - 4}
          </span>
        )}
      </div>
    </Frame>,
  );

  return (
    <div aria-label="query playback — how your data moves">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
          <span aria-hidden className="emoji-bob">
            🎬
          </span>
          {compact ? (
            "your data, stage by stage"
          ) : (
            <>
              watch your data move — real rows, sampled live at every stage ·{" "}
              <span className="text-zinc-400">hover a frame for a plain-words explainer</span>
            </>
          )}
        </p>
        <div className="flex items-center gap-1.5">
          <div className="flex overflow-hidden rounded-full border border-zinc-800" role="group" aria-label="playback speed">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                aria-pressed={speed === s}
                title={`playback at ${s}×`}
                className={cn(
                  "px-2 py-0.5 font-mono text-[10px] transition-colors",
                  speed === s ? "bg-emerald-400/15 text-emerald-300" : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                {s}×
              </button>
            ))}
          </div>
          <button
            onClick={() => setReplayKey((n) => n + 1)}
            title="replay the animation"
            className="inline-flex items-center gap-1 rounded-full border border-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400 transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
          >
            <span aria-hidden>↻</span> replay
          </button>
          {durationMs !== undefined && (
            <span className="sheen rounded-full border border-zinc-800 bg-zinc-900/50 px-2.5 py-0.5 font-mono text-[10px] text-zinc-500">
              ⚡ {durationMs} ms on live SQLite
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-stretch gap-1.5">
        <AnimatePresence initial={false}>
          <motion.div key={`${runId}-${replayKey}`} className="flex w-full flex-wrap items-stretch gap-1.5">
            {frames}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
