"use client";

// A/B compare — pin a result, change the query (classic move: flip JOIN to
// LEFT JOIN), and the panel diffs the two result sets row by row: amber
// context for shared rows, rose for rows that disappeared, emerald for rows
// that appeared. Rows are matched by their full value tuple, so it stays
// honest even without an ORDER BY.

import { useMemo } from "react";
import { motion } from "framer-motion";
import { tableEmoji } from "@/components/landing/sandbox-graphics";

export interface CompareSnapshot {
  sql: string;
  columns: string[];
  rows: unknown[][];
  rowCount: number;
}

const MAX_SHOWN = 8;

function cell(v: unknown): string {
  if (v === null) return "NULL";
  if (typeof v === "number") return Number.isInteger(v) ? v.toLocaleString() : String(v);
  return String(v);
}

function diffSets(a: CompareSnapshot, b: CompareSnapshot) {
  const countA = new Map<string, number>();
  for (const r of a.rows) countA.set(JSON.stringify(r), (countA.get(JSON.stringify(r)) ?? 0) + 1);
  const countB = new Map<string, number>();
  for (const r of b.rows) countB.set(JSON.stringify(r), (countB.get(JSON.stringify(r)) ?? 0) + 1);
  const dropped: unknown[][] = [];
  let shared = 0;
  for (const [key, n] of countA) {
    const m = countB.get(key) ?? 0;
    if (m === 0) dropped.push(JSON.parse(key) as unknown[]);
    shared += Math.min(n, m);
  }
  const added: unknown[][] = [];
  for (const [key, n] of countB) {
    if (!countA.has(key)) added.push(JSON.parse(key) as unknown[]);
  }
  return { dropped, added, shared };
}

export function ComparePanel({
  pinned,
  current,
  onUnpin,
}: {
  pinned: CompareSnapshot;
  current: CompareSnapshot | null;
  onUnpin: () => void;
}) {
  const diff = useMemo(() => {
    if (!current) return null;
    // different SELECT shape → tuple matching would lie
    if (pinned.columns.join() !== current.columns.join()) return { shapeMismatch: true as const };
    return { shapeMismatch: false as const, ...diffSets(pinned, current) };
  }, [pinned, current]);

  const snippet = (sql: string) => {
    const one = sql.replace(/\s+/g, " ").trim();
    return one.length > 52 ? `${one.slice(0, 52)}…` : one;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-400/25 bg-amber-400/[0.03] p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-mono text-[11px] text-amber-200/90">
          <span aria-hidden className="emoji-bob">
            ⚖️
          </span>
          A/B compare — change the query and watch what appears or vanishes
        </p>
        <button
          onClick={onUnpin}
          className="rounded-full border border-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-500 transition-colors hover:border-rose-400/40 hover:text-rose-300"
        >
          ✕ unpin
        </button>
      </div>

      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            A · pinned
          </p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-400" title={pinned.sql}>
            {snippet(pinned.sql)}
          </p>
          <p className="tnum mt-0.5 font-mono text-[10px] text-zinc-600">
            {pinned.rowCount.toLocaleString()} rows
          </p>
        </div>
        <div className="rounded-lg border border-sky-400/25 bg-sky-400/[0.04] p-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-sky-300/70">
            B · current run
          </p>
          <p
            className="mt-0.5 truncate font-mono text-[11px] text-zinc-400"
            title={current?.sql ?? pinned.sql}
          >
            {snippet(current?.sql ?? "")}
          </p>
          <p className="tnum mt-0.5 font-mono text-[10px] text-zinc-600">
            {current ? `${current.rowCount.toLocaleString()} rows` : "waiting for a run…"}
          </p>
        </div>
      </div>

      {diff?.shapeMismatch ? (
        <p className="mt-2 font-mono text-[11px] text-zinc-500">
          🧩 the SELECT shape changed — pin again to compare the new shape
        </p>
      ) : (
        diff && (
          <>
            <p className="tnum mt-2.5 font-mono text-[11px] text-zinc-400">
              <span className="text-zinc-500">{diff.shared.toLocaleString()} shared</span>
              {" · "}
              <span className="text-rose-300">{diff.dropped.length.toLocaleString()} dropped</span>
              {" · "}
              <span className="text-emerald-300">{diff.added.length.toLocaleString()} added</span>
            </p>
            <div className="mt-1.5 flex flex-col gap-1">
              {diff.dropped.slice(0, MAX_SHOWN).map((r, i) => (
                <motion.p
                  key={`d-${i}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                  className="truncate rounded border border-rose-400/25 bg-rose-400/[0.07] px-1.5 py-0.5 font-mono text-[10px] text-rose-200/90"
                  title="in A, missing from B"
                >
                  − {r.map(cell).join(" · ")}
                </motion.p>
              ))}
              {diff.added.slice(0, MAX_SHOWN).map((r, i) => (
                <motion.p
                  key={`a-${i}`}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                  className="truncate rounded border border-emerald-400/25 bg-emerald-400/[0.07] px-1.5 py-0.5 font-mono text-[10px] text-emerald-200/90"
                  title="in B, missing from A"
                >
                  + {r.map(cell).join(" · ")}
                </motion.p>
              ))}
              {(diff.dropped.length > MAX_SHOWN || diff.added.length > MAX_SHOWN) && (
                <p className="font-mono text-[10px] text-zinc-600">
                  +{(Math.max(diff.dropped.length, diff.added.length) - MAX_SHOWN).toLocaleString()}{" "}
                  more — the tables above show the full picture
                </p>
              )}
              {diff.dropped.length === 0 && diff.added.length === 0 && (
                <p className="font-mono text-[11px] text-zinc-500">
                  🤷 identical results — try flipping the join type or a WHERE clause
                </p>
              )}
            </div>
          </>
        )
      )}
      <p className="mt-2 hidden items-center gap-1 font-mono text-[10px] text-zinc-600 sm:flex">
        <span aria-hidden>{tableEmoji("orders")}</span> classic experiment: pin, then flip JOIN to
        LEFT JOIN — the customers with no orders blink into view
      </p>
    </motion.div>
  );
}
