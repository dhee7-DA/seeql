"use client";

// SeeQL landing — flat editorial design raised to a premium finish:
// solid surfaces, hairline borders, one accent, display-face headlines,
// a quiet ambient glow behind the hero, sheen on raised cards.
// The chromatic atmosphere derives from --brand-accent (theme-adaptive).

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CircleHelp,
  Database,
  Eye,
  Layers,
  PencilRuler,
  Zap,
} from "lucide-react";
import { LogoFull } from "@/components/brand";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { HeroDemo } from "@/components/landing/hero-demo";
import { LESSONS, MODULES } from "@/lib/curriculum/lessons";
import { LEVELS } from "@/lib/curriculum/gamification";

const NAV = [
  { id: "why", label: "Why SeeQL" },
  { id: "method", label: "Method" },
  { id: "curriculum", label: "Curriculum" },
];

const TOTAL_MCQ = LESSONS.reduce((a, l) => a + l.mcqs.length, 0);
const TOTAL_PROBLEMS = LESSONS.reduce((a, l) => a + l.problems.length, 0);
const TOTAL_FIGURES = LESSONS.reduce((a, l) => a + l.blocks.filter((b) => b.kind === "diagram").length, 0);

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Count-up numeral — springs from 0 to n the first time it scrolls into view. */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, mv, value]);
  useEffect(() => spring.on("change", (v) => setDisplay(Math.round(v))), [spring]);

  return (
    <span ref={ref} className="tnum">
      {display.toLocaleString()}
    </span>
  );
}

/** Level dot for module headers — one hue per difficulty tier. */
const LEVEL_DOT: Record<string, string> = {
  Beginner: "bg-emerald-400",
  Intermediate: "bg-sky-400",
  Advanced: "bg-violet-400",
  Expert: "bg-amber-400",
};

