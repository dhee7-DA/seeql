"use client";

// Boss Gauntlet — the endgame reading run. All 18 boss problems (Levels I–III)
// dealt back-to-back as Predict-the-Output drills, 75 seconds a round. The
// clock is the interview: boss queries are long (recursive CTEs, sweep-lines,
// graph walks) and reading them under pressure is the actual skill being
// trained. The clock stops the moment you commit — the verdict, the engine's
// explanation and the real table stay on screen until you take the next
// round. Scoring is honest: every candidate table is engine-run for real,
// and the tier rewards are one-time entries in the same XP ledger as
// everything else (no re-farming).
//
// Structure: the run controller (below) owns the run ledger; each round is a
// keyed child (<GauntletRound key={slug}>) so its deal/timer/pick state
// resets by remount — no reset-effects, no cascading renders.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Play, RotateCcw, Swords, Trophy, X } from "lucide-react";
import { LC_ALL, lcBySlug } from "@/lib/leetcode/registry";
import { lcSqlDive } from "@/lib/leetcode/content/content";
import { readXpKey, stripComments } from "@/lib/leetcode/followups";
import { useProgress } from "@/lib/curriculum/progress";
import { celebrate } from "./celebrate";
import { Btn, Chip, Panel } from "./ui/kit";
import { DiffDot } from "./lc-dive-ui";
import { buildDrill, Candidate, CandidateGrid, DrillQuery, DrillTables, LETTERS } from "./lc-predict";
import { cn } from "@/lib/utils";
import type { LcRef } from "@/lib/leetcode/types";

const ROUND_SEC = 75;
const READ_XP = 2;

/** The boss lineup in canonical order: Level I → II → III, registry order
 *  within each band (nums 9001–9018). Derived from the registry, not a
 *  hand-kept list, so a future Boss Level IV joins automatically. */
const BOSS: LcRef[] = LC_ALL.filter((p) => p.lists.some((l) => l.startsWith("SQL · Boss Level"))).sort(
  (a, b) => a.num - b.num,
);

/** Score tiers — paid once each by the ledger (keys are stable). */
const TIERS = [
  { min: 12, key: "lc-gauntlet-bronze", xp: 15, name: "Bronze clear" },
  { min: 15, key: "lc-gauntlet-silver", xp: 25, name: "Silver clear" },
  { min: 18, key: "lc-gauntlet-gold", xp: 50, name: "Gold — perfect run" },
];

interface RoundOutcome {
  slug: string;
  right: boolean;
  timedOut: boolean;
}

/* GauntletRound — one timed reading round. Keyed by slug, so every remount  */
/* deals fresh: candidates, clock, pick state. ----------------------------- */

