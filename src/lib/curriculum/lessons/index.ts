// SeeQL curriculum — Module 1 (SQL Foundations, lessons 1–8 + case study 35),
// Module 2 (Joins & Relationships, lessons 9–16 + case study 36),
// Module 3 (Set Operations & CASE, lessons 17–24 + case study 37),
// Module 4 (Subqueries & CTEs, lessons 25–28 + case study 38),
// Module 5 (Scalar & Window Toolkit, lessons 29–32 + case study 39),
// Module 6 (Expert Clinic, lessons 33–34 + case study 40),
// Module 7 (Data Modification, lessons 41–44 + case study 50) and
// Module 8 (Schema, Views & Beyond, lessons 45–49 + case study 51).
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
import { lesson35 } from "./lesson-35";
import { lesson36 } from "./lesson-36";
import { lesson37 } from "./lesson-37";
import { lesson38 } from "./lesson-38";
import { lesson39 } from "./lesson-39";
import { lesson40 } from "./lesson-40";
import { lesson41 } from "./lesson-41";
import { lesson42 } from "./lesson-42";
import { lesson43 } from "./lesson-43";
import { lesson44 } from "./lesson-44";
import { lesson45 } from "./lesson-45";
import { lesson46 } from "./lesson-46";
import { lesson47 } from "./lesson-47";
import { lesson48 } from "./lesson-48";
import { lesson49 } from "./lesson-49";
import { lesson50 } from "./lesson-50";
import { lesson51 } from "./lesson-51";

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
  lesson35,
  lesson36,
  lesson37,
  lesson38,
  lesson39,
  lesson40,
  lesson41,
  lesson42,
  lesson43,
  lesson44,
  lesson45,
  lesson46,
  lesson47,
  lesson48,
  lesson49,
  lesson50,
  lesson51,
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
    lessons: [lesson01, lesson02, lesson03, lesson04, lesson05, lesson06, lesson07, lesson08, lesson35],
  },
  {
    id: "joins",
    num: 2,
    title: "Joins & Relationships",
    level: "Intermediate",
    blurb:
      "The reason relational databases are relational: following foreign keys across tables with JOIN — inner mechanics, LEFT JOIN preservation, anti-joins, self-joins, aggregates across tables and the fan-out trap that inflates sums.",
    lessons: [lesson09, lesson10, lesson11, lesson12, lesson13, lesson14, lesson15, lesson16, lesson36],
  },
  {
    id: "sets-case",
    num: 3,
    title: "Set Operations & CASE",
    level: "Advanced",
    blurb:
      "Combine and branch: stacking result sets with UNION [ALL], the overlap and difference operators INTERSECT and EXCEPT, engine-precedence landmines proved live, and CASE as SQL's counting machine — counters, pivots and custom sorts, capped by a three-pattern report.",
    lessons: [lesson17, lesson18, lesson19, lesson20, lesson21, lesson22, lesson23, lesson24, lesson37],
  },
  {
    id: "subqueries",
    num: 4,
    title: "Subqueries & CTEs",
    level: "Advanced",
    blurb:
      "Queries inside queries: scalar values and IN-lists in WHERE, the NULL-safe EXISTS probe, correlated subqueries that read the outer row, derived tables that stage the aggregation before the join, and WITH chains that read top-down — every shape practiced against the same storefront.",
    lessons: [lesson25, lesson26, lesson27, lesson28, lesson38],
  },
  {
    id: "toolkit",
    num: 5,
    title: "Scalar & Window Toolkit",
    level: "Advanced",
    blurb:
      "The functions layer: reshaping text with SUBSTR/INSTR/CAST and the COALESCE promise kept, slicing dates into buckets with strftime and julianday, then the full window-function family — RANK and friends, LAG/LEAD offsets, running totals, frames and NTILE — on the same live storefront.",
    lessons: [lesson29, lesson30, lesson31, lesson32, lesson39],
  },
  {
    id: "clinic",
    num: 6,
    title: "Expert Clinic",
    level: "Expert",
    blurb:
      "The finishing school: string aggregation and the hand-built TOTAL stack SQLite's missing ROLLUP would give you, FILTER-clause censuses, and every join shape at last — RIGHT and FULL OUTER hands-on, the deliberate CROSS JOIN, and non-equi range joins with the bounds discipline that keeps fanout out.",
    lessons: [lesson33, lesson34, lesson40],
  },
  {
    id: "writes",
    num: 7,
    title: "Data Modification",
    level: "Expert",
    blurb:
      "Six modules of reading, then the write verbs: INSERT with the column-list contract and RETURNING, UPDATE's WHERE discipline and self-reading expressions, DELETE and the foreign-key fence, UPSERT's ON CONFLICT fork and the transaction that powers this course's sandbox — every statement executed for real, then rolled back.",
    lessons: [lesson41, lesson42, lesson43, lesson44, lesson50],
  },
  {
    id: "schema",
    num: 8,
    title: "Schema, Views & Beyond",
    level: "Expert",
    blurb:
      "Behind the tables: CREATE TABLE's constraint contract, ALTER and DROP for schema evolution, views that save a join under a name, indexes and EXPLAIN QUERY PLAN — the engine's own account of every query — and WITH RECURSIVE, the self-feeding query that generates sequences, month spines and org-chart walks.",
    lessons: [lesson45, lesson46, lesson47, lesson48, lesson49, lesson51],
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
