"use client";

// Capstone track — the A→Z project view. Takes the parse + profile the gym
// produced and walks the learner from first peek to a defended conclusion:
// stage rail with gates, guided workbench, SeeQ coach notes, a hint ladder
// and "go learn" deep links into the curriculum for every skill a question
// needs. Grading stays result-based (lib/messy-gym + lib/capstone checkers);
// XP rides the same gym ledger, so progress survives sessions.

import { useMemo, useRef, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  Flag,
  Lightbulb,
  Loader2,
  Lock,
  Play,
} from "lucide-react";
import { CapstoneCertificate } from "./capstone-certificate";
import { MiniGrid, execSql } from "./practice-kit";
import { seeqReact } from "./seeq-mood";
import { useProgress } from "@/lib/curriculum/progress";
import { starsFor } from "@/lib/curriculum/gamification";
import {
  SKILL_LESSONS,
  buildCapstone,
  type CapQ,
  type CapStage,
} from "@/lib/capstone";
import { gymXpKey, type GymParse, type GymProfile } from "@/lib/messy-gym";
import { cardForProject } from "@/lib/share-cards";
import { ShareCardButton } from "./share-button";
import type { ExecResponse } from "@/lib/sql-types";
import type { ToolKind } from "./tools";
import { cn } from "@/lib/utils";
import { SqlEditor } from "../sql-editor";

interface Verdict {
  pass: boolean;
  feedback: string;
}

