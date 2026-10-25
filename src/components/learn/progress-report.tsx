"use client";

// Progress report — the printable snapshot. One page: course readiness, the
// 13-module table, the SQL band breakdown by section, company tracks, the
// streaks that keep the number alive and a "what's next" list computed from
// the same honest ledger the dashboard reads. No navigation, no buttons in
// the sheet — the controls are print:hidden, one click → save as PDF.

import { useMemo } from "react";
import { FileText, Printer } from "lucide-react";
import { MODULES } from "@/lib/curriculum/lessons";
import { useProgress, dueReviews } from "@/lib/curriculum/progress";
import { puzzleStreak } from "@/lib/curriculum/daily";
import { BAND_BY_MODULE, SQL_ALL_SECTIONS } from "@/lib/leetcode/sections";
import { lcBadgeStats } from "@/lib/leetcode/lc-meta";
import { lcDailyStreak } from "@/lib/leetcode/daily";
import { TRACK_COMPANIES, companySqlTrack } from "@/lib/leetcode/company-tracks";
import { Panel, Btn } from "./ui/kit";
import { cn } from "@/lib/utils";

export function ProgressReport() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const exams = useProgress((s) => s.exams);
  const reviewSchedule = useProgress((s) => s.reviewSchedule);
  const review = useProgress((s) => s.review);
  const puzzleDone = useProgress((s) => s.puzzleDone);
  const freezes = useProgress((s) => s.freezes);
  const lcDailyDone = useProgress((s) => s.lcDailyDone);

  const data = useMemo(() => {
    const rows = MODULES.map((m) => {
      const band = BAND_BY_MODULE[m.id];
      const isBand = m.lessons.length === 0 && !!band;
      const total = band ? band.slugs.length : m.lessons.length;
      const done = band
        ? band.slugs.filter((s) => xpEvents[`lc:${s}`] !== undefined).length
        : m.lessons.filter((l) => xpEvents[`lesson:${l.id}`] !== undefined).length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      const exam = exams[m.id];
      const nextLesson = isBand
        ? undefined
        : m.lessons.find((l) => xpEvents[`lesson:${l.id}`] === undefined)?.title;
      const nextLc = band ? band.slugs.find((s) => xpEvents[`lc:${s}`] === undefined) : undefined;
      return { num: m.num, title: m.title, isBand, total, done, pct, exam, nextLesson, nextLc };
    });
    const sections = SQL_ALL_SECTIONS.map((sec) => {
      const done = sec.slugs.filter((s) => xpEvents[`lc:${s}`] !== undefined).length;
      return { title: sec.title, total: sec.slugs.length, done };
    }).filter((s) => s.total > 0);
    const tracks = TRACK_COMPANIES.map((name) => {
      const problems = companySqlTrack(name);
      return { name, total: problems.length, done: problems.filter((p) => xpEvents[`lc:${p.slug}`] !== undefined).length };
    });
    const readiness = Math.round(rows.reduce((a, r) => a + r.pct, 0) / (rows.length || 1));
    const badges = lcBadgeStats(xpEvents);
    const examPasses = rows.filter((r) => r.exam?.passedAt).length;
    const reviewsDue = dueReviews(reviewSchedule).length + Object.keys(review).length;
    const pStreak = puzzleStreak(puzzleDone, freezes).streak;
    const lcStreak = lcDailyStreak(lcDailyDone);
    const next = rows
      .filter((r) => r.pct < 100)
      .slice(0, 8)
      .map((r) => ({
        label: `M${r.num} ${r.title}`,
        detail: r.isBand
          ? r.nextLc
            ? `next problem: ${r.nextLc.replaceAll("-", " ")}`
            : `${r.total - r.done} problems left in the band`
          : r.nextLesson
            ? `next lesson: ${r.nextLesson}`
            : `${r.total - r.done} lessons left`,
      }));
    return { rows, sections, tracks, readiness, badges, examPasses, reviewsDue, pStreak, lcStreak, next };
  }, [xpEvents, exams, reviewSchedule, review, puzzleDone, freezes, lcDailyDone]);

  const generated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const tone =
    data.readiness >= 80 ? "text-emerald-300 print:text-emerald-700" : data.readiness >= 50 ? "text-amber-300 print:text-amber-700" : "text-rose-300 print:text-rose-700";
  const toneWord = data.readiness >= 80 ? "interview-ready shape" : data.readiness >= 50 ? "mid-course momentum" : "early foundations";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-4 pb-24 print:max-w-none print:p-0 md:p-6">
      {/* controls — screen only */}
      <div className="print:hidden">
        <Panel pad={4}>
          <div className="flex flex-wrap items-center gap-3">
            <FileText className="h-5 w-5 text-emerald-400" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-zinc-100">Progress report</h1>
              <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-500">
                Your whole course on one printable page — readiness, module table, the SQL bands, company
                tracks and what to do next. One click opens the print dialog → save as PDF.
              </p>
            </div>
            <Btn onClick={() => window.print()}>
              <Printer className="mr-1 inline h-4 w-4" /> Print / save PDF
            </Btn>
          </div>
        </Panel>
      </div>

      {/* the sheet */}
      <div className="space-y-4 print:space-y-4">
        <header className="rounded-xl border border-black/10 bg-zinc-900/40 p-5 print:rounded-none print:border-zinc-400 print:bg-white">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-bold tracking-tight text-zinc-100 print:text-black">
              SeeQL — Progress Report
            </h2>
            <span className="font-mono text-[11px] text-zinc-500 print:text-zinc-600">{generated}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-baseline gap-2">
              <span className={cn("tnum font-mono text-4xl font-bold print:text-black", tone)}>{data.readiness}</span>
              <span className="font-mono text-xs text-zinc-600">/100 · {toneWord}</span>
            </div>
            <div className="h-2 min-w-32 flex-1 overflow-hidden rounded-full bg-zinc-800 print:bg-zinc-200" aria-hidden>
              <div className="h-full rounded-full bg-emerald-400/80 print:bg-emerald-600" style={{ width: `${data.readiness}%` }} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-zinc-500 print:text-zinc-600">
            <span>{data.badges.lcVerified} verified SQL solves</span>
            <span>{data.examPasses}/13 module exams passed</span>
            <span>daily puzzle streak {data.pStreak}-day</span>
            <span>LC daily streak {data.lcStreak}-day</span>
            <span>{data.reviewsDue} in the review queue</span>
          </div>
        </header>

        <section className="break-inside-avoid">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 print:text-zinc-600">
            Modules — 13 in parallel, none optional
          </h3>
          <div className="mt-2 overflow-hidden rounded-xl border border-black/10 print:rounded-none print:border-zinc-400">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-black/10 font-mono text-[10px] uppercase tracking-wider text-zinc-500 print:border-zinc-400 print:text-zinc-600">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Module</th>
                  <th className="px-3 py-2 text-right font-medium">Done</th>
                  <th className="hidden px-3 py-2 font-medium sm:table-cell">Progress</th>
                  <th className="px-3 py-2 text-right font-medium">Exam</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.num} className="border-b border-black/5 last:border-0 print:border-zinc-300">
                    <td className="tnum px-3 py-2 font-mono text-[11px] text-zinc-500">{r.num}</td>
                    <td className="px-3 py-2 text-zinc-100 print:text-black">
                      {r.title}
                      {r.isBand && <span className="ml-1.5 font-mono text-[9px] uppercase tracking-wide text-zinc-500">band</span>}
                    </td>
                    <td className="tnum px-3 py-2 text-right font-mono text-[11px] text-zinc-400 print:text-zinc-700">
                      {r.done}/{r.total}
                    </td>
                    <td className="hidden px-3 py-2 sm:table-cell">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800 print:bg-zinc-200" aria-hidden>
                          <span className="block h-full rounded-full bg-emerald-400/80 print:bg-emerald-600" style={{ width: `${r.pct}%` }} />
                        </span>
                        <span className="tnum w-8 shrink-0 text-right font-mono text-[10px] text-zinc-500">{r.pct}%</span>
                      </span>
                    </td>
                    <td className="tnum px-3 py-2 text-right font-mono text-[10px] text-zinc-500 print:text-zinc-600">
                      {r.exam?.passedAt ? `${r.exam.best}/${r.exam.total}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="break-inside-avoid">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 print:text-zinc-600">
            SQL bands — by section
          </h3>
          <div className="mt-2 grid gap-x-6 gap-y-1 rounded-xl border border-black/10 p-4 print:rounded-none print:border-zinc-400 sm:grid-cols-2">
            {data.sections.map((s) => (
              <div key={s.title} className="flex items-center gap-2 text-[11px]">
                <span className="min-w-0 flex-1 truncate text-zinc-300 print:text-black">{s.title}</span>
                <span className="h-1 w-16 shrink-0 overflow-hidden rounded-full bg-zinc-800 print:bg-zinc-200" aria-hidden>
                  <span
                    className="block h-full rounded-full bg-emerald-400/80 print:bg-emerald-600"
                    style={{ width: `${Math.round((s.done / s.total) * 100)}%` }}
                  />
                </span>
                <span className="tnum w-12 shrink-0 text-right font-mono text-[10px] text-zinc-500 print:text-zinc-600">
                  {s.done}/{s.total}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="break-inside-avoid">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 print:text-zinc-600">
            Company tracks — featured employers
          </h3>
          <div className="mt-2 grid gap-x-6 gap-y-1 rounded-xl border border-black/10 p-4 print:rounded-none print:border-zinc-400 sm:grid-cols-2">
            {data.tracks.map((t) => (
              <div key={t.name} className="flex items-center gap-2 text-[11px]">
                <span className="min-w-0 flex-1 truncate text-zinc-300 print:text-black">{t.name}</span>
                <span className="h-1 w-16 shrink-0 overflow-hidden rounded-full bg-zinc-800 print:bg-zinc-200" aria-hidden>
                  <span
                    className="block h-full rounded-full bg-emerald-400/80 print:bg-emerald-600"
                    style={{ width: `${t.total ? Math.round((t.done / t.total) * 100) : 0}%` }}
                  />
                </span>
                <span className="tnum w-12 shrink-0 text-right font-mono text-[10px] text-zinc-500 print:text-zinc-600">
                  {t.done}/{t.total}
                </span>
              </div>
            ))}
          </div>
        </section>

        {data.next.length > 0 && (
          <section className="break-inside-avoid">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 print:text-zinc-600">
              What&apos;s next — where the numbers are lowest
            </h3>
            <ul className="mt-2 space-y-1 rounded-xl border border-black/10 p-4 print:rounded-none print:border-zinc-400">
              {data.next.map((n) => (
                <li key={n.label} className="text-[11px] leading-relaxed text-zinc-300 print:text-black">
                  <span className="font-medium text-zinc-100 print:text-black">{n.label}</span>
                  <span className="text-zinc-500 print:text-zinc-600"> — {n.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-center font-mono text-[9px] text-zinc-600 print:text-zinc-500">
          Generated by SeeQL from your local progress ledger · {generated}
        </p>
      </div>
    </div>
  );
}
