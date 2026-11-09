"use client";

// DuckDB OLAP Lab & Performance Comparison View:
// Provides vectorized query execution against the storefront database,
// head-to-head execution benchmarking (DuckDB SIMD Columnar vs SQLite B-Tree),
// and interactive physical execution plan inspector.

import { useState } from "react";
import {
  Zap,
  Cpu,
  Layers,
  ArrowRight,
  Gauge,
  CheckCircle,
  AlertCircle,
  FileCode,
  Table,
  Timer,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { CellValue } from "@/lib/sql-types";

interface DuckDbLabProps {
  currentSql?: string;
  onApplySql?: (sql: string) => void;
}

interface DuckResult {
  ok: boolean;
  columns?: string[];
  rows?: CellValue[][];
  rowCount?: number;
  durationMs?: number;
  duckPlan?: string;
  error?: string;
  comparison?: {
    sqliteDurationMs?: number;
    duckDurationMs?: number;
    speedup?: string;
    duckEngine?: string;
    sqliteEngine?: string;
    sqliteError?: string;
  } | null;
}

const OLAP_BENCHMARKS = [
  {
    id: "vector-agg",
    name: "Vectorized Multi-Table Aggregation",
    tagline: "Hash Join + SIMD Columnar Grouping",
    desc: "Joins orders, items, products and computes gross revenue, volume and averages grouped by supplier region.",
    sql: `SELECT 
  s.region,
  COUNT(DISTINCT o.id) AS order_count,
  SUM(oi.quantity) AS total_units_sold,
  ROUND(SUM(oi.quantity * p.price), 2) AS regional_gross_revenue,
  ROUND(AVG(p.price), 2) AS avg_product_price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
JOIN suppliers s ON p.supplier_id = s.id
GROUP BY s.region
ORDER BY regional_gross_revenue DESC;`,
  },
  {
    id: "window-lag",
    name: "Analytical Moving Average & Windows",
    tagline: "Rolling 3-Order Window & Month Trends",
    desc: "Calculates cumulative rolling revenue and 3-row moving averages over chronological order sequences.",
    sql: `SELECT 
  id AS order_id,
  created_at,
  total,
  ROUND(AVG(total) OVER (
    ORDER BY created_at
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ), 2) AS moving_avg_3_orders,
  ROUND(SUM(total) OVER (
    ORDER BY created_at
    ROWS UNBOUNDED PRECEDING
  ), 2) AS cumulative_running_total
FROM orders
WHERE status != 'cancelled'
ORDER BY created_at
LIMIT 30;`,
  },
  {
    id: "filter-pushdown",
    name: "Predicate Filter Pushdown & Slicing",
    tagline: "Zone Map & Min/Max Block Pruning",
    desc: "Aggregates items with multi-predicate range filters to demonstrate columnar block skipping.",
    sql: `SELECT 
  p.category,
  COUNT(*) AS product_count,
  ROUND(AVG(p.price), 2) AS avg_price,
  SUM(p.stock) AS total_stock_on_hand
FROM products p
WHERE p.price BETWEEN 20.0 AND 150.0
  AND p.stock > 10
GROUP BY p.category
HAVING total_stock_on_hand > 50
ORDER BY total_stock_on_hand DESC;`,
  },
];

export function DuckDbLab({ currentSql, onApplySql }: DuckDbLabProps) {
  const [activeSql, setActiveSql] = useState<string>(currentSql || OLAP_BENCHMARKS[0].sql);
  const [running, setRunning] = useState<boolean>(false);
  const [result, setResult] = useState<DuckResult | null>(null);

  const runQuery = async (queryText: string) => {
    setRunning(true);
    setActiveSql(queryText);
    try {
      const res = await fetch("/api/duckdb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: queryText, compareWithSqlite: true }),
      });
      const data = (await res.json()) as DuckResult;
      setResult(data);
    } catch (e: unknown) {
      setResult({
        ok: false,
        error: e instanceof Error ? e.message : "Network error executing DuckDB",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-950/80 p-5 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-semibold text-zinc-100">DuckDB OLAP Analytical Engine</h2>
            <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
              Vectorized SIMD
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Vectorized columnar query engine running directly against SeeQL storefront tables with physical execution plan inspection.
          </p>
        </div>

        <Button
          onClick={() => runQuery(activeSql)}
          disabled={running}
          size="sm"
          className="h-8 gap-1.5 bg-amber-500 text-zinc-950 hover:bg-amber-400 font-semibold text-xs"
        >
          <Cpu className="h-3.5 w-3.5" />
          {running ? "Executing..." : "Run in DuckDB"}
        </Button>
      </div>

      {/* Preset Benchmarks Selector */}
      <div className="space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Analytical OLAP Benchmarks
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {OLAP_BENCHMARKS.map((b) => (
            <button
              key={b.id}
              onClick={() => runQuery(b.sql)}
              className={cn(
                "flex flex-col text-left p-3 rounded-lg border transition-all",
                activeSql.trim() === b.sql.trim()
                  ? "border-amber-500/50 bg-amber-950/20"
                  : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-zinc-200">{b.name}</span>
                <Sparkles className="h-3 w-3 text-amber-400" />
              </div>
              <span className="mt-1 font-mono text-[10px] text-amber-400/80">{b.tagline}</span>
              <p className="mt-1.5 text-[11px] text-zinc-400 line-clamp-2">{b.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Benchmark Head-to-Head Comparison Bar */}
      {result?.comparison && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex flex-col justify-between">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-amber-400" /> DuckDB Columnar (OLAP)
            </span>
            <div className="mt-1.5 font-mono text-2xl font-bold text-amber-400">
              {result.comparison.duckDurationMs} ms
            </div>
            <span className="text-[10px] text-zinc-500">Vectorized chunk scans & SIMD joins</span>
          </div>

          <div className="flex flex-col justify-between">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-zinc-400" /> SQLite B-Tree (OLTP)
            </span>
            <div className="mt-1.5 font-mono text-2xl font-bold text-zinc-300">
              {result.comparison.sqliteDurationMs} ms
            </div>
            <span className="text-[10px] text-zinc-500">Row-by-row table b-tree traversal</span>
          </div>

          <div className="flex flex-col justify-between border-l border-zinc-800 pl-4">
            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-emerald-400" /> Execution Advantage
            </span>
            <div className="mt-1.5 font-mono text-2xl font-bold text-emerald-400">
              {result.comparison.speedup}
            </div>
            <span className="text-[10px] text-emerald-500/80">Vectorized batch throughput</span>
          </div>
        </div>
      )}

      {/* Results & Execution Plan Tabs */}
      {result && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="h-8 bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="results" className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800">
              <Table className="h-3.5 w-3.5 text-amber-400" /> Query Results ({result.rowCount ?? 0})
            </TabsTrigger>
            {result.duckPlan && (
              <TabsTrigger value="plan" className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800">
                <FileCode className="h-3.5 w-3.5 text-teal-400" /> Physical Columnar Plan
              </TabsTrigger>
            )}
            <TabsTrigger value="sql" className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800">
              <Layers className="h-3.5 w-3.5 text-zinc-400" /> Executed SQL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="mt-3">
            {result.ok && result.columns && result.rows ? (
              <div className="overflow-x-auto rounded-lg border border-zinc-800 max-h-[360px]">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800 text-zinc-300">
                    <tr>
                      {result.columns.map((c) => (
                        <th key={c} className="px-3.5 py-2 font-semibold">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40 text-zinc-200">
                    {result.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-zinc-900/60">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-1.5">
                            {cell === null ? (
                              <span className="text-zinc-600">NULL</span>
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border border-rose-500/20 bg-rose-950/20 p-4 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 text-rose-400 shrink-0" />
                <div>
                  <span className="font-semibold">DuckDB Execution Error:</span>
                  <pre className="mt-1 font-mono text-[11px] whitespace-pre-wrap">{result.error}</pre>
                </div>
              </div>
            )}
          </TabsContent>

          {result.duckPlan && (
            <TabsContent value="plan" className="mt-3">
              <pre className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/80 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto max-h-[360px]">
                {result.duckPlan}
              </pre>
            </TabsContent>
          )}

          <TabsContent value="sql" className="mt-3">
            <div className="relative">
              <pre className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/80 font-mono text-xs text-zinc-300 overflow-x-auto">
                {activeSql}
              </pre>
              {onApplySql && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApplySql(activeSql)}
                  className="absolute top-3 right-3 h-7 text-xs border-zinc-700 bg-zinc-800 text-zinc-200 hover:text-emerald-400"
                >
                  Apply to Playground Editor <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

