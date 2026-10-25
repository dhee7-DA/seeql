"use client";

// Domain Mastery — the Domains tab in the LeetCode Big Board.
// One pack = one business domain on ONE shared dataset: 6-8 anchor
// companies, 60 query problems, 60 MCQs and 60 case studies, each bank
// balanced 20 Easy / 20 Medium / 20 Hard. Everything grades against the
// engine-verified snapshot in dm-expected.ts and pays XP into the honest
// ledger — same store as the rest of the band.
// The view is list→detail: pick a pack, work it, back out to switch.

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  FolderOpen,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  DM_BANDS,
  DM_MCQ_XP,
  DM_PACKS,
  dmCaseKey,
  dmMcqKey,
  dmQueryKey,
  dmQueryXp,
  type DmCase,
  type DmMcq,
  type DmPack,
  type DmQuery,
} from "@/lib/leetcode/domain-packs";
import { DM_EXPECTED } from "@/lib/leetcode/content/dm-expected";
import { seededRandom } from "@/lib/leetcode/lc-meta";
import { gradeSqlResult, type SqlCheckOutcome } from "@/lib/leetcode/sql-check";
import type { ExecResult } from "@/lib/sql-types";
import { SqlEditor } from "@/components/sql-editor";
import { ResultGrid } from "./result-grid";
import { useProgress } from "@/lib/curriculum/progress";
import { celebrate } from "./celebrate";
import { Btn, Chip, Panel, ProgressBar, SectionLabel } from "./ui/kit";

type ExpectedOut = { columns?: string[]; rows?: unknown[][] };
const expectedFor = (key: string): ExpectedOut | null => {
  const e = DM_EXPECTED[key];
  return e && e.rows ? (e as ExpectedOut) : null;
};

function useSolved(packId: string) {
  const xpEvents = useProgress((s) => s.xpEvents);
  return useMemo(() => {
    const q = new Set<string>();
    const m = new Set<string>();
    const steps = new Set<string>();
    const cases = new Set<string>();
    for (const k of Object.keys(xpEvents)) {
      if (!k.startsWith(`dm:${packId}:`)) continue;
      if (k.includes(":q:")) q.add(k);
      else if (k.includes(":m:")) m.add(k);
      else if (k.includes(":c:")) {
        steps.add(k);
        cases.add(k.split(":").slice(0, 5).join(":"));
      }
    }
    return { q, m, steps, cases };
  }, [xpEvents, packId]);
}

// Per-pack progress for the list screen (cheap scan over the ledger).
function usePackProgress() {
  const xpEvents = useProgress((s) => s.xpEvents);
  return useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const k of Object.keys(xpEvents)) {
      const match = k.match(/^dm:([^:]+):(q|m|c):/);
      if (!match) continue;
      const packId = match[1];
      if (k.includes(":c:")) {
        // count case steps once per CASE (strip :step)
        (map[packId] ??= new Set()).add(k.split(":").slice(0, 5).join(":"));
      } else {
        (map[packId] ??= new Set()).add(k);
      }
    }
    return map;
  }, [xpEvents]);
}

// MCQ options arrive with the truth at a known index (0 for engine-generated
// output options, mcq.answer for hand-authored ones). Deterministically
// shuffle per pack+id so the answer position varies but is stable.
function shuffledMcq(packId: string, mcq: DmMcq): { opts: string[]; answer: number } {
  const opts =
    mcq.kind === "output"
      ? (DM_EXPECTED[`${packId}:m:${mcq.id}:opts`]?.options ?? [])
      : mcq.options;
  const truthIndex = mcq.kind === "output" ? 0 : mcq.answer;
  let seed = 0;
  for (const ch of `${packId}:${mcq.id}`) seed = (seed * 31 + ch.charCodeAt(0)) | 0;
  const rnd = seededRandom(seed);
  const idx = opts.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return { opts: idx.map((i) => opts[i]), answer: idx.indexOf(truthIndex) };
}

