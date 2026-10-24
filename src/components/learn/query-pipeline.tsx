"use client";

// Query pipeline — the SELECT execution order, stepped through on a fixed
// mini-dataset. SQL's logical execution order (FROM → JOIN → WHERE →
// GROUP BY → SELECT → HAVING → ORDER BY) is the single most profitable
// mental model in the language, and the syntax order the eye reads is its
// deliberate opposite. Each phase here is hand-computed against the same
// seven-order / three-customer dataset: rows the phase DROPS stay visible
// one more step (dimmed, with the reason) so the pipeline reads as a
// funnel, not a teleport. Pure data + a stepper — no engine, no state.

import { useState } from "react";
import { ChevronLeft, ChevronRight, Database } from "lucide-react";
import { Panel, Btn } from "./ui/kit";
import { cn } from "@/lib/utils";

type RowState = "kept" | "dropped" | "computed";

interface PhaseRow {
  cells: string[];
  state: RowState;
  /** why this row appears / disappears at this phase */
  note?: string;
}

interface Phase {
  id: string;
  title: string;
  clause: string;
  explain: string;
  columns: string[];
  rows: PhaseRow[];
}

const PHASES: Phase[] = [
  {
    id: "from",
    title: "1 · FROM — the working table",
    clause: "FROM orders o",
    explain:
      "Execution starts at FROM, not SELECT. The working table is orders — six rows, whatever the query's later phases do, they do to THESE rows. Everything else in the statement is a transformation queued against this starting set.",
    columns: ["o.id", "o.customer_id", "o.total", "o.status"],
    rows: [
      { cells: ["101", "1", "120", "paid"], state: "kept" },
      { cells: ["102", "1", "80", "paid"], state: "kept" },
      { cells: ["103", "2", "200", "refunded"], state: "kept" },
      { cells: ["104", "3", "60", "paid"], state: "kept" },
      { cells: ["105", "3", "150", "paid"], state: "kept" },
      { cells: ["107", "2", "130", "paid"], state: "kept" },
      { cells: ["106", "4", "90", "paid"], state: "kept", note: "customer 4 has no Customers row — remember this one" },
    ],
  },
  {
    id: "join",
    title: "2 · LEFT JOIN — attach customers",
    clause: "LEFT JOIN customers c ON c.id = o.customer_id",
    explain:
      "The join appends columns from Customers onto every order whose customer_id matches. LEFT keeps every order even when the match fails: order 106 gains NULL name and city instead of disappearing. An INNER JOIN would silently delete that row — the single most common silent data loss in analytics.",
    columns: ["o.id", "o.customer_id", "o.total", "o.status", "c.name", "c.city"],
    rows: [
      { cells: ["101", "1", "120", "paid", "Ana", "Lisbon"], state: "kept" },
      { cells: ["102", "1", "80", "paid", "Ana", "Lisbon"], state: "kept" },
      { cells: ["103", "2", "200", "refunded", "Ben", "Porto"], state: "kept" },
      { cells: ["104", "3", "60", "paid", "Cy", "Lisbon"], state: "kept" },
      { cells: ["105", "3", "150", "paid", "Cy", "Lisbon"], state: "kept" },
      { cells: ["107", "2", "130", "paid", "Ben", "Porto"], state: "kept" },
      { cells: ["106", "4", "90", "paid", "NULL", "NULL"], state: "kept", note: "NULL-filled: LEFT keeps the row, INNER would drop it" },
    ],
  },
  {
    id: "where",
    title: "3 · WHERE — row filter",
    clause: "WHERE o.status = 'paid'",
    explain:
      "WHERE sees the joined rows one by one and keeps the survivors. It runs BEFORE grouping — which is exactly why aggregates can't appear here: there are no groups yet, only rows. Order 103 is the refund, and it leaves the pipeline now, permanently.",
    columns: ["o.id", "o.customer_id", "o.total", "o.status", "c.name", "c.city"],
    rows: [
      { cells: ["103", "2", "200", "refunded", "Ben", "Porto"], state: "dropped", note: "status ≠ 'paid' — gone for good" },
      { cells: ["101", "1", "120", "paid", "Ana", "Lisbon"], state: "kept" },
      { cells: ["102", "1", "80", "paid", "Ana", "Lisbon"], state: "kept" },
      { cells: ["104", "3", "60", "paid", "Cy", "Lisbon"], state: "kept" },
      { cells: ["105", "3", "150", "paid", "Cy", "Lisbon"], state: "kept" },
      { cells: ["107", "2", "130", "paid", "Ben", "Porto"], state: "kept" },
      { cells: ["106", "4", "90", "paid", "NULL", "NULL"], state: "kept" },
    ],
  },
  {
    id: "group",
    title: "4 · GROUP BY — build the buckets",
    clause: "GROUP BY c.city",
    explain:
      "The surviving rows fold into buckets keyed by city. Lisbon collects four orders, Porto two, and the NULL city becomes its own bucket — NULLs GROUP together in SQL, a fact that surprises people every week. From here on the row unit is the GROUP, not the order.",
    columns: ["bucket c.city", "member o.ids", "rows"],
    rows: [
      { cells: ["Lisbon", "101, 102, 104, 105", "4"], state: "kept" },
      { cells: ["Porto", "107, …", "1"], state: "kept", note: "103 was filtered at WHERE — Porto's refund never joins the bucket" },
      { cells: ["NULL", "106", "1"], state: "kept", note: "the unmatched order 106 — NULL is its own bucket" },
    ],
  },
  {
    id: "select",
    title: "5 · SELECT — compute the output columns",
    clause: "SELECT c.city, SUM(o.total) AS revenue, COUNT(*) AS orders",
    explain:
      "Only NOW does SELECT run — the aggregates collapse each bucket to one row. SUM over Lisbon's bucket reads 120+80+60+150 = 410; COUNT(*) counts bucket members. Aliases born here (revenue, orders) are the first names the later phases can use.",
    columns: ["c.city", "revenue", "orders"],
    rows: [
      { cells: ["Lisbon", "410", "4"], state: "computed", note: "120 + 80 + 60 + 150" },
      { cells: ["Porto", "130", "1"], state: "computed" },
      { cells: ["NULL", "90", "1"], state: "computed", note: "the unmatched order's total, parked in the NULL bucket" },
    ],
  },
  {
    id: "having",
    title: "6 · HAVING — the group filter",
    clause: "HAVING SUM(o.total) >= 100",
    explain:
      "HAVING is WHERE for groups — it can see aggregates because groups exist. The NULL bucket's 90 misses the 100 cutoff and drops. This WHERE/HAVING split is the phase model's whole point: filter rows early, filter groups late.",
    columns: ["c.city", "revenue", "orders"],
    rows: [
      { cells: ["NULL", "90", "1"], state: "dropped", note: "SUM = 90 < 100 — the group filter cuts it" },
      { cells: ["Lisbon", "410", "4"], state: "kept" },
      { cells: ["Porto", "130", "1"], state: "kept" },
    ],
  },
  {
    id: "order",
    title: "7 · ORDER BY — present the result",
    clause: "ORDER BY revenue DESC",
    explain:
      "The last phase sorts the surviving rows for presentation — and it CAN use the SELECT alias (revenue), because aliases are born at SELECT, one phase earlier. Result: Lisbon leads with 410, Porto follows with 130. The refund never counted; the unmatched order filtered at HAVING.",
    columns: ["c.city", "revenue", "orders"],
    rows: [
      { cells: ["Lisbon", "410", "4"], state: "kept" },
      { cells: ["Porto", "130", "1"], state: "kept" },
    ],
  },
];

