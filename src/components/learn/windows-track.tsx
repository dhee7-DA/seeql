"use client";

// Window Functions — the dedicated deep-dive section. Three tabs over three
// live banks: Quiz (300 concept MCQs), Case files (300 audited rebuilds,
// topics t5-t8), Query gym (300 graded problems). Every count is computed
// from the registries; nothing is hardcoded.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, CheckCircle2, ChevronLeft, ChevronRight, Columns3, FileStack, Frame, Layers, Lightbulb, Sparkles } from "lucide-react";
import { useProgress } from "@/lib/curriculum/progress";
import { WINDOW_MCQS, WINDOW_PROBLEMS, windowStats } from "@/lib/curriculum/windows";
import { CASES, CASE_TOPICS, caseTopicLabel, caseUniverseLabel } from "@/lib/curriculum/cases";
import type { CaseStudy } from "@/lib/curriculum/cases/types";
import type { Problem } from "@/lib/curriculum/types";
import { fmt } from "./roadmap-track";
import { cn } from "@/lib/utils";
import { McqCard } from "./mcq";
import { ProblemCard } from "./problem-runner";
import { CaseFileCard } from "./case-files";

const WINDOW_LESSONS = [
  { id: "lesson-31", label: "RANK & friends", num: 31 },
  { id: "lesson-32", label: "LAG & LEAD", num: 32 },
  { id: "lesson-39", label: "Window capstone", num: 39 },
  { id: "lesson-55", label: "Month-over-month", num: 55 },
  { id: "lesson-57", label: "Advanced windows", num: 57 },
];

// Concept groups over the 300-MCQ bank — contiguous ranges by construction.
const GROUPS: Array<{ label: string; from: number; to: number }> = [
  { label: "OVER() fundamentals", from: 1, to: 30 },
  { label: "ROW_NUMBER", from: 31, to: 60 },
  { label: "RANK & DENSE_RANK", from: 61, to: 90 },
  { label: "PARTITION BY", from: 91, to: 120 },
  { label: "LAG & LEAD", from: 121, to: 150 },
  { label: "FIRST / LAST / NTH", from: 151, to: 180 },
  { label: "Frames & running totals", from: 181, to: 210 },
  { label: "NTILE & distributions", from: 211, to: 240 },
  { label: "Staging patterns", from: 241, to: 270 },
  { label: "Finance windows", from: 271, to: 300 },
];

type Tab = "quiz" | "cases" | "gym";

const STAT_CELL = "rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center";

function StatCell({ n, label }: { n: string; label: string }) {
  return (
    <div className={STAT_CELL}>
      <div className="text-base font-bold tabular-nums text-white">{n}</div>
      <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">{label}</div>
    </div>
  );
}

