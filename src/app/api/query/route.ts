import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabase } from "@/lib/sample-db";
import type { CellValue, ExecResponse, ExecResult, PlanRow } from "@/lib/sql-types";

const MAX_SQL_LENGTH = 20_000;
const MAX_ROWS = 1_000;

/** Sentinel thrown inside the sandboxed transaction to force a rollback. */
class SandboxRollback extends Error {
  constructor() { super("__sandbox_rollback__"); }
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

/**
 * Reject multi-statement payloads with a small scanner that understands
 * strings, quoted identifiers and comments.
 */
function hasMultipleStatements(sql: string): boolean {
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let inBracket = false;
  let inLineComment = false;
  let inBlockComment = false;
  let count = 0;
  let seenChar = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inSingle) {
      if (ch === "'") {
        if (next === "'") i++;
        else inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      if (ch === '"') {
        if (next === '"') i++;
        else inDouble = false;
      }
      continue;
    }
    if (inBacktick) {
      if (ch === "`") inBacktick = false;
      continue;
    }
    if (inBracket) {
      if (ch === "]") inBracket = false;
      continue;
    }
    if (ch === "'" && !inDouble) inSingle = true;
    else if (ch === '"' && !inSingle) inDouble = true;
    else if (ch === "`") inBacktick = true;
    else if (ch === "[") inBracket = true;
    else if (ch === "-" && next === "-") inLineComment = true;
    else if (ch === "/" && next === "*") inBlockComment = true;
    else if (ch === ";") {
      if (seenChar) {
        count++;
        seenChar = false;
      }
      continue;
    }
    if (!/\s/.test(ch)) seenChar = true;
  }
  if (seenChar) count++;
  return count > 1;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      sql?: unknown;
      sandbox?: unknown;
      verify?: unknown;
    };
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

    const statementType = (sql.match(/^[a-zA-Z]+/)?.[0] ?? "UNKNOWN").toUpperCase();
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
    let message = err instanceof Error ? err.message : "Unexpected server error";
    // Prisma wraps raw errors in boilerplate — keep just the underlying message
    const m = message.match(/Message: `([^`]+)`/);
    if (m) message = m[1].trim();
    else message = message.replace(/\s*Invalid `prisma\.\$query\w+`\(\) invocation:?\s*/g, "").trim();
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
