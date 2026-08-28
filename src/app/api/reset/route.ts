import { NextResponse } from "next/server";
import { resetDatabase } from "@/lib/sample-db";

export async function POST() {
  try {
    const counts = await resetDatabase();
    return NextResponse.json({ ok: true, counts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
