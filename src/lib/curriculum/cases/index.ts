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
import { casesCEa } from "./cases-cea";
import { casesCEb } from "./cases-ceb";
import { casesCHa1 } from "./cases-cha1";
import { casesCHb1 } from "./cases-chb1";
import { casesCHa2 } from "./cases-cha2";
import { casesCHb2 } from "./cases-chb2";
import { casesJ1 } from "./cases-j1";
import { casesJ2 } from "./cases-j2";
import { casesJ3 } from "./cases-j3";
import { casesJ4 } from "./cases-j4";
import { casesJ5 } from "./cases-j5";
import { casesJ6 } from "./cases-j6";
import { casesS1 } from "./cases-s1";
import { casesS2 } from "./cases-s2";
import { casesS3 } from "./cases-s3";
import { casesS4 } from "./cases-s4";
import { casesS5 } from "./cases-s5";
import { casesS6 } from "./cases-s6";
import { casesQ1 } from "./cases-q1";
import { casesQ2 } from "./cases-q2";
import { casesQ3 } from "./cases-q3";
import { casesQ4 } from "./cases-q4";
import { casesQ5 } from "./cases-q5";
import { casesQ6 } from "./cases-q6";
import { casesT1 } from "./cases-t1";
import { casesT2 } from "./cases-t2";

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
  ...casesCEa,
  ...casesCEb,
  ...casesCHa1,
  ...casesCHb1,
  ...casesCHa2,
  ...casesCHb2,
  // Module 2 — Joins & Relationships (cs-301…cs-600)
  ...casesJ1,
  ...casesJ2,
  ...casesJ3,
  ...casesJ4,
  ...casesJ5,
  ...casesJ6,
  ...casesS1,
  ...casesS2,
  ...casesS3,
  ...casesS4,
  ...casesS5,
  ...casesS6,
  // Module 4 — Subqueries & CTEs (cs-901…cs-1200)
  ...casesQ1,
  ...casesQ2,
  ...casesQ3,
  ...casesQ4,
  ...casesQ5,
  ...casesQ6,
  // Module 5 — Scalar & Window Toolkit (cs-1201…cs-1500)
  ...casesT1,
  ...casesT2,
].sort((a, b) => Number(a.id.slice(3)) - Number(b.id.slice(3)));

export function caseById(id: string): CaseStudy | undefined {
  return CASES.find((c) => c.id === id);
}

export * from "./types";
