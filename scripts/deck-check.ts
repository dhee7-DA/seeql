// Full-deck audit + duplicate check — run over every case batch file.
import { config } from "dotenv";
config();
import Database from "bun:sqlite";
import { readFileSync, existsSync, copyFileSync, unlinkSync, mkdirSync } from "fs";

// copy db to a read-only audit copy (same convention as case-audit.ts)
const AUDIT_COPY = "scripts/.audit-full.db";
if (existsSync(AUDIT_COPY)) unlinkSync(AUDIT_COPY);
copyFileSync("db/custom.db", AUDIT_COPY);

const files = [
  "src/lib/curriculum/cases/cases-b1.ts",
  "src/lib/curriculum/cases/cases-b2a.ts",
  "src/lib/curriculum/cases/cases-b2b.ts",
  "src/lib/curriculum/cases/cases-b3a.ts",
  "src/lib/curriculum/cases/cases-b3b.ts",
  "src/lib/curriculum/cases/cases-b4a.ts",
  "src/lib/curriculum/cases/cases-b4b.ts",
  "src/lib/curriculum/cases/cases-b5a.ts",
  "src/lib/curriculum/cases/cases-b5b.ts",
  "src/lib/curriculum/cases/cases-b6a.ts",
  "src/lib/curriculum/cases/cases-b6b.ts",
  "src/lib/curriculum/cases/cases-b7a.ts",
  "src/lib/curriculum/cases/cases-b7b.ts",
  "src/lib/curriculum/cases/cases-b8a.ts",
  "src/lib/curriculum/cases/cases-b8b.ts",
  "src/lib/curriculum/cases/cases-b9.ts",
  "src/lib/curriculum/cases/cases-cea.ts",
  "src/lib/curriculum/cases/cases-ceb.ts",
  "src/lib/curriculum/cases/cases-cha1.ts",
  "src/lib/curriculum/cases/cases-chb1.ts",
  "src/lib/curriculum/cases/cases-cha2.ts",
  "src/lib/curriculum/cases/cases-chb2.ts",
];

// duplicate ids + titles + filled SQL across the whole deck
const { CASES } = await import("../src/lib/curriculum/cases/index.ts");
const ids = new Map<string, number>();
const titles = new Map<string, number>();
const fills = new Map<string, number>();
for (const c of CASES) {
  ids.set(c.id, (ids.get(c.id) ?? 0) + 1);
  titles.set(c.title, (titles.get(c.title) ?? 0) + 1);
  const filled = c.template.replace(/\{(\d+)\}/g, (_, n) => c.slots[Number(n) - 1].answer);
  fills.set(filled, (fills.get(filled) ?? 0) + 1);
}
const dupIds = [...ids.entries()].filter(([, n]) => n > 1);
const dupTitles = [...titles.entries()].filter(([, n]) => n > 1);
const dupFills = [...fills.entries()].filter(([, n]) => n > 1);
console.log(`deck: ${CASES.length} cases | dup ids: ${dupIds.length} | dup titles: ${dupTitles.length} | dup filled SQL: ${dupFills.length}`);
for (const [id] of dupIds) console.log("  DUP ID:", id);
for (const [t] of dupTitles) console.log("  DUP TITLE:", t);
const tiers: Record<string, number> = {};
for (const c of CASES) tiers[c.tier] = (tiers[c.tier] ?? 0) + 1;
console.log("tiers:", JSON.stringify(tiers));
const noTier = CASES.filter((c) => !c.tier);
if (noTier.length) console.log("MISSING TIER:", noTier.map((c) => c.id).join(","));
