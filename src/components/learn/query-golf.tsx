"use client";

// Query golf — same result, fewer strokes. The starter is correct but
// verbose; write the leanest query that returns the SAME rows, run it
// live, and get graded on strokes (clauses + projected columns — see
// golf-score.ts) plus the engine's own EXPLAIN QUERY PLAN step count.
// Eagle under par, par for the reference shape, bogey when the starter
// is still haunting the query.

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Flag, Gauge, Hammer, Loader2, Play, RotateCcw, Trash2, Trophy, X } from "lucide-react";
import { Icon3D } from "./ui/icon3d";
import { useProgress } from "@/lib/curriculum/progress";
import { GOLF_HOLES, GOLF_XP, type GolfHole } from "@/lib/curriculum/golf";
import { countStrokes, golfVerdict } from "@/lib/curriculum/golf-score";
import type { ExecResponse } from "@/lib/sql-types";
import { cn } from "@/lib/utils";
import { awardPracticeXp, MiniGrid, recordPracticeAttempt, rowsMatch } from "./practice-kit";
import { seeqReact } from "./seeq-mood";
import {
  addCustomHole,
  CUSTOM_HOLES_SERVER_SNAPSHOT,
  getCustomHolesSnapshot,
  removeCustomHole,
  subscribeCustomHoles,
  type CustomHole,
} from "@/lib/curriculum/golf-custom";
import { reportMentorFailure } from "@/lib/mentor-context";
import { SqlEditor } from "../sql-editor";
import { SqlNodes } from "./sql-code";

interface RunState {
  running: boolean;
  result: ExecResponse | null;
  /** the par's live result — the target the learner must reproduce */
  target: ExecResponse | null;
  /** the starter's plan step count, for the scorecard */
  starterPlan: number | null;
  match: boolean | null;
}

function planSteps(r: ExecResponse | null): number | null {
  return r?.ok ? (r.plan?.length ?? null) : null;
}

