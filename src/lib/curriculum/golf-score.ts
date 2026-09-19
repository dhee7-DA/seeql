// Golf stroke counter — the single scoring rule every hole and every
// attempt is measured with. Deliberately simple and fully documented:
//
//   strokes = (number of clause keywords, subqueries included)
//           + (columns in the FIRST select list)
//
//   · clause keywords: SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY,
//     LIMIT, OFFSET, WITH, RECURSIVE, UNION, EXCEPT, INTERSECT, VALUES,
//     SET, JOIN (INNER/LEFT/RIGHT/CROSS don't add — the JOIN carries it)
//   · DISTINCT rides free with SELECT — dedup is a modifier, not a stage
//   · the first select list is comma-split with parens stripped, so
//     ROUND(x, 2) still counts as one column; `*` bills starColumns
//
// It's an approximation, not a parser — but it's the SAME approximation
// for par and for every attempt, which is what makes the score honest.

const CLAUSE_RE = /\b(select|from|where|group\s+by|having|order\s+by|limit|offset|with|recursive|union|except|intersect|values|set|join)\b/gi;

/** Strip balanced parens so commas inside functions don't split columns. */
function stripParens(s: string): string {
  let out = s;
  let prev: string;
  do {
    prev = out;
    out = out.replace(/\([^()]*\)/g, " ");
  } while (out !== prev);
  return out;
}

export function countStrokes(sql: string, starColumns = 0): number {
  const clauses = (sql.match(CLAUSE_RE) ?? []).length;
  const m = /\bselect\b([\s\S]*?)\bfrom\b/i.exec(sql);
  if (!m) return clauses;
  const list = stripParens(m[1]).trim();
  if (!list) return clauses;
  const cols = /^\.?\*$/.test(list) || list === "*" ? starColumns : list.split(",").length;
  return clauses + Math.max(cols, 1);
}

/** Verdict relative to par. */
export function golfVerdict(
  strokes: number,
  parStrokes: number,
): { title: string; tone: "eagle" | "par" | "bogey"; note: string } {
  if (strokes < parStrokes)
    return { title: "Eagle — under par", tone: "eagle", note: `Fewer strokes than the reference par (${strokes} vs ${parStrokes}). Lean AND correct.` };
  if (strokes === parStrokes)
    return { title: "Par", tone: "par", note: `Exactly par (${strokes} strokes) — the reference shape itself.` };
  if (strokes <= parStrokes + 2)
    return { title: "Bogey", tone: "bogey", note: `${strokes} strokes against par ${parStrokes} — close. Read the lesson below and try again.` };
  return { title: "Double bogey", tone: "bogey", note: `${strokes} strokes against par ${parStrokes} — the starter is haunting this query. Trim a clause or two.` };
}
