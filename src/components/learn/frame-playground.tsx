"use client";

// Window-frame playground — enhancement #5.
//
// The one place to SEE what a window frame is. A 12-row tie-heavy dataset
// (every sales value appears 2–4 times, so RANGE peer-folding and GROUPS
// group-stepping are always visible); a control deck that builds the OVER()
// clause piece by piece; and a step-through stage where the frame slides row
// by row — highlighted with the engine in src/lib/frames.ts, whose membership
// is proven identical to SQLite's own window machinery by
// scripts/validate-frames.ts (30k+ checks).
//
// Honesty rule: the value column is SQLite's OWN output — the exact statement
// shown runs live against the sandbox on every config change. The app only
// draws the highlights around it.

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import {
  DEFAULT_FRAME_SENTENCE,
  DEFAULT_FRAME_CONFIG,
  FRAME_PRESETS,
  formatValue,
  frameMembers,
  frameSentence,
  buildSql,
  orderKeyOf,
  partitionSegments,
  type BoundKind,
  type ExcludeMode,
  type FrameConfig,
  type FrameFn,
  type FrameRow,
  type FrameUnit,
} from "@/lib/frames";
import { cn } from "@/lib/utils";
import { Btn, Chip, Panel, SectionLabel } from "./ui/kit";
import { execSql } from "./practice-kit";
import { SqlNodes } from "./sql-code";

// ---- segmented control -----------------------------------------------------

interface Opt<V> {
  v: V;
  label: string;
  title?: string;
}

function Seg<V extends string>({
  value,
  options,
  onChange,
  aria,
}: {
  value: V;
  options: Array<Opt<V>>;
  onChange: (v: V) => void;
  aria: string;
}) {
  return (
    <div role="group" aria-label={aria} className="inline-flex flex-wrap gap-1">
      {options.map((o) => (
        <Btn
          key={o.v}
          variant="pill"
          active={value === o.v}
          onClick={() => onChange(o.v)}
          title={o.title}
          aria-pressed={value === o.v}
        >
          {o.label}
        </Btn>
      ))}
    </div>
  );
}

function Stepper({
  n,
  onSet,
  label,
}: {
  n: number;
  onSet: (n: number) => void;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 px-1 py-0.5">
      <span className="pl-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
      <Btn variant="ghost" aria-label={`Decrease ${label}`} onClick={() => onSet(Math.max(1, n - 1))} className="px-1 py-0.5">
        −
      </Btn>
      <span className="tnum w-4 text-center font-mono text-[11px] text-zinc-200">{n}</span>
      <Btn variant="ghost" aria-label={`Increase ${label}`} onClick={() => onSet(Math.min(6, n + 1))} className="px-1 py-0.5">
        +
      </Btn>
    </span>
  );
}

// ---- control deck ----------------------------------------------------------

