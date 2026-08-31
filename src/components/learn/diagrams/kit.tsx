"use client";

// Shared SVG kit for curriculum figures. One design language for every
// diagram: mini SQL tables with semantic cell tones, flow arrows, filter
// gates, group buckets, step-player controls. All figures are hand-built
// vector on a 760-wide canvas so they scale crisply on any screen.

import { useCallback, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

/* ---------------- palette ---------------- */

export const C = {
  emerald: "#34d399",
  emeraldDim: "#10b981",
  emeraldBg: "rgba(52,211,153,0.14)",
  violet: "#a78bfa",
  violetBg: "rgba(167,139,250,0.14)",
  amber: "#fbbf24",
  amberBg: "rgba(251,191,36,0.14)",
  rose: "#fb7185",
  roseBg: "rgba(251,113,133,0.14)",
  sky: "#38bdf8",
  skyBg: "rgba(56,189,248,0.13)",
  teal: "#2dd4bf",
  tealBg: "rgba(45,212,191,0.12)",
  zinc1: "#fafafa",
  zinc2: "#e4e4e7",
  zinc3: "#d4d4d8",
  zinc4: "#a1a1aa",
  zinc5: "#71717a",
  zinc6: "#52525b",
  line: "#3f3f46",
  lineSoft: "#2e2e33",
  panel: "#131316",
  panelSoft: "#18181b",
  headBg: "#26262b",
  rowBg: "#131316",
  rowBgAlt: "#1a1a1f",
  cardBg: "#101013",
} as const;

export type Tone =
  | "default"
  | "null"
  | "pass"
  | "pick"
  | "dim"
  | "bad"
  | "calc"
  | "key";

export const TONE_FG: Record<Tone, string> = {
  default: C.zinc3,
  null: C.amber,
  pass: C.emerald,
  pick: C.violet,
  dim: C.zinc6,
  bad: C.rose,
  calc: C.sky,
  key: C.teal,
};

export const TONE_BG: Record<Tone, string> = {
  default: "transparent",
  null: C.amberBg,
  pass: C.emeraldBg,
  pick: C.violetBg,
  dim: "transparent",
  bad: C.roseBg,
  calc: C.skyBg,
  key: C.tealBg,
};

/* ---------------- figure shell ---------------- */

export function Figure({
  title,
  h,
  children,
  footnote,
  footer,
}: {
  title: string;
  h: number;
  children: ReactNode;
  footnote?: string;
  footer?: ReactNode;
}) {
  return (
    <figure className="figure-shell my-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60 shadow-[0_0_40px_-18px_var(--figure-glow,rgba(52,211,153,0.25))]">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-950/70 px-3 py-1.5">
        <figcaption className="truncate text-[11px] font-medium tracking-wide text-zinc-400">
          {title}
        </figcaption>
        <span className="shrink-0 rounded border border-zinc-800 px-1.5 py-0.5 text-[9px] font-semibold tracking-widest text-zinc-600 uppercase">
          diagram
        </span>
      </div>
      <svg
        viewBox={`0 0 760 ${h}`}
        className="block w-full"
        role="img"
        aria-label={title}
      >
        {children}
      </svg>
      {footnote && (
        <p className="border-t border-zinc-800/80 bg-zinc-950/50 px-3 py-2 text-[11px] leading-relaxed text-zinc-500">
          {footnote}
        </p>
      )}
      {footer}
    </figure>
  );
}

/* ---------------- step player ---------------- */

export function useSteps(n: number) {
  const [step, setStep] = useState(0);
  const next = useCallback(() => setStep((s) => Math.min(n - 1, s + 1)), [n]);
  const prev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);
  const reset = useCallback(() => setStep(0), []);
  return { step, setStep, next, prev, reset, n };
}

export function StepBar({
  step,
  n,
  prev,
  next,
  reset,
  captions,
  accent = C.emerald,
}: {
  step: number;
  n: number;
  prev: () => void;
  next: () => void;
  reset: () => void;
  captions: string[];
  accent?: string;
}) {
  const btn =
    "inline-flex h-7 items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/80 bg-zinc-950/70 px-3 py-2">
      <button type="button" className={btn} onClick={prev} disabled={step === 0}>
        <ChevronLeft className="h-3.5 w-3.5" /> Prev
      </button>
      <button
        type="button"
        className={btn}
        onClick={next}
        disabled={step >= n - 1}
      >
        Next <ChevronRight className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-center gap-1" aria-hidden>
        {Array.from({ length: n }, (_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === step ? 18 : 6,
              background: i <= step ? accent : "#3f3f46",
            }}
          />
        ))}
      </div>
      <p className="ml-1 min-w-0 flex-1 truncate text-[11px] text-zinc-400">
        <span className="mr-1.5 font-mono font-bold" style={{ color: accent }}>
          {step + 1}/{n}
        </span>
        {captions[step]}
      </p>
      <button
        type="button"
        onClick={reset}
        aria-label="Restart animation"
        className="text-zinc-600 transition-colors hover:text-zinc-300"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ---------------- motion helpers ---------------- */

