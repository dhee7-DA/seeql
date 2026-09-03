"use client";

// Shared result table for inline runs and graded problems.
// Flat: sticky header, hairline rows, NULL dimmed, 12-row cap.

import type { CellValue } from "@/lib/sql-types";

export interface GridData {
  columns: string[];
  rows: CellValue[][];
}

export function ResultGrid({ data, maxHeight = "max-h-64" }: { data: GridData; maxHeight?: string }) {
  const shown = data.rows.slice(0, 12);
  return (
    <div className={`overflow-auto rounded-md border border-zinc-800 ${maxHeight} thin-scrollbar`}>
      <table className="w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 z-10 bg-zinc-900">
          <tr>
            {data.columns.map((c) => (
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
          {shown.map((row, ri) => (
            <tr key={ri} className="odd:bg-zinc-950/40 transition-colors hover:bg-zinc-900/50">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="tnum max-w-[240px] truncate whitespace-nowrap border-b border-zinc-900 px-3 py-1.5 font-mono text-zinc-300"
                >
                  {cell === null ? <span className="italic text-zinc-600">NULL</span> : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.rows.length > 12 && (
        <p className="tnum bg-zinc-900/60 px-3 py-1.5 font-mono text-[11px] text-zinc-500">
          + {data.rows.length - 12} more rows (of {data.rows.length})
        </p>
      )}
    </div>
  );
}
