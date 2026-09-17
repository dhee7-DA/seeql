"use client";

// Review deck — "your misses, resurfaced". Every question missed anywhere
// lands here as a Leitner card (box 0, due in 10 minutes). Recalling promotes
// 10min → 1d → 2d → 4d → 8d → 16d; missing drops back to box 0. Recalls pay
// zero XP by design — this deck is for retention, not farming.
//
// The session queue is SNAPSHOTTED when it starts: answering a card reschedules
// it into the future, which would otherwise mutate a live-derived queue and
// reset the session under the learner's feet.

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BrainCircuit, RefreshCcw } from "lucide-react";
import { LESSONS } from "@/lib/curriculum/lessons";
import { fillsFor } from "@/lib/curriculum/fills";
import { MAX_BOX, useProgress } from "@/lib/curriculum/progress";
import type { Fill, Mcq } from "@/lib/curriculum/types";
import { McqCard } from "./mcq";
import { FillCard } from "./fill-blank";

interface Card {
  id: string;
  kind: "mcq" | "fill";
  mcq?: Mcq;
  fill?: Fill;
  lessonNum: number;
  lessonTitle: string;
}

function useCatalog(): Map<string, Card> {
  return useMemo(() => {
    const map = new Map<string, Card>();
    for (const l of LESSONS) {
      for (const m of l.mcqs)
        map.set(m.id, { id: m.id, kind: "mcq", mcq: m, lessonNum: l.num, lessonTitle: l.title });
      for (const f of fillsFor(l.num))
        map.set(f.id, { id: f.id, kind: "fill", fill: f, lessonNum: l.num, lessonTitle: l.title });
    }
    return map;
  }, []);
}

