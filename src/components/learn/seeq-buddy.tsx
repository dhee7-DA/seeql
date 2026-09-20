"use client";

// SeeQ — the SeeQL study buddy, motion engine v2.
//
// A soft emerald blob that lives in the corner: it breathes, blinks, its gaze
// wanders (and follows the pointer), it reacts to mood, and every so often it
// shares a short coaching tip. Poke it and it cheers you on.
//
// The motion techniques follow the measurements documented by the MIT project
// "bloub" (https://github.com/jeremy-prt/bloub, © Jérémy Perret — technique
// only, this character is our own):
//
// - The body is a PERFECT circle (radial deviation < 0.7% on the reference),
//   sampled at 64 angles and drawn as one closed Catmull-Rom. Lumpy "organic"
//   silhouettes read as deformed, not alive.
// - At rest the body is still: breath is 0.5% of height, drift is sub-pixel.
//   All the life comes from gaze drift and blinking.
// - The eyes are capsules projected onto a rotating head sphere (yaw/pitch/
//   roll). Position, compression and lean all fall out of the orthographic
//   projection — eyes slide and squash near the sphere edge instead of
//   translating flatly.
// - Blinks come from a deterministic schedule (1.9–4.6 s apart, occasional
//   double-blinks), close fast and reopen slower, and never fully close.
//   Mood changes are masked by a forced blink, exactly like a cut.
// - Every transition is a pure easeOutQuint — the body never overshoots.
//   An interrupted morph freezes its composite and re-blends from it, so
//   rapid mood changes can't jump.
//
// Honours prefers-reduced-motion (one static frame, no loop). Collapsible
// (persisted); speech pauses while collapsed. React never re-renders per
// frame: geometry is painted straight onto SVG attributes.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, X } from "lucide-react";

// ---- small math --------------------------------------------------------

const TAU = Math.PI * 2;

const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Short rounding: halves the weight of 60 fps path strings. */
const r2 = (v: number) => Math.round(v * 100) / 100;

/** Measured on the reference: transitions are pure ease-out, no overshoot. */
const easeOutQuint = (t: number) => 1 - (1 - t) ** 5;

/** 1D periodic noise, seamless over `period` seconds — harmonics are prime
 * relative to each other, so the drift never visibly repeats. */
function loopNoise(t: number, period: number, seed = 0): number {
  const p = (t / period) * TAU;
  return (
    0.55 * Math.sin(p + seed) +
    0.3 * Math.sin(2 * p + seed * 1.7 + 1.1) +
    0.15 * Math.sin(3 * p + seed * 2.3 + 2.4)
  );
}

/** Deterministic PRNG (mulberry32) — same blink calendar every visit. */
function createRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- blink -------------------------------------------------------------

const BLINK_RNG = createRng(0x5eed);
/** Pre-drawn blink calendar: 1.9–4.6 s apart, 18% chance of a double-blink. */
const BLINKS: number[] = (() => {
  const out: number[] = [];
  let t = 1.4;
  while (t < 900) {
    out.push(t);
    t += 1.9 + BLINK_RNG() * 2.7;
    if (BLINK_RNG() < 0.18) {
      out.push(t);
      t += 0.24;
    }
  }
  return out;
})();

const BLINK_DUR = 0.18;

/** Lid over time: closes fast (45% of the dip), reopens a touch slower. */
function blinkLid(t: number): number {
  for (let i = 0; i < BLINKS.length; i++) {
    const start = BLINKS[i]!;
    if (t < start) break;
    const k = (t - start) / BLINK_DUR;
    if (k >= 0 && k <= 1) {
      return k < 0.45 ? 1 - k / 0.45 : (k - 0.45) / 0.55;
    }
  }
  return 1;
}

/** A blink is a screen-space vertical squash; the eye never fully shuts. */
const blinkScale = (lid: number) => 0.06 + 0.94 * clamp(lid);

// ---- geometry ----------------------------------------------------------

