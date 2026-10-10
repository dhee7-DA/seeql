"use client";

// SeeQ motion engine — shared core extracted from the corner buddy so the
// mascot gallery can render many live SeeQs (shapes / expressions / colours)
// from ONE requestAnimationFrame loop.
//
// Motion techniques per the measurements documented by the MIT project
// "bloub" (https://github.com/jeremy-prt/bloub, © Jérémy Perret) — technique
// only; the character, shapes, palettes and expressions here are our own.
//
// Everything in this module is pure math or DOM writes: no React state per
// frame, no animation libraries. The component <SeeqSprite> renders one
// instance; each instance registers a tick on the shared ticker and is
// painted straight onto SVG attributes.

import { useEffect, useId, useMemo, useRef } from "react";

// ---- small math --------------------------------------------------------

const TAU = Math.PI * 2;

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Short rounding: halves the weight of 60 fps path strings. */
const r2 = (v: number) => Math.round(v * 100) / 100;

/** Measured on the reference: transitions are pure ease-out, no overshoot. */
export const easeOutQuint = (t: number) => 1 - (1 - t) ** 5;

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

/** Lid over time: closes fast (45% of the dip), reopens a touch slower.
 * `phase` de-syncs instances so a gallery of SeeQs never blinks in unison. */
function blinkLid(t: number, phase = 0): number {
  const s = t + phase;
  for (let i = 0; i < BLINKS.length; i++) {
    const start = BLINKS[i]!;
    if (s < start) break;
    const k = (s - start) / BLINK_DUR;
    if (k >= 0 && k <= 1) {
      return k < 0.45 ? 1 - k / 0.45 : (k - 0.45) / 0.55;
    }
  }
  return 1;
}

/** A blink is a screen-space vertical squash; the eye never fully shuts. */
const blinkScale = (lid: number) => 0.06 + 0.94 * clamp(lid);

// ---- geometry ----------------------------------------------------------

/** Closed Catmull-Rom → cubics. Sample count is per-instance: smooth to the
 * pixel at any size while a gallery stays cheap. */
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

export const BODY_CX = 60;
export const BODY_CY = 58;
export const BODY_R = 40;

// ---- shapes ------------------------------------------------------------
// Analytic, SMOOTH silhouettes in the spirit of a shape customizer: low-order
// harmonics and superellipses only. Every profile is peak-normalised so all
// shapes carry the same visual weight, and the face anchors to the centre —
// no lumpy organic noise anywhere (that reads as deformed, not alive).

export type ShapeId =
  | "circle"
  | "pebble"
  | "tall"
  | "wide"
  | "egg"
  | "drop"
  | "bean"
  | "squircle";

export interface SeeqShape {
  id: ShapeId;
  label: string;
  /** base stretch of the silhouette, x and y */
  aspect: [number, number];
  /** unit radius at angle a (SVG y grows down: sin>0 = bottom) */
  r: (a: number) => number;
  /** 1 / peak of r — applied by bodyPath so shapes weigh the same */
  k: number;
}

function peakOf(fn: (a: number) => number): number {
  let peak = 0;
  for (let i = 0; i < 256; i++) {
    const v = fn((i / 256) * TAU);
    if (v > peak) peak = v;
  }
  return peak;
}

function shape(id: ShapeId, label: string, aspect: [number, number], r: (a: number) => number): SeeqShape {
  return { id, label, aspect, r, k: 1 / peakOf(r) };
}

/** Superellipse (squircle): squarish but with continuous corners. */
function superellipse(n: number) {
  return (a: number) => (Math.abs(Math.cos(a)) ** n + Math.abs(Math.sin(a)) ** n) ** (-1 / n);
}

export const SHAPES: Record<ShapeId, SeeqShape> = {
  circle: shape("circle", "Circle", [1, 1], () => 1),
  pebble: shape(
    "pebble",
    "Pebble",
    [1, 1],
    (a) => 1 + 0.07 * Math.cos(2 * a + 2.1) + 0.045 * Math.cos(3 * a + 0.7),
  ),
  tall: shape("tall", "Tall", [0.86, 1.1], () => 1),
  wide: shape("wide", "Wide", [1.12, 0.88], () => 1),
  egg: shape("egg", "Egg", [1, 1.04], (a) => 1 + 0.1 * Math.sin(a)),
  drop: shape("drop", "Drop", [0.94, 1.05], (a) => 1 + 0.17 * Math.sin(a) + 0.05 * Math.cos(3 * a + Math.PI / 2)),
  bean: shape("bean", "Bean", [1.05, 0.97], (a) => 1 - 0.13 * Math.cos(a - 0.5) + 0.05 * Math.cos(2 * a + 0.9)),
  squircle: shape("squircle", "Squircle", [1.02, 1.02], superellipse(3.2)),
};

