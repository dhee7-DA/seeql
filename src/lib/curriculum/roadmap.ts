// The 31-day sprint — a day-by-day roadmap across the whole course.
//
// Every lesson, every module exam and one drill-bank finale, arranged into
// 31 days with a hard gate: the next day stays locked until today's list is
// FULLY done — theory read, every quiz question answered correct, every
// graded query solved and every mapped case file rebuilt (module exams for
// exam items). Completion is never stored; it is DERIVED from the same
// ledgers the app already writes (xpEvents, mcqAttempts, exams), so the
// roadmap stays honest even if the material banks grow.
//
// Pure data + pure functions: progress slices are passed in, nothing here
// touches the store, localStorage or the window. Material counts (quiz
// questions, queries, case files, drills …) are computed live from the
// registries — sprintStats() cannot drift from the course.

import { LESSONS, MODULES } from "./lessons";
import type { Lesson } from "./types";
import { CASES, CASE_TOPICS, type CaseStudy } from "./cases";
import { allFills } from "./fills";
import { DRILL_SETS } from "./drills";
import { EXAM_MINUTES } from "./exams";
import type { ProgressState } from "./progress";

/** The slice of the progress store the gate math reads. */
export type ProgSlice = Pick<ProgressState, "xpEvents" | "mcqAttempts" | "exams">;

// ---- Roadmap data --------------------------------------------------------

export type RoadmapItem =
  | { kind: "lesson"; lessonId: string }
  | { kind: "exam"; moduleId: string }
  | { kind: "drills" };

export interface RoadmapDay {
  /** 1-based day number (index in ROADMAP + 1). */
  day: number;
  title: string;
  focus: string;
  items: RoadmapItem[];
}

const L = (num: number): RoadmapItem => ({
  kind: "lesson",
  lessonId: `lesson-${String(num).padStart(2, "0")}`,
});
const E = (moduleId: string): RoadmapItem => ({ kind: "exam", moduleId });

/** Budget for the Day-31 drill-bank clearing house (an honest estimate). */
export const DRILL_DAY_MINUTES = 120;

