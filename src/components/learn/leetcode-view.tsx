"use client";

// LeetCode — The Big 300. Registry-driven tracker: topic/difficulty/company
// filters, full deep-dive reports (statement → breakdown → logic ladder →
// verified Python solution), company index, and solved-marking that pays XP
// into the shared ledger (lc:<slug>).

import { useMemo, useState } from "react";
import {
  BookOpen,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Compass,
  Database,
  FlaskConical,
  Lightbulb,
  ListChecks,
  Play,
  Search,
  Sparkles,
  Stamp,
  TriangleAlert,
  TrendingUp,
} from "lucide-react";
import {
  LC_ALL,
  LC_COMPANIES,
  LC_DEEP_SLUGS,
  LC_TOPICS,
  lcByCompany,
} from "@/lib/leetcode/registry";
import { SQL50_SECTIONS, sqlSectionOf } from "@/lib/leetcode/sections";
import { lcDeepDive, lcSqlDive } from "@/lib/leetcode/content/content";
import { lcSqlExpected } from "@/lib/leetcode/content/sql-expected";
import { gradeSqlResult, type SqlCheckOutcome } from "@/lib/leetcode/sql-check";
import type { ExecResult } from "@/lib/sql-types";
import type { LcDifficulty, LcRef, LcSqlDive, LcSqlSchema } from "@/lib/leetcode/types";
import { LC_XP, lcSolveKey } from "@/lib/leetcode/types";
import { SqlEditor } from "@/components/sql-editor";
import { ResultGrid } from "./result-grid";
import { useProgress } from "@/lib/curriculum/progress";
import { celebrate } from "./celebrate";
import { Btn, Chip, FOCUS_RING, Panel, ProgressBar, SectionLabel } from "./ui/kit";
import {
  ConstraintList,
  DiveCodeBlock,
  ExampleCards,
  FollowUpList,
  LadderRungs,
  SectionHead,
  SqlProse,
  TrapList,
  type Tone,
} from "./lc-dive-ui";
import { ErMiniDiagram } from "./lc-diagrams";
import { PatternDiagram } from "./lc-pattern";
import { cn } from "@/lib/utils";

type Tab = "problems" | "companies";
type Diff = "All" | LcDifficulty;

/** Section lookup by display title — for group headers + anchors. */
const SECTION_BY_TITLE = new Map(SQL50_SECTIONS.map((s) => [s.title, s]));

const DIFF_DOT: Record<LcDifficulty, string> = {
  Easy: "bg-emerald-400",
  Medium: "bg-amber-400",
  Hard: "bg-rose-400",
};
const DIFF_TEXT: Record<LcDifficulty, string> = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-rose-400",
};
const DIFF_PILL: Record<LcDifficulty, string> = {
  Easy: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  Medium: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  Hard: "border-rose-400/30 bg-rose-400/10 text-rose-300",
};
const STEP_DOT: Record<Tone, string> = {
  sky: "bg-sky-400",
  violet: "bg-violet-400",
  fuchsia: "bg-fuchsia-400",
  rose: "bg-rose-400",
  cyan: "bg-cyan-400",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
};

function DiffDot({ d }: { d: LcDifficulty }) {
  return <span aria-hidden className={cn("h-2 w-2 shrink-0 rounded-full", DIFF_DOT[d])} />;
}

/* ------------------------------------------------------------------ */
/* Hub row                                                             */
/* ------------------------------------------------------------------ */

function ProblemRow({
  p,
  solved,
  hasDeep,
  onOpen,
  first,
}: {
  p: LcRef;
  solved: boolean;
  hasDeep: boolean;
  onOpen: () => void;
  first: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-emerald-400/[0.04]",
        FOCUS_RING,
        !first && "border-t border-black/5 dark:border-white/5",
      )}
    >
      <span className="tnum w-9 shrink-0 font-mono text-[11px] text-zinc-500">{p.num}</span>
      <DiffDot d={p.difficulty} />
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm font-medium", solved ? "text-zinc-500" : "text-zinc-100")}>
          {p.title}
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-zinc-500">
          {p.companies.slice(0, 3).join(" · ")}
        </span>
      </span>
      {hasDeep && (
        <span className="hidden shrink-0 rounded-full border border-emerald-400/30 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-300 sm:block">
          deep-dive
        </span>
      )}
      {p.sql && (
        <span className="hidden shrink-0 rounded-full border border-zinc-700 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-400 sm:block">
          sql
        </span>
      )}
      {!p.free && (
        <span className="hidden shrink-0 rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-300 sm:block">
          premium
        </span>
      )}
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          solved ? "bg-emerald-400 text-[var(--brand-ink)]" : "border border-zinc-700 text-transparent",
        )}
        aria-label={solved ? "solved" : "not solved"}
      >
        <Check className="h-3 w-3" />
      </span>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
    </button>
  );
}

