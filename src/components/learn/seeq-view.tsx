"use client";

// "SeeQ playground" — the mascot's own section, opened from the top header.
//
// An exact replica of the bloub customizer experience (the engine in
// src/components/bloub is ported 1:1, MIT © 2026 Jérémy Perret), with a
// SeeQL twist on the flow:
//
// - click a blob  -> it PLAYS: the tile itself animates live for a beat, and
//   the big hero performs the same move;
// - picking       -> re-dresses the DRAFT (the hero preview), not the buddy;
// - "Set as my buddy" -> commits the draft, and the corner buddy — which you
//   can grab with the mouse and park anywhere on screen — wears it live.
//
// Choices persist via seeq-skin.ts.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Play, RotateCcw, Square } from "lucide-react";
import { BloubBot, type BloubCommand } from "@/components/bloub/bloub-bot";
import { POSES, SEQUENCE, STATE_BY_ID, type StateId } from "@/components/bloub/states";
import { COLORS, SHAPES } from "@/components/bloub/skins";
import { EXPRESSIONS } from "@/components/bloub/expressions";
import {
  getServerSkin,
  getSkin,
  setSkin,
  subscribeSkin,
  DEFAULT_SKIN,
  type SeeqSkin,
} from "./seeq-skin";

// English labels, bloub's own (src/i18n/locales/en.ts).
const SHAPE_LABELS: Record<string, string> = {
  cercle: "Circle",
  galet: "Pebble",
  squircle: "Squircle",
  capsule: "Capsule",
  triangle: "Triangle",
  hexagone: "Hexagon",
  nuage: "Cloud",
  goutte: "Droplet",
};
const COLOR_LABELS: Record<string, string> = {
  encre: "Ink",
  creme: "Cream",
  brun: "Brown",
  rouge: "Red",
  orange: "Orange",
  ambre: "Amber",
  vert: "Green",
  turquoise: "Turquoise",
  bleu: "Blue",
  violet: "Purple",
  rose: "Pink",
  gris: "Grey",
};
const EXPRESSION_LABELS: Record<string, string> = {
  neutre: "Neutral",
  attentif: "Attentive",
  surpris: "Surprised",
  excite: "Excited",
  heureux: "Happy",
  hilare: "Laughing",
  colere: "Angry",
  triste: "Sad",
  effraye: "Scared",
  mefiant: "Suspicious",
  confus: "Confused",
  curieux: "Curious",
  fier: "Proud",
  timide: "Shy",
  blase: "Unimpressed",
  somnolent: "Sleepy",
};
const STATE_LABELS: Record<string, string> = {
  idle: "Idle",
  thinking: "Thinking",
  wink: "Wink",
  wide: "Wide eyes",
  alert: "Alert",
  notify: "Notification",
  exclaim: "Exclamation",
  sleep: "Sleep",
  egg: "Egg",
  hexagon: "Hexagon",
  play: "Play",
  orbit: "Orbit",
  burst: "Burst",
  comet: "Comet",
};

/** No-op store subscription for the client gate. */
const emptySubscribe = () => () => {};

const sameSkin = (a: SeeqSkin, b: SeeqSkin) =>
  a.shape === b.shape && a.color === b.color && a.expression === b.expression;

/* ------------------------------------------------------------------ tiles */

/**
 * A tile bot. Frozen (pure engine.sample, no loop) until clicked — then it
 * mounts a live bot that PLAYS: animation tiles run their own state, every
 * other tile does a quick "wide eyes" pulse. One live bot at a time, so the
 * wall of tiles costs nothing at rest.
 */
