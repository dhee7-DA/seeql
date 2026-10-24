"use client";

// SeeQ — the SeeQL study buddy.
//
// The mascot is an EXACT clone of bloub (https://github.com/jeremy-prt/bloub,
// MIT © 2026 Jérémy Perret): the engine in src/components/bloub is ported 1:1,
// so the body, the capsule eye holes, the blink calendar, the gaze follow and
// the animation states are pixel-faithful to the reference. No mouth — the
// face is two capsules, that is the whole character.
//
// This file is only the BEHAVIOUR shell around the live bot: coaching tips,
// poke, occasional flourishes, collapse, persistence. On top of that it is
// PLACEABLE: grab it with the mouse and park it anywhere on screen — the spot
// persists (seeql.buddy.pos.v1). A short drag moves it, a clean click pokes
// it; the tip bubble flips sides so it never leaves the viewport.
//
// The skin (shape, colour, expression) is owned by seeq-skin.ts — the SeeQ
// playground (top header) re-dresses the buddy live.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, X } from "lucide-react";
import { BloubBot, type BloubCommand } from "@/components/bloub/bloub-bot";
import type { StateId } from "@/components/bloub/states";
import {
  DEFAULT_SKIN,
  getServerSkin,
  getSkin,
  subscribeSkin,
  type SeeqSkin,
} from "./seeq-skin";
import {
  blitzActive,
  getBlitz,
  getMood,
  subscribeBlitz,
  subscribeMood,
  type SeeqBlitzEvent,
  type SeeqMoodEvent,
} from "./seeq-mood";

// ---- coach tips (warm, app-aware, no emoji) ------------------------------

const TIPS: string[] = [
  "Hi, I'm SeeQ. Poke me any time — or grab me and park me somewhere cozy.",
  "Stuck on a query? The AI Mentor in the toolbox gives tiered hints on your own data.",
  "Streak rule: hit your daily goal and the flame keeps burning. Five minutes is enough.",
  "Reading a query plan: SCAN touches every row, SEARCH jumps straight to matches. Indexes turn the first into the second.",
  "Query golf scores strokes, not speed. Shorter SQL that returns the same rows wins.",
  "Interview classic: COUNT(*) counts rows, COUNT(col) skips NULLs. Drop that and watch eyebrows rise.",
  "Silent bug alert: a WHERE against NULL never matches. Write IS NOT NULL before you debug for an hour.",
  "The Error clinic grades your diagnosis, not just your fix. Say WHY it broke.",
  "Badges unlock quietly as you practice. The overview wall keeps score.",
  "JOIN order does not matter to the planner — but clear aliases matter to your future self.",
  "Window functions keep every row while adding aggregates. The drills cover them from six angles.",
  "The Data explorer is a sandbox. Breaking things there is free — and honestly encouraged.",
  "Finished a lesson? Predict the grid next: freeze the grid before it runs.",
  "Slow query in the Performance lab? Add the index it suggests and watch SCAN collapse into SEARCH.",
  "The SeeQ playground lives in the top header — dress me in any shape, colour or mood.",
];

const PRAISE = [
  "Ready for one more query?",
  "You've got this — one table at a time.",
  "Slow queries fear you, you know.",
  "Small steps daily beat marathons on Sunday.",
  "Poke received. Morale restored.",
];

// ---- live reactions (fed by the seeq-mood bus) -------------------------
// Short, warm, app-aware — the same voice as the tips, no emoji.

const REACT_LINES: Record<SeeqMoodEvent["kind"], string[]> = {
  win: [
    "Clean run. The planner approves.",
    "That query never stood a chance.",
    "Green rows, warm glow.",
    "Called it — and the engine agrees.",
  ],
  fail: [
    "That error is information. Read it once, slowly.",
    "Ouch. The message names the clause — look there first.",
    "Bent, not broken. Errors are how the engine talks.",
    "Even the planner has bad days. Again, slower."
  ],
  streak: [
    "A whole round, no misses. Quiet excellence.",
    "Every card correct — that compounding is real.",
    "Streak secured. The flame agrees.",
  ],
  puzzle: [
    "Daily puzzle, solved. See you tomorrow.",
    "The calendar chip turns green. Deserved.",
    "One a day — that is how streaks are built.",
  ],
};