export function QueryPipeline() {
  const [step, setStep] = useState(0);
  const phase = PHASES[step];
  const prev = PHASES[step - 1];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-4 pb-24 md:p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tight">Query pipeline</h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          The SELECT execution order, stepped through on a fixed seven-order / three-customer dataset.
          SQL runs FROM → JOIN → WHERE → GROUP BY → SELECT → HAVING → ORDER BY — the reverse of how it reads.
          Every phase below is the hand-computed truth for the demo query.
        </p>
      </header>

      <Panel pad={4}>
        <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-zinc-300">
{`SELECT c.city, SUM(o.total) AS revenue, COUNT(*) AS orders
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'paid'
GROUP BY c.city
HAVING SUM(o.total) >= 100
ORDER BY revenue DESC;`}
        </pre>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PHASES.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
                i === step
                  ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                  : i < step
                    ? "border-zinc-700 text-zinc-400"
                    : "border-zinc-800 text-zinc-600 hover:text-zinc-400",
              )}
            >
              {p.id}
            </button>
          ))}
        </div>
      </Panel>

      <Panel pad={4}>
        <h2 className="text-base font-semibold text-zinc-100">{phase.title}</h2>
        <pre className="mt-1.5 overflow-x-auto rounded-md border border-emerald-400/20 bg-emerald-400/[0.04] px-2.5 py-1.5 font-mono text-[11px] text-emerald-200">
          {phase.clause}
        </pre>
        <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{phase.explain}</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse font-mono text-[11px]">
            <thead>
              <tr>
                {phase.columns.map((c) => (
                  <th key={c} className="border-b border-zinc-700/60 px-2 py-1.5 text-left font-medium text-zinc-400">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {phase.rows.map((r, i) => (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-zinc-800/50",
                    r.state === "dropped" && "opacity-45 line-through decoration-rose-400/60",
                    r.state === "computed" && "bg-sky-400/[0.04]",
                  )}
                >
                  {phase.columns.map((c, j) => (
                    <td key={c} className={cn("px-2 py-1.5", r.state === "dropped" ? "text-rose-300/80" : "text-zinc-300")}>
                      {r.cells[j]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {phase.rows.some((r) => r.note) && (
          <ul className="mt-2 space-y-1">
            {phase.rows
              .filter((r) => r.note)
              .map((r, i) => (
                <li key={i} className="text-[11px] leading-relaxed text-zinc-500">
                  <span className={cn("font-mono", r.state === "dropped" ? "text-rose-300/70" : "text-emerald-300/80")}>
                    {r.state === "dropped" ? "dropped" : r.state === "computed" ? "computed" : "kept"}
                  </span>{" "}
                  · {r.note}
                </li>
              ))}
          </ul>
        )}

        {prev && (
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
            Carried in from <span className="font-mono text-zinc-500">{prev.id}</span>:{" "}
            {prev.rows.filter((r) => r.state !== "dropped").length} rows.
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <Btn variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </Btn>
          <span className="tnum font-mono text-[11px] text-zinc-600">
            phase {step + 1} / {PHASES.length}
          </span>
          <Btn variant="primary" onClick={() => setStep((s) => Math.min(PHASES.length - 1, s + 1))} disabled={step === PHASES.length - 1}>
            Next phase <ChevronRight className="h-3.5 w-3.5" />
          </Btn>
        </div>
      </Panel>
    </div>
  );
}
