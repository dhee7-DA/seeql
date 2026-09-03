// Deep content-consistency audit for the SeeQL curriculum.
// Goes far beyond qa-coach: validates structure, ids, module registry,
// executes every SQL statement in the curriculum against a fresh seed,
// re-verifies every grading target, cross-references, figures and prose.
//
// Verdicts:  FAIL = definite bug  ·  REVIEW = needs human triage  ·  info
// Run: bun scripts/deep-audit.ts   (exit 1 on any FAIL)

import { readFileSync } from "node:fs";
import { LESSONS, MODULES } from "../src/lib/curriculum/lessons";
import { EXPECTED } from "../src/lib/curriculum/expected";
import type { Block, Lesson, Mcq, Problem } from "../src/lib/curriculum/types";
import { countStatements, splitStatements } from "../src/lib/sql-statements";
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

let fails = 0;
let reviews = 0;
const fail = (msg: string) => { console.log("    FAIL " + msg); fails++; };
const review = (msg: string) => { console.log("    review~~ " + msg); reviews++; };

const REAL_TABLES = new Set(["customers", "suppliers", "products", "orders", "order_items"]);
const PLACEHOLDER = /\.\.\.|…|<[^>\n]*>|\[[^\]\n]*\]|\{[^}\n]*\}|YOUR_|→|⟶/;

/* ---------------- helpers ---------------- */

function normalizeCell(v: unknown): string | number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "number") return Math.round(v * 100) / 100;
  return String(v);
}

class SandboxRollback extends Error { constructor() { super("__sandbox_rollback__"); } }