export function CapstoneTrack({
  parse,
  profile,
  openLesson,
  onOpenSandbox,
}: {
  parse: GymParse;
  profile: GymProfile;
  openLesson?: (id: string) => void;
  onOpenSandbox?: (kind: ToolKind) => void;
}) {
  const project = useMemo(() => buildCapstone(parse, profile), [parse, profile]);
  const xpEvents = useProgress((s) => s.xpEvents);

  const [sql, setSql] = useState("");
  const [run, setRun] = useState<{ running: boolean; result: ExecResponse | null }>({
    running: false,
    result: null,
  });
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const [hintLevel, setHintLevel] = useState<Record<string, number>>({});
  const [pickChoice, setPickChoice] = useState<Record<string, string>>({});
  const [openStage, setOpenStage] = useState<string | null>("a");
  const [certOpen, setCertOpen] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const isDone = (q: CapQ) => xpEvents[gymXpKey(parse, q.id)] !== undefined;
  const doneCount = project.questions.filter(isDone).length;
  const totalXp = project.questions.reduce((a, q) => a + q.xp, 0);
  const earnedXp = project.questions.filter(isDone).reduce((a, q) => a + q.xp, 0);
  const complete = doneCount === project.questions.length && project.questions.length > 0;

  const byStage = useMemo(() => {
    const m = new Map<string, CapQ[]>();
    for (const q of project.questions) m.set(q.stage, [...(m.get(q.stage) ?? []), q]);
    return m;
  }, [project]);

  const stageState = useMemo(() => {
    const map = new Map<string, { unlocked: boolean; done: number; total: number }>();
    let prevClear = true;
    for (const stage of project.stages) {
      const qs = byStage.get(stage.id) ?? [];
      const done = qs.filter((q) => xpEvents[gymXpKey(parse, q.id)] !== undefined).length;
      map.set(stage.id, { unlocked: prevClear, done, total: qs.length });
      prevClear = prevClear && done === qs.length;
    }
    return map;
  }, [project, byStage, xpEvents, parse]);

  const firstOpenStage =
    project.stages.find((s) => {
      const st = stageState.get(s.id);
      return st?.unlocked && st.done < st.total;
    })?.id ?? null;

  async function runQuery() {
    const q = sql.trim();
    if (run.running || !q) return;
    if (!/^(select|with|explain)\b/i.test(q.replace(/^(\s*(?:--[^\n]*\n|\/\*[\s\S]*?\*\/)+\s*)*/, ""))) {
      setRun({
        running: false,
        result: { ok: false, error: "The capstone runs read-only queries — SELECT, WITH and EXPLAIN only." },
      });
      return;
    }
    setRun({ running: true, result: null });
    const result = await execSql(q);
    setRun({ running: false, result });
    if (result.ok) {
      const store = useProgress.getState();
      const next: Record<string, Verdict> = { ...verdicts };
      for (const question of project.questions) {
        if (question.kind !== "sql") continue;
        const key = gymXpKey(parse, question.id);
        if (store.xpEvents[key] !== undefined) continue;
        const v = question.check(result);
        next[question.id] = v;
        if (v.pass) {
          const paid = store.awardXp(key, question.xp);
          if (paid) {
            store.recordSkill(question.skill, true);
            seeqReact("win");
          }
        }
      }
      setVerdicts(next);
    }
  }

  function loadStarter(q: CapQ) {
    setSql(q.starter);
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function bumpHint(q: CapQ) {
    setHintLevel((h) => ({ ...h, [q.id]: Math.min((h[q.id] ?? 0) + 1, q.hints.length) }));
  }

  function pickAnswer(q: CapQ, option: string) {
    if (isDone(q) || !q.pick) return;
    setPickChoice((c) => ({ ...c, [q.id]: option }));
    if (option === q.pick.answer) {
      const store = useProgress.getState();
      const paid = store.awardXp(gymXpKey(parse, q.id), q.xp);
      if (paid) {
        store.recordSkill(q.skill, true);
        seeqReact("win");
      }
      setVerdicts((v) => ({ ...v, [q.id]: { pass: true, feedback: q.pick!.explain } }));
    } else {
      setVerdicts((v) => ({
        ...v,
        [q.id]: {
          pass: false,
          feedback: "Not that one — go back to your Stage D split and your executive row. The data already answered; the pick just repeats it.",
        },
      }));
    }
  }

  function stageChip(stage: CapStage) {
    const st = stageState.get(stage.id)!;
    const open = openStage === stage.id;
    const done = st.done === st.total && st.total > 0;
    return (
      <button
        key={stage.id}
        onClick={() => setOpenStage(open ? null : stage.id)}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] transition-colors",
          done
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
            : st.unlocked
              ? "border-amber-400/40 bg-amber-400/[0.06] text-amber-200"
              : "border-zinc-800 bg-zinc-900/60 text-zinc-600",
          open && "ring-1 ring-zinc-500",
        )}
        title={st.unlocked ? stage.title : `${stage.title} — clear the previous stage first`}
      >
        {!st.unlocked ? <Lock className="h-3 w-3" /> : done ? <CheckCircle2 className="h-3 w-3" /> : <span>{stage.letter}</span>}
        {stage.title}
        <span className="tnum text-[9px] opacity-70">
          {st.done}/{st.total}
        </span>
      </button>
    );
  }

  function questionCard(q: CapQ, index: number) {
    const done = isDone(q);
    const v = verdicts[q.id];
    const hints = q.hints.slice(0, hintLevel[q.id] ?? 0);
    const stage = project.stages.find((s) => s.id === q.stage);
    const lessonRefs = q.skills.flatMap((s) => SKILL_LESSONS[s] ?? []);
    return (
      <div
        key={q.id}
        className={cn("sheen rounded-lg border bg-zinc-950 p-4 transition-colors", done ? "border-emerald-400/30" : "border-zinc-800")}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0">
            {done ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-label="cleared" />
            ) : (
              <Circle className="h-5 w-5 text-zinc-700" aria-label="open" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-mono text-[10px] text-zinc-600">
                {stage?.letter}
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-sm font-semibold text-zinc-100">{q.label}</h3>
              <span className="font-mono text-[10px] text-amber-300/80">{starsFor(q.difficulty)}</span>
              <span className="tnum font-mono text-[10px] text-zinc-500">+{q.xp} xp</span>
            </div>
            <p className="mt-1.5 text-[13px] leading-6 text-zinc-300">{q.prompt}</p>
            <p className="mt-1 font-mono text-[10px] text-zinc-600">target: {q.expected}</p>

            {/* SeeQ coach note */}
            <p className="mt-2 rounded-md border border-sky-400/20 bg-sky-400/[0.05] px-2.5 py-1.5 text-[11px] leading-5 text-sky-200/90">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-sky-300/70">seeq — </span>
              {q.coach}
            </p>

            {v && !done && (
              <p
                className={cn(
                  "mt-2 rounded-md border px-2.5 py-1.5 text-[11px] leading-5",
                  v.pass
                    ? "border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-200"
                    : "border-rose-400/25 bg-rose-400/[0.05] text-rose-200",
                )}
              >
                {v.feedback}
              </p>
            )}
            {done && <p className="mt-2 text-[11px] text-emerald-300/80">Cleared — XP paid, ledger updated.</p>}

            {/* pick question options */}
            {q.kind === "pick" && q.pick && !done && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {q.pick.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => pickAnswer(q, opt)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 font-mono text-[11px] transition-colors",
                      pickChoice[q.id] === opt
                        ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-900",
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
            {q.kind === "pick" && q.pick && done && (
              <p className="mt-2 rounded-md border border-emerald-400/30 bg-emerald-400/[0.06] px-2.5 py-1.5 text-[11px] leading-5 text-emerald-200">
                {q.pick.explain}
              </p>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {q.kind === "sql" && !done && (
                <button
                  onClick={() => loadStarter(q)}
                  className="btn-quiet rounded-md border border-zinc-700 px-2.5 py-1.5 font-mono text-[10px] text-zinc-300 transition-colors hover:bg-zinc-900"
                >
                  load starter
                </button>
              )}
              {hints.length < q.hints.length && (
                <button
                  onClick={() => bumpHint(q)}
                  className="btn-quiet flex items-center gap-1 rounded-md border border-zinc-800 px-2.5 py-1.5 font-mono text-[10px] text-zinc-500 transition-colors hover:bg-zinc-900"
                >
                  <Lightbulb className="h-3 w-3" /> {hints.length === 0 ? "hint" : "stronger hint"}
                </button>
              )}
              {lessonRefs.map((ref) => (
                <button
                  key={ref.id}
                  onClick={() => openLesson?.(ref.id)}
                  className="btn-quiet flex items-center gap-1 rounded-md border border-violet-400/30 px-2.5 py-1.5 font-mono text-[10px] text-violet-300 transition-colors hover:bg-violet-400/10"
                  title={`Go learn: ${ref.label}`}
                >
                  <BookOpen className="h-3 w-3" /> {ref.label}
                </button>
              ))}
            </div>
            {hints.map((h, i) => (
              <p
                key={i}
                className="mt-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1.5 text-[11px] leading-5 text-zinc-400"
              >
                {h}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const shownStage = project.stages.find((s) => s.id === (openStage ?? firstOpenStage));
  const shownLocked = shownStage && !stageState.get(shownStage.id)?.unlocked;

  return (
    <div>
      {/* progress header + SeeQ story */}
      <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            capstone project · {project.domainLabel}
          </p>
          <p className="tnum font-mono text-[10px] text-zinc-500">
            {doneCount}/{project.questions.length} questions · {earnedXp}/{totalXp} xp on this file
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800" role="presentation">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all"
            style={{ width: `${Math.max(2, (doneCount / Math.max(1, project.questions.length)) * 100)}%` }}
          />
        </div>
        <p className="mt-3 rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2.5 text-[13px] leading-6 text-zinc-300">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-sky-300/70">seeq — </span>
          {project.story}
        </p>
      </div>

      {/* stage rail */}
      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Project stages">
        {project.stages.map(stageChip)}
      </div>

      {/* completion */}
      {complete && (
        <div className="sheen mt-4 rounded-lg border border-emerald-400/40 bg-emerald-400/[0.06] p-4 sm:p-5">
          <p className="flex items-center gap-2 font-display text-lg font-semibold text-emerald-200">
            <Flag className="h-5 w-5" /> Project complete — {parse.table}, A to Z.
          </p>
          <p className="mt-1.5 text-[13px] leading-6 text-zinc-300">
            You took an unclean {project.domainLabel} file from first peek to a defended conclusion — {doneCount} questions,{" "}
            {earnedXp} xp earned on this one table. That is the whole job, start to finish.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ShareCardButton
              spec={cardForProject(parse.table, project.domainLabel, doneCount, project.questions.length, earnedXp)}
              filename={`seeql-capstone-${parse.table}.png`}
              label="Share the finish"
              variant="primary"
            />
            <button
              onClick={() => setCertOpen(true)}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-emerald-400/50 px-3 py-2 text-xs text-emerald-200 transition-colors hover:bg-emerald-400/10"
            >
              <Award className="h-3.5 w-3.5" /> Get your certificate
            </button>
          </div>
        </div>
      )}

      {certOpen && (
        <CapstoneCertificate
          onClose={() => setCertOpen(false)}
          table={parse.table}
          domainLabel={project.domainLabel}
          doneCount={doneCount}
          total={project.questions.length}
          earnedXp={earnedXp}
        />
      )}

      {/* stage detail */}
      {shownStage && (
        <div className="mt-4">
          {shownLocked ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-[13px] text-zinc-400">
              <p className="flex items-center gap-2 font-display text-sm font-semibold text-zinc-200">
                <Lock className="h-4 w-4" /> Stage {shownStage.letter} — {shownStage.title}
              </p>
              <p className="mt-1.5">
                Clear the previous stage first. The gates are the method: you don&apos;t aggregate before you&apos;ve
                audited, and you don&apos;t brief before you&apos;ve ranked.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  stage {shownStage.letter} · {shownStage.title}
                </p>
                <p className="mt-1.5 text-[13px] leading-6 text-zinc-300">{shownStage.why}</p>
              </div>
              <div className="mt-2 space-y-2">
                {(byStage.get(shownStage.id) ?? []).map((q, i) => questionCard(q, i))}
              </div>
            </>
          )}
        </div>
      )}

      {/* workbench */}
      <div className="sheen mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            workbench — read-only (select / with / explain)
          </p>
          <p className="font-mono text-[10px] text-zinc-600">answers are graded from the rows you produce</p>
        </div>
        <div ref={editorRef} className="mt-3 overflow-hidden rounded-md border border-zinc-800">
          <SqlEditor value={sql} onChange={setSql} onVisualize={runQuery} className="min-h-[110px]" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={runQuery}
            disabled={run.running || !sql.trim()}
            className={cn(
              "btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
              (run.running || !sql.trim()) && "cursor-not-allowed opacity-40",
            )}
          >
            {run.running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run &amp; check
          </button>
          {onOpenSandbox && (
            <button
              onClick={() => onOpenSandbox("sandbox")}
              className="btn-quiet rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
              title={`${parse.table} lives in the sandbox too — JOINs against the sample worlds work`}
            >
              Also in CSV sandbox
            </button>
          )}
        </div>
        {run.result && (
          <div className="mt-3.5">
            {!run.result.ok ? (
              <div className="rounded-md border border-rose-400/30 bg-rose-400/[0.06] px-3.5 py-3 font-mono text-xs text-rose-200">
                {run.result.error}
              </div>
            ) : (
              <>
                <p className="tnum mb-1.5 text-[11px] text-zinc-500">
                  {run.result.rowCount.toLocaleString()} rows in {run.result.durationMs} ms
                </p>
                <MiniGrid columns={run.result.columns} rows={run.result.rows} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
