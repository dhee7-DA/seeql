"use client";

// Daily puzzle calendar — enhancement #3. One hand-authored puzzle per
// calendar day (deterministically assigned from the bank — see
// curriculum/daily.ts), a month grid with solved/frozen/today marks, and a
// puzzle workspace graded live against the sandbox like query golf.
//
// Stakes: TODAY pays full XP and advances the streak (markPuzzleDone).
// Missed days of the current or previous month stay solvable as backlog —
// reduced XP, no streak credit (markBacklogDone). Older days seal. Freeze
// tokens bridge streak gaps: earned at every natural 7-day run, max 2 held,
// bridging derived in puzzleStreak(). A month with every day solved earns
// the Perfect Month chip (and badge).

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Loader2,
  Lock,
  Play,
  RotateCcw,
  Snowflake,
  Trophy,
} from "lucide-react";
import { useProgress } from "@/lib/curriculum/progress";
import {
  DAILY_PUZZLES,
  PUZZLE_XP,
  monthPerfect,
  puzzleForDate,
  puzzleStreak,
  dayKeyOf,
  type DailyPuzzle,
} from "@/lib/curriculum/daily";
import { reportMentorFailure } from "@/lib/mentor-context";
import type { ExecResponse } from "@/lib/sql-types";
import { cn } from "@/lib/utils";
import { awardPracticeXp, execSql, MiniGrid, recordPracticeAttempt, rowsMatch } from "./practice-kit";
import { celebrate } from "./celebrate";
import { SqlEditor } from "../sql-editor";
import { SqlNodes } from "./sql-code";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** month index that advances exactly 1 per calendar month */
function monthIdx(y: number, m: number): number {
  return y * 12 + (m - 1);
}

function monthKeyOf(y: number, m: number): string {
  return `${y}-${String(m).padStart(2, "0")}`;
}

const DIFF_TONE: Record<string, string> = {
  easy: "border-emerald-400/40 text-emerald-300",
  medium: "border-amber-400/40 text-amber-300",
  hard: "border-rose-400/40 text-rose-300",
};

// ---- calendar ------------------------------------------------------------