async function sandboxRun(
  sql: string,
  verify?: string,
): Promise<{ columns: string[]; rows: (string | number | null)[][]; changes: number }> {
  let captured: { columns: string[]; rows: (string | number | null)[][]; changes: number } | null = null;
  try {
    await db.$transaction(
      async (tx) => {
        const res = (await tx.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
        let list = Array.isArray(res) ? res : [];
        if (verify && verify.trim()) {
          list = (await tx.$queryRawUnsafe(verify.trim())) as Array<Record<string, unknown>>;
        }
        const columns = list.length > 0 ? Object.keys(list[0]) : [];
        captured = { columns, rows: list.map((r) => columns.map((c) => normalizeCell(r[c]))), changes: 0 };
        throw new SandboxRollback();
      },
      { maxWait: 5000, timeout: 10_000 },
    );
  } catch (err) {
    if (!(err instanceof SandboxRollback)) throw err;
  }
  if (!captured) throw new Error("no result captured");
  return captured;
}

/** Total-change counting variant for write statements. */
async function sandboxChanges(sql: string, verify?: string) {
  let captured: { columns: string[]; rows: (string | number | null)[][]; changes: number } | null = null;
  try {
    await db.$transaction(
      async (tx) => {
        const before = (await tx.$queryRawUnsafe(`SELECT total_changes() AS c`)) as Array<Record<string, unknown>>;
        const res = (await tx.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
        const after = (await tx.$queryRawUnsafe(`SELECT total_changes() AS c`)) as Array<Record<string, unknown>>;
        const changes = Number(after[0].c) - Number(before[0].c);
        let list = Array.isArray(res) ? res : [];
        if (verify && verify.trim()) list = (await tx.$queryRawUnsafe(verify.trim())) as Array<Record<string, unknown>>;
        const columns = list.length > 0 ? Object.keys(list[0]) : [];
        captured = { columns, rows: list.map((r) => columns.map((c) => normalizeCell(r[c]))), changes };
        throw new SandboxRollback();
      },
      { maxWait: 5000, timeout: 10_000 },
    );
  } catch (err) {
    if (!(err instanceof SandboxRollback)) throw err;
  }
  if (!captured) throw new Error("no result captured");
  return captured;
}

/** Run statements sequentially inside ONE sandbox transaction — mirrors the
 *  app's batch mode: later statements see earlier ones' effects (CTE-free
 *  ALTER+SELECT, CREATE VIEW+SELECT pairs work exactly like in the UI). */
async function sandboxSequence(stmts: string[]): Promise<Array<{ ok: boolean; error?: string }>> {
  const out: Array<{ ok: boolean; error?: string }> = [];
  try {
    await db.$transaction(
      async (tx) => {
        for (const raw of stmts) {
          const sql = raw.trim().replace(/;+\s*$/, "");
          try {
            await tx.$queryRawUnsafe(sql);
            out.push({ ok: true });
          } catch (err) {
            out.push({ ok: false, error: rawErrMsg(err) });
          }
        }
        throw new SandboxRollback();
      },
      { maxWait: 5000, timeout: 20_000 },
    );
  } catch (err) {
    if (!(err instanceof SandboxRollback)) throw err;
  }
  return out;
}

function stmtType(sql: string): string {
  return (sql.trim().match(/^[a-zA-Z]+/)?.[0] ?? "UNKNOWN").toUpperCase();
}

/** Extract the real SQLite message from Prisma's wrapped errors. */
function rawErrMsg(err: unknown): string {
  const m = err instanceof Error ? err.message : String(err);
  const mm = m.match(/Message: `([^`]+)`/);
  const clean = mm ? mm[1] : m.replace(/\s*Invalid `prisma\.\$query\w+`\(\) invocation:?\s*/g, "");
  return clean.trim().split("\n")[0];
}

/** Does this lesson block ANNOUNCE that running it errors (deliberate demo)? */
function announcesError(caption: string | undefined, sql: string): boolean {
  return /refus|fail|error/i.test(caption ?? "") || /--.*(fail|error)/i.test(sql);
}

/** Strip parenthesized segments — used to detect statement-level clauses. */
function outsideParens(sql: string): string {
  let depth = 0, out = "";
  for (const ch of sql) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (depth === 0) out += ch;
  }
  return out;
}

/** Prose heuristics: choices that merely start with a keyword are not SQL. */
function looksLikeProse(s: string): boolean {
  if (/—/.test(s)) return true;               // em-dash explanations
  if (/[?!]\s*$/.test(s)) return true;        // sentence ending
  return false;
}

/** DML/DDL choices must be statement-shaped, not imperative prose. */
const WRITE_SHAPE = /^(delete\s+from|drop\s+(table|view|index)|insert\s+into|update\s+[a-z_][a-z0-9_]*\s+set|create\s+(table|view|index)|replace\s+into)/i;

/** A choice is treated as runnable SQL only in statement shape. */
function runnableChoiceSql(s: string): string | null {
  const t = s.trim().replace(/;+\s*$/, "");
  if (!t || looksLikeProse(t)) return null;
  const kind = stmtType(t);
  if (["SELECT", "WITH"].includes(kind)) return /\bfrom\b/i.test(t) ? t : null; // fragments skip
  if (["INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "REPLACE"].includes(kind))
    return WRITE_SHAPE.test(t) ? t : null;
  return null;
}


function rowsSignature(rows: (string | number | null)[][], ordered: boolean): string {
  const sig = rows.map((r) => JSON.stringify(r));
  return ordered ? sig.join("|") : sig.sort().join("|");
}

/** Walk every prose string in a lesson; `fn` receives (text, where). */
function walkText(l: Lesson, fn: (text: string, where: string) => void) {
  const blocks: Block[] = l.blocks;
  blocks.forEach((b, i) => {
    const at = `${l.id}.blocks[${i}]`;
    if (b.kind === "p" || b.kind === "h" || b.kind === "tip" || b.kind === "warn") fn(b.text, at);
    else if (b.kind === "dialect") fn(b.text, at);
    else if (b.kind === "bullets" || b.kind === "steps") b.items.forEach((it, j) => fn(it, `${at}.items[${j}]`));
    else if (b.kind === "code") { if (b.caption) fn(b.caption, `${at}.caption`); }
    else if (b.kind === "table") {
      b.headers.forEach((h, j) => fn(h, `${at}.headers[${j}]`));
      b.rows.forEach((r, ri) => r.forEach((c, ci) => fn(c, `${at}.rows[${ri}][${ci}]`)));
    }
  });
  l.mcqs.forEach((m) => {
    fn(m.prompt, `${l.id}.${m.id}.prompt`);
    fn(m.why, `${l.id}.${m.id}.why`);
    m.choices.forEach((c, j) => fn(c, `${l.id}.${m.id}.choice[${j}]`));
    (m.notes ?? []).forEach((n, j) => fn(n.why, `${l.id}.${m.id}.note[${j}]`));
  });
  l.problems.forEach((p) => {
    fn(p.brief, `${l.id}.${p.id}.brief`);
    (p.hints ?? []).forEach((h, j) => fn(h, `${l.id}.${p.id}.hint[${j}]`));
    (p.mistakes ?? []).forEach((m, j) => fn(m.message, `${l.id}.${p.id}.mistake[${j}]`));
  });
  if (l.takeaway) fn(l.takeaway, `${l.id}.takeaway`);
}

/** Table names referenced in a statement, minus CTE names declared in it. */
function tablesUsed(sql: string): string[] {
  const ctes = new Set<string>();
  for (const m of sql.matchAll(/\bwith\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi)) ctes.add(m[1].toLowerCase());
  for (const m of sql.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)\s+as\s*\(/gi)) ctes.add(m[1].toLowerCase());
  const out: string[] = [];
  for (const m of sql.matchAll(/\b(?:from|join|into|update|table|view)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi)) {
    const t = m[1].toLowerCase();
    if (!ctes.has(t)) out.push(t);
  }
  return out;
}

const lessonsByNum = new Map<number, Lesson>();
for (const l of LESSONS) lessonsByNum.set(l.num, l);

/* ============ SECTION 1 — structure & ids ============ */
console.log("\n== 1. structure & ids ==");
{
  const seenIds = new Set<string>();
  for (const l of LESSONS) {
    if (l.id !== `lesson-${String(l.num).padStart(2, "0")}`)
      fail(`${l.id}: id does not match num ${l.num} (expected lesson-${String(l.num).padStart(2, "0")})`);
    if (!l.title?.trim()) fail(`${l.id}: empty title`);
    if (!l.blurb?.trim()) fail(`${l.id}: empty blurb`);
    if (!l.takeaway?.trim()) fail(`${l.id}: missing takeaway`);
    if (!(l.minutes >= 4 && l.minutes <= 45)) review(`${l.id}: unusual minutes=${l.minutes}`);
    if (l.blocks.length === 0) fail(`${l.id}: no blocks`);

    for (const [kind, arr] of [["mcq", l.mcqs], ["problem", l.problems]] as const) {
      arr.forEach((item, idx) => {
        if (seenIds.has(item.id)) fail(`${item.id}: duplicate id (also seen earlier)`);
        seenIds.add(item.id);
        const prefix = kind === "mcq" ? "q" : "p";
        if (item.id !== `l${l.num}-${prefix}${idx + 1}`)
          fail(`${item.id}: id not sequential for ${l.id} position ${idx + 1} (expected l${l.num}-${prefix}${idx + 1})`);
      });
    }
    l.mcqs.forEach((m, i) => {
      if (!m.prompt?.trim()) fail(`${m.id}: empty prompt`);
      if (!m.why?.trim()) fail(`${m.id}: empty why`);
      if (m.choices.length < 2) fail(`${m.id}: fewer than 2 choices`);
      if (m.answer < 0 || m.answer >= m.choices.length) fail(`${m.id}: answer index ${m.answer} out of range`);
      const norm = m.choices.map((c) => c.trim().toLowerCase());
      const dups = norm.filter((c, j) => norm.indexOf(c) !== j);
      if (dups.length) fail(`${m.id}: duplicate choices "${dups[0].slice(0, 40)}"`);
    });
    l.problems.forEach((p) => {
      if (!p.title?.trim()) fail(`${p.id}: empty title`);
      if (!p.brief?.trim()) fail(`${p.id}: empty brief`);
      if (!p.solution?.trim()) fail(`${p.id}: empty solution`);
      if (!["easy", "medium", "hard"].includes(p.difficulty)) fail(`${p.id}: bad difficulty "${p.difficulty}"`);
      if (!p.hints || p.hints.length !== 2 || p.hints.some((h) => !h.trim()))
        fail(`${p.id}: hints must have 2 non-empty entries`);
      if (p.expected == null) fail(`${p.id}: missing expected result`);
      else {
        if (!Array.isArray(p.expected.rows)) fail(`${p.id}: expected.rows not an array`);
        const width = p.expected.columns?.length ?? 0;
        for (const [ri, r] of (p.expected.rows ?? []).entries())
          if (r.length !== width) fail(`${p.id}: expected row ${ri} width ${r.length} != ${width} columns`);
        if (!p.mutating && p.expected.rows.length === 0 && !/empty|no rows|zero|never|none/i.test(p.brief))
          review(`${p.id}: non-mutating problem expects 0 rows and brief doesn't announce it`);
      }
      if (p.mutating && (p.expected.rows?.length ?? 0) === 0 && (p.expected.changes ?? null) == null && !p.verify)
        fail(`${p.id}: mutating problem with no rows, no changes and no verify — ungradeable`);
      if (/order\s+by/i.test(outsideParens(p.solution)) && !p.ordered)
        review(`${p.id}: solution has a statement-level ORDER BY but ordered flag not set (grading is order-insensitive)`);
    });
  }
  console.log(`    lessons=${LESSONS.length} mcqs=${LESSONS.reduce((a, l) => a + l.mcqs.length, 0)} problems=${LESSONS.reduce((a, l) => a + l.problems.length, 0)}`);
}

