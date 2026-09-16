"use client";

// Case Files deck — stakeholder memos where the learner rebuilds a real
// query from a chip bank: figures and SQL keywords live in numbered slots,
// decoys lurk in the bank, wrong placements get per-slot coaching, and a
// correct rebuild opens the walkthrough and awards XP (idempotent `case:` keys).
// Two filter axes: difficulty tier (easy / medium / hard) and lesson topic.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  FileStack,
  RotateCcw,
  Stamp,
  X,
} from "lucide-react";
import { useProgress } from "@/lib/curriculum/progress";
import {
  CASES,
  CASE_TOPICS,
  CASE_XP,
  caseTopicLabel,
  caseUniverseLabel,
} from "@/lib/curriculum/cases";
import type { CaseStudy } from "@/lib/curriculum/cases/types";
import { moduleOfLesson } from "@/lib/curriculum/lessons";
import { cn } from "@/lib/utils";
import { SqlNodes } from "./sql-code";
import { RichNodes } from "./rich";
import { celebrate } from "./celebrate";

// ---- deterministic shuffle (same bank order on server + client) -----------

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledBank(c: CaseStudy): string[] {
  const bank = Array.from(new Set([...c.slots.map((s) => s.answer), ...c.distractors]));
  const rnd = mulberry32(hashSeed(c.id));
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]];
  }
  return bank;
}

// ---- chip styling heuristic (mirrors sql-code hues) ------------------------

function chipTone(text: string): string {
  const t = text.trim();
  if (/^-?\d+(\.\d+)?$/.test(t)) return "text-orange-300";
  if (/^['"]/.test(t)) return "text-rose-300";
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(t) && /^(SELECT|FROM|WHERE|AND|OR|NOT|NULL|IS|IN|LIKE|BETWEEN|ORDER|GROUP|BY|HAVING|LIMIT|OFFSET|DISTINCT|AS|ASC|DESC|COUNT|SUM|AVG|MIN|MAX|TOTAL|ROUND|CAST|CASE|WHEN|THEN|ELSE|END|ON|UNION|ALL|INTERSECT|EXCEPT|WITH|EXISTS|INSERT|UPDATE|DELETE|CREATE|TABLE|VIEW|INDEX|DROP|ALTER|JOIN|LEFT|RIGHT|INNER|OUTER|VALUES|SET|INTO|DEFAULT|CHECK|UNIQUE|REFERENCES|PRIMARY|KEY|FOREIGN|IF|COLLATE|GLOB)$/i.test(t))
    return "text-violet-300";
  return "text-zinc-200";
}

// ---- template parsing -------------------------------------------------------

type Segment = { text: string } | { slot: number };

function parseTemplate(template: string): Segment[][] {
  return template.split("\n").map((line) => {
    const segs: Segment[] = [];
    const re = /\{(\d+)\}/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) segs.push({ text: line.slice(last, m.index) });
      segs.push({ slot: Number(m[1]) });
      last = m.index + m[0].length;
    }
    if (last < line.length) segs.push({ text: line.slice(last) });
    if (segs.length === 0) segs.push({ text: " " });
    return segs;
  });
}

// ---- tier styling -----------------------------------------------------------