export const ROADMAP: RoadmapDay[] = [
  {
    day: 1,
    title: "Touch the database",
    focus: "Tables, keys, reading columns, and the row gate — your first live queries.",
    items: [L(1), L(2), L(3)],
  },
  {
    day: 2,
    title: "Shape the answer",
    focus: "Missing data, sorting, top-N and the uniqueness lens.",
    items: [L(4), L(5), L(6)],
  },
  {
    day: 3,
    title: "Buckets & the Module 1 gate",
    focus: "Aggregates, the GROUP BY mental model, then your first case week and exam.",
    items: [L(7), L(8), L(35), E("foundations")],
  },
  {
    day: 4,
    title: "First joins",
    focus: "Follow the foreign keys — two tables, INNER mechanics, three-table chains.",
    items: [L(9), L(10), L(11)],
  },
  {
    day: 5,
    title: "Joins that keep rows",
    focus: "LEFT JOIN preservation, anti-joins that find the holes, self-joins.",
    items: [L(12), L(13), L(14)],
  },
  {
    day: 6,
    title: "Join math & the Module 2 gate",
    focus: "Aggregates across tables, the fan-out trap, then the buyer case and exam.",
    items: [L(15), L(16), L(36), E("joins")],
  },
  {
    day: 7,
    title: "Stack result sets",
    focus: "UNION and UNION ALL — labels, arms and column alignment.",
    items: [L(17), L(18), L(19)],
  },
  {
    day: 8,
    title: "Diff, chain, branch",
    focus: "INTERSECT, EXCEPT, precedence, and CASE WHEN as the counting machine.",
    items: [L(20), L(21), L(22)],
  },
  {
    day: 9,
    title: "CASE at work & the Module 3 gate",
    focus: "Counters, pivots, custom sorts — then the merchandising case and exam.",
    items: [L(23), L(24), L(37), E("sets-case")],
  },
  {
    day: 10,
    title: "Queries inside queries",
    focus: "IN-lists, scalar probes, EXISTS per-row tests and derived tables.",
    items: [L(25), L(26), L(27)],
  },
  {
    day: 11,
    title: "CTEs & the Module 4 gate",
    focus: "WITH chains that read top-down, then the VIP shortlist case and exam.",
    items: [L(28), L(38), E("subqueries")],
  },
  {
    day: 12,
    title: "Text, types & the calendar",
    focus: "Reshape any value with SUBSTR/INSTR/CAST/COALESCE, then slice dates into buckets.",
    items: [L(29), L(30)],
  },
  {
    day: 13,
    title: "Windows I & II",
    focus: "Rank without collapsing rows; LAG/LEAD offsets and running totals.",
    items: [L(31), L(32)],
  },
  {
    day: 14,
    title: "The ops calendar & the Module 5 gate",
    focus: "Stage the toolkit in a real ops case, then sit the module exam.",
    items: [L(39), E("toolkit")],
  },
  {
    day: 15,
    title: "The expert joins",
    focus: "String aggregation, grand-total stacks, and every join shape hands-on.",
    items: [L(33), L(34)],
  },
  {
    day: 16,
    title: "The one-pager & the Module 6 gate",
    focus: "Build the executive summary case, then clear the clinic exam.",
    items: [L(40), E("clinic")],
  },
  {
    day: 17,
    title: "The write verbs",
    focus: "INSERT's column contract, UPDATE's WHERE discipline, DELETE safely.",
    items: [L(41), L(42), L(43)],
  },
  {
    day: 18,
    title: "Transactions & the Module 7 gate",
    focus: "UPSERT collisions, all-or-nothing transactions, the data-fix ticket, exam.",
    items: [L(44), L(50), E("writes")],
  },
  {
    day: 19,
    title: "Build the schema",
    focus: "CREATE TABLE constraints, ALTER & DROP evolution, views that save joins.",
    items: [L(45), L(46), L(47)],
  },
  {
    day: 20,
    title: "Speed & recursion & the Module 8 gate",
    focus: "Indexes and EXPLAIN QUERY PLAN, recursive CTE walks, the reporting layer, exam.",
    items: [L(48), L(49), L(51), E("schema")],
  },
  {
    day: 21,
    title: "The books",
    focus: "Invoices and payments in cents, running balances, the AR aging ladder.",
    items: [L(52), L(53), L(54)],
  },
  {
    day: 22,
    title: "Trends & the Module 9 gate",
    focus: "LAG growth rates, reconciliation, the advanced window tier — then the exam.",
    items: [L(55), L(56), L(57), E("finance")],
  },
  {
    day: 23,
    title: "Windows IV — OVER from first principles",
    focus: "The window frame of mind: evaluation order, partitions, why rows survive.",
    items: [L(58)],
  },
  {
    day: 24,
    title: "Windows V — the ranking playbook",
    focus: "Top-N per group, dedupe ranks, and the tie contracts of RANK family.",
    items: [L(59)],
  },
  {
    day: 25,
    title: "Windows VI — LAG & LEAD mastery",
    focus: "Deltas, streaks, first/last touch and the offset edge cases.",
    items: [L(60)],
  },
  {
    day: 26,
    title: "Windows VII — frames in full",
    focus: "ROWS vs RANGE vs GROUPS, EXCLUDE, and the LAST_VALUE trap.",
    items: [L(61)],
  },
  {
    day: 27,
    title: "Windows VIII — tiles, shares & standing",
    focus: "NTILE quartiles, PERCENT_RANK, CUME_DIST and Pareto concentration.",
    items: [L(62)],
  },
  {
    day: 28,
    title: "Windows IX — the pattern library",
    focus: "Gaps-and-islands, sessionization, YoY ladders and mixed boards.",
    items: [L(63)],
  },
  {
    day: 29,
    title: "The window final boss",
    focus: "One timed exam over the whole masterclass — pass at 9 of 12.",
    items: [E("windows")],
  },
  {
    day: 30,
    title: "Performance & index design",
    focus: "Read the plan, design the index, verify the verdict — then sit the module exam.",
    items: [L(64), E("performance")],
  },
  {
    day: 31,
    title: "Drill Yard graduation",
    focus: "The clearing house: every keyword drill bank answered correct, end to end.",
    items: [{ kind: "drills" }],
  },
];

