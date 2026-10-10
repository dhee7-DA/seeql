// Capstone engine verification — run with:
//   ./node_modules/.bin/jiti scripts/capstone-verify.ts
//
// Stronger than the gym's fake-result harness: every generated question's
// own starter SQL is executed against a REAL SQLite engine (node:sqlite,
// same family as the sandbox route), with the table built through
// sqlLiteral — the exact storage semantics of api/sandbox. Asserts, for
// EACH built-in sample (finance research + fitness + sales + hr):
//  1. domain detection lands on the expected domain
//  2. roles the templates depend on are detected
//  3. stage structure: A first, H last, all questions in known stages
//  4. every question's skills map to SKILL_LESSONS, and every lesson id
//     in SKILL_LESSONS exists in the real curriculum (no dead links)
//  5. every SQL question's checker PASSES on the starter's real engine
//     result and REJECTS a perturbed one
//  6. no question's correct result satisfies a DIFFERENT question
//  7. the pick question's answer matches an independent recomputation

import {
  CAP_ECOM_CSV,
  CAP_FITNESS_CSV,
  CAP_HR_CSV,
  CAP_MARKETING_CSV,
  CAP_SALES_CSV,
} from "../src/lib/capstone-samples";
import {
  SKILL_LESSONS,
  buildCapstone,
  detectDomain,
  detectRoles,
  type CapQ,
  type CapstoneProject,
} from "../src/lib/capstone";
import { GYM_SAMPLE_CSV, gymXpKey, parseForTable, profileGym, type GymParse } from "../src/lib/messy-gym";
import { sqlLiteral } from "../src/lib/csv-table";
import { LESSONS } from "../src/lib/curriculum/lessons";
import type { ExecResult } from "../src/lib/sql-types";
import { DatabaseSync } from "node:sqlite";

let failures = 0;
function ok(cond: boolean, label: string) {
  if (!cond) {
    failures++;
    console.error(`  FAIL  ${label}`);
  } else {
    console.log(`  ok    ${label}`);
  }
}

// ---- the mini engine ----------------------------------------------------------

function makeDb(parse: GymParse): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  const cols = parse.columns.map((c) => `"${c.name}" ${c.type}`).join(", ");
  db.exec(`CREATE TABLE "${parse.table}" (${cols});`);
  for (const row of parse.rows) {
    const lits = row.map((v, ci) => sqlLiteral(v, parse.columns[ci].type));
    db.exec(`INSERT INTO "${parse.table}" VALUES (${lits.join(", ")});`);
  }
  return db;
}

