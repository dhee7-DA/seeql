"use client";

// Chart view: turns a result set into a chart. Detects column roles
// (date / number / text), suggests an X–Y pair and chart type, and lets
// the user override everything. Aggregation (SUM by category) happens
// client-side over the (capped) result payload.

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartColumn, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CellValue } from "@/lib/sql-types";

type ColKind = "date" | "number" | "text";
type ChartKind = "bar" | "line" | "area" | "scatter" | "pie";

const DATE_RE = /^\d{4}-\d{2}(-\d{2})?([ T]\d{2}:\d{2})?/;
const PALETTE = [
  "#34d399", "#2dd4bf", "#a78bfa", "#fbbf24", "#fb7185",
  "#60a5fa", "#f472b6", "#4ade80", "#f97316", "#94a3b8",
];

function inferKind(col: number, rows: CellValue[][]): ColKind {
  let num = 0;
  let date = 0;
  let total = 0;
  for (const row of rows.slice(0, 200)) {
    const v = row[col];
    if (v === null || v === "") continue;
    total++;
    if (typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)))) num++;
    if (typeof v === "string" && DATE_RE.test(v.trim())) date++;
  }
  if (total === 0) return "text";
  if (date / total >= 0.8) return "date";
  if (num / total >= 0.8) return "number";
  return "text";
}

const AXIS = { stroke: "#71717a", fontSize: 11, fontFamily: "monospace" } as const;

