// LC Daily Challenge — one registry SQL problem per calendar day, chosen
// deterministically so every client agrees on "today's problem" without a
// server: index = (dayNumber * 101) % poolSize. The stride 101 is prime and
// coprime with the current SQL pool size, so consecutive days spread across
// difficulties and topics and the cycle repeats only after the whole pool.
// A VERIFIED sandbox solve of the daily (claims don't count) banks the day
// on the progress store's lcDailyDone ledger and keeps the streak alive;
// the streak walk gives today a grace period — an unsolved today doesn't
// break yesterday's run, it just doesn't extend it.

import { LC_ALL } from "./registry";
import { dayKeyOf } from "@/lib/curriculum/daily";
import type { LcRef } from "./types";

/** Days since the Unix epoch on the LOCAL calendar — matches dayKey(). */
export function lcDayNumber(d = new Date()): number {
  const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor(utc / 86_400_000);
}

const DAILY_STRIDE = 101;

export function lcDailyProblem(dayNum = lcDayNumber()): LcRef {
  const pool = LC_ALL.filter((p) => p.sql);
  return pool[(dayNum * DAILY_STRIDE) % pool.length];
}

export function lcDailySlug(dayNum = lcDayNumber()): string {
  return lcDailyProblem(dayNum).slug;
}

/** Consecutive solved days ending today — or yesterday, if today isn't
 *  banked yet (grace: the run is still alive until a full day passes). */
export function lcDailyStreak(done: Record<string, number>): number {
  const d = new Date();
  if (done[dayKeyOf(d)] === undefined) d.setDate(d.getDate() - 1);
  let n = 0;
  while (done[dayKeyOf(d)] !== undefined) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
