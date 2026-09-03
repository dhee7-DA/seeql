// SQL statement utilities shared by the API, the lesson CodeBlock and QA
// scripts: a string/comment-aware statement scanner and a splitter that cuts
// multi-statement payloads into individual runnable statements.
//
// ⚠️ The scanner previously fell through after opening a comment, which set
// `seen` — every statement ending in a `-- comment` was miscounted as two
// statements and rejected by the API. The `continue` on both comment openers
// is the fix; keep it.

/** Count semicolon-separated statements, ignoring strings, quoted identifiers,
 *  brackets and comments. */
export function countStatements(input: string): number {
  let inSingle = false, inDouble = false, inBacktick = false, inBracket = false,
      inLine = false, inBlock = false, count = 0, seen = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i], next = input[i + 1];
    if (inLine) { if (ch === "\n") inLine = false; continue; }
    if (inBlock) { if (ch === "*" && next === "/") { inBlock = false; i++; } continue; }
    if (inSingle) { if (ch === "'") { if (next === "'") i++; else inSingle = false; } continue; }
    if (inDouble) { if (ch === '"') { if (next === '"') i++; else inDouble = false; } continue; }
    if (inBacktick) { if (ch === "`") inBacktick = false; continue; }
    if (inBracket) { if (ch === "]") inBracket = false; continue; }
    if (ch === "'" && !inDouble) inSingle = true;
    else if (ch === '"' && !inSingle) inDouble = true;
    else if (ch === "`") inBacktick = true;
    else if (ch === "[") inBracket = true;
    else if (ch === "-" && next === "-") { inLine = true; continue; }
    else if (ch === "/" && next === "*") { inBlock = true; continue; }
    else if (ch === ";") { if (seen) { count++; seen = false; } continue; }
    if (!/\s/.test(ch)) seen = true;
  }
  if (seen) count++;
  return count;
}

export function hasMultipleStatements(input: string): boolean {
  return countStatements(input) > 1;
}

/** Split a payload into individual statements. A comment run following a
 *  semicolon (e.g. `SELECT …;   -- deduped: 4 rows`) stays with the statement
 *  it annotates, not with the next one. */
export function splitStatements(input: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inSingle = false, inDouble = false, inBacktick = false, inBracket = false,
      inLine = false, inBlock = false;

  const flush = () => {
    const t = cur.trim();
    if (t) out.push(t);
    cur = "";
  };

  for (let i = 0; i < input.length; i++) {
    const ch = input[i], next = input[i + 1];
    if (inLine) { cur += ch; if (ch === "\n") inLine = false; continue; }
    if (inBlock) { cur += ch; if (ch === "*" && next === "/") { cur += next; i++; inBlock = false; } continue; }
    if (inSingle) { cur += ch; if (ch === "'") { if (next === "'") { cur += next; i++; } else inSingle = false; } continue; }
    if (inDouble) { cur += ch; if (ch === '"') { if (next === '"') { cur += next; i++; } else inDouble = false; } continue; }
    if (inBacktick) { cur += ch; if (ch === "`") inBacktick = false; continue; }
    if (inBracket) { cur += ch; if (ch === "]") inBracket = false; continue; }
    if (ch === "'" && !inDouble) { inSingle = true; cur += ch; continue; }
    if (ch === '"' && !inSingle) { inDouble = true; cur += ch; continue; }
    if (ch === "`") { inBacktick = true; cur += ch; continue; }
    if (ch === "[") { inBracket = true; cur += ch; continue; }
    if (ch === "-" && next === "-") { inLine = true; cur += ch; continue; }
    if (ch === "/" && next === "*") { inBlock = true; cur += ch; continue; }
    if (ch === ";") {
      cur += ch;
      // absorb the whitespace/comment run that follows — those lines annotate
      // THIS statement (e.g. `-- deduped: 4 rows`), they don't open the next.
      let j = i + 1, line2 = false, block2 = false;
      while (j < input.length) {
        const c = input[j], n = input[j + 1];
        if (line2) { if (c === "\n") line2 = false; j++; continue; }
        if (block2) { if (c === "*" && n === "/") { block2 = false; j += 2; continue; } j++; continue; }
        if (c === "-" && n === "-") { line2 = true; j += 2; continue; }
        if (c === "/" && n === "*") { block2 = true; j += 2; continue; }
        if (/\s/.test(c)) { j++; continue; }
        break;
      }
      cur += input.slice(i + 1, j);
      i = j - 1;
      flush();
      continue;
    }
    cur += ch;
  }
  flush();
  return out;
}
