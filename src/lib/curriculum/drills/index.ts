// Drill bank registry — aggregates every per-keyword set, grouped for the
// DrillYard picker. Adding a wave = append its set here; the UI, counts,
// and sessions pick it up automatically.

import type { DrillSet, DrillQ } from "./types";

import { SELECT_FROM } from "./m1/select-from";
import { WHERE } from "./m1/where";
import { NULL_DRILL } from "./m1/null";
import { ORDER_LIMIT } from "./m1/order-limit";
import { AGGREGATES } from "./m1/aggregates";
import { GROUPBY } from "./m1/groupby";
import { HAVING } from "./m1/having";
import { IN_DRILL } from "./m1/in";
import { BETWEEN } from "./m1/between";
import { LIKE } from "./m1/like";
import { AND_OR_NOT } from "./m1/and-or-not";
import { DISTINCT } from "./m1/distinct";
import { COALESCE } from "./m1/coalesce";
import { NULLIF_DRILL } from "./m1/nullif";
import { INNER_JOIN } from "./m2/inner-join";
import { LEFT_JOIN } from "./m2/left-join";
import { MULTI_JOIN } from "./m2/multi-join";
import { JOIN_AGGREGATE } from "./m2/join-aggregate";
import { ANTI_JOIN } from "./m2/anti-join";
import { SELF_JOIN } from "./m2/self-join";
import { ON_VS_WHERE } from "./m2/on-vs-where";
import { JOIN_EDGES } from "./m2/join-edges";
import { JOIN_SYNTAX } from "./m2/join-syntax";
import { JOIN_JUDGMENT } from "./m2/join-judgment";
import { UNION_DRILL } from "./m3/union";
import { INTERSECT_DRILL } from "./m3/intersect";
import { EXCEPT_DRILL } from "./m3/except";
import { SET_PRECEDENCE } from "./m3/set-precedence";
import { SET_ORDERING } from "./m3/set-ordering";
import { SET_EDGES } from "./m3/set-edges";
import { SET_JUDGMENT } from "./m3/set-judgment";
import { CASE_WHEN } from "./m3/case-when";
import { CASE_AGGREGATE } from "./m3/case-aggregate";
import { CASE_SORTS } from "./m3/case-sorts";
import { IN_SUBQUERY } from "./m4/in-subquery";
import { SCALAR_SUB } from "./m4/scalar-sub";
import { EXISTS_DRILL } from "./m4/exists";
import { CORRELATED } from "./m4/correlated";
import { DERIVED } from "./m4/derived";
import { CTE_DRILL } from "./m4/cte";
import { CTE_RECURSIVE } from "./m4/cte-recursive";
import { SUB_EDGES } from "./m4/sub-edges";
import { SUB_ERRORS } from "./m4/sub-errors";
import { SUB_JUDGMENT } from "./m4/sub-judgment";
import { RANK_FAMILY } from "./m5/rank-family";
import { WINDOW_RANK_DRILL } from "./m5/window-rank";
import { LAG_LEAD } from "./m5/lag-lead";
import { WINDOW_OFFSETS_DRILL } from "./m5/window-offsets";
import { TEXT_FUNCTIONS } from "./m5/text-functions";
import { TEXT_TOOLKIT_DRILL } from "./m5/text-toolkit";
import { CAST_COERCION } from "./m5/cast-coercion";
import { TYPE_CAST_DRILL } from "./m5/type-cast";
import { DATE_BUCKETS } from "./m5/date-buckets";
import { DATE_MATH } from "./m5/date-math";
import { PARTITION_WINDOWS } from "./m5/partition-windows";
import { FRAMES } from "./m5/frames";
import { WINDOW_FRAMES_DRILL } from "./m5/window-frames";
import { NTILE_DRILL } from "./m5/ntile";
import { DATE_EDGES_DRILL } from "./m5/date-edges";
import { WINDOW_EDGES_DRILL } from "./m5/window-edges";
import { WINDOW_JUDGMENT_DRILL } from "./m5/window-judgment";
import { OPS_CALENDAR } from "./m5/ops-calendar";
import { TOOLKIT_CAPSTONE_DRILL } from "./m5/toolkit-capstone";
import { NON_EQUI_JOINS } from "./m6/non-equi-joins";
import { OUTER_JOINS } from "./m6/outer-joins";
import { UPDATES_DELETES } from "./m7/updates-deletes";
import { UPSERT_RETURNING } from "./m7/upsert-returning";
import { TRANSACTIONS } from "./m7/transactions";
import { CREATE_TABLE } from "./m8/create-table";
import { INDEXES_EXPLAIN } from "./m11/indexes-explain";

