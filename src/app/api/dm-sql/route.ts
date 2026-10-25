import { NextRequest, NextResponse } from "next/server";
import { hasMultipleStatements, splitStatements } from "@/lib/sql-statements";
import { normalizeCell } from "@/lib/cell";
import type { CellValue, ExecResult } from "@/lib/sql-types";
import { dmPack } from "@/lib/leetcode/domain-packs";

// Domain Mastery — pack sandbox runner (bun:sqlite, in-memory).
// Same engine contract as /api/lc-sql, but the schema+seed come from the
// pack itself (ONE shared world per domain) instead of a problem registry.
//
//   POST { pack, sql }  → ExecResult-shaped response
// Every request builds the pack's schema + seed in a FRESH :memory: database
// and destroys it when the request ends — no cross-request state.

const MAX_SQL_LENGTH = 20_000;
const MAX_ROWS = 1_000;

type SqliteDatabase = {
  run: (sql: string) => { changes: number; lastInsertRowid: number | bigint };
  prepare: (sql: string) => { all: () => Record<string, unknown>[] };
  close: () => void;
};

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
    const body = (await req.json()) as { pack?: unknown; sql?: unknown };
    if (typeof body.pack !== "string" || typeof body.sql !== "string" || body.sql.trim() === "") {
      return NextResponse.json({ ok: false, error: "Missing pack id or query." }, { status: 200 });
    }
    const pack = dmPack(body.pack);
    if (!pack) {
      return NextResponse.json({ ok: false, error: "No domain pack with that id." }, { status: 200 });
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
          hint: "Domain problems are single statements — a CTE (WITH …) counts as one.",
        },
        { status: 200 },
      );
    }

    const started = performance.now();
    const db = await openSandbox();
    let captured: { columns: string[]; rows: CellValue[][]; changes: number } | null = null;
    let userError: string | null = null;

    try {
      for (const stmt of splitStatements(pack.schema.ddl)) db.run(stmt);
      for (const stmt of splitStatements(pack.schema.seed)) db.run(stmt);

      const statementType = (sql.match(/^[a-zA-Z]+/)?.[0] ?? "").toUpperCase();
      const isWrite = !READ_TYPES.includes(statementType);
      if (isWrite) {
        return NextResponse.json(
          { ok: false, error: "Domain pack problems are read-only — run a SELECT (or WITH … SELECT)." },
          { status: 200 },
        );
      }

      const list = db.prepare(sql).all();
      const columns = list.length > 0 ? Object.keys(list[0]) : [];
      captured = {
        columns,
        rows: list.slice(0, MAX_ROWS).map((r) => columns.map((c) => normalizeCell(r[c]))),
        changes: 0,
      };
    } catch (err) {
      userError = err instanceof Error ? err.message : "Statement failed";
    } finally {
      db.close();
    }

    if (userError !== null) {
      return NextResponse.json({ ok: false, error: userError }, { status: 200 });
    }

    const got = captured ?? { columns: [], rows: [], changes: 0 };
    const payload: ExecResult = {
      ok: true,
      statementType: "SELECT",
      columns: got.columns,
      rows: got.rows,
      rowCount: got.rows.length,
      durationMs: Math.round((performance.now() - started) * 100) / 100,
      changes: null,
      truncated: false,
      plan: null,
    };
    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error("[dm-sql] unexpected error:", err);
    return NextResponse.json({ ok: false, error: "Sandbox failure." }, { status: 200 });
  }
}
