"use client";

// Keyword drills — pick a keyword, run a 10-question round that mixes the six
// aspects (syntax, semantics, edge cases, error reading, output prediction,
// judgment). Un-seen questions come first, then ones you missed, then mastered
// ones — every round teaches something. XP flows through the same idempotent
// ledger as lesson quizzes: first-try answers pay, repeats never pay twice.

import { useMemo, useState } from "react";
import { ArrowRight, Check, Dumbbell, RefreshCcw } from "lucide-react";
import { DRILL_SETS, drillTotal, ASPECT_LABELS } from "@/lib/curriculum/drills";
import type { DrillQ, DrillSet, DrillTier } from "@/lib/curriculum/drills";
import { useProgress } from "@/lib/curriculum/progress";
import { cn } from "@/lib/utils";
import { McqCard } from "./mcq";

const ROUND = 10;

const TIER_ORDER: DrillTier[] = ["core", "secondary", "utility"];
const TIER_STYLE: Record<DrillTier, string> = {
  core: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  secondary: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  utility: "border-zinc-600 bg-zinc-800 text-zinc-300",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Round deck: unseen first (mixed across aspects), then missed, then mastered. */
function buildDeck(set: DrillSet): DrillQ[] {
  const att = useProgress.getState().mcqAttempts;
  const unseen = shuffle(set.questions.filter((q) => att[q.id] === undefined));
  const missed = shuffle(set.questions.filter((q) => att[q.id] && !att[q.id].correct));
  const mastered = shuffle(set.questions.filter((q) => att[q.id]?.correct));
  return [...unseen, ...missed, ...mastered].slice(0, ROUND);
}

function verdictFor(score: number, n: number): { title: string; sub: string } {
  const pct = n > 0 ? score / n : 0;
  if (score === n && n > 0) return { title: "Clean sweep", sub: `${score} of ${n} — this keyword is sharp.` };
  if (pct >= 0.7) return { title: "Sharp round", sub: `${score} of ${n} — the ${"fundamentals"} are holding.` };
  if (pct >= 0.4) return { title: "Solid round", sub: `${score} of ${n} — reread the explanations behind the misses.` };
  return { title: "Worth another pass", sub: `${score} of ${n} — the next round leans toward what you missed.` };
}

function AspectBadge({ q }: { q: DrillQ }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]", TIER_STYLE[q.tier])}>
        {q.keyword}
      </span>
      <span className="rounded-full border border-violet-400/40 bg-violet-400/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-violet-300">
        {ASPECT_LABELS[q.aspect]}
      </span>
    </div>
  );
}

function SetCard({ set, onDrill }: { set: DrillSet; onDrill: () => void }) {
  const attempts = useProgress((s) => s.mcqAttempts);
  const total = set.questions.length;
  const tried = set.questions.filter((q) => attempts[q.id] !== undefined).length;
  const right = set.questions.filter((q) => attempts[q.id]?.correct).length;
  const started = tried > 0;

  return (
    <button
      onClick={onDrill}
      className="sheen card-hover rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-left transition-colors hover:border-zinc-600"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-sm font-semibold text-zinc-100">{set.label}</span>
        <span className={cn("shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider", TIER_STYLE[set.tier])}>
          {set.tier}
        </span>
      </div>
      <p className="mt-1.5 min-h-[2.2em] text-[11px] leading-relaxed text-zinc-500">{set.blurb}</p>
      <div className="mt-2.5 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-400 transition-[width] duration-500"
            style={{ width: `${(tried / total) * 100}%` }}
          />
        </div>
        <span className="tnum shrink-0 font-mono text-[10px] text-zinc-500">
          {started ? `${right}/${total}` : `${total} q`}
        </span>
        <Dumbbell className={cn("h-3.5 w-3.5 shrink-0", started ? "text-emerald-400" : "text-zinc-600")} />
      </div>
    </button>
  );
}

export function DrillYard() {
  const [active, setActive] = useState<DrillSet | null>(null);
  const [deck, setDeck] = useState<DrillQ[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const attempts = useProgress((s) => s.mcqAttempts);

  const grouped = useMemo(() => {
    const byTier = new Map<DrillTier, DrillSet[]>();
    for (const s of DRILL_SETS) {
      const list = byTier.get(s.tier) ?? [];
      list.push(s);
      byTier.set(s.tier, list);
    }
    return TIER_ORDER.filter((t) => byTier.has(t)).map((t) => ({ tier: t, sets: byTier.get(t)! }));
  }, []);

  const attemptedCount = useMemo(
    () => Object.keys(attempts).filter((id) => id.startsWith("dr1-")).length,
    [attempts],
  );

  function start(set: DrillSet) {
    setActive(set);
    setDeck(buildDeck(set));
    setIdx(0);
    setScore(0);
    setAnswered(false);
  }

  function back() {
    setActive(null);
    setDeck([]);
  }

  const finished = active !== null && idx >= deck.length;
  const current = !active || finished ? null : deck[idx];

  // ---------- session view ----------
  if (active) {
    return (
      <div className="max-w-3xl">
        <button onClick={back} className="mb-3 font-mono text-[11px] text-zinc-500 transition-colors hover:text-zinc-300">
          ← all keywords
        </button>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-50">{active.label} drill</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{active.blurb}</p>

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
            <AspectBadge q={current} />
            <McqCard key={current.id} mcq={current} onAnswered={(ok) => { setAnswered(true); if (ok) setScore((s) => s + 1); }} />
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
                  className="btn-glow flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[#052e1c] transition-colors hover:bg-emerald-300"
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
              const v = verdictFor(score, deck.length);
              return (
                <>
                  <p className={cn("font-display text-lg font-semibold", score >= deck.length * 0.7 ? "text-emerald-300" : "text-zinc-50")}>{v.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{v.sub}</p>
                  <p className="mt-2 font-mono text-[11px] text-zinc-500">
                    {active.label} · {active.questions.filter((q) => attempts[q.id]?.correct).length}/{active.questions.length} mastered overall
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => start(active)}
                      className="btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[#052e1c] transition-colors hover:bg-emerald-300"
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      New round
                    </button>
                    <button
                      onClick={back}
                      className="btn-quiet rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
                    >
                      Pick another keyword
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

  // ---------- picker view ----------
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Toolbox</p>
      <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-zinc-50">Keyword drills</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        Every keyword, drilled from six angles — syntax, semantics, edge cases, error reading, output
        prediction, and judgment. {drillTotal()} questions on the live storefront db, all numbers
        engine-verified. First-try answers earn XP; wrong ones queue up for the next round.
      </p>
      <p className="mt-1.5 font-mono text-[11px] text-zinc-600">
        {attemptedCount} of {drillTotal()} attempted · rounds of {ROUND}
      </p>

      {grouped.map(({ tier, sets }) => (
        <div key={tier} className="mt-6">
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", TIER_STYLE[tier])}>
              {tier}
            </span>
            <span className="font-mono text-[10px] text-zinc-600">
              {tier === "core" ? "the load-bearing keywords — 50 questions each" : "focused coverage — 8 to 20 each"}
            </span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sets.map((s) => (
              <SetCard key={s.keyword} set={s} onDrill={() => start(s)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
