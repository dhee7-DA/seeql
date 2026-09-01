// SeeQL curriculum — Module 1 (SQL Foundations, lessons 1–8),
// Module 2 (Joins & Relationships, lessons 9–16),
// Module 3 (Set Operations & CASE, lessons 17–24) and
// Module 4 (Subqueries & CTEs, lessons 25–28) and
// Module 5 (Scalar & Window Toolkit, lessons 29–32) and
// Module 6 (Expert Clinic, lessons 33–34).
import type { Lesson } from "../types";
import { lesson01 } from "./lesson-01";
import { lesson02 } from "./lesson-02";
import { lesson03 } from "./lesson-03";
import { lesson04 } from "./lesson-04";
import { lesson05 } from "./lesson-05";
import { lesson06 } from "./lesson-06";
import { lesson07 } from "./lesson-07";
import { lesson08 } from "./lesson-08";
import { lesson09 } from "./lesson-09";
import { lesson10 } from "./lesson-10";
import { lesson11 } from "./lesson-11";
import { lesson12 } from "./lesson-12";
import { lesson13 } from "./lesson-13";
import { lesson14 } from "./lesson-14";
import { lesson15 } from "./lesson-15";
import { lesson16 } from "./lesson-16";
import { lesson17 } from "./lesson-17";
import { lesson18 } from "./lesson-18";
import { lesson19 } from "./lesson-19";
import { lesson20 } from "./lesson-20";
import { lesson21 } from "./lesson-21";
import { lesson22 } from "./lesson-22";
import { lesson23 } from "./lesson-23";
import { lesson24 } from "./lesson-24";
import { lesson25 } from "./lesson-25";
import { lesson26 } from "./lesson-26";
import { lesson27 } from "./lesson-27";
import { lesson28 } from "./lesson-28";
import { lesson29 } from "./lesson-29";
import { lesson30 } from "./lesson-30";
import { lesson31 } from "./lesson-31";
import { lesson32 } from "./lesson-32";
import { lesson33 } from "./lesson-33";
import { lesson34 } from "./lesson-34";

export const LESSONS: Lesson[] = [
  lesson01,
  lesson02,
  lesson03,
  lesson04,
  lesson05,
  lesson06,
  lesson07,
  lesson08,
  lesson09,
  lesson10,
  lesson11,
  lesson12,
  lesson13,
  lesson14,
  lesson15,
  lesson16,
  lesson17,
  lesson18,
  lesson19,
  lesson20,
  lesson21,
  lesson22,
  lesson23,
  lesson24,
  lesson25,
  lesson26,
  lesson27,
  lesson28,
  lesson29,
  lesson30,
  lesson31,
  lesson32,
  lesson33,
  lesson34,
];

export interface ModuleInfo {
  id: string;
  num: number;
  title: string;
  level: string;
  blurb: string;
}

export const MODULES: Array<ModuleInfo & { lessons: Lesson[] }> = [
  {
    id: "foundations",
    num: 1,
    title: "SQL Foundations",
    level: "Beginner",
    blurb:
      "From zero to confident single-table analysis: reading data, filtering, NULLs, sorting, deduplication, aggregates and the GROUP BY mental model — every concept practiced live on a real storefront database.",
    lessons: [lesson01, lesson02, lesson03, lesson04, lesson05, lesson06, lesson07, lesson08],
  },
  {
    id: "joins",
    num: 2,
    title: "Joins & Relationships",
    level: "Intermediate",
    blurb:
      "The reason relational databases are relational: following foreign keys across tables with JOIN — inner mechanics, LEFT JOIN preservation, anti-joins, self-joins, aggregates across tables and the fan-out trap that inflates sums.",
    lessons: [lesson09, lesson10, lesson11, lesson12, lesson13, lesson14, lesson15, lesson16],
  },
  {
    id: "sets-case",
    num: 3,
    title: "Set Operations & CASE",
    level: "Advanced",
    blurb:
      "Combine and branch: stacking result sets with UNION [ALL], the overlap and difference operators INTERSECT and EXCEPT, engine-precedence landmines proved live, and CASE as SQL's counting machine — counters, pivots and custom sorts, capped by a three-pattern report.",
    lessons: [lesson17, lesson18, lesson19, lesson20, lesson21, lesson22, lesson23, lesson24],
  },
  {
    id: "subqueries",
    num: 4,
    title: "Subqueries & CTEs",
    level: "Advanced",
    blurb:
      "Queries inside queries: scalar values and IN-lists in WHERE, the NULL-safe EXISTS probe, correlated subqueries that read the outer row, derived tables that stage the aggregation before the join, and WITH chains that read top-down — every shape practiced against the same storefront.",
    lessons: [lesson25, lesson26, lesson27, lesson28],
  },
  {
    id: "toolkit",
    num: 5,
    title: "Scalar & Window Toolkit",
    level: "Advanced",
    blurb:
      "The functions layer: reshaping text with SUBSTR/INSTR/CAST and the COALESCE promise kept, slicing dates into buckets with strftime and julianday, then the full window-function family — RANK and friends, LAG/LEAD offsets, running totals, frames and NTILE — on the same live storefront.",
    lessons: [lesson29, lesson30, lesson31, lesson32],
  },
  {
    id: "clinic",
    num: 6,
    title: "Expert Clinic",
    level: "Expert",
    blurb:
      "The finishing school: string aggregation and the hand-built TOTAL stack SQLite's missing ROLLUP would give you, FILTER-clause censuses, and every join shape at last — RIGHT and FULL OUTER hands-on, the deliberate CROSS JOIN, and non-equi range joins with the bounds discipline that keeps fanout out.",
    lessons: [lesson33, lesson34],
  },
];

/** Back-compat alias for consumers that only know Module 1. */
export const MODULE = {
  id: MODULES[0].id,
  title: MODULES[0].title,
  level: MODULES[0].level,
  blurb: MODULES[0].blurb,
};

export function lessonsOf(moduleId: string): Lesson[] {
  return MODULES.find((m) => m.id === moduleId)?.lessons ?? [];
}

export function moduleOfLesson(lessonId: string): ModuleInfo {
  const found = MODULES.find((m) => m.lessons.some((l) => l.id === lessonId));
  return found ?? MODULES[0];
}
