import { puzzleStreak, dayKeyOf } from "../src/lib/curriculum/daily";
const t = new Date(); const k = (off: number) => { const d = new Date(t); d.setDate(d.getDate()+off); return dayKeyOf(d); };
const done = (days: string[]) => Object.fromEntries(days.map(d => [d, 1]));
const cases: Array<[string, unknown, number, number, string[]]> = [
  ["fresh ledger", {}, 1, 0, []],
  ["today only (no phantom pre-history)", done([k(0)]), 1, 1, []],
  ["yesterday only", done([k(-1)]), 1, 1, []],
  ["live run 3d", done([k(-1),k(-2),k(-3)]), 1, 3, []],
  ["run+gap+run, 1 token bridges", done([k(-1),k(-2),k(-4),k(-5)]), 1, 5, [k(-3)]],
  ["run+gap, 0 tokens stops", done([k(-1),k(-2),k(-4)]), 0, 2, []],
  ["leading 4-day pre-history gap, 1 token: no bridge", done([k(-5)]), 1, 0, []],
  ["two gaps, 1 token: only first (cheapest visible) bridged", done([k(-1),k(-3),k(-5)]), 1, 3, [k(-2)]],
  ["2-day gap, 2 tokens bridges both days", done([k(-1),k(-4)]), 2, 4, [k(-2),k(-3)]],
  ["2-day gap, 1 token: can't afford", done([k(-1),k(-4)]), 1, 1, []],
];
let fail = 0;
for (const [name, ledger, tokens, wantStreak, wantFrozen] of cases) {
  const r = puzzleStreak(ledger as Record<string, number>, tokens);
  const ok = r.streak === wantStreak && JSON.stringify(r.frozenDays) === JSON.stringify(wantFrozen);
  if (!ok) fail++;
  console.log(`${ok ? "ok " : "FAIL"} ${name} → streak=${r.streak} frozen=${JSON.stringify(r.frozenDays)} (want ${wantStreak}, ${JSON.stringify(wantFrozen)})`);
}
console.log(fail === 0 ? "ALL STREAK CASES PASS" : `${fail} FAILURES`);
process.exit(fail ? 1 : 0);
