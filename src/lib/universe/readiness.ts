"use client";

// Readiness engine — turns the two progress ledgers (curriculum + universe)
// into a single "how ready am I for THIS company's screen" number plus the
// gap list that doubles as the study plan. Pure functions: stores in,
// plain objects out.

import type { CompanyKit } from "@/lib/companies/types";
import type { ProgressState } from "@/lib/curriculum/progress";
import type { UniverseState, UniverseMock } from "./progress";
import { kitMcqAccuracy } from "./progress";

export interface ReadinessPart {
  /** 0..1 contribution-ready ratio for this part. */
  pct: number;
  /** Human line for the breakdown row. */
  label: string;
}

export interface Readiness {
  /** 0..100 overall. */
  pct: number;
  parts: {
    /** Topic slugs solved from the SQL band (40%). */
    coverage: ReadinessPart & { done: number; total: number };
    /** Kit MCQs answered correct (30%) — kit tab + mocks merged. */
    mcq: ReadinessPart & { correct: number; attempted: number; total: number };
    /** Theory answers self-marked "nailed" (15%). */
    theory: ReadinessPart & { nailed: number; total: number };
    /** Best mock-screen % for this kit (15%). */
    mock: ReadinessPart & { best: number | null };
  };
  /** The study plan: highest-impact moves first, each with a jump target. */
  plan: StudyStep[];
}

export interface StudyStep {
  kind: "slug" | "mcq" | "theory" | "mock" | "done";
  title: string;
  why: string;
  /** Kit tab to open, when the step lives inside the kit page. */
  tab?: "plan" | "mcq" | "theory" | "mock";
}

/** Best mock % for one kit across per-kit screens AND omni rounds it fed. */
export function bestMockFor(kitId: string, mocks: UniverseMock[]): number | null {
  let best: number | null = null;
  for (const m of mocks) {
    if (!m.kitIds.includes(kitId)) continue;
    if (best === null || m.pct > best) best = m.pct;
  }
  return best;
}

const slugUniq = (slugs: string[]) => [...new Set(slugs)];

export function computeReadiness(
  kit: CompanyKit,
  progress: Pick<ProgressState, "xpEvents" | "mcqAttempts">,
  universe: Pick<UniverseState, "mockMcq" | "theoryMarks" | "mocks">,
): Readiness {
  // 1) topic coverage — every topic slug solved in the SQL band (lc: XP keys)
  const slugs = slugUniq(kit.topics.flatMap((t) => t.slugs));
  const done = slugs.filter((s) => progress.xpEvents[`lc:${s}`] !== undefined).length;
  const coveragePct = slugs.length ? done / slugs.length : 1;

  // 2) kit MCQ accuracy — tab attempts (useProgress) merged with mock attempts
  const kitMcqIds = kit.mcqs.map((m) => m.id);
  const acc = kitMcqAccuracy(kit.id, kitMcqIds, progress.mcqAttempts, universe.mockMcq);
  const mcqPct = kitMcqIds.length ? acc.correct / kitMcqIds.length : 1;

  // 3) theory nailed — best self-mark of 1 across the kit's questions
  const nailed = kit.theory.filter(
    (t) => universe.theoryMarks[`u:${kit.id}:${t.id}`]?.best === 1,
  ).length;
  const theoryPct = kit.theory.length ? nailed / kit.theory.length : 1;

  // 4) best mock for this kit (0 contribution until one is on the board)
  const mockBest = bestMockFor(kit.id, universe.mocks);
  const mockPct = mockBest === null ? 0 : mockBest / 100;

  const pct = Math.round(
    (coveragePct * 0.4 + mcqPct * 0.3 + theoryPct * 0.15 + mockPct * 0.15) * 100,
  );

  // ---- the plan: highest-impact, kit-page-order first -------------------
  const plan: StudyStep[] = [];

  const unsolvedTopics = kit.topics.filter((t) =>
    t.slugs.some((s) => progress.xpEvents[`lc:${s}`] === undefined),
  );
  for (const t of unsolvedTopics.slice(0, 4)) {
    const left = t.slugs.filter((s) => progress.xpEvents[`lc:${s}`] === undefined).length;
    plan.push({
      kind: "slug",
      title: `Master "${t.name}" — ${left} problem${left === 1 ? "" : "s"} left`,
      why: t.why,
      tab: "plan",
    });
  }

  if (acc.attempted < kitMcqIds.length) {
    plan.push({
      kind: "mcq",
      title: `Work the MCQ bank — ${kitMcqIds.length - acc.attempted} unseen of ${kitMcqIds.length}`,
      why: "Every trap they set, with coached notes on the tempting wrong answers.",
      tab: "mcq",
    });
  } else if (acc.correct < acc.attempted) {
    plan.push({
      kind: "mcq",
      title: `Re-run the ${acc.attempted - acc.correct} MCQ${acc.attempted - acc.correct === 1 ? "" : "s"} you missed`,
      why: "Misses are on the spaced-repetition ladder already — clear them here and the deck clears too.",
      tab: "mcq",
    });
  }

  if (nailed < kit.theory.length) {
    plan.push({
      kind: "theory",
      title: `Say the theory out loud — ${kit.theory.length - nailed} not yet nailed`,
      why: "Self-mark against the model answer; a nailed answer pays XP once and leaves the review deck.",
      tab: "theory",
    });
  }

  if (mockBest === null) {
    plan.push({
      kind: "mock",
      title: "Run your first 12-minute mock screen",
      why: "Six mixed-difficulty MCQs + two theory questions under the clock — the closest thing to the real call.",
      tab: "mock",
    });
  } else if (mockBest < 70) {
    plan.push({
      kind: "mock",
      title: `Re-mock — best so far ${mockBest}%, hiring signal is 70%`,
      why: "Fresh questions every run; the report shows exactly which topics leaked.",
      tab: "mock",
    });
  }

  if (plan.length === 0) {
    plan.push({
      kind: "done",
      title: "Fully prepped — every lane green",
      why: "Coverage, MCQs, theory and a 70%+ mock are all on the board. Keep it warm with an omni round from the Mock HQ.",
      tab: "mock",
    });
  }

  return {
    pct,
    parts: {
      coverage: {
        pct: coveragePct,
        done,
        total: slugs.length,
        label: "Topic problems solved in the SQL band",
      },
      mcq: {
        pct: kitMcqIds.length ? acc.correct / kitMcqIds.length : 1,
        correct: acc.correct,
        attempted: acc.attempted,
        total: kitMcqIds.length,
        label: "Kit MCQs answered correct (tab + mocks)",
      },
      theory: {
        pct: theoryPct,
        nailed,
        total: kit.theory.length,
        label: "Theory answers self-marked nailed",
      },
      mock: {
        pct: mockPct,
        best: mockBest,
        label: "Best mock screen",
      },
    },
    plan,
  };
}
