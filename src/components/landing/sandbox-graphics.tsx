"use client";

// Shared graphical atoms for the landing sandbox — the storefront emoji
// cast, animated SVG flow arrows carrying data packets, a confetti burst
// for the result frame, and springy emoji pops. Decorative but honest:
// arrows carry real measured deltas, packets just make the flow legible.

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** One emoji per table — the cast of the storefront story. */
export const TABLE_EMOJI: Record<string, string> = {
  customers: "👥",
  orders: "🧾",
  order_items: "🛒",
  payments: "💳",
  refunds: "💸",
  suppliers: "🏭",
  products: "📦",
  shipments: "🚚",
  employees: "🧑‍💼",
  acquisitions: "📣",
};

export function tableEmoji(name: string): string {
  return TABLE_EMOJI[name] ?? "📄";
}

type FlowTone = "zinc" | "sky" | "emerald";

const TONE_COLORS: Record<FlowTone, { line: string; head: string; packet: string }> = {
  zinc: { line: "#52525b", head: "#a1a1aa", packet: "#d4d4d8" },
  sky: { line: "#38bdf8", head: "#7dd3fc", packet: "#bae6fd" },
  emerald: { line: "#34d399", head: "#6ee7b7", packet: "#a7f3d0" },
};

/**
 * Animated SVG arrow between playback frames — flowing dashes plus two
 * data packets riding the line. `delta` renders as a measured badge
 * (e.g. "−1,204" or "3 ms") pinned above the shaft.
 */
export function FlowArrow({
  delta,
  tone = "zinc",
  index = 0,
  f = 1,
}: {
  delta?: string;
  tone?: FlowTone;
  index?: number;
  /** speed factor — divides animation times (f = 1/speed) */
  f?: number;
}) {
  const id = useId();
  const c = TONE_COLORS[tone];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.16 * f + 0.08 * f, duration: 0.25 * f }}
      className="flex shrink-0 flex-col items-center justify-center self-center px-0.5"
    >
      {delta && (
        <span className="tnum mb-0.5 rounded border border-amber-300/30 bg-amber-300/10 px-1 font-mono text-[10px] font-medium leading-4 text-amber-300">
          {delta}
        </span>
      )}
      <svg viewBox="0 0 64 30" width={64} height={30} aria-hidden className="overflow-visible">
        <defs>
          <marker
            id={`${id}-head`}
            markerWidth="7"
            markerHeight="7"
            refX="5.5"
            refY="3.5"
            orient="auto"
          >
            <path d="M0,0 L7,3.5 L0,7 Z" fill={c.head} />
          </marker>
        </defs>
        <line
          x1="4"
          y1="15"
          x2="52"
          y2="15"
          stroke={c.line}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="6 6"
          markerEnd={`url(#${id}-head)`}
          className="flow-dash"
        />
        <g className="packet-x" style={{ ["--packet-dist" as string]: "47px" } as React.CSSProperties}>
          <circle cx="5" cy="15" r="2.4" fill={c.packet} />
        </g>
        <g
          className="packet-x"
          style={
            {
              ["--packet-dist" as string]: "47px",
              animationDelay: "0.7s",
            } as React.CSSProperties
          }
        >
          <circle cx="5" cy="15" r="2.4" fill={c.packet} />
        </g>
      </svg>
    </motion.div>
  );
}

/** Emoji that pops in with a spring — stage badges, chip icons. */
export function PopEmoji({
  emoji,
  delay = 0,
  className,
}: {
  emoji: string;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.span
      aria-hidden
      initial={{ scale: 0, rotate: -24 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 16, delay }}
      className={cn("inline-block", className)}
    >
      {emoji}
    </motion.span>
  );
}

const CONFETTI = [
  { x: -46, y: -34, c: "#34d399" },
  { x: -30, y: -50, c: "#fcd34d" },
  { x: -14, y: -58, c: "#38bdf8" },
  { x: 2, y: -46, c: "#fb7185" },
  { x: 16, y: -56, c: "#6ee7b7" },
  { x: 32, y: -44, c: "#fde68a" },
  { x: 46, y: -32, c: "#7dd3fc" },
  { x: -4, y: -62, c: "#f9a8d4" },
];

/** One-shot confetti pop for the result frame. `f` = speed factor. */
export function ConfettiBurst({ f = 1 }: { f?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 z-10">
      {CONFETTI.map((p, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.55, rotate: p.x }}
          transition={{ duration: 0.95 * f, delay: (0.22 + i * 0.02) * f, ease: "easeOut" }}
          className="absolute h-[5px] w-[5px] rounded-[1px]"
          style={{ backgroundColor: p.c }}
        />
      ))}
    </div>
  );
}
