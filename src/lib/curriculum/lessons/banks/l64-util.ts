// Module 11 (Query Performance & Index Design) authoring helpers.
// Extends the Module 10 tuple pattern with the two fields DDL problems need:
// `verify` (post-statement read) and `mutating` (sandboxed write grading).
// Pure data files export ROWS; lesson-64 calls the builders so the inline
// lesson arrays stay the live material source.

import type { Mcq, Problem } from "../../types";
import { EXPECTED } from "../../expected";

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

export type ProbRowX = [
  title: string,
  brief: string,
  hints: [string, string],
  difficulty: "easy" | "medium" | "hard",
  solution: string,
  mistakes?: Array<[string, string]>,
  ordered?: boolean,
  verify?: string,
  mutating?: boolean,
];

export function probBankX(prefix: string, rows: ProbRowX[]): Problem[] {
  return rows.map((r, i) => {
    const id = `${prefix}-p${i + 1}`;
    return {
      id,
      title: r[0],
      brief: r[1],
      hints: r[2],
      difficulty: r[3],
      solution: r[4],
      mistakes: (r[5] ?? []).map(([test, message]) => ({ test, message })),
      ...(r[6] === true ? { ordered: true } : {}),
      ...(r[7] ? { verify: r[7] } : {}),
      ...(r[8] === true ? { mutating: true } : {}),
      expected: EXPECTED[id],
    };
  });
}
