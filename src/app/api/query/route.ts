import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabase } from "@/lib/sample-db";
import { hasMultipleStatements } from "@/lib/sql-statements";
import type { CellValue, ExecResponse, ExecResult, PlanRow } from "@/lib/sql-types";

const MAX_SQL_LENGTH = 20_000;
const MAX_ROWS = 1_000;

/** Sentinel thrown inside the sandboxed transaction to force a rollback. */
class SandboxRollback extends Error {
  constructor() { super("__sandbox_rollback__"); }
}

/** Prisma wraps raw errors in boilerplate — keep just the underlying message. */
function cleanError(raw: string): string {
  const m = raw.match(/Message: `([^`]+)`/);
  if (m) return m[1].trim();
  return raw.replace(/\s*Invalid `prisma\.\$query\w+`\(\) invocation:?\s*/g, "").trim();
}

/** Drop whitespace + comment lines before the first real token. */
function stripLeadingComments(sql: string): string {
  return sql.replace(/^(\s*(?:--[^\n]*\n|\/\*[\s\S]*?\*\/)+\s*)*/, "");
}

/** First keyword of a statement, skipping leading comments. */
function statementTypeOf(sql: string): string {
  return (stripLeadingComments(sql).match(/^[a-zA-Z]+/)?.[0] ?? "UNKNOWN").toUpperCase();
}

/** One statement's outcome inside a batch run (errors don't abort the rest). */
interface BatchItem extends Omit<ExecResult, "ok"> {
  ok: boolean;
  error?: string;
}

interface BatchExecResponse {
  ok: true;
  batch: true;
  results: BatchItem[];
  durationMs: number;
}

/** SQLite value → JSON-safe cell (Prisma returns BigInt for INTEGER on SQLite). */
function normalizeCell(v: unknown): CellValue {
  if (v === null || v === undefined) return null;
  const t = typeof v;
  if (t === "string" || t === "boolean") return v as string | boolean;
  if (t === "number") return v as number;
  if (typeof BigInt !== "undefined" && typeof v === "bigint") {
    return v >= BigInt(Number.MIN_SAFE_INTEGER) && v <= BigInt(Number.MAX_SAFE_INTEGER)
      ? Number(v)
      : v.toString();
  }
  if (v instanceof Date) return v.toISOString();
  if (v instanceof Uint8Array) {
    const hex = Array.from(v.slice(0, 12))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `0x${hex}${v.length > 12 ? "…" : ""} (${v.length} bytes)`;
  }
  if (typeof v === "object" && v !== null) return String(v);
  return String(v);
}

// Statement scanning lives in @/lib/sql-statements — shared with the lesson
// CodeBlock and QA scripts so client splitting and API validation agree.

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      sql?: unknown;
      sqls?: unknown;
      sandbox?: unknown;
      verify?: unknown;
    };

    // Batch mode: run several statements sequentially inside ONE sandboxed
    // transaction (always rolled back) — used by lesson blocks that show a
    // short sequence of queries. Every statement sees the previous ones'
    // effects; nothing persists.
    if (Array.isArray(body.sqls)) {
      const sqls = body.sqls.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
      if (sqls.length === 0) {
        return NextResponse.json({ ok: false, error: "Empty query." } satisfies ExecResponse, { status: 200 });
      }
      if (sqls.length > 12) {
        return NextResponse.json({ ok: false, error: "Too many statements (12 max)." } satisfies ExecResponse, { status: 200 });
      }
      if (sqls.reduce((n, s) => n + s.length, 0) > MAX_SQL_LENGTH) {
        return NextResponse.json({ ok: false, error: "Query too long (20k character limit)." } satisfies ExecResponse, { status: 200 });
      }
      for (const s of sqls) {
        if (hasMultipleStatements(s.trim().replace(/;+\s*$/, ""))) {
          return NextResponse.json(
            { ok: false, error: "Only one statement can be run at a time.", hint: "Remove the extra semicolon-separated statements and run them one by one." } satisfies ExecResponse,
            { status: 200 },
          );
        }
      }
      await ensureDatabase();
      const started = performance.now();
      const results: BatchItem[] = [];
      try {
        await db.$transaction(
          async (tx) => {
            for (const raw of sqls) {
              const sql = raw.trim().replace(/;+\s*$/, "");
              const statementType = statementTypeOf(sql);
              try {
                const before = (await tx.$queryRawUnsafe(`SELECT total_changes() AS c`)) as Array<Record<string, unknown>>;
                const res = (await tx.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
                const after = (await tx.$queryRawUnsafe(`SELECT total_changes() AS c`)) as Array<Record<string, unknown>>;
                const affected = Number(after[0].c) - Number(before[0].c);
                const list = Array.isArray(res) ? res : [];
                const columns = list.length > 0 ? Object.keys(list[0]) : [];
                results.push({
                  ok: true,
                  statementType,
                  columns,
                  rows: list.map((r) => columns.map((c) => normalizeCell(r[c]))).slice(0, MAX_ROWS),
                  rowCount: Math.min(list.length, MAX_ROWS),
                  durationMs: 0,
                  changes: statementType === "SELECT" || statementType === "WITH" ? null : affected,
                  truncated: list.length > MAX_ROWS,
                  plan: null,
                });
              } catch (err) {
                results.push({
                  ok: false,
                  statementType,
                  columns: [],
                  rows: [],
                  rowCount: 0,
                  durationMs: 0,
                  changes: null,
                  truncated: false,
                  plan: null,
                  error: err instanceof Error ? cleanError(err.message) : "Statement failed",
                });
              }
            }
            throw new SandboxRollback();
          },
          { maxWait: 5000, timeout: 20_000 },
        );
      } catch (err) {
        if (!(err instanceof SandboxRollback)) throw err;
      }
      const payload: BatchExecResponse = {
        ok: true,
        batch: true,
        results,
        durationMs: Math.round((performance.now() - started) * 100) / 100,
      };
      return NextResponse.json(payload);
    }

    if (typeof body.sql !== "string" || body.sql.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Empty query." } satisfies ExecResponse, {
        status: 200,
      });
    }
    const sql = body.sql.trim().replace(/;+\s*$/, "");
    const verify =
      typeof body.verify === "string" && body.verify.trim().length > 0
        ? body.verify.trim().replace(/;+\s*$/, "")
        : null;
    const sandbox = body.sandbox === true;
    if (sql.length > MAX_SQL_LENGTH) {
      return NextResponse.json(
        { ok: false, error: "Query too long (20k character limit)." } satisfies ExecResponse,
        { status: 200 },
      );
    }
    if (hasMultipleStatements(sql) || (verify !== null && hasMultipleStatements(verify))) {
      return NextResponse.json(
        {
          ok: false,
          error: "Only one statement can be run at a time.",
          hint: "Remove the extra semicolon-separated statements and run them one by one.",
        } satisfies ExecResponse,
        { status: 200 },
      );
    }

    const statementType = statementTypeOf(sql);
    const isRead = ["SELECT", "WITH", "EXPLAIN", "PRAGMA", "VALUES"].includes(statementType);

    await ensureDatabase();

    const started = performance.now();
    let columns: string[] = [];
    let rows: CellValue[][] = [];
    let changes: number | null = null;

    if (sandbox) {
      // Graded write/DDL runs execute inside a transaction that is ALWAYS
      // rolled back — the storefront stays untouched, but the run is fully
      // real: RETURNING rows, affected-row counts and a follow-up verify
      // SELECT all see the statement's effect.
      let captured: { columns: string[]; rows: CellValue[][]; changes: number } | null = null;
      try {
        await db.$transaction(
          async (tx) => {
            const before = (await tx.$queryRawUnsafe(
              `SELECT total_changes() AS c`,
            )) as Array<Record<string, unknown>>;
            const res = (await tx.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
            const after = (await tx.$queryRawUnsafe(
              `SELECT total_changes() AS c`,
            )) as Array<Record<string, unknown>>;
            const affected = Number(after[0].c) - Number(before[0].c);
            let list = Array.isArray(res) ? res : [];
            if (verify !== null) {
              list = (await tx.$queryRawUnsafe(verify)) as Array<Record<string, unknown>>;
            }
            const cols = list.length > 0 ? Object.keys(list[0]) : [];
            captured = {
              columns: cols,
              rows: list.map((r) => cols.map((c) => normalizeCell(r[c]))),
              changes: affected,
            };
            throw new SandboxRollback();
          },
          { maxWait: 5000, timeout: 10_000 },
        );
      } catch (err) {
        if (!(err instanceof SandboxRollback)) throw err;
      }
      const got = captured ?? { columns: [], rows: [], changes: 0 };
      columns = got.columns;
      rows = got.rows;
      changes = isRead ? null : got.changes;
    } else if (isRead) {
      const raw = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
      const list = Array.isArray(raw) ? raw : [];
      if (list.length > 0) columns = Object.keys(list[0]);
      rows = list.map((r) => columns.map((c) => normalizeCell(r[c])));
    } else {
      changes = await db.$executeRawUnsafe(sql);
    }
    const durationMs = Math.round((performance.now() - started) * 100) / 100;

    const truncated = rows.length > MAX_ROWS;
    if (truncated) rows = rows.slice(0, MAX_ROWS);

    // EXPLAIN QUERY PLAN for read statements — best effort, never fails the run.
    let plan: PlanRow[] | null = null;
    if (!sandbox && ["SELECT", "WITH"].includes(statementType)) {
      try {
        const rawPlan = (await db.$queryRawUnsafe(
          `EXPLAIN QUERY PLAN ${sql}`,
        )) as Array<Record<string, unknown>>;
        plan = rawPlan.map((r) => ({
          id: Number(r.id ?? 0),
          parent: r.parent === null || r.parent === undefined ? null : Number(r.parent),
          detail: String(r.detail ?? ""),
        }));
      } catch {
        plan = null;
      }
    }

    const payload: ExecResult = {
      ok: true,
      statementType,
      columns,
      rows,
      rowCount: rows.length,
      durationMs,
      changes,
      truncated,
      plan,
    };
    return NextResponse.json(payload);
  } catch (err) {
    let message = cleanError(err instanceof Error ? err.message : "Unexpected server error");
    let hint: string | undefined;
    if (/no such table/i.test(message)) {
      hint = "This demo database only has: customers, suppliers, products, orders, order_items. Check the Schema tab, or press Reset database to restore the sample data.";
    } else if (/no such column/i.test(message)) {
      hint = "Check the column names in the Schema tab.";
    } else if (/syntax error/i.test(message)) {
      hint = "SQLite could not parse this statement. Note the demo runs on SQLite, so PostgreSQL/MySQL-only syntax (e.g. DATE_TRUNC, ILIKE) is not available.";
    }
    return NextResponse.json({ ok: false, error: message, hint } satisfies ExecResponse, {
      status: 200,
    });
  }
}
