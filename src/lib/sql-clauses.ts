// Client-safe clause analysis of raw SQL text.
//
// Powers the playground's text ↔ diagram linking (which clause is the cursor
// in? which text does the WHERE gate correspond to?) and the row funnel
// (progressively strip clauses, wrap in COUNT(*) to get real intermediate
// row counts).
//
// Deliberately regex/scan-based rather than AST-based: it works on the RAW
// text the user typed (including their comments and formatting) and needs
// only top-level structure. Handles strings, comments, quoted identifiers
// and parentheses so keywords inside subqueries/CTE bodies are ignored.

export type ClauseKind =
  | "with"
  | "select"
  | "from"
  | "where"
  | "group"
  | "having"
  | "order"
  | "limit";

export interface ClauseSpan {
  kind: ClauseKind;
  /** offset of the clause keyword */
  start: number;
  /** offset where the clause ends (start of the next clause / end of text) */
  end: number;
  /** the exact keyword text as written, e.g. "GROUP BY" */
  keyword: string;
}

interface ScanResult {
  spans: ClauseSpan[];
  /**
   * false when the statement uses constructs we refuse to slice
   * (set operations, multiple statements, no recognizable SELECT…)
   */
  supported: boolean;
}

const KEYWORD_RE =
  /\b(WITH|RECURSIVE|SELECT|DISTINCT|ALL|FROM|JOIN|INNER|LEFT|RIGHT|FULL|CROSS|OUTER|ON|USING|WHERE|GROUP|BY|HAVING|ORDER|LIMIT|OFFSET|UNION|INTERSECT|EXCEPT|VALUES)\b/g;

