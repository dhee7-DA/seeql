// Keyword practice — the Keyword Mastery hub. Every course keyword in
// dictionary order with its live practice pools (multi-label, tagged by the
// same taxonomy as the coverage workbook), expandable into a runner deck.
import { useMemo, useState } from "react";
import { ChevronRight, Crosshair, Flame } from "lucide-react";
import { keywordPools } from "@/lib/curriculum/keyword-practice";
import { D } from "@/lib/curriculum/keyword-taxonomy";
import { useProgress } from "@/lib/curriculum/progress";
import { useGauntletSession, gauntletScope, type GauntletSurface } from "@/lib/curriculum/gauntlet-session";
import { PracticeRunner, DifficultyPicker, type Difficulty, type PracticePool } from "./practice-runner";

const CATS = [
  "Reading data", "Boolean logic", "NULL handling", "Aggregation", "Joins",
  "Set operations", "Conditional logic", "Subqueries", "CTEs",
  "Window functions", "Functions", "Writes", "Schema",
];

type Row = { kw: string; cat: string; mcqs: number; cases: number; problems: number; done: number };

export function KeywordPractice() {
  const pools = useMemo(() => keywordPools(), []);
  const progress = useProgress();
  const store = useGauntletSession();
  const [open, setOpen] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [surface, setSurface] = useState<GauntletSurface>("mcqs");

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    pools.forEach((pool, kw) => {
      const cat =
        // category from the first matching pool entry's tag is unavailable client-side;
        // derive it from the dictionary order file instead (cheap re-tag by category table).
        (CATEGORY_OF as Record<string, string>)[kw] ?? "Schema";
      const done =
        pool.mcqs.filter((m) => progress.mcqAttempts[m.item.id]?.correct).length +
        pool.cases.filter((c) => progress.xpEvents[`case:${c.item.id}`] !== undefined).length +
        pool.problems.filter((p) => progress.xpEvents[`solve:${p.item.id}`] !== undefined).length;
      out.push({ kw, cat, mcqs: pool.mcqs.length, cases: pool.cases.length, problems: pool.problems.length, done });
    });
    return out.sort((a, b) => CATS.indexOf(a.cat) - CATS.indexOf(b.cat) || a.kw.localeCompare(b.kw));
  }, [pools, progress.mcqAttempts, progress.xpEvents]);

  const openPool = open ? pools.get(open) : null;
  const openRow = rows.find((r) => r.kw === open);
  const openPracticePool: PracticePool | null = useMemo(() => {
    if (!openPool) return null;
    const d = difficulty;
    return {
      mcqs: d === "all" ? openPool.mcqs.map((m) => m.item) : openPool.mcqs.map((m) => m.item).filter((q) => (q.difficulty ?? "easy") === d),
      cases: d === "all" ? openPool.cases.map((c) => c.item) : openPool.cases.map((c) => c.item).filter((c) => c.tier === d),
      problems: d === "all" ? openPool.problems.map((p) => p.item) : openPool.problems.map((p) => p.item).filter((p) => p.difficulty === d),
    };
  }, [openPool, difficulty]);

  const scopeId = open ? gauntletScope(`kw-${open}`) : "";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-4 pb-24 md:p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Crosshair className="h-6 w-6 text-indigo-500" />
          <h1 className="text-2xl font-bold tracking-tight">Keyword practice</h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          The whole course, per keyword. Every quiz question, case file and graded problem tagged to each concept —
          pick a keyword, pick a tier, drill the deck. Tagging matches the coverage workbook exactly.
        </p>
      </header>

      {open && openRow && openPracticePool ? (
        <div className="space-y-4">
          <button
            onClick={() => {
              setOpen(null);
              store.drop(scopeId);
            }}
            className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <ChevronRight className="h-4 w-4 rotate-180" /> All keywords
          </button>
          <div>
            <h2 className="text-lg font-semibold">{openRow.kw}</h2>
            <p className="text-xs text-neutral-500">
              {openRow.mcqs} MCQs · {openRow.cases} case files · {openRow.problems} query problems · {openRow.done} solved
            </p>
          </div>
          <DifficultyPicker value={difficulty} onChange={setDifficulty} />
          <PracticeRunner scopeId={scopeId} pool={openPracticePool} surface={surface} onSurfaceChange={setSurface} title={openRow.kw} />
        </div>
      ) : (
        <div className="space-y-6">
          {CATS.map((cat) => {
            const catRows = rows.filter((r) => r.cat === cat);
            if (!catRows.length) return null;
            return (
              <section key={cat} className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{cat}</h2>
                <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                  {catRows.map((r, i) => (
                    <button
                      key={r.kw}
                      onClick={() => setOpen(r.kw)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                        i > 0 ? "border-t border-black/5 dark:border-white/5" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{r.kw}</p>
                        <p className="text-xs text-neutral-500">
                          {r.mcqs} quiz · {r.cases} cases · {r.problems} problems
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {r.done > 0 && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <Flame className="h-3 w-3" /> {r.done}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-neutral-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** keyword -> category, derived once from the taxonomy dictionary. */
const CATEGORY_OF: Record<string, string> = Object.fromEntries(D.map((d) => [d.kw, d.cat]));