// ---- Registry lookups ----------------------------------------------------

const LESSON_BY_ID = new Map<string, Lesson>(LESSONS.map((l) => [l.id, l]));

export function lessonById(id: string): Lesson | undefined {
  return LESSON_BY_ID.get(id);
}

export function moduleById(id: string) {
  return MODULES.find((m) => m.id === id);
}

/** Case files whose topic maps to this lesson number (memoized). */
const CASES_BY_LESSON = (() => {
  const map = new Map<number, CaseStudy[]>();
  for (const c of CASES) {
    const ln = CASE_TOPICS.find((t) => t.id === c.topic)?.lessonNum;
    if (ln == null) continue;
    const list = map.get(ln) ?? [];
    list.push(c);
    map.set(ln, list);
  }
  return map;
})();

export function casesForLessonNum(num: number): CaseStudy[] {
  return CASES_BY_LESSON.get(num) ?? [];
}

/** Total drill questions behind the Day-30 gate (memoized). */
export const DRILL_TOTAL = DRILL_SETS.reduce((a, s) => a + s.questions.length, 0);

function drillMastered(prog: ProgSlice): number {
  let n = 0;
  for (const s of DRILL_SETS) {
    for (const q of s.questions) {
      if (prog.mcqAttempts[q.id]?.correct === true) n++;
    }
  }
  return n;
}

// ---- Gate math -----------------------------------------------------------

export interface LessonSubProgress {
  mcqsDone: number;
  mcqsTotal: number;
  problemsDone: number;
  problemsTotal: number;
  casesDone: number;
  casesTotal: number;
}

/** Live sub-progress for one lesson: quiz + queries + its mapped case files.
 *  MCQ correctness uses the same ledger the lesson completion bonus reads. */
export function lessonSubProgress(lesson: Lesson, prog: ProgSlice): LessonSubProgress {
  const cases = casesForLessonNum(lesson.num);
  return {
    mcqsDone: lesson.mcqs.filter((m) => prog.mcqAttempts[m.id]?.correct === true).length,
    mcqsTotal: lesson.mcqs.length,
    problemsDone: lesson.problems.filter((p) => prog.xpEvents[`solve:${p.id}`] !== undefined).length,
    problemsTotal: lesson.problems.length,
    casesDone: cases.filter((c) => prog.xpEvents[`case:${c.id}`] !== undefined).length,
    casesTotal: cases.length,
  };
}

/** A lesson is done when the app itself paid the lesson-completion XP
 *  (all quiz correct + all queries solved) AND every mapped case file is
 *  rebuilt. Lessons without mapped cases skip that clause. */
export function lessonDone(lesson: Lesson, prog: ProgSlice): boolean {
  if (prog.xpEvents[`lesson:${lesson.id}`] === undefined) return false;
  const cases = casesForLessonNum(lesson.num);
  return cases.every((c) => prog.xpEvents[`case:${c.id}`] !== undefined);
}

/** One roadmap item's completion, derived entirely from ledgers. */
export function itemDone(item: RoadmapItem, prog: ProgSlice): boolean {
  switch (item.kind) {
    case "lesson": {
      const l = lessonById(item.lessonId);
      return l ? lessonDone(l, prog) : false;
    }
    case "exam":
      return prog.exams[item.moduleId]?.passedAt !== undefined;
    case "drills":
      return DRILL_TOTAL > 0 && drillMastered(prog) === DRILL_TOTAL;
  }
}

