/// <reference types="bun-types" />
// Task 106 — strip integrity gate.
// 1. Derives universe totals from the kit registry (source of truth).
// 2. Compares them against the generated constants file the strip renders.
// Any drift (kits edited without regenerating) fails the check with the
// exact key mismatches. Run: bun scripts/check-strip-counts.ts
import { readFileSync } from "node:fs";
import { COMPANY_KITS, COMPANY_DOMAINS } from "../src/lib/companies/registry";

const kits = Object.values(COMPANY_KITS);
const derived = {
  companies: kits.length,
  domains: COMPANY_DOMAINS.length,
  problems: kits.reduce((a, k) => a + k.problems.length, 0),
  theory: kits.reduce((a, k) => a + k.theory.length, 0),
  mcqs: kits.reduce((a, k) => a + k.mcqs.length, 0),
  cases: kits.reduce((a, k) => a + k.cases.length, 0),
} as Record<string, number>;

const src = readFileSync(
  new URL("../src/lib/generated/universe-counts.ts", import.meta.url),
  "utf8",
);
const m = src.match(/export const UNIVERSE_COUNTS = (\{[\s\S]*?\}) as const;/);
if (!m) {
  console.error("FAIL: src/lib/generated/universe-counts.ts missing UNIVERSE_COUNTS");
  process.exit(1);
}
const generated = JSON.parse(m[1]) as Record<string, number>;

const bad = Object.keys(derived).filter((k) => derived[k] !== generated[k]);
if (bad.length) {
  console.error("FAIL: stale universe-counts.ts — fix with: bun run gen:counts");
  for (const k of bad) console.error(`  ${k}: registry=${derived[k]} generated=${generated[k]}`);
  process.exit(1);
}
console.log(
  `strip counts OK — ${derived.companies} companies · ${derived.domains} domains · ` +
    `${derived.problems} problems · ${derived.theory} theory · ${derived.mcqs} mcqs · ` +
    `${derived.cases} cases — ALL PASS`,
);
