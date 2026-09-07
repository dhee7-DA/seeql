"use client";

// Renders the LOGICAL EXECUTION ORDER of a SELECT query as a vertical
// timeline: WITH → FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT →
// DISTINCT → ORDER BY → LIMIT. Steps the query doesn't use are dimmed.

import { motion } from "framer-motion";
import type { PipelineStep, QueryPlan } from "@/lib/sql-types";
import type { ClauseKind } from "@/lib/sql-clauses";
import { cn } from "@/lib/utils";

interface Accent {
  dot: string;
  ring: string;
  chip: string;
  text: string;
}

// All class strings are literal so Tailwind can see them.
const ACCENTS: Record<string, Accent> = {
  violet: {
    dot: "bg-violet-400",
    ring: "ring-violet-400/30 shadow-violet-500/10",
    chip: "border-violet-400/25 bg-violet-400/10 text-violet-200",
    text: "text-violet-300",
  },
  emerald: {
    dot: "bg-emerald-400",
    ring: "ring-emerald-400/30 shadow-emerald-500/10",
    chip: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    text: "text-emerald-300",
  },
  amber: {
    dot: "bg-amber-400",
    ring: "ring-amber-400/30 shadow-amber-500/10",
    chip: "border-amber-400/25 bg-amber-400/10 text-amber-200",
    text: "text-amber-300",
  },
  rose: {
    dot: "bg-rose-400",
    ring: "ring-rose-400/30 shadow-rose-500/10",
    chip: "border-rose-400/25 bg-rose-400/10 text-rose-200",
    text: "text-rose-300",
  },
  teal: {
    dot: "bg-teal-400",
    ring: "ring-teal-400/30 shadow-teal-500/10",
    chip: "border-teal-400/25 bg-teal-400/10 text-teal-200",
    text: "text-teal-300",
  },
  orange: {
    dot: "bg-orange-400",
    ring: "ring-orange-400/30 shadow-orange-500/10",
    chip: "border-orange-400/25 bg-orange-400/10 text-orange-200",
    text: "text-orange-300",
  },
  lime: {
    dot: "bg-lime-400",
    ring: "ring-lime-400/30 shadow-lime-500/10",
    chip: "border-lime-400/25 bg-lime-400/10 text-lime-200",
    text: "text-lime-300",
  },
};

export function buildPipelineSteps(plan: QueryPlan): PipelineStep[] {
  const main = plan.tables[0];
  const steps: PipelineStep[] = [
    {
      key: "with",
      title: "WITH",
      keyword: "Common table expressions",
      description:
        "Named sub-results are computed first and stay available to the main query like a temp view.",
      accent: "violet",
      present: plan.ctes.length > 0,
      chips: plan.ctes.map((c) => `${c.name} — ${c.summary}`),
      count: plan.ctes.length,
    },
    {
      key: "from",
      title: "FROM",
      keyword: "Source rows",
      description:
        "The database starts here: it loads the base table and produces the initial row set.",
      accent: "emerald",
      present: !!main,
      chips: main ? [`${main.name}${main.alias ? ` AS ${main.alias}` : ""}`] : [],
      count: main ? 1 : 0,
    },
    {
      key: "join",
      title: "JOIN",
      keyword: "Combine tables",
      description:
        "Rows from other tables are matched and attached using the ON conditions, in the order written.",
      accent: "amber",
      present: plan.joins.length > 0,
      chips: plan.joins.map(
        (j) => `${j.type} ${plan.tables.find((t) => t.id === j.right)?.name ?? j.right} ON ${j.on}`,
      ),
      count: plan.joins.length,
    },
    {
      key: "where",
      title: "WHERE",
      keyword: "Row filter",
      description:
        "Rows that don't satisfy every condition are discarded before any grouping happens.",
      accent: "rose",
      present: plan.where.length > 0,
      chips: plan.where,
      count: plan.where.length,
    },
    {
      key: "group",
      title: "GROUP BY",
      keyword: "Collapse groups",
      description:
        "Rows sharing the same key values are collapsed into one group per combination.",
      accent: "teal",
      present: plan.groupBy.length > 0,
      chips: plan.groupBy,
      count: plan.groupBy.length,
    },
    {
      key: "having",
      title: "HAVING",
      keyword: "Group filter",
      description:
        "Groups are filtered — this is the place where aggregate results (COUNT, SUM…) can be compared.",
      accent: "orange",
      present: plan.having.length > 0,
      chips: plan.having,
      count: plan.having.length,
    },
    {
      key: "select",
      title: "SELECT",
      keyword: "Project columns",
      description:
        "The output list is evaluated: expressions, aggregates and window functions produce the final columns.",
      accent: "lime",
      present: plan.columns.length > 0,
      chips: plan.columns.map((c) => c.text),
      count: plan.columns.length,
    },
    {
      key: "distinct",
      title: "DISTINCT",
      keyword: "Deduplicate",
      description: "Duplicate output rows are removed, keeping one row per unique combination.",
      accent: "violet",
      present: plan.distinct,
      chips: plan.distinct ? ["all selected columns"] : [],
      count: plan.distinct ? 1 : 0,
    },
    {
      key: "order",
      title: "ORDER BY",
      keyword: "Sort result",
      description:
        "The finished row set is sorted. This runs after SELECT, which is why column aliases are usable here.",
      accent: "amber",
      present: plan.orderBy.length > 0,
      chips: plan.orderBy.map((o) => `${o.text}${o.direction ? ` ${o.direction}` : ""}`),
      count: plan.orderBy.length,
    },
    {
      key: "limit",
      title: "LIMIT / OFFSET",
      keyword: "Trim rows",
      description:
        "Finally the row count is trimmed — the last step before the result leaves the database.",
      accent: "rose",
      present: plan.limit !== null || plan.offset !== null,
      chips: [
        plan.limit !== null ? `LIMIT ${plan.limit}` : "",
        plan.offset !== null ? `OFFSET ${plan.offset}` : "",
      ].filter(Boolean),
      count: (plan.limit !== null ? 1 : 0) + (plan.offset !== null ? 1 : 0),
    },
  ];
  return steps;
}

