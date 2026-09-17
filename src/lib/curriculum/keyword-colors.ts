// Keyword color identities — every SQL keyword owns a pastel hue that follows
// it across the whole app: drill set cards, MCQ keyword badges, lesson header
// chips, case-file chip banks, and the keyword itself inside SQL code blocks.
// Color becomes the memory hook — WHERE is always orange, booleans indigo,
// the NULL family slate — identical in lessons, drills, cases, and code.
//
// Every class string below is written OUT IN FULL on purpose: Tailwind's JIT
// only generates classes it can see as literals in source, so templated
// `border-${hue}-400/40` strings would silently produce no CSS.
//
// Hues read as Tailwind pastels on the dark themes; the light themes (plum,
// pastel) remap the same 300/400 steps dark+desaturated in globals.css.
// Aggregates/COALESCE/NULLIF intentionally share their function-word tints so
// a keyword's card, badge, and its token inside code all glow the same color.

export interface KeywordTint {
  /** Pill badge classes: border + background + text. */
  chip: string;
  /** Bare text color (set-card labels, code spans). */
  text: string;
  /** Solid background for dots and progress-bar fills. */
  dot: string;
  /** Hover border accent for interactive cards. */
  ring: string;
}

function tint(
  chip: string,
  text: string,
  dot: string,
  ring: string,
): KeywordTint {
  return { chip, text, dot, ring };
}

/** Fallback for keywords without an identity yet (future modules). */
export const NEUTRAL_TINT: KeywordTint = tint(
  "border-violet-400/40 bg-violet-400/10 text-violet-300",
  "text-violet-300",
  "bg-violet-400",
  "hover:border-violet-400/50",
);

/** One pastel identity per drill keyword — keyed by DrillSet.keyword. */
export const KEYWORD_TINTS: Record<string, KeywordTint> = {
  // SELECT + FROM — the projection lens
  select: tint(
    "border-sky-400/40 bg-sky-400/10 text-sky-300",
    "text-sky-300",
    "bg-sky-400",
    "hover:border-sky-400/50",
  ),
  // WHERE — the row gate
  where: tint(
    "border-orange-400/40 bg-orange-400/10 text-orange-300",
    "text-orange-300",
    "bg-orange-400",
    "hover:border-orange-400/50",
  ),
  // NULL / IS NULL — holes in the data
  null: tint(
    "border-slate-400/40 bg-slate-400/10 text-slate-300",
    "text-slate-300",
    "bg-slate-400",
    "hover:border-slate-400/50",
  ),
  // ORDER BY + LIMIT — output promises
  "order-limit": tint(
    "border-violet-400/40 bg-violet-400/10 text-violet-300",
    "text-violet-300",
    "bg-violet-400",
    "hover:border-violet-400/50",
  ),
  // Aggregates — the collapse (function family)
  aggregates: tint(
    "border-amber-400/40 bg-amber-400/10 text-amber-300",
    "text-amber-300",
    "bg-amber-400",
    "hover:border-amber-400/50",
  ),
  // GROUP BY — the bucket machine
  groupby: tint(
    "border-teal-400/40 bg-teal-400/10 text-teal-300",
    "text-teal-300",
    "bg-teal-400",
    "hover:border-teal-400/50",
  ),
  // HAVING — the group gate
  having: tint(
    "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
    "text-fuchsia-300",
    "bg-fuchsia-400",
    "hover:border-fuchsia-400/50",
  ),
  // IN — membership
  in: tint(
    "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
    "text-cyan-300",
    "bg-cyan-400",
    "hover:border-cyan-400/50",
  ),
  // BETWEEN — closed ranges
  between: tint(
    "border-green-400/40 bg-green-400/10 text-green-300",
    "text-green-300",
    "bg-green-400",
    "hover:border-green-400/50",
  ),
  // LIKE — pattern matching
  like: tint(
    "border-pink-400/40 bg-pink-400/10 text-pink-300",
    "text-pink-300",
    "bg-pink-400",
    "hover:border-pink-400/50",
  ),
  // AND / OR / NOT — boolean assembly
  "and-or-not": tint(
    "border-indigo-400/40 bg-indigo-400/10 text-indigo-300",
    "text-indigo-300",
    "bg-indigo-400",
    "hover:border-indigo-400/50",
  ),
  // DISTINCT — the uniqueness lens
  distinct: tint(
    "border-purple-400/40 bg-purple-400/10 text-purple-300",
    "text-purple-300",
    "bg-purple-400",
    "hover:border-purple-400/50",
  ),
  // COALESCE — fallback chains (function family)
  coalesce: tint(
    "border-yellow-400/40 bg-yellow-400/10 text-yellow-300",
    "text-yellow-300",
    "bg-yellow-400",
    "hover:border-yellow-400/50",
  ),
  // NULLIF — poison-value neutralizer (function family)
  nullif: tint(
    "border-stone-400/40 bg-stone-400/10 text-stone-300",
    "text-stone-300",
    "bg-stone-400",
    "hover:border-stone-400/50",
  ),

  // ---- Module 2 · Joins & Relationships ----
  // JOIN + ON — the pairing machine (rose: the join word itself glows rose)
  "inner-join": tint(
    "border-rose-400/40 bg-rose-400/10 text-rose-300",
    "text-rose-300",
    "bg-rose-400",
    "hover:border-rose-400/50",
  ),
  // Join mechanics — pairing, drops, multiplication (blue)
  "join-mechanics": tint(
    "border-blue-400/40 bg-blue-400/10 text-blue-300",
    "text-blue-300",
    "bg-blue-400",
    "hover:border-blue-400/50",
  ),
  // Multi-table chains (cyan)
  "multi-join": tint(
    "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
    "text-cyan-300",
    "bg-cyan-400",
    "hover:border-cyan-400/50",
  ),
  // LEFT JOIN — preservation (lime)
  "left-join": tint(
    "border-lime-400/40 bg-lime-400/10 text-lime-300",
    "text-lime-300",
    "bg-lime-400",
    "hover:border-lime-400/50",
  ),
  // Anti-joins — finding the holes (red)
  "anti-join": tint(
    "border-red-400/40 bg-red-400/10 text-red-300",
    "text-red-300",
    "bg-red-400",
    "hover:border-red-400/50",
  ),
  // SELF JOIN — the mirror (gray)
  "self-join": tint(
    "border-gray-400/40 bg-gray-400/10 text-gray-300",
    "text-gray-300",
    "bg-gray-400",
    "hover:border-gray-400/50",
  ),
  // Aggregates + joins — collapse across tables (amber: shared function family)
  "join-agg": tint(
    "border-amber-400/40 bg-amber-400/10 text-amber-300",
    "text-amber-300",
    "bg-amber-400",
    "hover:border-amber-400/50",
  ),
  // Fan-out & grain — the silent inflator (violet)
  "join-fanout": tint(
    "border-violet-400/40 bg-violet-400/10 text-violet-300",
    "text-violet-300",
    "bg-violet-400",
    "hover:border-violet-400/50",
  ),
  // Grain discipline — the honest-aggregate craft (zinc)
  "grain-discipline": tint(
    "border-zinc-400/40 bg-zinc-400/10 text-zinc-300",
    "text-zinc-300",
    "bg-zinc-400",
    "hover:border-zinc-400/50",
  ),
  // Table aliases — shorthand qualifiers (sky: shared projection family, AS)
  "table-alias": tint(
    "border-sky-400/40 bg-sky-400/10 text-sky-300",
    "text-sky-300",
    "bg-sky-400",
    "hover:border-sky-400/50",
  ),
};

