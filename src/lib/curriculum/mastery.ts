// Mastery engine — turns every practice signal the app records (lesson
// MCQs, mixed quiz, predict-the-output, error clinic, query golf,
// interview track, schema studio, explain-back) into a per-skill mastery
// picture. Pure functions + constants, no React, no storage.
//
// A "skill" is a SQL concept with a stable id shared across every practice
// format: banks tag their items with skill ids, recordSkill tallies
// right/wrong, and computeMastery folds the tallies (plus lesson MCQ
// attempts, mapped through LESSON_SKILLS) into graded mastery levels.

export interface SkillMeta {
  id: string;
  label: string;
  /** short "you own this when…" line for the map tooltip */
  owns: string;
}

/** The mastery skill set — the course's concept spine. */
export const SKILLS: SkillMeta[] = [
  { id: "select", label: "SELECT & FROM", owns: "project columns from the right table with confidence" },
  { id: "where", label: "WHERE filters", owns: "gate rows with comparisons, ranges and patterns" },
  { id: "null", label: "NULL handling", owns: "reason in three-valued logic; test with IS NULL, never =" },
  { id: "order-limit", label: "ORDER BY & LIMIT", owns: "sort deterministically and slice top-N" },
  { id: "aggregates", label: "Aggregates", owns: "collapse rows with COUNT/SUM/AVG/MIN/MAX" },
  { id: "groupby", label: "GROUP BY & HAVING", owns: "bucket by key, then gate the buckets" },
  { id: "joins", label: "JOINs", owns: "follow foreign keys without losing or duplicating rows" },
  { id: "setops", label: "UNION / INTERSECT / EXCEPT", owns: "stack, overlap and diff result sets" },
  { id: "case", label: "CASE expressions", owns: "branch per row and build pivots" },
  { id: "subqueries", label: "Subqueries & CTEs", owns: "stage intermediate results, scalar to CTE" },
  { id: "windows", label: "Window functions", owns: "rank, lag, and run totals without collapsing rows" },
  { id: "text-dates", label: "Text & dates", owns: "reshape strings and bucket timestamps" },
  { id: "writes", label: "INSERT / UPDATE / DELETE", owns: "modify data with the WHERE discipline" },
  { id: "schema", label: "Schema, views & indexes", owns: "shape tables, save joins, and read query plans" },
  { id: "debugging", label: "Debugging & errors", owns: "read an engine error and fix the cause" },
  { id: "finance", label: "Finance SQL", owns: "walk balances, aging and reconciliation in cents" },
];

export const SKILL_IDS = SKILLS.map((s) => s.id);

export function skillLabel(id: string): string {
  return SKILLS.find((s) => s.id === id)?.label ?? id;
}

/** Which skills each lesson trains — the bridge that maps lesson MCQ
 *  attempts into the mastery picture. Keyed by lesson number. */
export const LESSON_SKILLS: Record<number, string[]> = {
  1: ["select", "schema"],
  2: ["select"],
  3: ["where"],
  4: ["null"],
  5: ["order-limit"],
  6: ["select", "null"],
  7: ["aggregates"],
  8: ["groupby"],
  9: ["joins", "schema"],
  10: ["joins"],
  11: ["joins"],
  12: ["joins"],
  13: ["joins"],
  14: ["joins"],
  15: ["joins", "aggregates"],
  16: ["joins", "groupby"],
  17: ["setops"],
  18: ["setops"],
  19: ["setops"],
  20: ["setops"],
  21: ["setops"],
  22: ["case"],
  23: ["case", "groupby"],
  24: ["case", "setops"],
  25: ["subqueries"],
  26: ["subqueries"],
  27: ["subqueries"],
  28: ["subqueries"],
  29: ["text-dates", "null"],
  30: ["text-dates"],
  31: ["windows"],
  32: ["windows"],
  33: ["aggregates", "text-dates"],
  34: ["joins"],
  35: ["select", "groupby"],
  36: ["joins"],
  37: ["case", "setops"],
  38: ["subqueries"],
  39: ["windows", "groupby"],
  40: ["aggregates", "joins"],
  41: ["writes"],
  42: ["writes"],
  43: ["writes"],
  44: ["writes", "schema"],
  45: ["schema"],
  46: ["schema"],
  47: ["schema"],
  48: ["schema", "debugging"],
  49: ["subqueries", "schema"],
  50: ["writes", "debugging"],
  51: ["schema", "windows"],
  52: ["finance", "joins"],
  53: ["finance", "windows"],
  54: ["finance", "case"],
  55: ["finance", "windows"],
  56: ["finance", "debugging"],
  57: ["finance", "windows"],
};

