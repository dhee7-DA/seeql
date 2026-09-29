// Keyword taxonomy — the canonical 61-keyword dictionary and the multi-label
// tag() scanner. Single source of truth: the coverage census (scripts/) AND
// the in-app Keyword Practice hub both attribute items through this module,
// so the workbook, the quota tracker and the UI can never drift apart.
// Client-safe: pure data + regex, no database imports.

export interface KwDef {
  kw: string;
  cat: string;
  prose?: RegExp[];
  sql?: RegExp[];
}

export const D: KwDef[] = [
  // Reading data
  { kw: "SELECT & FROM", cat: "Reading data", prose: [/\bselect\b/, /\bfrom\b/], sql: [/\bselect\b/] },
  { kw: "WHERE", cat: "Reading data", prose: [/\bwhere\b/], sql: [/\bwhere\b/] },
  { kw: "ORDER BY & LIMIT", cat: "Reading data", prose: [/\border by\b/, /\blimit\b/, /\boffset\b/, /\btop-n\b/, /\btop n\b/, /\bsort/], sql: [/\border by\b/, /\blimit\b/, /\boffset\b/] },
  { kw: "DISTINCT", cat: "Reading data", prose: [/\bdistinct\b/, /\bdeduplicat/, /\bunique rows?\b/], sql: [/\bdistinct\b/] },
  { kw: "LIKE & wildcards", cat: "Reading data", prose: [/\blike operator\b/, /\blike pattern/, /\bwildcard/, /\bpattern match/], sql: [/\blike\b/] },
  { kw: "BETWEEN", cat: "Reading data", prose: [/\bbetween\b/], sql: [/\bbetween\b/] },
  { kw: "IN (list)", cat: "Reading data", prose: [/\bin\s?\(/, /\bin operator\b/, /\bnot in\b/, /\bmember(ship)? (of|test)/], sql: [/\bin\s?\(/, /\bnot in\b/] },
  // Boolean logic
  { kw: "AND / OR / NOT", cat: "Boolean logic", prose: [/\bboolean\b/, /\bprecedence\b/, /\band ?\/ ?or\b/, /\btruth table\b/, /\bthree-valued\b/, /\bnegat/], sql: [] },
  // NULL handling
  { kw: "NULL / IS NULL", cat: "NULL handling", prose: [/\bnull\b/, /\bmissing (values?|data|email)/], sql: [/\bis (not )?null\b/, /\bnull\b/] },
  { kw: "COALESCE & NULLIF", cat: "NULL handling", prose: [/\bcoalesce\b/, /\bnullif\b/, /\bifnull\b/, /\bfallback value/], sql: [/\bcoalesce\s?\(/, /\bnullif\s?\(/, /\bifnull\s?\(/] },
  // Aggregation
  { kw: "Aggregates (COUNT/SUM/AVG/MIN/MAX)", cat: "Aggregation", prose: [/\baggregat/, /\bcount\b/, /\bsum\b/, /\baverage\b/, /\bavg\b/, /\bmin\b/, /\bmax\b/, /\btotal\b/], sql: [/\bcount\s?\(/, /\bsum\s?\(/, /\bavg\s?\(/, /\bmin\s?\(/, /\bmax\s?\(/, /\btotal\s?\(/] },
  { kw: "GROUP BY", cat: "Aggregation", prose: [/\bgroup by\b/, /\bgrouping\b/, /\bbuckets?\b/, /\bper (city|region|customer|category|status|day|month|product|hour|week|supplier|payment method)\b/], sql: [/\bgroup by\b/] },
  { kw: "HAVING", cat: "Aggregation", prose: [/\bhaving\b/, /\bfilter(ed)? groups?\b/], sql: [/\bhaving\b/] },
  { kw: "GROUP_CONCAT", cat: "Aggregation", prose: [/\bgroup_concat\b/, /\bstring_agg\b/, /\bstring aggregation\b/, /\bfold/, /\bcomma.separated/], sql: [/\bgroup_concat\s?\(/, /\bstring_agg\s?\(/] },
  { kw: "FILTER clause", cat: "Aggregation", prose: [/\bfilter clause\b/, /\bcensus/], sql: [/\bfilter\s?\(/] },
  // Joins
  { kw: "INNER JOIN", cat: "Joins", prose: [/\binner join\b/, /\bjoin\b/], sql: [/\binner join\b/, /(?<![a-z])(?<!left |right |full |cross |self |outer )(outer )?join\b/] },
  { kw: "LEFT JOIN", cat: "Joins", prose: [/\bleft (outer )?join\b/, /\bpreserv/], sql: [/\bleft (outer )?join\b/] },
  { kw: "RIGHT JOIN", cat: "Joins", prose: [/\bright (outer )?join\b/], sql: [/\bright (outer )?join\b/] },
  { kw: "FULL OUTER JOIN", cat: "Joins", prose: [/\bfull (outer )?join\b/, /\bsymmetric difference\b/], sql: [/\bfull (outer )?join\b/] },
  { kw: "CROSS JOIN", cat: "Joins", prose: [/\bcross (join|product)\b/, /\bpair(s|ing|wise)? (every|all|combin)/, /\bpermutation/], sql: [/\bcross join\b/] },
  { kw: "SELF JOIN", cat: "Joins", prose: [/\bself.?join/], sql: [] },
  { kw: "Anti-join", cat: "Joins", prose: [/\banti.?join/, /\bnever (ordered|paid|placed)/, /\bno (orders?|payments?|match|reply)/], sql: [/\bnot exists\b/, /left join[^;]{0,160}?is\s+null/] },
  { kw: "Non-equi & range joins", cat: "Joins", prose: [/\bnon.?equi/, /\brange join/, /\bband join/, /\boverlapping (ranges?|intervals?|bounds)/], sql: [] },
  { kw: "Join fan-out & grain", cat: "Joins", prose: [/\bfan.?out/, /\bdouble.?count/, /\binflat/, /\bgrain\b/, /\bduplicated rows?\b/, /\bone row per\b/], sql: [] },
  { kw: "ON vs WHERE", cat: "Joins", prose: [/\bon vs\.? where\b/, /\bon clause\b/, /\bin the on\b/], sql: [] },
  // Set operations
  { kw: "UNION & UNION ALL", cat: "Set operations", prose: [/\bunion\b/, /\bstack(ed)? reports?\b/], sql: [/\bunion\b/] },
  { kw: "INTERSECT", cat: "Set operations", prose: [/\bintersect\b/, /\boverlap\b/], sql: [/\bintersect\b/] },
  { kw: "EXCEPT", cat: "Set operations", prose: [/\bexcept\b/], sql: [/\bexcept\b/] },
  // Conditional logic
  { kw: "CASE WHEN", cat: "Conditional logic", prose: [/\bcase when\b/, /\bcase expression/, /\bpivot/, /\bconditional/], sql: [/\bcase when\b/, /\bcase\b[^;]{0,60}?\bthen\b/] },
  // Subqueries
  { kw: "Subqueries (umbrella)", cat: "Subqueries", prose: [/\bsubquer/, /\bnested quer/], sql: [/\(\s*select\b/] },
  { kw: "IN subqueries", cat: "Subqueries", prose: [/\bin subquer/], sql: [/\bin\s?\(\s*select\b/] },
  { kw: "Scalar subqueries", cat: "Subqueries", prose: [/\bscalar sub/], sql: [] },
  { kw: "EXISTS", cat: "Subqueries", prose: [/\bexists (operator|test|probe|predicate|check)/, /\bthe exists\b/], sql: [/\bexists\b/] },
  { kw: "Correlated subqueries", cat: "Subqueries", prose: [/\bcorrelated/], sql: [/\bcorrelated/] },
  { kw: "Derived tables", cat: "Subqueries", prose: [/\bderived (table|quer|result)/, /\binline view/, /\bstage(s|d)? the aggregation/], sql: [/from\s+\(\s*select\b/] },
  // CTEs
  { kw: "WITH (CTE)", cat: "CTEs", prose: [/\bctes?\b/, /\bwith clause\b/, /\bcommon table expression/], sql: [/\bwith\s+[a-z_]+\s+as\s?\(/] },
  { kw: "WITH RECURSIVE", cat: "CTEs", prose: [/\brecursive cte/, /\bwith recursive\b/, /\bself.?feeding/], sql: [/\bwith recursive\b/] },
  // Window functions
  { kw: "OVER & PARTITION BY", cat: "Window functions", prose: [/\bover clause\b/, /\bpartition by\b/, /\bwindow function/, /\bwindow definition/], sql: [/\bover\s?\(/, /\bpartition by\b/] },
  { kw: "ROW_NUMBER", cat: "Window functions", prose: [/\brow_number\b/], sql: [/\brow_number\s?\(/] },
  { kw: "RANK & DENSE_RANK", cat: "Window functions", prose: [/\brank\b/, /\branking\b/, /\btie/], sql: [/\brank\s?\(/, /\bdense_rank\s?\(/] },
  { kw: "NTILE", cat: "Window functions", prose: [/\bntile\b/, /\bquartile/, /\btiles?\b/, /\bbuckets of rows/], sql: [/\bntile\s?\(/] },
  { kw: "LAG & LEAD", cat: "Window functions", prose: [/\blag\b/, /\blead\b/, /\bprevious row/, /\bnext row/, /\bdelta\b/, /\bstreak/], sql: [/\blag\s?\(/, /\blead\s?\(/] },
  { kw: "FIRST_VALUE & LAST_VALUE", cat: "Window functions", prose: [/\bfirst_value\b/, /\blast_value\b/], sql: [/\bfirst_value\s?\(/, /\blast_value\s?\(/] },
  { kw: "Window frames", cat: "Window functions", prose: [/\bframe\b/, /\brows between\b/, /\brange between\b/, /\bgroups between\b/, /\bunbounded/, /\bsliding/], sql: [/\brows between\b/, /\brange between\b/, /\bgroups between\b/, /\bunbounded/, /\bexclude (current|group|ties|no others)/, /\bcurrent row\b/] },
  { kw: "PERCENT_RANK & CUME_DIST", cat: "Window functions", prose: [/\bpercent_rank\b/, /\bcume_dist\b/, /\bpercentile/, /\bpareto/, /\bconcentration/], sql: [/\bpercent_rank\s?\(/, /\bcume_dist\s?\(/] },
  { kw: "Running totals", cat: "Window functions", prose: [/\brunning (total|sum|balance)\b/, /\bcumulative\b/, /\bbalance walk/], sql: [] },
  // Functions
  { kw: "Text functions", cat: "Functions", prose: [/\bsubstr\b/, /\bsubstring\b/, /\btext function/, /\bstring function/, /\bemail domain/, /\bname cleanup/], sql: [/\bsubstr\s?\(/, /\bsubstring\s?\(/, /\binstr\s?\(/, /\bupper\s?\(/, /\blower\s?\(/, /\btrim\s?\(/, /\breplace\s?\(/, /\blength\s?\(/, /\|\|/] },
  { kw: "CAST & types", cat: "Functions", prose: [/\bcast\b/, /\bcoercion\b/, /\btype conversion/, /\binteger cents?\b/], sql: [/\bcast\s?\(/, /::/] },
  { kw: "Date & time functions", cat: "Functions", prose: [/\bstrftime\b/, /\bjulianday\b/, /\bdate bucket/, /\bmonth bucket/, /\bcalendar\b/, /\bdate math\b/, /\bdate_trunc\b/, /\bmonth spine\b/, /\baging\b/], sql: [/\bstrftime\s?\(/, /\bjulianday\s?\(/, /\bdate_trunc\s?\(/, /\bdate\s?\(/, /\bdatetime\s?\(/] },
  { kw: "Math & rounding", cat: "Functions", prose: [/\bround(ing)?\b/, /\bsigma\b/, /\bz.?score/, /\bstd ?dev/], sql: [/\bround\s?\(/, /\babs\s?\(/, /\bceil\s?\(/, /\bfloor\s?\(/] },
  // Writes
  { kw: "INSERT", cat: "Writes", prose: [/\binsert\b/], sql: [/\binsert\b/] },
  { kw: "UPDATE", cat: "Writes", prose: [/\bupdate statement\b/, /\bupdating rows?\b/, /\bthe update\b/, /\bprice sweep\b/], sql: [/\bupdate\b/] },
  { kw: "DELETE", cat: "Writes", prose: [/\bdelete statement\b/, /\bdeleting rows?\b/, /\bthe delete\b/], sql: [/\bdelete\b/] },
  { kw: "UPSERT (ON CONFLICT)", cat: "Writes", prose: [/\bupsert\b/, /\bon conflict\b/], sql: [/\bon conflict\b/] },
  { kw: "RETURNING", cat: "Writes", prose: [/\breturning clause\b/, /`?returning`? \b(id|\*|rows|the|every|shows?|echoes?|reports?|makes?|on\b)/], sql: [/\breturning\b/] },
  { kw: "Transactions", cat: "Writes", prose: [/\btransaction/, /\batomic/, /\ball.or.nothing\b/], sql: [/\bbegin\b/, /\bcommit\b/, /\brollback\b/] },
  // Schema
  { kw: "CREATE TABLE", cat: "Schema", prose: [/\bcreate table\b/, /\bconstraint contract\b/], sql: [/\bcreate table\b/] },
  { kw: "ALTER & DROP", cat: "Schema", prose: [/\balter\b/, /\bdrop\b/, /\bschema evolution\b/], sql: [/\balter\b/, /\bdrop\b/] },
  { kw: "Views", cat: "Schema", prose: [/\bviews?\b/, /\breporting layer\b/, /\bsaves? a join\b/], sql: [/\bcreate view\b/] },
  { kw: "Indexes & EXPLAIN", cat: "Schema", prose: [/\bindex/, /\bexplain\b/, /\bquery plan\b/], sql: [/\bcreate index\b/, /\bexplain\b/] },
  { kw: "Constraints (PK/FK/UNIQUE…)", cat: "Schema", prose: [/\bprimary key\b/, /\bforeign key\b/, /\bconstraint/], sql: [/\bprimary key\b/, /\bforeign key\b/, /\bunique\b/, /\bcheck\s?\(/, /\bdefault\b/] },
];

// ---------------------------------------------------------------------------
// 2. Drill keyword map — DrillSet.keyword (verbatim) → canonical dictionary rows.
//    Filled from the --report run; unmapped sets are counted and reported.
// ---------------------------------------------------------------------------
function norm(s: string): string {
  return s.toLowerCase().replace(/`/g, "'").replace(/\s+/g, " ");
}
function matchAny(text: string, pats: RegExp[]): boolean {
  return pats.some((p) => p.test(text));
}

export interface Tagged {
  module: number | null;
  kws: Set<string>;
}

export function tag(module: number | null, prose: string, sql: string): Tagged {
  const kws = new Set<string>();
  const p = norm(prose);
  const s = norm(sql);
  for (const def of D) {
    const hit =
      (def.prose && def.prose.length > 0 && matchAny(p, def.prose)) ||
      (def.sql && def.sql.length > 0 && matchAny(s, def.sql));
    if (hit) kws.add(def.kw);
  }
  return { module, kws };
}
