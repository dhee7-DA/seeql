"use client";

// The Query Machine — a Colorfigures figure (engine by April Zhu, MIT —
// see src/components/cf/LICENSE and core.js) embedded from the static,
// self-contained /cf/query-machine.html via iframe + postMessage.
//
// The parent feeds the machine the LIVE parsed plan:
//   cf:plan  -> clauses, tables, counts (real stage counts from /api/funnel)
//   cf:run   -> the user pressed Run in the app; the machine plays the run
// The figure answers with cf:ready / cf:done. Errors flow in as plan.error.

import { useEffect, useMemo, useRef, useState } from "react";
import type { ExecResponse, ParseResult } from "@/lib/sql-types";

interface MachinePlan {
  statementType: string;
  tables: Array<{ name: string }>;
  where: string[];
  groupBy: string[];
  having: string[];
  orderBy: Array<{ text: string; direction: string | null }>;
  limit: string | null;
  offset: string | null;
  distinct: boolean;
  setOps: string[];
  columns: Array<{ text: string; alias: string | null; aggregation: string | null }>;
  counts: {
    scan: number | null;
    afterWhere: number | null;
    afterGroup: number | null;
    afterHaving: number | null;
    out: number | null;
  };
  ms: number | null;
  error: { message: string } | null;
}

interface FunnelShape {
  ok: boolean;
  applicable?: boolean;
  baseRows?: number | null;
  afterWhere?: number | null;
  afterGroup?: number | null;
  afterHaving?: number | null;
  finalRows?: number | null;
}

/** Build the machine payload from the live parse + exec + funnel probes. */
function buildPayload(
  plan: ParseResult | null,
  exec: ExecResponse | null,
  tableCounts: Record<string, number> | null,
  funnel: FunnelShape | null,
): MachinePlan {
  if (!plan || !plan.ok) {
    return {
      statementType: "SELECT",
      tables: [],
      where: [],
      groupBy: [],
      having: [],
      orderBy: [],
      limit: null,
      offset: null,
      distinct: false,
      setOps: [],
      columns: [],
      counts: { scan: null, afterWhere: null, afterGroup: null, afterHaving: null, out: null },
      ms: null,
      error: { message: plan && !plan.ok ? plan.error : "the query could not be parsed" },
    };
  }
  // rows in: sum the live row counts of the plain tables this query touches
  let scan: number | null = null;
  if (tableCounts) {
    const names = new Set(
      plan.tables.filter((t) => t.kind === "table").map((t) => t.name),
    );
    if (names.size > 0) {
      scan = 0;
      for (const n of names) scan += tableCounts[n] ?? 0;
    }
  }
  const execOk = exec && exec.ok ? exec : null;
  return {
    statementType: plan.statementType,
    tables: plan.tables.map((t) => ({ name: t.name })),
    where: plan.where,
    groupBy: plan.groupBy,
    having: plan.having,
    orderBy: plan.orderBy,
    limit: plan.limit,
    offset: plan.offset,
    distinct: plan.distinct,
    setOps: plan.setOps,
    columns: plan.columns.slice(0, 6).map((c) => ({
      text: c.text,
      alias: c.alias,
      aggregation: c.aggregation,
    })),
    counts: {
      // what enters the sieve is the post-FROM/JOIN row set — the funnel's
      // baseRows is the truthful number; the table sum is the fallback
      scan: funnel?.applicable && funnel.baseRows != null ? funnel.baseRows : scan,
      afterWhere: funnel?.applicable ? (funnel.afterWhere ?? null) : null,
      afterGroup: funnel?.applicable ? (funnel.afterGroup ?? null) : null,
      afterHaving: funnel?.applicable ? (funnel.afterHaving ?? null) : null,
      out: execOk ? execOk.rowCount : null,
    },
    ms: execOk ? execOk.durationMs : null,
    error: null,
  };
}

export function QueryMachine({
  plan,
  exec,
  sql,
  dialect,
  tableCounts,
  dataVersion,
}: {
  plan: ParseResult | null;
  exec: ExecResponse | null;
  sql: string;
  dialect: string;
  tableCounts: Record<string, number> | null;
  /** bumped on DB reset — invalidates the funnel cache */
  dataVersion: number;
}) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const readyRef = useRef(false);
  const lastSentRef = useRef("");
  const [funnel, setFunnel] = useState<FunnelShape | null>(null);
  const funnelSqlRef = useRef<string | null>(null);

  const payload = useMemo(
    () => buildPayload(plan, exec, tableCounts, funnel),
    [plan, exec, tableCounts, funnel],
  );
  const payloadKey = JSON.stringify(payload);

  // real stage counts from the funnel probes (best effort, SELECT-only)
  useEffect(() => {
    const trimmed = sql.trim().replace(/;+\s*$/, "");
    if (!trimmed || funnelSqlRef.current === trimmed) return;
    funnelSqlRef.current = trimmed;
    setFunnel(null);
    const t = setTimeout(() => {
      fetch("/api/funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: trimmed, dialect }),
      })
        .then((r) => r.json())
        .then((j: FunnelShape) => {
          if (funnelSqlRef.current === trimmed) setFunnel(j);
        })
        .catch(() => {
          /* the machine just shows fewer numbers */
        });
    }, 900);
    return () => clearTimeout(t);
  }, [sql, dialect, dataVersion]);

  // talk to the figure
  useEffect(() => {
    const send = (msg: Record<string, unknown>) => {
      frameRef.current?.contentWindow?.postMessage(msg, "*");
    };
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow) return;
      const d = e.data as { type?: string } | null;
      if (d?.type === "cf:ready") {
        readyRef.current = true;
        send({ type: "cf:plan", plan: payload });
        if (exec && exec.ok) send({ type: "cf:run" });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payloadKey, exec]);

  // plan changes while the frame is alive
  useEffect(() => {
    if (!readyRef.current) return;
    frameRef.current?.contentWindow?.postMessage({ type: "cf:plan", plan: payload }, "*");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payloadKey]);

  // the app's Run button plays the machine
  const ranRef = useRef<string | null>(null);
  useEffect(() => {
    if (!readyRef.current || !exec || !exec.ok) return;
    if (ranRef.current === payloadKey) return;
    ranRef.current = payloadKey;
    frameRef.current?.contentWindow?.postMessage({ type: "cf:run" }, "*");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payloadKey, exec]);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#f2efe7] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
      <iframe
        ref={frameRef}
        src="/cf/query-machine.html"
        title="The Query Machine — your query as a hand-inked machine"
        className="block h-[640px] w-full sm:h-[700px]"
      />
    </div>
  );
}