/** Reveal gate — hides spoilers until clicked. */
function Reveal({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  if (open) return <>{children}</>;
  return (
    <Btn variant="soft" className="w-full" onClick={() => setOpen(true)}>
      <Lightbulb className="h-3.5 w-3.5" /> {label}
    </Btn>
  );
}

/* ------------------------------------------------------------------ */
/* SQL 50 — schema panel + sandbox practice                            */
/* ------------------------------------------------------------------ */

function SqlSchemaPanel({ schema }: { schema: LcSqlSchema }) {
  const [showSeed, setShowSeed] = useState(false);
  return (
    <Panel pad={4} id="dive-schema" className="scroll-mt-16">
      <SectionHead
        tone="cyan"
        icon={Database}
        title="The schema — your SQLite sandbox"
        kicker="every table, every key"
        right={
          <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            <Database className="h-3 w-3" /> seeded fresh on every run
          </span>
        }
      />
      <ErMiniDiagram ddl={schema.ddl} />
      {schema.tables && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {schema.tables.map((t) => (
            <Chip key={t.name} k={t.name} v={t.note} />
          ))}
        </div>
      )}
      <div className="mt-3">
        <DiveCodeBlock code={schema.ddl} tone="ddl" />
      </div>
      <div className="mt-2">
        <Btn variant="soft" onClick={() => setShowSeed((v) => !v)}>
          {showSeed ? "Hide" : "Show"} sample data
        </Btn>
        {showSeed && (
          <div className="mt-2">
            <DiveCodeBlock code={schema.seed} tone="seed" />
          </div>
        )}
      </div>
    </Panel>
  );
}

