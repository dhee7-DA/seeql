"use client";

// Review deck — "your misses, resurfaced". Every question missed anywhere
// lands here as a Leitner card (box 0, due in 10 minutes). Recalling promotes
// 10min → 1d → 2d → 4d → 8d → 16d; missing drops back to box 0. Recalls pay
// zero XP by design — this deck is for retention, not farming.
//
// The session queue is SNAPSHOTTED when it starts: answering a card reschedules
// it into the future, which would otherwise mutate a live-derived queue and
// reset the session under the learner's feet.

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BrainCircuit, Building2, RefreshCcw } from "lucide-react";
import { LESSONS } from "@/lib/curriculum/lessons";
import { ALL_GAUNTLET_MCQS } from "@/lib/curriculum/gauntlet";
import { ALL_KEYWORD_BANK_MCQS } from "@/lib/curriculum/keyword-banks";
import { fillsFor } from "@/lib/curriculum/fills";
import { MAX_BOX, REVIEW_INTERVALS, useProgress } from "@/lib/curriculum/progress";
import { COMPANY_KITS, companyKit } from "@/lib/companies/registry";
import type { CompanyKit, TheoryQa } from "@/lib/companies/types";
import type { Fill, Mcq } from "@/lib/curriculum/types";
import { McqCard } from "./mcq";
import { FillCard } from "./fill-blank";
import { cn } from "@/lib/utils";

interface Card {
  id: string;
  kind: "mcq" | "fill";
  mcq?: Mcq;
  fill?: Fill;
  lessonNum: number;
  lessonTitle: string;
}

function useCatalog(): Map<string, Card> {
  return useMemo(() => {
    const map = new Map<string, Card>();
    for (const l of LESSONS) {
      for (const m of l.mcqs)
        map.set(m.id, { id: m.id, kind: "mcq", mcq: m, lessonNum: l.num, lessonTitle: l.title });
      for (const f of fillsFor(l.num))
        map.set(f.id, { id: f.id, kind: "fill", fill: f, lessonNum: l.num, lessonTitle: l.title });
    }
    // Gauntlet MCQs join the review deck too — a miss in the gauntlet must
    // resolve here, or the Leitner store would hold unresolvable ids.
    for (const q of ALL_GAUNTLET_MCQS)
      map.set(q.id, { id: q.id, kind: "mcq", mcq: q, lessonNum: 0, lessonTitle: "Module gauntlet" });
    // Keyword-bank MCQs likewise — misses in the Keyword Practice hub must resolve.
    for (const q of ALL_KEYWORD_BANK_MCQS)
      map.set(q.id, { id: q.id, kind: "mcq", mcq: q, lessonNum: 0, lessonTitle: "Keyword practice" });
    return map;
  }, []);
}

