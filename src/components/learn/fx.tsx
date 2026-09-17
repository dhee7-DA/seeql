"use client";

// Micro-animation kit for the Learn UI: SVG path-draw check/cross marks,
// pulsing live dots, shimmer accents, and entrance pop-ins. All built on
// framer-motion and safe to drop into any client component.

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Animated checkmark — the stroke draws itself, then a soft ring pops. */
export function DrawCheck({
  className,
  color = "#34d399",
  ring = true,
  size = 18,
}: {
  className?: string;
  color?: string;
  ring?: boolean;
  size?: number;
}) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {ring && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ border: `1.5px solid ${color}` }}
          initial={{ scale: 0.4, opacity: 0.9 }}
          animate={{ scale: 1.55, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      )}
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="none">
        <motion.path
          d="M4.5 12.5l5 5 10-11"
          stroke={color}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
        />
      </svg>
    </span>
  );
}

/** Animated cross — two strokes draw outward from the middle. */
export function DrawCross({
  className,
  color = "#fb7185",
  size = 16,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="none">
        <motion.path
          d="M6 6l12 12"
          stroke={color}
          strokeWidth={2.6}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        />
        <motion.path
          d="M18 6L6 18"
          stroke={color}
          strokeWidth={2.6}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.12 }}
        />
      </svg>
    </span>
  );
}

/** Pulsing "live" dot — expanding halo over a solid core. */
export function PulseDot({
  className,
  color = "#2dd4bf",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={cn("relative inline-flex h-2 w-2 shrink-0", className)}
      aria-hidden
    >
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: color }}
        animate={{ scale: [1, 2.1], opacity: [0.55, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
      <span
        className="relative inline-block h-2 w-2 rounded-full"
        style={{ background: color }}
      />
    </span>
  );
}

/** Pop-in wrapper for badges that just turned "on" (solved, unlocked…). */
export function PopIn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      className={cn("inline-flex items-center", className)}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
    >
      {children}
    </motion.span>
  );
}

/** Entrance for content cards: slight rise + fade, tiny stagger via delay. */
export function Rise({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

/** Animated donut progress ring (SVG stroke-draw). Children center inside. */
export function Ring({
  pct,
  size = 44,
  stroke = 4,
  color = "#34d399",
  track = "#27272a",
  className,
  children,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(clamped * 100)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - clamped) }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        {children}
      </span>
    </span>
  );
}
