// Messy Data Gym engine verification — run with:
//   ./node_modules/.bin/jiti scripts/gym-verify.ts
//
// Asserts, on the built-in sample AND on generated dirt:
//  1. parseForTable matches the sandbox route's semantics (columns, types)
//  2. the profile fires every flag class on the messy sample
//  3. every generated mission's checker PASSES on an independently
//     recomputed truth result and FAILS on a wrong value
//  4. dirtyCsv is deterministic, produces parseable CSV, and its report
//     counts agree with an independent recount
//  5. cellAsStored mirrors sqlLiteral (INTEGER truncation, "" → NULL)

import {
  GYM_CLEAN_SAMPLE_CSV,
  GYM_SAMPLE_CSV,
  buildGymMissions,
  dirtyCsv,
  profileGym,
  gymXpKey,
  type GymMission,
} from "../src/lib/messy-gym";
import { cellAsStored, parseCsv, parseForTable, sniffDelimiter, sqlLiteral } from "../src/lib/csv-table";
import type { ExecResult } from "../src/lib/sql-types";

let failures = 0;
function ok(cond: boolean, label: string) {
  if (!cond) {
    failures++;
    console.error(`  FAIL  ${label}`);
  } else {
    console.log(`  ok    ${label}`);
  }
}

function fakeExec(columns: string[], rows: Array<Array<string | number | null>>): ExecResult {
  return {
    ok: true,
    statementType: "SELECT",
    columns,
    rows,
    rowCount: rows.length,
    durationMs: 1,
    changes: null,
    truncated: false,
    plan: null,
  };
}

/** Independent truth recomputation — deliberately separate from the engine. */
function truth(parse: ReturnType<typeof parseForTable> & { error?: string }) {
  if ("error" in parse) throw new Error(parse.error);
  const storedRows = parse.rows.map((r) =>
    r.map((v, ci) => cellAsStored(v, parse.columns[ci].type)),
  );
  const rowCount = storedRows.length;
  const nullsByCol = parse.columns.map((_, ci) => storedRows.filter((r) => r[ci] === null).length);
  const dupRows = (() => {
    const seen = new Set<string>();
    let d = 0;
    for (const r of storedRows) {
      const k = JSON.stringify(r);
      if (seen.has(k)) d++;
      else seen.add(k);
    }
    return d;
  })();
  const isoCountByCol = parse.columns.map((_, ci) =>
    parse.rows.filter((r) => /^\d{4}-\d{2}-\d{2}$/.test((r[ci] ?? "").trim())).length,
  );
  return { storedRows, rowCount, nullsByCol, dupRows, isoCountByCol };
}

// ---- 1 + 2 + 3: the messy sample --------------------------------------------

console.log("\n[1] messy sample — parse + profile");
const parse = parseForTable(GYM_SAMPLE_CSV, "research");
if ("error" in parse) throw new Error(parse.error);
const t = truth(parse);
const profile = profileGym(parse);

ok(parse.table === "csv_research", `table name → ${parse.table}`);
ok(parse.columns.length === 8, `8 columns → ${parse.columns.map((c) => c.name).join(", ")}`);
ok(parse.columns.some((c) => c.name === "report_date"), `header "Report Date" sanitized → report_date`);
ok(t.rowCount === 34, `rowCount 34 → ${t.rowCount}`);
ok(parse.columns[4].type === "TEXT", `price_usd stored as TEXT (decorated numbers)`);
ok(parse.columns[0].type === "TEXT", `ticker stored as TEXT (case chaos)`);

ok(profile.dupRows === t.dupRows && t.dupRows === 2, `dupRows 2 → ${profile.dupRows}`);
const allFlags = new Set(profile.columns.flatMap((c) => c.flags.map((f) => f.id)));
for (const f of ["nulls", "case", "junk", "dates", "whitespace"] as const) {
  ok(allFlags.has(f), `profile fires flag: ${f}`);
}
ok(["C", "D", "F"].includes(profile.grade) && profile.score >= 20, `sample grades honestly messy → ${profile.grade} (${profile.score})`);
ok(profile.columns.some((c) => c.name === "company" && c.flags.some((f) => f.id === "whitespace")),
  `company flagged for doubled spaces`);

