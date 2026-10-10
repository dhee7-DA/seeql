"use client";

// The Data & Finance teaching layer — the CONCEPT PRIMER card rendered as
// the first teaching panel of a deep-dive (before the breakdown), and the
// section STUDY GUIDE panel rendered under a section header in the band.
// Both exist because the finance domains are new to the learner: the primer
// teaches the concept from zero, the study guide frames the whole section
// in its real-life pipeline.

import { useState } from "react";
import {
  Briefcase,
  Building2,
  ChevronDown,
  GraduationCap,
  Lightbulb,
  ListOrdered,
  BookMarked,
} from "lucide-react";
import type { LcSqlDive } from "@/lib/leetcode/types";
import type { LcSection } from "@/lib/leetcode/sections";
import { LC_ALL } from "@/lib/leetcode/registry";
import { PrimerArt, StudyFlowArt } from "./lc-df-art";
import { SectionHead, SqlProse } from "./lc-dive-ui";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* PrimerCard — the concept, from zero                                 */
/* ------------------------------------------------------------------ */

const PRIMER_ART_LABEL: Record<string, string> = {
  "vintage-default-curves": "concept · the vintage curve — cohorts aging together",
  "delinquency-roll-rates": "concept · the delinquency state machine",
  "credit-utilization-bands": "concept · the utilization gauge and its bands",
  "expected-credit-loss": "concept · PD × LGD × EAD — the anatomy of a loss",
  "risk-based-pricing": "concept · the rate sheet and its exceptions",
  "prepayment-detection": "concept · two balance walks — scheduled vs actual",
  "structuring-detection": "concept · deposits under the CTR wall",
  "transaction-velocity": "concept · 300-second buckets on the card feed",
  "circular-transfers": "concept · the boomerang, and the chain that isn't one",
  "amount-anomaly-zscore": "concept · the customer's own bell curve",
  "chargeback-rate-ranking": "concept · merchants against the 1% wall",
  "dormant-reactivation": "concept · silent, then burst",
  "trial-balance-check": "concept · the scale — debits vs credits",
  "ar-aging-schedule": "concept · the aging conveyor",
  "balance-rollforward": "concept · opening + activity = closing",
  "fifo-inventory-cogs": "concept · the crate stack, oldest out first",
  "deferred-revenue": "concept · cash now, revenue later",
  "journal-gap-detection": "concept · the document strip and its missing teeth",
  "time-weighted-return": "concept · the value line with flow breaks",
  "sharpe-ratio": "concept · return per unit of bumpiness",
  "value-at-risk": "concept · the left tail — the 1-in-20 bad day",
  "beta-benchmark": "concept · the scatter against the market",
  "split-adjusted-position": "concept · the split cliff, raw vs adjusted",
  "wash-trade-detection": "concept · the round trip inside the window",
  // batch 1-2 retrofit — Product Analytics
  "dau-wau-stickiness": "concept · DAU inside the WAU envelope",
  "growth-accounting": "concept · the four levers of growth accounting",
  "funnel-step-conversion": "concept · the funnel and its two readings",
  "cohort-retention-matrix": "concept · the retention triangle",
  "sessionize-events": "concept · events folding into sessions",
  "ab-test-conversion-lift": "concept · one experiment, two worlds",
  // batch 1-2 retrofit — Finance Core
  "loan-amortization-schedule": "concept · every payment splits — interest then principal",
  "delinquency-buckets": "concept · the DPD aging clock",
  "portfolio-weights": "concept · your slice of the pie",
  "settlement-fails-aging": "concept · T+2 and the fail clock",
  "realized-pnl-average-cost": "concept · the average-cost ledger",
  "gl-reconciliation": "concept · two books, one truth",
  // batch 1-2 retrofit — Growth & Experiments
  "week-over-week-churn": "concept · churn leaves last week's porch",
  "median-time-to-convert": "concept · the median outruns the mean",
  "rolling-7d-actives": "concept · the trailing window that never sums",
  "usage-tier-percentiles": "concept · where you stand in the line",
  "ab-sample-ratio-mismatch": "concept · the gate before the lift",
  "feature-adoption-windows": "concept · clocks that start at signup",
  // batch 1-2 retrofit — Markets & Risk
  "fx-exposure-report": "concept · every currency becomes one number",
  "portfolio-concentration-hhi": "concept · many small vs one big",
  "daily-balance-interest": "concept · interest accrues on every day-end balance",
  "dividend-income-calendar": "concept · own it on ex-date, get paid",
  "max-drawdown": "concept · the deepest fall from the highest peak",
  "duplicate-charge-pairs": "concept · the same charge, twice",
};