const CASE_TIERS: { id: "all" | "easy" | "medium" | "hard"; label: string }[] = [
  { id: "all", label: "All tiers" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

const TIER_BADGE: Record<string, string> = {
  easy: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  medium: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  hard: "border-rose-400/40 bg-rose-400/10 text-rose-300",
};

// ---- one case card ----------------------------------------------------------

function CaseFileCard({ cs, onSolved }: { cs: CaseStudy; onSolved?: () => void }) {
  const solvedBefore = useProgress((s) => s.xpEvents[`case:${cs.id}`] !== undefined);
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [armed, setArmed] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);

  const bank = useMemo(() => shuffledBank(cs), [cs]);
  const lines = useMemo(() => parseTemplate(cs.template), [cs]);
  const total = cs.slots.length;
  const filledCount = cs.slots.filter((s, i) => placed[i + 1] !== undefined).length;
  const inBank = bank.filter((chip) => !Object.values(placed).includes(chip));
  const allFilled = filledCount === total;
  const verdicts = checked ? cs.slots.map((s, i) => placed[i + 1] === s.answer) : null;
  const allCorrect = verdicts !== null && verdicts.every(Boolean);
  const isClosed = solved || solvedBefore;

  function place(slotNum: number) {
    if (isClosed && solved) return;
    if (armed !== null) {
      setPlaced((p) => ({ ...p, [slotNum]: armed }));
      setArmed(null);
      setChecked(false);
    } else if (placed[slotNum] !== undefined) {
      setPlaced((p) => {
        const next = { ...p };
        delete next[slotNum];
        return next;
      });
      setChecked(false);
    }
  }

  function check() {
    if (!allFilled || checked) return;
    setChecked(true);
    const ok = cs.slots.every((s, i) => placed[i + 1] === s.answer);
    if (ok) {
      setSolved(true);
      const store = useProgress.getState();
      const awarded = store.awardXp(`case:${cs.id}`, CASE_XP);
      if (awarded) {
        celebrate({ kind: "xp", title: `+${CASE_XP} XP`, sub: "Case closed — query rebuilt correctly" });
      }
      onSolved?.();
    }
  }

  function reset() {
    setPlaced({});
    setArmed(null);
    setChecked(false);
    setSolved(false);
  }

  return (
    <div className="space-y-4">
      {/* memo */}
      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            {cs.id.replace("cs-", "CS-")}
          </span>
          <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {caseUniverseLabel(cs.universe)}
          </span>
          <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {caseTopicLabel(cs.topic)}
          </span>
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", TIER_BADGE[cs.tier])}>
            {cs.tier}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-zinc-600">{total} slots</span>
          {isClosed && (
            <span className="ml-auto flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
              <Stamp className="h-3 w-3" /> closed
            </span>
          )}
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Interoffice memo</p>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-300"><RichNodes text={cs.brief} /></p>
        <div className="mt-3 flex items-start gap-2 rounded-md border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-2.5">
          <Crosshair className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <p className="text-xs leading-relaxed text-zinc-200"><RichNodes text={cs.ask} /></p>
        </div>
      </div>

      {/* rebuild surface */}
      <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Rebuild the query</p>
        <div className="mt-3 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-900/50 p-3.5">
          <div className="min-w-max font-mono text-[13px] leading-8">
            {lines.map((line, li) => (
              <div key={li} className="flex flex-wrap items-center gap-y-1 whitespace-pre">
                {line.map((seg, si) =>
                  "text" in seg ? (
                    <span key={si}><SqlNodes text={seg.text} /></span>
                  ) : (
                    (() => {
                      const idx = seg.slot;
                      const chip = placed[idx];
                      const v = verdicts !== null ? verdicts[idx - 1] : null;
                      return (
                        <button
                          key={si}
                          onClick={() => place(idx)}
                          aria-label={`Slot ${idx}${chip ? `: filled with ${chip}` : ", empty"}`}
                          className={cn(
                            "mx-1 inline-flex h-7 items-center gap-1.5 rounded border px-2 align-middle font-mono text-xs transition-all duration-150 active:scale-[0.97]",
                            chip === undefined
                              ? "border-dashed border-zinc-600 bg-zinc-900/80 text-zinc-500 hover:border-emerald-400/60 hover:text-zinc-300"
                              : v === null
                                ? "border-solid border-zinc-600 bg-zinc-800 text-zinc-100 hover:border-rose-400/60"
                                : v
                                  ? "border-emerald-400/70 bg-emerald-400/10 text-zinc-100"
                                  : "border-rose-400/70 bg-rose-400/10 text-zinc-100",
                            armed !== null && chip === undefined && "border-emerald-400/80 bg-emerald-400/[0.08]",
                          )}
                        >
                          <span className={cn("text-[9px] tnum", v === true ? "text-emerald-400" : v === false ? "text-rose-400" : "text-zinc-500")}>
                            {idx}
                          </span>
                          {chip !== undefined ? (
                            <>
                              <span className={chipTone(chip)}>{chip}</span>
                              {v === true && <Check className="h-3 w-3 text-emerald-400" />}
                              {v === false && <X className="h-3 w-3 text-rose-400" />}
                            </>
                          ) : (
                            <span className="text-zinc-600">▁▁▁</span>
                          )}
                        </button>
                      );
                    })()
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        {/* bank */}
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Chip bank — tap a chip, then its slot
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {inBank.map((chip) => (
            <button
              key={chip}
              onClick={() => setArmed((a) => (a === chip ? null : chip))}
              className={cn(
                "rounded border px-2.5 py-1.5 font-mono text-xs transition-all duration-150 active:scale-[0.97]",
                armed === chip
                  ? "border-emerald-400 bg-emerald-400/15 text-zinc-50 shadow-[0_0_0_1px_rgba(52,211,153,0.35)]"
                  : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800",
              )}
            >
              <span className={armed === chip ? "text-zinc-50" : chipTone(chip)}>{chip}</span>
            </button>
          ))}
          {inBank.length === 0 && <span className="text-xs text-zinc-600">Bank empty — every chip is placed.</span>}
        </div>

        {/* actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={check}
            disabled={!allFilled || checked || solved}
            className={cn(
              "btn-glow rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[#052e1c] transition-colors hover:bg-emerald-300",
              (!allFilled || checked || solved) && "cursor-not-allowed opacity-40",
            )}
          >
            Check rebuild
          </button>
          <button
            onClick={reset}
            className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <span className="tnum ml-auto text-[11px] text-zinc-600">
            {filledCount}/{total} placed
          </span>
        </div>

        {/* per-slot coaching */}
        {verdicts !== null && !allCorrect && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="mt-3.5 space-y-2"
          >
            {cs.slots.map((s, i) =>
              verdicts[i] ? null : (
                <div key={i} className="rounded-md border border-amber-400/30 bg-amber-400/[0.06] px-3.5 py-3 text-xs leading-relaxed text-zinc-300">
                  <span className="font-semibold text-amber-300">Slot {i + 1} · {s.label}: </span>
                  <RichNodes text={s.why} />
                </div>
              ),
            )}
            <p className="text-[11px] text-zinc-500">Swap the flagged chips and check again — the query itself stays put.</p>
          </motion.div>
        )}

        {/* verdict */}
        {allCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="mt-3.5 flex items-center gap-2.5 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-3"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">Rebuilt correctly — case closed.</p>
              <p className="text-[11px] text-zinc-400">
                {solvedBefore && !solved ? "Solved before — replay, no extra XP." : `+${CASE_XP} XP added to the ledger.`}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* walkthrough */}
      {isClosed && (
        <div className="sheen rounded-lg border border-violet-400/25 bg-violet-400/[0.05] p-4 sm:p-5">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">
            <BookOpen className="h-3.5 w-3.5" /> Walkthrough
          </p>
          <div className="mt-2 space-y-2 text-sm leading-relaxed text-zinc-300">
            <RichNodes text={cs.walkthrough} />
          </div>
        </div>
      )}
    </div>
  );
}

// ---- deck -------------------------------------------------------------------

export function CaseFiles() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const [topic, setTopic] = useState<string>("all");
  const [tier, setTier] = useState<string>("all");
  const [idx, setIdx] = useState(0);

  const filtered = useMemo(
    () =>
      CASES.filter(
        (c) =>
          (topic === "all" || c.topic === topic) &&
          (tier === "all" || c.tier === tier),
      ),
    [topic, tier],
  );
  const solvedCount = useMemo(
    () => CASES.reduce((n, c) => n + (xpEvents[`case:${c.id}`] !== undefined ? 1 : 0), 0),
    [xpEvents],
  );
  const safeIdx = Math.min(idx, Math.max(0, filtered.length - 1));
  const current = filtered.length > 0 ? filtered[safeIdx] : null;

  function jump(delta: number) {
    setIdx((i) => Math.min(Math.max(0, i + delta), Math.max(0, filtered.length - 1)));
  }

  return (
    <div className="bg-ambient mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <FileStack className="h-3.5 w-3.5" /> {CASES.length} CASE FILES · MODULES 1–
        {Math.max(
          ...[...new Set(CASES.map((c) => CASE_TOPICS.find((t) => t.id === c.topic)?.lessonNum))]
            .filter((n): n is number => typeof n === "number")
            .map((n) => moduleOfLesson(`lesson-${String(n).padStart(2, "0")}`).num),
        )}{" "}
        TOOLKIT
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">The case file drawer</h1>
      <p className="mt-3 text-[15px] leading-7 text-zinc-400">
        Real memos from stakeholders, real queries with the figures and keywords pulled out. Rebuild each
        query from the chip bank — every wrong chip gets coached, every closed case pays {CASE_XP} XP.
      </p>

      {/* progress */}
      <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-300">Cases closed</span>
          <span className="tnum text-zinc-500">{solvedCount} / {CASES.length}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${CASES.length ? (solvedCount / CASES.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* tier filter */}
      <div className="mt-5 flex gap-1.5 overflow-x-auto pb-1">
        {CASE_TIERS.map((t) => {
          const count =
            t.id === "all" ? CASES.length : CASES.filter((c) => c.tier === t.id).length;
          const active = tier === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTier(t.id);
                setIdx(0);
              }}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? t.id === "hard"
                    ? "border-rose-400/60 bg-rose-400/10 text-rose-300"
                    : t.id === "medium"
                      ? "border-amber-400/60 bg-amber-400/10 text-amber-300"
                      : t.id === "easy"
                        ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                        : "border-zinc-500 bg-zinc-900 text-zinc-100"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
              )}
            >
              {t.label} <span className="tnum text-[10px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* topic filter */}
      <div className="mt-5 flex gap-1.5 overflow-x-auto pb-1">
        {[{ id: "all", label: "All" }, ...CASE_TOPICS].map((t) => {
          const count = t.id === "all" ? CASES.length : CASES.filter((c) => c.topic === t.id).length;
          const active = topic === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTopic(t.id);
                setIdx(0);
              }}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
              )}
            >
              {t.label} <span className="tnum text-[10px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* pager */}
      {current && (
        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            onClick={() => jump(-1)}
            disabled={safeIdx === 0}
            className={cn(
              "flex items-center gap-1 rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-900",
              safeIdx === 0 && "cursor-not-allowed opacity-40",
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>
          <span className="tnum text-[11px] uppercase tracking-wider text-zinc-600">
            Case {safeIdx + 1} of {filtered.length}
          </span>
          <button
            onClick={() => jump(1)}
            disabled={safeIdx >= filtered.length - 1}
            className={cn(
              "flex items-center gap-1 rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-900",
              safeIdx >= filtered.length - 1 && "cursor-not-allowed opacity-40",
            )}
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* current card */}
      <div className="mt-4">
        {current ? (
          <CaseFileCard key={current.id} cs={current} />
        ) : (
          <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-500">
            No case files match this filter yet.
          </div>
        )}
      </div>

      {/* next-case CTA */}
      {current && filtered.length > 1 && (
        <button
          onClick={() => jump(1)}
          className="btn-quiet mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-800 px-4 py-2.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
        >
          Next case <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
