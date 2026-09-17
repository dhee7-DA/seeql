import { NextRequest, NextResponse } from "next/server";
import { Parser } from "node-sql-parser";
import { db } from "@/lib/db";
import { ensureDatabase } from "@/lib/sample-db";
import { hasMultipleStatements } from "@/lib/sql-statements";
import { LANDING_PUZZLES, buildPuzzleVerdict, type PuzzleVerdict } from "@/lib/landing-puzzles";

// Landing "Try it live" sandbox — the real storefront database, read-only.
// Alongside the query result this endpoint returns a clause-stage pipeline:
// by cloning the parsed SELECT, swapping the projection for *, stripping
// later clauses and wrapping the whole thing in SELECT COUNT(*) FROM (…),
// we can report how many rows exist after FROM+JOINs, after WHERE, as
// GROUP BY buckets, and after HAVING — the query's shape, measured live.
// Every table also ships its column list (name/type/PK/FK target) so the
// landing schema strip can render the real schema and click-to-insert.
// The run itself always executes inside a transaction that is rolled back.

const MAX_SQL_LENGTH = 4_000;
const MAX_ROWS = 200;
const TABLES = [
  "customers",
  "suppliers",
  "products",
  "orders",
  "order_items",
  "employees",
  "payments",
  "refunds",
  "shipments",
  "acquisitions",
] as const;

interface Stage {
  /** Stage id used by the client for ordering/labels. */
  id: "base" | "where" | "group" | "having";
  rows: number;
}

/** A few REAL rows sampled at a stage — the playback's cast. */
interface SampleRows {
  columns: string[];
  rows: unknown[][];
}

type StageSamples = Partial<Record<Stage["id"], SampleRows>>;

const SAMPLE_ROW_LIMIT = 6;
const TIMESTAMPY = new Set([
  "created_at",
  "hired_at",
  "acquired_at",
  "shipped_at",
  "refunded_at",
  "paid_at",
  "delivered_at",
]);
/** Columns that make boring identity chips. */
const UNHELPFUL = new Set(["email", ...TIMESTAMPY]);

interface SandboxColumn {
  name: string;
  type: string;
  pk: boolean;
  /** "orders.customer_id → customers.id" style target when the column is a FK. */
  fk: string | null;
}

interface SandboxTable {
  name: string;
  rows: number;
  cols: SandboxColumn[];
}

/** Tables the query actually reads (FROM/JOIN, CTE references filtered out),
 *  with live row counts — drives the playback's source frame. */
interface SandboxSource {
  name: string;
  rows: number;
}

/** One EXPLAIN QUERY PLAN step — SQLite's own execution recipe. */
interface SandboxPlanRow {
  id: number;
  parent: number | null;
  detail: string;
}

const MAX_PLAN_ROWS = 24;

/** Ask SQLite how it will execute this statement. Read-only, best-effort:
 *  exotic shapes (or a VALUES clause) just yield an empty plan. */
async function explainPlan(tx: { $queryRawUnsafe: (s: string) => unknown }, sql: string): Promise<SandboxPlanRow[]> {
  try {
    const raw = (await tx.$queryRawUnsafe(`EXPLAIN QUERY PLAN ${sql}`)) as Array<
      Record<string, unknown>
    >;
    if (!Array.isArray(raw)) return [];
    return raw.slice(0, MAX_PLAN_ROWS).map((r) => ({
      id: Number(r.id ?? 0),
      parent: r.parent == null ? null : Number(r.parent),
      detail: String(r.detail ?? ""),
    }));
  } catch {
    return [];
  }
}

/** FROM/JOIN keyword scan — fallback when node-sql-parser can't take a query
 *  SQLite runs fine (window functions, exotic shapes). Without it a successful
 *  run would report no sources and the map's "tables your query touches" glow
 *  would freeze on the previous query. Only known tables are kept, in
 *  first-mention order; `FROM (subquery)` yields nothing at that keyword but
 *  the subquery's own FROM/JOINs match. */
function extractTablesFallback(sql: string): string[] {
  const known = new Set<string>(TABLES);
  const seen = new Set<string>();
  const out: string[] = [];
  const re = /\b(?:from|join)\s+["'`[]?([a-zA-Z_][a-zA-Z0-9_]*)["'`\]]?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    const name = m[1].toLowerCase();
    if (known.has(name) && !seen.has(name)) {
      seen.add(name);
      out.push(name);
    }
  }
  return out;
}

class SandboxRollback extends Error {
  constructor() {
    super("__sandbox_rollback__");
  }
}