/* ============ SECTION 2 — module registry ============ */
console.log("\n== 2. module registry ==");
{
  const seen = new Set<string>();
  const EXPECTED_LEVEL: Record<number, string> = {
    1: "Beginner", 2: "Intermediate", 3: "Advanced", 4: "Advanced",
    5: "Advanced", 6: "Expert", 7: "Expert", 8: "Expert",
  };
  MODULES.forEach((mod, mi) => {
    if (mod.num !== mi + 1) fail(`module "${mod.title}": num ${mod.num} out of position ${mi + 1}`);
    if (mod.level !== EXPECTED_LEVEL[mod.num])
      review(`module ${mod.num} level "${mod.level}" != expected ladder "${EXPECTED_LEVEL[mod.num]}"`);
    if (!mod.blurb?.trim()) fail(`module ${mod.num}: empty blurb`);
    let prev = 0;
    for (const l of mod.lessons) {
      if (seen.has(l.id)) fail(`module ${mod.num}: lesson ${l.id} listed twice`);
      seen.add(l.id);
      if (l.num <= prev) fail(`module ${mod.num}: lesson order broken (${l.num} after ${prev})`);
      prev = l.num;
    }
    const last = mod.lessons[mod.lessons.length - 1];
    if (!/^case study/i.test(last.title))
      review(`module ${mod.num}: last lesson "${last.title}" does not look like a case study`);
    mod.lessons.filter((l, i) => i < mod.lessons.length - 1 && /^case study/i.test(l.title))
      .forEach((l) => review(`module ${mod.num}: case study "${l.title}" is not the last lesson`));
  });
  for (const l of LESSONS)
    if (!seen.has(l.id)) fail(`${l.id}: not present in any module`);
  if (seen.size !== LESSONS.length) fail(`registry covers ${seen.size} of ${LESSONS.length} lessons`);
  const csLessons = LESSONS.filter((l) => /^case study/i.test(l.title)).map((l) => l.num);
  console.log(`    modules=${MODULES.length} covered=${seen.size}/${LESSONS.length} case-studies=[${csLessons.join(", ")}]`);
}

