// Keyword-coverage census → JSON for the xlsx builder.
// Every count comes from the LIVE registries (same modules the app ships).
// Run: npx tsx scripts/keyword-coverage.ts
import { writeFileSync } from "node:fs";
import { LESSONS, MODULES, moduleOfLesson } from "../src/lib/curriculum/lessons/index";
import { CASES, CASE_TOPICS } from "../src/lib/curriculum/cases/index";
import { allFills, fillsFor } from "../src/lib/curriculum/fills/index";
import { DRILL_SETS } from "../src/lib/curriculum/drills/index";

const fillsByLesson = new Map<number, number>();
for (let n = 1; n <= 57; n++) fillsByLesson.set(n, fillsFor(n).length);

const casesByTopic = new Map<string, number>();
for (const c of CASES) casesByTopic.set(c.topic, (casesByTopic.get(c.topic) ?? 0) + 1);

const lessonByNum = new Map(LESSONS.map((l) => [l.num, l]));

function moduleOfNum(n: number | null): { num: number; title: string } {
  if (n === null) return { num: 1, title: MODULES[0].title + " (cross-lesson)" };
  const l = lessonByNum.get(n);
  if (!l) throw new Error(`no lesson ${n}`);
  const m = moduleOfLesson(l.id);
  return { num: m.num, title: m.title };
}

const topics = CASE_TOPICS.map((t) => {
  const mod = moduleOfNum(t.lessonNum);
  const l = t.lessonNum === null ? null : lessonByNum.get(t.lessonNum) ?? null;
  return {
    code: t.id,
    label: t.label,
    moduleNum: mod.num,
    moduleTitle: mod.title,
    lessonNum: t.lessonNum,
    cases: casesByTopic.get(t.id) ?? 0,
    mcqs: l?.mcqs.length ?? null,
    problems: l?.problems.length ?? null,
    fills: t.lessonNum === null ? null : fillsByLesson.get(t.lessonNum) ?? 0,
  };
});

const lessons = LESSONS.map((l) => {
  const m = moduleOfLesson(l.id);
  return {
    num: l.num,
    title: l.title,
    moduleNum: m.num,
    moduleTitle: m.title,
    minutes: l.minutes,
    mcqs: l.mcqs.length,
    problems: l.problems.length,
    cases: topics.filter((t) => t.lessonNum === l.num).reduce((a, t) => a + t.cases, 0),
    fills: fillsByLesson.get(l.num) ?? 0,
  };
});

const capCases = topics.filter((t) => t.lessonNum === null).reduce((a, t) => a + t.cases, 0);

const modules = MODULES.map((m) => {
  const ls = m.lessons;
  const nums = new Set(ls.map((l) => l.num));
  return {
    num: m.num,
    title: m.title,
    lessons: ls.length,
    minutes: ls.reduce((a, l) => a + l.minutes, 0),
    mcqs: ls.reduce((a, l) => a + l.mcqs.length, 0),
    problems: ls.reduce((a, l) => a + l.problems.length, 0),
    cases: topics
      .filter((t) => (t.lessonNum !== null && nums.has(t.lessonNum)) || (t.lessonNum === null && m.num === 1))
      .reduce((a, t) => a + t.cases, 0),
    fills: ls.reduce((a, l) => a + (fillsByLesson.get(l.num) ?? 0), 0),
    drills: DRILL_SETS.filter((s) => s.module === m.num).reduce((a, s) => a + s.questions.length, 0),
    exam: 1,
  };
});

const drills = DRILL_SETS.map((s) => ({
  keyword: s.keyword,
  label: s.label,
  module: s.module,
  questions: s.questions.length,
}));

const out = {
  topics,
  lessons,
  capCases,
  modules,
  drills,
  totals: {
    lessons: LESSONS.length,
    modules: MODULES.length,
    mcqs: LESSONS.reduce((a, l) => a + l.mcqs.length, 0),
    problems: LESSONS.reduce((a, l) => a + l.problems.length, 0),
    cases: CASES.length,
    fills: allFills().length,
    drills: DRILL_SETS.reduce((a, s) => a + s.questions.length, 0),
    drillSets: DRILL_SETS.length,
    topics: CASE_TOPICS.length,
    minutes: LESSONS.reduce((a, l) => a + l.minutes, 0),
  },
};

writeFileSync(new URL("./keyword-coverage.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(
  `topics ${out.totals.topics} · lessons ${out.totals.lessons} · mcqs ${out.totals.mcqs} · problems ${out.totals.problems} · cases ${out.totals.cases} (cap ${capCases}) · fills ${out.totals.fills} · drills ${out.totals.drills}/${out.totals.drillSets} sets`,
);
// consistency guards
const topicSum = topics.reduce((a, t) => a + t.cases, 0);
if (topicSum !== out.totals.cases) throw new Error(`topic case sum ${topicSum} != ${out.totals.cases}`);
const lessonCaseSum = lessons.reduce((a, l) => a + l.cases, 0) + capCases;
if (lessonCaseSum !== out.totals.cases) throw new Error(`lesson case sum ${lessonCaseSum} != ${out.totals.cases}`);
const modCaseSum = modules.reduce((a, m) => a + m.cases, 0);
if (modCaseSum !== out.totals.cases) throw new Error(`module case sum ${modCaseSum} != ${out.totals.cases}`);
const modMcqSum = modules.reduce((a, m) => a + m.mcqs, 0);
if (modMcqSum !== out.totals.mcqs) throw new Error(`module mcq sum ${modMcqSum} != ${out.totals.mcqs}`);
const modProbSum = modules.reduce((a, m) => a + m.problems, 0);
if (modProbSum !== out.totals.problems) throw new Error(`module problem sum ${modProbSum} != ${out.totals.problems}`);
console.log("consistency: all rollups reconcile");
