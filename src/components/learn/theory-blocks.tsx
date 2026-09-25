"use client";

// Renders curriculum theory blocks: paragraphs with inline `code`/**bold**,
// highlighted runnable SQL snippets, data tables and callout cards.

import { Fragment, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Info,
  Lightbulb,
  Loader2,
  Play,
  PlayCircle,
  ShieldAlert,
} from "lucide-react";
import { tokenizeSql } from "@/components/sql-editor";
import { Diagram } from "@/components/learn/diagrams/registry";
import { ResultGrid } from "@/components/learn/result-grid";
import { looksLikeRead, runSql } from "@/lib/curriculum/check";
import type { ExecResponse } from "@/lib/sql-types";
import type { TheoryBlock } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";

/* ---------- inline mini-markdown: `code` and **bold** ---------- */

const INLINE_RE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;

export function renderInline(text: string): ReactNode {
  const parts = text.split(INLINE_RE).filter((p) => p !== "" && p !== undefined);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="[overflow-wrap:anywhere] rounded bg-zinc-800/90 px-1.5 py-0.5 font-mono text-[0.85em] text-emerald-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="text-zinc-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/* ---------- highlighted read-only SQL block ---------- */

function SqlCodeBlock({
  sql,
  caption,
  tryIt,
  onTry,
}: {
  sql: string;
  caption?: string;
  tryIt?: boolean;
  onTry?: (sql: string) => void;
}) {
  const tokens = tokenizeSql(sql);
  const runnable = looksLikeRead(sql);
  const [run, setRun] = useState<{ busy: boolean; res: ExecResponse | null }>({
    busy: false,
    res: null,
  });

  const doRun = async () => {
    setRun({ busy: true, res: null });
    try {
      const res = await runSql(sql);
      setRun({ busy: false, res });
    } catch {
      setRun({ busy: false, res: { ok: false, error: "Could not reach the server — try again." } });
    }
  };

  return (
    <figure className="sql-card overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-950/50 px-3 py-1.5">
        <figcaption className="truncate text-[11px] text-zinc-500">
          {caption ?? "SQL"}
        </figcaption>
        <div className="flex shrink-0 items-center gap-1.5">
          {runnable && (
            <button
              type="button"
              onClick={doRun}
              disabled={run.busy}
              className="inline-flex items-center gap-1 rounded-md border border-teal-400/30 bg-teal-400/10 px-2 py-0.5 text-[11px] font-medium text-teal-300 transition-colors hover:bg-teal-400/20 disabled:opacity-60"
              aria-label="Run this query against the sandbox database right here"
            >
              {run.busy ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <PlayCircle className="h-3 w-3" />
              )}
              Run here
            </button>
          )}
          {tryIt && onTry && (
            <button
              type="button"
              onClick={() => onTry(sql)}
              className="inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300 transition-colors hover:bg-emerald-400/20"
              aria-label="Run this example in the playground"
            >
              <Play className="h-3 w-3" />
              Playground
            </button>
          )}
        </div>
      </div>
      <pre className="thin-scrollbar overflow-x-auto p-3 font-mono text-xs leading-relaxed text-zinc-300">
        {tokens.map((t, i) => (
          <span key={i} className={t.cls}>
            {t.text}
          </span>
        ))}
      </pre>
      {run.res &&
        (run.res.ok ? (
          <div className="border-t border-zinc-800/80 bg-zinc-950/40 p-2.5">
            <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
              live result · {run.res.rowCount} row{run.res.rowCount === 1 ? "" : "s"}
            </p>
            <ResultGrid
              data={{ columns: run.res.columns, rows: run.res.rows }}
              maxHeight="max-h-48"
            />
          </div>
        ) : (
          <p className="border-t border-rose-400/20 bg-rose-400/5 px-3 py-2 text-[11px] text-rose-200">
            {run.res.error}
          </p>
        ))}
    </figure>
  );
}

/* ---------- callout ---------- */

const NOTE_STYLES: Record<
  Extract<TheoryBlock, { kind: "note" }>["tone"],
  { icon: typeof Info; border: string; bg: string; text: string; iconColor: string }
