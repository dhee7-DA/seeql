// Mechanical quality audit across all 208 company kits.
// Checks: counts, MCQ structure/dupes, theory depth/dupes, case id hygiene,
// problem slug validity/orphans, topic<->problem weave, id uniqueness.
// Exit 1 on any FAIL-severity issue; warnings are reported but don't fail.
import { COMPANY_KITS } from "../src/lib/companies/registry";
import { readFileSync } from "node:fs";

const BAND_SLUGS = new Set(
  readFileSync("scripts/band-slugs.txt", "utf8").split("\n").map(s => s.trim()).filter(Boolean)
);

type Issue = { kit: string; sev: "FAIL" | "WARN"; check: string; detail: string };
const issues: Issue[] = [];
const push = (kit: string, sev: "FAIL" | "WARN", check: string, detail: string) =>
  issues.push({ kit, sev, check, detail });

// collapse whitespace only — KEEP case+punctuation, else "%m" vs "%M" or "/ 100.0" vs "* 100.0" collapse together
const norm = (s: string) => String(s).replace(/\s+/g, " ").trim();

const ids = Object.keys(COMPANY_KITS);
let kits = 0, mcqTotal = 0, theoryTotal = 0, probTotal = 0;
const perCheckFails: Record<string, number> = {};

for (const id of ids) {
  const kit: any = COMPANY_KITS[id];
  if (!kit) continue;
  kits++;
  const k = kit.id ?? id;

  // ---- counts ----
  const mcq = kit.mcqs?.length ?? 0, theory = kit.theory?.length ?? 0,
    cases = kit.cases?.length ?? 0, probs = kit.problems?.length ?? 0;
  mcqTotal += mcq; theoryTotal += theory; probTotal += probs;
  if (mcq !== 30 || theory !== 24 || cases !== 6 || probs !== 32)
    push(k, "FAIL", "counts", `mcq=${mcq} theory=${theory} cases=${cases} probs=${probs}`);

  // ---- MCQ structure ----
  const seenMcqPrompts = new Map<string, number>();
  const seenMcqIds = new Set<string>();
  const mcqIdNums: number[] = [];
  (kit.mcqs ?? []).forEach((m: any, i: number) => {
    const mid = String(m.id ?? "");
    if (seenMcqIds.has(mid)) push(k, "FAIL", "mcq-id-dup", `${mid} (index ${i})`);
    seenMcqIds.add(mid);
    const num = mid.match(/(\d+)$/);
    if (num) mcqIdNums.push(Number(num[1]));
    const choices: string[] = m.choices ?? [];
    if (choices.length !== 4) push(k, "FAIL", "mcq-choices", `${mid}: ${choices.length} choices`);
    else if (choices.some((c: string) => !c || !String(c).trim()))
      push(k, "FAIL", "mcq-choice-empty", mid);
    const a = m.answer;
    if (typeof a !== "number" || a < 0 || a > 3) push(k, "FAIL", "mcq-answer-bounds", `${mid}: answer=${a}`);
    if (choices.some((c: string, j: number) => j !== a && norm(c) === norm(choices[a] ?? "###")))
      push(k, "FAIL", "mcq-dupe-choice", `${mid}: correct choice text duplicated in another option`);
    else if (choices.some((c: string, j: number) => j !== a && norm(c).toLowerCase() === norm(choices[a] ?? "###").toLowerCase()))
      push(k, "WARN", "mcq-case-only-pair", `${mid}: answer differs from an option by CASE ONLY (verify the casing trap is intentional)`);
    if (!m.why || String(m.why).trim().length < 20) push(k, "FAIL", "mcq-why-thin", mid);
    if (!["easy", "medium", "hard"].includes(m.difficulty)) push(k, "WARN", "mcq-difficulty", `${mid}: ${m.difficulty}`);
    for (const n of m.notes ?? []) {
      if (typeof n.choice !== "number" || n.choice < 0 || n.choice > 3)
        push(k, "FAIL", "mcq-note-bounds", `${mid}: note choice=${n.choice}`);
      else if (n.choice === a) push(k, "WARN", "mcq-note-on-answer", `${mid}: note explains the correct choice`);
      if (!n.why || String(n.why).trim().length < 15) push(k, "FAIL", "mcq-note-thin", `${mid}: note ${n.choice}`);
    }
    const key = norm(m.prompt ?? "");
    if (key.length > 10) {
      if (seenMcqPrompts.has(key)) push(k, "FAIL", "mcq-prompt-dup", `${mid} duplicates ${seenMcqPrompts.get(key)}`);
      seenMcqPrompts.set(key, i);
    }
  });
  const mmax = Math.max(...mcqIdNums, 0);
  if (mcqIdNums.length >= 10 && mmax >= mcqIdNums.length) {
    const missing: number[] = [];
    for (let n = 1; n <= mmax; n++) if (!mcqIdNums.includes(n)) missing.push(n);
    if (missing.length) push(k, "WARN", "mcq-id-gap", `missing suffixes: ${missing.slice(0, 8).join(",")}${missing.length > 8 ? "…" : ""}`);
  }

  // ---- theory ----
  const seenQ = new Map<string, number>();
  const thTags = new Set<string>();
  (kit.theory ?? []).forEach((t: any, i: number) => {
    const tid = String(t.id ?? `#${i}`);
    if (!t.q || String(t.q).trim().length < 10) push(k, "FAIL", "theory-q-thin", tid);
    if (!t.a || String(t.a).trim().length < 40) push(k, "FAIL", "theory-a-thin", `${tid}: len=${String(t.a ?? "").length}`);
    if (!t.tag || !String(t.tag).trim()) push(k, "WARN", "theory-tag-missing", tid);
    else thTags.add(String(t.tag));
    const key = norm(t.q ?? "");
    if (key.length > 10) {
      if (seenQ.has(key)) push(k, "FAIL", "theory-q-dup", `${tid} duplicates ${seenQ.get(key)}`);
      seenQ.set(key, i);
    }
  });

  // ---- cases (structural; deep checks live in case-audit.ts) ----
  const seenCase = new Set<string>();
  for (const c of kit.cases ?? []) {
    const cid = String(c.id ?? "");
    if (!/^cs-[a-z0-9]+-\d+$/.test(cid)) push(k, "WARN", "case-id-format", cid);
    if (seenCase.has(cid)) push(k, "FAIL", "case-id-dup", cid);
    seenCase.add(cid);
    if (!c.brief || String(c.brief).length < 80) push(k, "WARN", "case-brief-thin", cid);
  }

  // ---- problems ----
  const probSlugs = new Set<string>();
  for (const p of kit.problems ?? []) {
    const s = String(p.slug ?? "");
    if (!s) { push(k, "FAIL", "problem-slug-empty", `index ${probSlugs.size}`); continue; }
    if (probSlugs.has(s)) push(k, "FAIL", "problem-slug-dup", s);
    probSlugs.add(s);
    if (!BAND_SLUGS.has(s)) push(k, "FAIL", "problem-slug-invalid", s);
    if (!p.why || String(p.why).trim().length < 20) push(k, "FAIL", "problem-why-thin", s);
  }

  // ---- topic <-> problem weave ----
  // topics[].slugs legitimately mix kit problems + band-library references; a slug is only
  // BROKEN if it is neither in the kit nor in the global band pool (broken topic-page link).
  const woven = new Set<string>();
  for (const t of kit.topics ?? []) {
    for (const s of (t.slugs ?? []).map(String)) {
      woven.add(s);
      if (!probSlugs.has(s) && !BAND_SLUGS.has(s)) push(k, "FAIL", "topic-slug-broken", `${t.id ?? "?"} -> ${s}`);
    }
  }
  let unwoven = 0;
  for (const s of probSlugs) if (!woven.has(s)) unwoven++;
  if (unwoven > 0) push(k, "WARN", "problem-not-woven", `${unwoven}/${probs} problems absent from topics[].slugs`);

  // ---- overview prose sanity ----
  const ov = JSON.stringify(kit.overview ?? kit.brief ?? "");
  if (ov && /sixteen problems/.test(ov)) push(k, "WARN", "prose-stale-count", "overview still says 'sixteen problems'");
}

