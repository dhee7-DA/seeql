// Registry rows — the Data & Finance track (Module 13): ORIGINAL product-
// analytics and finance-domain problems authored for interview prep targeting
// data and finance roles. These are not LeetCode problems — they carry 8xxx
// ids, their own list facet and company tags chosen for the roles that ask
// these shapes. 7-tuple free format; the list starts with "SQL" so the rows
// are flagged into the sandbox-graded band (expand() keys off /^SQL/).
import type { LcRow } from "./row";

export const SQL_DATAFIN: LcRow[] = [
  // PRODUCT ANALYTICS — metrics, funnels, cohorts, sessions, experiments
  [8001, "dau-wau-stickiness", "DAU/WAU Stickiness", 1, "SQL · Trailing window|COUNT DISTINCT", "SQL · Data & Finance", "Meta|Uber"],
  [8002, "growth-accounting", "Growth Accounting", 1, "SQL · LAG status|Pivot", "SQL · Data & Finance", "Duolingo|Spotify"],
  [8003, "funnel-step-conversion", "Funnel Step Conversion", 0, "SQL · Funnel pivot|FIRST_VALUE", "SQL · Data & Finance", "Airbnb|DoorDash"],
  [8004, "cohort-retention-matrix", "Cohort Retention Matrix", 1, "SQL · Cohort offset|Pivot", "SQL · Data & Finance", "Netflix|Chime"],
  [8005, "sessionize-events", "Sessionize Events", 2, "SQL · Gaps & islands|LAG", "SQL · Data & Finance", "LinkedIn|Roblox"],
  [8006, "ab-test-conversion-lift", "A/B Test Conversion Lift", 1, "SQL · Rates|Cross join lift", "SQL · Data & Finance", "Booking|Expedia"],
  // FINANCE CORE — amortization, delinquency, portfolios, settlement, P&L, GL
  [8007, "loan-amortization-schedule", "Loan Amortization Schedule", 1, "SQL · WITH RECURSIVE|Amortization", "SQL · Data & Finance", "SoFi|LendingClub"],
  [8008, "delinquency-buckets", "Delinquency Buckets", 0, "SQL · DPD buckets|CASE", "SQL · Data & Finance", "Capital One|Synchrony"],
  [8009, "portfolio-weights", "Portfolio Weights", 0, "SQL · Window share|Weights", "SQL · Data & Finance", "Vanguard|Fidelity"],
  [8010, "settlement-fails-aging", "Settlement Fails Aging", 1, "SQL · T+2 aging|CASE buckets", "SQL · Data & Finance", "Charles Schwab|Citadel"],
  [8011, "realized-pnl-average-cost", "Realized P&L (Average Cost)", 2, "SQL · Average cost|Window running", "SQL · Data & Finance", "Robinhood|Two Sigma"],
  [8012, "gl-reconciliation", "General-Ledger Reconciliation", 1, "SQL · Reconciliation|Delta", "SQL · Data & Finance", "Stripe|Adyen"],
];