export const SHAPE_IDS = Object.keys(SHAPES) as ShapeId[];

/** The body: smooth profile + squash/breath, sampled at `n` angles. */
export function bodyPath(
  shapeId: ShapeId,
  cx: number,
  cy: number,
  sx: number,
  sy: number,
  n = 64,
): string {
  const s = SHAPES[shapeId];
  const pts: [number, number][] = new Array(n);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const rad = s.r(a) * s.k * BODY_R;
    pts[i] = [cx + Math.cos(a) * rad * sx * s.aspect[0], cy + Math.sin(a) * rad * sy * s.aspect[1]];
  }
  return closedPath(pts);
}

/** Initial buddy body (circle @ 64 samples) for the first SSR frame. */
export const INITIAL_BODY_D = bodyPath("circle", BODY_CX, BODY_CY, 1, 1, 64);

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
export function eyePoses(gaze: HeadGaze, split: number): [EyePose, EyePose] {
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

// ---- expressions ---------------------------------------------------------

export type Mood =
  | "idle" | "happy" | "excited" | "thinking" | "sad" | "wink"
  | "sleepy" | "surprised";

/** Everything an expression can move. Eye sizes are fractions of the radius. */
export interface MoodPose {
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

export const IDLE: MoodPose = {
  yaw: 8, pitch: 12, roll: -8,
  split: 14.5,
  wL: 0.19, hL: 0.42, wR: 0.19, hR: 0.42,
  tiltL: 0, tiltR: 0,
  mouth: 0, mouthShow: 0, mouthOpen: 0, cheeks: 0, bounce: 0,
};

export const MOODS: Record<Mood, MoodPose> = {
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
  sleepy: {
    ...IDLE,
    yaw: 2, pitch: 8, roll: 7, split: 14,
    wL: 0.2, hL: 0.09, wR: 0.2, hR: 0.11, // near-shut capsules: heavy lids
    tiltL: 10, tiltR: 10,
    mouth: 0.12, mouthShow: 1, cheeks: 0,
  },
  surprised: {
    ...IDLE,
    yaw: 0, pitch: 14, roll: 0, split: 17,
    wL: 0.3, hL: 0.52, wR: 0.3, hR: 0.52, // big round eyes
    tiltL: -4, tiltR: 4,
    mouthOpen: 0.85, mouthShow: 0, cheeks: 0, bounce: 0.3,
  },
};

export const EXPRESSIONS: { id: Mood; label: string }[] = [
  { id: "idle", label: "Calm" },
  { id: "happy", label: "Happy" },
  { id: "excited", label: "Excited" },
  { id: "thinking", label: "Thinking" },
  { id: "sad", label: "Sad" },
  { id: "wink", label: "Wink" },
  { id: "sleepy", label: "Sleepy" },
  { id: "surprised", label: "Surprised" },
];

const MOOD_KEYS = Object.keys(IDLE) as (keyof MoodPose)[];

function blendMood(a: MoodPose, b: MoodPose, t: number): MoodPose {
  const out: MoodPose = { ...a };
  for (const k of MOOD_KEYS) out[k] = lerp(a[k], b[k], t);
  return out;
}

// ---- colour themes --------------------------------------------------------

export type ThemeId = "emerald" | "blueberry" | "grape" | "sunset" | "rose" | "slate";

export interface SeeqTheme {
  id: ThemeId;
  label: string;
  /** radial gradient stops: highlight, mid, rim */
  g0: string;
  g1: string;
  g2: string;
  eye: string;
  ink: string; // mouth stroke + open-mouth fill
  cheek: string;
}

export const THEMES: Record<ThemeId, SeeqTheme> = {
  emerald: { id: "emerald", label: "Emerald", g0: "#4be3ae", g1: "#17b57f", g2: "#0a7d58", eye: "#f4fdfa", ink: "#053b2b", cheek: "#fb7185" },
  blueberry: { id: "blueberry", label: "Blueberry", g0: "#8fd0ff", g1: "#3f8fe3", g2: "#1c5ba6", eye: "#f2f9ff", ink: "#0a2d52", cheek: "#ff9d9d" },
  grape: { id: "grape", label: "Grape", g0: "#d9aefc", g1: "#a45ee5", g2: "#6d2fb0", eye: "#faf4ff", ink: "#2d0f4a", cheek: "#ff8fc6" },
  sunset: { id: "sunset", label: "Sunset", g0: "#ffd28a", g1: "#ff9552", g2: "#e05e1f", eye: "#fff8ef", ink: "#571f04", cheek: "#ff6b8a" },
  rose: { id: "rose", label: "Rose", g0: "#ffb9cc", g1: "#f66d97", g2: "#cf3a68", eye: "#fff5f7", ink: "#571028", cheek: "#ffd36e" },
  slate: { id: "slate", label: "Slate", g0: "#c3cede", g1: "#8792ac", g2: "#525c78", eye: "#f4f7fc", ink: "#1d2334", cheek: "#8fb3ff" },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

// ---- buddy theme store (reactive, lint-safe: no setState in effects) ------

const THEME_KEY = "seeql.buddy.theme";
const themeListeners = new Set<() => void>();

export function getBuddyTheme(): ThemeId {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v && v in THEMES ? (v as ThemeId) : "emerald";
  } catch {
    return "emerald";
  }
}

export function setBuddyTheme(id: ThemeId): void {
  try {
    localStorage.setItem(THEME_KEY, id);
  } catch {
    /* private mode — live switch still works */
  }
  for (const fn of themeListeners) fn();
}

export function subscribeBuddyTheme(fn: () => void): () => void {
  themeListeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    themeListeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

// ---- engine state ---------------------------------------------------------

export const MOOD_MORPH = 0.45; // s — mood crossfade, masked by a forced blink
export const LOOK_MORPH = 0.24; // s — pointer catch-up: attentive, not visquous

/** Pointer-follow range: above the drift amplitudes, below the limb. */
export const YAW_MAX = 16;
export const PITCH_MAX = 13;
export const FOLLOW_PITCH = 10; // gaze height with the cursor centred

export interface Look {
  yaw: number;
  pitch: number;
  mix: number; // 1 = pointer commands the direction
  wander: number; // 1 = idle drift alive (fades while following)
}

export interface Engine {
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
  reduced: boolean;
  phase: number; // blink-calendar offset, de-syncs instances
  pts: number; // body sample count (64 buddy, 40 sprites)
}

export interface Painters {
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

export const emptyPainters = (): Painters => ({
  body: null, shadow: null, eyeL: null, eyeR: null, mouthG: null,
  mouthCurve: null, mouthOpen: null, cheekL: null, cheekR: null,
});

function setAttr(el: Element | null, name: string, v: string) {
  el?.setAttribute(name, v);
}

/** Pure eye geometry — shared by the per-frame painter and the SSR frame. */
function eyeAttrs(
  pose: EyePose,
  w: number,
  h: number,
  tilt: number,
  lid: number,
  driftX: number,
  driftY: number,
) {
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
  return {
    d: capsulePath(w * BODY_R, h * BODY_R),
    transform: `matrix(${r2(ax)},${r2(ay * k)},${r2(bx)},${r2(by * k)},${r2(tx)},${r2(ty)})`,
    opacity: clamp(pose.depth / 0.12).toFixed(2),
  };
}

/** Mood cut: freeze the composite and mask the morph with a forced blink.
 * The caller sets e.mood first (or after — both orders work). */
export function cutMood(e: Engine, t: number) {
  e.frozen = { ...e.pose };
  e.tMood = t;
  e.blinkAt = t;
}

/** Advance the mood blend toward `target`: pure easeOutQuint from the frozen
 * composite — no overshoot; an interrupted morph re-blends from where it
 * actually was, so rapid mood changes can't jump. */
export function advanceMood(e: Engine, t: number, target: MoodPose) {
  const since = t - e.tMood;
  if (e.frozen && since < MOOD_MORPH) {
    e.pose = blendMood(e.frozen, target, easeOutQuint(since / MOOD_MORPH));
  } else {
    e.frozen = null;
    e.pose = target;
  }
}

/** Paint one frame of one SeeQ onto the SVG attributes. */
export function paint(e: Engine, t: number, P: Painters, shapeId: ShapeId) {
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
    bodyPath(shapeId, BODY_CX + driftX * BODY_R, BODY_CY + driftY * BODY_R, sx, sy, e.pts),
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
  const lid = Math.min(blinkLid(t, e.phase), forcedLid);

  const [left, right] = eyePoses({ yaw, pitch, roll }, p.split);
  const al = eyeAttrs(left, p.wL, p.hL, p.tiltL, lid, driftX, driftY);
  const ar = eyeAttrs(right, p.wR, p.hR, p.tiltR, lid, driftX, driftY);
  if (P.eyeL) {
    P.eyeL.setAttribute("d", al.d);
    P.eyeL.setAttribute("transform", al.transform);
    P.eyeL.setAttribute("opacity", al.opacity);
  }
  if (P.eyeR) {
    P.eyeR.setAttribute("d", ar.d);
    P.eyeR.setAttribute("transform", ar.transform);
    P.eyeR.setAttribute("opacity", ar.opacity);
  }

  // Mouth and cheeks ride the head roll so the face stays coherent.
  setAttr(P.mouthG, "transform", `rotate(${r2(roll)} ${BODY_CX} ${BODY_CY})`);

  const open = clamp(p.mouthOpen, 0, 1);
  setAttr(P.mouthOpen, "ry", r2(1.2 + 3.4 * open).toFixed(2));
  setAttr(P.mouthOpen, "opacity", open > 0.12 ? "1" : "0");
  setAttr(P.mouthCurve, "d", `M 54 76 Q 60 ${r2(76 - 5.5 * p.mouth)} 66 76`);
  setAttr(P.mouthCurve, "opacity", p.mouthShow > 0.5 && open <= 0.12 ? "1" : "0");
  const cheek = (p.cheeks * 0.4).toFixed(3);
  setAttr(P.cheekL, "opacity", cheek);
  setAttr(P.cheekR, "opacity", cheek);
}

// ---- shared ticker --------------------------------------------------------
// ONE requestAnimationFrame loop drives every live SeeQ on the page. It
// sleeps when the tab hides and when the last subscriber leaves.

type SeeqTick = (t: number) => void;
const tickers = new Set<SeeqTick>();
let rafId = 0;
let looping = false;

function frame(now: number) {
  const t = now / 1000;
  for (const fn of tickers) fn(t);
  rafId = requestAnimationFrame(frame);
}

function wake() {
  if (looping || tickers.size === 0) return;
  if (typeof document !== "undefined" && document.hidden) return;
  looping = true;
  rafId = requestAnimationFrame(frame);
}

function sleep() {
  if (!looping) return;
  looping = false;
  cancelAnimationFrame(rafId);
}

let visBound = false;
function onVis() {
  if (document.hidden) sleep();
  else wake();
}

export function seeqSubscribe(fn: SeeqTick): () => void {
  tickers.add(fn);
  if (!visBound && typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVis);
    visBound = true;
  }
  wake();
  return () => {
    tickers.delete(fn);
    if (tickers.size === 0) sleep();
  };
}

/** True when the OS asks for reduced motion (callers paint a static frame). */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Pure, SSR-safe first frame for one shape/expression combo. */
function staticFrame(shapeId: ShapeId, expression: Mood) {
  const p = MOODS[expression];
  const [L, R] = eyePoses({ yaw: p.yaw, pitch: p.pitch, roll: p.roll }, p.split);
  return {
    bodyD: bodyPath(shapeId, BODY_CX, BODY_CY, 1, 1, 40),
    eyeL: eyeAttrs(L, p.wL, p.hL, p.tiltL, 1, 0, 0),
    eyeR: eyeAttrs(R, p.wR, p.hR, p.tiltR, 1, 0, 0),
    mouthD: `M 54 76 Q 60 ${r2(76 - 5.5 * p.mouth)} 66 76`,
    mouthShow: p.mouthShow > 0.5 && p.mouthOpen <= 0.12,
    openRy: r2(1.2 + 3.4 * clamp(p.mouthOpen)).toFixed(2),
    openShow: p.mouthOpen > 0.12,
    cheeks: (p.cheeks * 0.4).toFixed(3),
    roll: p.roll,
  };
}

// ---- SeeqSprite -----------------------------------------------------------

export interface SeeqSpriteProps {
  shape?: ShapeId;
  expression?: Mood;
  theme?: ThemeId;
  /** rendered square size, px */
  size?: number;
  className?: string;
}

/** One live SeeQ. SSR renders a real static frame; on the client the sprite
 * joins the shared ticker — but only while on screen (IntersectionObserver),
 * and never at all under prefers-reduced-motion. */
export function SeeqSprite({
  shape = "circle",
  expression = "idle",
  theme = "emerald",
  size = 96,
  className,
}: SeeqSpriteProps) {
  const gid = `seeq-g${useId().replace(/:/g, "")}`;
  const th = THEMES[theme];
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
  const paintersRef = useRef<Painters>(emptyPainters());
  const engineRef = useRef<Engine | null>(null);
  const moodRef = useRef<Mood>(expression);
  const shapeRef = useRef<ShapeId>(shape);

  const init = useMemo(() => staticFrame(shape, expression), [shape, expression]);

  // Mount: engine + (unless reduced motion) an on-screen-gated subscription.
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
    const reduced = prefersReducedMotion();
    const e: Engine = {
      mood: moodRef.current,
      frozen: null,
      tMood: 0,
      blinkAt: -10,
      pose: { ...MOODS[moodRef.current] },
      look: { yaw: IDLE.yaw, pitch: IDLE.pitch, mix: 0, wander: 1 },
      lookT: { yaw: IDLE.yaw, pitch: IDLE.pitch, mix: 0, wander: 1 },
      lookPrev: { yaw: IDLE.yaw, pitch: IDLE.pitch, mix: 0, wander: 1 },
      lookAt: -10,
      pointer: null,
      reduced,
      phase: 2.6 + Math.random() * 9.4,
      pts: 40,
    };
    engineRef.current = e;
    if (reduced) return;

    const tick: SeeqTick = (t) => {
      if (moodRef.current !== e.mood) {
        cutMood(e, t);
        e.mood = moodRef.current;
      }
      advanceMood(e, t, MOODS[e.mood]);
      paint(e, t, paintersRef.current, shapeRef.current);
    };

    // Animate only while on screen; a hidden sprite freezes on its last frame.
    let unsub: (() => void) | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? true;
        if (visible && unsub === null) unsub = seeqSubscribe(tick);
        else if (!visible && unsub !== null) {
          unsub();
          unsub = null;
        }
      },
      { rootMargin: "120px" },
    );
    if (wrapRef.current) io.observe(wrapRef.current);
    return () => {
      io.disconnect();
      unsub?.();
      engineRef.current = null;
    };
  }, []);

  // Expression / shape changes: sync the refs; a reduced-motion sprite
  // repaints its static frame. (Refs + DOM writes only — no setState.)
  useEffect(() => {
    moodRef.current = expression;
    const e = engineRef.current;
    if (e?.reduced) {
      e.pose = { ...MOODS[expression] };
      paint(e, 0.9, paintersRef.current, shapeRef.current);
    }
  }, [expression]);
  useEffect(() => {
    shapeRef.current = shape;
    const e = engineRef.current;
    if (e?.reduced) paint(e, 0.9, paintersRef.current, shape);
  }, [shape]);

  return (
    <div ref={wrapRef} className={className} data-seeq-sprite={expression}>
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden className="overflow-visible">
        <defs>
          <radialGradient id={gid} cx="38%" cy="30%" r="80%">
            <stop offset="0%" stopColor={th.g0} />
            <stop offset="55%" stopColor={th.g1} />
            <stop offset="100%" stopColor={th.g2} />
          </radialGradient>
        </defs>
        <ellipse ref={shadowRef} cx={BODY_CX} cy="106" rx="23" ry="4.2" fill="#000" opacity="0.22" />
        <path ref={bodyRef} d={init.bodyD} fill={`url(#${gid})`} />
        <path ref={eyeLRef} d={init.eyeL.d} fill={th.eye} transform={init.eyeL.transform} opacity={init.eyeL.opacity} />
        <path ref={eyeRRef} d={init.eyeR.d} fill={th.eye} transform={init.eyeR.transform} opacity={init.eyeR.opacity} />
        <g ref={mouthGRef} transform={`rotate(${init.roll} ${BODY_CX} ${BODY_CY})`}>
          <path
            ref={mouthCurveRef}
            d={init.mouthD}
            fill="none"
            stroke={th.ink}
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity={init.mouthShow ? "1" : "0"}
          />
          <ellipse ref={mouthOpenRef} cx={BODY_CX} cy="77.5" rx="3.4" ry={init.openRy} fill={th.ink} opacity={init.openShow ? "1" : "0"} />
          <ellipse ref={cheekLRef} cx="41" cy="67" rx="4.8" ry="2.9" fill={th.cheek} opacity={init.cheeks} />
          <ellipse ref={cheekRRef} cx="79" cy="67" rx="4.8" ry="2.9" fill={th.cheek} opacity={init.cheeks} />
        </g>
      </svg>
    </div>
  );
}