function GauntletRound({
  slug,
  roundNo,
  rightsSoFar,
  onCommit,
}: {
  slug: string;
  roundNo: number; // 1-based
  rightsSoFar: number;
  onCommit: (outcome: RoundOutcome) => void;
}) {
  const awardXp = useProgress((s) => s.awardXp);
  const [cands, setCands] = useState<Candidate[] | null>(null);
  const [dealFailed, setDealFailed] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [pending, setPending] = useState<RoundOutcome | null>(null);
  // round clock: initialized at mount (the deal IS the start of the round)
  const [endsAt, setEndsAt] = useState(() => Date.now() + ROUND_SEC * 1000);
  const [now, setNow] = useState(() => Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reg = lcBySlug(slug)!;
  const dive = lcSqlDive(slug)!;

  // deal the candidates (async — the clock is already running, that's the point)
  useEffect(() => {
    let alive = true;
    void buildDrill(slug).then((c) => {
      if (!alive) return;
      if (c) setCands(c);
      else setDealFailed(true);
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  // ticking clock — frozen once the round is committed or expired
  const committed = picked !== null;
  const expired = !committed && now >= endsAt;
  useEffect(() => {
    if (committed || expired) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [committed, expired]);

  // a stray auto-advance must never outlive the round (stale-closure ledger
  // writes) — cancel on unmount
  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  // time-up: derived above; the reveal is instant, the miss auto-advances
  // after a reading beat so the real table actually gets read
  useEffect(() => {
    if (!expired) return;
    const t = setTimeout(() => {
      timeoutRef.current = null;
      onCommit({ slug, right: false, timedOut: true });
    }, 2600);
    timeoutRef.current = t;
    return () => {
      if (timeoutRef.current === t) {
        clearTimeout(t);
        timeoutRef.current = null;
      }
    };
  }, [expired, slug, onCommit]);

  const truthIdx = useMemo(() => cands?.findIndex((c) => c.spec === null) ?? -1, [cands]);

  const pick = (i: number) => {
    if (picked !== null || expired || !cands) return;
    setPicked(i);
    const right = i === truthIdx;
    // first-correct read XP still pays (same ledger as drills) — silently,
    // the run's own toast comes at the report
    if (right) awardXp(readXpKey(slug), READ_XP);
    setPending({ slug, right, timedOut: false });
  };

  const remainingMs = Math.max(0, endsAt - now);
  const remainingPct = Math.max(0, Math.min(100, (remainingMs / (ROUND_SEC * 1000)) * 100));
  const urgent = remainingMs < 20_000;
  const showState = committed || expired;

  return (
    <div className="space-y-4">
      <Panel pad={3.5}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
            <Swords className="h-3 w-3 text-amber-400" /> boss gauntlet
          </span>
          <span className="tnum font-mono text-[11px] text-zinc-500">
            round {roundNo}/{BOSS.length} · {rightsSoFar} right
          </span>
          <div className="ml-auto flex min-w-40 flex-1 items-center gap-2 sm:max-w-60">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800" aria-hidden>
              <div
                className={cn("h-full rounded-full transition-all duration-500", urgent ? "bg-rose-400/80" : "bg-amber-400/80")}
                style={{ width: `${remainingPct}%` }}
              />
            </div>
            <span className={cn("tnum font-mono text-[11px]", urgent && !showState ? "text-rose-300" : "text-zinc-500")}>
              {showState ? "—" : `${Math.ceil(remainingMs / 1000)}s`}
            </span>
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
            #{reg.num} · {reg.difficulty}
          </p>
          <h3 className="text-base font-bold tracking-tight">{reg.title}</h3>
        </div>
        {pending && (
          <Btn variant="primary" onClick={() => pending && onCommit(pending)}>
            Next round <Check className="h-3.5 w-3.5" />
          </Btn>
        )}
      </div>

      <DrillTables slug={slug} />
      <DrillQuery query={stripComments(dive.code)} />

      {dealFailed ? (
        <Panel pad={3.5}>
          <p className="text-[12.5px] text-amber-200">
            This drill failed to deal (sandbox hiccup) — the round is a pass-through miss. Skip it and keep the run honest.
          </p>
          <div className="mt-2">
            <Btn variant="soft" onClick={() => onCommit({ slug, right: false, timedOut: false })}>
              Skip round
            </Btn>
          </div>
        </Panel>
      ) : !cands ? (
        <Panel pad={3.5}>
          <p className="text-[12px] text-zinc-600">Dealing the candidate tables… (the clock is running)</p>
        </Panel>
      ) : (
        <CandidateGrid cands={cands} picked={picked} revealed={expired} onPick={pick} />
      )}

      {showState && picked !== null && picked === truthIdx && (
        <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/[0.06] p-3 text-[12.5px] text-emerald-200">
          Read it under the clock and landed the real table. Take the next round while the trace is warm.
        </p>
      )}
      {showState && picked !== null && picked !== truthIdx && (
        <p className="rounded-lg border border-amber-400/30 bg-amber-400/[0.06] p-3 text-[12.5px] text-amber-200">
          Close — the real output is {LETTERS[truthIdx]}. In the gauntlet, commit only after the clause trace; a fast wrong pick costs the same as a slow right one.
        </p>
      )}
      {showState && picked === null && expired && (
        <p className="rounded-lg border border-rose-400/30 bg-rose-400/[0.06] p-3 text-[12.5px] text-rose-200">
          Time. The real output is {LETTERS[truthIdx]} — on to the next round; the clock resets with it.
        </p>
      )}
    </div>
  );
}

/* BossGauntlet — the run controller: briefing, ledger, report. ------------- */

export function BossGauntlet() {
  const awardXp = useProgress((s) => s.awardXp);
  const xpEvents = useProgress((s) => s.xpEvents);
  const [phase, setPhase] = useState<"idle" | "run" | "report">("idle");
  const [round, setRound] = useState(0);
  const [results, setResults] = useState<RoundOutcome[]>([]);
  const [lastRun, setLastRun] = useState<{ score: number; sec: number } | null>(null);
  const startedAtRef = useRef(0);

  const advance = useCallback(
    (outcome: RoundOutcome) => {
      const nr = [...results, outcome];
      setResults(nr);
      if (nr.length >= BOSS.length) {
        const score = nr.filter((x) => x.right).length;
        const sec = Math.round((Date.now() - startedAtRef.current) / 1000);
        const tier = TIERS.filter((t) => score >= t.min).pop() ?? null;
        const paid = tier ? awardXp(tier.key, tier.xp) : false;
        setLastRun({ score, sec });
        if (paid && tier) {
          celebrate({ kind: "badge", title: `${tier.name} — ${score}/${BOSS.length}`, sub: `+${tier.xp} XP banked · Boss Gauntlet` });
        }
        setPhase("report");
      } else {
        setRound((r) => r + 1);
      }
    },
    [results, awardXp],
  );

  const startRun = () => {
    startedAtRef.current = Date.now();
    setLastRun(null);
    setRound(0);
    setResults([]);
    setPhase("run");
  };

  // ---- idle: the briefing ---------------------------------------------------
  if (phase === "idle") {
    return (
      <Panel pad={4}>
        <div className="flex flex-wrap items-center gap-2">
          <Swords className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold tracking-tight">Boss Gauntlet</h2>
          <Chip k="format" v={`${BOSS.length} rounds · ${ROUND_SEC}s each`} />
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-zinc-400">
          Every boss problem from Levels I–III in one sitting, dealt as reading drills: the seeded tables, the query,
          and up to four candidate outputs — with the clock running. Read the query, trace WHERE → GROUP BY →
          HAVING → SELECT → ORDER BY, commit before the bar empties. The clock stops when you pick; the verdict and
          the real table stay up until you take the next round. First-correct reads still bank their usual +{READ_XP} XP.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {TIERS.map((t) => {
            const banked = xpEvents[t.key] !== undefined;
            return (
              <div
                key={t.key}
                className={cn(
                  "rounded-lg border p-3",
                  banked ? "border-amber-400/30 bg-amber-400/[0.06]" : "border-zinc-800 bg-zinc-950/40",
                )}
              >
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  {banked ? <Trophy className="h-3 w-3 text-amber-400" /> : <span className="h-3 w-3" />}
                  {t.name}
                </p>
                <p className="tnum mt-1 font-mono text-[11px] text-zinc-500">
                  {t.min}/{BOSS.length} correct · +{t.xp} XP {banked ? "· banked" : ""}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Btn variant="primary" onClick={startRun}>
            <Play className="h-3.5 w-3.5" /> Start the gauntlet
          </Btn>
          {TIERS.some((t) => xpEvents[t.key] !== undefined) && (
            <span className="font-mono text-[11px] text-zinc-600">tiers re-run for pride — XP pays once</span>
          )}
        </div>
      </Panel>
    );
  }

  // ---- report ---------------------------------------------------------------
  if (phase === "report") {
    const score = lastRun?.score ?? results.filter((r) => r.right).length;
    const sec = lastRun?.sec ?? 0;
    const misses = results.filter((r) => !r.right);
    return (
      <Panel pad={4}>
        <div className="flex flex-wrap items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold tracking-tight">Gauntlet report</h2>
          <Chip k="score" v={`${score}/${BOSS.length} correct`} />
          <Chip k="time" v={`${Math.floor(sec / 60)}m ${sec % 60}s`} />
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-zinc-400">
          {score === BOSS.length
            ? "Perfect run — every boss read right, under the clock. That's endgame readiness."
            : score >= 15
              ? "Silver territory — the bosses are mostly yielding. The misses below are exactly what to re-drill."
              : score >= 12
                ? "Bronze clear — the reading holds under pressure; the wall is the long recursive ones."
                : "The gauntlet bit back. Take the misses below back into their deep-dives, then run it again — the clock only feels slower the second time."}
        </p>
        {misses.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">the misses · re-drill these</p>
            {misses.map((m) => {
              const p = lcBySlug(m.slug);
              return (
                <div key={m.slug} className="flex items-center gap-2 rounded-md border border-zinc-800/70 bg-zinc-950/40 px-2.5 py-1.5">
                  {p && <DiffDot d={p.difficulty} />}
                  <span className="min-w-0 flex-1 truncate text-[12px] text-zinc-300">{p?.title ?? m.slug}</span>
                  {m.timedOut && <span className="font-mono text-[10px] text-rose-300/80">time</span>}
                  <X className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                </div>
              );
            })}
          </div>
        )}
        {misses.length === 0 && (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/[0.06] p-3 text-[12.5px] text-emerald-200">
            <Check className="h-4 w-4" /> A clean sheet — 18 for 18 under the clock.
          </p>
        )}
        <div className="mt-4">
          <Btn variant="primary" onClick={startRun}>
            <RotateCcw className="h-3.5 w-3.5" /> Run it again
          </Btn>
        </div>
      </Panel>
    );
  }

  // ---- run --------------------------------------------------------------------
  const slug = BOSS[round]?.slug;
  if (!slug) {
    setPhase("report"); // unreachable guard: 18 rounds always defined
    return null;
  }
  return (
    <GauntletRound
      key={slug}
      slug={slug}
      roundNo={round + 1}
      rightsSoFar={results.filter((r) => r.right).length}
      onCommit={advance}
    />
  );
}
