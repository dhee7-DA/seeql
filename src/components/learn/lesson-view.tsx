"use client";

// Lesson view — three tabs: Learn (theory + diagrams), Quiz (all MCQs),
// Practice (graded problems). Keyed remount per lesson resets tab state.

import { useMemo, useRef, useState } from "react";
import { BookOpen, CircleHelp, TerminalSquare } from "lucide-react";
import type { Lesson } from "@/lib/curriculum/types";
import { useProgress } from "@/lib/curriculum/progress";
import { cn } from "@/lib/utils";
import { Rich } from "./rich";
import { Figure } from "./diagrams";
import { McqCard } from "./mcq";
import { ProblemCard } from "./problem-runner";
import { ResultGrid } from "./result-grid";
import { celebrate } from "./celebrate";

type Tab = "learn" | "quiz" | "practice";

const DIALECT_META: Record<string, { label: string; pill: string }> = {
  postgres: { label: "PostgreSQL", pill: "border-sky-400/40 bg-sky-400/10 text-sky-300" },
  mysql: { label: "MySQL", pill: "border-orange-400/40 bg-orange-400/10 text-orange-300" },
  sqlite: { label: "SQLite", pill: "border-violet-400/40 bg-violet-400/10 text-violet-300" },
};

function looksLikeRead(sql: string): boolean {
  return /^\s*(select|with)\b/i.test(sql.trim());
}

async function runInline(sql: string, sandbox: boolean) {
  const r = await fetch("/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql, sandbox }),
  });
  return (await r.json()) as {
    ok: boolean;
    columns?: string[];
    rows?: unknown[][];
    changes?: number | null;
    error?: string;
  };
}

function CodeBlock({ sql, caption }: { sql: string; caption?: string }) {
  const [result, setResult] = useState<{
    ok: boolean;
    columns?: string[];
    rows?: unknown[][];
    changes?: number | null;
    error?: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const isRead = looksLikeRead(sql);
  const runnable = sql.trim().length > 0;

  async function run() {
    if (busy) return;
    setBusy(true);
    try {
      // Writes and DDL run sandboxed: the statement really executes,
      // then the whole thing is rolled back — the store stays untouched.
      setResult(await runInline(sql, !isRead));
    } finally {
      setBusy(false);
    }
  }

  const affected = result?.ok && (result.rows ?? []).length === 0 && result.changes != null;

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      {(caption || runnable) && (
        <div className="flex items-center justify-between border-b border-zinc-800 px-3.5 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{caption ?? "SQL"}</span>
          {runnable && (
            <button
              onClick={run}
              disabled={busy}
              className="rounded border border-emerald-400/40 px-2 py-0.5 font-mono text-[11px] text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-50"
            >
              {busy ? "running…" : isRead ? "Run here" : "Run sandboxed"}
            </button>
          )}
        </div>
      )}
      <pre className="overflow-x-auto px-3.5 py-3 font-mono text-xs leading-relaxed text-zinc-300 thin-scrollbar">{sql}</pre>
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
    </div>
  );
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
    { id: "quiz", label: "Quiz", icon: CircleHelp, note: `${lesson.mcqs.length} questions` },
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
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">{lesson.title}</h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-400">{lesson.blurb}</p>

      <div className="mt-5 flex gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors sm:flex-none sm:px-4",
              tab === t.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            <span className="hidden text-[10px] text-zinc-500 sm:inline">· {t.note}</span>
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
                return <CodeBlock key={i} sql={b.sql} caption={b.caption} />;
              case "diagram":
                return <Figure key={i} id={b.figure} />;
              case "tip":
                return (
                  <div key={i} className="my-4 rounded-lg border border-emerald-400/30 bg-emerald-400/5 px-4 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">Tip</span>
                    <Rich text={b.text} className="mt-1 text-sm leading-relaxed text-zinc-300" />
                  </div>
                );
              case "warn":
                return (
                  <div key={i} className="my-4 rounded-lg border border-amber-400/30 bg-amber-400/5 px-4 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">Watch out</span>
                    <Rich text={b.text} className="mt-1 text-sm leading-relaxed text-zinc-300" />
                  </div>
                );
              case "dialect": {
                const meta = DIALECT_META[b.db] ?? { label: b.db, pill: "border-zinc-700 text-zinc-300" };
                return (
                  <div key={i} className="my-4 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Dialect watch</span>
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", meta.pill)}>{meta.label}</span>
                    </div>
                    <Rich text={b.text} className="mt-1.5 text-sm leading-relaxed text-zinc-300" />
                  </div>
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
            <div className="mt-8 rounded-lg border border-violet-400/30 bg-violet-400/5 px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-300">In one sentence</span>
              <p className="mt-1 text-[15px] font-medium leading-7 text-zinc-100">{lesson.takeaway}</p>
            </div>
          )}
          <div className="mt-6 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
            <p className="text-sm text-zinc-400">
              Ready to prove it? Take the quiz, then solve the practice queries.
            </p>
            <button
              onClick={() => setTab("quiz")}
              className="rounded-md bg-emerald-400 px-3.5 py-1.5 text-xs font-medium text-[#052e1c] hover:bg-emerald-300"
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
