"use client";

// Cheat sheet — the personal revision sheet. What YOU missed, what the
// map says is shaky, what's coming due — laid over a compact reference
// layer (clause order, NULL rules, the join table, the write verbs).
// One click opens the browser's print dialog → save as PDF.

import { useMemo } from "react";
import { BookMarked, Printer } from "lucide-react";
import { LESSONS } from "@/lib/curriculum/lessons";
import { useProgress, dueReviews } from "@/lib/curriculum/progress";
import { computeMastery, LEVEL_TONE, skillLabel, weakestSkills } from "@/lib/curriculum/mastery";
import { cn } from "@/lib/utils";
import { RichNodes } from "./rich";

const CLAUSE_ORDER = [
  ["SELECT", "the columns to project (evaluated almost last)"],
  ["FROM", "the row source — tables, joins, subqueries"],
  ["JOIN … ON", "attach related tables; ON pairs the keys"],
  ["WHERE", "filter ROWS — before any grouping exists"],
  ["GROUP BY", "collapse to buckets per key"],
  ["HAVING", "filter the BUCKETS — aggregates live here"],
  ["ORDER BY", "sort the output rows"],
  ["LIMIT / OFFSET", "slice the output"],
];

const NULL_RULES = [
  "= NULL is never true — test with IS NULL / IS NOT NULL",
  "NULL fails every comparison: it drops out of WHERE silently",
  "COUNT(*) counts rows; COUNT(col) skips NULLs in that column",
  "SUM/AVG/MIN/MAX ignore NULLs; AVG of an empty set is NULL",
  "COALESCE(a, b, …) returns the first non-NULL — the display default",
];

const JOIN_TABLE = [
  ["INNER JOIN", "only the matched pairs"],
  ["LEFT JOIN", "all left rows + matches (NULLs on the right when none)"],
  ["LEFT JOIN … IS NULL", "the anti-join — left rows with no match"],
  ["CROSS JOIN", "every pairing — 103 × 16 = 1,648, mind the fanout"],
  ["self-join", "a table against itself via two aliases"],
];

