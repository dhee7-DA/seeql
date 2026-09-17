"use client";

// Flutter kit — the playful motion layer over the tracker. Tiny particle
// bursts, floating "+N XP" motes, animated count-ups and hover wiggles.
// Event-bus based (same spirit as celebrate.tsx): any component fires
// flutterBurst(kind, x, y) with viewport coordinates and FlutterHost —
// mounted once — paints the physics.

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export type FlutterKind = "xp" | "celebrate" | "spark";

interface FlutterEvent {
  id: number;
  kind: FlutterKind;
  x: number;
  y: number;
  label?: string;
}

type FlutterListener = (e: FlutterEvent) => void;
const listeners = new Set<FlutterListener>();
let flutterSeq = 0;

/** Fire a particle burst at viewport coordinates (e.g. from a click). */
export function flutterBurst(kind: FlutterKind, x: number, y: number, label?: string) {
  const e: FlutterEvent = { id: ++flutterSeq, kind, x, y, label };
  listeners.forEach((l) => l(e));
}

/** Burst from a DOM element's center — the common case. */
export function flutterFrom(el: Element | null, kind: FlutterKind, label?: string) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  flutterBurst(kind, r.left + r.width / 2, r.top + r.height / 2, label);
}

const PALETTES: Record<FlutterKind, string[]> = {
  xp: ["#34d399", "#5eead4", "#a7f3d0", "#fbbf24"],
  celebrate: ["#fbbf24", "#f472b6", "#60a5fa", "#c084fc", "#34d399"],
  spark: ["#fbbf24", "#fde68a"],
};

interface Particle {
  id: number;
  dx: number;
  dy: number;
  rot: number;
  size: number;
  color: string;
  delay: number;
  shape: "dot" | "star" | "ring";
}

function makeParticles(kind: FlutterKind, seed: number): Particle[] {
  const colors = PALETTES[kind];
  const n = kind === "celebrate" ? 18 : 12;
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    // golden-angle spread so every burst looks hand-tossed, not gridded
    const angle = i * 2.399963 + seed;
    const speed = 34 + ((i * 37 + seed * 13) % 40);
    out.push({
      id: i,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed - 30,
      rot: ((i * 47 + seed * 29) % 140) - 70,
      size: kind === "celebrate" ? 5 + (i % 4) : 4 + (i % 3),
      color: colors[i % colors.length],
      delay: (i % 5) * 0.02,
      shape: i % 5 === 0 ? "star" : i % 3 === 0 ? "ring" : "dot",
    });
  }
  return out;
}

function ParticleDot({ p }: { p: Particle }) {
  if (p.shape === "star") {
    return (
      <svg width={p.size * 2.2} height={p.size * 2.2} viewBox="0 0 10 10" style={{ color: p.color }}>
        <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill="currentColor" />
      </svg>
    );
  }
  if (p.shape === "ring") {
    return <span className="block rounded-full border-2" style={{ width: p.size * 2, height: p.size * 2, borderColor: p.color }} />;
  }
  return <span className="block rounded-full" style={{ width: p.size, height: p.size, backgroundColor: p.color }} />;
}

function Burst({ e }: { e: FlutterEvent }) {
  const particles = useMemo(() => makeParticles(e.kind, e.id), [e.kind, e.id]);
  return (
    <div className="pointer-events-none fixed z-[70]" style={{ left: e.x, top: e.y }} aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute"
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: [0, p.dx * 0.7, p.dx],
            y: [0, p.dy * 1.15, p.dy * 0.4 + 46],
            opacity: [1, 1, 0],
            rotate: [0, p.rot],
            scale: [1, 1.06, 0.7],
          }}
          transition={{ duration: 0.85 + p.delay * 3, delay: p.delay, ease: "easeOut" }}
        >
          <ParticleDot p={p} />
        </motion.span>
      ))}
      {e.label && (
        <motion.span
          className={cn(
            "absolute -translate-x-1/2 whitespace-nowrap font-mono text-xs font-bold drop-shadow",
            e.kind === "xp" ? "text-emerald-300" : "text-amber-300",
          )}
          initial={{ y: 0, opacity: 0, scale: 0.8 }}
          animate={{ y: -52, opacity: [0, 1, 1, 0], scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        >
          {e.label}
        </motion.span>
      )}
    </div>
  );
}

/** Mount once, next to CelebrationHost. */
export function FlutterHost() {
  const [events, setEvents] = useState<FlutterEvent[]>([]);
  useEffect(() => {
    const fn: FlutterListener = (e) => {
      setEvents((s) => [...s.slice(-5), e]);
      window.setTimeout(() => setEvents((s) => s.filter((x) => x.id !== e.id)), 1600);
    };
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return (
    <AnimatePresence>
      {events.map((e) => (
        <Burst key={e.id} e={e} />
      ))}
    </AnimatePresence>
  );
}

/** Animated number — counts up when `to` grows, down gently when it shrinks. */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const mv = useMotionValue(to);
  const spring = useSpring(mv, { stiffness: 90, damping: 22 });
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    mv.set(to);
  }, [to, mv]);
  return <motion.span className={cn("tnum", className)}>{text}</motion.span>;
}

/** Hand-drawn wobble on hover — for badges, tiles, little rewards. */
export function Wiggle({ children, className, strength = 1 }: { children: React.ReactNode; className?: string; strength?: number }) {
  return (
    <motion.div
      className={className}
      whileHover={{ rotate: [0, -2.2 * strength, 1.8 * strength, -1 * strength, 0] }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.42, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Slow flicker for flame-level streaks (render-side; no effect needed). */
export function flickerVariant(streak: number): number {
  return streak >= 10 ? 2 : streak >= 3 ? 1 : 0;
}
