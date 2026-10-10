"use client";

// Leaderboard — the hall of records. SeeQL is a single-player, local-first
// game, so the board ranks the only fair opponent: you. Every row is a
// personal record read live from the ledgers that already exist (progress
// store, blitz wall, drill attempts, golf XP keys) — no new storage, which
// means the progress export in the sidebar ships the whole board for free.
// Records group into three boards: Knowledge, Speed & streaks, Craft. Each
// row can render itself as a share card; the header shares the combined
// card. Module exam honors sit at the bottom with one-tap entry.

import { useMemo, useState } from "react";
import { ArrowRight, GraduationCap, Gem, Trophy, Zap } from "lucide-react";
import { BADGES, bestStreak, currentStreak, LEVELS, levelFor, totalXp } from "@/lib/curriculum/gamification";
import { LESSONS, MODULES } from "@/lib/curriculum/lessons";
import { useProgress } from "@/lib/curriculum/progress";
import { DRILL_SETS } from "@/lib/curriculum/drills";
import { GOLF_XP } from "@/lib/curriculum/golf";
import { puzzleStreak } from "@/lib/curriculum/daily";
import type { ToolKind } from "./tools";
import { cardForRecord, cardForRecords } from "@/lib/share-cards";
import { ShareCardButton, ShareCardIcon } from "./share-button";
import { Panel } from "./ui/kit";
import { Icon3D } from "./ui/icon3d";
import { cn } from "@/lib/utils";

// ---- data helpers ----------------------------------------------------------

interface BlitzSnap {
  best: number;
  bestAt: number;
  rounds: Array<{ at: number; p: number; c: number; n: number; s: number }>;
}

const BLITZ_EMPTY: BlitzSnap = { best: 0, bestAt: 0, rounds: [] };

/** Defensive read of the blitz wall (seeql.blitz.v1 — written by
 *  blitz-mode.tsx). Lazy per mount: switching views re-reads it. */
function readBlitz(): BlitzSnap {
  if (typeof window === "undefined") return BLITZ_EMPTY;
  try {
    const raw = localStorage.getItem("seeql.blitz.v1");
    if (!raw) return BLITZ_EMPTY;
    const parsed = JSON.parse(raw) as Partial<BlitzSnap>;
    if (typeof parsed.best !== "number" || !Array.isArray(parsed.rounds)) return BLITZ_EMPTY;
    return {
      best: parsed.best,
      bestAt: typeof parsed.bestAt === "number" ? parsed.bestAt : 0,
      rounds: parsed.rounds.filter((r) => r && typeof r.p === "number"),
    };
  } catch {
    return BLITZ_EMPTY;
  }
}

/** Best-ever run of consecutive puzzle days from the ledger (freezes don't
 *  count here — this is the raw solved-day run). */
function bestPuzzleRun(done: Record<string, number>): number {
  const keys = Object.keys(done).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of keys) {
    const [y, m, d] = k.split("-").map(Number);
    const day = new Date(y, m - 1, d);
    const consecutive = prev !== null && day.getTime() - prev.getTime() === 86_400_000;
    run = consecutive ? run + 1 : 1;
    if (run > best) best = run;
    prev = day;
  }
  return best;
}

/** XP summed over the trailing 7 local days, and the 7 before that. */
function weekOverWeek(xpByDay: Record<string, number>): { thisWeek: number; lastWeek: number } {
  const sum = (from: Date, days: number) => {
    let total = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      total += xpByDay[key] ?? 0;
    }
    return total;
  };
  const now = new Date();
  return { thisWeek: sum(now, 7), lastWeek: sum(new Date(now.getTime() - 7 * 86_400_000), 7) };
}

function dayLabel(ts: number | undefined): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ---- the view ----------------------------------------------------------------

interface Rec {
  id: string;
  board: "Knowledge" | "Speed & streaks" | "Craft";
  label: string;
  value: string;
  sub: string;
  setAt?: number;
  go?: ToolKind;
}

const BOARD_META: Record<Rec["board"], { icon: typeof Zap; line: string }> = {
  Knowledge: { icon: GraduationCap, line: "the course, conquered" },
  "Speed & streaks": { icon: Zap, line: "the clock, beaten" },
  Craft: { icon: Gem, line: "the polish, earned" },
};