function CalendarGrid({
  cursor,
  today,
  selected,
  puzzleDone,
  backlogDone,
  frozenDays,
  perfect,
  onPick,
  onNav,
}: {
  cursor: { y: number; m: number };
  today: string;
  selected: string;
  puzzleDone: Record<string, number>;
  backlogDone: Record<string, number>;
  frozenDays: string[];
  perfect: boolean;
  onPick: (key: string) => void;
  onNav: (dir: -1 | 1) => void;
}) {
  const { y, m } = cursor;
  const daysInMonth = new Date(y, m, 0).getDate();
  // Monday-first offset for the 1st of the month
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const mk = monthKeyOf(y, m);
  const nowIdx = monthIdx(new Date().getFullYear(), new Date().getMonth() + 1);
  const curIdx = monthIdx(y, m);

  const cells: Array<string | null> = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${mk}-${String(i + 1).padStart(2, "0")}`),
  ];

  return (
    <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-semibold tracking-[-0.01em] text-zinc-100">
          {MONTH_NAMES[m - 1]} {y}
        </p>
        <div className="flex items-center gap-2">
          {perfect && (
            <span className="flex items-center gap-1 rounded border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
              <Check className="h-3 w-3" /> perfect month
            </span>
          )}
          <button
            onClick={() => onNav(-1)}
            aria-label="Previous month"
            className="rounded-md border border-zinc-800 p-1.5 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onNav(1)}
            disabled={curIdx >= nowIdx}
            aria-label="Next month"
            className={cn(
              "rounded-md border border-zinc-800 p-1.5 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200",
              curIdx >= nowIdx && "cursor-not-allowed opacity-30 hover:bg-transparent",
            )}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d) => (
          <p key={d} className="pb-1 text-center font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            {d}
          </p>
        ))}
        {cells.map((key, i) => {
          if (key === null) return <div key={`blank-${i}`} aria-hidden />;
          const day = Number(key.slice(-2));
          const solved = puzzleDone[key] !== undefined || backlogDone[key] !== undefined;
          const frozen = !solved && frozenDays.includes(key);
          const isToday = key === today;
          const isFuture = key > today;
          const sealed =
            !solved &&
            monthIdx(Number(key.slice(0, 4)), Number(key.slice(5, 7))) < nowIdx - 1;
          return (
            <button
              key={key}
              onClick={() => onPick(key)}
              disabled={isFuture}
              aria-label={`${key} — ${solved ? "solved" : frozen ? "streak freeze" : isToday ? "today" : isFuture ? "locked" : sealed ? "sealed" : "unsolved"}`}
              title={sealed ? "Sealed — only the current and previous month stay open" : undefined}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-md border font-mono text-xs transition-colors",
                solved
                  ? "border-emerald-400/60 bg-emerald-400/15 font-semibold text-emerald-200"
                  : frozen
                    ? "border-sky-400/40 bg-sky-400/10 text-sky-300"
                    : isToday
                      ? "border-emerald-400 text-emerald-300"
                      : sealed
                        ? "border-zinc-800/60 text-zinc-700"
                        : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-200",
                key === selected && "ring-1 ring-emerald-400 ring-offset-1 ring-offset-zinc-950",
                isFuture && "cursor-not-allowed",
              )}
            >
              <span>{day}</span>
              {solved && <Check className="absolute right-1 top-1 h-2.5 w-2.5 text-emerald-300" />}
              {frozen && <Snowflake className="absolute right-1 top-1 h-2.5 w-2.5 text-sky-300" />}
              {sealed && <Lock className="absolute right-1 top-1 h-2.5 w-2.5 text-zinc-700" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- puzzle workspace ------------------------------------------------------

interface RunState {
  running: boolean;
  result: ExecResponse | null;
  target: ExecResponse | null;
  match: boolean | null;
  runs: number;
}

function SolvedCard({ puzzle, day }: { puzzle: DailyPuzzle; day: string }) {
  return (
    <div className="space-y-4">
      <div className="sheen rounded-lg border border-emerald-400/30 bg-emerald-400/[0.06] p-4 sm:p-5">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">
          <Trophy className="h-3.5 w-3.5" /> solved · {day}
        </p>
        <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-100">{puzzle.prompt}</p>
      </div>
      <div className="sheen rounded-lg border border-violet-400/25 bg-violet-400/[0.05] p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">why it matters</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">{puzzle.lesson}</p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">reference solution</p>
        <div className="mt-1.5 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-3 font-mono text-[13px] leading-6 text-zinc-200">
          <SqlNodes text={puzzle.solution} />
        </div>
      </div>
    </div>
  );
}

function PuzzleWorkspace({ day, isToday, puzzle }: { day: string; isToday: boolean; puzzle: DailyPuzzle }) {
  const banked = useProgress((s) => s.puzzleDone[day] !== undefined || s.backlogDone[day] !== undefined);
  const [sql, setSql] = useState("");
  const [run, setRun] = useState<RunState>({ running: false, result: null, target: null, match: null, runs: 0 });
  const [solved, setSolved] = useState(false);
  const [hints, setHints] = useState(0);

  // one-time reference run — the solution defines the grading target
  // (skipped for already-banked days: they render the solved card only)
  useEffect(() => {
    if (banked) return;
    let alive = true;
    execSql(puzzle.solution).then((res) => {
      if (alive) setRun((s) => ({ ...s, target: res }));
    });
    return () => {
      alive = false;
    };
  }, [puzzle.solution, banked]);

  const showSolved = banked || solved;

  async function play() {
    if (run.running || !sql.trim() || !run.target) return;
    setRun((s) => ({ ...s, running: true }));
    const result = await execSql(sql);
    const target = run.target;
    const match = result.ok && target?.ok ? rowsMatch(result.rows, target.rows, false) : false;
    setRun((s) => ({ running: false, result, target, match, runs: s.runs + 1 }));
    if (!result.ok) {
      reportMentorFailure({
        sql: sql.slice(0, 2000),
        error: result.error ?? null,
        note: null,
        source: `Daily puzzle · ${day}`,
      });
      return;
    }
    if (!match) {
      reportMentorFailure({
        sql: sql.slice(0, 2000),
        error: null,
        note: "Runs clean, but the rows don't match the day's target result.",
        source: `Daily puzzle · ${day}`,
      });
      return;
    }
    // solved — pay XP, mark the ledger, feed the mastery map
    setSolved(true);
    recordPracticeAttempt(puzzle.skill, `puzzle:${day}`, true);
    const firstTry = run.runs === 0;
    if (isToday) {
      awardPracticeXp(`puzzle:${day}`, PUZZLE_XP.today, "Daily puzzle solved");
      if (firstTry) awardPracticeXp(`puzzle-clean:${day}`, PUZZLE_XP.cleanBonus, "Clean solve — first run, no misses");
      const r = useProgress.getState().markPuzzleDone();
      if (r.freezeEarned) {
        celebrate({
          kind: "badge",
          title: "Freeze token earned",
          sub: "A 7-day puzzle run banks a streak freeze (max 2)",
        });
      }
    } else {
      awardPracticeXp(`puzzle:${day}`, PUZZLE_XP.backlog, "Backlog puzzle solved");
      if (firstTry) awardPracticeXp(`puzzle-clean:${day}`, PUZZLE_XP.cleanBonus, "Clean solve — first run, no misses");
      useProgress.getState().markBacklogDone(day);
    }
  }

  function retry() {
    setSolved(false);
    setRun((s) => ({ ...s, result: null, match: null }));
  }

  const waitingTarget = run.target === null;

  // the run verdict + grids — shown under the editor while unsolved, and
  // KEPT above the solved card after a win so the reward doesn't blink away
  const resultBlock = run.result ? (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      className="space-y-3"
    >
      {!run.result.ok ? (
        <div className="rounded-md border border-rose-400/30 bg-rose-400/[0.06] px-3.5 py-3 font-mono text-xs text-rose-200">
          {run.result.error}
        </div>
      ) : run.match ? (
        <div className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <Trophy className="h-4 w-4" /> {isToday ? "Today's puzzle — done" : "Backlog cleared"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-300">
            {isToday
              ? `+${PUZZLE_XP.today} XP banked and the streak advances${run.runs === 1 ? `, plus ${PUZZLE_XP.cleanBonus} for the clean solve` : ""}. Come back tomorrow for the next one.`
              : `+${PUZZLE_XP.backlog} XP. The streak only moves on today's puzzle — but the practice is real.`}
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-amber-400/30 bg-amber-400/[0.06] px-3.5 py-3 text-xs leading-relaxed text-zinc-300">
          <span className="font-semibold text-amber-300">Not the target rows. </span>
          The engine ran it, but the result doesn&apos;t match the day&apos;s answer — compare your grid with the
          target below.
        </div>
      )}

      {run.result.ok ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">your rows</p>
            <MiniGrid columns={run.result.columns} rows={run.result.rows} tone={run.match ? "good" : "bad"} />
          </div>
          <div>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">the target</p>
            <MiniGrid
              columns={run.target?.ok ? run.target.columns : []}
              rows={run.target?.ok ? run.target.rows : []}
              tone="neutral"
            />
          </div>
        </div>
      ) : null}
    </motion.div>
  ) : null;

  if (showSolved) {
    return (
      <div className="space-y-4">
        {run.match === true && resultBlock}
        <SolvedCard puzzle={puzzle} day={day} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* the brief */}
      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            {puzzle.id}
          </span>
          <span className={cn("rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", DIFF_TONE[puzzle.difficulty])}>
            {puzzle.difficulty}
          </span>
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
              isToday ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300" : "border-sky-400/40 bg-sky-400/10 text-sky-300",
            )}
          >
            {isToday ? "today" : "backlog"}
          </span>
        </div>
        <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-100">{puzzle.prompt}</p>

        {/* progressive hints */}
        <div className="mt-3 space-y-1.5">
          {hints < 2 && (
            <button
              onClick={() => setHints((h) => h + 1)}
              className="btn-quiet rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
            >
              {hints === 0 ? "Hint 1" : "Hint 2"}
            </button>
          )}
          {hints >= 1 && (
            <p className="w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs leading-relaxed text-zinc-400">
              {hints >= 2 ? puzzle.hint2 : puzzle.hint1}
            </p>
          )}
        </div>
      </div>

      {/* the editor */}
      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="overflow-hidden rounded-md border border-zinc-800">
          <SqlEditor value={sql} onChange={(v) => setSql(v)} onVisualize={play} className="min-h-[120px]" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={play}
            disabled={run.running || !sql.trim() || waitingTarget}
            className={cn(
              "btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
              (run.running || !sql.trim() || waitingTarget) && "cursor-not-allowed opacity-40",
            )}
          >
            {run.running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {waitingTarget ? "Preparing target…" : "Run & solve"}
          </button>
          {run.result && !run.running && (
            <button
              onClick={retry}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
            >
              <RotateCcw className="h-3 w-3" /> Retry
            </button>
          )}
          <span className="ml-auto text-[11px] text-zinc-600">
            {isToday ? `today pays ${PUZZLE_XP.today} XP` : `backlog pays ${PUZZLE_XP.backlog} XP — no streak credit`} · row order free
          </span>
        </div>

        {run.result && <div className="mt-3.5">{resultBlock}</div>}
      </div>
    </div>
  );
}

