"use client";

// SeeQL landing — the Claims Floor voice (Spade design language, studied
// from spade.com, rebuilt with original assets and copy). Cream grid paper
// with edge rulers, ► mono eyebrows and [BRACKET] section tags, a giant
// tight display headline, floating white data cards + a terminal box over
// engraved line-art, dashed mascot chips, and the CTA + footer merged into
// one deep-forest closing band with lime signal words. Substance and
// behavior are preserved 1:1 from the previous anatomy: NAV scroll, resume
// chip, mascot + move chips, HeroDemo, stats, sections, callbacks. Colors
// ride the theme ramps, so the six legacy themes still dress this page.

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowRight,
  Check,
  Menu,
  X,
} from "lucide-react";
import { LogoFull } from "@/components/brand";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SoundToggle } from "@/components/sound-toggle";
import { BloubBot, type BloubCommand } from "@/components/bloub/bloub-bot";
import type { StateId } from "@/components/bloub/states";
import { HeroDemo } from "@/components/landing/hero-demo";
import { UniverseStrip } from "@/components/universe-strip";
import { Icon3D, type Icon3DName } from "@/components/learn/ui/icon3d";
import { LESSONS, MODULES } from "@/lib/curriculum/lessons";
import { LEVELS } from "@/lib/curriculum/gamification";

