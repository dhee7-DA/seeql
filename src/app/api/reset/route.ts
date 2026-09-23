import { NextResponse } from "next/server";
import { resetDatabase } from "@/lib/sample-db";
import { resetWorlds } from "@/lib/worlds";

export async function POST() {
  try {
    const storefront = await resetDatabase();
    const worlds = await resetWorlds();
    return NextResponse.json({ ok: true, counts: { ...storefront, ...worlds } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