export type MasteryLevel = "none" | "weak" | "shaky" | "solid" | "mastered";

export interface MasteryCell {
  skill: string;
  /** right + wrong signals folded in (lesson MCQs weigh 1 each) */
  right: number;
  wrong: number;
  attempts: number;
  /** right / attempts, 0..1 (null when untouched) */
  accuracy: number | null;
  level: MasteryLevel;
}

/** Fold all signals into per-skill mastery cells. */
export function computeMastery(
  skillAttempts: Record<string, { c: number; w: number }>,
  mcqAttempts: Record<string, { correct: boolean; firstTry: boolean }>,
): MasteryCell[] {
  const tally: Record<string, { right: number; wrong: number }> = {};
  for (const id of SKILL_IDS) tally[id] = { right: 0, wrong: 0 };

  const bump = (skill: string, correct: boolean, weight = 1) => {
    if (!tally[skill]) return;
    if (correct) tally[skill].right += weight;
    else tally[skill].wrong += weight;
  };

  // practice-lab signals — direct skill tags
  for (const [skill, t] of Object.entries(skillAttempts)) {
    if (!t) continue;
    bump(skill, true, t.c);
    bump(skill, false, t.w);
  }
  // lesson MCQ signals — mapped through the lesson → skills table
  for (const [mcqId, att] of Object.entries(mcqAttempts)) {
    const m = /^l(\d+)-q\d+$/.exec(mcqId);
    if (!m) continue;
    for (const skill of LESSON_SKILLS[Number(m[1])] ?? []) bump(skill, att.correct);
  }

  return SKILL_IDS.map((skill) => {
    const { right, wrong } = tally[skill];
    const attempts = right + wrong;
    const accuracy = attempts > 0 ? right / attempts : null;
    let level: MasteryLevel = "none";
    if (attempts >= 5 && accuracy! >= 0.9) level = "mastered";
    else if (attempts >= 3 && accuracy! >= 0.75) level = "solid";
    else if (attempts >= 2 && accuracy! >= 0.5) level = "shaky";
    else if (attempts > 0) level = "weak";
    return { skill, right, wrong, attempts, accuracy, level };
  });
}

export const LEVEL_TONE: Record<MasteryLevel, { label: string; cell: string; text: string }> = {
  none: { label: "untested", cell: "border-zinc-800 bg-zinc-900/60", text: "text-zinc-600" },
  weak: { label: "shaky", cell: "border-rose-400/50 bg-rose-400/10", text: "text-rose-300" },
  shaky: { label: "warming up", cell: "border-amber-400/50 bg-amber-400/10", text: "text-amber-300" },
  solid: { label: "solid", cell: "border-sky-400/50 bg-sky-400/10", text: "text-sky-300" },
  mastered: { label: "mastered", cell: "border-emerald-400/50 bg-emerald-400/10", text: "text-emerald-300" },
};

/** The weakest cells with actual signal, ordered worst-first. */
export function weakestSkills(cells: MasteryCell[], n: number): MasteryCell[] {
  return cells
    .filter((c) => c.attempts > 0 && c.level !== "mastered")
    .sort((a, b) => a.accuracy! - b.accuracy! || b.wrong - a.wrong)
    .slice(0, n);
}

/** Untouched skills, course order — the "go learn something new" lane. */
export function untestedSkills(cells: MasteryCell[], n: number): MasteryCell[] {
  return cells.filter((c) => c.attempts === 0).slice(0, n);
}
