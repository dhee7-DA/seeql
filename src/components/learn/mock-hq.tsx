"use client";

// Mock HQ — the omni mock screen. Where the per-kit MockRound simulates ONE
// company's screen, this runs the full-hall drill: 10 MCQs + 2 theory
// questions drawn across the whole universe (or one domain), under a single
// 12-minute clock. Everything lands in the same shared ledger as the per-kit
// rounds — accuracy, the review ladder, theory XP tiers — and finishing
// banks the mock completion bonus. The report breaks the run down by company
// and by difficulty, so the weak spots are named, not vibes.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Globe2,
  RotateCcw,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { COMPANY_DOMAINS, COMPANY_KITS, companyKit } from "@/lib/companies/registry";
import type { CompanyDomain, CompanyKit } from "@/lib/companies/types";
import type { Mcq } from "@/lib/curriculum/types";
import { XP } from "@/lib/curriculum/gamification";
import { useUniverse, type TheoryMark } from "@/lib/universe/progress";
import { Btn, Panel } from "./ui/kit";
import { cn } from "@/lib/utils";

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DRILL_MCQ = 10;
const DRILL_THEORY = 2;
const DRILL_SECONDS = 12 * 60;

interface DrawnMcq {
  kit: CompanyKit;
  mcq: Mcq;
}
interface DrawnTheory {
  kit: CompanyKit;
  id: string;
  q: string;
  a: string;
  tag: string;
}

/** One MCQ per kit, walking a shuffled kit list, until the drill is full —
 *  spreads the run across companies instead of dumping five from one kit. */
function drawMcqs(pool: CompanyKit[]): DrawnMcq[] {
  const out: DrawnMcq[] = [];
  for (const kit of shuffle(pool)) {
    if (out.length >= DRILL_MCQ) break;
    const q = shuffle(kit.mcqs)[0];
    if (q) out.push({ kit, mcq: q });
  }
  // a tiny pool (early universe) may fall short — top up wherever questions remain
  if (out.length < DRILL_MCQ) {
    const used = new Set(out.map((o) => o.mcq.id));
    for (const kit of shuffle(pool)) {
      if (out.length >= DRILL_MCQ) break;
      for (const q of shuffle(kit.mcqs)) {
        if (out.length >= DRILL_MCQ) break;
        if (!used.has(q.id)) {
          used.add(q.id);
          out.push({ kit, mcq: q });
        }
      }
    }
  }
  return shuffle(out);
}

function drawTheory(pool: CompanyKit[]): DrawnTheory[] {
  const out: DrawnTheory[] = [];
  for (const kit of shuffle(pool)) {
    if (out.length >= DRILL_THEORY) break;
    const t = shuffle(kit.theory)[0];
    if (t) out.push({ kit, id: t.id, q: t.q, a: t.a, tag: t.tag });
  }
  return out;
}

const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const LETTERS = ["A", "B", "C", "D", "E", "F"];

type Phase = "intro" | "run" | "report";