/** Scan top-level SQL text for clause keyword spans. */
export function findClauses(sql: string): ScanResult {
  const spans: ClauseSpan[] = [];
  const n = sql.length;
  let i = 0;
  let depth = 0;
  let statementEnd = n; // first top-level ";" — everything after is ignored

  const pushMatch = (kind: ClauseKind, start: number, keyword: string) => {
    const last = spans[spans.length - 1];
    if (last) last.end = start;
    spans.push({ kind, start, end: n, keyword });
  };

  while (i < n) {
    const ch = sql[i];

    // -- line comment
    if (ch === "-" && sql[i + 1] === "-") {
      while (i < n && sql[i] !== "\n") i++;
      continue;
    }
    // /* block comment */
    if (ch === "/" && sql[i + 1] === "*") {
      i += 2;
      while (i < n && !(sql[i] === "*" && sql[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    // 'string' / "quoted ident" / `quoted ident` / [bracket ident]
    if (ch === "'" || ch === '"' || ch === "`") {
      const quote = ch;
      i++;
      while (i < n) {
        if (sql[i] === quote) {
          if (sql[i + 1] === quote && quote !== "`") i++; // doubled quote escape
          else break;
        }
        i++;
      }
      i++;
      continue;
    }
    if (ch === "[") {
      while (i < n && sql[i] !== "]") i++;
      i++;
      continue;
    }

    if (ch === "(") {
      depth++;
      i++;
      continue;
    }
    if (ch === ")") {
      depth = Math.max(0, depth - 1);
      i++;
      continue;
    }
    if (ch === ";" && depth === 0) {
      statementEnd = i;
      break;
    }
    if (ch === "-" || ch === "+" || ch === "*" || ch === "/") {
      // operator — could be part of `*`, arithmetic; skip. (Comments handled above.)
      i++;
      continue;
    }

    if (depth === 0 && /[A-Za-z_]/.test(ch)) {
      KEYWORD_RE.lastIndex = i;
      const m = KEYWORD_RE.exec(sql);
      if (m && m.index === i) {
        const word = m[1].toUpperCase();
        i += m[1].length;

        // multi-word keywords
        if (word === "GROUP" || word === "ORDER") {
          const rest = sql.slice(i).match(/^\s+BY\b/i);
          if (rest) {
            i += rest[0].length;
            pushMatch(word === "GROUP" ? "group" : "order", m.index, word === "GROUP" ? "GROUP BY" : "ORDER BY");
            continue;
          }
          continue; // bare GROUP/ORDER — not a clause
        }
        if (word === "UNION" || word === "INTERSECT" || word === "EXCEPT") {
          return { spans: [], supported: false }; // set ops — refuse to slice
        }
        if (word === "RECURSIVE" || word === "DISTINCT" || word === "ALL" || word === "VALUES") {
          continue;
        }
        if (word === "INNER" || word === "LEFT" || word === "RIGHT" || word === "FULL" || word === "CROSS" || word === "OUTER") {
          continue; // join words — folded into the FROM span
        }
        if (word === "JOIN" || word === "ON" || word === "USING") {
          // JOIN belongs to the FROM clause — extend/attach
          if (spans.length > 0 && spans[spans.length - 1].kind === "from") {
            spans[spans.length - 1].end = n; // stays open until next clause
          }
          continue;
        }

        const kind =
          word === "WITH" ? "with" :
          word === "SELECT" ? "select" :
          word === "FROM" ? "from" :
          word === "WHERE" ? "where" :
          word === "HAVING" ? "having" :
          word === "LIMIT" ? "limit" :
          word === "OFFSET" ? "limit" : null;
        if (kind) {
          // OFFSET merges into LIMIT's span
          if (kind === "limit" && spans[spans.length - 1]?.kind === "limit") {
            spans[spans.length - 1].end = n;
            continue;
          }
          pushMatch(kind, m.index, word);
          continue;
        }
        continue;
      }
      // ordinary word — skip it whole (cheap, avoids re-testing mid-word)
      while (i < n && /[A-Za-z0-9_$]/.test(sql[i])) i++;
      continue;
    }

    i++;
  }

  if (spans.length > 0) {
    const last = spans[spans.length - 1];
    last.end = statementEnd;
    // close every span against its successor (pushMatch already did, but the
    // first span also needs its end clamped when it is alone)
    for (let k = 0; k < spans.length - 1; k++) {
      spans[k].end = Math.min(spans[k].end, spans[k + 1].start);
    }
  }

  const ok =
    spans.length > 0 &&
    spans.some((s) => s.kind === "select") &&
    spans.some((s) => s.kind === "from");
  return { spans, supported: ok };
}

/** Which clause contains this offset? (end-exclusive; a cursor sitting at the
 *  boundary prefers the clause that starts there) */
export function clauseAtOffset(spans: ClauseSpan[], offset: number): ClauseKind | null {
  let hit: ClauseKind | null = null;
  for (const s of spans) {
    if (offset >= s.start && offset <= s.end) hit = s.kind;
  }
  return hit;
}

/** Span of the given clause (or null). */
export function spanOf(spans: ClauseSpan[], kind: ClauseKind): ClauseSpan | null {
  return spans.find((s) => s.kind === kind) ?? null;
}

/**
 * Build a stage variant of the query by dropping the given clauses.
 * Everything else (WITH, SELECT list, FROM/JOINs, remaining filters) is kept
 * verbatim, so the result stays a valid single SELECT.
 */
export function stripClauses(sql: string, spans: ClauseSpan[], drop: ClauseKind[]): string {
  if (spans.length === 0) return sql;
  const out: string[] = [];
  let pos = 0;
  for (const s of spans) {
    if (drop.includes(s.kind)) {
      // replace the clause with a newline (NOT a space — collapsing newlines
      // would merge `-- comment` lines into the code that follows)
      out.push(sql.slice(pos, s.start), "\n");
      pos = s.end;
    }
  }
  out.push(sql.slice(pos));
  return out.join("").replace(/\s*;\s*$/, "").trim();
}

/** Wrap a SELECT in an outer COUNT(*) — the row count the inner query produces. */
export function countWrapper(inner: string): string {
  return `SELECT COUNT(*) AS row_count FROM (\n${inner.replace(/;\s*$/, "")}\n) AS stage`;
}

export interface StagePlan {
  /** clause kinds present in the query, in execution order */
  present: ClauseKind[];
  /** count query per stage (execution order, FROM first) */
  stages: Array<{ kind: ClauseKind; sql: string }>;
  /** count query for the FULL query (the OUT number) */
  final: string;
}

/**
 * Build progressive count queries for the funnel:
 *   FROM(+JOIN) → +WHERE → +GROUP BY → +HAVING → OUT
 * Returns null when the query shape can't be sliced safely.
 *
 * Stage queries are assembled from the RAW clause spans, not the original
 * SELECT list — reusing the list would drag its aggregates (COUNT/SUM…)
 * into every pre-GROUP stage and collapse those counts to 1. The GROUP and
 * HAVING stages DO keep the original SELECT list inside a subquery, so
 * GROUP BY/alias references resolve.
 */
export function buildStagePlan(sql: string): StagePlan | null {
  const { spans, supported } = findClauses(sql);
  if (!supported) return null;

  const last = spans[spans.length - 1];
  const single = sql.slice(0, last.end); // cut extra statements after ";"
  const spanText = (kind: ClauseKind) => {
    const s = spans.find((x) => x.kind === kind);
    return s ? single.slice(s.start, s.end).replace(/\s+/g, " ").trim() : null;
  };
  const withText = spanText("with"); // CTE prefix (null when absent)
  const fromText = spanText("from");
  const whereText = spanText("where");
  const groupText = spanText("group");
  const havingText = spanText("having");
  if (!fromText) return null;

  const prefix = withText ? `${withText} ` : "";
  const present: ClauseKind[] = ["from"];
  const stages: StagePlan["stages"] = [];

  const base = `SELECT COUNT(*) AS row_count ${fromText}`;
  stages.push({ kind: "from", sql: `${prefix}${base}` });

  let whereSoFar = "";
  if (whereText) {
    present.push("where");
    whereSoFar = ` ${whereText}`;
    stages.push({ kind: "where", sql: `${prefix}${base}${whereSoFar}` });
  }

  if (groupText) {
    // keep the original SELECT list so aliases inside GROUP BY still resolve;
    // HAVING filters groups INSIDE the subquery — on the outer query it
    // would see a single ungrouped row and be meaningless
    const selectSpan = spans.find((s) => s.kind === "select");
    const selectBody = selectSpan
      ? single.slice(selectSpan.start, selectSpan.end).replace(/\s+/g, " ").replace(/^\s*select\b/i, "").trim()
      : "1";
    const groupedInner = `SELECT ${selectBody} ${fromText}${whereSoFar} ${groupText}`;
    present.push("group");
    stages.push({ kind: "group", sql: `${prefix}SELECT COUNT(*) AS row_count FROM (${groupedInner})` });
    if (havingText) {
      present.push("having");
      stages.push({
        kind: "having",
        sql: `${prefix}SELECT COUNT(*) AS row_count FROM (${groupedInner} ${havingText})`,
      });
    }
  }

  // final stage — the whole statement wrapped in COUNT(*) (immune to payload caps)
  const final = countWrapper(single);
  return { present, stages, final };
}