function cleanError(raw: string): string {
  const m = raw.match(/Message: `([^`]+)`/);
  if (m) return m[1].trim();
  return raw.replace(/\s*Invalid `prisma\.\$query\w+`\(\) invocation:?\s*/g, "").trim();
}

function stripLeadingComments(sql: string): string {
  return sql.replace(/^(\s*(?:--[^\n]*\n|\/\*[\s\S]*?\*\/)+\s*)*/, "");
}

function normalizeCell(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  const t = typeof v;
  if (t === "string" || t === "boolean" || t === "number") return v;
  if (typeof BigInt !== "undefined" && typeof v === "bigint") {
    return v >= BigInt(Number.MIN_SAFE_INTEGER) && v <= BigInt(Number.MAX_SAFE_INTEGER)
      ? Number(v)
      : v.toString();
  }
  if (v instanceof Date) return v.toISOString();
  if (v instanceof Uint8Array) return `0x${Array.from(v.slice(0, 8)).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
  return String(v);
}

/** Clone the parsed SELECT and emit `SELECT COUNT(*) FROM (<staged>)` that
 *  keeps only the clauses up to `keep`. Projection becomes * so aggregates
 *  don't collapse the probe to one row; ORDER BY/LIMIT don't affect counts. */
function stageProbe(
  parser: Parser,
  ast: unknown,
  keep: "base" | "where" | "group" | "having",
): string | null {
  try {
    const src = ast as Record<string, unknown>;
    if (src.type !== "select") return null;
    // Set operations (UNION/…) arrive as one AST chained through _next —
    // staging only the first branch would report a misleading count.
    if (src._next != null) return null;
    const clone = structuredClone(src) as Record<string, unknown>;
    // Projection → * (sqlite column items are bare {expr, as} — no type wrapper).
    clone.columns = [{ expr: { type: "column_ref", table: null, column: "*" }, as: null }];
    if (keep === "base") {
      clone.where = null;
      clone.groupby = null;
      clone.having = null;
    } else if (keep === "where") {
      clone.groupby = null;
      clone.having = null;
    } else if (keep === "group") {
      clone.having = null;
    }
    clone.orderby = null;
    clone.limit = null;
    clone.for_update = null;
    const inner = parser.sqlify(clone as unknown as Parameters<Parser["sqlify"]>[0], {
      database: "sqlite",
    });
    return `SELECT COUNT(*) AS rows FROM (${inner})`;
  } catch {
    return null;
  }
}

interface FromRef {
  table: string;
  as: string | null;
}

/** A projection entry; `count` marks the bucket-size COUNT(*). */
interface ProjCol {
  table: string | null;
  column: string;
  as: string | null;
  count?: boolean;
}

/** FROM/JOIN table refs with aliases, first-mention order. */
function extractFromRefs(ast: Record<string, unknown>): FromRef[] {
  const out: FromRef[] = [];
  if (Array.isArray(ast.from)) {
    for (const item of ast.from as Array<Record<string, unknown>>) {
      if (item && typeof item.table === "string") {
        out.push({ table: item.table, as: typeof item.as === "string" ? item.as : null });
      }
    }
  }
  return out;
}

/** GROUP BY columns as projection entries; null when any bucket key isn't a
 *  plain column (positional/expr grouping) — samples just skip then. */
function extractGroupCols(ast: Record<string, unknown>): ProjCol[] | null {
  const gb = ast.groupby as Record<string, unknown> | null;
  if (!gb || !Array.isArray(gb.columns)) return null;
  const out: ProjCol[] = [];
  for (const c of gb.columns as Array<Record<string, unknown>>) {
    if (!c || c.type !== "column_ref" || typeof c.column !== "string") return null;
    out.push({ table: typeof c.table === "string" ? c.table : null, column: c.column, as: null });
  }
  return out.length > 0 ? out : null;
}

function sanitizeLabel(s: string): string {
  return s.replace(/[^A-Za-z0-9_]/g, "_");
}

/** Clone the parsed SELECT with an explicit identity projection (real column
 *  refs, collision-safe labels) — samples REAL rows at each stage without
 *  the duplicate-column-name hazard that SELECT * has on joins. */
