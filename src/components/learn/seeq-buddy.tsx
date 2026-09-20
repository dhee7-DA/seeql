"use client";

// SeeQ — the SeeQL study buddy. A small emerald blob that lives in the
// bottom-left corner: it blinks, its gaze drifts (and follows the pointer),
// it bobs gently, and every so often it shares a short coaching tip about
// the course. Poke it and it cheers you on.
//
// Implementation notes:
// - Zero animation libraries. A single requestAnimationFrame loop advances a
//   tiny numeric pose model; geometry is painted straight onto SVG element
//   attributes, so React never re-renders per frame.
// - All easing is exponential ease-out (pose chases its target), which keeps
//   every transition soft — the blob never overshoots.
// - Honours prefers-reduced-motion: renders one static frame, no loop.
// - Collapsible (persisted in localStorage). Collapsed, it shrinks to a
//   quiet chip that still blinks; speech is paused while collapsed.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, X } from "lucide-react";

// ---- Pose model -----------------------------------------------------------

type Mood = "idle" | "happy" | "excited" | "thinking" | "sad" | "wink";

const FULL = {
  rx: 5.6, // eye half-width
  ryL: 9, // left eye half-height
  ryR: 9, // right eye half-height
  openL: 1, // per-eye openness (mood-driven, blink multiplies on top)
  openR: 1,
  tilt: -6, // eye tilt in degrees — our eyes lean the other way from bloub's
  gazeBiasY: 0,
  mouthCurve: 0, // -1 frown .. 1 smile
  mouthShow: 0,
  mouthOpen: 0, // 0 closed .. 1 "o" mouth
  cheeks: 0,
  wob: 1, // organic wobble amplitude
  bounce: 0, // excited squash-and-stretch
};

type Pose = typeof FULL;
const POSE_KEYS = Object.keys(FULL) as (keyof Pose)[];
const EMPTY: Partial<Pose> = {};

const POSES: Record<Mood, Partial<Pose>> = {
  idle: { tilt: -6, wob: 1 },
  happy: { ryL: 7.6, ryR: 7.6, tilt: -4, mouthCurve: 0.85, mouthShow: 1, cheeks: 0.6, wob: 1.25 },
  excited: {
    rx: 6.4, ryL: 10.4, ryR: 10.4, tilt: 0, mouthOpen: 1, cheeks: 1,
    wob: 2.1, bounce: 1, gazeBiasY: -0.4,
  },
  thinking: { ryL: 8.6, ryR: 6.9, tilt: -11, gazeBiasY: -2.4, mouthCurve: 0.08, mouthShow: 1, wob: 0.7 },
  sad: { ryL: 7, ryR: 7, tilt: -15, gazeBiasY: 1.2, mouthCurve: -0.85, mouthShow: 1, wob: 0.6 },
  wink: { openL: 0.08, ryR: 8.2, tilt: -2, mouthCurve: 0.55, mouthShow: 1, cheeks: 0.45, wob: 1.15 },
};

// ---- Coach tips (warm, app-aware, no emoji) -------------------------------

const TIPS: { mood: Mood; text: string }[] = [
  { mood: "happy", text: "Hi, I'm SeeQ. I live down here while you practice — poke me any time." },
  { mood: "thinking", text: "Stuck on a query? The AI Mentor in the toolbox gives tiered hints on your own data." },
  { mood: "excited", text: "Streak rule: hit your daily goal and the flame keeps burning. Five minutes is enough." },
  { mood: "thinking", text: "Reading a query plan: SCAN touches every row, SEARCH jumps straight to matches. Indexes turn the first into the second." },
  { mood: "happy", text: "Query golf scores strokes, not speed. Shorter SQL that returns the same rows wins." },
  { mood: "wink", text: "Interview classic: COUNT(*) counts rows, COUNT(col) skips NULLs. Drop that and watch eyebrows rise." },
  { mood: "thinking", text: "Silent bug alert: a WHERE against NULL never matches. Write IS NOT NULL before you debug for an hour." },
  { mood: "happy", text: "The Error clinic grades your diagnosis, not just your fix. Say WHY it broke." },
  { mood: "excited", text: "Badges unlock quietly as you practice. The overview wall keeps score." },
  { mood: "wink", text: "JOIN order does not matter to the planner — but clear aliases matter to your future self." },
  { mood: "thinking", text: "Window functions keep every row while adding aggregates. The drills cover them from six angles." },
  { mood: "happy", text: "The Data explorer is a sandbox. Breaking things there is free — and honestly encouraged." },
  { mood: "excited", text: "Finished a lesson? Predict the output next: freeze the grid before it runs." },
  { mood: "happy", text: "Slow query in the Performance lab? Add the index it suggests and watch SCAN collapse into SEARCH." },
];