/** Hard gate: a day is complete only when EVERY item on it is complete. */
export function dayComplete(day: RoadmapDay, prog: ProgSlice): boolean {
  return day.items.every((i) => itemDone(i, prog));
}

/** Index (0-based) of the first incomplete day — ROADMAP.length when the
 *  whole sprint is cleared. This is where the blob sits. */
export function currentDayIndex(prog: ProgSlice): number {
  for (let i = 0; i < ROADMAP.length; i++) {
    if (!dayComplete(ROADMAP[i], prog)) return i;
  }
  return ROADMAP.length;
}

export function sprintCleared(prog: ProgSlice): boolean {
  return currentDayIndex(prog) >= ROADMAP.length;
}

/** Days before the current one are open (revisitable); the rest are locked. */
export function dayLocked(dayIndex: number, prog: ProgSlice): boolean {
  return dayIndex > currentDayIndex(prog);
}

// ---- Day math ------------------------------------------------------------

function itemMinutes(item: RoadmapItem): number {
  switch (item.kind) {
    case "lesson":
      return lessonById(item.lessonId)?.minutes ?? 0;
    case "exam":
      return EXAM_MINUTES;
    case "drills":
      return DRILL_DAY_MINUTES;
  }
}

/** Estimated minutes for a day's list (memoized — the plan is static). */
const MINUTES_BY_DAY = new Map<number, number>(
  ROADMAP.map((d) => [d.day, d.items.reduce((a, i) => a + itemMinutes(i), 0)]),
);

export function dayMinutes(day: RoadmapDay): number {
  return MINUTES_BY_DAY.get(day.day) ?? 0;
}

export interface DaySummary {
  lessons: number;
  mcqs: number;
  queries: number;
  cases: number;
  exams: number;
  /** true only for the Day-30 drill clearing house */
  drills: boolean;
}

/** "ON THIS DAY" volume, computed once from the static plan. */
const SUMMARY_BY_DAY = new Map<number, DaySummary>(
  ROADMAP.map((d) => {
    const s: DaySummary = { lessons: 0, mcqs: 0, queries: 0, cases: 0, exams: 0, drills: false };
    for (const item of d.items) {
      if (item.kind === "lesson") {
        const l = lessonById(item.lessonId);
        if (!l) continue;
        s.lessons++;
        s.mcqs += l.mcqs.length;
        s.queries += l.problems.length;
        s.cases += casesForLessonNum(l.num).length;
      } else if (item.kind === "exam") {
        s.exams++;
      } else {
        s.drills = true;
      }
    }
    return [d.day, s];
  }),
);

export function daySummary(day: RoadmapDay): DaySummary {
  return SUMMARY_BY_DAY.get(day.day) ?? { lessons: 0, mcqs: 0, queries: 0, cases: 0, exams: 0, drills: false };
}

// ---- Sprint census -------------------------------------------------------

export interface SprintStats {
  days: number;
  lessons: number;
  mcqs: number;
  queries: number;
  exams: number;
  fills: number;
  caseFiles: number;
  drills: number;
  minutes: number;
}

const STATS: SprintStats = {
  days: ROADMAP.length,
  lessons: LESSONS.length,
  mcqs: LESSONS.reduce((a, l) => a + l.mcqs.length, 0),
  queries: LESSONS.reduce((a, l) => a + l.problems.length, 0),
  exams: MODULES.length,
  fills: allFills().length,
  caseFiles: CASES.length,
  drills: DRILL_TOTAL,
  minutes: ROADMAP.reduce((a, d) => a + dayMinutes(d), 0),
};

/** Live material census for the sprint header — nothing hardcoded, so the
 *  numbers move by themselves when banks grow. */
export function sprintStats(): SprintStats {
  return STATS;
}
