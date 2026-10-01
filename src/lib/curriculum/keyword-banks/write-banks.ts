// Keyword Mastery banks — M7 Data Modification (writes). Six banks close the
// write-keyword gaps: INSERT, UPDATE, DELETE, UPSERT (ON CONFLICT), RETURNING,
// Transactions. Every problem is engine-verified by scripts/gen-expected.ts
// (sandboxed writes); every case is executed by scripts/m7-write-audit.ts
// (fresh db copy per case, correct fill lands, distractors differ).
import type { Mcq, Problem } from "../types";
import type { CaseStudy } from "../cases/types";
import type { KeywordBank } from "./index";

import { insertMcqs } from "./write-mcqs-insert";
import { updateMcqsA } from "./write-mcqs-update-a";
import { updateMcqsB } from "./write-mcqs-update-b";
import { deleteMcqsA } from "./write-mcqs-delete-a";
import { deleteMcqsB } from "./write-mcqs-delete-b";
import { upsertMcqsA } from "./write-mcqs-upsert-a";
import { upsertMcqsB } from "./write-mcqs-upsert-b";
import { returningMcqsA } from "./write-mcqs-returning-a";
import { returningMcqsB } from "./write-mcqs-returning-b";
import { transactionMcqsA } from "./write-mcqs-transactions-a";
import { transactionMcqsB } from "./write-mcqs-transactions-b";

import { writeCasesInsertA } from "./write-cases-insert-a";
import { writeCasesInsertB } from "./write-cases-insert-b";
import { writeCasesUpdateA } from "./write-cases-update-a";
import { writeCasesUpdateB } from "./write-cases-update-b";
import { writeCasesDeleteA } from "./write-cases-delete-a";
import { writeCasesDeleteB } from "./write-cases-delete-b";
import { writeCasesUpsertA } from "./write-cases-upsert-a";
import { writeCasesUpsertB } from "./write-cases-upsert-b";
import { writeCasesReturningA } from "./write-cases-returning-a";
import { writeCasesReturningB } from "./write-cases-returning-b";

import { insertProblems } from "./write-problems-insert";
import { updateProblems } from "./write-problems-update";
import { deleteProblems } from "./write-problems-delete";
import { upsertProblems } from "./write-problems-upsert";
import { returningProblems, transactionProblems } from "./write-problems-returning-txn";

const updateMcqs: Mcq[] = [...updateMcqsA, ...updateMcqsB];
const deleteMcqs: Mcq[] = [...deleteMcqsA, ...deleteMcqsB];
const upsertMcqs: Mcq[] = [...upsertMcqsA, ...upsertMcqsB];
const returningMcqs: Mcq[] = [...returningMcqsA, ...returningMcqsB];
const transactionMcqs: Mcq[] = [...transactionMcqsA, ...transactionMcqsB];

const insertCases: CaseStudy[] = [...writeCasesInsertA, ...writeCasesInsertB];
const updateCases: CaseStudy[] = [...writeCasesUpdateA, ...writeCasesUpdateB];
const deleteCases: CaseStudy[] = [...writeCasesDeleteA, ...writeCasesDeleteB];
const upsertCases: CaseStudy[] = [...writeCasesUpsertA, ...writeCasesUpsertB];
const returningCases: CaseStudy[] = [...writeCasesReturningA, ...writeCasesReturningB];

export const insertBank: KeywordBank = {
  kw: "INSERT", moduleNum: 7,
  mcqs: insertMcqs, cases: insertCases, problems: insertProblems,
};
export const updateBank: KeywordBank = {
  kw: "UPDATE", moduleNum: 7,
  mcqs: updateMcqs, cases: updateCases, problems: updateProblems,
};
export const deleteBank: KeywordBank = {
  kw: "DELETE", moduleNum: 7,
  mcqs: deleteMcqs, cases: deleteCases, problems: deleteProblems,
};
export const upsertBank: KeywordBank = {
  kw: "UPSERT (ON CONFLICT)", moduleNum: 7,
  mcqs: upsertMcqs, cases: upsertCases, problems: upsertProblems,
};
export const returningBank: KeywordBank = {
  kw: "RETURNING", moduleNum: 7,
  mcqs: returningMcqs, cases: returningCases, problems: returningProblems,
};
export const transactionsBank: KeywordBank = {
  kw: "Transactions", moduleNum: 7,
  mcqs: transactionMcqs, cases: [], problems: transactionProblems,
};
