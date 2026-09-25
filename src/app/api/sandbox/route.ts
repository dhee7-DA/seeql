import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabase } from "@/lib/sample-db";

// CSV sandbox API — bring-your-own-data. A pasted/uploaded CSV becomes a
// REAL SQLite table (csv_-prefixed) in the same database as the sample
// worlds, so learned queries and JOINs against storefront/finance data
// work unchanged. Deliberately conservative caps keep the sandbox safe:
// 2 MB of CSV, 64 columns, 10k rows per table.
//
//   POST   { name, csv }  → parse + infer + create (replace-on-collision)
//   DELETE { name }       → drop one csv_ table
//   GET                    → list csv_ tables (columns, types, row counts)

const MAX_CSV_BYTES = 2_000_000;
const MAX_COLUMNS = 64;
const MAX_ROWS = 10_000;
const MAX_TABLES = 6;

interface SandboxColumn {
  name: string;
  type: "INTEGER" | "REAL" | "TEXT";
}

interface SandboxTable {
  name: string;
  rowCount: number;
  columns: SandboxColumn[];
}

// ---- name handling --------------------------------------------------------

/** Sanitize a user table name to [a-z0-9_] (leading letter enforced). */
function safeTableName(raw: string): string | null {
  let n = (raw || "").toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  if (!n) return null;
  if (/^\d/.test(n)) n = `t_${n}`;
  if (n.length > 40) n = n.slice(0, 40);
  return `csv_${n}`;
}

/** Sanitize a header cell to a quoted-identifier-safe column name. */
function safeColumnName(raw: string, index: number): string {
  let n = (raw || "").toLowerCase().trim().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  if (!n) n = `col_${index + 1}`;
  if (/^\d/.test(n)) n = `c_${n}`;
  if (n.length > 40) n = n.slice(0, 40);
  return n;
}

// ---- CSV parsing (RFC4180-ish: quotes, doubled quotes, CRLF, delimiter
//      sniffing between comma / semicolon / tab) ----------------------------

function sniffDelimiter(text: string): string {
  const sample = text.split(/\r?\n/).slice(0, 5).join("\n");
  const counts: Array<[string, number]> = [
    [",", (sample.match(/,/g) ?? []).length],
    [";", (sample.match(/;/g) ?? []).length],
    ["\t", (sample.match(/\t/g) ?? []).length],
  ];
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
}

function parseCsv(text: string, delimiter: string): string[][] {
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

const INT_RE = /^[+-]?\d+$/;
const REAL_RE = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

function inferType(values: string[]): "INTEGER" | "REAL" | "TEXT" {
  const vals = values.filter((v) => v.trim() !== "");
  if (vals.length === 0) return "TEXT";
  if (vals.every((v) => INT_RE.test(v.trim()))) return "INTEGER";
  if (vals.every((v) => REAL_RE.test(v.trim()))) return "REAL";
  return "TEXT";
}

/** SQL string/number literal with '' escaping — input is our own parsed text. */
function sqlLiteral(v: string, type: SandboxColumn["type"]): string {
  const t = v.trim();
  if (t === "") return "NULL";
  if (type === "INTEGER") return String(Number.parseInt(t, 10));
  if (type === "REAL") return String(Number.parseFloat(t));
  return `'${t.replace(/'/g, "''")}'`;
}

async function listTables(): Promise<SandboxTable[]> {
  const master = (await db.$queryRawUnsafe(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'csv|_%' ESCAPE '|' ORDER BY name`,
  )) as Array<Record<string, unknown>>;
  const tables: SandboxTable[] = [];
  for (const row of master) {
    const name = String(row.name);
    try {
      const info = (await db.$queryRawUnsafe(`PRAGMA table_info("${name}")`)) as Array<Record<string, unknown>>;
      const count = (await db.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM "${name}"`)) as Array<Record<string, unknown>>;
      tables.push({
        name,
        rowCount: Number(count[0]?.n ?? 0),
        columns: info.map((c) => ({
          name: String(c.name),
          type: String(c.type ?? "TEXT") === "INTEGER" ? "INTEGER" : String(c.type ?? "TEXT") === "REAL" ? "REAL" : "TEXT",
        })),
      });
    } catch {
      /* table vanished mid-list — skip */
    }
  }
  return tables;
}

