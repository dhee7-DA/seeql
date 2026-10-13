"use client";

// Assessment layer for the Company Universe: per-kit mock interview rounds and
// per-domain mastery quizzes. Deliberately zero-XP / zero-progress-writes —
// these simulate the interview screen itself, so they never touch the practice
// ledger. The mock round mirrors a real phone screen's shape: 6 mixed-difficulty
// MCQs + 2 walk-me-through theory questions under a 12-minute clock. The
// mastery quiz samples every live kit in a domain, round-robin, for a broad
// recall check with a per-company breakdown.

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, RotateCcw, Trophy, XCircle } from "lucide-react";
import { companyKit } from "@/lib/companies/registry";
import type { CompanyDomain, CompanyKit } from "@/lib/companies/types";
import type { Mcq } from "@/lib/curriculum/types";
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

/** 2 easy / 2 medium / 2 hard when the bank allows; random fill otherwise. */
function pickMockMcqs(mcqs: Mcq[]): Mcq[] {
  const byDiff = (d: string) => shuffle(mcqs.filter((m) => (m.difficulty ?? "medium") === d));
  const picked = [
    ...byDiff("easy").slice(0, 2),
    ...byDiff("medium").slice(0, 2),
    ...byDiff("hard").slice(0, 2),
  ];
  if (picked.length < 6) {
    const rest = shuffle(mcqs.filter((m) => !picked.includes(m)));
    picked.push(...rest.slice(0, 6 - picked.length));
  }
  return picked;
}

const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const LETTERS = ["A", "B", "C", "D", "E", "F"];
type TheoryMark = 0 | 0.5 | 1;

/* ---------------- mock interview round (per kit) ---------------- */