/* ============ SECTION 3 — problems vs expected ============ */
console.log("\n== 3. problem solutions run + match EXPECTED ==");
{
  await resetDatabase();
  let okCount = 0;
  for (const l of LESSONS) {
    for (const p of l.problems) {
      try {
        const got = p.mutating
          ? await sandboxChanges(p.solution, p.verify)
          : await sandboxRun(p.solution);
        const exp = EXPECTED[p.id];
        if (!exp) { fail(`${p.id}: no EXPECTED entry`); continue; }
        if (JSON.stringify(got.columns) !== JSON.stringify(exp.columns))
          fail(`${p.id}: columns drifted — solution [${got.columns.join(",")}] vs expected [${exp.columns.join(",")}]`);
        const gotSig = rowsSignature(got.rows, !!p.ordered);
        const expSig = rowsSignature(exp.rows as (string | number | null)[][], !!p.ordered);
        if (gotSig !== expSig) {
          const expN = exp.rows.length, gotN = got.rows.length;
          fail(`${p.id}: rows drifted (expected ${expN}, solution now yields ${gotN})`);
        }
        if (p.mutating && (exp.rows?.length ?? 0) === 0 && exp.changes != null && got.changes !== exp.changes)
          fail(`${p.id}: changes drifted (expected ${exp.changes}, got ${got.changes})`);
        okCount++;
      } catch (err) {
        fail(`${p.id}: solution does not run — ${rawErrMsg(err)}`);
      }
    }
  }
  const orphans = Object.keys(EXPECTED).filter((id) => !LESSONS.some((l) => l.problems.some((p) => p.id === id)));
  orphans.forEach((id) => review(`EXPECTED has stale entry "${id}" (no matching problem)`));
  console.log(`    verified ${okCount}/${LESSONS.reduce((a, l) => a + l.problems.length, 0)} problems against expected.ts`);
}

