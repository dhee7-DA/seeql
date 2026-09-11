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
};
