"use client";

// Data Quality Dashboard: a live audit of the sample dataset — per-table
// scores, null heat bars, FK integrity, enum chaos, anomalies and monthly
// clean-vs-flagged timelines. Everything is computed by SQL against the
// same SQLite database user queries run on.

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  Fingerprint,
  GitBranch,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QualityResponse } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

function scoreTone(score: number): string {
  if (score >= 92) return "text-emerald-300 border-emerald-400/30 bg-emerald-400/10";
  if (score >= 80) return "text-amber-300 border-amber-400/30 bg-amber-400/10";
  return "text-rose-300 border-rose-400/30 bg-rose-400/10";
}

function fmtCell(v: string | number | boolean | null): string {
  if (v === null) return "NULL";
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

/** Which (table, column) an enum report belongs to, for dedup keys. */
const enumKey = (t: string, c: string) => `${t}.${c}`;

export function QualityView() {
  const [data, setData] = useState<QualityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quality");
      const json = (await res.json()) as QualityResponse | { ok: false; error: string };
      if (json.ok) setData(json);
      else setError(json.error);
    } catch {
      setError("Could not reach the quality audit. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Auditing the sample database…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-200">
        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold",
            scoreTone(data.overallScore),
          )}
        >
          <BadgeCheck className="h-4 w-4" />
          Quality score
          <span className="font-mono">{data.overallScore}</span>
          <span className="text-xs font-normal opacity-70">/ 100</span>
        </div>
        <p className="text-xs text-zinc-500">
          The built-in dataset is intentionally messy — this audit runs live SQL against it.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={load}
          className="ml-auto h-7 gap-1.5 px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Re-run audit
        </Button>
      </div>

      {/* table scorecards */}
      <section aria-label="Per-table quality">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
          <Fingerprint className="h-3.5 w-3.5 text-emerald-500" />
          Column health
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.tables.map((t) => (
            <div key={t.table} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-mono text-sm font-bold text-zinc-100">{t.table}</h4>
                  <p className="text-[11px] text-zinc-500">
                    {t.rows.toLocaleString()} rows audited
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 font-mono text-xs font-bold",
                    scoreTone(t.score),
                  )}
                >
                  {t.score}
                </span>
              </div>
              <ul className="space-y-1.5">
                {t.columns.map((c) => (
                  <li key={c.column} title={`${c.label} — ${c.bad} of ${c.total} rows`}>
                    <div className="flex items-baseline justify-between gap-2 font-mono text-[11px]">
                      <span className="truncate text-zinc-300">{c.column}</span>
                      <span className="shrink-0 text-zinc-500">
                        <span className="text-amber-400">{c.nullPct}%</span>
                        {c.badPct > c.nullPct && (
                          <span className="text-rose-400"> / {c.badPct}%</span>
                        )}
                      </span>
                    </div>
                    <div className="mt-0.5 flex h-1.5 w-full gap-px overflow-hidden rounded-full bg-zinc-800">
                      {/* rose = any rule violation; amber overlay = null share */}
                      <div
                        className="h-full rounded-full bg-rose-500/80"
                        style={{ width: `${Math.min(100, c.badPct)}%` }}
                      />
                      <div
                        className="h-full rounded-full bg-amber-400/90"
                        style={{ width: `${Math.min(100 - Math.min(100, c.badPct), Math.max(0, c.nullPct - c.badPct))}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-2.5 text-[10px] leading-relaxed text-zinc-600">
                <span className="text-amber-400">amber</span> = missing (NULL) ·{" "}
                <span className="text-rose-400">rose</span> = any rule violation (incl. orphans,
                impossible dates, mixed scales)
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* enum chaos */}
        <section aria-label="Enum chaos">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            Enum chaos — same value, many spellings
          </h3>
          <div className="space-y-3">
            {data.enums.map((e) => (
              <div key={enumKey(e.table, e.column)} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-zinc-200">
                    {e.table}<span className="text-zinc-500">.</span>{e.column}
                  </span>
                  <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                    {e.variants} variants
                  </span>
                  {e.nulls > 0 && (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300">
                      {e.nulls} NULL
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {e.values.map((v, i) => {
                    const isNull = v.value === null;
                    const isDirt =
                      !isNull &&
                      v.value !== null &&
                      v.value !== v.value.toLowerCase().trim();
                    return (
                      <span
                        key={`${v.value ?? "null"}-${i}`}
                        title={`${v.n} row(s)`}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px]",
                          isNull
                            ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                            : isDirt
                              ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
                              : "border-zinc-700 bg-zinc-800/70 text-zinc-300",
                        )}
                      >
                        {isNull ? "NULL" : `"${v.value}"`}
                        <span className="font-bold opacity-80">×{v.n}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          {/* FK integrity */}
          <section aria-label="Referential integrity">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              <GitBranch className="h-3.5 w-3.5 text-teal-400" />
              Broken references
            </h3>
            <div className="space-y-2">
              {data.fks.map((f) => {
                const badPct = f.total > 0 ? ((f.orphans + f.nullRefs) / f.total) * 100 : 0;
                return (
                  <div
                    key={`${f.childTable}.${f.childColumn}`}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-xs">
                      <span className="text-zinc-200">
                        {f.childTable}.{f.childColumn}
                        <span className="text-zinc-500"> → {f.parentTable}.{f.parentColumn}</span>
                      </span>
                      <span>
                        <span className="text-rose-300">{f.orphans} orphans</span>
                        <span className="text-zinc-600"> · </span>
                        <span className="text-amber-300">{f.nullRefs} null</span>
                        <span className="text-zinc-600"> / {f.total}</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={cn("h-full rounded-full", badPct > 5 ? "bg-rose-500/80" : "bg-rose-500/50")}
                        style={{ width: `${Math.min(100, badPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* timelines */}
          <section aria-label="Clean vs flagged rows over time">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              <CalendarClock className="h-3.5 w-3.5 text-amber-400" />
              Flagged rows by month
            </h3>
            <div className="space-y-3">
              {Object.entries(data.timelines).map(([table, points]) => {
                const max = Math.max(...points.map((p) => p.total), 1);
                return (
                  <div key={table} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
                    <div className="mb-2 font-mono text-xs font-bold text-zinc-200">{table}</div>
                    <div className="flex h-16 items-end gap-[3px]">
                      {points.map((p) => {
                        const h = (p.total / max) * 100;
                        const fh = p.total > 0 ? (p.flagged / p.total) * 100 : 0;
                        return (
                          <div
                            key={p.month}
                            title={`${p.month}: ${p.total} rows, ${p.flagged} flagged`}
                            className="group relative flex-1 rounded-t bg-zinc-700/70"
                            style={{ height: `${Math.max(4, h)}%` }}
                          >
                            <div
                              className="absolute inset-x-0 bottom-0 rounded-t bg-rose-500/80"
                              style={{ height: `${fh}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-1 flex justify-between font-mono text-[9px] text-zinc-600">
                      <span>{points[0]?.month}</span>
                      <span>{points[points.length - 1]?.month}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* anomaly report */}
      <section aria-label="Anomaly report">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          Anomaly report
        </h3>
        <div className="grid gap-2 md:grid-cols-2">
          {data.anomalies.map((a) => (
            <div
              key={`${a.table}-${a.kind}`}
              className={cn(
                "rounded-xl border bg-zinc-900/60 px-3.5 py-2.5",
                a.count > 0 ? "border-rose-500/25" : "border-zinc-800 opacity-60",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium text-zinc-200">{a.kind}</span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold",
                    a.count > 0
                      ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
                      : "border-zinc-700 bg-zinc-800 text-zinc-500",
                  )}
                >
                  {a.count}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-600">
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono">{a.table}</span>
                {a.example && (
                  <span className="truncate font-mono" title={Object.entries(a.example).map(([k, v]) => `${k}=${fmtCell(v)}`).join(" · ")}>
                    e.g. {Object.entries(a.example).map(([k, v]) => `${k}=${fmtCell(v)}`).join(" · ")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
