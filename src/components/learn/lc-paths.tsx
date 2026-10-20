"use client";

// Guided paths — the "what do I solve today?" answer. Four curated, ordered
// problem sets with a pace, a dot-rail of progress and a one-tap Continue
// that opens the first unsolved stop. Finishing a path banks a one-time
// bonus (lc-path:<id> — idempotent like every XP key).

import { useEffect } from "react";
import { CalendarClock, Check, Flag, Route, Sparkles } from "lucide-react";
import { LC_PATHS, pathDays, pathProblems, type LcPath } from "@/lib/leetcode/paths";
import { isLcSolved } from "@/lib/leetcode/lc-meta";
import { useProgress } from "@/lib/curriculum/progress";
import { celebrate } from "./celebrate";
import { Btn, Panel, ProgressBar } from "./ui/kit";
import { cn } from "@/lib/utils";

import type { LcDifficulty } from "@/lib/leetcode/types";

/** Difficulty hues — kept local (leetcode-view owns the full set). */
const DIFF_DOT: Record<LcDifficulty, string> = {
  Easy: "bg-emerald-400",
  Medium: "bg-amber-400",
  Hard: "bg-rose-400",
};

const TONE_EDGE: Record<LcPath["tone"], string> = {
  emerald: "bg-emerald-400",
  sky: "bg-sky-400",
  violet: "bg-violet-400",
  amber: "bg-amber-400",
};

const TONE_TEXT: Record<LcPath["tone"], string> = {
  emerald: "text-emerald-300",
  sky: "text-sky-300",
  violet: "text-violet-300",
  amber: "text-amber-300",
};

const TONE_RING: Record<LcPath["tone"], string> = {
  emerald: "border-emerald-400/25",
  sky: "border-sky-400/25",
  violet: "border-violet-400/25",
  amber: "border-amber-400/25",
};

function PathCard({ path, onOpen }: { path: LcPath; onOpen: (slug: string) => void }) {
  const awardXp = useProgress((s) => s.awardXp);
  const xpEvents = useProgress((s) => s.xpEvents);
  const problems = pathProblems(path);
  const solvedArr = problems.map((p) => isLcSolved(xpEvents, p.slug));
  const done = solvedArr.filter(Boolean).length;
  const complete = done === problems.length && problems.length > 0;
  const bonusKey = `lc-path:${path.id}`;
  const bonusBanked = xpEvents[bonusKey] !== undefined;
  const nextIdx = solvedArr.findIndex((s) => !s);
  const daysLeft = Math.ceil((problems.length - done) / path.perDay);

  // finishing a path banks its bonus once — checked live, same contract
  // as the badge watcher (an effect, not a render side effect)
  useEffect(() => {
    if (complete && !bonusBanked && awardXp(bonusKey, path.bonus)) {
      celebrate({ kind: "xp", title: `+${path.bonus} XP — ${path.title}`, sub: "Path complete · every stop solved" });
    }
  }, [complete, bonusBanked, bonusKey, path.bonus, path.title, awardXp]);

  return (
    <Panel pad={0} className="overflow-hidden">
      <div className={cn("h-0.5 w-full", TONE_EDGE[path.tone])} aria-hidden />
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={cn("flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]", TONE_TEXT[path.tone])}>
              <Route className="h-3 w-3" /> guided path · {problems.length} problems · ~{daysLeft > 0 ? daysLeft : 0} day{daysLeft === 1 ? "" : "s"} left at {path.perDay}/day
            </p>
            <h3 className="mt-1 text-base font-bold tracking-tight text-zinc-100">{path.title}</h3>
            <p className={cn("text-[11px] font-medium", TONE_TEXT[path.tone])}>{path.kicker}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-[10px] text-zinc-400">
              <CalendarClock className="h-3 w-3" /> {path.perDay}/day · {pathDays(path)}d
            </span>
            <span
              className={cn(
                "rounded-md border px-2 py-1 font-mono text-[10px]",
                bonusBanked
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-amber-400/30 bg-amber-400/10 text-amber-300",
              )}
              title="One-time XP bonus for finishing the path"
            >
              {bonusBanked ? "bonus banked" : `finish +${path.bonus} XP`}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">{path.blurb}</p>

        <ProgressBar value={problems.length ? done / problems.length : 0} className="mt-3" />
        <p className="tnum mt-1.5 font-mono text-[10px] text-zinc-600">
          {done}/{problems.length} solved
        </p>

        {/* dot rail — one cell per stop, emerald when solved */}
        <div className="mt-3 flex flex-wrap gap-1" aria-hidden>
          {problems.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => onOpen(p.slug)}
              title={`#${p.num} ${p.title} — ${p.difficulty}`}
              className={cn(
                "h-3 w-3 cursor-pointer rounded-[3px] border transition-transform hover:scale-125",
                solvedArr[i]
                  ? "border-emerald-400/50 bg-emerald-400/80"
                  : "border-zinc-700 bg-zinc-900 hover:border-zinc-500",
              )}
            >
              <span className={cn("mx-auto block h-full w-full scale-[0.45] rounded-[1px]", DIFF_DOT[p.difficulty], solvedArr[i] && "opacity-0")} />
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[11px] text-zinc-600">
            {complete ? (
              <span className="flex items-center gap-1.5 text-emerald-300">
                <Check className="h-3.5 w-3.5" /> Path complete — every stop solved.
              </span>
            ) : nextIdx >= 0 ? (
              <>
                Next stop: <span className="text-zinc-400">#{problems[nextIdx].num} {problems[nextIdx].title}</span> · {problems[nextIdx].difficulty}
              </>
            ) : (
              "Empty path — registry drift?"
            )}
          </p>
          {!complete && nextIdx >= 0 && (
            <Btn variant="soft" onClick={() => onOpen(problems[nextIdx].slug)}>
              Continue <Flag className="h-3 w-3" />
            </Btn>
          )}
        </div>
      </div>
    </Panel>
  );
}

export function LcPaths({ onOpen }: { onOpen: (slug: string) => void }) {
  return (
    <div className="space-y-4">
      <Panel pad={4}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold">Guided paths</h2>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          Four ways through the band, each an ordered list with a suggested pace — pick one, solve{" "}
          <span className="text-zinc-300">its next stop</span> whenever you sit down, and the rail keeps the
          score. Progress is the same ledger the Problems tab grades; nothing here is a second bookkeeping.
        </p>
      </Panel>
      {LC_PATHS.map((path) => (
        <PathCard key={path.id} path={path} onOpen={onOpen} />
      ))}
    </div>
  );
}
