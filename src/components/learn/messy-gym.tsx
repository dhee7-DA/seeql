"use client";

// Messy Data Gym — the CAPSTONE. Bring your own MESS: load a CSV (a
// Stratasearch export, a CRM dump, a government spreadsheet…), get an
// honest profile of what's wrong with it, then work it A→Z as a complete
// analyst project — meet the data, audit the damage, describe, break
// down, slice time, rank, domain briefs, and a final defended conclusion.
// Every expected answer is computed from YOUR actual data (never the SQL
// text — same shape-based grading as lib/missions.ts), SeeQ coaches every
// question, and every skill deep-links to the lesson that teaches it.
//
// The profiler shares its parsing machinery with api/sandbox (lib/csv-table)
// and the expected values were engine-verified by scripts/capstone-verify.ts —
// if the report says 7 blanks, the database holds 7 NULLs.

import { useRef, useState } from "react";
import {
  ArrowLeft,
  Eraser,
  FileDown,
  FileUp,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Icon3D } from "./ui/icon3d";
import { CapstoneTrack } from "./capstone-track";
import {
  GYM_CLEAN_SAMPLE_CSV,
  GYM_SAMPLE_CSV,
  dirtyCsv,
  parseForTable,
  profileGym,
  type DirtReport,
  type GymParse,
  type GymProfile,
} from "@/lib/messy-gym";
import { CAP_SAMPLES, type CapSample } from "@/lib/capstone-samples";
import type { ToolKind } from "./tools";
import { cn } from "@/lib/utils";

const GRADE_STYLE: Record<GymProfile["grade"], { chip: string; text: string }> = {
  A: { chip: "border-emerald-400/50 bg-emerald-400/10", text: "text-emerald-300" },
  B: { chip: "border-teal-400/50 bg-teal-400/10", text: "text-teal-300" },
  C: { chip: "border-amber-400/50 bg-amber-400/10", text: "text-amber-300" },
  D: { chip: "border-orange-400/50 bg-orange-400/10", text: "text-orange-300" },
  F: { chip: "border-rose-400/50 bg-rose-400/10", text: "text-rose-300" },
};

const FLAG_STYLE: Record<string, string> = {
  nulls: "border-zinc-700 text-zinc-400",
  whitespace: "border-sky-400/40 text-sky-300",
  case: "border-violet-400/40 text-violet-300",
  junk: "border-rose-400/40 text-rose-300",
  dates: "border-amber-400/40 text-amber-300",
};

/** Read-only guard lives in capstone-track.tsx now (the only surface that runs queries). */

type Stage = "load" | "report" | "gym";

