"use client";

// Universal strip — one thin band, site-wide, that always tells the truth
// about the company universe: 208 companies across 8 domains and every piece
// of practice content inside them. The numbers are generated at build time
// (scripts/gen-universe-counts.ts → lib/generated/universe-counts.ts) so this
// component costs a few hundred bytes instead of the full kit registry, and
// can never drift out of sync with the kits themselves.
import { UNIVERSE_COUNTS } from "@/lib/generated/universe-counts";

/** Deterministic thousands separator — deliberately not toLocaleString, so
    server and client render byte-identical output (no hydration mismatch). */
const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const CELLS: { label: string; value: number }[] = [
  { label: "companies", value: UNIVERSE_COUNTS.companies },
  { label: "domains", value: UNIVERSE_COUNTS.domains },
  { label: "problems", value: UNIVERSE_COUNTS.problems },
  { label: "theory cards", value: UNIVERSE_COUNTS.theory },
  { label: "MCQs", value: UNIVERSE_COUNTS.mcqs },
  { label: "cases", value: UNIVERSE_COUNTS.cases },
];

export function UniverseStrip() {
  return (
    <div className="border-b border-zinc-800/80 bg-zinc-950">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 sm:px-6">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          The universe
        </span>
        {CELLS.map((cell) => (
          <span key={cell.label} className="flex items-baseline gap-1.5 text-[12px]">
            <span className="tnum text-[13px] font-semibold text-zinc-100">{fmt(cell.value)}</span>
            <span className="text-zinc-500">{cell.label}</span>
          </span>
        ))}
        <button
          onClick={() => {
            window.location.hash = "#learn?view=companies";
            window.scrollTo({ top: 0 });
          }}
          className="ml-auto cursor-pointer text-[12px] font-medium text-emerald-400 transition-colors hover:text-emerald-300"
        >
          Explore all {fmt(UNIVERSE_COUNTS.companies)} →
        </button>
      </div>
    </div>
  );
}