export function LeaderboardView({
  onGo,
  onOpenExam,
}: {
  onGo: (kind: ToolKind) => void;
  onOpenExam: (moduleId: string) => void;
}) {
  const xpEvents = useProgress((s) => s.xpEvents);
  const xpByDay = useProgress((s) => s.xpByDay);
  const dailyGoal = useProgress((s) => s.dailyGoal);
  const exams = useProgress((s) => s.exams);
  const badges = useProgress((s) => s.badges);
  const mcqAttempts = useProgress((s) => s.mcqAttempts);
  const reviewCorrect = useProgress((s) => s.reviewCorrect);
  const reviewWrong = useProgress((s) => s.reviewWrong);
  const puzzleDone = useProgress((s) => s.puzzleDone);
  const backlogDone = useProgress((s) => s.backlogDone);
  const freezes = useProgress((s) => s.freezes);

  // the blitz wall is plain localStorage — read once per mount
  const [blitz] = useState<BlitzSnap>(readBlitz);

  const records = useMemo<Rec[]>(() => {
    const xp = totalXp({ xpEvents });
    const level = levelFor(xp);
    const best = bestStreak({ xpByDay, dailyGoal });
    const cur = currentStreak({ xpByDay, dailyGoal });
    const { thisWeek, lastWeek } = weekOverWeek(xpByDay);

    const lessonsDone = LESSONS.filter((l) => xpEvents[`lesson:${l.id}`] !== undefined);
    const nextLesson = LESSONS.find((l) => xpEvents[`lesson:${l.id}`] === undefined);
    const solved = Object.keys(xpEvents).filter((k) => k.startsWith("solve:")).length;
    const examEntries = Object.values(exams);
    const examsPassed = examEntries.filter((e) => e.passedAt).length;
    const bestPaper = examEntries.reduce<{ best: number; total: number } | null>(
      (acc, e) => (acc === null || e.best / e.total > acc.best / acc.total ? { best: e.best, total: e.total } : acc),
      null,
    );
    const perfectQuizzes = LESSONS.filter((l) => l.mcqs.every((m) => mcqAttempts[m.id]?.firstTry)).length;

    const allDrillQs = DRILL_SETS.flatMap((s) => s.questions);
    const drillsAnswered = allDrillQs.filter((q) => mcqAttempts[q.id] !== undefined).length;
    const drillsMastered = allDrillQs.filter((q) => mcqAttempts[q.id]?.correct).length;

    const badgeEntries = Object.entries(badges).sort((a, b) => b[1] - a[1]);
    const latestBadge = badgeEntries[0] ? BADGES.find((b) => b.id === badgeEntries[0][0]) : undefined;

    const blitzBestStreak = blitz.rounds.reduce((m, r) => Math.max(m, r.s ?? 0), 0);
    const bestDay = Object.entries(xpByDay).reduce<{ v: number; key: string } | null>(
      (acc, [k, v]) => (acc === null || v > acc.v ? { v, key: k } : acc),
      null,
    );
    const puzzles = Object.keys(puzzleDone).length + Object.keys(backlogDone).length;
    const puzzleBest = bestPuzzleRun(puzzleDone);
    const puzzleNow = puzzleStreak(puzzleDone, freezes).streak;

    const golfEntries = Object.entries(xpEvents).filter(([k]) => k.startsWith("golf:"));
    const eagles = golfEntries.filter(([, v]) => v === GOLF_XP.eagle).length;
    const pars = golfEntries.filter(([, v]) => v === GOLF_XP.par).length;

    const reviewTotal = reviewCorrect + reviewWrong;
    const recall = reviewTotal === 0 ? null : Math.round((reviewCorrect / reviewTotal) * 100);

    return [
      // ---- Knowledge
      {
        id: "lessons",
        board: "Knowledge",
        label: "Lessons complete",
        value: `${lessonsDone.length}/${LESSONS.length}`,
        sub: nextLesson ? `next up — ${nextLesson.title}` : "every lesson, done",
      },
      {
        id: "exams",
        board: "Knowledge",
        label: "Module exams passed",
        value: `${examsPassed}/${MODULES.length}`,
        sub: bestPaper ? `best paper ${bestPaper.best}/${bestPaper.total}` : "12 questions each · pass at 9",
      },
      {
        id: "problems",
        board: "Knowledge",
        label: "Graded queries solved",
        value: `${solved}`,
        sub: "live runs, checked row for row",
      },
      {
        id: "drills",
        board: "Knowledge",
        label: "Drill questions mastered",
        value: `${drillsMastered}/${allDrillQs.length}`,
        sub: `${drillsAnswered} attempted · ${DRILL_SETS.length} banks`,
        go: "drills",
      },
      {
        id: "perfect",
        board: "Knowledge",
        label: "Perfect quizzes",
        value: `${perfectQuizzes}`,
        sub: "every answer right, first try",
      },
      {
        id: "badges",
        board: "Knowledge",
        label: "Badges unlocked",
        value: `${badgeEntries.length}/${BADGES.length}`,
        sub: latestBadge ? `latest — ${latestBadge.title}` : "the shelf is waiting",
      },
      // ---- Speed & streaks
      {
        id: "blitz-best",
        board: "Speed & streaks",
        label: "Blitz best",
        value: `${blitz.best.toLocaleString("en-US")} pts`,
        sub: blitz.bestAt ? `set ${dayLabel(blitz.bestAt)} · ${blitz.rounds.length} rounds on the wall` : "90 seconds, all engines",
        setAt: blitz.bestAt || undefined,
        go: "blitz",
      },
      {
        id: "blitz-streak",
        board: "Speed & streaks",
        label: "Blitz best streak",
        value: `${blitzBestStreak}`,
        sub: "right answers in a row, one round",
        go: "blitz",
      },
      {
        id: "streak-best",
        board: "Speed & streaks",
        label: "Longest goal streak",
        value: `${best} day${best === 1 ? "" : "s"}`,
        sub: `current streak ${cur} · goal ${dailyGoal} XP/day`,
      },
      {
        id: "best-day",
        board: "Speed & streaks",
        label: "Biggest day",
        value: `${(bestDay?.v ?? 0).toLocaleString("en-US")} XP`,
        sub: bestDay ? `on ${dayLabel(new Date(bestDay.key).getTime()) || bestDay.key}` : "no days logged yet",
      },
      {
        id: "puzzles",
        board: "Speed & streaks",
        label: "Daily puzzles solved",
        value: `${puzzles}`,
        sub: `best run ${puzzleBest} · current ${puzzleNow}`,
        go: "daily",
      },
      {
        id: "week-xp",
        board: "Speed & streaks",
        label: "XP this week",
        value: `${thisWeek.toLocaleString("en-US")}`,
        sub: `${thisWeek >= lastWeek ? "+" : "−"}${Math.abs(thisWeek - lastWeek).toLocaleString("en-US")} vs last week (${lastWeek.toLocaleString("en-US")})`,
      },
      // ---- Craft
      {
        id: "golf",
        board: "Craft",
        label: "Golf holes played",
        value: `${golfEntries.length}`,
        sub: `${eagles} eagle · ${pars} par · under par is the game`,
        go: "golf",
      },
      {
        id: "recall",
        board: "Craft",
        label: "Review recall rate",
        value: recall === null ? "—" : `${recall}%`,
        sub: recall === null ? "miss a question to join the deck" : `${reviewCorrect} recalls · ${reviewWrong} misses`,
      },
      {
        id: "xp",
        board: "Craft",
        label: "Total XP",
        value: xp.toLocaleString("en-US"),
        sub: `${level.title} · rank ${level.index + 1} of ${LEVELS.length}`,
      },
    ];
  }, [xpEvents, xpByDay, dailyGoal, exams, badges, mcqAttempts, reviewCorrect, reviewWrong, puzzleDone, backlogDone, freezes, blitz]);

  const xp = useMemo(() => totalXp({ xpEvents }), [xpEvents]);
  const level = levelFor(xp);
  const cur = useMemo(() => currentStreak({ xpByDay, dailyGoal }), [xpByDay, dailyGoal]);

  const boards: Rec["board"][] = ["Knowledge", "Speed & streaks", "Craft"];
  const summaryRows = ["xp", "lessons", "blitz-best", "exams"]
    .map((id) => records.find((r) => r.id === id))
    .filter((r): r is Rec => Boolean(r));

  return (
    <div className="max-w-5xl">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Hall of records</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-zinc-50">
            <Icon3D name="trophy" size={26} anim="bob" />
            Leaderboard
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-400">
            {MODULES.length} boards, one player — you vs. you. Every record reads live from your own
            ledgers; nothing leaves this device, and the sidebar Export ships the whole shelf.
          </p>
        </div>
        <ShareCardButton
          spec={cardForRecords(
            summaryRows.map((r) => ({ label: r.label, value: r.value })),
            xp,
            level.title,
          )}
          filename="seeql-records.png"
          label="Share record card"
        />
      </div>

      {/* quick chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { label: "total xp", value: xp.toLocaleString("en-US") },
          { label: "rank", value: `${level.index + 1}/${LEVELS.length} · ${level.title}` },
          { label: "streak", value: `${cur} day${cur === 1 ? "" : "s"}` },
          { label: "blitz best", value: blitz.best > 0 ? `${blitz.best.toLocaleString("en-US")} pts` : "—" },
        ].map((c) => (
          <span
            key={c.label}
            className="tnum flex items-baseline gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5"
          >
            <span className="font-display text-sm font-semibold text-zinc-100">{c.value}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{c.label}</span>
          </span>
        ))}
      </div>

      {/* the three boards */}
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {boards.map((board) => {
          const meta = BOARD_META[board];
          const rows = records.filter((r) => r.board === board);
          const Icon = meta.icon;
          return (
            <Panel key={board} tone="nested" pad={3.5} rounded="lg" className="flex flex-col">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="flex items-center gap-1.5 font-display text-sm font-semibold text-zinc-100">
                  <Icon className="h-4 w-4 text-emerald-300" />
                  {board}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{meta.line}</span>
              </div>
              <ul className="mt-2 flex flex-col" aria-label={`${board} records`}>
                {rows.map((r) => (
                  <li key={r.id} className="group flex items-center gap-3 rounded-md px-1.5 py-2.5 transition-colors hover:bg-zinc-900/50">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-zinc-300">{r.label}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-zinc-600">{r.sub}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <span className="text-right">
                        <span className="tnum block font-display text-sm font-semibold text-zinc-100">{r.value}</span>
                        {r.setAt ? <span className="block text-[9px] text-zinc-600">{dayLabel(r.setAt)}</span> : null}
                      </span>
                      <ShareCardIcon
                        spec={cardForRecord({ board: r.board, label: r.label, value: r.value, sub: r.sub })}
                        filename={`seeql-record-${r.id}.png`}
                        label={`Share a card for ${r.label}`}
                      />
                      {r.go && (
                        <button
                          onClick={() => onGo(r.go as ToolKind)}
                          title={`Open ${r.label} surface`}
                          aria-label={`Go to ${r.label}`}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-emerald-300"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          );
        })}
      </div>

      {/* exam honors */}
      <Panel tone="nested" pad={3.5} rounded="lg" className="mt-3">
        <div className="flex items-baseline justify-between">
          <h2 className="flex items-center gap-1.5 font-display text-sm font-semibold text-zinc-100">
            <GraduationCap className="h-4 w-4 text-emerald-300" />
            Exam honors
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">best paper per module</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {MODULES.map((m) => {
            const rec = exams[m.id];
            const passed = Boolean(rec?.passedAt);
            return (
              <button
                key={m.id}
                onClick={() => onOpenExam(m.id)}
                title={passed ? `Best ${rec!.best}/${rec!.total} · passed` : "12 questions · pass at 9"}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-zinc-900",
                  passed ? "border-emerald-400/40 bg-emerald-400/[0.06]" : "border-zinc-800 bg-zinc-950",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-[10px]",
                    passed ? "border-emerald-400/50 text-emerald-300" : "border-zinc-800 text-zinc-500",
                  )}
                >
                  {m.num}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-medium text-zinc-200">{m.title}</span>
                  <span className={cn("tnum block font-mono text-[10px]", passed ? "text-emerald-300/80" : "text-zinc-600")}>
                    {rec ? `best ${rec.best}/${rec.total}` : "not attempted"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
        Records update the moment their ledger does — play a round, pass an exam, solve a puzzle, and the
        board rewrites itself. The share icon on any row renders that record as a PNG card.
      </p>
    </div>
  );
}
