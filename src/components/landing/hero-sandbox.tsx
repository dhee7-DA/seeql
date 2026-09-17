"use client";

// Hero sandbox — the real thing, not a canned loop. An editable query that
// actually executes on the live SQLite storefront via /api/query (sandbox
// mode: every run is rolled back, so the demo data can never be touched).
// After each run the query is parsed (/api/parse) into its logical flow —
// FROM -> JOIN -> WHERE -> ... -> OUT — drawn as an animated arrow diagram,
// with the real output row count at the end. Two-column numeric results get
// inline data bars. Pick a sample or write your own.

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  CircleAlert,
  Loader2,
  Play,
  Rows3,
  Timer,
} from "lucide-react";
import { SqlEditor } from "@/components/sql-editor";
import type { ExecResponse, ExecResult, ParseResult } from "@/lib/sql-types";
import { cn } from "@/lib/utils";
import { QueryFlowSvg, flowCaption, flowFromPlan, fallbackFlow, type FlowNode } from "./query-flow-svg";

const SAMPLES = [
  {
    label: "Orders by status",
    sql: `SELECT status, COUNT(*) AS orders
FROM orders
GROUP BY status
ORDER BY orders DESC;`,
  },
  {
    label: "Top spenders",
    sql: `SELECT c.name, ROUND(SUM(o.total), 2) AS spent
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.name
ORDER BY spent DESC
LIMIT 5;`,
  },
  {
    label: "Revenue by month",
    sql: `SELECT strftime('%Y-%m', created_at) AS month,
       ROUND(SUM(total), 2) AS revenue
FROM orders
GROUP BY month
ORDER BY month;`,
  },
] as const;

/** Render cap inside the hero — the Playground holds the full grid. */
const SHOW_CAP = 8;

/** Flow → figure: flowFromPlan / fallbackFlow live in query-flow-svg.tsx. */
interface RunOk {
  ok: true;
  exec: ExecResult;
  tick: number;
  flow: FlowNode[];
}