export function PrimerCard({ dive }: { dive: LcSqlDive }) {
  const primer = dive.primer;
  if (!primer) return null;
  return (
    <Panel id="dive-primer">
      <SectionHead
        tone="amber"
        icon={GraduationCap}
        title="The concept — from zero"
        kicker="domain primer · read this before the breakdown"
      />
      {/* the hook */}
      <div className="rounded-lg border-l-2 border-amber-400/60 bg-amber-400/[0.06] px-3 py-2.5">
        <p className="flex items-start gap-2 text-[13.5px] font-medium leading-relaxed text-amber-200">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <SqlProse text={primer.hook} />
        </p>
      </div>
      {/* the diagram */}
      <div className="mt-3">
        <PrimerArt slug={dive.slug} label={PRIMER_ART_LABEL[dive.slug] ?? "concept diagram"} />
      </div>
      {/* concept paragraphs */}
      <div className="mt-4 space-y-2.5">
        {primer.concept.map((para, i) => (
          <p key={i} className="text-[13px] leading-relaxed text-zinc-300">
            <SqlProse text={para} />
          </p>
        ))}
      </div>
      {/* worked example */}
      <p className="mt-5 mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-emerald-300">
        <ListOrdered className="h-3.5 w-3.5" /> by hand first — no SQL yet
      </p>
      <ol className="space-y-1.5">
        {primer.worked.map((step, i) => (
          <li key={i} className="flex items-start gap-2.5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] px-3 py-2">
            <span className="mt-px flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border border-emerald-400/30 bg-emerald-400/10 px-1.5 font-mono text-[10px] text-emerald-300">
              {i + 1}
            </span>
            <span className="text-[12.5px] leading-relaxed text-zinc-300">
              <SqlProse text={step} />
            </span>
          </li>
        ))}
      </ol>
      {/* glossary */}
      <p className="mt-5 mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-cyan-300">
        <BookMarked className="h-3.5 w-3.5" /> the jargon, defined
      </p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {primer.glossary.map((g) => (
          <div key={g.term} className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.04] px-3 py-2">
            <p className="font-mono text-[11px] font-bold text-cyan-300">{g.term}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-400">
              <SqlProse text={g.def} />
            </p>
          </div>
        ))}
      </div>
      {/* real life */}
      <p className="mt-5 mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-violet-300">
        <Building2 className="h-3.5 w-3.5" /> how this plays out at a real company
      </p>
      <div className="space-y-2.5 rounded-lg border border-violet-400/20 bg-violet-400/[0.04] px-3.5 py-3">
        {primer.reallife.map((para, i) => (
          <p key={i} className="text-[12.5px] leading-relaxed text-zinc-300">
            <SqlProse text={para} />
          </p>
        ))}
      </div>
      {/* where you'll meet it */}
      <p className="mt-4 flex items-start gap-2 rounded-lg bg-zinc-900/60 px-3 py-2.5 text-[12.5px] leading-relaxed text-zinc-400">
        <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
        <span>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-amber-300">where you&apos;ll meet it · </span>
          <SqlProse text={primer.where} />
        </span>
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* SectionStudyPanel — start-here material under a section header      */
/* ------------------------------------------------------------------ */

const FLOW_LABEL: Record<string, string> = {
  "loan-life": "study flow · the life of a loan",
  "payments-pipeline": "study flow · the payments pipeline",
  "month-close": "study flow · the month-end close",
  "trades-to-risk": "study flow · from trades to risk numbers",
  "product-loop": "study flow · the product analytics loop",
  "money-pipeline": "study flow · from contracts to numbers",
  "experiment-life": "study flow · the life of an experiment",
  "market-desk": "study flow · the market desk's day",
};

function Panel({ id, children, className }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <div id={id} className={cn("scroll-mt-16 rounded-xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]", className)}>
      {children}
    </div>
  );
}

export function SectionStudyPanel({ sec }: { sec: LcSection }) {
  const study = sec.study;
  const [open, setOpen] = useState(false);
  if (!study) return null;
  const titles = new Map(LC_ALL.map((p) => [p.slug, p.title]));
  return (
    <div className="px-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-3 py-2 text-left transition-colors hover:bg-amber-400/[0.1]",
        )}
      >
        <GraduationCap className="h-4 w-4 shrink-0 text-amber-300" />
        <span className="text-[12px] font-semibold text-amber-200">Study guide — start here if this domain is new</span>
        <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 text-amber-300 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <Panel className="mt-2 border-amber-400/20 bg-amber-400/[0.03]">
          <StudyFlowArt flow={study.flow} label={FLOW_LABEL[study.flow] ?? "study flow"} />
          <div className="mt-4 space-y-2.5">
            {study.intro.map((para, i) => (
              <p key={i} className="text-[13px] leading-relaxed text-zinc-300">
                <SqlProse text={para} />
              </p>
            ))}
          </div>
          <p className="mt-4 mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-emerald-300">
            <ListOrdered className="h-3.5 w-3.5" /> the suggested path — solve in this order
          </p>
          <ol className="space-y-1.5">
            {study.path.map((step, i) => (
              <li key={step.slug} className="flex items-start gap-2.5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] px-3 py-2">
                <span className="mt-px flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border border-emerald-400/30 bg-emerald-400/10 px-1.5 font-mono text-[10px] text-emerald-300">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-semibold text-zinc-100">{titles.get(step.slug) ?? step.slug}</span>
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-zinc-400">
                    <SqlProse text={step.why} />
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      )}
    </div>
  );
}
