// Registry rows — the SQL band, batch 9: LeetCode PREMIUM tier V (35
// problems, LC ids 3060-3415 — the FINAL tranche of the premium long-tail
// per Task 66-a's by-ID live reconciliation). Re-authored with original
// schemas/seeds/statements. `free: 0` flags them with the amber "premium"
// badge; the "SQL Premium" list keeps the /^SQL/ band flag. Same tuple
// format as registry-sql-premium4.ts.
import type { LcRow } from "./row";

export const SQL_PREMIUM5: LcRow[] = [
  // PREMIUM TRENDS & BURSTS — hashtag tokenizers, burst gates, session bounds
  [3087, "find-trending-hashtags", "Find Trending Hashtags", 1, "SQL · Tokenizer|Top-3 rank", "SQL Premium", "LeetCode Premium", 0],
  [3103, "find-trending-hashtags-ii", "Find Trending Hashtags II", 2, "SQL · DISTINCT authors|Recursive split", "SQL Premium", "LeetCode Premium", 0],
  [3089, "find-bursty-behavior", "Find Bursty Behavior", 1, "SQL · Peak vs average|Gate rule", "SQL Premium", "LeetCode Premium", 0],
  [3060, "user-activities-within-time-bounds", "User Activities Within Time Bounds", 2, "SQL · Range containment|User match", "SQL Premium", "LeetCode Premium", 0],
  [3118, "friday-purchase-iii", "Friday Purchase III", 1, "SQL · Month buckets|Weekday filter", "SQL Premium", "LeetCode Premium", 0],
  [3415, "find-products-with-three-consecutive-digits", "Find Products With Three Consecutive Digits", 0, "SQL · GLOB classes|Digit runs", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM SYSTEM OPS — durations, spans, fee ceilings, day arithmetic
  [3124, "find-longest-calls", "Find Longest Calls", 1, "SQL · Argmax|Zero ties", "SQL Premium", "LeetCode Premium", 0],
  [3126, "server-utilization-time", "Server Utilization Time", 1, "SQL · Span vs sum|strftime seconds", "SQL Premium", "LeetCode Premium", 0],
  [3140, "consecutive-available-seats-ii", "Consecutive Available Seats II", 1, "SQL · Islands|Best run per seat", "SQL Premium", "LeetCode Premium", 0],
  [3166, "calculate-parking-fees-and-duration", "Calculate Parking Fees and Duration", 1, "SQL · CEIL billing|Part-hour", "SQL Premium", "LeetCode Premium", 0],
  [3172, "second-day-verification", "Second Day Verification", 0, "SQL · Date+1 join|Month boundary", "SQL Premium", "LeetCode Premium", 0],
  [3150, "invalid-tweets-ii", "Invalid Tweets II", 0, "SQL · NULL/trim/length arms", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM LEAGUE TABLES — unpivoted standings, concat lists, per-dept ranks
  [3246, "premier-league-table-ranking", "Premier League Table Ranking", 0, "SQL · Home/away unpivot|Points", "SQL Premium", "LeetCode Premium", 0],
  [3252, "premier-league-table-ranking-ii", "Premier League Table Ranking II", 1, "SQL · Goal diff|Two-key sort", "SQL Premium", "LeetCode Premium", 0],
  [3322, "premier-league-table-ranking-iii", "Premier League Table Ranking III", 1, "SQL · Full season table|Position", "SQL Premium", "LeetCode Premium", 0],
  [3198, "find-cities-in-each-state", "Find Cities in Each State", 0, "SQL · GROUP_CONCAT|Scan-order sort", "SQL Premium", "LeetCode Premium", 0],
  [3328, "find-cities-in-each-state-ii", "Find Cities in Each State II", 1, "SQL · HAVING gate|Formatted line", "SQL Premium", "LeetCode Premium", 0],
  [3338, "second-highest-salary-ii", "Second Highest Salary II", 1, "SQL · DENSE_RANK=2|NULL passthrough", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM GRAPH ENGINES — recursion, sweep lines, cycles, islands over interleaves
  [3236, "ceo-subordinate-hierarchy", "CEO Subordinate Hierarchy", 2, "SQL · WITH RECURSIVE|Depth levels", "SQL Premium", "LeetCode Premium", 0],
  [3061, "calculate-trapping-rain-water", "Calculate Trapping Rain Water", 2, "SQL · Twin window max|Water level", "SQL Premium", "LeetCode Premium", 0],
  [3204, "bitwise-user-permissions-analysis", "Bitwise User Permissions Analysis", 1, "SQL · SUM DISTINCT = OR|Bit gate", "SQL Premium", "LeetCode Premium", 0],
  [3401, "find-circular-gift-exchange-chains", "Find Circular Gift Exchange Chains", 2, "SQL · Cycle chase|Step bound", "SQL Premium", "LeetCode Premium", 0],
  [3384, "team-dominance-by-pass-success", "Team Dominance by Pass Success", 2, "SQL · Completion ratio|Team base", "SQL Premium", "LeetCode Premium", 0],
  [3390, "longest-team-pass-streak", "Longest Team Pass Streak", 2, "SQL · Interleaved islands|LAG break", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM GROWTH & RATES — YoY lags, tiers, discount rules, rate gates
  [3214, "year-on-year-growth-rate", "Year on Year Growth Rate", 2, "SQL · LAG prior year|Growth pct", "SQL Premium", "LeetCode Premium", 0],
  [3230, "customer-purchasing-behavior-analysis", "Customer Purchasing Behavior Analysis", 1, "SQL · Spend tiers|Boundaries", "SQL Premium", "LeetCode Premium", 0],
  [3293, "calculate-product-final-price", "Calculate Product Final Price", 1, "SQL · Best-rule discount|No-rule base", "SQL Premium", "LeetCode Premium", 0],
  [3308, "find-top-performing-driver", "Find Top Performing Driver", 1, "SQL · Rate gate|LIMIT 1", "SQL Premium", "LeetCode Premium", 0],
  [3278, "find-candidates-for-data-scientist-position-ii", "Find Candidates for Data Scientist Position II", 1, "SQL · Skill count gate|IN list", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM ASSESSMENT FINALES — per-subject maxes, sweep overlaps, capitalizers
  [3182, "find-top-scoring-students", "Find Top Scoring Students", 1, "SQL · Subject pass count|MAX retakes", "SQL Premium", "LeetCode Premium", 0],
  [3188, "find-top-scoring-students-ii", "Find Top Scoring Students II", 2, "SQL · MIN of maxes|All-pass gate", "SQL Premium", "LeetCode Premium", 0],
  [3262, "find-overlapping-shifts", "Find Overlapping Shifts", 1, "SQL · Interval pairs|Strict touch", "SQL Premium", "LeetCode Premium", 0],
  [3268, "find-overlapping-shifts-ii", "Find Overlapping Shifts II", 2, "SQL · Sweep line|END before START", "SQL Premium", "LeetCode Premium", 0],
  [3358, "books-with-null-ratings", "Books With Null Ratings", 0, "SQL · COUNT col vs star|AVG NULL skip", "SQL Premium", "LeetCode Premium", 0],
  [3368, "first-letter-capitalization", "First Letter Capitalization", 2, "SQL · Recursive transform|Parity case", "SQL Premium", "LeetCode Premium", 0],
];