export function MockRound({ kit }: { kit: CompanyKit }) {
  const [seed, setSeed] = useState(0);
  const [phase, setPhase] = useState<"intro" | "run" | "done">("intro");
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [marks, setMarks] = useState<Record<number, TheoryMark>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [left, setLeft] = useState(12 * 60);

  const round = useMemo(() => {
    return { mcqs: pickMockMcqs(kit.mcqs), theory: shuffle(kit.theory).slice(0, 2) };
  }, [seed, kit]);

  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(
      () =>
        setLeft((s) => {
          if (s <= 1) {
            clearInterval(t);
            setPhase("done");
            return 0;
          }
          return s - 1;
        }),
      1000
    );
    return () => clearInterval(t);
  }, [phase]);

  const total = round.mcqs.length + round.theory.length;
  const mcqScore = round.mcqs.reduce((n, m) => n + (picks[m.id] === m.answer ? 1 : 0), 0);
  const theoryScore = Object.values(marks).reduce<number>((n, v) => n + v, 0);
  const score = mcqScore + theoryScore;
  const pct = total ? Math.round((score / total) * 100) : 0;
  const current = phase === "run" ? (idx < round.mcqs.length ? { kind: "mcq" as const, q: round.mcqs[idx] } : { kind: "theory" as const, q: round.theory[idx - round.mcqs.length], n: idx - round.mcqs.length }) : null;

  const start = () => {
    setPhase("run");
    setIdx(0);
    setPicks({});
    setMarks({});
    setRevealed({});
    setLeft(12 * 60);
  };
  const next = () => (idx + 1 >= total ? setPhase("done") : setIdx((v) => v + 1));

  const verdict =
    pct >= 70
      ? { cls: "text-emerald-300", msg: "Hiring signal. That is a phone screen you walk out of smiling — keep this level warm." }
      : pct >= 50
      ? { cls: "text-amber-300", msg: "Solid base, real gaps. Re-run the misses in the MCQ and theory tabs, then mock again." }
      : { cls: "text-rose-300", msg: "The screen got you this time. Drill the Master plan topics first — the second mock always goes better." };

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-rose-300" />
          <h3 className="text-sm font-semibold text-zinc-100">Mock round — {kit.name} screen simulation</h3>
        </div>
        {phase === "run" && (
          <span className={cn("rounded-md border px-2 py-1 font-mono text-[11px]", left < 120 ? "border-rose-500/40 text-rose-300" : "border-zinc-700 text-zinc-400")}>
            {fmtClock(left)} left
          </span>
        )}
      </div>

      {phase === "intro" && (
        <div className="mt-4 space-y-3">
          <p className="text-sm leading-relaxed text-zinc-300">
            A timed blend of {round.mcqs.length} multiple-choice questions and {round.theory.length} written theory
            questions drawn from this kit — the closest thing here to the real 30-minute screen. No XP, no progress
            tracking: this one is just you against the clock.
          </p>
          <ul className="space-y-1.5 text-xs leading-relaxed text-zinc-400">
            <li>• <span className="text-zinc-200">12 minutes</span> total; the clock turns red under two.</li>
            <li>• MCQs grade themselves; theory answers are <span className="text-zinc-200">self-marked</span> against the model answer.</li>
            <li>• 70%+ reads as a hiring signal, 50–69% solid-with-gaps, below that keep drilling.</li>
          </ul>
          <Btn variant="primary" onClick={start}>
            Start the clock <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
          </Btn>
        </div>
      )}

      {phase === "run" && current && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Question {idx + 1} of {total}</span>
            {current.kind === "mcq" ? <span>MCQ</span> : <span>Theory — self-marked</span>}
          </div>
          <div className="mt-1 h-1 rounded bg-zinc-800">
            <div className="h-1 rounded bg-sky-400 transition-all" style={{ width: `${((idx + 1) / total) * 100}%` }} />
          </div>

          {current.kind === "mcq" ? (
            <div className="mt-4">
              <p className="text-sm font-medium leading-relaxed text-zinc-100">{current.q.prompt}</p>
              <div className="mt-3 space-y-2">
                {current.q.choices.map((c, ci) => {
                  const picked = picks[current.q.id];
                  const chosen = picked === ci;
                  const isAnswer = current.q.answer === ci;
                  const done = picked !== undefined;
                  return (
                    <button
                      key={ci}
                      disabled={done}
                      onClick={() => setPicks((p) => ({ ...p, [current.q.id]: ci }))}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs leading-relaxed transition-colors",
                        !done && "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500",
                        done && isAnswer && "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
                        done && chosen && !isAnswer && "border-rose-500/40 bg-rose-500/10 text-rose-200",
                        done && !chosen && !isAnswer && "border-zinc-800 bg-zinc-900/60 text-zinc-500"
                      )}
                    >
                      <span className="font-mono text-[10px] opacity-70">{LETTERS[ci]}</span>
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
              {picks[current.q.id] !== undefined && (
                <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs leading-relaxed text-zinc-300">
                  {picks[current.q.id] === current.q.answer ? (
                    <div className="flex items-center gap-1.5 font-medium text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Correct.</div>
                  ) : (
                    <div className="flex items-center gap-1.5 font-medium text-rose-300"><XCircle className="h-3.5 w-3.5" /> Not the answer they want.</div>
                  )}
                  <p className="mt-1.5">{current.q.why}</p>
                  {picks[current.q.id] !== current.q.answer &&
                    current.q.notes?.filter((n) => n.choice === picks[current.q.id]).map((n, ni) => (
                      <p key={ni} className="mt-1 text-amber-200/90">Coached note: {n.why}</p>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm font-medium leading-relaxed text-zinc-100">{current.q.q}</p>
              <textarea
                rows={4}
                placeholder="Say it the way you would out loud — definition, trade-off, one example."
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2.5 text-xs leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
              />
              {!revealed[current.n] ? (
                <Btn variant="soft" className="mt-2" onClick={() => setRevealed((r) => ({ ...r, [current.n]: true }))}>
                  Reveal model answer
                </Btn>
              ) : (
                <div className="mt-2 space-y-2">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs leading-relaxed text-zinc-300">{current.q.a}</div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                    Self-mark:
                    {([1, 0.5, 0] as TheoryMark[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setMarks((m) => ({ ...m, [current.n]: v }))}
                        className={cn(
                          "rounded-md border px-2 py-1 transition-colors",
                          marks[current.n] === v ? "border-sky-400/50 bg-sky-400/10 text-sky-200" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
                        )}
                      >
                        {v === 1 ? "Nailed it (1)" : v === 0.5 ? "Shaky (0.5)" : "Missed it (0)"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Btn
              variant="primary"
              disabled={
                current.kind === "mcq" ? picks[current.q.id] === undefined : marks[current.n] === undefined
              }
              onClick={next}
            >
              {idx + 1 >= total ? "See result" : "Next"} <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Btn>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <Trophy className={cn("h-8 w-8", verdict.cls)} />
            <div>
              <div className="text-2xl font-bold text-zinc-50">{score}/{total} <span className="text-sm font-medium text-zinc-400">({pct}%)</span></div>
              <div className={cn("text-xs font-semibold", verdict.cls)}>{verdict.msg}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
              <div className="text-zinc-400">Multiple choice</div>
              <div className="mt-0.5 text-base font-semibold text-zinc-100">{mcqScore}/{round.mcqs.length}</div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
              <div className="text-zinc-400">Theory (self-marked)</div>
              <div className="mt-0.5 text-base font-semibold text-zinc-100">{theoryScore}/{round.theory.length}</div>
            </div>
          </div>
          <Btn variant="soft" onClick={() => { setSeed((s) => s + 1); setPhase("intro"); }}>
            <RotateCcw className="mr-1 inline h-3.5 w-3.5" /> New mock round
          </Btn>
        </div>
      )}
    </Panel>
  );
}

/* ---------------- mastery quiz (per domain) ---------------- */

export function MasteryQuiz({ domain }: { domain: CompanyDomain }) {
  const [seed, setSeed] = useState(0);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<Array<{ kitId: string; kitName: string; ok: boolean }>>([]);

  const quiz = useMemo(() => {
    const kits = domain.companies.map(companyKit).filter((k): k is CompanyKit => !!k);
    const perKit = kits.map((k) => ({ kit: k, qs: shuffle(k.mcqs) }));
    const out: Array<{ kit: CompanyKit; mcq: Mcq }> = [];
    for (let take = 0; out.length < 12 && perKit.some((p) => p.qs.length > take); take++) {
      for (const p of perKit) if (p.qs[take] && out.length < 12) out.push({ kit: p.kit, mcq: p.qs[take] });
    }
    return shuffle(out);
  }, [seed, domain]);

  const finished = i >= quiz.length;
  const cur = finished ? null : quiz[i];
  const score = results.filter((r) => r.ok).length;

  const pick = (c: number) => {
    if (!cur || picked !== null) return;
    setPicked(c);
    setResults((r) => [...r, { kitId: cur.kit.id, kitName: cur.kit.name, ok: c === cur.mcq.answer }]);
  };
  const restart = () => {
    setSeed((s) => s + 1);
    setI(0);
    setPicked(null);
    setResults([]);
  };

  const tally = useMemo(() => {
    const m = new Map<string, { name: string; ok: number; n: number }>();
    for (const r of results) {
      const e = m.get(r.kitId) ?? { name: r.kitName, ok: 0, n: 0 };
      e.n += 1;
      if (r.ok) e.ok += 1;
      m.set(r.kitId, e);
    }
    return [...m.values()];
  }, [results]);

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-300" />
          <h3 className="text-sm font-semibold text-zinc-100">Mastery quiz — {domain.name}</h3>
        </div>
        {!finished && <span className="text-[11px] text-zinc-500">{Math.min(i + 1, 12)} / {quiz.length}</span>}
      </div>

      {finished ? (
        <div className="mt-4 space-y-3">
          <div className="text-2xl font-bold text-zinc-50">{score}/{quiz.length} <span className="text-sm font-medium text-zinc-400">({Math.round((score / Math.max(1, quiz.length)) * 100)}%)</span></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {tally.map((t) => (
              <div key={t.name} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs">
                <div className="truncate text-zinc-300">{t.name}</div>
                <div className={cn("mt-0.5 font-semibold", t.ok === t.n ? "text-emerald-300" : t.ok === 0 ? "text-rose-300" : "text-amber-300")}>
                  {t.ok}/{t.n}
                </div>
              </div>
            ))}
          </div>
          <Btn variant="soft" onClick={restart}><RotateCcw className="mr-1 inline h-3.5 w-3.5" /> Retake (new sample)</Btn>
        </div>
      ) : (
        cur && (
          <div className="mt-4">
            <div className="h-1 rounded bg-zinc-800">
              <div className="h-1 rounded bg-amber-400 transition-all" style={{ width: `${(i / quiz.length) * 100}%` }} />
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">Asked at <span className="text-zinc-300">{cur.kit.name}</span></div>
            <p className="mt-1 text-sm font-medium leading-relaxed text-zinc-100">{cur.mcq.prompt}</p>
            <div className="mt-3 space-y-2">
              {cur.mcq.choices.map((c, ci) => {
                const done = picked !== null;
                const chosen = picked === ci;
                const isAnswer = cur.mcq.answer === ci;
                return (
                  <button
                    key={ci}
                    disabled={done}
                    onClick={() => pick(ci)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs leading-relaxed transition-colors",
                      !done && "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500",
                      done && isAnswer && "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
                      done && chosen && !isAnswer && "border-rose-500/40 bg-rose-500/10 text-rose-200",
                      done && !chosen && !isAnswer && "border-zinc-800 bg-zinc-900/60 text-zinc-500"
                    )}
                  >
                    <span className="font-mono text-[10px] opacity-70">{LETTERS[ci]}</span>
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs leading-relaxed text-zinc-300">
                {picked === cur.mcq.answer ? (
                  <div className="flex items-center gap-1.5 font-medium text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Correct.</div>
                ) : (
                  <div className="flex items-center gap-1.5 font-medium text-rose-300"><XCircle className="h-3.5 w-3.5" /> Miss.</div>
                )}
                <p className="mt-1.5">{cur.mcq.why}</p>
                {picked !== cur.mcq.answer &&
                  cur.mcq.notes?.filter((n) => n.choice === picked).map((n, ni) => (
                    <p key={ni} className="mt-1 text-amber-200/90">Coached note: {n.why}</p>
                  ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Btn variant="primary" disabled={picked === null} onClick={() => { setPicked(null); setI((v) => v + 1); }}>
                {i + 1 >= quiz.length ? "See result" : "Next"} <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
              </Btn>
            </div>
          </div>
        )
      )}
    </Panel>
  );
}