function dueLabel(ms: number): string {
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${Math.max(1, m)} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr`;
  return `${Math.round(h / 24)} days`;
}

const BOX_LABEL = ["10 min", "1 day", "2 days", "4 days", "8 days", "16 days"];

/* ---------------- scheduled ladder (spaced repetition) ----------------
 *
 * The second retention mechanism: every ANSWER (not just misses) schedules a
 * return on the 1d → 3d → 7d → 14d ladder via scheduleReview. Keys come from
 * three families — course questions ("mcq:<id>"), mock-screen kit questions
 * ("umcq:<kitId>:<mcqId>") and kit theory ("uthr:<kitId>:<tid>") — so the
 * company universe resurfaces here exactly like the course does. Recalls are
 * zero-XP: the original answer already banked any points.
 */

/** Kit-question lookup: bare kit MCQ id → its kit + question (208 kits). */
const KIT_MCQ_CATALOG: Map<string, { kit: CompanyKit; mcq: Mcq }> = (() => {
  const m = new Map<string, { kit: CompanyKit; mcq: Mcq }>();
  for (const kit of Object.values(COMPANY_KITS)) for (const q of kit.mcqs) m.set(q.id, { kit, mcq: q });
  return m;
})();

interface LadderItem {
  key: string;
  due: number;
  step: number;
  lapses: number;
  kind: "mcq" | "theory";
  mcq?: Mcq;
  theory?: TheoryQa;
  /** Where the card came from, e.g. "Lesson 03 · INNER JOIN" or "Amazon kit". */
  origin: string;
}

const LADDER_RE = /^(mcq|umcq|uthr):(.+)$/;

function resolveLadder(key: string, catalog: Map<string, { kind: "mcq" | "fill"; mcq?: Mcq; lessonNum: number; lessonTitle: string }>): Omit<LadderItem, "key" | "due" | "step" | "lapses"> | null {
  const m = LADDER_RE.exec(key);
  if (!m) return null;
  const [, fam, rest] = m;
  if (fam === "mcq") {
    const lessonCard = catalog.get(rest);
    if (lessonCard?.mcq) {
      const l = LESSONS.find((x) => x.num === lessonCard.lessonNum);
      return { kind: "mcq", mcq: lessonCard.mcq, origin: l ? `Lesson ${String(l.num).padStart(2, "0")} · ${l.title}` : lessonCard.lessonTitle };
    }
    const kitQ = KIT_MCQ_CATALOG.get(rest);
    if (kitQ) return { kind: "mcq", mcq: kitQ.mcq, origin: `${kitQ.kit.name} kit` };
    return null;
  }
  const sep = rest.indexOf(":");
  if (sep <= 0) return null;
  const kit = companyKit(rest.slice(0, sep));
  const qid = rest.slice(sep + 1);
  if (!kit) return null;
  if (fam === "umcq") {
    const mcq = kit.mcqs.find((q) => q.id === qid);
    return mcq ? { kind: "mcq", mcq, origin: `${kit.name} mock screen` } : null;
  }
  const theory = kit.theory.find((t) => t.id === qid);
  return theory ? { kind: "theory", theory, origin: `${kit.name} theory` } : null;
}

const LADDER_STEP_LABEL = ["1 day", "3 days", "7 days", "14 days"];

/** A theory card on the ladder: say it, reveal, self-mark. A nailed answer
 *  graduates the card; anything less sends it back to tomorrow. Zero XP —
 *  the one-time theory XP was banked when the mark was first made. */
function TheoryLadderCard({ theory, onMarked }: { theory: TheoryQa; onMarked: (recalled: boolean) => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="sheen relative rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">Theory · say it out loud</p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-100">{theory.q}</p>
      <textarea
        rows={3}
        placeholder="Sketch it the way you'd say it in the screen — definition, trade-off, one example."
        className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2.5 text-xs leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
      />
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mt-3 rounded-md border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
        >
          Reveal model answer
        </button>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs leading-relaxed text-zinc-300">{theory.a}</div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
            Self-mark:
            <button
              onClick={() => onMarked(true)}
              className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 font-medium text-emerald-200 transition-colors hover:bg-emerald-400/20"
            >
              Nailed it
            </button>
            {["Shaky", "Missed it"].map((label) => (
              <button
                key={label}
                onClick={() => onMarked(false)}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-zinc-300 transition-colors hover:border-zinc-500"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-[10px] leading-relaxed text-zinc-600">Nailed graduates the card — shaky or missed brings it back tomorrow.</p>
        </div>
      )}
    </div>
  );
}

function LadderTab() {
  const catalog = useCatalog();
  const schedule = useProgress((s) => s.reviewSchedule);
  const [, setTick] = useState(0);

  // keep countdowns moving, same cadence as the misses deck
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const [session, setSession] = useState<string[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [sessionMisses, setSessionMisses] = useState(0);

  const now = Date.now();
  const items = useMemo(() => {
    const out: LadderItem[] = [];
    for (const [key, card] of Object.entries(schedule)) {
      if (!LADDER_RE.test(key)) continue;
      const resolved = resolveLadder(key, catalog);
      if (!resolved) continue;
      out.push({ key, ...card, ...resolved });
    }
    return out.sort((a, b) => a.due - b.due);
    // `now` ticks the 30s re-evaluation without invalidating the memo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, catalog]);

  const due = items.filter((i) => i.due <= now);
  const nextUp = items.find((i) => i.due > now);
  const dueKey = due.map((i) => i.key).join(",");

  // Auto-arm a session when due cards exist and none is running.
  useEffect(() => {
    if (session === null && due.length > 0) {
      setSession(due.map((i) => i.key));
      setIdx(0);
      setAnswered(false);
      setSessionMisses(0);
    }
  }, [dueKey, session]);

  const currentKey = session !== null && idx < session.length ? session[idx] : null;
  const current = currentKey ? items.find((i) => i.key === currentKey) : undefined;
  const finished = session !== null && idx >= session.length;

  const onMarked = (recalled: boolean) => {
    setAnswered(true);
    if (!recalled) setSessionMisses((n) => n + 1);
  };

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-6 text-center">
        <BrainCircuit className="mx-auto h-8 w-8 text-zinc-700" />
        <p className="mt-3 text-sm font-medium text-zinc-300">The ladder is empty</p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-zinc-500">
          Every question you answer — course quiz, kit tab, mock screen — schedules its own return:
          right answers come back in 1, 3, then 7 days, misses come back tomorrow. Answer something and
          the ladder starts building itself.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* stats strip */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          ["Due now", String(due.length)],
          ["On the ladder", String(items.length)],
          ["Next card", nextUp ? `in ${dueLabel(nextUp.due - now)}` : "—"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-3">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">{k}</p>
            <p className="tnum mt-1 truncate text-sm font-medium text-zinc-100">{v}</p>
          </div>
        ))}
      </div>

      {current && !finished && (
        <div className="mt-5">
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-sky-400 transition-all duration-500 ease-out"
                style={{ width: `${(idx / session!.length) * 100}%` }}
              />
            </div>
            <span className="tnum shrink-0 font-mono text-xs text-zinc-500">
              {idx + 1} / {session!.length}
            </span>
            <span className="shrink-0 rounded-full border border-sky-400/40 bg-sky-400/10 px-2.5 py-0.5 font-mono text-[10px] text-sky-300">
              {current.step >= 0 && current.step < LADDER_STEP_LABEL.length
                ? `pass ${current.step + 1} · next in ${LADDER_STEP_LABEL[current.step]}`
                : "back at day 1"}
              {current.lapses > 0 ? ` · ${current.lapses} lapse${current.lapses === 1 ? "" : "s"}` : ""}
            </span>
          </div>

          <p className="mb-2 mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
            <Building2 className="h-3 w-3" /> {current.origin}
          </p>

          {current.kind === "mcq" ? (
            <McqCard key={current.key} mcq={current.mcq!} ladderKey={current.key} onAnswered={onMarked} />
          ) : (
            <TheoryLadderCard key={current.key} theory={current.theory!} onMarked={onMarked} />
          )}

          {answered && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <p className="text-sm text-zinc-400">
                {idx + 1 === session!.length ? "That was the last scheduled card." : "Locked in — on to the next one."}
              </p>
              <button
                onClick={() => {
                  setIdx((i) => i + 1);
                  setAnswered(false);
                }}
                className="flex shrink-0 items-center gap-1.5 rounded-md bg-sky-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-sky-300"
              >
                {idx + 1 === session!.length ? "See the verdict" : "Next card"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {finished && (
        <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <p className="font-display text-lg font-semibold text-sky-300">Ladder cleared</p>
          <p className="mt-1 text-sm text-zinc-400">
            {session!.length - sessionMisses} scheduled card{session!.length - sessionMisses === 1 ? "" : "s"} recalled —
            {sessionMisses > 0
              ? ` ${sessionMisses} come${sessionMisses === 1 ? "s" : ""} back tomorrow.`
              : " the survivors move up the 1 → 3 → 7 → 14 day ladder, then graduate for good."}
          </p>
          <div className="mt-4">
            <button
              onClick={() => {
                setSession(null);
                setIdx(0);
                setAnswered(false);
                setSessionMisses(0);
              }}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Back to hub
            </button>
          </div>
        </div>
      )}

      {!current && !finished && due.length === 0 && (
        <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm font-medium text-zinc-100">
            Nothing due right now{nextUp ? ` — next card in ${dueLabel(nextUp.due - now)}` : ""}.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {items.length} card{items.length === 1 ? "" : "s"} waiting on the ladder. Answer more questions — kit tabs,
            mock screens, mixed quiz — and new returns get scheduled automatically.
          </p>
        </div>
      )}
    </div>
  );
}

export function ReviewDeck() {
  const catalog = useCatalog();
  const review = useProgress((s) => s.review);
  const reviewCorrect = useProgress((s) => s.reviewCorrect);
  const reviewWrong = useProgress((s) => s.reviewWrong);
  const [tab, setTab] = useState<"misses" | "ladder">("misses");
  const [, setTick] = useState(0);

  // Re-evaluate "due" every 30 s so countdowns move without interaction.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const entries = useMemo(
    () =>
      Object.entries(review)
        .map(([id, e]) => ({ id, ...e, card: catalog.get(id) }))
        .filter((e) => e.card !== undefined),
    [review, catalog],
  );

  const now = Date.now();
  const due = entries.filter((e) => e.due <= now).sort((a, b) => a.due - b.due);
  const nextUp = entries.filter((e) => e.due > now).sort((a, b) => a.due - b.due)[0];
  const graduated = entries.filter((e) => e.box >= MAX_BOX).length;
  const accuracy =
    reviewCorrect + reviewWrong > 0 ? Math.round((reviewCorrect / (reviewCorrect + reviewWrong)) * 100) : null;

  // Session snapshot — ids of the cards queued when the session started.
  const [session, setSession] = useState<string[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [sessionMisses, setSessionMisses] = useState(0);
  const dueKey = due.map((e) => e.id).join(",");

  // Auto-arm a session when due cards exist and none is running.
  useEffect(() => {
    if (session === null && due.length > 0) {
      setSession(due.map((e) => e.id));
      setIdx(0);
      setAnswered(false);
      setSessionMisses(0);
    }
  }, [dueKey, session]);

  const currentId = session !== null && idx < session.length ? session[idx] : null;
  const current = currentId ? entries.find((e) => e.id === currentId) : undefined;
  const finished = session !== null && idx >= session.length;

  function onAnswered(correct: boolean) {
    setAnswered(true);
    if (!correct) setSessionMisses((n) => n + 1);
  }

  function advance() {
    setIdx((i) => i + 1);
    setAnswered(false);
  }

  function backToHub() {
    setSession(null);
    setIdx(0);
    setAnswered(false);
    setSessionMisses(0);
  }

  return (
    <div className="max-w-3xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Toolbox</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-50">Review deck</h1>
        <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-0.5" role="tablist" aria-label="Review deck sections">
          {(["misses", "ladder"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                tab === t ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {t === "misses" ? "Misses (Leitner)" : "Scheduled (ladder)"}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        {tab === "misses"
          ? "Your misses, resurfaced. Miss a question anywhere in the course and it lands here due in 10 minutes — recall it and the interval grows 10min → 1 → 2 → 4 → 8 → 16 days. Recalls pay no XP; the deck is for memory, not points."
          : "Every answer schedules its own return on the 1 → 3 → 7 → 14 day ladder — course questions, company-kit questions and mock-screen theory alike. Nail a card four times and it graduates for good. Zero XP: the answer already banked it."}
      </p>

      {tab === "ladder" && <LadderTab />}

      {tab === "misses" && (
      <>
      {/* stats strip */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Due now", String(due.length)],
          ["In the deck", String(entries.length)],
          ["Graduated", String(graduated)],
          ["Recall rate", accuracy === null ? "—" : `${accuracy}%`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-3">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">{k}</p>
            <p className="tnum mt-1 truncate text-sm font-medium text-zinc-100">{v}</p>
          </div>
        ))}
      </div>

      {/* session */}
      {current && !finished && (
        <div className="mt-5">
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500 ease-out"
                style={{ width: `${(idx / session!.length) * 100}%` }}
              />
            </div>
            <span className="tnum shrink-0 font-mono text-xs text-zinc-500">
              {idx + 1} / {session!.length}
            </span>
            <span className="shrink-0 rounded-full border border-violet-400/40 bg-violet-400/10 px-2.5 py-0.5 font-mono text-[10px] text-violet-300">
              box {current.box} · next interval {BOX_LABEL[Math.min(current.box + 1, MAX_BOX)]}
            </span>
          </div>

          <p className="mb-2 mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
            {current.card!.kind === "mcq" ? "Question" : "Rebuild"} · Lesson {String(current.card!.lessonNum).padStart(2, "0")} ·{" "}
            {current.card!.lessonTitle}
          </p>

          {current.card!.kind === "mcq" ? (
            <McqCard key={current.id} mcq={current.card!.mcq!} reviewMode onAnswered={onAnswered} />
          ) : (
            <FillCard key={current.id} fill={current.card!.fill!} reviewMode onAnswered={onAnswered} />
          )}

          {answered && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <p className="text-sm text-zinc-400">
                {idx + 1 === session!.length ? "That was the last due card." : "Locked in — on to the next one."}
              </p>
              <button
                onClick={advance}
                className="flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
              >
                {idx + 1 === session!.length ? "See the verdict" : "Next card"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* cleared verdict */}
      {finished && (
        <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <p className="font-display text-lg font-semibold text-emerald-300">Deck cleared</p>
          <p className="mt-1 text-sm text-zinc-400">
            {session!.length - sessionMisses} recalled
            {sessionMisses > 0 ? `, ${sessionMisses} back in the deck at box 0 (due in 10 minutes)` : ""} — the survivors
            move one box up the schedule.
          </p>
          <div className="mt-4">
            <button
              onClick={backToHub}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Back to hub
            </button>
          </div>
        </div>
      )}

      {/* empty state */}
      {entries.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-6 text-center">
          <BrainCircuit className="mx-auto h-8 w-8 text-zinc-700" />
          <p className="mt-3 text-sm font-medium text-zinc-300">Your deck is empty</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-zinc-500">
            Miss a quiz question or a fill anywhere in the course and it will appear here, due 10
            minutes later. Get it right in the deck and it keeps coming back on a growing schedule
            until it sticks.
          </p>
        </div>
      )}

      {/* nothing due but cards exist */}
      {entries.length > 0 && due.length === 0 && session === null && (
        <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm font-medium text-zinc-100">
            Nothing due right now{nextUp ? ` — next card in ${dueLabel(nextUp.due - now)}` : ""}.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {graduated} of {entries.length} card{entries.length === 1 ? "" : "s"} graduated to the 16-day interval. Misses
            from new lessons will keep feeding the deck.
          </p>
        </div>
      )}
      </>
      )}
    </div>
  );
}

/** Sidebar badge helper: how many cards are due right now. */
export function useDueCount(): number {
  const review = useProgress((s) => s.review);
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);
  const now = Date.now();
  return useMemo(() => Object.values(review).filter((e) => e.due <= now).length, [review, now]);
}