export function Fade({
  show,
  children,
  dx = 0,
}: {
  show: boolean;
  children: ReactNode;
  dx?: number;
}) {
  return (
    <motion.g
      initial={false}
      animate={{ opacity: show ? 1 : 0, x: show ? 0 : dx }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{ pointerEvents: "none" }}
    >
      {children}
    </motion.g>
  );
}

/* ---------------- primitives ---------------- */

/** Small labeled chip (rounded rect + text), width auto-estimated. */
export function Chip({
  x,
  y,
  text,
  tone = "default",
  solid = false,
  mono = true,
  size = 11,
  anchor = "start",
}: {
  x: number;
  y: number;
  text: string;
  tone?: Tone;
  solid?: boolean;
  mono?: boolean;
  size?: number;
  anchor?: "start" | "middle" | "end";
}) {
  const w = text.length * size * 0.62 + 16;
  const h = size + 10;
  const ax = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  const fg = solid ? "#0b0b0c" : TONE_FG[tone];
  return (
    <g>
      <rect
        x={ax}
        y={y}
        width={w}
        height={h}
        rx={h / 2}
        fill={solid ? TONE_FG[tone] : TONE_BG[tone]}
        stroke={solid ? "none" : TONE_FG[tone]}
        strokeOpacity={0.45}
      />
      <text
        x={ax + w / 2}
        y={y + h / 2 + size * 0.36}
        textAnchor="middle"
        fontSize={size}
        fontWeight={600}
        fill={fg}
        className={mono ? "font-mono" : undefined}
      >
        {text}
      </text>
    </g>
  );
}

export function Label({
  x,
  y,
  text,
  size = 12,
  fill = C.zinc4,
  anchor = "start",
  bold = false,
  mono = false,
  halo = false,
  italic = false,
}: {
  x: number;
  y: number;
  text: string;
  size?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  bold?: boolean;
  mono?: boolean;
  halo?: boolean;
  italic?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={bold ? 700 : 500}
      fill={fill}
      fontStyle={italic ? "italic" : undefined}
      className={mono ? "font-mono" : undefined}
      stroke={halo ? C.cardBg : undefined}
      strokeWidth={halo ? 4 : undefined}
      style={halo ? { paintOrder: "stroke" } : undefined}
    >
      {text}
    </text>
  );
}

/* ----- mini SQL table ----- */

export interface Cell {
  t: string;
  tone?: Tone;
}

type RowIn = (Cell | string)[];

