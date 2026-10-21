import { NextRequest, NextResponse } from "next/server";
import { hasMultipleStatements, splitStatements } from "@/lib/sql-statements";
import { normalizeCell } from "@/lib/cell";
import type { CellValue, ExecResult } from "@/lib/sql-types";
import { lcSqlDive } from "@/lib/leetcode/content/content";

// LeetCode SQL — per-problem sandbox runner (bun:sqlite, in-memory).
//
// Every request builds the problem's schema + seed in a FRESH :memory:
// database and destroys it when the request ends. Consequences:
//   - the storefront db is never touched (no transactions, no renames);
//   - two problems that both define an `Employee` table never collide, and
//     parallel requests cannot collide with each other (the old Prisma
//     sandbox renamed shared tables per request and forced client-side
//     sequencing — that whole class of races is gone);
//   - the engine is the SAME build bun ships everywhere else in this app
//     (scripts, generator), so build-time verification == runtime grading;
//   - bun's SQLite compiles in the math extension: SQRT, CEIL, FLOOR, POWER
//     all exist — the Prisma-bundled SQLite did not (4 problems were
//     unsolvable under it), and foreign keys stay OFF like the generator's,
//     which the dangling-manager problems rely on.
//
//   POST { slug, sql }  → ExecResult-shaped response
//   - write problems (DELETE/UPDATE) run the write, then return the dive's
//     writeVerify SELECT rows alongside the affected-row count.

const MAX_SQL_LENGTH = 20_000;
const MAX_ROWS = 1_000;

type SqliteDatabase = {
  run: (sql: string) => { changes: number; lastInsertRowid: number | bigint };
  prepare: (sql: string) => { all: () => Record<string, unknown>[] };
  close: () => void;
};

// `bun:sqlite` resolved at runtime via an indirect import — hidden from the
// Next bundler (webpack/turbopack would try to resolve the module at build
// time; under `bun .next/standalone/server.js` it is a runtime builtin).
type DatabaseCtor = new (path: string) => SqliteDatabase;
let Database: DatabaseCtor | null = null;
async function openSandbox(): Promise<SqliteDatabase> {
  if (Database === null) {
    const mod = (await new Function("return import('bun:sqlite')")()) as { Database: DatabaseCtor };
    Database = mod.Database;
  }
  return new Database(":memory:");
}

const READ_TYPES = ["SELECT", "WITH", "EXPLAIN", "PRAGMA", "VALUES"];

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

    const started = performance.now();
    const db = await openSandbox();
    let captured: { columns: string[]; rows: CellValue[][]; changes: number } | null = null;
    let userError: string | null = null;

    try {
      // build the problem's world — exact table names, fresh every run
      for (const stmt of splitStatements(dive.schema.ddl)) db.run(stmt);
      for (const stmt of splitStatements(dive.schema.seed)) db.run(stmt);

      const statementType = (sql.match(/^[a-zA-Z]+/)?.[0] ?? "").toUpperCase();
      const isWrite = !READ_TYPES.includes(statementType);

      if (isWrite) {
        const res = db.run(sql);
        // write problems surface the post-write table state for grading
        const verify = dive.writeVerify?.replace(/;+\s*$/, "") ?? null;
        const list = verify !== null ? db.prepare(verify).all() : [];
        const columns = list.length > 0 ? Object.keys(list[0]) : [];
        captured = {
          columns,
          rows: list.slice(0, MAX_ROWS).map((r) => columns.map((c) => normalizeCell(r[c]))),
          changes: res.changes,
        };
      } else {
        const list = db.prepare(sql).all();
        const columns = list.length > 0 ? Object.keys(list[0]) : [];
        captured = {
          columns,
          rows: list.slice(0, MAX_ROWS).map((r) => columns.map((c) => normalizeCell(r[c]))),
          changes: 0,
        };
      }
    } catch (err) {
      userError = err instanceof Error ? err.message : "Statement failed";
    } finally {
      db.close();
    }

    if (userError !== null) {
      return NextResponse.json({ ok: false, error: userError }, { status: 200 });
    }

    const got = captured ?? { columns: [], rows: [], changes: 0 };
    const statementType = (sql.match(/^[a-zA-Z]+/)?.[0] ?? "").toUpperCase();
    const isWrite = !READ_TYPES.includes(statementType);
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
