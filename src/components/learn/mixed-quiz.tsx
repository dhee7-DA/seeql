"use client";

// Mixed quiz — a 10-question round drawn from the whole course.
// Un-attempted questions come first, then ones you missed before, then
// everything else — so a round always teaches something new. XP still flows
// through the idempotent ledger: a question you've already scored on won't
// pay twice, the round is for keeping sharp.

import { useMemo, useState } from "react";
import { ArrowRight, RefreshCcw } from "lucide-react";
import { Icon3D } from "./ui/icon3d";
import { LESSONS } from "@/lib/curriculum/lessons";
import { useProgress, dueReviews } from "@/lib/curriculum/progress";
import type { Mcq } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";
import { McqCard } from "./mcq";

const ROUND = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Mcq[] {
  const all = LESSONS.flatMap((l) => l.mcqs);
  const state = useProgress.getState();
  const att = state.mcqAttempts;
  // spaced-repetition cards coming due lead the deck — the ladder decided
  // it's time to see them again (1d → 3d → 7d → 14d since the last answer)
  const dueIds = new Set(dueReviews(state.reviewSchedule).filter((c) => c.key.startsWith("mcq:")).map((c) => c.key.slice(4)));
  const due = shuffle(all.filter((m) => dueIds.has(m.id)));
  const untouched = shuffle(all.filter((m) => att[m.id] === undefined && !dueIds.has(m.id)));
  const missed = shuffle(all.filter((m) => att[m.id] && !att[m.id].correct && !dueIds.has(m.id)));
  const rest = shuffle(all.filter((m) => att[m.id]?.correct && !dueIds.has(m.id)));
  const picked: Mcq[] = [];
  const take = (pool: Mcq[], k: number) => {
    for (const m of pool) {
      if (picked.length >= ROUND || k <= 0) break;
      picked.push(m);
      k--;
    }
  };
  take(due, 4);
  take(untouched, 4);
  take(missed, 1);
  take(rest, 1);
  // top up from whatever is left, still in priority order
  take(due, ROUND);
  take(untouched, ROUND);
  take(missed, ROUND);
  take(rest, ROUND);
  return shuffle(picked);
}

function verdictFor(score: number): { title: string; sub: string } {
  if (score === ROUND) return { title: "Perfect round", sub: "Ten for ten — the whole course is sharp." };
  if (score >= 7) return { title: "Sharp round", sub: `${score} of ${ROUND} — the fundamentals are holding.` };
  if (score >= 4) return { title: "Solid round", sub: `${score} of ${ROUND} — revisit the lessons behind the misses.` };
  return { title: "Worth another pass", sub: `${score} of ${ROUND} — the deck will lean toward your weak spots next time.` };
}

export function MixedQuiz() {
  const [deck, setDeck] = useState<Mcq[]>(() => buildDeck());
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const source = useMemo(() => {
    const map = new Map<string, { num: number; title: string }>();
    for (const l of LESSONS) for (const m of l.mcqs) map.set(m.id, { num: l.num, title: l.title });
    return map;
  }, []);

  const finished = idx >= deck.length;
  const current = finished ? null : deck[idx];

  function restart() {
    setDeck(buildDeck());
    setIdx(0);
    setScore(0);
    setAnswered(false);
  }

  function onAnswered(correct: boolean) {
    setAnswered(true);
    if (correct) setScore((s) => s + 1);
  }

  return (
    <div className="max-w-3xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Toolbox</p>
      <h1 className="mt-2 flex items-center gap-3 font-display text-2xl font-semibold tracking-tight text-zinc-50"><Icon3D name="puzzle" size={34} />Mixed quiz</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        {ROUND} questions pulled from all {LESSONS.length} lessons — the deck leans toward questions you
        haven&apos;t seen or missed before. First-try answers still earn XP; repeats never pay twice.
      </p>

      {!finished && (
        <div className="mt-5 flex items-center gap-3">
          <div className="bar-shimmer h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${(idx / deck.length) * 100}%` }}
            />
          </div>
          <span className="tnum shrink-0 font-mono text-xs text-zinc-500">
            {Math.min(idx + 1, deck.length)} / {deck.length}
          </span>
          <span
            className={cn(
              "tnum shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[11px]",
              score > 0 ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300" : "border-zinc-700 text-zinc-500",
            )}
          >
            {score} correct
          </span>
        </div>
      )}

      {current && !finished && (
        <div className="mt-4">
          {(() => {
            const src = source.get(current.id);
            return src ? (
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                From Lesson {String(src.num).padStart(2, "0")} · {src.title}
              </p>
            ) : null;
          })()}
          <McqCard key={current.id} mcq={current} onAnswered={onAnswered} />
          {answered && (
            <div className="sheen mt-4 flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <p className="text-sm text-zinc-400">
                {idx + 1 === deck.length ? "That was the last question." : "Locked in — on to the next one."}
              </p>
              <button
                onClick={() => {
                  setIdx((i) => i + 1);
                  setAnswered(false);
                }}
                className="btn-glow flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
              >
                {idx + 1 === deck.length ? "See the verdict" : "Next question"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {finished && (
        <div className="sheen mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          {(() => {
            const v = verdictFor(score);
            return (
              <>
                <p className={cn("font-display text-lg font-semibold", score >= 7 ? "text-emerald-300" : "text-zinc-50")}>{v.title}</p>
                <p className="mt-1 text-sm text-zinc-400">{v.sub}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={restart}
                    className="btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    New round
                  </button>
                  <button
                    onClick={() => {
                      setIdx(0);
                      setScore(0);
                      setAnswered(false);
                    }}
                    className="btn-quiet rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
                  >
                    Review this round
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