/** Closed Catmull-Rom → cubics. 64 points: smooth to the pixel at any size. */
function closedPath(pts: [number, number][], tension = 1 / 6): string {
  const n = pts.length;
  let d = `M${r2(pts[0]![0])} ${r2(pts[0]![1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!;
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % n]!;
    const p3 = pts[(i + 2) % n]!;
    const c1x = p1[0] + (p2[0] - p0[0]) * tension;
    const c1y = p1[1] + (p2[1] - p0[1]) * tension;
    const c2x = p2[0] - (p3[0] - p1[0]) * tension;
    const c2y = p2[1] - (p3[1] - p1[1]) * tension;
    d += `C${r2(c1x)} ${r2(c1y)} ${r2(c2x)} ${r2(c2y)} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return `${d}Z`;
}

const N_PTS = 64;
const BODY_CX = 60;
const BODY_CY = 58;
const BODY_R = 40;

/** The body: a perfect circle (plus squash/breath applied by the caller). */
function bodyPath(cx: number, cy: number, sx: number, sy: number): string {
  const pts: [number, number][] = new Array(N_PTS);
  for (let i = 0; i < N_PTS; i++) {
    const a = (i / N_PTS) * TAU;
    pts[i] = [cx + Math.cos(a) * BODY_R * sx, cy + Math.sin(a) * BODY_R * sy];
  }
  return closedPath(pts);
}

const INITIAL_D = bodyPath(BODY_CX, BODY_CY, 1, 1);

/** Capsule (stadium) centred on the origin — the exact shape of the eyes. */
function capsulePath(w: number, h: number): string {
  const hw = Math.max(w, 0.01) / 2;
  const hh = Math.max(h, 0.01) / 2;
  const r = Math.min(hw, hh);
  return (
    `M${r2(-hw)} ${r2(-hh + r)}` +
    `A${r2(r)} ${r2(r)} 0 0 1 ${r2(-hw + r)} ${r2(-hh)}` +
    `L${r2(hw - r)} ${r2(-hh)}` +
    `A${r2(r)} ${r2(r)} 0 0 1 ${r2(hw)} ${r2(-hh + r)}` +
    `L${r2(hw)} ${r2(hh - r)}` +
    `A${r2(r)} ${r2(r)} 0 0 1 ${r2(hw - r)} ${r2(hh)}` +
    `L${r2(-hw + r)} ${r2(hh)}` +
    `A${r2(r)} ${r2(r)} 0 0 1 ${r2(-hw)} ${r2(hh - r)}Z`
  );
}

// ---- head sphere -------------------------------------------------------

type Vec3 = [number, number, number];

/** Rotate two orthonormal vectors within their common plane. */
function spin(u: Vec3, v: Vec3, angle: number): [Vec3, Vec3] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s],
    [v[0] * c - u[0] * s, v[1] * c - u[1] * s, v[2] * c - u[2] * s],
  ];
}

export interface HeadGaze {
  yaw: number; // deg, positive = looks right
  pitch: number; // deg, positive = looks up
  roll: number; // deg, head tilt
}

interface EyePose {
  /** centre on the unit sphere, screen space */
  x: number;
  y: number;
  /** tangent frame columns, for SVG matrix(a,b,c,d,e,f) */
  a: number;
  b: number;
  c: number;
  d: number;
  /** z of the eye normal: fades/reads the limb */
  depth: number;
}

const deg = (d: number) => (d * Math.PI) / 180;

/** Two eyes on a sphere of radius 1, separated by `split` degrees each side
 * of the forward ray. The tangent projection gives position, lean and
 * edge compression at once — no flat translation anywhere. */
function eyePoses(gaze: HeadGaze, split: number): [EyePose, EyePose] {
  let f: Vec3 = [0, 0, 1];
  let right: Vec3 = [1, 0, 0];
  let down: Vec3 = [0, 1, 0];

  [f, right] = spin(f, right, deg(gaze.yaw));
  [down, f] = spin(down, f, deg(gaze.pitch));
  [right, down] = spin(right, down, deg(gaze.roll));

  const build = (side: number): EyePose => {
    const [ef, er] = spin(f, right, deg(split * side));
    return {
      x: ef[0],
      y: ef[1],
      a: er[0],
      b: er[1],
      c: down[0],
      d: down[1],
      depth: ef[2],
    };
  };

  return [build(-1), build(1)];
}