function set(
  keyword: string, label: string, module: number, tier: DrillSet["tier"],
  blurb: string, questions: DrillQ[],
): DrillSet {
  return { keyword, label, module, tier, blurb, questions };
}

/** Every drill set in the bank, ordered module → tier → keyword. */
export const DRILL_SETS: DrillSet[] = [
  // ---- Module 1 · core ----
  set("select", "SELECT + FROM", 1, "core",
    "Projection and row sources — lists, aliases, literals, and the shapes output can take.",
    SELECT_FROM),
  set("where", "WHERE", 1, "core",
    "The row gate — comparisons, precedence receipts, the silent NULL failure, and filters that belong elsewhere.",
    WHERE),
  set("null", "NULL / IS NULL", 1, "core",
    "Three-valued logic — holes that are data, the = NULL trap, and the aggregates that skip them.",
    NULL_DRILL),
  set("order-limit", "ORDER BY + LIMIT", 1, "core",
    "Output promises — sort keys, ties and tiebreaks, top-N slices, and the pagination edge.",
    ORDER_LIMIT),
  set("aggregates", "Aggregates", 1, "core",
    "The collapse — COUNT variants, empty-set twins, AVG's moving denominator, and reading the five-stat row.",
    AGGREGATES),
  set("groupby", "GROUP BY", 1, "core",
    "The bucket machine — grain, keys and combinations, group-count sanity checks.",
    GROUPBY),
  set("having", "HAVING", 1, "core",
    "The group gate — WHERE's post-collapse twin, boundary predicates, and global go/no-go checks.",
    HAVING),
  // ---- Module 1 · secondary ----
  set("in", "IN", 1, "secondary",
    "Membership tests — the OR-chain twin, list traps, and the NOT IN NULL collapse.",
    IN_DRILL),
  set("between", "BETWEEN", 1, "secondary",
    "Closed ranges — inclusive ends, swapped-bound silence, and the datetime boundary trap.",
    BETWEEN),
  set("like", "LIKE", 1, "secondary",
    "Pattern matching — wildcards, case folding, and why leading % defeats indexes.",
    LIKE),
  set("and-or-not", "AND / OR / NOT", 1, "secondary",
    "Boolean assembly — precedence receipts (12 vs 5), De Morgan, and three-valued AND/OR.",
    AND_OR_NOT),
  set("distinct", "DISTINCT", 1, "secondary",
    "The uniqueness lens — tuple dedup, NULL collapsing, and the duplicate-hiding band-aid.",
    DISTINCT),
  set("coalesce", "COALESCE", 1, "secondary",
    "Fallback chains — first non-NULL, display defaults, and the empty-string trap.",
    COALESCE),
  set("nullif", "NULLIF", 1, "secondary",
    "Poison-value neutralizer — divide-by-zero guards and sentinel-to-hole mapping.",
    NULLIF_DRILL),
  // ---- Module 2 · core ----
  set("inner-join", "JOIN · ON", 2, "core",
    "The pairing machine — match rules, surviving pairs, and what an inner join keeps, drops, and multiplies.",
    INNER_JOIN),
  set("left-join", "LEFT JOIN", 2, "core",
    "Keep the left side — NULL-filled gaps, the ON-vs-WHERE collapse, and counts that finally add up.",
    LEFT_JOIN),
  set("multi-join", "Multi-table joins", 2, "core",
    "Three-table chains — hop-by-hop pairing through foreign keys without losing the grain.",
    MULTI_JOIN),
  set("join-aggregate", "JOIN + aggregates", 2, "core",
    "Reports across tables — GROUP BY over joins, the fan-out trap, and the aggregate-first fix.",
    JOIN_AGGREGATE),
  // ---- Module 2 · secondary ----
  set("anti-join", "Anti-join", 2, "secondary",
    "Finding the holes — LEFT JOIN + IS NULL, the NOT IN collapse, and NOT EXISTS.",
    ANTI_JOIN),
  set("self-join", "Self-join", 2, "secondary",
    "A table against itself — two aliases, mirror pairs, and the < guard.",
    SELF_JOIN),
  set("on-vs-where", "ON vs WHERE", 2, "secondary",
    "Predicate placement — inner equivalence, outer divergence, and the anti-join turn.",
    ON_VS_WHERE),
  set("join-edges", "Join edge cases", 2, "secondary",
    "When matching gets weird — NULL keys, duplicate keys, cross products, and type surprises.",
    JOIN_EDGES),
  set("join-syntax", "USING & aliases", 2, "secondary",
    "Grammar of joining — USING, NATURAL, CROSS, aliases and the errors they invite.",
    JOIN_SYNTAX),
  set("join-judgment", "Choosing joins", 2, "secondary",
    "Choosing the join — anchors, alternatives, and reading a query's intent before writing it.",
    JOIN_JUDGMENT),
  // ---- Module 3 · core ----
  set("union", "UNION & UNION ALL", 3, "core",
    "The stack — faithful appends, the dedup shredder, and arm shapes that must agree on count.",
    UNION_DRILL),
  set("intersect", "INTERSECT", 3, "core",
    "The overlap — whole-row matching, distinct-by-definition output, and venn-diagram middles.",
    INTERSECT_DRILL),
  set("except", "EXCEPT", 3, "core",
    "The subtraction — asymmetric difference, NULL-safe unlike NOT IN, and the audit instinct.",
    EXCEPT_DRILL),
  set("case-when", "CASE WHEN", 3, "core",
    "The switch yard — first match wins, forgotten ELSE leaks, and expressions that go anywhere.",
    CASE_WHEN),
  set("case-aggregate", "CASE + aggregates", 3, "core",
    "The voting machine — conditional counters, one-pass pivots, and honest zeros.",
    CASE_AGGREGATE),
  // ---- Module 3 · secondary ----
  set("set-precedence", "Set precedence & parens", 3, "secondary",
    "Chain ambiguity — SQLite's left-to-right law, the paren ban, and the subquery-wrap grouping.",
    SET_PRECEDENCE),
  set("set-ordering", "Ordering & shaping sets", 3, "secondary",
    "One sort to rule the stack — trailing ORDER BY, per-arm wraps, and first-arm naming.",
    SET_ORDERING),
  set("set-edges", "Set op edge cases", 3, "secondary",
    "Weird matching — NULL dedup, affinity across arms, self-stacks, and empty-arm annihilation.",
    SET_EDGES),
  set("set-judgment", "Choosing set ops", 3, "secondary",
    "When to stack, overlap, subtract — and when a join, IN-list, or CASE is the honest tool.",
    SET_JUDGMENT),
  set("case-sorts", "CASE sorts & labels", 3, "secondary",
    "Business order — rank CASEs in ORDER BY, label columns, and the closed-switch habit.",
    CASE_SORTS),
  // ---- Module 4 · core ----
  set("in-subquery", "IN + subquery", 4, "core",
    "Ask in two steps — the computed list, IN against it, and the NULL collapse NOT IN hides.",
    IN_SUBQUERY),
  set("scalar-sub", "Scalar subquery", 4, "core",
    "One value, one cell — scalars in WHERE, SELECT, and HAVING, and the zero-row vs multi-row traps.",
    SCALAR_SUB),
  set("exists", "EXISTS / NOT EXISTS", 4, "core",
    "The per-row probe — boolean semantics, the select-list that doesn't matter, and the NULL-safe anti-join.",
    EXISTS_DRILL),
  set("correlated", "Correlated subquery", 4, "core",
    "The per-row phone call — outer references, own-average comparisons, and the cost of re-running.",
    CORRELATED),
  set("derived", "Derived tables", 4, "core",
    "A query in FROM — staging stages, ghost column names, CO-ROUTINE streaming, and LIMIT-in-stage top-N.",
    DERIVED),
  set("cte", "CTE / WITH", 4, "core",
    "WITH, the readable subquery — named stages, double references, shadowing, and materialization receipts.",
    CTE_DRILL),
  // ---- Module 4 · secondary ----
  set("cte-recursive", "WITH RECURSIVE", 4, "secondary",
    "The self-feeding stage — anchor + step, termination, infinite-loop hazards, and honest non-use.",
    CTE_RECURSIVE),
  set("sub-edges", "Subquery edge cases", 4, "secondary",
    "Weird matching — NULL collapse, empty lists, silent first-row scalars, ghost rows, and one-row crowds.",
    SUB_EDGES),
  set("sub-errors", "Subquery errors", 4, "secondary",
    "Read the failure — misplaced aggregates, missing aliases, circular CTEs, and the bugs that never error.",
    SUB_ERRORS),
  set("sub-judgment", "Choosing subqueries", 4, "secondary",
    "Which shape when — IN vs EXISTS vs JOIN vs staged CTE, and the honest tool for each brief.",
    SUB_JUDGMENT),
  // ---- Module 5 · core ----
  set("ranking-windows", "Ranking windows", 5, "core",
    "The leaderboard family — ROW_NUMBER vs RANK vs DENSE_RANK, tie arithmetic, per-partition restarts, and top-N-per-group staging.",
    [...WINDOW_RANK_DRILL, ...RANK_FAMILY]),
  set("lag-lead", "LAG & LEAD", 5, "core",
    "The offset pair — previous and next rows, the first/last NULL fence, custom fallbacks, and deltas that make trends readable.",
    [...WINDOW_OFFSETS_DRILL, ...LAG_LEAD]),
  set("text-toolkit", "Text toolkit", 5, "core",
    "Reshape any value — SUBSTR slicing, INSTR locating, UPPER/LOWER/REPLACE, concatenation, and the case-folding fine print.",
    [...TEXT_TOOLKIT_DRILL, ...TEXT_FUNCTIONS]),
  set("cast-coercion", "CAST & coercion", 5, "core",
    "Types on demand — CAST truncation, SQLite's silent affinity rules, typeof receipts, and the coercions that never error.",
    [...CAST_COERCION, ...TYPE_CAST_DRILL]),
  set("date-buckets", "Date buckets (strftime)", 5, "core",
    "The calendar as groups — %Y/%m/%w buckets, weekday censuses, zero-padded contracts, and month counts that tie.",
    DATE_BUCKETS),
  set("date-math", "Date math (julianday)", 5, "core",
    "Arithmetic on time — date() modifiers, julianday diffs, month-end overflow, and ship-speed averages.",
    DATE_MATH),
  set("window-partitions", "PARTITION BY windows", 5, "core",
    "Windows with walls — per-region restarts, top-N-per-group staging, partition stamps, and the census partition SUM keeps.",
    PARTITION_WINDOWS),
  // ---- Module 5 · secondary ----
  set("window-frames", "Frames & running totals", 5, "secondary",
    "The moving window — default RANGE frames, ROWS alternatives, moving averages, and the grand-total reconciliation.",
    [...WINDOW_FRAMES_DRILL, ...FRAMES]),
  set("ntile", "NTILE", 5, "secondary",
    "Equal buckets — quartiles and percentiles, remainders dealt left to right, oversized tile counts, and the top-quartile filter.",
    NTILE_DRILL),
  set("date-edges", "Date edge cases", 5, "secondary",
    "When dates get weird — NULL shipped_at, unpadded strings that refuse to parse, boundary guards, and rounding the average.",
    DATE_EDGES_DRILL),
  set("window-edges", "Window edge cases", 5, "secondary",
    "When windows get weird — WHERE/HAVING bans, alias misuse, nested windows, empty partitions, and the ORDER BY loophole.",
    WINDOW_EDGES_DRILL),
  set("window-judgment", "Choosing windows", 5, "secondary",
    "Choosing the window — rank vs row_number, when GROUP BY is the honest tool, staging patterns, and reading intent.",
    WINDOW_JUDGMENT_DRILL),
  set("ops-calendar", "Ops calendar synthesis", 5, "secondary",
    "The Module 5 synthesis — month buckets, running lines, weekday censuses and ship speeds assembled into the ops calendar.",
    OPS_CALENDAR),
  set("toolkit-capstone", "Toolkit capstone", 5, "secondary",
    "Text, dates and windows in one pipeline — the full toolkit stack with the free reconciliation at the end.",
    TOOLKIT_CAPSTONE_DRILL),
  // ---- Module 6 · secondary (thin-spot patch wave) ----
  set("non-equi-joins", "Non-equi joins", 6, "secondary",
    "Matching without equals — band ladders, half-open bounds, the fanout disease, and pair censuses built from inequalities.",
    NON_EQUI_JOINS),
  set("outer-joins", "RIGHT / FULL JOIN", 6, "secondary",
    "The other keep sides — direction is spelling, ON decides matching, WHERE decides survival, and FULL keeps both ends.",
    OUTER_JOINS),
  // ---- Module 7 · secondary (thin-spot patch wave) ----
  set("updates-deletes", "UPDATE & DELETE", 7, "secondary",
    "Change and purge — self-referencing SET, the WHERE blast radius, affected counts, and the pre-count discipline.",
    UPDATES_DELETES),
  set("upsert-returning", "UPSERT & RETURNING", 7, "secondary",
    "Collision-safe writes — ON CONFLICT targets, the excluded row vocabulary, and writes that echo every row they touched.",
    UPSERT_RETURNING),
  set("transactions", "Transactions", 7, "secondary",
    "All-or-nothing — BEGIN/COMMIT/ROLLBACK, the sandbox that powers this course, and the invariants worth wrapping.",
    TRANSACTIONS),
  // ---- Module 8 · secondary (thin-spot patch wave) ----
  set("create-table", "CREATE TABLE", 8, "secondary",
    "Contracts in DDL — types as affinity, NOT NULL/DEFAULT/CHECK/UNIQUE, the rowid-alias PK, and reading schemas back.",
    CREATE_TABLE),
  // ---- Module 11 · secondary (thin-spot patch wave) ----
  set("indexes-explain", "Indexes & EXPLAIN", 11, "secondary",
    "Plans and structures — SCAN vs SEARCH, leftmost prefix, sort-serving, write costs, and the judgment to index nothing.",
    INDEXES_EXPLAIN),
];

