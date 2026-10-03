import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabase } from "@/lib/sample-db";
import { hasMultipleStatements, splitStatements } from "@/lib/sql-statements";
import { normalizeCell } from "@/lib/cell";
import type { CellValue, ExecResult } from "@/lib/sql-types";
import { lcSqlDive } from "@/lib/leetcode/content/content";

// LeetCode SQL 50 — per-problem sandbox runner.
//
// Every request gets the problem's own schema (exact LeetCode-style table
// names) created + seeded inside a transaction that is ALWAYS rolled back:
// the storefront db is untouched, the problem's tables are pristine on each
// run, and two problems that both define an `Employee` table never collide.
//
//   POST { slug, sql }  → ExecResult-shaped response
//   - write problems (DELETE/UPDATE) run the write, then return the dive's
//     writeVerify SELECT rows alongside the affected-row count.

const MAX_SQL_LENGTH = 20_000;
const MAX_ROWS = 1_000;

class SandboxRollback extends Error {
  constructor() {
    super("__sandbox_rollback__");
  }
}

/** Prisma wraps raw errors in boilerplate — keep the underlying message. */
function cleanError(raw: string): string {
  const m = raw.match(/Message: `([^`]+)`/);
  if (m) return m[1].trim();
  return raw.replace(/\s*Invalid `prisma\.\$query\w+`\(\) invocation:?\s*/g, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { slug?: unknown; sql?: unknown };
    if (typeof body.slug !== "string" || typeof body.sql !== "string" || body.sql.trim() === "") {
      return NextResponse.json({ ok: false, error: "Missing problem slug or query." }, { status: 200 });
    }
    const dive = lcSqlDive(body.slug);
    if (!dive) {
      return NextResponse.json({ ok: false, error: "No SQL deep-dive for that problem." }, { status: 200 });
    }
    const sql = body.sql.trim().replace(/;+\s*$/, "");
    if (sql.length > MAX_SQL_LENGTH) {
      return NextResponse.json({ ok: false, error: "Query too long (20k character limit)." }, { status: 200 });
    }
    if (hasMultipleStatements(sql)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Only one statement can be run at a time.",
          hint: "LeetCode SQL problems are single statements — a CTE (WITH …) counts as one.",
        },
        { status: 200 },
      );
    }

    await ensureDatabase();

    const started = performance.now();
    let captured: { columns: string[]; rows: CellValue[][]; changes: number } | null = null;
    let userError: string | null = null;

    try {
      await db.$transaction(
        async (tx) => {
          // build the problem's world — exact table names, fresh every run
          for (const stmt of splitStatements(dive.schema.ddl)) await tx.$executeRawUnsafe(stmt);
          for (const stmt of splitStatements(dive.schema.seed)) await tx.$executeRawUnsafe(stmt);

          const before = (await tx.$queryRawUnsafe(`SELECT total_changes() AS c`)) as Array<Record<string, unknown>>;
          const res = (await tx.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
          const after = (await tx.$queryRawUnsafe(`SELECT total_changes() AS c`)) as Array<Record<string, unknown>>;
          const affected = Number(after[0].c) - Number(before[0].c);

          // write problems surface the post-write table state for grading
          const verify = dive.writeVerify?.replace(/;+\s*$/, "") ?? null;
          const list = (verify !== null
            ? (await tx.$queryRawUnsafe(verify))
            : Array.isArray(res)
              ? res
              : []) as Array<Record<string, unknown>>;

          const columns = list.length > 0 ? Object.keys(list[0]) : [];
          captured = {
            columns,
            rows: list.slice(0, MAX_ROWS).map((r) => columns.map((c) => normalizeCell(r[c]))),
            changes: affected,
          };
          throw new SandboxRollback();
        },
        { maxWait: 5000, timeout: 15_000 },
      );
    } catch (err) {
      if (err instanceof SandboxRollback) {
        // expected — the transaction is always rolled back
      } else if (err instanceof Error && err.message === "Query failed") {
        userError = "Statement failed";
      } else {
        // user statement (or a schema bug) blew up the transaction
        userError = err instanceof Error ? cleanError(err.message) : "Statement failed";
      }
    }

    if (userError !== null) {
      return NextResponse.json({ ok: false, error: userError }, { status: 200 });
    }

    const got = captured ?? { columns: [], rows: [], changes: 0 };
    const statementType = (sql.match(/^[a-zA-Z]+/)?.[0] ?? "").toUpperCase();
    const isWrite = !["SELECT", "WITH", "EXPLAIN", "PRAGMA", "VALUES"].includes(statementType);
    const payload: ExecResult = {
      ok: true,
      statementType,
      columns: got.columns,
      rows: got.rows,
      rowCount: got.rows.length,
      durationMs: Math.round((performance.now() - started) * 100) / 100,
      changes: isWrite ? got.changes : null,
      truncated: false,
      plan: null,
    };
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not run the query" },
      { status: 200 },
    );
  }
}
