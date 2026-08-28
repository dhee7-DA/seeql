"use client";

// Clause-by-clause breakdown: one card per SQL clause with its parsed content.

import { ArrowDown, ArrowUp, Table2 } from "lucide-react";
import type { QueryPlan } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

function Card({
  title,
  badge,
  children,
  className,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 transition-colors hover:border-zinc-700",
        className,
      )}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="font-mono text-xs font-bold tracking-widest text-zinc-300 uppercase">
          {title}
        </h3>
        {badge && (
          <span className="rounded-full bg-zinc-800 px-2 py-px text-[10px] font-semibold text-zinc-400">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Mono({ text, className }: { text: string; className?: string }) {
  return (
    <code className={cn("block font-mono text-xs break-words text-zinc-200", className)}>
      {text}
    </code>
  );
}

export function BreakdownView({ plan }: { plan: QueryPlan }) {
  const hasAny =
    plan.columns.length > 0 ||
    plan.tables.length > 0 ||
    plan.where.length > 0 ||
    plan.groupBy.length > 0 ||
    plan.orderBy.length > 0;

  if (!hasAny) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
        Nothing to break down for this statement.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {/* SELECT list */}
      {plan.columns.length > 0 && (
        <Card title="SELECT" badge={`${plan.columns.length} columns`} className="md:col-span-2">
          <ul className="space-y-1.5">
            {plan.columns.map((c, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center gap-2 rounded-lg bg-zinc-950/50 px-3 py-1.5"
              >
                <span className="font-mono text-[11px] text-zinc-600">{i + 1}</span>
                <Mono text={c.text} className="flex-1" />
                {c.aggregation && (
                  <span className="rounded border border-lime-400/30 bg-lime-400/10 px-1.5 py-px font-mono text-[10px] font-semibold text-lime-300">
                    AGG · {c.aggregation}
                  </span>
                )}
                {c.table && (
                  <span className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800/60 px-1.5 py-px font-mono text-[10px] text-zinc-400">
                    <Table2 className="h-3 w-3" /> {c.table}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* FROM & JOINs */}
      {plan.tables.length > 0 && (
        <Card title="FROM & JOINS" badge={`${plan.tables.length} sources`} className="md:col-span-2">
          <ul className="space-y-1.5">
            {plan.tables.map((t) => (
              <li
                key={t.id}
                className="rounded-lg bg-zinc-950/50 px-3 py-1.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Table2 className="h-3.5 w-3.5 text-emerald-400" />
                  <Mono text={t.name} />
                  {t.alias && (
                    <span className="rounded border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-px font-mono text-[10px] text-emerald-300">
                      AS {t.alias}
                    </span>
                  )}
                  {t.kind !== "table" && (
                    <span
                      className={cn(
                        "rounded px-1.5 py-px font-mono text-[10px] font-semibold uppercase",
                        t.kind === "cte"
                          ? "border border-violet-400/30 bg-violet-400/10 text-violet-300"
                          : "border border-amber-400/30 bg-amber-400/10 text-amber-300",
                      )}
                    >
                      {t.kind === "cte" ? "CTE" : "derived"}
                    </span>
                  )}
                  {t.joinType && (
                    <span
                      className={cn(
                        "rounded px-1.5 py-px font-mono text-[10px] font-semibold",
                        t.joinType.includes("LEFT")
                          ? "border border-amber-400/30 bg-amber-400/10 text-amber-300"
                          : t.joinType.includes("RIGHT")
                            ? "border border-rose-400/30 bg-rose-400/10 text-rose-300"
                            : "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
                      )}
                    >
                      {t.joinType}
                    </span>
                  )}
                </div>
                {t.onText && <Mono text={`ON ${t.onText}`} className="mt-1 pl-6 text-zinc-400" />}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* WHERE */}
      {plan.where.length > 0 && (
        <Card title="WHERE" badge={`${plan.where.length} conditions`}>
          <ul className="space-y-1.5">
            {plan.where.map((w, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg bg-zinc-950/50 px-3 py-1.5">
                <span className="font-mono text-[11px] text-rose-400/80">{i + 1}</span>
                <Mono text={w} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* GROUP BY */}
      {plan.groupBy.length > 0 && (
        <Card title="GROUP BY" badge={`${plan.groupBy.length} keys`}>
          <div className="flex flex-wrap gap-1.5">
            {plan.groupBy.map((g, i) => (
              <code
                key={i}
                className="rounded-md border border-teal-400/25 bg-teal-400/10 px-2 py-1 font-mono text-xs text-teal-200"
              >
                {g}
              </code>
            ))}
          </div>
        </Card>
      )}

      {/* HAVING */}
      {plan.having.length > 0 && (
        <Card title="HAVING" badge={`${plan.having.length} conditions`}>
          <ul className="space-y-1.5">
            {plan.having.map((h, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg bg-zinc-950/50 px-3 py-1.5">
                <span className="font-mono text-[11px] text-orange-400/80">{i + 1}</span>
                <Mono text={h} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ORDER BY */}
      {plan.orderBy.length > 0 && (
        <Card title="ORDER BY" badge={`${plan.orderBy.length} keys`}>
          <ul className="space-y-1.5">
            {plan.orderBy.map((o, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-lg bg-zinc-950/50 px-3 py-1.5"
              >
                <Mono text={o.text} className="flex-1" />
                {o.direction && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded border px-1.5 py-px font-mono text-[10px] font-semibold",
                      o.direction === "DESC"
                        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                        : "border-teal-400/30 bg-teal-400/10 text-teal-300",
                    )}
                  >
                    {o.direction === "DESC" ? (
                      <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ArrowUp className="h-3 w-3" />
                    )}
                    {o.direction}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* LIMIT / OFFSET */}
      {(plan.limit !== null || plan.offset !== null) && (
        <Card title="LIMIT / OFFSET">
          <div className="flex gap-3">
            {plan.limit !== null && (
              <div className="flex-1 rounded-lg bg-zinc-950/50 px-3 py-2">
                <div className="text-[10px] tracking-widest text-zinc-500 uppercase">LIMIT</div>
                <div className="font-mono text-xl font-bold text-rose-300">{plan.limit}</div>
              </div>
            )}
            {plan.offset !== null && (
              <div className="flex-1 rounded-lg bg-zinc-950/50 px-3 py-2">
                <div className="text-[10px] tracking-widest text-zinc-500 uppercase">OFFSET</div>
                <div className="font-mono text-xl font-bold text-amber-300">{plan.offset}</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* CTEs */}
      {plan.ctes.length > 0 && (
        <Card title="WITH (CTEs)" badge={`${plan.ctes.length}`} className="md:col-span-2">
          <ul className="space-y-2">
            {plan.ctes.map((c) => (
              <li key={c.name} className="rounded-lg bg-zinc-950/50 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="font-mono text-sm font-bold text-violet-300">{c.name}</code>
                  {c.declaredColumns && (
                    <span className="font-mono text-[11px] text-zinc-500">
                      ({c.declaredColumns.join(", ")})
                    </span>
                  )}
                  <span className="text-xs text-zinc-400">{c.summary}</span>
                </div>
                {c.tablesUsed.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {c.tablesUsed.map((t) => (
                      <span
                        key={t}
                        className="rounded border border-violet-400/20 bg-violet-400/5 px-1.5 py-px font-mono text-[10px] text-violet-200/80"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Set operations */}
      {plan.setOps.length > 0 && (
        <Card title="SET OPERATIONS">
          <div className="flex flex-wrap gap-1.5">
            {plan.setOps.map((op, i) => (
              <code
                key={i}
                className="rounded-md border border-rose-400/25 bg-rose-400/10 px-2 py-1 font-mono text-xs text-rose-200"
              >
                {op}
              </code>
            ))}
          </div>
        </Card>
      )}

      {/* Flags */}
      {(plan.distinct || plan.hasSubquery) && (
        <Card title="Flags">
          <div className="flex flex-wrap gap-1.5">
            {plan.distinct && (
              <span className="rounded-md border border-violet-400/25 bg-violet-400/10 px-2 py-1 font-mono text-xs text-violet-200">
                DISTINCT
              </span>
            )}
            {plan.hasSubquery && (
              <span className="rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-1 font-mono text-xs text-amber-200">
                contains subquery
              </span>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
