"use client";

// Readiness Dashboard — the whole course on one honest page. Fourteen
// module rows (lessons for 1–11, the LC ledger's own slugs for the two
// lesson-less bands, and the Domain Mastery band folded in from pack XP),
// each with its progress bar and exam badge, rolled up
// into one course-wide readiness number: the plain mean of module
// completions, weighted equally because no module is optional. Streaks and
// the review queue sit beside it — the maintenance signals that keep the
// number from eroding. No navigation, no gamified filler: this is the
// mirror, not the motivational poster.

import { useMemo } from "react";
import { Check, Flame, GraduationCap, RefreshCcw, Target } from "lucide-react";
import { MODULES } from "@/lib/curriculum/lessons";
import { useProgress, dueReviews } from "@/lib/curriculum/progress";
import { puzzleStreak } from "@/lib/curriculum/daily";
import { BAND_BY_MODULE } from "@/lib/leetcode/sections";
import { dmReadinessStats } from "@/lib/leetcode/domain-packs";
import { lcBadgeStats } from "@/lib/leetcode/lc-meta";
import { lcDailyStreak } from "@/lib/leetcode/daily";
import { Panel, Btn } from "./ui/kit";
import { cn } from "@/lib/utils";

export function ReadinessDashboard({
  onOpenLc,
  onOpenDomains,
  onOpenLesson,
}: {
  onOpenLc: () => void;
  /** Deep-link into the Big Board's Domains tab (dm band row). */
  onOpenDomains?: () => void;
  onOpenLesson: (id: string) => void;
}) {
  const xpEvents = useProgress((s) => s.xpEvents);
  const exams = useProgress((s) => s.exams);
  const reviewSchedule = useProgress((s) => s.reviewSchedule);
  const review = useProgress((s) => s.review);
  const puzzleDone = useProgress((s) => s.puzzleDone);
  const freezes = useProgress((s) => s.freezes);
  const lcDailyDone = useProgress((s) => s.lcDailyDone);

  const rows = useMemo(() => {
    const moduleRows = MODULES.map((m) => {
      const band = BAND_BY_MODULE[m.id];
      const isBand = m.lessons.length === 0 && !!band;
      const total = band ? band.slugs.length : m.lessons.length;
      const done = band
        ? band.slugs.filter((s) => xpEvents[`lc:${s}`] !== undefined).length
        : m.lessons.filter((l) => xpEvents[`lesson:${l.id}`] !== undefined).length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      const exam = exams[m.id];
      return { module: m, isBand, dm: false, total, done, pct, exam };
    });
    // the Domain Mastery band folds into the plain mean — pack XP moves the
    // course number (a case counts once, matching the pack header chip)
    const dm = dmReadinessStats(xpEvents);
    const dmRow = {
      module: { id: "dm-band", num: 14, title: "Domain Mastery", lessons: [] },
      isBand: true,
      dm: true,
      total: dm.total,
      done: dm.done,
      pct: dm.total ? Math.round((dm.done / dm.total) * 100) : 0,
      exam: undefined,
    };
    return [...moduleRows, dmRow];
  }, [MODULES, xpEvents, exams]);

  const readiness = Math.round(rows.reduce((a, r) => a + r.pct, 0) / (rows.length || 1));
  const weak = rows.filter((r) => r.pct < 50);
  const cleared = rows.filter((r) => r.pct === 100).length;
  const examPasses = rows.filter((r) => r.exam?.passedAt).length;
  const reviewsDue = dueReviews(reviewSchedule).length + Object.keys(review).length;
  const pStreak = puzzleStreak(puzzleDone, freezes).streak;
  const lcStreak = lcDailyStreak(lcDailyDone);
  const badges = lcBadgeStats(xpEvents);

  const tone =
    readiness >= 80 ? "text-emerald-300" : readiness >= 50 ? "text-amber-300" : "text-rose-300";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-4 pb-24 md:p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tight">Course readiness</h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Every module on one page — lessons for the teaching modules, the honest XP ledger for the two
          LeetCode bands and the Domain Mastery packs. The readiness number is the plain mean of module
          completions; no module is optional,
          so none is weighted away.
        </p>
      </header>

      <Panel pad={4}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-baseline gap-2">
            <span className={cn("tnum font-mono text-4xl font-bold", tone)}>{readiness}</span>
            <span className="font-mono text-sm text-zinc-600">/100 course-wide</span>
          </div>
          <div className="h-2 min-w-40 flex-1 overflow-hidden rounded-full bg-zinc-800" aria-hidden>
            <div
              className="h-full rounded-full bg-emerald-400/80 transition-all duration-500"
              style={{ width: `${readiness}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            {cleared} cleared · {examPasses} exams passed · {badges.lcVerified} verified solves
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/[0.07] px-2 py-0.5 font-mono">
            <Flame className="h-3 w-3 text-amber-300" /> daily puzzle {pStreak}-day
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/[0.07] px-2 py-0.5 font-mono">
            <Target className="h-3 w-3 text-emerald-300" /> LC daily {lcStreak}-day
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-400/[0.07] px-2 py-0.5 font-mono">
            <RefreshCcw className="h-3 w-3 text-sky-300" /> {reviewsDue} in the review queue
          </span>
        </div>
      </Panel>

      {weak.length > 0 && (
        <Panel pad={4}>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold">Weak spots — under 50%</h2>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {weak.map((r) => (
              <button
                key={r.module.id}
                type="button"
                onClick={() =>
                  r.dm
                    ? (onOpenDomains ?? onOpenLc)()
                    : r.isBand
                      ? onOpenLc()
                      : onOpenLesson(r.module.lessons.find((l) => xpEvents[`lesson:${l.id}`] === undefined)?.id ?? r.module.lessons[0]?.id ?? "")
                }
                className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-left font-mono text-[11px] text-zinc-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
              >
                M{r.module.num} {r.module.title} · {r.pct}%
              </button>
            ))}
          </div>
        </Panel>
      )}

      <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
        {rows.map((r, i) => (
          <div
            key={r.module.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              i > 0 && "border-t border-black/5 dark:border-white/5",
            )}
          >
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[10px] text-zinc-300"
              style={{
                background: `conic-gradient(var(--color-emerald-400) ${r.pct}%, var(--color-zinc-800) ${r.pct}%)`,
              }}
            >
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-zinc-950">
                {r.pct === 100 ? <Check className="h-3 w-3 text-emerald-300" /> : r.module.num}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-zinc-100">{r.module.title}</span>
              <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-zinc-800" aria-hidden>
                <span
                  className="block h-full rounded-full bg-emerald-400/80 transition-all duration-500"
                  style={{ width: `${r.pct}%` }}
                />
              </span>
            </span>
            {r.exam?.passedAt && (
              <span className="shrink-0 rounded-full border border-emerald-400/30 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-300">
                exam {r.exam.best}/{r.exam.total}
              </span>
            )}
            <span className="tnum w-14 shrink-0 text-right font-mono text-[11px] text-zinc-500">
              {r.done}/{r.total}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center pb-2">
        <Btn
          variant="ghost"
          onClick={() => {
            const next = rows.find((r) => r.pct < 100);
            if (next) {
              if (next.dm) (onOpenDomains ?? onOpenLc)();
              else if (next.isBand) onOpenLc();
              else {
                const l = next.module.lessons.find((ls) => xpEvents[`lesson:${ls.id}`] === undefined);
                if (l) onOpenLesson(l.id);
              }
            }
          }}
        >
          Continue where the numbers are lowest
        </Btn>
      </div>
    </div>
  );
}
