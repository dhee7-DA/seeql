"use client";

// "Meet SeeQ" — the mascot gallery at the top of the Overview.
//
// Every shape, every expression and every colour of the study buddy, live:
// each tile is a real SeeqSprite running on the shared SeeQ ticker (bloub-
// grade motion), not a static picture. Tap any tile to poke it; tap a colour
// to re-skin the corner buddy — the choice persists (seeql.buddy.theme).

import { useRef, useState, useSyncExternalStore } from "react";
import {
  EXPRESSIONS,
  getBuddyTheme,
  SeeqSprite,
  setBuddyTheme,
  SHAPE_IDS,
  SHAPES,
  subscribeBuddyTheme,
  THEMES,
  THEME_IDS,
  type Mood,
  type ThemeId,
} from "./seeq-engine";

const POKE_MS = 1300;

export function SeeqGallery() {
  const [poked, setPoked] = useState<string | null>(null);
  const pokeTimer = useRef<number | null>(null);
  const activeTheme = useSyncExternalStore(subscribeBuddyTheme, getBuddyTheme, () => "emerald" as ThemeId);

  const poke = (id: string) => {
    setPoked(id);
    if (pokeTimer.current !== null) window.clearTimeout(pokeTimer.current);
    pokeTimer.current = window.setTimeout(() => setPoked(null), POKE_MS);
  };

  const pickTheme = (id: ThemeId) => {
    setBuddyTheme(id);
    poke(`colour-${id}`);
  };

  return (
    <section data-seeq-gallery="1" className="sheen mt-7 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="font-display text-sm font-semibold text-zinc-200">Meet SeeQ</h2>
        <span className="text-[11px] text-zinc-500">tap a tile to poke it · tap a colour to re-skin your buddy</span>
      </div>

      {/* Shapes */}
      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-zinc-600">Shapes</p>
      <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {SHAPE_IDS.map((id) => {
          const tileId = `shape-${id}`;
          return (
            <button
              key={id}
              type="button"
              data-seeq-tile={tileId}
              onClick={() => poke(tileId)}
              aria-label={`Poke SeeQ — ${SHAPES[id].label} shape`}
              className="group flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2 pt-3 outline-none transition-colors hover:border-zinc-700 focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              <SeeqSprite shape={id} expression={poked === tileId ? "excited" : "idle"} size={62} />
              <span className="text-[10.5px] leading-none text-zinc-500 transition-colors group-hover:text-zinc-300">
                {SHAPES[id].label}
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
          const expr: Mood = poked === tileId ? "excited" : ex.id;
          return (
            <button
              key={ex.id}
              type="button"
              data-seeq-tile={tileId}
              onClick={() => poke(tileId)}
              aria-label={`Poke SeeQ — ${ex.label} expression`}
              className="group flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2 pt-3 outline-none transition-colors hover:border-zinc-700 focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              <SeeqSprite expression={expr} size={62} />
              <span className="text-[10.5px] leading-none text-zinc-500 transition-colors group-hover:text-zinc-300">
                {ex.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Colours */}
      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-zinc-600">Colours</p>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {THEME_IDS.map((id) => {
          const tileId = `colour-${id}`;
          const active = activeTheme === id;
          return (
            <button
              key={id}
              type="button"
              data-seeq-tile={tileId}
              data-seeq-active={active ? "1" : "0"}
              onClick={() => pickTheme(id)}
              aria-label={`Re-skin your SeeQ buddy — ${THEMES[id].label}`}
              aria-pressed={active}
              className={
                "group flex cursor-pointer flex-col items-center gap-1 rounded-lg border bg-zinc-900/40 p-2 pt-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400/60 " +
                (active
                  ? "border-emerald-400/60 ring-1 ring-emerald-400/40"
                  : "border-zinc-800/80 hover:border-zinc-700")
              }
            >
              <SeeqSprite theme={id} expression={poked === tileId ? "excited" : "happy"} size={62} />
              <span
                className={
                  "text-[10.5px] leading-none transition-colors " +
                  (active ? "text-emerald-300" : "text-zinc-500 group-hover:text-zinc-300")
                }
              >
                {THEMES[id].label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