export function Tbl({
  x,
  y,
  title,
  headers,
  rows,
  w,
  colW,
  titleTone = "key",
  rowH = 24,
  headH = 24,
  titleH = 26,
  hlRows = [],
  hlCols = [],
  dimTable = false,
  size = 11.5,
}: {
  x: number;
  y: number;
  title: string;
  headers: string[];
  rows: RowIn[];
  w?: number;
  colW?: number[];
  titleTone?: Tone;
  rowH?: number;
  headH?: number;
  titleH?: number;
  hlRows?: number[];
  hlCols?: number[];
  dimTable?: boolean;
  size?: number;
}) {
  const widths =
    colW ?? Array.from({ length: headers.length }, () => (w ?? 220) / headers.length);
  const total = widths.reduce((a, b) => a + b, 0);
  const hTotal = titleH + headH + rows.length * rowH;
  const colX = (i: number) => x + widths.slice(0, i).reduce((a, b) => a + b, 0);

  return (
    <g opacity={dimTable ? 0.38 : 1}>
      {/* row / column highlights behind everything */}
      {hlRows.map((r) => (
        <rect
          key={`hr${r}`}
          x={x}
          y={y + titleH + headH + r * rowH}
          width={total}
          height={rowH}
          fill={C.emeraldBg}
        />
      ))}
      {hlCols.map((ci) => (
        <rect
          key={`hc${ci}`}
          x={colX(ci)}
          y={y + titleH}
          width={widths[ci]}
          height={headH + rows.length * rowH}
          fill={C.violetBg}
        />
      ))}

      <rect
        x={x}
        y={y}
        width={total}
        height={hTotal}
        rx={8}
        fill={C.rowBg}
        stroke={C.lineSoft}
      />
      <path
        d={`M ${x} ${y + 8} a 8 8 0 0 1 8 -8 h ${total - 16} a 8 8 0 0 1 8 8 v ${titleH - 8} h ${-total} z`}
        fill={C.headBg}
      />
      <circle cx={x + 11} cy={y + titleH / 2} r={3.4} fill={TONE_FG[titleTone]} />
      <Label
        x={x + 21}
        y={y + titleH / 2 + 4}
        text={title}
        size={11.5}
        fill={C.zinc2}
        bold
        mono
      />

      {headers.map((hd, i) => (
        <Label
          key={`h${i}`}
          x={colX(i) + widths[i] / 2}
          y={y + titleH + headH / 2 + 4}
          text={hd}
          size={size - 1}
          fill={C.zinc5}
          anchor="middle"
          mono
        />
      ))}
      <line
        x1={x}
        y1={y + titleH + headH}
        x2={x + total}
        y2={y + titleH + headH}
        stroke={C.line}
      />

      {rows.map((row, r) => (
        <g key={`r${r}`}>
          {r % 2 === 1 && (
            <rect
              x={x + 1}
              y={y + titleH + headH + r * rowH}
              width={total - 2}
              height={rowH}
              fill={C.rowBgAlt}
            />
          )}
          {row.map((c, ci) => {
            const cell: Cell = typeof c === "string" ? { t: c } : c;
            const tone = cell.tone ?? "default";
            const fg = tone === "default" ? C.zinc3 : TONE_FG[tone];
            return (
              <g key={`c${ci}`}>
                {tone !== "default" && tone !== "dim" && (
                  <rect
                    x={colX(ci) + 1.5}
                    y={y + titleH + headH + r * rowH + 2}
                    width={widths[ci] - 3}
                    height={rowH - 4}
                    rx={4}
                    fill={TONE_BG[tone]}
                  />
                )}
                <Label
                  x={colX(ci) + widths[ci] / 2}
                  y={y + titleH + headH + r * rowH + rowH / 2 + 4}
                  text={cell.t}
                  size={size}
                  fill={tone === "dim" ? C.zinc6 : fg}
                  anchor="middle"
                  mono
                  italic={tone === "null"}
                />
              </g>
            );
          })}
        </g>
      ))}
      {/* column separators */}
      {widths.slice(1).map((_, i) => (
        <line
          key={`v${i}`}
          x1={colX(i + 1)}
          y1={y + titleH}
          x2={colX(i + 1)}
          y2={y + hTotal}
          stroke={C.lineSoft}
        />
      ))}
    </g>
  );
}

/* ----- arrow ----- */

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = C.zinc5,
  w = 1.6,
  dash,
  curve = 0,
  label,
  labelT = 0.5,
  labelDy = -7,
  head = 7,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  w?: number;
  dash?: string;
  curve?: number;
  label?: string;
  labelT?: number;
  labelDy?: number;
  head?: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const cx = x1 + dx / 2 + nx * curve;
  const cy = y1 + dy / 2 + ny * curve;
  const d = curve
    ? `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`;
  const ang = (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI;
  const t = labelT;
  const lx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
  const ly = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
      <polygon
        points={`${head},0 ${-head * 0.7},${head * 0.55} ${-head * 0.7},${-head * 0.55}`}
        fill={color}
        transform={`translate(${x2} ${y2}) rotate(${ang})`}
      />
      {label && (
        <Label
          x={lx}
          y={ly + labelDy}
          text={label}
          size={10.5}
          fill={color}
          anchor="middle"
          mono
          halo
        />
      )}
    </g>
  );
}

/* ----- filter gate ----- */

export function Gate({
  x,
  y,
  label,
  tone = "pass",
  sub,
}: {
  x: number;
  y: number;
  label: string;
  tone?: Tone;
  sub?: string;
}) {
  const fg = TONE_FG[tone];
  return (
    <g>
      <path
        d={`M ${x} ${y} h 56 v 44 l -14 16 h -28 l -14 -16 z`}
        fill={TONE_BG[tone]}
        stroke={fg}
        strokeOpacity={0.7}
        strokeWidth={1.4}
      />
      <circle cx={x + 28} cy={y + 16} r={4} fill={fg} />
      <path
        d={`M ${x + 20} ${y + 27} l 6 6 l 11 -12`}
        fill="none"
        stroke={fg}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Label
        x={x + 28}
        y={y + 78}
        text={label}
        size={12}
        fill={fg}
        anchor="middle"
        bold
        mono
      />
      {sub && (
        <Label
          x={x + 28}
          y={y + 92}
          text={sub}
          size={9.5}
          fill={C.zinc5}
          anchor="middle"
        />
      )}
    </g>
  );
}

