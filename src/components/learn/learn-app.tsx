"use client";

// Learn shell — sidebar (module, rank, streak, lessons) + lesson content.
// A watcher effect converts progress into badges and level-up celebrations.

import { useEffect, useMemo, useRef, useState } from "react";
import { Flame, GraduationCap, RotateCcw } from "lucide-react";
import { LESSONS, MODULES } from "@/lib/curriculum/lessons";
import { useProgress } from "@/lib/curriculum/progress";
import { BADGES, currentStreak, levelFor, totalXp } from "@/lib/curriculum/gamification";
import { cn } from "@/lib/utils";
import { LessonView } from "./lesson-view";
import { CelebrationHost, celebrate } from "./celebrate";

function useBadgeWatcher() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const mcqAttempts = useProgress((s) => s.mcqAttempts);
  const badges = useProgress((s) => s.badges);
  const xpByDay = useProgress((s) => s.xpByDay);
  const dailyGoal = useProgress((s) => s.dailyGoal);
  const prevLevel = useRef(-1);
  const ready = useRef(false);

  const xp = useMemo(() => totalXp({ xpEvents }), [xpEvents]);
  const level = levelFor(xp);

  const ctx = useMemo(() => {
    const problemsSolved = Object.keys(xpEvents).filter((k) => k.startsWith("solve:")).length;
    const mcqsCorrect = Object.values(mcqAttempts).filter((a) => a.correct).length;
    const lessonsDone = Object.keys(xpEvents).filter((k) => k.startsWith("lesson:")).length;
    const perfectQuizzes = LESSONS.filter((l) =>
      l.mcqs.every((m) => mcqAttempts[m.id]?.firstTry),
    ).length;
    return { lessonsDone, problemsSolved, mcqsCorrect, perfectQuizzes };
  }, [xpEvents, mcqAttempts]);

  const streak = useMemo(() => currentStreak({ xpByDay, dailyGoal }), [xpByDay, dailyGoal]);

  useEffect(() => {
    if (!ready.current) {
      ready.current = true;
      prevLevel.current = level.index;
      return;
    }
    const store = useProgress.getState();
    for (const b of BADGES) {
      if (store.badges[b.id] === undefined && b.test(ctx, xp, streak)) {
        if (store.unlockBadge(b.id)) {
          celebrate({ kind: "badge", title: `Badge · ${b.title}`, sub: b.desc });
        }
      }
    }
    if (level.index > prevLevel.current) {
      celebrate({ kind: "level", title: `Level up — ${level.title}`, sub: `Rank ${level.index + 1} of 6` });
      prevLevel.current = level.index;
    }
  }, [ctx, xp, streak, level]);

  return { xp, level, streak, ctx };
}

function RankBlock({ xp, level, streak }: { xp: number; level: ReturnType<typeof levelFor>; streak: number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-100">{level.title}</span>
        <span className="font-mono text-xs text-emerald-300">{xp.toLocaleString()} XP</span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.round(level.pct * 100)}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-zinc-500">
        {level.next === null ? "Top rank reached — Query Wizard" : `${(level.next - xp).toLocaleString()} XP to ${titleAfter(level.index)}`}
      </p>
      <div className="mt-2.5 flex items-center gap-1.5 border-t border-zinc-800 pt-2.5 text-[11px] text-zinc-400">
        <Flame className={cn("h-3.5 w-3.5", streak > 0 ? "text-amber-400" : "text-zinc-600")} />
        {streak > 0 ? `${streak}-day streak — keep it alive` : "Hit your daily goal to start a streak"}
      </div>
    </div>
  );
}

function titleAfter(index: number): string {
  const ladder = ["Query Apprentice", "Analyst I", "Analyst II", "Senior Analyst", "Query Wizard"];
  return ladder[Math.min(index, ladder.length - 1)];
}

