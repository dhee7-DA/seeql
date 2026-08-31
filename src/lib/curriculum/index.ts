// Module registry for the Learn mode. Add future modules here
// (joins, aggregation deep-dive, data cleaning, window functions…).

import type { CourseModule, MCQ } from "./types";
import { lesson01 } from "./lessons/lesson-01";
import { lesson02 } from "./lessons/lesson-02";
import { lesson03 } from "./lessons/lesson-03";
import { lesson04 } from "./lessons/lesson-04";
import { lesson05 } from "./lessons/lesson-05";
import { lesson06 } from "./lessons/lesson-06";
import { lesson07 } from "./lessons/lesson-07";
import { lesson08 } from "./lessons/lesson-08";
import { caseStudies } from "./case-studies";

/**
 * Deterministically spread the correct-answer positions across A–D.
 * Authoring naturally clusters correct options at B — a small hash-driven
 * rotation of the options array (and the answer index) rebalances positions
 * without changing any option text or correctness. Stable per MCQ id, so a
 * learner always sees the same order.
 */
function rebalance(mcqs: MCQ[]): MCQ[] {
  return mcqs.map((m) => {
    let h = 2166136261;
    for (let i = 0; i < m.id.length; i++) {
      h ^= m.id.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const target = Math.abs(h) % m.options.length;
    const shift = (target - m.answer + m.options.length) % m.options.length;
    if (shift === 0) return m;
    const options = m.options.map(
      (_, i) => m.options[(i + shift) % m.options.length],
    );
    return { ...m, options, answer: target };
  });
}

function withRebalancedMcqs(mod: CourseModule): CourseModule {
  return {
    ...mod,
    lessons: mod.lessons.map((l) => ({ ...l, mcqs: rebalance(l.mcqs) })),
  };
}

export const FOUNDATIONS_MODULE: CourseModule = {
  id: "foundations",
  title: "SQL Foundations",
  tagline: "From zero to confident single-table analysis",
  description:
    "The complete groundwork for data analysis: how tables and keys work, reading data with SELECT, filtering with WHERE, surviving NULLs, sorting and topping results, deduplication, aggregates, and the GROUP BY mental model — every concept practiced live on a messy real-world storefront database.",
  level: "Beginner",
  lessons: [
    lesson01,
    lesson02,
    lesson03,
    lesson04,
    lesson05,
    lesson06,
    lesson07,
    lesson08,
  ],
  caseStudies,
};

/** The module as learners see it: MCQ answer positions rebalanced. */
export const FOUNDATIONS_MODULE_FINAL = withRebalancedMcqs(FOUNDATIONS_MODULE);

export const COURSE_MODULES: CourseModule[] = [FOUNDATIONS_MODULE_FINAL];

export * from "./types";