export function MessyGym({
  onOpenSandbox,
  openLesson,
}: {
  onOpenSandbox?: (kind: ToolKind) => void;
  openLesson?: (id: string) => void;
}) {
  const [stage, setStage] = useState<Stage>("load");
  const [name, setName] = useState("research_export");
  const [csv, setCsv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dirtLine, setDirtLine] = useState<string | null>(null);
  const [parse, setParse] = useState<GymParse | null>(null);
  const [profile, setProfile] = useState<GymProfile | null>(null);
  const [creating, setCreating] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  function fail(msg: string) {
    setError(msg);
  }

  function profileIt() {
    setError(null);
    setDirtLine(null);
    if (!csv.trim()) {
      fail("Paste or upload a CSV first — or try the messy sample.");
      return;
    }
    const p = parseForTable(csv, name);
    if ("error" in p) {
      fail(p.error);
      return;
    }
    const prof = profileGym(p);
    setParse(p);
    setProfile(prof);
    setStage("report");
  }

  async function createAndOpen() {
    if (!parse || !profile || creating) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, csv }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        fail(data.error ?? "Could not create the table.");
        return;
      }
      setStage("gym");
    } catch {
      fail("The request failed — is the dev server up?");
    } finally {
      setCreating(false);
    }
  }

  function dirtyIt() {
    setError(null);
    if (!csv.trim()) {
      fail("Paste or upload a CLEAN CSV first — then I'll ruin it properly.");
      return;
    }
    const seed = (Date.now() % 2_147_483_647) || 1;
    const { csv: dirtied, report } = dirtyCsv(csv, seed);
    setCsv(dirtied);
    setDirtLine(
      `Injected: ${report.blanks} blanks · ${report.junked} junked numbers · ${report.caseFlips} case flips · ${report.pads} space pads · ${report.dateSwaps} date swaps · ${report.dupes} duplicate rows.`,
    );
  }

  async function onFile(file: File) {
    if (file.size > 2_000_000) {
      fail("File is over the 2 MB cap.");
      return;
    }
    const text = await file.text();
    setCsv(text);
    setDirtLine(null);
    if (!name || name === "research_export") {
      setName(file.name.replace(/\.(csv|tsv|txt)$/i, "").toLowerCase().replace(/\s+/g, "_") || "my_export");
    }
  }

  function loadSample(kind: "messy" | "clean") {
    setCsv(kind === "messy" ? GYM_SAMPLE_CSV : GYM_CLEAN_SAMPLE_CSV);
    setName(kind === "messy" ? "research_export" : "clean_export");
    setDirtLine(null);
    setError(null);
    setStage("load");
  }

  function loadDomainSample(key: CapSample["key"]) {
    const s = CAP_SAMPLES.find((x) => x.key === key);
    if (!s) return;
    setCsv(s.csv);
    setName(s.tableName);
    setDirtLine(null);
    setError(null);
    setStage("load");
  }

  function startOver() {
    setStage("load");
    setParse(null);
    setProfile(null);
    setError(null);
    setDirtLine(null);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <Eraser className="h-3.5 w-3.5" /> PRACTICE LAB · THE CAPSTONE
      </p>
      <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
        <Icon3D name="gem" size={40} anim="wiggle" /> Messy data capstone
      </h1>
      <p className="mt-3 text-[15px] leading-7 text-zinc-400">
        The final section of the course: a file that lies — blanks, duplicates, case chaos, numbers in text
        costumes, five date formats in one column. Upload one — a Stratasearch export, a CRM dump — and SeeQ
        walks you A to Z: audit the damage, describe it, break it down, slice time, rank it, then defend a
        conclusion. Every answer is graded against <span className="text-zinc-200">your actual data</span>, and
        every skill links straight back to its lesson.
      </p>

      {/* ---- stage: load ---- */}
      {stage === "load" && (
        <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="gym-name" className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              table name
            </label>
            <div className="flex items-center gap-0 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1.5 font-mono text-xs">
              <span className="text-zinc-600">csv_</span>
              <input
                id="gym-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my_export"
                className="w-40 bg-transparent text-zinc-200 outline-none placeholder:text-zinc-600"
                aria-label="Gym table name (the csv_ prefix is added for you)"
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
              onClick={() => loadSample("messy")}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
            >
              <Sparkles className="h-3.5 w-3.5" /> Messy sample
            </button>
            <button
              onClick={() => loadSample("clean")}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
              title="A clean export — pair it with the wand to manufacture practice material"
            >
              <FileDown className="h-3.5 w-3.5" /> Clean sample
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">or start from a domain</span>
            {CAP_SAMPLES.map((s) => (
              <button
                key={s.key}
                onClick={() => loadDomainSample(s.key)}
                className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-900"
                title={`${s.blurb} — full A→Z project on a deliberately messy file`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300/70" /> {s.label}
              </button>
            ))}
          </div>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={8}
            spellCheck={false}
            aria-label="CSV content — first row is the header"
            placeholder={"ticker,company,price\ne.g. paste any export — mess welcome, mess expected"}
            className="mt-3 w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 font-mono text-xs leading-5 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={profileIt}
              disabled={!csv.trim()}
              className={cn(
                "btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
                !csv.trim() && "cursor-not-allowed opacity-40",
              )}
            >
              <Eraser className="h-3.5 w-3.5" /> Profile the mess
            </button>
            <button
              onClick={dirtyIt}
              disabled={!csv.trim()}
              className={cn(
                "btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-900",
                !csv.trim() && "cursor-not-allowed opacity-40",
              )}
              title="Inject realistic mess into a clean file — blanks, dupes, case chaos, junk numbers"
            >
              <Wand2 className="h-3.5 w-3.5" /> Dirty my clean file
            </button>
            {dirtLine && (
              <span className="font-mono text-[11px] text-violet-300" role="status">
                {dirtLine}
              </span>
            )}
            {error && (
              <span className="font-mono text-xs text-rose-300" role="status">
                {error}
              </span>
            )}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
            Clean file and nothing to fight? Load the clean sample and press the wand — the injector
            blanks cells, decorates numbers, flips case, swaps date formats and clones rows, then hands
            the wreckage back for practice. Caps: 2 MB, 64 columns, 10,000 rows.
          </p>
        </div>
      )}

      {/* ---- stage: report ---- */}
      {stage === "report" && parse && profile && (
        <>
          <div className="sheen mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-4">
              <span
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-xl border font-display text-3xl font-bold",
                  GRADE_STYLE[profile.grade].chip,
                  GRADE_STYLE[profile.grade].text,
                )}
                aria-label={`Mess grade ${profile.grade}, score ${profile.score} of 100`}
              >
                {profile.grade}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold text-zinc-100">
                  Mess score {profile.score}/100 — {profile.gradeLine}
                </p>
                <p className="tnum mt-0.5 font-mono text-xs text-zinc-500">
                  {parse.table} · {profile.rowCount.toLocaleString()} rows · {profile.columns.length} columns ·{" "}
                  {profile.dupRows} duplicate row{profile.dupRows === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {profile.columns.map((c) => (
                <div key={c.name} className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-mono text-xs text-zinc-200">{c.name}</span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                      {c.type.toLowerCase()}
                      {c.rawHeader !== c.name ? ` · was "${c.rawHeader}"` : ""}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400"
                      style={{ width: `${Math.max(2, c.score)}%` }}
                      role="presentation"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.flags.length === 0 ? (
                      <span className="font-mono text-[10px] text-emerald-300/70">clean</span>
                    ) : (
                      c.flags.map((f) => (
                        <span
                          key={f.id}
                          className={cn("rounded-full border px-1.5 py-0.5 font-mono text-[9px]", FLAG_STYLE[f.id])}
                        >
                          {f.label} × {f.count}
                          {f.example ? ` — ${f.example.slice(0, 18)}` : ""}
                        </span>
                      ))
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-[10px] text-zinc-600">{c.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={createAndOpen}
                disabled={creating}
                className="btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eraser className="h-3.5 w-3.5" />}
                Create table & open the gym
              </button>
              <button
                onClick={startOver}
                className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Different file
              </button>
              {error && (
                <span className="font-mono text-xs text-rose-300" role="status">
                  {error}
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* ---- stage: project ---- */}
      {stage === "gym" && parse && profile && (
        <>
          <CapstoneTrack parse={parse} profile={profile} openLesson={openLesson} onOpenSandbox={onOpenSandbox} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={startOver}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Train on another file
            </button>
            <p className="font-mono text-[10px] text-zinc-600">
              every answer is graded from the rows you produce — {parse.table} stays queryable in the sandbox
            </p>
          </div>
        </>
      )}
    </div>
  );
}
