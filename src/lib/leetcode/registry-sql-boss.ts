// Registry rows — the BOSS LEVEL band (Module 12's endgame wall): six
// ORIGINAL hard problems authored for this app that stack the whole course —
// sweep-line concurrency, median emulation, streak islands, recursive chains
// with a cycle guard, two-sided reconciliation and a cohort grid. 9xxx ids
// (original content, same convention as the Data & Finance track), 7-tuple
// free format; the list starts with "SQL" so the rows are flagged into the
// sandbox-graded band (expand() keys off /^SQL/).
import type { LcRow } from "./row";

export const SQL_BOSS: LcRow[] = [
  [9001, "peak-concurrent-attendance", "Peak Concurrent Attendance", 1, "SQL · Sweep-line|Running sum", "SQL · Boss Level", "Meta|Amazon|Uber"],
  [9002, "median-order-value-by-region", "Median Order Value by Region", 2, "SQL · Median emulation|Two middles", "SQL · Boss Level", "Amazon|Walmart"],
  [9003, "streak-week-bonus-ladder", "Streak Week Bonus Ladder", 2, "SQL · Islands|Week spine", "SQL · Boss Level", "Duolingo|Robinhood"],
  [9004, "approval-chain-audit", "Approval Chain Audit", 2, "SQL · WITH RECURSIVE|Cycle cap", "SQL · Boss Level", "Atlassian|Workday"],
  [9005, "summary-drift-audit", "Summary Drift Audit", 2, "SQL · Full outer emulation|Reconciliation", "SQL · Boss Level", "Stripe|Deloitte"],
  [9006, "cohort-week-retention-grid", "Cohort Week Retention Grid", 2, "SQL · Cohort weeks|Pivot", "SQL · Boss Level", "Netflix|Duolingo"],
];
