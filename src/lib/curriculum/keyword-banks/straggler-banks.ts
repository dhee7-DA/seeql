// Keyword Mastery banks — the FINAL straggler top-up (Task 54): LIKE &
// wildcards, AND / OR / NOT, COALESCE & NULLIF, HAVING, GROUP_CONCAT. These
// five keywords close the program at 61/61 — MCQs cite probed receipts
// (scripts/m8b-facts.ts), problems are engine-graded reads.
import type { KeywordBank } from "./index";

import { stragglerMcqsLikeA } from "./straggler-mcqs-like-a";
import { stragglerMcqsLikeB } from "./straggler-mcqs-like-b";
import { stragglerMcqsCoalesce, stragglerMcqsHaving } from "./straggler-mcqs-coalesce-having";
import { stragglerMcqsGroupConcat } from "./straggler-mcqs-groupconcat";
import { stragglerProblemsLike } from "./straggler-problems-like";
import { stragglerProblemsBoolean, stragglerProblemsGroupConcat } from "./straggler-problems-boolean";

export const likeBank: KeywordBank = {
  kw: "LIKE & wildcards", moduleNum: 1,
  mcqs: [...stragglerMcqsLikeA, ...stragglerMcqsLikeB], cases: [], problems: stragglerProblemsLike,
};
export const booleanBank: KeywordBank = {
  kw: "AND / OR / NOT", moduleNum: 1,
  mcqs: [], cases: [], problems: stragglerProblemsBoolean,
};
export const coalesceBank: KeywordBank = {
  kw: "COALESCE & NULLIF", moduleNum: 1,
  mcqs: stragglerMcqsCoalesce, cases: [], problems: [],
};
export const havingBank: KeywordBank = {
  kw: "HAVING", moduleNum: 2,
  mcqs: stragglerMcqsHaving, cases: [], problems: [],
};
export const groupConcatBank: KeywordBank = {
  kw: "GROUP_CONCAT", moduleNum: 2,
  mcqs: stragglerMcqsGroupConcat, cases: [], problems: stragglerProblemsGroupConcat,
};