for (const i of issues) if (i.sev === "FAIL") perCheckFails[i.check] = (perCheckFails[i.check] ?? 0) + 1;

console.log(`kits=${kits} mcq=${mcqTotal} theory=${theoryTotal} problems=${probTotal}`);
const fails = issues.filter(i => i.sev === "FAIL");
const warns = issues.filter(i => i.sev === "WARN");
console.log(`\n== RESULT: ${fails.length} FAIL, ${warns.length} WARN ==`);
if (Object.keys(perCheckFails).length)
  console.log("fail-by-check: " + JSON.stringify(perCheckFails, null, 0));
const warnByCheck: Record<string, number> = {};
for (const w of warns) warnByCheck[w.check] = (warnByCheck[w.check] ?? 0) + 1;
console.log("warn-by-check: " + JSON.stringify(warnByCheck, null, 0));

const show = (sev: "FAIL" | "WARN", limit = 40) => {
  const rows = issues.filter(i => i.sev === sev);
  if (!rows.length) return;
  console.log(`\n--- ${sev} (${rows.length}) ---`);
  rows.slice(0, limit).forEach(i => console.log(`${i.kit} [${i.check}] ${i.detail}`));
  if (rows.length > limit) console.log(`… and ${rows.length - limit} more`);
};
show("FAIL", 60);
show("WARN", 50);

process.exit(fails.length ? 1 : 0);
