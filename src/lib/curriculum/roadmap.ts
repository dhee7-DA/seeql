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
    title: "Warehouse & star schemas",
    focus: "OLAP vs OLTP, star schema grain contracts, surrogate keys and SCD Type 2 history.",
    items: [L(65), L(66), L(67)],
  },
  {
    day: 32,
    title: "OLAP grammar & log triage",
    focus: "Rollups, drill-downs, ratio-to-parent, messy log triage and the staging pattern.",
    items: [L(68), L(69), L(70)],
  },
  {
    day: 33,
    title: "Conformed dimensions & warehouse gate",
    focus: "Shared conformed vocabularies, the gated metrics mart — then the Module 14 exam.",
    items: [L(71), L(72), E("dimensional")],
  },
  {
    day: 34,
    title: "Million-row firehose & scale rewrites",
    focus: "Measure 1M dirty rows honestly, composite/covering indexes, rewrites and Module 15 exam.",
    items: [L(73), L(74), L(75), E("messy-scale")],
  },
  {
    day: 35,
    title: "SQL dialects & portability",
    focus: "Translate PostgreSQL, BigQuery, MySQL & SQLite idioms cleanly — then Module 16 exam.",
    items: [L(76), L(77), L(78), E("dialects")],
  },
  {
    day: 36,
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
  exams: MODULES.filter((m) => m.lessons.length > 0).length,
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

// ---- Timetable & per-topic time allocation -------------------------------

export interface TopicTimeSplit {
  totalMin: number;
  theoryMin: number;
  quizMin: number;
  labMin: number;
}

/** Break a single lesson, exam, or drill block into study phases. */
export function topicTimeSplit(item: RoadmapItem): TopicTimeSplit {
  if (item.kind === "exam") {
    return { totalMin: EXAM_MINUTES, theoryMin: 0, quizMin: 8, labMin: 4 };
  }
  if (item.kind === "drills") {
    return { totalMin: DRILL_DAY_MINUTES, theoryMin: 0, quizMin: 60, labMin: 60 };
  }
  const l = lessonById(item.lessonId);
  const total = l?.minutes ?? 0;
  if (total <= 0) return { totalMin: 0, theoryMin: 0, quizMin: 0, labMin: 0 };
  const theoryMin = Math.max(3, Math.round(total * 0.25));
  const quizMin = (l?.mcqs.length ?? 0) > 0 ? Math.max(3, Math.round(total * 0.25)) : 0;
  const labMin = Math.max(1, total - theoryMin - quizMin);
  return { totalMin: total, theoryMin, quizMin, labMin };
}

export interface ModuleTimeBudget {
  moduleId: string;
  num: number;
  title: string;
  level: string;
  firstLessonId: string;
  lessonNums: number[];
  lessonCount: number;
  mcqCount: number;
  queryCount: number;
  caseCount: number;
  totalMinutes: number;
  split: TopicTimeSplit;
}

const MODULE_BUDGETS: ModuleTimeBudget[] = MODULES.filter((m) => m.lessons.length > 0)
  .sort((a, b) => a.num - b.num)
  .map((m) => {
    let totalMin = EXAM_MINUTES;
    let theoryMin = 0;
    let quizMin = 8;
    let labMin = 4;
    let mcqCount = 0;
    let queryCount = 0;
    let caseCount = 0;
    for (const l of m.lessons) {
      const sp = topicTimeSplit({ kind: "lesson", lessonId: l.id });
      totalMin += sp.totalMin;
      theoryMin += sp.theoryMin;
      quizMin += sp.quizMin;
      labMin += sp.labMin;
      mcqCount += l.mcqs.length;
      queryCount += l.problems.length;
      caseCount += casesForLessonNum(l.num).length;
    }
    return {
      moduleId: m.id,
      num: m.num,
      title: m.title,
      level: m.level,
      firstLessonId: m.lessons[0].id,
      lessonNums: m.lessons.map((l) => l.num),
      lessonCount: m.lessons.length,
      mcqCount,
      queryCount,
      caseCount,
      totalMinutes: totalMin,
      split: { totalMin, theoryMin, quizMin, labMin },
    };
  });

export function moduleTimeBudgets(): ModuleTimeBudget[] {
  return MODULE_BUDGETS;
}

export interface ScheduledTask {
  kind: RoadmapItem["kind"];
  label: string;
  sublabel: string;
  item: RoadmapItem;
  sprintDay: number;
  moduleId: string | null;
  moduleTitle: string;
  minutes: number;
  split: TopicTimeSplit;
  done: boolean;
  locked: boolean;
}

export interface TimetableSession {
  sessionNum: number;
  weekNum: number;
  dateIso: string;
  totalMinutes: number;
  tasks: ScheduledTask[];
  allDone: boolean;
  containsCurrentDay: boolean;
}

function addDaysIso(startIso: string, offsetDays: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startIso);
  const now = new Date();
  const baseMs = m
    ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const d = new Date(baseMs + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/**
 * Re-pack all 36 roadmap days (78 lessons + 14 exams + drills) into a realistic
 * calendar timetable matching the learner's chosen daily minute budget.
 */
export function buildTimetable(
  dailyBudgetMin: number,
  startDateIso: string,
  prog: ProgSlice,
): TimetableSession[] {
  const budget = Math.max(15, dailyBudgetMin);
  const curIdx = currentDayIndex(prog);
  const cleared = sprintCleared(prog);

  // Flatten roadmap items in pedagogical order, splitting the 120m drill yard
  // across chunks when the daily budget is smaller than 120 min.
  const queue: ScheduledTask[] = [];
  ROADMAP.forEach((d, dayIdx) => {
    const dayIsLocked = !cleared && dayIdx > curIdx;
    for (const item of d.items) {
      if (item.kind === "drills" && budget < DRILL_DAY_MINUTES) {
        const parts = Math.ceil(DRILL_DAY_MINUTES / budget);
        const perPart = Math.round(DRILL_DAY_MINUTES / parts);
        const done = itemDone(item, prog);
        for (let p = 0; p < parts; p++) {
          const split: TopicTimeSplit = {
            totalMin: perPart,
            theoryMin: 0,
            quizMin: Math.round(perPart / 2),
            labMin: perPart - Math.round(perPart / 2),
          };
          queue.push({
            kind: "drills",
            label: `Drill Yard (${p + 1}/${parts})`,
            sublabel: "Keyword drill banks · spacing & recall",
            item,
            sprintDay: d.day,
            moduleId: null,
            moduleTitle: "Graduation Drills",
            minutes: perPart,
            split,
            done,
            locked: dayIsLocked,
          });
        }
        continue;
      }

      const split = topicTimeSplit(item);
      const done = itemDone(item, prog);
      if (item.kind === "lesson") {
        const l = lessonById(item.lessonId);
        if (!l) continue;
        const mod = MODULES.find((m) => m.lessons.some((x) => x.id === l.id));
        queue.push({
          kind: "lesson",
          label: `L${l.num}: ${l.title}`,
          sublabel: `${l.mcqs.length} quiz · ${l.problems.length} SQL${casesForLessonNum(l.num).length > 0 ? ` · ${casesForLessonNum(l.num).length} cases` : ""}`,
          item,
          sprintDay: d.day,
          moduleId: mod?.id ?? null,
          moduleTitle: mod ? `M${mod.num}: ${mod.title}` : "Core",
          minutes: split.totalMin,
          split,
          done,
          locked: dayIsLocked,
        });
      } else if (item.kind === "exam") {
        const mod = moduleById(item.moduleId);
        queue.push({
          kind: "exam",
          label: `Module ${mod?.num ?? ""} Exam — ${mod?.title ?? item.moduleId}`,
          sublabel: "8 MCQs · 4 SQL fills · pass at 9/12",
          item,
          sprintDay: d.day,
          moduleId: item.moduleId,
          moduleTitle: mod ? `M${mod.num}: ${mod.title}` : "Exam",
          minutes: split.totalMin,
          split,
          done,
          locked: dayIsLocked,
        });
      } else {
        queue.push({
          kind: "drills",
          label: "Drill Yard Graduation",
          sublabel: `${DRILL_TOTAL} keyword drills end to end`,
          item,
          sprintDay: d.day,
          moduleId: null,
          moduleTitle: "Graduation Drills",
          minutes: split.totalMin,
          split,
          done,
          locked: dayIsLocked,
        });
      }
    }
  });

  const sessions: TimetableSession[] = [];
  let bucket: ScheduledTask[] = [];
  let bucketMin = 0;

  const flush = () => {
    if (bucket.length === 0) return;
    const sessionNum = sessions.length + 1;
    const weekNum = Math.floor((sessionNum - 1) / 7) + 1;
    const dateIso = addDaysIso(startDateIso, sessionNum - 1);
    const currentSprintDay = ROADMAP[curIdx]?.day ?? -1;
    sessions.push({
      sessionNum,
      weekNum,
      dateIso,
      totalMinutes: bucketMin,
      tasks: bucket,
      allDone: bucket.every((t) => t.done),
      containsCurrentDay: bucket.some((t) => t.sprintDay === currentSprintDay),
    });
    bucket = [];
    bucketMin = 0;
  };

  for (const task of queue) {
    // Allow gentle +15% slack so lessons aren't unnecessarily orphaned onto an extra day
    if (bucket.length > 0 && bucketMin + task.minutes > Math.round(budget * 1.15)) {
      flush();
    }
    bucket.push(task);
    bucketMin += task.minutes;
  }
  flush();

  return sessions;
}
