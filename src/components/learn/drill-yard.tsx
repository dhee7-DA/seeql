"use client";

// Keyword drills — pick a keyword, run a round that mixes the six aspects
// (syntax, semantics, edge cases, error reading, output prediction,
// judgment). Rounds of 10 CHAIN through the whole bank: unseen first, then
// missed, then mastered — the verdict is a hub that offers the next round,
// a full sweep of what's left, or a review round once a bank runs dry.
//
// The active session (keyword, deck, position, score, round number) is
// mirrored into a persisted store (drill-session.ts), so navigating away
// to check the schema — or anywhere else — and coming back restores the
// round exactly where it was. Explicit abandonment drops it.
//
// XP flows through the same idempotent ledger as lesson quizzes:
// first-try answers pay, repeats never pay twice.

import { useMemo, useState } from "react";
import { ArrowRight, Dumbbell, Layers, RefreshCcw, Zap } from "lucide-react";
import { Icon3D } from "./ui/icon3d";
import { DRILL_SETS, drillTotal, ASPECT_LABELS } from "@/lib/curriculum/drills";
import type { DrillQ, DrillSet, DrillTier } from "@/lib/curriculum/drills";
import { useProgress } from "@/lib/curriculum/progress";
import { useDrillSession } from "@/lib/curriculum/drill-session";
import { cn } from "@/lib/utils";
import { seeqReact } from "./seeq-mood";
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
function buildDeck(set: DrillSet, size: number = ROUND): DrillQ[] {
  const att = useProgress.getState().mcqAttempts;
  const unseen = shuffle(set.questions.filter((q) => att[q.id] === undefined));
  const missed = shuffle(set.questions.filter((q) => att[q.id] && !att[q.id].correct));
  const mastered = shuffle(set.questions.filter((q) => att[q.id]?.correct));
  return [...unseen, ...missed, ...mastered].slice(0, Math.max(1, Math.min(size, set.questions.length)));
}

function verdictFor(score: number, n: number): { title: string; sub: string } {
  const pct = n > 0 ? score / n : 0;
  if (score === n && n > 0) return { title: "Clean sweep", sub: `${score} of ${n} — this keyword is sharp.` };
  if (pct >= 0.7) return { title: "Sharp round", sub: `${score} of ${n} — the fundamentals are holding.` };
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
          {started ? `${tried}/${total} tried` : `${total} q`}
        </span>
        <Dumbbell className={cn("h-3.5 w-3.5 shrink-0", started ? "text-emerald-400" : "text-zinc-600")} />
      </div>
    </button>
  );
}

/** Read a persisted session for this scope and resolve it against the
 *  pool's sets. Stale sessions (keyword no longer offered, empty deck)
 *  return null and simply never restore — the next start() overwrites
 *  them. Runs during lazy state init: no effects, no cascading renders. */
function bootstrapSession(pool: DrillSet[], scopeId: string) {
  const saved = useDrillSession.getState().sessions[scopeId];
  if (!saved) return null;
  const set = pool.find((d) => d.keyword === saved.keyword);
  if (!set) return null;
  const byId = new Map(set.questions.map((q) => [q.id, q]));
  const restoredDeck = saved.deckIds.map((id) => byId.get(id)).filter((q): q is DrillQ => Boolean(q));
  if (!restoredDeck.length) return null;
  return {
    set,
    deck: restoredDeck,
    idx: Math.min(saved.idx, restoredDeck.length),
    score: saved.score,
    roundNum: saved.roundNum,
  };
}

