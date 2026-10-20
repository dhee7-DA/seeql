"use client";

// Interview sim — the flagship loop. Where Mock HQ runs a rapid quiz hall and
// the per-kit MockRound grades one company's screen, this is the full onsite
// simulation at ONE company (or a loop day across many): four stages back to
// back, one clock per stage, no feedback until the debrief —
//
//   1. Screening    6 MCQs, 40s each, answers locked silently
//   2. Live coding  2 sandbox problems, 7 min each, run freely, submit/park
//   3. Case round   1 stakeholder memo, sketch the approach, panel reveal
//   4. Theory close 2 spoken-style questions, self-marked vs the model answer
//
// Scoring: 6 + 2 + 1 + 2 = 11 points. The debrief names every miss, unlocks
// the coding reference solutions, and banks completion XP (idempotent) like a
// mock. Screening answers, theory marks and coding misses all feed the shared
// review machinery — a parked problem comes back tomorrow, not never.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  Flag,
  Globe2,
  MessagesSquare,
  Mic,
  RotateCcw,
  Search,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { COMPANY_DOMAINS, COMPANY_KITS, companyKit } from "@/lib/companies/registry";
import type { CompanyDomain, CompanyKit } from "@/lib/companies/types";
import type { TheoryQa } from "@/lib/companies/types";
import type { CaseStudy } from "@/lib/curriculum/cases/types";
import type { Mcq } from "@/lib/curriculum/types";
import { XP } from "@/lib/curriculum/gamification";
import { lcSqlDive } from "@/lib/leetcode/content/content";
import type { LcSqlDive } from "@/lib/leetcode/types";
import { lcBySlug } from "@/lib/leetcode/registry";
import { gradeSqlResult } from "@/lib/leetcode/sql-check";
import { lcSqlExpected } from "@/lib/leetcode/content/sql-expected";
import { useUniverse, type InterviewRun, type TheoryMark } from "@/lib/universe/progress";
import { useProgress } from "@/lib/curriculum/progress";
import { reportMentorFailure } from "@/lib/mentor-context";
import type { ExecResult } from "@/lib/sql-types";
import { SqlEditor } from "../sql-editor";
import { SqlNodes } from "./sql-code";
import { MiniGrid } from "./practice-kit";
import { Btn, Panel } from "./ui/kit";
import { cn } from "@/lib/utils";

/* ---------------- loop shape ---------------- */

