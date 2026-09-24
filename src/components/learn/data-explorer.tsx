"use client";

// Data Explorer — browse the live storefront database that every lesson and
// every fact is built on. Pick a table, page through real rows, click a
// foreign-key cell to follow the relationship, or jump into the playground
// with the table preloaded. Rows come from /api/query (read-only).

import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { Icon3D } from "./ui/icon3d";
import { cn } from "@/lib/utils";
import { WORLDS, WORLD_FOR_TABLE, getWorld, schemaFor } from "@/lib/worlds-meta";

type Rows = { columns: string[]; rows: unknown[][] };

const PAGE = 25;

function fmt(v: unknown): string {
  if (v === null) return "NULL";
  if (typeof v === "number" && !Number.isInteger(v)) return String(parseFloat(v.toFixed(2)));
  return String(v);
}

export function DataExplorer() {
  const [worldId, setWorldId] = useState("storefront");
  const [table, setTable] = useState("orders");
  const [filter, setFilter] = useState<{ column: string; value: number } | null>(null);
  const [page, setPage] = useState(0);
  const [cache, setCache] = useState<Record<string, Rows>>({});
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  const world = getWorld(worldId);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setCounts(j.counts as Record<string, number>);
      })
      .catch(() => {});
  }, []);

  const rowsData = cache[table] ?? null;
  const loading = !rowsData && !error;

  useEffect(() => {
    if (cache[table]) return;
    let alive = true;
    fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql: `SELECT * FROM ${table} ORDER BY id` }),
    })
      .then((r) => r.json())
      .then((j: { ok: boolean; columns?: string[]; rows?: unknown[][]; error?: string }) => {
        if (!alive) return;
        if (j.ok) {
          setCache((c) => ({ ...c, [table]: { columns: j.columns ?? [], rows: (j.rows ?? []) as unknown[][] } }));
        } else {
          setError(j.error ?? "Query failed");
        }
      })
      .catch(() => {
        if (alive) setError("Network error");
      });
    return () => {
      alive = false;
    };
  }, [table, cache]);

  const meta = schemaFor(table);

  const filtered = (() => {
    if (!rowsData) return [];
    if (!filter) return rowsData.rows;
    const idx = rowsData.columns.indexOf(filter.column);
    return rowsData.rows.filter((r) => Number(r[idx]) === filter!.value);
  })();

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const safePage = Math.min(page, pages - 1);
  const pageRows = filtered.slice(safePage * PAGE, safePage * PAGE + PAGE);

  function pickTable(name: string) {
    setTable(name);
    setFilter(null);
    setPage(0);
    setError(null);
    // FK jumps can cross worlds (e.g. invoices → customers) — follow the jump.
    const targetWorld = WORLD_FOR_TABLE[name];
    if (targetWorld && targetWorld !== worldId) setWorldId(targetWorld);
  }

  function openInPlayground() {
    const sql = `SELECT * FROM ${table};`;
    window.location.hash = `#playground?q=${encodeURIComponent(sql)}&d=sqlite`;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Toolbox</p>
          <h1 className="mt-2 flex items-center gap-3 font-display text-2xl font-semibold tracking-tight text-zinc-50"><Icon3D name="db" size={34} />Data explorer</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            One sandbox, five data worlds. The lessons live on the storefront; the
            finance books, a hospital, a football league and a freight network are
            here to explore. Click any highlighted id to follow a relationship.
          </p>
        </div>
        <button
          onClick={openInPlayground}
          className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Query {table} in the playground
        </button>
      </div>

      {/* world picker */}
      <div className="mt-5 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Data worlds">
        {WORLDS.map((w) => (
          <button
            key={w.id}
            role="tab"
            aria-selected={w.id === worldId}
            onClick={() => {
              setWorldId(w.id);
              // keep the selected table if it belongs to the new world
              const stays = w.tables.some((t) => t.name === table);
              setTable(stays ? table : w.tables[0].name);
              setFilter(null);
              setPage(0);
              setError(null);
            }}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              w.id === worldId
                ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
            )}
          >
            {w.name}
            <span className="ml-1.5 font-mono text-[10px] text-zinc-500">{w.tables.length}</span>
          </button>
        ))}
      </div>

      {/* table picker */}
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {world.tables.map((t) => (
          <button
            key={t.name}
            onClick={() => pickTable(t.name)}
            className={cn(
              "cell-lift rounded-lg border p-3 text-left",
              t.name === table ? "border-emerald-400/60 bg-emerald-400/5" : "border-zinc-800 bg-zinc-950 hover:border-zinc-600",
            )}
          >
            <p className={cn("font-mono text-xs font-semibold", t.name === table ? "text-emerald-300" : "text-zinc-200")}>
              {t.name}
            </p>
            <p className="mt-1 truncate text-[10px] text-zinc-500" title={t.description}>
              {t.description}
            </p>
            <p className="tnum mt-1.5 font-mono text-sm text-zinc-100">{counts ? counts[t.name]?.toLocaleString() : "…"}</p>
            <p className="text-[10px] text-zinc-600">rows</p>
          </button>
        ))}
      </div>

      {/* selected table */}
      <div className="sheen mt-4 rounded-lg border border-zinc-800 bg-zinc-950">
        {/* columns */}
        <div className="flex flex-wrap gap-1.5 border-b border-zinc-800 px-3.5 py-2.5">
          {meta.columns.map((c) => (
            <span
              key={c.name}
              className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-300"
            >
              {c.name}
              <span className="text-zinc-600">{c.type === "INTEGER" ? "int" : c.type === "REAL" ? "num" : "text"}</span>
              {c.pk && <span className="rounded bg-amber-400/15 px-1 font-semibold text-amber-300">PK</span>}
              {c.fk && (
                <button
                  onClick={() => pickTable(c.fk!.table)}
                  className="rounded bg-sky-400/15 px-1 text-sky-300 hover:bg-sky-400/25"
                  title={`References ${c.fk.table}.${c.fk.column} — jump there`}
                >
                  FK→{c.fk.table}
                </button>
              )}
            </span>
          ))}
        </div>

        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 px-3.5 py-2 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-400">
              {loading ? "loading…" : `${filtered.length.toLocaleString()} row${filtered.length === 1 ? "" : "s"}`}
            </span>
            {filter && !loading && (
              <span className="flex items-center gap-1 rounded border border-sky-400/40 bg-sky-400/10 px-1.5 py-0.5 font-mono text-sky-300">
                {filter.column} = {filter.value}
                <button onClick={() => { setFilter(null); setPage(0); }} className="hover:text-sky-100" title="Clear filter">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
          {!loading && filtered.length > PAGE && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, safePage - 1))}
                disabled={safePage === 0}
                className="rounded border border-zinc-700 px-2 py-0.5 text-zinc-300 hover:bg-zinc-900 disabled:opacity-30"
              >
                Prev
              </button>
              <span className="font-mono">
                page {safePage + 1} / {pages}
              </span>
              <button
                onClick={() => setPage(Math.min(pages - 1, safePage + 1))}
                disabled={safePage >= pages - 1}
                className="rounded border border-zinc-700 px-2 py-0.5 text-zinc-300 hover:bg-zinc-900 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* rows */}
        {error ? (
          <p className="px-3.5 py-6 font-mono text-xs text-rose-300">{error}</p>
        ) : loading && !rowsData ? (
          <p className="px-3.5 py-6 font-mono text-xs text-zinc-500">running SELECT * FROM {table}…</p>
        ) : rowsData && pageRows.length === 0 ? (
          <p className="px-3.5 py-6 font-mono text-xs text-zinc-500">
            No rows match {filter?.column} = {filter?.value}.
          </p>
        ) : rowsData ? (
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr>
                  {rowsData.columns.map((c) => (
                    <th
                      key={c}
                      className="whitespace-nowrap border-b border-zinc-800 px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, ri) => (
                  <tr key={ri} className="odd:bg-zinc-950/40 transition-colors hover:bg-zinc-900/50">
                    {row.map((cell, ci) => {
                      const colMeta = meta.columns.find((m) => m.name === rowsData.columns[ci]);
                      const isNull = cell === null;
                      const fk = !isNull ? colMeta?.fk : undefined;
                      return (
                        <td
                          key={ci}
                          className="tnum max-w-[240px] truncate whitespace-nowrap border-b border-zinc-900 px-3 py-1.5 font-mono text-zinc-300"
                        >
                          {fk && colMeta?.fk ? (
                            <button
                              onClick={() => {
                                pickTable(colMeta.fk!.table); // switches world too if the FK crosses packs
                                setFilter({ column: colMeta.fk!.column, value: Number(cell) });
                                setPage(0);
                              }}
                              className="text-sky-300 underline decoration-sky-400/40 underline-offset-2 hover:decoration-sky-300"
                              title={`Follow to ${colMeta.fk.table} where ${colMeta.fk.column} = ${cell}`}
                            >
                              {fmt(cell)}
                            </button>
                          ) : isNull ? (
                            <span className="italic text-zinc-600">NULL</span>
                          ) : (
                            fmt(cell)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* facts */}
        <div className="border-t border-zinc-800 bg-zinc-900/40 px-3.5 py-2.5">
          <p className="text-[11px] leading-relaxed text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-zinc-500">Field notes · </span>
            {world.facts[table] ?? "Live rows from the seeded world — press Reset database in the playground to restore canonical numbers."}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-zinc-600">
        Rows are live from the same database the lessons and graded queries run on — reset it any time from the playground.
      </p>
    </div>
  );
}