function SqlPractice({ dive }: { dive: LcSqlDive }) {
  const awardXp = useProgress((s) => s.awardXp);
  const solvedAt = useProgress((s) => s.xpEvents[lcSolveKey(dive.slug)]);
  const [sql, setSql] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExecResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<SqlCheckOutcome | null>(null);

  const run = async (check: boolean) => {
    if (busy || !sql.trim()) return;
    setBusy(true);
    setError(null);
    setOutcome(null);
    try {
      const res = await fetch("/api/lc-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: dive.slug, sql }),
      });
      const data = (await res.json()) as ExecResult | { ok: false; error: string };
      if (!data.ok) {
        setError("error" in data ? data.error : "Query failed");
        setResult(null);
      } else {
        setResult(data);
        if (check) {
          if (expected) {
            const oc = gradeSqlResult(data, expected);
            setOutcome(oc);
            if (oc.status === "pass" && awardXp(lcSolveKey(dive.slug), dive.xp)) {
              celebrate({ kind: "xp", title: `+${dive.xp} XP — ${dive.slug.replace(/-/g, " ")}`, sub: "SQL 50 · solved in the sandbox" });
            }
          }
        }
      }
    } catch {
      setError("Network error — try again.");
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  const expected = lcSqlExpected(dive.slug);
  return (
    <Panel pad={4} id="dive-sandbox" className="scroll-mt-16">
      <SectionHead
        tone="emerald"
        icon={FlaskConical}
        title="Solve it — write your query"
        kicker="live sandbox · rolled back after every run"
        right={
          solvedAt !== undefined ? (
            <span className="flex items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              <Check className="h-3 w-3" /> Solved · {solvedAt} XP
            </span>
          ) : (
            <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
              +{dive.xp} XP on first solve
            </span>
          )
        }
      />
      <p className="text-[12px] leading-relaxed text-zinc-500">
        Runs against the seeded schema above inside a rolled-back sandbox — experiment freely.{" "}
        {dive.writeVerify
          ? "Write problem: your statement really mutates the tables, then you'll see rows affected plus the resulting data."
          : "Ctrl/⌘ + Enter runs."}
      </p>
      {expected && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">shape hint</span>
          <span className="rounded-md border border-sky-400/25 bg-sky-400/[0.07] px-2 py-0.5 font-mono text-[10px] text-sky-300">
            {expected.columns.length} column{expected.columns.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-md border border-violet-400/25 bg-violet-400/[0.07] px-2 py-0.5 font-mono text-[10px] text-violet-300">
            {expected.rows.length} row{expected.rows.length === 1 ? "" : "s"}
          </span>
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 font-mono text-[10px]",
              dive.order === "exact"
                ? "border-orange-400/25 bg-orange-400/[0.07] text-orange-300"
                : "border-zinc-700 bg-zinc-900/60 text-zinc-400",
            )}
          >
            {dive.order === "exact" ? "row order graded" : "any row order"}
          </span>
        </div>
      )}
      <div className="mt-3">
        <SqlEditor
          value={sql}
          onChange={setSql}
          onVisualize={() => void run(false)}
          className="min-h-[120px]"
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Btn variant="primary" disabled={busy || !sql.trim()} onClick={() => void run(false)}>
          <Play className="h-3.5 w-3.5" /> {busy ? "Running…" : "Run"}
        </Btn>
        <Btn variant="soft" disabled={busy || !sql.trim()} onClick={() => void run(true)}>
          <Check className="h-3.5 w-3.5" /> Run & check · +{dive.xp} XP
        </Btn>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-400/[0.06] p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-rose-300">Query error</p>
          <p className="mt-1 font-mono text-[12px] leading-relaxed text-zinc-300">{error}</p>
        </div>
      )}

      {outcome && (
        <div
          className={cn(
            "mt-3 rounded-lg border p-3",
            outcome.status === "pass"
              ? "border-emerald-400/30 bg-emerald-400/[0.06]"
              : "border-amber-400/30 bg-amber-400/[0.06]",
          )}
        >
          <p
            className={cn(
              "font-mono text-[10px] uppercase tracking-wider",
              outcome.status === "pass" ? "text-emerald-300" : "text-amber-300",
            )}
          >
            {outcome.title}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{outcome.detail}</p>
        </div>
      )}

      {result && (
        <div className="mt-3">
          {result.changes !== null && (
            <p className="mb-2 font-mono text-[11px] text-zinc-500">{result.changes} row{result.changes === 1 ? "" : "s"} affected · showing the resulting data</p>
          )}
          <ResultGrid data={{ columns: result.columns, rows: result.rows }} />
        </div>
      )}
      {!result && !error && (
        <p className="mt-3 text-[12px] text-zinc-600">Run your query to see the result table here.</p>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Deep-dive detail                                                    */
/* ------------------------------------------------------------------ */

function LcDetail({ p, onBack }: { p: LcRef; onBack: () => void }) {
  const awardXp = useProgress((s) => s.awardXp);
  const solvedAt = useProgress((s) => s.xpEvents[lcSolveKey(p.slug)]);
  const sdive = p.sql ? lcSqlDive(p.slug) : undefined;
  const deep = lcDeepDive(p.slug);
  const dive = sdive ?? deep;
  const xp = LC_XP[p.difficulty];

  const markSolved = () => {
    if (solvedAt !== undefined) return;
    if (awardXp(lcSolveKey(p.slug), xp)) {
      celebrate({ kind: "xp", title: `+${xp} XP — ${p.title}`, sub: "LeetCode Big 300 · solved" });
    }
  };

  const sec = p.sql ? sqlSectionOf(p.slug) : undefined;
  const steps: Array<{ id: string; label: string; tone: Tone }> = [
    { id: "dive-problem", label: "Problem", tone: "sky" },
    { id: "dive-breakdown", label: "Breakdown", tone: "violet" },
    { id: "dive-ladder", label: "Ladder", tone: "fuchsia" },
    ...(sdive
      ? ([
          { id: "dive-schema", label: "Schema", tone: "cyan" },
          { id: "dive-sandbox", label: "Sandbox", tone: "emerald" },
        ] as const)
      : []),
    { id: "dive-solution", label: "Solution", tone: "amber" },
  ];
  const jump = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className={cn(
          "flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white",
          FOCUS_RING,
        )}
      >
        <ChevronLeft className="h-4 w-4" /> All problems
      </button>

      {/* header */}
      <Panel pad={4}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              #{p.num} · {p.topics.join(" · ")}
            </p>
            <h2 className="mt-0.5 flex items-center gap-2 text-xl font-bold tracking-tight">
              {p.title} <DiffDot d={p.difficulty} />
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className={cn("rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider", DIFF_PILL[p.difficulty])}>
                {p.difficulty}
              </span>
              {sec && (
                <span className="rounded-md border border-emerald-400/25 bg-emerald-400/[0.07] px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  {sec.title}
                </span>
              )}
              <span className="rounded-md border border-zinc-700 bg-zinc-900/60 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                +{xp} XP
              </span>
              {!p.free && (
                <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300">
                  premium
                </span>
              )}
              {p.companies.map((c) => (
                <span key={c} className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[10px] text-zinc-400">
                  {c}
                </span>
              ))}
            </div>
          </div>
          {solvedAt !== undefined ? (
            <span className="flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-medium text-emerald-300">
              <Check className="h-3.5 w-3.5" /> Solved · {solvedAt} XP
            </span>
          ) : (
            <Btn variant="primary" onClick={markSolved} className="shrink-0">
              <Stamp className="h-3.5 w-3.5" /> Mark solved · +{xp} XP
            </Btn>
          )}
        </div>
      </Panel>

      {/* step nav — the five stops of every deep-dive */}
      {dive && (
        <nav
          aria-label="Deep-dive sections"
          className="thin-scrollbar flex gap-1.5 overflow-x-auto pb-1"
        >
          {steps.map((s, i) => (
            <Btn key={s.id} variant="pill" onClick={() => jump(s.id)}>
              <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", STEP_DOT[s.tone])} />
              <span className="tnum font-mono text-[9px] text-zinc-500">{i + 1}</span>
              {s.label}
            </Btn>
          ))}
        </nav>
      )}

      {!dive ? (
        <Panel pad={4}>
          <SectionLabel>Deep-dive in progress</SectionLabel>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            The full report for this problem ships in a later pass — the registry, companies and
            solved-tracking are live now. Meanwhile: it appears on {p.lists.join(", ")}, and marking it solved
            above pays {xp} XP into the same ledger as the rest of the app.
          </p>
        </Panel>
      ) : (
        <>
          {/* The problem */}
          <Panel pad={4} id="dive-problem" className="scroll-mt-16">
            <SectionHead
              tone="sky"
              icon={BookOpen}
              title="The problem"
              kicker={sdive ? "read it twice — the tables tell the story" : "original paraphrase"}
            />
            <p className="text-sm leading-relaxed text-zinc-300">
              <SqlProse text={dive.statement} />
            </p>
            {sdive && (
              <div className="mt-3">
                <PatternDiagram sectionId={sec?.id ?? ""} ddl={sdive.schema.ddl} />
              </div>
            )}
            <div className="mt-3">
              <ExampleCards examples={dive.examples} />
            </div>
            <p className="mt-4 mb-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-cyan-300">
              Constraints — what the data promises you
            </p>
            <ConstraintList items={dive.constraints} />
          </Panel>

          {/* Breakdown */}
          <Panel pad={4} id="dive-breakdown" className="scroll-mt-16">
            <SectionHead
              tone="violet"
              icon={Compass}
              title="The breakdown — what is really being asked"
              kicker="the why behind the wording"
            />
            <Reveal label="Reveal the breakdown">
              <div className="space-y-3">
                {dive.breakdown.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-zinc-300">
                    <SqlProse text={para} />
                  </p>
                ))}
              </div>
            </Reveal>
          </Panel>

          {/* Logic building ladder */}
          <Panel pad={4} id="dive-ladder" className="scroll-mt-16">
            <SectionHead
              tone="fuchsia"
              icon={TrendingUp}
              title="Logic building — the intuition ladder"
              kicker="brute force → pattern → optimal"
            />
            <Reveal label="Reveal the ladder (brute force → pattern → optimal)">
              <LadderRungs rungs={dive.ladder} />
              <div className="mt-4">
                <p className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-rose-300">
                  <TriangleAlert className="h-3 w-3" /> Traps & edges — where points are lost
                </p>
                <TrapList items={dive.edges} />
              </div>
            </Reveal>
          </Panel>

          {/* SQL 50: schema + live sandbox practice (before the solution reveal) */}
          {sdive && <SqlSchemaPanel schema={sdive.schema} />}
          {sdive && <SqlPractice dive={sdive} />}

          {/* Solution */}
          <Panel pad={4} id="dive-solution" className="scroll-mt-16">
            <SectionHead
              tone="amber"
              icon={Sparkles}
              title={`The solution — ${dive.approach}`}
              kicker={sdive ? "engine-verified SQLite" : "engine-verified Python"}
            />
            <Reveal label={sdive ? "Reveal the SQL solution (engine-verified)" : "Reveal the Python solution (engine-verified)"}>
              <DiveCodeBlock code={dive.code} tone={sdive ? "solution" : "python"} />
              <div className="mt-3 space-y-3">
                {dive.walkthrough.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-zinc-400">
                    <SqlProse text={para} />
                  </p>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip k="time" v={dive.time} />
                <Chip k="space" v={dive.space} />
              </div>
              {dive.followUps && dive.followUps.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-sky-300">
                    Interview follow-ups — where the conversation goes next
                  </p>
                  <FollowUpList items={dive.followUps} />
                </div>
              )}
            </Reveal>
          </Panel>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Company index                                                       */
/* ------------------------------------------------------------------ */

function CompaniesIndex({ onPick, solvedOf }: { onPick: (company: string) => void; solvedOf: Set<string> }) {
  return (
    <div className="space-y-5">
      <Panel pad={4}>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold">Company index</h2>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          Which companies ask which problems — top 3 per problem, ranked by how often they appear across the
          registry. Community-sourced from public interview reports, not LeetCode premium data; treat it as a
          prioritisation heuristic, not a guarantee.
        </p>
      </Panel>
      <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
        {LC_COMPANIES.map((c, i) => {
          const problems = lcByCompany(c.name);
          const done = problems.filter((p) => solvedOf.has(p.slug)).length;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => onPick(c.name)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-emerald-400/[0.04]",
                FOCUS_RING,
                i > 0 && "border-t border-black/5 dark:border-white/5",
              )}
            >
              <span className="tnum w-8 shrink-0 font-mono text-[11px] text-zinc-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-zinc-100">{c.name}</span>
                <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
                  asks {problems.slice(0, 4).map((p) => p.title).join(" · ")}
                </span>
              </span>
              {done > 0 && (
                <span className="shrink-0 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  {done} solved
                </span>
              )}
              <span className="tnum shrink-0 font-mono text-[11px] text-zinc-500">{c.count} in set</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main view                                                           */
/* ------------------------------------------------------------------ */

export function LeetCodeView({ initialTopic }: { initialTopic?: string }) {
  const xpEvents = useProgress((s) => s.xpEvents);
  const [sel, setSel] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("problems");
  const [topic, setTopic] = useState<string>(initialTopic ?? "All");
  const [diff, setDiff] = useState<Diff>("All");
  const [company, setCompany] = useState<string>("All");
  const [deepOnly, setDeepOnly] = useState(false);
  const [q, setQ] = useState("");

  const solvedSlugs = useMemo(
    () => new Set(Object.keys(xpEvents).filter((k) => k.startsWith("lc:")).map((k) => k.slice(3))),
    [xpEvents],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return LC_ALL.filter((p) => {
      if (topic === "SQL" ? !p.sql : topic !== "All" && !p.topics.includes(topic)) return false;
      if (diff !== "All" && p.difficulty !== diff) return false;
      if (company !== "All" && !p.companies.includes(company)) return false;
      if (deepOnly && !LC_DEEP_SLUGS.has(p.slug)) return false;
      if (needle && !`${p.num} ${p.title} ${p.slug}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [topic, diff, company, deepOnly, q]);

  const deepTotal = LC_DEEP_SLUGS.size;
  const solvedTotal = solvedSlugs.size;

  // Group the filtered list by display topic — SQL rows group by their SQL 50
  // section (the study plan's seven skill families, in canonical order), not
  // one flat "SQL" pile.
  const groups = useMemo(() => {
    const keyOf = (p: LcRef) => (p.sql ? (sqlSectionOf(p.slug)?.title ?? "SQL") : p.topics[0]);
    const m = new Map<string, LcRef[]>();
    for (const p of filtered) {
      const k = keyOf(p);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(p);
    }
    // canonical order: regular topics first, then SQL sections in study-plan
    // order, then anything unknown (alphabetical)
    const rank = (k: string) => {
      const t = LC_TOPICS.indexOf(k);
      if (t !== -1) return t;
      const s = SQL50_SECTIONS.findIndex((sec) => sec.title === k);
      if (s !== -1) return 100 + s;
      return 999;
    };
    return [...m.entries()].sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]));
  }, [filtered]);

  const selected = sel ? LC_ALL.find((p) => p.slug === sel) ?? null : null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-4 pb-24 md:p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tight">LeetCode — The Big 300</h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Every classic interview problem, deduped from NeetCode 150 (superset of Blind 75), Top Interview 150,
          the SQL 50 and the famous extras. Deep-dives walk the full path — problem → breakdown → logic
          building → engine-verified Python solution — with the companies that ask each one.
        </p>
      </header>

      {selected ? (
        <LcDetail p={selected} onBack={() => setSel(null)} />
      ) : (
        <>
          {/* progress strip + tabs */}
          <Panel pad={3.5}>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="flex items-center gap-1.5">
                <Btn variant="pill" active={tab === "problems"} onClick={() => setTab("problems")}>
                  <ListChecks className="h-3 w-3" /> Problems
                </Btn>
                <Btn variant="pill" active={tab === "companies"} onClick={() => setTab("companies")}>
                  <Building2 className="h-3 w-3" /> Companies
                </Btn>
              </div>
              <span className="tnum font-mono text-[11px] text-zinc-500">
                {solvedTotal} solved · {deepTotal} deep-dives · {LC_ALL.length} total
              </span>
            </div>
            <ProgressBar value={solvedTotal / LC_ALL.length} className="mt-3" />
          </Panel>

          {tab === "companies" ? (
            <CompaniesIndex
              solvedOf={solvedSlugs}
              onPick={(c) => {
                setCompany(c);
                setTab("problems");
              }}
            />
          ) : (
            <>
              {/* filters */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search 300 problems…"
                      aria-label="Search problems"
                      className="w-full rounded-md border border-zinc-800 bg-zinc-950 py-2 pl-8 pr-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-400/60"
                    />
                  </div>
                  <select
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    aria-label="Filter by company"
                    className="shrink-0 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-400/60"
                  >
                    <option value="All">All companies</option>
                    {LC_COMPANIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(["All", "Easy", "Medium", "Hard"] as Diff[]).map((d) => (
                    <Btn key={d} variant="pill" active={diff === d} onClick={() => setDiff(d)}>
                      {d}
                    </Btn>
                  ))}
                  <span className="mx-1 h-4 w-px bg-zinc-800" aria-hidden />
                  <Btn
                    variant="pill"
                    active={deepOnly}
                    onClick={() => setDeepOnly((v) => !v)}
                    title="Only problems with a full deep-dive report"
                  >
                    Deep-dives only
                  </Btn>
                  {topic !== "All" && (
                    <Btn variant="pill" active onClick={() => setTopic("All")}>
                      {topic} ✕
                    </Btn>
                  )}
                </div>
                <nav aria-label="Topics" className="thin-scrollbar flex gap-1.5 overflow-x-auto pb-1">
                  {["All", ...LC_TOPICS].map((t) => (
                    <Btn key={t} variant="pill" active={topic === t} onClick={() => setTopic(t)}>
                      {t}
                    </Btn>
                  ))}
                </nav>
              </div>

              {/* SQL 50 section jump-strip — visible while the SQL filter is on */}
              {topic === "SQL" && (
                <nav
                  aria-label="SQL 50 sections"
                  className="thin-scrollbar flex gap-1.5 overflow-x-auto pb-1"
                >
                  {SQL50_SECTIONS.map((s) => (
                    <Btn
                      key={s.id}
                      variant="pill"
                      onClick={() =>
                        document
                          .getElementById(`sql-sec-${s.id}`)
                          ?.scrollIntoView({ behavior: "smooth", block: "start" })
                      }
                    >
                      {s.title} · {s.slugs.length}
                    </Btn>
                  ))}
                </nav>
              )}

              {/* grouped list */}
              {groups.length === 0 ? (
                <Panel pad={4}>
                  <p className="text-sm text-zinc-500">Nothing matches those filters.</p>
                </Panel>
              ) : (
                groups.map(([t, rows]) => {
                  const done = rows.filter((p) => solvedSlugs.has(p.slug)).length;
                  const sec = SECTION_BY_TITLE.get(t);
                  return (
                    <section key={t} className="scroll-mt-16 space-y-2" id={sec ? `sql-sec-${sec.id}` : undefined}>
                      <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{t}</h2>
                        <span className="tnum font-mono text-[10px] text-zinc-600">
                          {done}/{rows.length} solved
                        </span>
                      </div>
                      {sec && (
                        <p className="px-1 text-[11px] leading-relaxed text-zinc-500">{sec.blurb}</p>
                      )}
                      <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                        {rows.map((p, i) => (
                          <ProblemRow
                            key={p.slug}
                            p={p}
                            solved={solvedSlugs.has(p.slug)}
                            hasDeep={LC_DEEP_SLUGS.has(p.slug)}
                            onOpen={() => setSel(p.slug)}
                            first={i === 0}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
