// Keyword Mastery banks — M8 Schema pass (CREATE TABLE, ALTER & DROP, Views,
// Constraints). Four banks close the schema-keyword gaps: MCQs cite probed
// engine receipts (scripts/m8-facts*.ts), cases are chip-rebuild DDL audited
// by scripts/m8-schema-audit.ts, problems are sandboxed DDL graded by
// pragma/schema receipts via gen-expected.ts.
import type { Mcq, Problem } from "../types";
import type { CaseStudy } from "../cases/types";
import type { KeywordBank } from "./index";

import { schemaMcqsCreateA } from "./schema-mcqs-create-a";
import { schemaMcqsCreateB } from "./schema-mcqs-create-b";
import { schemaMcqsViews, schemaMcqsAlter } from "./schema-mcqs-views";

import { schemaCasesCreateA } from "./schema-cases-create-a";
import { schemaCasesCreateB } from "./schema-cases-create-b";

import { schemaProblemsCreate } from "./schema-problems-create";
import { schemaProblemsAlter } from "./schema-problems-alter";
import { schemaProblemsViews } from "./schema-problems-views";
import { schemaProblemsConstraints } from "./schema-problems-constraints";

const createMcqs: Mcq[] = [...schemaMcqsCreateA, ...schemaMcqsCreateB];
const createCases: CaseStudy[] = [...schemaCasesCreateA, ...schemaCasesCreateB];

export const createTableBank: KeywordBank = {
  kw: "CREATE TABLE", moduleNum: 8,
  mcqs: createMcqs, cases: createCases, problems: schemaProblemsCreate,
};
export const alterDropBank: KeywordBank = {
  kw: "ALTER & DROP", moduleNum: 8,
  mcqs: schemaMcqsAlter, cases: [], problems: schemaProblemsAlter,
};
export const viewsBank: KeywordBank = {
  kw: "Views", moduleNum: 8,
  mcqs: schemaMcqsViews, cases: [], problems: schemaProblemsViews,
};
export const constraintsBank: KeywordBank = {
  kw: "Constraints (PK/FK/UNIQUE…)", moduleNum: 8,
  mcqs: [], cases: [], problems: schemaProblemsConstraints,
};
