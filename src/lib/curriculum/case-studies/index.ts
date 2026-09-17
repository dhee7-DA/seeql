// Scenario case files, organized per lesson. Each file exports
// CASES_LNN: CaseStudy[] — the lesson number is the single source of truth
// (no id parsing). Every case's completed SQL is mechanically audited
// against the seed database by scripts/case-audit.ts.
//
// Coverage discipline: the 200 Foundations cases are written against the
// atom matrix in scripts/case-matrix.md (~65 skill atoms × scenario
// universes × trap types). Ground truth for every figure cited in a brief:
// scripts/facts-cases-out.txt and scripts/facts-m1-500-out.txt.
//
// XP: +12 per case, +6 first-pass bonus (gamification.XP). Cases never
// enroll in the review deck — they train brief-to-SQL translation.

import type { CaseStudy } from "../types";
import { CASES_L01 } from "./l01";
import { CASES_L02 } from "./l02";
import { CASES_L03 } from "./l03";
import { CASES_L04 } from "./l04";
import { CASES_L05 } from "./l05";
import { CASES_L06 } from "./l06";
import { CASES_L07 } from "./l07";
import { CASES_L08 } from "./l08";
import { CASES_L09 } from "./l09";
import { CASES_L10 } from "./l10";
import { CASES_L11 } from "./l11";
import { CASES_L35 } from "./l35";

const BY_LESSON: Array<[number, CaseStudy[]]> = [
  [1, CASES_L01],
  [2, CASES_L02],
  [3, CASES_L03],
  [4, CASES_L04],
  [5, CASES_L05],
  [6, CASES_L06],
  [7, CASES_L07],
  [8, CASES_L08],
  [9, CASES_L09],
  [10, CASES_L10],
  [11, CASES_L11],
  [35, CASES_L35],
];

const INDEX = new Map<number, CaseStudy[]>();
for (const [num, cases] of BY_LESSON) {
  INDEX.set(num, cases);
}

/** All cases for one lesson, in authored order. */
export function caseStudiesFor(lessonNum: number): CaseStudy[] {
  return INDEX.get(lessonNum) ?? [];
}

/** Every case in the course (audit + stats). */
export function allCaseStudies(): CaseStudy[] {
  return [...INDEX.values()].flat();
}
