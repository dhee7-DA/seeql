import { NextRequest, NextResponse } from "next/server";
import { runFunnel } from "@/lib/sql-funnel";
import { SUPPORTED_DIALECTS, type Dialect } from "@/lib/sql-parser";
import type { FunnelResponse } from "@/lib/sql-types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { sql?: unknown; dialect?: unknown };
    const sql = typeof body.sql === "string" ? body.sql : "";
    const dialect = (SUPPORTED_DIALECTS as readonly string[]).includes(
      typeof body.dialect === "string" ? body.dialect : "",
    )
      ? (body.dialect as Dialect)
      : "sqlite";

    const result = await runFunnel(sql, dialect);
    return NextResponse.json(result satisfies FunnelResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ ok: false, error: message } satisfies FunnelResponse, {
      status: 200,
    });
  }
}
