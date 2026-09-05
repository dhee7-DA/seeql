// Case Files registry — assembles all case-study batches into one deck,
// paged in id order. Batches are authored against the facts pool
// (scripts/facts/*.json) and mechanically audited against the live seed
// db (scripts/case-audit.ts).

import type { CaseStudy } from "./types";
import { casesExemplars } from "./exemplars";
import { casesB1 } from "./cases-b1";
import { casesB2a } from "./cases-b2a";
import { casesB2b } from "./cases-b2b";
import { casesB3a } from "./cases-b3a";
import { casesB3b } from "./cases-b3b";
import { casesB4a } from "./cases-b4a";
import { casesB4b } from "./cases-b4b";
import { casesB5a } from "./cases-b5a";
import { casesB5b } from "./cases-b5b";
import { casesB6a } from "./cases-b6a";
import { casesB6b } from "./cases-b6b";
import { casesB7a } from "./cases-b7a";
import { casesB7b } from "./cases-b7b";
import { casesB8a } from "./cases-b8a";
import { casesB8b } from "./cases-b8b";
import { casesB9 } from "./cases-b9";

export const CASES: CaseStudy[] = [
  ...casesExemplars,
  ...casesB1,
  ...casesB2a,
  ...casesB2b,
  ...casesB3a,
  ...casesB3b,
  ...casesB4a,
  ...casesB4b,
  ...casesB5a,
  ...casesB5b,
  ...casesB6a,
  ...casesB6b,
  ...casesB7a,
  ...casesB7b,
  ...casesB8a,
  ...casesB8b,
  ...casesB9,
].sort((a, b) => a.id.localeCompare(b.id));

export function caseById(id: string): CaseStudy | undefined {
  return CASES.find((c) => c.id === id);
}

export * from "./types";
