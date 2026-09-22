"use client";

// Landing "Try it live" — a real read-only SQL sandbox on the storefront
// database. Type a query (or tap a starter): it runs on live SQLite after a
// short debounce, and an animated clause-stage pipeline shows how the row
// count changes at every step — FROM+JOINs → WHERE → GROUP BY buckets →
// HAVING → the final result. Read-only by contract (SELECT/WITH/VALUES),
// executed inside an always-rolled-back transaction server-side.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, Loader2, RotateCw } from "lucide-react";
import { SqlEditor, type ClauseId } from "@/components/sql-editor";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryPlayback, type StageSamples } from "@/components/landing/query-playback";
import { SchemaPanel, type SandboxTable } from "@/components/landing/schema-panel";
import { ComparePanel, type CompareSnapshot } from "@/components/landing/compare-panel";
import { buildTree, PlanLegend, PlanTreeNode } from "@/components/plan-view";
import type { PuzzleVerdict } from "@/lib/landing-puzzles";
import type { PlanRow } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

interface Stage {
  id: "base" | "where" | "group" | "having";
  rows: number;
}

interface SandboxSource {
  name: string;
  rows: number;
}

interface SandboxResult {
  ok: boolean;
  error?: string;
  hint?: string;
  columns?: string[];
  rows?: unknown[][];
  rowCount?: number;
  truncated?: boolean;
  durationMs?: number;
  stages?: Stage[];
  samples?: StageSamples;
  tables?: SandboxTable[];
  sources?: SandboxSource[];
  /** SQLite's own execution recipe — how the engine will run this query. */
  plan?: PlanRow[];
  /** fix-the-query verdict — present while a puzzle is active and the run succeeded. */
  puzzle?: PuzzleVerdict;
}

/** The public puzzle shape served by /api/landing-puzzles — no answers. */
interface PublicPuzzle {
  id: string;
  emoji: string;
  title: string;
  question: string;
  broken: string;
  hints: string[];
}

/** Every clause keyword with its position, sorted by where it appears —
 *  the bridge between caret, editor keyword glow, playback frames and the
 *  schema map. A clause OWNS the whole region from its keyword to the next
 *  clause's keyword, so "caret inside WHERE …" lights up WHERE, not just
 *  the exact letters W-H-E-R-E. */
const CLAUSE_RES: Array<[ClauseId, RegExp]> = [
  ["base", /\b(?:from|join|inner|left|right|full|outer|cross|on|using)\b/gi],
  ["where", /\bwhere\b/gi],
  ["group", /\bgroup\s+by\b/gi],
  ["having", /\bhaving\b/gi],
  ["result", /\b(?:select|distinct|order\s+by|limit|offset)\b/gi],
];

function clauseAt(sql: string, pos: number): ClauseId | null {
  const marks: Array<{ index: number; id: ClauseId }> = [];
  for (const [id, re] of CLAUSE_RES) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(sql)) !== null) marks.push({ index: m.index, id });
  }
  marks.sort((a, b) => a.index - b.index);
  // The clause whose keyword appears last at-or-before the caret owns it —
  // SELECT's region starts at its keyword, so a caret in the projection
  // list lands on "result" (SELECT shapes the output, it filters nothing).
  let owner: ClauseId | null = null;
  for (const mk of marks) {
    if (mk.index <= pos) owner = mk.id;
    else break;
  }
  return owner;
}

// Starter questions — each chip is phrased as the business question it
// answers; tapping it loads the real query that answers it.
const QUESTIONS: Array<{ q: string; emoji: string; sql: string }> = [
  {
    q: "Which order status is most common?",
    emoji: "🧾",
    sql: "SELECT status, COUNT(*) AS orders\nFROM orders\nGROUP BY status\nORDER BY orders DESC;",
  },
  {
    q: "Who spends the most?",
    emoji: "🏆",
    sql: "SELECT c.name, COUNT(o.id) AS orders, ROUND(SUM(o.total), 2) AS spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY spent DESC\nLIMIT 5;",
  },
  {
    q: "What sits on the premium shelf?",
    emoji: "💎",
    sql: "SELECT name, price, category\nFROM products\nWHERE price >= 100\nORDER BY price DESC;",
  },
  {
    q: "Who has never been refunded?",
    emoji: "🛡️",
    sql: "SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nLEFT JOIN refunds r ON r.order_id = o.id\nGROUP BY c.id\nHAVING COUNT(r.id) = 0;",
  },
  {
    q: "Which product shelf earns the most?",
    emoji: "💰",
    sql: "SELECT p.category, ROUND(SUM(oi.unit_price * oi.quantity), 2) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nORDER BY revenue DESC;",
  },
];

