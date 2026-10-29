"use client";

// LeetCode — The Big Board. Registry-driven tracker: topic/difficulty/company
// filters, guided paths, timed contests, full deep-dive reports (statement →
// breakdown → logic ladder → sandbox-graded SQL / code-lab-verified JS),
// company index, and solve-tracking on the honest ledger: sandbox passes pay
// full XP, self-claims pay half, and every miss resurfaces on the recall
// ladder (lcm:<slug>).

import { useMemo, useState } from "react";
import {
  BookOpen,
  BookOpenText,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Compass,
  Database,
  FlaskConical,
  Layers,
  Lightbulb,
  ListChecks,
  NotebookPen,
  Play,
  Route,
  Search,
  Sparkles,
  Stamp,
  Swords,
  Target,
  Timer,
  TriangleAlert,
  TrendingUp,
} from "lucide-react";
import {
  LC_ALL,
  LC_DEEP_SLUGS,
  LC_TOPICS,
  lcByCompany,
} from "@/lib/leetcode/registry";
import { SQL_ALL_SECTIONS, SQL50_SECTIONS, sqlSectionOf } from "@/lib/leetcode/sections";
import {
  TRACK_COMPANIES,
  companyFlavor,
  companySqlTrack,
  trackMix,
} from "@/lib/leetcode/company-tracks";
import { lcDailyProblem, lcDailySlug, lcDailyStreak } from "@/lib/leetcode/daily";
import { coachSqlMiss, type CoachTip } from "@/lib/leetcode/error-coach";
import { dayKey } from "@/lib/curriculum/gamification";
import {
  FU_SPECS,
} from "@/lib/leetcode/followup-specs";
import {
  SQL_MODS,
  checkMods,
  cleanKey,
  fuXpKey,
  golfCap,
  modXpKey,
  nudgeFunctions,
  stripComments,
  type SqlMod,
} from "@/lib/leetcode/followups";
import {
  DIFF_SPLIT,
  HONOR_XP,
  LC_FILTER_COMPANIES,
  LC_PYTHON_TOTAL,
  LC_SECTION_COUNT,
  LC_SQL_TOTAL,
  LC_TOTAL,
  isLcSolved,
  lcClaimKey,
  lcKeySlug,
} from "@/lib/leetcode/lc-meta";
import { lcDeepDive, lcSqlDive } from "@/lib/leetcode/content/content";
import { lcSqlExpected } from "@/lib/leetcode/content/sql-expected";
import { gradeSqlResult, type SqlCheckOutcome } from "@/lib/leetcode/sql-check";
import { addNote } from "@/lib/curriculum/notebook";
import type { ExecResult } from "@/lib/sql-types";
import type { LcDifficulty, LcRef, LcSqlDive, LcSqlSchema } from "@/lib/leetcode/types";
import { LC_XP, lcSolveKey } from "@/lib/leetcode/types";
import { SqlEditor } from "@/components/sql-editor";
import { ResultGrid } from "./result-grid";
import { useProgress } from "@/lib/curriculum/progress";
import { celebrate } from "./celebrate";
import { Btn, Chip, FOCUS_RING, Panel, ProgressBar, SectionLabel } from "./ui/kit";
import { LcCodeLab } from "./lc-code-lab";
import { LcPaths } from "./lc-paths";
import { LcContest } from "./lc-contest";
import { FuGauntlet } from "./lc-followups";
import { LcPredict } from "./lc-predict";
import { DomainsView } from "./lc-domains";
import {
  ConstraintList,
  DiveCodeBlock,
  DiffDot,
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
import { PrimerCard, SectionStudyPanel } from "./lc-primer";
import { cn } from "@/lib/utils";

type Tab = "problems" | "paths" | "contest" | "predict" | "companies" | "domains";
type Diff = "All" | LcDifficulty;

/** Section lookup by display title — for group headers + anchors. */
const SECTION_BY_TITLE = new Map(SQL_ALL_SECTIONS.map((s) => [s.title, s]));

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

/* ------------------------------------------------------------------ */
/* Hub row                                                             */
/* ------------------------------------------------------------------ */

function ProblemRow({
  p,
  solved,
  hasDeep,
  retry,
  onOpen,
  first,
}: {
  p: LcRef;
  solved: boolean;
  hasDeep: boolean;
  /** on the recall ladder with a live miss — deserves another pass */
  retry: boolean;
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
      {retry && !solved && (
        <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-300">
          retry
        </span>
      )}
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

function SqlPractice({ p, dive, onNext }: { p: LcRef; dive: LcSqlDive; onNext?: (slug: string) => void }) {
  const awardXp = useProgress((s) => s.awardXp);
  const scheduleReview = useProgress((s) => s.scheduleReview);
  const markLcDailyDone = useProgress((s) => s.markLcDailyDone);
  const xpEvents = useProgress((s) => s.xpEvents);
  const solvedAt = useProgress((s) => s.xpEvents[lcSolveKey(dive.slug)]);
  const cleanAt = useProgress((s) => s.xpEvents[cleanKey(dive.slug)]);
  const [sql, setSql] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [fails, setFails] = useState(0);
  const [nudges, setNudges] = useState(0);
  const [mods, setMods] = useState<SqlMod[]>([]);
  const [modBanner, setModBanner] = useState<string | null>(null);
  const [result, setResult] = useState<ExecResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<SqlCheckOutcome | null>(null);
  const [coach, setCoach] = useState<CoachTip | null>(null);
  const [saved, setSaved] = useState(false);
  const [compare, setCompare] = useState(false);

  const run = async (check: boolean) => {
    if (busy || !sql.trim()) return;
    // challenge modifiers gate the graded run — violated mods never reach the engine
    if (check && mods.length) {
      const violations = checkMods(sql, mods, golfCap(dive));
      if (violations.length) {
        setModBanner(violations.map((v) => v.why).join(" "));
        return;
      }
    }
    setModBanner(null);
    setBusy(true);
    setError(null);
    setOutcome(null);
    setCoach(null);
    setAttempts((n) => n + 1);
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
            if (oc.status === "pass") {
              // every graded problem lives on the recall ladder: a pass
              // advances 1d → 3d → 7d → 14d, a miss comes back tomorrow
              const firstSolve = awardXp(lcSolveKey(dive.slug), dive.xp);
              if (firstSolve) {
                scheduleReview(`lcm:${dive.slug}`, true);
                // a pass with zero nudges opened pays the clean-solve bonus
                const clean = nudges === 0 && awardXp(cleanKey(dive.slug), 2);
                celebrate({
                  kind: "xp",
                  title: `+${dive.xp} XP — ${p.title}`,
                  sub: clean ? "Solved in the sandbox · clean solve, +2 bonus" : "Solved in the sandbox",
                });
              }
              // LC Daily Challenge — a verified pass of today's seeded problem
              // banks the day (first solve or not) and pays the +5 daily bonus
              if (dive.slug === lcDailySlug() && markLcDailyDone() && awardXp(`lc-daily:${dayKey()}`, 5)) {
                celebrate({
                  kind: "xp",
                  title: "+5 XP — daily challenge banked",
                  sub: "Come back tomorrow to keep the streak alive",
                });
              }
              // active challenge modifiers pay once each, on any passing run
              let modBonus = 0;
              for (const m of mods) if (awardXp(modXpKey(dive.slug, m), 3)) modBonus += 3;
              if (modBonus > 0)
                celebrate({
                  kind: "xp",
                  title: `+${modBonus} XP — challenge mods cleared`,
                  sub: SQL_MODS.filter((m) => mods.includes(m.id)).map((m) => m.label).join(" · "),
                });
            } else {
              scheduleReview(`lcm:${dive.slug}`, false);
              setCompare(false);
              setFails((n) => n + 1);
              setCoach(coachSqlMiss(sql, data, expected));
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
  const passed = outcome?.status === "pass";
  const sec = sqlSectionOf(dive.slug);
  const nextInSec = sec
    ? sec.slugs.find((s) => s !== dive.slug && !isLcSolved(xpEvents, s))
    : undefined;

  const saveToNotebook = () => {
    addNote({
      title: `${p.num}. ${p.title}`,
      sql,
      note: `Solved via the SeeQL sandbox — ${dive.approach}. ${attempts} attempt${attempts === 1 ? "" : "s"}, ${result?.rowCount ?? expected?.rows.length ?? 0} row${(result?.rowCount ?? 1) === 1 ? "" : "s"}.`,
    });
    setSaved(true);
  };

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
              <Check className="h-3 w-3" /> Solved · {solvedAt} XP {cleanAt !== undefined && <span className="text-amber-300">· clean</span>}
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
          : "Ctrl/⌘ + Enter runs."}{" "}
        A miss enrolls the problem on the recall ladder; a pass graduates it.
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
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">challenge mods</span>
        {SQL_MODS.map((m) => (
          <Btn
            key={m.id}
            variant="pill"
            active={mods.includes(m.id)}
            title={`${m.blurb} — pass with it active for a one-time +3 XP`}
            onClick={() => setMods((cur) => (cur.includes(m.id) ? cur.filter((x) => x !== m.id) : [...cur, m.id]))}
          >
            {m.label}
          </Btn>
        ))}
        {mods.includes("golf") && (
          <span className={cn("tnum font-mono text-[10px]", stripComments(sql).length > golfCap(dive) ? "text-rose-400" : "text-zinc-500")}>
            {stripComments(sql).length}/{golfCap(dive)} chars
          </span>
        )}
      </div>
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
        {attempts > 0 && (
          <span className="tnum self-center font-mono text-[10px] text-zinc-600">
            {attempts} run{attempts === 1 ? "" : "s"} this visit
          </span>
        )}
      </div>

      {modBanner && (
        <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/[0.06] p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-amber-300">Challenge mod violated — the run didn't count</p>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-300">{modBanner}</p>
        </div>
      )}

      {/* struggle-first nudges: two failed checks unlock the ladder — solve
          without opening any of them and the pass pays a clean-solve bonus */}
      {(fails >= 2 || nudges > 0) && nudges < 3 && (
        <div className="mt-3">
          <Btn variant="outline" onClick={() => setNudges((n) => n + 1)}>
            <Lightbulb className="h-3 w-3" />
            {nudges === 0 ? "Stuck? Nudge me" : nudges === 1 ? "One more nudge" : "Show me the tools"}
          </Btn>
        </div>
      )}
      {nudges >= 1 && (
        <div className="mt-2 space-y-1.5">
          <p className="rounded-md border border-amber-400/20 bg-amber-400/[0.05] p-2 text-[11.5px] leading-relaxed text-amber-200/90">
            <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider">nudge 1</span>
            {sec
              ? `Pattern family — ${sec.title}. ${sec.blurb}`
              : "Re-read the constraints — the shape is simpler than it looks."}
          </p>
          {nudges >= 2 && dive.ladder[1] && (
            <p className="rounded-md border border-amber-400/20 bg-amber-400/[0.05] p-2 text-[11.5px] leading-relaxed text-amber-200/90">
              <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider">nudge 2</span>
              {dive.ladder[1].title}: {dive.ladder[1].body}
            </p>
          )}
          {nudges >= 3 && (
            <div className="rounded-md border border-amber-400/20 bg-amber-400/[0.05] p-2 text-[11.5px] leading-relaxed text-amber-200/90">
              <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-wider">nudge 3 · tools in the model</span>
              <span className="mt-1 flex flex-wrap gap-1">
                {nudgeFunctions(dive).map((f) => (
                  <span key={f} className="rounded border border-amber-400/25 bg-amber-400/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-amber-200">
                    {f}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
      )}

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
            passed
              ? "border-emerald-400/30 bg-emerald-400/[0.06]"
              : "border-amber-400/30 bg-amber-400/[0.06]",
          )}
        >
          <p
            className={cn(
              "font-mono text-[10px] uppercase tracking-wider",
              passed ? "text-emerald-300" : "text-amber-300",
            )}
          >
            {outcome.title}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{outcome.detail}</p>
        </div>
      )}

      {coach && !passed && (
        <div className="mt-2 rounded-lg border border-sky-400/25 bg-sky-400/[0.05] p-3">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-sky-300">
            <Lightbulb className="h-3 w-3" /> error coach · {coach.tag}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{coach.line}</p>
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

      {/* after the pass — compare approaches, keep the query, keep moving */}
      {passed && (
        <div className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.03] p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-300">
              After the pass — make it stick
            </p>
            <span className="tnum font-mono text-[10px] text-zinc-600">
              {result?.durationMs ?? 0} ms · {attempts} run{attempts === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Btn variant="outline" onClick={() => setCompare((v) => !v)}>
              {compare ? "Hide" : "Compare"} with the model solution
            </Btn>
            <Btn variant="outline" onClick={saveToNotebook} disabled={saved}>
              <NotebookPen className="h-3 w-3" /> {saved ? "Saved to notebook" : "Save to notebook"}
            </Btn>
            {nextInSec && onNext && (
              <Btn variant="soft" onClick={() => onNext(nextInSec)}>
                Next in section <ChevronRight className="h-3 w-3" />
              </Btn>
            )}
          </div>
          {compare && (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div>
                <p className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">yours</p>
                <pre className="thin-scrollbar max-h-64 overflow-auto rounded-md border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-[11px] leading-5 text-zinc-300">{sql}</pre>
              </div>
              <div>
                <p className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">model — {dive.approach}</p>
                <pre className="thin-scrollbar max-h-64 overflow-auto rounded-md border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-[11px] leading-5 text-zinc-300">{dive.code}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Deep-dive detail                                                    */
/* ------------------------------------------------------------------ */

function LcDetail({ p, onBack, onOpen }: { p: LcRef; onBack: () => void; onOpen: (slug: string) => void }) {
  const awardXp = useProgress((s) => s.awardXp);
  const xpEvents = useProgress((s) => s.xpEvents);
  const scheduleReview = useProgress((s) => s.scheduleReview);
  const solvedAt = useProgress((s) => s.xpEvents[lcSolveKey(p.slug)]);
  const claimedAt = useProgress((s) => s.xpEvents[lcClaimKey(p.slug)]);
  const sdive = p.sql ? lcSqlDive(p.slug) : undefined;
  const deep = lcDeepDive(p.slug);
  const dive = sdive ?? deep;
  const xp = LC_XP[p.difficulty];
  const honorXp = HONOR_XP[p.difficulty];
  const [confirmClaim, setConfirmClaim] = useState(false);

  const claimSolved = () => {
    if (solvedAt !== undefined || claimedAt !== undefined) return;
    setConfirmClaim(false);
    if (awardXp(lcClaimKey(p.slug), honorXp)) {
      celebrate({ kind: "xp", title: `+${honorXp} XP — ${p.title}`, sub: "Self-claimed · verify it in the lab for the other half" });
    }
  };

  const sec = p.sql ? sqlSectionOf(p.slug) : undefined;
  const fuCount = sdive ? (FU_SPECS[p.slug]?.length ?? 0) : 0;
  const steps: Array<{ id: string; label: string; tone: Tone }> = [
    { id: "dive-problem", label: "Problem", tone: "sky" },
    ...(sdive?.primer ? ([{ id: "dive-primer", label: "Primer", tone: "amber" }] as const) : []),
    { id: "dive-breakdown", label: "Breakdown", tone: "violet" },
    { id: "dive-ladder", label: "Ladder", tone: "fuchsia" },
    ...(sdive
      ? ([
          { id: "dive-schema", label: "Schema", tone: "cyan" },
          { id: "dive-sandbox", label: "Sandbox", tone: "emerald" },
        ] as const)
      : []),
    ...(sdive ? [] : deep ? ([{ id: "dive-codelab", label: "Code lab", tone: "cyan" }] as const) : []),
    ...(fuCount > 0 ? ([{ id: "dive-gauntlet", label: `Follow-ups (${fuCount})`, tone: "rose" }] as const) : []),
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
                {p.sql ? `+${xp} XP verified` : `+${xp} verified · +${honorXp} claimed`}
              </span>
              {claimedAt !== undefined && (
                <span className="rounded-md border border-zinc-600 bg-zinc-900/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  self-claimed
                </span>
              )}
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
          ) : p.sql ? (
            /* a sandbox-graded problem can be verified right here — the
               primary button jumps to the editor instead of paying honor XP */
            <Btn variant="primary" onClick={() => jump("dive-sandbox")} className="shrink-0">
              <FlaskConical className="h-3.5 w-3.5" /> Solve it in the sandbox
            </Btn>
          ) : (
            <div className="relative shrink-0">
              <Btn variant="primary" onClick={() => setConfirmClaim(true)}>
                <Stamp className="h-3.5 w-3.5" /> Claim solved · +{honorXp} XP
              </Btn>
              {confirmClaim && (
                <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-xl shadow-black/40">
                  <p className="text-xs font-medium text-zinc-100">Solved it yourself, off-app?</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                    A claim pays {honorXp} XP (half) and the row shows a self-claimed tag. Solving it in the
                    app later still pays the full {xp} — the honest solve is worth more.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <Btn variant="soft" onClick={claimSolved}>
                      <Stamp className="h-3 w-3" /> I solved it
                    </Btn>
                    <Btn variant="outline" onClick={() => setConfirmClaim(false)}>
                      Cancel
                    </Btn>
                  </div>
                </div>
              )}
            </div>
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
            solved-tracking are live now. It appears on {p.lists.join(", ")}. A claim above pays {honorXp} XP
            (half) — if it's a SQL problem elsewhere, the real solve still outranks it.
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

          {/* The concept primer — Data & Finance problems teach the domain first */}
          {sdive?.primer && <PrimerCard dive={sdive} />}

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

          {/* SQL: schema + live sandbox practice (before the solution reveal) */}
          {sdive && <SqlSchemaPanel schema={sdive.schema} />}
          {sdive && <SqlPractice p={p} dive={sdive} onNext={onOpen} />}

          {/* The Follow-up Gauntlet — verified interviewer push-backs, locked
              until the base problem passes; same sandbox, same grading */}
          {sdive && <FuGauntlet p={p} dive={sdive} onNext={onOpen} />}

          {/* Python deep-dive: the code lab — solve it in JS against the real
              verify cases, pay the full XP, no honor claim needed */}
          {!sdive && deep && <LcCodeLab p={p} deep={deep} />}

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
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"sql" | "az">("sql");
  const tracks = TRACK_COMPANIES.map((name) => {
    const problems = companySqlTrack(name);
    return { name, total: problems.length, done: problems.filter((p) => solvedOf.has(p.slug)).length, mix: trackMix(problems) };
  });
  const rows = useMemo(() => {
    const enriched = LC_FILTER_COMPANIES.map((c) => {
      const sql = companySqlTrack(c.name);
      return {
        name: c.name,
        inSet: c.count,
        sqlCount: sql.length,
        done: sql.filter((p) => solvedOf.has(p.slug)).length,
        preview: sql.slice(0, 3).map((p) => p.title),
      };
    }).filter((r) => r.name.toLowerCase().includes(q.trim().toLowerCase()));
    enriched.sort((a, b) =>
      sort === "az"
        ? a.name.localeCompare(b.name)
        : b.sqlCount - a.sqlCount || a.name.localeCompare(b.name),
    );
    return enriched;
  }, [q, sort, solvedOf]);
  const withSql = rows.filter((r) => r.sqlCount > 0).length;
  const deep = LC_FILTER_COMPANIES.filter((c) => companySqlTrack(c.name).length >= 5).length;
  return (
    <div className="space-y-5">
      <Panel pad={4}>
        <div className="flex items-center gap-2">
          <Route className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold">Company tracks</h2>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          Employers with deep SQL pools get a guided track — every SQL problem they are publicly known to ask,
          ordered easy → hard, progress kept on the honest ledger. Every company in the index below opens a
          track too; {deep} of them carry five or more SQL problems.
        </p>
      </Panel>
      <div className="grid gap-3 sm:grid-cols-2">
        {tracks.map((t) => {
          const pct = t.total ? Math.round((t.done / t.total) * 100) : 0;
          return (
            <button
              key={t.name}
              type="button"
              onClick={() => onPick(t.name)}
              className={cn(
                "rounded-xl border border-black/10 bg-zinc-900/40 p-4 text-left transition-colors hover:border-emerald-400/40 dark:border-white/10",
                FOCUS_RING,
              )}
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="truncate text-sm font-semibold text-zinc-100">{t.name}</span>
                <span className="tnum ml-auto shrink-0 font-mono text-[11px] text-zinc-500">
                  {t.done}/{t.total} SQL
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">{companyFlavor(t.name)}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800" aria-hidden>
                <div className="h-full rounded-full bg-emerald-400/80 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-zinc-600">
                <span>{t.mix.easy} easy</span>
                <span>{t.mix.medium} med</span>
                <span>{t.mix.hard} hard</span>
                {pct === 100 && t.total > 0 && (
                  <span className="ml-auto rounded-full bg-emerald-400/10 px-2 py-0.5 font-medium text-emerald-300">cleared</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <Panel pad={4}>
        <div className="flex flex-wrap items-center gap-2">
          <Building2 className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold">Company index</h2>
          <span className="tnum ml-auto font-mono text-[11px] text-zinc-500">
            {withSql} of {rows.length} with SQL tracks
          </span>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          Which companies ask which problems — ranked by how often they appear across the registry.
          Community-sourced from public interview reports, not LeetCode premium data; treat it as a
          prioritisation heuristic, not a guarantee. Every row opens that employer&apos;s ordered SQL track.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search companies…"
              className={cn(
                "w-full rounded-md border border-black/10 bg-zinc-900/60 py-1.5 pl-8 pr-3 text-[12px] text-zinc-200 placeholder:text-zinc-600 dark:border-white/10",
                FOCUS_RING,
              )}
            />
          </label>
          <div className="flex shrink-0 overflow-hidden rounded-md border border-black/10 dark:border-white/10">
            {([["sql", "by SQL pool"], ["az", "A–Z"]] as const).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSort(mode)}
                className={cn(
                  "px-2.5 py-1.5 font-mono text-[10px] transition-colors",
                  sort === mode
                    ? "bg-emerald-400/10 font-medium text-emerald-300"
                    : "text-zinc-500 hover:text-zinc-300",
                  FOCUS_RING,
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Panel>
      <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
        {rows.map((c, i) => {
          const featured = TRACK_COMPANIES.includes(c.name);
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
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-zinc-100">{c.name}</span>
                  {featured && (
                    <span className="shrink-0 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-emerald-300">
                      featured
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
                  {c.sqlCount > 0
                    ? c.preview.length > 0
                      ? c.preview.join(" · ")
                      : `${c.sqlCount} SQL problems`
                    : `asks ${lcByCompany(c.name).slice(0, 4).map((p) => p.title).join(" · ")}`}
                </span>
              </span>
              {c.done > 0 && (
                <span className="shrink-0 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  {c.done} solved
                </span>
              )}
              <span className="tnum shrink-0 font-mono text-[11px] text-zinc-500">
                {c.sqlCount} SQL · {c.inSet} in set
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600" />
            </button>
          );
        })}
        {rows.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-zinc-500">No company matches “{q}”.</div>
        )}
      </div>
    </div>
  );
}

/* Company track — one employer's SQL pool as an ordered path              */
/* ------------------------------------------------------------------ */

/** The track's three stages. Grouping by difficulty band gives every track
 *  a readable arc — warm-up, the screens that decide it, then the wall —
 *  each with its own progress meter. */
const TRACK_BANDS: Array<{ key: "Easy" | "Medium" | "Hard"; label: string; blurb: string }> = [
  { key: "Easy", label: "warm-up", blurb: "single-table reads — learn the company's flavor" },
  { key: "Medium", label: "core screens", blurb: "joins, windows, funnels — the rounds that decide it" },
  { key: "Hard", label: "the wall", blurb: "multi-step reasoning — asked when they mean it" },
];

function CompanyTrack({
  name,
  solvedOf,
  onBack,
  onBrowse,
  onOpen,
}: {
  name: string;
  solvedOf: Set<string>;
  onBack: () => void;
  onBrowse: (company: string) => void;
  onOpen: (slug: string) => void;
}) {
  const problems = companySqlTrack(name);
  const done = problems.filter((p) => solvedOf.has(p.slug)).length;
  const pct = problems.length ? Math.round((done / problems.length) * 100) : 0;
  const mix = trackMix(problems);
  const inSet = lcByCompany(name).length;
  return (
    <div className="space-y-4">
      <Panel pad={4}>
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition-colors hover:text-emerald-300",
            FOCUS_RING,
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> All companies
        </button>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Building2 className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-zinc-100">{name} — SQL track</h2>
          {pct === 100 && problems.length > 0 && (
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">cleared</span>
          )}
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">{companyFlavor(name)}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800" aria-hidden>
            <div className="h-full rounded-full bg-emerald-400/80 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="tnum shrink-0 font-mono text-[11px] text-zinc-500">
            {done}/{problems.length} solved · {pct}%
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] text-zinc-600">
          <span>{mix.easy} easy</span>
          <span>{mix.medium} medium</span>
          <span>{mix.hard} hard</span>
          <span>· {inSet} tagged in set (incl. code labs)</span>
        </div>
      </Panel>
      {problems.length === 0 ? (
        <Panel pad={4}>
          <p className="text-[13px] text-zinc-500">
            No SQL problems tagged for {name} yet — the pool is community-sourced and this employer has not
            surfaced enough public SQL reports. Try the Problems tab filter for their code-lab set.
          </p>
        </Panel>
      ) : (
        <div className="space-y-4">
          {TRACK_BANDS.map((band) => {
            const rows = problems.filter((p) => p.difficulty === band.key);
            if (rows.length === 0) return null;
            const bdone = rows.filter((p) => solvedOf.has(p.slug)).length;
            const bpct = Math.round((bdone / rows.length) * 100);
            return (
              <section key={band.key}>
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
                  <h3 className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-zinc-400">{band.label}</h3>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-zinc-600">{band.blurb}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-zinc-800" aria-hidden>
                      <div className="h-full rounded-full bg-emerald-400/80 transition-all duration-500" style={{ width: `${bpct}%` }} />
                    </div>
                    <span className="tnum font-mono text-[10px] text-zinc-500">
                      {bdone}/{rows.length}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                  {rows.map((p, i) => {
                    const solved = solvedOf.has(p.slug);
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => onOpen(p.slug)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-emerald-400/[0.04]",
                          FOCUS_RING,
                          i > 0 && "border-t border-black/5 dark:border-white/5",
                        )}
                      >
                        <span className="tnum w-8 shrink-0 font-mono text-[11px] text-zinc-600">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <DiffDot d={p.difficulty} />
                        <span className="min-w-0 flex-1">
                          <span className={cn("block truncate text-sm font-medium", solved ? "text-zinc-500" : "text-zinc-100")}>
                            {p.title}
                          </span>
                          <span className="mt-0.5 block truncate text-[10px] text-zinc-500">{p.topics.slice(0, 2).join(" · ")}</span>
                        </span>
                        {solved && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
                        <span className="tnum hidden shrink-0 font-mono text-[10px] text-zinc-600 sm:block">#{p.num}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
      <div className="flex justify-center pb-2">
        <button
          type="button"
          onClick={() => onBrowse(name)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-black/10 px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:border-emerald-400/40 hover:text-emerald-300 dark:border-white/10",
            FOCUS_RING,
          )}
        >
          Browse all {inSet} in set (incl. code labs) <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* LC Daily Challenge strip                                            */
/* ------------------------------------------------------------------ */

function LcDailyStrip({ solvedOf, onOpen }: { solvedOf: Set<string>; onOpen: (slug: string) => void }) {
  const lcDailyDone = useProgress((s) => s.lcDailyDone);
  const daily = lcDailyProblem();
  const banked = lcDailyDone[dayKey()] !== undefined;
  const solved = solvedOf.has(daily.slug);
  const streak = lcDailyStreak(lcDailyDone);
  return (
    <Panel pad={3.5}>
      <button
        type="button"
        onClick={() => onOpen(daily.slug)}
        className={cn("flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 text-left", FOCUS_RING)}
      >
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
          <Sparkles className="h-3 w-3 text-emerald-400" /> daily challenge
        </span>
        <DiffDot d={daily.difficulty} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-100">{daily.title}</span>
        {streak > 0 && <span className="tnum shrink-0 font-mono text-[11px] text-amber-300">{streak}-day streak</span>}
        {banked || solved ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            <Check className="h-3 w-3" /> {banked ? "banked · +5 XP" : "already solved"}
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-emerald-400/30 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            verify today · +{LC_XP[daily.difficulty]} XP +5 daily
          </span>
        )}
      </button>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Main view                                                           */
/* ------------------------------------------------------------------ */

export function LeetCodeView({
  initialTopic,
  initialSlug,
  initialTab,
}: {
  initialTopic?: string;
  initialSlug?: string;
  /** Deep-link landing tab (e.g. "domains" from the readiness dm row). */
  initialTab?: Tab;
}) {
  const xpEvents = useProgress((s) => s.xpEvents);
  const reviewSchedule = useProgress((s) => s.reviewSchedule);
  const lcContests = useProgress((s) => s.lcContests);
  const [sel, setSel] = useState<string | null>(initialSlug ?? null);
  const [tab, setTab] = useState<Tab>(initialTab ?? "problems");
  const [topic, setTopic] = useState<string>(initialTopic ?? "All");
  const [diff, setDiff] = useState<Diff>("All");
  const [company, setCompany] = useState<string>("All");
  const [trackCo, setTrackCo] = useState<string | null>(null);
  const [deepOnly, setDeepOnly] = useState(false);
  const [missesOnly, setMissesOnly] = useState(false);
  const [q, setQ] = useState("");

  // solved = verified (lc:) OR self-claimed (lc-claimed:) — both keys feed
  // the same board, but the detail view keeps the distinction honest
  const solvedSlugs = useMemo(
    () => new Set(Object.keys(xpEvents).map(lcKeySlug).filter((s): s is string => s !== undefined)),
    [xpEvents],
  );

  // problems with a live recall-ladder card that hasn't been solved since —
  // a miss anywhere (sandbox check, contest submit) enrolls the slug here
  const retrySlugs = useMemo(() => {
    const s = new Set<string>();
    for (const key of Object.keys(reviewSchedule)) {
      if (key.startsWith("lcm:") && !isLcSolved(xpEvents, key.slice(4))) s.add(key.slice(4));
    }
    return s;
  }, [reviewSchedule, xpEvents]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return LC_ALL.filter((p) => {
      if (topic === "SQL" ? !p.sql : topic !== "All" && !p.topics.includes(topic)) return false;
      if (diff !== "All" && p.difficulty !== diff) return false;
      if (company !== "All" && !p.companies.includes(company)) return false;
      if (deepOnly && !LC_DEEP_SLUGS.has(p.slug)) return false;
      if (missesOnly && !retrySlugs.has(p.slug)) return false;
      if (needle && !`${p.num} ${p.title} ${p.slug}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [topic, diff, company, deepOnly, missesOnly, q, retrySlugs]);

  const deepTotal = LC_DEEP_SLUGS.size;
  const solvedTotal = solvedSlugs.size;

  // Interview readiness — one honest number across everything this band can
  // verify: SQL 50 completion, section breadth, volume, gauntlet clears,
  // contest runs banked, reading drills and the clean-solve ratio.
  const readiness = useMemo(() => {
    const sqlSolved = new Set<string>();
    let clean = 0;
    let fu = 0;
    let reads = 0;
    for (const [k, v] of Object.entries(xpEvents)) {
      if (k.startsWith("lc:") && v > 0) sqlSolved.add(k.slice(3));
      else if (k.startsWith("lc-clean:")) clean++;
      else if (k.startsWith("lc-fu:")) fu++;
      else if (k.startsWith("lc-read:")) reads++;
    }
    const sql50All = SQL50_SECTIONS.flatMap((s) => s.slugs);
    const sql50Done = sql50All.filter((s) => sqlSolved.has(s)).length;
    const breadth = SQL_ALL_SECTIONS.filter((sec) => sec.slugs.some((s) => sqlSolved.has(s))).length;
    const parts = [
      { label: "SQL band", got: sql50Done, max: sql50All.length, w: 30 },
      { label: "breadth", got: breadth, max: LC_SECTION_COUNT, w: 25 },
      { label: "volume", got: sqlSolved.size, max: 150, w: 15 },
      { label: "gauntlet", got: fu, max: 40, w: 10 },
      { label: "contests", got: lcContests.length, max: 5, w: 10 },
      { label: "reading", got: reads, max: 30, w: 5 },
      { label: "clean", got: clean, max: Math.max(sqlSolved.size, 1), w: 5 },
    ];
    const score = Math.round(parts.reduce((a, pt) => a + pt.w * Math.min(pt.got / (pt.max || 1), 1), 0));
    return { score, parts };
  }, [xpEvents, lcContests]);

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
      const s = SQL_ALL_SECTIONS.findIndex((sec) => sec.title === k);
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
          <h1 className="text-2xl font-bold tracking-tight">LeetCode — The Big Board</h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Every classic interview problem, deduped from NeetCode 150 (superset of Blind 75), Top Interview 150,
          the SQL 50 and the famous extras — plus an original Data &amp; Finance track for product-analytics
          and finance-role prep. Deep-dives walk the full path — problem → breakdown → logic building →
          sandbox-graded SQL or a code lab against real test cases — with the companies that ask each one.
          Solves are graded where the app can grade them; everything else is claimed at half XP.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <Chip k="SQL sandbox" v={`${LC_SQL_TOTAL} graded`} />
          <Chip k="Python dives" v={LC_PYTHON_TOTAL} />
          <Chip k="skill sections" v={LC_SECTION_COUNT} />
          <Chip k="Easy / Med / Hard" v={`${DIFF_SPLIT.Easy} / ${DIFF_SPLIT.Medium} / ${DIFF_SPLIT.Hard}`} />
        </div>
      </header>

      {selected ? (
        <LcDetail p={selected} onBack={() => setSel(null)} onOpen={(slug) => setSel(slug)} />
      ) : (
        <>
          {/* progress strip + tabs */}
          <Panel pad={3.5}>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Btn variant="pill" active={tab === "problems"} onClick={() => setTab("problems")}>
                  <ListChecks className="h-3 w-3" /> Problems
                </Btn>
                <Btn variant="pill" active={tab === "paths"} onClick={() => setTab("paths")}>
                  <Route className="h-3 w-3" /> Paths
                </Btn>
                <Btn variant="pill" active={tab === "contest"} onClick={() => setTab("contest")}>
                  <Timer className="h-3 w-3" /> Timed SQL
                </Btn>
                <Btn variant="pill" active={tab === "predict"} onClick={() => setTab("predict")}>
                  <BookOpenText className="h-3 w-3" /> Predict
                </Btn>
                <Btn variant="pill" active={tab === "companies"} onClick={() => setTab("companies")}>
                  <Building2 className="h-3 w-3" /> Companies
                </Btn>
                <Btn variant="pill" active={tab === "domains"} onClick={() => setTab("domains")}>
                  <Layers className="h-3 w-3" /> Domains
                </Btn>
              </div>
              <span className="tnum font-mono text-[11px] text-zinc-500">
                {solvedTotal} solved · {deepTotal} deep-dives · {LC_TOTAL} total
              </span>
            </div>
            <ProgressBar value={solvedTotal / LC_TOTAL} className="mt-3" />
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                <Target className="h-3 w-3" /> interview readiness
              </span>
              <span className="tnum font-mono text-[13px] font-bold text-emerald-300">
                {readiness.score}
                <span className="text-zinc-600">/100</span>
              </span>
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-zinc-800" aria-hidden>
                <div className="h-full rounded-full bg-emerald-400/80 transition-all duration-500" style={{ width: `${readiness.score}%` }} />
              </div>
              <span className="tnum font-mono text-[10px] text-zinc-600">
                {readiness.parts.map((pt) => `${pt.label} ${Math.min(pt.got, pt.max)}/${pt.max}`).join(" · ")}
              </span>
            </div>
          </Panel>

          <LcDailyStrip solvedOf={solvedSlugs} onOpen={(slug) => setSel(slug)} />

          {tab === "companies" ? (
            trackCo ? (
              <CompanyTrack
                name={trackCo}
                solvedOf={solvedSlugs}
                onBack={() => setTrackCo(null)}
                onBrowse={(c) => {
                  setCompany(c);
                  setTab("problems");
                }}
                onOpen={(slug) => setSel(slug)}
              />
            ) : (
              <CompaniesIndex solvedOf={solvedSlugs} onPick={(c) => setTrackCo(c)} />
            )
          ) : tab === "paths" ? (
            <LcPaths onOpen={(slug) => setSel(slug)} />
          ) : tab === "contest" ? (
            <LcContest />
          ) : tab === "predict" ? (
            <LcPredict />
          ) : tab === "domains" ? (
            <DomainsView />
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
                      placeholder={`Search ${LC_TOTAL} problems…`}
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
                    {LC_FILTER_COMPANIES.map((c) => (
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
                  <Btn
                    variant="pill"
                    active={missesOnly}
                    onClick={() => setMissesOnly((v) => !v)}
                    title="Only problems you missed and haven't re-solved — they live on the recall ladder"
                  >
                    Misses ({retrySlugs.size})
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
                  {SQL_ALL_SECTIONS.map((s) => (
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
                  <p className="text-sm text-zinc-500">
                    {missesOnly && retrySlugs.size === 0
                      ? "No misses on the ladder — solve something and fail gloriously, the deck will catch it."
                      : "Nothing matches those filters."}
                  </p>
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
                      {sec?.study && (
                        <SectionStudyPanel sec={sec} />
                      )}
                      <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                        {rows.map((p, i) => (
                          <ProblemRow
                            key={p.slug}
                            p={p}
                            solved={solvedSlugs.has(p.slug)}
                            hasDeep={LC_DEEP_SLUGS.has(p.slug)}
                            retry={retrySlugs.has(p.slug)}
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
