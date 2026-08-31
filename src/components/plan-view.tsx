"use client";

// EXPLAIN QUERY PLAN renderer: rows come back flat (id/parent) — build the
// tree client-side and render it with step icons.

import { Database, Search, TreePalm, Workflow } from "lucide-react";
import type { PlanRow } from "@/lib/sql-types";

function buildTree(rows: PlanRow[]) {
  const byId = new Map<number, PlanRow & { children: PlanRow[] }>();
  for (const r of rows) byId.set(r.id, { ...r, children: [] });
  const roots: Array<PlanRow & { children: PlanRow[] }> = [];
  for (const r of byId.values()) {
    if (r.parent !== null && byId.has(r.parent)) byId.get(r.parent)!.children.push(r);
    else roots.push(r);
  }
  return roots;
}

function PlanNode({ node, depth }: { node: PlanRow & { children?: PlanRow[] }; depth: number }) {
  const detail = node.detail;
  let Icon = Workflow;
  let tone = "text-zinc-400";
  if (/^SEARCH/i.test(detail)) {
    Icon = Search;
    tone = "text-emerald-400";
  } else if (/^SCAN/i.test(detail)) {
    Icon = Database;
    tone = "text-amber-400";
  } else if (/SUBQUERY|SCALAR|CORRELATED/i.test(detail)) {
    Icon = TreePalm;
    tone = "text-violet-400";
  }

  return (
    <div>
      <div
        className="flex items-start gap-2 rounded-lg border border-zinc-800/70 bg-zinc-900/60 px-3 py-2"
        style={{ marginLeft: depth * 22 }}
      >
        <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${tone}`} />
        <div className="min-w-0">
          <p className="font-mono text-xs leading-relaxed break-words text-zinc-200">{detail}</p>
          {depth === 0 && (node.children?.length ?? 0) === 0 && (
            <p className="mt-0.5 text-[10px] tracking-wide text-zinc-600 uppercase">
              step {node.id}
            </p>
          )}
        </div>
      </div>
      {node.children?.map((c) => (
        <div key={c.id} className="mt-1.5 mb-1.5">
          <PlanNode node={c} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
}

export function PlanView({ rows }: { rows: PlanRow[] }) {
  const tree = buildTree(rows);
  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">
        SQLite&apos;s query plan — the access paths the engine chose.{" "}
        <span className="text-amber-400/90">SCAN</span> reads a whole table,{" "}
        <span className="text-emerald-400/90">SEARCH</span> uses an index,{" "}
        <span className="text-rose-300/90">SEARCH … USING INTEGER PRIMARY KEY</span> is a direct
        row lookup.
      </p>
      <div className="space-y-1.5">
        {tree.map((r) => (
          <PlanNode key={r.id} node={r} depth={0} />
        ))}
      </div>
    </div>
  );
}