/* ============ SECTION 4 — lesson code blocks ============ */
console.log("\n== 4. lesson code blocks execute ==");
{
  let runnable = 0, ranStmts = 0, staticBlocks = 0;
  for (const l of LESSONS) {
    for (const [bi, b] of l.blocks.entries()) {
      if (b.kind !== "code") continue;
      const sql = b.sql.trim().replace(/;+\s*$/, "");
      if (!sql) continue;
      const at = `${l.id}.blocks[${bi}]`;
      if (b.runnable !== false) {
        runnable++;
        const stmts = splitStatements(b.sql);
        const results = await sandboxSequence(stmts);
        const announced = announcesError(b.caption, b.sql);
        let allOk = true, expectedErr = false;
        results.forEach((r, si) => {
          if (r.ok) { ranStmts++; return; }
          if (announced) { expectedErr = true; return; }  // deliberate error demo
          allOk = false;
          fail(`${at} stmt#${si + 1}: runnable block errors — ${r.error} :: ${stmts[si].slice(0, 70)}`);
        });
        if (announced && !expectedErr)
          review(`${at}: block announces an error but every statement succeeded — the demo loses its point`);
        if (allOk || expectedErr) ranStmts += 0;
      } else {
        staticBlocks++;
        if (PLACEHOLDER.test(sql)) continue;
        const badTables = tablesUsed(sql).filter((t) => !REAL_TABLES.has(t));
        if (badTables.length) review(`${at}: static block references unknown tables [${badTables.join(", ")}] :: ${sql.slice(0, 60)}`);
      }
    }
  }
  console.log(`    runnable=${runnable} statements-run=${ranStmts} static=${staticBlocks}`);
}

