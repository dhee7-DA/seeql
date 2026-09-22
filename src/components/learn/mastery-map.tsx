"use client";

// Mastery map — the per-skill picture of everything the app has graded,
// plus the adaptive layer: a daily quest drawn from the weakest skills
// and the spaced-repetition cards coming due, and a one-tap practice
// round that targets the weakest five.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, BellRing, CheckCircle2, Sparkles, Target } from "lucide-react";
import { LESSONS } from "@/lib/curriculum/lessons";
import { dayKey } from "@/lib/curriculum/gamification";
import { useProgress, dueReviews } from "@/lib/curriculum/progress";
import {
  computeMastery,
  LESSON_SKILLS,
  LEVEL_TONE,
  SKILLS,
  skillLabel,
  weakestSkills,
  type MasteryCell,
} from "@/lib/curriculum/mastery";
import type { Mcq } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";
import { McqCard } from "./mcq";

const QUEST_SIZE = 5;

function buildQuest(cells: MasteryCell[], schedule: ReturnType<typeof dueReviews>): Mcq[] {
  // 1) due SR cards first (missed questions coming back around)
  const dueMcqIds = schedule
    .filter((c) => c.key.startsWith("mcq:"))
    .map((c) => c.key.slice(4));
  const byId = new Map<string, Mcq>();
  for (const l of LESSONS) for (const m of l.mcqs) byId.set(m.id, m);
  const picked: Mcq[] = [];
  for (const id of dueMcqIds) {
    const m = byId.get(id);
    if (m && picked.length < QUEST_SIZE && !picked.includes(m)) picked.push(m);
  }
  // 2) then un-attempted questions from the weakest skills
  const weak = weakestSkills(cells, 5).map((c) => c.skill);
  const lessonsBySkill = (skill: string) =>
    LESSONS.filter((l) => {
      const num = l.num;
      const skills = LESSON_SKILLS_SAFE(num);
      return skills.includes(skill);
    });
  for (const skill of weak) {
    for (const l of lessonsBySkill(skill)) {
      for (const m of l.mcqs) {
        if (picked.length >= QUEST_SIZE) break;
        if (!picked.some((p) => p.id === m.id)) picked.push(m);
      }
    }
  }
  return picked;
}

// local import shim — LESSON_SKILLS lives in mastery.ts but the map is keyed
// by lesson number; re-derive cheaply without another import cycle.
function LESSON_SKILLS_SAFE(num: number): string[] {
  return LESSON_SKILLS[num] ?? [];
}

