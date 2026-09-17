import { NextResponse } from "next/server";
import { runQualityAudit } from "@/lib/quality-audit";
import type { QualityError, QualityResponse } from "@/lib/sql-types";

export async function GET() {
  try {
    const result = await runQualityAudit();
    return NextResponse.json(result satisfies QualityResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ ok: false, error: message } satisfies QualityError, {
      status: 200,
    });
  }
}