console.log("\n[2] missions — expected vs independent truth");
const missions = buildGymMissions(parse, profile);
const ids = missions.map((m) => m.id);
ok(ids.includes("row-count"), "mission: row-count");
ok(ids.includes("null-hunt"), "mission: null-hunt");
ok(ids.includes("case-count"), "mission: case-count");
ok(ids.includes("dupe-hunt"), "mission: dupe-hunt");
ok(ids.includes("iso-dates"), "mission: iso-dates");
ok(ids.includes("junk-sum"), "mission: junk-sum");
ok(ids.includes("top-clean"), "mission: top-clean");
ok(missions.length === 7, `7 missions → ${missions.length}`);
ok(missions.reduce((a, m) => a + m.xp, 0) === 75, `total XP 75 → ${missions.reduce((a, m) => a + m.xp, 0)}`);

for (const m of missions) {
  // build the CORRECT result from independent truth, per mission id
  let correct: ExecResult | null = null;
  let wrong: ExecResult;
  switch (m.id) {
    case "row-count":
      correct = fakeExec(["row_count"], [[t.rowCount]]);
      wrong = fakeExec(["row_count"], [[t.rowCount + 1]]);
      break;
    case "null-hunt": {
      // the engine picked the max-null column; find it from the starter SQL
      const col = /WHERE (\w+) IS NULL/.exec(m.starter)![1];
      const ci = parse.columns.findIndex((c) => c.name === col);
      const n = t.nullsByCol[ci];
      correct = fakeExec(["null_rows"], [[n]]);
      wrong = fakeExec(["null_rows"], [[n + 1]]);
      ok(n === Math.max(...t.nullsByCol), `null-hunt picked the max-null column (${col}: ${n})`);
      break;
    }
    case "case-count": {
      const col = /LOWER\((\w+)\)/.exec(m.starter)![1];
      const ci = parse.columns.findIndex((c) => c.name === col);
      const want = new Set(
        t.storedRows.filter((r) => r[ci] !== null).map((r) => String(r[ci]).toLowerCase()),
      ).size;
      correct = fakeExec(["real_values"], [[want]]);
      wrong = fakeExec(["real_values"], [[want + 3]]);
      break;
    }
    case "dupe-hunt":
      correct = fakeExec(["dup_rows"], [[t.dupRows]]);
      wrong = fakeExec(["dup_rows"], [[t.dupRows - 1]]);
      break;
    case "iso-dates": {
      const col = /WHERE (\w+) GLOB/.exec(m.starter)![1];
      const ci = parse.columns.findIndex((c) => c.name === col);
      correct = fakeExec(["iso_rows"], [[t.isoCountByCol[ci]]]);
      wrong = fakeExec(["iso_rows"], [[t.isoCountByCol[ci] + 2]]);
      break;
    }
    case "junk-sum": {
      const col = /REPLACE\((\w+),/.exec(m.starter)![1];
      const ci = parse.columns.findIndex((c) => c.name === col);
      const sum = t.storedRows.reduce((acc, r) => {
        const v = r[ci];
        const s = v === null ? "" : String(v);
        const stripped = s.replace(/[$€£%,\s]/g, "");
        const num = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(stripped);
        return acc + (num ? Number.parseFloat(num[0]) : 0);
      }, 0);
      correct = fakeExec(["total"], [[Math.round(sum * 100) / 100]]);
      wrong = fakeExec(["total"], [[Math.round(sum * 100) / 100 + 10]]);
      break;
    }
    case "top-clean": {
      const col = /LOWER\((\w+)\)/.exec(m.starter)![1];
      const ci = parse.columns.findIndex((c) => c.name === col);
      const counts = new Map<string, number>();
      for (const r of t.storedRows) {
        if (r[ci] === null) continue;
        const k = String(r[ci]).toLowerCase();
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
      const n = Math.min(5, counts.size);
      const rows = [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, n)
        .map(([k, c]) => [k, c] as Array<string | number>);
      correct = fakeExec(["value", "rows"], rows);
      wrong = fakeExec(["value", "rows"], rows.map((r) => [r[0], (r[1] as number) + 1]));
      break;
    }
    default:
      wrong = fakeExec(["x"], [[null]]);
  }
  if (correct) {
    const res = m.check(correct);
    ok(res.pass, `${m.id}: checker PASSES on truth (${res.feedback.slice(0, 58)}…)`);
  }
  const bad = m.check(wrong);
  ok(!bad.pass, `${m.id}: checker REJECTS a wrong result`);
}

// cross-satisfaction invariant: one mission's correct result must never
// clear a DIFFERENT mission (the alias is part of the deliverable)
console.log("\n[2b] no cross-satisfaction between missions");
const correctById = new Map<string, ExecResult>();
for (const m of missions) {
  // rebuild each correct result exactly as above (cheap — same switch)
  const rebuilt = (() => {
    switch (m.id) {
      case "row-count": return fakeExec(["row_count"], [[t.rowCount]]);
      case "null-hunt": {
        const col = /WHERE (\w+) IS NULL/.exec(m.starter)![1];
        const ci = parse.columns.findIndex((c) => c.name === col);
        return fakeExec(["null_rows"], [[t.nullsByCol[ci]]]);
      }
      case "case-count": {
        const col = /LOWER\((\w+)\)/.exec(m.starter)![1];
        const ci = parse.columns.findIndex((c) => c.name === col);
        const want = new Set(
          t.storedRows.filter((r) => r[ci] !== null).map((r) => String(r[ci]).toLowerCase()),
        ).size;
        return fakeExec(["real_values"], [[want]]);
      }
      case "dupe-hunt": return fakeExec(["dup_rows"], [[t.dupRows]]);
      case "iso-dates": {
        const col = /WHERE (\w+) GLOB/.exec(m.starter)![1];
        const ci = parse.columns.findIndex((c) => c.name === col);
        return fakeExec(["iso_rows"], [[t.isoCountByCol[ci]]]);
      }
      case "junk-sum": {
        const col = /REPLACE\((\w+),/.exec(m.starter)![1];
        const ci = parse.columns.findIndex((c) => c.name === col);
        const sum = t.storedRows.reduce((acc, r) => {
          const v = r[ci];
          const s = v === null ? "" : String(v);
          const stripped = s.replace(/[$€£%,\s]/g, "");
          const num = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(stripped);
          return acc + (num ? Number.parseFloat(num[0]) : 0);
        }, 0);
        return fakeExec(["total"], [[Math.round(sum * 100) / 100]]);
      }
      default: {
        const col = /LOWER\((\w+)\)/.exec(m.starter)![1];
        const ci = parse.columns.findIndex((c) => c.name === col);
        const counts = new Map<string, number>();
        for (const r of t.storedRows) {
          if (r[ci] === null) continue;
          const k = String(r[ci]).toLowerCase();
          counts.set(k, (counts.get(k) ?? 0) + 1);
        }
        const n = Math.min(5, counts.size);
        const rows = [...counts.entries()]
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .slice(0, n)
          .map(([k, c]) => [k, c] as Array<string | number>);
        return fakeExec(["value", "rows"], rows);
      }
    }
  })();
  correctById.set(m.id, rebuilt);
}
let crossHits = 0;
for (const m of missions) {
  for (const [otherId, otherResult] of correctById) {
    if (otherId === m.id) continue;
    if (m.check(otherResult).pass) {
      crossHits++;
      console.error(`  FAIL  ${otherId}'s correct result cleared "${m.id}"`);
    }
  }
}
ok(crossHits === 0, `no mission's correct result satisfies another (${missions.length * (missions.length - 1)} pairs checked)`);

console.log("\n[3] xp keys — stable + file-scoped");
const k1 = gymXpKey(parse, "row-count");
const parse2 = parseForTable(GYM_SAMPLE_CSV, "research");
if ("error" in parse2) throw new Error(parse2.error);
ok(k1 === gymXpKey(parse2, "row-count"), `same file → same key (${k1})`);
ok(k1 !== gymXpKey(parse2, "null-hunt"), "different missions → different keys");

// ---- 4: the dirt injector -----------------------------------------------------

console.log("\n[4] dirty injector — determinism + damage");
const a = dirtyCsv(GYM_CLEAN_SAMPLE_CSV, 42);
const b = dirtyCsv(GYM_CLEAN_SAMPLE_CSV, 42);
ok(a.csv === b.csv, "same seed → byte-identical output");
ok(a.csv !== GYM_CLEAN_SAMPLE_CSV, "output actually differs from the input");
const c = dirtyCsv(GYM_CLEAN_SAMPLE_CSV, 7);
ok(c.csv !== a.csv, "different seed → different mess");

const reparsed = parseForTable(a.csv, "dirty_sample");
if ("error" in reparsed) {
  ok(false, `dirtied CSV reparses — got error: ${reparsed.error}`);
} else {
  const dirtyProfile = profileGym(reparsed);
  const cleanParse = parseForTable(GYM_CLEAN_SAMPLE_CSV, "clean_sample");
  if ("error" in cleanParse) throw new Error(cleanParse.error);
  const cleanProfile = profileGym(cleanParse);
  ok(
    dirtyProfile.score > cleanProfile.score,
    `dirt scores worse than clean (dirty ${dirtyProfile.score} vs clean ${cleanProfile.score})`,
  );
  ok(dirtyProfile.rowCount > cleanProfile.rowCount, `injected duplicates add rows (${cleanProfile.rowCount} → ${dirtyProfile.rowCount})`);
  ok(a.report.dupes >= 1, `injector guarantees a duplicate row (${a.report.dupes})`);
  const dirtyFlags = new Set(dirtyProfile.columns.flatMap((cc) => cc.flags.map((f) => f.id)));
  ok(dirtyFlags.has("nulls"), "dirt has blanks");
  ok(dirtyFlags.has("junk") || dirtyFlags.has("case") || dirtyFlags.has("dates"), "dirt has content-level mess");
  const damage = Object.values(a.report).reduce((x, y) => x + y, 0);
  ok(damage > 0, `report shows damage (${JSON.stringify(a.report)})`);
  // independent recount of the injected duplicate rows
  const outRows = parseCsv(a.csv, sniffDelimiter(a.csv)).slice(1);
  ok(outRows.length === cleanParse.rows.length + a.report.dupes, `row count = clean + dupes (${outRows.length})`);
}

// ---- 5: cellAsStored ≡ sqlLiteral ---------------------------------------------

console.log("\n[5] storage semantics — client mirror of the route");
for (const [raw, type] of [
  ["", "INTEGER"],
  ["", "TEXT"],
  [" 42 ", "INTEGER"],
  [" 3.9 ", "INTEGER"], // parseInt truncates — the route does too
  [" 2.5 ", "REAL"],
  [" Lisbon ", "TEXT"],
  ["7", "TEXT"], // stays a string in a TEXT column
] as Array<[string, "INTEGER" | "REAL" | "TEXT"]>) {
  const lit = sqlLiteral(raw, type);
  const stored = cellAsStored(raw, type);
  const litNorm = lit === "NULL" ? null : type === "TEXT" ? lit.slice(1, -1).replace("''", "'") : Number(lit);
  ok(
    JSON.stringify(stored) === JSON.stringify(litNorm),
    `${JSON.stringify(raw)} as ${type} → ${JSON.stringify(stored)} (literal ${lit})`,
  );
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