/** Which bloub state plays: intensity 1 uses the quiet one, 2+ the big one. */
const REACT_STATE: Record<SeeqMoodEvent["kind"], { quiet: StateId; big: StateId }> = {
  win: { quiet: "exclaim", big: "play" },
  fail: { quiet: "alert", big: "alert" },
  streak: { quiet: "wink", big: "comet" },
  puzzle: { quiet: "exclaim", big: "burst" },
};

// ---- blitz round channel -----------------------------------------------
// Blitz mode drives the buddy through a round's arc: focused at the start,
// louder as the combo climbs, stung on a miss, triumphant at a record.
// These events are self-rate-limiting (one per answer), so unlike the mood
// bus there is no cooldown — but while a round is live the buddy HOLDS its
// state (the next blitz event owns the face until "end"), and the tip /
// flourish calendars stand down via blitzActive().

const BLITZ_LINES: Record<Exclude<SeeqBlitzEvent["phase"], "end">, string[]> = {
  start: [
    "Blitz round. Eyes on the clock — I'll keep the score.",
    "Ninety seconds. Answer fast, stay honest.",
  ],
  hot3: [
    "Three straight — the combo is live, ×2.",
    "Three in a row. Double points from here.",
  ],
  hot6: [
    "Six straight! ×3 — everything you touch turns to rows.",
    "The multiplier is maxed. Keep flying.",
  ],
  miss: [
    "Ouch — the streak snaps. Breathe, take the next one.",
    "Broken, not beaten. The clock is still running.",
    "That one stings. The next question owes you.",
  ],
  record: [
    "Past your personal best — the wall remembers this round.",
    "Record pace. Don't look down.",
  ],
};

function blitzEndLine(ev: SeeqBlitzEvent): string {
  if (ev.points <= 0) return "Ninety seconds, nothing banked. The deck will be kinder — probably.";
  if (ev.streak >= 6) return `Clock down — ${ev.points} points, ${ev.streak} straight at peak. Elite pace.`;
  if (ev.streak >= 3) return `Clock down — ${ev.points} points with a ${ev.streak}-streak in there. Sharp.`;
  return `Clock down — ${ev.points} points on the board. Again?`;
}

/** Short face-keeping states for the idle flourish. */
const FLOURISHES: { state: StateId; hold: number }[] = [
  { state: "wink", hold: 1.6 },
  { state: "egg", hold: 1.8 },
  { state: "hexagon", hold: 1.6 },
  { state: "wide", hold: 1.8 },
];

// ---- component -----------------------------------------------------------

const COLLAPSE_KEY = "seeql.buddy.collapsed";
const POS_KEY = "seeql.buddy.pos.v1";
const TIP_HOLD_MS = 8200;
const TIP_GAP_MS = 22000;
const TIP_GAP_JITTER_MS = 14000;
const FLOURISH_GAP_MS = 26000;
const FLOURISH_JITTER_MS = 20000;

/** Drag distance (px) before a press becomes a move rather than a poke. */
const DRAG_THRESHOLD = 6;
/** Keep the buddy this far inside the viewport edges. */
const EDGE = 8;
/** Never above the sticky top header. */
const TOP_MIN = 64;

interface Pos {
  x: number;
  y: number;
}

/** Rendered pixel size of the buddy square (mirrors the button classes). */
const buddySize = (vw: number, collapsed: boolean) =>
  collapsed ? 44 : vw >= 640 ? 128 : 112;

/** The classic corner berth, used until the buddy is parked by hand. */
function defaultPos(vw: number, vh: number, collapsed: boolean): Pos {
  const size = buddySize(vw, collapsed);
  const lg = vw >= 1024;
  const x = lg ? Math.max(340, (vw - 1280) / 2 + 340) : 12;
  const y = vh - (lg ? 16 : 56) - size;
  return { x: Math.max(EDGE, Math.round(x)), y: Math.max(TOP_MIN, Math.round(y)) };
}

function clampPos(p: Pos, vw: number, vh: number, size: number): Pos {
  return {
    x: Math.min(Math.max(EDGE, p.x), Math.max(EDGE, vw - size - EDGE)),
    y: Math.min(Math.max(TOP_MIN, p.y), Math.max(TOP_MIN, vh - size - EDGE)),
  };
}

function loadPos(): Pos | null {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Pos>;
    if (typeof p?.x === "number" && typeof p?.y === "number") return { x: p.x, y: p.y };
  } catch {
    /* private mode — fall through to the default berth */
  }
  return null;
}

/** No-op store subscription for the client gate (nothing to subscribe to). */
const emptySubscribe = () => () => {};

