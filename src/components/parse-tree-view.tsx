"use client";

// Collapsible AST (parse tree) renderer with color-coded node types.

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { TreeNode } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<string, { badge: string; label: string }> = {
  statement: { badge: "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30", label: "" },
  clause: { badge: "bg-violet-400/12 text-violet-300", label: "" },
  table: { badge: "bg-teal-400/12 text-teal-300", label: "" },
  cte: { badge: "bg-teal-400/12 text-teal-300", label: "" },
  column_ref: { badge: "bg-fuchsia-400/12 text-fuchsia-300", label: "" },
  binary_expr: { badge: "bg-amber-400/12 text-amber-300", label: "" },
  unary_expr: { badge: "bg-amber-400/12 text-amber-300", label: "" },
  aggr_func: { badge: "bg-rose-400/12 text-rose-300", label: "" },
  function: { badge: "bg-rose-400/12 text-rose-300", label: "" },
  window_func: { badge: "bg-rose-400/12 text-rose-300", label: "" },
  case: { badge: "bg-rose-400/12 text-rose-300", label: "" },
  cast: { badge: "bg-rose-400/12 text-rose-300", label: "" },
  literal: { badge: "bg-zinc-700/50 text-zinc-300", label: "" },
  expr: { badge: "bg-zinc-700/40 text-zinc-300", label: "" },
};

function styleFor(type: string): string {
  return TYPE_STYLES[type]?.badge ?? "bg-zinc-800/70 text-zinc-300";
}

const DEFAULT_COLLAPSED_BELOW = 2; // expand root + first two levels

function TreeEdge({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-3 border-l border-dashed border-zinc-700/70 pl-4">{children}</div>
  );
}

function TreeRow({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = useState(depth < DEFAULT_COLLAPSED_BELOW);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div className="flex items-start gap-1 py-0.5">
        <button
          type="button"
          onClick={() => hasChildren && setOpen((v) => !v)}
          aria-label={hasChildren ? (open ? `Collapse ${node.label}` : `Expand ${node.label}`) : node.label}
          className={cn(
            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded",
            hasChildren ? "hover:bg-zinc-800" : "cursor-default",
          )}
          tabIndex={hasChildren ? 0 : -1}
        >
          {hasChildren ? (
            <ChevronRight
              className={cn(
                "h-3 w-3 text-zinc-500 transition-transform",
                open && "rotate-90",
              )}
            />
          ) : (
            <span className="h-1 w-1 rounded-full bg-zinc-600" />
          )}
        </button>
        <div className="min-w-0">
          <span
            className={cn(
              "inline-block max-w-full rounded px-1.5 py-0.5 align-top font-mono text-xs break-words",
              styleFor(node.type),
              node.type === "statement" && "font-bold",
            )}
            title={node.type !== node.label ? node.type : undefined}
          >
            {node.label}
          </span>
          {node.detail && (
            <span className="ml-2 font-mono text-[10px] text-zinc-500">{node.detail}</span>
          )}
        </div>
      </div>
      {hasChildren && open && (
        <TreeEdge>
          {node.children.map((c) => (
            <TreeRow key={c.id} node={c} depth={depth + 1} />
          ))}
        </TreeEdge>
      )}
    </div>
  );
}

export function ParseTreeView({ tree }: { tree: TreeNode }) {
  const total = useMemo(() => {
    let n = 0;
    const walk = (node: TreeNode) => {
      n++;
      node.children.forEach(walk);
    };
    walk(tree);
    return n;
  }, [tree]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">
        The abstract syntax tree the parser built from your query — {total} node
        {total === 1 ? "" : "s"}. Click any branch to fold it.
      </p>
      <div className="thin-scrollbar max-h-[520px] overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
        <TreeRow node={tree} depth={0} />
      </div>
      {/* legend */}
      <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500">
        {[
          ["statement", "statement"],
          ["clause", "clause"],
          ["table", "table / CTE"],
          ["column_ref", "column"],
          ["binary_expr", "operator"],
          ["aggr_func", "function"],
        ].map(([type, label]) => (
          <span key={type} className="inline-flex items-center gap-1.5">
            <span className={cn("rounded px-1.5 py-0.5 font-mono", styleFor(type))}>a</span>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
