// LeetCode band meta — every number the UI quotes, COMPUTED from the
// registries so copy can never drift again (the "Big 300" era is over:
// the registry grew, the labels follow the data now).
//
// Also home to the honor-system XP policy: verified solves pay LC_XP
// (Easy 10 / Medium 20 / Hard 35); a self-claimed solve pays half and
// lands on a separate ledger key so the UI can flag it honestly.

import { LC_ALL, LC_COMPANIES, LC_TOPICS, lcBySlug } from "./registry";
import { SQL_ALL_SECTIONS, SQL50_SECTIONS, DATAFIN_SECTIONS, sqlSectionOf } from "./sections";
import { LC_XP, lcSolveKey, type LcDifficulty, type LcRef } from "./types";

/* ------------------------------------------------------------------ */
/* Live counts — the anti-drift numbers                                */
/* ------------------------------------------------------------------ */

export const LC_TOTAL = LC_ALL.length;
export const LC_SQL_TOTAL = LC_ALL.filter((p) => p.sql).length;
export const LC_PYTHON_TOTAL = LC_ALL.filter((p) => !p.sql).length;
export const LC_SECTION_COUNT = SQL_ALL_SECTIONS.length;
export const LC_SQL50_COUNT = SQL50_SECTIONS.flatMap((s) => s.slugs).length;
export const LC_DATAFIN_COUNT = DATAFIN_SECTIONS.flatMap((s) => s.slugs).length;

export const DIFF_SPLIT: Record<LcDifficulty, number> = {
  Easy: LC_ALL.filter((p) => p.difficulty === "Easy").length,
  Medium: LC_ALL.filter((p) => p.difficulty === "Medium").length,
  Hard: LC_ALL.filter((p) => p.difficulty === "Hard").length,
};

/* ------------------------------------------------------------------ */
/* Honor-system XP — self-claimed solves pay half, on a flagged key    */
/* ------------------------------------------------------------------ */

/** Half of LC_XP — what "I solved it on leetcode.com" pays. */
export const HONOR_XP: Record<LcDifficulty, number> = {
  Easy: 5,
  Medium: 10,
  Hard: 15,
};

/** Ledger key for a self-claimed solve (distinct from the verified `lc:`). */
export const lcClaimKey = (slug: string) => `lc-claimed:${slug}`;

/** True when the xpEvents ledger holds a SOLVE for this slug — verified
 *  (lc:) or self-claimed (lc-claimed:). */
export function isLcSolved(xpEvents: Record<string, number>, slug: string): boolean {
  return xpEvents[lcSolveKey(slug)] !== undefined || xpEvents[lcClaimKey(slug)] !== undefined;
}

/** Extract the slug from any lc solve/claim ledger key (else undefined). */
export function lcKeySlug(key: string): string | undefined {
  if (key.startsWith("lc:")) return key.slice(3);
  if (key.startsWith("lc-claimed:")) return key.slice(11);
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Badge stats — one pass over the ledger feeds every lc badge test    */
/* ------------------------------------------------------------------ */

export interface LcBadgeStats {
  /** distinct problems solved (verified + claimed) */
  lcSolved: number;
  /** verified in the sandbox / code lab only */
  lcVerified: number;
  /** verified Hard problems */
  lcHardVerified: number;
  /** official SQL 50 study-list problems solved */
  lcSql50Solved: number;
  /** SQL skill sections with every problem solved */
  lcSectionsCleared: number;
  /** the whole Data & Finance band cleared */
  lcDatafinCleared: boolean;
}

const SQL50_SLUG_SET = new Set(SQL50_SECTIONS.flatMap((s) => s.slugs));

export function lcBadgeStats(xpEvents: Record<string, number>): LcBadgeStats {
  let solved = 0;
  let verified = 0;
  let hardVerified = 0;
  for (const key of Object.keys(xpEvents)) {
    const slug = lcKeySlug(key);
    if (!slug) continue;
    solved++;
    if (key.startsWith("lc:")) {
      verified++;
      if (lcBySlug(slug)?.difficulty === "Hard") hardVerified++;
    }
  }
  const sql50Solved = SQL50_SLUG_SET.size && [...SQL50_SLUG_SET].filter((s) => isLcSolved(xpEvents, s)).length;
  const sectionsCleared = SQL_ALL_SECTIONS.filter((sec) =>
    sec.slugs.every((s) => isLcSolved(xpEvents, s)),
  ).length;
  const datafinCleared = DATAFIN_SECTIONS.every((sec) => sec.slugs.every((s) => isLcSolved(xpEvents, s)));
  return { lcSolved: solved, lcVerified: verified, lcHardVerified: hardVerified, lcSql50Solved: sql50Solved, lcSectionsCleared: sectionsCleared, lcDatafinCleared: datafinCleared };
}

/* ------------------------------------------------------------------ */
/* Contest helpers                                                     */
/* ------------------------------------------------------------------ */

/** Companies with a deep enough pool to host a timed run — pseudo-tags
 *  ("LeetCode Premium", "HackerRank classic") excluded. */
export const CONTEST_COMPANIES: Array<{ name: string; count: number }> = LC_COMPANIES.filter(
  (c) => c.count >= 12 && !/premium|hackerrank/i.test(c.name),
);

/** Deterministic PRNG (mulberry32) — seeded shuffles so a given run id
 *  always re-derives the same problem set. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded shuffle — returns a new array. */
export function shuffleSeeded<T>(arr: readonly T[], rand: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const DIFF_RANK: Record<LcDifficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };

/** Build a contest problem set: company filter → seeded shuffle → stable
 *  Easy→Medium→Hard ordering → take n. */
export function contestSet(
  n: number,
  seed: number,
  company?: string,
): LcRef[] {
  const pool = LC_ALL.filter(
    (p) => p.sql && (!company || company === "All" || p.companies.includes(company)),
  );
  const shuffled = shuffleSeeded(pool, seededRandom(seed));
  return shuffled
    .sort((a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty])
    .slice(0, n);
}

/* ------------------------------------------------------------------ */
/* Re-exports so components can import one meta module                 */
/* ------------------------------------------------------------------ */

export { LC_ALL, LC_TOPICS, lcBySlug, sqlSectionOf, LC_XP };
