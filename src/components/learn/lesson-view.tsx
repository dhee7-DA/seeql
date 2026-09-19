"use client";

// Lesson view — four tabs: Learn (theory + diagrams), Deep dive (premium
// theory layer), Quiz (all MCQs), Practice (graded problems).
// Keyed remount per lesson resets tab state.

import { useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Brain,
  Check,
  CircleHelp,
  Cog,
  Database,
  Dumbbell,
  Lightbulb,
  Microscope,
  Sparkles,
  Split,
  TerminalSquare,
  TriangleAlert,
  X,
} from "lucide-react";
import type { Block, DeepBlock, Lesson } from "@/lib/curriculum/types";
import { reportMentorFailure } from "@/lib/mentor-context";
import { useProgress } from "@/lib/curriculum/progress";
import { LESSON_DRILLS } from "@/lib/curriculum/drills";
import { splitStatements } from "@/lib/sql-statements";
import { cn } from "@/lib/utils";
import { Rich, RichNodes } from "./rich";
import { SqlNodes } from "./sql-code";
import { Figure } from "./diagrams";
import { McqCard } from "./mcq";
import { ProblemCard } from "./problem-runner";
import { ResultGrid } from "./result-grid";
import { DrillYard } from "./drill-yard";
import { celebrate } from "./celebrate";

type Tab = "learn" | "deep" | "quiz" | "practice" | "drills";

const DIALECT_META: Record<string, { label: string; pill: string }> = {
  postgres: { label: "PostgreSQL", pill: "border-teal-400/40 bg-teal-400/10 text-teal-300" },
  mysql: { label: "MySQL", pill: "border-orange-400/40 bg-orange-400/10 text-orange-300" },
  sqlite: { label: "SQLite", pill: "border-violet-400/40 bg-violet-400/10 text-violet-300" },
};

function looksLikeRead(sql: string): boolean {
  return /^\s*(select|with)\b/i.test(stripLeadingComments(sql));
}

/** Drop whitespace + comment lines before the first real token. */
function stripLeadingComments(sql: string): string {
  return sql.replace(/^(\s*(?:--[^\n]*\n|\/\*[\s\S]*?\*\/)+\s*)*/, "");
}

// Callout family — one shared anatomy (floating accent rail, icon chip,
// uppercase label) with a distinct hue per semantic role:
//   tip emerald · warn amber · dialect teal · takeaway violet.
const CALLOUT_TONES = {
  tip: {
    box: "border-emerald-400/25 bg-emerald-400/[0.045]",
    rail: "bg-emerald-400/80",
    chip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    label: "text-emerald-300",
  },
  warn: {
    box: "border-amber-400/25 bg-amber-400/[0.045]",
    rail: "bg-amber-400/80",
    chip: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    label: "text-amber-300",
  },
  dialect: {
    box: "border-teal-400/25 bg-teal-400/[0.045]",
    rail: "bg-teal-400/80",
    chip: "border-teal-400/30 bg-teal-400/10 text-teal-300",
    label: "text-teal-300",
  },
  takeaway: {
    box: "border-violet-400/25 bg-violet-400/[0.045]",
    rail: "bg-violet-400/80",
    chip: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    label: "text-violet-300",
  },
} as const;

type CalloutTone = keyof typeof CALLOUT_TONES;