export function Landing({ onStart, onPlayground }: { onStart: () => void; onPlayground: () => void }) {
  // resume chip — deferred read so it never blocks first paint
  const [resume, setResume] = useState<{ xp: number; rank: string } | null>(null);
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem("sql-visualizer-learn-v1");
        if (!raw) return;
        const events = (JSON.parse(raw)?.state?.xpEvents ?? {}) as Record<string, number>;
        const xp = Object.values(events).reduce((a, b) => a + b, 0);
        if (xp > 0) {
          let rank = LEVELS[0].title;
          for (const l of LEVELS) if (xp >= l.base) rank = l.title;
          setResume({ xp, rank });
        }
      } catch {
        /* first visit */
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="grain flex min-h-screen flex-1 flex-col bg-zinc-950">
      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="SeeQL — back to top">
            <LogoFull />
          </button>
          <nav aria-label="Landing sections" className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-900/70 hover:text-zinc-100"
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <button
              onClick={onPlayground}
              className="btn-quiet hidden rounded-md border border-zinc-800 px-3.5 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 sm:block"
            >
              Playground
            </button>
            <button
              onClick={onStart}
              className="btn-glow rounded-md bg-emerald-400 px-3.5 py-2 text-sm font-medium text-[#052e1c] transition-all hover:bg-emerald-300"
            >
              Start learning
            </button>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="bg-ambient relative border-b border-zinc-800/80">
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-400">
              <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-emerald-400" />
              A visual SQL learning lab — free, in your browser
            </p>
            <h1 className="font-display mt-6 text-[2.6rem] font-semibold leading-[1.06] tracking-[-0.03em] text-zinc-50 sm:text-6xl lg:text-[3.5rem]">
              Stop memorizing SQL.
              <br />
              <span className="text-emerald-400">Start seeing it.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-7 text-zinc-400">
              SeeQL turns every query into a picture. Learn foundations, joins and set operations through animated diagrams, run live
              queries on a real storefront database, and level up like it&apos;s a game — the Duolingo loop, tuned
              for analysts.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onStart}
                className="btn-glow inline-flex items-center gap-2 rounded-md bg-emerald-400 px-5 py-2.5 text-sm font-medium text-[#052e1c] transition-all hover:bg-emerald-300"
              >
                {resume ? "Continue learning" : "Start learning"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={onPlayground}
                className="btn-quiet rounded-md border border-zinc-800 px-5 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900"
              >
                Open the Playground
              </button>
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              {resume
                ? `Welcome back — ${resume.rank} · ${resume.xp.toLocaleString()} XP saved on this device`
                : "No account · no setup · everything runs in your browser"}
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* stats strip */}
      <section className="border-b border-zinc-800/80">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            [LESSONS.length, "lessons, start to capstone"],
            [TOTAL_FIGURES, "interactive diagrams"],
            [TOTAL_MCQ, "quiz questions"],
            [TOTAL_PROBLEMS, "live-graded queries"],
            [1, "real storefront database"],
          ].map(([n, label], i) => (
            <div
              key={label as string}
              className={`px-6 py-7 ${i > 0 ? "border-l border-zinc-800/80" : ""} ${i >= 2 ? "max-sm:border-t max-sm:border-zinc-800/80" : ""} ${i === 2 ? "max-sm:border-l-0" : ""} ${i >= 3 ? "lg:max-sm:border-l" : ""}`}
            >
              <p className="font-display tnum text-3xl font-semibold text-zinc-50">
                <CountUp value={n as number} />
              </p>
              <p className="mt-1.5 text-xs leading-snug text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* why */}
      <section id="why" className="border-b border-zinc-800/80">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Built to make SQL click — not stick</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Most courses hand you videos and a multiple-choice treadmill. SeeQL hands you a database and a
              picture for every idea that usually hurts.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Eye, title: "Diagrams that move", body: "Watch WHERE eat 103 rows and pass 65. Watch GROUP BY split them into buckets, then HAVING slam the gate. Every figure uses the real numbers from your database." },
              { icon: Database, title: "A real database underneath", body: "Five related tables, 103 orders, 251 line items — messy enough to be honest. Every query you write executes on live SQLite, not a mock." },
              { icon: CircleHelp, title: "Grading, not vibes", body: "Practice results are compared against reference answers — columns, values, and (where it matters) row order. You know exactly why a query passes or fails." },
              { icon: Layers, title: "One idea at a time", body: "Projection, filtering, NULLs, sorting, deduplication, aggregates, GROUP BY — each lesson adds exactly one concept to your pipeline." },
              { icon: BarChart3, title: "Progress that feels like a game", body: "XP for every solved query, six ranks from Data Novice to Query Wizard, streaks, daily goals and badges — earned, never given." },
              { icon: Zap, title: "Zero setup", body: "No account, no installs, no Docker. Open the page and your sandbox database is already running. Progress saves to your device." },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <div className="sheen card-hover h-full rounded-lg border border-zinc-800 bg-zinc-950 p-5">
                  <span className="inline-flex rounded-md border border-emerald-400/20 bg-emerald-400/10 p-2">
                    <f.icon className="h-4 w-4 text-emerald-300" />
                  </span>
                  <h3 className="mt-3.5 text-sm font-semibold text-zinc-100">{f.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-zinc-400">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* method */}
      <section id="method" className="border-b border-zinc-800/80">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Read it. Watch it. Prove it.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Every concept follows the same loop — it&apos;s how the ideas finally stick.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {[
              { n: "01", icon: PencilRuler, title: "Read the idea", body: "Short, plain-English explanations. No filler, no 40-minute videos — the paragraph that matters, next to the query it explains." },
              { n: "02", icon: Eye, title: "Watch it move", body: "Each hard idea gets an animated diagram on real data, so your mental model is a picture instead of a memorized rule." },
              { n: "03", icon: Zap, title: "Prove it live", body: "Answer quiz questions, then write real SQL and get graded against the reference answer on the actual database. XP only when it's right." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.07}>
                <div className="sheen card-hover relative h-full rounded-lg border border-zinc-800 bg-zinc-950 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-display tnum text-sm font-medium text-zinc-600">{s.n}</span>
                    <span className="inline-flex rounded-md border border-emerald-400/20 bg-emerald-400/10 p-2">
                      <s.icon className="h-4 w-4 text-emerald-300" />
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-zinc-100">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-zinc-400">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* curriculum */}
      <section id="curriculum" className="border-b border-zinc-800/80">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50">The SeeQL curriculum</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                  Eight modules on one real storefront database — single-table foundations, the full join toolkit,
                  set operations and CASE, subqueries and window functions, then writes, schema and the expert
                  clinic. {TOTAL_MCQ} quiz questions, {TOTAL_PROBLEMS} graded live queries, every one executed and graded in your browser.
                </p>
              </div>
              <span className="sheen rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 font-mono text-[11px] text-zinc-500">
                {MODULES.length} modules · {LESSONS.length} lessons · {LESSONS.reduce((a, l) => a + l.minutes, 0)} min total
              </span>
            </div>
          </Reveal>
          <div className="sheen mt-10 overflow-hidden rounded-xl border border-zinc-800">
            {MODULES.map((m) => (
              <div key={m.id}>
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2.5 sm:px-5">
                  <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-wider text-zinc-300">
                    <span className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[m.level] ?? "bg-zinc-500"}`} />
                    Module {m.num} — {m.title}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">{m.level}</span>
                </div>
                {m.lessons.map((l) => (
                  <button
                    key={l.id}
                    onClick={onStart}
                    className="group flex w-full items-center gap-4 border-t border-zinc-800/70 px-4 py-3.5 text-left transition-colors first:border-t-0 hover:bg-zinc-900/60 sm:px-5"
                  >
                    <span className="tnum font-mono text-xs text-zinc-600 transition-colors group-hover:text-emerald-300">
                      {String(l.num).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-zinc-100 transition-colors group-hover:text-zinc-50">{l.title}</span>
                      <span className="block truncate text-xs text-zinc-500">{l.blurb}</span>
                    </span>
                    <span className="tnum hidden shrink-0 font-mono text-[11px] text-zinc-600 sm:block">
                      {l.mcqs.length} quiz · {l.problems.length} queries · {l.minutes} min
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-300" />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-zinc-800/80">
        <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
          <Reveal>
            <div className="bg-ambient grain sheen relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-16 text-center sm:px-12">
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-4xl">
                Your first query is 30 seconds away
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-400">
                Start at Data Novice. Solve your first graded query in lesson one, and let the streak do the rest.
              </p>
              <button
                onClick={onStart}
                className="btn-glow mt-8 inline-flex items-center gap-2 rounded-md bg-emerald-400 px-6 py-3 text-sm font-medium text-[#052e1c] transition-all hover:bg-emerald-300"
              >
                Start learning — free
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-4 text-xs text-zinc-500">No account · 4 themes · everything on this device</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* footer */}
      <footer className="mt-auto flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <LogoFull />
          <p className="text-xs text-zinc-600">
            SeeQL — a visual way to learn SQL. Built with a real SQLite engine in your browser.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <button onClick={onPlayground} className="transition-colors hover:text-zinc-300">Playground</button>
            <button onClick={onStart} className="transition-colors hover:text-zinc-300">Learn</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