export type { DrillSet, DrillQ, DrillTier, DrillAspect } from "./types";
export { ASPECT_LABELS } from "./types";

/** Total drill questions in the bank. */
export function drillTotal(): number {
  return DRILL_SETS.reduce((a, s) => a + s.questions.length, 0);
}

/** Drill questions for one module, tier-ordered. */
export function drillSetsForModule(moduleNum: number): DrillSet[] {
  return DRILL_SETS.filter((s) => s.module === moduleNum);
}

/** Which drill keywords belong inside which lesson's Drills tab.
 *  Concept lessons map to the keyword(s) they teach; case-study lessons
 *  and intros without a query focus have no entry (no tab rendered). */
export const LESSON_DRILLS: Record<string, string[]> = {
  "lesson-01": ["select"],                       // reading a table for the first time
  "lesson-02": ["select"],                       // SELECT & FROM
  "lesson-03": ["where", "and-or-not"],          // WHERE + boolean assembly
  "lesson-04": ["null"],                         // NULL
  "lesson-05": ["order-limit"],                  // ORDER BY & LIMIT
  "lesson-06": ["distinct"],                     // DISTINCT
  "lesson-07": ["aggregates"],                   // COUNT/SUM/AVG/MIN/MAX
  "lesson-08": ["groupby", "having"],            // GROUP BY & HAVING
  // ---- Module 2 (joins) ----
  "lesson-09": ["inner-join", "join-syntax"],    // first join: FKs, ON, aliases, USING
  "lesson-10": ["inner-join", "join-edges"],     // INNER JOIN mechanics: pairing, dropping, fan-out
  "lesson-11": ["multi-join"],                   // three-table chains
  "lesson-12": ["left-join"],                    // LEFT JOIN preservation
  "lesson-13": ["anti-join"],                    // LEFT JOIN + IS NULL pattern
  "lesson-14": ["self-join"],                    // table against itself
  "lesson-15": ["join-aggregate"],               // GROUP BY across joins + COUNT trap
  "lesson-16": ["on-vs-where", "join-judgment"], // capstone: predicate placement + choosing joins
  // ---- Module 3 (set ops & CASE) ----
  "lesson-17": ["union"],                        // UNION & UNION ALL: stacking, dedup
  "lesson-18": ["union", "set-ordering"],        // stacking real data: labels, arm shapes
  "lesson-19": ["intersect"],                    // overlap semantics, join contrast
  "lesson-20": ["except"],                       // subtraction, NULL-safety vs NOT IN
  "lesson-21": ["set-precedence"],               // chains, left-to-right law, subquery wrap
  "lesson-22": ["case-when"],                    // CASE mechanics: first match, ELSE
  "lesson-23": ["case-aggregate", "case-sorts"], // counters, pivots + custom sorts
  "lesson-24": ["set-judgment", "set-edges"],    // capstone: three patterns + weird matching
  // ---- Module 4 (subqueries & CTEs) ----
  "lesson-25": ["in-subquery", "scalar-sub"],    // IN + subquery, scalar forms
  "lesson-26": ["exists", "correlated"],         // EXISTS probe + correlation
  "lesson-27": ["derived"],                      // query in FROM
  "lesson-28": ["cte", "cte-recursive"],         // WITH stages + RECURSIVE
  "lesson-38": ["sub-judgment", "sub-edges", "sub-errors"], // capstone: choosing shapes + traps
  // ---- Module 5 (scalar & window toolkit) ----
  "lesson-29": ["text-toolkit", "cast-coercion"],               // text & type toolkit
  "lesson-30": ["date-buckets", "date-math"],                    // dates & buckets
  "lesson-31": ["ranking-windows", "window-partitions", "ntile"], // Windows I: rank without collapsing
  "lesson-32": ["lag-lead", "window-frames"],                    // Windows II: offsets & running totals
  "lesson-39": ["ops-calendar", "toolkit-capstone"],             // case study: the ops calendar
  // ---- Modules 6-8, 11 (thin-spot patch wave) ----
  "lesson-34": ["non-equi-joins", "outer-joins"],  // non-equi + outer-keep clinic
  "lesson-42": ["updates-deletes"],                 // UPDATE
  "lesson-43": ["updates-deletes"],                 // DELETE
  "lesson-44": ["upsert-returning", "transactions"], // UPSERT & transactions
  "lesson-45": ["create-table"],                    // CREATE TABLE
  "lesson-48": ["indexes-explain"],                 // indexes & EXPLAIN
  "lesson-64": ["indexes-explain"],                 // query performance capstone
};