export function DrillYard({ scopeId = "yard", keywords }: { scopeId?: string; keywords?: string[] }) {
  // The sets this surface offers: the whole bank for the chapter Drill
  // Yard, or the lesson's own keywords for scoped lesson drills.
  const keywordKey = keywords?.join("|");
  const pool = useMemo(
    () =>
      keywordKey
        ? DRILL_SETS.filter((s) => keywordKey.split("|").includes(s.keyword))
        : DRILL_SETS,
    [keywordKey],
  );

  // Restore an in-progress session on mount — lazy init, so a round
  // survives navigation (sidebar → schema explorer → back) intact.
  const [boot] = useState(() => bootstrapSession(pool, scopeId));
  const [active, setActive] = useState<DrillSet | null>(boot?.set ?? null);
  const [deck, setDeck] = useState<DrillQ[]>(boot?.deck ?? []);
  const [idx, setIdx] = useState(boot?.idx ?? 0);
  const [score, setScore] = useState(boot?.score ?? 0);
  const [roundNum, setRoundNum] = useState(boot?.roundNum ?? 1);
  const [answered, setAnswered] = useState(false);

  const attempts = useProgress((s) => s.mcqAttempts);

  function commit(set: DrillSet, d: DrillQ[], i: number, sc: number, rn: number) {
    useDrillSession.getState().put(scopeId, {
      keyword: set.keyword,
      deckIds: d.map((q) => q.id),
      idx: i,
      score: sc,
      roundNum: rn,
      deckSize: d.length,
    });
  }

  function start(set: DrillSet, size: number = ROUND) {
    const d = buildDeck(set, size);
    setActive(set);
    setDeck(d);
    setIdx(0);
    setScore(0);
    setRoundNum(1);
    setAnswered(false);
    commit(set, d, 0, 0, 1);
  }

  function back() {
    useDrillSession.getState().drop(scopeId);
    setActive(null);
    setDeck([]);
    setIdx(0);
    setScore(0);
    setRoundNum(1);
    setAnswered(false);
  }

  /** Chain onward: rebuild from live attempts (unseen → missed → mastered). */
  function nextRound(size: number = ROUND) {
    if (!active) return;
    const d = buildDeck(active, size);
    setDeck(d);
    setIdx(0);
    setScore(0);
    setAnswered(false);
    setRoundNum((r) => {
      commit(active, d, 0, 0, r + 1);
      return r + 1;
    });
  }

  /** Load everything not yet mastered into one long round. */
  function sweepAll() {
    if (!active) return;
    const att = useProgress.getState().mcqAttempts;
    nextRound(active.questions.filter((q) => att[q.id]?.correct !== true).length);
  }

  const finished = active !== null && idx >= deck.length;
  const current = !active || finished ? null : deck[idx];

  const remaining = active ? active.questions.filter((q) => attempts[q.id]?.correct !== true).length : 0;
  const mastered = active ? active.questions.length - remaining : 0;

  const attemptedCount = useMemo(
    () => pool.reduce((a, s) => a + s.questions.filter((q) => attempts[q.id] !== undefined).length, 0),
    [pool, attempts],
  );
  const poolTotal = useMemo(() => pool.reduce((a, s) => a + s.questions.length, 0), [pool]);
  const scoped = Boolean(keywords?.length);

  // ---------- session view ----------
  if (active) {
    return (
      <div className="max-w-3xl">
        <button onClick={back} className="mb-3 font-mono text-[11px] text-zinc-500 transition-colors hover:text-zinc-300">
          ← all keywords
        </button>
        <h1 className="flex items-center gap-3 font-display text-2xl font-semibold tracking-tight text-zinc-50"><Icon3D name="target" size={34} />{active.label} drill</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{active.blurb}</p>
        <p className="tnum mt-1.5 font-mono text-[11px] text-zinc-600">
          round {roundNum} · {deck.length} this round · bank {mastered}/{active.questions.length} mastered · {remaining} to go
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
            <AspectBadge q={current} />
            <McqCard
              key={current.id}
              mcq={current}
              onAnswered={(ok) => {
                setAnswered(true);
                if (ok) {
                  // Score = distinct deck questions the ledger marks correct —
                  // immune to double-counting a restored question that was
                  // re-answered after navigation.
                  const att = useProgress.getState().mcqAttempts;
                  const sc = deck.filter((q) => att[q.id]?.correct).length;
                  setScore(sc);
                  commit(active, deck, idx, sc, roundNum);
                  // last card of the round answered correctly = a clean round
                  if (idx === deck.length - 1) seeqReact("streak", 2);
                }
              }}
            />
            {answered && (
              <div className="sheen mt-4 flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <p className="text-sm text-zinc-400">
                  {idx + 1 === deck.length ? "That was the last question." : "Locked in — on to the next one."}
                </p>
                <button
                  onClick={() => {
                    const i = idx + 1;
                    setIdx(i);
                    setAnswered(false);
                    commit(active, deck, i, score, roundNum);
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
              const v = verdictFor(score, deck.length);
              return (
                <>
                  <p className={cn("font-display text-lg font-semibold", score >= deck.length * 0.7 ? "text-emerald-300" : "text-zinc-50")}>{v.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{v.sub}</p>
                  <p className="tnum mt-2 font-mono text-[11px] text-zinc-500">
                    round {roundNum} · {active.label} · bank {mastered}/{active.questions.length} mastered · {remaining} to go
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {remaining > 0 ? (
                      <>
                        <button
                          onClick={() => nextRound()}
                          className="btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
                        >
                          <RefreshCcw className="h-3.5 w-3.5" />
                          Next round
                        </button>
                        <button
                          onClick={sweepAll}
                          className="flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-400/20"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          Sweep all remaining ({remaining})
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => nextRound()}
                        className="btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
                      >
                        <Layers className="h-3.5 w-3.5" />
                        Review round
                      </button>
                    )}
                    <button
                      onClick={back}
                      className="btn-quiet rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
                    >
                      Pick another keyword
                    </button>
                  </div>
                  {remaining > 0 && (
                    <p className="mt-3 font-mono text-[11px] text-zinc-600">
                      rounds of {ROUND}, chained until a bank runs dry — misses queue up first.
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    );
  }

  // ---------- picker view ----------
  const grouped = TIER_ORDER.map((tier) => ({ tier, sets: pool.filter((s) => s.tier === tier) })).filter(
    (g) => g.sets.length > 0,
  );

  return (
    <div className="max-w-3xl">
      {!scoped && <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Toolbox</p>}
      <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-zinc-50">Keyword drills</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        {scoped
          ? "The keywords this lesson teaches, drilled from six angles — syntax, semantics, edge cases, error reading, output prediction, and judgment. Rounds of 10, chained until a bank runs dry."
          : "Every keyword, drilled from six angles — syntax, semantics, edge cases, error reading, output prediction, and judgment. All numbers engine-verified on the live storefront db. First-try answers earn XP; wrong ones queue up for the next round."}
      </p>
      <p className="tnum mt-1.5 font-mono text-[11px] text-zinc-600">
        {attemptedCount} of {poolTotal} attempted · rounds of {ROUND}, chained until a bank runs dry
      </p>

      {(scoped ? [{ tier: "all" as DrillTier, sets: pool }] : grouped).map(({ tier, sets }) => (
        <div key={tier} className="mt-6">
          {!scoped && (
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", TIER_STYLE[tier])}>
                {tier}
              </span>
              <span className="font-mono text-[10px] text-zinc-600">
                {tier === "core" ? "the load-bearing keywords — 50 questions each" : "focused coverage — 8 to 20 each"}
              </span>
            </div>
          )}
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