function dueLabel(ms: number): string {
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${Math.max(1, m)} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr`;
  return `${Math.round(h / 24)} days`;
}

const BOX_LABEL = ["10 min", "1 day", "2 days", "4 days", "8 days", "16 days"];

export function ReviewDeck() {
  const catalog = useCatalog();
  const review = useProgress((s) => s.review);
  const reviewCorrect = useProgress((s) => s.reviewCorrect);
  const reviewWrong = useProgress((s) => s.reviewWrong);
  const [, setTick] = useState(0);

  // Re-evaluate "due" every 30 s so countdowns move without interaction.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const entries = useMemo(
    () =>
      Object.entries(review)
        .map(([id, e]) => ({ id, ...e, card: catalog.get(id) }))
        .filter((e) => e.card !== undefined),
    [review, catalog],
  );

  const now = Date.now();
  const due = entries.filter((e) => e.due <= now).sort((a, b) => a.due - b.due);
  const nextUp = entries.filter((e) => e.due > now).sort((a, b) => a.due - b.due)[0];
  const graduated = entries.filter((e) => e.box >= MAX_BOX).length;
  const accuracy =
    reviewCorrect + reviewWrong > 0 ? Math.round((reviewCorrect / (reviewCorrect + reviewWrong)) * 100) : null;

  // Session snapshot — ids of the cards queued when the session started.
  const [session, setSession] = useState<string[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [sessionMisses, setSessionMisses] = useState(0);
  const dueKey = due.map((e) => e.id).join(",");

  // Auto-arm a session when due cards exist and none is running.
  useEffect(() => {
    if (session === null && due.length > 0) {
      setSession(due.map((e) => e.id));
      setIdx(0);
      setAnswered(false);
      setSessionMisses(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueKey, session]);

  const currentId = session !== null && idx < session.length ? session[idx] : null;
  const current = currentId ? entries.find((e) => e.id === currentId) : undefined;
  const finished = session !== null && idx >= session.length;

  function onAnswered(correct: boolean) {
    setAnswered(true);
    if (!correct) setSessionMisses((n) => n + 1);
  }

  function advance() {
    setIdx((i) => i + 1);
    setAnswered(false);
  }

  function backToHub() {
    setSession(null);
    setIdx(0);
    setAnswered(false);
    setSessionMisses(0);
  }

  return (
    <div className="max-w-3xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Toolbox</p>
      <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-zinc-50">Review deck</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        Your misses, resurfaced. Miss a question anywhere in the course and it lands here due in
        10 minutes — recall it and the interval grows 10min → 1 → 2 → 4 → 8 → 16 days. Recalls pay
        no XP; the deck is for memory, not points.
      </p>

      {/* stats strip */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Due now", String(due.length)],
          ["In the deck", String(entries.length)],
          ["Graduated", String(graduated)],
          ["Recall rate", accuracy === null ? "—" : `${accuracy}%`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-3">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">{k}</p>
            <p className="tnum mt-1 truncate text-sm font-medium text-zinc-100">{v}</p>
          </div>
        ))}
      </div>

      {/* session */}
      {current && !finished && (
        <div className="mt-5">
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500 ease-out"
                style={{ width: `${(idx / session!.length) * 100}%` }}
              />
            </div>
            <span className="tnum shrink-0 font-mono text-xs text-zinc-500">
              {idx + 1} / {session!.length}
            </span>
            <span className="shrink-0 rounded-full border border-violet-400/40 bg-violet-400/10 px-2.5 py-0.5 font-mono text-[10px] text-violet-300">
              box {current.box} · next interval {BOX_LABEL[Math.min(current.box + 1, MAX_BOX)]}
            </span>
          </div>

          <p className="mb-2 mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
            {current.card!.kind === "mcq" ? "Question" : "Rebuild"} · Lesson {String(current.card!.lessonNum).padStart(2, "0")} ·{" "}
            {current.card!.lessonTitle}
          </p>

          {current.card!.kind === "mcq" ? (
            <McqCard key={current.id} mcq={current.card!.mcq!} reviewMode onAnswered={onAnswered} />
          ) : (
            <FillCard key={current.id} fill={current.card!.fill!} reviewMode onAnswered={onAnswered} />
          )}

          {answered && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <p className="text-sm text-zinc-400">
                {idx + 1 === session!.length ? "That was the last due card." : "Locked in — on to the next one."}
              </p>
              <button
                onClick={advance}
                className="flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
              >
                {idx + 1 === session!.length ? "See the verdict" : "Next card"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* cleared verdict */}
      {finished && (
        <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <p className="font-display text-lg font-semibold text-emerald-300">Deck cleared</p>
          <p className="mt-1 text-sm text-zinc-400">
            {session!.length - sessionMisses} recalled
            {sessionMisses > 0 ? `, ${sessionMisses} back in the deck at box 0 (due in 10 minutes)` : ""} — the survivors
            move one box up the schedule.
          </p>
          <div className="mt-4">
            <button
              onClick={backToHub}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Back to hub
            </button>
          </div>
        </div>
      )}

      {/* empty state */}
      {entries.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-6 text-center">
          <BrainCircuit className="mx-auto h-8 w-8 text-zinc-700" />
          <p className="mt-3 text-sm font-medium text-zinc-300">Your deck is empty</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-zinc-500">
            Miss a quiz question or a fill anywhere in the course and it will appear here, due 10
            minutes later. Get it right in the deck and it keeps coming back on a growing schedule
            until it sticks.
          </p>
        </div>
      )}

      {/* nothing due but cards exist */}
      {entries.length > 0 && due.length === 0 && session === null && (
        <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm font-medium text-zinc-100">
            Nothing due right now{nextUp ? ` — next card in ${dueLabel(nextUp.due - now)}` : ""}.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {graduated} of {entries.length} card{entries.length === 1 ? "" : "s"} graduated to the 16-day interval. Misses
            from new lessons will keep feeding the deck.
          </p>
        </div>
      )}
    </div>
  );
}

/** Sidebar badge helper: how many cards are due right now. */
export function useDueCount(): number {
  const review = useProgress((s) => s.review);
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);
  const now = Date.now();
  return useMemo(() => Object.values(review).filter((e) => e.due <= now).length, [review, now]);
}
