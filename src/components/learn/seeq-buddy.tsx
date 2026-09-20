"use client";

// SeeQ — the SeeQL study buddy.
//
// A soft blob that lives in the corner: it breathes, blinks, its gaze wanders
// (and follows the pointer), it reacts to mood, and every so often it shares
// a short coaching tip. Poke it and it cheers you on.
//
// All motion math lives in seeq-engine.tsx (bloub-grade: perfect-circle body,
// 3D sphere-projected capsule eyes, deterministic blink calendar, blink-cut
// mood morphs, easeOutQuint-only transitions). This file is the BEHAVIOUR:
// coaching tips, poke, collapse, persistence, and pointer follow. It joins
// the shared SeeQ ticker — one rAF for every SeeQ on the page.
//
// Honours prefers-reduced-motion (one static frame, no loop). Collapsible
// (persisted); speech pauses while collapsed. React never re-renders per
// frame: geometry is painted straight onto SVG attributes. The body colour
// follows seeql.buddy.theme — the mascot gallery re-skins it live.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, X } from "lucide-react";
import {
  advanceMood,
  clamp,
  easeOutQuint,
  emptyPainters,
  FOLLOW_PITCH,
  getBuddyTheme,
  INITIAL_BODY_D,
  BODY_CX,
  cutMood,
  LOOK_MORPH,
  lerp,
  MOODS,
  paint,
  PITCH_MAX,
  prefersReducedMotion,
  seeqSubscribe,
  subscribeBuddyTheme,
  THEMES,
  IDLE,
  YAW_MAX,
  type Engine,
  type Look,
  type Mood,
  type ThemeId,
} from "./seeq-engine";

// ---- coach tips (warm, app-aware, no emoji) ------------------------------

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
  { mood: "surprised", text: "New look? The Meet SeeQ gallery up top re-skins me in any colour you like." },
];

const PRAISE = [
  "Ready for one more query?",
  "You've got this — one table at a time.",
  "Slow queries fear you, you know.",
  "Small steps daily beat marathons on Sunday.",
  "Poke received. Morale restored.",
];

// ---- component -----------------------------------------------------------

const COLLAPSE_KEY = "seeql.buddy.collapsed";
const TIP_HOLD_MS = 8200;
const TIP_GAP_MS = 22000;
const TIP_GAP_JITTER_MS = 14000;

/** No-op store subscription for the client gate (nothing to subscribe to). */
const emptySubscribe = () => () => {};

