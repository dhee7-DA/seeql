// Keyword Mastery quota tracker — per-keyword progress toward the program bar:
// every keyword ≥50 MCQs, ≥30 case files, ≥30 graded query problems
// (census multi-label tagging, gauntlet banks included).
//
//   npx tsx scripts/keyword-quota-gate.ts            # gap table
//   npx tsx scripts/keyword-quota-gate.ts --strict   # exit 1 if any gap (post-program gate)
//
// Reads scripts/coverage-data.json (run coverage-census.ts --emit first).
import { readFileSync } from "fs";

interface KwRow {
  keyword: string;
  category: string;
  mcqs: number;
  queries: number;
  cases: number;
  total: number;
}

const BAR = { mcqs: 50, cases: 30, queries: 30 };
const data = JSON.parse(readFileSync(new URL("./coverage-data.json", import.meta.url), "utf-8"));
const rows: KwRow[] = data.keywords;

const shortfalls: Array<{ kw: string; mcqs: number; cases: number; queries: number }> = [];
console.log("Keyword Mastery quota report — bar: 50 MCQs / 30 cases / 30 queries\n");
console.log(`${"KEYWORD".padEnd(38)}${"MCQs".padStart(6)}${"CASES".padStart(7)}${"QUERIES".padStart(8)}   status`);
for (const k of rows) {
  const gaps = [k.mcqs < BAR.mcqs, k.cases < BAR.cases, k.queries < BAR.queries];
  const status = gaps.every((g) => !g) ? "OK" : "GAP";
  if (gaps.some((g) => g)) shortfalls.push({ kw: k.keyword, mcqs: BAR.mcqs - k.mcqs, cases: BAR.cases - k.cases, queries: BAR.queries - k.queries });
  console.log(
    `${k.keyword.slice(0, 37).padEnd(38)}${String(k.mcqs).padStart(6)}${String(k.cases).padStart(7)}${String(k.queries).padStart(8)}   ${status}`,
  );
}

const done = rows.length - shortfalls.length;
console.log(`\n${done}/${rows.length} keywords at quota · ${shortfalls.length} with gaps`);
if (shortfalls.length) {
  console.log("\nBiggest MCQ gaps: " + shortfalls.slice().sort((a, b) => b.mcqs - a.mcqs).slice(0, 5).map((s) => `${s.kw} (+${s.mcqs})`).join(" · "));
  console.log("Biggest case gaps: " + shortfalls.slice().sort((a, b) => b.cases - a.cases).slice(0, 5).map((s) => `${s.kw} (+${s.cases})`).join(" · "));
  console.log("Biggest query gaps: " + shortfalls.slice().sort((a, b) => b.queries - a.queries).slice(0, 5).map((s) => `${s.kw} (+${s.queries})`).join(" · "));
}
if (process.argv.includes("--strict") && shortfalls.length) {
  console.error("\nSTRICT: quota unmet for " + shortfalls.length + " keywords");
  process.exit(1);
}
