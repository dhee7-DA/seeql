"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Braces,
  Check,
  Copy,
  Database,
  Eraser,
  Filter,
  GitMerge,
  Loader2,
  Network,
  Play,
  ListTree,
  Sigma,
  Table2,
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
import { DEFAULT_SAMPLE, SAMPLE_QUERIES } from "@/lib/samples";
import { DIALECTS, type DialectName } from "@/lib/sql-types";
import type { ParseResult, QueryPlan } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

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
  const json = JSON.stringify(plan, null, 2);

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

export default function Home() {
  const [sql, setSql] = useState(DEFAULT_SAMPLE.sql);
  const [dialect, setDialect] = useState<DialectName>(DEFAULT_SAMPLE.dialect);
  const [sampleId, setSampleId] = useState<string>(DEFAULT_SAMPLE.id);
  const [plan, setPlan] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runParse = useCallback(async (sqlText: string, dia: DialectName) => {
    setLoading(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlText, dialect: dia }),
      });
      const data = (await res.json()) as ParseResult;
      setPlan(data);
    } catch {
      setPlan({ ok: false, error: "Could not reach the parser. Please try again." });
    } finally {
      setLoading(false);
    }
  }, []);

  // parse the default sample once on load so the page shows a live diagram
  useEffect(() => {
    runParse(DEFAULT_SAMPLE.sql, DEFAULT_SAMPLE.dialect);
  }, [runParse]);

  const onSampleChange = (id: string) => {
    const sample = SAMPLE_QUERIES.find((s) => s.id === id);
    if (!sample) return;
    setSampleId(id);
    setSql(sample.sql);
    setDialect(sample.dialect);
    runParse(sample.sql, sample.dialect);
  };

  const onDialectChange = (d: string) => {
    const next = d as DialectName;
    setDialect(next);
    runParse(sql, next);
  };

  const good = plan !== null && plan.ok;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 ring-1 ring-emerald-400/30">
              <Database className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight sm:text-base">SQL Visualizer</h1>
              <p className="hidden text-xs text-zinc-500 sm:block">
                Paste a query — see how the database actually reads it
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Select value={sampleId} onValueChange={onSampleChange}>
              <SelectTrigger
                size="sm"
                className="w-[190px] border-zinc-700 bg-zinc-900 text-xs sm:w-[220px]"
                aria-label="Load a sample query"
              >
                <SelectValue placeholder="Samples" />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_QUERIES.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    <span className="font-medium">{s.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
              onClick={() => runParse(sql, dialect)}
              disabled={loading}
              className="h-8 gap-1.5 bg-emerald-500 font-medium text-zinc-950 hover:bg-emerald-400"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Visualize
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
              <div className="flex items-center gap-2">
                <span className="hidden font-mono text-[11px] text-zinc-600 sm:inline">
                  {sql.split("\n").length} lines · {sql.length} chars
                </span>
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
              onChange={setSql}
              onVisualize={() => runParse(sql, dialect)}
              className="h-[380px] xl:h-[460px]"
            />
            <p className="px-1 text-[11px] text-zinc-600">
              Press{" "}
              <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 font-mono text-[10px] text-zinc-400">
                Ctrl / ⌘
              </kbd>{" "}
              +{" "}
              <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 font-mono text-[10px] text-zinc-400">
                Enter
              </kbd>{" "}
              to visualize · <span className="text-zinc-500">Tab inserts spaces</span>
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

            {good && plan && plan.ok && (
              <>
                {/* stats */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-300">
                    {plan.statementType}
                  </span>
                  <StatChip icon={Table2} label="tables" value={plan.stats.tables} tone="emerald" />
                  <StatChip icon={GitMerge} label="joins" value={plan.stats.joins} tone="amber" />
                  <StatChip icon={Filter} label="filters" value={plan.stats.filters} tone="rose" />
                  <StatChip
                    icon={Sigma}
                    label="aggregates"
                    value={plan.stats.aggregations}
                    tone="teal"
                  />
                  {plan.stats.ctes > 0 && (
                    <StatChip icon={ListTree} label="ctes" value={plan.stats.ctes} tone="violet" />
                  )}
                  <span
                    className={cn(
                      "ml-auto rounded-full border px-2.5 py-1 text-xs font-semibold",
                      plan.stats.label === "Simple"
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : plan.stats.label === "Moderate"
                          ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                          : "border-rose-400/30 bg-rose-400/10 text-rose-300",
                    )}
                  >
                    {plan.stats.label} · score {plan.stats.complexity}
                  </span>
                </div>

                {plan.statementType !== "SELECT" && (
                  <p className="rounded-lg border border-amber-400/25 bg-amber-400/5 px-3 py-2 text-xs leading-relaxed text-amber-200/90">
                    This is a <span className="font-mono font-bold">{plan.statementType}</span>{" "}
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
                      value="json"
                      className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800"
                    >
                      <Braces className="h-3.5 w-3.5" /> JSON
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="pipeline" className="mt-3">
                    <PipelineView plan={plan} />
                  </TabsContent>
                  <TabsContent value="joins" className="mt-3">
                    <JoinsView plan={plan} />
                  </TabsContent>
                  <TabsContent value="breakdown" className="mt-3">
                    <BreakdownView plan={plan} />
                  </TabsContent>
                  <TabsContent value="json" className="mt-3">
                    <JsonView plan={plan} />
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
      </main>

      {/* footer */}
      <footer className="mt-auto border-t border-zinc-800/80">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11px] text-zinc-600">
          <span>SQL Visualizer · queries are parsed for structure only and never stored</span>
          <span className="font-mono">PostgreSQL · MySQL · SQLite · T-SQL · BigQuery</span>
        </div>
      </footer>
    </div>
  );
}
