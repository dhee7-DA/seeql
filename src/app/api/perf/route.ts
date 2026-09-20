import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabase } from "@/lib/sample-db";
import { hasMultipleStatements } from "@/lib/sql-statements";
import { normalizeCell } from "@/lib/cell";
import type { CellValue, PlanRow } from "@/lib/sql-types";

// Performance lab — EXPLAIN QUERY PLAN with index simulation.
//
// The whole experiment runs inside ONE SQLite transaction that is ALWAYS
// rolled back:
//   1. drop any secondary indexes the playground may have left behind, so the
//      "before" plan is a pristine no-index baseline (the DROP rolls back too)
//   2. EXPLAIN QUERY PLAN the target query        -> before
//   3. CREATE INDEX each learner index            (real DDL, same connection)
//   4. EXPLAIN QUERY PLAN the target query again  -> after — the engine sees
//      its own transaction's uncommitted indexes, so no residue is needed
//   5. run the target query -> rows preview, proving "same rows, new path"
//   6. ROLLBACK — the storefront database is left exactly as it was.
//
// This mirrors the write-case sandbox: fully real execution, zero side
// effects, safe to replay as often as the learner wants.

const MAX_TARGET_LENGTH = 4_000;
const MAX_INDEXES = 3;
const MAX_INDEX_LENGTH = 500;
const MAX_PREVIEW_ROWS = 20;

/** Sentinel thrown inside the transaction to force the rollback. */
class PerfRollback extends Error {
  constructor() { super("__perf_rollback__"); }
}

/** Carries which CREATE INDEX failed so the UI can highlight that row. */
class PerfIndexError extends Error {
  indexSql: string;
  constructor(message: string, indexSql: string) {
    super(message);
    this.indexSql = indexSql;
  }
}

