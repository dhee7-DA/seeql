"use client";

// Predict the Output — reading drills. SQL is read before it is written:
// show a query against a schema the learner knows, and three or four
// candidate result tables — one real (the engine's own output) and the rest
// plausible wrong ones (mutated variants of the query, each run for real).
// Pick the true table.
//
// Everything is generated at runtime from the problem's own deep-dive: the
// mutation library is shared with the Follow-up Gauntlet, and only problems
// where the generator verified distinct distractors enter the pool
// (DRILL_SLUGS: 3 distractors, DRILL2_SLUGS: 2 → 3-candidate drills).
// Zero per-drill authoring, endless content.

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpenText, Check, ChevronRight, Play, Shuffle, X } from "lucide-react";
import { LC_ALL, lcBySlug } from "@/lib/leetcode/registry";
import { lcSqlDive } from "@/lib/leetcode/content/content";
import { DRILL2_SLUGS, DRILL_SLUGS } from "@/lib/leetcode/followup-specs";
import {
  applyFuSpec,
  fuDistractorLabel,
  fuDistractorSpecs,
  readXpKey,
  stripComments,
  type FuSpec,
} from "@/lib/leetcode/followups";
import type { ExecResult } from "@/lib/sql-types";
import { useProgress } from "@/lib/curriculum/progress";
import { celebrate } from "./celebrate";
import { Btn, Chip, Panel } from "./ui/kit";
import { DiffDot, SectionHead } from "./lc-dive-ui";
import { ResultGrid } from "./result-grid";
import { cn } from "@/lib/utils";

const READ_XP = 2;
const LETTERS = ["A", "B", "C", "D"];
/** Problems verified with 3 distinct distractors (4-candidate drills). */
const FULL_POOL = new Set<string>(DRILL_SLUGS);

interface Candidate {
  spec: FuSpec | null; // null = the truth
  sql: string;
  res: ExecResult | null;
  label: string;
}

async function execSql(slug: string, sql: string): Promise<ExecResult | null> {
  try {
    const res = await fetch("/api/lc-sql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, sql }),
    });
    const data = (await res.json()) as ExecResult | { ok: false };
    return data.ok ? data : null;
  } catch {
    return null;
  }
}

/** Build the candidates for a slug; null when the drill can't be built.
 *  4-candidate drills for the 3-distractor pool, 3-candidate for the rest.
 *  Calls run in PARALLEL — the lc-sql route gives each request its own
 *  :memory: sandbox, so nothing collides. Distractor specs were verified
 *  distinct at build time; the dedup here is belt-and-suspenders. */