function QuizTab() {
  const [groupIdx, setGroupIdx] = useState(0);
  const [page, setPage] = useState(0);
  const perPage = 5;
  const group = GROUPS[groupIdx];
  const mcqs = useMemo(
    () =>
      WINDOW_MCQS.filter((q) => {
        const n = Number(q.id.slice(5));
        return n >= group.from && n <= group.to;
      }),
    [group],
  );
  const solved = useProgress((s) => s.mcqAttempts);
  const done = mcqs.filter((q) => solved[q.id]?.correct).length;
  const pageMax = Math.ceil(mcqs.length / perPage);
  const view = mcqs.slice(page * perPage, page * perPage + perPage);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {GROUPS.map((g, i) => (
          <button
            key={g.label}
            onClick={() => {
              setGroupIdx(i);
              setPage(0);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-medium transition",
              i === groupIdx
                ? "border-violet-400/60 bg-violet-400/15 text-violet-200"
                : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
        <span>
          {group.label} · {done}/{mcqs.length} correct
        </span>
        <span>
          page {page + 1}/{pageMax}
        </span>
      </div>
      <div className="mt-3 space-y-4">
        {view.map((q, i) => (
          <McqCard key={q.id} mcq={q} index={page * perPage + i + 1} />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        <button
          onClick={() => setPage((p) => Math.min(pageMax - 1, p + 1))}
          disabled={page >= pageMax - 1}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-40"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function GymTab() {
  const [sel, setSel] = useState(0);
  const solved = useProgress((s) => s.xpEvents);
  const done = WINDOW_PROBLEMS.filter((p) => solved[`solve:${p.id}`] !== undefined).length;
  const problem: Problem = WINDOW_PROBLEMS[sel];
  const difficultyDot: Record<string, string> = { easy: "bg-emerald-400", medium: "bg-amber-400", hard: "bg-rose-400" };

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>
          {done}/{WINDOW_PROBLEMS.length} solved
        </span>
        <span>
          problem {sel + 1}/{WINDOW_PROBLEMS.length}
        </span>
      </div>
      <div className="mt-3 grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="max-h-[420px] space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-1.5 lg:max-h-[560px]">
          {WINDOW_PROBLEMS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSel(i)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition",
                i === sel ? "bg-violet-400/15 text-violet-100" : "text-zinc-400 hover:bg-white/[0.04]",
              )}
            >
              {solved[`solve:${p.id}`] !== undefined ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              ) : (
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", difficultyDot[p.difficulty])} />
              )}
              <span className="truncate">{p.title}</span>
            </button>
          ))}
        </div>
        <div>
          <ProblemCard key={problem.id} problem={problem} index={sel + 1} />
        </div>
      </div>
    </div>
  );
}

function CasesTab() {
  const [topic, setTopic] = useState<string>("t5");
  const [page, setPage] = useState(0);
  const perPage = 6;
  const topics = CASE_TOPICS.filter((t) => ["t5", "t6", "t7", "t8"].includes(t.id));
  const cases: CaseStudy[] = useMemo(
    () => CASES.filter((c) => c.topic === topic).sort((a, b) => Number(b.id.slice(3)) - Number(a.id.slice(3))),
    [topic],
  );
  const solved = useProgress((s) => s.xpEvents);
  const done = cases.filter((c) => solved[`case:${c.id}`] !== undefined).length;
  const pageMax = Math.ceil(cases.length / perPage);
  const view = cases.slice(page * perPage, page * perPage + perPage);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {topics.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTopic(t.id);
              setPage(0);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-medium transition",
              t.id === topic
                ? "border-violet-400/60 bg-violet-400/15 text-violet-200"
                : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
        <span>
          {caseTopicLabel(topic)} · {done}/{cases.length} rebuilt
        </span>
        <span>
          page {page + 1}/{pageMax}
        </span>
      </div>
      <div className="mt-3 space-y-4">
        {view.map((cs) => (
          <div key={cs.id} className="rounded-2xl">
            <div className="mb-1 flex items-center gap-2 px-1 text-[10px] uppercase tracking-wide text-zinc-500">
              <span>{caseUniverseLabel(cs.universe)}</span>
              <span>·</span>
              <span>{cs.tier}</span>
            </div>
            <CaseFileCard cs={cs} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        <button
          onClick={() => setPage((p) => Math.min(pageMax - 1, p + 1))}
          disabled={page >= pageMax - 1}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-40"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function WindowsTrack({ openLesson }: { openLesson: (id: string) => void }) {
  const [tab, setTab] = useState<Tab>("quiz");
  const stats = windowStats();
  const total = stats.mcqs + stats.problems + stats.cases;

  const tabs: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "quiz", label: `Quiz · ${stats.mcqs}`, icon: Sparkles },
    { id: "cases", label: `Case files · ${stats.cases}`, icon: FileStack },
    { id: "gym", label: `Query gym · ${stats.problems}`, icon: BookOpenCheck },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-400/10">
          <Frame className="h-5 w-5 text-violet-300" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Window functions</h1>
          <p className="text-xs text-zinc-400">
            The deep-dive section — {fmt(total)} fresh practice items, all graded against the live store.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCell n={fmt(stats.mcqs)} label="quiz questions" />
        <StatCell n={fmt(stats.cases)} label="case files" />
        <StatCell n={fmt(stats.problems)} label="graded queries" />
        <StatCell n="10" label="concept groups" />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          <Layers className="h-3.5 w-3.5" /> Theory map
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {WINDOW_LESSONS.map((l) => (
            <button
              key={l.id}
              onClick={() => openLesson(l.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:border-violet-400/40 hover:text-violet-200"
            >
              <Lightbulb className="h-3 w-3 text-amber-300" />
              L{l.num} · {l.label}
            </button>
          ))}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-400">
            <Columns3 className="h-3 w-3 text-sky-300" />
            Frame playground lives in the toolbox
          </span>
        </div>
      </div>

      <div className="mt-6 flex gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition sm:text-sm",
              t.id === tab ? "bg-violet-400/15 text-violet-100" : "text-zinc-400 hover:bg-white/[0.04]",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            {t.id === tab && (
              <motion.span
                layoutId="wf-tab-underline"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-violet-400"
              />
            )}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "quiz" && <QuizTab />}
        {tab === "cases" && <CasesTab />}
        {tab === "gym" && <GymTab />}
      </div>

      <p className="mt-8 flex items-center gap-1.5 text-[11px] text-zinc-500">
        <Sparkles className="h-3 w-3" />
        Every case is mechanically audited against the live database; every graded query runs on the real store.
      </p>
    </div>
  );
}