// ---- the view --------------------------------------------------------------

export function DailyPuzzle() {
  const puzzleDone = useProgress((s) => s.puzzleDone);
  const backlogDone = useProgress((s) => s.backlogDone);
  const freezes = useProgress((s) => s.freezes);
  const [today] = useState(() => dayKeyOf(new Date()));
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() + 1 };
  });
  const [selected, setSelected] = useState(today);

  const nowIdx = monthIdx(new Date().getFullYear(), new Date().getMonth() + 1);
  const curIdx = monthIdx(cursor.y, cursor.m);

  const streakInfo = useMemo(() => puzzleStreak(puzzleDone, freezes, today), [puzzleDone, freezes, today]);
  const perfect = useMemo(
    () => monthPerfect(puzzleDone, backlogDone, monthKeyOf(cursor.y, cursor.m), today),
    [puzzleDone, backlogDone, cursor, today],
  );
  const puzzle = useMemo(() => puzzleForDate(selected), [selected]);

  const nav = (dir: -1 | 1) =>
    setCursor((c) => {
      const m = c.m + dir;
      if (m < 1) return { y: c.y - 1, m: 12 };
      if (m > 12) return { y: c.y + 1, m: 1 };
      return { y: c.y, m };
    });

  const selIsToday = selected === today;
  const selIsFuture = selected > today;
  const selSealed =
    !selIsToday &&
    !selIsFuture &&
    puzzleDone[selected] === undefined &&
    backlogDone[selected] === undefined &&
    monthIdx(Number(selected.slice(0, 4)), Number(selected.slice(5, 7))) < nowIdx - 1;

  const mk = monthKeyOf(cursor.y, cursor.m);
  const monthSolved = useMemo(() => {
    let n = 0;
    for (const k in puzzleDone) if (k.startsWith(mk)) n++;
    for (const k in backlogDone) if (k.startsWith(mk)) n++;
    return n;
  }, [puzzleDone, backlogDone, mk]);
  const monthTotal = new Date(cursor.y, cursor.m, 0).getDate();
  const monthElapsed = curIdx === nowIdx ? new Date().getDate() : curIdx < nowIdx ? monthTotal : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <CalendarDays className="h-3.5 w-3.5" /> {DAILY_PUZZLES.length} IN ROTATION · ONE A DAY
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Daily puzzle</h1>
      <p className="mt-3 text-[15px] leading-7 text-zinc-400">
        One hand-built puzzle waits on every calendar day — dashboards, anti-joins, reconciliations, windows. Solve
        today&apos;s to keep the streak alive; miss a day and a freeze token can bridge it. Days of the current and
        previous month stay open as backlog practice.
      </p>

      {/* status strip */}
      <div className="sheen mt-5 grid gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-amber-400/30 bg-amber-400/10">
            <Flame className="h-4 w-4 text-amber-300" />
          </span>
          <div>
            <p className="tnum text-lg font-semibold leading-none text-zinc-100">{streakInfo.streak}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">day puzzle streak</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-sky-400/30 bg-sky-400/10">
            <Snowflake className="h-4 w-4 text-sky-300" />
          </span>
          <div>
            <p className="tnum text-lg font-semibold leading-none text-zinc-100">
              {freezes} <span className="text-sm font-normal text-zinc-500">/ 2</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              freeze tokens · earned each 7-day run
            </p>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-300">
              {MONTH_NAMES[cursor.m - 1]} {cursor.y}
            </span>
            <span className="tnum text-zinc-500">
              {monthSolved} / {monthElapsed || monthTotal} days
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{
                width: `${monthElapsed || monthTotal ? Math.min(100, (monthSolved / (monthElapsed || monthTotal)) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            {curIdx === nowIdx ? "elapsed days solved" : curIdx < nowIdx ? "final tally" : "not started yet"}
          </p>
        </div>
      </div>

      {/* calendar */}
      <div className="mt-4">
        <CalendarGrid
          cursor={cursor}
          today={today}
          selected={selected}
          puzzleDone={puzzleDone}
          backlogDone={backlogDone}
          frozenDays={streakInfo.frozenDays}
          perfect={perfect}
          onPick={setSelected}
          onNav={nav}
        />
      </div>

      {/* workspace for the picked day — the workspace itself renders the
          solved card when the day is banked (keeps run state alive through
          the ledger flip so the verdict + grids don't blink away) */}
      <div className="mt-4">
        {selIsFuture || selSealed ? (
          <div className="sheen flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-500">
            <Lock className="h-4 w-4 shrink-0 text-zinc-600" />
            {selIsFuture
              ? `Sealed until ${Number(selected.slice(-2))} ${MONTH_NAMES[Number(selected.slice(5, 7)) - 1]}. Today's puzzle is waiting in the grid.`
              : `This day sealed ${Number(selected.slice(-2))} ${MONTH_NAMES[Number(selected.slice(5, 7)) - 1]} — only the current and previous month stay open.`}
          </div>
        ) : (
          <PuzzleWorkspace key={selected} day={selected} isToday={selIsToday} puzzle={puzzle} />
        )}
      </div>
    </div>
  );
}
