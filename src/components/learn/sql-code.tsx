"use client";

// Tiny SQL semantic highlighter shared by inline code chips, lesson code
// blocks and hint/solution snippets. One regex pass, zero dependencies.
//
// Color roles (deliberately theme-safe — every hue is remapped by the
// light themes Paper/Gallery so contrast holds everywhere):
//   keyword   → violet   (SELECT, WHERE, JOIN …)
//   function  → amber    (COUNT, ROUND, COALESCE …)
//   string    → rose     ('Berlin', '%stand%')
//   number    → orange   (200, 0.15)
//   comment   → muted    (-- notes)
//   identifiers inherit the base color of the surrounding surface
//   (emerald inside inline chips, zinc inside code blocks).

import { Fragment, type ReactNode } from "react";

const KEYWORDS = new Set(
  (
    "SELECT FROM WHERE GROUP BY HAVING ORDER LIMIT OFFSET DISTINCT ALL AS " +
    "AND OR NOT NULL IS IN LIKE GLOB BETWEEN EXISTS CAST JOIN INNER LEFT " +
    "RIGHT FULL OUTER CROSS ON USING UNION EXCEPT INTERSECT WITH RECURSIVE " +
    "CASE WHEN THEN ELSE END INSERT INTO VALUES UPDATE SET DELETE CREATE " +
    "TABLE VIEW INDEX ALTER ADD COLUMN DROP RENAME TO PRIMARY KEY FOREIGN " +
    "REFERENCES UNIQUE CHECK DEFAULT COLLATE ASC DESC NULLS FIRST LAST OVER " +
    "PARTITION ROWS RANGE PRECEDING FOLLOWING CURRENT ROW UNBOUNDED FILTER " +
    "WITHIN CONSTRAINT AUTOINCREMENT TEMP TEMPORARY GENERATED ALWAYS STORED " +
    "RETURNING CONFLICT REPLACE IGNORE ABORT FAIL CASCADE RESTRICT ACTION " +
    "BEGIN COMMIT ROLLBACK TRANSACTION SAVEPOINT RELEASE PRAGMA EXPLAIN VACUUM ANALYZE"
  ).split(" "),
);

const FUNCTIONS = new Set(
  (
    "COUNT SUM AVG MIN MAX TOTAL GROUP_CONCAT STRING_AGG ROUND ABS CEIL " +
    "CEILING FLOOR COALESCE IFNULL NULLIF IIF LENGTH LOWER UPPER SUBSTR " +
    "SUBSTRING TRIM LTRIM RTRIM REPLACE INSTR PRINTF FORMAT QUOTE CHAR HEX " +
    "RANDOM RANDOMBLOB DATE TIME DATETIME STRFTIME JULIANDAY UNIXEPOCH " +
    "ROW_NUMBER RANK DENSE_RANK NTILE PERCENT_RANK CUME_DIST LAG LEAD " +
    "FIRST_VALUE LAST_VALUE NTH_VALUE TYPEOF SIGN POW POWER SQRT LOG EXP MOD"
  ).split(" "),
);

const TOKEN_RE = /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z_0-9]*)/g;

/** Strict "is this SQL?" test for mixed prose/SQL strings (quiz choices, hints):
 *  requires real SQL syntax characters, or a bare single token like "DISTINCT".
 *  English words ("right", "first", "is") never trip it. */
export function looksLikeSql(s: string): boolean {
  return /[()='<>%*]/.test(s) || /^\s*[A-Za-z_][A-Za-z_0-9]*\s*$/.test(s);
}

/** Split SQL text into colored spans. Spans only — safe inside <pre>, <p> or <span>. */
export function SqlNodes({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(TOKEN_RE)) {
    const start = m.index ?? 0;
    if (start > last) nodes.push(<Fragment key={key++}>{text.slice(last, start)}</Fragment>);
    const [tok, comment, str, num, word] = m;
    if (comment) {
      nodes.push(<span key={key++} className="italic text-zinc-500">{tok}</span>);
    } else if (str) {
      nodes.push(<span key={key++} className="text-rose-300">{tok}</span>);
    } else if (num) {
      nodes.push(<span key={key++} className="tnum text-orange-300">{tok}</span>);
    } else if (word) {
      const up = word.toUpperCase();
      if (KEYWORDS.has(up)) {
        nodes.push(<span key={key++} className="font-medium text-violet-300">{tok}</span>);
      } else if (FUNCTIONS.has(up)) {
        nodes.push(<span key={key++} className="font-medium text-amber-300">{tok}</span>);
      } else {
        nodes.push(<Fragment key={key++}>{tok}</Fragment>);
      }
    }
    last = start + tok.length;
  }
  if (last < text.length) nodes.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  return <>{nodes}</>;
}
