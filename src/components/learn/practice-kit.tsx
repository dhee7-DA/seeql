"use client";

// Practice-kit — the shared surface layer for the practice lab views
// (predict, clinic, golf, mastery, interview, studio, sheet, explain).
// One compact result grid, one exec helper, one XP/celebrate path, one
// row-set comparator — so every lab grades and pays identically.

import type { CellValue, ExecResponse } from "@/lib/sql-types";
import { useProgress } from "@/lib/curriculum/progress";
import { reportMentorFailure } from "@/lib/mentor-context";
import { celebrate } from "./celebrate";
import { cn } from "@/lib/utils";

/** POST a statement to the sandbox API. Hard failures land in the mentor context. */
export async function execSql(sql: string): Promise<ExecResponse> {
  const res = await fetch("/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
  const data = (await res.json()) as ExecResponse;
  if (!data.ok) {
    reportMentorFailure({
      sql: sql.slice(0, 2000),
      error: data.error ?? null,
      note: null,
      source: "Practice lab",
    });
  }
  return data;
}

/** Compact result grid — the practice lab's answer sheet. */
export function MiniGrid({
  columns,
  rows,
  tone = "neutral",
  className,
}: {
  columns: string[];
  rows: CellValue[][];
  tone?: "neutral" | "good" | "bad";
  className?: string;
}) {
  const border =
    tone === "good" ? "border-emerald-400/40" : tone === "bad" ? "border-rose-400/40" : "border-zinc-800";
  return (
    <div className={cn("overflow-x-auto rounded-md border bg-zinc-900/50", border, className)}>
      <table className="w-full min-w-max border-collapse font-mono text-[11px]">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                className="border-b border-zinc-800 px-2.5 py-1.5 text-left font-medium uppercase tracking-wider text-zinc-500"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={Math.max(columns.length, 1)} className="px-2.5 py-2 text-zinc-600">
                0 rows
              </td>
            </tr>
          ) : (
            rows.map((r, ri) => (
              <tr key={ri} className="border-b border-zinc-800/50 last:border-b-0">
                {r.map((v, ci) => (
                  <td key={ci} className="tnum px-2.5 py-1.5 text-zinc-200">
                    {v === null ? <span className="text-zinc-600 italic">NULL</span> : String(v)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Award practice XP once (idempotent ledger) and celebrate honestly. */
export function awardPracticeXp(key: string, amount: number, label: string): boolean {
  const paid = useProgress.getState().awardXp(key, amount);
  if (paid) {
    celebrate({ kind: "xp", title: `+${amount} XP`, sub: label });
  }
  return paid;
}

/** Fold a graded attempt into the mastery ledger + the SR schedule. */
export function recordPracticeAttempt(skill: string, ledgerKey: string, correct: boolean) {
  const store = useProgress.getState();
  store.recordSkill(skill, correct);
  store.scheduleReview(ledgerKey, correct);
}

/** Multiset row comparison — order-sensitive when `ordered`. */
export function rowsMatch(a: CellValue[][], b: CellValue[][], ordered: boolean): boolean {
  if (a.length !== b.length) return false;
  const key = (r: CellValue[]) => JSON.stringify(r);
  if (ordered) return a.every((r, i) => key(r) === key(b[i]));
  const count = new Map<string, number>();
  for (const r of a) count.set(key(r), (count.get(key(r)) ?? 0) + 1);
  for (const r of b) {
    const n = count.get(key(r)) ?? 0;
    if (n === 0) return false;
    count.set(key(r), n - 1);
  }
  return true;
}
