import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabase } from "@/lib/sample-db";
import { hasMultipleStatements } from "@/lib/sql-statements";
import { buildStagePlan, findClauses } from "@/lib/sql-clauses";
import { normalizeCell } from "@/lib/cell";
import type { CellValue } from "@/lib/sql-types";

// POST /api/stages — the step inspector's server brain.
//
// Given a SELECT, composes and runs (server-side, one round trip):
//   • a COUNT(*) per execution stage (FROM → WHERE → GROUP BY → HAVING → OUT)
//   • a row-form of every stage (capped) — the actual rows alive at that moment
//   • EXCEPT diffs for the filter gates — the rows each gate killed
// Everything is composed from the user's own clause text (buildStagePlan);
// every query here is a read-only SELECT.

const MAX_SQL_LENGTH = 20_000;
const MAX_STAGE_ROWS = 60;
const MAX_DROPPED_ROWS = 24;

/** Prisma wraps raw errors in boilerplate — keep just the underlying message. */
function cleanError(raw: string): string {
  const m = raw.match(/Message: `([^`]+)`/);
  if (m) return m[1].trim();
  return raw.replace(/\s*Invalid `prisma\.\$query\w+`\(\) invocation:?\s*/g, "").trim();
}

const IDENT_RE = /^[A-Za-z_]\w*$/;

/** Tokens that can never be a table name or alias. */
const ALIAS_STOP = new Set([
  "on", "using", "as", "where", "group", "order", "having", "limit", "offset",
  "inner", "left", "right", "full", "cross", "outer", "join", "union",
]);

interface TableRef {
  table: string;
  alias: string;
}

/**
 * Extract the (table, alias) list from a raw FROM clause. Handles the
 * teaching-grade shapes: single table, comma joins, [INNER|LEFT|RIGHT|FULL|
 * CROSS|OUTER] JOIN chains with ON/USING conditions. Returns null for
 * anything with parentheses (derived tables / subqueries) — those lose the
 * row view, the counts keep working.
 */
function parseFromTables(fromText: string): TableRef[] | null {
  const body = fromText.replace(/^\s*from\b/i, "").trim();
  if (body.length === 0 || body.includes("(") || body.includes(")")) return null;
  const tokens = body.split(/\s+/);
  const out: TableRef[] = [];
  const unquote = (t: string) => t.replace(/^["`[]/, "").replace(/["`\]]$/, "");
  let expectTable = true;
  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];
    const low = tok.toLowerCase();
    if (expectTable) {
      if (low === ",") { i++; continue; }
      if (low !== "on" && low !== "using" && ALIAS_STOP.has(low)) { i++; continue; }
      const table = unquote(tok);
      if (!IDENT_RE.test(table)) return null;
      i++;
      let alias = table;
      if (i < tokens.length) {
        const nxt = tokens[i];
        const nlow = nxt.toLowerCase();
        if (nlow === "as") {
          i++;
          if (i >= tokens.length) return null;
          alias = unquote(tokens[i]);
          i++;
        } else if (!ALIAS_STOP.has(nlow) && IDENT_RE.test(nxt)) {
          alias = unquote(nxt);
          i++;
        }
      }
      out.push({ table, alias });
      expectTable = false;
    } else {
      // inside an ON/USING condition — a JOIN keyword or comma starts the next source
      if (low === "," || low === "join" || low === "inner" || low === "left" || low === "right" || low === "full" || low === "cross") {
        expectTable = true;
      }
      i++;
    }
  }
  return out.length > 0 ? out : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { sql?: unknown };
    if (typeof body.sql !== "string" || body.sql.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Empty query." }, { status: 200 });
    }
    const sql = body.sql.trim().replace(/;+\s*$/, "");
    if (sql.length > MAX_SQL_LENGTH) {
      return NextResponse.json({ ok: false, error: "Query too long." }, { status: 200 });
    }
    if (hasMultipleStatements(sql)) {
      return NextResponse.json({ ok: false, error: "Only one statement at a time." }, { status: 200 });
    }

    // Pre-fetch the schema for every table the FROM clause mentions, so the
    // sync projector inside buildStagePlan can work from a warm cache.
    const { spans } = findClauses(sql);
    const fromSpan = spans.find((s) => s.kind === "from");
    const fromText = fromSpan
      ? sql.slice(fromSpan.start, fromSpan.end).replace(/\s+/g, " ").trim()
      : null;
    const tables = fromText ? parseFromTables(fromText) : null;
    const pragmaCache = new Map<string, string[] | null>();
    if (tables) {
      for (const { table } of tables) {
        if (pragmaCache.has(table)) continue;
        let cols: string[] | null = null;
        try {
          // table name is identifier-validated — safe to interpolate
          const info = (await db.$queryRawUnsafe(`PRAGMA table_info(${table})`)) as Array<Record<string, unknown>>;
          const names = info.map((r) => String(r.name));
          if (names.length > 0) cols = names;
        } catch {
          cols = null;
        }
        pragmaCache.set(table, cols);
      }
    }

    const projectFrom = (ft: string): string | null => {
      const ts = parseFromTables(ft);
      if (!ts) return null;
      const used = new Set<string>();
      const parts: string[] = [];
      for (const { table, alias } of ts) {
        const cols = pragmaCache.get(table);
        if (!cols) return null; // unknown table (CTE? typo?) — no row view
        for (const c of cols) {
          let name = c;
          if (used.has(name)) name = `${c}·${alias}`;
          if (used.has(name)) name = `${c}·${alias}2`;
          used.add(name);
          parts.push(`${alias}.${c} AS "${name}"`);
        }
      }
      return parts.length > 0 ? parts.join(", ") : null;
    };

    const plan = buildStagePlan(sql, { projectFrom });
    if (!plan) {
      return NextResponse.json({ ok: false, error: "unsupported" }, { status: 200 });
    }

    await ensureDatabase();

    const runCount = async (q: string): Promise<number | null> => {
      try {
        const raw = (await db.$queryRawUnsafe(q)) as Array<Record<string, unknown>>;
        const list = Array.isArray(raw) ? raw : [];
        return list.length > 0 ? Number(list[0][Object.keys(list[0])[0]]) : null;
      } catch {
        return null;
      }
    };
    const runRows = async (q: string, cap: number) => {
      try {
        const raw = (await db.$queryRawUnsafe(q)) as Array<Record<string, unknown>>;
        const list = Array.isArray(raw) ? raw : [];
        const columns = list.length > 0 ? Object.keys(list[0]) : [];
        return {
          columns,
          rows: list.map((r) => columns.map((c) => normalizeCell(r[c]))).slice(0, cap) as CellValue[][],
        };
      } catch {
        return null;
      }
    };

    // counts per stage + OUT (parallel — the DB is tiny, these are all scans)
    const counts = await Promise.all([...plan.stages.map((s) => runCount(s.sql)), runCount(plan.final)]);
    if (counts.some((c) => c === null)) {
      return NextResponse.json({ ok: false, error: "A stage query failed to run." }, { status: 200 });
    }

    const stageRows = await Promise.all(
      plan.rowStages.map((s) => (s.sql ? runRows(s.sql, MAX_STAGE_ROWS) : Promise.resolve(null))),
    );
    const outRows = await runRows(plan.finalRowSql, MAX_STAGE_ROWS);
    const gateRows = await Promise.all(
      plan.gates.map(async (g) => ({ kind: g.kind, res: await runRows(g.sql, MAX_DROPPED_ROWS) })),
    );

    const stages = plan.stages.map((s, i) => {
      const rows = stageRows[i];
      const gate =
        s.kind === "where" || s.kind === "having"
          ? gateRows.find((g) => g.kind === s.kind)
          : undefined;
      const prevCount = i > 0 ? counts[i - 1] : null;
      return {
        kind: s.kind,
        count: counts[i],
        columns: rows?.columns ?? null,
        rows: rows?.rows ?? null,
        killed:
          gate && gate.res && prevCount !== null && counts[i] !== null
            ? {
                count: (prevCount ?? 0) - (counts[i] ?? 0),
                columns: gate.res.columns,
                rows: gate.res.rows,
              }
            : null,
      };
    });

    return NextResponse.json({
      ok: true,
      stages,
      out: {
        count: counts[counts.length - 1],
        columns: outRows?.columns ?? null,
        rows: outRows?.rows ?? null,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? cleanError(err.message) : "Unexpected server error" },
      { status: 200 },
    );
  }
}