export function HeroSandbox({ onPlayground }: { onPlayground: () => void }) {
  const [sql, setSql] = useState<string>(SAMPLES[0].sql);
  const [active, setActive] = useState<number>(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<RunOk | null>(null);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);
  const runIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (text: string) => {
    const id = ++runIdRef.current;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setRunning(true);
    setError(null);
    const execReq = fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql: text, sandbox: true }),
      signal: ac.signal,
    }).then((r) => r.json() as Promise<ExecResponse>);
    // parse runs in parallel — its flow diagram is a nice-to-have, never fatal
    const parseReq = fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql: text, dialect: "sqlite" }),
      signal: ac.signal,
    })
      .then((r) => r.json() as Promise<ParseResult>)
      .catch(() => null);
    try {
      const [data, plan] = await Promise.all([execReq, parseReq]);
      if (runIdRef.current !== id) return;
      if (data.ok) {
        setDone({
          ok: true,
          exec: data,
          tick: id,
          flow: plan && plan.ok ? flowFromPlan(plan, text, data.rowCount) : fallbackFlow(text, data.rowCount),
        });
      } else {
        setDone(null);
        setError({ message: data.error, hint: data.hint });
      }
    } catch {
      if (ac.signal.aborted || runIdRef.current !== id) return;
      setDone(null);
      setError({ message: "Could not reach the query engine. Please try again." });
    } finally {
      if (runIdRef.current === id) setRunning(false);
    }
  }, []);

  // boot with the default sample so the hero shows real data with no interaction
  useEffect(() => {
    void run(SAMPLES[0].sql);
  }, [run]);

  // abort an in-flight run when the hero unmounts
  useEffect(() => () => abortRef.current?.abort(), []);

  const pickSample = (i: number) => {
    setSql(SAMPLES[i].sql);
    setActive(i);
    void run(SAMPLES[i].sql);
  };

  const exec = done?.exec ?? null;
  const shown = exec ? exec.rows.slice(0, SHOW_CAP) : [];
  const writeMode = exec !== null && exec.changes !== null;
  const flow = done?.flow ?? [];

  // inline data bars: exactly two columns, second column non-negative numbers
  let barMax: number | null = null;
  if (exec && exec.columns.length === 2 && exec.rows.length >= 2) {
    const vals = exec.rows.map((r) => r[1]);
    if (
      vals.every((v) => v === null || (typeof v === "number" && v >= 0)) &&
      vals.some((v) => typeof v === "number" && v > 0)
    ) {
      barMax = Math.max(...vals.map((v) => (typeof v === "number" ? v : 0)));
    }
  }

  return (
    <div className="sheen w-full max-w-[540px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full border border-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full border border-zinc-700" />
        </div>
        <span className="font-mono text-[11px] text-zinc-500">seeql — sandbox</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
          <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-emerald-400" /> live
          <button
            onClick={onPlayground}
            className="ml-1.5 inline-flex items-center gap-0.5 rounded border border-zinc-800 px-1.5 py-0.5 text-[10px] normal-case tracking-normal text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
          >
            open playground
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </span>
      </div>

      <div className="p-4">
        {/* editor — real input, syntax highlighting and ⌘/Ctrl+Enter come from SqlEditor */}
        <SqlEditor
          value={sql}
          onChange={(v) => {
            setSql(v);
            setActive(-1);
          }}
          onVisualize={() => void run(sql)}
          className="h-[124px]"
        />

        {/* samples + run */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {SAMPLES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => pickSample(i)}
              aria-pressed={active === i}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                active === i
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                  : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
              )}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={() => void run(sql)}
            disabled={running}
            className="btn-glow ml-auto inline-flex min-h-[32px] items-center gap-1.5 rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-medium text-[#052e1c] transition-all hover:bg-emerald-300 disabled:opacity-60"
          >
            {running ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            Run
            <span className="hidden font-mono text-[10px] opacity-70 sm:inline">⌘↵</span>
          </button>
        </div>

        {/* flow figure — the lesson-diagram aesthetic, live: real arrows, dot rows,
            gate panels, emerald OUT — drawn from the query that actually ran */}
        {done && flow.length > 0 && (
          <div aria-label="Logical execution flow" className="mt-3 min-h-[52px]">
            <QueryFlowSvg flow={flow} tick={done.tick} />
            <p className="mt-1 font-mono text-[10px] leading-relaxed text-zinc-500">{flowCaption(flow)}</p>
          </div>
        )}

        {/* status line */}
        <div aria-live="polite" className="mt-3 min-h-[20px]">
          {running && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
              <Loader2 className="h-3 w-3 animate-spin" /> running on the storefront…
            </span>
          )}
          {!running && exec && (
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-zinc-500">
              <span className="inline-flex items-center gap-1.5 text-emerald-300">
                {writeMode ? <Check className="h-3.5 w-3.5" /> : <Rows3 className="h-3.5 w-3.5" />}
                {writeMode
                  ? `${exec.changes} row${exec.changes === 1 ? "" : "s"} affected`
                  : `${exec.rowCount.toLocaleString()} row${exec.rowCount === 1 ? "" : "s"}`}
              </span>
              <span className="inline-flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" />
                {exec.durationMs} ms
              </span>
              <span>live sqlite · rolled back</span>
              {!writeMode && exec.rows.length > SHOW_CAP && (
                <span className="text-zinc-600">
                  showing first {SHOW_CAP} of {exec.rowCount.toLocaleString()}
                </span>
              )}
            </span>
          )}
        </div>

        {/* error — the real SQLite error, honestly shown */}
        {error && !running && (
          <div
            role="alert"
            className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300"
          >
            <p className="flex items-start gap-1.5 font-mono">
              <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error.message}
            </p>
            {error.hint && <p className="mt-1 pl-5 leading-5 text-zinc-400">{error.hint}</p>}
          </div>
        )}

        {/* result grid — the real rows */}
        {exec && !writeMode && (
          <motion.div
            key={done?.tick}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="thin-scrollbar mt-2 max-h-[176px] overflow-auto rounded-lg border border-zinc-800"
          >
            <table aria-label="Query result" className="w-full border-collapse text-left font-mono text-[11.5px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-zinc-900/95 backdrop-blur">
                  {exec.columns.map((c, ci) => (
                    <th
                      key={`${ci}-${c}`}
                      scope="col"
                      className="border-b border-zinc-800 px-2.5 py-1.5 font-semibold whitespace-nowrap text-zinc-300"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((row, ri) => (
                  <tr key={ri} className="hover:bg-zinc-800/40">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        title={cell === null ? "NULL" : String(cell)}
                        className={cn(
                          "relative max-w-[200px] truncate border-b border-zinc-900 px-2.5 py-1",
                          cell === null && "italic text-zinc-600",
                          cell !== null && (typeof cell === "number" ? "text-right text-teal-300" : "text-zinc-300"),
                          typeof cell === "boolean" && "text-violet-300",
                        )}
                      >
                        {ci === 1 && barMax !== null && typeof cell === "number" && (
                          <span
                            aria-hidden
                            className="absolute inset-y-[3px] right-0 rounded-[3px] bg-emerald-400/15"
                            style={{ width: `${Math.max((cell / barMax) * 100, 4)}%` }}
                          />
                        )}
                        <span className="relative">{cell === null ? "NULL" : String(cell)}</span>
                      </td>
                    ))}
                  </tr>
                ))}
                {exec.rows.length === 0 && (
                  <tr>
                    <td colSpan={Math.max(exec.columns.length, 1)} className="px-3 py-6 text-center text-zinc-500">
                      Ran fine — zero rows back.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
}
