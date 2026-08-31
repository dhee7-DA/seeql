"use client";

// Shared SVG drawing kit for curriculum figures (Task 16 refactor).
// One visual language: 720-wide viewBox, Tailwind palette classes so the
// theme engine re-skins every figure, framer-motion scroll reveals.
// diagrams.tsx / diagrams-m2.tsx / diagrams-m3.tsx all import from here.

import { motion } from "framer-motion";

export const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

export function Label({
  x,
  y,
  children,
  anchor = "start",
  cls = "fill-zinc-400",
  size = 11,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  anchor?: "start" | "middle" | "end";
  cls?: string;
  size?: number;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} className={cls} fontFamily={MONO}>
      {children}
    </text>
  );
}

export function ArrowHead({ x, y, ang = 0, cls = "stroke-zinc-600", h = 6.5, delay = 0 }: { x: number; y: number; ang?: number; cls?: string; h?: number; delay?: number }) {
  // ang = direction of travel at the tip (radians, 0 = pointing right)
  const a1 = ang + Math.PI - 0.46;
  const a2 = ang + Math.PI + 0.46;
  return (
    <motion.g {...fade(delay)} className={cls} strokeWidth={1.5} strokeLinecap="round" fill="none">
      <line x1={x} y1={y} x2={x + h * Math.cos(a1)} y2={y + h * Math.sin(a1)} />
      <line x1={x} y1={y} x2={x + h * Math.cos(a2)} y2={y + h * Math.sin(a2)} />
    </motion.g>
  );
}

export function Arrow({ x1, y1, x2, y2, cls = "stroke-zinc-600" }: { x1: number; y1: number; x2: number; y2: number; cls?: string }) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const h = 6.5;
  const a1 = ang + Math.PI - 0.46;
  const a2 = ang + Math.PI + 0.46;
  return (
    <g className={cls} strokeWidth={1.5} strokeLinecap="round" fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <line x1={x2} y1={y2} x2={x2 + h * Math.cos(a1)} y2={y2 + h * Math.sin(a1)} />
      <line x1={x2} y1={y2} x2={x2 + h * Math.cos(a2)} y2={y2 + h * Math.sin(a2)} />
    </g>
  );
}

/** Animated reveal for connection paths (framer-motion draws the stroke). */
export function drawIn(delay = 0) {
  return {
    initial: { pathLength: 0.0001, opacity: 1 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.7, delay, ease: "easeInOut" as const },
  };
}

/** Smooth S-curve link with horizontal tangents — the workhorse for
 *  row-to-row foreign-key connections. Points rightward (x2 > x1). */
export function Link({
  x1,
  y1,
  x2,
  y2,
  cls = "stroke-zinc-600",
  w = 1.5,
  dash,
  arrow = true,
  dot,
  bend = 0.42,
  delay = 0,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cls?: string;
  w?: number;
  dash?: string;
  arrow?: boolean;
  dot?: string;
  bend?: number;
  delay?: number;
}) {
  const dx = Math.max(8, Math.min(Math.abs(x2 - x1) * bend, Math.abs(x2 - x1) / 2));
  const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  return (
    <g>
      <motion.path {...drawIn(delay)} d={d} className={cls} strokeWidth={w} strokeDasharray={dash} fill="none" strokeLinecap="round" />
      {dot && <motion.circle {...fade(delay + 0.1)} cx={x1} cy={y1} r={3} className={dot} />}
      {arrow && <ArrowHead x={x2} y={y2} ang={0} cls={cls} delay={delay + 0.45} />}
    </g>
  );
}

/** Rounded orthogonal polyline through the given points — for routes that
 *  must travel around other elements (down, across, up). */
export function Pipe({
  pts,
  cls = "stroke-zinc-600",
  w = 1.5,
  dash,
  arrowAng,
  arrowCls,
  r = 12,
  delay = 0,
}: {
  pts: Array<[number, number]>;
  cls?: string;
  w?: number;
  dash?: string;
  /** direction of travel at the final point, if an arrowhead is wanted */
  arrowAng?: number;
  arrowCls?: string;
  r?: number;
  delay?: number;
}) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const inLen = Math.hypot(cx - px, cy - py) || 1;
    const outLen = Math.hypot(nx - cx, ny - cy) || 1;
    const r1 = Math.min(r, inLen / 2);
    const r2 = Math.min(r, outLen / 2);
    const ax = cx - ((cx - px) / inLen) * r1;
    const ay = cy - ((cy - py) / inLen) * r1;
    const bx = cx + ((nx - cx) / outLen) * r2;
    const by = cy + ((ny - cy) / outLen) * r2;
    d += ` L ${ax} ${ay} Q ${cx} ${cy}, ${bx} ${by}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last[0]} ${last[1]}`;
  return (
    <g>
      <motion.path {...drawIn(delay)} d={d} className={cls} strokeWidth={w} strokeDasharray={dash} fill="none" strokeLinecap="round" />
      {arrowAng !== undefined && <ArrowHead x={last[0]} y={last[1]} ang={arrowAng} cls={arrowCls ?? cls} delay={delay + 0.45} />}
    </g>
  );
}

/** Small × marker — a row that hit the match rule and did not survive. */
export function XMark({ x, y, cls = "stroke-zinc-500", s = 4, delay = 0 }: { x: number; y: number; cls?: string; s?: number; delay?: number }) {
  return (
    <motion.g {...fade(delay)} className={cls} strokeWidth={1.6} strokeLinecap="round">
      <line x1={x - s} y1={y - s} x2={x + s} y2={y + s} />
      <line x1={x - s} y1={y + s} x2={x + s} y2={y - s} />
    </motion.g>
  );
}

export function Panel({ x, y, w, h, cls = "fill-zinc-900 stroke-zinc-800" }: { x: number; y: number; w: number; h: number; cls?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={8} className={cls} strokeWidth={1} />;
}

export function fade(delay = 0) {
  return {
    initial: { opacity: 0, y: 8 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.45, delay },
  };
}

/** Deterministic pseudo-random for dot layouts (stable across renders). */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function DotField({ n, cols, x0, y0, gap = 15, r = 4, passFrom }: { n: number; cols: number; x0: number; y0: number; gap?: number; r?: number; passFrom?: number }) {
  const rand = rng(7);
  const dots: React.JSX.Element[] = [];
  for (let i = 0; i < n; i++) {
    const cx = x0 + (i % cols) * gap + rand() * 4 - 2;
    const cy = y0 + Math.floor(i / cols) * gap + rand() * 4 - 2;
    const pass = passFrom === undefined || i < passFrom;
    dots.push(
      <circle key={i} cx={cx} cy={cy} r={r} className={pass ? "fill-zinc-500" : "fill-zinc-700"} opacity={pass ? 0.9 : 0.55} />,
    );
  }
  return <g>{dots}</g>;
}