// ---- moods -------------------------------------------------------------

type Mood = "idle" | "happy" | "excited" | "thinking" | "sad" | "wink";

/** Everything a mood can move. Eye sizes are fractions of the body radius. */
interface MoodPose {
  yaw: number;
  pitch: number;
  roll: number;
  split: number;
  wL: number;
  hL: number;
  wR: number;
  hR: number;
  tiltL: number; // per-eye lean; mirrored pairs make arcs, droops, scowls
  tiltR: number;
  mouth: number; // -1 frown .. 1 smile
  mouthShow: number;
  mouthOpen: number; // 0 closed .. 1 "o"
  cheeks: number;
  bounce: number; // excited squash-and-stretch
}

const IDLE: MoodPose = {
  yaw: 8, pitch: 12, roll: -8,
  split: 14.5,
  wL: 0.19, hL: 0.42, wR: 0.19, hR: 0.42,
  tiltL: 0, tiltR: 0,
  mouth: 0, mouthShow: 0, mouthOpen: 0, cheeks: 0, bounce: 0,
};

const MOODS: Record<Mood, MoodPose> = {
  idle: IDLE,
  happy: {
    ...IDLE,
    yaw: 4, pitch: 17, roll: -4, split: 16,
    wL: 0.26, hL: 0.16, wR: 0.26, hR: 0.16,
    tiltL: 14, tiltR: -14, // tops converge: ^ ^ squint-smile
    mouth: 0.9, mouthShow: 1, cheeks: 0.65,
  },
  excited: {
    ...IDLE,
    yaw: 3, pitch: 20, roll: 0, split: 17.5,
    wL: 0.32, hL: 0.5, wR: 0.32, hR: 0.5,
    tiltL: -8, tiltR: 8, // tops diverge: wide-eyed
    mouthOpen: 1, mouthShow: 0, cheeks: 1, bounce: 1,
  },
  thinking: {
    ...IDLE,
    yaw: -16, pitch: 16, roll: -18, split: 14,
    wL: 0.17, hL: 0.36, wR: 0.13, hR: 0.27,
    tiltL: 8, tiltR: 4,
    mouth: 0.15, mouthShow: 1, cheeks: 0,
  },
  sad: {
    ...IDLE,
    yaw: 4, pitch: -6, roll: 0, split: 16,
    wL: 0.2, hL: 0.38, wR: 0.2, hR: 0.38,
    tiltL: -24, tiltR: 24, // tops diverge outward: drooping
    mouth: -0.85, mouthShow: 1, cheeks: 0,
  },
  wink: {
    ...IDLE,
    yaw: -6, pitch: 12, roll: -10, split: 15,
    wL: 0.19, hL: 0.42, wR: 0.3, hR: 0.06, // right eye: a dash, wider than open
    mouth: 0.6, mouthShow: 1, cheeks: 0.5,
  },
};

const MOOD_KEYS = Object.keys(IDLE) as (keyof MoodPose)[];

function blendMood(a: MoodPose, b: MoodPose, t: number): MoodPose {
  const out: MoodPose = { ...a };
  for (const k of MOOD_KEYS) out[k] = lerp(a[k], b[k], t);
  return out;
}

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
];

const PRAISE = [
  "Ready for one more query?",
  "You've got this — one table at a time.",
  "Slow queries fear you, you know.",
  "Small steps daily beat marathons on Sunday.",
  "Poke received. Morale restored.",
];

// ---- engine --------------------------------------------------------------

const MOOD_MORPH = 0.45; // s — mood crossfade, masked by a forced blink
const LOOK_MORPH = 0.24; // s — pointer catch-up: attentive, not visquous

/** Pointer-follow range: above the drift amplitudes, below the limb. */
const YAW_MAX = 16;
const PITCH_MAX = 13;
const FOLLOW_PITCH = 10; // gaze height with the cursor centred

interface Look {
  yaw: number;
  pitch: number;
  mix: number; // 1 = pointer commands the direction
  wander: number; // 1 = idle drift alive (fades while following)
}

