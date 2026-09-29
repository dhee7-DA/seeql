// Keyword Mastery banks — Subqueries & CTEs (M4 gap closers).
// IN subqueries: +52 MCQs +19 problems; Scalar: +48 MCQs +15 cases (cs-2341..55);
// EXISTS: +50 MCQs +18 problems; Correlated: +36 MCQs +24 problems;
// Derived: +30 MCQs; WITH RECURSIVE: +40 MCQs +21 problems. All facts probed
// via scripts/m4-facts{,2}.ts + m4-verify-claims*.ts; every problem solution
// executes against the seed db (gen-expected verifies).
import type { KeywordBank } from "./index";
import { subqueryMcqsA } from "./subquery-mcqs-a";
import { subqueryMcqsB } from "./subquery-mcqs-b";
import { subqueryMcqsC } from "./subquery-mcqs-c";
import { subqueryMcqsD } from "./subquery-mcqs-d";
import { subqueryMcqsE } from "./subquery-mcqs-e";
import { subqueryMcqsF } from "./subquery-mcqs-f";
import { subqueryMcqsG } from "./subquery-mcqs-g";
import { subqueryMcqsH } from "./subquery-mcqs-h";
import { subqueryMcqsI } from "./subquery-mcqs-i";
import { subqueryMcqsJ } from "./subquery-mcqs-j";
import { subqueryMcqsK } from "./subquery-mcqs-k";
import { subqueryMcqsL } from "./subquery-mcqs-l";
import { subqueryProblemsA } from "./subquery-problems-a";
import { subqueryProblemsB } from "./subquery-problems-b";
import { subqueryProblemsC } from "./subquery-problems-c";
import { subqueryProblemsD } from "./subquery-problems-d";
import { subqueryCases } from "./subquery-cases";

export const inSubqueryBank: KeywordBank = {
  kw: "IN subqueries",
  moduleNum: 4,
  mcqs: [...subqueryMcqsA, ...subqueryMcqsB],
  cases: [],
  problems: subqueryProblemsA,
};

export const scalarSubqueryBank: KeywordBank = {
  kw: "Scalar subqueries",
  moduleNum: 4,
  mcqs: [...subqueryMcqsC, ...subqueryMcqsD],
  cases: subqueryCases,
  problems: [],
};

export const existsBank: KeywordBank = {
  kw: "EXISTS",
  moduleNum: 4,
  mcqs: [...subqueryMcqsE, ...subqueryMcqsF],
  cases: [],
  problems: subqueryProblemsB,
};

export const correlatedBank: KeywordBank = {
  kw: "Correlated subqueries",
  moduleNum: 4,
  mcqs: [...subqueryMcqsG, ...subqueryMcqsH],
  cases: [],
  problems: subqueryProblemsC,
};

export const derivedTableBank: KeywordBank = {
  kw: "Derived tables",
  moduleNum: 4,
  mcqs: [...subqueryMcqsI, ...subqueryMcqsJ],
  cases: [],
  problems: [],
};

export const recursiveCteBank: KeywordBank = {
  kw: "WITH RECURSIVE",
  moduleNum: 4,
  mcqs: [...subqueryMcqsK, ...subqueryMcqsL],
  cases: [],
  problems: subqueryProblemsD,
};
