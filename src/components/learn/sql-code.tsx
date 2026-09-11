"use client";

// Tiny SQL semantic highlighter shared by inline code chips, lesson code
// blocks, quiz prompts/choices, hint/solution snippets and case-study
// query builders. One regex pass, zero dependencies.
//
// Pastel keyword system — every clause FAMILY owns a pastel hue, so a
// learner can see query structure at a glance (the same pipeline the
// playground teaches: WITH → FROM/JOIN → WHERE → GROUP BY → SELECT →
// ORDER BY/LIMIT). Families map to the order of operations, not the
// written order:
//
//   projection  SELECT DISTINCT AS                    → violet   (what you get)
//   sources     FROM JOIN INNER LEFT … ON USING       → blue     (where rows come from)
//   row gate    WHERE AND OR NOT IN LIKE BETWEEN …    → rose     (which rows survive)
//   collapse    GROUP BY HAVING + all functions       → amber    (rows become numbers)
//   output      ORDER BY LIMIT OFFSET ASC DESC …      → orange   (shape of the result)
//   compose     WITH RECURSIVE UNION EXCEPT INTERSECT → fuchsia  (stacking result sets)
//   branching   CASE WHEN THEN ELSE END               → lime     (per-row decisions)
//   window      OVER PARTITION ROWS/RANGE frames      → sky      (peers, not collapse)
//   write verbs INSERT UPDATE DELETE CREATE …         → red      (the danger verbs)
//   string      'Berlin', '%stand%'                   → pink
//   number      200, 0.15                             → orange (quantities, with LIMIT)
//   BY          grammatical glue                      → inherits the surface color
//   comment     -- notes                              → muted italic
//
// Every hue used is remapped by the light themes (plum/pastel darken the
// 300 steps; blue/sky/pink overrides live in globals.css), so contrast
// holds across all four themes. Identifiers inherit the base color of
// the surrounding surface (emerald inside inline chips, zinc inside code
// blocks).

import { Fragment, type ReactNode } from "react";

const C_PROJECTION = "font-medium text-violet-300";
const C_SOURCES = "font-medium text-blue-300";
const C_GATE = "font-medium text-rose-300";
const C_COLLAPSE = "font-medium text-amber-300";
const C_OUTPUT = "font-medium text-orange-300";
const C_COMPOSE = "font-medium text-fuchsia-300";
const C_BRANCH = "font-medium text-lime-300";
const C_WINDOW = "font-medium text-sky-300";
const C_WRITE = "font-medium text-red-300";

/** token (uppercased) → pastel class for its clause family */
const KEY_CLASS = new Map<string, string>();
function family(cls: string, words: string) {
  for (const w of words.split(" ")) KEY_CLASS.set(w, cls);
}
family(C_PROJECTION, "SELECT DISTINCT AS");
family(C_SOURCES, "FROM JOIN INNER LEFT RIGHT FULL OUTER CROSS ON USING");
family(C_GATE, "WHERE AND OR NOT IN LIKE GLOB BETWEEN EXISTS IS NULL");
family(C_COLLAPSE, "GROUP HAVING");
family(C_OUTPUT, "ORDER LIMIT OFFSET ASC DESC NULLS FIRST LAST");
family(C_COMPOSE, "WITH RECURSIVE UNION EXCEPT INTERSECT ALL");
family(C_BRANCH, "CASE WHEN THEN ELSE END");
family(
  C_WINDOW,
  "OVER PARTITION ROWS RANGE GROUPS PRECEDING FOLLOWING CURRENT ROW UNBOUNDED EXCLUDE TIES OTHERS",
);
family(
  C_WRITE,
  "INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE VIEW INDEX ALTER ADD COLUMN DROP RENAME " +
    "TO PRIMARY KEY FOREIGN REFERENCES UNIQUE CHECK DEFAULT COLLATE CONSTRAINT AUTOINCREMENT " +
    "TEMP TEMPORARY GENERATED ALWAYS STORED RETURNING CONFLICT REPLACE IGNORE ABORT FAIL " +
    "CASCADE RESTRICT ACTION BEGIN COMMIT ROLLBACK TRANSACTION SAVEPOINT RELEASE PRAGMA " +
    "EXPLAIN VACUUM ANALYZE",
);
family(C_COLLAPSE, "CAST");

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
      nodes.push(<span key={key++} className="text-pink-300">{tok}</span>);
    } else if (num) {
      nodes.push(<span key={key++} className="tnum text-orange-300">{tok}</span>);
    } else if (word) {
      const up = word.toUpperCase();
      if (FUNCTIONS.has(up)) {
        nodes.push(<span key={key++} className="font-medium text-amber-300">{tok}</span>);
      } else {
        const cls = KEY_CLASS.get(up);
        if (cls) {
          nodes.push(<span key={key++} className={cls}>{tok}</span>);
        } else {
          nodes.push(<Fragment key={key++}>{tok}</Fragment>);
        }
      }
    }
    last = start + tok.length;
  }
  if (last < text.length) nodes.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  return <>{nodes}</>;
}
