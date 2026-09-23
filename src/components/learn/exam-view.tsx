"use client";

// Module exam — 12 questions (8 MCQ + 4 fill), 12 minutes, pass at 9.
// Feedback is withheld until submit; a flubbed answer still feeds the review
// deck. First passing run pays +60 XP; retakes reshuffle the deck.

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Timer, XCircle } from "lucide-react";
import { EXAM_MCQS, EXAM_MINUTES, EXAM_PASS, buildExam } from "@/lib/curriculum/exams";
import { MODULES } from "@/lib/curriculum/lessons";
import { useProgress } from "@/lib/curriculum/progress";
import { XP } from "@/lib/curriculum/gamification";
import type { Exam } from "@/lib/curriculum/exams";
import { cn } from "@/lib/utils";
import { McqCard } from "./mcq";
import { FillCard } from "./fill-blank";
import { RichNodes } from "./rich";
import { celebrate } from "./celebrate";

type Phase = "intro" | "running" | "results";

interface ResultRow {
  id: string;
  label: string;
  correct: boolean;
  why: string;
  kind: "mcq" | "fill";
}

function mmss(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function ExamView({ moduleId, onExit }: { moduleId: string; onExit: () => void }) {
  const mod = MODULES.find((m) => m.id === moduleId);
  const exams = useProgress((s) => s.exams);
  const record = mod ? exams[mod.id] : undefined;

  const [phase, setPhase] = useState<Phase>("intro");
  const [attempt, setAttempt] = useState(0);
  const [exam, setExam] = useState<Exam | null>(null);
  const [idx, setIdx] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [locked, setLocked] = useState<Map<string, boolean>>(new Map());
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [remaining, setRemaining] = useState(EXAM_MINUTES * 60_000);
  const deadlineRef = useRef(0);
  const submittedRef = useRef(false);

  function start(attemptNo: number) {
    const e = buildExam(moduleId, attemptNo);
    if (!e) return;
    setExam(e);
    setAttempt(attemptNo);
    setIdx(0);
    setAnsweredIds(new Set());
    setLocked(new Map());
    setRows([]);
    setRemaining(EXAM_MINUTES * 60_000);
    deadlineRef.current = Date.now() + EXAM_MINUTES * 60_000;
    submittedRef.current = false;
    setPhase("running");
  }

  function onAnswered(id: string, label: string, kind: "mcq" | "fill", ok: boolean, why: string) {
    setAnsweredIds((s) => new Set(s).add(id));
    setLocked((m) => new Map(m).set(id, ok));
    setRows((r) => [...r.filter((x) => x.id !== id), { id, label, correct: ok, why, kind }]);
  }

  function submit(auto = false) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const score = [...locked.values()].filter(Boolean).length;
    const total = exam?.questions.length ?? EXAM_MCQS + 4;
    const pass = score >= EXAM_PASS;
    const store = useProgress.getState();
    store.recordExam(moduleId, score, total, pass);
    if (pass) {
      // One-time bonus, idempotent via the ledger key.
      if (store.awardXp(`exam:${moduleId}`, XP.examPass)) {
        celebrate({ kind: "xp", title: `+${XP.examPass} XP`, sub: "Module exam passed" });
      }
    }
    setRows((r) => {
      // Ensure every locked question has a row (auto-submit mid-question).
      const known = new Set(r.map((x) => x.id));
      const missing = exam
        ? exam.questions
            .filter((q) => {
              const id = q.kind === "mcq" ? q.mcq!.id : q.fill!.id;
              return locked.has(id) && !known.has(id);
            })
            .map((q) => {
              const id = q.kind === "mcq" ? q.mcq!.id : q.fill!.id;
              const label = q.kind === "mcq" ? q.mcq!.prompt : q.fill!.prompt;
              const why = q.kind === "mcq" ? q.mcq!.why : q.fill!.why;
              return { id, label, correct: locked.get(id) ?? false, why, kind: q.kind };
            })
        : [];
      return [...r, ...missing];
    });
    void auto;
    setPhase("results");
  }

  // Countdown while running; auto-submit at zero (declared after submit so the
  // timer closes over the same hoisted function the buttons call).
  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => {
      const left = deadlineRef.current - Date.now();
      setRemaining(left);
      if (left <= 0) submit(true);
    }, 500);
    return () => clearInterval(t);
  }, [phase]);

  if (!mod) return null;

  // ---- intro ----
  if (phase === "intro") {
    return (
      <div className="max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Module {mod.num} · {mod.level}
        </p>
        <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-zinc-50">{mod.title} — exam</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          {EXAM_MCQS + 4} questions pulled from the module&apos;s lessons — {EXAM_MCQS} multiple choice, 4 query rebuilds.
          Feedback stays sealed until you submit, the clock runs for {EXAM_MINUTES} minutes, and passing takes {EXAM_PASS} of{" "}
          {EXAM_MCQS + 4}. Misses still land in your review deck.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Questions", String(EXAM_MCQS + 4)],
            ["Clock", `${EXAM_MINUTES} min`],
            ["Pass mark", `${EXAM_PASS}/${EXAM_MCQS + 4}`],
            ["First pass", `+${XP.examPass} XP`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500">{k}</p>
              <p className="tnum mt-1 truncate text-sm font-medium text-zinc-100">{v}</p>
            </div>
          ))}
        </div>

        {record && (
          <p className="mt-4 text-xs text-zinc-500">
            History: {record.attempts} attempt{record.attempts === 1 ? "" : "s"} · best {record.best}/{record.total}
            {record.passedAt ? " · PASSED" : ""}
          </p>
        )}

        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={() => start(record?.attempts ?? 0)}
            className="rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
          >
            {record ? "Retake exam" : "Start exam"} →
          </button>
          <button
            onClick={onExit}
            className="btn-quiet rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
          >
            Back to overview
          </button>
        </div>
      </div>
    );
  }

  // ---- running ----
  if (phase === "running" && exam) {
    const current = exam.questions[idx];
    const id = current.kind === "mcq" ? current.mcq!.id : current.fill!.id;
    const label = current.kind === "mcq" ? current.mcq!.prompt : current.fill!.prompt;
    const why = current.kind === "mcq" ? current.mcq!.why : current.fill!.why;
    const isLast = idx + 1 >= exam.questions.length;
    const lockedCount = answeredIds.size;
    const timerTone =
      remaining > 120_000 ? "text-zinc-300" : remaining > 30_000 ? "text-amber-300" : "text-rose-300";

    return (
      <div className="max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${(idx / exam.questions.length) * 100}%` }}
            />
          </div>
          <span className="tnum shrink-0 font-mono text-xs text-zinc-500">
            {idx + 1} / {exam.questions.length}
          </span>
          <span className={cn("tnum flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-700 px-2.5 py-0.5 font-mono text-xs", timerTone)}>
            <Timer className="h-3 w-3" />
            {mmss(remaining)}
          </span>
        </div>

        <p className="mb-2 mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
          {current.kind === "mcq" ? "Question" : "Rebuild"} · Module {exam.moduleNum} · {exam.moduleTitle}
        </p>

        {current.kind === "mcq" ? (
          <McqCard
            key={id}
            mcq={current.mcq!}
            examMode
            onAnswered={(ok) => onAnswered(id, label, "mcq", ok, why)}
          />
        ) : (
          <FillCard
            key={id}
            fill={current.fill!}
            examMode
            onAnswered={(ok) => onAnswered(id, label, "fill", ok, why)}
          />
        )}

        {answeredIds.has(id) && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <p className="text-sm text-zinc-400">
              {isLast ? "That was the last question — submit when ready." : `Locked in · ${lockedCount}/${exam.questions.length} answered.`}
            </p>
            {isLast ? (
              <button
                onClick={() => submit()}
                className="shrink-0 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
              >
                Submit exam
              </button>
            ) : (
              <button
                onClick={() => setIdx((i) => i + 1)}
                className="flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
              >
                Next question
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ---- results ----
  const score = rows.filter((r) => r.correct).length;
  const total = exam?.questions.length ?? rows.length;
  const pass = score >= EXAM_PASS;

  return (
    <div className="max-w-3xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        Module {mod.num} exam · attempt {attempt + 1}
      </p>
      <h1 className={cn("font-display mt-2 text-2xl font-semibold tracking-tight", pass ? "text-emerald-300" : "text-zinc-50")}>
        {score} / {total} — {pass ? "Passed" : "Not this time"}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        {pass
          ? `The module holds up under pressure${score === total ? " — a perfect paper." : "."} The +${XP.examPass} first-pass bonus is yours if this was the one.`
          : `You needed ${EXAM_PASS}. The misses below just joined your review deck — clear them, then retake for a fresh deal of questions.`}
      </p>

      <div className="mt-5 space-y-3">
        {exam?.questions.map((q) => {
          const id = q.kind === "mcq" ? q.mcq!.id : q.fill!.id;
          const row = rows.find((r) => r.id === id);
          const label = q.kind === "mcq" ? q.mcq!.prompt : q.fill!.prompt;
          const why = q.kind === "mcq" ? q.mcq!.why : q.fill!.why;
          const ok = row?.correct ?? false;
          return (
            <div key={id} className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
              <p className="flex items-start gap-2 text-sm text-zinc-200">
                {ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                )}
                <span>
                  <RichNodes text={label} />
                </span>
              </p>
              {row && (
                <p className="mt-1.5 pl-6 text-xs leading-relaxed text-zinc-500">
                  <RichNodes text={why} />
                </p>
              )}
              {!row && (
                <p className="mt-1.5 flex items-center gap-1.5 pl-6 text-xs text-amber-300/80">
                  <AlertTriangle className="h-3 w-3" /> Unanswered — the clock ran out here.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          onClick={() => start(attempt + 1)}
          className="rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
        >
          Retake exam
        </button>
        <button
          onClick={onExit}
          className="btn-quiet rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
        >
          Back to overview
        </button>
      </div>
    </div>
  );
}