export function ChartView({ columns, rows }: { columns: string[]; rows: CellValue[][] }) {
  const kinds = useMemo(() => columns.map((_, ci) => inferKind(ci, rows)), [columns, rows]);

  const numericCols = columns.map((_, i) => i).filter((i) => kinds[i] !== "text");
  const categoryCols = columns.map((_, i) => i).filter((i) => kinds[i] !== "number");

  const suggested = useMemo(() => {
    const x = categoryCols[0] ?? numericCols[0] ?? -1;
    const y = numericCols.find((i) => i !== x) ?? -1;
    const kind: ChartKind = x >= 0 && kinds[x] === "date" && y >= 0 ? "line" : x >= 0 && y >= 0 ? "bar" : "scatter";
    return { x, y, kind };
  }, [columns, rows, kinds, numericCols, categoryCols]);

  const [xIdx, setXIdx] = useState<number>(suggested.x);
  const [yIdx, setYIdx] = useState<number>(suggested.y);
  const [kind, setKind] = useState<ChartKind>(suggested.kind);

  const distinctX = useMemo(() => {
    if (xIdx < 0) return 0;
    return new Set(rows.slice(0, 1000).map((r) => r[xIdx]).filter((v) => v !== null)).size;
  }, [rows, xIdx]);

  const chartData = useMemo(() => {
    if (xIdx < 0 || xIdx >= columns.length) return [];
    if (kind === "scatter") {
      if (yIdx < 0) return [];
      return rows
        .slice(0, 1000)
        .map((r, i) => ({
          x: typeof r[xIdx] === "number" ? (r[xIdx] as number) : Number(r[xIdx]),
          y: typeof r[yIdx] === "number" ? (r[yIdx] as number) : Number(r[yIdx]),
          i,
        }))
        .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    }
    if (yIdx < 0) return [];
    // aggregate SUM(y) grouped by x, top 20 + Other
    const acc = new Map<string, number>();
    for (const r of rows.slice(0, 1000)) {
      const xv = r[xIdx];
      const yv = r[yIdx];
      if (xv === null || xv === "" || yv === null) continue;
      const y = typeof yv === "number" ? yv : Number(yv);
      if (!Number.isFinite(y)) continue;
      const key = String(xv);
      acc.set(key, (acc.get(key) ?? 0) + y);
    }
    let entries = Array.from(acc.entries());
    if (kind === "line" && entries.length > 1) {
      entries = entries.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    } else {
      entries = entries.sort((a, b) => b[1] - a[1]);
    }
    const top = entries.slice(0, 20);
    const rest = entries.slice(20);
    const data = top.map(([label, value]) => ({
      x: label,
      y: Math.round(value * 100) / 100,
    }));
    if (rest.length > 0) {
      data.push({
        x: `(${rest.length} more)`,
        y: Math.round(rest.reduce((a, [, v]) => a + v, 0) * 100) / 100,
      });
    }
    return data;
  }, [rows, columns, xIdx, yIdx, kind]);

  if (columns.length === 0 || rows.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-500">
        Run a query that returns rows to chart them.
      </div>
    );
  }

  if (numericCols.length === 0 || suggested.y < 0) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/5 p-4 text-sm text-amber-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div>
          <p className="font-medium">Nothing to chart here.</p>
          <p className="mt-1 text-xs text-zinc-400">
            Charts need at least one numeric column in the result. This result has only text values.
          </p>
        </div>
      </div>
    );
  }

  const xLabel = xIdx >= 0 ? columns[xIdx] : "—";
  const yLabel = yIdx >= 0 ? columns[yIdx] : "—";
  const canPie = distinctX > 0 && distinctX <= 8;

  return (
    <div className="space-y-3 p-3">
      {/* controls */}
      <div className="flex flex-wrap items-center gap-2">
        <ChartColumn className="h-4 w-4 text-emerald-500" />
        <Select
          value={String(kind)}
          onValueChange={(v) => setKind(v as ChartKind)}
        >
          <SelectTrigger size="sm" className="w-[120px] border-zinc-700 bg-zinc-900 text-xs" aria-label="Chart type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar" className="text-xs">Bar</SelectItem>
            <SelectItem value="line" className="text-xs">Line</SelectItem>
            <SelectItem value="area" className="text-xs">Area</SelectItem>
            <SelectItem value="scatter" className="text-xs">Scatter</SelectItem>
            {canPie && <SelectItem value="pie" className="text-xs">Pie</SelectItem>}
          </SelectContent>
        </Select>

        <Select value={String(xIdx)} onValueChange={(v) => setXIdx(Number(v))}>
          <SelectTrigger size="sm" className="w-[170px] border-zinc-700 bg-zinc-900 font-mono text-xs" aria-label="X axis">
            <SelectValue placeholder="X axis" />
          </SelectTrigger>
          <SelectContent>
            {columns.map((c, i) => (
              <SelectItem key={c} value={String(i)} className="font-mono text-xs">
                {c}
                <span className="ml-1.5 text-zinc-500">{kinds[i]}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {kind !== "pie" && (
          <Select value={String(yIdx)} onValueChange={(v) => setYIdx(Number(v))}>
            <SelectTrigger size="sm" className="w-[170px] border-zinc-700 bg-zinc-900 font-mono text-xs" aria-label="Y axis">
              <SelectValue placeholder="Y axis" />
            </SelectTrigger>
            <SelectContent>
              {numericCols.map((i) => (
                <SelectItem key={i} value={String(i)} className="font-mono text-xs">
                  {columns[i]}
                  <span className="ml-1.5 text-zinc-500">{kinds[i]}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <span className="ml-auto text-[11px] text-zinc-500">
          {kind === "scatter"
            ? `${chartData.length} points`
            : `SUM(${yLabel}) by ${xLabel} · top ${Math.min(20, distinctX)} shown`}
        </span>
      </div>

      {/* chart */}
      <div className="h-[320px] w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "bar" ? (
            <BarChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="x" tick={AXIS} tickLine={false} interval="equidistantPreserveStart" angle={chartData.length > 8 ? -35 : 0} height={chartData.length > 8 ? 64 : 28} textAnchor={chartData.length > 8 ? "end" : "middle"} />
              <YAxis tick={AXIS} tickLine={false} width={72} />
              <Tooltip
                cursor={{ fill: "#3f3f4633" }}
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="y" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : kind === "line" ? (
            <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="x" tick={AXIS} tickLine={false} />
              <YAxis tick={AXIS} tickLine={false} width={72} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="y" stroke="#34d399" strokeWidth={2} dot={chartData.length <= 24} />
            </LineChart>
          ) : kind === "area" ? (
            <AreaChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="x" tick={AXIS} tickLine={false} />
              <YAxis tick={AXIS} tickLine={false} width={72} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="y" stroke="#34d399" strokeWidth={2} fill="url(#areaFill)" />
            </AreaChart>
          ) : kind === "scatter" ? (
            <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis dataKey="x" name={xLabel} tick={AXIS} tickLine={false} type="number" />
              <YAxis dataKey="y" name={yLabel} tick={AXIS} tickLine={false} width={72} type="number" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }} />
              <Scatter data={chartData} fill="#2dd4bf" fillOpacity={0.75} />
            </ScatterChart>
          ) : (
            <PieChart>
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }} />
              <Pie data={chartData} dataKey="y" nameKey="x" innerRadius="45%" outerRadius="80%" paddingAngle={2}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#18181b" />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-600">
        Charts aggregate the payload in the browser — run narrower queries (GROUP BY, LIMIT) for
        exact values on big results.
      </p>
    </div>
  );
}