const PRAISE = [
  "Ready for one more query?",
  "You've got this — one table at a time.",
  "Slow queries fear you, you know.",
  "Small steps daily beat marathons on Sunday.",
  "Poke received. Morale restored.",
];

// ---- Geometry helpers ------------------------------------------------------

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Closed Catmull-Rom spline through the points, as an SVG path string. */
function catmullClosed(p: [number, number][]): string {
  const n = p.length;
  let d = `M ${p[0][0].toFixed(2)} ${p[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return `${d} Z`;
}

// Fixed per-index radius quirks give the blob a personal silhouette.
const IR = [1.02, 0.965, 1.03, 0.975, 1.0, 0.96, 1.028, 0.982, 1.012];

function bodyPath(t: number, sx: number, sy: number, wob: number): string {
  const n = IR.length;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
    const r = 30.5 * IR[i] * (1 + 0.028 * Math.sin(t * 1.2 + i * 2.3) * wob);
    pts.push([60 + Math.cos(a) * r * sx, 61 + Math.sin(a) * r * sy]);
  }
  return catmullClosed(pts);
}

const INITIAL_D = bodyPath(0.6, 1, 1, 1);

// ---- Engine ----------------------------------------------------------------

interface Painters {
  body: SVGPathElement | null;
  bodyG: SVGGElement | null;
  shadow: SVGEllipseElement | null;
  eyeG: SVGGElement | null;
  eyeL: SVGEllipseElement | null;
  eyeR: SVGEllipseElement | null;
  mouthCurve: SVGPathElement | null;
  mouthOpen: SVGEllipseElement | null;
  cheekL: SVGEllipseElement | null;
  cheekR: SVGEllipseElement | null;
}

interface Engine {
  pose: { -readonly [K in keyof Pose]: number };
  gaze: { x: number; y: number };
  pointer: { x: number; y: number; ts: number };
  blink: { active: boolean; phase: number; next: number };
  raf: number;
  last: number;
  running: boolean;
  reduced: boolean;
}

function setEllipse(el: SVGEllipseElement | null, cx: number, cy: number, rx: number, ry: number) {
  if (!el) return;
  el.setAttribute("cx", cx.toFixed(2));
  el.setAttribute("cy", cy.toFixed(2));
  el.setAttribute("rx", rx.toFixed(2));
  el.setAttribute("ry", ry.toFixed(2));
}

function paint(e: Engine, t: number, blinkMul: number, R: Painters) {
  const p = e.pose;
  const s = p.wob * 0.022 * Math.sin(t * 2.05 + 1.2) + p.bounce * 0.075 * Math.abs(Math.sin(t * 5.2));
  const sx = 1 + s;
  const sy = 1 - s * 0.85;

  R.body?.setAttribute("d", bodyPath(t, sx, sy, p.wob));

  const bob = Math.sin(t * 1.05) * 2.2;
  R.bodyG?.setAttribute(
    "transform",
    `translate(0 ${bob.toFixed(2)}) rotate(${(e.gaze.x * 0.35).toFixed(2)} 60 66)`,
  );
  R.shadow?.setAttribute("rx", (24 - Math.sin(t * 1.05) * 1.8).toFixed(2));

  const oL = Math.max(0.05, Math.min(1, p.openL) * blinkMul);
  const oR = Math.max(0.05, Math.min(1, p.openR) * blinkMul);
  R.eyeG?.setAttribute(
    "transform",
    `translate(${e.gaze.x.toFixed(2)} ${e.gaze.y.toFixed(2)}) rotate(${p.tilt.toFixed(2)} 60 60)`,
  );
  setEllipse(R.eyeL, 48.5, 60, p.rx * (0.9 + 0.1 * oL), p.ryL * oL);
  setEllipse(R.eyeR, 71.5, 60, p.rx * (0.9 + 0.1 * oR), p.ryR * oR);

  const open = clamp(p.mouthOpen, 0, 1);
  if (R.mouthOpen) {
    R.mouthOpen.setAttribute("ry", (1.1 + 3.4 * open).toFixed(2));
    R.mouthOpen.setAttribute("opacity", open > 0.12 ? "1" : "0");
  }
  if (R.mouthCurve) {
    R.mouthCurve.setAttribute("d", `M 53.5 75.8 Q 60 ${(75.8 - 5.4 * p.mouthCurve).toFixed(2)} 66.5 75.8`);
    R.mouthCurve.setAttribute("opacity", p.mouthShow > 0.5 && open <= 0.12 ? "1" : "0");
  }
  R.cheekL?.setAttribute("opacity", (p.cheeks * 0.4).toFixed(3));
  R.cheekR?.setAttribute("opacity", (p.cheeks * 0.4).toFixed(3));
}

// ---- Component --------------------------------------------------------------

const COLLAPSE_KEY = "seeql.buddy.collapsed";
const TIP_HOLD_MS = 8200;
const TIP_GAP_MS = 22000;
const TIP_GAP_JITTER_MS = 14000;

/** No-op store subscription for the client gate (nothing to subscribe to). */
const emptySubscribe = () => () => {};

export function SeeqBuddy() {
  // SSR-safe client gate: no effect, no state — the server snapshot renders null.
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [bubble, setBubble] = useState<{ text: string; mood: Mood } | null>(null);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<SVGPathElement | null>(null);
  const bodyGRef = useRef<SVGGElement | null>(null);
  const shadowRef = useRef<SVGEllipseElement | null>(null);
  const eyeGRef = useRef<SVGGElement | null>(null);
  const eyeLRef = useRef<SVGEllipseElement | null>(null);
  const eyeRRef = useRef<SVGEllipseElement | null>(null);
  const mouthCurveRef = useRef<SVGPathElement | null>(null);
  const mouthOpenRef = useRef<SVGEllipseElement | null>(null);
  const cheekLRef = useRef<SVGEllipseElement | null>(null);
  const cheekRRef = useRef<SVGEllipseElement | null>(null);

  const engineRef = useRef<Engine | null>(null);
  const paintersRef = useRef<Painters>({
    body: null, bodyG: null, shadow: null, eyeG: null, eyeL: null, eyeR: null,
    mouthCurve: null, mouthOpen: null, cheekL: null, cheekR: null,
  });
  const moodRef = useRef<Mood>("idle");
  const collapsedRef = useRef(collapsed);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const bag = useRef<{ order: number[]; i: number }>({ order: [], i: 0 });
  const praiseIdx = useRef(0);

  const clearTimers = () => {
    if (showTimer.current !== null) window.clearTimeout(showTimer.current);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    showTimer.current = null;
    hideTimer.current = null;
  };

  const scheduleNextTip = (delayMs: number) => {
    if (showTimer.current !== null) window.clearTimeout(showTimer.current);
    showTimer.current = window.setTimeout(() => {
      if (collapsedRef.current) return;
      const b = bag.current;
      if (b.i >= b.order.length) {
        b.order = TIPS.map((_, i) => i);
        for (let i = b.order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [b.order[i], b.order[j]] = [b.order[j], b.order[i]];
        }
        b.i = 0;
      }
      const tip = TIPS[b.order[b.i++]];
      setBubble({ text: tip.text, mood: tip.mood });
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => {
        setBubble(null);
        scheduleNextTip(TIP_GAP_MS + Math.random() * TIP_GAP_JITTER_MS);
      }, TIP_HOLD_MS);
    }, delayMs);
  };

  // Paint a single static frame (reduced motion / mood sync).
  const staticPaint = () => {
    const e = engineRef.current;
    if (!e) return;
    const base = POSES[moodRef.current] ?? EMPTY;
    for (const key of POSE_KEYS) {
      e.pose[key] =
        key === "mouthShow" && collapsedRef.current ? 0 : (base[key] ?? FULL[key]);
    }
    paint(e, 3.4, 1, paintersRef.current);
  };

  // Bubble drives the mood; also repaints the static frame under reduced motion.
  useEffect(() => {
    moodRef.current = bubble?.mood ?? "idle";
    if (engineRef.current?.reduced) staticPaint();
  }, [bubble]);

  // Collapse changes: persist + keep the engine's view in sync. Speech is
  // paused/resumed by the event handlers that flip `collapsed`.
  useEffect(() => {
    collapsedRef.current = collapsed;
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* private mode — ignore */
    }
  }, [collapsed]);

  // Mount: start the engine and begin the tip cycle.
  useEffect(() => {
    paintersRef.current = {
      body: bodyRef.current,
      bodyG: bodyGRef.current,
      shadow: shadowRef.current,
      eyeG: eyeGRef.current,
      eyeL: eyeLRef.current,
      eyeR: eyeRRef.current,
      mouthCurve: mouthCurveRef.current,
      mouthOpen: mouthOpenRef.current,
      cheekL: cheekLRef.current,
      cheekR: cheekRRef.current,
    };

    const e: Engine = {
      pose: { ...FULL },
      gaze: { x: 0, y: 0 },
      pointer: { x: 0, y: 0, ts: -1e9 },
      blink: { active: false, phase: 0, next: 2.4 },
      raf: 0,
      last: 0,
      running: false,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
    engineRef.current = e;

    const tick = (now: number) => {
      const t = now / 1000;
      const dt = e.last ? Math.min(0.06, (now - e.last) / 1000) : 0.016;
      e.last = now;

      const base = POSES[moodRef.current] ?? EMPTY;
      const k = 1 - Math.exp(-dt * 7.5);
      for (const key of POSE_KEYS) {
        const tgt = key === "mouthShow" && collapsedRef.current ? 0 : (base[key] ?? FULL[key]);
        e.pose[key] += (tgt - e.pose[key]) * k;
      }

      // Gaze: follow the pointer when it moved recently, else slow wander.
      const recent = now - e.pointer.ts < 3200;
      const wx = Math.sin(t * 0.29) * 1.7 + Math.sin(t * 0.11) * 0.8;
      const wy = Math.cos(t * 0.21) * 1.1;
      const tx = recent ? e.pointer.x : wx;
      const ty = (recent ? e.pointer.y : wy) + (base.gazeBiasY ?? 0);
      const gk = 1 - Math.exp(-dt * 3.4);
      e.gaze.x += (tx - e.gaze.x) * gk;
      e.gaze.y += (ty - e.gaze.y) * gk;

      // Blink: a 160 ms triangle dip every few seconds.
      if (!e.blink.active && t >= e.blink.next) {
        e.blink.active = true;
        e.blink.phase = 0;
      }
      if (e.blink.active) {
        e.blink.phase += dt;
        if (e.blink.phase >= 0.16) {
          e.blink.active = false;
          e.blink.next = t + 2.4 + Math.random() * 4.2;
        }
      }
      const bm = e.blink.active ? Math.max(0.05, Math.abs(1 - 2 * (e.blink.phase / 0.16))) : 1;

      paint(e, t, bm, paintersRef.current);
    };

    const startLoop = () => {
      if (e.reduced) {
        staticPaint();
        return;
      }
      if (e.running) return;
      e.running = true;
      e.last = 0;
      const step = (now: number) => {
        tick(now);
        e.raf = requestAnimationFrame(step);
      };
      e.raf = requestAnimationFrame(step);
    };
    const stopLoop = () => {
      e.running = false;
      cancelAnimationFrame(e.raf);
    };

    const onMove = (ev: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      e.pointer.x = clamp(((ev.clientX - (r.left + r.width / 2)) / 60) * 3.4, -3.4, 3.4);
      e.pointer.y = clamp(((ev.clientY - (r.top + r.height / 2)) / 60) * 3.0, -3.0, 3.0);
      e.pointer.ts = performance.now();
    };
    const onVis = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    startLoop();
    if (!collapsedRef.current) scheduleNextTip(2600);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      stopLoop();
      clearTimers();
      engineRef.current = null;
    };
  }, []);

  const poke = () => {
    if (collapsedRef.current) {
      expand();
      return;
    }
    clearTimers();
    const text = PRAISE[praiseIdx.current++ % PRAISE.length];
    setBubble({ text, mood: "excited" });
    hideTimer.current = window.setTimeout(() => {
      setBubble(null);
      scheduleNextTip(TIP_GAP_MS + Math.random() * TIP_GAP_JITTER_MS);
    }, 3000);
  };

  const expand = () => {
    setCollapsed(false);
    scheduleNextTip(2600);
  };

  const collapseBuddy = () => {
    clearTimers();
    setBubble(null);
    setCollapsed(true);
  };

  const dismiss = () => {
    clearTimers();
    setBubble(null);
    scheduleNextTip(15000);
  };

  if (!mounted) return null;

  return createPortal(
    // Positioning: mobile floats above the dev-tools badge at the corner; on
    // lg+ the left rail (300px) owns the corner, so the buddy docks to the
    // content column instead. The calc tracks the centered max-w-7xl
    // container: (vw-1280)/2 + page padding 16 + sidebar 300 + gap 24.
    <div
      ref={wrapRef}
      data-seeq="1"
      className="fixed bottom-14 left-3 z-[55] lg:bottom-4 lg:left-[max(340px,calc((100vw-1280px)/2+340px))]"
    >
      <div className="flex items-end gap-2">
        <div className="group relative shrink-0">
          <button
            type="button"
            onClick={poke}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Open SeeQ study buddy" : "SeeQ study buddy"}
            className={
              "block cursor-pointer touch-manipulation select-none rounded-full outline-none transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-400/60 " +
              (collapsed ? "h-11 w-11" : "h-24 w-24 sm:h-28 sm:w-28")
            }
          >
            <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible" aria-hidden>
              <defs>
                <radialGradient id="seeq-body" cx="38%" cy="30%" r="80%">
                  <stop offset="0%" stopColor="#4be3ae" />
                  <stop offset="55%" stopColor="#17b57f" />
                  <stop offset="100%" stopColor="#0a7d58" />
                </radialGradient>
              </defs>
              <ellipse ref={shadowRef} cx="60" cy="110" rx="24" ry="4.6" fill="#000" opacity="0.35" />
              <g ref={bodyGRef}>
                <path ref={bodyRef} d={INITIAL_D} fill="url(#seeq-body)" />
                <g ref={eyeGRef}>
                  <ellipse ref={eyeLRef} cx="48.5" cy="60" rx="5.6" ry="9" fill="#f4fdfa" />
                  <ellipse ref={eyeRRef} cx="71.5" cy="60" rx="5.6" ry="9" fill="#f4fdfa" />
                </g>
                <path
                  ref={mouthCurveRef}
                  d=""
                  fill="none"
                  stroke="#053b2b"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  opacity="0"
                />
                <ellipse ref={mouthOpenRef} cx="60" cy="77" rx="3.1" ry="4" fill="#053b2b" opacity="0" />
                <ellipse ref={cheekLRef} cx="42.5" cy="70" rx="4.6" ry="2.8" fill="#fb7185" opacity="0" />
                <ellipse ref={cheekRRef} cx="77.5" cy="70" rx="4.6" ry="2.8" fill="#fb7185" opacity="0" />
              </g>
            </svg>
          </button>
          {!collapsed && (
            <button
              type="button"
              onClick={collapseBuddy}
              aria-label="Collapse SeeQ"
              title="Collapse SeeQ"
              className="absolute -right-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 opacity-0 transition-all hover:border-zinc-600 hover:text-zinc-200 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <Minus className="h-3 w-3" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {bubble && !collapsed && (
            <motion.div
              data-seeq-bubble="1"
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="pointer-events-auto relative mb-2 w-56 max-w-[62vw] rounded-2xl rounded-bl-md border border-zinc-800 bg-zinc-900/95 p-3 pr-7 shadow-xl shadow-black/40 backdrop-blur"
            >
              <p aria-live="polite" className="text-[12.5px] leading-relaxed text-zinc-200">
                {bubble.text}
              </p>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss tip"
                className="absolute right-1.5 top-1.5 rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>,
    document.body,
  );
}
