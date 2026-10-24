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
import { ARRAYS_2 } from "./arrays-2";
import { TWO_POINTERS_2 } from "./two-pointers-2";
import { STACK_2 } from "./stack-2";
import { BINARY_SEARCH_2 } from "./binary-search-2";
import { LINKED_LIST_2 } from "./linked-list-2";
import { TREES } from "./trees";
import { TREES_2 } from "./trees-2";
import { TRIES } from "./tries";
import { GRAPHS } from "./graphs";
import { GRAPHS_2 } from "./graphs-2";
import { ADVANCED_GRAPHS } from "./advanced-graphs";
import { BACKTRACKING } from "./backtracking";
import { DP_1D } from "./dp-1d";
import { DP_2D } from "./dp-2d";
import { GREEDY } from "./greedy";
import { HEAP } from "./heap";
import { INTERVALS } from "./intervals";
import { MATH_GEOMETRY } from "./math-geometry";
import { BIT_MANIP } from "./bit-manip";
import { STRINGS } from "./strings";
import { MISC } from "./misc";
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
import { SQL_PREMIUM3_STATS } from "./sql-premium3-stats";
import { SQL_PREMIUM3_COMMERCE } from "./sql-premium3-commerce";
import { SQL_PREMIUM3_ARENA } from "./sql-premium3-arena";
import { SQL_PREMIUM3_MOLD } from "./sql-premium3-mold";
import { SQL_PREMIUM3_OPS } from "./sql-premium3-ops";
import { SQL_PREMIUM3_FINALS } from "./sql-premium3-finales";
import { SQL_PREMIUM4_FLOW } from "./sql-premium4-flow";
import { SQL_PREMIUM4_MONEY } from "./sql-premium4-money";
import { SQL_PREMIUM4_STREAKS } from "./sql-premium4-streaks";
import { SQL_PREMIUM4_CITY } from "./sql-premium4-city";
import { SQL_PREMIUM4_BOARDS } from "./sql-premium4-boards";
import { SQL_PREMIUM4_SOCIAL } from "./sql-premium4-social";
import { SQL_PREMIUM5_TRENDS } from "./sql-premium5-trends";
import { SQL_PREMIUM5_SYSTEM } from "./sql-premium5-system";
import { SQL_PREMIUM5_LEAGUE } from "./sql-premium5-league";
import { SQL_PREMIUM5_GRAPH } from "./sql-premium5-graph";
import { SQL_PREMIUM5_PASSES } from "./sql-premium5-passes";
import { SQL_PREMIUM5_MARKET } from "./sql-premium5-market";
import { SQL_PREMIUM5_FINALS } from "./sql-premium5-finales";
import { SQL_FREE_CLASSICS } from "./sql-free-classics";
import { SQL_FREE_WINDOWS } from "./sql-free-windows";
import { SQL_FREE_PARSING } from "./sql-free-parsing";
import { SQL_FREE_ORG } from "./sql-free-org";
import { SQL_FREE_MARKET } from "./sql-free-market";
import { SQL_DF_METRICS } from "./sql-df-metrics";
import { SQL_DF_COHORTS } from "./sql-df-cohorts";
import { SQL_DF_MONEY } from "./sql-df-money";
import { SQL_DF_LEDGER } from "./sql-df-ledger";
import { SQL_DF_GROWTH_A } from "./sql-df-growth-a";
import { SQL_DF_GROWTH_B } from "./sql-df-growth-b";
import { SQL_DF_MARKETS_A } from "./sql-df-markets-a";
import { SQL_DF_MARKETS_B } from "./sql-df-markets-b";
import { SQL_DF_BANK_A } from "./sql-df-bank-a";
import { SQL_DF_BANK_B } from "./sql-df-bank-b";
import { SQL_DF_FRAUD_A } from "./sql-df-fraud-a";
import { SQL_DF_FRAUD_B } from "./sql-df-fraud-b";
import { SQL_DF_ACCT_A } from "./sql-df-acct-a";
import { SQL_DF_ACCT_B } from "./sql-df-acct-b";
import { SQL_DF_QUANT_A } from "./sql-df-quant-a";
import { SQL_DF_QUANT_B } from "./sql-df-quant-b";
import { SQL_DF_SAAS_A } from "./sql-df-saas-a";
import { SQL_DF_SAAS_B } from "./sql-df-saas-b";
import { SQL_DF_MKTG_A } from "./sql-df-mktg-a";
import { SQL_DF_MKTG_B } from "./sql-df-mktg-b";
import { SQL_DF_WH_A } from "./sql-df-wh-a";
import { SQL_DF_WH_B } from "./sql-df-wh-b";
import { SQL_DF_RETAIL_A } from "./sql-df-retail-a";
import { SQL_DF_RETAIL_B } from "./sql-df-retail-b";
import { SQL_FINAL_WAVE_A } from "./sql-final-wave-a";
import { SQL_FINAL_WAVE_B } from "./sql-final-wave-b";
import { SQL_BOSS_A } from "./sql-boss-a";
import { SQL_BOSS_B } from "./sql-boss-b";

