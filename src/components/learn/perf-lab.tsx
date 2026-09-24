"use client";

// Performance lab — three surfaces on one engine truth:
//   Pipeline        paste a query, watch SQLite's own plan as a live pipeline
//   Index workbench add CREATE INDEX statements, compare before/after plans
//   Detective cases graded stings: find the culprit, fix the plan, take the XP
//
// All planning runs through /api/perf: real EXPLAIN QUERY PLAN on the real
// storefront, learner indexes created inside a transaction that always rolls
// back — fully real, zero residue.

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Gauge,
  Lightbulb,
  Plus,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";
import { Icon3D } from "./ui/icon3d";
import type { CellValue, PlanRow } from "@/lib/sql-types";
import { reportMentorFailure } from "@/lib/mentor-context";
import { useProgress } from "@/lib/curriculum/progress";
import { DETECTIVES, PERF_XP, gradeSting, type StingVerdict } from "@/lib/curriculum/perf";
import { diffPlans, parsePlan, reportPlan, type PlanReport } from "@/lib/plan-explain";
import { cn } from "@/lib/utils";
import { MiniGrid, awardPracticeXp, recordPracticeAttempt } from "./practice-kit";
import { SqlNodes } from "./sql-code";
import { DiffHeader, PlanPipeline, ReportChips } from "./plan-pipeline";

type PerfTab = "pipeline" | "workbench" | "detective";

interface PerfPayload {
  ok: true;
  before: PlanRow[];
  after: PlanRow[] | null;
  columns: string[];
  rows: CellValue[][];
  rowCount: number;
  durationMs: number;
}

interface PerfError {
  ok: false;
  error: string;
  hint?: string;
  indexSql?: string;
}

type PerfResult = PerfPayload | PerfError;

/** POST one experiment to /api/perf. Failures land on the mentor's desk. */
async function runPerf(sql: string, indexes: string[]): Promise<PerfResult> {
  try {
    const res = await fetch("/api/perf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql, indexes }),
    });
    const data = (await res.json()) as PerfResult;
    if (!data.ok) {
      reportMentorFailure({
        sql: (data.indexSql ?? sql).slice(0, 2000),
        error: data.error ?? null,
        note: null,
        source: "Performance lab",
      });
    }
    return data;
  } catch {
    return { ok: false, error: "The lab could not reach the engine. Check the connection and try again." };
  }
}

const EXAMPLES: Array<{ label: string; sql: string }> = [
  {
    label: "Customer lookup",
    sql: "SELECT id, status, total\nFROM orders\nWHERE customer_id = 7;",
  },
  {
    label: "Pending queue",
    sql: "SELECT id, created_at\nFROM orders\nWHERE status = 'pending'\nORDER BY created_at DESC;",
  },
  {
    label: "Quarter's ledger",
    sql: "SELECT entry_date, debit_cents, credit_cents\nFROM ledger_entries\nWHERE account = 'accounts_receivable'\n  AND entry_date >= '2024-04-01'\n  AND entry_date < '2024-07-01';",
  },
  {
    label: "Join + PK probes",
    sql: "SELECT p.name, s.name AS supplier\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id;",
  },
  {
    label: "Top spenders",
    sql: "SELECT customer_id, SUM(total) AS spend\nFROM orders\nGROUP BY customer_id\nORDER BY spend DESC\nLIMIT 5;",
  },
];

const WORKBENCH_PRESETS: Array<{ label: string; ddl: string }> = [
  { label: "orders · customer_id", ddl: "CREATE INDEX idx_orders_customer ON orders(customer_id);" },
  { label: "orders · status, created_at", ddl: "CREATE INDEX idx_orders_status_created ON orders(status, created_at);" },
  { label: "invoices · status, due_on", ddl: "CREATE INDEX idx_invoices_status_due ON invoices(status, due_on);" },
  { label: "products · covering (category, name)", ddl: "CREATE INDEX idx_products_category_name ON products(category, name);" },
];

