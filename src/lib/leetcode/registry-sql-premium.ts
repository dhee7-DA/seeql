// Registry rows — the SQL band, batch 5: the LeetCode PREMIUM tier (35
// problems), re-authored with original schemas/seeds/statements. `free: 0`
// flags them with the amber "premium" badge in the LeetCode view; the "SQL
// Premium" list keeps the /^SQL/ band flag while marking provenance. Same
// tuple format as registry-sql50.ts.
import type { LcRow } from "./row";

export const SQL_PREMIUM: LcRow[] = [
  // PREMIUM WARMUPS — ratios, distinct counting, triplet joins, dedupes
  [597, "friend-requests-i-overall-acceptance-rate", "Friend Requests I: Overall Acceptance Rate", 0, "SQL · Ratio|DISTINCT", "SQL Premium", "LeetCode Premium", 0],
  [1939, "users-that-actively-request-confirmation-messages", "Users That Actively Request Confirmation Messages", 0, "SQL · Date math|HAVING", "SQL Premium", "LeetCode Premium", 0],
  [2072, "the-winner-university", "The Winner University", 0, "SQL · CASE WHEN|DISTINCT", "SQL Premium", "LeetCode Premium", 0],
  [1623, "all-valid-triplets-that-can-represent-a-country", "All Valid Triplets That Can Represent a Country", 0, "SQL · Multi-join|Self-join", "SQL Premium", "LeetCode Premium", 0],
  [1677, "products-worth-over-invoices", "Product's Worth Over Invoices", 0, "SQL · Aggregation|Joins", "SQL Premium", "LeetCode Premium", 0],
  [2668, "find-latest-salaries", "Find Latest Salaries", 0, "SQL · Dedupe|MAX id", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM FRIEND GRAPHS — two-sided ledgers, intersections, recommendations
  [602, "friend-requests-ii-who-has-the-most-friends", "Friend Requests II: Who Has the Most Friends", 1, "SQL · UNION ALL|Aggregation", "SQL Premium", "LeetCode Premium", 0],
  [1949, "strong-friendship", "Strong Friendship", 1, "SQL · Self-join|Graph", "SQL Premium", "LeetCode Premium", 0],
  [1951, "all-the-pairs-with-the-maximum-number-of-common-followers", "All the Pairs With the Maximum Number of Common Followers", 1, "SQL · Pair keys|Argmax", "SQL Premium", "LeetCode Premium", 0],
  [1892, "page-recommendations-ii", "Page Recommendations II", 2, "SQL · Anti-join|Graph", "SQL Premium", "LeetCode Premium", 0],
  [2112, "the-airport-with-the-most-flights", "The Airport With the Most Flights", 1, "SQL · UNION ALL|Argmax", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM MEDIA & CONTENT — rates, recency cutoffs, keyword matching
  [578, "get-highest-answer-rate-question", "Get Highest Answer Rate Question", 1, "SQL · Ratio|Conditional agg", "SQL Premium", "LeetCode Premium", 0],
  [1098, "unpopular-books", "Unpopular Books", 1, "SQL · Anti-join|Subqueries", "SQL Premium", "LeetCode Premium", 0],
  [1495, "friendly-movies-streamed-last-month", "Friendly Movies Streamed Last Month", 1, "SQL · LIKE|Date filter", "SQL Premium", "LeetCode Premium", 0],
  [1532, "the-most-recent-three-orders", "The Most Recent Three Orders", 1, "SQL · Windows|Argmax", "SQL Premium", "LeetCode Premium", 0],
  [2199, "finding-the-topic-of-each-post", "Finding the Topic of Each Post", 2, "SQL · LIKE|UNION ALL", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM TIME WINDOWS — intervals, per-day argmax, year expansion
  [1747, "leetflex-banned-accounts", "Leetflex Banned Accounts", 1, "SQL · Intervals|Self-join", "SQL Premium", "LeetCode Premium", 0],
  [1831, "maximum-transaction-each-day", "Maximum Transaction Each Day", 1, "SQL · Windows|Argmax", "SQL Premium", "LeetCode Premium", 0],
  [2228, "users-with-two-purchases-within-seven-days", "Users With Two Purchases Within Seven Days", 1, "SQL · Date math|Self-join", "SQL Premium", "LeetCode Premium", 0],
  [1384, "total-sales-amount-by-year", "Total Sales Amount by Year", 2, "SQL · Recursive CTE|Intervals", "SQL Premium", "LeetCode Premium", 0],
  [2314, "the-first-day-of-the-maximum-recorded-temperature-in-each-city", "The First Day of the Maximum Recorded Temperature in Each City", 2, "SQL · Windows|Argmax", "SQL Premium", "LeetCode Premium", 0],
  [1972, "first-and-last-call-on-the-same-day", "First and Last Call On the Same Day", 2, "SQL · MIN/MAX|Join-back", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM LEDGERS & MONEY — full-population reports, running totals, windows
  [1555, "bank-account-summary", "Bank Account Summary", 1, "SQL · LEFT JOIN|COALESCE", "SQL Premium", "LeetCode Premium", 0],
  [1841, "league-statistics", "League Statistics", 1, "SQL · UNION ALL|Conditional agg", "SQL Premium", "LeetCode Premium", 0],
  [2066, "account-balance", "Account Balance", 1, "SQL · Running totals|Windows", "SQL Premium", "LeetCode Premium", 0],
  [2394, "employees-with-deductions", "Employees With Deductions", 1, "SQL · COUNT DISTINCT|HAVING", "SQL Premium", "LeetCode Premium", 0],
  [2362, "generate-the-invoice", "Generate the Invoice", 2, "SQL · Argmax|Ties", "SQL Premium", "LeetCode Premium", 0],
  [1843, "suspicious-bank-account-transactions", "Suspicious Bank Account Transactions", 2, "SQL · Sliding window|Self-join", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM HARD FINALES — the premium endgame tier
  [262, "trips-and-users", "Trips and Users", 2, "SQL · Joins|Conditional agg", "SQL Premium", "LeetCode Premium", 0],
  [569, "median-employee-salary", "Median Employee Salary", 2, "SQL · Windows|Median", "SQL Premium", "LeetCode Premium", 0],
  [571, "find-the-median", "Find the Median", 2, "SQL · ROW_NUMBER|Median", "SQL Premium", "LeetCode Premium", 0],
  [1412, "find-the-quiet-students-in-all-exams", "Find the Quiet Students in All Exams", 2, "SQL · Anti-join|Group min/max", "SQL Premium", "LeetCode Premium", 0],
  [618, "students-report-by-geography", "Students Report By Geography", 2, "SQL · Pivot|ROW_NUMBER", "SQL Premium", "LeetCode Premium", 0],
  [2494, "merge-overlapping-events-in-the-same-hall", "Merge Overlapping Events in the Same Hall", 2, "SQL · Gaps & islands|Dates", "SQL Premium", "LeetCode Premium", 0],
  [3156, "employee-task-duration-and-concurrent-tasks", "Employee Task Duration and Concurrent Tasks", 2, "SQL · Intervals|Concurrency", "SQL Premium", "LeetCode Premium", 0],
];