async function buildDrill(slug: string): Promise<Candidate[] | null> {
  const dive = lcSqlDive(slug);
  if (!dive) return null;
  const target = FULL_POOL.has(slug) ? 4 : 3;
  const truthSql = stripComments(dive.code);
  const truth = await execSql(slug, truthSql);
  if (!truth) return null;
  const specSqls = fuDistractorSpecs(dive)
    .map((spec) => ({ spec, sql: applyFuSpec(dive, spec) }))
    .filter((s): s is { spec: FuSpec; sql: string } => s.sql !== null);
  const specRes = await Promise.all(specSqls.map((s) => execSql(slug, s.sql)));
  const seen = new Set<string>([JSON.stringify(truth.rows)]);
  const out: Candidate[] = [{ spec: null, sql: truthSql, res: truth, label: "the query's real output" }];
  for (let i = 0; i < specSqls.length && out.length < 4; i++) {
    const res = specRes[i];
    if (!res) continue;
    const key = JSON.stringify(res.rows);
    if (seen.has(key)) continue;
    if (res.rows.length < 1 || res.rows.length > 60) continue;
    seen.add(key);
    out.push({ spec: specSqls[i].spec, sql: specSqls[i].sql, res, label: fuDistractorLabel(specSqls[i].spec) });
  }
  if (out.length < target) return null;
  // Fisher–Yates so the truth isn't always first
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function DrillCard({ slug, onDone, onNext }: { slug: string; onDone: (right: boolean) => void; onNext: () => void }) {
  const awardXp = useProgress((s) => s.awardXp);
  const firstTryPaid = useProgress((s) => s.xpEvents[readXpKey(slug)] !== undefined);
  const dive = lcSqlDive(slug)!;
  const reg = lcBySlug(slug)!;
  const [cands, setCands] = useState<Candidate[] | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [tableData, setTableData] = useState<Array<{ name: string; res: ExecResult | null }> | null>(null);

  useEffect(() => {
    let alive = true;
    void buildDrill(slug).then((c) => alive && setCands(c));
    return () => {
      alive = false;
    };
  }, [slug]);

  // the source tables, straight from the sandbox — the drill's open book
  // (parallel: each lc-sql request gets its own :memory: sandbox now)
  useEffect(() => {
    let alive = true;
    const tables = [...dive.schema.ddl.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?["']?(\w+)["']?/gi)].map((m) => m[1]);
    void (async () => {
      const rows = await Promise.all(
        tables.map(async (name) => ({ name, res: await execSql(slug, `SELECT * FROM ${name}`) })),
      );
      if (alive) setTableData(rows);
    })();
    return () => {
      alive = false;
    };
  }, [slug, dive.schema.ddl]);

  const truthIdx = useMemo(() => cands?.findIndex((c) => c.spec === null) ?? -1, [cands]);

  const pick = (i: number) => {
    if (picked !== null || !cands) return;
    setPicked(i);
    const right = i === truthIdx;
    if (right && !firstTryPaid && awardXp(readXpKey(slug), READ_XP)) {
      celebrate({ kind: "xp", title: `+${READ_XP} XP — read it right`, sub: reg.title });
    }
    onDone(right);
  };

  const query = stripComments(dive.code);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
            #{reg.num} · {reg.difficulty}
          </p>
          <h3 className="text-base font-bold tracking-tight">{reg.title}</h3>
        </div>
        <Btn variant="soft" onClick={onNext}>
          <Shuffle className="h-3 w-3" /> Next drill
        </Btn>
      </div>

      {/* the open book: the seeded tables */}
      <Panel pad={3.5}>
        <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">the data · live from the sandbox</p>
        {!tableData ? (
          <p className="mt-2 text-[12px] text-zinc-600">Loading the seeded tables…</p>
        ) : (
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {tableData.map((t) => (
              <div key={t.name}>
                <p className="mb-1 font-mono text-[10.5px] text-cyan-300">{t.name}</p>
                {t.res ? (
                  <ResultGrid data={{ columns: t.res.columns, rows: t.res.rows.slice(0, 12) }} />
                ) : (
                  <p className="text-[11px] text-zinc-600">table unavailable</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* the query to read */}
      <Panel pad={3.5}>
        <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">this query runs against the tables above — what comes back?</p>
        <pre className="thin-scrollbar mt-2 max-h-72 overflow-auto rounded-md border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11.5px] leading-5 text-zinc-200">{query}</pre>
      </Panel>

      {/* the four candidates */}
      {!cands ? (
        <Panel pad={3.5}>
          <p className="text-[12px] text-zinc-600">Dealing the candidate tables…</p>
        </Panel>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {cands.map((c, i) => {
            const isTruth = c.spec === null;
            const isPicked = picked === i;
            const showState = picked !== null;
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                disabled={showState}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  !showState && "cursor-pointer border-zinc-800 bg-zinc-950/40 hover:border-emerald-400/40",
                  showState && isTruth && "border-emerald-400/50 bg-emerald-400/[0.06]",
                  showState && !isTruth && isPicked && "border-rose-400/50 bg-rose-400/[0.06]",
                  showState && !isTruth && !isPicked && "border-zinc-800/60 bg-zinc-950/20 opacity-60",
                )}
              >
                <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
                  <span className={cn("rounded px-1.5 py-0.5", isTruth && showState ? "bg-emerald-400/15 text-emerald-300" : "bg-zinc-800 text-zinc-400")}>
                    {LETTERS[i]}
                  </span>
                  {showState ? (
                    <span className={isTruth ? "text-emerald-300" : isPicked ? "text-rose-300" : "text-zinc-500"}>
                      {isTruth ? "the real output" : c.label}
                    </span>
                  ) : (
                    <span className="text-zinc-500">{c.res?.rowCount ?? 0} rows — is it this one?</span>
                  )}
                  {showState && isTruth && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  {showState && !isTruth && isPicked && <X className="h-3.5 w-3.5 text-rose-400" />}
                </p>
                {c.res && <ResultGrid data={{ columns: c.res.columns, rows: c.res.rows.slice(0, 12) }} />}
              </button>
            );
          })}
        </div>
      )}

      {picked !== null && picked === truthIdx && (
        <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/[0.06] p-3 text-[12.5px] text-emerald-200">
          Read like the engine: you traced the clauses in order and landed on the real table. That's the interview skill.
        </p>
      )}
      {picked !== null && picked !== truthIdx && (
        <p className="rounded-lg border border-amber-400/30 bg-amber-400/[0.06] p-3 text-[12.5px] text-amber-200">
          Close — the real output is {LETTERS[truthIdx]}. The one you picked {cands?.[picked]?.spec ? fuDistractorLabel(cands[picked].spec!) : "was a near miss"}. Trace WHERE → GROUP BY → HAVING → SELECT → ORDER BY in order and re-run the next one.
        </p>
      )}
    </div>
  );
}

export function LcPredict() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const [drillSlug, setDrillSlug] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const pool = useMemo(() => {
    const slugs = [...DRILL_SLUGS, ...DRILL2_SLUGS].filter((s, i, a) => a.indexOf(s) === i);
    const rows = slugs.map((s) => lcBySlug(s)).filter((p): p is NonNullable<typeof p> => Boolean(p));
    return rows.map((p) => ({ p, cleared: xpEvents[readXpKey(p.slug)] !== undefined }));
  }, [xpEvents]);

  const nextDrill = useCallback(() => {
    const uncleared = pool.filter((x) => !x.cleared);
    const from = uncleared.length ? uncleared : pool;
    const pick = from[Math.floor(Math.random() * from.length)].p;
    setDrillSlug(pick.slug);
  }, [pool]);

  const onDone = (right: boolean) => {
    setStreak((s) => {
      const ns = right ? s + 1 : 0;
      setBest((b) => Math.max(b, ns));
      return ns;
    });
  };

  const clearedCount = pool.filter((x) => x.cleared).length;

  return (
    <div className="space-y-5">
      <Panel pad={4}>
        <SectionHead
          tone="cyan"
          icon={BookOpenText}
          title="Predict the Output"
          kicker="read SQL like the engine — the skill interviews actually probe"
          right={
            <span className="rounded-md border border-cyan-400/25 bg-cyan-400/[0.07] px-2.5 py-1 font-mono text-[11px] text-cyan-300">
              {clearedCount}/{pool.length} read · streak {streak} · best {best}
            </span>
          }
        />
        <p className="text-[12.5px] leading-relaxed text-zinc-400">
          You get the seeded tables and one query — no editor. Three or four result tables claim to be the output;
          exactly one is real (the others are engine-run near misses: a dropped WHERE, a swapped ranking function, a
          missing GROUP BY). Pick the true one. First-correct reads pay +{READ_XP} XP, and the pool grows with every
          problem the generator verifies. Wrong picks explain exactly which clause betrayed you.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn variant="primary" onClick={nextDrill}>
            <Play className="h-3.5 w-3.5" /> {drillSlug ? "Another drill" : "Start a drill"}
          </Btn>
          <Chip k="pool" v={`${pool.length} verified drills`} />
        </div>
      </Panel>

      {drillSlug && <DrillCard key={drillSlug} slug={drillSlug} onDone={onDone} onNext={nextDrill} />}

      {!drillSlug && (
        <Panel pad={4}>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">the pool · solved problems make the best drills</p>
          <div className="mt-2 grid gap-1.5 md:grid-cols-2">
            {pool.slice(0, 60).map(({ p, cleared }) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => setDrillSlug(p.slug)}
                className="flex items-center gap-2 rounded-md border border-zinc-800/70 bg-zinc-950/40 px-2.5 py-1.5 text-left hover:border-emerald-400/40"
              >
                <DiffDot d={p.difficulty} />
                <span className="min-w-0 flex-1 truncate text-[12px] text-zinc-300">{p.title}</span>
                {cleared ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" />}
              </button>
            ))}
          </div>
          {pool.length > 60 && <p className="mt-2 text-[11px] text-zinc-600">+ {pool.length - 60} more — hit “Start a drill” for a random one.</p>}
        </Panel>
      )}
    </div>
  );
}
