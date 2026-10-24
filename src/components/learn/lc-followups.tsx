"use client";

// The Follow-up Gauntlet — interviewer push-backs derived from each problem's
// own model solution. Every follow-up that appears here survived build-time
// verification (scripts/lc-followups-gen.ts ran it against the problem's real
// seed and kept it only because it returns a different, meaningful result).
// Grading: the user's query and the mutated model SQL both run through the
// same /api/lc-sql sandbox; the comparison reuses gradeSqlResult — identical
// trust model to the base problem, with the model answer as the snapshot.

import { useState } from "react";
import { Check, ChevronRight, Eye, Lightbulb, Lock, Play, Swords } from "lucide-react";
import type { LcRef, LcSqlDive } from "@/lib/leetcode/types";
import { FU_SPECS } from "@/lib/leetcode/followup-specs";
import { deriveFollowUp, fuXpKey, type FuSpec } from "@/lib/leetcode/followups";
import { gradeSqlResult, type SqlCheckOutcome } from "@/lib/leetcode/sql-check";
import type { ExecResult } from "@/lib/sql-types";
import { useProgress } from "@/lib/curriculum/progress";
import { celebrate } from "./celebrate";
import { Btn, Panel } from "./ui/kit";
import { SectionHead } from "./lc-dive-ui";
import { SqlEditor } from "@/components/sql-editor";
import { ResultGrid } from "./result-grid";
import { cn } from "@/lib/utils";

const FU_XP = 5;