/** Drill-question keywords arrive in display form ("SELECT + FROM",
 *  "ORDER BY + LIMIT", "NULL / IS NULL", "Aggregates", "AND / OR / NOT") —
 *  map their leading word onto the registry keys above. */
const KEYWORD_ALIASES: Record<string, string> = {
  select: "select",
  from: "select",
  where: "where",
  null: "null",
  order: "order-limit",
  limit: "order-limit",
  aggregates: "aggregates",
  count: "aggregates",
  group: "groupby",
  having: "having",
  in: "in",
  between: "between",
  like: "like",
  and: "and-or-not",
  or: "and-or-not",
  not: "and-or-not",
  distinct: "distinct",
  coalesce: "coalesce",
  nullif: "nullif",
  // Module 2 · joins
  join: "inner-join",
  inner: "inner-join",
  on: "inner-join",
  using: "inner-join",
  cross: "inner-join",
  natural: "inner-join",
  left: "left-join",
  outer: "left-join",
  exists: "anti-join",
  anti: "anti-join",
  self: "self-join",
  multi: "multi-join",
  mechanics: "join-mechanics",
  fan: "join-fanout",
  grain: "grain-discipline",
  discipline: "grain-discipline",
  alias: "table-alias",
  aliases: "table-alias",
};

/** Tint for a keyword in any form — registry key ("select"), display label
 *  ("SELECT + FROM"), or drill-question keyword ("NULL / IS NULL"). */
export function tintForKeyword(keyword: string): KeywordTint {
  const k = keyword.trim().toLowerCase();
  const direct = KEYWORD_TINTS[k];
  if (direct) return direct;
  const first = k.split(/[^a-z]+/)[0] ?? "";
  const aliased = KEYWORD_ALIASES[first];
  return (aliased && KEYWORD_TINTS[aliased]) || NEUTRAL_TINT;
}

/** SQL word → text color class, shared by the SQL highlighter and the
 *  case-file chip heuristic. The shared `BY` is resolved with context via
 *  `byTint` (GROUP BY teal vs ORDER BY violet). */
export const WORD_TINTS: Record<string, string> = {
  // projection
  SELECT: "text-sky-300",
  FROM: "text-sky-300",
  AS: "text-sky-300",
  ALL: "text-sky-300",
  // the row gate
  WHERE: "text-orange-300",
  // boolean assembly
  AND: "text-indigo-300",
  OR: "text-indigo-300",
  NOT: "text-indigo-300",
  // membership / range / pattern
  IN: "text-cyan-300",
  BETWEEN: "text-green-300",
  LIKE: "text-pink-300",
  GLOB: "text-pink-300",
  // the NULL family
  NULL: "text-slate-300",
  IS: "text-slate-300",
  // output promises
  ORDER: "text-violet-300",
  LIMIT: "text-violet-300",
  OFFSET: "text-violet-300",
  ASC: "text-violet-300",
  DESC: "text-violet-300",
  // the bucket machine + its gate
  GROUP: "text-teal-300",
  HAVING: "text-fuchsia-300",
  // the uniqueness lens
  DISTINCT: "text-purple-300",
  // function-family words (their drill cards share these hues)
  COALESCE: "text-yellow-300",
  IFNULL: "text-yellow-300",
  NULLIF: "text-stone-300",
  // ---- Module 2 · the join family (JOIN + ON rose, LEFT lime, EXISTS red) ----
  JOIN: "text-rose-300",
  INNER: "text-rose-300",
  ON: "text-rose-300",
  USING: "text-rose-300",
  CROSS: "text-rose-300",
  NATURAL: "text-rose-300",
  LEFT: "text-lime-300",
  OUTER: "text-lime-300",
  EXISTS: "text-red-300",
};

/** The shared `BY` — teal after GROUP, violet otherwise. */
export function byTint(prevWord?: string): string {
  if (prevWord === "GROUP") return "text-teal-300";
  return "text-violet-300";
}
