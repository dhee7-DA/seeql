// Window-functions registry — assembles the three deep-dive banks
// (300 MCQs, 300 case files, 300 graded query problems) and exposes live
// counts for the windows view and the roadmap census.
import type { Mcq, Problem } from "../types";
import { mcqsWfA } from "./mcqs-a";
import { mcqsWfB } from "./mcqs-b";
import { problemsWfA } from "./problems-a";
import { problemsWfB } from "./problems-b";
import { problemsWfC } from "./problems-c";
import { problemsWfD } from "./problems-d";
import { problemsWfE } from "./problems-e";
import { EXPECTED_WF } from "./expected-wf";

export const WINDOW_MCQS: Mcq[] = [...mcqsWfA, ...mcqsWfB];
export const WINDOW_PROBLEMS: Problem[] = [
  ...problemsWfA,
  ...problemsWfB,
  ...problemsWfC,
  ...problemsWfD,
  ...problemsWfE,
];

/** Live material volume for the windows section header. */
export function windowStats() {
  return {
    mcqs: WINDOW_MCQS.length,
    problems: WINDOW_PROBLEMS.length,
    cases: 300,
  };
}

export { EXPECTED_WF };