function TileBot({
  tileKey,
  frozenAt,
  state,
  shape,
  color,
  expression,
  playMs,
  ariaLabel,
}: {
  tileKey: string;
  frozenAt?: number;
  state?: StateId;
  shape?: string;
  color?: string;
  expression?: string;
  playMs: number;
  ariaLabel: string;
}) {
  const [liveNonce, setLiveNonce] = useState(0);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );
  const play = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setLiveNonce((n) => n + 1);
    timer.current = window.setTimeout(() => setLiveNonce(0), playMs);
  };
  const pulse = state === undefined || state === "idle";
  return (
    <span data-seeq-tilebot={tileKey} className="block h-[54px] w-[54px]" aria-hidden={true}>
      {liveNonce > 0 ? (
        <BloubBot
          key={liveNonce}
          size={60}
          state={state ?? "idle"}
          shape={shape}
          color={color}
          expression={expression}
          command={pulse ? { state: "wide", nonce: 1 } : null}
          paper="#f9f9f9"
          className="h-full w-full"
          ariaLabel={ariaLabel}
        />
      ) : (
        <BloubBot
          frozenAt={frozenAt ?? 1}
          state={state}
          shape={shape}
          color={color}
          expression={expression}
          paper="#f9f9f9"
          size={60}
          className="h-full w-full"
          ariaLabel={ariaLabel}
        />
      )}
    </span>
  );
}

/* ------------------------------------------------------------------- view */

