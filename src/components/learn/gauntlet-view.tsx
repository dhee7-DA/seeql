// GauntletView — the module-end practice tier (Keyword Mastery program).
// 50 MCQs + 90 case files (30/30/30 E/M/H) + 90 graded problems (30/30/30)
// per module bank, run through the shared PracticeRunner with a difficulty
// picker. Separate from the 12-minute module exam, which stays the
// certification path.
import { useState } from "react";
import { ArrowLeft, Swords, ShieldCheck } from "lucide-react";
import { MODULES } from "@/lib/curriculum/lessons";
import { gauntletFor } from "@/lib/curriculum/gauntlet";
import { useGauntletSession, gauntletScope, type GauntletSurface } from "@/lib/curriculum/gauntlet-session";
import { PracticeRunner, DifficultyPicker, type Difficulty, type PracticePool } from "./practice-runner";

export function GauntletView({ moduleId, onExit }: { moduleId: string; onExit: () => void }) {
  const mod = MODULES.find((m) => m.id === moduleId);
  const bank = gauntletFor(mod?.num ?? 0);
  const store = useGauntletSession();
  const [surface, setSurface] = useState<GauntletSurface>(store.sessions[gauntletScope(mod?.num ?? 0)]?.surface ?? "mcqs");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");

  const pool: PracticePool = bank
    ? {
        mcqs: difficulty === "all" ? bank.mcqs : bank.mcqs.filter((q) => (q.difficulty ?? "easy") === difficulty),
        cases: difficulty === "all" ? bank.cases : bank.cases.filter((c) => c.tier === difficulty),
        problems: difficulty === "all" ? bank.problems : bank.problems.filter((p) => p.difficulty === difficulty),
      }
    : { mcqs: [], cases: [], problems: [] };

  if (!mod || !bank) {
    return (
      <div className="p-8 text-center text-sm text-neutral-500">
        No gauntlet bank for this module yet — it ships with the module's Keyword Mastery pass.
      </div>
    );
  }

  const scopeId = gauntletScope(mod.num);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-4 pb-24 md:p-6">
      <button onClick={onExit} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to course
      </button>

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Swords className="h-6 w-6 text-indigo-500" />
          <h1 className="text-2xl font-bold tracking-tight">Module {mod.num} Gauntlet</h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {mod.title} — the module-end practice tier. Every keyword in this module, at full depth: 50 quiz questions,
          30/30/30 case files and 30/30/30 graded query problems across easy, medium and hard.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 font-medium text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="h-3.5 w-3.5" /> engine-verified bank
          </span>
          <span className="rounded-full bg-black/5 px-2.5 py-1 font-medium dark:bg-white/10">50 MCQs</span>
          <span className="rounded-full bg-black/5 px-2.5 py-1 font-medium dark:bg-white/10">90 case files</span>
          <span className="rounded-full bg-black/5 px-2.5 py-1 font-medium dark:bg-white/10">90 query problems</span>
        </div>
      </header>

      <DifficultyPicker value={difficulty} onChange={setDifficulty} />

      <PracticeRunner
        scopeId={scopeId}
        pool={pool}
        surface={surface}
        onSurfaceChange={setSurface}
        title={`Module ${mod.num} · ${mod.title}`}
      />
    </div>
  );
}