export function MasteryMap({ onOpenLesson }: { onOpenLesson: (id: string) => void }) {
  const skillAttempts = useProgress((s) => s.skillAttempts);
  const mcqAttempts = useProgress((s) => s.mcqAttempts);
  const reviewSchedule = useProgress((s) => s.reviewSchedule);
  const questDone = useProgress((s) => s.questDone);
  const markQuestDone = useProgress((s) => s.markQuestDone);
  const [questIdx, setQuestIdx] = useState(0);
  const [questLive, setQuestLive] = useState(false);

  const cells = useMemo(() => computeMastery(skillAttempts, mcqAttempts), [skillAttempts, mcqAttempts]);
  const due = useMemo(() => dueReviews(reviewSchedule), [reviewSchedule]);
  const weak = useMemo(() => weakestSkills(cells, 5), [cells]);
  const tested = cells.filter((c) => c.attempts > 0).length;
  const localKey = dayKey();
  const clearedToday = questDone[localKey] !== undefined;

  const quest = useMemo(() => buildQuest(cells, due), [cells, due]);
  const questFinished = questIdx >= quest.length;

  function finishQuest() {
    markQuestDone();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <Activity className="h-3.5 w-3.5" /> {SKILLS.length} SKILLS · {tested} WITH SIGNAL
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Mastery map</h1>
      <p className="mt-3 text-[15px] leading-7 text-zinc-400">
        Every quiz, prediction, diagnosis, round of golf and interview run folds into one map. Cells with no
        signal stay gray — go make them tell you something.
      </p>

      {/* heatmap */}
      <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">The map</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {cells.map((c) => {
            const tone = LEVEL_TONE[c.level];
            return (
              <div
                key={c.skill}
                title={`${tone.label}${c.attempts ? ` — ${Math.round((c.accuracy ?? 0) * 100)}% over ${c.attempts} signals` : ""}`}
                className={cn("rounded-md border px-3 py-2.5", tone.cell)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("truncate text-xs font-medium", c.level === "none" ? "text-zinc-500" : "text-zinc-100")}>
                    {skillLabel(c.skill)}
                  </p>
                  <span className={cn("tnum shrink-0 font-mono text-[10px]", tone.text)}>
                    {c.attempts > 0 ? `${Math.round((c.accuracy ?? 0) * 100)}% · ${c.attempts}` : "—"}
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-800/80">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      c.level === "mastered" && "bg-emerald-400",
                      c.level === "solid" && "bg-sky-400",
                      c.level === "shaky" && "bg-amber-400",
                      c.level === "weak" && "bg-rose-400",
                      c.level === "none" && "bg-zinc-700",
                    )}
                    style={{ width: `${c.attempts > 0 ? (c.accuracy ?? 0) * 100 : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* daily quest */}
      <div className="sheen mt-5 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.04] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">
            <Target className="h-3.5 w-3.5" /> Today&apos;s quest
          </p>
          {clearedToday && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> cleared
            </span>
          )}
        </div>

        {!questLive && (
          <>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {quest.length > 0 ? (
                <>
                  {quest.length} questions drawn from{" "}
                  <span className="font-medium text-emerald-300">
                    {weak.length > 0 ? weak.map((w) => skillLabel(w.skill)).slice(0, 3).join(", ") : "fresh ground"}
                  </span>
                  {due.length > 0 && <> — plus {due.length} review card{due.length === 1 ? "" : "s"} coming due</>}.
                </>
              ) : (
                "No weak signals yet — every skill the map has measured is solid. Take a Mixed quiz to draw fresh cards."
              )}
            </p>
            {quest.length > 0 && (
              <button
                onClick={() => {
                  setQuestLive(true);
                  setQuestIdx(0);
                }}
                className="btn-glow mt-3 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
              >
                Start the quest <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}

        {questLive && !questFinished && quest[questIdx] && (
          <div className="mt-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              quest question {questIdx + 1} / {quest.length}
            </p>
            <McqCard key={quest[questIdx].id} mcq={quest[questIdx]} />
            <button
              onClick={() => {
                const next = questIdx + 1;
                setQuestIdx(next);
                if (next >= quest.length) finishQuest();
              }}
              className="btn-glow mt-3 flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
            >
              {questIdx + 1 >= quest.length ? "Claim the quest" : "Next"} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {questLive && questFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 flex items-center gap-2.5 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-3"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
            <p className="text-sm font-medium text-emerald-200">Quest cleared — the map re-weighs tomorrow.</p>
          </motion.div>
        )}
      </div>

      {/* review cards due */}
      {due.length > 0 && (
        <div className="sheen mt-5 rounded-lg border border-violet-400/25 bg-violet-400/[0.05] p-4 sm:p-5">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">
            <BellRing className="h-3.5 w-3.5" /> Spaced repetition — {due.length} card{due.length === 1 ? "" : "s"} due
          </p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">
            Cards resurface on a 1d → 3d → 7d → 14d ladder: answer right and they back off, answer wrong and
            they come back tomorrow. Mixed quiz draws the due ones first — the quest above already included them.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {due.slice(0, 8).map((c) => (
              <span
                key={c.key}
                className="rounded border border-violet-400/30 bg-violet-400/10 px-2 py-1 font-mono text-[10px] text-violet-200"
              >
                {c.key.startsWith("mcq:") ? `lesson question ${c.key.slice(4)}` : c.key}
                {c.lapses > 0 && <span className="text-rose-300/80"> · {c.lapses} miss{c.lapses === 1 ? "" : "es"}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* weakest five */}
      {weak.length > 0 && (
        <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Your weakest five</p>
          <div className="mt-3 space-y-2">
            {weak.map((w) => {
              const tone = LEVEL_TONE[w.level];
              const lesson = LESSONS.find((l) => (LESSON_SKILLS[l.num] ?? []).includes(w.skill));
              return (
                <div key={w.skill} className="flex items-center gap-2.5 rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", w.level === "weak" ? "bg-rose-400" : w.level === "shaky" ? "bg-amber-400" : "bg-sky-400")} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-zinc-200">{skillLabel(w.skill)}</p>
                    <p className="text-[10px] text-zinc-500">
                      {Math.round((w.accuracy ?? 0) * 100)}% over {w.attempts} signals · {SKILLS.find((s) => s.id === w.skill)?.owns}
                    </p>
                  </div>
                  {lesson && (
                    <button
                      onClick={() => onOpenLesson(lesson.id)}
                      className="shrink-0 rounded-md border border-zinc-700 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                    >
                      Lesson {lesson.num} →
                    </button>
                  )}
                  <span className={cn("shrink-0 font-mono text-[10px]", tone.text)}>{tone.label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
            The daily quest draws from these first. Answer right and the map re-weights; the ladder
            (1d → 3d → 7d → 14d) decides when each miss comes back.
          </p>
        </div>
      )}
    </div>
  );
}