export function SeeqView() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const committed = useSyncExternalStore(subscribeSkin, getSkin, getServerSkin);
  // Draft: what the hero previews. Only "Set as my buddy" writes the store,
  // so playing with the blobs never surprises the corner buddy.
  const [draft, setDraft] = useState<SeeqSkin>(() => getSkin());
  const [command, setCommand] = useState<BloubCommand>({ state: "idle", nonce: 0 });
  const [playing, setPlaying] = useState(false);
  const [justSet, setJustSet] = useState(false);
  const nonce = useRef(0);
  const playTimers = useRef<number[]>([]);
  const revertTimer = useRef<number | null>(null);
  const setFlash = useRef<number | null>(null);

  const dirty = !sameSkin(draft, committed);

  const say = (state: StateId) => {
    nonce.current += 1;
    setCommand({ state, nonce: nonce.current });
  };

  /** Hero performs a state, then settles back to idle. */
  const heroPlay = (state: StateId, holdMs: number) => {
    clearPlay();
    if (revertTimer.current !== null) window.clearTimeout(revertTimer.current);
    say(state);
    revertTimer.current = window.setTimeout(() => say("idle"), holdMs);
  };

  const clearPlay = () => {
    playTimers.current.forEach((t) => window.clearTimeout(t));
    playTimers.current = [];
    setPlaying(false);
  };

  // Play the film: the reference sequence, each state held its measured
  // duration — the same montage bloub's own site ships as its default cycle.
  const playFilm = () => {
    clearPlay();
    if (revertTimer.current !== null) window.clearTimeout(revertTimer.current);
    setPlaying(true);
    let at = 0;
    for (const id of SEQUENCE) {
      const def = STATE_BY_ID.get(id);
      const delay = at * 1000;
      playTimers.current.push(window.setTimeout(() => say(id), delay));
      at += Math.max(def?.duration ?? 2, def?.minDuration ?? 0);
    }
    playTimers.current.push(
      window.setTimeout(() => {
        say("idle");
        setPlaying(false);
      }, at * 1000),
    );
  };

  /** A tile was clicked: it plays itself, and the draft re-dresses. */
  const pick = (patch: Partial<SeeqSkin>) => {
    clearPlay();
    if (revertTimer.current !== null) window.clearTimeout(revertTimer.current);
    setDraft((d) => ({ ...d, ...patch }));
    heroPlay("wink", 1400);
  };

  const commit = () => {
    if (!dirty) return;
    clearPlay();
    setSkin(draft);
    setJustSet(true);
    if (setFlash.current !== null) window.clearTimeout(setFlash.current);
    setFlash.current = window.setTimeout(() => setJustSet(false), 2200);
    heroPlay("wide", 1600);
  };

  const reset = () => {
    clearPlay();
    setDraft(DEFAULT_SKIN);
    setSkin(DEFAULT_SKIN);
    setJustSet(false);
    heroPlay("wide", 1600);
  };

  useEffect(
    () => () => {
      playTimers.current.forEach((t) => window.clearTimeout(t));
      playTimers.current = [];
      if (revertTimer.current !== null) window.clearTimeout(revertTimer.current);
      if (setFlash.current !== null) window.clearTimeout(setFlash.current);
    },
    [],
  );

  if (!mounted) {
    return <section data-seeq-view="1" className="sheen rounded-xl border border-zinc-800 bg-zinc-950 p-5" />;
  }

  const tileCls =
    "group flex cursor-pointer flex-col items-center gap-1 rounded-lg border bg-[#f9f9f9] p-2 pt-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400/60 active:scale-[0.97] ";
  const idleBorder = "border-zinc-800/80 hover:border-zinc-600";
  const rowTitle = "mt-4 font-mono text-[10px] uppercase tracking-wider text-zinc-600";
  const stateMs = (id: StateId) => {
    const def = STATE_BY_ID.get(id);
    return Math.min(Math.max(def?.duration ?? 2, def?.minDuration ?? 0), 6) * 1000 + 250;
  };

  return (
    <div className="bg-ambient max-w-4xl">
      <section data-seeq-view="1" className="sheen rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        {/* Hero: the DRAFT, live — pointer-follow, poke, film player */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
          <button
            type="button"
            onClick={() => heroPlay("wide", 1600)}
            aria-label="Poke SeeQ"
            className="relative block h-32 w-32 shrink-0 cursor-pointer rounded-full outline-none transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-400/60 sm:h-36 sm:w-36"
          >
            <BloubBot
              size={144}
              shape={draft.shape}
              color={draft.color}
              expression={draft.expression}
              paper="#f9f9f9"
              contour="rgba(255,255,255,0.26)"
              follow
              command={command}
              className="h-full w-full drop-shadow-[0_14px_30px_rgba(0,0,0,0.5)]"
              ariaLabel="SeeQ preview — it follows your pointer"
            />
          </button>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1 className="font-display text-sm font-semibold text-zinc-200">SeeQ playground</h1>
            <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-400">
              One blob, two capsule eyes, no mouth — cloned from{" "}
              <span className="text-zinc-300">bloub</span>. Click a blob and it
              plays. Like what you see? <span className="text-zinc-300">Set as my buddy</span> dresses
              the corner buddy — who you can also grab with the mouse and park
              anywhere on screen.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {playing ? (
                <button
                  type="button"
                  onClick={() => {
                    clearPlay();
                    say("idle");
                  }}
                  data-seeq-stop="1"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-zinc-200 transition-colors hover:border-zinc-600"
                >
                  <Square className="h-3 w-3" /> Stop
                </button>
              ) : (
                <button
                  type="button"
                  onClick={playFilm}
                  data-seeq-play="1"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-emerald-400 px-3 py-1.5 text-[11px] font-medium text-[#052e1c] transition-colors hover:bg-emerald-300"
                >
                  <Play className="h-3 w-3" /> Play the film
                </button>
              )}
              <button
                type="button"
                onClick={commit}
                disabled={!dirty}
                data-seeq-commit="1"
                className={
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors " +
                  (dirty
                    ? "bg-emerald-400 text-[#052e1c] hover:bg-emerald-300"
                    : "cursor-default bg-zinc-800 text-zinc-500")
                }
              >
                {justSet ? "That's your buddy!" : "Set as my buddy"}
              </button>
              <button
                type="button"
                onClick={reset}
                data-seeq-reset="1"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
            <p className="mt-2 text-[11px] text-zinc-600" aria-live="polite">
              {dirty
                ? "Previewing — set it to dress your corner buddy."
                : justSet
                  ? "Done — your corner buddy is wearing this now."
                  : "This is what your corner buddy wears. Grab it and drag it anywhere."}
            </p>
          </div>
        </div>

        {/* Animations — the 14-state film, one state per tile */}
        <p className={rowTitle}>Animations — click to play</p>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {SEQUENCE.map((id) => {
            return (
              <button
                key={id}
                type="button"
                data-seeq-tile={`state-${id}`}
                onClick={() => heroPlay(id, stateMs(id))}
                aria-label={`Play SeeQ animation — ${STATE_LABELS[id]}`}
                className={tileCls + idleBorder}
              >
                <TileBot
                  tileKey={`state-${id}`}
                  frozenAt={POSES[id]}
                  state={id}
                  color="encre"
                  playMs={stateMs(id)}
                  ariaLabel={`${STATE_LABELS[id]} animation`}
                />
                <span className="text-[10.5px] leading-none text-zinc-500 transition-colors group-hover:text-zinc-300">
                  {STATE_LABELS[id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Shapes */}
        <p className={rowTitle}>Shapes</p>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {SHAPES.map((sh) => {
            const active = draft.shape === sh.id;
            return (
              <button
                key={sh.id}
                type="button"
                data-seeq-tile={`shape-${sh.id}`}
                data-seeq-active={active ? "1" : "0"}
                onClick={() => pick({ shape: sh.id })}
                aria-label={`Preview the ${SHAPE_LABELS[sh.id]} shape`}
                aria-pressed={active}
                className={
                  tileCls +
                  (active
                    ? "border-emerald-400/60 ring-1 ring-emerald-400/40"
                    : idleBorder)
                }
              >
                <TileBot
                  tileKey={`shape-${sh.id}`}
                  shape={sh.id}
                  color="encre"
                  playMs={1500}
                  ariaLabel={`${SHAPE_LABELS[sh.id]} shape`}
                />
                <span
                  className={
                    "text-[10.5px] leading-none transition-colors " +
                    (active ? "text-emerald-300" : "text-zinc-500 group-hover:text-zinc-300")
                  }
                >
                  {SHAPE_LABELS[sh.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Expressions */}
        <p className={rowTitle}>Expressions</p>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {EXPRESSIONS.map((ex) => {
            const active = draft.expression === ex.id;
            return (
              <button
                key={ex.id}
                type="button"
                data-seeq-tile={`expr-${ex.id}`}
                data-seeq-active={active ? "1" : "0"}
                onClick={() => pick({ expression: ex.id })}
                aria-label={`Preview the ${EXPRESSION_LABELS[ex.id]} expression`}
                aria-pressed={active}
                className={
                  tileCls +
                  (active
                    ? "border-emerald-400/60 ring-1 ring-emerald-400/40"
                    : idleBorder)
                }
              >
                <TileBot
                  tileKey={`expr-${ex.id}`}
                  expression={ex.id}
                  color="encre"
                  playMs={1500}
                  ariaLabel={`${EXPRESSION_LABELS[ex.id]} expression`}
                />
                <span
                  className={
                    "text-[10.5px] leading-none transition-colors " +
                    (active ? "text-emerald-300" : "text-zinc-500 group-hover:text-zinc-300")
                  }
                >
                  {EXPRESSION_LABELS[ex.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Colours */}
        <p className={rowTitle}>Colours</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {COLORS.map((c) => {
            const active = draft.color === c.id;
            return (
              <button
                key={c.id}
                type="button"
                data-seeq-tile={`colour-${c.id}`}
                data-seeq-active={active ? "1" : "0"}
                onClick={() => pick({ color: c.id })}
                aria-label={`Preview the ${COLOR_LABELS[c.id]} colour`}
                aria-pressed={active}
                className={
                  tileCls +
                  (active
                    ? "border-emerald-400/60 ring-1 ring-emerald-400/40"
                    : idleBorder)
                }
              >
                <TileBot
                  tileKey={`colour-${c.id}`}
                  color={c.id}
                  playMs={1500}
                  ariaLabel={`${COLOR_LABELS[c.id]} colour`}
                />
                <span
                  className={
                    "text-[10.5px] leading-none transition-colors " +
                    (active ? "text-emerald-300" : "text-zinc-500 group-hover:text-zinc-300")
                  }
                >
                  {COLOR_LABELS[c.id]}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