function Callout({
  tone,
  icon: Icon,
  label,
  children,
  pill,
}: {
  tone: CalloutTone;
  icon: typeof Lightbulb;
  label: string;
  children: React.ReactNode;
  pill?: React.ReactNode;
}) {
  const t = CALLOUT_TONES[tone];
  return (
    <div className={cn("sheen relative my-4 overflow-hidden rounded-lg border px-4 py-3", t.box)}>
      <span className={cn("absolute inset-y-2.5 left-0 w-[2.5px] rounded-full", t.rail)} />
      <div className="flex items-center gap-2">
        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md border", t.chip)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className={cn("text-[11px] font-semibold uppercase tracking-wider", t.label)}>{label}</span>
        {pill}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

interface SingleResult {
  ok: boolean;
  columns?: string[];
  rows?: unknown[][];
  changes?: number | null;
  error?: string;
}

interface BatchItemResult {
  ok: boolean;
  statementType?: string;
  columns?: string[];
  rows?: unknown[][];
  rowCount?: number;
  changes?: number | null;
  error?: string;
}

async function runInline(sql: string, sandbox: boolean): Promise<SingleResult> {
  const r = await fetch("/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql, sandbox }),
  });
  const out = (await r.json()) as SingleResult;
  if (out.error) {
    // Land the attempt on the mentor's desk — the AI Mentor chat picks it up.
    reportMentorFailure({ sql: sql.slice(0, 2000), error: out.error, note: null, source: "Lesson console" });
  }
  return out;
}

async function runBatch(sqls: string[]): Promise<{ ok: boolean; results?: BatchItemResult[]; error?: string }> {
  const r = await fetch("/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sqls }),
  });
  return (await r.json()) as { ok: boolean; results?: BatchItemResult[]; error?: string };
}