/** pipeline step → clause in the raw SQL text (for editor focusing) */
const STEP_CLAUSE: Record<string, ClauseKind> = {
  with: "with",
  from: "from",
  join: "from",
  where: "where",
  group: "group",
  having: "having",
  select: "select",
  distinct: "select",
  order: "order",
  limit: "limit",
};

export function PipelineView({
  plan,
  onFocusClause,
}: {
  plan: QueryPlan;
  /** click a step title → highlight that clause in the editor */
  onFocusClause?: (kind: ClauseKind) => void;
}) {
  const steps = buildPipelineSteps(plan);
  const used = steps.filter((s) => s.present).length;

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-400">
        SQL is not executed in the order it is written. This is the logical order the
        database follows — <span className="text-zinc-200">{used} of {steps.length}</span> steps apply to this query.
      </p>
      <ol className="relative space-y-2.5">
        <span
          aria-hidden
          className="absolute top-4 bottom-4 left-[17px] w-px bg-gradient-to-b from-violet-400/40 via-emerald-400/30 to-rose-400/40"
        />
        {steps.map((step, i) => {
          const accent = ACCENTS[step.accent];
          return (
            <motion.li
              key={step.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.045, duration: 0.25, ease: "easeOut" }}
              className={cn(
                "relative flex gap-3 rounded-xl border p-3.5",
                step.present
                  ? "border-zinc-800 bg-zinc-900/70"
                  : "border-zinc-800/50 bg-zinc-900/30",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-zinc-950 ring-4",
                  step.present ? accent.dot : "bg-zinc-700 text-zinc-400 ring-zinc-900",
                  step.present && accent.ring,
                )}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  {onFocusClause && step.present && STEP_CLAUSE[step.key] ? (
                    <button
                      type="button"
                      onClick={() => onFocusClause(STEP_CLAUSE[step.key])}
                      title="Show this clause in the editor"
                      className={cn(
                        "cursor-pointer rounded font-mono text-sm font-bold tracking-wide text-zinc-100 underline-offset-4 transition-colors hover:text-emerald-300 hover:underline",
                      )}
                    >
                      {step.title}
                    </button>
                  ) : (
                    <h3
                      className={cn(
                        "font-mono text-sm font-bold tracking-wide",
                        step.present ? "text-zinc-100" : "text-zinc-500",
                      )}
                    >
                      {step.title}
                    </h3>
                  )}
                  <span
                    className={cn(
                      "text-xs font-medium",
                      step.present ? accent.text : "text-zinc-600",
                    )}
                  >
                    {step.keyword}
                  </span>
                  {!step.present && (
                    <span className="rounded-full border border-zinc-700/70 px-1.5 py-px text-[10px] tracking-wide text-zinc-500 uppercase">
                      not used
                    </span>
                  )}
                  {step.present && step.count > 0 && (
                    <span className="ml-auto rounded-full bg-zinc-800 px-2 py-px text-[10px] font-semibold text-zinc-300">
                      {step.count} {step.count === 1 ? "item" : "items"}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-1 text-xs leading-relaxed",
                    step.present ? "text-zinc-400" : "text-zinc-600",
                  )}
                >
                  {step.description}
                </p>
                {step.present && step.chips.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {step.chips.slice(0, 4).map((chip, ci) => (
                      <code
                        key={ci}
                        className={cn(
                          "max-w-full truncate rounded-md border px-2 py-0.5 font-mono text-[11px]",
                          accent.chip,
                        )}
                        title={chip}
                      >
                        {chip}
                      </code>
                    ))}
                    {step.chips.length > 4 && (
                      <span className="rounded-md border border-zinc-700 bg-zinc-800/60 px-2 py-0.5 text-[11px] text-zinc-400">
                        +{step.chips.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
