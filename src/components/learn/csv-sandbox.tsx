"use client";

// CSV sandbox — bring your own data. Paste or upload a CSV, it becomes a
// REAL SQLite table (csv_*) beside the sample worlds, queryable with plain
// SELECTs and JOINs against storefront/finance data. Runs are read-only
// (SELECT / WITH / EXPLAIN only) — the table itself is the durable artefact.

import { useCallback, useEffect, useRef, useState } from "react";
import { FileUp, Loader2, Play, Table2, Trash2 } from "lucide-react";
import { Icon3D } from "./ui/icon3d";
import { MiniGrid, execSql } from "./practice-kit";
import type { ExecResponse } from "@/lib/sql-types";
import { cn } from "@/lib/utils";
import { SqlEditor } from "../sql-editor";

interface SandboxColumn {
  name: string;
  type: "INTEGER" | "REAL" | "TEXT";
}

interface SandboxTable {
  name: string;
  rowCount: number;
  columns: SandboxColumn[];
}

const SAMPLE_CSV = [
  "city,days_visited,avg_minutes,budget",
  "Lisbon,24,42.5,low",
  "Osaka,31,55.1,medium",
  "Toronto,19,38.0,medium",
  "Cairo,27,47.2,low",
  "Helsinki,12,29.8,high",
  "Nairobi,22,44.0,low",
  "Perth,15,33.4,high",
  "Warsaw,29,51.6,medium",
].join("\n");

/** Client-side read-only guard: SELECT / WITH / EXPLAIN only. */
function isReadOnly(sql: string): boolean {
  return /^(select|with|explain)\b/i.test(sql.replace(/^(\s*(?:--[^\n]*\n|\/\*[\s\S]*?\*\/)+\s*)*/, ""));
}

