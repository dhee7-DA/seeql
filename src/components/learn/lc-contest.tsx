"use client";

// Timed SQL — the LeetCode band's contest hall. Pick a format (sprint /
// standard / one company's set), get a seeded problem set ordered easy→hard,
// and solve against the clock: free runs, real grading, no solution reveals
// until the report. Solves pay their normal lc: XP; a perfect sweep pays a
// once-per-day bonus. Runs bank into lcContests for personal bests.
//
// The run lives in component state on purpose — a contest you can pause
// isn't a contest. Leaving the tab mid-run aborts it (the lobby says so).

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Check,
  ChevronRight,
  Flag,
  Play,
  Timer,
  TriangleAlert,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { contestSet, CONTEST_COMPANIES } from "@/lib/leetcode/lc-meta";
import { lcSqlDive } from "@/lib/leetcode/content/content";
import { lcSqlExpected } from "@/lib/leetcode/content/sql-expected";
import { gradeSqlResult, type SqlCheckOutcome } from "@/lib/leetcode/sql-check";
import { lcSolveKey, type LcRef, type LcSqlDive } from "@/lib/leetcode/types";
import { dayKey } from "@/lib/curriculum/gamification";
import { useProgress } from "@/lib/curriculum/progress";
import type { ExecResult } from "@/lib/sql-types";
import { celebrate } from "./celebrate";
import { SqlProse } from "./lc-dive-ui";
import { ResultGrid } from "./result-grid";
import { SqlEditor } from "@/components/sql-editor";
import { Btn, Panel, ProgressBar, SectionLabel } from "./ui/kit";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Formats                                                             */
/* ------------------------------------------------------------------ */

interface Format {
  id: "sprint" | "standard" | "company";
  title: string;
  detail: string;
  n: number;
  minutes: number;
}

const FORMATS: Format[] = [
  { id: "sprint", title: "Sprint", detail: "3 problems · 30 min · warm-up pace", n: 3, minutes: 30 },
  { id: "standard", title: "Standard", detail: "4 problems · 60 min · the classic set", n: 4, minutes: 60 },
  { id: "company", title: "Company run", detail: "5 problems · 75 min · one employer's pool", n: 5, minutes: 75 },
];

const SWEEP_BONUS = 25;

type Phase = "lobby" | "run" | "report";

interface Slot {
  p: LcRef;
  dive: LcSqlDive;
  sql: string;
  result: ExecResult | null;
  error: string | null;
  outcome: SqlCheckOutcome | null;
  runs: number;
}

const fmtClock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/* ------------------------------------------------------------------ */
/* Run slot — one problem's editor + grading                           */
/* ------------------------------------------------------------------ */

