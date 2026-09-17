/// <reference types="bun-types" />
// j9-a gate harness — enforces the deck-2 audit contract on cases-j5a.ts,
// mirroring the deck-2 gates the joins-deck audit upgrade specifies:
//   topic "j5", deck 2, 3-4 slots, bank 5-6, JOIN-bearing fills, ≤2 SELECTs,
//   read-only single statement, figure-in-result, distractor consequence per
//   slot, bank hygiene, prose minima, marker discipline, 8 distinct universes,
//   fills pairwise distinct in-file AND vs ALL prior fills in cases/index.
// Probes the COPY scripts/.tmp-j9a.db read-only. NEVER touches db/custom.db.
import { Database } from "bun:sqlite";
import { casesJ5a } from "../src/lib/curriculum/cases/m2/cases-j5a";
import { CASES } from "../src/lib/curriculum/cases/index";

const db = new Database("scripts/.tmp-j9a.db", { readonly: true });

function fill(template: string, values: Record<number, string>): string {
  return template.replace(/\{(\d+)\}/g, (_, n) => values[Number(n)] ?? `{${n}}`);
}
function normalizeCell(c: unknown): string {
  if (c === null) return "NULL";
  return String(c);
}
function canonRows(rows: unknown[][]): string {
  return JSON.stringify(rows.map((r) => r.map(normalizeCell)));
}
function runSql(sql: string): { ok: true; rows: unknown[][] } | { ok: false; error: string } {
  try {
    const res = db.query(sql).all() as Record<string, unknown>[];
    if (res.length === 0) return { ok: true, rows: [] };
    const cols = Object.keys(res[0]);
    return { ok: true, rows: res.map((r) => cols.map((c) => r[c])) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
const norm = (sql: string) => sql.replace(/\s+/g, " ").trim().replace(/;$/, "").toLowerCase();
function valueInResults(answer: string, rows: unknown[][]): boolean {
  const aNum = Number(answer.trim());
  for (const row of rows) for (const cell of row) {
    const s = normalizeCell(cell);
    if (s === answer.trim()) return true;
    if (!Number.isNaN(aNum) && answer.trim() !== "" && Number(s) === aNum) return true;
  }
  return false;
}

let pass = 0;
const failures: string[] = [];
const seenFills = new Map<string, string>();
for (const c of CASES) seenFills.set(norm(fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])))), c.id);
console.log(`prior fills loaded from cases/index: ${seenFills.size} (cases cs-001..cs-200)`);