export function CsvSandbox() {
  const [name, setName] = useState("my_data");
  const [csv, setCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [tables, setTables] = useState<SandboxTable[]>([]);

  const [sql, setSql] = useState("SELECT *\nFROM csv_my_data\nLIMIT 20;");
  const [run, setRun] = useState<{ running: boolean; result: ExecResponse | null }>({ running: false, result: null });
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshTables = useCallback(async () => {
    try {
      const res = await fetch("/api/sandbox");
      const data = (await res.json()) as { ok: boolean; tables?: SandboxTable[] };
      if (data.ok && data.tables) setTables(data.tables);
    } catch {
      /* dev server hiccup — the list is refreshable */
    }
  }, []);

  useEffect(() => {
    void refreshTables();
  }, [refreshTables]);

  async function load() {
    if (loading) return;
    if (!csv.trim()) {
      setMessage({ tone: "bad", text: "Paste or upload some CSV first." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, csv }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; table?: SandboxTable };
      if (data.ok && data.table) {
        setMessage({
          tone: "ok",
          text: `Table ${data.table.name} is live — ${data.table.rowCount.toLocaleString()} rows, ${data.table.columns.length} columns.`,
        });
        setSql(`SELECT *\nFROM ${data.table.name}\nLIMIT 20;`);
        await refreshTables();
      } else {
        setMessage({ tone: "bad", text: data.error ?? "Could not create the table." });
      }
    } catch {
      setMessage({ tone: "bad", text: "The request failed — is the dev server up?" });
    } finally {
      setLoading(false);
    }
  }

  async function drop(tableName: string) {
    await fetch("/api/sandbox", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: tableName }),
    });
    if (sql.toLowerCase().includes(tableName.toLowerCase())) {
      setRun({ running: false, result: null });
    }
    await refreshTables();
  }

  async function onFile(file: File) {
    if (file.size > 2_000_000) {
      setMessage({ tone: "bad", text: "File is over the 2 MB cap." });
      return;
    }
    const text = await file.text();
    setCsv(text);
    if (!name || name === "my_data") {
      setName(file.name.replace(/\.(csv|tsv|txt)$/i, "").toLowerCase().replace(/\s+/g, "_") || "my_data");
    }
  }

  async function runQuery() {
    const q = sql.trim();
    if (run.running || !q) return;
    if (!isReadOnly(q)) {
      setRun({
        running: false,
        result: { ok: false, error: "The sandbox runs read-only queries — SELECT, WITH and EXPLAIN only." },
      });
      return;
    }
    setRun({ running: true, result: null });
    const result = await execSql(q);
    setRun({ running: false, result });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <Table2 className="h-3.5 w-3.5" /> TOOLBOX · BRING YOUR OWN DATA
      </p>
      <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
        <Icon3D name="table" size={40} /> CSV sandbox
      </h1>
      <p className="mt-3 text-[15px] leading-7 text-zinc-400">
        Paste or upload a CSV and it becomes a real SQLite table — prefixed <span className="font-mono text-sm text-zinc-300">csv_</span> and
        living beside the storefront and finance worlds, so JOINs against the sample data just work. Runs stay read-only; the table is the
        artefact. Caps: 2 MB, 64 columns, 10,000 rows.
      </p>

      {/* loader */}
      <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="csv-name" className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            table name
          </label>
          <div className="flex items-center gap-0 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1.5 font-mono text-xs">
            <span className="text-zinc-600">csv_</span>
            <input
              id="csv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my_data"
              className="w-36 bg-transparent text-zinc-200 outline-none placeholder:text-zinc-600"
              aria-label="Sandbox table name (the csv_ prefix is added for you)"
            />
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-quiet ml-auto flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-900"
          >
            <FileUp className="h-3.5 w-3.5" /> Upload .csv
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.tsv,.txt,text/csv"
            className="hidden"
            aria-hidden="true"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => setCsv(SAMPLE_CSV)}
            className="btn-quiet rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
          >
            Try a sample
          </button>
        </div>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={7}
          spellCheck={false}
          aria-label="CSV content — first row is the header"
          placeholder={"city,days_visited,avg_minutes\nLisbon,24,42.5\nOsaka,31,55.1"}
          className="mt-3 w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 font-mono text-xs leading-5 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={load}
            disabled={loading || !csv.trim()}
            className={cn(
              "btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
              (loading || !csv.trim()) && "cursor-not-allowed opacity-40",
            )}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Table2 className="h-3.5 w-3.5" />}
            Create table
          </button>
          {message && (
            <span
              className={cn(
                "font-mono text-xs",
                message.tone === "ok" ? "text-emerald-300" : "text-rose-300",
              )}
              role="status"
            >
              {message.text}
            </span>
          )}
        </div>
      </div>

      {/* your tables */}
      {tables.length > 0 && (
        <div className="mt-4 space-y-2">
          {tables.map((t) => (
            <div key={t.name} className="sheen flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
              <span className="font-mono text-xs text-zinc-200">{t.name}</span>
              <span className="tnum text-[11px] text-zinc-500">
                {t.rowCount.toLocaleString()} rows · {t.columns.map((c) => `${c.name}:${c.type.toLowerCase()}`).join(", ")}
              </span>
              <button
                onClick={() => void drop(t.name)}
                aria-label={`Drop table ${t.name}`}
                title={`Drop ${t.name}`}
                className="ml-auto rounded p-1.5 text-zinc-500 transition-colors hover:bg-rose-400/10 hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* query runner */}
      <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          query it — read-only (select / with / explain)
        </p>
        <div className="mt-3 overflow-hidden rounded-md border border-zinc-800">
          <SqlEditor value={sql} onChange={setSql} onVisualize={runQuery} className="min-h-[110px]" />
        </div>
        <button
          onClick={runQuery}
          disabled={run.running || !sql.trim()}
          className={cn(
            "btn-glow mt-3 flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
            (run.running || !sql.trim()) && "cursor-not-allowed opacity-40",
          )}
        >
          {run.running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          Run query
        </button>
        {run.result && (
          <div className="mt-3.5">
            {!run.result.ok ? (
              <div className="rounded-md border border-rose-400/30 bg-rose-400/[0.06] px-3.5 py-3 font-mono text-xs text-rose-200">
                {run.result.error}
              </div>
            ) : (
              <>
                <p className="tnum mb-1.5 text-[11px] text-zinc-500">
                  {run.result.rowCount.toLocaleString()} rows in {run.result.durationMs} ms
                </p>
                <MiniGrid columns={run.result.columns} rows={run.result.rows} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