interface Engine {
  mood: Mood;
  frozen: MoodPose | null; // composite snapshot, for interrupted morphs
  tMood: number;
  blinkAt: number; // forced blink (mood cut) timestamp, s
  pose: MoodPose;
  look: Look; // current interpolated look
  lookT: Look; // target look
  lookPrev: Look;
  lookAt: number;
  pointer: { x: number; y: number } | null;
  raf: number;
  last: number;
  running: boolean;
  reduced: boolean;
}

interface Painters {
  body: SVGPathElement | null;
  shadow: SVGEllipseElement | null;
  eyeL: SVGPathElement | null;
  eyeR: SVGPathElement | null;
  mouthG: SVGGElement | null;
  mouthCurve: SVGPathElement | null;
  mouthOpen: SVGEllipseElement | null;
  cheekL: SVGEllipseElement | null;
  cheekR: SVGEllipseElement | null;
}

function setAttr(el: Element | null, name: string, v: string) {
  el?.setAttribute(name, v);
}

function paintEye(
  el: SVGPathElement | null,
  pose: EyePose,
  w: number,
  h: number,
  tilt: number,
  lid: number,
  driftX: number,
  driftY: number,
) {
  if (!el) return;
  const k = blinkScale(lid);
  const phi = deg(tilt);
  const cp = Math.cos(phi);
  const sp = Math.sin(phi);
  // per-eye lean: compose the tangent frame with an in-plane rotation
  const ax = pose.a * cp + pose.c * sp;
  const ay = pose.b * cp + pose.d * sp;
  const bx = -pose.a * sp + pose.c * cp;
  const by = -pose.b * sp + pose.d * cp;
  const tx = BODY_CX + pose.x * BODY_R + driftX * BODY_R;
  const ty = BODY_CY + pose.y * BODY_R + driftY * BODY_R;
  el.setAttribute("d", capsulePath(w * BODY_R, h * BODY_R));
  el.setAttribute(
    "transform",
    `matrix(${r2(ax)},${r2(ay * k)},${r2(bx)},${r2(by * k)},${r2(tx)},${r2(ty)})`,
  );
  el.setAttribute("opacity", r2(clamp(pose.depth / 0.12)).toFixed(2));
}