export const LC_CONTENT: LcDeepDive[] = [
  ...ARRAYS,
  ...TWO_POINTERS,
  ...SLIDING,
  ...STACK,
  ...BINARY_SEARCH,
  ...LINKED_LIST,
  ...ARRAYS_2,
  ...TWO_POINTERS_2,
  ...STACK_2,
  ...BINARY_SEARCH_2,
  ...LINKED_LIST_2,
  ...TREES,
  ...TREES_2,
  ...TRIES,
  ...GRAPHS,
  ...GRAPHS_2,
  ...ADVANCED_GRAPHS,
  ...BACKTRACKING,
  ...DP_1D,
  ...DP_2D,
  ...GREEDY,
  ...HEAP,
  ...INTERVALS,
  ...MATH_GEOMETRY,
  ...BIT_MANIP,
  ...STRINGS,
  ...MISC,
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
  ...SQL_PREMIUM3_STATS,
  ...SQL_PREMIUM3_COMMERCE,
  ...SQL_PREMIUM3_ARENA,
  ...SQL_PREMIUM3_MOLD,
  ...SQL_PREMIUM3_OPS,
  ...SQL_PREMIUM3_FINALS,
  ...SQL_PREMIUM4_FLOW,
  ...SQL_PREMIUM4_MONEY,
  ...SQL_PREMIUM4_STREAKS,
  ...SQL_PREMIUM4_CITY,
  ...SQL_PREMIUM4_BOARDS,
  ...SQL_PREMIUM4_SOCIAL,
  ...SQL_PREMIUM5_TRENDS,
  ...SQL_PREMIUM5_SYSTEM,
  ...SQL_PREMIUM5_LEAGUE,
  ...SQL_PREMIUM5_GRAPH,
  ...SQL_PREMIUM5_PASSES,
  ...SQL_PREMIUM5_MARKET,
  ...SQL_PREMIUM5_FINALS,
  ...SQL_FREE_CLASSICS,
  ...SQL_FREE_WINDOWS,
  ...SQL_FREE_PARSING,
  ...SQL_FREE_ORG,
  ...SQL_FREE_MARKET,
  ...SQL_DF_METRICS,
  ...SQL_DF_COHORTS,
  ...SQL_DF_MONEY,
  ...SQL_DF_LEDGER,
  ...SQL_DF_GROWTH_A,
  ...SQL_DF_GROWTH_B,
  ...SQL_DF_MARKETS_A,
  ...SQL_DF_MARKETS_B,
  ...SQL_DF_BANK_A,
  ...SQL_DF_BANK_B,
  ...SQL_DF_FRAUD_A,
  ...SQL_DF_FRAUD_B,
  ...SQL_DF_ACCT_A,
  ...SQL_DF_ACCT_B,
  ...SQL_DF_QUANT_A,
  ...SQL_DF_QUANT_B,
  ...SQL_DF_SAAS_A,
  ...SQL_DF_SAAS_B,
  ...SQL_DF_MKTG_A,
  ...SQL_DF_MKTG_B,
  ...SQL_DF_WH_A,
  ...SQL_DF_WH_B,
  ...SQL_DF_RETAIL_A,
  ...SQL_DF_RETAIL_B,
  ...SQL_FINAL_WAVE_A,
  ...SQL_FINAL_WAVE_B,
  ...SQL_BOSS_A,
  ...SQL_BOSS_B,
];

const bySlug = new Map(LC_CONTENT.map((d) => [d.slug, d]));

/** Full deep-dive for a problem, if authored. */
export const lcDeepDive = (slug: string) => bySlug.get(slug);

const sqlBySlug = new Map(LC_SQL_CONTENT.map((d) => [d.slug, d]));

/** SQL deep-dive (sandbox-graded) for a problem, if authored. */
export const lcSqlDive = (slug: string) => sqlBySlug.get(slug);

/** Slugs with authored deep-dives of either kind (consumed by the registry). */
export const CONTENT_SLUGS: string[] = [...LC_CONTENT, ...LC_SQL_CONTENT].map((d) => d.slug);