export function SeeqBuddy() {
  // SSR-safe client gate: no effect, no state — the server snapshot renders null.
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  // Body colour, owned by the gallery. Reactive without setState-in-effect.
  const theme = useSyncExternalStore(subscribeBuddyTheme, getBuddyTheme, () => "emerald" as ThemeId);
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
  const shadowRef = useRef<SVGEllipseElement | null>(null);
  const eyeLRef = useRef<SVGPathElement | null>(null);
  const eyeRRef = useRef<SVGPathElement | null>(null);
  const mouthGRef = useRef<SVGGElement | null>(null);
  const mouthCurveRef = useRef<SVGPathElement | null>(null);
  const mouthOpenRef = useRef<SVGEllipseElement | null>(null);
  const cheekLRef = useRef<SVGEllipseElement | null>(null);
  const cheekRRef = useRef<SVGEllipseElement | null>(null);

  const engineRef = useRef<Engine | null>(null);
  const paintersRef = useRef(emptyPainters());
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
    e.pose = collapsedRef.current
      ? { ...MOODS[moodRef.current], mouthShow: 0 }
      : { ...MOODS[moodRef.current] };
    paint(e, 1.3, paintersRef.current, "circle");
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

  // Mount: join the shared ticker and begin the tip cycle.
  useEffect(() => {
    paintersRef.current = {
      body: bodyRef.current,
      shadow: shadowRef.current,
      eyeL: eyeLRef.current,
      eyeR: eyeRRef.current,
      mouthG: mouthGRef.current,
      mouthCurve: mouthCurveRef.current,
      mouthOpen: mouthOpenRef.current,
      cheekL: cheekLRef.current,
      cheekR: cheekRRef.current,
    };

    const e: Engine = {
      mood: "idle",
      frozen: null,
      tMood: 0,
      blinkAt: -10,
      pose: { ...IDLE },
      look: { yaw: IDLE.yaw, pitch: IDLE.pitch, mix: 0, wander: 1 },
      lookT: { yaw: IDLE.yaw, pitch: IDLE.pitch, mix: 0, wander: 1 },
      lookPrev: { yaw: IDLE.yaw, pitch: IDLE.pitch, mix: 0, wander: 1 },
      lookAt: -10,
      pointer: null,
      reduced: prefersReducedMotion(),
      phase: 0,
      pts: 64,
    };
    engineRef.current = e;

    /** Re-pose the look from the CURRENT interpolated value, or the gaze
     * would step backwards one catch-up per pointer move and tremble. The
     * effective look for this frame is the value caught up to `t` — each
     * frame advances easeOutQuint(dt/morph) of the remaining gap. */
    const setLook = (look: Look, t: number) => {
      const k = easeOutQuint(clamp((t - e.lookAt) / LOOK_MORPH));
      const cur: Look = {
        yaw: lerp(e.lookPrev.yaw, e.lookT.yaw, k),
        pitch: lerp(e.lookPrev.pitch, e.lookT.pitch, k),
        mix: lerp(e.lookPrev.mix, e.lookT.mix, k),
        wander: lerp(e.lookPrev.wander, e.lookT.wander, k),
      };
      e.lookPrev = cur;
      e.lookT = look;
      e.lookAt = t;
      e.look = cur;
    };

    const aim = (t: number) => {
      const el = wrapRef.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      // A zero-surface box (hidden tab) would make the normalisation 0/0 —
      // a NaN here would poison the engine for good.
      if (box.width === 0 || box.height === 0) return;
      if (e.pointer) {
        const nx = clamp((e.pointer.x - (box.left + box.width / 2)) / Math.max(1, window.innerWidth / 2), -1, 1);
        const ny = clamp((e.pointer.y - (box.top + box.height / 2)) / Math.max(1, window.innerHeight / 2), -1, 1);
        setLook({ yaw: nx * YAW_MAX, pitch: FOLLOW_PITCH - ny * PITCH_MAX, mix: 1, wander: 0 }, t);
      } else {
        setLook({ yaw: IDLE.yaw, pitch: IDLE.pitch, mix: 0, wander: 1 }, t);
      }
    };

    const tick = (t: number) => {
      if (moodRef.current !== e.mood) {
        cutMood(e, t);
        e.mood = moodRef.current;
      }

      // Mood blend toward the (collapse-aware) target, then aim + paint.
      const target = collapsedRef.current
        ? { ...MOODS[e.mood], mouthShow: 0 }
        : MOODS[e.mood];
      advanceMood(e, t, target);
      aim(t);
      paint(e, t, paintersRef.current, "circle");
    };

    // Touch pointers are ignored: a lifted finger would freeze the gaze on
    // its last spot, which reads as a bug.
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerType === "touch") return;
      e.pointer = { x: ev.clientX, y: ev.clientY };
    };
    const onLeave = () => {
      e.pointer = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    let unsubTick: (() => void) | null = null;
    if (e.reduced) {
      staticPaint();
    } else {
      unsubTick = seeqSubscribe(tick); // sleeps on document.hidden, shared loop
    }
    if (!collapsedRef.current) scheduleNextTip(2600);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      unsubTick?.();
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
  const th = THEMES[theme];

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
              (collapsed ? "h-11 w-11" : "h-28 w-28 sm:h-32 sm:w-32")
            }
          >
            <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible" aria-hidden>
              <defs>
                <radialGradient id="seeq-body" cx="38%" cy="30%" r="80%">
                  <stop offset="0%" stopColor={th.g0} />
                  <stop offset="55%" stopColor={th.g1} />
                  <stop offset="100%" stopColor={th.g2} />
                </radialGradient>
              </defs>
              <ellipse ref={shadowRef} cx={BODY_CX} cy="106" rx="23" ry="4.2" fill="#000" opacity="0.28" />
              <path ref={bodyRef} d={INITIAL_BODY_D} fill="url(#seeq-body)" />
              <path ref={eyeLRef} d="" fill={th.eye} transform="" />
              <path ref={eyeRRef} d="" fill={th.eye} transform="" />
              <g ref={mouthGRef}>
                <path
                  ref={mouthCurveRef}
                  d=""
                  fill="none"
                  stroke={th.ink}
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  opacity="0"
                />
                <ellipse ref={mouthOpenRef} cx={BODY_CX} cy="77.5" rx="3.4" ry="1.4" fill={th.ink} opacity="0" />
                <ellipse ref={cheekLRef} cx="41" cy="67" rx="4.8" ry="2.9" fill={th.cheek} opacity="0" />
                <ellipse ref={cheekRRef} cx="79" cy="67" rx="4.8" ry="2.9" fill={th.cheek} opacity="0" />
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