> = {
  tip: {
    icon: Lightbulb,
    border: "border-emerald-400/25",
    bg: "bg-emerald-400/5",
    text: "text-emerald-100/90",
    iconColor: "text-emerald-400",
  },
  pitfall: {
    icon: ShieldAlert,
    border: "border-amber-400/25",
    bg: "bg-amber-400/5",
    text: "text-amber-100/90",
    iconColor: "text-amber-400",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-rose-400/25",
    bg: "bg-rose-400/5",
    text: "text-rose-100/90",
    iconColor: "text-rose-400",
  },
  info: {
    icon: Info,
    border: "border-teal-400/25",
    bg: "bg-teal-400/5",
    text: "text-teal-100/90",
    iconColor: "text-teal-400",
  },
};

/* ---------- main renderer ---------- */

export function TheoryBlocks({
  blocks,
  onTry,
}: {
  blocks: TheoryBlock[];
  onTry?: (sql: string) => void;
}) {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "p":
            return (
              <p key={i} className="text-sm leading-relaxed text-zinc-300">
                {renderInline(b.text)}
              </p>
            );
          case "h":
            return (
              <h3
                key={i}
                className="pt-2 text-sm font-semibold tracking-wide text-zinc-100"
              >
                {b.text}
              </h3>
            );
          case "list": {
            const Item = "li";
            return (
              <ol
                key={i}
                className={cn(
                  "space-y-1.5 pl-1 text-sm leading-relaxed text-zinc-300",
                  b.ordered ? "list-none" : "list-disc",
                )}
              >
                {(b.ordered
                  ? b.items.map((item, j) => `${j + 1}. ${item}`)
                  : b.items
                ).map((item, j) => {
                  // ordered lists: render number badge manually for nicer look
                  const m = b.ordered && item.match(/^(\d+)\.\s([\s\S]*)$/);
                  return (
                    <Item key={j} className="flex gap-2">
                      {m ? (
                        <>
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 font-mono text-[11px] font-bold text-emerald-300">
                            {m[1]}
                          </span>
                          <span>{renderInline(m[2])}</span>
                        </>
                      ) : (
                        <span className="pl-5">{renderInline(item)}</span>
                      )}
                    </Item>
                  );
                })}
              </ol>
            );
          }
          case "code":
            return (
              <SqlCodeBlock
                key={i}
                sql={b.sql}
                caption={b.caption}
                tryIt={b.tryIt}
                onTry={onTry}
              />
            );
          case "table":
            return (
              <figure
                key={i}
                className="thin-scrollbar overflow-x-auto rounded-xl border border-zinc-800"
              >
                <table className="w-full min-w-[480px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-zinc-900">
                      {b.headers.map((h, j) => (
                        <th
                          key={j}
                          className="border-b border-zinc-800 px-3 py-2 font-semibold text-zinc-300"
                        >
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, j) => (
                      <tr key={j} className="bg-zinc-950/40 odd:bg-zinc-900/30">
                        {row.map((cell, k) => (
                          <td
                            key={k}
                            className="border-b border-zinc-800/60 px-3 py-2 align-top text-zinc-400"
                          >
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {b.caption && (
                  <figcaption className="border-t border-zinc-800/60 bg-zinc-950/60 px-3 py-1.5 text-[11px] text-zinc-500">
                    {b.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "diagram":
            return <Diagram key={i} figure={b.figure} />;
          case "note": {
            const style = NOTE_STYLES[b.tone];
            const Icon = style.icon;
            return (
              <aside
                key={i}
                className={cn("rounded-xl border p-3.5", style.border, style.bg)}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4 shrink-0", style.iconColor)} />
                  <span className="text-xs font-semibold text-zinc-100">
                    {b.title}
                  </span>
                </div>
                <p className={cn("mt-1.5 text-xs leading-relaxed", style.text)}>
                  {renderInline(b.text)}
                </p>
              </aside>
            );
          }
        }
      })}
    </div>
  );
}
