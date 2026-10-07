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
import { SQL_MORE_JOINS } from "./sql-more-joins";
import { SQL_MORE_AGG_A } from "./sql-more-agg-a";
import { SQL_MORE_AGG_B } from "./sql-more-agg-b";
import { SQL_MORE_DATES } from "./sql-more-dates";
import { SQL_MORE_PIVOTS } from "./sql-more-pivots";
import { SQL_MORE_STRINGS } from "./sql-more-strings";
import { SQL_MORE_PLATFORM } from "./sql-more-platform";
import { SQL_MORE2_WINDOWS } from "./sql-more2-windows";
import { SQL_MORE2_JOINS } from "./sql-more2-joins";
import { SQL_MORE2_ANALYTICS } from "./sql-more2-analytics";
import { SQL_MORE2_HACKERRANK } from "./sql-more2-hackerrank";
import { SQL_MORE2_DATALEMUR } from "./sql-more2-datalemur";

export const LC_CONTENT: LcDeepDive[] = [
  ...ARRAYS,
  ...TWO_POINTERS,
  ...SLIDING,
  ...STACK,
  ...BINARY_SEARCH,
  ...LINKED_LIST,
];

/** SQL deep-dives — the SQL 50 plus the two expansion batches, all
 *  sandbox-graded. */
export const LC_SQL_CONTENT: LcSqlDive[] = [
  ...SQL_SELECT,
  ...SQL_JOINS,
  ...SQL_AGG,
  ...SQL_GROUP,
  ...SQL_ADVANCED,
  ...SQL_SUBQUERIES,
  ...SQL_STRINGS,
  ...SQL_MORE_JOINS,
  ...SQL_MORE_AGG_A,
  ...SQL_MORE_AGG_B,
  ...SQL_MORE_DATES,
  ...SQL_MORE_PIVOTS,
  ...SQL_MORE_STRINGS,
  ...SQL_MORE_PLATFORM,
  ...SQL_MORE2_WINDOWS,
  ...SQL_MORE2_JOINS,
  ...SQL_MORE2_ANALYTICS,
  ...SQL_MORE2_HACKERRANK,
  ...SQL_MORE2_DATALEMUR,
];

const bySlug = new Map(LC_CONTENT.map((d) => [d.slug, d]));

/** Full deep-dive for a problem, if authored. */
export const lcDeepDive = (slug: string) => bySlug.get(slug);

const sqlBySlug = new Map(LC_SQL_CONTENT.map((d) => [d.slug, d]));

/** SQL deep-dive (sandbox-graded) for a problem, if authored. */
export const lcSqlDive = (slug: string) => sqlBySlug.get(slug);

/** Slugs with authored deep-dives of either kind (consumed by the registry). */
export const CONTENT_SLUGS: string[] = [...LC_CONTENT, ...LC_SQL_CONTENT].map((d) => d.slug);