function SqlBox({ value, onChange, rows = 6 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      spellCheck={false}
      aria-label="Target query"
      className="w-full resize-y rounded-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-3 font-mono text-[13px] leading-6 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-400/50 focus:outline-none"
      placeholder="SELECT …"
    />
  );
}

function ErrorChip({ error, hint }: { error: string; hint?: string }) {
  return (
    <div className="rounded-md border border-rose-400/40 bg-rose-400/10 px-3.5 py-2.5 text-xs leading-relaxed text-rose-200">
      {error}
      {hint && <span className="mt-1 block text-rose-200/70">{hint}</span>}
    </div>
  );
}

/* ---------------- pipeline tab ---------------- */

function PipelineTab({ sql, setSql }: { sql: string; setSql: (v: string) => void }) {
  const [res, setRes] = useState<PerfResult | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    if (!sql.trim() || running) return;
    setRunning(true);
    setRes(await runPerf(sql, []));
    setRunning(false);
  }

  return (
    <div className="space-y-4">
      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {EXAMPLES.map((e) => (
            <button
              key={e.label}
              onClick={() => setSql(e.sql)}
              className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-200"
            >
              {e.label}
            </button>
          ))}
        </div>
        <SqlBox value={sql} onChange={setSql} />
        <div className="mt-3 flex items-center gap-2.5">
          <button
            onClick={run}
            disabled={!sql.trim() || running}
            className={cn(
              "btn-glow rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
              (!sql.trim() || running) && "cursor-not-allowed opacity-40",
            )}
          >
            {running ? "Planning…" : "Show the plan"}
          </button>
          <span className="text-[11px] text-zinc-600">runs EXPLAIN QUERY PLAN — reads nothing, changes nothing</span>
        </div>
      </div>

      <AnimatePresence>
        {res && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {!res.ok ? (
              <ErrorChip error={res.error} hint={res.hint} />
            ) : (
              <>
                <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-semibold text-zinc-100">The engine&apos;s path</h3>
                    <ReportChips report={reportPlan(parsePlan(res.before))} />
                  </div>
                  <PlanPipeline rows={res.before} />
                  <p className="mt-3 text-[11px] text-zinc-600">
                    SQLite prints the plan top-down per branch: inputs first, combinations after. Amber SCAN on a big
                    table is the usual culprit — take the query to the <strong className="font-medium text-zinc-400">Index workbench</strong> and see the plan change.
                  </p>
                </div>
                {res.rows.length > 0 && (
                  <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
                    <h3 className="font-display mb-3 text-sm font-semibold text-zinc-100">
                      What the query returns <span className="font-normal text-zinc-500">· {res.rowCount} rows</span>
                    </h3>
                    <MiniGrid columns={res.columns} rows={res.rows.slice(0, 8)} />
                    {res.rowCount > 8 && (
                      <p className="mt-1.5 text-[11px] text-zinc-600">first 8 of {res.rowCount} — run it in the playground for the full set</p>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- workbench tab ---------------- */

function WorkbenchTab({ sql, setSql }: { sql: string; setSql: (v: string) => void }) {
  const [idx, setIdx] = useState<string[]>([""]);
  const [res, setRes] = useState<PerfResult | null>(null);
  const [running, setRunning] = useState(false);

  const reports = useMemo<{ before: PlanReport | null; after: PlanReport | null }>(() => {
    if (!res?.ok) return { before: null, after: null };
    return {
      before: reportPlan(parsePlan(res.before)),
      after: res.after ? reportPlan(parsePlan(res.after)) : null,
    };
  }, [res]);

  const diff = useMemo(() => {
    if (!res?.ok || !res.after) return null;
    return diffPlans(res.before, res.after);
  }, [res]);

  function setIdxAt(i: number, v: string) {
    setIdx((rows) => rows.map((r, j) => (j === i ? v : r)));
  }
  function addRow() {
    setIdx((rows) => (rows.length < 3 ? [...rows, ""] : rows));
  }
  function fillPreset(ddl: string) {
    setIdx((rows) => {
      const i = rows.findIndex((r) => !r.trim());
      if (i === -1) return rows.length < 3 ? [...rows, ddl] : rows;
      return rows.map((r, j) => (j === i ? ddl : r));
    });
  }

  async function compare() {
    if (!sql.trim() || running) return;
    const ddls = idx.filter((r) => r.trim());
    setRunning(true);
    setRes(await runPerf(sql, ddls));
    setRunning(false);
  }

  const beforeDetails = res?.ok ? new Set(res.before.map((r) => r.detail)) : null;
  const afterDetails = res?.ok && res.after ? new Set(res.after.map((r) => r.detail)) : null;

  return (
    <div className="space-y-4">
      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <h3 className="font-display text-sm font-semibold text-zinc-100">The suspect query</h3>
        <div className="mt-2.5">
          <SqlBox value={sql} onChange={setSql} />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {EXAMPLES.slice(0, 3).map((e) => (
            <button
              key={e.label}
              onClick={() => setSql(e.sql)}
              className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-200"
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-zinc-100">Your indexes</h3>
          <div className="flex flex-wrap gap-1.5">
            {WORKBENCH_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => fillPreset(p.ddl)}
                title={p.ddl}
                className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-mono text-[10px] text-zinc-400 transition-colors hover:border-emerald-400/40 hover:text-emerald-200"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {idx.map((row, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <input
                value={row}
                onChange={(e) => setIdxAt(i, e.target.value)}
                spellCheck={false}
                aria-label={`Index ${i + 1}`}
                placeholder="CREATE INDEX idx_name ON table(column);"
                className="min-w-0 flex-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-400/50 focus:outline-none"
              />
              {idx.length > 1 && (
                <button
                  onClick={() => setIdx((rows) => rows.filter((_, j) => j !== i))}
                  className="mt-1 rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-rose-300"
                  aria-label={`Remove index ${i + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          {idx.length < 3 && (
            <button
              onClick={addRow}
              className="btn-quiet flex items-center gap-1 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
            >
              <Plus className="h-3 w-3" /> Add index
            </button>
          )}
          <button
            onClick={compare}
            disabled={!sql.trim() || running}
            className={cn(
              "btn-glow rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
              (!sql.trim() || running) && "cursor-not-allowed opacity-40",
            )}
          >
            {running ? "Comparing…" : "Apply & compare"}
          </button>
          <span className="text-[11px] text-zinc-600">indexes exist only inside the experiment — rolled back, nothing persists</span>
        </div>
      </div>

      <AnimatePresence>
        {res && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {!res.ok ? (
              <ErrorChip error={res.error} hint={res.hint} />
            ) : (
              <>
                {res.after && reports.before && reports.after && (
                  <DiffHeader before={reports.before} after={reports.after} rowCount={res.rowCount} />
                )}
                <div className={cn("grid gap-4", res.after && "lg:grid-cols-2")}>
                  <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">before · no indexes</p>
                    <PlanPipeline rows={res.before} highlight={res.after ? "collapsed" : undefined} otherDetails={afterDetails ?? undefined} />
                  </div>
                  {res.after && (
                    <div className="sheen rounded-lg border border-emerald-400/25 bg-zinc-950 p-4">
                      <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-emerald-300/80">after · with your indexes</p>
                      <PlanPipeline rows={res.after} highlight="fresh" otherDetails={beforeDetails ?? undefined} />
                    </div>
                  )}
                </div>
                {diff && diff.added.length === 0 && diff.removed.length === 0 && (
                  <div className="rounded-md border border-amber-400/30 bg-amber-400/[0.06] px-3.5 py-3 text-xs leading-relaxed text-amber-200">
                    The plan did not change — the planner looked at your index and declined. Small tables are often
                    cheaper to sweep than to search, and join order can make an index irrelevant. Read the plan, not
                    the rule: try a different column set, or a query that filters on the indexed column directly.
                  </div>
                )}
                {res.rows.length > 0 && (
                  <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
                    <h3 className="font-display mb-3 text-sm font-semibold text-zinc-100">
                      Proof the rows didn&apos;t move <span className="font-normal text-zinc-500">· {res.rowCount} rows, identical</span>
                    </h3>
                    <MiniGrid columns={res.columns} rows={res.rows.slice(0, 8)} />
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- detective tab ---------------- */

function DetectiveTab({ onOpenLesson }: { onOpenLesson?: (id: string) => void }) {
  const xpEvents = useProgress((s) => s.xpEvents);
  const [caseIdx, setCaseIdx] = useState(0);
  const c = DETECTIVES[caseIdx];
  const [idx, setIdx] = useState("");
  const [evidence, setEvidence] = useState<{ caseId: string; res: PerfResult } | null>(null);
  const [res, setRes] = useState<PerfResult | null>(null);
  const [verdict, setVerdict] = useState<StingVerdict | null>(null);
  const [running, setRunning] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const cleared = xpEvents[`perf:${c.id}`] !== undefined;

  // Auto-load the "before" evidence whenever the case changes. No sync
  // setState — the render checks the caseId tag to show the placeholder
  // until the new plan lands.
  useEffect(() => {
    let alive = true;
    const id = DETECTIVES[caseIdx].id;
    (async () => {
      const r = await runPerf(DETECTIVES[caseIdx].sql, []);
      if (alive) setEvidence({ caseId: id, res: r });
    })();
    return () => {
      alive = false;
    };
  }, [caseIdx]);

  function switchTo(i: number) {
    setCaseIdx(i);
    setIdx("");
    setRes(null);
    setVerdict(null);
    setHintsShown(0);
    setSolutionShown(false);
  }

  async function sting() {
    if (running) return;
    if (!idx.trim()) {
      setVerdict(gradeSting(c, [], []));
      setRes(null);
      return;
    }
    setRunning(true);
    const r = await runPerf(c.sql, [idx]);
    setRes(r);
    if (r.ok && r.after) {
      const v = gradeSting(c, [idx], r.after);
      setVerdict(v);
      if (v.pass) {
        recordPracticeAttempt(c.skill, `perf:${c.id}`, true);
        awardPracticeXp(`perf:${c.id}`, PERF_XP, "Caught the culprit and fixed the plan");
      } else {
        recordPracticeAttempt(c.skill, `perf:${c.id}`, false);
      }
    } else if (!r.ok) {
      setVerdict(null);
    }
    setRunning(false);
  }

  const beforeDetails = res?.ok ? new Set(res.before.map((r) => r.detail)) : null;
  const afterDetails = res?.ok && res.after ? new Set(res.after.map((r) => r.detail)) : null;
  const hasDiff = res?.ok && res.after !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => switchTo(Math.max(0, caseIdx - 1))}
          disabled={caseIdx === 0}
          className={cn(
            "flex items-center gap-1 rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-900",
            caseIdx === 0 && "cursor-not-allowed opacity-40",
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        <span className="tnum text-[11px] uppercase tracking-wider text-zinc-600">
          Case {caseIdx + 1} of {DETECTIVES.length}
          {cleared && <span className="ml-2 text-emerald-400">cleared</span>}
        </span>
        <button
          onClick={() => switchTo(Math.min(DETECTIVES.length - 1, caseIdx + 1))}
          disabled={caseIdx >= DETECTIVES.length - 1}
          className={cn(
            "flex items-center gap-1 rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-900",
            caseIdx >= DETECTIVES.length - 1 && "cursor-not-allowed opacity-40",
          )}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            {c.id.toUpperCase()}
          </span>
          <h3 className="font-display text-sm font-semibold text-zinc-100">{c.title}</h3>
          {cleared && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        </div>
        <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-400">{c.story}</p>
        <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-3 font-mono text-[13px] leading-6 text-zinc-200">
          <SqlNodes text={c.sql} />
        </div>
      </div>

      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-amber-300/80">the evidence · today&apos;s plan</p>
        {!evidence || evidence.caseId !== c.id ? (
          <p className="py-2 text-xs text-zinc-600">planning the suspect query…</p>
        ) : evidence.res.ok ? (
          <PlanPipeline rows={evidence.res.before} />
        ) : (
          <ErrorChip error={evidence.res.error} hint={evidence.res.hint} />
        )}
      </div>

      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <h3 className="font-display text-sm font-semibold text-zinc-100">Build the fix</h3>
        <p className="mt-1 text-[11px] text-zinc-500">
          One CREATE INDEX that changes the path. The sting re-plans the query with your index live — and grades the
          engine&apos;s own output, not your spelling.
        </p>
        <input
          value={idx}
          onChange={(e) => setIdx(e.target.value)}
          spellCheck={false}
          aria-label="Your CREATE INDEX statement"
          placeholder="CREATE INDEX idx_name ON table(column);"
          className="mt-3 w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-400/50 focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <button
            onClick={sting}
            disabled={running}
            className={cn(
              "btn-glow rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
              running && "cursor-not-allowed opacity-40",
            )}
          >
            {running ? "Running the sting…" : "Run the sting"}
          </button>
          {(hintsShown > 0 || (verdict && !verdict.pass)) && (
            <button
              onClick={() => {
                setIdx("");
                setRes(null);
                setVerdict(null);
              }}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
            >
              <RotateCcw className="h-3 w-3" /> Clear
            </button>
          )}
          {!cleared && (
            <span className="tnum text-[11px] text-zinc-600">{PERF_XP} XP on the sting passing</span>
          )}
        </div>

        <AnimatePresence>
          {verdict && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="mt-3.5 space-y-3"
            >
              <div
                className={cn(
                  "flex items-start gap-2 rounded-md border px-3.5 py-3 text-xs leading-relaxed",
                  verdict.pass ? "border-emerald-400/40 bg-emerald-400/10" : "border-amber-400/30 bg-amber-400/[0.06]",
                )}
              >
                {verdict.pass ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                )}
                <span>
                  {verdict.pass ? (
                    <span className="text-emerald-200">
                      Case closed — the plan changed shape. The engine now descends an index instead of sweeping the
                      table, and the rows are identical. That is the whole game.
                    </span>
                  ) : (
                    <span className="text-amber-200">Not yet — the grader read the AFTER plan and found:</span>
                  )}
                </span>
              </div>
              {!verdict.pass && (
                <div className="flex flex-wrap gap-1.5">
                  {verdict.misses.map((m) => (
                    <span key={m} className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-200">
                      {m}
                    </span>
                  ))}
                </div>
              )}
              {verdict.pass && (
                <div className="rounded-md border border-violet-400/25 bg-violet-400/[0.05] px-3.5 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-violet-300/80">the takeaway</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">{c.why}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {hasDiff && res?.ok && res.after && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">before</p>
              <PlanPipeline rows={res.before} highlight="collapsed" otherDetails={afterDetails ?? undefined} />
            </div>
            <div className={cn(verdict?.pass && "rounded-lg border border-emerald-400/25 p-2.5 -m-2.5")}>
              <p className="mb-2.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300/80">after your index</p>
              <PlanPipeline rows={res.after} highlight="fresh" otherDetails={beforeDetails ?? undefined} />
            </div>
          </div>
        )}
      </div>

      {/* tiered hints — nudge → direction → shape, never spoilers */}
      {hintsShown < 3 && (
        <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            <Lightbulb className="h-3 w-3" /> hint ladder
          </p>
          <div className="mt-2.5 space-y-2">
            {hintsShown > 0 && (
              <p className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-xs leading-relaxed text-zinc-300">
                {c.hints[hintsShown - 1]}
              </p>
            )}
            <button
              onClick={() => setHintsShown((n) => n + 1)}
              className="btn-quiet rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
            >
              {hintsShown === 0 ? "Hint 1 · a nudge" : hintsShown === 1 ? "Hint 2 · the direction" : "Hint 3 · the shape"}
            </button>
            {hintsShown === 3 && !solutionShown && (
              <button
                onClick={() => setSolutionShown(true)}
                className="ml-2 rounded-md border border-rose-400/40 px-3 py-2 text-xs text-rose-300 transition-colors hover:bg-rose-400/10"
              >
                Reveal the solution
              </button>
            )}
            {solutionShown && (
              <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">reference solution</p>
                <div className="mt-1.5 font-mono text-xs text-zinc-200">
                  <SqlNodes text={c.solution} />
                </div>
                <button
                  onClick={() => setIdx(c.solution)}
                  className="btn-quiet mt-2 rounded-md border border-zinc-700 px-3 py-1.5 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-900"
                >
                  Copy into the box — run it and watch why it works
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {onOpenLesson && (
        <button
          onClick={() => onOpenLesson("lesson-48")}
          className="btn-quiet flex w-full items-center justify-center gap-2 rounded-md border border-zinc-800 px-4 py-2.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
        >
          New to indexes? Lesson 48 — SCAN vs SEARCH, composite &amp; UNIQUE — is the theory <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* ---------------- shell ---------------- */

export function PerfLab({
  initialSql,
  initialTab,
  onOpenLesson,
}: {
  initialSql?: string;
  initialTab?: PerfTab;
  onOpenLesson?: (id: string) => void;
}) {
  const [tab, setTab] = useState<PerfTab>(initialTab ?? "pipeline");
  const [sql, setSql] = useState(initialSql ?? EXAMPLES[0].sql);

  const tabs: Array<{ id: PerfTab; label: string; hint: string }> = [
    { id: "pipeline", label: "Plan pipeline", hint: "watch the path" },
    { id: "workbench", label: "Index workbench", hint: "compare before / after" },
    { id: "detective", label: "Detective cases", hint: "graded stings" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <Gauge className="h-3.5 w-3.5" /> SCAN vs SEARCH · THE ENGINE&apos;S OWN ACCOUNT
      </p>
      <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="search" size={40} />Performance lab</h1>
      <p className="mt-3 text-[15px] leading-7 text-zinc-400">
        Every query has two costs: the rows it returns, and the path it takes to get them. EXPLAIN QUERY PLAN is the
        engine&apos;s honest account of that path. Watch it, change it with an index, and — in the detective cases —
        get graded on the engine&apos;s own output.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-2 py-2 text-center transition-colors",
              tab === t.id ? "bg-zinc-800" : "hover:bg-zinc-900",
            )}
          >
            <span className={cn("block text-xs font-medium", tab === t.id ? "text-zinc-100" : "text-zinc-400")}>{t.label}</span>
            <span className="block text-[10px] text-zinc-600">{t.hint}</span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "pipeline" && <PipelineTab sql={sql} setSql={setSql} />}
        {tab === "workbench" && <WorkbenchTab sql={sql} setSql={setSql} />}
        {tab === "detective" && <DetectiveTab onOpenLesson={onOpenLesson} />}
      </div>

      <div className="sheen mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-zinc-500">
          <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
          Everything here is real EXPLAIN QUERY PLAN against the live storefront. Your CREATE INDEX statements run
          inside a transaction that always rolls back — the engine plans with them, then forgets them. The playground&apos;s
          Reset database button does the same cleanup it always did.
        </p>
      </div>
    </div>
  );
}
