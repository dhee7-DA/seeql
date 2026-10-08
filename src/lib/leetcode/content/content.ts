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
import { SQL_MORE3_SELECT } from "./sql-more3-select";
import { SQL_MORE3_ENGAGEMENT } from "./sql-more3-engagement";
import { SQL_MORE3_MATCHUPS } from "./sql-more3-matchups";
import { SQL_MORE3_STREAKS } from "./sql-more3-streaks";
import { SQL_MORE3_FINALES } from "./sql-more3-finales";
import { SQL_MORE3_HACKERRANK } from "./sql-more3-hackerrank";
import { SQL_MORE3_DATALEMUR } from "./sql-more3-datalemur";
import { SQL_PREMIUM_WARMUPS } from "./sql-premium-warmups";
import { SQL_PREMIUM_COMMUNITY } from "./sql-premium-community";
import { SQL_PREMIUM_CONTENT } from "./sql-premium-content";
import { SQL_PREMIUM_TIME } from "./sql-premium-time";
import { SQL_PREMIUM_MONEY } from "./sql-premium-money";
import { SQL_PREMIUM_FINALES } from "./sql-premium-finales";
import { SQL_PREMIUM2_GAMES } from "./sql-premium2-games";
import { SQL_PREMIUM2_RANKINGS } from "./sql-premium2-rankings";
import { SQL_PREMIUM2_MARKET } from "./sql-premium2-market";
import { SQL_PREMIUM2_ORDERS } from "./sql-premium2-orders";
import { SQL_PREMIUM2_FINALS } from "./sql-premium2-finals";
import { SQL_PREMIUM2_USERS } from "./sql-premium2-users";

export const LC_CONTENT: LcDeepDive[] = [
  ...ARRAYS,
  ...TWO_POINTERS,
  ...SLIDING,
  ...STACK,
  ...BINARY_SEARCH,
  ...LINKED_LIST,
];

/** SQL deep-dives — the SQL 50, the expansion batches and the premium tier,
 *  all sandbox-graded. */
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
  ...SQL_MORE3_SELECT,
  ...SQL_MORE3_ENGAGEMENT,
  ...SQL_MORE3_MATCHUPS,
  ...SQL_MORE3_STREAKS,
  ...SQL_MORE3_FINALES,
  ...SQL_MORE3_HACKERRANK,
  ...SQL_MORE3_DATALEMUR,
  ...SQL_PREMIUM_WARMUPS,
  ...SQL_PREMIUM_COMMUNITY,
  ...SQL_PREMIUM_CONTENT,
  ...SQL_PREMIUM_TIME,
  ...SQL_PREMIUM_MONEY,
  ...SQL_PREMIUM_FINALES,
  ...SQL_PREMIUM2_GAMES,
  ...SQL_PREMIUM2_RANKINGS,
  ...SQL_PREMIUM2_MARKET,
  ...SQL_PREMIUM2_ORDERS,
  ...SQL_PREMIUM2_FINALS,
  ...SQL_PREMIUM2_USERS,
];

const bySlug = new Map(LC_CONTENT.map((d) => [d.slug, d]));

/** Full deep-dive for a problem, if authored. */
export const lcDeepDive = (slug: string) => bySlug.get(slug);

const sqlBySlug = new Map(LC_SQL_CONTENT.map((d) => [d.slug, d]));

/** SQL deep-dive (sandbox-graded) for a problem, if authored. */
export const lcSqlDive = (slug: string) => sqlBySlug.get(slug);

/** Slugs with authored deep-dives of either kind (consumed by the registry). */
export const CONTENT_SLUGS: string[] = [...LC_CONTENT, ...LC_SQL_CONTENT].map((d) => d.slug);
