// CSV → SQLite table machinery, shared by the sandbox API route and the
// Messy Data Gym. Extracted verbatim from api/sandbox/route.ts so the
// client-side gym profiler and the server-side table builder can NEVER
// drift apart: whatever the gym computes as "expected" is exactly what
// lands in the database. Pure string/number functions only — safe on
// both the server and the client.

export type SandboxColType = "INTEGER" | "REAL" | "TEXT";

export interface SandboxColumn {
  name: string;
  type: SandboxColType;
}

// ---- name handling --------------------------------------------------------

/** Sanitize a user table name to [a-z0-9_] (leading letter enforced). */
export function safeTableName(raw: string): string | null {
  let n = (raw || "").toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  if (!n) return null;
  if (/^\d/.test(n)) n = `t_${n}`;
  if (n.length > 40) n = n.slice(0, 40);
  return `csv_${n}`;
}

/** Sanitize a header cell to a quoted-identifier-safe column name. */
export function safeColumnName(raw: string, index: number): string {
  let n = (raw || "").toLowerCase().trim().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  if (!n) n = `col_${index + 1}`;
  if (/^\d/.test(n)) n = `c_${n}`;
  if (n.length > 40) n = n.slice(0, 40);
  return n;
}

// ---- CSV parsing (RFC4180-ish: quotes, doubled quotes, CRLF, delimiter
//      sniffing between comma / semicolon / tab) ----------------------------

export function sniffDelimiter(text: string): string {
  const sample = text.split(/\r?\n/).slice(0, 5).join("\n");
  const counts: Array<[string, number]> = [
    [",", (sample.match(/,/g) ?? []).length],
    [";", (sample.match(/;/g) ?? []).length],
    ["\t", (sample.match(/\t/g) ?? []).length],
  ];
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
}

export function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, ""); // strip BOM
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"' && field === "") {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.length > 1 || row[0] !== "") rows.push(row);
  return rows;
}

// ---- type inference -------------------------------------------------------

export const INT_RE = /^[+-]?\d+$/;
export const REAL_RE = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

export function inferType(values: string[]): SandboxColType {
  const vals = values.filter((v) => v.trim() !== "");
  if (vals.length === 0) return "TEXT";
  if (vals.every((v) => INT_RE.test(v.trim()))) return "INTEGER";
  if (vals.every((v) => REAL_RE.test(v.trim()))) return "REAL";
  return "TEXT";
}

/** SQL string/number literal with '' escaping — input is our own parsed text. */
export function sqlLiteral(v: string, type: SandboxColType): string {
  const t = v.trim();
  if (t === "") return "NULL";
  if (type === "INTEGER") return String(Number.parseInt(t, 10));
  if (type === "REAL") return String(Number.parseFloat(t));
  return `'${t.replace(/'/g, "''")}'`;
}

// ---- the one true parse ----------------------------------------------------

export interface GymParse {
  /** Final SQLite table name (csv_-prefixed, sanitized). */
  table: string;
  /** Final column list — sanitized, deduped, type-inferred. */
  columns: SandboxColumn[];
  /** Original header cells, same order as `columns`. */
  rawHeaders: string[];
  /** Data rows normalized to the column count (short rows padded, extras dropped). */
  rows: string[][];
}

export interface GymParseError {
  error: string;
}

/**
 * Parse a CSV exactly the way api/sandbox/route.ts does: same delimiter
 * sniffing, same header sanitizing/deduping, same type inference, same
 * empty-string→NULL rule via sqlLiteral. The gym derives every expected
 * answer from this parse, so checkers agree with the database by
 * construction.
 */
export function parseForTable(csv: string, rawName: string): GymParse | GymParseError {
  const table = safeTableName(rawName);
  if (!table) return { error: "Pick a name with at least one letter or digit." };

  const delimiter = sniffDelimiter(csv);
  const rows = parseCsv(csv, delimiter);
  if (rows.length < 2) return { error: "Need a header row plus at least one data row." };

  const headers = rows[0].map((h, i) => safeColumnName(h, i));
  const seen = new Map<string, number>();
  const named = headers.map((h, i) => {
    const n = seen.get(h) ?? 0;
    seen.set(h, n + 1);
    return { name: n === 0 ? h : `${h}_${n + 1}`, raw: rows[0][i] };
  });

  const dataRows = rows.slice(1);
  const normalized = dataRows.map((r) => {
    const out = r.slice(0, named.length);
    while (out.length < named.length) out.push("");
    return out;
  });

  const columns: SandboxColumn[] = named.map((c, ci) => ({
    name: c.name,
    type: inferType(normalized.map((r) => r[ci] ?? "")),
  }));

  return { table, columns, rawHeaders: rows[0], rows: normalized };
}

/** The value a cell becomes INSIDE SQLite after sqlLiteral — client-side
 *  mirror of the insert semantics: "" → NULL, INTEGER → parseInt (note:
 *  truncates "3.9"), REAL → parseFloat, TEXT → the trimmed string. */
export function cellAsStored(v: string, type: SandboxColType): string | number | null {
  const t = v.trim();
  if (t === "") return null;
  if (type === "INTEGER") {
    const n = Number.parseInt(t, 10);
    return Number.isNaN(n) ? null : n;
  }
  if (type === "REAL") {
    const n = Number.parseFloat(t);
    return Number.isNaN(n) ? null : n;
  }
  return t;
}
