// Registry rows — the SQL 50+ expansion band: LeetCode's well-known free
// Database problems beyond the study list, plus platform classics (HackerRank
// and DataLemur-flavored, re-authored; custom 95xx numbers, not LC ids).
// Same tuple format as registry-sql50.ts; lists "SQL 50+" flags them into the
// sandbox-graded SQL band.
import type { LcRow } from "./row";

export const SQL_MORE: LcRow[] = [
  // EXTRA — JOINS & RELATIONSHIPS
  [1421, "npv-queries", "NPV Queries", 0, "SQL · Joins", "SQL 50+", "Amazon|Google|Adobe"],
  [1587, "bank-account-summary-ii", "Bank Account Summary II", 0, "SQL · Joins|Aggregation", "SQL 50+", "PayPal|Visa|Amazon"],
  [1699, "number-of-calls-between-two-persons", "Number of Calls Between Two Persons", 1, "SQL · Joins|Aggregation", "SQL 50+", "Meta|LinkedIn|Amazon"],
  [1965, "employees-with-missing-information", "Employees With Missing Information", 0, "SQL · Joins|Anti-join", "SQL 50+", "Amazon|Deloitte|IBM"],
  // EXTRA — AGGREGATION & REPORTING
  [511, "game-play-analysis-i", "Game Play Analysis I", 0, "SQL · Aggregation", "SQL 50+", "Amazon|Tencent|Google"],
  [586, "customer-placing-the-largest-number-of-orders", "Customer Placing the Largest Number of Orders", 0, "SQL · Aggregation|Subquery", "SQL 50+", "Amazon|eBay|Walmart"],
  [619, "biggest-single-number", "Biggest Single Number", 0, "SQL · Aggregation|HAVING", "SQL 50+", "Amazon|Bloomberg"],
  [1050, "actors-and-directors-who-cooperated-at-least-three-times", "Actors and Directors Who Cooperated At Least Three Times", 0, "SQL · Aggregation|HAVING", "SQL 50+", "Netflix|Amazon"],
  [1076, "project-employees-ii", "Project Employees II", 0, "SQL · Aggregation|Subquery", "SQL 50+", "Amazon|Oracle"],
  [1113, "reported-posts", "Reported Posts", 0, "SQL · Aggregation|Date filter", "SQL 50+", "Meta|Reddit"],
  [1693, "daily-leads-and-partners", "Daily Leads and Partners", 0, "SQL · Aggregation|COUNT DISTINCT", "SQL 50+", "Salesforce|HubSpot"],
  [1729, "find-followers-count", "Find Followers Count", 0, "SQL · Aggregation", "SQL 50+", "Meta|Instagram"],
  [1741, "find-total-time-spent-by-each-employee", "Find Total Time Spent by Each Employee", 0, "SQL · Aggregation|Date filter", "SQL 50+", "Deloitte|Accenture"],
  [2082, "number-of-rich-customers", "Number of Rich Customers", 0, "SQL · Aggregation|COUNT DISTINCT", "SQL 50+", "Stripe|Visa"],
  // EXTRA — DATES & TIMES
  [1193, "monthly-transactions-i", "Monthly Transactions I", 1, "SQL · Date filter|CASE WHEN", "SQL 50+", "Stripe|PayPal|Revolut"],
  [1543, "fix-product-name-format", "Fix Product Name Format", 0, "SQL · Strings|Date filter", "SQL 50+", "Amazon|Shopify"],
  [1890, "the-latest-login-in-2020", "The Latest Login in 2020", 0, "SQL · Date filter|Aggregation", "SQL 50+", "Meta|Google"],
  // EXTRA — PIVOTS & HIERARCHIES
  [1179, "reformat-department-table", "Reformat Department Table", 0, "SQL · Pivot|CASE WHEN", "SQL 50+", "Netflix|Amazon"],
  [1795, "rearrange-products-table", "Rearrange Products Table", 0, "SQL · Pivot|UNION", "SQL 50+", "Walmart|Target"],
  [1270, "all-people-report-to-the-given-manager", "All People Report to the Given Manager", 1, "SQL · Recursive CTE|Hierarchy", "SQL 50+", "Amazon|Meta|LinkedIn"],
  // EXTRA — STRINGS & CASE
  [1683, "invalid-tweets", "Invalid Tweets", 0, "SQL · Strings", "SQL 50+", "Twitter|Meta"],
  [1873, "calculate-special-bonus", "Calculate Special Bonus", 0, "SQL · CASE WHEN", "SQL 50+", "Amazon|Deloitte"],
  [627, "swap-salary", "Swap Salary", 0, "SQL · UPDATE|CASE WHEN", "SQL 50+", "Amazon|Bloomberg"],
  // PLATFORM CLASSICS (HackerRank / DataLemur-flavored, re-authored)
  [9501, "top-earners", "Top Earners", 0, "SQL · Aggregation", "SQL 50+", "HackerRank classic"],
  [9502, "station-median", "Median of the Station Latitudes", 1, "SQL · Percentile|Windows", "SQL 50+", "HackerRank classic"],
  [9503, "company-hierarchy-counts", "Company Hierarchy Counts", 1, "SQL · Multi-join", "SQL 50+", "HackerRank classic"],
  [9504, "ratings-histogram", "Average Review Ratings Histogram", 0, "SQL · Aggregation|CASE WHEN", "SQL 50+", "DataLemur classic"],
  [9505, "top-five-artists", "Top Five Artists by Streams", 0, "SQL · Aggregation|ORDER BY", "SQL 50+", "DataLemur classic"],
];