export async function GET() {
  try {
    await ensureDatabase();
    return NextResponse.json({ ok: true, tables: await listTables() });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not list sandbox tables" },
      { status: 200 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: unknown; csv?: unknown };
    if (typeof body.name !== "string" || typeof body.csv !== "string" || body.csv.trim() === "") {
      return NextResponse.json({ ok: false, error: "Provide a table name and CSV content." }, { status: 200 });
    }
    const csv = body.csv;
    if (csv.length > MAX_CSV_BYTES) {
      return NextResponse.json(
        { ok: false, error: `CSV too large (${(csv.length / 1e6).toFixed(1)} MB) — the sandbox caps at 2 MB.` },
        { status: 200 },
      );
    }
    const table = safeTableName(body.name);
    if (!table) {
      return NextResponse.json({ ok: false, error: "Pick a name with at least one letter or digit." }, { status: 200 });
    }
    await ensureDatabase();

    // cap the number of sandbox tables (a replace of an existing name is fine)
    const existing = await listTables();
    const replacing = existing.some((t) => t.name === table);
    if (!replacing && existing.length >= MAX_TABLES) {
      return NextResponse.json(
        { ok: false, error: `The sandbox holds ${MAX_TABLES} tables already — drop one to make room.` },
        { status: 200 },
      );
    }

    const delimiter = sniffDelimiter(csv);
    const rows = parseCsv(csv, delimiter);
    if (rows.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Need a header row plus at least one data row." },
        { status: 200 },
      );
    }
    const headers = rows[0].map((h, i) => safeColumnName(h, i));
    if (headers.length > MAX_COLUMNS) {
      return NextResponse.json(
        { ok: false, error: `Too many columns (${headers.length}) — the sandbox caps at ${MAX_COLUMNS}.` },
        { status: 200 },
      );
    }
    // dedupe header names
    const seen = new Map<string, number>();
    const columns = headers.map((h, i) => {
      const n = seen.get(h) ?? 0;
      seen.set(h, n + 1);
      return { name: n === 0 ? h : `${h}_${n + 1}`, raw: rows[0][i] };
    });

    const dataRows = rows.slice(1);
    if (dataRows.length > MAX_ROWS) {
      return NextResponse.json(
        { ok: false, error: `Too many rows (${dataRows.length}) — the sandbox caps at ${MAX_ROWS.toLocaleString()}.` },
        { status: 200 },
      );
    }

    // pad/trim each row to the column count
    const normalized = dataRows.map((r) => {
      const out = r.slice(0, columns.length);
      while (out.length < columns.length) out.push("");
      return out;
    });

    // infer types column-wise
    const types: SandboxColumn[] = columns.map((c, ci) => ({
      name: c.name,
      type: inferType(normalized.map((r) => r[ci] ?? "")),
    }));

    // replace-on-collision
    await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}"`);

    const colDefs = types.map((c) => `"${c.name}" ${c.type}`).join(", ");
    await db.$executeRawUnsafe(`CREATE TABLE "${table}" (${colDefs})`);

    const CHUNK = 100;
    for (let start = 0; start < normalized.length; start += CHUNK) {
      const chunk = normalized.slice(start, start + CHUNK);
      const valuesSql = chunk
        .map((r) => `(${r.map((v, ci) => sqlLiteral(v, types[ci].type)).join(", ")})`)
        .join(", ");
      await db.$executeRawUnsafe(`INSERT INTO "${table}" VALUES ${valuesSql}`);
    }

    return NextResponse.json({
      ok: true,
      table: { name: table, rowCount: normalized.length, columns: types },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not create the sandbox table" },
      { status: 200 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: unknown };
    if (typeof body.name !== "string") {
      return NextResponse.json({ ok: false, error: "Provide the table name to drop." }, { status: 200 });
    }
    const table = safeTableName(body.name);
    if (!table) {
      return NextResponse.json({ ok: false, error: "Unknown table name." }, { status: 200 });
    }
    await ensureDatabase();
    await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}"`);
    return NextResponse.json({ ok: true, dropped: table });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not drop the sandbox table" },
      { status: 200 },
    );
  }
}