// ---------------------------------------------------------------- query card
function QueryCard({ packId, q, solved }: { packId: string; q: DmQuery; solved: boolean }) {
  const [open, setOpen] = useState(false);
  const [sql, setSql] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExecResult | null>(null);
  const [outcome, setOutcome] = useState<SqlCheckOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const awardXp = useProgress((s) => s.awardXp);
  const xp = dmQueryXp(q.difficulty);
  const exp = expectedFor(`${packId}:q:${q.id}`);

  const run = async () => {
    if (!sql.trim() || busy) return;
    setBusy(true);
    setError(null);
    setOutcome(null);
    try {
      const res = await fetch("/api/dm-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: packId, sql }),
      });
      const data = (await res.json()) as ExecResult | { ok: false; error: string };
      if (!data.ok) {
        setError("error" in data ? data.error : "Query failed");
        setResult(null);
      } else {
        setResult(data);
        if (exp) {
          const oc = gradeSqlResult(data, {
            slug: `${packId}:${q.id}`,
            columns: exp.columns ?? [],
            rows: exp.rows as ExecResult["rows"],
            order: q.order,
          });
          setOutcome(oc);
          if (oc.status === "pass" && awardXp(dmQueryKey(packId, q.id), xp)) {
            celebrate({ kind: "xp", title: `+${xp} XP — ${q.title}`, sub: "Domain problem solved" });
          }
        }
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel pad={0} className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-zinc-900/40"
      >
        <span
          className={`tnum flex h-6 w-9 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold uppercase ${
            solved ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-800/70 text-zinc-400"
          }`}
        >
          {solved ? <Check className="h-3.5 w-3.5" /> : q.id}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-zinc-100">{q.title}</span>
          <span className="font-mono text-[10px] text-zinc-500">
            {q.company} · {q.difficulty} · {xp} XP
          </span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-zinc-800/80 px-3.5 pb-4 pt-3">
          <p className="text-[12.5px] leading-relaxed text-zinc-300">{q.statement}</p>
          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <SqlEditor value={sql} onChange={setSql} onVisualize={() => void run()} className="min-h-[100px]" />
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="soft" onClick={run} className="text-[12px]" disabled={busy}>
              {busy ? "Running…" : "Run & check"}
            </Btn>
            {outcome && (
              <span className={`text-[12px] font-semibold ${outcome.status === "pass" ? "text-emerald-300" : "text-amber-300"}`}>
                {outcome.title}
              </span>
            )}
            {error && <span className="text-[12px] font-semibold text-rose-300">{error}</span>}
          </div>
          {result && (
            <div className="max-h-72 overflow-auto rounded-lg border border-zinc-800/80">
              <ResultGrid data={{ columns: result.columns, rows: result.rows }} />
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

// ------------------------------------------------------------------ mcq card
function McqCard({ packId, m, solved }: { packId: string; m: DmMcq; solved: boolean }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const awardXp = useProgress((s) => s.awardXp);
  const { opts, answer } = useMemo(() => shuffledMcq(packId, m), [packId, m]);
  const xp = DM_MCQ_XP[m.difficulty];
  const letters = ["A", "B", "C", "D"];

  const pick = (i: number) => {
    if (picked !== null || solved) return;
    setPicked(i);
    if (i === answer) {
      if (awardXp(dmMcqKey(packId, m.id), xp)) {
        celebrate({ kind: "xp", title: `+${xp} XP — first try`, sub: m.prompt.slice(0, 60) });
      }
    } else {
      setWrongPick(i);
    }
  };

  return (
    <Panel pad={0} className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-zinc-900/40"
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold ${
            solved ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-800/70 text-zinc-400"
          }`}
        >
          {solved ? <Check className="h-3.5 w-3.5" /> : "?"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-zinc-100">{m.prompt}</span>
          <span className="font-mono text-[10px] text-zinc-500">
            {m.company} · {m.difficulty} · {m.kind} · {xp} XP
          </span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-zinc-800/80 px-3.5 pb-4 pt-3">
          {m.kind === "output" && m.truthQuery && (
            <pre className="max-h-48 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 font-mono text-[11px] leading-relaxed text-zinc-300">
              {m.truthQuery}
            </pre>
          )}
          <div className="grid gap-1.5">
            {opts.map((opt, i) => {
              const isAnswer = i === answer;
              const isPicked = i === picked;
              const isWrong = i === wrongPick;
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={picked !== null || solved}
                  className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-[12.5px] transition-colors ${
                    picked === null && !solved
                      ? "border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900/50"
                      : isAnswer
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                        : isWrong
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                          : "border-zinc-800/60 text-zinc-500"
                  }`}
                >
                  <span className="mt-0.5 font-mono text-[10px] font-bold">{letters[i]}</span>
                  <span className="min-w-0 flex-1 break-words">{opt}</span>
                </button>
              );
            })}
          </div>
          {(picked !== null || solved) && (
            <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-[12px] leading-relaxed text-zinc-400">
              {m.explain}
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}

// ------------------------------------------------------------------ case card
function CaseStepRunner({ packId, caseId, stepNo, prompt, code, order, difficulty }: {
  packId: string;
  caseId: string;
  stepNo: number;
  prompt: string;
  code: string;
  order: "exact" | "any";
  difficulty: "Easy" | "Medium" | "Hard";
}) {
  const [sql, setSql] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExecResult | null>(null);
  const [outcome, setOutcome] = useState<SqlCheckOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const awardXp = useProgress((s) => s.awardXp);
  const solved = useProgress((s) => s.xpEvents[dmCaseKey(packId, caseId, stepNo)] !== undefined);
  const exp = expectedFor(`${packId}:c:${caseId}:${stepNo}`);
  const xp = { Easy: 8, Medium: 12, Hard: 18 }[difficulty];

  const run = async () => {
    if (!sql.trim() || busy) return;
    setBusy(true);
    setError(null);
    setOutcome(null);
    try {
      const res = await fetch("/api/dm-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: packId, sql }),
      });
      const data = (await res.json()) as ExecResult | { ok: false; error: string };
      if (!data.ok) {
        setError("error" in data ? data.error : "Query failed");
        setResult(null);
      } else {
        setResult(data);
        if (exp) {
          const oc = gradeSqlResult(data, {
            slug: `${packId}:${caseId}:${stepNo}`,
            columns: exp.columns ?? [],
            rows: exp.rows as ExecResult["rows"],
            order,
          });
          setOutcome(oc);
          if (oc.status === "pass" && awardXp(dmCaseKey(packId, caseId, stepNo), xp)) {
            celebrate({ kind: "xp", title: `+${xp} XP — step ${stepNo} cleared`, sub: "Case study progress" });
          }
        }
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2 rounded-lg border border-zinc-800/80 p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-800 font-mono text-[10px] font-bold text-zinc-300">
          {stepNo}
        </span>
        <p className="flex-1 text-[12px] leading-relaxed text-zinc-300">{prompt}</p>
        {solved && <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />}
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <SqlEditor value={sql} onChange={setSql} onVisualize={() => void run()} className="min-h-[80px]" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Btn variant="soft" onClick={run} className="text-[11px]" disabled={busy}>
          {busy ? "Running…" : "Run step"}
        </Btn>
        <Btn variant="ghost" onClick={() => setShowSolution((s) => !s)} className="text-[11px]">
          {showSolution ? "Hide solution" : "Reveal solution"}
        </Btn>
        {outcome && (
          <span className={`text-[11.5px] font-semibold ${outcome.status === "pass" ? "text-emerald-300" : "text-amber-300"}`}>
            {outcome.title}
          </span>
        )}
        {error && <span className="text-[11.5px] font-semibold text-rose-300">{error}</span>}
      </div>
      {showSolution && (
        <pre className="max-h-40 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/70 p-2.5 font-mono text-[10.5px] leading-relaxed text-zinc-400">
          {code}
        </pre>
      )}
      {result && (
        <div className="max-h-56 overflow-auto rounded-lg border border-zinc-800/80">
          <ResultGrid data={{ columns: result.columns, rows: result.rows }} />
        </div>
      )}
    </div>
  );
}

function CaseCard({ packId, c, done }: { packId: string; c: DmCase; done: boolean }) {
  const [open, setOpen] = useState(false);
  const xp = { Easy: 8, Medium: 12, Hard: 18 }[c.difficulty];
  return (
    <Panel pad={0} className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-zinc-900/40"
      >
        <span
          className={`flex h-6 w-8 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold uppercase ${
            done ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-800/70 text-zinc-400"
          }`}
        >
          {done ? <Check className="h-3.5 w-3.5" /> : c.id}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-zinc-100">{c.title}</span>
          <span className="font-mono text-[10px] text-zinc-500">
            {c.company} · {c.difficulty} · 2 steps · {xp * 2} XP
          </span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-zinc-800/80 px-3.5 pb-4 pt-3">
          <p className="text-[12.5px] italic leading-relaxed text-zinc-400">{c.scenario}</p>
          {c.steps.map((step, i) => (
            <CaseStepRunner
              key={i}
              packId={packId}
              caseId={c.id}
              stepNo={i + 1}
              prompt={step.prompt}
              code={step.code}
              order={step.order}
              difficulty={c.difficulty}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}

// ------------------------------------------------------------------ sections
function BandSection({
  icon: Icon,
  title,
  blurb,
  bands,
  counts,
  doneCount,
}: {
  icon: typeof FileText;
  title: string;
  blurb: string;
  bands: { Easy: React.ReactNode; Medium: React.ReactNode; Hard: React.ReactNode };
  counts: { Easy: number; Medium: number; Hard: number };
  doneCount: number;
}) {
  const [band, setBand] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const total = counts.Easy + counts.Medium + counts.Hard;
  return (
    <Panel pad={0} className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 px-3.5 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-zinc-400" />
          <div>
            <p className="text-[13px] font-bold text-zinc-100">{title}</p>
            <p className="text-[11px] text-zinc-500">{blurb}</p>
          </div>
        </div>
        <Chip k="done" v={`${doneCount}/${total}`} />
      </div>
      <div className="flex gap-1.5 px-3.5 pt-3">
        {DM_BANDS.map((b) => (
          <Btn key={b.key} variant="pill" active={band === b.key} onClick={() => setBand(b.key)} className="text-[11px]">
            {b.label} · {counts[b.key]}
          </Btn>
        ))}
      </div>
      <p className="px-3.5 pt-2 text-[11px] text-zinc-500">{DM_BANDS.find((b) => b.key === band)?.blurb}</p>
      <div className="space-y-2 p-3.5">{bands[band]}</div>
    </Panel>
  );
}

// ------------------------------------------------------------------ detail
function PackDetailView({ pack, onBack }: { pack: DmPack; onBack: () => void }) {
  const solved = useSolved(pack.id);
  const [primerOpen, setPrimerOpen] = useState(false);

  const queries = pack.queries;
  const mcqs = pack.mcqs;
  const cases = pack.cases;
  const byBand = <T extends { difficulty: "Easy" | "Medium" | "Hard" }>(items: T[]) => ({
    Easy: items.filter((i) => i.difficulty === "Easy"),
    Medium: items.filter((i) => i.difficulty === "Medium"),
    Hard: items.filter((i) => i.difficulty === "Hard"),
  });
  const qBands = byBand(queries);
  const mBands = byBand(mcqs);
  const cBands = byBand(cases);

  const totalItems = queries.length + mcqs.length + cases.length;
  const doneItems = solved.q.size + solved.m.size + solved.cases.size;

  return (
    <div className="space-y-4">
      <Panel pad={4}>
        <button
          onClick={onBack}
          className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-zinc-400 transition-colors hover:text-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All domains
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <SectionLabel>domain mastery</SectionLabel>
            <h2 className="mt-1 flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-100">
              <Layers className="h-5 w-5 text-emerald-300" /> {pack.title}
            </h2>
            <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-zinc-400">{pack.tagline}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Chip k="pack progress" v={`${doneItems}/${totalItems}`} />
            <span className="font-mono text-[10px] text-zinc-600">
              60 queries · 60 MCQs · 60 cases · one shared dataset
            </span>
          </div>
        </div>
        <ProgressBar value={doneItems / totalItems} className="mt-3" />

        {/* companies */}
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {pack.companies.map((co) => (
            <div key={co.name} className="flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
              <Briefcase className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${co.real ? "text-emerald-300" : "text-zinc-500"}`} />
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-zinc-200">
                  {co.name}
                  {!co.real && <span className="ml-1.5 font-mono text-[9px] uppercase tracking-wider text-zinc-600">original</span>}
                </p>
                <p className="text-[11px] leading-snug text-zinc-500">{co.blurb}</p>
              </div>
            </div>
          ))}
        </div>

        {/* primer */}
        <button
          onClick={() => setPrimerOpen((o) => !o)}
          className="mt-3 flex w-full items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2.5 text-left transition-colors hover:bg-zinc-900/50"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="flex-1 text-[12.5px] font-semibold text-zinc-200">
            Domain primer — {pack.primer.hook}
          </span>
          <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${primerOpen ? "rotate-180" : ""}`} />
        </button>
        {primerOpen && (
          <div className="mt-2 space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            {pack.primer.concept.map((para, i) => (
              <p key={i} className="text-[12.5px] leading-relaxed text-zinc-300">{para}</p>
            ))}
            <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
              {pack.primer.glossary.map((g) => (
                <p key={g.term} className="text-[11.5px] leading-snug text-zinc-400">
                  <span className="font-semibold text-zinc-200">{g.term}</span> — {g.def}
                </p>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {/* queries */}
      <BandSection
        icon={FileText}
        title="Query problems"
        blurb="Write the SQL against the shared dataset — graded row-exact where order matters."
        doneCount={solved.q.size}
        counts={{ Easy: qBands.Easy.length, Medium: qBands.Medium.length, Hard: qBands.Hard.length }}
        bands={{
          Easy: qBands.Easy.map((q) => <QueryCard key={q.id} packId={pack.id} q={q} solved={solved.q.has(`${pack.id}:q:${q.id}`)} />),
          Medium: qBands.Medium.map((q) => <QueryCard key={q.id} packId={pack.id} q={q} solved={solved.q.has(`${pack.id}:q:${q.id}`)} />),
          Hard: qBands.Hard.map((q) => <QueryCard key={q.id} packId={pack.id} q={q} solved={solved.q.has(`${pack.id}:q:${q.id}`)} />),
        }}
      />

      {/* mcqs */}
      <BandSection
        icon={CircleHelp}
        title="Knowledge checks"
        blurb="Output picks (engine-verified candidates) and concept checks — first-try pays."
        doneCount={solved.m.size}
        counts={{ Easy: mBands.Easy.length, Medium: mBands.Medium.length, Hard: mBands.Hard.length }}
        bands={{
          Easy: mBands.Easy.map((m) => <McqCard key={m.id} packId={pack.id} m={m} solved={solved.m.has(`${pack.id}:m:${m.id}`)} />),
          Medium: mBands.Medium.map((m) => <McqCard key={m.id} packId={pack.id} m={m} solved={solved.m.has(`${pack.id}:m:${m.id}`)} />),
          Hard: mBands.Hard.map((m) => <McqCard key={m.id} packId={pack.id} m={m} solved={solved.m.has(`${pack.id}:m:${m.id}`)} />),
        }}
      />

      {/* cases */}
      <BandSection
        icon={FolderOpen}
        title="Case studies"
        blurb="Two-step work scenarios on the same world — build the intermediate, then the answer."
        doneCount={solved.cases.size}
        counts={{ Easy: cBands.Easy.length, Medium: cBands.Medium.length, Hard: cBands.Hard.length }}
        bands={{
          Easy: cBands.Easy.map((c) => <CaseCard key={c.id} packId={pack.id} c={c} done={solved.cases.has(`${pack.id}:c:${c.id}`)} />),
          Medium: cBands.Medium.map((c) => <CaseCard key={c.id} packId={pack.id} c={c} done={solved.cases.has(`${pack.id}:c:${c.id}`)} />),
          Hard: cBands.Hard.map((c) => <CaseCard key={c.id} packId={pack.id} c={c} done={solved.cases.has(`${pack.id}:c:${c.id}`)} />),
        }}
      />
    </div>
  );
}

// ------------------------------------------------------------------ the view
export function DomainsView() {
  const [packId, setPackId] = useState<string | null>(null);
  const progress = usePackProgress();
  const pack = packId ? DM_PACKS.find((p) => p.id === packId) ?? null : null;

  if (pack) return <PackDetailView pack={pack} onBack={() => setPackId(null)} />;

  return (
    <div className="space-y-4">
      <Panel pad={4}>
        <SectionLabel>domain mastery</SectionLabel>
        <h2 className="mt-1 flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-100">
          <Layers className="h-5 w-5 text-emerald-300" /> Domain packs
        </h2>
        <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-zinc-400">
          One pack = one business domain on ONE shared dataset: 60 query problems, 60 knowledge checks and 60 two-step
          case studies — 20 Easy / 20 Medium / 20 Hard each — across real employers and fictional carriers. Every item is
          engine-verified. Pick a pack to work it.
        </p>
      </Panel>

      <div className="grid gap-3 lg:grid-cols-2">
        {DM_PACKS.map((p) => {
          const done = progress[p.id]?.size ?? 0;
          const total = p.queries.length + p.mcqs.length + p.cases.length;
          const realCount = p.companies.filter((c) => c.real).length;
          return (
            <button
              key={p.id}
              onClick={() => setPackId(p.id)}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-left transition-colors hover:border-zinc-600 hover:bg-zinc-900/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[15px] font-bold text-zinc-100">
                    <Layers className="h-4 w-4 text-emerald-300" /> {p.title}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{p.tagline}</p>
                </div>
                <Chip k="done" v={`${done}/${total}`} />
              </div>
              <ProgressBar value={total > 0 ? done / total : 0} className="mt-3" />
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {p.companies.slice(0, 4).map((co) => (
                  <span key={co.name} className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                    {co.name}
                  </span>
                ))}
                {p.companies.length > 4 && (
                  <span className="font-mono text-[10px] text-zinc-600">+{p.companies.length - 4} more</span>
                )}
              </div>
              <p className="mt-2 font-mono text-[10px] text-zinc-600">
                {p.queries.length} queries · {p.mcqs.length} MCQs · {p.cases.length} cases · {realCount} real +{" "}
                {p.companies.length - realCount} original carriers
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
