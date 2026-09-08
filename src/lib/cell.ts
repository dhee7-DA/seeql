// SQLite value → JSON-safe cell (Prisma returns BigInt for INTEGER on SQLite).
// Shared by /api/query and /api/stages so both endpoints serialize identically.

import type { CellValue } from "@/lib/sql-types";

export function normalizeCell(v: unknown): CellValue {
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
