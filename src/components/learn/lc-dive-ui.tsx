"use client";

// The LeetCode band's enhanced teaching layer — colourful, diagram-rich
// rendering for every deep-dive. Built on the same pastel clause families
// as sql-code.tsx (SELECT violet · JOIN blue · WHERE rose · GROUP amber ·
// ORDER orange · WITH fuchsia · CASE lime · window sky), so the visual
// language a learner meets in the lessons carries over 1:1 into the band.
//
// Everything here is a pure function of the dive data: every problem gets the
// upgraded UI with zero content-file edits.

import { Fragment, useState, type ReactNode } from "react";
import {
  Check,
  Copy,
  Database,
  Footprints,
  Lightbulb,
  MessageCircleQuestion,
  Route,
  TriangleAlert,
  Waypoints,
  Zap,
} from "lucide-react";
import { SqlNodes } from "./sql-code";
import { cn } from "@/lib/utils";
import type { LcDifficulty } from "@/lib/leetcode/types";

/* ------------------------------------------------------------------ */
/* Colourful prose — SQL keywords light up inside body text            */
/* ------------------------------------------------------------------ */

type Tok = { t: string; c?: string };

// Case-SENSITIVE on purpose: the content convention writes SQL in caps, so
// uppercase matching never trips English words ("In", "For", "End").
/** Tokenize prose into spans: UPPERCASE SQL keywords, 'literals', numbers. */
function proseTokens(text: string): Tok[] {
  const KEY =
    /\b(GROUP BY|ORDER BY|PARTITION BY|PRIMARY KEY|FOREIGN KEY|INNER JOIN|LEFT JOIN|RIGHT JOIN|CROSS JOIN|FULL JOIN|SELECT DISTINCT|SELECT|FROM|JOIN|INNER|LEFT|RIGHT|OUTER|CROSS|ON|USING|WHERE|AND|OR|NOT|IN|LIKE|GLOB|BETWEEN|EXISTS|IS|NULL|GROUP|BY|HAVING|ORDER|LIMIT|OFFSET|ASC|DESC|WITH RECURSIVE|WITH|RECURSIVE|UNION|EXCEPT|INTERSECT|CASE|WHEN|THEN|ELSE|END|OVER|PARTITION|ROWS|RANGE|CAST|AS)\b/g;
  const FUN =
    /\b(COUNT|SUM|AVG|MIN|MAX|ROUND|COALESCE|IFNULL|NULLIF|IIF|LENGTH|LOWER|UPPER|SUBSTR|SUBSTRING|TRIM|REPLACE|INSTR|DATE|TIME|DATETIME|STRFTIME|JULIANDAY|ROW_NUMBER|RANK|DENSE_RANK|NTILE|PERCENT_RANK|LAG|LEAD|FIRST_VALUE|LAST_VALUE|TOTAL|GROUP_CONCAT)\b(?=\s*\()/g;
  // Literal spans — apostrophe-safe for prose: the char before the opening
  // quote must not be a word character (skips possessives/contractions like
  // "employee's" / "don't"), the span is short, and the closing quote must
  // not run into a letter.
  const LIT = /(?<![\w'])'[^'\n]{1,32}'(?!\w)/g;
  const NUM = /\b\d+(?:\.\d+)?\b/g;

  // Collect typed matches, sort by position, drop overlaps (keywords win).
  type Hit = { s: number; e: number; cls: string; text: string };
  const hits: Hit[] = [];
  const add = (re: RegExp, cls: string) => {
    for (const m of text.matchAll(re)) {
      const s = m.index ?? 0;
      hits.push({ s, e: s + m[0].length, cls, text: m[0] });
    }
  };
  add(LIT, "rounded-sm bg-pink-400/10 px-1 font-mono text-[0.92em] text-pink-300");
  add(KEY, "rounded-sm font-mono text-[0.92em] font-medium text-sky-300");
  add(FUN, "rounded-sm font-mono text-[0.92em] font-medium text-amber-300");
  add(NUM, "tnum font-mono text-[0.92em] text-orange-300");
  // Per-keyword hue remap after collection (families mirror sql-code.tsx).
  const hue = (w: string): string | null => {
    if (/^(SELECT|DISTINCT|AS)$/.test(w)) return "text-violet-300";
    if (/^(FROM|JOIN|INNER|LEFT|RIGHT|OUTER|CROSS|ON|USING|(INNER|LEFT|RIGHT|CROSS|FULL) JOIN)$/.test(w))
      return "text-blue-300";
    if (/^(WHERE|AND|OR|NOT|IN|LIKE|GLOB|BETWEEN|EXISTS|IS|NULL)$/.test(w)) return "text-rose-300";
    if (/^(GROUP BY|GROUP|HAVING)$/.test(w)) return "text-amber-300";
    if (/^(ORDER BY|ORDER|BY|LIMIT|OFFSET|ASC|DESC)$/.test(w)) return "text-orange-300";
    if (/^(WITH RECURSIVE|WITH|RECURSIVE|UNION|EXCEPT|INTERSECT|ALL)$/.test(w)) return "text-fuchsia-300";
    if (/^(CASE|WHEN|THEN|ELSE|END)$/.test(w)) return "text-lime-300";
    if (/^(OVER|PARTITION BY|PARTITION|ROWS|RANGE)$/.test(w)) return "text-sky-300";
    return null;
  };
  hits.sort((a, b) => a.s - b.s || b.e - a.e);
  const out: Tok[] = [];
  let last = 0;
  for (const h of hits) {
    if (h.s < last) continue; // overlap — earlier (longer) hit wins
    if (h.s > last) out.push({ t: text.slice(last, h.s) }); // plain gap between hits
    const w = h.text.toUpperCase();
    const remap = hue(w);
    out.push({ t: h.text, c: remap ? `${remap} font-mono text-[0.92em] font-medium` : h.cls });
    last = h.e;
  }
  if (last < text.length) out.push({ t: text.slice(last) });
  // Merge into plain runs for React keys: tokens already ordered.
  return out;
}

/** Body paragraph with SQL keywords, 'literals' and numbers colourized. */
export function SqlProse({ text, className }: { text: string; className?: string }) {
  const toks = proseTokens(text);
  return (
    <span className={className}>
      {toks.map((t, i) =>
        t.c ? (
          <span key={i} className={t.c}>
            {t.t}
          </span>
        ) : (
          <Fragment key={i}>{t.t}</Fragment>
        ),
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Code block — highlighted, labelled, copyable                        */
/* ------------------------------------------------------------------ */

/** Python source → coloured spans (the non-SQL Big-300 dives). */
export function PyNodes({ text }: { text: string }) {
  const RE =
    /(#[^\n]*)|('''[\s\S]*?'''|"""[\s\S]*?"""|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(\b(?:def|return|for|while|if|elif|else|import|from|class|None|True|False|and|or|not|in|is|lambda|yield|break|continue|pass|try|except|raise|with|as|global|assert)\b)/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(RE)) {
    const s = m.index ?? 0;
    if (s > last) nodes.push(<Fragment key={k++}>{text.slice(last, s)}</Fragment>);
    const [tok, com, str, num, kw] = m;
    if (com) nodes.push(<span key={k++} className="italic text-zinc-500">{tok}</span>);
    else if (str) nodes.push(<span key={k++} className="text-pink-300">{tok}</span>);
    else if (num) nodes.push(<span key={k++} className="tnum text-orange-300">{tok}</span>);
    else if (kw) nodes.push(<span key={k++} className="font-medium text-violet-300">{tok}</span>);
    last = s + tok.length;
  }
  if (last < text.length) nodes.push(<Fragment key={k++}>{text.slice(last)}</Fragment>);
  return <>{nodes}</>;
}

export type CodeTone = "solution" | "ddl" | "seed" | "python" | "verify";

const TONE_META: Record<CodeTone, { label: string; dot: string; chip: string }> = {
  solution: { label: "Solution — SQLite", dot: "bg-emerald-400", chip: "text-emerald-300" },
  ddl: { label: "DDL — the sandbox schema", dot: "bg-cyan-400", chip: "text-cyan-300" },
  seed: { label: "Sample data", dot: "bg-amber-400", chip: "text-amber-300" },
  python: { label: "Solution — Python 3", dot: "bg-emerald-400", chip: "text-emerald-300" },
  verify: { label: "Verification query", dot: "bg-sky-400", chip: "text-sky-300" },
};

export function DiveCodeBlock({ code, tone }: { code: string; tone: CodeTone }) {
  const [copied, setCopied] = useState(false);
  const meta = TONE_META[tone];
  const copy = () => {
    navigator.clipboard?.writeText(code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => undefined,
    );
  };
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-3 py-1.5">
        <span className="flex items-center gap-2">
          <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
          <span className={cn("font-mono text-[10px] uppercase tracking-wider", meta.chip)}>
            {meta.label}
          </span>
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="rounded-md p-1 text-zinc-500 hover:text-emerald-300"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="thin-scrollbar overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-zinc-200">
        {tone === "python" ? <PyNodes text={code} /> : <SqlNodes text={code} />}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section header — accent bar + tinted icon tile                      */
/* ------------------------------------------------------------------ */

export type Tone = "sky" | "violet" | "fuchsia" | "rose" | "cyan" | "emerald" | "amber";

export const TONE: Record<Tone, { bar: string; tile: string; text: string }> = {
  sky: {
    bar: "bg-gradient-to-r from-sky-400/70 via-sky-400/20 to-transparent",
    tile: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    text: "text-sky-300",
  },
  violet: {
    bar: "bg-gradient-to-r from-violet-400/70 via-violet-400/20 to-transparent",
    tile: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    text: "text-violet-300",
  },
  fuchsia: {
    bar: "bg-gradient-to-r from-fuchsia-400/70 via-fuchsia-400/20 to-transparent",
    tile: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300",
    text: "text-fuchsia-300",
  },
  rose: {
    bar: "bg-gradient-to-r from-rose-400/70 via-rose-400/20 to-transparent",
    tile: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    text: "text-rose-300",
  },
  cyan: {
    bar: "bg-gradient-to-r from-cyan-400/70 via-cyan-400/20 to-transparent",
    tile: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    text: "text-cyan-300",
  },
  emerald: {
    bar: "bg-gradient-to-r from-emerald-400/70 via-emerald-400/20 to-transparent",
    tile: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    text: "text-emerald-300",
  },
  amber: {
    bar: "bg-gradient-to-r from-amber-400/70 via-amber-400/20 to-transparent",
    tile: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    text: "text-amber-300",
  },
};

export function SectionHead({
  tone,
  icon,
  title,
  kicker,
  right,
}: {
  tone: Tone;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  kicker?: string;
  right?: ReactNode;
}) {
  const t = TONE[tone];
  const Icon = icon;
  return (
    <div className="mb-3">
      <div className={cn("mb-2.5 h-px w-full", t.bar)} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2.5">
          <span aria-hidden className={cn("flex h-7 w-7 items-center justify-center rounded-lg border", t.tile)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-zinc-100">{title}</span>
            {kicker && (
              <span className={cn("font-mono text-[9.5px] uppercase tracking-[0.14em]", t.text)}>{kicker}</span>
            )}
          </span>
        </span>
        {right}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Teaching-shape blocks                                               */
/* ------------------------------------------------------------------ */

export function ExampleCards({ examples }: { examples: Array<{ input: string; output: string; explanation?: string }> }) {
  return (
    <div className="space-y-2">
      {examples.map((ex, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40">
          <div className="grid gap-px bg-zinc-800/60 md:grid-cols-2">
            <div className="bg-zinc-900/60 p-3">
              <p className="mb-1 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-sky-300">
                <Database className="h-3 w-3" /> Input
              </p>
              <p className="font-mono text-[11.5px] leading-relaxed text-zinc-300">
                <SqlProse text={ex.input} />
              </p>
            </div>
            <div className="bg-zinc-900/60 p-3">
              <p className="mb-1 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-emerald-300">
                <Check className="h-3 w-3" /> Output
              </p>
              <p className="font-mono text-[11.5px] leading-relaxed text-zinc-200">
                <SqlProse text={ex.output} />
              </p>
            </div>
          </div>
          {ex.explanation && (
            <p className="border-t border-zinc-800/80 bg-zinc-950/40 p-3 text-[12px] leading-relaxed text-zinc-400">
              <Lightbulb className="mr-1.5 inline h-3 w-3 text-amber-300" />
              <SqlProse text={ex.explanation} />
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function ConstraintList({ items }: { items: string[] }) {
  return (
    <ol className="grid gap-1.5 sm:grid-cols-1">
      {items.map((c, i) => (
        <li key={i} className="flex items-start gap-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2">
          <span className="mt-px flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-400/10 px-1.5 font-mono text-[10px] text-cyan-300">
            {i + 1}
          </span>
          <span className="text-[12.5px] leading-relaxed text-zinc-300">
            <SqlProse text={c} />
          </span>
        </li>
      ))}
    </ol>
  );
}

const RUNG_META = [
  { chip: "Rung 1 · brute force", icon: Footprints, accent: "border-l-rose-400/60", chipCls: "text-rose-300" },
  { chip: "Rung 2 · the pattern", icon: Waypoints, accent: "border-l-amber-400/60", chipCls: "text-amber-300" },
  { chip: "Rung 3 · the optimal idea", icon: Zap, accent: "border-l-emerald-400/60", chipCls: "text-emerald-300" },
];

export function LadderRungs({ rungs }: { rungs: Array<{ title: string; body: string }> }) {
  return (
    <ol className="space-y-2.5">
      {rungs.map((r, i) => {
        const meta = RUNG_META[i] ?? RUNG_META[RUNG_META.length - 1];
        const Icon = meta.icon;
        return (
          <li key={i} className={cn("rounded-r-lg border-l-2 bg-zinc-900/40 py-2.5 pl-3 pr-3", meta.accent)}>
            <p className="flex flex-wrap items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-zinc-500" />
              <span className={cn("font-mono text-[9.5px] uppercase tracking-[0.14em]", meta.chipCls)}>{meta.chip}</span>
              <span className="text-sm font-semibold text-zinc-100">{r.title}</span>
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
              <SqlProse text={r.body} />
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export function TrapList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((e, i) => (
        <li key={i} className="flex items-start gap-2 rounded-lg bg-rose-400/[0.05] px-2.5 py-1.5">
          <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0 text-rose-400" />
          <span className="text-[12px] leading-relaxed text-zinc-300">
            <SqlProse text={e} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function FollowUpList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((f, i) => (
        <li key={i} className="flex items-start gap-2 rounded-lg bg-sky-400/[0.05] px-2.5 py-1.5">
          <MessageCircleQuestion className="mt-0.5 h-3 w-3 shrink-0 text-sky-400" />
          <span className="text-[12px] leading-relaxed text-zinc-300">
            <SqlProse text={f} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* DiffDot — difficulty marker shared across the LC band               */
/* ------------------------------------------------------------------ */

const DIFF_DOT: Record<LcDifficulty, string> = {
  Easy: "bg-emerald-400",
  Medium: "bg-amber-400",
  Hard: "bg-rose-400",
};

export function DiffDot({ d }: { d: LcDifficulty }) {
  return <span aria-hidden className={cn("h-2 w-2 shrink-0 rounded-full", DIFF_DOT[d])} />;
}