const SCREEN_QS = 6;
const SCREEN_SECONDS = 40;
const CODE_N = 2;
const CODE_SECONDS = 7 * 60;
const CASE_SECONDS = 6 * 60;
const THEORY_QS = 2;
const THEORY_SECONDS = 150;
/** screen 6 + coding 2 + case 1 + theory 2. */
const MAX_POINTS = SCREEN_QS + CODE_N + 1 + THEORY_QS;

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;
const fmtAgo = (ts: number) => {
  const m = Math.round((Date.now() - ts) / 60_000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface DrawnMcq { kit: CompanyKit; mcq: Mcq }
interface DrawnProblem { kit: CompanyKit; slug: string; why: string; dive: LcSqlDive; difficulty: string }
interface DrawnCase { kit: CompanyKit; cs: CaseStudy }
interface DrawnTheory { kit: CompanyKit; t: TheoryQa }
interface Loop {
  mcqs: DrawnMcq[];
  problems: DrawnProblem[];
  case: DrawnCase | null;
  theory: DrawnTheory[];
}

/** Draw one loop from a pool of kits — one question per company first
 *  (the loop should feel like meeting the firm, not one team's back catalog). */
function drawLoop(pool: CompanyKit[]): Loop {
  const kits = shuffle(pool);

  const mcqs: DrawnMcq[] = [];
  const used = new Set<string>();
  for (const kit of kits) {
    if (mcqs.length >= SCREEN_QS) break;
    const q = shuffle(kit.mcqs)[0];
    if (q && !used.has(q.id)) { used.add(q.id); mcqs.push({ kit, mcq: q }); }
  }
  for (const kit of kits) {
    if (mcqs.length >= SCREEN_QS) break;
    for (const q of shuffle(kit.mcqs)) {
      if (mcqs.length >= SCREEN_QS) break;
      if (!used.has(q.id)) { used.add(q.id); mcqs.push({ kit, mcq: q }); }
    }
  }

  const problems: DrawnProblem[] = [];
  const pushProblem = (kit: CompanyKit, slug: string, why: string, dive: LcSqlDive) =>
    problems.push({ kit, slug, why, dive, difficulty: lcBySlug(slug)?.difficulty ?? "sandbox" });
  // one problem per company first (a loop day meets several firms), then top up
  // wherever needed — a single-company loop must still fill both slots
  for (const kit of kits) {
    if (problems.length >= CODE_N) break;
    const cand = shuffle(kit.problems)
      .map((p) => ({ p, dive: lcSqlDive(p.slug) }))
      .find((x) => x.dive && lcSqlExpected(x.p.slug) && !problems.some((q) => q.slug === x.p.slug));
    if (cand?.dive) pushProblem(kit, cand.p.slug, cand.p.why, cand.dive);
  }
  for (const kit of kits) {
    if (problems.length >= CODE_N) break;
    for (const p of shuffle(kit.problems)) {
      if (problems.length >= CODE_N) break;
      const dive = lcSqlDive(p.slug);
      if (dive && lcSqlExpected(p.slug) && !problems.some((q) => q.slug === p.slug))
        pushProblem(kit, p.slug, p.why, dive);
    }
  }

  const caseKit = kits.find((k) => k.cases.length > 0);
  const drawnCase: DrawnCase | null = caseKit ? { kit: caseKit, cs: shuffle(caseKit.cases)[0] } : null;

  const theory: DrawnTheory[] = [];
  for (const kit of kits) {
    if (theory.length >= THEORY_QS) break;
    const t = shuffle(kit.theory)[0];
    if (t) theory.push({ kit, t });
  }
  for (const kit of kits) {
    if (theory.length >= THEORY_QS) break;
    for (const t of shuffle(kit.theory)) {
      if (theory.length >= THEORY_QS) break;
      if (!theory.some((d) => d.t.id === t.id)) theory.push({ kit, t });
    }
  }

  return { mcqs, problems, case: drawnCase, theory };
}

/** The case template with its {n} markers replaced by the correct chips —
 *  the query the panel wanted, reconstructed for the debrief. */
function caseSolutionSql(cs: CaseStudy): string {
  return cs.template.replace(/\{(\d+)\}/g, (_, d: string) => cs.slots[Number(d) - 1]?.answer ?? "…");
}

const STAGES = [
  { kind: "screen", label: "Screening", icon: Mic },
  { kind: "coding", label: "Live coding", icon: Code2 },
  { kind: "case", label: "Case round", icon: FileText },
  { kind: "theory", label: "Theory close", icon: MessagesSquare },
] as const;

type Phase = "intro" | "run" | "debrief";

export function InterviewSim({ openLc }: { openLc?: (slug: string) => void }) {
  const [seed, setSeed] = useState(0);
  /** "all" | "d:<domainId>" | <kitId> */
  const [target, setTarget] = useState<string>("all");
  const [phase, setPhase] = useState<Phase>("intro");
  const [stageIdx, setStageIdx] = useState(0);

  // screening
  const [qIdx, setQIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({}); // -1 = the clock answered
  // coding
  const [pIdx, setPIdx] = useState(0);
  const [sqlBySlug, setSqlBySlug] = useState<Record<string, string>>({});
  const [runBySlug, setRunBySlug] = useState<Record<string, ExecResult | { ok: false; error: string } | null>>({});
  const [codeLocked, setCodeLocked] = useState<Record<string, boolean>>({});
  const [codePassed, setCodePassed] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  // case
  const [caseSketch, setCaseSketch] = useState("");
  const [caseRevealed, setCaseRevealed] = useState(false);
  const [caseMark, setCaseMark] = useState<TheoryMark | null>(null);
  // theory
  const [tIdx, setTIdx] = useState(0);
  const [tRevealed, setTRevealed] = useState<Record<number, boolean>>({});
  const [tMarks, setTMarks] = useState<Record<number, TheoryMark>>({});
  // clocks
  const [left, setLeft] = useState(SCREEN_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef(0);
  // debrief
  const [bankedXp, setBankedXp] = useState<number | null>(null);
  const bankedRef = useRef(false);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // intro picker
  const [filter, setFilter] = useState("");

  useEffect(() => () => { if (advanceRef.current) clearTimeout(advanceRef.current); }, []);

  const pool = useMemo(() => {
    if (target === "all") return Object.values(COMPANY_KITS);
    if (target.startsWith("d:")) {
      const d = COMPANY_DOMAINS.find((x) => x.id === target.slice(2));
      return d ? d.companies.map((id) => companyKit(id)).filter((k): k is CompanyKit => !!k) : [];
    }
    const k = companyKit(target);
    return k ? [k] : [];
  }, [target]);

  const loop = useMemo(() => drawLoop(pool), [seed, pool]);

  const history = useUniverse((s) => s.interviews ?? []);

  /* ---------------- flow ---------------- */

  const start = (t: string) => {
    if (advanceRef.current) clearTimeout(advanceRef.current);
    setTarget(t);
    bankedRef.current = false;
    setBankedXp(null);
    setSeed((v) => v + 1);
    setPhase("run");
    setStageIdx(0);
    setQIdx(0);
    setPicks({});
    setPIdx(0);
    setSqlBySlug({});
    setRunBySlug({});
    setCodeLocked({});
    setCodePassed({});
    setRunning(false);
    setShowSchema(false);
    setCaseSketch("");
    setCaseRevealed(false);
    setCaseMark(null);
    setTIdx(0);
    setTRevealed({});
    setTMarks({});
    startedAtRef.current = Date.now();
    setElapsed(0);
    setLeft(SCREEN_SECONDS);
  };

  const endLoop = () => {
    if (advanceRef.current) clearTimeout(advanceRef.current);
    setPhase("debrief");
  };

  const tick = () => {
    setElapsed((e) => e + 1);
    setLeft((l) => (l > 0 ? l - 1 : 0));
  };

  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, seed]);

  /* ---------------- stage transitions ---------------- */

  const toCoding = () => { setStageIdx(1); setPIdx(0); setShowSchema(false); setLeft(CODE_SECONDS); };
  const toCase = () => { setStageIdx(2); setCaseRevealed(false); setLeft(CASE_SECONDS); };
  const toTheory = () => { setStageIdx(3); setTIdx(0); setTRevealed({}); setTMarks({}); setLeft(THEORY_SECONDS); };

  const nextScreen = () => {
    if (qIdx + 1 >= loop.mcqs.length) toCoding();
    else { setQIdx((v) => v + 1); setLeft(SCREEN_SECONDS); }
  };

  const nextProblem = () => {
    if (pIdx + 1 >= loop.problems.length) toCase();
    else { setPIdx((v) => v + 1); setShowSchema(false); setLeft(CODE_SECONDS); }
  };

  const nextTheory = () => {
    if (tIdx + 1 >= loop.theory.length) setPhase("debrief");
    else { setTIdx((v) => v + 1); setTRevealed({}); setLeft(THEORY_SECONDS); }
  };

  // time's up, per stage — fires once when `left` lands on 0
  useEffect(() => {
    if (phase !== "run" || left > 0) return;
    const kind = STAGES[stageIdx].kind;
    if (kind === "screen") {
      const d = loop.mcqs[qIdx];
      if (d && picks[d.mcq.id] === undefined) {
        useUniverse.getState().recordMockMcq(d.kit.id, d.mcq.id, false);
        setPicks((p) => ({ ...p, [d.mcq.id]: -1 }));
        advanceRef.current = setTimeout(nextScreen, 700);
      }
    } else if (kind === "coding") {
      const p = loop.problems[pIdx];
      if (p && !codeLocked[p.slug]) {
        reportMentorFailure({
          sql: (sqlBySlug[p.slug] ?? "").slice(0, 2000),
          error: null,
          note: "The 7-minute clock parked this one — it went unsolved in the loop.",
          source: `Interview sim · ${p.kit.name} · ${p.slug}`,
        });
        setCodePassed((c) => ({ ...c, [p.slug]: false }));
        setCodeLocked((c) => ({ ...c, [p.slug]: true }));
        advanceRef.current = setTimeout(nextProblem, 800);
      }
    } else if (kind === "case") {
      // the panel stops waiting and puts the walkthrough on the table;
      // the self-mark is still yours to give
      if (!caseRevealed) setCaseRevealed(true);
    } else if (kind === "theory") {
      // the panel moved on — an unmarked question scores zero
      if (tMarks[tIdx] === undefined) {
        const t = loop.theory[tIdx];
        if (t) {
          useUniverse.getState().recordTheory(t.kit.id, t.t.id, 0);
          setTMarks((m) => ({ ...m, [tIdx]: 0 }));
        }
        advanceRef.current = setTimeout(nextTheory, 700);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase]);

  /* ---------------- stage 1: screening ---------------- */

  const pickMcq = (ci: number) => {
    const d = loop.mcqs[qIdx];
    if (!d || picks[d.mcq.id] !== undefined) return;
    useUniverse.getState().recordMockMcq(d.kit.id, d.mcq.id, ci === d.mcq.answer);
    setPicks((p) => ({ ...p, [d.mcq.id]: ci }));
    advanceRef.current = setTimeout(nextScreen, 650);
  };

  /* ---------------- stage 2: live coding ---------------- */

  const curProblem = loop.problems[pIdx];

  const runSql = async () => {
    if (!curProblem || running || !sqlBySlug[curProblem.slug]?.trim()) return;
    setRunning(true);
    try {
      const res = await fetch("/api/lc-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: curProblem.slug, sql: sqlBySlug[curProblem.slug] }),
      });
      const data = (await res.json()) as ExecResult | { ok: false; error: string };
      setRunBySlug((r) => ({ ...r, [curProblem.slug]: data }));
    } catch {
      setRunBySlug((r) => ({ ...r, [curProblem.slug]: { ok: false, error: "Network error — try again." } }));
    } finally {
      setRunning(false);
    }
  };

  const finishProblem = (pass: boolean, parked: boolean) => {
    if (!curProblem || codeLocked[curProblem.slug]) return;
    const slug = curProblem.slug;
    const lastRun = runBySlug[slug];
    if (pass) {
      // first solve anywhere banks the dive's own XP — same idempotent key
      useProgress.getState().awardXp(`lc:${slug}`, curProblem.dive.xp);
    } else {
      reportMentorFailure({
        sql: (sqlBySlug[slug] ?? "").slice(0, 2000),
        error: lastRun && !lastRun.ok ? lastRun.error : null,
        note: parked
          ? "Parked in the interview loop — the reference solution is in the debrief."
          : "Submitted with rows that didn't match the expected answer.",
        source: `Interview sim · ${curProblem.kit.name} · ${slug}`,
      });
    }
    // every loop problem lands on the review ladder — pass advances, miss returns tomorrow
    useProgress.getState().scheduleReview(`ulc:${curProblem.kit.id}:${slug}`, pass);
    setCodePassed((c) => ({ ...c, [slug]: pass }));
    setCodeLocked((c) => ({ ...c, [slug]: true }));
    advanceRef.current = setTimeout(nextProblem, 800);
  };

  const submitCode = () => {
    if (!curProblem || codeLocked[curProblem.slug]) return;
    const slug = curProblem.slug;
    const lastRun = runBySlug[slug];
    const expected = lcSqlExpected(slug);
    if (!lastRun || !lastRun.ok || !expected) return; // must run before submitting
    const verdict = gradeSqlResult(lastRun, expected);
    finishProblem(verdict.status === "pass", false);
  };

  /* ---------------- stage 3 + 4: case & theory marks ---------------- */

  const markCase = (v: TheoryMark) => { setCaseMark(v); };

  const markTheory = (v: TheoryMark) => {
    const t = loop.theory[tIdx];
    if (!t || tMarks[tIdx] !== undefined) return;
    useUniverse.getState().recordTheory(t.kit.id, t.t.id, v);
    setTMarks((m) => ({ ...m, [tIdx]: v }));
  };

  /* ---------------- scoring + bank ---------------- */

  const screenOk = loop.mcqs.filter((d) => picks[d.mcq.id] === d.mcq.answer).length;
  const codingOk = loop.problems.filter((p) => codePassed[p.slug]).length;
  const casePts = caseMark ?? 0;
  const theoryScore = loop.theory.reduce((n, _d, i) => n + (tMarks[i] ?? 0), 0);
  const points = screenOk + codingOk + casePts + theoryScore;
  const pct = Math.round((points / MAX_POINTS) * 100);

  useEffect(() => {
    if (phase !== "debrief" || bankedRef.current) return;
    bankedRef.current = true;
    const kitIds = [...new Set([
      ...loop.mcqs.map((d) => d.kit.id),
      ...loop.problems.map((p) => p.kit.id),
      ...(loop.case ? [loop.case.kit.id] : []),
      ...loop.theory.map((t) => t.kit.id),
    ])];
    const label =
      target === "all"
        ? `Loop day · ${kitIds.length} companies`
        : target.startsWith("d:")
          ? `${COMPANY_DOMAINS.find((x) => x.id === target.slice(2))?.name ?? "Domain"} loop · ${kitIds.length} companies`
          : `${companyKit(target)?.name ?? "Company"} loop`;
    const banked = useUniverse.getState().saveInterview({
      kitIds,
      label,
      screen: { ok: screenOk, n: loop.mcqs.length },
      coding: { ok: codingOk, n: loop.problems.length },
      caseMark: casePts,
      theory: { score: theoryScore, total: loop.theory.length },
      pct,
      durationSec: Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
    });
    setBankedXp(banked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const verdict =
    pct >= 80
      ? { cls: "text-emerald-300", label: "Strong hire signal", msg: "Panel wrap-up: every stage held. This is onsite-passing shape — keep it warm and schedule the real thing." }
      : pct >= 60
      ? { cls: "text-sky-300", label: "Hire lean", msg: "The loop leaned yes with notes. One stage leaked — the debrief below names it, and that is your next drill." }
      : pct >= 45
      ? { cls: "text-amber-300", label: "Borderline", msg: "A real split decision. The fundamentals showed up, the depth didn't — work the misses list top to bottom." }
      : { cls: "text-rose-300", label: "No this time", msg: "The loop got you. That is what sims are for — every miss below is now on the review ladder with a date." };

  const introCompanies = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const all = Object.values(COMPANY_KITS);
    const list = q ? all.filter((k) => k.name.toLowerCase().includes(q) || k.id.includes(q)) : all;
    return list.slice(0, 8);
  }, [filter]);

  const bestFor = (kitId: string) =>
    history.filter((r) => r.kitIds.includes(kitId)).reduce((b, r) => Math.max(b, r.pct), -1);

  /* ---------------- intro ---------------- */

  if (phase === "intro") {
    return (
      <div className="max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Practice lab</p>
        <h1 className="font-display mt-2 flex items-center gap-3 text-2xl font-semibold tracking-tight text-zinc-50">
          <Mic className="h-6 w-6 text-emerald-300" /> Interview sim
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          The full onsite, simulated: four stages back to back at one company — screening, live coding on a
          running sandbox, a case round, and the theory close. No feedback until the debrief, exactly like the
          real room. About 30 minutes, all on the record.
        </p>

        <Panel className="mt-5" pad={4}>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {STAGES.map((s, i) => (
              <div key={s.kind} className="flex items-start gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5">
                <s.icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-100">
                    <span className="tnum font-mono text-[10px] text-zinc-500">{i + 1}</span> · {s.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                    {s.kind === "screen" && `${SCREEN_QS} questions · ${SCREEN_SECONDS}s each · the clock answers for you`}
                    {s.kind === "coding" && `${CODE_N} problems · ${CODE_SECONDS / 60} min each · run freely, then submit or park it`}
                    {s.kind === "case" && `1 memo · ${CASE_SECONDS / 60} min · sketch the approach, then the panel reveals`}
                    {s.kind === "theory" && `${THEORY_QS} questions · ${THEORY_SECONDS / 60} min each · say it, then self-mark`}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
            Scored out of {MAX_POINTS} points — {SCREEN_QS} screening + {CODE_N} coding + 1 case + {THEORY_QS} theory.
            Finish banks <span className="text-zinc-300">+{XP.mock} XP</span>; 70%+ adds <span className="text-zinc-300">+{XP.mockStrongBonus}</span>.
            Coding passes bank the problem&apos;s own first-solve XP; misses go to the mentor and the review ladder.
          </p>
        </Panel>

        <div className="mt-5">
          <div className="grid gap-2 sm:grid-cols-2">
            <button onClick={() => start("all")} className="text-left" aria-label="Run a loop day across every live kit">
              <Panel className="h-full transition-colors hover:border-zinc-600">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-sky-300" />
                  <span className="text-sm font-semibold text-zinc-100">Loop day — everything</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                  Every stage draws from a different company in the universe. The full gauntlet in one sitting.
                </p>
              </Panel>
            </button>
            <Panel tone="nested" className="h-full">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-violet-300" />
                <span className="text-sm font-semibold text-zinc-100">Or by floor</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COMPANY_DOMAINS.map((d: CompanyDomain) => (
                  <button
                    key={d.id}
                    onClick={() => start(`d:${d.id}`)}
                    aria-label={`Run a ${d.name} loop`}
                    className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 transition-colors hover:border-zinc-500"
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <div className="mt-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Name the company — its loop, its clock, its questions"
              aria-label="Search companies"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
          </label>
          <div className="mt-2 divide-y divide-zinc-800/70 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
            {introCompanies.length === 0 && (
              <p className="px-4 py-3 text-xs text-zinc-500">No company by that name in the universe.</p>
            )}
            {introCompanies.map((k) => {
              const best = bestFor(k.id);
              return (
                <button
                  key={k.id}
                  onClick={() => start(k.id)}
                  aria-label={`Run the ${k.name} loop`}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-zinc-900/60"
                >
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", k.accent.replace("text-", "bg-"))} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-100">{k.name}</span>
                    <span className="block truncate text-[11px] text-zinc-500">{k.tagline}</span>
                  </span>
                  {best >= 0 && (
                    <span className="tnum shrink-0 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                      best {best}%
                    </span>
                  )}
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                </button>
              );
            })}
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-5">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Recent debriefs</h2>
            <div className="mt-2 space-y-1.5">
              {history.slice(0, 5).map((r: InterviewRun) => (
                <div key={r.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5">
                  <span
                    className={cn(
                      "tnum w-12 shrink-0 rounded-md border px-2 py-0.5 text-center font-mono text-[11px]",
                      r.pct >= 70 ? "border-emerald-400/40 text-emerald-300" : r.pct >= 50 ? "border-amber-400/40 text-amber-300" : "border-rose-400/40 text-rose-300",
                    )}
                  >
                    {r.pct}%
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-200">{r.label}</span>
                  <span className="tnum shrink-0 font-mono text-[10px] text-zinc-500">
                    screen {r.screen.ok}/{r.screen.n} · code {r.coding.ok}/{r.coding.n} · theory {r.theory.score}/{r.theory.total}
                  </span>
                  <span className="shrink-0 text-[10px] text-zinc-600">{fmtAgo(r.ts)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------------- debrief ---------------- */

  if (phase === "debrief") {
    const screenMisses = loop.mcqs.filter((d) => picks[d.mcq.id] !== d.mcq.answer);
    const codeMisses = loop.problems.filter((p) => !codePassed[p.slug]);
    const theoryMisses = loop.theory.filter((_t, i) => (tMarks[i] ?? 0) < 1);
    const stageRows = [
      { label: "Screening", ok: screenOk, n: loop.mcqs.length, pts: `${screenOk}/${SCREEN_QS}` },
      { label: "Live coding", ok: codingOk, n: loop.problems.length, pts: `${codingOk}/${CODE_N}` },
      { label: "Case round", ok: casePts, n: 1, pts: `${casePts}/1` },
      { label: "Theory close", ok: theoryScore, n: loop.theory.length, pts: `${theoryScore}/${loop.theory.length}` },
    ];
    return (
      <div className="max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Interview sim · debrief</p>
        <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-zinc-50">Panel wrap-up</h1>

        <Panel className="mt-5">
          <div className="flex items-center gap-3">
            <Trophy className={cn("h-8 w-8 shrink-0", verdict.cls)} />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-zinc-50">
                {points}/{MAX_POINTS} <span className="text-sm font-medium text-zinc-400">({pct}%)</span>
              </div>
              <div className={cn("text-xs font-semibold", verdict.cls)}>{verdict.label}</div>
            </div>
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-zinc-300">{verdict.msg}</p>
          {bankedXp !== null && bankedXp > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-3 py-2 text-xs text-amber-200">
              <Zap className="h-3.5 w-3.5" />
              <span>Banked <span className="font-semibold">+{bankedXp} XP</span> for finishing the loop{pct >= 70 ? " — strong-loop bonus included" : ""}.</span>
            </div>
          )}
          {bankedXp === 0 && (
            <p className="mt-3 text-[11px] text-zinc-500">Run logged — already banked, so no double XP.</p>
          )}
        </Panel>

        <Panel className="mt-3" pad={4}>
          <h2 className="text-sm font-semibold text-zinc-100">Stage by stage</h2>
          <div className="mt-2.5 space-y-2">
            {stageRows.map((r) => (
              <div key={r.label} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-xs text-zinc-300">{r.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      r.ok >= r.n ? "bg-emerald-400" : r.ok <= 0 ? "bg-rose-400" : "bg-amber-400",
                    )}
                    style={{ width: `${r.n ? Math.max(0, Math.min(1, r.ok / r.n)) * 100 : 0}%` }}
                  />
                </div>
                <span className="tnum w-10 shrink-0 text-right font-mono text-[11px] text-zinc-400">{r.pts}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
            Loop time {fmtClock(elapsed || Math.round((Date.now() - startedAtRef.current) / 1000))} — screening answers and theory marks
            are on the review ladder, coding misses went to the mentor&apos;s desk.
          </p>
        </Panel>

        {(screenMisses.length > 0 || codeMisses.length > 0 || theoryMisses.length > 0 || !caseRevealed || (caseMark ?? 1) < 1) && (
          <div className="mt-3 space-y-3">
            {screenMisses.length > 0 && (
              <Panel pad={4}>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                  <XCircle className="h-4 w-4 text-rose-300" /> Screening — the ones that leaked
                </h2>
                <div className="mt-2.5 space-y-2.5">
                  {screenMisses.map((d) => {
                    const pick = picks[d.mcq.id];
                    return (
                      <div key={d.mcq.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                        <p className="text-xs font-medium leading-relaxed text-zinc-200">{d.mcq.prompt}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                          <span className="text-zinc-500">You said </span>
                          {typeof pick === "number" && pick >= 0 ? `${LETTERS[pick]} — ${d.mcq.choices[pick]}` : "nothing — the clock took it"}
                          {pick !== -1 && <span className="text-zinc-500"> · they wanted </span>}
                          {pick !== -1 && <span className="text-emerald-300">{d.mcq.choices[d.mcq.answer]}</span>}
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{d.mcq.why}</p>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            )}

            {codeMisses.length > 0 && (
              <Panel pad={4}>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                  <Code2 className="h-4 w-4 text-rose-300" /> Live coding — the reference solutions
                </h2>
                <div className="mt-2.5 space-y-2.5">
                  {codeMisses.map((p) => (
                    <div key={p.slug} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-medium text-zinc-200">{p.dive.statement.split("\n")[0]}</p>
                        {openLc && (
                          <Btn variant="soft" onClick={() => openLc(p.slug)} aria-label={`Open the ${p.slug} dive`}>
                            Open the dive <ArrowRight className="ml-1 inline h-3 w-3" />
                          </Btn>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                        {codeLocked[p.slug] ? (codePassed[p.slug] === false ? "Parked or missed on submit." : "Locked in as passed.") : "Never reached — the loop ended here."}
                      </p>
                      <div className="mt-2 rounded-md border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-[11px] leading-5 text-zinc-200">
                        <SqlNodes text={p.dive.code} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {loop.case && (caseMark ?? 0) < 1 && (
              <Panel pad={4}>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                  <FileText className="h-4 w-4 text-amber-300" /> Case round — {loop.case.cs.title}
                </h2>
                {!caseRevealed ? (
                  <>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">You left before the panel reveal — here is what they had on the table.</p>
                    <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs leading-relaxed text-zinc-300">{loop.case.cs.walkthrough}</div>
                  </>
                ) : (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
                    You marked it {caseMark === 0.5 ? "halfway" : "a miss"} — the walkthrough and the panel&apos;s query are above; the case files have the full rebuild drill.
                  </p>
                )}
              </Panel>
            )}

            {theoryMisses.length > 0 && (
              <Panel pad={4}>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                  <MessagesSquare className="h-4 w-4 text-amber-300" /> Theory close — say these out loud
                </h2>
                <div className="mt-2.5 space-y-2.5">
                  {theoryMisses.map((d, i) => (
                    <div key={d.t.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                      <p className="text-xs font-medium leading-relaxed text-zinc-200">{d.t.q}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                        <span className="text-zinc-500">{d.kit.name} · </span>{d.t.a}
                      </p>
                      <p className="mt-1 text-[10px] text-zinc-600">
                        {tMarks[i] === undefined ? "unmarked — the loop ended here" : tMarks[i] === 0.5 ? "you marked it shaky" : "you marked it a miss"}
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Btn variant="primary" onClick={() => start(target)}>
            <RotateCcw className="mr-1 inline h-3.5 w-3.5" /> Run it again
          </Btn>
          <Btn variant="soft" onClick={() => setPhase("intro")}>Back to the lobby</Btn>
        </div>
      </div>
    );
  }

  /* ---------------- run: shared stage header ---------------- */

  const stage = STAGES[stageIdx];
  const warnAt = stage.kind === "screen" ? 15 : 60;

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-2">
        {STAGES.map((s, i) => (
          <span
            key={s.kind}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium",
              i === stageIdx ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200" : "border-zinc-800 bg-zinc-900 text-zinc-500",
            )}
          >
            <s.icon className="h-3 w-3" /> {s.label}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-2">
          <span
            className={cn(
              "tnum rounded-md border px-2 py-1 font-mono text-[11px]",
              left <= warnAt && left > 0 ? "border-rose-500/40 text-rose-300" : "border-zinc-700 text-zinc-400",
            )}
          >
            {fmtClock(left)}
          </span>
          <span className="tnum hidden font-mono text-[10px] text-zinc-600 sm:inline">{fmtClock(elapsed)} in</span>
          <button
            onClick={endLoop}
            className="flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-[11px] text-zinc-400 transition-colors hover:border-rose-400/50 hover:text-rose-300"
            aria-label="End the loop early and go to the debrief"
          >
            <Flag className="h-3 w-3" /> End the loop
          </button>
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${(stageIdx / STAGES.length) * 100}%` }} />
      </div>

      {/* -------- stage 1: screening -------- */}
      {stage.kind === "screen" && (() => {
        const d = loop.mcqs[qIdx];
        if (!d) return null;
        const picked = picks[d.mcq.id];
        return (
          <div className="mt-5">
            <p className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
              <Mic className="h-3 w-3" /> {d.kit.name} · question {qIdx + 1} of {loop.mcqs.length} · answer and move on — no reveals
            </p>
            <Panel>
              <p className="text-sm font-medium leading-relaxed text-zinc-100">{d.mcq.prompt}</p>
              <div className="mt-3 space-y-2">
                {d.mcq.choices.map((c, ci) => (
                  <button
                    key={ci}
                    disabled={picked !== undefined}
                    onClick={() => pickMcq(ci)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs leading-relaxed transition-colors",
                      picked === undefined && "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500",
                      picked !== undefined && picked === ci && "border-emerald-400/50 bg-emerald-400/10 text-emerald-200",
                      picked !== undefined && picked !== ci && "border-zinc-800 bg-zinc-900/60 text-zinc-500",
                    )}
                  >
                    <span className="font-mono text-[10px] opacity-70">{LETTERS[ci]}</span>
                    <span>{c}</span>
                  </button>
                ))}
              </div>
              {picked !== undefined && picked !== -1 && (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500" /> Locked in — the panel noted it and moved on.
                </p>
              )}
              {picked === -1 && (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-200/90">
                  <Clock className="h-3.5 w-3.5" /> The clock answered for you.
                </p>
              )}
            </Panel>
          </div>
        );
      })()}

      {/* -------- stage 2: live coding -------- */}
      {stage.kind === "coding" && curProblem && (() => {
        const slug = curProblem.slug;
        const locked = codeLocked[slug];
        const run = runBySlug[slug];
        return (
          <div className="mt-5">
            <p className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
              <Code2 className="h-3 w-3" /> {curProblem.kit.name} · problem {pIdx + 1} of {loop.problems.length} · {curProblem.difficulty} sandbox
            </p>
            <Panel>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">{curProblem.dive.statement.split("\n")[0]}</h3>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                <span className="font-semibold text-zinc-200">Why they ask it: </span>{curProblem.why}
              </p>
              <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-zinc-300">{curProblem.dive.statement}</p>
              <button
                onClick={() => setShowSchema((s) => !s)}
                className="mt-2.5 rounded-md border border-zinc-700 px-2 py-1 text-[11px] text-zinc-400 transition-colors hover:border-zinc-500"
              >
                {showSchema ? "Hide schema" : "Show schema"}
              </button>
              {showSchema && (
                <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 font-mono text-[11px] leading-5 text-zinc-300">
                  <SqlNodes text={curProblem.dive.schema.ddl} />
                </div>
              )}
              <div className="mt-3 overflow-hidden rounded-md border border-zinc-800">
                <SqlEditor
                  value={sqlBySlug[slug] ?? ""}
                  onChange={(v) => setSqlBySlug((s) => ({ ...s, [slug]: v }))}
                  onVisualize={runSql}
                  className="min-h-[110px]"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={runSql}
                  disabled={running || locked || !sqlBySlug[slug]?.trim()}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
                    (running || locked || !sqlBySlug[slug]?.trim()) && "cursor-not-allowed opacity-40",
                  )}
                >
                  Run it
                </button>
                <button
                  onClick={submitCode}
                  disabled={locked || !run || !run.ok}
                  title={!run || !run.ok ? "Run your query first — the panel grades the rows" : "Lock in your answer"}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border border-zinc-600 px-4 py-2 text-xs font-medium text-zinc-100 transition-colors hover:border-emerald-400/60",
                    (locked || !run || !run.ok) && "cursor-not-allowed opacity-40",
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Submit
                </button>
                <button
                  onClick={() => finishProblem(false, true)}
                  disabled={locked}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:border-rose-400/50 hover:text-rose-300",
                    locked && "cursor-not-allowed opacity-40",
                  )}
                >
                  Park it
                </button>
                <span className="ml-auto text-[11px] text-zinc-600">graded on your rows · any correct query passes</span>
              </div>
              {run && !run.ok && (
                <div className="mt-3 rounded-md border border-rose-400/30 bg-rose-400/[0.06] px-3.5 py-3 font-mono text-xs text-rose-200">
                  {run.error}
                </div>
              )}
              {run && run.ok && (
                <div className="mt-3">
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    your output — {run.rowCount} row{run.rowCount === 1 ? "" : "s"} · {run.durationMs} ms
                  </p>
                  <div className="max-h-56 overflow-auto rounded-md border border-zinc-800">
                    <MiniGrid columns={run.columns} rows={run.rows.slice(0, 50)} tone="neutral" />
                  </div>
                  {locked && (
                    <p className={cn("mt-2 flex items-center gap-1.5 text-[11px]", codePassed[slug] ? "text-emerald-300" : "text-amber-200/90")}>
                      {codePassed[slug]
                        ? <CheckCircle2 className="h-3.5 w-3.5" />
                        : <Clock className="h-3.5 w-3.5" />}
                      {codePassed[slug] ? "Submitted — the panel nodded. Verdict at the debrief." : "Locked in — the verdict lands at the debrief."}
                    </p>
                  )}
                </div>
              )}
              {locked && !run && (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-200/90">
                  <Clock className="h-3.5 w-3.5" /> Locked in — the verdict lands at the debrief.
                </p>
              )}
            </Panel>
          </div>
        );
      })()}

      {/* -------- stage 3: case round -------- */}
      {stage.kind === "case" && loop.case && (() => {
        const { kit, cs } = loop.case;
        return (
          <div className="mt-5">
            <p className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
              <FileText className="h-3 w-3" /> {kit.name} case · {cs.tier} · sketch it the way you&apos;d say it
            </p>
            <Panel>
              <h3 className="text-sm font-semibold text-zinc-100">{cs.title}</h3>
              <p className="mt-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs leading-relaxed text-zinc-300">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">memo · </span>
                {cs.brief}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                <span className="font-semibold text-zinc-200">The ask: </span>{cs.ask}
              </p>
              <textarea
                rows={4}
                value={caseSketch}
                onChange={(e) => setCaseSketch(e.target.value)}
                disabled={caseRevealed}
                placeholder="Tables, joins, filters, the shape of the output — your approach out loud."
                className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2.5 text-xs leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none disabled:opacity-60"
              />
              {!caseRevealed ? (
                <Btn variant="soft" className="mt-3" onClick={() => setCaseRevealed(true)}>
                  Send it to the panel <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                </Btn>
              ) : (
                <div className="mt-3 space-y-2">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs leading-relaxed text-zinc-300">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">the panel&apos;s walkthrough</p>
                    <p className="mt-1.5">{cs.walkthrough}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">the query they wanted</p>
                    <div className="mt-1.5 font-mono text-[11px] leading-5 text-zinc-200">
                      <SqlNodes text={caseSolutionSql(cs)} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                    Mark yourself against the memo:
                    {([1, 0.5, 0] as TheoryMark[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => markCase(v)}
                        className={cn(
                          "rounded-md border px-2 py-1 transition-colors",
                          caseMark === v
                            ? "border-sky-400/50 bg-sky-400/10 text-sky-200"
                            : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500",
                        )}
                      >
                        {v === 1 ? "I had it (1)" : v === 0.5 ? "Halfway (0.5)" : "Missed it (0)"}
                      </button>
                    ))}
                    {caseMark !== null && (
                      <Btn variant="primary" className="ml-auto" onClick={toTheory}>
                        Theory close <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                      </Btn>
                    )}
                  </div>
                </div>
              )}
            </Panel>
          </div>
        );
      })()}

      {/* -------- stage 4: theory close -------- */}
      {stage.kind === "theory" && (() => {
        const t = loop.theory[tIdx];
        if (!t) return null;
        return (
          <div className="mt-5">
            <p className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
              <MessagesSquare className="h-3 w-3" /> {t.kit.name} · {t.t.tag} · question {tIdx + 1} of {loop.theory.length}
            </p>
            <Panel>
              <p className="text-sm font-medium leading-relaxed text-zinc-100">{t.t.q}</p>
              <textarea
                rows={4}
                placeholder="Say it the way you would out loud — definition, trade-off, one example."
                disabled={tRevealed[tIdx]}
                className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2.5 text-xs leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none disabled:opacity-60"
              />
              {!tRevealed[tIdx] ? (
                <Btn variant="soft" className="mt-3" onClick={() => setTRevealed((r) => ({ ...r, [tIdx]: true }))}>
                  Reveal model answer
                </Btn>
              ) : (
                <div className="mt-3 space-y-2">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs leading-relaxed text-zinc-300">
                    {t.t.a}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                    Self-mark:
                    {([1, 0.5, 0] as TheoryMark[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => markTheory(v)}
                        className={cn(
                          "rounded-md border px-2 py-1 transition-colors",
                          tMarks[tIdx] === v
                            ? "border-sky-400/50 bg-sky-400/10 text-sky-200"
                            : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500",
                        )}
                      >
                        {v === 1 ? "Nailed it (1)" : v === 0.5 ? "Shaky (0.5)" : "Missed it (0)"}
                      </button>
                    ))}
                    {tMarks[tIdx] !== undefined && (
                      <Btn variant="primary" className="ml-auto" onClick={nextTheory}>
                        {tIdx + 1 >= loop.theory.length ? "See the debrief" : "Next question"} <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                      </Btn>
                    )}
                  </div>
                </div>
              )}
            </Panel>
          </div>
        );
      })()}
    </div>
  );
}

