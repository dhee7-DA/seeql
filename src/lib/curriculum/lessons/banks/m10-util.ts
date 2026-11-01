// Task 41 — compact authoring helpers for the Module 10 (Window Functions
// Masterclass) banks. Tuple rows expand into full Mcq/Problem objects with
// stable ids (l5N-q* / l5N-p*) and grading targets resolved from EXPECTED.
// Pure data files export `ROWS: McqRow[] | ProbRow[]`; the lesson files call
// these builders so the inline lesson arrays stay the live material source.

import type { Mcq, Problem } from "../../types";
import { EXPECTED } from "../../expected";
import { M10_MISTAKES } from "./m10-mistakes";

export type McqRow = [
  prompt: string,
  choices: [string, string, string, string],
  answer: number,
  why: string,
  notes?: Array<[number, string]>,
  difficulty?: "easy" | "medium" | "hard",
];

export function mcqBank(prefix: string, rows: McqRow[]): Mcq[] {
  return rows.map((r, i) => ({
    id: `${prefix}-q${i + 1}`,
    prompt: r[0],
    choices: [...r[1]],
    answer: r[2],
    why: r[3],
    ...(r[4] && r[4].length > 0
      ? { notes: r[4].map(([choice, why]) => ({ choice, why })) }
      : {}),
    ...(r[5] ? { difficulty: r[5] } : {}),
  }));
}

export type ProbRow = [
  title: string,
  brief: string,
  hints: [string, string],
  difficulty: "easy" | "medium" | "hard",
  solution: string,
  mistakes?: Array<[string, string]>,
  ordered?: boolean,
];

export function probBank(prefix: string, rows: ProbRow[]): Problem[] {
  return rows.map((r, i) => {
    const id = `${prefix}-p${i + 1}`;
    return {
      id,
      title: r[0],
      brief: r[1],
      hints: r[2],
      difficulty: r[3],
      solution: r[4],
      mistakes: [
        ...(r[5] ?? []).map(([test, message]) => ({ test, message })),
        // Retrofit coaching keyed by problem id (see m10-mistakes.ts).
        ...(M10_MISTAKES[id] ?? []).map(([test, message]) => ({ test, message })),
      ],
      ...(r[6] === true ? { ordered: true } : {}),
      expected: EXPECTED[id],
    };
  });
}