function GolfHoleCard({ hole, onOpenPerf }: { hole: GolfHole; onOpenPerf?: (sql: string) => void }) {
  const banked = useProgress((s) => s.xpEvents[`golf:${hole.id}`] !== undefined);
  const [sql, setSql] = useState("");
  const [run, setRun] = useState<RunState>({ running: false, result: null, target: null, starterPlan: null, match: null });
  const [solved, setSolved] = useState(false);
  const [showLesson, setShowLesson] = useState(false);

  const parStrokes = useMemo(() => countStrokes(hole.par, hole.starColumns), [hole]);

  // one-time reference runs: the par defines the target rows (and its
  // plan); the starter contributes only its plan step count — the two
  // queries may project different columns (that's the point of hole 1),
  // so the STARTER's rows are NOT the grading target.
  useEffect(() => {
    let alive = true;
    (async () => {
      const [starterRes, parRes] = await Promise.all([
        fetch("/api/query", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sql: hole.starter }) }).then((r) => r.json() as Promise<ExecResponse>),
        fetch("/api/query", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sql: hole.par }) }).then((r) => r.json() as Promise<ExecResponse>),
      ]);
      if (alive) setRun((s) => ({ ...s, target: parRes, starterPlan: planSteps(starterRes) }));
    })();
    return () => {
      alive = false;
    };
  }, [hole.starter, hole.par]);

  async function play() {
    if (run.running || !sql.trim()) return;
    setRun((s) => ({ ...s, running: true }));
    const result = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    }).then((r) => r.json() as Promise<ExecResponse>);
    const target = run.target;
    const match =
      result.ok && target?.ok
        ? rowsMatch(result.rows, target.rows, hole.ordered)
        : false;
    setRun({ running: false, result, target, starterPlan: run.starterPlan, match });
    if (!result.ok) {
      seeqReact("fail");
      // Land the attempt on the mentor's desk — the AI Mentor chat picks it up.
      reportMentorFailure({
        sql: sql.slice(0, 2000),
        error: result.error ?? null,
        note: null,
        source: `Query golf · hole ${hole.id}`,
      });
    } else if (!match) {
      seeqReact("fail");
      reportMentorFailure({
        sql: sql.slice(0, 2000),
        error: null,
        note: "Runs clean, but the rows don't match the hole's target result.",
        source: `Query golf · hole ${hole.id}`,
      });
    }
    if (match) {
      setSolved(true);
      setShowLesson(true);
      const strokes = countStrokes(sql, hole.starColumns);
      const v = golfVerdict(strokes, parStrokes);
      recordPracticeAttempt(hole.skill, `golf:${hole.id}`, true);
      const xp = v.tone === "eagle" ? GOLF_XP.eagle : v.tone === "par" ? GOLF_XP.par : GOLF_XP.bogey;
      awardPracticeXp(`golf:${hole.id}`, xp, `Hole played at ${v.title.toLowerCase()} (${strokes} strokes)`);
    }
  }

  function retry() {
    setSolved(false);
    setShowLesson(false);
    setRun((s) => ({ ...s, result: null, match: null }));
  }

  const attemptStrokes = sql.trim() ? countStrokes(sql, hole.starColumns) : null;

  return (
    <div className="space-y-4">
      {/* tee box */}
      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            {hole.id.toUpperCase()} · par {parStrokes}
          </span>
          {banked && <span className="ml-auto text-[11px] text-zinc-600">played before — replay, no extra XP</span>}
        </div>
        <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-100">{hole.target}</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">the starter (correct, but verbose)</p>
        <div className="mt-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-3 font-mono text-[13px] leading-6 text-zinc-200">
          <SqlNodes text={hole.starter} />
        </div>
      </div>

      {/* the fairway */}
      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Your shot — same rows, fewer strokes ({attemptStrokes ?? "—"} strokes so far)
        </p>
        <div className="mt-3 overflow-hidden rounded-md border border-zinc-800">
          <SqlEditor value={sql} onChange={(v) => setSql(v)} onVisualize={play} className="min-h-[120px]" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={play}
            disabled={run.running || !sql.trim()}
            className={cn(
              "btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
              (run.running || !sql.trim()) && "cursor-not-allowed opacity-40",
            )}
          >
            {run.running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run &amp; score
          </button>
          {(run.result || solved) && !run.running && (
            <button
              onClick={retry}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
            >
              <RotateCcw className="h-3 w-3" /> Re-play
            </button>
          )}
          {run.result?.ok && onOpenPerf && (
            <button
              onClick={() => onOpenPerf(sql.trim() || hole.par)}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
            >
              <Gauge className="h-3 w-3" /> Plan in Perf lab
            </button>
          )}
          <span className="ml-auto text-[11px] text-zinc-600">
            grading: {hole.ordered ? "row order matters" : "row order free"} · SELECT * bills {hole.starColumns} strokes
          </span>
        </div>

        {/* scorecard */}
        {run.result && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="mt-3.5 space-y-3"
          >
            {!run.result.ok ? (
              <div className="rounded-md border border-rose-400/30 bg-rose-400/[0.06] px-3.5 py-3 font-mono text-xs text-rose-200">
                {run.result.error}
              </div>
            ) : run.match ? (
              <div className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <Trophy className="h-4 w-4" /> {golfVerdict(attemptStrokes ?? 99, parStrokes).title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-300">{golfVerdict(attemptStrokes ?? 99, parStrokes).note}</p>
                {run.starterPlan !== null && run.result.ok && run.result.plan && (
                  <p className="tnum mt-1.5 font-mono text-[10px] text-zinc-400">
                    engine scorecard — starter: {run.starterPlan} plan steps · your shot: {run.result.plan.length} plan steps · par: {parStrokes} strokes
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-md border border-amber-400/30 bg-amber-400/[0.06] px-3.5 py-3 text-xs leading-relaxed text-zinc-300">
                <span className="font-semibold text-amber-300">Wrong rows. </span>
                The engine ran it, but the result doesn&apos;t match the target — golf grades rows first,
                strokes second. Compare your grid with the target below.
              </div>
            )}

            {/* grids side by side */}
            {run.result.ok ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">your shot</p>
                  <MiniGrid columns={run.result.columns} rows={run.result.rows} tone={run.match ? "good" : "bad"} />
                </div>
                <div>
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">the target (the par&apos;s rows)</p>
                  <MiniGrid
                    columns={run.target?.ok ? run.target.columns : []}
                    rows={run.target?.ok ? run.target.rows : []}
                    tone="neutral"
                  />
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </div>

      {/* the lesson */}
      {(showLesson || banked) && (
        <div className="sheen rounded-lg border border-violet-400/25 bg-violet-400/[0.05] p-4 sm:p-5">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">
            <Flag className="h-3.5 w-3.5" /> Why the par shape wins
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{hole.lesson}</p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">the par solution</p>
          <div className="mt-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-3 font-mono text-[13px] leading-6 text-zinc-200">
            <SqlNodes text={hole.par} />
          </div>
        </div>
      )}
      {!showLesson && !banked && (
        <button
          onClick={() => setShowLesson(true)}
          className="btn-quiet w-full rounded-md border border-zinc-800 px-4 py-2.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
        >
          Stuck? Reveal the par shape &amp; lesson (no XP yet)
        </button>
      )}
    </div>
  );
}

/** Design-a-hole — write a target, a verbose starter and your leanest par.
 *  Both SQLs are test-run live before saving: the hole only exists if both
 *  RUN clean AND agree on the row count (a golf hole needs a stable target). */
function HoleDesigner({ onCreated }: { onCreated: (id: string) => void }) {
  const [target, setTarget] = useState("");
  const [skill, setSkill] = useState("");
  const [starter, setStarter] = useState("");
  const [par, setPar] = useState("");
  const [testing, setTesting] = useState(false);
  const [verdict, setVerdict] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);

  const ready = target.trim() && starter.trim() && par.trim();

  async function testAndSave() {
    if (testing || !ready) return;
    setTesting(true);
    setVerdict(null);
    try {
      const [starterRes, parRes] = (await Promise.all([
        fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql: starter }),
        }).then((r) => r.json() as Promise<ExecResponse>),
        fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql: par }),
        }).then((r) => r.json() as Promise<ExecResponse>),
      ])) as [ExecResponse, ExecResponse];
      if (!starterRes.ok || !parRes.ok) {
        const bad = !starterRes.ok ? starterRes : !parRes.ok ? parRes : null;
        const which = !starterRes.ok ? "starter" : "par";
        setVerdict({ tone: "bad", text: `The ${which} doesn't run: ${bad?.error ?? "unknown error"}` });
        return;
      }
      if (starterRes.rowCount !== parRes.rowCount) {
        setVerdict({
          tone: "bad",
          text: `They run, but disagree — starter returns ${starterRes.rowCount} rows, par returns ${parRes.rowCount}. A hole needs one stable answer.`,
        });
        return;
      }
      const holes = getCustomHolesSnapshot();
      const hole = addCustomHole({
        target: target.trim(),
        starter: starter.trim().replace(/;+\s*$/, ""),
        par: par.trim().replace(/;+\s*$/, ""),
        skill: skill.trim() || "custom",
        title: `Custom hole · ${target.trim().slice(0, 42)}${target.trim().length > 42 ? "…" : ""}`,
      });
      setVerdict({ tone: "ok", text: `Hole ${hole.id} is live — ${parRes.rowCount} rows in the target.` });
      setTarget("");
      setStarter("");
      setPar("");
      setSkill("");
      onCreated(hole.id);
    } catch {
      setVerdict({ tone: "bad", text: "The test run failed — is the dev server up?" });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="sheen rounded-lg border border-sky-400/25 bg-sky-400/[0.04] p-4 sm:p-5">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-sky-300">
        <Hammer className="h-3.5 w-3.5" /> Design your own hole
      </p>
      <p className="mt-2 text-xs leading-relaxed text-zinc-400">
        Write a target in words, a verbose starter, and your leanest par. Both statements are test-run live — they must execute cleanly
        and return the same number of rows before the hole is saved. Custom holes are graded like any other (order-free, SELECT * costs
        one stroke).
      </p>
      <input
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="The target in words — e.g. “every supplier in the EU with their product count”"
        aria-label="Hole target description"
        className="mt-3 w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
      />
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">the starter (correct, verbose)</p>
          <div className="overflow-hidden rounded-md border border-zinc-800">
            <SqlEditor value={starter} onChange={setStarter} onVisualize={testAndSave} className="min-h-[96px]" />
          </div>
        </div>
        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">your par (lean shape)</p>
          <div className="overflow-hidden rounded-md border border-zinc-800">
            <SqlEditor value={par} onChange={setPar} onVisualize={testAndSave} className="min-h-[96px]" />
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="skill tag (optional)"
          aria-label="Skill tag for the mastery map"
          className="w-44 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
        />
        <button
          onClick={testAndSave}
          disabled={testing || !ready}
          className={cn(
            "btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
            (testing || !ready) && "cursor-not-allowed opacity-40",
          )}
        >
          {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Hammer className="h-3.5 w-3.5" />}
          Test &amp; save hole
        </button>
        {verdict && (
          <span className={cn("font-mono text-xs", verdict.tone === "ok" ? "text-emerald-300" : "text-rose-300")} role="status">
            {verdict.text}
          </span>
        )}
      </div>
    </div>
  );
}