const WRITE_VERBS = [
  ["INSERT INTO t (cols) VALUES (…)", "the column-list contract: NOT NULL columns need values or defaults"],
  ["UPDATE t SET c = expr WHERE …", "the WHERE is the blast radius; expressions read the row's own values"],
  ["DELETE FROM t WHERE …", "row-by-row scope only — aggregates can't sit in WHERE"],
  ["BEGIN … COMMIT / ROLLBACK", "all of it, or none of it — the transaction bubble"],
  ["RETURNING cols", "the write hands its result straight back"],
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid rounded-lg border border-zinc-800 bg-zinc-950 p-4 print:border-zinc-300 print:bg-white">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 print:text-zinc-600">{title}</h3>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

export function CheatSheet() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const mcqAttempts = useProgress((s) => s.mcqAttempts);
  const skillAttempts = useProgress((s) => s.skillAttempts);
  const reviewSchedule = useProgress((s) => s.reviewSchedule);
  const lessonsDone = useProgress((s) => s.lessonsDone);

  const missed = useMemo(
    () =>
      LESSONS.flatMap((l) => l.mcqs.filter((m) => mcqAttempts[m.id] && !mcqAttempts[m.id].correct).map((m) => ({ lesson: l, mcq: m }))).slice(0, 8),
    [mcqAttempts],
  );
  const cells = useMemo(() => computeMastery(skillAttempts, mcqAttempts), [skillAttempts, mcqAttempts]);
  const weak = useMemo(() => weakestSkills(cells, 5), [cells]);
  const dueCount = useMemo(() => dueReviews(reviewSchedule).length, [reviewSchedule]);
  const nextLesson = LESSONS.find((l) => lessonsDone[l.id] === undefined) ?? LESSONS[LESSONS.length - 1];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="print:hidden">
        <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
          <BookMarked className="h-3.5 w-3.5" /> PERSONAL · PRINTS TO PDF
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Your cheat sheet</h1>
        <p className="mt-3 text-[15px] leading-7 text-zinc-400">
          The revision sheet builds itself from what you actually did: the questions you missed, the skills the
          map calls shaky, the review cards coming due — over a compact reference layer. Print it, save the PDF,
          keep it beside you.
        </p>
        <button
          onClick={() => window.print()}
          className="btn-glow mt-4 flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[#052e1c] transition-colors hover:bg-emerald-300"
        >
          <Printer className="h-3.5 w-3.5" /> Print / save as PDF
        </button>
      </div>

      {/* the printable sheet */}
      <div className="mt-6 space-y-3 print:mt-0 print:space-y-3">
        <div className="hidden print:mb-2 print:block">
          <h1 className="text-xl font-bold text-black">SeeQL — personal cheat sheet</h1>
        </div>

        {/* personal state line */}
        <Section title="Where you stand">
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            {[
              ["Lessons done", `${Object.keys(lessonsDone).length}/${LESSONS.length}`],
              ["Next up", `Lesson ${nextLesson.num} — ${nextLesson.title}`],
              ["Review cards due", String(dueCount)],
              ["Questions missed", String(missed.length)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2 print:border-zinc-300">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-600">{k}</p>
                <p className="mt-0.5 truncate text-xs font-medium text-zinc-100 print:text-black">{v}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* weakest skills */}
        {weak.length > 0 && (
          <Section title="Shaky skills — brush these first">
            <ul className="space-y-1.5 text-xs leading-relaxed text-zinc-300 print:text-black">
              {weak.map((w) => (
                <li key={w.skill} className="flex items-start gap-2">
                  <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", w.level === "weak" ? "bg-rose-400" : w.level === "shaky" ? "bg-amber-400" : "bg-sky-400")} />
                  <span>
                    <span className="font-medium text-zinc-100 print:text-black">{skillLabel(w.skill)}</span>{" "}
                    — {LEVEL_TONE[w.level].label}, {Math.round((w.accuracy ?? 0) * 100)}% over {w.attempts} signals. {SKILL_OWNS(w.skill)}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* missed questions */}
        {missed.length > 0 && (
          <Section title="Questions you missed — the answers to keep">
            <ol className="space-y-2.5">
              {missed.map(({ lesson, mcq }) => (
                <li key={mcq.id} className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2.5 print:border-zinc-300">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-600">
                    Lesson {lesson.num} · {lesson.title}
                  </p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-100 print:text-black">
                    <RichNodes text={mcq.prompt} />
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-300 print:text-emerald-700">
                    {mcq.choices[mcq.answer]}
                  </p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* reference layer */}
        <Section title="The clause pipeline — fixed order">
          <ol className="space-y-1 text-xs leading-relaxed text-zinc-300 print:text-black">
            {CLAUSE_ORDER.map(([k, v], i) => (
              <li key={k} className="flex items-baseline gap-2">
                <span className="tnum w-4 shrink-0 font-mono text-[10px] text-zinc-600 print:text-zinc-500">{i + 1}</span>
                <span className="font-mono font-semibold text-violet-300 print:text-violet-700">{k}</span>
                <span className="text-zinc-400 print:text-zinc-700">— {v}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="NULL handling — the five laws">
          <ul className="space-y-1 text-xs leading-relaxed text-zinc-300 print:text-black">
            {NULL_RULES.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span className="font-mono">{r}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Joins at a glance">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-xs">
              <tbody>
                {JOIN_TABLE.map(([k, v]) => (
                  <tr key={k} className="border-b border-zinc-800/60 last:border-b-0 print:border-zinc-300">
                    <td className="py-1.5 pr-3 font-mono font-semibold text-sky-300 print:text-sky-700">{k}</td>
                    <td className="py-1.5 text-zinc-300 print:text-black">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="The write verbs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-xs">
              <tbody>
                {WRITE_VERBS.map(([k, v]) => (
                  <tr key={k} className="border-b border-zinc-800/60 last:border-b-0 print:border-zinc-300">
                    <td className="py-1.5 pr-3 font-mono font-semibold text-amber-300 print:text-amber-700">{k}</td>
                    <td className="py-1.5 text-zinc-300 print:text-black">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  );
}

function SKILL_OWNS(skill: string): string {
  // avoid importing SKILLS wholesale just for the tooltip line
  const owns: Record<string, string> = {
    select: "project columns from the right table with confidence",
    where: "gate rows with comparisons, ranges and patterns",
    null: "reason in three-valued logic; test with IS NULL, never =",
    "order-limit": "sort deterministically and slice top-N",
    aggregates: "collapse rows with COUNT/SUM/AVG/MIN/MAX",
    groupby: "bucket by key, then gate the buckets",
    joins: "follow foreign keys without losing or duplicating rows",
    setops: "stack, overlap and diff result sets",
    case: "branch per row and build pivots",
    subqueries: "stage intermediate results, scalar to CTE",
    windows: "rank, lag, and run totals without collapsing rows",
    "text-dates": "reshape strings and bucket timestamps",
    writes: "modify data with the WHERE discipline",
    schema: "shape tables, save joins, and read query plans",
    debugging: "read an engine error and fix the cause",
    finance: "walk balances, aging and reconciliation in cents",
  };
  return owns[skill] ?? "";
}
