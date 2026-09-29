// Keyword Mastery banks — per-keyword gap closers for the Keyword Mastery
// program. Each bank targets ONE canonical keyword from the taxonomy
// dictionary and carries the extra MCQs / case files / graded problems that
// keyword needs to reach the program bar (50 MCQs / 30 cases / 30 queries,
// census multi-label counting). Items live OUTSIDE the lesson banks and the
// module gauntlets on purpose: exams keep drawing lesson-owned items only,
// and the gauntlet tier contract stays exactly 50/90/90 per module.
//
// Case ids: cs-2211..cs-2232 (earlier banks) + cs-2233..cs-2250 (non-equi);
// m02 gauntlet owns cs-2121..cs-2210.
import type { Mcq, Problem } from "../types";
import type { CaseStudy } from "../cases/types";

import { leftJoinBank } from "./left-join";
import { rightJoinBank } from "./right-join";
import { fullOuterJoinBank } from "./full-outer-join";
import { crossJoinBank } from "./cross-join";
import { selfJoinBank } from "./self-join";
import { antiJoinBank } from "./anti-join";
import { fanOutGrainBank } from "./fan-out-grain";
import { onVsWhereBank } from "./on-vs-where";
import { nonEquiJoinsBank } from "./non-equi-joins";

export interface KeywordBank {
  /** Canonical keyword, verbatim from keyword-taxonomy's dictionary. */
  kw: string;
  /** Owning module (attribution for tagging and the practice hub). */
  moduleNum: number;
  mcqs: Mcq[];
  cases: CaseStudy[];
  problems: Problem[];
}

export const KEYWORD_BANKS: KeywordBank[] = [
  leftJoinBank,
  rightJoinBank,
  fullOuterJoinBank,
  crossJoinBank,
  selfJoinBank,
  antiJoinBank,
  fanOutGrainBank,
  onVsWhereBank,
  nonEquiJoinsBank,
];

/** Every keyword-bank MCQ, in registry order. */
export const ALL_KEYWORD_BANK_MCQS: Mcq[] = KEYWORD_BANKS.flatMap((b) => b.mcqs);
/** Every keyword-bank case file, in registry order. */
export const ALL_KEYWORD_BANK_CASES: CaseStudy[] = KEYWORD_BANKS.flatMap((b) => b.cases);
/** Every keyword-bank graded problem, in registry order. */
export const ALL_KEYWORD_BANK_PROBLEMS: Problem[] = KEYWORD_BANKS.flatMap((b) => b.problems);

/** The bank written for one keyword, if any. */
export function bankFor(kw: string): KeywordBank | undefined {
  return KEYWORD_BANKS.find((b) => b.kw === kw);
}