export function QueryGolf({ onOpenPerf }: { onOpenPerf?: (sql: string) => void }) {
  const xpEvents = useProgress((s) => s.xpEvents);
  const custom = useSyncExternalStore(subscribeCustomHoles, getCustomHolesSnapshot, () => CUSTOM_HOLES_SERVER_SNAPSHOT);
  const [idx, setIdx] = useState(0);
  const [designing, setDesigning] = useState(false);
  const holes = useMemo<Array<GolfHole | CustomHole>>(() => [...GOLF_HOLES, ...custom], [custom]);
  const hole = holes[Math.min(idx, holes.length - 1)];
  const played = holes.reduce((n, h) => n + (xpEvents[`golf:${h.id}`] !== undefined ? 1 : 0), 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <Flag className="h-3.5 w-3.5" /> {holes.length} HOLES · STROKES = CLAUSES + COLUMNS
      </p>
      <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="golf" size={40} />Query golf</h1>
      <p className="mt-3 text-[15px] leading-7 text-zinc-400">
        Same result, fewer strokes. Every clause and every projected column is a stroke; the engine&apos;s
        EXPLAIN QUERY PLAN is the scorecard. Run live, graded on rows first and pars second — eagle beats par
        beats bogey. Or design a hole of your own and add it to the course.
      </p>

      <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-300">Round progress</span>
          <span className="tnum text-zinc-500">{played} / {holes.length} holes played</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${(played / holes.length) * 100}%` }} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {holes.map((h, i) => {
          const isCustom = h.id.startsWith("c");
          return (
            <span key={h.id} className="relative inline-flex">
              <button
                onClick={() => setIdx(i)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  isCustom && "pr-7",
                  i === idx
                    ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                    : xpEvents[`golf:${h.id}`] !== undefined
                      ? "border-emerald-400/25 bg-zinc-950 text-emerald-300/70"
                      : isCustom
                        ? "border-sky-400/30 bg-zinc-950 text-sky-300/80 hover:border-sky-400/60 hover:text-sky-200"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
                )}
              >
                {isCustom ? `${h.id} · yours` : h.id.replace("g", "Hole ")}
              </button>
              {isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCustomHole(h.id);
                    if (i === idx) setIdx(0);
                  }}
                  aria-label={`Delete your custom hole ${h.id}`}
                  title={`Delete ${h.id}`}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-600 transition-colors hover:text-rose-300"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              )}
            </span>
          );
        })}
        <button
          onClick={() => setDesigning((d) => !d)}
          className={cn(
            "flex items-center gap-1 rounded-full border border-dashed px-3 py-1.5 text-xs font-medium transition-colors",
            designing
              ? "border-sky-400/60 bg-sky-400/10 text-sky-200"
              : "border-zinc-700 text-zinc-500 hover:border-sky-400/50 hover:text-sky-300",
          )}
          aria-expanded={designing}
        >
          {designing ? <X className="h-3 w-3" /> : <Hammer className="h-3 w-3" />}
          Design a hole
        </button>
      </div>

      <div className="mt-4">
        <GolfHoleCard key={hole.id} hole={hole} onOpenPerf={onOpenPerf} />
      </div>

      {designing && (
        <div className="mt-5">
          <HoleDesigner
            onCreated={(id) => {
              setDesigning(false);
              // read the FRESH store — the `holes` memo in this closure predates the write
              const fresh = getCustomHolesSnapshot();
              const pos = fresh.findIndex((h) => h.id === id);
              if (pos >= 0) setIdx(GOLF_HOLES.length + pos);
            }}
          />
        </div>
      )}
    </div>
  );
}
