import { DAILY_PUZZLES, puzzleForDate } from "../src/lib/curriculum/daily";
const days = ["2026-09-15","2026-09-16","2026-09-17","2026-09-18","2026-09-19","2026-09-20","2026-09-21","2026-09-22","2026-09-23"];
for (const d of days) console.log(d, "→", puzzleForDate(d).id);
// print a requested day's solution: bunx tsx scripts/today-puzzle.ts 2026-09-17
const want = process.argv[2];
if (want) {
  const p = puzzleForDate(want);
  console.log("---SOLUTION---");
  console.log(p.solution);
}
