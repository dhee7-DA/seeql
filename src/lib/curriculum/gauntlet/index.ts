// Module Gauntlets — module-end practice banks (Keyword Mastery program).
// A gauntlet is a module-scoped set: 50 MCQs + 90 case files (30/30/30 E/M/H)
// + 90 graded problems (30/30/30 E/M/H), all difficulty-tagged and
// engine-verified (gen-expected for problems, case-audit for cases).
// Gauntlet items live OUTSIDE the lesson banks on purpose: exams keep drawing
// lesson-owned items only, and the cs-NNN sort in cases/index.ts is untouched.
import type { Mcq, Problem } from "../types";
import type { CaseStudy } from "../cases/types";

export interface GauntletBank {
  moduleNum: number;
  title: string;
  mcqs: Mcq[];
  cases: CaseStudy[];
  problems: Problem[];
}

import { m01Mcqs } from "./m01-mcqs";
import { m01ProblemsEasy, m01ProblemsMedium } from "./m01-problems-a";
import { m01ProblemsHard } from "./m01-problems-b";
import { m01CasesEasyA } from "./m01-cases-easy-a";
import { m01CasesEasyB } from "./m01-cases-easy-b";
import { m01CasesMediumA } from "./m01-cases-medium-a";
import { m01CasesMediumB } from "./m01-cases-medium-b";
import { m01CasesHardA } from "./m01-cases-hard-a";
import { m01CasesHardB } from "./m01-cases-hard-b";
import { m02Mcqs } from "./m02-mcqs";
import { m02ProblemsEasy, m02ProblemsMedium } from "./m02-problems-a";
import { m02ProblemsHard } from "./m02-problems-b";
import { m02CasesEasyA } from "./m02-cases-easy-a";
import { m02CasesEasyB } from "./m02-cases-easy-b";
import { m02CasesMediumA } from "./m02-cases-medium-a";
import { m02CasesMediumB } from "./m02-cases-medium-b";
import { m02CasesHardA } from "./m02-cases-hard-a";
import { m02CasesHardB } from "./m02-cases-hard-b";
import { m03Mcqs } from "./m03-mcqs";
import { m03ProblemsEasy } from "./m03-problems-a";
import { m03ProblemsMedium } from "./m03-problems-b";
import { m03ProblemsHard } from "./m03-problems-c";
import { m03CasesEasyA } from "./m03-cases-easy-a";
import { m03CasesEasyB } from "./m03-cases-easy-b";
import { m03CasesMediumA } from "./m03-cases-medium-a";
import { m03CasesMediumB } from "./m03-cases-medium-b";
import { m03CasesHardA } from "./m03-cases-hard-a";
import { m03CasesHardB } from "./m03-cases-hard-b";

export const GAUNTLET_BANKS: GauntletBank[] = [
  {
    moduleNum: 1,
    title: "SQL Foundations",
    mcqs: m01Mcqs,
    cases: [...m01CasesEasyA, ...m01CasesEasyB, ...m01CasesMediumA, ...m01CasesMediumB, ...m01CasesHardA, ...m01CasesHardB],
    problems: [...m01ProblemsEasy, ...m01ProblemsMedium, ...m01ProblemsHard],
  },
  {
    moduleNum: 2,
    title: "Joins & Multi-Table Data",
    mcqs: m02Mcqs,
    cases: [...m02CasesEasyA, ...m02CasesEasyB, ...m02CasesMediumA, ...m02CasesMediumB, ...m02CasesHardA, ...m02CasesHardB],
    problems: [...m02ProblemsEasy, ...m02ProblemsMedium, ...m02ProblemsHard],
  },
  {
    moduleNum: 3,
    title: "Set Operations & CASE",
    mcqs: m03Mcqs,
    cases: [...m03CasesEasyA, ...m03CasesEasyB, ...m03CasesMediumA, ...m03CasesMediumB, ...m03CasesHardA, ...m03CasesHardB],
    problems: [...m03ProblemsEasy, ...m03ProblemsMedium, ...m03ProblemsHard],
  },
];

export function gauntletFor(moduleNum: number): GauntletBank | undefined {
  return GAUNTLET_BANKS.find((b) => b.moduleNum === moduleNum);
}

/** Every gauntlet MCQ, in bank order. */
export const ALL_GAUNTLET_MCQS: Mcq[] = GAUNTLET_BANKS.flatMap((b) => b.mcqs);
/** Every gauntlet case file, in bank order. */
export const ALL_GAUNTLET_CASES: CaseStudy[] = GAUNTLET_BANKS.flatMap((b) => b.cases);
/** Every gauntlet graded problem, in bank order. */
export const ALL_GAUNTLET_PROBLEMS: Problem[] = GAUNTLET_BANKS.flatMap((b) => b.problems);
