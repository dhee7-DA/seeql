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
  // BANKING & CREDIT RISK — vintages, roll rates, utilization, ECL, pricing, prepayment
  [8025, "vintage-default-curves", "Vintage Default Curves", 1, "SQL · Vintage cohorts|Window cumsum", "SQL · Data & Finance", "Capital One|SoFi"],
  [8026, "delinquency-roll-rates", "Delinquency Roll Rates", 2, "SQL · State migration|Self join", "SQL · Data & Finance", "Synchrony|Affirm"],
  [8027, "credit-utilization-bands", "Credit Utilization Bands", 0, "SQL · Latest row|Ratio bands", "SQL · Data & Finance", "Chime|Upgrade"],
  [8028, "expected-credit-loss", "Expected Credit Loss", 1, "SQL · Weighted provision|ECL", "SQL · Data & Finance", "Wells Fargo|HSBC"],
  [8029, "risk-based-pricing", "Risk-Based Pricing", 1, "SQL · Band join|COALESCE override", "SQL · Data & Finance", "SoFi|LendingClub"],
  [8030, "prepayment-detection", "Prepayment Savings", 2, "SQL · Recursive schedule|Prepayment", "SQL · Data & Finance", "Rocket|Better"],
  // FRAUD & AML — structuring, velocity, round trips, z-scores, disputes, dormancy
  [8031, "structuring-detection", "Structuring Detection", 1, "SQL · HAVING guard|CTR wall", "SQL · Data & Finance", "JPMorgan Chase|HSBC"],
  [8032, "transaction-velocity", "Transaction Velocity Bursts", 2, "SQL · Time buckets|Velocity", "SQL · Data & Finance", "Stripe|Adyen"],
  [8033, "circular-transfers", "Circular Transfer Pairs", 1, "SQL · Mutual pairs|Epoch window", "SQL · Data & Finance", "Revolut|Wise"],
  [8034, "amount-anomaly-zscore", "Amount Anomaly Z-Scores", 2, "SQL · Z-score|Baseline sigma", "SQL · Data & Finance", "Mastercard|PayPal"],
  [8035, "chargeback-rate-ranking", "Chargeback Rate Ranking", 0, "SQL · Rate HAVING|Ranking", "SQL · Data & Finance", "Adyen|Block"],
  [8036, "dormant-reactivation", "Dormant Reactivation Risk", 1, "SQL · NOT EXISTS|Dormancy", "SQL · Data & Finance", "Revolut|Monzo"],
  // ACCOUNTING & CLOSE — trial balance, aging, rollforward, FIFO, deferred revenue, gaps
  [8037, "trial-balance-check", "Trial Balance Check", 0, "SQL · Conditional SUM|Debits credits", "SQL · Data & Finance", "Intuit|NetSuite"],
  [8038, "ar-aging-schedule", "AR Aging Schedule", 1, "SQL · Aging pivot|CASE buckets", "SQL · Data & Finance", "Intuit|SAP"],
  [8039, "balance-rollforward", "Balance Rollforward", 1, "SQL · Rollforward|LEFT JOIN carry", "SQL · Data & Finance", "PwC|Deloitte"],
  [8040, "fifo-inventory-cogs", "FIFO Inventory COGS", 2, "SQL · Layer consumption|Cross join clamp", "SQL · Data & Finance", "Walmart|Costco"],
  [8041, "deferred-revenue", "Deferred Revenue Recognition", 1, "SQL · Recursive spine|Revenue spread", "SQL · Data & Finance", "Salesforce|Atlassian"],
  [8042, "journal-gap-detection", "Journal Gap Detection", 1, "SQL · Gaps|WITH RECURSIVE", "SQL · Data & Finance", "SAP|Oracle"],
  // QUANT DESK — TWR, Sharpe, VaR, beta, splits, wash trades
  [8043, "time-weighted-return", "Time-Weighted Return", 2, "SQL · Sub-period chain|Flow break", "SQL · Data & Finance", "BlackRock|Fidelity"],
  [8044, "sharpe-ratio", "Sharpe Ratio", 1, "SQL · Population sigma|Sharpe", "SQL · Data & Finance", "Two Sigma|Man Group"],
  [8045, "value-at-risk", "Value at Risk (VaR 95)", 1, "SQL · Percentile rank|VaR", "SQL · Data & Finance", "Goldman Sachs|Morgan Stanley"],
  [8046, "beta-benchmark", "Beta vs Benchmark", 2, "SQL · Covariance ratio|Beta", "SQL · Data & Finance", "Citadel|Point72"],
  [8047, "split-adjusted-position", "Split-Adjusted Position", 1, "SQL · Ratio adjust|Position rebuild", "SQL · Data & Finance", "Robinhood|Interactive Brokers"],
  [8048, "wash-trade-detection", "Wash Trade Pairs", 1, "SQL · Pair window|Surveillance", "SQL · Data & Finance", "Nasdaq|CME Group"],
  // SAAS & SUBSCRIPTIONS — trial funnel, migrations, MRR waterfall, NRR, unit economics, winback
  [8049, "trial-to-paid-funnel", "Trial-to-Paid Funnel", 0, "SQL · Trial funnel|Conditional counts", "SQL · Data & Finance", "Slack|Zoom"],
  [8050, "plan-migration-paths", "Plan Migration Paths", 1, "SQL · LAG transitions|Tier compare", "SQL · Data & Finance", "Atlassian|Notion"],
  [8051, "mrr-waterfall", "MRR Movement Waterfall", 2, "SQL · LAG waterfall|Movement classify", "SQL · Data & Finance", "Stripe|Salesforce"],
  [8052, "net-revenue-retention", "Net Revenue Retention", 1, "SQL · Cohort revenue|NRR", "SQL · Data & Finance", "Snowflake|Datadog"],
  [8053, "ltv-cac-payback", "LTV, CAC & Payback", 1, "SQL · Unit economics|Ratio ladder", "SQL · Data & Finance", "HubSpot|Canva"],
  [8054, "winback-recovery", "Winback Recovery", 2, "SQL · Winback window|Recovery rate", "SQL · Data & Finance", "Spotify|Duolingo"],
  // MARKETING & ATTRIBUTION — ROAS, first/last touch, email funnel, multi-touch, pacing, channel LTV
  [8055, "roas-by-campaign", "ROAS by Campaign", 0, "SQL · ROAS|Outer join guard", "SQL · Data & Finance", "Google|Amazon"],
  [8056, "first-last-touch-attribution", "First & Last Touch Attribution", 0, "SQL · FIRST_VALUE|Lookback window", "SQL · Data & Finance", "HubSpot|Mailchimp"],
  [8057, "email-engagement-funnel", "Email Engagement Funnel", 1, "SQL · Funnel pivot|Step rates", "SQL · Data & Finance", "Klaviyo|Shopify"],
  [8058, "linear-multi-touch", "Linear Multi-Touch Credit", 1, "SQL · Fractional credit|Window split", "SQL · Data & Finance", "Amazon|eBay"],
  [8059, "budget-pacing", "Budget Pacing Breach", 1, "SQL · Running sum|First breach", "SQL · Data & Finance", "Meta|TikTok"],
  [8060, "channel-ltv-vs-cac", "Channel 90-Day LTV vs CAC", 2, "SQL · Personal clock|Trailing revenue", "SQL · Data & Finance", "Shopify|Instacart"],
  // WAREHOUSE CRAFT — dedupe, DQ sweep, SCD2 as-of, SCD2 build, late data, snapshot deltas
  [8061, "keep-latest-dedupe", "Keep-Latest Dedupe", 0, "SQL · ROW_NUMBER dedupe|Tiebreak", "SQL · Data & Finance", "Uber|Airbnb"],
  [8062, "null-blank-audit", "Null & Blank Audit", 0, "SQL · Data quality|Conditional SUM", "SQL · Data & Finance", "Netflix|Spotify"],
  [8063, "point-in-time-asof", "Point-in-Time As-Of Join", 1, "SQL · SCD2 as-of|Half-open interval", "SQL · Data & Finance", "Airbnb|DoorDash"],
  [8064, "scd2-build", "Build SCD Type 2", 2, "SQL · LEAD validity|SCD2", "SQL · Data & Finance", "Shopify|Lyft"],
  [8065, "late-arriving-restatement", "Late-Arriving Restatement", 2, "SQL · Watermark|Restatement", "SQL · Data & Finance", "Snowflake|Databricks"],
  [8066, "snapshot-delta-detect", "Snapshot Delta Detection", 1, "SQL · FULL OUTER JOIN|CDC compare", "SQL · Data & Finance", "Stripe|Adyen"],
  // RETAIL & RFM — basket depth, repeat rate, RFM quintiles, weeks of supply, returns, revenue cohorts
  [8067, "basket-depth-aov", "Basket Depth & AOV", 0, "SQL · Basket metrics|Join agg", "SQL · Data & Finance", "Walmart|Target"],
  [8068, "repeat-purchase-rate", "Repeat Purchase Rate", 0, "SQL · Repeat rate|HAVING bucket", "SQL · Data & Finance", "Starbucks|Chipotle"],
  [8069, "rfm-segmentation", "RFM Segmentation", 1, "SQL · NTILE quintiles|Segment CASE", "SQL · Data & Finance", "Sephora|Nike"],
  [8070, "weeks-of-supply", "Weeks of Supply", 1, "SQL · Trailing rate|Division guard", "SQL · Data & Finance", "Home Depot|Best Buy"],
  [8071, "returns-rate-by-category", "Returns Rate by Category", 0, "SQL · LEFT JOIN rate|Category rollup", "SQL · Data & Finance", "Zappos|Gap"],
  [8072, "cohort-repeat-revenue", "Cohort Repeat Revenue", 2, "SQL · Revenue cohorts|Offset months", "SQL · Data & Finance", "Chewy|Warby Parker"],
];
