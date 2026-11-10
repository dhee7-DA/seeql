import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import { resolveDbFilePath } from "@/lib/db";
import { ensureDatabase } from "@/lib/sample-db";
import { hasMultipleStatements } from "@/lib/sql-statements";

export const dynamic = "force-dynamic";

const ALLOWED_DUCKDB_TYPES = new Set(["SELECT", "WITH", "EXPLAIN", "DESCRIBE", "SHOW", "SUMMARIZE", "VALUES"]);
const MAX_SQL_LENGTH = 20_000;

function firstKeywordOf(sql: string): string {
  const stripped = sql.replace(/^(\s*(?:--[^\n]*\n|\/\*[\s\S]*?\*\/)+\s*)*/, "");
  return (stripped.match(/^[a-zA-Z]+/)?.[0] ?? "UNKNOWN").toUpperCase();
}

// Singleton DuckDB connection with attached read-only SQLite storefront
let duckConn: any = null;

async function getDuckConn(): Promise<any> {
  if (duckConn) {
    return duckConn;
  }

  await ensureDatabase();

  // Dynamically load duckdb so build-time static analyzers skip binary inspection
  // @ts-ignore
  const duckdbMod = await import("duckdb");
  const duckdb = duckdbMod.default || duckdbMod;

  const dbPath = resolveDbFilePath();
  const normalizedDbPath = dbPath.replace(/\\/g, "/");

  const instance = new duckdb.Database(":memory:");
  const conn = instance.connect();

  await new Promise((resolve, reject) => {
    conn.exec(
      `
      INSTALL sqlite;
      LOAD sqlite;
      ATTACH '${normalizedDbPath}' AS store (TYPE SQLITE, READ_ONLY);
      USE store;
      SET enable_external_access = false;
      SET memory_limit = '96MB';
      `,
      (err: any) => {
        if (err) return reject(err);
        resolve(true);
      }
    );
  });

  duckConn = conn;
  return duckConn;
}

function normalizeVal(val: unknown): unknown {
  if (typeof val === "bigint") return Number(val);
  if (val instanceof Date) return val.toISOString();
  return val;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      sql?: string;
      compareWithSqlite?: boolean;
    };

    const rawSql = body.sql?.trim();
    if (!rawSql) {
      return NextResponse.json({ ok: false, error: "Empty SQL query." }, { status: 400 });
    }
    if (rawSql.length > MAX_SQL_LENGTH) {
      return NextResponse.json({ ok: false, error: "Query too long (20k character limit)." }, { status: 400 });
    }

    const sql = rawSql.replace(/;+\s*$/, "");
    if (hasMultipleStatements(sql)) {
      return NextResponse.json(
        { ok: false, error: "Only one analytical query can be run at a time." },
        { status: 400 }
      );
    }

    const kw = firstKeywordOf(sql);
    if (!ALLOWED_DUCKDB_TYPES.has(kw)) {
      return NextResponse.json(
        { ok: false, error: `DuckDB OLAP Lab is read-only. Statement type '${kw}' is not permitted.` },
        { status: 403 }
      );
    }

    const conn = await getDuckConn();

    // 1. Run in DuckDB
    const t0 = performance.now();
    const rows = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
      conn.all(sql, (err: any, res: any) => {
        if (err) return reject(err);
        resolve(res as Record<string, unknown>[]);
      });
    });
    const duckDurationMs = Math.round((performance.now() - t0) * 100) / 100;

    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    const matrix = rows.slice(0, 1000).map((r) => columns.map((c) => normalizeVal(r[c])));

    // 2. Fetch DuckDB physical execution plan
    let duckPlan = "";
    try {
      const planRows = await new Promise<any[]>((resolve) => {
        conn.all(`EXPLAIN ${sql}`, (err: any, res: any) => {
          if (err) return resolve([]);
          resolve(res || []);
        });
      });
      if (planRows.length > 0) {
        const row = planRows[0];
        duckPlan = row.explain_value || row["QUERY PLAN"] || Object.values(row)[0] || "";
      }
    } catch {
      // EXPLAIN optional fallback
    }

    // 3. Optional head-to-head comparison with SQLite
    let comparison: Record<string, unknown> | null = null;
    if (body.compareWithSqlite) {
      try {
        const sqlitePath = resolveDbFilePath();
        if (fs.existsSync(sqlitePath)) {
          // Dynamically load bun:sqlite if available in runtime environment
          // @ts-ignore
          const sqliteModule = await import("bun:sqlite" as string).catch(() => null);
          if (sqliteModule && sqliteModule.Database) {
            const sqliteDb = new sqliteModule.Database(sqlitePath, { readonly: true });
            const sq0 = performance.now();
            sqliteDb.prepare(sql).all();
            const sqliteDurationMs = Math.round((performance.now() - sq0) * 100) / 100;
            sqliteDb.close();

            const ratio =
              duckDurationMs > 0 ? (sqliteDurationMs / duckDurationMs).toFixed(1) + "x" : "1.0x";

            comparison = {
              sqliteDurationMs,
              duckDurationMs,
              speedup: ratio,
              duckEngine: "DuckDB Vectorized Columnar SIMD",
              sqliteEngine: "SQLite B-Tree Row-by-Row",
            };
          }
        }
      } catch (sqErr) {
        comparison = {
          sqliteError: sqErr instanceof Error ? sqErr.message : "SQLite comparison unavailable",
          duckDurationMs,
        };
      }
    }

    return NextResponse.json({
      ok: true,
      engine: "duckdb",
      columns,
      rows: matrix,
      rowCount: rows.length,
      durationMs: duckDurationMs,
      duckPlan,
      comparison,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