/** The guide — what's on screen and how to drive it. Every interactive
 *  element of the sandbox gets one plain-words line. Collapsible so it
 *  never traps a returning user, open by default so a first-timer is
 *  never lost. */
const GUIDE_ITEMS: Array<{ icon: string; title: string; body: string }> = [
  {
    icon: "⌨️",
    title: "It runs as you type",
    body: "Real SQLite executes your query ½s after you stop typing (or hit ⌘/Ctrl+Enter). Read-only — nothing can break.",
  },
  {
    icon: "🧾",
    title: "Starter questions",
    body: "Tap a chip to load a real query that answers it — then bend it: change a number, a column, a condition.",
  },
  {
    icon: "🎬",
    title: "The playback strip",
    body: "Each frame is one stage of YOUR query, measured live. Dots are rows, hollow falling dots were filtered away, and the chips are actual sampled rows.",
  },
  {
    icon: "🖱️",
    title: "Caret spotlight",
    body: "Click inside any clause — WHERE, JOIN, GROUP BY — and its keywords, stage frame and map tables all light up. Hover a frame for a plain-words explainer.",
  },
  {
    icon: "⚖️",
    title: "Pin & compare",
    body: "📌 Pin a result as A, change the query, and the diff shows exactly which rows appeared (blue) or vanished (red). Classic move: flip JOIN ↔ LEFT JOIN.",
  },
  {
    icon: "🗺️",
    title: "The living map",
    body: "Arrows are real foreign keys, glowing tables are the ones your query reads. Click any table or column to drop it into your query at the cursor.",
  },
  {
    icon: "🌳",
    title: "The plan tree",
    body: "Under the playback: how SQLite will actually run your query — which tables it scans, which indexes it jumps through. Watch it reshape as you edit.",
  },
];