/* ----- group bucket ----- */

export function Bucket({
  x,
  y,
  w,
  h,
  label,
  count,
  tone = "pick",
  countLabel,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  count?: number;
  tone?: Tone;
  countLabel?: string;
}) {
  const fg = TONE_FG[tone];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill={TONE_BG[tone]}
        stroke={fg}
        strokeOpacity={0.55}
        strokeDasharray="5 4"
      />
      <rect x={x} y={y} width={w} height={22} rx={10} fill={fg} fillOpacity={0.16} />
      <Label
        x={x + w / 2}
        y={y + 15}
        text={label}
        size={11}
        fill={fg}
        anchor="middle"
        bold
        mono
      />
      {count !== undefined && (
        <>
          {Array.from({ length: Math.min(count, 14) }, (_, i) => (
            <circle
              key={i}
              cx={x + 14 + (i % 7) * 16}
              cy={y + 36 + Math.floor(i / 7) * 16}
              r={4.5}
              fill={fg}
              fillOpacity={0.75}
            />
          ))}
          <Label
            x={x + w / 2}
            y={y + h - 8}
            text={countLabel ?? `n = ${count}`}
            size={10.5}
            fill={C.zinc4}
            anchor="middle"
            mono
          />
        </>
      )}
    </g>
  );
}

/* ----- panel + legend + misc ----- */

export function Panel({
  x,
  y,
  w,
  h,
  title,
  tone,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  tone?: Tone;
  children?: ReactNode;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        fill={C.panel}
        stroke={C.lineSoft}
      />
      {title && (
        <>
          <circle
            cx={x + 14}
            cy={y + 16}
            r={3.2}
            fill={tone ? TONE_FG[tone] : C.zinc5}
          />
          <Label x={x + 24} y={y + 20} text={title} size={11} fill={C.zinc3} bold />
        </>
      )}
      {children}
    </g>
  );
}

export function Legend({
  x,
  y,
  items,
}: {
  x: number;
  y: number;
  items: Array<{ label: string; color: string }>;
}) {
  const placed: Array<{ it: { label: string; color: string }; cx: number }> = [];
  let acc = x;
  for (const it of items) {
    placed.push({ it, cx: acc });
    acc += 26 + it.label.length * 6.1;
  }
  return (
    <g>
      {placed.map(({ it, cx: px }) => (
        <g key={it.label}>
          <circle cx={px + 4} cy={y - 4} r={4} fill={it.color} />
          <Label x={px + 12} y={y} text={it.label} size={10.5} fill={C.zinc4} />
        </g>
      ))}
    </g>
  );
}

/** Tiny check / cross glyphs for pass-fail annotations. */
export function Mark({
  x,
  y,
  ok,
  size = 6,
  color,
}: {
  x: number;
  y: number;
  ok: boolean;
  size?: number;
  color?: string;
}) {
  const c = color ?? (ok ? C.emerald : C.rose);
  return ok ? (
    <path
      d={`M ${x - size} ${y} l ${size * 0.7} ${size * 0.7} l ${size * 1.3} ${-size * 1.5}`}
      fill="none"
      stroke={c}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ) : (
    <path
      d={`M ${x - size * 0.8} ${y - size * 0.8} l ${size * 1.6} ${size * 1.6} M ${x + size * 0.8} ${y - size * 0.8} l ${-size * 1.6} ${size * 1.6}`}
      fill="none"
      stroke={c}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  );
}

/** Section heading inside a figure. */
export function H({
  x,
  y,
  text,
  color = C.zinc2,
}: {
  x: number;
  y: number;
  text: string;
  color?: string;
}) {
  return (
    <g>
      <rect x={x} y={y - 11} width={3} height={14} rx={1.5} fill={C.emerald} />
      <Label x={x + 10} y={y} text={text} size={12.5} fill={color} bold />
    </g>
  );
}

/** Reveal-on-step wrapper with a subtle rise. */
export function Reveal({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) {
  return (
    <motion.g
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ pointerEvents: "none" }}
    >
      {children}
    </motion.g>
  );
}
