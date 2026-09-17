import { NextResponse } from "next/server";
import { LANDING_PUZZLES } from "@/lib/landing-puzzles";

// Public puzzle list for the landing sandbox's "fix the query" strip.
// Deliberately omits `reference` (the correct SQL) and `lesson` (revealed
// only via a solved verdict) — the client bundle never holds the answers.
// Verification rides the /api/landing-sandbox POST via `puzzleId`.

export async function GET() {
  return NextResponse.json({
    puzzles: LANDING_PUZZLES.map((p) => ({
      id: p.id,
      emoji: p.emoji,
      title: p.title,
      question: p.question,
      broken: p.broken,
      hints: p.hints,
    })),
  });
}