function paint(e: Engine, t: number, P: Painters) {
  const p = e.pose;

  // Body: still at rest. Breath is 0.5% of height; drift is sub-pixel.
  const breath = 1 + Math.sin((t / 3.4) * TAU) * 0.005;
  const driftX = loopNoise(t, 7.9, 1.9) * 0.006;
  const driftY = loopNoise(t, 5.3, 0.3) * 0.007;
  const sq = p.bounce * 0.055 * Math.abs(Math.sin(t * 5.2));
  const sx = 1 + sq;
  const sy = (1 - sq * 0.85) * breath;
  setAttr(
    P.body,
    "d",
    bodyPath(BODY_CX + driftX * BODY_R, BODY_CY + driftY * BODY_R, sx, sy),
  );
  setAttr(P.shadow, "rx", r2(23 * (2 - sy)).toFixed(2));

  // Gaze: pose direction, replaced by the pointer look via mix, drift on top.
  const wander = e.look.wander;
  const yaw =
    lerp(p.yaw, e.look.yaw, e.look.mix) +
    (loopNoise(t, 11.3, 0.4) * 5.5 + loopNoise(t, 3.7, 2.1) * 1.6) * wander;
  const pitch =
    lerp(p.pitch, e.look.pitch, e.look.mix) +
    (loopNoise(t, 9.1, 1.3) * 4.2 + loopNoise(t, 4.3, 0.7) * 1.3) * wander;
  const roll = p.roll + loopNoise(t, 13.7, 3.2) * 2.2 * wander;

  // Blink: scheduled, plus the forced cut that masks a mood morph.
  const forced = clamp((t - e.blinkAt) / 0.2);
  const forcedLid = forced < 1 ? Math.abs(forced * 2 - 1) : 1;
  const lid = Math.min(blinkLid(t), forcedLid);

  const [left, right] = eyePoses({ yaw, pitch, roll }, p.split);
  paintEye(P.eyeL, left, p.wL, p.hL, p.tiltL, lid, driftX, driftY);
  paintEye(P.eyeR, right, p.wR, p.hR, p.tiltR, lid, driftX, driftY);

  // Mouth and cheeks ride the head roll so the face stays coherent.
  setAttr(P.mouthG, "transform", `rotate(${r2(roll)} ${BODY_CX} ${BODY_CY})`);

  const open = clamp(p.mouthOpen, 0, 1);
  setAttr(P.mouthOpen, "ry", r2(1.2 + 3.4 * open).toFixed(2));
  setAttr(P.mouthOpen, "opacity", open > 0.12 ? "1" : "0");
  setAttr(
    P.mouthCurve,
    "d",
    `M 54 76 Q 60 ${r2(76 - 5.5 * p.mouth)} 66 76`,
  );
  setAttr(
    P.mouthCurve,
    "opacity",
    p.mouthShow > 0.5 && open <= 0.12 ? "1" : "0",
  );
  const cheek = (p.cheeks * 0.4).toFixed(3);
  setAttr(P.cheekL, "opacity", cheek);
  setAttr(P.cheekR, "opacity", cheek);
}

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
  const paintersRef = useRef<Painters>({
    body: null, shadow: null, eyeL: null, eyeR: null, mouthG: null,
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
    e.pose = collapsedRef.current
      ? { ...MOODS[moodRef.current], mouthShow: 0 }
      : { ...MOODS[moodRef.current] };
    paint(e, 1.3, paintersRef.current);
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
      raf: 0,
      last: 0,
      running: false,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
    engineRef.current = e;

    /** Mood cut: freeze the composite, re-target, and mask with a blink. */
    const setMood = (id: Mood, t: number) => {
      e.frozen = { ...e.pose };
      e.mood = id;
      e.tMood = t;
      e.blinkAt = t;
    };

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

    const tick = (now: number) => {
      const t = now / 1000;
      e.last = now;

      if (moodRef.current !== e.mood) setMood(moodRef.current, t);

      // Mood blend: pure easeOutQuint from the frozen composite — no overshoot,
      // and an interrupted morph re-blends from where it actually was.
      const target = collapsedRef.current
        ? { ...MOODS[e.mood], mouthShow: 0 }
        : MOODS[e.mood];
      const since = t - e.tMood;
      if (e.frozen && since < MOOD_MORPH) {
        e.pose = blendMood(e.frozen, target, easeOutQuint(since / MOOD_MORPH));
      } else {
        e.frozen = null;
        e.pose = target;
      }

      aim(t);

      paint(e, t, paintersRef.current);
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

    // Touch pointers are ignored: a lifted finger would freeze the gaze on
    // its last spot, which reads as a bug.
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerType === "touch") return;
      e.pointer = { x: ev.clientX, y: ev.clientY };
    };
    const onLeave = () => {
      e.pointer = null;
    };
    const onVis = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    startLoop();
    if (!collapsedRef.current) scheduleNextTip(2600);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
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
              (collapsed ? "h-11 w-11" : "h-28 w-28 sm:h-32 sm:w-32")
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
              <ellipse ref={shadowRef} cx={BODY_CX} cy="106" rx="23" ry="4.2" fill="#000" opacity="0.28" />
              <path ref={bodyRef} d={INITIAL_D} fill="url(#seeq-body)" />
              <path ref={eyeLRef} d="" fill="#f4fdfa" transform="" />
              <path ref={eyeRRef} d="" fill="#f4fdfa" transform="" />
              <g ref={mouthGRef}>
                <path
                  ref={mouthCurveRef}
                  d=""
                  fill="none"
                  stroke="#053b2b"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  opacity="0"
                />
                <ellipse ref={mouthOpenRef} cx={BODY_CX} cy="77.5" rx="3.4" ry="1.4" fill="#053b2b" opacity="0" />
                <ellipse ref={cheekLRef} cx="41" cy="67" rx="4.8" ry="2.9" fill="#fb7185" opacity="0" />
                <ellipse ref={cheekRRef} cx="79" cy="67" rx="4.8" ry="2.9" fill="#fb7185" opacity="0" />
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
