"use client";

// Lightweight shell-header controls (XP rank, Tour trigger, Search trigger)
// separated from learn-app and command-palette so SSR on `/` stays tiny and
// never pulls the 40 MB curriculum + 208 company kits bundle into server RAM.

import { useEffect, useMemo, useState } from "react";
import { Compass, Flame, Search, Zap } from "lucide-react";
import { useProgress } from "@/lib/curriculum/progress";
import { currentStreak, totalXp } from "@/lib/curriculum/gamification";
import { cn } from "@/lib/utils";
import { markTourSeen, tourSeen } from "./onboarding-tour";

export function HeaderRank() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const xpByDay = useProgress((s) => s.xpByDay);
  const dailyGoal = useProgress((s) => s.dailyGoal);
  const xp = useMemo(() => totalXp({ xpEvents }), [xpEvents]);
  const streak = useMemo(() => currentStreak({ xpByDay, dailyGoal }), [xpByDay, dailyGoal]);
  return (
    <div className="flex items-center gap-1.5" aria-label={`Total XP ${xp}, streak ${streak} days`}>
      <span
        className="flex items-center gap-1 rounded-md border border-amber-400/25 bg-amber-400/[0.08] px-2 py-1 text-[11px] font-semibold text-amber-200"
        title="Total XP — every correct answer, mock and lesson banks here"
      >
        <Zap className="h-3 w-3" />
        <span className="tnum">{xp.toLocaleString()}</span>
        <span className="hidden text-amber-200/70 sm:inline">XP</span>
      </span>
      <span
        className={cn(
          "flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold",
          streak > 0
            ? "border-orange-400/25 bg-orange-400/[0.08] text-orange-200"
            : "border-zinc-800 bg-zinc-900 text-zinc-500",
        )}
        title={streak > 0 ? `${streak}-day streak — hit your daily goal to keep it alive` : "Hit your daily goal to start a streak"}
      >
        <Flame className={cn("h-3 w-3", streak === 0 && "opacity-50 grayscale")} />
        <span className="tnum">{streak > 0 ? `${streak}d` : "—"}</span>
      </span>
    </div>
  );
}

export function HeaderTourButton() {
  const [seen, setSeen] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    setSeen(tourSeen());
    const t = setInterval(() => setSeen(tourSeen()), 1500);
    return () => clearInterval(t);
  }, []);
  const replay = () => {
    markTourSeen();
    setSeen(true);
    window.dispatchEvent(new CustomEvent("seeql:tour-replay"));
  };
  return (
    <div className="relative">
      <button
        onClick={replay}
        data-tour="header-tour"
        aria-label="Replay the guided tour"
        title="Replay the guided tour"
        className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900"
      >
        <Compass className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Tour</span>
      </button>
      {!seen && !dismissed && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-lg border border-sky-400/30 bg-zinc-900 p-3 shadow-xl shadow-black/40">
          <p className="text-xs font-medium text-zinc-100">First time here?</p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
            Take the 60-second tour — the course, the universe and where everything lives.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={replay}
              className="rounded-md bg-sky-400 px-2.5 py-1.5 text-[11px] font-medium text-[var(--brand-ink)] transition-colors hover:bg-sky-300"
            >
              Take the tour
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="rounded-md border border-zinc-700 px-2.5 py-1.5 text-[11px] text-zinc-400 transition-colors hover:text-zinc-200"
            >
              Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Header chip that opens the palette — gives ⌘K a visible, tappable home. */
export function SearchButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("seeql:palette"))}
      aria-label="Search — open the command palette (Control K)"
      title="Search everything — ⌘K"
      className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden md:inline">Search</span>
      <kbd className="hidden rounded border border-zinc-700 bg-zinc-900 px-1 font-mono text-[10px] text-zinc-500 md:inline">⌘K</kbd>
    </button>
  );
}

