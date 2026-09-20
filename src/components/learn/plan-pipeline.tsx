"use client";

// Plan pipeline — renders EXPLAIN QUERY PLAN rows as a readable vertical
// pipeline: every step gets an op badge, its real detail line, and a
// plain-English story. SCAN (full sweep) reads amber, SEARCH (index descent)
// reads emerald, temp B-trees sky, subqueries violet.

import { motion } from "framer-motion";
import { ArrowDownRight, Database, GitBranch, Layers, Search, Zap } from "lucide-react";
import type { PlanRow } from "@/lib/sql-types";
import {
  parsePlan,
  reportPlan,
  stepStory,
  type PlanReport,
  type PlanStep,
} from "@/lib/plan-explain";
import { cn } from "@/lib/utils";

function stepVisual(step: PlanStep): { icon: typeof Database; cls: string; label: string } {
  if (step.op === "search" && step.pkLookup) {
    return { icon: Zap, cls: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300", label: "PK LOOKUP" };
  }
  if (step.op === "search") {
    return {
      icon: Search,
      cls: step.covering
        ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
        : "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
      label: step.covering ? "SEARCH · COVERING" : "SEARCH",
    };
  }
  if (step.op === "scan") {
    return {
      icon: Database,
      cls: step.bareScan
        ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
        : "border-sky-400/40 bg-sky-400/10 text-sky-300",
      label: step.bareScan ? "SCAN · FULL" : "SCAN · INDEX",
    };
  }
  if (step.op === "temp") {
    return { icon: Layers, cls: "border-sky-400/40 bg-sky-400/10 text-sky-300", label: `TEMP B-TREE · ${step.tempFor ?? ""}` };
  }
  if (step.op === "subquery" || step.op === "materialize") {
    return { icon: GitBranch, cls: "border-violet-400/40 bg-violet-400/10 text-violet-300", label: step.op === "materialize" ? "MATERIALIZE" : "SUBQUERY" };
  }
  return { icon: ArrowDownRight, cls: "border-zinc-700 bg-zinc-900 text-zinc-400", label: step.op.toUpperCase() };
}

/** Depth by walking the parent chain (plans are shallow — cheap loop). */
function depthOf(step: PlanStep, byId: Map<number, PlanStep>): number {
  let d = 0;
  let p = step.parent;
  while (p !== null && byId.has(p)) {
    d += 1;
    p = byId.get(p)!.parent;
    if (d > 6) break;
  }
  return d;
}

export function PlanPipeline({
  rows,
  highlight,
  otherDetails,
}: {
  rows: PlanRow[];
  /** "collapsed" dims steps that vanished from the other plan; "fresh" rings ones that appeared. */
  highlight?: "collapsed" | "fresh";
  /** Detail strings of the other plan, for the highlight. */
  otherDetails?: Set<string>;
}) {
  const steps = parsePlan(rows);
  const byId = new Map(steps.map((s) => [s.id, s]));

  return (
    <ol className="relative space-y-2">
      {steps.map((s, i) => {
        const v = stepVisual(s);
        const Icon = v.icon;
        const changed =
          highlight && otherDetails ? !otherDetails.has(s.raw) : false;
        return (
          <motion.li
            key={`${s.id}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 380, damping: 30 }}
            style={{ marginLeft: depthOf(s, byId) * 20 }}
            className={cn(
              "rounded-md border px-3 py-2",
              v.cls.includes("emerald") ? "border-emerald-400/30 bg-zinc-900/70" : "border-zinc-800/80 bg-zinc-900/60",
              highlight === "fresh" && changed && "border-emerald-400/60 bg-emerald-400/[0.07]",
              highlight === "collapsed" && changed && "opacity-55",
            )}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={cn("flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wider", v.cls)}>
                <Icon className="h-2.5 w-2.5" /> {v.label}
              </span>
              {s.table && (
                <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">{s.table}</span>
              )}
              {s.indexName && (
                <span className="rounded border border-emerald-400/30 bg-emerald-400/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-emerald-200/90">
                  {s.indexName}
                </span>
              )}
              {s.constraints && (
                <span className="rounded bg-zinc-800/60 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">{s.constraints}</span>
              )}
              {highlight === "collapsed" && changed && (
                <span className="ml-auto font-mono text-[9px] tracking-wider text-amber-300/80">GONE</span>
              )}
            </div>
            <p className={cn("mt-1 font-mono text-[11px] leading-relaxed text-zinc-300", highlight === "collapsed" && changed && "line-through decoration-zinc-600")}>
              {s.raw}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{stepStory(s)}</p>
          </motion.li>
        );
      })}
    </ol>
  );
}

export function ReportChips({ report }: { report: PlanReport }) {
  const chips: Array<{ label: string; value: number | string; tone: string }> = [
    { label: "steps", value: report.steps, tone: "text-zinc-200" },
    { label: "full scans", value: report.scans, tone: report.scans > 0 ? "text-amber-300" : "text-emerald-300" },
    { label: "index seeks", value: report.searches, tone: "text-emerald-300" },
    { label: "temp sorts", value: report.sorts, tone: report.sorts > 0 ? "text-sky-300" : "text-zinc-400" },
  ];
  if (report.covering > 0) chips.push({ label: "covering", value: report.covering, tone: "text-emerald-200" });
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <span key={c.label} className="rounded-md border border-zinc-800 bg-zinc-900/70 px-2 py-1 text-[11px]">
          <span className={cn("tnum font-semibold", c.tone)}>{c.value}</span>{" "}
          <span className="text-zinc-500">{c.label}</span>
        </span>
      ))}
    </div>
  );
}

/** Steps N→M style diff header for the workbench comparison. */
export function DiffHeader({
  before,
  after,
  rowCount,
}: {
  before: PlanReport;
  after: PlanReport;
  rowCount: number | null;
}) {
  const metric = (
    label: string,
    a: number,
    b: number,
    betterWhenLower: boolean,
  ) => {
    const improved = betterWhenLower ? b < a : b > a;
    const same = a === b;
    return (
      <span key={label} className="rounded-md border border-zinc-800 bg-zinc-900/70 px-2 py-1 text-[11px]">
        <span className="text-zinc-500">{label} </span>
        <span className="tnum text-zinc-300">{a}</span>
        <span className="text-zinc-600"> → </span>
        <span className={cn("tnum font-semibold", same ? "text-zinc-300" : improved ? "text-emerald-300" : "text-rose-300")}>{b}</span>
      </span>
    );
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {metric("steps", before.steps, after.steps, true)}
      {metric("full scans", before.scans, after.scans, true)}
      {metric("index seeks", before.searches, after.searches, false)}
      {metric("temp sorts", before.sorts, after.sorts, true)}
      {rowCount !== null && (
        <span className="rounded-md border border-emerald-400/30 bg-emerald-400/[0.07] px-2 py-1 text-[11px] text-emerald-200">
          same rows ✓ <span className="tnum">{rowCount}</span>
        </span>
      )}
    </div>
  );
}
