import { NextRequest, NextResponse } from "next/server";
import { buildQueryPlan, SUPPORTED_DIALECTS, type Dialect } from "@/lib/sql-parser";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { sql?: unknown; dialect?: unknown };
    const sql = typeof body.sql === "string" ? body.sql : "";
    const dialect = (SUPPORTED_DIALECTS as readonly string[]).includes(
      typeof body.dialect === "string" ? body.dialect : "",
    )
      ? (body.dialect as Dialect)
      : "postgresql";

    const result = buildQueryPlan(sql, dialect);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