function Deck({ cfg, patch }: { cfg: FrameConfig; patch: (p: Partial<FrameConfig>) => void }) {
  return (
    <Panel pad={4}>
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <SectionLabel className="w-20 shrink-0 pt-1.5">Aggregate</SectionLabel>
          <Seg<FrameFn>
            aria="Window function"
            value={cfg.fn}
            onChange={(fn) => patch({ fn })}
            options={[
              { v: "sum", label: "SUM" },
              { v: "avg", label: "AVG" },
              { v: "count", label: "COUNT" },
              { v: "min", label: "MIN" },
              { v: "max", label: "MAX" },
              { v: "first", label: "FIRST_VALUE", title: "FIRST_VALUE(sales) — first value in the frame" },
              { v: "last", label: "LAST_VALUE", title: "LAST_VALUE(sales) — last value in the frame" },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <SectionLabel className="w-20 shrink-0 pt-1.5">Scope</SectionLabel>
          <Seg<"none" | "region">
            aria="Partitioning"
            value={cfg.partition ? "region" : "none"}
            onChange={(v) => patch({ partition: v === "region" })}
            options={[
              { v: "none", label: "whole table" },
              { v: "region", label: "PARTITION BY region" },
            ]}
          />
          <span className="font-mono text-[10px] text-zinc-600">·</span>
          <Seg<"sales" | "day">
            aria="Order by column"
            value={cfg.orderCol}
            onChange={(orderCol) => patch({ orderCol })}
            options={[
              { v: "sales", label: "ORDER BY sales" },
              { v: "day", label: "ORDER BY day" },
            ]}
          />
          <Seg<"asc" | "desc">
            aria="Order direction"
            value={cfg.dir}
            onChange={(dir) => patch({ dir })}
            options={[
              { v: "asc", label: "ASC" },
              { v: "desc", label: "DESC" },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <SectionLabel className="w-20 shrink-0 pt-1.5">Frame</SectionLabel>
          <Seg<"default" | "custom">
            aria="Frame clause mode"
            value={cfg.frameMode}
            onChange={(frameMode) => patch({ frameMode })}
            options={[
              { v: "default", label: "omitted (default)" },
              { v: "custom", label: "explicit frame" },
            ]}
          />
          <span className="font-mono text-[10px] leading-4 text-zinc-500">
            {cfg.frameMode === "default" ? (
              <>
                silently <span className="text-amber-300/90">{DEFAULT_FRAME_SENTENCE}</span>
              </>
            ) : (
              <span className="text-zinc-600">write the clause yourself →</span>
            )}
          </span>
        </div>

        {cfg.frameMode === "custom" && (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <SectionLabel className="w-20 shrink-0 pt-1.5">Unit</SectionLabel>
              <Seg<FrameUnit>
                aria="Frame unit"
                value={cfg.unit}
                onChange={(unit) => patch({ unit })}
                options={[
                  { v: "rows", label: "ROWS", title: "physical rows" },
                  { v: "range", label: "RANGE", title: "value offsets — ties move together" },
                  { v: "groups", label: "GROUPS", title: "peer-groups counted as units" },
                ]}
              />
              <span className="font-mono text-[10px] text-zinc-600">·</span>
              <Seg<ExcludeMode>
                aria="Exclude clause"
                value={cfg.exclude}
                onChange={(exclude) => patch({ exclude })}
                options={[
                  { v: "no-others", label: "no EXCLUDE" },
                  { v: "current-row", label: "EXCL CURRENT ROW" },
                  { v: "group", label: "EXCL GROUP" },
                  { v: "ties", label: "EXCL TIES" },
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <SectionLabel className="w-20 shrink-0 pt-1.5">Bounds</SectionLabel>
              <span className="font-mono text-[11px] text-zinc-500">BETWEEN</span>
              <Seg<BoundKind>
                aria="Frame start bound"
                value={cfg.start}
                onChange={(start) => patch({ start })}
                options={[
                  { v: "unbounded-preceding", label: "UNBOUNDED PREC." },
                  { v: "n-preceding", label: "N PREC." },
                  { v: "current-row", label: "CURRENT ROW" },
                ]}
              />
              {cfg.start === "n-preceding" && (
                <Stepper label="start N" n={cfg.startN} onSet={(startN) => patch({ startN })} />
              )}
              <span className="font-mono text-[11px] text-zinc-500">AND</span>
              <Seg<BoundKind>
                aria="Frame end bound"
                value={cfg.end}
                onChange={(end) => patch({ end })}
                options={[
                  { v: "current-row", label: "CURRENT ROW" },
                  { v: "n-following", label: "N FOLL." },
                  { v: "unbounded-following", label: "UNBOUNDED FOLL." },
                ]}
              />
              {cfg.end === "n-following" && (
                <Stepper label="end N" n={cfg.endN} onSet={(endN) => patch({ endN })} />
              )}
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}

// ---- stage -----------------------------------------------------------------

function FrameGrid({
  rows,
  cfg,
  sel,
  memberSet,
  vals,
  activeValue,
  onPick,
}: {
  rows: FrameRow[];
  cfg: FrameConfig;
  sel: number;
  memberSet: Set<number>;
  vals: Map<number, number | null>;
  activeValue: number | null;
  onPick: (i: number) => void;
}) {
  const key = orderKeyOf(cfg);
  const activeKey = key(rows[sel]);
  const segs = partitionSegments(rows, cfg.partition);
  const segOf = (i: number) => segs.find(([a, b]) => i >= a && i <= b);
  const lastSegStarts = new Set(segs.map(([a]) => a));
  const showRegion = cfg.partition;

  const cell = (v: number | null) =>
    v === null ? "NULL" : Number.isInteger(v) ? String(v) : v.toFixed(2);

  return (
    <div className="overflow-x-auto thin-scrollbar">
      <table className="w-full min-w-[380px] border-collapse font-mono text-[11px]">
        <thead>
          <tr>
            {["", "day", ...(showRegion ? ["region"] : []), "sales", "window_value"].map((h, i) => (
              <th
                key={i}
                className="border-b border-zinc-800 px-2 py-1.5 text-left font-medium uppercase tracking-wider text-zinc-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const active = i === sel;
            const inFrame = memberSet.has(i);
            const dim = !inFrame && !active;
            const peer = i !== sel && key(r) === activeKey;
            const isPeerBoundary = lastSegStarts.has(i) && segOf(i)?.[0] === i;
            return (
              <Fragment key={r.day}>
                {isPeerBoundary && showRegion && (
                  <tr>
                    <td
                      colSpan={5}
                      className="border-b border-zinc-800/60 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500"
                    >
                      region · {r.region}
                    </td>
                  </tr>
                )}
                <tr
                  onClick={() => onPick(i)}
                  className={cn(
                    "cursor-pointer border-b border-zinc-800/50 transition-colors last:border-b-0",
                    active ? "bg-emerald-400/[0.13]" : inFrame ? "bg-emerald-400/[0.055]" : "hover:bg-zinc-900/60",
                    dim && "opacity-45",
                  )}
                >
                  <td className={cn("w-1 border-l-2 px-1 py-1.5", active ? "border-emerald-400" : "border-transparent")}>
                    {active && <span aria-hidden className="block text-emerald-300">▸</span>}
                  </td>
                  <td className="tnum px-2 py-1.5 text-zinc-300">{r.day}</td>
                  {showRegion && <td className="px-2 py-1.5 text-zinc-500">{r.region}</td>}
                  <td className={cn("tnum px-2 py-1.5", peer ? "text-amber-300/90 underline decoration-dotted underline-offset-2" : "text-zinc-300")}>
                    {r.sales}
                  </td>
                  <td
                    className={cn(
                      "tnum px-2 py-1.5",
                      active
                        ? activeValue === null
                          ? "italic text-zinc-500"
                          : "font-semibold text-emerald-300"
                        : inFrame
                          ? "text-emerald-200/70"
                          : "text-zinc-600",
                    )}
                  >
                    {cell(vals.get(r.day) ?? null)}
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Inspector({
  cfg,
  rows,
  sel,
  members,
  activeValue,
  busy,
  playing,
  onSel,
  onPlay,
}: {
  cfg: FrameConfig;
  rows: FrameRow[];
  sel: number;
  members: number[];
  activeValue: number | null;
  busy: boolean;
  playing: boolean;
  onSel: (i: number) => void;
  onPlay: () => void;
}) {
  const active = rows[sel];
  const reduced = useReducedMotion() ?? false;
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] text-zinc-400">
          output row <span className="tnum text-zinc-100">{sel + 1}</span> / {rows.length}
        </p>
        <div className="flex items-center gap-1">
          <Btn variant="ghost" aria-label="First row" onClick={() => onSel(0)}>
            <SkipBack className="h-3.5 w-3.5" />
          </Btn>
          <Btn variant="ghost" aria-label="Previous row" onClick={() => onSel(Math.max(0, sel - 1))}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Btn>
          <Btn variant="soft" aria-label={playing ? "Pause the sliding frame" : "Play the sliding frame"} onClick={onPlay}>
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : playing ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {playing ? "pause" : "slide"}
          </Btn>
          <Btn variant="ghost" aria-label="Next row" onClick={() => onSel(Math.min(rows.length - 1, sel + 1))}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Btn>
          <Btn variant="ghost" aria-label="Last row" onClick={() => onSel(rows.length - 1)}>
            <SkipForward className="h-3.5 w-3.5" />
          </Btn>
        </div>
      </div>

      <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/[0.05] p-3.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">this row's frame</p>
        <p className="mt-1.5 font-mono text-xs text-emerald-200">{frameSentence(cfg)}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
          {members.length === 0 ? (
            <>Empty frame — no rows feed the aggregate.</>
          ) : (
            <>
              <span className="tnum font-medium text-zinc-200">{members.length}</span>{" "}
              {members.length === 1 ? "row" : "rows"} in frame: days{" "}
              <span className="tnum">{members.map((p) => rows[p].day).join(", ")}</span>
            </>
          )}
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
          {cfg.fn === "count" ? "COUNT(*)" : `${cfg.fn.toUpperCase()}(sales)`} for this row
        </p>
        <motion.p
          key={`${sel}-${activeValue}`}
          initial={reduced ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "tnum mt-1 font-display text-3xl font-semibold tracking-[-0.02em]",
            activeValue === null ? "text-zinc-500" : "text-zinc-50",
          )}
          title={activeValue === null ? "NULL" : String(activeValue)}
        >
          {formatValue(activeValue)}
        </motion.p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
          {activeValue === null
            ? "Empty frames aggregate to NULL — the SQL standard's answer for 'no rows'. COUNT would say 0."
            : "Computed by SQLite — this exact query just ran against the sandbox."}
        </p>
        <p className="mt-2 border-t border-zinc-800 pt-2 font-mono text-[10px] text-zinc-600">
          row: day {active.day} · region {active.region} · sales {active.sales}
        </p>
      </div>
    </div>
  );
}

// ---- view ------------------------------------------------------------------

function lenSafe(rows: FrameRow[] | null): number {
  return rows?.length ?? 0;
}

export function FramePlayground() {
  const [cfg, setCfg] = useState<FrameConfig>(DEFAULT_FRAME_CONFIG);
  const [rows, setRows] = useState<FrameRow[] | null>(null);
  const [vals, setVals] = useState<Map<number, number | null>>(new Map());
  const [err, setErr] = useState<string | null>(null);
  const [doneCfg, setDoneCfg] = useState<FrameConfig | null>(null);
  // Selection/play carry the config they were made under — a config change
  // DERIVES a reset (sel 0, paused) with zero setState-in-effect.
  const [selState, setSelState] = useState<{ cfg: FrameConfig; i: number }>({ cfg: DEFAULT_FRAME_CONFIG, i: 0 });
  const [playState, setPlayState] = useState<{ cfg: FrameConfig; on: boolean }>({ cfg: DEFAULT_FRAME_CONFIG, on: false });
  const [activePreset, setActivePreset] = useState<string | null>("running");
  const runId = useRef(0);

  const staleCfg = selState.cfg !== cfg;
  const sel = staleCfg ? 0 : selState.i;
  const playing = staleCfg ? false : playState.on;
  const busy = doneCfg !== cfg; // a run is in flight for the current config

  const patch = (p: Partial<FrameConfig>) => {
    setCfg((c) => ({ ...c, ...p }));
    setActivePreset(null);
  };
  const pick = (i: number) => {
    setSelState({ cfg, i });
    setPlayState({ cfg, on: false });
  };
  const togglePlay = () => {
    setPlayState({ cfg, on: !(staleCfg ? false : playState.on) });
    if (sel >= lenSafe(rows) - 1) setSelState({ cfg, i: 0 });
  };

  // Live run — the exact statement shown, against the sandbox, every change.
  // All state updates happen in the async continuation (never the effect body).
  useEffect(() => {
    const id = ++runId.current;
    let dead = false;
    execSql(buildSql(cfg)).then((res) => {
      if (dead || runId.current !== id) return; // a newer config already took over
      if (res.ok) {
        const rws = res.rows.map((r) => ({ day: Number(r[0]), region: String(r[1]), sales: Number(r[2]) }));
        const v = new Map<number, number | null>();
        for (const r of res.rows) v.set(Number(r[0]), r[3] === null ? null : Number(r[3]));
        setRows(rws);
        setVals(v);
        setErr(null);
      } else {
        setErr(res.error);
      }
      setDoneCfg(cfg);
    });
    return () => {
      dead = true;
    };
  }, [cfg]);

  const len = rows?.length ?? 0;

  // Auto-play — advance while playing; no-op ticks at the end, pauses derive
  // from the config-tagged playState.
  useEffect(() => {
    if (!playing || len === 0) return;
    const t = setInterval(() => {
      setSelState((st) => (st.cfg !== cfg || st.i + 1 >= len ? st : { ...st, i: st.i + 1 }));
    }, 1150);
    return () => clearInterval(t);
  }, [playing, len, cfg]);

  const members = useMemo(() => (rows && len > 0 ? frameMembers(rows, Math.min(sel, len - 1), cfg) : []), [rows, sel, len, cfg]);
  const memberSet = useMemo(() => new Set(members), [members]);
  const activeValue = rows && len > 0 ? (vals.get(rows[Math.min(sel, len - 1)].day) ?? null) : null;
  const sql = useMemo(() => buildSql(cfg), [cfg]);

  return (
    <div className="max-w-4xl">
      <Panel pad={5}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>Practice lab · window frames</SectionLabel>
            <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-[-0.02em] text-zinc-50">
              Window-frame playground
            </h1>
          </div>
          <div className="flex gap-1.5">
            <Chip k="engine" v="SQLite live" />
            <Chip k="dataset" v="12 rows · tie-heavy" />
          </div>
        </div>
        <p className="mt-2.5 max-w-2xl text-[13px] leading-6 text-zinc-400">
          A window function reads a <span className="text-zinc-200">frame</span> — the exact slice of rows that
          feeds each result. Build one below, then slide it across the table and watch which rows light up.
          Ties everywhere on purpose: they are where ROWS, RANGE and GROUPS part ways.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <SectionLabel className="mr-1 pt-1.5">Presets</SectionLabel>
          {FRAME_PRESETS.map((p) => (
            <Btn
              key={p.id}
              variant="pill"
              active={activePreset === p.id}
              title={p.why}
              onClick={() => {
                setCfg(p.config);
                setActivePreset(p.id);
              }}
            >
              {p.label}
            </Btn>
          ))}
        </div>
        <p className="mt-2 min-h-4 text-[11px] italic leading-4 text-zinc-500">
          {activePreset ? (FRAME_PRESETS.find((p) => p.id === activePreset)?.why ?? "") : "Custom build — every knob is yours."}
        </p>
      </Panel>

      <div className="mt-3">
        <Deck cfg={cfg} patch={patch} />
      </div>

      <Panel pad={4} className="mt-3">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {rows && len > 0 ? (
            <FrameGrid
              rows={rows}
              cfg={cfg}
              sel={Math.min(sel, len - 1)}
              memberSet={memberSet}
              vals={vals}
              activeValue={activeValue}
              onPick={pick}
            />
          ) : (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
            </div>
          )}
          {rows && len > 0 && (
            <Inspector
              cfg={cfg}
              rows={rows}
              sel={Math.min(sel, len - 1)}
              members={members}
              activeValue={activeValue}
              busy={busy}
              playing={playing}
              onSel={pick}
              onPlay={togglePlay}
            />
          )}
        </div>
      </Panel>

      <Panel pad={4} className="mt-3">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>the exact statement</SectionLabel>
          {busy ? (
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
              <Loader2 className="h-3 w-3 animate-spin" /> running…
            </span>
          ) : err ? (
            <span className="font-mono text-[10px] text-rose-300">{err}</span>
          ) : (
            <span className="font-mono text-[10px] text-emerald-300">✓ value column is SQLite's own output</span>
          )}
        </div>
        <pre className="thin-scrollbar mt-2.5 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-900/50 p-3 font-mono text-[11px] leading-5 text-zinc-300">
          <SqlNodes text={sql} />
        </pre>
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
          Rows supplied by a VALUES CTE — nothing in the sandbox is touched. Membership highlights are drawn by{" "}
          <span className="font-mono text-zinc-400">src/lib/frames.ts</span>, cross-checked against SQLite across
          30,000+ spec combinations by <span className="font-mono text-zinc-400">scripts/validate-frames.ts</span>.
        </p>
      </Panel>
    </div>
  );
}