function SlotPanel({
  slot,
  index,
  total,
  onChange,
  onRun,
  busy,
}: {
  slot: Slot;
  index: number;
  total: number;
  onChange: (sql: string) => void;
  onRun: (check: boolean) => void;
  busy: boolean;
}) {
  const [showSchema, setShowSchema] = useState(false);
  const passed = slot.outcome?.status === "pass";
  return (
    <Panel pad={4}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            problem {index + 1} of {total} · {slot.p.difficulty} · {slot.p.companies.slice(0, 3).join(" · ")}
          </p>
          <h3 className="mt-0.5 truncate text-base font-bold text-zinc-100">
            {slot.p.num}. {slot.p.title}
          </h3>
        </div>
        {passed && (
          <span className="flex items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            <Check className="h-3 w-3" /> passed
          </span>
        )}
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">
        <SqlProse text={slot.dive.statement} />
      </p>
      <button
        type="button"
        onClick={() => setShowSchema((v) => !v)}
        className="mt-2 font-mono text-[10px] uppercase tracking-wider text-cyan-300 hover:text-cyan-200"
      >
        {showSchema ? "hide schema" : "show schema"}
      </button>
      {showSchema && (
        <pre className="thin-scrollbar mt-2 max-h-56 overflow-auto rounded-md border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] leading-5 text-zinc-300">
          {slot.dive.schema.ddl}
        </pre>
      )}
      <div className="mt-3">
        <SqlEditor value={slot.sql} onChange={onChange} onVisualize={() => onRun(false)} className="min-h-[110px]" />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Btn variant="outline" disabled={busy || !slot.sql.trim()} onClick={() => onRun(false)}>
          <Play className="h-3.5 w-3.5" /> Run
        </Btn>
        <Btn variant="primary" disabled={busy || !slot.sql.trim()} onClick={() => onRun(true)}>
          <Check className="h-3.5 w-3.5" /> {passed ? "Re-check" : "Submit"}
        </Btn>
      </div>
      {slot.error && (
        <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-400/[0.06] p-3 font-mono text-[12px] text-zinc-300">
          {slot.error}
        </div>
      )}
      {slot.outcome && (
        <div
          className={cn(
            "mt-3 rounded-lg border p-3",
            passed ? "border-emerald-400/30 bg-emerald-400/[0.06]" : "border-amber-400/30 bg-amber-400/[0.06]",
          )}
        >
          <p className={cn("font-mono text-[10px] uppercase tracking-wider", passed ? "text-emerald-300" : "text-amber-300")}>
            {slot.outcome.title}
          </p>
          <p className="mt-1 text-[12px] text-zinc-400">{slot.outcome.detail}</p>
        </div>
      )}
      {slot.result && (
        <div className="mt-3">
          <ResultGrid data={{ columns: slot.result.columns, rows: slot.result.rows }} />
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function LcContest() {
  const awardXp = useProgress((s) => s.awardXp);
  const scheduleReview = useProgress((s) => s.scheduleReview);
  const saveContest = useProgress((s) => s.saveContest);
  const lcContests = useProgress((s) => s.lcContests);
  const xpEvents = useProgress((s) => s.xpEvents);

  const [phase, setPhase] = useState<Phase>("lobby");
  const [fmtId, setFmtId] = useState<Format["id"]>("standard");
  const [company, setCompany] = useState<string>("All");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [cur, setCur] = useState(0);
  const [busy, setBusy] = useState(false);
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [verdict, setVerdict] = useState<{ solved: number; total: number; how: "sweep" | "time" | "abort"; bonusXp: number; durationSec: number } | null>(null);
  const runIdRef = useRef("");

  const fmt = FORMATS.find((f) => f.id === fmtId)!;
  const COMPANY_POOL = CONTEST_COMPANIES.map((c) => c.name);

  // ticking clock while a run is live
  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => clearInterval(t);
  }, [phase]);

  // time-up watch
  useEffect(() => {
    if (phase !== "run" || endsAt === 0) return;
    if (now >= endsAt) finish("time");
  }, [now, phase, endsAt]);

  // sweep watch — every slot passed lands the report
  useEffect(() => {
    if (phase !== "run" || slots.length === 0) return;
    if (slots.every((s) => s.outcome?.status === "pass")) finish("sweep");
  }, [slots, phase]);

  const solvedCount = slots.filter((s) => s.outcome?.status === "pass").length;
  const remaining = phase === "run" ? Math.max(0, endsAt - now) : 0;

  function start() {
    const seed = Date.now();
    runIdRef.current = `ct-${seed}`;
    const set = contestSet(fmt.n, seed, company);
    const next: Slot[] = set
      .filter((p) => lcSqlDive(p.slug) !== undefined)
      .map((p) => ({ p, dive: lcSqlDive(p.slug)!, sql: "", result: null, error: null, outcome: null, runs: 0 }));
    if (next.length === 0) return;
    setSlots(next);
    setCur(0);
    setVerdict(null);
    setStartedAt(Date.now());
    setEndsAt(Date.now() + fmt.minutes * 60_000);
    setNow(Date.now());
    setPhase("run");
  }

  function finish(how: "sweep" | "time" | "abort") {
    const solved = slots.filter((s) => s.outcome?.status === "pass").length;
    const total = slots.length;
    const durationSec = Math.round((Date.now() - startedAt) / 1000);
    const perfect = how === "sweep" && solved === total && total > 0;
    let bonusXp = 0;
    if (perfect) {
      const key = `lc-contest:${dayKey()}`;
      if (awardXp(key, SWEEP_BONUS)) bonusXp = SWEEP_BONUS;
    }
    saveContest({
      id: runIdRef.current,
      at: Date.now(),
      label: fmt.id === "company" ? `Company · ${company}` : `${fmt.title} · ${total} problems`,
      solved,
      total,
      durationSec,
    });
    setVerdict({ solved, total, how, bonusXp, durationSec });
    setPhase("report");
  }

  async function run(check: boolean) {
    const slot = slots[cur];
    if (busy || !slot || !slot.sql.trim()) return;
    setBusy(true);
    setSlots((prev) =>
      prev.map((s, i) => (i === cur ? { ...s, error: null, outcome: null, runs: s.runs + 1 } : s)),
    );
    try {
      const res = await fetch("/api/lc-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slot.p.slug, sql: slot.sql }),
      });
      const data = (await res.json()) as ExecResult | { ok: false; error: string };
      if (!data.ok) {
        setSlots((prev) => prev.map((s, i) => (i === cur ? { ...s, result: null, error: "error" in data ? data.error : "Query failed" } : s)));
      } else {
        const expected = lcSqlExpected(slot.p.slug);
        const oc = expected ? gradeSqlResult(data, expected) : null;
        setSlots((prev) =>
          prev.map((s, i) => (i === cur ? { ...s, result: data, outcome: oc, error: null } : s)),
        );
        if (oc) {
          if (oc.status === "pass") {
            if (awardXp(lcSolveKey(slot.p.slug), slot.dive.xp)) {
              scheduleReview(`lcm:${slot.p.slug}`, true);
              celebrate({ kind: "xp", title: `+${slot.dive.xp} XP — ${slot.p.title}`, sub: "Contest solve · on the clock" });
            }
          } else if (check) {
            scheduleReview(`lcm:${slot.p.slug}`, false);
          }
          if (oc.status === "pass") {
            // jump to the next unsolved slot (the sweep effect lands the report)
            const nextIdx = slots.findIndex((s, i) => i !== cur && s.outcome?.status !== "pass");
            if (nextIdx !== -1) setCur(nextIdx);
          }
        }
      }
    } catch {
      setSlots((prev) => prev.map((s, i) => (i === cur ? { ...s, error: "Network error — try again.", result: null } : s)));
    } finally {
      setBusy(false);
    }
  }

  /* ---------------- lobby ---------------- */
  if (phase === "lobby") {
    const runs = lcContests ?? [];
    const bestByLabel = new Map<string, { solved: number; total: number; durationSec: number }>();
    for (const r of runs) {
      const b = bestByLabel.get(r.label);
      if (!b || r.solved > b.solved || (r.solved === b.solved && r.durationSec < b.durationSec)) {
        bestByLabel.set(r.label, { solved: r.solved, total: r.total, durationSec: r.durationSec });
      }
    }
    return (
      <div className="space-y-4">
        <Panel pad={4}>
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold">Timed SQL</h2>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
            A contest set drawn from the sandbox-graded pool — every problem real, every answer engine-verified.
            Solves pay their normal XP, a perfect sweep pays a once-a-day bonus, and the report lands whether
            you finish or the clock does. One rule: <span className="text-zinc-300">the run lives on this
            screen</span> — leaving mid-run aborts it.
          </p>
        </Panel>

        <div className="grid gap-3 sm:grid-cols-3">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFmtId(f.id)}
              className={cn(
                "cursor-pointer rounded-xl border p-4 text-left transition-colors",
                fmtId === f.id
                  ? "border-emerald-400/40 bg-emerald-400/[0.06]"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-600",
              )}
            >
              <p className={cn("text-sm font-semibold", fmtId === f.id ? "text-emerald-200" : "text-zinc-100")}>{f.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{f.detail}</p>
              {bestByLabel.get(f.id === "company" ? `Company · ${company}` : `${f.title} · ${f.n} problems`) && (
                <p className="tnum mt-2 font-mono text-[10px] text-emerald-300/80">
                  best: {bestByLabel.get(f.id === "company" ? `Company · ${company}` : `${f.title} · ${f.n} problems`)!.solved}/{f.n}
                </p>
              )}
            </button>
          ))}
        </div>

        {fmtId === "company" && (
          <Panel pad={3.5}>
            <label className="flex items-center gap-2 text-xs text-zinc-400" htmlFor="contest-company">
              <Building2 className="h-3.5 w-3.5" /> company pool
            </label>
            <select
              id="contest-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-400/60"
            >
              <option value="All">Any company (mixed pool)</option>
              {COMPANY_POOL.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Panel>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Btn variant="primary" onClick={start}>
            <Play className="h-3.5 w-3.5" /> Start the clock
          </Btn>
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-600">
            <TriangleAlert className="h-3 w-3" /> no pauses — the clock runs while you read the schema
          </span>
        </div>

        {runs.length > 0 && (
          <Panel pad={4}>
            <SectionLabel>recent runs</SectionLabel>
            <div className="mt-2 space-y-1.5">
              {runs.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-[11px]">
                  <span className="truncate text-zinc-300">{r.label}</span>
                  <span className="tnum shrink-0 font-mono text-zinc-500">
                    {r.solved}/{r.total} · {fmtClock(r.durationSec * 1000)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    );
  }

  /* ---------------- report ---------------- */
  if (phase === "report" && verdict) {
    const sweep = verdict.how === "sweep";
    return (
      <div className="space-y-4">
        <Panel pad={5}>
          <div className="flex items-center gap-2">
            <Trophy className={cn("h-5 w-5", sweep ? "text-amber-300" : "text-zinc-400")} />
            <h2 className="text-lg font-semibold">
              {sweep ? "Clean sweep" : verdict.how === "time" ? "Time" : "Run ended"}
            </h2>
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            {verdict.solved}/{verdict.total} solved · {fmtClock(verdict.durationSec * 1000)} on the clock.
            {verdict.how === "time" && verdict.solved < verdict.total && " The clock won this one — every problem stays open in the band for a proper deep-dive."}
          </p>
          {verdict.bonusXp > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-amber-300">
              <Zap className="h-4 w-4" /> perfect sweep bonus +{verdict.bonusXp} XP (once a day)
            </p>
          )}
          <ProgressBar value={verdict.total ? verdict.solved / verdict.total : 0} className="mt-3" />
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn variant="primary" onClick={() => setPhase("lobby")}>
              Back to the lobby
            </Btn>
          </div>
        </Panel>
        <div className="space-y-2">
          {slots.map((s, i) => (
            <Panel key={s.p.slug} pad={3.5}>
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-xs font-medium text-zinc-200">
                  {i + 1}. {s.p.num}. {s.p.title}
                </p>
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px]",
                    s.outcome?.status === "pass"
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border-zinc-700 text-zinc-500",
                  )}
                >
                  {s.outcome?.status === "pass" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {s.outcome?.status === "pass" ? "solved" : "unsolved"} · {s.runs} run{s.runs === 1 ? "" : "s"}
                </span>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    );
  }

  /* ---------------- run ---------------- */
  const slot = slots[cur];
  if (!slot) return null;
  const lowTime = remaining < 5 * 60_000;
  return (
    <div className="space-y-4">
      <Panel pad={3.5} className="sticky top-2 z-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {slots.map((s, i) => (
              <button
                key={s.p.slug}
                type="button"
                onClick={() => setCur(i)}
                aria-label={`Problem ${i + 1}`}
                className={cn(
                  "h-7 w-7 cursor-pointer rounded-md border font-mono text-[10px]",
                  i === cur
                    ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                    : s.outcome?.status === "pass"
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-600",
                )}
              >
                {s.outcome?.status === "pass" ? <Check className="mx-auto h-3 w-3" /> : i + 1}
              </button>
            ))}
            <span className="tnum ml-1 font-mono text-[10px] text-zinc-500">
              {solvedCount}/{slots.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "tnum flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-semibold",
                lowTime ? "border-rose-400/40 bg-rose-400/10 text-rose-300" : "border-zinc-800 bg-zinc-900/60 text-zinc-300",
              )}
            >
              <Timer className="h-3.5 w-3.5" /> {fmtClock(remaining)}
            </span>
            <Btn variant="outline" onClick={() => finish("abort")}>
              <Flag className="h-3 w-3" /> End run
            </Btn>
          </div>
        </div>
        <ProgressBar value={1 - remaining / (fmt.minutes * 60_000)} fine className="mt-2.5" />
      </Panel>

      <SlotPanel
        slot={slot}
        index={cur}
        total={slots.length}
        busy={busy}
        onChange={(sql) => setSlots((prev) => prev.map((s, i) => (i === cur ? { ...s, sql } : s)))}
        onRun={(check) => void run(check)}
      />

      {cur < slots.length - 1 && (
        <Btn variant="soft" onClick={() => setCur(cur + 1)} className="w-full">
          Next problem <ChevronRight className="h-3.5 w-3.5" />
        </Btn>
      )}
    </div>
  );
}
