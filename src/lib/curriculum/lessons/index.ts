// SeeQL curriculum — Module 1 (SQL Foundations, lessons 1–8),
// Module 2 (Joins & Relationships, lessons 9–16) and
// Module 3 (Set Operations & CASE, lessons 17–24).
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
