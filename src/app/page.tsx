"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { BloubBot } from "@/components/bloub/bloub-bot";
import {
  AlertTriangle,
  ArrowLeft,
  Braces,
  ChartColumn,
  Check,
  ClipboardList,
  Copy,
  Database,
  DatabaseZap,
  Eraser,
  Filter,
  GitMerge,
  GraduationCap,
  History,
  Link2,
  ListTree,
  Loader2,
  Network,
  Play,
  RotateCcw,
  Sigma,
  Table2,
  Timer,
  Trophy,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SqlEditor } from "@/components/sql-editor";
import { PipelineView } from "@/components/pipeline-view";
import { JoinsView } from "@/components/joins-view";
import { BreakdownView } from "@/components/breakdown-view";
import { ResultsView, WriteResultView } from "@/components/results-view";
import { PlanView } from "@/components/plan-view";
import { ParseTreeView } from "@/components/parse-tree-view";
import { SchemaView } from "@/components/schema-view";
import { ChartView } from "@/components/chart-view";
import { MissionBoard } from "@/components/mission-board";
import { QueryFlowSvg } from "@/components/query-flow-svg";
import { RowFunnel } from "@/components/row-funnel";
import { StageInspector } from "@/components/stage-inspector";
import { SampleGallery } from "@/components/sample-gallery";
import { clauseAtOffset, findClauses, spanOf, type ClauseKind } from "@/lib/sql-clauses";
import { Landing } from "@/components/landing";
import { LearnApp } from "@/components/learn/learn-app";
import { useProgress } from "@/lib/curriculum/progress";
import { MISSIONS } from "@/lib/missions";
import { LogoFull } from "@/components/brand";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { DEFAULT_SAMPLE, SAMPLE_QUERIES } from "@/lib/samples";
import { DIALECTS, type DialectName } from "@/lib/sql-types";
import type {
  ExecResponse,
  ExecResult,
  ParseError,
  ParseResult,
  QueryPlan,
} from "@/lib/sql-types";
import { cn } from "@/lib/utils";

const HISTORY_KEY = "sql-visualizer-history";
const HISTORY_MAX = 12;

function StatChip({
  icon: Icon,
  label,
  value,
  tone = "zinc",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone?: "zinc" | "emerald" | "amber" | "rose" | "violet" | "teal";
}) {
  const tones: Record<string, string> = {
    zinc: "border-zinc-700/70 bg-zinc-800/50 text-zinc-300",
    emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    amber: "border-amber-400/25 bg-amber-400/10 text-amber-200",
    rose: "border-rose-400/25 bg-rose-400/10 text-rose-200",
    violet: "border-violet-400/25 bg-violet-400/10 text-violet-200",
    teal: "border-teal-400/25 bg-teal-400/10 text-teal-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      <span className="font-mono font-bold">{value}</span>
    </span>
  );
}

function JsonView({ plan }: { plan: QueryPlan }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify({ ...plan, tree: undefined }, null, 2);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          The structured plan the visualizer derived from your query.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={copy}
          className="h-7 gap-1.5 border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy JSON"}
        </Button>
      </div>
      <pre className="thin-scrollbar max-h-[520px] overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 font-mono text-xs leading-relaxed text-zinc-300">
        {json}
      </pre>
    </div>
  );
}

type Mode = "landing" | "playground" | "learn";

