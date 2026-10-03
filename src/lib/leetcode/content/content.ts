// Deep-dive content index — maps slug → full report. Phase 1 covers the
// NeetCode learning path's first six categories (38 problems). Later phases
// append topic files here and the UI picks them up automatically.

import type { LcDeepDive } from "../types";
import { ARRAYS } from "./arrays";
import { TWO_POINTERS } from "./two-pointers";
import { SLIDING } from "./sliding";
import { STACK } from "./stack";
import { BINARY_SEARCH } from "./binary-search";
import { LINKED_LIST } from "./linked-list";

export const LC_CONTENT: LcDeepDive[] = [
  ...ARRAYS,
  ...TWO_POINTERS,
  ...SLIDING,
  ...STACK,
  ...BINARY_SEARCH,
  ...LINKED_LIST,
];

const bySlug = new Map(LC_CONTENT.map((d) => [d.slug, d]));

/** Full deep-dive for a problem, if authored. */
export const lcDeepDive = (slug: string) => bySlug.get(slug);

/** Slugs with authored deep-dives (consumed by the registry). */
export const CONTENT_SLUGS: string[] = LC_CONTENT.map((d) => d.slug);
