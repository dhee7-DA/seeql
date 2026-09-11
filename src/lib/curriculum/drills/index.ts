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
};
