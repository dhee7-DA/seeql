"use client";

// Mastery map — the per-skill picture of everything the app has graded,
// plus the adaptive layer: a daily quest drawn from the weakest skills
// and the spaced-repetition cards coming due, and a one-tap practice
// round that targets the weakest five.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, BellRing, CheckCircle2, Radar as RadarIcon, Sparkles, Target, TrendingUp } from "lucide-react";
import { Icon3D } from "./ui/icon3d";
import { LESSONS } from "@/lib/curriculum/lessons";
import { dayKey } from "@/lib/curriculum/gamification";
import { useProgress, dueReviews } from "@/lib/curriculum/progress";
import { COMPANY_KITS } from "@/lib/companies/registry";
import { kitMcqAccuracy } from "@/lib/universe/progress";
import { useUniverse } from "@/lib/universe/progress";
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

/* ---------------- weak spots — radar, momentum, worst offenders ----------
 *
 * The map above is the full picture; this panel is the verdict. The radar
 * shapes the weakest skills with signal, the momentum sparkline shows
 * whether the trend line is up or flat, and the worst-three lists (skills
 * AND companies — the universe counts now) name exactly what to drill next.
 */

const WEAK_RADAR_SIZE = 6;
const MOMENTUM_DAYS = 14;

function WeakSpots({ cells }: { cells: MasteryCell[] }) {
  const xpByDay = useProgress((s) => s.xpByDay);
  const mcqAttempts = useProgress((s) => s.mcqAttempts);
  const mockMcq = useUniverseMock();

  // radar axes: the weakest skills that carry signal, up to six
  const axes = useMemo(
    () =>
      cells
        .filter((c) => c.attempts > 0)
        .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))
        .slice(0, WEAK_RADAR_SIZE),
    [cells],
  );

  // momentum: XP per day for the last two weeks, oldest → newest
  const momentum = useMemo(() => {
    const out: Array<{ key: string; xp: number }> = [];
    const d = new Date();
    for (let i = MOMENTUM_DAYS - 1; i >= 0; i--) {
      const day = new Date(d);
      day.setDate(d.getDate() - i);
      const key = dayKey(day);
      out.push({ key, xp: xpByDay[key] ?? 0 });
    }
    return out;
  }, [xpByDay]);

  // weakest companies: kit MCQ accuracy across BOTH ledgers (kit tab + mock
  // screens merged by kitMcqAccuracy), ranked by accuracy then exposure
  const weakKits = useMemo(() => {
    const rows: Array<{ id: string; name: string; correct: number; attempted: number; total: number }> = [];
    for (const kit of Object.values(COMPANY_KITS)) {
      const ids = kit.mcqs.map((m) => m.id);
      const acc = kitMcqAccuracy(kit.id, ids, mcqAttempts, mockMcq);
      if (acc.attempted > 0)
        rows.push({ id: kit.id, name: kit.name, correct: acc.correct, attempted: acc.attempted, total: ids.length });
    }
    return rows
      .sort((a, b) => a.correct / a.attempted - b.correct / b.attempted || a.attempted - b.attempted)
      .slice(0, 3);
  }, [mcqAttempts, mockMcq]);

  const worst3 = axes.slice(0, 3);
  const maxMomentum = Math.max(10, ...momentum.map((m) => m.xp));

  const R = 56;
  const C = 72; // center of the 160px viewBox
  const pt = (i: number, frac: number) => {
    const angle = (Math.PI * 2 * i) / Math.max(1, axes.length) - Math.PI / 2;
    return { x: C + Math.cos(angle) * R * frac, y: C + Math.sin(angle) * R * frac };
  };

  return (
    <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        <RadarIcon className="h-3.5 w-3.5 text-rose-300" /> Weak spots — the verdict
      </p>

      {axes.length === 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">
          No signal yet — answer a few quiz questions (course or company kits) and your weak spots will name themselves here.
        </p>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {/* radar */}
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 144 144" className="h-44 w-44" role="img" aria-label="Radar of your weakest skills">
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <polygon
                  key={f}
                  points={axes.map((_, i) => { const p = pt(i, f); return `${p.x},${p.y}`; }).join(" ")}
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="1"
                />
              ))}
              {axes.map((_, i) => {
                const p = pt(i, 1);
                return <line key={i} x1={C} y1={C} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />;
              })}
              <polygon
                points={axes.map((c, i) => { const p = pt(i, c.accuracy ?? 0); return `${p.x},${p.y}`; }).join(" ")}
                fill="rgba(244,63,94,0.14)"
                stroke="#fb7185"
                strokeWidth="1.5"
              />
              {axes.map((c, i) => {
                const p = pt(i, c.accuracy ?? 0);
                return <circle key={c.skill} cx={p.x} cy={p.y} r="2.5" fill="#fb7185" />;
              })}
            </svg>
          </div>
          {/* the axes as a ranked list next to the shape */}
          <div className="space-y-1.5">
            {axes.map((c) => (
              <div key={c.skill} className="flex items-center gap-2">
                <span className="w-28 shrink-0 truncate text-xs text-zinc-300" title={skillLabel(c.skill)}>{skillLabel(c.skill)}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={cn("h-full rounded-full", (c.accuracy ?? 0) < 0.5 ? "bg-rose-400" : (c.accuracy ?? 0) < 0.75 ? "bg-amber-400" : "bg-emerald-400")}
                    style={{ width: `${Math.round((c.accuracy ?? 0) * 100)}%` }}
                  />
                </div>
                <span className="tnum w-9 shrink-0 text-right font-mono text-[10px] text-zinc-500">{Math.round((c.accuracy ?? 0) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* momentum */}
      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-300" /> Momentum — XP per day, last {MOMENTUM_DAYS} days
          </p>
          <span className="tnum font-mono text-[10px] text-zinc-500">
            {momentum.reduce((n, m) => n + m.xp, 0).toLocaleString()} total
          </span>
        </div>
        <div className="mt-2 flex h-10 items-end gap-1" aria-hidden>
          {momentum.map((m) => (
            <div
              key={m.key}
              title={`${m.key}: ${m.xp} XP`}
              className={cn("flex-1 rounded-sm", m.xp > 0 ? "bg-emerald-400/70" : "bg-zinc-800")}
              style={{ height: `${Math.max(6, (m.xp / maxMomentum) * 100)}%` }}
            />
          ))}
        </div>
      </div>

      {/* worst three skills + weakest companies */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="text-[11px] font-semibold text-zinc-200">Drill these three skills first</p>
          <div className="mt-2 space-y-1.5">
            {worst3.length === 0 && <p className="text-[11px] text-zinc-500">Nothing to drill yet — build some signal.</p>}
            {worst3.map((c, i) => (
              <div key={c.skill} className="flex items-center gap-2 text-xs">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-rose-400/30 bg-rose-400/10 font-mono text-[10px] text-rose-300">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-zinc-300">{skillLabel(c.skill)}</span>
                <span className="tnum shrink-0 font-mono text-[10px] text-zinc-500">
                  {Math.round((c.accuracy ?? 0) * 100)}% · {c.attempts}
                </span>
              </div>
            ))}
          </div>
          {worst3.length > 0 && (
            <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">
              Today&apos;s quest below already targets the weakest five — running it is the fastest way to flip these.
            </p>
          )}
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="text-[11px] font-semibold text-zinc-200">Weakest company screens</p>
          <div className="mt-2 space-y-1.5">
            {weakKits.length === 0 && <p className="text-[11px] text-zinc-500">No company-kit answers yet — open Company screens and take a swing.</p>}
            {weakKits.map((k) => (
              <button
                key={k.id}
                onClick={() => window.dispatchEvent(new CustomEvent("seeql:nav", { detail: { kind: "companies", domain: COMPANY_KITS[k.id]?.domainId, company: k.id } }))}
                className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-xs transition-colors hover:bg-zinc-800/60"
                aria-label={`Open the ${k.name} kit`}
              >
                <span className="min-w-0 flex-1 truncate text-zinc-300">{k.name}</span>
                <span className="tnum shrink-0 font-mono text-[10px] text-zinc-500">
                  {k.correct}/{k.attempted} of {k.total}
                </span>
                <ArrowRight className="h-3 w-3 shrink-0 text-zinc-600" />
              </button>
            ))}
          </div>
          {weakKits.length > 0 && (
            <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">
              Kit-tab and mock-screen answers both count. Tap a company to open its kit and re-run the misses.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Selector shim so WeakSpots reads only the mock-answer slice. */
function useUniverseMock() {
  return useUniverse((s) => s.mockMcq);
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
      <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="brain" size={40} />Mastery map</h1>
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

      {/* weak spots — radar, momentum, worst offenders (skills + companies) */}
      <WeakSpots cells={cells} />

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
