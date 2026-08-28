"use client";

// Query results grid: sticky header, zebra rows, NULL styling, CSV export.

import { useMemo, useState } from "react";
import { ArrowDownToLine, Check, Copy, Rows3, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CellValue } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

const RENDER_CAP = 300;

function cellToString(v: CellValue): string {
  if (v === null) return "";
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

function toCsv(columns: string[], rows: CellValue[][]): string {
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const head = columns.map(esc).join(",");
  const body = rows.map((r) => r.map((c) => esc(cellToString(c))).join(",")).join("\n");
  return `${head}\n${body}`;
}

function isNumeric(v: CellValue): boolean {
  return typeof v === "number" || (typeof v === "string" && v !== "" && !Number.isNaN(Number(v)) && v.trim() !== "");
}

export function ResultsView({
  columns,
  rows,
  truncated,
}: {
  columns: string[];
  rows: CellValue[][];
  truncated: boolean;
}) {
  const [copied, setCopied] = useState<"csv" | "none">("none");
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? rows : rows.slice(0, RENDER_CAP);
  const numericCols = useMemo(() => {
    const set = new Set<number>();
    for (let ci = 0; ci < columns.length; ci++) {
      let numeric = 0;
      let total = 0;
      for (const row of rows.slice(0, 50)) {
        const v = row[ci];
        if (v !== null) {
          total++;
          if (isNumeric(v)) numeric++;
        }
      }
      if (total > 0 && numeric / total >= 0.8) set.add(ci);
    }
    return set;
  }, [columns, rows]);

  const copyCsv = async () => {
    try {
      await navigator.clipboard.writeText(toCsv(columns, rows));
      setCopied("csv");
      setTimeout(() => setCopied("none"), 1600);
    } catch {
      // clipboard unavailable
    }
  };

  const downloadCsv = () => {
    const blob = new Blob([toCsv(columns, rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-0 flex-col">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/70 px-3 py-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
          <Rows3 className="h-3.5 w-3.5" />
          {rows.length.toLocaleString()} row{rows.length === 1 ? "" : "s"}
        </span>
        {truncated && (
          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-xs text-amber-300">
            payload capped at 1,000 rows
          </span>
        )}
        {!truncated && rows.length > RENDER_CAP && !showAll && (
          <span className="rounded-full border border-zinc-700 bg-zinc-800/60 px-2.5 py-0.5 text-xs text-zinc-400">
            rendering {RENDER_CAP}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          {rows.length > RENDER_CAP && !showAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(true)}
              className="h-7 px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              Show all {rows.length.toLocaleString()}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCsv}
            className="h-7 gap-1.5 px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            {copied === "csv" ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            Copy CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadCsv}
            className="h-7 gap-1.5 px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            CSV
          </Button>
        </div>
      </div>

      {/* grid */}
      <div className="thin-scrollbar max-h-[420px] min-h-[120px] overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-zinc-900/95 backdrop-blur">
              <th className="w-10 border-b border-zinc-800 px-3 py-2 text-right font-mono text-[11px] font-medium text-zinc-600">
                #
              </th>
              {columns.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="border-b border-zinc-800 px-3 py-2 font-mono text-xs font-semibold whitespace-nowrap text-zinc-200"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, ri) => (
              <tr key={ri} className="group hover:bg-zinc-800/40">
                <td className="border-b border-zinc-800/50 px-3 py-1.5 text-right font-mono text-[11px] text-zinc-600 group-hover:text-zinc-500">
                  {ri + 1}
                </td>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    title={cell === null ? "NULL" : cellToString(cell)}
                    className={cn(
                      "max-w-[280px] truncate border-b border-zinc-800/50 px-3 py-1.5 font-mono text-xs",
                      cell === null && "italic text-zinc-600",
                      cell !== null && (numericCols.has(ci) ? "text-right text-teal-300" : "text-zinc-300"),
                      typeof cell === "boolean" && "text-violet-300",
                    )}
                  >
                    {cell === null ? "NULL" : cellToString(cell)}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-10 text-center text-sm text-zinc-500"
                >
                  The query ran fine — it just returned no rows.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Compact success banner for write statements (no result grid). */
export function WriteResultView({
  statementType,
  changes,
}: {
  statementType: string;
  changes: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <Check className="h-8 w-8 text-emerald-400" />
      <p className="text-sm font-medium text-zinc-200">
        {statementType} executed successfully
      </p>
      <p className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Timer className="h-3.5 w-3.5" />
        {changes} row{changes === 1 ? "" : "s"} affected · sample data is temporary
      </p>
    </div>
  );
}