function SandboxGuide({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/60">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 font-mono text-[11px] text-zinc-300">
          <span aria-hidden className="emoji-bob">
            🗺️
          </span>
          how this sandbox works — seven things worth knowing
        </span>
        <span className="rounded-full border border-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300">
          {open ? "hide ↑" : "show ↓"}
        </span>
      </button>
      {open && (
        <div className="grid gap-2 border-t border-zinc-800/80 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDE_ITEMS.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-2.5"
            >
              <p className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-200">
                <span aria-hidden>{g.icon}</span>
                {g.title}
              </p>
              <p className="mt-1 text-[11px] leading-4.5 text-zinc-500">{g.body}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/** The plan tree, sandbox edition — compact nodes, short explainer, collapsible.
 *  The full guided tour lives in the Playground's Plan tab. */
function SandboxPlan({ rows }: { rows: PlanRow[] }) {
  const [open, setOpen] = useState(true);
  const tree = useMemo(() => buildTree(rows), [rows]);
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title="EXPLAIN QUERY PLAN — the moves SQLite will make to run your query"
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 font-mono text-[11px] text-zinc-300">
          <span aria-hidden className="emoji-bob">
            🌳
          </span>
          how SQLite runs it — the plan tree, live for your query
        </span>
        <span className="rounded-full border border-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300">
          {open ? "hide ↑" : "show ↓"}
        </span>
      </button>
      {open && (
        <div className="border-t border-zinc-800/80 p-3">
          <p className="text-[11px] leading-4.5 text-zinc-500">
            Each node is one move the engine will make — leaves are reads, parents consume their
            children&apos;s output.{" "}
            <span className="text-amber-400/90">amber SCAN</span> reads a whole table (watch for it
            on big tables),{" "}
            <span className="text-emerald-400/90">blue SEARCH</span> uses an index.
          </p>
          <div className="mt-2">
            <PlanLegend compact />
          </div>
          <div className="mt-2.5 space-y-1.5">
            {tree.map((r) => (
              <PlanTreeNode key={r.id} node={r} depth={0} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** One-shot emoji burst — the solve moment. Keyed by mount, animates once. */
function PuzzleBurst() {
  const bits = ["🎉", "✨", "🧩", "💫", "✨", "🎉"];
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 0],
            x: `${(i - 2.5) * 26}px`,
            y: `${-14 - (i % 3) * 12}px`,
            scale: 1 + (i % 2) * 0.35,
            rotate: (i - 2.5) * 14,
          }}
          transition={{ duration: 1.1, delay: i * 0.06, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 text-sm"
        >
          {b}
        </motion.span>
      ))}
    </span>
  );
}

function isNumeric(v: unknown): boolean {
  return typeof v === "number" && Number.isFinite(v);
}

/** One fix-the-query puzzle card — the strip (normal) and the bar popover
 *  (focus) render the same thing. */
function PuzzleCard({
  p,
  active,
  solved,
  onClick,
}: {
  p: PublicPuzzle;
  active: boolean;
  solved: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title="loads the broken query — fix it until the checker agrees"
      className={cn(
        "rounded-lg border p-2.5 text-left transition-colors",
        active
          ? "border-amber-400/60 bg-amber-400/[0.07]"
          : solved
            ? "border-emerald-400/40 bg-emerald-400/[0.05] hover:border-emerald-400/70"
            : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className={cn("font-mono text-[11px]", solved ? "text-emerald-300" : "text-zinc-200")}>
          <span aria-hidden className="mr-1">
            {p.emoji}
          </span>
          {p.title}
        </span>
        {solved && (
          <span aria-hidden className="emoji-bob text-[11px]" title="solved — the badge persists">
            ✓
          </span>
        )}
      </span>
      <span className="mt-1 block text-[11px] leading-4.5 text-zinc-500">{p.question}</span>
      <span
        className={cn(
          "mt-1.5 block font-mono text-[10px]",
          solved ? "text-emerald-400/80" : "text-amber-300/80",
        )}
      >
        {solved ? "✓ solved — play it again" : "load the broken query →"}
      </span>
    </button>
  );
}

export function LiveSandbox() {
  const [sql, setSql] = useState(QUESTIONS[0].sql);
  const [res, setRes] = useState<SandboxResult | null>(null);
  const [pending, setPending] = useState(false);
  const [runId, setRunId] = useState(0);
  const [knownTables, setKnownTables] = useState<SandboxTable[]>([]);
  // last successful run's sources — drives the "tables your query touches"
  // glow in the schema map. Kept across failed runs (that's when you need
  // the map most) just like knownTables.
  const [lastSources, setLastSources] = useState<SandboxSource[]>([]);
  // clause focus — hover (playback frames) wins over caret position
  const [hoverClause, setHoverClause] = useState<ClauseId | null>(null);
  const [caretPos, setCaretPos] = useState<number | null>(null);
  // A/B compare — the pinned "A" snapshot
  const [pinned, setPinned] = useState<CompareSnapshot | null>(null);
  // the on-screen guide — open for first-timers, collapsible forever after
  const [guideOpen, setGuideOpen] = useState(true);
  // focus mode — the whole sandbox as a one-screen workspace. The editor is
  // the main highlight; guide, starter chips and puzzles tuck into the bar.
  const [focusMode, setFocusMode] = useState(false);
  const [centerTab, setCenterTab] = useState<"result" | "plan" | "compare">("result");
  // fix-the-query puzzles — public list, active one, progressive hints, solved set
  const [puzzles, setPuzzles] = useState<PublicPuzzle[]>([]);
  const [activePuzzleId, setActivePuzzleId] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({});
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const activePuzzleRef = useRef<string | null>(null);
  const editorTaRef = useRef<HTMLTextAreaElement | null>(null);
  const seqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  // puzzles + past solves — answers stay server-side; badges persist locally
  useEffect(() => {
    fetch("/api/landing-puzzles")
      .then((r) => r.json())
      .then((d: { puzzles?: PublicPuzzle[] }) => {
        if (Array.isArray(d.puzzles)) setPuzzles(d.puzzles);
      })
      .catch(() => {});
    try {
      const raw = localStorage.getItem("seeql-puzzles-solved");
      if (raw) setSolvedIds(JSON.parse(raw) as string[]);
    } catch {
      /* fresh start */
    }
  }, []);

  useEffect(() => {
    activePuzzleRef.current = activePuzzleId;
  }, [activePuzzleId]);

  // remembered focus mode — read after mount so SSR and first paint agree
  useEffect(() => {
    try {
      if (localStorage.getItem("seeql-focus") === "1") setFocusMode(true);
    } catch {
      /* private mode — focus just won't persist */
    }
  }, []);

  const markSolved = useCallback((id: string) => {
    setSolvedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem("seeql-puzzles-solved", JSON.stringify(next));
      } catch {
        /* private mode — badge just won't persist */
      }
      return next;
    });
  }, []);

  const run = useCallback(async (q: string) => {
    const seq = ++seqRef.current;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setPending(true);
    try {
      const r = await fetch("/api/landing-sandbox", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sql: q,
          ...(activePuzzleRef.current ? { puzzleId: activePuzzleRef.current } : {}),
        }),
        signal: ac.signal,
      });
      const j = (await r.json()) as SandboxResult;
      if (seq === seqRef.current) {
        setRes(j);
        // Cache the schema — error responses don't carry tables, and the
        // schema panel must survive (it's exactly what you need then).
        if (j.tables && j.tables.length > 0) setKnownTables(j.tables);
        if (j.ok) {
          setRunId((n) => n + 1);
          // A successful run OWNS the glow — even when it touches no known
          // tables (VALUES, scalar only): stale glow would read as "the map
          // doesn't follow my query". Only error responses keep the old map.
          setLastSources(j.sources ?? []);
        }
      }
    } catch (e) {
      if ((e as Error | undefined)?.name !== "AbortError" && seq === seqRef.current) {
        setRes({ ok: false, error: "Could not reach the sandbox." });
      }
    } finally {
      if (seq === seqRef.current) setPending(false);
    }
  }, []);

  // debounced auto-run — the sandbox is live, no button needed
  useEffect(() => {
    const t = window.setTimeout(() => void run(sql), 500);
    return () => window.clearTimeout(t);
  }, [sql, run]);

  // a solved verdict earns its badge (once)
  const verdict = res?.ok && res.puzzle && res.puzzle.id === activePuzzleId ? res.puzzle : null;
  useEffect(() => {
    if (verdict?.solved) markSolved(verdict.id);
  }, [verdict?.solved, verdict?.id, markSolved]);

  const stages = res?.ok ? (res.stages ?? []) : [];
  const tables = knownTables;
  const planRows = res?.ok ? (res.plan ?? []) : [];
  const planAvailable = planRows.length > 0;
  // a tab whose content vanished (plan cleared / A-B unpinned) falls back to result
  useEffect(() => {
    if (centerTab === "plan" && !planAvailable) setCenterTab("result");
    if (centerTab === "compare" && !pinned) setCenterTab("result");
  }, [centerTab, planAvailable, pinned]);

  const caretClause = useMemo(
    () => (caretPos === null ? null : clauseAt(sql, caretPos)),
    [sql, caretPos],
  );
  const focusClause = hoverClause ?? caretClause;

  const currentSnapshot: CompareSnapshot | null =
    res?.ok && res.columns
      ? { sql, columns: res.columns, rows: res.rows ?? [], rowCount: res.rowCount ?? 0 }
      : null;

  const hasLeftJoin = /\bleft\s+join\b/i.test(sql);
  const hasJoin = /\bjoin\b/i.test(sql);
  const flipLabel = hasLeftJoin
    ? "⚖️ flip LEFT JOIN → INNER"
    : hasJoin
      ? "⚖️ flip JOIN → LEFT JOIN"
      : null;
  const flipJoin = () => {
    if (currentSnapshot) setPinned(currentSnapshot);
    setSql(
      hasLeftJoin
        ? sql.replace(/\bleft\s+join\b/i, "INNER JOIN")
        : sql.replace(/\bjoin\b/i, "LEFT JOIN"),
    );
  };
  const pinCurrent = () => {
    if (currentSnapshot) setPinned(currentSnapshot);
  };

  // fix-the-query — load the broken query, checker verifies every run
  const loadPuzzle = (p: PublicPuzzle) => {
    setActivePuzzleId(p.id);
    setSql(p.broken);
  };
  const leavePuzzle = () => setActivePuzzleId(null);

  // focus mode toggle — remembered like solved puzzles; entering scrolls the
  // workspace to the viewport top so the whole thing is one screen
  const setFocus = (v: boolean) => {
    setFocusMode(v);
    if (!v) setCenterTab("result");
    try {
      localStorage.setItem("seeql-focus", v ? "1" : "0");
    } catch {
      /* private mode — just won't persist */
    }
  };
  const enterFocus = () => {
    setFocus(true);
    window.setTimeout(() => {
      document.getElementById("sandbox")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };
  const exitFocus = () => setFocus(false);
  const revealHint = (id: string, n: number) =>
    setRevealedHints((prev) => ({ ...prev, [id]: Math.max(prev[id] ?? 0, n) }));

  /** Drop a token (table/column name) at the caret — from the schema strip. */
  const insertToken = useCallback(
    (token: string) => {
      const ta = editorTaRef.current;
      if (!ta) {
        setSql((prev) => `${prev}${/[\s(]$/.test(prev) || prev === "" ? "" : " "}${token}`);
        return;
      }
      setSql((prev) => {
        const start = ta.selectionStart ?? prev.length;
        const end = ta.selectionEnd ?? start;
        const before = prev.slice(0, start);
        const sep = before === "" || /[\s(,.\n]$/.test(before) ? "" : " ";
        const next = `${before}${sep}${token}${prev.slice(end)}`;
        const caret = before.length + sep.length + token.length;
        requestAnimationFrame(() => {
          ta.focus();
          ta.selectionStart = ta.selectionEnd = caret;
        });
        return next;
      });
    },
    [],
  );

  // ── shared blocks — defined once, rendered by both layouts ──

  const errorBanner = (
    <AnimatePresence>
      {res && !res.ok && res.error && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3"
        >
          <p className="font-mono text-xs text-rose-300">
            <span aria-hidden className="emoji-wiggle mr-1.5">
              🙃
            </span>
            {res.error}
          </p>
          {res.hint && (
            <p className="mt-1 text-xs text-rose-200/60">
              <span aria-hidden className="mr-1">
                💡
              </span>
              {res.hint}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const puzzleStatus = activePuzzleId
    ? (() => {
        const p = puzzles.find((x) => x.id === activePuzzleId);
        if (!p) return null;
        const solved = solvedIds.includes(p.id);
        const shown = revealedHints[p.id] ?? 0;
        return (
          <div
            className={cn(
              "relative mt-3 overflow-hidden rounded-xl border p-3",
              verdict?.solved
                ? "border-emerald-400/50 bg-emerald-400/[0.06]"
                : "border-amber-400/30 bg-amber-400/[0.04]",
            )}
          >
            {verdict?.solved && <PuzzleBurst />}
            <div className="flex items-start justify-between gap-2">
              <p className="font-mono text-[11px] text-zinc-300">
                <span aria-hidden className="emoji-wiggle mr-1.5">
                  🧩
                </span>
                {p.title}
                {solved && !verdict?.solved && (
                  <span className="ml-1.5 text-emerald-400/80">· solved before ✓</span>
                )}
              </p>
              <button
                onClick={leavePuzzle}
                title="leave the puzzle — back to free exploring"
                className="rounded-full border border-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
              >
                ✕ leave
              </button>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-zinc-400">{p.question}</p>

            {/* live verdict — updates with every run */}
            <div aria-live="polite">
              {verdict?.solved ? (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-2.5"
                >
                  <p className="font-mono text-[11px] font-medium text-emerald-300">
                    🎉 solved — that&apos;s the answer
                  </p>
                  <p className="mt-1 text-[11px] leading-4.5 text-emerald-100/70">{verdict.lesson}</p>
                </motion.div>
              ) : verdict && !verdict.solved ? (
                <p className="mt-2.5 rounded-lg border border-amber-400/30 bg-amber-400/[0.06] p-2.5 font-mono text-[11px] leading-4.5 text-amber-200/90">
                  <span aria-hidden className="mr-1.5">
                    🔍
                  </span>
                  {verdict.feedback}
                </p>
              ) : (
                <p className="mt-2.5 font-mono text-[10px] text-zinc-600">
                  🔍 checker is on — it verifies your result after every run
                </p>
              )}
            </div>

            {/* hints — progressive, tap to reveal */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {p.hints.map((h, i) => {
                const open = shown > i;
                return (
                  <span key={i} className="inline-flex max-w-full flex-col gap-1">
                    {!open ? (
                      <button
                        onClick={() => revealHint(p.id, i + 1)}
                        className="rounded-full border border-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400 transition-colors hover:border-amber-400/50 hover:text-amber-200"
                      >
                        💡 hint {i + 1}
                      </button>
                    ) : (
                      <span className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-[11px] leading-4.5 text-zinc-300">
                        <span aria-hidden className="mr-1">
                          💡
                        </span>
                        {h}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })()
    : null;

  /** The result card — fill=true stretches it to its container (focus mode's
   *  tab); fill=false keeps the natural max-h-340 grid card (normal mode). */
  const resultCard = (fill: boolean) => (
    <div
      className={cn(
        "sheen overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950",
        fill && "flex h-full min-h-0 flex-col",
      )}
    >
      {/* result toolbar — pin + flip feed the A/B compare */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 px-3.5 py-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          result
          {res?.ok ? (
            <span className="tnum ml-1.5 normal-case text-zinc-600">
              {(res.rowCount ?? 0).toLocaleString()} rows
            </span>
          ) : null}
        </p>
        <div className="flex items-center gap-1.5">
          {flipLabel && (
            <button
              onClick={flipJoin}
              title={
                hasLeftJoin
                  ? "swap back to INNER JOIN (pins A first)"
                  : "pin this result, then swap to LEFT JOIN"
              }
              className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] text-amber-300 transition-colors hover:border-amber-400/60"
            >
              {flipLabel}
            </button>
          )}
          {currentSnapshot && (
            <button
              onClick={pinCurrent}
              title="pin this result as A — the next runs diff against it"
              className={cn(
                "rounded-full border px-2 py-0.5 font-mono text-[10px] transition-colors",
                pinned?.sql === currentSnapshot.sql
                  ? "border-amber-400/60 bg-amber-400/15 text-amber-200"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
              )}
            >
              {pinned?.sql === currentSnapshot.sql ? "📌 A pinned" : "📌 pin as A"}
            </button>
          )}
        </div>
      </div>
      {res?.ok && res.columns && res.columns.length > 0 ? (
        <div className={fill ? "min-h-0 flex-1 overflow-auto" : "max-h-[340px] overflow-auto"}>
          <table className="w-full border-collapse text-left text-[13px]">
            <thead className="sticky top-0 z-10 bg-zinc-900">
              <tr>
                {res.columns.map((c) => (
                  <th
                    key={c}
                    className="border-b border-zinc-800 px-3.5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-400"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(res.rows ?? []).map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-zinc-950" : "bg-zinc-900/40"}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={cn(
                        "border-t border-zinc-800/60 px-3.5 py-2 font-mono text-zinc-200",
                        isNumeric(cell) && "tnum text-right",
                        cell === null && "text-zinc-600 italic",
                      )}
                    >
                      {cell === null ? "NULL" : String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
              {(res.rows ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={res.columns.length}
                    className="px-3.5 py-8 text-center text-sm text-zinc-500"
                  >
                    <span aria-hidden className="mr-1.5">
                      🫥
                    </span>
                    The query ran fine — it just matched nothing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center justify-center px-6 text-center",
            fill ? "min-h-0 flex-1" : "h-[340px]",
          )}
        >
          {res?.ok ? (
            <p className="text-sm text-zinc-500">No columns returned.</p>
          ) : res && !res.ok ? (
            <p className="text-sm text-zinc-500">Fix the query to see results here.</p>
          ) : (
            <p className="flex items-center gap-2 text-sm text-zinc-500">
              <RotateCw className="h-3.5 w-3.5 animate-spin" /> waiting for the first run…
            </p>
          )}
        </div>
      )}
      {res?.ok && res.truncated && (
        <p className="border-t border-zinc-800 px-3.5 py-2 font-mono text-[11px] text-zinc-500">
          showing first {(res.rows ?? []).length.toLocaleString()} of{" "}
          {(res.rowCount ?? 0).toLocaleString()} rows — the Playground shows all
        </p>
      )}
    </div>
  );

  const playbackBlock = (compact: boolean) =>
    res?.ok ? (
      <QueryPlayback
        compact={compact}
        stages={stages}
        sources={res.sources ?? []}
        columns={res.columns ?? []}
        rowCount={res.rowCount ?? 0}
        durationMs={res.durationMs}
        runId={runId}
        samples={res.samples}
        resultRows={(res.rows ?? []).slice(0, 4)}
        focusClause={focusClause}
        onFocusClause={setHoverClause}
      />
    ) : res && !res.ok ? (
      <p className="rounded-lg border border-dashed border-zinc-800 px-3 py-3 font-mono text-[11px] text-zinc-600">
        fix the query and the playback returns — it shows every stage your data just flowed through
      </p>
    ) : null;

  const schemaPanel = (compact: boolean) => (
    <SchemaPanel
      compact={compact}
      tables={tables}
      onInsert={insertToken}
      activeTables={lastSources.map((s) => s.name)}
      focusTables={focusClause && focusClause !== "result" ? lastSources.map((s) => s.name) : []}
    />
  );

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        focusMode ? "max-w-[1500px] py-3" : "max-w-6xl py-20",
      )}
    >
      {focusMode ? (
        <div className="flex items-center gap-2">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-emerald-400" />
            live sandbox
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="hidden shrink-0 font-mono text-[11px] text-zinc-600 sm:inline">
              try:
            </span>
            {QUESTIONS.map((s) => (
              <button
                key={s.q}
                onClick={() => {
                  setActivePuzzleId(null);
                  setSql(s.sql);
                }}
                title="loads the query that answers this"
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  sql === s.sql
                    ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
                )}
              >
                <span aria-hidden className="mr-1">
                  {s.emoji}
                </span>
                {s.q}
              </button>
            ))}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button
                title="fix-the-query puzzles — a broken query, a question, a live checker"
                className="shrink-0 rounded-full border border-zinc-800 px-2.5 py-1 font-mono text-[11px] text-zinc-400 transition-colors hover:border-amber-400/50 hover:text-amber-200"
              >
                {puzzles.length > 0 ? `🧩 ${solvedIds.length}/${puzzles.length}` : "🧩 puzzles"}
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-[430px] border-zinc-800 bg-zinc-950 p-3">
              <p className="flex items-center justify-between gap-2 font-mono text-[11px] text-zinc-300">
                <span>
                  <span aria-hidden className="emoji-wiggle mr-1.5">
                    🧩
                  </span>
                  fix the query — little bugs to squash
                </span>
                <span className="tnum text-[10px] text-zinc-600">
                  {solvedIds.length}/{puzzles.length} solved
                </span>
              </p>
              <div className="mt-2 grid max-h-[60vh] gap-2 overflow-y-auto">
                {puzzles.map((p) => (
                  <PuzzleCard
                    key={p.id}
                    p={p}
                    active={activePuzzleId === p.id}
                    solved={solvedIds.includes(p.id)}
                    onClick={() => loadPuzzle(p)}
                  />
                ))}
                {puzzles.length === 0 && (
                  <p className="py-3 text-center font-mono text-[11px] text-zinc-600">
                    meeting the puzzles…
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <button
                title="how this sandbox works — every element explained in plain words"
                className="shrink-0 rounded-full border border-zinc-800 px-2.5 py-1 font-mono text-[11px] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
              >
                📖 guide
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-[580px] border-zinc-800 bg-zinc-950 p-3">
              <p className="font-mono text-[11px] text-zinc-300">
                <span aria-hidden className="emoji-bob mr-1.5">
                  🗺️
                </span>
                how this sandbox works
              </p>
              <div className="mt-2 grid max-h-[60vh] gap-2 overflow-y-auto sm:grid-cols-2">
                {GUIDE_ITEMS.map((g) => (
                  <div key={g.title} className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-2.5">
                    <p className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-200">
                      <span aria-hidden>{g.icon}</span>
                      {g.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-4.5 text-zinc-500">{g.body}</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <button
            onClick={exitFocus}
            title="back to the normal page layout"
            className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 font-mono text-[11px] text-emerald-300 transition-colors hover:border-emerald-400/60"
          >
            ⤢<span className="hidden sm:inline">&nbsp;exit focus</span>
          </button>
        </div>
      ) : (
        <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live sandbox
          </p>
          <h2 className="font-display mt-4 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
            Don&apos;t take our word for it. Query it.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            This is the real storefront database — the same one every lesson grades against. Pick a
            question below or write your own SELECT: it runs on live SQLite as you type, and the
            playback replays how each clause moves your rows — tables glow on the map, arrows carry
            the counts. Click any table or column to insert it at your cursor. Read-only, nothing to
            break.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="sheen hidden rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 font-mono text-[11px] text-zinc-500 sm:block">
            ⌘/Ctrl + Enter to run · auto-runs as you type
          </span>
          <button
            onClick={enterFocus}
            title="one screen, zero scrolling — editor, result, playback and the map in a single workspace"
            className="hidden rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-[11px] text-emerald-300 transition-colors hover:border-emerald-400/60 xl:inline-flex"
          >
            ⛶ focus mode
          </button>
        </div>
      </div>

      {/* the guide — every interactive element, explained in plain words */}
      <SandboxGuide open={guideOpen} onToggle={() => setGuideOpen((o) => !o)} />

      {/* guided questions — tap to load the query that answers it */}
      <div className="mt-6 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-600">
          <HelpCircle className="h-3 w-3" /> try answering:
        </span>
        {QUESTIONS.map((s) => (
          <button
            key={s.q}
            onClick={() => {
              setActivePuzzleId(null);
              setSql(s.sql);
            }}
            title="loads the query that answers this"
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              sql === s.sql
                ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
            )}
          >
            <span aria-hidden className="mr-1">
              {s.emoji}
            </span>
            {s.q}
          </button>
        ))}
      </div>

      {/* fix-the-query puzzles — a broken query, a question, a live checker */}
      {puzzles.length > 0 && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
              <span aria-hidden className="emoji-wiggle">
                🧩
              </span>
              fix the query — three little bugs to squash
            </p>
            <span className="tnum font-mono text-[10px] text-zinc-600">
              {solvedIds.length}/{puzzles.length} solved
            </span>
          </div>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
            {puzzles.map((p) => (
              <PuzzleCard
                key={p.id}
                p={p}
                active={activePuzzleId === p.id}
                solved={solvedIds.includes(p.id)}
                onClick={() => loadPuzzle(p)}
              />
            ))}
          </div>
        </div>
      )}
        </>
      )}

      {focusMode ? (
        <div className="mt-3 grid gap-3 xl:h-[calc(100vh-168px)] xl:min-h-[540px] xl:grid-cols-12 xl:grid-rows-[minmax(0,1fr)_auto]">
          {/* editor — the main highlight: leftmost, tallest, first */}
          <div className="flex min-h-0 flex-col xl:col-span-4">
            <SqlEditor
              value={sql}
              onChange={setSql}
              onVisualize={() => void run(sql)}
              editorRef={editorTaRef}
              className="h-[260px] shrink-0 xl:h-auto xl:min-h-0 xl:flex-1"
              activeClause={focusClause}
              onCaret={setCaretPos}
            />
            <div className="mt-2 min-h-0 space-y-2 xl:max-h-[46%] xl:overflow-y-auto">
              <div className="flex min-h-[34px] items-center">
                {pending && !res?.ok && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 font-mono text-[11px] text-zinc-500">
                    <Loader2 className="h-3 w-3 animate-spin" /> running…
                  </span>
                )}
              </div>
              {errorBanner}
              {puzzleStatus}
            </div>
          </div>

          {/* center — result / plan tree / A-B compare as tabs */}
          <div className="flex min-h-0 flex-col xl:col-span-4">
            <Tabs
              value={centerTab}
              onValueChange={(v) => setCenterTab(v as "result" | "plan" | "compare")}
              className="flex min-h-0 flex-1 flex-col gap-0"
            >
              <TabsList
                aria-label="sandbox views"
                className="h-8 w-full shrink-0 justify-start rounded-lg border border-zinc-800 bg-zinc-950 p-0.5"
              >
                <TabsTrigger
                  value="result"
                  className="h-7 flex-none gap-1 rounded-md px-2.5 font-mono text-[11px] shadow-none data-[state=active]:bg-emerald-400/15 data-[state=active]:text-emerald-300 data-[state=active]:shadow-none dark:data-[state=active]:text-emerald-300"
                >
                  ⌨ result
                </TabsTrigger>
                {planAvailable && (
                  <TabsTrigger
                    value="plan"
                    className="h-7 flex-none gap-1 rounded-md px-2.5 font-mono text-[11px] shadow-none data-[state=active]:bg-emerald-400/15 data-[state=active]:text-emerald-300 data-[state=active]:shadow-none dark:data-[state=active]:text-emerald-300"
                  >
                    🌳 plan
                  </TabsTrigger>
                )}
                {pinned && (
                  <TabsTrigger
                    value="compare"
                    className="h-7 flex-none gap-1 rounded-md px-2.5 font-mono text-[11px] shadow-none data-[state=active]:bg-emerald-400/15 data-[state=active]:text-emerald-300 data-[state=active]:shadow-none dark:data-[state=active]:text-emerald-300"
                  >
                    ⚖ A/B
                  </TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="result" className="mt-2 min-h-0 flex-1">
                {resultCard(true)}
              </TabsContent>
              {planAvailable && (
                <TabsContent value="plan" className="mt-2 min-h-0 flex-1 overflow-y-auto">
                  <SandboxPlan rows={planRows} />
                </TabsContent>
              )}
              {pinned && (
                <TabsContent value="compare" className="mt-2 min-h-0 flex-1 overflow-y-auto">
                  <ComparePanel
                    pinned={pinned}
                    current={currentSnapshot}
                    onUnpin={() => setPinned(null)}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* the living map — full-height column, map above its table cards */}
          <div className="min-h-0 xl:col-span-4 xl:row-span-2 xl:overflow-y-auto">
            {schemaPanel(true)}
          </div>

          {/* playback strip */}
          <div className="min-h-0 xl:col-span-8 xl:max-h-[250px] xl:overflow-y-auto">
            {playbackBlock(true)}
          </div>
        </div>
      ) : (
        <>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* editor */}
        <div className="lg:col-span-2">
          <SqlEditor
            value={sql}
            onChange={setSql}
            onVisualize={() => void run(sql)}
            editorRef={editorTaRef}
            className="h-[260px]"
            activeClause={focusClause}
            onCaret={setCaretPos}
          />
          {/* clause-focus hint — the editor, frames and map are one organism */}
          <p className="mt-1.5 hidden font-mono text-[10px] text-zinc-600 sm:block">
            🖱️ put your caret inside a clause — its stage, keywords and tables light up
          </p>
          {/* pending hint while the first run is in flight (playback lives below the grid) */}
          <div className="mt-3 flex min-h-[34px] items-center">
            {pending && !res?.ok && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 font-mono text-[11px] text-zinc-500">
                <Loader2 className="h-3 w-3 animate-spin" /> running…
              </span>
            )}
          </div>

          {/* error banner */}
          {errorBanner}

          {/* fix-the-query status — question, live verdict, progressive hints */}
          {puzzleStatus}
        </div>

        {/* results */}
        <div className="lg:col-span-3">
          {resultCard(false)}
        </div>
      </div>

      {/* query playback — how each clause moves the data, measured live */}
      <div className="mt-4">{playbackBlock(false)}</div>

      {/* plan tree — how SQLite will actually run this query */}
      {res?.ok && res.plan && res.plan.length > 0 && (
        <div className="mt-4">
          <SandboxPlan rows={res.plan} />
        </div>
      )}

      {/* A/B compare — pinned result vs the current run */}
      {pinned && (
        <div className="mt-4">
          <ComparePanel
            pinned={pinned}
            current={currentSnapshot}
            onUnpin={() => setPinned(null)}
          />
        </div>
      )}

      {/* schema panel — live ER map + grouped tables, click to insert */}
      <div className="mt-4">{schemaPanel(false)}</div>
        </>
      )}
    </div>
  );
}
