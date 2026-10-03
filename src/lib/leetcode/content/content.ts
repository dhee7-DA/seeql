// Deep-dive content index — maps slug → full report. Phase 1 covers the
// NeetCode learning path's first six categories (38 problems). Later phases
// append topic files here and the UI picks them up automatically.

import type { LcDeepDive, LcSqlDive } from "../types";
import { ARRAYS } from "./arrays";
import { TWO_POINTERS } from "./two-pointers";
import { SLIDING } from "./sliding";
import { STACK } from "./stack";
import { BINARY_SEARCH } from "./binary-search";
import { LINKED_LIST } from "./linked-list";
import { SQL_SELECT } from "./sql-select";
import { SQL_JOINS } from "./sql-joins";
import { SQL_AGG } from "./sql-agg";
import { SQL_GROUP } from "./sql-group";
import { SQL_ADVANCED } from "./sql-advanced";
import { SQL_SUBQUERIES } from "./sql-subqueries";
import { SQL_STRINGS } from "./sql-strings";

export const LC_CONTENT: LcDeepDive[] = [
  ...ARRAYS,
  ...TWO_POINTERS,
  ...SLIDING,
  ...STACK,
  ...BINARY_SEARCH,
  ...LINKED_LIST,
];

/** SQL 50 deep-dives — solved in the in-app SQLite sandbox. */
export const LC_SQL_CONTENT: LcSqlDive[] = [
  ...SQL_SELECT,
  ...SQL_JOINS,
  ...SQL_AGG,
  ...SQL_GROUP,
  ...SQL_ADVANCED,
  ...SQL_SUBQUERIES,
  ...SQL_STRINGS,
];

const bySlug = new Map(LC_CONTENT.map((d) => [d.slug, d]));

/** Full deep-dive for a problem, if authored. */
export const lcDeepDive = (slug: string) => bySlug.get(slug);

const sqlBySlug = new Map(LC_SQL_CONTENT.map((d) => [d.slug, d]));

/** SQL deep-dive (sandbox-graded) for a problem, if authored. */
export const lcSqlDive = (slug: string) => sqlBySlug.get(slug);

/** Slugs with authored deep-dives of either kind (consumed by the registry). */
export const CONTENT_SLUGS: string[] = [...LC_CONTENT, ...LC_SQL_CONTENT].map((d) => d.slug);