function stageSample(
  parser: Parser,
  ast: unknown,
  keep: "base" | "where" | "group" | "having",
  proj: ProjCol[],
): string | null {
  try {
    const src = ast as Record<string, unknown>;
    if (src.type !== "select" || src._next != null) return null;
    const clone = structuredClone(src) as Record<string, unknown>;
    clone.columns = proj.map((p) =>
      p.count
        ? {
            expr: {
              type: "aggr_func",
              name: "COUNT",
              args: { expr: { type: "column_ref", table: null, column: "*" } },
            },
            as: p.as,
          }
        : {
            expr: { type: "column_ref", table: p.table, column: p.column },
            as: p.as,
          },
    );
    if (keep === "base") {
      clone.where = null;
      clone.groupby = null;
      clone.having = null;
    } else if (keep === "where") {
      clone.groupby = null;
      clone.having = null;
    } else if (keep === "group") {
      clone.having = null;
    }
    clone.orderby = null;
    clone.limit = null;
    clone.for_update = null;
    const inner = parser.sqlify(clone as unknown as Parameters<Parser["sqlify"]>[0], {
      database: "sqlite",
    });
    return `${inner} LIMIT ${SAMPLE_ROW_LIMIT}`;
  } catch {
    return null;
  }
}

/** Pick the columns that make a row recognizable: TEXT first (skipping
 *  timestamps/emails), then money-ish numerics. */
function identityCols(cols: SandboxColumn[], n: number): string[] {
  const isMoney = (t: string) => /real|floa|doub|num|dec/.test(t);
  const text = cols.filter((c) => c.type.includes("text") && !UNHELPFUL.has(c.name));
  const rest = cols
    .filter((c) => !c.type.includes("text") && c.name !== "id" && !UNHELPFUL.has(c.name))
    .sort((a, b) => Number(isMoney(b.type)) - Number(isMoney(a.type)));
  const picked = [...text, ...rest].map((c) => c.name);
  if (picked.length < n) {
    const id = cols.find((c) => c.name === "id");
    if (id) picked.push(id.name);
  }
  return picked.slice(0, n);
}

/** Identity projection: 2 recognizable columns from the first table, 1 from
 *  each join — e.g. customers.name, customers.city, orders.status. */
function buildRowProj(fromRefs: FromRef[], colInfo: Map<string, SandboxColumn[]>): ProjCol[] | null {
  const proj: ProjCol[] = [];
  let first = true;
  for (const ref of fromRefs) {
    const cols = colInfo.get(ref.table);
    if (!cols) continue; // CTE or unknown — no identity columns to offer
    const qual = ref.as ?? ref.table;
    for (const name of identityCols(cols, first ? 2 : 1)) {
      proj.push(
        first
          ? { table: qual, column: name, as: null }
          : { table: qual, column: name, as: sanitizeLabel(`${qual}_${name}`) },
      );
    }
    first = false;
  }
  return proj.length > 0 ? proj : null;
}

