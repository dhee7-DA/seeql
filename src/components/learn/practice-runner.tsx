// PracticeRunner — the deck runner shared by the module Gauntlet and the
// Keyword practice hub. Builds a 10-item deck from a filtered pool, renders
// the right card per surface (McqCard / FillCard caseMode / ProblemCard) and
// derives progress from the XP ledger + MCQ attempts, exactly like DrillYard.
import { useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, RotateCcw, Swords } from "lucide-react";
import { McqCard } from "./mcq";
import { CaseFileCard } from "./case-files";
import { ProblemCard } from "./problem-runner";
import { useProgress } from "@/lib/curriculum/progress";
import { useGauntletSession, type GauntletSurface } from "@/lib/curriculum/gauntlet-session";
import type { Mcq, Problem } from "@/lib/curriculum/types";
import type { CaseStudy } from "@/lib/curriculum/cases/types";

export type Difficulty = "easy" | "medium" | "hard" | "all";

export interface PracticePool {
  mcqs: Mcq[];
  cases: CaseStudy[];
  problems: Problem[];
}

/** mulberry32 seeded shuffle — same family as the exam deck builder. */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DECK_SIZE = 10;

function filterDifficulty<T extends { difficulty?: "easy" | "medium" | "hard" }>(items: T[], d: Difficulty): T[] {
  if (d === "all") return items;
  return items.filter((i) => (i.difficulty ?? "easy") === d);
}

const DIFF_CHIP: Record<Difficulty, string> = {
  easy: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  hard: "text-rose-600 dark:text-rose-400",
  all: "text-indigo-600 dark:text-indigo-400",
};

export function DifficultyPicker({ value, onChange }: { value: Difficulty; onChange: (d: Difficulty) => void }) {
  const opts: Difficulty[] = ["easy", "medium", "hard", "all"];
  return (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
            value === d
              ? "bg-indigo-600 text-white"
              : "bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20"
          } ${value === d ? "" : DIFF_CHIP[d]}`}
        >
          {d === "all" ? "All tiers" : d}
        </button>
      ))}
    </div>
  );
}

export function SurfacePicker({
  value,
  onChange,
  pool,
}: {
  value: GauntletSurface;
  onChange: (s: GauntletSurface) => void;
  pool: PracticePool;
}) {
  const opts: Array<{ id: GauntletSurface; label: string; n: number }> = [
    { id: "mcqs", label: "Quiz", n: pool.mcqs.length },
    { id: "cases", label: "Case files", n: pool.cases.length },
    { id: "problems", label: "Query problems", n: pool.problems.length },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            value === o.id
              ? "bg-indigo-600 text-white"
              : "bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20"
          }`}
        >
          {o.label} · {o.n}
        </button>
      ))}
    </div>
  );
}

export function PracticeRunner({
  scopeId,
  pool,
  surface,
  onSurfaceChange,
  title,
}: {
  scopeId: string;
  pool: PracticePool;
  surface: GauntletSurface;
  onSurfaceChange: (s: GauntletSurface) => void;
  title: string;
}) {
  const store = useGauntletSession();
  const saved = store.sessions[scopeId];
  const progress = useProgress();
  const [roundNum, setRoundNum] = useState(saved?.roundNum ?? 1);
  const [deckIdx, setDeckIdx] = useState(saved?.idx ?? 0);

  const deckIds = saved?.deckIds as string[] | undefined;
  const surfaceOf = (id: string): GauntletSurface =>
    pool.mcqs.some((m) => m.id === id) ? "mcqs" : pool.cases.some((c) => c.id === id) ? "cases" : "problems";

  const deck = useMemo(() => {
    if (deckIds && deckIds.length) {
      const resolved = deckIds
        .map((id) => {
          const s = surfaceOf(id);
          if (s === "mcqs") return pool.mcqs.find((m) => m.id === id);
          if (s === "cases") return pool.cases.find((c) => c.id === id);
          return pool.problems.find((p) => p.id === id);
        })
        .filter(Boolean) as Array<Mcq | CaseStudy | Problem>;
      if (resolved.length) return resolved;
    }
    const items: Array<Mcq | CaseStudy | Problem> =
      surface === "mcqs" ? pool.mcqs : surface === "cases" ? pool.cases : pool.problems;
    return seededShuffle(items, Date.now() % 2147483647).slice(0, DECK_SIZE);
  }, [scopeId, surface, roundNum]);

  function commit(idx: number, round: number, ids: string[]) {
    store.put(scopeId, {
      moduleId: scopeId,
      surface,
      difficulty: "all",
      deckIds: ids,
      idx,
      roundNum: round,
      deckSize: deck.length,
    });
  }

  const ids = deck.map((d) => d.id);
  function advance() {
    const next = deckIdx + 1;
    if (next >= deck.length) {
      store.drop(scopeId);
      setDeckIdx(0);
      setRoundNum((r) => r + 1);
      commit(0, roundNum + 1, []);
    } else {
      setDeckIdx(next);
      commit(next, roundNum, ids);
    }
  }

  const current = deck[deckIdx];
  const doneInDeck =
    surface === "mcqs"
      ? deck.filter((d) => progress.mcqAttempts[d.id]?.correct).length
      : deck.filter((d) => progress.xpEvents[`${surface === "cases" ? "case" : "solve"}:${d.id}`] !== undefined).length;

  const fullPool = surface === "mcqs" ? pool.mcqs : surface === "cases" ? pool.cases : pool.problems;
  const doneInPool =
    surface === "mcqs"
      ? fullPool.filter((d) => progress.mcqAttempts[d.id]?.correct).length
      : fullPool.filter((d) => progress.xpEvents[`${surface === "cases" ? "case" : "solve"}:${d.id}`] !== undefined).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Swords className="h-4 w-4 text-indigo-500" />
          <span>{title}</span>
          <span className="text-xs text-neutral-500">
            round {roundNum} · card {Math.min(deckIdx + 1, deck.length)}/{deck.length} · solved {doneInDeck}/{deck.length} this deck · {doneInPool}/{fullPool.length} in pool
          </span>
        </div>
        <SurfacePicker value={surface} onChange={onSurfaceChange} pool={pool} />
      </div>

      {current ? (
        <div key={current.id} className="animate-in fade-in slide-in-from-bottom-2">
          {surfaceOf(current.id) === "mcqs" ? (
            <McqCard mcq={current as Mcq} onAnswered={advance} />
          ) : surfaceOf(current.id) === "cases" ? (
            <CaseFileCard cs={current as CaseStudy} onSolved={advance} />
          ) : (
            <ProblemCard problem={current as Problem} index={deckIdx + 1} onSolved={advance} />
          )}
          <div className="mt-3 flex justify-end">
            <button
              onClick={advance}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Skip <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          <p className="text-sm font-medium">Deck cleared.</p>
          <button
            onClick={() => {
              store.drop(scopeId);
              setDeckIdx(0);
              setRoundNum((r) => r + 1);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <RotateCcw className="h-4 w-4" /> Next round
          </button>
        </div>
      )}
    </div>
  );
}
