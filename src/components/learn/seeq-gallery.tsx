"use client";

// "Meet SeeQ" — the mascot gallery at the top of the Overview.
//
// An exact replica of the bloub customizer experience: every animation state
// (the full 14-state film), every shape, every expression and every colour of
// the catalogue, rendered by the same 1:1 ported engine as the corner buddy.
// Tiles are frozen frames (pure engine.sample — no loops, no cost); the hero
// is a live bot that follows the pointer, plays the whole sequence on demand,
// and wears whatever you tap. Choices persist via seeq-skin.ts and re-dress
// the corner buddy live.

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

export function SeeqGallery() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const skin = useSyncExternalStore(subscribeSkin, getSkin, getServerSkin);
  const [command, setCommand] = useState<BloubCommand>({ state: "idle", nonce: 0 });
  const [playing, setPlaying] = useState(false);
  const nonce = useRef(0);
  const playTimers = useRef<number[]>([]);

  const s = skin ?? DEFAULT_SKIN;

  const say = (state: StateId) => {
    nonce.current += 1;
    setCommand({ state, nonce: nonce.current });
  };

  const clearPlay = () => {
    playTimers.current.forEach((t) => window.clearTimeout(t));
    playTimers.current = [];
  };

  // Play the film: the reference sequence, each state held its measured
  // duration — the same montage bloub's own site ships as its default cycle.
  const playFilm = () => {
    clearPlay();
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

  const stopFilm = () => {
    clearPlay();
    setPlaying(false);
    say("idle");
  };

  useEffect(() => clearPlay, []);

  // Frozen tiles render nothing on the server (deterministic anyway — this
  // gate just avoids painting 50 SVGs during SSR where nobody sees them).
  if (!mounted) {
    return <section data-seeq-gallery="1" className="sheen mt-7 rounded-xl border border-zinc-800 bg-zinc-950 p-5" />;
  }

  const tileCls =
    "group flex cursor-pointer flex-col items-center gap-1 rounded-lg border bg-[#f9f9f9] p-2 pt-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400/60 ";
  const idleBorder = "border-zinc-800/80 hover:border-zinc-600";

  return (
    <section data-seeq-gallery="1" className="sheen mt-7 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      {/* Hero: one live bot, pointer-follow, skin-aware — no backdrop disc,
          just the hairline contour that keeps the ink readable on dark */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <button
          type="button"
          onClick={() => say("wide")}
          aria-label="Poke SeeQ"
          className="relative block h-32 w-32 shrink-0 cursor-pointer rounded-full outline-none transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-400/60 sm:h-36 sm:w-36"
        >
          <BloubBot
            size={144}
            shape={s.shape}
            color={s.color}
            expression={s.expression}
            paper="#f9f9f9"
            contour="rgba(255,255,255,0.26)"
            follow
            command={command}
            className="h-full w-full drop-shadow-[0_14px_30px_rgba(0,0,0,0.5)]"
            ariaLabel="SeeQ, your study buddy — it follows your pointer"
          />
        </button>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="font-display text-sm font-semibold text-zinc-200">Meet SeeQ</h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-400">
            Your study buddy, cloned from{" "}
            <span className="text-zinc-300">bloub</span> — one blob, two capsule
            eyes, no mouth. It follows your pointer, blinks, and morphs through
            its whole film. Dress it below: the corner buddy wears the same
            outfit.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {playing ? (
              <button
                type="button"
                onClick={stopFilm}
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
              onClick={() => setSkin(DEFAULT_SKIN)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
            <span className="text-[11px] text-zinc-600">tap a tile to dress your buddy</span>
          </div>
        </div>
      </div>

      {/* Animations — the 14-state film, frozen at each state's pose time */}
      <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">Animations</p>
      <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {SEQUENCE.map((id) => {
          const tileId = `state-${id}`;
          return (
            <button
              key={id}
              type="button"
              data-seeq-tile={tileId}
              onClick={() => say(id)}
              aria-label={`Play SeeQ animation — ${STATE_LABELS[id]}`}
              className={tileCls + idleBorder}
            >
              <BloubBot
                frozenAt={POSES[id]}
                state={id}
                color="encre"
                paper="#f9f9f9"
                size={60}
                className="h-[54px] w-[54px]"
                ariaLabel={`${STATE_LABELS[id]} animation frame`}
              />
              <span className="text-[10.5px] leading-none text-zinc-500 transition-colors group-hover:text-zinc-300">
                {STATE_LABELS[id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Shapes */}
      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-zinc-600">Shapes</p>
      <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {SHAPES.map((sh) => {
          const tileId = `shape-${sh.id}`;
          const active = s.shape === sh.id;
          return (
            <button
              key={sh.id}
              type="button"
              data-seeq-tile={tileId}
              data-seeq-active={active ? "1" : "0"}
              onClick={() => setSkin({ shape: sh.id })}
              aria-label={`Dress your SeeQ buddy — ${SHAPE_LABELS[sh.id]} shape`}
              aria-pressed={active}
              className={
                tileCls +
                (active
                  ? "border-emerald-400/60 ring-1 ring-emerald-400/40"
                  : idleBorder)
              }
            >
              <BloubBot
                frozenAt={1}
                shape={sh.id}
                color="encre"
                paper="#f9f9f9"
                size={60}
                className="h-[54px] w-[54px]"
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
      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-zinc-600">Expressions</p>
      <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {EXPRESSIONS.map((ex) => {
          const tileId = `expr-${ex.id}`;
          const active = s.expression === ex.id;
          return (
            <button
              key={ex.id}
              type="button"
              data-seeq-tile={tileId}
              data-seeq-active={active ? "1" : "0"}
              onClick={() => setSkin({ expression: ex.id })}
              aria-label={`Dress your SeeQ buddy — ${EXPRESSION_LABELS[ex.id]} expression`}
              aria-pressed={active}
              className={
                tileCls +
                (active
                  ? "border-emerald-400/60 ring-1 ring-emerald-400/40"
                  : idleBorder)
              }
            >
              <BloubBot
                frozenAt={1}
                expression={ex.id}
                color="encre"
                paper="#f9f9f9"
                size={60}
                className="h-[54px] w-[54px]"
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
      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-zinc-600">Colours</p>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {COLORS.map((c) => {
          const tileId = `colour-${c.id}`;
          const active = s.color === c.id;
          return (
            <button
              key={c.id}
              type="button"
              data-seeq-tile={tileId}
              data-seeq-active={active ? "1" : "0"}
              onClick={() => setSkin({ color: c.id })}
              aria-label={`Dress your SeeQ buddy — ${COLOR_LABELS[c.id]}`}
              aria-pressed={active}
              className={
                tileCls +
                (active
                  ? "border-emerald-400/60 ring-1 ring-emerald-400/40"
                  : idleBorder)
              }
            >
              <BloubBot
                frozenAt={1}
                color={c.id}
                paper="#f9f9f9"
                size={60}
                className="h-[54px] w-[54px]"
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
  );
}