function cleanError(raw: string): string {
  const m = raw.match(/Message: `([^`]+)`/);
  if (m) return m[1].trim();
  return raw.replace(/\s*Invalid `prisma\.\$\w+`\(\) invocation:?\s*/g, "").trim();
}

function stripLeadingComments(sql: string): string {
  return sql.replace(/^(\s*(?:--[^\n]*\n|\/\*[\s\S]*?\*\/)+\s*)*/, "");
}

function statementTypeOf(sql: string): string {
  return (stripLeadingComments(sql).match(/^[a-zA-Z]+/)?.[0] ?? "UNKNOWN").toUpperCase();
}

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

async function explainPlan(tx: Tx, sql: string): Promise<PlanRow[]> {
  const raw = (await tx.$queryRawUnsafe(`EXPLAIN QUERY PLAN ${sql}`)) as Array<Record<string, unknown>>;
  return raw.map((r) => ({
    id: Number(r.id ?? 0),
    parent: r.parent === null || r.parent === undefined ? null : Number(r.parent),
    detail: String(r.detail ?? ""),
  }));
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      sql?: unknown;
      indexes?: unknown;
    };

    if (typeof body.sql !== "string" || body.sql.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Empty query — give the lab a SELECT to plan." }, { status: 200 });
    }
    const sql = body.sql.trim().replace(/;+\s*$/, "");
    if (sql.length > MAX_TARGET_LENGTH) {
      return NextResponse.json({ ok: false, error: `Target query too long (${MAX_TARGET_LENGTH} character limit).` }, { status: 200 });
    }
    if (hasMultipleStatements(sql)) {
      return NextResponse.json({ ok: false, error: "One statement at a time — the lab plans a single SELECT." }, { status: 200 });
    }
    const targetType = statementTypeOf(sql);
    if (!["SELECT", "WITH"].includes(targetType)) {
      return NextResponse.json(
        { ok: false, error: `The lab plans read queries — got ${targetType}. Give it a SELECT or WITH.` },
        { status: 200 },
      );
    }

    const indexes: string[] = [];
    if (body.indexes !== undefined && body.indexes !== null) {
      if (!Array.isArray(body.indexes)) {
        return NextResponse.json({ ok: false, error: "indexes must be an array of CREATE INDEX statements." }, { status: 200 });
      }
      for (const item of body.indexes) {
        if (typeof item !== "string" || item.trim().length === 0) {
          return NextResponse.json({ ok: false, error: "Empty index statement." }, { status: 200 });
        }
        const idx = item.trim().replace(/;+\s*$/, "");
        if (idx.length > MAX_INDEX_LENGTH) {
          return NextResponse.json({ ok: false, error: `Index statement too long (${MAX_INDEX_LENGTH} character limit).` }, { status: 200 });
        }
        if (hasMultipleStatements(idx)) {
          return NextResponse.json({ ok: false, error: "One CREATE INDEX per box — split them into separate rows." }, { status: 200 });
        }
        if (!/^CREATE\s+(UNIQUE\s+)?INDEX\b/i.test(stripLeadingComments(idx))) {
          return NextResponse.json(
            { ok: false, error: "Only CREATE INDEX (or CREATE UNIQUE INDEX) statements run here.", indexSql: idx },
            { status: 200 },
          );
        }
        indexes.push(idx);
      }
      if (indexes.length > MAX_INDEXES) {
        return NextResponse.json(
          { ok: false, error: "Three indexes max per experiment — the planner gets hard to read past that." },
          { status: 200 },
        );
      }
    }

    await ensureDatabase();

    const started = performance.now();
    let captured: {
      before: PlanRow[];
      after: PlanRow[] | null;
      columns: string[];
      rows: CellValue[][];
      rowCount: number;
    } | null = null;

    try {
      await db.$transaction(
        async (tx) => {
          // Pristine baseline: drop secondary indexes left by playground writes.
          const existing = (await tx.$queryRawUnsafe(
            `SELECT name FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL`,
          )) as Array<Record<string, unknown>>;
          for (const row of existing) {
            const name = String(row.name ?? "");
            if (name) await tx.$executeRawUnsafe(`DROP INDEX IF EXISTS "${name.replace(/"/g, '""')}"`);
          }

          const before = await explainPlan(tx, sql);

          if (indexes.length > 0) {
            for (const idx of indexes) {
              try {
                await tx.$executeRawUnsafe(idx);
              } catch (err) {
                const msg = err instanceof Error ? cleanError(err.message) : "CREATE INDEX failed";
                throw new PerfIndexError(msg, idx);
              }
            }
          }

          const after = indexes.length > 0 ? await explainPlan(tx, sql) : null;

          const res = (await tx.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
          const list = Array.isArray(res) ? res : [];
          const cols = list.length > 0 ? Object.keys(list[0]) : [];

          captured = {
            before,
            after,
            columns: cols,
            rows: list.slice(0, MAX_PREVIEW_ROWS).map((r) => cols.map((c) => normalizeCell(r[c]))),
            rowCount: list.length,
          };
          throw new PerfRollback();
        },
        { maxWait: 5000, timeout: 15_000 },
      );
    } catch (err) {
      if (err instanceof PerfIndexError) {
        return NextResponse.json({ ok: false, error: err.message, indexSql: err.indexSql }, { status: 200 });
      }
      if (!(err instanceof PerfRollback)) {
        const message = err instanceof Error ? cleanError(err.message) : "Unexpected server error";
        let hint: string | undefined;
        if (/no such table/i.test(message)) {
          hint = "The storefront has: customers, suppliers, products, orders, order_items, invoices, payments, expenses, ledger_entries.";
        } else if (/no such column/i.test(message)) {
          hint = "Check the column names — the Schema studio shows every table's columns.";
        } else if (/syntax error/i.test(message)) {
          hint = "SQLite could not parse this. The lab runs on real SQLite.";
        }
        return NextResponse.json({ ok: false, error: message, hint }, { status: 200 });
      }
    }

    const got = captured ?? { before: [], after: null, columns: [], rows: [], rowCount: 0 };
    return NextResponse.json({
      ok: true,
      before: got.before,
      after: got.after,
      columns: got.columns,
      rows: got.rows,
      rowCount: got.rowCount,
      durationMs: Math.round((performance.now() - started) * 100) / 100,
    });
  } catch (err) {
    const message = err instanceof Error ? cleanError(err.message) : "Unexpected server error";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