function FuCard({ p, dive, spec, idx }: { p: LcRef; dive: LcSqlDive; spec: FuSpec; idx: number }) {
  const awardXp = useProgress((s) => s.awardXp);
  const cleared = useProgress((s) => s.xpEvents[fuXpKey(dive.slug, idx)]) !== undefined;
  const derived = deriveFollowUp(dive, spec);
  const [sql, setSql] = useState("");
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<SqlCheckOutcome | null>(null);
  const [hint, setHint] = useState(false);
  const [reveal, setReveal] = useState(cleared);
  const [result, setResult] = useState<ExecResult | null>(null);

  if (!derived) return null;

  const run = async () => {
    if (busy || !sql.trim()) return;
    setBusy(true);
    setOutcome(null);
    try {
      // the lc-sql route now runs each request in its own :memory: sandbox,
      // so user + model queries can go out in parallel safely
      const [uRes, mRes] = await Promise.all([
        fetch("/api/lc-sql", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: dive.slug, sql }) }),
        fetch("/api/lc-sql", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: dive.slug, sql: derived.modelSql }) }),
      ]);
      const u = (await uRes.json()) as ExecResult | { ok: false; error: string };
      if (!u.ok) {
        setOutcome({ status: "error", title: "Query error", detail: "error" in u ? u.error : "Query failed" });
        setResult(null);
        return;
      }
      const m = (await mRes.json()) as ExecResult | { ok: false; error: string };
      if (!m.ok) {
        setOutcome({ status: "error", title: "Grader error", detail: "The follow-up's model query failed — report this one." });
        return;
      }
      setResult(u);
      const oc = gradeSqlResult(u, { slug: dive.slug, columns: m.columns, rows: m.rows, order: derived.order });
      setOutcome(oc);
      if (oc.status === "pass" && awardXp(fuXpKey(dive.slug, idx), FU_XP)) {
        setReveal(true);
        celebrate({ kind: "xp", title: `+${FU_XP} XP — follow-up ${idx} cleared`, sub: p.title });
      }
    } catch {
      setOutcome({ status: "error", title: "Network error", detail: "Try again." });
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  const passed = outcome?.status === "pass";

  return (
    <div className={cn("rounded-lg border p-3", cleared ? "border-emerald-400/25 bg-emerald-400/[0.04]" : "border-zinc-800 bg-zinc-950/40")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12.5px] font-medium leading-relaxed text-zinc-200">
          <span className="mr-1.5 font-mono text-[10px] uppercase tracking-wider text-fuchsia-400">push {idx}</span>
          {derived.statement}
        </p>
        {cleared && (
          <span className="flex shrink-0 items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            <Check className="h-3 w-3" /> +{FU_XP}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded-md border border-sky-400/25 bg-sky-400/[0.07] px-2 py-0.5 font-mono text-[10px] text-sky-300">
          {derived.order === "exact" ? "row order graded" : "any row order"}
        </span>
        <button type="button" onClick={() => setHint((v) => !v)} className="flex items-center gap-1 rounded-md border border-amber-400/25 bg-amber-400/[0.07] px-2 py-0.5 text-[10px] text-amber-300 hover:bg-amber-400/[0.12]">
          <Lightbulb className="h-3 w-3" /> {hint ? "Hide nudge" : "Nudge"}
        </button>
      </div>
      {hint && (
        <p className="mt-2 rounded-md border border-amber-400/20 bg-amber-400/[0.05] p-2 text-[11.5px] leading-relaxed text-amber-200/90">{derived.hint}</p>
      )}
      {!cleared && (
        <>
          <div className="mt-2.5">
            <SqlEditor value={sql} onChange={setSql} onVisualize={() => void run()} className="min-h-[88px]" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Btn variant="soft" disabled={busy || !sql.trim()} onClick={() => void run()}>
              <Play className="h-3 w-3" /> {busy ? "Running…" : `Run & check · +${FU_XP} XP`}
            </Btn>
          </div>
        </>
      )}
      {outcome && (
        <div className={cn("mt-2 rounded-md border p-2.5", passed ? "border-emerald-400/30 bg-emerald-400/[0.06]" : outcome.status === "error" ? "border-rose-400/30 bg-rose-400/[0.06]" : "border-amber-400/30 bg-amber-400/[0.06]")}>
          <p className={cn("font-mono text-[10px] uppercase tracking-wider", passed ? "text-emerald-300" : outcome.status === "error" ? "text-rose-300" : "text-amber-300")}>{outcome.title}</p>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-zinc-400">{outcome.detail}</p>
        </div>
      )}
      {result && (
        <div className="mt-2">
          <ResultGrid data={{ columns: result.columns, rows: result.rows }} />
        </div>
      )}
      {reveal && (
        <div className="mt-2">
          <p className="mb-1 flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">
            <Eye className="h-3 w-3" /> one way to answer it
          </p>
          <pre className="thin-scrollbar max-h-44 overflow-auto rounded-md border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-[11px] leading-5 text-zinc-300">{derived.modelSql}</pre>
        </div>
      )}
    </div>
  );
}

/** Mounted in the dive detail under the sandbox — locked until the base
 *  problem is solved, exactly like an interviewer who won't move on early. */
export function FuGauntlet({ p, dive, onNext }: { p: LcRef; dive: LcSqlDive; onNext?: (slug: string) => void }) {
  const solved = useProgress((s) => s.xpEvents[`lc:${dive.slug}`]) !== undefined;
  const clearedCount = useProgress((s) => {
    let n = 0;
    for (let i = 1; i <= 2; i++) if (s.xpEvents[fuXpKey(dive.slug, i)] !== undefined) n++;
    return n;
  });
  const specs = FU_SPECS[dive.slug] ?? [];
  if (!specs.length) return null;
  const allCleared = clearedCount >= specs.length;

  return (
    <Panel pad={4} id="dive-gauntlet" className="scroll-mt-16">
      <SectionHead
        tone="fuchsia"
        icon={Swords}
        title="The Follow-up Gauntlet"
        kicker="the interviewer pushes back — same schema, harder ask"
        right={
          <span className={cn("rounded-md border px-2.5 py-1 text-[11px] font-medium", clearedCount === specs.length ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-zinc-700 bg-zinc-900/60 text-zinc-400")}>
            {clearedCount}/{specs.length} cleared · +{FU_XP} XP each
          </span>
        }
      />
      {!solved ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3.5">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
          <p className="text-[12.5px] leading-relaxed text-zinc-500">
            {specs.length} verified follow-up{specs.length === 1 ? "" : "s"} wait behind this problem — real interviewer
            push-backs, each graded against the same seeded schema. Solve the problem first; the gauntlet unlocks
            the moment your query passes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {specs.map((spec, i) => (
            <FuCard key={spec.kind + i} p={p} dive={dive} spec={spec} idx={i + 1} />
          ))}
          {allCleared && onNext && (
            <Btn variant="soft" onClick={() => onNext(dive.slug)}>
              Next problem <ChevronRight className="h-3 w-3" />
            </Btn>
          )}
        </div>
      )}
    </Panel>
  );
}