export function MockHq() {
  const [seed, setSeed] = useState(0);
  const [scope, setScope] = useState<string>("all");
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [marks, setMarks] = useState<Record<number, TheoryMark>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [left, setLeft] = useState(DRILL_SECONDS);
  const [bankedXp, setBankedXp] = useState<number | null>(null);
  const bankedRef = useRef(false);

  const pool = useMemo(() => {
    if (scope === "all") return Object.values(COMPANY_KITS);
    const domain = COMPANY_DOMAINS.find((d) => d.id === scope);
    return domain ? domain.companies.map((id) => companyKit(id)).filter((k): k is CompanyKit => !!k) : [];
  }, [scope]);

  // redrawn whenever the run restarts (seed) or the scope changes
  const drill = useMemo(() => ({ mcqs: drawMcqs(pool), theory: drawTheory(pool) }), [seed, pool]);

  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(
      () =>
        setLeft((s) => {
          if (s <= 1) {
            clearInterval(t);
            setPhase("report");
            return 0;
          }
          return s - 1;
        }),
      1000
    );
    return () => clearInterval(t);
  }, [phase]);

  const total = drill.mcqs.length + drill.theory.length;
  const mcqScore = drill.mcqs.reduce((n, d) => n + (picks[d.mcq.id] === d.mcq.answer ? 1 : 0), 0);
  const theoryScore = Object.values(marks).reduce<number>((n, v) => n + v, 0);
  const score = mcqScore + theoryScore;
  const pct = total ? Math.round((score / total) * 100) : 0;

  // bank exactly once, from either path to the report (last question or clock)
  useEffect(() => {
    if (phase !== "report" || bankedRef.current) return;
    bankedRef.current = true;
    const kitIds = [...new Set([...drill.mcqs.map((d) => d.kit.id), ...drill.theory.map((t) => t.kit.id)])];
    const label =
      scope === "all"
        ? `Omni round · ${kitIds.length} companies`
        : `${COMPANY_DOMAINS.find((d) => d.id === scope)?.name ?? "Domain"} round · ${kitIds.length} companies`;
    const banked = useUniverse.getState().saveMock({
      kitIds,
      label,
      mcqScore,
      mcqTotal: drill.mcqs.length,
      theoryScore,
      theoryTotal: drill.theory.length,
      pct,
      durationSec: DRILL_SECONDS - left,
    });
    setBankedXp(banked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const start = (s: string) => {
    setScope(s);
    bankedRef.current = false;
    setBankedXp(null);
    // seed bump on a scope change re-draws the drill
    setSeed((v) => v + 1);
    setPhase("run");
    setIdx(0);
    setPicks({});
    setMarks({});
    setRevealed({});
    setLeft(DRILL_SECONDS);
  };
  const again = () => {
    bankedRef.current = false;
    setBankedXp(null);
    setSeed((v) => v + 1);
    setPhase("intro");
    setIdx(0);
    setPicks({});
    setMarks({});
    setRevealed({});
    setLeft(DRILL_SECONDS);
  };

  const current =
    phase === "run"
      ? idx < drill.mcqs.length
        ? { kind: "mcq" as const, d: drill.mcqs[idx] }
        : { kind: "theory" as const, t: drill.theory[idx - drill.mcqs.length], n: idx - drill.mcqs.length }
      : null;

  const next = () => (idx + 1 >= total ? setPhase("report") : setIdx((v) => v + 1));

  // per-company tally for the report
  const tally = useMemo(() => {
    const m = new Map<string, { name: string; ok: number; n: number }>();
    for (const d of drill.mcqs) {
      const e = m.get(d.kit.id) ?? { name: d.kit.name, ok: 0, n: 0 };
      e.n += 1;
      if (picks[d.mcq.id] === d.mcq.answer) e.ok += 1;
      m.set(d.kit.id, e);
    }
    return [...m.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drill, picks]);

  const diffTally = useMemo(() => {
    const t = { easy: { ok: 0, n: 0 }, medium: { ok: 0, n: 0 }, hard: { ok: 0, n: 0 } };
    for (const d of drill.mcqs) {
      const k = (d.mcq.difficulty ?? "medium") as keyof typeof t;
      t[k].n += 1;
      if (picks[d.mcq.id] === d.mcq.answer) t[k].ok += 1;
    }
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drill, picks]);

  const missed = drill.mcqs.filter((d) => picks[d.mcq.id] !== undefined && picks[d.mcq.id] !== d.mcq.answer);

  const verdict =
    pct >= 70
      ? { cls: "text-emerald-300", msg: "Hiring signal across the hall. This is phone-screen shape — keep the level warm with another round soon." }
      : pct >= 50
      ? { cls: "text-amber-300", msg: "Solid base, real gaps. The report below names the companies and difficulties that leaked — drill those, then re-run." }
      : { cls: "text-rose-300", msg: "The hall got you this time. Every miss is on the review ladder now — clear the deck, then take another swing." };

  return (
    <div className="max-w-3xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Practice lab</p>
      <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-zinc-50">Mock HQ</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        The full-hall mock screen: {DRILL_MCQ} MCQs and {DRILL_THEORY} theory questions drawn across the company
        universe — or focus one domain. One clock, everything on the record: accuracy, review ladder and the
        completion bonus just like a per-kit round.
      </p>

      {phase === "intro" && (
        <div className="mt-5 space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <button onClick={() => start("all")} className="text-left" aria-label="Run an omni round across every live kit">
              <Panel className="h-full transition-colors hover:border-zinc-600">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-sky-300" />
                  <span className="text-sm font-semibold text-zinc-100">Omni round — everything</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                  Questions drawn from every live kit in the universe. The real &ldquo;how broad am I&rdquo; check.
                </p>
              </Panel>
            </button>
            {COMPANY_DOMAINS.map((d: CompanyDomain) => {
              const live = d.companies.filter((id) => COMPANY_KITS[id]).length;
              if (live === 0) return null;
              return (
                <button key={d.id} onClick={() => start(d.id)} className="text-left" aria-label={`Run a ${d.name} round`}>
                  <Panel className="h-full transition-colors hover:border-zinc-600">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-violet-300" />
                        <span className="text-sm font-semibold text-zinc-100">{d.name}</span>
                      </div>
                      <span className="shrink-0 text-[10px] text-zinc-500">{live} kits</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{d.blurb}</p>
                  </Panel>
                </button>
              );
            })}
          </div>
          <Panel tone="nested">
            <ul className="space-y-1.5 text-xs leading-relaxed text-zinc-400">
              <li>• <span className="text-zinc-200">12 minutes</span> total; the clock turns red under two.</li>
              <li>• MCQs grade themselves; theory is <span className="text-zinc-200">self-marked</span> against the model answer.</li>
              <li>• Misses join the review deck and come back in <span className="text-zinc-200">1, 3, then 7 days</span>.</li>
              <li>• Finishing banks <span className="text-zinc-200">+{XP.mock} XP</span>; 70%+ adds <span className="text-zinc-200">+{XP.mockStrongBonus}</span>.</li>
            </ul>
          </Panel>
        </div>
      )}

      {phase === "run" && current && (
        <div className="mt-5">
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-sky-400 transition-all duration-500 ease-out"
                style={{ width: `${(idx / total) * 100}%` }}
              />
            </div>
            <span className="tnum shrink-0 font-mono text-xs text-zinc-500">
              {idx + 1} / {total}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-md border px-2 py-1 font-mono text-[11px]",
                left < 120 ? "border-rose-500/40 text-rose-300" : "border-zinc-700 text-zinc-400",
              )}
            >
              {fmtClock(left)}
            </span>
          </div>

          {current.kind === "mcq" ? (
            <div className="mt-5">
              <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                <Building2 className="h-3 w-3" /> {current.d.kit.name} · {current.d.mcq.difficulty ?? "medium"}
              </p>
              <Panel>
                <p className="text-sm font-medium leading-relaxed text-zinc-100">{current.d.mcq.prompt}</p>
                <div className="mt-3 space-y-2">
                  {current.d.mcq.choices.map((c, ci) => {
                    const picked = picks[current.d.mcq.id];
                    const chosen = picked === ci;
                    const isAnswer = current.d.mcq.answer === ci;
                    const done = picked !== undefined;
                    return (
                      <button
                        key={ci}
                        disabled={done}
                        onClick={() => {
                          if (picks[current.d.mcq.id] === undefined)
                            useUniverse.getState().recordMockMcq(current.d.kit.id, current.d.mcq.id, ci === current.d.mcq.answer);
                          setPicks((p) => ({ ...p, [current.d.mcq.id]: ci }));
                        }}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs leading-relaxed transition-colors",
                          !done && "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500",
                          done && isAnswer && "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
                          done && chosen && !isAnswer && "border-rose-500/40 bg-rose-500/10 text-rose-200",
                          done && !chosen && !isAnswer && "border-zinc-800 bg-zinc-900/60 text-zinc-500",
                        )}
                      >
                        <span className="font-mono text-[10px] opacity-70">{LETTERS[ci]}</span>
                        <span>{c}</span>
                      </button>
                    );
                  })}
                </div>
                {picks[current.d.mcq.id] !== undefined && (
                  <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs leading-relaxed text-zinc-300">
                    {picks[current.d.mcq.id] === current.d.mcq.answer ? (
                      <div className="flex items-center gap-1.5 font-medium text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Correct.
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 font-medium text-rose-300">
                        <XCircle className="h-3.5 w-3.5" /> Not the answer they want.
                      </div>
                    )}
                    <p className="mt-1.5">{current.d.mcq.why}</p>
                    {picks[current.d.mcq.id] !== current.d.mcq.answer &&
                      current.d.mcq.notes
                        ?.filter((n) => n.choice === picks[current.d.mcq.id])
                        .map((n, ni) => (
                          <p key={ni} className="mt-1 text-amber-200/90">
                            Coached note: {n.why}
                          </p>
                        ))}
                  </div>
                )}
              </Panel>
            </div>
          ) : (
            <div className="mt-5">
              <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                <Building2 className="h-3 w-3" /> {current.t.kit.name} theory · {current.t.tag}
              </p>
              <Panel>
                <p className="text-sm font-medium leading-relaxed text-zinc-100">{current.t.q}</p>
                <textarea
                  rows={4}
                  placeholder="Say it the way you would out loud — definition, trade-off, one example."
                  className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2.5 text-xs leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
                {!revealed[current.n] ? (
                  <Btn variant="soft" className="mt-3" onClick={() => setRevealed((r) => ({ ...r, [current.n]: true }))}>
                    Reveal model answer
                  </Btn>
                ) : (
                  <div className="mt-3 space-y-2">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs leading-relaxed text-zinc-300">
                      {current.t.a}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                      Self-mark:
                      {([1, 0.5, 0] as TheoryMark[]).map((v) => (
                        <button
                          key={v}
                          onClick={() => {
                            if (marks[current.n] === undefined)
                              useUniverse.getState().recordTheory(current.t.kit.id, current.t.id, v);
                            setMarks((m) => ({ ...m, [current.n]: v }));
                          }}
                          className={cn(
                            "rounded-md border px-2 py-1 transition-colors",
                            marks[current.n] === v
                              ? "border-sky-400/50 bg-sky-400/10 text-sky-200"
                              : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500",
                          )}
                        >
                          {v === 1 ? "Nailed it (1)" : v === 0.5 ? "Shaky (0.5)" : "Missed it (0)"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Panel>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Btn
              variant="primary"
              disabled={
                current.kind === "mcq"
                  ? picks[current.d.mcq.id] === undefined
                  : marks[current.n] === undefined
              }
              onClick={next}
            >
              {idx + 1 >= total ? "See the report" : "Next"} <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Btn>
          </div>
        </div>
      )}

      {phase === "report" && (
        <div className="mt-5 space-y-4">
          <Panel>
            <div className="flex items-center gap-3">
              <Trophy className={cn("h-8 w-8", verdict.cls)} />
              <div>
                <div className="text-2xl font-bold text-zinc-50">
                  {score}/{total} <span className="text-sm font-medium text-zinc-400">({pct}%)</span>
                </div>
                <div className={cn("text-xs font-semibold", verdict.cls)}>{verdict.msg}</div>
              </div>
            </div>
            {bankedXp !== null && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-3 py-2 text-xs text-amber-200">
                <Zap className="h-3.5 w-3.5" />
                {bankedXp > 0 ? (
                  <span>
                    Banked <span className="font-semibold">+{bankedXp} XP</span> · {missed.length} miss
                    {missed.length === 1 ? "" : "es"} joined the review deck
                  </span>
                ) : (
                  <span>Run logged — already banked, so no double XP.</span>
                )}
              </div>
            )}
          </Panel>

          <div className="grid gap-3 sm:grid-cols-2">
            <Panel>
              <h3 className="text-sm font-semibold text-zinc-100">By company</h3>
              <div className="mt-2.5 space-y-1.5">
                {tally.map((t) => (
                  <div key={t.name} className="flex items-center gap-2">
                    <span className="w-28 shrink-0 truncate text-xs text-zinc-300">{t.name}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          t.ok === t.n ? "bg-emerald-400" : t.ok === 0 ? "bg-rose-400" : "bg-amber-400",
                        )}
                        style={{ width: `${(t.ok / t.n) * 100}%` }}
                      />
                    </div>
                    <span className="tnum w-8 shrink-0 text-right font-mono text-[11px] text-zinc-400">
                      {t.ok}/{t.n}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel>
              <h3 className="text-sm font-semibold text-zinc-100">By difficulty</h3>
              <div className="mt-2.5 space-y-2.5">
                {(["easy", "medium", "hard"] as const).map((k) => (
                  <div key={k} className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-zinc-300">{k}</span>
                      <span className="tnum font-mono text-[11px] text-zinc-400">
                        {diffTally[k].ok}/{diffTally[k].n}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] leading-snug text-zinc-500">
                      {diffTally[k].n === 0
                        ? "none drawn this round"
                        : diffTally[k].ok === diffTally[k].n
                        ? "cleared — this band is holding"
                        : diffTally[k].ok === 0
                        ? "every one missed — drill this band first"
                        : "partial — the misses are on the ladder"}
                    </p>
                  </div>
                ))}
              </div>
              {missed.length > 0 && (
                <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
                  Misses from this round resurface in the Review deck&apos;s{" "}
                  <span className="text-zinc-300">Scheduled (ladder)</span> tab — tomorrow first, then 3 days out.
                </p>
              )}
            </Panel>
          </div>

          <Btn variant="soft" onClick={again}>
            <RotateCcw className="mr-1 inline h-3.5 w-3.5" /> Back to Mock HQ
          </Btn>
        </div>
      )}
    </div>
  );
}
