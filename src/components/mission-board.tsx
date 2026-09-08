"use client";

// MissionBoard — the "Try it" challenge deck for the playground.
//
// Selected mission auto-checks against the LATEST run's result shape; passing
// awards XP into the shared Learn ledger (idempotent key mission:<id>), so
// Playground and Learn tell one progress story.

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, EyeOff, Lightbulb, Lock, Trophy, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MISSIONS, MISSION_XP, type Mission, type MissionVerdict } from "@/lib/missions";
import { useProgress } from "@/lib/curriculum/progress";
import type { ExecResult } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

const DIFF_CHIP: Record<Mission["difficulty"], string> = {
  easy: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  hard: "border-rose-400/30 bg-rose-400/10 text-rose-300",
};

const XP_KEY_PREFIX = "mission:";

export function MissionBoard({
  exec,
  ranSql,
  onLoadSql,
}: {
  /** the latest run's result — missions are checked against its shape */
  exec: ExecResult | null;
  /** the SQL text that produced exec (shown when a verdict is up) */
  ranSql?: string;
  onLoadSql: (sql: string) => void;
}) {
  const xpEvents = useProgress((s) => s.xpEvents);
  const awardXp = useProgress((s) => s.awardXp);

  const doneIds = useMemo(
    () => new Set(MISSIONS.filter((m) => xpEvents[XP_KEY_PREFIX + m.id] !== undefined).map((m) => m.id)),
    [xpEvents],
  );
  const [selectedId, setSelectedId] = useState<string>(MISSIONS[0].id);
  const [showHint, setShowHint] = useState(false);
  const selected = MISSIONS.find((m) => m.id === selectedId) ?? MISSIONS[0];

  // shape check — pure derivation, recomputed when a new run lands
  const verdict: MissionVerdict | null = useMemo(() => {
    if (!exec || !exec.ok) return null;
    return selected.check({
      columns: exec.columns,
      rows: exec.rows,
      statementType: exec.statementType,
    });
  }, [exec, selected]);

  // award once — the ledger is idempotent, so re-passing never double-pays
  useEffect(() => {
    if (verdict?.pass) awardXp(XP_KEY_PREFIX + selected.id, MISSION_XP[selected.difficulty]);
  }, [verdict?.pass, selected, awardXp]);

  const done = doneIds.has(selected.id);
  const xpEarned = MISSIONS.reduce((n, m) => n + (xpEvents[XP_KEY_PREFIX + m.id] ?? 0), 0);

  return (
    <div className="p-3">
      <div className="mb-3 flex flex-wrap items-center gap-2 px-1">
        <Trophy className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Try-it missions</h3>
        <span className="rounded-full border border-zinc-700 bg-zinc-800/60 px-2 py-0.5 text-[11px] text-zinc-400">
          {doneIds.size}/{MISSIONS.length} done · {xpEarned} XP
        </span>
        <span className="ml-auto hidden text-[11px] text-zinc-600 sm:block">
          checked against the shape of your latest run — any query that produces the right data passes
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(0,2fr)]">
        {/* mission list */}
        <div className="thin-scrollbar max-h-[360px] space-y-1.5 overflow-y-auto pr-0.5">
          {MISSIONS.map((m) => {
            const isDone = doneIds.has(m.id);
            const isActive = m.id === selectedId;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedId(m.id);
                  setShowHint(false);
                }}
                aria-pressed={isActive}
                className={cn(
                  "w-full rounded-lg border px-2.5 py-2 text-left transition-colors",
                  isActive
                    ? "border-emerald-400/40 bg-emerald-400/5"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                      isDone
                        ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-300"
                        : "border-zinc-700 text-zinc-600",
                    )}
                  >
                    {isDone ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  </span>
                  <span className={cn("flex-1 truncate text-xs font-medium", isDone ? "text-zinc-400" : "text-zinc-200")}>
                    {m.title}
                  </span>
                  <span className={cn("rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase", DIFF_CHIP[m.difficulty])}>
                    {m.difficulty}
                  </span>
                  <span className="font-mono text-[10px] text-amber-300/80">+{MISSION_XP[m.difficulty]}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* selected mission */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-zinc-100">{selected.title}</h4>
            <span className={cn("rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase", DIFF_CHIP[selected.difficulty])}>
              {selected.difficulty}
            </span>
            {done && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <Check className="h-3 w-3" /> earned +{MISSION_XP[selected.difficulty]} XP
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">{selected.prompt}</p>
          <p className="mt-1 font-mono text-[11px] text-zinc-500">
            shape to hit: <span className="text-zinc-400">{selected.shape}</span>
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLoadSql(selected.starter)}
              className="h-7 gap-1.5 border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              <Wand2 className="h-3 w-3" />
              Load starting point
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint((v) => !v)}
              className="h-7 gap-1.5 px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              {showHint ? <EyeOff className="h-3 w-3" /> : <Lightbulb className="h-3 w-3" />}
              {showHint ? "Hide hint" : "Hint"}
            </Button>
          </div>
          {showHint && (
            <p className="mt-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-200/90">
              {selected.hint}
            </p>
          )}

          {/* verdict */}
          <div className="mt-3">
            <AnimatePresence mode="wait">
              {!exec ? (
                <motion.p
                  key="no-run"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] text-zinc-600"
                >
                  Press <span className="font-mono text-zinc-500">Run</span> and I&apos;ll check the result&apos;s shape against this mission.
                </motion.p>
              ) : !exec.ok ? (
                <motion.p
                  key="err"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] text-rose-300/80"
                >
                  The last run failed — fix the query and run it again.
                </motion.p>
              ) : verdict?.pass ? (
                <motion.div
                  key={`pass-${selected.id}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-2"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <p className="text-[11px] leading-relaxed text-emerald-200">
                    <span className="font-semibold">Mission complete{done ? "" : ` — +${MISSION_XP[selected.difficulty]} XP`}. </span>
                    {verdict.feedback}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={`fail-${selected.id}-${ranSql?.length ?? 0}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 rounded-lg border border-amber-400/25 bg-amber-400/5 px-2.5 py-2"
                >
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <p className="text-[11px] leading-relaxed text-amber-200/90">{verdict?.feedback ?? "Run the query to check this mission."}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