/* ============ SECTION 5 — MCQ SQL execution + numeric facts ============ */
console.log("\n== 5. MCQ sql choices + numeric answers ==");
{
  let sqlChoices = 0, numericChecked = 0;
  for (const l of LESSONS) {
    for (const m of l.mcqs) {
      // statement-shaped choices must execute; the correct one MUST run.
      for (const [ci, c] of m.choices.entries()) {
        const body = runnableChoiceSql(c);
        if (!body || PLACEHOLDER.test(body)) continue;
        sqlChoices++;
        try {
          await sandboxRun(body);
        } catch (err) {
          const msg = rawErrMsg(err);
          const conceptual = /no such table/i.test(msg) &&
            tablesUsed(body).some((t) => !REAL_TABLES.has(t));
          if (ci === m.answer && !conceptual) fail(`${m.id}: CORRECT choice SQL errors — ${msg} :: ${body.slice(0, 60)}`);
          else review(`${m.id}: choice [${ci}]${ci === m.answer ? " (correct, conceptual tables)" : ""} errors — ${msg.slice(0, 90)} :: ${body.slice(0, 50)}`);
        }
      }
      // numeric-answer MCQs: verify the number against live data
      const promptSqls = [...m.prompt.matchAll(/`([^`]+)`/g)].map((x) => x[1].trim())
        .filter((s) => /^(select|with)\b/i.test(s) && !PLACEHOLDER.test(s));
      const correct = m.choices[m.answer]?.trim() ?? "";
      if (/^\d+(\.\d+)?$/.test(correct) && promptSqls.length > 0) {
        try {
          const r = await sandboxRun(promptSqls[0].replace(/;+\s*$/, ""));
          numericChecked++;
          const candidates: (string | number)[] = [r.rows.length];
          for (const row of r.rows) for (const cell of row) if (cell !== null) candidates.push(cell);
          const hit = candidates.some((v) => Number(v) === Number(correct));
          if (!hit)
            review(`${m.id}: numeric answer ${correct} not found among values/rowcount of prompt SQL (${r.rows.length} rows)`);
        } catch (err) {
          review(`${m.id}: prompt SQL does not run — ${rawErrMsg(err)}`);
        }
      }
    }
  }
  console.log(`    sql-choices run=${sqlChoices} numeric-facts checked=${numericChecked}`);
}

/* ============ SECTION 6 — cross references ============ */
console.log("\n== 6. cross references ==");
{
  const refRe = /\b(?:lesson|module)\s+(\d+)\b/gi;
  let n = 0;
  for (const l of LESSONS) {
    walkText(l, (text, where) => {
      for (const m of text.matchAll(refRe)) {
        n++;
        const kind = /lesson/i.test(m[0]) ? "lesson" : "module";
        const num = Number(m[1]);
        if (kind === "lesson" && !lessonsByNum.has(num))
          fail(`${where}: references missing lesson ${num} :: "${text.slice(Math.max(0, m.index! - 30), m.index! + 40)}"`);
        if (kind === "module" && (num < 1 || num > MODULES.length))
          fail(`${where}: references missing module ${num}`);
        if (kind === "lesson" && num === l.num)
          review(`${where}: lesson references itself :: "${text.slice(Math.max(0, m.index! - 30), m.index! + 40)}"`);
      }
    });
  }
  console.log(`    cross-references scanned=${n}`);
}

/* ============ SECTION 7 — figures ============ */
console.log("\n== 7. figure registry coverage ==");
{
  const sources = [
    "src/components/learn/diagrams.tsx",
    ...[2, 3, 4, 5, 6, 7, 8].map((i) => `src/components/learn/diagrams-m${i}.tsx`),
  ].map((p) => readFileSync(`${__dirname}/../${p}`, "utf8"));
  const users = new Map<string, string[]>();
  for (const l of LESSONS)
    for (const b of l.blocks)
      if (b.kind === "diagram") {
        const arr = users.get(b.figure) ?? [];
        arr.push(l.id);
        users.set(b.figure, arr);
      }
  for (const [fig, ls] of users) {
    if (!sources.some((s) => s.includes(`"${fig}"`)))
      fail(`figure "${fig}" used by ${ls.join(",")} but has no component in the registry`);
  }
  console.log(`    figures used=${users.size}`);
}

/* ============ SECTION 8 — prose & tables ============ */
console.log("\n== 8. prose & tables ==");
{
  const prompts = new Map<string, string>();
  const tipLessons: string[] = [];
  let callouts = { tip: 0, warn: 0, dialect: 0 };
  for (const l of LESSONS) {
    let tips = 0, warns = 0, dialects = 0;
    for (const b of l.blocks) {
      if (b.kind === "tip") tips++;
      if (b.kind === "warn") warns++;
      if (b.kind === "dialect") dialects++;
      if (b.kind === "table")
        for (const [ri, r] of b.rows.entries())
          if (r.length !== b.headers.length)
            fail(`${l.id}: table block row ${ri} has ${r.length} cells, expected ${b.headers.length}`);
    }
    callouts.tip += tips; callouts.warn += warns; callouts.dialect += dialects;
    if (tips === 0 && warns === 0) tipLessons.push(l.id);
    for (const m of l.mcqs) {
      const key = m.prompt.trim().toLowerCase().replace(/\s+/g, " ");
      if (prompts.has(key)) fail(`${m.id}: duplicate MCQ prompt (same as ${prompts.get(key)})`);
      prompts.set(key, m.id);
    }
  }
  if (tipLessons.length) review(`lessons with no tip/warn callouts: ${tipLessons.join(", ")}`);
  console.log(`    callouts tip=${callouts.tip} warn=${callouts.warn} dialect=${callouts.dialect}`);
}

/* ============ SUMMARY ============ */
console.log("\n========================================");
console.log(fails === 0 && reviews === 0 ? "DEEP AUDIT CLEAN" : `FAILS=${fails}  REVIEWS=${reviews}`);
process.exit(fails === 0 ? 0 : 1);