export function SeeqBuddy() {
  // SSR-safe client gate: no effect, no state — the server snapshot renders null.
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  // Skin, owned by the SeeQ playground. Reactive without setState-in-effect.
  const skin = useSyncExternalStore(subscribeSkin, getSkin, getServerSkin);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  // Parked position (top-left of the buddy). The initializer follows the same
  // client-only pattern as `collapsed` above. It must also survive the SERVER
  // render: the buddy now mounts at the app root, so its initializers run
  // during SSR of the landing (the component still outputs null there via
  // `mounted` — the catch just keeps that render alive).
  const [pos, setPos] = useState<Pos>(() => {
    try {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      return clampPos(loadPos() ?? defaultPos(vw, vh, collapsed), vw, vh, buddySize(vw, collapsed));
    } catch {
      /* server render — a neutral berth, replaced by the real one on mount */
      return { x: EDGE, y: TOP_MIN };
    }
  });
  const [dragging, setDragging] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [command, setCommand] = useState<BloubCommand>({ state: "idle", nonce: 0 });

  const collapsedRef = useRef(collapsed);
  const bubbleRef = useRef(bubble);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; size: number; moved: boolean } | null>(null);
  // A drag suppresses the click-poke that fires after pointerup.
  const draggedRef = useRef(false);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const flourishTimer = useRef<number | null>(null);
  const revertTimer = useRef<number | null>(null);
  const bag = useRef<{ order: number[]; i: number }>({ order: [], i: 0 });
  const praiseIdx = useRef(0);
  const nonce = useRef(0);
  const reactIdx = useRef({ win: 0, fail: 0, streak: 0, puzzle: 0 });
  const moodNonce = useRef(0);
  const blitzIdx = useRef({ start: 0, hot3: 0, hot6: 0, miss: 0, record: 0 });
  const blitzNonce = useRef(0);

  const say = (state: StateId) => {
    nonce.current += 1;
    setCommand({ state, nonce: nonce.current });
  };

  const clearTimers = () => {
    for (const t of [showTimer, hideTimer, flourishTimer, revertTimer]) {
      if (t.current !== null) window.clearTimeout(t.current);
      t.current = null;
    }
  };

  const scheduleFlourish = (delayMs: number) => {
    if (flourishTimer.current !== null) window.clearTimeout(flourishTimer.current);
    flourishTimer.current = window.setTimeout(() => {
      if (!collapsedRef.current && !bubbleRef.current && !blitzActive()) {
        const f = FLOURISHES[Math.floor(Math.random() * FLOURISHES.length)]!;
        say(f.state);
        if (revertTimer.current !== null) window.clearTimeout(revertTimer.current);
        revertTimer.current = window.setTimeout(() => say("idle"), f.hold * 1000 + 150);
      }
      scheduleFlourish(FLOURISH_GAP_MS + Math.random() * FLOURISH_JITTER_MS);
    }, delayMs);
  };

  const scheduleNextTip = (delayMs: number) => {
    if (showTimer.current !== null) window.clearTimeout(showTimer.current);
    showTimer.current = window.setTimeout(() => {
      if (collapsedRef.current) return;
      if (blitzActive()) return; // a blitz round is live — stand down
      const b = bag.current;
      if (b.i >= b.order.length) {
        b.order = TIPS.map((_, i) => i);
        for (let i = b.order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [b.order[i], b.order[j]] = [b.order[j], b.order[i]];
        }
        b.i = 0;
      }
      const text = TIPS[b.order[b.i++]]!;
      setBubble(text);
      bubbleRef.current = text;
      // The notification pastille is bloub's own "you've got mail" state —
      // it IS the tip state: the bot glances at the little blue dot.
      say("notify");
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => {
        setBubble(null);
        bubbleRef.current = null;
        say("idle");
        scheduleNextTip(TIP_GAP_MS + Math.random() * TIP_GAP_JITTER_MS);
      }, TIP_HOLD_MS);
    }, delayMs);
  };

  // ---- drag / place -------------------------------------------------------

  const onBuddyPointerMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!d.moved) {
      d.moved = true;
      draggedRef.current = true;
      setDragging(true);
    }
    setPos(clampPos({ x: d.origX + dx, y: d.origY + dy }, window.innerWidth, window.innerHeight, d.size));
  }, []);

  const onBuddyPointerUp = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current;
      dragRef.current = null;
      window.removeEventListener("pointermove", onBuddyPointerMove);
      setDragging(false);
      if (d?.moved) {
        // The final spot is computed from the pointerup itself — never from
        // state, which can lag a frame behind on fast flicks.
        const p = clampPos(
          { x: d.origX + (e.clientX - d.startX), y: d.origY + (e.clientY - d.startY) },
          window.innerWidth,
          window.innerHeight,
          d.size,
        );
        setPos(p);
        try {
          localStorage.setItem(POS_KEY, JSON.stringify(p));
        } catch {
          /* private mode — the spot just won't persist */
        }
      }
    },
    [onBuddyPointerMove],
  );

  useEffect(
    () => () => {
      window.removeEventListener("pointermove", onBuddyPointerMove);
    },
    [onBuddyPointerMove],
  );

  const onBuddyPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const box = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      size: box.width,
      moved: false,
    };
    window.addEventListener("pointermove", onBuddyPointerMove);
    window.addEventListener("pointerup", onBuddyPointerUp, { once: true });
    window.addEventListener("pointercancel", onBuddyPointerUp, { once: true });
  };

  // ---- behaviour ----------------------------------------------------------

  // Live reactions: the mood bus pushes app events here (a solved problem, a
  // failed run, a clean drill round, the daily puzzle). State changes from an
  // external event callback — same legal shape as the pointer handlers above.
  const reactTo = (m: SeeqMoodEvent) => {
    if (collapsedRef.current) return;
    clearTimers();
    const lines = REACT_LINES[m.kind];
    const i = reactIdx.current[m.kind]++ % lines.length;
    const text = lines[i]!;
    setBubble(text);
    bubbleRef.current = text;
    const st = REACT_STATE[m.kind];
    say(m.intensity >= 2 ? st.big : st.quiet);
    revertTimer.current = window.setTimeout(() => say("idle"), 2400);
    hideTimer.current = window.setTimeout(() => {
      setBubble(null);
      bubbleRef.current = null;
      scheduleNextTip(TIP_GAP_MS + Math.random() * TIP_GAP_JITTER_MS);
    }, 3600);
  };

  useEffect(
    () =>
      subscribeMood(() => {
        const m = getMood();
        if (!m || m.nonce === moodNonce.current) return;
        moodNonce.current = m.nonce;
        reactTo(m);
      }),
    // mirrors the mount effect below — closes over stable timers/refs only
    [],
  );

  // Blitz round channel: same external-event shape as the mood bus above.
  const reactToBlitz = (ev: SeeqBlitzEvent) => {
    if (collapsedRef.current) return;
    clearTimers();
    let state: StateId;
    let text: string;
    if (ev.phase === "end") {
      state = ev.points > 0 ? "play" : "idle";
      text = blitzEndLine(ev);
    } else {
      const lines = BLITZ_LINES[ev.phase];
      const i = blitzIdx.current[ev.phase]++ % lines.length;
      text = lines[i]!;
      state =
        ev.phase === "start"
          ? "thinking"
          : ev.phase === "hot3"
            ? "exclaim"
            : ev.phase === "hot6"
              ? "comet"
              : ev.phase === "miss"
                ? "wide"
                : "burst";
    }
    setBubble(text);
    bubbleRef.current = text;
    say(state);
    if (ev.phase === "end") {
      // round over — resume the normal idle cycle
      revertTimer.current = window.setTimeout(() => say("idle"), 2400);
      hideTimer.current = window.setTimeout(() => {
        setBubble(null);
        bubbleRef.current = null;
        scheduleNextTip(TIP_GAP_MS + Math.random() * TIP_GAP_JITTER_MS);
      }, 3600);
    }
    // any other phase HOLDS: no revert, the next blitz event owns the face
  };

  useEffect(
    () =>
      subscribeBlitz(() => {
        const ev = getBlitz();
        if (!ev || ev.nonce === blitzNonce.current) return;
        blitzNonce.current = ev.nonce;
        reactToBlitz(ev);
      }),
    [],
  );

  // Collapse changes: persist + keep behaviour in sync. Speech pauses while
  // collapsed and resumes on expand (event handlers flip `collapsed`).
  useEffect(() => {
    collapsedRef.current = collapsed;
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* private mode — ignore */
    }
  }, [collapsed]);

  // Mount: begin the tip cycle and the flourish calendar.
  useEffect(() => {
    scheduleNextTip(2600);
    scheduleFlourish(FLOURISH_GAP_MS);
    return clearTimers;
  }, []);

  const poke = () => {
    // The click that follows a drag is not a poke.
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    if (collapsedRef.current) {
      expand();
      return;
    }
    clearTimers();
    const text = PRAISE[praiseIdx.current++ % PRAISE.length]!;
    setBubble(text);
    bubbleRef.current = text;
    say("wide");
    revertTimer.current = window.setTimeout(() => say("idle"), 1600);
    hideTimer.current = window.setTimeout(() => {
      setBubble(null);
      bubbleRef.current = null;
      scheduleNextTip(TIP_GAP_MS + Math.random() * TIP_GAP_JITTER_MS);
    }, 3000);
  };

  const expand = () => {
    setCollapsed(false);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos((p) => clampPos(p, vw, vh, buddySize(vw, false)));
    scheduleNextTip(2600);
    scheduleFlourish(FLOURISH_GAP_MS);
  };

  const collapseBuddy = () => {
    clearTimers();
    setBubble(null);
    bubbleRef.current = null;
    say("idle");
    setCollapsed(true);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos((p) => clampPos(p, vw, vh, buddySize(vw, true)));
  };

  const dismiss = () => {
    clearTimers();
    setBubble(null);
    bubbleRef.current = null;
    say("idle");
    scheduleNextTip(15000);
  };

  if (!mounted) return null;
  const s: SeeqSkin = skin ?? DEFAULT_SKIN;
  // The tip bubble flips to the buddy's other side near the right edge, so a
  // parked buddy never pushes its speech off-screen.
  const onRight = pos.x + 64 > window.innerWidth * 0.55;

  return createPortal(
    // Fixed at the parked position (default: the classic corner berth). The
    // bubble is absolutely anchored to the buddy, so the parking spot always
    // means the buddy itself.
    <div data-seeq="1" className="fixed z-[55]" style={{ left: pos.x, top: pos.y }}>
      <div className="relative">
        <div className="group relative">
          <button
            type="button"
            onClick={poke}
            onPointerDown={onBuddyPointerDown}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Open SeeQ study buddy" : "SeeQ study buddy"}
            className={
              "block cursor-grab touch-none select-none rounded-full outline-none transition-[width,height] duration-300 focus-visible:ring-2 focus-visible:ring-emerald-400/60 active:cursor-grabbing " +
              (dragging ? "" : "hover:scale-105 ") +
              (collapsed
                ? // Minimized chip must stay FINDABLE: ink-on-zinc-950 otherwise
                  // vanishes against the dark page. A hairline emerald ring,
                  // soft emerald glow and a faint disc mark the parking spot.
                  "h-11 w-11 ring-1 ring-emerald-400/80 bg-zinc-950/70 shadow-[0_0_0_4px_rgba(16,185,129,0.14),0_8px_20px_rgba(0,0,0,0.55)] backdrop-blur-sm"
                : "h-28 w-28 sm:h-32 sm:w-32")
            }
          >
            {/* No backdrop disc — the bot sits straight on the app. The eye
                holes keep their paper depth because they are painted inside
                the SVG (the paper-coloured underlay), and a hairline contour
                keeps the ink silhouette legible on the dark page. */}
            <BloubBot
              size={collapsed ? 44 : 128}
              shape={s.shape}
              color={s.color}
              expression={s.expression}
              paper="#f9f9f9"
              contour="rgba(255,255,255,0.26)"
              follow
              command={command}
              className="h-full w-full drop-shadow-[0_10px_22px_rgba(0,0,0,0.5)]"
              ariaLabel="SeeQ study buddy"
            />
          </button>
          {!collapsed && (
            <button
              type="button"
              onClick={collapseBuddy}
              aria-label="Collapse SeeQ"
              title="Collapse SeeQ"
              className="absolute -right-0.5 -top-0.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 opacity-0 transition-all hover:border-zinc-600 hover:text-zinc-200 focus-visible:opacity-100 group-hover:opacity-100"
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
              className={
                "pointer-events-auto absolute bottom-2 z-10 w-56 max-w-[62vw] rounded-2xl border border-zinc-800 bg-zinc-900/95 p-3 pr-7 shadow-xl shadow-black/40 backdrop-blur " +
                (onRight ? "right-full mr-2 rounded-br-md" : "left-full ml-2 rounded-bl-md")
              }
            >
              <p aria-live="polite" className="text-[12.5px] leading-relaxed text-zinc-200">
                {bubble}
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