function CodeBlock({ sql, caption, runnable = true }: { sql: string; caption?: string; runnable?: boolean }) {
  const [result, setResult] = useState<SingleResult | null>(null);
  const [batch, setBatch] = useState<BatchItemResult[] | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Multi-statement blocks run as one sandboxed sequence — the statements see
  // each other's effects and nothing persists.
  const statements = useMemo(() => splitStatements(sql), [sql]);
  const isMulti = statements.length > 1;
  const isRead = looksLikeRead(sql);
  const canRun = runnable && sql.trim().length > 0;

  async function run() {
    if (busy) return;
    setBusy(true);
    setBatchError(null);
    try {
      if (isMulti) {
        setResult(null);
        setBatch(null);
        const r = await runBatch(statements);
        if (r.ok && r.results) setBatch(r.results);
        else setBatchError(r.error ?? "The sequence could not be run.");
      } else {
        setBatch(null);
        // Writes and DDL run sandboxed: the statement really executes,
        // then the whole thing is rolled back — the store stays untouched.
        setResult(await runInline(sql, !isRead));
      }
    } finally {
      setBusy(false);
    }
  }

  const affected = result?.ok && (result.rows ?? []).length === 0 && result.changes != null;
  const label = isMulti
    ? `Run all · ${statements.length} steps`
    : isRead ? "Run here" : "Run sandboxed";

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      {(caption || canRun) && (
        <div className="flex items-center justify-between border-b border-zinc-800 px-3.5 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{caption ?? "SQL"}</span>
          {canRun && (
            <button
              onClick={run}
              disabled={busy}
              className="rounded border border-emerald-400/40 px-2 py-0.5 font-mono text-[11px] text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-50"
            >
              {busy ? "running…" : label}
            </button>
          )}
        </div>
      )}
      <pre className="overflow-x-auto px-3.5 py-3 font-mono text-xs leading-relaxed text-zinc-300 thin-scrollbar"><SqlNodes text={sql} /></pre>
      {result && (
        <div className="border-t border-zinc-800 p-3">
          {result.ok ? (
            affected ? (
              <p className="font-mono text-xs text-zinc-400">
                <span className="text-emerald-300">{result.changes}</span> row(s) affected — sandboxed run, rolled back.
              </p>
            ) : (
              <ResultGrid data={{ columns: result.columns ?? [], rows: (result.rows ?? []) as never[] }} maxHeight="max-h-56" />
            )
          ) : (
            <p className="font-mono text-xs text-rose-300">{result.error}</p>
          )}
        </div>
      )}
      {batch && (
        <div className="divide-y divide-zinc-800/70 border-t border-zinc-800">
          {batch.map((item, i) => (
            <div key={i} className="p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded border border-zinc-700 bg-zinc-900 font-mono text-[10px] text-zinc-400">
                  {i + 1}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {item.statementType ?? "SQL"}
                </span>
                {item.ok ? (
                  <span className="font-mono text-[10px] text-emerald-300/90">
                    {item.rows && item.rows.length > 0
                      ? `${item.rows.length} row${item.rows.length === 1 ? "" : "s"}`
                      : item.changes != null ? `${item.changes} affected` : "ok"}
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-rose-300">error</span>
                )}
              </div>
              {item.ok ? (
                item.rows && item.rows.length > 0 ? (
                  <ResultGrid data={{ columns: item.columns ?? [], rows: item.rows as never[] }} maxHeight="max-h-44" />
                ) : (
                  <p className="font-mono text-xs text-zinc-400">
                    <span className="text-emerald-300">{item.changes}</span> row(s) affected — sandboxed run, rolled back.
                  </p>
                )
              ) : (
                <p className="font-mono text-xs text-rose-300">{item.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {batchError && (
        <div className="border-t border-zinc-800 p-3">
          <p className="font-mono text-xs text-rose-300">{batchError}</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- deep-dive block renderers ---------------- */

function MindCard({ text }: { text: string }) {
  return (
    <div className="sheen relative my-4 overflow-hidden rounded-lg border border-violet-400/25 bg-violet-400/[0.05] px-4 py-3.5">
      <span className="absolute inset-y-2.5 left-0 w-[2.5px] rounded-full bg-violet-400/80" />
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-violet-400/30 bg-violet-400/10 text-violet-300">
          <Brain className="h-3.5 w-3.5" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-300">Mental model</span>
      </div>
      <Rich text={text} className="mt-1.5 text-[15px] font-medium leading-7 text-zinc-100" />
    </div>
  );
}

function EngineCard({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="sheen relative my-4 overflow-hidden rounded-lg border border-teal-400/25 bg-teal-400/[0.04]">
      <span className="absolute inset-y-2.5 left-0 w-[2.5px] rounded-full bg-teal-400/80" />
      <div className="flex items-center gap-2 px-4 pt-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-teal-400/30 bg-teal-400/10 text-teal-300">
          <Cog className="h-3.5 w-3.5" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-300">Inside the engine</span>
        <span className="text-xs text-zinc-400">— {title}</span>
      </div>
      <ol className="space-y-0 px-4 pb-3.5 pt-2.5">
        {steps.map((s, i) => (
          <li key={i} className="relative flex gap-3 pb-2.5 last:pb-0">
            {i < steps.length - 1 && <span className="absolute left-[9px] top-5 h-[calc(100%-14px)] w-px bg-teal-400/25" />}
            <span className="mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border border-teal-400/40 bg-zinc-950 font-mono text-[10px] text-teal-300">
              {i + 1}
            </span>
            <Rich text={s} className="text-[13.5px] leading-6 text-zinc-300" />
          </li>
        ))}
      </ol>
    </div>
  );
}

function MythCard({ myth, truth }: { myth: string; truth: string }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-zinc-800">
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
        <div className="bg-rose-400/[0.05] px-4 py-3">
          <div className="flex items-center gap-1.5">
            <X className="h-3.5 w-3.5 text-rose-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-300">Myth</span>
          </div>
          <Rich text={myth} className="mt-1.5 text-[13.5px] leading-6 text-zinc-300" />
        </div>
        <div className="flex items-center bg-zinc-900/60 px-1">
          <Split className="h-3.5 w-3.5 rotate-180 text-zinc-600" />
        </div>
        <div className="bg-emerald-400/[0.05] px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Reality</span>
          </div>
          <Rich text={truth} className="mt-1.5 text-[13.5px] leading-6 text-zinc-200" />
        </div>
      </div>
    </div>
  );
}

function EdgeCard({ items }: { items: Array<{ c: string; r: string }> }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-zinc-800">
      <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        Edge-case gallery
      </div>
      <div className="divide-y divide-zinc-800/70">
        {items.map((e, i) => (
          <div key={i} className="grid grid-cols-[minmax(140px,38%)_1fr] gap-3 px-4 py-2.5 odd:bg-zinc-950/40">
            <code className="whitespace-pre-wrap font-mono text-xs leading-6 text-zinc-200">{e.c}</code>
            <Rich text={e.r} className="text-[13px] leading-6 text-zinc-400" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Renders a shared Block inside the deep tab (mirrors the learn-tab arms). */
function SharedBlock({ b }: { b: Block }) {
  switch (b.kind) {
    case "p":
      return <Rich text={b.text} className="text-[15px] leading-7 text-zinc-300" />;
    case "h":
      return (
        <div className="mb-3 mt-7 flex items-center gap-2.5">
          <span className="h-3.5 w-1 rounded-full bg-violet-400" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">{b.text}</span>
          <span className="h-px flex-1 bg-zinc-800/70" />
        </div>
      );
    case "bullets":
      return (
        <ul className="my-4 space-y-2.5">
          {b.items.map((t, bi) => (
            <li key={bi} className="flex gap-3">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-[2px] bg-violet-400/80" />
              <Rich text={t} className="text-[14px] leading-6 text-zinc-300" />
            </li>
          ))}
        </ul>
      );
    case "code":
      return <CodeBlock sql={b.sql} caption={b.caption} runnable={b.runnable} />;
    case "diagram":
      return <Figure id={b.figure} />;
    case "tip":
      return (
        <Callout tone="tip" icon={Lightbulb} label="Tip">
          <Rich text={b.text} className="text-sm leading-relaxed text-zinc-300" />
        </Callout>
      );
    case "table":
      return (
        <div className="my-4 overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900">
              <tr>
                {b.headers.map((h) => (
                  <th key={h} className="border-b border-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, ri) => (
                <tr key={ri} className="odd:bg-zinc-950/40">
                  {row.map((cell, ci) => (
                    <td key={ci} className={cn("border-b border-zinc-900 px-3.5 py-2 text-zinc-400", ci === 0 && "font-mono text-xs text-zinc-200")}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {b.caption && <p className="bg-zinc-900 px-3.5 py-2 text-[11px] text-zinc-500">{b.caption}</p>}
        </div>
      );
    default:
      return null;
  }
}

function DeepBlockView({ b }: { b: DeepBlock }) {
  switch (b.kind) {
    case "mind":
      return <MindCard text={b.text} />;
    case "engine":
      return <EngineCard title={b.title} steps={b.steps} />;
    case "myth":
      return <MythCard myth={b.myth} truth={b.truth} />;
    case "edge":
      return <EdgeCard items={b.items} />;
    default:
      return <SharedBlock b={b as Block} />;
  }
}

export function LessonView({ lesson, onBonusChecked }: { lesson: Lesson; onBonusChecked?: () => void }) {
  const [tab, setTab] = useState<Tab>("learn");
  const store = useProgress();
  const bonusRef = useRef(false);

  const quizStats = useMemo(() => {
    const first = lesson.mcqs.every((m) => store.mcqAttempts[m.id]?.firstTry);
    const allChecked = lesson.mcqs.every((m) => store.mcqAttempts[m.id] !== undefined);
    return { allChecked, first, allCorrect: lesson.mcqs.every((m) => store.mcqAttempts[m.id]?.correct) };
  }, [lesson, store.mcqAttempts]);

  const solvedCount = lesson.problems.filter((p) => store.xpEvents[`solve:${p.id}`] !== undefined).length;
  const complete = quizStats.allCorrect && solvedCount === lesson.problems.length;

  // lesson-scoped drills — only lessons with a keyword mapping get the tab
  const drillKeywords = LESSON_DRILLS[lesson.id];

  // lesson completion bonus — checked after quiz/practice events
  function checkBonus() {
    if (bonusRef.current) return;
    const s = useProgress.getState();
    const allCorrect = lesson.mcqs.every((m) => s.mcqAttempts[m.id]?.correct);
    const allSolved = lesson.problems.every((p) => s.xpEvents[`solve:${p.id}`] !== undefined);
    if (allCorrect && allSolved && s.awardXp(`lesson:${lesson.id}`, 50)) {
      celebrate({ kind: "level", title: `Lesson ${lesson.num} complete · +50 XP`, sub: lesson.title });
      s.markLessonDone(lesson.id);
      bonusRef.current = true;
      onBonusChecked?.();
    }
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof BookOpen; note: string }> = [
    { id: "learn", label: "Learn", icon: BookOpen, note: `${lesson.minutes} min` },
    ...(lesson.deep?.length
      ? [{ id: "deep" as Tab, label: "Deep dive", icon: Microscope, note: "go further" }]
      : []),
    { id: "quiz", label: "Quiz", icon: CircleHelp, note: `${lesson.mcqs.length} questions` },
    ...(drillKeywords
      ? [{ id: "drills" as Tab, label: "Drills", icon: Dumbbell, note: `${drillKeywords.length} keyword${drillKeywords.length > 1 ? "s" : ""}` }]
      : []),
    {
      id: "practice",
      label: "Practice",
      icon: TerminalSquare,
      note: `${solvedCount}/${lesson.problems.length} solved`,
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-zinc-500">LESSON {String(lesson.num).padStart(2, "0")}</span>
        {complete && (
          <span className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
            Complete · +50 XP claimed
          </span>
        )}
      </div>
      <h1 className="font-display mt-2 text-[1.7rem] font-semibold tracking-[-0.02em] text-zinc-50 sm:text-3xl">{lesson.title}</h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-400">{lesson.blurb}</p>

      <div className="sheen mt-5 flex gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors sm:flex-none sm:px-4",
              tab === t.id
                ? "bg-zinc-800 text-zinc-50 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)]"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <t.icon className={cn("h-3.5 w-3.5", tab === t.id && "text-emerald-300")} />
            {t.label}
            <span className="tnum hidden text-[10px] text-zinc-500 sm:inline">· {t.note}</span>
          </button>
        ))}
      </div>

      {tab === "learn" && (
        <div className="mt-5 max-w-3xl">
          {lesson.blocks.map((b, i) => {
            switch (b.kind) {
              case "p":
                return <Rich key={i} text={b.text} className="text-[15px] leading-7 text-zinc-300" />;
              case "h":
                return (
                  <div key={i} className="mb-3 mt-7 flex items-center gap-2.5">
                    <span className="h-3.5 w-1 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">{b.text}</span>
                    <span className="h-px flex-1 bg-zinc-800/70" />
                  </div>
                );
              case "bullets":
                return (
                  <ul key={i} className="my-4 space-y-2.5">
                    {b.items.map((t, bi) => (
                      <li key={bi} className="flex gap-3">
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-[2px] bg-emerald-400/80" />
                        <Rich text={t} className="text-[14px] leading-6 text-zinc-300" />
                      </li>
                    ))}
                  </ul>
                );
              case "steps":
                return (
                  <ol key={i} className="my-4 space-y-2.5">
                    {b.items.map((t, si) => (
                      <li key={si} className="flex gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 font-mono text-[10px] text-emerald-300">
                          {si + 1}
                        </span>
                        <Rich text={t} className="text-[14px] leading-6 text-zinc-300" />
                      </li>
                    ))}
                  </ol>
                );
              case "code":
                return <CodeBlock key={i} sql={b.sql} caption={b.caption} runnable={b.runnable} />;
              case "diagram":
                return <Figure key={i} id={b.figure} />;
              case "tip":
                return (
                  <Callout key={i} tone="tip" icon={Lightbulb} label="Tip">
                    <Rich text={b.text} className="text-sm leading-relaxed text-zinc-300" />
                  </Callout>
                );
              case "warn":
                return (
                  <Callout key={i} tone="warn" icon={TriangleAlert} label="Watch out">
                    <Rich text={b.text} className="text-sm leading-relaxed text-zinc-300" />
                  </Callout>
                );
              case "dialect": {
                const meta = DIALECT_META[b.db] ?? { label: b.db, pill: "border-zinc-700 text-zinc-300" };
                return (
                  <Callout
                    key={i}
                    tone="dialect"
                    icon={Database}
                    label="Dialect watch"
                    pill={
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", meta.pill)}>
                        {meta.label}
                      </span>
                    }
                  >
                    <Rich text={b.text} className="text-sm leading-relaxed text-zinc-300" />
                  </Callout>
                );
              }
              case "table":
                return (
                  <div key={i} className="my-4 overflow-hidden rounded-lg border border-zinc-800">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-900">
                        <tr>
                          {b.headers.map((h) => (
                            <th key={h} className="border-b border-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-300">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {b.rows.map((row, ri) => (
                          <tr key={ri} className="odd:bg-zinc-950/40">
                            {row.map((cell, ci) => (
                              <td key={ci} className={cn("border-b border-zinc-900 px-3.5 py-2 text-zinc-400", ci === 0 && "font-mono text-xs text-zinc-200")}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {b.caption && <p className="bg-zinc-900 px-3.5 py-2 text-[11px] text-zinc-500">{b.caption}</p>}
                  </div>
                );
              default:
                return null;
            }
          })}
          {lesson.takeaway && (
            <Callout tone="takeaway" icon={Sparkles} label="In one sentence">
              <p className="text-[15px] font-medium leading-7 text-zinc-100">
                <RichNodes text={lesson.takeaway} />
              </p>
            </Callout>
          )}
          <div className="sheen mt-6 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <p className="text-sm text-zinc-400">
              Ready to prove it? Take the quiz, then solve the practice queries.
            </p>
            <button
              onClick={() => setTab("quiz")}
              className="btn-glow rounded-md bg-emerald-400 px-3.5 py-1.5 text-xs font-medium text-[#052e1c] transition-colors hover:bg-emerald-300"
            >
              Take the quiz →
            </button>
          </div>
        </div>
      )}

      {tab === "deep" && lesson.deep && (
        <div className="mt-5 max-w-3xl">
          <p className="mb-1 text-sm text-zinc-500">
            The engine's secrets, the mental models, the traps. This is the layer that separates
            people who type SQL from people who read it.
          </p>
          {lesson.deep.map((b, i) => (
            <DeepBlockView key={i} b={b} />
          ))}
          <div className="sheen mt-6 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <p className="text-sm text-zinc-400">Depth banked. Now make it stick — take the quiz.</p>
            <button
              onClick={() => setTab("quiz")}
              className="btn-glow rounded-md bg-emerald-400 px-3.5 py-1.5 text-xs font-medium text-[#052e1c] transition-colors hover:bg-emerald-300"
            >
              Take the quiz →
            </button>
          </div>
        </div>
      )}

      {tab === "quiz" && (
        <div className="mt-5 max-w-3xl space-y-4">
          <p className="text-sm text-zinc-500">
            {quizStats.allChecked
              ? quizStats.first
                ? "Flawless — every answer right on the first try."
                : "Quiz attempted — revisit anything you missed, then practice."
              : `${lesson.mcqs.length} questions. +5 XP each, +3 bonus for first-try answers.`}
          </p>
          {lesson.mcqs.map((m) => (
            <McqCard key={m.id} mcq={m} onAnswered={checkBonus} />
          ))}
        </div>
      )}

      {tab === "drills" && drillKeywords && (
        <div className="mt-5">
          <DrillYard scopeId={lesson.id} keywords={drillKeywords} />
        </div>
      )}

      {tab === "practice" && (
        <div className="mt-5 max-w-3xl space-y-5">
          <p className="text-sm text-zinc-500">
            Write real SQL against the live storefront database. Your result is compared with the reference answer —
            {solvedCount}/{lesson.problems.length} solved so far.
          </p>
          {lesson.problems.map((p, i) => (
            <ProblemCard key={p.id} problem={p} index={i + 1} onSolved={checkBonus} />
          ))}
        </div>
      )}
    </div>
  );
}
