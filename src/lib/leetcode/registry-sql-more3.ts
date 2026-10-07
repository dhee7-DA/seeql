// Registry rows — the SQL band, batch 4 ("beyond 100"): the remaining famous
// free LeetCode Database problems plus a third tier of platform classics
// (HackerRank and DataLemur-flavored, re-authored; custom 95xx+ ids, not LC
// ids). Same tuple format as registry-sql50.ts; lists "SQL 50+" flags them
// into the sandbox-graded SQL band.
import type { LcRow } from "./row";

export const SQL_MORE3: LcRow[] = [
  // SELECT & VALIDATION II — filters, pattern gates, classified joins
  [1757, "recyclable-and-low-fat-products", "Recyclable and Low-Fat Products", 0, "SQL · Filter|WHERE", "SQL 50+", "Amazon|Google"],
  [1517, "find-users-with-valid-e-mails", "Find Users With Valid E-Mails", 0, "SQL · Pattern match|GLOB", "SQL 50+", "Google|Meta"],
  [1294, "weather-type-in-each-country", "Weather Type in Each Country", 0, "SQL · CASE WHEN|Joins", "SQL 50+", "Amazon|eBay"],
  [1355, "activity-participants", "Activity Participants", 0, "SQL · HAVING|ROUND", "SQL 50+", "Facebook|Google"],
  [1565, "unique-orders-and-customers-per-month", "Unique Orders and Customers per Month", 0, "SQL · Aggregation|DISTINCT", "SQL 50+", "Adobe|Walmart"],
  [1581, "customer-who-visited-but-did-not-transact", "Customer Who Visited but Did Not Transact", 0, "SQL · Anti-join|Aggregation", "SQL 50+", "Meta|Booking"],
  // ENGAGEMENT & REPORTING — date windows, rates, argmax
  [1141, "user-activity-for-the-past-30-days-i", "User Activity for the Past 30 Days I", 1, "SQL · Date filter|DISTINCT", "SQL 50+", "Meta|Google"],
  [1132, "reported-posts-ii", "Reported Posts II", 1, "SQL · Ratio|Joins", "SQL 50+", "Meta|Reddit"],
  [1322, "ads-performance", "Ads Performance", 1, "SQL · Ratio|NULLIF", "SQL 50+", "Google|Adobe"],
  [1126, "active-businesses", "Active Businesses", 1, "SQL · Windows|Group average", "SQL 50+", "Amazon|Yelp"],
  [1112, "highest-grade-for-each-student", "Highest Grade for Each Student", 1, "SQL · Argmax|Windows", "SQL 50+", "Google|Udemy"],
  // JOINS & MATCHUPS — tournaments, pairings, pivots
  [1212, "team-scores-in-football-tournament", "Team Scores in Football Tournament", 1, "SQL · UNION ALL|CASE WHEN", "SQL 50+", "eBay|DraftKings"],
  [1445, "apples-and-oranges", "Apples & Oranges", 1, "SQL · Self-join|CASE WHEN", "SQL 50+", "Amazon|Walmart"],
  [1596, "most-frequently-ordered-product-per-customer", "Most Frequently Ordered Product per Customer", 1, "SQL · Argmax|Windows", "SQL 50+", "Amazon|Instacart"],
  [1511, "customer-order-frequency", "Customer Order Frequency", 1, "SQL · HAVING|Conditional agg", "SQL 50+", "Walmart|Shopify"],
  [1479, "sales-by-day-of-the-week", "Sales by Day of the Week", 1, "SQL · Pivot|strftime", "SQL 50+", "Amazon|Starbucks"],
  // STREAKS & RECENCY — gaps and islands, second-most, run detection
  [1205, "monthly-transactions-ii", "Monthly Transactions II", 1, "SQL · UNION ALL|Date grain", "SQL 50+", "PayPal|Stripe"],
  [1709, "biggest-window-between-events", "Biggest Window Between Events", 1, "SQL · LEAD|Date math", "SQL 50+", "Google|Booking"],
  [1127, "user-purchase-platform", "User Purchase Platform", 2, "SQL · Streaks|Windows", "SQL 50+", "Meta|Uber"],
  [1225, "report-contiguous-dates", "Report Contiguous Dates", 2, "SQL · Gaps & islands|ROW_NUMBER", "SQL 50+", "Amazon|Meta"],
  [1369, "second-most-recent-activity", "Second Most Recent Activity", 2, "SQL · RANK|Argmax", "SQL 50+", "Google|Netflix"],
  // HARD FINALES — zero-filled bins, deduped averages, always-full reports
  [1336, "transactions-per-visit-histogram", "Transactions per Visit Histogram", 2, "SQL · Zero-fill|Recursive CTE", "SQL 50+", "Amazon|Google"],
  [1501, "countries-you-can-safely-invest-in", "Countries You Can Safely Invest In", 2, "SQL · Ratio|Dedup", "SQL 50+", "Goldman|JPMorgan"],
  [1907, "count-salary-categories", "Count Salary Categories", 2, "SQL · UNION ALL|Zero buckets", "SQL 50+", "Amazon|Microsoft"],
  // HACKERRANK CLASSICS III — the famous join set (re-authored)
  [9515, "the-report", "The Report", 1, "SQL · Non-equi join|CASE WHEN", "SQL 50+", "HackerRank classic"],
  [9516, "top-competitors", "Top Competitors", 1, "SQL · 4-table join|HAVING", "SQL 50+", "HackerRank classic"],
  [9517, "the-pads", "The PADS", 1, "SQL · String building|UNION ALL", "SQL 50+", "HackerRank classic"],
  [9518, "placements", "Placements", 1, "SQL · Bridge table|Self-join", "SQL 50+", "HackerRank classic"],
  [9519, "symmetric-pairs", "Symmetric Pairs", 1, "SQL · EXISTS|Canonicalization", "SQL 50+", "HackerRank classic"],
  [9520, "fifteen-days-of-learning", "15 Days of Learning", 2, "SQL · Streaks|Per-day argmax", "SQL 50+", "HackerRank classic"],
  // DATALEMUR INTERVIEW SETS II — real interview questions, re-authored
  [9521, "card-launch-success", "Card Launch Success", 1, "SQL · Ratio|strftime", "SQL 50+", "DataLemur classic"],
  [9522, "ads-funnel", "Ads Funnel", 1, "SQL · Funnel|Conditional agg", "SQL 50+", "DataLemur classic"],
  [9523, "spend-histogram", "Spend Histogram", 1, "SQL · Buckets|Running sum", "SQL 50+", "DataLemur classic"],
  [9524, "second-day-confirmation", "Second Day Confirmation", 1, "SQL · LEAD|Timestamps", "SQL 50+", "DataLemur classic"],
  [9525, "same-day-sale", "Same-Day Sale", 1, "SQL · First-occurrence|Self-join", "SQL 50+", "DataLemur classic"],
];