export function LearnApp() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { xp, level, streak, ctx } = useBadgeWatcher();
  const xpEvents = useProgress((s) => s.xpEvents);
  const resetAll = useProgress((s) => s.resetAll);
  const [confirmReset, setConfirmReset] = useState(false);

  const lesson = LESSONS.find((l) => l.id === openId) ?? null;
  const doneCount = LESSONS.filter((l) => xpEvents[`lesson:${l.id}`] !== undefined).length;
  const nextLesson = LESSONS.find((l) => xpEvents[`lesson:${l.id}`] === undefined) ?? LESSONS[LESSONS.length - 1];
  const totalProblems = LESSONS.reduce((a, l) => a + l.problems.length, 0);
  const totalMcqs = LESSONS.reduce((a, l) => a + l.mcqs.length, 0);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
      <CelebrationHost />

      {/* sidebar */}
      <aside className="w-full shrink-0 lg:sticky lg:top-[76px] lg:w-[300px] lg:max-h-[calc(100vh-96px)] lg:self-start">
        <div className="flex max-h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="shrink-0 border-b border-zinc-800 p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-zinc-100">SeeQL Curriculum</h2>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              {MODULES.length} modules · {LESSONS.length} lessons · {totalProblems} graded queries · {totalMcqs} quiz questions
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${(doneCount / LESSONS.length) * 100}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-500">{doneCount}/{LESSONS.length} lessons complete</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto thin-scrollbar">
            <div className="shrink-0 p-3">
              <RankBlock xp={xp} level={level} streak={streak} />
            </div>
            {MODULES.map((m) => {
              const mDone = m.lessons.filter((l) => xpEvents[`lesson:${l.id}`] !== undefined).length;
              return (
                <nav key={m.id} className="border-b border-zinc-800/60 px-3 pb-3 pt-3 last:border-b-0">
                  <div className="mb-1.5 flex items-baseline justify-between px-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                      Module {m.num} · {m.title}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-600">{mDone}/{m.lessons.length}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {m.lessons.map((l) => {
                      const done = xpEvents[`lesson:${l.id}`] !== undefined;
                      const active = l.id === openId;
                      return (
                        <button
                          key={l.id}
                          onClick={() => setOpenId(l.id)}
                          className={cn(
                            "flex items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                            active ? "bg-zinc-800" : "hover:bg-zinc-900",
                          )}
                        >
                          <span className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                            done ? "bg-emerald-400 text-[#052e1c]" : active ? "border border-zinc-500 text-zinc-200" : "border border-zinc-700 text-zinc-500",
                          )}>
                            {l.num}
                          </span>
                          <span className="min-w-0">
                            <span className={cn("block truncate text-xs font-medium", active ? "text-zinc-100" : "text-zinc-300")}>{l.title}</span>
                            <span className="block text-[10px] text-zinc-600">{l.minutes} min · {l.problems.length} queries</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </nav>
              );
            })}
          </div>

          <div className="shrink-0 border-t border-zinc-800 p-3">
            {confirmReset ? (
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-zinc-400">Erase all progress?</span>
                <span className="flex gap-1.5">
                  <button onClick={() => { resetAll(); setConfirmReset(false); }} className="rounded border border-rose-400/50 px-2 py-1 text-rose-300 hover:bg-rose-400/10">Erase</button>
                  <button onClick={() => setConfirmReset(false)} className="rounded border border-zinc-700 px-2 py-1 text-zinc-400 hover:bg-zinc-900">Keep</button>
                </span>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-1.5 text-[11px] text-zinc-600 transition-colors hover:text-zinc-400"
              >
                <RotateCcw className="h-3 w-3" /> Reset progress
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* content */}
      <main className="min-w-0 flex-1 pb-16">
        {lesson ? (
          <LessonView key={lesson.id} lesson={lesson} />
        ) : (
          <div className="max-w-3xl">
            <p className="font-mono text-xs text-zinc-500">{MODULES.length} MODULES · BEGINNER → ADVANCED</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">The SeeQL course</h1>
            <p className="mt-3 text-[15px] leading-7 text-zinc-400">
              Three modules, one real storefront database. Read a concept, prove it in a quiz, then solve
              graded live queries — {totalMcqs} quiz questions and {totalProblems} graded queries in total.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((m) => {
                const mDone = m.lessons.filter((l) => xpEvents[`lesson:${l.id}`] !== undefined).length;
                return (
                  <div key={m.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Module {m.num} · {m.level}</p>
                    <h3 className="mt-1.5 text-sm font-semibold text-zinc-100">{m.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">{m.blurb}</p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(mDone / m.lessons.length) * 100}%` }} />
                    </div>
                    <p className="mt-1.5 text-[11px] text-zinc-500">{mDone}/{m.lessons.length} lessons · {m.lessons.reduce((a, l) => a + l.problems.length, 0)} graded queries</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Rank", level.title],
                ["Total XP", xp.toLocaleString()],
                ["Streak", streak > 0 ? `${streak} days` : "—"],
                ["Badges", `${Object.keys(useProgress.getState().badges).length}/${BADGES.length}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500">{k}</p>
                  <p className="mt-1 truncate text-sm font-medium text-zinc-100">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <h3 className="text-sm font-semibold text-zinc-100">Badges</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {BADGES.map((b) => {
                  const earned = useProgress.getState().badges[b.id] !== undefined;
                  return (
                    <span
                      key={b.id}
                      title={b.desc}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-[11px]",
                        earned ? "border-amber-400/50 bg-amber-400/10 text-amber-200" : "border-zinc-800 text-zinc-600",
                      )}
                    >
                      {earned ? b.title : "· · ·"}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-zinc-100">
                  {ctx.lessonsDone > 0 ? "Welcome back." : "Start with lesson 1 — no setup, everything runs live."}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {ctx.problemsSolved} queries solved · {ctx.mcqsCorrect} quiz questions answered
                </p>
              </div>
              <button
                onClick={() => setOpenId(nextLesson.id)}
                className="rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[#052e1c] hover:bg-emerald-300"
              >
                {ctx.lessonsDone > 0 ? `Continue — lesson ${nextLesson.num} →` : "Start learning →"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