for (const c of casesJ5a) {
  const errs: string[] = [];
  const add = (m: string) => errs.push(m);

  // deck-2 identity
  if (c.deck !== 2) add(`deck ${c.deck} — must be 2`);
  if (c.topic !== "j5") add(`topic "${c.topic}" — must be j5`);
  if (!/^cs-\d{3}$/.test(c.id)) add(`id "${c.id}" malformed`);

  // slots & markers
  if (c.slots.length < 3 || c.slots.length > 4) add(`${c.slots.length} slots — deck-2 requires 3..4`);
  const used = new Set<number>();
  for (const m of c.template.matchAll(/\{(\d+)\}/g)) {
    const k = Number(m[1]);
    if (used.has(k)) add(`marker {${k}} used more than once`);
    used.add(k);
  }
  if (used.size !== c.slots.length) add(`${used.size} distinct markers vs ${c.slots.length} slots`);
  for (let i = 1; i <= c.slots.length; i++) if (!used.has(i)) add(`missing marker {${i}}`);

  // prose minima (same thresholds as the shared audit)
  if (c.brief.replace(/\s+/g, " ").trim().length < 120) add(`brief too thin (${c.brief.length})`);
  if (c.ask.trim().length < 30) add(`ask too thin (${c.ask.length})`);
  if (c.walkthrough.replace(/\s+/g, " ").trim().length < 220) add(`walkthrough too thin (${c.walkthrough.length})`);
  if (c.title.trim().length < 10) add("title too short");
  c.slots.forEach((s, i) => {
    if (!s.label || s.label.trim().length < 3) add(`slot ${i + 1} label too short`);
    if (!s.why || s.why.trim().length < 40) add(`slot ${i + 1} why too thin`);
    if (!s.answer || s.answer.trim().length === 0) add(`slot ${i + 1} empty answer`);
  });

  // bank hygiene
  const answers = c.slots.map((s) => s.answer.trim());
  if (new Set(answers).size !== answers.length) add("duplicate slot answers");
  const bank = c.distractors;
  if (bank.length < 5 || bank.length > 6) add(`${bank.length} distractors — deck-2 requires 5..6`);
  if (new Set(bank).size !== bank.length) add("duplicate distractors");
  for (const d of bank) if (answers.includes(d.trim())) add(`distractor "${d}" duplicates a slot answer`);

  // noVerify cap (deck-2: 0-1)
  const nv = c.slots.filter((s) => s.noVerify).length;
  if (nv > 1) add(`${nv} noVerify slots — deck-2 cap is 1`);

  // deck-2 fill shape: JOIN-bearing, ≤2 SELECT, read-only single statement
  const filled = fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])));
  const joins = (filled.match(/\bJOIN\b/gi) ?? []).length;
  if (joins < 1) add("fill has no JOIN — deck-2 fills must be JOIN-bearing");
  const selects = (filled.match(/\bSELECT\b/gi) ?? []).length;
  if (selects > 2) add(`${selects} SELECTs — deck-2 cap is 2`);
  if (!/^\s*SELECT\b/i.test(filled)) add("fill does not start with SELECT (read-only gate)");
  if (/;/.test(filled.replace(/;\s*$/, ""))) add("internal statement separator");
  if (/\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|ATTACH|DETACH)\b/i.test(filled)) add("mutating keyword in fill");

  // self-join shape: some table appears under two distinct aliases
  const pairs = [...filled.matchAll(/\b(?:FROM|JOIN)\s+([a-zA-Z_][\w]*)\s+([a-zA-Z_][\w]*)/gi)]
    .map((m) => [m[1].toLowerCase(), m[2].toLowerCase()] as const);
  const byTable = new Map<string, Set<string>>();
  for (const [t, a] of pairs) {
    if (!byTable.has(t)) byTable.set(t, new Set());
    byTable.get(t)!.add(a);
  }
  const selfJoined = [...byTable.entries()].filter(([t, as]) => as.size >= 2 && pairs.filter(([tt]) => tt === t).length >= 2);
  if (selfJoined.length === 0) add(`no self-join detected (tables/aliases: ${[...pairs].map(([t, a]) => `${t} ${a}`).join(", ")})`);

  // execution + figure-in-result + row cap
  const res = runSql(filled);
  if (!res.ok) add(`fill fails to execute: ${res.error}`);
  else {
    if (res.rows.length > 1000) add(`result too large (${res.rows.length} rows)`);
    c.slots.forEach((s, i) => {
      if (s.kind === "number" && !s.noVerify && !valueInResults(s.answer, res.rows))
        add(`slot ${i + 1} (${s.label}): figure "${s.answer}" not in result cells`);
    });
  }

  // distractor consequence per slot
  if (res.ok) {
    for (const d of bank) {
      for (let i = 0; i < c.slots.length; i++) {
        if (d === c.slots[i].answer) continue;
        const values: Record<number, string> = {};
        for (let j = 0; j < c.slots.length; j++) values[j + 1] = c.slots[j].answer;
        values[i + 1] = d;
        const probe = runSql(fill(c.template, values));
        if (!probe.ok) continue; // error = consequential
        if (canonRows(probe.rows) === canonRows(res.rows))
          add(`ambiguous: "${d}" in slot ${i + 1} (${c.slots[i].label}) reproduces the correct result`);
      }
    }
  }

  // distinctness
  const n = norm(filled);
  const twin = [...seenFills.entries()].find(([sql]) => sql === n);
  if (twin) add(`fill identical to ${twin[1]}`);
  seenFills.set(n, c.id);

  if (errs.length === 0) {
    pass++;
    console.log(`PASS ${c.id}  ${c.title}  [${res.ok ? res.rows.length + " rows" : "exec error"}]`);
  } else {
    failures.push(c.id);
    console.log(`FAIL ${c.id}  ${c.title}`);
    for (const e of errs) console.log(`     - ${e}`);
  }
}

// deck-level gates
const universes = new Set(casesJ5a.map((c) => c.universe));
if (universes.size !== casesJ5a.length) console.log(`FAIL deck: universes not distinct (${[...universes].join(", ")})`);
else console.log(`deck check OK: ${universes.size} distinct universes`);
const ids = new Set(casesJ5a.map((c) => c.id));
if (ids.size !== casesJ5a.length) console.log("FAIL deck: duplicate ids");

console.log("\n==== j5a DECK-2 GATE SUMMARY ====");
console.log(`cases: ${casesJ5a.length}  pass: ${pass}  fail: ${casesJ5a.length - pass}`);
if (failures.length) console.log(`failing: ${failures.join(", ")}`);
db.close();
process.exit(failures.length || universes.size !== casesJ5a.length ? 1 : 0);
