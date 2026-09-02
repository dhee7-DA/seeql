// Keyword-coverage audit: for every SQL keyword/concept taught in the
// curriculum, count how many MCQs and problems actually drill it.
// Run: bun scripts/audit-keywords.ts
import { LESSONS } from "../src/lib/curriculum/lessons";
import type { Lesson } from "../src/lib/curriculum/types";

interface Keyword {
  key: string;
  family: string;
  re: RegExp;
  /** Lessons that primarily teach this keyword (prose home). */
  home: number[];
}

const K = (key: string, family: string, re: RegExp, home: number[]): Keyword => ({ key, family, re, home });

const KEYWORDS: Keyword[] = [
  // --- M1 core reading ---
  K("SELECT/FROM (reading)", "M1 core", /\bselect\b[\s\S]*\bfrom\b|\bselect\s+\*\b/, [1, 2]),
  K("column picking / projection", "M1 core", /\bprojection\b|\bcolumn(s)?\b.*\bpick|\bselect(ing)?\s+(just\s+)?(the\s+)?columns?\b|only the columns/, [2]),
  K("WHERE (filtering)", "M1 predicates", /\bwhere\b/, [3]),
  K("comparison ops = <> < >", "M1 predicates", /\b(comparison|equals|=|<>|!=|>|<)\b/, [3]),
  K("AND / OR / NOT logic", "M1 predicates", /\b(and|or|not)\b.*\b(combin|logic|precedence|truth)|\btruth table\b/, [3, 21]),
  K("LIKE / wildcards", "M1 predicates", /\blike\b|wildcard|%|_match/, [3]),
  K("IN (literal list)", "M1 predicates", /\bin\s*\(\s*'/, [3]),
  K("BETWEEN", "M1 predicates", /\bbetween\b/, [3]),
  K("IS NULL / IS NOT NULL", "M1 NULLs", /\bis\s+not?\s+null\b/, [4]),
  K("NULL three-valued logic", "M1 NULLs", /\bnull\b/, [4]),
  K("COALESCE / IFNULL", "M1 NULLs", /\b(coalesce|ifnull)\b/, [4, 29]),
  K("NULLIF", "M1 NULLs", /\bnullif\b/, [29]),
  K("ORDER BY", "M1 sort", /\border\s+by\b/, [5]),
  K("ASC / DESC", "M1 sort", /\b(desc|asc)\b/, [5]),
  K("LIMIT / top-N", "M1 sort", /\blimit\b|top-n|top\s+\d/, [5]),
  K("OFFSET / pagination", "M1 sort", /\boffset\b/, [5]),
  K("multi-key sort / tie-break", "M1 sort", /\btie.?break|multi.?key sort|secondary sort/, [5]),
  K("DISTINCT", "M1 dedupe", /\bdistinct\b/, [6]),
  K("arithmetic expressions", "M1 expr", /\b(arithmetic|multiply|quantity \*|\* unit_price|expression)\b/, [2]),
  K("alias AS", "M1 expr", /\bas\s+[a-z_]+|alias/, [2]),
  // --- M1 aggregates ---
  K("COUNT", "M1 agg", /\bcount\s*\(/, [7]),
  K("COUNT(*) vs COUNT(col)", "M1 agg", /count\s*\(\s*\*\s*\)|count\s*\(\s*[a-z_.]+\s*\)/, [7]),
  K("SUM", "M1 agg", /\bsum\s*\(/, [7]),
  K("AVG", "M1 agg", /\bavg\s*\(/, [7]),
  K("MIN / MAX", "M1 agg", /\b(min|max)\s*\(/, [7]),
  K("GROUP BY", "M1 agg", /\bgroup\s+by\b/, [8]),
  K("HAVING", "M1 agg", /\bhaving\b/, [8]),
  K("WHERE vs HAVING", "M1 agg", /\bhaving\b/, [8]),
  // --- M2 joins ---
  K("JOIN / INNER JOIN", "M2 joins", /\binner\s+join\b|\bjoin\b/, [9, 10]),
  K("ON condition", "M2 joins", /\bon\s+[a-z0-9_.]+\s*=/, [10]),
  K("foreign key", "M2 joins", /\bforeign key\b|\bfk\b/, [9]),
  K("table aliases in joins", "M2 joins", /\bc1\b|\bo1\b|\balias\b/, [9, 14]),
  K("three-table chain", "M2 joins", /\bthree.table|chain\b/, [11]),
  K("LEFT JOIN", "M2 joins", /\bleft\s+(outer\s+)?join\b/, [12]),
  K("anti-join (IS NULL trick)", "M2 joins", /\banti.?join\b/, [13]),
  K("NOT IN NULL landmine", "M2 joins", /\bnot\s+in\b/, [13, 25]),
  K("self-join", "M2 joins", /\bself.?join\b/, [14]),
  K("fan-out / row multiplication", "M2 joins", /\bfan.?out|multipl(y|ies|ication)\b/, [10, 15]),
  K("join + aggregates", "M2 joins", /\bjoin\b[\s\S]*\b(group\s+by|sum|count)\b|\baggregate.*\bjoin\b/, [15, 16]),
  K("RIGHT JOIN", "M2 joins", /\bright\s+(outer\s+)?join\b/, [34]),
  K("FULL OUTER JOIN", "M2 joins", /\bfull\s+(outer\s+)?join\b/, [34]),
  K("CROSS JOIN", "M2 joins", /\bcross\s+join\b/, [34]),
  K("non-equi join", "M2 joins", /\bnon.?equi\b|range join|\bbetween\s+[a-z0-9_.]+\s+and\s+[a-z0-9_.]+\s*\)|on\s+[a-z0-9_.]+\s*(<|>|<=|>=|between)/, [14, 34]),
  K("USING / NATURAL / composite key", "M2 joins", /\busing\s*\(|\bnatural\b|\bcomposite\b/, [9, 34]),
  // --- M3 sets & CASE ---
  K("UNION", "M3 sets", /\bunion\b(?! all)/, [17]),
  K("UNION ALL", "M3 sets", /\bunion\s+all\b/, [17, 18, 33]),
  K("INTERSECT", "M3 sets", /\bintersect\b/, [19]),
  K("EXCEPT", "M3 sets", /\bexcept\b/, [20]),
  K("column alignment / position binding", "M3 sets", /\balign|position(al)? binding|same number of columns/, [18]),
  K("operator precedence (sets)", "M3 sets", /\bprecedence\b/, [21]),
  K("ORDER BY in compound SELECT", "M3 sets", /\border by\b[\s\S]{0,80}\b(compound|union|stack)|applies to the (whole|entire) (stack|result)/, [18, 21]),
  K("CASE WHEN", "M3 case", /\bcase\b/, [22, 23]),
  K("pivot with CASE", "M3 case", /\bpivot\b/, [23]),
  K("conditional aggregation", "M3 case", /\bconditional aggregation\b|count\(case|sum\(case|\bfilter\s*\(/, [23, 33]),
  K("custom sort with CASE", "M3 case", /\bcustom sort|case.*order by|order by case/, [23]),
  K("eval order (SELECT/WHERE/GROUP/HAVING)", "M3 case", /\bevaluat\w+ order|logical (query )?order|clauses? (run|evaluate)/, [21]),
  // --- M4 subqueries ---
  K("scalar subquery", "M4 subq", /\bscalar subquery\b|scalar sub-query/, [25]),
  K("IN (SELECT …)", "M4 subq", /\bin\s*\(\s*select\b/, [25]),
  K("EXISTS / NOT EXISTS", "M4 subq", /\bexists\b/, [26]),
  K("correlated subquery", "M4 subq", /\bcorrelat/, [26]),
  K("derived table / FROM subquery", "M4 subq", /\bderived table\b|\bfrom\s*\(\s*select\b/, [27]),
  K("CTE / WITH", "M4 subq", /\bcte\b|\bwith\b/, [28]),
  K("two-stage thinking", "M4 subq", /\btwo.?stage|inner question|ask in two/, [25, 27]),
  // --- M5 toolkit ---
  K("UPPER / LOWER", "M5 text", /\b(upper|lower)\s*\(/, [29]),
  K("SUBSTR", "M5 text", /\bsubstr\s*\(/, [29]),
  K("INSTR", "M5 text", /\binstr\s*\(/, [29]),
  K("TRIM", "M5 text", /\btrim\s*\(/, [29]),
  K("LENGTH", "M5 text", /\blength\s*\(/, [29]),
  K("|| concatenation", "M5 text", /\|\||concatenat/, [29]),
  K("CAST", "M5 text", /\bcast\s*\(/, [29]),
  K("strftime", "M5 dates", /\bstrftime\s*\(/, [30]),
  K("julianday / date arithmetic", "M5 dates", /\bjulianday\b|date arithmetic|\bdays between/, [30]),
  K("date buckets / month buckets", "M5 dates", /\bbucket|by month|per month|group by month|%Y-%m/, [30]),
  K("OVER / window", "M5 windows", /\bover\s*\(|window function/, [31, 32]),
  K("PARTITION BY", "M5 windows", /\bpartition\s+by\b/, [31]),
  K("ROW_NUMBER", "M5 windows", /\brow_number\s*\(/, [31]),
  K("RANK / DENSE_RANK", "M5 windows", /\b(dense_)?rank\s*\(/, [31]),
  K("top-N per group", "M5 windows", /\btop-n[ -]per[ -]group\b|per[- ]group.*\btop\b|top-1.product|newest (order )?per/, [31]),
  K("LAG / LEAD", "M5 windows", /\b(lag|lead)\s*\(/, [32]),
  K("running total", "M5 windows", /\brunning (total|sum)\b|cumulative/, [32]),
  K("window frames", "M5 windows", /\bframe|rows between|preceding|following/, [32]),
  K("NTILE", "M5 windows", /\bntile\s*\(/, [32]),
  K("NULLS LAST / sort NULLs", "M5 windows", /\bnulls (last|first)\b/, [31, 32]),
  // --- M6 clinic ---
  K("GROUP_CONCAT", "M6 clinic", /\bgroup_concat\b|string_agg/, [33]),
  K("FILTER clause", "M6 clinic", /\bfilter\s*\(/, [33]),
  K("grand-total stack", "M6 clinic", /\bgrand total|total stack|rollup/, [33]),
  K("VALUES (table constructor)", "M6 clinic", /\bvalues\s*\(/, [34]),
  K("NATURAL JOIN dangers", "M6 clinic", /\bnatural join\b/, [34]),
  // --- M7 writes ---
  K("INSERT", "M7 writes", /\binsert\b/, [41]),
  K("column-list contract", "M7 writes", /column list/, [41]),
  K("RETURNING", "M7 writes", /\breturning\b/, [41]),
  K("UPDATE / SET", "M7 writes", /\bupdate\b|\bset\s+\w+\s*=/, [42]),
  K("UPDATE FROM", "M7 writes", /update\s+[\w.]+\s+set[\s\S]*\bfrom\s*\(|update[^`]*from\s*\(/, [42]),
  K("DELETE", "M7 writes", /\bdelete\s+from\b/, [43]),
  K("UPSERT / ON CONFLICT", "M7 writes", /on\s+conflict|upsert|or\s+replace|or\s+ignore/, [44]),
  K("transactions (BEGIN/COMMIT/ROLLBACK)", "M7 writes", /\bbegin\b|\bcommit\b|\brollback\b|transaction/, [44]),
  K("read-before-write", "M7 writes", /read\s+before|before[- ]picture|preview/, [41]),
  // --- M8 schema ---
  K("CREATE TABLE", "M8 schema", /create\s+table/, [45]),
  K("PRIMARY KEY", "M8 schema", /primary\s+key/, [45]),
  K("NOT NULL", "M8 schema", /not\s+null/, [45]),
  K("DEFAULT", "M8 schema", /\bdefault\b/, [45]),
  K("CHECK constraint", "M8 schema", /\bcheck\s*\(/, [45]),
  K("UNIQUE", "M8 schema", /\bunique\b/, [45]),
  K("REFERENCES / FK", "M8 schema", /references\b|foreign\s+key|fence/, [45]),
  K("ALTER TABLE", "M8 schema", /alter\s+table/, [46]),
  K("ADD COLUMN", "M8 schema", /add\s+column/, [46]),
  K("RENAME", "M8 schema", /rename\s+(column|table|\bto\b)/, [46]),
  K("DROP", "M8 schema", /drop\s+(column|table)/, [46]),
  K("CREATE VIEW / views", "M8 schema", /create\s+view|\bview\b/, [47]),
  K("sqlite_master", "M8 schema", /sqlite_master/, [47]),
  K("pragma_table_info", "M8 schema", /pragma_table_info|pragma\b/, [45]),
  K("CREATE INDEX", "M8 schema", /create\s+(unique\s+)?index/, [48]),
  K("EXPLAIN QUERY PLAN", "M8 schema", /explain\s+query\s+plan/, [48]),
  K("SCAN vs SEARCH", "M8 schema", /\bscan\b|\bsearch\b.*index|covering/, [48]),
  K("WITH RECURSIVE", "M8 schema", /with\s+recursive/, [49]),
  K("anchor / step", "M8 schema", /\banchor\b|\bstep\b/, [49]),
];

function mcqText(l: Lesson): string[] {
  return l.mcqs.map((m) => {
    const notes = (m.notes ?? []).map((n) => n.why).join(" ");
    return `${m.prompt} ${m.choices.join(" ")} ${m.why} ${notes}`;
  });
}
function probText(l: Lesson): string[] {
  return l.problems.map((p) => {
    const ms = (p.mistakes ?? []).map((m) => m.message).join(" ");
    return `${p.title} ${p.brief} ${(p.hints ?? []).join(" ")} ${p.solution} ${ms}`;
  });
}

const rows: Array<{ k: Keyword; mcq: number; prob: number; lessons: Set<string> }> = [];
for (const k of KEYWORDS) {
  let mcq = 0, prob = 0;
  const lessons = new Set<string>();
  for (const l of LESSONS) {
    const mts = mcqText(l);
    const pts = probText(l);
    const mHit = mts.filter((t) => k.re.test(t.toLowerCase())).length;
    const pHit = pts.filter((t) => k.re.test(t.toLowerCase())).length;
    if (mHit) { mcq += mHit; lessons.add(l.id); }
    if (pHit) { prob += pHit; lessons.add(l.id); }
  }
  rows.push({ k, mcq, prob, lessons });
}

// group by family
const families = [...new Set(rows.map((r) => r.k.family))];
console.log("KEYWORD COVERAGE MATRIX  (mcq hits / problem hits · lessons touched)");
for (const f of families) {
  console.log(`\n## ${f}`);
  for (const r of rows.filter((r) => r.k.family === f).sort((a, b) => a.mcq - b.mcq)) {
    const homeHit = r.k.home.every((n) => [...r.lessons].some((id) => id.endsWith(String(n).padStart(2, "0"))));
    const flag = r.mcq < 4 ? " ⚠ THIN" : r.mcq < 6 ? " ·" : "";
    console.log(
      `  ${r.k.key.padEnd(38)} mcq=${String(r.mcq).padStart(2)} prob=${String(r.prob).padStart(2)} lessons=${r.lessons.size}${homeHit ? "" : " (home-off)"}${flag}`,
    );
  }
}
const totalThin = rows.filter((r) => r.mcq < 4).length;
console.log(`\n${rows.length} keywords audited · ${totalThin} thin (<4 mcq hits)`);
