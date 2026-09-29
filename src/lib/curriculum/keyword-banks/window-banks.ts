// Keyword Mastery banks — Scalar & Window Toolkit (M5 gap closers).
// OVER & PARTITION BY +6 MCQs; ROW_NUMBER +18; NTILE +10;
// FIRST_VALUE & LAST_VALUE +42 MCQs +22 cases (cs-2446..2467) +24 problems;
// PERCENT_RANK & CUME_DIST +27 MCQs +12 problems; Running totals +26 MCQs
// +5 problems; Text functions +44 MCQs; CAST & types +43 MCQs +6 cases
// (cs-2468..2473); Math & rounding +25 MCQs. All facts probed via
// scripts/m5-facts{,2}.ts; every problem solution executes against the seed db.
import type { KeywordBank } from "./index";
import { windowMcqsOver } from "./window-mcqs-over";
import { windowMcqsRn } from "./window-mcqs-rn";
import { windowMcqsNt } from "./window-mcqs-nt";
import { windowMcqsFvA } from "./window-mcqs-fv-a";
import { windowMcqsFvB } from "./window-mcqs-fv-b";
import { windowMcqsPrA } from "./window-mcqs-pr-a";
import { windowMcqsPrB } from "./window-mcqs-pr-b";
import { windowMcqsRtA } from "./window-mcqs-rt-a";
import { windowMcqsRtB } from "./window-mcqs-rt-b";
import { windowMcqsTxA } from "./window-mcqs-tx-a";
import { windowMcqsTxB } from "./window-mcqs-tx-b";
import { windowMcqsCtA } from "./window-mcqs-ct-a";
import { windowMcqsCtB } from "./window-mcqs-ct-b";
import { windowMcqsMr } from "./window-mcqs-mr";
import { windowCasesA } from "./window-cases-a";
import { windowCasesB } from "./window-cases-b";
import { windowProblemsA } from "./window-problems-a";
import { windowProblemsB } from "./window-problems-b";

export const overPartitionBank: KeywordBank = {
  kw: "OVER & PARTITION BY",
  moduleNum: 5,
  mcqs: windowMcqsOver,
  cases: [],
  problems: [],
};

export const rowNumberBank: KeywordBank = {
  kw: "ROW_NUMBER",
  moduleNum: 5,
  mcqs: windowMcqsRn,
  cases: [],
  problems: [],
};

export const ntileBank: KeywordBank = {
  kw: "NTILE",
  moduleNum: 5,
  mcqs: windowMcqsNt,
  cases: [],
  problems: [],
};

export const firstLastValueBank: KeywordBank = {
  kw: "FIRST_VALUE & LAST_VALUE",
  moduleNum: 5,
  mcqs: [...windowMcqsFvA, ...windowMcqsFvB],
  cases: windowCasesA,
  problems: windowProblemsA,
};

export const percentRankBank: KeywordBank = {
  kw: "PERCENT_RANK & CUME_DIST",
  moduleNum: 5,
  mcqs: [...windowMcqsPrA, ...windowMcqsPrB],
  cases: [],
  problems: windowProblemsB.filter((pr) => pr.id.startsWith("kb-pr-")),
};

export const runningTotalsBank: KeywordBank = {
  kw: "Running totals",
  moduleNum: 5,
  mcqs: [...windowMcqsRtA, ...windowMcqsRtB],
  cases: [],
  problems: windowProblemsB.filter((pr) => pr.id.startsWith("kb-rt-")),
};

export const textFunctionsBank: KeywordBank = {
  kw: "Text functions",
  moduleNum: 5,
  mcqs: [...windowMcqsTxA, ...windowMcqsTxB],
  cases: [],
  problems: [],
};

export const castTypesBank: KeywordBank = {
  kw: "CAST & types",
  moduleNum: 5,
  mcqs: [...windowMcqsCtA, ...windowMcqsCtB],
  cases: windowCasesB.filter((c) => c.topic === "t1"),
  problems: [],
};

export const mathRoundingBank: KeywordBank = {
  kw: "Math & rounding",
  moduleNum: 5,
  mcqs: windowMcqsMr,
  cases: [],
  problems: [],
};
