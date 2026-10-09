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
  // GROWTH & EXPERIMENTS — churn, conversion latency, rolling actives, tiers, SRM, adoption
  [8013, "week-over-week-churn", "Week-over-Week Churn", 1, "SQL · LAG churn|Weekly pivot", "SQL · Data & Finance", "Duolingo|Netflix"],
  [8014, "median-time-to-convert", "Median Time to Convert", 2, "SQL · Median emulation|Cohort", "SQL · Data & Finance", "Airbnb|Spotify"],
  [8015, "rolling-7d-actives", "Rolling 7-Day Actives", 1, "SQL · Rolling distinct|Self join", "SQL · Data & Finance", "Uber|Lyft"],
  [8016, "usage-tier-percentiles", "Usage Tier Percentiles", 1, "SQL · PERCENT_RANK tiers|CASE", "SQL · Data & Finance", "Twitch|Duolingo"],
  [8017, "ab-sample-ratio-mismatch", "A/B Sample Ratio Mismatch", 1, "SQL · Ratio check|Conditional agg", "SQL · Data & Finance", "Booking|Meta"],
  [8018, "feature-adoption-windows", "Feature Adoption Windows", 2, "SQL · Adoption windows|Conditional AVG", "SQL · Data & Finance", "Slack|Notion"],
  // MARKETS & RISK — FX, concentration, accrual, income calendar, drawdown, fraud pairs
  [8019, "fx-exposure-report", "FX Exposure Report", 1, "SQL · Latest-rate join|FX normalize", "SQL · Data & Finance", "Revolut|Wise"],
  [8020, "portfolio-concentration-hhi", "Portfolio Concentration (HHI)", 1, "SQL · Window share|HHI", "SQL · Data & Finance", "BlackRock|Vanguard"],
  [8021, "daily-balance-interest", "Daily Balance Interest Accrual", 2, "SQL · Date spine|Running balance", "SQL · Data & Finance", "Chime|SoFi"],
  [8022, "dividend-income-calendar", "Dividend Income Calendar", 1, "SQL · Income calendar|Ex-date gate", "SQL · Data & Finance", "Fidelity|Charles Schwab"],
  [8023, "max-drawdown", "Max Drawdown", 2, "SQL · Running max|Argmax", "SQL · Data & Finance", "Two Sigma|Citadel"],
  [8024, "duplicate-charge-pairs", "Duplicate Charge Pairs", 1, "SQL · Self-join window|Fraud pairs", "SQL · Data & Finance", "Stripe|PayPal"],
];