const NAV = [
  { id: "why", label: "Why SeeQL" },
  { id: "method", label: "Method" },
  { id: "curriculum", label: "Curriculum" },
  { id: "seeq", label: "SeeQ" },
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

/* --------------------------------------------------------- Spade pieces */

/** Section tag: `[01] ► WHY SEEQL` — bracket + mono eyebrow on one line. */
function SectionTag({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3">
      <span className="spade-bracket tnum text-[11px] text-zinc-500">{n}</span>
      <span aria-hidden="true" className="h-px w-12 bg-zinc-700" />
      <span className="mono-eyebrow text-zinc-500">{children}</span>
    </p>
  );
}

/** Icon tile: white data card cell, hairline border, plain ink glyph. */
function Icon3DTile({ name }: { name: Icon3DName }) {
  return (
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900">
      <Icon3D name={name} size={40} />
    </span>
  );
}

/** Primary action: ink pill that flips with the theme + arrow. */
function InkButton({ onClick, children, big = false }: { onClick: () => void; children: React.ReactNode; big?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cnx(
        "inline-flex cursor-pointer items-center gap-2 rounded-full bg-foreground font-medium text-background transition-opacity hover:opacity-85",
        big ? "px-7 py-3.5 text-sm" : "px-5 py-2.5 text-[13px]",
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

/** Signal action: the lime pill reserved for the deep-forest closing band. */
function LimeButton({ onClick, children, big = false }: { onClick: () => void; children: React.ReactNode; big?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cnx(
        "spade-lime-pill inline-flex cursor-pointer items-center gap-2 rounded-full font-medium transition-opacity hover:opacity-85",
        big ? "px-7 py-3.5 text-sm" : "px-5 py-2.5 text-[13px]",
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

/** Secondary action: plain text + arrow. */
function ArrowLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded px-1 py-1 text-[13px] text-zinc-300 transition-colors hover:text-zinc-100"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}

/** Tiny class joiner (avoids importing cn for three spots). */
function cnx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Burnt-orange ticker — the newsprint strip under the header. */
function Ticker() {
  return (
    <div className="spade-ticker overflow-hidden">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-1.5 text-[10px] sm:px-6">
        <span className="spade-gold-chip shrink-0 rounded-sm px-2 py-0.5 text-[9px]">Round 22</span>
        <p className="flex min-w-0 items-center gap-3 truncate">
          <span className="shrink-0">The visual SQL lab</span>
          <span aria-hidden="true" className="shrink-0 opacity-50">·</span>
          <span className="shrink-0">8 domain packs · 1,440 drills</span>
          <span aria-hidden="true" className="hidden shrink-0 opacity-50 sm:inline">·</span>
          <span className="hidden shrink-0 sm:inline">Every query graded on real rows</span>
          <span aria-hidden="true" className="hidden shrink-0 opacity-50 md:inline">·</span>
          <span className="hidden md:inline">No account · no setup</span>
        </p>
      </div>
    </div>
  );
}

/** Engraved line-art — concentric survey rings around a DB cylinder,
    drawn once behind the hero stage. Pure SVG, olive ink, no motion. */
function EngravedRings() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 520 520"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
    >
      {[70, 110, 150, 190, 230, 258].map((r) => (
        <circle key={r} cx="260" cy="260" r={r} className="spade-engraved-soft" strokeDasharray={r % 2 ? "3 6" : undefined} />
      ))}
      {/* engraved DB cylinder */}
      <g className="spade-engraved">
        <ellipse cx="260" cy="216" rx="34" ry="12" />
        <path d="M226 216 v88 a34 12 0 0 0 68 0 v-88" />
        <path d="M226 244 a34 12 0 0 0 68 0" strokeDasharray="3 4" />
        <path d="M226 272 a34 12 0 0 0 68 0" strokeDasharray="3 4" />
      </g>
      {/* survey ticks on the outer ring */}
      <g className="spade-engraved-soft">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 260 + Math.cos(rad) * 244;
          const y1 = 260 + Math.sin(rad) * 244;
          const x2 = 260 + Math.cos(rad) * 254;
          const y2 = 260 + Math.sin(rad) * 254;
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
    </svg>
  );
}

/** Floating data card — the hero's metadata readout, top-right. */
function DataCard() {
  return (
    <div className="spade-card absolute -top-6 right-0 z-10 hidden px-4 py-3 sm:block lg:-right-4">
      <p className="spade-bracket text-[9px] text-zinc-500">Tables scanned</p>
      <p className="tnum mt-1 font-mono text-lg font-semibold leading-none text-zinc-100">103 rows</p>
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
        orders · items · products
      </p>
    </div>
  );
}

/** Terminal box — the live-query readout under the hero stage. */
function TerminalBox() {
  return (
    <div className="spade-terminal relative mx-auto w-full max-w-sm rounded-md px-4 py-3 lg:mx-0">
      <div className="flex items-center justify-between">
        <span className="spade-terminal-dots"><span /></span>
        <span className="text-[9px] uppercase tracking-[0.18em] opacity-70">seeql — live</span>
      </div>
      <p className="tnum mt-2 truncate text-[11px] leading-relaxed">
        <span className="opacity-60">$ </span>
        SELECT status, COUNT(*) FROM orders GROUP BY 1;
      </p>
      <p className="tnum mt-1 text-[10px] opacity-70">12ms · 3 groups · graded ✓</p>
    </div>
  );
}

/* ------------------------------------------------------------- SeeQ stage */

/** Moves the landing hero can perform on demand (the full 14-state film
    lives in the SeeQ workshop inside the learn app). */
const SEEQ_MOVES: { id: StateId; label: string; hold: number }[] = [
  { id: "wink", label: "Wink", hold: 1.6 },
  { id: "egg", label: "Egg", hold: 1.8 },
  { id: "hexagon", label: "Hexagon", hold: 1.6 },
  { id: "wide", label: "Wide eyes", hold: 1.8 },
  { id: "notify", label: "You've got mail", hold: 2.8 },
  { id: "orbit", label: "Orbit", hold: 2.8 },
];

/** The live landing mascot: eyes follow the cursor, poke or a move chip
    makes him perform, then he settles back to idle. Same 1:1 bloub engine
    the corner buddy runs — no mouth, two capsule eyes, that's the character. */
function SeeqMascot() {
  const [command, setCommand] = useState<BloubCommand>({ state: "idle", nonce: 0 });
  const nonce = useRef(0);
  const revert = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (revert.current !== null) window.clearTimeout(revert.current);
    },
    [],
  );

  const play = (state: StateId, hold: number) => {
    if (revert.current !== null) window.clearTimeout(revert.current);
    nonce.current += 1;
    setCommand({ state, nonce: nonce.current });
    revert.current = window.setTimeout(() => {
      nonce.current += 1;
      setCommand({ state: "idle", nonce: nonce.current });
    }, hold * 1000);
  };

  return (
    <div data-seeq-stage="1" className="flex flex-col items-center gap-5">
      <button
        type="button"
        onClick={() => play("wide", 1.6)}
        data-seeq-hero="1"
        aria-label="Poke SeeQ — he performs a move"
        className="block cursor-pointer rounded-full outline-none transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-400/60"
      >
        <BloubBot
          size={176}
          paper="#f9f9f9"
          contour="rgba(255,255,255,0.26)"
          follow
          command={command}
          className="h-40 w-40 sm:h-44 sm:w-44"
          ariaLabel="SeeQ — his eyes follow your cursor"
        />
      </button>
      <div className="flex max-w-[280px] flex-wrap justify-center gap-1.5">
        {SEEQ_MOVES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => play(m.id, m.hold)}
            data-seeq-chip={m.id}
            className="spade-dashed cursor-pointer rounded-md px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-zinc-500 transition-colors hover:text-zinc-200"
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- landing */

export function Landing({
  onStart,
  onPlayground,
  onSeeq,
}: {
  onStart: () => void;
  onPlayground: () => void;
  /** Deep-link into the SeeQ workshop (#learn?view=seeq). */
  onSeeq: () => void;
}) {
  // resume chip — deferred read so it never blocks first paint
  const [resume, setResume] = useState<{ xp: number; rank: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
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
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-950">
      {/* header — cream bar: logo, mono numbered nav, ink pill CTA */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="SeeQL — back to top">
            <LogoFull />
          </button>
          <nav aria-label="Landing sections" className="hidden items-center gap-6 md:flex">
            {NAV.map((n, i) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="group flex cursor-pointer items-baseline gap-2 font-mono text-[13px] text-zinc-400 transition-colors hover:text-zinc-100"
              >
                <span className="tnum text-[10px] text-zinc-600 group-hover:text-zinc-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {/* SeeQ — the mascot's own landing section. The mini bot is live:
                his capsule eyes track your cursor from the header. */}
            <button
              onClick={() => scrollTo("seeq")}
              data-seeq-nav="1"
              aria-label="Meet SeeQ — your study buddy"
              title="Meet SeeQ — your study buddy"
              className="hidden cursor-pointer items-center gap-1.5 rounded-full border border-zinc-800 py-1.5 pl-1.5 pr-3 text-[13px] text-zinc-300 transition-colors hover:bg-zinc-900 sm:flex"
            >
              <BloubBot
                size={26}
                color="encre"
                paper="#f9f9f9"
                contour="rgba(255,255,255,0.26)"
                follow
                className="h-[26px] w-[26px]"
                ariaLabel=""
              />
              <span>SeeQ</span>
            </button>
            <SoundToggle />
            <ThemeSwitcher />
            <InkButton onClick={onStart}>{resume ? "Continue" : "Start learning"}</InkButton>
            <button
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-zinc-800 text-zinc-300 md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav aria-label="Mobile sections" className="border-t border-zinc-800 md:hidden">
            <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-2 sm:px-6">
              {NAV.map((n, i) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setMenuOpen(false);
                    scrollTo(n.id);
                  }}
                  className="flex cursor-pointer items-baseline gap-2 border-b border-zinc-800/60 py-3 text-left font-mono text-[13px] text-zinc-300 last:border-b-0"
                >
                  <span className="tnum text-[10px] text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
                  {n.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>
      <Ticker />
      <UniverseStrip />

      {/* hero — grid paper, edge rulers, giant display headline, engraved
          stage with floating data card + terminal box */}
      <section className="spade-grid spade-ruler border-b border-zinc-800">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 px-6 pb-20 pt-16 sm:px-10 lg:grid-cols-2 lg:pb-28 lg:pt-24">
          <div>
            <p className="flex items-center gap-3">
              <span className="mono-eyebrow text-zinc-500">For self-taught analysts</span>
              <span aria-hidden="true" className="h-px w-12 bg-zinc-700" />
              <span className="spade-bracket tnum text-[11px] text-zinc-500">est. 2026</span>
            </p>
            <h1 className="spade-display mt-8 text-[2.9rem] text-zinc-100 sm:text-6xl lg:text-[4.7rem]">
              Stop memorizing SQL.{" "}
              <span className="text-emerald-400">Start seeing it.</span>
            </h1>
            <p className="mt-8 max-w-lg text-base leading-[1.7] text-zinc-400">
              SeeQL turns every query into a picture. Animated diagrams for the ideas
              that hurt, live queries on a real storefront database, and XP-driven
              progress — the Duolingo loop, tuned for analysts.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <InkButton onClick={onStart}>{resume ? "Continue learning" : "Start learning"}</InkButton>
              <ArrowLink onClick={onPlayground}>Open the Playground</ArrowLink>
            </div>
            <p className="mt-5 font-mono text-xs text-zinc-500">
              {resume
                ? `Welcome back — ${resume.rank} · ${resume.xp.toLocaleString()} XP saved on this device`
                : "No account · no setup · everything runs in your browser"}
            </p>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <EngravedRings />
            <DataCard />
            <div className="relative flex flex-col items-center gap-6 lg:items-end">
              <HeroDemo />
              <TerminalBox />
            </div>
          </div>
        </div>
      </section>

      {/* stats strip — white data-card cells on the hairline grid */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            [LESSONS.length, "lessons, start to capstone"],
            [TOTAL_FIGURES, "interactive diagrams"],
            [TOTAL_MCQ, "quiz questions"],
            [TOTAL_PROBLEMS, "live-graded queries"],
            [1, "real storefront database"],
          ].map(([n, label], i) => (
            <div
              key={label as string}
              className={`bg-zinc-900 px-6 py-8 ${i > 0 ? "border-l border-zinc-800" : ""} ${i >= 2 ? "max-sm:border-t max-sm:border-zinc-800" : ""} ${i === 2 ? "max-sm:border-l-0" : ""} ${i >= 3 ? "lg:max-sm:border-l" : ""}`}
            >
              <p className="spade-display tnum text-3xl text-zinc-100">
                <CountUp value={n as number} />
              </p>
              <p className="mt-1.5 font-mono text-[10px] uppercase leading-snug tracking-[0.1em] text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* why — bracket tag, heading left, paragraph right, white card grid */}
      <section id="why" className="border-b border-zinc-800">
        <div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:py-24">
          <Reveal>
            <SectionTag n="01">Why SeeQL</SectionTag>
            <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-16">
              <h2 className="spade-display text-3xl text-zinc-100 sm:text-4xl">
                Built to make SQL click — not stick.
              </h2>
              <p className="text-[15px] leading-[1.7] text-zinc-400 lg:pt-1.5">
                Most courses hand you videos and a multiple-choice treadmill. SeeQL
                hands you a database and a picture for every idea that usually hurts —
                then grades the SQL you write against the real rows.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="spade-card mt-14 grid overflow-hidden rounded-xl sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon3d: "eye" as Icon3DName, title: "Diagrams that move", body: "Watch WHERE eat 103 rows and pass 65. Watch GROUP BY split them into buckets, then HAVING slam the gate. Every figure uses the real numbers from your database." },
                { icon3d: "db" as Icon3DName, title: "A real database underneath", body: "Five related tables, 103 orders, 251 line items — messy enough to be honest. Every query you write executes on live SQLite, not a mock." },
                { icon3d: "target" as Icon3DName, title: "Grading, not vibes", body: "Practice results are compared against reference answers — columns, values, and (where it matters) row order. You know exactly why a query passes or fails." },
                { icon3d: "puzzle" as Icon3DName, title: "One idea at a time", body: "Projection, filtering, NULLs, sorting, deduplication, aggregates, GROUP BY — each lesson adds exactly one concept to your pipeline." },
                { icon3d: "star" as Icon3DName, title: "Progress that feels like a game", body: "XP for every solved query, six ranks from Data Novice to Query Wizard, streaks, daily goals and badges — earned, never given." },
                { icon3d: "bolt" as Icon3DName, title: "Zero setup", body: "No account, no installs, no Docker. Open the page and your sandbox database is already running. Progress saves to your device." },
              ].map((f) => (
                <div key={f.title} className="-ml-px -mt-px border border-zinc-800 p-6">
                  <Icon3DTile name={f.icon3d} />
                  <h3 className="mt-4 text-[15px] font-semibold text-zinc-100">{f.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-zinc-400">{f.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* method — three numbered white cells */}
      <section id="method" className="border-b border-zinc-800">
        <div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:py-24">
          <Reveal>
            <SectionTag n="02">Method</SectionTag>
            <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-16">
              <h2 className="spade-display text-3xl text-zinc-100 sm:text-4xl">
                Read it. Watch it. Prove it.
              </h2>
              <p className="text-[15px] leading-[1.7] text-zinc-400 lg:pt-1.5">
                Every concept follows the same loop — it&apos;s how the ideas finally
                stick. No filler, no 40-minute videos, no memorized rules without a
                picture behind them.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="spade-card mt-14 grid overflow-hidden rounded-xl lg:grid-cols-3">
              {[
                { n: "01", icon3d: "book" as Icon3DName, title: "Read the idea", body: "Short, plain-English explanations. The paragraph that matters, right next to the query it explains." },
                { n: "02", icon3d: "eye" as Icon3DName, title: "Watch it move", body: "Each hard idea gets an animated diagram on real data, so your mental model is a picture instead of a memorized rule." },
                { n: "03", icon3d: "rocket" as Icon3DName, title: "Prove it live", body: "Answer quiz questions, then write real SQL and get graded against the reference answer on the actual database. XP only when it's right." },
              ].map((s) => (
                <div key={s.n} className="-ml-px -mt-px border border-zinc-800 p-6">
                  <div className="flex items-start justify-between">
                    <span className="spade-bracket tnum text-[11px] text-zinc-500">{s.n}</span>
                    <Icon3DTile name={s.icon3d} />
                  </div>
                  <h3 className="mt-5 text-[15px] font-semibold text-zinc-100">{s.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-zinc-400">{s.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* curriculum — the module table on a white data card */}
      <section id="curriculum" className="border-b border-zinc-800">
        <div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:py-24">
          <Reveal>
            <SectionTag n="03">Curriculum</SectionTag>
            <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-16">
              <h2 className="spade-display flex items-center gap-4 text-3xl text-zinc-100 sm:text-4xl">
                <Icon3D name="cap" size={44} anim="bob" className="hidden sm:block" />
                {MODULES.length} modules. One database.
              </h2>
              <p className="text-[15px] leading-[1.7] text-zinc-400 lg:pt-1.5">
                {MODULES.length} modules on one real storefront database — foundations,
                joins, set operations, subqueries, window functions, writes, schema and
                the expert clinic. {TOTAL_MCQ} quiz questions, {TOTAL_PROBLEMS} graded
                live queries, every one executed in your browser.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="spade-card mt-14 overflow-hidden rounded-xl">
              {MODULES.map((m) => (
                <div key={m.id}>
                  <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/70 px-4 py-2.5 sm:px-5">
                    <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-300">
                      <span className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[m.level] ?? "bg-zinc-500"}`} />
                      Module {m.num} — {m.title}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">{m.level}</span>
                  </div>
                  {m.lessons.map((l) => (
                    <button
                      key={l.id}
                      onClick={onStart}
                      className="group flex w-full cursor-pointer items-center gap-4 border-t border-zinc-800/70 px-4 py-3.5 text-left transition-colors first:border-t-0 hover:bg-zinc-900/60 sm:px-5"
                    >
                      <span className="tnum font-mono text-xs text-zinc-500 transition-colors group-hover:text-emerald-300">
                        {String(l.num).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-zinc-100 transition-colors group-hover:text-zinc-50">{l.title}</span>
                        <span className="block truncate text-xs text-zinc-500">{l.blurb}</span>
                      </span>
                      <span className="tnum hidden shrink-0 font-mono text-[11px] text-zinc-500 sm:block">
                        {l.mcqs.length} quiz · {l.problems.length} queries · {l.minutes} min
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-300" />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* seeq — the mascot's own landing section, dashed move chips */}
      <section id="seeq" data-seeq-landing="1" className="border-b border-zinc-800">
        <div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:py-24">
          <Reveal>
            <SectionTag n="04">SeeQ</SectionTag>
            <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-16">
              <h2 className="spade-display text-3xl text-zinc-100 sm:text-4xl">
                Meet <span className="text-emerald-400">SeeQ</span> — your study buddy.
              </h2>
              <p className="text-[15px] leading-[1.7] text-zinc-400 lg:pt-1.5">
                One blob, two capsule eyes, no mouth — that&apos;s the whole character,
                and it grows on you fast. His eyes follow your cursor, he taps you on
                the shoulder with study tips, and you can grab him with the mouse and
                park him anywhere. Look down — he&apos;s already here.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="spade-card mt-14 grid items-center gap-8 rounded-xl p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:gap-12">
              <SeeqMascot />
              <div>
                <h3 className="spade-display text-xl text-zinc-100">He learns with you</h3>
                <p className="mt-2 max-w-lg text-[13px] leading-6 text-zinc-400">
                  SeeQ isn&apos;t a decoration — he&apos;s the coach. While you work through
                  lessons he surfaces quiet, practical tips, celebrates your pokes, and
                  never interrupts a running query. He keeps whatever outfit you give him
                  and whatever corner you park him in — on this page and everywhere else
                  in SeeQL.
                </p>
                <ul className="mt-4 space-y-2.5 text-[13px] leading-6 text-zinc-400">
                  <li className="flex gap-2.5">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                    <span><span className="text-zinc-200">Click a blob, it plays.</span> Every tile in his workshop performs its move live before you decide — the full 14-animation film included.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                    <span><span className="text-zinc-200">Grab and park him anywhere.</span> A drag places him on your favourite spot — it persists across visits, and his speech bubble flips sides so it never leaves the screen.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                    <span><span className="text-zinc-200">He reacts, never nags.</span> Tips arrive on a quiet schedule, he collapses to a 44px chip when you need the space, and one click brings him back.</span>
                  </li>
                </ul>
                <div className="mt-6 flex flex-wrap items-center gap-5">
                  <InkButton onClick={onSeeq}>Dress him up in the SeeQ workshop</InkButton>
                  <span className="font-mono text-xs text-zinc-500">Shape, colour, mood — your buddy, your rules.</span>
                </div>
                <p className="mt-5 font-mono text-[11px] text-zinc-500">
                  SeeQ is an exact 1:1 clone of{" "}
                  <span className="text-zinc-400">bloub</span> by Jérémy Perret (MIT) — same engine,
                  same blink calendar, same soul.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* closing band — CTA + footer merged into one deep-forest block with
          lime signal words, lime pill CTAs and the gold chip */}
      <div className="spade-forest mt-auto flex-1">
        <section className="border-b border-zinc-800">
          <div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:py-24">
            <Reveal>
              <div className="relative rounded-xl border border-zinc-700 px-6 py-14 sm:px-12">
                <Icon3D name="trophy" size={72} anim="float" className="absolute bottom-10 right-8 hidden lg:block" />
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <h2 className="spade-display text-3xl text-zinc-100 sm:text-4xl">
                    Free<span className="text-zinc-500">. {LESSONS.length} lessons, one price.</span>
                  </h2>
                  <span className="spade-gold-chip rounded-sm px-3 py-1.5 text-[10px]">
                    No account. Rises at never.
                  </span>
                </div>
                <p className="mt-3 text-[15px] leading-[1.7] text-zinc-300">
                  Start at <span className="text-[var(--spade-lime)]">Data Novice</span>. Solve your first{" "}
                  <span className="text-[var(--spade-lime)]">graded query</span> in lesson one, and let the
                  streak do the rest.
                </p>
                <div className="mt-8 grid gap-x-10 gap-y-3 text-[13px] leading-6 text-zinc-200 sm:grid-cols-2">
                  {[
                    "Every lesson read · watched · graded live",
                    "XP, ranks, streaks and badges that you earn",
                    "Playground with parse trees, plans and charts",
                    "SeeQ — a buddy who follows your cursor",
                  ].map((line) => (
                    <span key={line} className="flex gap-2.5">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--spade-lime)]" />
                      {line}
                    </span>
                  ))}
                </div>
                <div className="mt-10">
                  <LimeButton onClick={onStart} big>
                    Start learning — free
                  </LimeButton>
                </div>
                <p className="mt-4 font-mono text-xs text-zinc-400">No account · 7 themes · everything on this device</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* footer — forest columns */}
        <footer className="flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-14 sm:px-6">
            <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
              <div>
                <LogoFull />
                <p className="mt-3 max-w-xs text-[13px] leading-6 text-zinc-400">
                  A visual way to learn SQL — animated figures, a real SQLite engine
                  and a grading loop that pays XP.
                </p>
                <div className="mt-5">
                  <LimeButton onClick={onStart}>Start learning</LimeButton>
                </div>
              </div>
              <div>
                <p className="spade-bracket text-[10px] text-zinc-500">Site</p>
                <div className="mt-4 flex flex-col items-start gap-2.5">
                  {NAV.map((n) => (
                    <button key={n.id} onClick={() => scrollTo(n.id)} className="cursor-pointer text-[13px] text-zinc-300 transition-colors hover:text-zinc-100">
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="spade-bracket text-[10px] text-zinc-500">Elsewhere</p>
                <div className="mt-4 flex flex-col items-start gap-2.5">
                  <button onClick={onPlayground} className="cursor-pointer text-[13px] text-zinc-300 transition-colors hover:text-zinc-100">
                    Playground
                  </button>
                  <button onClick={onStart} className="cursor-pointer text-[13px] text-zinc-300 transition-colors hover:text-zinc-100">
                    The course
                  </button>
                  <button onClick={() => scrollTo("seeq")} className="cursor-pointer text-[13px] text-zinc-300 transition-colors hover:text-zinc-100">
                    Meet SeeQ
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-12 flex flex-col justify-between gap-2 border-t border-zinc-700 pt-6 font-mono text-[11px] text-zinc-400 sm:flex-row">
              <span>(c) 2026 SeeQL. All rights reserved.</span>
              <span>Built for learners, by learners.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
