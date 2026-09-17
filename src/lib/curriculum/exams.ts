// Module exams — a deterministic, time-boxed capstone per module.
// Each exam draws 8 MCQs + 4 fills from the module's lesson pool using a
// seeded shuffle: attempt 0 always sees the same deck, retakes rotate the
// seed so a retake is a fresh deal. Passing pays a one-time XP bonus.

import type { Fill, Mcq } from "./types";
import { MODULES } from "./lessons";
import { fillsFor } from "./fills";

export interface ExamQuestion {
  kind: "mcq" | "fill";
  mcq?: Mcq;
  fill?: Fill;
}

export interface Exam {
  moduleId: string;
  moduleNum: number;
  moduleTitle: string;
  minutes: number;
  questions: ExamQuestion[];
}

export const EXAM_MCQS = 8;
export const EXAM_FILLS = 4;
export const EXAM_MINUTES = 12;
/** Pass mark: 9 of 12 (75%). */
export const EXAM_PASS = 9;

/** Deterministic shuffle (mulberry32). */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    s = (s + ((t ^ (t >>> 14)) >>> 0)) | 0;
    const j = Math.floor((((s ^ (s >>> 15)) >>> 0) / 4294967296) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build the exam for a module. `attempt` (0-based) varies the deck on retakes. */
export function buildExam(moduleId: string, attempt = 0): Exam | null {
  const mod = MODULES.find((m) => m.id === moduleId);
  if (!mod) return null;
  const seed = mod.lessons.reduce((acc, l) => acc + l.num * 7919, attempt * 104729);
  const mcqs = seededShuffle(mod.lessons.flatMap((l) => l.mcqs), seed).slice(0, EXAM_MCQS);
  const fills = seededShuffle(
    mod.lessons.flatMap((l) => fillsFor(l.num)),
    seed ^ 0x9e3779b9,
  ).slice(0, EXAM_FILLS);

  // Interleave: two MCQs, then a fill, repeating — the mode switches feel
  // deliberate instead of two blocks of the same shape.
  const questions: ExamQuestion[] = [];
  let mi = 0;
  let fi = 0;
  while (mi < mcqs.length || fi < fills.length) {
    for (let k = 0; k < 2 && mi < mcqs.length; k++) questions.push({ kind: "mcq", mcq: mcqs[mi++] });
    if (fi < fills.length) questions.push({ kind: "fill", fill: fills[fi++] });
  }

  return {
    moduleId: mod.id,
    moduleNum: mod.num,
    moduleTitle: mod.title,
    minutes: EXAM_MINUTES,
    questions,
  };
}