function PlaygroundView({
  go,
  sharedSql,
  sharedDialect,
}: {
  go: (m: Mode) => void;
  /** SQL coming from a #playground?q=… share link — boots the editor with it. */
  sharedSql?: string | null;
  sharedDialect?: DialectName;
}) {
  const [sql, setSql] = useState(sharedSql ?? DEFAULT_SAMPLE.sql);
  const [dialect, setDialect] = useState<DialectName>(sharedDialect ?? DEFAULT_SAMPLE.dialect);
  const [sampleId, setSampleId] = useState<string>(sharedSql ? "" : DEFAULT_SAMPLE.id);
  const [copiedLink, setCopiedLink] = useState(false);
  const [plan, setPlan] = useState<ParseResult | null>(null);
  const [exec, setExec] = useState<ExecResponse | null>(null);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [resetting, setResetting] = useState(false);
  const [tableCounts, setTableCounts] = useState<Record<string, number> | null>(null);

  // live layer — the picture follows the text while it is being written
  const [livePlan, setLivePlan] = useState<ParseResult | null>(null);
  const [liveSql, setLiveSql] = useState("");
  const [liveError, setLiveError] = useState<ParseError | null>(null);
  const [ranSql, setRanSql] = useState("");
  const [caret, setCaret] = useState(0);
  const [hoverKind, setHoverKind] = useState<ClauseKind | null>(null);
  const [pinnedKind, setPinnedKind] = useState<ClauseKind | null>(null);
  const [dataVersion, setDataVersion] = useState(0); // bumped on DB reset
  // step inspector — which funnel stage's rows are open (null = closed)
  const [inspectKind, setInspectKind] = useState<ClauseKind | "out" | null>(null);
  // shared XP ledger — the Missions badge counts earned missions live
  const missionXp = useProgress((s) => s.xpEvents);

  // live table row counts — powers the FROM dot-field in the query flow strip
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((j) => {
        if (j?.ok) setTableCounts(j.counts as Record<string, number>);
      })
      .catch(() => {
        /* flow strip simply shows no dot-field */
      });
  }, []);

  // live parse — debounced so the flow strip, pipeline and stats redraw while
  // the query is being typed, without firing on every keystroke
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = sql.trim();
      if (!trimmed) {
        setLivePlan(null);
        setLiveSql("");
        setLiveError(null);
        return;
      }
      // raw text goes out so error offsets align with the editor content
      fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, dialect }),
      })
        .then((r) => r.json() as Promise<ParseResult>)
        .then((res) => {
          setLivePlan(res);
          setLiveSql(sql);
          setLiveError(res.ok ? null : res);
        })
        .catch(() => {
          /* transient network hiccup — keep the previous live state */
        });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [sql, dialect]);

  const loadHistory = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as string[]);
    } catch {
      // ignore malformed history
    }
  }, []);

  const pushHistory = useCallback((text: string) => {
    setHistory((prev) => {
      const next = [text, ...prev.filter((h) => h !== text)].slice(0, HISTORY_MAX);
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable
      }
      return next;
    });
  }, []);

  /** Parse + execute in parallel; both panels update independently. */
  const runAll = useCallback(
    async (sqlText: string, dia: DialectName) => {
      const trimmed = sqlText.trim();
      if (!trimmed) return;
      setRunning(true);
      try {
        const [parseRes, execRes] = await Promise.all([
          // raw text → parser shifts error offsets back into the editor text
          fetch("/api/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sql: sqlText, dialect: dia }),
          }).then((r) => r.json() as Promise<ParseResult>),
          fetch("/api/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sql: trimmed }),
          }).then((r) => r.json() as Promise<ExecResponse>),
        ]);
        setPlan(parseRes);
        setRanSql(sqlText);
        setExec(execRes);
        setLivePlan(parseRes);
        setLiveSql(sqlText);
        setLiveError(parseRes.ok ? null : parseRes);
        pushHistory(trimmed);
      } catch {
        setPlan((p) => p ?? { ok: false, error: "Could not reach the server. Please try again." });
        setExec({ ok: false, error: "Could not reach the server. Please try again." });
      } finally {
        setRunning(false);
      }
    },
    [pushHistory],
  );

  const parseOnly = useCallback(async (sqlText: string, dia: DialectName) => {
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlText, dialect: dia }),
      });
      const parsed = (await res.json()) as ParseResult;
      setLivePlan(parsed);
      setLiveSql(sqlText);
      setLiveError(parsed.ok ? null : parsed);
    } catch {
      setPlan({ ok: false, error: "Could not reach the parser. Please try again." });
    }
  }, []);

  // run the initial query once on load — a #playground?q=… share link boots
  // its own SQL, otherwise the default sample runs so the page shows live
  // diagrams + data immediately
  const bootSql = sharedSql ?? DEFAULT_SAMPLE.sql;
  const bootDialect = sharedDialect ?? DEFAULT_SAMPLE.dialect;
  useEffect(() => {
    loadHistory();
    runAll(bootSql, bootDialect);
  }, [loadHistory, runAll, bootSql, bootDialect]);

  /** Copy a link that reopens the playground with the current query loaded. */
  const shareLink = async () => {
    const params = new URLSearchParams({ q: sql });
    if (dialect !== DEFAULT_SAMPLE.dialect) params.set("d", dialect);
    const url = `${window.location.origin}${window.location.pathname}#playground?${params.toString()}`;
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      // clipboard API unavailable/denied — legacy fallback for restricted contexts
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1600);
    }
  };

  const onSampleChange = (id: string) => {
    const sample = SAMPLE_QUERIES.find((s) => s.id === id);
    if (!sample) return;
    setSampleId(id);
    setSql(sample.sql);
    setDialect(sample.dialect);
    runAll(sample.sql, sample.dialect);
  };

  const onDialectChange = (d: string) => {
    const next = d as DialectName;
    setDialect(next);
    parseOnly(sql, next);
  };

  const onHistoryPick = (text: string) => {
    setSampleId("");
    setSql(text);
    runAll(text, dialect);
  };

  const onSchemaPickTable = (table: string) => {
    const text = `SELECT *\nFROM ${table}\nLIMIT 5;`;
    setSampleId("");
    setSql(text);
    runAll(text, dialect);
  };

  const resetDatabase = async () => {
    if (!window.confirm("Restore the sample database to its original data?")) return;
    setResetting(true);
    try {
      await fetch("/api/reset", { method: "POST" });
      // the data under the same SQL changed — bump so the row funnel and the
      // FROM dot-field re-count against the fresh database
      setDataVersion((v) => v + 1);
      setTableCounts(null);
      fetch("/api/stats")
        .then((r) => r.json())
        .then((j) => {
          if (j?.ok) setTableCounts(j.counts as Record<string, number>);
        })
        .catch(() => {
          /* dot-field simply skips counts */
        });
      // re-run current query so the user sees fresh results
      await runAll(sql, dialect);
    } catch {
      // keep silent — the re-run will surface errors if any
    } finally {
      setResetting(false);
    }
  };

  const good = plan !== null && plan.ok;
  const execOk = exec !== null && exec.ok;
  const planSteps = execOk ? (exec as ExecResult).plan?.length ?? 0 : 0;
  const isWrite = execOk && (exec as ExecResult).changes !== null;

  // ---- text ↔ diagram linking ------------------------------------------
  // The live (debounced) plan drives the picture; the last run's plan is the
  // fallback while the current text is unparseable.
  const viewPlan = livePlan?.ok ? livePlan : plan?.ok ? plan : null;
  const viewPlanSql = livePlan?.ok ? liveSql : plan?.ok ? ranSql : "";
  const clauseInfo = useMemo(
    () => (viewPlanSql ? findClauses(viewPlanSql) : null),
    [viewPlanSql],
  );
  const spanFor = (kind: ClauseKind | null) =>
    kind && clauseInfo?.supported ? spanOf(clauseInfo.spans, kind) : null;
  const hoverSpan = spanFor(hoverKind);
  const pinnedSpan = spanFor(pinnedKind);
  const caretKind = clauseInfo ? clauseAtOffset(clauseInfo.spans, caret) : null;
  const activeKinds: ClauseKind[] | null = pinnedKind
    ? [pinnedKind]
    : caretKind
      ? [caretKind]
      : null;
  const errorRange =
    liveError && liveSql === sql ? liveError.location ?? null : null;
  // editor marks only make sense while the editor text matches the diagram's
  // text snapshot — otherwise offsets have drifted and marks would misplace
  const editorInSync = viewPlanSql === sql;
  const togglePinned = useCallback((kind: ClauseKind) => {
    setPinnedKind((p) => (p === kind ? null : kind));
    setHoverKind(null);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => go("landing")} aria-label="SeeQL — back to home" className="transition-opacity hover:opacity-80">
              <LogoFull />
            </button>
            <div className="hidden border-l border-zinc-800 pl-3 sm:block">
              <p className="text-xs text-zinc-500">
                Write a query — see it parsed, executed and explained
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <ThemeSwitcher />
            <button
              onClick={() => go("learn")}
              className="hidden items-center gap-1.5 rounded-md border border-zinc-800 px-3.5 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 sm:flex"
            >
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              Learn
            </button>
            <SampleGallery currentId={sampleId} onPick={onSampleChange} />

            <Select value={dialect} onValueChange={onDialectChange}>
              <SelectTrigger
                size="sm"
                className="w-[130px] border-zinc-700 bg-zinc-900 text-xs"
                aria-label="SQL dialect"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIALECTS.map((d) => (
                  <SelectItem key={d} value={d} className="font-mono text-xs">
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={shareLink}
              className="h-8 gap-1.5 px-2.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              aria-label="Copy a link to this query"
            >
              {copiedLink ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              {copiedLink ? "Copied" : "Share"}
            </Button>

            <Button
              onClick={() => runAll(sql, dialect)}
              disabled={running}
              className="h-8 gap-1.5 bg-emerald-500 font-medium text-zinc-950 hover:bg-emerald-400"
            >
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run
            </Button>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(360px,2fr)_minmax(0,3fr)]">
          {/* editor panel */}
          <section aria-label="SQL editor" className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
                Query
              </h2>
              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <Select onValueChange={onHistoryPick}>
                    <SelectTrigger
                      size="sm"
                      className="h-7 gap-1 border-none bg-transparent px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 focus:ring-0"
                      aria-label="Query history"
                    >
                      <span className="flex items-center gap-1.5">
                        <History className="h-3.5 w-3.5" />
                        History
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {history.map((h, i) => (
                        <SelectItem key={i} value={h} className="max-w-[320px] font-mono text-xs">
                          <span className="block truncate">{h.split("\n")[0]}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSql("")}
                  className="h-7 gap-1 px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </div>
            </div>
            <SqlEditor
              value={sql}
              onChange={(v) => {
                setSql(v);
                setSampleId("");
                // clause spans moved — drop any pinned/hovered highlight
                setPinnedKind(null);
                setHoverKind(null);
              }}
              onVisualize={() => runAll(sql, dialect)}
              className="h-[300px] xl:h-[340px]"
              highlight={editorInSync ? hoverSpan ?? pinnedSpan : null}
              errorRange={errorRange}
              onCaretMove={setCaret}
            />
            {liveError && sql.trim() !== "" && (
              <div
                title={liveError.error}
                className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11px] text-rose-200/90">
                    {liveError.error}
                  </p>
                  {liveError.hint && (
                    <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                      {liveError.hint}
                    </p>
                  )}
                </div>
              </div>
            )}
            <p className="px-1 text-[11px] text-zinc-600">
              Press{" "}
              <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 font-mono text-[10px] text-zinc-400">
                Ctrl / ⌘
              </kbd>{" "}
              +{" "}
              <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 font-mono text-[10px] text-zinc-400">
                Enter
              </kbd>{" "}
              to run · executes on the built-in{" "}
              <span className="text-zinc-500">SQLite sample DB</span> · hover the flow
              diagram to light up its SQL
            </p>
          </section>

          {/* visualization panel */}
          <section aria-label="Query visualization" className="flex min-w-0 flex-col gap-3">
            {plan && !plan.ok && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  <h2 className="text-sm font-semibold text-rose-200">
                    The query could not be parsed
                  </h2>
                </div>
                <pre className="thin-scrollbar mt-2.5 max-h-32 overflow-auto rounded-lg bg-zinc-950/70 p-3 font-mono text-xs break-words whitespace-pre-wrap text-rose-200/90">
                  {plan.error}
                </pre>
                {"hint" in plan && plan.hint && (
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">{plan.hint}</p>
                )}
              </div>
            )}

            {viewPlan && (
              <>
                {/* stats */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-300">
                    {viewPlan.statementType}
                  </span>
                  <StatChip icon={Table2} label="tables" value={viewPlan.stats.tables} tone="emerald" />
                  <StatChip icon={GitMerge} label="joins" value={viewPlan.stats.joins} tone="amber" />
                  <StatChip icon={Filter} label="filters" value={viewPlan.stats.filters} tone="rose" />
                  <StatChip
                    icon={Sigma}
                    label="aggregates"
                    value={viewPlan.stats.aggregations}
                    tone="teal"
                  />
                  {viewPlan.stats.ctes > 0 && (
                    <StatChip icon={ListTree} label="ctes" value={viewPlan.stats.ctes} tone="violet" />
                  )}
                  <span
                    className={cn(
                      "ml-auto rounded-full border px-2.5 py-1 text-xs font-semibold",
                      viewPlan.stats.label === "Simple"
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : viewPlan.stats.label === "Moderate"
                          ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                          : "border-rose-400/30 bg-rose-400/10 text-rose-300",
                    )}
                  >
                    {viewPlan.stats.label} · score {viewPlan.stats.complexity}
                  </span>
                </div>

                {viewPlan.statementType !== "SELECT" && (
                  <p className="rounded-lg border border-amber-400/25 bg-amber-400/5 px-3 py-2 text-xs leading-relaxed text-amber-200/90">
                    This is a <span className="font-mono font-bold">{viewPlan.statementType}</span>{" "}
                    statement — the pipeline below applies to SELECT queries, so only the tables
                    this statement touches are shown.
                  </p>
                )}

                <Tabs defaultValue="pipeline" className="w-full">
                  <TabsList className="h-9 w-full justify-start overflow-x-auto bg-zinc-900 sm:w-auto">
                    <TabsTrigger
                      value="pipeline"
                      className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800"
                    >
                      <Workflow className="h-3.5 w-3.5" /> Pipeline
                    </TabsTrigger>
                    <TabsTrigger
                      value="joins"
                      className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800"
                    >
                      <Network className="h-3.5 w-3.5" /> Relationships
                    </TabsTrigger>
                    <TabsTrigger
                      value="breakdown"
                      className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800"
                    >
                      <ListTree className="h-3.5 w-3.5" /> Breakdown
                    </TabsTrigger>
                    <TabsTrigger
                      value="tree"
                      className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800"
                    >
                      <ClipboardList className="h-3.5 w-3.5" /> Parse Tree
                    </TabsTrigger>
                    <TabsTrigger
                      value="schema"
                      className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800"
                    >
                      <DatabaseZap className="h-3.5 w-3.5" /> Schema
                    </TabsTrigger>
                    <TabsTrigger
                      value="json"
                      className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800"
                    >
                      <Braces className="h-3.5 w-3.5" /> JSON
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="pipeline" className="mt-3 space-y-3">
                    {viewPlan.statementType === "SELECT" && (
                      <>
                        <QueryFlowSvg
                          key={viewPlanSql}
                          plan={viewPlan}
                          resultRows={
                            execOk && ranSql === viewPlanSql
                              ? (exec as ExecResult).rows.length
                              : undefined
                          }
                          tableCounts={tableCounts}
                          activeKinds={activeKinds}
                          onKindHover={setHoverKind}
                          onKindClick={togglePinned}
                        />
                        <RowFunnel
                          sql={viewPlanSql}
                          dataVersion={dataVersion}
                          finalRows={execOk ? (exec as ExecResult).rows.length : undefined}
                          selected={inspectKind}
                          onSelectStage={setInspectKind}
                        />
                        {inspectKind && (
                          <StageInspector
                            sql={viewPlanSql}
                            dataVersion={dataVersion}
                            kind={inspectKind}
                            onClose={() => setInspectKind(null)}
                          />
                        )}
                      </>
                    )}
                    <PipelineView plan={viewPlan} onFocusClause={togglePinned} />
                  </TabsContent>
                  <TabsContent value="joins" className="mt-3">
                    <JoinsView plan={viewPlan} />
                  </TabsContent>
                  <TabsContent value="breakdown" className="mt-3">
                    <BreakdownView plan={viewPlan} />
                  </TabsContent>
                  <TabsContent value="tree" className="mt-3">
                    {viewPlan.tree ? (
                      <ParseTreeView tree={viewPlan.tree} />
                    ) : (
                      <p className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-6 text-center text-sm text-zinc-500">
                        No syntax tree for this statement.
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="schema" className="mt-3">
                    <SchemaView onPickTable={onSchemaPickTable} />
                  </TabsContent>
                  <TabsContent value="json" className="mt-3">
                    <JsonView plan={viewPlan} />
                  </TabsContent>
                </Tabs>
              </>
            )}

            {!plan && (
              <div className="flex h-64 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Parsing query…
                </div>
              </div>
            )}
          </section>
        </div>

        {/* results panel — full width */}
        <section aria-label="Query results" className="mt-5">
          <div className="flex items-center justify-between px-1 pb-2">
            <h2 className="flex items-center gap-2 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              <DatabaseZap className="h-3.5 w-3.5 text-emerald-500" />
              Live results · SQLite
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetDatabase}
              disabled={resetting}
              className="h-7 gap-1.5 px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              {resetting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Reset database
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
            {exec === null && (
              <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {running ? "Running on SQLite…" : "Press Run to execute a query"}
              </div>
            )}

            {exec && !exec.ok && (
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  <h3 className="text-sm font-semibold text-rose-200">
                    Execution failed
                  </h3>
                </div>
                <pre className="thin-scrollbar mt-2.5 max-h-32 overflow-auto rounded-lg bg-zinc-950/70 p-3 font-mono text-xs break-words whitespace-pre-wrap text-rose-200/90">
                  {exec.error}
                </pre>
                {exec.hint && (
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">{exec.hint}</p>
                )}
              </div>
            )}

            {exec && exec.ok && (
              <Tabs defaultValue="results">
                <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/70 px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-300">
                    {exec.statementType}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/60 px-2.5 py-0.5 text-xs text-zinc-300">
                    <Timer className="h-3.5 w-3.5" />
                    {exec.durationMs} ms
                  </span>
                  <TabsList className="ml-auto h-7 bg-zinc-950/60">
                    <TabsTrigger
                      value="results"
                      className="h-7 gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800"
                    >
                      <Table2 className="h-3 w-3" /> Results
                    </TabsTrigger>
                    {!isWrite && exec.plan && exec.plan.length > 0 && (
                      <TabsTrigger
                        value="plan"
                        className="h-7 gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800"
                      >
                        <Workflow className="h-3 w-3" /> Plan
                        <span className="rounded-full bg-zinc-800 px-1.5 text-[10px] text-zinc-400">
                          {exec.plan.length}
                        </span>
                      </TabsTrigger>
                    )}
                    {!isWrite && (
                      <TabsTrigger
                        value="missions"
                        className="h-7 gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800"
                      >
                        <Trophy className="h-3 w-3" /> Missions
                        <span className="rounded-full bg-zinc-800 px-1.5 text-[10px] text-zinc-400">
                          {MISSIONS.filter((m) => missionXp[`mission:${m.id}`] !== undefined).length}/{MISSIONS.length}
                        </span>
                      </TabsTrigger>
                    )}
                    {!isWrite && exec.columns.length > 0 && (
                      <TabsTrigger
                        value="chart"
                        className="h-7 gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800"
                      >
                        <ChartColumn className="h-3 w-3" /> Chart
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>
                <TabsContent value="results" className="mt-0">
                  {exec.columns.length > 0 ? (
                    <ResultsView
                      columns={exec.columns}
                      rows={exec.rows}
                      truncated={exec.truncated}
                    />
                  ) : (
                    <WriteResultView
                      statementType={exec.statementType}
                      changes={exec.changes ?? 0}
                    />
                  )}
                </TabsContent>
                {!isWrite && exec.plan && exec.plan.length > 0 && (
                  <TabsContent value="plan" className="p-3">
                    <PlanView rows={exec.plan} />
                  </TabsContent>
                )}
                {!isWrite && (
                  <TabsContent value="missions" className="mt-0">
                    <MissionBoard
                      exec={execOk ? (exec as ExecResult) : null}
                      ranSql={ranSql}
                      onLoadSql={(text) => {
                        setSampleId("");
                        setSql(text);
                      }}
                    />
                  </TabsContent>
                )}
                {!isWrite && exec.columns.length > 0 && (
                  <TabsContent value="chart" className="mt-0">
                    {/* keyed per run so a new result re-suggests axes/type; a re-run of
                        the SAME query keeps the user's chart customization */}
                    <ChartView
                      key={ranSql}
                      columns={exec.columns}
                      rows={exec.rows}
                    />
                  </TabsContent>
                )}
              </Tabs>
            )}
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="mt-auto border-t border-zinc-800/80">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11px] text-zinc-600">
          <span>
            SeeQL Playground · queries run against a sandboxed SQLite sample database · nothing is
            stored
          </span>
          <span className="font-mono">parse · execute · explain</span>
        </div>
      </footer>
    </div>
  );
}

/**
 * App shell — single exposed route, three views:
 *   /            → landing
 *   /#playground → SQL playground (the original visualizer)
 *   /#learn      → the learning app
 * Hash syncs with browser history so back/forward work.
 */
function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

export default function Home() {
  // The hash IS the router — subscribe to it as an external system.
  // useSyncExternalStore renders the server snapshot during hydration
  // (landing) and re-renders with the real hash right after — no
  // hydration mismatch, no setState-in-effect.
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => "",
  );
  // The route is the part before "?" — a shared query rides along as
  // #playground?q=<encoded sql>&d=<dialect> and never breaks deep links.
  const qMark = hash.indexOf("?");
  const route = qMark === -1 ? hash : hash.slice(0, qMark);
  const mode: Mode =
    route === "#playground" ? "playground" : route === "#learn" ? "learn" : "landing";

  let sharedSql: string | null = null;
  let sharedDialect: DialectName | undefined;
  if (mode === "playground" && qMark !== -1) {
    const params = new URLSearchParams(hash.slice(qMark + 1));
    const q = params.get("q");
    if (q && q.trim()) sharedSql = q;
    const d = params.get("d");
    if (d && (DIALECTS as readonly string[]).includes(d)) sharedDialect = d as DialectName;
  }

  const go = useCallback((m: Mode) => {
    window.location.hash = m === "landing" ? "" : `#${m}`;
    window.scrollTo({ top: 0 });
  }, []);

  if (mode === "landing") {
    return <Landing onStart={() => go("learn")} onPlayground={() => go("playground")} />;
  }
  if (mode === "learn") {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <button onClick={() => go("landing")} aria-label="SeeQL — back to home" className="transition-opacity hover:opacity-80">
              <LogoFull />
            </button>
            <div className="flex items-center gap-2">
              {/* SeeQ playground — the mascot's own section. The mini bot is a
                  live one: its capsule eyes track your cursor app-wide. */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("seeql:nav", { detail: { kind: "seeq" } }))}
                data-seeq-nav="1"
                aria-label="Open the SeeQ playground — dress and place your buddy"
                title="SeeQ playground — dress & place your buddy"
                className="flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-800 py-1.5 pl-1.5 pr-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-900"
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
              <ThemeSwitcher />
              <button
                onClick={() => go("playground")}
                className="hidden rounded-md border border-zinc-800 px-3.5 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 sm:block"
              >
                Playground
              </button>
            </div>
          </div>
        </header>
        <LearnApp />
        <footer className="mt-auto border-t border-zinc-800/80">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 text-[11px] text-zinc-600 sm:px-6">
            <span>SeeQL Learn · progress saved on this device</span>
            <span className="font-mono">read · watch · prove</span>
          </div>
        </footer>
      </div>
    );
  }
  return <PlaygroundView key={sharedSql ?? ""} go={go} sharedSql={sharedSql} sharedDialect={sharedDialect} />;
}
