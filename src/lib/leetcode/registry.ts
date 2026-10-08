// The Big 300 — the combined registry. ~300 unique problems deduped from
// NeetCode 150 (superset of Blind 75), Top Interview 150's uniques, the
// SQL 50 study list, and the famous extras that complete the set.
// Content authorship: statements/solutions are written fresh for this app;
// company tags are community-sourced interview-report knowledge.

import type { LcRef, LcDifficulty } from "./types";
import type { LcRow } from "./row";
import { NC150 } from "./registry-nc150";
import { TI150_EXTRAS } from "./registry-ti150";
import { SQL50 } from "./registry-sql50";
import { SQL_MORE } from "./registry-sql-more";
import { SQL_MORE2 } from "./registry-sql-more2";
import { SQL_MORE3 } from "./registry-sql-more3";
import { SQL_PREMIUM } from "./registry-sql-premium";
import { SQL_PREMIUM2 } from "./registry-sql-premium2";
import { SQL_PREMIUM3 } from "./registry-sql-premium3";
import { CONTENT_SLUGS } from "./content/content";

const DIFF: LcDifficulty[] = ["Easy", "Medium", "Hard"];

function expand(row: LcRow): LcRef {
  const [num, slug, title, diff, topics, lists, companies, free] = row;
  return {
    num,
    slug,
    title,
    difficulty: DIFF[diff],
    topics: topics.split("|"),
    lists: lists.split("|"),
    companies: companies.split("|"),
    free: free !== 0,
    // "SQL 50" = the official study list · "SQL 50+" = the expansion band —
    // both are sandbox-graded SQL problems.
    sql: /^SQL/.test(lists),
  };
}

/** Registry order: NeetCode topic order first (the canonical learning path),
 *  then TI150 uniques, then the extras, then the SQL 50. */
export const LC_ALL: LcRef[] = [...NC150, ...TI150_EXTRAS, ...SQL50, ...SQL_MORE, ...SQL_MORE2, ...SQL_MORE3, ...SQL_PREMIUM, ...SQL_PREMIUM2, ...SQL_PREMIUM3].map(expand);

const bySlug = new Map(LC_ALL.map((p) => [p.slug, p]));
export const lcBySlug = (slug: string) => bySlug.get(slug);

/** Deduped topic list in canonical learning order (NC150 category order). */
export const LC_TOPICS: string[] = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Heap",
  "Backtracking",
  "Graphs",
  "Advanced Graphs",
  "1-D DP",
  "2-D DP",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
  "SQL",
];

/** Problems in a topic (by primary topic; SQL topic matches the SQL 50). */
export function lcByTopic(topic: string): LcRef[] {
  if (topic === "SQL") return LC_ALL.filter((p) => p.sql);
  return LC_ALL.filter((p) => !p.sql && p.topics.includes(topic));
}

/** Every company mentioned, sorted by mention count desc. */
export const LC_COMPANIES: Array<{ name: string; count: number }> = (() => {
  const m = new Map<string, number>();
  for (const p of LC_ALL) for (const c of p.companies) m.set(c, (m.get(c) ?? 0) + 1);
  return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
})();

export function lcByCompany(name: string): LcRef[] {
  return LC_ALL.filter((p) => p.companies.includes(name));
}

/** Problems with a full deep-dive authored (Phase 1+). */
export const LC_DEEP_SLUGS = new Set(CONTENT_SLUGS);