function execOn(db: DatabaseSync, sql: string): ExecResult {
  const stmt = db.prepare(sql);
  const columns = stmt.columns().map((c) => c.name);
  const raw = stmt.all() as Array<Record<string, unknown>>;
  const rows = raw.map((rec) => columns.map((c) => (rec[c] === undefined ? null : (rec[c] as string | number | null))));
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

/** Deterministically break a correct result: single cell → bump the value;
 *  anything else → duplicate the first row (breaks row-count/shape). */
function wrongify(r: ExecResult): ExecResult {
  if (r.columns.length === 1 && r.rows.length === 1) {
    const v = r.rows[0][0];
    const broken = typeof v === "number" ? v + 1 : `${String(v)}x`;
    return { ...r, rows: [[broken]] };
  }
  return { ...r, rows: [...r.rows, r.rows[0]] };
}

interface SampleSpec {
  label: string;
  csv: string;
  name: string;
  domain: ReturnType<typeof detectDomain>;
  wantRoles: string[];
  skip?: string[];
}

const SAMPLES: SampleSpec[] = [
  {
    label: "finance research",
    csv: GYM_SAMPLE_CSV,
    name: "research",
    domain: "finance",
    wantRoles: ["date", "money", "status", "person"],
  },
  {
    label: "fitness gym check-ins",
    csv: CAP_FITNESS_CSV,
    name: "gym_checkins",
    domain: "fitness",
    wantRoles: ["id", "person", "date", "money", "measure", "status", "location"],
  },
  {
    label: "sales orders",
    csv: CAP_SALES_CSV,
    name: "sales_orders",
    domain: "sales",
    wantRoles: ["id", "person", "date", "money", "measure", "status", "location", "category"],
  },
  {
    label: "hr roster",
    csv: CAP_HR_CSV,
    name: "hr_roster",
    domain: "hr",
    wantRoles: ["id", "person", "date", "money", "measure", "status", "location"],
  },
  {
    label: "e-commerce returns",
    csv: CAP_ECOM_CSV,
    name: "shop_returns",
    domain: "ecommerce",
    wantRoles: ["id", "email", "person", "date", "money", "measure", "status", "location", "category"],
  },
  {
    label: "marketing campaigns",
    csv: CAP_MARKETING_CSV,
    name: "campaign_metrics",
    domain: "marketing",
    wantRoles: ["id", "person", "date", "money", "measure", "status", "location", "category"],
  },
];

// ---- the curriculum link gate (once, before samples) ----------------------------

console.log("\n[0] skill → lesson bridge resolves against the real curriculum");
const lessonIds = new Set(LESSONS.map((l) => l.id));
ok(lessonIds.size >= 50, `curriculum exposes ${lessonIds.size} lessons`);
for (const [skill, refs] of Object.entries(SKILL_LESSONS)) {
  ok(refs.length > 0, `skill "${skill}" has at least one lesson`);
  for (const ref of refs) {
    ok(lessonIds.has(ref.id), `skill "${skill}" → ${ref.id} exists (${ref.label})`);
  }
}

// ---- per-sample verification ------------------------------------------------------

const allProjects: Array<{ spec: SampleSpec; parse: GymParse; project: CapstoneProject }> = [];

for (const spec of SAMPLES) {
  console.log(`\n=== ${spec.label} ===`);
  const parse = parseForTable(spec.csv, spec.name);
  if ("error" in parse) throw new Error(parse.error);
  const profile = profileGym(parse);
  const project = buildCapstone(parse, profile);
  allProjects.push({ spec, parse, project });

  ok(project.domain === spec.domain, `domain → ${project.domain} (want ${spec.domain})`);
  ok(project.domainLabel.length > 0, `domain label → ${project.domainLabel}`);

  const roles = detectRoles(parse);
  for (const want of spec.wantRoles) {
    ok(roles.some((r) => r.role === want), `role detected: ${want} (${roles.filter((r) => r.role === want).map((r) => r.name).join(", ") || "none"})`);
  }

  // stage structure
  const stageIds = project.stages.map((s) => s.id);
  ok(stageIds[0] === "a" && stageIds[stageIds.length - 1] === "h", `stages run A→H (${stageIds.join(" → ")})`);
  ok(stageIds.every((s, i) => i === 0 || s > stageIds[i - 1]), "stages strictly ordered");
  const qStages = new Set(project.questions.map((q) => q.stage));
  ok(qStages.size === project.stages.length, "no empty stages advertised");

  // skills + xp + ids
  for (const q of project.questions) {
    ok(q.skills.every((s) => s in SKILL_LESSONS), `${q.id}: skills resolve (${q.skills.join(",")})`);
    ok(q.xp > 0 && Number.isFinite(q.xp), `${q.id}: xp sane (${q.xp})`);
  }
  const ids = project.questions.map((q) => q.id);
  ok(new Set(ids).size === ids.length, `question ids unique (${ids.length} questions)`);

  // the story
  ok(project.story.includes(parse.table), "story names the table");
  ok(project.story.length > 120, "story is substantial");

  // ---- real-engine execution of every SQL question ------------------------------
  const db = makeDb(parse);
  const sqlQs = project.questions.filter((q) => q.kind === "sql");
  const correctById = new Map<string, ExecResult>();

  for (const q of sqlQs) {
    let got: ExecResult;
    try {
      got = execOn(db, q.starter);
    } catch (e) {
      ok(false, `${q.id}: starter SQL runs on real SQLite — threw: ${(e as Error).message}`);
      continue;
    }
    const verdict = q.check(got);
    ok(verdict.pass, `${q.id}: checker PASSES on engine truth (${verdict.feedback.slice(0, 60)}…)`);
    const bad = q.check(wrongify(got));
    ok(!bad.pass, `${q.id}: checker REJECTS a perturbed result`);
    correctById.set(q.id, got);
  }

  // cross-satisfaction: nobody's truth clears somebody else's question
  let crossHits = 0;
  for (const q of sqlQs) {
    for (const [otherId, otherResult] of correctById) {
      if (otherId === q.id) continue;
      if (q.check(otherResult).pass) {
        crossHits++;
        console.error(`  FAIL  ${otherId}'s correct result cleared "${q.id}"`);
      }
    }
  }
  ok(crossHits === 0, `no cross-satisfaction (${sqlQs.length * (sqlQs.length - 1)} pairs)`);

  // pick question — independent recomputation of the answer
  const pick = project.questions.find((q: CapQ) => q.kind === "pick");
  if (pick?.pick) {
    const dGroup =
      project.questions.find((q) => q.id === "d-groups") !== undefined
        ? /SELECT LOWER\((\w+)\) AS group_value/.exec(
            project.questions.find((q) => q.id === "d-groups")!.starter,
          )?.[1] ?? null
        : null;
    if (dGroup) {
      const ci = parse.columns.findIndex((c) => c.name === dGroup);
      const counts = new Map<string, number>();
      for (const row of parse.rows) {
        const v = row[ci]?.trim();
        if (!v) continue;
        const k = v.toLowerCase();
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
      const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      ok(pick.pick.answer === ranked[0][0], `pick answer = leading ${dGroup} (${pick.pick.answer})`);
      ok(pick.pick.options.includes(pick.pick.answer), "pick options contain the answer");
      ok(
        pick.pick.options.every((o) => counts.has(o)),
        "pick options are all real group values",
      );
    } else {
      ok(pick.pick.answer === String(parse.rows.length), "pick answer = row count (no group dimension)");
    }
    ok(pick.pick.explain.length > 40, "pick explain is substantial");
  }

  // xp keys — stable per parse
  const first = project.questions[0];
  const again = parseForTable(spec.csv, spec.name);
  if (!("error" in again)) ok(gymXpKey(parse, first.id) === gymXpKey(again, first.id), "xp key stable across parses");

  db.close();
}

// ---- the stage ladder is a real curriculum walk ----------------------------------

console.log("\n[n] stage coverage across domains");
for (const { spec, project } of allProjects) {
  const stageIds = project.stages.map((s) => s.id).join("");
  console.log(`  ${spec.label.padEnd(22)} ${stageIds}  (${project.questions.length} questions, ${project.questions.reduce((a, q) => a + q.xp, 0)} xp)`);
  ok(project.questions.length >= 12, `${spec.label}: at least 12 questions (${project.questions.length})`);
  ok(project.questions.reduce((a, q) => a + q.xp, 0) >= 150, `${spec.label}: substantial XP pot`);
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