/** Bucket projection: the GROUP BY keys + COUNT(*) — a bucket's identity. */
function buildBucketProj(groupCols: ProjCol[]): ProjCol[] {
  return [
    ...groupCols.map((c) => ({
      table: c.table,
      column: c.column,
      as: c.table ? sanitizeLabel(`${c.table}_${c.column}`) : null,
    })),
    { table: null, column: "*", as: "bucket_rows", count: true },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { sql?: unknown; puzzleId?: unknown };
    if (typeof body.sql !== "string" || body.sql.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Empty query." }, { status: 200 });
    }
    // Optional puzzle check — when set and the run succeeds, the reference
    // query runs in the same transaction and the gap is phrased as feedback.
    const activePuzzle =
      typeof body.puzzleId === "string"
        ? (LANDING_PUZZLES.find((p) => p.id === body.puzzleId) ?? null)
        : null;
    const sql = body.sql.trim().replace(/;+\s*$/, "");
    if (sql.length > MAX_SQL_LENGTH) {
      return NextResponse.json(
        { ok: false, error: `Query too long (${MAX_SQL_LENGTH / 1000}k character limit).` },
        { status: 200 },
      );
    }
    if (hasMultipleStatements(sql)) {
      return NextResponse.json(
        { ok: false, error: "One statement at a time, please.", hint: "This sandbox runs a single SELECT." },
        { status: 200 },
      );
    }
    const statementType = (stripLeadingComments(sql).match(/^[a-zA-Z]+/)?.[0] ?? "").toUpperCase();
    if (!["SELECT", "WITH", "VALUES"].includes(statementType)) {
      return NextResponse.json(
        {
          ok: false,
          error: "This sandbox is read-only — SELECT queries only.",
          hint: "Every other keyword is off the table here; the full Playground allows writes in its sandbox mode.",
        },
        { status: 200 },
      );
    }

    await ensureDatabase();

    // Best-effort stage SQL — parse failures or exotic shapes simply skip the probe.
    const parser = new Parser();
    let stageSql: Array<{ id: Stage["id"]; sql: string }> = [];
    let sourceNames: string[] = [];
    let parsedAst: Record<string, unknown> | null = null;
    let parseOk = false;
    try {
      const { ast, tableList } = parser.parse(sql, { database: "sqlite" }) as unknown as {
        ast: Record<string, unknown>;
        tableList: string[];
      };
      parseOk = true;
      parsedAst = ast;
      // "select::null::orders" → "orders"; keep only real tables (drops CTE
      // names like "big"), dedupe, preserve first-mention order.
      const seen = new Set<string>();
      const known = new Set<string>(TABLES);
      for (const entry of tableList) {
        const name = entry.split("::").pop() ?? "";
        if (known.has(name) && !seen.has(name)) {
          seen.add(name);
          sourceNames.push(name);
        }
      }
      const hasWhere = ast.where != null;
      const hasGroup = ast.groupby != null;
      const hasHaving = ast.having != null;
      const plan: Array<{ id: Stage["id"]; on: boolean }> = [
        { id: "base", on: true },
        { id: "where", on: hasWhere },
        { id: "group", on: hasGroup },
        { id: "having", on: hasGroup && hasHaving },
      ];
      stageSql = plan
        .filter((s) => s.on)
        .map((s) => {
          const q = stageProbe(parser, ast, s.id);
          return q ? { id: s.id, sql: q } : null;
        })
        .filter((x): x is { id: Stage["id"]; sql: string } => x !== null);
    } catch {
      parseOk = false;
    }
    // Parser gave us nothing usable — scan the SQL directly so a successful
    // run always reports the tables it read (map glow, playback chips).
    if (sourceNames.length === 0) sourceNames = extractTablesFallback(sql);

    const started = performance.now();
    let captured: {
      columns: string[];
      rows: unknown[][];
      rowCount: number;
      truncated: boolean;
      stages: Stage[];
      samples: StageSamples;
      tables: SandboxTable[];
      sources: SandboxSource[];
      plan: SandboxPlanRow[];
      puzzle?: PuzzleVerdict;
    } | null = null;

    try {
      await db.$transaction(
        async (tx) => {
          const raw = (await tx.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
          const list = Array.isArray(raw) ? raw : [];
          const columns = list.length > 0 ? Object.keys(list[0]) : [];
          const rows = list.map((r) => columns.map((c) => normalizeCell(r[c])));

          const stages: Stage[] = [];
          if (parseOk) {
            for (const s of stageSql) {
              try {
                const probe = (await tx.$queryRawUnsafe(s.sql)) as Array<Record<string, unknown>>;
                stages.push({ id: s.id, rows: Number(probe[0]?.rows ?? 0) });
              } catch {
                /* stage dropped — probe is best effort */
              }
            }
          }

          const countsSql = `SELECT ${TABLES.map(
            (t) => `(SELECT COUNT(*) FROM ${t}) AS ${t}`,
          ).join(", ")}`;
          const counts = (await tx.$queryRawUnsafe(countsSql)) as Array<Record<string, unknown>>;
          const countOf = (t: string) => Number(counts[0]?.[t] ?? 0);
          const sources: SandboxSource[] = sourceNames.map((name) => ({
            name,
            rows: countOf(name),
          }));

          // Real schema per table — PRAGMA table_info + foreign_key_list.
          // TABLES is a fixed literal so the identifiers are injection-safe.
          const tables: SandboxTable[] = await Promise.all(
            TABLES.map(async (t) => {
              const info = (await tx.$queryRawUnsafe(`PRAGMA table_info(${t})`)) as Array<
                Record<string, unknown>
              >;
              const fks = (await tx.$queryRawUnsafe(`PRAGMA foreign_key_list(${t})`)) as Array<
                Record<string, unknown>
              >;
              const fkMap = new Map<string, string>();
              for (const f of fks) {
                const to = f.to != null ? String(f.to) : "id";
                fkMap.set(String(f.from), `${String(f.table)}.${to}`);
              }
              return {
                name: t,
                rows: countOf(t),
                cols: info.map((c) => ({
                  name: String(c.name),
                  type: String(c.type ?? "").toLowerCase(),
                  pk: Number(c.pk ?? 0) > 0,
                  fk: fkMap.get(String(c.name)) ?? null,
                })),
              };
            }),
          );

          // Sample REAL rows at every stage — the playback's cast. Uses an
          // explicit identity projection (2 cols from the first table, 1 from
          // each join; buckets are GROUP BY keys + COUNT) so join column-name
          // collisions can't mangle the objects.
          const samples: StageSamples = {};
          if (parseOk && parsedAst) {
            const colInfo = new Map(tables.map((t) => [t.name, t.cols]));
            const rowProj = buildRowProj(extractFromRefs(parsedAst), colInfo);
            const groupCols = extractGroupCols(parsedAst);
            const bucketProj = groupCols ? buildBucketProj(groupCols) : null;
            for (const s of stageSql) {
              const proj = s.id === "group" || s.id === "having" ? bucketProj : rowProj;
              if (!proj) continue;
              const sampleSql = stageSample(parser, parsedAst, s.id, proj);
              if (!sampleSql) continue;
              try {
                const list = (await tx.$queryRawUnsafe(sampleSql)) as Array<
                  Record<string, unknown>
                >;
                if (Array.isArray(list) && list.length > 0) {
                  const sampleCols = Object.keys(list[0]);
                  samples[s.id] = {
                    columns: sampleCols,
                    rows: list.map((r) => sampleCols.map((c) => normalizeCell(r[c]))),
                  };
                }
              } catch {
                /* sample is best effort — count probe already succeeded */
              }
            }
          }

          // How will SQLite run this? The plan tree — read-only, best effort.
          const plan = await explainPlan(tx, sql);

          // Puzzle check — the reference runs inside the same tx; a mismatch
          // becomes guidance, never an error. Best effort: no verdict on failure.
          let puzzle: PuzzleVerdict | undefined;
          if (activePuzzle) {
            try {
              const refRaw = (await tx.$queryRawUnsafe(
                activePuzzle.reference,
              )) as Array<Record<string, unknown>>;
              const refList = Array.isArray(refRaw) ? refRaw : [];
              const refCols = refList.length > 0 ? Object.keys(refList[0]) : [];
              const refRows = refList.map((r) => refCols.map((c) => normalizeCell(r[c])));
              puzzle = buildPuzzleVerdict(
                activePuzzle,
                { columns, rows },
                { columns: refCols, rows: refRows },
              );
            } catch {
              /* no verdict this run */
            }
          }

          captured = {
            columns,
            rows: rows.slice(0, MAX_ROWS),
            rowCount: rows.length,
            truncated: rows.length > MAX_ROWS,
            stages,
            samples,
            tables,
            sources,
            plan,
            puzzle,
          };
          throw new SandboxRollback();
        },
        { maxWait: 5000, timeout: 10_000 },
      );
    } catch (err) {
      if (!(err instanceof SandboxRollback)) throw err;
    }

    const got = captured ?? {
      columns: [] as string[],
      rows: [] as unknown[][],
      rowCount: 0,
      truncated: false,
      stages: [] as Stage[],
      samples: {} as StageSamples,
      tables: [] as SandboxTable[],
      sources: [] as SandboxSource[],
      plan: [] as SandboxPlanRow[],
      puzzle: undefined,
    };

    return NextResponse.json({
      ok: true,
      columns: got.columns,
      rows: got.rows,
      rowCount: got.rowCount,
      truncated: got.truncated,
      durationMs: Math.round((performance.now() - started) * 100) / 100,
      stages: got.stages,
      samples: got.samples,
      tables: got.tables,
      sources: got.sources,
      plan: got.plan,
      puzzle: got.puzzle,
    });
  } catch (err) {
    let message = cleanError(err instanceof Error ? err.message : "Unexpected server error");
    let hint: string | undefined;
    if (/no such table/i.test(message)) {
      hint = "The storefront has: customers, suppliers, products, orders, order_items, employees, payments, refunds, shipments, acquisitions.";
    } else if (/no such column/i.test(message)) {
      hint = "Check the schema strip below — open a table and click any column to insert it at your cursor.";
    } else if (/syntax error/i.test(message)) {
      hint = "SQLite could not parse this statement — the demo runs on SQLite dialect.";
    } else if (/read-only|readonly/i.test(message)) {
      hint = "This sandbox only runs SELECT queries.";
    } else if (/cannot be converted to a BigInt/i.test(message)) {
      hint = "SQLite could run this — write the literal as a decimal (0.0, not 0) so numeric columns keep their type.";
    }
    return NextResponse.json({ ok: false, error: message, hint }, { status: 200 });
  }
}
